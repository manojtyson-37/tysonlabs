import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  checkUserFollowsBusiness,
  sendInstagramQuickReplyMessage,
  sendInstagramButtonCard,
} from '@/lib/instagram';

describe('Reel Automation & Follower Gate System', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('checks user follow status via Meta Graph API', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: '27310401221884879',
        name: 'ಮನು✨',
        username: 'manoj_tyson_37',
        is_user_follow_business: true,
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await checkUserFollowsBusiness('27310401221884879', 'test_token');
    expect(result.isFollowing).toBe(true);
    expect(result.username).toBe('manoj_tyson_37');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('fields=name,username,profile_pic,is_user_follow_business')
    );
  });

  it('correctly reports when a user does NOT follow the business', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: '99999999999999999',
        name: 'New Viewer',
        username: 'new_viewer',
        is_user_follow_business: false,
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await checkUserFollowsBusiness('99999999999999999', 'test_token');
    expect(result.isFollowing).toBe(false);
  });

  it('formats Instagram Quick Reply message with [I\'m following you!] button', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        recipient_id: '27310401221884879',
        message_id: 'mid_quick_reply_123',
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const res = await sendInstagramQuickReplyMessage({
      igUserId: '17841470062375430',
      recipientId: '27310401221884879',
      text: "This guide is only for my followers! Would really appreciate the support first and then I'll send it over!",
      buttons: [{ title: "I'm following you!", payload: 'CHECK_FOLLOW_auto_123' }],
      accessToken: 'test_token',
    });

    expect(res.message_id).toBe('mid_quick_reply_123');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/17841470062375430/messages'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          recipient: { id: '27310401221884879' },
          message: {
            text: "This guide is only for my followers! Would really appreciate the support first and then I'll send it over!",
            quick_replies: [
              {
                content_type: 'text',
                title: "I'm following you!",
                payload: 'CHECK_FOLLOW_auto_123',
              },
            ],
          },
        }),
      })
    );
  });

  it('formats Instagram Generic Template Button Card with [Get the guide 🎁] link', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        recipient_id: '27310401221884879',
        message_id: 'mid_card_123',
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const res = await sendInstagramButtonCard({
      igUserId: '17841470062375430',
      recipientId: '27310401221884879',
      title: "you asked for this resource...\nhere it is 🎁\ntap the first button below to open it 👇",
      buttons: [
        {
          type: 'web_url',
          title: 'Get the guide 🎁',
          url: 'https://tysonlabs.in/guides/bengaluru-itinerary-2026.pdf',
        },
      ],
      accessToken: 'test_token',
    });

    expect(res.message_id).toBe('mid_card_123');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/17841470062375430/messages'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          recipient: { id: '27310401221884879' },
          message: {
            attachment: {
              type: 'template',
              payload: {
                template_type: 'generic',
                elements: [
                  {
                    title: "you asked for this resource...\nhere it is 🎁\ntap the first button below to open it 👇",
                    subtitle: '',
                    buttons: [
                      {
                        type: 'web_url',
                        url: 'https://tysonlabs.in/guides/bengaluru-itinerary-2026.pdf',
                        title: 'Get the guide 🎁',
                      },
                    ],
                  },
                ],
              },
            },
          },
        }),
      })
    );
  });

  it('extracts valid emails from follower DM messages', () => {
    const validInputs = [
      { text: 'manojsuperb09@gmail.com', expected: 'manojsuperb09@gmail.com' },
      { text: 'My email is priya.sharma92@outlook.com please send', expected: 'priya.sharma92@outlook.com' },
      { text: 'hello@travelkathegalu.in', expected: 'hello@travelkathegalu.in' },
    ];

    for (const input of validInputs) {
      const match = input.text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      expect(match).not.toBeNull();
      expect(match![0]).toBe(input.expected);
    }
  });
});
