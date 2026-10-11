# Build Rotaidem Tune (C# WPF)

This is a real Windows desktop application. Build it on a Windows machine with the .NET 8 SDK.

## Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0) (includes the Windows Desktop runtime)

## Build a single .exe

```powershell
cd src-csharp\RotaidemTune
dotnet publish -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true
```

The executable is created at:
```
bin\Release\net8.0-windows\win-x64\publish\RotaidemTune.exe
```

## Copy audio assets
After publishing, copy the WAV files next to the .exe:
```powershell
mkdir bin\Release\net8.0-windows\win-x64\publish\Assets
copy ..\..\..\assets\audio\airflow-wind.wav bin\Release\net8.0-windows\win-x64\publish\Assets\
copy ..\..\..\assets\audio\cabin-ambience.wav bin\Release\net8.0-windows\win-x64\publish\Assets\
```

Or place them in `src-csharp\RotaidemTune\Assets\` before building (the .csproj already copies them).

## Run
Double-click `RotaidemTune.exe`. A window opens. Click **Preview Airflow** to start simulated telemetry and hear the wind layer. Volume sliders control the mix in real time via NAudio.

## Community folder
Copy the `community\rotaidem-tune` folder into your MSFS 2024 Community directory if you want the marker package.
