# Building the Windows .exe and Installer

This environment cannot produce a native Windows .exe. Follow these steps on a Windows 11 machine.

## Option A: pkg (single .exe, recommended for this Node.js POC)

1. Install Node.js 20+ and npm.
2. In the project root:
   ```bash
   npm install
   npm install -g pkg
   pkg src/poc.js --targets node20-win-x64 --output RotaidemTune.exe
   ```
3. Copy `RotaidemTune.exe` into the `installer/` folder.
4. Install [Inno Setup](https://jrsoftware.org/isinfo.php).
5. Open `installer/rotaidem-tune.iss` and compile.
6. The output `RotaidemTune-Setup.exe` will be in `installer/output/`.

## Option B: Electron (better UI later)

Use electron-builder to produce a proper desktop app with WPF-like native feel. Requires additional packaging configuration not yet present.

## Installer behavior

- Default install location: `%LOCALAPPDATA%\Rotaidem\Tune\`
- Creates Start Menu shortcut.
- Optional desktop icon.
- Optional task: if an MSFS 2024 Community folder is detected (Steam or Microsoft Store path), copies a small companion package into it.
- Does **not** modify official simulator installation files or overwrite aircraft packages.
- Uninstaller removes the application from `%LOCALAPPDATA%`.

## Community folder paths detected

- Steam: `%APPDATA%\Microsoft Flight Simulator 2024\Packages\Community`
- Microsoft Store: `%LOCALAPPDATA%\Packages\Microsoft.Limitless_8wekyb3d8bbwe\LocalCache\Packages\Community`

The optional Community package contains only documentation and a note that the actual audio application runs externally. It is not a loadable in-sim addon.
