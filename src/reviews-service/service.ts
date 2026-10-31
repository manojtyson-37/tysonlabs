import { AuthedClient } from './apikeys';
import { baseUrl, getGoogle, getWrapper } from './container';
import { open, randomToken, seal, sha256 } from './crypto';
import { withScope, unscoped } from './db';
import { BUSINESS_SCOPE, GoogleError, GoogleLocation, pkcePair } from './google';

export class ServiceError extends Error {
  constructor(public status: number, public code: string) {
    super(code);
  }
}

const SESSION_TTL_MINUTES = 10;
const tokenAad = (clientId: string, tenantId: string) => `conn|${clientId}|${tenantId}`;
const pkceAad = (sessionId: string) => `pkce|${sessionId}`;
const PURGE_DAYS = 30;

export async function audit(db: import('pg').PoolClient, a: AuthedClient | null, clientId: string, tenantId: string | null, action: string, entity?: string) {
  await db.query(
    'INSERT INTO audit_log (client_id, tenant_id, actor_type, actor_ref, action, entity) VALUES ($1,$2,$3,$4,$5,$6)',
    [clientId, tenantId, a ? 'client' : 'system', a?.apiKeyId ?? null, action, entity ?? null],
  );
}

/** Resolves the client's own tenantRef to a tenant id, or 404. Never trusts a tenant id from the caller. */
export async function resolveTenant(a: AuthedClient, tenantRef: string): Promise<string> {
  if (!tenantRef || tenantRef.length > 200) throw new ServiceError(404, 'NOT_FOUND');
  const id = await withScope({ clientId: a.clientId }, async (db) => {
    const r = await db.query('SELECT id FROM tenants WHERE client_id = $1 AND external_ref = $2', [a.clientId, tenantRef]);
    return r.rows[0]?.id as string | undefined;
  });
  if (!id) throw new ServiceError(404, 'NOT_FOUND');
  return id;
}

/** Return URLs must match a pre-registered one on origin and path (query is ignored). No open redirects. */
function returnUrlAllowed(candidate: string, allowed: string[]): boolean {
  let c: URL;
  try {
    c = new URL(candidate);
  } catch {
    return false;
  }
  return allowed.some((entry) => {
    try {
      const e = new URL(entry);
      return e.origin === c.origin && e.pathname === c.pathname && (c.protocol === 'https:' || c.hostname === 'localhost');
    } catch {
      return false;
    }
  });
}

export async function createConnectSession(a: AuthedClient, input: { tenantRef: string; returnUrl: string }) {
  if (typeof input.tenantRef !== 'string' || !input.tenantRef || input.tenantRef.length > 200) throw new ServiceError(400, 'INVALID_TENANT_REF');
  if (typeof input.returnUrl !== 'string') throw new ServiceError(400, 'INVALID_RETURN_URL');

  return withScope({ clientId: a.clientId }, async (db) => {
    const client = await db.query('SELECT allowed_return_urls FROM clients WHERE id = $1', [a.clientId]);
    if (!returnUrlAllowed(input.returnUrl, client.rows[0]?.allowed_return_urls ?? [])) throw new ServiceError(400, 'RETURN_URL_NOT_ALLOWED');

    const cap = await db.query(
      `SELECT c.max_tenants, (SELECT count(*)::int FROM tenants WHERE client_id = c.id) AS n,
              EXISTS (SELECT 1 FROM tenants WHERE client_id = c.id AND external_ref = $2) AS exists
       FROM clients c WHERE c.id = $1`,
      [a.clientId, input.tenantRef],
    );
    if (!cap.rows[0].exists && cap.rows[0].n >= cap.rows[0].max_tenants) throw new ServiceError(429, 'TENANT_LIMIT_REACHED');
    const t = await db.query(
      `INSERT INTO tenants (client_id, external_ref) VALUES ($1,$2)
       ON CONFLICT (client_id, external_ref) DO UPDATE SET external_ref = EXCLUDED.external_ref RETURNING id`,
      [a.clientId, input.tenantRef],
    );
    const tenantId = t.rows[0].id as string;
    const secret = randomToken(32);
    const s = await db.query(
      `INSERT INTO connect_sessions (client_id, tenant_id, secret_hash, return_url, expires_at)
       VALUES ($1,$2,$3,$4, now() + ($5 || ' minutes')::interval) RETURNING id, expires_at`,
      [a.clientId, tenantId, sha256(secret), input.returnUrl, String(SESSION_TTL_MINUTES)],
    );
    await audit(db, a, a.clientId, tenantId, 'connect_session.created');
    return { url: `${baseUrl()}/api/v1/connect/${s.rows[0].id}.${secret}`, expiresAt: s.rows[0].expires_at as Date };
  });
}

