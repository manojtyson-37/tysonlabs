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
  /** True when Google confirmed the revocation. */
  revoke(token: string): Promise<boolean>;
  userEmail(accessToken: string): Promise<string | undefined>;
  listLocations(accessToken: string): Promise<GoogleLocation[]>;
  /** One page of a location's reviews, newest first. */
  listReviews(accessToken: string, accountId: string, locationId: string, pageToken?: string): Promise<GoogleReviewPage>;
  /** Creates or replaces the owner's reply to a review. */
  postReply(accessToken: string, accountId: string, locationId: string, reviewId: string, comment: string): Promise<void>;
}

export interface GoogleReview {
  reviewId: string;
  reviewerName?: string;
  rating: number; // 1-5
  comment?: string;
  createTime: string;
  updateTime: string;
  reply?: { comment: string; updateTime: string };
}
export interface GoogleReviewPage {
  reviews: GoogleReview[];
  nextPageToken?: string;
}

const STARS: Record<string, number> = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };

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
    const res = await fetch('https://oauth2.googleapis.com/revoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ token }),
    }).catch(() => null);
    return !!res && res.ok;
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

  async listReviews(accessToken: string, accountId: string, locationId: string, pageToken?: string): Promise<GoogleReviewPage> {
    const qs = new URLSearchParams({ pageSize: '50', orderBy: 'updateTime desc' });
    if (pageToken) qs.set('pageToken', pageToken);
    const page = await this.get<{
      reviews?: { reviewId: string; reviewer?: { displayName?: string }; starRating?: string; comment?: string; createTime: string; updateTime: string; reviewReply?: { comment: string; updateTime: string } }[];
      nextPageToken?: string;
    }>(`https://mybusiness.googleapis.com/v4/accounts/${encodeURIComponent(accountId)}/locations/${encodeURIComponent(locationId)}/reviews?${qs}`, accessToken);
    return {
      reviews: (page.reviews ?? []).flatMap((r) => {
        const rating = STARS[r.starRating ?? ''];
        if (!rating) return []; // unrated or unknown enum: skip rather than guess
        return [{ reviewId: r.reviewId, reviewerName: r.reviewer?.displayName, rating, comment: r.comment, createTime: r.createTime, updateTime: r.updateTime, reply: r.reviewReply }];
      }),
      nextPageToken: page.nextPageToken,
    };
  }

  async postReply(accessToken: string, accountId: string, locationId: string, reviewId: string, comment: string) {
    const res = await fetch(
      `https://mybusiness.googleapis.com/v4/accounts/${encodeURIComponent(accountId)}/locations/${encodeURIComponent(locationId)}/reviews/${encodeURIComponent(reviewId)}/reply`,
      { method: 'PUT', headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ comment }) },
    );
    if (res.status === 401) throw new GoogleError('unauthorized');
    if (!res.ok) throw new GoogleError(`http_${res.status}`);
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
