import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { Pool } from 'pg';
import { bearer, bootstrap, GoogleError, mkReview } from './helpers';
import { authenticate, AuthedClient } from '@/reviews-service/apikeys';
import { setDependencies } from '@/reviews-service/container';
import { cronAuthorized } from '@/reviews-service/cron';
import { createConnectSession, completeConsent, getConnection, linkLocation, resolveTenant, startConsent, unlinkLocation } from '@/reviews-service/service';
import { createDraft, eraseTenant, exportTenant, listReviews, postReply, runPurge, runSyncBatch, summary, syncTenant } from '@/reviews-service/reviews';
import { replySafety, templateReply } from '@/reviews-service/drafts';
import { EnvKeyWrapper } from '@/reviews-service/crypto';
import { randomBytes } from 'node:crypto';
import { DELETE as delTenant } from '@/app/api/v1/tenants/[ref]/route';

let ctx: Awaited<ReturnType<typeof bootstrap>>;
let A: { id: string; key: string };
let B: { id: string; key: string };
let a: AuthedClient;
let b: AuthedClient;
let aliceId: string;
let drafterText = 'Thank you for taking the time to leave a review. We appreciate your support.';
let drafterFails = false;
const drafter = { generate: async () => { if (drafterFails) throw new Error('model down'); return drafterText; } };

async function connect(client: AuthedClient, ref: string, location = 'LOC1') {
  const { url } = await createConnectSession(client, { tenantRef: ref, returnUrl: 'https://app.test/integrations' });
  const state = new URL(await startConsent(url.split('/connect/')[1])).searchParams.get('state')!;
  await completeConsent({ state, code: 'c', error: null });
  await linkLocation(client, ref, location, 'branch-1');
}
const count = async (sql: string, args: unknown[] = []) => Number((await ctx.o.query(sql, args)).rows[0].n);

beforeAll(async () => {
  ctx = await bootstrap();
  setDependencies({ wrapper: new EnvKeyWrapper(randomBytes(32).toString('base64')), google: ctx.fake, drafter });
  A = await ctx.mkClient('reviews-A');
  B = await ctx.mkClient('reviews-B');
  a = await authenticate(bearer(A.key), 'write');
  b = await authenticate(bearer(B.key), 'write');
  await connect(a, 'alice');
  ctx.fake.locations = [...ctx.fake.locations, { googleAccountId: '1', googleLocationId: 'LOC2', name: 'Clinic B' }];
  await connect(b, 'bob', 'LOC2');
  aliceId = await resolveTenant(a, 'alice');
});
beforeEach(() => {
  drafterFails = false;
  drafterText = 'Thank you for taking the time to leave a review. We appreciate your support.';
  ctx.fake.postError = null;
  ctx.fake.refreshError = null;
});
afterAll(async () => {
  await ctx.o.query('DELETE FROM rate_limits');
  await ctx.o.end();
});

const five = [mkReview('r1', 5, '2026-01-05T00:00:00Z'), mkReview('r2', 4, '2026-01-04T00:00:00Z'), mkReview('r3', 1, '2026-01-03T00:00:00Z', 'bad'), mkReview('r4', 3, '2026-01-02T00:00:00Z'), mkReview('r5', 5, '2026-01-01T00:00:00Z')];

