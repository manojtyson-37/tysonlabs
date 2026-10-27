import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { getApprovedProjects } from '@/data/projects';
import { ExternalLink, ArrowUpRight, CheckCircle, Sparkles, Terminal } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Live Products & Systems · Ready to Use',
  description: 'Production software and interactive applications built by TysonLabs that you can launch, test, and use today.',
};

export default function ProductsPage() {
  const allProjects = getApprovedProjects();
  
  // Distinguish live and production-ready applications from prototypes
  const liveProducts = allProjects.filter((p) => p.status === 'live' || p.status === 'open-source');
  const prototypes = allProjects.filter((p) => p.status === 'prototype' || p.status === 'in-progress');

  return (
    <div className="max-w-6xl mx-auto px-6 sm:px-8 py-10 space-y-16">
      {/* Header */}
      <div className="space-y-4 max-w-2xl">
        <div className="text-xs uppercase tracking-wider font-semibold text-[#10B981] font-mono flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Deployable & Interactive Software</span>
        </div>
        <h1 className="font-display font-bold text-3xl sm:text-5xl text-[#F4F3F8] tracking-tight">
          Products you can use today.
        </h1>
        <p className="text-base text-[#A6A8B3] leading-relaxed">
          Unlike concept portfolios full of static Figma mockups, TysonLabs builds real, functional software. The systems below are deployed, interactive, and available for evaluation.
        </p>
      </div>

      {/* Production Products Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#30333B]">
          <h2 className="font-display font-bold text-xl text-[#F4F3F8]">
            Production & Open-Source Systems
          </h2>
          <span className="text-xs font-mono text-[#717684]">
            {liveProducts.length} Live Deployments
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {liveProducts.map((product) => (
            <div
              key={product.slug}
              className="p-6 rounded-xl bg-[#15171C] border border-[#30333B] hover:border-[#484D58] transition-all flex flex-col justify-between space-y-5 shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-[#A6A8B3]">
                    {product.categoryLabel}
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full badge-live">
                    {product.statusLabel}
                  </span>
                </div>

                <h3 className="font-display font-bold text-xl text-[#F4F3F8]">
                  <Link href={`/projects/${product.slug}`} className="hover:text-[#B99AFF] transition-colors">
                    {product.name}
                  </Link>
                </h3>

                <p className="text-sm text-[#A6A8B3] leading-relaxed">
                  {product.shortDescription}
                </p>

                <div className="space-y-1.5 pt-2">
                  {product.highlights.slice(0, 2).map((h, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-zinc-300 font-mono">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-[#30333B]/60 flex items-center justify-between text-xs font-semibold">
                <Link
                  href={`/projects/${product.slug}`}
                  className="text-[#A6A8B3] hover:text-[#F4F3F8] transition-colors"
                >
                  Architecture & Case Study →
                </Link>

                {product.liveUrl && (
                  <a
                    href={product.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#B99AFF] text-[#0C0D10] font-bold hover:bg-[#CCAFFF] transition-colors"
                  >
                    <span>Launch Product</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                {product.sourceUrl && !product.liveUrl && (
                  <a
                    href={product.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#30333B] text-[#F4F3F8] hover:bg-[#484D58] transition-colors"
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
        <div className="flex items-center justify-between pb-3 border-b border-[#30333B]">
          <div>
            <h2 className="font-display font-bold text-xl text-[#F4F3F8]">
              Active Builds & Prototypes
            </h2>
            <p className="text-xs text-[#717684] mt-0.5 font-mono">
              Working codebases in testing and release preparation
            </p>
          </div>
          <span className="text-xs font-mono text-[#717684]">
            {prototypes.length} Builds
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prototypes.map((proto) => (
            <div
              key={proto.slug}
              className="p-5 rounded-xl bg-[#121419] border border-[#30333B] flex items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-[#F4F3F8]">{proto.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.2 rounded badge-prototype">
                    {proto.statusLabel}
                  </span>
                </div>
                <p className="text-xs text-[#A6A8B3] line-clamp-1">
                  {proto.shortDescription}
                </p>
              </div>

              <Link
                href={`/projects/${proto.slug}`}
                className="shrink-0 text-xs font-mono text-[#B99AFF] hover:underline"
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
