import { NextResponse } from 'next/server';
import { authenticate } from '@/reviews-service/apikeys';
import { handleError, noStore } from '@/reviews-service/http';
import { postReply } from '@/reviews-service/reviews';
import { ServiceError } from '@/reviews-service/service';

// Posts an approved reply to Google. Needs an Idempotency-Key header and approvedBy in the body; a human approves every post.
export async function POST(request: Request, { params }: { params: Promise<{ ref: string; id: string }> }) {
  try {
    const client = await authenticate(request, 'write');
    const { ref, id } = await params;
    const body = (await request.json().catch(() => null)) ?? {};
    if (typeof body !== 'object' || Array.isArray(body)) throw new ServiceError(400, 'INVALID_BODY');
    const out = await postReply(client, ref, id, { draftId: body.draftId, text: body.text, approvedBy: body.approvedBy, replace: body.replace, idempotencyKey: request.headers.get('idempotency-key') });
    return NextResponse.json(out, noStore);
  } catch (err) {
    return handleError(err);
  }
}
