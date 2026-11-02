import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { bearer, bootstrap } from './helpers';
import { authenticate, AuthedClient } from '@/reviews-service/apikeys';
import { signToken, verifyToken } from '@/reviews-service/signed';
import { OAUTH_COOKIE, SignInGateway, finishSignIn, setSignIn, startSignIn } from '@/reviews-service/signin';
import { listMembers, membershipsFor, provisionBusiness, recordLogin } from '@/reviews-service/members';
import { authorise, emailFromCookie, makeSessionCookie, type DashSession } from '@/reviews-service/dash-session';

let ctx: Awaited<ReturnType<typeof bootstrap>>;
let A: { id: string; key: string };
let B: { id: string; key: string };
let a: AuthedClient;
let b: AuthedClient;

beforeAll(async () => {
  process.env.DASHBOARD_SESSION_SECRET = 'test-dashboard-session-secret-0123456789';
  ctx = await bootstrap();
  A = await ctx.mkClient('dash-A');
  B = await ctx.mkClient('dash-B');
  a = await authenticate(bearer(A.key), 'write');
  b = await authenticate(bearer(B.key), 'write');
  process.env.DASHBOARD_CLIENT_ID = A.id;
});
afterAll(async () => {
  setSignIn(undefined);
  await ctx.o.query('DELETE FROM rate_limits');
  await ctx.o.end();
});

describe('signed tokens', () => {
  it('verifies, and rejects tampering, expiry, another purpose and another secret', () => {
    const t = signToken({ email: 'x@y.in' }, 'p', 60);
    expect(verifyToken<{ email: string }>(t, 'p')?.email).toBe('x@y.in');
    expect(verifyToken(t, 'other-purpose')).toBeNull();
    expect(verifyToken(`${t}x`, 'p')).toBeNull();
    expect(verifyToken(`${t}.junk`, 'p')).toBeNull();
    expect(verifyToken(signToken({ email: 'x@y.in' }, 'p', 60, Date.now() - 120_000), 'p')).toBeNull(); // expired
    const [body] = t.split('.');
    const forged = Buffer.from(JSON.stringify({ email: 'admin@y.in', x: Date.now() + 1e9 })).toString('base64url');
    expect(verifyToken(`${forged}.${t.split('.')[1]}`, 'p')).toBeNull(); // payload swapped, signature kept
    expect(body).toBeTruthy();
    expect(verifyToken(undefined, 'p')).toBeNull();
    process.env.DASHBOARD_SESSION_SECRET = 'a-different-secret-value-0123456789';
    expect(verifyToken(t, 'p')).toBeNull();
    process.env.DASHBOARD_SESSION_SECRET = 'test-dashboard-session-secret-0123456789';
  });

  it('session cookies carry only a verified email and expire', () => {
    expect(emailFromCookie(makeSessionCookie('owner@clinic.in'))).toBe('owner@clinic.in');
    expect(emailFromCookie('nonsense')).toBeNull();
    expect(emailFromCookie(signToken({ email: 'a@b.in' }, 'some-other-purpose', 60))).toBeNull(); // a sign-in start cookie is not a session
  });
});

describe('Google sign-in flow', () => {
  const fake = (r: { email: string; emailVerified: boolean } | Error): SignInGateway => ({
    authUrl: ({ state, codeChallenge }) => `https://accounts.test/auth?state=${state}&cc=${codeChallenge}&scope=openid+email`,
    exchange: async () => { if (r instanceof Error) throw r; return r; },
  });
  const stateOf = (url: string) => new URL(url).searchParams.get('state')!;

  it('returns the verified email only for a matching state and an unexpired start cookie', async () => {
    setSignIn(fake({ email: 'owner@clinic.in', emailVerified: true }));
    const { url, cookie } = startSignIn();
    expect(url).toContain('scope=openid+email'); // no Business Profile scope for sign-in
    expect(await finishSignIn('code', stateOf(url), cookie)).toBe('owner@clinic.in');
  });

  it.each([
    ['wrong state', (s: string) => `${s}x`],
    ['no state', () => null],
  ])('rejects %s', async (_n, mutate) => {
    setSignIn(fake({ email: 'owner@clinic.in', emailVerified: true }));
    const { url, cookie } = startSignIn();
    expect(await finishSignIn('code', mutate(stateOf(url)), cookie)).toBeNull();
  });

  it('rejects a missing code or cookie, a start cookie from elsewhere, an unverified email and a Google failure', async () => {
    setSignIn(fake({ email: 'owner@clinic.in', emailVerified: true }));
    const { url, cookie } = startSignIn();
    expect(await finishSignIn(null, stateOf(url), cookie)).toBeNull();
    expect(await finishSignIn('code', stateOf(url), undefined)).toBeNull();
    expect(await finishSignIn('code', stateOf(url), makeSessionCookie('owner@clinic.in'))).toBeNull(); // wrong kind of cookie
    setSignIn(fake({ email: 'owner@clinic.in', emailVerified: false }));
    const s2 = startSignIn();
    expect(await finishSignIn('code', stateOf(s2.url), s2.cookie)).toBeNull();
    setSignIn(fake(new Error('google down')));
    const s3 = startSignIn();
    expect(await finishSignIn('code', stateOf(s3.url), s3.cookie)).toBeNull();
    expect(OAUTH_COOKIE).toBe('tl_dash_oauth');
  });
});

