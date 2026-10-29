import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Pool } from 'pg';
import { bootstrap } from './helpers';
import { authenticate } from '@/reviews-service/apikeys';
import { rateLimit } from '@/reviews-service/db';
import { createConnectSession, completeConsent, linkLocation, startConsent } from '@/reviews-service/service';
import { handleError } from '@/reviews-service/http';
import { AuthError } from '@/reviews-service/apikeys';
import { POST as postSessions } from '@/app/api/v1/connect-sessions/route';
import { GET as getHealth } from '@/app/api/v1/healthz/route';
import { GET as getConnect } from '@/app/api/v1/connect/[token]/route';
import { GET as getCallback } from '@/app/api/v1/oauth/callback/route';
import { GET as getConn, DELETE as delConn } from '@/app/api/v1/tenants/[ref]/connection/route';
import { PUT as putLoc, DELETE as delLoc } from '@/app/api/v1/tenants/[ref]/locations/[locationId]/route';
import { NextRequest } from 'next/server';
import { unlinkLocation } from '@/reviews-service/service';

let ctx: Awaited<ReturnType<typeof bootstrap>>;
let A: { id: string; key: string };
let B: { id: string; key: string };
const URL_ = 'https://reviews.test';
const req = (method: string, path: string, key?: string, body?: unknown, ip = '198.51.100.20') =>
  new Request(`${URL_}${path}`, {
    method,
    headers: { 'x-vercel-forwarded-for': ip, ...(key ? { authorization: `Bearer ${key}` } : {}), ...(body !== undefined ? { 'content-type': 'application/json' } : {}) },
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
  });

async function connect(client: { key: string }, ref: string) {
  const a = await authenticate(req('GET', '/x', client.key), 'connect');
  const { url } = await createConnectSession(a, { tenantRef: ref, returnUrl: 'https://app.test/integrations' });
  const state = new URL(await startConsent(url.split('/connect/')[1])).searchParams.get('state')!;
  await completeConsent({ state, code: 'c', error: null });
}

beforeAll(async () => {
  ctx = await bootstrap();
  A = await ctx.mkClient('routes-A');
  B = await ctx.mkClient('routes-B');
});
afterAll(async () => {
  await ctx.o.query('DELETE FROM rate_limits'); // do not leave exhausted buckets for other files
  await ctx.o.end();
});

