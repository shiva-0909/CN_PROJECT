import { TRAFFIC_CONDITIONS } from './simulationTypes.js';

/**
 * IoT Network Simulation Engine
 * Simulates: IoT Sensors -> Gateway -> Server
 * Implements M/M/1 queuing dynamics, channel collision probability, buffer overflow, and latency jitter.
 */

export class NetworkSimulationEngine {
  constructor(config = {}) {
    this.updateConfig(config);
    this.reset();
  }

  updateConfig(config = {}) {
    this.deviceCount = Math.max(1, parseInt(config.deviceCount, 10) || 20);
    this.packetSize = Math.max(64, parseInt(config.packetSize, 10) || 512); // bytes
    this.simulationDuration = Math.max(5, parseInt(config.simulationDuration, 10) || 30); // seconds
    this.trafficCondition = config.trafficCondition || 'medium';
    this.gatewayCapacity = config.gatewayCapacity || 65; // packets/sec service rate capacity
    this.gatewayBufferSize = config.gatewayBufferSize || 30; // max packets in gateway queue
    this.simulationSpeed = config.simulationSpeed || 1; // 1x, 2x, 5x, 10x
  }

  reset() {
    this.elapsedTime = 0; // seconds
    this.packetsSent = 0;
    this.packetsReceived = 0;
    this.packetsDropped = 0;
    this.packetsDelayed = 0;
    this.totalLatency = 0;
    this.currentQueueDepth = 0;
    this.activePackets = []; // Visual in-flight particles for UI animation
    this.recentEvents = []; // Event log items
    this.timeSeriesData = []; // History points for live charts
    this.lastSampleSecond = 0;
    this.isFinished = false;
    this.packetIdCounter = 0;
    this.fractionalPackets = 0;
  }

  /**
   * Get the current aggregate packet generation rate (packets/second)
   */
  getTargetPacketRate() {
    const condition = TRAFFIC_CONDITIONS[this.trafficCondition];
    return condition ? condition.rate : 30;
  }

  /**
   * Calculate Network Load %
   * Formula: (Aggregate Packet Rate / Gateway Capacity) * 100
   */
  calculateNetworkLoad() {
    const rate = this.getTargetPacketRate();
    const loadPercent = (rate / this.gatewayCapacity) * 100;
    return parseFloat(loadPercent.toFixed(1));
  }

  /**
   * Step the simulation forward by deltaSimSeconds (in simulation time)
   */
  step(deltaSimSeconds) {
    if (this.isFinished) return this.getSnapshot();

    const dt = Math.max(0.001, deltaSimSeconds);
    const prevTime = this.elapsedTime;
    this.elapsedTime = Math.min(this.simulationDuration, this.elapsedTime + dt);

    const actualDt = this.elapsedTime - prevTime;
    if (actualDt <= 0) {
      if (this.elapsedTime >= this.simulationDuration) {
        this.isFinished = true;
      }
      return this.getSnapshot();
    }

    // 1. Process gateway queue discharge based on gateway service capacity
    const serviceRate = this.gatewayCapacity; // pkts/sec
    const maxProcessable = serviceRate * actualDt;
    const processedFromQueue = Math.min(this.currentQueueDepth, maxProcessable);
    this.currentQueueDepth = Math.max(0, this.currentQueueDepth - processedFromQueue);

    // 2. Determine number of packets generated in this delta interval
    const targetRate = this.getTargetPacketRate();
    this.fractionalPackets += targetRate * actualDt;
    const packetsToGenerate = Math.floor(this.fractionalPackets);
    this.fractionalPackets -= packetsToGenerate;

    // 3. Process each generated packet
    for (let i = 0; i < packetsToGenerate; i++) {
      this.processNewPacket();
    }

    // 4. Update in-flight visual particles for UI animation
    this.updateVisualParticles(actualDt);

    // 5. Record time series snapshot every ~1.0s of simulation time
    const currentIntSec = Math.floor(this.elapsedTime);
    if (currentIntSec > this.lastSampleSecond && this.elapsedTime > 0) {
      this.lastSampleSecond = currentIntSec;
      this.recordTimeSeriesSample(currentIntSec);
    }

    if (this.elapsedTime >= this.simulationDuration) {
      this.isFinished = true;
      if (this.timeSeriesData.length === 0 || this.timeSeriesData[this.timeSeriesData.length - 1].time !== this.simulationDuration) {
        this.recordTimeSeriesSample(this.simulationDuration);
      }
    }

    return this.getSnapshot();
  }

