-- Migration 0010_inbox: Pilot DMs and Comments Unified Inbox for Instagram & WhatsApp
BEGIN;

CREATE TABLE IF NOT EXISTS inbox_conversations (
  id text PRIMARY KEY,
  tenant_id text NOT NULL DEFAULT 'travel_kathegalu',
  platform text NOT NULL,
  channel_type text NOT NULL,
  account_id text NOT NULL,
  account_name text NOT NULL DEFAULT 'Travel Kathegalu',
  participant_id text NOT NULL,
  participant_name text NOT NULL DEFAULT 'User',
  participant_avatar text,
  subject_media_id text,
  subject_media_caption text,
  subject_media_url text,
  last_message text NOT NULL DEFAULT '',
  last_message_at timestamptz NOT NULL DEFAULT now(),
  unread_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'replied', 'resolved', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inbox_conv_tenant ON inbox_conversations (tenant_id, platform, status, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_inbox_conv_participant ON inbox_conversations (participant_id);

CREATE TABLE IF NOT EXISTS inbox_messages (
  id text PRIMARY KEY,
  conversation_id text NOT NULL REFERENCES inbox_conversations(id) ON DELETE CASCADE,
  tenant_id text NOT NULL DEFAULT 'travel_kathegalu',
  platform text NOT NULL,
  channel_type text NOT NULL,
  direction text NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  sender_id text NOT NULL,
  sender_name text NOT NULL,
  recipient_id text NOT NULL,
  text text NOT NULL DEFAULT '',
  media_url text,
  parent_id text,
  status text NOT NULL DEFAULT 'delivered' CHECK (status IN ('delivered', 'sent', 'failed')),
  raw_payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inbox_msg_conv ON inbox_messages (conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_inbox_msg_created ON inbox_messages (created_at DESC);

CREATE TABLE IF NOT EXISTS meta_webhook_events (
  id text PRIMARY KEY,
  event_type text NOT NULL,
  object text,
  raw_payload jsonb NOT NULL,
  processed boolean NOT NULL DEFAULT true,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_meta_events_created ON meta_webhook_events (created_at DESC);

COMMIT;
