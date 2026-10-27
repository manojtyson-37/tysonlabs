import React from 'react';
import Link from 'next/link';
import { getFeaturedProjects } from '@/data/projects';
import { ProjectCard } from '@/components/ProjectCard';
import { HeroTelemetryDeck } from '@/components/HeroTelemetryDeck';
import {
  ArrowUpRight,
  Sparkles,
  Bot,
  Layout,
  Briefcase,
  FlaskConical,
  CheckCircle2,
  Cpu,
  Layers,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function HomePage() {
  const featuredProjects = getFeaturedProjects();

  const studioCapabilities = [
    {
      id: 'ai-agents',
      icon: Bot,
      title: 'AI & Autonomous Agents',
      description: 'Production-grade agent frameworks, conversational copilots, and end-to-end task automation pipelines.',
      highlight: 'Chief of Staff AI & Gemini Copilots',
      href: '/projects?category=ai-agents',
      accent: 'border-purple-500/30 text-purple-400 group-hover:border-purple-500',
    },
    {
      id: 'web-experiences',
      icon: Layout,
      title: 'Web Experiences & Commerce',
      description: 'Zero-layout-shift web applications, responsive editorial storefronts, and tactile consumer portals.',
      highlight: 'ECHORA & Jaya Mahal Palace',
      href: '/projects?category=web-experiences',
      accent: 'border-sky-500/30 text-sky-400 group-hover:border-sky-500',
    },
    {
      id: 'business-tools',
      icon: Briefcase,
      title: 'Business & Operations OS',
      description: 'High-throughput restaurant POS tills, apparel manufacturing ERPs, clinic management, and GST accounting.',
      highlight: 'DinePulse & Silaa Atelier',
      href: '/projects?category=business-tools',
      accent: 'border-emerald-500/30 text-emerald-400 group-hover:border-emerald-500',
    },
    {
      id: 'experiments',
      icon: FlaskConical,
      title: 'Labs & Native Experiments',
      description: 'In-browser Stockfish WASM chess training, automated YouTube video synthesis, and developer toolkits.',
      highlight: 'Tyson Chess & Video Automation',
      href: '/labs',
      accent: 'border-amber-500/30 text-amber-400 group-hover:border-amber-500',
    },
  ];

  return (
    <div className="space-y-20 sm:space-y-28">
      {/* Asymmetric Tactical Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 sm:px-8 pt-6 sm:pt-12 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-10 items-start">
          
          {/* Left Column: Manifesto & Tactile CTAs (7 cols) */}
          <div className="lg:col-span-7 space-y-7">
            {/* Studio Status Pill */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#13151A] border border-[#272B35] text-xs font-mono text-[#9FA2B0]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="uppercase tracking-wider font-semibold text-[#F4F3F8]">
                INDEPENDENT TECHNOLOGY STUDIO
              </span>
              <span className="text-[#6C707E] hidden sm:inline">· SYSTEMS ACTIVE</span>
            </div>

            {/* Main Statement */}
            <div className="space-y-4">
              <h1 className="font-display font-extrabold text-4xl sm:text-6xl md:text-7xl text-[#F4F3F8] tracking-tight leading-[1.04]">
                Ideas into products.
              </h1>
              <p className="text-base sm:text-lg text-[#9FA2B0] leading-relaxed max-w-2xl font-normal">
                Digital products, AI-powered systems, and software experiences engineered to solve real problems. Crafted with extreme domain precision, high contrast, and tactile execution.
              </p>
            </div>

            {/* Tactile High-Craft CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <Link
                href="/projects"
                className="btn-tactile inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-100 hover:shadow-xl hover:shadow-white/5 transition-all shadow-[0_1px_3px_rgba(0,0,0,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <span>Explore projects</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>

              <Link
                href="/contact"
                className="btn-tactile inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-[#14161C] text-[#F4F3F8] border border-[#2A2E37] font-semibold text-sm hover:border-[#4B5263] hover:bg-[#1B1E26] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4B5263]"
              >
                <span>Get in touch</span>
              </Link>
            </div>

            {/* Studio Engineering Proof Metrics */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-[#242731] text-xs font-mono">
              <div className="bg-[#121419] p-3 rounded-lg border border-[#242731]">
                <div className="font-display font-bold text-xl text-[#F4F3F8]">15+</div>
                <div className="text-[#6C707E] mt-0.5">Sovereign Projects</div>
              </div>
              <div className="bg-[#121419] p-3 rounded-lg border border-[#242731]">
                <div className="font-display font-bold text-xl text-emerald-400">100%</div>
                <div className="text-[#6C707E] mt-0.5">Working Codebases</div>
              </div>
              <div className="bg-[#121419] p-3 rounded-lg border border-[#242731]">
                <div className="font-display font-bold text-xl text-white">Zero</div>
                <div className="text-[#6C707E] mt-0.5">Slop & Fake Metrics</div>
              </div>
              <div className="bg-[#121419] p-3 rounded-lg border border-[#242731]">
                <div className="font-display font-bold text-xl text-sky-400">WASM / Cloud</div>
                <div className="text-[#6C707E] mt-0.5">Modern Architecture</div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Studio Telemetry Deck (5 cols) */}
          <div className="lg:col-span-5 w-full">
            <HeroTelemetryDeck />
          </div>

        </div>
      </section>

      {/* Selected Work Section */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-[#242731]">
          <div>
            <div className="text-xs uppercase tracking-wider font-semibold text-[#B99AFF] font-mono mb-1.5">
              Level 1 — Standout Flagships
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#F4F3F8]">
              Selected work.
            </h2>
          </div>
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#B99AFF] hover:text-[#CCAFFF] transition-colors"
          >
            <span>View complete catalogue ({getFeaturedProjects().length} featured)</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Featured Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} featured />
          ))}
        </div>
      </section>

      {/* Studio Capabilities / Focus Areas */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="mb-8 pb-4 border-b border-[#242731]">
          <div className="text-xs uppercase tracking-wider font-semibold text-[#B99AFF] font-mono mb-1.5">
            Disciplines & Focus
          </div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#F4F3F8]">
            What TysonLabs builds.
          </h2>
          <p className="text-sm text-[#9FA2B0] mt-1.5 max-w-xl">
            From industrial manufacturing pipelines and restaurant point-of-sale systems to browser-based Stockfish engines and multi-agent coordination.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {studioCapabilities.map((cap) => {
            const Icon = cap.icon;
            return (
              <Link
                key={cap.id}
                href={cap.href}
                className="group p-6 rounded-xl bg-[#121419] border border-[#242731] hover:border-[#3E4351] transition-all duration-200 flex flex-col justify-between hover:shadow-xl hover:shadow-black/40"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2.5 rounded-lg bg-[#0E1015] border ${cap.accent} transition-colors`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-[#6C707E] group-hover:text-[#F4F3F8] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-[#F4F3F8] group-hover:text-white transition-colors">
                    {cap.title}
                  </h3>
                  <p className="text-sm text-[#9FA2B0] mt-2 leading-relaxed">
                    {cap.description}
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-[#242731] text-xs font-mono text-[#6C707E]">
                  Key builds: <span className="text-[#9FA2B0] font-medium">{cap.highlight}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Engineering Philosophy & Ground Rules */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="p-8 sm:p-12 rounded-2xl bg-[#121419] border border-[#242731] relative overflow-hidden">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#B99AFF] uppercase tracking-wider font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Studio Engineering Doctrine</span>
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-4xl text-[#F4F3F8] tracking-tight">
              From idea to implementation.
            </h2>
            <p className="text-sm sm:text-base text-[#9FA2B0] leading-relaxed">
              We reject generic &quot;AI portfolio slop&quot; — no useless glowing purple blobs, no ambiguous floating cards with placeholder text, and no fabricated metrics. Every system here was built to solve a concrete real-world operational need.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="flex items-start gap-3 bg-[#0E1015] p-4 rounded-xl border border-[#242731]">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-[#F4F3F8]">Daylight Contrast & Speed</h4>
                  <p className="text-xs text-[#9FA2B0] mt-1">
                    Interfaces built for operators under real lighting, optimized for keyboard shortcuts and sub-second execution.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-[#0E1015] p-4 rounded-xl border border-[#242731]">
                <ShieldCheck className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-[#F4F3F8]">Authentic Domain Logic</h4>
                  <p className="text-xs text-[#9FA2B0] mt-1">
                    GST tax split rules, FSSAI compliance badges, and fabric shrinkage calculators built right into the schema.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-[#0E1015] p-4 rounded-xl border border-[#242731]">
                <Cpu className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-[#F4F3F8]">Sovereign Architectures</h4>
                  <p className="text-xs text-[#9FA2B0] mt-1">
                    Client-side WASM, serverless edge routes, and self-hosted databases that run without recurring vendor extortion.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-[#0E1015] p-4 rounded-xl border border-[#242731]">
                <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-[#F4F3F8]">End-to-End Delivery</h4>
                  <p className="text-xs text-[#9FA2B0] mt-1">
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
        <div className="p-8 sm:p-12 rounded-2xl bg-[#121419] border border-[#242731] flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#F4F3F8]">
              Have something worth building?
            </h2>
            <p className="text-sm text-[#9FA2B0] leading-relaxed">
              Whether you need a specialized business operating system, an AI workflow engine, or a high-performance web product, let&apos;s build it with clarity and craft.
            </p>
          </div>
          <Link
            href="/contact"
            className="btn-tactile inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-white text-zinc-950 font-bold text-sm hover:bg-zinc-100 transition-all whitespace-nowrap shadow-lg shadow-white/5 active:scale-[0.98]"
          >
            <span>Let&apos;s make it real</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
