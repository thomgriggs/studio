/* ========================================================================== */
/* OPTIMUM RV CRM — prototype behavior                                        */
/* All helpers are `crm*` (the CRM's answer to the site's `or*` helpers).     */
/* Nothing here talks to a server; every render reads window.CRM_DATA.        */
/* ========================================================================== */

/* ---------- state ------------------------------------------------------- */
const CRM_PILL_HELP = { urgent:'Response clock — reply before it runs out', overdue:'Something is late or blocked', appointment:'Next appointment', info:'Time left on the response clock', neutral:'Waiting on the customer for this item', flagged:'Needs attention' };
const crmState = { role:'sales', desk:'default', tab:null, leadId:null };

/* ---------- boot -------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', crmInit);

/* ---------- session persistence (prototype only) ------------------------ */
/* Mutations (stage changes, sent messages, new leads, booked events) are    */
/* kept in sessionStorage so they survive page switches during a demo.       */
const CRM_STORE_KEY = 'optimumrv-crm-demo';
function crmPersist() {
	try { sessionStorage.setItem(CRM_STORE_KEY, JSON.stringify({ roles:CRM_DATA.roles, events:CRM_DATA.calendar.events })); } catch (e) {}
}
function crmHydrate() {
	try {
		const saved = JSON.parse(sessionStorage.getItem(CRM_STORE_KEY) || 'null');
		if (!saved) return;
		Object.keys(saved.roles).forEach(r => { if (CRM_DATA.roles[r]) Object.keys(saved.roles[r].desks).forEach(d => { if (CRM_DATA.roles[r].desks[d]) CRM_DATA.roles[r].desks[d].leads = saved.roles[r].desks[d].leads; }); });
		if (saved.events && Object.values(saved.events).flat().every(e => e.date)) CRM_DATA.calendar.events = saved.events;
	} catch (e) {}
}
function crmResetDemo() { try { sessionStorage.removeItem(CRM_STORE_KEY); } catch (e) {} location.reload(); }

/* ---------- device: phone or desktop ------------------------------------ */
/* Phone when the viewport is narrow, or a touch device in landscape; can be   */
/* forced with ?device=phone or Settings → Phone preview (for demos).          */
function crmDevice() {
	const params = new URLSearchParams(location.search);
	let forced = params.get('device');
	try { forced = forced || sessionStorage.getItem('optimumrv-crm-device'); } catch (e) {}
	const phone = forced === 'phone' ? true : forced === 'desktop' ? false : (matchMedia('(max-width: 700px)').matches || matchMedia('(pointer: coarse) and (max-width: 900px)').matches);
	const prev = document.body.dataset.device;
	document.body.dataset.device = phone ? 'phone' : 'desktop';
	const inset = params.get('inset'); if (inset) document.body.style.setProperty('--safe_top', `${+inset}px`); /* fake notch inset for the framed preview */
	return prev !== document.body.dataset.device;
}

function crmInit() {
	crmHydrate();
	crmDevice();
	let resizeTimer; addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { if (crmDevice()) location.reload(); else if (document.body.dataset.view === 'calendar' && document.body.dataset.device === 'desktop') crmRenderCalendar(); }, 120); });
	const params = new URLSearchParams(location.search);
	const role = CRM_DATA.roles[params.get('role')] ? params.get('role') : 'sales';
	const roleData = CRM_DATA.roles[role];
	const desk = roleData.desks[params.get('desk')] ? params.get('desk') : roleData.defaultDesk;

	crmState.role = role;
	crmState.desk = desk;
	document.body.dataset.role = role;
	document.body.dataset.desk = desk;

	crmRenderShell(roleData);
	crmBindDrawer();
	crmBindLabels();

	const view = document.body.dataset.view;
	if (view === 'daily-view') crmInitDailyView(params);
	if (view === 'pipeline') crmInitPipeline(params);
	if (view === 'calendar') crmInitCalendar(params);

	crmIcons();
}

/* ---------- shared: icons, templates, query strings --------------------- */
function crmIcons(scope) { if (window.feather) feather.replace({ 'stroke-width':2 }); }

function crmIcon(name) { return name ? `<i data-feather="${name}"></i>` : ''; }

function crmTemplate(id) {
	const tpl = document.getElementById(id);
	return tpl.content.firstElementChild.cloneNode(true);
}

/* Fill every [data-field] inside `node` from `obj` (dot paths allowed). */
function crmFill(node, obj) {
	node.querySelectorAll('[data-field]').forEach(el => {
		const value = el.dataset.field.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
		if (value === undefined || value === null) return;
		if (el.tagName === 'IMG') el.src = value;
		else el.textContent = value;
	});
	return node;
}

function crmQuery(extra = {}) {
	const forced = new URLSearchParams(location.search).get('device');
	const q = new URLSearchParams({ role:crmState.role, desk:crmState.desk, ...(forced ? { device:forced } : {}), ...extra });
	return '?' + q.toString();
}

/* ---------- shell: role switch, sidebar, nav hrefs ---------------------- */
function crmRenderShell(roleData) {
	crmFill(document, { user:roleData.user });
	document.querySelectorAll('.sidebar-navigation .nav-item, .role-picker a[data-view]').forEach(a => {
		const view = a.dataset.view;
		a.href = `${view}.html${crmQuery()}`;
		a.classList.toggle('is-active', view === document.body.dataset.view);
	});
}

function crmBindDrawer() {
	const drawer = document.querySelector('.sidebar-navigation');
	const overlay = document.querySelector('.global-overlay');
	if (!drawer) return;
	const set = open => {
		drawer.classList.toggle('is-open', open);
		overlay.classList.toggle('is-open', open);
		document.body.classList.toggle('nav-scroll', open);
		drawer.setAttribute('aria-hidden', String(!open));
	};
	document.querySelectorAll('[data-action="open-menu"]').forEach(b => b.addEventListener('click', () => set(true)));
	document.querySelectorAll('[data-action="close-menu"]').forEach(b => b.addEventListener('click', () => set(false)));
	overlay.addEventListener('click', () => set(false));
	document.addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
	let dx = null;
	drawer.addEventListener('touchstart', e => { dx = e.touches[0].clientX; }, { passive:true });
	drawer.addEventListener('touchmove', e => { if (dx !== null && dx - e.touches[0].clientX > 60) { dx = null; set(false); } }, { passive:true });
}

/* ---------- dev labels overlay ------------------------------------------ */
const CRM_BLOCKS = [
	'topbar', 'sidebar-navigation', 'pipeline-toggle', 'pipeline-filters', 'filter-control',
	'calendar', 'calendar-nav', 'calendar-modes', 'calendar-sidebar', 'mini-month', 'calendar-list', 'calendar-main', 'calendar-head', 'calendar-grid', 'calendar-now', 'calendar-event', 'followup-task', 'day-agenda', 'agenda-item', 'calendar-month', 'calendar-year', 'event-popover', 'event-editor',
	'pipeline', 'pipeline-column', 'column-header', 'column-lane', 'lead-card', 'card-owner', 'card-flag', 'forsale-summary', 'quick-edit', 'stage-picker',
	'phone-topbar', 'phone-focus', 'phone-bottombar', 'phone-cal', 'phone-week', 'phone-month', 'phone-agenda', 'phone-event', 'inbox', 'inbox-item', 'conversation', 'lead-header', 'lead-identity', 'lead-actions', 'stage-stepper', 'lead-summary', 'summary-card',
	'detail-panel', 'detail-section', 'thread', 'thread-day', 'thread-event', 'thread-message', 'thread-call', 'thread-note', 'thread-email', 'thread-image', 'composer'
];

function crmBindLabels() {
	const toggle = document.querySelector('[data-action="toggle-labels"]');
	if (!toggle) return;
	toggle.addEventListener('change', () => crmToggleLabels(toggle.checked));
}

function crmToggleLabels(on) {
	document.body.classList.toggle('show-labels', on);
	document.querySelectorAll('.dev-label').forEach(l => l.remove());
	document.querySelectorAll('[data-dev-labeled]').forEach(el => el.removeAttribute('data-dev-labeled'));
	if (!on) return;
	const seen = new Set();
	CRM_BLOCKS.forEach(block => {
		document.querySelectorAll(`.${block}`).forEach(el => {
			const key = block + '|' + (el.parentElement ? el.parentElement.className : '');
			if (seen.has(key)) return;
			seen.add(key);
			crmLabel(el, `.${block}`, 'block');
		});
	});
	document.querySelectorAll('[data-action]').forEach(el => {
		crmLabel(el, `data-action="${el.dataset.action}"`, 'action');
	});
}

function crmLabel(el, text, kind) {
	el.setAttribute('data-dev-labeled', '');
	const tag = document.createElement('span');
	tag.className = 'dev-label';
	tag.dataset.kind = kind;
	tag.textContent = text;
	el.appendChild(tag);
}

/* ========================================================================== */
/* DAILY VIEW                                                                 */
/* ========================================================================== */
function crmDesk() { return CRM_DATA.roles[crmState.role].desks[crmState.desk]; }

function crmInitDailyView(params) {
	const roleData = CRM_DATA.roles[crmState.role];
	const desk = crmDesk();

	/* tabs */
	crmState.tab = desk.tabs.some(t => t.id === params.get('tab')) ? params.get('tab') : desk.defaultTab;
	crmRenderTabs(desk);

	/* inbox + first lead */
	crmRenderInbox(desk);
	const wanted = params.get('lead');
	crmOpenLead(desk.leads.some(l => l.id === wanted) ? wanted : desk.defaultLead);

	/* search filters the inbox by name/unit/preview */
	document.getElementById('inbox-search-input').addEventListener('input', e => crmRenderInbox(desk, e.target.value));

	/* composer: mode switch + stub send */
	document.querySelectorAll('.composer-mode button').forEach(b => b.addEventListener('click', () => {
		document.querySelectorAll('.composer-mode button').forEach(x => x.classList.toggle('is-active', x === b));
		document.getElementById('composer-input').placeholder = { text:'Text', email:'Email', note:'Note for' }[b.dataset.mode] + ' ' + (crmCurrentLead()?.name.split(' ')[0] || '') + '…';
	}));
	document.getElementById('composer-form').addEventListener('submit', crmSendStub);
	crmInitPhone(desk, params);
}

function crmRenderTabs(desk) {
	const wrap = document.querySelector('.inbox-tabs .segmented');
	wrap.innerHTML = desk.tabs.map(t => {
		const count = desk.leads.filter(l => l.tabs.includes(t.id)).length;
		return `<button type="button" data-action="filter-inbox" data-tab="${t.id}" class="${t.id === crmState.tab ? 'is-active' : ''}">${t.label}<small data-field="tab.count">${count}</small></button>`;
	}).join('');
	wrap.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
		crmState.tab = b.dataset.tab;
		wrap.querySelectorAll('button').forEach(x => x.classList.toggle('is-active', x === b));
		crmRenderInbox(desk, document.getElementById('inbox-search-input').value);
	}));
}

function crmRenderInbox(desk, search = '') {
	const list = document.getElementById('inbox-list');
	const q = search.trim().toLowerCase();
	const leads = desk.leads.filter(l => l.tabs.includes(crmState.tab))
		.filter(l => !q || [l.name, l.unit, l.preview].join(' ').toLowerCase().includes(q));
	list.innerHTML = '';
	if (!leads.length) {
		list.innerHTML = `<p class="inbox-empty">${crmIcon('inbox')}<br>Nothing here right now</p>`;
		crmIcons();
		return;
	}
	leads.forEach(lead => {
		const item = crmFill(crmTemplate('tpl-inbox-item'), lead);
		item.dataset.lead = lead.id;
		item.dataset.stage = lead.stage;
		item.classList.toggle('is-active', lead.id === crmState.leadId);
		const dot = item.querySelector('.item-unread'); dot.dataset.status = lead.unread || ''; dot.title = lead.unread === 'overdue' ? 'Overdue — a promised follow-up is late' : lead.unread ? 'Unread — the customer replied' : '';
		const unit = item.querySelector('.item-unit');
		unit.textContent = lead.unit || '';
		unit.classList.toggle('is-placeholder', !!lead.unitPlaceholder);
		const pill = item.querySelector('.item-pill');
		if (lead.pill) { pill.dataset.status = lead.pill.status; pill.title = CRM_PILL_HELP[lead.pill.status] || ''; pill.innerHTML = `${crmIcon(lead.pill.icon)}<span data-field="pill.label">${lead.pill.label}</span>`; }
		else pill.remove();
		item.addEventListener('click', () => { crmOpenLead(lead.id); if (document.body.dataset.device === 'phone') crmShowScreen('conversation', true); });
		list.appendChild(item);
	});
	crmRenderFocus(desk);
	crmIcons();
}

function crmCurrentLead() { return crmDesk().leads.find(l => l.id === crmState.leadId); }

function crmOpenLead(id) {
	const desk = crmDesk();
	const lead = desk.leads.find(l => l.id === id);
	if (!lead) return;
	crmState.leadId = id;
	document.querySelectorAll('.inbox-item').forEach(i => i.classList.toggle('is-active', i.dataset.lead === id));
	const onInbox = document.body.dataset.device === 'phone' && crmPhone.screen !== 'conversation';
	history.replaceState(history.state, '', `daily-view.html${crmQuery(onInbox ? { tab:crmState.tab } : { tab:crmState.tab, lead:id })}`);

	const header = document.querySelector('.lead-header');
	header.dataset.stage = lead.stage;
	crmFill(header, lead);
	const phoneBar = document.querySelector('.conversation .phone-topbar'); if (phoneBar) crmFill(phoneBar, lead);

	/* badges next to the name */
	const badges = header.querySelector('.lead-badges');
	badges.innerHTML = (lead.badges || []).map(b =>
		`<span class="pill" data-status="${b.status}" data-field="lead.badge">${crmIcon(b.icon)}${b.label}${b.chevron ? crmIcon('chevron-right') : ''}</span>`
	).join('') + (lead.lost ? `<span class="pill" data-status="dark" data-field="lead.lost">${crmIcon('x-circle')}Lost · ${lead.lost.reason}</span>` : '');

	/* owner line (management / back office show who owns the lead) */
	header.querySelector('.lead-owner').hidden = !desk.showOwner;

	/* role CTA */
	const ctaSlot = header.querySelector('.lead-cta');
	if (lead.cta) {
		ctaSlot.hidden = false;
		const cls = lead.cta.tone === 'primary' ? 'btn btn-primary' : 'btn waiting-pill';
		ctaSlot.innerHTML = `<button type="button" class="${cls}" data-action="${lead.cta.action}">${crmIcon(lead.cta.icon)}<span data-field="cta.label">${lead.cta.label}</span></button>`;
	} else ctaSlot.hidden = true;

	crmRenderStepper(desk, lead);
	crmRenderSummary(lead);
	crmRenderThread(lead);

	document.getElementById('composer-input').value = '';
	document.getElementById('composer-input').placeholder = `Text ${lead.name.split(' ')[0]}…`;
	document.querySelector('.composer-status span').textContent = lead.composerStatus;
	crmIcons();
}

function crmRenderStepper(desk, lead) {
	const ol = document.querySelector('.stage-stepper ol');
	const stages = desk.stages.filter(s => !s.terminal);
	const idx = stages.findIndex(s => s.id === lead.stage);
	ol.innerHTML = stages.map((s, i) => {
		const done = i < idx || (i === idx && lead.stageDone);
		const cls = done ? 'is-done' : (i === idx ? 'is-current' : '');
		return `<li class="${cls}" data-stage="${s.id}"><span class="step-dot">${done ? crmIcon('check') : ''}</span><span data-field="stage.label">${s.label}</span></li>`;
	}).join('');
	document.querySelector('.stepper-status').textContent = lead.lost ? `Lost · ${lead.lost.reason} · ${lead.lost.when}` : (lead.stageNote || '');
}

function crmSummaryArrows() {
	const wrap = document.querySelector('.lead-summary'); const track = wrap && wrap.querySelector('.summary-track'); if (!track) return;
	const max = track.scrollWidth - track.clientWidth;
	wrap.classList.toggle('has-prev', track.scrollLeft > 4);
	wrap.classList.toggle('has-next', max - track.scrollLeft > 4);
}
function crmRenderSummary(lead) {
	const outer = document.querySelector('.lead-summary');
	outer.innerHTML = '<div class="summary-track"></div>';
	const wrap = outer.querySelector('.summary-track');
	(lead.summary || []).forEach(card => {
		const el = crmTemplate('tpl-summary-card');
		el.dataset.kind = card.kind;
		el.dataset.index = lead.summary.indexOf(card);
		const media = el.querySelector('.summary-media');
		if (card.kind === 'unit') {
			media.innerHTML = card.image ? `<span class="thumb"><img src="${card.image}" alt="" data-field="unit.image"></span>` : `<span class="thumb"><svg><use href="#${card.svg || 'rv-trailer'}"/></svg></span>`;
		} else {
			media.innerHTML = `<span class="summary-icon" data-tone="${card.tone || ''}">${crmIcon(card.icon)}</span>`;
		}
		el.querySelector('.summary-title').innerHTML = `${card.star ? crmIcon('star') : ''}<span data-field="summary.title">${card.title}</span>`;
		el.querySelector('.summary-meta').textContent = card.meta || '';
		const meta2 = el.querySelector('.summary-meta2');
		if (card.meta2) meta2.textContent = card.meta2; else meta2.remove();
		const status = el.querySelector('.summary-status');
		status.innerHTML = (card.status || []).map(s => `<span class="pill pill-tag" data-status="${s.status}" data-field="summary.status">${s.label}</span>`).join('');
		if (!card.status || !card.status.length) status.remove();
		wrap.appendChild(el);
	});
	/* arrows instead of a scrollbar: shown only when the row overflows; each click moves one card */
	if (document.body.dataset.device !== 'phone') {
		outer.insertAdjacentHTML('beforeend', `<button type="button" class="summary-arrow is-prev" data-action="summary-scroll" data-dir="-1" aria-label="Previous cards">${crmIcon('chevron-left')}</button><button type="button" class="summary-arrow is-next" data-action="summary-scroll" data-dir="1" aria-label="More cards">${crmIcon('chevron-right')}</button>`);
		crmSummaryArrows();
		wrap.addEventListener('scroll', crmSummaryArrows, { passive:true });
		if (!outer.dataset.arrowsBound) { outer.dataset.arrowsBound = '1'; addEventListener('resize', crmSummaryArrows); }
	}
}

function crmRenderThread(lead) {
	const thread = document.getElementById('thread');
	thread.innerHTML = '';
	(lead.thread || []).forEach(entry => thread.appendChild(crmThreadEntry(entry)));
	requestAnimationFrame(() => { thread.scrollTop = thread.scrollHeight; });
}

function crmThreadEntry(entry) {
	let el;
	switch (entry.type) {
		case 'day':
			el = crmTemplate('tpl-thread-day');
			el.querySelector('strong').textContent = entry.label;
			el.querySelector('time').textContent = entry.time || '';
			break;
		case 'event':
			el = crmTemplate('tpl-thread-event');
			if (entry.tone) el.dataset.tone = entry.tone;
			el.innerHTML = `${crmIcon(entry.icon)}<span data-field="event.text">${entry.text}</span>`;
			break;
		case 'message':
			el = crmTemplate('tpl-thread-message');
			el.classList.add(entry.dir === 'out' ? 'outbound' : 'inbound');
			el.dataset.direction = entry.dir === 'out' ? 'outbound' : 'inbound';
			const label = el.querySelector('.message-label');
			if (entry.label) label.innerHTML = `${crmIcon(entry.labelIcon)}<span data-field="message.author">${entry.label}</span>`; else label.remove();
			el.querySelector('.message-body').textContent = entry.text;
			const meta = el.querySelector('.message-meta');
			if (entry.meta) meta.textContent = entry.meta; else meta.remove();
			break;
		case 'call':
			el = crmTemplate('tpl-thread-call');
			el.querySelector('[data-field="call.title"]').textContent = entry.title;
			el.querySelector('[data-field="call.summary"]').textContent = entry.summary;
			break;
		case 'note':
			el = crmTemplate('tpl-thread-note');
			el.querySelector('[data-field="note.author"]').textContent = entry.author;
			el.querySelector('[data-field="note.text"]').textContent = entry.text;
			break;
		case 'email':
			el = crmTemplate('tpl-thread-email');
			el.querySelector('[data-field="email.time"]').textContent = entry.time;
			el.querySelector('.email-automated').hidden = !entry.automated;
			el.querySelector('.email-opened').hidden = !entry.opened;
			el.querySelector('[data-field="email.subject"]').textContent = entry.subject;
			el.querySelector('[data-field="email.preview"]').textContent = entry.preview;
			break;
		case 'image':
			el = crmTemplate('tpl-thread-image');
			el.querySelector('img').src = entry.src;
			el.querySelector('.message-body').textContent = entry.caption || '';
			break;
		default:
			el = document.createElement('div');
	}
	return el;
}

function crmSendStub(e) {
	e.preventDefault();
	const input = document.getElementById('composer-input');
	const text = input.value.trim();
	if (!text) return;
	const mode = document.querySelector('.composer-mode button.is-active').dataset.mode;
	const lead = crmCurrentLead();
	const entry = mode === 'note' ? { type:'note', author:CRM_DATA.roles[crmState.role].user.name, text }
		: mode === 'email' ? { type:'email', time:'Email · just now', subject:text, preview:'Draft — the developer wires this to the mail service.', opened:false }
		: { type:'message', dir:'out', text, meta:'Sending…' };
	lead.thread.push(entry);
	const thread = document.getElementById('thread');
	thread.appendChild(crmThreadEntry(entry));
	crmIcons();
	thread.scrollTop = thread.scrollHeight;
	input.value = '';
	crmPersist();
	if (mode !== 'note' && lead.stage === 'assigned') crmSetStage(lead, 'attempting', { by:'system' });
}

/* ========================================================================== */
/* PIPELINE                                                                   */
/* ========================================================================== */
const crmBoard = { stores:null, owners:null, waitingSet:null, search:'', showLost:false, mode:'board', sort:{ key:'stage', dir:1 }, stage:null };
try { crmBoard.mode = sessionStorage.getItem('optimumrv-crm-board-mode') || 'board'; } catch (e) {}

function crmInitPipeline(params) {
	const roleData = CRM_DATA.roles[crmState.role];
	const desk = crmDesk();

	/* Consign / Back Office toggle */
	const toggle = document.querySelector('.pipeline-toggle');
	const deskIds = Object.keys(roleData.desks);
	if (deskIds.length > 1) {
		toggle.hidden = false;
		toggle.querySelector('.segmented').innerHTML = deskIds.map(id =>
			`<a href="pipeline.html?role=${crmState.role}&desk=${id}" class="${id === crmState.desk ? 'is-active is-brand' : ''}" data-action="switch-desk" data-desk="${id}">${roleData.desks[id].label}</a>`
		).join('');
	}

	crmRenderBoardFilters(roleData, desk);
	crmBoard.stage = (desk.stages.find(st => st.id === params.get('stage')) || desk.stages.find(st => desk.leads.some(l => l.card && l.stage === st.id)) || desk.stages[0]).id;
	crmRenderBoard(desk);
	crmBindBoardPan();
	document.getElementById('global-search-input').addEventListener('input', e => { crmBoard.search = e.target.value; crmRenderBoard(desk); });
	if (document.body.dataset.device === 'phone') { crmInitPhoneBoard(desk, params); crmBindTouchDrag(desk); }
}

function crmLeadStore(lead) { const m = (lead.location || '').match(/· ([A-Z]{3})$/); if (m) return m[1]; const st = CRM_DATA.stores.find(x => (lead.location || '').startsWith(x.name)); return st ? st.code : 'OCA'; }
function crmRenderBoardFilters(roleData, desk) {
	const wrap = document.querySelector('.pipeline-filters');
	const filters = (desk.board && desk.board.filters) || [];
	if (!filters.length) {
		wrap.innerHTML = `<span class="context-pill"><i data-feather="map-pin"></i><span data-field="user.location">${roleData.user.location}</span></span><span class="context-pill"><i data-feather="user"></i><span data-field="user.name">${roleData.user.name}</span></span>`;
		crmIcons(); return;
	}
	const leadOwners = () => [...new Set(desk.leads.filter(l => l.card && crmBoard.stores.has(crmLeadStore(l))).map(l => l.owner))];
	crmBoard.stores = new Set(crmState.role === 'consignment' ? CRM_DATA.stores.map(st => st.code) : ['OCA']);
	crmBoard.owners = new Set(leadOwners());
	crmBoard.waitingSet = new Set(['Lister', 'Consignor', 'Buy-in Admin', 'Inventory Admin', 'GM']);
	const parts = [];
	if (filters.includes('location')) { CRM_MENUS.stores = { icon:'map-pin', noun:'stores', items:crmStoreItems, get selected() { return crmBoard.stores; }, set selected(v) { crmBoard.stores = v; crmBoard.owners = new Set(leadOwners()); }, onChange:() => crmRenderBoard(desk) }; parts.push('<div class="filter-menu" data-menu="stores"></div>'); }
	if (filters.includes('owner')) { CRM_MENUS.reps = { icon:'users', noun:roleData.ownerLabel === 'All Listers' ? 'listers' : 'salespeople', items:() => leadOwners().map(o => ({ value:o, label:o, swatch:`data-owner="${o}"` })), get selected() { return crmBoard.owners; }, set selected(v) { crmBoard.owners = v; }, onChange:() => crmRenderBoard(desk) }; parts.push('<div class="filter-menu" data-menu="reps"></div>'); }
	if (filters.includes('waiting')) { CRM_MENUS.waiting = { icon:'loader', noun:'roles', items:() => ['Lister', 'Consignor', 'Buy-in Admin', 'Inventory Admin', 'GM'].map(r => ({ value:r, label:r, swatch:'data-store' })), get selected() { return crmBoard.waitingSet; }, set selected(v) { crmBoard.waitingSet = v; }, onChange:() => crmRenderBoard(desk) }; parts.push('<div class="filter-menu" data-menu="waiting"></div>'); }
	wrap.innerHTML = parts.join('');
	crmRenderFilterMenus();
}

