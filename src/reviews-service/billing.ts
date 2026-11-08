import { createHmac, timingSafeEqual } from 'node:crypto';
import type { AuthedClient } from './apikeys';
import { getBilling } from './container';
import { rateLimit, unscoped, withScope } from './db';
import type { RemoteSubscription } from './billing-gateway';
import { ServiceError, audit, resolveTenant } from './service';

/**
 * Subscription state per business, and the one gate that decides whether it may sync, post replies and send push alerts.
 * Reading, exporting and erasing are never gated here. 'pilot' (the businesses that existed before billing) and 'active' always pass.
 */
export type BillingState = 'trial' | 'needs_card' | 'active' | 'past_due' | 'cancel_pending' | 'cancelled' | 'paused' | 'pilot';
export const BILLING_STATES: BillingState[] = ['trial', 'needs_card', 'active', 'past_due', 'cancel_pending', 'cancelled', 'paused', 'pilot'];
export const PAST_DUE_GRACE_DAYS = 7;
export const GST_PERCENT = 18;

export interface BillingRow {
  state: BillingState;
  trial_ends_at: Date | null;
  razorpay_subscription_id: string | null;
  current_period_end: Date | null;
  cancel_at_period_end: boolean;
  past_due_since: Date | null;
  paused_from: string | null;
}

/** Why access is blocked (null = allowed), so the app can show the right words. */
export type BlockReason = 'trialEnded' | 'graceEnded' | 'periodEnded' | 'cardRequired' | 'cancelled' | 'paused' | 'noBillingRecord';

/** Pure, so it can be tested without a database. */
export function blockReason(row: Pick<BillingRow, 'state' | 'trial_ends_at' | 'current_period_end' | 'past_due_since'> | undefined, now = new Date()): BlockReason | null {
  if (!row) return 'noBillingRecord'; // a business always has a row (migration + trigger); no row means something is wrong, so do not serve it
  const t = now.getTime();
  switch (row.state) {
    case 'pilot':
    case 'active':
      return null;
    case 'trial': // the clock starts at first connection; before that nothing can run anyway
      return !row.trial_ends_at || new Date(row.trial_ends_at).getTime() > t ? null : 'trialEnded';
    case 'cancel_pending': // paid up to the end of the cycle
      return !row.current_period_end || new Date(row.current_period_end).getTime() > t ? null : 'periodEnded';
    case 'past_due':
      return row.past_due_since && new Date(row.past_due_since).getTime() + PAST_DUE_GRACE_DAYS * 86_400_000 > t ? null : 'graceEnded';
    case 'needs_card': return 'cardRequired';
    case 'cancelled': return 'cancelled';
    default: return 'paused';
  }
}
export const billingAllows = (row: Parameters<typeof blockReason>[0], now = new Date()): boolean => blockReason(row, now) === null;

const COLUMNS = 'state, trial_ends_at, razorpay_subscription_id, current_period_end, cancel_at_period_end, past_due_since, paused_from';
async function rowFor(clientId: string, tenantId: string): Promise<BillingRow | undefined> {
  return withScope({ clientId, tenantId }, async (db) => (await db.query(`SELECT ${COLUMNS} FROM tenant_billing WHERE tenant_id = $1`, [tenantId])).rows[0] as BillingRow | undefined);
}

export async function billingActive(clientId: string, tenantId: string): Promise<boolean> {
  return billingAllows(await rowFor(clientId, tenantId));
}

/** Throws 402 SUBSCRIPTION_REQUIRED unless the business may use the paid features. */
export async function assertBillingAllows(clientId: string, tenantId: string): Promise<void> {
  if (!(await billingActive(clientId, tenantId))) throw new ServiceError(402, 'SUBSCRIPTION_REQUIRED');
}

// ---------- settings ----------

export interface BillingSettings { trialDays: number; trialRequiresCard: boolean; priceInr: number }

export async function getSettings(): Promise<BillingSettings> {
  const r = await unscoped(async (db) => (await db.query('SELECT * FROM billing_settings_get()')).rows[0]);
  return { trialDays: r.trial_days, trialRequiresCard: r.trial_requires_card, priceInr: r.price_inr };
}

