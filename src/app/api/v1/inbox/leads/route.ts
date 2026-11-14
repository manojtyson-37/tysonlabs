import { NextRequest, NextResponse } from 'next/server';
import { listLeadCaptures } from '@/lib/inbox-db';

export async function GET(req: NextRequest) {
  const tenantId = req.nextUrl.searchParams.get('tenantId') || 'travel_kathegalu';
  try {
    const leads = await listLeadCaptures(tenantId);
    return NextResponse.json({ leads }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err: any) {
    console.error('[Leads API] GET error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
