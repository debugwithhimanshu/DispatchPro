import React from 'react';
import { Printer, ArrowLeft } from 'lucide-react';

export default function DispatchPrintSheet({
  strategyData,
  selectedStrategyName,
  scenarioName,
  onBack
}) {
  const routes = strategyData?.routes || [];
  const metrics = strategyData?.metrics || {};

  return (
    <div className="bg-[#FFFEFA] text-[#242520] p-8 max-w-4xl mx-auto my-6 border border-[#DAD6CC] shadow-2xs font-mono print:m-0 print:p-0 print:border-none print:shadow-none">
      {/* Top Action Bar (hidden on print) */}
      <div className="no-print flex items-center justify-between pb-4 mb-6 border-b border-[#DAD6CC]">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-[#DAD6CC] bg-[#F5F2EB] text-[#242520] hover:bg-[#EAE6DC]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Control Center</span>
        </button>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#C65332] hover:bg-[#A94429] text-[#FFFEFA] uppercase tracking-wider"
        >
          <Printer className="w-4 h-4" />
          <span>Print Manifests (window.print)</span>
        </button>
      </div>

      {/* Manifest Header (Always print-friendly white paper) */}
      <div className="border-b-2 border-[#242520] pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-[#C65332] font-semibold mb-1">
              SOBHASARIA HACKFEST 2026 / TRACK H04
            </div>
            <h1 className="text-2xl font-black tracking-tight text-[#242520] font-sans">
              DispatchPro Itinerary Manifest
            </h1>
            <p className="text-xs text-[#77766F] mt-0.5">
              Multi-Rider Closed-Loop Delivery Schedule & Verification Sheet
            </p>
          </div>
          <div className="text-right text-xs">
            <div>Strategy: <strong className="text-[#242520] uppercase">{selectedStrategyName}</strong></div>
            <div>Scenario: <strong className="text-[#242520]">{scenarioName}</strong></div>
            <div>Date: <strong className="text-[#242520]">{new Date().toLocaleDateString()}</strong></div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2 p-2.5 bg-[#F5F2EB] border border-[#DAD6CC] text-xs">
          <div>Distance: <strong>{metrics.totalDistance} units</strong></div>
          <div>Demand: <strong>{metrics.totalDemandPackages} pkgs</strong></div>
          <div>Assigned: <strong>{metrics.totalAssignedPackages} pkgs</strong></div>
          <div>Late Stops: <strong className={metrics.totalLateStops > 0 ? 'text-[#B83C32]' : 'text-[#287653]'}>{metrics.totalLateStops}</strong></div>
        </div>
      </div>

      {/* Rider Sheets */}
      <div className="space-y-6">
        {routes.map((route, rIdx) => (
          <div key={rIdx} className="page-break border border-[#DAD6CC] p-4 print:border-[#242520]">
            <div className="flex items-center justify-between border-b border-[#DAD6CC] pb-2 mb-3 text-xs">
              <h2 className="text-sm font-bold text-[#242520] uppercase">
                Rider {rIdx + 1} Itinerary
              </h2>
              <div className="text-[#77766F]">
                Departure: <strong>{route.departureTime}</strong> | Return: <strong>{route.returnTimeFormatted}</strong> | Load: <strong>{route.totalPackages}/{route.capacity} pkgs</strong>
              </div>
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#DAD6CC] bg-[#F5F2EB] text-[#77766F] print:bg-transparent">
                  <th className="py-1.5 px-2">Seq</th>
                  <th className="py-1.5 px-2">Stop</th>
                  <th className="py-1.5 px-2">Coord</th>
                  <th className="py-1.5 px-2">Pkgs</th>
                  <th className="py-1.5 px-2">Leg Dist</th>
                  <th className="py-1.5 px-2">Arrival</th>
                  <th className="py-1.5 px-2">Wait</th>
                  <th className="py-1.5 px-2">Service</th>
                  <th className="py-1.5 px-2">Deadline</th>
                  <th className="py-1.5 px-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DAD6CC]">
                {/* Depot Start */}
                <tr className="text-[#77766F]">
                  <td className="py-1.5 px-2 font-bold">0</td>
                  <td className="py-1.5 px-2 font-bold text-[#242520]">DEPOT</td>
                  <td className="py-1.5 px-2">(0,0)</td>
                  <td className="py-1.5 px-2">-</td>
                  <td className="py-1.5 px-2">0</td>
                  <td className="py-1.5 px-2">{route.departureTime}</td>
                  <td className="py-1.5 px-2">-</td>
                  <td className="py-1.5 px-2">Depart {route.departureTime}</td>
                  <td className="py-1.5 px-2">-</td>
                  <td className="py-1.5 px-2 text-[#287653] font-bold">START</td>
                </tr>

                {route.legs.map((leg) => (
                  <tr key={leg.stop_id} className={leg.status === 'LATE' ? 'bg-[#FCECEB] print:bg-transparent' : ''}>
                    <td className="py-1.5 px-2">{leg.stepIndex}</td>
                    <td className="py-1.5 px-2 font-bold text-[#242520]">{leg.stop_id}</td>
                    <td className="py-1.5 px-2">({leg.to.x}, {leg.to.y})</td>
                    <td className="py-1.5 px-2 font-bold">{leg.stop.packages}</td>
                    <td className="py-1.5 px-2">{leg.distance}</td>
                    <td className="py-1.5 px-2 font-bold">{leg.rawArrivalTimeFormatted}</td>
                    <td className="py-1.5 px-2">{leg.waitMinutes > 0 ? `${leg.waitMinutes}m` : '-'}</td>
                    <td className="py-1.5 px-2">{leg.serviceStartTimeFormatted}–{leg.serviceEndTimeFormatted}</td>
                    <td className="py-1.5 px-2">{leg.windowEnd}</td>
                    <td className="py-1.5 px-2">
                      <span className={leg.status === 'LATE' ? 'text-[#B83C32] font-bold' : 'text-[#287653]'}>
                        {leg.status} {leg.status === 'LATE' ? `(+${Math.round(leg.minutesLate)}m)` : ''}
                      </span>
                    </td>
                  </tr>
                ))}

                {/* Depot Return */}
                <tr className="font-bold bg-[#F5F2EB]/50 print:bg-transparent text-[#242520]">
                  <td className="py-1.5 px-2">{route.legs.length + 1}</td>
                  <td className="py-1.5 px-2">DEPOT</td>
                  <td className="py-1.5 px-2">(0,0)</td>
                  <td className="py-1.5 px-2">-</td>
                  <td className="py-1.5 px-2">{route.returnDistance}</td>
                  <td className="py-1.5 px-2">{route.returnTimeFormatted}</td>
                  <td className="py-1.5 px-2">-</td>
                  <td className="py-1.5 px-2">Return Complete</td>
                  <td className="py-1.5 px-2">-</td>
                  <td className="py-1.5 px-2 text-[#C65332]">CLOSED</td>
                </tr>
              </tbody>
            </table>

            <div className="mt-3 flex justify-between text-[11px] text-[#77766F] border-t border-[#DAD6CC] pt-2">
              <span>Total Closed Route Distance: <strong className="text-[#242520]">{route.totalDistance} units</strong> (includes {route.returnDistance}u return)</span>
              <span>Courier Signature: _______________________</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
