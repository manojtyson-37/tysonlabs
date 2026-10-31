import { NextResponse } from 'next/server';
import { cronAuthorized } from '@/reviews-service/cron';
import { runPurge } from '@/reviews-service/reviews';
import { handleError, noStore } from '@/reviews-service/http';

export async function GET(request: Request) {
  const denied = cronAuthorized(request);
  if (denied) return denied;
  try {
    return NextResponse.json(await runPurge(), noStore);
  } catch (err) {
    return handleError(err);
  }
}
