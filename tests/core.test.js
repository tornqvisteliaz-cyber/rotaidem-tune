/**
 * Basic unit tests for pure logic modules.
 * Run with: node --test tests/core.test.js
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TelemetrySample, TelemetryValidity } from '../src/telemetry-model.js';
import { FlightStateEngine, FlightState } from '../src/flight-state-engine.js';
import { AudioRuleEngine, AudioLayer } from '../src/audio-rule-engine.js';

test('TelemetrySample validates good IAS', () => {
  const sample = TelemetrySample.fromRaw({ indicatedAirspeed: 120, onGround: false }, 'test');
  assert.equal(sample.indicatedAirspeedKts, 120);
  assert.equal(sample.validity, TelemetryValidity.VALID);
  assert.equal(sample.source, 'test');
});

test('TelemetrySample rejects invalid IAS', () => {
  const sample = TelemetrySample.fromRaw({ indicatedAirspeed: -10 }, 'test');
  assert.equal(sample.indicatedAirspeedKts, null);
});

test('FlightStateEngine detects on ground', () => {
  const engine = new FlightStateEngine();
  const sample = TelemetrySample.fromRaw({ indicatedAirspeed: 10, onGround: true }, 'test');
  const state = engine.update(sample);
  assert.equal(state, FlightState.ON_GROUND);
});

test('AudioRuleEngine airflow increases with IAS', () => {
  const rules = new AudioRuleEngine({ maxAirflowGain: 1, masterGain: 1 });
  const low = TelemetrySample.fromRaw({ indicatedAirspeed: 30, onGround: false }, 'test');
  const high = TelemetrySample.fromRaw({ indicatedAirspeed: 200, onGround: false }, 'test');
  const lowTarget = rules.calculateTargets(low, 'cruise')[AudioLayer.AIRFLOW];
  const highTarget = rules.calculateTargets(high, 'cruise')[AudioLayer.AIRFLOW];
  assert.ok(highTarget > lowTarget);
  assert.ok(lowTarget < 0.1);
});

test('AudioRuleEngine respects disable', () => {
  const rules = new AudioRuleEngine({ airflowEnabled: false });
  const sample = TelemetrySample.fromRaw({ indicatedAirspeed: 200 }, 'test');
  const target = rules.calculateTargets(sample, 'cruise')[AudioLayer.AIRFLOW];
  assert.equal(target, 0);
});