function crmBoardLeads(desk) {
	const me = CRM_DATA.roles[crmState.role].user.name;
	const q = crmBoard.search.trim().toLowerCase();
	return desk.leads.filter(l => l.card)
		.filter(l => desk.ownerScope !== 'mine' || l.owner === me)
		.filter(l => !crmBoard.stores || crmBoard.stores.has(crmLeadStore(l)))
		.filter(l => !crmBoard.owners || crmBoard.owners.has(l.owner))
		.filter(l => !crmBoard.waitingSet || !l.waitingOn || crmBoard.waitingSet.has(l.waitingOn))
		.filter(l => !q || [l.name, l.unit, l.card.unitTitle, l.card.activity].join(' ').toLowerCase().includes(q));
}

function crmRenderBoard(desk) {
	const phone = document.body.dataset.device === 'phone';
	if (phone) { crmRenderPhoneBoard(desk); if (crmBoard.mode === 'list') return; }
	const table = document.getElementById('lead-table');
	document.querySelectorAll('.board-modes button').forEach(b => { const on = b.dataset.mode === crmBoard.mode; b.classList.toggle('is-active', on); b.classList.toggle('is-brand', on); });
	if (table) table.hidden = crmBoard.mode !== 'list';
	document.getElementById('pipeline').hidden = crmBoard.mode === 'list';
	if (crmBoard.mode === 'list' && !phone) { crmRenderLeadTable(desk); return; }
	const board = document.getElementById('pipeline');
	const lanes = (desk.board && desk.board.lanes) || {};
	const summary = desk.board && desk.board.summary;
	const leads = crmBoardLeads(desk);
	board.innerHTML = '';

	desk.stages.forEach(stage => {
		const col = crmTemplate('tpl-pipeline-column');
		col.dataset.stage = stage.id;
		col.querySelector('[data-field="stage.label"]').textContent = stage.label;
		const body = col.querySelector('.column-body');

		if (summary && summary.stage === stage.id) {
			col.querySelector('[data-field="stage.count"]').textContent = summary.count;
			col.querySelector('.column-header').insertAdjacentHTML('beforeend', `<span class="column-scope"><i data-feather="layers"></i>${summary.scope}</span>`);
			body.appendChild(crmForSaleSummary(summary));
			board.appendChild(col);
			return;
		}

		const inStage = leads.filter(l => l.stage === stage.id);
		col.querySelector('[data-field="stage.count"]').textContent = inStage.length;
		if (stage.terminal) {
			col.classList.toggle('is-collapsed', !crmBoard.showLost && !phone);
			const head = col.querySelector('.column-header');
			head.dataset.action = 'toggle-column';
			head.insertAdjacentHTML('beforeend', `<i data-feather="${crmBoard.showLost ? 'chevron-left' : 'chevron-right'}"></i>`);
		}
		body.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; col.classList.add('is-drop-target'); });
		body.addEventListener('dragleave', e => { if (!body.contains(e.relatedTarget)) col.classList.remove('is-drop-target'); });
		body.addEventListener('drop', e => {
			e.preventDefault(); col.classList.remove('is-drop-target');
			const lead = desk.leads.find(l => l.id === e.dataTransfer.getData('text/plain'));
			if (lead && lead.stage !== stage.id) crmQuickEdit(lead, { proposeStage:stage.id });
		});

		if (lanes[stage.id]) {
			lanes[stage.id].forEach(lane => {
				const inLane = inStage.filter(l => (l.card.lane || lanes[stage.id][0].id) === lane.id);
				const head = document.createElement('p');
				head.className = 'column-lane' + (lane.collapsed ? ' is-collapsed' : '');
				head.dataset.lane = lane.id;
				head.innerHTML = `<span data-field="lane.label">${lane.label}</span><span class="column-count" data-field="lane.count">${lane.count ?? inLane.length}</span>`;
				body.appendChild(head);
				if (!lane.collapsed) inLane.forEach(l => body.appendChild(crmLeadCard(l, desk)));
			});
		} else if (inStage.length) {
			inStage.forEach(l => body.appendChild(crmLeadCard(l, desk)));
		} else {
			body.innerHTML = `<p class="column-empty"><i data-feather="${stage.terminal ? 'x-circle' : 'inbox'}"></i>${stage.terminal ? 'No lost leads' : 'No new assignments'}</p>`;
		}
		board.appendChild(col);
	});
	crmIcons();
}

function crmLeadCard(lead, desk) {
	const c = lead.card;
	const el = crmTemplate('tpl-lead-card');
	el.dataset.lead = lead.id;
	el.dataset.stage = lead.stage;
	el.dataset.owner = lead.owner;
	if (c.muted) el.classList.add('is-muted');
	if (c.unread || lead.unread) el.classList.add('is-unread');
	crmFill(el, lead);

	el.draggable = document.body.dataset.device !== 'phone' && (lead.stage !== 'lost' || crmState.role !== 'sales');
	el.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', lead.id); e.dataTransfer.effectAllowed = 'move'; el.classList.add('is-dragging'); });
	el.addEventListener('dragend', () => el.classList.remove('is-dragging'));

	const dot = el.querySelector('.card-unread');
	const unread = c.unread === 'overdue' ? 'overdue' : (c.unread || lead.unread) ? 'unread' : '';
	if (unread) { dot.hidden = false; dot.dataset.status = unread; }

	const timer = el.querySelector('.card-timer');
	if (c.timer) { timer.dataset.status = c.timer.status || 'neutral'; timer.innerHTML = `${crmIcon(c.timer.icon)}<span data-field="card.timer">${c.timer.label}</span>`; }
	else timer.remove();

	const unit = el.querySelector('.card-unit');
	const unitTitle = c.unitTitle || lead.unit;
	if (unitTitle) {
		unit.querySelector('.card-unit-title').textContent = unitTitle;
		unit.querySelector('.thumb').innerHTML = c.image ? `<img src="${c.image}" alt="" data-field="unit.image">` : `<svg><use href="#${c.svg || 'rv-trailer'}"/></svg>`;
		if (!c.price) unit.querySelector('.card-price').remove();
	} else unit.remove();

	const badges = el.querySelector('.card-badges');
	badges.innerHTML = (c.badges || []).map(b => `<span class="pill pill-tag" data-status="${b.status}" data-field="card.badge">${b.label}</span>`).join('');

	const source = el.querySelector('.card-source');
	if (c.stock) source.insertAdjacentHTML('afterbegin', `<span class="card-stock" data-field="card.stock">${c.stock}</span> · `);
	if (!c.loc) source.querySelector('.card-loc').remove();

	el.querySelector('.card-activity i').dataset.feather = c.activityIcon || 'message-circle';

	const flag = el.querySelector('.card-flag');
	if (c.flag) { flag.dataset.tone = c.flag.tone || 'warn'; flag.innerHTML = `${crmIcon(c.flag.icon || 'flag')}<span data-field="card.flag">${c.flag.text}</span>`; }
	else flag.remove();
	return el;
}

/* ---- lead row: the list form of a lead — used by the phone board and the desktop List layout ---- */
function crmLeadTimer(lead) { const t = lead.card && lead.card.timer; return t ? `<span class="pill card-timer" data-status="${t.status || 'neutral'}">${crmIcon(t.icon)}<span data-field="card.timer">${t.label}</span></span>` : ''; }
function crmLeadRow(lead, desk) {
	const c = lead.card || {};
	const unread = c.unread === 'overdue' ? 'overdue' : (c.unread || lead.unread) ? 'unread' : '';
	const showOwner = !!CRM_DATA.roles[crmState.role].owners;
	return `<button type="button" class="lead-row ${c.muted ? 'is-muted' : ''}" data-action="open-lead-row" data-lead="${lead.id}" data-stage="${lead.stage}" data-owner="${lead.owner}">
		<span class="row-unread" data-status="${unread}"></span>
		<span class="avatar" data-field="initials">${lead.initials || ''}</span>
		<span class="row-text">
			<strong class="row-name" data-field="name">${lead.name}</strong>
			<small class="row-unit" data-field="unit">${c.unitTitle || lead.unit || [c.source, c.type].filter(Boolean).join(' · ')}</small>
			<small class="row-activity"><i data-feather="${c.activityIcon || 'message-circle'}"></i><span data-field="card.activity">${c.activity || ''}</span>${showOwner ? ` · <span data-field="owner">${lead.owner}</span>` : ''}</small>
			${c.flag ? `<small class="row-flag" data-tone="${c.flag.tone || 'warn'}">${crmIcon(c.flag.icon || 'flag')}${c.flag.text}</small>` : ''}
		</span>
		<span class="row-side">${crmLeadTimer(lead)}<time data-field="card.age">${c.age || ''}</time><i data-feather="chevron-right" class="row-chevron"></i></span>
	</button>`;
}

/* ---- List layout: a sortable table of the same leads the board shows ---- */
const CRM_TABLE_COLS = [
	{ key:'name', label:'Lead', get:l => l.name },
	{ key:'unit', label:'Unit', get:l => l.card.unitTitle || l.unit || '' },
	{ key:'stage', label:'Stage', get:l => crmStageIndex(crmDesk(), l.stage) },
	{ key:'owner', label:'Owner', get:l => l.owner, when:() => !!CRM_DATA.roles[crmState.role].owners },
	{ key:'waiting', label:'Waiting on', get:l => l.waitingOn || '', when:desk => desk.leads.some(l => l.waitingOn) },
	{ key:'activity', label:'Last activity', get:l => l.card.activity || '' },
	{ key:'age', label:'Age', get:l => crmAgeMinutes(l.card.age) },
	{ key:'timer', label:'Timer', get:l => l.card.timer ? ({ overdue:0, warn:1, ok:2, neutral:3 }[l.card.timer.status] ?? 3) : 9 }
];
function crmAgeMinutes(a) { if (!a) return 1e9; const m = String(a).match(/(\d+)\s*(m|h|d|w)/); if (!m) return { Yesterday:1440, Tuesday:4000 }[a] || 1e8; return +m[1] * { m:1, h:60, d:1440, w:10080 }[m[2]]; }
function crmRenderLeadTable(desk) {
	const wrap = document.getElementById('lead-table');
	const cols = CRM_TABLE_COLS.filter(c => !c.when || c.when(desk));
	const { key, dir } = crmBoard.sort;
	const col = cols.find(c => c.key === key) || cols[2];
	const leads = crmBoardLeads(desk).filter(l => crmBoard.showLost || l.stage !== 'lost').sort((a, b) => { const x = col.get(a), y = col.get(b); return (x < y ? -1 : x > y ? 1 : crmStageIndex(desk, a.stage) - crmStageIndex(desk, b.stage)) * dir; });
	const showOwner = !!CRM_DATA.roles[crmState.role].owners;
	wrap.innerHTML = `<table class="lead-table">
		<thead><tr>${cols.map(c => `<th scope="col" aria-sort="${c.key === col.key ? (dir > 0 ? 'ascending' : 'descending') : 'none'}"><button type="button" data-action="table-sort" data-key="${c.key}">${c.label}${c.key === col.key ? `<i data-feather="chevron-${dir > 0 ? 'up' : 'down'}"></i>` : ''}</button></th>`).join('')}</tr></thead>
		<tbody>${leads.map(l => { const c = l.card, st = desk.stages.find(x => x.id === l.stage); return `<tr class="lead-table-row ${c.muted ? 'is-muted' : ''}" data-action="quick-edit" data-lead="${l.id}" data-stage="${l.stage}" tabindex="0">
			<td class="cell-lead"><span class="row-unread" data-status="${c.unread === 'overdue' ? 'overdue' : (c.unread || l.unread) ? 'unread' : ''}"></span><span class="avatar avatar-small">${l.initials || ''}</span><span><strong data-field="name">${l.name}</strong>${c.flag ? `<small class="row-flag" data-tone="${c.flag.tone || 'warn'}">${crmIcon(c.flag.icon || 'flag')}${c.flag.text}</small>` : ''}</span></td>
			<td class="cell-unit" data-field="unit">${c.unitTitle || l.unit || [c.source, c.type].filter(Boolean).join(' · ')}</td>
			<td class="cell-stage"><span class="stage-chip" data-stage="${l.stage}"><span class="stage-dot"></span>${st ? st.label : l.stage}</span></td>
			${showOwner ? `<td class="cell-owner" data-field="owner">${l.owner}</td>` : ''}
			${cols.some(x => x.key === 'waiting') ? `<td class="cell-waiting">${l.waitingOn || '—'}</td>` : ''}
			<td class="cell-activity"><i data-feather="${c.activityIcon || 'message-circle'}"></i>${c.activity || ''}</td>
			<td class="cell-age"><time>${c.age || ''}</time></td>
			<td class="cell-timer">${crmLeadTimer(l)}</td>
		</tr>`; }).join('')}</tbody></table>
		${leads.length ? '' : '<p class="pipeline-empty">Nothing matches.</p>'}
		<p class="lead-table-foot"><label><input type="checkbox" ${crmBoard.showLost ? 'checked' : ''} data-action="toggle-column"> Show lost</label><span>${leads.length} lead${leads.length === 1 ? '' : 's'}</span></p>`;
	crmIcons();
}

/* ---- Phone board: stage strip + rows, lead screen ---- */
function crmInitPhoneBoard(desk, params) {
	const roleData = CRM_DATA.roles[crmState.role];
	const filters = (desk.board && desk.board.filters) || [];
	document.querySelector('.phone-board-stores').hidden = !filters.includes('location');
	document.querySelector('.phone-board-filter').hidden = !(filters.includes('owner') || filters.includes('waiting'));
	const deskIds = Object.keys(roleData.desks);
	if (deskIds.length > 1) { const d = document.getElementById('phone-desk'); d.hidden = false; d.querySelector('.segmented').innerHTML = deskIds.map(id => `<a href="pipeline.html?role=${crmState.role}&desk=${id}" class="${id === crmState.desk ? 'is-active is-brand' : ''}" data-action="switch-desk" data-desk="${id}">${roleData.desks[id].label}</a>`).join(''); }
	document.getElementById('phone-board-search').addEventListener('input', e => { crmBoard.search = e.target.value; document.getElementById('global-search-input').value = e.target.value; crmRenderBoard(desk); });
	addEventListener('popstate', e => { const sc = e.state && e.state.screen; if (sc === 'lead' && crmPhone.leadId) crmPhoneLeadScreen(crmPhone.leadId, false); else crmShowScreen('board', false); });
	/* swipes: the list moves a stage, the left edge on the lead screen goes back */
	let sw = null;
	const begin = (t, x, y) => { const zone = t.closest('.phone-leads') ? 'list' : (document.body.dataset.screen === 'lead' && x < 28) ? 'edge' : null; sw = zone ? { zone, x, y } : null; };
	const finish = (x, y) => { if (!sw) return; const dx = x - sw.x, dy = y - sw.y, z = sw.zone; sw = null; if (Math.abs(dx) < 50 || Math.abs(dy) > 60) return; if (z === 'edge') { if (dx > 0) CRM_ACTIONS['phone-back'](); return; } const i = desk.stages.findIndex(st => st.id === crmBoard.stage); const n = i + (dx < 0 ? 1 : -1); if (n < 0 || n >= desk.stages.length) return; crmBoard.stage = desk.stages[n].id; crmPhoneSlide([document.getElementById('phone-leads')], dx < 0 ? 1 : -1, () => crmRenderBoard(desk)); };
	document.addEventListener('touchstart', e => { const t = e.touches[0]; begin(e.target, t.clientX, t.clientY); }, { passive:true });
	document.addEventListener('touchend', e => { const t = e.changedTouches[0]; finish(t.clientX, t.clientY); }, { passive:true });
	document.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse' && e.button === 0) begin(e.target, e.clientX, e.clientY); });
	document.addEventListener('pointerup', e => { if (e.pointerType === 'mouse') finish(e.clientX, e.clientY); });
	if (params.get('lead') && desk.leads.some(l => l.id === params.get('lead'))) crmPhoneLeadScreen(params.get('lead'), false); else crmShowScreen('board', false);
}
function crmCenterInStrip(el) { if (!el) return; const strip = el.parentElement; strip.scrollTo({ left:el.offsetLeft - (strip.clientWidth - el.offsetWidth) / 2, behavior:'smooth' }); } /* scrollIntoView would also drag overflow-hidden ancestors */
/* Phone drag: long-press a card to lift it, drag across columns (the board auto-scrolls at the edges), drop on a column →
   the same confirm-on-drop quick edit as desktop. Before the lift, a touch just scrolls like normal. */
function crmBindTouchDrag(desk) {
	const board = document.getElementById('pipeline');
	if (board.dataset.touchDrag) return; board.dataset.touchDrag = '1';
	let press = null, drag = null, raf = null;
	const cancelPress = () => { if (press) { clearTimeout(press.timer); press = null; } };
	const lift = (card, t) => {
		const r = card.getBoundingClientRect();
		const ghost = card.cloneNode(true); ghost.className = 'lead-card drag-ghost'; ghost.style.width = `${r.width}px`; ghost.style.left = `${r.left}px`; ghost.style.top = `${r.top}px`;
		document.body.appendChild(ghost);
		card.classList.add('is-dragging');
		drag = { card, ghost, dx:t.clientX - r.left, dy:t.clientY - r.top, x:t.clientX, y:t.clientY, over:null };
		board.classList.add('is-touch-dragging');
		if (navigator.vibrate) navigator.vibrate(12);
		const tick = () => { if (!drag) return; const edge = 48, w = board.clientWidth; if (drag.x < edge) board.scrollLeft -= 8; else if (drag.x > w - edge) board.scrollLeft += 8; raf = requestAnimationFrame(tick); };
		raf = requestAnimationFrame(tick);
	};
	const moveTo = (x, y) => {
		drag.x = x; drag.y = y;
		drag.ghost.style.transform = `translate(${x - drag.dx - parseFloat(drag.ghost.style.left)}px, ${y - drag.dy - parseFloat(drag.ghost.style.top)}px) scale(1.04)`;
		drag.ghost.hidden = true; const col = document.elementFromPoint(x, y)?.closest('.pipeline-column'); drag.ghost.hidden = false;
		if (col !== drag.over) { drag.over?.classList.remove('is-drop-target'); drag.over = col; col?.classList.add('is-drop-target'); }
	};
	const drop = () => {
		if (!drag) return;
		cancelAnimationFrame(raf);
		const { card, ghost, over } = drag; drag = null;
		board.classList.remove('is-touch-dragging'); card.classList.remove('is-dragging'); over?.classList.remove('is-drop-target'); ghost.remove();
		board.dataset.suppressClick = '1'; setTimeout(() => delete board.dataset.suppressClick, 300);
		const lead = desk.leads.find(l => l.id === card.dataset.lead);
		if (lead && over && over.dataset.stage && over.dataset.stage !== lead.stage) crmQuickEdit(lead, { proposeStage:over.dataset.stage });
	};
	board.addEventListener('touchstart', e => {
		const card = e.target.closest('.lead-card'); if (!card || e.touches.length !== 1) return;
		if (card.dataset.stage === 'lost' && crmState.role === 'sales') return;
		const t = e.touches[0];
		press = { card, x:t.clientX, y:t.clientY, timer:setTimeout(() => { const p = press; press = null; lift(p.card, t); }, 320) };
	}, { passive:true });
	board.addEventListener('touchmove', e => {
		const t = e.touches[0];
		if (press && Math.hypot(t.clientX - press.x, t.clientY - press.y) > 8) cancelPress(); /* it's a scroll, not a press */
		if (drag) { e.preventDefault(); moveTo(t.clientX, t.clientY); }
	}, { passive:false });
	board.addEventListener('touchend', () => { cancelPress(); drop(); });
	board.addEventListener('touchcancel', () => { cancelPress(); drop(); });
	/* mouse on a phone-sized window: plain drag (no long press) so it can be tried on a desktop */
	board.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse' || document.body.dataset.device !== 'phone') return; const card = e.target.closest('.lead-card'); if (!card) return; press = { card, x:e.clientX, y:e.clientY, timer:0 }; });
	board.addEventListener('pointermove', e => { if (e.pointerType !== 'mouse' || document.body.dataset.device !== 'phone') return; if (press && !drag && Math.hypot(e.clientX - press.x, e.clientY - press.y) > 6) { const p = press; press = null; lift(p.card, e); } if (drag) moveTo(e.clientX, e.clientY); });
	board.addEventListener('pointerup', e => { if (e.pointerType !== 'mouse') return; if (press) press = null; if (drag) { drop(); e.preventDefault(); } });
	board.addEventListener('click', e => { if (board.dataset.suppressClick) { e.stopPropagation(); e.preventDefault(); delete board.dataset.suppressClick; } }, true);
}

