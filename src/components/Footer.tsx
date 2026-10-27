import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Mail, Globe } from 'lucide-react';
import { GithubIcon } from '@/components/Icons';

export function Footer() {
  const currentYear = 2026;

  return (
    <footer className="border-t border-[#30333B] bg-[#0C0D10] text-[#A6A8B3] mt-24">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-[#30333B]/60">
          {/* Col 1: Brand & Philosophy */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#15171C] border border-[#30333B] flex items-center justify-center font-display font-bold text-xs text-[#F4F3F8]">
                T
              </div>
              <span className="font-display font-bold text-lg text-[#F4F3F8] tracking-tight">
                TYSONLABS
              </span>
            </div>
            <p className="text-sm leading-relaxed text-[#A6A8B3] max-w-sm">
              An independent technology studio engineering digital products, websites, AI-driven workflows, and high-leverage business applications.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-[#717684]">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Available for select product builds & consulting</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-[#F4F3F8]">
              Studio
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/projects" className="hover:text-[#F4F3F8] transition-colors">
                  All Projects
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-[#F4F3F8] transition-colors">
                  Live Products
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-[#F4F3F8] transition-colors">
                  Services & Capabilities
                </Link>
              </li>
              <li>
                <Link href="/labs" className="hover:text-[#F4F3F8] transition-colors">
                  Labs & Experiments
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#F4F3F8] transition-colors">
                  About & Philosophy
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Direct Connect */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-semibold text-[#F4F3F8]">
              Verified Channels
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="https://github.com/manojtyson-37"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-[#B99AFF] transition-colors group"
                >
                  <GithubIcon className="w-4 h-4 text-[#717684] group-hover:text-[#B99AFF]" />
                  <span>github.com/manojtyson-37</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                </a>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 hover:text-[#B99AFF] transition-colors group"
                >
                  <Mail className="w-4 h-4 text-[#717684] group-hover:text-[#B99AFF]" />
                  <span>Start a project inquiry</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                </Link>
              </li>
              <li>
                <div className="inline-flex items-center gap-2 text-[#717684]">
                  <Globe className="w-4 h-4" />
                  <span>tysonlabs.dev</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#717684]">
          <p>© {currentYear} TysonLabs. All rights reserved. Sovereign software & independent craft.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-[#A6A8B3] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/projects" className="hover:text-[#A6A8B3] transition-colors">
              Index
            </Link>
            <a href="#top" className="hover:text-[#A6A8B3] transition-colors">
              Back to top ↑
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
