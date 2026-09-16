import React from 'react';
import { Table, Download, Play, CheckCircle } from 'lucide-react';
import { formatNumber, formatPercent, formatLatency, formatThroughput } from '../simulation/simulationTypes';

export default function ComparisonTable({
  comparisonData,
  activeConditionKey,
  onRunSingleCondition,
  isRunning
}) {
  const exportToCSV = () => {
    if (!comparisonData || comparisonData.length === 0) return;

    const headers = [
      'Traffic Condition',
      'Packet Rate (pkts/s)',
      'Packets Sent',
      'Packets Received',
      'Packet Loss',
      'Packet Loss (%)',
      'Packet Delivery Ratio (%)',
      'Average Latency (ms)',
      'Throughput (Kbps)',
      'Network Load (%)'
    ];

    const rows = comparisonData.map((d) => [
      d.trafficCondition,
      d.packetRate,
      d.packetsSent,
      d.packetsReceived,
      d.packetLoss,
      d.packetLossPercent,
      d.packetDeliveryRatio,
      d.averageLatency,
      d.throughputKbps,
      d.networkLoad
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'iot_network_performance_evaluation.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h2 className="card-title" style={{ margin: 0, padding: 0, border: 'none' }}>
          <Table size={20} />
          Traffic Condition Comparison Matrix
        </h2>
        <button
          type="button"
          className="btn btn-secondary"
          style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem' }}
          onClick={exportToCSV}
          disabled={!comparisonData || comparisonData.length === 0}
          title="Export comparison results to CSV for lab submission"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      <div className="table-responsive">
        <table className="comparison-table">
          <thead>
            <tr>
              <th>Traffic Condition</th>
              <th>Packet Rate</th>
              <th>Packets Sent</th>
              <th>Packets Received</th>
              <th>Packet Loss</th>
              <th>PDR (%)</th>
              <th>Avg Latency</th>
              <th>Throughput</th>
              <th>Network Load</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {comparisonData && comparisonData.length > 0 ? (
              comparisonData.map((row) => {
                const isActive = activeConditionKey === row.conditionKey;
                return (
                  <tr key={row.conditionKey} className={isActive ? 'active-condition' : ''}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontWeight: 700 }}>{row.trafficCondition}</span>
                        {isActive && (
                          <span className="badge badge-sim" style={{ fontSize: '0.65rem' }}>
                            Current
                          </span>
                        )}
                      </div>
                    </td>
                    <td>{row.packetRate} pkts/s</td>
                    <td>{formatNumber(row.packetsSent)}</td>
                    <td style={{ color: '#10b981', fontWeight: 600 }}>{formatNumber(row.packetsReceived)}</td>
                    <td style={{ color: row.packetLossPercent > 15 ? '#ef4444' : row.packetLossPercent > 5 ? '#f59e0b' : '#10b981' }}>
                      {formatNumber(row.packetLoss)} ({row.packetLossPercent}%)
                    </td>
                    <td style={{ color: row.packetDeliveryRatio > 85 ? '#10b981' : row.packetDeliveryRatio > 65 ? '#06b6d4' : '#ef4444', fontWeight: 600 }}>
                      {row.packetDeliveryRatio}%
                    </td>
                    <td>{formatLatency(row.averageLatency)}</td>
                    <td style={{ color: '#38bdf8', fontWeight: 600 }}>{row.throughputKbps} Kbps</td>
                    <td>
                      <span className={`badge ${row.networkLoad > 90 ? 'badge-congested' : row.networkLoad > 60 ? 'badge-high' : 'badge-low'}`}>
                        {row.networkLoad}%
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                        disabled={isRunning}
                        onClick={() => onRunSingleCondition && onRunSingleCondition(row.conditionKey)}
                        title={`Select and run ${row.trafficCondition}`}
                      >
                        <Play size={12} /> Test
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="10" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  No simulation data generated yet. Click "Start Simulation" or "Run All Conditions" to populate the matrix.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
