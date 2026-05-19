#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INSTALL=false
if [[ ${1:-} == "--install" || ${1:-} == "-i" ]]; then
  INSTALL=true
fi

VENV_DIR="$ROOT_DIR/server/.venv"
VENV_PYTHON="$VENV_DIR/bin/python"

ensure_venv() {
  if [[ -x "$VENV_PYTHON" ]]; then
    return
  fi

  echo "Creating Python virtual environment in .venv..."
  if command -v python3 >/dev/null 2>&1; then
    python3 -m venv "$VENV_DIR"
  elif command -v python >/dev/null 2>&1; then
    python -m venv "$VENV_DIR"
  else
    echo "Python 3 was not found. Install Python and try again."
    exit 1
  fi
}

if $INSTALL; then
  ensure_venv
  echo "Installing server Python dependencies..."
  "$VENV_PYTHON" -m pip install -r "$ROOT_DIR/server/requirements.txt"

  echo "Installing client dependencies..."
  if command -v pnpm >/dev/null 2>&1; then
    pnpm install --prefix "$ROOT_DIR/client"
  elif command -v npm >/dev/null 2>&1; then
    npm install --prefix "$ROOT_DIR/client"
  else
    echo "Warning: pnpm/npm not found. Please install client dependencies in client/."
  fi
fi

ensure_venv

echo "Starting backend in background..."
"$VENV_PYTHON" "$ROOT_DIR/server/app.py" &
SERVER_PID=$!

echo "Starting frontend (Vite)..."
cd "$ROOT_DIR/client"
if command -v pnpm >/dev/null 2>&1; then
  pnpm dev
elif command -v npm >/dev/null 2>&1; then
  npm run dev
else
  echo "pnpm/npm not found. Start the client manually: cd client && pnpm dev (or npm run dev)"
fi

echo "Waiting for backend (PID $SERVER_PID) to exit..."
wait $SERVER_PID
