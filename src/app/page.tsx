import React from 'react';
import Link from 'next/link';
import { getFeaturedProjects } from '@/data/projects';
import { HeroOperationalPreview } from '@/components/HeroOperationalPreview';
import { ProjectsSneakPeekShowcase } from '@/components/ProjectsSneakPeekShowcase';
import { HomeProjectsExplorer } from '@/components/HomeProjectsExplorer';
import { TaglineReveal } from '@/components/TaglineReveal';
import { FaqSection } from '@/components/FaqSection';
import { ArrowUpRight } from 'lucide-react';

export default function HomePage() {
  const featuredProjects = getFeaturedProjects();

  const studioCapabilities = [
    {
      id: 'ai-agents',
      number: '01',
      title: 'Autonomous Multi-Agent AI Workflows',
      description: 'Custom AI agent teams that automate complex business tasks like market research, code writing, and automated quality testing without hallucination.',
      highlight: 'Chief of Staff AI · Gemini Hospitality Copilot',
      href: '/projects?category=ai-agents',
    },
    {
      id: 'web-experiences',
      number: '02',
      title: 'High-Performance Web Apps & Interactive Systems',
      description: 'Zero-layout-shift web applications, responsive editorial storefronts, tactile consumer portals, and interactive browser tools.',
      highlight: 'ECHORA Luxury Boutique · Tyson AI Chess Coach',
      href: '/projects?category=web-experiences',
    },
    {
      id: 'business-tools',
      number: '03',
      title: 'Vertical SaaS & Operations Operating Systems',
      description: 'High-throughput restaurant POS tills, apparel manufacturing ERPs, clinic management, and compliant Indian GST accounting engines.',
      highlight: 'DinePulse Till · Silaa Atelier ERP',
      href: '/projects?category=business-tools',
    },
    {
      id: 'experiments',
      number: '04',
      title: 'Specialized Business Tools & Proving Ground Labs',
      description: 'Interactive AI coaching algorithms, automated YouTube video synthesis pipelines, and developer telemetry toolkits.',
      highlight: 'Tyson AI Coach · Autonomous Video Pipeline',
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
            {/* Engineer Identity Marker */}
            <div className="text-xs font-mono uppercase tracking-wider text-zinc-500">
              Manoj Tyson · Systems & Software Engineer · Bangalore, IN
            </div>

            {/* Main Statement */}
            <div className="space-y-4 max-w-[680px]">
              <h1 className="font-display font-semibold text-4xl sm:text-6xl md:text-7xl text-zinc-950 dark:text-white tracking-tight leading-[1.04] [text-wrap:balance]">
                I build software that runs real businesses.
              </h1>
              <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-[640px] font-normal [text-wrap:pretty]">
                From touch billing tills for high-volume restaurants and multi-stage garment manufacturing ERPs to interactive AI chess engines and creator commerce platforms. High-craft web applications and custom operating systems — designed, engineered, and delivered with 100% sovereign client code ownership.
              </p>
            </div>

            {/* Conversion CTA Hierarchy */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <Link
                href="/projects"
                className="btn-tactile inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 font-semibold text-sm transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] shadow-sm active:scale-[0.98]"
              >
                <span>Explore 16 Live Systems</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>

              <Link
                href="/use-cases"
                className="btn-tactile inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-700 hover:text-black dark:text-zinc-300 dark:hover:text-white transition-colors duration-200 py-3 px-5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:border-black/30 dark:hover:border-white/30 active:scale-[0.98]"
              >
                <span>Case Studies & Problems Solved</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
              </Link>
            </div>

            {/* Mitchell Sparrow-Style Direct Social & Contact Links */}
            <div className="flex items-center gap-4 text-xs font-mono text-zinc-500 pt-1">
              <a 
                href="https://github.com/manoj-tyson" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-black dark:hover:text-white transition-colors"
              >
                GitHub ↗
              </a>
              <span>·</span>
              <a 
                href="https://linkedin.com/in/manoj-tyson" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-black dark:hover:text-white transition-colors"
              >
                LinkedIn ↗
              </a>
              <span>·</span>
              <a 
                href="mailto:manojsoundar7@gmail.com" 
                className="hover:text-black dark:hover:text-white transition-colors"
              >
                manojsoundar7@gmail.com
              </a>
            </div>

            {/* Concrete Value Pillars for Clients & Buyers (Clean Monochrome) */}
            <div className="pt-6 border-t border-zinc-200/80 dark:border-zinc-800">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs font-mono">
                <div>
                  <div className="text-zinc-400 dark:text-zinc-500 text-[10px] uppercase tracking-wider mb-1">PROVEN RECORD</div>
                  <div className="font-semibold text-zinc-950 dark:text-white text-base">16 Shipped Builds</div>
                  <div className="text-zinc-500 text-[11px] mt-0.5">Tested with real operators</div>
                </div>
                <div>
                  <div className="text-zinc-400 dark:text-zinc-500 text-[10px] uppercase tracking-wider mb-1">FAST VELOCITY</div>
                  <div className="font-semibold text-zinc-950 dark:text-white text-base">2 to 4 Weeks</div>
                  <div className="text-zinc-500 text-[11px] mt-0.5">Zero agency bloat</div>
                </div>
                <div>
                  <div className="text-zinc-400 dark:text-zinc-500 text-[10px] uppercase tracking-wider mb-1">BUILT FOR SCALE</div>
                  <div className="font-semibold text-zinc-950 dark:text-white text-base">Sub-10ms Latency</div>
                  <div className="text-zinc-500 text-[11px] mt-0.5">WASM & edge routes</div>
                </div>
                <div>
                  <div className="text-zinc-400 dark:text-zinc-500 text-[10px] uppercase tracking-wider mb-1">CLIENT OWNERSHIP</div>
                  <div className="font-semibold text-zinc-950 dark:text-white text-base">100% Sovereign IP</div>
                  <div className="text-zinc-500 text-[11px] mt-0.5">You own code & DB</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Engineer Profile & Systems Spotlight (5 cols) */}
          <div className="lg:col-span-5 w-full">
            <HeroOperationalPreview />
          </div>

        </div>
      </section>

      {/* SNEAK PEEK SHOWCASE ACROSS INDUSTRIES */}
      <ProjectsSneakPeekShowcase />

      {/* Tagline Reveal Section */}
      <TaglineReveal 
        phrase="I engineer custom production software for businesses that need to scale." 
        subphrase="High-speed restaurant tills. Garment factory inventory. Automated UPI checkouts. Designed, built, and launched in weeks." 
      />

      {/* Selected Work Section with Explorer */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider font-mono text-zinc-500 mb-1">
              02 / COMPLETE PORTFOLIO
            </div>
            <h2 className="font-display font-semibold text-2xl sm:text-3xl text-zinc-950 dark:text-white [text-wrap:balance]">
              All 16 shipped codebases.
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

      {/* Studio Capabilities / Focus Areas */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column Header */}
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-28">
            <div className="text-xs uppercase tracking-wider font-mono text-zinc-500">
              03 / DISCIPLINES & EXPERTISE
            </div>
            <h2 className="font-display font-semibold text-2xl sm:text-4xl text-zinc-950 dark:text-white [text-wrap:balance]">
              Engineering capabilities engineered for production.
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed [text-wrap:pretty]">
              I don&apos;t build static brochure sites or assemble bloated templates. Every system is engineered to handle edge speed, concurrency, payment compliance, and local-first reliability.
            </p>
            <div className="pt-2">
              <Link
                href="/services"
                className="btn-tactile inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-zinc-900 dark:text-white hover:underline"
              >
                <span>View all disciplines</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Column: Architectural Discipline Rows */}
          <div className="lg:col-span-7 divide-y divide-zinc-200/80 dark:divide-zinc-800 border-y border-zinc-200/80 dark:border-zinc-800">
            {studioCapabilities.map((cap) => (
              <Link
                key={cap.id}
                href={cap.href}
                className="group py-6 block transition-colors duration-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-zinc-400 dark:text-zinc-500 font-semibold">{cap.number}</span>
                      <h3 className="font-display font-semibold text-lg text-zinc-950 dark:text-white group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
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

                  <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors shrink-0 mt-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Engineering Philosophy: Editorial Manifesto */}
      <section className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="p-8 sm:p-12 rounded-2xl bg-zinc-50 dark:bg-[#111216] border border-zinc-200/80 dark:border-zinc-800">
          <div className="max-w-3xl space-y-4 mb-8">
            <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
              04 / ENGINEERING PRINCIPLES
            </div>
            <h2 className="font-display font-semibold text-2xl sm:text-4xl text-zinc-950 dark:text-white tracking-tight [text-wrap:balance]">
              Hardened systems. Built for operators.
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed [text-wrap:pretty]">
              Every codebase in TysonLabs was engineered to eliminate high-stakes operational friction, from sub-second restaurant billing under peak dining rushes to zero-waste garment marker calculation. No placeholder mockups, no generic templates, and no fabricated metrics.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-zinc-200/80 dark:border-zinc-800">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold font-mono text-zinc-950 dark:text-white">Daylight Contrast</h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed [text-wrap:pretty]">
                Interfaces built for operators under real lighting, optimized for keyboard shortcuts and sub-second execution.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold font-mono text-zinc-950 dark:text-white">Authentic Domain Logic</h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed [text-wrap:pretty]">
                GST tax split rules, FSSAI compliance badges, and fabric yield equations built right into the schema.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold font-mono text-zinc-950 dark:text-white">100% Client Ownership</h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed [text-wrap:pretty]">
                Self-hosted databases, clean codebases, and sovereign cloud deployments that run without recurring vendor rent.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold font-mono text-zinc-950 dark:text-white">End-to-End Delivery</h4>
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
        <div className="p-8 sm:p-12 rounded-2xl bg-zinc-950 text-white dark:bg-[#111216] border border-zinc-800 dark:border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              Zero Upfront Scoping Risk
            </div>
            <h2 className="font-display font-semibold text-2xl sm:text-3xl text-white [text-wrap:balance]">
              Have an operational system worth building?
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed [text-wrap:pretty]">
              Whether you need an offline-resilient point of sale till, an apparel manufacturing ERP, or an autonomous workflow engine, I build it with sovereign code ownership.
            </p>
            <div className="pt-1 text-xs font-mono text-zinc-500">
              Direct line to founding engineer · Complete IP transfer upon release
            </div>
          </div>
          <Link
            href="/contact"
            className="btn-tactile inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-black hover:bg-zinc-200 dark:bg-white dark:text-black font-semibold text-sm transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] whitespace-nowrap active:scale-[0.98]"
          >
            <span>Commission a System</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
