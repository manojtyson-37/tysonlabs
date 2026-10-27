import React from 'react';
import Link from 'next/link';
import { getFeaturedProjects } from '@/data/projects';
import { ProjectCard } from '@/components/ProjectCard';
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
    <div className="space-y-24 sm:space-y-32">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 sm:px-8 pt-8 sm:pt-16 pb-6">
        <div className="max-w-3xl space-y-8">
          {/* Studio Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#15171C] border border-[#30333B] text-xs font-mono text-[#A6A8B3]">
            <span className="w-2 h-2 rounded-full bg-[#B99AFF] animate-pulse"></span>
            <span className="uppercase tracking-wider font-semibold text-[#F4F3F8]">
              Independent Technology Studio
            </span>
          </div>

          {/* Main Statement */}
          <div className="space-y-4">
            <h1 className="font-display font-extrabold text-4xl sm:text-6xl md:text-7xl text-[#F4F3F8] tracking-tight leading-[1.06]">
              Ideas into products.
            </h1>
            <p className="text-lg sm:text-xl text-[#A6A8B3] leading-relaxed max-w-2xl font-normal">
              Digital products, AI-powered systems, and software experiences engineered to solve real problems. Crafted with extreme domain precision, high contrast, and tactile execution.
            </p>
          </div>

          {/* Hero CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-[#B99AFF] text-[#0C0D10] font-semibold text-sm hover:bg-[#CCAFFF] transition-all duration-150 shadow-md shadow-[#B99AFF]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#B99AFF]"
            >
              <span>Explore projects</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>

            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-[#15171C] text-[#F4F3F8] border border-[#30333B] font-semibold text-sm hover:border-[#B99AFF] hover:text-[#B99AFF] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B99AFF]"
            >
              <span>Get in touch</span>
            </Link>
          </div>

          {/* Micro Proof Metrics Bar */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-[#30333B]/60 text-xs font-mono text-[#A6A8B3]">
            <div>
              <div className="font-display font-bold text-xl text-[#F4F3F8]">15+</div>
              <div className="text-[#717684] mt-0.5">Sovereign Projects</div>
            </div>
            <div>
              <div className="font-display font-bold text-xl text-emerald-400">100%</div>
              <div className="text-[#717684] mt-0.5">Working Codebases</div>
            </div>
            <div>
              <div className="font-display font-bold text-xl text-[#B99AFF]">Zero</div>
              <div className="text-[#717684] mt-0.5">Slop & Fake Metrics</div>
            </div>
            <div>
              <div className="font-display font-bold text-xl text-sky-400">WASM / Cloud</div>
              <div className="text-[#717684] mt-0.5">Modern Architecture</div>
            </div>
          </div>
        </div>
      </section>

      {/* Selected Work Section */}
      <section className="max-w-6xl mx-auto px-6 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-4 border-b border-[#30333B]/60">
          <div>
            <div className="text-xs uppercase tracking-wider font-semibold text-[#B99AFF] font-mono mb-2">
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
      <section className="max-w-6xl mx-auto px-6 sm:px-8">
        <div className="mb-10 pb-4 border-b border-[#30333B]/60">
          <div className="text-xs uppercase tracking-wider font-semibold text-[#B99AFF] font-mono mb-2">
            Disciplines & Focus
          </div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#F4F3F8]">
            What TysonLabs builds.
          </h2>
          <p className="text-sm text-[#A6A8B3] mt-2 max-w-xl">
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
                className="group p-6 rounded-xl bg-[#15171C] border border-[#30333B] hover:border-[#484D58] transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2.5 rounded-lg bg-[#0C0D10] border ${cap.accent} transition-colors`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-[#717684] group-hover:text-[#F4F3F8] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-[#F4F3F8] group-hover:text-[#B99AFF] transition-colors">
                    {cap.title}
                  </h3>
                  <p className="text-sm text-[#A6A8B3] mt-2 leading-relaxed">
                    {cap.description}
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-[#30333B]/60 text-xs font-mono text-[#717684]">
                  Key builds: <span className="text-[#A6A8B3] font-medium">{cap.highlight}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Engineering Philosophy & Ground Rules */}
      <section className="max-w-6xl mx-auto px-6 sm:px-8">
        <div className="p-8 sm:p-12 rounded-2xl bg-[#15171C] border border-[#30333B] relative overflow-hidden">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#B99AFF] uppercase tracking-wider font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Studio Engineering Doctrine</span>
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-4xl text-[#F4F3F8] tracking-tight">
              From idea to implementation.
            </h2>
            <p className="text-sm sm:text-base text-[#A6A8B3] leading-relaxed">
              We reject generic &quot;AI portfolio slop&quot; — no useless glowing purple blobs, no ambiguous floating cards with placeholder text, and no fabricated metrics. Every system here was built to solve a concrete real-world operational need.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-[#F4F3F8]">Daylight Contrast & Speed</h4>
                  <p className="text-xs text-[#A6A8B3] mt-1">
                    Interfaces built for operators under real lighting, optimized for keyboard shortcuts and sub-second execution.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-[#F4F3F8]">Authentic Domain Logic</h4>
                  <p className="text-xs text-[#A6A8B3] mt-1">
                    GST tax split rules, FSSAI compliance badges, and fabric shrinkage calculators built right into the schema.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Cpu className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-[#F4F3F8]">Sovereign Architectures</h4>
                  <p className="text-xs text-[#A6A8B3] mt-1">
                    Client-side WASM, serverless edge routes, and self-hosted databases that run without recurring vendor extortion.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-[#F4F3F8]">End-to-End Delivery</h4>
                  <p className="text-xs text-[#A6A8B3] mt-1">
                    From initial database model and UI design tokens to production Vercel deployment and webhook hardening.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-6xl mx-auto px-6 sm:px-8">
        <div className="p-8 sm:p-12 rounded-2xl bg-gradient-to-b from-[#15171C] to-[#0E1015] border border-[#30333B] flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#F4F3F8]">
              Have something worth building?
            </h2>
            <p className="text-sm text-[#A6A8B3] leading-relaxed">
              Whether you need a specialized business operating system, an AI workflow engine, or a high-performance web product, let&apos;s build it with clarity and craft.
            </p>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-[#B99AFF] text-[#0C0D10] font-bold text-sm hover:bg-[#CCAFFF] transition-colors whitespace-nowrap shadow-lg shadow-[#B99AFF]/15"
          >
            <span>Let&apos;s make it real</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
