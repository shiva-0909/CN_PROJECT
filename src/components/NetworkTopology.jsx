import React, { useMemo } from 'react';
import { Radio, Server, Network, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';

export default function NetworkTopology({
  deviceCount,
  activePackets,
  recentEvents,
  queueDepth,
  maxQueueSize,
  packetsReceived,
  trafficCondition
}) {
  // Generate visual representations for up to 16 sensor nodes in grid
  const displayNodesCount = Math.min(16, deviceCount);
  const sensorNodes = useMemo(() => {
    return Array.from({ length: displayNodesCount }, (_, i) => ({
      id: i + 1,
      name: `S${i + 1}`
    }));
  }, [displayNodesCount]);

  // Determine which sensors are currently transmitting
  const transmittingSensorIds = useMemo(() => {
    const ids = new Set();
    activePackets.forEach((p) => {
      if (p.phase === 'sensor_to_gw' && p.progress < 0.25) {
        ids.add(p.deviceId);
      }
    });
    return ids;
  }, [activePackets]);

  const queueFillPercent = Math.min(100, Math.round((queueDepth / maxQueueSize) * 100));

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div className="topology-legend">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
          <Network size={16} className="text-accent" />
          <span>IoT Network Topology Simulation</span>
        </div>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-dot delivered" />
            <span>Delivered</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot delayed" />
            <span>Delayed (&gt;65ms)</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot dropped" />
            <span>Dropped / Collided</span>
          </div>
        </div>
      </div>

      <div className="topology-container" style={{ border: 'none', borderRadius: 0 }}>
        <div className="topology-stage">
          {/* STAGE 1: IoT Sensors */}
          <div className="node-group">
            <div className="node-cluster">
              {sensorNodes.map((node) => {
                const isTransmitting = transmittingSensorIds.has(node.id);
                return (
                  <div
                    key={node.id}
                    className={`sensor-node-mini ${isTransmitting ? 'transmitting' : ''}`}
                    title={`IoT Sensor Node #${node.id}`}
                  >
                    <Radio size={10} style={{ marginRight: '2px' }} />
                    {node.name}
                  </div>
                );
              })}
            </div>
            <div className="node-label">IoT Sensor Nodes</div>
            <div className="node-sublabel">
              {deviceCount} Active {deviceCount === 1 ? 'Device' : 'Devices'}
            </div>
          </div>

          {/* SVG Overlay for Connection Lines & Moving Packets */}
          <svg
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              zIndex: 1
            }}
          >
            {/* Background link lines */}
            <line
              x1="22%"
              y1="50%"
              x2="50%"
              y2="50%"
              stroke="rgba(56, 189, 248, 0.2)"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            <line
              x1="50%"
              y1="50%"
              x2="78%"
              y2="50%"
              stroke="rgba(99, 102, 241, 0.25)"
              strokeWidth="2"
              strokeDasharray="4 4"
            />

            {/* In-Flight Simulated Packets */}
            {activePackets.map((pkt) => {
              let xPos = 0;
              let yPos = 50; // percentage
              let color = '#10b981'; // green

              if (pkt.isDropped) {
                color = '#ef4444'; // red
              } else if (pkt.isDelayed) {
                color = '#f59e0b'; // yellow
              }

              if (pkt.phase === 'sensor_to_gw') {
                // Progress from 0 to 0.5 maps to x from 22% to 50%
                const normP = pkt.progress / 0.5;
                xPos = 22 + normP * 28;
                // Add vertical variation based on deviceId
                const offset = ((pkt.deviceId % 5) - 2) * 6;
                yPos = 50 + offset * (1 - normP);
              } else {
                // Progress from 0.5 to 1.0 maps to x from 50% to 78%
                const normP = (pkt.progress - 0.5) / 0.5;
                xPos = 50 + normP * 28;
                yPos = 50;
              }

              return (
                <g key={pkt.id}>
                  <circle
                    cx={`${xPos}%`}
                    cy={`${yPos}%`}
                    r={pkt.isDropped ? 4 : 5}
                    fill={color}
                    opacity={pkt.isDropped && pkt.progress > 0.4 ? 0.4 : 0.9}
                  />
                  {/* Subtle pulse halo */}
                  <circle
                    cx={`${xPos}%`}
                    cy={`${yPos}%`}
                    r={pkt.isDropped ? 7 : 9}
                    fill="none"
                    stroke={color}
                    strokeWidth="1"
                    opacity={0.5}
                  />
                </g>
              );
            })}
          </svg>

          {/* STAGE 2: Central Gateway */}
          <div className="node-group">
            <div className="central-node">
              <Network size={28} style={{ color: 'var(--text-accent)' }} />
              <div className="buffer-gauge-mini" title={`Gateway Buffer: ${queueDepth}/${maxQueueSize}`}>
                <div
                  className="buffer-gauge-fill"
                  style={{
                    width: `${queueFillPercent}%`,
                    backgroundColor: queueFillPercent > 80 ? '#ef4444' : queueFillPercent > 50 ? '#f59e0b' : '#06b6d4'
                  }}
                />
              </div>
            </div>
            <div className="node-label">IoT Gateway</div>
            <div className="node-sublabel">
              Queue: {queueDepth} / {maxQueueSize} ({queueFillPercent}%)
            </div>
          </div>

          {/* STAGE 3: Destination Server */}
          <div className="node-group">
            <div className="server-node">
              <Server size={28} style={{ color: 'var(--color-indigo)' }} />
            </div>
            <div className="node-label">Central Cloud Server</div>
            <div className="node-sublabel">Recv: {packetsReceived} pkts</div>
          </div>
        </div>

        {/* Real-Time Events Ticker */}
        <div className="events-feed-container">
          <span className="event-ticker-tag">Live Stream:</span>
          {recentEvents.length > 0 ? (
            <span className={`event-ticker-message ${recentEvents[0].type}`}>
              [{recentEvents[0].time}s] {recentEvents[0].message}
            </span>
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>Simulation awaiting start...</span>
          )}
        </div>
      </div>
    </div>
  );
}
