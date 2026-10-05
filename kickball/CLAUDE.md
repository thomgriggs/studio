# Kickball Scorekeeper — agent brief

Static HTML/CSS/JS, no build step, phone-first. `index.html` at the root is the landing page (what this is + enter as a role); the app lives in `app/`. Read `PROJECT_PLAN.md` for purpose, `HANDOFF.md` for the naming contract; this file is the working rulebook.

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
- `app/index.html` — one file, a `.me-bar` header, then one `<main class="view" data-view>` per screen: `home` `ump` `captain` `teams` `team` `stats` `league` `player` (+ the `#switch` dialog). Screens are rendered by `kb.js` into these hosts.
- `app/kb.js` — banner sections. **Spine:** delegated click/change/submit → `kbDispatch` (role gate: `KB_ACTION_CAP[action]` → `kbCan(cap, scope)`) → `KB_ACTIONS[action](el, ev)`. **Roles:** `KB_ROLES`, `kbCan`, `kbApplyPerms` (disables what the role may not do after every render), `kbSetMe`/`kbNormalizeMe`, `kbMeLabel`. **Schedule:** `kbSched`, `kbUpcoming`, `kbNextSched`, `kbEnsurePrep` (a captain’s pre-game lineup lives on the schedule entry as a game-shaped `prep`), `kbCaptainGame` (live game or prep), `kbStartScheduled`, `kbSetAvail`, `kbSetLead`, `kbFreeAgents`/`kbRecruit`, league admin `kbSetTeamStatus`/`kbAssignUmp`/`kbAddSched`/`kbSetRule`, `kbStandings`. **Nav:** `kbGo(view)` → `kbRender()` → `kbRender{Home,Ump,Captain,Teams,Team,Stats}`. **Game:** `kbNewGame`, `kbTap` (stamps the kicker), `kbRecord`, `kbUndo`, `kbFinish`, `kbNudge` (corrections), cornhole `kbBag`/`kbScoreRound`. **Derive:** `kbDerive` → `kbDeriveInnings` / `kbDeriveRounds`, `kbCheckEnd`. **Lineup:** `kbActiveLineup`, `kbCurrentKicker`, `kbNextKickers`, `kbBalancedLineup`, `kbLineupWarnings`, `kbDefenseWarnings`. **Season:** `kbSeasonStats`. **Teams:** `kbNewTeam`, `kbAddPlayer`, `kbSetGender`, `kbRemovePlayer`.
- `app/data.js` — `KB_SPORTS` (see `HANDOFF.md` → Sport config), `KB_SEED_TEAMS`, `KB_SEED_LEAGUE` (copied into storage on first run; `kbSeedLeague` merges them into older devices).
- `app/kb.css` — tokens, base, shared (`.key`, `.toast`, `.field`), then one banner per block in DOM order: home, ump (score-strip, fix-row, state, atbat, bases, linescore, pad, log, round), page, tabs/seg, roster, lineup, positions, teams.
- `tests/engine.test.mjs` — loads `app/data.js` + `app/kb.js` into a `vm` sandbox with a stub DOM and drives `kbDerive` with hand-built logs.

## Identity: one person logs in
- A **person** is a roster id; the same id on two rosters is one person on two teams (`kbPersonTeams`, `kbPerson`). `kbState.me.playerId` is the person; `me.teamId` is only the captain/lead's working team. Profiles (icon, nickname, walk-up song, free-agent mode) are `kbState.profiles[personId]`, kept across rosters.
- The switcher is a `<dialog>` behind the me-bar pill — never inline on a role's home. The landing hands the app `?as=<role>&who=<id>`.
- **Player view** (`player`): head (avatar/nickname/teams/walk-up) → team filter (`kbState.pteam`) → Live or Next game card (In/Out, team status, my lineup spot) → schedule → free agent (`off`|`mine` = nights I already play|`all`) → stats (six-axis radar vs league average — On base · Power (TB/PA) · Clean (PAs that weren’t foul/missed/caught) · Runs/g · RBI/g · Baserunning (extra bases beyond the force ÷ times on base) — numbers, one-line insight, outs-by-kind strip, on-base leaderboard) → settings. Per-player stats carry `tb xb xbo outsBy`; all of it comes from events the ump already records (reach values, out kinds, Runners-row taps). No defensive stats: the ump never records the fielder, by design. No app furniture (new-game form, recent games) on a player's page.
- Demo games: `kbSeedDemoGames` builds three finished games through the real engine (seeded PRNG, `demo:true`) so stats and standings aren't empty; seeded once per league.

