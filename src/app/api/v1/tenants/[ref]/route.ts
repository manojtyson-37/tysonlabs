import { authenticate } from '@/reviews-service/apikeys';
import { handleError } from '@/reviews-service/http';
import { ServiceError } from '@/reviews-service/service';

// Erasing a tenant is never a single call. Use POST .../deletion-requests with {"action":"erase_tenant"}, then confirm twice.
export async function DELETE(request: Request) {
  try {
    await authenticate(request, 'write');
    throw new ServiceError(400, 'DELETION_REQUIRES_TWO_CONFIRMATIONS'); // see POST .../deletion-requests
  } catch (err) {
    return handleError(err);
  }
}

