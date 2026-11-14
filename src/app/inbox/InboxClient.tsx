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
  ChevronDown,
  ShieldCheck,
  Lock,
  Mail,
  Download,
  Users,
  FileText,
  Play,
  Share2,
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

interface ReelAutomation {
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

interface LeadCapture {
  id: string;
  automation_id: string;
  tenant_id: string;
  participant_id: string;
  participant_username?: string | null;
  participant_name?: string | null;
  status: 'gated' | 'awaiting_email' | 'unlocked';
  email?: string | null;
  reel_id?: string | null;
  created_at: string;
  unlocked_at?: string | null;
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

  // Reel Automation & Follower Gate State
  const [showReelModal, setShowReelModal] = useState(false);
  const [activeAutoTab, setActiveAutoTab] = useState<'automations' | 'create' | 'leads'>('automations');
  const [reelAutomations, setReelAutomations] = useState<ReelAutomation[]>([]);
  const [leadCaptures, setLeadCaptures] = useState<LeadCapture[]>([]);
  const [isLoadingAutomations, setIsLoadingAutomations] = useState(false);
  const [showQuickActionDropdown, setShowQuickActionDropdown] = useState(false);

  // Form state for creating a Reel Automation
  const [newAutoName, setNewAutoName] = useState('Reel Lead Magnet: Follow-to-Unlock 3-Day Bengaluru Guide');
  const [newAutoReelId, setNewAutoReelId] = useState('ALL');
  const [newAutoKeywords, setNewAutoKeywords] = useState('GUIDE,PDF,DAY15,ITINERARY,FOOD,SEND,MAP');
  const [newAutoPublicReply, setNewAutoPublicReply] = useState('Sent you the full Bengaluru PDF guide in DMs! Check your requests ✈️❤️');
  const [newAutoRequireFollow, setNewAutoRequireFollow] = useState(true);
  const [newAutoGateMessage, setNewAutoGateMessage] = useState("This guide is only for my followers! Would really appreciate the support first and then I'll send it over!");
  const [newAutoGateButtonText, setNewAutoGateButtonText] = useState("I'm following you!");
  const [newAutoNotFollowingMessage, setNewAutoNotFollowingMessage] = useState("Looks like you're not following yet. Follow @travel_kathegalu, then tap again 👇");
  const [newAutoAskEmail, setNewAutoAskEmail] = useState(true);
  const [newAutoSuccessMessage, setNewAutoSuccessMessage] = useState("you asked for this resource...\nhere it is 🎁\ntap the first button below to open it 👇");
  const [newAutoButtonTitle, setNewAutoButtonTitle] = useState('Get the guide 🎁');
  const [newAutoButtonUrl, setNewAutoButtonUrl] = useState('https://tysonlabs.in/guides/bengaluru-itinerary-2026.pdf');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message in active conversation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeConvId]);

  // Fetch Reel Automations
  const fetchReelAutomations = useCallback(async () => {
    setIsLoadingAutomations(true);
    try {
      const res = await fetch(`/api/v1/inbox/reel-automations?tenantId=${tenant}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data.automations)) {
        setReelAutomations(data.automations);
      }
    } catch (err) {
      console.warn('Could not load reel automations:', err);
    } finally {
      setIsLoadingAutomations(false);
    }
  }, [tenant]);

  // Fetch Leads
  const fetchLeads = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/inbox/leads?tenantId=${tenant}`);
      const data = await res.json();
      if (res.ok && Array.isArray(data.leads)) {
        setLeadCaptures(data.leads);
      }
    } catch (err) {
      console.warn('Could not load leads:', err);
    }
  }, [tenant]);

  useEffect(() => {
    fetchReelAutomations();
    fetchLeads();
  }, [fetchReelAutomations, fetchLeads]);

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

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 8000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  // Default active conversation
  useEffect(() => {
    if (!activeConvId && conversations.length > 0) {
      setActiveConvId(conversations[0].id);
    }
  }, [conversations, activeConvId]);

  // Fetch messages for active conversation
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

  useEffect(() => {
    if (activeConvId) {
      fetchMessages(activeConvId);
    }
  }, [activeConvId, fetchMessages]);

  const activeConv = conversations.find((c) => c.id === activeConvId);

  // Send regular text message
  const handleSendReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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

      await fetchMessages(activeConv.id);
      await fetchConversations();
    } catch (err: any) {
      setActionNotice(`Error: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  // Send interactive message (Button Card or Quick Reply)
  const handleSendInteractive = async (
    messageType: 'button_card' | 'quick_reply',
    params: { text?: string; buttonTitle?: string; buttonUrl?: string }
  ) => {
    if (!activeConv || isSending) return;
    setIsSending(true);
    setActionNotice(null);
    setShowQuickActionDropdown(false);

    try {
      const res = await fetch('/api/v1/inbox/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: activeConv.id,
          tenantId: tenant,
          messageType,
          text: params.text,
          buttonTitle: params.buttonTitle,
          buttonUrl: params.buttonUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch interactive message');

      setActionNotice(
        messageType === 'button_card'
          ? '🎁 Delivered interactive Guide Card to follower!'
          : "🔒 Sent Follower-Gate with [I'm following you!] button"
      );

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

  // Create new Reel Automation
  const handleCreateAuto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAutoName.trim()) return;

    try {
      const res = await fetch('/api/v1/inbox/reel-automations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: tenant,
          name: newAutoName.trim(),
          reelId: newAutoReelId.trim() || 'ALL',
          triggerKeywords: newAutoKeywords.trim(),
          publicCommentReply: newAutoPublicReply.trim(),
          requireFollow: newAutoRequireFollow,
          gateMessage: newAutoGateMessage.trim(),
          gateButtonText: newAutoGateButtonText.trim(),
          notFollowingMessage: newAutoNotFollowingMessage.trim(),
          askEmail: newAutoAskEmail,
          successMessage: newAutoSuccessMessage.trim(),
          buttonTitle: newAutoButtonTitle.trim(),
          buttonUrl: newAutoButtonUrl.trim(),
          isActive: true,
        }),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to save automation');
      }

      setActionNotice('⚡ Reel Lead Magnet Campaign created and active!');
      await fetchReelAutomations();
      setActiveAutoTab('automations');
    } catch (err: any) {
      setActionNotice(`Error: ${err.message}`);
    }
  };

  // Toggle Automation Status
  const handleToggleAuto = async (auto: ReelAutomation) => {
    try {
      await fetch('/api/v1/inbox/reel-automations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...auto,
          id: auto.id,
          tenantId: tenant,
          isActive: !auto.is_active,
        }),
      });
      await fetchReelAutomations();
    } catch (err) {
      console.error('Failed to toggle automation:', err);
    }
  };

  // Export Leads to CSV
  const handleExportLeadsCsv = () => {
    if (leadCaptures.length === 0) return;
    const headers = ['Participant ID', 'Username', 'Name', 'Email', 'Status', 'Reel ID', 'Unlocked At', 'Created At'];
    const rows = leadCaptures.map((l) => [
      l.participant_id,
      l.participant_username || '',
      l.participant_name || '',
      l.email || '',
      l.status,
      l.reel_id || '',
      l.unlocked_at || '',
      l.created_at,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leads_travel_kathegalu_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    // Exclude any bogus self-conversations
    if (c.participant_id === c.account_id) return false;
    if (c.participant_name.includes('5430') && c.participant_id === '17841470062375430') return false;
    if (c.id === 'ig_dm_17841470062375430_17841470062375430') return false;
    if (filterType === 'dm') return c.channel_type === 'dm';
    if (filterType === 'comment') return c.channel_type === 'comment';
    if (filterType === 'unread') return c.unread_count > 0;
    return true;
  });

  // Calculate totals
  const totalCommentsReplied = reelAutomations.reduce((acc, a) => acc + (a.total_comments_replied || 0), 0);
  const totalDmsSent = reelAutomations.reduce((acc, a) => acc + (a.total_dms_sent || 0), 0);
  const totalFollowersGated = reelAutomations.reduce((acc, a) => acc + (a.total_followers_gated || 0), 0);
  const totalGuidesUnlocked = reelAutomations.reduce((acc, a) => acc + (a.total_guides_unlocked || 0), 0);
  const totalLeadsCaptured = leadCaptures.filter((l) => Boolean(l.email)).length;

  const activeHandle = activeConv ? extractInstagramHandle(activeConv.participant_name) : null;

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 pt-1 pb-4 space-y-3">
      {/* TOP HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-black border border-[#262626] text-white">
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
              <span className="text-[11px] text-zinc-400 font-medium">Meta Live Webhook Active</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Direct Messages & Comments Engine · Instagram Graph API v21.0
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Reel Automation & Follower-Gate Studio Button */}
          <button
            onClick={() => setShowReelModal(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white px-3.5 py-1.5 text-xs font-bold shadow-md hover:opacity-95 transition"
          >
            <Sparkles className="w-3.5 h-3.5 fill-white" />
            <span>⚡ Reel Automation & Follow-Gate</span>
            {totalGuidesUnlocked > 0 && (
              <span className="bg-black/40 text-white text-[10px] px-1.5 py-0.2 rounded-full font-black">
                {totalGuidesUnlocked} Unlocked
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
      <div className="rounded-2xl border border-[#262626] bg-black overflow-hidden flex h-[calc(100dvh-140px)] min-h-[540px] max-h-[860px] shadow-2xl">
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
              <Zap className={`w-4 h-4 ${isSimulating ? 'animate-pulse text-amber-400' : ''}`} />
            </button>
          </div>

          {/* Native Instagram Message Category Pills */}
          <div className="px-4 py-2.5 flex items-center gap-1.5 border-b border-[#1f1f1f] overflow-x-auto flex-shrink-0">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'dm', label: 'Primary' },
                { id: 'comment', label: 'Comments' },
                { id: 'unread', label: 'Unread' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  filterType === tab.id
                    ? 'bg-[#262626] text-white font-bold'
                    : 'text-zinc-400 hover:text-white hover:bg-[#1a1a1a]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#181818]">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-xs">
                No conversations found.
              </div>
            ) : (
              filteredConversations.map((c) => {
                const isActive = c.id === activeConvId;
                const handle = extractInstagramHandle(c.participant_name);

                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveConvId(c.id)}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 transition ${
                      isActive ? 'bg-[#1a1a1a]' : 'hover:bg-[#121212]'
                    }`}
                  >
                    {/* Native Avatar with IG Gradient Border */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-full p-[1.5px] bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]">
                        <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                          {c.participant_avatar ? (
                            <img
                              src={c.participant_avatar}
                              alt={c.participant_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="font-bold text-sm text-zinc-200">
                              {(handle || c.participant_name).charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>

                      {c.channel_type === 'comment' && (
                        <span className="absolute -bottom-0.5 -right-0.5 bg-[#262626] text-[#0095F6] p-1 rounded-full border border-black shadow">
                          <MessageCircle className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>

                    {/* Thread Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-white truncate max-w-[170px]">
                          {c.participant_name}
                        </span>
                        <span className="text-[11px] text-zinc-500 flex-shrink-0">
                          {new Date(c.last_message_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-400 truncate mt-0.5 font-normal">
                        {c.status === 'replied' && !c.last_message.startsWith('You: ') && !c.last_message.startsWith('@')
                          ? `You: ${c.last_message}`
                          : c.last_message || 'Sent a message'}
                      </p>

                      <div className="flex items-center gap-1.5 mt-1">
                        {c.unread_count > 0 && (
                          <span className="w-2 h-2 rounded-full bg-[#0095F6]" />
                        )}
                        <span
                          className={`text-[10px] font-medium px-1.5 py-0.2 rounded-full ${
                            c.status === 'resolved'
                              ? 'bg-zinc-800 text-zinc-400'
                              : c.status === 'replied'
                              ? 'bg-blue-950/60 text-[#0095F6]'
                              : 'bg-emerald-950/60 text-emerald-400'
                          }`}
                        >
                          {c.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Native Instagram Direct Chat Canvas */}
        <div className="flex-1 flex flex-col bg-black min-w-0 h-full">
          {activeConv ? (
            <>
              {/* Native Chat Header */}
              <div className="px-5 py-3.5 border-b border-[#262626] flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border border-[#333]">
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
                      {activeConv.channel_type === 'dm'
                        ? 'Direct Message · Active'
                        : `Comment on Reel (${activeConv.subject_media_id || 'Post'})`}
                    </span>
                  </div>
                </div>

                {/* Right Action Icons in Header */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Lead Magnet Interactive Dispatcher */}
                  <div className="relative">
                    <button
                      onClick={() => setShowQuickActionDropdown(!showQuickActionDropdown)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xs px-3 py-1.5 shadow-sm hover:opacity-95 transition"
                    >
                      <Sparkles className="w-3 h-3 fill-white" />
                      <span>⚡ Send Lead Magnet</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>

                    {showQuickActionDropdown && (
                      <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#1e1e1e] border border-[#333] shadow-2xl p-2 z-50 space-y-1">
                        <div className="px-3 py-1.5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                          1-Click Resource Delivery
                        </div>

                        <button
                          onClick={() =>
                            handleSendInteractive('button_card', {
                              text: 'you asked for this resource...\nhere it is 🎁\ntap the first button below to open it 👇',
                              buttonTitle: 'Get the guide 🎁',
                              buttonUrl: 'https://tysonlabs.in/guides/bengaluru-itinerary-2026.pdf',
                            })
                          }
                          className="w-full text-left p-2.5 rounded-xl hover:bg-[#2a2a2a] transition flex items-start gap-2.5"
                        >
                          <FileText className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-white">Deliver PDF Guide Card</p>
                            <p className="text-[11px] text-zinc-400">Sends unlocked card with [Get the guide 🎁]</p>
                          </div>
                        </button>

                        <button
                          onClick={() =>
                            handleSendInteractive('quick_reply', {
                              text: "This guide is only for my followers! Would really appreciate the support first and then I'll send it over!",
                              buttonTitle: "I'm following you!",
                            })
                          }
                          className="w-full text-left p-2.5 rounded-xl hover:bg-[#2a2a2a] transition flex items-start gap-2.5"
                        >
                          <Lock className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-white">Send Follower Gate</p>
                            <p className="text-[11px] text-zinc-400">Prompts user with [I'm following you!] pill</p>
                          </div>
                        </button>

                        <button
                          onClick={() => {
                            setReplyText("Awesome 👏 What's the best email to send this to? Reply with your email 👇");
                            setShowQuickActionDropdown(false);
                          }}
                          className="w-full text-left p-2.5 rounded-xl hover:bg-[#2a2a2a] transition flex items-start gap-2.5"
                        >
                          <Mail className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-white">Ask for Email Address</p>
                            <p className="text-[11px] text-zinc-400">Copies email capture prompt to composer</p>
                          </div>
                        </button>
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
                      <span>Profile</span>
                      <ExternalLink className="w-3 h-3 text-[#0095F6]" />
                    </a>
                  )}

                  <button
                    onClick={() =>
                      handleStatusChange(activeConv.status === 'resolved' ? 'open' : 'resolved')
                    }
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition ${
                      activeConv.status === 'resolved'
                        ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                        : 'bg-emerald-950/70 border border-emerald-800/40 text-emerald-400 hover:bg-emerald-900/60'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{activeConv.status === 'resolved' ? 'Resolved' : 'Mark Done'}</span>
                  </button>
                </div>
              </div>

              {/* Chat Messages Body */}
              <div className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-6 space-y-3 bg-black">
                {/* Instagram Profile Anchor Header - Compact & Native */}
                <div className="flex flex-col items-center justify-center py-3 text-center border-b border-[#1f1f1f] mb-3">
                  <div className="w-14 h-14 rounded-full p-[1.5px] bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] mb-2">
                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                      {activeConv.participant_avatar ? (
                        <img
                          src={activeConv.participant_avatar}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="font-bold text-lg text-white">
                          {(activeHandle || activeConv.participant_name).charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="font-bold text-sm text-white tracking-tight">
                    {activeConv.participant_name}
                  </h3>

                  <p className="text-[11px] text-zinc-400">
                    {activeHandle ? `${activeHandle} · Instagram` : 'Instagram User'}
                  </p>
                </div>

                {/* Message Bubbles */}
                {messages.length === 0 ? (
                  <p className="text-center text-xs text-zinc-500 py-10">No messages in this chat yet.</p>
                ) : (
                  messages.map((m) => {
                    const isInbound = m.direction === 'inbound';
                    const isReel = m.text.includes('[Shared Reel') || m.text.includes('[Sent media]');
                    const isFollowGateMessage =
                      m.text.includes('This guide is only for my followers') ||
                      m.text.includes("Looks like you're not following yet");
                    const isResourceDelivery =
                      m.text.includes('you asked for this resource') ||
                      m.text.includes('[BUTTON_CARD]') ||
                      m.text.includes('Get the guide');
                    const isEmailPrompt = m.text.includes("What's the best email to send this to");
                    const isEmailSubmission = isInbound && /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(m.text);

                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isInbound ? 'items-start' : 'items-end'} space-y-1`}
                      >
                        <div className={`flex items-end gap-2 max-w-[80%] ${isInbound ? 'flex-row' : 'flex-row-reverse'}`}>
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

                          {/* 1. Authentic Reel Card */}
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
                                  Bengaluru Legend Food Walks · Travel Kathegalu
                                </p>
                                <span className="text-[11px] font-medium text-[#0095F6] flex items-center gap-1">
                                  Watch on Instagram ↗
                                </span>
                              </div>
                            </div>
                          ) : isFollowGateMessage && !isInbound ? (
                            /* 2. Follower Gate Message with Interactive Pill Button */
                            <div className="space-y-2 max-w-[340px]">
                              <div className="rounded-[22px] rounded-tr-[4px] px-4 py-3 bg-[#262626] text-white shadow-md text-[14px] leading-relaxed">
                                {m.text}
                              </div>
                              {/* Native Instagram Quick Reply Pill Button */}
                              <div className="flex justify-start">
                                <div className="px-4 py-2 rounded-2xl bg-[#363636] border border-[#444] text-white text-xs font-bold shadow-md inline-flex items-center gap-1.5">
                                  <span>I'm following you!</span>
                                </div>
                              </div>
                            </div>
                          ) : isResourceDelivery && !isInbound ? (
                            /* 3. Resource Delivery Card with [Get the guide 🎁] Button */
                            <div className="space-y-2 max-w-[340px]">
                              <div className="rounded-[22px] rounded-tr-[4px] px-4 py-3 bg-[#262626] text-white shadow-md text-[14px] leading-relaxed whitespace-pre-line">
                                {m.text.replace('[BUTTON_CARD]', '').trim()}
                              </div>
                              {/* Clickable Resource Buttons Stack */}
                              <div className="space-y-1.5">
                                <a
                                  href="https://tysonlabs.in/guides/bengaluru-itinerary-2026.pdf"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-full text-center px-4 py-2.5 rounded-xl bg-[#262626] hover:bg-[#333] border border-[#3a3a3a] text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-md"
                                >
                                  <span>Get the guide 🎁</span>
                                  <ExternalLink className="w-3.5 h-3.5 text-[#0095F6]" />
                                </a>
                                <a
                                  href="https://tysonlabs.in"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-full text-center px-4 py-2 rounded-xl bg-[#1c1c1c] hover:bg-[#262626] border border-[#2a2a2a] text-zinc-300 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition"
                                >
                                  <span>EXPLORE ALL TRAVEL GUIDES</span>
                                </a>
                              </div>
                            </div>
                          ) : isEmailPrompt && !isInbound ? (
                            /* 4. Email Collection Prompt */
                            <div className="rounded-[22px] rounded-tr-[4px] px-4 py-3 bg-gradient-to-r from-purple-950/80 to-[#262626] border border-purple-800/40 text-white shadow-md text-[14px] leading-relaxed">
                              {m.text}
                            </div>
                          ) : isEmailSubmission ? (
                            /* 5. Inbound Captured Email */
                            <div className="space-y-1">
                              <div className="rounded-[22px] rounded-tl-[4px] px-4 py-2.5 bg-gradient-to-r from-purple-600 to-[#0095F6] text-white text-[14px] font-medium shadow-md">
                                {m.text}
                              </div>
                              <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold px-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Verified Email Captured</span>
                              </div>
                            </div>
                          ) : (
                            /* 6. Standard Bubble */
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
              <div className="px-5 py-2 bg-black border-t border-[#1f1f1f] flex items-center gap-2 overflow-x-auto flex-shrink-0">
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
              <div className="p-3 sm:p-4 border-t border-[#262626] bg-black flex-shrink-0">
                <form onSubmit={handleSendReply} className="flex items-center gap-3 rounded-full border border-[#363636] bg-[#121212] px-4 py-2.5 focus-within:border-[#555] transition">
                  <Smile className="w-5 h-5 text-zinc-400 hover:text-white cursor-pointer transition flex-shrink-0" />

                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Message..."
                    className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none"
                  />

                  {replyText.trim() ? (
                    <button
                      type="submit"
                      disabled={isSending}
                      className="text-[#0095F6] hover:text-[#1877F2] font-bold text-sm transition disabled:opacity-50"
                    >
                      Send
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 text-zinc-400">
                      <ImageIcon className="w-5 h-5 hover:text-white cursor-pointer transition" />
                      <Heart className="w-5 h-5 hover:text-white cursor-pointer transition" />
                    </div>
                  )}
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <div className="w-16 h-16 rounded-full border-2 border-[#333] flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-zinc-400" />
              </div>
              <h3 className="text-base font-bold text-white">Your Messages</h3>
              <p className="text-xs text-zinc-400 max-w-sm">
                Send private messages, deliver gated PDF travel itineraries, and respond to reel comments directly on Instagram.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* REEL LEAD MAGNET & FOLLOWER-GATE STUDIO MODAL */}
      {showReelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-5xl bg-[#141414] border border-[#2e2e2e] rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#2e2e2e] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-600 to-amber-500 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-5 h-5 text-white fill-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Reel Lead Magnet & Follower-Gate Studio</h2>
                  <p className="text-xs text-zinc-400">
                    Auto-reply to Reel comments, gate PDF guides behind follow verification, and capture verified email leads.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowReelModal(false)}
                className="w-8 h-8 rounded-full bg-[#282828] text-zinc-400 hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="px-6 py-2 border-b border-[#242424] bg-[#101010] flex items-center gap-2">
              <button
                onClick={() => setActiveAutoTab('automations')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeAutoTab === 'automations'
                    ? 'bg-[#262626] text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Active Automations ({reelAutomations.length})</span>
              </button>

              <button
                onClick={() => setActiveAutoTab('create')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeAutoTab === 'create'
                    ? 'bg-[#262626] text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Plus className="w-3.5 h-3.5 text-purple-400" />
                <span>+ Create Reel Campaign</span>
              </button>

              <button
                onClick={() => setActiveAutoTab('leads')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                  activeAutoTab === 'leads'
                    ? 'bg-[#262626] text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>Captured Leads CRM ({leadCaptures.length})</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* TAB 1: ACTIVE AUTOMATIONS */}
              {activeAutoTab === 'automations' && (
                <div className="space-y-6">
                  {/* Performance Metric Counters */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-4 rounded-2xl bg-[#1c1c1c] border border-[#282828]">
                      <span className="text-[11px] text-zinc-400 uppercase font-semibold">Comments Replied</span>
                      <p className="text-2xl font-black text-amber-400 mt-1">{totalCommentsReplied}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#1c1c1c] border border-[#282828]">
                      <span className="text-[11px] text-zinc-400 uppercase font-semibold">Followers Gated</span>
                      <p className="text-2xl font-black text-purple-400 mt-1">{totalFollowersGated}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#1c1c1c] border border-[#282828]">
                      <span className="text-[11px] text-zinc-400 uppercase font-semibold">Guides Unlocked</span>
                      <p className="text-2xl font-black text-emerald-400 mt-1">{totalGuidesUnlocked}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#1c1c1c] border border-[#282828]">
                      <span className="text-[11px] text-zinc-400 uppercase font-semibold">Emails Captured</span>
                      <p className="text-2xl font-black text-[#0095F6] mt-1">{totalLeadsCaptured}</p>
                    </div>
                  </div>

                  {/* Automations Cards */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                      Live Reel Campaigns
                    </h3>

                    {reelAutomations.length === 0 ? (
                      <p className="text-xs text-zinc-500">No campaigns created yet.</p>
                    ) : (
                      reelAutomations.map((auto) => (
                        <div
                          key={auto.id}
                          className="p-5 rounded-2xl bg-[#1c1c1c] border border-[#2a2a2a] space-y-4 shadow-lg"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-white">{auto.name}</span>
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-950 border border-purple-800 text-purple-300">
                                  {auto.reel_id === 'ALL' ? 'All Reels & Posts' : `Reel: ${auto.reel_id}`}
                                </span>
                              </div>
                              <p className="text-xs text-zinc-400">
                                Triggers on Keywords:{' '}
                                <span className="font-mono text-zinc-200">{auto.trigger_keywords}</span>
                              </p>
                            </div>

                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleToggleAuto(auto)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                                  auto.is_active
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'bg-zinc-700 text-zinc-300'
                                }`}
                              >
                                {auto.is_active ? 'Active' : 'Paused'}
                              </button>
                            </div>
                          </div>

                          {/* Campaign Rules Overview */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-[#141414] p-3.5 rounded-xl border border-[#262626]">
                            <div>
                              <span className="text-zinc-500 font-semibold block text-[10px] uppercase">
                                💬 Public Comment Reply
                              </span>
                              <p className="text-zinc-300 truncate mt-0.5">
                                {auto.public_comment_reply || 'Disabled'}
                              </p>
                            </div>

                            <div>
                              <span className="text-zinc-500 font-semibold block text-[10px] uppercase">
                                🔒 Follower Gate
                              </span>
                              <p className="text-zinc-300 mt-0.5">
                                {auto.require_follow ? 'Required · With verification pill' : 'Open to everyone'}
                              </p>
                            </div>

                            <div>
                              <span className="text-zinc-500 font-semibold block text-[10px] uppercase">
                                🎁 Delivery Button
                              </span>
                              <p className="text-blue-400 truncate mt-0.5">
                                {auto.button_title} ({auto.button_url})
                              </p>
                            </div>
                          </div>

                          {/* Stats Row */}
                          <div className="flex items-center gap-4 text-xs text-zinc-400 pt-1">
                            <span>💬 {auto.total_comments_replied} comments replied</span>
                            <span>🔒 {auto.total_followers_gated} gated</span>
                            <span className="font-bold text-emerald-400">🎁 {auto.total_guides_unlocked} unlocked</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: CREATE / EDIT REEL CAMPAIGN */}
              {activeAutoTab === 'create' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Form: Settings (7 cols) */}
                  <form onSubmit={handleCreateAuto} className="lg:col-span-7 space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Campaign Name
                      </label>
                      <input
                        type="text"
                        value={newAutoName}
                        onChange={(e) => setNewAutoName(e.target.value)}
                        placeholder="e.g. Reel Lead Magnet: Follow-to-Unlock 3-Day Bengaluru Guide"
                        className="w-full rounded-xl bg-black border border-[#333] px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1">
                          Target Reel ID
                        </label>
                        <input
                          type="text"
                          value={newAutoReelId}
                          onChange={(e) => setNewAutoReelId(e.target.value)}
                          placeholder="ALL or Reel ID"
                          className="w-full rounded-xl bg-black border border-[#333] px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1">
                          Trigger Keywords
                        </label>
                        <input
                          type="text"
                          value={newAutoKeywords}
                          onChange={(e) => setNewAutoKeywords(e.target.value)}
                          placeholder="DAY15, GUIDE, PDF, ITINERARY"
                          className="w-full rounded-xl bg-black border border-[#333] px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Public Comment Auto-Reply
                      </label>
                      <input
                        type="text"
                        value={newAutoPublicReply}
                        onChange={(e) => setNewAutoPublicReply(e.target.value)}
                        placeholder="Sent you the full Bengaluru PDF guide in DMs! Check your requests ✈️❤️"
                        className="w-full rounded-xl bg-black border border-[#333] px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>

                    {/* Follower Gate Settings */}
                    <div className="p-4 rounded-2xl bg-black border border-[#2a2a2a] space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-purple-400" />
                          <span className="text-xs font-bold text-white">Require User to Follow</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={newAutoRequireFollow}
                          onChange={(e) => setNewAutoRequireFollow(e.target.checked)}
                          className="w-4 h-4 accent-purple-600 rounded"
                        />
                      </div>

                      {newAutoRequireFollow && (
                        <>
                          <div>
                            <label className="block text-[11px] text-zinc-400 mb-1">
                              Gate Message (if not following)
                            </label>
                            <textarea
                              rows={2}
                              value={newAutoGateMessage}
                              onChange={(e) => setNewAutoGateMessage(e.target.value)}
                              className="w-full rounded-xl bg-[#141414] border border-[#333] px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none font-sans"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] text-zinc-400 mb-1">
                                Quick Reply Button Text
                              </label>
                              <input
                                type="text"
                                value={newAutoGateButtonText}
                                onChange={(e) => setNewAutoGateButtonText(e.target.value)}
                                className="w-full rounded-xl bg-[#141414] border border-[#333] px-3 py-1.5 text-xs text-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-zinc-400 mb-1">
                                Re-check Failure Message
                              </label>
                              <input
                                type="text"
                                value={newAutoNotFollowingMessage}
                                onChange={(e) => setNewAutoNotFollowingMessage(e.target.value)}
                                className="w-full rounded-xl bg-[#141414] border border-[#333] px-3 py-1.5 text-xs text-white"
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Email Capture Toggle */}
                    <div className="p-4 rounded-2xl bg-black border border-[#2a2a2a] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-amber-400" />
                        <div>
                          <span className="text-xs font-bold text-white block">Email Lead Capture Step</span>
                          <span className="text-[11px] text-zinc-400">Ask for email before delivering the resource card</span>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={newAutoAskEmail}
                        onChange={(e) => setNewAutoAskEmail(e.target.checked)}
                        className="w-4 h-4 accent-amber-500 rounded"
                      />
                    </div>

                    {/* Resource Delivery Settings */}
                    <div className="p-4 rounded-2xl bg-black border border-[#2a2a2a] space-y-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-white">Resource Card Delivery</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-zinc-400 mb-1">
                            Interactive Button Label
                          </label>
                          <input
                            type="text"
                            value={newAutoButtonTitle}
                            onChange={(e) => setNewAutoButtonTitle(e.target.value)}
                            placeholder="Get the guide 🎁"
                            className="w-full rounded-xl bg-[#141414] border border-[#333] px-3 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-zinc-400 mb-1">
                            Resource Download Link (PDF / Drive)
                          </label>
                          <input
                            type="text"
                            value={newAutoButtonUrl}
                            onChange={(e) => setNewAutoButtonUrl(e.target.value)}
                            placeholder="https://.../guide.pdf"
                            className="w-full rounded-xl bg-[#141414] border border-[#333] px-3 py-1.5 text-xs text-white"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-bold text-xs py-3 hover:opacity-95 transition shadow-lg"
                    >
                      Publish Reel Lead Magnet Campaign
                    </button>
                  </form>

                  {/* Right: Live Mobile Simulator Preview (5 cols) */}
                  <div className="lg:col-span-5 flex flex-col items-center">
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                      Live Instagram DM Simulator
                    </span>

                    {/* Phone Screen Mockup matching Screenshot */}
                    <div className="w-[300px] h-[520px] rounded-[36px] bg-black border-4 border-[#333] overflow-hidden flex flex-col shadow-2xl relative text-[12px]">
                      {/* Phone Top Notch */}
                      <div className="h-6 bg-black flex items-center justify-between px-6 pt-1 text-[10px] text-zinc-400">
                        <span>11:37</span>
                        <div className="w-12 h-3 bg-zinc-800 rounded-full" />
                        <span>5G 51%</span>
                      </div>

                      {/* Header */}
                      <div className="px-4 py-2 border-b border-[#222] flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-orange-500 to-pink-500 flex items-center justify-center font-bold text-white text-[10px]">
                          TK
                        </div>
                        <div>
                          <p className="font-bold text-white text-[11px]">travel_kathegalu</p>
                          <p className="text-[9px] text-zinc-400">Instagram</p>
                        </div>
                      </div>

                      {/* Messages Flow Screen */}
                      <div className="flex-1 p-3 space-y-2.5 overflow-y-auto">
                        {/* 1. User Trigger */}
                        <div className="flex justify-end">
                          <span className="px-3 py-1 rounded-full bg-purple-600 text-white font-medium text-[11px]">
                            Day15
                          </span>
                        </div>

                        {/* 2. Gate Message */}
                        <div className="space-y-1.5">
                          <div className="p-2.5 rounded-2xl bg-[#262626] text-white text-[10.5px] leading-snug">
                            {newAutoGateMessage}
                          </div>
                          <div className="flex justify-start">
                            <span className="px-3 py-1 rounded-xl bg-[#363636] border border-[#444] text-white text-[10px] font-bold">
                              {newAutoGateButtonText}
                            </span>
                          </div>
                        </div>

                        {/* 3. User taps */}
                        <div className="flex justify-end">
                          <span className="px-3 py-1 rounded-full bg-purple-600 text-white font-medium text-[11px]">
                            I'm following you!
                          </span>
                        </div>

                        {/* 4. Email prompt or resource */}
                        {newAutoAskEmail && (
                          <>
                            <div className="p-2.5 rounded-2xl bg-[#262626] text-white text-[10.5px] leading-snug">
                              Awesome 👏 What's the best email to send this to? Reply with your email 👇
                            </div>
                            <div className="flex justify-end">
                              <span className="px-2.5 py-1 rounded-full bg-purple-600 text-white font-medium text-[10.5px]">
                                user@gmail.com
                              </span>
                            </div>
                          </>
                        )}

                        {/* 5. Unlocked Resource Card */}
                        <div className="space-y-1.5">
                          <div className="p-2.5 rounded-2xl bg-[#262626] text-white text-[10.5px] leading-snug whitespace-pre-line">
                            {newAutoSuccessMessage}
                          </div>
                          <div className="p-2 rounded-xl bg-[#1f1f1f] border border-[#333] text-center text-white font-bold text-[10px]">
                            {newAutoButtonTitle}
                          </div>
                        </div>
                      </div>

                      {/* Mock Composer */}
                      <div className="p-2 border-t border-[#222] bg-[#121212]">
                        <div className="rounded-full bg-black border border-[#333] px-3 py-1 text-[10px] text-zinc-500">
                          Message...
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: CAPTURED LEADS CRM */}
              {activeAutoTab === 'leads' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                        Verified Followers & Captured Email Leads
                      </h3>
                      <p className="text-xs text-zinc-400">
                        Followers who interacted with your Reel automation and submitted their contact info.
                      </p>
                    </div>

                    <button
                      onClick={handleExportLeadsCsv}
                      disabled={leadCaptures.length === 0}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#262626] hover:bg-[#333] text-white text-xs font-bold transition disabled:opacity-50"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export CSV</span>
                    </button>
                  </div>

                  {leadCaptures.length === 0 ? (
                    <div className="p-12 text-center text-zinc-500 text-xs">
                      No leads captured yet.
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-[#2a2a2a] overflow-hidden bg-black">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#181818] border-b border-[#2a2a2a] text-zinc-400 font-semibold uppercase text-[10px]">
                          <tr>
                            <th className="px-4 py-3">Follower</th>
                            <th className="px-4 py-3">Email Address</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Reel / Source</th>
                            <th className="px-4 py-3">Unlocked At</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1e1e1e]">
                          {leadCaptures.map((l) => (
                            <tr key={l.id} className="hover:bg-[#141414] transition">
                              <td className="px-4 py-3 font-semibold text-white">
                                <div>
                                  <p>{l.participant_name || 'Traveler'}</p>
                                  <p className="text-[11px] text-zinc-500 font-normal">
                                    @{l.participant_username || l.participant_id}
                                  </p>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                {l.email ? (
                                  <span className="font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-md">
                                    {l.email}
                                  </span>
                                ) : (
                                  <span className="text-zinc-500 italic">Not submitted</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                    l.status === 'unlocked'
                                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                      : l.status === 'awaiting_email'
                                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                      : 'bg-purple-950 text-purple-400 border border-purple-800'
                                  }`}
                                >
                                  {l.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-zinc-400 font-mono text-[11px]">
                                {l.reel_id || 'ALL'}
                              </td>
                              <td className="px-4 py-3 text-zinc-500 text-[11px]">
                                {l.unlocked_at
                                  ? new Date(l.unlocked_at).toLocaleString()
                                  : new Date(l.created_at).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
