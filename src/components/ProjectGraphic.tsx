'use client';

import React from 'react';
import { 
  Check, 
  ShieldCheck, 
  Building2,
  MessageSquare,
  TrendingUp,
  ShoppingBag,
  Star,
  Hotel,
  Video,
  Layers
} from 'lucide-react';

interface ProjectGraphicProps {
  slug: string;
  name?: string;
  category?: string;
  className?: string;
}

export function ProjectGraphic({ slug, className = '' }: ProjectGraphicProps) {
  const baseContainer = `w-full h-48 p-4 flex flex-col justify-between relative overflow-hidden transition-all duration-300 select-none ${className}`;

  switch (slug) {
    /* -------------------------------------------------------------------------
       1. DinePulse — Restaurant Till & POS
       ------------------------------------------------------------------------- */
    case 'dinepulse':
      return (
        <div className={`${baseContainer} bg-zinc-900 text-white dark:bg-[#0E1015]`}>
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-[11px] font-mono">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-semibold text-[10px]">
                RESTAURANT BILLING TILL
              </span>
              <span className="text-zinc-500 text-[10px]">Table 04 · 4 Guests</span>
            </div>
            <span className="text-zinc-400 font-medium text-[10px]">Active Order</span>
          </div>

          <div className="space-y-1.5 py-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-[2px] border border-zinc-600 flex items-center justify-center shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
                </span>
                <span className="text-zinc-200 font-medium">Paneer Butter Masala</span>
                <span className="text-zinc-500 text-[11px]">×1</span>
              </div>
              <span className="font-mono text-zinc-200">₹280</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-[2px] border border-zinc-600 flex items-center justify-center shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
                </span>
                <span className="text-zinc-200 font-medium">Garlic Butter Naan</span>
                <span className="text-zinc-500 text-[11px]">×2</span>
              </div>
              <span className="font-mono text-zinc-200">₹120</span>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
            <div className="text-[10px] text-zinc-500 font-mono">
              <span>GST 5% Split Included</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-semibold text-sm text-white">₹420</span>
              <span className="px-2.5 py-1 rounded bg-white text-black font-semibold text-[10px] flex items-center gap-1 shadow-xs">
                <span>Pay via UPI QR</span>
              </span>
            </div>
          </div>
        </div>
      );

    /* -------------------------------------------------------------------------
       2. Tyson Chess — AI Chess Coach & Academy
       ------------------------------------------------------------------------- */
    case 'tysonchess':
      return (
        <div className={`${baseContainer} bg-zinc-950 text-white dark:bg-[#0A0C10]`}>
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-[11px] font-mono">
            <span className="text-[10px] text-zinc-300 font-semibold uppercase">AI Chess Coach & Academy</span>
            <span className="text-zinc-500 text-[10px]">Stockfish 18</span>
          </div>

          <div className="flex items-center gap-3 py-1">
            {/* Visual Mini Board */}
            <div className="grid grid-cols-4 grid-rows-4 w-20 h-20 rounded border border-zinc-800 overflow-hidden shrink-0 shadow-inner">
              {['♜', '♞', '♝', '♛', '♟', '♟', '♟', '♟', ' ', ' ', '♘', ' ', '♙', '♙', '♙', '♔'].map((piece, i) => {
                const isDark = (Math.floor(i / 4) + (i % 4)) % 2 === 1;
                return (
                  <div
                    key={i}
                    className={`flex items-center justify-center text-xs font-serif ${
                      isDark ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-900 text-zinc-100'
                    }`}
                  >
                    {piece}
                  </div>
                );
              })}
            </div>

            {/* Plain-English Coach Hint */}
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-1.5 font-mono">
                <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px]">
                  +1.84 White Leads
                </span>
              </div>
              <p className="text-[11px] text-zinc-300 leading-snug">
                Moving Knight to d5 forks opponent&apos;s Queen and Bishop.
              </p>
              <div className="text-[10px] text-zinc-400 font-mono">
                Best move: <span className="text-white font-semibold">24. Nd5!</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[10px] font-mono text-zinc-500">
            <span>Runs offline in browser</span>
            <span>Zero server latency</span>
          </div>
        </div>
      );

    /* -------------------------------------------------------------------------
       3. Tysonpe — Creator Store & 1-Click Checkout
       ------------------------------------------------------------------------- */
    case 'tysonpe':
      return (
        <div className={`${baseContainer} bg-zinc-900 text-white dark:bg-[#0F1117]`}>
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-[11px] font-mono">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="text-[10px]">CREATOR STORE CHECKOUT</span>
            </div>
            <span className="text-zinc-400 text-[10px]">Razorpay Secured</span>
          </div>

          <div className="py-1 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Full-Stack Software Masterclass</div>
                <div className="text-[10px] text-zinc-400">Instant Access · Video + Code Repo</div>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold text-sm text-emerald-400">₹2,499</div>
                <div className="text-[9px] text-zinc-400">GST Invoice Included</div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-zinc-800/80 p-1.5 rounded-lg border border-zinc-700/60 text-[10px] font-mono">
              <span className="text-zinc-400">1-Click UPI:</span>
              <span className="px-1.5 py-0.5 rounded bg-zinc-700 text-white font-bold">GPay</span>
              <span className="px-1.5 py-0.5 rounded bg-zinc-700 text-white font-bold">PhonePe</span>
              <span className="px-1.5 py-0.5 rounded bg-zinc-700 text-white font-bold">Paytm</span>
              <span className="ml-auto text-emerald-400 font-bold">Unlock</span>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[10px] font-mono text-zinc-400">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <Check className="w-3 h-3" />
              <span>Instant WhatsApp Invoice</span>
            </span>
            <span>Zero Platform Cuts</span>
          </div>
        </div>
      );

    /* -------------------------------------------------------------------------
       4. Silaa Atelier — Factory Production Manager
       ------------------------------------------------------------------------- */
    case 'silaa':
    case 'silaa-atelier':
      return (
        <div className={`${baseContainer} bg-zinc-900 text-white dark:bg-[#0E1015]`}>
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-[11px] font-mono">
            <div className="flex items-center gap-1.5 text-purple-400 font-bold">
              <Building2 className="w-3.5 h-3.5" />
              <span className="text-[10px]">FACTORY ORDER #842</span>
            </div>
            <span className="text-zinc-300 text-[10px] font-semibold">500 Linen Shirts</span>
          </div>

          <div className="space-y-2 py-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-300 font-medium">Production Stage:</span>
              <span className="font-bold text-emerald-400 text-[11px]">Sewing in progress (68%)</span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              <div className="space-y-1">
                <div className="h-2 rounded-full bg-emerald-500"></div>
                <div className="text-[9px] font-mono text-zinc-300 text-center font-medium">Fabric Lot</div>
              </div>
              <div className="space-y-1">
                <div className="h-2 rounded-full bg-emerald-500"></div>
                <div className="text-[9px] font-mono text-zinc-300 text-center font-medium">Cutting</div>
              </div>
              <div className="space-y-1">
                <div className="h-2 rounded-full bg-purple-500"></div>
                <div className="text-[9px] font-mono text-purple-300 font-bold text-center">Sewing</div>
              </div>
              <div className="space-y-1">
                <div className="h-2 rounded-full bg-zinc-700"></div>
                <div className="text-[9px] font-mono text-zinc-500 text-center">Packing</div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[10px] font-mono text-zinc-400">
            <span>FABRIC YIELD: <span className="text-white font-bold">99.2%</span></span>
            <span className="text-emerald-400 font-medium">Zero Material Wastage</span>
          </div>
        </div>
      );

    /* -------------------------------------------------------------------------
       5. PhysioCare — Clinic & Patient Portal
       ------------------------------------------------------------------------- */
    case 'physiocare':
      return (
        <div className={`${baseContainer} bg-zinc-900 text-white dark:bg-[#0D1016]`}>
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-[11px] font-mono">
            <span className="text-sky-400 font-bold text-[10px]">DOCTOR & CLINIC PORTAL</span>
            <span className="text-zinc-400 text-[10px]">Dr. Sarah Rao</span>
          </div>

          <div className="space-y-2 py-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Rahul Verma (34 M)</div>
                <div className="text-[10px] text-zinc-400">Post-Op Knee Rehab · Visit 4 of 12</div>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                CONFIRMED
              </span>
            </div>

            <div className="flex items-center justify-between text-[10px] bg-zinc-800/80 p-2 rounded-lg border border-zinc-700/60">
              <div>
                <span className="text-zinc-400">Knee Flexibility: </span>
                <span className="text-white font-bold">115° (+15° gain)</span>
              </div>
              <div className="text-emerald-400 font-medium">On Track for Full Recovery</div>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[10px] font-mono text-zinc-400">
            <span>Private Patient Records</span>
            <span className="text-sky-400">WhatsApp Reminders</span>
          </div>
        </div>
      );

    /* -------------------------------------------------------------------------
       6. Kusum Dental Care — Bilingual Clinic Portal
       ------------------------------------------------------------------------- */
    case 'kusum-dental-care':
      return (
        <div className={`${baseContainer} bg-zinc-900 text-white dark:bg-[#0E1015]`}>
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-[11px] font-mono">
            <span className="text-emerald-400 font-bold text-[10px]">DENTAL CLINIC BOOKING</span>
            <span className="text-zinc-400 text-[10px]">Bangalore, KA</span>
          </div>

          <div className="space-y-2 py-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Root Canal Treatment (RCT)</div>
                <div className="text-[10px] text-zinc-400">Today at 4:30 PM · Dr. Kusum</div>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                SLOT HELD
              </span>
            </div>

            <div className="text-[10px] bg-zinc-800/80 p-1.5 rounded text-zinc-300 font-sans">
              ದೃಢೀಕರಣ ಕಳುಹಿಸಲಾಗಿದೆ · Instant WhatsApp confirmation sent to patient.
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[10px] font-mono text-zinc-400">
            <span>Zero Double Bookings</span>
            <span className="text-emerald-400 font-medium">Bilingual (KN / EN)</span>
          </div>
        </div>
      );

    /* -------------------------------------------------------------------------
       7. Agents & Skills — Autonomous AI Business Workflows
       ------------------------------------------------------------------------- */
    case 'agents-and-skills':
      return (
        <div className={`${baseContainer} bg-zinc-950 text-white dark:bg-[#0A0C10]`}>
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-[11px]">
            <span className="text-purple-400 font-bold text-[10px]">AUTONOMOUS AI WORKFLOWS</span>
            <span className="text-zinc-400 font-mono text-[10px]">3 Agents Working</span>
          </div>

          <div className="space-y-1.5 py-1 text-xs">
            <div className="flex items-center justify-between p-1.5 rounded bg-zinc-900/80 border border-zinc-800">
              <span className="text-zinc-200">1. Market Research & Competitor Audit</span>
              <span className="text-emerald-400 font-bold text-[10px]">COMPLETED</span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded bg-zinc-900/80 border border-zinc-800">
              <span className="text-zinc-200">2. Software Code Generation (14 Tests)</span>
              <span className="text-emerald-400 font-bold text-[10px]">100% PASS</span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded bg-zinc-900/80 border border-zinc-800">
              <span className="text-zinc-200">3. Final Security & Bug Review</span>
              <span className="text-purple-400 font-bold text-[10px]">APPROVED</span>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[10px] font-mono text-zinc-400">
            <span>Automates manual business tasks</span>
            <span className="text-emerald-400">24/7 Execution</span>
          </div>
        </div>
      );

    /* -------------------------------------------------------------------------
       8. KBD Books — Indian GST Invoicing & Accounting
       ------------------------------------------------------------------------- */
    case 'kbd-books':
      return (
        <div className={`${baseContainer} bg-zinc-900 text-white dark:bg-[#0E1015]`}>
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-[11px] font-mono">
            <span className="text-emerald-400 font-bold text-[10px]">GST TAX INVOICE #084</span>
            <span className="text-zinc-400 text-[10px]">HSN 998314</span>
          </div>

          <div className="space-y-1.5 py-1 text-xs">
            <div className="flex justify-between">
              <span className="text-zinc-300">Software Architecture Sprint</span>
              <span className="font-mono text-zinc-200 font-bold">₹1,20,000</span>
            </div>
            <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
              <span>CGST 9% + SGST 9% Split</span>
              <span>₹21,600</span>
            </div>
            <div className="p-1.5 bg-zinc-800/80 rounded border border-zinc-700/60 flex justify-between font-mono font-bold text-xs">
              <span className="text-white">Total Amount Paid</span>
              <span className="text-emerald-400">₹1,41,600</span>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[10px] font-mono text-zinc-400">
            <span>Automated GST Calculation</span>
            <span className="text-emerald-400">Printable PDF Invoices</span>
          </div>
        </div>
      );

    /* -------------------------------------------------------------------------
       9. ECHORA — Luxury Ethnic Wear Storefront
       ------------------------------------------------------------------------- */
    case 'echora':
      return (
        <div className={`${baseContainer} bg-[#181412] text-white`}>
          <div className="flex items-center justify-between pb-2 border-b border-[#2D2520] text-[11px] font-mono">
            <div className="flex items-center gap-1.5 text-amber-300 font-bold">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span className="text-[10px]">LUXURY ETHNIC WEAR</span>
            </div>
            <span className="text-amber-200/60 text-[10px]">Bangalore Studio</span>
          </div>

          <div className="py-1 space-y-1.5">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xs font-serif font-bold text-amber-100">Raw Silk Anarkali · Crimson</div>
                <div className="text-[10px] text-zinc-400">Handcrafted Zari Embroidery · Size M</div>
              </div>
              <span className="font-mono text-xs font-bold text-amber-300">₹8,499</span>
            </div>

            <div className="flex items-center gap-2 p-1.5 rounded bg-[#251E19] border border-[#3A2E26] text-[10px]">
              <span className="text-emerald-400 font-bold">● In Stock</span>
              <span className="text-zinc-400">Ships in 24 Hours</span>
              <span className="ml-auto text-amber-200 font-medium">1-Click WhatsApp Order 💬</span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#2D2520] flex items-center justify-between text-[10px] font-mono text-zinc-400">
            <span>Near-instant mobile catalog</span>
            <span className="text-amber-300">Zero loading delay</span>
          </div>
        </div>
      );

    /* -------------------------------------------------------------------------
       10. Nexify Dashboard — Agency Operations & Cashflow
       ------------------------------------------------------------------------- */
    case 'nexify-dashboard':
      return (
        <div className={`${baseContainer} bg-zinc-900 text-white dark:bg-[#0D1117]`}>
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-[11px] font-mono">
            <div className="flex items-center gap-1.5 text-sky-400 font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="text-[10px]">AGENCY FINANCIAL HUB</span>
            </div>
            <span className="text-zinc-400 text-[10px]">Runway: 14 Months</span>
          </div>

          <div className="grid grid-cols-2 gap-2 py-1">
            <div className="p-2 rounded bg-zinc-800/80 border border-zinc-700/60">
              <div className="text-[10px] text-zinc-400">Monthly Revenue</div>
              <div className="text-sm font-mono font-bold text-white">₹14,80,000</div>
              <div className="text-[9px] text-emerald-400 font-medium">+18% vs Last Month</div>
            </div>
            <div className="p-2 rounded bg-zinc-800/80 border border-zinc-700/60">
              <div className="text-[10px] text-zinc-400">Gross Margin</div>
              <div className="text-sm font-mono font-bold text-emerald-400">74.2%</div>
              <div className="text-[9px] text-zinc-300">12 Active Retainers</div>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[10px] font-mono text-zinc-400">
            <span>Automated Profit Forecasts</span>
            <span className="text-sky-400">Zero Spreadsheets</span>
          </div>
        </div>
      );

    /* -------------------------------------------------------------------------
       11. Expense Manager — Offline-First Personal Finance
       ------------------------------------------------------------------------- */
    case 'expense-manager':
      return (
        <div className={`${baseContainer} bg-zinc-900 text-white dark:bg-[#0A120E]`}>
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-[11px] font-mono">
            <span className="text-emerald-400 font-bold text-[10px]">PERSONAL FINANCE APP</span>
            <span className="text-emerald-300 text-[10px]">⚡ Offline-First</span>
          </div>

          <div className="space-y-1.5 py-1">
            <div className="text-[10px] text-zinc-400">Auto-Parsed Bank SMS:</div>
            <div className="p-1.5 rounded bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-between text-xs">
              <span className="text-zinc-200">Swiggy Food Delivery</span>
              <span className="font-mono text-amber-400 font-bold">-₹640</span>
            </div>
            <div className="flex justify-between items-center text-[10px] text-zinc-400">
              <span>Monthly Dining Budget</span>
              <span className="text-zinc-200 font-mono font-bold">₹4,200 / ₹10,000</span>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[10px] font-mono text-zinc-400">
            <span>Works without internet</span>
            <span className="text-emerald-400 font-medium">Encrypted Cloud Backup</span>
          </div>
        </div>
      );

    /* -------------------------------------------------------------------------
       12. ReviewAssist AI — Google Reviews Engine
       ------------------------------------------------------------------------- */
    case 'reviewassist-ai':
      return (
        <div className={`${baseContainer} bg-zinc-900 text-white dark:bg-[#130E14]`}>
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-[11px] font-mono">
            <div className="flex items-center gap-1.5 text-pink-400 font-bold">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="text-[10px]">GOOGLE REPUTATION ENGINE</span>
            </div>
            <span className="text-zinc-400 text-[10px]">FTC Compliant</span>
          </div>

          <div className="space-y-1.5 py-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-300 font-medium">Guest: Priya Sharma</span>
              <span className="text-amber-400 text-xs">★★★★★</span>
            </div>
            <div className="p-2 rounded bg-zinc-800/80 border border-zinc-700/60 text-[11px] text-zinc-200 italic line-clamp-2">
              &ldquo;The paneer tikka was delicious and the hospitality was exceptional. Will definitely bring family again!&rdquo;
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[10px] font-mono text-zinc-400">
            <span className="text-pink-400 font-medium">1-Tap Google Post</span>
            <span className="text-emerald-400">+42% 5-Star Reviews</span>
          </div>
        </div>
      );

    /* -------------------------------------------------------------------------
       13. Jaya Mahal Palace — Luxury Hotel Booking
       ------------------------------------------------------------------------- */
    case 'jayamahal-palace':
      return (
        <div className={`${baseContainer} bg-[#16120D] text-white`}>
          <div className="flex items-center justify-between pb-2 border-b border-[#2E241B] text-[11px] font-mono">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <Hotel className="w-3.5 h-3.5" />
              <span className="text-[10px]">HERITAGE HOTEL SUITE</span>
            </div>
            <span className="text-amber-200/70 text-[10px]">Palace Grounds</span>
          </div>

          <div className="space-y-1.5 py-1">
            <div className="flex justify-between items-center">
              <div>
                <div className="text-xs font-serif font-bold text-amber-100">Royal Pavilion Suite #104</div>
                <div className="text-[10px] text-zinc-400">14 Nov – 16 Nov · 2 Nights (Breakfast)</div>
              </div>
              <div className="text-right font-mono font-bold text-amber-300 text-xs">
                ₹18,500<span className="text-[9px] text-zinc-400 font-normal">/nt</span>
              </div>
            </div>
            <div className="p-1.5 rounded bg-[#2A1F15] border border-[#3E2E20] flex items-center justify-between text-[10px]">
              <span className="text-amber-300">Room Held for 30 Mins</span>
              <span className="text-emerald-400 font-bold">Razorpay Verified</span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#2E241B] flex items-center justify-between text-[10px] font-mono text-zinc-400">
            <span>Zero Double Bookings</span>
            <span className="text-amber-400">Cinematic Guest Experience</span>
          </div>
        </div>
      );

    /* -------------------------------------------------------------------------
       14. YouTube Automation — Autonomous Video Production
       ------------------------------------------------------------------------- */
    case 'youtube-automation':
      return (
        <div className={`${baseContainer} bg-zinc-950 text-white dark:bg-[#120B0B]`}>
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-[11px]">
            <div className="flex items-center gap-1.5 text-red-400 font-bold">
              <Video className="w-3.5 h-3.5" />
              <span className="text-[10px]">AUTONOMOUS VIDEO ENGINE</span>
            </div>
            <span className="text-zinc-400 font-mono text-[10px]">7 Agents Chained</span>
          </div>

          <div className="space-y-1.5 py-1 text-xs">
            <div className="flex items-center justify-between p-1 rounded bg-zinc-900 border border-zinc-800">
              <span className="text-zinc-300 text-[11px]">Hook & Competitor Research</span>
              <span className="text-emerald-400 font-bold text-[10px]">COMPLETE</span>
            </div>
            <div className="flex items-center justify-between p-1 rounded bg-zinc-900 border border-zinc-800">
              <span className="text-zinc-300 text-[11px]">10-Min Script (1,840 Words)</span>
              <span className="text-emerald-400 font-bold text-[10px]">APPROVED</span>
            </div>
            <div className="flex items-center justify-between p-1 rounded bg-zinc-900 border border-zinc-800">
              <span className="text-zinc-300 text-[11px]">Voiceover (ElevenLabs Studio)</span>
              <span className="text-sky-400 font-bold text-[10px]">SYNTHESIZED</span>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[10px] font-mono text-zinc-400">
            <span>From idea to voiced video</span>
            <span className="text-red-400">10x Production Speed</span>
          </div>
        </div>
      );

    /* -------------------------------------------------------------------------
       15. WhatsApp SaaS Gateway — Direct Integration Toolkit
       ------------------------------------------------------------------------- */
    case 'whatsapp-saas-gateway':
      return (
        <div className={`${baseContainer} bg-zinc-900 text-white dark:bg-[#0A140F]`}>
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-[11px] font-mono">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="text-[10px]">WHATSAPP BUSINESS GATEWAY</span>
            </div>
            <span className="text-zinc-400 text-[10px]">Live Webhooks</span>
          </div>

          <div className="space-y-1.5 py-1">
            <div className="text-[10px] text-zinc-400">Automated Delivery Notification:</div>
            <div className="p-2 rounded bg-zinc-800/80 border border-zinc-700/60 text-[11px] text-zinc-200">
              <div className="font-bold text-white mb-0.5">Order #8421 Out for Delivery 🚚</div>
              <div className="text-[10px] text-zinc-400">Your package will arrive by 2:00 PM. Track live on our portal.</div>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[10px] font-mono text-zinc-400">
            <span className="text-emerald-400 font-bold">✔✔ Read by customer</span>
            <span>Zero manual messaging</span>
          </div>
        </div>
      );

    /* -------------------------------------------------------------------------
       16. Pooja Shekar — Product Designer Portfolio
       ------------------------------------------------------------------------- */
    case 'pooja-portfolio':
      return (
        <div className={`${baseContainer} bg-zinc-900 text-white dark:bg-[#121015]`}>
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-[11px] font-mono">
            <div className="flex items-center gap-1.5 text-pink-400 font-bold">
              <Layers className="w-3.5 h-3.5" />
              <span className="text-[10px]">PRODUCT DESIGN SYSTEM</span>
            </div>
            <span className="text-emerald-400 text-[10px] font-bold">100 Lighthouse</span>
          </div>

          <div className="space-y-1.5 py-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white">Fintech Checkout Redesign</div>
                <div className="text-[10px] text-zinc-400">Case Study · 32 Modular Design Components</div>
              </div>
              <span className="px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 font-bold text-[10px]">
                FEATURED
              </span>
            </div>
            <div className="p-1.5 rounded bg-zinc-800/80 border border-zinc-700/60 text-[10px] text-zinc-300">
              Measured Outcome: Cart abandonment reduced from 24% to 9%.
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[10px] font-mono text-zinc-400">
            <span>Statically Pre-Rendered</span>
            <span className="text-pink-400 font-medium">Bespoke Editorial Typography</span>
          </div>
        </div>
      );

    /* -------------------------------------------------------------------------
       Default: Production Application Preview
       ------------------------------------------------------------------------- */
    default:
      return (
        <div className={`${baseContainer} bg-zinc-900 text-white dark:bg-[#0E1015]`}>
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-[11px] font-mono">
            <span className="text-zinc-300 font-bold text-[10px]">CUSTOM PRODUCTION SOFTWARE</span>
            <span className="text-emerald-400 text-[10px]">LIVE PRODUCT</span>
          </div>

          <div className="space-y-2 py-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-200 font-medium">Reliable Cloud Architecture</span>
              <span className="text-emerald-400 font-bold text-[11px]">99.9% Uptime</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-200 font-medium">Data Storage & Security</span>
              <span className="text-sky-400 font-bold text-[11px]">Client-Owned DB</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-200 font-medium">Speed & User Experience</span>
              <span className="text-amber-400 font-bold text-[11px]">Instant Click Load</span>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[10px] font-mono text-zinc-400">
            <span>Ready for real customers</span>
            <span className="text-white font-medium">Fully Deployed</span>
          </div>
        </div>
      );
  }
}
