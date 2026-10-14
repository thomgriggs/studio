/* ========================================================================== */
/* Engine tests — load data.js + kb.js into a sandbox with a stub DOM and     */
/* drive kbDerive() with hand-built event logs. Run: node --test tests/       */
/* Rules under test are Tampa Bay Club Sport coed self-pitch kickball; each   */
/* test names the rule it encodes.                                            */
/* ========================================================================== */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const stubEl = () => ({ dataset:{}, classList:{ toggle(){}, add(){}, remove(){} }, innerHTML:'', textContent:'', hidden:false, options:[], value:'', querySelector:stubEl, querySelectorAll:() => [], add(){}, addEventListener(){}, setAttribute(){}, closest:() => null });
const ctx = vm.createContext({
	console, structuredClone, Date, Option:function () {},
	document:{ addEventListener(){}, querySelector:stubEl, querySelectorAll:() => [], getElementById:() => null, createElement:stubEl, body:{ dataset:{}, appendChild(){} } },
	localStorage:{ store:new Map(), getItem(k){ return this.store.get(k) ?? null; }, setItem(k, v){ this.store.set(k, String(v)); }, removeItem(k){ this.store.delete(k); } },
	window:{ scrollTo(){} }, scrollTo(){}, location:{ search:'', protocol:'https:', href:'https://kickball.test/' }, URL, fetch:() => Promise.reject(new Error('no network in tests')), setTimeout, clearTimeout, setInterval:() => 0, clearInterval(){}
});
ctx.window = ctx;
for (const f of ['data.js', 'kb.js']) vm.runInContext(fs.readFileSync(new URL(`../app/${f}`, import.meta.url), 'utf8'), ctx, { filename:f });
/* JSON-roundtrip so objects made inside the sandbox compare with deepEqual out here */
const run = (code) => { const v = vm.runInContext(code, ctx); return v === undefined ? v : JSON.parse(JSON.stringify(v)); };

run(`
	const T0 = 1700000000000;
	function mkGame(sport, home = null, away = null, mode = 'season') {
		const cfg = KB_SPORTS[sport];
		const side = (teamId, name) => { const t = teamId ? kbTeam(teamId) : null; return { name:name || (t ? t.name : 'X'), teamId, attendance:t ? Object.fromEntries(t.roster.map(p => [p.id, true])) : {}, lineup:t ? kbBalancedLineup(t, t.roster.map(p => p.id)) : [], assignments:{} }; };
		kbState.teams = structuredClone(KB_SEED_TEAMS);
		kbState.game = { id:'t', sport, mode, status:'live', startedAt:new Date(T0).toISOString(), teams:{ away:side(away, 'Away'), home:side(home, 'Home') }, events:[] };
		return kbState.game;
	}
	/* push an event at game-minute m (clock started at T0) */
	function at(m, ev) { kbState.game.events.push({ t:T0 + m * 60000, by:'ump', ...ev }); }
	function clock() { at(0, { kind:'clock', what:'start' }); }
	/* a pad tap at minute m, stamping the current kicker like kbTap does */
	function tapAt(m, id) { const a = kbSport().actions.find(x => x.id === id); const side = kbBattingSide(); const k = kbCurrentKicker(side); const ev = { kind:a.kind, value:a.value || 0, actionId:id, side }; if (a.hit) ev.hit = true; if (a.pa === false) ev.pa = false; if (k && a.pa !== false) ev.player = k.id; at(m, ev); }
	function tap(id) { tapAt(1, id); }
	function halfEnd(m = 1) { at(m, { kind:'halfEnd', side:kbBattingSide() }); }
`);

test('single, single, home run = 3 runs; RBI to the kicker; runs to all three', () => {
	run(`mkGame('kickball', 'lbc'); clock(); halfEnd(); ['single','single','homer'].forEach(tap);`);
	const d = run('kbDerive()');
	assert.equal(d.score.home, 3);
	assert.equal(d.stats.home['cheryl-donish'].rbi, 3);
	assert.equal(d.stats.home['cristy-ceron'].r, 1);
	assert.deepEqual(d.bases, [null, null, null]);
});

/* ---- runners move only on the force; the rest is the ump's call ---------- */
test('runner on 3rd, kicker singles: the runner HOLDS (no force)', () => {
	run(`mkGame('kickball', 'lbc'); clock(); halfEnd(); tap('triple'); tap('single');`);
	const d = run('kbDerive()');
	assert.equal(d.score.home, 0);
	assert.equal(d.bases[2], 'cristy-ceron', 'still on 3rd');
	assert.equal(d.bases[0], 'thom-griggs', 'kicker on 1st');
});

test('runner on 1st, kicker singles: the runner is forced to 2nd only', () => {
	run(`mkGame('kickball', 'lbc'); clock(); halfEnd(); tap('single'); tap('single');`);
	const d = run('kbDerive()');
	assert.deepEqual(d.bases, ['thom-griggs', 'cristy-ceron', null]);
});

test('bases loaded, kicker singles: exactly one run is forced in', () => {
	run(`mkGame('kickball', 'lbc'); clock(); halfEnd(); tap('single'); tap('single'); tap('single'); tap('single');`);
	const d = run('kbDerive()');
	assert.equal(d.score.home, 1);
	assert.equal(d.stats.home['cristy-ceron'].r, 1, 'the runner from 3rd scored');
	assert.equal(d.stats.home['chris-bombicino'].rbi, 1, 'RBI to the kicker');
	assert.deepEqual(d.bases, ['chris-bombicino', 'cheryl-donish', 'thom-griggs']);
});

test('runners on 1st and 2nd, kicker doubles: 2nd is forced home, 1st to 3rd', () => {
	run(`mkGame('kickball', 'lbc'); clock(); halfEnd(); tap('single'); tap('single'); tap('double');`);
	const d = run('kbDerive()');
	assert.equal(d.score.home, 1);
	assert.deepEqual(d.bases, [null, 'cheryl-donish', 'thom-griggs']);
});

test('runner on 2nd only, kicker singles: the runner holds (not forced)', () => {
	run(`mkGame('kickball', 'lbc'); clock(); halfEnd(); tap('double'); tap('single');`);
	const d = run('kbDerive()');
	assert.deepEqual(d.bases, ['thom-griggs', 'cristy-ceron', null]);
});

test('the ump sends a held runner home from the Runners row: run + RBI to the kicker', () => {
	run(`mkGame('kickball', 'lbc'); clock(); halfEnd(); tap('triple'); tap('single'); at(2, { kind:'runner', base:3, what:'score', rbi:'thom-griggs', side:'home' });`);
	const d = run('kbDerive()');
	assert.equal(d.score.home, 1);
	assert.equal(d.stats.home['thom-griggs'].rbi, 1);
	assert.equal(d.stats.home['cristy-ceron'].r, 1);
});

