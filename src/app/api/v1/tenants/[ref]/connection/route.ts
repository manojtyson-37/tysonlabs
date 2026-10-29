import { NextResponse } from 'next/server';
import { authenticate } from '@/reviews-service/apikeys';
import { disconnect, getConnection } from '@/reviews-service/service';
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

export async function DELETE(request: Request, { params }: Ctx) {
  try {
    const client = await authenticate(request, 'write');
    await disconnect(client, (await params).ref);
    return NextResponse.json({ success: true }, noStore);
  } catch (err) {
    return handleError(err);
  }
}
