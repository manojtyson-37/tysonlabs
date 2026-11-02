import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { bearer, bootstrap } from './helpers';
import { authenticate, AuthedClient } from '@/reviews-service/apikeys';
import { confirmDeletion, requestDeletion } from '@/reviews-service/deletion';
import { completeConsent, createConnectSession, getConnection, linkLocation, resolveTenant, startConsent } from '@/reviews-service/service';
import { syncTenant } from '@/reviews-service/reviews';
import { mkReview } from './helpers';
import { POST as postRequest } from '@/app/api/v1/tenants/[ref]/deletion-requests/route';
import { POST as postConfirm } from '@/app/api/v1/tenants/[ref]/deletion-requests/[id]/confirm/route';

let ctx: Awaited<ReturnType<typeof bootstrap>>;
let A: { id: string; key: string };
let B: { id: string; key: string };
let a: AuthedClient;
let b: AuthedClient;

async function connect(client: AuthedClient, ref: string, location: string) {
  const { url } = await createConnectSession(client, { tenantRef: ref, returnUrl: 'https://app.test/integrations' });
  const state = new URL(await startConsent(url.split('/connect/')[1])).searchParams.get('state')!;
  await completeConsent({ state, code: 'c', error: null });
  await linkLocation(client, ref, location, 'b');
}
const count = async (sql: string, args: unknown[] = []) => Number((await ctx.o.query(sql, args)).rows[0].n);
type Conf = { step: number; token: string; phrase: string };
const first = async (client: AuthedClient, ref: string, input: Record<string, unknown>) => {
  const r = await requestDeletion(client, ref, input);
  return { id: r.requestId, c1: r.confirmation as Conf, summary: r.willDelete };
};

beforeAll(async () => {
  ctx = await bootstrap();
  ctx.fake.locations = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9'].map((id) => ({ googleAccountId: '1', googleLocationId: id, name: `Clinic ${id}` }));
  A = await ctx.mkClient('del-A');
  B = await ctx.mkClient('del-B');
  a = await authenticate(bearer(A.key), 'write');
  b = await authenticate(bearer(B.key), 'write');
});
afterAll(async () => {
  await ctx.o.query('DELETE FROM rate_limits');
  await ctx.o.end();
});

