"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import '@/context/i18n';

export type AppTheme = 'light' | 'deep-dark';

interface ThemeContextValue {
  theme: AppTheme;
  setTheme: (t: AppTheme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_KEY = 'app.theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Varsayılan deep-dark; eski localStorage değerleri ("whatsapp") -> "light" olarak dönüştürülür
  const [theme, setThemeState] = useState<AppTheme>('deep-dark');

  useEffect(() => {
    try {
      const storedRaw = localStorage.getItem(THEME_KEY);
      if (storedRaw === 'whatsapp') {
        setThemeState('light');
      } else if (storedRaw === 'light' || storedRaw === 'deep-dark') {
        setThemeState(storedRaw as AppTheme);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(THEME_KEY, theme); } catch {}
    const root = document.documentElement;
    root.classList.remove('theme-whatsapp', 'theme-deep', 'theme-light');
    if (theme === 'light') {
      root.classList.add('theme-light', 'theme-whatsapp');
    }
    if (theme === 'deep-dark') root.classList.add('theme-deep');
  }, [theme]);

  const setTheme = (t: AppTheme) => setThemeState(t);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
