'use client';

import React from 'react';
import { 
  Cpu, 
  ArrowRight, 
  Activity, 
  ShieldCheck, 
  GitBranch, 
  Server,
  FileCode2,
  Workflow
} from 'lucide-react';

interface ProjectGraphicProps {
  slug: string;
  name?: string;
  category?: string;
  className?: string;
}

export function ProjectGraphic({ slug, className = '' }: ProjectGraphicProps) {
  // Common architectural canvas container
  const containerStyle = `w-full h-44 bg-zinc-100/90 dark:bg-[#0B0D11] p-4 flex flex-col justify-between border-b border-black/[0.06] dark:border-white/[0.06] relative overflow-hidden group-hover:bg-zinc-200/60 dark:group-hover:bg-[#0E1015] transition-colors ${className}`;

  switch (slug) {
    case 'dinepulse':
      return (
        <div className={containerStyle}>
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-600 dark:text-[#64748B]">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
              SYSTEM TOPOLOGY
            </span>
            <span>12ms TTFB · EDGE</span>
          </div>

          {/* Architecture Node Diagram */}
          <div className="flex items-center justify-between gap-1 text-[11px] font-mono py-2">
            <div className="px-2 py-1.5 rounded bg-white dark:bg-[#13161C] border border-black/[0.08] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 text-center flex-1 shadow-xs">
              <div className="text-[9px] text-zinc-500 dark:text-[#64748B]">CLIENT</div>
              <div className="font-semibold text-zinc-900 dark:text-white">Till #01</div>
            </div>
            <ArrowRight className="w-3 h-3 text-zinc-400 dark:text-[#64748B] shrink-0" />
            <div className="px-2 py-1.5 rounded bg-white dark:bg-[#13161C] border border-black/[0.08] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 text-center flex-1 shadow-xs">
              <div className="text-[9px] text-zinc-500 dark:text-[#64748B]">ROUTER</div>
              <div className="font-semibold text-zinc-900 dark:text-white">KOT Bus</div>
            </div>
            <ArrowRight className="w-3 h-3 text-zinc-400 dark:text-[#64748B] shrink-0" />
            <div className="px-2 py-1.5 rounded bg-white dark:bg-[#13161C] border border-black/[0.08] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 text-center flex-1 shadow-xs">
              <div className="text-[9px] text-zinc-500 dark:text-[#64748B]">TAX ENGINE</div>
              <div className="font-semibold text-emerald-600 dark:text-emerald-400">GST Split</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 dark:text-[#64748B] pt-1 border-t border-black/[0.06] dark:border-white/[0.04]">
            <span>FSSAI COMPLIANT PROTOCOL</span>
            <span>PINELABS · RAZORPAY</span>
          </div>
        </div>
      );

    case 'tysonchess':
      return (
        <div className={containerStyle}>
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-600 dark:text-[#64748B]">
            <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-medium">
              <Cpu className="w-3 h-3" />
              WASM ENGINE PIPELINE
            </span>
            <span>8 WORKER THREADS</span>
          </div>

          <div className="flex items-center justify-between gap-1 text-[11px] font-mono py-2">
            <div className="px-2 py-1.5 rounded bg-white dark:bg-[#13161C] border border-black/[0.08] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 text-center flex-1 shadow-xs">
              <div className="text-[9px] text-zinc-500 dark:text-[#64748B]">RUNTIME</div>
              <div className="font-semibold text-zinc-900 dark:text-white">Stockfish 18</div>
            </div>
            <ArrowRight className="w-3 h-3 text-zinc-400 dark:text-[#64748B] shrink-0" />
            <div className="px-2 py-1.5 rounded bg-white dark:bg-[#13161C] border border-black/[0.08] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 text-center flex-1 shadow-xs">
              <div className="text-[9px] text-zinc-500 dark:text-[#64748B]">SEARCH</div>
              <div className="font-semibold text-sky-600 dark:text-sky-400">24 Ply</div>
            </div>
            <ArrowRight className="w-3 h-3 text-zinc-400 dark:text-[#64748B] shrink-0" />
            <div className="px-2 py-1.5 rounded bg-white dark:bg-[#13161C] border border-black/[0.08] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 text-center flex-1 shadow-xs">
              <div className="text-[9px] text-zinc-500 dark:text-[#64748B]">ANALYSIS</div>
              <div className="font-semibold text-zinc-900 dark:text-white">Coach Gen</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 dark:text-[#64748B] pt-1 border-t border-black/[0.06] dark:border-white/[0.04]">
            <span>SIMD WEB WORKERS</span>
            <span>1.84M NODES / SEC</span>
          </div>
        </div>
      );

    case 'silaa':
      return (
        <div className={containerStyle}>
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-600 dark:text-[#64748B]">
            <span className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-medium">
              <Workflow className="w-3 h-3" />
              MANUFACTURING STATE MACHINE
            </span>
            <span>99.4% YIELD</span>
          </div>

          <div className="flex items-center justify-between gap-1 text-[11px] font-mono py-2">
            <div className="px-2 py-1.5 rounded bg-white dark:bg-[#13161C] border border-black/[0.08] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 text-center flex-1 shadow-xs">
              <div className="text-[9px] text-zinc-500 dark:text-[#64748B]">INVENTORY</div>
              <div className="font-semibold text-zinc-900 dark:text-white">Fabric Lot</div>
            </div>
            <ArrowRight className="w-3 h-3 text-zinc-400 dark:text-[#64748B] shrink-0" />
            <div className="px-2 py-1.5 rounded bg-white dark:bg-[#13161C] border border-black/[0.08] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 text-center flex-1 shadow-xs">
              <div className="text-[9px] text-zinc-500 dark:text-[#64748B]">OPTIMIZER</div>
              <div className="font-semibold text-purple-600 dark:text-purple-400">2D Nesting</div>
            </div>
            <ArrowRight className="w-3 h-3 text-zinc-400 dark:text-[#64748B] shrink-0" />
            <div className="px-2 py-1.5 rounded bg-white dark:bg-[#13161C] border border-black/[0.08] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 text-center flex-1 shadow-xs">
              <div className="text-[9px] text-zinc-500 dark:text-[#64748B]">WORKFLOW</div>
              <div className="font-semibold text-zinc-900 dark:text-white">CMT Batch</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 dark:text-[#64748B] pt-1 border-t border-black/[0.06] dark:border-white/[0.04]">
            <span>FASTAPI + POSTGRESQL</span>
            <span>ZERO-WASTE PATTERN</span>
          </div>
        </div>
      );

    case 'tysonpe':
      return (
        <div className={containerStyle}>
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-600 dark:text-[#64748B]">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <ShieldCheck className="w-3 h-3" />
              PAYWALL & DRM PIPELINE
            </span>
            <span>RAZORPAY VERIFIED</span>
          </div>

          <div className="flex items-center justify-between gap-1 text-[11px] font-mono py-2">
            <div className="px-2 py-1.5 rounded bg-white dark:bg-[#13161C] border border-black/[0.08] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 text-center flex-1 shadow-xs">
              <div className="text-[9px] text-zinc-500 dark:text-[#64748B]">CLIENT</div>
              <div className="font-semibold text-zinc-900 dark:text-white">Checkout</div>
            </div>
            <ArrowRight className="w-3 h-3 text-zinc-400 dark:text-[#64748B] shrink-0" />
            <div className="px-2 py-1.5 rounded bg-white dark:bg-[#13161C] border border-black/[0.08] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 text-center flex-1 shadow-xs">
              <div className="text-[9px] text-zinc-500 dark:text-[#64748B]">WEBHOOK</div>
              <div className="font-semibold text-emerald-600 dark:text-emerald-400">HMAC Sig</div>
            </div>
            <ArrowRight className="w-3 h-3 text-zinc-400 dark:text-[#64748B] shrink-0" />
            <div className="px-2 py-1.5 rounded bg-white dark:bg-[#13161C] border border-black/[0.08] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 text-center flex-1 shadow-xs">
              <div className="text-[9px] text-zinc-500 dark:text-[#64748B]">DELIVERY</div>
              <div className="font-semibold text-zinc-900 dark:text-white">DRM Stream</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 dark:text-[#64748B] pt-1 border-t border-black/[0.06] dark:border-white/[0.04]">
            <span>AUTOMATED GST INVOICING</span>
            <span>WATERMARKED ASSETS</span>
          </div>
        </div>
      );

    case 'physiocare':
      return (
        <div className={containerStyle}>
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-600 dark:text-[#64748B]">
            <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-medium">
              <Server className="w-3 h-3" />
              MULTI-TENANT CLINIC EHR
            </span>
            <span>ISOLATED TENANTS</span>
          </div>

          <div className="flex items-center justify-between gap-1 text-[11px] font-mono py-2">
            <div className="px-2 py-1.5 rounded bg-white dark:bg-[#13161C] border border-black/[0.08] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 text-center flex-1 shadow-xs">
              <div className="text-[9px] text-zinc-500 dark:text-[#64748B]">CALENDAR</div>
              <div className="font-semibold text-zinc-900 dark:text-white">Slot Lock</div>
            </div>
            <ArrowRight className="w-3 h-3 text-zinc-400 dark:text-[#64748B] shrink-0" />
            <div className="px-2 py-1.5 rounded bg-white dark:bg-[#13161C] border border-black/[0.08] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 text-center flex-1 shadow-xs">
              <div className="text-[9px] text-zinc-500 dark:text-[#64748B]">SECURITY</div>
              <div className="font-semibold text-sky-600 dark:text-sky-400">Neon RLS</div>
            </div>
            <ArrowRight className="w-3 h-3 text-zinc-400 dark:text-[#64748B] shrink-0" />
            <div className="px-2 py-1.5 rounded bg-white dark:bg-[#13161C] border border-black/[0.08] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 text-center flex-1 shadow-xs">
              <div className="text-[9px] text-zinc-500 dark:text-[#64748B]">BILLING</div>
              <div className="font-semibold text-zinc-900 dark:text-white">Tax Invoice</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 dark:text-[#64748B] pt-1 border-t border-black/[0.06] dark:border-white/[0.04]">
            <span>NEXT.JS 14 · PRISMA</span>
            <span>ELECTRONIC HEALTH RECORD</span>
          </div>
        </div>
      );

    case 'kusum-dental-care':
      return (
        <div className={containerStyle}>
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-600 dark:text-[#64748B]">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <Activity className="w-3 h-3" />
              CLINICAL EHR ARCHITECTURE
            </span>
            <span>BILINGUAL (KN/EN)</span>
          </div>

          <div className="flex items-center justify-between gap-1 text-[11px] font-mono py-2">
            <div className="px-2 py-1.5 rounded bg-white dark:bg-[#13161C] border border-black/[0.08] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 text-center flex-1 shadow-xs">
              <div className="text-[9px] text-zinc-500 dark:text-[#64748B]">PORTAL</div>
              <div className="font-semibold text-zinc-900 dark:text-white">Booking</div>
            </div>
            <ArrowRight className="w-3 h-3 text-zinc-400 dark:text-[#64748B] shrink-0" />
            <div className="px-2 py-1.5 rounded bg-white dark:bg-[#13161C] border border-black/[0.08] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 text-center flex-1 shadow-xs">
              <div className="text-[9px] text-zinc-500 dark:text-[#64748B]">BACKEND</div>
              <div className="font-semibold text-emerald-600 dark:text-emerald-400">Fastify API</div>
            </div>
            <ArrowRight className="w-3 h-3 text-zinc-400 dark:text-[#64748B] shrink-0" />
            <div className="px-2 py-1.5 rounded bg-white dark:bg-[#13161C] border border-black/[0.08] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 text-center flex-1 shadow-xs">
              <div className="text-[9px] text-zinc-500 dark:text-[#64748B]">DATA</div>
              <div className="font-semibold text-zinc-900 dark:text-white">Supabase RLS</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 dark:text-[#64748B] pt-1 border-t border-black/[0.06] dark:border-white/[0.04]">
            <span>REALTIME SLOT HOLDING</span>
            <span>PATIENT CONSENT VAULT</span>
          </div>
        </div>
      );

    case 'agents-and-skills':
      return (
        <div className={containerStyle}>
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-600 dark:text-[#64748B]">
            <span className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-medium">
              <GitBranch className="w-3 h-3" />
              MULTI-AGENT COORDINATION
            </span>
            <span>CCR COMPRESSION</span>
          </div>

          <div className="flex items-center justify-between gap-1 text-[11px] font-mono py-2">
            <div className="px-2 py-1.5 rounded bg-white dark:bg-[#13161C] border border-black/[0.08] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 text-center flex-1 shadow-xs">
              <div className="text-[9px] text-zinc-500 dark:text-[#64748B]">ORCHESTRATOR</div>
              <div className="font-semibold text-zinc-900 dark:text-white">Chief of Staff</div>
            </div>
            <ArrowRight className="w-3 h-3 text-zinc-400 dark:text-[#64748B] shrink-0" />
            <div className="px-2 py-1.5 rounded bg-white dark:bg-[#13161C] border border-black/[0.08] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 text-center flex-1 shadow-xs">
              <div className="text-[9px] text-zinc-500 dark:text-[#64748B]">SPECIALISTS</div>
              <div className="font-semibold text-purple-600 dark:text-purple-400">12 Personas</div>
            </div>
            <ArrowRight className="w-3 h-3 text-zinc-400 dark:text-[#64748B] shrink-0" />
            <div className="px-2 py-1.5 rounded bg-white dark:bg-[#13161C] border border-black/[0.08] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 text-center flex-1 shadow-xs">
              <div className="text-[9px] text-zinc-500 dark:text-[#64748B]">GATE</div>
              <div className="font-semibold text-zinc-900 dark:text-white">Quality Audit</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 dark:text-[#64748B] pt-1 border-t border-black/[0.06] dark:border-white/[0.04]">
            <span>HEADROOM -78% TOKENS</span>
            <span>ZERO-TOUCH WORKFLOWS</span>
          </div>
        </div>
      );

    default:
      return (
        <div className={containerStyle}>
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-600 dark:text-[#64748B]">
            <span className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 font-medium">
              <FileCode2 className="w-3 h-3" />
              SYSTEM ARCHITECTURE
            </span>
            <span>PRODUCTION VERIFIED</span>
          </div>

          <div className="flex items-center justify-between gap-1 text-[11px] font-mono py-2">
            <div className="px-2 py-1.5 rounded bg-white dark:bg-[#13161C] border border-black/[0.08] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 text-center flex-1 shadow-xs">
              <div className="text-[9px] text-zinc-500 dark:text-[#64748B]">SURFACE</div>
              <div className="font-semibold text-zinc-900 dark:text-white">Modern UI</div>
            </div>
            <ArrowRight className="w-3 h-3 text-zinc-400 dark:text-[#64748B] shrink-0" />
            <div className="px-2 py-1.5 rounded bg-white dark:bg-[#13161C] border border-black/[0.08] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 text-center flex-1 shadow-xs">
              <div className="text-[9px] text-zinc-500 dark:text-[#64748B]">RUNTIME</div>
              <div className="font-semibold text-zinc-800 dark:text-zinc-200">Edge API</div>
            </div>
            <ArrowRight className="w-3 h-3 text-zinc-400 dark:text-[#64748B] shrink-0" />
            <div className="px-2 py-1.5 rounded bg-white dark:bg-[#13161C] border border-black/[0.08] dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 text-center flex-1 shadow-xs">
              <div className="text-[9px] text-zinc-500 dark:text-[#64748B]">PERSISTENCE</div>
              <div className="font-semibold text-zinc-900 dark:text-white">Database</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 dark:text-[#64748B] pt-1 border-t border-black/[0.06] dark:border-white/[0.04]">
            <span>ZERO-LAYOUT-SHIFT</span>
            <span>SOVEREIGN STACK</span>
          </div>
        </div>
      );
  }
}
