import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { BarChart3, TrendingUp, Activity, PieChart } from 'lucide-react';

const CustomTooltip = ({ active, payload, label, unit = '' }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-chart-tooltip">
        <p style={{ color: 'var(--text-accent)', fontWeight: 600, marginBottom: '4px' }}>
          {label}
        </p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color || entry.stroke, margin: '2px 0' }}>
            {entry.name}: {entry.value} {unit}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function PerformanceCharts({ comparisonData, liveTimeSeriesData }) {
  // Chart 1: Traffic vs Packet Loss & Delivery Ratio
  // Chart 2: Traffic vs Latency
  // Chart 3: Traffic vs Throughput
  // Chart 4: Real-Time Telemetry over Simulation Time

  const hasComparison = comparisonData && comparisonData.length > 0;
  const hasLive = liveTimeSeriesData && liveTimeSeriesData.length > 1;

  return (
    <div>
      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.85rem', color: 'var(--text-primary)' }}>
        Traffic Performance Visualizations
      </h3>

      <div className="charts-grid">
        {/* CHART 1: Traffic vs Packet Loss (%) */}
        <div className="chart-card">
          <div className="chart-header">
            <span className="chart-title">
              <BarChart3 size={18} style={{ color: '#ef4444' }} />
              Traffic Condition vs Packet Loss (%)
            </span>
            <span className="chart-subtitle">Loss increases with congestion</span>
          </div>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                <XAxis dataKey="trafficCondition" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 'auto']} tickFormatter={(v) => `${v}%`} />
                <Tooltip content={<CustomTooltip unit="%" />} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="packetLossPercent" name="Packet Loss (%)" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: Traffic vs Average Latency (ms) */}
        <div className="chart-card">
          <div className="chart-header">
            <span className="chart-title">
              <TrendingUp size={18} style={{ color: '#f59e0b' }} />
              Traffic Condition vs Average Latency (ms)
            </span>
            <span className="chart-subtitle">Queue wait time degradation</span>
          </div>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                <XAxis dataKey="trafficCondition" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `${v}ms`} />
                <Tooltip content={<CustomTooltip unit="ms" />} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="averageLatency" name="Average Latency (ms)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 3: Traffic vs Packet Delivery Ratio (PDR %) */}
        <div className="chart-card">
          <div className="chart-header">
            <span className="chart-title">
              <PieChart size={18} style={{ color: '#10b981' }} />
              Traffic Condition vs Packet Delivery Ratio (PDR)
            </span>
            <span className="chart-subtitle">Reliability under increasing load</span>
          </div>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                <XAxis dataKey="trafficCondition" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip content={<CustomTooltip unit="%" />} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="packetDeliveryRatio" name="PDR (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 4: Traffic vs Throughput (Kbps) */}
        <div className="chart-card">
          <div className="chart-header">
            <span className="chart-title">
              <Activity size={18} style={{ color: '#06b6d4' }} />
              Traffic Condition vs Effective Throughput (Kbps)
            </span>
            <span className="chart-subtitle">Goodput saturation threshold</span>
          </div>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                <XAxis dataKey="trafficCondition" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `${v}`} />
                <Tooltip content={<CustomTooltip unit="Kbps" />} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="throughputKbps" name="Throughput (Kbps)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* REAL-TIME SIMULATION TELEMETRY (If Live Data Exists) */}
      {hasLive && (
        <div className="chart-card" style={{ marginTop: '1.5rem' }}>
          <div className="chart-header">
            <span className="chart-title">
              <Activity size={18} style={{ color: '#38bdf8' }} />
              Real-Time Simulation Telemetry (Time-Series)
            </span>
            <span className="chart-subtitle">Instantaneous Throughput &amp; Latency dynamics</span>
          </div>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={liveTimeSeriesData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f293d" />
                <XAxis dataKey="timeLabel" stroke="#94a3b8" fontSize={12} />
                <YAxis yAxisId="left" stroke="#06b6d4" fontSize={12} orientation="left" />
                <YAxis yAxisId="right" stroke="#f59e0b" fontSize={12} orientation="right" />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="throughputKbps"
                  name="Throughput (Kbps)"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="latency"
                  name="Average Latency (ms)"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
