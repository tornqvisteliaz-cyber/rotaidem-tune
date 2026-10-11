/**
 * Rotaidem Tune - Telemetry Model
 * Converts raw SimConnect values into validated, unit-normalized internal values.
 * All values are explicitly documented against official SimVars.
 *
 * Verified sources (as of 2026-10-11):
 * - AIRSPEED INDICATED: Knots (official SimVars docs)
 * - AIRSPEED TRUE: Knots
 * - VERTICAL SPEED: Feet per minute (standard)
 * - PLANE ALTITUDE / INDICATED ALTITUDE: Feet
 * - SIM ON GROUND / GEAR IS ON GROUND: Boolean
 * - TITLE: String (aircraft title)
 */

export const TelemetryValidity = {
  VALID: 'valid',
  STALE: 'stale',
  INVALID: 'invalid',
  MISSING: 'missing'
};

export class TelemetrySample {
  constructor() {
    this.timestamp = Date.now();
    this.indicatedAirspeedKts = null;      // AIRSPEED INDICATED, Knots
    this.trueAirspeedKts = null;           // AIRSPEED TRUE, Knots
    this.groundSpeedKts = null;            // GROUND VELOCITY or GPS GROUND SPEED, Knots
    this.altitudeFt = null;                // PLANE ALTITUDE or INDICATED ALTITUDE, Feet
    this.verticalSpeedFpm = null;          // VERTICAL SPEED, Feet per minute
    this.onGround = null;                  // SIM ON GROUND or GEAR IS ON GROUND
    this.aircraftTitle = null;             // TITLE
    this.validity = TelemetryValidity.MISSING;
    this.source = 'unknown';               // 'live' | 'simulated' | 'error'
  }

  /**
   * Validate and normalize a raw sample.
   * Rejects non-numeric, negative airspeeds beyond physical limits, etc.
   */
  static fromRaw(raw, source = 'live') {
    const sample = new TelemetrySample();
    sample.source = source;
    sample.timestamp = Date.now();

    // Indicated Airspeed - primary for airflow
    if (typeof raw.indicatedAirspeed === 'number' && 
        raw.indicatedAirspeed >= 0 && raw.indicatedAirspeed < 2000) {
      sample.indicatedAirspeedKts = raw.indicatedAirspeed;
    }

    if (typeof raw.trueAirspeed === 'number' && raw.trueAirspeed >= 0 && raw.trueAirspeed < 2000) {
      sample.trueAirspeedKts = raw.trueAirspeed;
    }

    if (typeof raw.groundSpeed === 'number' && raw.groundSpeed >= 0 && raw.groundSpeed < 2000) {
      sample.groundSpeedKts = raw.groundSpeed;
    }

    if (typeof raw.altitude === 'number' && raw.altitude > -1000 && raw.altitude < 100000) {
      sample.altitudeFt = raw.altitude;
    }

    if (typeof raw.verticalSpeed === 'number' && Math.abs(raw.verticalSpeed) < 20000) {
      sample.verticalSpeedFpm = raw.verticalSpeed;
    }

    if (typeof raw.onGround === 'boolean' || typeof raw.onGround === 'number') {
      sample.onGround = Boolean(raw.onGround);
    }

    if (typeof raw.aircraftTitle === 'string' && raw.aircraftTitle.length > 0 && raw.aircraftTitle.length < 200) {
      sample.aircraftTitle = raw.aircraftTitle;
    }

    // Determine overall validity
    const hasPrimary = sample.indicatedAirspeedKts !== null || sample.onGround !== null;
    sample.validity = hasPrimary ? TelemetryValidity.VALID : TelemetryValidity.INVALID;

    return sample;
  }

  isValid() {
    return this.validity === TelemetryValidity.VALID;
  }

  ageMs() {
    return Date.now() - this.timestamp;
  }
}