test('the ump moves a runner two bases with a "to" event; a runner out at home adds an out and no run', () => {
	run(`mkGame('kickball', 'lbc'); clock(); halfEnd(); tap('single'); tap('single'); at(2, { kind:'runner', base:2, what:'to', to:3, side:'home' }); at(3, { kind:'runner', base:3, what:'out', side:'home' });`);
	const d = run('kbDerive()');
	assert.equal(d.score.home, 0); assert.equal(d.outs, 1);
	assert.deepEqual(d.bases, ['thom-griggs', null, null]);
});

test('home run scores everyone regardless of force', () => {
	run(`mkGame('kickball', 'lbc'); clock(); halfEnd(); tap('triple'); tap('homer');`);
	assert.equal(run('kbDerive().score.home'), 2);
});

test('"four outs per inning": the 4th out ends the half and clears the bases', () => {
	run(`mkGame('kickball', 'lbc'); clock(); halfEnd(); tap('single'); tap('out'); tap('caught'); tap('foul'); tap('missed');`);
	const d = run('kbDerive()');
	assert.equal(d.half, 'top'); assert.equal(d.inning, 2); assert.equal(d.outs, 0);
	assert.deepEqual(d.bases, [null, null, null]);
});

test('"one pitch per kicker": foul, missed kick and a catch are outs; there is no count', () => {
	run(`mkGame('kickball', 'lbc'); clock(); halfEnd(); tap('foul'); tap('missed'); tap('caught');`);
	const d = run('kbDerive()');
	assert.equal(d.outs, 3);
	assert.equal(d.count, undefined);
	assert.equal(run(`kbSport().actions.some(a => ['ball','strike'].includes(a.kind))`), false);
});

test('automatic out (two men kicked consecutively) is an out but not a plate appearance', () => {
	run(`mkGame('kickball', 'lbc'); clock(); halfEnd(); tap('autoout');`);
	const d = run('kbDerive()');
	assert.equal(d.outs, 1); assert.equal(d.pa.home, 0);
});

test('"10 runs in an inning in the first 45 minutes; the 10th run is the 4th out"', () => {
	run(`mkGame('kickball'); clock(); for (let i = 0; i < 10; i++) tapAt(10, 'homer');`);
	const d = run('kbDerive()');
	assert.equal(d.score.away, 10);
	assert.equal(d.half, 'bottom', 'the half ended on the 10th run');
	assert.equal(d.line.away[0], 10);
});

test('"no 10-run rule in the last 10 minutes unless the kicking team is up by 20 or more"', () => {
	run(`mkGame('kickball'); clock(); for (let i = 0; i < 12; i++) tapAt(50, 'homer');`);
	let d = run('kbDerive()');
	assert.equal(d.score.away, 12); assert.equal(d.half, 'top', 'no cap after minute 45');
	run(`mkGame('kickball'); clock(); at(1, { kind:'set', what:'score', side:'away', value:25 }); for (let i = 0; i < 10; i++) tapAt(50, 'homer');`);
	d = run('kbDerive()');
	assert.equal(d.half, 'bottom', 'cap applies late when up by 20+');
});

test('"the inning in progress at 55 minutes is the last and is completed"; regular-season ties stand', () => {
	run(`mkGame('kickball'); clock(); halfEnd(2); halfEnd(3); tapAt(56, 'single'); halfEnd(57);`);
	let d = run('kbDerive()');
	assert.equal(d.lastInning, 2);
	assert.equal(d.final, false, 'bottom of the last inning still to play');
	run(`halfEnd(60);`);
	d = run('kbDerive()');
	assert.equal(d.final, true); assert.match(d.finalReason, /tie/);
});

test('bottom of the last inning: home already leads → final without finishing', () => {
	run(`mkGame('kickball'); clock(); tapAt(56, 'out'); halfEnd(57); tapAt(58, 'homer');`);
	const d = run('kbDerive()');
	assert.equal(d.final, true); assert.match(d.finalReason, /home leads/);
});

test('"official after 30 minutes"', () => {
	run(`mkGame('kickball'); clock(); tapAt(29, 'out');`);
	assert.equal(run('kbDerive().official'), false);
	run(`tapAt(31, 'out');`);
	assert.equal(run('kbDerive().official'), true);
});

test('"no mercy rule in the regular season"', () => {
	run(`mkGame('kickball'); clock(); for (let i = 0; i < 4; i++) { for (let r = 0; r < 9; r++) tapAt(5, 'homer'); halfEnd(5); halfEnd(5); }`);
	const d = run('kbDerive()');
	assert.equal(d.score.away, 36); assert.equal(d.final, false);
});

test('playoffs: "20 runs after 3, 15 after 4, 10 after 5"', () => {
	run(`mkGame('kickball', null, null, 'playoffs'); clock(); for (let i = 0; i < 3; i++) { for (let r = 0; r < 7; r++) tapAt(5, 'homer'); halfEnd(5); halfEnd(5); }`);
	const d = run('kbDerive()');
	assert.equal(d.score.away, 21); assert.equal(d.final, true); assert.match(d.finalReason, /Mercy/);
});

test('championship: no mercy rule', () => {
	run(`mkGame('kickball', null, null, 'championship'); clock(); for (let i = 0; i < 3; i++) { for (let r = 0; r < 7; r++) tapAt(5, 'homer'); halfEnd(5); halfEnd(5); }`);
	assert.equal(run('kbDerive().final'), false);
});

test('playoffs: tie at time → overtime with the last out on second', () => {
	run(`mkGame('kickball', 'lbc', null, 'playoffs'); clock(); halfEnd(2); tapAt(3, 'out'); halfEnd(3); tapAt(56, 'out'); halfEnd(57); halfEnd(58);`);
	const d = run('kbDerive()');
	assert.equal(d.final, false); assert.equal(d.overtime, true);
	assert.equal(d.half, 'top'); assert.equal(d.inning, 3);
	assert.equal(d.bases[1], true, 'away (no roster) starts OT with an anonymous runner on 2nd');
	run(`halfEnd(59);`);
	const d2 = run('kbDerive()');
	assert.equal(d2.bases[1], 'cristy-ceron', 'LBC starts its OT half with its last out on 2nd');
});

test('undo pops the last event and restores state', () => {
	run(`mkGame('kickball'); clock(); tap('single'); tap('out'); kbUndo();`);
	const d = run('kbDerive()');
	assert.equal(d.outs, 0); assert.equal(d.bases[0], true);
});

test('corrections are events: set score shows in the log and undoes', () => {
	run(`mkGame('kickball'); at(1, { kind:'set', what:'score', side:'home', value:5 });`);
	assert.equal(run('kbDerive().score.home'), 5);
	assert.match(run('kbDerive().log.at(-1).label'), /Set score to 5/);
	run('kbUndo()');
	assert.equal(run('kbDerive().score.home'), 0);
});

test('"at least 6 players, minimum one female" warns; back-to-back men wraps last → first', () => {
	run(`(() => { mkGame('kickball', 'lbc'); const t = kbState.game.teams.home; t.lineup = ['thom-griggs','sean-fetter','chris-bombicino']; t.attendance = Object.fromEntries(t.lineup.map(id => [id, true])); })()`);
	const w = run(`kbLineupWarnings('home').map(w => w.text)`);
	assert.ok(w.some(x => /need 6/.test(x)));
	assert.ok(w.some(x => /1 woman/.test(x)));
	assert.ok(w.some(x => /Chris then Thom/.test(x)), 'wrap is checked');
});

