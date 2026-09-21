#!/bin/bash
set -euo pipefail

if [[ -z "${NEON_DATABASE_URL:-${DATABASE_URL:-}}" ]]; then
  echo "DATABASE_URL veya NEON_DATABASE_URL env değişkeni gerekli." >&2
  exit 1
fi

export NEON_DATABASE_URL="${NEON_DATABASE_URL:-$DATABASE_URL}"
export BATCH_SIZE=15
export DELAY_MS=250
export CHUNK_OFFSET=0
export CHUNK_LIMIT=9999

cd /home/runner/workspace/artifacts/store
exec node scripts/apply-prices.mjs
