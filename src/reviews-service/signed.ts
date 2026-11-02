import { createHmac, timingSafeEqual } from 'node:crypto';

/** Small signed-token helper for cookies: base64url(JSON).signature, with an expiry inside the payload. */
function key(): string {
  const s = process.env.DASHBOARD_SESSION_SECRET;
  if (!s || s.length < 24) throw new Error('DASHBOARD_SESSION_SECRET is not set or too short');
  return s;
}
const sig = (body: string, purpose: string) => createHmac('sha256', key()).update(`${purpose}|${body}`).digest('base64url');

export function signToken(payload: Record<string, unknown>, purpose: string, ttlSeconds: number, now = Date.now()): string {
  const body = Buffer.from(JSON.stringify({ ...payload, x: now + ttlSeconds * 1000 })).toString('base64url');
  return `${body}.${sig(body, purpose)}`;
}

export function verifyToken<T extends Record<string, unknown>>(token: string | undefined | null, purpose: string, now = Date.now()): (T & { x: number }) | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [body, s] = parts;
  const a = Buffer.from(s);
  const b = Buffer.from(sig(body, purpose));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString()) as T & { x: number };
    return typeof payload.x === 'number' && payload.x > now ? payload : null;
  } catch {
    return null;
  }
}