const isInt = (v: unknown, min: number, max: number): v is number => typeof v === 'number' && Number.isInteger(v) && v >= min && v <= max;

export async function updateSettings(a: AuthedClient, input: { trialDays?: unknown; trialRequiresCard?: unknown; priceInr?: unknown }): Promise<BillingSettings> {
  if (input.trialDays !== undefined && !isInt(input.trialDays, 0, 365)) throw new ServiceError(400, 'INVALID_TRIAL_DAYS');
  if (input.priceInr !== undefined && !isInt(input.priceInr, 1, 1_000_000)) throw new ServiceError(400, 'INVALID_PRICE');
  if (input.trialRequiresCard !== undefined && typeof input.trialRequiresCard !== 'boolean') throw new ServiceError(400, 'INVALID_TRIAL_REQUIRES_CARD');
  const who = a.apiKeyId.replace(/^dash:/, '');
  await unscoped((db) => db.query('SELECT billing_settings_set($1,$2,$3,$4)', [input.trialDays ?? null, input.trialRequiresCard ?? null, input.priceInr ?? null, who]));
  const now = await getSettings();
  await withScope({ clientId: a.clientId }, (db) => audit(db, a, a.clientId, null, 'billing.settings_changed', `trialDays=${now.trialDays} trialRequiresCard=${now.trialRequiresCard} priceInr=${now.priceInr} by ${who}`.slice(0, 500)));
  return now;
}

// ---------- shared helpers ----------

const day = 86_400_000;
const TERMINAL = ['cancelled', 'completed', 'expired'];
const iso = (d: Date | null) => (d ? new Date(d).toISOString() : null);
const scopeOf = (a: AuthedClient, tenantId: string) => ({ clientId: a.clientId, tenantId });

/** The only write path from the app: runs inside the request's own scope, which billing_apply checks against its arguments. */
async function apply(a: AuthedClient, tenantId: string, p: { state?: BillingState; trialEnd?: Date; subscriptionId?: string; periodEnd?: Date; cancelAtEnd?: boolean; clearSubscription?: boolean }) {
  await withScope(scopeOf(a, tenantId), (db) =>
    db.query('SELECT billing_apply($1,$2,$3,$4,$5,$6,$7,$8)', [a.clientId, tenantId, p.state ?? null, p.trialEnd ?? null, p.subscriptionId ?? null, p.periodEnd ?? null, p.cancelAtEnd ?? null, p.clearSubscription ?? false]),
  );
}

/**
 * Stops a subscription at Razorpay right now, unless it is already over (or Razorpay has never heard of it). Any failure becomes
 * SUBSCRIPTION_CANCEL_FAILED, for callers that must not go on while a customer could still be charged.
 */
async function cancelRemoteNow(subscriptionId: string): Promise<void> {
  try {
    const gateway = getBilling();
    const remote = await gateway.getSubscription(subscriptionId);
    // Over, unknown, or never authorised ('created': no card, so nobody can be charged): nothing to stop.
    if (!remote || TERMINAL.includes(remote.status) || remote.status === 'created') return;
    await gateway.cancelSubscription(subscriptionId, false);
  } catch {
    throw new ServiceError(502, 'SUBSCRIPTION_CANCEL_FAILED');
  }
}

/**
 * Before a business is erased: its live subscription must be stopped first, or the customer keeps being charged for a service whose
 * data is gone. If Razorpay cannot be reached the erase is refused and nothing is deleted.
 */
export async function cancelSubscriptionBeforeErase(a: AuthedClient, tenantId: string): Promise<void> {
  const row = await rowFor(a.clientId, tenantId);
  if (row?.razorpay_subscription_id) await cancelRemoteNow(row.razorpay_subscription_id);
}

