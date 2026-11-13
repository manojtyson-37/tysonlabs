import { NextRequest, NextResponse } from 'next/server';
import { getConversationWithMessages, updateConversationStatus } from '@/lib/inbox-db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const data = await getConversationWithMessages(id);
    if (!data.conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err: any) {
    console.error('[Inbox API] getConversationWithMessages error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { status } = body;
    if (!status || !['open', 'replied', 'resolved', 'archived'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    await updateConversationStatus(id, status);
    return NextResponse.json({ success: true, status });
  } catch (err: any) {
    console.error('[Inbox API] updateConversationStatus error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