## Roles (the switcher stands in for sign-in — see PROJECT_PLAN.md)
- Five roles: **league** (rules, approvals, ump assignment, schedule) · **ump** (score for assigned games; may fix the live lineup — injuries, field agreements) · **captain** (roster, lineup, names a lead) · **lead** (lineup + recruiting for the one game they lead) · **player** (own availability, free-agent flag, read-only live view). `kbState.me = { role, teamId, playerId, umpId }`.
- **Warn, don’t prevent.** Lineup rules (back-to-back men, too few women, too many men on the field) are warnings on the row; the ump and captain can still do it. The only refusals are structural (a shared spot holds two) or role gates.
- **Gate once, in one place.** A control is gated by adding its action to `KB_ACTION_CAP`; `kbDispatch` refuses with a toast and `kbApplyPerms` disables it after render. Team roles are scoped to *their* team (`data-scope="<teamId>"` on a control when the team isn't implied by the screen). Never hide a control for a role — disable it, so every role sees the same screen.
- **The league's rule overrides** (`league.overrides`, dotted paths into the sport config) are applied by `kbSport()`; the engine never reads `KB_SPORTS` directly for a game.
- **Prep → game.** Availability (`sched.availability[playerId] = 'in'|'out'`) seeds the prep; the captain/lead edits the prep on the Captain screen; the ump's Start copies the prep into `game.teams` and links `game.schedId`; Save & done writes `sched.result` and drops one-game guests.

## Derived rules (what a backend must reproduce) — TBCS kickball, see PROJECT_PLAN.md for the quotes
- **Kicker** = active lineup slot `[pa % slots]`; a shared slot alternates by pass. Stamped on the event at record time, so lineup edits never rewrite history.
- **Reach n**: the kicker takes base n; runners move **only as far as the force** — a runner vacates a base exactly when the runner behind him needs it (`target = max(ownBase, behind + 1)`); a forced target ≥ 4 scores. A home run scores everyone. Everything past the force is a `runner` event from the **Runners row** (`what:'to'|'score'|'out'`, tagged `rbi:<kicker>` so runs on the play credit an RBI). A held runner is the default — no event, no movement.
- **Outs**: every non-reach pad button is an out (no count). `pa:false` actions (auto out) add an out but no plate appearance. `menOnly` actions warn when a woman is up but still record (the ump’s call).
- **Clock**: game minute = `(event.t − clockStart) / 60000`; the first play auto-starts it. `official` at `officialAfter`. `lastInning` = the inning of the first event at/after `minutes`.
- **Run cap**: when it applies (minute < `capUntil`, or lead ≥ `lateLeadException`), reaching `runCap.runs` in a half ends the half; `countsAsOut` sets outs to the max first.
- **Half ends** at `outsPerHalf`, on the cap, or the End-half button; clears bases and runsThisHalf. In overtime each new half puts that side's last out on 2nd.
- **Game ends** (`kbCheckEnd` after a half, `kbCheckWalkoff` after any event): mercy tiers for the mode after full innings; time — the last inning completes, ties stand if `tiesAllowed[mode]`, else overtime if configured; home leads in the bottom of the last inning / OT → final.
- **Courtesy runner**: replaces the runner with that side's last out of the same gender (`lastOutBy`).
- **Cornhole**: per round, points = in×3 + on×1 per side; cancellation → only the leader scores the difference; `bust` optionally resets over `pointsToWin`; win at `pointsToWin` with `winBy`.
- **Warnings** (captain): `< minPlayers`; `< minWomen`; back-to-back men (wraps last → first; a shared all-men slot counts as one man); `> maxFielders`; `> maxMenOnField`; `> maxInfielders` among `infield[]`; fielders `< minPlayers`.

## Test recipes
- `node --test tests/engine.test.mjs` — must stay green; add a case for every new event kind, rule, or capability.
- `node --check app/kb.js app/data.js`.
- Serve from `studio/` (`python3 -m http.server 8765`) → `/kickball/` (landing) → `/kickball/app/`. Smoke (roles): reset storage → Ump sees Oct 8 assigned → League: approve Ball Busters, assign an ump to Oct 15 → Captain LBC: mark two Out, name a lead, Set the lineup → Lead (that person): lineup is editable → Player: In/Out, free agent → Ump: Start Oct 8, score → Player: Watch (pad disabled) → Save & done → standings show 1–0. Smoke (game): New game with LBC as home → Who's here → Lineup (make two men adjacent, see the row warning) → Positions → Play ball → End half → Single, Single, Home run (3–0, box score shows RBI 3) → 4 outs flips the half → Undo → Save & done → Teams → LBC → Stats.
- Lighthouse: `npx lighthouse "http://127.0.0.1:8765/kickball/app/" --form-factor=mobile --only-categories=accessibility --output=json --chrome-flags="--headless=new"` → 100.
- Studio index: `python3 generate-index.py` in `studio/` after changing the `studio:*` meta tags.
- Service worker: bump `CACHE_NAME` in `app/service-worker.js` whenever `kb.js`/`kb.css`/`data.js` change, or phones keep the old build.

## Good first tasks
1. "Add softball to `KB_SPORTS` (3 outs, extra innings on, no fouls-as-outs). No `kb.js` changes should be needed; add a derive test."
2. "Game summary view: final line score + both box scores + share via Web Share; reachable from Recent games."
3. "Split lineup slots: two players share one spot alternating — model it in `lineup[]` and `kbCurrentKicker`, with tests."
4. "Export a finished game as CSV/JSON from the stats screen."