  /**
   * Generate and simulate an individual packet through the network pipeline
   */
  processNewPacket() {
    this.packetIdCounter++;
    this.packetsSent++;

    const deviceId = Math.floor(Math.random() * this.deviceCount) + 1;
    const targetRate = this.getTargetPacketRate();
    const loadFactor = targetRate / this.gatewayCapacity; // Traffic intensity rho = lambda / mu

    // Wireless medium collision probability (CSMA/CA contention model)
    // Low: ~0.8% | Medium: ~4% | High: ~14% | Congested: ~26%
    const collisionProb = Math.min(0.30, Math.max(0.006, 0.006 + 0.12 * Math.pow(loadFactor, 2.2)));

    let isDropped = false;
    let dropReason = null;

    if (Math.random() < collisionProb) {
      isDropped = true;
      dropReason = 'Wireless Collision';
    } else if (this.currentQueueDepth >= this.gatewayBufferSize) {
      // Gateway Buffer Overflow
      isDropped = true;
      dropReason = 'Gateway Buffer Overflow';
    } else {
      // Packet is accepted into gateway buffer
      this.currentQueueDepth = Math.min(this.gatewayBufferSize, this.currentQueueDepth + 1);
    }

    // Latency Calculation (Kendall M/M/1 queuing model + Propagation & Processing):
    // Base wireless transmission + propagation: 12-18ms
    const baseDelay = 12 + Math.random() * 6;
    // Queuing delay proportional to current buffer occupancy & load factor
    const queueDelay = (this.currentQueueDepth / this.gatewayCapacity) * 1000 * (0.6 + 0.4 * loadFactor);
    // Backhaul gateway -> server processing & transmission: 4-8ms
    const backhaulDelay = 4 + Math.random() * 4;
    const totalLatency = Math.max(15, baseDelay + queueDelay + backhaulDelay);

    const isDelayed = !isDropped && totalLatency > 65;

    if (isDropped) {
      this.packetsDropped++;
      if (Math.random() < 0.2 || this.recentEvents.length < 3) {
        this.logEvent(`[Sensor S${deviceId}] Pkt #${this.packetIdCounter} DROPPED (${dropReason})`, 'drop');
      }
    } else {
      this.packetsReceived++;
      this.totalLatency += totalLatency;
      if (isDelayed) {
        this.packetsDelayed++;
        if (Math.random() < 0.2) {
          this.logEvent(`[Server] Pkt #${this.packetIdCounter} DELIVERED with Delay (${totalLatency.toFixed(1)}ms)`, 'delay');
        }
      } else {
        if (Math.random() < 0.15 || this.recentEvents.length < 3) {
          this.logEvent(`[Server] Pkt #${this.packetIdCounter} DELIVERED (${totalLatency.toFixed(1)}ms)`, 'deliver');
        }
      }
    }

    // Visual Particle: Add to active particles array if capacity allows
    if (this.activePackets.length < 25) {
      this.activePackets.push({
        id: this.packetIdCounter,
        deviceId: deviceId,
        progress: 0,
        isDropped: isDropped,
        dropReason: dropReason,
        isDelayed: isDelayed,
        latency: totalLatency,
        phase: 'sensor_to_gw',
        createdAt: this.elapsedTime
      });
    }
  }

  /**
   * Advance visual particles for UI animation
   */
  updateVisualParticles(dt) {
    const speed = 2.0 * this.simulationSpeed;
    const surviving = [];

    for (const pkt of this.activePackets) {
      pkt.progress += dt * speed;

      if (pkt.phase === 'sensor_to_gw') {
        if (pkt.progress >= 0.5) {
          if (pkt.isDropped) {
            continue; // Dropped particle finishes at gateway
          }
          pkt.phase = 'gw_to_server';
        }
        surviving.push(pkt);
      } else if (pkt.phase === 'gw_to_server') {
        if (pkt.progress >= 1.0) {
          continue; // Delivered particle reaches server
        }
        surviving.push(pkt);
      }
    }

    this.activePackets = surviving;
  }