function crmRenderPhoneBoard(desk) {
	const wrap = document.querySelector('.phone-board'); if (!wrap) return;
	const leads = crmBoardLeads(desk);
	const summary = desk.board && desk.board.summary;
	const strip = document.getElementById('phone-stages');
	strip.innerHTML = desk.stages.map(st => { const n = summary && summary.stage === st.id ? summary.count : leads.filter(l => l.stage === st.id).length; return `<button type="button" class="stage-pill ${st.id === crmBoard.stage ? 'is-selected' : ''} ${st.terminal ? 'is-terminal' : ''}" data-action="phone-stage-pick" data-stage="${st.id}"><span class="stage-dot"></span>${st.label}<span class="column-count">${n}</span></button>`; }).join('');
	crmCenterInStrip(strip.querySelector('.is-selected'));
	const list = document.getElementById('phone-leads');
	const stage = desk.stages.find(st => st.id === crmBoard.stage) || desk.stages[0];
	const board = document.getElementById('pipeline');
	if (board.parentElement !== wrap) wrap.insertBefore(board, list.nextSibling);
	const modeBtn = wrap.querySelector('.phone-board-mode');
	modeBtn.innerHTML = `<i data-feather="${crmBoard.mode === 'board' ? 'server' : 'columns'}"></i>`; modeBtn.setAttribute('aria-label', crmBoard.mode === 'board' ? 'Switch to list' : 'Switch to board');
	list.hidden = crmBoard.mode === 'board'; board.hidden = crmBoard.mode !== 'board';
	if (crmBoard.mode === 'board') {
		/* the columns are rendered by crmRenderBoard right after this; snap to the selected stage once they exist */
		requestAnimationFrame(() => { const col = board.querySelector(`.pipeline-column[data-stage="${crmBoard.stage}"]`); if (col && !crmBoard._syncing) board.scrollTo({ left:col.offsetLeft - 14, behavior:'auto' }); });
		if (!board.dataset.phoneBound) { board.dataset.phoneBound = '1'; let settle; board.addEventListener('scroll', () => {
			/* a pill tap sets crmBoard._target; while that programmatic scroll is in flight the strip stays put */
			clearTimeout(settle);
			settle = setTimeout(() => {
				const cols = [...board.querySelectorAll('.pipeline-column')];
				const visible = c => c.offsetLeft - 14 >= board.scrollLeft - 8 && c.offsetLeft - 14 <= board.scrollLeft + board.clientWidth - 40;
				let cur;
				if (crmBoard._target) { const t = cols.find(c => c.dataset.stage === crmBoard._target); if (t && visible(t)) cur = t; crmBoard._target = null; }
				if (!cur) cur = cols.reduce((best, c) => Math.abs(c.offsetLeft - 14 - board.scrollLeft) < Math.abs(best.offsetLeft - 14 - board.scrollLeft) ? c : best, cols[0]); /* nearest column to the left edge */
				if (cur && cur.dataset.stage !== crmBoard.stage) { crmBoard.stage = cur.dataset.stage; strip.querySelectorAll('.stage-pill').forEach(p => p.classList.toggle('is-selected', p.dataset.stage === crmBoard.stage)); crmCenterInStrip(strip.querySelector('.is-selected')); }
			}, 90);
		}, { passive:true }); }
		crmIcons();
		if (document.body.dataset.screen === 'lead' && crmPhone.leadId) crmPhoneLeadScreen(crmPhone.leadId, false);
		return;
	}
	if (crmBoard.search.trim()) {
		list.innerHTML = desk.stages.map(st => { const inStage = leads.filter(l => l.stage === st.id); return inStage.length ? `<p class="agenda-date">${st.label}</p>${inStage.map(l => crmLeadRow(l, desk)).join('')}` : ''; }).join('') || `<p class="column-empty"><i data-feather="search"></i>Nothing matches “${crmBoard.search.trim()}”</p>`;
	} else if (summary && summary.stage === stage.id) {
		list.innerHTML = ''; list.appendChild(crmForSaleSummary(summary));
	} else {
		const inStage = leads.filter(l => l.stage === stage.id);
		list.innerHTML = inStage.length ? inStage.map(l => crmLeadRow(l, desk)).join('') : `<p class="column-empty"><i data-feather="${stage.terminal ? 'x-circle' : 'inbox'}"></i>${stage.terminal ? 'No lost leads' : 'Nothing here'}</p>`;
	}
	const dot = wrap.querySelector('.phone-board-filter .phone-filter-dot');
	if (dot) { const allOwners = !CRM_MENUS.reps || CRM_MENUS.reps.selected.size === CRM_MENUS.reps.items().length; const allWaiting = !CRM_MENUS.waiting || CRM_MENUS.waiting.selected.size === CRM_MENUS.waiting.items().length; dot.hidden = allOwners && allWaiting; }
	crmIcons();
	if (document.body.dataset.screen === 'lead' && crmPhone.leadId) crmPhoneLeadScreen(crmPhone.leadId, false);
}
function crmPhoneLeadScreen(id, push) {
	const desk = crmDesk();
	const lead = desk.leads.find(l => l.id === id); if (!lead) return;
	const roleData = CRM_DATA.roles[crmState.role];
	crmPhone.leadId = id; crmState.leadId = id;
	const head = document.querySelector('.phone-lead-screen .phone-topbar');
	head.querySelector('[data-field="initials"]').textContent = lead.initials || '';
	head.querySelector('[data-field="name"]').textContent = lead.name;
	const c = lead.card || {};
	const stage = desk.stages.find(st => st.id === lead.stage);
	const nextFollowup = (CRM_DATA.calendar.events[crmState.role] || []).filter(e => e.kind === 'followup' && e.lead === lead.id && !e.done).sort((a, b) => a.date.localeCompare(b.date) || a.start - b.start)[0];
	const store = CRM_DATA.stores.find(st => st.code === crmLeadStore(lead));
	document.getElementById('phone-lead-body').innerHTML = `
		${c.unitTitle || lead.unit ? `<div class="phone-lead-unit"><span class="thumb">${c.image ? `<img src="${c.image}" alt="">` : `<svg><use href="#${c.svg || 'rv-trailer'}"/></svg>`}</span><span><strong data-field="unit">${c.unitTitle || lead.unit}</strong>${c.price ? `<small data-field="card.price">${c.price}</small>` : ''}${c.stock ? `<small data-field="card.stock">${c.stock}</small>` : ''}</span></div>` : ''}
		${c.flag ? `<p class="card-flag" data-tone="${c.flag.tone || 'warn'}">${crmIcon(c.flag.icon || 'flag')}<span>${c.flag.text}</span></p>` : ''}
		<div class="phone-lead-group">
			<button type="button" class="sheet-row" data-action="quick-edit" data-lead="${lead.id}"><span class="stage-dot" data-stage="${lead.stage}"></span><span class="sheet-row-text"><strong>${stage ? stage.label : lead.stage}</strong><small>${lead.stageNote || 'Moves from what you log'}</small></span>${crmLeadTimer(lead)}${crmIcon('chevron-right')}</button>
			<p class="sheet-row is-static">${crmIcon('user')}<span class="sheet-row-text"><strong>${lead.owner}</strong><small>${roleData.owners ? 'Owner · tap the stage row to reassign' : 'Owner'}</small></span></p>
			${lead.waitingOn ? `<p class="sheet-row is-static">${crmIcon('loader')}<span class="sheet-row-text"><strong>Waiting on ${lead.waitingOn}</strong><small>Back office</small></span></p>` : ''}
			<p class="sheet-row is-static">${crmIcon('map-pin')}<span class="sheet-row-text"><strong>${store ? store.name : lead.location || ''}</strong><small>${c.loc || c.source ? [c.source, c.type].filter(Boolean).join(' · ') : ''}</small></span></p>
			<button type="button" class="sheet-row" data-action="quick-edit" data-lead="${lead.id}" data-focus="followup">${crmIcon('clock')}<span class="sheet-row-text"><strong>${nextFollowup ? nextFollowup.label : 'No follow-up set'}</strong><small>${nextFollowup ? `${crmFmt(crmDate(nextFollowup.date), 'short')} · ${crmHourLabel(nextFollowup.start)}` : 'Tap to add one'}</small></span>${crmIcon('chevron-right')}</button>
		</div>
		<div class="phone-lead-group">
			<p class="sheet-row is-static">${crmIcon(c.activityIcon || 'message-circle')}<span class="sheet-row-text"><strong>${c.activity || 'No activity yet'}</strong><small>${c.age || ''}</small></span></p>
		</div>
		<div class="phone-lead-actions">
			<a class="btn btn-primary" href="daily-view.html${crmQuery({ lead:lead.id })}">${crmIcon('message-circle')}Open conversation</a>
			<a class="btn" href="tel:${(lead.phone || '').replace(/\D/g, '')}">${crmIcon('phone')}Call</a>
		</div>`;
	crmIcons();
	crmShowScreen('lead', push);
}

function crmForSaleSummary(summary) {
	const el = crmTemplate('tpl-forsale-summary');
	crmFill(el, summary);
	el.querySelector('.bucket-list').innerHTML = summary.buckets.rows.map(([label, count]) =>
		`<button type="button" class="bucket-row" data-action="open-bucket" data-bucket="${label}"><span data-field="bucket.label">${label}</span><strong data-field="bucket.count">${count}</strong><i data-feather="chevron-right"></i></button>`
	).join('');
	el.querySelector('.queue-list').innerHTML = summary.queues.rows.map(q =>
		`<button type="button" class="queue-row" data-action="open-queue" data-queue="${q.label}"><span class="queue-dot" data-tone="${q.tone}"></span><span class="queue-label" data-field="queue.label">${q.label}</span><strong data-field="queue.count">${q.count}</strong><i data-feather="chevron-right"></i>${q.note ? `<span class="queue-note"><i data-feather="corner-down-right"></i><span data-field="queue.note">${q.note}</span><time data-field="queue.age">${q.age || ''}</time></span>` : ''}</button>`
	).join('');
	return el;
}

/* ========================================================================== */
/* ACTION SHEETS — every data-action does or shows something                 */
/* Actions with a real implementation elsewhere are not in this registry;    */
/* everything here either performs a prototype-level version of the action   */
/* or opens a sheet that states WHY the control exists and what it would do. */
/* ========================================================================== */
document.addEventListener('focusout', e => { const f = e.target.closest?.('.global-search'); if (f && !e.target.value) setTimeout(() => { if (!f.contains(document.activeElement)) { f.classList.remove('is-open'); f.querySelector('.global-search-toggle').setAttribute('aria-expanded', 'false'); } }, 80); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && e.target.closest?.('.global-search')) { e.target.value = ''; e.target.dispatchEvent(new Event('input', { bubbles:true })); e.target.blur(); } });
document.addEventListener('click', e => {
	const el = e.target.closest('[data-action]');
	if (!el) return;
	const fn = CRM_ACTIONS[el.dataset.action];
	if (!fn) return;
	if (!(el.matches('input[type="checkbox"], input[type="radio"]'))) e.preventDefault(); /* preventDefault would undo a checkbox's toggle */
	fn(el, e);
});

function crmEnsureModal() {
	if (document.getElementById('crm-modal')) return;
	document.body.insertAdjacentHTML('beforeend', `
	<!-- ===== MODAL : shared dialog (same block as the website) — action sheets render here ===== -->
	<div class="modal" id="crm-modal" aria-hidden="true">
		<div class="overlay" tabindex="-1" data-micromodal-close>
			<div class="modal-frame"><div class="modal-window" role="dialog" aria-modal="true" aria-labelledby="crm-modal-title">
				<header class="modal-header"><h2 class="title" id="crm-modal-title"></h2><button type="button" class="menu-btn close" aria-label="Close" data-micromodal-close><i data-feather="x"></i></button></header>
				<div class="modal-content"></div>
				<footer class="modal-footer"></footer>
			</div></div>
		</div>
	</div>`);
}

function crmSheet({ title, reason, body = '', actions = [] }) {
	crmEnsureModal();
	const m = document.getElementById('crm-modal');
	m.querySelector('.title').textContent = title;
	m.querySelector('.modal-content').innerHTML = (reason ? `<p class="sheet-reason"><i data-feather="info"></i><span>${reason}</span></p>` : '') + body;
	const f = m.querySelector('.modal-footer');
	f.innerHTML = actions.map((a, i) => `<button type="button" class="btn ${a.primary ? 'btn-primary' : ''}" data-sheet-action="${i}">${a.label}</button>`).join('');
	f.querySelectorAll('button').forEach((b, i) => b.addEventListener('click', () => { const r = actions[i].run ? actions[i].run(m) : undefined; if (r !== false) MicroModal.close('crm-modal'); }));
	crmIcons();
	MicroModal.show('crm-modal', { disableScroll:true, awaitCloseAnimation:false });
	return m;
}
function crmClose() { if (document.getElementById('crm-modal')?.classList.contains('is-open')) MicroModal.close('crm-modal'); }

/* append an entry to the open thread (daily view only) */
function crmPushThread(entry) {
	const lead = typeof crmCurrentLead === 'function' && crmCurrentLead();
	if (!lead) return false;
	lead.thread.push(entry);
	const thread = document.getElementById('thread');
	thread.appendChild(crmThreadEntry(entry));
	crmIcons();
	thread.scrollTop = thread.scrollHeight;
	crmPersist();
	return true;
}
function crmFirst(lead) { return lead ? lead.name.split(' ')[0] : ''; }
function crmLeadOrPick() { return (typeof crmCurrentLead === 'function' && crmCurrentLead()) || null; }
function crmRows(items, attr = 'data-pick') {
	return `<div class="sheet-list">${items.map((it, i) => `<button type="button" class="sheet-row ${it.static ? 'is-static' : ''}" ${attr}="${i}">${crmIcon(it.icon)}<span class="sheet-row-text"><strong>${it.title}</strong>${it.sub ? `<small>${it.sub}</small>` : ''}</span>${it.right || ''}</button>`).join('')}</div>`;
}

const CRM_ACTIONS = {

	/* ---- lead actions (Daily View header) ---- */
	'call': () => {
		const lead = crmLeadOrPick();
		crmSheet({
			title:`Call ${lead ? lead.name : ''}`,
			reason:'Every call attempt is logged on the timeline, so the team can see the customer was tried even when nobody answers.',
			body:`<p class="sheet-big">${lead ? lead.phone : ''}<small>Tap an outcome to log the call</small></p>` + crmRows([
				{ icon:'phone-call', title:'Connected', sub:'Add a one-line summary after' },
				{ icon:'phone-missed', title:'No answer', sub:'Counts toward contact attempts' },
				{ icon:'voicemail', title:'Left voicemail', sub:'Sets a reminder to try again' }
			]),
			actions:[]
		}).querySelectorAll('[data-pick]').forEach(b => b.addEventListener('click', () => {
			const i = +b.dataset.pick;
			crmPushThread({ type:'call', title:`Outgoing call · ${i === 0 ? '4:10' : '0:00'}`, summary:['Connected — summary pending', 'No answer', 'Left voicemail — try again tomorrow'][i] });
			crmClose();
			if (lead && i === 0 && ['assigned', 'attempting'].includes(lead.stage)) crmSetStage(lead, 'working', { by:'system' });
			else if (lead && lead.stage === 'assigned') crmSetStage(lead, 'attempting', { by:'system' });
		}));
	},
	'text': () => {
		const btn = document.querySelector('.composer-mode [data-mode="text"]');
		if (btn) { btn.click(); document.getElementById('composer-input').focus(); }
	},
	'email': () => {
		const btn = document.querySelector('.composer-mode [data-mode="email"]');
		if (btn) { btn.click(); document.getElementById('composer-input').focus(); }
	},
	'schedule': () => {
		const lead = crmLeadOrPick();
		const types = CRM_DATA.calendar.types[crmState.role === 'consignment' ? 'consignment' : 'sales'];
		const today = crmNow();
		const days = Array.from({ length:7 }, (_, i) => crmAddDays(today, i));
		const state = { store:CRM_DATA.stores[0], date:days[0], slot:null };
		const m = crmSheet({
			title:`Schedule with ${crmFirst(lead)}`,
			reason:'Where comes first because the store sets the hours. Then the customer only sees times that store is open and nobody else has booked — no back-and-forth.',
			body:`<div class="sheet-form">
				<label class="field"><span>Type</span><select id="sheet-type">${types.map(t => `<option>${t}</option>`).join('')}</select></label>
				<label class="field"><span>Where</span><select id="sheet-store" data-action="pick-store">${CRM_DATA.stores.map((st, i) => `<option value="${i}">${st.name}</option>`).join('')}</select></label>
				<p class="sheet-hours" id="sheet-hours"></p>
				<div class="sheet-days" id="sheet-days"></div>
				<div class="sheet-slots" id="sheet-slots"></div>
			</div>`,
			actions:[{ label:'Cancel' }, { label:'Book it', primary:true, run:() => {
				if (state.slot === null) { m.querySelector('#sheet-slots').classList.add('is-error'); return false; }
				const type = m.querySelector('#sheet-type').value;
				crmPushThread({ type:'event', icon:'calendar', text:`Appointment set — ${crmFmt(state.date, 'short')} · ${crmHourLabel(state.slot)} · ${state.store.name} · ${type}` });
				CRM_DATA.calendar.events[crmState.role].push({ id:'new-' + Date.now(), kind:'appointment', date:crmISO(state.date), start:state.slot, end:state.slot + 1, lead:lead ? lead.id : '', name:lead ? lead.name : '', unit:lead ? (lead.unit || (lead.summary[0] && lead.summary[0].title) || '') : '', type, svg:'rv-trailer', owner:CRM_DATA.roles[crmState.role].user.name, store:state.store.code });
				crmPersist();
			} }]
		});
		const render = () => {
			const { hours, slots } = crmSlotsFor(state.store, state.date);
			m.querySelector('#sheet-hours').innerHTML = `${crmIcon('clock')} ${state.store.name} · ${hours ? `open ${crmHourLabel(hours[0])} – ${crmHourLabel(hours[1])}` : 'closed'} on ${crmFmt(state.date, 'short')}`;
			m.querySelector('#sheet-days').innerHTML = days.map((d, i) => { const open = !!state.store.hours[crmDowKey(d)]; return `<button type="button" class="sheet-chip ${crmSameDay(d, state.date) ? 'is-active' : ''} ${open ? '' : 'is-closed'}" data-day="${i}" ${open ? '' : 'disabled'}>${crmFmt(d, 'short')}</button>`; }).join('');
			m.querySelector('#sheet-slots').innerHTML = slots.length ? slots.map(sl => `<button type="button" class="sheet-chip ${sl.h === state.slot ? 'is-active' : ''}" data-slot="${sl.h}" ${sl.taken ? 'disabled title="Already booked"' : ''}>${crmHourLabel(sl.h)}</button>`).join('') : '<p class="picker-note">Closed — pick another day.</p>';
			m.querySelector('#sheet-slots').classList.remove('is-error');
			crmIcons();
		};
		m.querySelector('#sheet-store').addEventListener('change', e => { state.store = CRM_DATA.stores[+e.target.value]; state.slot = null; render(); });
		m.querySelector('#sheet-days').addEventListener('click', e => { const b = e.target.closest('[data-day]'); if (!b) return; state.date = days[+b.dataset.day]; state.slot = null; render(); });
		m.querySelector('#sheet-slots').addEventListener('click', e => { const b = e.target.closest('[data-slot]'); if (!b) return; state.slot = +b.dataset.slot; render(); });
		render();
	},

	/* ---- role CTAs ---- */
	'mark-price-agreed': () => {
		const lead = crmLeadOrPick();
		crmSheet({
			title:'Mark price agreed',
			reason:'This is the hand-off point: once the consignor accepts a listing price, the lead leaves the salesperson\'s "working" list and paperwork starts.',
			body:`<div class="sheet-form"><label class="field"><span>Agreed listing price</span><input id="sheet-price" value="$24,900"></label><label class="field"><span>Term</span><select><option>120-day term</option><option>90-day term</option></select></label></div>`,
			actions:[{ label:'Cancel' }, { label:'Agree & start documents', primary:true, run:m => {
				const price = m.querySelector('#sheet-price').value;
				lead.cta = null;
				crmPushThread({ type:'event', icon:'tag', text:`Price agreed — ${price} · 120-day term` });
				crmSetStage(lead, 'documents', { by:'salesperson' });
			} }]
		});
	},
	'send-60-day-update': () => {
		const lead = crmLeadOrPick();
		crmSheet({
			title:'Send 60-day update',
			reason:'Consignors get a listing report at 30, 60 and 90 days — it\'s the promise made at signing. The system drafts it; the salesperson sends it.',
			body:`<div class="sheet-preview"><p class="preview-subject">Your Cougar at 60 days — 1,284 views, 23 favorites, 6 leads</p><p class="preview-body">Hi Rob and Cheryl — here\'s how the listing is doing at the halfway point of the 120-day term, plus the price recommendation from the Ocala team…</p></div>`,
			actions:[{ label:'Edit first' }, { label:'Send', primary:true, run:() => {
				crmPushThread({ type:'email', time:'Email · just now', subject:'Your Cougar at 60 days — 1,284 views, 23 favorites, 6 leads', preview:'Hi Rob and Cheryl — here\'s how the listing is doing at the halfway point of the 120-day term…', opened:false });
				if (lead) { lead.cta = null; crmOpenLead(lead.id); }
			} }]
		});
	},
	'schedule-pickup': () => {
		crmSheet({
			title:'Schedule pickup',
			reason:'When a term ends unsold, the consignor collects the unit. Pickup needs a clearance check (fees, keys, title) before the gate opens.',
			body:crmRows([{ icon:'check-circle', title:'Clearance check', sub:'Fees paid · keys · title located', static:true, right:'<span class="pill" data-status="pending">Pending</span>' }]) + `<div class="sheet-form"><label class="field"><span>Pickup window</span><input id="sheet-when" value="Fri, Aug 21 · 2:00 PM"></label></div>`,
			actions:[{ label:'Cancel' }, { label:'Book pickup', primary:true, run:m => crmPushThread({ type:'event', icon:'truck', text:`Pickup scheduled — ${m.querySelector('#sheet-when').value} · pending clearance` }) }]
		});
	},
	'request-reevaluation': () => {
		crmSheet({
			title:'Request condition re-evaluation',
			reason:'If the unit that arrived doesn\'t match what the consignor described, the agreed price is no longer valid. Inventory re-inspects before it can be listed.',
			body:crmRows([{ icon:'camera', title:'Walk-around photos', sub:'32 photos attached from check-in', static:true }, { icon:'file-text', title:'Original description', sub:'From the consignment packet', static:true }]),
			actions:[{ label:'Cancel' }, { label:'Send to Inventory Review', primary:true, run:() => crmPushThread({ type:'event', icon:'rotate-ccw', tone:'warn', text:'Re-evaluation requested — sent to Inventory Review' }) }]
		});
	},
	'waiting-on': el => {
		const lead = crmLeadOrPick();
		crmSheet({
			title:el.textContent.trim(),
			reason:'The lead is blocked on someone else. Showing who — and since when — is what lets a salesperson chase it instead of wondering.',
			body:crmRows([{ icon:'user', title:lead && lead.waitingOn ? lead.waitingOn : 'Another role', sub:`Since ${lead ? lead.time : ''} · ${lead ? lead.stageNote : ''}`, static:true }]),
			actions:[{ label:'Close' }, { label:'Nudge them', primary:true, run:() => crmPushThread({ type:'note', author:CRM_DATA.roles[crmState.role].user.name, text:`Nudged ${lead && lead.waitingOn ? lead.waitingOn : 'the team'} — waiting on their step.` }) }]
		});
	},

	/* ---- thread items ---- */
	'play-recording': el => {
		const title = el.closest('.thread-call')?.querySelector('[data-field="call.title"]')?.textContent || 'Call';
		crmSheet({ title:`Recording — ${title}`, reason:'Recorded calls let a manager review how a conversation went, and let the salesperson re-check a detail without calling back. (Assumes Optimum records outbound calls.)', body:`<div class="sheet-player"><button type="button" class="btn btn-round btn-primary" aria-label="Play"><i data-feather="play"></i></button><span class="player-bar"><i></i></span><small>2:08 / ${title.split('· ')[1] || '6:12'}</small></div>`, actions:[{ label:'Close' }] });
	},
	'open-transcript': el => {
		const summary = el.closest('.thread-call')?.querySelector('[data-field="call.summary"]')?.textContent || '';
		crmSheet({ title:'Transcript', reason:'A searchable transcript is faster to scan than a recording, and it\'s where "he said $18K" gets confirmed.', body:`<div class="sheet-transcript"><p><strong>Riley</strong><span>Hi, it\'s Riley at Optimum RV Ocala — do you have a minute?</span></p><p><strong>Customer</strong><span>Sure, I was looking at the one you texted me about.</span></p><p><strong>Riley</strong><span>Great. ${summary}</span></p><p><strong>Customer</strong><span>Yeah, if the numbers work I\'d like to move on it this week.</span></p></div>`, actions:[{ label:'Close' }] });
	},

	/* ---- composer ---- */
	'composer-add': () => {
		const m = crmSheet({
			title:'Attach',
			reason:'Salespeople send the same handful of things over and over: a unit photo, the brochure, directions, a financing worksheet.',
			body:crmRows([
				{ icon:'image', title:'Photos of the unit', sub:'From the stock record' },
				{ icon:'file', title:'Brochure (PDF)', sub:'Manufacturer spec sheet' },
				{ icon:'map-pin', title:'Directions to Ocala store' },
				{ icon:'dollar-sign', title:'Financing worksheet', sub:'Two scenarios, as discussed' },
				{ icon:'message-square', title:'Simulate customer reply', sub:'Prototype aid — pretends the customer texted back, so you can watch the stage move' }
			])
		});
		m.querySelectorAll('[data-pick]').forEach(b => b.addEventListener('click', () => {
			if (+b.dataset.pick === 4) {
				const lead = crmLeadOrPick();
				crmPushThread({ type:'message', dir:'in', text:'Hey — got your message, yes I\'m still interested. When can I come by?' });
				crmClose();
				if (lead && ['assigned', 'attempting'].includes(lead.stage)) crmSetStage(lead, 'working', { by:'system' });
				return;
			}
			crmPushThread({ type:'event', icon:'paperclip', text:`Attachment sent — ${b.querySelector('strong').textContent}` }); crmClose();
		}));
	},
	'insert-template': () => {
		const lead = crmLeadOrPick();
		const first = crmFirst(lead);
		const templates = [
			{ icon:'message-square', title:'Confirm appointment', sub:`See you ${first ? first + ' ' : ''}at 1:30 — I\'ll have it parked up front.` },
			{ icon:'message-square', title:'Directions', sub:'We\'re at 4406 S Pine Ave, Ocala — right off 441.' },
			{ icon:'message-square', title:'Financing options', sub:'Want me to run two payment scenarios for you?' },
			{ icon:'message-square', title:'Trade photos', sub:'Could you send me a few photos of your trade? Outside, inside, and the odometer.' }
		];
		const m = crmSheet({ title:'Saved replies', reason:'Canned replies keep the tone consistent and save typing on the ten messages every salesperson sends daily. Templates are managed by the store.', body:crmRows(templates) });
		m.querySelectorAll('[data-pick]').forEach(b => b.addEventListener('click', () => { const i = +b.dataset.pick; const input = document.getElementById('composer-input'); input.value = templates[i].sub; input.focus(); crmClose(); }));
	},

	/* ---- new lead (compose in Daily View, + in Pipeline) ---- */
	'compose-new': () => CRM_ACTIONS['new-lead'](),
	'new-lead': () => {
		const roleData = CRM_DATA.roles[crmState.role];
		const desk = crmDesk();
		crmSheet({
			title:'New lead',
			reason:'Walk-ins, phone calls and referrals don\'t come through the website form — the salesperson logs them here so they get the same timeline and follow-ups as a web lead.',
			body:`<div class="sheet-form">
				<label class="field"><span>Name</span><input id="nl-name" placeholder="First and last name"></label>
				<label class="field"><span>Phone</span><input id="nl-phone" placeholder="352-555-0100"></label>
				<label class="field"><span>Source</span><select id="nl-source"><option>Walk-In</option><option>Phone Call</option><option>Referral</option><option>Drive By</option></select></label>
				<label class="field"><span>Interest</span><select id="nl-type">${(crmState.desk === 'consign' ? ['Consignment'] : ['General Info', 'Get Lowest Price', 'Make Offer', 'Trade Evaluation']).map(t => `<option>${t}</option>`).join('')}</select></label>
			</div>`,
			actions:[{ label:'Cancel' }, { label:'Create lead', primary:true, run:m => {
				const name = m.querySelector('#nl-name').value.trim() || 'New Customer';
				const source = m.querySelector('#nl-source').value, type = m.querySelector('#nl-type').value;
				const id = 'new-' + Date.now();
				const lead = { id, name, initials:name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(), phone:m.querySelector('#nl-phone').value || '—', email:'—', location:roleData.user.location, owner:roleData.user.name,
					tabs:[desk.tabs[0].id, desk.tabs[desk.tabs.length - 1].id], unread:'unread', time:'Just now', preview:`${source} · ${type} — logged by ${roleData.user.name}`, pill:{ label:'15m left', status:'urgent', icon:'clock' },
					stage:desk.stages[0].id, stageNote:'Assigned · just now', waitingOn:'Lister', summary:[{ kind:'icon', icon:'map-pin', tone:'info', title:`${source} · ${type}`, meta:'Logged manually', status:[{ label:'New', status:'info' }] }],
					composerStatus:'Text opt-in pending', thread:[{ type:'day', label:'Today', time:'now' }, { type:'event', icon:'inbox', text:`Lead logged — ${source} · ${type}` }, { type:'event', icon:'user', text:`Assigned to ${roleData.user.name}` }],
					card:{ source, type, timer:{ label:'15m left', status:'urgent', icon:'clock' }, activity:`Logged by ${roleData.user.name}`, activityIcon:'inbox', age:'now', unread:true } };
				desk.leads.unshift(lead);
				crmPersist();
				if (document.body.dataset.view === 'daily-view') { crmRenderTabs(desk); crmRenderInbox(desk); crmOpenLead(id); }
				else if (document.body.dataset.view === 'pipeline') crmRenderBoard(desk);
				else location.href = `daily-view.html${crmQuery({ lead:id })}`;
			} }]
		});
	},

	/* ---- sidebar ---- */
	'open-help': () => {
		crmSheet({
			title:'Help center',
			reason:'A legend for every dot, pill and badge in the CRM, so nobody has to guess what a color means.',
			body:`<p class="sheet-label">Inbox dots</p>` + crmRows([
				{ icon:'circle', title:'Blue dot', sub:'Unread — the customer replied and you haven\'t opened it', static:true, right:'<span class="item-unread" data-status="unread" style="position:static;margin:0"></span>' },
				{ icon:'circle', title:'Orange dot', sub:'Overdue — you promised a follow-up and the time has passed', static:true, right:'<span class="item-unread" data-status="overdue" style="position:static;margin:0"></span>' }
			]) + `<p class="sheet-label">Status pills (under the time)</p>` + crmRows([
				{ icon:'clock', title:'3m left', sub:'Response clock on a new lead (15-minute rule)', static:true, right:'<span class="pill" data-status="urgent">3m left</span>' },
				{ icon:'clock', title:'Overdue 2h', sub:'A promised follow-up is late', static:true, right:'<span class="pill" data-status="overdue">Overdue 2h</span>' },
				{ icon:'calendar', title:'1:30 PM · Thu · Ocala', sub:'Next appointment with this customer', static:true, right:'<span class="pill" data-status="appointment">1:30 PM</span>' },
				{ icon:'loader', title:'Signature · Payoff · Fee · Drop-off', sub:'Waiting on the customer for that item', static:true, right:'<span class="pill">Signature</span>' },
				{ icon:'alert-triangle', title:'Delivery hold · CIT hold · Term ended', sub:'Something is blocking the deal — needs a person', static:true, right:'<span class="pill" data-status="overdue">Delivery hold</span>' },
				{ icon:'more-horizontal', title:'Day 1', sub:'Where the lead is in the contact cadence', static:true, right:'<span class="pill">Day 1</span>' }
			]) + `<p class="sheet-label">Pipeline stages</p>` + crmRows([
				{ icon:'columns', title:'Assigned → Attempting → Working → Agreed', sub:'Moves automatically from what you log; Agreed and Lost are yours to set', static:true }
			]),
			actions:[{ label:'Close', primary:true }]
		});
	},
	'open-settings': () => {
		const u = CRM_DATA.roles[crmState.role].user;
		const m = crmSheet({
			title:'Settings',
			reason:'The few things a salesperson controls about their own account. Store-wide settings (templates, stages, assignment rules) live with the manager.',
			body:crmRows([
				{ icon:'user', title:u.name, sub:`${u.location} · ${CRM_DATA.roles[crmState.role].label}`, static:true },
				{ icon:'bell', title:'Notifications', sub:'New lead, customer reply, overdue follow-up', static:true, right:'<label class="calendar-toggle"><input type="checkbox" checked></label>' },
				{ icon:'message-circle', title:'Text signature', sub:`— ${u.name.split(' ')[0]}, Optimum RV ${u.location.split(',')[0]}`, static:true },
				{ icon:'clock', title:'Working hours', sub:'Mon–Sat 8 AM – 7 PM · automated texts pause outside', static:true, right:'<label class="calendar-toggle"><input type="checkbox" checked></label>' },
				{ icon:'smartphone', title:'Phone preview', sub:'Prototype only — show the phone layout in this window', right:`<span class="pill">${document.body.dataset.device === 'phone' ? 'On' : 'Off'}</span>` },
				{ icon:'refresh-cw', title:'Reset demo data', sub:'Prototype only — undo every change made in this browser session', right:'<span class="pill">Prototype</span>' }
			], 'data-settings-pick'),
			actions:[{ label:'Done', primary:true }]
		});
		m.querySelector('[data-settings-pick="4"]').addEventListener('click', () => { try { const on = document.body.dataset.device === 'phone'; sessionStorage.setItem('optimumrv-crm-device', on ? 'desktop' : 'phone'); } catch (e) {} const u = new URL(location.href); u.searchParams.delete('device'); location.href = u.toString(); });
		m.querySelector('[data-settings-pick="5"]').addEventListener('click', crmResetDemo);
	},

	/* ---- pipeline: For Sale drill-downs ---- */
	'open-bucket': el => {
		const label = el.dataset.bucket, count = el.querySelector('strong').textContent;
		const desk = crmDesk();
		const sample = desk.leads.filter(l => l.card && l.card.stock).slice(0, 4);
		const m = crmSheet({ title:`${label} on lot · ${count}`, reason:'Days-on-lot is the number that drives price drops and term-end conversations. The bucket is a shortcut to every unit in that window.', body:crmRows(sample.map(l => ({ icon:'truck', title:l.unit, sub:`${l.card.stock} · ${l.name} · ${l.card.loc}`, right:`<span class="pill">${l.card.price || ''}</span>` })), 'data-lead-pick') + `<p class="picker-note">Showing ${sample.length} of ${count} — the developer wires this to the inventory query.</p>` });
		m.querySelectorAll('[data-lead-pick]').forEach((b, i) => b.addEventListener('click', () => { location.href = `daily-view.html${crmQuery({ lead:sample[i].id })}`; }));
	},
	'open-queue': el => {
		const label = el.dataset.queue, count = el.querySelector('strong').textContent;
		const desk = crmDesk();
		const sample = desk.leads.filter(l => l.card && l.card.stock).slice(0, 3);
		const m = crmSheet({ title:`${label} · ${count}`, reason:'Queues are the "someone must act" lists — a term is ending, or a consignor wants their unit back. They\'re worked oldest-first.', body:crmRows(sample.map(l => ({ icon:'alert-circle', title:l.name, sub:`${l.unit} · ${l.card.stock}`, right:`<span class="pill" data-status="flagged">${l.card.timer ? l.card.timer.label : ''}</span>` })), 'data-lead-pick') });
		m.querySelectorAll('[data-lead-pick]').forEach((b, i) => b.addEventListener('click', () => { location.href = `daily-view.html${crmQuery({ lead:sample[i].id })}`; }));
	}
};

