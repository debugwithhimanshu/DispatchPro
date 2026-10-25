import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';

export default function ThemeToggle() {
  const { themeMode, setThemeMode } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Appearance Mode"
      className="inline-flex items-center border border-theme-border bg-theme-bg p-0.5 text-xs font-mono"
    >
      <button
        type="button"
        role="radio"
        aria-checked={themeMode === 'light'}
        onClick={() => setThemeMode('light')}
        className={`inline-flex items-center gap-1 px-2 py-1 transition-colors ${
          themeMode === 'light'
            ? 'bg-theme-surface text-theme-accent font-bold shadow-2xs'
            : 'text-theme-muted hover:text-theme-text'
        }`}
        title="Light Theme"
      >
        <Sun className="w-3 h-3" />
        <span className="hidden sm:inline text-[10px] uppercase tracking-wider">Light</span>
      </button>

      <button
        type="button"
        role="radio"
        aria-checked={themeMode === 'dark'}
        onClick={() => setThemeMode('dark')}
        className={`inline-flex items-center gap-1 px-2 py-1 transition-colors ${
          themeMode === 'dark'
            ? 'bg-theme-surface text-theme-accent font-bold shadow-2xs'
            : 'text-theme-muted hover:text-theme-text'
        }`}
        title="Dark Theme"
      >
        <Moon className="w-3 h-3" />
        <span className="hidden sm:inline text-[10px] uppercase tracking-wider">Dark</span>
      </button>

      <button
        type="button"
        role="radio"
        aria-checked={themeMode === 'system'}
        onClick={() => setThemeMode('system')}
        className={`inline-flex items-center gap-1 px-2 py-1 transition-colors ${
          themeMode === 'system'
            ? 'bg-theme-surface text-theme-accent font-bold shadow-2xs'
            : 'text-theme-muted hover:text-theme-text'
        }`}
        title="System Auto Preference"
      >
        <Laptop className="w-3 h-3" />
        <span className="hidden sm:inline text-[10px] uppercase tracking-wider">Auto</span>
      </button>
    </div>
  );
}
