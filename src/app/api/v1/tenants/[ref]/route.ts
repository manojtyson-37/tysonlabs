import { NextResponse } from 'next/server';
import { authenticate } from '@/reviews-service/apikeys';
import { handleError, noStore } from '@/reviews-service/http';
import { eraseTenant } from '@/reviews-service/reviews';
import { ServiceError } from '@/reviews-service/service';

// Erases everything held for the tenant. Irreversible, so the caller must repeat the tenant ref as ?confirm=<ref>.
export async function DELETE(request: Request, { params }: { params: Promise<{ ref: string }> }) {
  try {
    const client = await authenticate(request, 'write');
    const { ref } = await params;
    if (new URL(request.url).searchParams.get('confirm') !== ref) throw new ServiceError(400, 'CONFIRM_REQUIRED');
    const { googleRevoked } = await eraseTenant(client, ref);
    return NextResponse.json({ success: true, googleRevoked }, noStore);
  } catch (err) {
    return handleError(err);
  }
}