const warnedPlans = new Set<string>();
/** Best effort: the plan at Razorpay decides what is charged, priceInr only what we show. Warn (once) when they disagree. */
async function warnOnPlanMismatch(priceInr: number): Promise<void> {
  try {
    const paise = await getBilling().getPlanAmount();
    if (paise === null) return;
    // GST: Razorpay Subscriptions charges exactly the plan amount, so the plan must hold the GST-inclusive price (priceInr * 118 paise
    // at 18%) if the customer is to pay price + GST. A plan equal to the bare price is accepted too (GST handled outside Razorpay).
    if (paise === priceInr * 100 || paise === priceInr * (100 + GST_PERCENT)) return;
    const key = `${paise}:${priceInr}`;
    if (warnedPlans.has(key)) return;
    warnedPlans.add(key);
    console.warn(`[billing] Razorpay plan amount is ${paise} paise but priceInr is ${priceInr} (expected ${priceInr * 100}, or ${priceInr * (100 + GST_PERCENT)} with GST). Customers are charged the plan amount.`);
  } catch { /* a warning must never block a checkout */ }
}

/** A subscription that could still charge someone: known to Razorpay, not over, and a card has been authorised. */
async function hasLiveSubscription(row: BillingRow | undefined): Promise<boolean> {
  if (!row?.razorpay_subscription_id) return false;
  const remote = await getBilling().getSubscription(row.razorpay_subscription_id);
  return !!remote && !TERMINAL.includes(remote.status) && remote.status !== 'created';
}

async function defaultTrialEnd(row: BillingRow | undefined): Promise<Date> {
  const keep = row?.trial_ends_at ? new Date(row.trial_ends_at) : null;
  return keep && keep.getTime() > Date.now() ? keep : new Date(Date.now() + (await getSettings()).trialDays * day);
}

// ---------- the business's own view ----------

export async function getBillingView(a: AuthedClient, tenantRef: string) {
  const tenantId = await resolveTenant(a, tenantRef);
  const [row, settings] = await Promise.all([rowFor(a.clientId, tenantId), getSettings()]);
  if (!row) throw new ServiceError(404, 'NOT_FOUND');
  const reason = blockReason(row);
  const nextCharge =
    row.state === 'active' || row.state === 'past_due' ? row.current_period_end
    : row.state === 'trial' && row.razorpay_subscription_id ? row.trial_ends_at // card authorised, first charge when the trial ends
    : null;
  return {
    state: row.state,
    trialEndsAt: iso(row.trial_ends_at),
    priceInr: settings.priceInr,
    gstPercent: GST_PERCENT,
    nextChargeAt: iso(nextCharge),
    cancelAtPeriodEnd: row.cancel_at_period_end,
    subscriptionSet: !!row.razorpay_subscription_id, // a subscription (card authorisation or paid) exists for this business
    accessAllowed: reason === null,
    reason, // null when allowed; else trialEnded | graceEnded | periodEnded | cardRequired | cancelled | paused | noBillingRecord
    needsCard: reason !== null && reason !== 'paused', // blocked, and a subscription would unblock it; a paused business must contact TysonLabs
    checkoutAvailable: getBilling().configured(),
  };
}

const SUBSCRIBABLE: BillingState[] = ['trial', 'needs_card', 'past_due', 'cancelled'];

