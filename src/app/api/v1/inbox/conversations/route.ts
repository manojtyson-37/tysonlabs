import { NextRequest, NextResponse } from 'next/server';
import { listConversations } from '@/lib/inbox-db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get('tenantId') || 'travel_kathegalu';
  const platform = searchParams.get('platform') || undefined;
  const channelType = searchParams.get('channelType') || undefined;
  const status = searchParams.get('status') || undefined;
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  try {
    const conversations = await listConversations({
      tenantId,
      platform,
      channelType,
      status,
      limit,
    });

    return NextResponse.json(
      { conversations },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err: any) {
    console.error('[Inbox API] listConversations error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
