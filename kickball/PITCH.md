# Pitch angle — Tampa Bay Club Sport

Draft, 2026-09-30. One page. Everything about TBCS here comes from their public site and App Store listing (links in `design-iterations/inspiration/INSPIRATION.md`); the rest is Thom's experience umping a Club Sport kickball game.

## The problem, in one sentence
Your officials keep score on a small paper card that's hard to read on the field, and that card is the only source of truth for a standings table that ranks teams on **Runs Scored, Runs Allowed and Run Differential** — so a misread digit changes playoff seeding.

## What we'd build
A phone screen that replaces the card:
- **Score, inning, outs, count — big enough to read at arm's length in sun.** Four or five buttons under the thumb. Undo. Fix a number in place.
- **It does the arithmetic.** Four outs flips the half; runs add themselves to the inning line; the final is never re-added by hand.
- **Every tap is a record.** The game ends with a line score and box score, not a photo of a card.
- Optional, captain-side: who's here, kicking order, positions — with the coed rules (5/5, no back-to-back men) checked automatically. Then per-player stats fall out for free.

## Why a league wants it
1. **Fewer disputes.** The score is visible to both captains on the ump's phone at any moment, and the play log settles "that was the third out."
2. **Standings that are right the night of the game.** Final scores (and runs scored/allowed) are entered once, by the official, at the field — not re-keyed later.
3. **Players come back for their numbers.** Today My Club Sport has "player of the game photos"; a season stat line and a personal-progress card is the thing people screenshot and share. Retention is the business case.
4. **It generalizes.** Kickball first (Thom umps it), but the pattern — count, outs, innings/periods, score, log — covers softball, flag football, volleyball, dodgeball with rule sets swapped in. One scorekeeper for all their games.

## What's already true on their side
- Powered by **League Lab**; the **My Club Sport** app (Mobile Leagues LLC) already does schedules, standings, RSVP, chat, captain forfeits. It has **no score entry for officials**. So this is the missing piece, not a replacement.
- The schedule already has a per-game **"Game Recap"** slot — a box score fits there.
- Paid officials, 7-game seasons, all teams make playoffs: a small number of umps to train, and the playoff stakes make accuracy matter.

## What we'd need from them
- How a score gets from the ump's card into League Lab today (who, when, what form).
- The rule sets per sport (outs, innings, counts, coed rules, mercy/run caps, time limits).
- Whether Mobile Leagues / League Lab has an API or import for scores — or whether "the ump texts the final" is the integration for a pilot.
- One league, one season, a few umps willing to try it.

## Proposed pilot
One kickball night (e.g. Tuesday Coed / Gadsden). Umps score on the phone; the paper card runs in parallel for the first two weeks. We compare, then drop the card. Success = zero score corrections after the fact and umps preferring it.

## Open questions
- Is the ump's phone acceptable on the field, or does it need to be a league-issued device?
- Sun legibility and battery over a 3-game night.
- Data ownership: the league's data, our app — needs a simple agreement.
- Is this a product to sell them, or a tool we give them to get the data? Decide before the meeting.
