import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { ProjectsDirectory } from './ProjectsDirectory';

export const metadata: Metadata = {
  title: 'All Projects & Systems · Software Directory',
  description: 'Complete index of sovereign software projects, products, AI tools, and technical architectures built by TysonLabs.',
};

export default function ProjectsPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 sm:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="space-y-3 max-w-2xl">
        <div className="text-xs uppercase tracking-wider font-semibold text-zinc-500 dark:text-[#64748B] font-mono">
          SOFTWARE CATALOGUE (#01–16)
        </div>
        <h1 className="font-display font-bold text-3xl sm:text-5xl text-zinc-950 dark:text-white tracking-tight">
          A collection of things worth building.
        </h1>
        <p className="text-base text-zinc-600 dark:text-[#94A3B8] leading-relaxed">
          Every project listed below has been verified for independent ownership, authentic implementation, and zero employer conflicts. Filter by domain category or search by technology.
        </p>
      </div>

      {/* Directory Wrapper in Suspense for useSearchParams */}
      <Suspense fallback={
        <div className="p-12 text-center text-xs font-mono text-zinc-500 dark:text-[#64748B]">
          Loading directory filters...
        </div>
      }>
        <ProjectsDirectory />
      </Suspense>
    </div>
  );
}
