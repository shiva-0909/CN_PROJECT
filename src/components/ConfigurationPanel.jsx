import React from 'react';
import { Sliders, HelpCircle, Layers, Clock, Zap, Gauge } from 'lucide-react';
import { TRAFFIC_CONDITIONS, SPEED_OPTIONS } from '../simulation/simulationTypes';

export default function ConfigurationPanel({
  config,
  onChangeConfig,
  isRunning,
  validationErrors
}) {
  const handleInputChange = (field, value) => {
    onChangeConfig({
      ...config,
      [field]: value
    });
  };

  const handlePresetSelect = (presetKey) => {
    if (isRunning) return;
    onChangeConfig({
      ...config,
      trafficCondition: presetKey
    });
  };

  return (
    <div className="card">
      <h2 className="card-title">
        <Sliders size={20} />
        Network Configuration
      </h2>

      <div className="config-grid">
        {/* Traffic Condition Presets */}
        <div className="form-group full-width">
          <label className="form-label">
            <span>Traffic Condition Preset</span>
            <span className="hint">Select load scenario</span>
          </label>
          <div className="traffic-preset-selector">
            {Object.entries(TRAFFIC_CONDITIONS).map(([key, item]) => {
              const isActive = config.trafficCondition === key;
              return (
                <button
                  key={key}
                  type="button"
                  disabled={isRunning}
                  onClick={() => handlePresetSelect(key)}
                  className={`traffic-preset-btn ${isActive ? 'active' : ''}`}
                  style={{
                    '--active-color': item.color,
                    '--active-glow': `${item.color}33`
                  }}
                >
                  <div className="traffic-preset-name">
                    <span style={{ color: isActive ? item.color : 'inherit' }}>
                      {item.name}
                    </span>
                    <span className={`badge ${item.badgeClass}`} style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem' }}>
                      {item.rate} pkts/s
                    </span>
                  </div>
                  <div className="traffic-preset-rate">
                    {item.expectedLoss} loss • {item.expectedLatency}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Number of IoT Devices */}
        <div className="form-group">
          <label className="form-label">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Layers size={14} /> IoT Sensor Devices (N)
            </span>
            <span className="hint">1 – 100 nodes</span>
          </label>
          <input
            type="number"
            className="form-input"
            min="1"
            max="100"
            disabled={isRunning}
            value={config.deviceCount}
            onChange={(e) => handleInputChange('deviceCount', parseInt(e.target.value, 10) || '')}
          />
          {validationErrors?.deviceCount && (
            <span style={{ color: '#f87171', fontSize: '0.75rem' }}>{validationErrors.deviceCount}</span>
          )}
        </div>

        {/* Packet Size */}
        <div className="form-group">
          <label className="form-label">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Zap size={14} /> Packet Size (Bytes)
            </span>
            <span className="hint">64 – 4096 B</span>
          </label>
          <input
            type="number"
            className="form-input"
            min="64"
            max="4096"
            step="64"
            disabled={isRunning}
            value={config.packetSize}
            onChange={(e) => handleInputChange('packetSize', parseInt(e.target.value, 10) || '')}
          />
          {validationErrors?.packetSize && (
            <span style={{ color: '#f87171', fontSize: '0.75rem' }}>{validationErrors.packetSize}</span>
          )}
        </div>

        {/* Simulation Duration */}
        <div className="form-group">
          <label className="form-label">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Clock size={14} /> Simulation Duration (s)
            </span>
            <span className="hint">5 – 120s</span>
          </label>
          <input
            type="number"
            className="form-input"
            min="5"
            max="120"
            disabled={isRunning}
            value={config.simulationDuration}
            onChange={(e) => handleInputChange('simulationDuration', parseInt(e.target.value, 10) || '')}
          />
          {validationErrors?.simulationDuration && (
            <span style={{ color: '#f87171', fontSize: '0.75rem' }}>{validationErrors.simulationDuration}</span>
          )}
        </div>

        {/* Simulation Speed */}
        <div className="form-group">
          <label className="form-label">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Gauge size={14} /> Simulation Speed
            </span>
            <span className="hint">Real-time multiplier</span>
          </label>
          <select
            className="form-select"
            value={config.simulationSpeed}
            onChange={(e) => handleInputChange('simulationSpeed', parseFloat(e.target.value))}
          >
            {SPEED_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
