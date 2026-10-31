import { NextResponse } from 'next/server';
import { authenticate } from '@/reviews-service/apikeys';
import { handleError, noStore } from '@/reviews-service/http';
import { syncNow } from '@/reviews-service/reviews';

export async function POST(request: Request, { params }: { params: Promise<{ ref: string }> }) {
  try {
    const client = await authenticate(request, 'write');
    return NextResponse.json(await syncNow(client, (await params).ref), noStore);
  } catch (err) {
    return handleError(err);
  }
}
