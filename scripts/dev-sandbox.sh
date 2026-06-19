#!/usr/bin/env bash
# Build .env.local for free Square sandbox checkout (no real charges).
set -euo pipefail
cd "$(dirname "$0")/.."

SQUARE_FILE=".env.square.sandbox"
NEON_PROJECT_ID="${NEON_PROJECT_ID:-still-frost-52001088}"
NEON_CREDS="${HOME}/.config/neonctl/credentials.json"

if [[ ! -f "$SQUARE_FILE" ]]; then
  echo "Missing $SQUARE_FILE"
  echo ""
  echo "1. cp .env.square.sandbox.example .env.square.sandbox"
  echo "2. Open https://developer.squareup.com/apps → your app → Sandbox"
  echo "3. Paste Application ID, Location ID, and Sandbox access token"
  echo "4. Run: npm run dev:sandbox"
  echo ""
  echo "Test card: 4111 1111 1111 1111 (any future expiry / CVV / ZIP)"
  exit 1
fi

if [[ ! -f "$NEON_CREDS" ]]; then
  echo "Missing Neon credentials at $NEON_CREDS"
  echo "Run: neonctl auth"
  exit 1
fi

echo "Fetching DATABASE_URL from Neon (neon-champagne-forest)…"
DATABASE_URL="$(python3 <<PY
import json, urllib.request, os, sys
creds = json.load(open(os.path.expanduser("$NEON_CREDS")))
token = creds.get("access_token")
if not token:
    sys.exit("No Neon access token — run: neonctl auth")
req = urllib.request.Request(
    f"https://console.neon.tech/api/v2/projects/$NEON_PROJECT_ID/connection_uri"
    "?database_name=neondb&role_name=neondb_owner&pooled=true",
    headers={"Authorization": f"Bearer {token}"},
)
data = json.load(urllib.request.urlopen(req))
uri = data.get("uri", "")
if not uri:
    sys.exit(f"Neon API error: {data}")
print(uri)
PY
)"

{
  echo "DATABASE_URL=$DATABASE_URL"
  echo "SITE_DATA_SOURCE=database"
  echo ""
  echo "# Local dev"
  echo "NEXT_PUBLIC_SITE_URL=http://localhost:3000"
  echo ""
  cat "$SQUARE_FILE"
} > .env.local

echo "Wrote .env.local (sandbox Square + Neon database)"
echo "Starting dev server at http://localhost:3000 …"
echo "Test card: 4111 1111 1111 1111"
exec npm run dev
