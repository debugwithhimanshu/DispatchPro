import React from 'react';

export default function StopTimeline({ strategyData, selectedStrategyName }) {
  const routes = strategyData?.routes || [];
  const unassigned = strategyData?.metrics?.unassignedStops || [];

  return (
    <section className="mb-8 border border-[#DAD6CC] bg-[#FFFEFA] p-5">
      {/* Section Header */}
      <div className="pb-3 mb-4 border-b border-[#DAD6CC]">
        <div className="text-xs font-mono uppercase tracking-widest text-[#C65332] font-semibold mb-0.5">
          04 / DECISION LOGIC & TIMELINE
        </div>
        <h2 className="text-xl font-bold tracking-tight text-[#242520]">
          Why this route?
        </h2>
        <p className="text-xs font-mono text-[#77766F] mt-0.5">
          Step-by-step audit of travel times, waiting buffers, service windows, and dead-end returns for <strong className="text-[#242520]">{selectedStrategyName}</strong>.
        </p>
      </div>

      {/* Rider Timelines */}
      <div className="space-y-5">
        {routes.map((route, rIdx) => (
          <div key={rIdx} className="border border-[#DAD6CC] bg-[#FFFEFA]">
            {/* Rider Header Bar */}
            <div className="bg-[#F5F2EB] px-4 py-2.5 border-b border-[#DAD6CC] flex flex-wrap items-center justify-between text-xs font-mono">
              <span className="font-bold text-[#242520]">
                Rider {rIdx + 1} Itinerary (Departure: {route.departureTime} → Return: {route.returnTimeFormatted})
              </span>
              <span className="text-[#77766F]">
                Load: <strong>{route.totalPackages}/{route.capacity} pkgs</strong> | Route Distance: <strong>{route.totalDistance} units</strong>
              </span>
            </div>

            {/* Steps List */}
            <div className="divide-y divide-[#DAD6CC]">
              {route.legs.map((leg) => {
                const isLate = leg.status === 'LATE';
                const hasWait = leg.waitMinutes > 0;

                return (
                  <div
                    key={leg.stop_id}
                    className={`p-3 text-xs font-mono flex flex-col md:flex-row md:items-center justify-between gap-2 ${
                      isLate ? 'bg-[#FCECEB]' : 'hover:bg-[#F5F2EB]/50'
                    }`}
                  >
                    {/* Left: Stop Info & Explanation */}
                    <div className="flex items-start md:items-center space-x-3">
                      <div className={`w-7 h-7 border flex items-center justify-center font-bold text-xs shrink-0 ${
                        isLate
                          ? 'border-[#B83C32] bg-[#B83C32] text-[#FFFEFA]'
                          : 'border-[#242520] bg-[#242520] text-[#FFFEFA]'
                      }`}>
                        {leg.stop_id}
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-[#242520] text-sm">{leg.stop_id}</span>
                          <span className="text-[#77766F]">
                            Coord ({leg.to.x}, {leg.to.y}) • {leg.stop.packages} pkg(s)
                          </span>
                          <span className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider ${
                            isLate ? 'bg-[#B83C32] text-[#FFFEFA]' : 'bg-[#EAE6DC] text-[#287653]'
                          }`}>
                            {leg.status} {isLate ? `(+${Math.round(leg.minutesLate)}m)` : ''}
                          </span>
                        </div>
                        <p className="text-[11px] font-sans text-[#77766F] mt-0.5">
                          {leg.explanation}
                        </p>
                      </div>
                    </div>

                    {/* Right: Timeline Matrix */}
                    <div className="flex items-center space-x-4 text-[11px] text-[#77766F] tabular-nums shrink-0">
                      <div>
                        <div className="text-[10px] uppercase">Arrival</div>
                        <div className="font-bold text-[#242520]">{leg.rawArrivalTimeFormatted}</div>
                      </div>
                      {hasWait && (
                        <div>
                          <div className="text-[10px] uppercase text-[#A76718]">Wait</div>
                          <div className="font-bold text-[#A76718]">{leg.waitMinutes}m</div>
                        </div>
                      )}
                      <div>
                        <div className="text-[10px] uppercase">Service</div>
                        <div className="font-bold text-[#242520]">
                          {leg.serviceStartTimeFormatted}–{leg.serviceEndTimeFormatted}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase">Deadline</div>
                        <div className="font-bold text-[#242520]">{leg.windowEnd}</div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Closed-route Return Leg */}
              <div className="p-3 bg-[#F5F2EB] text-xs font-mono flex items-center justify-between text-[#77766F]">
                <div>
                  <strong className="text-[#242520]">Closed Return to Depot:</strong> Final leg adds {route.returnDistance} units from last stop back to (0,0).
                </div>
                <div>
                  Returned at <strong className="text-[#242520]">{route.returnTimeFormatted}</strong>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Unassigned stops notice */}
        {unassigned.length > 0 && (
          <div className="border border-[#A76718] bg-[#FDF6ED] p-3 text-xs font-mono">
            <h4 className="font-bold text-[#A76718] uppercase tracking-wider mb-1.5">
              Unassigned Deliveries ({unassigned.length})
            </h4>
            <div className="space-y-1">
              {unassigned.map((u) => (
                <div key={u.stop_id} className="flex justify-between">
                  <span><strong>{u.stop_id}:</strong> {u.reason}</span>
                  <span className="text-[10px] uppercase font-bold text-[#A76718]">EXCLUDED</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
