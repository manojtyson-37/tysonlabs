import crypto from 'crypto';

export const META_GRAPH_VERSION = process.env.INSTAGRAM_GRAPH_VERSION || 'v21.0';
export const META_GRAPH_BASE = `https://graph.facebook.com/${META_GRAPH_VERSION}`;

export interface InstagramAccount {
  id: string; // Instagram Business / Creator Account ID
  username: string;
  name?: string;
  profilePictureUrl?: string;
  pageId: string;
  pageName: string;
  pageAccessToken: string;
}

export interface PublishMediaResponse {
  id: string; // Published Instagram media ID
}

export interface MediaContainerResponse {
  id: string; // Media container creation ID
}

/**
 * Generate the Meta OAuth authorization URL for Instagram Graph API.
 * Requesting permissions:
 * - instagram_basic: read basic profile & media
 * - instagram_content_publish: create & publish reels, carousels, and posts
 * - instagram_manage_insights: read analytics and performance metrics
 * - instagram_manage_comments: reply to and manage comments
 * - pages_show_list: list pages connected to the user
 * - pages_read_engagement: read engagement from linked page
 * - business_management: manage business assets
 */
export function getInstagramAuthUrl(options: {
  appId?: string;
  redirectUri: string;
  state: string;
}): string {
  const appId = options.appId || process.env.FACEBOOK_APP_ID || process.env.VITE_FACEBOOK_APP_ID || '';
  const scopes = [
    'instagram_basic',
    'instagram_content_publish',
    'instagram_manage_insights',
    'instagram_manage_comments',
    'pages_show_list',
    'pages_read_engagement',
    'business_management',
  ].join(',');

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: options.redirectUri,
    state: options.state,
    scope: scopes,
    response_type: 'code',
  });

  return `https://www.facebook.com/${META_GRAPH_VERSION}/dialog/oauth?${params.toString()}`;
}

/**
 * Exchange OAuth authorization code for short-lived user access token,
 * and automatically upgrade it to a 60-day long-lived token.
 */
export async function exchangeCodeForLongLivedToken(options: {
  code: string;
  redirectUri: string;
  appId?: string;
  appSecret?: string;
}): Promise<{ accessToken: string; expiresIn: number }> {
  const appId = options.appId || process.env.FACEBOOK_APP_ID || process.env.VITE_FACEBOOK_APP_ID;
  const appSecret = options.appSecret || process.env.FACEBOOK_APP_SECRET;

  if (!appId || !appSecret) {
    throw new Error('FACEBOOK_APP_ID and FACEBOOK_APP_SECRET are required for token exchange');
  }

  // 1. Get short-lived token
  const tokenUrl = new URL(`${META_GRAPH_BASE}/oauth/access_token`);
  tokenUrl.searchParams.set('client_id', appId);
  tokenUrl.searchParams.set('client_secret', appSecret);
  tokenUrl.searchParams.set('redirect_uri', options.redirectUri);
  tokenUrl.searchParams.set('code', options.code);

  const shortRes = await fetch(tokenUrl.toString());
  if (!shortRes.ok) {
    const err = await shortRes.text();
    throw new Error(`Failed to exchange code for token: ${err}`);
  }
  const shortData = await shortRes.json();
  const shortLivedToken = shortData.access_token;

  // 2. Exchange for 60-day long-lived token
  const longTokenUrl = new URL(`${META_GRAPH_BASE}/oauth/access_token`);
  longTokenUrl.searchParams.set('grant_type', 'fb_exchange_token');
  longTokenUrl.searchParams.set('client_id', appId);
  longTokenUrl.searchParams.set('client_secret', appSecret);
  longTokenUrl.searchParams.set('fb_exchange_token', shortLivedToken);

  const longRes = await fetch(longTokenUrl.toString());
  if (!longRes.ok) {
    // If upgrade fails, return short-lived token as fallback
    return { accessToken: shortLivedToken, expiresIn: shortData.expires_in || 3600 };
  }
  const longData = await longRes.json();
  return {
    accessToken: longData.access_token,
    expiresIn: longData.expires_in || 5184000, // 60 days
  };
}

