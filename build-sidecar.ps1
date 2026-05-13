# Build the Python sidecar and place it in src-tauri/binaries/
# Run this before `cargo tauri dev` or `cargo tauri build`

Set-Location $PSScriptRoot

$SidecarDir = "src-tauri\sidecar"
$BinariesDir = "src-tauri\binaries"

# Detect target triple
$triple = (rustc -vV | Select-String "host:").ToString().Split(":")[1].Trim()
Write-Host "Target triple: $triple"

# Create venv and install Python deps
Write-Host "Installing Python dependencies..."
uv venv --quiet
uv pip install -r "$SidecarDir\requirements.txt"
if ($LASTEXITCODE -ne 0) { Write-Error "uv pip install failed"; exit 1 }

# Generate icons if missing
if (-not (Test-Path "src-tauri\icons\icon.ico")) {
    Write-Host "Generating icons..."
    uv run python generate-icons.py
    if ($LASTEXITCODE -ne 0) { Write-Error "Icon generation failed"; exit 1 }
}

# Build with PyInstaller
Write-Host "Building merger sidecar with PyInstaller..."
uv run pyinstaller `
    --onefile `
    --name merger `
    --distpath "$BinariesDir\_tmp" `
    --workpath "$BinariesDir\_build" `
    --specpath "$BinariesDir\_spec" `
    --noconfirm `
    "$SidecarDir\merger.py"

if ($LASTEXITCODE -ne 0) { Write-Error "PyInstaller build failed"; exit 1 }

# Rename to Tauri sidecar convention: merger-<triple>.exe
$src = "$BinariesDir\_tmp\merger.exe"
$dst = "$BinariesDir\merger-$triple.exe"
New-Item -ItemType Directory -Force -Path $BinariesDir | Out-Null
Copy-Item -Force $src $dst

# Clean up PyInstaller artifacts
Remove-Item -Recurse -Force "$BinariesDir\_tmp", "$BinariesDir\_build", "$BinariesDir\_spec" -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Sidecar built: $dst"
Write-Host "Now run: npm run tauri dev"
