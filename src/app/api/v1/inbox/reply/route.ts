import { NextRequest, NextResponse } from 'next/server';
import {
  sendInstagramDirectMessage,
  replyToInstagramComment,
} from '@/lib/instagram';
import {
  recordOutboundMessage,
  getConversationWithMessages,
} from '@/lib/inbox-db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      conversationId,
      text,
      tenantId = 'travel_kathegalu',
      parentCommentId,
    } = body;

    if (!conversationId || !text || !text.trim()) {
      return NextResponse.json(
        { error: 'conversationId and text are required' },
        { status: 400 }
      );
    }

    const { conversation } = await getConversationWithMessages(conversationId);
    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    let metaResponseId: string | undefined;
    let liveSendError: string | null = null;

    // Dispatch to Meta Graph API if credentials exist
    if (conversation.platform === 'instagram') {
      try {
        if (conversation.channel_type === 'dm') {
          const res = await sendInstagramDirectMessage({
            igUserId: conversation.account_id,
            recipientId: conversation.participant_id,
            text: text.trim(),
          });
          metaResponseId = res.message_id;
        } else if (conversation.channel_type === 'comment') {
          // If replying to a specific comment in the thread, use parentCommentId or conversation.subject_media_id
          const targetCommentId = parentCommentId || conversation.participant_id;
          const res = await replyToInstagramComment({
            commentId: targetCommentId,
            text: text.trim(),
          });
          metaResponseId = res.id;
        }
      } catch (graphErr: any) {
        console.warn('[Inbox Reply] Meta Graph send warning (will still record locally):', graphErr.message);
        liveSendError = graphErr.message;
      }
    }

    // Record outbound message in our database
    const savedMessage = await recordOutboundMessage({
      id: metaResponseId,
      conversationId,
      tenantId,
      platform: conversation.platform,
      channelType: conversation.channel_type,
      senderId: conversation.account_id,
      senderName: conversation.account_name,
      recipientId: conversation.participant_id,
      text: text.trim(),
      parentId: parentCommentId,
      status: liveSendError ? 'delivered' : 'sent',
    });

    return NextResponse.json({
      success: true,
      message: savedMessage,
      metaResponseId,
      warning: liveSendError ? `Logged locally (${liveSendError})` : undefined,
    });
  } catch (err: any) {
    console.error('[Inbox Reply] Handler error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
