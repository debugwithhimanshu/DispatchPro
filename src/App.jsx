import React, { useState, useMemo } from 'react';
import Header from './components/Header.jsx';
import DashboardStats from './components/DashboardStats.jsx';
import StopsEditor from './components/StopsEditor.jsx';
import ScenarioControls from './components/ScenarioControls.jsx';
import StrategyComparison from './components/StrategyComparison.jsx';
import RouteMap from './components/RouteMap.jsx';
import StopTimeline from './components/StopTimeline.jsx';
import AlertsPanel from './components/AlertsPanel.jsx';
import ManualSimulator from './components/ManualSimulator.jsx';
import TestRunner from './components/TestRunner.jsx';
import DispatchPrintSheet from './components/DispatchPrintSheet.jsx';

import { INITIAL_STOPS, DEFAULT_CAPACITY, DEFAULT_DEPARTURE_TIME, DEFAULT_SERVICE_TIME, DEFAULT_SPEED, DEFAULT_RIDERS } from './data/sampleStops.js';
import { optimizeRoutes, applyFailedStops, validateStops } from './utils/optimizer.js';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'simulator' | 'tests' | 'print'
  const [stops, setStops] = useState(INITIAL_STOPS);
  const [selectedStrategy, setSelectedStrategy] = useState('optimal'); // 'baseline' | 'nearestNeighbor' | 'optimal'
  const [currentScenario, setCurrentScenario] = useState('A');
  const [failedStopIds, setFailedStopIds] = useState(new Set());

  // Configuration settings
  const [config, setConfig] = useState({
    riderCount: DEFAULT_RIDERS,
    capacity: DEFAULT_CAPACITY,
    departureTime: DEFAULT_DEPARTURE_TIME,
    serviceTime: DEFAULT_SERVICE_TIME,
    speed: DEFAULT_SPEED
  });

  const handleUpdateConfig = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  // Toggle stop failed
  const handleToggleFailed = (stopId) => {
    setFailedStopIds(prev => {
      const next = new Set(prev);
      if (next.has(stopId)) {
        next.delete(stopId);
      } else {
        next.add(stopId);
      }
      return next;
    });
  };

  // Filter out failed stops for planning
  const { activeStops, failedStops } = useMemo(() => {
    return applyFailedStops(stops, failedStopIds);
  }, [stops, failedStopIds]);

  // Validation
  const validation = useMemo(() => {
    return validateStops(stops);
  }, [stops]);

  // Live Optimization Computation
  const optimizationResult = useMemo(() => {
    if (!validation.valid) {
      return {
        isValid: false,
        errors: validation.errors,
        baseline: null,
        nearestNeighbor: null,
        optimal: null,
        improvement: null
      };
    }

    return optimizeRoutes(activeStops, {
      riderCount: config.riderCount,
      capacity: config.capacity,
      departureTime: config.departureTime,
      serviceTime: config.serviceTime,
      speed: config.speed
    });
  }, [activeStops, config, validation]);

  // Active Strategy Data
  const selectedStrategyData = useMemo(() => {
    if (!optimizationResult || !optimizationResult.isValid) return null;
    return optimizationResult[selectedStrategy] || optimizationResult.optimal;
  }, [optimizationResult, selectedStrategy]);

  // Table edit handlers
  const handleUpdateStop = (index, field, value) => {
    setStops(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleAddStop = () => {
    const nextId = `D${stops.length + 1}`;
    setStops(prev => [
      ...prev,
      {
        stop_id: nextId,
        x: Math.floor(Math.random() * 8) + 1,
        y: Math.floor(Math.random() * 8) + 1,
        packages: 1,
        window_start: '09:00',
        window_end: '11:00'
      }
    ]);
  };

  const handleDeleteStop = (index) => {
    const stopToDelete = stops[index];
    if (stopToDelete) {
      setFailedStopIds(prev => {
        const next = new Set(prev);
        next.delete(stopToDelete.stop_id);
        return next;
      });
    }
    setStops(prev => prev.filter((_, i) => i !== index));
  };

  const handleResetStops = () => {
    setStops(INITIAL_STOPS);
    setFailedStopIds(new Set());
    setConfig({
      riderCount: DEFAULT_RIDERS,
      capacity: DEFAULT_CAPACITY,
      departureTime: DEFAULT_DEPARTURE_TIME,
      serviceTime: DEFAULT_SERVICE_TIME,
      speed: DEFAULT_SPEED
    });
    setCurrentScenario('A');
  };

  const handleImportStops = (newStops) => {
    setStops(newStops);
    setFailedStopIds(new Set());
  };

  // Scenario Presets
  const handleLoadScenarioA = () => {
    handleResetStops();
    setCurrentScenario('A');
    setSelectedStrategy('optimal');
  };

  const handleLoadScenarioB = () => {
    setStops(INITIAL_STOPS);
    setFailedStopIds(new Set());
    setCurrentScenario('B');
    setActiveTab('simulator');
  };

  const handleLoadScenarioC = () => {
    setStops(INITIAL_STOPS);
    setFailedStopIds(new Set());
    setConfig(prev => ({ ...prev, capacity: 3 }));
    setCurrentScenario('C');
    setSelectedStrategy('optimal');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRunAcceptanceTests={() => setActiveTab('tests')}
        onPrintDispatch={() => setActiveTab('print')}
        isExactMode={stops.length <= 8}
        unassignedCount={selectedStrategyData?.metrics?.unassignedStops?.length || 0}
        lateCount={selectedStrategyData?.metrics?.totalLateStops || 0}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* PRINT SHEET TAB */}
        {activeTab === 'print' && (
          <DispatchPrintSheet
            strategyData={selectedStrategyData}
            selectedStrategyName={selectedStrategyData?.strategyName || selectedStrategy}
            scenarioName={`Scenario ${currentScenario}`}
            onBack={() => setActiveTab('dashboard')}
          />
        )}

        {/* TESTS RUNNER TAB */}
        {activeTab === 'tests' && (
          <div className="no-print">
            <TestRunner currentStops={stops} />
          </div>
        )}

        {/* MANUAL SIMULATOR TAB */}
        {activeTab === 'simulator' && (
          <div className="no-print">
            <ManualSimulator stops={stops} config={config} />
          </div>
        )}

        {/* DASHBOARD / CONTROL CENTER TAB */}
        {activeTab === 'dashboard' && (
          <div className="no-print">
            {/* Top Dashboard Metrics Row */}
            <DashboardStats
              selectedStrategyData={selectedStrategyData}
              baselineData={optimizationResult?.baseline}
              improvement={optimizationResult?.improvement}
              totalStopsCount={stops.length}
              activeStopsCount={activeStops.length}
            />

            {/* Presets & Parameters Bar */}
            <ScenarioControls
              config={config}
              onUpdateConfig={handleUpdateConfig}
              onLoadScenarioA={handleLoadScenarioA}
              onLoadScenarioB={handleLoadScenarioB}
              onLoadScenarioC={handleLoadScenarioC}
              currentScenario={currentScenario}
            />

            {/* Real-time Alerts Panel */}
            <AlertsPanel
              optimizationResult={optimizationResult}
              selectedStrategyData={selectedStrategyData}
              validationErrors={validation.errors}
              failedStops={failedStops}
              stopsCount={stops.length}
            />

            {/* Main Interactive Grid Map & Strategy Comparison */}
            <div className="grid grid-cols-1 gap-6 mb-6">
              <RouteMap
                stops={activeStops}
                strategyData={selectedStrategyData}
                selectedStrategy={selectedStrategy}
                onSelectStrategy={setSelectedStrategy}
              />
            </div>

            {/* Strategy Comparison Cards (Baseline, NN, Optimal) */}
            <StrategyComparison
              optimizationResult={optimizationResult}
              selectedStrategy={selectedStrategy}
              onSelectStrategy={setSelectedStrategy}
            />

            {/* "Why This Route?" Decision & Timeline Panel */}
            {selectedStrategyData && (
              <StopTimeline
                strategyData={selectedStrategyData}
                selectedStrategyName={selectedStrategyData.strategyName}
              />
            )}

            {/* Editable Stops Matrix Table */}
            <StopsEditor
              stops={stops}
              onUpdateStop={handleUpdateStop}
              onAddStop={handleAddStop}
              onDeleteStop={handleDeleteStop}
              onResetStops={handleResetStops}
              onImportStops={handleImportStops}
              validationErrors={validation.errors}
              failedStopIds={failedStopIds}
              onToggleFailed={handleToggleFailed}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="no-print bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <p>
          DispatchPro • Sobhasaria Hackfest 2026 Challenge H04 • Pure JavaScript Offline Route Optimizer
        </p>
      </footer>
    </div>
  );
}
