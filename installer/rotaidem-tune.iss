; Rotaidem Tune - Inno Setup Script
; Builds a Windows installer for the external companion application.
; 
; Build instructions (on a Windows machine with Inno Setup installed):
; 1. Package the Node.js app into a single .exe using pkg or electron-builder (see installer/BUILD.md).
; 2. Place the resulting RotaidemTune.exe in the same folder as this .iss file.
; 3. Compile this script with Inno Setup to produce RotaidemTune-Setup.exe.
;
; Installation locations:
; - Application: %LOCALAPPDATA%\Rotaidem\Tune\
; - Optional Community folder detection and companion package placement.
;
; Note: Per product rules, the installer does not modify official simulator files
; or overwrite aircraft packages. The optional Community placement only adds a
; small companion folder with documentation and a launcher shortcut.

#define MyAppName "Rotaidem Tune"
#define MyAppVersion "0.1.0-beta"
#define MyAppPublisher "Rotaidem Software Group"
#define MyAppURL "https://rotaidem.com"
#define MyAppExeName "RotaidemTune.exe"

[Setup]
AppId={{A1B2C3D4-E5F6-7890-ABCD-EF1234567890}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
DefaultDirName={localappdata}\Rotaidem\Tune
DefaultGroupName={#MyAppName}
OutputDir=output
OutputBaseFilename=RotaidemTune-Setup
Compression=lzma
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=lowest
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "community"; Description: "Also place a companion package in the MSFS 2024 Community folder (if detected)"; GroupDescription: "Optional:"; Flags: unchecked

[Files]
Source: "RotaidemTune.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "community-package\*"; DestDir: "{code:GetCommunityPath}\rotaidem-tune"; Flags: ignoreversion recursesubdirs createallsubdirs; Tasks: community; Check: CommunityDetected

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent

[Code]
function GetCommunityPath(Param: String): String;
var
  SteamPath, StorePath: String;
begin
  SteamPath := ExpandConstant('{userappdata}\Microsoft Flight Simulator 2024\Packages\Community');
  StorePath := ExpandConstant('{localappdata}\Packages\Microsoft.Limitless_8wekyb3d8bbwe\LocalCache\Packages\Community');
  if DirExists(SteamPath) then
    Result := SteamPath
  else if DirExists(StorePath) then
    Result := StorePath
  else
    Result := '';
end;

function CommunityDetected: Boolean;
begin
  Result := GetCommunityPath('') <> '';
end;