/* ========================================================================== */
/* STAGE ENGINE — the one place a lead's status changes                      */
/* Entry points: automation from thread actions, the quick-edit popup, and   */
/* drag-and-drop. `by` is who did it — the field the developer maps to auth. */
/* ========================================================================== */
const CRM_LOST_REASONS = ['Bought elsewhere', 'No financing', 'Stopped responding', 'Changed mind', 'Other'];

function crmStageIndex(desk, id) { return desk.stages.findIndex(s => s.id === id); }

/* which stages a person may set by hand, per role */
function crmCanSetStage(lead, stage) {
	if (crmState.role === 'sales') return ['agreed', 'lost'].includes(stage) || (lead.stage === 'lost' && stage === 'working');
	return true;
}

function crmSetStage(lead, stage, opts = {}) {
	const desk = crmDesk();
	if (lead.stage === stage) return;
	const from = desk.stages.find(s => s.id === lead.stage), to = desk.stages.find(s => s.id === stage);
	if (!to) return;
	const backward = (from && from.terminal) || (!to.terminal && from && crmStageIndex(desk, stage) < crmStageIndex(desk, lead.stage));
	lead.stage = stage; lead.stageDone = false; lead.stageNote = `${to.label} · just now`;
	if (from && from.id === 'assigned') { lead.tabs = lead.tabs.filter(t => t !== 'new'); if (lead.card) lead.card.timer = null; lead.pill = null; }
	if (to.terminal) {
		lead.lost = { reason:opts.reason || 'Other', when:'just now' };
		lead.tabs = []; lead.pill = null; lead.cta = null;
		lead.card = Object.assign(lead.card || { source:'—', type:'—' }, { muted:true, timer:{ label:'Lost', status:'neutral' }, activity:`Lost — ${opts.reason || 'no reason given'}`, activityIcon:'x-circle', age:'now', flag:null, lane:null });
	} else if (from && from.terminal) {
		lead.lost = null;
		if (!lead.tabs.length) lead.tabs = [desk.tabs[desk.tabs.length - 1].id];
		if (lead.card) Object.assign(lead.card, { muted:false, timer:null, activity:'Reopened', activityIcon:'rotate-ccw', age:'now' });
	} else if (lead.card) { lead.card.lane = null; }
	const user = CRM_DATA.roles[crmState.role].user.name;
	const by = opts.by === 'system' ? 'System' : opts.by === 'manager' ? `${user} (Manager)` : user;
	lead.thread.push({ type:'event', icon:'columns', tone:backward ? 'warn' : undefined, text:`Stage changed — ${from ? from.label : '—'} → ${to.label} · by ${by}${opts.reason ? ` · ${opts.reason}` : ''}` });
	crmPersist();
	const view = document.body.dataset.view;
	if (view === 'pipeline') crmRenderBoard(desk);
	if (view === 'daily-view') {
		crmRenderTabs(desk);
		crmRenderInbox(desk, document.getElementById('inbox-search-input').value);
		if (crmState.leadId === lead.id) crmOpenLead(lead.id);
	}
}

/* ========================================================================== */
/* QUICK EDIT — card popup: stage, owner, next follow-up, open conversation  */
/* ========================================================================== */
function crmQuickEdit(lead, opts = {}) {
	const desk = crmDesk();
	const roleData = CRM_DATA.roles[crmState.role];
	const state = { proposed:null };
	const unit = lead.card && lead.card.unitTitle || lead.unit || '';
	const nextFollowup = (CRM_DATA.calendar.events[crmState.role] || []).filter(e => e.kind === 'followup' && e.lead === lead.id && !e.done).sort((a, b) => a.date.localeCompare(b.date) || a.start - b.start)[0];
	const ownerRow = roleData.owners
		? `<label class="sheet-row is-static"><i data-feather="user"></i><span class="sheet-row-text"><strong>Owner</strong></span><select id="qe-owner" data-action="quick-reassign">${roleData.owners.map(o => `<option ${o === lead.owner ? 'selected' : ''}>${o}</option>`).join('')}</select></label>`
		: `<p class="sheet-row is-static"><i data-feather="user"></i><span class="sheet-row-text"><strong>Owner</strong><small>${lead.owner}</small></span></p>`;
	const m = crmSheet({
		title:lead.name,
		reason:'Stages move on their own from what you log. This is where a person corrects the board — the system records who did it.',
		body:`<div class="quick-edit" data-lead="${lead.id}">
			<p class="qe-identity">${unit ? `<span>${unit}</span>` : ''}<span>${lead.location || ''}</span></p>
			<p class="sheet-label">Stage</p>
			<div class="stage-picker">${desk.stages.map(st => {
				const allowed = crmCanSetStage(lead, st.id) && st.id !== lead.stage;
				return `<button type="button" class="stage-step ${st.id === lead.stage ? 'is-current' : ''} ${st.terminal ? 'is-terminal' : ''}" data-action="quick-stage" data-stage="${st.id}" ${allowed ? '' : 'disabled'} title="${st.id === lead.stage ? 'Current stage' : allowed ? '' : 'Moves automatically from what you log'}">${st.label}</button>`;
			}).join('')}</div>
			<p class="qe-hint" id="qe-hint">${crmState.role === 'sales' ? 'You can set Agreed or Lost. Everything else moves from what you log.' : 'Manager override — moving backward asks for a reason.'}</p>
			<div class="qe-reason" id="qe-reason" hidden><label class="field"><span>Reason</span><select id="qe-reason-select"></select></label></div>
			<p class="sheet-label">Owner</p>${ownerRow}
			<p class="sheet-label">Next follow-up</p>
			<p class="sheet-row is-static"><i data-feather="clock"></i><span class="sheet-row-text"><strong>${nextFollowup ? nextFollowup.label : 'None scheduled'}</strong><small>${nextFollowup ? `${crmFmt(crmDate(nextFollowup.date), 'short')} · ${crmHourLabel(nextFollowup.start)}` : 'Nothing on the calendar for this lead'}</small></span><button type="button" class="sheet-chip" data-action="quick-followup">Add follow-up</button></p>
		</div>`,
		actions:[
			{ label:'Open conversation', run:() => { location.href = `daily-view.html${crmQuery({ lead:lead.id })}`; return false; } },
			{ label:'Done', primary:true, run:() => {
				if (!state.proposed) return;
				const reason = m.querySelector('#qe-reason').hidden ? '' : m.querySelector('#qe-reason-select').value;
				crmSetStage(lead, state.proposed, { by:crmState.role === 'sales' ? 'salesperson' : 'manager', reason });
			} }
		]
	});
	const propose = stage => {
		state.proposed = stage;
		m.querySelectorAll('.stage-step').forEach(b => b.classList.toggle('is-proposed', b.dataset.stage === stage));
		const to = desk.stages.find(s => s.id === stage);
		const backward = (to.terminal) || crmStageIndex(desk, stage) < crmStageIndex(desk, lead.stage) || lead.stage === 'lost';
		const reasonWrap = m.querySelector('#qe-reason');
		const sel = m.querySelector('#qe-reason-select');
		if (to.terminal) sel.innerHTML = CRM_LOST_REASONS.map(r => `<option>${r}</option>`).join('');
		else sel.innerHTML = ['Logged in error', 'Customer went quiet', 'Deal fell through', 'Reopened by request', 'Other'].map(r => `<option>${r}</option>`).join('');
		reasonWrap.hidden = !backward;
		m.querySelector('#qe-hint').textContent = backward ? `Moving to ${to.label} — pick a reason, then Apply.` : `Will move to ${to.label} when you Apply.`;
		const primary = m.querySelector('.modal-footer .btn-primary'); primary.textContent = 'Apply';
	};
	m.querySelectorAll('.stage-step').forEach(b => b.addEventListener('click', () => { if (!b.disabled) propose(b.dataset.stage); }));
	const ownerSel = m.querySelector('#qe-owner');
	if (ownerSel) ownerSel.addEventListener('change', () => {
		const from = lead.owner; lead.owner = ownerSel.value;
		lead.thread.push({ type:'event', icon:'user', text:`Reassigned — ${from} → ${lead.owner} · by ${roleData.user.name} (Manager)` });
		crmPersist();
		if (document.body.dataset.view === 'pipeline') crmRenderBoard(desk);
	});
	m.querySelector('[data-action="quick-followup"]').addEventListener('click', () => {
		const d = crmAddDays(crmNow(), 1);
		(CRM_DATA.calendar.events[crmState.role] = CRM_DATA.calendar.events[crmState.role] || []).push({ id:'new-' + Date.now(), kind:'followup', date:crmISO(d), start:10, lead:lead.id, label:`Follow up with ${lead.name}` });
		lead.thread.push({ type:'event', icon:'clock', text:`Follow-up set — ${crmFmt(d, 'short')} · 10 AM` });
		const row = m.querySelector('[data-action="quick-followup"]').closest('.sheet-row');
		row.querySelector('strong').textContent = `Follow up with ${lead.name}`;
		row.querySelector('small').textContent = `${crmFmt(d, 'short')} · 10 AM`;
		m.querySelector('[data-action="quick-followup"]').remove();
		crmPersist();
	});
	if (opts.proposeStage) {
		const btn = m.querySelector(`.stage-step[data-stage="${opts.proposeStage}"]`);
		if (btn && !btn.disabled) propose(opts.proposeStage);
		else if (btn) m.querySelector('#qe-hint').textContent = `${desk.stages.find(s => s.id === opts.proposeStage).label} moves automatically from what you log — it can't be set by hand.`;
	}
	crmIcons();
}

Object.assign(CRM_ACTIONS, {
	'quick-edit': el => { const card = el.closest('.lead-card'); if (card && document.body.dataset.device === 'phone') { crmPhoneLeadScreen(card.dataset.lead, true); return; } if (el.dataset.lead && !el.closest('.lead-card')) { const ld = crmDesk().leads.find(l => l.id === el.dataset.lead); if (ld) { crmQuickEdit(ld); return; } } const lead = crmDesk().leads.find(l => l.id === el.closest('.lead-card').dataset.lead); if (lead) crmQuickEdit(lead); },
	'quick-stage': () => {},      /* handled inside crmQuickEdit */
	'quick-reassign': () => {},   /* handled inside crmQuickEdit */
	'quick-followup': () => {},   /* handled inside crmQuickEdit */
	'toggle-column': () => { crmBoard.showLost = !crmBoard.showLost; crmRenderBoard(crmDesk()); },
	'phone-board-mode': () => { crmBoard.mode = crmBoard.mode === 'board' ? 'list' : 'board'; try { sessionStorage.setItem('optimumrv-crm-board-mode', crmBoard.mode); } catch (e) {} crmRenderBoard(crmDesk()); },
	'board-mode': el => { crmBoard.mode = el.dataset.mode; try { sessionStorage.setItem('optimumrv-crm-board-mode', crmBoard.mode); } catch (e) {} crmRenderBoard(crmDesk()); },
	'table-sort': el => { const k = el.dataset.key; crmBoard.sort = { key:k, dir:crmBoard.sort.key === k ? -crmBoard.sort.dir : 1 }; crmRenderBoard(crmDesk()); },
	'open-lead-row': el => { if (document.body.dataset.device === 'phone') crmPhoneLeadScreen(el.dataset.lead, true); else { const lead = crmDesk().leads.find(l => l.id === el.dataset.lead); if (lead) crmQuickEdit(lead); } },
	'phone-stage-pick': el => { if (crmBoard.mode === 'board') { const col = document.querySelector(`#pipeline .pipeline-column[data-stage="${el.dataset.stage}"]`); crmBoard.stage = el.dataset.stage; crmBoard._target = el.dataset.stage; el.parentElement.querySelectorAll('.stage-pill').forEach(p => p.classList.toggle('is-selected', p === el)); crmCenterInStrip(el); if (col) document.getElementById('pipeline').scrollTo({ left:col.offsetLeft - 14, behavior:'smooth' }); return; } const desk = crmDesk(); const from = desk.stages.findIndex(st => st.id === crmBoard.stage), to = desk.stages.findIndex(st => st.id === el.dataset.stage); if (from === to) return; crmBoard.stage = el.dataset.stage; crmPhoneSlide([document.getElementById('phone-leads')], to > from ? 1 : -1, () => crmRenderBoard(desk)); },
	'phone-board-filter': el => {
		let menu = document.getElementById('phone-board-filter-menu');
		if (menu) { menu.remove(); return; }
		document.getElementById('phone-board-stores-menu')?.remove();
		menu = document.createElement('div'); menu.id = 'phone-board-filter-menu'; menu.className = 'phone-menu'; menu.setAttribute('role', 'menu');
		const section = (kind, label) => { const m = CRM_MENUS[kind]; if (!m) return ''; return `<p class="phone-menu-label">${label}</p>` + m.items().map(it => `<label><input type="checkbox" ${m.selected.has(it.value) ? 'checked' : ''} data-action="phone-menu-pick" data-menu="${kind}" data-value="${it.value}"><span class="swatch" ${it.swatch || ''}></span>${it.label}</label>`).join(''); };
		menu.innerHTML = section('reps', CRM_MENUS.reps && CRM_MENUS.reps.noun === 'listers' ? 'Listers' : 'Salespeople') + section('waiting', 'Waiting on');
		el.closest('.phone-topbar').appendChild(menu);
		const close = e => { if (!e.target.closest('#phone-board-filter-menu, [data-action="phone-board-filter"]')) { menu.remove(); document.removeEventListener('click', close, true); } };
		setTimeout(() => document.addEventListener('click', close, true));
	},
	'phone-board-stores': el => {
		let menu = document.getElementById('phone-board-stores-menu');
		if (menu) { menu.remove(); return; }
		document.getElementById('phone-board-filter-menu')?.remove();
		menu = document.createElement('div'); menu.id = 'phone-board-stores-menu'; menu.className = 'phone-menu'; menu.setAttribute('role', 'menu');
		menu.innerHTML = `<p class="phone-menu-label">Stores</p>` + CRM_MENUS.stores.items().map(it => `<label><input type="checkbox" ${CRM_MENUS.stores.selected.has(it.value) ? 'checked' : ''} data-action="phone-menu-pick" data-menu="stores" data-value="${it.value}"><span class="swatch" data-store></span>${it.label}</label>`).join('');
		el.closest('.phone-topbar').appendChild(menu);
		const close = e => { if (!e.target.closest('#phone-board-stores-menu, [data-action="phone-board-stores"]')) { menu.remove(); document.removeEventListener('click', close, true); } };
		setTimeout(() => document.addEventListener('click', close, true));
	},
	'phone-menu-pick': el => { const m = CRM_MENUS[el.dataset.menu]; const v = new Set(m.selected); el.checked ? v.add(el.dataset.value) : v.delete(el.dataset.value); m.selected = v; m.onChange(); },
	'phone-lead-more': el => {
		let menu = document.getElementById('phone-lead-more-menu');
		if (menu) { menu.remove(); return; }
		const desk = crmDesk(); const lead = desk.leads.find(l => l.id === crmPhone.leadId); if (!lead) return;
		menu = document.createElement('div'); menu.id = 'phone-lead-more-menu'; menu.className = 'phone-menu'; menu.setAttribute('role', 'menu');
		const items = [];
		if (lead.stage !== 'lost' && crmCanSetStage(lead, 'agreed') && lead.stage !== 'agreed') items.push({ icon:'check-circle', label:'Mark agreed', tone:'ok', stage:'agreed' });
		if (lead.stage !== 'lost' && crmCanSetStage(lead, 'lost')) items.push({ icon:'x-circle', label:'Mark lost', tone:'muted', stage:'lost' });
		if (lead.stage === 'lost') items.push({ icon:'rotate-ccw', label:'Reopen', stage:desk.stages[0].id });
		items.push({ icon:'calendar', label:'Schedule', run:() => { location.href = `calendar.html${crmQuery({ mode:'day', date:crmISO(crmNow()) })}`; } });
		menu.innerHTML = items.map((it, i) => `<button type="button" data-tone="${it.tone || ''}" data-i="${i}">${crmIcon(it.icon)}${it.label}</button>`).join('');
		menu.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; const it = items[+b.dataset.i]; menu.remove(); if (it.run) it.run(); else crmQuickEdit(lead, { proposeStage:it.stage }); });
		el.closest('.phone-topbar').appendChild(menu); crmIcons();
		const close = e => { if (!e.target.closest('#phone-lead-more-menu, [data-action="phone-lead-more"]')) { menu.remove(); document.removeEventListener('click', close, true); } };
		setTimeout(() => document.addEventListener('click', close, true));
	},
	'mark-agreed': () => {
		const lead = crmLeadOrPick(); if (!lead) return;
		const unit = (lead.summary && lead.summary[0] && lead.summary[0].title) || lead.unit || 'Unit';
		crmSheet({
			title:'Mark agreed',
			reason:'Software can\'t see a handshake. The salesperson confirms the deal — unit, price, and delivery — and the lead moves to Agreed for the deal desk.',
			body:`<div class="sheet-form"><label class="field"><span>Unit</span><input id="ag-unit" value="${unit}"></label><label class="field"><span>Agreed price</span><input id="ag-price" value="${(lead.summary && lead.summary[0] && lead.summary[0].meta || '').split('· ')[1] || '$—'}"></label><label class="field"><span>Delivery</span><input id="ag-when" value="Sat, Aug 22 · 11:00 AM · Ocala store"></label></div>`,
			actions:[{ label:'Cancel' }, { label:'Mark agreed', primary:true, run:m => {
				lead.thread.push({ type:'event', icon:'tag', text:`Offer accepted — ${m.querySelector('#ag-unit').value} · ${m.querySelector('#ag-price').value} · delivery ${m.querySelector('#ag-when').value}` });
				crmSetStage(lead, 'agreed', { by:'salesperson' });
			} }]
		});
	},
	'mark-lost': () => {
		const lead = crmLeadOrPick(); if (!lead) return;
		const m = crmSheet({
			title:'Mark lost',
			reason:'A board full of dead leads hides the live ones. Closing a lead with a reason keeps the board honest and tells the manager why deals fall through.',
			body:crmRows(CRM_LOST_REASONS.map(r => ({ icon:'x-circle', title:r }))) + `<div class="sheet-form"><label class="field"><span>Note (optional)</span><input id="lost-note" placeholder="What happened?"></label></div>`,
			actions:[{ label:'Cancel' }]
		});
		m.querySelectorAll('[data-pick]').forEach(b => b.addEventListener('click', () => {
			const note = m.querySelector('#lost-note').value.trim();
			crmClose();
			crmSetStage(lead, 'lost', { by:'salesperson', reason:b.querySelector('strong').textContent + (note ? ` — ${note}` : '') });
		}));
	},
	'reopen-lead': () => {
		const lead = crmLeadOrPick(); if (!lead) return;
		crmSheet({ title:'Reopen lead', reason:'Lost isn\'t always final — a customer comes back. Reopening puts them in Working and keeps the old reason on the timeline.', actions:[{ label:'Cancel' }, { label:'Reopen', primary:true, run:() => crmSetStage(lead, 'working', { by:crmState.role === 'sales' ? 'salesperson' : 'manager', reason:'Customer came back' }) }] });
	}
});

