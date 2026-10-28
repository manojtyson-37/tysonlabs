'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Project } from '@/data/projects';
import { ProjectCard } from '@/components/ProjectCard';
import { ArrowUpRight } from 'lucide-react';

interface HomeProjectsExplorerProps {
  initialProjects: Project[];
}

type FilterTag = 'all' | 'live' | 'industry' | 'ai' | 'wasm';

export function HomeProjectsExplorer({ initialProjects }: HomeProjectsExplorerProps) {
  const [activeFilter, setActiveFilter] = useState<FilterTag>('all');

  const filteredProjects = initialProjects.filter((p) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'live') return p.status === 'live';
    if (activeFilter === 'industry') return p.category === 'business-tools' || p.category === 'saas-cloud';
    if (activeFilter === 'ai') return p.category === 'ai-agents' || p.techStack.some(t => t.toLowerCase().includes('agent') || t.toLowerCase().includes('gemini'));
    if (activeFilter === 'wasm') return p.slug === 'tysonchess' || p.techStack.some(t => t.toLowerCase().includes('wasm'));
    return true;
  });

  const filterTabs: { id: FilterTag; label: string; count: number }[] = [
    { id: 'all', label: 'All Flagships', count: initialProjects.length },
    { id: 'live', label: 'Live Deployments', count: initialProjects.filter(p => p.status === 'live').length },
    { id: 'industry', label: 'Industry OS & POS', count: initialProjects.filter(p => p.category === 'business-tools' || p.category === 'saas-cloud').length },
    { id: 'ai', label: 'AI & Copilots', count: initialProjects.filter(p => p.category === 'ai-agents' || p.techStack.some(t => t.toLowerCase().includes('agent') || t.toLowerCase().includes('gemini'))).length },
    { id: 'wasm', label: 'WASM & Systems', count: initialProjects.filter(p => p.slug === 'tysonchess').length },
  ];

  return (
    <div className="space-y-6">
      {/* Minimalist Filter Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`btn-tactile inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] ${
                  isActive
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'bg-[#181818] text-[#9B9B9B] border border-white/[0.08] hover:text-white hover:border-white/[0.2]'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                  isActive ? 'bg-zinc-200 text-black font-bold' : 'bg-[#272727] text-[#666666]'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </div>
  );
}
