import React from 'react';
import { Play, Pause, RotateCcw, FastForward, CheckCircle2 } from 'lucide-react';

export default function SimulationControls({
  simStatus, // 'idle', 'running', 'paused', 'finished'
  onStart,
  onPause,
  onResume,
  onReset,
  onRunAll,
  elapsedTime,
  duration,
  progressPercent,
  hasValidationErrors
}) {
  const isRunning = simStatus === 'running';
  const isPaused = simStatus === 'paused';
  const isFinished = simStatus === 'finished';

  const formatSec = (s) => {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="controls-container">
      <div className="btn-group">
        {simStatus === 'idle' && (
          <button
            type="button"
            className="btn btn-primary"
            disabled={hasValidationErrors}
            onClick={onStart}
          >
            <Play size={16} /> Start Simulation
          </button>
        )}

        {isRunning && (
          <button type="button" className="btn btn-secondary" onClick={onPause}>
            <Pause size={16} /> Pause Simulation
          </button>
        )}

        {isPaused && (
          <button type="button" className="btn btn-primary" onClick={onResume}>
            <Play size={16} /> Resume Simulation
          </button>
        )}

        {isFinished && (
          <button type="button" className="btn btn-primary" onClick={onStart}>
            <Play size={16} /> Re-run Simulation
          </button>
        )}

        <button
          type="button"
          className="btn btn-danger"
          onClick={onReset}
          disabled={simStatus === 'idle' && elapsedTime === 0}
        >
          <RotateCcw size={16} /> Reset
        </button>

        <button
          type="button"
          className="btn btn-emerald"
          disabled={isRunning || hasValidationErrors}
          onClick={onRunAll}
          title="Simulate all 4 traffic conditions (Low, Med, High, Congested) and compare results"
        >
          <FastForward size={16} /> Run All Conditions
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', minWidth: '220px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
          <div className="sim-status-indicator">
            <span
              className={`status-dot ${
                isRunning ? 'running' : isPaused ? 'paused' : isFinished ? 'finished' : ''
              }`}
            />
            <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>
              {isRunning
                ? 'Simulating Traffic...'
                : isPaused
                ? 'Simulation Paused'
                : isFinished
                ? 'Simulation Completed'
                : 'Ready to Simulate'}
            </span>
          </div>
          <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-accent)' }}>
            {formatSec(elapsedTime)} / {formatSec(duration)} ({progressPercent}%)
          </span>
        </div>

        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>
    </div>
  );
}
