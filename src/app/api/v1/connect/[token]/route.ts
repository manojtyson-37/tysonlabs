import { NextResponse } from 'next/server';
import { limitByIp } from '@/reviews-service/apikeys';
import { startConsent } from '@/reviews-service/service';
import { handleError } from '@/reviews-service/http';

// The one-time link a client app sends its admin to. Single use; redirects to Google's consent screen.
export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    await limitByIp(request, 'connect', 60);
    const { token } = await params;
    const url = await startConsent(token);
    return NextResponse.redirect(url, { status: 303, headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    return handleError(err);
  }
}
