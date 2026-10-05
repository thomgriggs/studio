# Kickball Scorekeeper — naming contract

Nothing talks to a server. Every screen renders from storage; every number is derived from a game's event log. This file is what to wire to.

## Screens (`<main class="view" data-view>` in `app/index.html`, `body[data-view]`). The root `index.html` is the landing page; its role cards link to `app/?as=<role>`.
`home` · `ump` · `captain` · `teams` · `team` · `stats` · `league`. Navigate with `kbGo(view)`; UI state lives in `kbState` (`view side tab teamId prepId fix showLog pending`); `kbState.me` (who this phone is) persists in `ui.me`.

## Tokens (`kb.css` `:root`, `--group_name`)
`--color_bg|bg-raised|bg-sunken|line|line-strong|text|text-muted|text-dim|accent|accent-text|accent-soft|warn|danger|info` · `--dot_ball|strike|foul|out` · `--font_name-*` `--font_size-xs…xl|score` · `--space_xs…xl` `--gutter` · `--radius_sm|md|pill` · `--key_height` · `--motion_fast`.

## Blocks
```
shared   .key(.is-primary .is-commit .is-ghost .is-undo .is-fix)  .toast  .field  .field-pair  .eyebrow  .hint  .warn  .empty  .is-empty
me       .me-bar  .me-pill  .me-dot(.is-league .is-ump .is-captain .is-lead .is-player)  .me-league
home     .home  .brand  .whoami  .whoami-ctx  .seg.is-roles  .continue-card  .role-home  .role-card(.is-live)  .new-game  .home-links  .recent-panel  .recent
         .sched-list(.is-admin)  .sched-row(.is-live .is-final)  .sched-when  .sched-who  .avail-list  .avail-row  .lead-field  .recruit  .toggle-row  .switch(.is-on)  .watching
player   .player-head  .avatar-big  .player-id  .player-real  .team-chips  .chip-team(.is-captain)  .walkup  .tabs.is-filter  .pcard(.is-next .is-live)  .next-when  .next-who  .next-inout  .seg.is-inout  .status-line(.is-in .is-out .is-short)  .lineup-me  .live-score
         .tabs.is-fa  .stats-wrap  .radar  .radar-ring .radar-spoke .radar-league .radar-me .radar-dot .radar-label  .radar-key  .stat-grid  .stat-text  .axis-list  .outs-strip(.is-run)  .leaders(.is-me)  .leader-n  .leader-name  .settings  .profile-form  .icon-grid
switch   .switcher (dialog)  .switch-head
league   .league-card  .rules  .rule-row(.is-changed)  .approve-row(.is-approved .is-pending .is-declined)  .ump-list  .inline-form
ump      .ump  .score-strip  .side(.is-batting)  .side-name .side-score .side-tag
         .fix-row  .fix-label  .fix-value
         .state  .state-item  .state-label  .state-value  .dots(.is-ball .is-strike .is-foul .is-out)
         .atbat  .atbat-label .atbat-name .atbat-next .atbat-warn
         .bases  .base(.is-on .base-1|2|3)  .base-name  .base-actions
         .resolve  .resolve-head  .resolve-row  .resolve-who  .resolve-opts(.is-score .is-out)  .resolve-done
         .final-banner  .linescore(.box .is-open)  .pad(.pad-commit)  .pad-bar(.is-2)  .log  .log-after
         .round  .round-side  .round-name  .round-pts  .counter  .round-net
pages    .page  .page-head  .back  .tabs  .seg(.is-radio)
captain  .roster-list(.is-edit)  .chip(.is-on)  .chip-name  .chip-tag(.is-female .is-male)
         .lineup-list  .lineup-row(.is-warn .is-up)  .lineup-n  .lineup-name  .lineup-move
         .positions  .position-row
teams    .team-list  .team-card  .roster-row  .roster-name  .roster-remove
```
State is `.is-*`. Every block has a `/* ===== NAME ===== */` banner in `kb.css`; rendered HTML carries `<!-- ===== NAME : purpose ===== -->` comments.

