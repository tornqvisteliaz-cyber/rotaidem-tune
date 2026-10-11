/**
 * Rotaidem Tune - Audio Engine (Environment-Resilient POC)
 * Controllable gain demonstration that does not require native modules.
 * In this Linux sandbox it logs and simulates the audio thread.
 * On a machine with a working audio library it can be swapped for real playback.
 *
 * Production target remains WASAPI / NAudio on Windows.
 */

export class SimpleAudioEngine {
  constructor() {
    this.currentGain = 0;
    this.targetGain = 0;
    this.isPlaying = false;
    this._interval = null;
    this._tickCount = 0;
  }

  start() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    console.log('[Audio] Engine started (simulated playback – native module unavailable in this environment)');
    this._interval = setInterval(() => this._tick(), 50); // 20 Hz smoothing
  }

  setTargetGain(gain) {
    this.targetGain = Math.max(0, Math.min(1, gain));
  }

  setMasterGain(gain) {
    this.setTargetGain(gain);
  }

  _tick() {
    if (!this.isPlaying) return;
    // Smooth toward target (same algorithm as production rule engine)
    this.currentGain += (this.targetGain - this.currentGain) * 0.12;
    this.currentGain = Math.max(0, Math.min(1, this.currentGain));
    this._tickCount++;

    // Occasional status so the user can see volume responding
    if (this._tickCount % 20 === 0) {
      const bar = '█'.repeat(Math.round(this.currentGain * 20)).padEnd(20, '░');
      console.log(`[Audio] gain ${this.currentGain.toFixed(2)} [${bar}]`);
    }
  }

  stop() {
    this.isPlaying = false;
    if (this._interval) clearInterval(this._interval);
    this._interval = null;
    this.currentGain = 0;
    console.log('[Audio] Engine stopped');
  }

  getCurrentGain() {
    return this.currentGain;
  }
}
