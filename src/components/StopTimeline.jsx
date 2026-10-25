import React from 'react';

export default function StopTimeline({ strategyData, selectedStrategyName }) {
  const routes = strategyData?.routes || [];
  const unassigned = strategyData?.metrics?.unassignedStops || [];

  return (
    <section className="mb-8 border border-theme-border bg-theme-surface p-5 transition-colors">
      {/* Section Header */}
      <div className="pb-3 mb-4 border-b border-theme-border">
        <div className="text-xs font-mono uppercase tracking-widest text-theme-accent font-semibold mb-0.5">
          04 / DECISION LOGIC & TIMELINE
        </div>
        <h2 className="text-xl font-bold tracking-tight text-theme-text">
          Why this route?
        </h2>
        <p className="text-xs font-mono text-theme-muted mt-0.5">
          Step-by-step audit of travel times, waiting buffers, service windows, and dead-end returns for <strong className="text-theme-text">{selectedStrategyName}</strong>.
        </p>
      </div>

      {/* Rider Timelines */}
      <div className="space-y-5">
        {routes.map((route, rIdx) => (
          <div key={rIdx} className="border border-theme-border bg-theme-surface">
            {/* Rider Header Bar */}
            <div className="bg-theme-secondary px-4 py-2.5 border-b border-theme-border flex flex-wrap items-center justify-between text-xs font-mono">
              <span className="font-bold text-theme-text">
                Rider {rIdx + 1} Itinerary (Departure: {route.departureTime} → Return: {route.returnTimeFormatted})
              </span>
              <span className="text-theme-muted">
                Load: <strong className="text-theme-text">{route.totalPackages}/{route.capacity} pkgs</strong> | Route Distance: <strong className="text-theme-text">{route.totalDistance} units</strong>
              </span>
            </div>

            {/* Steps List */}
            <div className="divide-y divide-theme-border">
              {route.legs.map((leg) => {
                const isLate = leg.status === 'LATE';
                const hasWait = leg.waitMinutes > 0;

                return (
                  <div
                    key={leg.stop_id}
                    className={`p-3 text-xs font-mono flex flex-col md:flex-row md:items-center justify-between gap-2 ${
                      isLate ? 'bg-theme-accentBg' : 'hover:bg-theme-secondary/50'
                    }`}
                  >
                    {/* Left: Stop Info & Explanation */}
                    <div className="flex items-start md:items-center space-x-3">
                      <div className={`w-7 h-7 border flex items-center justify-center font-bold text-xs shrink-0 ${
                        isLate
                          ? 'border-theme-error bg-theme-error text-theme-surface'
                          : 'border-theme-text bg-theme-text text-theme-bg'
                      }`}>
                        {leg.stop_id}
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-theme-text text-sm">{leg.stop_id}</span>
                          <span className="text-theme-muted">
                            Coord ({leg.to.x}, {leg.to.y}) • {leg.stop.packages} pkg(s)
                          </span>
                          <span className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider ${
                            isLate ? 'bg-theme-error text-theme-surface' : 'bg-theme-elevated text-theme-success'
                          }`}>
                            {leg.status} {isLate ? `(+${Math.round(leg.minutesLate)}m)` : ''}
                          </span>
                        </div>
                        <p className="text-[11px] font-sans text-theme-muted mt-0.5">
                          {leg.explanation}
                        </p>
                      </div>
                    </div>

                    {/* Right: Timeline Matrix */}
                    <div className="flex items-center space-x-4 text-[11px] text-theme-muted tabular-nums shrink-0">
                      <div>
                        <div className="text-[10px] uppercase">Arrival</div>
                        <div className="font-bold text-theme-text">{leg.rawArrivalTimeFormatted}</div>
                      </div>
                      {hasWait && (
                        <div>
                          <div className="text-[10px] uppercase text-theme-warning">Wait</div>
                          <div className="font-bold text-theme-warning">{leg.waitMinutes}m</div>
                        </div>
                      )}
                      <div>
                        <div className="text-[10px] uppercase">Service</div>
                        <div className="font-bold text-theme-text">
                          {leg.serviceStartTimeFormatted}–{leg.serviceEndTimeFormatted}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase">Deadline</div>
                        <div className="font-bold text-theme-text">{leg.windowEnd}</div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Closed-route Return Leg */}
              <div className="p-3 bg-theme-secondary text-xs font-mono flex items-center justify-between text-theme-muted">
                <div>
                  <strong className="text-theme-text">Closed Return to Depot:</strong> Final leg adds {route.returnDistance} units from last stop back to (0,0).
                </div>
                <div>
                  Returned at <strong className="text-theme-text">{route.returnTimeFormatted}</strong>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Unassigned stops notice */}
        {unassigned.length > 0 && (
          <div className="border border-theme-warning bg-theme-accentBg p-3 text-xs font-mono">
            <h4 className="font-bold text-theme-warning uppercase tracking-wider mb-1.5">
              Unassigned Deliveries ({unassigned.length})
            </h4>
            <div className="space-y-1">
              {unassigned.map((u) => (
                <div key={u.stop_id} className="flex justify-between">
                  <span><strong>{u.stop_id}:</strong> {u.reason}</span>
                  <span className="text-[10px] uppercase font-bold text-theme-warning">EXCLUDED</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
