'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Project } from '@/data/projects';
import { ProjectGraphic } from '@/components/ProjectGraphic';
import { GithubIcon } from '@/components/Icons';
import { 
  ArrowUpRight, 
  ExternalLink, 
  Flame, 
  Layers, 
  Cpu, 
  Bot, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

interface HomeProjectsExplorerProps {
  initialProjects: Project[];
}

type FilterTag = 'all' | 'live' | 'ai' | 'industry' | 'wasm';

export function HomeProjectsExplorer({ initialProjects }: HomeProjectsExplorerProps) {
  const [activeFilter, setActiveFilter] = useState<FilterTag>('all');

  const filteredProjects = initialProjects.filter((p) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'live') return p.status === 'live';
    if (activeFilter === 'ai') return p.category === 'ai-agents' || p.techStack.some(t => t.toLowerCase().includes('agent') || t.toLowerCase().includes('gemini') || t.toLowerCase().includes('claude'));
    if (activeFilter === 'industry') return p.category === 'business-tools' || p.category === 'saas-cloud';
    if (activeFilter === 'wasm') return p.slug === 'tysonchess' || p.techStack.some(t => t.toLowerCase().includes('wasm'));
    return true;
  });

  const filterTabs: { id: FilterTag; label: string; count: number }[] = [
    { id: 'all', label: 'All Flagships', count: initialProjects.length },
    { id: 'live', label: 'Live Products', count: initialProjects.filter(p => p.status === 'live').length },
    { id: 'industry', label: 'Industry & POS', count: initialProjects.filter(p => p.category === 'business-tools' || p.category === 'saas-cloud').length },
    { id: 'ai', label: 'AI & Agents', count: initialProjects.filter(p => p.category === 'ai-agents' || p.techStack.some(t => t.toLowerCase().includes('agent') || t.toLowerCase().includes('gemini'))).length },
    { id: 'wasm', label: 'Labs & WASM', count: initialProjects.filter(p => p.slug === 'tysonchess').length },
  ];

  return (
    <div className="space-y-8">
      {/* Interactive Filter Pill Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-2 border-b border-[#242731]">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`btn-tactile inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  isActive
                    ? 'bg-white text-zinc-950 font-bold shadow-md shadow-white/10'
                    : 'bg-[#121419] text-[#9FA2B0] border border-[#242731] hover:text-white hover:border-[#3E4351]'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded ${
                  isActive ? 'bg-zinc-200 text-zinc-950' : 'bg-[#1C1F28] text-[#717684]'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-[#B99AFF] hover:text-white transition-colors"
        >
          <span>Explore all 16 projects</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <article 
            key={project.slug} 
            className="group bg-[#121419] border border-[#242731] hover:border-[#4B5263] rounded-xl overflow-hidden transition-all duration-200 flex flex-col justify-between hover:shadow-2xl hover:shadow-black/60"
          >
            <div>
              {/* Graphic Header */}
              <Link href={`/projects/${project.slug}`} className="block focus-visible:outline-none" tabIndex={-1}>
                <ProjectGraphic slug={project.slug} name={project.name} category={project.categoryLabel} />
              </Link>

              {/* Card Body */}
              <div className="p-6">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-[#8C90A0] font-mono">
                    {project.categoryLabel}
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                    project.status === 'live' 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  }`}>
                    {project.statusLabel}
                  </span>
                </div>

                <h3 className="font-display font-bold text-xl text-[#F4F3F8] group-hover:text-white transition-colors mb-2">
                  <Link href={`/projects/${project.slug}`} className="focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white rounded">
                    {project.name}
                  </Link>
                </h3>

                <p className="text-sm text-[#9FA2B0] leading-relaxed line-clamp-2 mb-4">
                  {project.shortDescription}
                </p>

                {/* Tech Stack Pills */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {project.techStack.slice(0, 4).map((tech) => (
                    <span
                      key={tech}
                      className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#0A0B0E] text-[#9FA2B0] border border-[#242731]"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.techStack.length > 4 && (
                    <span className="text-[11px] font-mono px-1.5 py-0.5 text-[#6C707E]">
                      +{project.techStack.length - 4}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Footer with High-Contrast Action Triggers */}
            <div className="px-6 py-4 border-t border-[#242731] bg-[#0E1015] flex items-center justify-between text-xs font-medium">
              <Link
                href={`/projects/${project.slug}`}
                className="btn-tactile inline-flex items-center gap-1.5 text-white hover:text-[#B99AFF] font-semibold transition-colors"
              >
                <span>Case Study</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <div className="flex items-center gap-2">
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-tactile inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#181B22] border border-[#2B2F3A] text-emerald-400 hover:text-white hover:bg-emerald-600 hover:border-emerald-500 font-mono text-[11px] transition-all"
                    title="Open Live Application"
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
                    className="p-1.5 rounded text-[#717684] hover:text-white hover:bg-[#181B22] transition-colors"
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
    </div>
  );
}
