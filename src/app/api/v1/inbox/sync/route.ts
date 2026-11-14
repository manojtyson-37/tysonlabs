import { NextRequest, NextResponse } from 'next/server';
import {
  fetchHistoricalInstagramData,
  subscribePageToWebhooks,
} from '@/lib/instagram';
import {
  ingestInstagramDm,
  ingestInstagramComment,
  getInboxAccount,
  getInboxPool,
} from '@/lib/inbox-db';

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // empty body uses environment defaults
    }

    const tenantId = body.tenantId || 'travel_kathegalu';
    const accountName = body.accountName || 'Travel Kathegalu';

    // Retrieve active credentials from database first, fallback to env
    const dbAccount = await getInboxAccount(tenantId);

    const token =
      body.accessToken ||
      dbAccount?.access_token ||
      process.env.INSTAGRAM_USER_ACCESS_TOKEN ||
      process.env.META_ACCESS_TOKEN;

    const igUserId =
      body.igUserId ||
      body.accountId ||
      dbAccount?.id ||
      '17841470062375430'; // Default to travel_kathegalu IG ID

    const pageId = body.pageId || dbAccount?.page_id;
    const pageAccessToken = body.pageAccessToken || dbAccount?.page_access_token || token;

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

    // Step 4: Ingest direct message conversations (both inbound and outbound)
    const pPool = getInboxPool();
    for (const conv of conversations) {
      const participant = (conv.participants?.data || []).find(
        (p: any) => p.id !== igUserId
      );
      const participantHandle = participant?.username
        ? `@${participant.username}`
        : (participant?.name || null);

      // Backfill and ensure conversation participant name is updated from Meta handle
      if (participant?.id && participantHandle) {
        try {
          await pPool.query(
            `UPDATE inbox_conversations 
             SET participant_name = $1 
             WHERE (participant_id = $2 OR id = $3) 
               AND (participant_name LIKE 'Instagram User%' OR participant_name IS NULL)`,
            [participantHandle, participant.id, `ig_dm_${igUserId}_${participant.id}`]
          );
        } catch (updErr) {
          console.warn('[Inbox Sync] Could not backfill participant handle:', updErr);
        }
      }

      if (conv.messages && Array.isArray(conv.messages.data)) {
        for (const msg of conv.messages.data) {
          const isFromAccount = msg.from?.id === igUserId;
          const targetSenderId = isFromAccount ? igUserId : (msg.from?.id || participant?.id || 'unknown_sender');
          const targetSenderName = isFromAccount ? accountName : (participantHandle || msg.from?.username || 'Instagram User');
          const targetRecipientId = isFromAccount ? (participant?.id || 'unknown_recipient') : igUserId;

          await ingestInstagramDm({
            messageId: msg.id,
            accountId: igUserId,
            accountName,
            tenantId,
            senderId: targetSenderId,
            senderName: targetSenderName,
            recipientId: targetRecipientId,
            text: msg.message?.trim() || '[Shared Reel / Instagram Media]',
            timestamp: msg.created_time ? new Date(msg.created_time).getTime() : Date.now(),
            rawPayload: { ...msg, is_echo: isFromAccount, participantUsername: participantHandle },
          });
          syncedDmsCount++;
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
