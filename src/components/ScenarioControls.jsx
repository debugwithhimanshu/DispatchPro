import React from 'react';
import { SlidersHorizontal } from 'lucide-react';

const inputCls =
  'w-full px-2.5 py-1.5 text-sm border border-slate-300 rounded-md bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors';

const SCENARIOS = [
  { id: 'A', label: 'Scenario A', desc: 'Default (Cap 4)', handler: 'A' },
  { id: 'B', label: 'Scenario B', desc: 'Late Delivery Demo', handler: 'B' },
  { id: 'C', label: 'Scenario C', desc: 'Capacity 3 Stress', handler: 'C' },
];

export default function ScenarioControls({
  config,
  onUpdateConfig,
  onLoadScenarioA,
  onLoadScenarioB,
  onLoadScenarioC,
  currentScenario,
}) {
  const handlers = { A: onLoadScenarioA, B: onLoadScenarioB, C: onLoadScenarioC };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center gap-5">

        {/* Scenarios */}
        <div className="flex-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Preset Scenarios
          </p>
          <div className="flex flex-wrap gap-2">
            {SCENARIOS.map(sc => (
              <button
                key={sc.id}
                onClick={handlers[sc.id]}
                className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                  currentScenario === sc.id
                    ? 'bg-indigo-600 text-white border-indigo-600 font-semibold'
                    : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400 hover:text-slate-900'
                }`}
              >
                {sc.label}
                <span className={`ml-1.5 text-xs ${currentScenario === sc.id ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {sc.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-12 bg-slate-200" />

        {/* Config inputs */}
        <div className="flex flex-wrap items-end gap-4">
          {[
            { label: 'Riders', key: 'riderCount', type: 'number', min: 1, max: 5, width: 'w-16' },
            { label: 'Capacity', key: 'capacity', type: 'number', min: 1, width: 'w-16' },
            { label: 'Departure', key: 'departureTime', type: 'time', width: 'w-28' },
            { label: 'Service (min)', key: 'serviceTime', type: 'number', min: 0, width: 'w-20' },
          ].map(({ label, key, type, min, max, width }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
              <input
                type={type}
                min={min}
                max={max}
                value={config[key]}
                onChange={e =>
                  onUpdateConfig(key, type === 'number' ? parseInt(e.target.value, 10) || min || 0 : e.target.value)
                }
                className={`${inputCls} ${width}`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
