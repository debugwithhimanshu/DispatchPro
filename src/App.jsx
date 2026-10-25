import React, { useState, useMemo } from 'react';
import Header from './components/Header.jsx';
import HeroSection from './components/HeroSection.jsx';
import DashboardStats from './components/DashboardStats.jsx';
import RouteMap from './components/RouteMap.jsx';
import OperationsPanel from './components/OperationsPanel.jsx';
import StrategyComparison from './components/StrategyComparison.jsx';
import StopTimeline from './components/StopTimeline.jsx';
import StopsEditor from './components/StopsEditor.jsx';
import ManualSimulator from './components/ManualSimulator.jsx';
import TestRunner from './components/TestRunner.jsx';
import DispatchPrintSheet from './components/DispatchPrintSheet.jsx';

import {
  INITIAL_STOPS,
  DEFAULT_CAPACITY,
  DEFAULT_DEPARTURE_TIME,
  DEFAULT_SERVICE_TIME,
  DEFAULT_SPEED,
  DEFAULT_RIDERS
} from './data/sampleStops.js';
import { optimizeRoutes, applyFailedStops, validateStops } from './utils/optimizer.js';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'simulator' | 'tests' | 'print'
  const [stops, setStops] = useState(INITIAL_STOPS);
  const [selectedStrategy, setSelectedStrategy] = useState('optimal'); // 'baseline' | 'nearestNeighbor' | 'optimal'
  const [currentScenario, setCurrentScenario] = useState('A');
  const [failedStopIds, setFailedStopIds] = useState(new Set());

  // Fleet operational configuration
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

  // Toggle stop failure
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

  // Filter out failed stops
  const { activeStops, failedStops } = useMemo(() => {
    return applyFailedStops(stops, failedStopIds);
  }, [stops, failedStopIds]);

  // Validation
  const validation = useMemo(() => {
    return validateStops(stops);
  }, [stops]);

  // Reactive Optimization Computation
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

  // Selected Strategy Object
  const selectedStrategyData = useMemo(() => {
    if (!optimizationResult || !optimizationResult.isValid) return null;
    return optimizationResult[selectedStrategy] || optimizationResult.optimal;
  }, [optimizationResult, selectedStrategy]);

  // Stop row edit handlers
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
    <div className="min-h-screen bg-[#F5F2EB] text-[#242520] flex flex-col font-sans selection:bg-[#F5E4DC] selection:text-[#C65332]">
      {/* 1. Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRunAcceptanceTests={() => setActiveTab('tests')}
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
            {/* 2. Editorial Hero Section */}
            <HeroSection
              scenarioName={`Scenario ${currentScenario}`}
              riderCount={config.riderCount}
              activeStopsCount={activeStops.length}
              onOptimize={() => {
                setSelectedStrategy('optimal');
              }}
              onVerify={() => setActiveTab('tests')}
            />

            {/* 3. Four Key Operational Metrics */}
            <DashboardStats
              selectedStrategyData={selectedStrategyData}
              baselineData={optimizationResult?.baseline}
              improvement={optimizationResult?.improvement}
            />

            {/* 4. Two-Column Workspace: Map (Left ~67%) + Operations Panel (Right ~33%) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-8 items-stretch">
              {/* Left Column: Interactive Route Map */}
              <div className="lg:col-span-8 flex flex-col">
                <RouteMap
                  stops={activeStops}
                  strategyData={selectedStrategyData}
                  selectedStrategy={selectedStrategy}
                  onSelectStrategy={setSelectedStrategy}
                />
              </div>

              {/* Right Column: Operations Panel */}
              <div className="lg:col-span-4 flex flex-col">
                <OperationsPanel
                  config={config}
                  onUpdateConfig={handleUpdateConfig}
                  onLoadScenarioA={handleLoadScenarioA}
                  onLoadScenarioB={handleLoadScenarioB}
                  onLoadScenarioC={handleLoadScenarioC}
                  currentScenario={currentScenario}
                  optimizationResult={optimizationResult}
                  selectedStrategyData={selectedStrategyData}
                  onOptimize={() => setSelectedStrategy('optimal')}
                />
              </div>
            </div>

            {/* 5. Three Strategies Comparison */}
            <StrategyComparison
              optimizationResult={optimizationResult}
              selectedStrategy={selectedStrategy}
              onSelectStrategy={setSelectedStrategy}
            />

            {/* 6. Why This Route? Decision & Timeline Matrix */}
            {selectedStrategyData && (
              <StopTimeline
                strategyData={selectedStrategyData}
                selectedStrategyName={selectedStrategyData.strategyName}
              />
            )}

            {/* 7. Delivery Stops Matrix (Editable Table) */}
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

      {/* Editorial Footer */}
      <footer className="no-print bg-[#FFFEFA] border-t border-[#DAD6CC] py-4 text-center text-xs font-mono text-[#77766F]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>DISPATCHPRO • SOBHASARIA HACKFEST 2026 / H04</span>
          <span>SWISS EDITORIAL SYSTEM • PURE OFFLINE JAVASCRIPT SOLVER</span>
        </div>
      </footer>
    </div>
  );
}
