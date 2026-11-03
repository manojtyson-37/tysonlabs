import { randomBytes } from 'node:crypto';
import { pkcePair } from './google';
import { signToken, verifyToken } from './signed';

/**
 * "Sign in with Google" for the dashboard. Asks for openid and email only (not the Business Profile scope): it proves who the person is.
 * Access to a business still comes from the tenant_members table, never from Google.
 */
export interface SignInGateway {
  authUrl(p: { state: string; codeChallenge: string; redirectUri?: string }): string;
  exchange(code: string, verifier: string, redirectUri?: string): Promise<{ email: string; emailVerified: boolean }>;
}

const env = (n: string) => {
  const v = process.env[n];
  if (!v) throw new Error(`${n} is not set`);
  return v;
};

export class RealSignInGateway implements SignInGateway {
  authUrl({ state, codeChallenge, redirectUri }: { state: string; codeChallenge: string; redirectUri?: string }) {
    return (
      'https://accounts.google.com/o/oauth2/v2/auth?' +
      new URLSearchParams({
        client_id: env('GOOGLE_CLIENT_ID'), redirect_uri: redirectUri ?? env('GOOGLE_SIGNIN_REDIRECT_URI'), response_type: 'code', scope: 'openid email',
        state, code_challenge: codeChallenge, code_challenge_method: 'S256', prompt: 'select_account',
      })
    );
  }

  async exchange(code: string, verifier: string, redirectUri?: string) {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client_id: env('GOOGLE_CLIENT_ID'), client_secret: env('GOOGLE_CLIENT_SECRET'), grant_type: 'authorization_code', code, code_verifier: verifier, redirect_uri: redirectUri ?? env('GOOGLE_SIGNIN_REDIRECT_URI') }),
    });
    if (!res.ok) throw new Error('token_exchange_failed');
    const { id_token } = (await res.json()) as { id_token?: string };
    if (!id_token) throw new Error('no_id_token');
    // The id_token came straight from Google's token endpoint over TLS, so its claims are trusted after these checks.
    const claims = JSON.parse(Buffer.from(id_token.split('.')[1], 'base64url').toString()) as { aud?: string; iss?: string; exp?: number; email?: string; email_verified?: boolean };
    if (claims.aud !== env('GOOGLE_CLIENT_ID')) throw new Error('wrong_audience');
    if (claims.iss !== 'https://accounts.google.com' && claims.iss !== 'accounts.google.com') throw new Error('wrong_issuer');
    if (!claims.exp || claims.exp * 1000 < Date.now()) throw new Error('expired');
    if (!claims.email) throw new Error('no_email');
    return { email: claims.email.toLowerCase(), emailVerified: claims.email_verified === true };
  }
}

let gateway: SignInGateway | undefined;
export const getSignIn = (): SignInGateway => (gateway ??= new RealSignInGateway());
export const setSignIn = (g: SignInGateway | undefined) => { gateway = g; }; // test seam

export const OAUTH_COOKIE = 'tl_dash_oauth';

/** Step 1: where to send the browser, and the short-lived cookie that remembers state and the PKCE verifier. */
export function startSignIn(redirectUri?: string, flow?: 'app', nonce?: string): { url: string; cookie: string } {
  const state = randomBytes(24).toString('base64url');
  const { verifier, challenge } = pkcePair();
  return { url: getSignIn().authUrl({ state, codeChallenge: challenge, redirectUri }), cookie: signToken({ state, verifier, ...(flow ? { flow } : {}), ...(nonce ? { n: nonce } : {}) }, 'oauth-start', 600) };
}

/** Step 2: returns the verified email, or null for anything wrong (bad state, expired, unverified email, Google error). */
export async function finishSignIn(code: string | null, state: string | null, cookie: string | undefined, redirectUri?: string): Promise<string | null> {
  const saved = verifyToken<{ state: string; verifier: string }>(cookie, 'oauth-start');
  if (!saved || !code || !state || state !== saved.state) return null;
  try {
    const r = await getSignIn().exchange(code, saved.verifier, redirectUri);
    return r.emailVerified ? r.email : null;
  } catch {
    return null;
  }
}
