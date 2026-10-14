#!/usr/bin/env sh
# Deploy ONLY the app (app/ + _headers) to the Cloudflare Pages project "kickball".
# The app is served at the site root; the studio landing page, docs, tests and
# design-iterations stay out of the public build.
# Usage: ./scripts/deploy.sh    (needs CLOUDFLARE_API_TOKEN or `wrangler login`)
set -eu
cd "$(dirname "$0")/.."

node --check app/kb.js app/data.js app/service-worker.js
node --test tests/engine.test.mjs >/dev/null

DIST="dist"
rm -rf "$DIST"; mkdir -p "$DIST/icons"
cp app/index.html app/kb.css app/kb.js app/data.js app/manifest.webmanifest app/service-worker.js _headers "$DIST/"
cp app/icons/icon.svg "$DIST/icons/"
cp -R functions "$DIST/functions"   # /api — cloud backup (beta); D1 binding comes from wrangler.jsonc

if grep -q REPLACE_AFTER_D1_CREATE wrangler.jsonc; then
  echo "wrangler.jsonc still has the placeholder database_id — run: npx wrangler d1 create kickball, paste the id, then npx wrangler d1 migrations apply kickball --remote" >&2
  exit 1
fi
npx --yes wrangler d1 migrations apply kickball --remote

echo "Reminder: bump CACHE_NAME in app/service-worker.js if kb.js / kb.css / data.js changed."
npx --yes wrangler pages deploy "$DIST" --project-name=kickball --branch=main --commit-dirty=true
