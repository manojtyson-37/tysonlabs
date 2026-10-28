'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

const NAV_ITEMS = [
  { label: 'Projects', href: '/projects' },
  { label: 'Products', href: '/products' },
  { label: 'Services', href: '/services' },
  { label: 'About', href: '/about' },
  { label: 'Labs', href: '/labs' },
  { label: 'Contact', href: '/contact' },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pt-3 sm:pt-4 px-4 sm:px-6 pointer-events-none">
      <div className="max-w-5xl mx-auto flex items-center justify-between pointer-events-auto bg-white/85 dark:bg-[#181818]/85 backdrop-blur-md border border-black/[0.08] dark:border-white/[0.08] px-4 py-2 sm:px-5 sm:py-2.5 rounded-full shadow-lg dark:shadow-2xl dark:shadow-black/80 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-full px-1 py-0.5"
          aria-label="TysonLabs Home"
        >
          <div className="w-7 h-7 rounded-full bg-zinc-100 dark:bg-[#1F1F1F] border border-black/10 dark:border-white/[0.12] flex items-center justify-center font-mono font-bold text-xs text-black dark:text-white group-hover:border-black/30 dark:group-hover:border-white/40 transition-colors">
            T
          </div>
          <span className="font-display font-semibold text-sm tracking-tight text-black dark:text-white transition-colors">
            TYSONLABS
          </span>
          <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        </Link>

        {/* Desktop Navigation */}
        <nav
          className="hidden md:flex items-center gap-1 bg-zinc-100/80 dark:bg-[#1F1F1F]/60 border border-black/[0.06] dark:border-white/[0.06] px-2 py-1 rounded-full"
          aria-label="Main Navigation"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-xs px-3.5 py-1.5 rounded-full transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] font-medium ${
                  isActive
                    ? 'bg-black text-white dark:bg-white dark:text-black font-semibold shadow-sm'
                    : 'text-zinc-600 hover:text-black hover:bg-black/[0.04] dark:text-[#9B9B9B] dark:hover:text-white dark:hover:bg-white/[0.06]'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions: Theme Toggle + CTA */}
        <div className="hidden md:flex items-center gap-2.5">
          <ThemeToggle />
          <Link
            href="/contact"
            className="btn-tactile inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] shadow-sm active:scale-[0.98]"
          >
            <span>Get in touch</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile Actions */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-full bg-zinc-100 dark:bg-[#1F1F1F] border border-black/10 dark:border-white/[0.08] text-zinc-700 dark:text-[#9B9B9B] hover:text-black dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Full Height Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[68px] bg-white/95 dark:bg-[#000000]/95 backdrop-blur-xl border-t border-black/[0.08] dark:border-white/[0.08] px-6 py-8 pointer-events-auto flex flex-col justify-between z-40 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]">
          <div className="flex flex-col gap-2">
            {NAV_ITEMS.map((item, idx) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ animationDelay: `${idx * 50}ms` }}
                  className={`text-base px-4 py-3 rounded-xl font-medium transition-colors ${
                    isActive
                      ? 'bg-zinc-100 text-black border border-black/10 dark:bg-[#181818] dark:text-white dark:border-white/[0.12]'
                      : 'text-zinc-600 hover:text-black hover:bg-black/[0.04] dark:text-[#9B9B9B] dark:hover:text-white dark:hover:bg-white/[0.04]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="pt-6 border-t border-black/[0.08] dark:border-white/[0.08] space-y-3">
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold px-4 py-3.5 rounded-xl bg-black text-white dark:bg-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-lg active:scale-[0.98]"
            >
              Start a project inquiry
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
