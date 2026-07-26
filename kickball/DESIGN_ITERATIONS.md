# Kickball Design Iterations

This folder tracks prototype directions so we can explore new designs without losing prior thinking.

## Current Canonical Project

Active working project:

```text
~/Sites/studio/kickball
```

## Iterations

### iteration-01-midgame-scoreboard

Path:

```text
~/Sites/studio/kickball/design-iterations/iteration-01-midgame-scoreboard
```

Status: cataloged, not the preferred direction.

What it proves:

- Core data requirements are being tracked.
- The app knows about roster, lineup, defense, scoring, and stats.
- Rule warnings exist for minimum players, back-to-back men, and defensive male limit.
- There is a runnable phone-sized scoring surface.

Why it is not good enough:

- It starts as if a game is already in progress.
- It overwhelms the user with too much operational information at once.
- It does not make setup feel safe or guided.
- It does not make player progress feel exciting.
- It feels risky to edit because actions appear too close to live game state.
- It is more useful for requirements inventory than product demonstration.

## Next Design Directions

Create separate iterations for distinct product bets:

1. **Setup-first captain flow**
   - Home screen, quick game, saved team, attendance, lineup, then scoring.

2. **Player progress / team excitement flow**
   - Starts with season progress, player cards, streaks, team story, and recent game recap.

3. **Ump scorekeeper flow**
   - Minimal live score, outs, inning, current kicker, bases, and final score.

4. **Sleeper-inspired roster flow**
   - Phone-first roster cards, availability, lineup confidence, quick adjustments, and live matchup feel.

## Design Principle

Each screen should answer one question:

```text
What is the most important thing this user needs to do right now?
```

Important information should be visible above the fold on a phone. Secondary details should be available but not visually competing with the primary action.
