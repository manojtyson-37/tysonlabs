'use client';

import React, { createContext, useContext, useEffect, useSyncExternalStore } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemDark() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyThemeToDOM(targetTheme: Theme): 'light' | 'dark' {
  if (typeof document === 'undefined') return 'dark';
  const root = document.documentElement;
  const isDark = targetTheme === 'dark' || (targetTheme === 'system' && getSystemDark());

  if (isDark) {
    root.classList.add('dark');
    root.classList.remove('light');
    return 'dark';
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
    return 'light';
  }
}

function subscribeTheme(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change', callback);
  window.addEventListener('tysonlabs-theme-change', callback);
  return () => {
    window.removeEventListener('storage', callback);
    media.removeEventListener('change', callback);
    window.removeEventListener('tysonlabs-theme-change', callback);
  };
}

function getThemeSnapshot(): Theme {
  if (typeof window === 'undefined') return 'system';
  try {
    const stored = localStorage.getItem('tysonlabs-theme') as Theme | null;
    return stored || 'system';
  } catch {
    return 'system';
  }
}

function getServerThemeSnapshot(): Theme {
  return 'dark';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getServerThemeSnapshot);

  // Keep DOM in sync when theme changes
  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  const resolvedTheme: 'light' | 'dark' =
    theme === 'dark' ? 'dark' : theme === 'light' ? 'light' : getSystemDark() ? 'dark' : 'light';

  const setTheme = (newTheme: Theme) => {
    try {
      localStorage.setItem('tysonlabs-theme', newTheme);
    } catch {}
    applyThemeToDOM(newTheme);
    window.dispatchEvent(new Event('tysonlabs-theme-change'));
  };

  const toggleTheme = () => {
    const next = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
