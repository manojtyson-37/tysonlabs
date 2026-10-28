import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, Mail } from 'lucide-react';
import { GithubIcon } from '@/components/Icons';

export const metadata: Metadata = {
  title: 'About TysonLabs · Independent Technology Studio',
  description: 'The philosophy, engineering doctrine, and builder behind TysonLabs.',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 sm:px-8 py-10 space-y-16">
      {/* Header */}
      <div className="space-y-4 max-w-2xl">
        <div className="text-xs uppercase tracking-wider font-semibold text-zinc-500 dark:text-[#64748B] font-mono">
          STUDIO DOCTRINE & BACKGROUND
        </div>
        <h1 className="font-display font-bold text-3xl sm:text-5xl text-zinc-950 dark:text-white tracking-tight">
          Ideas into products.
        </h1>
        <p className="text-base text-zinc-600 dark:text-[#94A3B8] leading-relaxed">
          TysonLabs is an independent technology studio created and led by Manoj Tyson. We build software, AI systems, and vertical digital platforms designed to solve real operational challenges without decorative noise.
        </p>
      </div>

      {/* The Core Thesis */}
      <section className="p-8 sm:p-10 rounded-2xl bg-zinc-50 dark:bg-[#0F1116] border border-black/[0.08] dark:border-white/[0.08] space-y-6 shadow-xs dark:shadow-xl dark:shadow-black/40">
        <h2 className="font-display font-bold text-2xl text-zinc-950 dark:text-white">
          The Intersection of Product Intuition & Hard Engineering
        </h2>
        <div className="space-y-4 text-sm sm:text-base text-zinc-600 dark:text-[#94A3B8] leading-relaxed">
          <p>
            Too much modern software is built either by designers who don&apos;t understand database indexes and edge latency, or by engineers who don&apos;t understand the operator standing on a noisy restaurant floor trying to punch an order under bright lights.
          </p>
          <p>
            TysonLabs exists at that rare intersection: deeply understanding the nuances of the business domain — Indian GST tax splits, FSSAI regulations, apparel yield equations, and payment reconciliation — while possessing the technical mastery to ship full-stack web applications, compiled WebAssembly engines, and autonomous agent coordination systems.
          </p>
        </div>
      </section>

      {/* Engineering Principles */}
      <section className="space-y-6">
        <div className="pb-3 border-b border-black/[0.08] dark:border-white/[0.08]">
          <h2 className="font-display font-bold text-2xl text-zinc-950 dark:text-white">
            Core Doctrines
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-[#111216] border border-zinc-200/80 dark:border-zinc-800 space-y-3 font-mono">
            <div className="text-xs text-zinc-500 uppercase tracking-wider">01 / DOCTRINE</div>
            <h3 className="font-display font-semibold text-base text-zinc-950 dark:text-white font-sans">Zero Slop Aesthetic</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
              We strictly forbid generic AI glowing slop, crypto-style neon blobs, and decorative cards with fake metrics. If an element doesn&apos;t serve an operational purpose, it doesn&apos;t belong on the screen.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-[#111216] border border-zinc-200/80 dark:border-zinc-800 space-y-3 font-mono">
            <div className="text-xs text-zinc-500 uppercase tracking-wider">02 / DOCTRINE</div>
            <h3 className="font-display font-semibold text-base text-zinc-950 dark:text-white font-sans">High-Contrast Usability</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
              Tools used by factory workers, kitchen chefs, or clinic staff must remain legible under harsh real-world lighting. We design for speed, clear visual contrast, and tactile feedback.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-[#111216] border border-zinc-200/80 dark:border-zinc-800 space-y-3 font-mono">
            <div className="text-xs text-zinc-500 uppercase tracking-wider">03 / DOCTRINE</div>
            <h3 className="font-display font-semibold text-base text-zinc-950 dark:text-white font-sans">Sovereign Architecture</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
              We favor client-side WASM, serverless edge routes, and clean PostgreSQL schemas that operators can own and control without recurring vendor lock-in or fragile microservice webs.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-[#111216] border border-zinc-200/80 dark:border-zinc-800 space-y-3 font-mono">
            <div className="text-xs text-zinc-500 uppercase tracking-wider">04 / DOCTRINE</div>
            <h3 className="font-display font-semibold text-base text-zinc-950 dark:text-white font-sans">Verified Work Over Hype</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-sans">
              Every project in this studio represents working code that has been inspected, tested, and verified. We don&apos;t publish hypothetical mockups and claim they are finished products.
            </p>
          </div>
        </div>
      </section>

      {/* The Founder & Verified Links */}
      <section className="p-8 rounded-2xl bg-zinc-50 dark:bg-[#0F1116] border border-black/[0.08] dark:border-white/[0.08] space-y-6">
        <h2 className="font-display font-bold text-2xl text-zinc-950 dark:text-white">
          Builder & Maintainer
        </h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="font-display font-bold text-lg text-zinc-950 dark:text-white">Manoj Tyson</div>
            <p className="text-sm text-zinc-600 dark:text-[#94A3B8]">
              Senior Product Engineer, Systems Architect, and Independent Studio Founder.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com/manojtyson-37"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-tactile inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white dark:bg-[#090A0D] border border-black/[0.1] dark:border-white/[0.1] text-xs font-mono text-zinc-900 dark:text-white hover:border-black/30 dark:hover:border-white/30 transition-colors active:scale-[0.98]"
            >
              <GithubIcon className="w-3.5 h-3.5 text-zinc-500 dark:text-[#64748B]" />
              <span>@manojtyson-37</span>
              <ArrowUpRight className="w-3 h-3 text-zinc-500 dark:text-[#64748B]" />
            </a>

            <Link
              href="/contact"
              className="btn-tactile inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black text-xs font-bold dark:hover:bg-zinc-200 transition-colors active:scale-[0.98]"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Send Message</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
