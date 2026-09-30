# Kickball Scorekeeper

The ump's paper card, digital — score, outs, innings, count, lineups and player stats on a phone, tallied correctly. Kickball first (Liquid Breakfast Club, Tampa Bay Club Sport), but **a sport is a config**: cornhole ships as the second one, and the same engine is meant to cover any sport that needs a scorekeeper.

Canonical path: `~/Sites/studio/kickball`. Studio project — not deployed yet.

## Run it
Any static server from `~/Sites/studio` (the page uses the studio's `/assets/breadcrumb.*`):

```sh
cd ~/Sites/studio && python3 -m http.server 8765
# → http://127.0.0.1:8765/kickball/
```

On a phone on the same Wi-Fi, use your Mac's IP instead of 127.0.0.1. Everything is saved in that browser (`localStorage` key `kickball-v3`).

## Test it
```sh
node --test tests/engine.test.mjs
```

## Read in this order
1. `PROJECT_PLAN.md` — purpose, rules captured, what's next.
2. `HANDOFF.md` — naming contract: blocks, `data-action`s, data shapes, the sport config.
3. `CLAUDE.md` — working rulebook, code map, test recipes.
4. `DESIGN_ITERATIONS.md` — how we got here; `design-iterations/inspiration/` has the references.
5. `PITCH.md` — the angle for Tampa Bay Club Sport.

## Files
`index.html` · `kb.css` · `kb.js` · `data.js` (sport configs + seed team) · `tests/engine.test.mjs` · `manifest.webmanifest` · `service-worker.js` · `icons/` · `_headers` · `wrangler.jsonc`

## Status
- [x] Ump screen: score strip, inning, outs, count as dots, bases, line score, thumb pad, undo, in-place corrections
- [x] Sport as config (kickball, cornhole), score and stats derived from an event log
- [x] Captain: who's here → lineup (coed rules inline) → positions
- [x] Plays carry the kicker; box score per game; season stats across saved games
- [x] Teams & rosters
- [x] Rules from the Club Sport rules doc: no count, 55-min clock, 10-run cap = 4th out, playoff mercy tiers + overtime, shared slots, man-bunt out, courtesy runner (24 tests)
- [ ] Use it at a real game; courtesy-runner limits (first base only, rest of game)
- [ ] Game summary to share; export
- [x] Deployed to Cloudflare Pages (private pages.dev URL) — see DEPLOYMENT.md
- [ ] Sync / accounts
