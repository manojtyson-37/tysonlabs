import React from 'react';
import Link from 'next/link';
import { getFeaturedProjects } from '@/data/projects';
import { HeroTelemetryDeck } from '@/components/HeroTelemetryDeck';
import { HomeProjectsExplorer } from '@/components/HomeProjectsExplorer';
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
      icon: Bot,
      title: 'Autonomous Multi-Agent Systems',
      description: 'Production-grade agent frameworks with strict separation of roles (research, code, test, review), token compression, and deterministic execution gates.',
      highlight: 'Chief of Staff AI · Gemini Hospitality Copilot',
      href: '/projects?category=ai-agents',
    },
    {
      id: 'web-experiences',
      icon: Layout,
      title: 'High-Performance Web Platforms',
      description: 'Zero-layout-shift web applications, responsive editorial storefronts, tactile consumer portals, and client-side compiled WebAssembly engines.',
      highlight: 'ECHORA · Tyson Chess (WASM)',
      href: '/projects?category=web-experiences',
    },
    {
      id: 'business-tools',
      icon: Briefcase,
      title: 'Vertical SaaS & Operations OS',
      description: 'High-throughput restaurant POS tills, apparel manufacturing ERPs, clinic management, and compliant Indian GST accounting engines.',
      highlight: 'DinePulse Till · Silaa Atelier ERP',
      href: '/projects?category=business-tools',
    },
    {
      id: 'experiments',
      icon: FlaskConical,
      title: 'Labs & Native Systems',
      description: 'In-browser Stockfish 18 SIMD chess analysis, automated video synthesis pipelines, and developer telemetry toolkits.',
      highlight: 'Stockfish 18 WASM · YouTube Synthesis',
      href: '/labs',
    },
  ];

  return (
    <div className="space-y-20 sm:space-y-28">
      {/* Asymmetric Tactical Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 sm:px-8 pt-8 sm:pt-14 pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* Left Column: Manifesto & Tactile CTAs (7 cols) */}
          <div className="lg:col-span-7 space-y-7">
            {/* Studio Status Pill */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#0F1116] border border-white/[0.08] text-xs font-mono text-[#94A3B8]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="uppercase tracking-wider font-semibold text-white">
                TYSONLABS · INDEPENDENT ENGINEERING STUDIO
              </span>
              <span className="text-[#64748B] hidden sm:inline">· 16 PRODUCTION CODEBASES</span>
            </div>

            {/* Main Statement */}
            <div className="space-y-4">
              <h1 className="font-display font-extrabold text-4xl sm:text-6xl md:text-7xl text-white tracking-tight leading-[1.04]">
                Software built to run real businesses.
              </h1>
              <p className="text-base sm:text-lg text-[#94A3B8] leading-relaxed max-w-2xl font-normal">
                From offline-first restaurant POS tills and garment factory ERPs to in-browser chess engines and creator checkout systems. Everything designed, engineered, and shipped end-to-end.
              </p>
            </div>

            {/* Tactile High-Craft CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <Link
                href="/projects"
                className="btn-tactile inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-all shadow-lg shadow-white/5 active:scale-[0.98]"
              >
                <span>Explore 16 Live Builds</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>

              <Link
                href="/contact"
                className="btn-tactile inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-[#0F1116] text-white border border-white/[0.1] font-semibold text-sm hover:border-white/[0.25] hover:bg-[#151820] transition-all active:scale-[0.98]"
              >
                <span>Commission a System</span>
              </Link>
            </div>

            {/* Verified Capabilities & Shipped Systems Strip */}
            <div className="flex items-center gap-2 text-[11px] font-mono text-[#64748B] flex-wrap pt-1">
              <span className="text-white font-medium">Shipped systems:</span>
              <span className="text-[#94A3B8]">DinePulse Restaurant POS (Live)</span>
              <span>·</span>
              <span className="text-[#94A3B8]">Silaa Garment ERP</span>
              <span>·</span>
              <span className="text-[#94A3B8]">Stockfish 18 WASM</span>
              <span>·</span>
              <span className="text-[#94A3B8]">Tysonpe Payments</span>
            </div>

            {/* Studio Engineering Proof Metrics */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/[0.08] text-xs font-mono">
              <div className="bg-[#0F1116] p-3.5 rounded-xl border border-white/[0.08]">
                <div className="font-display font-bold text-2xl text-white">16</div>
                <div className="text-[#64748B] mt-1">Sovereign Codebases</div>
              </div>
              <div className="bg-[#0F1116] p-3.5 rounded-xl border border-white/[0.08]">
                <div className="font-display font-bold text-2xl text-emerald-400">100%</div>
                <div className="text-[#64748B] mt-1">Production Ready</div>
              </div>
              <div className="bg-[#0F1116] p-3.5 rounded-xl border border-white/[0.08]">
                <div className="font-display font-bold text-2xl text-white">Sub-10ms</div>
                <div className="text-[#64748B] mt-1">POS & Engine Latency</div>
              </div>
              <div className="bg-[#0F1116] p-3.5 rounded-xl border border-white/[0.08]">
                <div className="font-display font-bold text-2xl text-sky-400">Full-Stack</div>
                <div className="text-[#64748B] mt-1">UI · DB · Hardware · Edge</div>
              </div>
            </div>
          </div>

          {/* Right Column: Studio Runtime Radar (5 cols) */}
          <div className="lg:col-span-5 w-full">
            <HeroTelemetryDeck />
          </div>

        </div>
      </section>

      {/* Live Systems Radar Ribbon */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="bg-[#0F1116] border border-white/[0.08] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono shadow-xl shadow-black/60">
          <div className="flex items-center gap-3">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-white font-bold tracking-wider uppercase">VERIFIED LIVE DEPLOYMENTS</span>
            <span className="text-[#64748B] hidden sm:inline">· 5 Live Environments</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="https://saas-physio.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-tactile px-3 py-1.5 rounded-lg bg-[#090A0D] border border-white/[0.08] text-[#94A3B8] hover:text-white hover:border-white/30 transition-all flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>PhysioCare SaaS</span>
              <ExternalLink className="w-3 h-3 text-[#64748B]" />
            </a>
            <a
              href="https://nexify-dashboard.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-tactile px-3 py-1.5 rounded-lg bg-[#090A0D] border border-white/[0.08] text-[#94A3B8] hover:text-white hover:border-white/30 transition-all flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
              <span>Nexify Ops</span>
              <ExternalLink className="w-3 h-3 text-[#64748B]" />
            </a>
            <a
              href="https://www.kusumsdentalcare.in"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-tactile px-3 py-1.5 rounded-lg bg-[#090A0D] border border-white/[0.08] text-[#94A3B8] hover:text-white hover:border-white/30 transition-all flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Kusum Dental EHR</span>
              <ExternalLink className="w-3 h-3 text-[#64748B]" />
            </a>
            <a
              href="https://tysonchess-two.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-tactile px-3 py-1.5 rounded-lg bg-[#090A0D] border border-white/[0.08] text-[#94A3B8] hover:text-white hover:border-white/30 transition-all flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span>Stockfish 18 WASM</span>
              <ExternalLink className="w-3 h-3 text-[#64748B]" />
            </a>
          </div>
        </div>
      </section>

      {/* Selected Work Section with Interactive Explorer */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider font-semibold text-[#64748B] font-mono mb-1">
              ARCHITECTURAL MONOGRAPHS
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">
              Selected work.
            </h2>
          </div>
          <Link
            href="/projects"
            className="text-xs font-mono text-[#94A3B8] hover:text-white transition-colors inline-flex items-center gap-1"
          >
            <span>Explore all 16 projects</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <HomeProjectsExplorer initialProjects={featuredProjects} />
      </section>

      {/* Studio Capabilities / Focus Areas */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="mb-8 pb-4 border-b border-white/[0.08]">
          <div className="text-xs uppercase tracking-wider font-semibold text-[#64748B] font-mono mb-1">
            DISCIPLINES & EXPERTISE
          </div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">
            What TysonLabs builds.
          </h2>
          <p className="text-sm text-[#94A3B8] mt-1.5 max-w-xl">
            From industrial manufacturing pipelines and restaurant point-of-sale systems to in-browser Stockfish engines and multi-agent coordination.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {studioCapabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <Link
                key={cap.id}
                href={cap.href}
                className="group p-6 rounded-2xl bg-[#0F1116] border border-white/[0.08] hover:border-white/[0.2] transition-all duration-200 flex flex-col justify-between hover:shadow-xl hover:shadow-black/60"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-lg bg-[#090A0D] border border-white/[0.08] text-white">
                      <Icon className="w-5 h-5" />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-[#64748B] group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-white group-hover:text-zinc-200 transition-colors">
                    {cap.title}
                  </h3>
                  <p className="text-xs text-[#94A3B8] mt-2.5 leading-relaxed">
                    {cap.description}
                  </p>
                </div>
                <div className="pt-4 mt-5 border-t border-white/[0.06] text-xs font-mono text-[#64748B]">
                  Key builds: <span className="text-[#94A3B8] font-medium">{cap.highlight}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Engineering Philosophy & Ground Rules */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="p-8 sm:p-12 rounded-2xl bg-[#0F1116] border border-white/[0.08] relative overflow-hidden">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#94A3B8] uppercase tracking-wider font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Studio Engineering Doctrine</span>
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-4xl text-white tracking-tight">
              Hardened systems. Built for operators.
            </h2>
            <p className="text-sm sm:text-base text-[#94A3B8] leading-relaxed">
              Every codebase in TysonLabs was engineered to eliminate high-stakes operational friction — from sub-10ms restaurant billing under peak dining rushes to zero-waste garment marker calculation. No placeholder mockups, no generic templates, and no fabricated metrics.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="flex items-start gap-3 bg-[#090A0D] p-4 rounded-xl border border-white/[0.08]">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-white">Daylight Contrast & Speed</h4>
                  <p className="text-xs text-[#94A3B8] mt-1">
                    Interfaces built for operators under real lighting, optimized for keyboard shortcuts and sub-second execution.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-[#090A0D] p-4 rounded-xl border border-white/[0.08]">
                <ShieldCheck className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-white">Authentic Domain Logic</h4>
                  <p className="text-xs text-[#94A3B8] mt-1">
                    GST tax split rules, FSSAI compliance badges, and fabric shrinkage calculators built right into the schema.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-[#090A0D] p-4 rounded-xl border border-white/[0.08]">
                <Cpu className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-white">Sovereign Architectures</h4>
                  <p className="text-xs text-[#94A3B8] mt-1">
                    Client-side WASM, serverless edge routes, and self-hosted databases that run without recurring vendor extortion.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-[#090A0D] p-4 rounded-xl border border-white/[0.08]">
                <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-white">End-to-End Delivery</h4>
                  <p className="text-xs text-[#94A3B8] mt-1">
                    From initial database model and UI design tokens to production Vercel deployment and webhook hardening.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="p-8 sm:p-12 rounded-2xl bg-[#0F1116] border border-white/[0.08] flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">
              Have something worth building?
            </h2>
            <p className="text-sm text-[#94A3B8] leading-relaxed">
              Whether you need a specialized business operating system, an AI workflow engine, or a high-performance web product, let&apos;s build it with clarity and craft.
            </p>
          </div>
          <Link
            href="/contact"
            className="btn-tactile inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-all whitespace-nowrap shadow-lg shadow-white/5 active:scale-[0.98]"
          >
            <span>Commission a System</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
