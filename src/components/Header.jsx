import React from 'react';
import { Radio, Activity, Cpu, Network } from 'lucide-react';

export default function Header() {
  return (
    <header className="header-card">
      <div className="header-top">
        <div className="header-title-group">
          <h1>
            <Network className="text-cyan" size={32} />
            Performance Evaluation of IoT Networks Under Different Traffic Conditions
          </h1>
          <p>
            An interactive browser-based discrete simulation evaluating Queuing Delay, Packet Loss, Throughput, and Delivery Ratio across IoT Sensors, Gateway, and Central Server.
          </p>
        </div>
        <div className="header-badges">
          <span className="badge badge-academic">
            <Cpu size={13} />
            CN / IoT Academic Prototype
          </span>
          <span className="badge badge-sim">
            <Activity size={13} />
            Pure Browser Engine
          </span>
          <span className="badge badge-low">
            <Radio size={13} />
            Sensors → Gateway → Server
          </span>
        </div>
      </div>
    </header>
  );
}