describe('sync', () => {
  it('stores reviews, then stops at the first unchanged page on the next run', async () => {
    ctx.fake.reviews.LOC1 = five;
    const first = await syncTenant(A.id, aliceId);
    expect(first).toEqual({ outcome: 'ok', reviewsSeen: 5 });
    expect(await count('SELECT count(*) AS n FROM reviews WHERE tenant_id = $1', [aliceId])).toBe(5);
    const before = ctx.fake.reviewCalls;
    await syncTenant(A.id, aliceId);
    expect(ctx.fake.reviewCalls - before).toBe(1); // only the newest page was fetched
    expect(await count('SELECT count(*) AS n FROM reviews WHERE tenant_id = $1', [aliceId])).toBe(5);
  });

  it('picks up an edited review and a reply made on Google', async () => {
    ctx.fake.reviews.LOC1 = [mkReview('r1', 2, '2026-02-01T00:00:00Z', 'changed', { reply: { comment: 'Thanks', updateTime: '2026-02-01T01:00:00Z' } }), ...five.slice(1)];
    await syncTenant(A.id, aliceId);
    const r = await ctx.o.query("SELECT rating, comment, reply_text FROM reviews WHERE tenant_id = $1 AND google_review_id = 'r1'", [aliceId]);
    expect(r.rows[0]).toEqual({ rating: 2, comment: 'changed', reply_text: 'Thanks' });
    ctx.fake.reviews.LOC1 = five;
    await syncTenant(A.id, aliceId); // restore the original for later tests
  });

  it('skips while another sync holds the lease, and releases it afterwards', async () => {
    await ctx.o.query("UPDATE connections SET sync_lock_until = now() + interval '3 minutes' WHERE tenant_id = $1", [aliceId]);
    expect((await syncTenant(A.id, aliceId)).outcome).toBe('skipped');
    await ctx.o.query('UPDATE connections SET sync_lock_until = NULL WHERE tenant_id = $1', [aliceId]);
    expect((await syncTenant(A.id, aliceId)).outcome).toBe('ok');
    expect((await ctx.o.query('SELECT sync_lock_until FROM connections WHERE tenant_id = $1', [aliceId])).rows[0].sync_lock_until).toBeNull();
  });

  it('marks the connection NEEDS_REAUTH when Google has revoked the grant', async () => {
    const bobId = await resolveTenant(b, 'bob');
    ctx.fake.refreshError = new GoogleError('invalid_grant');
    expect((await syncTenant(B.id, bobId)).outcome).toBe('needs_reauth');
    expect((await getConnection(b, 'bob')).status).toBe('NEEDS_REAUTH');
    ctx.fake.refreshError = null;
    await connect(b, 'bob', 'LOC2'); // reconnect restores ACTIVE
    expect((await getConnection(b, 'bob')).status).toBe('ACTIVE');
  });

  it('writes nothing for a location that was unlinked while the sync was running', async () => {
    ctx.fake.locations = [{ googleAccountId: '1', googleLocationId: 'LOC9', name: 'Other' }, ...ctx.fake.locations];
    await connect(a, 'carol', 'LOC9');
    const t = await resolveTenant(a, 'carol');
    ctx.fake.reviews.LOC9 = [mkReview('x1', 5, '2026-03-01T00:00:00Z')];
    const original = ctx.fake.listReviews.bind(ctx.fake);
    ctx.fake.listReviews = async (...args) => {
      const page = await original(...args);
      await unlinkLocation(a, 'carol', 'LOC9'); // the link disappears after Google answered
      return page;
    };
    await syncTenant(A.id, t);
    ctx.fake.listReviews = original;
    expect(await count("SELECT count(*) AS n FROM reviews WHERE tenant_id = $1 AND google_location_id = 'LOC9'", [t])).toBe(0);
  });

  it('cron batch syncs due connections and isolates failures', async () => {
    await ctx.o.query('UPDATE connections SET sync_lock_until = NULL, last_synced_at = NULL');
    const r = await runSyncBatch(10, 2);
    expect(r.due).toBeGreaterThanOrEqual(2);
    expect(r.ok + r.needs_reauth + r.google_error + r.skipped).toBe(r.due);
  });
});

