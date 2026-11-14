'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  MessageSquare,
  Send,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  User,
  MessageCircle,
  Filter,
  ExternalLink,
  Film,
  Smile,
  Image as ImageIcon,
  Heart,
  Zap,
  Plus,
  X,
  Trash2,
  Check,
  ShoppingBag,
  ChevronDown,
  ShieldCheck,
  Lock,
} from 'lucide-react';

function extractInstagramHandle(name: string): string | null {
  if (!name) return null;
  const match = name.match(/@([a-zA-Z0-9_.]+)/);
  if (match) return match[1];
  const cleaned = name.trim();
  if (
    /^[a-zA-Z0-9_.]{1,30}$/.test(cleaned) &&
    !cleaned.toLowerCase().startsWith('instagram user') &&
    !cleaned.toLowerCase().startsWith('user')
  ) {
    return cleaned;
  }
  return null;
}

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
  created_at?: string;
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

interface PaidRule {
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
}

const QUICK_REPLIES = [
  '📍 We are located at Bengaluru Cafe, 9th Main, Jayanagar! Open 7:00 AM - 1:00 PM & 4:30 PM - 9:30 PM.',
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

  // Paid DM Monetization State
  const [showPaidRulesModal, setShowPaidRulesModal] = useState(false);
  const [paidRules, setPaidRules] = useState<PaidRule[]>([]);
  const [isLoadingRules, setIsLoadingRules] = useState(false);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleKeyword, setNewRuleKeyword] = useState('');
  const [newRulePrice, setNewRulePrice] = useState(199);
  const [newRulePaymentLink, setNewRulePaymentLink] = useState('https://tysonlabs.in/pay/travel-kathegalu-guide');
  const [newRuleTemplate, setNewRuleTemplate] = useState(
    'Hey {{name}}! 🌟 Unlock our complete 3-Day Curated Bengaluru Itinerary here: {{payment_link}}. Guide drops instantly in this chat right after payment! ⚡️'
  );
  const [showPaidDropdown, setShowPaidDropdown] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message in active conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeConvId]);

  // Fetch Paid Rules
  const fetchPaidRules = useCallback(async () => {
    setIsLoadingRules(true);
    try {
      const res = await fetch(`/api/v1/inbox/paid-rules?tenantId=${tenant}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data.rules)) {
        setPaidRules(data.rules);
      }
    } catch (err) {
      console.warn('Could not load paid rules:', err);
    } finally {
      setIsLoadingRules(false);
    }
  }, [tenant]);

  useEffect(() => {
    fetchPaidRules();
  }, [fetchPaidRules]);

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

  // Fetch conversations from API
  const fetchConversations = useCallback(async () => {
    try {
      const params = new URLSearchParams({ tenantId: tenant });
      const res = await fetch(`/api/v1/inbox/conversations?${params.toString()}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data.conversations)) {
        setConversations(data.conversations);
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    }
  }, [tenant]);

  // Fetch single conversation messages
  const fetchMessages = useCallback(async (convId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/inbox/conversations/${encodeURIComponent(convId)}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data.messages)) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load & polling
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
  const handleSendReply = async (overrideText?: string) => {
    const textToSend = (overrideText || replyText).trim();
    if (!activeConv || !textToSend || isSending) return;

    setIsSending(true);
    setActionNotice(null);

    try {
      const res = await fetch('/api/v1/inbox/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: activeConv.id,
          text: textToSend,
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

  // Create Paid Rule Handler
  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName.trim() || !newRuleKeyword.trim() || !newRulePaymentLink.trim()) return;

    try {
      const res = await fetch('/api/v1/inbox/paid-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: tenant,
          name: newRuleName.trim(),
          keyword: newRuleKeyword.trim(),
          priceInr: newRulePrice,
          paymentLink: newRulePaymentLink.trim(),
          replyTemplate: newRuleTemplate.trim(),
        }),
      });

      if (res.ok) {
        setNewRuleName('');
        setNewRuleKeyword('');
        await fetchPaidRules();
        setActionNotice('New Paid DM Auto-Reply rule created and activated!');
      }
    } catch (err: any) {
      setActionNotice(`Failed to create rule: ${err.message}`);
    }
  };

  // Toggle Rule Status
  const handleToggleRule = async (rule: PaidRule) => {
    try {
      await fetch('/api/v1/inbox/paid-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: rule.id,
          tenantId: tenant,
          name: rule.name,
          keyword: rule.keyword,
          priceInr: rule.price_inr,
          paymentLink: rule.payment_link,
          replyTemplate: rule.reply_template,
          isActive: !rule.is_active,
        }),
      });
      await fetchPaidRules();
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered list
  const filteredConversations = conversations.filter((c) => {
    if (filterType === 'dm') return c.channel_type === 'dm';
    if (filterType === 'comment') return c.channel_type === 'comment';
    if (filterType === 'unread') return c.unread_count > 0;
    return true;
  });

  // Calculate monetization totals
  const totalRevenue = paidRules.reduce((acc, r) => acc + (r.total_revenue_inr || 0), 0);
  const totalTriggers = paidRules.reduce((acc, r) => acc + (r.trigger_count || 0), 0);
  const totalOrders = paidRules.reduce((acc, r) => acc + (r.order_count || 0), 0);

  const activeHandle = activeConv ? extractInstagramHandle(activeConv.participant_name) : null;

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 space-y-4">
      {/* Native Instagram App Styled Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-black border border-[#262626] text-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full p-[2px] bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] flex-shrink-0">
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
              <img
                src="https://scontent.fblr20-4.fna.fbcdn.net/v/t51.82787-15/728684716_17933051643335413_7130452107853258551_n.jpg?_nc_cat=101&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=7d201b&_nc_ohc=Mt_yofgqI5EQ7kNvwHyhXjm&_nc_oc=AdoaOaBsTyjJrSJDLvV1MosGR8u6zXFH-Odu3j6SqMXVqZQtU64ac6p_oTUnznxafO3nzouSYSTFTlEeVBArJcmD&_nc_zt=23&_nc_ht=scontent.fblr20-4.fna&edm=AHN6ZZcEAAAA&_nc_gid=MmCVqJuszZHoK75uonuUGQ&oh=00_AQT778umoZUs3JDi4IaeDc40OgqE9tLQHXCga5aUWIZ7xg&oe=6AFDB2A8"
                alt="travel_kathegalu"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight">travel_kathegalu</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-1" />
              <span className="text-[11px] text-zinc-400 font-medium">Meta Live</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Direct Messages & Comments Engine · Instagram Graph API v21.0
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Monetize DMs Add-on Button */}
          <button
            onClick={() => setShowPaidRulesModal(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-pink-600 text-white px-3.5 py-1.5 text-xs font-bold shadow-md hover:opacity-95 transition"
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>Paid DM Auto-Replies</span>
            {totalRevenue > 0 && (
              <span className="bg-black/30 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
                ₹{totalRevenue}
              </span>
            )}
          </button>

          <button
            onClick={handleSyncHistorical}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#262626] text-white hover:bg-[#333] px-3.5 py-1.5 text-xs font-semibold transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing…' : 'Sync Graph API'}
          </button>

          <a
            href="/api/auth/instagram/start"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#0095F6] text-white hover:bg-[#1877F2] px-3.5 py-1.5 text-xs font-bold transition shadow-sm"
          >
            <User className="w-3.5 h-3.5" />
            Reconnect
          </a>
        </div>
      </div>

      {/* Action Notice */}
      {actionNotice && (
        <div className="flex items-center justify-between px-4 py-2 rounded-xl text-xs font-medium bg-[#1e1e1e] text-zinc-200 border border-[#333]">
          <span>{actionNotice}</span>
          <button onClick={() => setActionNotice(null)} className="text-zinc-400 hover:text-white font-bold ml-2">
            ×
          </button>
        </div>
      )}

      {/* NATIVE INSTAGRAM DIRECT UNIFIED CANVAS */}
      <div className="rounded-2xl border border-[#262626] bg-black overflow-hidden flex h-[760px] shadow-2xl">
        {/* Left Column: Instagram Inbox Thread List (360px) */}
        <div className="w-[340px] sm:w-[380px] border-r border-[#262626] flex flex-col bg-black flex-shrink-0">
          {/* Account Title Bar */}
          <div className="p-4 border-b border-[#262626] flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-white tracking-tight">travel_kathegalu</span>
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            </div>
            <button
              onClick={() => handleSimulate('dm')}
              disabled={isSimulating}
              className="text-zinc-400 hover:text-white transition p-1"
              title="Test New Message"
            >
              <Sparkles className="w-4 h-4 text-[#0095F6]" />
            </button>
          </div>

          {/* Instagram Filter Tabs (Primary / Comments / Unread) */}
          <div className="flex items-center justify-around border-b border-[#262626] px-2 py-2 flex-shrink-0 bg-[#0a0a0a]">
            {[
              { id: 'all', label: 'Primary' },
              { id: 'dm', label: 'DMs' },
              { id: 'comment', label: 'Comments' },
              { id: 'unread', label: 'Unread' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id as any)}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition ${
                  filterType === tab.id
                    ? 'bg-[#262626] text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-[#1a1a1a]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Conversations Scroll Stream */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#1a1a1a]">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500">
                No conversations found.
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isActive = c.id === activeConvId;
                const isComment = c.channel_type === 'comment';
                const handle = extractInstagramHandle(c.participant_name);
                const hasUnread = c.unread_count > 0;

                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveConvId(c.id)}
                    className={`w-full text-left px-4 py-3.5 transition flex items-center gap-3.5 ${
                      isActive
                        ? 'bg-[#1a1a1a]'
                        : 'hover:bg-[#121212]'
                    }`}
                  >
                    {/* Follower Avatar */}
                    <div className="relative flex-shrink-0">
                      {c.participant_avatar ? (
                        <img
                          src={c.participant_avatar}
                          alt={c.participant_name}
                          className="w-13 h-13 rounded-full object-cover border border-[#333]"
                        />
                      ) : (
                        <div className="w-13 h-13 rounded-full bg-[#262626] flex items-center justify-center font-bold text-sm text-zinc-300">
                          {(handle || c.participant_name).replace('@', '').charAt(0).toUpperCase()}
                        </div>
                      )}
                      {isComment && (
                        <span className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-0.5 border-2 border-black">
                          <MessageCircle className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>

                    {/* Middle Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`text-[13.5px] truncate ${hasUnread ? 'font-bold text-white' : 'font-semibold text-zinc-200'}`}>
                          {c.participant_name}
                        </span>
                        <span className="text-[11px] text-zinc-500 flex-shrink-0 ml-1">
                          {new Date(c.last_message_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <p className={`text-[12px] truncate leading-tight ${hasUnread ? 'font-semibold text-white' : 'text-zinc-400'}`}>
                          {c.status === 'replied' ? <span className="text-zinc-500 font-normal">You: </span> : ''}
                          {c.last_message || 'Media attachment'}
                        </p>
                        {hasUnread && (
                          <span className="w-2 h-2 rounded-full bg-[#0095F6] flex-shrink-0 ml-2" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Native Instagram Chat Room */}
        <div className="flex-1 flex flex-col bg-black min-w-0 h-full">
          {activeConv ? (
            <>
              {/* Native Instagram Chat Top Bar */}
              <div className="h-[68px] px-6 border-b border-[#262626] flex items-center justify-between flex-shrink-0 bg-black">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-[#333]">
                    {activeConv.participant_avatar ? (
                      <img
                        src={activeConv.participant_avatar}
                        alt={activeConv.participant_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#262626] flex items-center justify-center font-bold text-xs text-white">
                        {(activeHandle || activeConv.participant_name).charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-white truncate">
                        {activeConv.participant_name}
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-400 block truncate">
                      {activeHandle ? `@${activeHandle} · Active on Instagram` : 'Instagram User'}
                    </span>
                  </div>
                </div>

                {/* Right Action Icons in Header */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Paid Auto-Reply 1-Click Trigger */}
                  <div className="relative">
                    <button
                      onClick={() => setShowPaidDropdown(!showPaidDropdown)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs px-3 py-1.5 shadow-sm hover:opacity-95 transition"
                    >
                      <Zap className="w-3 h-3 fill-white" />
                      <span>₹ Send Paid Guide</span>
                    </button>

                    {showPaidDropdown && (
                      <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#1e1e1e] border border-[#333] shadow-2xl p-2 z-50 space-y-1">
                        <div className="px-3 py-1.5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                          Select Paid Product Link
                        </div>
                        {paidRules.map((r) => (
                          <button
                            key={r.id}
                            onClick={() => {
                              const cleanName = activeConv.participant_name.replace('@', '').split(' ')[0];
                              const rendered = r.reply_template
                                .replace(/{{name}}/gi, cleanName)
                                .replace(/{{product_name}}/gi, r.name)
                                .replace(/{{payment_link}}/gi, r.payment_link)
                                .replace(/{{price}}/gi, `₹${r.price_inr}`);
                              setReplyText(rendered);
                              setShowPaidDropdown(false);
                            }}
                            className="w-full text-left p-2.5 rounded-xl hover:bg-[#2a2a2a] transition flex items-start gap-2.5"
                          >
                            <ShoppingBag className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-bold text-white leading-tight">{r.name}</p>
                              <p className="text-[11px] text-amber-400 font-semibold mt-0.5">₹{r.price_inr} · Tap to paste link</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* View Profile on Instagram */}
                  {activeHandle && (
                    <a
                      href={`https://instagram.com/${activeHandle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#262626] text-white hover:bg-[#333] px-3.5 py-1.5 text-xs font-semibold transition"
                    >
                      <span>View Profile</span>
                      <ExternalLink className="w-3 h-3 text-[#0095F6]" />
                    </a>
                  )}

                  <button
                    onClick={() => handleStatusChange(activeConv.status === 'resolved' ? 'open' : 'resolved')}
                    className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-[#262626] transition"
                    title={activeConv.status === 'resolved' ? 'Re-open' : 'Mark Resolved'}
                  >
                    <CheckCircle2 className={`w-4 h-4 ${activeConv.status === 'resolved' ? 'text-emerald-500' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Chat Thread Messages Stream */}
              <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-black flex flex-col">
                {/* Native Instagram Profile Hero at Top of Chat */}
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-2 border-b border-[#1f1f1f] mb-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#333] shadow-md">
                    {activeConv.participant_avatar ? (
                      <img
                        src={activeConv.participant_avatar}
                        alt={activeConv.participant_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#262626] flex items-center justify-center font-bold text-2xl text-zinc-300">
                        {(activeHandle || activeConv.participant_name).charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-white tracking-tight">
                    {activeConv.participant_name}
                  </h3>

                  <p className="text-xs text-zinc-400">
                    {activeHandle ? `${activeHandle} · Instagram` : 'Instagram User'}
                  </p>

                  {activeHandle && (
                    <a
                      href={`https://instagram.com/${activeHandle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-[#262626] text-white hover:bg-[#333] transition"
                    >
                      View profile
                    </a>
                  )}

                  <span className="text-[11px] text-zinc-600 block pt-2">
                    {new Date(activeConv.created_at || Date.now()).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                {/* Message Bubbles */}
                {messages.length === 0 ? (
                  <p className="text-center text-xs text-zinc-500 py-10">No messages in this chat yet.</p>
                ) : (
                  messages.map((m) => {
                    const isInbound = m.direction === 'inbound';
                    const isReel = m.text.includes('[Shared Reel') || m.text.includes('[Sent media]');
                    const isPaidLink = m.text.includes('/pay/') || m.text.includes('₹');

                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isInbound ? 'items-start' : 'items-end'} space-y-1`}
                      >
                        <div className={`flex items-end gap-2 max-w-[75%] ${isInbound ? 'flex-row' : 'flex-row-reverse'}`}>
                          {/* Mini Avatar for Follower Inbound */}
                          {isInbound && (
                            <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 mb-1 border border-[#333]">
                              {activeConv.participant_avatar ? (
                                <img
                                  src={activeConv.participant_avatar}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-[#262626] flex items-center justify-center font-bold text-[10px] text-white">
                                  {(activeHandle || activeConv.participant_name).charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Authentic Instagram Reel Card if Reel */}
                          {isReel ? (
                            <div className="w-[240px] rounded-2xl overflow-hidden border border-[#333] bg-[#1a1a1a] shadow-lg">
                              <div className="h-32 bg-gradient-to-tr from-purple-900/60 via-zinc-900 to-black flex items-center justify-center relative">
                                <Film className="w-10 h-10 text-white/80" />
                                <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-black/80 text-white">
                                  Reel
                                </span>
                              </div>
                              <div className="p-3 space-y-1.5">
                                <p className="text-xs font-bold text-white line-clamp-2">
                                  {m.raw_payload?.postCaption
                                    ? m.raw_payload.postCaption.split('\n')[0]
                                    : 'Bengaluru Legend Food Walks · Travel Kathegalu'}
                                </p>
                                <span className="text-[11px] font-medium text-[#0095F6] flex items-center gap-1">
                                  Watch on Instagram ↗
                                </span>
                              </div>
                            </div>
                          ) : isPaidLink && !isInbound ? (
                            /* Paid DM Offer Highlight Bubble */
                            <div className="rounded-[22px] rounded-tr-[4px] p-4 bg-gradient-to-br from-[#7000FF] via-[#A21CAF] to-[#0095F6] text-white shadow-lg space-y-3">
                              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-200">
                                <Zap className="w-3.5 h-3.5 fill-amber-200" />
                                <span>Verified Creator Itinerary Offer</span>
                              </div>
                              <p className="text-[14px] leading-relaxed font-normal">{m.text}</p>
                              <a
                                href="https://tysonlabs.in/pay/travel-kathegalu-guide"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white text-zinc-950 font-bold text-xs py-2 shadow-sm hover:opacity-90 transition"
                              >
                                <Lock className="w-3.5 h-3.5" />
                                Unlock for ₹199 (Instant DM Delivery)
                              </a>
                            </div>
                          ) : (
                            /* Normal Native Instagram Bubble */
                            <div
                              className={`rounded-[22px] px-4 py-2.5 text-[14px] leading-relaxed break-words shadow-sm ${
                                isInbound
                                  ? 'bg-[#262626] text-white rounded-tl-[4px]'
                                  : 'bg-[#0095F6] text-white rounded-tr-[4px] font-normal'
                              }`}
                            >
                              {m.text}
                            </div>
                          )}
                        </div>

                        {/* Status / Timestamp */}
                        <span className="text-[11px] text-zinc-500 px-1">
                          {!isInbound ? 'Delivered · ' : ''}
                          {new Date(m.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Native Instagram Quick Reply Chips */}
              <div className="px-5 py-2 bg-black border-t border-[#1f1f1f] flex items-center gap-2 overflow-x-auto">
                <span className="text-[11px] font-bold text-zinc-500 whitespace-nowrap">Quick:</span>
                {QUICK_REPLIES.map((qr, idx) => (
                  <button
                    key={idx}
                    onClick={() => setReplyText(qr)}
                    className="whitespace-nowrap px-3 py-1 rounded-full text-[11px] font-medium bg-[#1e1e1e] border border-[#2a2a2a] text-zinc-300 hover:text-white hover:bg-[#282828] transition"
                  >
                    {qr.slice(0, 32)}…
                  </button>
                ))}
              </div>

              {/* Native Instagram Message Composer */}
              <div className="p-4 border-t border-[#262626] bg-black">
                <div className="flex items-center gap-3 rounded-full border border-[#363636] bg-[#121212] px-4 py-2.5 focus-within:border-[#555] transition">
                  <Smile className="w-5 h-5 text-zinc-400 hover:text-white cursor-pointer transition flex-shrink-0" />

                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendReply();
                      }
                    }}
                    placeholder={
                      activeConv.channel_type === 'comment'
                        ? 'Reply to comment as @travel_kathegalu…'
                        : 'Message...'
                    }
                    className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none font-normal"
                  />

                  {/* Composer Right Actions */}
                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowPaidDropdown(!showPaidDropdown)}
                      className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition"
                      title="Attach Paid Product Link"
                    >
                      <Zap className="w-3.5 h-3.5 fill-amber-400" />
                      <span>₹199</span>
                    </button>

                    <ImageIcon className="w-5 h-5 text-zinc-400 hover:text-white cursor-pointer transition" />
                    <Heart className="w-5 h-5 text-zinc-400 hover:text-red-500 cursor-pointer transition" />

                    {replyText.trim() ? (
                      <button
                        onClick={() => handleSendReply()}
                        disabled={isSending}
                        className="text-sm font-bold text-[#0095F6] hover:text-blue-400 transition ml-1"
                      >
                        {isSending ? 'Sending…' : 'Send'}
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-3">
              <div className="w-16 h-16 rounded-full border-2 border-[#333] flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-zinc-400" />
              </div>
              <h3 className="text-base font-bold text-white">Your Messages</h3>
              <p className="text-xs text-zinc-400 max-w-sm">
                Send private messages, share paid travel itineraries, and respond to comments directly on Instagram.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* PAID DM MONETIZATION & AUTO-REPLY SETTINGS MODAL */}
      {showPaidRulesModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-[#181818] border border-[#333] text-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#282828] flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-pink-600 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white fill-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Paid DM Auto-Replies & Monetization</h2>
                  <p className="text-xs text-zinc-400">
                    Automatically pitch & sell digital guides, itineraries, and 1:1 consultations when followers message keywords.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPaidRulesModal(false)}
                className="w-8 h-8 rounded-full bg-[#282828] text-zinc-400 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Revenue & Conversion KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#202020] border border-[#2e2e2e]">
                  <span className="text-[11px] text-zinc-400 uppercase font-semibold">Total Revenue</span>
                  <p className="text-xl font-black text-emerald-400 mt-1">₹{totalRevenue}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#202020] border border-[#2e2e2e]">
                  <span className="text-[11px] text-zinc-400 uppercase font-semibold">DM Triggers</span>
                  <p className="text-xl font-black text-white mt-1">{totalTriggers}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#202020] border border-[#2e2e2e]">
                  <span className="text-[11px] text-zinc-400 uppercase font-semibold">Completed Orders</span>
                  <p className="text-xl font-black text-white mt-1">{totalOrders}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#202020] border border-[#2e2e2e]">
                  <span className="text-[11px] text-zinc-400 uppercase font-semibold">Conversion Rate</span>
                  <p className="text-xl font-black text-purple-400 mt-1">
                    {totalTriggers > 0 ? `${Math.round((totalOrders / totalTriggers) * 100)}%` : '57%'}
                  </p>
                </div>
              </div>

              {/* Active Paid Rules List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Active Monetization Rules
                </h3>

                {paidRules.length === 0 ? (
                  <p className="text-xs text-zinc-500">No active rules configured yet.</p>
                ) : (
                  paidRules.map((rule) => (
                    <div
                      key={rule.id}
                      className="p-4 rounded-2xl bg-[#202020] border border-[#2e2e2e] flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{rule.name}</span>
                          <span className="text-xs font-black text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                            ₹{rule.price_inr}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400">
                          Triggers on: <span className="font-mono text-zinc-200">{rule.keyword}</span>
                        </p>
                        <p className="text-[11px] text-zinc-500 truncate max-w-md">
                          Payment Link: <span className="text-blue-400 underline">{rule.payment_link}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleToggleRule(rule)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                            rule.is_active
                              ? 'bg-emerald-600 text-white'
                              : 'bg-zinc-700 text-zinc-300'
                          }`}
                        >
                          {rule.is_active ? 'Active' : 'Paused'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Create New Paid Rule Form */}
              <form onSubmit={handleCreateRule} className="p-5 rounded-2xl bg-[#202020] border border-[#2e2e2e] space-y-4">
                <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-amber-400" />
                  <span>Create New Paid DM Auto-Reply</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                      Product / Guide Name
                    </label>
                    <input
                      type="text"
                      value={newRuleName}
                      onChange={(e) => setNewRuleName(e.target.value)}
                      placeholder="e.g. 1:1 Collab & Brand Pitch Review"
                      className="w-full rounded-xl bg-black border border-[#333] px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                      Price in INR (₹)
                    </label>
                    <input
                      type="number"
                      value={newRulePrice}
                      onChange={(e) => setNewRulePrice(Number(e.target.value))}
                      placeholder="199"
                      className="w-full rounded-xl bg-black border border-[#333] px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                    Trigger Keywords (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={newRuleKeyword}
                    onChange={(e) => setNewRuleKeyword(e.target.value)}
                    placeholder="COLLAB, SPONSOR, PITCH, RATE, BRAND"
                    className="w-full rounded-xl bg-black border border-[#333] px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                    Payment Link (Razorpay / TysonPe / UPI Checkout)
                  </label>
                  <input
                    type="text"
                    value={newRulePaymentLink}
                    onChange={(e) => setNewRulePaymentLink(e.target.value)}
                    placeholder="https://tysonlabs.in/pay/travel-kathegalu-guide"
                    className="w-full rounded-xl bg-black border border-[#333] px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                    Auto-Reply Message Template
                  </label>
                  <textarea
                    rows={2}
                    value={newRuleTemplate}
                    onChange={(e) => setNewRuleTemplate(e.target.value)}
                    placeholder="Hey {{name}}! Unlock our {{product_name}} here: {{payment_link}}"
                    className="w-full rounded-xl bg-black border border-[#333] px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none font-sans"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-pink-600 text-white font-bold text-xs py-2.5 hover:opacity-95 transition shadow-md"
                >
                  Save & Activate Paid DM Rule
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
