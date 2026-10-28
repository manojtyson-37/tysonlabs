import React from 'react';
import Link from 'next/link';
import { getFeaturedProjects } from '@/data/projects';
import { HeroOperationalPreview } from '@/components/HeroOperationalPreview';
import { HomeProjectsExplorer } from '@/components/HomeProjectsExplorer';
import { TaglineReveal } from '@/components/TaglineReveal';
import { FaqSection } from '@/components/FaqSection';
import {
  ArrowUpRight,
  ExternalLink,
  Bot,
  Layout,
  Briefcase,
  FlaskConical,
  CheckCircle2,
  Cpu,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function HomePage() {
  const featuredProjects = getFeaturedProjects();

  const studioCapabilities = [
    {
      id: 'ai-agents',
      number: '01',
      icon: Bot,
      title: 'Autonomous Multi-Agent Systems',
      description: 'Production-grade agent frameworks with strict separation of roles (research, code, test, review), token compression, and deterministic execution gates.',
      highlight: 'Chief of Staff AI · Gemini Hospitality Copilot',
      href: '/projects?category=ai-agents',
    },
    {
      id: 'web-experiences',
      number: '02',
      icon: Layout,
      title: 'High-Performance Web & WASM Platforms',
      description: 'Zero-layout-shift web applications, responsive editorial storefronts, tactile consumer portals, and client-compiled WebAssembly engines.',
      highlight: 'ECHORA · Tyson Chess (WASM)',
      href: '/projects?category=web-experiences',
    },
    {
      id: 'business-tools',
      number: '03',
      icon: Briefcase,
      title: 'Vertical SaaS & Operations Operating Systems',
      description: 'High-throughput restaurant POS tills, apparel manufacturing ERPs, clinic management, and compliant Indian GST accounting engines.',
      highlight: 'DinePulse Till · Silaa Atelier ERP',
      href: '/projects?category=business-tools',
    },
    {
      id: 'experiments',
      number: '04',
      icon: FlaskConical,
      title: 'Native Systems & Proving Ground Labs',
      description: 'In-browser Stockfish 18 SIMD chess analysis, automated video synthesis pipelines, and developer telemetry toolkits.',
      highlight: 'Stockfish 18 WASM · YouTube Synthesis',
      href: '/labs',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* Editorial Studio Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 sm:px-8 pt-6 sm:pt-12 pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* Left Column: Manifesto & Tactile CTAs (7 cols) */}
          <div className="lg:col-span-7 space-y-7">
            {/* Studio Status Marker */}
            <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-black/[0.08] dark:border-white/[0.08] text-xs font-mono text-zinc-600 dark:text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-zinc-950 dark:text-white font-medium">TysonLabs</span>
              <span className="text-zinc-300 dark:text-zinc-600">/</span>
              <span>Independent Engineering Studio · Bangalore</span>
            </div>

            {/* Main Statement */}
            <div className="space-y-4 max-w-[680px]">
              <h1 className="font-display font-semibold text-4xl sm:text-6xl md:text-7xl bg-gradient-to-r from-black to-zinc-600 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent tracking-tight leading-[1.04] [text-wrap:balance]">
                Software engineered for real operations.
              </h1>
              <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-[640px] font-normal [text-wrap:pretty]">
                From touch point-of-sale tills and clinic practice systems to in-browser WebAssembly engines and autonomous multi-agent pipelines. We turn operational requirements into hardened, production software with 100% sovereign client ownership.
              </p>
            </div>

            {/* Tactile Conversion CTA Hierarchy */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <Link
                href="/projects"
                className="btn-tactile inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-semibold text-base transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] shadow-xl shadow-black/5 dark:shadow-white/5 active:scale-[0.98]"
              >
                <span>Explore 16 Flagships</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>

              <Link
                href="/contact"
                className="btn-tactile inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-700 hover:text-black dark:text-zinc-300 dark:hover:text-white transition-colors duration-200 py-2.5 px-4 rounded-xl border border-black/[0.08] dark:border-white/[0.08] hover:border-black/20 dark:hover:border-white/20 active:scale-[0.98]"
              >
                <span>Commission a system</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
              </Link>
            </div>

            {/* Shipped Systems Strip */}
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 dark:text-zinc-400 flex-wrap pt-1">
              <span className="text-zinc-950 dark:text-white font-semibold">Active deployments:</span>
              <span className="text-zinc-800 dark:text-zinc-300">DinePulse POS (Live)</span>
              <span>·</span>
              <span className="text-zinc-800 dark:text-zinc-300">Tyson Chess (WASM)</span>
              <span>·</span>
              <span className="text-zinc-800 dark:text-zinc-300">Tysonpe (Fintech)</span>
              <span>·</span>
              <span className="text-zinc-800 dark:text-zinc-300">Silaa ERP (Live)</span>
            </div>

            {/* Studio Engineering Proof Ledger (Replaces generic AI floating boxes) */}
            <div className="pt-6 border-t border-black/[0.08] dark:border-white/[0.08]">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs font-mono">
                <div>
                  <div className="text-zinc-400 dark:text-zinc-500 text-[10px] uppercase tracking-wider mb-1">PROVEN ARCHITECTURE</div>
                  <div className="font-semibold text-zinc-950 dark:text-white text-base">16 Shipped Builds</div>
                  <div className="text-zinc-500 text-[11px] mt-0.5">Zero synthetic slop</div>
                </div>
                <div>
                  <div className="text-zinc-400 dark:text-zinc-500 text-[10px] uppercase tracking-wider mb-1">LOCAL-FIRST RELIABILITY</div>
                  <div className="font-semibold text-emerald-600 dark:text-emerald-400 text-base">Offline Resilient</div>
                  <div className="text-zinc-500 text-[11px] mt-0.5">High-speed till sync</div>
                </div>
                <div>
                  <div className="text-zinc-400 dark:text-zinc-500 text-[10px] uppercase tracking-wider mb-1">LATENCY BUDGET</div>
                  <div className="font-semibold text-zinc-950 dark:text-white text-base">Sub 12ms TTFB</div>
                  <div className="text-zinc-500 text-[11px] mt-0.5">Edge Serverless & WASM</div>
                </div>
                <div>
                  <div className="text-zinc-400 dark:text-zinc-500 text-[10px] uppercase tracking-wider mb-1">CLIENT OWNERSHIP</div>
                  <div className="font-semibold text-sky-600 dark:text-sky-400 text-base">100% Sovereign IP</div>
                  <div className="text-zinc-500 text-[11px] mt-0.5">Zero recurring lock-in</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Studio Workstation Preview (5 cols) */}
          <div className="lg:col-span-5 w-full">
            <HeroOperationalPreview />
          </div>

        </div>
      </section>

      {/* Live Systems Radar Ribbon */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="bg-zinc-50 dark:bg-[#14161C] border border-black/[0.08] dark:border-white/[0.08] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-zinc-950 dark:text-white font-medium tracking-wide">VERIFIED PRODUCTION DEPLOYMENTS</span>
            <span className="text-zinc-500 dark:text-zinc-400 hidden sm:inline">· 5 Live Environments</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="https://dineplus.vercel.app/pos"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-tactile px-3 py-1.5 rounded-lg bg-white dark:bg-[#0B0D11] border border-black/[0.08] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:border-black/20 dark:hover:border-white/30 transition-all flex items-center gap-1.5 active:scale-[0.98]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>DinePulse POS</span>
              <ExternalLink className="w-3 h-3 text-zinc-400" />
            </a>
            <a
              href="https://erp.silacollective.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-tactile px-3 py-1.5 rounded-lg bg-white dark:bg-[#0B0D11] border border-black/[0.08] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:border-black/20 dark:hover:border-white/30 transition-all flex items-center gap-1.5 active:scale-[0.98]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
              <span>Silaa Garment ERP</span>
              <ExternalLink className="w-3 h-3 text-zinc-400" />
            </a>
            <a
              href="https://saas-physio.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-tactile px-3 py-1.5 rounded-lg bg-white dark:bg-[#0B0D11] border border-black/[0.08] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:border-black/20 dark:hover:border-white/30 transition-all flex items-center gap-1.5 active:scale-[0.98]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
              <span>PhysioCare EHR</span>
              <ExternalLink className="w-3 h-3 text-zinc-400" />
            </a>
            <a
              href="https://tysonchess-two.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-tactile px-3 py-1.5 rounded-lg bg-white dark:bg-[#0B0D11] border border-black/[0.08] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:border-black/20 dark:hover:border-white/30 transition-all flex items-center gap-1.5 active:scale-[0.98]"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              <span>Stockfish 18 WASM</span>
              <ExternalLink className="w-3 h-3 text-zinc-400" />
            </a>
          </div>
        </div>
      </section>

      {/* Mandatory B11 Tagline Reveal Section */}
      <TaglineReveal />

      {/* Selected Work Section with Interactive Explorer */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-400 font-mono mb-1">
              ARCHITECTURAL MONOGRAPHS
            </div>
            <h2 className="font-display font-semibold text-2xl sm:text-3xl text-zinc-950 dark:text-white [text-wrap:balance]">
              Selected flagship systems.
            </h2>
          </div>
          <Link
            href="/projects"
            className="text-xs font-mono text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1"
          >
            <span>Explore all 16 projects</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <HomeProjectsExplorer initialProjects={featuredProjects} />
      </section>

      {/* Studio Capabilities / Focus Areas (Editorial Split Layout) */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column Header */}
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-28">
            <div className="text-xs uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-400 font-mono">
              DISCIPLINES & EXPERTISE
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-4xl text-zinc-950 dark:text-white [text-wrap:balance]">
              Engineering capabilities engineered for production.
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed [text-wrap:pretty]">
              We don&apos;t build static brochure sites or assemble bloated templates. Every system is engineered to handle edge latency, concurrency, payment compliance, and local-first reliability.
            </p>
            <div className="pt-2">
              <Link
                href="/services"
                className="btn-tactile inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-zinc-900 dark:text-white hover:underline"
              >
                <span>View all studio disciplines</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Column: Architectural Discipline Rows */}
          <div className="lg:col-span-7 divide-y divide-black/[0.08] dark:divide-white/[0.08] border-y border-black/[0.08] dark:border-white/[0.08]">
            {studioCapabilities.map((cap) => {
              const Icon = cap.icon;
              return (
                <Link
                  key={cap.id}
                  href={cap.href}
                  className="group py-6 block transition-colors duration-200"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-zinc-400 dark:text-zinc-500 font-bold">{cap.number}</span>
                        <h3 className="font-display font-bold text-lg text-zinc-950 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {cap.title}
                        </h3>
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-xl [text-wrap:pretty]">
                        {cap.description}
                      </p>
                      <div className="text-[11px] font-mono text-zinc-500 pt-1">
                        Proven in: <span className="text-zinc-800 dark:text-zinc-300 font-medium">{cap.highlight}</span>
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500 group-hover:text-black dark:group-hover:text-white group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 transition-colors shrink-0 mt-1">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Engineering Philosophy: Editorial Manifesto */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="p-8 sm:p-12 rounded-2xl bg-zinc-50 dark:bg-[#14161C] border border-black/[0.08] dark:border-white/[0.08]">
          <div className="max-w-3xl space-y-4 mb-8">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-zinc-600 dark:text-zinc-400 uppercase tracking-wider font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Studio Engineering Doctrine</span>
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-4xl text-zinc-950 dark:text-white tracking-tight [text-wrap:balance]">
              Hardened systems. Built for operators.
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed [text-wrap:pretty]">
              Every codebase in TysonLabs was engineered to eliminate high-stakes operational friction, from sub-10ms restaurant billing under peak dining rushes to zero-waste garment marker calculation. No placeholder mockups, no generic templates, and no fabricated metrics.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-black/[0.08] dark:border-white/[0.08]">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <h4 className="text-sm font-bold text-zinc-950 dark:text-white">Daylight Contrast</h4>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed [text-wrap:pretty]">
                Interfaces built for operators under real lighting, optimized for keyboard shortcuts and sub-second execution.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <h4 className="text-sm font-bold text-zinc-950 dark:text-white">Authentic Domain Logic</h4>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed [text-wrap:pretty]">
                GST tax split rules, FSSAI compliance badges, and fabric yield equations built right into the schema.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                <Cpu className="w-4 h-4 shrink-0" />
                <h4 className="text-sm font-bold text-zinc-950 dark:text-white">Sovereign Architecture</h4>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed [text-wrap:pretty]">
                Client-side WASM, serverless edge routes, and self-hosted databases that run without recurring vendor rent.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <Zap className="w-4 h-4 shrink-0" />
                <h4 className="text-sm font-bold text-zinc-950 dark:text-white">End-to-End Delivery</h4>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed [text-wrap:pretty]">
                From initial database model and UI design tokens to production Vercel deployment and webhook hardening.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Objection Handling: Comprehensive FAQ */}
      <FaqSection />

      {/* Risk Reversal & Final Conversion Banner */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8 pb-12">
        <div className="p-8 sm:p-12 rounded-2xl bg-zinc-50 dark:bg-[#14161C] border border-black/[0.08] dark:border-white/[0.08] flex flex-col md:flex-row items-start md:items-center justify-between gap-8 shadow-xs">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-zinc-600 dark:text-zinc-400 uppercase tracking-wider font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Zero Upfront Scoping Risk</span>
            </div>
            <h2 className="font-display font-semibold text-2xl sm:text-3xl text-zinc-950 dark:text-white [text-wrap:balance]">
              Have an operational system worth building?
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed [text-wrap:pretty]">
              Whether you need an offline-resilient point of sale till, an apparel manufacturing ERP, or an autonomous workflow engine, we build it with sovereign code ownership.
            </p>
            <div className="pt-2 text-xs font-mono text-zinc-500">
              Direct line to founding engineer · Complete IP transfer upon release
            </div>
          </div>
          <Link
            href="/contact"
            className="btn-tactile inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-semibold text-base transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] whitespace-nowrap shadow-xl active:scale-[0.98]"
          >
            <span>Commission a System</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
