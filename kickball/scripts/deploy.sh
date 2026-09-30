#!/usr/bin/env sh
# Deploy ONLY the app files to the Cloudflare Pages project "kickball".
# Docs, tests and design-iterations stay out of the public build.
# Usage: ./scripts/deploy.sh    (needs CLOUDFLARE_API_TOKEN or `wrangler login`)
set -eu
cd "$(dirname "$0")/.."

node --check kb.js data.js service-worker.js
node --test tests/engine.test.mjs >/dev/null

DIST="$(mktemp -d)/kickball-dist"
mkdir -p "$DIST/icons"
cp index.html kb.css kb.js data.js manifest.webmanifest service-worker.js _headers "$DIST/"
cp icons/icon.svg "$DIST/icons/"

echo "Reminder: bump CACHE_NAME in service-worker.js if kb.js / kb.css / data.js changed."
npx --yes wrangler pages deploy "$DIST" --project-name=kickball --branch=main --commit-dirty=true
rm -rf "$DIST"