## `data-action` (every control)
| Group | Actions |
|---|---|
| nav | `go`(+`data-to`) · `teams` · `team`(+`data-team`) · `stats`(+`data-team`) · `captain`(+`data-side`, `data-tab`) |
| game | `new-game` (submit) · `tap`(+`data-id` = action id) · `runner`(+`data-base`, `data-what`=advance\|to\|score\|out\|courtesy, `data-to`, `data-rbi`) · `resolve-done` · `fc-out`(+`data-runner`, `data-base`) · `fc-cancel` · `play-out`(+`data-runner`, `data-base`) · `undo` · `end-half` · `clock-start` · `end-game` · `finish` · `abandon` · `toggle-log` |
| fix | `fix-score`(+`data-side`) · `fix-outs` · `nudge`(+`data-what`, `data-side`, `data-delta`) · `fix-done` |
| cornhole | `bag`(+`data-side`, `data-what`=in\|on, `data-delta`) · `score-round` |
| captain | `captain-tab`(+`data-tab`=here\|lineup\|positions) · `captain-side` · `here`(+`data-player`) · `move`(+`data-index`, `data-delta`) · `balance` · `assign` (select, +`data-position`) |
| teams | `new-team` (submit) · `add-player` (submit) · `gender`(+`data-player`, `data-gender`) · `remove-player` |
| roles | `role`(+`data-role`) · `me-team` · `me-player` · `me-ump` (selects) |
| schedule | `start-sched`(+`data-sched`) · `prep`(+`data-sched`, `data-team`) · `avail`(+`data-sched`, `data-player`, `data-value`=in\|out) · `free-agent`(+`data-player`, `data-team`) · `set-lead` (select, +`data-sched`, `data-team`) · `recruit`(+`data-sched`, `data-team`, `data-player`, `data-from`) |
| player | `player` · `pteam`(+`data-team`=all\|teamId) · `fa-mode`(+`data-mode`=off\|mine\|all) · `pick-icon`(+`data-icon`) · `save-profile` (submit) · `switch` · `switch-close` |
| league | `league` · `team-status`(+`data-team`, `data-status`) · `assign-ump` (select, +`data-sched`) · `add-ump` (submit) · `add-sched` (submit) · `remove-sched`(+`data-sched`) · `rule` (input/select, +`data-path`, `data-type`) |
| fallback | `coming-soon` |

Gated actions are listed in `KB_ACTION_CAP` (kb.js). A control may carry `data-scope="<teamId>"` to say which team it is about.

`data-field`: `teams` `status` (continue card). Everything else is rendered whole by `kbRender*`.

## Storage (`localStorage` `kickball-v3`)
```
{ teams:[Team], games:[Game]  /* finished, newest first */, game:Game|null /* in progress or final-not-saved */, league:League, ui:{ …, me } }
League { id, name, sport, season, seedVersion, umpires:[{ id, name }], teams:{ [teamId]:'approved'|'pending'|'declined' }, overrides:{ 'dotted.path':value },
         schedule:[{ id, date:'YYYY-MM-DD', time:'HH:MM', field, away:teamId, home:teamId, ump:umpId|null, mode, status:'scheduled'|'live'|'final',
                     availability:{ [playerId]:'in'|'out' }, lead:{ [teamId]:playerId }, prep:Game|null, gameId?, result?:{ away, home } }] }
Me     { role:'league'|'ump'|'captain'|'lead'|'player', teamId, playerId, umpId }
Profile (profiles[personId]) { icon, nickname, walkup:{ title, artist, url }, freeAgent:'off'|'mine'|'all' }
Team  { id, name, short, sport, captain?:playerId, roster:[{ id, name, gender:'female'|'male', freeAgent?:true, guest?:true, guestFrom?:teamId, guestFor?:schedId }] }
Game  { id, sport, mode, status:'live'|'final', startedAt, schedId?,
        teams:{ away:Side, home:Side }, events:[Event] }
Side  { name, teamId|null, attendance:{ [playerId]:bool }, lineup:[playerId], assignments:{ [position]:playerId } }
Event { t, by:'ump', kind, side?, actionId?, player?, value?, hit?, pa?:false,
        /* runner */ base, what   /* set */ what:'score'|'outs', value   /* round */ away:{in,on}, home:{in,on} }
kinds: reach out ball strike foul runner halfEnd set round
```

