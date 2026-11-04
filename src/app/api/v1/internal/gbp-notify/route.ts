import { NextResponse } from 'next/server';
import { handlePush, notifyTokenOk } from '@/reviews-service/notify';

export const maxDuration = 120;

// Pub/Sub push endpoint for Business Profile review notifications. Without a valid token in the URL it answers 401 and does nothing.
export async function POST(request: Request) {
  if (!notifyTokenOk(new URL(request.url).searchParams.get('token'))) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
  let body: unknown = null;
  try { body = await request.json(); } catch { /* acknowledged below */ }
  try {
    return NextResponse.json({ result: await handlePush(body) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[notify] push failed', err instanceof Error ? err.name : 'unknown');
    return NextResponse.json({ result: 'error' }, { status: 500 }); // a real failure: let Pub/Sub retry
  }
}