/**
 * Find all Instagram Business or Creator Accounts linked to the user's Facebook Pages.
 */
export async function getConnectedInstagramAccounts(
  userAccessToken: string
): Promise<InstagramAccount[]> {
  const accountsUrl = `${META_GRAPH_BASE}/me/accounts?fields=id,name,access_token,instagram_business_account{id,username,name,profile_picture_url}&access_token=${userAccessToken}`;

  const res = await fetch(accountsUrl);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to fetch connected Facebook Pages: ${err}`);
  }

  const data = await res.json();
  const accounts: InstagramAccount[] = [];

  if (Array.isArray(data.data)) {
    for (const page of data.data) {
      if (page.instagram_business_account) {
        const ig = page.instagram_business_account;
        accounts.push({
          id: ig.id,
          username: ig.username,
          name: ig.name,
          profilePictureUrl: ig.profile_picture_url,
          pageId: page.id,
          pageName: page.name,
          pageAccessToken: page.access_token,
        });
      }
    }
  }

  return accounts;
}

/**
 * Publish a single photo to an Instagram Business account.
 */
export async function publishSinglePhoto(options: {
  igUserId: string;
  accessToken: string;
  imageUrl: string;
  caption?: string;
}): Promise<PublishMediaResponse> {
  const { igUserId, accessToken, imageUrl, caption } = options;

  // Step 1: Create media container
  const containerUrl = `${META_GRAPH_BASE}/${igUserId}/media`;
  const containerBody = new URLSearchParams({
    image_url: imageUrl,
    access_token: accessToken,
  });
  if (caption) containerBody.set('caption', caption);

  const createRes = await fetch(containerUrl, { method: 'POST', body: containerBody });
  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Failed to create photo container: ${err}`);
  }
  const containerData: MediaContainerResponse = await createRes.json();

  // Step 2: Publish container
  return publishMediaContainer(igUserId, accessToken, containerData.id);
}

/**
 * Publish an Instagram Reel (Video).
 */
