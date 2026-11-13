import { NextRequest, NextResponse } from 'next/server';
import { verifyMetaWebhookHmac } from '@/lib/instagram';
import {
  ingestInstagramDm,
  ingestInstagramComment,
  logWebhookEvent,
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

  // Handle Instagram Webhook Events
  if (objectType === 'instagram' && Array.isArray(payload.entry)) {
    for (const entry of payload.entry) {
      const accountId = entry.id;

      // 1. Direct Messages
      if (Array.isArray(entry.messaging)) {
        for (const item of entry.messaging) {
          const senderId = item.sender?.id;
          const recipientId = item.recipient?.id;
          const message = item.message;

          if (message && senderId && recipientId) {
            // Text or fallback for media
            let text = message.text || '';
            if (!text && message.attachments && message.attachments.length > 0) {
              const att = message.attachments[0];
              text = `[Sent ${att.type || 'media'}]`;
            }

            try {
              await ingestInstagramDm({
                messageId: message.mid || `mid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                accountId,
                accountName: 'Travel Kathegalu',
                tenantId: 'travel_kathegalu',
                senderId,
                recipientId,
                text,
                timestamp: item.timestamp,
                rawPayload: item,
              });
              console.log(`[Meta Webhook] Ingested Instagram DM from ${senderId}`);
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
            try {
              await ingestInstagramComment({
                commentId: val.id,
                accountId,
                accountName: 'Travel Kathegalu',
                tenantId: 'travel_kathegalu',
                fromId: val.from?.id || 'unknown',
                fromUsername: val.from?.username || 'traveler',
                text: val.text || '',
                mediaId: val.media?.id || 'media_post',
                parentId: val.parent_id,
                rawPayload: val,
              });
              console.log(`[Meta Webhook] Ingested Instagram Comment on media ${val.media?.id}`);
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
