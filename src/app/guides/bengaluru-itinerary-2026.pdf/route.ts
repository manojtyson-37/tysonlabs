import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.resolve(process.cwd(), 'public/guides/bengaluru-itinerary-2026.pdf');
    if (!fs.existsSync(filePath)) {
      return new NextResponse('Guide PDF not found', { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="bengaluru-itinerary-2026.pdf"',
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  } catch (err: any) {
    console.error('[Guides PDF Route] Error serving PDF:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