test('"two men may share one kicking spot and alternate": shared slot alternates each pass', () => {
	run(`(() => { mkGame('kickball', 'lbc'); const t = kbState.game.teams.home; t.lineup = ['cristy-ceron', { share:['thom-griggs','sean-fetter'] }, 'cheryl-donish']; t.attendance = { 'cristy-ceron':true, 'thom-griggs':true, 'sean-fetter':true, 'cheryl-donish':true }; clock(); halfEnd(); })()`);
	const order = run(`(() => { const out = []; for (let i = 0; i < 6; i++) { out.push(kbCurrentKicker('home').id); tap('single'); } return out; })()`);
	assert.deepEqual(order, ['cristy-ceron', 'thom-griggs', 'cheryl-donish', 'cristy-ceron', 'sean-fetter', 'cheryl-donish']);
	assert.equal(run(`kbLineupWarnings('home').filter(w => /Back-to-back/.test(w.text)).length`), 0, 'a shared men slot between women is legal');
});

test('shared slot with one member absent behaves as a single', () => {
	run(`(() => { mkGame('kickball', 'lbc'); const t = kbState.game.teams.home; t.lineup = ['cristy-ceron', { share:['thom-griggs','sean-fetter'] }]; t.attendance = { 'cristy-ceron':true, 'thom-griggs':true, 'sean-fetter':false }; })()`);
	assert.deepEqual(run(`kbActiveLineup('home')`), ['cristy-ceron', 'thom-griggs']);
});

test('defense: "no more than 5 men" and "no more than 6 infielders including the catcher"', () => {
	run(`(() => { mkGame('kickball', 'lbc'); const t = kbState.game.teams.home; const men = kbTeam('lbc').roster.filter(p => p.gender === 'male').map(p => p.id); kbSport().team.positions.forEach((pos, i) => { t.assignments[pos] = men[i]; }); })()`);
	const w = run(`kbDefenseWarnings('home')`);
	assert.ok(w.some(x => /men on the field/.test(x)));
	assert.ok(!w.some(x => /infielders/.test(x)), "filling all ten spots is exactly six infielders — legal"); run(`kbState.game.teams.home.assignments["LF"] = kbState.game.teams.home.assignments["RF"]; kbState.game.teams.home.assignments["RF"] = null;`); /* still no 7th infield spot exists — the rule can only trip if the config names more than six */ assert.equal(run("kbSport().team.infield.length"), 6);
});

test('"men may not bunt": the man-bunt button is an out; a woman kicking is refused that button', () => {
	run(`mkGame('kickball', 'lbc'); clock(); halfEnd(); tap('out'); /* Cristy out → Thom up */ tap('bunt');`);
	const d = run('kbDerive()');
	assert.equal(d.outs, 2); assert.equal(d.stats.home['thom-griggs'].out, 1);
	assert.equal(run(`kbSport().actions.find(a => a.id === 'bunt').menOnly`), true);
});

test('courtesy runner: "the last out of that gender" replaces the runner', () => {
	run(`mkGame('kickball', 'lbc'); clock(); halfEnd(); tap('out'); /* Cristy (W) out */ tap('out'); /* Thom (M) out */ tap('single'); /* Cheryl on 1st */ at(2, { kind:'runner', base:1, what:'courtesy', side:'home' });`);
	const d = run('kbDerive()');
	assert.equal(d.bases[0], 'cristy-ceron');
});

test('kicker is derived from plate appearances and survives a lineup edit', () => {
	run(`mkGame('kickball', 'lbc'); clock(); halfEnd(); tap('out'); tap('out');`);
	assert.equal(run(`kbCurrentKicker('home').id`), 'cheryl-donish');
	run(`kbState.game.teams.home.lineup.reverse();`);
	assert.equal(run(`kbDerive().stats.home['cristy-ceron'].out`), 1, 'history keeps the original kicker');
});

test('cornhole: cancellation scoring per round, game ends at 21', () => {
	run(`mkGame('cornhole'); at(1, { kind:'round', away:{ in:2, on:1 }, home:{ in:1, on:3 } });`);
	assert.deepEqual(run('kbDerive().score'), { away:1, home:0 });
	run(`for (let i = 0; i < 7; i++) at(2, { kind:'round', away:{ in:1, on:0 }, home:{ in:0, on:0 } });`);
	const d = run('kbDerive()');
	assert.equal(d.score.away, 22); assert.equal(d.final, true);
});

test('season stats aggregate across saved games for a team', () => {
	run(`mkGame('kickball', 'lbc'); clock(); halfEnd(); tap('single'); kbState.game.status = 'final'; kbState.games = [kbState.game]; mkGame('kickball', 'lbc'); clock(); halfEnd(); tap('double'); kbState.game.status = 'final'; kbState.games.push(kbState.game);`);
	const s = run(`kbSeasonStats('lbc')`);
	assert.equal(s.games, 2);
	assert.equal(s.totals['cristy-ceron'].h, 2);
});

/* ---- fielder's choice: a forced runner is out, the kicker is safe --------- */
test("fielder's choice, bases loaded, runner out at home: no run, one out, everyone else moves up", () => {
	run(`mkGame('kickball', 'lbc'); clock(); halfEnd(); tap('single'); tap('single'); tap('single'); /* Cristy 3rd, Thom 2nd, Cheryl 1st; Chris up */
		const a = kbSport().actions.find(x => x.id === 'fc'); at(2, { kind:'reach', value:1, actionId:'fc', side:'home', player:kbCurrentKicker('home').id, outAt:{ runner:'cristy-ceron', base:4 } });`);
	const d = run('kbDerive()');
	assert.equal(d.score.home, 0);
	assert.equal(d.outs, 1);
	assert.deepEqual(d.bases, ['chris-bombicino', 'cheryl-donish', 'thom-griggs']);
	assert.equal(d.stats.home['chris-bombicino'].pa, 1, 'the kicker gets a plate appearance');
	assert.equal(d.stats.home['chris-bombicino'].h, 0, 'but not a hit');
	assert.equal(d.stats.home['cristy-ceron'].out, 0, 'a runner out on the bases is not a kicking out');
});

test("fielder's choice, runner on 1st out at 2nd: kicker on 1st, 2nd empty", () => {
	run(`mkGame('kickball', 'lbc'); clock(); halfEnd(); tap('single'); at(2, { kind:'reach', value:1, actionId:'fc', side:'home', player:kbCurrentKicker('home').id, outAt:{ runner:'cristy-ceron', base:2 } });`);
	const d = run('kbDerive()');
	assert.deepEqual(d.bases, ['thom-griggs', null, null]); assert.equal(d.outs, 1);
});

