# Rotaidem Tune

External flight simulator audio enhancement application for Microsoft Flight Simulator 2024.

**Company:** Rotaidem Software Group (RSG)  
**Website:** https://rotaidem.com  
**Status:** Early proof-of-concept (beta development)

## Current State (2026-10-11)

This repository contains the initial modular implementation created during project audit and technical feasibility work.

### What works (tested in development environment)
- Telemetry validation and unit-normalized model
- Flight state engine (on-ground, takeoff, climb, cruise, descent, approach, landing)
- Audio rule engine with gain calculation and smoothing
- Unit tests for pure logic (**5/5 passing**)
- Connection state machine
- Simulated telemetry service (clearly labeled)
- Audio gain responds smoothly to increasing indicated airspeed
- Real SimConnect service skeleton ready for Windows + MSFS 2024

### Known environment limitations
- `node-simconnect` and native audio modules cannot be fully installed in this Linux sandbox (npm hangs / node-gyp failures).
- Live SimConnect connection has not been executed against a real MSFS 2024 instance.

### What requires a Windows machine with MSFS 2024
- Live SimConnect connection and real telemetry
- End-to-end audio reaction to actual flight data
- Full installer and distribution testing

## Quick Start (Development)

```bash
cd rotaidem-tune
npm install
node --test tests/core.test.js          # pure logic tests
node src/poc.js                         # proof of concept
```

The POC will attempt a real SimConnect connection. If the simulator is not reachable it automatically falls back to clearly labeled simulated telemetry so audio behavior can be observed.

## Building the Windows Installer

See `installer/BUILD.md` for steps to produce `RotaidemTune.exe` and the Inno Setup installer.

The installer places the application in `%LOCALAPPDATA%\Rotaidem\Tune\` and optionally detects the MSFS 2024 Community folder to place a companion package.

## Architecture
See `docs/architecture.md`.

## Important Rules Followed
- Only documented SimConnect interfaces and SimVars are used.
- No process injection, memory access, or simulator file modification.
- Live telemetry is always distinguished from simulated test data.
- Conservative volume defaults.
- Modular design so the preferred C# + WPF + NAudio path remains available.
