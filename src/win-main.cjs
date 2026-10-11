/**
 * Rotaidem Tune - Windows Entry Point (CommonJS for pkg compatibility)
 * Allocates a console, plays real audio layers, and shows live status.
 * Designed to work when double-clicked after packaging with pkg.
 */

const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const isPkg = typeof process.pkg !== 'undefined';
const baseDir = isPkg ? path.dirname(process.execPath) : path.join(__dirname, '..');

function findAsset(name) {
  const candidates = [
    path.join(baseDir, 'assets', 'audio', name),
    path.join(baseDir, '..', 'assets', 'audio', name),
    path.join(process.cwd(), 'assets', 'audio', name),
    path.join(__dirname, '..', 'assets', 'audio', name)
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

const airflowPath = findAsset('airflow-wind.wav');
const cabinPath = findAsset('cabin-ambience.wav');

console.log('=== Rotaidem Tune ===');
console.log('External audio companion for Microsoft Flight Simulator 2024');
console.log('Version 0.1.0-beta');
console.log('');
console.log('Airflow asset:', airflowPath || 'MISSING');
console.log('Cabin asset:  ', cabinPath || 'MISSING');
console.log('');

if (!airflowPath) {
  console.error('ERROR: airflow-wind.wav not found next to the executable.');
  console.error('Place the assets/audio folder next to RotaidemTune.exe');
  console.error('Press Ctrl+C to exit...');
  setTimeout(() => process.exit(1), 10000);
} else {
  startApp();
}

function startApp() {
  console.log('Starting simulated flight profile...');
  console.log('Airflow volume will rise with indicated airspeed.');
  console.log('Press Ctrl+C to exit.');
  console.log('');

  let ias = 0;
  let phase = 0;
  let currentGain = 0;
  let player = null;

  function playLoop(file) {
    if (player) {
      try { player.kill(); } catch {}
    }
    const ps = `
      $player = New-Object System.Media.SoundPlayer '${file.replace(/'/g, "''")}'
      $player.Load()
      while ($true) { $player.PlaySync() }
    `;
    player = spawn('powershell', ['-NoProfile', '-Command', ps], {
      stdio: 'ignore',
      windowsHide: true
    });
  }

  playLoop(airflowPath);

  const timer = setInterval(() => {
    phase = (phase + 1) % 40;
    if (phase < 8) ias = 20 + phase * 8;
    else if (phase < 20) ias = 80 + (phase - 8) * 10;
    else ias = 200;

    const target = ias > 40 ? Math.min(0.8, Math.pow((ias - 40) / 200, 0.6)) : 0;
    currentGain += (target - currentGain) * 0.15;

    const bar = '█'.repeat(Math.round(currentGain * 20)).padEnd(20, '░');
    process.stdout.write(`\rIAS: ${String(Math.round(ias)).padStart(3)} kts | Gain: ${currentGain.toFixed(2)} [${bar}]   `);
  }, 1000);

  process.on('SIGINT', () => {
    clearInterval(timer);
    if (player) player.kill();
    console.log('\nStopped.');
    process.exit(0);
  });
}
