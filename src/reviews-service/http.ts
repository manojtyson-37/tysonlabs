import { NextResponse } from 'next/server';
import { AuthError } from './apikeys';
import { ServiceError } from './service';

/** Maps domain errors to JSON. Unknown errors become a generic 500 and are never echoed (they may hold secrets). */
export function handleError(err: unknown): NextResponse {
  if (err instanceof AuthError) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: err.status });
  if (err instanceof ServiceError) return NextResponse.json({ error: err.code }, { status: err.status });
  console.error('[reviews-service] unhandled error', err instanceof Error ? err.name : 'unknown');
  return NextResponse.json({ error: 'INTERNAL' }, { status: 500 });
}

export const noStore = { headers: { 'Cache-Control': 'no-store' } };
