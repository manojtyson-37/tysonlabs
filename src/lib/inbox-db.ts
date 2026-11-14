import { Pool } from 'pg';

let pool: Pool | undefined;

export function getInboxPool(): Pool {
  if (!pool) {
    const url = process.env.DATABASE_URL || process.env.REVIEWS_DATABASE_URL;
    if (!url) {
      throw new Error('DATABASE_URL is not configured for inbox service');
    }
    pool = new Pool({
      connectionString: url,
      max: 5,
    });
  }
  return pool;
}

export interface ConversationRecord {
  id: string;
  tenant_id: string;
  platform: 'instagram' | 'whatsapp';
  channel_type: 'dm' | 'comment';
  account_id: string;
  account_name: string;
  participant_id: string;
  participant_name: string;
  participant_avatar?: string | null;
  subject_media_id?: string | null;
  subject_media_caption?: string | null;
  subject_media_url?: string | null;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  status: 'open' | 'replied' | 'resolved' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface MessageRecord {
  id: string;
  conversation_id: string;
  tenant_id: string;
  platform: 'instagram' | 'whatsapp';
  channel_type: 'dm' | 'comment';
  direction: 'inbound' | 'outbound';
  sender_id: string;
  sender_name: string;
  recipient_id: string;
  text: string;
  media_url?: string | null;
  parent_id?: string | null;
  status: 'delivered' | 'sent' | 'failed';
  raw_payload?: any;
  created_at: string;
}

export interface InboxAccountRecord {
  id: string;
  username: string;
  name?: string | null;
  page_id?: string | null;
  page_name?: string | null;
  access_token: string;
  page_access_token?: string | null;
  token_expires_at?: Date | null;
  tenant_id: string;
}

export async function upsertInboxAccount(account: InboxAccountRecord): Promise<void> {
  const p = getInboxPool();
  await p.query(
    `INSERT INTO inbox_accounts (
       id, username, name, page_id, page_name, access_token, page_access_token, token_expires_at, tenant_id, updated_at
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now())
     ON CONFLICT (id) DO UPDATE SET
       username = EXCLUDED.username,
       name = EXCLUDED.name,
       page_id = EXCLUDED.page_id,
       page_name = EXCLUDED.page_name,
       access_token = EXCLUDED.access_token,
       page_access_token = EXCLUDED.page_access_token,
       token_expires_at = EXCLUDED.token_expires_at,
       tenant_id = EXCLUDED.tenant_id,
       updated_at = now()`,
    [
      account.id,
      account.username,
      account.name || null,
      account.page_id || null,
      account.page_name || null,
      account.access_token,
      account.page_access_token || null,
      account.token_expires_at || null,
      account.tenant_id,
    ]
  );
}

export async function getInboxAccount(tenantOrId?: string): Promise<InboxAccountRecord | null> {
  const p = getInboxPool();
  if (tenantOrId) {
    const res = await p.query(
      `SELECT * FROM inbox_accounts WHERE id = $1 OR username = $1 OR tenant_id = $1 OR page_id = $1 ORDER BY updated_at DESC LIMIT 1`,
      [tenantOrId]
    );
    if (res.rows.length > 0) return res.rows[0];
  }
  const fallback = await p.query(
    `SELECT * FROM inbox_accounts ORDER BY updated_at DESC LIMIT 1`
  );
  return fallback.rows[0] || null;
}

/**
 * Log raw webhook payload for debugging and Meta audit trail.
 */
export async function logWebhookEvent(options: {
  id?: string;
  eventType: string;
  object?: string;
  rawPayload: any;
  processed?: boolean;
  errorMessage?: string;
}): Promise<void> {
  const p = getInboxPool();
  const id = options.id || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  await p.query(
    `INSERT INTO meta_webhook_events (id, event_type, object, raw_payload, processed, error_message, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, now())
     ON CONFLICT (id) DO NOTHING`,
    [
      id,
      options.eventType,
      options.object || null,
      JSON.stringify(options.rawPayload),
      options.processed ?? true,
      options.errorMessage || null,
    ]
  );
}

/**
 * Ingest an incoming Instagram DM into the conversation and messages tables.
 */
export async function ingestInstagramDm(options: {
  messageId: string;
  accountId: string;
  accountName?: string;
  tenantId?: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
  recipientId: string;
  text: string;
  timestamp?: number;
  rawPayload?: any;
}): Promise<{ conversationId: string; messageId: string }> {
  const p = getInboxPool();
  const tenantId = options.tenantId || 'travel_kathegalu';
  const accountName = options.accountName || 'Travel Kathegalu';

  // Check if message is outbound (echo from bot or sent by the creator)
  const isEcho = Boolean(
    options.senderId === options.accountId ||
    options.rawPayload?.is_echo ||
    options.rawPayload?.message?.is_echo
  );

  // The conversation participant is always the external user, not the brand account
  const participantId = isEcho ? options.recipientId : options.senderId;
  const conversationId = `ig_dm_${options.accountId}_${participantId}`;
  const direction: 'inbound' | 'outbound' = isEcho ? 'outbound' : 'inbound';
  const createdAt = options.timestamp ? new Date(options.timestamp) : new Date();

  const senderName = isEcho
    ? accountName
    : (options.senderName || `Instagram User (${participantId.slice(-4)})`);

  // 1. Upsert conversation
  if (isEcho) {
    // For outbound message: update last_message without overwriting participant profile
    await p.query(
      `INSERT INTO inbox_conversations (
         id, tenant_id, platform, channel_type, account_id, account_name,
         participant_id, participant_name, participant_avatar, last_message, last_message_at,
         unread_count, status, updated_at
       ) VALUES ($1, $2, 'instagram', 'dm', $3, $4, $5, $6, $7, $8, $9, 0, 'replied', now())
       ON CONFLICT (id) DO UPDATE SET
         last_message = EXCLUDED.last_message,
         last_message_at = EXCLUDED.last_message_at,
         status = 'replied',
         updated_at = now()`,
      [
        conversationId,
        tenantId,
        options.accountId,
        accountName,
        participantId,
        `Instagram User (${participantId.slice(-4)})`,
        options.senderAvatar || null,
        options.text,
        createdAt,
      ]
    );
  } else {
    // For inbound message from follower: update participant profile and increment unread
    await p.query(
      `INSERT INTO inbox_conversations (
         id, tenant_id, platform, channel_type, account_id, account_name,
         participant_id, participant_name, participant_avatar, last_message, last_message_at,
         unread_count, status, updated_at
       ) VALUES ($1, $2, 'instagram', 'dm', $3, $4, $5, $6, $7, $8, $9, 1, 'open', now())
       ON CONFLICT (id) DO UPDATE SET
         participant_name = CASE WHEN EXCLUDED.participant_name NOT LIKE 'Instagram User%' THEN EXCLUDED.participant_name ELSE inbox_conversations.participant_name END,
         participant_avatar = COALESCE(EXCLUDED.participant_avatar, inbox_conversations.participant_avatar),
         last_message = EXCLUDED.last_message,
         last_message_at = EXCLUDED.last_message_at,
         unread_count = inbox_conversations.unread_count + 1,
         status = 'open',
         updated_at = now()`,
      [
        conversationId,
        tenantId,
        options.accountId,
        accountName,
        participantId,
        senderName,
        options.senderAvatar || null,
        options.text,
        createdAt,
      ]
    );
  }

  // 2. Insert message
  await p.query(
    `INSERT INTO inbox_messages (
       id, conversation_id, tenant_id, platform, channel_type,
       direction, sender_id, sender_name, recipient_id, text,
       status, raw_payload, created_at
     ) VALUES ($1, $2, $3, 'instagram', 'dm', $4, $5, $6, $7, $8, 'delivered', $9, $10)
     ON CONFLICT (id) DO NOTHING`,
    [
      options.messageId,
      conversationId,
      tenantId,
      direction,
      options.senderId,
      senderName,
      options.recipientId,
      options.text,
      JSON.stringify(options.rawPayload || {}),
      createdAt,
    ]
  );

  return { conversationId, messageId: options.messageId };
}

/**
 * Ingest an incoming Instagram Comment on a Post/Reel.
 */
export async function ingestInstagramComment(options: {
  commentId: string;
  accountId: string;
  accountName?: string;
  tenantId?: string;
  fromId: string;
  fromUsername?: string;
  text: string;
  mediaId: string;
  parentId?: string;
  rawPayload?: any;
}): Promise<{ conversationId: string; commentId: string }> {
  const p = getInboxPool();
  const tenantId = options.tenantId || 'travel_kathegalu';
  const accountName = options.accountName || 'Travel Kathegalu';
  const isOwnComment = options.fromId === options.accountId || options.fromUsername === 'travel_kathegalu';
  const fromUsername = options.fromUsername || `user_${options.fromId.slice(-4)}`;
  const conversationId = `ig_comment_${options.mediaId}`;
  const direction: 'inbound' | 'outbound' = isOwnComment ? 'outbound' : 'inbound';
  const now = new Date();

  // 1. Upsert comment conversation thread (keyed by post/mediaId)
  if (isOwnComment) {
    // Brand's own reply: update last message without overwriting commenter's participant_name
    await p.query(
      `INSERT INTO inbox_conversations (
         id, tenant_id, platform, channel_type, account_id, account_name,
         participant_id, participant_name, subject_media_id,
         last_message, last_message_at, unread_count, status, updated_at
       ) VALUES ($1, $2, 'instagram', 'comment', $3, $4, $5, $6, $7, $8, now(), 0, 'replied', now())
       ON CONFLICT (id) DO UPDATE SET
         last_message = EXCLUDED.last_message,
         last_message_at = now(),
         status = 'replied',
         updated_at = now()`,
      [
        conversationId,
        tenantId,
        options.accountId,
        accountName,
        options.fromId,
        `@${fromUsername}`,
        options.mediaId,
        `You: ${options.text}`,
      ]
    );
  } else {
    // Inbound user comment
    await p.query(
      `INSERT INTO inbox_conversations (
         id, tenant_id, platform, channel_type, account_id, account_name,
         participant_id, participant_name, subject_media_id,
         last_message, last_message_at, unread_count, status, updated_at
       ) VALUES ($1, $2, 'instagram', 'comment', $3, $4, $5, $6, $7, $8, now(), 1, 'open', now())
       ON CONFLICT (id) DO UPDATE SET
         participant_name = CASE WHEN inbox_conversations.participant_name LIKE '@travel_kathegalu%' THEN EXCLUDED.participant_name ELSE COALESCE(inbox_conversations.participant_name, EXCLUDED.participant_name) END,
         last_message = EXCLUDED.last_message,
         last_message_at = now(),
         unread_count = inbox_conversations.unread_count + 1,
         status = 'open',
         updated_at = now()`,
      [
        conversationId,
        tenantId,
        options.accountId,
        accountName,
        options.fromId,
        `@${fromUsername}`,
        options.mediaId,
        `@${fromUsername}: ${options.text}`,
      ]
    );
  }

  // 2. Insert comment as message
  await p.query(
    `INSERT INTO inbox_messages (
       id, conversation_id, tenant_id, platform, channel_type,
       direction, sender_id, sender_name, recipient_id, text,
       parent_id, status, raw_payload, created_at
     ) VALUES ($1, $2, $3, 'instagram', 'comment', $4, $5, $6, $7, $8, $9, 'delivered', $10, now())
     ON CONFLICT (id) DO NOTHING`,
    [
      options.commentId,
      conversationId,
      tenantId,
      direction,
      options.fromId,
      isOwnComment ? accountName : `@${fromUsername}`,
      options.accountId,
      options.text,
      options.parentId || null,
      JSON.stringify(options.rawPayload || {}),
    ]
  );

  return { conversationId, commentId: options.commentId };
}

/**
 * Record an outbound message (sent by the brand to the user).
 */
export async function recordOutboundMessage(options: {
  id?: string;
  conversationId: string;
  tenantId?: string;
  platform: 'instagram' | 'whatsapp';
  channelType: 'dm' | 'comment';
  senderId: string;
  senderName: string;
  recipientId: string;
  text: string;
  parentId?: string;
  status?: 'sent' | 'delivered' | 'failed';
}): Promise<MessageRecord> {
  const p = getInboxPool();
  const id = options.id || `out_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const tenantId = options.tenantId || 'travel_kathegalu';
  const status = options.status || 'sent';

  const res = await p.query(
    `INSERT INTO inbox_messages (
       id, conversation_id, tenant_id, platform, channel_type,
       direction, sender_id, sender_name, recipient_id, text,
       parent_id, status, created_at
     ) VALUES ($1, $2, $3, $4, $5, 'outbound', $6, $7, $8, $9, $10, $11, now())
     RETURNING *`,
    [
      id,
      options.conversationId,
      tenantId,
      options.platform,
      options.channelType,
      options.senderId,
      options.senderName,
      options.recipientId,
      options.text,
      options.parentId || null,
      status,
    ]
  );

  // Update conversation last message & mark unread as 0 and status as replied
  await p.query(
    `UPDATE inbox_conversations
     SET last_message = $1, last_message_at = now(), unread_count = 0, status = 'replied', updated_at = now()
     WHERE id = $2`,
    [options.text, options.conversationId]
  );

  return res.rows[0];
}

/**
 * Query list of conversations for the inbox dashboard.
 */
export async function listConversations(options: {
  tenantId?: string;
  platform?: string;
  channelType?: string;
  status?: string;
  limit?: number;
}): Promise<ConversationRecord[]> {
  const p = getInboxPool();
  const conditions: string[] = [];
  const params: any[] = [];
  let idx = 1;

  if (options.tenantId && options.tenantId !== 'all') {
    conditions.push(`tenant_id = $${idx++}`);
    params.push(options.tenantId);
  }
  if (options.platform && options.platform !== 'all') {
    conditions.push(`platform = $${idx++}`);
    params.push(options.platform);
  }
  if (options.channelType && options.channelType !== 'all') {
    conditions.push(`channel_type = $${idx++}`);
    params.push(options.channelType);
  }
  if (options.status && options.status !== 'all') {
    conditions.push(`status = $${idx++}`);
    params.push(options.status);
  }

  // Never include self-conversations (where participant_id = account_id or self-reflexive id)
  conditions.push(`(participant_id != account_id AND id NOT LIKE '%_' || account_id || '_' || account_id)`);

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limitClause = `LIMIT ${options.limit || 50}`;

  const query = `
    SELECT * FROM inbox_conversations
    ${whereClause}
    ORDER BY last_message_at DESC
    ${limitClause}
  `;

  const res = await p.query(query, params);
  return res.rows;
}

/**
 * Fetch a single conversation with all its messages.
 */
export async function getConversationWithMessages(conversationId: string): Promise<{
  conversation: ConversationRecord | null;
  messages: MessageRecord[];
}> {
  const p = getInboxPool();

  const convRes = await p.query(
    `SELECT * FROM inbox_conversations WHERE id = $1`,
    [conversationId]
  );
  if (convRes.rows.length === 0) {
    return { conversation: null, messages: [] };
  }

  // Clear unread count on view
  await p.query(
    `UPDATE inbox_conversations SET unread_count = 0 WHERE id = $1`,
    [conversationId]
  );

  const msgRes = await p.query(
    `SELECT * FROM inbox_messages WHERE conversation_id = $1 ORDER BY created_at ASC`,
    [conversationId]
  );

  return {
    conversation: convRes.rows[0],
    messages: msgRes.rows,
  };
}

/**
 * Mark a conversation as resolved or archived.
 */
export async function updateConversationStatus(
  conversationId: string,
  status: 'open' | 'replied' | 'resolved' | 'archived'
): Promise<void> {
  const p = getInboxPool();
  await p.query(
    `UPDATE inbox_conversations SET status = $1, updated_at = now() WHERE id = $2`,
    [status, conversationId]
  );
}

export interface PaidRuleRecord {
  id: string;
  tenant_id: string;
  name: string;
  keyword: string;
  match_type: 'contains' | 'exact';
  price_inr: number;
  payment_link: string;
  reply_template: string;
  delivery_asset_url?: string | null;
  delivery_message?: string | null;
  is_active: boolean;
  trigger_count: number;
  order_count: number;
  total_revenue_inr: number;
  created_at?: string;
  updated_at?: string;
}

export async function listPaidRules(tenantId: string): Promise<PaidRuleRecord[]> {
  const p = getInboxPool();
  const res = await p.query(
    `SELECT * FROM inbox_paid_rules WHERE tenant_id = $1 ORDER BY created_at DESC`,
    [tenantId]
  );
  return res.rows;
}

export async function upsertPaidRule(
  rule: Partial<PaidRuleRecord> & {
    id: string;
    tenant_id: string;
    name: string;
    keyword: string;
    price_inr: number;
    payment_link: string;
    reply_template: string;
  }
): Promise<PaidRuleRecord> {
  const p = getInboxPool();
  const res = await p.query(
    `INSERT INTO inbox_paid_rules (
       id, tenant_id, name, keyword, match_type, price_inr, payment_link,
       reply_template, delivery_asset_url, delivery_message, is_active, updated_at
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, now())
     ON CONFLICT (id) DO UPDATE SET
       name = EXCLUDED.name,
       keyword = EXCLUDED.keyword,
       match_type = EXCLUDED.match_type,
       price_inr = EXCLUDED.price_inr,
       payment_link = EXCLUDED.payment_link,
       reply_template = EXCLUDED.reply_template,
       delivery_asset_url = EXCLUDED.delivery_asset_url,
       delivery_message = EXCLUDED.delivery_message,
       is_active = EXCLUDED.is_active,
       updated_at = now()
     RETURNING *`,
    [
      rule.id,
      rule.tenant_id,
      rule.name,
      rule.keyword,
      rule.match_type || 'contains',
      rule.price_inr,
      rule.payment_link,
      rule.reply_template,
      rule.delivery_asset_url || null,
      rule.delivery_message || null,
      rule.is_active ?? true,
    ]
  );
  return res.rows[0];
}

export async function deletePaidRule(ruleId: string, tenantId: string): Promise<void> {
  const p = getInboxPool();
  await p.query(
    `DELETE FROM inbox_paid_rules WHERE id = $1 AND tenant_id = $2`,
    [ruleId, tenantId]
  );
}

export async function findMatchingPaidRule(
  tenantId: string,
  messageText: string
): Promise<PaidRuleRecord | null> {
  if (!messageText) return null;
  const rules = await listPaidRules(tenantId);
  const textUpper = messageText.toUpperCase();

  for (const rule of rules) {
    if (!rule.is_active) continue;
    const keywords = rule.keyword
      .split(',')
      .map((k) => k.trim().toUpperCase())
      .filter(Boolean);

    for (const kw of keywords) {
      if (rule.match_type === 'exact') {
        if (textUpper === kw) return rule;
      } else {
        if (textUpper.includes(kw)) return rule;
      }
    }
  }
  return null;
}

export async function recordPaidRuleTrigger(ruleId: string): Promise<void> {
  const p = getInboxPool();
  await p.query(
    `UPDATE inbox_paid_rules SET trigger_count = trigger_count + 1, updated_at = now() WHERE id = $1`,
    [ruleId]
  );
}

export interface ReelAutomationRecord {
  id: string;
  tenant_id: string;
  name: string;
  reel_id: string;
  reel_caption?: string | null;
  reel_permalink?: string | null;
  trigger_type: 'comment' | 'dm' | 'both';
  trigger_keywords: string;
  public_comment_reply?: string | null;
  require_follow: boolean;
  gate_message: string;
  gate_button_text: string;
  not_following_message: string;
  success_message: string;
  button_title: string;
  button_url: string;
  ask_email: boolean;
  is_active: boolean;
  total_comments_replied: number;
  total_dms_sent: number;
  total_followers_gated: number;
  total_guides_unlocked: number;
  created_at?: string;
  updated_at?: string;
}

export async function listReelAutomations(tenantId: string): Promise<ReelAutomationRecord[]> {
  const p = getInboxPool();
  const res = await p.query(
    `SELECT * FROM inbox_reel_automations WHERE tenant_id = $1 ORDER BY created_at DESC`,
    [tenantId]
  );
  return res.rows;
}

export async function upsertReelAutomation(
  auto: Partial<ReelAutomationRecord> & {
    id: string;
    tenant_id: string;
    name: string;
  }
): Promise<ReelAutomationRecord> {
  const p = getInboxPool();
  const res = await p.query(
    `INSERT INTO inbox_reel_automations (
       id, tenant_id, name, reel_id, reel_caption, reel_permalink, trigger_type,
       trigger_keywords, public_comment_reply, require_follow, gate_message,
       gate_button_text, not_following_message, success_message, button_title,
       button_url, ask_email, is_active, updated_at
     ) VALUES (
       $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, now()
     )
     ON CONFLICT (id) DO UPDATE SET
       name = EXCLUDED.name,
       reel_id = EXCLUDED.reel_id,
       reel_caption = EXCLUDED.reel_caption,
       reel_permalink = EXCLUDED.reel_permalink,
       trigger_type = EXCLUDED.trigger_type,
       trigger_keywords = EXCLUDED.trigger_keywords,
       public_comment_reply = EXCLUDED.public_comment_reply,
       require_follow = EXCLUDED.require_follow,
       gate_message = EXCLUDED.gate_message,
       gate_button_text = EXCLUDED.gate_button_text,
       not_following_message = EXCLUDED.not_following_message,
       success_message = EXCLUDED.success_message,
       button_title = EXCLUDED.button_title,
       button_url = EXCLUDED.button_url,
       ask_email = EXCLUDED.ask_email,
       is_active = EXCLUDED.is_active,
       updated_at = now()
     RETURNING *`,
    [
      auto.id,
      auto.tenant_id,
      auto.name,
      auto.reel_id || 'ALL',
      auto.reel_caption || null,
      auto.reel_permalink || null,
      auto.trigger_type || 'both',
      auto.trigger_keywords || 'GUIDE,PDF,DAY15,ITINERARY',
      auto.public_comment_reply || null,
      auto.require_follow ?? true,
      auto.gate_message || "This guide is only for my followers! Would really appreciate the support first and then I'll send it over!",
      auto.gate_button_text || "I'm following you!",
      auto.not_following_message || "Looks like you're not following yet. Follow @travel_kathegalu, then tap again 👇",
      auto.success_message || "you asked for this resource...\nhere it is 🎁\ntap the first button below to open it 👇",
      auto.button_title || "Get the guide 🎁",
      auto.button_url || "https://tysonlabs.in/guides/bengaluru-itinerary-2026.pdf",
      auto.ask_email ?? false,
      auto.is_active ?? true,
    ]
  );
  return res.rows[0];
}

export async function deleteReelAutomation(id: string, tenantId: string): Promise<void> {
  const p = getInboxPool();
  await p.query(
    `DELETE FROM inbox_reel_automations WHERE id = $1 AND tenant_id = $2`,
    [id, tenantId]
  );
}

export async function findMatchingReelAutomation(
  tenantId: string,
  options: {
    reelId?: string;
    text?: string;
    channelType: 'comment' | 'dm';
  }
): Promise<ReelAutomationRecord | null> {
  const autos = await listReelAutomations(tenantId);
  const textUpper = (options.text || '').toUpperCase();

  for (const auto of autos) {
    if (!auto.is_active) continue;

    // Check trigger type
    if (auto.trigger_type === 'comment' && options.channelType !== 'comment') continue;
    if (auto.trigger_type === 'dm' && options.channelType !== 'dm') continue;

    // Check reel match
    if (auto.reel_id !== 'ALL' && options.reelId && auto.reel_id !== options.reelId) {
      continue;
    }

    // If keywords configured, verify keyword match
    if (auto.trigger_keywords && auto.trigger_keywords.trim()) {
      const keywords = auto.trigger_keywords
        .split(',')
        .map((k) => k.trim().toUpperCase())
        .filter(Boolean);
      const normalizedText = textUpper.replace(/[^A-Z0-9\s]/g, ' ');
      const compactText = textUpper.replace(/[^A-Z0-9]/g, '');
      const matches = keywords.some((kw) => {
        const cleanKw = kw.replace(/[^A-Z0-9]/g, '');
        return (
          textUpper.includes(kw) ||
          normalizedText.includes(kw) ||
          (cleanKw.length >= 3 && compactText.includes(cleanKw))
        );
      });
      if (!matches) continue;
    }

    return auto;
  }
  return null;
}

export async function incrementReelAutomationStat(
  autoId: string,
  field: 'total_comments_replied' | 'total_dms_sent' | 'total_followers_gated' | 'total_guides_unlocked'
): Promise<void> {
  const p = getInboxPool();
  await p.query(
    `UPDATE inbox_reel_automations SET ${field} = ${field} + 1, updated_at = now() WHERE id = $1`,
    [autoId]
  );
}

export interface LeadCaptureRecord {
  id: string;
  automation_id: string;
  tenant_id: string;
  participant_id: string;
  participant_username?: string | null;
  participant_name?: string | null;
  status: 'gated' | 'awaiting_email' | 'unlocked';
  email?: string | null;
  reel_id?: string | null;
  created_at?: string;
  unlocked_at?: string | null;
}

export async function getLeadCapture(
  participantId: string,
  automationId?: string
): Promise<LeadCaptureRecord | null> {
  const p = getInboxPool();
  let query = `SELECT * FROM inbox_lead_captures WHERE participant_id = $1`;
  const params: any[] = [participantId];
  if (automationId) {
    query += ` AND automation_id = $2`;
    params.push(automationId);
  }
  query += ` ORDER BY created_at DESC LIMIT 1`;
  const res = await p.query(query, params);
  return res.rows[0] || null;
}

export async function saveLeadCapture(data: {
  automation_id: string;
  tenant_id: string;
  participant_id: string;
  participant_username?: string;
  participant_name?: string;
  status: 'gated' | 'awaiting_email' | 'unlocked';
  email?: string;
  reel_id?: string;
  unlocked?: boolean;
}): Promise<LeadCaptureRecord> {
  const p = getInboxPool();
  const id = `lead_${data.participant_id}_${data.automation_id}`;
  const res = await p.query(
    `INSERT INTO inbox_lead_captures (
       id, automation_id, tenant_id, participant_id, participant_username,
       participant_name, status, email, reel_id, created_at, unlocked_at
     ) VALUES (
       $1, $2, $3, $4, $5, $6, $7, $8, $9, now(), $10
     )
     ON CONFLICT (id) DO UPDATE SET
       status = EXCLUDED.status,
       email = COALESCE(EXCLUDED.email, inbox_lead_captures.email),
       participant_username = COALESCE(EXCLUDED.participant_username, inbox_lead_captures.participant_username),
       participant_name = COALESCE(EXCLUDED.participant_name, inbox_lead_captures.participant_name),
       unlocked_at = CASE WHEN EXCLUDED.status = 'unlocked' THEN now() ELSE inbox_lead_captures.unlocked_at END
     RETURNING *`,
    [
      id,
      data.automation_id,
      data.tenant_id,
      data.participant_id,
      data.participant_username || null,
      data.participant_name || null,
      data.status,
      data.email || null,
      data.reel_id || null,
      data.unlocked ? new Date().toISOString() : null,
    ]
  );
  return res.rows[0];
}

export async function listLeadCaptures(tenantId: string): Promise<LeadCaptureRecord[]> {
  const p = getInboxPool();
  const res = await p.query(
    `SELECT * FROM inbox_lead_captures WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT 100`,
    [tenantId]
  );
  return res.rows;
}
