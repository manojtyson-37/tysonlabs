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
  /** The live listing as the merchant last set it, plus the review and maps links Google provides. */
  getLocation(accessToken: string, locationId: string): Promise<GoogleProfile>;
  /** Changes only the fields named in `fields`. With validateOnly nothing is changed; Google only checks the request. */
  patchLocation(accessToken: string, locationId: string, fields: ProfileChange, validateOnly: boolean): Promise<void>;
  /** Daily performance numbers. Throws GoogleError('api_not_enabled') when the API is off for the project. */
  fetchPerformance(accessToken: string, locationId: string, days: number): Promise<PerformanceReport>;
  /** Sends this account's new and updated review notifications to a Pub/Sub topic. */
  setNotificationSetting(accessToken: string, accountId: string, topic: string): Promise<'set' | 'kept_existing'>;
}

export const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const;
export type Day = (typeof DAYS)[number];
export interface HoursPeriod { day: Day; open: string; close: string } // HH:MM, 24 hour
export interface GoogleProfile {
  title: string;
  primaryPhone?: string;
  websiteUri?: string;
  description?: string;
  address?: string;
  category?: string;
  hours: HoursPeriod[];
  reviewLink?: string;
  mapsLink?: string;
}
/** Only these fields can be changed from the dashboard. Name, address and categories stay in Google's own editor. */
export interface ProfileChange {
  primaryPhone?: string;
  websiteUri?: string;
  description?: string;
  hours?: HoursPeriod[];
}
export interface PerformanceReport {
  from: string;
  to: string;
  totals: { views: number; calls: number; websiteClicks: number; directions: number; bookings: number; conversations: number };
  daily: { date: string; views: number; calls: number; websiteClicks: number; directions: number }[];
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

