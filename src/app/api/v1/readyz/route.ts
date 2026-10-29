import { randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';
import { AuthError, limitByIp } from '@/reviews-service/apikeys';
import { unscoped } from '@/reviews-service/db';
import { getWrapper } from '@/reviews-service/container';
import { handleError, noStore } from '@/reviews-service/http';

const REQUIRED_ENV = ['REVIEWS_DATABASE_URL', 'REVIEWS_KEK', 'API_KEY_PEPPER', 'REVIEWS_BASE_URL', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REDIRECT_URI'];

// Deep health check: proves config, the restricted database role and the key wrapper all work.
// Public, so it is rate limited per IP and answers only ok / not ok; the failing check names go to server logs, never the response.
export async function GET(request: Request) {
  try {
    await limitByIp(request, 'ready', 20);
  } catch (err) {
    // 429 is a real answer; any other failure (for example no database) means the service is not ready.
    if (err instanceof AuthError) return handleError(err);
    // Next signals "this route is dynamic" by throwing during the build; let that through.
    if (err instanceof Error && err.message.includes('bail out of prerendering')) throw err;
    console.error('[reviews-service] readyz limiter failed');
    return NextResponse.json({ ok: false }, { status: 503, ...noStore });
  }
  const failed: string[] = [];
  for (const name of REQUIRED_ENV) if (!process.env[name]) failed.push(`env:${name}`);
  try {
    // unscoped() waits for the check that the connecting role is not a superuser, has no BYPASSRLS and owns no tables.
    await unscoped((db) => db.query('SELECT 1'));
  } catch {
    failed.push('database');
  }
  try {
    const w = getWrapper();
    const dataKey = randomBytes(32);
    const wrapped = await w.wrap(dataKey, 'readyz');
    if (!dataKey.equals(await w.unwrap(wrapped, 'readyz'))) failed.push('kek-roundtrip');
  } catch {
    failed.push('kek');
  }
  if (failed.length) {
    console.error('[reviews-service] readyz failed', failed.join(','));
    return NextResponse.json({ ok: false }, { status: 503, ...noStore });
  }
  return NextResponse.json({ ok: true }, noStore);
}
