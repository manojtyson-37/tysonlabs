import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { bootstrap, mkReview, GoogleError } from './helpers';
import { authenticate, AuthedClient } from '@/reviews-service/apikeys';
import { bearer } from './helpers';
import { completeConsent, createConnectSession, linkLocation, startConsent } from '@/reviews-service/service';
import { provisionBusiness } from '@/reviews-service/members';
import { verifyToken } from '@/reviews-service/signed';
import { HANDOFF_PURPOSE, appSession, makeHandoffToken, redeemHandoff } from '@/reviews-service/app-auth';
import { NextRequest } from 'next/server';
import { GET as dashboardCallback } from '@/app/api/auth/google/callback/route';
import { OAUTH_COOKIE, setSignIn, startSignIn, type SignInGateway } from '@/reviews-service/signin';
import { GET, POST } from '@/app/api/dash/[...path]/route';

const NONCE = 'nonce-abcdefghijklmnopqrstuv';
const SECRET = 'test-app-shared-secret-0123456789abcdef';
let ctx: Awaited<ReturnType<typeof bootstrap>>;
let A: { id: string; key: string };
let a: AuthedClient;

const req = (method: string, path: string, email: string | null, body?: unknown, key: string | null = SECRET) =>
  new Request(`https://tysonlabs.test/api/dash/${path}`, {
    method,
    headers: { ...(key ? { 'x-app-key': key } : {}), ...(email ? { 'x-user-email': email } : {}), 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
const call = (method: 'GET' | 'POST', path: string, email: string | null, body?: unknown, key: string | null = SECRET) =>
  (method === 'GET' ? GET : POST)(req(method, path, email, body, key), { params: Promise.resolve({ path: path.split('?')[0].split('/') }) });

beforeAll(async () => {
  process.env.DASHBOARD_SESSION_SECRET = 'test-dashboard-session-secret-0123456789';
  process.env.APP_SHARED_SECRET = SECRET;
  ctx = await bootstrap();
  A = await ctx.mkClient('app-A');
  a = await authenticate(bearer(A.key), 'write');
  process.env.DASHBOARD_CLIENT_ID = A.id;
  process.env.DASHBOARD_ADMIN_EMAILS = 'boss@tysonlabs.in';
  await provisionBusiness(a, { ref: 'shop-one', ownerEmail: 'owner@shop.in' }, 'test');
  await provisionBusiness(a, { ref: 'shop-one', ownerEmail: 'staff@shop.in', role: 'staff' }, 'test');
  await provisionBusiness(a, { ref: 'shop-two', ownerEmail: 'other@shop.in' }, 'test');
});
afterAll(async () => {
  setSignIn(undefined);
  await ctx.o.query('DELETE FROM rate_limits');
  await ctx.o.end();
});

describe('app authentication', () => {
  it('rejects a missing or wrong app key and an email with no access', async () => {
    expect((await call('GET', 'me', 'owner@shop.in', undefined, null)).status).toBe(401);
    expect((await call('GET', 'me', 'owner@shop.in', undefined, `${SECRET}x`)).status).toBe(401);
    expect((await call('GET', 'me', null)).status).toBe(401);
    expect((await call('GET', 'me', 'stranger@x.in')).status).toBe(401);
    await expect(appSession(req('GET', 'me', 'owner@shop.in', undefined, 'short'))).rejects.toBeTruthy();
  });

  it('handoff token is signed by the service, expires, and can be redeemed exactly once', async () => {
    const t = makeHandoffToken('Owner@Shop.in', NONCE);
    expect(verifyToken(t, HANDOFF_PURPOSE, Date.now(), SECRET)).toBeNull(); // the app's shared secret cannot mint or verify it
    expect(verifyToken(t, 'dash-session')).toBeNull();
    expect(verifyToken(t, HANDOFF_PURPOSE, Date.now() + 130_000)).toBeNull();
    expect(await redeemHandoff(`${t}x`, NONCE)).toBeNull();
    expect(await redeemHandoff(t, 'another-browsers-nonce-000000')).toBeNull(); // token opened in a different browser
    expect(await redeemHandoff(t, '')).toBeNull();
    expect(await redeemHandoff(t, NONCE)).toBe('Owner@Shop.in');
    expect(await redeemHandoff(t, NONCE)).toBeNull(); // replay
  });

  it('the redeem endpoint needs the app key and works once', async () => {
    const t = makeHandoffToken('owner@shop.in', NONCE);
    expect((await call('POST', 'handoff', null, { token: t, nonce: NONCE }, null)).status).toBe(401);
    expect((await call('POST', 'handoff', null, { token: t, nonce: 'wrong-nonce-wrong-nonce-00' })).status).toBe(401);
    const first = await call('POST', 'handoff', null, { token: t, nonce: NONCE });
    expect(await first.json()).toEqual({ email: 'owner@shop.in' });
    expect((await call('POST', 'handoff', null, { token: t, nonce: NONCE })).status).toBe(401);
  });
});

describe('dash API access', () => {
  it('lists only the businesses the person belongs to, with their role', async () => {
    const r = await (await call('GET', 'me', 'Owner@Shop.in')).json();
    expect(r.isAdmin).toBe(false);
    expect(r.businesses.map((b: { ref: string }) => b.ref)).toEqual(['shop-one']);
    expect(r.businesses[0].role).toBe('owner');
    expect((await (await call('GET', 'me', 'staff@shop.in')).json()).businesses[0].role).toBe('staff');
  });

  it('an admin sees every business and the admin list', async () => {
    const r = await (await call('GET', 'me', 'boss@tysonlabs.in')).json();
    expect(r.isAdmin).toBe(true);
    expect(r.businesses.map((b: { ref: string }) => b.ref).sort()).toEqual(['shop-one', 'shop-two']);
    const adm = await (await call('GET', 'admin/businesses', 'boss@tysonlabs.in')).json();
    expect(adm.businesses.find((b: { ref: string }) => b.ref === 'shop-one').members).toHaveLength(2);
  });

  it('refuses another business, and admin routes for non-admins', async () => {
    expect((await call('GET', 'b/shop-two/overview', 'owner@shop.in')).status).toBe(403);
    expect((await call('POST', 'b/shop-two/sync', 'owner@shop.in', {})).status).toBe(403);
    expect((await call('GET', 'admin/businesses', 'owner@shop.in')).status).toBe(403);
    expect((await call('POST', 'admin/members', 'owner@shop.in', { ref: 'x-shop', email: 'a@b.in' })).status).toBe(403);
  });

  it('admin can add a member, who then sees that business', async () => {
    expect((await call('POST', 'admin/members', 'boss@tysonlabs.in', { ref: 'shop-three', email: 'New@Shop.in', role: 'owner' })).status).toBe(200);
    expect((await (await call('GET', 'me', 'new@shop.in')).json()).businesses[0].ref).toBe('shop-three');
    expect((await call('POST', 'admin/members', 'boss@tysonlabs.in', { ref: 'Bad Name', email: 'a@b.in' })).status).toBe(400);
  });

  it('staff cannot connect or link Google; unknown routes are 404', async () => {
    expect((await call('POST', 'b/shop-one/connect', 'staff@shop.in', { returnUrl: 'https://app.test/integrations' })).status).toBe(403);
    expect((await call('POST', 'b/shop-one/link', 'staff@shop.in', { locationId: 'LOC1' })).status).toBe(403);
    expect((await call('GET', 'nothing/here', 'owner@shop.in')).status).toBe(404);
  });
});

describe('dash API reviews and replies', () => {
  it('shows reviews, drafts, and posts only after the draft or edited text goes through the safety check', async () => {
    const t = (await ctx.o.query("SELECT id FROM tenants WHERE client_id = $1 AND external_ref = 'shop-one'", [A.id])).rows[0].id;
    const { url } = await createConnectSession(a, { tenantRef: 'shop-one', returnUrl: 'https://app.test/integrations' });
    const state = new URL(await startConsent(url.split('/connect/')[1])).searchParams.get('state')!;
    await completeConsent({ state, code: 'c', error: null });
    await linkLocation(a, 'shop-one', 'LOC1');
    const rv = mkReview('R1', 5, '2026-11-01T10:00:00Z', 'Great');
    await ctx.o.query(
      'INSERT INTO reviews (client_id, tenant_id, google_location_id, google_review_id, reviewer_name, rating, comment, google_create_time, google_update_time) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$8)',
      [A.id, t, 'LOC1', rv.reviewId, 'Pat Q', 5, rv.comment, rv.createTime]);

    const ov = await (await call('GET', 'b/shop-one/overview', 'owner@shop.in')).json();
    expect(ov.summary.total).toBe(1);
    expect(ov.recent).toHaveLength(1);
    const list = await (await call('GET', 'b/shop-one/reviews?filter=unreplied', 'owner@shop.in')).json();
    expect(list.reviews).toHaveLength(1);
    const reviewId = list.reviews[0].id;

    const d = await (await call('POST', 'b/shop-one/drafts', 'staff@shop.in', { reviewId })).json();
    expect(d.draftId).toBeTruthy();
    expect(d.text.length).toBeGreaterThan(10);

    const bad = await call('POST', 'b/shop-one/reply', 'staff@shop.in', { reviewId, draftId: d.draftId, text: 'Call 98765 43210 for your treatment', idempotencyKey: 'idem-key-0001' });
    expect(bad.status).toBeGreaterThanOrEqual(400);
    expect((await bad.json()).error).toBe('UNSAFE_REPLY');

    const good = await call('POST', 'b/shop-one/reply', 'staff@shop.in', { reviewId, draftId: d.draftId, text: d.text, idempotencyKey: 'idem-key-0002' });
    expect(await good.clone().json()).toEqual({ ok: true });
    expect(good.status).toBe(200);
    const row = (await ctx.o.query('SELECT approved_by, status FROM reply_drafts WHERE id = $1', [d.draftId])).rows[0];
    expect(row.approved_by).toBe('staff@shop.in'); // the signed-in person, not anything the app sent
    expect(row.status).toBe('POSTED');

    const conn = await (await call('GET', 'b/shop-one/connection', 'owner@shop.in')).json();
    expect(conn.connected).toBe(true);
    expect(conn.canConnect).toBe(true);
    expect(conn.linked.map((l: { name: string }) => l.name)).toContain('Clinic A');
    expect((await (await call('GET', 'b/shop-one/connection', 'staff@shop.in')).json()).canConnect).toBe(false);
  });

  it('a reply without text or draft is refused', async () => {
    expect((await call('POST', 'b/shop-one/reply', 'staff@shop.in', { reviewId: '00000000-0000-0000-0000-000000000000' })).status).toBe(400);
  });
});

describe('app sign-in handoff through the registered callback', () => {
  const fake = (email: string): SignInGateway => ({
    authUrl: ({ state }) => `https://accounts.test/auth?state=${state}`,
    exchange: async () => ({ email, emailVerified: true }),
  });
  const run = async (email: string, flow: 'app' | undefined) => {
    process.env.APP_BASE_URL = 'https://app.test';
    process.env.GOOGLE_APP_SIGNIN_REDIRECT_URI = 'https://reviews.test/api/auth/google/callback';
    process.env.DASHBOARD_HOST = 'reviews.test';
    setSignIn(fake(email));
    const { url, cookie } = startSignIn(process.env.GOOGLE_APP_SIGNIN_REDIRECT_URI, flow, flow ? NONCE : undefined);
    const state = new URL(url).searchParams.get('state')!;
    return dashboardCallback(new NextRequest(`https://reviews.test/api/auth/google/callback?code=c&state=${state}`, { headers: { host: 'reviews.test', cookie: `${OAUTH_COOKIE}=${cookie}` } }));
  };

  it('a member is sent to the app with a short-lived signed token and no dashboard cookie', async () => {
    const res = await run('owner@shop.in', 'app');
    const loc = new URL(res.headers.get('location')!);
    expect(loc.origin).toBe('https://app.test');
    expect(loc.pathname).toBe('/auth/handoff');
    expect(verifyToken<{ email: string }>(loc.searchParams.get('token'), HANDOFF_PURPOSE)?.email).toBe('owner@shop.in');
    expect(res.headers.get('set-cookie') ?? '').not.toContain('tl_dash=');
  });

  it('a person with no access is sent back to the app login, with no token', async () => {
    const loc = new URL((await run('stranger@x.in', 'app')).headers.get('location')!);
    expect(loc.pathname).toBe('/login');
    expect(loc.searchParams.get('e')).toBe('no_access');
    expect(loc.searchParams.get('token')).toBeNull();
  });

  it('the dashboard flow without the app flag still signs in to the dashboard', async () => {
    const res = await run('owner@shop.in', undefined);
    expect(new URL(res.headers.get('location')!).origin).not.toBe('https://app.test');
    expect(res.headers.get('set-cookie') ?? '').toContain('tl_dash=');
  });
});

describe('dash API business profile and performance', () => {
  it('shows the live listing with the review link to anyone in the business, but only owners can edit', async () => {
    const owner = await (await call('GET', 'b/shop-one/profile', 'owner@shop.in')).json();
    expect(owner.profile.title).toBe('Clinic A');
    expect(owner.profile.reviewLink).toContain('g.page');
    expect(owner.canEdit).toBe(true);
    expect((await (await call('GET', 'b/shop-one/profile', 'staff@shop.in')).json()).canEdit).toBe(false);
    expect((await call('GET', 'b/shop-two/profile', 'owner@shop.in')).status).toBe(403);
  });

  it('staff cannot preview or change the listing', async () => {
    expect((await call('POST', 'b/shop-one/profile-preview', 'staff@shop.in', { changes: { primaryPhone: '+91 90000 00000' } })).status).toBe(403);
    expect((await call('POST', 'b/shop-one/profile', 'staff@shop.in', { changes: { primaryPhone: '+91 90000 00000' } })).status).toBe(403);
  });

  it('preview only validates; saving changes the listing and audits field names, not values', async () => {
    const fake = ctx.fake;
    fake.patches.length = 0;
    const pv = await call('POST', 'b/shop-one/profile-preview', 'owner@shop.in', { changes: { primaryPhone: '+91 90000 11111' } });
    expect(pv.status).toBe(200);
    expect(fake.patches.at(-1)?.validateOnly).toBe(true);
    expect(fake.profile.primaryPhone).not.toBe('+91 90000 11111');
    const save = await call('POST', 'b/shop-one/profile', 'owner@shop.in', { changes: { primaryPhone: '+91 90000 11111', description: 'Open all week' } });
    expect(save.status).toBe(200);
    expect(fake.patches.at(-1)?.validateOnly).toBe(false);
    expect(fake.profile.primaryPhone).toBe('+91 90000 11111');
    const audit = (await ctx.o.query("SELECT entity FROM audit_log WHERE action = 'profile.updated' ORDER BY id DESC LIMIT 1")).rows[0].entity as string;
    expect(audit).toContain('primaryPhone');
    expect(audit).not.toContain('90000');
  });

  it.each([
    [{ primaryPhone: 'call me' }, 'INVALID_PHONE'],
    [{ websiteUri: 'javascript:alert(1)' }, 'INVALID_WEBSITE'],
    [{ description: 'x'.repeat(751) }, 'INVALID_DESCRIPTION'],
    [{ hours: [{ day: 'MONDAY', open: '18:00', close: '09:00' }] }, 'INVALID_HOURS'],
    [{ hours: [{ day: 'FUNDAY', open: '09:00', close: '10:00' }] }, 'INVALID_HOURS'],
    [{ title: 'New name' }, 'NO_CHANGES'],
    [{ hours: [{ day: 'MONDAY', open: '24:00', close: '24:00' }] }, 'INVALID_HOURS'],
  ])('refuses %j', async (changes, code) => {
    const r = await call('POST', 'b/shop-one/profile', 'owner@shop.in', { changes });
    expect(r.status).toBe(400);
    expect((await r.json()).error).toBe(code);
  });

  it('accepts a close time of 24:00 for places open until midnight', async () => {
    const r = await call('POST', 'b/shop-one/profile-preview', 'owner@shop.in', { changes: { hours: [{ day: 'FRIDAY', open: '10:00', close: '24:00' }] } });
    expect(r.status).toBe(200);
  });

  it('returns performance numbers, or a clear not-enabled answer', async () => {
    const ok = await (await call('GET', 'b/shop-one/performance?days=30', 'owner@shop.in')).json();
    expect(ok.available).toBe(true);
    expect(ok.report.totals.views).toBe(120);
    ctx.fake.perfError = new GoogleError('api_not_enabled');
    expect(await (await call('GET', 'b/shop-one/performance', 'owner@shop.in')).json()).toEqual({ available: false, reason: 'NOT_ENABLED' });
    ctx.fake.perfError = null;
  });
});

describe('dash API export and erase (owner only)', () => {
  const OWNER = 'wipe-owner@shop.in', STAFF = 'wipe-staff@shop.in';
  beforeAll(async () => {
    await provisionBusiness(a, { ref: 'wipe-me', ownerEmail: OWNER }, 'test');
    await provisionBusiness(a, { ref: 'wipe-me', ownerEmail: STAFF, role: 'staff' }, 'test');
    await provisionBusiness(a, { ref: 'wipe-keep', ownerEmail: 'keep-owner@shop.in' }, 'test');
    const { url } = await createConnectSession(a, { tenantRef: 'wipe-me', returnUrl: 'https://app.test/integrations' });
    const state = new URL(await startConsent(url.split('/connect/')[1])).searchParams.get('state')!;
    await completeConsent({ state, code: 'c', error: null });
    await ctx.o.query('DELETE FROM rate_limits');
  });

  it('owner downloads an attachment with the data and no tokens, keys or secrets; the download is audited', async () => {
    const r = await call('GET', 'b/wipe-me/export', OWNER);
    expect(r.status).toBe(200);
    expect(r.headers.get('content-disposition')).toMatch(/^attachment; filename="tysonlabs-reviews-wipe-me-\d{4}-\d{2}-\d{2}\.json"$/);
    expect(r.headers.get('cache-control')).toBe('no-store');
    const text = await r.text();
    const data = JSON.parse(text);
    expect(data.tenantRef).toBe('wipe-me');
    expect(Object.keys(data).sort()).toEqual(['auditLog', 'connection', 'exportedAt', 'locations', 'replyDrafts', 'reviews', 'tenantRef']);
    // Every key at every depth is checked, so a reviewer who writes the word "token" in a comment cannot break this and a secret column cannot slip in.
    const keys = new Set<string>();
    const walk = (v: unknown) => { if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) { keys.add(k); walk(x); } };
    walk(data);
    expect([...keys].filter((k) => /token|secret|password|api_?key|ciphertext|wrapped|hash|credential/i.test(k))).toEqual([]);
    expect(Number((await ctx.o.query("SELECT count(*) AS n FROM audit_log WHERE action = 'export.downloaded' AND entity = $1", [OWNER])).rows[0].n)).toBe(1);
  });

  it('staff, strangers and other businesses cannot export; the export is rate limited', async () => {
    expect((await call('GET', 'b/wipe-me/export', STAFF)).status).toBe(403);
    expect((await call('GET', 'b/wipe-me/export', 'owner@shop.in')).status).toBe(403);
    expect((await call('GET', 'b/wipe-me/export', 'boss@tysonlabs.in')).status).toBe(403); // an admin who is not a member of the clinic
    expect((await call('GET', 'b/wipe-me/export', 'nobody@x.in')).status).toBe(401);
    expect((await call('GET', 'b/wipe-me/export', OWNER, undefined, null)).status).toBe(401);
    let last = 200;
    for (let i = 0; i < 6; i++) last = (await call('GET', 'b/wipe-me/export', OWNER)).status;
    expect(last).toBe(429);
    await ctx.o.query('DELETE FROM rate_limits');
  });

  it('staff, other owners and admins who are not members cannot start an erase', async () => {
    for (const who of [STAFF, 'owner@shop.in', 'boss@tysonlabs.in']) {
      expect((await call('POST', 'b/wipe-me/deletion-requests', who, {})).status).toBe(403);
    }
    expect(Number((await ctx.o.query("SELECT count(*) AS n FROM deletion_requests WHERE tenant_id = (SELECT id FROM tenants WHERE external_ref = 'wipe-me')")).rows[0].n)).toBe(0);
  });

  it('erase needs two confirmations with the exact phrase, always erases the owner\'s own business only, and ignores a body action', async () => {
    const t = await call('POST', 'b/wipe-me/deletion-requests', OWNER, { action: 'unlink_location', locationId: 'x' });
    expect(t.status).toBe(200);
    const req = await t.json();
    expect(req.action).toBe('erase_tenant'); // body cannot pick another action
    const id = req.requestId as string;
    const c1 = req.confirmation;
    expect(c1.phrase).toBe('ERASE wipe-me');
    const path = `b/wipe-me/deletion-requests/${id}/confirm`;
    expect((await call('POST', path, STAFF, { step: 1, token: c1.token, phrase: c1.phrase })).status).toBe(403);
    expect((await call('POST', `b/wipe-keep/deletion-requests/${id}/confirm`, 'keep-owner@shop.in', { step: 1, token: c1.token, phrase: c1.phrase })).status).toBe(404); // another business's owner cannot use it
    expect((await call('POST', path, OWNER, { step: 2, token: c1.token, phrase: c1.phrase })).status).toBe(409); // cannot skip step 1
    expect((await call('POST', path, OWNER, { step: 1, token: c1.token, phrase: 'ERASE other' })).status).toBe(403);
    const once = await (await call('POST', path, OWNER, { step: 1, token: c1.token, phrase: c1.phrase })).json();
    expect(once.status).toBe('CONFIRMED_ONCE');
    const exists = async (ref: string) => Number((await ctx.o.query('SELECT count(*) AS n FROM tenants WHERE external_ref = $1', [ref])).rows[0].n);
    expect(await exists('wipe-me')).toBe(1); // still there after one confirmation
    const done = await call('POST', path, OWNER, { step: 2, token: once.confirmation.token, phrase: c1.phrase });
    expect(done.status).toBe(200);
    expect((await done.json()).status).toBe('DONE');
    expect(await exists('wipe-me')).toBe(0);
    expect(await exists('wipe-keep')).toBe(1); // nobody else's data was touched
    const trace = (await ctx.o.query("SELECT actor_ref FROM audit_log WHERE action = 'tenant.erased' AND tenant_id IS NULL ORDER BY id DESC LIMIT 1")).rows[0].actor_ref as string;
    expect(trace).toMatch(/^dash:[0-9a-f]{24}$/); // a hash, never the owner's email
    // The finished request cannot be replayed with the old final secret.
    const replay = await call('POST', path, OWNER, { step: 2, token: once.confirmation.token, phrase: c1.phrase });
    expect([401, 404, 409]).toContain(replay.status);
    expect((await call('GET', 'me', OWNER)).status).toBe(401); // access ends with the business
  });
});

describe('dash API erase safety', () => {
  const O = 'safe-owner@shop.in';
  const tenant = async (ref: string) => Number((await ctx.o.query('SELECT count(*) AS n FROM tenants WHERE external_ref = $1', [ref])).rows[0].n);
  beforeAll(async () => {
    await provisionBusiness(a, { ref: 'safe-one', ownerEmail: O }, 'test');
    await ctx.o.query('DELETE FROM rate_limits');
  });

  it('an expired request is refused with 410 and leaves the business intact', async () => {
    const r = await (await call('POST', 'b/safe-one/deletion-requests', O, {})).json();
    await ctx.o.query("UPDATE deletion_requests SET expires_at = now() - interval '1 minute' WHERE id = $1", [r.requestId]);
    const res = await call('POST', `b/safe-one/deletion-requests/${r.requestId}/confirm`, O, { step: 1, token: r.confirmation.token, phrase: r.confirmation.phrase });
    expect(res.status).toBe(410);
    expect(await tenant('safe-one')).toBe(1);
  });

  it('five wrong guesses cancel the request, and even the right secret afterwards deletes nothing', async () => {
    const r = await (await call('POST', 'b/safe-one/deletion-requests', O, {})).json();
    const path = `b/safe-one/deletion-requests/${r.requestId}/confirm`;
    let last = 0;
    for (let i = 0; i < 5; i++) last = (await call('POST', path, O, { step: 1, token: 'wrong-wrong-wrong-wrong', phrase: r.confirmation.phrase })).status;
    expect(last).toBe(403);
    const after = await call('POST', path, O, { step: 1, token: r.confirmation.token, phrase: r.confirmation.phrase });
    expect(after.status).toBe(409);
    expect(await tenant('safe-one')).toBe(1);
  });
});
