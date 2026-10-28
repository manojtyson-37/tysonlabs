'use client';

import React, { useState } from 'react';
import { 
  Check, 
  QrCode, 
  Printer, 
  Cpu, 
  ShieldCheck, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

type StudioWorkstationTab = 'pos' | 'chess' | 'checkout';

export function HeroOperationalPreview() {
  const [activeTab, setActiveTab] = useState<StudioWorkstationTab>('pos');
  const [simulatedAction, setSimulatedAction] = useState<string | null>(null);

  const triggerFeedback = (message: string) => {
    setSimulatedAction(message);
    setTimeout(() => {
      setSimulatedAction(null);
    }, 3200);
  };

  return (
    <div className="w-full bg-white dark:bg-[#14161C] border border-black/[0.08] dark:border-white/[0.1] rounded-2xl overflow-hidden shadow-xl dark:shadow-2xl dark:shadow-black/70 font-sans transition-all duration-300">
      {/* Workstation Top Control Bar */}
      <div className="bg-zinc-100/90 dark:bg-[#1A1D24] px-4 py-3 border-b border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-semibold text-zinc-900 dark:text-white tracking-tight">
            Interactive Product Preview
          </span>
          <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 hidden sm:inline">
            {"// LIVE DEMO WORKSTATION"}
          </span>
        </div>

        {/* 3 Intuitive Product Tabs */}
        <div className="flex items-center gap-1 bg-white/80 dark:bg-[#0B0D11] p-1 rounded-lg border border-black/[0.06] dark:border-white/[0.06] text-xs">
          <button
            type="button"
            onClick={() => {
              setActiveTab('pos');
              setSimulatedAction(null);
            }}
            className={`btn-tactile px-3 py-1 rounded-md text-xs font-medium transition-all ${
              activeTab === 'pos'
                ? 'bg-black text-white dark:bg-white dark:text-black font-semibold shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            Restaurant POS Till
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('chess');
              setSimulatedAction(null);
            }}
            className={`btn-tactile px-3 py-1 rounded-md text-xs font-medium transition-all ${
              activeTab === 'chess'
                ? 'bg-black text-white dark:bg-white dark:text-black font-semibold shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            WASM Chess Engine
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('checkout');
              setSimulatedAction(null);
            }}
            className={`btn-tactile px-3 py-1 rounded-md text-xs font-medium transition-all ${
              activeTab === 'checkout'
                ? 'bg-black text-white dark:bg-white dark:text-black font-semibold shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            Creator Checkout
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: DINEPULSE RESTAURANT POS TILL
          ========================================================================= */}
      {activeTab === 'pos' && (
        <div className="p-5 space-y-4">
          {/* Table & Order Metadata */}
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.06] text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 font-semibold text-zinc-900 dark:text-white text-[11px]">
                TABLE 04
              </span>
              <span className="text-zinc-600 dark:text-zinc-400 text-xs">Dine In · 4 Guests</span>
            </div>
            <div className="font-mono text-zinc-500 text-[11px]">
              Order Ticket #108 · Active
            </div>
          </div>

          {/* Running Bill Items with FSSAI Veg / Non-Veg Marks */}
          <div className="space-y-2 text-xs">
            {/* Item 1 */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-black/[0.04] dark:border-white/[0.04]">
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-[2px] border border-emerald-600 flex items-center justify-center shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                </span>
                <span className="text-zinc-900 dark:text-zinc-100 font-medium">Paneer Butter Masala</span>
                <span className="text-zinc-400 font-mono text-[11px]">×1</span>
              </div>
              <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">₹280</span>
            </div>

            {/* Item 2 */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-black/[0.04] dark:border-white/[0.04]">
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-[2px] border border-emerald-600 flex items-center justify-center shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                </span>
                <span className="text-zinc-900 dark:text-zinc-100 font-medium">Garlic Butter Naan</span>
                <span className="text-zinc-400 font-mono text-[11px]">×2</span>
              </div>
              <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">₹120</span>
            </div>

            {/* Item 3 */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-black/[0.04] dark:border-white/[0.04]">
              <div className="flex items-center gap-2.5">
                <span className="w-3.5 h-3.5 rounded-[2px] border border-emerald-600 flex items-center justify-center shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                </span>
                <span className="text-zinc-900 dark:text-zinc-100 font-medium">Fresh Mint Lime Soda</span>
                <span className="text-zinc-400 font-mono text-[11px]">×1</span>
              </div>
              <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">₹80</span>
            </div>
          </div>

          {/* Subtotal & Indian GST Split */}
          <div className="p-3 rounded-lg bg-zinc-100/70 dark:bg-zinc-800/50 border border-black/[0.06] dark:border-white/[0.06] space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
              <span>Subtotal:</span>
              <span>₹480.00</span>
            </div>
            <div className="flex justify-between text-zinc-500 text-[11px]">
              <span>CGST 2.5% + SGST 2.5%:</span>
              <span>₹24.00</span>
            </div>
            <div className="pt-1 border-t border-black/[0.08] dark:border-white/[0.08] flex justify-between font-bold text-sm text-zinc-950 dark:text-white">
              <span>Total Bill (INR):</span>
              <span className="text-emerald-600 dark:text-emerald-400">₹504.00</span>
            </div>
          </div>

          {/* Simulated Feedback Banner */}
          {simulatedAction && (
            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-mono flex items-center gap-2 animate-fadeIn">
              <Check className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{simulatedAction}</span>
            </div>
          )}

          {/* Interactive Till Action Triggers */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => triggerFeedback('KOT #108 dispatched to Tandoor & Main Kitchen thermal printers!')}
              className="btn-tactile px-3 py-2.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border border-black/[0.08] dark:border-white/[0.08] text-xs font-semibold flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <Printer className="w-3.5 h-3.5 text-zinc-500" />
              <span>Fire KOT</span>
            </button>

            <button
              type="button"
              onClick={() => triggerFeedback('Razorpay Dynamic UPI QR generated & Table 04 settled!')}
              className="btn-tactile px-3 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Settle via UPI</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: TYSON CHESS STOCKFISH 18 WASM
          ========================================================================= */}
      {activeTab === 'chess' && (
        <div className="p-5 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.06] text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 font-mono font-bold text-[11px]">
                STOCKFISH 18 WASM
              </span>
              <span className="text-zinc-600 dark:text-zinc-400 text-xs">Client-Side Engine</span>
            </div>
            <div className="font-mono text-zinc-500 text-[11px]">
              1.84M Nodes / Sec · 8 Threads
            </div>
          </div>

          {/* Board & Analysis View */}
          <div className="flex items-center gap-4 py-1">
            {/* 4x4 Mini Board Preview */}
            <div className="grid grid-cols-4 grid-rows-4 w-28 h-28 rounded-lg border border-black/10 dark:border-white/10 overflow-hidden shrink-0 shadow-sm">
              {['♜', '♞', '♝', '♛', '♟', '♟', '♟', '♟', ' ', ' ', '♘', ' ', '♙', '♙', '♙', '♔'].map((piece, i) => {
                const isDark = (Math.floor(i / 4) + (i % 4)) % 2 === 1;
                return (
                  <div
                    key={i}
                    className={`flex items-center justify-center text-sm font-serif ${
                      isDark ? 'bg-amber-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200' : 'bg-amber-50 dark:bg-zinc-700 text-zinc-900 dark:text-white'
                    }`}
                  >
                    {piece}
                  </div>
                );
              })}
            </div>

            {/* Engine Analysis & Evaluation Meter */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-mono font-bold text-xs">
                  +1.84 Advantage
                </span>
                <span className="text-zinc-500 font-mono text-[10px]">Depth: 24 ply</span>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-black/[0.04] dark:border-white/[0.04] text-xs">
                <div className="font-semibold text-zinc-900 dark:text-white">Coach Tactical Callout:</div>
                <p className="text-zinc-600 dark:text-zinc-400 text-[11px] mt-0.5 leading-tight">
                  White controls the open d-file. Knight on d5 forks black Queen and Bishop.
                </p>
              </div>

              <div className="text-[11px] font-mono text-zinc-500">
                Recommended move: <span className="font-bold text-zinc-950 dark:text-white">24. Nd5!</span>
              </div>
            </div>
          </div>

          {/* Simulated Feedback Banner */}
          {simulatedAction && (
            <div className="p-2.5 rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/80 text-sky-800 dark:text-sky-300 text-xs font-mono flex items-center gap-2 animate-fadeIn">
              <Check className="w-4 h-4 shrink-0 text-sky-600 dark:text-sky-400" />
              <span>{simulatedAction}</span>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => triggerFeedback('Stockfish 18 WASM analyzed 1.84 million positions in 42ms with 0ms server overhead!')}
              className="btn-tactile w-full px-4 py-2.5 rounded-lg bg-black text-white dark:bg-white dark:text-black font-semibold text-xs flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Run Browser WASM Benchmark (100% Client-Side)</span>
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: TYSONPE CREATOR COMMERCE CHECKOUT
          ========================================================================= */}
      {activeTab === 'checkout' && (
        <div className="p-5 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.06] text-xs">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
              <ShieldCheck className="w-4 h-4" />
              <span>RAZORPAY INSTANT CHECKOUT</span>
            </div>
            <span className="text-zinc-500 font-mono text-[11px]">HMAC SECURED</span>
          </div>

          {/* Product Offer Card */}
          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-zinc-900 dark:text-white">
                Full-Stack System Architecture Masterclass
              </div>
              <div className="text-[11px] text-zinc-500 mt-0.5">
                Instant Access · DRM Protected Video & Code Repo
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono font-bold text-base text-zinc-950 dark:text-white">₹2,499</div>
              <div className="text-[10px] font-mono text-zinc-500">+18% GST Included</div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
              Select 1-Click Payment:
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <div className="p-2 rounded-lg bg-zinc-100/80 dark:bg-zinc-800/80 border border-black/[0.08] dark:border-white/[0.08] text-center font-medium text-zinc-800 dark:text-zinc-200">
                Google Pay
              </div>
              <div className="p-2 rounded-lg bg-zinc-100/80 dark:bg-zinc-800/80 border border-black/[0.08] dark:border-white/[0.08] text-center font-medium text-zinc-800 dark:text-zinc-200">
                PhonePe
              </div>
              <div className="p-2 rounded-lg bg-zinc-100/80 dark:bg-zinc-800/80 border border-black/[0.08] dark:border-white/[0.08] text-center font-medium text-zinc-800 dark:text-zinc-200">
                Paytm UPI
              </div>
            </div>
          </div>

          {/* Simulated Feedback Banner */}
          {simulatedAction && (
            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-mono flex items-center gap-2 animate-fadeIn">
              <Check className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{simulatedAction}</span>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => triggerFeedback('Payment verified! Automated GST tax invoice and course access link sent via WhatsApp & Email!')}
              className="btn-tactile w-full px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
            >
              <span>Pay ₹2,499 via UPI (Instant Delivery)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Footer Benchmark Note */}
      <div className="px-5 py-2.5 bg-zinc-50 dark:bg-[#101217] border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-zinc-500">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-emerald-500" />
          <span>Real Domain Mathematics & Zero Synthetic Slop</span>
        </span>
        <span className="hidden sm:inline">Bangalore · Global Edge</span>
      </div>
    </div>
  );
}