export async function subscribe(a: AuthedClient, tenantRef: string): Promise<{ subscriptionId: string; keyId: string }> {
  const gateway = getBilling();
  if (!gateway.configured()) throw new ServiceError(503, 'BILLING_NOT_CONFIGURED');
  const tenantId = await resolveTenant(a, tenantRef);
  const row = await rowFor(a.clientId, tenantId);
  if (!row) throw new ServiceError(404, 'NOT_FOUND');
  if (!SUBSCRIBABLE.includes(row.state)) throw new ServiceError(409, 'SUBSCRIPTION_NOT_NEEDED');
  // The trial clock starts when Google is first connected; the first charge is scheduled for its end, so it has to exist.
  if (row.state === 'trial' && !row.trial_ends_at) throw new ServiceError(409, 'CONNECT_GOOGLE_FIRST');
  if (!(await rateLimit(`billing-subscribe:${tenantId}`, 5, 3600))) throw new ServiceError(429, 'RATE_LIMITED');

  // Never leave a paid subscription behind: look at the one we already have before making another.
  let replaced: string | null = null;
  if (row.razorpay_subscription_id) {
    const remote = await gateway.getSubscription(row.razorpay_subscription_id);
    if (remote?.status === 'created') return { subscriptionId: row.razorpay_subscription_id, keyId: gateway.keyId() }; // checkout was never completed: reuse it
    if (remote && (remote.status === 'authenticated' || remote.status === 'active')) throw new ServiceError(409, 'ALREADY_SUBSCRIBED'); // paid or card on file; the webhook will catch up
    if (remote && !TERMINAL.includes(remote.status)) replaced = row.razorpay_subscription_id; // halted, pending...: stopped once the new one exists
  }

  const settings = await getSettings();
  const now = Math.floor(Date.now() / 1000);
  let startAt: number | undefined;
  if (row.state === 'trial') {
    // A running trial is honoured: the card is authorised now and the first charge is the day the trial ends.
    const end = Math.floor(new Date(row.trial_ends_at!).getTime() / 1000);
    if (end > now + 15 * 60) startAt = end;
  } else if (row.state === 'needs_card' && settings.trialDays > 0) {
    startAt = now + settings.trialDays * 86400; // card first, but still no charge until the trial length has passed
  }
  await warnOnPlanMismatch(settings.priceInr);
  const sub = await gateway.createSubscription({ tenantRef, startAt });
  // Two simultaneous calls both get here with the same view of the row. Only the one that still finds the id it saw may store its
  // subscription; the other stops its own (never authorised, so nobody is charged) and hands back the winner's.
  const won = await withScope(scopeOf(a, tenantId), async (db) =>
    (await db.query('SELECT billing_claim_subscription($1,$2,$3,$4) AS ok', [a.clientId, tenantId, row.razorpay_subscription_id, sub.id])).rows[0].ok as boolean,
  );
  if (!won) {
    await cancelRemoteNow(sub.id).catch(() => console.error('[billing] could not stop a duplicate subscription; check Razorpay'));
    const now2 = await rowFor(a.clientId, tenantId);
    if (!now2?.razorpay_subscription_id) throw new ServiceError(409, 'SUBSCRIBE_IN_PROGRESS');
    return { subscriptionId: now2.razorpay_subscription_id, keyId: gateway.keyId() };
  }
  await withScope(scopeOf(a, tenantId), (db) => audit(db, a, a.clientId, tenantId, 'billing.subscription_created'));
  if (replaced) await cancelRemoteNow(replaced).catch(() => console.error('[billing] could not stop the replaced subscription; check Razorpay')); // events for it are now unknown to us
  return { subscriptionId: sub.id, keyId: gateway.keyId() };
}

export async function cancel(a: AuthedClient, tenantRef: string): Promise<{ state: BillingState; cancelAtPeriodEnd: boolean }> {
  const tenantId = await resolveTenant(a, tenantRef);
  const row = await rowFor(a.clientId, tenantId);
  if (!row) throw new ServiceError(404, 'NOT_FOUND');
  if (row.state === 'cancel_pending') return { state: 'cancel_pending', cancelAtPeriodEnd: true }; // repeat taps are harmless
  const id = row.razorpay_subscription_id;
  if (!id) throw new ServiceError(409, 'NOTHING_TO_CANCEL');
  if (row.state === 'active' || row.state === 'past_due') {
    // TO VERIFY in Razorpay test mode: cancel_at_cycle_end=1 keeps the subscription active until the cycle ends, then sends
    // subscription.cancelled. If it sends cancelled immediately instead, the business would lose access early.
    await getBilling().cancelSubscription(id, true);
    await apply(a, tenantId, { state: 'cancel_pending', cancelAtEnd: true });
    await withScope(scopeOf(a, tenantId), (db) => audit(db, a, a.clientId, tenantId, 'billing.cancel_requested'));
    return { state: 'cancel_pending', cancelAtPeriodEnd: true };
  }
  if (row.state === 'trial' || row.state === 'needs_card') {
    // A card authorised for after the trial: stop it now. The id is cleared first so its cancelled event can only be unknown here and
    // can never end the trial; if Razorpay refuses, the id is put back and the owner is told.
    await apply(a, tenantId, { clearSubscription: true });
    try { await cancelRemoteNow(id); } catch (err) { await apply(a, tenantId, { subscriptionId: id }); throw err; }
    await withScope(scopeOf(a, tenantId), (db) => audit(db, a, a.clientId, tenantId, 'billing.trial_subscription_cancelled'));
    return { state: row.state, cancelAtPeriodEnd: false };
  }
  throw new ServiceError(409, 'NOTHING_TO_CANCEL');
}

