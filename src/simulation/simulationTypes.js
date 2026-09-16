/**
 * Traffic presets and simulation constants
 */

export const TRAFFIC_CONDITIONS = {
  low: {
    id: 'low',
    name: 'Low Traffic',
    rate: 10, // aggregate packets/sec
    color: '#10b981', // Emerald
    badgeClass: 'badge-low',
    description: '10 packets/s — Low contention, minimal queuing, near 100% delivery',
    expectedLoss: '< 2%',
    expectedLatency: '15 – 25 ms'
  },
  medium: {
    id: 'medium',
    name: 'Medium Traffic',
    rate: 30, // aggregate packets/sec
    color: '#06b6d4', // Cyan
    badgeClass: 'badge-medium',
    description: '30 packets/s — Normal operating load, occasional minor queue delay',
    expectedLoss: '3 – 8%',
    expectedLatency: '35 – 55 ms'
  },
  high: {
    id: 'high',
    name: 'High Traffic',
    rate: 60, // aggregate packets/sec
    color: '#f59e0b', // Amber
    badgeClass: 'badge-high',
    description: '60 packets/s — High load approaching gateway capacity, rising latency',
    expectedLoss: '12 – 22%',
    expectedLatency: '70 – 120 ms'
  },
  congested: {
    id: 'congested',
    name: 'Congested Traffic',
    rate: 100, // aggregate packets/sec
    color: '#ef4444', // Red
    badgeClass: 'badge-congested',
    description: '100 packets/s — Saturated channel & buffer overflow, severe packet loss',
    expectedLoss: '> 35%',
    expectedLatency: '150 – 300 ms'
  }
};

export const DEFAULT_CONFIG = {
  deviceCount: 20,
  packetSize: 512, // bytes
  simulationDuration: 30, // seconds
  trafficCondition: 'medium',
  gatewayCapacity: 65, // packets/sec service capacity threshold
  gatewayBufferSize: 30, // max queue depth
  simulationSpeed: 1 // 1x, 2x, 5x, 10x
};

export const SPEED_OPTIONS = [
  { label: '1x Normal', value: 1 },
  { label: '2x Fast', value: 2 },
  { label: '5x Turbo', value: 5 },
  { label: '10x Ultra', value: 10 }
];

/**
 * Format throughput to readable unit (bps, Kbps, Mbps)
 */
export function formatThroughput(bps) {
  if (bps === undefined || bps === null || isNaN(bps) || bps < 0) return '0.00 Kbps';
  if (bps >= 1000000) {
    return `${(bps / 1000000).toFixed(2)} Mbps`;
  }
  return `${(bps / 1000).toFixed(2)} Kbps`;
}

/**
 * Format latency (ms)
 */
export function formatLatency(ms) {
  if (ms === undefined || ms === null || isNaN(ms) || ms < 0) return '0.0 ms';
  return `${ms.toFixed(1)} ms`;
}

/**
 * Format percentage
 */
export function formatPercent(val) {
  if (val === undefined || val === null || isNaN(val)) return '0.0%';
  return `${Math.max(0, Math.min(100, val)).toFixed(1)}%`;
}

/**
 * Format integers with commas
 */
export function formatNumber(val) {
  if (val === undefined || val === null || isNaN(val)) return '0';
  return Math.round(val).toLocaleString();
}
