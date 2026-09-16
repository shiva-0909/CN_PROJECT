# Performance Evaluation of IoT Networks Under Different Traffic Conditions

> **Academic Project Prototype** | Computer Networks & IoT Laboratory Simulation  
> *A Pure Browser-Based Discrete Network Simulator in React + Vite*

---

## 1. Project Title
**Performance Evaluation of IoT Networks Under Different Traffic Conditions**

---

## 2. Project Objective
The primary objective of this project is to simulate, evaluate, and visualize the performance characteristics of an Internet of Things (IoT) network operating under varying traffic load conditions:
* **Low Traffic** (10 pkts/s)
* **Medium Traffic** (30 pkts/s)
* **High Traffic** (60 pkts/s)
* **Congested Traffic** (100 pkts/s)

The project mathematically computes key networking metrics (Packet Loss, Packet Delivery Ratio, Average Latency, Throughput, and Network Load) and demonstrates the degradation of Quality of Service (QoS) as traffic approaches and exceeds network capacity.

---

## 3. Problem Statement
IoT networks frequently connect hundreds to thousands of resource-constrained sensor nodes transmitting telemetry data to centralized servers through edge gateways. In real-world environments, traffic conditions fluctuate dynamically due to periodic sensor reports, emergency alert bursts, and network contention. 

Deploying physical IoT testbeds or configuring complex simulation suites (e.g., NS-3, OMNeT++, MATLAB) for academic demonstration requires extensive setup, physical hardware, or heavy software dependencies. There is a need for a lightweight, accessible, yet mathematically rigorous simulation tool that can demonstrate IoT queuing dynamics, buffer overflow, and channel contention directly in modern web browsers.

---

## 4. Proposed Solution
This project implements a complete, browser-based discrete-event network simulation prototype. 
* **Zero Hardware Requirement**: No Arduino, Raspberry Pi, Docker, or external simulators needed.
* **Deterministic Mathematical Modeling**: Implements Kendall's $M/M/1$ queueing model, buffer overflow mechanisms, and CSMA/CA wireless channel contention probabilities.
* **Real-Time Interactive Telemetry**: Real-time packet particle animations across topology stages (`IoT Sensors → Gateway → Server`), live metric KPI cards, comparative charts, dynamic condition matrices, and automated analytical summaries.

---

## 5. Technologies Used
* **Frontend Framework**: React 18
* **Build Tool**: Vite 6
* **Language**: Modern JavaScript (ES6+), HTML5, Vanilla CSS
* **Data Visualization**: Recharts (Bar Charts, Line Charts, Area Telemetry)
* **Icons**: Lucide React
* **Micro-Interactions**: Canvas-Confetti

---

## 6. Network Architecture & Topology

```
+-------------------+        Wireless Link        +-------------------+        Backhaul Link        +-----------------------+
|  IoT Sensor Nodes |  ========================>  |    IoT Gateway    |  =========================> |  Central Cloud Server |
|   (Node 1 .. N)   |   (Contention / Jitter)     | (FIFO Queue/Buffer) |   (High-Speed Reliable)    |   (Analytics Engine)  |
+-------------------+                             +-------------------+                             +-----------------------+
```

1. **IoT Sensor Nodes ($S_1 \dots S_N$)**: Generate discrete telemetry packets according to selected traffic rates.
2. **IoT Gateway**: Edge concentrator with finite FIFO buffer ($B = 30\text{ packets}$) and finite processing service capacity ($\mu = 65\text{ pkts/s}$).
3. **Central Server**: Destination endpoint aggregating successfully delivered packets, logging end-to-end latency, and calculating goodput.

---

## 7. Simulation Methodology & Traffic Model

### Traffic Conditions:
| Traffic Condition | Aggregate Rate ($\lambda$) | Network Load ($\rho = \lambda/\mu$) | Expected Loss | Expected Latency |
| :--- | :--- | :--- | :--- | :--- |
| **Low Traffic** | $10\text{ pkts/s}$ | $\sim 15.4\%$ | $< 2\%$ | $15 – 30\text{ ms}$ |
| **Medium Traffic** | $30\text{ pkts/s}$ | $\sim 46.2\%$ | $3 – 8\%$ | $35 – 55\text{ ms}$ |
| **High Traffic** | $60\text{ pkts/s}$ | $\sim 92.3\%$ | $10 – 20\%$ | $70 – 120\text{ ms}$ |
| **Congested Traffic** | $100\text{ pkts/s}$ | $\sim 153.8\%$ | $> 30\%$ | $180 – 350\text{ ms}$ |