test("fielder's choice as the 4th out ends the half", () => {
	run(`mkGame('kickball', 'lbc'); clock(); halfEnd(); tap('out'); tap('out'); tap('out'); tap('single'); /* Chris on 1st, Erin up */ at(2, { kind:'reach', value:1, actionId:'fc', side:'home', player:kbCurrentKicker('home').id, outAt:{ runner:'chris-bombicino', base:2 } });`);
	const d = run('kbDerive()');
	assert.equal(d.half, 'top'); assert.equal(d.inning, 2);
});

test('kbForcedTargets: only the force chain moves', () => {
	assert.deepEqual(run(`kbForcedTargets([null, null, 'a'], 1)`), [{ runner:'a', from:3, target:3 }]);
	assert.deepEqual(run(`kbForcedTargets(['a', 'b', 'c'], 1)`), [{ runner:'a', from:1, target:2 }, { runner:'b', from:2, target:3 }, { runner:'c', from:3, target:4 }]);
	assert.deepEqual(run(`kbForcedTargets(['a', null, 'c'], 2)`), [{ runner:'a', from:1, target:3 }, { runner:'c', from:3, target:4 }]);
});

test('runners on 1st and 2nd, kicker doubles, the forced runner is out at home: no run, one out, kicker on 2nd, other runner on 3rd', () => {
	run(`mkGame('kickball', 'lbc'); clock(); halfEnd(); tap('single'); tap('single'); /* Cristy 2nd, Thom 1st; Cheryl up */ tap('double'); kbState.game.events.at(-1).outAt = { runner:'cristy-ceron', base:4 };`);
	const d = run('kbDerive()');
	assert.equal(d.score.home, 0);
	assert.equal(d.outs, 1);
	assert.deepEqual(d.bases, [null, 'cheryl-donish', 'thom-griggs']);
	assert.equal(d.stats.home['cheryl-donish'].rbi, 0);
	assert.equal(d.stats.home['cheryl-donish'].h, 1, 'still a double for the kicker');
	assert.equal(d.lastPlay.forced.length, 1, 'only Thom was forced (1st → 3rd); Cristy was out');
	assert.match(run('kbDerive().log.at(-1).label'), /Cheryl: Double — Cristy out at home/);
});

test('the Runners row knows who scored on the force so the ump can reverse it', () => {
	run(`mkGame('kickball', 'lbc'); clock(); halfEnd(); tap('single'); tap('single'); tap('double');`);
	const d = run('kbDerive()');
	assert.equal(d.score.home, 1);
	assert.deepEqual(d.lastPlay.forced.map(f => [f.runner, f.target]), [['thom-griggs', 3], ['cristy-ceron', 4]]);
});

/* ---------- roles: who may do what (the switcher stands in for sign-in) ----- */
test('roles: capabilities are scoped to the role, and team roles to their own team', () => {
	run(`kbState.leagues = structuredClone(KB_SEED_LEAGUES); kbState.leagueId = 'tbcs'; kbState.teams = structuredClone(KB_SEED_TEAMS); kbState.game = null; kbState.prepId = null;`);
	run(`kbState.me = { role:'ump', umpId:'ump-carl' }`);
	assert.equal(run('kbCan("score")'), true);
	assert.equal(run('kbCan("lineup")'), true, 'an ump fixes lineups during a game (injury, field agreement)');
	run(`kbState.prepId = 's1'; kbEnsurePrep(kbSched('s1'));`);
	assert.equal(run('kbCan("lineup")'), false, 'but not a captain’s pre-game prep');
	run(`kbState.prepId = null;`);
	assert.equal(run('kbCan("league")'), false);
	run(`kbState.me = { role:'league' }`);
	assert.equal(run('kbCan("league") && kbCan("score") && kbCan("roster", "lbc")'), true, 'league can do everything');
	run(`kbState.me = { role:'captain', teamId:'lbc', playerId:'jason-morton' }`);
	assert.equal(run('kbCan("roster", "lbc")'), true);
	assert.equal(run('kbCan("roster", "pitch-please")'), false, 'a captain only edits their own roster');
	assert.equal(run('kbCan("score")'), false, 'captains do not keep score');
	assert.equal(run('kbCan("lead", "lbc")'), true);
	run(`kbState.me = { role:'player', teamId:'lbc', playerId:'thom-griggs' }`);
	assert.equal(run('kbCan("availability")'), true);
	assert.equal(run('kbCan("lineup", "lbc")'), false, 'players read the lineup, they do not set it');
});

test('roles: a lead may only set the lineup for the game they lead', () => {
	run(`kbState.leagues = structuredClone(KB_SEED_LEAGUES); kbState.leagueId = 'tbcs'; kbState.teams = structuredClone(KB_SEED_TEAMS); kbState.game = null;
		kbState.me = { role:'lead', teamId:'lbc', playerId:'thom-griggs' }; kbState.prepId = 's1'; kbEnsurePrep(kbSched('s1')); kbState.side = 'home';`);
	assert.equal(run('kbCan("lineup", "lbc")'), false, 'Katie is the lead, not Thom');
	run(`kbSched('s1').lead = { lbc:'thom-griggs' }`);
	assert.equal(run('kbCan("lineup", "lbc")'), true);
	run(`kbState.prepId = 's2'; kbEnsurePrep(kbSched('s2'));`);
	assert.equal(run('kbCan("lineup", "lbc")'), false, 'a different game, not their lead');
});

test('schedule: availability shapes the prep, the ump starts from the prep, the result lands on the schedule', () => {
	run(`kbState.leagues = structuredClone(KB_SEED_LEAGUES); kbState.leagueId = 'tbcs'; kbState.teams = structuredClone(KB_SEED_TEAMS); kbState.game = null; kbState.games = []; kbState.prepId = null;
		kbState.me = { role:'player', teamId:'lbc', playerId:'thom-griggs' }; kbSetAvail('s1', 'thom-griggs', 'out');`);
	run(`kbState.me = { role:'captain', teamId:'lbc', playerId:'jason-morton' }; kbEnsurePrep(kbSched('s1'));`);
	const prep = run(`kbSched('s1').prep.teams.home`);
	assert.equal(prep.attendance['thom-griggs'], false, 'out = not here');
	assert.equal(prep.attendance['sean-fetter'], false, 'seeded as out');
	assert.equal(prep.attendance['selene-griggs'], true, 'In = here');
	assert.equal(prep.attendance['cristy-ceron'], false, 'no answer = not here until tapped in');
	assert.ok(!run(`kbActiveLineup('home', kbSched('s1').prep).flatMap(kbSlotIds)`).includes('thom-griggs'), 'not in the active lineup either');
	run(`kbState.me = { role:'ump', umpId:'ump-carl' }; kbStartScheduled('s1');`);
	assert.equal(run(`kbState.game.schedId`), 's1');
	assert.equal(run(`kbSched('s1').status`), 'live');
	assert.equal(run(`kbState.game.teams.home.attendance['thom-griggs']`), false, 'the ump got the captain’s prep');
	run(`clock(); halfEnd(); tap('homer'); kbState.game.status = 'final'; kbFinish();`);
	assert.deepEqual(run(`kbSched('s1').result`), { away:0, home:1 });
	assert.equal(run(`kbSched('s1').status`), 'final');
	assert.equal(run(`kbStandings().find(r => r.team.id === 'lbc').w`), 1);
});

