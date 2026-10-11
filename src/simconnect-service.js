/**
 * Rotaidem Tune - SimConnect Service
 * Real connection attempt using node-simconnect (pure protocol, works from any OS).
 * Handles connection states. Falls back gracefully when simulator is not running.
 *
 * Protocol: FSX_SP2 is forward-compatible with MSFS 2020 and 2024.
 * Source: node-simconnect documentation and official SimConnect docs.
 */

import { open, Protocol, SimConnectDataType, SimConnectPeriod, SimConnectConstants } from 'node-simconnect';

export { ConnectionState } from './connection-state.js';

export class SimConnectService {
  constructor() {
    this.state = ConnectionState.DISCONNECTED;
    this.handle = null;
    this.lastError = null;
    this.onData = null;       // callback(sampleRaw)
    this.onStateChange = null; // callback(state)
  }

  setState(newState, error = null) {
    this.state = newState;
    this.lastError = error;
    if (this.onStateChange) this.onStateChange(newState, error);
  }

  async connect() {
    if (this.state === ConnectionState.CONNECTING || this.state === ConnectionState.CONNECTED) {
      return;
    }

    this.setState(ConnectionState.CONNECTING);

    try {
      const { handle, recvOpen } = await open('Rotaidem Tune', Protocol.FSX_SP2);
      this.handle = handle;
      this.setState(ConnectionState.CONNECTED);
      console.log('[SimConnect] Connected to', recvOpen?.applicationName || 'simulator');

      this._setupDataDefinition();
      this._requestData();

      // Listen for quit / close
      handle.on('quit', () => {
        this.setState(ConnectionState.CONNECTION_LOST);
        this.handle = null;
      });

      handle.on('exception', (ex) => {
        console.error('[SimConnect] Exception:', ex);
      });

    } catch (err) {
      const msg = err?.message || String(err);
      if (msg.includes('timeout') || msg.includes('refused') || msg.includes('not found') || msg.includes('ENOENT')) {
        this.setState(ConnectionState.SIMULATOR_NOT_RUNNING, msg);
      } else {
        this.setState(ConnectionState.ERROR, msg);
      }
      this.handle = null;
    }
  }

  _setupDataDefinition() {
    if (!this.handle) return;

    const DEF = 1;
    // Documented SimVars with explicit units
    this.handle.addToDataDefinition(DEF, 'AIRSPEED INDICATED', 'Knots', SimConnectDataType.FLOAT64);
    this.handle.addToDataDefinition(DEF, 'AIRSPEED TRUE', 'Knots', SimConnectDataType.FLOAT64);
    this.handle.addToDataDefinition(DEF, 'GROUND VELOCITY', 'Knots', SimConnectDataType.FLOAT64);
    this.handle.addToDataDefinition(DEF, 'PLANE ALTITUDE', 'Feet', SimConnectDataType.FLOAT64);
    this.handle.addToDataDefinition(DEF, 'VERTICAL SPEED', 'Feet per minute', SimConnectDataType.FLOAT64);
    this.handle.addToDataDefinition(DEF, 'SIM ON GROUND', 'Bool', SimConnectDataType.INT32);
    this.handle.addToDataDefinition(DEF, 'TITLE', null, SimConnectDataType.STRING256);

    this.handle.on('simObjectData', (data) => {
      if (data.requestID !== 1) return;
      try {
        const raw = {
          indicatedAirspeed: data.data.readFloat64(),
          trueAirspeed: data.data.readFloat64(),
          groundSpeed: data.data.readFloat64(),
          altitude: data.data.readFloat64(),
          verticalSpeed: data.data.readFloat64(),
          onGround: data.data.readInt32() !== 0,
          aircraftTitle: data.data.readString256()
        };
        if (this.onData) this.onData(raw);
      } catch (e) {
        console.error('[SimConnect] Data parse error:', e);
      }
    });
  }

  _requestData() {
    if (!this.handle) return;
    this.handle.requestDataOnSimObject(
      1, // request ID
      1, // definition ID
      SimConnectConstants.OBJECT_ID_USER,
      SimConnectPeriod.SECOND, // 1 Hz for MVP - measure and tune later
      0, 0, 0
    );
  }

  disconnect() {
    if (this.handle) {
      try { this.handle.close?.(); } catch {}
      this.handle = null;
    }
    this.setState(ConnectionState.DISCONNECTED);
  }

  getState() {
    return this.state;
  }
}
