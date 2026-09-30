# Kickball — design iterations

How the product got to its current shape. The root of this folder is always the current build; older directions are kept under `design-iterations/` as reference, never as live code.

## Purpose (Thom, 2026-09-30)
> I umped a game and the tiny card I had was small and very hard to read and pay attention to. If I had a phone marking the score, that can be data-tracked and uploaded to see your progress as a player.

Priority order: (1) replace the paper card — legible, tallied correctly, one-handed; (2) because it's digital, every tally is data → player progress; (3) any sport that needs a scorekeeper, via config. Kickball first, cornhole second.

## iteration-01-midgame-scoreboard (June 2026) — reference only
`design-iterations/iteration-01-midgame-scoreboard/`. The first prototype: five tabs (Score, Lineup, Defense, Stats, Setup), one 617-line `app.js`. Opened as if a game were in progress, with everyone "here" and a fake lineup; on a phone the result buttons sat ~900px below the fold; undo stored full JSON snapshots; no concept of a game record.

What it got right and what carried forward: the rules (4 outs, back-to-back men with wrap, >10 / >5 men on defense, balanced W/M lineup), the LBC roster, and the principle *each screen answers one question*.

## inspiration (2026-09-30)
`design-iterations/inspiration/` — screenshots and notes on ClickBall, Umpire Indicator Pro, iUmpire Elite, Kickball Coach, GameChanger, Sleeper, and what Tampa Bay Club Sport runs (League Lab, My Club Sport app, standings by run differential). Read `INSPIRATION.md`.

Direction chosen by Thom: **GameChanger's look** (professional, dark, high contrast) on **ClickBall's skeleton** (buttons under the thumb, count as dots), with Umpire Indicator Pro's line score.

## iteration-02-ump-first (2026-09-30) — promoted to root
Built as `design-iterations/iteration-02-ump-first/`, verified, then moved to the root the same day; the old root was deleted. Its folder no longer exists — the root *is* iteration 02.

What it established:
- Sport as config (`data.js`), engine replays an event log (`kbDerive`), undo pops, corrections are events.
- Ump screen: score strip (tap to fix), inning/outs/count dots, bases, line score, thumb pad.
- Captain: who's here → lineup (rules inline) → positions. Plays carry the kicker; box score + season stats derive from the same log.
- Cornhole as the proof that the abstraction holds.

## Design principle
Each screen answers one question. On the ump screen that question is *what just happened?* and the answer must be one tap, without scrolling, in sunlight.

## Next candidates
- Game summary / share screen.
- Player progress cards (GameChanger insight cards, Sleeper player cards).
- Softball / dodgeball configs for the Club Sport pitch.
