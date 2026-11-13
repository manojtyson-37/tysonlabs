import { NextRequest, NextResponse } from 'next/server';
import { ingestInstagramDm, ingestInstagramComment } from '@/lib/inbox-db';

const PILOT_TEMPLATES = [
  {
    type: 'dm',
    senderName: 'Priya Sharma (@priya_travels_blr)',
    senderId: 'ig_user_priya_sharma',
    text: 'Hey! Loved your reel on Bengaluru Cafe in Jayanagar. Is parking available nearby on Sunday mornings?',
  },
  {
    type: 'dm',
    senderName: 'Arun Kumar (@arun_explores)',
    senderId: 'ig_user_arun_kumar',
    text: 'Hi Travel Kathegalu team! What are the best timings to avoid the queue for Rava Idli and Filter Coffee?',
  },
  {
    type: 'comment',
    senderName: 'namma_bengaluru_foodie',
    senderId: 'ig_user_namma_foodie',
    mediaId: 'media_reel_bengaluru_cafe_2026',
    text: 'That crispy masala dosa looks unreal! 🔥 Is this the spot near 2nd Block?',
  },
  {
    type: 'comment',
    senderName: 'karthik_wanderlust',
    senderId: 'ig_user_karthik_w',
    mediaId: 'media_reel_bengaluru_cafe_2026',
    text: 'Filter coffee here is top tier ☕ Definitely doing this on our weekend breakfast crawl.',
  },
];

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // empty body is acceptable, picks random template
    }

    const templateIndex =
      typeof body.templateIndex === 'number'
        ? body.templateIndex % PILOT_TEMPLATES.length
        : Math.floor(Math.random() * PILOT_TEMPLATES.length);

    const chosen = PILOT_TEMPLATES[templateIndex];
    const type = body.type || chosen.type;
    const text = body.text || chosen.text;
    const tenantId = body.tenantId || 'travel_kathegalu';
    const accountId = body.accountId || '17841432905297253';

    if (type === 'dm') {
      const senderName = body.senderName || chosen.senderName;
      const senderId = body.senderId || chosen.senderId;
      const result = await ingestInstagramDm({
        messageId: `mid_sim_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        accountId,
        accountName: 'Travel Kathegalu',
        tenantId,
        senderId,
        senderName,
        recipientId: accountId,
        text,
        timestamp: Date.now(),
        rawPayload: { simulated: true },
      });
      return NextResponse.json({ success: true, type: 'dm', ...result, text });
    } else {
      const fromUsername = body.fromUsername || chosen.senderName;
      const fromId = body.senderId || chosen.senderId;
      const mediaId = body.mediaId || (chosen as any).mediaId || 'media_reel_bengaluru_cafe_2026';
      const result = await ingestInstagramComment({
        commentId: `comment_sim_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        accountId,
        accountName: 'Travel Kathegalu',
        tenantId,
        fromId,
        fromUsername,
        text,
        mediaId,
        rawPayload: { simulated: true },
      });
      return NextResponse.json({ success: true, type: 'comment', ...result, text });
    }
  } catch (err: any) {
    console.error('[Inbox Simulate] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
