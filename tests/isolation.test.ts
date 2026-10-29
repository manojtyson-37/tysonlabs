import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Pool } from 'pg';
import { bearer, bootstrap } from './helpers';
import { authenticate, AuthError } from '@/reviews-service/apikeys';
import { withScope, rateLimit, setPool } from '@/reviews-service/db';
import { createConnectSession, completeConsent, startConsent, getConnection, disconnect, linkLocation, availableLocations, ServiceError } from '@/reviews-service/service';
import { open, seal } from '@/reviews-service/crypto';
import { getWrapper } from '@/reviews-service/container';

let ctx: Awaited<ReturnType<typeof bootstrap>>;
let A: { id: string; key: string; keyId: string };
let B: { id: string; key: string; keyId: string };

async function connect(client: { id: string; key: string }, tenantRef: string, code = 'c1') {
  const a = await authenticate(bearer(client.key), 'connect');
  const { url } = await createConnectSession(a, { tenantRef, returnUrl: 'https://app.test/integrations' });
  const google = await startConsent(url.split('/connect/')[1]);
  const state = new URL(google).searchParams.get('state')!;
  const back = await completeConsent({ state, code, error: null });
  return { a, url, state, back };
}

beforeAll(async () => {
  ctx = await bootstrap();
  A = await ctx.mkClient('SDPC');
  B = await ctx.mkClient('Other client');
});
afterAll(async () => ctx.o.end());

describe('row-level security', () => {
  it('app role is not an owner and cannot bypass RLS', async () => {
    const app = new Pool({ connectionString: process.env.TEST_APP_URL });
    const r = await app.query("SELECT rolsuper, rolbypassrls FROM pg_roles WHERE rolname = current_user");
    expect(r.rows[0]).toEqual({ rolsuper: false, rolbypassrls: false });
    await app.end();
  });

  it('a query with no scope sees nothing, even without a WHERE clause', async () => {
    await connect(A, 'clinic-1');
    const app = new Pool({ connectionString: process.env.TEST_APP_URL });
    for (const t of ['tenants', 'connections', 'connect_sessions', 'audit_log', 'api_keys', 'clients']) {
      expect((await app.query(`SELECT * FROM ${t}`)).rowCount).toBe(0);
    }
    await app.end();
  });

  it("client B's scope cannot read, update or delete client A's rows even with no filter", async () => {
    await connect(A, 'clinic-2');
    await withScope({ clientId: B.id }, async (db) => {
      expect((await db.query('SELECT * FROM tenants')).rowCount).toBe(0);
      expect((await db.query('SELECT * FROM connections')).rowCount).toBe(0);
      expect((await db.query("UPDATE connections SET google_email = 'x'")).rowCount).toBe(0);
      expect((await db.query('DELETE FROM tenants')).rowCount).toBe(0);
    });
    const left = await ctx.o.query('SELECT count(*)::int n FROM tenants WHERE client_id = $1', [A.id]);
    expect(left.rows[0].n).toBeGreaterThan(0);
  });

  it('cannot insert rows for another client', async () => {
    await expect(
      withScope({ clientId: B.id }, (db) => db.query("INSERT INTO tenants (client_id, external_ref) VALUES ($1, 'sneaky')", [A.id])),
    ).rejects.toThrow(/row-level security/);
  });

  it('a tenant-scoped query cannot see sibling tenants of the same client', async () => {
    await connect(A, 'sib-1');
    await connect(A, 'sib-2');
    const t1 = (await ctx.o.query("SELECT id FROM tenants WHERE external_ref='sib-1' AND client_id=$1", [A.id])).rows[0].id;
    const seen = await withScope({ clientId: A.id, tenantId: t1 }, (db) => db.query('SELECT tenant_id FROM connections'));
    expect(seen.rows.map((r) => r.tenant_id)).toEqual([t1]);
  });
});

