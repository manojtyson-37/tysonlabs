import { randomBytes, timingSafeEqual } from 'node:crypto';
import { AuthError, limitByIp } from './apikeys';
import { rateLimit } from './db';
import { sessionFor, type DashSession } from './dash-session';
import { signToken, verifyToken } from './signed';

/**
 * The separate reviews app talks to this service on behalf of a signed-in person. It proves itself with a shared secret and
 * says which verified email is signed in. Access to businesses is still looked up here on every request, never taken from the app.
 */
const sharedSecret = () => {
  const s = process.env.APP_SHARED_SECRET;
  if (!s || s.length < 32) throw new Error('APP_SHARED_SECRET is not set or too short (need 32+ characters)');
  return s;
};

export const appBaseUrl = () => (process.env.APP_BASE_URL ?? 'https://app.tysonlabs.in').replace(/\/$/, '');
export const HANDOFF_PURPOSE = 'app-handoff';
// Signed with the service's own dashboard secret, so the app never holds a key that could mint one. Redeemable once, by the app only.
export const makeHandoffToken = (email: string, nonce: string) => signToken({ email, n: nonce, jti: randomBytes(12).toString('base64url') }, HANDOFF_PURPOSE, 120);

/** One-time redemption: the token must be valid, carry the nonce of the browser that started sign-in, and its id must be unused. */
export async function redeemHandoff(token: string, nonce: string): Promise<string | null> {
  const t = verifyToken<{ email: string; jti: string; n: string }>(token, HANDOFF_PURPOSE);
  if (!t || typeof t.email !== 'string' || typeof t.jti !== 'string' || typeof t.n !== 'string' || !nonce || t.n !== nonce) return null;
  return (await rateLimit(`handoff:${t.jti}`, 1, 300)) ? t.email : null; // the shared limiter doubles as a use-once marker
}

export function requireAppKey(request: Request) {
  const given = Buffer.from(request.headers.get('x-app-key') ?? '');
  const want = Buffer.from(sharedSecret());
  if (given.length !== want.length || !timingSafeEqual(given, want)) throw new AuthError(401);
}

/** Throws AuthError(401) unless the request carries the app's secret and the email has access to something. */
export async function appSession(request: Request): Promise<DashSession> {
  await limitByIp(request, 'appkey', 3000);
  requireAppKey(request);
  const email = (request.headers.get('x-user-email') ?? '').trim().toLowerCase();
  if (!email || email.length > 254) throw new AuthError(401);
  if (!(await rateLimit(`appapi:${email}`, 300))) throw new AuthError(429);
  const session = await sessionFor(email);
  if (!session) throw new AuthError(401);
  return session;
}
