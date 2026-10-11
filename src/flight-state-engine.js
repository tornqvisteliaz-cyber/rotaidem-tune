/**
 * Rotaidem Tune - Flight State Engine
 * Determines basic flight phases from validated telemetry.
 * States are conservative and documented where data is imperfect.
 */

import { TelemetrySample } from './telemetry-model.js';

export const FlightState = {
  DISCONNECTED: 'disconnected',
  ON_GROUND: 'on_ground',
  TAKEOFF: 'takeoff',
  CLIMB: 'climb',
  CRUISE: 'cruise',
  DESCENT: 'descent',
  APPROACH: 'approach',
  LANDING: 'landing',
  UNKNOWN: 'unknown'
};

export class FlightStateEngine {
  constructor() {
    this.currentState = FlightState.DISCONNECTED;
    this.lastValidSample = null;
    this.previousState = FlightState.DISCONNECTED;
  }

  /**
   * Update state based on a new telemetry sample.
   * Returns the new state.
   */
  update(sample) {
    if (!sample || !sample.isValid() || sample.source === 'error') {
      this.previousState = this.currentState;
      this.currentState = FlightState.DISCONNECTED;
      return this.currentState;
    }

    this.lastValidSample = sample;
    const ias = sample.indicatedAirspeedKts ?? 0;
    const vs = sample.verticalSpeedFpm ?? 0;
    const onGround = sample.onGround === true;
    const alt = sample.altitudeFt ?? 0;

    let newState = FlightState.UNKNOWN;

    if (onGround) {
      if (ias < 30) {
        newState = FlightState.ON_GROUND;
      } else if (ias < 80 && vs > -200) {
        newState = FlightState.TAKEOFF; // accelerating for takeoff
      } else {
        newState = FlightState.LANDING; // high speed on ground = landing roll or rejected
      }
    } else {
      // Airborne
      if (ias < 60) {
        newState = FlightState.APPROACH; // slow flight, likely approach
      } else if (vs > 500) {
        newState = FlightState.CLIMB;
      } else if (vs < -500) {
        newState = alt < 5000 ? FlightState.APPROACH : FlightState.DESCENT;
      } else {
        newState = FlightState.CRUISE;
      }
    }

    // Hysteresis to prevent rapid flickering
    if (newState === this.currentState || this.previousState === newState) {
      // keep current
    } else {
      this.previousState = this.currentState;
      this.currentState = newState;
    }

    return this.currentState;
  }

  getState() {
    return this.currentState;
  }
}
