#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/.."

# Copy assets required by Next.js standalone server
cp -r public .next/standalone/
mkdir -p .next/standalone/.next
cp -r .next/static .next/standalone/.next/

# Render injects PORT; bind to all interfaces
export HOSTNAME="${HOSTNAME:-0.0.0.0}"
export PORT="${PORT:-3000}"

exec node .next/standalone/server.js
