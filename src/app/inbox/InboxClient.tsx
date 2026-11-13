'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare,
  Send,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  User,
  MessageCircle,
  Filter,
} from 'lucide-react';

interface Conversation {
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
}

interface Message {
  id: string;
  conversation_id: string;
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

const QUICK_REPLIES = [
  '📍 We are located at Bengaluru Cafe, 9th Main, Jayanagar 2nd Block! Open 7:00 AM - 1:00 PM & 4:30 PM - 9:30 PM.',
  '🅿️ Yes, two-wheeler and street car parking is available along 9th Main on weekend mornings!',
  '☕ Filter Coffee and hot Rava Idli are our house favorites. Best visited before 9:00 AM for fresh batches!',
  '🙏 Thank you so much for the love! Looking forward to having you visit again soon.',
];

export function InboxClient() {
  const [tenant, setTenant] = useState('travel_kathegalu');
  const [filterType, setFilterType] = useState<'all' | 'dm' | 'comment' | 'unread'>('all');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyText, setReplyText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Sync historical posts, comments, and conversations from Meta Graph API
  const handleSyncHistorical = async () => {
    setIsSyncing(true);
    setActionNotice('Syncing posts, comments, and DMs from Meta Graph API…');

    try {
      const res = await fetch('/api/v1/inbox/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: tenant,
          accountName: tenant === 'travel_kathegalu' ? 'Travel Kathegalu' : 'Tyson Test',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to sync historical data');

      setActionNotice(
        `Sync complete: ${data.syncedPosts} posts inspected, ${data.syncedCommentsCount} real comments ingested, ${data.syncedConversations} DM threads synced.`
      );
      await fetchConversations();
    } catch (err: any) {
      setActionNotice(`Sync error: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  // Load conversations
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/inbox/conversations?tenantId=${tenant}`);
      if (!res.ok) return;
      const data = await res.json();
      setConversations(data.conversations || []);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  }, [tenant]);

  // Load messages for active conversation
  const fetchMessages = useCallback(async (convId: string) => {
    try {
      const res = await fetch(`/api/v1/inbox/conversations/${encodeURIComponent(convId)}`);
      if (!res.ok) return;
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  }, []);

  // Poll conversations every 6 seconds
  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 6000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  // Auto-select first conversation if none selected
  useEffect(() => {
    if (!activeConvId && conversations.length > 0) {
      setActiveConvId(conversations[0].id);
    }
  }, [conversations, activeConvId]);

  // When active conversation changes, fetch messages
  useEffect(() => {
    if (activeConvId) {
      fetchMessages(activeConvId);
    }
  }, [activeConvId, fetchMessages]);

  const activeConv = conversations.find((c) => c.id === activeConvId);

  // Send reply handler
  const handleSendReply = async () => {
    if (!activeConv || !replyText.trim() || isSending) return;

    setIsSending(true);
    setActionNotice(null);

    try {
      const res = await fetch('/api/v1/inbox/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: activeConv.id,
          text: replyText.trim(),
          tenantId: tenant,
          parentCommentId: activeConv.channel_type === 'comment' ? activeConv.participant_id : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch reply');
      }

      setReplyText('');
      setActionNotice(
        data.metaResponseId
          ? `Dispatched via Meta Graph API (ID: ${data.metaResponseId})`
          : 'Reply recorded successfully in inbox'
      );

      // Refresh message feed & conversation
      await fetchMessages(activeConv.id);
      await fetchConversations();
    } catch (err: any) {
      setActionNotice(`Error: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  // Simulate incoming DM or Comment
  const handleSimulate = async (type: 'dm' | 'comment') => {
    setIsSimulating(true);
    setActionNotice(null);

    try {
      const res = await fetch('/api/v1/inbox/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          tenantId: tenant,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Simulation failed');

      setActionNotice(`Simulated ${type.toUpperCase()} from ${data.text ? `"${data.text.slice(0, 32)}..."` : 'follower'}`);
      await fetchConversations();
      if (data.conversationId) {
        setActiveConvId(data.conversationId);
      }
    } catch (err: any) {
      setActionNotice(`Simulation error: ${err.message}`);
    } finally {
      setIsSimulating(false);
    }
  };

  // Change conversation status
  const handleStatusChange = async (newStatus: 'open' | 'replied' | 'resolved') => {
    if (!activeConv) return;
    try {
      await fetch(`/api/v1/inbox/conversations/${encodeURIComponent(activeConv.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      await fetchConversations();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Filtered list
  const filteredConversations = conversations.filter((c) => {
    if (filterType === 'dm') return c.channel_type === 'dm';
    if (filterType === 'comment') return c.channel_type === 'comment';
    if (filterType === 'unread') return c.unread_count > 0;
    return true;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Operational Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Direct Inquiries & Comments Inbox
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Webhook Active
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Unified Meta Graph receiver for DMs, reels, and post comments · Pilot: Travel Kathegalu
          </p>
        </div>

        {/* Tenant selector & test triggers */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={tenant}
            onChange={(e) => setTenant(e.target.value)}
            className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
          >
            <option value="travel_kathegalu">Travel Kathegalu (@travel_kathegalu)</option>
            <option value="tyson_test">Tyson Test (@instatest_tyson)</option>
          </select>

          <button
            onClick={handleSyncHistorical}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 px-3 py-1.5 text-xs font-bold hover:opacity-90 transition disabled:opacity-50"
            title="Pull all real historical comments and DMs from Meta Graph API"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing Graph API…' : 'Sync Live Posts & DMs'}
          </button>

          <a
            href="/api/auth/instagram/start"
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white px-3 py-1.5 text-xs font-bold hover:opacity-95 transition shadow-sm"
            title="Connect an Instagram Professional account via Meta OAuth"
          >
            <User className="w-3.5 h-3.5" />
            + Connect Instagram Account
          </a>

          <button
            onClick={() => handleSimulate('dm')}
            disabled={isSimulating}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            title="Simulate inbound Instagram DM"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            + Test DM
          </button>

          <button
            onClick={() => handleSimulate('comment')}
            disabled={isSimulating}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            title="Simulate inbound Reel Comment"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            + Test Comment
          </button>

          <button
            onClick={fetchConversations}
            className="p-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            title="Refresh inbox"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionNotice && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
          <span>{actionNotice}</span>
          <button
            onClick={() => setActionNotice(null)}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-sm font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Main Two-Pane Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[640px]">
        {/* Left Column: Conversation Sidebar (4 cols) */}
        <div className="lg:col-span-4 flex flex-col rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          {/* Filter Tabs */}
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 p-3 bg-zinc-50/60 dark:bg-zinc-900/60">
            <div className="flex items-center gap-1">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'dm', label: 'DMs' },
                  { id: 'comment', label: 'Comments' },
                  { id: 'unread', label: 'Unread' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterType(tab.id)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition ${
                    filterType === tab.id
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/60 dark:hover:bg-zinc-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <span className="text-[11px] font-medium text-zinc-400">
              {filteredConversations.length} total
            </span>
          </div>

          {/* Conversation List */}
          <div className="flex-1 divide-y divide-zinc-100 dark:divide-zinc-800/60 overflow-y-auto max-h-[680px]">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-600" />
                <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  No conversations found.
                </p>
                <button
                  onClick={() => handleSimulate('dm')}
                  className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                >
                  Simulate a test DM to start
                </button>
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isActive = c.id === activeConvId;
                const isComment = c.channel_type === 'comment';
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveConvId(c.id)}
                    className={`w-full text-left p-4 transition flex flex-col gap-1.5 ${
                      isActive
                        ? 'bg-zinc-100/90 dark:bg-zinc-800/90 border-l-4 border-zinc-900 dark:border-zinc-100'
                        : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        {isComment ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                            <MessageCircle className="w-3 h-3" />
                            COMMENT
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-950 dark:text-fuchsia-300">
                            <MessageSquare className="w-3 h-3" />
                            DM
                          </span>
                        )}
                        <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate max-w-[150px]">
                          {c.participant_name}
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-400">
                        {new Date(c.last_message_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2 leading-relaxed">
                      {c.last_message || '(No message preview)'}
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <span
                        className={`text-[10px] font-medium uppercase px-2 py-0.5 rounded-full ${
                          c.status === 'replied'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : c.status === 'resolved'
                            ? 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {c.status}
                      </span>
                      {c.unread_count > 0 && (
                        <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                          {c.unread_count}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Conversation Feed (8 cols) */}
        <div className="lg:col-span-8 flex flex-col rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          {activeConv ? (
            <>
              {/* Active Conversation Header */}
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50/60 dark:bg-zinc-900/60">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {activeConv.participant_name}
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      (ID: {activeConv.participant_id})
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Channel: {activeConv.channel_type === 'comment' ? 'Reel/Post Comment Thread' : 'Direct Message'} · Managing as {activeConv.account_name}
                  </p>
                </div>

                {/* Status Toggle Button */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleStatusChange(activeConv.status === 'resolved' ? 'open' : 'resolved')
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {activeConv.status === 'resolved' ? 'Re-open' : 'Mark Resolved'}
                  </button>
                </div>
              </div>

              {/* Reel / Post Context Banner if Comment */}
              {activeConv.channel_type === 'comment' && (
                <div className="bg-amber-50/80 dark:bg-amber-950/40 border-b border-amber-200/60 dark:border-amber-800/40 px-4 py-2.5 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
                  <div className="flex items-center gap-2 truncate max-w-[80%]">
                    <span className="font-semibold text-amber-950 dark:text-amber-100 flex-shrink-0">
                      📌 Attached Reel:
                    </span>
                    <span className="truncate text-amber-800 dark:text-amber-300">
                      {messages[0]?.raw_payload?.postCaption
                        ? messages[0].raw_payload.postCaption.split('\n')[0]
                        : 'Bengaluru Legend Food Walks'}
                    </span>
                    {messages[0]?.raw_payload?.permalink && (
                      <a
                        href={messages[0].raw_payload.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-0.5 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex-shrink-0 ml-2"
                      >
                        View Reel ↗
                      </a>
                    )}
                  </div>
                  <span className="text-[11px] opacity-75 font-mono">Media ID: {activeConv.subject_media_id}</span>
                </div>
              )}

              {/* Message Feed Stream */}
              <div className="flex-1 p-6 space-y-4 overflow-y-auto max-h-[460px] bg-zinc-50/30 dark:bg-zinc-950/20">
                {messages.length === 0 ? (
                  <p className="text-center text-xs text-zinc-400 py-12">
                    No messages recorded in this thread yet.
                  </p>
                ) : (
                  messages.map((m) => {
                    const isInbound = m.direction === 'inbound';
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isInbound ? 'items-start' : 'items-end'}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 text-[11px] text-zinc-400">
                          <span>{m.sender_name}</span>
                          <span>·</span>
                          <span>
                            {new Date(m.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm ${
                            isInbound
                              ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 rounded-tl-sm'
                              : 'bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 rounded-tr-sm font-medium'
                          }`}
                        >
                          {m.text}
                        </div>
                        <span className="text-[10px] text-zinc-400 mt-0.5">
                          {m.status === 'sent'
                            ? '✓ Sent via Graph API'
                            : m.status === 'delivered'
                            ? 'Delivered'
                            : 'Pending'}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Quick Canned Answers Bar */}
              <div className="px-4 py-2 bg-zinc-50/80 dark:bg-zinc-900/80 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2 overflow-x-auto">
                <span className="text-[11px] font-bold text-zinc-400 whitespace-nowrap">
                  Quick Replies:
                </span>
                {QUICK_REPLIES.map((qr, idx) => (
                  <button
                    key={idx}
                    onClick={() => setReplyText(qr)}
                    className="whitespace-nowrap px-2.5 py-1 rounded-md text-[11px] font-medium bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-500 transition"
                  >
                    {qr.slice(0, 32)}…
                  </button>
                ))}
              </div>

              {/* Reply Action Composer */}
              <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={
                    activeConv.channel_type === 'comment'
                      ? 'Write a public reply to this comment as @travel_kathegalu…'
                      : 'Write a direct message reply to this follower…'
                  }
                  rows={3}
                  className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 p-3 text-xs text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-800/60 focus:outline-none focus:ring-2 focus:ring-zinc-950 dark:focus:ring-zinc-100 resize-none font-sans"
                />

                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-zinc-400">
                    Dispatches via official Meta Graph API v21.0
                  </p>
                  <button
                    onClick={handleSendReply}
                    disabled={isSending || !replyText.trim()}
                    className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 px-5 py-2 text-xs font-bold hover:opacity-90 transition disabled:opacity-50 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isSending
                      ? 'SENDING…'
                      : activeConv.channel_type === 'comment'
                      ? 'REPLY TO COMMENT'
                      : 'SEND INSTAGRAM DM'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-3">
              <MessageSquare className="w-12 h-12 text-zinc-300 dark:text-zinc-700" />
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                Select a conversation to start managing
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm">
                Pick a follower DM or comment from the left sidebar to view message history, attach canned answers, and reply.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Webhook Configuration Guide Pill */}
      <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-400 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="font-bold text-zinc-800 dark:text-zinc-200">
            📡 Meta Webhook Settings (Production Configuration)
          </span>
          <span className="font-mono text-[11px] bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded">
            v21.0
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono">
          <div>
            <span className="font-sans font-semibold text-zinc-500">Callback URL:</span>{' '}
            <span className="text-zinc-900 dark:text-zinc-100 select-all">
              https://tysonlabs.in/api/v1/webhooks/meta
            </span>
          </div>
          <div>
            <span className="font-sans font-semibold text-zinc-500">Verify Token:</span>{' '}
            <span className="text-zinc-900 dark:text-zinc-100 select-all">
              tysonlabs_meta_webhook_secret
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
