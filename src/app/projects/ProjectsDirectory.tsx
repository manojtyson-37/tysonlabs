'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ProjectCategory, ProjectStatus, CATEGORIES, STATUS_OPTIONS, getApprovedProjects } from '@/data/projects';
import { ProjectCard } from '@/components/ProjectCard';
import { Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

export function ProjectsDirectory() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read initial filters from URL params
  const initialQuery = searchParams.get('q') || '';
  const initialCategory = (searchParams.get('category') as ProjectCategory) || 'all';
  const initialStatus = (searchParams.get('status') as ProjectStatus) || 'all';
  const initialSort = searchParams.get('sort') || 'featured';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory>(initialCategory);
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus>(initialStatus);
  const [sortBy, setSortBy] = useState<string>(initialSort);

  const allProjects = useMemo(() => getApprovedProjects(), []);

  // Update URL search parameters when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (selectedStatus !== 'all') params.set('status', selectedStatus);
    if (sortBy !== 'featured') params.set('sort', sortBy);

    const queryString = params.toString();
    const targetUrl = queryString ? `/projects?${queryString}` : '/projects';
    router.replace(targetUrl, { scroll: false });
  }, [searchQuery, selectedCategory, selectedStatus, sortBy, router]);

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    return allProjects.filter((project) => {
      // Category match
      if (selectedCategory !== 'all' && project.category !== selectedCategory) {
        return false;
      }

      // Status match
      if (selectedStatus !== 'all' && project.status !== selectedStatus) {
        return false;
      }

      // Search query match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = project.name.toLowerCase().includes(query);
        const matchesDesc = project.shortDescription.toLowerCase().includes(query) || project.tagline.toLowerCase().includes(query);
        const matchesTech = project.techStack.some((tech) => tech.toLowerCase().includes(query));
        const matchesCategory = project.categoryLabel.toLowerCase().includes(query);

        if (!matchesName && !matchesDesc && !matchesTech && !matchesCategory) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'alphabetical') {
        return a.name.localeCompare(b.name);
      }
      // default: featured first, then by rank
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return a.rank - b.rank;
    });
  }, [allProjects, selectedCategory, selectedStatus, searchQuery, sortBy]);

  const handleReset = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSortBy('featured');
  };

  const hasActiveFilters = searchQuery.trim() !== '' || selectedCategory !== 'all' || selectedStatus !== 'all' || sortBy !== 'featured';

  return (
    <div className="space-y-8">
      {/* Control Bar: Search & Filters */}
      <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-[#0F1116] border border-black/[0.08] dark:border-white/[0.08] space-y-5 shadow-xs dark:shadow-xl dark:shadow-black/40">
        {/* Top Row: Search Input & Sort Selector */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 dark:text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects by name, industry, or features (e.g. Next.js, Restaurant POS, UPI, AI)..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white dark:bg-[#090A0D] border border-black/[0.08] dark:border-white/[0.08] text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-[#64748B] focus:outline-none focus:border-black/30 dark:focus:border-white/30 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 dark:text-[#64748B] dark:hover:text-white p-1"
                aria-label="Clear search input"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-zinc-500 dark:text-[#64748B] font-mono flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort:</span>
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white dark:bg-[#090A0D] border border-black/[0.08] dark:border-white/[0.08] text-xs text-zinc-900 dark:text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-black/30 dark:focus:border-white/30"
            >
              <option value="featured">Featured First</option>
              <option value="alphabetical">Alphabetical (A–Z)</option>
            </select>
          </div>
        </div>

        {/* Second Row: Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs text-zinc-500 dark:text-[#64748B] font-mono shrink-0 mr-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Category:</span>
          </span>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`btn-tactile text-xs px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-all duration-150 border ${
                  isSelected
                    ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white font-semibold shadow-xs'
                    : 'bg-white dark:bg-[#090A0D] text-zinc-600 dark:text-[#94A3B8] border-black/[0.08] dark:border-white/[0.08] hover:border-black/20 dark:hover:border-white/20 hover:text-black dark:hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Third Row: Lifecycle Status Pills */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-black/[0.06] dark:border-white/[0.06] text-xs">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 dark:text-[#64748B] font-mono mr-1">Lifecycle:</span>
            {STATUS_OPTIONS.map((status) => {
              const isSelected = selectedStatus === status.id;
              return (
                <button
                  key={status.id}
                  type="button"
                  onClick={() => setSelectedStatus(status.id)}
                  className={`btn-tactile px-2.5 py-1 rounded text-xs font-mono transition-colors border ${
                    isSelected
                      ? 'bg-black/[0.08] dark:bg-white/[0.12] text-zinc-900 dark:text-white border-black/20 dark:border-white/20 font-bold'
                      : 'bg-white dark:bg-[#090A0D] text-zinc-500 dark:text-[#64748B] border-black/[0.06] dark:border-white/[0.06] hover:text-zinc-900 dark:hover:text-[#94A3B8]'
                  }`}
                >
                  {status.label}
                </button>
              );
            })}
          </div>

          {/* Reset Filters Action */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="text-zinc-900 dark:text-white hover:underline font-mono text-xs flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Results Count Bar */}
      <div className="flex items-center justify-between text-xs font-mono text-zinc-500 dark:text-[#64748B] px-1">
        <div>
          Showing <span className="text-zinc-950 dark:text-white font-bold">{filteredProjects.length}</span> of {allProjects.length} sovereign builds
        </div>
        {hasActiveFilters && (
          <div className="text-amber-600 dark:text-amber-400">
            Active filters applied
          </div>
        )}
      </div>

      {/* Projects Grid or Empty State */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      ) : (
        <div className="p-12 sm:p-16 rounded-2xl bg-zinc-50 dark:bg-[#0F1116] border border-black/[0.08] dark:border-white/[0.08] text-center space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-full bg-white dark:bg-[#090A0D] border border-black/[0.08] dark:border-white/[0.08] mx-auto flex items-center justify-center text-zinc-500 dark:text-[#64748B]">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-xl text-zinc-950 dark:text-white">
            No matching projects found
          </h3>
          <p className="text-xs text-zinc-600 dark:text-[#94A3B8] leading-relaxed">
            We couldn&apos;t find any builds matching your criteria. Try loosening your search terms or clearing selected category filters.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="btn-tactile px-4 py-2 rounded-lg bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black text-xs font-semibold dark:hover:bg-zinc-200 transition-colors"
            >
              Reset all filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
