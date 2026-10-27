import React from 'react';
import Link from 'next/link';
import { Project } from '@/data/projects';
import { ProjectGraphic } from '@/components/ProjectGraphic';
import { ArrowUpRight, ExternalLink } from 'lucide-react';
import { GithubIcon } from '@/components/Icons';

interface ProjectCardProps {
  project: Project;
  featured?: boolean;
}

export function ProjectCard({ project, featured = false }: ProjectCardProps) {
  const statusBadgeClass = {
    'live': 'badge-live',
    'open-source': 'badge-open-source',
    'prototype': 'badge-prototype',
    'in-progress': 'badge-in-progress',
    'archived': 'text-zinc-500 bg-zinc-800/20 border-zinc-700/30'
  }[project.status] || 'badge-prototype';

  return (
    <article className="group bg-[#15171C] border border-[#30333B] hover:border-[#484D58] rounded-xl overflow-hidden transition-all duration-200 flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-black/40">
      <div>
        {/* Project Visual / Diagram Header */}
        <Link href={`/projects/${project.slug}`} className="block focus-visible:outline-none" tabIndex={-1}>
          <ProjectGraphic slug={project.slug} name={project.name} category={project.categoryLabel} />
        </Link>

        {/* Card Body */}
        <div className="p-6">
          {/* Category & Status Row */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs uppercase tracking-wider font-semibold text-[#A6A8B3] font-mono">
              {project.categoryLabel}
            </span>
            <span className={`text-[11px] font-mono font-medium px-2 py-0.5 rounded-full border ${statusBadgeClass}`}>
              {project.statusLabel}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-display font-bold text-xl text-[#F4F3F8] group-hover:text-white transition-colors mb-2">
            <Link
              href={`/projects/${project.slug}`}
              className="focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#B99AFF] rounded"
            >
              {project.name}
            </Link>
          </h3>

          {/* Tagline / Short description */}
          <p className="text-sm text-[#A6A8B3] leading-relaxed line-clamp-2 mb-4">
            {project.shortDescription}
          </p>

          {/* Tech Stack Pills */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {project.techStack.slice(0, 4).map((tech) => (
              <span
                key={tech}
                className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#0C0D10] text-[#A6A8B3] border border-[#30333B]/60"
              >
                {tech}
              </span>
            ))}
            {project.techStack.length > 4 && (
              <span className="text-[11px] font-mono px-1.5 py-0.5 text-[#717684]">
                +{project.techStack.length - 4}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="px-6 py-4 border-t border-[#30333B]/70 bg-[#121419] flex items-center justify-between text-xs font-medium">
        <Link
          href={`/projects/${project.slug}`}
          className="inline-flex items-center gap-1.5 text-[#F4F3F8] hover:text-[#B99AFF] transition-colors font-semibold"
        >
          <span>View Case Study</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>

        {/* External Quick Links */}
        <div className="flex items-center gap-3">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#717684] hover:text-[#10B981] transition-colors p-1"
              title="Open Live Product"
              aria-label={`Open live demo for ${project.name}`}
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          {project.sourceUrl && (
            <a
              href={project.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#717684] hover:text-[#F4F3F8] transition-colors p-1"
              title="Inspect Source Code on GitHub"
              aria-label={`View GitHub repository for ${project.name}`}
            >
              <GithubIcon className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
