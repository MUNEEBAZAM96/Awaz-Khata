#!/bin/bash
set -e
pnpm install --frozen-lockfile
pnpm --filter db push
# Seed demo ledger data only when the ledger is missing/empty (data/ is gitignored,
# so the seeded file does not transfer through the merge itself).
node artifacts/api-server/scripts/seed.mjs --if-empty
