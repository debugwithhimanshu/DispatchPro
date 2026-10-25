import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function OperationsPanel({
  config,
  onUpdateConfig,
  onLoadScenarioA,
  onLoadScenarioB,
  onLoadScenarioC,
  currentScenario,
  optimizationResult,
  selectedStrategyData,
  onOptimize
}) {
  const metrics = selectedStrategyData?.metrics || {};
  const activeStops = metrics.totalStopsCount || 0;
  const assignedPkgs = metrics.totalAssignedPackages || 0;
  const lateStops = metrics.totalLateStops || 0;
  const unassignedCount = metrics.unassignedStops?.length || 0;
  const hasCapacityViolation = metrics.hasCapacityViolation || false;

  return (
    <div className="border border-[#DAD6CC] bg-[#FFFEFA] p-5 h-full flex flex-col justify-between space-y-5">
      {/* 1. Dispatch Configuration */}
      <div>
        <div className="text-xs font-mono uppercase tracking-widest text-[#C65332] font-semibold mb-1">
          02 / FLEET CONTROLS
        </div>
        <h3 className="text-base font-bold text-[#242520] tracking-tight mb-3">
          Dispatch Configuration
        </h3>

        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#77766F] mb-1">
              Riders
            </label>
            <input
              type="number"
              min="1"
              max="5"
              value={config.riderCount}
              onChange={(e) => onUpdateConfig('riderCount', parseInt(e.target.value, 10) || 1)}
              className="w-full px-2.5 py-1.5 border border-[#DAD6CC] bg-[#F5F2EB] text-[#242520] font-bold focus:border-[#C65332] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#77766F] mb-1">
              Capacity (pkgs)
            </label>
            <input
              type="number"
              min="1"
              value={config.capacity}
              onChange={(e) => onUpdateConfig('capacity', parseInt(e.target.value, 10) || 1)}
              className="w-full px-2.5 py-1.5 border border-[#DAD6CC] bg-[#F5F2EB] text-[#242520] font-bold focus:border-[#C65332] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#77766F] mb-1">
              Departure
            </label>
            <input
              type="time"
              value={config.departureTime}
              onChange={(e) => onUpdateConfig('departureTime', e.target.value)}
              className="w-full px-2.5 py-1.5 border border-[#DAD6CC] bg-[#F5F2EB] text-[#242520] font-bold focus:border-[#C65332] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#77766F] mb-1">
              Service (min)
            </label>
            <input
              type="number"
              min="0"
              value={config.serviceTime}
              onChange={(e) => onUpdateConfig('serviceTime', parseInt(e.target.value, 10) || 0)}
              className="w-full px-2.5 py-1.5 border border-[#DAD6CC] bg-[#F5F2EB] text-[#242520] font-bold focus:border-[#C65332] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 2. Scenario Presets */}
      <div className="pt-4 border-t border-[#DAD6CC]">
        <div className="text-xs font-mono uppercase tracking-widest text-[#77766F] mb-2 font-semibold">
          Scenario Presets
        </div>
        <div className="space-y-1.5 text-xs font-mono">
          <button
            onClick={onLoadScenarioA}
            className={`w-full text-left px-3 py-2 border transition-colors flex items-center justify-between ${
              currentScenario === 'A'
                ? 'border-[#C65332] bg-[#F5E4DC] text-[#C65332] font-bold'
                : 'border-[#DAD6CC] bg-[#FFFEFA] text-[#242520] hover:bg-[#F5F2EB]'
            }`}
          >
            <span>Scenario A: Default 4-Cap</span>
            {currentScenario === 'A' && <span className="text-[10px] uppercase tracking-widest">Active</span>}
          </button>

          <button
            onClick={onLoadScenarioB}
            className={`w-full text-left px-3 py-2 border transition-colors flex items-center justify-between ${
              currentScenario === 'B'
                ? 'border-[#A76718] bg-[#FDF6ED] text-[#A76718] font-bold'
                : 'border-[#DAD6CC] bg-[#FFFEFA] text-[#242520] hover:bg-[#F5F2EB]'
            }`}
          >
            <span>Scenario B: Late Delivery Demo</span>
            {currentScenario === 'B' && <span className="text-[10px] uppercase tracking-widest">Active</span>}
          </button>

          <button
            onClick={onLoadScenarioC}
            className={`w-full text-left px-3 py-2 border transition-colors flex items-center justify-between ${
              currentScenario === 'C'
                ? 'border-[#B83C32] bg-[#FCECEB] text-[#B83C32] font-bold'
                : 'border-[#DAD6CC] bg-[#FFFEFA] text-[#242520] hover:bg-[#F5F2EB]'
            }`}
          >
            <span>Scenario C: Capacity 3 Stress</span>
            {currentScenario === 'C' && <span className="text-[10px] uppercase tracking-widest">Active</span>}
          </button>
        </div>
      </div>

      {/* 3. Live Dispatch Status */}
      <div className="pt-4 border-t border-[#DAD6CC]">
        <div className="text-xs font-mono uppercase tracking-widest text-[#77766F] mb-2 font-semibold">
          Live Dispatch Status
        </div>
        <div className="border border-[#DAD6CC] bg-[#F5F2EB] p-3 text-xs font-mono space-y-1.5 text-[#242520]">
          <div className="flex justify-between">
            <span className="text-[#77766F]">Active Deliveries:</span>
            <span className="font-bold">{activeStops} stops</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#77766F]">Assigned Packages:</span>
            <span className="font-bold">{assignedPkgs} pkgs</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#77766F]">Late Stops:</span>
            <span className={`font-bold ${lateStops > 0 ? 'text-[#B83C32]' : 'text-[#287653]'}`}>
              {lateStops} late
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#77766F]">Unassigned Stops:</span>
            <span className={`font-bold ${unassignedCount > 0 ? 'text-[#A76718]' : 'text-[#242520]'}`}>
              {unassignedCount} excluded
            </span>
          </div>
          {hasCapacityViolation && (
            <div className="pt-1 border-t border-[#DAD6CC] text-[#B83C32] text-[11px] font-bold">
              • Capacity violation active
            </div>
          )}
        </div>
      </div>

      {/* 4. Primary Action Button */}
      <div className="pt-2">
        <button
          onClick={onOptimize}
          className="w-full inline-flex items-center justify-center gap-2 bg-[#C65332] hover:bg-[#A94429] text-[#FFFEFA] py-2.5 px-4 text-xs font-mono uppercase tracking-widest font-semibold transition-colors shadow-2xs"
        >
          <span>Recalculate Optimizer</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