test('recruit: a free agent joins as a guest for one game and leaves the roster when it is saved', () => {
	run(`kbState.leagues = structuredClone(KB_SEED_LEAGUES); kbState.leagueId = 'tbcs'; kbState.teams = structuredClone(KB_SEED_TEAMS); kbState.game = null; kbState.games = []; kbState.prepId = null;
		kbState.me = { role:'captain', teamId:'lbc', playerId:'jason-morton' };`);
	assert.deepEqual(run(`kbFreeAgents(kbSched('s1'), 'lbc').map(p => p.id)`), ['nina-patel', 'devin-hart'], 'Ball Busters is pending, so Jake is not offered');
	run(`kbRecruit('s1', 'lbc', 'devin-hart', 'pitch-please')`);
	assert.equal(run(`!!kbPlayer(kbTeam('lbc'), 'devin-hart')?.guest`), true);
	assert.equal(run(`kbSched('s1').availability['devin-hart']`), 'in');
	run(`kbState.me = { role:'ump', umpId:'ump-carl' }; kbStartScheduled('s1'); kbState.game.status = 'final'; kbFinish();`);
	assert.equal(run(`!!kbPlayer(kbTeam('lbc'), 'devin-hart')`), false, 'guest gone after the game');
});

test('league: a rule override changes the config every game uses; back to the rulebook value removes it', () => {
	run(`kbState.leagues = structuredClone(KB_SEED_LEAGUES); kbState.leagueId = 'tbcs'; kbState.teams = structuredClone(KB_SEED_TEAMS); kbState.me = { role:'league' };`);
	run(`kbSetRule('structure.outsPerHalf', '3', 'number')`);
	assert.equal(run(`kbSport({ sport:'kickball' }).structure.outsPerHalf`), 3);
	run(`mkGame('kickball', 'lbc'); clock(); halfEnd(); tap('out'); tap('out'); tap('out');`);
	assert.equal(run('kbDerive().half'), 'top', 'three outs flipped the half under the override');
	run(`kbSetRule('structure.outsPerHalf', '4', 'number')`);
	assert.deepEqual(run('kbState.league.overrides'), {});
	assert.equal(run(`kbSport({ sport:'kickball' }).structure.outsPerHalf`), 4);
});

test('man bunt with a woman up: warned, not refused — the ump’s call stands', () => {
	run(`mkGame('kickball', 'lbc'); clock(); halfEnd(); kbState.game.status = 'live';`);
	assert.equal(run(`kbCurrentKicker('home').gender`), 'female');
	run(`kbTap({ dataset:{ id:'bunt' } })`);
	assert.equal(run('kbDerive().outs'), 1);
	assert.equal(run('kbState.game.events.at(-1).actionId'), 'bunt');
});

test('people: a player on two rosters is one person; free-agent modes respect "nights I already play"', () => {
	run(`kbState.leagues = structuredClone(KB_SEED_LEAGUES); kbState.leagueId = 'tbcs'; kbState.teams = structuredClone(KB_SEED_TEAMS); kbState.profiles = {}; kbState.games = []; kbState.game = null;`);
	assert.deepEqual(run(`kbPersonTeams('thom-griggs').map(t => t.id)`), ['lbc', 'sliders']);
	assert.deepEqual(run(`kbPersonLeagues('thom-griggs').map(l => l.id)`), ['tbcs', 'tbcs-sun'], 'Tuesday and Sunday');
	run(`kbSetProfile('devin-hart', { freeAgent:'mine' })`);
	assert.equal(run(`kbPlaysOn('devin-hart', '2026-10-06')`), true, 'Pitch Please plays Tuesday Oct 6');
	run(`kbState.league.schedule.push({ id:'sx', date:'2026-11-01', time:'19:00', away:'ball-busters', home:'lbc', status:'scheduled', availability:{}, lead:{}, prep:null }); kbState.league.teams['ball-busters'] = 'approved';`);
	assert.equal(run(`kbPlaysOn('devin-hart', '2026-11-01')`), false);
	assert.ok(run(`kbFreeAgents(kbSched('s1'), 'lbc').map(p => p.id)`).includes('devin-hart'), 'offered on a night he plays');
	assert.ok(!run(`kbFreeAgents(kbSched('sx'), 'lbc').map(p => p.id)`).includes('devin-hart'), 'not offered on a night he does not');
	run(`kbSetProfile('devin-hart', { freeAgent:'all' })`);
	assert.ok(run(`kbFreeAgents(kbSched('sx'), 'lbc').map(p => p.id)`).includes('devin-hart'), '"any game" is offered everywhere');
	run(`kbSetProfile('devin-hart', { freeAgent:'off' })`);
	assert.ok(!run(`kbFreeAgents(kbSched('s1'), 'lbc').map(p => p.id)`).includes('devin-hart'));
});

test('demo games: seeded once, deterministic, finished, and they feed one person’s stats across both rosters', () => {
	run(`kbState.leagues = structuredClone(KB_SEED_LEAGUES); kbState.leagueId = 'tbcs'; kbState.teams = structuredClone(KB_SEED_TEAMS); kbState.games = []; kbState.game = null; kbSeedDemoGames();`);
	assert.equal(run('kbState.games.length'), 10, 'six Tuesday + four Sunday');
	assert.ok(run('kbState.games.every(g => g.status === "final" && g.demo && g.season)'));
	const first = run('kbDerive(kbState.games[0]).score');
	run('kbState.leagues.forEach(l => l.demoGames = 0); kbState.games = []; kbSeedDemoGames();');
	assert.deepEqual(run('kbDerive(kbState.games[0]).score'), first, 'same seed, same game');
	run('kbSeedDemoGames();'); assert.equal(run('kbState.games.length'), 10, 'seeded once');
	const st = run(`kbPlayerStats('thom-griggs')`);
	assert.ok(st.g >= 1, 'Thom is on LBC, so he shows up in the demo games: ' + st.g);
	const axes = run(`kbRadarAxes('thom-griggs')`);
	assert.equal(axes.length, 6);
	assert.ok(run('kbState.games.some(g => g.events.some(e => e.kind === "runner"))'), 'demo runners take extra bases'); assert.ok(axes.every(a => a.norm >= 0 && a.norm <= 1 && a.avgNorm >= 0 && a.avgNorm <= 1));
	assert.match(run(`kbRadarSVG(kbRadarAxes('thom-griggs'))`), /<svg class="radar"/);
});

