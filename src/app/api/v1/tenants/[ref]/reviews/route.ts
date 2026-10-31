import { NextResponse } from 'next/server';
import { authenticate } from '@/reviews-service/apikeys';
import { handleError, noStore } from '@/reviews-service/http';
import { listReviews } from '@/reviews-service/reviews';

export async function GET(request: Request, { params }: { params: Promise<{ ref: string }> }) {
  try {
    const client = await authenticate(request, 'read');
    const q = new URL(request.url).searchParams;
    const limit = q.get('limit') ? Number(q.get('limit')) : undefined;
    const out = await listReviews(client, (await params).ref, { cursor: q.get('cursor'), limit: Number.isFinite(limit) ? limit : undefined, locationId: q.get('locationId') });
    return NextResponse.json(out, noStore);
  } catch (err) {
    return handleError(err);
  }
}