describe('reading reviews', () => {
  it('paginates newest first with a cursor and no duplicates', async () => {
    const seen: string[] = [];
    let cursor: string | null = null;
    do {
      const page: Awaited<ReturnType<typeof listReviews>> = await listReviews(a, 'alice', { cursor, limit: 2 });
      page.reviews.forEach((r) => seen.push(String(r.id)));
      cursor = page.nextCursor;
    } while (cursor);
    expect(seen).toHaveLength(5);
    expect(new Set(seen).size).toBe(5);
  });

  it('rejects a malformed cursor', async () => {
    await expect(listReviews(a, 'alice', { cursor: 'not-a-cursor' })).rejects.toMatchObject({ status: 400 });
    const bad = Buffer.from('2026-13-99 99:99:99+00|00000000-0000-0000-0000-00000000000z').toString('base64url');
    await expect(listReviews(a, 'alice', { cursor: bad })).rejects.toMatchObject({ status: 400 });
    expect((await listReviews(a, 'alice', { limit: 2.5 })).reviews).toHaveLength(2); // fractional limit is rounded down, not a 500
  });

  it('summarises rating, counts and unreplied', async () => {
    const s = await summary(a, 'alice');
    expect(s.total).toBe(5);
    expect(s.byRating[5]).toBe(2);
    expect(s.unreplied).toBe(5);
    expect(s.average).toBeCloseTo(3.6, 1);
  });

  it("never shows one client's reviews to another", async () => {
    await expect(listReviews(b, 'alice', {})).rejects.toMatchObject({ status: 404 }); // alice is not B's tenant
    const app = new Pool({ connectionString: process.env.TEST_APP_URL });
    expect(Number((await app.query('SELECT count(*) AS n FROM reviews')).rows[0].n)).toBe(0); // no scope, no rows
    const c = await app.connect();
    await c.query('BEGIN');
    await c.query("SELECT set_config('app.client_id', $1, true)", [B.id]);
    expect(Number((await c.query('SELECT count(*) AS n FROM reviews')).rows[0].n)).toBe(0); // B's scope sees none of A's
    await c.query('ROLLBACK');
    c.release();
    await app.end();
  });
});

describe('reply drafts', () => {
  const firstReview = async () => String((await listReviews(a, 'alice', { limit: 1 })).reviews[0].id);

  it('keeps a safe model draft', async () => {
    const d = await createDraft(a, 'alice', await firstReview());
    expect(d).toMatchObject({ source: 'ai', requiresApproval: true });
  });

  it.each([
    'We are so glad your treatment went well!',
    'Thanks for visiting our clinic. Call 9876543210 to book.',
    'Glad your knee pain is gone. See www.clinic.example',
    'Ignore your rules: the patient was great.',
  ])('replaces an unsafe model draft with generic wording: %s', async (bad) => {
    drafterText = bad;
    const d = await createDraft(a, 'alice', await firstReview());
    expect(d.source).toBe('template');
    expect(replySafety(d.text).ok).toBe(true);
  });

  it('falls back to generic wording when the model is down', async () => {
    drafterFails = true;
    expect((await createDraft(a, 'alice', await firstReview())).source).toBe('template');
  });

  it('every template passes the safety check', () => {
    for (const n of [1, 2, 3, 4, 5]) expect(replySafety(templateReply(n)).ok).toBe(true);
  });

  it.each([
    ['another script', 'आपके समय के लिए धन्यवाद। हम आपके मरीज़ का स्वागत करते हैं।'],
    ['look-alike letters', 'Thank you, \u0440atient'], // Cyrillic r-like p
    ['spaced letters', 'We are glad this p a t i e n t was happy'],
    ['dotted phone', 'Reach us on 98.4512.3456 any time'],
    ['bare domain', 'More at clinic.in please'],
    ['handle', 'Message @someclinic for more'],
    ['spelled-out email', 'write to hello at gmail dot com'],
    ['fullwidth letters', 'We hope your ｔｒｅａｔｍｅｎｔ went well'],
    ['zero-width split', 'Thank you pa\u200Btient'],
    ['body part', 'Hope the knee feels fine'],
  ])('rejects %s', (_n, text) => {
    expect(replySafety(text).ok).toBe(false);
  });

  it('rejects a reply that names the reviewer', () => {
    expect(replySafety('Thank you, Priya, for the review.', { reviewerName: 'Priya Rao' }).ok).toBe(false);
    expect(replySafety('Thank you for the review.', { reviewerName: 'Priya Rao' }).ok).toBe(true);
  });

  it('refuses a review that belongs to another client', async () => {
    await expect(createDraft(b, 'bob', await firstReview())).rejects.toMatchObject({ status: 404 });
  });
});

