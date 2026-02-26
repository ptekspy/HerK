#!/bin/sh
set -eu

if [ "${SKIP_DB_MIGRATIONS:-false}" != "true" ]; then
  echo "[api] Running Prisma migrations (deploy)..."
  cd /app
  pnpm --filter @herk/db-contract-guard prisma:migrate:deploy
fi

echo "[api] Starting API server..."
cd /app/apps/contract-guard/api
exec pnpm start:prod
