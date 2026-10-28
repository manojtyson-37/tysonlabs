'use client';

import React, { useEffect, useRef, useState } from 'react';

interface TaglineRevealProps {
  phrase?: string;
  subphrase?: string;
}

export function TaglineReveal({
  phrase = 'We engineer sovereign software for operators who run real commerce.',
  subphrase = 'Sub 10ms restaurant billing. Zero waste factory markers. Local first architectures built without vendor tax.',
}: TaglineRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeWordIndex, setActiveWordIndex] = useState<number>(0);

  const words = `${phrase} ${subphrase}`.split(' ');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let rafId: number | null = null;

    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const rect = container.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // When container enters from bottom to middle of screen
        const startTrigger = windowHeight * 0.85;
        const endTrigger = windowHeight * 0.35;

        if (rect.top > startTrigger) {
          setActiveWordIndex(0);
        } else if (rect.top < endTrigger) {
          setActiveWordIndex(words.length);
        } else {
          const progress = (startTrigger - rect.top) / (startTrigger - endTrigger);
          const clamped = Math.max(0, Math.min(1, progress));
          const targetIndex = Math.round(clamped * words.length);
          setActiveWordIndex(targetIndex);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [words.length]);

  return (
    <section
      ref={containerRef}
      className="max-w-7xl mx-auto px-6 sm:px-8 py-16 sm:py-24"
      aria-label="Studio Manifesto"
    >
      <div className="max-w-3xl">
        <div className="text-xs uppercase tracking-wider font-semibold text-[#666666] font-mono mb-4 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>Core Engineering Thesis</span>
        </div>

        <p className="font-display font-semibold text-3xl sm:text-5xl md:text-6xl tracking-tight leading-[1.12] [text-wrap:balance]">
          {words.map((word, idx) => {
            const isRevealed = idx < activeWordIndex;
            return (
              <span
                key={`${word}-${idx}`}
                className={`inline-block mr-[0.28em] transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isRevealed
                    ? 'text-white'
                    : 'text-white/[0.25]'
                }`}
              >
                {word}
              </span>
            );
          })}
        </p>
      </div>
    </section>
  );
}

