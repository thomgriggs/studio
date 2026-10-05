/* ========================================================================== */
/* KICKBALL — ump + captain behavior                                          */
/* All helpers are `kb*`. No server. State = teams + games with EVENT LOGS;    */
/* the scoreboard and every stat are derived by replaying a log through the    */
/* sport's rules. Undo pops the last event. Corrections are events ('set').    */
/* Spine: delegated [data-action] click → KB_ACTIONS[action](el, ev).          */
/* ========================================================================== */

const KB_KEY = 'kickball-v3';
const kbState = {
	teams:[], games:[], game:null, league:null, profiles:{}, /* persisted */
	me:{ role:'ump', teamId:null, playerId:null, umpId:null }, /* who this phone is acting as (persisted in ui) — stands in for sign-in */
	view:'home', showLog:false, fix:null, side:'home', tab:'here', teamId:null, share:null, prepId:null, pteam:'all', /* ui */
	pending:{ away:{ in:0, on:0 }, home:{ in:0, on:0 } }
};
let kbTicker = null;

document.addEventListener('DOMContentLoaded', kbInit);

function kbInit() {
	kbLoad();
	if (!kbState.teams.length) { kbState.teams = structuredClone(KB_SEED_TEAMS); kbSave(); }
	kbSeedLeague();
	/* the landing page hands us a role: /app/?as=captain — take it, then clean the URL */
	const qs = new URLSearchParams(location.search), as = qs.get('as'), who = qs.get('who');
	if (as && KB_ROLES[as]) {
		kbState.me = { ...kbState.me, role:as };
		if (who) { if (as === 'ump') kbState.me.umpId = who; else { kbState.me.playerId = who; const ts = kbPersonTeams(who); if (ts.length) kbState.me.teamId = (as === 'captain' && ts.find(t => t.captain === who) || ts[0]).id; } }
		kbState.ui.view = 'home'; history.replaceState(null, '', location.pathname);
	}
	kbNormalizeMe();
	document.addEventListener('click', kbOnClick);
	document.addEventListener('change', kbOnChange);
	document.addEventListener('submit', ev => { ev.preventDefault(); const b = ev.target.querySelector('[type="submit"][data-action]'); if (b) kbDispatch(b, ev); });
	/* a refresh puts you back where you were; screens that need a game fall back to home */
	const needsGame = ['ump', 'captain'], needsTeam = ['team', 'stats'];
	let view = kbState.ui.view || 'home';
	if (kbMeRole() === 'player' && view === 'home') view = 'player';
	if (needsGame.includes(view) && !kbState.game && !(view === 'captain' && kbState.prepId && kbSched(kbState.prepId))) view = 'home';
	if (needsTeam.includes(view) && !kbTeam(kbState.teamId)) view = 'teams';
	kbGo(view);
}

/* ---------- storage ------------------------------------------------------ */
function kbLoad() {
	kbState.ui = {};
	try { const s = JSON.parse(localStorage.getItem(KB_KEY) || 'null'); if (s) { kbState.game = s.game || null; kbState.teams = s.teams || []; kbState.games = s.games || []; kbState.league = s.league || null; kbState.profiles = s.profiles || {}; kbState.ui = s.ui || {}; kbState.pteam = kbState.ui.pteam || 'all'; kbState.side = kbState.ui.side || kbState.side; kbState.tab = kbState.ui.tab || kbState.tab; kbState.teamId = kbState.ui.teamId || null; kbState.prepId = kbState.ui.prepId || null; if (kbState.ui.me) kbState.me = { ...kbState.me, ...kbState.ui.me }; } } catch (e) {}
}
function kbSave() { try { localStorage.setItem(KB_KEY, JSON.stringify({ game:kbState.game, teams:kbState.teams, games:kbState.games, league:kbState.league, profiles:kbState.profiles, ui:{ view:kbState.view, side:kbState.side, tab:kbState.tab, teamId:kbState.teamId, prepId:kbState.prepId, pteam:kbState.pteam, me:kbState.me } })); } catch (e) {} }
/* First run (or an older device) gets the seed league, plus any seed team or captain it's missing. */
function kbSeedLeague() {
	let dirty = false;
	/* a new seedVersion replaces the demo league (schedule, umps, approvals) and re-seeds captains; rosters and games stay */
	const stale = kbState.league && kbState.league.id === KB_SEED_LEAGUE.id && (kbState.league.seedVersion || 1) < (KB_SEED_LEAGUE.seedVersion || 1);
	if (!kbState.league || stale) { if (stale && kbState.game && kbState.game.schedId) kbState.game.schedId = null; kbState.league = structuredClone(KB_SEED_LEAGUE); dirty = true; }
	for (const seed of KB_SEED_TEAMS) {
		const t = kbTeam(seed.id);
		if (!t) { kbState.teams.push(structuredClone(seed)); dirty = true; }
		else if ((!t.captain || stale) && seed.captain && kbPlayer(t, seed.captain)) { t.captain = seed.captain; dirty = true; }
	}
	if (stale && kbState.me.role === 'ump') kbState.me.umpId = null;
	/* seed profiles once per person; a person's own edits win */
	for (const [pid, pr] of Object.entries(window.KB_SEED_PROFILES || {})) if (!kbState.profiles[pid]) { kbState.profiles[pid] = structuredClone(pr); dirty = true; }
	if (dirty) kbSave();
	kbSeedDemoGames();
	if (dirty) kbSave();
}

/* ---------- toast + helpers --------------------------------------------- */
let kbToastTimer;
function kbToast(text) {
	let el = document.querySelector('.toast');
	if (!el) { el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
	el.textContent = text; el.classList.add('is-open');
	clearTimeout(kbToastTimer); kbToastTimer = setTimeout(() => el.classList.remove('is-open'), 2200);
}
function kbEscape(s) { return String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c])); }
function kbSlug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'x'; }
/* The sport config, with the league's rule overrides laid on top (structure / clock / rules only). */
let kbSportCache = { key:'', cfg:null };
function kbSport(g = kbState.game) {
	if (!g) return null;
	const base = KB_SPORTS[g.sport]; if (!base) return null;
	const ov = kbState.league && kbState.league.sport === g.sport ? kbState.league.overrides : null;
	if (!ov || !Object.keys(ov).length) return base;
	const key = g.sport + JSON.stringify(ov);
	if (kbSportCache.key !== key) { const cfg = structuredClone(base); for (const [path, value] of Object.entries(ov)) kbSetPath(cfg, path, value); kbSportCache = { key, cfg }; }
	return kbSportCache.cfg;
}
function kbSetPath(obj, path, value) { const keys = path.split('.'); let o = obj; for (const k of keys.slice(0, -1)) { if (o[k] == null || typeof o[k] !== 'object') o[k] = {}; o = o[k]; } o[keys.at(-1)] = value; }
function kbGetPath(obj, path) { return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj); }
function kbTeam(id) { return kbState.teams.find(t => t.id === id); }
function kbPlayer(team, id) { return team && team.roster.find(p => p.id === id); }
function kbOther(side) { return side === 'away' ? 'home' : 'away'; }
function kbFirst(name) { return String(name || '').split(' ')[0]; }
function kbMMSS(ms) { const s = Math.max(0, Math.floor(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; }

/* ---------- actions ------------------------------------------------------ */
const KB_ACTIONS = {
	'go':           (el) => kbGo(el.dataset.to),
	'new-game':     (el) => kbNewGame(el.closest('form')),
	'tap':          (el) => kbTap(el),
	'runner':       (el) => kbRecord({ kind:'runner', base:Number(el.dataset.base), what:el.dataset.what, to:el.dataset.to ? Number(el.dataset.to) : undefined, rbi:el.dataset.rbi || undefined, side:kbBattingSide() }),
	'resolve-done': () => { kbState.resolve = null; kbRender(); },
	'fc-out':       (el) => { const p = kbState.fc; if (!p) return; kbState.fc = null; const ev = { ...p.ev }; if (el.dataset.runner) ev.outAt = { runner:el.dataset.runner, base:Number(el.dataset.base) }; kbRecord(ev); },
	'fc-cancel':    () => { kbState.fc = null; kbRender(); },
	'play-out':     (el) => kbPlayOut(el.dataset.runner, el.dataset.base),
	'undo':         () => kbUndo(),
	'toggle-log':   () => { kbState.showLog = !kbState.showLog; kbRender(); },
	'end-half':     () => kbRecord({ kind:'halfEnd', side:kbBattingSide(), manual:true }),
	'clock-start':  () => kbRecord({ kind:'clock', what:'start' }),
	'fix-score':    (el) => { kbState.fix = kbState.fix === el.dataset.side ? null : el.dataset.side; kbRender(); },
	'fix-outs':     () => { kbState.fix = kbState.fix === 'outs' ? null : 'outs'; kbRender(); },
	'nudge':        (el) => kbNudge(el.dataset.what, el.dataset.side, Number(el.dataset.delta)),
	'fix-done':     () => { kbState.fix = null; kbRender(); },
	'bag':          (el) => kbBag(el.dataset.side, el.dataset.what, Number(el.dataset.delta)),
	'score-round':  () => kbScoreRound(),
	'end-game':     () => { if (kbState.game) { kbState.game.status = 'final'; kbSave(); kbRender(); kbToast('Final'); } },
	'finish':       () => kbFinish(),
	'abandon':      () => { const s = kbSchedOfGame(kbState.game); if (s) { s.status = 'scheduled'; s.gameId = null; } kbState.game = null; kbSave(); kbGo('home'); kbToast('Game discarded'); },
	/* captain */
	'captain':      (el) => { kbState.side = el.dataset.side || kbState.side; kbState.tab = el.dataset.tab || 'here'; kbGo('captain'); },
	'captain-tab':  (el) => { kbState.tab = el.dataset.tab; kbState.share = null; kbSave(); kbRender(); },
	'captain-side': (el) => { kbState.side = el.dataset.side; kbState.share = null; kbSave(); kbRender(); },
	'here':         (el) => kbToggleHere(el.dataset.player),
	'move':         (el) => kbMoveLineup(Number(el.dataset.index), Number(el.dataset.delta)),
	'balance':      () => kbBalance(),
	'share':        (el) => kbShare(Number(el.dataset.index)),
	'unshare':      (el) => kbUnshare(Number(el.dataset.index)),
	'assign':       (el) => kbAssign(el.dataset.position, el.value),
	/* teams */
	'teams':        () => kbGo('teams'),
	'team':         (el) => { kbState.teamId = el.dataset.team; kbGo('team'); },
	'new-team':     (el) => kbNewTeam(el.closest('form')),
	'add-player':   (el) => kbAddPlayer(el.closest('form')),
	'gender':       (el) => kbSetGender(el.dataset.player, el.dataset.gender),
	'remove-player':(el) => kbRemovePlayer(el.dataset.player),
	'stats':        (el) => { kbState.teamId = el.dataset.team || kbState.teamId; kbGo('stats'); },
	/* roles — who this phone is (stands in for sign-in) */
	'role':         (el) => kbSetMe({ role:el.dataset.role }),
	'me-team':      (el) => kbSetMe({ teamId:el.value || null, playerId:null }),
	'me-player':    (el) => kbSetMe({ playerId:el.value || null }),
	'me-ump':       (el) => kbSetMe({ umpId:el.value || null }),
	'switch':       () => kbOpenSwitch(),
	'switch-close': () => kbCloseSwitch(),
	/* player view */
	'player':       () => kbGo('player'),
	'pteam':        (el) => { kbState.pteam = el.dataset.team || 'all'; kbSave(); kbRender(); },
	'fa-mode':      (el) => { kbSetProfile(kbState.me.playerId, { freeAgent:el.dataset.mode }); kbRender(); kbToast({ off:'Off the free-agent list', mine:'Teams can ask you on nights you already play', all:'Teams can ask you for any game' }[el.dataset.mode]); },
	'pick-icon':    (el) => { const f = el.closest('form').querySelector('[name="icon"]'); f.value = el.dataset.icon; el.closest('.icon-grid').querySelectorAll('button').forEach(b => { const on = b === el; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on); }); },
	'save-profile': (el) => kbSaveProfile(el.closest('form')),
	/* schedule + availability */
	'start-sched':  (el) => kbStartScheduled(el.dataset.sched),
	'prep':         (el) => kbOpenPrep(el.dataset.sched, el.dataset.team),
	'avail':        (el) => kbSetAvail(el.dataset.sched, el.dataset.player, el.dataset.value),
	'free-agent':   (el) => kbSetFreeAgent(el.dataset.player, el.dataset.team),
	'set-lead':     (el) => kbSetLead(el.dataset.sched, el.dataset.team, el.value),
	'recruit':      (el) => kbRecruit(el.dataset.sched, el.dataset.team, el.dataset.player, el.dataset.from),
	/* league */
	'league':       () => kbGo('league'),
	'team-status':  (el) => kbSetTeamStatus(el.dataset.team, el.dataset.status),
	'assign-ump':   (el) => kbAssignUmp(el.dataset.sched, el.value),
	'add-ump':      (el) => kbAddUmp(el.closest('form')),
	'add-sched':    (el) => kbAddSched(el.closest('form')),
	'remove-sched': (el) => kbRemoveSched(el.dataset.sched),
	'rule':         (el) => kbSetRule(el.dataset.path, el.value, el.dataset.type),
	'coming-soon':  () => kbToast('Coming soon')
};
/* Every control goes through here: the role gate first, then the action. */
function kbDispatch(el, ev) {
	const cap = KB_ACTION_CAP[el.dataset.action];
	if (cap && !kbCan(cap, el.dataset.scope || undefined)) { kbToast(kbDenied(cap)); return; }
	(KB_ACTIONS[el.dataset.action] || KB_ACTIONS['coming-soon'])(el, ev);
}
function kbOnClick(ev) {
	const el = ev.target.closest('[data-action]'); if (!el || el.matches('select,input')) return;
	if (el.tagName === 'A' && el.getAttribute('href') && el.getAttribute('href') !== '#') return;
	ev.preventDefault(); kbDispatch(el, ev);
}
function kbOnChange(ev) { const el = ev.target.closest('select[data-action],input[data-action]'); if (el) kbDispatch(el, ev); }

/* ========================================================================== */
/* ROLES — league · ump · captain · lead · player                             */
/* One phone, one role at a time (the switcher on Home). A capability is what  */
/* a role may do; KB_ACTION_CAP maps every gated control to one. kbCan() also  */
/* scopes team roles to THEIR team, so the demo tells the truth about who may */
/* touch what. When sign-in arrives, kbState.me comes from the login instead.  */
/* ========================================================================== */
const KB_ROLES = {
	league:  { label:'League',  caps:['league', 'start-game', 'score', 'roster', 'lineup', 'lead', 'availability', 'recruit'] },
	ump:     { label:'Ump',     caps:['start-game', 'score', 'lineup'] },   /* lineup: injuries and field agreements get fixed by the ump, with warnings, not refusals */
	captain: { label:'Captain', caps:['roster', 'lineup', 'lead', 'availability', 'recruit'] },
	lead:    { label:'Lead',    caps:['lineup', 'availability', 'recruit'] },
	player:  { label:'Player',  caps:['availability'] }
};
const KB_ACTION_CAP = {
	'new-game':'start-game', 'start-sched':'start-game',
	'tap':'score', 'runner':'score', 'resolve-done':'score', 'fc-out':'score', 'fc-cancel':'score', 'play-out':'score', 'undo':'score', 'end-half':'score', 'clock-start':'score',
	'fix-score':'score', 'fix-outs':'score', 'nudge':'score', 'fix-done':'score', 'bag':'score', 'score-round':'score', 'end-game':'score', 'finish':'score', 'abandon':'score',
	'here':'lineup', 'move':'lineup', 'balance':'lineup', 'share':'lineup', 'unshare':'lineup', 'assign':'lineup', 'prep':'lineup',
	'new-team':'roster', 'add-player':'roster', 'gender':'roster', 'remove-player':'roster',
	'set-lead':'lead', 'recruit':'recruit', 'avail':'availability', 'free-agent':'availability',
	'team-status':'league', 'assign-ump':'league', 'add-ump':'league', 'add-sched':'league', 'remove-sched':'league', 'rule':'league'
};
const KB_DENIED = { 'start-game':'Only the ump or the league starts a game', score:'Only the ump keeps score — you’re watching', roster:'Only the captain changes the roster', lineup:'Only the captain, lead or ump sets the lineup', lead:'Only the captain names a lead', availability:'You can only answer for yourself', recruit:'Only the captain or lead recruits', league:'League admins only' };
function kbDenied(cap) { return KB_DENIED[cap] || 'Not allowed for this role'; }
function kbMeRole() { return KB_ROLES[kbState.me.role] ? kbState.me.role : 'player'; }
function kbMeTeam() { return kbTeam(kbState.me.teamId); }
function kbMyTeamId(side) { const g = kbCaptainGame(); return g && g.teams[side] ? g.teams[side].teamId : null; }
/* Is this phone's role allowed to do `cap` right now? Team roles must be on the team in question. */
function kbCan(cap, teamId) {
	const role = kbMeRole(), me = kbState.me;
	if (!KB_ROLES[role].caps.includes(cap)) return false;
	if (role === 'league') return true;
	if (role === 'ump') return cap === 'lineup' ? !kbState.prepId : true;
	/* team-scoped: which team is the control about? */
	const scope = teamId !== undefined ? teamId
		: cap === 'lineup' ? kbMyTeamId(kbState.side)
		: cap === 'roster' ? kbState.teamId
		: me.teamId;
	if (cap === 'lineup' || cap === 'roster' || cap === 'lead' || cap === 'recruit') { if (!scope || scope !== me.teamId) return false; }
	/* a lead only acts on the game they lead */
	if (role === 'lead' && (cap === 'lineup' || cap === 'recruit')) { const s = kbSched(kbState.prepId) || kbSchedOfGame(kbState.game); if (!s || !s.lead || s.lead[me.teamId] !== me.playerId) return false; }
	return true;
}
/* After every render: anything this role may not do is disabled, not hidden, so the screen still reads the same. */
function kbApplyPerms() {
	document.querySelectorAll('.view.is-current [data-action]').forEach(el => {
		const cap = KB_ACTION_CAP[el.dataset.action]; if (!cap) return;
		const team = el.dataset.scope || undefined;
		const ok = kbCan(cap, team);
		if ('disabled' in el) { if (!ok) { el.disabled = true; el.setAttribute('data-denied', cap); } else if (el.getAttribute('data-denied')) { el.disabled = false; el.removeAttribute('data-denied'); } }
	});
}
function kbSetMe(patch) {
	kbState.me = { ...kbState.me, ...patch };
	kbNormalizeMe(patch);
	kbState.prepId = null; kbSave(); kbRender();
}
/* Make sure the role has a sensible team / player / ump behind it. */
function kbNormalizeMe(patch = {}) {
	const me = kbState.me, L = kbState.league;
	/* keep the context sensible for the role */
	if (['captain', 'lead', 'player'].includes(me.role)) {
		if (!kbTeam(me.teamId)) me.teamId = (kbState.teams.find(t => t.roster.length) || {}).id || null;
		const team = kbTeam(me.teamId);
		if (me.role === 'lead' && team && patch.role === 'lead') { const n = kbNextSched(team.id); const lead = n && n.lead && n.lead[team.id]; if (lead && kbPlayer(team, lead)) me.playerId = lead; }
		if (team && !kbPlayer(team, me.playerId)) me.playerId = me.role === 'captain' && team.captain ? team.captain : (team.roster[0] || {}).id || null;
		if (me.role === 'captain' && team && team.captain && patch.playerId === undefined) me.playerId = team.captain;
	}
	if (me.role === 'ump' && L && !L.umpires.some(u => u.id === me.umpId)) me.umpId = (L.umpires[0] || {}).id || null;
}
function kbMeLabel() {
	const me = kbState.me, role = KB_ROLES[kbMeRole()].label, team = kbMeTeam();
	if (me.role === 'league') return `${role} · ${kbState.league ? kbState.league.name : ''}`;
	if (me.role === 'ump') { const u = kbState.league && kbState.league.umpires.find(u => u.id === me.umpId); return `${role} · ${u ? kbFirst(u.name) : '—'}`; }
	const p = kbPerson(me.playerId);
	if (me.role === 'player') return `${kbProfile(me.playerId).icon || ''} ${p ? kbDisplayName(p) : '—'}`.trim();
	return `${role} · ${team ? team.short : '—'}${p ? ' · ' + kbFirst(p.name) : ''}`;
}

/* ---------- people: a player is a person who may be on several rosters ------ */
function kbPersonTeams(pid) { return kbState.teams.filter(t => t.roster.some(p => p.id === pid && !p.guest)); }
function kbPerson(pid) { for (const t of kbState.teams) { const p = kbPlayer(t, pid); if (p) return { ...p, teams:kbPersonTeams(pid) }; } return null; }
function kbProfile(pid) { return (kbState.profiles && kbState.profiles[pid]) || {}; }
function kbDisplayName(p) { if (!p) return ''; const pr = kbProfile(p.id); return pr.nickname || p.name; }
function kbInitials(name) { return String(name || '').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2); }
function kbSetProfile(pid, patch) { if (!pid) return; kbState.profiles = kbState.profiles || {}; kbState.profiles[pid] = { ...kbProfile(pid), ...patch }; kbSave(); }
function kbSaveProfile(form) {
	const v = n => (form.querySelector(`[name="${n}"]`) || {}).value || '';
	const pid = kbState.me.playerId; if (!pid) return;
	kbSetProfile(pid, { icon:v('icon'), nickname:v('nickname').trim(), walkup:{ title:v('walkup-title').trim(), artist:v('walkup-artist').trim(), url:v('walkup-url').trim() } });
	kbRender(); kbToast('Profile saved');
}
/* the switcher (stands in for sign-in) lives in a dialog behind the me-bar pill */
function kbOpenSwitch() { const d = document.getElementById('switch'); if (!d) return; kbRenderWhoami(); if (!d.open) d.showModal(); }
function kbCloseSwitch() { const d = document.getElementById('switch'); if (d && d.open) d.close(); }

