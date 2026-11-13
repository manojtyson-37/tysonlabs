import { NextResponse } from 'next/server';
import { exchangeCodeForLongLivedToken, getConnectedInstagramAccounts } from '@/lib/instagram';

/**
 * Handles the Meta OAuth redirect for Instagram Graph API.
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const errorParam = url.searchParams.get('error');
    const errorDesc = url.searchParams.get('error_description');

    if (errorParam) {
      return NextResponse.json(
        { error: errorParam, description: errorDesc || 'User cancelled or denied authorization' },
        { status: 400 }
      );
    }

    if (!code) {
      return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 });
    }

    const host = request.headers.get('host') || 'tysonlabs.in';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const redirectUri = `${protocol}://${host}/api/auth/instagram/callback`;

    // 1. Exchange authorization code for a long-lived (60-day) token
    const { accessToken, expiresIn } = await exchangeCodeForLongLivedToken({
      code,
      redirectUri,
    });

    // 2. Discover all connected Instagram Business / Creator accounts
    const accounts = await getConnectedInstagramAccounts(accessToken);

    return NextResponse.json({
      success: true,
      message: 'Instagram Graph API connected successfully!',
      tokenExpiresInDays: Math.round(expiresIn / 86400),
      accountsConnected: accounts.length,
      accounts: accounts.map((acc) => ({
        instagramId: acc.id,
        instagramUsername: acc.username,
        accountName: acc.name,
        linkedFacebookPage: acc.pageName,
        pageId: acc.pageId,
      })),
      longLivedToken: accessToken,
    });
  } catch (error: any) {
    console.error('[Instagram Auth Callback] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error during Instagram token exchange' },
      { status: 500 }
    );
  }
}
