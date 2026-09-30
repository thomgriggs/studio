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
	document:{ addEventListener(){}, querySelector:stubEl, querySelectorAll:() => [], createElement:stubEl, body:{ dataset:{}, appendChild(){} } },
	localStorage:{ store:new Map(), getItem(k){ return this.store.get(k) ?? null; }, setItem(k, v){ this.store.set(k, String(v)); }, removeItem(k){ this.store.delete(k); } },
	window:{ scrollTo(){} }, location:{ search:'' }, setTimeout, clearTimeout, setInterval:() => 0, clearInterval(){}
});
ctx.window = ctx;
for (const f of ['data.js', 'kb.js']) vm.runInContext(fs.readFileSync(new URL(`../${f}`, import.meta.url), 'utf8'), ctx, { filename:f });
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
	assert.ok(w.some(x => /7 infielders/.test(x)));
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