/* ---------- stats across every roster the person is on ------------------- */
function kbEmptyTotals() { return { g:0, pa:0, h:0, r:0, rbi:0, out:0, reached:0 }; }
function kbLeagueStats() {
	const totals = {}; let teamGames = {};
	for (const g of kbState.games) {
		for (const s of ['away', 'home']) {
			const tid = g.teams[s].teamId; if (!tid) continue; teamGames[tid] = (teamGames[tid] || 0) + 1;
			const d = kbDerive(g);
			for (const [pid, st] of Object.entries(d.stats[s])) { const t = totals[pid] || (totals[pid] = kbEmptyTotals()); t.g += 1; for (const key of ['pa', 'h', 'r', 'rbi', 'out', 'reached']) t[key] += st[key]; }
		}
	}
	return { totals, teamGames };
}
function kbPlayerStats(pid) { return kbLeagueStats().totals[pid] || kbEmptyTotals(); }
/* five axes, each 0..1 against the league's best; the league average rides along for the overlay */
function kbRadarAxes(pid) {
	const { totals } = kbLeagueStats(); const ids = Object.keys(totals).filter(id => totals[id].pa >= 4);
	const axes = [
		{ key:'obp',     label:'On base', f:t => t.pa ? t.reached / t.pa : 0, fmt:v => v.toFixed(3).replace(/^0/, '') },
		{ key:'contact', label:'Contact', f:t => t.pa ? t.h / t.pa : 0, fmt:v => Math.round(v * 100) + '%' },
		{ key:'runs',    label:'Runs',    f:t => t.g ? t.r / t.g : 0, fmt:v => v.toFixed(1) + '/g' },
		{ key:'rbi',     label:'RBI',     f:t => t.g ? t.rbi / t.g : 0, fmt:v => v.toFixed(1) + '/g' },
		{ key:'games',   label:'Games',   f:t => t.g, fmt:v => String(v) }
	];
	const mine = totals[pid] || kbEmptyTotals();
	return axes.map(a => { const vals = ids.map(id => a.f(totals[id])); const max = Math.max(a.f(mine), ...vals, 0.0001); const avg = vals.length ? vals.reduce((x, y) => x + y, 0) / vals.length : 0; const me = a.f(mine); const rank = 1 + vals.filter(v => v > me).length; return { ...a, me, avg, max, norm:me / max, avgNorm:avg / max, rank, of:Math.max(ids.length, ids.includes(pid) ? 0 : 1 + ids.length), text:a.fmt(me) }; });
}
function kbRadarSVG(axes) {
	const n = axes.length, cx = 100, cy = 100, r = 72; const pt = (i, v) => { const a = -Math.PI / 2 + i * 2 * Math.PI / n; return [cx + Math.cos(a) * r * v, cy + Math.sin(a) * r * v]; };
	const poly = (vals) => vals.map((v, i) => pt(i, Math.max(0.04, v)).map(x => x.toFixed(1)).join(',')).join(' ');
	const rings = [0.25, 0.5, 0.75, 1].map(s => `<polygon class="radar-ring" points="${poly(axes.map(() => s))}"/>`).join('');
	const spokes = axes.map((_, i) => { const [x, y] = pt(i, 1); return `<line class="radar-spoke" x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"/>`; }).join('');
	const labels = axes.map((a, i) => { const [x, y] = pt(i, 1.22); return `<text class="radar-label" x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" dominant-baseline="middle">${kbEscape(a.label)}</text>`; }).join('');
	return `<svg class="radar" viewBox="-22 -14 244 228" role="img" aria-label="${kbEscape(axes.map(a => `${a.label} ${a.text}`).join(', '))}">${rings}${spokes}<polygon class="radar-league" points="${poly(axes.map(a => a.avgNorm))}"/><polygon class="radar-me" points="${poly(axes.map(a => a.norm))}"/>${axes.map((a, i) => { const [x, y] = pt(i, Math.max(0.04, a.norm)); return `<circle class="radar-dot" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.2"/>`; }).join('')}${labels}</svg>`;
}

/* ---------- demo games: three finished games so stats and standings have    */
/* something to show. Deterministic (seeded PRNG), driven through the real     */
/* engine, marked demo:true. Seeded once per league (league.demoGames).        */
function kbSeedDemoGames() {
	const L = kbState.league; if (!L || L.demoGames || kbState.games.length) return;
	let seed = 20261008; const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
	const weights = [['single', 32], ['double', 9], ['triple', 2], ['homer', 4], ['out', 28], ['caught', 12], ['foul', 7], ['missed', 3], ['error', 3]];
	const pick = () => { let x = rnd() * weights.reduce((a, [, w]) => a + w, 0); for (const [id, w] of weights) { if ((x -= w) <= 0) return id; } return 'out'; };
	const sideFor = (teamId, flip) => { const t = kbTeam(teamId); const ids = t.roster.filter(p => !p.guest).map(p => p.id); const here = ids.filter((_, i) => rnd() > 0.2 || i < 8); return { name:t.name, teamId, attendance:Object.fromEntries(ids.map(id => [id, here.includes(id)])), lineup:kbBalancedLineup(t, here), assignments:{} }; };
	const keep = kbState.game;
	const matchups = [['pitch-please', 'lbc', '2026-09-10'], ['lbc', 'pitch-please', '2026-09-17'], ['pitch-please', 'lbc', '2026-09-24']];
	matchups.forEach(([away, home, date], n) => {
		const t0 = new Date(`${date}T19:00:00`).getTime(); let t = t0;
		const g = { id:'demo-' + n, demo:true, sport:L.sport, mode:'season', status:'live', startedAt:new Date(t0).toISOString(), teams:{ away:sideFor(away), home:sideFor(home) }, events:[{ t, by:'ump', kind:'clock', what:'start' }] };
		kbState.game = g;
		for (let guard = 0; guard < 400; guard++) {
			const d = kbDerive(g); if (d.final || d.inning > 6) break;
			const side = d.half === 'top' ? 'away' : 'home'; const id = pick(); const a = kbSport(g).actions.find(x => x.id === id); const kk = kbCurrentKicker(side, g);
			t += 35000 + Math.floor(rnd() * 40000);
			const ev = { t, by:'ump', kind:a.kind, value:a.value || 0, actionId:a.id, side }; if (a.hit) ev.hit = true; if (kk) ev.player = kk.id;
			g.events.push(ev);
		}
		g.status = 'final'; kbState.games.push(g);
	});
	kbState.game = keep; L.demoGames = true; kbSave();
}

/* ---------- schedule ------------------------------------------------------ */
function kbSched(id) { return kbState.league && kbState.league.schedule.find(s => s.id === id); }
function kbSchedOfGame(g) { return g && g.schedId ? kbSched(g.schedId) : null; }
function kbSchedSorted() { return kbState.league ? kbState.league.schedule.slice().sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)) : []; }
function kbUpcoming(teamId) { return kbSchedSorted().filter(s => s.status !== 'final' && (!teamId || s.away === teamId || s.home === teamId)); }
function kbNextSched(teamId) { return kbUpcoming(teamId)[0] || null; }
function kbSchedDate(s) { const d = new Date(`${s.date}T${s.time || '12:00'}:00`); return `${d.toLocaleDateString([], { weekday:'short', month:'short', day:'numeric' })}${s.time ? ' · ' + d.toLocaleTimeString([], { hour:'numeric', minute:'2-digit' }) : ''}`; }
function kbSchedName(s, side) { const t = kbTeam(s[side]); return t ? t.name : s[side] || '—'; }
function kbOpponent(s, teamId) { return s.away === teamId ? s.home : s.away; }
function kbAvailCounts(s, teamId) { const team = kbTeam(teamId); const a = s.availability || {}; const c = { in:0, out:0, unknown:0 }; if (team) for (const p of team.roster) c[a[p.id] === 'in' ? 'in' : a[p.id] === 'out' ? 'out' : 'unknown'] += 1; return c; }
/* A side built from a team's roster + this game's availability (unknown counts as here, like today). */
function kbSideFromSched(s, side) {
	const teamId = s[side], team = kbTeam(teamId), cfg = KB_SPORTS[kbState.league.sport];
	if (!team) return { name:cfg.sides[side], teamId:null, attendance:{}, lineup:[], assignments:{} };
	const a = s.availability || {};
	const ids = team.roster.filter(p => a[p.id] !== 'out').map(p => p.id);
	return { name:team.name, teamId, attendance:Object.fromEntries(team.roster.map(p => [p.id, a[p.id] !== 'out'])), lineup:kbBalancedLineup(team, ids), assignments:{} };
}
/* The captain's pre-game workspace: a game-shaped object on the schedule entry, kept until the ump starts it. */
function kbEnsurePrep(s) {
	if (!s.prep) s.prep = { id:'prep-' + s.id, sport:kbState.league.sport, mode:s.mode || 'season', status:'prep', teams:{ away:kbSideFromSched(s, 'away'), home:kbSideFromSched(s, 'home') }, events:[] };
	return s.prep;
}
function kbCaptainGame() { const s = kbState.prepId ? kbSched(kbState.prepId) : null; return s ? kbEnsurePrep(s) : kbState.game; }
function kbOpenPrep(schedId, teamId) {
	const s = kbSched(schedId); if (!s) return;
	/* if the ump already started this one, the live game is the lineup now */
	if (s.gameId && kbState.game && kbState.game.id === s.gameId) { kbState.prepId = null; kbState.side = kbState.game.teams.home.teamId === teamId ? 'home' : 'away'; kbState.tab = 'here'; kbGo('captain'); return; }
	kbEnsurePrep(s); kbState.prepId = s.id; kbState.side = s.home === teamId ? 'home' : 'away'; kbState.tab = 'here'; kbSave(); kbGo('captain');
}
/* The ump starts a scheduled game: captains' prep (or roster + availability) becomes the sides. */
function kbStartScheduled(schedId) {
	const s = kbSched(schedId); if (!s) return;
	if (s.gameId && kbState.game && kbState.game.id === s.gameId) { kbGo('ump'); return; }
	if (kbState.game && kbState.game.status === 'live') { kbToast('Finish the game in progress first'); return; }
	const prep = kbEnsurePrep(s);
	kbState.game = { id:'g' + Date.now(), schedId:s.id, sport:prep.sport, mode:prep.mode, status:'live', startedAt:new Date().toISOString(), teams:structuredClone(prep.teams), events:[] };
	s.gameId = kbState.game.id; s.status = 'live'; s.prep = null; kbState.prepId = null;
	kbSave(); kbGo('ump'); kbToast('Play ball');
}
function kbSetAvail(schedId, playerId, value) {
	const s = kbSched(schedId); if (!s) return;
	const me = kbState.me; if (kbMeRole() === 'player' && playerId !== me.playerId) { kbToast(kbDenied('availability')); return; }
	s.availability = s.availability || {}; s.availability[playerId] = value;
	/* keep a prep in step if the captain already opened one */
	if (s.prep) for (const side of ['away', 'home']) { const t = s.prep.teams[side]; if (t.teamId && kbPlayer(kbTeam(t.teamId), playerId)) { t.attendance[playerId] = value === 'in'; if (value === 'in' && !t.lineup.some(slot => kbSlotIds(slot).includes(playerId))) t.lineup.push(playerId); } }
	kbSave(); kbRender();
}
function kbSetFreeAgent(playerId, teamId) {
	const p = kbPlayer(kbTeam(teamId), playerId); if (!p) return;
	if (kbMeRole() === 'player' && playerId !== kbState.me.playerId) { kbToast(kbDenied('availability')); return; }
	const next = kbFaMode(playerId) === 'off' ? 'all' : 'off';
	kbSetProfile(playerId, { freeAgent:next }); kbRender(); kbToast(next === 'all' ? `${kbFirst(p.name)} is a free agent — teams that are short can ask` : `${kbFirst(p.name)} is off the free-agent list`);
}
/* free-agent mode: 'off' | 'mine' (only nights I already play) | 'all' (any game). Legacy roster flag = 'all'. */
function kbFaMode(pid) { const pr = kbProfile(pid); if (pr.freeAgent) return pr.freeAgent; const p = kbPerson(pid); return p && p.freeAgent ? 'all' : 'off'; }
function kbPlaysOn(pid, date) { return kbPersonTeams(pid).some(t => kbState.league.schedule.some(s => s.date === date && (s.away === t.id || s.home === t.id))); }
function kbSetLead(schedId, teamId, playerId) {
	const s = kbSched(schedId); if (!s) return;
	s.lead = s.lead || {}; if (playerId) s.lead[teamId] = playerId; else delete s.lead[teamId];
	kbSave(); kbRender(); kbToast(playerId ? `${kbFirst(kbPlayer(kbTeam(teamId), playerId).name)} leads this game` : 'No lead for this game');
}
/* Free agents on other approved teams who haven't said they're out. */
function kbFreeAgents(s, forTeamId) {
	const L = kbState.league; const out = [];
	const seen = new Set();
	for (const t of kbState.teams) { if (t.id === forTeamId || (L.teams[t.id] && L.teams[t.id] !== 'approved')) continue; for (const p of t.roster) {
		if (p.guest || seen.has(p.id) || kbPlayer(kbTeam(forTeamId), p.id) || (s.availability || {})[p.id] === 'out') continue;
		const mode = kbFaMode(p.id); if (mode === 'off') continue; if (mode === 'mine' && !kbPlaysOn(p.id, s.date)) continue;
		seen.add(p.id); out.push({ ...p, from:t, mode });
	} }
	return out;
}
/* Recruit: copy the player onto the roster as a guest for this game and mark them in. */
function kbRecruit(schedId, teamId, playerId, fromId) {
	const s = kbSched(schedId), team = kbTeam(teamId), from = kbTeam(fromId), p = from && kbPlayer(from, playerId); if (!s || !team || !p) return;
	if (kbPlayer(team, p.id)) { kbToast(`${kbFirst(p.name)} is already on the roster`); return; }
	team.roster.push({ id:p.id, name:p.name, gender:p.gender, guest:true, guestFrom:from.id, guestFor:s.id });
	kbSetAvail(s.id, p.id, 'in');
	kbToast(`${kbFirst(p.name)} is in for this game`);
}

