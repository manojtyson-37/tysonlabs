import { NextResponse } from 'next/server';
import { safeEqual, sha256 } from './crypto';

/** Returns an error response unless the request carries the cron secret. Unset secret means every call is refused. */
export function cronAuthorized(request: Request): NextResponse | null {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length < 16) return NextResponse.json({ error: 'NOT_CONFIGURED' }, { status: 503 });
  const header = request.headers.get('authorization') ?? '';
  if (!safeEqual(sha256(header), sha256(`Bearer ${secret}`))) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  return null;
}