// ---------- admin ----------

export type AdminAction = 'pilot' | 'pause' | 'resume' | 'extend_trial' | 'set_state';

export async function adminAction(a: AuthedClient, tenantRef: string, input: { action?: unknown; days?: unknown; state?: unknown }) {
  const action = input.action as AdminAction;
  const tenantId = await resolveTenant(a, tenantRef);
  const row = await rowFor(a.clientId, tenantId);
  if (!row) throw new ServiceError(404, 'NOT_FOUND');
  let patch: Parameters<typeof apply>[2] = {};
  let detail: string = action;
  const days = input.days;
  const toPilot = async () => {
    // A pilot is never charged, so a live subscription must not keep running behind it.
    if (row.razorpay_subscription_id) await cancelRemoteNow(row.razorpay_subscription_id);
    patch = { state: 'pilot', clearSubscription: !!row.razorpay_subscription_id };
  };
  // Pausing blocks access but does not stop Razorpay charging, so a live subscription has to be dealt with first.
  const refuseWhileLive = async () => { if (await hasLiveSubscription(row)) throw new ServiceError(409, 'SUBSCRIPTION_LIVE'); };
  switch (action) {
    case 'pilot': await toPilot(); break;
    case 'pause': await refuseWhileLive(); patch = { state: 'paused' }; break;
    case 'resume': {
      if (row.state !== 'paused') throw new ServiceError(409, 'NOT_PAUSED');
      if (row.paused_from === 'pilot') { patch = { state: 'pilot' }; break; }
      const remote: RemoteSubscription | null = row.razorpay_subscription_id ? await getBilling().getSubscription(row.razorpay_subscription_id) : null;
      const sec = (n: number | null) => (n ? new Date(n * 1000) : undefined);
      if (remote?.status === 'active') patch = { state: 'active', periodEnd: sec(remote.currentEnd) };
      else if (remote?.status === 'authenticated') patch = { state: 'trial', trialEnd: sec(remote.startAt) ?? (await defaultTrialEnd(row)) };
      else if (remote && (remote.status === 'halted' || remote.status === 'pending')) patch = { state: 'past_due' };
      else if (remote && TERMINAL.includes(remote.status)) patch = { state: 'cancelled' };
      else if (row.paused_from === 'needs_card' || row.paused_from === 'active' || row.paused_from === 'cancelled') patch = { state: row.paused_from as BillingState }; // no new free trial for someone who already had one
      else patch = { state: 'trial', trialEnd: await defaultTrialEnd(row) }; // no card on file: back to a trial, never one without an end date
      detail = `resume to ${patch.state}`;
      break;
    }
    case 'extend_trial': {
      if (!isInt(days, 1, 365)) throw new ServiceError(400, 'INVALID_DAYS');
      if (row.state !== 'trial' && row.state !== 'needs_card') throw new ServiceError(409, 'NOT_IN_TRIAL');
      // The first charge was scheduled for the old trial end at Razorpay; moving the end here would let the two disagree.
      if (row.razorpay_subscription_id) throw new ServiceError(409, 'TRIAL_HAS_CARD');
      if (row.state === 'trial' && !row.trial_ends_at) throw new ServiceError(409, 'CONNECT_GOOGLE_FIRST'); // the clock has not started; do not start it here
      patch = { state: 'trial', trialEnd: new Date(Math.max(Date.now(), row.trial_ends_at ? new Date(row.trial_ends_at).getTime() : 0) + days * day) };
      detail = `extend_trial ${days}d`;
      break;
    }
    case 'set_state': {
      if (typeof input.state !== 'string' || !BILLING_STATES.includes(input.state as BillingState)) throw new ServiceError(400, 'INVALID_STATE');
      const state = input.state as BillingState;
      if (days !== undefined && (!isInt(days, 1, 365) || state !== 'trial')) throw new ServiceError(400, 'INVALID_DAYS');
      if (state === 'pilot') await toPilot();
      else if (state === 'cancelled') {
        if (row.razorpay_subscription_id) await cancelRemoteNow(row.razorpay_subscription_id);
        patch = { state, clearSubscription: !!row.razorpay_subscription_id };
      } else if (state === 'paused') { await refuseWhileLive(); patch = { state }; }
      else if (state === 'trial') patch = { state, trialEnd: days !== undefined ? new Date(Date.now() + (days as number) * day) : await defaultTrialEnd(row) }; // a trial always has an end
      else patch = { state };
      detail = `set_state ${state}`;
      break;
    }
    default: throw new ServiceError(400, 'INVALID_ACTION');
  }
  await apply(a, tenantId, patch);
  const who = a.apiKeyId.replace(/^dash:/, '');
  await withScope(scopeOf(a, tenantId), (db) => audit(db, a, a.clientId, tenantId, 'billing.admin_changed', `${detail} (was ${row.state}) by ${who}`.slice(0, 500)));
  return getBillingView(a, tenantRef);
}

