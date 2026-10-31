import { randomBytes } from 'node:crypto';
import { AuthedClient } from './apikeys';
import { getDrafter, getGoogle } from './container';
import { rateLimit, unscoped, withScope } from './db';
import { GoogleError } from './google';
import { MAX_REPLY_LENGTH, replySafety, templateReply } from './drafts';
import { ServiceError, accessTokenFor, audit, disconnect, getConnection, resolveTenant } from './service';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// Postgres timestamptz text such as 2026-01-05 00:00:00.123456+00; the raw text keeps microseconds so no row is skipped.
const TS_RE = /^\d{4}-\d\d-\d\d[ T]\d\d:\d\d:\d\d(?:\.\d{1,6})?(?:Z|[+-]\d\d(?::?\d\d)?)$/;
const STALE_POSTING_SECONDS = 120;
const LEASE_MINUTES = 5;
const MAX_PAGES_PER_LOCATION = 20;

// ---------- sync ----------

export type SyncOutcome = 'ok' | 'needs_reauth' | 'google_error' | 'skipped';

/**
 * Pulls reviews for every location linked to the tenant. Safe to run twice at once (a lease on the connection makes the
 * second run skip) and never logs review text. Pages are newest-update first, so it stops once a whole page is unchanged.
 */
export async function syncTenant(clientId: string, tenantId: string): Promise<{ outcome: SyncOutcome; reviewsSeen: number }> {
  const scope = { clientId, tenantId };
  const leased = await withScope(scope, async (db) => {
    const r = await db.query(
      `UPDATE connections SET sync_lock_until = now() + ($2 || ' minutes')::interval, last_attempt_at = now()
       WHERE tenant_id = $1 AND status = 'ACTIVE' AND (sync_lock_until IS NULL OR sync_lock_until < now()) RETURNING 1`,
      [tenantId, String(LEASE_MINUTES)],
    );
    return (r.rowCount ?? 0) > 0;
  });
  if (!leased) return { outcome: 'skipped', reviewsSeen: 0 };

  const runId = await withScope(scope, async (db) => (await db.query('INSERT INTO sync_runs (client_id, tenant_id) VALUES ($1,$2) RETURNING id', [clientId, tenantId])).rows[0].id as string);
  let outcome: SyncOutcome = 'ok';
  let seen = 0;
  try {
    const token = await accessTokenFor({ clientId }, tenantId);
    const links = await withScope(scope, async (db) => (await db.query('SELECT google_account_id, google_location_id FROM location_links WHERE tenant_id = $1', [tenantId])).rows as { google_account_id: string; google_location_id: string }[]);
    for (const link of links) {
      let pageToken: string | undefined;
      for (let page = 0; page < MAX_PAGES_PER_LOCATION; page++) {
        const result = await getGoogle().listReviews(token, link.google_account_id, link.google_location_id, pageToken);
        seen += result.reviews.length;
        const changed = await withScope(scope, async (db) => {
          const ids = result.reviews.map((r) => r.reviewId);
          const known = await db.query('SELECT google_review_id, google_update_time FROM reviews WHERE tenant_id = $1 AND google_review_id = ANY($2)', [tenantId, ids]);
          const have = new Map(known.rows.map((r) => [r.google_review_id as string, new Date(r.google_update_time).getTime()]));
          let n = 0;
          for (const r of result.reviews) {
            if (have.get(r.reviewId) === new Date(r.updateTime).getTime()) continue;
            n++;
            // Write-time rule: the link must still belong to this tenant. Reviews are always keyed by tenant, never by link alone.
            await db.query(
              `INSERT INTO reviews (client_id, tenant_id, google_location_id, google_review_id, reviewer_name, rating, comment, google_create_time, google_update_time, reply_text, reply_time)
               SELECT $1,$2,l.google_location_id,$4,$5,$6,$7,$8,$9,$10,$11 FROM location_links l WHERE l.tenant_id = $2 AND l.google_location_id = $3
               ON CONFLICT (tenant_id, google_review_id) DO UPDATE SET reviewer_name=EXCLUDED.reviewer_name, rating=EXCLUDED.rating, comment=EXCLUDED.comment,
                 google_update_time=EXCLUDED.google_update_time, reply_text=EXCLUDED.reply_text, reply_time=EXCLUDED.reply_time, deleted_at=NULL, updated_at=now()`,
              [clientId, tenantId, link.google_location_id, r.reviewId, r.reviewerName ?? null, r.rating, r.comment ?? null, r.createTime, r.updateTime, r.reply?.comment ?? null, r.reply?.updateTime ?? null],
            );
          }
          return n;
        });
        if (!result.nextPageToken || changed === 0) break;
        pageToken = result.nextPageToken;
      }
    }
  } catch (err) {
    if (err instanceof ServiceError && err.code === 'NEEDS_REAUTH') outcome = 'needs_reauth';
    else outcome = 'google_error';
    if (!(err instanceof ServiceError) && !(err instanceof GoogleError)) console.error('[reviews-service] sync failed', err instanceof Error ? err.name : 'unknown');
  } finally {
    await withScope(scope, async (db) => {
      await db.query('UPDATE sync_runs SET finished_at = now(), outcome = $2, reviews_seen = $3 WHERE id = $1', [runId, outcome, seen]);
      await db.query(
        `UPDATE connections SET sync_lock_until = NULL, last_sync_error = $2, last_synced_at = CASE WHEN $2::text IS NULL THEN now() ELSE last_synced_at END WHERE tenant_id = $1`,
        [tenantId, outcome === 'ok' ? null : outcome],
      );
    }).catch(() => undefined);
  }
  return { outcome, reviewsSeen: seen };
}

