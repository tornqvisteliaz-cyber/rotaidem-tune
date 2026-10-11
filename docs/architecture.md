# Rotaidem Tune - Architecture and Feasibility Notes

## Environment at Audit (2026-10-11)
- Working directory: `/workspace/artifacts` (empty at start)
- OS: Linux (sandbox)
- Available: Node.js v20.20.2, npm, Python 3.10, GCC
- Not available: .NET SDK, Wine, MSFS, SimConnect.dll

## Feasibility
Official Microsoft documentation (docs.flightsimulator.com, verified 2026-10-11) confirms:
- Out-of-process external applications are the recommended approach.
- Supported languages: C, C++, and .NET languages (C#/VB) via managed wrapper.
- node-simconnect provides a pure-protocol implementation that can run on Linux while the simulator runs on Windows (localhost or remote with SimConnect.cfg).

**Blocker for full end-to-end testing in this environment:** No Microsoft Flight Simulator 2024 instance is available, and the sandbox is Linux. Real SimConnect connections cannot be established here. All live telemetry tests must be performed on a Windows machine with MSFS 2024.

## Architecture Decision
- **Language for POC and initial implementation:** Node.js / ES modules.
  Reason: Available in the development environment, node-simconnect provides verified cross-platform SimConnect protocol access, and the pure logic (telemetry, flight state, audio rules) can be fully unit-tested here.
- Production path: The modular design (Telemetry Model, Flight State Engine, Audio Rule Engine) is language-agnostic. The preferred long-term target remains C# + WPF + NAudio for a native Windows desktop application with better UI tooling and WASAPI control. The Node.js version can serve as a working reference or be packaged with Electron.
- Audio: Current POC uses a pure-JavaScript gain simulator (no native modules required in this environment). Production target remains WASAPI via NAudio on Windows. The audio engine interface is simple so the implementation can be swapped without changing the rule engine.

## Verified SimVars (official docs)
- `AIRSPEED INDICATED` — Knots
- `AIRSPEED TRUE` — Knots
- `GROUND VELOCITY` — Knots
- `PLANE ALTITUDE` — Feet
- `VERTICAL SPEED` — Feet per minute
- `SIM ON GROUND` — Bool
- `TITLE` — String

## Next Steps
1. Confirm node-simconnect installs cleanly (pure JS).
2. Run unit tests on pure logic.
3. Run the POC (expect "simulator not running" + simulated telemetry mode with visible gain response).
4. On a Windows machine with MSFS 2024: verify live connection and data.
5. Expand to multi-layer audio, profiles, settings persistence, and WPF UI.