/* click-and-drag on empty board space pans sideways (cards keep their own drag) */
function crmBindBoardPan() {
	const board = document.getElementById('pipeline');
	let pan = null;
	board.addEventListener('pointerdown', e => {
		if (e.pointerType !== 'mouse') return; /* touch scrolls natively — the pan is a mouse aid, on the phone layout too */
		if (e.button !== 0 || e.target.closest('.lead-card, button, a, select, input, .forsale-summary')) return;
		pan = { x:e.clientX, left:board.scrollLeft, moved:false, id:e.pointerId };
		board.classList.add('is-panning');
	});
	board.addEventListener('pointermove', e => {
		if (!pan) return;
		const dx = e.clientX - pan.x;
		if (Math.abs(dx) > 3 && !pan.moved) { pan.moved = true; board.setPointerCapture(pan.id); }
		if (pan.moved) board.scrollLeft = pan.left - dx;
	});
	const end = () => { if (!pan) return; board.classList.remove('is-panning'); pan = null; };
	board.addEventListener('pointerup', end);
	board.addEventListener('pointercancel', end);
	board.addEventListener('pointerleave', end);
}

/* ========================================================================== */
/* DETAIL PANEL — what's behind each summary card                            */
/* Content is derived from the card (kind + icon + title) so every lead gets  */
/* a sensible panel; `card.detail` in data.js can override any section.      */
/* ========================================================================== */
function crmDetailKind(card) {
	if (card.kind === 'unit') return (card.status || []).some(st => st.status === 'dark') ? 'trade' : 'unit';
	return { calendar:'appointment', 'book-open':'book', tag:'pricing', 'file-text':'payoff', eye:'listing', briefcase:'deal', 'credit-card':'fee', 'message-square':'source', globe:'source', users:'source', 'map-pin':'source', phone:'source', flag:'flag', 'file-check':'title' }[card.icon] || 'source';
}

function crmOpenDetail(lead, card) {
	const panel = document.getElementById('detail-panel');
	const kind = crmDetailKind(card);
	const first = crmFirst(lead);
	const store = CRM_DATA.stores.find(st => (lead.location || '').startsWith(st.name.split(',')[0])) || CRM_DATA.stores[0];
	const status = (card.status || []).map(st => `<span class="pill pill-tag" data-status="${st.status}">${st.label}</span>`).join('');
	const hero = card.image ? `<img src="${card.image}" alt="">` : `<svg><use href="#${card.svg || 'rv-trailer'}"/></svg>`;
	const spec = rows => `<div class="detail-spec">${rows.map(([k, v, wide]) => `<div class="${wide ? 'is-wide' : ''}"><small>${k}</small><strong>${v}</strong></div>`).join('')}</div>`;
	const list = (items, tone) => `<ul class="detail-list">${items.map(t => `<li ${tone ? `data-tone="${tone}"` : ''}>${crmIcon(tone === 'warn' ? 'alert-circle' : 'check')}<span>${t}</span></li>`).join('')}</ul>`;
	const actions = items => `<div class="detail-actions">${crmRows(items, 'data-detail-action')}</div>`;
	const titleParts = card.title.match(/^(\d{4})\s+(\S+)\s+(.+)$/);
	let title = card.title, body = '', acts = [];

	if (kind === 'unit') {
		title = 'Unit';
		body = `<div class="detail-hero">${hero}</div>
			<div class="detail-lede"><p class="detail-name">${card.title}</p><p class="detail-meta">${card.meta || ''}</p><span class="summary-status">${status}</span></div>
			<section class="detail-section"><h3>At a glance</h3>${spec([['Year', titleParts ? titleParts[1] : '—'], ['Make', titleParts ? titleParts[2] : '—'], ['Model', titleParts ? titleParts[3] : card.title, true], ['Type', /ACE|Bay Star|Allegro|Bounder|Vista|Georgetown|Freelander|Greyhawk|Sunseeker|Redhawk|Ventana/.test(card.title) ? 'Motorhome' : 'Towable'], ['Location', store.name], ['Sleeps', '6'], ['Slides', '2']])}</section>
			<section class="detail-section"><h3>Talking points</h3>${list(['One owner, serviced here', 'Ready to show — parked up front', 'Comparable units in the area are listed $2–4K higher', 'Financing pre-approval available same day'])}</section>
			<div class="detail-note">These specs and talking points are placeholders — the developer wires this panel to the inventory record for the stock number.</div>`;
		acts = [{ icon:'image', title:'Send photos', sub:`Text ${first} the photo set` }, { icon:'file', title:'Send brochure', sub:'Manufacturer spec sheet (PDF)' }, { icon:'dollar-sign', title:'Send price sheet', sub:'Price + two payment scenarios' }, { icon:'external-link', title:'Open in inventory', sub:card.meta ? card.meta.split(' ·')[0] : 'Stock record' }];
	} else if (kind === 'trade') {
		title = 'Trade-in';
		body = `<div class="detail-hero">${hero}</div>
			<div class="detail-lede"><p class="detail-name">${card.title}</p><p class="detail-meta">Customer's trade · value range ${card.meta || ''}</p><span class="summary-status">${status}</span></div>
			<section class="detail-section"><h3>Value</h3>${spec([['Low', (card.meta || '').split('–')[0] || '—'], ['High', (card.meta || '').split('–')[1] || '—'], ['Source', 'JD Power · Aug 2026 book', true], ['Appraisal', 'Not yet done']])}</section>
			<section class="detail-section"><h3>Still need from the customer</h3>${list(['Photos — outside, inside, odometer', 'Title status / lien holder', 'Any known issues'], 'warn')}</section>`;
		acts = [{ icon:'camera', title:'Ask for photos', sub:'Sends the saved "trade photos" text' }, { icon:'clipboard', title:'Request appraisal', sub:'Sends to the used-vehicle manager' }, { icon:'file-text', title:'Ask about the lien', sub:'Lender and payoff' }];
	} else if (kind === 'appointment') {
		title = 'Appointment';
		body = `<div class="detail-lede"><p class="detail-name">${card.title}</p><p class="detail-meta">${card.meta || ''}</p><span class="summary-status">${status}</span></div>
			<section class="detail-section"><h3>Where</h3>${spec([['Store', store.name], ['Phone', store.phone || '—'], ['Address', store.address, true], ['Hours today', 'Open 8 AM – 7 PM']])}</section>
			<section class="detail-section"><h3>Before they arrive</h3>${list(['Unit pulled up front and unlocked', 'Trade appraisal scheduled', 'Finance manager aware'])}</section>`;
		acts = [{ icon:'map-pin', title:'Send directions', sub:store.address }, { icon:'calendar', title:'Reschedule', sub:'Pick another open slot' }, { icon:'x-circle', title:'Cancel appointment', sub:'Logs the reason on the timeline' }];
	} else if (kind === 'book') {
		title = 'Pricing';
		body = `<div class="detail-lede"><p class="detail-name">${card.title}</p><p class="detail-meta">${card.meta || ''}</p><span class="summary-status">${status}</span></div>
			<section class="detail-section"><h3>JD Power · Aug 2026</h3>${spec([['Low retail', (card.meta || '').match(/low (\$[\d,]+)/)?.[1] || '—'], ['Average retail', (card.meta || '').match(/avg (\$[\d,]+)/)?.[1] || '—'], ['Asking / agreed', card.title.replace(/^(Asking|Agreed)\s*/, ''), true], ['Term', '120 days']])}</section>
			<section class="detail-section"><h3>How to talk about it</h3>${list(['Book average is what buyers see on RVTrader', 'Over-average listings sit 40+ days longer', 'A price drop at day 30 is normal, not a failure'])}</section>`;
		acts = [{ icon:'send', title:'Send the book values', sub:`Text ${first} the JD Power sheet` }, { icon:'tag', title:'Propose a price', sub:'Starts the price-agreed step' }];
	} else if (kind === 'payoff') {
		title = 'Payoff & lien';
		body = `<div class="detail-lede"><p class="detail-name">${card.title}</p><p class="detail-meta">${card.meta || ''}</p><span class="summary-status">${status}</span></div>
			<section class="detail-section"><h3>Lender</h3>${spec([['Lender', (card.meta || '').split(' ·')[0] || '—'], ['Title', 'With the lender'], ['Good through', (card.meta || '').match(/Through ([^·]+)/)?.[1] || '—'], ['Per diem', (card.meta || '').match(/\$[\d.]+\/day/)?.[0] || '—']])}</section>
			<section class="detail-section"><h3>Why it matters</h3>${list(['Payoff over sale price = shortfall the consignor must wire before delivery', 'Letters expire — a 10-day payoff is only good for 10 days'], 'warn')}</section>`;
		acts = [{ icon:'file-text', title:'Request 10-day payoff letter', sub:'Sends the lender request' }, { icon:'send', title:'Explain the shortfall', sub:'Saved reply with the math' }];
	} else if (kind === 'listing') {
		title = 'Listing performance';
		body = `<div class="detail-lede"><p class="detail-name">${card.title}</p><p class="detail-meta">${card.meta || ''}</p><span class="summary-status">${status}</span></div>
			<section class="detail-section"><h3>Last 30 days</h3>${spec([['Views', '1,284'], ['Favorites', '23'], ['Leads', '6'], ['Test drives', '2']])}</section>
			<section class="detail-section"><h3>Read</h3>${list(['Views are healthy; leads are not converting to visits', 'Two leads asked about price — supports the $38,900 move'])}</section>`;
		acts = [{ icon:'send', title:'Send the 30-day report', sub:'Automated email, resend now' }, { icon:'bar-chart-2', title:'Open listing on optimumrv.com' }];
	} else if (kind === 'deal') {
		title = 'Buyer deal';
		body = `<div class="detail-lede"><p class="detail-name">${card.title}</p><p class="detail-meta">${card.meta || ''}</p><span class="summary-status">${status}</span></div>
			<section class="detail-section"><h3>Motility</h3>${spec([['Deal', card.title.replace('Motility deal ', '#')], ['Step', (card.meta || '').split(' ·')[0]], ['Lender', 'AppOne'], ['Funded', 'No']])}</section>`;
		acts = [{ icon:'external-link', title:'Open in Motility' }, { icon:'user', title:'Ping buy-in admin', sub:'Internal note to Avery' }];
	} else if (kind === 'fee') {
		title = 'Inspection fee';
		body = `<div class="detail-lede"><p class="detail-name">${card.title}</p><p class="detail-meta">${card.meta || ''}</p><span class="summary-status">${status}</span></div>
			<section class="detail-section"><h3>Fee</h3>${spec([['Amount', '$399'], ['Status', 'Link sent'], ['Covers', 'Inspection, photos, listing setup', true]])}</section>`;
		acts = [{ icon:'send', title:'Resend payment link' }, { icon:'phone', title:'Call about the fee' }];
	} else {
		title = 'Lead source';
		body = `<div class="detail-lede"><p class="detail-name">${card.title}</p><p class="detail-meta">${card.meta || ''}</p><span class="summary-status">${status}</span></div>
			<section class="detail-section"><h3>Where this lead came from</h3>${spec([['Source', card.title.split(' ·')[0]], ['Form / type', card.title.split(' · ')[1] || '—'], ['Landing page', '/rv-search?keywords=redhawk', true], ['Pages viewed', '7 · 2 favorites']])}</section>
			<section class="detail-section"><h3>What they looked at</h3>${list(['2023 Jayco Redhawk 26XD — 3 visits', '2022 Thor ACE 32.3 — favorited', 'Financing page'])}</section>
			<div class="detail-note">The website already records referring URLs, landing pages, activity and favorites with every lead form — this is where the developer surfaces them.</div>`;
		acts = [{ icon:'external-link', title:'Open browsing history' }];
	}

	panel.querySelector('.detail-title').textContent = title;
	panel.querySelector('.detail-body').innerHTML = body + `<section class="detail-section"><h3>Quick actions</h3>${actions(acts)}</section>`;
	panel.querySelectorAll('[data-detail-action]').forEach(b => b.addEventListener('click', () => {
		const label = b.querySelector('strong').textContent;
		if (label === 'Reschedule') { crmCloseDetail(); CRM_ACTIONS.schedule(); return; }
		if (label === 'Ask for photos') { const input = document.getElementById('composer-input'); input.value = 'Could you send me a few photos of your trade? Outside, inside, and the odometer.'; crmCloseDetail(); input.focus(); return; }
		crmPushThread({ type:'event', icon:b.querySelector('i')?.dataset.feather || 'check', text:`${label} — ${card.title}` });
		crmCloseDetail();
	}));
	panel.classList.add('is-open'); panel.setAttribute('aria-hidden', 'false');
	document.querySelector('.detail-overlay').classList.add('is-open');
	crmIcons();
}
function crmCloseDetail() {
	const panel = document.getElementById('detail-panel');
	if (!panel) return;
	panel.classList.remove('is-open'); panel.setAttribute('aria-hidden', 'true');
	document.querySelector('.detail-overlay').classList.remove('is-open');
}
Object.assign(CRM_ACTIONS, {
	'open-detail': el => { const lead = crmCurrentLead(); const card = lead && lead.summary[+el.dataset.index]; if (card) crmOpenDetail(lead, card); },
	'close-detail': () => crmCloseDetail()
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') crmCloseDetail(); });

/* ========================================================================== */
/* CALENDAR — date helpers                                                    */
/* ========================================================================== */
const CRM_DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const CRM_DOW_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const CRM_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function crmNow() { return new Date(); }
function crmISO(d) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
function crmDate(iso) { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); }
function crmAddDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }
function crmAddMonths(d, n) { const x = new Date(d); x.setDate(1); x.setMonth(x.getMonth() + n); return x; }
function crmStartOfWeek(d) { const x = new Date(d); x.setDate(x.getDate() - x.getDay()); x.setHours(0, 0, 0, 0); return x; }
function crmSameDay(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
function crmIsToday(d) { return crmSameDay(d, crmNow()); }
function crmDowKey(d) { return ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][d.getDay()]; }
function crmDowIndex(d) { return d.getDay(); }
function crmIsWeekend(d) { const i = d.getDay(); return i === 0 || i === 6; }
function crmFmt(d, style) {
	const mo = CRM_MONTHS[d.getMonth()], sh = mo.slice(0, 3);
	if (style === 'month') return `${mo} ${d.getFullYear()}`;
	if (style === 'short') return `${CRM_DOW[crmDowIndex(d)]}, ${sh} ${d.getDate()}`;
	if (style === 'long') return `${CRM_DOW_LONG[crmDowIndex(d)]}, ${mo} ${d.getDate()}`;
	if (style === 'full') return `${mo} ${d.getDate()}, ${d.getFullYear()}`;
	if (style === 'year') return String(d.getFullYear());
	if (style === 'week') {
		const s = crmStartOfWeek(d), e = crmAddDays(s, 6);
		return s.getMonth() === e.getMonth() ? `${sh} ${s.getDate()} – ${e.getDate()}, ${e.getFullYear()}` : `${CRM_MONTHS[s.getMonth()].slice(0, 3)} ${s.getDate()} – ${CRM_MONTHS[e.getMonth()].slice(0, 3)} ${e.getDate()}, ${e.getFullYear()}`;
	}
	return `${sh} ${d.getDate()}`;
}
function crmHourLabel(h) {
	const whole = Math.floor(h), mins = Math.round((h - whole) * 60);
	const suffix = whole >= 12 ? 'PM' : 'AM';
	const twelve = whole % 12 === 0 ? 12 : whole % 12;
	if (whole === 12 && !mins) return 'Noon';
	return mins ? `${twelve}:${String(mins).padStart(2, '0')} ${suffix}` : `${twelve} ${suffix}`;
}
function crmRangeLabel(e) { return e.timeLabel || (e.end ? `${crmHourLabel(e.start)} – ${crmHourLabel(e.end)}` : crmHourLabel(e.start)); }
/* the three "calendars" in the sidebar — derived, not stored */
function crmCategory(e) { return e.kind === 'followup' ? 'followup' : /Delivery|Drop-off|Pickup/.test(e.type || '') ? 'logistics' : 'appointment'; }
function crmStoreOf(e) { return CRM_DATA.stores.find(st => st.code === e.store) || CRM_DATA.stores[0]; }
/* open slots for a store on a date, minus what's already booked there */
function crmSlotsFor(store, date, excludeId) {
	const hours = store.hours[crmDowKey(date)];
	const iso = crmISO(date);
	const taken = new Set();
	(CRM_DATA.calendar.events[crmState.role] || []).filter(e => e.kind === 'appointment' && e.date === iso && e.id !== excludeId && e.state !== 'cancelled' && (!e.store || e.store === store.code)).forEach(e => { for (let h = e.start; h < e.end; h += .5) taken.add(h); });
	const slots = []; if (hours) for (let h = hours[0]; h < hours[1]; h += .5) slots.push({ h, taken:taken.has(h) });
	return { hours, slots };
}

/* ========================================================================== */
/* CALENDAR — state, init, navigation                                        */
/* ========================================================================== */
const crmCal = { mode:'week', cursor:null, mini:null, show:{ appointment:true, logistics:true, followup:true }, owners:null, stores:null, search:'', sidebar:true };

function crmInitCalendar(params) {
	const roleData = CRM_DATA.roles[crmState.role];
	crmCal.cursor = crmNow(); crmCal.mini = crmNow();
	if (['day', 'week', 'month', 'year'].includes(params.get('mode'))) crmCal.mode = params.get('mode');
	if (params.get('date')) crmCal.cursor = crmDate(params.get('date'));
	try { const pref = sessionStorage.getItem('optimumrv-crm-cal-sidebar'); crmCal.sidebar = pref ? pref !== 'closed' : innerWidth > 860; } catch (e) { crmCal.sidebar = innerWidth > 860; }

	/* management: store + salesperson filter menus in the topbar */
	const wrap = document.querySelector('.calendar-filters');
	if (roleData.owners) {
		crmCal.stores = new Set(['OCA']);
		crmCal.owners = new Set(crmStoreReps(crmCal.stores));
		CRM_MENUS.stores = { icon:'map-pin', noun:'stores', items:crmStoreItems, get selected() { return crmCal.stores; }, set selected(v) { crmCal.stores = v; crmCal.owners = new Set(crmStoreReps(v)); }, onChange:crmRenderCalendar };
		CRM_MENUS.reps = { icon:'users', noun:'salespeople', items:() => crmRepItems(crmCal.stores), get selected() { return crmCal.owners; }, set selected(v) { crmCal.owners = v; }, onChange:crmRenderCalendar };
		wrap.innerHTML = `<div class="filter-menu" data-menu="stores"></div><div class="filter-menu" data-menu="reps"></div>`;
		crmRenderFilterMenus();
	} else {
		/* a salesperson is assigned one store — no store picker, just where they are */
		crmCal.stores = null;
		wrap.innerHTML = `<span class="context-pill"><i data-feather="map-pin"></i><span data-field="user.location">${roleData.user.location}</span></span>`;
	}
	document.querySelectorAll('[data-action="phone-cal-stores"]').forEach(b => { b.hidden = !roleData.owners; });

	/* time gutter */
	const times = document.querySelector('.calendar-times');
	const { startHour, endHour } = CRM_DATA.calendar;
	for (let h = startHour; h < endHour; h++) times.insertAdjacentHTML('beforeend', `<span class="${h === startHour ? 'is-first' : ''}">${crmHourLabel(h)}</span>`);
	times.insertAdjacentHTML('beforeend', `<span class="is-last">${crmHourLabel(endHour % 24)}</span>`);

	document.getElementById('global-search-input').addEventListener('input', e => { crmCal.search = e.target.value; crmRenderCalendar(); });
	document.addEventListener('keydown', e => {
		if (e.target.matches('input, select, textarea') || document.querySelector('.modal.is-open')) return;
		if (e.key === 'ArrowLeft') CRM_ACTIONS['cal-prev'](); else if (e.key === 'ArrowRight') CRM_ACTIONS['cal-next']();
		else if (e.key === 't') CRM_ACTIONS['cal-today'](); else if ('dwmy'.includes(e.key) && e.key.length === 1) crmSetMode({ d:'day', w:'week', m:'month', y:'year' }[e.key]);
	});
	document.addEventListener('keydown', e => { if (e.key === 'Escape') { if (crmPop.editing) { const ev = crmEventById(crmPop.eventId); if (ev) crmOpenPopover(ev, crmPopoverAnchor(ev.id), { editing:null }); } else crmClosePopover(); } });
	document.addEventListener('click', e => { if (document.contains(e.target) && !e.target.closest('.event-popover, .calendar-event, .followup-task, .agenda-item, .month-event, .month-more, [data-action="new-event"], [data-action="new-event-on"], [data-action="edit-field"], [data-action="event-add-followup"], .modal')) crmClosePopover(); });
	crmRenderCalendar();
	crmInitPhoneCalendar(params);
	setInterval(() => { if (document.body.dataset.device !== 'phone' && (crmCal.mode === 'week' || crmCal.mode === 'day') && !crmPop.eventId && !crmPop.draft) crmRenderCalendar(); }, 60000);
}

/* ---- filter menus: checkbox dropdowns, shared by the calendar and the pipeline ----
   CRM_MENUS[kind] = { icon, noun, items:() => [{value,label,sub,swatch}], selected:Set, onChange } */
const CRM_MENUS = {};
function crmMenuLabel(kind) {
	const m = CRM_MENUS[kind], items = m.items(), sel = m.selected;
	if (!items.length) return m.empty || `No ${m.noun}`;
	if (sel.size === items.length) return items.length === 1 ? items[0].label : `All ${m.noun}`;
	if (sel.size === 0) return `No ${m.noun}`;
	if (sel.size === 1) return items.find(i => sel.has(i.value))?.label || `1 ${m.noun}`;
	return `${sel.size} ${m.noun}`;
}
function crmRenderFilterMenus() {
	document.querySelectorAll('.filter-menu[data-menu]').forEach(el => {
		const kind = el.dataset.menu, m = CRM_MENUS[kind]; if (!m) return;
		const items = m.items(), open = el.classList.contains('is-open');
		el.innerHTML = `<button type="button" class="filter-control" data-action="toggle-menu" data-menu="${kind}" aria-expanded="${open}"><i data-feather="${m.icon}"></i><span>${crmMenuLabel(kind)}</span><i data-feather="chevron-down"></i></button>
			<div class="filter-menu-panel" ${open ? '' : 'hidden'}>
				<label class="calendar-list-item is-all"><input type="checkbox" ${items.length && m.selected.size === items.length ? 'checked' : ''} data-action="menu-all" data-menu="${kind}"><span class="swatch" data-all></span>All</label>
				${items.map(it => `<label class="calendar-list-item"><input type="checkbox" ${m.selected.has(it.value) ? 'checked' : ''} data-action="menu-pick" data-menu="${kind}" data-value="${it.value}"><span class="swatch" ${it.swatch || ''}></span>${it.label}${it.sub ? `<small>${it.sub}</small>` : ''}</label>`).join('')}
			</div>`;
	});
	crmIcons();
}
function crmStoreReps(stores) { return [...new Set(CRM_DATA.stores.filter(st => stores.has(st.code)).flatMap(st => st.reps || []))]; }
function crmStoreName(e) { if (e.kind === 'followup') return ''; const st = CRM_DATA.stores.find(x => x.code === (e.store || 'OCA')); return st ? st.name : ''; }
function crmStoreItems() { return CRM_DATA.stores.map(st => ({ value:st.code, label:st.name, sub:(st.reps || []).length ? `${st.reps.length} rep${st.reps.length > 1 ? 's' : ''}` : '', swatch:'data-store' })); }
function crmRepItems(stores) { return crmStoreReps(stores).map(r => ({ value:r, label:r, sub:CRM_DATA.stores.filter(st => (st.reps || []).includes(r) && stores.has(st.code)).map(st => st.code).join(' · '), swatch:`data-owner="${r}"` })); }
document.addEventListener('click', e => { if (document.contains(e.target) && !e.target.closest('.filter-menu')) document.querySelectorAll('.filter-menu.is-open').forEach(m => { m.classList.remove('is-open'); m.querySelector('.filter-menu-panel').hidden = true; m.querySelector('[data-action="toggle-menu"]').setAttribute('aria-expanded', 'false'); }); });

function crmSetMode(mode) {
	crmCal.mode = mode;
	document.querySelectorAll('.calendar-modes button').forEach(x => { const on = x.dataset.mode === mode; x.classList.toggle('is-active', on); x.classList.toggle('is-brand', on); });
	crmRenderCalendar();
}
function crmGo(n) {
	const c = crmCal.cursor;
	crmCal.cursor = crmCal.mode === 'day' ? crmAddDays(c, n) : crmCal.mode === 'week' ? crmAddDays(c, 7 * n) : crmCal.mode === 'month' ? crmAddMonths(c, n) : new Date(c.getFullYear() + n, c.getMonth(), 1);
	crmCal.mini = crmCal.cursor;
	crmRenderCalendar();
}

