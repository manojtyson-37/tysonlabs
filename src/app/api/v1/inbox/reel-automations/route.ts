import { NextRequest, NextResponse } from 'next/server';
import {
  listReelAutomations,
  upsertReelAutomation,
  deleteReelAutomation,
} from '@/lib/inbox-db';

export async function GET(req: NextRequest) {
  const tenantId = req.nextUrl.searchParams.get('tenantId') || 'travel_kathegalu';
  try {
    const automations = await listReelAutomations(tenantId);
    return NextResponse.json({ automations }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err: any) {
    console.error('[Reel Automations API] GET error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id = `auto_reel_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      tenantId = 'travel_kathegalu',
      name,
      reelId = 'ALL',
      reelCaption,
      reelPermalink,
      triggerType = 'both',
      triggerKeywords = 'GUIDE,PDF,DAY15,ITINERARY',
      publicCommentReply,
      requireFollow = true,
      gateMessage,
      gateButtonText = "I'm following you!",
      notFollowingMessage,
      successMessage,
      buttonTitle = 'Get the guide 🎁',
      buttonUrl = 'https://tysonlabs.in/guides/bengaluru-itinerary-2026.pdf',
      askEmail = false,
      isActive = true,
    } = body;

    if (!name) {
      return NextResponse.json({ error: 'Automation name is required' }, { status: 400 });
    }

    const saved = await upsertReelAutomation({
      id,
      tenant_id: tenantId,
      name,
      reel_id: reelId,
      reel_caption: reelCaption || null,
      reel_permalink: reelPermalink || null,
      trigger_type: triggerType,
      trigger_keywords: triggerKeywords,
      public_comment_reply: publicCommentReply || null,
      require_follow: requireFollow,
      gate_message: gateMessage || "This guide is only for my followers! Would really appreciate the support first and then I'll send it over!",
      gate_button_text: gateButtonText,
      not_following_message: notFollowingMessage || "Looks like you're not following yet. Follow @travel_kathegalu, then tap again 👇",
      success_message: successMessage || "you asked for this resource...\nhere it is 🎁\ntap the first button below to open it 👇",
      button_title: buttonTitle,
      button_url: buttonUrl,
      ask_email: askEmail,
      is_active: isActive,
    });

    return NextResponse.json({ success: true, automation: saved });
  } catch (err: any) {
    console.error('[Reel Automations API] POST error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id');
    const tenantId = req.nextUrl.searchParams.get('tenantId') || 'travel_kathegalu';

    if (!id) {
      return NextResponse.json({ error: 'id query param is required' }, { status: 400 });
    }

    await deleteReelAutomation(id, tenantId);
    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    console.error('[Reel Automations API] DELETE error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