/* ---------- league admin --------------------------------------------------- */
function kbSetTeamStatus(teamId, status) { const L = kbState.league; L.teams[teamId] = status; kbSave(); kbRender(); kbToast(`${kbTeam(teamId)?.name || 'Team'}: ${status}`); }
function kbAssignUmp(schedId, umpId) { const s = kbSched(schedId); if (!s) return; s.ump = umpId || null; kbSave(); kbRender(); }
function kbAddUmp(form) { const name = form.querySelector('[name="name"]').value.trim(); if (!name) return; kbState.league.umpires.push({ id:'ump-' + kbSlug(name) + '-' + Date.now().toString(36).slice(-3), name }); form.reset(); kbSave(); kbRender(); kbToast(`Added ${name}`); }
function kbAddSched(form) {
	const v = n => form.querySelector(`[name="${n}"]`).value;
	if (!v('date') || !v('away') || !v('home') || v('away') === v('home')) { kbToast('Pick a date and two different teams'); return; }
	kbState.league.schedule.push({ id:'s' + Date.now().toString(36), date:v('date'), time:v('time') || '', field:v('field').trim(), away:v('away'), home:v('home'), ump:v('ump') || null, mode:v('mode') || 'season', status:'scheduled', availability:{}, lead:{}, prep:null });
	form.reset(); kbSave(); kbRender(); kbToast('Game added');
}
function kbRemoveSched(schedId) { const L = kbState.league; const s = kbSched(schedId); if (!s || s.status === 'live') { kbToast('That game is in progress'); return; } L.schedule = L.schedule.filter(x => x.id !== schedId); kbSave(); kbRender(); }
function kbSetRule(path, raw, type) {
	const L = kbState.league; const base = kbGetPath(KB_SPORTS[L.sport], path);
	let value = type === 'bool' ? raw === 'true' : Number(raw);
	if (type !== 'bool' && !Number.isFinite(value)) return;
	if (value === base) delete L.overrides[path]; else L.overrides[path] = value;
	kbSportCache = { key:'', cfg:null }; kbSave(); kbRender(); kbToast(value === base ? 'Back to the rulebook' : 'Rule changed for this league');
}
/* W-L-T from scheduled games that have a result. */
function kbStandings() {
	const L = kbState.league; const rows = {};
	const row = id => rows[id] || (rows[id] = { team:kbTeam(id), w:0, l:0, t:0, rf:0, ra:0 });
	for (const s of L.schedule) { if (!s.result) continue; const a = row(s.away), h = row(s.home); a.rf += s.result.away; a.ra += s.result.home; h.rf += s.result.home; h.ra += s.result.away; if (s.result.away > s.result.home) { a.w++; h.l++; } else if (s.result.home > s.result.away) { h.w++; a.l++; } else { a.t++; h.t++; } }
	for (const [id, st] of Object.entries(L.teams)) if (st === 'approved') row(id);
	return Object.values(rows).filter(r => r.team).sort((a, b) => (b.w - a.w) || (a.l - b.l) || ((b.rf - b.ra) - (a.rf - a.ra)));
}

/* ---------- navigation --------------------------------------------------- */
function kbGo(view) {
	kbState.view = view; document.body.dataset.view = view;
	kbSave(); /* remember the screen so a refresh lands here */
	document.querySelectorAll('.view').forEach(v => v.classList.toggle('is-current', v.dataset.view === view));
	window.scrollTo(0, 0);
	kbRender();
}

/* ========================================================================== */
/* GAME + EVENTS                                                              */
/* ========================================================================== */
function kbNewGame(form) {
	const sport = form.querySelector('[name="sport"]').value, cfg = KB_SPORTS[sport];
	const modeSel = form.querySelector('[name="mode"]');
	const mode = modeSel && cfg.modes && cfg.modes[modeSel.value] ? modeSel.value : 'season';
	const sideOf = (s) => {
		const teamId = form.querySelector(`[name="${s}-team"]`).value || null;
		const team = kbTeam(teamId);
		const typed = form.querySelector(`[name="${s}"]`).value.trim();
		return { name: typed || (team ? team.name : cfg.sides[s]), teamId,
			attendance: team ? Object.fromEntries(team.roster.map(p => [p.id, true])) : {},
			lineup: team ? kbBalancedLineup(team, team.roster.map(p => p.id)) : [],
			assignments: {} };
	};
	kbState.game = { id:'g' + Date.now(), sport, mode, status:'live', startedAt:new Date().toISOString(), teams:{ away:sideOf('away'), home:sideOf('home') }, events:[] };
	kbSave();
	const anyTeam = kbState.game.teams.away.teamId || kbState.game.teams.home.teamId;
	if (anyTeam) { kbState.side = kbState.game.teams.home.teamId ? 'home' : 'away'; kbState.tab = 'here'; kbGo('captain'); kbToast('Who’s here today?'); }
	else { kbGo('ump'); kbToast('Play ball'); }
}

/* A tap on the pad. Plate-appearance events get the current kicker stamped   */
/* on them so lineup edits later never rewrite history. The first play also    */
/* starts the clock if the ump hasn't.                                         */
function kbTap(el) {
	const cfg = kbSport(), a = cfg.actions.find(x => x.id === el.dataset.id);
	const side = kbBattingSide();
	const ev = { kind:a.kind, value:a.value || 0, actionId:a.id, side };
	if (a.hit) ev.hit = true;
	if (a.pa === false) ev.pa = false;
	const k = kbCurrentKicker(side);
	if (k && a.pa !== false) ev.player = k.id;
	if (a.menOnly && k && k.gender !== 'male') kbToast(`Heads up: ${kbFirst(k.name)} may bunt — recorded anyway`); /* warn, don't prevent: the ump's call */
	if (cfg.clock && !kbState.game.events.some(e => e.kind === 'clock')) kbState.game.events.push({ t:Date.now(), by:'ump', kind:'clock', what:'start', auto:true });
	const before = kbDerive();
	kbState.resolve = null; kbState.fc = null;
	/* fielder's choice with runners on: ask who was out before recording — one event for the whole play */
	if (a.fc && before.bases.some(Boolean)) { kbState.fc = { ev, forced:kbForcedTargets(before.bases, a.value) }; kbRender(); return; }
	/* after a hit that isn't a home run, if anyone besides the kicker is on base, offer the Runners row */
	kbRecord(ev);
	const after = kbDerive();
	const forcedHome = after.lastPlay && after.lastPlay.forced.some(f => f.target >= 4);
	if (a.kind === 'reach' && a.value < 4 && (after.bases.filter(Boolean).length > 1 || forcedHome) && !after.final && after.half === before.half) { kbState.resolve = { kicker:ev.player || null }; kbRender(); }
}
/* A forced runner was thrown out at the base he was forced to: rewrite the   */
/* last play (one reach event) with outAt, so the record stays a single play  */
/* and undo removes all of it.                                                 */
function kbPlayOut(runner, base) {
	const e = kbState.game.events.at(-1);
	if (!e || e.kind !== 'reach') { kbToast('That play is no longer the last one'); return; }
	e.outAt = { runner, base:Number(base) };
	kbState.resolve = null;
	const d = kbDerive();
	if (d.final) { kbState.game.status = 'final'; kbToast(d.finalReason); }
	kbSave(); kbRender();
}
function kbRecord(ev) {
	if (!kbState.game || kbState.game.status !== 'live') return;
	kbState.game.events.push({ t:Date.now(), by:'ump', ...ev });
	const d = kbDerive();
	if (d.final) { kbState.game.status = 'final'; kbToast(d.finalReason); }
	else if (d.notice) kbToast(d.notice);
	kbSave(); kbRender();
}
function kbUndo() {
	if (!kbState.game || !kbState.game.events.length) return;
	kbState.resolve = null;
	const e = kbState.game.events.pop();
	if (e.kind === 'clock' && e.auto) return kbUndo(); /* an auto clock-start isn't a play */
	kbState.game.status = 'live';
	kbSave(); kbRender(); kbToast(`Undid ${kbEventLabel(e)}`);
}
function kbFinish() {
	const g = kbState.game; if (!g) return;
	if (g.status === 'final') {
		kbState.games.unshift(g); kbState.games = kbState.games.slice(0, 200);
		const s = kbSchedOfGame(g); if (s) { const d = kbDerive(g); s.status = 'final'; s.result = { away:d.score.away, home:d.score.home }; }
		/* guests were for this game only */
		for (const t of kbState.teams) t.roster = t.roster.filter(p => !(p.guest && p.guestFor === (g.schedId || '')));
	}
	kbState.game = null; kbSave(); kbGo('home');
}
function kbBattingSide() { const d = kbDerive(); return d && d.half === 'top' ? 'away' : 'home'; }

/* ---------- corrections (events, so they're logged + undoable) ---------- */
function kbNudge(what, side, delta) {
	const d = kbDerive();
	if (what === 'score') kbRecord({ kind:'set', what:'score', side, value:Math.max(0, d.score[side] + delta) });
	if (what === 'outs') kbRecord({ kind:'set', what:'outs', value:Math.max(0, Math.min(kbSport().structure.outsPerHalf - 1, d.outs + delta)) });
}

/* ---------- cornhole round entry ---------------------------------------- */
function kbBag(side, what, delta) {
	const cfg = kbSport(); const p = kbState.pending[side];
	const next = Math.max(0, p[what] + delta);
	if (next + p[what === 'in' ? 'on' : 'in'] > cfg.structure.bagsPerSide) { kbToast(`Only ${cfg.structure.bagsPerSide} bags a side`); return; }
	p[what] = next; kbRender();
}
function kbScoreRound() {
	const p = kbState.pending;
	kbRecord({ kind:'round', away:{ ...p.away }, home:{ ...p.home } });
	kbState.pending = { away:{ in:0, on:0 }, home:{ in:0, on:0 } };
	kbRender();
}

/* ========================================================================== */
/* LINEUP — slots. A slot is a playerId, or { share:[a, b] } for two players  */
/* alternating one spot (TBCS: "two men may share one kicking spot"). Who's   */
/* up is derived: pass = floor(pa / slots), slot = pa % slots; a shared slot   */
/* sends share[pass % 2].                                                      */
/* ========================================================================== */
function kbSlotIds(slot) { return typeof slot === 'string' ? [slot] : (slot && slot.share) || []; }
function kbActiveLineup(side, g = kbState.game) {
	const t = g.teams[side];
	return (t.lineup || []).map(slot => { const ids = kbSlotIds(slot).filter(id => t.attendance[id]); return ids.length === 0 ? null : ids.length === 1 ? ids[0] : { share:ids }; }).filter(Boolean);
}
function kbSlotKicker(slot, pass) { return typeof slot === 'string' ? slot : slot.share[pass % slot.share.length]; }
function kbKickerAt(side, pa, g = kbState.game) {
	const team = kbTeam(g.teams[side].teamId); const lineup = kbActiveLineup(side, g);
	if (!team || !lineup.length) return null;
	return kbPlayer(team, kbSlotKicker(lineup[pa % lineup.length], Math.floor(pa / lineup.length)));
}
function kbCurrentKicker(side, g = kbState.game) { const d = kbDerive(g); return d ? kbKickerAt(side, d.pa[side], g) : null; }
function kbNextKickers(side, n = 2, g = kbState.game) {
	const d = kbDerive(g); const lineup = kbActiveLineup(side, g); if (!d || !lineup.length) return [];
	return Array.from({ length:Math.min(n, lineup.length - 1) }, (_, i) => kbKickerAt(side, d.pa[side] + 1 + i, g)).filter(Boolean);
}

/* ========================================================================== */
/* DERIVE — replay the log through the sport's rules                          */
/* ========================================================================== */
function kbDerive(g = kbState.game) {
	const cfg = kbSport(g); if (!g) return null;
	return cfg.structure.kind === 'innings' ? kbDeriveInnings(g, cfg) : kbDeriveRounds(g, cfg);
}

