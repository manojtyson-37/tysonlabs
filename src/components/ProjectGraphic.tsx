import React from 'react';

interface ProjectGraphicProps {
  slug: string;
  name: string;
  category: string;
  className?: string;
}

export function ProjectGraphic({ slug, name, category, className = '' }: ProjectGraphicProps) {
  switch (slug) {
    case 'dinepulse':
      return (
        <div className={`w-full h-full min-h-[220px] bg-[#0E1015] p-5 flex flex-col justify-between border-b border-[#30333B] relative overflow-hidden group-hover:border-[#B99AFF]/40 transition-colors ${className}`}>
          {/* Top till bar */}
          <div className="flex items-center justify-between text-xs pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-mono text-zinc-300 font-semibold">TABLE T-04</span>
              <span className="text-[10px] bg-emerald-500/15 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">BILLED</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-zinc-400">
              <span>Till #1</span>
              <span className="text-zinc-600">·</span>
              <span className="text-amber-400 font-medium">3-Click Mode</span>
            </div>
          </div>

          {/* Ticket Items with FSSAI Badges */}
          <div className="my-3 space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between p-2 rounded bg-[#15171C] border border-white/[0.05]">
              <div className="flex items-center gap-2">
                {/* Veg green square */}
                <span className="w-3.5 h-3.5 border border-emerald-500 flex items-center justify-center rounded-sm bg-emerald-950/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                </span>
                <span className="text-zinc-200">Paneer Tikka Biryani x2</span>
              </div>
              <span className="text-zinc-300">₹760</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-[#15171C] border border-white/[0.05]">
              <div className="flex items-center gap-2">
                {/* Non-Veg red square */}
                <span className="w-3.5 h-3.5 border border-red-500 flex items-center justify-center rounded-sm bg-red-950/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                </span>
                <span className="text-zinc-200">Butter Chicken Kulcha x1</span>
              </div>
              <span className="text-zinc-300">₹420</span>
            </div>
          </div>

          {/* Bottom actions */}
          <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Gross Total</span>
              <span className="font-display font-bold text-base text-zinc-100">₹1,180.00</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-1 rounded bg-[#FF5200] text-white font-bold tracking-wide">
                FIRE KOT
              </span>
              <span className="text-[10px] font-mono px-2 py-1 rounded bg-[#1E222B] text-zinc-300 border border-white/10">
                WHATSAPP BILL
              </span>
            </div>
          </div>
        </div>
      );

    case 'tysonchess':
      return (
        <div className={`w-full h-full min-h-[220px] bg-[#0A0D12] p-5 flex flex-col justify-between border-b border-[#30333B] relative overflow-hidden group-hover:border-[#38BDF8]/40 transition-colors ${className}`}>
          {/* Stockfish Header */}
          <div className="flex items-center justify-between text-xs pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2 font-mono">
              <span className="text-sky-400 font-bold">♞ STOCKFISH 18</span>
              <span className="text-[10px] bg-sky-500/15 text-sky-300 px-1.5 py-0.5 rounded border border-sky-500/30">WASM CLIENT</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-emerald-400 font-bold">
              <span>+2.45</span>
              <span className="text-[10px] text-zinc-500 font-normal">depth 22</span>
            </div>
          </div>

          {/* Chessboard simulation slice */}
          <div className="my-3 grid grid-cols-4 gap-1 p-2 bg-[#12161E] rounded border border-white/[0.06] font-mono text-xs">
            <div className="bg-[#1C2330] p-2 rounded text-center text-zinc-400">c4</div>
            <div className="bg-[#151B25] p-2 rounded text-center text-sky-300 font-bold">e5! (Best)</div>
            <div className="bg-[#1C2330] p-2 rounded text-center text-zinc-400">Nc3</div>
            <div className="bg-[#151B25] p-2 rounded text-center text-amber-400">Nf6 (Book)</div>
          </div>

          {/* Coach Tactical Feedback */}
          <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-xs text-zinc-300 font-mono">Coach: &quot;Knight outpost established on d4&quot;</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
              BLUNDER GUARD ACTIVE
            </span>
          </div>
        </div>
      );

    case 'tysonpe':
      return (
        <div className={`w-full h-full min-h-[220px] bg-[#0E0F14] p-5 flex flex-col justify-between border-b border-[#30333B] relative overflow-hidden group-hover:border-[#8B5CF6]/40 transition-colors ${className}`}>
          {/* Creator Store Bar */}
          <div className="flex items-center justify-between text-xs pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-violet-600/30 border border-violet-500/40 flex items-center justify-center font-bold text-[10px] text-violet-300">
                AR
              </div>
              <span className="font-mono text-zinc-200">/c/asha-rao</span>
            </div>
            <span className="font-mono text-[10px] text-violet-300 bg-violet-950/60 px-2 py-0.5 rounded border border-violet-800/40">
              RAZORPAY VERIFIED
            </span>
          </div>

          {/* Product pricing card */}
          <div className="my-2 p-3 rounded bg-[#161720] border border-white/[0.06] space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-100">Full-Stack Algo Trading Cohort</span>
              <span className="font-display font-bold text-sm text-violet-300">₹4,999</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-mono">
              <span>18 Video Lessons</span>
              <span>·</span>
              <span>DRM Watermarked</span>
              <span>·</span>
              <span className="text-emerald-400">GST Invoice Ready</span>
            </div>
          </div>

          {/* Checkout Bar */}
          <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-mono text-[11px]">Instant UPI Intent / NetBanking</span>
            <span className="font-mono text-[10px] font-bold px-2 py-1 rounded bg-violet-600 text-white">
              ENROLL NOW ↗
            </span>
          </div>
        </div>
      );

    case 'silaa-atelier':
      return (
        <div className={`w-full h-full min-h-[220px] bg-[#0D1210] p-5 flex flex-col justify-between border-b border-[#30333B] relative overflow-hidden group-hover:border-[#10B981]/40 transition-colors ${className}`}>
          {/* ERP Header */}
          <div className="flex items-center justify-between text-xs pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2 font-mono">
              <span className="text-emerald-400 font-semibold">PO #SIL-2026-088</span>
              <span className="text-[10px] bg-emerald-500/15 text-emerald-300 px-1.5 py-0.5 rounded">CUTTING STAGE</span>
            </div>
            <span className="text-[11px] text-zinc-400 font-mono">Lot #84A</span>
          </div>

          {/* Fabric Yield Specs */}
          <div className="my-2 grid grid-cols-3 gap-2 font-mono text-xs">
            <div className="bg-[#131B16] p-2 rounded border border-emerald-900/40">
              <div className="text-[10px] text-zinc-500">Fabric</div>
              <div className="font-bold text-zinc-200">Mulmul 60s</div>
            </div>
            <div className="bg-[#131B16] p-2 rounded border border-emerald-900/40">
              <div className="text-[10px] text-zinc-500">Total Rolls</div>
              <div className="font-bold text-zinc-200">1,240 m</div>
            </div>
            <div className="bg-[#131B16] p-2 rounded border border-emerald-900/40">
              <div className="text-[10px] text-zinc-500">Yield Est.</div>
              <div className="font-bold text-emerald-400">480 pcs</div>
            </div>
          </div>

          {/* Workflow Stage */}
          <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-1.5 text-zinc-400 text-[11px]">
              <span className="text-emerald-400 font-bold">Cutting</span> → <span>Embroidery</span> → <span>Stitching</span>
            </div>
            <span className="text-[10px] text-zinc-400 bg-white/[0.05] px-2 py-0.5 rounded">BOM Verified</span>
          </div>
        </div>
      );

    case 'physiocare':
      return (
        <div className={`w-full h-full min-h-[220px] bg-[#0A1016] p-5 flex flex-col justify-between border-b border-[#30333B] relative overflow-hidden group-hover:border-[#0EA5E9]/40 transition-colors ${className}`}>
          <div className="flex items-center justify-between text-xs pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2 font-mono">
              <span className="text-sky-400 font-semibold">PHYSIOCARE OS</span>
              <span className="text-[10px] bg-sky-500/15 text-sky-300 px-1.5 py-0.5 rounded">CLINIC #1</span>
            </div>
            <span className="text-[11px] text-emerald-400 font-mono">4 Appointments Today</span>
          </div>
          <div className="my-2 space-y-1.5 font-mono text-xs">
            <div className="p-2 rounded bg-[#101924] border border-sky-950 flex items-center justify-between">
              <div>
                <div className="text-zinc-200 font-medium">10:30 AM · Cervical Spondylosis</div>
                <div className="text-[10px] text-zinc-400">Dr. Sharma · Session 4 of 8</div>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold">ATTENDED</span>
            </div>
          </div>
          <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-400 text-[11px]">Multi-Tenant Neon Postgres</span>
            <span className="text-[10px] text-sky-300 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800">
              GST BILLING LIVE
            </span>
          </div>
        </div>
      );

    case 'agents-and-skills':
      return (
        <div className={`w-full h-full min-h-[220px] bg-[#110D18] p-5 flex flex-col justify-between border-b border-[#30333B] relative overflow-hidden group-hover:border-[#A855F7]/40 transition-colors ${className}`}>
          <div className="flex items-center justify-between text-xs pb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-2 font-mono">
              <span className="text-purple-400 font-semibold">CHIEF OF STAFF</span>
              <span className="text-[10px] bg-purple-500/15 text-purple-300 px-1.5 py-0.5 rounded">COORDINATOR</span>
            </div>
            <span className="text-[11px] text-emerald-400 font-mono">Token Cut: -78%</span>
          </div>
          <div className="my-2 flex items-center justify-between text-xs font-mono p-2 rounded bg-[#1A1424] border border-purple-900/30">
            <div className="text-center">
              <div className="text-[10px] text-zinc-500">Orchestrator</div>
              <div className="font-bold text-purple-300">Planning</div>
            </div>
            <div className="text-zinc-600">→</div>
            <div className="text-center">
              <div className="text-[10px] text-zinc-500">Engineer</div>
              <div className="font-bold text-sky-300">TDD Code</div>
            </div>
            <div className="text-zinc-600">→</div>
            <div className="text-center">
              <div className="text-[10px] text-zinc-500">Reviewer</div>
              <div className="font-bold text-emerald-300">Quality Gate</div>
            </div>
          </div>
          <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-400 text-[11px]">Headroom Compression Engine</span>
            <span className="text-[10px] text-purple-300 bg-purple-950 px-2 py-0.5 rounded border border-purple-800">
              GITHUB REPO
            </span>
          </div>
        </div>
      );

    default:
      // Generic clean studio preview for other projects
      return (
        <div className={`w-full h-full min-h-[220px] bg-[#12141A] p-5 flex flex-col justify-between border-b border-[#30333B] relative overflow-hidden group-hover:border-white/20 transition-colors ${className}`}>
          <div className="flex items-center justify-between text-xs pb-3 border-b border-white/[0.08]">
            <span className="font-mono text-zinc-400 uppercase tracking-wider text-[11px]">{category}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-zinc-300 border border-white/10">
              VERIFIED BUILD
            </span>
          </div>
          <div className="my-4">
            <h4 className="font-display font-bold text-lg text-zinc-100 group-hover:text-white transition-colors">
              {name}
            </h4>
            <div className="mt-2 flex items-center gap-2 font-mono text-xs text-zinc-500">
              <span>Architecture verified</span>
              <span>·</span>
              <span>Zero-slop UI</span>
            </div>
          </div>
          <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>TysonLabs Sovereign Project</span>
            <span className="text-[#B99AFF] group-hover:translate-x-0.5 transition-transform">Inspect ↗</span>
          </div>
        </div>
      );
  }
}
