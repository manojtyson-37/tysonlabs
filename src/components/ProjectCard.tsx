import React from 'react';
import Link from 'next/link';
import { Project } from '@/data/projects';
import { ProjectGraphic } from '@/components/ProjectGraphic';
import { ExternalLink, ChevronRight } from 'lucide-react';
import { GithubIcon } from '@/components/Icons';

interface ProjectCardProps {
  project: Project;
  featured?: boolean;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const isLive = project.status === 'live';

  return (
    <article className="group bg-[#181818] border border-white/[0.08] hover:border-white/[0.2] rounded-2xl overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] flex flex-col justify-between hover:shadow-2xl hover:shadow-black/70">
      <div>
        {/* Card Header: Index & Status */}
        <div className="px-5 py-3 border-b border-white/[0.06] flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-[#666666] font-light">#{String(project.rank).padStart(2, '0')}</span>
            <span className="text-[#666666]">/</span>
            <span className="uppercase tracking-wider text-[#9B9B9B] text-[11px] font-medium">
              {project.categoryLabel}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
            <span className={`text-[10px] uppercase font-semibold ${isLive ? 'text-emerald-400' : 'text-amber-400'}`}>
              {project.statusLabel}
            </span>
          </div>
        </div>

        {/* Technical System Architecture Blueprint */}
        <Link href={`/projects/${project.slug}`} className="block focus-visible:outline-none" tabIndex={-1}>
          <ProjectGraphic slug={project.slug} name={project.name} category={project.categoryLabel} />
        </Link>

        {/* Card Body */}
        <div className="p-5 space-y-3">
          <h3 className="font-display font-semibold text-lg text-white group-hover:text-white transition-colors [text-wrap:balance]">
            <Link
              href={`/projects/${project.slug}`}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
            >
              {project.name}
            </Link>
          </h3>

          <p className="text-xs text-[#9B9B9B] leading-relaxed line-clamp-2 [text-wrap:pretty]">
            {project.shortDescription}
          </p>

          {/* Tech Stack Pills */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {project.techStack.slice(0, 3).map((tech) => (
              <span
                key={tech}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#000000] text-[#9B9B9B] border border-white/[0.06]"
              >
                {tech}
              </span>
            ))}
            {project.techStack.length > 3 && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 text-[#666666]">
                +{project.techStack.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="px-5 py-3 border-t border-white/[0.06] bg-[#1F1F1F]/50 flex items-center justify-between text-xs">
        <Link
          href={`/projects/${project.slug}`}
          className="btn-tactile inline-flex items-center gap-1 text-white hover:text-[#9B9B9B] font-mono text-[11px] font-semibold transition-colors active:scale-[0.98]"
        >
          <span>Case Study</span>
          <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>

        <div className="flex items-center gap-2">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-tactile inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#272727] border border-white/[0.08] text-emerald-400 hover:text-white hover:bg-emerald-600 transition-all text-[11px] font-mono active:scale-[0.98]"
              title="Launch Live Application"
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
              className="p-1 rounded text-[#666666] hover:text-white hover:bg-white/[0.05] transition-colors"
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