function kbDeriveInnings(g, cfg) {
	const S = cfg.structure, R = cfg.rules || {}, K = cfg.clock, mode = g.mode || 'season';
	const d = { mode, score:{ away:0, home:0 }, inning:1, half:'top', outs:0, bases:[null, null, null], runsThisHalf:0,
		line:{ away:[], home:[] }, pa:{ away:0, home:0 }, stats:{ away:{}, home:{} }, lastOut:{ away:null, home:null }, lastOutBy:{ away:{}, home:{} },
		clockStart:null, minute:0, official:false, lastInning:null, overtime:false, capOn:false,
		final:false, finalReason:'', notice:'', log:[] };
	const side = () => d.half === 'top' ? 'away' : 'home';
	const stat = (s, id) => { if (!id || id === true) return null; return d.stats[s][id] || (d.stats[s][id] = { pa:0, h:0, r:0, rbi:0, out:0, reached:0 }); };
	const lead = () => d.score[side()] - d.score[kbOther(side())];
	const capApplies = () => { if (!R.runCap) return false; if (!K) return true; if (d.minute < K.capUntil) return true; return lead() >= (R.runCap.lateLeadException ?? Infinity); };
	const run = (runnerId, kickerId, n = 1) => {
		d.score[side()] += n; d.runsThisHalf += n; d.line[side()][d.inning - 1] = (d.line[side()][d.inning - 1] || 0) + n;
		const r = stat(side(), runnerId); if (r) r.r += n;
		const k = stat(side(), kickerId); if (k && kickerId !== undefined) k.rbi += n;
	};
	const endHalf = () => {
		d.line[side()][d.inning - 1] = d.line[side()][d.inning - 1] || 0;
		d.outs = 0; d.runsThisHalf = 0; d.bases = [null, null, null];
		if (d.half === 'top') d.half = 'bottom'; else { d.half = 'top'; d.inning += 1; }
		kbCheckEnd(d, cfg, g);
		/* playoff overtime: each half starts with the last out on second */
		if (!d.final && d.overtime && R.overtime && R.overtime[mode] && R.overtime[mode].runnerOnSecond) d.bases[1] = d.lastOut[side()] || true;
	};
	const recordOut = (e) => { if (e.player) { d.lastOut[side()] = e.player; const p = kbPlayer(kbTeam(g.teams[side()].teamId), e.player); if (p) d.lastOutBy[side()][p.gender] = e.player; } };
	const endPA = (e, outcome) => { if (e.pa === false) return; d.pa[side()] += 1; const s = stat(side(), e.player); if (s) { s.pa += 1; if (outcome === 'out') s.out += 1; if (outcome === 'reach') s.reached += 1; if (e.hit) s.h += 1; } };
	const out = (e) => { d.outs += 1; recordOut(e); endPA(e, 'out'); if (d.outs >= S.outsPerHalf) endHalf(); };
	const afterRuns = () => { if (capApplies() && d.runsThisHalf >= R.runCap.runs) { d.notice = `${R.runCap.runs} runs — that’s the inning`; if (R.runCap.countsAsOut) d.outs = S.outsPerHalf; endHalf(); return true; } return false; };
	/* A kick moves the kicker to base n and runners ONLY as far as the force   */
	/* requires: a runner must vacate a base exactly when the runner behind him */
	/* needs it. Everything past the force is the ump's call (runner events).   */
	/* A home run scores everyone.                                              */
	const reach = (e, n) => {
		const b = d.bases, who = e.player || true;
		if (n >= 4) { for (let i = 2; i >= 0; i--) { if (b[i]) { run(b[i], e.player); b[i] = null; } } run(e.player, e.player); endPA(e, 'reach'); afterRuns(); return; }
		const next = [null, null, null];
		let outRunner = null;
		d.lastPlay = { forced:[] };
		for (const { runner, from, target } of kbForcedTargets(b, n)) {
			/* a forced runner may have been thrown out at the base he was forced to — no run, no base */
			if (e.outAt && (e.outAt.runner === runner || (e.outAt.runner === 'anon' && runner === true)) && e.outAt.base === target) { outRunner = runner; continue; }
			if (target !== from) d.lastPlay.forced.push({ runner, from, target });
			if (target >= 4) run(runner, e.player); else next[target - 1] = runner;
		}
		next[n - 1] = who;
		d.bases = next;
		endPA(e, 'reach');
		if (outRunner !== null) { d.outs += 1; recordOut({ player:outRunner === true ? null : outRunner }); if (d.outs >= S.outsPerHalf) { endHalf(); return; } }
		afterRuns();
	};

	for (const e of g.events) {
		if (d.final && e.kind !== 'set') continue;
		if (d.clockStart != null && e.t) d.minute = (e.t - d.clockStart) / 60000;
		if (K && d.clockStart != null) { d.official = d.minute >= K.officialAfter; if (d.lastInning == null && d.minute >= K.minutes) d.lastInning = d.inning; }
		d.notice = ''; d.lastPlay = null;
		switch (e.kind) {
			case 'clock': if (e.what === 'start') { d.clockStart = e.t; d.minute = 0; } break;
			case 'reach': reach(e, e.value); break;
			case 'out': out(e); break;
			case 'runner': { const i = e.base - 1; const r = d.bases[i]; if (!r) break;
				if (e.what === 'courtesy') { const p = kbPlayer(kbTeam(g.teams[side()].teamId), r); const sub = p ? d.lastOutBy[side()][p.gender] : null; if (sub && sub !== r) { d.bases[i] = sub; d.notice = `${kbFirst(kbPlayer(kbTeam(g.teams[side()].teamId), sub).name)} runs for ${kbFirst(p.name)}`; } else d.notice = 'No one has made an out for that spot yet'; break; }
				d.bases[i] = null;
				/* e.rbi = the kicker whose play this runner movement belongs to (from the Runners row) */
				if (e.what === 'score') { run(r, e.rbi); afterRuns(); }
				else if (e.what === 'out') { d.outs += 1; recordOut({ player:r === true ? null : r }); if (d.outs >= S.outsPerHalf) endHalf(); }
				else if (e.what === 'advance') { if (i + 1 >= 3) { run(r, e.rbi); afterRuns(); } else d.bases[i + 1] = r; }
				else if (e.what === 'to') { const to = Number(e.to); if (to >= 4) { run(r, e.rbi); afterRuns(); } else if (to > i + 1 && !d.bases[to - 1]) d.bases[to - 1] = r; else d.bases[i] = r; }
				break; }
			case 'halfEnd': endHalf(); break;
			case 'set': if (e.what === 'score') d.score[e.side] = e.value; if (e.what === 'outs') d.outs = e.value; break;
		}
		d.capOn = capApplies();
		kbCheckWalkoff(d, cfg);
		d.log.push({ ...e, label:kbEventLabel(e, g), after:`${d.score.away}–${d.score.home}` });
	}
	if (g.status === 'final' && !d.final) { d.final = true; d.finalReason = 'Final'; }
	return d;
}
/* Bottom of the last inning (or overtime) and home takes the lead: game over. */
function kbCheckWalkoff(d, cfg) {
	if (d.final || d.half !== 'bottom') return;
	const S = cfg.structure, K = cfg.clock;
	const isLast = d.overtime || (K ? (d.lastInning != null && d.inning >= d.lastInning) : (S.innings != null && d.inning >= S.innings));
	if (isLast && d.score.home > d.score.away) { d.final = true; d.finalReason = 'Final — home leads'; }
}

/* Where each runner is forced to when the kicker takes base n: a runner must  */
/* vacate his base exactly when the runner behind him needs it. Runners not    */
/* forced keep their base (target === current). Returns [{ runner, from,       */
/* target }] in base order; target 4 = home.                                   */
function kbForcedTargets(bases, n) {
	const out = []; let behind = n;
	for (let i = 0; i < 3; i++) { const r = bases[i]; if (!r) continue; const target = Math.max(i + 1, behind + 1); out.push({ runner:r, from:i + 1, target }); behind = target; }
	return out;
}

/* Called right after a half ends. Decides mercy, time, ties and overtime.    */
function kbCheckEnd(d, cfg, g) {
	const S = cfg.structure, R = cfg.rules || {}, K = cfg.clock, mode = d.mode;
	const diff = Math.abs(d.score.away - d.score.home), tie = diff === 0;
	const completed = d.half === 'top' ? d.inning - 1 : 0;      /* a full inning just completed */
	const homeLeads = d.score.home > d.score.away;
	/* mercy tiers for this mode */
	const tiers = R.mercy && R.mercy[mode];
	if (tiers && completed && tiers.some(t => completed >= t.after && diff >= t.diff)) { d.final = true; d.finalReason = `Mercy rule — up ${diff} after ${completed}`; return; }
	/* time: the inning in progress at the limit is the last, and is completed */
	const timeUp = K ? (d.lastInning != null) : (S.innings != null && d.inning > S.innings);
	const lastInningDone = K ? (d.lastInning != null && d.half === 'top' && d.inning > d.lastInning) : (S.innings != null && d.half === 'top' && d.inning > S.innings);
	const ties = typeof S.tiesAllowed === 'object' ? S.tiesAllowed[mode] : !!S.tiesAllowed;
	if (lastInningDone || (d.overtime && d.half === 'top')) {
		if (!tie) { d.final = true; d.finalReason = 'Final'; return; }
		if (ties) { d.final = true; d.finalReason = 'Final — tie'; return; }
		if (R.overtime && R.overtime[mode]) { if (!d.overtime) d.notice = 'Tied — overtime, last out starts on second'; d.overtime = true; return; }
		d.final = true; d.finalReason = 'Final — tie'; return;
	}
	/* bottom of the last inning and home already leads: no need to finish */
	if (timeUp && d.half === 'bottom' && (d.lastInning == null || d.inning >= d.lastInning) && homeLeads) { d.final = true; d.finalReason = 'Final — home leads'; }
}

function kbDeriveRounds(g, cfg) {
	const S = cfg.structure, R = cfg.rules || {};
	const d = { mode:g.mode || 'season', score:{ away:0, home:0 }, round:1, rounds:[], pa:{ away:0, home:0 }, stats:{ away:{}, home:{} }, final:false, finalReason:'', notice:'', log:[] };
	for (const e of g.events) {
		if (d.final && e.kind !== 'set') continue;
		if (e.kind === 'round') {
			const pts = s => e[s].in * 3 + e[s].on * 1;
			const a = pts('away'), h = pts('home');
			let net = { away:0, home:0 };
			if (cfg.scoring.mode === 'cancellation') { if (a > h) net.away = a - h; else if (h > a) net.home = h - a; } else net = { away:a, home:h };
			for (const s of ['away', 'home']) { d.score[s] += net[s]; if (R.bust && R.bust.enabled && d.score[s] > S.pointsToWin) d.score[s] = R.bust.resetTo; }
			d.rounds.push({ n:d.round, away:e.away, home:e.home, net, after:{ ...d.score } });
			d.round += 1;
			for (const s of ['away', 'home']) { const o = kbOther(s); if (d.score[s] >= S.pointsToWin && d.score[s] - d.score[o] >= S.winBy) { d.final = true; d.finalReason = `Final — ${g.teams[s].name} wins`; } }
		}
		if (e.kind === 'set' && e.what === 'score') d.score[e.side] = e.value;
		d.log.push({ ...e, label:kbEventLabel(e, g), after:`${d.score.away}–${d.score.home}` });
	}
	if (g.status === 'final' && !d.final) { d.final = true; d.finalReason = 'Final'; }
	return d;
}

function kbEventLabel(e, g = kbState.game) {
	const cfg = kbSport(g); const a = cfg && cfg.actions.find(x => x.id === e.actionId);
	const who = e.player ? (kbPlayer(kbTeam(g.teams[e.side]?.teamId), e.player)?.name || '') : '';
	const pre = who ? `${kbFirst(who)}: ` : '';
	if (a) { const o = e.outAt ? ` — ${e.outAt.runner === 'anon' ? 'runner' : kbFirst(kbPlayer(kbTeam(g.teams[e.side]?.teamId), e.outAt.runner)?.name || 'runner')} out at ${['', '1st', '2nd', '3rd', 'home'][e.outAt.base]}` : ''; return pre + a.label + o; }
	if (e.kind === 'runner') return `Runner on ${e.base}: ${e.what}`;
	if (e.kind === 'halfEnd') return 'End of half';
	if (e.kind === 'clock') return 'Clock started';
	if (e.kind === 'set') return `Set ${e.what} to ${e.value}`;
	if (e.kind === 'round') return `Round: A ${e.away.in}/${e.away.on} · B ${e.home.in}/${e.home.on}`;
	return e.kind;
}

/* ========================================================================== */
/* SEASON STATS — aggregate a team's players across saved games              */
/* ========================================================================== */
function kbSeasonStats(teamId) {
	const totals = {}; let games = 0;
	for (const g of kbState.games) {
		for (const s of ['away', 'home']) {
			if (g.teams[s].teamId !== teamId) continue;
			games += 1; const d = kbDerive(g);
			for (const [pid, st] of Object.entries(d.stats[s])) { const t = totals[pid] || (totals[pid] = { g:0, pa:0, h:0, r:0, rbi:0, out:0, reached:0 }); t.g += 1; for (const k of ['pa', 'h', 'r', 'rbi', 'out', 'reached']) t[k] += st[k]; }
		}
	}
	return { games, totals };
}
function kbObp(s) { return s.pa ? (s.reached / s.pa).toFixed(3).replace(/^0/, '') : '.000'; }

/* ========================================================================== */
/* CAPTAIN — attendance, lineup (with shared slots), positions               */
/* ========================================================================== */
/* Captain edits act on kbCaptainGame(): the live game, or a scheduled game's prep. */
function kbToggleHere(pid) {
	const g = kbCaptainGame(), t = g.teams[kbState.side];
	t.attendance[pid] = !t.attendance[pid];
	if (t.attendance[pid] && !t.lineup.some(slot => kbSlotIds(slot).includes(pid))) t.lineup.push(pid);
	const s = kbSched(kbState.prepId); if (s) { s.availability = s.availability || {}; s.availability[pid] = t.attendance[pid] ? 'in' : 'out'; }
	kbSave(); kbRender();
}
function kbSlotIndexOf(t, activeSlot) { const ids = kbSlotIds(activeSlot); return t.lineup.findIndex(slot => kbSlotIds(slot).some(id => ids.includes(id))); }
function kbMoveLineup(index, delta) {
	const g = kbCaptainGame(), t = g.teams[kbState.side]; const active = kbActiveLineup(kbState.side, g);
	const a = active[index], b = active[index + delta]; if (!a || !b) return;
	const ia = kbSlotIndexOf(t, a), ib = kbSlotIndexOf(t, b);
	[t.lineup[ia], t.lineup[ib]] = [t.lineup[ib], t.lineup[ia]];
	kbSave(); kbRender();
}
function kbBalancedLineup(team, ids) {
	const w = ids.filter(id => kbPlayer(team, id)?.gender === 'female'), m = ids.filter(id => kbPlayer(team, id)?.gender === 'male');
	const out = []; for (let i = 0; i < Math.max(w.length, m.length); i++) { if (w[i]) out.push(w[i]); if (m[i]) out.push(m[i]); } return out;
}
function kbBalance() {
	const g = kbCaptainGame(), t = g.teams[kbState.side]; const team = kbTeam(t.teamId);
	const activeIds = kbActiveLineup(kbState.side, g).flatMap(kbSlotIds), rest = t.lineup.flatMap(kbSlotIds).filter(id => !t.attendance[id]);
	t.lineup = kbBalancedLineup(team, activeIds).concat(rest);
	kbSave(); kbRender(); kbToast('Lineup balanced');
}
/* share: tap Share on a row, then tap the row to pair with; they become one slot */
function kbShare(index) {
	const g = kbCaptainGame(), t = g.teams[kbState.side]; const active = kbActiveLineup(kbState.side, g);
	if (kbState.share == null) { kbState.share = index; kbRender(); kbToast('Now tap the spot to share with'); return; }
	if (kbState.share === index) { kbState.share = null; kbRender(); return; }
	const a = active[kbState.share], b = active[index];
	const ids = [...kbSlotIds(a), ...kbSlotIds(b)];
	if (ids.length > 2) { kbToast('A spot can be shared by two'); kbState.share = null; kbRender(); return; }
	const ia = kbSlotIndexOf(t, a), ib = kbSlotIndexOf(t, b);
	t.lineup[Math.min(ia, ib)] = { share:ids }; t.lineup.splice(Math.max(ia, ib), 1);
	kbState.share = null; kbSave(); kbRender(); kbToast('Sharing one spot');
}
function kbUnshare(index) {
	const g = kbCaptainGame(), t = g.teams[kbState.side]; const active = kbActiveLineup(kbState.side, g);
	const slot = active[index]; const i = kbSlotIndexOf(t, slot); const ids = kbSlotIds(t.lineup[i]);
	t.lineup.splice(i, 1, ...ids);
	kbSave(); kbRender();
}
function kbAssign(position, pid) {
	const t = kbCaptainGame().teams[kbState.side];
	for (const p of Object.keys(t.assignments)) if (t.assignments[p] === pid) delete t.assignments[p]; /* one spot per player */
	if (pid) t.assignments[position] = pid; else delete t.assignments[position];
	kbSave(); kbRender();
}
function kbLineupWarnings(side, g = kbState.game) {
	const cfg = kbSport(g), T = cfg.team; if (!T) return [];
	const team = kbTeam(g.teams[side].teamId); const active = kbActiveLineup(side, g); const w = [];
	const ids = active.flatMap(kbSlotIds); const women = ids.filter(id => kbPlayer(team, id)?.gender === 'female').length;
	if (ids.length < T.minPlayers) w.push({ text:`${ids.length} here — need ${T.minPlayers} to start`, rows:[] });
	if (T.minWomen && women < T.minWomen) w.push({ text:`Need at least ${T.minWomen} woman to start`, rows:[] });
	if (T.coed?.noBackToBackMen && active.length > 1) active.forEach((slot, i) => {
		const next = active[(i + 1) % active.length];
		const male = s => kbSlotIds(s).every(id => kbPlayer(team, id)?.gender === 'male');
		if (male(slot) && male(next)) w.push({ text:`Back-to-back men: ${kbSlotIds(slot).map(id => kbFirst(kbPlayer(team, id).name)).join('/')} then ${kbSlotIds(next).map(id => kbFirst(kbPlayer(team, id).name)).join('/')} — an automatic out is recorded between them${T.coed.splitSlots ? '; or share one spot' : ''}`, rows:[i, (i + 1) % active.length] });
	});
	return w;
}
function kbDefenseWarnings(side, g = kbState.game) {
	const cfg = kbSport(g), T = cfg.team; if (!T) return [];
	const team = kbTeam(g.teams[side].teamId); const A = g.teams[side].assignments; const ids = Object.values(A).filter(Boolean); const w = [];
	const men = ids.filter(id => kbPlayer(team, id)?.gender === 'male').length;
	const infield = (T.infield || []).filter(pos => A[pos]).length;
	if (ids.length > T.maxFielders) w.push(`${ids.length} on the field — max ${T.maxFielders}`);
	if (T.maxMenOnField && men > T.maxMenOnField) w.push(`${men} men on the field — max ${T.maxMenOnField}`);
	if (T.maxInfielders && infield > T.maxInfielders) w.push(`${infield} infielders — max ${T.maxInfielders} including the catcher`);
	if (ids.length && ids.length < T.minPlayers) w.push(`${ids.length} fielders — need ${T.minPlayers}`);
	return w;
}

