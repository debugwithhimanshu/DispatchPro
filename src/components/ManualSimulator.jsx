import React, { useState } from 'react';
import { Play, ChevronUp, ChevronDown, Trash, Clock } from 'lucide-react';
import { simulateManualRoute } from '../utils/optimizer.js';

export default function ManualSimulator({ stops = [], config }) {
  const [departureTime, setDepartureTime] = useState(config.departureTime || '09:00');
  const [routeStopIds, setRouteStopIds] = useState(['D1', 'D2', 'D3']);
  const [simulationResult, setSimulationResult] = useState(null);

  const stopMap = new Map(stops.map(s => [s.stop_id, s]));
  const availableToAdd = stops.filter(s => !routeStopIds.includes(s.stop_id));

  const handleAddStop = id => setRouteStopIds(prev => [...prev, id]);
  const handleRemoveStop = index => setRouteStopIds(prev => prev.filter((_, i) => i !== index));
  const handleMove = (index, dir) => {
    const ni = index + dir;
    if (ni < 0 || ni >= routeStopIds.length) return;
    setRouteStopIds(prev => { const c = [...prev]; [c[index], c[ni]] = [c[ni], c[index]]; return c; });
  };

  const handleRun = () => {
    const ordered = routeStopIds.map(id => stopMap.get(id)).filter(Boolean);
    setSimulationResult(simulateManualRoute(ordered, {
      departureTime, serviceTime: config.serviceTime, speed: config.speed, capacity: config.capacity,
    }));
  };

  const handleLoadScenarioB = () => {
    setDepartureTime('09:55');
    setRouteStopIds(['D5', 'D2', 'D1']);
    const bStops = ['D5', 'D2', 'D1'].map(id => stopMap.get(id)).filter(Boolean);
    setSimulationResult(simulateManualRoute(bStops, { departureTime: '09:55', serviceTime: 2, speed: 1, capacity: config.capacity }));
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 mb-8 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 mb-5">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" /> Manual Route Simulator
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Build a custom stop sequence and observe arrival times and lateness.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleLoadScenarioB}
            className="px-3 py-1.5 text-xs font-semibold rounded-md border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors">
            Load Scenario B
          </button>
          <button onClick={handleRun}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
            <Play className="w-3.5 h-3.5" /> Run Simulation
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Controls */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Departure Time</label>
            <input type="time" value={departureTime} onChange={e => setDepartureTime(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Add Stop</label>
            <div className="flex flex-wrap gap-1.5">
              {availableToAdd.length === 0
                ? <span className="text-xs text-slate-400">All stops in sequence</span>
                : availableToAdd.map(s => (
                    <button key={s.stop_id} onClick={() => handleAddStop(s.stop_id)}
                      className="px-2 py-1 text-xs font-semibold rounded border border-slate-300 bg-slate-50 text-slate-600 hover:border-indigo-400 hover:text-indigo-700 transition-colors">
                      + {s.stop_id}
                    </button>
                  ))
              }
            </div>
          </div>
        </div>

        {/* Sequence builder */}
        <div className="md:col-span-2 bg-slate-50 rounded-lg border border-slate-200 p-4">
          <label className="block text-xs font-semibold text-slate-600 mb-2">Route Sequence ({routeStopIds.length} stops)</label>
          {routeStopIds.length === 0
            ? <p className="text-xs text-slate-400 text-center py-4">No stops. Add from the left panel.</p>
            : (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-3 py-1.5 bg-slate-200 rounded text-xs font-semibold text-slate-600 font-mono">
                  <span>START: DEPOT (0,0)</span><span>{departureTime}</span>
                </div>
                {routeStopIds.map((id, index) => {
                  const s = stopMap.get(id);
                  return (
                    <div key={id} className="flex items-center justify-between px-3 py-2 bg-white rounded border border-slate-200 shadow-sm">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center font-mono">{index + 1}</span>
                        <span className="text-xs font-bold text-slate-800 font-mono">{id}</span>
                        <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">({s?.x},{s?.y}) · {s?.packages}p · {s?.window_start}–{s?.window_end}</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <button onClick={() => handleMove(index, -1)} disabled={index === 0} className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30">
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleMove(index, 1)} disabled={index === routeStopIds.length - 1} className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30">
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleRemoveStop(index)} className="p-1 text-slate-400 hover:text-red-500 ml-0.5">
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                <div className="flex items-center justify-between px-3 py-1.5 bg-slate-200 rounded text-xs font-semibold text-slate-500 font-mono">
                  <span>END: DEPOT (0,0)</span><span>Closed Route</span>
                </div>
              </div>
            )
          }
        </div>
      </div>

      {/* Results */}
      {simulationResult && (
        <div className="mt-6 pt-5 border-t border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Simulation Results</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Total Distance', value: `${simulationResult.totalDistance} units`, sub: `Return: ${simulationResult.returnDistance}u` },
              { label: 'Package Load', value: `${simulationResult.totalPackages} / ${simulationResult.capacity}`, sub: simulationResult.isCapacityExceeded ? 'EXCEEDED' : 'Within capacity' },
              { label: 'Late Stops', value: simulationResult.lateStopsCount, sub: simulationResult.lateStopsCount > 0 ? 'Window violated' : 'All on-time', bad: simulationResult.lateStopsCount > 0 },
              { label: 'Depot Return', value: simulationResult.returnTimeFormatted, sub: 'Route complete' },
            ].map(({ label, value, sub, bad }) => (
              <div key={label} className="bg-slate-50 rounded-lg border border-slate-200 p-3">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-1">{label}</div>
                <div className={`text-lg font-bold ${bad ? 'text-red-600' : 'text-slate-900'}`}>{value}</div>
                <div className={`text-[10px] ${bad ? 'text-red-500' : 'text-slate-400'}`}>{sub}</div>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-xs text-left font-mono">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-500 uppercase">
                <tr>
                  {['Stop', 'Dist', 'Arrival', 'Wait', 'Service', 'Deadline', 'Status', 'Note'].map(h => (
                    <th key={h} className="px-3 py-2">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {simulationResult.legs.map(leg => {
                  const isLate = leg.status === 'LATE';
                  return (
                    <tr key={leg.stop_id} className={isLate ? 'bg-red-50' : ''}>
                      <td className="px-3 py-2 font-bold text-slate-900">{leg.stop_id}</td>
                      <td className="px-3 py-2">{leg.distance}</td>
                      <td className="px-3 py-2 font-semibold">{leg.rawArrivalTimeFormatted}</td>
                      <td className="px-3 py-2">{leg.waitMinutes > 0 ? `${leg.waitMinutes}m` : '—'}</td>
                      <td className="px-3 py-2">{leg.serviceStartTimeFormatted}</td>
                      <td className="px-3 py-2">{leg.windowEnd}</td>
                      <td className={`px-3 py-2 font-semibold ${isLate ? 'text-red-600' : 'text-emerald-600'}`}>
                        {leg.status}{isLate ? ` +${Math.round(leg.minutesLate)}m` : ''}
                      </td>
                      <td className="px-3 py-2 text-slate-400 font-sans text-[10px]">{leg.explanation}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
