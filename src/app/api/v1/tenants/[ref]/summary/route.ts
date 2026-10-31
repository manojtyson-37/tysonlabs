import { NextResponse } from 'next/server';
import { authenticate } from '@/reviews-service/apikeys';
import { handleError, noStore } from '@/reviews-service/http';
import { summary } from '@/reviews-service/reviews';

export async function GET(request: Request, { params }: { params: Promise<{ ref: string }> }) {
  try {
    const client = await authenticate(request, 'read');
    return NextResponse.json(await summary(client, (await params).ref), noStore);
  } catch (err) {
    return handleError(err);
  }
}
