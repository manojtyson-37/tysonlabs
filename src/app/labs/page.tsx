import React from 'react';
import { Metadata } from 'next';
import { getApprovedProjects } from '@/data/projects';
import { ProjectCard } from '@/components/ProjectCard';
import { FlaskConical, Sparkles, Terminal, Cpu } from 'lucide-react';

export const metadata: Metadata = {
  title: 'TysonLabs · Labs & Experiments',
  description: 'Explorations in browser WebAssembly engines, autonomous multi-agent pipelines, and developer infrastructure.',
};

export default function LabsPage() {
  const allProjects = getApprovedProjects();
  // Filter for experiments, prototypes, AI systems, and developer tools
  const labProjects = allProjects.filter(
    (p) => p.category === 'experiments' || p.category === 'ai-agents' || p.category === 'developer-tools' || p.status === 'prototype'
  );

  return (
    <div className="max-w-6xl mx-auto px-6 sm:px-8 py-10 space-y-16">
      {/* Header */}
      <div className="space-y-4 max-w-2xl">
        <div className="text-xs uppercase tracking-wider font-semibold text-zinc-500 dark:text-[#64748B] font-mono flex items-center gap-2">
          <FlaskConical className="w-3.5 h-3.5" />
          <span>RESEARCH & PROTOTYPES</span>
        </div>
        <h1 className="font-display font-bold text-3xl sm:text-5xl text-zinc-950 dark:text-white tracking-tight">
          Labs & technical experiments.
        </h1>
        <p className="text-base text-zinc-600 dark:text-[#94A3B8] leading-relaxed">
          The proving ground for cutting-edge technologies before they graduate into production operating systems. Everything from Stockfish 18 WASM to multi-agent LLM coordination.
        </p>
      </div>

      {/* Lab Highlights Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-[#0F1116] border border-black/[0.08] dark:border-white/[0.08] space-y-3">
          <Cpu className="w-5 h-5 text-sky-500 dark:text-sky-400" />
          <h3 className="font-display font-bold text-base text-zinc-950 dark:text-white">Client WASM Engines</h3>
          <p className="text-xs text-zinc-600 dark:text-[#94A3B8] leading-relaxed">
            Running heavy computational engines like Stockfish 18 in client web workers with zero backend costs.
          </p>
        </div>
        <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-[#0F1116] border border-black/[0.08] dark:border-white/[0.08] space-y-3">
          <Terminal className="w-5 h-5 text-purple-500 dark:text-purple-400" />
          <h3 className="font-display font-bold text-base text-zinc-950 dark:text-white">Multi-Agent Pipelines</h3>
          <p className="text-xs text-zinc-600 dark:text-[#94A3B8] leading-relaxed">
            Chaining specialized research, script, voice, and visual AI agents with strict quality gates.
          </p>
        </div>
        <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-[#0F1116] border border-black/[0.08] dark:border-white/[0.08] space-y-3">
          <Sparkles className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
          <h3 className="font-display font-bold text-base text-zinc-950 dark:text-white">Token Compression</h3>
          <p className="text-xs text-zinc-600 dark:text-[#94A3B8] leading-relaxed">
            Headroom token compression achieving 60-90% token reduction across multi-turn agent runs.
          </p>
        </div>
      </div>

      {/* Lab Projects Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-black/[0.08] dark:border-white/[0.08]">
          <h2 className="font-display font-bold text-xl text-zinc-950 dark:text-white">
            Active Lab Builds
          </h2>
          <span className="text-xs font-mono text-zinc-500 dark:text-[#64748B]">
            {labProjects.length} Experiments
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {labProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </section>
    </div>
  );
}