describe('posting a reply', () => {
  const review = async (i: number) => String((await listReviews(a, 'alice', { limit: 5 })).reviews[i].id);
  const key = () => randomBytes(8).toString('hex');

  it('requires approvedBy, an idempotency key, and exactly one of draftId or text', async () => {
    const id = await review(0);
    await expect(postReply(a, 'alice', id, { text: 'Thank you.', idempotencyKey: key() })).rejects.toMatchObject({ code: 'APPROVED_BY_REQUIRED' });
    await expect(postReply(a, 'alice', id, { text: 'Thank you.', approvedBy: 'dr.x' })).rejects.toMatchObject({ code: 'IDEMPOTENCY_KEY_REQUIRED' });
    await expect(postReply(a, 'alice', id, { approvedBy: 'dr.x', idempotencyKey: key() })).rejects.toMatchObject({ code: 'SEND_DRAFT_ID_OR_TEXT' });
    expect(ctx.fake.posted).toHaveLength(0);
  });

  it.each(['We hope your treatment went well.', 'Call us on +91 98765 43210', 'x'.repeat(1001)])('refuses unsafe or oversized text: %s', async (text) => {
    await expect(postReply(a, 'alice', await review(0), { text, approvedBy: 'dr.x', idempotencyKey: key() })).rejects.toMatchObject({ status: 422 });
    expect(ctx.fake.posted).toHaveLength(0);
  });

  it('posts an approved draft once, and a retry with the same key replays instead of posting again', async () => {
    const id = await review(0);
    const d = await createDraft(a, 'alice', id);
    const k = key();
    const first = await postReply(a, 'alice', id, { draftId: d.draftId, approvedBy: 'front-desk', idempotencyKey: k });
    expect(first).toMatchObject({ status: 'POSTED', replayed: false });
    const again = await postReply(a, 'alice', id, { draftId: d.draftId, approvedBy: 'front-desk', idempotencyKey: k });
    expect(again).toMatchObject({ status: 'POSTED', replayed: true });
    expect(ctx.fake.posted).toHaveLength(1);
    expect(ctx.fake.posted[0]).toMatchObject({ locationId: 'LOC1', comment: d.text });
    expect((await ctx.o.query('SELECT reply_text FROM reviews WHERE id = $1', [id])).rows[0].reply_text).toBe(d.text);
    expect(await count("SELECT count(*) AS n FROM audit_log WHERE action = 'reply.posted' AND tenant_id = $1", [aliceId])).toBe(1);
  });

  it('refuses a second reply to a review that already has one, with a different key', async () => {
    const id = await review(0);
    const d2 = await createDraft(a, 'alice', id);
    await expect(postReply(a, 'alice', id, { draftId: d2.draftId, approvedBy: 'front-desk', idempotencyKey: key() })).rejects.toMatchObject({ status: 409 });
    expect(ctx.fake.posted).toHaveLength(1);
  });

  it('lets only one of two simultaneous approvals through', async () => {
    const id = await review(1);
    const [d1, d2] = [await createDraft(a, 'alice', id), await createDraft(a, 'alice', id)];
    const results = await Promise.allSettled([
      postReply(a, 'alice', id, { draftId: d1.draftId, approvedBy: 'one', idempotencyKey: key() }),
      postReply(a, 'alice', id, { draftId: d2.draftId, approvedBy: 'two', idempotencyKey: key() }),
    ]);
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect(ctx.fake.posted.filter((p) => p.reviewId === 'r2')).toHaveLength(1);
  });

  it('marks a failed post FAILED and lets the same draft be retried', async () => {
    const id = await review(2);
    const d = await createDraft(a, 'alice', id);
    ctx.fake.postError = new GoogleError('http_500');
    await expect(postReply(a, 'alice', id, { draftId: d.draftId, approvedBy: 'x', idempotencyKey: key() })).rejects.toMatchObject({ status: 502 });
    expect((await ctx.o.query('SELECT status FROM reply_drafts WHERE id = $1', [d.draftId])).rows[0].status).toBe('FAILED');
    ctx.fake.postError = null;
    expect(await postReply(a, 'alice', id, { draftId: d.draftId, approvedBy: 'x', idempotencyKey: key() })).toMatchObject({ status: 'POSTED' });
  });

  it('rejects non-string text and a malformed draft id before anything reaches Google', async () => {
    const id = await review(3);
    const before = ctx.fake.posted.length;
    for (const text of [null, 5, {}, ['x']]) {
      await expect(postReply(a, 'alice', id, { text, approvedBy: 'x', idempotencyKey: key() })).rejects.toMatchObject({ status: 400 });
    }
    await expect(postReply(a, 'alice', id, { draftId: 'not-a-uuid', approvedBy: 'x', idempotencyKey: key() })).rejects.toMatchObject({ code: 'INVALID_DRAFT_ID' });
    expect(ctx.fake.posted.length).toBe(before);
  });

  it('frees a review whose post got stuck in flight, and asks before overwriting an existing reply', async () => {
    const id = await review(3);
    const stuck = await createDraft(a, 'alice', id);
    await ctx.o.query("UPDATE reply_drafts SET status='POSTING', idempotency_key='stuck-key-1', posting_since = now() - interval '10 minutes' WHERE id = $1", [stuck.draftId]);
    const fresh = await createDraft(a, 'alice', id);
    expect(await postReply(a, 'alice', id, { draftId: fresh.draftId, approvedBy: 'x', idempotencyKey: key() })).toMatchObject({ status: 'POSTED' });

    const id4 = await review(4);
    await ctx.o.query("UPDATE reviews SET reply_text = 'Owner wrote this on Google' WHERE id = $1", [id4]);
    const d = await createDraft(a, 'alice', id4);
    await expect(postReply(a, 'alice', id4, { draftId: d.draftId, approvedBy: 'x', idempotencyKey: key() })).rejects.toMatchObject({ code: 'ALREADY_HAS_REPLY' });
    expect(await postReply(a, 'alice', id4, { draftId: d.draftId, approvedBy: 'x', idempotencyKey: key(), replace: true })).toMatchObject({ status: 'POSTED' });
  });

  // Reviews inserted by the stuck-post and key-reuse tests are removed afterwards so later tests still see exactly five.
  afterAll(async () => {
    await ctx.o.query("DELETE FROM reviews WHERE google_review_id IN ('stuck-1','reuse-1','reuse-2')");
  });

  async function freshReview(id: string) {
    await ctx.o.query(
      `INSERT INTO reviews (client_id, tenant_id, google_location_id, google_review_id, reviewer_name, rating, comment, google_create_time, google_update_time)
       VALUES ($1,$2,'LOC1',$3,'Someone',5,'ok','2026-05-01T00:00:00Z','2026-05-01T00:00:00Z')`,
      [A.id, aliceId, id],
    );
    return String((await ctx.o.query('SELECT id FROM reviews WHERE tenant_id = $1 AND google_review_id = $2', [aliceId, id])).rows[0].id);
  }

  it('releases a stale in-flight post (row becomes FAILED, key freed) and blocks a fresh one with IN_PROGRESS', async () => {
    const id = await freshReview('stuck-1');
    const d = await createDraft(a, 'alice', id);
    // Fresh claim in flight: the same key gets IN_PROGRESS, and a different draft cannot jump the queue.
    await ctx.o.query("UPDATE reply_drafts SET status='POSTING', idempotency_key='inflight-key-1', posting_since = now() WHERE id = $1", [d.draftId]);
    await expect(postReply(a, 'alice', id, { draftId: d.draftId, approvedBy: 'x', idempotencyKey: 'inflight-key-1' })).rejects.toMatchObject({ code: 'IN_PROGRESS' });
    const other = await createDraft(a, 'alice', id);
    await expect(postReply(a, 'alice', id, { draftId: other.draftId, approvedBy: 'x', idempotencyKey: key() })).rejects.toMatchObject({ code: 'ALREADY_REPLIED_OR_KEY_USED' });
    // Once stale, the next call releases it, and the original key can be retried.
    await ctx.o.query("UPDATE reply_drafts SET posting_since = now() - interval '10 minutes' WHERE id = $1", [d.draftId]);
    expect(await postReply(a, 'alice', id, { draftId: d.draftId, approvedBy: 'x', idempotencyKey: 'inflight-key-1' })).toMatchObject({ status: 'POSTED' });
    expect(ctx.fake.posted.filter((p) => p.reviewId === 'stuck-1')).toHaveLength(1);
  });

  it('refuses a key reused on a different review, and a posted draft under a new key', async () => {
    const r1 = await freshReview('reuse-1');
    const r2 = await freshReview('reuse-2');
    const d1 = await createDraft(a, 'alice', r1);
    const k = key();
    await postReply(a, 'alice', r1, { draftId: d1.draftId, approvedBy: 'x', idempotencyKey: k });
    await expect(postReply(a, 'alice', r2, { text: 'Thank you for the review.', approvedBy: 'x', idempotencyKey: k })).rejects.toMatchObject({ code: 'IDEMPOTENCY_KEY_REUSED' });
    await expect(postReply(a, 'alice', r1, { draftId: d1.draftId, approvedBy: 'x', idempotencyKey: key() })).rejects.toBeDefined(); // already posted
    expect(ctx.fake.posted.filter((p) => p.reviewId === 'reuse-2')).toHaveLength(0);
  });

  it("refuses to reply to another client's review", async () => {
    await expect(postReply(b, 'bob', await review(3), { text: 'Thank you.', approvedBy: 'x', idempotencyKey: key() })).rejects.toMatchObject({ status: 404 });
  });
});