/* ========================================================================== */
/* TEAMS — rosters                                                            */
/* ========================================================================== */
function kbNewTeam(form) {
	const name = form.querySelector('[name="name"]').value.trim(); if (!name) { kbToast('Give the team a name'); return; }
	const id = kbSlug(name) + '-' + Date.now().toString(36).slice(-4);
	kbState.teams.push({ id, name, short:name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 4), sport:form.querySelector('[name="sport"]').value, roster:[] });
	form.reset(); kbState.teamId = id; kbSave(); kbGo('team');
}
function kbAddPlayer(form) {
	const team = kbTeam(kbState.teamId); const name = form.querySelector('[name="name"]').value.trim(); if (!team || !name) return;
	const gender = form.querySelector('[name="gender"]:checked')?.value || 'female';
	team.roster.push({ id:kbSlug(name) + '-' + Date.now().toString(36).slice(-3), name, gender });
	form.reset(); kbSave(); kbRender(); kbToast(`Added ${name}`);
}
function kbSetGender(pid, gender) { const p = kbPlayer(kbTeam(kbState.teamId), pid); if (p) { p.gender = gender; kbSave(); kbRender(); } }
function kbRemovePlayer(pid) { const team = kbTeam(kbState.teamId); team.roster = team.roster.filter(p => p.id !== pid); kbSave(); kbRender(); }

/* ========================================================================== */
/* RENDER                                                                     */
/* ========================================================================== */
function kbRender() {
	const v = kbState.view;
	clearInterval(kbTicker); kbTicker = null;
	kbRenderMeBar();
	if (v === 'home') kbRenderHome();
	if (v === 'ump') kbRenderUmp();
	if (v === 'captain') kbRenderCaptain();
	if (v === 'teams') kbRenderTeams();
	if (v === 'team') kbRenderTeam();
	if (v === 'stats') kbRenderStats();
	if (v === 'league') kbRenderLeague();
	if (v === 'player') kbRenderPlayer();
	kbApplyPerms();
}

/* ---------- me bar + switcher ------------------------------------------- */
function kbRenderMeBar() {
	const bar = document.querySelector('.me-bar'); if (!bar) return;
	bar.innerHTML = `<button type="button" class="me-pill" data-action="switch" aria-haspopup="dialog" aria-controls="switch" aria-label="Signed in as ${kbEscape(kbMeLabel())} — tap to switch"><span class="me-dot is-${kbMeRole()}" aria-hidden="true"></span>${kbEscape(kbMeLabel())}</button>${kbState.league ? `<span class="me-league">${kbEscape(kbState.league.name)} · ${kbEscape(kbState.league.season)}</span>` : ''}`;
}
function kbRenderWhoami() {
	const host = document.querySelector('.whoami'); if (!host) return;
	const me = kbState.me, role = kbMeRole(), L = kbState.league, team = kbMeTeam();
	const teams = kbState.teams.filter(t => t.roster.length);
	let ctx = '';
	if (['captain', 'lead', 'player'].includes(role)) ctx += `<div class="field"><label for="me-team">Team</label><select id="me-team" data-action="me-team">${teams.map(t => `<option value="${t.id}" ${t.id === me.teamId ? 'selected' : ''}>${kbEscape(t.name)}</option>`).join('')}</select></div>`;
	if (['lead', 'player'].includes(role) && team) ctx += `<div class="field"><label for="me-player">I am</label><select id="me-player" data-action="me-player">${team.roster.map(p => `<option value="${p.id}" ${p.id === me.playerId ? 'selected' : ''}>${kbEscape(p.name)}</option>`).join('')}</select></div>`;
	if (role === 'ump' && L) ctx += `<div class="field"><label for="me-ump">I am</label><select id="me-ump" data-action="me-ump">${L.umpires.map(u => `<option value="${u.id}" ${u.id === me.umpId ? 'selected' : ''}>${kbEscape(u.name)}</option>`).join('')}</select></div>`;
	host.innerHTML = `<div class="switch-head"><p class="eyebrow" id="whoami-heading">Switch who this phone is (stands in for sign-in)</p><button type="button" class="drawer-close key is-ghost" data-action="switch-close" aria-label="Close">×</button></div>
		<div class="seg is-roles" role="group" aria-labelledby="whoami-heading">${Object.entries(KB_ROLES).map(([id, r]) => `<button type="button" class="${id === role ? 'is-on' : ''}" data-action="role" data-role="${id}" aria-pressed="${id === role}">${r.label}</button>`).join('')}</div>
		${ctx ? `<div class="field-pair whoami-ctx">${ctx}</div>` : ''}
		<p class="hint">${{ league:'Sets the rules, approves teams, assigns umps.', ump:'Keeps score for the games assigned to you.', captain:`Runs the roster and lineup${team && team.captain ? ' · captain is ' + kbEscape(kbPlayer(team, team.captain)?.name || '') : ''}. Can name a lead for a game.`, lead:'Runs the lineup for one game when the captain can’t.', player:'Says in or out for each game; can watch live; can sign up as a free agent.' }[role]}</p>`;
}

/* Home is role-aware: what this person needs to do today, then the shared bits. */
function kbRenderRoleHome() {
	const host = document.querySelector('.role-home'); if (!host) return;
	const role = kbMeRole(), me = kbState.me, L = kbState.league, team = kbMeTeam();
	const live = (s) => s.gameId && kbState.game && kbState.game.id === s.gameId;
	const gameRow = (s, extra = '') => `<li class="sched-row ${s.status === 'live' ? 'is-live' : ''}"><span class="sched-when">${kbEscape(kbSchedDate(s))}${s.field ? ' · ' + kbEscape(s.field) : ''}</span><span class="sched-who">${kbEscape(kbSchedName(s, 'away'))} <em>@</em> ${kbEscape(kbSchedName(s, 'home'))}</span>${extra}</li>`;
	let html = '';
	if (role === 'league' && L) {
		const pending = Object.values(L.teams).filter(s => s === 'pending').length, noUmp = kbUpcoming().filter(s => !s.ump).length;
		html = `<section class="role-card"><p class="eyebrow">League</p><h2>${kbEscape(L.name)} · ${kbEscape(L.season)}</h2>
			<p class="hint">${Object.values(L.teams).filter(s => s === 'approved').length} teams${pending ? ` · <strong>${pending} waiting for approval</strong>` : ''}${noUmp ? ` · <strong>${noUmp} game${noUmp > 1 ? 's' : ''} without an ump</strong>` : ''}</p>
			<div class="pad-bar is-2"><button type="button" class="key is-primary" data-action="league">League admin</button><button type="button" class="key is-ghost" data-action="teams">Teams &amp; rosters</button></div></section>
			${kbStandingsHTML()}`;
	}
	if (role === 'ump' && L) {
		const mine = kbUpcoming().filter(s => s.ump && s.ump === me.umpId);
		html = `<section class="role-card"><p class="eyebrow">Your games</p>
			<ul class="sched-list">${mine.map(s => gameRow(s, `<button type="button" class="key ${live(s) ? 'is-primary' : s.status === 'live' ? 'is-ghost' : 'is-primary'}" data-action="start-sched" data-sched="${s.id}">${live(s) ? 'Continue' : s.status === 'live' ? 'In progress' : 'Start'}</button>`)).join('') || '<li class="is-empty">Nothing assigned to you yet — the league assigns umps</li>'}</ul></section>`;
	}
	if ((role === 'captain' || role === 'lead') && team) {
		const next = kbNextSched(team.id);
		if (next) {
			const c = kbAvailCounts(next, team.id), leadId = (next.lead || {})[team.id], lead = leadId && kbPlayer(team, leadId);
			const iLead = role === 'lead' && leadId === me.playerId;
			const fa = kbFreeAgents(next, team.id);
			html = `<section class="role-card"><p class="eyebrow">Next game · ${kbEscape(team.name)}</p>
				<ul class="sched-list">${gameRow(next)}</ul>
				<p class="hint"><strong class="is-in">${c.in} in</strong> · <strong class="is-out">${c.out} out</strong> · ${c.unknown} haven’t said</p>
				${role === 'lead' && !iLead ? `<p class="warn">${lead ? kbEscape(lead.name) + ' leads this game' : 'No lead named for this game'} — only the lead edits the lineup.</p>` : ''}
				<div class="pad-bar is-2"><button type="button" class="key is-primary" data-action="prep" data-sched="${next.id}" data-team="${team.id}" data-scope="${team.id}">${live(next) ? 'Lineup (live)' : 'Set the lineup'}</button>${role === 'captain' ? `<button type="button" class="key is-ghost" data-action="team" data-team="${team.id}">Roster</button>` : ''}</div>
				${role === 'captain' ? `<div class="field lead-field"><label for="lead-${next.id}">Lead for this game <small>(if you can’t make it)</small></label><select id="lead-${next.id}" data-action="set-lead" data-sched="${next.id}" data-team="${team.id}" data-scope="${team.id}"><option value="">Me — ${kbEscape(kbPlayer(team, team.captain)?.name || 'captain')}</option>${team.roster.filter(p => p.id !== team.captain).map(p => `<option value="${p.id}" ${leadId === p.id ? 'selected' : ''}>${kbEscape(p.name)}</option>`).join('')}</select></div>` : ''}
				<details class="recruit"><summary>Free agents · ${fa.length}</summary>
					<p class="hint">${c.in < (kbSport({ sport:L.sport }).team?.minPlayers || 6) ? 'You’re short — ' : ''}players on other teams who said they’ll fill in.</p>
					<ul class="roster-list is-edit">${fa.map(p => `<li class="roster-row"><span class="roster-name">${kbEscape(p.name)} <small>${kbEscape(p.from.short)}</small></span><span class="chip-tag is-${p.gender}">${p.gender === 'male' ? 'M' : 'W'}</span><button type="button" class="key is-ghost" data-action="recruit" data-sched="${next.id}" data-team="${team.id}" data-scope="${team.id}" data-player="${p.id}" data-from="${p.from.id}">Add</button></li>`).join('') || '<li class="is-empty">No free agents right now</li>'}</ul>
				</details>
			</section>
			<section class="role-card"><p class="eyebrow">Who’s in</p><ul class="avail-list">${team.roster.map(p => { const v = (next.availability || {})[p.id]; return `<li class="avail-row"><span class="roster-name">${kbEscape(p.name)}${p.guest ? ' <small>guest</small>' : ''}</span><span class="seg">${['in', 'out'].map(x => `<button type="button" class="${v === x ? 'is-on is-' + x : ''}" data-action="avail" data-sched="${next.id}" data-player="${p.id}" data-value="${x}" aria-pressed="${v === x}">${x === 'in' ? 'In' : 'Out'}</button>`).join('')}</span></li>`; }).join('')}</ul></section>`;
		} else html = `<section class="role-card"><p class="eyebrow">${kbEscape(team.name)}</p><p class="hint">No games scheduled. The league adds games.</p><div class="pad-bar is-2">${role === 'captain' ? `<button type="button" class="key is-ghost" data-action="team" data-team="${team.id}">Roster</button>` : ''}</div></section>`;
	}
	if (role === 'player') { html = `<section class="role-card"><p class="eyebrow">You</p><div class="pad-bar is-2"><button type="button" class="key is-primary" data-action="player">My page</button></div></section>`; }
	if (false) {
		const p = kbPlayer(team, me.playerId); const games = kbUpcoming(team.id).slice(0, 4);
		const watch = kbState.game && kbState.game.status === 'live' ? `<section class="role-card is-live"><p class="eyebrow">Live now</p><p class="sched-who">${kbEscape(kbState.game.teams.away.name)} <strong>${kbDerive().score.away}</strong> – <strong>${kbDerive().score.home}</strong> ${kbEscape(kbState.game.teams.home.name)}</p><div class="pad-bar is-2"><button type="button" class="key is-primary" data-action="go" data-to="ump">Watch</button></div></section>` : '';
		html = `${watch}<section class="role-card"><p class="eyebrow">Can you make it? · ${kbEscape(team.name)}</p>
			<ul class="sched-list">${games.map(s => { const v = (s.availability || {})[p?.id]; return gameRow(s, `<span class="seg">${['in', 'out'].map(x => `<button type="button" class="${v === x ? 'is-on is-' + x : ''}" data-action="avail" data-sched="${s.id}" data-player="${p?.id}" data-value="${x}" aria-pressed="${v === x}">${x === 'in' ? 'In' : 'Out'}</button>`).join('')}</span>`); }).join('') || '<li class="is-empty">No games scheduled yet</li>'}</ul>
			${p ? `<label class="toggle-row"><span>Free agent <small>— other teams can ask me to fill in</small></span><button type="button" class="switch ${p.freeAgent ? 'is-on' : ''}" role="switch" aria-checked="${!!p.freeAgent}" data-action="free-agent" data-player="${p.id}" data-team="${team.id}"><i></i></button></label>` : ''}
		</section>`;
	}
	host.innerHTML = html;
}
function kbStandingsHTML() {
	const rows = kbStandings(); if (!rows.length) return '';
	return `<section class="role-card"><p class="eyebrow">Standings</p><div class="linescore is-open"><table><thead><tr><th>Team</th><th>W</th><th>L</th><th>T</th><th>RF</th><th>RA</th></tr></thead><tbody>${rows.map(r => `<tr><th>${kbEscape(r.team.name)}</th><td>${r.w}</td><td>${r.l}</td><td>${r.t}</td><td>${r.rf}</td><td>${r.ra}</td></tr>`).join('')}</tbody></table></div></section>`;
}

function kbRenderHome() {
	kbRenderRoleHome();
	const form = document.querySelector('.new-game'); if (form) form.hidden = !kbCan('start-game');
	const links = document.querySelector('.home-links'); if (links) links.hidden = kbMeRole() === 'league';
	const sel = document.querySelector('select[name="sport"]');
	if (sel && !sel.options.length) Object.values(KB_SPORTS).forEach(s => sel.add(new Option(s.name, s.id)));
	const modeSel = document.querySelector('select[name="mode"]');
	if (modeSel && sel) { const cfg = KB_SPORTS[sel.value] || Object.values(KB_SPORTS)[0]; const cur = modeSel.value; modeSel.innerHTML = ''; Object.entries(cfg.modes || { season:'Regular season' }).forEach(([id, label]) => modeSel.add(new Option(label, id))); if ([...modeSel.options].some(o => o.value === cur)) modeSel.value = cur; }
	['away', 'home'].forEach(s => {
		const ts = document.querySelector(`select[name="${s}-team"]`); if (!ts) return;
		const cur = ts.value; ts.innerHTML = '<option value="">No roster — just a name</option>';
		kbState.teams.forEach(t => ts.add(new Option(t.name, t.id)));
		ts.value = cur;
	});
	const cont = document.querySelector('.continue-card');
	if (cont) {
		const g = kbState.game; cont.hidden = !g;
		if (g) { const d = kbDerive(); cont.querySelector('[data-field="teams"]').textContent = `${g.teams.away.name} ${d.score.away} – ${d.score.home} ${g.teams.home.name}`; cont.querySelector('[data-field="status"]').textContent = g.status === 'final' ? 'Final — tap to review' : (kbSport(g).structure.kind === 'innings' ? `${d.half === 'top' ? 'Top' : 'Bottom'} ${d.inning}` : `Round ${d.round}`); }
	}
	const recent = document.querySelector('.recent');
	if (recent) recent.innerHTML = kbState.games.slice(0, 5).map(g => { const d = kbDerive(g); return `<li><span>${kbEscape(g.teams.away.name)} <strong>${d.score.away}</strong> – <strong>${d.score.home}</strong> ${kbEscape(g.teams.home.name)}</span><span class="recent-date">${new Date(g.startedAt).toLocaleDateString([], { month:'short', day:'numeric' })}</span></li>`; }).join('') || '<li class="is-empty">No games saved yet</li>';
}

