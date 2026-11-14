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

export async function getInboxAccount(tenantOrId: string): Promise<InboxAccountRecord | null> {
  const p = getInboxPool();
  const res = await p.query(
    `SELECT * FROM inbox_accounts WHERE id = $1 OR username = $1 OR tenant_id = $1 ORDER BY updated_at DESC LIMIT 1`,
    [tenantOrId]
  );
  return res.rows[0] || null;
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
  recipientId: string;
  text: string;
  timestamp?: number;
  rawPayload?: any;
}): Promise<{ conversationId: string; messageId: string }> {
  const p = getInboxPool();
  const tenantId = options.tenantId || 'travel_kathegalu';
  const accountName = options.accountName || 'Travel Kathegalu';
  const senderName = options.senderName || `Instagram User (${options.senderId.slice(-4)})`;
  const conversationId = `ig_dm_${options.accountId}_${options.senderId}`;
  const createdAt = options.timestamp ? new Date(options.timestamp) : new Date();

  // 1. Upsert conversation
  await p.query(
    `INSERT INTO inbox_conversations (
       id, tenant_id, platform, channel_type, account_id, account_name,
       participant_id, participant_name, last_message, last_message_at,
       unread_count, status, updated_at
     ) VALUES ($1, $2, 'instagram', 'dm', $3, $4, $5, $6, $7, $8, 1, 'open', now())
     ON CONFLICT (id) DO UPDATE SET
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
      options.senderId,
      senderName,
      options.text,
      createdAt,
    ]
  );

  // 2. Insert message
  await p.query(
    `INSERT INTO inbox_messages (
       id, conversation_id, tenant_id, platform, channel_type,
       direction, sender_id, sender_name, recipient_id, text,
       status, raw_payload, created_at
     ) VALUES ($1, $2, $3, 'instagram', 'dm', 'inbound', $4, $5, $6, $7, 'delivered', $8, $9)
     ON CONFLICT (id) DO NOTHING`,
    [
      options.messageId,
      conversationId,
      tenantId,
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
  const fromUsername = options.fromUsername || `user_${options.fromId.slice(-4)}`;
  const conversationId = `ig_comment_${options.mediaId}`;
  const now = new Date();

  // 1. Upsert comment conversation thread (keyed by post/mediaId)
  await p.query(
    `INSERT INTO inbox_conversations (
       id, tenant_id, platform, channel_type, account_id, account_name,
       participant_id, participant_name, subject_media_id,
       last_message, last_message_at, unread_count, status, updated_at
     ) VALUES ($1, $2, 'instagram', 'comment', $3, $4, $5, $6, $7, $8, now(), 1, 'open', now())
     ON CONFLICT (id) DO UPDATE SET
       participant_name = EXCLUDED.participant_name,
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

  // 2. Insert comment as message
  await p.query(
    `INSERT INTO inbox_messages (
       id, conversation_id, tenant_id, platform, channel_type,
       direction, sender_id, sender_name, recipient_id, text,
       parent_id, status, raw_payload, created_at
     ) VALUES ($1, $2, $3, 'instagram', 'comment', 'inbound', $4, $5, $6, $7, $8, 'delivered', $9, now())
     ON CONFLICT (id) DO NOTHING`,
    [
      options.commentId,
      conversationId,
      tenantId,
      options.fromId,
      `@${fromUsername}`,
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
