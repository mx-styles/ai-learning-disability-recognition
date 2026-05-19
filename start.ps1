Param(
    [switch]$InstallDependencies
)

# Support Unix-style `--install` and short `-i` when called from PowerShell.
# If the user passes `--install` or `-i` as an argument, set the InstallDependencies switch.
if ($args -contains '--install' -or $args -contains '-i') {
    $InstallDependencies = $true
}

$root = $PSScriptRoot
$venvDir = Join-Path $root "server\.venv"
$venvPython = Join-Path $venvDir "Scripts\python.exe"

function Ensure-Venv {
    if (Test-Path $venvPython) {
        return
    }

    Write-Host "Creating Python virtual environment in .venv..."
    if (Get-Command py -ErrorAction SilentlyContinue) {
        & py -3 -m venv $venvDir
    } elseif (Get-Command python -ErrorAction SilentlyContinue) {
        & python -m venv $venvDir
    } else {
        throw "Python was not found. Install Python 3 or the Python launcher and try again."
    }
}

function Install-Server {
    Write-Host "Installing server Python dependencies..."
    & $venvPython -m pip install -r (Join-Path $root "server\requirements.txt")
}

function Install-Client {
    Write-Host "Installing client dependencies..."
    if (Get-Command pnpm -ErrorAction SilentlyContinue) {
        pnpm install --prefix (Join-Path $root "client")
    } elseif (Get-Command npm -ErrorAction SilentlyContinue) {
        npm install --prefix (Join-Path $root "client")
    } else {
        Write-Warning "Neither pnpm nor npm found. Please install client dependencies manually in the client/ directory."
    }
}

if ($InstallDependencies) {
    Ensure-Venv
    Install-Server
    Install-Client
}

Ensure-Venv

Write-Host "Starting backend and frontend in new PowerShell windows..."

# Start the backend in a new PowerShell window
$serverCmd = "cd `"$root`"; `"$venvPython`" `"$root\server\app.py`""
Start-Process -FilePath pwsh -ArgumentList "-NoExit", "-Command", $serverCmd

# Start the client in a new PowerShell window (prefer pnpm, fallback to npm)
if (Get-Command pnpm -ErrorAction SilentlyContinue) {
    $clientCmd = "cd `"$root\client`"; pnpm dev"
} elseif (Get-Command npm -ErrorAction SilentlyContinue) {
    $clientCmd = "cd `"$root\client`"; npm run dev"
} else {
    $clientCmd = "cd `"$root\client`"; Write-Host 'Install pnpm or npm to start the client.'; Read-Host -Prompt 'Press Enter to close this window'"
}
Start-Process -FilePath pwsh -ArgumentList "-NoExit", "-Command", $clientCmd

Write-Host "Done. Backend should be on http://localhost:5000 and frontend on http://localhost:5173 (Vite default)."