/** Browser hits the one-time URL. Single use: the session is consumed here and becomes bound to a state value. */
export async function startConsent(token: string): Promise<string> {
  const m = /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\.([A-Za-z0-9_-]{43})$/.exec(token);
  if (!m) throw new ServiceError(404, 'NOT_FOUND');
  const state = randomToken(32);
  const { verifier, challenge } = pkcePair();
  const sealed = await seal(getWrapper(), verifier, pkceAad(m[1]));
  const opened = await unscoped(async (db) => {
    const r = await db.query('SELECT * FROM auth_open_connect_session($1,$2,$3,$4)', [m[1], sha256(m[2]), sha256(state), JSON.stringify(sealed)]);
    return r.rows[0] as { client_id: string; tenant_id: string } | undefined;
  });
  if (!opened) throw new ServiceError(410, 'LINK_EXPIRED_OR_USED');
  return getGoogle().authUrl({ state, codeChallenge: challenge });
}

function withStatus(returnUrl: string, status: string): string {
  const u = new URL(returnUrl);
  u.searchParams.set('status', status); // status code only, never tokens
  return u.toString();
}

/** Google redirects the browser here. Returns the URL to send the browser back to. */
export async function completeConsent(params: { state: string | null; code: string | null; error: string | null }): Promise<string> {
  if (!params.state) throw new ServiceError(400, 'INVALID_STATE');
  const session = await unscoped(async (db) => {
    const r = await db.query('SELECT * FROM auth_complete_connect_session($1)', [sha256(params.state!)]);
    return r.rows[0] as { id: string; client_id: string; tenant_id: string; return_url: string; code_verifier_ciphertext: string } | undefined;
  });
  if (!session) throw new ServiceError(400, 'INVALID_STATE');
  const scope = { clientId: session.client_id, tenantId: session.tenant_id };
  if (params.error || !params.code) {
    await withScope(scope, (db) => audit(db, null, session.client_id, session.tenant_id, 'connect.denied'));
    return withStatus(session.return_url, 'denied');
  }

  try {
    const google = getGoogle();
    const wrapper = getWrapper();
    const verifier = await open(wrapper, JSON.parse(session.code_verifier_ciphertext), pkceAad(session.id));
    const tokens = await google.exchangeCode(params.code, verifier);
    if (!tokens.scope?.split(' ').includes(BUSINESS_SCOPE) || !tokens.refresh_token) {
      if (tokens.refresh_token) await google.revoke(tokens.refresh_token);
      await withScope(scope, (db) => audit(db, null, session.client_id, session.tenant_id, 'connect.insufficient_permission'));
      return withStatus(session.return_url, 'insufficient_permission');
    }
    const email = await google.userEmail(tokens.access_token).catch(() => undefined);
    const sealed = await seal(wrapper, tokens.refresh_token, tokenAad(session.client_id, session.tenant_id));

    const previous = await withScope(scope, async (db) => {
      const prev = await db.query('SELECT token_ciphertext, wrapped_data_key, google_email FROM connections WHERE tenant_id = $1', [session.tenant_id]);
      await db.query(
        `INSERT INTO connections (client_id, tenant_id, status, google_email, scope, token_ciphertext, wrapped_data_key, key_version, purge_reviews_after)
         VALUES ($1,$2,'ACTIVE',$3,$4,$5,$6,$7,NULL)
         ON CONFLICT (tenant_id) DO UPDATE SET status='ACTIVE', google_email=$3, scope=$4, token_ciphertext=$5,
           wrapped_data_key=$6, key_version=$7, purge_reviews_after=NULL, updated_at=now()`,
        [session.client_id, session.tenant_id, email ?? null, tokens.scope, sealed.ciphertext, sealed.wrappedDataKey, sealed.keyVersion],
      );
      const before = prev.rows[0] as { token_ciphertext: string | null; wrapped_data_key: string | null; google_email: string | null } | undefined;
      if (before && before.google_email !== (email ?? null)) {
        // A different Google account may not own the linked locations: drop the links, they must be re-linked.
        await db.query('DELETE FROM location_links WHERE tenant_id = $1', [session.tenant_id]);
      }
      await audit(db, null, session.client_id, session.tenant_id, 'connect.completed');
      return before;
    });
    // Replacing an earlier connection: revoke the old refresh token so it cannot linger at Google.
    if (previous?.token_ciphertext && previous.wrapped_data_key) {
      const old = await open(wrapper, { ciphertext: previous.token_ciphertext, wrappedDataKey: previous.wrapped_data_key }, tokenAad(session.client_id, session.tenant_id)).catch(() => null);
      if (old && old !== tokens.refresh_token) await google.revoke(old);
    }
    return withStatus(session.return_url, 'connected');
  } catch {
    await withScope(scope, (db) => audit(db, null, session.client_id, session.tenant_id, 'connect.failed')).catch(() => undefined);
    return withStatus(session.return_url, 'error');
  }
}

