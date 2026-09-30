# Kickball Scorekeeper — agent brief

Static HTML/CSS/JS, no build step, phone-first. Read `PROJECT_PLAN.md` for purpose, `HANDOFF.md` for the naming contract; this file is the working rulebook.

## Non-negotiables
- **The ump screen is the product.** Score, outs, inning, count must be readable at arm's length in sun; the pad stays under the thumb; nothing on that screen scrolls during play. Anything added there must earn its place.
- **A sport is data.** Rules, buttons, arithmetic, and record shape come from `KB_SPORTS` in `data.js`. If a change needs `if (sport === 'kickball')` in `kb.js`, it belongs in the config instead.
- **Everything is derived from the event log.** Never store a score, count, or stat; add an event and let `kbDerive()` compute. Undo = pop. Corrections are `set` events. New event kinds go in the derive `switch` and get a test.
- **Names are the contract.** Block classes, `data-action`s, `data-field`s, event kinds and the storage shape are listed in `HANDOFF.md`. Don't rename; add.
- **Every control does or shows something.** Unwired actions fall through to `kbToast('Coming soon')`. No `alert`/`confirm`/`prompt`.
- **Tokens only.** Colours, sizes and spacing come from the `--group_name` tokens at the top of `kb.css`.
- **Accessibility 100 (Lighthouse) and must stay there.** Contrast ≥ 4.5:1, targets ≥ 44px, `aria-pressed` / `aria-current` are real booleans, one global `:focus-visible` ring.
- Google Fonts only; icons inline SVG or text glyphs; no libraries.

## Map
- `index.html` — one file, one `<main class="view" data-view>` per screen: `home` `ump` `captain` `teams` `team` `stats`. Screens are rendered by `kb.js` into these hosts.
- `kb.js` — banner sections. **Spine:** delegated click/change/submit → `KB_ACTIONS[action](el, ev)`. **Nav:** `kbGo(view)` → `kbRender()` → `kbRender{Home,Ump,Captain,Teams,Team,Stats}`. **Game:** `kbNewGame`, `kbTap` (stamps the kicker), `kbRecord`, `kbUndo`, `kbFinish`, `kbNudge` (corrections), cornhole `kbBag`/`kbScoreRound`. **Derive:** `kbDerive` → `kbDeriveInnings` / `kbDeriveRounds`, `kbCheckEnd`. **Lineup:** `kbActiveLineup`, `kbCurrentKicker`, `kbNextKickers`, `kbBalancedLineup`, `kbLineupWarnings`, `kbDefenseWarnings`. **Season:** `kbSeasonStats`. **Teams:** `kbNewTeam`, `kbAddPlayer`, `kbSetGender`, `kbRemovePlayer`.
- `data.js` — `KB_SPORTS` (see `HANDOFF.md` → Sport config), `KB_SEED_TEAMS` (copied into storage on first run).
- `kb.css` — tokens, base, shared (`.key`, `.toast`, `.field`), then one banner per block in DOM order: home, ump (score-strip, fix-row, state, atbat, bases, linescore, pad, log, round), page, tabs/seg, roster, lineup, positions, teams.
- `tests/engine.test.mjs` — loads `data.js` + `kb.js` into a `vm` sandbox with a stub DOM and drives `kbDerive` with hand-built logs.

## Derived rules (what a backend must reproduce) — TBCS kickball, see PROJECT_PLAN.md for the quotes
- **Kicker** = active lineup slot `[pa % slots]`; a shared slot alternates by pass. Stamped on the event at record time, so lineup edits never rewrite history.
- **Reach n**: the kicker takes base n; runners move **only as far as the force** — a runner vacates a base exactly when the runner behind him needs it (`target = max(ownBase, behind + 1)`); a forced target ≥ 4 scores. A home run scores everyone. Everything past the force is a `runner` event from the **Runners row** (`what:'to'|'score'|'out'`, tagged `rbi:<kicker>` so runs on the play credit an RBI). A held runner is the default — no event, no movement.
- **Outs**: every non-reach pad button is an out (no count). `pa:false` actions (auto out) add an out but no plate appearance. `menOnly` actions are refused when a woman is up.
- **Clock**: game minute = `(event.t − clockStart) / 60000`; the first play auto-starts it. `official` at `officialAfter`. `lastInning` = the inning of the first event at/after `minutes`.
- **Run cap**: when it applies (minute < `capUntil`, or lead ≥ `lateLeadException`), reaching `runCap.runs` in a half ends the half; `countsAsOut` sets outs to the max first.
- **Half ends** at `outsPerHalf`, on the cap, or the End-half button; clears bases and runsThisHalf. In overtime each new half puts that side's last out on 2nd.
- **Game ends** (`kbCheckEnd` after a half, `kbCheckWalkoff` after any event): mercy tiers for the mode after full innings; time — the last inning completes, ties stand if `tiesAllowed[mode]`, else overtime if configured; home leads in the bottom of the last inning / OT → final.
- **Courtesy runner**: replaces the runner with that side's last out of the same gender (`lastOutBy`).
- **Cornhole**: per round, points = in×3 + on×1 per side; cancellation → only the leader scores the difference; `bust` optionally resets over `pointsToWin`; win at `pointsToWin` with `winBy`.
- **Warnings** (captain): `< minPlayers`; `< minWomen`; back-to-back men (wraps last → first; a shared all-men slot counts as one man); `> maxFielders`; `> maxMenOnField`; `> maxInfielders` among `infield[]`; fielders `< minPlayers`.

## Test recipes
- `node --test tests/engine.test.mjs` — must stay green; add a case for every new event kind or rule.
- `node --check kb.js data.js`.
- Serve from `studio/` (`python3 -m http.server 8765`) → `/kickball/`. Smoke: New game with LBC as home → Who's here → Lineup (make two men adjacent, see the row warning) → Positions → Play ball → End half → Single, Single, Home run (3–0, box score shows RBI 3) → 4 outs flips the half → Undo → Save & done → Teams → LBC → Stats.
- Lighthouse: `npx lighthouse "http://127.0.0.1:8765/kickball/" --form-factor=mobile --only-categories=accessibility --output=json --chrome-flags="--headless=new"` → 100.
- Studio index: `python3 generate-index.py` in `studio/` after changing the `studio:*` meta tags.
- Service worker: bump `CACHE_NAME` in `service-worker.js` whenever `kb.js`/`kb.css`/`data.js` change, or phones keep the old build.

## Good first tasks
1. "Add softball to `KB_SPORTS` (3 outs, extra innings on, no fouls-as-outs). No `kb.js` changes should be needed; add a derive test."
2. "Game summary view: final line score + both box scores + share via Web Share; reachable from Recent games."
3. "Split lineup slots: two players share one spot alternating — model it in `lineup[]` and `kbCurrentKicker`, with tests."
4. "Export a finished game as CSV/JSON from the stats screen."