function kbRenderUmp() {
	const g = kbState.game, cfg = kbSport(), host = document.querySelector('.ump');
	if (!g || !host) { if (host) host.innerHTML = '<p class="empty">No game. <button type="button" class="key is-ghost" data-action="go" data-to="home">Home</button></p>'; return; }
	const d = kbDerive();
	host.dataset.sport = g.sport; host.dataset.final = d.final;
	const watching = !kbCan('score');
	host.innerHTML = (watching ? `<p class="watching"><button type="button" class="key is-ghost back" data-action="go" data-to="home" aria-label="Home">←</button> Watching · ${kbEscape(KB_ROLES[kbMeRole()].label)}s can’t change the score</p>` : '') + (cfg.structure.kind === 'innings' ? kbUmpInnings(g, cfg, d) : kbUmpRounds(g, cfg, d));
	/* tick the clock without re-rendering the screen */
	if (cfg.clock && d.clockStart != null && !d.final) {
		const tick = () => { const el = document.querySelector('.clock-value'); if (!el) return; const ms = Date.now() - d.clockStart; el.textContent = kbMMSS(ms); const m = ms / 60000; el.closest('.state-item')?.classList.toggle('is-late', m >= cfg.clock.capUntil); el.closest('.state-item')?.classList.toggle('is-over', m >= cfg.clock.minutes); };
		tick(); kbTicker = setInterval(tick, 1000);
	}
}

function kbDots(n, max, cls) { return `<span class="dots ${cls}" aria-label="${n} of ${max}">${Array.from({ length:max }, (_, i) => `<i class="${i < n ? 'is-on' : ''}"></i>`).join('')}</span>`; }

function kbFixRowHTML(d, g) {
	const f = kbState.fix; if (!f) return '';
	const label = f === 'outs' ? 'Outs' : `${g.teams[f].name} score`, value = f === 'outs' ? d.outs : d.score[f], what = f === 'outs' ? 'outs' : 'score';
	return `<div class="fix-row" role="group" aria-label="Correct ${kbEscape(label)}">
		<span class="fix-label">Fix ${kbEscape(label)}</span>
		<button type="button" class="key is-fix" data-action="nudge" data-what="${what}" data-side="${f}" data-delta="-1" aria-label="minus one">−</button>
		<strong class="fix-value">${value}</strong>
		<button type="button" class="key is-fix" data-action="nudge" data-what="${what}" data-side="${f}" data-delta="1" aria-label="plus one">+</button>
		<button type="button" class="key is-ghost" data-action="fix-done">Done</button>
	</div>`;
}
/* RUNNERS ROW : shown right after a hit with runners on. The force has already */
/* been applied; each runner defaults to "held". Taps are runner events tagged  */
/* with the kicker so runs credit an RBI. Home runs never need this.            */
function kbResolveHTML(g, d, batting) {
	const R = kbState.resolve; if (!R || d.final) return '';
	const team = kbTeam(g.teams[batting].teamId);
	const name = (r) => r === true ? 'Runner' : (kbPlayer(team, r) ? kbFirst(kbPlayer(team, r).name) : 'Runner');
	const rows = [3, 2, 1].map(b => ({ b, r:d.bases[b - 1] })).filter(x => x.r);
	const forcedHome = (d.lastPlay && d.lastPlay.forced.filter(f => f.target >= 4)) || [];
	if (rows.length < 2 && !forcedHome.length) return '';
	const baseWord = ['', '1st', '2nd', '3rd', 'home'];
	const rbi = R.kicker ? `data-rbi="${R.kicker}"` : '';
	return `<div class="resolve" role="group" aria-label="Where did the runners end up?">
		<p class="resolve-head">Runners on the play <span>held unless you say otherwise</span></p>
		${forcedHome.map(f => `<div class="resolve-row is-forced">
			<span class="resolve-who">${kbEscape(name(f.runner))} <em>scored on the force</em></span>
			<span class="resolve-opts"><button type="button" class="is-out" data-action="play-out" data-runner="${f.runner === true ? 'anon' : f.runner}" data-base="4">Out at home</button></span>
		</div>`).join('')}
		${rows.map(({ b, r }) => `<div class="resolve-row">
			<span class="resolve-who">${baseWord[b]} · ${kbEscape(name(r))}${R.kicker && r === R.kicker ? ' <em>kicker</em>' : ''}</span>
			<span class="resolve-opts">
				${[b + 1, b + 2].filter(to => to <= 3 && !d.bases[to - 1]).map(to => `<button type="button" data-action="runner" data-base="${b}" data-what="to" data-to="${to}" ${rbi}>${baseWord[to]}</button>`).join('')}
				<button type="button" class="is-score" data-action="runner" data-base="${b}" data-what="score" ${rbi}>Scored</button>
				<button type="button" class="is-out" data-action="runner" data-base="${b}" data-what="out">Out</button>
			</span>
		</div>`).join('')}
		<button type="button" class="key is-ghost resolve-done" data-action="resolve-done">Done — all held</button>
	</div>`;
}
/* FIELDER'S CHOICE : "who was out?" — the forced runners at the base they were  */
/* forced to. One tap records the whole play as a single reach event.           */
function kbFcHTML(g, d, batting) {
	const P = kbState.fc; if (!P) return '';
	const team = kbTeam(g.teams[batting].teamId);
	const name = (r) => r === true ? 'Runner' : (kbPlayer(team, r) ? kbFirst(kbPlayer(team, r).name) : 'Runner');
	const baseWord = ['', '1st', '2nd', '3rd', 'home'];
	const forced = P.forced.filter(f => f.target !== f.from);
	return `<div class="resolve is-fc" role="group" aria-label="Fielder's choice: who was out?">
		<p class="resolve-head">Fielder’s choice <span>kicker safe at first — who was out?</span></p>
		${forced.map(f => `<div class="resolve-row">
			<span class="resolve-who">${kbEscape(name(f.runner))} <em>${baseWord[f.from]} → ${baseWord[f.target]}</em></span>
			<span class="resolve-opts"><button type="button" class="is-out" data-action="fc-out" data-runner="${f.runner === true ? 'anon' : f.runner}" data-base="${f.target}">Out at ${baseWord[f.target]}</button></span>
		</div>`).join('') || '<p class="hint">No runner was forced — this is just a reach.</p>'}
		<div class="resolve-foot">
			<button type="button" class="key is-ghost" data-action="fc-cancel">Cancel</button>
			<button type="button" class="key is-ghost" data-action="fc-out">Nobody — all safe</button>
		</div>
	</div>`;
}
function kbBoxScoreHTML(g, d, side) {
	const team = kbTeam(g.teams[side].teamId); if (!team) return '';
	const rows = Object.entries(d.stats[side]).map(([pid, s]) => ({ p:kbPlayer(team, pid), s })).filter(r => r.p).sort((a, b) => b.s.pa - a.s.pa || a.p.name.localeCompare(b.p.name));
	if (!rows.length) return '';
	return `<details class="linescore box"><summary>${kbEscape(team.name)} box score</summary><table><thead><tr><th>Player</th><th>PA</th><th>H</th><th>R</th><th>RBI</th><th>OBP</th></tr></thead><tbody>${rows.map(r => `<tr><th>${kbEscape(r.p.name)}</th><td>${r.s.pa}</td><td>${r.s.h}</td><td>${r.s.r}</td><td>${r.s.rbi}</td><td>${kbObp(r.s)}</td></tr>`).join('')}</tbody></table></details>`;
}

function kbUmpInnings(g, cfg, d) {
	const S = cfg.structure, K = cfg.clock, R = cfg.rules || {};
	const batting = d.half === 'top' ? 'away' : 'home';
	const innings = Math.max(S.innings || 7, d.inning);
	const cell = (side, i) => { const v = d.line[side][i]; const cur = (i + 1 === d.inning && side === batting && !d.final); return `<td class="${cur ? 'is-current' : ''}">${v ?? (i + 1 < d.inning || (i + 1 === d.inning && side === 'away' && d.half === 'bottom') ? 0 : '')}</td>`; };
	const kicker = kbCurrentKicker(batting), next = kbNextKickers(batting);
	const team = (s) => kbTeam(g.teams[s].teamId);
	const lw = team(batting) ? kbLineupWarnings(batting) : [];
	const runnerName = (r) => r === true ? '' : (kbPlayer(team(batting), r)?.name ? kbFirst(kbPlayer(team(batting), r).name) : '');
	const modeLabel = cfg.modes && cfg.modes[d.mode] ? cfg.modes[d.mode] : '';
	const clockCell = K ? (d.clockStart == null
		? `<button type="button" class="state-item" data-action="clock-start"><span class="state-label">Clock</span><strong class="state-value clock-value">Start</strong></button>`
		: `<div class="state-item ${d.minute >= K.capUntil ? 'is-late' : ''} ${d.minute >= K.minutes ? 'is-over' : ''}"><span class="state-label">${d.official ? 'Official' : 'Clock'}</span><strong class="state-value clock-value">${kbMMSS(Date.now() - d.clockStart)}</strong></div>`) : '';
	return `
	<!-- ===== SCORE STRIP : both teams, tap a number to fix it ===== -->
	<header class="score-strip">
		${['away', 'home'].map(s => `
		<button type="button" class="side ${batting === s && !d.final ? 'is-batting' : ''}" data-action="fix-score" data-side="${s}" aria-label="${kbEscape(g.teams[s].name)} ${d.score[s]}, tap to correct">
			<span class="side-name">${kbEscape(g.teams[s].name)}</span>
			<span class="side-score">${d.score[s]}</span>
			<span class="side-tag">${batting === s && !d.final ? 'Kicking' : ''}</span>
		</button>`).join('')}
	</header>
	${kbFixRowHTML(d, g)}

	<!-- ===== STATE : inning · outs · clock · cap ===== -->
	<div class="state">
		<div class="state-item"><span class="state-label">${d.overtime ? 'OT' : 'Inning'}</span><strong class="state-value">${d.final ? 'F' : `${d.half === 'top' ? '▲' : '▼'} ${d.inning}`}</strong></div>
		<button type="button" class="state-item" data-action="fix-outs" aria-label="${d.outs} outs, tap to correct"><span class="state-label">Outs</span>${kbDots(d.outs, S.outsPerHalf, 'is-out')}</button>
		${clockCell}
		${R.runCap ? `<div class="state-item ${d.capOn ? '' : 'is-off'}"><span class="state-label">Cap</span><strong class="state-value">${d.capOn ? `${d.runsThisHalf}/${R.runCap.runs}` : '—'}</strong></div>` : ''}
	</div>
	<p class="mode-line">${kbEscape(modeLabel)}${d.lastInning != null && !d.final ? ' · last inning' : ''}${d.overtime ? ' · overtime' : ''}</p>

	<!-- ===== AT BAT : only when the kicking side has a lineup ===== -->
	${kicker && !d.final ? `<div class="atbat">
		<span class="atbat-label">Up</span>
		<strong class="atbat-name">${kbEscape(kicker.name)}</strong>
		<span class="atbat-next">${next.length ? 'Next: ' + next.map(p => kbEscape(kbFirst(p.name))).join(' · ') : ''}</span>
		${lw.length ? `<span class="atbat-warn">${kbEscape(lw[0].text)}</span>` : ''}
	</div>` : ''}

	<!-- ===== BASES : tap a runner ===== -->
	<div class="bases" role="group" aria-label="Runners">
		${[3, 2, 1].map(b => { const r = d.bases[b - 1]; return `<div class="base base-${b} ${r ? 'is-on' : ''}">
			<span class="base-name">${b}B${r && runnerName(r) ? ' · ' + kbEscape(runnerName(r)) : ''}</span>
			${r ? `<span class="base-actions"><button type="button" data-action="runner" data-base="${b}" data-what="advance">+1</button><button type="button" data-action="runner" data-base="${b}" data-what="score">Score</button><button type="button" data-action="runner" data-base="${b}" data-what="out">Out</button>${R.courtesyRunner && r !== true ? `<button type="button" data-action="runner" data-base="${b}" data-what="courtesy" aria-label="courtesy runner">CR</button>` : ''}</span>` : ''}
		</div>`; }).join('')}
	</div>

	${kbFcHTML(g, d, batting)}
	${kbResolveHTML(g, d, batting)}
	${d.final ? `<p class="final-banner">${kbEscape(d.finalReason)}</p>` : ''}

	<!-- ===== LINE SCORE : the paper card, legible ===== -->
	<details class="linescore">
		<summary>Line score</summary>
		<table>
			<thead><tr><th></th>${Array.from({ length:innings }, (_, i) => `<th>${i + 1}</th>`).join('')}<th>R</th></tr></thead>
			<tbody>
				<tr><th>${kbEscape(g.teams.away.name)}</th>${Array.from({ length:innings }, (_, i) => cell('away', i)).join('')}<td class="total">${d.score.away}</td></tr>
				<tr><th>${kbEscape(g.teams.home.name)}</th>${Array.from({ length:innings }, (_, i) => cell('home', i)).join('')}<td class="total">${d.score.home}</td></tr>
			</tbody>
		</table>
	</details>
	${kbBoxScoreHTML(g, d, 'away')}${kbBoxScoreHTML(g, d, 'home')}

	<!-- ===== PAD : the buttons, under the thumb ===== -->
	<div class="pad" role="group" aria-label="Record a play">
		${cfg.actions.map(a => `<button type="button" class="key ${a.size ? 'is-' + a.size : ''} is-${a.kind}" data-action="tap" data-id="${a.id}" title="${kbEscape(a.note || '')}" ${d.final ? 'disabled' : ''}>${kbEscape(a.label)}</button>`).join('')}
	</div>
	<div class="pad-bar">
		<button type="button" class="key is-undo" data-action="undo" ${g.events.some(e => !(e.kind === 'clock' && e.auto)) ? '' : 'disabled'}>Undo</button>
		<button type="button" class="key is-ghost" data-action="end-half" ${d.final ? 'disabled' : ''}>End half</button>
		<button type="button" class="key is-ghost" data-action="toggle-log" aria-expanded="${kbState.showLog}">Log · ${g.events.length}</button>
		${(team('away') || team('home')) ? `<button type="button" class="key is-ghost" data-action="captain" data-side="${team(batting) ? batting : (team('home') ? 'home' : 'away')}">Lineups</button>` : ''}
		<button type="button" class="key is-ghost" data-action="${d.final ? 'finish' : 'end-game'}">${d.final ? 'Save & done' : 'End game'}</button>
	</div>
	${kbLogHTML(d)}`;
}

function kbUmpRounds(g, cfg, d) {
	const S = cfg.structure, p = kbState.pending;
	const pts = s => p[s].in * 3 + p[s].on, bagsLeft = s => S.bagsPerSide - p[s].in - p[s].on;
	return `
	<header class="score-strip">
		${['away', 'home'].map(s => `
		<button type="button" class="side" data-action="fix-score" data-side="${s}" aria-label="${kbEscape(g.teams[s].name)} ${d.score[s]}, tap to correct">
			<span class="side-name">${kbEscape(g.teams[s].name)}</span>
			<span class="side-score">${d.score[s]}</span>
			<span class="side-tag">to ${S.pointsToWin}</span>
		</button>`).join('')}
	</header>
	${kbFixRowHTML(d, g)}
	<div class="state"><div class="state-item"><span class="state-label">Round</span><strong class="state-value">${d.final ? 'F' : d.round}</strong></div></div>
	${d.final ? `<p class="final-banner">${kbEscape(d.finalReason)}</p>` : ''}
	<div class="round" role="group" aria-label="This round">
		${['away', 'home'].map(s => `
		<div class="round-side">
			<h2 class="round-name">${kbEscape(g.teams[s].name)} <span class="round-pts">${pts(s)} pts · ${bagsLeft(s)} left</span></h2>
			<div class="counter"><span>In the hole ×3</span><button type="button" data-action="bag" data-side="${s}" data-what="in" data-delta="-1" aria-label="fewer in the hole">−</button><strong>${p[s].in}</strong><button type="button" data-action="bag" data-side="${s}" data-what="in" data-delta="1" aria-label="more in the hole">+</button></div>
			<div class="counter"><span>On the board ×1</span><button type="button" data-action="bag" data-side="${s}" data-what="on" data-delta="-1" aria-label="fewer on the board">−</button><strong>${p[s].on}</strong><button type="button" data-action="bag" data-side="${s}" data-what="on" data-delta="1" aria-label="more on the board">+</button></div>
		</div>`).join('')}
	</div>
	<p class="round-net">${cfg.scoring.mode === 'cancellation' ? `Net this round: ${Math.abs(pts('away') - pts('home'))} to ${pts('away') === pts('home') ? 'nobody' : kbEscape(g.teams[pts('away') > pts('home') ? 'away' : 'home'].name)}` : ''}</p>
	<details class="linescore"><summary>Rounds</summary>
		<table><thead><tr><th>#</th><th>${kbEscape(g.teams.away.name)}</th><th>${kbEscape(g.teams.home.name)}</th><th>Score</th></tr></thead>
		<tbody>${d.rounds.map(r => `<tr><td>${r.n}</td><td>${r.away.in}×3 + ${r.away.on} = ${r.away.in * 3 + r.away.on}</td><td>${r.home.in}×3 + ${r.home.on} = ${r.home.in * 3 + r.home.on}</td><td class="total">${r.after.away}–${r.after.home}</td></tr>`).join('') || '<tr><td colspan="4">No rounds yet</td></tr>'}</tbody></table>
	</details>
	<div class="pad pad-commit"><button type="button" class="key is-commit" data-action="score-round" ${d.final ? 'disabled' : ''}>Score round ${d.round}</button></div>
	<div class="pad-bar">
		<button type="button" class="key is-undo" data-action="undo" ${g.events.length ? '' : 'disabled'}>Undo</button>
		<button type="button" class="key is-ghost" data-action="toggle-log" aria-expanded="${kbState.showLog}">Log · ${g.events.length}</button>
		<button type="button" class="key is-ghost" data-action="${d.final ? 'finish' : 'end-game'}">${d.final ? 'Save & done' : 'End game'}</button>
	</div>
	${kbLogHTML(d)}`;
}