export async function getConnection(a: AuthedClient, tenantRef: string) {
  const tenantId = await resolveTenant(a, tenantRef);
  return withScope({ clientId: a.clientId, tenantId }, async (db) => {
    const r = await db.query('SELECT status, google_email, updated_at FROM connections WHERE tenant_id = $1', [tenantId]);
    const c = r.rows[0];
    return c
      ? { connected: c.status === 'ACTIVE', status: c.status as string, googleEmail: (c.google_email as string | null) ?? null, updatedAt: c.updated_at as Date }
      : { connected: false, status: 'NONE', googleEmail: null, updatedAt: null };
  });
}

/** Returns true when Google confirmed the revocation (or there was no token to revoke). */
export async function disconnect(a: AuthedClient, tenantRef: string): Promise<boolean> {
  const tenantId = await resolveTenant(a, tenantRef);
  const scope = { clientId: a.clientId, tenantId };
  const row = await withScope(scope, async (db) => {
    const r = await db.query('SELECT token_ciphertext, wrapped_data_key FROM connections WHERE tenant_id = $1', [tenantId]);
    return r.rows[0] as { token_ciphertext: string | null; wrapped_data_key: string | null } | undefined;
  });
  let revoked = true;
  if (row?.token_ciphertext && row.wrapped_data_key) {
    const token = await open(getWrapper(), { ciphertext: row.token_ciphertext, wrappedDataKey: row.wrapped_data_key }, tokenAad(a.clientId, tenantId)).catch(() => null);
    revoked = token ? await getGoogle().revoke(token) : false;
  }
  await withScope(scope, async (db) => {
    await db.query(
      `UPDATE connections SET status='DISCONNECTED', token_ciphertext=NULL, wrapped_data_key=NULL, key_version=NULL,
         purge_reviews_after = now() + ($2 || ' days')::interval, updated_at=now() WHERE tenant_id = $1`,
      [tenantId, String(PURGE_DAYS)],
    );
    await db.query('DELETE FROM location_links WHERE tenant_id = $1', [tenantId]);
    await audit(db, a, a.clientId, tenantId, 'connection.disconnected');
  });
  return revoked;
}

