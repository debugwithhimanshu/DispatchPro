import React, { useState } from 'react';
import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';

export default function StrategyComparison({
  optimizationResult,
  selectedStrategy,
  onSelectStrategy
}) {
  const [expandedLegs, setExpandedLegs] = useState({});

  if (!optimizationResult || !optimizationResult.isValid) {
    return (
      <div className="border border-[#B83C32] bg-[#FCECEB] p-5 text-center mb-8">
        <h3 className="text-sm font-bold text-[#B83C32] uppercase font-mono">
          Engine Optimization Blocked
        </h3>
        <p className="text-xs text-[#242520] mt-1 font-mono">
          Resolve validation errors in the delivery stops table below.
        </p>
      </div>
    );
  }

  const { baseline, nearestNeighbor, optimal, improvement } = optimizationResult;

  const toggleLegDetails = (key) => {
    setExpandedLegs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const strategies = [
    {
      id: 'baseline',
      title: 'Baseline',
      label: 'FIXED ORDER',
      subtitle: 'Static Reference Order',
      data: baseline,
      isExact: true
    },
    {
      id: 'nearestNeighbor',
      title: 'Nearest Neighbor',
      label: 'GREEDY HEURISTIC',
      subtitle: 'Greedy Heuristic Selection',
      data: nearestNeighbor,
      isExact: false
    },
    {
      id: 'optimal',
      title: optimal.isExact ? 'Optimal' : 'Optimal (2-Opt)',
      label: optimal.isExact ? 'EXACT SEARCH' : 'HEURISTIC (2-OPT)',
      subtitle: optimal.isExact ? 'Global Min Distance' : 'Nearest-Neighbor + 2-Opt',
      data: optimal,
      isExact: optimal.isExact
    }
  ];

  return (
    <section className="mb-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-3 mb-4 border-b border-[#DAD6CC]">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-[#C65332] font-semibold mb-0.5">
            03 / STRATEGY EVALUATION
          </div>
          <h2 className="text-xl font-bold tracking-tight text-[#242520]">
            Three strategies. One measurable result.
          </h2>
        </div>
        <div className="text-xs font-mono text-[#77766F]">
          Active on map: <strong className="text-[#C65332] uppercase">{selectedStrategy}</strong>
        </div>
      </div>

      {/* 3 Aligned Comparison Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {strategies.map((strat) => {
          const isSelected = selectedStrategy === strat.id;
          const metrics = strat.data?.metrics || {};
          const totalDist = metrics.totalDistance !== undefined ? metrics.totalDistance : '--';

          return (
            <div
              key={strat.id}
              className={`border bg-[#FFFEFA] p-5 flex flex-col justify-between transition-colors ${
                isSelected
                  ? 'border-[#C65332] ring-1 ring-[#C65332]'
                  : 'border-[#DAD6CC] hover:border-[#77766F]'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between mb-3 pb-2 border-b border-[#DAD6CC]">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#77766F]">
                      {strat.label}
                    </span>
                    <h3 className="text-lg font-bold text-[#242520] tracking-tight">
                      {strat.title}
                    </h3>
                  </div>
                  {isSelected && (
                    <span className="text-[10px] font-mono uppercase tracking-widest bg-[#F5E4DC] text-[#C65332] px-2 py-0.5 font-bold">
                      Selected
                    </span>
                  )}
                </div>

                {/* Primary Metric: Distance */}
                <div className="my-3">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-[#77766F]">
                    Total Route Distance
                  </div>
                  <div className="text-3xl font-extrabold text-[#242520] tracking-tight tabular-nums">
                    {totalDist}
                    <span className="text-xs font-mono text-[#77766F] ml-1 font-normal">units</span>
                  </div>
                  {strat.id === 'optimal' && improvement?.formatted && (
                    <div className="text-xs font-mono font-semibold text-[#287653] mt-0.5">
                      ↓ {improvement.formatted} reduction vs baseline
                    </div>
                  )}
                </div>

                {/* Secondary Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 my-3 p-2.5 bg-[#F5F2EB] border border-[#DAD6CC] text-xs font-mono">
                  <div>
                    <span className="text-[10px] uppercase text-[#77766F]">Delivered</span>
                    <div className="font-bold text-[#242520]">
                      {metrics.totalAssignedPackages} / {metrics.totalDemandPackages} pkgs
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-[#77766F]">Lateness</span>
                    <div className={`font-bold ${metrics.totalLateStops > 0 ? 'text-[#B83C32]' : 'text-[#287653]'}`}>
                      {metrics.totalLateStops} late
                    </div>
                  </div>
                  <div className="pt-1.5 border-t border-[#DAD6CC]">
                    <span className="text-[10px] uppercase text-[#77766F]">Stops Assigned</span>
                    <div className="font-bold text-[#242520]">
                      {metrics.totalAssignedStops} stops
                    </div>
                  </div>
                  <div className="pt-1.5 border-t border-[#DAD6CC]">
                    <span className="text-[10px] uppercase text-[#77766F]">Unassigned</span>
                    <div className={`font-bold ${metrics.unassignedStops?.length > 0 ? 'text-[#A76718]' : 'text-[#242520]'}`}>
                      {metrics.unassignedStops?.length || 0} stops
                    </div>
                  </div>
                </div>

                {/* Rider Route Sequences */}
                <div className="space-y-2 mt-4">
                  {strat.data?.routes.map((route, rIdx) => (
                    <div key={rIdx} className="border border-[#DAD6CC] p-2.5 text-xs font-mono bg-[#FFFEFA]">
                      <div className="flex justify-between items-center mb-1 text-[11px]">
                        <span className="font-bold text-[#242520]">Rider {rIdx + 1}</span>
                        <span className="text-[#77766F]">
                          {route.totalPackages}/{route.capacity} pkgs • {route.totalDistance}u
                        </span>
                      </div>

                      {/* Sequence */}
                      <div className="text-[11px] text-[#242520] flex flex-wrap items-center gap-1">
                        <span className="text-[#77766F]">DEP</span>
                        {route.orderedStops.map((st) => (
                          <React.Fragment key={st.stop_id}>
                            <span className="text-[#77766F]">→</span>
                            <span className="font-bold">{st.stop_id}</span>
                          </React.Fragment>
                        ))}
                        <span className="text-[#77766F]">→ DEP</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Leg Details Toggle */}
                <div className="mt-3">
                  <button
                    onClick={() => toggleLegDetails(strat.id)}
                    className="text-xs font-mono text-[#77766F] hover:text-[#242520] inline-flex items-center gap-1"
                  >
                    <span>{expandedLegs[strat.id] ? 'Hide Leg Breakdown' : 'View Leg-by-Leg Details'}</span>
                    {expandedLegs[strat.id] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {expandedLegs[strat.id] && (
                    <div className="mt-2 overflow-x-auto border border-[#DAD6CC]">
                      <table className="w-full text-left text-[11px] font-mono">
                        <thead className="bg-[#F5F2EB] border-b border-[#DAD6CC] text-[#77766F]">
                          <tr>
                            <th className="p-1.5">Leg</th>
                            <th className="p-1.5">Dist</th>
                            <th className="p-1.5">Arr</th>
                            <th className="p-1.5">Wait</th>
                            <th className="p-1.5">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#DAD6CC]">
                          {strat.data?.routes.flatMap((r, ri) =>
                            r.legs.map((leg) => (
                              <tr key={`${ri}-${leg.stop_id}`}>
                                <td className="p-1.5 font-bold">R{ri + 1}:{leg.stop_id}</td>
                                <td className="p-1.5">{leg.distance}</td>
                                <td className="p-1.5">{leg.rawArrivalTimeFormatted}</td>
                                <td className="p-1.5">{leg.waitMinutes > 0 ? `${leg.waitMinutes}m` : '-'}</td>
                                <td className="p-1.5">
                                  <span className={leg.status === 'LATE' ? 'text-[#B83C32] font-bold' : 'text-[#287653]'}>
                                    {leg.status}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Action */}
              <div className="mt-4 pt-3 border-t border-[#DAD6CC]">
                <button
                  onClick={() => onSelectStrategy(strat.id)}
                  className={`w-full py-2 px-3 text-xs font-mono uppercase tracking-wider font-semibold transition-colors ${
                    isSelected
                      ? 'bg-[#242520] text-[#FFFEFA]'
                      : 'border border-[#DAD6CC] bg-[#FFFEFA] text-[#242520] hover:bg-[#F5F2EB]'
                  }`}
                >
                  {isSelected ? 'Active Strategy on Map' : 'View on Map & Sheet'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
