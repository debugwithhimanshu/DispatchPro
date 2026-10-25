import React from 'react';
import { Printer, Truck, ArrowLeft } from 'lucide-react';

export default function DispatchPrintSheet({
  strategyData,
  selectedStrategyName,
  scenarioName,
  onBack
}) {
  const routes = strategyData?.routes || [];
  const metrics = strategyData?.metrics || {};

  return (
    <div className="bg-white p-6 max-w-4xl mx-auto my-6 rounded-xl border border-slate-200 shadow-sm print:m-0 print:p-0 print:border-none print:shadow-none">
      {/* Action Bar (hidden on print) */}
      <div className="no-print flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Control Center</span>
        </button>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 shadow-xs"
        >
          <Printer className="w-4 h-4" />
          <span>Print Dispatch Manifests (window.print)</span>
        </button>
      </div>

      {/* Manifest Header */}
      <div className="border-b-2 border-slate-900 pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <Truck className="w-6 h-6 text-slate-900" />
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                DispatchPro Manifest
              </h1>
            </div>
            <p className="text-xs text-slate-600 uppercase font-mono mt-0.5">
              H04: Delivery Route & Assignment Optimizer | Sobhasaria Hackfest 2026
            </p>
          </div>
          <div className="text-right text-xs font-mono">
            <div><strong>Active Strategy:</strong> {selectedStrategyName}</div>
            <div><strong>Scenario:</strong> {scenarioName}</div>
            <div><strong>Date:</strong> {new Date().toLocaleDateString()}</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2 p-2.5 bg-slate-100 rounded text-xs font-mono">
          <div><strong>Total Distance:</strong> {metrics.totalDistance} units</div>
          <div><strong>Total Demand:</strong> {metrics.totalDemandPackages} pkgs</div>
          <div><strong>Assigned Packages:</strong> {metrics.totalAssignedPackages} pkgs</div>
          <div><strong>Late Stops:</strong> {metrics.totalLateStops}</div>
        </div>
      </div>

      {/* Rider Sheets */}
      <div className="space-y-8">
        {routes.map((route, rIdx) => (
          <div key={rIdx} className="page-break border border-slate-300 rounded-lg p-4 print:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-300 pb-2 mb-3">
              <h2 className="text-base font-bold text-slate-900 uppercase">
                Rider {rIdx + 1} Itinerary & Manifest
              </h2>
              <div className="text-xs font-mono text-slate-700">
                Departure: <strong>{route.departureTime}</strong> | Return: <strong>{route.returnTimeFormatted}</strong> | Load: <strong>{route.totalPackages}/{route.capacity} pkgs</strong>
              </div>
            </div>

            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-slate-300 bg-slate-50 print:bg-transparent">
                  <th className="py-1.5 px-2">Seq</th>
                  <th className="py-1.5 px-2">Stop ID</th>
                  <th className="py-1.5 px-2">Coords</th>
                  <th className="py-1.5 px-2">Pkgs</th>
                  <th className="py-1.5 px-2">Leg Dist</th>
                  <th className="py-1.5 px-2">Arr Time</th>
                  <th className="py-1.5 px-2">Wait</th>
                  <th className="py-1.5 px-2">Service Window</th>
                  <th className="py-1.5 px-2">Deadline</th>
                  <th className="py-1.5 px-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {/* Depot Start */}
                <tr className="text-slate-600 bg-slate-50/50">
                  <td className="py-1.5 px-2 font-bold">0</td>
                  <td className="py-1.5 px-2 font-bold">DEPOT</td>
                  <td className="py-1.5 px-2">(0,0)</td>
                  <td className="py-1.5 px-2">-</td>
                  <td className="py-1.5 px-2">0</td>
                  <td className="py-1.5 px-2">{route.departureTime}</td>
                  <td className="py-1.5 px-2">-</td>
                  <td className="py-1.5 px-2">Depart: {route.departureTime}</td>
                  <td className="py-1.5 px-2">-</td>
                  <td className="py-1.5 px-2 font-semibold text-emerald-700">ORIGIN</td>
                </tr>

                {route.legs.map((leg) => (
                  <tr key={leg.stop_id} className={leg.status === 'LATE' ? 'bg-red-50/60 print:bg-transparent font-semibold' : ''}>
                    <td className="py-1.5 px-2">{leg.stepIndex}</td>
                    <td className="py-1.5 px-2 font-bold">{leg.stop_id}</td>
                    <td className="py-1.5 px-2">({leg.to.x}, {leg.to.y})</td>
                    <td className="py-1.5 px-2 font-bold">{leg.stop.packages}</td>
                    <td className="py-1.5 px-2">{leg.distance}</td>
                    <td className="py-1.5 px-2 font-bold">{leg.rawArrivalTimeFormatted}</td>
                    <td className="py-1.5 px-2">{leg.waitMinutes > 0 ? `${leg.waitMinutes}m` : '-'}</td>
                    <td className="py-1.5 px-2">{leg.serviceStartTimeFormatted} - {leg.serviceEndTimeFormatted}</td>
                    <td className="py-1.5 px-2">{leg.windowEnd}</td>
                    <td className="py-1.5 px-2">
                      {leg.status === 'LATE' ? (
                        <span className="text-red-700 font-bold">LATE (+{Math.round(leg.minutesLate)}m)</span>
                      ) : (
                        <span className="text-emerald-700">ON TIME</span>
                      )}
                    </td>
                  </tr>
                ))}

                {/* Return to Depot */}
                <tr className="font-bold bg-slate-50/80 print:bg-transparent">
                  <td className="py-1.5 px-2">{route.legs.length + 1}</td>
                  <td className="py-1.5 px-2">DEPOT</td>
                  <td className="py-1.5 px-2">(0,0)</td>
                  <td className="py-1.5 px-2">-</td>
                  <td className="py-1.5 px-2">{route.returnDistance}</td>
                  <td className="py-1.5 px-2">{route.returnTimeFormatted}</td>
                  <td className="py-1.5 px-2">-</td>
                  <td className="py-1.5 px-2">Return Complete</td>
                  <td className="py-1.5 px-2">-</td>
                  <td className="py-1.5 px-2 text-indigo-700">CLOSED</td>
                </tr>
              </tbody>
            </table>

            <div className="mt-3 flex justify-between text-2xs font-mono text-slate-600 border-t border-slate-200 pt-2">
              <span>Total Route Distance: <strong>{route.totalDistance} units</strong> (includes {route.returnDistance} unit return)</span>
              <span>Driver Signature: _______________________</span>
            </div>
          </div>
        ))}

        {/* Unassigned deliveries if any */}
        {metrics.unassignedStops?.length > 0 && (
          <div className="border border-amber-300 rounded-lg p-3 bg-amber-50/50 text-xs">
            <h3 className="font-bold text-amber-900 mb-1">
              Unassigned Deliveries for this Run ({metrics.unassignedStops.length})
            </h3>
            <ul className="list-disc list-inside text-2xs space-y-0.5 text-amber-800">
              {metrics.unassignedStops.map((u) => (
                <li key={u.stop_id}>
                  <strong>Stop {u.stop_id}:</strong> {u.reason}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
