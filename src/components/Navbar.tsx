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
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'bg-[#0C0D10]/90 backdrop-blur-md border-b border-[#30333B]/80 py-3 shadow-lg shadow-black/30'
          : 'bg-transparent py-5 border-b border-white/[0.04]'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 sm:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B99AFF] rounded-md px-1 py-0.5"
          aria-label="TysonLabs Home"
        >
          <div className="w-8 h-8 rounded-lg bg-[#15171C] border border-[#30333B] flex items-center justify-center font-display font-bold text-sm text-[#F4F3F8] group-hover:border-[#B99AFF] group-hover:text-[#B99AFF] transition-colors">
            T
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-base tracking-tight text-[#F4F3F8] group-hover:text-white transition-colors">
              TYSONLABS
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-[#15171C]/70 border border-[#30333B] px-3 py-1.5 rounded-full shadow-inner shadow-black/20" aria-label="Main Navigation">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm px-3.5 py-1.5 rounded-full transition-all duration-150 font-medium ${
                  isActive
                    ? 'bg-[#30333B]/80 text-[#F4F3F8] shadow-sm'
                    : 'text-[#A6A8B3] hover:text-[#F4F3F8] hover:bg-white/[0.04]'
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
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg bg-[#15171C] text-[#F4F3F8] border border-[#30333B] hover:border-[#B99AFF] hover:text-[#B99AFF] transition-all duration-150 shadow-sm"
          >
            Get in touch
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg bg-[#15171C] border border-[#30333B] text-[#A6A8B3] hover:text-[#F4F3F8] focus:outline-none focus:ring-2 focus:ring-[#B99AFF]"
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0C0D10] border-b border-[#30333B] px-6 py-6 transition-all duration-200">
          <div className="flex flex-col gap-2">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-base px-4 py-3 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-[#15171C] text-[#B99AFF] border border-[#30333B]'
                      : 'text-[#A6A8B3] hover:text-[#F4F3F8] hover:bg-[#15171C]/50'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-4 mt-2 border-t border-[#30333B]">
              <Link
                href="/contact"
                className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold px-4 py-3 rounded-lg bg-[#B99AFF] text-[#0C0D10] hover:bg-[#CCAFFF] transition-colors"
              >
                Let&apos;s build together
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
