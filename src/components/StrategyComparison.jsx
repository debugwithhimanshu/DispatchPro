import React, { useState } from 'react';
import RiderRouteCard from './RiderRouteCard.jsx';
import { Award, Zap, Layers, AlertCircle } from 'lucide-react';

export default function StrategyComparison({ optimizationResult, selectedStrategy, onSelectStrategy }) {
  const [expandedLegs, setExpandedLegs] = useState({});

  if (!optimizationResult || !optimizationResult.isValid) {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-8 text-center mb-6">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
        <h3 className="text-sm font-semibold text-red-700">Optimization Blocked</h3>
        <p className="text-xs text-slate-500 mt-1">Fix validation errors in the stops table to compute strategies.</p>
      </div>
    );
  }

  const { baseline, nearestNeighbor, optimal } = optimizationResult;
  const toggle = key => setExpandedLegs(prev => ({ ...prev, [key]: !prev[key] }));

  const strategies = [
    {
      id: 'baseline',
      title: 'Baseline',
      subtitle: 'Fixed Static Benchmark',
      badge: 'Reference',
      badgeCls: 'bg-slate-100 text-slate-500',
      data: baseline,
      icon: Layers,
    },
    {
      id: 'nearestNeighbor',
      title: 'Nearest Neighbor',
      subtitle: 'Greedy Heuristic',
      badge: 'Heuristic',
      badgeCls: 'bg-amber-50 text-amber-600',
      data: nearestNeighbor,
      icon: Zap,
    },
    {
      id: 'optimal',
      title: optimal.isExact ? 'Optimal (Exact)' : 'Optimal (2-Opt)',
      subtitle: optimal.isExact ? 'Global Minimum' : 'NN + 2-Opt',
      badge: optimal.isExact ? 'Exact' : 'Heuristic',
      badgeCls: optimal.isExact ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-600',
      data: optimal,
      icon: Award,
    },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Strategy Comparison</h2>
          <p className="text-xs text-slate-500">Baseline · Heuristic · Optimal dispatch side-by-side.</p>
        </div>
        <span className="text-xs text-slate-500">
          Active: <span className="font-semibold text-indigo-600">{selectedStrategy}</span>
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {strategies.map(strat => {
          const isSelected = selectedStrategy === strat.id;
          const m = strat.data?.metrics || {};
          const Icon = strat.icon;

          return (
            <div
              key={strat.id}
              className={`rounded-xl border bg-white flex flex-col transition-shadow ${
                isSelected
                  ? 'border-indigo-500 ring-2 ring-indigo-100 shadow-md'
                  : 'border-slate-200 hover:border-slate-300 shadow-sm'
              }`}
            >
              <div className="p-4 flex-1">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{strat.title}</h3>
                      <p className="text-xs text-slate-400">{strat.subtitle}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${strat.badgeCls}`}>
                    {strat.badge}
                  </span>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100 mb-3">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">Distance</div>
                    <div className="text-xl font-bold text-slate-900">
                      {m.totalDistance ?? '—'}<span className="text-xs font-normal text-slate-400 ml-1">u</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">Delivered</div>
                    <div className="text-xl font-bold text-slate-900">
                      {m.totalAssignedPackages}/{m.totalDemandPackages}<span className="text-xs font-normal text-slate-400 ml-1">pkgs</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-200">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">Late</div>
                    <div className={`text-sm font-semibold ${m.totalLateStops > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {m.totalLateStops} stops
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-200">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">Unassigned</div>
                    <div className={`text-sm font-semibold ${m.unassignedStops?.length > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                      {m.unassignedStops?.length || 0} stops
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {strat.data?.notes?.length > 0 && (
                  <ul className="mb-3 space-y-0.5">
                    {strat.data.notes.map((n, i) => (
                      <li key={i} className="text-[11px] text-slate-500 flex gap-1">
                        <span className="text-slate-300">›</span>{n}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Rider cards */}
                {strat.data?.routes.map((route, rIdx) => (
                  <RiderRouteCard
                    key={rIdx}
                    riderIndex={rIdx}
                    route={route}
                    showLegDetails={!!expandedLegs[`${strat.id}_${rIdx}`]}
                    onToggleLegDetails={() => toggle(`${strat.id}_${rIdx}`)}
                  />
                ))}
              </div>

              {/* Footer */}
              <div className="px-4 pb-4">
                <button
                  onClick={() => onSelectStrategy(strat.id)}
                  className={`w-full py-2 text-sm font-semibold rounded-lg border transition-colors ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50 hover:border-slate-400'
                  }`}
                >
                  {isSelected ? '✓ Active Strategy' : 'Select & View on Map'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