describe('http layer', () => {
  it('maps errors to JSON without echoing unknown error messages', async () => {
    const unknown = handleError(new Error('db password is hunter2'));
    expect(unknown.status).toBe(500);
    expect(JSON.stringify(await unknown.json())).not.toContain('hunter2');
    expect(handleError(new AuthError(401)).status).toBe(401);
    expect(handleError(new AuthError(429)).status).toBe(429);
  });

  it('POST /connect-sessions: 401 without a key, 400 for bad bodies, 200 + no-store with a valid one', async () => {
    expect((await postSessions(req('POST', '/api/v1/connect-sessions', undefined, {}))).status).toBe(401);
    for (const body of ['null', '[]', '"str"', '{not json']) {
      expect((await postSessions(req('POST', '/api/v1/connect-sessions', A.key, body))).status, body).toBe(400);
    }
    expect((await postSessions(req('POST', '/api/v1/connect-sessions', A.key, { tenantRef: 5, returnUrl: 'https://app.test/integrations' }))).status).toBe(400);
    const ok = await postSessions(req('POST', '/api/v1/connect-sessions', A.key, { tenantRef: 'r1', returnUrl: 'https://app.test/integrations' }));
    expect(ok.status).toBe(200);
    expect(ok.headers.get('cache-control')).toBe('no-store');
    expect((await ok.json()).url).toMatch(/^https:\/\/reviews\.test\/api\/v1\/connect\//);
  });

  it('GET /connect/[token] redirects with 303 once, then 410; bad token is 404; callback rejects missing state', async () => {
    const created = await (await postSessions(req('POST', '/api/v1/connect-sessions', A.key, { tenantRef: 'r2', returnUrl: 'https://app.test/integrations' }))).json();
    const token = created.url.split('/connect/')[1];
    const first = await getConnect(req('GET', `/api/v1/connect/${token}`), { params: Promise.resolve({ token }) });
    expect(first.status).toBe(303);
    expect(first.headers.get('location')).toContain('accounts.google.test');
    const again = await getConnect(req('GET', `/api/v1/connect/${token}`), { params: Promise.resolve({ token }) });
    expect(again.status).toBe(410);
    expect((await getConnect(req('GET', '/x'), { params: Promise.resolve({ token: 'nope' }) })).status).toBe(404);
    expect((await getCallback(new NextRequest(`${URL_}/api/v1/oauth/callback`, { headers: { 'x-vercel-forwarded-for': '198.51.100.21' } }))).status).toBe(400);
  });

  it('connection routes: GET needs read, DELETE needs write, unknown tenant is 404', async () => {
    await connect(A, 'conn-r');
    const ctxFor = (ref: string) => ({ params: Promise.resolve({ ref }) });
    const ok = await getConn(req('GET', '/x', A.key), ctxFor('conn-r'));
    expect(ok.status).toBe(200);
    expect((await ok.json()).connected).toBe(true);
    expect((await getConn(req('GET', '/x', A.key), ctxFor('missing'))).status).toBe(404);
    expect((await getConn(req('GET', '/x', B.key), ctxFor('conn-r'))).status).toBe(404); // other client's tenant
    await ctx.o.query("UPDATE api_keys SET scopes = '{connect}' WHERE client_id = $1", [B.id]);
    expect((await delConn(req('DELETE', '/x', B.key), ctxFor('conn-r'))).status).toBe(403); // connect-only key cannot write
    expect((await delConn(req('DELETE', '/x', A.key), ctxFor('conn-r'))).status).toBe(200);
    await ctx.o.query("UPDATE api_keys SET scopes = '{connect,read,write}' WHERE client_id = $1", [B.id]);
  });

  it('PUT location ignores an oversized branchRef and rejects array bodies; healthz is 200', async () => {
    await connect(A, 'loc-route');
    ctx.fake.locations = [{ googleAccountId: '1', googleLocationId: 'LOC-ROUTE', name: 'Route clinic' }];
    const c = (ref: string, locationId: string) => ({ params: Promise.resolve({ ref, locationId }) });
    const bad = await putLoc(req('PUT', '/x', A.key, []), c('loc-route', 'LOC-ROUTE'));
    expect(bad.status).toBe(400);
    const ok = await putLoc(req('PUT', '/x', A.key, { branchRef: 'x'.repeat(201) }), c('loc-route', 'LOC-ROUTE'));
    expect(ok.status).toBe(200);
    expect((await ok.json()).branchRef).toBeNull();
    expect((await delLoc(req('DELETE', '/x', A.key), c('loc-route', 'LOC-ROUTE'))).status).toBe(200);
    ctx.fake.locations = [{ googleAccountId: '1', googleLocationId: 'LOC1', name: 'Clinic A' }];
    expect((await getHealth()).status).toBe(200);
  });
});

describe('rate limiting end to end', () => {
  it('authenticate returns 429 once the per-IP limit is exceeded, and other IPs are unaffected', async () => {
    const ip = '203.0.113.99';
    for (let i = 0; i < 300; i++) await rateLimit(`auth:ip:${ip}`, 300);
    await expect(authenticate(req('GET', '/x', A.key, undefined, ip), 'read')).rejects.toMatchObject({ status: 429 });
    await expect(authenticate(req('GET', '/x', A.key, undefined, '203.0.113.100'), 'read')).resolves.toBeTruthy();
  });

  it('the public connect route is rate limited per IP', async () => {
    const ip = '203.0.113.77';
    for (let i = 0; i < 60; i++) await rateLimit(`connect:ip:${ip}`, 60);
    const r = await getConnect(req('GET', '/x', undefined, undefined, ip), { params: Promise.resolve({ token: 'anything' }) });
    expect(r.status).toBe(429);
  });

  it('requests with no trusted IP share one bucket (fail closed)', async () => {
    const noIp = new Request(`${URL_}/x`, { headers: { authorization: `Bearer ${A.key}` } });
    for (let i = 0; i < 300; i++) await rateLimit('auth:ip:unknown', 300);
    await expect(authenticate(noIp, 'read')).rejects.toMatchObject({ status: 429 });
  });

  it('rate-limit window resets after it elapses', async () => {
    const bucket = `reset:${Math.random()}`;
    expect(await rateLimit(bucket, 1, 1)).toBe(true);
    expect(await rateLimit(bucket, 1, 1)).toBe(false);
    await new Promise((r) => setTimeout(r, 1100));
    expect(await rateLimit(bucket, 1, 1)).toBe(true);
  });
});

describe('pre-login database functions and grants', () => {
  it('the app role cannot read rate_limits, insert api keys, or change api key secrets', async () => {
    const app = new Pool({ connectionString: process.env.TEST_APP_URL });
    await expect(app.query('SELECT * FROM rate_limits')).rejects.toThrow(/permission denied/);
    await expect(app.query("INSERT INTO api_keys (client_id, key_id, secret_hash) VALUES (gen_random_uuid(), 'x', '\\x00')")).rejects.toThrow(/permission denied/);
    await expect(app.query("UPDATE api_keys SET secret_hash = '\\x00'")).rejects.toThrow(/permission denied/);
    await expect(app.query('DELETE FROM audit_log')).rejects.toThrow(/permission denied/);
    await app.end();
  });

  it('auth functions return nothing for unknown keys, states and sessions, and exactly one row for a known key', async () => {
    const app = new Pool({ connectionString: process.env.TEST_APP_URL });
    expect((await app.query("SELECT * FROM auth_lookup_api_key('nonexistent')")).rowCount).toBe(0);
    const keyId = (await ctx.o.query('SELECT key_id FROM api_keys WHERE client_id = $1', [A.id])).rows[0].key_id;
    const one = await app.query('SELECT * FROM auth_lookup_api_key($1)', [keyId]);
    expect(one.rowCount).toBe(1);
    expect(Object.keys(one.rows[0]).sort()).toEqual(['api_key_id', 'client_id', 'client_status', 'ip_allowlist', 'revoked_at', 'scopes', 'secret_hash']);
    expect((await app.query("SELECT * FROM auth_complete_connect_session('\\x00')")).rowCount).toBe(0);
    expect((await app.query("SELECT * FROM auth_open_connect_session(gen_random_uuid(), '\\x00', '\\x00', 'x')")).rowCount).toBe(0);
    await app.end();
  });

  it('location_links and audit_log are invisible across clients, even through a tenant scope', async () => {
    const { withScope } = await import('@/reviews-service/db');
    await connect(A, 'iso-links');
    const w = await authenticate(req('GET', '/x', A.key), 'write');
    ctx.fake.locations = [{ googleAccountId: '1', googleLocationId: 'LOC-ISO', name: 'Iso' }];
    await linkLocation(w, 'iso-links', 'LOC-ISO');
    ctx.fake.locations = [{ googleAccountId: '1', googleLocationId: 'LOC1', name: 'Clinic A' }];
    await withScope({ clientId: B.id }, async (db) => {
      expect((await db.query('SELECT * FROM location_links')).rowCount).toBe(0);
      expect((await db.query('SELECT * FROM audit_log')).rowCount).toBe(0);
      expect((await db.query('DELETE FROM location_links')).rowCount).toBe(0);
    });
    const still = await ctx.o.query("SELECT 1 FROM location_links WHERE google_location_id = 'LOC-ISO'");
    expect(still.rowCount).toBe(1);
  });
});

describe('unlinkLocation', () => {
  it("is a no-op for a location that belongs to another tenant, and works for the owner", async () => {
    await connect(A, 'unlink-a');
    await connect(A, 'unlink-b');
    ctx.fake.locations = [{ googleAccountId: '1', googleLocationId: 'LOC-UNLINK', name: 'U' }];
    const w = await authenticate(req('GET', '/x', A.key), 'write');
    await linkLocation(w, 'unlink-a', 'LOC-UNLINK');
    await unlinkLocation(w, 'unlink-b', 'LOC-UNLINK'); // wrong tenant
    expect((await ctx.o.query("SELECT 1 FROM location_links WHERE google_location_id='LOC-UNLINK'")).rowCount).toBe(1);
    await unlinkLocation(w, 'unlink-a', 'LOC-UNLINK');
    expect((await ctx.o.query("SELECT 1 FROM location_links WHERE google_location_id='LOC-UNLINK'")).rowCount).toBe(0);
    ctx.fake.locations = [{ googleAccountId: '1', googleLocationId: 'LOC1', name: 'Clinic A' }];
  });
});