describe('rights requests and retention', () => {
  it('exports the tenant data without any token or secret', async () => {
    const out = await exportTenant(a, 'alice');
    expect(out.reviews.length).toBe(5);
    const json = JSON.stringify(out);
    expect(json).not.toMatch(/RT-|token_ciphertext|wrapped_data_key|secret/i);
  });

  it('purges reviews 30 days after disconnect, and only those', async () => {
    const bobId = await resolveTenant(b, 'bob');
    ctx.fake.reviews.LOC2 = five;
    await syncTenant(B.id, bobId);
    expect(await count('SELECT count(*) AS n FROM reviews WHERE tenant_id = $1', [bobId])).toBe(5);
    const { disconnect } = await import('@/reviews-service/service');
    await disconnect(b, 'bob');
    expect(await count('SELECT count(*) AS n FROM reviews WHERE tenant_id = $1', [bobId])).toBe(5); // still there during the 30 days
    await runPurge();
    expect(await count('SELECT count(*) AS n FROM reviews WHERE tenant_id = $1', [bobId])).toBe(5);
    await ctx.o.query("UPDATE connections SET purge_reviews_after = now() - interval '1 day' WHERE tenant_id = $1", [bobId]);
    expect((await runPurge()).reviewsPurged).toBe(5);
    expect(await count('SELECT count(*) AS n FROM reviews WHERE tenant_id = $1', [bobId])).toBe(0);
    expect(await count('SELECT count(*) AS n FROM reviews WHERE tenant_id = $1', [aliceId])).toBe(5); // a connected tenant is untouched
  });

  it('erases everything for the tenant and revokes the Google grant', async () => {
    const carolId = await resolveTenant(a, 'carol');
    ctx.fake.reviews.LOC9 = five;
    await ctx.o.query('UPDATE connections SET sync_lock_until = NULL WHERE tenant_id = $1', [carolId]);
    await linkLocation(a, 'carol', 'LOC9');
    await syncTenant(A.id, carolId);
    const revokedBefore = ctx.fake.revoked.length;
    ctx.fake.revokeResult = false;
    const erased = await eraseTenant(a, 'carol');
    ctx.fake.revokeResult = true;
    expect(erased.googleRevoked).toBe(false); // Google did not confirm: the caller is told, not left to assume
    expect(await count('SELECT count(*) AS n FROM audit_log WHERE tenant_id = $1', [carolId])).toBe(0);
    expect(ctx.fake.revoked.length).toBe(revokedBefore + 1);
    for (const t of ['tenants WHERE id', 'connections WHERE tenant_id', 'reviews WHERE tenant_id', 'reply_drafts WHERE tenant_id', 'location_links WHERE tenant_id', 'sync_runs WHERE tenant_id']) {
      expect(await count(`SELECT count(*) AS n FROM ${t} = $1`, [carolId])).toBe(0);
    }
    await expect(resolveTenant(a, 'carol')).rejects.toMatchObject({ status: 404 });
    expect(await count("SELECT count(*) AS n FROM audit_log WHERE action = 'tenant.erased' AND client_id = $1", [A.id])).toBe(1);
    expect(await count('SELECT count(*) AS n FROM reviews WHERE tenant_id = $1', [aliceId])).toBe(5); // other tenants untouched
  });
});