export async function syncNow(a: AuthedClient, tenantRef: string) {
  const tenantId = await resolveTenant(a, tenantRef);
  if (!(await rateLimit(`sync:${tenantId}`, 6))) throw new ServiceError(429, 'RATE_LIMITED');
  const c = await getConnection(a, tenantRef);
  if (c.status === 'NEEDS_REAUTH') throw new ServiceError(409, 'NEEDS_REAUTH');
  if (c.status !== 'ACTIVE') throw new ServiceError(409, 'NOT_CONNECTED');
  return syncTenant(a.clientId, tenantId);
}

/** Cron entry: syncs the connections that are due, a few at a time, isolating failures. */
export async function runSyncBatch(limit = 40, concurrency = 4, budgetMs = 240_000) {
  const deadline = Date.now() + budgetMs; // stop starting new tenants well before the function timeout
  const due = await unscoped(async (db) => (await db.query('SELECT client_id, tenant_id FROM cron_due_connections($1)', [limit])).rows as { client_id: string; tenant_id: string }[]);
  const tally: Record<SyncOutcome, number> = { ok: 0, needs_reauth: 0, google_error: 0, skipped: 0 };
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(concurrency, due.length) }, async () => {
      while (next < due.length && Date.now() < deadline) {
        const d = due[next++];
        const r = await syncTenant(d.client_id, d.tenant_id).catch(() => ({ outcome: 'google_error' as SyncOutcome }));
        tally[r.outcome]++;
      }
    }),
  );
  return { due: due.length, attempted: next, ...tally };
}

export async function runPurge() {
  const purged = await unscoped(async (db) => (await db.query('SELECT cron_purge_expired() AS n')).rows[0].n as number);
  return { reviewsPurged: purged };
}

// ---------- reading ----------

const reviewJson = (r: Record<string, unknown>) => ({
  id: r.id, locationId: r.google_location_id, reviewerName: r.reviewer_name, rating: r.rating, comment: r.comment,
  createdAt: r.google_create_time, updatedAt: r.google_update_time, replyText: r.reply_text, repliedAt: r.reply_time,
});

export async function listReviews(a: AuthedClient, tenantRef: string, opts: { cursor?: string | null; limit?: number; locationId?: string | null }) {
  const tenantId = await resolveTenant(a, tenantRef);
  const limit = Math.min(Math.max(Math.floor(opts.limit ?? 25), 1), 100);
  let after: { t: string; id: string } | null = null;
  if (opts.cursor) {
    const [t, id] = Buffer.from(opts.cursor, 'base64url').toString().split('|');
    if (!t || !id || !TS_RE.test(t) || !UUID_RE.test(id)) throw new ServiceError(400, 'INVALID_CURSOR');
    after = { t, id };
  }
  return withScope({ clientId: a.clientId, tenantId }, async (db) => {
    const r = await db.query(
      `SELECT *, google_create_time::text AS create_ts FROM reviews WHERE tenant_id = $1 AND deleted_at IS NULL
         AND ($2::text IS NULL OR google_location_id = $2)
         AND ($3::timestamptz IS NULL OR (google_create_time, id) < ($3::timestamptz, $4::uuid))
       ORDER BY google_create_time DESC, id DESC LIMIT $5`,
      [tenantId, opts.locationId ?? null, after?.t ?? null, after?.id ?? null, limit + 1],
    );
    const rows = r.rows.slice(0, limit);
    const last = rows[rows.length - 1];
    const nextCursor = r.rows.length > limit && last ? Buffer.from(`${last.create_ts}|${last.id}`).toString('base64url') : null;
    return { reviews: rows.map(reviewJson), nextCursor };
  });
}

