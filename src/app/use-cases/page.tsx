import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { getApprovedProjects } from '@/data/projects';
import { ExternalLink, ArrowUpRight, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Case Studies & Business Impact · Manoj Tyson',
  description: 'Why each system was built, the operational bottleneck it addressed, and the business impact delivered across restaurants, manufacturing, clinics, and fintech.',
};

export default function UseCasesPage() {
  const projects = getApprovedProjects().filter((p) => p.businessUseCase !== undefined);

  return (
    <div className="max-w-5xl mx-auto px-6 sm:px-8 py-12 space-y-16">
      {/* Editorial Header */}
      <div className="space-y-4 max-w-2xl">
        <div className="text-xs uppercase tracking-wider font-mono text-zinc-500">
          Case Studies & Problem Breakdown
        </div>
        <h1 className="font-display font-semibold text-3xl sm:text-5xl text-zinc-950 dark:text-white tracking-tight leading-[1.1] [text-wrap:balance]">
          Why each product was built and what it solved.
        </h1>
        <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed [text-wrap:pretty]">
          Software should never be built for its own sake or assembled from generic templates. Every system below was built in response to concrete operational leaks, lost revenue, or broken workflows in real businesses.
        </p>
      </div>

      {/* Case Studies Matrix */}
      <div className="space-y-12">
        {projects.map((project, idx) => {
          const uc = project.businessUseCase!;
          const isLive = project.status === 'live';

          return (
            <article
              key={project.slug}
              className="p-6 sm:p-8 rounded-2xl bg-zinc-50/70 dark:bg-[#111216] border border-zinc-200/90 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all space-y-6"
            >
              {/* Header: Number, Industry, Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200/80 dark:border-zinc-800 text-xs font-mono">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-200">
                    #{String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="text-zinc-300 dark:text-zinc-700">/</span>
                  <span className="uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                    {uc.targetIndustry}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-zinc-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider">
                    {isLive ? 'Live in Production' : project.statusLabel}
                  </span>
                </div>
              </div>

              {/* Title & Tagline */}
              <div>
                <h2 className="font-display font-semibold text-2xl sm:text-3xl text-zinc-950 dark:text-white mb-2 [text-wrap:balance]">
                  <Link href={`/projects/${project.slug}`} className="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                    {project.name}
                  </Link>
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 [text-wrap:pretty]">
                  {project.tagline}
                </p>
              </div>

              {/* Problem vs Solution Split — Clean Editorial Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Left: Origin & Bottleneck */}
                <div className="p-5 rounded-xl bg-white dark:bg-[#16171D] border border-zinc-200/80 dark:border-zinc-800/80 space-y-2.5">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">
                    The Problem & Origin
                  </div>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed [text-wrap:pretty]">
                    {uc.whyBuilt}
                  </p>
                </div>

                {/* Right: What Was Engineered & Shipped */}
                <div className="p-5 rounded-xl bg-white dark:bg-[#16171D] border border-zinc-200/80 dark:border-zinc-800/80 space-y-2.5">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">
                    The Engineered Solution
                  </div>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed [text-wrap:pretty]">
                    {uc.problemSolved}
                  </p>
                </div>
              </div>

              {/* Measurable Business Impact */}
              <div className="pt-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block mb-2.5 font-semibold">
                  Measurable Business Impact:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {uc.businessImpact.map((impact, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-white dark:bg-[#16171D] border border-zinc-200/70 dark:border-zinc-800/70 text-xs font-mono text-zinc-800 dark:text-zinc-200"
                    >
                      {impact}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-zinc-200/80 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
                <Link
                  href={`/projects/${project.slug}`}
                  className="btn-tactile inline-flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white font-semibold transition-colors"
                >
                  <span>Read full case study</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <div className="flex items-center gap-3">
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-tactile inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-semibold transition-colors active:scale-[0.98]"
                    >
                      <span>Launch live build</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <Link
                    href="/contact"
                    className="btn-tactile inline-flex items-center gap-1 px-3.5 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:border-black dark:hover:border-white text-zinc-700 dark:text-zinc-300 transition-colors active:scale-[0.98]"
                  >
                    <span>Inquire for similar build</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Clean Editorial Inquiries Box */}
      <section className="p-8 sm:p-10 rounded-2xl bg-zinc-950 text-white dark:bg-[#111216] border border-zinc-800 dark:border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="space-y-2 max-w-xl">
          <div className="text-xs font-mono uppercase tracking-wider text-zinc-400">
            HAVE AN OPERATIONAL BOTTLENECK?
          </div>
          <h2 className="font-display font-semibold text-2xl sm:text-3xl text-white [text-wrap:balance]">
            Let&apos;s engineer software that solves it.
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed [text-wrap:pretty]">
            Whether it&apos;s a high-throughput billing till, custom manufacturing ERP, or automated workflow agent, I deliver production-ready software in 2 to 4 weeks with 100% sovereign code ownership.
          </p>
        </div>
        <Link
          href="/contact"
          className="btn-tactile inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black hover:bg-zinc-200 dark:bg-white dark:text-black font-semibold text-sm transition-all active:scale-[0.98] whitespace-nowrap"
        >
          <span>Get in touch</span>
          <ArrowUpRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
