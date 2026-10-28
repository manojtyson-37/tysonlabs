'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowUpRight, 
  ExternalLink, 
  Check
} from 'lucide-react';

type SneakPeekIndustry = 'restaurant' | 'garment' | 'healthcare' | 'creator' | 'ai';

interface SneakPeekItem {
  id: SneakPeekIndustry;
  industryLabel: string;
  badge: string;
  projectName: string;
  projectSlug: string;
  liveUrl?: string;
  theProblem: string;
  theSolution: string;
  businessImpact: { label: string; value: string }[];
}

export function ProjectsSneakPeekShowcase() {
  const [activeTab, setActiveTab] = useState<SneakPeekIndustry>('restaurant');
  const [interactiveAction, setInteractiveAction] = useState<string | null>(null);

  const industries: SneakPeekItem[] = [
    {
      id: 'restaurant',
      industryLabel: 'DinePulse (Restaurant POS)',
      badge: 'Live Production Till',
      projectName: 'DinePulse · Restaurant & Hospitality OS',
      projectSlug: 'dinepulse',
      liveUrl: 'https://dineplus.vercel.app/pos',
      theProblem: 'Busy restaurants lose revenue when legacy POS systems lag during dinner rushes, take 8+ clicks to punch a bill, and leave kitchen cooks out of sync with floor servers.',
      theSolution: 'An ultra-fast 3-click touch billing till with instant table switching, live kitchen order tickets (KOT), FSSAI veg/non-veg compliance tags, dynamic UPI QR payment, and automated WhatsApp guest receipts.',
      businessImpact: [
        { label: 'Till Speed', value: '3 Clicks to Bill' },
        { label: 'Kitchen Sync', value: 'Real-Time KOT' },
        { label: 'Guest Delight', value: 'WhatsApp Bills' },
      ],
    },
    {
      id: 'garment',
      industryLabel: 'Silaa (Garment ERP)',
      badge: 'Live Factory ERP',
      projectName: 'Silaa Atelier · Garment Manufacturing ERP',
      projectSlug: 'silaa-atelier',
      liveUrl: 'https://erp.silacollective.in/',
      theProblem: 'Garment factories lose up to 12% of expensive fabric rolls to manual marker errors and untracked remnants spread across messy WhatsApp group chats.',
      theSolution: 'A modern production ERP that tracks fabric roll batches by dye lot, calculates cutting yields down to the millimetre, manages trims & buttons BOM, and monitors 500-garment stitching runs.',
      businessImpact: [
        { label: 'Fabric Yield', value: '99.2% Utilization' },
        { label: 'Inventory Leakage', value: 'Zero Lost Rolls' },
        { label: 'Order Visibility', value: '5-Stage Kanban' },
      ],
    },
    {
      id: 'healthcare',
      industryLabel: 'PhysioCare (Clinic OS)',
      badge: 'Live Clinic System',
      projectName: 'PhysioCare · Multi-Tenant Clinic OS',
      projectSlug: 'physiocare',
      liveUrl: 'https://saas-physio.vercel.app',
      theProblem: 'Physical therapy practices juggle paper cards, Google Calendars, and separate billing tools, resulting in double bookings and unbilled multi-session rehab packages.',
      theSolution: 'An all-in-one clinic platform designed specifically for therapists: drag-and-drop room scheduling, patient mobility angle tracking (e.g. 115° knee recovery), automated GST invoices, and WhatsApp reminders.',
      businessImpact: [
        { label: 'Double Bookings', value: 'Zero Scheduling Clashes' },
        { label: 'Patient Retention', value: '+35% Re-Attendance' },
        { label: 'Billing Speed', value: '1-Click GST Receipt' },
      ],
    },
    {
      id: 'creator',
      industryLabel: 'Tysonpe (Fintech)',
      badge: 'Active Fintech System',
      projectName: 'Tysonpe · Creator Storefront & Checkout',
      projectSlug: 'tysonpe',
      theProblem: 'Indian educators and creators lose 30% of their revenue to platform fees, while global checkout tools fail to support Indian UPI apps or automated Indian GST tax compliance.',
      theSolution: 'A high-converting creator storefront with 1-click UPI payments (Google Pay, PhonePe, Paytm), instant digital video masterclass access, automated GST invoices, and dynamic watermarked video protection.',
      businessImpact: [
        { label: 'Platform Cut', value: '0% Middleman Take' },
        { label: 'Payment Speed', value: '1-Click UPI Intent' },
        { label: 'Tax Compliance', value: 'Automated GST PDFs' },
      ],
    },
    {
      id: 'ai',
      industryLabel: 'Tyson Chess (AI Academy)',
      badge: 'Live Web Platform',
      projectName: 'Tyson Chess · Interactive AI Chess Coach',
      projectSlug: 'tysonchess',
      liveUrl: 'https://tysonchess-two.vercel.app',
      theProblem: 'Chess.com locks daily tactics practice behind an aggressive paywall: solving more than 3 puzzles a day requires paying ₹99 per week (₹5,000+ per year), while game reviews spit out cryptic numeric evaluations.',
      theSolution: 'I built this because I used to play on chess.com app and solving more than 3 puzzles a day required ₹99/week. So I thought why not build it myself? Tyson Chess runs 100% free in the browser with unlimited puzzles, 6 sparring bots, and a coach that explains moves in plain English.',
      businessImpact: [
        { label: 'Puzzle Paywall', value: '100% Free & Unlimited' },
        { label: 'Weekly Savings', value: 'Saves ₹99 / Week' },
        { label: 'Tactical Coach', value: 'Plain English Advice' },
      ],
    },
  ];

  const current = industries.find((i) => i.id === activeTab) || industries[0];

  const triggerAction = (msg: string) => {
    setInteractiveAction(msg);
    setTimeout(() => setInteractiveAction(null), 3000);
  };

  return (
    <section className="max-w-7xl mx-auto px-6 sm:px-8 py-8 space-y-8">
      {/* Editorial Header */}
      <div className="space-y-3 max-w-2xl">
        <div className="text-xs font-mono uppercase tracking-wider text-zinc-500">
          01 / Selected Systems & Case Studies
        </div>
        <h2 className="font-display font-semibold text-3xl sm:text-4xl text-zinc-950 dark:text-white tracking-tight [text-wrap:balance]">
          Software engineered for real operators.
        </h2>
        <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed [text-wrap:pretty]">
          Explore production software solving concrete operational bottlenecks across five distinct industries.
        </p>
      </div>

      {/* Minimalist Text Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {industries.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActiveTab(item.id);
                setInteractiveAction(null);
              }}
              className={`btn-tactile px-4 py-2 rounded-xl text-xs font-mono font-medium whitespace-nowrap transition-all duration-200 active:scale-[0.98] ${
                isActive
                  ? 'bg-black text-white dark:bg-white dark:text-black font-semibold shadow-xs'
                  : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200/80 dark:border-zinc-800 hover:text-black dark:hover:text-white'
              }`}
            >
              {item.industryLabel}
            </button>
          );
        })}
      </div>

      {/* Expanded Showcase Card */}
      <div className="bg-white dark:bg-[#121318] border border-zinc-200/90 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-sm transition-all">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Business Problem & Shipped Solution (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                {current.badge}
              </span>
            </div>

            <div>
              <h3 className="font-display font-semibold text-2xl sm:text-3xl text-zinc-950 dark:text-white [text-wrap:balance]">
                {current.projectName}
              </h3>
            </div>

            {/* Problem vs Solution Split — Clean Architectural Cards */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 space-y-1.5">
                <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-400 block">
                  The Operational Bottleneck
                </span>
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed [text-wrap:pretty]">
                  {current.theProblem}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 space-y-1.5">
                <span className="text-[11px] font-mono uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-400 block">
                  What I Engineered & Shipped
                </span>
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed [text-wrap:pretty]">
                  {current.theSolution}
                </p>
              </div>
            </div>

            {/* Business Impact Metrics */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              {current.businessImpact.map((metric, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/70 dark:border-zinc-800 text-center">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-tight mb-0.5">
                    {metric.label}
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white font-mono">
                    {metric.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Direct Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono">
              {current.liveUrl && (
                <a
                  href={current.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-tactile inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-semibold transition-all active:scale-[0.98]"
                >
                  <span>Launch Live System</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              <Link
                href={`/projects/${current.projectSlug}`}
                className="btn-tactile inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:border-black dark:hover:border-white text-zinc-800 dark:text-zinc-200 font-semibold transition-all active:scale-[0.98]"
              >
                <span>Read Case Study</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Column: Clean Product Interface Preview (6 cols) */}
          <div className="lg:col-span-6 w-full">
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-950 text-white p-5 shadow-lg relative overflow-hidden font-sans">
              
              {/* Interactive notification banner */}
              {interactiveAction && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-white text-black px-4 py-1.5 rounded-full text-xs font-mono font-semibold shadow-lg flex items-center gap-2 border border-zinc-300 animate-in fade-in zoom-in-95 duration-200">
                  <Check className="w-3.5 h-3.5" />
                  <span>{interactiveAction}</span>
                </div>
              )}

              {/* Dynamic Preview Visuals per Industry */}
              {activeTab === 'restaurant' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800 text-xs font-mono">
                    <span className="text-zinc-200 font-medium">DinePulse · Restaurant Till</span>
                    <span className="text-zinc-500">Table #04 (AC Dining)</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center p-2.5 rounded bg-zinc-900 border border-zinc-800">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-[2px] border border-zinc-500 flex items-center justify-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-300"></span>
                        </span>
                        <span className="font-medium text-zinc-200">Paneer Butter Masala</span>
                      </div>
                      <span className="font-mono text-zinc-200">₹280</span>
                    </div>

                    <div className="flex justify-between items-center p-2.5 rounded bg-zinc-900 border border-zinc-800">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-[2px] border border-zinc-500 flex items-center justify-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-300"></span>
                        </span>
                        <span className="font-medium text-zinc-200">Butter Garlic Naan ×2</span>
                      </div>
                      <span className="font-mono text-zinc-200">₹120</span>
                    </div>

                    <div className="flex justify-between items-center p-2.5 rounded bg-zinc-900 border border-zinc-800">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-[2px] border border-zinc-500 flex items-center justify-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-300"></span>
                        </span>
                        <span className="font-medium text-zinc-200">Fresh Mint Lime Soda ×2</span>
                      </div>
                      <span className="font-mono text-zinc-200">₹80</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-800 flex justify-between items-center text-xs font-mono">
                    <span className="text-zinc-400">Total (with 5% GST):</span>
                    <span className="text-base font-bold text-white">₹504</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
                    <button
                      type="button"
                      onClick={() => triggerAction('Kitchen Ticket (KOT) Printed & Sent to Chef!')}
                      className="btn-tactile p-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-medium border border-zinc-700 active:scale-[0.98]"
                    >
                      Fire KOT to Kitchen
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerAction('₹504 Settled via UPI QR & WhatsApp Bill Dispatched!')}
                      className="btn-tactile p-2.5 rounded-lg bg-white text-black hover:bg-zinc-200 font-semibold active:scale-[0.98]"
                    >
                      Settle ₹504 via UPI QR
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'garment' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800 text-xs font-mono">
                    <span className="text-zinc-200 font-medium">Silaa · Garment Factory ERP</span>
                    <span className="text-zinc-500">Batch #842 · 500 Shirts</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded bg-zinc-900 border border-zinc-800 space-y-2">
                      <div className="flex justify-between text-zinc-300">
                        <span>Fabric Lot: Turkish Flax Linen</span>
                        <span className="font-mono text-white font-semibold">99.2% Yield</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                        <div className="h-full bg-zinc-200 w-[92%]"></div>
                      </div>
                      <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
                        <span>Fabric Saved: 1.8m/roll</span>
                        <span className="text-zinc-200">₹1,620 Saved / Roll</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Active Stage:</span>
                      <span className="font-medium text-white font-mono">Sewing & Stitching (68%)</span>
                    </div>
                  </div>

                  <div className="pt-2 font-mono text-xs">
                    <button
                      type="button"
                      onClick={() => triggerAction('Marker DXF Exported & Sent to CNC Cutting Table!')}
                      className="btn-tactile w-full p-2.5 rounded-lg bg-white text-black hover:bg-zinc-200 font-semibold active:scale-[0.98]"
                    >
                      Export CNC Cutting Marker (DXF)
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'healthcare' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800 text-xs font-mono">
                    <span className="text-zinc-200 font-medium">PhysioCare · Clinic Portal</span>
                    <span className="text-zinc-500">Dr. Sarah Rao · Room #02</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded bg-zinc-900 border border-zinc-800 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-white">Rahul Verma (34 M)</span>
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px] font-mono">CONFIRMED</span>
                      </div>
                      <div className="text-[11px] text-zinc-400">Post-Op ACL Rehab · Visit 4 of 12</div>
                      <div className="pt-1 flex justify-between items-center text-[11px] font-mono">
                        <span className="text-zinc-400">Knee Flexion Angle:</span>
                        <span className="text-white font-semibold">115° (+15° gain)</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs font-mono">
                      <span className="text-zinc-400">WhatsApp Reminder:</span>
                      <span className="text-zinc-200">Delivered (10:14 AM)</span>
                    </div>
                  </div>

                  <div className="pt-2 font-mono text-xs">
                    <button
                      type="button"
                      onClick={() => triggerAction('Visit Completed! Exercise Video Chart Sent via WhatsApp!')}
                      className="btn-tactile w-full p-2.5 rounded-lg bg-white text-black hover:bg-zinc-200 font-semibold active:scale-[0.98]"
                    >
                      Complete Visit & Send WhatsApp Chart
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'creator' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800 text-xs font-mono">
                    <span className="text-zinc-200 font-medium">Tysonpe · Creator Checkout</span>
                    <span className="text-zinc-500">UPI Intent Ready</span>
                  </div>

                  <div className="p-3 rounded bg-zinc-900 border border-zinc-800 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-white text-xs">Full-Stack Architecture Masterclass</div>
                        <div className="text-[10px] text-zinc-400">Lifetime Access · 24 HD Videos + Codebases</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-sm text-white">₹2,499</div>
                        <div className="text-[9px] text-zinc-500 font-mono">GST Invoice Included</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1 text-[10px] font-mono">
                      <span className="text-zinc-500">Supported:</span>
                      <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">Google Pay</span>
                      <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">PhonePe</span>
                      <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">Paytm</span>
                    </div>
                  </div>

                  <div className="pt-1 font-mono text-xs">
                    <button
                      type="button"
                      onClick={() => triggerAction('₹2,499 Paid! Digital Masterclass Unlocked & GST Tax Bill Sent!')}
                      className="btn-tactile w-full p-2.5 rounded-lg bg-white text-black hover:bg-zinc-200 font-semibold active:scale-[0.98]"
                    >
                      Test 1-Click UPI Payment (₹2,499)
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'ai' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800 text-xs font-mono">
                    <span className="text-zinc-200 font-medium">Tyson Chess · Engine Coach</span>
                    <span className="text-zinc-400 font-mono">+1.84 Advantage</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="grid grid-cols-4 grid-rows-4 w-24 h-24 rounded border border-zinc-800 overflow-hidden shrink-0 shadow-inner">
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

                    <div className="flex-1 space-y-1.5 text-xs">
                      <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800">
                        <span className="text-[10px] uppercase font-mono text-zinc-400 block mb-0.5">
                          Plain-English Coach Advice:
                        </span>
                        <p className="text-zinc-300 text-[11px] leading-snug">
                          &ldquo;Moving your Knight to d5 forks opponent&apos;s Queen and Bishop. White wins decisive material.&rdquo;
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-1 font-mono text-xs">
                    <button
                      type="button"
                      onClick={() => triggerAction('Move 24. Nd5 Played! AI Advantage Updated to +2.4 (Winning)!')}
                      className="btn-tactile w-full p-2.5 rounded-lg bg-white text-black hover:bg-zinc-200 font-semibold active:scale-[0.98]"
                    >
                      Play Knight to d5 (Test Move)
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                <span>Production Interface Preview</span>
                <span>Click buttons to test</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