export async function summary(a: AuthedClient, tenantRef: string) {
  const tenantId = await resolveTenant(a, tenantRef);
  return withScope({ clientId: a.clientId, tenantId }, async (db) => {
    const r = await db.query(
      `SELECT count(*)::int AS total, COALESCE(round(avg(rating)::numeric, 2), 0)::float AS average,
              count(*) FILTER (WHERE reply_text IS NULL)::int AS unreplied,
              count(*) FILTER (WHERE rating = 1)::int AS r1, count(*) FILTER (WHERE rating = 2)::int AS r2, count(*) FILTER (WHERE rating = 3)::int AS r3,
              count(*) FILTER (WHERE rating = 4)::int AS r4, count(*) FILTER (WHERE rating = 5)::int AS r5
       FROM reviews WHERE tenant_id = $1 AND deleted_at IS NULL`,
      [tenantId],
    );
    const x = r.rows[0];
    return { total: x.total as number, average: x.average as number, unreplied: x.unreplied as number, byRating: { 1: x.r1, 2: x.r2, 3: x.r3, 4: x.r4, 5: x.r5 } };
  });
}

// ---------- replies ----------

export async function createDraft(a: AuthedClient, tenantRef: string, reviewId: string) {
  if (!UUID_RE.test(reviewId)) throw new ServiceError(404, 'NOT_FOUND');
  const tenantId = await resolveTenant(a, tenantRef);
  const scope = { clientId: a.clientId, tenantId };
  const review = await withScope(scope, async (db) => (await db.query('SELECT id, rating, comment, reviewer_name, reply_text FROM reviews WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL', [reviewId, tenantId])).rows[0]);
  if (!review) throw new ServiceError(404, 'NOT_FOUND');
  if (!(await rateLimit(`draft:${tenantId}`, 30))) throw new ServiceError(429, 'RATE_LIMITED');

  // Texts used recently for this tenant, so a library draft is not word-for-word the same as a recent reply.
  const recent = new Set(
    (await withScope(scope, (db) => db.query('SELECT text FROM reply_drafts WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT 100', [tenantId]))).rows.map((r) => r.text as string),
  );
  const drafter = getDrafter();
  const isAi = drafter.kind !== 'library';
  let text = '';
  for (let attempt = 0; attempt < (isAi ? 1 : 8); attempt++) {
    try {
      text = (await drafter.generate({ rating: review.rating, comment: review.comment, seed: `${reviewId}:${randomBytes(6).toString('hex')}` })).trim();
    } catch {
      text = ''; // model down or misconfigured: fall back to the generic wording below
    }
    if (text && !recent.has(text)) break;
  }
  // 'ai' only when a real AI model wrote it; library and generic wording are both recorded as 'template'.
  let source: 'ai' | 'template' = isAi ? 'ai' : 'template';
  if (!replySafety(text, { reviewerName: review.reviewer_name }).ok) {
    text = templateReply(review.rating);
    source = 'template';
  }
  return withScope(scope, async (db) => {
    const r = await db.query(
      'INSERT INTO reply_drafts (client_id, tenant_id, review_id, text, source, safety_ok) VALUES ($1,$2,$3,$4,$5,true) RETURNING id',
      [a.clientId, tenantId, reviewId, text, source],
    );
    await audit(db, a, a.clientId, tenantId, 'reply.draft_created', r.rows[0].id);
    return { draftId: r.rows[0].id as string, text, source, requiresApproval: true };
  });
}

