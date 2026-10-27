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
  CheckCircle2,
  Cpu,
  Layers,
  ShieldCheck,
  AlertCircle,
  Clock,
  Sparkles,
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
      url: `https://tysonlabs.dev/projects/${project.slug}`,
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
          className="inline-flex items-center gap-2 text-xs font-mono text-[#A6A8B3] hover:text-[#B99AFF] transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to all projects</span>
        </Link>
      </div>

      {/* Project Header */}
      <header className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs uppercase tracking-wider font-semibold text-[#A6A8B3] font-mono">
            {project.categoryLabel}
          </span>
          <span className="text-[#30333B]">·</span>
          <span className={`text-xs font-mono font-medium px-2.5 py-0.5 rounded-full border ${statusBadgeClass}`}>
            {project.statusLabel}
          </span>
          {project.badge && (
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#30333B]/70 text-[#F4F3F8] border border-white/10">
              {project.badge}
            </span>
          )}
        </div>

        <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-[#F4F3F8] tracking-tight leading-[1.1]">
          {project.name}
        </h1>

        <p className="text-lg text-[#A6A8B3] leading-relaxed max-w-2xl font-normal">
          {project.tagline}
        </p>

        {/* Action Buttons Row */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#B99AFF] text-[#0C0D10] font-semibold text-sm hover:bg-[#CCAFFF] transition-colors shadow-sm"
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
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#B99AFF] text-[#0C0D10] font-semibold text-sm hover:bg-[#CCAFFF] transition-colors"
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
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#15171C] text-[#F4F3F8] border border-[#30333B] font-semibold text-sm hover:border-[#B99AFF] hover:text-[#B99AFF] transition-colors"
            >
              <GithubIcon className="w-4 h-4" />
              <span>Inspect Public Code</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        {/* Tech Stack Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#30333B]/60">
          <span className="text-xs font-mono text-[#717684] mr-1">Stack:</span>
          {project.techStack.map((tech) => (
            <span
              key={tech}
              className="text-xs font-mono px-2.5 py-1 rounded bg-[#15171C] text-[#F4F3F8] border border-[#30333B]"
            >
              {tech}
            </span>
          ))}
        </div>
      </header>

      {/* Hero Visual Card */}
      <section className="rounded-2xl border border-[#30333B] overflow-hidden bg-[#15171C] shadow-2xl">
        <ProjectGraphic
          slug={project.slug}
          name={project.name}
          category={project.categoryLabel}
          className="min-h-[280px] sm:min-h-[340px]"
        />
        <div className="p-4 bg-[#101216] border-t border-[#30333B] flex items-center justify-between text-xs font-mono text-[#717684]">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Verified Status: {project.lastVerified}</span>
          </span>
          <span>Zero employer conflicts · Independent IP</span>
        </div>
      </section>

      {/* Case Study or Extended Breakdown */}
      {caseStudy ? (
        <div className="space-y-14">
          {/* Section: Overview & Context */}
          <section className="space-y-4">
            <h2 className="font-display font-bold text-2xl text-[#F4F3F8]">
              Overview & Problem Space
            </h2>
            <div className="prose prose-invert max-w-none text-[#A6A8B3] text-base leading-relaxed space-y-4">
              <p>{caseStudy.overview}</p>
              <div className="p-5 rounded-xl bg-[#15171C] border border-[#30333B] space-y-3">
                <div className="text-xs uppercase font-mono tracking-wider font-semibold text-rose-400">
                  The Friction:
                </div>
                <p className="text-sm text-zinc-300">
                  {caseStudy.problem}
                </p>
                <div className="text-xs uppercase font-mono tracking-wider font-semibold text-[#B99AFF] pt-2">
                  Target Operator:
                </div>
                <p className="text-sm text-zinc-300">
                  {caseStudy.targetAudience}
                </p>
              </div>
            </div>
          </section>

          {/* Section: The Solution & Role */}
          <section className="space-y-4">
            <h2 className="font-display font-bold text-2xl text-[#F4F3F8]">
              The Solution & Contribution
            </h2>
            <p className="text-[#A6A8B3] text-base leading-relaxed">
              {caseStudy.solution}
            </p>
            <div className="p-5 rounded-xl bg-[#15171C] border border-[#30333B] space-y-2">
              <div className="text-xs uppercase font-mono tracking-wider font-semibold text-emerald-400">
                Direct Responsibility & Engineering Role:
              </div>
              <p className="text-sm text-zinc-200">
                {caseStudy.myRole}
              </p>
            </div>
          </section>

          {/* Section: Technical Architecture */}
          <section className="space-y-6">
            <h2 className="font-display font-bold text-2xl text-[#F4F3F8]">
              Technical Architecture
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {caseStudy.architecture.frontend && (
                <div className="p-4 rounded-xl bg-[#15171C] border border-[#30333B] space-y-1">
                  <div className="text-xs font-mono text-[#717684] uppercase">Frontend Layer</div>
                  <div className="text-sm text-[#F4F3F8] font-medium">{caseStudy.architecture.frontend}</div>
                </div>
              )}
              {caseStudy.architecture.backend && (
                <div className="p-4 rounded-xl bg-[#15171C] border border-[#30333B] space-y-1">
                  <div className="text-xs font-mono text-[#717684] uppercase">Backend & Routing</div>
                  <div className="text-sm text-[#F4F3F8] font-medium">{caseStudy.architecture.backend}</div>
                </div>
              )}
              {caseStudy.architecture.database && (
                <div className="p-4 rounded-xl bg-[#15171C] border border-[#30333B] space-y-1">
                  <div className="text-xs font-mono text-[#717684] uppercase">Data Model & Storage</div>
                  <div className="text-sm text-[#F4F3F8] font-medium">{caseStudy.architecture.database}</div>
                </div>
              )}
              {caseStudy.architecture.payments && (
                <div className="p-4 rounded-xl bg-[#15171C] border border-[#30333B] space-y-1">
                  <div className="text-xs font-mono text-[#717684] uppercase">Fintech & Checkout</div>
                  <div className="text-sm text-[#F4F3F8] font-medium">{caseStudy.architecture.payments}</div>
                </div>
              )}
              {caseStudy.architecture.ai && (
                <div className="p-4 rounded-xl bg-[#15171C] border border-[#30333B] space-y-1">
                  <div className="text-xs font-mono text-[#717684] uppercase">AI & Heuristics</div>
                  <div className="text-sm text-[#F4F3F8] font-medium">{caseStudy.architecture.ai}</div>
                </div>
              )}
              {caseStudy.architecture.deployment && (
                <div className="p-4 rounded-xl bg-[#15171C] border border-[#30333B] space-y-1">
                  <div className="text-xs font-mono text-[#717684] uppercase">Infra & Edge</div>
                  <div className="text-sm text-[#F4F3F8] font-medium">{caseStudy.architecture.deployment}</div>
                </div>
              )}
            </div>
          </section>

          {/* Section: Key Features */}
          <section className="space-y-6">
            <h2 className="font-display font-bold text-2xl text-[#F4F3F8]">
              Key Features & Capabilities
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {caseStudy.keyFeatures.map((feat, idx) => (
                <div key={idx} className="p-5 rounded-xl bg-[#15171C] border border-[#30333B] space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-bold text-base text-[#F4F3F8]">{feat.title}</h3>
                    {feat.tag && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0C0D10] text-[#B99AFF] border border-[#30333B]">
                        {feat.tag}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#A6A8B3] leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Section: Engineering Decisions & Lessons */}
          <section className="space-y-6">
            <h2 className="font-display font-bold text-2xl text-[#F4F3F8]">
              Engineering Decisions & Insights
            </h2>
            <div className="space-y-3">
              {caseStudy.engineeringDecisions.map((dec, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-[#15171C] border border-[#30333B]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-zinc-300 leading-relaxed">{dec}</p>
                </div>
              ))}
              {caseStudy.challengesAndLessons.map((les, idx) => (
                <div key={idx} className="flex items-start gap-3 p-4 rounded-xl bg-[#15171C] border border-[#30333B]">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-zinc-300 leading-relaxed">{les}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section: Verifiable Metrics if available */}
          {caseStudy.metrics && caseStudy.metrics.length > 0 && (
            <section className="p-6 rounded-xl bg-gradient-to-b from-[#15171C] to-[#0E1015] border border-[#30333B] space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-wider text-[#B99AFF] font-semibold">
                Operational Benchmarks
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {caseStudy.metrics.map((metric, idx) => (
                  <div key={idx}>
                    <div className="font-display font-extrabold text-2xl sm:text-3xl text-[#F4F3F8]">
                      {metric.value}
                    </div>
                    <div className="text-xs font-medium text-zinc-300 mt-1">{metric.label}</div>
                    {metric.note && <div className="text-[11px] text-[#717684] mt-0.5 font-mono">{metric.note}</div>}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        /* Shorter Detail View for Experiments / Utilities */
        <div className="space-y-8">
          <section className="p-6 rounded-xl bg-[#15171C] border border-[#30333B] space-y-4">
            <h2 className="font-display font-bold text-xl text-[#F4F3F8]">
              About this Build
            </h2>
            <p className="text-sm text-[#A6A8B3] leading-relaxed">
              {project.detailedDescription}
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="font-display font-bold text-lg text-[#F4F3F8]">
              Core Highlights
            </h3>
            <div className="space-y-2">
              {project.highlights.map((h, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-[#15171C] border border-[#30333B]">
                  <CheckCircle2 className="w-4 h-4 text-[#B99AFF] shrink-0 mt-0.5" />
                  <span className="text-xs text-zinc-300">{h}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Related Projects Section */}
      {related.length > 0 && (
        <section className="pt-12 border-t border-[#30333B]/60 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-2xl text-[#F4F3F8]">
              Related Projects
            </h2>
            <Link href="/projects" className="text-xs font-mono text-[#B99AFF] hover:underline">
              View directory →
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
