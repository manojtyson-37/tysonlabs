'use client';

import React, { useState } from 'react';
import { 
  Printer, 
  Check, 
  UtensilsCrossed, 
  Scissors, 
  QrCode,
  ArrowRight
} from 'lucide-react';

type PreviewMode = 'dinepulse' | 'silaa';

export function HeroOperationalPreview() {
  const [mode, setMode] = useState<PreviewMode>('dinepulse');
  const [kotFired, setKotFired] = useState(false);
  const [settled, setSettled] = useState(false);
  const [markerExported, setMarkerExported] = useState(false);

  const handleFireKot = () => {
    setKotFired(true);
    setTimeout(() => setKotFired(false), 3500);
  };

  const handleSettle = () => {
    setSettled(true);
    setTimeout(() => setSettled(false), 3500);
  };

  const handleExportMarker = () => {
    setMarkerExported(true);
    setTimeout(() => setMarkerExported(false), 3500);
  };

  return (
    <div className="w-full bg-[#181818] border border-white/[0.12] rounded-2xl overflow-hidden shadow-2xl shadow-black/80 font-sans">
      {/* Top Controller Ribbon */}
      <div className="bg-[#1F1F1F] px-4 py-3 border-b border-white/[0.08] flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="text-xs font-semibold text-white tracking-wide">
            {mode === 'dinepulse' ? 'DinePulse POS Till' : 'Silaa Cutting Optimizer'}
          </span>
          <span className="text-[11px] font-mono text-[#666666]">
            {mode === 'dinepulse' ? 'v2.4 · Terminal 01' : 'v1.8 · Marker Engine'}
          </span>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-1 bg-[#000000] p-1 rounded-lg border border-white/[0.06] text-xs">
          <button
            type="button"
            onClick={() => setMode('dinepulse')}
            className={`btn-tactile px-3 py-1 rounded-md text-xs font-medium transition-all ${
              mode === 'dinepulse'
                ? 'bg-[#272727] text-white shadow-sm'
                : 'text-[#9B9B9B] hover:text-white'
            }`}
          >
            Restaurant Till
          </button>
          <button
            type="button"
            onClick={() => setMode('silaa')}
            className={`btn-tactile px-3 py-1 rounded-md text-xs font-medium transition-all ${
              mode === 'silaa'
                ? 'bg-[#272727] text-white shadow-sm'
                : 'text-[#9B9B9B] hover:text-white'
            }`}
          >
            Garment ERP
          </button>
        </div>
      </div>

      {/* Mode 1: Authentic Petpooja-Grade Restaurant POS Till */}
      {mode === 'dinepulse' && (
        <div className="p-5 space-y-4">
          {/* Table & Order Metadata */}
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#272727] font-semibold text-white">
                Table 04
              </span>
              <span className="text-[#9B9B9B]">Dine In · 4 Covers</span>
            </div>
            <div className="font-mono text-[#9B9B9B] text-[11px]">
              Waiter: Manoj · KOT #108
            </div>
          </div>

          {/* Line Items with Authentic FSSAI Veg / Non-Veg Symbols */}
          <div className="space-y-2.5 text-xs">
            {/* Item 1: Veg */}
            <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-[#000000] border border-white/[0.04]">
              <div className="flex items-center gap-2.5">
                {/* FSSAI Veg Green Dot Square */}
                <span className="w-3.5 h-3.5 rounded-[2px] border border-emerald-500 flex items-center justify-center shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                </span>
                <span className="text-white font-medium">Paneer Butter Masala</span>
                <span className="font-mono text-[#666666]">x 1</span>
              </div>
              <div className="font-mono text-white">₹320</div>
            </div>

            {/* Item 2: Veg */}
            <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-[#000000] border border-white/[0.04]">
              <div className="flex items-center gap-2.5">
                {/* FSSAI Veg Green Dot Square */}
                <span className="w-3.5 h-3.5 rounded-[2px] border border-emerald-500 flex items-center justify-center shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                </span>
                <span className="text-white font-medium">Butter Garlic Naan</span>
                <span className="font-mono text-[#666666]">x 4</span>
              </div>
              <div className="font-mono text-white">₹240</div>
            </div>

            {/* Item 3: Non-Veg */}
            <div className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-[#000000] border border-white/[0.04]">
              <div className="flex items-center gap-2.5">
                {/* FSSAI Non-Veg Red Dot Square */}
                <span className="w-3.5 h-3.5 rounded-[2px] border border-rose-500 flex items-center justify-center shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                </span>
                <span className="text-white font-medium">Murgh Dum Biryani (Handi)</span>
                <span className="font-mono text-[#666666]">x 1</span>
              </div>
              <div className="font-mono text-white">₹380</div>
            </div>
          </div>

          {/* Indian GST Billing Breakdown */}
          <div className="p-3 rounded-xl bg-[#000000] border border-white/[0.04] space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-[#9B9B9B]">
              <span>Subtotal</span>
              <span>₹940.00</span>
            </div>
            <div className="flex justify-between text-[#666666] text-[11px]">
              <span>CGST (2.5%)</span>
              <span>₹23.50</span>
            </div>
            <div className="flex justify-between text-[#666666] text-[11px]">
              <span>SGST (2.5%)</span>
              <span>₹23.50</span>
            </div>
            <div className="pt-2 border-t border-white/[0.08] flex justify-between text-white font-semibold text-sm">
              <span className="font-sans">Total Payable</span>
              <span className="text-emerald-400">₹987.00</span>
            </div>
          </div>

          {/* Operational Feedback Notice */}
          {kotFired && (
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>KOT #108 auto dispatched to Kitchen Tandoor and Curry thermal printers.</span>
            </div>
          )}

          {settled && (
            <div className="p-2.5 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs flex items-center gap-2">
              <QrCode className="w-4 h-4 shrink-0" />
              <span>₹987 settled via Dynamic Razorpay UPI QR. Invoice generated.</span>
            </div>
          )}

          {/* Operational Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleFireKot}
              className="btn-tactile py-2.5 px-3 rounded-xl bg-[#272727] text-white hover:bg-[#313131] border border-white/[0.1] text-xs font-semibold flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              <span>FIRE KOT</span>
            </button>
            <button
              type="button"
              onClick={handleSettle}
              className="btn-tactile py-2.5 px-3 rounded-xl bg-white text-black hover:bg-zinc-200 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md active:scale-[0.98]"
            >
              <span>SETTLE ₹987</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Mode 2: Silaa Apparel Marker Nesting Engine */}
      {mode === 'silaa' && (
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#272727] font-semibold text-white">
                Roll #84A
              </span>
              <span className="text-[#9B9B9B]">Turkish Flax Linen · 120m</span>
            </div>
            <div className="font-mono text-emerald-400 text-[11px] font-semibold">
              99.4% Marker Yield
            </div>
          </div>

          {/* Nesting Geometry Visualizer */}
          <div className="p-3.5 rounded-xl bg-[#000000] border border-white/[0.04] space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#9B9B9B] font-medium">Cut Plan: Spring Atelier Collection</span>
              <span className="font-mono text-[#666666] text-[11px]">Width: 148cm</span>
            </div>

            {/* Pattern Block Representation */}
            <div className="h-16 rounded-lg bg-[#181818] border border-white/[0.08] p-1.5 flex gap-1 items-stretch overflow-hidden">
              <div className="w-[30%] bg-emerald-500/20 border border-emerald-500/40 rounded flex flex-col justify-center items-center text-[10px] text-emerald-300 font-mono">
                <span>Front Body</span>
                <span className="text-[9px] text-[#666666]">M × 4</span>
              </div>
              <div className="w-[25%] bg-sky-500/20 border border-sky-500/40 rounded flex flex-col justify-center items-center text-[10px] text-sky-300 font-mono">
                <span>Back Body</span>
                <span className="text-[9px] text-[#666666]">M × 4</span>
              </div>
              <div className="w-[20%] bg-amber-500/20 border border-amber-500/40 rounded flex flex-col justify-center items-center text-[10px] text-amber-300 font-mono">
                <span>Sleeves</span>
                <span className="text-[9px] text-[#666666]">L × 8</span>
              </div>
              <div className="w-[15%] bg-purple-500/20 border border-purple-500/40 rounded flex flex-col justify-center items-center text-[10px] text-purple-300 font-mono">
                <span>Collars</span>
                <span className="text-[9px] text-[#666666]">S × 4</span>
              </div>
              <div className="w-[10%] bg-zinc-800 border border-dashed border-white/20 rounded flex items-center justify-center text-[9px] text-[#666666] font-mono">
                0.6%
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
              <div className="p-2 rounded bg-[#181818] border border-white/[0.04]">
                <div className="text-[#666666] text-[10px]">FABRIC SAVED</div>
                <div className="text-white font-semibold mt-0.5">1.8 meters</div>
              </div>
              <div className="p-2 rounded bg-[#181818] border border-white/[0.04]">
                <div className="text-[#666666] text-[10px]">COST RETAINED</div>
                <div className="text-emerald-400 font-semibold mt-0.5">₹1,620 / roll</div>
              </div>
            </div>
          </div>

          {markerExported && (
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>Marker file exported: SILAA_ROLL84A_NESTED.DXF sent to CNC cutter.</span>
            </div>
          )}

          {/* Action Button */}
          <button
            type="button"
            onClick={handleExportMarker}
            className="btn-tactile w-full py-2.5 px-3 rounded-xl bg-white text-black hover:bg-zinc-200 text-xs font-semibold flex items-center justify-center gap-2 shadow-md active:scale-[0.98]"
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>EXPORT CNC CUTTING MARKER (DXF)</span>
          </button>
        </div>
      )}

      {/* Grounded Verification Footer */}
      <div className="bg-[#1F1F1F] px-4 py-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs text-[#666666]">
        <div className="flex items-center gap-1.5">
          <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[#9B9B9B] font-medium">Petpooja & CNC Industry Standards</span>
        </div>
        <span className="font-mono text-[11px]">Real Indian GST & FSSAI Math</span>
      </div>
    </div>
  );
}
