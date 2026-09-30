# Kickball Scorekeeper — project plan

Working name: Kickball Scorekeeper. First team: Liquid Breakfast Club. League: Tampa Bay Club Sport Sunday coed kickball (self-pitch, recreational, paid officials, League Lab). Updated 2026-09-30.

## Purpose
Replace the ump's tiny paper card with a phone that tallies score, outs, inning and count legibly and correctly — one-handed, in sun. Because every tally is a recorded event, games become data: box scores, season stats, player progress, and (the pitch) league standings that are right the night of the game. See `PITCH.md`.

Kickball first. **A sport is a config** so the same app covers cornhole (shipped as the proof) and, later, softball, flag football, dodgeball — any Club Sport game with a scorekeeper.

## Users (roles on a game, not accounts — device-local for now)
- **Ump** — owns the score. Home → New game → the card. Taps results; fixes numbers in place; undo.
- **Captain** — owns their side: who's here, kicking order, positions, with the coed rules checked. Can be the same phone as the ump or a different one (no sync yet).
- **Player** — sees their line in the box score and the season table.
- **League admin** (later) — sports, rule sets, seasons, exports, standings.

## What's built (root of this folder)
- Ump screen for innings sports and for rounds sports, rendered from `KB_SPORTS`.
- Event log → derived score, count, bases, line score, per-player stats; undo; `set` corrections.
- Captain flow: who's here → lineup → positions, warnings inline.
- Teams & rosters (LBC seeded), game history, season stats per team.
- 13 engine tests (`tests/engine.test.mjs`). Lighthouse a11y 100.

## Rules (kickball) — from the Tampa Bay Club Sport rules doc, read 2026-09-30
Source: the "Monday Coed Kickball League Rules" Google Doc linked from tampabayclubsport.com/sport/kickball. Every row is encoded in `data.js` and covered by a test in `tests/engine.test.mjs`.

| Rule (quoted) | In the app |
|---|---|
| "Each team gets four (4) outs per inning" | `structure.outsPerHalf: 4` |
| "One pitch per kicker. A missed kick, foul ball, or a catch on the fly is an out" | no count; pad has Out · Caught · Foul · Missed |
| "Games are 55 minutes… the inning in progress at 55 is the last inning and completed" | `clock.minutes: 55`; clock starts on the first play; **last inning** marked from the first play after 55:00 |
| "official after 30 minutes of play" | `clock.officialAfter: 30` — the clock label flips to *Official* |
| "Only 10 runs can be scored in an inning in the first 45 minutes. The 10th run is also the 4th out" | `rules.runCap` — the *Cap* chip shows runs/10; the 10th run ends the half |
| "No 10-run rule in the last 10 minutes unless the kicking team is up by 20 or more" | `clock.capUntil: 45`, `runCap.lateLeadException: 20` |
| "Regular season games may end in a tie" · "no mercy rule" | `tiesAllowed.season`, `mercy.season: null` |
| Playoffs: "20 runs after 3, 15 after 4, 10 after 5 (not the championship)" | `mercy.playoffs` tiers; `mercy.championship: null` |
| "Overtime during playoffs with a runner on second (the one who made the last out)" | `overtime.playoffs.runnerOnSecond` — each OT half starts with that side's last out on 2nd |
| "At least 6 players (minimum one female) to start" | `team.minPlayers: 6`, `team.minWomen: 1` |
| "Maximum of 10 fielders with no more than 5 men" · "No more than 6 infielders, including the catcher" | `team.maxFielders`, `maxMenOnField`, `maxInfielders` + `infield[]` |
| "Line-ups alternate… no two men can kick consecutively. If two men kick consecutively, an automatic out is recorded between them" | lineup warning on the rows; **Auto out** button (an out, no PA) |
| "Two men may share one kicking spot and alternate kicks" | **shared slots** — ½ button on a lineup row pairs it with another; the pair alternates each pass |
| "Bunting is allowed for women only… a male bunt is a dead ball out" | **Man bunt** button (out); refused when a woman is up |
| Courtesy runner: request before the kick; not past first; "the last out of that gender"; for the rest of the game | **CR** on a base chip swaps in that side's last out of the same gender. *Not enforced yet:* the first-base limit and "rest of the game" |
| Base running (standard): a runner advances only when forced; otherwise he holds; the ump rules anything beyond | Kicks move runners **only on the force**. After a hit with runners on, the **Runners row** offers each runner: next base · Scored · Out (default held; runs credit the kicker an RBI). **Fielder's choice** = kicker safe at first, "who was out?" lists the forced runners at the base they were forced to — one event for the whole play |

Not modeled: time between games, forfeits, the tournament (KickFall) rule set, and who reports the score to League Lab (the doc doesn't say).

## Open questions
1. The exact Club Sport kickball rules (outs, count, fouls, mercy, time limit) — get the rules doc.
2. Is the ump's own phone acceptable on the field?
3. How does a final score get to League Lab today (who enters it, when)? Is there an API/import?
4. Split lineup slots — how common, worth modeling?
5. Where should "Them" runs come from when the other team has no roster on this phone — the ump sheet only (current), or a lightweight "other side" tally?

## Next
1. Use it at a real game; fix what hurts.
2. Game summary / share screen (final, line score, both box scores).
3. Player progress cards; season leaderboard.
4. Softball + dodgeball configs to demo "any sport" for the pitch.
5. Deploy (Cloudflare Pages, `kickball.thomgriggs.com`) once the rules are confirmed. See `DEPLOYMENT.md`.
6. Sync / accounts — only once two phones need to see one game.
