import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getInstagramAuthUrl } from '@/lib/instagram';
import { SITE_URL } from '@/lib/site';

/**
 * Initiates the Meta OAuth flow for Instagram Graph API.
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const host = request.headers.get('host') || 'tysonlabs.in';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    const redirectUri = `${baseUrl}/api/auth/instagram/callback`;
    const state = crypto.randomBytes(16).toString('hex');

    const authUrl = getInstagramAuthUrl({
      redirectUri,
      state,
    });

    const response = NextResponse.redirect(authUrl, 303);
    response.cookies.set('ig_oauth_state', state, {
      httpOnly: true,
      secure: !host.includes('localhost'),
      sameSite: 'lax',
      path: '/api/auth/instagram',
      maxAge: 600, // 10 minutes
    });

    return response;
  } catch (error) {
    console.error('[Instagram Auth Start] Error:', error);
    return NextResponse.json({ error: 'Failed to initiate Instagram OAuth' }, { status: 500 });
  }
}
