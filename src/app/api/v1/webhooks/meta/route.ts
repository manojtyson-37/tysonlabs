import { NextRequest, NextResponse } from 'next/server';
import {
  verifyMetaWebhookHmac,
  getInstagramScopedUserProfile,
  sendInstagramDirectMessage,
  replyToInstagramComment,
  checkUserFollowsBusiness,
  sendInstagramQuickReplyMessage,
  sendInstagramButtonCard,
} from '@/lib/instagram';
import {
  ingestInstagramDm,
  ingestInstagramComment,
  logWebhookEvent,
  getInboxAccount,
  findMatchingPaidRule,
  recordPaidRuleTrigger,
  recordOutboundMessage,
  findMatchingReelAutomation,
  incrementReelAutomationStat,
  listReelAutomations,
  saveLeadCapture,
  getLeadCapture,
} from '@/lib/inbox-db';

const WEBHOOK_VERIFY_TOKEN =
  process.env.META_WEBHOOK_VERIFY_TOKEN ||
  process.env.WEBHOOK_VERIFY_TOKEN ||
  'tysonlabs_meta_webhook_secret';

/**
 * Meta Webhook Verification Handler (GET)
 * Meta calls this when configuring or verifying the Webhook URL in the App Dashboard.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === WEBHOOK_VERIFY_TOKEN) {
    console.log('[Meta Webhook] Successfully verified subscribe challenge');
    return new Response(challenge || '', {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-store',
      },
    });
  }

  console.warn('[Meta Webhook] Verification failed: token mismatch or missing params');
  return new Response('Forbidden', {
    status: 403,
    headers: { 'Cache-Control': 'no-store' },
  });
}

/**
 * Meta Webhook Event Ingestion Handler (POST)
 * Receives Instagram DMs, Instagram Comments, and WhatsApp notifications.
 */