/* ========================================================================== */
/* CALENDAR — data queries                                                   */
/* ========================================================================== */
function crmVisibleEvents() {
	const q = crmCal.search.trim().toLowerCase();
	return (CRM_DATA.calendar.events[crmState.role] || [])
		.filter(e => crmCal.show[crmCategory(e)])
		.filter(e => !crmCal.stores || e.kind === 'followup' || crmCal.stores.has(e.store || 'OCA'))
		.filter(e => !crmCal.owners || e.kind === 'followup' || crmCal.owners.has(e.owner))
		.filter(e => !q || [e.name, e.unit, e.label, e.type].join(' ').toLowerCase().includes(q));
}
function crmEventsOn(date, list) { const iso = crmISO(date); return (list || crmVisibleEvents()).filter(e => e.date === iso).sort((a, b) => a.start - b.start); }
function crmEventById(id) { if (crmPop.draft && crmPop.draft.id === id) return crmPop.draft; return (CRM_DATA.calendar.events[crmState.role] || []).find(e => e.id === id); }

/* ========================================================================== */
/* CALENDAR — render: title, sidebar, then the active mode                   */
/* ========================================================================== */
function crmRenderCalendar() {
	if (document.body.dataset.device === 'phone') { crmRenderPhoneCalendar(); return; }
	const cal = document.getElementById('calendar');
	const mode = crmCal.mode;
	cal.dataset.mode = mode;
	const narrow = matchMedia('(max-width: 860px)').matches;
	cal.classList.toggle('is-sidebar-collapsed', narrow ? crmCal.sidebarNarrow !== true : !crmCal.sidebar); /* narrow window: closed by default, the button opens it as an overlay */
	document.querySelector('.calendar-title').textContent = { day:crmFmt(crmCal.cursor, 'full'), week:crmFmt(crmCal.cursor, 'month'), month:crmFmt(crmCal.cursor, 'month'), year:crmFmt(crmCal.cursor, 'year') }[mode]; /* day: September 18, 2026 · week + month: September 2026 · year: 2026 */
	document.querySelectorAll('.calendar-modes button').forEach(x => { const on = x.dataset.mode === mode; x.classList.toggle('is-active', on); x.classList.toggle('is-brand', on); });
	history.replaceState(null, '', `calendar.html${crmQuery({ mode, date:crmISO(crmCal.cursor) })}`);
	if (!crmPop.draft) crmClosePopover();

	document.getElementById('mini-month').innerHTML = crmMiniMonth(crmCal.mini, { selected:crmCal.cursor, nav:true });
	const ownersBox = document.getElementById('calendar-owners'); if (ownersBox) ownersBox.hidden = true;
	document.getElementById('calendar-scroll').hidden = mode === 'month' || mode === 'year';
	document.getElementById('day-agenda').hidden = mode !== 'day';
	document.getElementById('calendar-month').hidden = mode !== 'month';
	document.getElementById('calendar-year').hidden = mode !== 'year';

	if (mode === 'week') crmRenderTimeGrid(Array.from({ length:7 }, (_, i) => crmAddDays(crmStartOfWeek(crmCal.cursor), i)));
	if (mode === 'day') { crmRenderTimeGrid([crmCal.cursor]); crmRenderAgenda(crmCal.cursor); }
	if (mode === 'month') crmRenderMonth();
	if (mode === 'year') crmRenderYear();
	crmIcons();
}

/* ---- week / day: hour grid ---------------------------------------------- */
function crmRenderTimeGrid(days) {
	const head = document.querySelector('.calendar-head');
	const grid = document.getElementById('calendar-grid');
	const { startHour, endHour } = CRM_DATA.calendar;
	const hourPx = parseFloat(getComputedStyle(grid).getPropertyValue('--calendar_hour'));
	const y = h => (h - startHour) * hourPx;
	const now = crmNow();
	head.innerHTML = '<span></span>' + days.map(d => `<button type="button" class="calendar-day ${crmIsToday(d) ? 'is-today' : ''} ${crmIsWeekend(d) ? 'is-weekend' : ''}" data-action="open-day" data-date="${crmISO(d)}">${CRM_DOW[crmDowIndex(d)]} <strong>${d.getDate()}</strong></button>`).join('');
	head.style.setProperty('--calendar_days', days.length);
	grid.style.setProperty('--calendar_days', days.length);
	grid.querySelectorAll('.calendar-col').forEach(c => c.remove());
	const times = grid.querySelector('.calendar-times');
	times.querySelector('.calendar-now-label')?.remove();
	grid.querySelector('.calendar-now')?.remove();
	if (days.some(crmIsToday)) {
		const nowY = y(now.getHours() + now.getMinutes() / 60);
		const hh = now.getHours() % 12 || 12, mm = String(now.getMinutes()).padStart(2, '0');
		times.insertAdjacentHTML('beforeend', `<span class="calendar-now-label" style="top:${nowY}px">${hh}:${mm} ${now.getHours() >= 12 ? 'PM' : 'AM'}</span>`);
		grid.insertAdjacentHTML('beforeend', `<span class="calendar-now" style="top:${nowY}px; --now_today:${days.findIndex(crmIsToday)}; --now_days:${days.length}" aria-label="Current time"></span>`);
	}
	const events = crmVisibleEvents();
	days.forEach(d => {
		const col = document.createElement('div');
		col.className = 'calendar-col' + (crmIsWeekend(d) ? ' is-weekend' : '') + (crmIsToday(d) ? ' is-today' : '');
		col.dataset.date = crmISO(d);
		col.style.height = `${(endHour - startHour) * hourPx}px`;
		const wh = CRM_DATA.calendar.workHours || [8, 19]; col.style.setProperty('--work_start', `${y(wh[0])}px`); col.style.setProperty('--work_end', `${y(wh[1])}px`);
		const dayEvents = crmEventsOn(d, events);
		/* lanes: appointments that overlap share the column */
		const appts = dayEvents.filter(e => e.kind === 'appointment');
		appts.forEach((e, i) => { e._lane = 0; e._lanes = 1; const prev = appts.slice(0, i).filter(p => p.end > e.start && p.start < e.end); if (prev.length) { e._lane = (prev[prev.length - 1]._lane + 1) % 2; prev.forEach(p => p._lanes = 2); e._lanes = 2; } });
		dayEvents.forEach(e => col.appendChild(e.kind === 'followup' ? crmFollowupTask(e, y) : crmCalendarEvent(e, y)));
		col.addEventListener('dblclick', ev => { if (ev.target !== col) return; const h = Math.floor((ev.offsetY / hourPx) * 2) / 2 + startHour; crmCreateEvent({ date:crmISO(d), start:h, anchor:col }); });
		grid.appendChild(col);
	});
	requestAnimationFrame(() => { const sc = document.getElementById('calendar-scroll'); const wh = CRM_DATA.calendar.workHours || [8, 19]; if (!crmCal._scrolled) { sc.scrollTop = Math.max(0, y(wh[0]) - 8); crmCal._scrolled = true; } });
}

/* one status vocabulary for every surface: done = check-circle, cancelled = x-circle + strikethrough,
   overdue = alert-circle (orange), past-unrecorded = faded only, follow-ups = their checkbox */
function crmStatus(e) {
	if (e.state === 'cancelled') return 'cancelled';
	if (e.done) return 'done';
	if (e.status === 'overdue') return 'overdue';
	const past = crmDate(e.date) < crmNow() && !crmSameDay(crmDate(e.date), crmNow());
	if (e.state === 'past' || past) return 'past';
	return '';
}
function crmStatusGlyph(e) {
	const st = crmStatus(e);
	return st === 'done' ? `<i class="status-glyph" data-status="done" data-feather="check-circle" aria-label="Completed"></i>`
		: st === 'cancelled' ? `<i class="status-glyph" data-status="cancelled" data-feather="x-circle" aria-label="Cancelled"></i>`
		: st === 'overdue' ? `<i class="status-glyph" data-status="overdue" data-feather="alert-circle" aria-label="Overdue"></i>` : '';
}

function crmCalendarEvent(e, y) {
	const el = crmTemplate('tpl-calendar-event');
	el.dataset.event = e.id; el.dataset.lead = e.lead; el.dataset.owner = e.owner; el.dataset.category = crmCategory(e);
	el.style.setProperty('--event_top', `${y(e.start)}px`);
	el.style.setProperty('--event_height', `${y(e.end) - y(e.start)}px`);
	el.style.setProperty('--event_lane', e._lane || 0);
	el.style.setProperty('--event_lanes', e._lanes || 1);
	if (e.tone) el.dataset.tone = e.tone;
	const st = crmStatus(e);
	if (st) el.dataset.status = st;
	crmFill(el, Object.assign({ timeLabel:crmHourLabel(e.start) }, e));
	const thumb = el.querySelector('.thumb');
	if (e.unit) thumb.innerHTML = e.image ? `<img src="${e.image}" alt="">` : `<svg><use href="#${e.svg || 'rv-trailer'}"/></svg>`; else thumb.remove();
	if (!e.unit) el.querySelector('.event-unit').remove();
	if (e.timeLabel) el.querySelector('.event-meta').innerHTML = `<span data-field="type">${e.type}</span><br><i data-feather="clock"></i><span data-field="timeLabel">${e.timeLabel}</span>`;
	const storeName = crmStoreName(e); if (storeName) el.querySelector('.event-meta').insertAdjacentHTML('beforeend', `<br><i data-feather="map-pin"></i><span data-field="store">${storeName}</span>`);
	el.querySelector('.event-name').insertAdjacentHTML('afterbegin', crmStatusGlyph(e));
	el.querySelector('.event-done').remove();
	return el;
}
function crmFollowupTask(e, y) {
	const el = crmTemplate('tpl-followup-task');
	el.dataset.event = e.id; el.dataset.lead = e.lead; el.dataset.status = e.status || '';
	el.style.setProperty('--task_offset', `${y(e.start)}px`);
	el.querySelector('[data-field="label"]').textContent = e.label;
	const cb = el.querySelector('input'); cb.checked = !!e.done; el.classList.toggle('is-done', !!e.done);
	cb.addEventListener('change', ev => { e.done = ev.target.checked; el.classList.toggle('is-done', e.done); crmPersist(); });
	el.addEventListener('click', ev => { if (ev.target === cb) return; ev.preventDefault(); crmOpenPopover(e, el); });
	return el;
}

/* ---- day: agenda list ---------------------------------------------------- */
function crmRenderAgenda(date, target) {
	const wrap = target || document.getElementById('day-agenda');
	const items = crmEventsOn(date);
	const showOwner = !!CRM_DATA.roles[crmState.role].owners;
	wrap.innerHTML = `<header class="agenda-head"><h2>${crmIsToday(date) ? 'Today' : crmFmt(date, 'long')}</h2><span class="column-count">${items.length}</span><button type="button" class="btn" data-action="new-event-on" data-date="${crmISO(date)}"><i data-feather="plus"></i>Add</button></header>` +
		(items.length ? `<ol class="agenda-list">${items.map(e => {
			const cat = crmCategory(e);
			const st = crmStatus(e);
			return `<li class="agenda-item" data-status="${st}" data-event="${e.id}" data-category="${cat}" data-action="open-event">
				<time>${crmHourLabel(e.start)}${e.end ? `<small>${crmHourLabel(e.end)}</small>` : ''}</time>
				<span class="agenda-dot" data-category="${cat}" data-tone="${e.tone || ''}"></span>
				<span class="agenda-text"><strong>${e.kind === 'followup' ? `<input type="checkbox" class="agenda-check" ${e.done ? 'checked' : ''} data-action="event-complete" data-event="${e.id}" aria-label="Done">` : crmStatusGlyph(e)}${e.kind === 'followup' ? e.label : e.name}</strong><small>${e.kind === 'followup' ? 'Follow-up' : [e.type, e.unit, crmStoreName(e), showOwner ? e.owner : ''].filter(Boolean).join(' · ')}</small></span>
				<span class="agenda-actions">
					<button type="button" class="btn btn-round" data-action="event-open-conversation" data-event="${e.id}" aria-label="Open conversation" title="Open conversation"><i data-feather="message-circle"></i></button>
					<button type="button" class="btn btn-round" data-action="event-complete" data-event="${e.id}" aria-label="Complete" title="Complete"><i data-feather="check"></i></button>
					<button type="button" class="btn btn-round" data-action="edit-field" data-edit="date" data-event="${e.id}" aria-label="Move to another day" title="Move"><i data-feather="calendar"></i></button>
				</span>
			</li>`;
		}).join('')}</ol>` : `<p class="agenda-empty"><i data-feather="sun"></i>Nothing scheduled — add an appointment or follow-up.</p>`);
}

/* ---- month ----------------------------------------------------------------- */
function crmRenderMonth() {
	const wrap = document.getElementById('calendar-month');
	const first = new Date(crmCal.cursor.getFullYear(), crmCal.cursor.getMonth(), 1);
	const start = crmStartOfWeek(first);
	const events = crmVisibleEvents();
	let html = CRM_DOW.map(d => `<div class="month-dow">${d}</div>`).join('');
	for (let i = 0; i < 42; i++) {
		const d = crmAddDays(start, i);
		const outside = d.getMonth() !== first.getMonth();
		const items = crmEventsOn(d, events);
		html += `<div class="month-cell ${outside ? 'is-outside' : ''} ${crmIsToday(d) ? 'is-today' : ''} ${crmIsWeekend(d) ? 'is-weekend' : ''}" data-date="${crmISO(d)}" data-action="new-event-on">
			<button type="button" class="month-date" data-action="open-day" data-date="${crmISO(d)}">${d.getDate()}</button>
			${items.slice(0, 3).map(e => e.kind === 'followup'
				? `<label class="month-event is-task" data-status="${crmStatus(e)}"><input type="checkbox" ${e.done ? 'checked' : ''} data-action="event-complete" data-event="${e.id}" aria-label="Done"><button type="button" class="month-task-label" data-action="open-event" data-event="${e.id}">${e.label}</button></label>`
				: `<button type="button" class="month-event" data-status="${crmStatus(e)}" data-category="${crmCategory(e)}" data-tone="${e.tone || ''}" data-action="open-event" data-event="${e.id}">${crmStatusGlyph(e)}<span class="month-time">${crmHourLabel(e.start)}</span>${e.name}</button>`).join('')}
			${items.length > 3 ? `<button type="button" class="month-more" data-action="open-more" data-date="${crmISO(d)}">+${items.length - 3} more</button>` : ''}
		</div>`;
	}
	wrap.innerHTML = html;
}

/* ---- year + mini month ------------------------------------------------------ */
function crmMiniMonth(monthDate, opts = {}) {
	const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
	const start = crmStartOfWeek(first);
	const events = crmVisibleEvents();
	const withEvents = new Set(events.map(e => e.date));
	let cells = '';
	for (let i = 0; i < 42; i++) {
		const d = crmAddDays(start, i);
		if (i >= 35 && d.getMonth() !== first.getMonth()) break;
		const outside = d.getMonth() !== first.getMonth();
		cells += `<button type="button" class="mini-day ${outside ? 'is-outside' : ''} ${crmIsToday(d) ? 'is-today' : ''} ${d < crmNow() && !crmIsToday(d) ? 'is-past' : ''} ${opts.selected && crmSameDay(d, opts.selected) ? 'is-selected' : ''} ${withEvents.has(crmISO(d)) ? 'has-events' : ''}" data-action="${opts.pick || (opts.small ? 'open-day' : 'mini-pick')}" ${opts.pick && opts.pickEvent ? `data-edit="date" data-event="${opts.pickEvent}" data-value="${crmISO(d)}"` : ''} data-date="${crmISO(d)}"><span class="mini-num">${d.getDate()}</span></button>`;
	}
	const count = events.filter(e => (e.date || '').startsWith(crmISO(first).slice(0, 7))).length;
	return `<div class="mini-month ${opts.small ? 'is-small' : ''} ${opts.small && first.getMonth() === crmNow().getMonth() && first.getFullYear() === crmNow().getFullYear() ? 'is-current' : ''}">
		<header class="mini-head">${opts.nav ? `<button type="button" class="menu-btn" data-action="${opts.pick ? 'inline-month-prev' : 'mini-prev'}" data-event="${opts.pickEvent || ''}" data-date="${crmISO(first)}" aria-label="Previous month"><i data-feather="chevron-left"></i></button>` : ''}<button type="button" class="mini-title" data-action="${opts.pick ? 'noop' : 'open-month'}" data-date="${crmISO(first)}" ${opts.pick ? 'tabindex="-1"' : ''}>${opts.small ? CRM_MONTHS[first.getMonth()] : crmFmt(first, 'month')}${opts.small && count ? `<small>${count} items</small>` : ''}</button>${opts.nav ? `<button type="button" class="menu-btn" data-action="${opts.pick ? 'inline-month-next' : 'mini-next'}" data-event="${opts.pickEvent || ''}" data-date="${crmISO(first)}" aria-label="Next month"><i data-feather="chevron-right"></i></button>` : ''}</header>
		<div class="mini-grid">${CRM_DOW.map(d => `<span class="mini-dow">${d[0]}</span>`).join('')}${cells}</div>
	</div>`;
}
function crmRenderYear() {
	const wrap = document.getElementById('calendar-year');
	const y = crmCal.cursor.getFullYear();
	wrap.innerHTML = Array.from({ length:12 }, (_, m) => crmMiniMonth(new Date(y, m, 1), { small:true })).join('');
}

/* ========================================================================== */
/* EVENT POPOVER — one card to view AND edit; every field edits in place      */
/* Click the type / lead / store / date / time / duration / notes and change  */
/* it right there. "+" creates the event first, then opens this same card.   */
/* ========================================================================== */
const crmPop = { eventId:null, editing:null, draft:null, draftAnchor:null };

function crmPopoverAnchor(id) { if (crmPop.draft && crmPop.draft.id === id) return crmPop.draftAnchor; return document.querySelector(`.calendar-event[data-event="${id}"], .followup-task[data-event="${id}"], .month-event[data-event="${id}"], .agenda-item[data-event="${id}"]`); }

function crmOpenPopover(e, anchor, opts = {}) {
	const pop = document.getElementById('event-popover');
	crmPop.eventId = e.id || null; crmPop.editing = opts.editing || null;
	const showOwner = !!CRM_DATA.roles[crmState.role].owners;
	let body;
	if (opts.list) {
		body = `<header class="popover-head" data-category="appointment"><h3>${crmFmt(crmDate(opts.list), 'long')}</h3></header>
			<ol class="popover-list">${crmEventsOn(crmDate(opts.list)).map(ev => `<li><button type="button" class="sheet-row" data-action="open-event" data-event="${ev.id}"><span class="agenda-dot" data-category="${crmCategory(ev)}" data-tone="${ev.tone || ''}"></span><span class="sheet-row-text"><strong>${ev.kind === 'followup' ? ev.label : ev.name}</strong><small>${crmRangeLabel(ev)}${ev.type ? ' · ' + ev.type : ''}</small></span></button></li>`).join('')}</ol>
			<footer class="popover-actions"><button type="button" class="btn" data-action="open-day" data-date="${opts.list}"><i data-feather="calendar"></i>Open day</button><button type="button" class="btn" data-action="new-event-on" data-date="${opts.list}"><i data-feather="plus"></i>Add</button></footer>`;
	} else {
		const store = crmStoreOf(e), st = crmStatus(e), cat = crmCategory(e);
		const lead = crmDesk().leads.find(l => l.id === e.lead);
		const showOwner2 = !!CRM_DATA.roles[crmState.role].owners;
		const dur = e.end ? e.end - e.start : 0;
		const durLabel = { .25:'15 min', .5:'30 min', .75:'45 min', 1:'1 hour', 1.5:'1½ hours', 2:'2 hours' }[dur] || `${dur} h`;
		const types = e.kind === 'followup' ? ['Call', 'Text', 'Email'] : CRM_DATA.calendar.types[crmState.role === 'consignment' ? 'consignment' : 'sales'];
		const followups = e._draft ? [] : (CRM_DATA.calendar.events[crmState.role] || []).filter(f => f.kind === 'followup' && f.lead === e.lead && f.id !== e.id).sort((a, b) => a.date.localeCompare(b.date) || a.start - b.start);
		const picker = name => crmPop.editing === name ? `<div class="inline-picker" data-picker="${name}">${crmInlinePicker(e, name)}</div>` : '';
		const chip = (name, label) => `<button type="button" class="editor-value inline-field ${crmPop.editing === name ? 'is-editing' : ''}" data-action="edit-field" data-edit="${name}" data-event="${e.id}">${label}</button>`;
		body = `<div class="editor-head" data-status="${st}">
				<button type="button" class="menu-btn" data-action="close-popover" aria-label="${e._draft ? 'Discard' : 'Close'}"><i data-feather="x"></i></button>
				<h2>${e._draft ? 'New' : (lead ? lead.name : 'Appointment')}</h2>
				${e._draft ? `<button type="button" class="btn btn-primary btn-round" data-action="draft-save" data-event="${e.id}" aria-label="Save"><i data-feather="check"></i></button>` : `<span class="popover-status" data-status="${st}">${crmStatusGlyph(e)}${{ done:'Completed', cancelled:'Cancelled', overdue:'Overdue', past:'Past' }[st] || 'Upcoming'}</span>`}
			</div>
			${e._draft ? `<div class="editor-kind"><div class="segmented" role="group" aria-label="Kind">
				<button type="button" class="${e.kind === 'appointment' ? 'is-active' : ''}" data-action="draft-kind" data-kind="appointment" data-event="${e.id}">Appointment</button>
				<button type="button" class="${e.kind === 'followup' ? 'is-active' : ''}" data-action="draft-kind" data-kind="followup" data-event="${e.id}">Follow-up</button>
			</div></div>` : ''}
			<div class="editor-row is-stack is-draft">
				<label class="draft-row"><span class="event-type-dot" data-category="${e.kind === 'followup' ? 'followup' : cat}"></span><select class="draft-select" data-action="draft-field" data-edit="type" data-event="${e.id}">${types.map(t => `<option ${t === e.type ? 'selected' : ''}>${t}</option>`).join('')}</select>${crmIcon('chevron-down')}</label>
				<label class="draft-row">${crmIcon('user')}<select class="draft-select" data-action="draft-lead" data-event="${e.id}"><option value="" ${lead ? '' : 'selected'} disabled>Pick a customer…</option>${crmDesk().leads.filter(l => l.stage !== 'lost' || l.id === e.lead).map(l => `<option value="${l.id}" ${lead && l.id === lead.id ? 'selected' : ''}>${l.name}</option>`).join('')}</select>${lead ? `<span class="editor-muted">${(crmDesk().stages.find(x => x.id === lead.stage) || {}).label || ''}</span>` : ''}${crmIcon('chevron-down')}</label>
				${e.kind === 'appointment' ? `<label class="draft-row">${crmIcon('map-pin')}<select class="draft-select" data-action="draft-field" data-edit="store" data-event="${e.id}">${CRM_DATA.stores.map(x => `<option value="${x.code}" ${x.code === (e.store || 'OCA') ? 'selected' : ''}>${x.name}</option>`).join('')}</select>${crmIcon('chevron-down')}</label>` : ''}
				${!e._draft && lead && e.unit ? `<div class="draft-row is-static">${crmIcon('truck')}<span class="draft-text">${e.unit}</span></div>` : ''}
				${!e._draft && lead ? `<div class="draft-row is-static">${crmIcon('phone')}<span class="draft-text">${lead.phone}</span>${showOwner2 && e.owner ? `<span class="editor-muted">${e.owner}</span>` : ''}</div>` : ''}
			</div>
			<div class="editor-row is-stack is-draft">
				<div class="draft-row is-split"><span class="editor-label">Starts</span>${chip('date', crmFmt(crmDate(e.date), 'short'))}${chip('time', crmHourLabel(e.start))}</div>
				${picker('date')}${picker('time')}
				${e.kind === 'appointment' ? `<div class="draft-row is-split"><span class="editor-label">Duration</span>${chip('duration', durLabel)}</div>${picker('duration')}` : ''}
			</div>
			<textarea class="inline-notes is-draft" data-action="edit-notes" data-event="${e.id}" placeholder="Add notes…">${e.notes || ''}</textarea>
			${e.kind === 'appointment' && !e._draft ? `<section class="popover-followups">
				<h4>Follow-ups${lead ? ` · ${crmFirst(lead)}` : ''}</h4>
				${followups.length ? `<ul>${followups.map(f => `<li data-status="${crmStatus(f)}"><input type="checkbox" ${f.done ? 'checked' : ''} data-action="event-complete" data-event="${f.id}" aria-label="Done"><button type="button" class="popover-followup" data-action="open-event" data-event="${f.id}"><strong>${f.label}</strong><small>${crmFmt(crmDate(f.date), 'short')} · ${crmHourLabel(f.start)}</small></button></li>`).join('')}</ul>` : `<p class="popover-empty">None scheduled</p>`}
				<button type="button" class="sheet-chip" data-action="event-add-followup" data-event="${e.id}"><i data-feather="plus"></i>Add follow-up</button>
			</section>` : ''}
			${e._draft ? '' : `<footer class="popover-actions">
				${lead ? `<button type="button" class="btn" data-action="event-open-conversation" data-event="${e.id}"><i data-feather="message-circle"></i>Conversation</button>` : ''}
				${e.kind === 'followup'
					? `<button type="button" class="btn" data-action="event-complete" data-event="${e.id}"><i data-feather="check"></i>${e.done ? 'Undo' : 'Done'}</button><button type="button" class="btn" data-action="event-snooze" data-event="${e.id}"><i data-feather="clock"></i>Tomorrow</button>`
					: `<button type="button" class="btn" data-action="event-complete" data-event="${e.id}"><i data-feather="check"></i>${e.done ? 'Undo' : 'Complete'}</button><button type="button" class="btn" data-action="event-cancel" data-event="${e.id}"><i data-feather="x-circle"></i>${e.state === 'cancelled' ? 'Restore' : 'Cancel'}</button>`}
				<button type="button" class="btn btn-quiet" data-action="event-delete" data-event="${e.id}" aria-label="Delete"><i data-feather="trash-2"></i></button>
			</footer>`}`;
	}
	if (document.body.dataset.device === 'phone' && document.body.dataset.view === 'calendar' && !opts.list && !e._draft) { crmPhoneEventScreen(e, body); return; }
	pop.innerHTML = (opts.list ? `<button type="button" class="menu-btn popover-close" data-action="close-popover" aria-label="Close"><i data-feather="x"></i></button>` : '') + body;
	pop.hidden = false;
	crmIcons();
	crmPlacePopover(pop, anchor);
	pop.classList.add('is-open');
	const ta = pop.querySelector('.inline-picker textarea'); if (ta) { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); }
}
function crmPlacePopover(pop, anchor) {
	const r = anchor ? anchor.getBoundingClientRect() : { left:innerWidth / 2, right:innerWidth / 2, top:120, bottom:120 };
	const pw = pop.offsetWidth, ph = pop.offsetHeight, gap = 10;
	let left = r.right + gap; if (left + pw > innerWidth - 12) left = r.left - pw - gap; if (left < 12) left = Math.max(12, Math.min(r.left, innerWidth - pw - 12));
	let top = r.top; if (top + ph > innerHeight - 12) top = Math.max(12, innerHeight - ph - 12);
	pop.style.left = `${left}px`; pop.style.top = `${top}px`;
}
function crmClosePopover() { const pop = document.getElementById('event-popover'); if (pop) { pop.hidden = true; pop.classList.remove('is-open'); } crmPop.eventId = null; crmPop.editing = null; crmPop.draft = null; crmPop.draftAnchor = null; }
/* re-render the calendar and keep the same card open, anchored to the same event */
function crmRefreshPopover(id, editing) {
	if (crmPop.draft && crmPop.draft.id === id) { crmOpenPopover(crmPop.draft, crmPop.draftAnchor, { editing }); return; }
	if (document.body.dataset.device === 'phone' && document.body.dataset.view === 'calendar') { const ed = editing || null; crmClosePopover(); crmPersist(); crmPop.eventId = id; crmPop.editing = ed; crmRenderCalendar(); if (document.body.dataset.screen !== 'event') { const ev = crmEventById(id); if (ev) crmOpenPopover(ev, null, { editing:ed }); } return; }
	crmPersist();
	crmRenderCalendar();
	const ev = crmEventById(id);
	const anchor = crmPopoverAnchor(id);
	if (ev) crmOpenPopover(ev, anchor, { editing });
}

