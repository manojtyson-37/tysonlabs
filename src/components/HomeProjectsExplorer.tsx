'use client';

import React, { useState } from 'react';
import { Project } from '@/data/projects';
import { ProjectCard } from '@/components/ProjectCard';

interface HomeProjectsExplorerProps {
  initialProjects: Project[];
}

type FilterTag = 'all' | 'live' | 'business' | 'ai' | 'interactive';

export function HomeProjectsExplorer({ initialProjects }: HomeProjectsExplorerProps) {
  const [activeFilter, setActiveFilter] = useState<FilterTag>('all');

  const filteredProjects = initialProjects.filter((p) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'live') return p.status === 'live';
    if (activeFilter === 'business') return p.category === 'business-tools' || p.category === 'saas-cloud';
    if (activeFilter === 'ai') return p.category === 'ai-agents' || p.techStack.some(t => t.toLowerCase().includes('agent') || t.toLowerCase().includes('gemini') || t.toLowerCase().includes('ai'));
    if (activeFilter === 'interactive') return p.category === 'web-experiences' || p.slug === 'tysonchess' || p.slug === 'expense-manager';
    return true;
  });

  const filterTabs: { id: FilterTag; label: string; count: number }[] = [
    { id: 'all', label: 'All 16 Codebases', count: initialProjects.length },
    { id: 'live', label: 'Live Deployments', count: initialProjects.filter(p => p.status === 'live').length },
    { id: 'business', label: 'Business & Operations OS', count: initialProjects.filter(p => p.category === 'business-tools' || p.category === 'saas-cloud').length },
    { id: 'ai', label: 'AI & Smart Workflows', count: initialProjects.filter(p => p.category === 'ai-agents' || p.techStack.some(t => t.toLowerCase().includes('agent') || t.toLowerCase().includes('gemini') || t.toLowerCase().includes('ai'))).length },
    { id: 'interactive', label: 'Interactive Consumer Apps', count: initialProjects.filter(p => p.category === 'web-experiences' || p.slug === 'tysonchess' || p.slug === 'expense-manager').length },
  ];

  return (
    <div className="space-y-6">
      {/* Minimalist Filter Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-2 border-b border-zinc-200/80 dark:border-zinc-800">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`btn-tactile inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all duration-200 active:scale-[0.98] ${
                  isActive
                    ? 'bg-black text-white dark:bg-white dark:text-black font-semibold shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200/80 dark:border-zinc-800 hover:text-black dark:hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                  isActive ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-black font-bold' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
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
