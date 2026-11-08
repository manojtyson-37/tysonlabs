import { timingSafeEqual } from 'node:crypto';
import { getGoogle } from './container';
import { rateLimit, unscoped, withScope } from './db';
import { syncTenant } from './reviews';
import { accessTokenFor } from './service';

/**
 * Google Business Profile notifications arrive through a Pub/Sub push subscription. The push URL carries a secret token, which is the
 * only thing that proves a request came from our subscription. A valid push only ever triggers a normal sync of one business, so a
 * forged or replayed message cannot read or change anything.
 */
// The token sits in the push URL, so platform logs can contain it: rotate it now and then. During a rotation the previous value is
// also accepted (GBP_NOTIFY_TOKEN_PREVIOUS), so the subscription can be switched over without downtime.
export const notifyTokenOk = (given: string | null): boolean => {
  if (!given) return false;
  const a = Buffer.from(given);
  let ok = false;
  for (const want of [process.env.GBP_NOTIFY_TOKEN, process.env.GBP_NOTIFY_TOKEN_PREVIOUS]) {
    if (!want || want.length < 32) continue;
    const b = Buffer.from(want);
    if (a.length === b.length && timingSafeEqual(a, b)) ok = true;
  }
  return ok;
};

const LOCATION = /^accounts\/[0-9]+\/locations\/([0-9]+)$/;

/** Returns what was done, for logging counts only. Never throws for a message it cannot use: Pub/Sub would redeliver it forever. */
export async function handlePush(envelope: unknown): Promise<'synced' | 'ignored' | 'busy'> {
  const data = (envelope as { message?: { data?: unknown } } | null)?.message?.data;
  if (typeof data !== 'string' || data.length > 4096) return 'ignored';
  let payload: { notificationType?: unknown; locationName?: unknown };
  try { payload = JSON.parse(Buffer.from(data, 'base64').toString('utf8')); } catch { return 'ignored'; }
  if (payload.notificationType !== 'NEW_REVIEW' && payload.notificationType !== 'UPDATED_REVIEW') return 'ignored';
  const m = typeof payload.locationName === 'string' ? LOCATION.exec(payload.locationName) : null;
  if (!m) return 'ignored';
  // A global cap first (cheap, one row), so a flood of made up location ids cannot grow the limiter table.
  if (!(await rateLimit('notify:all', 600))) return 'busy';
  const row = await unscoped(async (db) => (await db.query('SELECT * FROM notify_lookup_location($1)', [m[1]])).rows[0] as { client_id: string; tenant_id: string } | undefined);
  if (!row) return 'ignored';
  // Busy answers are still acknowledged: the 15 minute cron sync picks up anything a push could not.
  if (!(await rateLimit(`notify:${row.tenant_id}`, 30))) return 'busy';
  const outcome = (await syncTenant(row.client_id, row.tenant_id)).outcome;
  if (outcome === 'subscription_required') return 'ignored'; // acknowledged: the business is not paid up, redelivery would change nothing
  return outcome === 'skipped' ? 'busy' : 'synced';
}

/** Points Google's notifications for the business's account at our topic. Safe to repeat. No-op when no topic is configured. */
export async function ensureNotifications(clientId: string, tenantId: string): Promise<boolean> {
  const topic = process.env.GBP_NOTIFY_TOPIC;
  if (!topic || !/^projects\/[a-z0-9-]+\/topics\/[A-Za-z0-9._~+%-]+$/.test(topic)) return false;
  const link = await withScope({ clientId, tenantId }, async (db) => (await db.query('SELECT google_account_id FROM location_links WHERE tenant_id = $1 LIMIT 1', [tenantId])).rows[0] as { google_account_id: string } | undefined);
  if (!link) return false;
  const token = await accessTokenFor({ clientId }, tenantId);
  await getGoogle().setNotificationSetting(token, link.google_account_id, topic);
  return true;
}