document.addEventListener('change', ev => {
	const sel = ev.target.closest && ev.target.closest('.draft-select');
	if (!sel) return;
	const e = crmEventById(sel.dataset.event); if (!e) return;
	if (sel.dataset.action === 'draft-lead') crmApplyField(e, 'lead', sel.value);
	else crmApplyField(e, sel.dataset.edit, sel.value);
	crmRefreshPopover(e.id, crmPop.editing === 'time' ? 'time' : null);
});
document.addEventListener('focusout', ev => {
	const ta = ev.target.closest && ev.target.closest('.inline-notes');
	if (!ta) return;
	const e = crmEventById(ta.dataset.event); if (!e) return;
	if (e._draft) { e.notes = ta.value.trim(); return; }
	if ((e.notes || '') !== ta.value.trim()) { crmApplyField(e, 'notes', ta.value.trim()); crmPersist(); }
});

/* ---- inline pickers, one per field --------------------------------------- */
function crmInlinePicker(e, name) {
	const chips = (items, attr) => `<div class="inline-chips">${items.map(([label, value, disabled]) => `<button type="button" class="sheet-chip ${String(value) === String(attr.current) ? 'is-active' : ''}" data-action="pick-inline" data-edit="${name}" data-event="${e.id}" data-value="${value}" ${disabled ? 'disabled' : ''}>${label}</button>`).join('')}</div>`;
	if (name === 'type') {
		const opts = e.kind === 'followup' ? ['Call', 'Text', 'Email'] : CRM_DATA.calendar.types[crmState.role === 'consignment' ? 'consignment' : 'sales'];
		return chips(opts.map(t => [t, t]), { current:e.type });
	}
	if (name === 'lead') {
		const leads = crmDesk().leads.filter(l => l.stage !== 'lost');
		return `<div class="inline-list">${leads.map(l => `<button type="button" class="sheet-row ${l.id === e.lead ? 'is-selected' : ''}" data-action="pick-inline" data-edit="lead" data-event="${e.id}" data-value="${l.id}"><span class="avatar avatar-small" style="width:28px;height:28px;font-size:.7rem">${l.initials}</span><span class="sheet-row-text"><strong>${l.name}</strong><small>${l.unit || (l.summary[0] && l.summary[0].title) || l.location || ''}</small></span></button>`).join('')}</div>`;
	}
	if (name === 'store') return `<div class="inline-list">${CRM_DATA.stores.map(st => `<button type="button" class="sheet-row ${st.code === (e.store || 'OCA') ? 'is-selected' : ''}" data-action="pick-inline" data-edit="store" data-event="${e.id}" data-value="${st.code}">${crmIcon('map-pin')}<span class="sheet-row-text"><strong>${st.name}</strong><small>${st.address}</small></span></button>`).join('')}</div>`;
	if (name === 'date') return crmMiniMonth(crmDate(e.date), { selected:crmDate(e.date), nav:true, pick:'pick-inline', pickEvent:e.id });
	if (name === 'time') {
		const store = crmStoreOf(e);
		const { hours, slots } = crmSlotsFor(store, crmDate(e.date), e.id);
		if (e.kind === 'followup') { const all = []; for (let h = 8; h < 19; h += .5) all.push([crmHourLabel(h), h]); return chips(all, { current:e.start }); }
		return (hours ? `<p class="inline-hint">${store.name} · open ${crmHourLabel(hours[0])} – ${crmHourLabel(hours[1])}</p>` : `<p class="inline-hint">${store.name} is closed that day — pick another date.</p>`) + chips(slots.map(sl => [crmHourLabel(sl.h), sl.h, sl.taken]), { current:e.start });
	}
	if (name === 'duration') return chips([['15 min', .25], ['30 min', .5], ['45 min', .75], ['1 hour', 1], ['1½ hours', 1.5], ['2 hours', 2]], { current:e.end - e.start });
	if (name === 'notes') return `<textarea class="inline-notes" data-action="edit-notes" data-event="${e.id}" placeholder="Add notes…">${e.notes || ''}</textarea><p class="inline-hint">Saves when you click away.</p>`;
	return '';
}

/* apply one field change, then refresh the card in place */
function crmApplyField(e, name, value) {
	const lead = crmDesk().leads.find(l => l.id === e.lead);
	if (name === 'type') { e.type = value; if (e.kind === 'followup' && lead) e.label = `${value} ${lead.name}`; }
	if (name === 'lead') { const l = crmDesk().leads.find(x => x.id === value); if (l) { e.lead = l.id; e.name = l.name; e.unit = l.unit || (l.summary[0] && l.summary[0].title) || ''; e.owner = l.owner || e.owner; if (e.kind === 'followup') e.label = `${e.type || 'Call'} ${l.name}`; } }
	if (name === 'store') e.store = value;
	if (name === 'date') e.date = value;
	if (name === 'time') { const dur = e.end ? e.end - e.start : 0; e.start = +value; if (e.kind === 'appointment') e.end = e.start + dur; }
	if (name === 'duration') e.end = e.start + +value;
	if (name === 'notes') e.notes = value;
	if (lead && name !== 'notes' && !e._draft) lead.thread.push({ type:'event', icon:'calendar', text:`${e.kind === 'followup' ? 'Follow-up' : 'Appointment'} updated — ${crmFmt(crmDate(e.date), 'short')} · ${crmHourLabel(e.start)}${e.type ? ' · ' + e.type : ''}` });
	if (name === 'date') { crmCal.cursor = crmDate(e.date); crmCal.mini = crmCal.cursor; }
}

/* "+" and friends: create first, then open the same card */
function crmCreateEvent(opts = {}) {
	const kind = opts.kind || 'appointment';
	const date = opts.date || crmISO(crmCal.cursor);
	const start = opts.start !== undefined ? opts.start : 11;
	const types = CRM_DATA.calendar.types[crmState.role === 'consignment' ? 'consignment' : 'sales'];
	const leads = crmDesk().leads.filter(l => l.stage !== 'lost');
	const lead = opts.leadId ? leads.find(l => l.id === opts.leadId) : null;
	const ev = kind === 'followup'
		? { id:'new-' + Date.now(), kind:'followup', date, start, lead:lead ? lead.id : '', type:'Call', label:lead ? `Call ${lead.name}` : 'Call' }
		: { id:'new-' + Date.now(), kind:'appointment', date, start, end:start + 1, lead:lead ? lead.id : '', name:lead ? lead.name : '', unit:lead ? (lead.unit || (lead.summary[0] && lead.summary[0].title) || '') : '', type:types[0], svg:'rv-trailer', owner:lead ? lead.owner : CRM_DATA.roles[crmState.role].user.name, store:'OCA' };
	if (lead) { crmCommitEvent(ev); return; }
	/* no customer yet → a draft card anchored to whatever was clicked; it lands on the calendar once a customer is picked */
	ev._draft = true;
	crmPop.draft = ev; crmPop.draftAnchor = opts.anchor || document.querySelector('[data-action="new-event"]');
	crmOpenPopover(ev, crmPop.draftAnchor, { editing:null });
}
function crmCommitEvent(ev) {
	delete ev._draft;
	crmPop.draft = null; crmPop.draftAnchor = null;
	(CRM_DATA.calendar.events[crmState.role] = CRM_DATA.calendar.events[crmState.role] || []).push(ev);
	const lead = crmDesk().leads.find(l => l.id === ev.lead);
	if (lead) lead.thread.push({ type:'event', icon:'calendar', text:`${ev.kind === 'followup' ? 'Follow-up set' : 'Appointment set'} — ${crmFmt(crmDate(ev.date), 'short')} · ${crmHourLabel(ev.start)}${ev.kind === 'followup' ? '' : ' · ' + ev.type}` });
	crmCal.cursor = crmDate(ev.date); crmCal.mini = crmCal.cursor;
	crmRefreshPopover(ev.id, null);
}

Object.assign(CRM_ACTIONS, {
	/* navigation */
	'cal-prev': () => crmGo(-1),
	'cal-next': () => crmGo(1),
	'cal-today': () => { crmCal.noSelect = false; crmCal.cursor = crmNow(); crmCal.mini = crmNow(); if (document.body.dataset.device === 'phone' && document.querySelector('.phone-cal')) { crmPhoneZoom(crmCal.level === 'year' ? 'month' : 'day'); return; } crmRenderCalendar(); }, /* phone: zoom IN year → month → day */
	'calendar-mode-day': () => crmSetMode('day'), 'calendar-mode-week': () => crmSetMode('week'), 'calendar-mode-month': () => crmSetMode('month'), 'calendar-mode-year': () => crmSetMode('year'),
	'open-day': el => { crmCal.cursor = crmDate(el.dataset.date); crmCal.mini = crmCal.cursor; crmSetMode('day'); },
	'open-month': el => { crmCal.cursor = crmDate(el.dataset.date); crmCal.mini = crmCal.cursor; crmSetMode('month'); },
	'mini-pick': el => { crmCal.noSelect = false; crmCal.cursor = crmDate(el.dataset.date); crmCal.mini = crmCal.cursor; if (crmCal.level && crmCal.level !== 'day') { crmPhoneZoom('day'); return; } crmRenderCalendar(); },
	'mini-prev': el => { crmCal.mini = crmAddMonths(crmCal.mini, -1); const box = el.closest('#mini-month, #phone-month') || document.getElementById('mini-month'); box.innerHTML = crmMiniMonth(crmCal.mini, { selected:crmCal.cursor, nav:true }); crmIcons(); },
	'mini-next': el => { crmCal.mini = crmAddMonths(crmCal.mini, 1); const box = el.closest('#mini-month, #phone-month') || document.getElementById('mini-month'); box.innerHTML = crmMiniMonth(crmCal.mini, { selected:crmCal.cursor, nav:true }); crmIcons(); },
	'search-expand': el => { const f = el.closest('.global-search'); const inp = f.querySelector('input'); if (f.classList.contains('is-open') && !inp.value) { f.classList.remove('is-open'); el.setAttribute('aria-expanded', 'false'); return; } f.classList.add('is-open'); el.setAttribute('aria-expanded', 'true'); inp.focus(); },
	'summary-scroll': el => { const wrap = el.closest('.lead-summary').querySelector('.summary-track'); const card = wrap.querySelector('.summary-card'); const step = card ? card.getBoundingClientRect().width + 12 : 240; wrap.scrollBy({ left:step * +el.dataset.dir, behavior:'smooth' }); },
	'toggle-sidebar': () => { if (matchMedia('(max-width: 860px)').matches) { crmCal.sidebarNarrow = !crmCal.sidebarNarrow; crmRenderCalendar(); return; } crmCal.sidebar = !crmCal.sidebar; try { sessionStorage.setItem('optimumrv-crm-cal-sidebar', crmCal.sidebar ? 'open' : 'closed'); } catch (e) {} crmRenderCalendar(); },
	/* filter menus (shared) */
	'toggle-menu': el => { const m = el.closest('.filter-menu'); const open = !m.classList.contains('is-open'); document.querySelectorAll('.filter-menu.is-open').forEach(x => { if (x !== m) { x.classList.remove('is-open'); x.querySelector('.filter-menu-panel').hidden = true; } }); m.classList.toggle('is-open', open); m.querySelector('.filter-menu-panel').hidden = !open; el.setAttribute('aria-expanded', String(open)); },
	'menu-all': el => { const m = CRM_MENUS[el.dataset.menu]; if (!m) return; m.selected = new Set(el.checked ? m.items().map(i => i.value) : []); crmRenderFilterMenus(); m.onChange(); },
	'menu-pick': el => { const m = CRM_MENUS[el.dataset.menu]; if (!m) return; const sel = new Set(m.selected); if (el.checked) sel.add(el.dataset.value); else sel.delete(el.dataset.value); m.selected = sel; crmRenderFilterMenus(); m.onChange(); },
	/* sidebar filters */
	'toggle-calendar': el => { crmCal.show[el.dataset.category] = el.checked; crmRenderCalendar(); },
	'toggle-followups': el => { crmCal.show.followup = el.checked; crmRenderCalendar(); },
	'toggle-owner': el => { if (el.checked) crmCal.owners.add(el.dataset.owner); else crmCal.owners.delete(el.dataset.owner); crmRenderCalendar(); },
	/* events */
	'open-event': el => { const e = crmEventById(el.dataset.event || el.closest('[data-event]').dataset.event); if (e) crmOpenPopover(e, el); },
	'open-more': el => crmOpenPopover({}, el, { list:el.dataset.date }),
	'close-popover': () => crmClosePopover(),
	'event-open-conversation': el => { const e = crmEventById(el.dataset.event); if (e && e.lead) location.href = `daily-view.html${crmQuery({ lead:e.lead })}`; },
	'event-complete': el => { const e = crmEventById(el.dataset.event); if (!e) return; const openId = el.closest('.event-popover') ? crmPop.eventId : null; e.done = !e.done; if (e.done) e.status = null; const lead = crmDesk().leads.find(l => l.id === e.lead); if (lead && e.done) lead.thread.push({ type:'event', icon:'check', text:`${e.kind === 'followup' ? 'Follow-up done' : 'Appointment completed'} — ${e.kind === 'followup' ? e.label : e.type + ' · ' + crmFmt(crmDate(e.date), 'short')}` }); crmPersist(); crmRenderCalendar(); if (openId) { const anchor = document.querySelector(`[data-event="${openId}"]`); const ev = crmEventById(openId); if (anchor && ev) crmOpenPopover(ev, anchor); } },
	'event-snooze': el => { const e = crmEventById(el.dataset.event); if (!e) return; e.date = crmISO(crmAddDays(crmDate(e.date), 1)); e.status = null; crmPersist(); crmRenderCalendar(); },
	'event-cancel': el => {
		const e = crmEventById(el.dataset.event); if (!e) return;
		if (e.state === 'cancelled') { e.state = null; crmPersist(); crmRenderCalendar(); return; }
		crmClosePopover();
		crmSheet({ title:`Cancel ${e.type || 'appointment'} with ${e.name}`, reason:'A cancelled appointment stays on the calendar, struck through, and the reason lands on the lead\'s timeline — so nobody wonders whether the customer just didn\'t show.', body:`<div class="sheet-form"><label class="field"><span>Reason</span><select id="cx-reason"><option>Customer rescheduled</option><option>Customer no-show</option><option>Unit no longer available</option><option>Salesperson unavailable</option><option>Other</option></select></label></div>`, actions:[{ label:'Keep it' }, { label:'Cancel appointment', primary:true, run:m => { e.state = 'cancelled'; e.done = false; const lead = crmDesk().leads.find(l => l.id === e.lead); if (lead) lead.thread.push({ type:'event', icon:'x-circle', tone:'warn', text:`Appointment cancelled — ${e.type} · ${crmFmt(crmDate(e.date), 'short')} · ${m.querySelector('#cx-reason').value}` }); crmPersist(); crmRenderCalendar(); } }] });
	},
	/* create + inline edit */
	'new-event': () => crmCreateEvent({ date:crmISO(crmCal.cursor) }),
	'new-event-on': (el, ev) => { if (ev && el.classList.contains('month-cell') && ev.target !== el) return; crmClosePopover(); crmCreateEvent({ date:el.dataset.date, anchor:el }); },
	'event-add-followup': el => { const e = crmEventById(el.dataset.event); if (!e) return; crmCreateEvent({ kind:'followup', leadId:e.lead, date:crmISO(crmAddDays(crmNow(), 1)), start:10 }); },
	'edit-field': el => { const e = crmEventById(el.dataset.event); if (!e) return; const name = el.dataset.edit; crmOpenPopover(e, crmPopoverAnchor(e.id), { editing:crmPop.editing === name ? null : name }); },
	'pick-inline': el => { const e = crmEventById(el.dataset.event); if (!e) return; crmApplyField(e, el.dataset.edit, el.dataset.value); crmRefreshPopover(e.id, null); },
	'edit-notes': () => {},
	'draft-lead': () => {},
	'draft-field': () => {},
	'draft-save': el => { const e = crmEventById(el.dataset.event); if (!e) return; if (!e.lead) { const sel = document.querySelector('#event-popover [data-action="draft-lead"]'); if (sel) { sel.classList.add('is-error'); sel.focus(); } return; } const notes = document.querySelector('#event-popover .inline-notes'); if (notes) e.notes = notes.value.trim(); crmCommitEvent(e); },
	'draft-kind': el => { const e = crmEventById(el.dataset.event); if (!e || !e._draft) return; const kind = el.dataset.kind; if (kind === e.kind) return; const lead = crmDesk().leads.find(l => l.id === e.lead); if (kind === 'followup') { e.kind = 'followup'; delete e.end; e.type = 'Call'; e.label = lead ? `Call ${lead.name}` : 'Call'; } else { e.kind = 'appointment'; e.end = e.start + 1; e.type = CRM_DATA.calendar.types[crmState.role === 'consignment' ? 'consignment' : 'sales'][0]; e.store = e.store || 'OCA'; } crmRefreshPopover(e.id, crmPop.editing); },
	'noop': () => {},
	'inline-month-prev': el => { const e = crmEventById(el.dataset.event); const picker = el.closest('.inline-picker'); if (!e || !picker) return; picker.innerHTML = crmMiniMonth(crmAddMonths(crmDate(el.dataset.date), -1), { selected:crmDate(e.date), nav:true, pick:'pick-inline', pickEvent:e.id }); crmIcons(); },
	'inline-month-next': el => { const e = crmEventById(el.dataset.event); const picker = el.closest('.inline-picker'); if (!e || !picker) return; picker.innerHTML = crmMiniMonth(crmAddMonths(crmDate(el.dataset.date), 1), { selected:crmDate(e.date), nav:true, pick:'pick-inline', pickEvent:e.id }); crmIcons(); },
	'event-delete': el => {
		const e = crmEventById(el.dataset.event); if (!e) return;
		crmClosePopover();
		crmSheet({ title:'Delete this item?', reason:'Delete is for mistakes — a wrong customer, a duplicate. If the customer backed out, use Cancel instead so the reason stays on the timeline.', actions:[{ label:'Keep' }, { label:'Delete', primary:true, run:() => { const list = CRM_DATA.calendar.events[crmState.role]; list.splice(list.indexOf(e), 1); crmPersist(); crmRenderCalendar(); } }] });
	},
});

/* ========================================================================== */
/* PHONE — Daily View as two screens: inbox → conversation                   */
/* ========================================================================== */
const crmPhone = { screen:'inbox', bound:false };

function crmInitPhone(desk, params) {
	if (crmPhone.bound) return;
	crmPhone.bound = true;
	/* search from the bottom bar */
	const ps = document.getElementById('phone-search-input');
	if (ps) ps.addEventListener('input', e => { document.getElementById('inbox-search-input').value = e.target.value; crmRenderInbox(desk, e.target.value); });
	/* send button appears when there's text */
	const input = document.getElementById('composer-input');
	input.addEventListener('input', () => document.getElementById('composer-form').classList.toggle('has-text', input.value.trim().length > 0));
	/* keyboard: keep the composer above it */
	if (window.visualViewport) {
		const vv = window.visualViewport;
		const onVV = () => { const off = Math.max(0, innerHeight - vv.height - vv.offsetTop); document.body.style.setProperty('--keyboard_offset', `${off}px`); };
		vv.addEventListener('resize', onVV); vv.addEventListener('scroll', onVV);
	}
	/* history: back returns to the inbox */
	addEventListener('popstate', e => { if (document.body.dataset.device !== 'phone') return; crmShowScreen((e.state && e.state.screen) || 'inbox', false); });
	/* left-edge swipe → back */
	let swipe = null;
	document.addEventListener('touchstart', e => { const t = e.touches[0]; swipe = (document.body.dataset.screen === 'conversation' && t.clientX < 28) ? { x:t.clientX, y:t.clientY } : null; }, { passive:true });
	document.addEventListener('touchmove', e => { if (!swipe) return; const t = e.touches[0]; if (t.clientX - swipe.x > 60 && Math.abs(t.clientY - swipe.y) < 40) { swipe = null; CRM_ACTIONS['phone-back'](); } }, { passive:true });
	/* which screen to start on */
	crmShowScreen(params.get('lead') ? 'conversation' : 'inbox', false);
	crmPhoneApply();
}

function crmPhoneApply() {
	document.body.dataset.screen = document.body.dataset.device === 'phone' ? crmPhone.screen : '';
	const desk = crmDesk();
	if (document.body.dataset.device === 'phone') crmRenderFocus(desk);
}

function crmShowScreen(screen, push) {
	crmPhone.screen = screen;
	document.body.dataset.screen = screen;
	const view = document.body.dataset.view;
	if (push) history.pushState({ screen }, '', view === 'calendar' ? `calendar.html${crmQuery({ mode:'day', date:crmISO(crmCal.cursor), event:crmPop.eventId || '' })}` : view === 'pipeline' ? `pipeline.html${crmQuery({ lead:crmPhone.leadId || '' })}` : `daily-view.html${crmQuery({ tab:crmState.tab, lead:crmState.leadId })}`);
	if (screen === 'board') { crmClose(); crmPhone.leadId = null; history.replaceState(history.state, '', `pipeline.html${crmQuery({})}`); return; }
	if (screen === 'inbox') { crmCloseDetail(); crmClose(); history.replaceState(history.state, '', `daily-view.html${crmQuery({ tab:crmState.tab })}`); }
	if (screen === 'agenda') { crmClose(); crmPop.eventId = null; crmPop.editing = null; history.replaceState(history.state, '', `calendar.html${crmQuery({ mode:'day', date:crmISO(crmCal.cursor) })}`); }
	else requestAnimationFrame(() => { const t = document.getElementById('thread'); if (t) t.scrollTop = t.scrollHeight; });
}