describe('members and access', () => {
  it('provisioning creates the business and gives an email access, case-insensitively', async () => {
    await provisionBusiness(a, { ref: 'clinic-one', ownerEmail: 'Owner@Clinic.IN' }, 'admin@tysonlabs.in');
    const m = await membershipsFor('owner@clinic.in');
    expect(m).toHaveLength(1);
    expect(m[0]).toMatchObject({ clientId: A.id, ref: 'clinic-one', role: 'owner' });
    expect(await membershipsFor('  OWNER@clinic.in ')).toHaveLength(1);
  });

  it('an email with no membership, or a malformed one, gets nothing', async () => {
    expect(await membershipsFor('stranger@nowhere.in')).toEqual([]);
    expect(await membershipsFor('not-an-email')).toEqual([]);
    expect(await membershipsFor('')).toEqual([]);
  });

  it('adds staff to an existing business, rejects bad names and emails, and records a sign-in', async () => {
    await provisionBusiness(a, { ref: 'clinic-one', ownerEmail: 'staff@clinic.in', role: 'staff' }, 'admin@tysonlabs.in');
    expect((await listMembers(a, 'clinic-one')).map((x) => `${x.email}:${x.role}`).sort()).toEqual(['owner@clinic.in:owner', 'staff@clinic.in:staff']);
    await expect(provisionBusiness(a, { ref: 'Bad Name!', ownerEmail: 'x@y.in' }, 'admin')).rejects.toMatchObject({ code: 'INVALID_BUSINESS_NAME' });
    await expect(provisionBusiness(a, { ref: 'ok-name', ownerEmail: 'nope' }, 'admin')).rejects.toMatchObject({ code: 'INVALID_EMAIL' });
    await recordLogin('staff@clinic.in');
    expect((await listMembers(a, 'clinic-one')).find((x) => x.email === 'staff@clinic.in')?.last_login_at).not.toBeNull();
  });

  it("another client's members are invisible to this client, and removing a business removes its members", async () => {
    await provisionBusiness(b, { ref: 'other-clinic', ownerEmail: 'boss@other.in' }, 'admin');
    await expect(listMembers(a, 'other-clinic')).rejects.toMatchObject({ status: 404 });
    const app = (await import('pg')).Pool;
    const pool = new app({ connectionString: process.env.TEST_APP_URL });
    expect(Number((await pool.query('SELECT count(*) AS n FROM tenant_members')).rows[0].n)).toBe(0); // no scope, no rows
    await pool.end();
    await ctx.o.query("DELETE FROM tenants WHERE external_ref = 'other-clinic'");
    expect(await membershipsFor('boss@other.in')).toEqual([]);
  });
});

describe('authorise: what a signed-in person may open', () => {
  const session = (over: Partial<DashSession>): DashSession => ({ email: 'p@x.in', isAdmin: false, memberships: [], ...over });
  const m = (ref: string) => ({ clientId: A.id, tenantId: 't', ref, role: 'owner' as const });

  it('a member may open only their own businesses, and acts as their own client', () => {
    const s = session({ memberships: [m('clinic-one')] });
    expect(authorise(s, 'clinic-one')).toMatchObject({ clientId: A.id, apiKeyId: 'dash:p@x.in' });
    expect(authorise(s, 'clinic-two')).toBeNull();
    expect(authorise(s, '')).toBeNull();
  });

  it('staff can read and post but cannot connect Google; owners and admins can', () => {
    expect(authorise(session({ memberships: [{ ...m('clinic-one'), role: 'staff' }] }), 'clinic-one')?.scopes).toEqual(['read', 'write']);
    expect(authorise(session({ memberships: [m('clinic-one')] }), 'clinic-one')?.scopes).toContain('connect');
    expect(authorise(session({ isAdmin: true }), 'clinic-one')?.scopes).toContain('connect');
  });

  it('the same business name under another client is not confused (client id is part of the match)', () => {
    const s = session({ memberships: [{ ...m('shared-name'), clientId: B.id }] });
    expect(authorise(s, 'shared-name', A.id)).toBeNull();
    expect(authorise(s, 'shared-name', B.id)?.clientId).toBe(B.id);
  });

  it('an admin may open any business of the dashboard client; nobody else may', () => {
    expect(authorise(session({ isAdmin: true }), 'anything')).toMatchObject({ clientId: A.id });
    expect(authorise(session({}), 'anything')).toBeNull();
  });
});
