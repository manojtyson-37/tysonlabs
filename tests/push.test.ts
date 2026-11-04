import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { FakePush, bearer, bootstrap, mkReview } from './helpers';
import { authenticate, AuthedClient } from '@/reviews-service/apikeys';
import { completeConsent, createConnectSession, linkLocation, startConsent } from '@/reviews-service/service';
import { provisionBusiness } from '@/reviews-service/members';
import { setPushSender } from '@/reviews-service/push';
import { syncTenant } from '@/reviews-service/reviews';
import { GET, POST } from '@/app/api/dash/[...path]/route';

const SECRET = 'test-app-shared-secret-0123456789abcdef';
let ctx: Awaited<ReturnType<typeof bootstrap>>;
let a: AuthedClient;
let tenantId: string;
const fp = new FakePush();
const ago = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();

const call = (method: 'GET' | 'POST', path: string, email: string | null, body?: unknown) =>
  (method === 'GET' ? GET : POST)(
    new Request(`https://tysonlabs.test/api/dash/${path}`, {
      method,
      headers: { 'x-app-key': SECRET, ...(email ? { 'x-user-email': email } : {}), 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
    { params: Promise.resolve({ path: path.split('/') }) },
  );
const sub = (n: string) => ({ endpoint: `https://fcm.googleapis.com/fcm/send/${n}`, keys: { p256dh: 'BPk' + n, auth: 'au' + n } });
const count = async (email: string) => (await ctx.o.query('SELECT count(*)::int AS n FROM push_subscriptions WHERE email = $1', [email])).rows[0].n as number;

beforeAll(async () => {
  process.env.DASHBOARD_SESSION_SECRET = 'test-dashboard-session-secret-0123456789';
  process.env.APP_SHARED_SECRET = SECRET;
  process.env.VAPID_PUBLIC_KEY = 'test-public';
  process.env.VAPID_PRIVATE_KEY = 'test-private';
  process.env.VAPID_SUBJECT = 'mailto:test@tysonlabs.test';
  ctx = await bootstrap();
  setPushSender(fp.send);
  const c = await ctx.mkClient('push-A');
  process.env.DASHBOARD_CLIENT_ID = c.id;
  a = await authenticate(bearer(c.key), 'write');
  await provisionBusiness(a, { ref: 'shop', ownerEmail: 'owner@shop.in' }, 'test');
  await provisionBusiness(a, { ref: 'shop', ownerEmail: 'staff@shop.in', role: 'staff' }, 'test');
  await provisionBusiness(a, { ref: 'other', ownerEmail: 'other@shop.in' }, 'test');
  const { url } = await createConnectSession(a, { tenantRef: 'shop', returnUrl: 'https://app.test/integrations' });
  const state = new URL(await startConsent(url.split('/connect/')[1])).searchParams.get('state')!;
  await completeConsent({ state, code: 'c', error: null });
  await linkLocation(a, 'shop', 'LOC1');
  tenantId = (await ctx.o.query("SELECT id FROM tenants WHERE external_ref = 'shop'")).rows[0].id;
});
beforeEach(async () => { fp.sent = []; fp.failWith = {}; await ctx.o.query("DELETE FROM rate_limits WHERE bucket LIKE 'push:%'"); });
afterAll(async () => {
  setPushSender(undefined);
  await ctx.o.query('DELETE FROM push_subscriptions');
  await ctx.o.query('DELETE FROM rate_limits');
  await ctx.o.end();
});

describe('push routes', () => {
  it('config returns the public key only, and needs a session', async () => {
    const r = await call('GET', 'push/config', 'owner@shop.in');
    expect(await r.json()).toEqual({ publicKey: 'test-public' });
    expect((await call('GET', 'push/config', 'stranger@x.in')).status).toBe(401);
    delete process.env.VAPID_PRIVATE_KEY;
    expect(await (await call('GET', 'push/config', 'owner@shop.in')).json()).toEqual({ publicKey: null });
    process.env.VAPID_PRIVATE_KEY = 'test-private';
  });

  it('subscribe validates, saves for the session email, and is idempotent', async () => {
    expect((await call('POST', 'push/subscribe', null, sub('a'))).status).toBe(401);
    expect((await call('POST', 'push/subscribe', 'owner@shop.in', { ...sub('a'), endpoint: 'http://fcm.googleapis.com/x' })).status).toBe(400);
    expect((await call('POST', 'push/subscribe', 'owner@shop.in', { ...sub('a'), endpoint: 'https://fcm.googleapis.com/' + 'a'.repeat(2100) })).status).toBe(400);
    expect((await call('POST', 'push/subscribe', 'owner@shop.in', { endpoint: sub('a').endpoint })).status).toBe(400);
    expect((await call('POST', 'push/subscribe', 'owner@shop.in', { ...sub('a'), keys: { p256dh: 'x' } })).status).toBe(400);
    expect((await call('POST', 'push/subscribe', 'Owner@Shop.in', sub('a'))).status).toBe(200);
    expect((await call('POST', 'push/subscribe', 'owner@shop.in', sub('a'))).status).toBe(200);
    expect(await count('owner@shop.in')).toBe(1);
  });

  it.each([
    ['plain http', 'http://fcm.googleapis.com/x'],
    ['credentials', 'https://user:pw@fcm.googleapis.com/x'],
    ['odd port', 'https://fcm.googleapis.com:8443/x'],
    ['ipv4 literal', 'https://169.254.169.254/latest'],
    ['ipv6 literal', 'https://[::1]/x'],
    ['localhost', 'https://localhost/x'],
    ['unlisted host', 'https://push.example.test/x'],
    ['look-alike suffix', 'https://evilfcm.googleapis.com.attacker.test/x'],
    ['bare suffix domain', 'https://push.services.mozilla.com/x'],
    ['not a url', 'fcm.googleapis.com/x'],
  ])('rejects endpoint: %s', async (_n, endpoint) => {
    expect((await call('POST', 'push/subscribe', 'owner@shop.in', { ...sub('bad'), endpoint })).status).toBe(400);
  });

  it('accepts the allowlisted push services', async () => {
    for (const host of ['updates.push.services.mozilla.com', 'x.push.services.mozilla.com', 'wns2.notify.windows.com', 'web.push.apple.com', 'api.push.apple.com'])
      expect((await call('POST', 'push/subscribe', 'staff@shop.in', { ...sub('h'), endpoint: `https://${host}/s/1` })).status).toBe(200);
    await ctx.o.query("DELETE FROM push_subscriptions WHERE endpoint LIKE '%/s/1'");
  });

  it('an endpoint saved by another email is not taken over until the owner unsubscribes', async () => {
    expect((await call('POST', 'push/subscribe', 'staff@shop.in', sub('shared'))).status).toBe(200);
    expect((await call('POST', 'push/subscribe', 'owner@shop.in', { ...sub('shared'), keys: { p256dh: 'evil', auth: 'evil' } })).status).toBe(409);
    expect((await ctx.o.query("SELECT email, p256dh FROM push_subscriptions WHERE endpoint = $1", [sub('shared').endpoint])).rows[0]).toEqual({ email: 'staff@shop.in', p256dh: 'BPkshared' });
    await call('POST', 'push/unsubscribe', 'staff@shop.in', { endpoint: sub('shared').endpoint });
    expect((await call('POST', 'push/subscribe', 'owner@shop.in', sub('shared'))).status).toBe(200);
    await call('POST', 'push/unsubscribe', 'owner@shop.in', { endpoint: sub('shared').endpoint });
  });

  it('caps devices per email', async () => {
    for (let i = 0; i < 9; i++) expect((await call('POST', 'push/subscribe', 'owner@shop.in', sub('cap' + i))).status).toBe(200);
    expect(await count('owner@shop.in')).toBe(10);
    expect((await call('POST', 'push/subscribe', 'owner@shop.in', sub('cap-over'))).status).toBe(409);
    expect((await call('POST', 'push/subscribe', 'owner@shop.in', sub('a'))).status).toBe(200); // re-saving an existing device is fine
    await ctx.o.query("DELETE FROM push_subscriptions WHERE endpoint LIKE '%/cap%'");
  });

  it('unsubscribe deletes only the caller\'s own device', async () => {
    await call('POST', 'push/subscribe', 'staff@shop.in', sub('s1'));
    await call('POST', 'push/unsubscribe', 'owner@shop.in', { endpoint: sub('s1').endpoint });
    expect(await count('staff@shop.in')).toBe(1);
    expect((await call('POST', 'push/unsubscribe', 'staff@shop.in', { endpoint: sub('s1').endpoint })).status).toBe(200);
    expect(await count('staff@shop.in')).toBe(0);
  });
});

describe('push on sync', () => {
  it('sends a fixed payload to members of that business only, and never on first backfill', async () => {
    await call('POST', 'push/subscribe', 'staff@shop.in', sub('s2'));
    await call('POST', 'push/subscribe', 'other@shop.in', sub('o1')); // member of a different business
    ctx.fake.reviews.LOC1 = [mkReview('P1', 5, ago(3), 'Secret text')];
    await syncTenant(a.clientId, tenantId); // first sync: history
    expect(fp.sent).toHaveLength(0);

    ctx.fake.reviews.LOC1 = [mkReview('P2', 4, ago(1), 'Private words', { reviewerName: 'Jane Roe' }), ...ctx.fake.reviews.LOC1];
    await syncTenant(a.clientId, tenantId);
    const to = fp.sent.map((m) => m.endpoint).sort();
    expect(to).toEqual([sub('a').endpoint, sub('s2').endpoint].sort());
    const payload = JSON.parse(fp.sent[0].payload);
    expect(payload).toEqual({ title: 'New review', body: 'Clinic A', url: '/reviews' });
    expect(fp.sent[0].payload).not.toMatch(/Private|Jane|Secret/);
  });

  it('does not push for edits or old reviews', async () => {
    ctx.fake.reviews.LOC1 = ctx.fake.reviews.LOC1.map((r) => (r.reviewId === 'P2' ? { ...r, comment: 'edited', updateTime: ago(0.5) } : r));
    ctx.fake.reviews.LOC1.push(mkReview('OLD', 5, ago(24 * 30)));
    await syncTenant(a.clientId, tenantId);
    expect(fp.sent).toHaveLength(0);
  });

  it('rate limits per business', async () => {
    for (let i = 0; i < 5; i++) {
      ctx.fake.reviews.LOC1 = [mkReview('R' + i, 5, ago(0.1)), ...ctx.fake.reviews.LOC1];
      await syncTenant(a.clientId, tenantId);
    }
    expect(new Set(fp.sent.map((m) => m.endpoint)).size).toBeGreaterThan(0);
    expect(fp.sent.length).toBe(3 * 2); // 3 allowed sends x 2 devices
  });

  it('drops a gone device (410) and survives other failures', async () => {
    fp.failWith[sub('s2').endpoint] = 410;
    fp.failWith[sub('a').endpoint] = 500;
    ctx.fake.reviews.LOC1 = [mkReview('G1', 5, ago(0.05)), ...ctx.fake.reviews.LOC1];
    const r = await syncTenant(a.clientId, tenantId);
    expect(r.outcome).toBe('ok');
    expect(await count('staff@shop.in')).toBe(0);
    expect(await count('owner@shop.in')).toBe(1); // 500 keeps the device
  });

  it('never contacts a stored endpoint that fails the check', async () => {
    await ctx.o.query("INSERT INTO push_subscriptions (email, endpoint, p256dh, auth) VALUES ('staff@shop.in','https://internal.test/x','k','a')");
    ctx.fake.reviews.LOC1 = [mkReview('SSRF', 5, ago(0.02)), ...(ctx.fake.reviews.LOC1 ?? [])];
    await syncTenant(a.clientId, tenantId);
    expect(fp.sent.some((m) => m.endpoint.includes('internal.test'))).toBe(false);
    expect((await ctx.o.query("SELECT 1 FROM push_subscriptions WHERE endpoint = 'https://internal.test/x'")).rowCount).toBe(0);
  });

  it('is a no-op without VAPID keys', async () => {
    await ctx.o.query("DELETE FROM rate_limits WHERE bucket LIKE 'push:%'");
    delete process.env.VAPID_PUBLIC_KEY;
    ctx.fake.reviews.LOC1 = [mkReview('V1', 5, ago(0.01)), ...ctx.fake.reviews.LOC1];
    await syncTenant(a.clientId, tenantId);
    expect(fp.sent).toHaveLength(0);
    process.env.VAPID_PUBLIC_KEY = 'test-public';
  });
});
