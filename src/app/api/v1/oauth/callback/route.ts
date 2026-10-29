import { NextRequest, NextResponse } from 'next/server';
import { limitByIp } from '@/reviews-service/apikeys';
import { completeConsent } from '@/reviews-service/service';
import { handleError } from '@/reviews-service/http';

export async function GET(request: NextRequest) {
  try {
    await limitByIp(request, 'callback', 60);
    const q = request.nextUrl.searchParams;
    const back = await completeConsent({ state: q.get('state'), code: q.get('code'), error: q.get('error') });
    return NextResponse.redirect(back, { status: 303, headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    return handleError(err);
  }
}
