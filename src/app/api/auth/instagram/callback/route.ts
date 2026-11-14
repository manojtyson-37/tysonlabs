import { NextResponse } from 'next/server';
import {
  exchangeCodeForLongLivedToken,
  getConnectedInstagramAccounts,
  exchangeDirectInstagramCode,
  getDirectInstagramUserProfile,
  subscribePageToWebhooks,
  fetchHistoricalInstagramData,
} from '@/lib/instagram';
import {
  ingestInstagramComment,
  ingestInstagramDm,
  upsertInboxAccount,
} from '@/lib/inbox-db';

/**
 * Handles the OAuth redirect for both Direct Instagram Login (no Facebook Page)
 * and Facebook Login for Business.
 * Automatically subscribes the connected Facebook Page to Webhooks and kicks off
 * initial historical ingestion for the connected account.
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
    const wantsJson = url.searchParams.get('format') === 'json';
    const acceptsHtml = !wantsJson;

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

        if (!wantsJson && acceptsHtml) {
          return NextResponse.redirect(
            `${protocol}://${host}/inbox?connected=true&ig=${encodeURIComponent(profile.username)}`,
            { status: 303 }
          );
        }

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

    // Auto-subscribe webhooks, persist credentials, and ingest recent comments/DMs
    for (const acc of accounts) {
      try {
        await upsertInboxAccount({
          id: acc.id,
          username: acc.username,
          name: acc.name,
          page_id: acc.pageId,
          page_name: acc.pageName,
          access_token: accessToken,
          page_access_token: acc.pageAccessToken,
          token_expires_at: new Date(Date.now() + expiresIn * 1000),
          tenant_id: 'travel_kathegalu',
        });

        if (acc.pageId && acc.pageAccessToken) {
          await subscribePageToWebhooks(acc.pageId, acc.pageAccessToken);
        }
        // Fetch and ingest recent posts & comments into database
        const { posts, conversations } = await fetchHistoricalInstagramData({
          igUserId: acc.id,
          accessToken: acc.pageAccessToken || accessToken,
          maxPosts: 15,
        });

        for (const post of posts) {
          if (post.comments && Array.isArray(post.comments.data)) {
            for (const c of post.comments.data) {
              await ingestInstagramComment({
                commentId: c.id,
                accountId: acc.id,
                accountName: acc.username,
                tenantId: acc.username,
                fromId: c.from?.id || 'unknown',
                fromUsername: c.from?.username || 'user',
                text: c.text,
                mediaId: post.id,
                rawPayload: { postCaption: post.caption, permalink: post.permalink },
              }).catch(() => null);
            }
          }
        }

        for (const conv of conversations) {
          if (conv.messages && Array.isArray(conv.messages.data)) {
            const participant = (conv.participants?.data || []).find(
              (p: any) => p.id !== acc.id
            ) || { id: 'user', username: 'Instagram User' };

            for (const m of conv.messages.data) {
              const isOutbound = m.from?.id === acc.id;
              await ingestInstagramDm({
                messageId: m.id,
                accountId: acc.id,
                accountName: acc.username,
                tenantId: acc.username,
                senderId: isOutbound ? acc.id : participant.id,
                senderName: isOutbound ? acc.username : (participant.username || participant.name || 'User'),
                recipientId: isOutbound ? participant.id : acc.id,
                text: m.message?.trim() || '[Shared Reel / Instagram Media]',
                timestamp: m.created_time ? new Date(m.created_time).getTime() : undefined,
                rawPayload: { threadId: conv.id, isOutbound },
              }).catch(() => null);
            }
          }
        }
      } catch (ingestErr: any) {
        console.warn(`[Instagram Auto-Ingest] Warning for ${acc.username}:`, ingestErr.message);
      }
    }

    if (!wantsJson) {
      const targetAccount = accounts.length > 0 ? accounts[0].username : 'travel_kathegalu';
      return NextResponse.redirect(
        `${protocol}://${host}/inbox?connected=true&ig=${encodeURIComponent(targetAccount)}`,
        { status: 303 }
      );
    }

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