export async function publishReel(options: {
  igUserId: string;
  accessToken: string;
  videoUrl: string;
  caption?: string;
  coverUrl?: string;
  shareToFeed?: boolean;
}): Promise<PublishMediaResponse> {
  const { igUserId, accessToken, videoUrl, caption, coverUrl, shareToFeed = true } = options;

  // Step 1: Create Reel media container
  const containerUrl = `${META_GRAPH_BASE}/${igUserId}/media`;
  const containerBody = new URLSearchParams({
    media_type: 'REELS',
    video_url: videoUrl,
    share_to_feed: shareToFeed ? 'true' : 'false',
    access_token: accessToken,
  });
  if (caption) containerBody.set('caption', caption);
  if (coverUrl) containerBody.set('cover_url', coverUrl);

  const createRes = await fetch(containerUrl, { method: 'POST', body: containerBody });
  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Failed to create reel container: ${err}`);
  }
  const containerData: MediaContainerResponse = await createRes.json();

  // Reels need upload processing time before publish
  await waitForContainerReady(containerData.id, accessToken);

  // Step 2: Publish container
  return publishMediaContainer(igUserId, accessToken, containerData.id);
}

/**
 * Publish an Instagram Carousel (up to 10 slides).
 */
export async function publishCarousel(options: {
  igUserId: string;
  accessToken: string;
  items: Array<{ url: string; isVideo?: boolean }>;
  caption?: string;
}): Promise<PublishMediaResponse> {
  const { igUserId, accessToken, items, caption } = options;
  if (!items || items.length < 2 || items.length > 10) {
    throw new Error('Carousel requires between 2 and 10 items');
  }

  // Step 1: Create item containers
  const childContainerIds: string[] = [];
  for (const item of items) {
    const childUrl = `${META_GRAPH_BASE}/${igUserId}/media`;
    const childParams = new URLSearchParams({
      is_carousel_item: 'true',
      access_token: accessToken,
    });
    if (item.isVideo) {
      childParams.set('media_type', 'VIDEO');
      childParams.set('video_url', item.url);
    } else {
      childParams.set('image_url', item.url);
    }

    const childRes = await fetch(childUrl, { method: 'POST', body: childParams });
    if (!childRes.ok) {
      const err = await childRes.text();
      throw new Error(`Failed to create carousel item: ${err}`);
    }
    const childData = await childRes.json();
    childContainerIds.push(childData.id);
  }

  // Wait for all video items if any
  for (const childId of childContainerIds) {
    await waitForContainerReady(childId, accessToken);
  }

  // Step 2: Create parent carousel container
  const parentUrl = `${META_GRAPH_BASE}/${igUserId}/media`;
  const parentParams = new URLSearchParams({
    media_type: 'CAROUSEL',
    children: childContainerIds.join(','),
    access_token: accessToken,
  });
  if (caption) parentParams.set('caption', caption);

  const parentRes = await fetch(parentUrl, { method: 'POST', body: parentParams });
  if (!parentRes.ok) {
    const err = await parentRes.text();
    throw new Error(`Failed to create parent carousel container: ${err}`);
  }
  const parentData: MediaContainerResponse = await parentRes.json();

  // Step 3: Publish container
  return publishMediaContainer(igUserId, accessToken, parentData.id);
}

/**
 * Publish an already-created media container.
 */
async function publishMediaContainer(
  igUserId: string,
  accessToken: string,
  creationId: string
): Promise<PublishMediaResponse> {
  const publishUrl = `${META_GRAPH_BASE}/${igUserId}/media_publish`;
  const publishBody = new URLSearchParams({
    creation_id: creationId,
    access_token: accessToken,
  });

  const res = await fetch(publishUrl, { method: 'POST', body: publishBody });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to publish media: ${err}`);
  }

  return res.json();
}

/**
 * Wait for a video/reel container status to be FINISHED before publishing.
 */
async function waitForContainerReady(
  containerId: string,
  accessToken: string,
  maxAttempts = 15,
  delayMs = 2000
): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    const statusUrl = `${META_GRAPH_BASE}/${containerId}?fields=status_code&access_token=${accessToken}`;
    const res = await fetch(statusUrl);
    if (res.ok) {
      const data = await res.json();
      if (data.status_code === 'FINISHED') {
        return;
      }
      if (data.status_code === 'ERROR' || data.status_code === 'EXPIRED') {
        throw new Error(`Container processing failed with status: ${data.status_code}`);
      }
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
}

/**
 * Retrieve account-level insights (impressions, reach, profile views, follower count).
 */
export async function getAccountInsights(
  igUserId: string,
  accessToken: string,
  metrics: string[] = ['impressions', 'reach', 'profile_views'],
  period = 'day'
) {
  const url = `${META_GRAPH_BASE}/${igUserId}/insights?metric=${metrics.join(',')}&period=${period}&access_token=${accessToken}`;
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to fetch account insights: ${err}`);
  }
  return res.json();
}

/**
 * Parse and verify Meta's signed_request parameter (used in data deletion callbacks & canvas).
 */
export function parseSignedRequest(signedRequest: string, appSecret?: string): Record<string, any> | null {
  const secret = appSecret || process.env.FACEBOOK_APP_SECRET;
  const parts = signedRequest.split('.', 2);
  if (parts.length !== 2) return null;

  const [encodedSig, payload] = parts;
  const sig = Buffer.from(encodedSig.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
  const rawPayload = Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');

  let data: Record<string, any>;
  try {
    data = JSON.parse(rawPayload);
  } catch {
    return null;
  }

  // Verify HMAC if secret is configured
  if (secret) {
    const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest();
    if (!crypto.timingSafeEqual(sig, expectedSig)) {
      throw new Error('Invalid signed_request signature');
    }
  }

  return data;
}
