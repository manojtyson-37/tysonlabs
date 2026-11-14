import { NextRequest, NextResponse } from 'next/server';
import {
  listPaidRules,
  upsertPaidRule,
  deletePaidRule,
} from '@/lib/inbox-db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenantId = searchParams.get('tenantId') || 'travel_kathegalu';
    const rules = await listPaidRules(tenantId);
    return NextResponse.json({ rules }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err: any) {
    console.error('[Paid Rules API] GET error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id = `rule_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      tenantId = 'travel_kathegalu',
      name,
      keyword,
      matchType = 'contains',
      priceInr = 199,
      paymentLink,
      replyTemplate,
      deliveryAssetUrl,
      deliveryMessage,
      isActive = true,
    } = body;

    if (!name || !keyword || !paymentLink || !replyTemplate) {
      return NextResponse.json(
        { error: 'name, keyword, paymentLink, and replyTemplate are required' },
        { status: 400 }
      );
    }

    const saved = await upsertPaidRule({
      id,
      tenant_id: tenantId,
      name,
      keyword,
      match_type: matchType,
      price_inr: Number(priceInr),
      payment_link: paymentLink,
      reply_template: replyTemplate,
      delivery_asset_url: deliveryAssetUrl || null,
      delivery_message: deliveryMessage || null,
      is_active: isActive,
    });

    return NextResponse.json({ success: true, rule: saved });
  } catch (err: any) {
    console.error('[Paid Rules API] POST error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const tenantId = searchParams.get('tenantId') || 'travel_kathegalu';

    if (!id) {
      return NextResponse.json({ error: 'id query param is required' }, { status: 400 });
    }

    await deletePaidRule(id, tenantId);
    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    console.error('[Paid Rules API] DELETE error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