describe('two-confirmation deletion rule', () => {
  it('a request deletes nothing and tells you exactly what would be deleted', async () => {
    await connect(a, 'unlinkme', 'L1');
    const { c1, summary } = await first(a, 'unlinkme', { action: 'unlink_location', locationId: 'L1' });
    expect(c1.phrase).toBe('UNLINK L1');
    expect(JSON.stringify(summary)).toMatch(/Clinic L1/);
    expect(await count("SELECT count(*) AS n FROM location_links WHERE google_location_id = 'L1'")).toBe(1);
  });

  it('unlink needs both confirmations, in order, with the right secret and the exact phrase', async () => {
    const { id, c1 } = await first(a, 'unlinkme', { action: 'unlink_location', locationId: 'L1' });
    await expect(confirmDeletion(a, 'unlinkme', id, { step: 2, token: c1.token, phrase: c1.phrase })).rejects.toMatchObject({ code: 'CONFIRM_STEP_1_FIRST' });
    await expect(confirmDeletion(a, 'unlinkme', id, { step: 1, token: c1.token, phrase: 'unlink l1' })).rejects.toMatchObject({ code: 'INVALID_CONFIRMATION' }); // phrase is exact
    await expect(confirmDeletion(a, 'unlinkme', id, { step: 1, token: 'wrong-secret', phrase: c1.phrase })).rejects.toMatchObject({ code: 'INVALID_CONFIRMATION' });
    const once = await confirmDeletion(a, 'unlinkme', id, { step: 1, token: c1.token, phrase: c1.phrase });
    expect(once.status).toBe('CONFIRMED_ONCE');
    expect(await count("SELECT count(*) AS n FROM location_links WHERE google_location_id = 'L1'")).toBe(1); // still not deleted
    const c2 = (once as { confirmation: Conf }).confirmation;
    await expect(confirmDeletion(a, 'unlinkme', id, { step: 1, token: c1.token, phrase: c1.phrase })).rejects.toMatchObject({ code: 'ALREADY_CONFIRMED_ONCE' });
    await expect(confirmDeletion(a, 'unlinkme', id, { step: 2, token: c1.token, phrase: c2.phrase })).rejects.toMatchObject({ code: 'INVALID_CONFIRMATION' }); // secret #1 cannot do step 2
    expect(await count("SELECT count(*) AS n FROM location_links WHERE google_location_id = 'L1'")).toBe(1);
    const done = await confirmDeletion(a, 'unlinkme', id, { step: 2, token: c2.token, phrase: c2.phrase });
    expect(done).toMatchObject({ status: 'DONE', action: 'unlink_location' });
    expect(await count("SELECT count(*) AS n FROM location_links WHERE google_location_id = 'L1'")).toBe(0);
    await expect(confirmDeletion(a, 'unlinkme', id, { step: 2, token: c2.token, phrase: c2.phrase })).rejects.toMatchObject({ code: 'REQUEST_CLOSED' }); // no replay
  });

  it('disconnect: token goes, Google is revoked, reviews wait for the 30 days', async () => {
    await connect(a, 'discme', 'L2');
    ctx.fake.reviews.L2 = [mkReview('d1', 5, '2026-01-01T00:00:00Z')];
    await syncTenant(A.id, await resolveTenant(a, 'discme'));
    const revoked = ctx.fake.revoked.length;
    const { id, c1 } = await first(a, 'discme', { action: 'disconnect' });
    expect(await count("SELECT count(*) AS n FROM connections WHERE tenant_id = (SELECT id FROM tenants WHERE external_ref = 'discme') AND status = 'ACTIVE'")).toBe(1);
    const once = (await confirmDeletion(a, 'discme', id, { step: 1, token: c1.token, phrase: c1.phrase })) as { confirmation: Conf };
    expect((await getConnection(a, 'discme')).status).toBe('ACTIVE'); // after one confirmation nothing has changed
    await confirmDeletion(a, 'discme', id, { step: 2, token: once.confirmation.token, phrase: once.confirmation.phrase });
    expect((await getConnection(a, 'discme')).status).toBe('DISCONNECTED');
    expect(ctx.fake.revoked.length).toBe(revoked + 1);
    expect(await count("SELECT count(*) AS n FROM reviews WHERE google_review_id = 'd1'")).toBe(1);
  });

  it('erase_tenant removes the tenant and everything under it only after the second confirmation', async () => {
    await connect(a, 'eraseme', 'L3');
    ctx.fake.reviews.L3 = [mkReview('e1', 5, '2026-01-01T00:00:00Z'), mkReview('e2', 4, '2026-01-02T00:00:00Z')];
    const t = await resolveTenant(a, 'eraseme');
    await syncTenant(A.id, t);
    const { id, c1, summary } = await first(a, 'eraseme', { action: 'erase_tenant' });
    expect(summary).toMatchObject({ reviews: 2, linkedLocations: 1 });
    expect(c1.phrase).toBe('ERASE eraseme');
    const once = (await confirmDeletion(a, 'eraseme', id, { step: 1, token: c1.token, phrase: c1.phrase })) as { confirmation: Conf };
    expect(await count('SELECT count(*) AS n FROM reviews WHERE tenant_id = $1', [t])).toBe(2);
    await confirmDeletion(a, 'eraseme', id, { step: 2, token: once.confirmation.token, phrase: once.confirmation.phrase });
    expect(await count('SELECT count(*) AS n FROM tenants WHERE id = $1', [t])).toBe(0);
    expect(await count('SELECT count(*) AS n FROM reviews WHERE tenant_id = $1', [t])).toBe(0);
  });

  it('an expired request cannot be confirmed', async () => {
    await connect(a, 'expireme', 'L4');
    const { id, c1 } = await first(a, 'expireme', { action: 'disconnect' });
    await ctx.o.query("UPDATE deletion_requests SET expires_at = now() - interval '1 minute' WHERE id = $1", [id]);
    await expect(confirmDeletion(a, 'expireme', id, { step: 1, token: c1.token, phrase: c1.phrase })).rejects.toMatchObject({ status: 410 });
    expect((await getConnection(a, 'expireme')).status).toBe('ACTIVE');
  });

  it('five wrong confirmations cancel the request, even if the right secret follows', async () => {
    const { id, c1 } = await first(a, 'expireme', { action: 'disconnect' });
    for (let i = 0; i < 4; i++) await expect(confirmDeletion(a, 'expireme', id, { step: 1, token: 'nope', phrase: c1.phrase })).rejects.toMatchObject({ code: 'INVALID_CONFIRMATION' });
    await expect(confirmDeletion(a, 'expireme', id, { step: 1, token: 'nope', phrase: c1.phrase })).rejects.toMatchObject({ code: 'REQUEST_CANCELLED_TOO_MANY_ATTEMPTS' });
    await expect(confirmDeletion(a, 'expireme', id, { step: 1, token: c1.token, phrase: c1.phrase })).rejects.toMatchObject({ code: 'REQUEST_CLOSED' });
    expect((await getConnection(a, 'expireme')).status).toBe('ACTIVE');
  });

  it("another client cannot request or confirm against someone else's tenant", async () => {
    await expect(requestDeletion(b, 'expireme', { action: 'disconnect' })).rejects.toMatchObject({ status: 404 });
    const { id, c1 } = await first(a, 'expireme', { action: 'disconnect' });
    await expect(confirmDeletion(b, 'expireme', id, { step: 1, token: c1.token, phrase: c1.phrase })).rejects.toMatchObject({ status: 404 });
  });

  it('rejects unknown actions, unlink without a location, and unlinking a location that is not linked', async () => {
    await expect(requestDeletion(a, 'expireme', { action: 'drop_database' })).rejects.toMatchObject({ code: 'INVALID_ACTION' });
    await expect(requestDeletion(a, 'expireme', { action: 'unlink_location' })).rejects.toMatchObject({ code: 'LOCATION_ID_REQUIRED' });
    await expect(requestDeletion(a, 'expireme', { action: 'unlink_location', locationId: 'NOPE' })).rejects.toMatchObject({ status: 404 });
  });

  it('two simultaneous step-2 confirmations execute exactly once', async () => {
    await connect(a, 'racer', 'L2');
    const { id, c1 } = await first(a, 'racer', { action: 'disconnect' });
    const once = (await confirmDeletion(a, 'racer', id, { step: 1, token: c1.token, phrase: c1.phrase })) as { confirmation: Conf };
    const revoked = ctx.fake.revoked.length;
    const results = await Promise.allSettled([
      confirmDeletion(a, 'racer', id, { step: 2, token: once.confirmation.token, phrase: once.confirmation.phrase }),
      confirmDeletion(a, 'racer', id, { step: 2, token: once.confirmation.token, phrase: once.confirmation.phrase }),
    ]);
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect(ctx.fake.revoked.length).toBe(revoked + 1);
  });

  it('caps open requests per tenant', async () => {
    await connect(a, 'capme', 'L3');
    for (let i = 0; i < 5; i++) await requestDeletion(a, 'capme', { action: 'disconnect' });
    await expect(requestDeletion(a, 'capme', { action: 'disconnect' })).rejects.toMatchObject({ code: 'TOO_MANY_OPEN_REQUESTS' });
  });

  it('a wrong guess can never overwrite a request that already finished', async () => {
    await connect(a, 'doneone', 'L5');
    const { id, c1 } = await first(a, 'doneone', { action: 'disconnect' });
    const once = (await confirmDeletion(a, 'doneone', id, { step: 1, token: c1.token, phrase: c1.phrase })) as { confirmation: Conf };
    await confirmDeletion(a, 'doneone', id, { step: 2, token: once.confirmation.token, phrase: once.confirmation.phrase });
    await ctx.o.query('UPDATE deletion_requests SET attempts = 4 WHERE id = $1', [id]);
    await expect(confirmDeletion(a, 'doneone', id, { step: 1, token: 'x', phrase: c1.phrase })).rejects.toMatchObject({ code: 'REQUEST_CLOSED' });
    expect((await ctx.o.query('SELECT status FROM deletion_requests WHERE id = $1', [id])).rows[0].status).toBe('DONE');
  });

  it('a request that expires between confirmation 1 and 2 cannot execute', async () => {
    await connect(a, 'expire2', 'L6');
    const { id, c1 } = await first(a, 'expire2', { action: 'disconnect' });
    const once = (await confirmDeletion(a, 'expire2', id, { step: 1, token: c1.token, phrase: c1.phrase })) as { confirmation: Conf };
    await ctx.o.query("UPDATE deletion_requests SET expires_at = now() - interval '1 second' WHERE id = $1", [id]);
    await expect(confirmDeletion(a, 'expire2', id, { step: 2, token: once.confirmation.token, phrase: once.confirmation.phrase })).rejects.toMatchObject({ status: 410 });
    expect((await getConnection(a, 'expire2')).status).toBe('ACTIVE');
  });

  it('a wrong phrase at step 2 is refused and counts toward the cap, and the right secret still works until then', async () => {
    await connect(a, 'phrase2', 'L7');
    const { id, c1 } = await first(a, 'phrase2', { action: 'disconnect' });
    const once = (await confirmDeletion(a, 'phrase2', id, { step: 1, token: c1.token, phrase: c1.phrase })) as { confirmation: Conf };
    const c2 = once.confirmation;
    await expect(confirmDeletion(a, 'phrase2', id, { step: 2, token: c2.token, phrase: 'DISCONNECT someone-else' })).rejects.toMatchObject({ code: 'INVALID_CONFIRMATION' });
    expect((await ctx.o.query('SELECT attempts, status FROM deletion_requests WHERE id = $1', [id])).rows[0]).toMatchObject({ attempts: 1, status: 'CONFIRMED_ONCE' });
    expect((await getConnection(a, 'phrase2')).status).toBe('ACTIVE');
    for (let i = 0; i < 3; i++) await expect(confirmDeletion(a, 'phrase2', id, { step: 2, token: 'nope', phrase: c2.phrase })).rejects.toMatchObject({ code: 'INVALID_CONFIRMATION' });
    await expect(confirmDeletion(a, 'phrase2', id, { step: 2, token: 'nope', phrase: c2.phrase })).rejects.toMatchObject({ code: 'REQUEST_CANCELLED_TOO_MANY_ATTEMPTS' });
    await expect(confirmDeletion(a, 'phrase2', id, { step: 2, token: c2.token, phrase: c2.phrase })).rejects.toMatchObject({ code: 'REQUEST_CLOSED' });
    expect((await getConnection(a, 'phrase2')).status).toBe('ACTIVE');
  });

  it('two simultaneous step-1 confirmations issue only one second secret', async () => {
    await connect(a, 'step1race', 'L8');
    const { id, c1 } = await first(a, 'step1race', { action: 'disconnect' });
    const results = await Promise.allSettled([
      confirmDeletion(a, 'step1race', id, { step: 1, token: c1.token, phrase: c1.phrase }),
      confirmDeletion(a, 'step1race', id, { step: 1, token: c1.token, phrase: c1.phrase }),
    ]);
    expect(results.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
  });

  it('a failure while executing ends the request as CANCELLED, tells the caller, and does not leave it stuck', async () => {
    await connect(a, 'failexec', 'L9');
    const { id, c1 } = await first(a, 'failexec', { action: 'disconnect' });
    const once = (await confirmDeletion(a, 'failexec', id, { step: 1, token: c1.token, phrase: c1.phrase })) as { confirmation: Conf };
    const original = ctx.fake.revoke.bind(ctx.fake);
    ctx.fake.revoke = async () => { throw new Error('google down'); };
    try {
      await expect(confirmDeletion(a, 'failexec', id, { step: 2, token: once.confirmation.token, phrase: once.confirmation.phrase })).rejects.toThrow();
    } finally {
      ctx.fake.revoke = original;
    }
    expect((await ctx.o.query('SELECT status FROM deletion_requests WHERE id = $1', [id])).rows[0].status).toBe('CANCELLED');
  });

  it('rejects a missing or non-string token and phrase, and a bad step or request id', async () => {
    const { id, c1 } = await first(a, 'phrase2', { action: 'disconnect' });
    await expect(confirmDeletion(a, 'phrase2', id, { step: 1, token: undefined, phrase: c1.phrase })).rejects.toMatchObject({ code: 'INVALID_CONFIRMATION' });
    await expect(confirmDeletion(a, 'phrase2', id, { step: 1, token: c1.token, phrase: 5 })).rejects.toMatchObject({ code: 'INVALID_CONFIRMATION' });
    await expect(confirmDeletion(a, 'phrase2', id, { step: 3, token: c1.token, phrase: c1.phrase })).rejects.toMatchObject({ code: 'STEP_MUST_BE_1_OR_2' });
    await expect(confirmDeletion(a, 'phrase2', 'not-a-uuid', { step: 1, token: c1.token, phrase: c1.phrase })).rejects.toMatchObject({ status: 404 });
  });

  it('works over HTTP: request, confirm 1, confirm 2', async () => {
    await connect(a, 'httpflow', 'L1');
    const hdr = { authorization: `Bearer ${A.key}`, 'content-type': 'application/json', 'x-vercel-forwarded-for': '198.51.100.60' };
    const p = (ref: string, id?: string) => ({ params: Promise.resolve(id ? { ref, id } : { ref }) });
    const r1 = await postRequest(new Request('https://reviews.test/x', { method: 'POST', headers: hdr, body: JSON.stringify({ action: 'disconnect' }) }), p('httpflow') as never);
    expect(r1.status).toBe(200);
    const j1 = await r1.json();
    const r2 = await postConfirm(new Request('https://reviews.test/x', { method: 'POST', headers: hdr, body: JSON.stringify({ step: 1, token: j1.confirmation.token, phrase: j1.confirmation.phrase }) }), p('httpflow', j1.requestId) as never);
    const j2 = await r2.json();
    expect(j2.status).toBe('CONFIRMED_ONCE');
    const r3 = await postConfirm(new Request('https://reviews.test/x', { method: 'POST', headers: hdr, body: JSON.stringify({ step: 2, token: j2.confirmation.token, phrase: j2.confirmation.phrase }) }), p('httpflow', j1.requestId) as never);
    expect((await r3.json()).status).toBe('DONE');
    expect((await getConnection(a, 'httpflow')).status).toBe('DISCONNECTED');
  });
});
