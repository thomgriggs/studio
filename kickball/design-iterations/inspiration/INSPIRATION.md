# Kickball — inspiration

Gathered 2026-09-30. The question for every entry: **what does it do well for an ump holding a phone in one hand, in sunlight, trying to tally correctly?** Screenshots are in `screens/` (App Store / public pages, captured from the listing, not from inside the apps).

The purpose we're designing for, in Thom's words: *"I umped a game and the tiny card I had was small and very hard to read and pay attention to. If I had a phone marking the score, that can be data-tracked and uploaded to see your progress as a player."*

---

## 1. ClickBall — kickball referee app (iOS)
https://apps.apple.com/us/app/clickball/id881588958 · Free · 4.3★ (15) · last updated May 2021 · Dao of Development
Screens: `screens/clickball-appstore.jpg`

The closest thing that exists to what we want. Five huge round buttons — **OUT · STRIKE · FOUL · BALL · RUNNER SCORED** — with **UNDO / REDO** and **CLEAR COUNT** as smaller buttons. Score strip at the very top: away/home runs, inning, then strikes/fouls/balls/outs as dot rows. Configurable rules (strikes, fouls, balls, outs, innings, "count fouls as strikes", max runs per inning). Game clock with count-up/countdown. Left/right-hand mode. **High-contrast mode for sunny conditions.**

**Does well:** the whole tally lives under the thumb; nothing scrolls; the count is dots (glanceable, not numbers you have to read); rules are configurable per league; undo is one tap and visible.
**Avoid:** the green-grass photo background fights the buttons; 2021-stale; no player identity, so no stats come out of it; no lineup; no export.

## 2. Umpire Indicator Pro (iOS)
https://apps.apple.com/us/app/umpire-indicator-pro/id1222457137 · 3.5★ (2) · Dec 2024 · Drew Walker
Screens: `screens/umpire-indicator-pro-appstore.jpg`

A skeuomorphic clicker (the real plastic indicator drawn on screen) plus a **line-score grid** (innings 1–9, V/H, R) and **+1 Run (Visitor) / +1 Run (Home)** buttons. "Smart mode" auto-advances outs after 3 strikes and innings after 3 outs.

**Does well:** the line score by inning is exactly the paper card, made legible — that grid should exist in ours. Smart mode = "the app does the arithmetic so I don't."
**Avoid:** the drawn clicker wastes the screen; a reviewer says "the UI to read the score is difficult on any background."

## 3. iUmpire Elite (iOS)
https://apps.apple.com/us/app/iumpire-elite/id427428222 · Free · 3.6★ (16) · Mar 2023 · JJK Coding
Screens: `screens/iumpire-elite-appstore.jpg`

Clicker dials for balls/strikes/out/visitor/home/inning; tap to increment, **long-press to go back one**. Reviews: "got pulled from the stands to ump a game and didn't have anything with me" — the exact use case; complaints: can't edit runs/innings without starting a new game.

**Does well:** tap = +1, long-press = −1 is a good one-handed correction pattern. Zero setup: open, play ball.
**Avoid:** the no-edit problem — ours must let the ump fix a number in place.

## 4. Kickball Coach (iOS)
https://apps.apple.com/us/app/kickball-coach/id1032772501 · 3.8★ (5) · Oct 2022 · John Joseph Becker
Screens: `screens/kickball-coach-appstore.jpg`

The team side: team screen with player list and positions, player cards with **strength sliders (bunting, fielding, kicking, on-base, running)**, New Game with "who's played" checkmarks, and a **Game Play** screen with the score up top, an inning line, and a **field diagram with player names placed on positions**. Built-in rule sets for WAKA / Kickball365 / customizable; auto-creates coed lineups from skills.

**Does well:** the field diagram as the defense board (tap a spot, pick a player); "who's playing" as a checklist; rule sets as a first-class object.
**Avoid:** the dark card UI is dense; reviews say you can't remove a player mid-game or limit position rotation — our lineup edits must be easy during the game.

## 5. GameChanger (iOS/Android)
https://apps.apple.com/us/app/gamechanger/id1308415878 · Free · 4.9★ (904K) · GameChanger Media (Dick's)
Screens: `screens/gamechanger-appstore.jpg`

