import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Mail, Globe } from 'lucide-react';
import { GithubIcon } from '@/components/Icons';
import { ThemeToggle } from '@/components/ThemeToggle';

export function Footer() {
  const currentYear = 2026;

  return (
    <footer className="border-t border-black/[0.08] dark:border-white/[0.08] bg-zinc-50 dark:bg-[#000000] text-zinc-600 dark:text-[#9B9B9B] mt-24 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-black/[0.06] dark:border-white/[0.06]">
          {/* Col 1: Brand & Philosophy */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-zinc-200 dark:bg-[#181818] border border-black/10 dark:border-white/[0.12] flex items-center justify-center font-mono font-bold text-xs text-black dark:text-white">
                T
              </div>
              <span className="font-display font-semibold text-base text-black dark:text-white tracking-tight">
                TYSONLABS
              </span>
            </div>
            <p className="text-xs leading-relaxed text-zinc-600 dark:text-[#9B9B9B] max-w-sm">
              An independent technology studio engineering digital products, vertical operating systems, and high leverage business applications.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-mono text-zinc-500 dark:text-[#666666]">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Available for select product builds and architectural sprints</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="md:col-span-3 space-y-3 font-mono text-xs">
            <h4 className="uppercase tracking-wider font-semibold text-black dark:text-white">
              Studio Index
            </h4>
            <ul className="space-y-2 text-zinc-600 dark:text-[#9B9B9B]">
              <li>
                <Link href="/projects" className="hover:text-black dark:hover:text-white transition-colors duration-200">
                  All Projects (#01 to 16)
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-black dark:hover:text-white transition-colors duration-200">
                  Live Deployments
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-black dark:hover:text-white transition-colors duration-200">
                  Services and Disciplines
                </Link>
              </li>
              <li>
                <Link href="/labs" className="hover:text-black dark:hover:text-white transition-colors duration-200">
                  Proving Grounds & Labs
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-black dark:hover:text-white transition-colors duration-200">
                  About and Doctrine
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Direct Connect */}
          <div className="md:col-span-4 space-y-3 font-mono text-xs">
            <h4 className="uppercase tracking-wider font-semibold text-black dark:text-white">
              Direct Channels
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="https://github.com/manojtyson-37"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-zinc-600 dark:text-[#9B9B9B] hover:text-black dark:hover:text-white transition-colors group"
                >
                  <GithubIcon className="w-3.5 h-3.5 text-zinc-500 dark:text-[#666666] group-hover:text-black dark:group-hover:text-white" />
                  <span>github.com/manojtyson-37</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                </a>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 text-zinc-600 dark:text-[#9B9B9B] hover:text-black dark:hover:text-white transition-colors group"
                >
                  <Mail className="w-3.5 h-3.5 text-zinc-500 dark:text-[#666666] group-hover:text-black dark:group-hover:text-white" />
                  <span>Start a project inquiry</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                </Link>
              </li>
              <li>
                <div className="inline-flex items-center gap-2 text-zinc-500 dark:text-[#666666]">
                  <Globe className="w-3.5 h-3.5" />
                  <span>tysonlabs.vercel.app · tysonlabs.in</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-500 dark:text-[#666666]">
          <p>© {currentYear} TysonLabs · Sovereign software and independent craft.</p>
          <div className="flex items-center gap-6">
            <ThemeToggle />
            <Link href="/privacy" className="hover:text-black dark:hover:text-[#9B9B9B] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/projects" className="hover:text-black dark:hover:text-[#9B9B9B] transition-colors">
              Directory
            </Link>
            <a href="#top" className="hover:text-black dark:hover:text-[#9B9B9B] transition-colors">
              Back to top ↑
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
