import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import Header from './components/Header';
import ConfigurationPanel from './components/ConfigurationPanel';
import SimulationControls from './components/SimulationControls';
import NetworkTopology from './components/NetworkTopology';
import MetricCards from './components/MetricCards';
import PerformanceCharts from './components/PerformanceCharts';
import ComparisonTable from './components/ComparisonTable';
import PerformanceAnalysis from './components/PerformanceAnalysis';
import {
  DEFAULT_CONFIG,
  TRAFFIC_CONDITIONS
} from './simulation/simulationTypes';
import {
  NetworkSimulationEngine,
  simulateFullTrafficCondition
} from './simulation/networkSimulation';

export default function App() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [simStatus, setSimStatus] = useState('idle'); // 'idle', 'running', 'paused', 'finished'
  const [metrics, setMetrics] = useState(null);
  const [comparisonData, setComparisonData] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});

  const engineRef = useRef(null);
  const animFrameRef = useRef(null);
  const lastTimeRef = useRef(0);

  // Validate inputs
  const validateConfig = useCallback((cfg) => {
    const errors = {};
    if (!cfg.deviceCount || cfg.deviceCount < 1 || cfg.deviceCount > 100) {
      errors.deviceCount = 'Device count must be between 1 and 100.';
    }
    if (!cfg.packetSize || cfg.packetSize < 64 || cfg.packetSize > 4096) {
      errors.packetSize = 'Packet size must be between 64 and 4096 bytes.';
    }
    if (!cfg.simulationDuration || cfg.simulationDuration < 5 || cfg.simulationDuration > 120) {
      errors.simulationDuration = 'Duration must be between 5 and 120 seconds.';
    }
    return errors;
  }, []);

  // Initialize engine and populate baseline comparison data on mount
  useEffect(() => {
    const engine = new NetworkSimulationEngine(DEFAULT_CONFIG);
    engineRef.current = engine;
    setMetrics(engine.getSnapshot());

    // Generate initial baseline comparison data for all 4 conditions
    const initialComparison = Object.keys(TRAFFIC_CONDITIONS).map((key) =>
      simulateFullTrafficCondition(DEFAULT_CONFIG, key)
    );
    setComparisonData(initialComparison);
  }, []);

  // Update engine config when user changes settings
  const handleConfigChange = (newConfig) => {
    const errors = validateConfig(newConfig);
    setValidationErrors(errors);
    setConfig(newConfig);

    if (engineRef.current && simStatus === 'idle') {
      engineRef.current.updateConfig(newConfig);
      setMetrics(engineRef.current.getSnapshot());
    }
  };

  // Main simulation tick loop
  const tick = useCallback(
    (time) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = time;
      }
      const deltaRealSec = Math.min(0.1, (time - lastTimeRef.current) / 1000);
      lastTimeRef.current = time;

      if (engineRef.current) {
        const snapshot = engineRef.current.step(deltaRealSec);
        setMetrics(snapshot);

        if (snapshot.isFinished) {
          setSimStatus('finished');
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 }
          });

          // Update comparison row for this condition with live result
          setComparisonData((prev) => {
            const updated = [...prev];
            const idx = updated.findIndex((d) => d.conditionKey === snapshot.trafficCondition);
            const conditionObj = TRAFFIC_CONDITIONS[snapshot.trafficCondition];
            const newRow = {
              conditionKey: snapshot.trafficCondition,
              trafficCondition: conditionObj ? conditionObj.name : snapshot.trafficCondition,
              packetRate: conditionObj ? conditionObj.rate : 30,
              packetsSent: snapshot.packetsSent,
              packetsReceived: snapshot.packetsReceived,
              packetLoss: snapshot.packetLoss,
              packetLossPercent: snapshot.packetLossPercent,
              packetDeliveryRatio: snapshot.packetDeliveryRatio,
              averageLatency: snapshot.averageLatency,
              throughputBps: snapshot.throughputBps,
              throughputKbps: snapshot.throughputKbps,
              networkLoad: snapshot.networkLoad,
              timeSeriesData: snapshot.timeSeriesData
            };
            if (idx >= 0) {
              updated[idx] = newRow;
            } else {
              updated.push(newRow);
            }
            return updated;
          });
          return;
        }
      }

      animFrameRef.current = requestAnimationFrame(tick);
    },
    []
  );

  // Controls: Start
  const handleStart = () => {
    const errors = validateConfig(config);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    if (!engineRef.current) {
      engineRef.current = new NetworkSimulationEngine(config);
    } else {
      engineRef.current.updateConfig(config);
      engineRef.current.reset();
    }

    lastTimeRef.current = 0;
    setSimStatus('running');
    animFrameRef.current = requestAnimationFrame(tick);
  };

  // Controls: Pause
  const handlePause = () => {
    setSimStatus('paused');
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  };

  // Controls: Resume
  const handleResume = () => {
    lastTimeRef.current = 0;
    setSimStatus('running');
    animFrameRef.current = requestAnimationFrame(tick);
  };

  // Controls: Reset
  const handleReset = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setSimStatus('idle');
    if (engineRef.current) {
      engineRef.current.reset();
      setMetrics(engineRef.current.getSnapshot());
    }
  };

  // Controls: Run All Traffic Conditions in Batch
  const handleRunAll = () => {
    const errors = validateConfig(config);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    handleReset();

    const results = Object.keys(TRAFFIC_CONDITIONS).map((key) =>
      simulateFullTrafficCondition(config, key)
    );
    setComparisonData(results);

    // Also populate current metrics with current selected condition's run
    const currentRun = results.find((r) => r.conditionKey === config.trafficCondition) || results[1];
    setMetrics({
      elapsedTime: config.simulationDuration,
      simulationDuration: config.simulationDuration,
      progressPercent: 100,
      isFinished: true,
      packetsSent: currentRun.packetsSent,
      packetsReceived: currentRun.packetsReceived,
      packetLoss: currentRun.packetLoss,
      packetLossPercent: currentRun.packetLossPercent,
      packetDeliveryRatio: currentRun.packetDeliveryRatio,
      averageLatency: currentRun.averageLatency,
      throughputBps: currentRun.throughputBps,
      throughputKbps: currentRun.throughputKbps,
      networkLoad: currentRun.networkLoad,
      queueDepth: 0,
      maxQueueSize: config.gatewayBufferSize || 30,
      activePackets: [],
      recentEvents: [{ id: 1, time: config.simulationDuration, message: 'Batch run completed for all traffic conditions.', type: 'deliver' }],
      timeSeriesData: currentRun.timeSeriesData || [],
      trafficCondition: config.trafficCondition,
      deviceCount: config.deviceCount,
      packetSize: config.packetSize
    });

    setSimStatus('finished');
    confetti({
      particleCount: 70,
      spread: 70,
      origin: { y: 0.7 }
    });
  };

  // Run a single condition from comparison table
  const handleRunSingleCondition = (conditionKey) => {
    const newConfig = {
      ...config,
      trafficCondition: conditionKey
    };
    setConfig(newConfig);
    if (engineRef.current) {
      engineRef.current.updateConfig(newConfig);
      engineRef.current.reset();
    }
    lastTimeRef.current = 0;
    setSimStatus('running');
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    animFrameRef.current = requestAnimationFrame(tick);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  const hasValidationErrors = Object.keys(validationErrors).length > 0;
  const currentConditionObj = TRAFFIC_CONDITIONS[config.trafficCondition] || TRAFFIC_CONDITIONS.medium;

  return (
    <div className="app-container">
      {/* 1. Project Header */}
      <Header />

      {/* 2 & 3: Configuration & Network Topology */}
      <div className="dashboard-grid-2col">
        <ConfigurationPanel
          config={config}
          onChangeConfig={handleConfigChange}
          isRunning={simStatus === 'running'}
          validationErrors={validationErrors}
        />

        <NetworkTopology
          deviceCount={config.deviceCount}
          activePackets={metrics?.activePackets || []}
          recentEvents={metrics?.recentEvents || []}
          queueDepth={metrics?.queueDepth || 0}
          maxQueueSize={config.gatewayBufferSize || 30}
          packetsReceived={metrics?.packetsReceived || 0}
          trafficCondition={config.trafficCondition}
        />
      </div>

      {/* 4. Simulation Controls & Progress */}
      <SimulationControls
        simStatus={simStatus}
        onStart={handleStart}
        onPause={handlePause}
        onResume={handleResume}
        onReset={handleReset}
        onRunAll={handleRunAll}
        elapsedTime={metrics?.elapsedTime || 0}
        duration={config.simulationDuration}
        progressPercent={metrics?.progressPercent || 0}
        hasValidationErrors={hasValidationErrors}
      />

      {/* 5. Performance Metric KPI Cards */}
      <MetricCards metrics={metrics} />

      {/* 6. Traffic Performance Charts (Recharts) */}
      <PerformanceCharts
        comparisonData={comparisonData}
        liveTimeSeriesData={metrics?.timeSeriesData}
      />

      {/* 7. Traffic Condition Comparison Table */}
      <ComparisonTable
        comparisonData={comparisonData}
        activeConditionKey={config.trafficCondition}
        onRunSingleCondition={handleRunSingleCondition}
        isRunning={simStatus === 'running'}
      />

      {/* 8. Results Interpretation & Analysis */}
      <PerformanceAnalysis
        comparisonData={comparisonData}
        currentMetrics={metrics}
        activeConditionName={currentConditionObj.name}
      />

      {/* Academic Footer */}
      <footer className="app-footer">
        <p>
          Computer Networks &amp; IoT Simulation Laboratory Prototype • Browser-Based Pure JavaScript Discrete Simulation Engine
        </p>
      </footer>
    </div>
  );
}
