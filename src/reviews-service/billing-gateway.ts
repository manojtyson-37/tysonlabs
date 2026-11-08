import { ServiceError } from './service';

/**
 * The payment provider, behind an interface so tests (and any environment without keys) never call out.
 * The real one talks to Razorpay Subscriptions over REST. Keys come from the environment only.
 */
export interface BillingGateway {
  /** False until every Razorpay setting needed to take a payment is present. */
  configured(): boolean;
  /** Public key id that the browser checkout needs. Not a secret. */
  keyId(): string;
  /** startAt (unix seconds) delays the first charge, so the card can be authorised now and charged when the trial ends. */
  createSubscription(input: { tenantRef: string; startAt?: number }): Promise<{ id: string }>;
  cancelSubscription(subscriptionId: string, atCycleEnd: boolean): Promise<void>;
  /** Null when Razorpay does not know the id. */
  getSubscription(subscriptionId: string): Promise<RemoteSubscription | null>;
  /** Amount of the configured plan in paise, or null when it cannot be read. */
  getPlanAmount(): Promise<number | null>;
}

export interface RemoteSubscription {
  status: string; // created | authenticated | active | pending | halted | cancelled | completed | expired | paused
  startAt: number | null; // unix seconds
  currentEnd: number | null; // unix seconds
}

const API = 'https://api.razorpay.com/v1';

export class RazorpayGateway implements BillingGateway {
  configured() {
    return !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && process.env.RAZORPAY_PLAN_ID);
  }
  keyId() {
    return process.env.RAZORPAY_KEY_ID ?? '';
  }
  private async call(path: string, body?: Record<string, unknown>, okNotFound = false): Promise<Record<string, unknown> | null> {
    if (!this.configured()) throw new ServiceError(503, 'BILLING_NOT_CONFIGURED');
    const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64');
    let res: Response;
    try {
      res = await fetch(`${API}${path}`, {
        method: body ? 'POST' : 'GET',
        headers: { authorization: `Basic ${auth}`, 'content-type': 'application/json' },
        ...(body ? { body: JSON.stringify(body) } : {}),
        signal: AbortSignal.timeout(10_000),
      });
    } catch {
      throw new ServiceError(502, 'BILLING_ERROR');
    }
    if (okNotFound && res.status === 404) return null;
    if (!res.ok) {
      console.error('[billing] razorpay request failed', path.replace(/(sub|plan)_[A-Za-z0-9]+/, '$1_*'), res.status); // status only: the body can echo account details
      throw new ServiceError(502, 'BILLING_ERROR');
    }
    return (await res.json().catch(() => ({}))) as Record<string, unknown>;
  }
  async createSubscription(input: { tenantRef: string; startAt?: number }) {
    const out = await this.call('/subscriptions', {
      plan_id: process.env.RAZORPAY_PLAN_ID,
      total_count: 120, // ten years of monthly cycles; the owner cancels when they want to stop
      customer_notify: 1,
      ...(input.startAt ? { start_at: input.startAt } : {}),
      notes: { tenant_ref: input.tenantRef.slice(0, 100) },
    });
    if (!out || typeof out.id !== 'string' || !/^sub_[A-Za-z0-9]+$/.test(out.id)) throw new ServiceError(502, 'BILLING_ERROR');
    return { id: out.id };
  }
  async cancelSubscription(subscriptionId: string, atCycleEnd: boolean) {
    if (!/^sub_[A-Za-z0-9]+$/.test(subscriptionId)) throw new ServiceError(502, 'BILLING_ERROR');
    await this.call(`/subscriptions/${subscriptionId}/cancel`, { cancel_at_cycle_end: atCycleEnd ? 1 : 0 });
  }
  async getSubscription(subscriptionId: string) {
    if (!/^sub_[A-Za-z0-9]+$/.test(subscriptionId)) throw new ServiceError(502, 'BILLING_ERROR');
    const out = await this.call(`/subscriptions/${subscriptionId}`, undefined, true);
    if (!out) return null;
    const num = (v: unknown) => (typeof v === 'number' && v > 0 ? v : null);
    return { status: typeof out.status === 'string' ? out.status : 'unknown', startAt: num(out.start_at), currentEnd: num(out.current_end) };
  }
  async getPlanAmount() {
    const plan = process.env.RAZORPAY_PLAN_ID ?? '';
    if (!/^plan_[A-Za-z0-9]+$/.test(plan)) return null;
    const out = await this.call(`/plans/${plan}`).catch(() => null);
    const amount = (out?.item as { amount?: unknown } | undefined)?.amount;
    return typeof amount === 'number' ? amount : null;
  }
}
