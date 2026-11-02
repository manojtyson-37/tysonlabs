import { NextResponse } from 'next/server';
import { authenticate } from '@/reviews-service/apikeys';
import { confirmDeletion } from '@/reviews-service/deletion';
import { handleError, noStore } from '@/reviews-service/http';
import { ServiceError } from '@/reviews-service/service';

// Step 1 and step 2 of the rule. Only step 2 deletes.
export async function POST(request: Request, { params }: { params: Promise<{ ref: string; id: string }> }) {
  try {
    const client = await authenticate(request, 'write');
    const { ref, id } = await params;
    const body = (await request.json().catch(() => null)) ?? {};
    if (typeof body !== 'object' || Array.isArray(body)) throw new ServiceError(400, 'INVALID_BODY');
    return NextResponse.json(await confirmDeletion(client, ref, id, { step: body.step, token: body.token, phrase: body.phrase }), noStore);
  } catch (err) {
    return handleError(err);
  }
}