### Mathematical Principles:
1. **Queuing Delay ($M/M/1$)**: Average waiting time in the gateway queue grows non-linearly as traffic intensity factor $\rho = \lambda / \mu$ approaches $1.0$:
   $$W_q = \frac{\rho}{\mu(1 - \rho)}$$
2. **Buffer Overflow**: When instantaneous queue depth exceeds maximum buffer capacity $B$, incoming packets undergo tail drop.
3. **Wireless Medium Contention**: Models CSMA/CA collision probability increasing with the number of competing transmitting sensors.

---

## 8. Performance Metrics & Formulas

1. **Packets Sent ($N_{\text{sent}}$)**:
   $$N_{\text{sent}} = \sum \text{Generated Packets}$$

2. **Packets Received ($N_{\text{recv}}$)**:
   $$N_{\text{recv}} = \sum \text{Delivered Packets at Server}$$

3. **Packet Loss**:
   $$\text{Packet Loss} = N_{\text{sent}} - N_{\text{recv}}$$

4. **Packet Loss Percentage**:
   $$\text{Packet Loss (\%)} = \left(\frac{N_{\text{sent}} - N_{\text{recv}}}{N_{\text{sent}}}\right) \times 100$$

5. **Packet Delivery Ratio (PDR)**:
   $$\text{PDR (\%)} = \left(\frac{N_{\text{recv}}}{N_{\text{sent}}}\right) \times 100$$

6. **Throughput (Effective Goodput)**:
   $$\text{Throughput (bps)} = \frac{N_{\text{recv}} \times \text{Packet Size (bytes)} \times 8}{\text{Simulation Duration (seconds)}}$$

7. **Average Latency**:
   $$\text{Average Latency (ms)} = \frac{\sum \text{Latency of Successfully Delivered Packets}}{N_{\text{recv}}}$$

8. **Network Load (%)**:
   $$\text{Network Load (\%)} = \left(\frac{\text{Aggregate Generation Rate}}{\text{Gateway Capacity}}\right) \times 100$$

---

## 9. How to Run the Project

### Prerequisites:
* **Node.js** (v18 or higher recommended)
* **npm** (comes with Node.js)
* Any modern web browser (Chrome, Edge, Firefox, Safari)

### Installation & Execution:
1. Open terminal in the project directory:
   ```bash
   cd CN_PROJECT
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start local development server:
   ```bash
   npm run dev
   ```

4. Open the browser at:
   ```
   http://localhost:3000/
   ```

5. Build for production:
   ```bash
   npm run build
   ```

6. Run automated simulation test suite:
   ```bash
   node test/simulation.test.js
   ```

---

## 10. Dashboard Features & Controls
* **Configuration Panel**: Modify device count ($1-100$), packet size ($64-4096\text{ B}$), duration ($5-120\text{ s}$), and simulation speed ($1\times, 2\times, 5\times, 10\times$).
* **Simulation Controls**: `Start Simulation`, `Pause Simulation`, `Resume Simulation`, `Reset`, and `Run All Conditions`.
* **Animated Topology**: Live visual packet particles color-coded:
  * 🟢 **Green**: Successfully delivered packet
  * 🟡 **Yellow**: Delayed packet ($> 65\text{ ms}$)
  * 🔴 **Red**: Dropped packet (Buffer overflow / collision)
* **Live Charts (Recharts)**:
  * Traffic vs Packet Loss (%)
  * Traffic vs Latency (ms)
  * Traffic vs Packet Delivery Ratio (PDR %)
  * Traffic vs Throughput (Kbps)
  * Real-Time Simulation Telemetry Time Series
* **Comparison Matrix Table**: Side-by-side comparison across all 4 traffic conditions with one-click **CSV Export** for academic lab submissions.
* **Performance Analysis**: Automatic factual synthesis of empirical observations explaining queue saturation and protocol implications.

---

## 11. Limitations
* **Browser-Based Simulation**: This is a pure mathematical/stochastic simulation prototype executing in JavaScript and does not replace physical hardware wireless spectrum measurements (e.g., RSSI fading, multipath interference).
* **Simplified Link Model**: Assumes single-hop star topology to gateway rather than multi-hop mesh routing (such as RPL or 6LoWPAN mesh).

---

## 12. Future Improvements
* Multi-hop mesh routing simulation (RPL/Zigbee).
* Configurable MAC protocols (ALOHA vs Slotted ALOHA vs CSMA/CA with RTS/CTS).
* Mobile IoT sensor node trajectories.
* Energy consumption model (mJ per packet transmission/reception).

---

## 13. Academic Disclaimer
> **Important**: This application is an educational simulation prototype developed for demonstrating Computer Networks and IoT concepts. It does not require or communicate with physical IoT hardware.
