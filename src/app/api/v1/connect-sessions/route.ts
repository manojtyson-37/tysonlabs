import { NextResponse } from 'next/server';
import { authenticate } from '@/reviews-service/apikeys';
import { createConnectSession } from '@/reviews-service/service';
import { ServiceError } from '@/reviews-service/service';
import { handleError, noStore } from '@/reviews-service/http';

export async function POST(request: Request) {
  try {
    const client = await authenticate(request, 'connect');
    const body = (await request.json().catch(() => null)) ?? {};
    if (typeof body !== 'object' || Array.isArray(body)) throw new ServiceError(400, 'INVALID_BODY');
    const session = await createConnectSession(client, { tenantRef: body.tenantRef, returnUrl: body.returnUrl });
    return NextResponse.json(session, noStore);
  } catch (err) {
    return handleError(err);
  }
}
