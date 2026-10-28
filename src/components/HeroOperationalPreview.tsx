'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, ExternalLink } from 'lucide-react';

export function HeroOperationalPreview() {
  const systems = [
    {
      name: 'DinePulse POS',
      role: 'Restaurant & Hospitality Till',
      metric: '3-click bill · KOT dispatch',
      liveUrl: 'https://dineplus.vercel.app/pos',
      slug: 'dinepulse',
      status: 'Live in Production',
    },
    {
      name: 'Silaa Atelier ERP',
      role: 'Apparel Factory Marker Engine',
      metric: '99.2% fabric yield yield',
      liveUrl: 'https://erp.silacollective.in/',
      slug: 'silaa-atelier',
      status: 'Live Factory System',
    },
    {
      name: 'Tyson Chess',
      role: 'Stockfish 18 WASM AI Academy',
      metric: 'Unlimited puzzles · 0 paywall',
      liveUrl: 'https://tysonchess-two.vercel.app',
      slug: 'tysonchess',
      status: 'Live Web Platform',
    },
    {
      name: 'Tysonpe Checkout',
      role: 'Creator Commerce & Invoicing',
      metric: '1-click UPI · 0% fee',
      slug: 'tysonpe',
      status: 'Fintech System',
    },
  ];

  return (
    <div className="w-full rounded-2xl bg-zinc-50 dark:bg-[#111216] border border-zinc-200/90 dark:border-zinc-800 p-6 sm:p-7 space-y-6 shadow-sm font-sans transition-all">
      {/* Header Badge */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200/80 dark:border-zinc-800 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-zinc-900 dark:text-zinc-200 font-semibold tracking-wider uppercase">
            Engineer Profile & Systems
          </span>
        </div>
        <span className="text-zinc-500 text-[11px]">Bangalore, IN</span>
      </div>

      {/* Engineer Status Narrative */}
      <div className="space-y-2">
        <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
          Current Availability
        </div>
        <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-normal">
          Available for contract software engineering, full-stack systems architecture, and custom operating software for high-growth businesses.
        </p>
      </div>

      {/* Technical Specializations */}
      <div className="space-y-2">
        <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
          Core Technical Stack
        </div>
        <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
          {['Next.js 15', 'TypeScript', 'Node.js', 'Go', 'PostgreSQL', 'WebAssembly', 'Tailwind CSS'].map((tech) => (
            <span
              key={tech}
              className="px-2.5 py-1 rounded-md bg-white dark:bg-[#181920] text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-800/80"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Production Systems List */}
      <div className="space-y-2.5 pt-1">
        <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
          Featured Production Builds
        </div>
        <div className="divide-y divide-zinc-200/70 dark:divide-zinc-800/70 border-y border-zinc-200/70 dark:border-zinc-800/70">
          {systems.map((sys) => (
            <div key={sys.name} className="py-2.5 flex items-center justify-between gap-3 text-xs">
              <div className="min-w-0">
                <Link
                  href={`/projects/${sys.slug}`}
                  className="font-medium text-zinc-950 dark:text-white hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors block truncate"
                >
                  {sys.name}
                </Link>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                  {sys.role} · {sys.metric}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {sys.liveUrl && (
                  <a
                    href={sys.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors"
                    title={`Launch ${sys.name}`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <Link
                  href={`/projects/${sys.slug}`}
                  className="p-1 text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white transition-colors"
                  title="View Case Study"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Inquiries CTA */}
      <div className="pt-2 flex items-center justify-between text-xs font-mono">
        <Link
          href="/contact"
          className="btn-tactile inline-flex items-center gap-1.5 text-zinc-900 dark:text-white hover:text-zinc-600 dark:hover:text-zinc-300 font-semibold transition-colors"
        >
          <span>Schedule technical scoping</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
        <span className="text-zinc-400 text-[11px]">Direct with Manoj</span>
      </div>
    </div>
  );
}
