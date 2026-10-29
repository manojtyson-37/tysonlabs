import { createHash, randomBytes } from 'node:crypto';

export const BUSINESS_SCOPE = 'https://www.googleapis.com/auth/business.manage';
const SCOPES = ['openid', 'email', BUSINESS_SCOPE];

export interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
}

export interface GoogleLocation {
  googleAccountId: string;
  googleLocationId: string;
  name: string;
  address?: string;
}

/** Everything the service needs from Google. Tests substitute a fake. */
export interface GoogleGateway {
  authUrl(params: { state: string; codeChallenge: string }): string;
  exchangeCode(code: string, codeVerifier: string): Promise<GoogleTokens>;
  refresh(refreshToken: string): Promise<GoogleTokens>;
  revoke(token: string): Promise<void>;
  userEmail(accessToken: string): Promise<string | undefined>;
  listLocations(accessToken: string): Promise<GoogleLocation[]>;
}

export function pkcePair() {
  const verifier = randomBytes(32).toString('base64url');
  const challenge = createHash('sha256').update(verifier).digest('base64url');
  return { verifier, challenge };
}

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  return v;
}

export class RealGoogleGateway implements GoogleGateway {
  authUrl({ state, codeChallenge }: { state: string; codeChallenge: string }) {
    return (
      'https://accounts.google.com/o/oauth2/v2/auth?' +
      new URLSearchParams({
        client_id: env('GOOGLE_CLIENT_ID'),
        redirect_uri: env('GOOGLE_REDIRECT_URI'),
        response_type: 'code',
        scope: SCOPES.join(' '),
        access_type: 'offline',
        prompt: 'consent',
        state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
      })
    );
  }

  exchangeCode(code: string, codeVerifier: string) {
    return this.token({ grant_type: 'authorization_code', code, code_verifier: codeVerifier, redirect_uri: env('GOOGLE_REDIRECT_URI') });
  }

  refresh(refreshToken: string) {
    return this.token({ grant_type: 'refresh_token', refresh_token: refreshToken });
  }

  async revoke(token: string) {
    await fetch('https://oauth2.googleapis.com/revoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ token }),
    }).catch(() => undefined);
  }

  async userEmail(accessToken: string) {
    const r = await this.get<{ email?: string }>('https://openidconnect.googleapis.com/v1/userinfo', accessToken);
    return r.email;
  }

  async listLocations(accessToken: string): Promise<GoogleLocation[]> {
    const accounts = await this.get<{ accounts?: { name: string }[] }>(
      'https://mybusinessaccountmanagement.googleapis.com/v1/accounts',
      accessToken,
    );
    const out: GoogleLocation[] = [];
    for (const account of accounts.accounts ?? []) {
      let pageToken: string | undefined;
      do {
        const qs = new URLSearchParams({ readMask: 'name,title,storefrontAddress', pageSize: '100' });
        if (pageToken) qs.set('pageToken', pageToken);
        const page = await this.get<{
          locations?: { name: string; title: string; storefrontAddress?: { addressLines?: string[]; locality?: string; postalCode?: string } }[];
          nextPageToken?: string;
        }>(`https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations?${qs}`, accessToken);
        for (const l of page.locations ?? []) {
          const a = l.storefrontAddress;
          out.push({
            googleAccountId: account.name.replace('accounts/', ''),
            googleLocationId: l.name.replace('locations/', ''),
            name: l.title,
            address: a ? [...(a.addressLines ?? []), a.locality, a.postalCode].filter(Boolean).join(', ') : undefined,
          });
        }
        pageToken = page.nextPageToken;
      } while (pageToken);
    }
    return out;
  }

  private async token(body: Record<string, string>): Promise<GoogleTokens> {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client_id: env('GOOGLE_CLIENT_ID'), client_secret: env('GOOGLE_CLIENT_SECRET'), ...body }),
    });
    const json = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) throw new GoogleError(json.error === 'invalid_grant' ? 'invalid_grant' : 'token_request_failed');
    return json as unknown as GoogleTokens;
  }

  private async get<T>(url: string, accessToken: string): Promise<T> {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (res.status === 401) throw new GoogleError('unauthorized');
    if (!res.ok) throw new GoogleError(`http_${res.status}`);
    return res.json() as Promise<T>;
  }
}

export class GoogleError extends Error {
  constructor(public kind: string) {
    super(`Google error: ${kind}`);
  }
}
