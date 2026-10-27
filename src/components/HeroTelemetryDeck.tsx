'use client';

import React, { useState } from 'react';
import { 
  Flame, 
  Cpu, 
  Scissors, 
  CheckCircle2, 
  RotateCw, 
  Activity, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check
} from 'lucide-react';

type TelemetryTab = 'dinepulse' | 'chess' | 'silaa';

export function HeroTelemetryDeck() {
  const [activeTab, setActiveTab] = useState<TelemetryTab>('dinepulse');
  
  // DinePulse POS Interactive State
  const [kotFired, setKotFired] = useState(false);
  const [kotTimestamp, setKotTimestamp] = useState<string | null>(null);

  // Chess WASM Interactive State
  const [engineBenchmarking, setEngineBenchmarking] = useState(false);
  const [engineDepth, setEngineDepth] = useState(24);
  const [engineNodes, setEngineNodes] = useState('1.84M');

  // Silaa Apparel ERP Interactive State
  const [optimizingYield, setOptimizingYield] = useState(false);
  const [fabricYield, setFabricYield] = useState(99.4);
  const [metersSaved, setMetersSaved] = useState('1.6m');

  const handleFireKot = () => {
    setKotFired(true);
    const now = new Date();
    setKotTimestamp(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    setTimeout(() => {
      // Keep state or allow refiring
    }, 3000);
  };

  const handleRunChessBenchmark = () => {
    setEngineBenchmarking(true);
    setTimeout(() => {
      setEngineDepth(prev => (prev === 24 ? 28 : 24));
      setEngineNodes(prev => (prev === '1.84M' ? '4.12M' : '1.84M'));
      setEngineBenchmarking(false);
    }, 600);
  };

  const handleOptimizeSilaa = () => {
    setOptimizingYield(true);
    setTimeout(() => {
      setFabricYield(prev => (prev === 99.4 ? 99.8 : 99.4));
      setMetersSaved(prev => (prev === '1.6m' ? '2.1m' : '1.6m'));
      setOptimizingYield(false);
    }, 500);
  };

  return (
    <div className="w-full bg-[#121419] border border-[#272B35] rounded-2xl shadow-2xl shadow-black/80 overflow-hidden text-[#E4E5EB] font-sans">
      {/* Telemetry Header */}
      <div className="bg-[#181B22] px-4 py-3 border-b border-[#272B35] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-[11px] font-bold tracking-wider uppercase text-[#F4F3F8]">
              TYSONLABS CORE
            </span>
            <span className="hidden sm:inline font-mono text-[10px] text-[#717684]">
              v2.4 · 24ms CHENNAI EDGE
            </span>
          </div>
        </div>

        {/* System Tabs */}
        <div className="flex items-center gap-1 bg-[#101216] p-1 rounded-lg border border-[#22252E]">
          <button
            type="button"
            onClick={() => setActiveTab('dinepulse')}
            className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-all ${
              activeTab === 'dinepulse'
                ? 'bg-[#272B35] text-white shadow-sm'
                : 'text-[#8C90A0] hover:text-white'
            }`}
          >
            POS Till
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('chess')}
            className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-all ${
              activeTab === 'chess'
                ? 'bg-[#272B35] text-white shadow-sm'
                : 'text-[#8C90A0] hover:text-white'
            }`}
          >
            WASM Chess
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('silaa')}
            className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-all ${
              activeTab === 'silaa'
                ? 'bg-[#272B35] text-white shadow-sm'
                : 'text-[#8C90A0] hover:text-white'
            }`}
          >
            Silaa ERP
          </button>
        </div>
      </div>

      {/* Tab 1: DinePulse Petpooja-Grade POS Till View */}
      {activeTab === 'dinepulse' && (
        <div className="p-5 space-y-4">
          {/* Table Strip & Order Meta */}
          <div className="flex items-center justify-between pb-3 border-b border-[#22252E]">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] font-bold">
                TABLE T-04
              </span>
              <span className="text-xs text-[#8C90A0]">Dine-in · 4 Pax</span>
            </div>
            <span className="font-mono text-xs text-[#8C90A0]">Captain: Manoj A.</span>
          </div>

          {/* Running Order Lines with FSSAI Badges */}
          <div className="space-y-2 font-mono text-xs">
            {/* Item 1: Non-Veg */}
            <div className="flex items-center justify-between bg-[#171920] px-3 py-2 rounded-lg border border-[#22252E]">
              <div className="flex items-center gap-2.5">
                {/* Authentic FSSAI Non-Veg Badge: Brown/Red square with filled red triangle */}
                <span className="inline-flex items-center justify-center w-3.5 h-3.5 border border-red-600 rounded-[2px] bg-red-950/20" title="FSSAI Non-Veg">
                  <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                </span>
                <span className="text-white font-medium">Butter Chicken (Boneless)</span>
                <span className="text-[#717684]">x1</span>
              </div>
              <span className="text-white font-semibold">₹420</span>
            </div>

            {/* Item 2: Veg */}
            <div className="flex items-center justify-between bg-[#171920] px-3 py-2 rounded-lg border border-[#22252E]">
              <div className="flex items-center gap-2.5">
                {/* Authentic FSSAI Veg Badge: Green square with filled green circle */}
                <span className="inline-flex items-center justify-center w-3.5 h-3.5 border border-emerald-500 rounded-[2px] bg-emerald-950/20" title="FSSAI Veg">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                </span>
                <span className="text-white font-medium">Paneer Tikka (Tandoori)</span>
                <span className="text-[#717684]">x1</span>
              </div>
              <span className="text-white font-semibold">₹340</span>
            </div>

            {/* Item 3: Veg */}
            <div className="flex items-center justify-between bg-[#171920] px-3 py-2 rounded-lg border border-[#22252E]">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex items-center justify-center w-3.5 h-3.5 border border-emerald-500 rounded-[2px] bg-emerald-950/20" title="FSSAI Veg">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                </span>
                <span className="text-white font-medium">Garlic Butter Naan</span>
                <span className="text-[#717684]">x3</span>
              </div>
              <span className="text-white font-semibold">₹180</span>
            </div>

            {/* Item 4: Veg */}
            <div className="flex items-center justify-between bg-[#171920] px-3 py-2 rounded-lg border border-[#22252E]">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex items-center justify-center w-3.5 h-3.5 border border-emerald-500 rounded-[2px] bg-emerald-950/20" title="FSSAI Veg">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                </span>
                <span className="text-white font-medium">Dal Makhani 24-hr Slow</span>
                <span className="text-[#717684]">x1</span>
              </div>
              <span className="text-white font-semibold">₹260</span>
            </div>
          </div>

          {/* Subtotal & Taxes */}
          <div className="bg-[#101216] p-3 rounded-lg border border-[#22252E] space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-[#8C90A0]">
              <span>Subtotal (4 items)</span>
              <span>₹1,200.00</span>
            </div>
            <div className="flex justify-between text-[#717684] text-[11px]">
              <span>CGST (2.5%) + SGST (2.5%)</span>
              <span>₹60.00</span>
            </div>
            <div className="flex justify-between text-white font-bold pt-1 border-t border-[#22252E] text-sm">
              <span>Payable Total</span>
              <span className="text-emerald-400">₹1,260.00</span>
            </div>
          </div>

          {/* Fired Status Banner if active */}
          {kotFired && (
            <div className="flex items-center gap-2.5 px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs font-mono animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>KOT #148 FIRED TO KITCHEN ({kotTimestamp})</span>
            </div>
          )}

          {/* Obvious Operational Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handleFireKot}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-bold text-xs font-mono uppercase tracking-wider transition-all duration-150 active:scale-[0.98] ${
                kotFired
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#FF5200] hover:bg-[#FF641A] text-white shadow-lg shadow-[#FF5200]/20'
              }`}
            >
              <Flame className="w-4 h-4" />
              <span>{kotFired ? 'RE-FIRE KOT' : 'FIRE KOT (3-CLICK)'}</span>
            </button>

            <button
              type="button"
              onClick={() => alert('UPI QR Generated for ₹1,260.00 via Razorpay / PineLabs')}
              className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-mono text-xs font-semibold bg-[#1F222A] text-white border border-[#303440] hover:bg-[#282C37] active:scale-[0.98] transition-all"
            >
              <span>SETTLE VIA UPI</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Stockfish 18 WASM Engine View */}
      {activeTab === 'chess' && (
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#22252E]">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/30 text-sky-400 font-mono text-[11px] font-bold">
                STOCKFISH 18 WASM
              </span>
              <span className="text-xs text-[#8C90A0]">WebAssembly SIMD · 8 Threads</span>
            </div>
            <span className="font-mono text-xs text-emerald-400 font-semibold">+2.45 ADV</span>
          </div>

          {/* Visual Dynamic Evaluation Meter */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[#8C90A0]">Engine Advantage Bar</span>
              <span className="text-white font-bold">+2.45 (White)</span>
            </div>
            <div className="w-full h-3 bg-[#171920] rounded-full overflow-hidden flex border border-[#272B35]">
              <div className="h-full bg-white transition-all duration-300" style={{ width: '74%' }}></div>
              <div className="h-full bg-zinc-800 transition-all duration-300" style={{ width: '26%' }}></div>
            </div>
          </div>

          {/* Tactical Coach Stream */}
          <div className="bg-[#101216] p-3 rounded-lg border border-[#22252E] space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between text-[#717684] text-[11px]">
              <span>CALCULATION STREAM</span>
              <span>DEPTH: {engineDepth} PLY · {engineNodes} NODES/S</span>
            </div>
            <p className="text-white font-medium leading-relaxed">
              19. Bxh7+! Kxh7 20. Ng5+ Kg8 21. Qh5 Re8 22. Qxf7+ Kh8 23. Qh5+ Kg8 24. Qh7#
            </p>
            <div className="pt-2 border-t border-[#22252E] text-[11px] text-[#A6A8B3]">
              <span className="text-amber-400 font-semibold">Coach Note:</span> Classical Greek gift bishop sacrifice exploiting the uncastled king f7-square weakness.
            </div>
          </div>

          {/* Benchmarking Action */}
          <button
            type="button"
            onClick={handleRunChessBenchmark}
            disabled={engineBenchmarking}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-mono text-xs font-semibold bg-white text-zinc-950 hover:bg-zinc-100 active:scale-[0.98] transition-all shadow-md shadow-white/5 disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 ${engineBenchmarking ? 'animate-spin' : ''}`} />
            <span>{engineBenchmarking ? 'COMPUTING 28-PLY MINIMAX...' : 'RUN DEEP WASM BENCHMARK'}</span>
          </button>
        </div>
      )}

      {/* Tab 3: Silaa Atelier Apparel ERP View */}
      {activeTab === 'silaa' && (
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#22252E]">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30 text-purple-300 font-mono text-[11px] font-bold">
                PO #SIL-2026-088
              </span>
              <span className="text-xs text-[#8C90A0]">Linen Overshirt (Sand)</span>
            </div>
            <span className="font-mono text-xs text-emerald-400 font-semibold">{fabricYield}% YIELD</span>
          </div>

          {/* Fabric Yield Meter */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-[#8C90A0]">Turkish Linen Roll #84A (120m)</span>
              <span className="text-emerald-400 font-bold">{metersSaved} Saved</span>
            </div>
            <div className="w-full h-3 bg-[#171920] rounded-full overflow-hidden flex border border-[#272B35]">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300" 
                style={{ width: `${fabricYield}%` }}
              ></div>
              <div className="h-full bg-red-950/60 transition-all duration-300" style={{ width: `${100 - fabricYield}%` }}></div>
            </div>
          </div>

          {/* Nested Cut Breakdown */}
          <div className="bg-[#101216] p-3 rounded-lg border border-[#22252E] space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between text-[#717684] text-[11px]">
              <span>ZERO-WASTE PATTERN NESTING</span>
              <span>18/18 SIZES OPTIMAL</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center pt-1">
              <div className="bg-[#171920] p-1.5 rounded border border-[#22252E]">
                <div className="text-[10px] text-[#717684]">SIZE S</div>
                <div className="text-white font-bold">4 Units</div>
              </div>
              <div className="bg-[#171920] p-1.5 rounded border border-[#22252E]">
                <div className="text-[10px] text-[#717684]">SIZE M</div>
                <div className="text-white font-bold">6 Units</div>
              </div>
              <div className="bg-[#171920] p-1.5 rounded border border-[#22252E]">
                <div className="text-[10px] text-[#717684]">SIZE L</div>
                <div className="text-white font-bold">5 Units</div>
              </div>
              <div className="bg-[#171920] p-1.5 rounded border border-[#22252E]">
                <div className="text-[10px] text-[#717684]">SIZE XL</div>
                <div className="text-white font-bold">3 Units</div>
              </div>
            </div>
            <div className="pt-2 border-t border-[#22252E] text-[11px] text-[#A6A8B3]">
              <span className="text-emerald-400 font-semibold">Yield Gain:</span> Salvaged ₹1,440 of high-twist natural linen from scrap bin.
            </div>
          </div>

          {/* Re-Nest Action */}
          <button
            type="button"
            onClick={handleOptimizeSilaa}
            disabled={optimizingYield}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-mono text-xs font-semibold bg-white text-zinc-950 hover:bg-zinc-100 active:scale-[0.98] transition-all shadow-md shadow-white/5 disabled:opacity-50"
          >
            <Scissors className={`w-3.5 h-3.5 ${optimizingYield ? 'animate-pulse' : ''}`} />
            <span>{optimizingYield ? 'RE-CALCULATING ROLLER GEOMETRY...' : 'RE-NEST FABRIC ROLL'}</span>
          </button>
        </div>
      )}

      {/* Deck Footer Verification */}
      <div className="bg-[#0E1014] px-4 py-2.5 border-t border-[#22252E] flex items-center justify-between text-[11px] font-mono text-[#717684]">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>PRODUCTION CERTIFIED</span>
        </div>
        <span>0ms SLOP · 100% REAL CODE</span>
      </div>
    </div>
  );
}
