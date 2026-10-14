# Deployment

Live on Cloudflare Pages, project **kickball**: https://kickball-1y4.pages.dev (stable). First deployed 2026-09-30.

## Deploy
```sh
./scripts/deploy.sh
```
Runs the tests, copies **only the app files** (`index.html kb.css kb.js data.js manifest.webmanifest service-worker.js _headers icons/`) plus `functions/` (the `/api` cloud-backup function) into `dist/` (gitignored), applies any new D1 migration, and runs `wrangler pages deploy` on it. Docs, tests and `design-iterations/` never go public. Needs `CLOUDFLARE_API_TOKEN` in the environment (it is, on this Mac) or `npx wrangler login`.

Before deploying, **bump `CACHE_NAME` in `service-worker.js`** whenever `kb.js`, `kb.css` or `data.js` changed. The worker is network-first and `_headers` sets `Cache-Control: no-cache` on the app files, so phones with signal get the new build on the next open; the bump guarantees offline caches roll over too.

## Cloud backup (beta) — D1
The `/api` function needs a D1 database bound as `DB` (see `wrangler.jsonc`). One-time setup, done 2026-10-14:
```sh
npx wrangler d1 create kickball          # paste the database_id into wrangler.jsonc
npx wrangler d1 migrations apply kickball --remote
./scripts/sync-code.sh add "Thom's phone"   # prints an invite code — codes are never committed
```
Knobs, all without a deploy (`./scripts/sync-code.sh`): `list`, `off <code>` / `on <code>`, `kill` / `revive` (every device). Caps are rows in `flags`: `day_cap` 2000 snapshots a day across the beta, `device_cap` 400 per phone, `min_gap` 8 s between snapshots, `max_bytes` 1 MB. All well inside D1's free tier (100k writes/day, 5 GB); the Pages Free plan has no card attached, so the worst case under abuse is a paused afternoon, not a bill. When a cap trips the API answers 429 and the phone's footer reads "Cloud backup paused for today … still saved on this phone".

Local run: `npx wrangler d1 migrations apply kickball --local && npx wrangler pages dev dist --local --compatibility-date=2026-05-03` after building `dist/` (the deploy script does; or copy by hand), then `./scripts/sync-code.sh local add test`.

## Where the code lives
`~/Sites/studio/kickball` is a folder inside the `~/Sites/studio` git repository (the studio is one repo). It is **not** its own repo, and Pages is not connected to git — deploys are pushed from this machine with the script above. If it ever leaves the studio (see `~/Sites/PROJECT_RULES.md`), move it to `~/Sites/kickball`, `git init`, and connect the repo to the Pages project instead.

## Custom domain
`kickball.thomgriggs.com` is attached to the Pages project but DNS was never set. To finish: Cloudflare → Workers & Pages → kickball → Custom domains → it should offer to create the CNAME (`kickball` → `kickball-1y4.pages.dev`, proxied). Until then use the `pages.dev` URL.

## On a phone
1. Open https://kickball-1y4.pages.dev, Share → **Add to Home Screen** (it's a PWA: standalone, dark theme, offline after first load).
2. Start a game on cellular; refresh — the game is still there.
3. Airplane mode; reopen — the app still loads.
4. After a new deploy, pull-to-refresh once (or close and reopen) to pick up the build.

`_headers` keeps the site `noindex` — fine while it's a prototype.
