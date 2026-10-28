import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { getApprovedProjects } from '@/data/projects';
import { ExternalLink, ArrowUpRight, CheckCircle2, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Business Use Cases & Solutions · Why We Built It & What It Solved',
  description: 'Explore the high-stakes business problems solved by TysonLabs across restaurants, factories, clinics, creator commerce, and autonomous AI workflows.',
};

export default function UseCasesPage() {
  const projects = getApprovedProjects().filter((p) => p.businessUseCase !== undefined);

  return (
    <div className="max-w-6xl mx-auto px-6 sm:px-8 py-10 space-y-16">
      {/* Header */}
      <div className="space-y-4 max-w-3xl">
        <div className="text-xs uppercase tracking-wider font-semibold text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
          <span>Commercial Solutions & Impact Matrix</span>
        </div>
        <h1 className="font-display font-bold text-3xl sm:text-5xl text-zinc-950 dark:text-white tracking-tight [text-wrap:balance]">
          Why each product was built & the exact business problem it solved.
        </h1>
        <p className="text-base text-zinc-600 dark:text-[#94A3B8] leading-relaxed [text-wrap:pretty]">
          Software should never be built for its own sake or assemble generic templates. Every system below was created in response to real operational leaks, lost revenue, or broken workflows in production businesses.
        </p>
      </div>

      {/* Use Cases Matrix */}
      <div className="space-y-10">
        {projects.map((project, idx) => {
          const uc = project.businessUseCase!;
          const isLive = project.status === 'live';

          return (
            <article
              key={project.slug}
              className="p-6 sm:p-8 rounded-3xl bg-zinc-50 dark:bg-[#0F1116] border border-black/[0.08] dark:border-white/[0.08] hover:border-black/[0.18] dark:hover:border-white/[0.18] transition-all shadow-sm space-y-6"
            >
              {/* Header: Number, Industry, Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-black/[0.08] dark:border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-zinc-400 dark:text-zinc-500">
                    #{String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-white dark:bg-[#1A1D24] text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-white/10">
                    {uc.targetIndustry}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500' : 'bg-sky-500'}`}></span>
                  <span className="text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300">
                    {project.statusLabel}
                  </span>
                </div>
              </div>

              {/* Title & Tagline */}
              <div>
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-zinc-950 dark:text-white mb-2 [text-wrap:balance]">
                  <Link href={`/projects/${project.slug}`} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                    {project.name}
                  </Link>
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 [text-wrap:pretty]">
                  {project.tagline}
                </p>
              </div>

              {/* The Core Dual Breakdown: Why Built vs Problem Solved */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left: Why Built & The Frustration */}
                <div className="p-5 rounded-2xl bg-white dark:bg-[#14161C] border border-red-500/15 dark:border-red-500/20 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Why I Built This (The Bottleneck)</span>
                  </div>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed [text-wrap:pretty]">
                    {uc.whyBuilt}
                  </p>
                </div>

                {/* Right: What Was Engineered & Shipped */}
                <div className="p-5 rounded-2xl bg-white dark:bg-[#14161C] border border-emerald-500/15 dark:border-emerald-500/20 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>The Solution That Was Shipped</span>
                  </div>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed [text-wrap:pretty]">
                    {uc.problemSolved}
                  </p>
                </div>
              </div>

              {/* Business Impact Pills */}
              <div className="pt-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-3">
                  Measurable Business Impact:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {uc.businessImpact.map((impact, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 p-3.5 rounded-xl bg-white dark:bg-[#14161C] border border-zinc-200/80 dark:border-white/[0.06]"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 leading-snug">
                        {impact}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-black/[0.06] dark:border-white/[0.06] flex flex-wrap items-center justify-between gap-4 text-xs font-semibold">
                <Link
                  href={`/projects/${project.slug}`}
                  className="btn-tactile inline-flex items-center gap-1.5 text-zinc-800 dark:text-zinc-200 hover:text-black dark:hover:text-white font-mono"
                >
                  <span>Read full architectural monograph</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <div className="flex items-center gap-3">
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-tactile inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black font-bold dark:hover:bg-zinc-200 transition-colors shadow-sm active:scale-[0.98]"
                    >
                      <span>Launch Live Product</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <Link
                    href="/contact"
                    className="btn-tactile inline-flex items-center gap-1 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-white/10 hover:border-black dark:hover:border-white text-zinc-700 dark:text-zinc-300 font-mono active:scale-[0.98]"
                  >
                    <span>Commission Similar System</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* CTA Box */}
      <section className="p-8 sm:p-12 rounded-3xl bg-zinc-950 text-white dark:bg-[#14161C] border border-zinc-800 dark:border-white/[0.1] flex flex-col md:flex-row items-start md:items-center justify-between gap-8 shadow-2xl">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Have an Operational Problem in Your Business?</span>
          </div>
          <h2 className="font-display font-bold text-2xl sm:text-4xl text-white [text-wrap:balance]">
            Let&apos;s build software that solves it.
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed [text-wrap:pretty]">
            Whether it&apos;s a high-throughput billing till, custom manufacturing ERP, or automated workflow agent, we deliver production-ready software in 2 to 4 weeks with 100% sovereign code ownership.
          </p>
        </div>
        <Link
          href="/contact"
          className="btn-tactile inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-black hover:bg-zinc-200 font-bold text-sm shadow-xl active:scale-[0.98] whitespace-nowrap"
        >
          <span>Schedule an Architecture Call</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
