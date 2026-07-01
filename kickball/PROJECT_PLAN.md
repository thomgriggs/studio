# Kickball Stat Tracker

Working product name: Kickball Stat Tracker
First team: Liquid Breakfast Club
League context: Tampa Bay Club Sport Sunday kickball, self-pitch, recreational coed.

## Product Thesis

Build a kickball-first scoring and stats app that starts as a team tracker, but is shaped so it can grow into a league scoring product for umps, captains, players, and admins.

The first version should answer one question well:

> What happened each week, and how did each player perform by the end of the season?

Longer term, the same event data should support official scorekeeping, standings, player leaderboards, lineup validation, fair playing time, and fast ump score entry.

## Primary Views

### Team Stat Tracker

Used by captains, coaches, or bench scorekeepers.

- Select a game
- Select attending players
- Build kicking lineup
- Support shared/split lineup slots
- Assign defensive positions
- Track bench players
- Enter live kick outcomes
- Track base reached, runs, RBIs, and outs
- Track defensive plays when practical
- Review game and season stats

### Ump / Scorekeeper

Used by an ump or official scorer.

- Current inning
- Current kicker
- Outs
- Bases
- Score
- Runs this inning
- Fast buttons for safe, out, run, advance, undo
- Rule warnings without slowing down the game

### Admin

Used by team captains or league admins.

- Create league, season, teams, games, and players
- Assign player gender designation for league rules
- Manage rosters
- Correct finalized scores
- Export data

### Public Stats

Used by players, teams, and league visitors.

- Player leaderboard
- Team stats
- Game summaries
- Position history
- Kicking outcomes
- Defensive plays

## Rules Captured So Far

- Minimum players to play: likely 7
- Defense max: 10 players
- Coed fielding balance: max 5 men on defense; more women than men is allowed
- Kicking lineup cannot have back-to-back men without risk of an enforceable automatic out
- Back-to-back women are allowed
- All present players may kick, even if not currently fielding
- Shared/split kicking lineup spots are used
- Players can join late or leave early
- Women may bunt
- Men may not bunt
- Team self-pitches
- Each kicker gets one kick
- A foul kick is an out
- Four outs per half inning
- Regular season games can end in ties
- Courtesy runners can be requested for injury
- Injury substitutions should be easy and safe
- Ump currently tracks score and outs on a card

## MVP Scope

The first working build should include:

- Seeded Liquid Breakfast Club roster
- Player gender designation
- Attendance selection
- Kicking lineup builder
- Lineup warnings for back-to-back men
- Defense board with positions and bench
- Fielding warnings for more than 10 defenders or more than 5 men
- Live scoring panel
- Current kicker
- Score, inning, outs, and bases
- Quick event buttons
- Manual stat correction
- Local season stats
- Browser local storage

## Data Model Draft

Core entities:

- League
- Season
- Team
- Player
- Game
- GameTeam
- LineupSlot
- PositionAssignment
- PlayEvent
- PlateAppearance
- DefensivePlay
- CourtesyRunner

Key design choice:

Liquid Breakfast Club should not be hardcoded as "the app." It should be seeded as the first team inside a structure that can support many teams, many seasons, and eventually official league scoring.

## Event Philosophy

Record what happened as events first, then compute stats from those events.

Quick live events:

- Safe at first
- Safe at second
- Safe at third
- Home run
- Out
- Foul out
- Run scored
- Advance runner
- Undo

Optional detail events:

- Kick direction
- Kick type
- Defensive player involved
- Catch, force, tag, assist
- Error/correction
- Courtesy runner
- Position switch
- Injury substitution

## Future Differentiator

Voice scoring could become a major feature:

- "Cristy single to left, Selene scores"
- "Sean foul out, two outs"
- "John catch in right center"
- "Move Thom to pitcher and Nick to bench"

The data model should allow voice commands to create the same events as button taps.

