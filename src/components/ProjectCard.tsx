import React from 'react';
import Link from 'next/link';
import { Project } from '@/data/projects';
import { ProjectGraphic } from '@/components/ProjectGraphic';
import { ExternalLink, ArrowUpRight } from 'lucide-react';
import { GithubIcon } from '@/components/Icons';

interface ProjectCardProps {
  project: Project;
  featured?: boolean;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const isLive = project.status === 'live';

  return (
    <article className="group bg-white dark:bg-[#15171E] border border-zinc-200/90 dark:border-white/[0.08] hover:border-zinc-300 dark:hover:border-white/[0.2] rounded-2xl overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] flex flex-col justify-between shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_24px_-6px_rgba(0,0,0,0.08)] dark:hover:shadow-black/70">
      <div>
        {/* Top Graphical UI Snapshot (Bespoke Product Screen Preview) */}
        <Link 
          href={`/projects/${project.slug}`} 
          className="block focus-visible:outline-none border-b border-zinc-100 dark:border-white/[0.06] overflow-hidden" 
          tabIndex={-1}
        >
          <ProjectGraphic slug={project.slug} name={project.name} category={project.categoryLabel} />
        </Link>

        {/* Card Body */}
        <div className="p-5 space-y-3">
          {/* Index & Category Metadata */}
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 text-[11px]">
              <span className="font-semibold text-zinc-900 dark:text-zinc-200">#{String(project.rank).padStart(2, '0')}</span>
              <span>·</span>
              <span className="uppercase tracking-wider font-medium">{project.categoryLabel}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-500' : 'bg-sky-500'}`}></span>
              <span className={`text-[10px] uppercase font-semibold ${isLive ? 'text-emerald-700 dark:text-emerald-400' : 'text-sky-700 dark:text-sky-400'}`}>
                {project.statusLabel}
              </span>
            </div>
          </div>

          {/* Project Title */}
          <h3 className="font-display font-bold text-lg text-zinc-950 dark:text-white transition-colors [text-wrap:balance]">
            <Link
              href={`/projects/${project.slug}`}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-white rounded inline-flex items-center gap-1 group-hover:text-zinc-700 dark:group-hover:text-zinc-200"
            >
              <span>{project.name}</span>
            </Link>
          </h3>

          {/* Concrete Outcome Description */}
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-2 [text-wrap:pretty]">
            {project.shortDescription}
          </p>

          {/* Tech Stack Badges */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {project.techStack.slice(0, 3).map((tech) => (
              <span
                key={tech}
                className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-[#0B0D11] text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-white/[0.06]"
              >
                {tech}
              </span>
            ))}
            {project.techStack.length > 3 && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 text-zinc-400 dark:text-zinc-500">
                +{project.techStack.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="px-5 py-3 border-t border-zinc-100 dark:border-white/[0.06] bg-zinc-50/70 dark:bg-[#111318]/60 flex items-center justify-between text-xs">
        <Link
          href={`/projects/${project.slug}`}
          className="btn-tactile inline-flex items-center gap-1 text-zinc-900 dark:text-white hover:text-zinc-600 dark:hover:text-zinc-300 font-mono text-[11px] font-semibold transition-colors active:scale-[0.98]"
        >
          <span>Architecture & Case Study</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>

        <div className="flex items-center gap-2">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-tactile inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 hover:text-white hover:bg-emerald-600 dark:hover:bg-emerald-600 transition-all text-[11px] font-mono font-semibold active:scale-[0.98]"
              title="Launch Live Production App"
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
              className="p-1 rounded text-zinc-400 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.05] transition-colors"
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
