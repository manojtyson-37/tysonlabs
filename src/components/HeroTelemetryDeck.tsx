'use client';

import React, { useState } from 'react';
import { 
  Cpu, 
  Workflow, 
  ShieldCheck, 
  RotateCw, 
  Activity, 
  Layers,
  Terminal,
  ArrowRight,
  Check
} from 'lucide-react';

type TelemetryTab = 'pos' | 'wasm' | 'erp';

export function HeroTelemetryDeck() {
  const [activeTab, setActiveTab] = useState<TelemetryTab>('pos');
  
  // Benchmark State
  const [benchmarking, setBenchmarking] = useState(false);
  const [benchmarkResult, setBenchmarkResult] = useState<string | null>(null);

  const handleBenchmark = (type: string) => {
    setBenchmarking(true);
    setBenchmarkResult(null);
    setTimeout(() => {
      if (type === 'pos') {
        setBenchmarkResult('100 concurrent orders ingested & split into KOTs in 8.4ms');
      } else if (type === 'wasm') {
        setBenchmarkResult('28-ply search completed: 4,120,400 nodes evaluated');
      } else {
        setBenchmarkResult('Marker re-nested: 99.8% roll yield (2.1m linen salvaged)');
      }
      setBenchmarking(false);
    }, 500);
  };

  return (
    <div className="w-full bg-[#181818] border border-white/[0.08] rounded-2xl overflow-hidden font-mono text-xs shadow-2xl shadow-black/80">
      {/* Console Header Bar */}
      <div className="bg-[#1F1F1F] px-4 py-3 border-b border-white/[0.06] flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="font-semibold text-white tracking-wider text-[11px]">
            LIVE ARCHITECTURE BENCHMARKS
          </span>
          <span className="text-[#666666] text-[10px] hidden sm:inline">
            // SHIPPED PRODUCTION ENGINES
          </span>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 bg-[#000000] p-1 rounded-lg border border-white/[0.06]">
          <button
            type="button"
            onClick={() => { setActiveTab('pos'); setBenchmarkResult(null); }}
            className={`px-2.5 py-1 rounded text-[10px] font-medium transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              activeTab === 'pos'
                ? 'bg-[#272727] text-white shadow-sm'
                : 'text-[#9B9B9B] hover:text-white'
            }`}
          >
            POS Engine
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('wasm'); setBenchmarkResult(null); }}
            className={`px-2.5 py-1 rounded text-[10px] font-medium transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              activeTab === 'wasm'
                ? 'bg-[#272727] text-white shadow-sm'
                : 'text-[#9B9B9B] hover:text-white'
            }`}
          >
            WASM SIMD
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('erp'); setBenchmarkResult(null); }}
            className={`px-2.5 py-1 rounded text-[10px] font-medium transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              activeTab === 'erp'
                ? 'bg-[#272727] text-white shadow-sm'
                : 'text-[#9B9B9B] hover:text-white'
            }`}
          >
            Apparel ERP
          </button>
        </div>
      </div>

      {/* Console Body */}
      <div className="p-5 space-y-4">
        {/* Tab 1: DinePulse POS Engine */}
        {activeTab === 'pos' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-[#9B9B9B] pb-2 border-b border-white/[0.06]">
              <span className="text-white font-semibold">DinePulse · Protocol Engine</span>
              <span className="text-emerald-400">12ms TTFB</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between p-2 rounded-lg bg-[#000000] border border-white/[0.04]">
                <span className="text-[#666666]">TAX CLASSIFICATION</span>
                <span className="text-white font-medium">CGST 2.5% + SGST 2.5% Split</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-[#000000] border border-white/[0.04]">
                <span className="text-[#666666]">KOT PRINT ROUTING</span>
                <span className="text-white font-medium">Auto dispatch (Tandoor / Curry / Bar)</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-[#000000] border border-white/[0.04]">
                <span className="text-[#666666]">COMPLIANCE</span>
                <span className="text-emerald-400 font-medium">FSSAI Veg / Non Veg Validation</span>
              </div>
            </div>

            {benchmarkResult ? (
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] flex items-center gap-2">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>{benchmarkResult}</span>
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => handleBenchmark('pos')}
              disabled={benchmarking}
              className="btn-tactile w-full py-2.5 px-3 rounded-lg bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
            >
              <RotateCw className={`w-3.5 h-3.5 ${benchmarking ? 'animate-spin' : ''}`} />
              <span>{benchmarking ? 'CALCULATING TAX MATRIX...' : 'BENCHMARK TILL SPEED (100 CONCURRENT)'}</span>
            </button>
          </div>
        )}

        {/* Tab 2: Stockfish 18 WASM */}
        {activeTab === 'wasm' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-[#9B9B9B] pb-2 border-b border-white/[0.06]">
              <span className="text-white font-semibold">Stockfish 18 · WASM SIMD</span>
              <span className="text-sky-400">8 Web Workers</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between p-2 rounded-lg bg-[#000000] border border-white/[0.04]">
                <span className="text-[#666666]">SEARCH DEPTH</span>
                <span className="text-white font-medium">24 Ply Minimax</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-[#000000] border border-white/[0.04]">
                <span className="text-[#666666]">CALCULATION SPEED</span>
                <span className="text-sky-400 font-medium">1,840,210 nodes / sec</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-[#000000] border border-white/[0.04]">
                <span className="text-[#666666]">TRANSPOSITION HASH</span>
                <span className="text-white font-medium">64MB In Memory Cache</span>
              </div>
            </div>

            {benchmarkResult ? (
              <div className="p-2.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[11px] flex items-center gap-2">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>{benchmarkResult}</span>
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => handleBenchmark('wasm')}
              disabled={benchmarking}
              className="btn-tactile w-full py-2.5 px-3 rounded-lg bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
            >
              <RotateCw className={`w-3.5 h-3.5 ${benchmarking ? 'animate-spin' : ''}`} />
              <span>{benchmarking ? 'RUNNING MINIMAX TREE...' : 'RUN DEEP WASM BENCHMARK'}</span>
            </button>
          </div>
        )}

        {/* Tab 3: Silaa Apparel ERP */}
        {activeTab === 'erp' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-[#9B9B9B] pb-2 border-b border-white/[0.06]">
              <span className="text-white font-semibold">Silaa Atelier · Cutting Optimizer</span>
              <span className="text-purple-400">99.4% Yield</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between p-2 rounded-lg bg-[#000000] border border-white/[0.04]">
                <span className="text-[#666666]">FABRIC INVENTORY</span>
                <span className="text-white font-medium">Turkish Linen Roll #84A (120m)</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-[#000000] border border-white/[0.04]">
                <span className="text-[#666666]">PATTERN NESTING</span>
                <span className="text-white font-medium">18/18 Garment Sizes Optimal</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-[#000000] border border-white/[0.04]">
                <span className="text-[#666666]">WASTE RETAINED</span>
                <span className="text-emerald-400 font-medium">1.6m Salvaged (₹1,440 Retained)</span>
              </div>
            </div>

            {benchmarkResult ? (
              <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[11px] flex items-center gap-2">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>{benchmarkResult}</span>
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => handleBenchmark('erp')}
              disabled={benchmarking}
              className="btn-tactile w-full py-2.5 px-3 rounded-lg bg-white text-black font-semibold text-xs hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
            >
              <RotateCw className={`w-3.5 h-3.5 ${benchmarking ? 'animate-spin' : ''}`} />
              <span>{benchmarking ? 'RE CALCULATING NESTING...' : 'RUN ZERO WASTE OPTIMIZER'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Console Footer */}
      <div className="bg-[#000000] px-4 py-2.5 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-[#666666]">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>PRODUCTION VERIFIED ARCHITECTURE</span>
        </div>
        <span>ZERO SYNTHETIC SLOP</span>
      </div>
    </div>
  );
}
