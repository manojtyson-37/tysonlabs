import { NextResponse } from 'next/server';
import { authenticate } from '@/reviews-service/apikeys';
import { availableLocations } from '@/reviews-service/service';
import { handleError, noStore } from '@/reviews-service/http';

export async function GET(request: Request, { params }: { params: Promise<{ ref: string }> }) {
  try {
    const client = await authenticate(request, 'read');
    return NextResponse.json({ data: await availableLocations(client, (await params).ref) }, noStore);
  } catch (err) {
    return handleError(err);
  }
}
