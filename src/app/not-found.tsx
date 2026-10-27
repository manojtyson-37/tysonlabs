import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-24 text-center space-y-6">
      <div className="font-mono text-xs text-[#B99AFF] tracking-widest uppercase font-semibold">
        Error 404
      </div>
      <h1 className="font-display font-extrabold text-4xl sm:text-6xl text-[#F4F3F8] tracking-tight">
        Page not found.
      </h1>
      <p className="text-base text-[#A6A8B3] max-w-md mx-auto leading-relaxed">
        The requested build or route does not exist in the TysonLabs registry or may have been archived.
      </p>
      <div className="pt-4 flex items-center justify-center gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#B99AFF] text-[#0C0D10] font-bold text-xs hover:bg-[#CCAFFF] transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Studio Home</span>
        </Link>
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#15171C] text-[#F4F3F8] border border-[#30333B] font-semibold text-xs hover:border-[#B99AFF] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Projects</span>
        </Link>
      </div>
    </div>
  );
}
