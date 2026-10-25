import React from 'react';
import { Package, Navigation, AlertTriangle, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';

export default function RiderRouteCard({ riderIndex, route, showLegDetails, onToggleLegDetails }) {
  const isOverCapacity = route.isCapacityExceeded;

  return (
    <div className={`rounded-lg border bg-white mb-2 overflow-hidden ${isOverCapacity ? 'border-red-300' : 'border-slate-200'}`}>
      {/* Header */}
      <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
            R{riderIndex + 1}
          </div>
          <span className="text-sm font-semibold text-slate-800">Rider {riderIndex + 1}</span>
          <span className="text-xs text-slate-400 font-mono">{route.departureTime} → {route.returnTimeFormatted}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className={`flex items-center gap-1 font-medium ${isOverCapacity ? 'text-red-600' : 'text-slate-600'}`}>
            <Package className="w-3 h-3" />{route.totalPackages}/{route.capacity}
          </span>
          <span className="flex items-center gap-1 text-slate-600 font-medium">
            <Navigation className="w-3 h-3" />{route.totalDistance}u
          </span>
        </div>
      </div>

      <div className="px-3 py-2.5">
        {/* Sequence */}
        <div className="flex flex-wrap items-center gap-1 text-xs font-mono">
          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200 text-[10px]">DEPOT</span>
          {route.orderedStops.map((stop, idx) => (
            <React.Fragment key={stop.stop_id}>
              <ArrowRight className="w-3 h-3 text-slate-300 shrink-0" />
              <span className={`px-1.5 py-0.5 rounded border text-[10px] font-semibold ${
                route.legs[idx]?.status === 'LATE'
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-100'
              }`}>
                {stop.stop_id}
              </span>
            </React.Fragment>
          ))}
          <ArrowRight className="w-3 h-3 text-slate-300 shrink-0" />
          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-400 border border-slate-200 text-[10px]">DEPOT</span>
        </div>

        {isOverCapacity && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />{route.capacityViolationDetails}
          </div>
        )}

        <button
          onClick={onToggleLegDetails}
          className="mt-2 flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          {showLegDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {showLegDetails ? 'Hide details' : 'Leg details'}
        </button>

        {showLegDetails && (
          <div className="mt-2 overflow-x-auto rounded border border-slate-200">
            <table className="w-full text-[10px] font-mono text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  {['Stop', 'Dist', 'Arrival', 'Wait', 'Service', 'Window', 'Status'].map(h => (
                    <th key={h} className="px-2 py-1.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {route.legs.map((leg, i) => (
                  <tr key={i} className={leg.status === 'LATE' ? 'bg-red-50' : ''}>
                    <td className="px-2 py-1 font-bold">{leg.stop_id}</td>
                    <td className="px-2 py-1">{leg.distance}</td>
                    <td className="px-2 py-1">{leg.rawArrivalTimeFormatted}</td>
                    <td className="px-2 py-1">{leg.waitMinutes > 0 ? `${leg.waitMinutes}m` : '—'}</td>
                    <td className="px-2 py-1">{leg.serviceStartTimeFormatted}–{leg.serviceEndTimeFormatted}</td>
                    <td className="px-2 py-1">{leg.windowStart}–{leg.windowEnd}</td>
                    <td className={`px-2 py-1 font-semibold ${leg.status === 'LATE' ? 'text-red-600' : 'text-emerald-600'}`}>
                      {leg.status === 'LATE' ? `LATE +${Math.round(leg.minutesLate)}m` : 'ON TIME'}
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-50 text-slate-500 font-semibold">
                  <td className="px-2 py-1">↩ Depot</td>
                  <td className="px-2 py-1">{route.returnDistance}</td>
                  <td className="px-2 py-1">{route.returnTimeFormatted}</td>
                  <td colSpan={3} className="px-2 py-1">—</td>
                  <td className="px-2 py-1 text-indigo-600">CLOSED</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
