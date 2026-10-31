import { Pool } from 'pg';
import { randomBytes } from 'node:crypto';
import { setDependencies } from '@/reviews-service/container';
import { EnvKeyWrapper } from '@/reviews-service/crypto';
import { setPool } from '@/reviews-service/db';
import { generateApiKey } from '@/reviews-service/apikeys';
import type { GoogleGateway, GoogleLocation, GoogleReview, GoogleReviewPage } from '@/reviews-service/google';
import { GoogleError } from '@/reviews-service/google';

process.env.API_KEY_PEPPER = 'test-pepper';
process.env.REVIEWS_BASE_URL = 'https://reviews.test';

// Tests write and delete freely as the owner role, so refuse to run unless the URL is the throwaway local
// cluster started by tests/global-setup.ts. Without this a missing URL would fall back to PG* env vars.
export const owner = () => {
  const url = process.env.TEST_OWNER_URL;
  if (!url || new URL(url).hostname !== '127.0.0.1') {
    throw new Error('TEST_OWNER_URL must be set to the throwaway 127.0.0.1 test database');
  }
  return new Pool({ connectionString: url });
};

export class FakeGoogle implements GoogleGateway {
  revoked: string[] = [];
  locations: GoogleLocation[] = [{ googleAccountId: '1', googleLocationId: 'LOC1', name: 'Clinic A' }];
  refreshError: Error | null = null;
  scope = 'openid email https://www.googleapis.com/auth/business.manage';
  issueRefresh = true;
  email = 'admin@clinic.test';
  n = 0;
  authUrl({ state, codeChallenge }: { state: string; codeChallenge: string }) {
    return `https://accounts.google.test/auth?state=${state}&cc=${codeChallenge}`;
  }
  async exchangeCode(code: string, verifier: string) {
    if (!verifier) throw new Error('missing PKCE verifier');
    return { access_token: 'AT', refresh_token: this.issueRefresh ? `RT-${code}-${++this.n}` : undefined, expires_in: 3600, scope: this.scope };
  }
  async refresh() {
    if (this.refreshError) throw this.refreshError;
    return { access_token: 'AT2', expires_in: 3600, scope: this.scope };
  }
  revokeResult = true;
  async revoke(t: string) {
    this.revoked.push(t);
    return this.revokeResult;
  }
  async userEmail() {
    return this.email;
  }
  async listLocations() {
    return this.locations;
  }
  // Reviews per locationId, newest update first. pageSize 2 so tests exercise pagination.
  reviews: Record<string, GoogleReview[]> = {};
  posted: { locationId: string; reviewId: string; comment: string }[] = [];
  postError: Error | null = null;
  reviewCalls = 0;
  async listReviews(_t: string, _a: string, locationId: string, pageToken?: string): Promise<GoogleReviewPage> {
    this.reviewCalls++;
    const all = [...(this.reviews[locationId] ?? [])].sort((a, b) => b.updateTime.localeCompare(a.updateTime));
    const start = pageToken ? Number(pageToken) : 0;
    const reviews = all.slice(start, start + 2);
    return { reviews, nextPageToken: start + 2 < all.length ? String(start + 2) : undefined };
  }
  async postReply(_t: string, _a: string, locationId: string, reviewId: string, comment: string) {
    if (this.postError) throw this.postError;
    this.posted.push({ locationId, reviewId, comment });
  }
}

export const mkReview = (id: string, rating: number, updateTime: string, comment = 'ok', extra: Partial<GoogleReview> = {}): GoogleReview => ({
  reviewId: id, reviewerName: 'Reviewer ' + id, rating, comment, createTime: updateTime, updateTime, ...extra,
});
export { GoogleError };

export async function bootstrap() {
  const o = owner();
  // Each file starts with clean rate-limit buckets. Relies on files running serially (fileParallelism: false).
  await o.query('DELETE FROM rate_limits');
  // Every file starts from empty tenant data (clients cascade to everything below them), so files cannot affect each other.
  await o.query('DELETE FROM audit_log');
  await o.query('DELETE FROM clients');
  setPool(new Pool({ connectionString: process.env.TEST_APP_URL }));
  const fake = new FakeGoogle();
  setDependencies({ wrapper: new EnvKeyWrapper(randomBytes(32).toString('base64')), google: fake });
  const mkClient = async (name: string) => {
    const c = await o.query("INSERT INTO clients (name, allowed_return_urls) VALUES ($1, ARRAY['https://app.test/integrations']) RETURNING id", [name]);
    const k = generateApiKey();
    await o.query('INSERT INTO api_keys (client_id, key_id, secret_hash) VALUES ($1,$2,$3)', [c.rows[0].id, k.keyId, k.secretHash]);
    return { id: c.rows[0].id as string, key: k.key, keyId: k.keyId };
  };
  return { o, fake, mkClient };
}

export const bearer = (key: string) => new Request('https://reviews.test/x', { headers: { authorization: `Bearer ${key}` } });
