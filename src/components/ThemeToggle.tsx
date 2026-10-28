'use client';

import React, { useSyncExternalStore } from 'react';
import { useTheme } from './ThemeProvider';
import { Sun, Moon, Monitor } from 'lucide-react';

const subscribeMounted = () => () => {};
const getMountedSnapshot = () => true;
const getServerMountedSnapshot = () => false;

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribeMounted, getMountedSnapshot, getServerMountedSnapshot);

  if (!mounted) {
    return (
      <div className={`w-8 h-8 rounded-full border border-black/10 dark:border-white/10 ${className}`} />
    );
  }

  const cycleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('system');
    else setTheme('dark');
  };

  const getLabel = () => {
    if (theme === 'system') return 'Theme: System';
    return resolvedTheme === 'dark' ? 'Theme: Dark' : 'Theme: Light';
  };

  return (
    <button
      type="button"
      onClick={cycleTheme}
      className={`btn-tactile inline-flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.96] border focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
        resolvedTheme === 'dark'
          ? 'bg-[#1F1F1F] hover:bg-[#272727] text-white border-white/[0.12]'
          : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border-black/[0.12] shadow-xs'
      } ${className}`}
      aria-label={getLabel()}
      title={getLabel()}
    >
      {theme === 'system' ? (
        <Monitor className="w-3.5 h-3.5 opacity-90" />
      ) : resolvedTheme === 'dark' ? (
        <Moon className="w-3.5 h-3.5 text-zinc-300" />
      ) : (
        <Sun className="w-3.5 h-3.5 text-amber-600" />
      )}
    </button>
  );
}
