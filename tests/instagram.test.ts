import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { getInstagramAuthUrl, parseSignedRequest, verifyMetaWebhookHmac } from '@/lib/instagram';

describe('Instagram Graph API Helpers', () => {
  it('generates a valid Meta OAuth URL with required Instagram scopes', () => {
    const url = getInstagramAuthUrl({
      appId: '1234567890',
      redirectUri: 'https://tysonlabs.in/api/auth/instagram/callback',
      state: 'test-state-123',
    });

    expect(url).toContain('https://www.facebook.com/v21.0/dialog/oauth');
    expect(url).toContain('client_id=1234567890');
    expect(url).toContain('state=test-state-123');
    expect(url).toContain('scope=');
    expect(url).toContain('instagram_basic');
    expect(url).toContain('instagram_manage_messages');
    expect(url).toContain('instagram_content_publish');
    expect(url).toContain('instagram_manage_insights');
    expect(url).toContain('pages_show_list');
  });

  it('correctly parses and verifies a valid Meta signed_request', () => {
    const secret = 'test-meta-app-secret-32-chars-long';
    const payloadObj = {
      user_id: '122116957467405156',
      algorithm: 'HMAC-SHA256',
      issued_at: Math.floor(Date.now() / 1000),
    };

    const encodedPayload = Buffer.from(JSON.stringify(payloadObj))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const sig = crypto
      .createHmac('sha256', secret)
      .update(encodedPayload)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const signedRequest = `${sig}.${encodedPayload}`;

    const parsed = parseSignedRequest(signedRequest, secret);
    expect(parsed).not.toBeNull();
    expect(parsed?.user_id).toBe('122116957467405156');
  });

  it('rejects an invalid signed_request signature', () => {
    const secret = 'correct-secret';
    const wrongSecret = 'wrong-secret';
    const payloadObj = { user_id: '999', algorithm: 'HMAC-SHA256' };

    const encodedPayload = Buffer.from(JSON.stringify(payloadObj))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const sig = crypto
      .createHmac('sha256', wrongSecret)
      .update(encodedPayload)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const signedRequest = `${sig}.${encodedPayload}`;

    expect(() => parseSignedRequest(signedRequest, secret)).toThrow('Invalid signed_request signature');
  });

  it('validates Meta webhook x-hub-signature-256 header correctly', () => {
    const secret = 'test-meta-app-secret-12345';
    const payload = JSON.stringify({ object: 'instagram', entry: [] });

    const hash = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    const header = `sha256=${hash}`;

    expect(verifyMetaWebhookHmac(payload, header, secret)).toBe(true);
    expect(verifyMetaWebhookHmac(payload, 'sha256=invalidhash', secret)).toBe(false);
    expect(verifyMetaWebhookHmac(payload, null, secret)).toBe(false);
  });
});