## Derived (`kbDerive(game)`)
innings → `{ score, inning, half, outs, count, bases[3] (playerId|true|null), runsThisHalf, line:{away[],home[]}, pa:{away,home}, stats:{ side:{ playerId:{ pa,h,r,rbi,out,reached,tb,xb,xbo,outsBy:{ [actionId]:n } } } }, final, finalReason, log[] }`
rounds → `{ score, round, rounds[{ n, away, home, net, after }], final, finalReason, log[] }`
Season: `kbSeasonStats(teamId)` → `{ games, totals:{ playerId:{ g,pa,h,r,rbi,out,reached } } }`. OBP = reached / pa.

## Sport config (`data.js` → `KB_SPORTS[id]`)
```
{ id, name, sides:{ away, home },
  modes:     { season:'Regular season', playoffs:'…', championship:'…' },   /* game.mode picks rules below */
  structure: { kind:'innings', outsPerHalf, innings:null|n, tiesAllowed:{ [mode]:bool } | bool }
           | { kind:'rounds', pointsToWin, winBy, bagsPerSide },
  clock?:    { minutes, officialAfter, capUntil },                           /* real time; a 'clock' event starts it */
  actions:   [{ id, label, kind:'reach'|'out'|…, value?, size?:'primary'|'commit', hit?:true, pa?:false, menOnly?:true, note? }],
  scoring:   { mode:'additive'|'cancellation' },
  rules:     { runCap?:{ runs, countsAsOut, lateLeadException },
               mercy?:{ [mode]: null | [{ after, diff }] },
               overtime?:{ [mode]: false | { runnerOnSecond } },
               courtesyRunner?:{ … }, bust?:{ enabled, resetTo } },
  team?:     { minPlayers, minWomen?, positions[], infield?[], maxFielders, maxMenOnField?, maxInfielders?,
               coed?:{ noBackToBackMen, autoOutBetween, splitSlots }, bunting?:{ women, men } },
  record:    'linescore'|'rounds' }
```
Adding a sport = adding an entry. Adding a *kind* of action = a case in the derive switch + a test.

### Lineup slots
`Side.lineup` is an array of **slots**: a `playerId`, or `{ share:[idA, idB] }` for two players alternating one spot. Who's up = `slot[pa % slots]`, and a shared slot sends `share[floor(pa / slots) % 2]`. `kbActiveLineup` drops absent members (a shared slot with one present member acts as a single).

### Events added for the rules
`clock` `{ what:'start', auto? }` · `runner` `{ base, what:'advance'|'to'|'score'|'out'|'courtesy', to?, rbi? }` — `to` moves a runner to a specific base (4 = scores); `rbi` names the kicker whose play it was so the run credits an RBI; `courtesy` swaps in the last out of the same gender. Every event's `t` is what the clock reads — game minute = `(t − clockStart) / 60000`.

### Fielder's choice (`.resolve.is-fc`)
The `fc` action (`fc:true`) with runners on doesn't record immediately: `kbState.fc = { ev, forced }` renders "who was out?" from `kbForcedTargets(bases, 1)`. `fc-out` records ONE `reach` event with `outAt:{ runner, base }` — the kicker is safe at first, that runner is out at the base he was forced to (no run), the others move on the force. `fc-cancel` / "Nobody — all safe" work as expected. Undo reverses the whole play.

### Runners row (`.resolve`)
Rendered by `kbResolveHTML` right after a hit that leaves more than the kicker on base or forced a runner home (`kbState.resolve = { kicker }`, UI-only). One row per runner: next bases · Scored · Out. Default is held. Runners who **scored on the force** (`d.lastPlay.forced` with `target 4`) get an **Out at home** row → `play-out` rewrites the last reach event with `outAt:{ runner, base }` (same shape fielder's choice uses), so the play stays one event and undo removes all of it. Cleared by Done, the next pad tap, or undo.
