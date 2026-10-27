import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Mail, Globe } from 'lucide-react';
import { GithubIcon } from '@/components/Icons';

export function Footer() {
  const currentYear = 2026;

  return (
    <footer className="border-t border-white/[0.08] bg-[#07080B] text-[#94A3B8] mt-24">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-white/[0.06]">
          {/* Col 1: Brand & Philosophy */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-[#12151C] border border-white/[0.12] flex items-center justify-center font-mono font-bold text-xs text-white">
                T
              </div>
              <span className="font-display font-bold text-base text-white tracking-tight">
                TYSONLABS
              </span>
            </div>
            <p className="text-xs leading-relaxed text-[#94A3B8] max-w-sm">
              An independent technology studio engineering digital products, vertical operating systems, AI-driven workflows, and high-leverage business applications.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-mono text-[#64748B]">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Available for select product builds & architectural sprints</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="md:col-span-3 space-y-3 font-mono text-xs">
            <h4 className="uppercase tracking-wider font-semibold text-white">
              Studio Index
            </h4>
            <ul className="space-y-2 text-[#94A3B8]">
              <li>
                <Link href="/projects" className="hover:text-white transition-colors">
                  All Projects (#01–16)
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  Live Deployments
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Services & Disciplines
                </Link>
              </li>
              <li>
                <Link href="/labs" className="hover:text-white transition-colors">
                  Labs & WASM
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About & Doctrine
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Direct Connect */}
          <div className="md:col-span-4 space-y-3 font-mono text-xs">
            <h4 className="uppercase tracking-wider font-semibold text-white">
              Direct Channels
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="https://github.com/manojtyson-37"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#94A3B8] hover:text-white transition-colors group"
                >
                  <GithubIcon className="w-3.5 h-3.5 text-[#64748B] group-hover:text-white" />
                  <span>github.com/manojtyson-37</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                </a>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 text-[#94A3B8] hover:text-white transition-colors group"
                >
                  <Mail className="w-3.5 h-3.5 text-[#64748B] group-hover:text-white" />
                  <span>Start a project inquiry</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                </Link>
              </li>
              <li>
                <div className="inline-flex items-center gap-2 text-[#64748B]">
                  <Globe className="w-3.5 h-3.5" />
                  <span>tysonlabs.vercel.app · tysonlabs.in</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#64748B]">
          <p>© {currentYear} TysonLabs · Sovereign software & independent craft.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-[#94A3B8] transition-colors">
              Privacy
            </Link>
            <Link href="/projects" className="hover:text-[#94A3B8] transition-colors">
              Directory
            </Link>
            <a href="#top" className="hover:text-[#94A3B8] transition-colors">
              Back to top ↑
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
