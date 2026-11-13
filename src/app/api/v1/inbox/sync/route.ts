import { NextRequest, NextResponse } from 'next/server';
import {
  fetchHistoricalInstagramData,
  subscribePageToWebhooks,
} from '@/lib/instagram';
import {
  ingestInstagramDm,
  ingestInstagramComment,
} from '@/lib/inbox-db';

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // empty body uses environment defaults
    }

    const token =
      body.accessToken ||
      process.env.INSTAGRAM_USER_ACCESS_TOKEN ||
      process.env.META_ACCESS_TOKEN;

    const igUserId = body.igUserId || body.accountId || '17841432905297253';
    const tenantId = body.tenantId || 'travel_kathegalu';
    const accountName = body.accountName || 'Travel Kathegalu';
    const pageId = body.pageId;
    const pageAccessToken = body.pageAccessToken || token;

    if (!token) {
      return NextResponse.json(
        { error: 'No Instagram access token provided or found in environment' },
        { status: 400 }
      );
    }

    // Step 1: Enable live webhook subscription on the Facebook page if provided
    let webhookSubscribed = false;
    if (pageId && pageAccessToken) {
      const subResult = await subscribePageToWebhooks(pageId, pageAccessToken);
      webhookSubscribed = subResult.success;
    }

    // Step 2: Fetch historical data from Graph API
    const { posts, conversations } = await fetchHistoricalInstagramData({
      igUserId,
      accessToken: token,
      maxPosts: 30,
    });

    let syncedCommentsCount = 0;
    let syncedDmsCount = 0;

    // Step 3: Ingest posts and comments into database
    for (const post of posts) {
      if (post.comments && Array.isArray(post.comments.data)) {
        for (const c of post.comments.data) {
          await ingestInstagramComment({
            commentId: c.id,
            accountId: igUserId,
            accountName,
            tenantId,
            fromId: c.from?.id || 'unknown',
            fromUsername: c.from?.username || 'user',
            text: c.text,
            mediaId: post.id,
            rawPayload: { postCaption: post.caption, permalink: post.permalink },
          });
          syncedCommentsCount++;

          // Ingest nested comment replies if any
          if (c.replies && Array.isArray(c.replies.data)) {
            for (const r of c.replies.data) {
              await ingestInstagramComment({
                commentId: r.id,
                accountId: igUserId,
                accountName,
                tenantId,
                fromId: r.from?.id || 'unknown',
                fromUsername: r.from?.username || 'user',
                text: r.text,
                mediaId: post.id,
                parentId: c.id,
                rawPayload: { isReply: true },
              });
              syncedCommentsCount++;
            }
          }
        }
      }
    }

    // Step 4: Ingest direct message conversations
    for (const conv of conversations) {
      if (conv.messages && Array.isArray(conv.messages.data)) {
        const participant = (conv.participants?.data || []).find(
          (p: any) => p.id !== igUserId
        ) || { id: 'unknown_sender', username: 'Instagram User' };

        for (const msg of conv.messages.data) {
          const isFromAccount = msg.from?.id === igUserId;
          if (!isFromAccount) {
            await ingestInstagramDm({
              messageId: msg.id,
              accountId: igUserId,
              accountName,
              tenantId,
              senderId: msg.from?.id || participant.id,
              senderName: msg.from?.username || participant.username,
              recipientId: igUserId,
              text: msg.message || '',
              timestamp: msg.created_time ? new Date(msg.created_time).getTime() : Date.now(),
              rawPayload: msg,
            });
            syncedDmsCount++;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      igUserId,
      accountName,
      webhookSubscribed,
      syncedPosts: posts.length,
      syncedCommentsCount,
      syncedConversations: conversations.length,
      syncedDmsCount,
    });
  } catch (err: any) {
    console.error('[Inbox Sync] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