export async function POST(req: NextRequest) {
  const signature = req.headers.get('x-hub-signature-256');
  let rawBody: string;

  try {
    rawBody = await req.text();
  } catch (err: any) {
    console.error('[Meta Webhook] Failed to read body:', err);
    return NextResponse.json({ error: 'Failed to read request body' }, { status: 400 });
  }

  // Verify HMAC signature
  const appSecret = process.env.FACEBOOK_APP_SECRET || 'e5befb29390dff677e418a88c63c8fc5';
  if (appSecret && signature) {
    const isValid = verifyMetaWebhookHmac(rawBody, signature, appSecret);
    if (!isValid) {
      console.error('[Meta Webhook] Invalid HMAC signature detected');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch (err: any) {
    console.error('[Meta Webhook] Failed to parse JSON payload:', err);
    return NextResponse.json({ error: 'Malformed JSON' }, { status: 400 });
  }

  // Audit event in database
  const objectType = payload.object || 'unknown';
  logWebhookEvent({
    eventType: `meta.${objectType}`,
    object: objectType,
    rawPayload: payload,
  }).catch((e) => console.error('[Meta Webhook] Failed to log raw event:', e.message));

  // Handle Instagram & Facebook Page Webhook Events
  if ((objectType === 'instagram' || objectType === 'page') && Array.isArray(payload.entry)) {
    for (const entry of payload.entry) {
      const accountId = entry.id;

      // 1. Direct Messages
      if (Array.isArray(entry.messaging)) {
        for (const item of entry.messaging) {
          const senderId = item.sender?.id;
          const recipientId = item.recipient?.id;
          const message = item.message;

          if (message && senderId && recipientId) {
            const isEcho = Boolean(
              message.is_echo ||
              item.is_echo ||
              senderId === accountId
            );

            // Text or fallback for media
            let text = message.text || '';
            if (!text && message.attachments && message.attachments.length > 0) {
              const att = message.attachments[0];
              text = `[Sent ${att.type || 'media'}]`;
            }

            // If it's an echo (outbound from bot/creator), the customer is recipientId.
            // If inbound from follower, customer is senderId.
            const customerId = isEcho ? recipientId : senderId;

            // Resolve sender profile using active account credentials
            let senderName = `Instagram User (${customerId.slice(-4)})`;
            let senderUsername: string | undefined;
            let senderAvatar: string | undefined;

            try {
              const dbAcc = await getInboxAccount(accountId);
              const token =
                dbAcc?.page_access_token ||
                dbAcc?.access_token ||
                process.env.INSTAGRAM_USER_ACCESS_TOKEN;

              if (token && !isEcho) {
                const profile = await getInstagramScopedUserProfile(customerId, token);
                if (profile) {
                  senderUsername = profile.username;
                  senderName = profile.username ? `@${profile.username}` : (profile.name || senderName);
                  senderAvatar = profile.profile_pic;
                }
              }
            } catch (profErr) {
              console.warn('[Meta Webhook] Could not resolve sender profile:', profErr);
            }

            try {
              await ingestInstagramDm({
                messageId: message.mid || `mid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                accountId,
                accountName: 'Travel Kathegalu',
                tenantId: 'travel_kathegalu',
                senderId,
                senderName: isEcho ? 'Travel Kathegalu' : senderName,
                senderAvatar,
                recipientId,
                text,
                timestamp: item.timestamp,
                rawPayload: item,
              });
              console.log(`[Meta Webhook] Ingested ${isEcho ? 'outbound echo' : 'inbound'} Instagram DM for customer ${customerId}`);

              // Do not run automation triggers on our own outbound echoes!
              if (isEcho) {
                continue;
              }

              // Check for Paid DM Auto-Reply match
              try {
                const matchingRule = await findMatchingPaidRule('travel_kathegalu', text);
                if (matchingRule) {
                  const dbAcc = await getInboxAccount(accountId);
                  const token = dbAcc?.page_access_token || dbAcc?.access_token;
                  if (token) {
                    const cleanName = senderName.replace('@', '').replace(/[^\w\s]/gi, '').trim() || 'traveler';
                    const autoReplyText = matchingRule.reply_template
                      .replace(/{{name}}/gi, cleanName)
                      .replace(/{{product_name}}/gi, matchingRule.name)
                      .replace(/{{payment_link}}/gi, matchingRule.payment_link)
                      .replace(/{{price}}/gi, `₹${matchingRule.price_inr}`);

                    const sendRes = await sendInstagramDirectMessage({
                      igUserId: accountId,
                      recipientId: senderId,
                      text: autoReplyText,
                      accessToken: token,
                    });

                    await recordOutboundMessage({
                      id: sendRes.message_id,
                      conversationId: `ig_dm_${accountId}_${senderId}`,
                      tenantId: 'travel_kathegalu',
                      platform: 'instagram',
                      channelType: 'dm',
                      senderId: accountId,
                      senderName: 'Travel Kathegalu',
                      recipientId: senderId,
                      text: autoReplyText,
                      status: 'sent',
                    });

                    await recordPaidRuleTrigger(matchingRule.id);
                    console.log(`[Meta Webhook] Auto-dispatched Paid DM trigger for "${matchingRule.name}" to ${senderName}`);
                  }
                }
              } catch (paidErr: any) {
                console.warn('[Meta Webhook] Paid auto-reply check warning:', paidErr.message);
              }

              // Check for Follower Gate / "I'm following you!" interaction, Email capture, or Reel DM trigger
              try {
                const quickReplyPayload = item.message?.quick_reply?.payload;
                const isFollowCheckRequest =
                  quickReplyPayload?.startsWith('CHECK_FOLLOW') ||
                  text.toLowerCase().includes("i'm following you") ||
                  text.toLowerCase().includes('im following you');

                const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);

                const dbAcc = await getInboxAccount(accountId);
                const token = dbAcc?.page_access_token || dbAcc?.access_token;

                if (token) {
                  const autos = await listReelAutomations('travel_kathegalu');
                  const activeAuto = autos.find((a) => a.is_active) || {
                    id: 'default',
                    tenant_id: 'travel_kathegalu',
                    name: 'Default Guide Automation',
                    reel_id: 'ALL',
                    trigger_type: 'both' as const,
                    trigger_keywords: 'GUIDE,PDF,DAY15,ITINERARY',
                    require_follow: true,
                    gate_message: "This guide is only for my followers! Would really appreciate the support first and then I'll send it over!",
                    gate_button_text: "I'm following you!",
                    not_following_message: "Looks like you're not following yet. Follow @travel_kathegalu, then tap again 👇",
                    success_message: "you asked for this resource...\nhere it is 🎁\ntap the first button below to open it 👇",
                    button_title: "Get the guide 🎁",
                    button_url: "https://tysonlabs.in/guides/bengaluru-itinerary-2026.pdf",
                    ask_email: false,
                    is_active: true,
                    total_comments_replied: 0,
                    total_dms_sent: 0,
                    total_followers_gated: 0,
                    total_guides_unlocked: 0,
                  };

                  if (emailMatch) {
                    // Follower submitted their email address!
                    const capturedEmail = emailMatch[0].toLowerCase();
                    await saveLeadCapture({
                      automation_id: activeAuto.id,
                      tenant_id: 'travel_kathegalu',
                      participant_id: senderId,
                      participant_username: senderUsername,
                      participant_name: senderName,
                      status: 'unlocked',
                      email: capturedEmail,
                      unlocked: true,
                    });

                    // Send unlocked resource card
                    await sendInstagramButtonCard({
                      igUserId: accountId,
                      recipientId: senderId,
                      title: activeAuto.success_message,
                      buttons: [{ type: 'web_url', title: activeAuto.button_title, url: activeAuto.button_url }],
                      accessToken: token,
                    });
                    await incrementReelAutomationStat(activeAuto.id, 'total_guides_unlocked');
                    console.log(`[Meta Webhook] Captured email "${capturedEmail}" and sent unlocked resource card to ${senderName}`);
                  } else if (isFollowCheckRequest) {
                    // Follower tapped "I'm following you!" quick reply button
                    const { isFollowing } = await checkUserFollowsBusiness(senderId, token);

                    if (!isFollowing) {
                      // Still not following yet
                      await sendInstagramQuickReplyMessage({
                        igUserId: accountId,
                        recipientId: senderId,
                        text: activeAuto.not_following_message,
                        buttons: [{ title: activeAuto.gate_button_text, payload: `CHECK_FOLLOW_${activeAuto.id}` }],
                        accessToken: token,
                      });
                      await saveLeadCapture({
                        automation_id: activeAuto.id,
                        tenant_id: 'travel_kathegalu',
                        participant_id: senderId,
                        participant_username: senderUsername,
                        participant_name: senderName,
                        status: 'gated',
                      });
                      console.log(`[Meta Webhook] Follow verification failed: user ${senderId} not following yet`);
                    } else {
                      // Verified follower!
                      if (activeAuto.ask_email) {
                        await saveLeadCapture({
                          automation_id: activeAuto.id,
                          tenant_id: 'travel_kathegalu',
                          participant_id: senderId,
                          participant_username: senderUsername,
                          participant_name: senderName,
                          status: 'awaiting_email',
                        });
                        await sendInstagramDirectMessage({
                          igUserId: accountId,
                          recipientId: senderId,
                          text: "Awesome 👏 What's the best email to send this to? Reply with your email 👇",
                          accessToken: token,
                        });
                        console.log(`[Meta Webhook] Follow verified for ${senderName}! Prompted for email.`);
                      } else {
                        await saveLeadCapture({
                          automation_id: activeAuto.id,
                          tenant_id: 'travel_kathegalu',
                          participant_id: senderId,
                          participant_username: senderUsername,
                          participant_name: senderName,
                          status: 'unlocked',
                          unlocked: true,
                        });
                        await sendInstagramButtonCard({
                          igUserId: accountId,
                          recipientId: senderId,
                          title: activeAuto.success_message,
                          buttons: [{ type: 'web_url', title: activeAuto.button_title, url: activeAuto.button_url }],
                          accessToken: token,
                        });
                        await incrementReelAutomationStat(activeAuto.id, 'total_guides_unlocked');
                        console.log(`[Meta Webhook] Follow verified! Delivered unlocked guide card to ${senderId}`);
                      }
                    }
                  } else {
                    // Check if inbound DM matches any Reel Automation keyword (e.g. DAY15, GUIDE, ITINERARY)
                    const matchingAuto = await findMatchingReelAutomation('travel_kathegalu', {
                      text,
                      channelType: 'dm',
                    });

                    if (matchingAuto) {
                      const { isFollowing } = await checkUserFollowsBusiness(senderId, token);

                      if (matchingAuto.require_follow && !isFollowing) {
                        // User does not follow yet -> Send Gate with "I'm following you!" quick reply
                        await sendInstagramQuickReplyMessage({
                          igUserId: accountId,
                          recipientId: senderId,
                          text: matchingAuto.gate_message,
                          buttons: [{ title: matchingAuto.gate_button_text, payload: `CHECK_FOLLOW_${matchingAuto.id}` }],
                          accessToken: token,
                        });
                        await saveLeadCapture({
                          automation_id: matchingAuto.id,
                          tenant_id: 'travel_kathegalu',
                          participant_id: senderId,
                          participant_username: senderUsername,
                          participant_name: senderName,
                          status: 'gated',
                        });
                        await incrementReelAutomationStat(matchingAuto.id, 'total_followers_gated');
                        console.log(`[Meta Webhook] Sent follow-gate DM to ${senderName}`);
                      } else {
                        if (matchingAuto.ask_email) {
                          await saveLeadCapture({
                            automation_id: matchingAuto.id,
                            tenant_id: 'travel_kathegalu',
                            participant_id: senderId,
                            participant_username: senderUsername,
                            participant_name: senderName,
                            status: 'awaiting_email',
                          });
                          await sendInstagramDirectMessage({
                            igUserId: accountId,
                            recipientId: senderId,
                            text: "Awesome 👏 What's the best email to send this to? Reply with your email 👇",
                            accessToken: token,
                          });
                        } else {
                          await saveLeadCapture({
                            automation_id: matchingAuto.id,
                            tenant_id: 'travel_kathegalu',
                            participant_id: senderId,
                            participant_username: senderUsername,
                            participant_name: senderName,
                            status: 'unlocked',
                            unlocked: true,
                          });
                          await sendInstagramButtonCard({
                            igUserId: accountId,
                            recipientId: senderId,
                            title: matchingAuto.success_message,
                            buttons: [{ type: 'web_url', title: matchingAuto.button_title, url: matchingAuto.button_url }],
                            accessToken: token,
                          });
                          await incrementReelAutomationStat(matchingAuto.id, 'total_guides_unlocked');
                          console.log(`[Meta Webhook] Delivered unlocked guide card to follower ${senderName}`);
                        }
                      }
                      await incrementReelAutomationStat(matchingAuto.id, 'total_dms_sent');
                    }
                  }
                }
              } catch (reelDmErr: any) {
                console.warn('[Meta Webhook] Reel DM automation check warning:', reelDmErr.message);
              }
            } catch (dmErr: any) {
              console.error('[Meta Webhook] Error ingesting DM:', dmErr.message);
            }
          }
        }
      }

      // 2. Comments on Posts/Reels
      if (Array.isArray(entry.changes)) {
        for (const change of entry.changes) {
          if (change.field === 'comments' && change.value) {
            const val = change.value;
            const commenterId = val.from?.id;
            const commenterUsername = val.from?.username || 'traveler';
            const isOwnComment = commenterId === accountId || commenterUsername === 'travel_kathegalu';

            try {
              await ingestInstagramComment({
                commentId: val.id,
                accountId,
                accountName: 'Travel Kathegalu',
                tenantId: 'travel_kathegalu',
                fromId: commenterId || 'unknown',
                fromUsername: commenterUsername,
                text: val.text || '',
                mediaId: val.media?.id || 'media_post',
                parentId: val.parent_id,
                rawPayload: val,
              });
              console.log(`[Meta Webhook] Ingested ${isOwnComment ? 'own reply' : 'user'} comment on media ${val.media?.id}`);

              // Never run auto-reply on our own comment replies!
              if (isOwnComment) {
                continue;
              }

              // Handle Comment Automation + Public Reply + DM Follow Gate
              const commentText = val.text || '';
              const reelMediaId = val.media?.id;

              const dbAcc = await getInboxAccount(accountId);
              const token = dbAcc?.page_access_token || dbAcc?.access_token;

              if (token && commenterId) {
                const matchingAuto = await findMatchingReelAutomation('travel_kathegalu', {
                  reelId: reelMediaId,
                  text: commentText,
                  channelType: 'comment',
                });

                if (matchingAuto) {
                  // 1. Reply to comment publicly
                  if (matchingAuto.public_comment_reply) {
                    try {
                      await replyToInstagramComment({
                        commentId: val.id,
                        text: matchingAuto.public_comment_reply,
                        accessToken: token,
                      });
                      await incrementReelAutomationStat(matchingAuto.id, 'total_comments_replied');
                      console.log(`[Meta Webhook] Publicly replied to comment ${val.id}`);
                    } catch (replyErr: any) {
                      console.warn('[Meta Webhook] Failed to reply to comment:', replyErr.message);
                    }
                  }

                  // 2. Check follow status & dispatch DM
                  const { isFollowing } = await checkUserFollowsBusiness(commenterId, token);

                  if (matchingAuto.require_follow && !isFollowing) {
                    await sendInstagramQuickReplyMessage({
                      igUserId: accountId,
                      recipientId: commenterId,
                      text: matchingAuto.gate_message,
                      buttons: [{ title: matchingAuto.gate_button_text, payload: `CHECK_FOLLOW_${matchingAuto.id}` }],
                      accessToken: token,
                    });
                    await saveLeadCapture({
                      automation_id: matchingAuto.id,
                      tenant_id: 'travel_kathegalu',
                      participant_id: commenterId,
                      participant_username: commenterUsername,
                      reel_id: reelMediaId,
                      status: 'gated',
                    });
                    await incrementReelAutomationStat(matchingAuto.id, 'total_followers_gated');
                    console.log(`[Meta Webhook] Sent follow-gate DM to commenter @${commenterUsername}`);
                  } else {
                    if (matchingAuto.ask_email) {
                      await saveLeadCapture({
                        automation_id: matchingAuto.id,
                        tenant_id: 'travel_kathegalu',
                        participant_id: commenterId,
                        participant_username: commenterUsername,
                        reel_id: reelMediaId,
                        status: 'awaiting_email',
                      });
                      await sendInstagramDirectMessage({
                        igUserId: accountId,
                        recipientId: commenterId,
                        text: "Awesome 👏 What's the best email to send this to? Reply with your email 👇",
                        accessToken: token,
                      });
                    } else {
                      await saveLeadCapture({
                        automation_id: matchingAuto.id,
                        tenant_id: 'travel_kathegalu',
                        participant_id: commenterId,
                        participant_username: commenterUsername,
                        reel_id: reelMediaId,
                        status: 'unlocked',
                        unlocked: true,
                      });
                      await sendInstagramButtonCard({
                        igUserId: accountId,
                        recipientId: commenterId,
                        title: matchingAuto.success_message,
                        buttons: [{ type: 'web_url', title: matchingAuto.button_title, url: matchingAuto.button_url }],
                        accessToken: token,
                      });
                      await incrementReelAutomationStat(matchingAuto.id, 'total_guides_unlocked');
                    }
                  }
                  await incrementReelAutomationStat(matchingAuto.id, 'total_dms_sent');
                }
              }
            } catch (commentErr: any) {
              console.error('[Meta Webhook] Error ingesting comment:', commentErr.message);
            }
          }
        }
      }
    }
  }

  // Always respond with 200 OK so Meta does not retry
  return NextResponse.json({ status: 'received' }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
}
