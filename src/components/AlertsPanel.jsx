import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

const STYLES = {
  danger: {
    wrap: 'bg-red-50 border-red-200 text-red-800',
    icon: <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />,
    title: 'text-red-800',
  },
  warning: {
    wrap: 'bg-amber-50 border-amber-200 text-amber-800',
    icon: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />,
    title: 'text-amber-800',
  },
  info: {
    wrap: 'bg-blue-50 border-blue-200 text-blue-800',
    icon: <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />,
    title: 'text-blue-800',
  },
};

export default function AlertsPanel({
  optimizationResult,
  selectedStrategyData,
  validationErrors,
  failedStops = [],
  stopsCount = 0,
}) {
  const alerts = [];

  if (validationErrors?.length > 0)
    validationErrors.forEach(err => alerts.push({ type: 'danger', title: 'Input Error', message: err }));

  if (optimizationResult?.baseline && !optimizationResult.baseline.isValid)
    optimizationResult.baseline.notes.forEach(note =>
      alerts.push({ type: 'warning', title: 'Baseline Infeasible', message: note })
    );

  if (selectedStrategyData?.metrics?.hasCapacityViolation)
    selectedStrategyData.metrics.violations.forEach(v =>
      alerts.push({ type: 'danger', title: 'Capacity Exceeded', message: v })
    );

  selectedStrategyData?.routes?.forEach((route, rIdx) =>
    route.legs.forEach(leg => {
      if (leg.status === 'LATE')
        alerts.push({
          type: 'danger',
          title: `Late Delivery — ${leg.stop_id}`,
          message: `Rider ${rIdx + 1} arrives ${leg.rawArrivalTimeFormatted}, ${Math.round(leg.minutesLate)} min past deadline ${leg.windowEnd}.`,
        });
    })
  );

  selectedStrategyData?.metrics?.unassignedStops?.forEach(u =>
    alerts.push({ type: 'warning', title: `Unassigned: ${u.stop_id}`, message: u.reason })
  );

  if (stopsCount > 8)
    alerts.push({
      type: 'info',
      title: 'Heuristic Mode (> 8 stops)',
      message: 'Exact solver capped at 8 stops. Nearest-Neighbor + 2-Opt active.',
    });

  if (failedStops.length > 0)
    alerts.push({
      type: 'warning',
      title: `${failedStops.length} Failed Stop(s) Excluded`,
      message: `[${failedStops.map(s => s.stop_id).join(', ')}] removed from planning.`,
    });

  if (alerts.length === 0) {
    return (
      <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-6 text-xs text-emerald-700">
        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
        <span><strong>System OK.</strong> All stops assigned, on-time windows met, no warnings.</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Alerts
        </h3>
        <span className="text-xs font-semibold text-slate-500">{alerts.length} issue{alerts.length > 1 ? 's' : ''}</span>
      </div>
      <div className="space-y-2">
        {alerts.map((alert, idx) => {
          const s = STYLES[alert.type] || STYLES.info;
          return (
            <div key={idx} className={`flex items-start gap-2.5 p-3 rounded-lg border text-xs ${s.wrap}`}>
              {s.icon}
              <div>
                <span className={`font-semibold ${s.title}`}>{alert.title}: </span>
                <span className="opacity-90">{alert.message}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
