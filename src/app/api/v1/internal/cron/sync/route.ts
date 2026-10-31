import { NextResponse } from 'next/server';
import { cronAuthorized } from '@/reviews-service/cron';
import { runSyncBatch } from '@/reviews-service/reviews';
import { handleError, noStore } from '@/reviews-service/http';

export const maxDuration = 300;

// Called by Vercel Cron. Fails closed: without CRON_SECRET configured it refuses everything.
export async function GET(request: Request) {
  const denied = cronAuthorized(request);
  if (denied) return denied;
  try {
    return NextResponse.json(await runSyncBatch(), noStore);
  } catch (err) {
    return handleError(err);
  }
}
