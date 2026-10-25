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
    <div className="border border-theme-border bg-theme-surface p-5 h-full flex flex-col justify-between space-y-5 transition-colors">
      {/* 1. Dispatch Configuration */}
      <div>
        <div className="text-xs font-mono uppercase tracking-widest text-theme-accent font-semibold mb-1">
          02 / FLEET CONTROLS
        </div>
        <h3 className="text-base font-bold text-theme-text tracking-tight mb-3">
          Dispatch Configuration
        </h3>

        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-theme-muted mb-1">
              Riders
            </label>
            <input
              type="number"
              min="1"
              max="5"
              value={config.riderCount}
              onChange={(e) => onUpdateConfig('riderCount', parseInt(e.target.value, 10) || 1)}
              className="w-full px-2.5 py-1.5 border border-theme-border bg-theme-secondary text-theme-text font-bold focus:border-theme-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-theme-muted mb-1">
              Capacity (pkgs)
            </label>
            <input
              type="number"
              min="1"
              value={config.capacity}
              onChange={(e) => onUpdateConfig('capacity', parseInt(e.target.value, 10) || 1)}
              className="w-full px-2.5 py-1.5 border border-theme-border bg-theme-secondary text-theme-text font-bold focus:border-theme-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-theme-muted mb-1">
              Departure
            </label>
            <input
              type="time"
              value={config.departureTime}
              onChange={(e) => onUpdateConfig('departureTime', e.target.value)}
              className="w-full px-2.5 py-1.5 border border-theme-border bg-theme-secondary text-theme-text font-bold focus:border-theme-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-wider text-theme-muted mb-1">
              Service (min)
            </label>
            <input
              type="number"
              min="0"
              value={config.serviceTime}
              onChange={(e) => onUpdateConfig('serviceTime', parseInt(e.target.value, 10) || 0)}
              className="w-full px-2.5 py-1.5 border border-theme-border bg-theme-secondary text-theme-text font-bold focus:border-theme-accent focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 2. Scenario Presets */}
      <div className="pt-4 border-t border-theme-border">
        <div className="text-xs font-mono uppercase tracking-widest text-theme-muted mb-2 font-semibold">
          Scenario Presets
        </div>
        <div className="space-y-1.5 text-xs font-mono">
          <button
            onClick={onLoadScenarioA}
            className={`w-full text-left px-3 py-2 border transition-colors flex items-center justify-between ${
              currentScenario === 'A'
                ? 'border-theme-accent bg-theme-accentBg text-theme-accent font-bold'
                : 'border-theme-border bg-theme-surface text-theme-text hover:bg-theme-secondary'
            }`}
          >
            <span>Scenario A: Default 4-Cap</span>
            {currentScenario === 'A' && <span className="text-[10px] uppercase tracking-widest">Active</span>}
          </button>

          <button
            onClick={onLoadScenarioB}
            className={`w-full text-left px-3 py-2 border transition-colors flex items-center justify-between ${
              currentScenario === 'B'
                ? 'border-theme-warning bg-theme-accentBg text-theme-warning font-bold'
                : 'border-theme-border bg-theme-surface text-theme-text hover:bg-theme-secondary'
            }`}
          >
            <span>Scenario B: Late Delivery Demo</span>
            {currentScenario === 'B' && <span className="text-[10px] uppercase tracking-widest">Active</span>}
          </button>

          <button
            onClick={onLoadScenarioC}
            className={`w-full text-left px-3 py-2 border transition-colors flex items-center justify-between ${
              currentScenario === 'C'
                ? 'border-theme-error bg-theme-accentBg text-theme-error font-bold'
                : 'border-theme-border bg-theme-surface text-theme-text hover:bg-theme-secondary'
            }`}
          >
            <span>Scenario C: Capacity 3 Stress</span>
            {currentScenario === 'C' && <span className="text-[10px] uppercase tracking-widest">Active</span>}
          </button>
        </div>
      </div>

      {/* 3. Live Dispatch Status */}
      <div className="pt-4 border-t border-theme-border">
        <div className="text-xs font-mono uppercase tracking-widest text-theme-muted mb-2 font-semibold">
          Live Dispatch Status
        </div>
        <div className="border border-theme-border bg-theme-secondary p-3 text-xs font-mono space-y-1.5 text-theme-text">
          <div className="flex justify-between">
            <span className="text-theme-muted">Active Deliveries:</span>
            <span className="font-bold">{activeStops} stops</span>
          </div>
          <div className="flex justify-between">
            <span className="text-theme-muted">Assigned Packages:</span>
            <span className="font-bold">{assignedPkgs} pkgs</span>
          </div>
          <div className="flex justify-between">
            <span className="text-theme-muted">Late Stops:</span>
            <span className={`font-bold ${lateStops > 0 ? 'text-theme-error' : 'text-theme-success'}`}>
              {lateStops} late
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-theme-muted">Unassigned Stops:</span>
            <span className={`font-bold ${unassignedCount > 0 ? 'text-theme-warning' : 'text-theme-text'}`}>
              {unassignedCount} excluded
            </span>
          </div>
          {hasCapacityViolation && (
            <div className="pt-1 border-t border-theme-border text-theme-error text-[11px] font-bold">
              • Capacity violation active
            </div>
          )}
        </div>
      </div>

      {/* 4. Primary Action Button */}
      <div className="pt-2">
        <button
          onClick={onOptimize}
          className="w-full inline-flex items-center justify-center gap-2 bg-theme-accent hover:bg-theme-accentHover text-theme-surface py-2.5 px-4 text-xs font-mono uppercase tracking-widest font-semibold transition-colors shadow-2xs"
        >
          <span>Recalculate Optimizer</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
