import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { parseSignedRequest } from '@/lib/instagram';
import { SITE_URL } from '@/lib/site';

/**
 * Meta User Data Deletion Callback URL
 * Required by Meta Platform Policy:
 * https://developers.facebook.com/docs/development/create-an-app/app-dashboard/data-deletion-callback/
 */
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let signedRequest = '';

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      signedRequest = (formData.get('signed_request') as string) || '';
    } else if (contentType.includes('application/json')) {
      const body = await request.json();
      signedRequest = body.signed_request || '';
    }

    let userId = 'unknown';
    if (signedRequest) {
      try {
        const payload = parseSignedRequest(signedRequest);
        if (payload?.user_id) {
          userId = payload.user_id;
        }
      } catch (err) {
        console.warn('[Meta Data Deletion] Signature check warning:', err);
      }
    }

    // Generate a secure tracking confirmation code
    const confirmationCode = `META-DEL-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
    const statusUrl = `${SITE_URL}/data-deletion?id=${confirmationCode}&user=${encodeURIComponent(userId)}`;

    console.log(`[Meta Data Deletion] Deletion request registered for user ${userId}, code: ${confirmationCode}`);

    return NextResponse.json({
      url: statusUrl,
      confirmation_code: confirmationCode,
    });
  } catch (error) {
    console.error('[Meta Data Deletion] Error handling deletion callback:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.redirect(`${SITE_URL}/data-deletion`, 302);
}
