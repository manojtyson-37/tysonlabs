import { NextResponse } from 'next/server';
import { authenticate } from '@/reviews-service/apikeys';
import { requestDeletion } from '@/reviews-service/deletion';
import { handleError, noStore } from '@/reviews-service/http';
import { ServiceError } from '@/reviews-service/service';

// Step 0 of the two-confirmation deletion rule. Nothing is deleted here.
export async function POST(request: Request, { params }: { params: Promise<{ ref: string }> }) {
  try {
    const client = await authenticate(request, 'write');
    const body = (await request.json().catch(() => null)) ?? {};
    if (typeof body !== 'object' || Array.isArray(body)) throw new ServiceError(400, 'INVALID_BODY');
    return NextResponse.json(await requestDeletion(client, (await params).ref, { action: body.action, locationId: body.locationId }), noStore);
  } catch (err) {
    return handleError(err);
  }
}
