# Deployment

Live on Cloudflare Pages, project **kickball**: https://kickball-1y4.pages.dev (stable). First deployed 2026-09-30.

## Deploy
```sh
./scripts/deploy.sh
```
Runs the tests, copies **only the app files** (`index.html kb.css kb.js data.js manifest.webmanifest service-worker.js _headers icons/`) to a temp folder and runs `wrangler pages deploy` on it. Docs, tests and `design-iterations/` never go public. Needs `CLOUDFLARE_API_TOKEN` in the environment (it is, on this Mac) or `npx wrangler login`.

Before deploying, **bump `CACHE_NAME` in `service-worker.js`** whenever `kb.js`, `kb.css` or `data.js` changed. The worker is network-first and `_headers` sets `Cache-Control: no-cache` on the app files, so phones with signal get the new build on the next open; the bump guarantees offline caches roll over too.

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
