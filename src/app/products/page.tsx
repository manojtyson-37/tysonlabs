import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { getApprovedProjects } from '@/data/projects';
import { ExternalLink, ArrowUpRight, CheckCircle2, Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Live Products & Systems · Built to Solve Business Bottlenecks',
  description: 'Production software and vertical operating systems built by TysonLabs that solve real business problems across retail, manufacturing, healthcare, and fintech.',
};

export default function ProductsPage() {
  const allProjects = getApprovedProjects();
  
  // Distinguish live and production-ready applications from prototypes
  const liveProducts = allProjects.filter((p) => p.status === 'live' || p.status === 'open-source');
  const prototypes = allProjects.filter((p) => p.status === 'prototype' || p.status === 'in-progress');

  return (
    <div className="max-w-6xl mx-auto px-6 sm:px-8 py-10 space-y-16">
      {/* Header */}
      <div className="space-y-4 max-w-3xl">
        <div className="text-xs uppercase tracking-wider font-semibold text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400"></span>
          <span>Deployable & Interactive Software</span>
        </div>
        <h1 className="font-display font-bold text-3xl sm:text-5xl text-zinc-950 dark:text-white tracking-tight [text-wrap:balance]">
          Software built to solve real operational bottlenecks.
        </h1>
        <p className="text-base text-zinc-600 dark:text-[#94A3B8] leading-relaxed [text-wrap:pretty]">
          Every product below was engineered to eliminate high-stakes business friction — from slow POS tills in restaurants to fabric wastage in garment factories and unbilled clinic visits.
        </p>
        <div className="pt-2">
          <Link
            href="/use-cases"
            className="btn-tactile inline-flex items-center gap-2 text-xs font-mono font-semibold px-4 py-2 rounded-xl bg-zinc-100 dark:bg-[#1A1D24] text-zinc-900 dark:text-white border border-zinc-200 dark:border-white/10 hover:border-black dark:hover:border-white transition-all active:scale-[0.98]"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>View Full Business Use Cases Matrix →</span>
          </Link>
        </div>
      </div>

      {/* Production Products Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-black/[0.08] dark:border-white/[0.08]">
          <h2 className="font-display font-bold text-xl text-zinc-950 dark:text-white">
            Production & Live Systems
          </h2>
          <span className="text-xs font-mono text-zinc-500 dark:text-[#64748B]">
            {liveProducts.length} Live Deployments
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {liveProducts.map((product) => (
            <div
              key={product.slug}
              className="p-6 rounded-2xl bg-zinc-50 dark:bg-[#0F1116] border border-black/[0.08] dark:border-white/[0.08] hover:border-black/[0.2] dark:hover:border-white/[0.2] transition-all flex flex-col justify-between space-y-5 shadow-xs"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-[#94A3B8]">
                    {product.businessUseCase?.targetIndustry || product.categoryLabel}
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full badge-live">
                    {product.statusLabel}
                  </span>
                </div>

                <h3 className="font-display font-bold text-xl text-zinc-950 dark:text-white">
                  <Link href={`/projects/${product.slug}`} className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
                    {product.name}
                  </Link>
                </h3>

                <p className="text-sm text-zinc-600 dark:text-[#94A3B8] leading-relaxed [text-wrap:pretty]">
                  {product.shortDescription}
                </p>

                {/* Problem & Solution Callout */}
                {product.businessUseCase && (
                  <div className="space-y-2 pt-1 text-xs">
                    <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/15 text-zinc-700 dark:text-zinc-300">
                      <strong className="text-red-700 dark:text-red-400 block mb-0.5 font-mono text-[10px] uppercase">
                        The Business Problem Solved:
                      </strong>
                      <p className="line-clamp-2 leading-relaxed">
                        {product.businessUseCase.problemSolved}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/15 text-zinc-700 dark:text-zinc-300">
                      <strong className="text-emerald-700 dark:text-emerald-400 block mb-0.5 font-mono text-[10px] uppercase">
                        Why I Built It:
                      </strong>
                      <p className="line-clamp-2 leading-relaxed">
                        {product.businessUseCase.whyBuilt}
                      </p>
                    </div>
                  </div>
                )}

                {/* Business Impact Pills */}
                {product.businessUseCase?.businessImpact && (
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-semibold">
                      Measured Real-World Impact:
                    </div>
                    {product.businessUseCase.businessImpact.slice(0, 2).map((impact, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-zinc-800 dark:text-zinc-300 font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>{impact}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-xs font-semibold">
                <Link
                  href={`/projects/${product.slug}`}
                  className="text-zinc-600 dark:text-[#94A3B8] hover:text-zinc-950 dark:hover:text-white transition-colors"
                >
                  Architecture & Case Study →
                </Link>

                {product.liveUrl && (
                  <a
                    href={product.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-tactile inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black font-bold dark:hover:bg-zinc-200 transition-colors active:scale-[0.98]"
                  >
                    <span>Launch Live System</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                {product.sourceUrl && !product.liveUrl && (
                  <a
                    href={product.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-tactile inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-[#141820] text-zinc-900 dark:text-white border border-black/[0.1] dark:border-white/[0.1] hover:border-black/30 dark:hover:border-white/30 transition-colors active:scale-[0.98]"
                  >
                    <span>Inspect GitHub</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* In-Development & Prototypes Section */}
      <section className="space-y-6 pt-6">
        <div className="flex items-center justify-between pb-3 border-b border-black/[0.08] dark:border-white/[0.08]">
          <div>
            <h2 className="font-display font-bold text-xl text-zinc-950 dark:text-white">
              Active Builds & Prototypes
            </h2>
            <p className="text-xs text-zinc-500 dark:text-[#64748B] mt-0.5 font-mono">
              Working codebases solving specialized domain use cases
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-500 dark:text-[#64748B]">
            {prototypes.length} Builds
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prototypes.map((proto) => (
            <div
              key={proto.slug}
              className="p-5 rounded-xl bg-zinc-50 dark:bg-[#0F1116] border border-black/[0.08] dark:border-white/[0.08] hover:border-black/[0.16] dark:hover:border-white/[0.16] transition-all flex items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-zinc-950 dark:text-white">{proto.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.2 rounded badge-prototype">
                    {proto.statusLabel}
                  </span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-[#94A3B8] line-clamp-1">
                  {proto.businessUseCase?.problemSolved || proto.shortDescription}
                </p>
              </div>

              <Link
                href={`/projects/${proto.slug}`}
                className="shrink-0 text-xs font-mono text-zinc-900 dark:text-white hover:underline"
              >
                Inspect →
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
