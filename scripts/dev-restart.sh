#!/usr/bin/env bash
# Restart KnowledgeHub dev servers without Turbo (API + web only; lower thread use).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "Stopping existing dev processes..."
pkill -f "turbo dev" 2>/dev/null || true
pkill -f "nest start --watch" 2>/dev/null || true
pkill -f "next dev -p 3000" 2>/dev/null || true
pkill -f "next dev " 2>/dev/null || true
sleep 2

if command -v docker &>/dev/null; then
  if docker info &>/dev/null; then
    if ! docker compose -f docker/docker-compose.yml ps --status running 2>/dev/null | grep -q postgres; then
      echo "Starting PostgreSQL only (skipping Elasticsearch)..."
      docker compose -f docker/docker-compose.yml up -d postgres || echo "Warning: Docker compose failed; using existing DATABASE_URL."
    fi
  else
    echo "Warning: Docker daemon not running; ensure PostgreSQL matches apps/api/.env DATABASE_URL."
  fi
else
  echo "Note: docker not in PATH; ensure PostgreSQL is running for the API."
fi

echo "Starting API + web..."
if command -v pnpm &>/dev/null; then
  exec pnpm dev
fi
if [[ -x "$ROOT/node_modules/.bin/turbo" ]]; then
  echo "pnpm not found; starting API and web via npm run dev in each app..."
  cd "$ROOT/apps/api" && npm run dev &
  API_PID=$!
  cd "$ROOT/apps/web" && npm run dev:webpack &
  WEB_PID=$!
  trap 'kill $API_PID $WEB_PID 2>/dev/null' EXIT
  wait $API_PID $WEB_PID
  exit $?
fi
echo "Run: cd apps/api && npm run dev  (terminal 1)"
echo "     cd apps/web && npm run dev  (terminal 2)"
exit 1