/** Gets a short-lived access token in memory. Marks the connection NEEDS_REAUTH if Google says the grant is gone. */
export async function accessTokenFor(a: { clientId: string }, tenantId: string): Promise<string> {
  const scope = { clientId: a.clientId, tenantId };
  const row = await withScope(scope, async (db) => {
    const r = await db.query("SELECT token_ciphertext, wrapped_data_key FROM connections WHERE tenant_id = $1 AND status = 'ACTIVE'", [tenantId]);
    return r.rows[0] as { token_ciphertext: string; wrapped_data_key: string } | undefined;
  });
  if (!row?.token_ciphertext) throw new ServiceError(409, 'NOT_CONNECTED');
  const refreshToken = await open(getWrapper(), { ciphertext: row.token_ciphertext, wrappedDataKey: row.wrapped_data_key }, tokenAad(a.clientId, tenantId));
  try {
    return (await getGoogle().refresh(refreshToken)).access_token;
  } catch (err) {
    if (err instanceof GoogleError && err.kind === 'invalid_grant') {
      // Optimistic lock on the exact token we tried, so a concurrent reconnect is not clobbered.
      await withScope(scope, (db) =>
        db.query("UPDATE connections SET status='NEEDS_REAUTH', updated_at=now() WHERE tenant_id=$1 AND token_ciphertext=$2", [tenantId, row.token_ciphertext]),
      );
      throw new ServiceError(409, 'NEEDS_REAUTH');
    }
    throw new ServiceError(502, 'GOOGLE_ERROR');
  }
}

export async function availableLocations(a: AuthedClient, tenantRef: string): Promise<GoogleLocation[]> {
  const tenantId = await resolveTenant(a, tenantRef);
  const token = await accessTokenFor(a, tenantId);
  try {
    return await getGoogle().listLocations(token);
  } catch {
    throw new ServiceError(502, 'GOOGLE_ERROR');
  }
}

export async function linkLocation(a: AuthedClient, tenantRef: string, googleLocationId: string, branchRef?: string) {
  const live = await availableLocations(a, tenantRef);
  const match = live.find((l) => l.googleLocationId === googleLocationId);
  if (!match) throw new ServiceError(404, 'LOCATION_NOT_AVAILABLE');
  const tenantId = await resolveTenant(a, tenantRef);
  try {
    await withScope({ clientId: a.clientId, tenantId }, async (db) => {
      await db.query(
        `INSERT INTO location_links (client_id, tenant_id, google_account_id, google_location_id, name, branch_ref)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (google_location_id) DO UPDATE SET branch_ref = EXCLUDED.branch_ref, name = EXCLUDED.name
         WHERE location_links.tenant_id = EXCLUDED.tenant_id`,
        [a.clientId, tenantId, match.googleAccountId, match.googleLocationId, match.name, branchRef ?? null],
      );
      const mine = await db.query('SELECT 1 FROM location_links WHERE google_location_id = $1 AND tenant_id = $2', [googleLocationId, tenantId]);
      if (mine.rowCount === 0) throw new ServiceError(409, 'LOCATION_UNAVAILABLE'); // linked elsewhere; do not say where
      await audit(db, a, a.clientId, tenantId, 'location.linked', googleLocationId);
    });
  } catch (err) {
    // 42501: ON CONFLICT hit a row another tenant owns and RLS refused it. 23505: raced insert. Same answer either way.
    const code = (err as { code?: string }).code;
    if (code === '42501' || code === '23505') throw new ServiceError(409, 'LOCATION_UNAVAILABLE');
    throw err;
  }
  return { googleLocationId, name: match.name, branchRef: branchRef ?? null };
}

export async function unlinkLocation(a: AuthedClient, tenantRef: string, googleLocationId: string) {
  const tenantId = await resolveTenant(a, tenantRef);
  await withScope({ clientId: a.clientId, tenantId }, async (db) => {
    await db.query('DELETE FROM location_links WHERE tenant_id = $1 AND google_location_id = $2', [tenantId, googleLocationId]);
    await audit(db, a, a.clientId, tenantId, 'location.unlinked', googleLocationId);
  });
}
