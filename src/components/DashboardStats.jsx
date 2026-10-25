import React from 'react';

export default function DashboardStats({
  selectedStrategyData,
  baselineData,
  improvement
}) {
  const metrics = selectedStrategyData?.metrics || {};
  const totalPackages = metrics.totalAssignedPackages || 0;
  const totalDemand = metrics.totalDemandPackages || 0;
  const totalDistance = metrics.totalDistance !== undefined ? metrics.totalDistance : '--';
  const baselineDist = baselineData?.metrics?.totalDistance !== undefined ? baselineData.metrics.totalDistance : '--';
  const lateStops = metrics.totalLateStops || 0;
  const unassignedCount = metrics.unassignedStops?.length || 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 border border-[#DAD6CC] bg-[#FFFEFA] mb-6 divide-y lg:divide-y-0 lg:divide-x divide-[#DAD6CC]">
      {/* Metric 1: Packages Delivered */}
      <div className="p-4 sm:p-5">
        <div className="text-[11px] font-mono uppercase tracking-widest text-[#77766F] mb-1">
          01 / Package Coverage
        </div>
        <div className="flex items-baseline space-x-1.5 tabular-nums">
          <span className="text-3xl sm:text-4xl font-extrabold text-[#242520] tracking-tight">
            {totalPackages}
          </span>
          <span className="text-sm font-mono text-[#77766F]">
            / {totalDemand} demand
          </span>
        </div>
        <div className="mt-2 text-xs font-mono">
          {totalPackages === totalDemand ? (
            <span className="text-[#287653] font-medium flex items-center gap-1">
              • 100% Demand satisfied
            </span>
          ) : (
            <span className="text-[#A76718] font-medium">
              • {totalDemand - totalPackages} pkg(s) unassigned
            </span>
          )}
        </div>
      </div>

      {/* Metric 2: Total Route Distance */}
      <div className="p-4 sm:p-5">
        <div className="text-[11px] font-mono uppercase tracking-widest text-[#77766F] mb-1">
          02 / Total Closed Distance
        </div>
        <div className="flex items-baseline space-x-1.5 tabular-nums">
          <span className="text-3xl sm:text-4xl font-extrabold text-[#242520] tracking-tight">
            {totalDistance}
          </span>
          <span className="text-xs font-mono text-[#77766F]">
            units
          </span>
        </div>
        <div className="mt-2 text-xs font-mono">
          {improvement?.percent !== null && improvement?.percent !== undefined ? (
            <span className={`font-semibold ${improvement.percent > 0 ? 'text-[#287653]' : 'text-[#77766F]'}`}>
              {improvement.percent > 0 ? '↓ ' : ''}{improvement.formatted} vs baseline ({baselineDist})
            </span>
          ) : (
            <span className="text-[#77766F]">Baseline compare N/A</span>
          )}
        </div>
      </div>

      {/* Metric 3: Time-Window Status */}
      <div className="p-4 sm:p-5">
        <div className="text-[11px] font-mono uppercase tracking-widest text-[#77766F] mb-1">
          03 / Time-Window Status
        </div>
        <div className="flex items-baseline space-x-1.5 tabular-nums">
          <span className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
            lateStops > 0 ? 'text-[#B83C32]' : 'text-[#287653]'
          }`}>
            {lateStops}
          </span>
          <span className="text-xs font-mono uppercase text-[#77766F]">
            {lateStops === 0 ? 'Late' : 'Late Violations'}
          </span>
        </div>
        <div className="mt-2 text-xs font-mono">
          {lateStops === 0 ? (
            <span className="text-[#287653] font-medium">• All deadlines satisfied</span>
          ) : (
            <span className="text-[#B83C32] font-medium">• Lateness observed</span>
          )}
        </div>
      </div>

      {/* Metric 4: Unassigned Deliveries */}
      <div className="p-4 sm:p-5">
        <div className="text-[11px] font-mono uppercase tracking-widest text-[#77766F] mb-1">
          04 / Unassigned Demand
        </div>
        <div className="flex items-baseline space-x-1.5 tabular-nums">
          <span className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
            unassignedCount > 0 ? 'text-[#A76718]' : 'text-[#242520]'
          }`}>
            {unassignedCount}
          </span>
          <span className="text-xs font-mono uppercase text-[#77766F]">
            Stops Excluded
          </span>
        </div>
        <div className="mt-2 text-xs font-mono">
          {unassignedCount === 0 ? (
            <span className="text-[#287653] font-medium">• Zero exclusions</span>
          ) : (
            <span className="text-[#A76718] font-medium">• Capacity or tradeoff limit</span>
          )}
        </div>
      </div>
    </div>
  );
}