test('stats: total bases, extra bases beyond the force, caught running, and outs by kind all come from the log', () => {
	run(`mkGame('kickball', 'lbc'); clock(); halfEnd();`);
	run(`tap('single'); tap('double');`);
	let d = run('kbDerive()');
	assert.equal(d.stats.home['thom-griggs'].tb, 2, 'a double is two total bases');
	assert.equal(d.stats.home['thom-griggs'].hr, 0);
	assert.equal(d.stats.home['cristy-ceron'].xb, 0, 'the force is not an extra base');
	run(`at(2, { kind:'runner', base:3, what:'score', rbi:'thom-griggs', side:'home' });`);
	d = run('kbDerive()');
	assert.equal(d.stats.home['cristy-ceron'].xb, 1, 'home from 3rd is one extra base');
	assert.equal(d.stats.home['thom-griggs'].rbi, 1);
	run(`tap('single');`);
	run(`at(3, { kind:'runner', base:2, what:'out', side:'home' });`); /* Thom was not forced by the single (1st was empty) — he is still on 2nd */
	d = run('kbDerive()');
	assert.equal(d.stats.home['thom-griggs'].xbo, 1, 'thrown out going home');
	run(`tap('foul'); tap('caught');`);
	d = run('kbDerive()');
	const all = Object.values(d.stats.home).reduce((o, s) => { for (const [k, n] of Object.entries(s.outsBy)) o[k] = (o[k] || 0) + n; return o; }, {});
	assert.deepEqual(all, { foul:1, caught:1 });
});

test('baseball names: AVG is H/AB, every PA is an AB (one pitch, no walks), HR counted', () => {
	run(`mkGame('kickball', 'lbc'); clock(); halfEnd(); tap('homer'); tap('out'); tap('single'); tap('foul');`);
	const d = run('kbDerive()');
	assert.equal(d.stats.home['cristy-ceron'].hr, 1);
	assert.equal(run(`kbAB(kbDerive().stats.home['cristy-ceron'])`), 1);
	assert.equal(run(`kbAvg({ h:1, pa:3 })`), '.333');
	assert.deepEqual(run(`kbRadarAxes('x').map(a => a.key)`), ['avg', 'hr', 'rbi', 'r', 'eb', 'obp']);
});

test('seasons: stats scope to a season or all; overlays scale against the primary scope; new games carry the current season', () => {
	run(`kbState.leagues = structuredClone(KB_SEED_LEAGUES); kbState.leagueId = 'tbcs'; kbState.teams = structuredClone(KB_SEED_TEAMS); kbState.profiles = structuredClone(KB_SEED_PROFILES); kbState.games = []; kbState.game = null; kbSeedDemoGames();`);
	assert.deepEqual(run(`KB_SPORTS.kickball.team.positions`), ['C/SS', '1B', '2B', '3B', 'SS', 'LF', 'CFL/SS', 'C', 'CFR', 'RF']);
	assert.equal(run(`KB_SPORTS.kickball.team.infield.length`), 6, 'six infield spots including the catcher');
	assert.equal(run(`kbGamesIn('spring-2026').length`), 3); assert.equal(run(`kbGamesIn('fall-2026').length`), 3); assert.equal(run(`kbGamesIn('all').length`), 6, 'the active (Tuesday) league');
	assert.equal(run(`kbGamesIn('all', 'all').length`), 10, 'every league'); assert.equal(run(`kbGamesIn('all', 'tbcs-sun').length`), 4);
	const all = run(`kbPlayerStats('cristy-ceron', 'all')`), fall = run(`kbPlayerStats('cristy-ceron', 'fall-2026')`), spring = run(`kbPlayerStats('cristy-ceron', 'spring-2026')`);
	assert.equal(all.pa, fall.pa + spring.pa);
	const ov = run(`kbRadarOverlay(kbRadarAxes('cristy-ceron', 'all'), 'cristy-ceron', 'spring-2026')`);
	assert.ok(ov && ov.norms.length === 6 && ov.norms.every(v => v >= 0 && v <= 1));
	assert.equal(run(`kbSeasonName('spring-2026')`), 'Spring 2026');
	run(`kbState.me = { role:'ump', umpId:'ump-carl' }; kbStartScheduled('s1');`);
	assert.equal(run('kbState.game.season'), 'fall-2026');
	assert.match(run(`kbPlayerCardHTML('devin-hart', { sched:'s1', team:'lbc', from:'pitch-please' })`), /OF[\s\S]*data-action="recruit"/);
});

test('free agency positions: a multi-pick of OF SS 1B 2B 3B C; an old single code migrates to its group', () => {
	run(`kbState.leagues = structuredClone(KB_SEED_LEAGUES); kbState.leagueId = 'tbcs'; kbState.teams = structuredClone(KB_SEED_TEAMS); kbState.profiles = { 'thom-griggs':{ position:'CFR' }, 'nina-patel':{ position:'C/SS' } }; kbState.games = []; kbSeedLeague();`);
	assert.deepEqual(run(`kbFaPositions()`), ['OF', 'SS', '1B', '2B', '3B', 'C']);
	assert.deepEqual(run(`kbMyPositions('thom-griggs')`), ['OF'], 'CFR is outfield');
	assert.deepEqual(run(`kbMyPositions('nina-patel')`), ['C'], 'C/SS counts as catcher');
	assert.equal(run(`kbProfile('thom-griggs').position`), undefined);
	assert.equal(run(`kbPositionsLabel('jake-fields')`), 'C · 1B');
	run(`kbSetProfile('jake-fields', { positions:kbFaPositions().slice() })`);
	assert.equal(run(`kbPositionsLabel('jake-fields')`), 'Anywhere', 'all six reads as Anywhere');
});

test('leagues: a person spans nights; stats scope by league or all; a Sunday team’s free agents come from Sunday; the ump acts in one league', () => {
	run(`kbState.leagues = structuredClone(KB_SEED_LEAGUES); kbState.leagueId = 'tbcs'; kbState.teams = structuredClone(KB_SEED_TEAMS); kbState.profiles = structuredClone(KB_SEED_PROFILES); kbState.games = []; kbState.game = null; kbSeedDemoGames();`);
	const tue = run(`kbPlayerStats('thom-griggs', 'all', 'tbcs')`), sun = run(`kbPlayerStats('thom-griggs', 'all', 'tbcs-sun')`), all = run(`kbPlayerStats('thom-griggs', 'all', 'all')`);
	assert.equal(all.pa, tue.pa + sun.pa, 'all kickball = Tuesday + Sunday');
	assert.ok(sun.g > 0, 'he played Sundays too');
	assert.equal(run(`kbLeagueOfSched(kbSched('s4')).id`), 'tbcs-sun');
	assert.ok(run(`kbFreeAgents(kbSched('s4'), 'sliders').every(p => kbLeagueOfTeam(p.from.id).id === 'tbcs-sun')`), 'Sunday recruits only from Sunday teams');
	assert.equal(run(`kbStandings(kbLeague('tbcs-sun')).length`), 2);
	run(`kbState.me = { role:'ump', umpId:'ump-bob' }; kbNormalizeMe({ umpId:'ump-bob' });`);
	assert.equal(run('kbState.leagueId'), 'tbcs', 'Bob umps both nights — stays where he is');
	run(`kbSetLeague('tbcs-sun');`);
	assert.equal(run('kbState.me.umpId'), 'ump-bob', 'switching nights keeps an ump who works both');
	run(`kbState.me = { role:'ump', umpId:'ump-carl' }; kbNormalizeMe();`);
	assert.equal(run('kbState.me.umpId'), 'ump-bob', 'Carl does not ump Sundays — falls back to a Sunday ump');
	run(`kbState.me = { role:'ump', umpId:'ump-bob' }; kbStartScheduled('s4');`);
	assert.equal(run('kbState.game.leagueId'), 'tbcs-sun');
	run(`kbState.me = { role:'captain', teamId:'lbc', playerId:'jason-morton' }; kbNormalizeMe();`);
	assert.equal(run('kbState.leagueId'), 'tbcs', 'captaining LBC puts you back on Tuesday');
});