  async setNotificationSetting(accessToken: string, accountId: string, topic: string): Promise<'set' | 'kept_existing'> {
    const url = `https://mybusinessnotifications.googleapis.com/v1/accounts/${encodeURIComponent(accountId)}/notificationSetting`;
    // Never overwrite a topic the customer already configured for their own systems.
    const cur = await this.get<{ pubsubTopic?: string }>(url, accessToken);
    if (cur.pubsubTopic && cur.pubsubTopic !== topic) return 'kept_existing';
    const res = await fetch(`${url}?updateMask=pubsubTopic,notificationTypes`, {
      method: 'PATCH', headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: `accounts/${accountId}/notificationSetting`, pubsubTopic: topic, notificationTypes: ['NEW_REVIEW', 'UPDATED_REVIEW'] }),
    });
    if (res.status === 401) throw new GoogleError('unauthorized');
    if (!res.ok) throw new GoogleError(`http_${res.status}`); // 403 here can mean the topic does not allow Google to publish
    return 'set';
  }

  async getLocation(accessToken: string, locationId: string): Promise<GoogleProfile> {
    const j = await this.get<{
      title?: string; phoneNumbers?: { primaryPhone?: string }; websiteUri?: string; profile?: { description?: string };
      storefrontAddress?: { addressLines?: string[]; locality?: string; postalCode?: string; administrativeArea?: string };
      categories?: { primaryCategory?: { displayName?: string } };
      regularHours?: { periods?: { openDay: Day; openTime?: { hours?: number; minutes?: number }; closeTime?: { hours?: number; minutes?: number } }[] };
      metadata?: { newReviewUri?: string; mapsUri?: string };
    }>(`https://mybusinessbusinessinformation.googleapis.com/v1/locations/${encodeURIComponent(locationId)}?readMask=title,phoneNumbers,websiteUri,profile,storefrontAddress,categories,regularHours,metadata`, accessToken);
    const t = (x?: { hours?: number; minutes?: number }) => `${String(x?.hours ?? 0).padStart(2, '0')}:${String(x?.minutes ?? 0).padStart(2, '0')}`;
    const a = j.storefrontAddress;
    return {
      title: j.title ?? '',
      primaryPhone: j.phoneNumbers?.primaryPhone,
      websiteUri: j.websiteUri,
      description: j.profile?.description,
      address: a ? [...(a.addressLines ?? []), a.locality, a.administrativeArea, a.postalCode].filter(Boolean).join(', ') : undefined,
      category: j.categories?.primaryCategory?.displayName,
      hours: (j.regularHours?.periods ?? []).map((p) => ({ day: p.openDay, open: t(p.openTime), close: t(p.closeTime) })),
      reviewLink: j.metadata?.newReviewUri,
      mapsLink: j.metadata?.mapsUri,
    };
  }

  async patchLocation(accessToken: string, locationId: string, fields: ProfileChange, validateOnly: boolean) {
    const body: Record<string, unknown> = {};
    const mask: string[] = [];
    if (fields.primaryPhone !== undefined) { body.phoneNumbers = { primaryPhone: fields.primaryPhone }; mask.push('phoneNumbers.primaryPhone'); }
    if (fields.websiteUri !== undefined) { body.websiteUri = fields.websiteUri; mask.push('websiteUri'); }
    if (fields.description !== undefined) { body.profile = { description: fields.description }; mask.push('profile.description'); }
    if (fields.hours !== undefined) {
      const hm = (v: string) => ({ hours: Number(v.slice(0, 2)), minutes: Number(v.slice(3, 5)) }); // 24:00 is a valid close time
      body.regularHours = { periods: fields.hours.map((h) => ({ openDay: h.day, openTime: hm(h.open), closeDay: h.day, closeTime: hm(h.close) })) };
      mask.push('regularHours');
    }
    if (!mask.length) return;
    const qs = new URLSearchParams({ updateMask: mask.join(',') });
    if (validateOnly) qs.set('validateOnly', 'true');
    const res = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/locations/${encodeURIComponent(locationId)}?${qs}`, {
      method: 'PATCH', headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    if (res.status === 401) throw new GoogleError('unauthorized');
    if (res.status === 400) throw new GoogleError('invalid_change');
    if (!res.ok) throw new GoogleError(`http_${res.status}`);
  }

  async fetchPerformance(accessToken: string, locationId: string, days: number): Promise<PerformanceReport> {
    const end = new Date(Date.now() - 86_400_000);
    const start = new Date(end.getTime() - (days - 1) * 86_400_000);
    const p = (d: Date, k: string) => [`dailyRange.${k}.year`, String(d.getUTCFullYear())] as const;
    const qs = new URLSearchParams();
    for (const m of ['BUSINESS_IMPRESSIONS_DESKTOP_MAPS', 'BUSINESS_IMPRESSIONS_DESKTOP_SEARCH', 'BUSINESS_IMPRESSIONS_MOBILE_MAPS', 'BUSINESS_IMPRESSIONS_MOBILE_SEARCH', 'CALL_CLICKS', 'WEBSITE_CLICKS', 'BUSINESS_DIRECTION_REQUESTS', 'BUSINESS_BOOKINGS', 'BUSINESS_CONVERSATIONS']) qs.append('dailyMetrics', m);
    for (const [d, k] of [[start, 'startDate'], [end, 'endDate']] as const) {
      qs.set(p(d, k)[0], p(d, k)[1]); qs.set(`dailyRange.${k}.month`, String(d.getUTCMonth() + 1)); qs.set(`dailyRange.${k}.day`, String(d.getUTCDate()));
    }
    const res = await fetch(`https://businessprofileperformance.googleapis.com/v1/locations/${encodeURIComponent(locationId)}:fetchMultiDailyMetricsTimeSeries?${qs}`, { headers: { Authorization: `Bearer ${accessToken}` } });
    if (res.status === 401) throw new GoogleError('unauthorized');
    if (res.status === 403) throw new GoogleError('api_not_enabled');
    if (!res.ok) throw new GoogleError(`http_${res.status}`);
    const j = (await res.json()) as { multiDailyMetricTimeSeries?: { dailyMetricTimeSeries?: { dailyMetric: string; timeSeries?: { datedValues?: { date: { year: number; month: number; day: number }; value?: string }[] } }[] }[] };
    const byDate = new Map<string, { views: number; calls: number; websiteClicks: number; directions: number }>();
    const totals = { views: 0, calls: 0, websiteClicks: 0, directions: 0, bookings: 0, conversations: 0 };
    for (const grp of j.multiDailyMetricTimeSeries ?? []) for (const s of grp.dailyMetricTimeSeries ?? []) {
      for (const v of s.timeSeries?.datedValues ?? []) {
        const n = Number(v.value ?? 0) || 0;
        const key = `${v.date.year}-${String(v.date.month).padStart(2, '0')}-${String(v.date.day).padStart(2, '0')}`;
        const row = byDate.get(key) ?? { views: 0, calls: 0, websiteClicks: 0, directions: 0 };
        if (s.dailyMetric.startsWith('BUSINESS_IMPRESSIONS')) { row.views += n; totals.views += n; }
        else if (s.dailyMetric === 'CALL_CLICKS') { row.calls += n; totals.calls += n; }
        else if (s.dailyMetric === 'WEBSITE_CLICKS') { row.websiteClicks += n; totals.websiteClicks += n; }
        else if (s.dailyMetric === 'BUSINESS_DIRECTION_REQUESTS') { row.directions += n; totals.directions += n; }
        else if (s.dailyMetric === 'BUSINESS_BOOKINGS') totals.bookings += n;
        else if (s.dailyMetric === 'BUSINESS_CONVERSATIONS') totals.conversations += n;
        byDate.set(key, row);
      }
    }
    return { from: start.toISOString().slice(0, 10), to: end.toISOString().slice(0, 10), totals, daily: [...byDate.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([date, r]) => ({ date, ...r })) };
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
