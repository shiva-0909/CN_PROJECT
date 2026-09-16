import React from 'react';
import {
  Send,
  Download,
  AlertTriangle,
  Percent,
  Clock,
  Activity,
  Cpu
} from 'lucide-react';
import { formatNumber, formatThroughput, formatLatency, formatPercent } from '../simulation/simulationTypes';

export default function MetricCards({ metrics }) {
  const {
    packetsSent = 0,
    packetsReceived = 0,
    packetLoss = 0,
    packetLossPercent = 0,
    packetDeliveryRatio = 100,
    averageLatency = 0,
    throughputBps = 0,
    networkLoad = 0
  } = metrics || {};

  const cards = [
    {
      title: 'Packets Sent',
      value: formatNumber(packetsSent),
      unit: 'pkts',
      icon: Send,
      iconColor: '#38bdf8',
      iconBg: 'rgba(56, 189, 248, 0.15)',
      footer: 'Total generated across sensor nodes',
      formula: 'N_sent = Σ generated packets'
    },
    {
      title: 'Packets Received',
      value: formatNumber(packetsReceived),
      unit: 'pkts',
      icon: Download,
      iconColor: '#10b981',
      iconBg: 'rgba(16, 185, 129, 0.15)',
      footer: 'Successfully delivered to Server',
      formula: 'N_recv = Delivered to destination'
    },
    {
      title: 'Packet Loss',
      value: `${formatNumber(packetLoss)} (${formatPercent(packetLossPercent)})`,
      unit: '',
      icon: AlertTriangle,
      iconColor: packetLossPercent > 20 ? '#ef4444' : packetLossPercent > 5 ? '#f59e0b' : '#10b981',
      iconBg: packetLossPercent > 20 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
      footer: 'Dropped via collision or queue overflow',
      formula: 'Sent - Received'
    },
    {
      title: 'Packet Delivery Ratio',
      value: formatPercent(packetDeliveryRatio),
      unit: 'PDR',
      icon: Percent,
      iconColor: packetDeliveryRatio > 90 ? '#10b981' : packetDeliveryRatio > 70 ? '#06b6d4' : '#ef4444',
      iconBg: 'rgba(16, 185, 129, 0.15)',
      footer: 'Reliability percentage',
      formula: '(Received / Sent) × 100%'
    },
    {
      title: 'Average Latency',
      value: formatLatency(averageLatency),
      unit: '',
      icon: Clock,
      iconColor: averageLatency > 120 ? '#ef4444' : averageLatency > 60 ? '#f59e0b' : '#10b981',
      iconBg: 'rgba(99, 102, 241, 0.15)',
      footer: 'End-to-end transmission delay',
      formula: 'Total Latency / Received'
    },
    {
      title: 'Throughput',
      value: formatThroughput(throughputBps),
      unit: '',
      icon: Activity,
      iconColor: '#06b6d4',
      iconBg: 'rgba(6, 182, 212, 0.15)',
      footer: 'Effective network data delivery rate',
      formula: '(Recv × PktSize × 8) / Duration'
    },
    {
      title: 'Network Load',
      value: formatPercent(networkLoad),
      unit: 'Load',
      icon: Cpu,
      iconColor: networkLoad > 90 ? '#ef4444' : networkLoad > 60 ? '#f59e0b' : '#10b981',
      iconBg: 'rgba(56, 189, 248, 0.15)',
      footer: 'Traffic rate vs Gateway capacity',
      formula: '(Arrival Rate / Service Rate) × 100%'
    }
  ];

  return (
    <div>
      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.85rem', color: 'var(--text-primary)' }}>
        Network Performance Metrics
      </h3>
      <div className="metric-grid">
        {cards.map((card, idx) => {
          const IconComponent = card.icon;
          return (
            <div key={idx} className="metric-card">
              <div>
                <div className="metric-header">
                  <span className="metric-title">{card.title}</span>
                  <div className="metric-icon-box" style={{ background: card.iconBg }}>
                    <IconComponent size={16} style={{ color: card.iconColor }} />
                  </div>
                </div>
                <div className="metric-value">
                  {card.value}
                </div>
              </div>
              <div className="metric-footer" title={`Formula: ${card.formula}`}>
                <span>{card.footer}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
