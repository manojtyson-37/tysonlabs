import { describe, it, expect, vi } from 'vitest';
import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { GET, POST } from '@/app/api/v1/webhooks/meta/route';

describe('Meta Webhook Route (/api/v1/webhooks/meta)', () => {
  const secret = process.env.FACEBOOK_APP_SECRET || 'e5befb29390dff677e418a88c63c8fc5';

  it('verifies Meta webhook challenge on GET with valid token', async () => {
    const challenge = 'challenge_test_code_12345';
    const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN || 'tysonlabs_meta_webhook_secret';

    const req = new NextRequest(
      `https://tysonlabs.in/api/v1/webhooks/meta?hub.mode=subscribe&hub.verify_token=${verifyToken}&hub.challenge=${challenge}`
    );

    const res = await GET(req);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toBe(challenge);
  });

  it('rejects GET verification with invalid token', async () => {
    const req = new NextRequest(
      'https://tysonlabs.in/api/v1/webhooks/meta?hub.mode=subscribe&hub.verify_token=wrong_token&hub.challenge=test'
    );

    const res = await GET(req);
    expect(res.status).toBe(403);
  });

  it('rejects POST with invalid HMAC signature', async () => {
    const payload = JSON.stringify({ object: 'instagram', entry: [] });
    const req = new NextRequest('https://tysonlabs.in/api/v1/webhooks/meta', {
      method: 'POST',
      headers: {
        'x-hub-signature-256': 'sha256=badbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadbadb',
        'content-type': 'application/json',
      },
      body: payload,
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('accepts POST with valid HMAC signature and processes payload', async () => {
    const payloadObj = {
      object: 'instagram',
      entry: [
        {
          id: '17841432905297253',
          time: 1731534000,
          messaging: [
            {
              sender: { id: 'ig_test_user_42' },
              recipient: { id: '17841432905297253' },
              timestamp: 1731534000000,
              message: {
                mid: `mid_vitest_${Date.now()}`,
                text: 'Hello Travel Kathegalu, when are you visiting Mysore?',
              },
            },
          ],
        },
      ],
    };

    const rawBody = JSON.stringify(payloadObj);
    const hash = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

    const req = new NextRequest('https://tysonlabs.in/api/v1/webhooks/meta', {
      method: 'POST',
      headers: {
        'x-hub-signature-256': `sha256=${hash}`,
        'content-type': 'application/json',
      },
      body: rawBody,
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('received');
  });
});
