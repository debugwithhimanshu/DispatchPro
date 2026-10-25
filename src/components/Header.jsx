import React, { useState } from 'react';
import { Truck, PlayCircle, Printer, LayoutDashboard, SlidersHorizontal, FlaskConical, Menu, X } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Control Center', icon: LayoutDashboard },
  { id: 'simulator', label: 'Simulator', icon: SlidersHorizontal },
  { id: 'tests', label: 'Run Tests', icon: FlaskConical },
  { id: 'print', label: 'Print Sheet', icon: Printer },
];

export default function Header({
  activeTab,
  setActiveTab,
  onRunAcceptanceTests,
  isExactMode,
  unassignedCount,
  lateCount,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (id) => { setActiveTab(id); setMobileOpen(false); };

  return (
    <header className="no-print sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-4">

          {/* Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Truck className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 tracking-tight">DispatchPro</span>
                <span className="hidden sm:inline px-1.5 py-0.5 text-[10px] font-semibold rounded bg-slate-100 text-slate-500 border border-slate-200">
                  H04
                </span>
                <span className={`hidden sm:inline px-1.5 py-0.5 text-[10px] font-semibold rounded border ${
                  isExactMode
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {isExactMode ? 'Exact' : '2-Opt'}
                </span>
              </div>
              <p className="hidden sm:block text-[10px] text-slate-400 leading-none mt-0.5">
                Sobhasaria Hackfest 2026
              </p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => handleNav(id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm transition-colors ${
                    active
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              );
            })}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {lateCount > 0 && (
              <span className="hidden sm:inline px-2 py-1 text-xs font-semibold rounded bg-red-50 text-red-600 border border-red-200">
                {lateCount} Late
              </span>
            )}
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              Offline
            </div>
            <button
              onClick={onRunAcceptanceTests}
              className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-colors"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Verify Engine</span>
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-2">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => handleNav(id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm transition-colors ${
                  active
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 font-medium'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
