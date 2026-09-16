import React from 'react';
import { BookOpen, CheckCircle, AlertCircle, TrendingDown, Layers } from 'lucide-react';
import { formatLatency, formatPercent } from '../simulation/simulationTypes';

export default function PerformanceAnalysis({ comparisonData, currentMetrics, activeConditionName }) {
  // Extract key comparison points if comparisonData is present
  const lowData = comparisonData?.find((d) => d.conditionKey === 'low');
  const congestedData = comparisonData?.find((d) => d.conditionKey === 'congested');
  const highData = comparisonData?.find((d) => d.conditionKey === 'high');

  const hasFullData = lowData && congestedData;

  return (
    <div className="analysis-card">
      <h2 className="card-title" style={{ color: 'var(--text-accent)' }}>
        <BookOpen size={20} />
        Performance Evaluation &amp; Analytical Insights
      </h2>

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.6' }}>
        Based on the discrete mathematical simulation of the IoT network (<strong>Sensors → Gateway → Server</strong>), the following factual performance characteristics are observed:
      </p>

      {hasFullData ? (
        <div style={{ margin: '1rem 0', padding: '1rem', background: 'rgba(6, 182, 212, 0.08)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--color-cyan)' }}>
          <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
            Empirical Summary Across Traffic Conditions:
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.35rem' }}>
            As traffic increased from <strong>Low ({lowData.packetRate} pkts/s)</strong> to <strong>Congested ({congestedData.packetRate} pkts/s)</strong>, packet loss increased from <strong>{lowData.packetLossPercent}%</strong> to <strong>{congestedData.packetLossPercent}%</strong>, while average end-to-end latency rose from <strong>{formatLatency(lowData.averageLatency)}</strong> to <strong>{formatLatency(congestedData.averageLatency)}</strong>. Consequently, the Packet Delivery Ratio (PDR) decreased from <strong>{lowData.packetDeliveryRatio}%</strong> down to <strong>{congestedData.packetDeliveryRatio}%</strong>.
          </p>
        </div>
      ) : currentMetrics ? (
        <div style={{ margin: '1rem 0', padding: '1rem', background: 'rgba(6, 182, 212, 0.08)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--color-cyan)' }}>
          <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
            Current Simulation Run ({activeConditionName}):
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.35rem' }}>
            Measured <strong>{currentMetrics.packetsSent}</strong> packets sent with a Packet Delivery Ratio of <strong>{currentMetrics.packetDeliveryRatio}%</strong>, average latency of <strong>{formatLatency(currentMetrics.averageLatency)}</strong>, and effective throughput of <strong>{currentMetrics.throughputKbps} Kbps</strong> at <strong>{currentMetrics.networkLoad}%</strong> network load.
          </p>
        </div>
      ) : null}

      <div className="analysis-points">
        <div className="analysis-item">
          <TrendingDown size={20} className="analysis-item-icon" style={{ color: '#ef4444' }} />
          <div>
            <div className="analysis-item-title">1. Queue Saturation &amp; Packet Loss</div>
            <div className="analysis-item-desc">
              Under Low and Medium traffic, the packet arrival rate (λ = 10 to 30 pkts/s) remains well below the Gateway service capacity (μ = 65 pkts/s), keeping buffer queue depth near zero. Under Congested traffic (λ = 100 pkts/s), arrival rate exceeds processing throughput, overflowing the queue buffer (limit = 30 packets) and causing tail-drop packet loss.
            </div>
          </div>
        </div>

        <div className="analysis-item">
          <AlertCircle size={20} className="analysis-item-icon" style={{ color: '#f59e0b' }} />
          <div>
            <div className="analysis-item-title">2. Latency &amp; Queuing Delay</div>
            <div className="analysis-item-desc">
              In accordance with M/M/1 queuing theory (Wq = ρ / [μ(1 - ρ)]), average packet waiting delay expands non-linearly as the network traffic intensity factor (ρ = λ / μ) approaches and exceeds 1.0, escalating end-to-end latency significantly.
            </div>
          </div>
        </div>

        <div className="analysis-item">
          <Layers size={20} className="analysis-item-icon" style={{ color: '#06b6d4' }} />
          <div>
            <div className="analysis-item-title">3. Goodput Ceiling vs Channel Contention</div>
            <div className="analysis-item-desc">
              While offered load increases with higher traffic presets, useful delivered throughput (Goodput) reaches a maximum bottleneck ceiling at the gateway capacity. Beyond this saturation point, excess generated packets cause wireless collisions and wasted energy without increasing delivered data.
            </div>
          </div>
        </div>

        <div className="analysis-item">
          <CheckCircle size={20} className="analysis-item-icon" style={{ color: '#10b981' }} />
          <div>
            <div className="analysis-item-title">4. IoT Protocol Design Implications</div>
            <div className="analysis-item-desc">
              These experimental observations highlight why rate-limiting, MQTT QoS policies, CoAP congestion control (RFC 7252 with exponential backoff), and edge aggregation are critical in large-scale IoT sensor networks to maintain high reliability and low latency.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