test('rainout line: a Statusfy extension page parses to name, status, detail, level, updated, disabled; a game can be called off', () => {
	const html = `<html><head><title>Tuesday Kickball Northshore &bull; Statusfy</title></head><body>
		<div class="extension-detail status-bg-3"><h4 class="status-description">Canceled</h4></div>
		<span>Tuesday / Kickball / Northshore</span> <em>(Disabled)</em>
		<span class="updated-time" data-timestamp="1790695121000"></span>
		<h5>Status Detail</h5><p>NO GAMES</p><h6>Last Updated On</h6><p>Oct 1</p></body></html>`;
	const r = run(`kbParseStatusfy(${JSON.stringify(html)})`);
	assert.equal(r.name, 'Tuesday Kickball Northshore'); assert.equal(r.status, 'Canceled'); assert.equal(r.detail, 'NO GAMES'); assert.equal(r.level, 3); assert.equal(r.updated, 1790695121000); assert.equal(r.disabled, true);
	run(`kbState.leagues = structuredClone(KB_SEED_LEAGUES); kbState.leagueId = 'tbcs'; kbState.teams = structuredClone(KB_SEED_TEAMS); kbState.game = null;`);
	assert.equal(run(`kbRainoutLink(kbLeague('tbcs'))`), 'https://statusfy.com/8136020066/30');
	assert.equal(run(`kbRainoutLink(kbLeague('tbcs-sun'))`), 'https://rainoutline.com/search/dnis/8136020066', 'no extension → the line itself');
	run(`kbToggleRainout('s2')`); assert.equal(run(`kbSched('s2').status`), 'rainout');
	run(`kbState.me = { role:'ump', umpId:'ump-carl' }; kbStartScheduled('s2');`); assert.equal(run('kbState.game'), null, 'a rained-out game cannot be started');
	run(`kbToggleRainout('s2')`); assert.equal(run(`kbSched('s2').status`), 'scheduled');
});

test('free-agent availability: any-game = yes; nights-I-play = In on their own game that date → yes, Out → no, silent → maybe', () => {
	run(`kbState.leagues = structuredClone(KB_SEED_LEAGUES); kbState.leagueId = 'tbcs'; kbState.teams = structuredClone(KB_SEED_TEAMS); kbState.profiles = structuredClone(KB_SEED_PROFILES); kbState.game = null;`);
	assert.equal(run(`kbFaAvailability('devin-hart', kbSched('s2'))`), 'yes', 'Devin said any game');
	run(`kbSetProfile('devin-hart', { freeAgent:'mine' })`);
	assert.equal(run(`kbFaAvailability('devin-hart', kbSched('s2'))`), 'maybe', 'plays Tue (s2 is his own game, so no other game that night) → nothing to go on');
	/* Thom is a free agent for his nights; Sunday Oct 11 the Sliders play — if he says In there, a Sunday team short that day sees green */
	run(`kbState.league.schedule.push({ id:'sx', date:'2026-10-11', time:'18:00', away:'bay-bombers', home:'lbc', status:'scheduled', availability:{}, lead:{}, prep:null });`);
	assert.equal(run(`kbFaAvailability('thom-griggs', kbSched('sx'))`), 'maybe');
	run(`kbSetAvail('s4', 'thom-griggs', 'in')`); assert.equal(run(`kbFaAvailability('thom-griggs', kbSched('sx'))`), 'yes');
	run(`kbSetAvail('s4', 'thom-griggs', 'out')`); assert.equal(run(`kbFaAvailability('thom-griggs', kbSched('sx'))`), 'no');
});

test('lead: the question only comes up when the captain is out', () => {
	run(`kbState.leagues = structuredClone(KB_SEED_LEAGUES); kbState.leagueId = 'tbcs'; kbState.teams = structuredClone(KB_SEED_TEAMS); kbState.game = null; kbSched('s1').lead = {};`);
	run(`kbState.me = { role:'captain', teamId:'lbc', playerId:'jason-morton' }; kbSetAvail('s1', 'jason-morton', 'out');`);
	assert.equal(run(`kbSched('s1').availability['jason-morton']`), 'out');
	run(`kbSetLead('s1', 'lbc', 'katie-morton')`); assert.equal(run(`kbSched('s1').lead.lbc`), 'katie-morton');
	run(`kbSetLead('s1', 'lbc', '')`); assert.equal(run(`kbSched('s1').lead.lbc`), undefined, 'clearing removes the lead');
});

test('positions: a spot holds several people; a person holds one spot; infield counts every body', () => {
	run(`mkGame('kickball', 'lbc'); kbState.side = 'home'; kbState.prepId = null; kbState.me = { role:'captain', teamId:'lbc', playerId:'jason-morton' };`);
	run(`kbAssign('SS', 'thom-griggs'); kbAssign('SS', 'chris-bombicino');`);
	assert.deepEqual(run(`kbAt(kbState.game.teams.home.assignments, 'SS')`), ['thom-griggs', 'chris-bombicino'], 'two names share SS');
	run(`kbAssign('1B', 'thom-griggs');`);
	assert.deepEqual(run(`kbAt(kbState.game.teams.home.assignments, 'SS')`), ['chris-bombicino'], 'Thom moved to 1B');
	run(`kbAssign('1B', 'thom-griggs');`);
	assert.deepEqual(run(`kbAt(kbState.game.teams.home.assignments, '1B')`), [], 'tapping the name already there takes him off');
	run(`['C/SS','1B','2B','3B'].forEach((p, i) => kbAssign(p, kbTeam('lbc').roster[i].id)); kbAssign('SS', 'jason-morton'); kbAssign('CFL/SS', 'sean-fetter');`);
	assert.ok(run(`kbDefenseWarnings('home')`).some(x => /7 infielders/.test(x)), 'two on SS + five others = 7 infielders');
	assert.match(run(`kbFieldSVG(kbSport().team, kbState.game.teams.home.assignments, kbTeam('lbc'), 'SS')`), /class="field-spot is-on is-pick"/);
});

