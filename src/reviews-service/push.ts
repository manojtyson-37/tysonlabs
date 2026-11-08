import webpush from 'web-push';
import { billingActive } from './billing';
import { rateLimit, unscoped, withScope } from './db';

/**
 * Web push for new reviews. The payload is fixed and carries no review text and no reviewer name: the push service sees it, and a
 * lock screen shows it. Everything here is best effort and never throws, so a sync can never fail because of a notification.
 */
export interface PushMessage { endpoint: string; keys: { p256dh: string; auth: string }; payload: string }
export type PushSender = (m: PushMessage) => Promise<void>;

export const MAX_DEVICES_PER_EMAIL = 10;

const PUSH_HOSTS = ['fcm.googleapis.com', 'updates.push.services.mozilla.com', 'web.push.apple.com'];
const PUSH_SUFFIXES = ['.push.services.mozilla.com', '.notify.windows.com', '.push.apple.com'];
/**
 * The server posts to whatever endpoint a browser hands us, so only the real browser push services are allowed (otherwise a
 * subscriber could aim our server at internal addresses). https, no credentials, default port, a named host on the allowlist.
 */
export function isAllowedPushEndpoint(endpoint: string): boolean {
  if (endpoint.length > 2048) return false;
  let u: URL;
  try { u = new URL(endpoint); } catch { return false; }
  if (u.protocol !== 'https:' || u.username || u.password || (u.port && u.port !== '443')) return false;
  const h = u.hostname.toLowerCase();
  return PUSH_HOSTS.includes(h) || PUSH_SUFFIXES.some((x) => h.endsWith(x) && h.length > x.length);
}

export const vapidPublicKey = (): string | null => (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY ? process.env.VAPID_PUBLIC_KEY : null);

const realSender: PushSender = async (m) => {
  await webpush.sendNotification({ endpoint: m.endpoint, keys: m.keys }, m.payload, {
    vapidDetails: { subject: process.env.VAPID_SUBJECT ?? '', publicKey: process.env.VAPID_PUBLIC_KEY ?? '', privateKey: process.env.VAPID_PRIVATE_KEY ?? '' },
    TTL: 6 * 3600, urgency: 'normal', timeout: 8000,
  });
};
let sender: PushSender = realSender;
/** Tests only. */
export function setPushSender(s: PushSender | undefined) { sender = s ?? realSender; }

export async function saveSubscription(email: string, endpoint: string, p256dh: string, auth: string): Promise<'ok' | 'cap' | 'taken'> {
  const r = await unscoped((db) => db.query('SELECT push_save($1,$2,$3,$4,$5) AS result', [email, endpoint, p256dh, auth, MAX_DEVICES_PER_EMAIL]));
  return r.rows[0].result as 'ok' | 'cap' | 'taken';
}

export async function removeSubscription(email: string, endpoint: string): Promise<void> {
  await unscoped((db) => db.query('SELECT push_delete_own($1,$2)', [email, endpoint]));
}

export async function sendNewReviewPush(clientId: string, tenantId: string, count: number): Promise<void> {
  try {
    if (count <= 0 || !vapidPublicKey() || !process.env.VAPID_SUBJECT) return;
    if (!(await billingActive(clientId, tenantId))) return;
    const subs = await unscoped(async (db) => (await db.query('SELECT * FROM push_for_tenant($1,$2)', [clientId, tenantId])).rows as { endpoint: string; p256dh: string; auth: string }[]);
    if (!subs.length) return; // nobody to tell: do not spend a rate limit slot
    // At most a few pushes per business per ten minutes, however many syncs find something.
    if (!(await rateLimit(`push:${tenantId}`, 3, 600))) return;
    const name = await withScope({ clientId, tenantId }, async (db) => (await db.query('SELECT name FROM location_links WHERE tenant_id = $1 ORDER BY name LIMIT 1', [tenantId])).rows[0]?.name as string | undefined);
    const payload = JSON.stringify({ title: 'New review', body: (name ?? 'Your business').slice(0, 120), url: '/reviews' });
    await Promise.all(subs.map(async (s) => {
      try {
        if (!isAllowedPushEndpoint(s.endpoint)) { // stored before the check existed, or tampered with: never contact it
          await unscoped((db) => db.query('SELECT push_drop($1)', [s.endpoint])).catch(() => undefined);
          return;
        }
        await sender({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth }, payload });
        await unscoped((db) => db.query('SELECT push_mark_ok($1)', [s.endpoint]));
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) await unscoped((db) => db.query('SELECT push_drop($1)', [s.endpoint])).catch(() => undefined);
        else console.error('[reviews-service] push failed', status ?? 'unknown'); // status code only: the endpoint is a secret capability URL
      }
    }));
  } catch {
    /* best effort */
  }
}