describe('api keys', () => {
  it('accepts a valid key and stores only a hash', async () => {
    const a = await authenticate(bearer(A.key), 'read');
    expect(a.clientId).toBe(A.id);
    const row = await ctx.o.query('SELECT secret_hash FROM api_keys WHERE key_id = $1', [A.keyId]);
    expect(A.key).not.toContain(row.rows[0].secret_hash.toString('utf8'));
    expect(row.rows[0].secret_hash.length).toBe(32);
  });

  it('rejects wrong secret, unknown key, malformed header, revoked key and suspended client', async () => {
    const wrong = A.key.slice(0, -3) + 'AAA';
    await expect(authenticate(bearer(wrong), 'read')).rejects.toBeInstanceOf(AuthError);
    await expect(authenticate(bearer('rk_live_zzzzzzzzzzzz_' + 'a'.repeat(43)), 'read')).rejects.toBeInstanceOf(AuthError);
    await expect(authenticate(new Request('https://x'), 'read')).rejects.toBeInstanceOf(AuthError);
    const C = await ctx.mkClient('temp');
    await ctx.o.query('UPDATE api_keys SET revoked_at = now() WHERE key_id = $1', [C.keyId]);
    await expect(authenticate(bearer(C.key), 'read')).rejects.toBeInstanceOf(AuthError);
    const D = await ctx.mkClient('temp2');
    await ctx.o.query("UPDATE clients SET status='SUSPENDED' WHERE id = $1", [D.id]);
    await expect(authenticate(bearer(D.key), 'read')).rejects.toBeInstanceOf(AuthError);
  });

  it('enforces scopes', async () => {
    const C = await ctx.mkClient('scoped');
    await ctx.o.query("UPDATE api_keys SET scopes = '{read}' WHERE key_id = $1", [C.keyId]);
    await expect(authenticate(bearer(C.key), 'write')).rejects.toMatchObject({ status: 403 });
  });
});

describe('connect flow', () => {
  it('rejects a return URL that is not pre-registered', async () => {
    const a = await authenticate(bearer(A.key), 'connect');
    await expect(createConnectSession(a, { tenantRef: 't', returnUrl: 'https://evil.test/integrations' })).rejects.toMatchObject({ code: 'RETURN_URL_NOT_ALLOWED' });
    await expect(createConnectSession(a, { tenantRef: 't', returnUrl: 'https://app.test/other' })).rejects.toMatchObject({ code: 'RETURN_URL_NOT_ALLOWED' });
  });

  it('connects, stores the refresh token envelope-encrypted and returns only a status code', async () => {
    const { back } = await connect(A, 'happy');
    expect(back).toBe('https://app.test/integrations?status=connected');
    const row = (await ctx.o.query("SELECT c.* FROM connections c JOIN tenants t ON t.id=c.tenant_id WHERE t.external_ref='happy'")).rows[0];
    expect(row.status).toBe('ACTIVE');
    expect(row.token_ciphertext).not.toContain('RT-');
    expect(await open(getWrapper(), { ciphertext: row.token_ciphertext, wrappedDataKey: row.wrapped_data_key }, `conn|${A.id}|${row.tenant_id}`)).toMatch(/^RT-c1/);
    expect(row.google_email).toBe('admin@clinic.test');
  });

  it('is single use: the one-time link and the OAuth state cannot be replayed', async () => {
    const { url, state } = await connect(A, 'replay');
    await expect(startConsent(url.split('/connect/')[1])).rejects.toMatchObject({ code: 'LINK_EXPIRED_OR_USED' });
    await expect(completeConsent({ state, code: 'again', error: null })).rejects.toMatchObject({ code: 'INVALID_STATE' });
  });

  it('rejects expired links and a guessed state', async () => {
    const a = await authenticate(bearer(A.key), 'connect');
    const { url } = await createConnectSession(a, { tenantRef: 'expired', returnUrl: 'https://app.test/integrations' });
    await ctx.o.query("UPDATE connect_sessions SET expires_at = now() - interval '1 minute'");
    await expect(startConsent(url.split('/connect/')[1])).rejects.toMatchObject({ code: 'LINK_EXPIRED_OR_USED' });
    await expect(completeConsent({ state: 'guess', code: 'x', error: null })).rejects.toMatchObject({ code: 'INVALID_STATE' });
    await expect(startConsent('not-a-token')).rejects.toBeInstanceOf(ServiceError);
  });

  it('refuses a connection without the Business Profile scope and revokes what it received', async () => {
    ctx.fake.scope = 'openid email';
    ctx.fake.revoked.length = 0;
    const { back } = await connect(A, 'noscope', 'noscope');
    ctx.fake.scope = 'openid email https://www.googleapis.com/auth/business.manage';
    expect(back).toContain('status=insufficient_permission');
    expect(ctx.fake.revoked.some((t) => t.startsWith('RT-noscope'))).toBe(true);
    const n = await ctx.o.query("SELECT count(*)::int n FROM connections c JOIN tenants t ON t.id=c.tenant_id WHERE t.external_ref='noscope'");
    expect(n.rows[0].n).toBe(0);
  });

  it('reports denial from the consent screen', async () => {
    const a = await authenticate(bearer(A.key), 'connect');
    const { url } = await createConnectSession(a, { tenantRef: 'denied', returnUrl: 'https://app.test/integrations' });
    const state = new URL(await startConsent(url.split('/connect/')[1])).searchParams.get('state')!;
    expect(await completeConsent({ state, code: null, error: 'access_denied' })).toContain('status=denied');
  });

  it('reconnecting revokes the previous refresh token at Google', async () => {
    await connect(A, 'again', 'first');
    ctx.fake.revoked.length = 0;
    await connect(A, 'again', 'second');
    expect(ctx.fake.revoked.some((t) => t.startsWith('RT-first'))).toBe(true);
  });
});

