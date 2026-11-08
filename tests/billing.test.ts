import { createHmac } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { Client, Pool } from 'pg';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { FakePush, bearer, bootstrap, mkReview } from './helpers';
import { authenticate, AuthedClient } from '@/reviews-service/apikeys';
import { billingAllows } from '@/reviews-service/billing';
import { provisionBusiness } from '@/reviews-service/members';
import { setPushSender, saveSubscription, sendNewReviewPush } from '@/reviews-service/push';
import { eraseTenant, postReply, syncNow, syncTenant } from '@/reviews-service/reviews';
import { withScope } from '@/reviews-service/db';
import { completeConsent, createConnectSession, linkLocation, startConsent } from '@/reviews-service/service';
import { GET, POST } from '@/app/api/dash/[...path]/route';
import { POST as WEBHOOK } from '@/app/api/v1/internal/razorpay-webhook/route';

const SECRET = 'test-app-shared-secret-0123456789abcdef';
const WH_SECRET = 'whsec-test-0123456789abcdef';
let ctx: Awaited<ReturnType<typeof bootstrap>>;
let a: AuthedClient;
let tenantId: string;
let clientId: string;
const fp = new FakePush();
const day = 86_400_000;

const call = (method: 'GET' | 'POST', path: string, email: string | null, body?: unknown) =>
  (method === 'GET' ? GET : POST)(
    new Request(`https://tysonlabs.test/api/dash/${path}`, {
      method,
      headers: { 'x-app-key': SECRET, ...(email ? { 'x-user-email': email } : {}), 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
    { params: Promise.resolve({ path: path.split('/') }) },
  );
const sign = (raw: string, secret = WH_SECRET) => createHmac('sha256', secret).update(raw).digest('hex');
let ev = 0;
const hook = (event: string, subId: string, opts: { id?: string; end?: number; signature?: string; raw?: string } = {}) => {
  const raw = opts.raw ?? JSON.stringify({ event, payload: { subscription: { entity: { id: subId, current_end: opts.end } } } });
  return WEBHOOK(new Request('https://reviews.test/api/v1/internal/razorpay-webhook', {
    method: 'POST', body: raw,
    headers: { 'x-razorpay-signature': opts.signature ?? sign(raw), 'x-razorpay-event-id': opts.id ?? `evt_${++ev}`, 'x-forwarded-for': '203.0.113.9' },
  }));
};
const row = async (id = tenantId) => (await ctx.o.query('SELECT * FROM tenant_billing WHERE tenant_id = $1', [id])).rows[0];
const setState = (state: string, extra: { trial?: Date | null; end?: Date | null; since?: Date | null; sub?: string | null } = {}) =>
  ctx.o.query('UPDATE tenant_billing SET state = $2, trial_ends_at = $3, current_period_end = $4, past_due_since = $5, razorpay_subscription_id = $6, cancel_at_period_end = false WHERE tenant_id = $1',
    [tenantId, state, extra.trial ?? null, extra.end ?? null, extra.since ?? null, extra.sub ?? null]);
const view = async (email = 'owner@shop.in') => (await call('GET', 'b/shop/billing', email)).json();

beforeAll(async () => {
  process.env.DASHBOARD_SESSION_SECRET = 'test-dashboard-session-secret-0123456789';
  process.env.APP_SHARED_SECRET = SECRET;
  process.env.DASHBOARD_ADMIN_EMAILS = 'boss@tysonlabs.in';
  process.env.RAZORPAY_WEBHOOK_SECRET = WH_SECRET;
  process.env.VAPID_PUBLIC_KEY = 'test-public';
  process.env.VAPID_PRIVATE_KEY = 'test-private';
  process.env.VAPID_SUBJECT = 'mailto:test@tysonlabs.test';
  ctx = await bootstrap();
  setPushSender(fp.send);
  const c = await ctx.mkClient('billing-A');
  clientId = c.id;
  process.env.DASHBOARD_CLIENT_ID = c.id;
  a = await authenticate(bearer(c.key), 'write');
  await provisionBusiness(a, { ref: 'shop', ownerEmail: 'owner@shop.in' }, 'test');
  await provisionBusiness(a, { ref: 'shop', ownerEmail: 'staff@shop.in', role: 'staff' }, 'test');
  await provisionBusiness(a, { ref: 'other', ownerEmail: 'other@shop.in' }, 'test');
  tenantId = (await ctx.o.query("SELECT id FROM tenants WHERE external_ref = 'shop'")).rows[0].id;
});
beforeEach(async () => {
  await ctx.o.query('DELETE FROM rate_limits');
  ctx.billing.isConfigured = true;
  fp.sent = [];
});
afterAll(async () => {
  setPushSender(undefined);
  await ctx.o.query('DELETE FROM push_subscriptions');
  await ctx.o.query('DELETE FROM rate_limits');
  await ctx.o.end();
});

describe('billingAllows (the gate)', () => {
  const now = new Date('2026-11-10T00:00:00Z');
  const d = (n: number) => new Date(now.getTime() + n * day);
  const ok = (state: string, o: object = {}) => billingAllows({ state, trial_ends_at: null, current_period_end: null, past_due_since: null, ...o } as never, now);
  it('lets pilot and active through always, blocks needs_card, cancelled and paused', () => {
    expect(ok('pilot')).toBe(true);
    expect(ok('active')).toBe(true);
    for (const s of ['needs_card', 'cancelled', 'paused']) expect(ok(s)).toBe(false);
    expect(billingAllows(undefined, now)).toBe(false);
  });
  it('trial ends at its end time; cancel_pending ends with the paid period; past_due has 7 days of grace', () => {
    expect(ok('trial', { trial_ends_at: d(1) })).toBe(true);
    expect(ok('trial', { trial_ends_at: d(-1) })).toBe(false);
    expect(ok('cancel_pending', { current_period_end: d(3) })).toBe(true);
    expect(ok('cancel_pending', { current_period_end: d(-3) })).toBe(false);
    expect(ok('past_due', { past_due_since: d(-6) })).toBe(true);
    expect(ok('past_due', { past_due_since: d(-8) })).toBe(false);
  });
});

describe('new and existing businesses', () => {
  it('a new business is in trial, and the 30 day clock starts when it first connects Google', async () => {
    let r = await row();
    expect(r.state).toBe('trial');
    expect(r.trial_ends_at).toBeNull();
    const { url } = await createConnectSession(a, { tenantRef: 'shop', returnUrl: 'https://app.test/integrations' });
    const state = new URL(await startConsent(url.split('/connect/')[1])).searchParams.get('state')!;
    await completeConsent({ state, code: 'c', error: null });
    await linkLocation(a, 'shop', 'LOC1');
    r = await row();
    const left = (new Date(r.trial_ends_at).getTime() - Date.now()) / day;
    expect(left).toBeGreaterThan(29.9);
    expect(left).toBeLessThan(30.1);
    const v = await view();
    expect(v).toMatchObject({ state: 'trial', priceInr: 799, gstPercent: 18, cancelAtPeriodEnd: false, accessAllowed: true, needsCard: false, checkoutAvailable: true, nextChargeAt: null });
  });

  it('the trial_requires_card setting makes new businesses start in needs_card', async () => {
    expect((await call('POST', 'admin/billing-settings', 'boss@tysonlabs.in', { trialRequiresCard: true })).status).toBe(200);
    await provisionBusiness(a, { ref: 'carded', ownerEmail: 'c@shop.in' }, 'test');
    expect((await ctx.o.query("SELECT b.state FROM tenant_billing b JOIN tenants t ON t.id = b.tenant_id WHERE t.external_ref = 'carded'")).rows[0].state).toBe('needs_card');
    expect((await row()).state).toBe('trial'); // existing businesses are not touched by a settings change
    await call('POST', 'admin/billing-settings', 'boss@tysonlabs.in', { trialRequiresCard: false });
  });

  it('the migration grandfathers every business that already exists as pilot', async () => {
    const base = new URL(process.env.TEST_OWNER_URL!);
    const admin = new Client({ connectionString: `postgres://postgres@${base.host}/postgres` });
    await admin.connect();
    await admin.query('DROP DATABASE IF EXISTS grandfather').catch(() => undefined);
    await admin.query('CREATE DATABASE grandfather');
    await admin.end();
    const g = new Client({ connectionString: `postgres://reviews_owner:owner@${base.host}/grandfather` });
    const su = new Client({ connectionString: `postgres://postgres@${base.host}/grandfather` });
    await su.connect();
    await su.query('GRANT CREATE ON SCHEMA public TO reviews_owner');
    await su.end();
    await g.connect();
    try {
      const files = readdirSync('db/migrations').filter((f) => f.endsWith('.sql')).sort();
      for (const f of files.filter((x) => x < '0009')) await g.query(readFileSync(`db/migrations/${f}`, 'utf8'));
      const c = (await g.query("INSERT INTO clients (name) VALUES ('live') RETURNING id")).rows[0].id;
      await g.query("INSERT INTO tenants (client_id, external_ref) VALUES ($1,'clinic-1'), ($1,'clinic-2')", [c]);
      await g.query(readFileSync('db/migrations/0009_billing.sql', 'utf8'));
      expect((await g.query('SELECT state, trial_ends_at FROM tenant_billing')).rows).toEqual([{ state: 'pilot', trial_ends_at: null }, { state: 'pilot', trial_ends_at: null }]);
      expect((await g.query('SELECT count(*)::int n FROM tenants')).rows[0].n).toBe(2); // nothing else was touched
      await g.query("INSERT INTO tenants (client_id, external_ref) VALUES ($1,'new-one')", [c]);
      expect((await g.query("SELECT b.state FROM tenant_billing b JOIN tenants t ON t.id = b.tenant_id WHERE t.external_ref = 'new-one'")).rows[0].state).toBe('trial');
    } finally {
      await g.end();
      const done = new Client({ connectionString: `postgres://postgres@${base.host}/postgres` });
      await done.connect();
      await done.query('DROP DATABASE IF EXISTS grandfather');
      await done.end();
    }
  });
});

describe('gating', () => {
  beforeAll(async () => {
    ctx.fake.reviews.LOC1 = [mkReview('R1', 5, '2026-11-02T10:00:00Z', 'Great')];
    await setState('trial', { trial: new Date(Date.now() + 10 * day) });
    await syncNow(a, 'shop');
  });
  const reviewId = async () => (await ctx.o.query('SELECT id FROM reviews WHERE tenant_id = $1', [tenantId])).rows[0].id as string;
  const reply = async (n: string) => { await ctx.o.query('DELETE FROM reply_drafts WHERE tenant_id = $1', [tenantId]); return postReply(a, 'shop', await reviewId(), { text: 'Thank you.', approvedBy: 'owner@shop.in', idempotencyKey: `key-${n}-123456`, replace: true }); };
  const blocked: [string, Parameters<typeof setState>[1]][] = [
    ['needs_card', {}],
    ['cancelled', {}],
    ['paused', {}],
    ['trial', { trial: new Date(Date.now() - day) }],
    ['past_due', { since: new Date(Date.now() - 8 * day) }],
  ];

  it.each(blocked)('%s blocks sync, cron sync, replies and push, but not reads or export', async (state, extra) => {
    await setState(state, extra);
    const calls = ctx.fake.reviewCalls;
    const posted = ctx.fake.posted.length;
    await expect(syncNow(a, 'shop')).rejects.toMatchObject({ status: 402, code: 'SUBSCRIPTION_REQUIRED' });
    expect((await syncTenant(clientId, tenantId)).outcome).toBe('subscription_required');
    await expect(reply(state)).rejects.toMatchObject({ status: 402, code: 'SUBSCRIPTION_REQUIRED' });
    expect((await call('POST', 'b/shop/sync', 'owner@shop.in', {})).status).toBe(402);
    expect(ctx.fake.reviewCalls).toBe(calls);
    expect(ctx.fake.posted.length).toBe(posted);
    await saveSubscription('owner@shop.in', 'https://fcm.googleapis.com/fcm/send/gate', 'BPkgate', 'augate');
    await sendNewReviewPush(clientId, tenantId, 1);
    expect(fp.sent).toHaveLength(0);
    expect((await call('GET', 'b/shop/overview', 'owner@shop.in')).status).toBe(200);
    expect((await call('GET', 'b/shop/reviews', 'owner@shop.in')).status).toBe(200);
    expect((await call('GET', 'b/shop/export', 'owner@shop.in')).status).toBe(200);
    expect((await call('POST', 'b/shop/deletion-requests', 'owner@shop.in', {})).status).toBe(200); // erasing stays possible
    const v = await view();
    expect(v.accessAllowed).toBe(false);
    expect(v.needsCard).toBe(state !== 'paused');
  });

  const allowed: [string, Parameters<typeof setState>[1]][] = [
    ['pilot', {}],
    ['active', { end: new Date(Date.now() + 20 * day) }],
    ['trial', { trial: new Date(Date.now() + day) }],
    ['past_due', { since: new Date(Date.now() - 2 * day) }],
    ['cancel_pending', { end: new Date(Date.now() + 5 * day) }],
  ];
  it.each(allowed)('%s lets sync, replies and push through', async (state, extra) => {
    await setState(state, extra);
    await ctx.o.query('DELETE FROM rate_limits');
    expect((await syncNow(a, 'shop')).outcome).toBe('ok');
    const posted = ctx.fake.posted.length;
    await reply(state);
    expect(ctx.fake.posted.length).toBe(posted + 1);
    await sendNewReviewPush(clientId, tenantId, 1);
    expect(fp.sent.length).toBeGreaterThan(0);
    await ctx.o.query("DELETE FROM rate_limits WHERE bucket LIKE 'push:%'");
  });

  it('a trial that runs out blocks at once, and an admin extension reopens it', async () => {
    await setState('trial', { trial: new Date(Date.now() + 1000) });
    await new Promise((r) => setTimeout(r, 1100));
    await expect(syncNow(a, 'shop')).rejects.toMatchObject({ status: 402 });
    const r = await call('POST', 'admin/b/shop/billing', 'boss@tysonlabs.in', { action: 'extend_trial', days: 7 });
    expect(r.status).toBe(200);
    const left = (new Date((await row()).trial_ends_at).getTime() - Date.now()) / day;
    expect(left).toBeGreaterThan(6.9);
    expect(left).toBeLessThan(7.1);
    expect((await syncNow(a, 'shop')).outcome).toBe('ok');
  });
});

describe('owner routes', () => {
  beforeEach(async () => { await setState('trial', { trial: new Date(Date.now() + 10 * day) }); });

  it('subscribe is owner only', async () => {
    for (const email of ['staff@shop.in', 'boss@tysonlabs.in', 'other@shop.in']) expect((await call('POST', 'b/shop/billing/subscribe', email, {})).status).toBe(403);
    expect((await call('POST', 'b/shop/billing/subscribe', null, {})).status).toBe(401);
    expect((await call('POST', 'b/shop/billing/cancel', 'staff@shop.in', {})).status).toBe(403);
    expect((await call('POST', 'b/shop/billing/cancel', 'boss@tysonlabs.in', {})).status).toBe(403);
    expect(ctx.billing.created).toHaveLength(0);
  });
  it('another business billing is not readable', async () => {
    expect((await call('GET', 'b/shop/billing', 'other@shop.in')).status).toBe(403);
    expect((await call('GET', 'b/shop/billing', 'staff@shop.in')).status).toBe(200);
  });

  it('answers 503 BILLING_NOT_CONFIGURED when there are no keys', async () => {
    ctx.billing.isConfigured = false;
    const r = await call('POST', 'b/shop/billing/subscribe', 'owner@shop.in', {});
    expect(r.status).toBe(503);
    expect(await r.json()).toEqual({ error: 'BILLING_NOT_CONFIGURED' });
    expect((await view()).checkoutAvailable).toBe(false);
  });

  it('subscribe creates the subscription, keeps the trial and delays the first charge to its end', async () => {
    const r = await call('POST', 'b/shop/billing/subscribe', 'owner@shop.in', {});
    expect(r.status).toBe(200);
    const out = await r.json();
    expect(out).toEqual({ subscriptionId: expect.stringMatching(/^sub_FAKE/), keyId: 'rzp_test_fake' });
    const last = ctx.billing.created.at(-1)!;
    expect(last.tenantRef).toBe('shop');
    expect(last.startAt).toBeGreaterThan(Date.now() / 1000 + 9 * 86400);
    expect((await row()).razorpay_subscription_id).toBe(out.subscriptionId);
    expect((await row()).state).toBe('trial'); // nothing is paid until the webhook says so
    expect((await view()).nextChargeAt).not.toBeNull();
  });

  it('activation by webhook, then a two step cancel at the end of the cycle', async () => {
    expect((await call('POST', 'b/shop/billing/cancel', 'owner@shop.in', {})).status).toBe(409); // nothing to cancel in a trial
    const sub = (await (await call('POST', 'b/shop/billing/subscribe', 'owner@shop.in', {})).json()).subscriptionId;
    const end = Math.floor(Date.now() / 1000) + 30 * 86400;
    expect(await (await hook('subscription.activated', sub, { end })).json()).toEqual({ result: 'applied' });
    let v = await view();
    expect(v.state).toBe('active');
    expect(new Date(v.nextChargeAt).getTime() / 1000).toBeCloseTo(end, -1);
    const c = await call('POST', 'b/shop/billing/cancel', 'owner@shop.in', {});
    expect(c.status).toBe(200);
    expect(ctx.billing.cancelled.at(-1)).toEqual({ id: sub, atCycleEnd: true });
    v = await view();
    expect(v).toMatchObject({ state: 'cancel_pending', cancelAtPeriodEnd: true, accessAllowed: true });
    expect((await call('POST', 'b/shop/billing/cancel', 'owner@shop.in', {})).status).toBe(200); // repeat is harmless
    expect(ctx.billing.cancelled.filter((x) => x.id === sub)).toHaveLength(1);
    await hook('subscription.charged', sub, { end: end + 30 * 86400 });
    expect((await row()).state).toBe('cancel_pending'); // a late charge does not undo the request
    await hook('subscription.cancelled', sub);
    expect((await view()).state).toBe('cancelled');
  });
});

describe('razorpay webhook', () => {
  let sub: string;
  beforeEach(async () => {
    await setState('trial', { trial: new Date(Date.now() + 10 * day) });
    sub = (await (await call('POST', 'b/shop/billing/subscribe', 'owner@shop.in', {})).json()).subscriptionId;
  });

  it('rejects a bad, missing or wrong-body signature with 401 and changes nothing', async () => {
    expect((await hook('subscription.activated', sub, { signature: 'deadbeef' })).status).toBe(401);
    expect((await hook('subscription.activated', sub, { signature: sign('x', 'another-secret-0123456789') })).status).toBe(401);
    const raw = JSON.stringify({ event: 'subscription.activated', payload: { subscription: { entity: { id: sub } } } });
    expect((await hook('subscription.activated', sub, { raw, signature: sign(raw + ' ') })).status).toBe(401);
    expect((await WEBHOOK(new Request('https://reviews.test/x', { method: 'POST', body: raw }))).status).toBe(401);
    expect((await row()).state).toBe('trial');
  });

  it('is not available without a webhook secret', async () => {
    const keep = process.env.RAZORPAY_WEBHOOK_SECRET;
    delete process.env.RAZORPAY_WEBHOOK_SECRET;
    try { expect((await hook('subscription.activated', sub)).status).toBe(503); } finally { process.env.RAZORPAY_WEBHOOK_SECRET = keep; }
  });

  it('applies an event once; the same event id again changes nothing', async () => {
    expect(await (await hook('subscription.activated', sub, { id: 'evt_same', end: 2_000_000_000 })).json()).toEqual({ result: 'applied' });
    expect((await row()).state).toBe('active');
    await setState('trial', { trial: new Date(Date.now() + day), sub });
    expect(await (await hook('subscription.activated', sub, { id: 'evt_same', end: 2_000_000_000 })).json()).toEqual({ result: 'duplicate' });
    expect((await row()).state).toBe('trial');
    expect((await ctx.o.query("SELECT count(*)::int n FROM billing_events WHERE event_id = 'evt_same'")).rows[0].n).toBe(1);
  });

  it('maps charged, halted, cancelled and completed, and starts the grace clock on halted', async () => {
    await hook('subscription.charged', sub, { end: 2_000_000_000 });
    expect(await row()).toMatchObject({ state: 'active', past_due_since: null });
    expect(new Date((await row()).current_period_end).getTime()).toBe(2_000_000_000_000);
    await hook('subscription.halted', sub);
    const r = await row();
    expect(r.state).toBe('past_due');
    expect(r.past_due_since).not.toBeNull();
    expect((await syncNow(a, 'shop')).outcome).toBe('ok'); // inside the grace period
    const since = r.past_due_since;
    await hook('subscription.halted', sub);
    expect((await row()).past_due_since).toEqual(since); // a repeat does not restart the grace
    await hook('subscription.charged', sub, { end: 2_100_000_000 });
    expect(await row()).toMatchObject({ state: 'active', past_due_since: null });
    await hook('subscription.completed', sub);
    expect((await row()).state).toBe('cancelled');
    await setState('active', { sub });
    await hook('subscription.cancelled', sub);
    expect((await row()).state).toBe('cancelled');
  });

  it('does not override an admin pause, ignores unknown subscriptions and other events', async () => {
    await setState('paused', { sub });
    await hook('subscription.charged', sub, { end: 2_000_000_000 });
    expect((await row()).state).toBe('paused');
    expect(await (await hook('subscription.activated', 'sub_NOSUCH')).json()).toEqual({ result: 'unknown' });
    expect(await (await hook('payment.captured', sub)).json()).toEqual({ result: 'ignored' });
    expect(await (await hook('subscription.activated', sub, { raw: 'not json' })).json()).toEqual({ result: 'ignored' });
  });

  it('is rate limited per IP', async () => {
    let last = 200;
    for (let i = 0; i < 305 && last !== 429; i++) last = (await hook('payment.captured', sub)).status;
    expect(last).toBe(429);
  });
});

describe('admin routes', () => {
  it('settings are admin only and validated', async () => {
    for (const email of ['owner@shop.in', 'staff@shop.in']) {
      expect((await call('GET', 'admin/billing-settings', email)).status).toBe(403);
      expect((await call('POST', 'admin/billing-settings', email, { priceInr: 1 })).status).toBe(403);
    }
    expect(await (await call('GET', 'admin/billing-settings', 'boss@tysonlabs.in')).json()).toEqual({ trialDays: 30, trialRequiresCard: false, priceInr: 799 });
    expect((await call('POST', 'admin/billing-settings', 'boss@tysonlabs.in', { trialDays: -1 })).status).toBe(400);
    expect((await call('POST', 'admin/billing-settings', 'boss@tysonlabs.in', { priceInr: '5' })).status).toBe(400);
    expect((await call('POST', 'admin/billing-settings', 'boss@tysonlabs.in', { trialRequiresCard: 'yes' })).status).toBe(400);
    const r = await call('POST', 'admin/billing-settings', 'boss@tysonlabs.in', { trialDays: 14, priceInr: 999 });
    expect(await r.json()).toEqual({ trialDays: 14, trialRequiresCard: false, priceInr: 999 });
    expect((await view()).priceInr).toBe(999);
    const audit = await ctx.o.query("SELECT actor_ref, entity FROM audit_log WHERE action = 'billing.settings_changed' ORDER BY id DESC LIMIT 1");
    expect(audit.rows[0].actor_ref).toBe('dash:boss@tysonlabs.in');
    expect(audit.rows[0].entity).toContain('priceInr=999');
    await call('POST', 'admin/billing-settings', 'boss@tysonlabs.in', { trialDays: 30, priceInr: 799 });
  });

  it('per business actions are admin only, work, and are audit logged with the admin email', async () => {
    await setState('trial', { trial: new Date(Date.now() + day) });
    for (const email of ['owner@shop.in', 'staff@shop.in', 'other@shop.in']) expect((await call('POST', 'admin/b/shop/billing', email, { action: 'pilot' })).status).toBe(403);
    expect((await row()).state).toBe('trial');
    const act = (body: unknown) => call('POST', 'admin/b/shop/billing', 'boss@tysonlabs.in', body);
    expect((await act({ action: 'bogus' })).status).toBe(400);
    expect((await act({ action: 'extend_trial' })).status).toBe(400);
    expect((await act({ action: 'extend_trial', days: 0 })).status).toBe(400);
    expect((await act({ action: 'set_state', state: 'nope' })).status).toBe(400);
    expect((await call('POST', 'admin/b/missing/billing', 'boss@tysonlabs.in', { action: 'pilot' })).status).toBe(404);
    expect((await (await act({ action: 'pilot' })).json()).state).toBe('pilot');
    expect((await (await act({ action: 'pause' })).json()).state).toBe('paused');
    expect((await act({ action: 'extend_trial', days: 3 })).status).toBe(409); // not in a trial
    expect((await (await act({ action: 'resume' })).json()).state).toBe('pilot'); // a pause remembers what it interrupted
    expect((await act({ action: 'resume' })).status).toBe(409); // not paused any more
    expect((await (await act({ action: 'set_state', state: 'trial' })).json()).trialEndsAt).not.toBeNull(); // a trial always has an end
    expect((await (await act({ action: 'set_state', state: 'trial', days: 5 })).json()).state).toBe('trial');
    expect((await (await act({ action: 'set_state', state: 'needs_card' })).json()).state).toBe('needs_card');
    const left = (new Date((await row()).trial_ends_at).getTime() - Date.now()) / day;
    expect(left).toBeGreaterThan(4.9);
    const rows = (await ctx.o.query("SELECT actor_ref, entity FROM audit_log WHERE action = 'billing.admin_changed' AND tenant_id = $1 ORDER BY id", [tenantId])).rows;
    expect(rows.length).toBeGreaterThanOrEqual(5);
    expect(rows.every((x) => x.actor_ref === 'dash:boss@tysonlabs.in' && x.entity.includes('boss@tysonlabs.in'))).toBe(true);
  });

  it('billing rows cannot be written by the app role directly', async () => {
    const app = new Pool({ connectionString: process.env.TEST_APP_URL });
    try {
      await expect(app.query("UPDATE tenant_billing SET state = 'pilot'")).rejects.toThrow();
      await expect(app.query('SELECT * FROM billing_settings')).rejects.toThrow();
      await expect(app.query('SELECT * FROM billing_events')).rejects.toThrow();
    } finally { await app.end(); }
  });
});

describe('without billing keys', () => {
  it('everything but checkout keeps working', async () => {
    ctx.billing.isConfigured = false;
    await setState('pilot');
    expect((await syncNow(a, 'shop')).outcome).toBe('ok');
    expect((await view()).state).toBe('pilot');
    expect((await call('POST', 'b/shop/billing/subscribe', 'owner@shop.in', {})).status).toBe(503);
  });
});

describe('review fixes', () => {
  const NOW = () => Math.floor(Date.now() / 1000);
  beforeEach(async () => { ctx.billing.failCancel = false; await setState('trial', { trial: new Date(Date.now() + 10 * day) }); });

  it('the view carries what the app needs', async () => {
    const v = await view();
    expect(v).toMatchObject({ gstPercent: 18, subscriptionSet: false, accessAllowed: true, reason: null });
    await setState('trial', { trial: new Date(Date.now() - day) });
    expect(await view()).toMatchObject({ accessAllowed: false, reason: 'trialEnded', needsCard: true });
    await setState('past_due', { since: new Date(Date.now() - 9 * day) });
    expect(await view()).toMatchObject({ reason: 'graceEnded' });
    await setState('paused');
    expect(await view()).toMatchObject({ reason: 'paused', needsCard: false });
  });

  it('/me marks admin-only businesses with member:false', async () => {
    const r = await (await call('GET', 'me', 'boss@tysonlabs.in')).json();
    expect(r.businesses.find((b: { ref: string }) => b.ref === 'shop').member).toBe(false);
    const o = await (await call('GET', 'me', 'owner@shop.in')).json();
    expect(o.businesses[0].member).toBe(true);
  });

  it('subscribe refuses a trial that has not started (Google not connected)', async () => {
    await setState('trial', { trial: null });
    const r = await call('POST', 'b/shop/billing/subscribe', 'owner@shop.in', {});
    expect(r.status).toBe(409);
    expect(await r.json()).toEqual({ error: 'CONNECT_GOOGLE_FIRST' });
  });

  it('subscribe reuses an unfinished checkout, refuses a paid one, and stops a replaced one', async () => {
    const first = (await (await call('POST', 'b/shop/billing/subscribe', 'owner@shop.in', {})).json()).subscriptionId;
    const again = (await (await call('POST', 'b/shop/billing/subscribe', 'owner@shop.in', {})).json()).subscriptionId;
    expect(again).toBe(first); // still 'created': same one
    ctx.billing.remote.get(first)!.status = 'authenticated';
    expect((await call('POST', 'b/shop/billing/subscribe', 'owner@shop.in', {})).status).toBe(409);
    ctx.billing.remote.get(first)!.status = 'halted';
    const next = (await (await call('POST', 'b/shop/billing/subscribe', 'owner@shop.in', {})).json()).subscriptionId;
    expect(next).not.toBe(first);
    expect(ctx.billing.cancelled.some((c) => c.id === first && !c.atCycleEnd)).toBe(true);
    expect((await row()).razorpay_subscription_id).toBe(next);
    expect(await (await hook('subscription.cancelled', first)).json()).toEqual({ result: 'unknown' }); // the replaced one cannot touch the business
    expect((await row()).state).toBe('trial');
  });

  it('cancel during a trial stops the authorised card now and clears it', async () => {
    const sub = (await (await call('POST', 'b/shop/billing/subscribe', 'owner@shop.in', {})).json()).subscriptionId;
    ctx.billing.remote.get(sub)!.status = 'authenticated';
    const r = await call('POST', 'b/shop/billing/cancel', 'owner@shop.in', {});
    expect(r.status).toBe(200);
    expect(ctx.billing.cancelled.at(-1)).toEqual({ id: sub, atCycleEnd: false });
    expect(await row()).toMatchObject({ state: 'trial', razorpay_subscription_id: null });
    ctx.billing.failCancel = true;
    const sub2 = (await (await call('POST', 'b/shop/billing/subscribe', 'owner@shop.in', {})).json()).subscriptionId;
    ctx.billing.remote.get(sub2)!.status = 'authenticated';
    expect((await call('POST', 'b/shop/billing/cancel', 'owner@shop.in', {})).status).toBe(502);
    expect((await row()).razorpay_subscription_id).toBe(sub2); // put back when Razorpay refused
  });

  it('card first: authorised with start_at = trial length, trial on authenticated, active on charged', async () => {
    await setState('needs_card');
    const sub = (await (await call('POST', 'b/shop/billing/subscribe', 'owner@shop.in', {})).json()).subscriptionId;
    const startAt = ctx.billing.created.at(-1)!.startAt!;
    expect(startAt).toBeGreaterThan(NOW() + 29 * 86400);
    expect(startAt).toBeLessThan(NOW() + 31 * 86400);
    expect((await row()).state).toBe('needs_card');
    (await hook('subscription.authenticated', sub, { raw: JSON.stringify({ event: 'subscription.authenticated', payload: { subscription: { entity: { id: sub, start_at: startAt } } } }) }));
    const r = await row();
    expect(r.state).toBe('trial');
    expect(Math.floor(new Date(r.trial_ends_at).getTime() / 1000)).toBe(startAt);
    expect((await syncNow(a, 'shop')).outcome).toBe('ok');
    await hook('subscription.authenticated', sub, { raw: JSON.stringify({ event: 'subscription.authenticated', payload: { subscription: { entity: { id: sub } } } }) }); // repeat with another id: still a trial
    await hook('subscription.charged', sub, { end: startAt + 30 * 86400 });
    expect((await row()).state).toBe('active');
    expect(await (await hook('subscription.authenticated', sub)).json()).toEqual({ result: 'stale' }); // a late authentication does not demote a paid business
    expect((await row()).state).toBe('active');
  });

  it('a late charged or activated for an ended subscription does not reopen access', async () => {
    const sub = (await (await call('POST', 'b/shop/billing/subscribe', 'owner@shop.in', {})).json()).subscriptionId;
    await hook('subscription.activated', sub, { end: NOW() + 86400 });
    await hook('subscription.cancelled', sub);
    ctx.billing.remote.get(sub)!.status = 'cancelled';
    expect((await row()).state).toBe('cancelled');
    expect(await (await hook('subscription.charged', sub, { end: NOW() + 86400 })).json()).toEqual({ result: 'stale' });
    expect(await (await hook('subscription.activated', sub)).json()).toEqual({ result: 'stale' });
    expect((await row()).state).toBe('cancelled');
    const fresh = (await (await call('POST', 'b/shop/billing/subscribe', 'owner@shop.in', {})).json()).subscriptionId; // a new subscription may reopen it
    expect(fresh).not.toBe(sub);
    await hook('subscription.charged', fresh, { end: NOW() + 86400 });
    expect((await row()).state).toBe('active');
  });

  it('writing the Google profile is gated; previews and reads are not', async () => {
    await setState('needs_card');
    const patches = ctx.fake.patches.length;
    expect((await call('POST', 'b/shop/profile', 'owner@shop.in', { changes: { description: 'New text' } })).status).toBe(402);
    expect(ctx.fake.patches.length).toBe(patches);
    expect((await call('POST', 'b/shop/profile-preview', 'owner@shop.in', { changes: { description: 'New text' } })).status).toBe(200);
    expect((await call('GET', 'b/shop/profile', 'owner@shop.in')).status).toBe(200);
  });

  it('billing_apply refuses a business outside the request scope', async () => {
    const other = await ctx.mkClient('billing-B');
    await expect(withScope({ clientId: other.id }, (db) => db.query("SELECT billing_apply($1,$2,'pilot',NULL,NULL,NULL,NULL,false)", [clientId, tenantId]))).rejects.toThrow(/scope/);
    expect((await row()).state).toBe('trial');
  });

  it('a plan amount that matches neither price logs a warning', async () => {
    const warn: string[] = [];
    const orig = console.warn;
    console.warn = (...m: unknown[]) => { warn.push(m.join(' ')); };
    try {
      ctx.billing.planAmount = 50000;
      await call('POST', 'b/shop/billing/subscribe', 'owner@shop.in', {});
      expect(warn.some((w) => w.includes('50000 paise'))).toBe(true);
      warn.length = 0;
      ctx.billing.planAmount = 94282;
      await setState('trial', { trial: new Date(Date.now() + 10 * day) });
      await call('POST', 'b/shop/billing/subscribe', 'owner@shop.in', {});
      expect(warn).toHaveLength(0);
    } finally { console.warn = orig; }
  });

  it('admin pilot stops a live subscription and clears it; if Razorpay fails nothing changes', async () => {
    const sub = (await (await call('POST', 'b/shop/billing/subscribe', 'owner@shop.in', {})).json()).subscriptionId;
    ctx.billing.remote.get(sub)!.status = 'authenticated';
    ctx.billing.failCancel = true;
    const bad = await call('POST', 'admin/b/shop/billing', 'boss@tysonlabs.in', { action: 'pilot' });
    expect(bad.status).toBe(502);
    expect(await bad.json()).toEqual({ error: 'SUBSCRIPTION_CANCEL_FAILED' });
    expect(await row()).toMatchObject({ state: 'trial', razorpay_subscription_id: sub });
    ctx.billing.failCancel = false;
    expect((await call('POST', 'admin/b/shop/billing', 'boss@tysonlabs.in', { action: 'pilot' })).status).toBe(200);
    expect(ctx.billing.cancelled.at(-1)).toEqual({ id: sub, atCycleEnd: false });
    expect(await row()).toMatchObject({ state: 'pilot', razorpay_subscription_id: null });
  });

  it('erasing a business stops its subscription first; if Razorpay fails nothing is deleted', async () => {
    const oid = (await ctx.o.query("SELECT id FROM tenants WHERE external_ref = 'other'")).rows[0].id as string;
    ctx.billing.remote.set('sub_OTHER1', { status: 'active', startAt: null, currentEnd: null });
    await ctx.o.query("UPDATE tenant_billing SET state = 'active', razorpay_subscription_id = 'sub_OTHER1' WHERE tenant_id = $1", [oid]);
    ctx.billing.failCancel = true;
    await expect(eraseTenant(a, 'other')).rejects.toMatchObject({ status: 502, code: 'SUBSCRIPTION_CANCEL_FAILED' });
    expect((await ctx.o.query('SELECT count(*)::int n FROM tenants WHERE id = $1', [oid])).rows[0].n).toBe(1);
    ctx.billing.failCancel = false;
    await eraseTenant(a, 'other');
    expect(ctx.billing.cancelled.at(-1)).toEqual({ id: 'sub_OTHER1', atCycleEnd: false });
    expect((await ctx.o.query('SELECT count(*)::int n FROM tenants WHERE id = $1', [oid])).rows[0].n).toBe(0);
  });

  it('a subscription that was never authorised is not cancelled at Razorpay (nobody can be charged)', async () => {
    const sub = (await (await call('POST', 'b/shop/billing/subscribe', 'owner@shop.in', {})).json()).subscriptionId; // status created
    const before = ctx.billing.cancelled.length;
    expect((await call('POST', 'b/shop/billing/cancel', 'owner@shop.in', {})).status).toBe(200);
    ctx.billing.failCancel = true; // even a broken Razorpay does not block it
    expect(ctx.billing.cancelled.length).toBe(before);
    expect((await row()).razorpay_subscription_id).toBeNull();
    const again = (await (await call('POST', 'b/shop/billing/subscribe', 'owner@shop.in', {})).json()).subscriptionId;
    expect(again).not.toBe(sub);
    expect((await call('POST', 'admin/b/shop/billing', 'boss@tysonlabs.in', { action: 'pilot' })).status).toBe(200);
    expect(ctx.billing.cancelled.length).toBe(before);
  });

  it('two simultaneous subscribe calls end with one stored subscription; the duplicate is never handed out', async () => {
    ctx.billing.createDelayMs = 80;
    const made = ctx.billing.created.length;
    try {
      const [x, y] = await Promise.all([1, 2].map(() => call('POST', 'b/shop/billing/subscribe', 'owner@shop.in', {})));
      expect(x.status).toBe(200);
      expect(y.status).toBe(200);
      const ids = [(await x.json()).subscriptionId, (await y.json()).subscriptionId];
      expect(ids[0]).toBe(ids[1]);
      expect((await row()).razorpay_subscription_id).toBe(ids[0]);
      expect(ctx.billing.created.length - made).toBe(2);
      const loser = [...ctx.billing.remote.entries()].filter(([id]) => id !== ids[0]).map(([id, r]) => ({ id, r })).slice(-1)[0];
      expect(loser.r.status).toBe('created'); // the duplicate was never authorised (nobody can be charged), so Razorpay is not asked to cancel it
    } finally { ctx.billing.createDelayMs = 0; }
  });

  it('after cancellation any late event for that subscription is stale, except the cancellation itself', async () => {
    const sub = (await (await call('POST', 'b/shop/billing/subscribe', 'owner@shop.in', {})).json()).subscriptionId;
    await hook('subscription.activated', sub, { end: NOW() + 86400 });
    await hook('subscription.cancelled', sub);
    expect(await (await hook('subscription.halted', sub)).json()).toEqual({ result: 'stale' });
    expect((await row()).state).toBe('cancelled');
    expect(await (await hook('subscription.cancelled', sub)).json()).toEqual({ result: 'applied' });
  });

  it('extend_trial is refused with a card on file, and does not start a clock that has not started', async () => {
    const act = (body: unknown) => call('POST', 'admin/b/shop/billing', 'boss@tysonlabs.in', body);
    await ctx.o.query("UPDATE tenant_billing SET razorpay_subscription_id = 'sub_CARD1' WHERE tenant_id = $1", [tenantId]);
    const r = await act({ action: 'extend_trial', days: 5 });
    expect(r.status).toBe(409);
    expect(await r.json()).toEqual({ error: 'TRIAL_HAS_CARD' });
    await setState('trial', { trial: null });
    const n = await act({ action: 'extend_trial', days: 5 });
    expect(n.status).toBe(409);
    expect(await n.json()).toEqual({ error: 'CONNECT_GOOGLE_FIRST' });
    expect((await row()).trial_ends_at).toBeNull();
  });

  it('set_state cancelled stops the subscription; pause is refused while one is live; resume restores active or cancelled', async () => {
    const act = (body: unknown) => call('POST', 'admin/b/shop/billing', 'boss@tysonlabs.in', body);
    const sub = (await (await call('POST', 'b/shop/billing/subscribe', 'owner@shop.in', {})).json()).subscriptionId;
    ctx.billing.remote.get(sub)!.status = 'active';
    await setState('active', { sub, end: new Date(Date.now() + 5 * day) });
    for (const body of [{ action: 'pause' }, { action: 'set_state', state: 'paused' }]) {
      const r = await act(body);
      expect(r.status).toBe(409);
      expect(await r.json()).toEqual({ error: 'SUBSCRIPTION_LIVE' });
    }
    ctx.billing.failCancel = true;
    expect((await act({ action: 'set_state', state: 'cancelled' })).status).toBe(502);
    expect((await row()).state).toBe('active');
    ctx.billing.failCancel = false;
    expect((await (await act({ action: 'set_state', state: 'cancelled' })).json()).state).toBe('cancelled');
    expect(ctx.billing.cancelled.at(-1)).toEqual({ id: sub, atCycleEnd: false });
    expect((await row()).razorpay_subscription_id).toBeNull();
    // no live subscription: pausing works, and resume goes back to what it was (no new free trial)
    expect((await (await act({ action: 'pause' })).json()).state).toBe('paused');
    expect((await (await act({ action: 'resume' })).json()).state).toBe('cancelled');
    await setState('active');
    await act({ action: 'pause' });
    expect((await (await act({ action: 'resume' })).json()).state).toBe('active');
  });
});
