import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-28 text-center space-y-6">
      <div className="font-mono text-xs text-[#64748B] tracking-widest uppercase font-semibold">
        Error 404 · Unresolved Node
      </div>
      <h1 className="font-display font-extrabold text-4xl sm:text-6xl text-white tracking-tight">
        Page not found.
      </h1>
      <p className="text-sm text-[#94A3B8] max-w-md mx-auto leading-relaxed">
        The requested build or route does not exist in the TysonLabs sovereign registry or may have been moved.
      </p>
      <div className="pt-4 flex items-center justify-center gap-3">
        <Link
          href="/"
          className="btn-tactile inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-black font-bold text-xs hover:bg-zinc-200 transition-colors active:scale-[0.98]"
        >
          <Home className="w-4 h-4" />
          <span>Studio Home</span>
        </Link>
        <Link
          href="/projects"
          className="btn-tactile inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0F1116] text-white border border-white/[0.1] font-semibold text-xs hover:border-white/30 transition-colors active:scale-[0.98]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Projects</span>
        </Link>
      </div>
    </div>
  );
}