describe('tenant isolation through the service', () => {
  it("client B cannot see or act on client A's tenant: same ref resolves to B's own (empty) tenant or 404", async () => {
    await connect(A, 'shared-ref');
    const b = await authenticate(bearer(B.key), 'read');
    await expect(getConnection(b, 'shared-ref')).rejects.toMatchObject({ status: 404 });
    await expect(disconnect(await authenticate(bearer(B.key), 'write'), 'shared-ref')).rejects.toMatchObject({ status: 404 });
    const a = await authenticate(bearer(A.key), 'read');
    expect((await getConnection(a, 'shared-ref')).connected).toBe(true);
  });

  it('one Google location can belong to only one tenant, and the refusal does not say who has it', async () => {
    await connect(A, 'loc-a');
    await connect(B, 'loc-b');
    const a = await authenticate(bearer(A.key), 'write');
    const b = await authenticate(bearer(B.key), 'write');
    await linkLocation(a, 'loc-a', 'LOC1', 'branch-9');
    await expect(linkLocation(b, 'loc-b', 'LOC1')).rejects.toMatchObject({ status: 409, code: 'LOCATION_UNAVAILABLE' });
    await expect(linkLocation(a, 'loc-a', 'NOT-MINE')).rejects.toMatchObject({ status: 404 });
    const owner = await ctx.o.query("SELECT t.external_ref FROM location_links l JOIN tenants t ON t.id=l.tenant_id WHERE google_location_id='LOC1'");
    expect(owner.rows.map((r) => r.external_ref)).toEqual(['loc-a']);
  });

  it('a revoked Google grant marks the connection NEEDS_REAUTH', async () => {
    await connect(A, 'reauth');
    const a = await authenticate(bearer(A.key), 'read');
    const { GoogleError } = await import('@/reviews-service/google');
    ctx.fake.refreshError = new GoogleError('invalid_grant');
    await expect(availableLocations(a, 'reauth')).rejects.toMatchObject({ code: 'NEEDS_REAUTH' });
    ctx.fake.refreshError = null;
    expect((await getConnection(a, 'reauth')).status).toBe('NEEDS_REAUTH');
  });

  it('disconnect revokes at Google, deletes the token and links, and schedules purge', async () => {
    await connect(A, 'bye');
    const w = await authenticate(bearer(A.key), 'write');
    await linkLocation(w, 'bye', 'LOC1').catch(() => undefined);
    ctx.fake.revoked.length = 0;
    await disconnect(w, 'bye');
    expect(ctx.fake.revoked.length).toBe(1);
    const row = (await ctx.o.query("SELECT c.* FROM connections c JOIN tenants t ON t.id=c.tenant_id WHERE t.external_ref='bye'")).rows[0];
    expect(row).toMatchObject({ status: 'DISCONNECTED', token_ciphertext: null, wrapped_data_key: null });
    expect(row.purge_reviews_after).toBeTruthy();
    const links = await ctx.o.query("SELECT 1 FROM location_links l JOIN tenants t ON t.id=l.tenant_id WHERE t.external_ref='bye'");
    expect(links.rowCount).toBe(0);
  });

  it('audit log records actions without secrets', async () => {
    const rows = await ctx.o.query('SELECT action, entity, actor_ref FROM audit_log');
    expect(rows.rowCount).toBeGreaterThan(5);
    expect(JSON.stringify(rows.rows)).not.toMatch(/RT-|rk_live|Bearer/);
  });
});

describe('envelope encryption', () => {
  it('uses a distinct data key per secret and detects tampering', async () => {
    const w = getWrapper();
    const a = await seal(w, 'secret', 'aad');
    const b = await seal(w, 'secret', 'aad');
    expect(a.wrappedDataKey).not.toBe(b.wrappedDataKey);
    const [iv, tag] = a.ciphertext.split('.');
    await expect(open(w, { ciphertext: [iv, tag, Buffer.from('xx').toString('base64')].join('.'), wrappedDataKey: a.wrappedDataKey }, 'aad')).rejects.toThrow();
  });
});