function kbLogHTML(d) {
	if (!kbState.showLog) return '';
	return `<ol class="log" aria-label="Play log">${d.log.slice().reverse().map(e => `<li><span>${kbEscape(e.label)}</span><span class="log-after">${e.after}</span></li>`).join('') || '<li>Nothing yet</li>'}</ol>`;
}

/* ---------- captain ------------------------------------------------------ */
function kbRenderCaptain() {
	const prep = kbState.prepId ? kbSched(kbState.prepId) : null;
	const g = kbCaptainGame(), host = document.querySelector('.captain'); if (!host) return;
	if (!g) { host.innerHTML = '<p class="empty">No game in progress. <button type="button" class="key is-ghost" data-action="go" data-to="home">Home</button></p>'; return; }
	const sides = ['away', 'home'].filter(s => kbTeam(g.teams[s].teamId));
	if (!sides.length) { host.innerHTML = '<p class="empty">Neither side has a roster attached. Start a new game and pick a team.</p>'; return; }
	if (!sides.includes(kbState.side)) kbState.side = sides[0];
	const side = kbState.side, t = g.teams[side], team = kbTeam(t.teamId), cfg = kbSport(g), T = cfg.team, tab = kbState.tab;
	const active = kbActiveLineup(side, g), here = Object.values(t.attendance).filter(Boolean).length;
	const lw = kbLineupWarnings(side, g), dw = kbDefenseWarnings(side, g), d = kbDerive(g);
	const readOnly = !kbCan('lineup', t.teamId);
	const backTo = prep ? 'home' : 'ump', doneLabel = prep ? 'Done — saved for game day' : (g.events.length ? 'Back to the game' : 'Play ball');
	const warnRows = new Set(lw.flatMap(w => w.rows));
	const tabs = [['here', `Who’s here · ${here}`], ['lineup', `Lineup${lw.length ? ' ⚠' : ''}`], ['positions', `Positions${dw.length ? ' ⚠' : ''}`]];
	const tag = (p) => `<span class="chip-tag is-${p.gender}">${p.gender === 'male' ? 'M' : 'W'}</span>`;
	let body = '';
	if (tab === 'here') body = `
		<p class="hint">Tap everyone who's playing today. ${here < T.minPlayers ? `<strong>Need ${T.minPlayers}${T.minWomen ? `, at least ${T.minWomen} woman` : ''}.</strong>` : ''}</p>
		<ul class="roster-list">${team.roster.map(p => `<li><button type="button" class="chip ${t.attendance[p.id] ? 'is-on' : ''}" data-action="here" data-player="${p.id}" aria-pressed="${!!t.attendance[p.id]}"><span class="chip-name">${kbEscape(p.name)}</span>${tag(p)}</button></li>`).join('')}</ul>
		<div class="pad-bar is-2"><button type="button" class="key is-primary" data-action="captain-tab" data-tab="lineup">Next: lineup</button></div>`;
	if (tab === 'lineup') body = `
		${lw.map(w => `<p class="warn">${kbEscape(w.text)}</p>`).join('')}
		${kbState.share != null ? `<p class="hint is-accent">Sharing spot ${kbState.share + 1} — tap the other spot, or Share again to cancel.</p>` : ''}
		<ol class="lineup-list">${active.map((slot, i) => { const ids = kbSlotIds(slot); const ps = ids.map(id => kbPlayer(team, id)); const up = !d.final && (d.pa[side] % active.length) === i; const shared = ids.length > 1; return `<li class="lineup-row ${warnRows.has(i) ? 'is-warn' : ''} ${up ? 'is-up' : ''} ${kbState.share === i ? 'is-picking' : ''} ${shared ? 'is-shared' : ''}">
			<span class="lineup-n">${i + 1}</span>
			<span class="lineup-name">${ps.map(p => kbEscape(p.name)).join(' <em class="lineup-slash">/</em> ')} ${up ? '<em>up</em>' : ''}</span>
			<span class="lineup-tags">${ps.map(tag).join('')}</span>
			<span class="lineup-move">
				${T.coed?.splitSlots ? (shared ? `<button type="button" data-action="unshare" data-index="${i}" aria-label="stop sharing spot ${i + 1}">✕</button>` : `<button type="button" class="${kbState.share === i ? 'is-on' : ''}" data-action="share" data-index="${i}" aria-label="share spot ${i + 1}" aria-pressed="${kbState.share === i}">½</button>`) : ''}
				<button type="button" data-action="move" data-index="${i}" data-delta="-1" aria-label="move spot ${i + 1} up" ${i === 0 ? 'disabled' : ''}>↑</button><button type="button" data-action="move" data-index="${i}" data-delta="1" aria-label="move spot ${i + 1} down" ${i === active.length - 1 ? 'disabled' : ''}>↓</button>
			</span>
		</li>`; }).join('') || '<li class="is-empty">Nobody marked here yet</li>'}</ol>
		<div class="pad-bar is-2"><button type="button" class="key is-ghost" data-action="balance">Balance W/M</button><button type="button" class="key is-primary" data-action="captain-tab" data-tab="positions">Next: positions</button></div>`;
	if (tab === 'positions') { const onField = Object.values(t.assignments).filter(Boolean); const ids = active.flatMap(kbSlotIds); const bench = ids.filter(id => !onField.includes(id)); body = `
		${dw.map(w => `<p class="warn">${kbEscape(w)}</p>`).join('')}
		<ul class="positions">${T.positions.map(pos => `<li class="position-row"><label for="pos-${kbSlug(pos)}">${kbEscape(pos)}${(T.infield || []).includes(pos) ? ' <small>IF</small>' : ''}</label><select id="pos-${kbSlug(pos)}" data-action="assign" data-position="${kbEscape(pos)}"><option value="">Open</option>${ids.map(id => { const p = kbPlayer(team, id); return `<option value="${id}" ${t.assignments[pos] === id ? 'selected' : ''}>${kbEscape(p.name)}</option>`; }).join('')}</select></li>`).join('')}</ul>
		<p class="hint">Bench (${bench.length}): ${bench.map(id => kbEscape(kbFirst(kbPlayer(team, id).name))).join(', ') || '—'}</p>
		<div class="pad-bar is-2"><button type="button" class="key is-primary" data-action="go" data-to="${backTo}">${doneLabel}</button></div>`; }
	host.innerHTML = `
	<header class="page-head">
		<button type="button" class="key is-ghost back" data-action="go" data-to="${backTo}" aria-label="${prep ? 'Home' : 'Back to the game'}">←</button>
		<div><p class="eyebrow">${prep ? 'Game day prep · ' + kbEscape(kbSchedDate(prep)) : 'Captain'}${readOnly ? ' · read-only' : ''}</p><h1>${kbEscape(team.name)}</h1></div>
		${sides.length > 1 ? `<div class="seg">${sides.map(s => `<button type="button" class="${s === side ? 'is-on' : ''}" data-action="captain-side" data-side="${s}">${kbEscape(kbTeam(g.teams[s].teamId).short)}</button>`).join('')}</div>` : ''}
	</header>
	${readOnly ? `<p class="warn">${kbEscape(kbDenied('lineup'))}</p>` : ''}
	<nav class="tabs" aria-label="Setup steps">${tabs.map(([id, label]) => `<button type="button" class="${tab === id ? 'is-on' : ''}" data-action="captain-tab" data-tab="${id}" aria-current="${tab === id ? 'step' : 'false'}">${label}</button>`).join('')}</nav>
	${body}`;
}

/* ---------- league admin --------------------------------------------------- */
function kbRenderLeague() {
	const host = document.querySelector('.league'), L = kbState.league; if (!host) return;
	if (!L) { host.innerHTML = '<p class="empty">No league on this phone.</p>'; return; }
	const base = KB_SPORTS[L.sport], cfg = kbSport({ sport:L.sport });
	const statusLabel = { approved:'Approved', pending:'Pending', declined:'Declined' };
	const rule = (path, label, type = 'number', opts) => { const v = kbGetPath(cfg, path), b = kbGetPath(base, path), changed = v !== b; return `<li class="rule-row ${changed ? 'is-changed' : ''}"><label for="rule-${kbSlug(path)}">${kbEscape(label)}${changed ? ` <small>rulebook: ${b}</small>` : ''}</label>${type === 'bool' ? `<select id="rule-${kbSlug(path)}" data-action="rule" data-path="${path}" data-type="bool"><option value="true" ${v ? 'selected' : ''}>${opts[0]}</option><option value="false" ${!v ? 'selected' : ''}>${opts[1]}</option></select>` : `<input id="rule-${kbSlug(path)}" type="number" inputmode="numeric" min="0" value="${v}" data-action="rule" data-path="${path}" data-type="number">`}</li>`; };
	const teamsAll = kbState.teams.filter(t => t.sport === L.sport);
	host.innerHTML = `
	<header class="page-head"><button type="button" class="key is-ghost back" data-action="go" data-to="home" aria-label="Home">←</button><div><p class="eyebrow">League admin</p><h1>${kbEscape(L.name)}</h1></div></header>

	<!-- ===== RULES : the sport config the league can tune; blank = rulebook ===== -->
	<section class="league-card"><h2>Rules · ${kbEscape(cfg.name)} · ${kbEscape(L.season)}</h2>
		<p class="hint">These sit on top of the rulebook in <code>data.js</code>. Every game started in this league uses them.</p>
		<ul class="rules">
			${rule('structure.outsPerHalf', 'Outs per half')}
			${cfg.clock ? rule('clock.minutes', 'Game length (min)') + rule('clock.officialAfter', 'Official after (min)') + rule('clock.capUntil', 'Run cap applies until (min)') : ''}
			${cfg.rules && cfg.rules.runCap ? rule('rules.runCap.runs', 'Run cap per inning') : ''}
			${cfg.team ? rule('team.minPlayers', 'Minimum players') + rule('team.maxFielders', 'Max fielders') + (cfg.team.maxMenOnField != null ? rule('team.maxMenOnField', 'Max men on the field') : '') : ''}
			${typeof cfg.structure.tiesAllowed === 'object' ? rule('structure.tiesAllowed.season', 'Regular-season ties', 'bool', ['Allowed', 'Play it out']) : ''}
		</ul>
	</section>

	<!-- ===== TEAMS : approvals ===== -->
	<section class="league-card"><h2>Teams</h2>
		<ul class="team-list">${teamsAll.map(t => { const st = L.teams[t.id] || 'pending'; const cap = t.captain && kbPlayer(t, t.captain); return `<li class="approve-row is-${st}"><div><strong>${kbEscape(t.name)}</strong><span>${t.roster.length} players${cap ? ' · captain ' + kbEscape(cap.name) : ''} · <b>${statusLabel[st]}</b></span></div><span class="seg">${['approved', 'declined'].filter(x => x !== st).map(x => `<button type="button" data-action="team-status" data-team="${t.id}" data-status="${x}">${x === 'approved' ? 'Approve' : 'Decline'}</button>`).join('')}${st !== 'pending' ? `<button type="button" data-action="team-status" data-team="${t.id}" data-status="pending">Reset</button>` : ''}</span></li>`; }).join('') || '<li class="is-empty">No teams yet</li>'}</ul>
		<div class="pad-bar is-2"><button type="button" class="key is-ghost" data-action="teams">Teams &amp; rosters</button></div>
	</section>

	<!-- ===== UMPIRES ===== -->
	<section class="league-card"><h2>Umpires</h2>
		<ul class="ump-list">${L.umpires.map(u => `<li>${kbEscape(u.name)} <span class="hint">${kbUpcoming().filter(s => s.ump === u.id).length} upcoming</span></li>`).join('')}</ul>
		<form class="inline-form"><div class="field"><label for="ump-name">Add an umpire</label><input id="ump-name" name="name" autocomplete="off" required></div><button type="submit" class="key is-ghost" data-action="add-ump">Add</button></form>
	</section>

	<!-- ===== SCHEDULE : games, ump assignment, results ===== -->
	<section class="league-card"><h2>Schedule</h2>
		<ul class="sched-list is-admin">${kbSchedSorted().map(s => `<li class="sched-row ${s.status === 'live' ? 'is-live' : ''} ${s.status === 'final' ? 'is-final' : ''}">
			<span class="sched-when">${kbEscape(kbSchedDate(s))}${s.field ? ' · ' + kbEscape(s.field) : ''}${s.mode && s.mode !== 'season' ? ' · ' + kbEscape(cfg.modes?.[s.mode] || s.mode) : ''}</span>
			<span class="sched-who">${kbEscape(kbSchedName(s, 'away'))} <em>@</em> ${kbEscape(kbSchedName(s, 'home'))}${s.result ? ` <strong>${s.result.away}–${s.result.home}</strong>` : s.status === 'live' ? ' <strong>live</strong>' : ''}</span>
			${s.status === 'final' ? '' : `<select data-action="assign-ump" data-sched="${s.id}" aria-label="Umpire"><option value="">No ump yet</option>${L.umpires.map(u => `<option value="${u.id}" ${s.ump === u.id ? 'selected' : ''}>${kbEscape(u.name)}</option>`).join('')}</select>
			<button type="button" class="roster-remove" data-action="remove-sched" data-sched="${s.id}" aria-label="Remove game">×</button>`}
		</li>`).join('') || '<li class="is-empty">No games yet</li>'}</ul>
		<form class="new-game"><h3>Add a game</h3>
			<div class="field-pair"><div class="field"><label for="sch-date">Date</label><input id="sch-date" name="date" type="date" required></div><div class="field"><label for="sch-time">Time</label><input id="sch-time" name="time" type="time"></div></div>
			<div class="field-pair"><div class="field"><label for="sch-away">Away</label><select id="sch-away" name="away">${teamsAll.map(t => `<option value="${t.id}">${kbEscape(t.name)}</option>`).join('')}</select></div><div class="field"><label for="sch-home">Home</label><select id="sch-home" name="home">${teamsAll.map((t, i) => `<option value="${t.id}" ${i === 1 ? 'selected' : ''}>${kbEscape(t.name)}</option>`).join('')}</select></div></div>
			<div class="field-pair"><div class="field"><label for="sch-field">Field</label><input id="sch-field" name="field" autocomplete="off"></div><div class="field"><label for="sch-ump">Ump</label><select id="sch-ump" name="ump"><option value="">Assign later</option>${L.umpires.map(u => `<option value="${u.id}">${kbEscape(u.name)}</option>`).join('')}</select></div></div>
			<div class="field"><label for="sch-mode">Game</label><select id="sch-mode" name="mode">${Object.entries(cfg.modes || { season:'Regular season' }).map(([id, label]) => `<option value="${id}">${label}</option>`).join('')}</select></div>
			<button type="submit" class="key is-primary" data-action="add-sched">Add game</button>
		</form>
	</section>
	${kbStandingsHTML()}`;
}