The reference for "score every play → 150+ stats." Scoring screen: score + period at top, a **play-by-play list** with result chips (+2 PT FG, Miss, REB, TO…), **Play by Play / Undo** at the bottom. Then per-player insight cards ("Reached 175 season points", "Led the team in…"). Lineups entered ahead of time populate scoring mode automatically.

**Does well:** events-first model (each tap is a record, stats are derived); undo always in the same spot; the player-insight card is what "see your progress as a player" should feel like; pre-entered lineups.
**Avoid:** it's a table-side scorekeeper app, not an ump app — too many taps per play for someone also officiating.

## 6. Sleeper (iOS/Android)
https://apps.apple.com/us/app/sleeper-fantasy-league/id987367543 · 4.7★ (292K) · Blitz Studios
Screens: `screens/sleeper-appstore.jpg`

Not scoring, but the best-designed mobile sports UI around: **player cards** (big number, name, team colours), **live game scores** feed with a head-to-head strip (14 – 14 with logos), and matchup screens.

**Does well:** the head-to-head score strip; player cards that make an individual feel like a pro; dark, high-contrast, phone-native.
**Avoid:** it's betting/fantasy-dense; take the card and strip patterns, not the density.

## 7. Tampa Bay Club Sport — what they run today
- Sport page: https://www.tampabayclubsport.com/sport/kickball
- Schedule (Tuesday Coed / Gadsden, Summer 2025): https://www.tampabayclubsport.com/league/88797/schedule — `screens/tbcs-schedule-tuesday-gadsden-2025.jpg`
- Standings (same league): https://www.tampabayclubsport.com/league/88797/standings — `screens/tbcs-standings-tuesday-gadsden-2025.jpg`
- Their app, **My Club Sport** (Mobile Leagues LLC — the League Lab company): https://apps.apple.com/us/app/id6752811314 — `screens/my-club-sport-appstore.jpg`

**Facts from their pages:** "Powered by League Lab." 7 regular-season games, all teams make playoffs, paid officials, self-pitch, coed 10v10 (5 men / 5 women), rosters up to 14. Schedule shows per game: teams, final score, field (North/South), time, and a "Game Recap" link; weather cancellations are tracked. **Standings columns: W · L · T · Win % · Runs Scored · Runs Allowed · Run Diff** — so the exact score, not just who won, decides seeding. The My Club Sport app does chat, reminders, RSVP, schedules, standings, "captain forfeits", "player of the game photos"; it has **no scorekeeping or official/ump score entry**.

**Does well:** standings already reward accurate scores; there's a per-game recap slot that a box score could fill; the app has RSVP (attendance) already.
**The gap:** the ump's card is still paper; scores get to League Lab by some manual path after the game; there are no player stats anywhere.

## Also found (not screenshotted)
- **Kickball Ref – PRO** (Android, 2016-era): balls/strikes/outs/innings/teams/scores, league setup with team shirt colours. https://kickball-ref-pro.soft112.com/
- **Head Ref Kickball** (Android, 2016): scores, stored teams and rule sets. https://m.apkpure.com/head-ref-kickball/air.HeadRef
- **Empire Umpire Pro** (web, Empire State Kickball): a league's own web ump tool — score + count with a "Record Hit" that clears the count. Proof that leagues build this themselves. http://www.empirestatekickball.com/empire-umpire-pro
- Generic scoreboard/tally apps (Skeep, Scoreboard: Score Keeper, Point Counter): two giant numbers, hold-to-ramp. Good for legibility, no structure.
- **iScore** — older, very detailed baseball scorekeeping; reference for the event model only.

---

## What this points to (for Thom to react to — not a design)
1. **The ump screen is ClickBall's layout with Umpire Indicator Pro's line score**: score strip + inning grid at the top, count as dots, four or five huge buttons under the thumb, undo where GameChanger puts it (always the same corner). High-contrast mode is a must, not a nicety.
2. **Corrections in place** (long-press −1 or tap the number to edit) — the #1 complaint across the clicker apps.
3. **Team mode borrows Kickball Coach**: who's-here checklist, field diagram for defense, rule set as a setting.
4. **Player progress borrows GameChanger's insight cards and Sleeper's player cards** — but that's a later screen.
5. **For the league**: the output of a game is a box score + line score that could fill League Lab's "Game Recap" slot and feed Runs Scored / Runs Allowed directly.
