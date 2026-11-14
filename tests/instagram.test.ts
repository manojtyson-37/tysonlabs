import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import {
  getInstagramAuthUrl,
  getDirectInstagramAuthUrl,
  parseSignedRequest,
  verifyMetaWebhookHmac,
} from '@/lib/instagram';

describe('Instagram Graph API Helpers', () => {
  it('generates a valid Meta OAuth URL with config_id or required scopes', () => {
    const url = getInstagramAuthUrl({
      appId: '1234567890',
      redirectUri: 'https://tysonlabs.in/api/auth/instagram/callback',
      state: 'test-state-123',
    });

    expect(url).toContain('https://www.facebook.com/v21.0/dialog/oauth');
    expect(url).toContain('client_id=1234567890');
    expect(url).toContain('state=test-state-123');
    expect(url).toContain('config_id=1658341599370365');
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

  it('generates a direct Instagram login URL without Facebook Page requirement', () => {
    const url = getDirectInstagramAuthUrl({
      appId: '2229540584495459',
      redirectUri: 'https://tysonlabs.in/api/auth/instagram/callback',
      state: 'direct-state-456',
    });

    expect(url).toContain('https://api.instagram.com/oauth/authorize');
    expect(url).toContain('client_id=2229540584495459');
    expect(url).toContain('redirect_uri=https%3A%2F%2Ftysonlabs.in%2Fapi%2Fauth%2Finstagram%2Fcallback');
    expect(url).toContain('scope=');
    expect(url).toContain('instagram_business_basic');
    expect(url).toContain('instagram_business_manage_messages');
    expect(url).toContain('instagram_business_manage_comments');
  });

  it('resolves Instagram accounts connected via assigned_pages when accounts is empty', async () => {
    const { getConnectedInstagramAccounts } = await import('@/lib/instagram');

    const originalFetch = global.fetch;
    global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const urlStr = input.toString();
      if (urlStr.includes('me/accounts')) {
        return new Response(JSON.stringify({ data: [] }), { status: 200 });
      }
      if (urlStr.includes('me/assigned_pages')) {
        return new Response(
          JSON.stringify({
            data: [
              {
                id: '1116550554884886',
                name: 'Travel Kathegalu by Devika Ramm',
                instagram_business_account: {
                  id: '17841470062375430',
                  username: 'travel_kathegalu',
                  name: 'Travel Kathegalu ✈️🌍| Bangalore Travel',
                  profile_picture_url: 'https://example.com/pic.jpg',
                },
              },
            ],
          }),
          { status: 200 }
        );
      }
      return originalFetch(input, init);
    };

    try {
      const accounts = await getConnectedInstagramAccounts('mock_user_token_123');
      expect(accounts).toHaveLength(1);
      expect(accounts[0].username).toBe('travel_kathegalu');
      expect(accounts[0].id).toBe('17841470062375430');
      expect(accounts[0].pageId).toBe('1116550554884886');
      expect(accounts[0].pageAccessToken).toBe('mock_user_token_123');
    } finally {
      global.fetch = originalFetch;
    }
  });
});