// ---------- webhook ----------

/** HMAC-SHA256 of the raw body, hex, compared in constant time. */
export function signatureOk(rawBody: string, given: string | null, secret: string | undefined): boolean {
  if (!secret || !given) return false;
  const want = Buffer.from(createHmac('sha256', secret).update(rawBody).digest('hex'));
  const got = Buffer.from(given.trim());
  return got.length === want.length && timingSafeEqual(got, want);
}

// authenticated: the card is authorised, the first charge is at start_at (the trial). activated: the subscription is running, which
// is a trial if its start is still ahead, else paid. charged: money was taken. Out-of-order deliveries are handled in the SQL function.
const EVENT_STATE: Record<string, BillingState> = {
  'subscription.authenticated': 'trial',
  'subscription.activated': 'active',
  'subscription.charged': 'active',
  'subscription.halted': 'past_due',
  'subscription.cancelled': 'cancelled',
  'subscription.completed': 'cancelled',
};

export type WebhookResult = 'applied' | 'duplicate' | 'unknown' | 'stale' | 'ignored';

/** Call only after the signature has been verified. Never throws for a payload it cannot use (Razorpay would retry it for days). */
export async function handleWebhook(rawBody: string, eventId: string | null): Promise<WebhookResult> {
  let payload: { event?: unknown; payload?: { subscription?: { entity?: { id?: unknown; current_end?: unknown; start_at?: unknown } } } };
  try { payload = JSON.parse(rawBody); } catch { return 'ignored'; }
  const type = typeof payload.event === 'string' ? payload.event : '';
  let state = EVENT_STATE[type];
  const entity = payload.payload?.subscription?.entity;
  if (!state || !eventId || eventId.length > 200 || typeof entity?.id !== 'string' || !/^sub_[A-Za-z0-9]+$/.test(entity.id)) return 'ignored';
  const date = (v: unknown) => (typeof v === 'number' && v > 0 ? new Date(v * 1000) : null);
  const end = date(entity.current_end);
  const start = date(entity.start_at);
  if (type === 'subscription.activated' && start && start.getTime() > Date.now() + 60_000) state = 'trial'; // running, but the first charge is still ahead
  // A global cap on accepted events, so even a leaked secret cannot make this a database flood.
  if (!(await rateLimit('razorpay:events', 600))) throw new ServiceError(429, 'RATE_LIMITED');
  return unscoped(async (db) =>
    (await db.query('SELECT billing_webhook_apply($1,$2,$3,$4,$5,$6) AS result', [eventId, type, entity.id, state, end, state === 'trial' ? start : null])).rows[0].result as WebhookResult,
  );
}
