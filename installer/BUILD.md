# Building the Windows .exe and Installer

This environment cannot produce a native Windows .exe. Follow these steps on a Windows 11 machine.

## Option A: pkg (single .exe)

1. Install Node.js 18+ and npm.
2. In the project root:
   ```bash
   npm install
   npm install -g pkg
   pkg src/win-main.cjs --targets node18-win-x64 --output RotaidemTune.exe --public
   ```
3. Copy both the .exe and the assets folder next to it:
   ```bash
   copy RotaidemTune.exe installer\
   xcopy /E /I assets installer\assets
   ```
4. Install [Inno Setup](https://jrsoftware.org/isinfo.php).
5. Open `installer/rotaidem-tune.iss` and compile.
6. The output `RotaidemTune-Setup.exe` will be in `installer/output/`.

**Note:** Use `node18-win-x64` (pkg 5.8.1 does not support node20). The `--public` flag avoids bytecode warnings with CommonJS.

## Community Folder

The `community/rotaidem-tune/` folder can be copied directly into your MSFS 2024 Community folder as a marker package. The real application is the external .exe.
