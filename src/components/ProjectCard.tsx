import React from 'react';
import Link from 'next/link';
import { Project } from '@/data/projects';
import { ExternalLink, ArrowUpRight } from 'lucide-react';
import { GithubIcon } from '@/components/Icons';

interface ProjectCardProps {
  project: Project;
  featured?: boolean;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const isLive = project.status === 'live';
  const uc = project.businessUseCase;

  return (
    <article className="group bg-white dark:bg-[#111216] border border-zinc-200/90 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 rounded-2xl p-6 sm:p-7 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] flex flex-col justify-between shadow-xs hover:shadow-md">
      <div className="space-y-4">
        {/* Header Metadata */}
        <div className="flex items-center justify-between text-xs font-mono pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 text-[11px]">
            <span className="font-semibold text-zinc-900 dark:text-zinc-200">
              #{String(project.rank).padStart(2, '0')}
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">/</span>
            <span className="uppercase tracking-wider">{project.categoryLabel}</span>
          </div>

          <div className="text-[10px] uppercase font-mono text-zinc-500 dark:text-zinc-400">
            {isLive ? 'Live in Production' : project.statusLabel}
          </div>
        </div>

        {/* Project Title & Tagline */}
        <div className="space-y-1.5">
          <h3 className="font-display font-semibold text-xl text-zinc-950 dark:text-white transition-colors [text-wrap:balance]">
            <Link
              href={`/projects/${project.slug}`}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-white rounded inline-flex items-center gap-1 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
            >
              <span>{project.name}</span>
            </Link>
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
            {project.tagline}
          </p>
        </div>

        {/* Outcome-Driven Description */}
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed [text-wrap:pretty]">
          {project.shortDescription}
        </p>

        {/* Measurable Impact Chip (Understated Editorial) */}
        {uc?.businessImpact && uc.businessImpact.length > 0 && (
          <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800 text-xs font-mono text-zinc-700 dark:text-zinc-300">
            {uc.businessImpact.slice(0, 2).join(' · ')}
          </div>
        )}

        {/* Tech Stack Chips */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {project.techStack.slice(0, 4).map((tech) => (
            <span
              key={tech}
              className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-800"
            >
              {tech}
            </span>
          ))}
          {project.techStack.length > 4 && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 text-zinc-400 dark:text-zinc-500">
              +{project.techStack.length - 4}
            </span>
          )}
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="pt-6 mt-6 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-mono">
        <Link
          href={`/projects/${project.slug}`}
          className="btn-tactile inline-flex items-center gap-1 text-zinc-800 dark:text-zinc-200 hover:text-black dark:hover:text-white font-semibold transition-colors active:scale-[0.98]"
        >
          <span>Case Study</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>

        <div className="flex items-center gap-2">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-tactile inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-colors font-semibold active:scale-[0.98]"
              title="Launch Live App"
            >
              <span>Launch</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {project.sourceUrl && (
            <a
              href={project.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded text-zinc-400 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-white transition-colors"
              title="Inspect Source Code on GitHub"
            >
              <GithubIcon className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
