import React from 'react';
import { PlayCircle, Printer } from 'lucide-react';
import ThemeToggle from './ThemeToggle.jsx';

export default function Header({
  activeTab,
  setActiveTab,
  onRunAcceptanceTests
}) {
  return (
    <header className="no-print bg-theme-surface border-b border-theme-border sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Left: Geometric Depot Symbol + Wordmark + H04 Badge */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 border-2 border-theme-text flex items-center justify-center bg-theme-surface">
                <div className="w-2 h-2 bg-theme-accent" />
              </div>
              <span className="font-bold text-base tracking-tight text-theme-text font-sans">
                DISPATCH<span className="font-light text-theme-accent">PRO</span>
              </span>
            </div>

            <span className="hidden sm:inline-block text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 border border-theme-border text-theme-muted bg-theme-secondary">
              H04 / Route Optimizer
            </span>

            <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-mono text-theme-success pl-2 border-l border-theme-border">
              <span className="w-1.5 h-1.5 bg-theme-success inline-block" />
              Offline Ready
            </span>
          </div>

          {/* Center/Right: Navigation Tabs + Theme Toggle + Verify Button */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <nav className="flex items-center space-x-1 sm:space-x-2 text-xs font-mono">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-2.5 sm:px-3 py-1.5 transition-colors uppercase tracking-wider text-[11px] font-semibold border-b-2 ${
                  activeTab === 'dashboard'
                    ? 'border-theme-accent text-theme-accent'
                    : 'border-transparent text-theme-muted hover:text-theme-text'
                }`}
              >
                Control Center
              </button>
              <button
                onClick={() => setActiveTab('simulator')}
                className={`px-2.5 sm:px-3 py-1.5 transition-colors uppercase tracking-wider text-[11px] font-semibold border-b-2 ${
                  activeTab === 'simulator'
                    ? 'border-theme-accent text-theme-accent'
                    : 'border-transparent text-theme-muted hover:text-theme-text'
                }`}
              >
                Manual Simulator
              </button>
              <button
                onClick={() => setActiveTab('tests')}
                className={`px-2.5 sm:px-3 py-1.5 transition-colors uppercase tracking-wider text-[11px] font-semibold border-b-2 ${
                  activeTab === 'tests'
                    ? 'border-theme-accent text-theme-accent'
                    : 'border-transparent text-theme-muted hover:text-theme-text'
                }`}
              >
                Run Tests
              </button>
              <button
                onClick={() => setActiveTab('print')}
                className={`hidden md:inline-flex items-center space-x-1 px-3 py-1.5 transition-colors uppercase tracking-wider text-[11px] font-semibold border-b-2 ${
                  activeTab === 'print'
                    ? 'border-theme-accent text-theme-accent'
                    : 'border-transparent text-theme-muted hover:text-theme-text'
                }`}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Sheet</span>
              </button>
            </nav>

            {/* Appearance Mode Selector */}
            <ThemeToggle />

            {/* Verify Engine Button */}
            <button
              onClick={onRunAcceptanceTests}
              className="inline-flex items-center space-x-1.5 bg-theme-accent hover:bg-theme-accentHover text-theme-surface text-[11px] font-mono uppercase tracking-wider font-semibold px-2.5 sm:px-3 py-1.5 transition-colors shadow-2xs"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Verify Engine</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