/* the six to deal with first: response timers, then overdue, then today's appointments, then unread */
function crmFocusScore(l) {
	const st = l.pill && l.pill.status;
	if (st === 'urgent') return 5;
	if (l.unread === 'overdue' || st === 'overdue') return 4;
	if (st === 'info' && l.pill.icon === 'clock') return 3;
	if (st === 'appointment') return 2;
	if (l.unread) return 1;
	return 0;
}
function crmRenderFocus(desk) {
	const wrap = document.getElementById('phone-focus');
	if (!wrap) return;
	const picks = desk.leads.filter(l => l.tabs.length && l.stage !== 'lost').map(l => ({ l, s:crmFocusScore(l) })).filter(x => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 6).map(x => x.l);
	wrap.hidden = !picks.length;
	wrap.innerHTML = picks.map(l => `<button type="button" class="focus-item" data-action="open-focus" data-lead="${l.id}"><span class="avatar" data-field="initials">${l.initials}<span class="focus-dot" data-status="${l.unread === 'overdue' ? 'overdue' : (l.pill && l.pill.status) || 'unread'}"></span></span><small data-field="name">${l.name.split(' ')[0]}</small></button>`).join('');
	const fdot = document.querySelector('.phone-filter-dot'); if (fdot) fdot.hidden = crmState.tab === desk.defaultTab;
}

Object.assign(CRM_ACTIONS, {
	'phone-back': () => { const view = document.body.dataset.view; const home = view === 'calendar' ? 'agenda' : view === 'pipeline' ? 'board' : 'inbox'; const sub = { agenda:'event', board:'lead', inbox:'conversation' }[home]; if (history.state && history.state.screen === sub) history.back(); else crmShowScreen(home, false); },
	'open-focus': el => { crmOpenLead(el.dataset.lead); crmShowScreen('conversation', true); },
	'phone-filter': el => {
		const desk = crmDesk();
		let menu = document.getElementById('phone-filter-menu');
		if (menu) { menu.remove(); return; }
		menu = document.createElement('div');
		menu.id = 'phone-filter-menu'; menu.className = 'phone-menu'; menu.setAttribute('role', 'menu');
		menu.innerHTML = desk.tabs.map(t => `<button type="button" role="menuitemradio" aria-checked="${t.id === crmState.tab}" data-action="phone-filter-pick" data-tab="${t.id}"><span>${t.label}<small>${desk.leads.filter(l => l.tabs.includes(t.id)).length}</small></span>${t.id === crmState.tab ? crmIcon('check') : ''}</button>`).join('');
		el.closest('.phone-topbar').appendChild(menu);
		crmIcons();
		const close = e => { if (!e.target.closest('#phone-filter-menu, [data-action="phone-filter"]')) { menu.remove(); document.removeEventListener('click', close, true); } };
		setTimeout(() => document.addEventListener('click', close, true), 0);
	},
	'phone-more': el => {
		const lead = crmLeadOrPick(); if (!lead) return;
		let menu = document.getElementById('phone-more-menu');
		if (menu) { menu.remove(); return; }
		const items = [];
		items.push({ action:'schedule', icon:'calendar', label:'Schedule' });
		if (lead.cta && lead.stage !== 'lost') items.push({ action:lead.cta.action, icon:lead.cta.icon, label:lead.cta.label });
		if (lead.stage === 'working' && !['consign', 'backoffice'].includes(crmState.desk)) items.push({ action:'mark-agreed', icon:'check-circle', label:'Mark agreed', tone:'ok' });
		if (lead.stage === 'lost') items.push({ action:'reopen-lead', icon:'rotate-ccw', label:'Reopen' });
		else if (lead.stage !== 'agreed' && crmState.desk !== 'backoffice') items.push({ action:'mark-lost', icon:'x-circle', label:'Mark lost', tone:'muted' });
		menu = document.createElement('div');
		menu.id = 'phone-more-menu'; menu.className = 'phone-menu'; menu.setAttribute('role', 'menu');
		menu.innerHTML = items.map(it => `<button type="button" role="menuitem" data-action="${it.action}" data-tone="${it.tone || ''}"><span>${it.label}</span>${crmIcon(it.icon)}</button>`).join('');
		(el.closest('.phone-topbar') || el.closest('.lead-actions-compact')).appendChild(menu);
		crmIcons();
		const close = e => { if (!e.target.closest('[data-action="phone-more"]')) { menu.remove(); document.removeEventListener('click', close, true); } };
		setTimeout(() => document.addEventListener('click', close, true), 0);
	},
	'composer-mode-menu': el => {
		let menu = document.getElementById('composer-mode-menu');
		if (menu) { menu.remove(); return; }
		const current = document.querySelector('.composer-mode button.is-active').dataset.mode;
		const modes = [['text', 'Text', 'message-circle'], ['email', 'Email', 'mail'], ['note', 'Note', 'edit-2']];
		menu = document.createElement('div');
		menu.id = 'composer-mode-menu'; menu.className = 'phone-menu is-up'; menu.setAttribute('role', 'menu');
		menu.innerHTML = modes.map(([id, label, icon]) => `<button type="button" role="menuitemradio" aria-checked="${id === current}" data-action="composer-mode-pick" data-mode="${id}"><span>${crmIcon(icon)} ${label}</span>${id === current ? crmIcon('check') : ''}</button>`).join('');
		el.closest('.composer').appendChild(menu);
		crmIcons();
		const close = e => { if (!e.target.closest('[data-action="composer-mode-menu"]')) { menu.remove(); document.removeEventListener('click', close, true); } };
		setTimeout(() => document.addEventListener('click', close, true), 0);
	},
	'composer-mode-pick': el => {
		document.querySelector(`.composer-mode [data-mode="${el.dataset.mode}"]`).click();
		const icon = { text:'message-circle', email:'mail', note:'edit-2' }[el.dataset.mode];
		const btn = document.querySelector('.composer-mode-btn'); if (btn) { btn.innerHTML = crmIcon(icon); crmIcons(); }
		document.getElementById('composer-mode-menu')?.remove();
	},
	'phone-filter-pick': el => {
		const desk = crmDesk();
		crmState.tab = el.dataset.tab;
		document.querySelectorAll('.inbox-tabs button').forEach(x => x.classList.toggle('is-active', x.dataset.tab === crmState.tab));
		crmRenderInbox(desk, document.getElementById('phone-search-input').value);
		document.getElementById('phone-filter-menu')?.remove();
	},
	'open-lead-details': () => {
		const lead = crmLeadOrPick(); if (!lead) return;
		const desk = crmDesk();
		const stage = desk.stages.find(st => st.id === lead.stage);
		crmSheet({
			title:lead.name,
			body:crmRows([
				{ icon:'phone', title:lead.phone, sub:'Tap to call', static:false },
				{ icon:'mail', title:lead.email, sub:'Tap to email', static:false },
				{ icon:'map-pin', title:lead.location, static:true },
				{ icon:'columns', title:stage ? stage.label : lead.stage, sub:lead.stageNote || '', static:true },
				{ icon:'user', title:lead.owner, sub:'Owner', static:true }
			], 'data-detail-pick'),
			actions:[{ label:'Close', primary:true }]
		}).querySelectorAll('[data-detail-pick]').forEach(b => b.addEventListener('click', () => { const i = +b.dataset.detailPick; crmClose(); if (i === 0) CRM_ACTIONS.call(); if (i === 1) CRM_ACTIONS.email(); }));
	}
});

/* ========================================================================== */
/* PHONE — Calendar: week strip + agenda (iOS Calendar day mode)             */
/* ========================================================================== */
const crmPhoneCal = { bound:false };

function crmInitPhoneCalendar(params) {
	if (crmPhoneCal.bound || !document.querySelector('.phone-cal')) return;
	crmPhoneCal.bound = true;
	const search = document.getElementById('phone-cal-search');
	if (search) search.addEventListener('input', e => { crmCal.search = e.target.value; crmRenderCalendar(); });
	addEventListener('popstate', e => { if (document.body.dataset.device !== 'phone' || document.body.dataset.view !== 'calendar') return; crmShowScreen((e.state && e.state.screen) || 'agenda', false); });
	/* swipes: week strip → ±7 days, agenda → ±1 day, left edge on the event screen → back */
	let sw = null;
	const zoneOf = (target, x) => target.closest('.phone-week') ? 'week' : target.closest('.phone-agenda') ? 'agenda' : (document.body.dataset.screen === 'event' && x < 28) ? 'edge' : null;
	const begin = (target, x, y) => { const zone = zoneOf(target, x); sw = zone ? { zone, x, y } : null; };
	const finish = (x, y) => {
		if (!sw) return; const dx = x - sw.x, dy = y - sw.y; const z = sw.zone; sw = null;
		if (Math.abs(dx) < 50 || Math.abs(dy) > 60) return;
		if (z === 'edge') { if (dx > 0) CRM_ACTIONS['phone-back'](); return; }
		if (crmCal.level && crmCal.level !== 'day') return;
		const days = z === 'week' ? 7 : 1, dir = dx < 0 ? 1 : -1;
		const before = crmStartOfWeek(crmCal.cursor).getTime();
		crmCal.cursor = crmAddDays(crmCal.cursor, dir * days); crmCal.mini = crmCal.cursor;
		const weekChanged = crmStartOfWeek(crmCal.cursor).getTime() !== before;
		/* iOS-style slide: the strip slides when the week changes, the day slides when the day changes */
		const targets = [];
		if (weekChanged) targets.push(document.getElementById('phone-week'));
		if (z === 'agenda') targets.push(document.getElementById('phone-agenda'));
		crmPhoneSlide(targets, dir, () => { crmCal._phoneScrolledFor = null; crmRenderCalendar(); });
	};
	document.addEventListener('touchstart', e => { const t = e.touches[0]; begin(e.target, t.clientX, t.clientY); }, { passive:true });
	document.addEventListener('touchend', e => { const t = e.changedTouches[0]; finish(t.clientX, t.clientY); }, { passive:true });
	/* mouse drag does the same, so the gesture can be tried in a desktop browser */
	document.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse' && e.button === 0) begin(e.target, e.clientX, e.clientY); });
	document.addEventListener('pointerup', e => { if (e.pointerType === 'mouse') finish(e.clientX, e.clientY); });
	if (document.body.dataset.device === 'phone') {
		const ev = params.get('event') && crmEventById(params.get('event'));
		crmShowScreen(ev ? 'event' : 'agenda', false);
		crmRenderCalendar();
		if (ev) crmOpenPopover(ev, null);
	}
}


/* Phone zoom levels — iOS Calendar: the title zooms out (day → month → year), Today zooms in (year → month → day) */
/* slide the given panels out in the swipe direction, re-render, slide the new content in from the other side */
function crmPhoneSlide(els, dir, render) {
	els = els.filter(Boolean);
	const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (!els.length || reduce || !els[0].animate) { render(); return; }
	Promise.all(els.map(el => el.animate([{ transform:'translateX(0)', opacity:1 }, { transform:`translateX(${dir * -30}%)`, opacity:0 }], { duration:130, easing:'ease-in', fill:'forwards' }).finished)).then(() => {
		render();
		els.forEach(el => { el.getAnimations().forEach(a => a.cancel()); el.animate([{ transform:`translateX(${dir * 30}%)`, opacity:0 }, { transform:'translateX(0)', opacity:1 }], { duration:200, easing:'ease-out' }); });
	});
}

function crmPhoneZoom(level) {
	crmCal.level = level;
	const wrap = document.querySelector('.phone-cal'); if (!wrap) return;
	const pm = document.getElementById('phone-month');
	wrap.classList.toggle('is-months', level !== 'day');
	wrap.dataset.level = level;
	pm.hidden = level === 'day';
	wrap.querySelector('[data-action="phone-month-toggle"]').setAttribute('aria-expanded', String(level !== 'day'));
	if (level === 'month') {
		const base = new Date(crmCal.cursor.getFullYear(), crmCal.cursor.getMonth(), 1);
		pm.innerHTML = `<div class="phone-dow">${CRM_DOW.map(d => `<span>${d[0]}</span>`).join('')}</div>` + Array.from({ length:25 }, (_, i) => crmAddMonths(base, i - 12)).map(m => `<div class="phone-month-block ${m.getMonth() === crmCal.cursor.getMonth() && m.getFullYear() === crmCal.cursor.getFullYear() ? 'is-current' : ''}" data-date="${crmISO(m)}">${crmMiniMonth(m, { selected:crmCal.noSelect ? null : crmCal.cursor, pick:'mini-pick', pickEvent:'' })}</div>`).join('');
	} else if (level === 'year') {
		/* compact months (no nested buttons — the whole month is one tap target) */
		const y = crmCal.cursor.getFullYear(), now = crmNow();
		const busy = new Set(crmVisibleEvents().map(e => e.date));
		const mini = first => { const start = crmStartOfWeek(first); return `<span class="year-grid">${Array.from({ length:42 }, (_, i) => crmAddDays(start, i)).map(d => `<span class="year-day ${d.getMonth() !== first.getMonth() ? 'is-outside' : ''} ${crmIsToday(d) ? 'is-today' : ''} ${busy.has(crmISO(d)) ? 'has-events' : ''}">${d.getDate()}</span>`).join('')}</span>`; };
		pm.innerHTML = Array.from({ length:5 }, (_, i) => y - 2 + i).map(yy => `<div class="phone-year-block ${yy === y ? 'is-current' : ''}" data-date="${yy}-01-01"><h2 class="phone-year-title">${yy}</h2><div class="phone-year-grid">${Array.from({ length:12 }, (_, m) => { const first = new Date(yy, m, 1); return `<button type="button" class="phone-year-month ${m === now.getMonth() && yy === now.getFullYear() ? 'is-today' : ''}" data-action="phone-year-month" data-date="${crmISO(first)}"><strong>${CRM_MONTHS[m]}</strong>${mini(first)}</button>`; }).join('')}</div></div>`).join('');
	}
	if (!pm.dataset.scrollBound) {
		pm.dataset.scrollBound = '1';
		/* iOS: the back label tracks whichever month / year is at the top of the scroll */
		pm.addEventListener('scroll', () => {
			if (crmCal.level === 'day') return;
			const top = pm.getBoundingClientRect().top + 40;
			const blocks = [...pm.querySelectorAll('.phone-month-block, .phone-year-block')];
			const cur = blocks.reverse().find(b => b.getBoundingClientRect().top <= top) || blocks[blocks.length - 1];
			if (!cur || !cur.dataset.date) return;
			const d = crmDate(cur.dataset.date);
			const label = document.querySelector('.phone-cal [data-field="calendar.month"]');
			label.textContent = crmCal.level === 'month' ? String(d.getFullYear()) : String(d.getFullYear());
			crmCal.mini = d;
		}, { passive:true });
	}
	crmRenderPhoneCalendar();
	if (level !== 'day') { crmIcons(); const cur = pm.querySelector('.is-current'); if (cur) pm.scrollTop = cur.getBoundingClientRect().top - pm.getBoundingClientRect().top + pm.scrollTop - (level === 'month' ? 30 : 0); }
}

function crmRenderPhoneCalendar() {
	const wrap = document.querySelector('.phone-cal'); if (!wrap) return;
	const cursor = crmCal.cursor;
	const level = crmCal.level || 'day';
	wrap.querySelector('[data-field="calendar.month"]').textContent = level === 'day' ? CRM_MONTHS[cursor.getMonth()] : String(cursor.getFullYear());
	wrap.querySelector('[data-action="phone-month-toggle"]').disabled = level === 'year';
	const mt = wrap.querySelector('.phone-month-title'); if (mt) mt.setAttribute('aria-label', level === 'day' ? 'Back to months' : 'Back to years');
	const tb = wrap.querySelector('.phone-today'); if (tb) tb.classList.toggle('is-away', !crmIsToday(cursor));
	/* week strip */
	const start = crmStartOfWeek(cursor);
	const events = crmVisibleEvents();
	const busy = new Set(events.map(e => e.date));
	const week = document.getElementById('phone-week');
	week.innerHTML = Array.from({ length:7 }, (_, i) => crmAddDays(start, i)).map(d => `<button type="button" class="week-day ${crmIsToday(d) ? 'is-today' : ''} ${crmSameDay(d, cursor) ? 'is-selected' : ''} ${crmIsWeekend(d) ? 'is-weekend' : ''} ${busy.has(crmISO(d)) ? 'has-events' : ''}" data-action="phone-day-pick" data-date="${crmISO(d)}"><small>${CRM_DOW[crmDowIndex(d)][0]}</small><span class="mini-num">${d.getDate()}</span></button>`).join('')
		;
	/* month drop-down (only re-render while open) */

	/* filter dot */
	const dot = wrap.querySelector('.phone-cal-filter:not(.phone-cal-stores) .phone-filter-dot');
	if (dot) { const allCats = crmCal.show.appointment && crmCal.show.logistics && crmCal.show.followup; const allOwners = !crmCal.owners || crmCal.owners.size === crmStoreReps(crmCal.stores || new Set(['OCA'])).length; dot.hidden = allCats && allOwners; }
	/* agenda: the day, or search results across days */
	const agenda = document.getElementById('phone-agenda');
	if (crmCal.search.trim()) {
		const grid = document.getElementById('calendar-grid'); if (grid.parentElement === agenda) document.getElementById('calendar-scroll').appendChild(grid);
		const byDate = {};
		events.forEach(e => { (byDate[e.date] = byDate[e.date] || []).push(e); });
		const dates = Object.keys(byDate).sort();
		agenda.innerHTML = dates.length ? dates.map(iso => { const d = crmDate(iso); const tmp = document.createElement('div'); crmRenderAgenda(d, tmp); tmp.querySelector('.agenda-head')?.remove(); return `<p class="agenda-date ${crmIsToday(d) ? 'is-today' : ''}">${crmFmt(d, 'long')}</p>${tmp.innerHTML}`; }).join('') : `<p class="agenda-empty"><i data-feather="search"></i>Nothing matches “${crmCal.search.trim()}”</p>`;
	} else {
		/* iOS day mode: the hour grid (one column) lives inside the agenda area — moved out of the desktop markup once */
		const grid = document.getElementById('calendar-grid');
		if (grid.parentElement !== agenda) { agenda.innerHTML = ''; agenda.appendChild(grid); }
		agenda.querySelectorAll(':scope > :not(#calendar-grid)').forEach(n => n.remove());
		crmRenderTimeGrid([cursor]);
		const hourPx = parseFloat(getComputedStyle(grid).getPropertyValue('--calendar_hour'));
		const wh = CRM_DATA.calendar.workHours || [8, 19];
		const target = crmIsToday(cursor) ? Math.max(0, (crmNow().getHours() - 1.5) * hourPx) : (wh[0] - CRM_DATA.calendar.startHour) * hourPx - 8;
		if (crmCal._phoneScrolledFor !== crmISO(cursor)) { agenda.scrollTop = target; crmCal._phoneScrolledFor = crmISO(cursor); }
		if (!crmEventsOn(cursor, events).length) agenda.insertAdjacentHTML('afterbegin', `<p class="agenda-empty phone-empty">Nothing scheduled</p>`);
	}
	/* event screen stays in sync */
	if (document.body.dataset.screen === 'event') {
		const ev = crmPop.eventId && crmEventById(crmPop.eventId);
		if (ev) crmOpenPopover(ev, null, { editing:crmPop.editing }); else crmShowScreen('agenda', false);
	}
	crmIcons();
}

/* the event card, full screen: same body as the popover, minus its chrome */
function crmPhoneEventScreen(e, body) {
	const screen = document.querySelector('.phone-event');
	const lead = crmDesk().leads.find(l => l.id === e.lead);
	crmPop.eventId = e.id;
	crmFill(screen.querySelector('.phone-topbar'), { initials:lead ? lead.initials : '·', name:lead ? lead.name : (e.kind === 'followup' ? e.label : 'Event') });
	const st = crmStatus(e);
	const host = document.getElementById('phone-event-body');
	host.innerHTML = `<p class="phone-event-status" data-status="${st}">${crmStatusGlyph(e)}${{ done:'Completed', cancelled:'Cancelled', overdue:'Overdue', past:'Past — not recorded' }[st] || (e.kind === 'followup' ? 'Follow-up' : 'Upcoming')}</p>` + body + (lead ? `<button type="button" class="btn phone-event-conversation" data-action="event-open-conversation" data-event="${e.id}"><i data-feather="message-circle"></i>Open conversation</button>` : '');
	host.querySelector('.editor-head')?.remove();
	crmIcons();
	const ta = host.querySelector('.inline-picker textarea'); if (ta) { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); }
	if (document.body.dataset.screen !== 'event') crmShowScreen('event', true);
}

Object.assign(CRM_ACTIONS, {
	'phone-day-pick': el => { crmCal.cursor = crmDate(el.dataset.date); crmCal.mini = crmCal.cursor; crmRenderCalendar(); },
	'phone-month-toggle': () => { crmPhoneZoom((crmCal.level || 'day') === 'day' ? 'month' : 'year'); }, /* zoom OUT: day → month → year */
	'phone-year-month': el => { const m = crmDate(el.dataset.date), now = crmNow(); crmCal.cursor = m.getMonth() === now.getMonth() && m.getFullYear() === now.getFullYear() ? now : m; crmCal.mini = crmCal.cursor; crmCal.noSelect = !crmIsToday(crmCal.cursor); /* iOS: coming from the year, no day is picked yet */ crmPhoneZoom('month'); },
	'phone-cal-stores': el => {
		let menu = document.getElementById('phone-cal-stores-menu');
		if (menu) { menu.remove(); return; }
		document.getElementById('phone-cal-filter-menu')?.remove();
		menu = document.createElement('div');
		menu.id = 'phone-cal-stores-menu'; menu.className = 'phone-menu'; menu.setAttribute('role', 'menu');
		menu.innerHTML = `<p class="phone-menu-label">Stores</p>` + CRM_DATA.stores.map(st => `<label><input type="checkbox" ${crmCal.stores.has(st.code) ? 'checked' : ''} data-action="toggle-store" data-store="${st.code}"><span class="swatch" data-store="${st.code}"></span>${st.name}</label>`).join('');
		el.closest('.phone-topbar').appendChild(menu);
		const close = e => { if (!e.target.closest('#phone-cal-stores-menu, [data-action="phone-cal-stores"]')) { menu.remove(); document.removeEventListener('click', close, true); } };
		setTimeout(() => document.addEventListener('click', close, true));
	},
	'toggle-store': el => { const v = new Set(crmCal.stores); el.checked ? v.add(el.dataset.store) : v.delete(el.dataset.store); CRM_MENUS.stores.selected = v; crmRenderCalendar(); },
	'phone-cal-filter': el => {
		document.getElementById('phone-cal-stores-menu')?.remove();
		let menu = document.getElementById('phone-cal-filter-menu');
		if (menu) { menu.remove(); return; }
		const roleData = CRM_DATA.roles[crmState.role];
		menu = document.createElement('div');
		menu.id = 'phone-cal-filter-menu'; menu.className = 'phone-menu'; menu.setAttribute('role', 'menu');
		menu.innerHTML = `<p class="phone-menu-label">Activity</p>
			<label><input type="checkbox" ${crmCal.show.appointment ? 'checked' : ''} data-action="toggle-calendar" data-category="appointment"><span class="swatch" data-category="appointment"></span>Appointments</label>
			<label><input type="checkbox" ${crmCal.show.logistics ? 'checked' : ''} data-action="toggle-calendar" data-category="logistics"><span class="swatch" data-category="logistics"></span>Deliveries &amp; drop-offs</label>
			<label><input type="checkbox" ${crmCal.show.followup ? 'checked' : ''} data-action="toggle-followups" data-category="followup"><span class="swatch" data-category="followup"></span>Follow-ups</label>`
			+ (roleData.owners && crmCal.owners ? `<p class="phone-menu-label">Salespeople</p>` + crmStoreReps(crmCal.stores || new Set(['OCA'])).map(o => `<label><input type="checkbox" ${crmCal.owners.has(o) ? 'checked' : ''} data-action="toggle-owner" data-owner="${o}"><span class="swatch" data-owner="${o}"></span>${o}</label>`).join('') : '');
		el.closest('.phone-topbar').appendChild(menu);
		const close = e => { if (!e.target.closest('#phone-cal-filter-menu, [data-action="phone-cal-filter"]')) { menu.remove(); document.removeEventListener('click', close, true); } };
		setTimeout(() => document.addEventListener('click', close, true), 0);
	},
	'phone-event-more': el => {
		const e = crmEventById(crmPop.eventId); if (!e) return;
		let menu = document.getElementById('phone-event-menu');
		if (menu) { menu.remove(); return; }
		const items = e.kind === 'followup'
			? [{ action:'event-complete', icon:'check', label:e.done ? 'Undo done' : 'Mark done' }, { action:'event-snooze', icon:'clock', label:'Move to tomorrow' }, { action:'event-delete', icon:'trash-2', label:'Delete', tone:'muted' }]
			: [{ action:'event-complete', icon:'check', label:e.done ? 'Undo complete' : 'Mark complete', tone:'ok' }, { action:'event-cancel', icon:'x-circle', label:e.state === 'cancelled' ? 'Restore' : 'Cancel appointment' }, { action:'event-delete', icon:'trash-2', label:'Delete', tone:'muted' }];
		menu = document.createElement('div');
		menu.id = 'phone-event-menu'; menu.className = 'phone-menu'; menu.setAttribute('role', 'menu');
		menu.innerHTML = items.map(it => `<button type="button" role="menuitem" data-action="${it.action}" data-event="${e.id}" data-tone="${it.tone || ''}"><span>${it.label}</span>${crmIcon(it.icon)}</button>`).join('');
		el.closest('.phone-topbar').appendChild(menu);
		crmIcons();
		const close = ev => { if (!ev.target.closest('[data-action="phone-event-more"]')) { menu.remove(); document.removeEventListener('click', close, true); } };
		setTimeout(() => document.addEventListener('click', close, true), 0);
	}
});
