/**
 * Rotaidem Tune - Audio Rule Engine
 * Converts validated telemetry and flight state into target gains for audio layers.
 * Conservative defaults. Never exceeds configured maximums.
 */

export const AudioLayer = {
  AIRFLOW: 'airflow',
  CABIN: 'cabin'
};

export class AudioRuleEngine {
  constructor(config = {}) {
    this.maxAirflowGain = config.maxAirflowGain ?? 0.4;   // conservative
    this.maxCabinGain = config.maxCabinGain ?? 0.25;
    this.airflowEnabled = config.airflowEnabled ?? true;
    this.cabinEnabled = config.cabinEnabled ?? false;
    this.masterGain = config.masterGain ?? 0.6;
    this.smoothingFactor = 0.15; // 0-1, higher = faster response
  }

  /**
   * Calculate target gains for each layer.
   * Returns { layerId: targetGain 0.0-1.0 }
   */
  calculateTargets(sample, flightState) {
    const targets = {};

    if (!sample || !sample.isValid()) {
      targets[AudioLayer.AIRFLOW] = 0;
      targets[AudioLayer.CABIN] = 0;
      return targets;
    }

    // Airflow: primarily based on indicated airspeed
    // Avoid pure altitude or ground speed dependence
    if (this.airflowEnabled) {
      const ias = sample.indicatedAirspeedKts ?? 0;
      // Soft curve: silent below 40 kts, reaches max around 250 kts
      let airflow = 0;
      if (ias > 40) {
        airflow = Math.min(1.0, Math.pow((ias - 40) / 210, 0.7));
      }
      // Reduce slightly when on ground at low speed
      if (sample.onGround && ias < 60) {
        airflow *= 0.3;
      }
      targets[AudioLayer.AIRFLOW] = airflow * this.maxAirflowGain * this.masterGain;
    } else {
      targets[AudioLayer.AIRFLOW] = 0;
    }

    // Cabin: constant low level when airborne or engines running (simplified)
    if (this.cabinEnabled) {
      const cabin = sample.onGround ? 0.3 : 0.8;
      targets[AudioLayer.CABIN] = cabin * this.maxCabinGain * this.masterGain;
    } else {
      targets[AudioLayer.CABIN] = 0;
    }

    return targets;
  }

  /**
   * Smooth current gains toward targets.
   * Call this on every audio update tick.
   */
  smoothGains(currentGains, targetGains) {
    const smoothed = { ...currentGains };
    for (const layer of Object.keys(targetGains)) {
      const current = currentGains[layer] ?? 0;
      const target = targetGains[layer] ?? 0;
      smoothed[layer] = current + (target - current) * this.smoothingFactor;
      // Clamp
      smoothed[layer] = Math.max(0, Math.min(1, smoothed[layer]));
    }
    return smoothed;
  }
}
