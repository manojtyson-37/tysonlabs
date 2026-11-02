import { NextResponse } from 'next/server';
import { authenticate } from '@/reviews-service/apikeys';
import { ServiceError, getConnection } from '@/reviews-service/service';
import { handleError, noStore } from '@/reviews-service/http';

type Ctx = { params: Promise<{ ref: string }> };

export async function GET(request: Request, { params }: Ctx) {
  try {
    const client = await authenticate(request, 'read');
    return NextResponse.json(await getConnection(client, (await params).ref), noStore);
  } catch (err) {
    return handleError(err);
  }
}

// Disconnecting is never a single call. Use POST .../deletion-requests with {"action":"disconnect"}, then confirm twice.
export async function DELETE(request: Request) {
  try {
    await authenticate(request, 'write');
    throw new ServiceError(400, 'DELETION_REQUIRES_TWO_CONFIRMATIONS'); // see POST .../deletion-requests
  } catch (err) {
    return handleError(err);
  }
}
