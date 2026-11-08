import { NextResponse } from 'next/server';
import { limitByIp } from '@/reviews-service/apikeys';
import { handleWebhook, signatureOk } from '@/reviews-service/billing';
import { handleError, noStore } from '@/reviews-service/http';

// Razorpay subscription events. The signature (HMAC-SHA256 of the raw body with RAZORPAY_WEBHOOK_SECRET) is the only proof a request
// came from Razorpay, so it is checked on the exact bytes received, before anything is parsed or stored.
export async function POST(request: Request) {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret || secret.length < 16) return NextResponse.json({ error: 'NOT_CONFIGURED' }, { status: 503 });
    await limitByIp(request, 'razorpay', 300);
    const raw = await request.text();
    if (raw.length > 100_000 || !signatureOk(raw, request.headers.get('x-razorpay-signature'), secret)) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    return NextResponse.json({ result: await handleWebhook(raw, request.headers.get('x-razorpay-event-id')) }, noStore);
  } catch (err) {
    return handleError(err); // a real failure is a 500, so Razorpay retries
  }
}
