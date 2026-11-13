import { NextResponse } from 'next/server';
import {
  exchangeCodeForLongLivedToken,
  getConnectedInstagramAccounts,
  exchangeDirectInstagramCode,
  getDirectInstagramUserProfile,
} from '@/lib/instagram';

/**
 * Handles the OAuth redirect for both Direct Instagram Login (no Facebook Page)
 * and Facebook Login for Business.
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

    const cookieHeader = request.headers.get('cookie') || '';
    const isDirectMode = cookieHeader.includes('ig_oauth_mode=direct');

    // 1. If Direct Instagram Login (api.instagram.com)
    if (isDirectMode) {
      try {
        const { accessToken, userId, expiresIn } = await exchangeDirectInstagramCode({
          code,
          redirectUri,
        });

        const profile = await getDirectInstagramUserProfile(accessToken).catch(() => ({
          id: userId,
          username: 'instagram_user',
          name: 'Instagram Creator',
          account_type: 'BUSINESS',
        }));

        return NextResponse.json({
          success: true,
          authMode: 'direct_instagram_login',
          message: `Connected Instagram account @${profile.username} (Direct Login - No Facebook Page needed)!`,
          tokenExpiresInDays: Math.round(expiresIn / 86400),
          accountsConnected: 1,
          accounts: [
            {
              instagramId: profile.id,
              instagramUsername: profile.username,
              accountName: profile.name || profile.username,
              accountType: profile.account_type,
              linkedFacebookPage: 'None (Direct Instagram Login)',
              pageId: 'direct_ig',
            },
          ],
          longLivedToken: accessToken,
        });
      } catch (directErr: any) {
        console.warn('[Instagram Direct Callback] Fallback to Facebook exchange:', directErr.message);
      }
    }

    // 2. Facebook Login for Business (Pages-linked Instagram accounts)
    const { accessToken, expiresIn } = await exchangeCodeForLongLivedToken({
      code,
      redirectUri,
    });

    const accounts = await getConnectedInstagramAccounts(accessToken);

    return NextResponse.json({
      success: true,
      authMode: 'facebook_pages_oauth',
      message: 'Instagram Graph API connected successfully via Facebook Page!',
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
    if (error?.digest === 'NEXT_PRERENDER_INTERRUPTED') {
      throw error;
    }
    console.error('[Instagram Auth Callback] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error during Instagram token exchange' },
      { status: 500 }
    );
  }
}
