'use client';

import React from 'react';
import { 
  Check, 
  ShieldCheck, 
  Receipt, 
  Activity, 
  Cpu
} from 'lucide-react';

interface ProjectGraphicProps {
  slug: string;
  name?: string;
  category?: string;
  className?: string;
}

export function ProjectGraphic({ slug, className = '' }: ProjectGraphicProps) {
  // Base container for the visual card preview
  const baseContainer = `w-full h-48 p-4 flex flex-col justify-between relative overflow-hidden transition-all duration-300 select-none ${className}`;

  switch (slug) {
    /* -------------------------------------------------------------------------
       1. DinePulse — Authentic Restaurant POS Till & KOT Ticket
       ------------------------------------------------------------------------- */
    case 'dinepulse':
      return (
        <div className={`${baseContainer} bg-zinc-900 text-white dark:bg-[#0E1015]`}>
          {/* Header Strip */}
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-[11px] font-mono">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold text-[10px]">
                TABLE 04
              </span>
              <span className="text-zinc-400 text-[10px]">Dine-In · 4 Covers</span>
            </div>
            <span className="text-zinc-500 text-[10px]">KOT #108 · Active</span>
          </div>

          {/* Running Ticket Items with FSSAI Veg / Non-Veg Badges */}
          <div className="space-y-1.5 py-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                {/* FSSAI Veg Green Dot */}
                <span className="w-3 h-3 rounded-[2px] border border-emerald-500 flex items-center justify-center shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                </span>
                <span className="text-zinc-200 font-medium">Paneer Butter Masala</span>
                <span className="text-zinc-500 text-[11px]">×1</span>
              </div>
              <span className="font-mono text-zinc-300">₹280</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                {/* FSSAI Veg Green Dot */}
                <span className="w-3 h-3 rounded-[2px] border border-emerald-500 flex items-center justify-center shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                </span>
                <span className="text-zinc-200 font-medium">Garlic Butter Naan</span>
                <span className="text-zinc-500 text-[11px]">×2</span>
              </div>
              <span className="font-mono text-zinc-300">₹120</span>
            </div>
          </div>

          {/* Bottom Settlement & Tax Bar */}
          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
            <div className="text-[10px] font-mono text-zinc-400">
              <span>GST 5% Split</span>
              <span className="ml-1 text-zinc-500">₹20</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm text-white">₹420</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500 text-black font-semibold text-[10px] flex items-center gap-1 shadow-xs">
                <span>⚡ UPI Settle</span>
              </span>
            </div>
          </div>
        </div>
      );

    /* -------------------------------------------------------------------------
       2. Tyson Chess — In-Browser Stockfish 18 WASM Academy
       ------------------------------------------------------------------------- */
    case 'tysonchess':
      return (
        <div className={`${baseContainer} bg-zinc-950 text-white dark:bg-[#0A0C10]`}>
          {/* Top Engine Telemetry Bar */}
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-[11px] font-mono">
            <div className="flex items-center gap-1.5 text-sky-400">
              <Cpu className="w-3 h-3" />
              <span className="text-[10px] font-semibold">STOCKFISH 18 WASM</span>
            </div>
            <span className="text-zinc-500 text-[10px]">1.84M NODES/S</span>
          </div>

          {/* Graphical Chessboard & Evaluation Split */}
          <div className="flex items-center gap-3 py-1">
            {/* 4x4 Mini Tactical Board Representation */}
            <div className="grid grid-cols-4 grid-rows-4 w-20 h-20 rounded border border-zinc-700 overflow-hidden shrink-0 shadow-inner">
              {['♜', '♞', '♝', '♛', '♟', '♟', '♟', '♟', ' ', ' ', '♘', ' ', '♙', '♙', '♙', '♔'].map((piece, i) => {
                const isDark = (Math.floor(i / 4) + (i % 4)) % 2 === 1;
                return (
                  <div
                    key={i}
                    className={`flex items-center justify-center text-xs font-serif ${
                      isDark ? 'bg-zinc-800 text-zinc-200' : 'bg-zinc-700 text-white'
                    }`}
                  >
                    {piece}
                  </div>
                );
              })}
            </div>

            {/* Tactical Coach Advice Box */}
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400 font-mono text-[10px] font-bold">
                  +1.84
                </span>
                <span className="text-[10px] font-mono text-zinc-400">Depth: 24 ply</span>
              </div>
              <p className="text-[11px] text-zinc-300 leading-tight">
                Knight pin on f6. Opponent cannot defend the d5 outpost.
              </p>
              <div className="text-[10px] font-mono text-zinc-500">
                Move: <span className="text-white font-semibold">24. Nd5!</span>
              </div>
            </div>
          </div>

          {/* Bottom Status */}
          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[10px] font-mono text-zinc-400">
            <span>ZERO SERVER COST</span>
            <span className="text-emerald-400">8 Web Workers</span>
          </div>
        </div>
      );

    /* -------------------------------------------------------------------------
       3. Tysonpe — Creator Commerce & Razorpay Checkout
       ------------------------------------------------------------------------- */
    case 'tysonpe':
      return (
        <div className={`${baseContainer} bg-zinc-900 text-white dark:bg-[#0F1117]`}>
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-[11px] font-mono">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="text-[10px]">RAZORPAY 1-CLICK CHECKOUT</span>
            </div>
            <span className="text-zinc-500 text-[10px]">INR 100% SECURE</span>
          </div>

          {/* Product Offer Card */}
          <div className="py-1 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">Full-Stack System Architecture</div>
                <div className="text-[10px] text-zinc-400">Lifetime Access · DRM Watermarked</div>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold text-sm text-emerald-400">₹2,499</div>
                <div className="text-[9px] font-mono text-zinc-500">+18% GST</div>
              </div>
            </div>

            {/* UPI Payment Pill Strip */}
            <div className="flex items-center gap-1.5 bg-zinc-800/80 p-1.5 rounded-lg border border-zinc-700/60 text-[10px] font-mono">
              <span className="text-zinc-400">Pay via:</span>
              <span className="px-1.5 py-0.5 rounded bg-zinc-700 text-white font-medium">GPay</span>
              <span className="px-1.5 py-0.5 rounded bg-zinc-700 text-white font-medium">PhonePe</span>
              <span className="px-1.5 py-0.5 rounded bg-zinc-700 text-white font-medium">Paytm</span>
              <span className="ml-auto text-emerald-400 font-semibold">Instant UPI</span>
            </div>
          </div>

          {/* Invoice Receipt Status */}
          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[10px] font-mono text-zinc-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <Check className="w-3 h-3" />
              <span>Automated GST Invoice</span>
            </span>
            <span>HMAC Verified</span>
          </div>
        </div>
      );

    /* -------------------------------------------------------------------------
       4. Silaa Atelier — Garment Manufacturing Production Kanban
       ------------------------------------------------------------------------- */
    case 'silaa':
    case 'silaa-atelier':
      return (
        <div className={`${baseContainer} bg-zinc-900 text-white dark:bg-[#0E1015]`}>
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-[11px] font-mono">
            <div className="flex items-center gap-1.5 text-purple-400 font-semibold">
              <Receipt className="w-3.5 h-3.5" />
              <span className="text-[10px]">PRODUCTION BATCH #842</span>
            </div>
            <span className="text-zinc-400 text-[10px]">500 Pcs · Linen Shirt</span>
          </div>

          {/* Multi-Stage Factory Pipeline */}
          <div className="space-y-2 py-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-300 font-medium">Batch Progress:</span>
              <span className="font-mono text-emerald-400 text-[11px]">Sewing (68% complete)</span>
            </div>

            {/* Stepped Progress Bar */}
            <div className="grid grid-cols-4 gap-1.5">
              <div className="space-y-1">
                <div className="h-1.5 rounded-full bg-emerald-500"></div>
                <div className="text-[9px] font-mono text-zinc-400 text-center">Procure</div>
              </div>
              <div className="space-y-1">
                <div className="h-1.5 rounded-full bg-emerald-500"></div>
                <div className="text-[9px] font-mono text-zinc-400 text-center">Cutting</div>
              </div>
              <div className="space-y-1">
                <div className="h-1.5 rounded-full bg-purple-500"></div>
                <div className="text-[9px] font-mono text-purple-400 font-bold text-center">Sewing</div>
              </div>
              <div className="space-y-1">
                <div className="h-1.5 rounded-full bg-zinc-700"></div>
                <div className="text-[9px] font-mono text-zinc-500 text-center">QC Pack</div>
              </div>
            </div>
          </div>

          {/* Efficiency Metric */}
          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[10px] font-mono text-zinc-400">
            <span>YIELD: <span className="text-white font-bold">99.2%</span></span>
            <span className="text-emerald-400">Zero Fabric Leakage</span>
          </div>
        </div>
      );

    /* -------------------------------------------------------------------------
       5. PhysioCare — Clinical Practice EHR & Patient Chart
       ------------------------------------------------------------------------- */
    case 'physiocare':
      return (
        <div className={`${baseContainer} bg-zinc-900 text-white dark:bg-[#0D1016]`}>
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-[11px] font-mono">
            <div className="flex items-center gap-1.5 text-sky-400 font-semibold">
              <Activity className="w-3.5 h-3.5" />
              <span className="text-[10px]">PATIENT CHART · CLINIC EHR</span>
            </div>
            <span className="text-zinc-500 text-[10px]">TENANT #04</span>
          </div>

          {/* Patient Card Preview */}
          <div className="space-y-2 py-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">Rahul Verma (34 M)</div>
                <div className="text-[10px] text-zinc-400">Post-Op ACL Rehab · Session 4 of 12</div>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-semibold">
                ACTIVE
              </span>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono bg-zinc-800/80 p-2 rounded-lg border border-zinc-700/60">
              <div>
                <span className="text-zinc-500">Range of Motion: </span>
                <span className="text-white font-bold">115° (+15°)</span>
              </div>
              <div className="text-emerald-400">Good Progression</div>
            </div>
          </div>

          {/* Bottom Security Note */}
          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[10px] font-mono text-zinc-400">
            <span>NEON POSTGRES RLS</span>
            <span className="text-sky-400">Isolated Multi-Tenant</span>
          </div>
        </div>
      );

    /* -------------------------------------------------------------------------
       6. Agents & Skills — Autonomous Multi-Agent Terminal
       ------------------------------------------------------------------------- */
    case 'agents-and-skills':
      return (
        <div className={`${baseContainer} bg-zinc-950 text-white dark:bg-[#0A0C10] font-mono`}>
          {/* Terminal Titlebar */}
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </span>
              <span className="text-[10px] text-zinc-400">agent-coordinator.zsh</span>
            </div>
            <span className="text-purple-400 text-[10px]">CHIEF OF STAFF</span>
          </div>

          {/* Live Agent Terminal Log Steps */}
          <div className="space-y-1.5 py-1 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-400 text-[9px] font-bold">PLANNER</span>
              <span className="text-zinc-300">Spec architecture defined</span>
              <Check className="w-3 h-3 text-emerald-400 ml-auto" />
            </div>
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-400 text-[9px] font-bold">CODER</span>
              <span className="text-zinc-300">14 unit tests executed</span>
              <span className="text-emerald-400 text-[10px] ml-auto">100% PASS</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">GATE</span>
              <span className="text-zinc-400">Security audit verified</span>
              <span className="text-zinc-500 text-[10px] ml-auto">0 CVEs</span>
            </div>
          </div>

          {/* Bottom Metric */}
          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[10px] text-zinc-400">
            <span>HEADROOM COMPRESSION</span>
            <span className="text-emerald-400">-78% TOKENS</span>
          </div>
        </div>
      );

    /* -------------------------------------------------------------------------
       7. KBD Books — Indian GST Invoicing & Accounting
       ------------------------------------------------------------------------- */
    case 'kbd-books':
      return (
        <div className={`${baseContainer} bg-zinc-900 text-white dark:bg-[#0E1015]`}>
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-[11px] font-mono">
            <span className="text-emerald-400 font-semibold text-[10px]">TAX INVOICE #INV-2026-084</span>
            <span className="text-zinc-400 text-[10px]">HSN 998314</span>
          </div>

          <div className="space-y-1.5 py-1 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-300">Software Engineering Retainer</span>
              <span className="font-mono text-zinc-200">₹1,20,000</span>
            </div>
            <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
              <span>CGST (9%) + SGST (9%)</span>
              <span>₹21,600</span>
            </div>
            <div className="p-1.5 bg-zinc-800/80 rounded border border-zinc-700/60 flex justify-between font-mono font-bold text-xs">
              <span className="text-white">Total Payable (INR)</span>
              <span className="text-emerald-400">₹1,41,600</span>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[10px] font-mono text-zinc-400">
            <span>GSTIN: 29AAAAA0000A1Z5</span>
            <span className="text-emerald-400">✓ E-Way Ready</span>
          </div>
        </div>
      );

    /* -------------------------------------------------------------------------
       8. Kusum Dental Care — Bilingual Clinic EHR
       ------------------------------------------------------------------------- */
    case 'kusum-dental-care':
      return (
        <div className={`${baseContainer} bg-zinc-900 text-white dark:bg-[#0E1015]`}>
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-[11px] font-mono">
            <span className="text-emerald-400 font-semibold text-[10px]">CLINIC PORTAL (KN/EN)</span>
            <span className="text-zinc-400 text-[10px]">DR. KUSUM DENTAL</span>
          </div>

          <div className="space-y-2 py-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">Root Canal Treatment (RCT)</div>
                <div className="text-[10px] text-zinc-400">Slot Held: Today at 4:30 PM</div>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
                CONFIRMED
              </span>
            </div>

            <div className="text-[10px] font-mono bg-zinc-800/80 p-1.5 rounded text-zinc-300">
              ರೋಗಿಯ ದೃಢೀಕರಣ ಕಳುಹಿಸಲಾಗಿದೆ · WhatsApp confirmation sent
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[10px] font-mono text-zinc-400">
            <span>REALTIME CONCURRENCY</span>
            <span className="text-emerald-400">Zero Double Booking</span>
          </div>
        </div>
      );

    /* -------------------------------------------------------------------------
       Default: Production Application Engine View
       ------------------------------------------------------------------------- */
    default:
      return (
        <div className={`${baseContainer} bg-zinc-900 text-white dark:bg-[#0E1015]`}>
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-[11px] font-mono">
            <span className="text-zinc-400 font-semibold text-[10px]">PRODUCTION ARCHITECTURE</span>
            <span className="text-emerald-400 text-[10px]">SOVEREIGN STACK</span>
          </div>

          <div className="space-y-2 py-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-200 font-medium">Cloud Infrastructure</span>
              <span className="font-mono text-emerald-400 text-[11px]">Vercel Edge</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-200 font-medium">Data Layer</span>
              <span className="font-mono text-sky-400 text-[11px]">PostgreSQL + RLS</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-200 font-medium">Compliance</span>
              <span className="font-mono text-purple-400 text-[11px]">Strict Security</span>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[10px] font-mono text-zinc-400">
            <span>ZERO SYNTHETIC SLOP</span>
            <span className="text-white font-medium">Verified Code</span>
          </div>
        </div>
      );
  }
}
