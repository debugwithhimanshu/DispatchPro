import React from 'react';
import { HelpCircle, AlertTriangle } from 'lucide-react';

export default function StopTimeline({ strategyData }) {
  const routes = strategyData?.routes || [];
  const unassigned = strategyData?.metrics?.unassignedStops || [];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-indigo-600" />
          Why This Route?
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Step-by-step travel times, waiting buffers, service windows, and assignment rationale.
        </p>
      </div>

      <div className="space-y-4">
        {routes.map((route, rIdx) => (
          <div key={rIdx} className="rounded-lg border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">
                Rider {rIdx + 1} — Departs {route.departureTime}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {route.orderedStops.length} stops · {route.totalDistance} units
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {route.legs.map(leg => {
                const isLate = leg.status === 'LATE';
                return (
                  <div key={leg.stop_id} className={`p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${isLate ? 'bg-red-50' : 'hover:bg-slate-50'}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-7 h-7 rounded flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        isLate ? 'bg-red-100 text-red-700' : 'bg-indigo-50 text-indigo-700'
                      }`}>
                        {leg.stop_id}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5 text-xs">
                          <span className="font-semibold text-slate-900">{leg.stop_id}</span>
                          <span className="text-slate-400 font-mono text-[10px]">({leg.to.x},{leg.to.y}) · {leg.stop.packages}p</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            isLate ? 'bg-red-100 text-red-700' : 'bg-emerald-50 text-emerald-700'
                          }`}>
                            {leg.status}{isLate ? ` +${Math.round(leg.minutesLate)}m` : ''}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{leg.explanation}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500 shrink-0">
                      <div className="text-center">
                        <div className="text-[9px] text-slate-400 uppercase">Arrived</div>
                        <div className="font-semibold text-slate-700">{leg.rawArrivalTimeFormatted}</div>
                      </div>
                      {leg.waitMinutes > 0 && (
                        <div className="text-center">
                          <div className="text-[9px] text-amber-500 uppercase">Wait</div>
                          <div className="font-semibold text-amber-600">{leg.waitMinutes}m</div>
                        </div>
                      )}
                      <div className="text-center">
                        <div className="text-[9px] text-slate-400 uppercase">Service</div>
                        <div className="font-semibold text-slate-700">{leg.serviceStartTimeFormatted}–{leg.serviceEndTimeFormatted}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[9px] text-slate-400 uppercase">Deadline</div>
                        <div className={`font-semibold ${isLate ? 'text-red-600' : 'text-slate-700'}`}>{leg.windowEnd}</div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="px-4 py-2 bg-slate-50 flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-slate-200">
                <span>↩ Return to Depot · {route.returnDistance} units</span>
                <span>Closed at <span className="font-semibold text-slate-600">{route.returnTimeFormatted}</span></span>
              </div>
            </div>
          </div>
        ))}

        {unassigned.length > 0 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <h4 className="text-xs font-semibold text-amber-800 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Unassigned Deliveries ({unassigned.length})
            </h4>
            <div className="space-y-1">
              {unassigned.map(u => (
                <div key={u.stop_id} className="flex items-center justify-between bg-white rounded border border-amber-200 px-3 py-2 text-xs">
                  <div>
                    <span className="font-semibold text-slate-800 font-mono mr-2">{u.stop_id}</span>
                    <span className="text-slate-500">{u.reason}</span>
                  </div>
                  <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">EXCLUDED</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
