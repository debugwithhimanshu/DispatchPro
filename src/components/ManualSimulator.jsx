import React, { useState } from 'react';
import { Play, ChevronUp, ChevronDown, Trash } from 'lucide-react';
import { simulateManualRoute } from '../utils/optimizer.js';

export default function ManualSimulator({ stops = [], config }) {
  const [selectedRider, setSelectedRider] = useState(1);
  const [departureTime, setDepartureTime] = useState(config.departureTime || '09:00');
  const [routeStopIds, setRouteStopIds] = useState(['D1', 'D2', 'D3']);
  const [simulationResult, setSimulationResult] = useState(null);

  const stopMap = new Map(stops.map(s => [s.stop_id, s]));
  const availableToAdd = stops.filter(s => !routeStopIds.includes(s.stop_id));

  const handleAddStop = (id) => {
    setRouteStopIds(prev => [...prev, id]);
  };

  const handleRemoveStop = (index) => {
    setRouteStopIds(prev => prev.filter((_, i) => i !== index));
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    setRouteStopIds(prev => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleMoveDown = (index) => {
    if (index === routeStopIds.length - 1) return;
    setRouteStopIds(prev => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleRunSimulation = () => {
    const orderedStops = routeStopIds
      .map(id => stopMap.get(id))
      .filter(Boolean);

    const result = simulateManualRoute(orderedStops, {
      departureTime,
      serviceTime: config.serviceTime,
      speed: config.speed,
      capacity: config.capacity
    });

    setSimulationResult(result);
  };

  const handleLoadScenarioB = () => {
    setDepartureTime('09:55');
    setRouteStopIds(['D5', 'D2', 'D1']);
    const bStops = ['D5', 'D2', 'D1'].map(id => stopMap.get(id)).filter(Boolean);
    const result = simulateManualRoute(bStops, {
      departureTime: '09:55',
      serviceTime: 2,
      speed: 1,
      capacity: config.capacity
    });
    setSimulationResult(result);
  };

  return (
    <div className="border border-theme-border bg-theme-surface p-6 mb-8 transition-colors">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-theme-border">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-theme-accent font-semibold mb-0.5">
            SIMULATOR / CUSTOM ITINERARY
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-theme-text font-sans">
            Manual Route & Scenario B Simulator
          </h2>
          <p className="text-xs font-mono text-theme-muted mt-0.5">
            Simulate custom delivery orders, departure shifts, and evaluate precise arrival times against customer deadlines.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={handleLoadScenarioB}
            className="px-3.5 py-2 border border-theme-warning bg-theme-accentBg text-theme-warning font-bold uppercase tracking-wider hover:opacity-90"
          >
            Load Scenario B (D5 → D2 → D1 @ 09:55)
          </button>
          <button
            onClick={handleRunSimulation}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-theme-text hover:opacity-90 text-theme-bg font-bold uppercase tracking-wider"
          >
            <Play className="w-3.5 h-3.5 text-theme-accent" />
            <span>Run Simulation</span>
          </button>
        </div>
      </div>

      {/* Simulator Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
        {/* Controls Column */}
        <div className="space-y-4 font-mono text-xs">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-theme-muted mb-1 font-bold">
              Select Rider
            </label>
            <select
              value={selectedRider}
              onChange={(e) => setSelectedRider(Number(e.target.value))}
              className="w-full px-3 py-2 border border-theme-border bg-theme-secondary text-theme-text font-bold"
            >
              <option value={1}>Rider 1</option>
              <option value={2}>Rider 2</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-theme-muted mb-1 font-bold">
              Departure Time (HH:MM)
            </label>
            <input
              type="time"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              className="w-full px-3 py-2 border border-theme-border bg-theme-secondary text-theme-text font-bold"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-theme-muted mb-1 font-bold">
              Add Available Stops
            </label>
            <div className="flex flex-wrap gap-1.5">
              {availableToAdd.length === 0 ? (
                <span className="text-theme-muted text-[11px]">All stops in itinerary</span>
              ) : (
                availableToAdd.map(s => (
                  <button
                    key={s.stop_id}
                    onClick={() => handleAddStop(s.stop_id)}
                    className="px-2.5 py-1 text-[11px] font-bold border border-theme-border bg-theme-secondary hover:bg-theme-elevated text-theme-text"
                  >
                    + {s.stop_id}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sequence Builder Column */}
        <div className="md:col-span-2 border border-theme-border bg-theme-secondary p-4 font-mono text-xs">
          <label className="block text-[11px] uppercase tracking-wider text-theme-muted mb-2 font-bold">
            Simulated Stop Sequence ({routeStopIds.length} stops)
          </label>

          {routeStopIds.length === 0 ? (
            <div className="text-center py-8 text-theme-muted">
              No stops selected. Click "Add Available Stops" above.
            </div>
          ) : (
            <div className="space-y-2">
              <div className="p-2 border border-theme-border bg-theme-elevated text-theme-text font-bold flex justify-between">
                <span>DEPOT (0,0)</span>
                <span>Depart {departureTime}</span>
              </div>

              {routeStopIds.map((id, index) => {
                const stopObj = stopMap.get(id);
                return (
                  <div
                    key={id}
                    className="p-2.5 border border-theme-border bg-theme-surface flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="w-5 h-5 border border-theme-text bg-theme-text text-theme-bg font-bold flex items-center justify-center text-[10px]">
                        {index + 1}
                      </span>
                      <div>
                        <strong className="text-theme-text text-sm mr-2">{id}</strong>
                        <span className="text-theme-muted text-[11px]">
                          ({stopObj?.x}, {stopObj?.y}) • {stopObj?.packages}p • Deadline: {stopObj?.window_end}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 text-theme-muted">
                      <button
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="p-1 hover:text-theme-text disabled:opacity-20"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMoveDown(index)}
                        disabled={index === routeStopIds.length - 1}
                        className="p-1 hover:text-theme-text disabled:opacity-20"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveStop(index)}
                        className="p-1 hover:text-theme-error"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="p-2 border border-theme-border bg-theme-elevated text-theme-text font-bold flex justify-between">
                <span>DEPOT (0,0)</span>
                <span>Closed Route Vector</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Display */}
      {simulationResult && (
        <div className="mt-6 pt-5 border-t border-theme-border">
          <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-theme-text mb-3">
            Simulation Metrics & Arrival Matrix
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 font-mono">
            <div className="p-3 border border-theme-border bg-theme-secondary">
              <span className="text-[10px] uppercase text-theme-muted">Total Distance</span>
              <div className="text-xl font-bold text-theme-text tabular-nums">
                {simulationResult.totalDistance}u
              </div>
              <span className="text-[10px] text-theme-muted">Return leg: {simulationResult.returnDistance}u</span>
            </div>
            <div className="p-3 border border-theme-border bg-theme-secondary">
              <span className="text-[10px] uppercase text-theme-muted">Package Load</span>
              <div className="text-xl font-bold text-theme-text tabular-nums">
                {simulationResult.totalPackages}/{simulationResult.capacity}
              </div>
              <span className="text-[10px] text-theme-muted">
                {simulationResult.isCapacityExceeded ? 'Exceeded' : 'Within capacity'}
              </span>
            </div>
            <div className="p-3 border border-theme-border bg-theme-secondary">
              <span className="text-[10px] uppercase text-theme-muted">Late Stops</span>
              <div className={`text-xl font-bold tabular-nums ${simulationResult.lateStopsCount > 0 ? 'text-theme-error' : 'text-theme-success'}`}>
                {simulationResult.lateStopsCount} late
              </div>
              <span className="text-[10px] text-theme-muted">
                {simulationResult.lateStopsCount > 0 ? 'Violations observed' : 'All windows met'}
              </span>
            </div>
            <div className="p-3 border border-theme-border bg-theme-secondary">
              <span className="text-[10px] uppercase text-theme-muted">Depot Return</span>
              <div className="text-xl font-bold text-theme-text tabular-nums">
                {simulationResult.returnTimeFormatted}
              </div>
              <span className="text-[10px] text-theme-muted">Route complete</span>
            </div>
          </div>

          {/* Detailed Legs Table */}
          <div className="overflow-x-auto border border-theme-border">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-theme-secondary text-theme-muted uppercase border-b border-theme-border">
                <tr>
                  <th className="p-2.5">Stop</th>
                  <th className="p-2.5">Leg Dist</th>
                  <th className="p-2.5">Raw Arr</th>
                  <th className="p-2.5">Wait</th>
                  <th className="p-2.5">Service Start</th>
                  <th className="p-2.5">Deadline</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Explanation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border">
                {simulationResult.legs.map((leg) => {
                  const isLate = leg.status === 'LATE';
                  return (
                    <tr key={leg.stop_id} className={isLate ? 'bg-theme-accentBg' : ''}>
                      <td className="p-2.5 font-bold">{leg.stop_id}</td>
                      <td className="p-2.5">{leg.distance}</td>
                      <td className="p-2.5 font-bold">{leg.rawArrivalTimeFormatted}</td>
                      <td className="p-2.5">{leg.waitMinutes > 0 ? `${leg.waitMinutes}m` : '-'}</td>
                      <td className="p-2.5">{leg.serviceStartTimeFormatted}</td>
                      <td className="p-2.5">{leg.windowEnd}</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 text-[10px] uppercase font-bold ${
                          isLate ? 'bg-theme-error text-theme-surface' : 'bg-theme-elevated text-theme-success'
                        }`}>
                          {leg.status} {isLate ? `(+${Math.round(leg.minutesLate)}m)` : ''}
                        </span>
                      </td>
                      <td className="p-2.5 text-[11px] text-theme-muted font-sans">
                        {leg.explanation}
                      </td>
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
