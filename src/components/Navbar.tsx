'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowUpRight } from 'lucide-react';

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

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pt-3 sm:pt-4 px-4 sm:px-6 pointer-events-none">
      <div className="max-w-5xl mx-auto flex items-center justify-between pointer-events-auto bg-[#181818]/85 backdrop-blur-md border border-white/[0.08] px-4 py-2 sm:px-5 sm:py-2.5 rounded-full shadow-2xl shadow-black/80 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-full px-1 py-0.5"
          aria-label="TysonLabs Home"
        >
          <div className="w-7 h-7 rounded-full bg-[#1F1F1F] border border-white/[0.12] flex items-center justify-center font-mono font-bold text-xs text-white group-hover:border-white/40 transition-colors">
            T
          </div>
          <span className="font-display font-semibold text-sm tracking-tight text-white group-hover:text-zinc-200 transition-colors">
            TYSONLABS
          </span>
          <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
        </Link>

        {/* Desktop Navigation */}
        <nav
          className="hidden md:flex items-center gap-1 bg-[#1F1F1F]/60 border border-white/[0.06] px-2 py-1 rounded-full"
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
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'text-[#9B9B9B] hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/contact"
            className="btn-tactile inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-full bg-white text-black hover:bg-zinc-200 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] shadow-sm active:scale-[0.98]"
          >
            <span>Get in touch</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-full bg-[#1F1F1F] border border-white/[0.08] text-[#9B9B9B] hover:text-white focus:outline-none focus:ring-2 focus:ring-white transition-colors"
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Full Height Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[68px] bg-[#000000]/95 backdrop-blur-xl border-t border-white/[0.08] px-6 py-8 pointer-events-auto flex flex-col justify-between z-40 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]">
          <div className="flex flex-col gap-2">
            {NAV_ITEMS.map((item, idx) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{ animationDelay: `${idx * 50}ms` }}
                  className={`text-base px-4 py-3 rounded-xl font-medium transition-colors ${
                    isActive
                      ? 'bg-[#181818] text-white border border-white/[0.12]'
                      : 'text-[#9B9B9B] hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="pt-6 border-t border-white/[0.08]">
            <Link
              href="/contact"
              className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold px-4 py-3.5 rounded-xl bg-white text-black hover:bg-zinc-200 transition-colors shadow-lg active:scale-[0.98]"
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
