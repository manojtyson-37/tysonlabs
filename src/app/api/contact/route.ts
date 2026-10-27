import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, email, projectType, budget, message, honeypot } = data;

    // Honeypot spam check
    if (honeypot) {
      return NextResponse.json({ success: true, message: 'Message received.' });
    }

    // Server-side validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid name (at least 2 characters).' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: 'Please provide a message with at least 10 characters.' },
        { status: 400 }
      );
    }

    // In production, this can forward to Resend, SendGrid, or an internal webhook.
    // Log inquiry cleanly
    console.log('[TysonLabs Inquiry]', {
      name: name.trim(),
      email: email.trim(),
      projectType: projectType || 'Unspecified',
      budget: budget || 'Not disclosed',
      messageLength: message.trim().length,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Thank you for reaching out. We will review your inquiry and get back to you shortly.',
    });
  } catch (error) {
    console.error('[Contact Error]', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error while processing your request.' },
      { status: 500 }
    );
  }
}
