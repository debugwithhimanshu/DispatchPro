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
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 border border-theme-border bg-theme-surface mb-6 divide-y lg:divide-y-0 lg:divide-x divide-theme-border transition-colors">
      {/* Metric 1: Packages Delivered */}
      <div className="p-4 sm:p-5">
        <div className="text-[11px] font-mono uppercase tracking-widest text-theme-muted mb-1">
          01 / Package Coverage
        </div>
        <div className="flex items-baseline space-x-1.5 tabular-nums">
          <span className="text-3xl sm:text-4xl font-extrabold text-theme-text tracking-tight">
            {totalPackages}
          </span>
          <span className="text-sm font-mono text-theme-muted">
            / {totalDemand} demand
          </span>
        </div>
        <div className="mt-2 text-xs font-mono">
          {totalPackages === totalDemand ? (
            <span className="text-theme-success font-medium flex items-center gap-1">
              • 100% Demand satisfied
            </span>
          ) : (
            <span className="text-theme-warning font-medium">
              • {totalDemand - totalPackages} pkg(s) unassigned
            </span>
          )}
        </div>
      </div>

      {/* Metric 2: Total Route Distance */}
      <div className="p-4 sm:p-5">
        <div className="text-[11px] font-mono uppercase tracking-widest text-theme-muted mb-1">
          02 / Total Closed Distance
        </div>
        <div className="flex items-baseline space-x-1.5 tabular-nums">
          <span className="text-3xl sm:text-4xl font-extrabold text-theme-text tracking-tight">
            {totalDistance}
          </span>
          <span className="text-xs font-mono text-theme-muted">
            units
          </span>
        </div>
        <div className="mt-2 text-xs font-mono">
          {improvement?.percent !== null && improvement?.percent !== undefined ? (
            <span className={`font-semibold ${improvement.percent > 0 ? 'text-theme-success' : 'text-theme-muted'}`}>
              {improvement.percent > 0 ? '↓ ' : ''}{improvement.formatted} vs baseline ({baselineDist})
            </span>
          ) : (
            <span className="text-theme-muted">Baseline compare N/A</span>
          )}
        </div>
      </div>

      {/* Metric 3: Time-Window Status */}
      <div className="p-4 sm:p-5">
        <div className="text-[11px] font-mono uppercase tracking-widest text-theme-muted mb-1">
          03 / Time-Window Status
        </div>
        <div className="flex items-baseline space-x-1.5 tabular-nums">
          <span className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
            lateStops > 0 ? 'text-theme-error' : 'text-theme-success'
          }`}>
            {lateStops}
          </span>
          <span className="text-xs font-mono uppercase text-theme-muted">
            {lateStops === 0 ? 'Late' : 'Late Violations'}
          </span>
        </div>
        <div className="mt-2 text-xs font-mono">
          {lateStops === 0 ? (
            <span className="text-theme-success font-medium">• All deadlines satisfied</span>
          ) : (
            <span className="text-theme-error font-medium">• Lateness observed</span>
          )}
        </div>
      </div>

      {/* Metric 4: Unassigned Deliveries */}
      <div className="p-4 sm:p-5">
        <div className="text-[11px] font-mono uppercase tracking-widest text-theme-muted mb-1">
          04 / Unassigned Demand
        </div>
        <div className="flex items-baseline space-x-1.5 tabular-nums">
          <span className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
            unassignedCount > 0 ? 'text-theme-warning' : 'text-theme-text'
          }`}>
            {unassignedCount}
          </span>
          <span className="text-xs font-mono uppercase text-theme-muted">
            Stops Excluded
          </span>
        </div>
        <div className="mt-2 text-xs font-mono">
          {unassignedCount === 0 ? (
            <span className="text-theme-success font-medium">• Zero exclusions</span>
          ) : (
            <span className="text-theme-warning font-medium">• Capacity or tradeoff limit</span>
          )}
        </div>
      </div>
    </div>
  );
}