/* ---------- teams -------------------------------------------------------- */
function kbRenderTeams() {
	const host = document.querySelector('.teams'); if (!host) return;
	host.innerHTML = `
	<header class="page-head"><button type="button" class="key is-ghost back" data-action="go" data-to="home" aria-label="Home">←</button><div><p class="eyebrow">Manage</p><h1>Teams</h1></div></header>
	<ul class="team-list">${kbState.teams.map(t => `<li><button type="button" class="team-card" data-action="team" data-team="${t.id}"><strong>${kbEscape(t.name)}</strong><span>${KB_SPORTS[t.sport]?.name || t.sport} · ${t.roster.length} players</span></button></li>`).join('') || '<li class="is-empty">No teams yet</li>'}</ul>
	<form class="new-game"><h2>New team</h2>
		<div class="field"><label for="team-name">Name</label><input id="team-name" name="name" autocomplete="off" required></div>
		<div class="field"><label for="team-sport">Sport</label><select id="team-sport" name="sport">${Object.values(KB_SPORTS).map(s => `<option value="${s.id}">${s.name}</option>`).join('')}</select></div>
		<button type="submit" class="key is-primary" data-action="new-team">Create</button>
	</form>`;
}
function kbRenderTeam() {
	const host = document.querySelector('.team'), team = kbTeam(kbState.teamId); if (!host) return;
	if (!team) { host.innerHTML = '<p class="empty">Team not found.</p>'; return; }
	const w = team.roster.filter(p => p.gender === 'female').length, m = team.roster.length - w;
	const cap = team.captain && kbPlayer(team, team.captain);
	host.innerHTML = `
	<header class="page-head"><button type="button" class="key is-ghost back" data-action="teams" aria-label="Teams">←</button><div><p class="eyebrow">${KB_SPORTS[team.sport]?.name || ''} · ${w} W · ${m} M${cap ? ' · captain ' + kbEscape(kbFirst(cap.name)) : ''}${!kbCan('roster', team.id) ? ' · read-only' : ''}</p><h1>${kbEscape(team.name)}</h1></div><button type="button" class="key is-ghost" data-action="stats" data-team="${team.id}">Stats</button></header>
	<ul class="roster-list is-edit">${team.roster.map(p => `<li class="roster-row ${p.guest ? 'is-guest' : ''}">
		<span class="roster-name">${kbEscape(p.name)}${p.id === team.captain ? ' <small>C</small>' : ''}${p.guest ? ` <small>guest · ${kbEscape(kbTeam(p.guestFrom)?.short || '')}</small>` : ''}${p.freeAgent ? ' <small>FA</small>' : ''}</span>
		<span class="seg"><button type="button" class="${p.gender === 'female' ? 'is-on' : ''}" data-action="gender" data-player="${p.id}" data-gender="female" aria-pressed="${p.gender === 'female'}">W</button><button type="button" class="${p.gender === 'male' ? 'is-on' : ''}" data-action="gender" data-player="${p.id}" data-gender="male" aria-pressed="${p.gender === 'male'}">M</button></span>
		<button type="button" class="roster-remove" data-action="remove-player" data-player="${p.id}" aria-label="Remove ${kbEscape(p.name)}">×</button>
	</li>`).join('') || '<li class="is-empty">No players yet</li>'}</ul>
	<form class="new-game"><h2>Add player</h2>
		<div class="field"><label for="player-name">Name</label><input id="player-name" name="name" autocomplete="off" required></div>
		<div class="seg is-radio" role="radiogroup" aria-label="Designation"><label><input type="radio" name="gender" value="female" checked> W</label><label><input type="radio" name="gender" value="male"> M</label></div>
		<button type="submit" class="key is-primary" data-action="add-player">Add</button>
	</form>`;
}
function kbRenderStats() {
	const host = document.querySelector('.stats'), team = kbTeam(kbState.teamId); if (!host) return;
	if (!team) { host.innerHTML = '<p class="empty">Pick a team first.</p>'; return; }
	const { games, totals } = kbSeasonStats(team.id);
	const rows = Object.entries(totals).map(([pid, s]) => ({ p:kbPlayer(team, pid), s })).filter(r => r.p).sort((a, b) => b.s.h - a.s.h || b.s.pa - a.s.pa || a.p.name.localeCompare(b.p.name));
	host.innerHTML = `
	<header class="page-head"><button type="button" class="key is-ghost back" data-action="team" data-team="${team.id}" aria-label="Back">←</button><div><p class="eyebrow">${games} saved game${games === 1 ? '' : 's'}</p><h1>${kbEscape(team.name)}</h1></div></header>
	${rows.length ? `<div class="linescore is-open"><table><thead><tr><th>Player</th><th>G</th><th>PA</th><th>H</th><th>R</th><th>RBI</th><th>OBP</th></tr></thead><tbody>${rows.map(r => `<tr><th>${kbEscape(r.p.name)}</th><td>${r.s.g}</td><td>${r.s.pa}</td><td>${r.s.h}</td><td>${r.s.r}</td><td>${r.s.rbi}</td><td>${kbObp(r.s)}</td></tr>`).join('')}</tbody></table></div>` : '<p class="empty">No saved games with this team yet. Finish a game with "Save & done" and the numbers show up here.</p>'}`;
}

/* ========================================================================== */
/* PLAYER — one person's page: next game, in/out, lineup, live, free agent,    */
/* stats vs the league, settings. Sleeper-style cards. Team filter when the    */
/* person is on more than one roster.                                         */
/* ========================================================================== */
function kbMyTeamsFiltered() { const ts = kbPersonTeams(kbState.me.playerId); return kbState.pteam === 'all' ? ts : ts.filter(t => t.id === kbState.pteam); }
function kbRenderPlayer() {
	const host = document.querySelector('.player'); if (!host) return;
	const me = kbState.me, p = kbPerson(me.playerId), L = kbState.league;
	if (!p) { host.innerHTML = '<p class="empty">No player picked. <button type="button" class="key is-ghost" data-action="switch">Switch</button></p>'; return; }
	const pr = kbProfile(p.id), teams = kbPersonTeams(p.id), mine = kbMyTeamsFiltered(); const ids = mine.map(t => t.id);
	if (kbState.pteam !== 'all' && !ids.length) { kbState.pteam = 'all'; return kbRenderPlayer(); }
	const sched = kbSchedSorted().filter(s => ids.includes(s.away) || ids.includes(s.home));
	const upcoming = sched.filter(s => s.status !== 'final'), played = sched.filter(s => s.status === 'final').slice(-3).reverse();
	const live = kbState.game && kbState.game.status === 'live' && (ids.includes(kbState.game.teams.away.teamId) || ids.includes(kbState.game.teams.home.teamId)) ? kbState.game : null;
	const myTeamIn = (s) => kbTeam(ids.includes(s.home) ? s.home : s.away);
	const inout = (s) => { const v = (s.availability || {})[p.id]; return `<span class="seg is-inout">${['in', 'out'].map(x => `<button type="button" class="${v === x ? 'is-on is-' + x : ''}" data-action="avail" data-sched="${s.id}" data-player="${p.id}" data-value="${x}" aria-pressed="${v === x}">${x === 'in' ? 'In' : 'Out'}</button>`).join('')}</span>`; };
	const row = (s, extra = '') => { const t = myTeamIn(s); const opp = kbTeam(kbOpponent(s, t.id)); return `<li class="sched-row ${s.status === 'live' ? 'is-live' : ''}"><span class="sched-when">${kbEscape(kbSchedDate(s))}${s.field ? ' · ' + kbEscape(s.field) : ''}${teams.length > 1 ? ' · ' + kbEscape(t.short) : ''}</span><span class="sched-who">${s.home === t.id ? 'vs' : '@'} ${kbEscape(opp ? opp.name : '—')}${s.result ? ` <strong>${s.away === t.id ? `${s.result.away}–${s.result.home}` : `${s.result.home}–${s.result.away}`}${(s.result.away > s.result.home) === (s.away === t.id) ? ' W' : s.result.away === s.result.home ? ' T' : ' L'}</strong>` : ''}</span>${extra}</li>`; };

	/* --- next game card --- */
	const next = upcoming[0]; let nextHTML = '';
	if (live) { const d = kbDerive(live); const k = kbCurrentKicker(d.half === 'top' ? 'away' : 'home', live);
		nextHTML = `<section class="pcard is-live"><p class="eyebrow">Live now</p><p class="live-score"><span>${kbEscape(live.teams.away.name)}</span><strong>${d.score.away}</strong><em>–</em><strong>${d.score.home}</strong><span>${kbEscape(live.teams.home.name)}</span></p><p class="hint">${d.half === 'top' ? 'Top' : 'Bottom'} ${d.inning} · ${d.outs} out${k ? ' · up: ' + kbEscape(kbDisplayName(k)) : ''}</p><div class="pad-bar is-2"><button type="button" class="key is-primary" data-action="go" data-to="ump">Watch</button></div></section>`; }
	else if (next) { const t = myTeamIn(next); const opp = kbTeam(kbOpponent(next, t.id)); const c = kbAvailCounts(next, t.id); const leadId = (next.lead || {})[t.id]; const lead = leadId && kbPlayer(t, leadId); const cfg = kbSport({ sport:L.sport }); const min = cfg.team ? cfg.team.minPlayers : 0;
		const prep = next.prep, side = prep ? (prep.teams.home.teamId === t.id ? 'home' : 'away') : null; const active = prep ? kbActiveLineup(side, prep) : []; const spot = active.findIndex(slot => kbSlotIds(slot).includes(p.id)); const pos = prep ? Object.entries(prep.teams[side].assignments).find(([, id]) => id === p.id) : null;
		nextHTML = `<section class="pcard is-next"><p class="eyebrow">Next game${teams.length > 1 ? ' · ' + kbEscape(t.name) : ''}</p>
			<p class="next-when">${kbEscape(kbSchedDate(next))}${next.field ? ' · ' + kbEscape(next.field) : ''}</p>
			<h2 class="next-who">${next.home === t.id ? 'vs' : '@'} ${kbEscape(opp ? opp.name : '—')}</h2>
			<div class="next-inout">${inout(next)}</div>
			<p class="status-line"><strong class="is-in">${c.in} in</strong> · <strong class="is-out">${c.out} out</strong> · ${c.unknown} haven’t said${c.in < min ? ` · <strong class="is-short">short ${min - c.in}</strong>` : ''}</p>
			<p class="hint">${lead ? `${kbEscape(kbDisplayName(lead))} is running this one` : t.captain && kbPlayer(t, t.captain) ? `${kbEscape(kbDisplayName(kbPlayer(t, t.captain)))} (captain) is running this one` : ''}</p>
			${prep ? `<p class="lineup-me">${spot >= 0 ? `You’re kicking <strong>${spot + 1}${['st', 'nd', 'rd'][spot] || 'th'}</strong>${pos ? ` · <strong>${kbEscape(pos[0])}</strong>` : ''}` : 'You’re not in the lineup yet'}</p>` : '<p class="lineup-me">Lineup not set yet</p>'}
		</section>`; }
	else nextHTML = `<section class="pcard"><p class="eyebrow">Next game</p><p class="hint">Nothing scheduled${kbState.pteam !== 'all' ? ' for this team' : ''}.</p></section>`;

	/* --- stats --- */
	const st = kbPlayerStats(p.id), axes = kbRadarAxes(p.id), obp = axes[0];
	const { totals } = kbLeagueStats(); const board = Object.entries(totals).filter(([, t]) => t.pa >= 4).map(([id, t]) => ({ id, p:kbPerson(id), t, obp:t.reached / t.pa })).filter(x => x.p).sort((a, b) => b.obp - a.obp || b.t.h - a.t.h).slice(0, 8);
	const myRank = board.findIndex(x => x.id === p.id);
	const summary = st.g ? `${st.g} game${st.g === 1 ? '' : 's'}, on base ${obp.text} (${obp.rank}${['st', 'nd', 'rd'][obp.rank - 1] || 'th'} of ${obp.of}), ${st.h} hit${st.h === 1 ? '' : 's'}, ${st.r} run${st.r === 1 ? '' : 's'} scored, ${st.rbi} driven in.` : 'No games on the books yet — stats start with your first game.';

	/* --- settings --- */
	const icons = (window.KB_ICONS || []).map(i => `<button type="button" class="${pr.icon === i ? 'is-on' : ''}" data-action="pick-icon" data-icon="${i}" aria-pressed="${pr.icon === i}" aria-label="Icon ${i}">${i}</button>`).join('');
	const w = pr.walkup || {};
	host.innerHTML = `
	<!-- ===== PLAYER HEAD : who I am, which teams ===== -->
	<header class="player-head">
		<span class="avatar-big" aria-hidden="true">${pr.icon || kbInitials(p.name)}</span>
		<div class="player-id">
			<h1>${kbEscape(kbDisplayName(p))}</h1>
			${pr.nickname ? `<p class="player-real">${kbEscape(p.name)}</p>` : ''}
			<p class="team-chips">${teams.map(t => `<span class="chip-team${t.captain === p.id ? ' is-captain' : ''}">${kbEscape(t.short)}${t.captain === p.id ? ' · C' : ''}</span>`).join('')}<span class="chip-tag is-${p.gender}">${p.gender === 'male' ? 'M' : 'W'}</span></p>
			${w.title ? `<p class="walkup">♪ ${kbEscape(w.title)}${w.artist ? ' — ' + kbEscape(w.artist) : ''}${w.url ? ` <a href="${kbEscape(w.url)}" target="_blank" rel="noopener">play</a>` : ''}</p>` : ''}
		</div>
	</header>
	${teams.length > 1 ? `<nav class="tabs is-filter" aria-label="Which team"><button type="button" class="${kbState.pteam === 'all' ? 'is-on' : ''}" data-action="pteam" data-team="all" aria-pressed="${kbState.pteam === 'all'}">All</button>${teams.map(t => `<button type="button" class="${kbState.pteam === t.id ? 'is-on' : ''}" data-action="pteam" data-team="${t.id}" aria-pressed="${kbState.pteam === t.id}">${kbEscape(t.short)}</button>`).join('')}</nav>` : ''}

	${nextHTML}

	<!-- ===== SCHEDULE : the rest, in or out ===== -->
	<section class="pcard"><p class="eyebrow">Schedule</p>
		<ul class="sched-list">${upcoming.slice(live ? 0 : 1).map(s => row(s, inout(s))).join('') || '<li class="is-empty">No more games scheduled</li>'}</ul>
		${played.length ? `<p class="eyebrow" style="margin-top:var(--space_md)">Played</p><ul class="sched-list">${played.map(s => row(s)).join('')}</ul>` : ''}
	</section>

	<!-- ===== FREE AGENT : opt in, for my nights or any night ===== -->
	<section class="pcard"><p class="eyebrow">Free agent</p>
		<p class="hint">Teams that are short can ask you to fill in. Pick when.</p>
		<div class="tabs is-fa" role="group" aria-label="Free agent">${[['off', 'Off'], ['mine', 'Nights I already play'], ['all', 'Any game']].map(([m, l]) => `<button type="button" class="${kbFaMode(p.id) === m ? 'is-on' : ''}" data-action="fa-mode" data-mode="${m}" aria-pressed="${kbFaMode(p.id) === m}">${l}</button>`).join('')}</div>
	</section>

	<!-- ===== STATS : me vs the league ===== -->
	<section class="pcard"><p class="eyebrow">Season · ${kbEscape(L.season)}</p>
		<div class="stats-wrap">
			${kbRadarSVG(axes)}
			<ul class="stat-grid">${[['G', st.g], ['PA', st.pa], ['H', st.h], ['R', st.r], ['RBI', st.rbi], ['OBP', kbObp(st)]].map(([l, v]) => `<li><strong>${v}</strong><span>${l}</span></li>`).join('')}</ul>
		</div>
		<p class="radar-key"><i class="is-me"></i> You <i class="is-league"></i> League average</p>
		<p class="stat-text">${kbEscape(summary)}</p>
		${board.length ? `<p class="eyebrow" style="margin-top:var(--space_md)">League · on base</p><ol class="leaders">${board.map((x, i) => `<li class="${x.id === p.id ? 'is-me' : ''}"><span class="leader-n">${i + 1}</span><span class="leader-name">${kbEscape(kbDisplayName(x.p))} <small>${x.p.teams.map(t => t.short).join('/')}</small></span><strong>${x.obp.toFixed(3).replace(/^0/, '')}</strong></li>`).join('')}${myRank < 0 && st.pa ? `<li class="is-me"><span class="leader-n">${obp.rank}</span><span class="leader-name">${kbEscape(kbDisplayName(p))}</span><strong>${obp.text}</strong></li>` : ''}</ol>` : ''}
	</section>

	<!-- ===== SETTINGS : profile ===== -->
	<details class="pcard settings"><summary>Settings</summary>
		<form class="profile-form">
			<input type="hidden" name="icon" value="${kbEscape(pr.icon || '')}">
			<p class="eyebrow">Icon</p><div class="icon-grid" role="group" aria-label="Choose an icon">${icons}</div>
			<div class="field"><label for="pf-nick">Nickname</label><input id="pf-nick" name="nickname" value="${kbEscape(pr.nickname || '')}" autocomplete="off" placeholder="${kbEscape(kbFirst(p.name))}"></div>
			<p class="eyebrow">Walk-up song</p>
			<div class="field-pair"><div class="field"><label for="pf-wt">Title</label><input id="pf-wt" name="walkup-title" value="${kbEscape(w.title || '')}" autocomplete="off"></div><div class="field"><label for="pf-wa">Artist</label><input id="pf-wa" name="walkup-artist" value="${kbEscape(w.artist || '')}" autocomplete="off"></div></div>
			<div class="field"><label for="pf-wu">Link (Spotify, YouTube…)</label><input id="pf-wu" name="walkup-url" type="url" value="${kbEscape(w.url || '')}" autocomplete="off" placeholder="https://"></div>
			<p class="hint">Your name on the roster is the captain’s to change.</p>
			<button type="submit" class="key is-primary" data-action="save-profile">Save</button>
		</form>
	</details>`;
}
