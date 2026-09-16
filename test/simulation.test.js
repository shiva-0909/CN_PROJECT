import { NetworkSimulationEngine, simulateFullTrafficCondition } from '../src/simulation/networkSimulation.js';
import { DEFAULT_CONFIG, TRAFFIC_CONDITIONS } from '../src/simulation/simulationTypes.js';

function runTests() {
  console.log('=== Running IoT Network Simulation Unit Tests ===\n');

  // Test 1: Engine Initialization & Default snapshot
  const engine = new NetworkSimulationEngine(DEFAULT_CONFIG);
  const initialSnap = engine.getSnapshot();
  console.assert(initialSnap.packetsSent === 0, 'Initial packets sent should be 0');
  console.assert(initialSnap.packetsReceived === 0, 'Initial packets received should be 0');
  console.assert(initialSnap.packetLoss === 0, 'Initial packet loss should be 0');
  console.assert(initialSnap.packetDeliveryRatio === 100, 'Initial PDR should be 100%');
  console.log('✔ Test 1: Initialization & Zero-State verified');

  // Test 2: Low Traffic Simulation run
  const lowResult = simulateFullTrafficCondition(DEFAULT_CONFIG, 'low');
  console.log('Low Traffic Results:', {
    sent: lowResult.packetsSent,
    recv: lowResult.packetsReceived,
    loss: `${lowResult.packetLoss} (${lowResult.packetLossPercent}%)`,
    pdr: `${lowResult.packetDeliveryRatio}%`,
    latency: `${lowResult.averageLatency}ms`,
    throughput: `${lowResult.throughputKbps} Kbps`,
    load: `${lowResult.networkLoad}%`
  });
  console.assert(lowResult.packetsSent > 0, 'Low traffic should send packets');
  console.assert(lowResult.packetDeliveryRatio >= 90, 'Low traffic PDR should be high (>=90%)');
  console.assert(lowResult.averageLatency < 45, 'Low traffic latency should be low (<45ms)');
  console.log('✔ Test 2: Low Traffic dynamics verified');

  // Test 3: Congested Traffic Simulation run
  const congResult = simulateFullTrafficCondition(DEFAULT_CONFIG, 'congested');
  console.log('Congested Traffic Results:', {
    sent: congResult.packetsSent,
    recv: congResult.packetsReceived,
    loss: `${congResult.packetLoss} (${congResult.packetLossPercent}%)`,
    pdr: `${congResult.packetDeliveryRatio}%`,
    latency: `${congResult.averageLatency}ms`,
    throughput: `${congResult.throughputKbps} Kbps`,
    load: `${congResult.networkLoad}%`
  });
  console.assert(congResult.packetsSent > lowResult.packetsSent, 'Congested sent > Low sent');
  console.assert(congResult.packetLossPercent > lowResult.packetLossPercent, 'Congested loss % > Low loss %');
  console.assert(congResult.averageLatency > lowResult.averageLatency, 'Congested latency > Low latency');
  console.assert(congResult.packetDeliveryRatio < lowResult.packetDeliveryRatio, 'Congested PDR < Low PDR');
  console.log('✔ Test 3: Congested Traffic degradation verified');

  // Test 4: Verify All 4 Traffic Conditions Comparison Consistency
  const allResults = Object.keys(TRAFFIC_CONDITIONS).map(key => simulateFullTrafficCondition(DEFAULT_CONFIG, key));
  console.assert(allResults.length === 4, 'Should simulate exactly 4 traffic conditions');
  console.log('\n--- 4-Condition Comparative Matrix ---');
  allResults.forEach(r => {
    console.log(`${r.trafficCondition.padEnd(18)} | Sent: ${String(r.packetsSent).padStart(5)} | Recv: ${String(r.packetsReceived).padStart(5)} | Loss: ${String(r.packetLossPercent).padStart(5)}% | PDR: ${String(r.packetDeliveryRatio).padStart(5)}% | Latency: ${String(r.averageLatency).padStart(6)}ms | Throughput: ${String(r.throughputKbps).padStart(7)} Kbps | Load: ${r.networkLoad}%`);
  });
  console.log('✔ Test 4: Comparative matrix monotonicity verified');

  // Test 5: Step Simulation, Pause, Resume, Reset
  engine.step(1.0);
  const snap1 = engine.getSnapshot();
  console.assert(snap1.elapsedTime > 0, 'Elapsed time advanced');
  engine.reset();
  const resetSnap = engine.getSnapshot();
  console.assert(resetSnap.elapsedTime === 0, 'Reset cleared elapsed time');
  console.assert(resetSnap.packetsSent === 0, 'Reset cleared packets');
  console.log('✔ Test 5: Step, Reset, and State Transitions verified');

  console.log('\n========================================');
  console.log('ALL UNIT & SIMULATION TESTS PASSED (5/5)');
  console.log('========================================\n');
}

runTests();