describe('hardening', () => {
  it("a ciphertext copied to another tenant's connection cannot be decrypted (AAD binding)", async () => {
    await connect(A, 'aad-1');
    const row = (await ctx.o.query("SELECT c.* FROM connections c JOIN tenants t ON t.id=c.tenant_id WHERE t.external_ref='aad-1'")).rows[0];
    await expect(
      open(getWrapper(), { ciphertext: row.token_ciphertext, wrappedDataKey: row.wrapped_data_key }, `conn|${A.id}|some-other-tenant`),
    ).rejects.toThrow();
  });

  it('IP allowlist ignores a forged X-Forwarded-For and fails closed with no trusted IP', async () => {
    const C = await ctx.mkClient('ipc');
    await ctx.o.query("UPDATE clients SET ip_allowlist = ARRAY['203.0.113.7'] WHERE id = $1", [C.id]);
    const req = (h: Record<string, string>) => new Request('https://reviews.test/x', { headers: { authorization: `Bearer ${C.key}`, ...h } });
    await expect(authenticate(req({ 'x-forwarded-for': '203.0.113.7' }), 'read')).rejects.toMatchObject({ status: 403 });
    await expect(authenticate(req({}), 'read')).rejects.toMatchObject({ status: 403 });
    await expect(authenticate(req({ 'x-vercel-forwarded-for': '198.51.100.9' }), 'read')).rejects.toMatchObject({ status: 403 });
    expect((await authenticate(req({ 'x-vercel-forwarded-for': '203.0.113.7' }), 'read')).clientId).toBe(C.id);
  });

  it('rate limiter allows up to the limit then refuses, per bucket', async () => {
    const bucket = `t:${Math.random()}`;
    const results = [];
    for (let i = 0; i < 5; i++) results.push(await rateLimit(bucket, 3, 60));
    expect(results).toEqual([true, true, true, false, false]);
    expect(await rateLimit(`${bucket}:other`, 3, 60)).toBe(true);
  });

  it('caps tenants per client but still allows existing tenants', async () => {
    const C = await ctx.mkClient('capped');
    await ctx.o.query('UPDATE clients SET max_tenants = 2 WHERE id = $1', [C.id]);
    const a = await authenticate(bearer(C.key), 'connect');
    const mk = (ref: string) => createConnectSession(a, { tenantRef: ref, returnUrl: 'https://app.test/integrations' });
    await mk('t1');
    await mk('t2');
    await expect(mk('t3')).rejects.toMatchObject({ status: 429, code: 'TENANT_LIMIT_REACHED' });
    await expect(mk('t1')).resolves.toBeTruthy();
  });

  it('a client suspended mid-flow cannot complete an in-flight connection', async () => {
    const C = await ctx.mkClient('susp');
    const a = await authenticate(bearer(C.key), 'connect');
    const { url } = await createConnectSession(a, { tenantRef: 'x', returnUrl: 'https://app.test/integrations' });
    const state = new URL(await startConsent(url.split('/connect/')[1])).searchParams.get('state')!;
    await ctx.o.query("UPDATE clients SET status='SUSPENDED' WHERE id = $1", [C.id]);
    await expect(completeConsent({ state, code: 'c', error: null })).rejects.toMatchObject({ code: 'INVALID_STATE' });
  });

  it('reconnecting with a different Google account drops existing location links', async () => {
    await connect(A, 'swap');
    const w = await authenticate(bearer(A.key), 'write');
    ctx.fake.locations = [{ googleAccountId: '1', googleLocationId: 'LOC-SWAP', name: 'Swap clinic' }];
    await linkLocation(w, 'swap', 'LOC-SWAP', 'b1');
    const before = await ctx.o.query("SELECT 1 FROM location_links l JOIN tenants t ON t.id=l.tenant_id WHERE t.external_ref='swap'");
    expect(before.rowCount).toBe(1);
    ctx.fake.email = 'someone-else@clinic.test';
    await connect(A, 'swap', 'swap2');
    ctx.fake.email = 'admin@clinic.test';
    ctx.fake.locations = [{ googleAccountId: '1', googleLocationId: 'LOC1', name: 'Clinic A' }];
    const after = await ctx.o.query("SELECT 1 FROM location_links l JOIN tenants t ON t.id=l.tenant_id WHERE t.external_ref='swap'");
    expect(after.rowCount).toBe(0);
  });

  it('a malformed connect token is a 404, not a server error', async () => {
    await expect(startConsent('-'.repeat(36) + '.' + 'a'.repeat(43))).rejects.toMatchObject({ status: 404 });
  });

  it('refuses to run as the owner role (RLS-bypassing configuration)', async () => {
    const real = new Pool({ connectionString: process.env.TEST_APP_URL });
    setPool(new Pool({ connectionString: process.env.TEST_OWNER_URL }));
    await expect(withScope({ clientId: A.id }, async () => 1)).rejects.toThrow(/restricted app role/);
    setPool(real);
  });
});