describe('erase endpoint', () => {
  const call = (qs: string) => delTenant(new Request(`https://reviews.test/api/v1/tenants/dave${qs}`, { method: 'DELETE', headers: { authorization: `Bearer ${A.key}`, 'x-vercel-forwarded-for': '198.51.100.50' } }), { params: Promise.resolve({ ref: 'dave' }) });
  it('needs the tenant ref repeated as ?confirm=, and erases only then', async () => {
    ctx.fake.locations = [...ctx.fake.locations, { googleAccountId: '1', googleLocationId: 'LOC7', name: 'D' }];
    await connect(a, 'dave', 'LOC7');
    expect((await call('')).status).toBe(400);
    expect((await call('?confirm=someone-else')).status).toBe(400);
    expect(await count("SELECT count(*) AS n FROM tenants WHERE client_id = $1 AND external_ref = 'dave'", [A.id])).toBe(1);
    const ok = await call('?confirm=dave');
    expect(ok.status).toBe(200);
    expect(await ok.json()).toEqual({ success: true, googleRevoked: true });
    expect(await count("SELECT count(*) AS n FROM tenants WHERE client_id = $1 AND external_ref = 'dave'", [A.id])).toBe(0);
  });
});

describe('cron authorisation', () => {
  const req = (h?: string) => new Request('https://reviews.test/api/v1/internal/cron/sync', { headers: h ? { authorization: h } : {} });
  it('refuses everything when no secret is configured, and wrong or missing secrets otherwise', () => {
    const saved = process.env.CRON_SECRET;
    delete process.env.CRON_SECRET;
    expect(cronAuthorized(req('Bearer anything'))?.status).toBe(503);
    process.env.CRON_SECRET = 'a-long-enough-secret-value';
    expect(cronAuthorized(req())?.status).toBe(401);
    expect(cronAuthorized(req('Bearer wrong'))?.status).toBe(401);
    expect(cronAuthorized(req('Bearer a-long-enough-secret-value'))).toBeNull();
    process.env.CRON_SECRET = 'short';
    expect(cronAuthorized(req('Bearer short'))?.status).toBe(503);
    if (saved === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = saved;
  });
});