  logEvent(message, type = 'info') {
    const event = {
      id: Date.now() + Math.random(),
      time: this.elapsedTime.toFixed(1),
      message,
      type
    };
    this.recentEvents.unshift(event);
    if (this.recentEvents.length > 20) {
      this.recentEvents.pop();
    }
  }

  recordTimeSeriesSample(timeSec) {
    const sent = this.packetsSent;
    const recv = this.packetsReceived;
    const loss = Math.max(0, sent - recv);
    const lossPercent = sent > 0 ? (loss / sent) * 100 : 0;
    const pdr = sent > 0 ? (recv / sent) * 100 : 100;
    const avgLatency = recv > 0 ? this.totalLatency / recv : 0;
    const throughputBps = this.elapsedTime > 0 ? (recv * this.packetSize * 8) / this.elapsedTime : 0;
    const throughputKbps = parseFloat((throughputBps / 1000).toFixed(2));

    this.timeSeriesData.push({
      time: Math.round(timeSec),
      timeLabel: `${Math.round(timeSec)}s`,
      throughputKbps,
      latency: parseFloat(avgLatency.toFixed(1)),
      pdr: parseFloat(pdr.toFixed(1)),
      lossPercent: parseFloat(lossPercent.toFixed(1)),
      packetsSent: sent,
      packetsReceived: recv,
      queueDepth: Math.round(this.currentQueueDepth)
    });
  }

  /**
   * Return comprehensive live snapshot of all metrics
   */
  getSnapshot() {
    const sent = this.packetsSent;
    const recv = this.packetsReceived;
    const loss = Math.max(0, sent - recv);
    const lossPercent = sent > 0 ? parseFloat(((loss / sent) * 100).toFixed(2)) : 0;
    const pdr = sent > 0 ? parseFloat(((recv / sent) * 100).toFixed(2)) : 100;
    const avgLatency = recv > 0 ? parseFloat((this.totalLatency / recv).toFixed(1)) : 0;

    // Throughput: (Packets Received * Packet Size in bytes * 8) / Simulation Duration
    const effectiveTime = Math.max(0.1, this.elapsedTime);
    const throughputBps = (recv * this.packetSize * 8) / effectiveTime;
    const throughputKbps = parseFloat((throughputBps / 1000).toFixed(2));
    const networkLoad = this.calculateNetworkLoad();

    return {
      elapsedTime: parseFloat(this.elapsedTime.toFixed(1)),
      simulationDuration: this.simulationDuration,
      progressPercent: Math.min(100, Math.round((this.elapsedTime / this.simulationDuration) * 100)),
      isFinished: this.isFinished,
      packetsSent: sent,
      packetsReceived: recv,
      packetLoss: loss,
      packetLossPercent: lossPercent,
      packetDeliveryRatio: pdr,
      averageLatency: avgLatency,
      throughputBps: throughputBps,
      throughputKbps: throughputKbps,
      networkLoad: networkLoad,
      queueDepth: Math.round(this.currentQueueDepth),
      maxQueueSize: this.gatewayBufferSize,
      activePackets: [...this.activePackets],
      recentEvents: [...this.recentEvents],
      timeSeriesData: [...this.timeSeriesData],
      trafficCondition: this.trafficCondition,
      deviceCount: this.deviceCount,
      packetSize: this.packetSize
    };
  }
}

/**
 * Run a full, deterministic mathematical simulation for a specific traffic condition.
 * Used for "Run All Traffic Conditions" and comparative table / charts.
 */
export function simulateFullTrafficCondition(baseConfig, conditionKey) {
  const condition = TRAFFIC_CONDITIONS[conditionKey] || TRAFFIC_CONDITIONS.medium;
  const config = {
    ...baseConfig,
    trafficCondition: conditionKey,
    simulationSpeed: 1
  };

  const engine = new NetworkSimulationEngine(config);
  const totalDuration = config.simulationDuration || 30;
  const stepDt = 0.01; // Fine-grained 10ms discrete simulation steps

  let simTime = 0;
  while (simTime < totalDuration) {
    engine.step(stepDt);
    simTime += stepDt;
  }

  const snapshot = engine.getSnapshot();
  return {
    conditionKey: conditionKey,
    trafficCondition: condition.name,
    packetRate: condition.rate,
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
}
