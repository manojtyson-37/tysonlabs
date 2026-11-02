import { AuthedClient } from './apikeys';
import { randomToken, safeEqual, sha256 } from './crypto';
import { withScope } from './db';
import { audit, disconnect, resolveTenant, ServiceError, unlinkLocation } from './service';
import { eraseTenant } from './reviews';

/**
 * Hard rule: no deletion on a single call. Every destructive action (erase a tenant, disconnect, unlink a location) is a
 * request that must be confirmed twice, each time with a different one-time secret AND the exact phrase, within 10 minutes.
 *   1. POST   .../deletion-requests              -> what will be deleted, the phrase, secret #1
 *   2. POST   .../deletion-requests/{id}/confirm  { step: 1, token: #1, phrase } -> secret #2
 *   3. POST   .../deletion-requests/{id}/confirm  { step: 2, token: #2, phrase } -> executes
 * The guarantee is against accidents and buggy single calls: a caller that holds a valid write key and follows the steps can still
 * complete them in three requests. A human-held second factor would be needed to stop a stolen key; not built.
 * Anything else about deleting (a future "delete a posted reply") must use this same mechanism.
 */
export type DeletionAction = 'erase_tenant' | 'disconnect' | 'unlink_location';
const TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const MAX_OPEN = 5; // open requests per tenant
const WORDS: Record<DeletionAction, string> = { erase_tenant: 'ERASE', disconnect: 'DISCONNECT', unlink_location: 'UNLINK' };

export async function requestDeletion(a: AuthedClient, tenantRef: string, input: { action?: unknown; locationId?: unknown }) {
  const action = input.action as DeletionAction;
  if (!['erase_tenant', 'disconnect', 'unlink_location'].includes(action)) throw new ServiceError(400, 'INVALID_ACTION');
  const tenantId = await resolveTenant(a, tenantRef);
  const scope = { clientId: a.clientId, tenantId };
  let target: string | null = null;
  if (action === 'unlink_location') {
    if (typeof input.locationId !== 'string' || !input.locationId || input.locationId.length > 100) throw new ServiceError(400, 'LOCATION_ID_REQUIRED');
    target = input.locationId;
  }
  const token = randomToken(32);
  const phrase = `${WORDS[action]} ${target ?? tenantRef}`;
  return withScope(scope, async (db) => {
    const open = Number((await db.query("SELECT count(*) AS n FROM deletion_requests WHERE tenant_id = $1 AND status IN ('PENDING','CONFIRMED_ONCE') AND expires_at > now()", [tenantId])).rows[0].n);
    if (open >= MAX_OPEN) throw new ServiceError(429, 'TOO_MANY_OPEN_REQUESTS');
    const n = async (sql: string, args: unknown[] = [tenantId]) => Number((await db.query(sql, args)).rows[0].n);
    let summary: Record<string, unknown>;
    if (action === 'erase_tenant') {
      summary = {
        action: 'Erase everything we hold for this tenant. This cannot be undone.',
        reviews: await n('SELECT count(*) AS n FROM reviews WHERE tenant_id = $1'),
        replyDrafts: await n('SELECT count(*) AS n FROM reply_drafts WHERE tenant_id = $1'),
        linkedLocations: await n('SELECT count(*) AS n FROM location_links WHERE tenant_id = $1'),
        googleAccessRevoked: true,
        note: 'Replies already posted on Google stay on Google.',
      };
    } else if (action === 'disconnect') {
      summary = {
        action: 'Disconnect Google. The sign-in token is deleted now and Google access is revoked; reviews and drafts are deleted 30 days later.',
        reviews: await n('SELECT count(*) AS n FROM reviews WHERE tenant_id = $1'),
        linkedLocations: await n('SELECT count(*) AS n FROM location_links WHERE tenant_id = $1'),
      };
    } else {
      const loc = await db.query('SELECT name FROM location_links WHERE tenant_id = $1 AND google_location_id = $2', [tenantId, target]);
      if (!loc.rows[0]) throw new ServiceError(404, 'NOT_FOUND');
      summary = { action: 'Unlink this location. Syncing for it stops; reviews already stored are kept until disconnect or erase.', location: loc.rows[0].name };
    }
    const r = await db.query(
      `INSERT INTO deletion_requests (client_id, tenant_id, action, target, phrase, summary, step1_hash, expires_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7, now() + ($8 || ' minutes')::interval) RETURNING id, expires_at`,
      [a.clientId, tenantId, action, target, phrase, JSON.stringify(summary), sha256(token), String(TTL_MINUTES)],
    );
    await audit(db, a, a.clientId, tenantId, 'deletion.requested', `${action}:${r.rows[0].id}`);
    return {
      requestId: r.rows[0].id as string,
      action,
      willDelete: summary,
      confirmation: { step: 1, of: 2, token, phrase, expiresAt: r.rows[0].expires_at as Date, how: 'POST .../confirm with {"step":1,"token":...,"phrase":...}' },
    };
  });
}

