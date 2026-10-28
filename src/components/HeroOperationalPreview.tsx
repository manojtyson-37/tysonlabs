'use client';

import React, { useState } from 'react';
import { 
  Check, 
  QrCode, 
  Printer, 
  Send, 
  Sparkles, 
  ArrowRight
} from 'lucide-react';

type StudioWorkstationTab = 'pos' | 'chess' | 'checkout' | 'clinic';

export function HeroOperationalPreview() {
  const [activeTab, setActiveTab] = useState<StudioWorkstationTab>('pos');
  const [simulatedAction, setSimulatedAction] = useState<string | null>(null);
  const [chessMovePlayed, setChessMovePlayed] = useState(false);

  const triggerFeedback = (message: string) => {
    setSimulatedAction(message);
    setTimeout(() => {
      setSimulatedAction(null);
    }, 3600);
  };

  return (
    <div className="w-full bg-white dark:bg-[#14161C] border border-zinc-200/90 dark:border-white/[0.1] rounded-2xl overflow-hidden shadow-xl dark:shadow-2xl dark:shadow-black/70 font-sans transition-all duration-300">
      {/* Top Workstation Bar */}
      <div className="bg-zinc-100/90 dark:bg-[#1A1D24] px-4 py-3 border-b border-zinc-200/80 dark:border-white/[0.08] flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-bold text-zinc-900 dark:text-white tracking-tight">
            Live Software Workstation
          </span>
          <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 hidden sm:inline">
            {"// CLICK TO TEST REAL INTERFACES"}
          </span>
        </div>

        {/* 4 Plain-English Product Tabs (Zero Jargon!) */}
        <div className="flex items-center gap-1 bg-white/90 dark:bg-[#0B0D11] p-1 rounded-lg border border-zinc-200/80 dark:border-white/[0.06] text-xs overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => {
              setActiveTab('pos');
              setSimulatedAction(null);
            }}
            className={`btn-tactile px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'pos'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            Restaurant Till
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('chess');
              setSimulatedAction(null);
            }}
            className={`btn-tactile px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'chess'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            AI Chess Coach
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('checkout');
              setSimulatedAction(null);
            }}
            className={`btn-tactile px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'checkout'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            1-Click Checkout
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('clinic');
              setSimulatedAction(null);
            }}
            className={`btn-tactile px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'clinic'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            Clinic Manager
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: DINEPULSE RESTAURANT TILL (100% Intuitive)
          ========================================================================= */}
      {activeTab === 'pos' && (
        <div className="p-5 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-white/[0.06] text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold text-xs border border-emerald-200 dark:border-emerald-800/60">
                TABLE 04
              </span>
              <span className="text-zinc-700 dark:text-zinc-300 font-medium">Dine-In · 4 Guests</span>
            </div>
            <div className="text-zinc-500 font-mono text-[11px]">
              Order Ticket #108 · Active Till
            </div>
          </div>

          {/* Running Bill Items */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-white/[0.04]">
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-[2px] border border-emerald-600 flex items-center justify-center shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                </span>
                <span className="text-zinc-950 dark:text-white font-semibold">Paneer Butter Masala</span>
                <span className="text-zinc-400 font-mono text-[11px]">×1</span>
              </div>
              <span className="font-mono font-bold text-zinc-900 dark:text-white">₹280</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-white/[0.04]">
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-[2px] border border-emerald-600 flex items-center justify-center shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                </span>
                <span className="text-zinc-950 dark:text-white font-semibold">Garlic Butter Naan</span>
                <span className="text-zinc-400 font-mono text-[11px]">×2</span>
              </div>
              <span className="font-mono font-bold text-zinc-900 dark:text-white">₹120</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-white/[0.04]">
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-[2px] border border-emerald-600 flex items-center justify-center shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                </span>
                <span className="text-zinc-950 dark:text-white font-semibold">Fresh Mint Lime Soda</span>
                <span className="text-zinc-400 font-mono text-[11px]">×1</span>
              </div>
              <span className="font-mono font-bold text-zinc-900 dark:text-white">₹80</span>
            </div>
          </div>

          {/* Subtotal & Indian GST Split */}
          <div className="p-3 rounded-lg bg-zinc-100/80 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-white/[0.06] space-y-1 text-xs">
            <div className="flex justify-between text-zinc-600 dark:text-zinc-400 font-mono">
              <span>Food Total:</span>
              <span>₹480.00</span>
            </div>
            <div className="flex justify-between text-zinc-500 font-mono text-[11px]">
              <span>Restaurant GST (5%):</span>
              <span>₹24.00</span>
            </div>
            <div className="pt-1.5 border-t border-zinc-200 dark:border-white/[0.08] flex justify-between font-bold text-sm text-zinc-950 dark:text-white">
              <span>Final Bill Amount:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono text-base">₹504.00</span>
            </div>
          </div>

          {/* Interactive Simulation Result */}
          {simulatedAction && (
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center gap-2 animate-fadeIn">
              <Check className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{simulatedAction}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => triggerFeedback('Order #108 sent to Kitchen thermal printers! Table 04 food is now being prepared.')}
              className="btn-tactile px-3 py-2.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-white/[0.08] text-xs font-bold flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <Printer className="w-3.5 h-3.5 text-zinc-500" />
              <span>Send to Kitchen (KOT)</span>
            </button>

            <button
              type="button"
              onClick={() => triggerFeedback('Paid ₹504 via UPI! WhatsApp bill & PDF receipt sent to customer phone instantly.')}
              className="btn-tactile px-3 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Settle ₹504 via UPI</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: AI CHESS COACH (Engaging, Visual, 100% Plain English!)
          ========================================================================= */}
      {activeTab === 'chess' && (
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-white/[0.06] text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 font-bold text-xs border border-sky-200 dark:border-sky-800/60">
                AI CHESS COACH
              </span>
              <span className="text-zinc-700 dark:text-zinc-300 font-medium">Interactive Academy</span>
            </div>
            <div className="text-zinc-500 font-mono text-[11px]">
              Fast AI · 0s Loading
            </div>
          </div>

          <div className="flex items-center gap-4 py-1">
            {/* 4x4 Mini Visual Chessboard */}
            <div className="grid grid-cols-4 grid-rows-4 w-28 h-28 rounded-lg border border-zinc-300 dark:border-zinc-700 overflow-hidden shrink-0 shadow-sm">
              {[
                '♜', '♞', '♝', '♛', 
                '♟', '♟', '♟', '♟', 
                ' ', ' ', chessMovePlayed ? '♘' : ' ', ' ', 
                '♙', '♙', '♙', '♔'
              ].map((piece, i) => {
                const isDark = (Math.floor(i / 4) + (i % 4)) % 2 === 1;
                return (
                  <div
                    key={i}
                    className={`flex items-center justify-center text-sm font-serif transition-colors ${
                      isDark ? 'bg-amber-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200' : 'bg-amber-50 dark:bg-zinc-700 text-zinc-900 dark:text-white'
                    }`}
                  >
                    {piece}
                  </div>
                );
              })}
            </div>

            {/* Plain English AI Analysis */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                  {chessMovePlayed ? '+2.4 Winning' : '+1.8 White Leads'}
                </span>
                <span className="text-zinc-500 text-[11px]">Amateur vs Master Bot</span>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-white/[0.04] text-xs">
                <div className="font-bold text-zinc-900 dark:text-white">Coach Advice:</div>
                <p className="text-zinc-600 dark:text-zinc-300 text-[11px] mt-0.5 leading-snug">
                  {chessMovePlayed 
                    ? "Great tactical move! Your Knight on d5 attacks both the black Queen and Bishop."
                    : "Look at the open center square. Moving Knight to d5 forks your opponent's key pieces."}
                </p>
              </div>

              <div className="text-[11px] text-zinc-500">
                Best move: <span className="font-bold text-zinc-950 dark:text-white">Knight to d5 (Nd5)</span>
              </div>
            </div>
          </div>

          {simulatedAction && (
            <div className="p-3 rounded-lg bg-sky-50 dark:bg-sky-950/70 border border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-300 text-xs font-medium flex items-center gap-2 animate-fadeIn">
              <Check className="w-4 h-4 shrink-0 text-sky-600 dark:text-sky-400" />
              <span>{simulatedAction}</span>
            </div>
          )}

          <div className="pt-1">
            <button
              type="button"
              onClick={() => {
                setChessMovePlayed(true);
                triggerFeedback('Knight moved to d5! Coach analyzed 1.8M positions in 40 milliseconds right in your browser.');
              }}
              className="btn-tactile w-full px-4 py-2.5 rounded-lg bg-black text-white dark:bg-white dark:text-black font-bold text-xs flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Play Knight to d5 (Test Live AI Move)</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: 1-CLICK CREATOR CHECKOUT (Instant Digital Purchases)
          ========================================================================= */}
      {activeTab === 'checkout' && (
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-white/[0.06] text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold text-xs border border-emerald-200 dark:border-emerald-800/60">
                1-CLICK CHECKOUT
              </span>
              <span className="text-zinc-700 dark:text-zinc-300 font-medium">Digital Course Store</span>
            </div>
            <div className="text-zinc-500 font-mono text-[11px]">
              Razorpay Secured
            </div>
          </div>

          {/* Product Offer Card */}
          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-white/[0.06] flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-zinc-900 dark:text-white">
                Full-Stack System Architecture Masterclass
              </div>
              <div className="text-[11px] text-zinc-500 mt-0.5">
                Instant Video Lessons + Code Repositories
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-base text-zinc-950 dark:text-white font-mono">₹2,499</div>
              <div className="text-[10px] text-zinc-500">Includes 18% GST</div>
            </div>
          </div>

          {/* Quick Payment Options */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
              Pay in 1-Click with UPI:
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-white/[0.08] text-center font-bold text-zinc-800 dark:text-zinc-200">
                Google Pay
              </div>
              <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-white/[0.08] text-center font-bold text-zinc-800 dark:text-zinc-200">
                PhonePe
              </div>
              <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-white/[0.08] text-center font-bold text-zinc-800 dark:text-zinc-200">
                Paytm UPI
              </div>
            </div>
          </div>

          {simulatedAction && (
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center gap-2 animate-fadeIn">
              <Check className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{simulatedAction}</span>
            </div>
          )}

          <div className="pt-1">
            <button
              type="button"
              onClick={() => triggerFeedback('Payment verified! Video course unlocked instantly and GST invoice emailed to buyer.')}
              className="btn-tactile w-full px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
            >
              <span>Pay ₹2,499 via UPI (Unlock Instantly)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: CLINIC APPOINTMENTS & PATIENT EHR
          ========================================================================= */}
      {activeTab === 'clinic' && (
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-white/[0.06] text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 font-bold text-xs border border-purple-200 dark:border-purple-800/60">
                CLINIC PORTAL
              </span>
              <span className="text-zinc-700 dark:text-zinc-300 font-medium">Physiotherapy & Dental</span>
            </div>
            <div className="text-zinc-500 font-mono text-[11px]">
              Dr. Sarah Rao · Today
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-white/[0.06] space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-zinc-950 dark:text-white">Rahul Verma (34 M)</div>
                <div className="text-[11px] text-zinc-500">Post-Op Knee Rehab · Appointment 4 of 12</div>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold text-[10px]">
                CONFIRMED 10:30 AM
              </span>
            </div>
            <div className="flex justify-between text-[11px] font-mono text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-800/80 p-2 rounded border border-zinc-200/60 dark:border-white/[0.04]">
              <span>Knee Mobility Angle:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">115° (+15° improvement)</span>
            </div>
          </div>

          {simulatedAction && (
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center gap-2 animate-fadeIn">
              <Check className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{simulatedAction}</span>
            </div>
          )}

          <div className="pt-1">
            <button
              type="button"
              onClick={() => triggerFeedback('Session completed! Exercise notes and next visit reminder sent to patient via WhatsApp.')}
              className="btn-tactile w-full px-4 py-2.5 rounded-lg bg-zinc-900 hover:bg-black dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Complete Visit & Send WhatsApp Exercise Chart</span>
            </button>
          </div>
        </div>
      )}

      {/* Footer Benchmark Note */}
      <div className="px-5 py-2.5 bg-zinc-50 dark:bg-[#101217] border-t border-zinc-100 dark:border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-zinc-500">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          <span>Real Production Software · Ready to Test</span>
        </span>
        <span className="hidden sm:inline">Bangalore, India · 16 Shipped Builds</span>
      </div>
    </div>
  );
}
