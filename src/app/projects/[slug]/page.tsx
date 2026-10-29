import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { getProjectBySlug, getApprovedProjects, getRelatedProjects } from '@/data/projects';
import { ProjectGraphic } from '@/components/ProjectGraphic';
import { ProjectCard } from '@/components/ProjectCard';
import {
  ArrowLeft,
  ArrowUpRight,
  ExternalLink,
  Clock,
} from 'lucide-react';
import { GithubIcon } from '@/components/Icons';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const projects = getApprovedProjects();
  return projects.map((p) => ({
    slug: p.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return {
      title: 'Project Not Found | TysonLabs',
    };
  }

  return {
    title: `${project.name} · Architecture & Case Study`,
    description: project.shortDescription,
    openGraph: {
      title: `${project.name} · TysonLabs`,
      description: project.shortDescription,
      url: `https://tysonlabs.in/projects/${project.slug}`,
    },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const related = getRelatedProjects(project.slug, 3);
  const caseStudy = project.caseStudy;

  const statusBadgeClass = {
    live: 'badge-live',
    'open-source': 'badge-open-source',
    prototype: 'badge-prototype',
    'in-progress': 'badge-in-progress',
    archived: 'text-zinc-500 bg-zinc-800/20 border-zinc-700/30',
  }[project.status] || 'badge-prototype';

  return (
    <div className="max-w-4xl mx-auto px-6 sm:px-8 py-10 space-y-16">
      {/* Back to Catalogue */}
      <div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-xs font-mono text-zinc-500 hover:text-zinc-900 dark:text-[#64748B] dark:hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to software directory</span>
        </Link>
      </div>

      {/* Project Header */}
      <header className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs uppercase tracking-wider font-semibold text-zinc-600 dark:text-[#94A3B8] font-mono">
            {project.categoryLabel}
          </span>
          <span className="text-zinc-300 dark:text-white/20">·</span>
          <span className={`text-xs font-mono font-medium px-2.5 py-0.5 rounded-full border ${statusBadgeClass}`}>
            {project.statusLabel}
          </span>
          {project.badge && (
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-[#0F1116] text-zinc-900 dark:text-white border border-black/10 dark:border-white/10">
              {project.badge}
            </span>
          )}
        </div>

        <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-zinc-950 dark:text-white tracking-tight leading-[1.1]">
          {project.name}
        </h1>

        <p className="text-base sm:text-lg text-zinc-600 dark:text-[#94A3B8] leading-relaxed max-w-2xl font-normal">
          {project.tagline}
        </p>

        {/* Action Buttons Row */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-tactile inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black font-semibold text-sm dark:hover:bg-zinc-200 transition-colors shadow-xs active:scale-[0.98]"
            >
              <span>Launch Live Product</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          {project.demoUrl && !project.liveUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-tactile inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black font-semibold text-sm dark:hover:bg-zinc-200 transition-colors active:scale-[0.98]"
            >
              <span>Try Interactive Demo</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          {project.sourceUrl && (
            <a
              href={project.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-tactile inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-100 dark:bg-[#0F1116] text-zinc-900 dark:text-white border border-black/[0.1] dark:border-white/[0.1] font-semibold text-sm hover:border-black/30 dark:hover:border-white/30 transition-colors active:scale-[0.98]"
            >
              <GithubIcon className="w-4 h-4" />
              <span>Inspect Public Code</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Tech Stack Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-black/[0.06] dark:border-white/[0.06]">
          <span className="text-xs font-mono text-zinc-500 dark:text-[#64748B] mr-1">Stack:</span>
          {project.techStack.map((tech) => (
            <span
              key={tech}
              className="text-xs font-mono px-2.5 py-1 rounded bg-zinc-100 dark:bg-[#090A0D] text-zinc-700 dark:text-[#94A3B8] border border-black/[0.08] dark:border-white/[0.08]"
            >
              {tech}
            </span>
          ))}
        </div>
      </header>

      {/* Hero Visual Card */}
      <section className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] overflow-hidden bg-zinc-100 dark:bg-[#0D0F14] shadow-sm dark:shadow-2xl">
        <ProjectGraphic
          slug={project.slug}
          name={project.name}
          category={project.categoryLabel}
          className="min-h-[280px] sm:min-h-[340px]"
        />
        <div className="p-4 bg-zinc-50 dark:bg-[#090A0D] border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between text-xs font-mono text-zinc-500 dark:text-[#64748B]">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Verified Status: {project.lastVerified}</span>
          </span>
          <span>Zero employer conflicts · Independent IP</span>
        </div>
      </section>

      {/* Prominent Business Use Case & Operational Impact Section */}
      {project.businessUseCase && (
        <section className="p-6 sm:p-8 rounded-2xl bg-zinc-50 dark:bg-[#0F1116] border border-black/[0.08] dark:border-white/[0.08] space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-black/[0.08] dark:border-white/[0.08]">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block mb-1">
                BUSINESS OPERATIONAL CONTEXT
              </span>
              <h2 className="font-display font-bold text-xl sm:text-2xl text-zinc-950 dark:text-white">
                Why I built this & what it solved
              </h2>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-white dark:bg-[#1A1D24] text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-white/10 font-medium">
              Vertical: {project.businessUseCase.targetIndustry}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Why Built (The Catalyst) */}
            <div className="p-5 rounded-xl bg-white dark:bg-[#14161C] border border-zinc-200 dark:border-zinc-800 space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-400 block">
                The Origin & Why I Built It
              </span>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed [text-wrap:pretty]">
                {project.businessUseCase.whyBuilt}
              </p>
            </div>

            {/* What Was Solved */}
            <div className="p-5 rounded-xl bg-white dark:bg-[#14161C] border border-zinc-200 dark:border-zinc-800 space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-400 block">
                The Core Problem Solved
              </span>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed [text-wrap:pretty]">
                {project.businessUseCase.problemSolved}
              </p>
            </div>
          </div>

          {/* Measured Real-World Business Impact */}
          <div className="pt-2">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold text-zinc-500 dark:text-zinc-400 block mb-3">
              Measurable Business Impact:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {project.businessUseCase.businessImpact.map((impact, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-white dark:bg-[#14161C] border border-zinc-200/80 dark:border-zinc-800 text-xs font-mono text-zinc-800 dark:text-zinc-200"
                >
                  {impact}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Case Study or Extended Breakdown */}
      {caseStudy ? (
        <div className="space-y-14">
          {/* Section: Overview & Context */}
          <section className="space-y-4">
            <h2 className="font-display font-bold text-2xl text-zinc-950 dark:text-white">
              Overview & Problem Space
            </h2>
            <div className="prose dark:prose-invert max-w-none text-zinc-600 dark:text-[#94A3B8] text-base leading-relaxed space-y-4">
              <p>{caseStudy.overview}</p>
              <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-[#111216] border border-zinc-200/80 dark:border-zinc-800 space-y-3">
                <div className="text-xs uppercase font-mono tracking-wider font-semibold text-zinc-500">
                  The Operational Friction:
                </div>
                <p className="text-sm text-zinc-800 dark:text-zinc-300">
                  {caseStudy.problem}
                </p>
                <div className="text-xs uppercase font-mono tracking-wider font-semibold text-zinc-950 dark:text-white pt-2">
                  Target Operator:
                </div>
                <p className="text-sm text-zinc-800 dark:text-zinc-300">
                  {caseStudy.targetAudience}
                </p>
              </div>
            </div>
          </section>

          {/* Section: The Solution & Role */}
          <section className="space-y-4">
            <h2 className="font-display font-bold text-2xl text-zinc-950 dark:text-white">
              The Solution & Contribution
            </h2>
            <p className="text-zinc-600 dark:text-[#94A3B8] text-base leading-relaxed">
              {caseStudy.solution}
            </p>
            <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-[#111216] border border-zinc-200/80 dark:border-zinc-800 space-y-2">
              <div className="text-xs uppercase font-mono tracking-wider font-semibold text-zinc-500">
                Direct Responsibility & Engineering Role:
              </div>
              <p className="text-sm text-zinc-800 dark:text-zinc-200">
                {caseStudy.myRole}
              </p>
            </div>
          </section>

          {/* Section: Technical Architecture */}
          <section className="space-y-6">
            <h2 className="font-display font-bold text-2xl text-zinc-950 dark:text-white">
              Technical Architecture
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {caseStudy.architecture.frontend && (
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-[#0F1116] border border-black/[0.08] dark:border-white/[0.08] space-y-1">
                  <div className="text-xs font-mono text-zinc-500 dark:text-[#64748B] uppercase">Frontend Layer</div>
                  <div className="text-sm text-zinc-950 dark:text-white font-medium">{caseStudy.architecture.frontend}</div>
                </div>
              )}
              {caseStudy.architecture.backend && (
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-[#0F1116] border border-black/[0.08] dark:border-white/[0.08] space-y-1">
                  <div className="text-xs font-mono text-zinc-500 dark:text-[#64748B] uppercase">Backend & Routing</div>
                  <div className="text-sm text-zinc-950 dark:text-white font-medium">{caseStudy.architecture.backend}</div>
                </div>
              )}
              {caseStudy.architecture.database && (
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-[#0F1116] border border-black/[0.08] dark:border-white/[0.08] space-y-1">
                  <div className="text-xs font-mono text-zinc-500 dark:text-[#64748B] uppercase">Data Model & Storage</div>
                  <div className="text-sm text-zinc-950 dark:text-white font-medium">{caseStudy.architecture.database}</div>
                </div>
              )}
              {caseStudy.architecture.payments && (
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-[#0F1116] border border-black/[0.08] dark:border-white/[0.08] space-y-1">
                  <div className="text-xs font-mono text-zinc-500 dark:text-[#64748B] uppercase">Fintech & Checkout</div>
                  <div className="text-sm text-zinc-950 dark:text-white font-medium">{caseStudy.architecture.payments}</div>
                </div>
              )}
              {caseStudy.architecture.ai && (
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-[#0F1116] border border-black/[0.08] dark:border-white/[0.08] space-y-1">
                  <div className="text-xs font-mono text-zinc-500 dark:text-[#64748B] uppercase">AI & Heuristics</div>
                  <div className="text-sm text-zinc-950 dark:text-white font-medium">{caseStudy.architecture.ai}</div>
                </div>
              )}
              {caseStudy.architecture.deployment && (
                <div className="p-4 rounded-xl bg-zinc-50 dark:bg-[#0F1116] border border-black/[0.08] dark:border-white/[0.08] space-y-1">
                  <div className="text-xs font-mono text-zinc-500 dark:text-[#64748B] uppercase">Infra & Edge</div>
                  <div className="text-sm text-zinc-950 dark:text-white font-medium">{caseStudy.architecture.deployment}</div>
                </div>
              )}
            </div>
          </section>

          {/* Section: Key Features */}
          <section className="space-y-6">
            <h2 className="font-display font-bold text-2xl text-zinc-950 dark:text-white">
              Key Features & Capabilities
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {caseStudy.keyFeatures.map((feat, idx) => (
                <div key={idx} className="p-5 rounded-xl bg-zinc-50 dark:bg-[#0F1116] border border-black/[0.08] dark:border-white/[0.08] space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-base text-zinc-950 dark:text-white">{feat.title}</h3>
                    {feat.tag && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-200/70 dark:bg-[#090A0D] text-zinc-700 dark:text-[#94A3B8] border border-black/[0.08] dark:border-white/[0.08]">
                        {feat.tag}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-[#94A3B8] leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Section: Engineering Decisions & Lessons */}
          <section className="space-y-6">
            <h2 className="font-display font-bold text-2xl text-zinc-950 dark:text-white">
              Engineering Decisions & Insights
            </h2>
            <div className="space-y-3">
              {caseStudy.engineeringDecisions.map((dec, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-zinc-50 dark:bg-[#111216] border border-zinc-200/80 dark:border-zinc-800">
                  <span className="text-xs font-mono font-bold text-zinc-400 shrink-0 mt-0.5">#{String(idx + 1).padStart(2, '0')}</span>
                  <p className="text-sm text-zinc-800 dark:text-zinc-300 leading-relaxed">{dec}</p>
                </div>
              ))}
              {caseStudy.challengesAndLessons.map((les, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-zinc-50 dark:bg-[#111216] border border-zinc-200/80 dark:border-zinc-800">
                  <span className="text-xs font-mono font-bold text-zinc-400 shrink-0 mt-0.5">L{idx + 1}</span>
                  <p className="text-sm text-zinc-800 dark:text-zinc-300 leading-relaxed">{les}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section: Verifiable Metrics if available */}
          {caseStudy.metrics && caseStudy.metrics.length > 0 && (
            <section className="p-6 sm:p-8 rounded-2xl bg-zinc-50 dark:bg-[#0F1116] border border-black/[0.08] dark:border-white/[0.08] space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-[#64748B] font-semibold">
                Operational Benchmarks
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {caseStudy.metrics.map((metric, idx) => (
                  <div key={idx}>
                    <div className="font-display font-extrabold text-2xl sm:text-3xl text-zinc-950 dark:text-white">
                      {metric.value}
                    </div>
                    <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300 mt-1">{metric.label}</div>
                    {metric.note && <div className="text-[11px] text-zinc-500 dark:text-[#64748B] mt-0.5 font-mono">{metric.note}</div>}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        /* Shorter Detail View for Experiments / Utilities */
        <div className="space-y-8">
          <section className="p-6 rounded-2xl bg-zinc-50 dark:bg-[#0F1116] border border-black/[0.08] dark:border-white/[0.08] space-y-4">
            <h2 className="font-display font-bold text-xl text-zinc-950 dark:text-white">
              About this Build
            </h2>
            <p className="text-sm text-zinc-600 dark:text-[#94A3B8] leading-relaxed">
              {project.detailedDescription}
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="font-display font-bold text-lg text-zinc-950 dark:text-white">
              Core Highlights
            </h3>
            <div className="space-y-2">
              {project.highlights.map((h, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-[#111216] border border-zinc-200/80 dark:border-zinc-800">
                  <span className="text-xs font-mono text-zinc-400 shrink-0 mt-0.5">•</span>
                  <span className="text-xs text-zinc-800 dark:text-zinc-300">{h}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Related Projects Section */}
      {related.length > 0 && (
        <section className="pt-12 border-t border-black/[0.08] dark:border-white/[0.08] space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-2xl text-zinc-950 dark:text-white">
              Related Systems
            </h2>
            <Link href="/projects" className="text-xs font-mono text-zinc-600 hover:text-zinc-950 dark:text-[#94A3B8] dark:hover:text-white transition-colors">
              View all 16 builds →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.map((rel) => (
              <ProjectCard key={rel.slug} project={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