export async function confirmDeletion(a: AuthedClient, tenantRef: string, requestId: string, input: { step?: unknown; token?: unknown; phrase?: unknown }) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(requestId)) throw new ServiceError(404, 'NOT_FOUND');
  if (input.step !== 1 && input.step !== 2) throw new ServiceError(400, 'STEP_MUST_BE_1_OR_2');
  const step = input.step as 1 | 2;
  const tenantId = await resolveTenant(a, tenantRef);
  const scope = { clientId: a.clientId, tenantId };
  const req = await withScope(scope, async (db) => (await db.query('SELECT * FROM deletion_requests WHERE id = $1 AND tenant_id = $2', [requestId, tenantId])).rows[0]);
  if (!req) throw new ServiceError(404, 'NOT_FOUND');
  if (req.status === 'DONE' || req.status === 'CANCELLED' || req.status === 'EXECUTING') throw new ServiceError(409, 'REQUEST_CLOSED');
  if (new Date(req.expires_at).getTime() < Date.now()) throw new ServiceError(410, 'REQUEST_EXPIRED');
  const expected: 'PENDING' | 'CONFIRMED_ONCE' = step === 1 ? 'PENDING' : 'CONFIRMED_ONCE';
  if (req.status !== expected) throw new ServiceError(409, step === 2 ? 'CONFIRM_STEP_1_FIRST' : 'ALREADY_CONFIRMED_ONCE');

  const hash = step === 1 ? req.step1_hash : req.step2_hash;
  const ok = typeof input.token === 'string' && typeof input.phrase === 'string' && input.phrase === req.phrase && safeEqual(sha256(input.token), hash);
  if (!ok) {
    const cancelled = await withScope(scope, async (db) => {
      // Guarded by status so a late wrong guess can never overwrite a request that is already executing or done.
      const r = await db.query(
        "UPDATE deletion_requests SET attempts = attempts + 1, status = CASE WHEN attempts + 1 >= $2 THEN 'CANCELLED' ELSE status END WHERE id = $1 AND status IN ('PENDING','CONFIRMED_ONCE') RETURNING status",
        [requestId, MAX_ATTEMPTS],
      );
      return r.rows[0]?.status === 'CANCELLED';
    });
    throw new ServiceError(403, cancelled ? 'REQUEST_CANCELLED_TOO_MANY_ATTEMPTS' : 'INVALID_CONFIRMATION');
  }

  if (step === 1) {
    const token2 = randomToken(32);
    const moved = await withScope(scope, async (db) => {
      const r = await db.query("UPDATE deletion_requests SET status = 'CONFIRMED_ONCE', step2_hash = $2 WHERE id = $1 AND status = 'PENDING' AND expires_at > now()", [requestId, sha256(token2)]);
      if (r.rowCount) await audit(db, a, a.clientId, tenantId, 'deletion.confirmed_once', `${req.action}:${requestId}`);
      return (r.rowCount ?? 0) > 0;
    });
    if (!moved) throw new ServiceError(409, 'ALREADY_CONFIRMED_ONCE');
    return { requestId, status: 'CONFIRMED_ONCE', willDelete: req.summary, confirmation: { step: 2, of: 2, token: token2, phrase: req.phrase, expiresAt: req.expires_at, how: 'FINAL: POST .../confirm with {"step":2,"token":...,"phrase":...}. This deletes.' } };
  }

  // Step 2: claim atomically so two simultaneous calls cannot both execute.
  const claimed = await withScope(scope, async (db) => {
    const r = await db.query("UPDATE deletion_requests SET status = 'EXECUTING' WHERE id = $1 AND status = 'CONFIRMED_ONCE' AND expires_at > now()", [requestId]);
    return (r.rowCount ?? 0) > 0;
  });
  if (!claimed) throw new ServiceError(409, 'REQUEST_CLOSED');
  // Recorded before anything is deleted, so an erase leaves a trace even though the tenant's own rows disappear.
  await withScope(scope, (db) => audit(db, a, a.clientId, tenantId, 'deletion.executing', `${req.action}:${requestId}`)).catch(() => console.error('[reviews-service] audit write failed'));
  try {
    let result: Record<string, unknown> = {};
    if (req.action === 'unlink_location') await unlinkLocation(a, tenantRef, req.target);
    else if (req.action === 'disconnect') result = { googleRevoked: await disconnect(a, tenantRef) };
    else result = await eraseTenant(a, tenantRef);
    // For erase the tenant, and this row with it, no longer exist; for the others record completion.
    await withScope(scope, async (db) => {
      await db.query("UPDATE deletion_requests SET status = 'DONE' WHERE id = $1", [requestId]);
      await audit(db, a, a.clientId, tenantId, 'deletion.executed', `${req.action}:${requestId}`);
    }).catch(() => undefined); // for erase the tenant, and these rows, are already gone; the 'executing' audit row above is the trace
    return { requestId, status: 'DONE', action: req.action, ...result };
  } catch (err) {
    await withScope(scope, (db) => db.query("UPDATE deletion_requests SET status = 'CANCELLED' WHERE id = $1 AND status = 'EXECUTING'", [requestId])).catch(() => undefined);
    throw err;
  }
}
