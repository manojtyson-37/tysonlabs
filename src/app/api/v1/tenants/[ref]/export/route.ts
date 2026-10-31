import { NextResponse } from 'next/server';
import { authenticate } from '@/reviews-service/apikeys';
import { handleError, noStore } from '@/reviews-service/http';
import { exportTenant } from '@/reviews-service/reviews';

export async function GET(request: Request, { params }: { params: Promise<{ ref: string }> }) {
  try {
    const client = await authenticate(request, 'read');
    return NextResponse.json(await exportTenant(client, (await params).ref), noStore);
  } catch (err) {
    return handleError(err);
  }
}
