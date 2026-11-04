import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { bearer, bootstrap, mkReview } from './helpers';
import { authenticate, AuthedClient } from '@/reviews-service/apikeys';
import { completeConsent, createConnectSession, linkLocation, startConsent } from '@/reviews-service/service';
import { ensureNotifications, handlePush, notifyTokenOk } from '@/reviews-service/notify';
import { POST } from '@/app/api/v1/internal/gbp-notify/route';

const TOKEN = 'notify-token-0123456789-0123456789ab';
let ctx: Awaited<ReturnType<typeof bootstrap>>;
let a: AuthedClient;
const push = (payload: unknown) => ({ message: { data: Buffer.from(JSON.stringify(payload)).toString('base64') } });

beforeAll(async () => {
  process.env.GBP_NOTIFY_TOKEN = TOKEN;
  process.env.GBP_NOTIFY_TOPIC = 'projects/p/topics/t';
  ctx = await bootstrap();
  const c = await ctx.mkClient('notify-A');
  a = await authenticate(bearer(c.key), 'write');
  const { url } = await createConnectSession(a, { tenantRef: 'shop', returnUrl: 'https://app.test/integrations' });
  const state = new URL(await startConsent(url.split('/connect/')[1])).searchParams.get('state')!;
  await completeConsent({ state, code: 'c', error: null });
  await linkLocation(a, 'shop', 'LOC1');
  ctx.fake.reviews.LOC1 = [mkReview('N1', 5, '2026-11-02T10:00:00Z', 'Great')];
});
afterAll(async () => { await ctx.o.query('DELETE FROM rate_limits'); await ctx.o.end(); });

describe('review notifications', () => {
  it('only a request with the secret token is accepted', async () => {
    const req = (t: string) => new Request(`https://x.test/api/v1/internal/gbp-notify${t}`, { method: 'POST', body: '{}' });
    expect(notifyTokenOk(null)).toBe(false);
    expect(notifyTokenOk('short')).toBe(false);
    expect(notifyTokenOk(TOKEN)).toBe(true);
    expect((await POST(req(''))).status).toBe(401);
    expect((await POST(req('?token=wrong'))).status).toBe(401);
    expect((await POST(req(`?token=${TOKEN}`))).status).toBe(200); // junk body is acknowledged, not retried
  });

  it('a new review notification syncs that business', async () => {
    const before = ctx.fake.reviewCalls;
    expect(await handlePush(push({ notificationType: 'NEW_REVIEW', locationName: 'accounts/1/locations/LOC1'.replace('LOC1', '123') }))).toBe('ignored'); // not linked
    const r = await ctx.o.query("UPDATE location_links SET google_location_id = '987654' WHERE google_location_id = 'LOC1' RETURNING 1");
    expect(r.rowCount).toBe(1);
    ctx.fake.reviews['987654'] = ctx.fake.reviews.LOC1;
    expect(await handlePush(push({ notificationType: 'NEW_REVIEW', locationName: 'accounts/1/locations/987654' }))).toBe('synced');
    expect(ctx.fake.reviewCalls).toBeGreaterThan(before);
    const n = (await ctx.o.query("SELECT count(*)::int AS n FROM reviews WHERE google_review_id = 'N1'")).rows[0].n;
    expect(n).toBe(1);
  });

  it.each([
    ['other notification type', { notificationType: 'GOOGLE_UPDATE', locationName: 'accounts/1/locations/987654' }],
    ['bad location name', { notificationType: 'NEW_REVIEW', locationName: '../../etc' }],
  ])('ignores %s', async (_n, p) => { expect(await handlePush(push(p))).toBe('ignored'); });

  it('ignores a malformed envelope', async () => {
    expect(await handlePush(null)).toBe('ignored');
    expect(await handlePush({ message: { data: 'not base64 json' } })).toBe('ignored');
    expect(await handlePush({ message: { data: 123 } })).toBe('ignored');
  });

  it('points the account at the topic when one is configured', async () => {
    const t = (await ctx.o.query("SELECT tenant_id FROM location_links WHERE google_location_id = '987654'")).rows[0].tenant_id as string;
    expect(await ensureNotifications(a.clientId, t)).toBe(true);
    expect(ctx.fake.notificationTopics.at(-1)?.topic).toBe('projects/p/topics/t');
    delete process.env.GBP_NOTIFY_TOPIC;
    expect(await ensureNotifications(a.clientId, t)).toBe(false);
    process.env.GBP_NOTIFY_TOPIC = 'projects/p/topics/t';
  });
});
