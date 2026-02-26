#!/bin/sh
set -eu

if [ "${SKIP_DB_MIGRATIONS:-false}" != "true" ]; then
  echo "[api] Generating Prisma client..."
  cd /app
  pnpm --filter @herk/db-contract-guard prisma:generate

  echo "[api] Running Prisma migrations (deploy)..."
  pnpm --filter @herk/db-contract-guard prisma:migrate:deploy
fi

echo "[api] Starting API server..."
cd /app/apps/contract-guard/api
exec pnpm start:prod
