import { NextRequest, NextResponse } from 'next/server';
import {
  sendInstagramDirectMessage,
  replyToInstagramComment,
  sendInstagramQuickReplyMessage,
  sendInstagramButtonCard,
} from '@/lib/instagram';
import {
  recordOutboundMessage,
  getConversationWithMessages,
  getInboxAccount,
} from '@/lib/inbox-db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      conversationId,
      text,
      tenantId = 'travel_kathegalu',
      parentCommentId,
      messageType = 'text', // 'text' | 'quick_reply' | 'button_card'
      buttonTitle,
      buttonUrl,
      buttons,
    } = body;

    if (!conversationId || (!text && messageType === 'text')) {
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
        const dbAcc = await getInboxAccount(conversation.account_id);
        const token = dbAcc?.page_access_token || dbAcc?.access_token;

        if (conversation.channel_type === 'dm') {
          if (messageType === 'button_card') {
            const res = await sendInstagramButtonCard({
              igUserId: conversation.account_id,
              recipientId: conversation.participant_id,
              title: text || 'you asked for this resource... here it is 🎁',
              buttons: buttons || [
                {
                  type: 'web_url',
                  title: buttonTitle || 'Get the guide 🎁',
                  url: buttonUrl || 'https://tysonlabs.in/guides/bengaluru-itinerary-2026.pdf',
                },
              ],
              accessToken: token,
            });
            metaResponseId = res.message_id;
          } else if (messageType === 'quick_reply') {
            const res = await sendInstagramQuickReplyMessage({
              igUserId: conversation.account_id,
              recipientId: conversation.participant_id,
              text: text || "This guide is only for my followers! Would really appreciate the support first and then I'll send it over!",
              buttons: buttons || [
                {
                  title: buttonTitle || "I'm following you!",
                  payload: 'CHECK_FOLLOW',
                },
              ],
              accessToken: token,
            });
            metaResponseId = res.message_id;
          } else {
            const res = await sendInstagramDirectMessage({
              igUserId: conversation.account_id,
              recipientId: conversation.participant_id,
              text: text.trim(),
              accessToken: token,
            });
            metaResponseId = res.message_id;
          }
        } else if (conversation.channel_type === 'comment') {
          // If replying to a specific comment in the thread, use parentCommentId or conversation.participant_id
          const targetCommentId = parentCommentId || conversation.participant_id;
          const res = await replyToInstagramComment({
            commentId: targetCommentId,
            text: text.trim(),
            accessToken: token,
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
      text: text?.trim() || `[${messageType.toUpperCase()}] ${buttonTitle || ''}`,
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