export async function postReply(
  a: AuthedClient,
  tenantRef: string,
  reviewId: string,
  input: { draftId?: unknown; text?: unknown; approvedBy?: unknown; idempotencyKey?: string | null; replace?: unknown },
) {
  if (!UUID_RE.test(reviewId)) throw new ServiceError(404, 'NOT_FOUND');
  const approvedBy = typeof input.approvedBy === 'string' ? input.approvedBy.trim() : '';
  if (!approvedBy || approvedBy.length > 200) throw new ServiceError(400, 'APPROVED_BY_REQUIRED');
  const key = input.idempotencyKey ?? '';
  if (key.length < 8 || key.length > 100) throw new ServiceError(400, 'IDEMPOTENCY_KEY_REQUIRED');
  const hasDraft = input.draftId !== undefined;
  const hasText = input.text !== undefined;
  if (hasDraft === hasText) throw new ServiceError(400, 'SEND_DRAFT_ID_OR_TEXT');
  if (hasDraft && (typeof input.draftId !== 'string' || !UUID_RE.test(input.draftId))) throw new ServiceError(400, 'INVALID_DRAFT_ID');
  if (hasText && typeof input.text !== 'string') throw new ServiceError(400, 'INVALID_TEXT'); // null, numbers and objects never reach Google

  const tenantId = await resolveTenant(a, tenantRef);
  const scope = { clientId: a.clientId, tenantId };

  // A post that has been in flight too long (crashed function, timeout) is released so the review is not blocked forever.
  await withScope(scope, (db) =>
    db.query(
      `UPDATE reply_drafts SET status = 'FAILED', idempotency_key = NULL
       WHERE tenant_id = $1 AND review_id = $2 AND status = 'POSTING' AND posting_since < now() - ($3 || ' seconds')::interval`,
      [tenantId, reviewId, String(STALE_POSTING_SECONDS)],
    ),
  );

  // A retry with the same key returns the first result instead of posting twice.
  const prior = await withScope(scope, async (db) => (await db.query('SELECT id, status, review_id FROM reply_drafts WHERE tenant_id = $1 AND idempotency_key = $2', [tenantId, key])).rows[0]);
  if (prior) {
    if (prior.review_id !== reviewId) throw new ServiceError(409, 'IDEMPOTENCY_KEY_REUSED');
    if (prior.status === 'POSTED') return { draftId: prior.id as string, status: 'POSTED' as const, replayed: true };
    if (prior.status === 'POSTING') throw new ServiceError(409, 'IN_PROGRESS');
  }

  const review = await withScope(scope, async (db) => (await db.query('SELECT id, google_location_id, google_review_id, reviewer_name, reply_text FROM reviews WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL', [reviewId, tenantId])).rows[0]);
  if (!review) throw new ServiceError(404, 'NOT_FOUND');
  // Posting replaces any reply already on Google, so overwriting one needs an explicit yes.
  if (review.reply_text && input.replace !== true) throw new ServiceError(409, 'ALREADY_HAS_REPLY');
  const link = await withScope(scope, async (db) => (await db.query('SELECT google_account_id FROM location_links WHERE tenant_id = $1 AND google_location_id = $2', [tenantId, review.google_location_id])).rows[0]);
  if (!link) throw new ServiceError(409, 'LOCATION_NOT_LINKED');

  // Claim the post. The partial unique index allows one live (POSTING/POSTED) reply per review, so concurrent approvals cannot both win.
  let draftId: string;
  let text: string;
  try {
    ({ draftId, text } = await withScope(scope, async (db) => {
      let id: string;
      let body: string;
      if (hasText) {
        body = (input.text as string).trim();
        if (!replySafety(body, { reviewerName: review.reviewer_name }).ok) throw new ServiceError(422, 'UNSAFE_REPLY');
        const ins = await db.query(
          `INSERT INTO reply_drafts (client_id, tenant_id, review_id, text, source, safety_ok) VALUES ($1,$2,$3,$4,'edited',true) RETURNING id`,
          [a.clientId, tenantId, reviewId, body],
        );
        id = ins.rows[0].id;
      } else {
        const d = await db.query("SELECT id, text, safety_ok FROM reply_drafts WHERE id = $1 AND tenant_id = $2 AND review_id = $3 AND status IN ('DRAFT','FAILED')", [input.draftId, tenantId, reviewId]);
        if (!d.rows[0]) throw new ServiceError(404, 'DRAFT_NOT_FOUND');
        id = d.rows[0].id as string;
        body = d.rows[0].text as string;
        // Checked again at approval, not only at creation.
        if (!d.rows[0].safety_ok || !replySafety(body, { reviewerName: review.reviewer_name }).ok) throw new ServiceError(422, 'UNSAFE_REPLY');
      }
      await db.query("UPDATE reply_drafts SET status = 'POSTING', idempotency_key = $2, approved_by = $3, posting_since = now() WHERE id = $1", [id, key, approvedBy]);
      return { draftId: id, text: body };
    }));
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === '23505') throw new ServiceError(409, 'ALREADY_REPLIED_OR_KEY_USED');
    throw err;
  }

  try {
    const token = await accessTokenFor({ clientId: a.clientId }, tenantId);
    await getGoogle().postReply(token, link.google_account_id, review.google_location_id, review.google_review_id, text);
  } catch (err) {
    await withScope(scope, (db) => db.query("UPDATE reply_drafts SET status = 'FAILED', idempotency_key = NULL WHERE id = $1", [draftId])).catch(() => undefined);
    if (err instanceof ServiceError) throw err;
    throw new ServiceError(502, 'GOOGLE_ERROR');
  }
  await withScope(scope, async (db) => {
    await db.query("UPDATE reply_drafts SET status = 'POSTED', posted_at = now() WHERE id = $1", [draftId]);
    await db.query('UPDATE reviews SET reply_text = $2, reply_time = now(), updated_at = now() WHERE id = $1', [reviewId, text]);
  });
  // Audit is best effort and kept out of the status transaction: Google already has the reply, so a failed audit write must
  // not roll the POSTED state back.
  await withScope(scope, (db) => audit(db, a, a.clientId, tenantId, 'reply.posted', draftId)).catch(() => console.error('[reviews-service] audit write failed'));
  return { draftId, status: 'POSTED' as const, replayed: false };
}

