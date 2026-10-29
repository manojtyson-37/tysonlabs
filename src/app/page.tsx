import React from 'react';
import Link from 'next/link';
import { getFeaturedProjects } from '@/data/projects';
import { HomeProjectsExplorer } from '@/components/HomeProjectsExplorer';
import { FaqSection } from '@/components/FaqSection';
import { ArrowUpRight, ExternalLink } from 'lucide-react';
import { GithubIcon } from '@/components/Icons';

export default function HomePage() {
  const featuredProjects = getFeaturedProjects();

  const selectedShowcases = [
    {
      index: '01',
      vertical: 'Hospitality & Retail',
      name: 'DinePulse',
      subtitle: 'High-Throughput Restaurant Billing & Kitchen OS',
      story: 'Built for high-volume Indian restaurants. Replaces slow legacy POS machines with an ultra-fast 3-click touch till, instant KOT kitchen dispatch, FSSAI veg/non-veg compliance tags, dynamic UPI QR payments, and automated WhatsApp guest bills.',
      impact: ['3 Clicks to Bill', 'Real-Time KOT Dispatch', 'WhatsApp Receipts'],
      stack: ['Next.js 15', 'TypeScript', 'Tailwind CSS', 'ESC/POS', 'Razorpay UPI'],
      liveUrl: 'https://dineplus.vercel.app/pos',
      caseStudySlug: 'dinepulse',
      githubUrl: 'https://github.com/manoj-tyson/dinepulse',
    },
    {
      index: '02',
      vertical: 'Manufacturing & ERP',
      name: 'Silaa Atelier',
      subtitle: 'Apparel Factory Roll Inventory & Marker Yield Engine',
      story: 'Garment factories lose up to 12% of expensive fabric rolls to manual marker calculation errors and untracked remnants spread across WhatsApp chats. Built a production ERP that tracks fabric roll batches by dye lot, calculates cutting yields down to the millimeter, and monitors 500-garment stitching runs.',
      impact: ['99.2% Fabric Yield', 'Zero Lost Rolls', 'CNC DXF Export'],
      stack: ['FastAPI', 'Next.js 15', 'PostgreSQL', 'SQLAlchemy'],
      liveUrl: 'https://erp.silacollective.in/',
      caseStudySlug: 'silaa-atelier',
      githubUrl: 'https://github.com/manoj-tyson/silaa-erp',
    },
    {
      index: '03',
      vertical: 'Interactive AI & Systems',
      name: 'Tyson Chess',
      subtitle: 'In-Browser Stockfish 18 WASM Engine & Tactical Coach',
      story: 'I built this because I used to play on the chess.com app and solving more than 3 puzzles a day required paying ₹99 per week. So I thought: why not build it myself? Tyson Chess runs 100% free in the browser with unlimited puzzles, in-browser Stockfish 18 WASM, 6 calibrated bots, and a coach that explains moves in plain English.',
      impact: ['100% Free & Unlimited', 'Saves ₹99 / Week', 'Zero Server Latency'],
      stack: ['React', 'TypeScript', 'Stockfish 18 WASM', 'Web Workers', 'Tailwind CSS'],
      liveUrl: 'https://tysonchess-two.vercel.app',
      caseStudySlug: 'tysonchess',
      githubUrl: 'https://github.com/manoj-tyson/tyson-chess',
    },
    {
      index: '04',
      vertical: 'Fintech & Commerce',
      name: 'Tysonpe',
      subtitle: 'Creator Commerce Storefront & 1-Click Checkout Engine',
      story: 'Indian educators and creators lose 10–30% of their revenue to platform fees, while global checkout tools fail to support Indian UPI apps or automated Indian GST tax compliance. Built an independent creator platform with 1-click UPI payments (GPay, PhonePe, Paytm), automated GST tax invoice PDFs, and dynamic watermarked video protection.',
      impact: ['0% Middleman Take', '1-Click UPI Intent', 'Automated GST Tax PDFs'],
      stack: ['Next.js 15', 'TypeScript', 'Prisma', 'PostgreSQL', 'Razorpay UPI'],
      caseStudySlug: 'tysonpe',
      githubUrl: 'https://github.com/manoj-tyson/tysonpe',
    },
    {
      index: '05',
      vertical: 'Healthcare Operations',
      name: 'PhysioCare',
      subtitle: 'Multi-Tenant Clinic Management & Rehab Recovery Portal',
      story: 'Physical therapy practices juggle paper cards, Google Calendars, and separate billing tools, resulting in double bookings and unbilled rehab packages. Built an all-in-one clinic platform: clash-free room scheduling, patient mobility angle tracking (e.g. 115° knee recovery), automated GST invoices, and WhatsApp appointment reminders.',
      impact: ['Zero Double-Bookings', '+35% Re-Attendance', 'WhatsApp Reminders'],
      stack: ['Next.js 15', 'TypeScript', 'Supabase', 'Tailwind CSS', 'PostgreSQL'],
      liveUrl: 'https://saas-physio.vercel.app',
      caseStudySlug: 'physiocare',
      githubUrl: 'https://github.com/manoj-tyson/physiocare',
    },
  ];

  const studioCapabilities = [
    {
      number: '01',
      title: 'Autonomous Multi-Agent AI Workflows',
      description: 'Custom AI agent teams that automate complex business tasks like market research, code writing, and automated quality testing without hallucination.',
      highlight: 'Chief of Staff AI · Gemini Hospitality Copilot',
      href: '/projects?category=ai-agents',
    },
    {
      number: '02',
      title: 'High-Performance Web Apps & Interactive Systems',
      description: 'Zero-layout-shift web applications, responsive editorial storefronts, tactile consumer portals, and interactive browser tools.',
      highlight: 'ECHORA Luxury Boutique · Tyson AI Chess Coach',
      href: '/projects?category=web-experiences',
    },
    {
      number: '03',
      title: 'Vertical SaaS & Operations Operating Systems',
      description: 'High-throughput restaurant POS tills, apparel manufacturing ERPs, clinic management, and compliant Indian GST accounting engines.',
      highlight: 'DinePulse Till · Silaa Atelier ERP',
      href: '/projects?category=business-tools',
    },
    {
      number: '04',
      title: 'Specialized Business Tools & Proving Ground Labs',
      description: 'Interactive AI coaching algorithms, automated YouTube video synthesis pipelines, and developer telemetry toolkits.',
      highlight: 'Tyson AI Coach · Autonomous Video Pipeline',
      href: '/labs',
    },
  ];

  return (
    <div className="space-y-20 sm:space-y-32">
      {/* Clean Editorial Hero Section */}
      <section className="max-w-4xl mx-auto px-6 sm:px-8 pt-10 sm:pt-20 pb-4 space-y-6">
        <div className="text-xs font-mono uppercase tracking-wider text-zinc-500">
          Manoj Tyson · Software & Systems Engineer · Bangalore, IN
        </div>

        <h1 className="font-display font-semibold text-5xl sm:text-7xl md:text-8xl text-zinc-950 dark:text-white tracking-tight leading-[1.02] [text-wrap:balance]">
          Software built to run real businesses.
        </h1>

        <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal max-w-2xl [text-wrap:pretty]">
          I design, engineer, and ship full-stack web applications, compiled WebAssembly engines, and custom operating systems for operators and businesses that need to scale. Everything built end-to-end with 100% sovereign code ownership.
        </p>

        {/* Action Row */}
        <div className="flex flex-wrap items-center gap-4 pt-3">
          <a
            href="#selected-work"
            className="btn-tactile px-6 py-3.5 rounded-full bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-sm font-semibold transition-all shadow-sm active:scale-[0.98]"
          >
            <span>Selected Projects ↓</span>
          </a>

          <Link
            href="/use-cases"
            className="btn-tactile px-6 py-3.5 rounded-full border border-zinc-300 dark:border-zinc-700 hover:border-black dark:hover:border-white text-zinc-800 dark:text-zinc-200 text-sm font-semibold transition-all active:scale-[0.98]"
          >
            <span>Case Studies & Problems Solved ↗</span>
          </Link>
        </div>

        {/* Minimalist Social & Direct Contact Links */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-500 pt-2">
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
      </section>

      {/* Selected Work (Editorial Case Studies) */}
      <section id="selected-work" className="max-w-5xl mx-auto px-6 sm:px-8 space-y-12">
        <div className="space-y-2 pb-4 border-b border-zinc-200/80 dark:border-zinc-800">
          <div className="text-xs font-mono uppercase tracking-wider text-zinc-500">
            01 / SELECTED WORK & CASE STUDIES
          </div>
          <h2 className="font-display font-semibold text-3xl sm:text-4xl text-zinc-950 dark:text-white tracking-tight">
            Production systems engineered for operators.
          </h2>
        </div>

        <div className="space-y-12">
          {selectedShowcases.map((project) => (
            <article
              key={project.name}
              className="p-8 sm:p-10 rounded-2xl bg-zinc-50/70 dark:bg-[#111216] border border-zinc-200/90 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all space-y-6"
            >
              {/* Header: Index & Vertical */}
              <div className="flex items-center justify-between text-xs font-mono pb-4 border-b border-zinc-200/70 dark:border-zinc-800/70">
                <div className="flex items-center gap-2.5">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-200">
                    {project.index}
                  </span>
                  <span className="text-zinc-300 dark:text-zinc-700">/</span>
                  <span className="uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    {project.vertical}
                  </span>
                </div>
                <span className="text-zinc-500 text-[11px] uppercase tracking-wider">
                  Live System
                </span>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-1.5">
                <h3 className="font-display font-semibold text-2xl sm:text-3xl text-zinc-950 dark:text-white tracking-tight [text-wrap:balance]">
                  <Link href={`/projects/${project.caseStudySlug}`} className="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                    {project.name}
                  </Link>
                </h3>
                <p className="text-sm font-mono text-zinc-500 dark:text-zinc-400">
                  {project.subtitle}
                </p>
              </div>

              {/* The Narrative & Problem Solved */}
              <p className="text-base text-zinc-700 dark:text-zinc-300 leading-relaxed max-w-3xl [text-wrap:pretty]">
                {project.story}
              </p>

              {/* Measurable Outcomes */}
              <div className="flex flex-wrap gap-2.5 pt-1">
                {project.impact.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#16171E] border border-zinc-200/80 dark:border-zinc-800 text-xs font-mono text-zinc-800 dark:text-zinc-200"
                  >
                    {item}
                  </span>
                ))}
              </div>

              {/* Tech Stack Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {project.stack.map((tech) => (
                  <span
                    key={tech}
                    className="text-[11px] font-mono px-2.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200/60 dark:border-zinc-800"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Action Links */}
              <div className="pt-6 border-t border-zinc-200/70 dark:border-zinc-800/70 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
                <Link
                  href={`/projects/${project.caseStudySlug}`}
                  className="btn-tactile inline-flex items-center gap-1.5 text-zinc-800 dark:text-zinc-200 hover:text-black dark:hover:text-white font-semibold transition-colors"
                >
                  <span>Read full architecture monograph</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
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
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded text-zinc-400 hover:text-black dark:text-zinc-500 dark:hover:text-white transition-colors"
                      title="Inspect Source Code on GitHub"
                    >
                      <GithubIcon className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Complete Index of All 16 Projects */}
      <section className="max-w-5xl mx-auto px-6 sm:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-zinc-200/80 dark:border-zinc-800">
          <div>
            <div className="text-xs uppercase tracking-wider font-mono text-zinc-500 mb-1">
              02 / COMPLETE PORTFOLIO
            </div>
            <h2 className="font-display font-semibold text-3xl text-zinc-950 dark:text-white tracking-tight">
              All 16 shipped codebases.
            </h2>
          </div>
          <Link
            href="/projects"
            className="text-xs font-mono text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors inline-flex items-center gap-1"
          >
            <span>Explore directory</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <HomeProjectsExplorer initialProjects={featuredProjects} />
      </section>

      {/* Studio Capabilities / Disciplines */}
      <section className="max-w-5xl mx-auto px-6 sm:px-8 space-y-8">
        <div className="space-y-2 pb-4 border-b border-zinc-200/80 dark:border-zinc-800">
          <div className="text-xs uppercase tracking-wider font-mono text-zinc-500">
            03 / DISCIPLINES & EXPERTISE
          </div>
          <h2 className="font-display font-semibold text-3xl text-zinc-950 dark:text-white tracking-tight">
            Engineering capabilities.
          </h2>
        </div>

        <div className="divide-y divide-zinc-200/80 dark:divide-zinc-800 border-y border-zinc-200/80 dark:border-zinc-800">
          {studioCapabilities.map((cap) => (
            <Link
              key={cap.number}
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
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl [text-wrap:pretty]">
                    {cap.description}
                  </p>
                  <div className="text-xs font-mono text-zinc-500 pt-1">
                    Proven in: <span className="text-zinc-800 dark:text-zinc-300 font-medium">{cap.highlight}</span>
                  </div>
                </div>

                <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors shrink-0 mt-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <div className="max-w-5xl mx-auto px-6 sm:px-8">
        <FaqSection />
      </div>

      {/* Direct Inquiries & Contact Banner */}
      <section className="max-w-5xl mx-auto px-6 sm:px-8 pb-16">
        <div className="p-8 sm:p-12 rounded-2xl bg-zinc-950 text-white dark:bg-[#111216] border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-2 max-w-xl">
            <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              WORK DIRECTLY WITH MANOJ
            </div>
            <h2 className="font-display font-semibold text-2xl sm:text-3xl text-white [text-wrap:balance]">
              Have a system worth building?
            </h2>
            <p className="text-sm text-zinc-400 leading-relaxed [text-wrap:pretty]">
              Whether you need an offline-resilient point of sale till, an apparel manufacturing ERP, or an autonomous workflow engine, I build it with 100% sovereign code ownership.
            </p>
          </div>
          <Link
            href="/contact"
            className="btn-tactile inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white text-black hover:bg-zinc-200 font-semibold text-sm transition-all whitespace-nowrap active:scale-[0.98]"
          >
            <span>Get in touch</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
