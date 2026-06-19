#!/usr/bin/env bash
# Restore production Square keys in .env.local (for debugging prod payment issues locally).
set -euo pipefail
cd "$(dirname "$0")/.."

VERCEL_TMP=".env.vercel.production.tmp"
vercel env pull "$VERCEL_TMP" --environment=production --yes >/dev/null
mv "$VERCEL_TMP" .env.local
echo "Wrote .env.local with production Square (real charges if you checkout locally)."
