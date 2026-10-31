import { NextResponse } from 'next/server';
import { authenticate } from '@/reviews-service/apikeys';
import { handleError, noStore } from '@/reviews-service/http';
import { createDraft } from '@/reviews-service/reviews';

export async function POST(request: Request, { params }: { params: Promise<{ ref: string; id: string }> }) {
  try {
    const client = await authenticate(request, 'write');
    const { ref, id } = await params;
    return NextResponse.json(await createDraft(client, ref, id), noStore);
  } catch (err) {
    return handleError(err);
  }
}
