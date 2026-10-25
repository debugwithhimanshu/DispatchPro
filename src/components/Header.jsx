import React from 'react';
import { PlayCircle, Printer } from 'lucide-react';

export default function Header({
  activeTab,
  setActiveTab,
  onRunAcceptanceTests
}) {
  return (
    <header className="no-print bg-[#FFFEFA] border-b border-[#DAD6CC] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Left: Geometric Depot Symbol + Wordmark + H04 Badge */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {/* Minimalist Swiss depot symbol */}
              <div className="w-6 h-6 border-2 border-[#242520] flex items-center justify-center bg-[#FFFEFA]">
                <div className="w-2 h-2 bg-[#C65332]" />
              </div>
              <span className="font-bold text-base tracking-tight text-[#242520] font-sans">
                DISPATCH<span className="font-light text-[#C65332]">PRO</span>
              </span>
            </div>

            <span className="hidden sm:inline-block text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 border border-[#DAD6CC] text-[#77766F] bg-[#F5F2EB]">
              H04 / Route Optimizer
            </span>

            <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-mono text-[#287653] pl-2 border-l border-[#DAD6CC]">
              <span className="w-1.5 h-1.5 bg-[#287653] inline-block" />
              Offline Ready
            </span>
          </div>

          {/* Center/Right: Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2 text-xs font-mono">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 transition-colors uppercase tracking-wider text-[11px] font-semibold border-b-2 ${
                activeTab === 'dashboard'
                  ? 'border-[#C65332] text-[#C65332]'
                  : 'border-transparent text-[#77766F] hover:text-[#242520]'
              }`}
            >
              Control Center
            </button>
            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-3 py-1.5 transition-colors uppercase tracking-wider text-[11px] font-semibold border-b-2 ${
                activeTab === 'simulator'
                  ? 'border-[#C65332] text-[#C65332]'
                  : 'border-transparent text-[#77766F] hover:text-[#242520]'
              }`}
            >
              Manual Simulator
            </button>
            <button
              onClick={() => setActiveTab('tests')}
              className={`px-3 py-1.5 transition-colors uppercase tracking-wider text-[11px] font-semibold border-b-2 ${
                activeTab === 'tests'
                  ? 'border-[#C65332] text-[#C65332]'
                  : 'border-transparent text-[#77766F] hover:text-[#242520]'
              }`}
            >
              Run Tests
            </button>
            <button
              onClick={() => setActiveTab('print')}
              className={`hidden sm:inline-flex items-center space-x-1 px-3 py-1.5 transition-colors uppercase tracking-wider text-[11px] font-semibold border-b-2 ${
                activeTab === 'print'
                  ? 'border-[#C65332] text-[#C65332]'
                  : 'border-transparent text-[#77766F] hover:text-[#242520]'
              }`}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Sheet</span>
            </button>

            {/* Verify Engine Button */}
            <button
              onClick={onRunAcceptanceTests}
              className="ml-2 inline-flex items-center space-x-1.5 bg-[#C65332] hover:bg-[#A94429] text-[#FFFEFA] text-[11px] font-mono uppercase tracking-wider font-semibold px-3 py-1.5 transition-colors"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>Verify Engine</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
