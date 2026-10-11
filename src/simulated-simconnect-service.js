/**
 * Rotaidem Tune - Simulated SimConnect Service
 * Implements the same interface as the real SimConnectService.
 * Used for development and automated testing when MSFS is not available.
 * All values are clearly labeled as simulated.
 */

import { ConnectionState } from './connection-state.js';

export class SimulatedSimConnectService {
  constructor() {
    this.state = ConnectionState.DISCONNECTED;
    this.onData = null;
    this.onStateChange = null;
    this._timer = null;
    this._ias = 0;
    this._phase = 0;
  }

  setState(newState, error = null) {
    this.state = newState;
    if (this.onStateChange) this.onStateChange(newState, error);
  }

  async connect() {
    this.setState(ConnectionState.CONNECTING);
    await new Promise(r => setTimeout(r, 300));
    // Simulate "simulator not running" briefly, then switch to simulated mode
    this.setState(ConnectionState.SIMULATOR_NOT_RUNNING, 'No MSFS instance reachable (development environment)');
    this.setState(ConnectionState.CONNECTED); // internal simulated connection
    this._startSimulation();
  }

  _startSimulation() {
    this._timer = setInterval(() => {
      this._phase = (this._phase + 1) % 60;
      // Faster profile for demonstration
      if (this._phase < 8) {
        this._ias = 10 + this._phase * 5;
      } else if (this._phase < 20) {
        this._ias = 50 + (this._phase - 8) * 12;
      } else if (this._phase < 40) {
        this._ias = 200;
      } else {
        this._ias = 200 - (this._phase - 40) * 8;
      }

      const onGround = this._ias < 50;
      const vs = this._phase < 20 ? 500 : this._phase < 40 ? 80 : -600;

      const raw = {
        indicatedAirspeed: this._ias,
        trueAirspeed: this._ias * 1.04,
        groundSpeed: this._ias * 0.96,
        altitude: onGround ? 50 : 3500 + this._phase * 20,
        verticalSpeed: vs,
        onGround,
        aircraftTitle: 'SIMULATED Cessna 172 Skyhawk'
      };

      if (this.onData) this.onData(raw);
    }, 1000);
  }

  disconnect() {
    if (this._timer) clearInterval(this._timer);
    this._timer = null;
    this.setState(ConnectionState.DISCONNECTED);
  }

  getState() {
    return this.state;
  }
}
