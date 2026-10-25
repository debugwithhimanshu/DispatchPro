import React, { useState } from 'react';
import { Play, ChevronUp, ChevronDown, Trash, Clock } from 'lucide-react';
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
    <div className="border border-[#DAD6CC] bg-[#FFFEFA] p-6 mb-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#DAD6CC]">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-[#C65332] font-semibold mb-0.5">
            SIMULATOR / CUSTOM ITINERARY
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#242520]">
            Manual Route & Scenario B Simulator
          </h2>
          <p className="text-xs font-mono text-[#77766F] mt-0.5">
            Simulate custom delivery orders, departure shifts, and evaluate precise arrival times against customer deadlines.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={handleLoadScenarioB}
            className="px-3.5 py-2 border border-[#A76718] bg-[#FDF6ED] text-[#A76718] font-bold uppercase tracking-wider hover:bg-[#FBE8CE]"
          >
            Load Scenario B (D5 → D2 → D1 @ 09:55)
          </button>
          <button
            onClick={handleRunSimulation}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#242520] hover:bg-[#353630] text-[#FFFEFA] font-bold uppercase tracking-wider"
          >
            <Play className="w-3.5 h-3.5 text-[#C65332]" />
            <span>Run Simulation</span>
          </button>
        </div>
      </div>

      {/* Simulator Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6">
        {/* Controls Column */}
        <div className="space-y-4 font-mono text-xs">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#77766F] mb-1 font-bold">
              Select Rider
            </label>
            <select
              value={selectedRider}
              onChange={(e) => setSelectedRider(Number(e.target.value))}
              className="w-full px-3 py-2 border border-[#DAD6CC] bg-[#F5F2EB] text-[#242520] font-bold"
            >
              <option value={1}>Rider 1</option>
              <option value={2}>Rider 2</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#77766F] mb-1 font-bold">
              Departure Time (HH:MM)
            </label>
            <input
              type="time"
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              className="w-full px-3 py-2 border border-[#DAD6CC] bg-[#F5F2EB] text-[#242520] font-bold"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#77766F] mb-1 font-bold">
              Add Available Stops
            </label>
            <div className="flex flex-wrap gap-1.5">
              {availableToAdd.length === 0 ? (
                <span className="text-[#77766F] text-[11px]">All stops in itinerary</span>
              ) : (
                availableToAdd.map(s => (
                  <button
                    key={s.stop_id}
                    onClick={() => handleAddStop(s.stop_id)}
                    className="px-2.5 py-1 text-[11px] font-bold border border-[#DAD6CC] bg-[#F5F2EB] hover:bg-[#EAE6DC] text-[#242520]"
                  >
                    + {s.stop_id}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sequence Builder Column */}
        <div className="md:col-span-2 border border-[#DAD6CC] bg-[#F5F2EB]/50 p-4 font-mono text-xs">
          <label className="block text-[11px] uppercase tracking-wider text-[#77766F] mb-2 font-bold">
            Simulated Stop Sequence ({routeStopIds.length} stops)
          </label>

          {routeStopIds.length === 0 ? (
            <div className="text-center py-8 text-[#77766F]">
              No stops selected. Click "Add Available Stops" above.
            </div>
          ) : (
            <div className="space-y-2">
              <div className="p-2 border border-[#DAD6CC] bg-[#EAE6DC] text-[#242520] font-bold flex justify-between">
                <span>DEPOT (0,0)</span>
                <span>Depart {departureTime}</span>
              </div>

              {routeStopIds.map((id, index) => {
                const stopObj = stopMap.get(id);
                return (
                  <div
                    key={id}
                    className="p-2.5 border border-[#DAD6CC] bg-[#FFFEFA] flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="w-5 h-5 border border-[#242520] bg-[#242520] text-[#FFFEFA] font-bold flex items-center justify-center text-[10px]">
                        {index + 1}
                      </span>
                      <div>
                        <strong className="text-[#242520] text-sm mr-2">{id}</strong>
                        <span className="text-[#77766F] text-[11px]">
                          ({stopObj?.x}, {stopObj?.y}) • {stopObj?.packages}p • Deadline: {stopObj?.window_end}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 text-[#77766F]">
                      <button
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="p-1 hover:text-[#242520] disabled:opacity-20"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMoveDown(index)}
                        disabled={index === routeStopIds.length - 1}
                        className="p-1 hover:text-[#242520] disabled:opacity-20"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRemoveStop(index)}
                        className="p-1 hover:text-[#B83C32]"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="p-2 border border-[#DAD6CC] bg-[#EAE6DC] text-[#242520] font-bold flex justify-between">
                <span>DEPOT (0,0)</span>
                <span>Closed Route Vector</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Display */}
      {simulationResult && (
        <div className="mt-6 pt-5 border-t border-[#DAD6CC]">
          <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-[#242520] mb-3">
            Simulation Metrics & Arrival Matrix
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 font-mono">
            <div className="p-3 border border-[#DAD6CC] bg-[#F5F2EB]">
              <span className="text-[10px] uppercase text-[#77766F]">Total Distance</span>
              <div className="text-xl font-bold text-[#242520] tabular-nums">
                {simulationResult.totalDistance}u
              </div>
              <span className="text-[10px] text-[#77766F]">Return leg: {simulationResult.returnDistance}u</span>
            </div>
            <div className="p-3 border border-[#DAD6CC] bg-[#F5F2EB]">
              <span className="text-[10px] uppercase text-[#77766F]">Package Load</span>
              <div className="text-xl font-bold text-[#242520] tabular-nums">
                {simulationResult.totalPackages}/{simulationResult.capacity}
              </div>
              <span className="text-[10px] text-[#77766F]">
                {simulationResult.isCapacityExceeded ? 'Exceeded' : 'Within capacity'}
              </span>
            </div>
            <div className="p-3 border border-[#DAD6CC] bg-[#F5F2EB]">
              <span className="text-[10px] uppercase text-[#77766F]">Late Stops</span>
              <div className={`text-xl font-bold tabular-nums ${simulationResult.lateStopsCount > 0 ? 'text-[#B83C32]' : 'text-[#287653]'}`}>
                {simulationResult.lateStopsCount} late
              </div>
              <span className="text-[10px] text-[#77766F]">
                {simulationResult.lateStopsCount > 0 ? 'Violations observed' : 'All windows met'}
              </span>
            </div>
            <div className="p-3 border border-[#DAD6CC] bg-[#F5F2EB]">
              <span className="text-[10px] uppercase text-[#77766F]">Depot Return</span>
              <div className="text-xl font-bold text-[#242520] tabular-nums">
                {simulationResult.returnTimeFormatted}
              </div>
              <span className="text-[10px] text-[#77766F]">Route complete</span>
            </div>
          </div>

          {/* Detailed Legs Table */}
          <div className="overflow-x-auto border border-[#DAD6CC]">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#F5F2EB] text-[#77766F] uppercase border-b border-[#DAD6CC]">
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
              <tbody className="divide-y divide-[#DAD6CC]">
                {simulationResult.legs.map((leg) => {
                  const isLate = leg.status === 'LATE';
                  return (
                    <tr key={leg.stop_id} className={isLate ? 'bg-[#FCECEB]' : ''}>
                      <td className="p-2.5 font-bold">{leg.stop_id}</td>
                      <td className="p-2.5">{leg.distance}</td>
                      <td className="p-2.5 font-bold">{leg.rawArrivalTimeFormatted}</td>
                      <td className="p-2.5">{leg.waitMinutes > 0 ? `${leg.waitMinutes}m` : '-'}</td>
                      <td className="p-2.5">{leg.serviceStartTimeFormatted}</td>
                      <td className="p-2.5">{leg.windowEnd}</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 text-[10px] uppercase font-bold ${
                          isLate ? 'bg-[#B83C32] text-[#FFFEFA]' : 'bg-[#EAE6DC] text-[#287653]'
                        }`}>
                          {leg.status} {isLate ? `(+${Math.round(leg.minutesLate)}m)` : ''}
                        </span>
                      </td>
                      <td className="p-2.5 text-[11px] text-[#77766F] font-sans">
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
