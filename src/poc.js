/**
 * Rotaidem Tune - Proof of Concept
 * Demonstrates:
 * 1. Connection state machine + telemetry (live or clearly labeled simulated)
 * 2. Controllable external audio gain driven by the audio rule engine
 *
 * In this environment node-simconnect cannot be fully installed, so the
 * simulated service is used. The real SimConnectService remains available
 * for Windows + MSFS 2024.
 */

import { ConnectionState } from './connection-state.js';
import { SimulatedSimConnectService } from './simulated-simconnect-service.js';
import { TelemetrySample } from './telemetry-model.js';
import { FlightStateEngine } from './flight-state-engine.js';
import { AudioRuleEngine, AudioLayer } from './audio-rule-engine.js';
import { SimpleAudioEngine } from './audio-engine.js';

async function main() {
  console.log('=== Rotaidem Tune - Proof of Concept ===');
  console.log('Product: Rotaidem Tune by Rotaidem Software Group');
  console.log('Version: 0.1.0-beta');
  console.log('Environment: development sandbox (no MSFS available)');
  console.log('');

  // Use simulated service. Swap for real SimConnectService on Windows + MSFS.
  const sim = new SimulatedSimConnectService();
  const flightState = new FlightStateEngine();
  const rules = new AudioRuleEngine({
    maxAirflowGain: 0.35,
    masterGain: 0.5
  });
  const audio = new SimpleAudioEngine();

  sim.onStateChange = (state, err) => {
    console.log(`[SimConnect] State: ${state}${err ? ' (' + err + ')' : ''}`);
  };

  sim.onData = (raw) => {
    const sample = TelemetrySample.fromRaw(raw, 'simulated');
    if (!sample.isValid()) return;

    const state = flightState.update(sample);
    const targets = rules.calculateTargets(sample, state);
    const airflow = targets[AudioLayer.AIRFLOW] ?? 0;
    audio.setTargetGain(airflow);

    console.log(
      `[Simulated] IAS: ${sample.indicatedAirspeedKts?.toFixed(0)} kts | ` +
      `State: ${state.padEnd(12)} | ` +
      `Airflow target: ${airflow.toFixed(2)} | ` +
      `Current gain: ${audio.getCurrentGain().toFixed(2)}`
    );
  };

  console.log('[Audio] Starting controllable audio engine...');
  audio.start();

  console.log('[SimConnect] Starting simulated connection (real connection requires MSFS 2024)...');
  await sim.connect();

  process.on('SIGINT', () => {
    console.log('\nShutting down...');
    sim.disconnect();
    audio.stop();
    process.exit(0);
  });

  // Keep alive
  await new Promise(() => {});
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