// ---------- rights requests ----------

/** Everything we hold for the tenant, minus secrets. */
export async function exportTenant(a: AuthedClient, tenantRef: string) {
  const tenantId = await resolveTenant(a, tenantRef);
  return withScope({ clientId: a.clientId, tenantId }, async (db) => {
    const q = async (sql: string) => (await db.query(sql, [tenantId])).rows;
    return {
      tenantRef,
      exportedAt: new Date().toISOString(),
      connection: (await q('SELECT status, google_email, scope, last_synced_at, created_at, updated_at FROM connections WHERE tenant_id = $1'))[0] ?? null,
      locations: await q('SELECT google_location_id, name, branch_ref, created_at FROM location_links WHERE tenant_id = $1'),
      reviews: await q('SELECT id, google_location_id, reviewer_name, rating, comment, google_create_time, google_update_time, reply_text, reply_time, deleted_at FROM reviews WHERE tenant_id = $1 ORDER BY google_create_time'),
      replyDrafts: await q('SELECT id, review_id, text, source, status, approved_by, created_at, posted_at FROM reply_drafts WHERE tenant_id = $1 ORDER BY created_at'),
      auditLog: await q('SELECT action, entity, actor_type, created_at FROM audit_log WHERE tenant_id = $1 ORDER BY id'),
    };
  });
}

/**
 * Revokes the Google grant, then deletes the tenant and everything under it, including the audit rows that name it.
 * Returns whether Google confirmed the revocation; if not, the clinic should also remove our access in their Google account.
 * Backups roll off on their normal schedule.
 */
export async function eraseTenant(a: AuthedClient, tenantRef: string): Promise<{ googleRevoked: boolean }> {
  const tenantId = await resolveTenant(a, tenantRef);
  const googleRevoked = await disconnect(a, tenantRef); // wipes the stored token whether or not Google answers
  await withScope({ clientId: a.clientId, tenantId }, async (db) => {
    await db.query('SELECT erase_tenant_audit($1)', [tenantId]);
    await db.query('DELETE FROM tenants WHERE id = $1 AND client_id = $2', [tenantId, a.clientId]);
    // The one audit row left carries only the client id and an action, with no tenant reference.
    await db.query("INSERT INTO audit_log (client_id, tenant_id, actor_type, actor_ref, action) VALUES ($1, NULL, 'client', $2, 'tenant.erased')", [a.clientId, a.apiKeyId]);
  });
  return { googleRevoked };
}

export const newIdempotencyKey = () => randomBytes(16).toString('hex');
