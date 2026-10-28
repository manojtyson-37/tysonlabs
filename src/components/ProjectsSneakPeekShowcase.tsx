'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowUpRight, 
  ExternalLink, 
  UtensilsCrossed, 
  Scissors, 
  Stethoscope, 
  CreditCard, 
  Bot,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

type SneakPeekIndustry = 'restaurant' | 'garment' | 'healthcare' | 'creator' | 'ai';

interface SneakPeekItem {
  id: SneakPeekIndustry;
  icon: React.ComponentType<{ className?: string }>;
  industryTitle: string;
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
      icon: UtensilsCrossed,
      industryTitle: 'Restaurants & Hospitality',
      badge: 'Live Production Till',
      projectName: 'DinePulse · Restaurant & Hospitality OS',
      projectSlug: 'dinepulse',
      liveUrl: 'https://dineplus.vercel.app/pos',
      theProblem: 'Busy restaurants lose money when legacy POS machines lag during dinner rushes, require 8+ clicks per ticket, and leave kitchen cooks out of sync with waiters.',
      theSolution: 'An ultra-fast 3-click touch till with instant table switching, live kitchen order displays (KDS), Indian FSSAI veg/non-veg tags, UPI dynamic QR codes, and automated WhatsApp guest bills.',
      businessImpact: [
        { label: 'Till Speed', value: '3 Clicks to Bill' },
        { label: 'Kitchen Sync', value: 'Real-Time KOT' },
        { label: 'Guest Delight', value: 'WhatsApp Bills' },
      ],
    },
    {
      id: 'garment',
      icon: Scissors,
      industryTitle: 'Apparel & Factories',
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
      icon: Stethoscope,
      industryTitle: 'Clinics & Healthcare',
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
      icon: CreditCard,
      industryTitle: 'Creator Commerce & Checkout',
      badge: 'Active Fintech System',
      projectName: 'Tysonpe · Creator Storefront & Checkout',
      projectSlug: 'tysonpe',
      theProblem: 'Educators and creators lose 30% of their revenue to platform fees, while global checkout tools fail to support Indian UPI apps or automated Indian GST tax compliance.',
      theSolution: 'A high-converting creator storefront with 1-click UPI payments (Google Pay, PhonePe, Paytm), instant digital video masterclass access, automated GST invoices, and dynamic watermarked video protection.',
      businessImpact: [
        { label: 'Platform Cut', value: '0% Middleman Take' },
        { label: 'Payment Speed', value: '1-Click UPI Intent' },
        { label: 'Tax Compliance', value: 'Automated GST PDFs' },
      ],
    },
    {
      id: 'ai',
      icon: Bot,
      industryTitle: 'Interactive AI & Games',
      badge: 'Live Web Platform',
      projectName: 'Tyson Chess · Interactive AI Chess Coach',
      projectSlug: 'tysonchess',
      liveUrl: 'https://tysonchess-two.vercel.app',
      theProblem: 'Amateur chess players are overwhelmed by confusing computer evaluation scores (+1.84) that fail to explain the human reason behind why a move lost or won.',
      theSolution: 'An in-browser chess academy that speaks plain conversational English: "Moving your Knight to d5 forks the Queen and Bishop", with 6 calibrated AI sparring bots and automatic mistake puzzle drills.',
      businessImpact: [
        { label: 'Learning Curve', value: 'Plain English Advice' },
        { label: 'Server Cost', value: '$0/mo In-Browser AI' },
        { label: 'Latency', value: 'Zero Loading Screens' },
      ],
    },
  ];

  const current = industries.find((i) => i.id === activeTab) || industries[0];

  const triggerAction = (msg: string) => {
    setInteractiveAction(msg);
    setTimeout(() => setInteractiveAction(null), 3000);
  };

  return (
    <section className="max-w-7xl mx-auto px-6 sm:px-8 py-8">
      {/* Header */}
      <div className="mb-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-mono font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>SNEAK PEEK INTO 16 SHIPPED SYSTEMS</span>
        </div>
        <h2 className="font-display font-bold text-3xl sm:text-4xl text-zinc-950 dark:text-white [text-wrap:balance]">
          Real software built for real businesses.
        </h2>
        <p className="text-base text-zinc-600 dark:text-zinc-400 max-w-3xl leading-relaxed [text-wrap:pretty]">
          Instead of empty slides or conceptual prototypes, take an interactive look at real applications solving operational bottlenecks across five distinct industries.
        </p>
      </div>

      {/* Industry Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
        {industries.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActiveTab(item.id);
                setInteractiveAction(null);
              }}
              className={`btn-tactile inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 active:scale-[0.98] ${
                isActive
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-md'
                  : 'bg-zinc-100 dark:bg-[#181818] text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-white/[0.08] hover:text-black dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.industryTitle}</span>
            </button>
          );
        })}
      </div>

      {/* Expanded Showcase Card */}
      <div className="bg-white dark:bg-[#14161C] border border-zinc-200/90 dark:border-white/[0.1] rounded-3xl p-6 sm:p-8 shadow-xl dark:shadow-2xl transition-all">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Business Problem & Shipped Solution (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                {current.badge}
              </span>
            </div>

            <div>
              <h3 className="font-display font-bold text-2xl sm:text-3xl text-zinc-950 dark:text-white mb-2 [text-wrap:balance]">
                {current.projectName}
              </h3>
            </div>

            {/* Problem vs Solution Split */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-red-50/60 dark:bg-red-950/20 border border-red-200/70 dark:border-red-900/40 text-xs sm:text-sm">
                <span className="font-bold text-red-900 dark:text-red-300 block mb-1">
                  The Business Bottleneck:
                </span>
                <p className="text-red-950/80 dark:text-red-200/80 leading-relaxed">
                  {current.theProblem}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/40 text-xs sm:text-sm">
                <span className="font-bold text-emerald-900 dark:text-emerald-300 block mb-1">
                  What I Engineered & Shipped:
                </span>
                <p className="text-emerald-950/80 dark:text-emerald-200/80 leading-relaxed">
                  {current.theSolution}
                </p>
              </div>
            </div>

            {/* Business Impact Metrics */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {current.businessImpact.map((metric, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-white/[0.06] text-center">
                  <div className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-tight mb-0.5">
                    {metric.label}
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white">
                    {metric.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Direct Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {current.liveUrl && (
                <a
                  href={current.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-tactile inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all shadow-md active:scale-[0.98]"
                >
                  <span>Launch Live System</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              <Link
                href={`/projects/${current.projectSlug}`}
                className="btn-tactile inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:border-black dark:hover:border-white text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-all active:scale-[0.98]"
              >
                <span>Full Architecture Monograph</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Column: Live Interactive Sneak Peek Mockup (6 cols) */}
          <div className="lg:col-span-6 w-full">
            <div className="rounded-2xl border border-zinc-200 dark:border-white/[0.1] bg-zinc-900 text-white p-5 shadow-2xl relative overflow-hidden font-sans">
              
              {/* Interactive notification banner */}
              {interactiveAction && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-emerald-500 text-black px-4 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 animate-bounce">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{interactiveAction}</span>
                </div>
              )}

              {/* Dynamic Sneak Peek Visuals per Industry */}
              {activeTab === 'restaurant' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800 text-xs font-mono">
                    <span className="text-emerald-400 font-bold">DINEPULSE RESTAURANT TILL</span>
                    <span className="text-zinc-400">Table #04 (AC Dining)</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center p-2 rounded bg-zinc-800/80 border border-zinc-700/60">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-[2px] border border-emerald-500 flex items-center justify-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        </span>
                        <span className="font-medium text-white">Paneer Butter Masala (Full)</span>
                      </div>
                      <span className="font-mono text-zinc-200 font-bold">₹280</span>
                    </div>

                    <div className="flex justify-between items-center p-2 rounded bg-zinc-800/80 border border-zinc-700/60">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-[2px] border border-emerald-500 flex items-center justify-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        </span>
                        <span className="font-medium text-white">Butter Garlic Naan ×2</span>
                      </div>
                      <span className="font-mono text-zinc-200 font-bold">₹120</span>
                    </div>

                    <div className="flex justify-between items-center p-2 rounded bg-zinc-800/80 border border-zinc-700/60">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-[2px] border border-emerald-500 flex items-center justify-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        </span>
                        <span className="font-medium text-white">Fresh Mint Lime Soda ×2</span>
                      </div>
                      <span className="font-mono text-zinc-200 font-bold">₹80</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-800 flex justify-between items-center text-xs font-mono">
                    <span className="text-zinc-400">Total with 5% GST:</span>
                    <span className="text-base font-bold text-emerald-400">₹504</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => triggerAction('Kitchen Ticket (KOT) Printed & Sent to Chef!')}
                      className="btn-tactile p-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs border border-zinc-700 active:scale-[0.98]"
                    >
                      Fire KOT to Kitchen
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerAction('₹504 Settled via UPI QR & WhatsApp Bill Dispatched!')}
                      className="btn-tactile p-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-md active:scale-[0.98]"
                    >
                      Settle ₹504 via UPI QR
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'garment' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800 text-xs font-mono">
                    <span className="text-purple-400 font-bold">SILAA APPAREL PRODUCTION ERP</span>
                    <span className="text-zinc-400">Batch #842 · 500 Linen Shirts</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded bg-zinc-800/80 border border-zinc-700/60 space-y-2">
                      <div className="flex justify-between text-zinc-300">
                        <span>Fabric Lot: Turkish Flax Linen</span>
                        <span className="font-mono text-emerald-400 font-bold">99.2% Cutting Yield</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-zinc-700 overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[92%]"></div>
                      </div>
                      <div className="flex justify-between text-[11px] text-zinc-400">
                        <span>Fabric Saved: 1.8 meters/roll</span>
                        <span className="text-emerald-400 font-bold">₹1,620 Saved / Roll</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-between text-xs">
                      <span className="text-zinc-300">Active Stage:</span>
                      <span className="font-bold text-purple-400">Sewing & Collar Stitching (68%)</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => triggerAction('Marker DXF Exported & Sent to CNC Cutting Table!')}
                      className="btn-tactile w-full p-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md active:scale-[0.98]"
                    >
                      Export CNC Cutting Marker (DXF)
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'healthcare' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800 text-xs font-mono">
                    <span className="text-sky-400 font-bold">PHYSIOCARE PATIENT PORTAL</span>
                    <span className="text-zinc-400">Dr. Sarah Rao · Room #02</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded bg-zinc-800/80 border border-zinc-700/60 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white">Rahul Verma (34 M)</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">CONFIRMED</span>
                      </div>
                      <div className="text-[11px] text-zinc-400">Post-Op ACL Reconstruction · Visit 4 of 12</div>
                      <div className="pt-1 flex justify-between items-center text-[11px]">
                        <span className="text-zinc-300">Knee Flexion Angle:</span>
                        <span className="font-mono font-bold text-sky-400">115° (+15° recovery gain)</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-between text-xs">
                      <span className="text-zinc-300">Automated WhatsApp Reminder:</span>
                      <span className="text-emerald-400 font-bold">Delivered (10:14 AM)</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => triggerAction('Visit Completed! Exercise Video Chart Sent via WhatsApp!')}
                      className="btn-tactile w-full p-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md active:scale-[0.98]"
                    >
                      Complete Visit & Send WhatsApp Exercise Chart
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'creator' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800 text-xs font-mono">
                    <span className="text-emerald-400 font-bold">TYSONPE 1-CLICK CREATOR CHECKOUT</span>
                    <span className="text-zinc-400">Razorpay Verified</span>
                  </div>

                  <div className="p-3 rounded bg-zinc-800/80 border border-zinc-700/60 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-white text-xs">Full-Stack Software Architecture Masterclass</div>
                        <div className="text-[10px] text-zinc-400">Lifetime Access · 24 HD Videos + GitHub Codebases</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-sm text-emerald-400">₹2,499</div>
                        <div className="text-[9px] text-zinc-400">GST Invoice Included</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pt-1 text-[10px] font-mono">
                      <span className="text-zinc-400">Supported:</span>
                      <span className="px-1.5 py-0.5 rounded bg-zinc-700 text-white font-bold">Google Pay</span>
                      <span className="px-1.5 py-0.5 rounded bg-zinc-700 text-white font-bold">PhonePe</span>
                      <span className="px-1.5 py-0.5 rounded bg-zinc-700 text-white font-bold">Paytm</span>
                    </div>
                  </div>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => triggerAction('₹2,499 Paid! Digital Masterclass Unlocked & GST Tax Bill Sent!')}
                      className="btn-tactile w-full p-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-md active:scale-[0.98]"
                    >
                      Test 1-Click UPI Payment (₹2,499)
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'ai' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800 text-xs font-mono">
                    <span className="text-amber-400 font-bold">TYSON CHESS · AI COACH</span>
                    <span className="text-emerald-400 font-bold">+1.84 Advantage</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="grid grid-cols-4 grid-rows-4 w-24 h-24 rounded border border-zinc-700 overflow-hidden shrink-0 shadow-inner">
                      {['♜', '♞', '♝', '♛', '♟', '♟', '♟', '♟', ' ', ' ', '♘', ' ', '♙', '♙', '♙', '♔'].map((piece, i) => {
                        const isDark = (Math.floor(i / 4) + (i % 4)) % 2 === 1;
                        return (
                          <div
                            key={i}
                            className={`flex items-center justify-center text-xs font-serif ${
                              isDark ? 'bg-amber-900/60 text-zinc-200' : 'bg-amber-100/20 text-white'
                            }`}
                          >
                            {piece}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex-1 space-y-1.5 text-xs">
                      <div className="p-2 rounded bg-zinc-800/80 border border-zinc-700/60">
                        <span className="text-[10px] uppercase font-mono font-bold text-amber-400 block mb-0.5">
                          Plain-English Coach Advice:
                        </span>
                        <p className="text-zinc-200 text-[11px] leading-snug">
                          &ldquo;Moving your Knight to d5 forks opponent&apos;s Queen and Bishop. White wins decisive material.&rdquo;
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => triggerAction('Move 24. Nd5 Played! AI Advantage Updated to +2.4 (Winning)!')}
                      className="btn-tactile w-full p-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md active:scale-[0.98]"
                    >
                      Play Knight to d5 (Test Live AI Move)
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                <span>100% Tested Production Interface</span>
                <span className="text-emerald-400 font-medium">Click to test interaction</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