test('maybe: counts as its own bucket and is not here until they say In', () => {
	run(`kbState.leagues = structuredClone(KB_SEED_LEAGUES); kbState.leagueId = 'tbcs'; kbState.teams = structuredClone(KB_SEED_TEAMS); kbState.game = null; kbState.me = { role:'captain', teamId:'lbc', playerId:'jason-morton' };`);
	run(`kbSetAvail('s1', 'cheryl-donish', 'maybe')`);
	const c = run(`kbAvailCounts(kbSched('s1'), 'lbc')`); assert.equal(c.maybe, 1);
	run(`kbSched('s1').prep = null; kbEnsurePrep(kbSched('s1'));`);
	assert.equal(run(`kbSched('s1').prep.teams.home.attendance['cheryl-donish']`), false);
	assert.equal(run(`kbSched('s1').prep.teams.home.attendance['thom-griggs']`), true, 'In = here');
	assert.equal(run(`kbSched('s1').prep.teams.home.attendance['cristy-ceron']`), false, 'silence is not here either — the captain taps them in at the field');
	assert.match(run(`kbCaptainHomeHTML(kbTeam('lbc'), 'captain', kbState.me, kbState.league)`), /Who’s in[\s\S]*Free agents[\s\S]*Schedule[\s\S]*Roster[\s\S]*Team ·/);
	assert.ok(!/ROSTER ====/.test(run(`kbCaptainHomeHTML(kbTeam('lbc'), 'lead', { role:'lead', teamId:'lbc', playerId:'katie-morton' }, kbState.league)`)), 'a lead has no roster section');
	assert.equal(run(`kbTeamRecord('lbc')`), '0–0');
});

test('players table: scoped to the night, free-agent toggle, position chips, search, sort', () => {
	run(`kbState.leagues = structuredClone(KB_SEED_LEAGUES); kbState.leagueId = 'tbcs'; kbState.teams = structuredClone(KB_SEED_TEAMS); kbState.profiles = structuredClone(KB_SEED_PROFILES); kbState.games = []; kbState.game = null; kbSeedDemoGames(); kbState.me = { role:'captain', teamId:'lbc', playerId:'jason-morton' };`);
	const all = run(`kbPlayersRows({ pos:'all', q:'', fa:false, sort:'avg', dir:-1, sched:'s1', team:'lbc' })`);
	assert.ok(all.every(r => ['lbc', 'pitch-please', 'ball-busters'].includes(r.team.id)), 'Tuesday night only');
	assert.ok(all.length > 1 && all[0].avg >= all[1].avg, 'sorted by AVG desc');
	const fa = run(`kbPlayersRows({ pos:'all', q:'', fa:true, sort:'avg', dir:-1, sched:'s1', team:'lbc' })`);
	assert.ok(fa.length && fa.every(r => r.fa && r.team.id !== 'lbc'), 'free agents from other teams');
	assert.deepEqual(run(`kbPlayersRows({ pos:'OF', q:'', fa:true, sort:'avg', dir:-1, sched:'s1', team:'lbc' }).map(r => r.id)`), ['devin-hart']);
	assert.deepEqual(run(`kbPlayersRows({ pos:'all', q:'nina', fa:false, sort:'name', dir:1, sched:'s1', team:'lbc' }).map(r => r.id)`), ['nina-patel']);
	assert.match(run(`kbLastGameLine('cristy-ceron')`), /^[WLT] \d+–\d+ (vs|@) /);
});

/* ---- summary + export: read-only over the log ---------------------------- */
test('summary text: score line, line score, and a box-score row per kicker', () => {
	run(`mkGame('kickball', 'lbc'); clock(); halfEnd(); ['single','single','homer'].forEach(tap); kbState.game.status = 'final';`);
	const text = run('kbSummaryText(kbState.game)');
	assert.match(text, /^Away 0 – 3 Home\n/);
	assert.match(text, /\nFinal · /);
	assert.match(text, /Home: 3 - - - - - - \| 3/, 'home scored 3 in the 1st, the rest unplayed');
	assert.match(text, /Liquid Breakfast Club — PA H R RBI\n/);
	assert.match(text, /\nCheryl Donish: 1 1 1 3\n?/, 'the home-run kicker: 1 PA, 1 H, 1 R, 3 RBI');
});
test('summary screen picks a saved game by id or the live game', () => {
	run(`mkGame('kickball', 'lbc'); kbState.games = [{ ...kbState.game, id:'saved-1' }]; kbState.summaryId = 'saved-1';`);
	assert.equal(run('kbSummaryGame().id'), 'saved-1');
	run(`kbState.summaryId = 'live'`);
	assert.equal(run('kbSummaryGame().id'), 't');
	run(`kbState.summaryId = 'nope'`);
	assert.equal(run('kbSummaryGame()'), null);
});
test('game export carries the game, the rosters it names, and the league overrides', () => {
	run(`mkGame('kickball', 'lbc'); clock(); halfEnd(); tap('single'); kbState.game.leagueId = 'tbcs';`);
	const x = run('kbGameExport(kbState.game)');
	assert.equal(x.app, 'kickball-v3');
	assert.equal(x.game.events.length, 3);
	assert.deepEqual(x.teams.map(t => t.id), ['lbc']);
	assert.ok(x.league === null || typeof x.league.overrides === 'object');
	assert.equal(run("kbSlug('Liquid Breakfast Club')"), 'liquid-breakfast-club');
});

/* ---------- cloud backup (beta) ------------------------------------------ */
test('sync payload hashes data only — a screen change never costs a write', () => {
	const r = run(`
		mkGame('kickball', 'tigers', 'bulls'); clock(); tap('single');
		const pa = kbSyncPayload();
		kbState.view = 'teams'; kbState.tab = 'other';
		const pb = kbSyncPayload();
		tap('out');
		const pc = kbSyncPayload();
		({ same: pa.hash === pb.hash, changed: pb.hash !== pc.hash, note: pc.note, status: pc.status, gameId: pc.gameId, hasBody: typeof pc.body === "string" && pc.body.includes('"events"') });
	`);
	assert.equal(r.same, true); assert.equal(r.changed, true);
	assert.equal(r.status, 'live'); assert.equal(r.gameId, 't'); assert.equal(r.hasBody, true);
	assert.match(r.note, /^Away 0–0 Home · T1$/);
});
test('sync status: off without a code, paused with a cap notice, ok after a send', () => {
	const r = run(`
		kbSync.code = ''; kbSync.lastAt = 0; kbSync.pausedUntil = 0;
		const off = kbSyncStatus(), offOn = kbSyncOn();
		kbSync.code = 'abcd-1234';
		kbSync.pausedWhy = 'day'; kbSync.pausedUntil = Date.now() + 60000;
		const paused = kbSyncStatus();
		kbSync.pausedUntil = 0; kbSync.lastAt = Date.now();
		const ok = kbSyncStatus();
		({ off: off.state, offOn, paused: paused.state, pausedText: paused.text, ok: ok.state });
	`);
	assert.equal(r.off, 'off'); assert.equal(r.offOn, false);
	assert.equal(r.paused, 'paused'); assert.match(r.pausedText, /paused for today/); assert.match(r.pausedText, /still saved on this phone/);
	assert.equal(r.ok, 'ok');
});
test('kbSave never schedules an upload without a code', () => {
	const r = run(`kbSync.code = ''; kbSync.timer = null; kbSave(); kbSync.timer === null;`);
	assert.equal(r, true);
});
