import { Pool } from 'pg';
import { randomBytes } from 'node:crypto';
import { setDependencies } from '@/reviews-service/container';
import { EnvKeyWrapper } from '@/reviews-service/crypto';
import { setPool } from '@/reviews-service/db';
import { generateApiKey } from '@/reviews-service/apikeys';
import type { GoogleGateway, GoogleLocation } from '@/reviews-service/google';

process.env.API_KEY_PEPPER = 'test-pepper';
process.env.REVIEWS_BASE_URL = 'https://reviews.test';

export const owner = () => new Pool({ connectionString: process.env.TEST_OWNER_URL });

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
  async revoke(t: string) {
    this.revoked.push(t);
  }
  async userEmail() {
    return this.email;
  }
  async listLocations() {
    return this.locations;
  }
}

export async function bootstrap() {
  const o = owner();
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
