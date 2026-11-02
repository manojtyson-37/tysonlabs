import { NextResponse } from 'next/server';
import { authenticate } from '@/reviews-service/apikeys';
import { linkLocation } from '@/reviews-service/service';
import { ServiceError } from '@/reviews-service/service';
import { handleError, noStore } from '@/reviews-service/http';

type Ctx = { params: Promise<{ ref: string; locationId: string }> };

export async function PUT(request: Request, { params }: Ctx) {
  try {
    const client = await authenticate(request, 'write');
    const { ref, locationId } = await params;
    const body = (await request.json().catch(() => null)) ?? {};
    if (typeof body !== 'object' || Array.isArray(body)) throw new ServiceError(400, 'INVALID_BODY');
    const branchRef = typeof body.branchRef === 'string' && body.branchRef.length <= 200 ? body.branchRef : undefined;
    return NextResponse.json(await linkLocation(client, ref, locationId, branchRef), noStore);
  } catch (err) {
    return handleError(err);
  }
}

// Unlinking is never a single call. Use POST .../deletion-requests with {"action":"unlink_location","locationId":...}, then confirm twice.
export async function DELETE(request: Request) {
  try {
    await authenticate(request, 'write');
    throw new ServiceError(400, 'DELETION_REQUIRES_TWO_CONFIRMATIONS'); // see POST .../deletion-requests
  } catch (err) {
    return handleError(err);
  }
}
