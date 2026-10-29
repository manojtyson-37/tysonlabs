import { hmac, randomToken, safeEqual } from './crypto';
import { rateLimit, unscoped, withScope } from './db';

export interface AuthedClient {
  clientId: string;
  apiKeyId: string;
  scopes: string[];
}

export class AuthError extends Error {
  constructor(public status: 401 | 403 | 429 = 401) {
    super('Unauthorized');
  }
}

function pepper(): string {
  const p = process.env.API_KEY_PEPPER;
  if (!p) throw new Error('API_KEY_PEPPER is not set');
  return p;
}

/** Key format: rk_live_<keyId>_<secret>. Only HMAC(secret) is stored. */
export function generateApiKey(): { key: string; keyId: string; secretHash: Buffer } {
  const keyId = randomToken(9).replace(/[_-]/g, 'x');
  const secret = randomToken(32);
  return { key: `rk_live_${keyId}_${secret}`, keyId, secretHash: hmac(pepper(), secret) };
}

function parseKey(key: string): { keyId: string; secret: string } | null {
  const m = /^rk_live_([A-Za-z0-9]{12})_([A-Za-z0-9_-]{43})$/.exec(key);
  return m ? { keyId: m[1], secret: m[2] } : null;
}

const FAKE_HASH = Buffer.alloc(32);

/**
 * Client IP from a header the platform sets and overwrites (Vercel), never from client-appendable X-Forwarded-For.
 * Returns null when it cannot be determined; callers must fail closed.
 */
export function clientIp(request: Request): string | null {
  const raw = request.headers.get('x-vercel-forwarded-for') ?? request.headers.get('x-real-ip');
  const ip = raw?.split(',')[0].trim().toLowerCase();
  return ip || null;
}

/** Limit for unauthenticated or pre-auth traffic, per IP. */
export async function limitByIp(request: Request, name: string, limit: number): Promise<void> {
  if (!(await rateLimit(`${name}:ip:${clientIp(request) ?? 'unknown'}`, limit))) throw new AuthError(429);
}

/** Validates `Authorization: Bearer rk_live_...`. Always compares a hash so timing does not reveal key existence. */
export async function authenticate(request: Request, requiredScope: string): Promise<AuthedClient> {
  await limitByIp(request, 'auth', 300);
  const header = request.headers.get('authorization') ?? '';
  const parsed = header.startsWith('Bearer ') ? parseKey(header.slice(7).trim()) : null;
  const presented = parsed ? hmac(pepper(), parsed.secret) : FAKE_HASH;

  const row = parsed
    ? await unscoped(async (db) => {
        const r = await db.query('SELECT * FROM auth_lookup_api_key($1)', [parsed.keyId]);
        return r.rows[0] as
          | { api_key_id: string; client_id: string; secret_hash: Buffer; scopes: string[]; revoked_at: Date | null; client_status: string; ip_allowlist: string[] }
          | undefined;
      })
    : undefined;

  const ok = safeEqual(presented, row?.secret_hash ?? FAKE_HASH) && !!row && !row.revoked_at && row.client_status === 'ACTIVE';
  if (!ok || !row) throw new AuthError(401);
  if (!row.scopes.includes(requiredScope)) throw new AuthError(403);
  if (row.ip_allowlist.length > 0) {
    const ip = clientIp(request);
    if (!ip || !row.ip_allowlist.map((a) => a.toLowerCase()).includes(ip)) throw new AuthError(403); // fail closed
  }
  if (!(await rateLimit(`client:${row.client_id}`, 600))) throw new AuthError(429);

  await withScope({ clientId: row.client_id }, (db) =>
    db.query('UPDATE api_keys SET last_used_at = now() WHERE id = $1 AND (last_used_at IS NULL OR last_used_at < now() - interval \'1 minute\')', [row.api_key_id]),
  ).catch(() => undefined); // bookkeeping must never fail a request

  return { clientId: row.client_id, apiKeyId: row.api_key_id, scopes: row.scopes };
}
