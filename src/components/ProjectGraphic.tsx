'use client';

import React from 'react';

interface ProjectGraphicProps {
  slug: string;
  name?: string;
  category?: string;
  className?: string;
}

export function ProjectGraphic({ slug, name = 'System Architecture', category = 'Production Software', className = '' }: ProjectGraphicProps) {
  const getWorkflowStages = (projectSlug: string): { label: string; sub: string }[] => {
    switch (projectSlug) {
      case 'dinepulse':
        return [
          { label: '01 / Touch Till', sub: '3-click table checkout' },
          { label: '02 / Kitchen Routing', sub: 'Instant KOT thermal print' },
          { label: '03 / Tax Engine', sub: 'Automated 5% GST split' },
          { label: '04 / Guest Delivery', sub: 'Automated WhatsApp receipt' },
        ];
      case 'silaa':
      case 'silaa-atelier':
        return [
          { label: '01 / Roll Intake', sub: 'Batch & dye lot tracking' },
          { label: '02 / Marker Yield', sub: '99.2% fabric optimization' },
          { label: '03 / CNC Export', sub: 'Direct DXF cutting markers' },
          { label: '04 / Assembly Kanban', sub: '500-garment stitching runs' },
        ];
      case 'tysonchess':
        return [
          { label: '01 / UI Surface', sub: 'Zero-latency React board' },
          { label: '02 / WASM SIMD', sub: 'In-browser Stockfish 18' },
          { label: '03 / Analysis Engine', sub: '24-ply tactical evaluation' },
          { label: '04 / AI Coach', sub: 'Plain-English move guidance' },
        ];
      case 'tysonpe':
        return [
          { label: '01 / Storefront', sub: 'High-conversion checkout' },
          { label: '02 / UPI Payment', sub: '1-click GPay / PhonePe / Paytm' },
          { label: '03 / Compliance', sub: 'Automated Indian GST tax PDFs' },
          { label: '04 / DRM Player', sub: 'Dynamic email watermarking' },
        ];
      case 'physiocare':
        return [
          { label: '01 / Room Booking', sub: 'Clash-free rehab schedule' },
          { label: '02 / Range of Motion', sub: 'Patient recovery angle tracking' },
          { label: '03 / Billing Engine', sub: 'Multi-session GST receipts' },
          { label: '04 / Care Reminders', sub: 'Automated WhatsApp exercises' },
        ];
      default:
        return [
          { label: '01 / Client Surface', sub: 'High-contrast responsive UI' },
          { label: '02 / API & Logic', sub: 'Edge routes & server functions' },
          { label: '03 / Database Layer', sub: 'PostgreSQL schema & indexes' },
          { label: '04 / Deployment', sub: 'Production Vercel & telemetry' },
        ];
    }
  };

  const stages = getWorkflowStages(slug);

  return (
    <div className={`w-full bg-zinc-950 text-white dark:bg-[#090A0E] border border-zinc-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between font-mono select-none ${className}`}>
      {/* Schematic Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-zinc-800 text-xs">
        <div className="space-y-1">
          <div className="text-[11px] text-zinc-500 uppercase tracking-wider">
            System Topology & Operational Flow
          </div>
          <div className="font-semibold text-zinc-200 text-sm font-sans">
            {name}
          </div>
        </div>
        <div className="text-zinc-500 text-[11px] uppercase tracking-wider">
          {category}
        </div>
      </div>

      {/* Workflow Stages Matrix */}
      <div className="py-6 sm:py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stages.map((stage, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 space-y-1.5"
            >
              <div className="text-xs font-semibold text-zinc-200">
                {stage.label}
              </div>
              <div className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                {stage.sub}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Schematic Footer Specs */}
      <div className="pt-5 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-[11px] text-zinc-500">
        <div>Architecture: Sovereign Codebase · Sub-10ms Latency</div>
        <div>Ownership: 100% Client Sovereign IP</div>
      </div>
    </div>
  );
}
