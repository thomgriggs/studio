/* ========================================================================== */
/* II COMMANDMENTS — behavior                                                 */
/* All helpers are `tc*`. Nothing here talks to a server; every render reads   */
/* window.TC_DATA (data.js) and window.TC_VERSES (verses.js).                 */
/* Spine: delegated [data-action] click → TC_ACTIONS[action](el, ev).         */
/* ========================================================================== */

/* ---------- state ------------------------------------------------------- */
const TC_KEYS = { bible:'tc-bible', church:'tc-church', gospel:'tc-gospel' };
const tcState = { bible:null, gospel:null, church:null, step:'design', pick:{ design:null, product:null } };

/* ---------- boot -------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', tcInit);

function tcInit() {
	tcState.bible = tcResolveBible();
	tcState.gospel = tcStore(TC_KEYS.gospel);
	tcState.church = tcStoreJSON(TC_KEYS.church);
	document.body.dataset.bible = tcState.bible;
	if (tcState.gospel) document.body.dataset.gospel = tcState.gospel;

	tcRenderPickers();
	tcRenderVerses();
	tcRenderContextPills();
	tcRenderSplit();

	const view = document.body.dataset.view;
	if (view === 'home') tcInitHome();
	if (view === 'church') tcInitChurch();
	if (view === 'designers') tcInitDesigners();
	if (view === 'shop') tcInitShop();

	document.addEventListener('click', tcOnClick);
	document.addEventListener('change', tcOnChange);
	document.addEventListener('submit', ev => { /* forms are mock: route to the submit button's action, never reload */
		ev.preventDefault();
		const btn = ev.target.querySelector('[type="submit"][data-action]');
		if (btn) (TC_ACTIONS[btn.dataset.action] || TC_ACTIONS['coming-soon'])(btn, ev);
	});
}

/* ---------- storage (localStorage; prototype-safe) ----------------------- */
function tcStore(key, value) {
	try {
		if (value === undefined) return localStorage.getItem(key);
		if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, value);
	} catch (e) {}
	return value;
}
function tcStoreJSON(key, value) {
	if (value === undefined) { try { return JSON.parse(tcStore(key) || 'null'); } catch (e) { return null; } }
	return tcStore(key, value === null ? null : JSON.stringify(value));
}

/* ---------- toast ------------------------------------------------------- */
let tcToastTimer;
function tcToast(text) {
	let el = document.querySelector('.toast');
	if (!el) { el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite'); document.body.appendChild(el); }
	el.textContent = text;
	el.classList.add('is-open');
	clearTimeout(tcToastTimer);
	tcToastTimer = setTimeout(() => el.classList.remove('is-open'), 2400);
}

/* ---------- actions ----------------------------------------------------- */
/* Every button/link that does something carries data-action. Unknown or      */
/* not-yet-built actions fall through to a "Coming soon" toast — no dead UI.  */
const TC_ACTIONS = {
	'pick-bible':     (el) => tcSetBible(el.value),
	'pick-gospel':    (el) => tcSetGospel(el.dataset.gospel),
	'pick-church':    (el) => tcPickChurch(el.value),
	'church-url':     (el) => tcPickChurchUrl(el),
	'clear-church':   () => { tcSetChurch(null); tcToast('Cleared'); },
	'pick-design':    (el) => tcPickChoice('design', el),
	'pick-product':   (el) => tcPickChoice('product', el),
	'shop-next':      (el) => tcShopGo(el.dataset.to),
	'shop-back':      (el) => tcShopGo(el.dataset.to),
	'quick-order':    () => tcToast('Ordering is not wired yet — printer and checkout are still being decided'),
	'open-drawer':    (el) => tcOpenDrawer(el),
	'close-drawer':   () => tcCloseDrawer(),
	'share':          () => tcShare(),
	'copy-link':      () => tcCopyLink(),
	'toggle-sound':   (el) => tcToggleSound(el),
	'proceed':        () => { if (!tcState.gospel) tcToast('Pick a Gospel, or read them all below'); },
	'coming-soon':    () => tcToast('Coming soon')
};

function tcOnClick(ev) {
	const el = ev.target.closest('[data-action]');
	if (!el || el.matches('select, input')) return;
	const fn = TC_ACTIONS[el.dataset.action] || TC_ACTIONS['coming-soon'];
	if (el.tagName === 'A' && el.getAttribute('href') && el.getAttribute('href') !== '#') return; /* real links navigate */
	ev.preventDefault();
	fn(el, ev);
}
function tcOnChange(ev) {
	const el = ev.target.closest('select[data-action], input[data-action]');
	if (!el) return;
	(TC_ACTIONS[el.dataset.action] || TC_ACTIONS['coming-soon'])(el, ev);
}

/* ========================================================================== */
/* BIBLE VERSION                                                              */
/* Resolution order: ?bible= → localStorage → TC_DATA.defaultVersion.         */
/* Licensed versions are listed but disabled until an API seam exists.        */
/* ========================================================================== */
function tcVersion(id) { return TC_DATA.versions.find(v => v.id === id); }
function tcResolveBible() {
	const q = new URLSearchParams(location.search).get('bible');
	const stored = tcStore(TC_KEYS.bible);
	const pick = [q, stored, TC_DATA.defaultVersion].find(id => { const v = tcVersion(id); return v && v.source === 'bundled'; });
	if (q && pick === q) tcStore(TC_KEYS.bible, q);
	return pick;
}
function tcSetBible(id) {
	const v = tcVersion(id);
	if (!v || v.source !== 'bundled') { tcToast(`${v ? v.short : id} needs a license — coming later`); tcRenderPickers(); return; }
	tcState.bible = id;
	document.body.dataset.bible = id;
	tcStore(TC_KEYS.bible, id);
	tcRenderPickers();
	tcRenderVerses();
	tcToast(`Now reading the ${v.short}`);
}
function tcRenderPickers() {
	document.querySelectorAll('.bible-picker select').forEach(sel => {
		if (!sel.options.length) {
			TC_DATA.versions.forEach(v => {
				const o = new Option(v.source === 'bundled' ? v.label : `${v.label} — coming soon`, v.id);
				o.disabled = v.source !== 'bundled';
				sel.add(o);
			});
		}
		sel.value = tcState.bible;
	});
}

/* ========================================================================== */
/* VERSES                                                                     */
/* <blockquote class="verse" data-ref="john.14.15"> … [data-field="text"]     */
/* … [data-field="ref"]. Optional data-anim="fade|words|letters" on the block. */
/* data-part="1|2" on a .reveal block splits the text at data-split (a regex) */
/* ========================================================================== */
function tcVerse(ref, version = tcState.bible) {
	return (window.TC_VERSES && TC_VERSES[version] && TC_VERSES[version][ref]) || null;
}
/* joined text of a passage, with a quotation mark that opens or closes outside the excerpt removed */
function tcVerseText(entry) {
	let raw = entry ? entry.verses.map(v => v.text).join(' ') : '';
	const opens = (raw.match(/“/g) || []).length, closes = (raw.match(/”/g) || []).length;
	if (closes > opens) raw = raw.replace(/”(?=[^”]*$)/, '');
	if (opens > closes) raw = raw.replace(/^“/, '');
	return raw.trim();
}
function tcVerseHTML(entry, opts = {}) {
	if (!entry) return '<em>Verse not available in this version.</em>';
	if (entry.verses.length === 1 || opts.plain) return tcEscape(tcVerseText(entry));
	return entry.verses.map(v => `<span class="verse-num" aria-hidden="true">${v.n}</span>${tcEscape(v.text)}`).join(' ');
}
function tcEscape(s) { return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c])); }

function tcRenderVerses(root = document) {
	const version = tcVersion(tcState.bible);
	root.querySelectorAll('.verse[data-ref]').forEach(block => {
		const entry = tcVerse(block.dataset.ref);
		const text = block.querySelector('[data-field="text"]');
		const ref = block.querySelector('[data-field="ref"]');
		block.classList.toggle('is-loading', !entry);
		if (ref) ref.textContent = entry ? `${entry.reference} · ${version.short}` : block.dataset.ref;
		if (!text) return;
		if (block.classList.contains('reveal')) tcRenderReveal(block, text, entry);
		else if (block.dataset.anim) tcAnimateWords(block, text, entry);
		else text.innerHTML = tcVerseHTML(entry, { plain: block.dataset.plain === 'true' });
	});
}

/* two-part reveal: split the (single-verse) text at data-split, e.g. ",".     */
/* data-part="1" shows only the first half (the sheet: panel 1 is just          */
/* "If you love me…") — the comma becomes an ellipsis.                          */
function tcRenderReveal(block, text, entry) {
	const raw = tcVerseText(entry);
	const at = raw.search(new RegExp(block.dataset.split || ','));
	let a = at > -1 ? raw.slice(0, at + 1) : raw, b = at > -1 ? raw.slice(at + 1).trim() : '';
	if (block.dataset.part === '1') { a = a.replace(/[,;:]\s*$/, '') + '…'; b = ''; }
	text.innerHTML = `<span class="reveal-part">${tcEscape(a)}</span>${b ? `<span class="reveal-part">${tcEscape(b)}</span>` : ''}`;
	block.classList.remove('is-revealed');
	tcWhenVisible(block, () => block.classList.add('is-revealed'));
}
/* data-emph="all|whole": the first word matching gets <em class="emph"> — the  */
/* founder's panel 4: "fonts must emphasize 'All', but subtly". Version-aware,  */
/* since WEB says "whole" where KJV says "all".                                  */
function tcEmphWord(block, word) {
	const pat = block.dataset.emph; if (!pat) return false;
	return new RegExp(`^[“"']?(${pat})[,.;:!?”"']?$`, 'i').test(word);
}

/* hero animation — modes: fade | words | letters. ?anim= overrides for demos */
function tcAnimateWords(block, text, entry) {
	const mode = new URLSearchParams(location.search).get('anim') || block.dataset.anim;
	const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
	const raw = tcVerseText(entry);
	block.dataset.anim = mode;
	block.classList.remove('is-in');
	let emphDone = false;
	const wrapWord = (w) => { if (!emphDone && tcEmphWord(block, w)) { emphDone = true; return `<em class="emph">${tcEscape(w)}</em>`; } return tcEscape(w); };
	if (mode === 'fade' || reduce) {
		text.innerHTML = raw.split(' ').map(wrapWord).join(' ');
		if (reduce) { block.classList.add('is-in'); return; }
		tcWhenVisible(block, () => block.classList.add('is-in'));
		return;
	}
	const units = mode === 'letters' ? Array.from(raw) : raw.split(' ');
	const step = mode === 'letters' ? 22 : 90;
	text.innerHTML = units.map(u => `<span class="anim-unit">${u === ' ' ? '&nbsp;' : (mode === 'words' ? wrapWord(u) : tcEscape(u))}</span>${mode === 'words' ? ' ' : ''}`).join('');
	text.setAttribute('aria-label', raw);
	tcWhenVisible(block, () => {
		text.querySelectorAll('.anim-unit').forEach((u, i) => { u.style.transitionDelay = `${i * step}ms`; u.classList.add('is-in'); });
		block.classList.add('is-in');
	});
}

function tcInView(el, fraction = 0.1) {
	const r = el.getBoundingClientRect(); const vh = innerHeight || document.documentElement.clientHeight;
	const visible = Math.min(r.bottom, vh) - Math.max(r.top, 0);
	return visible > 0 && visible >= Math.min(r.height, vh) * fraction;
}
/* run fn once when el is on screen: check now, then again after fonts/load, and watch for scroll */
function tcWhenVisible(el, fn) {
	let done = false; const go = () => { if (done) return; done = true; fn(); };
	if (tcInView(el, 0.15)) return go();
	if ('IntersectionObserver' in window) { const io = new IntersectionObserver(entries => { if (entries.some(e => e.isIntersecting)) { io.disconnect(); go(); } }, { threshold: 0.15 }); io.observe(el); }
	const check = () => { if (tcInView(el, 0.15)) go(); };
	addEventListener('load', check, { once:true });
	if (document.fonts && document.fonts.ready) document.fonts.ready.then(check);
	addEventListener('scroll', check, { passive:true });
	const poll = setInterval(() => { check(); if (done || !el.isConnected) clearInterval(poll); }, 250);
}

/* ========================================================================== */
/* HOME — gospel picker + passages                                            */
/* ========================================================================== */
function tcInitHome() {
	tcRenderGospels();
	tcRenderPassages();
	tcRenderRelated();
	tcWatchPanels();
	document.addEventListener('keydown', ev => { if (ev.key === 'Escape') tcCloseDrawer(); });
}
function tcRenderGospels() {
	const host = document.querySelector('.gospel-picker');
	if (!host) return;
	const numerals = ['I', 'II', 'III', 'IV'];
	/* .is-corners: the founder's panel 5 — four icon buttons top-left / top-right / bottom-left / bottom-right */
	host.innerHTML = TC_DATA.gospels.map((g, i) => `
		<button type="button" class="gospel-btn${tcState.gospel === g.id ? ' is-active' : ''}" data-action="pick-gospel" data-gospel="${g.id}" aria-pressed="${tcState.gospel === g.id}">
			<img class="gospel-icon" src="${g.icon}" alt="" width="96" height="96">
			<span class="gospel-n" aria-hidden="true">${numerals[i]}</span>
			<span class="gospel-name">${g.label}</span>
			<span class="gospel-symbol">${g.symbol}</span>
		</button>`).join('');
}
/* sound — the founder wants music on the opening (ideally Aramaic; his picks are in TC_DATA.music).   */
/* No track is bundled: they're licensed recordings. The toggle is real; it plays once a file exists.    */
function tcToggleSound(el) {
	const on = el.getAttribute('aria-pressed') !== 'true';
	const track = TC_DATA.music && TC_DATA.music[0];
	let audio = document.querySelector('audio.open-audio');
	if (on && track && track.src) {
		if (!audio) { audio = document.createElement('audio'); audio.className = 'open-audio'; audio.loop = true; audio.src = track.src; document.body.appendChild(audio); }
		audio.play().catch(() => {});
	} else if (audio) audio.pause();
	el.setAttribute('aria-pressed', on);
	el.setAttribute('aria-label', `Sound: ${on ? 'on' : 'off'}`);
	const label = el.querySelector('[data-field="sound.label"]'); if (label) label.textContent = on ? 'Sound on' : 'Sound';
	if (on && !(track && track.src)) tcToast(track ? `Music: “${track.title}” — ${track.artist}. Not licensed yet, so silent for now.` : 'No track chosen yet');
}
function tcRenderPassages() {
	const host = document.querySelector('.passages');
	if (!host) return;
	host.innerHTML = TC_DATA.gospels.map(g => `
		<details class="passage${tcState.gospel === g.id ? ' is-chosen' : ''}" data-gospel="${g.id}" ${tcState.gospel === g.id || !tcState.gospel ? 'open' : ''}>
			<summary>${g.label}</summary>
			<div class="passage-body">
				<blockquote class="verse" data-ref="${g.ref}">
					<p class="verse-text" data-field="text"></p>
					<cite class="verse-ref" data-field="ref"></cite>
				</blockquote>
				<p class="eyebrow">${g.symbol}</p>
				<p>${g.meaning}</p>
			</div>
		</details>`).join('');
	tcRenderVerses(host);
}
function tcSetGospel(id) {
	tcState.gospel = id;
	document.body.dataset.gospel = id;
	tcStore(TC_KEYS.gospel, id);
	tcRenderGospels();
	tcRenderPassages();
	/* with a Proceed button on the panel (the founder's panel 5), picking doesn't jump — Proceed does */
	const target = document.getElementById('verses');
	if (target && !document.querySelector('.gospel-proceed')) { target.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }
	const g = TC_DATA.gospels.find(x => x.id === id);
	tcToast(`Reading ${g.label}`);
}
function tcRenderRelated() {
	const host = document.querySelector('.related');
	if (!host) return;
	host.innerHTML = TC_DATA.related.map(r => `
		<details class="related-card">
			<summary>${r.title}</summary>
			<blockquote class="verse" data-ref="${r.ref}" data-plain="true">
				<p class="verse-text" data-field="text"></p>
				<cite class="verse-ref" data-field="ref"></cite>
			</blockquote>
		</details>`).join('');
	tcRenderVerses(host);
}

/* ---------- drawer (related verses) + panel reveal ------------------------ */
let tcDrawerOpener = null;
function tcOpenDrawer(el) {
	const d = document.getElementById('drawer'); if (!d) return;
	tcDrawerOpener = el || null;
	d.hidden = false; requestAnimationFrame(() => d.classList.add('is-open'));
	document.body.style.overflow = 'hidden';
	if (el) el.setAttribute('aria-expanded', 'true');
	const first = d.querySelector('.drawer-close'); if (first) first.focus();
}
function tcCloseDrawer() {
	const d = document.getElementById('drawer'); if (!d || d.hidden) return;
	d.classList.remove('is-open');
	document.body.style.overflow = '';
	setTimeout(() => { d.hidden = true; }, 400);
	if (tcDrawerOpener) { tcDrawerOpener.setAttribute('aria-expanded', 'false'); tcDrawerOpener.focus(); }
}
/* each panel rises in once as it enters the viewport; the topbar gets a hairline once you've scrolled */
function tcWatchPanels() {
	const panels = [...document.querySelectorAll('.panel')];
	if (!panels.length) return;
	/* sweep: anything on screen right now is seen (observers created at DOMContentLoaded have proven unreliable) */
	const sweep = () => panels.forEach(p => { if (!p.classList.contains('is-seen') && tcInView(p, 0.08)) p.classList.add('is-seen'); });
	sweep();
	if ('IntersectionObserver' in window) {
		/* a low threshold: tall panels (big display type on a small screen) never reach 25% visible */
		const io = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-seen'); io.unobserve(e.target); } }), { threshold: 0.08 });
		panels.forEach(p => io.observe(p));
	}
	addEventListener('load', sweep, { once:true });
	if (document.fonts && document.fonts.ready) document.fonts.ready.then(sweep);
	addEventListener('scroll', () => { sweep(); document.body.classList.toggle('is-scrolled', scrollY > 24); }, { passive:true });
	/* and a light poll — scroll/observer events have proven unreliable in some embeds; it stops once every panel is seen */
	const poll = setInterval(() => { sweep(); if (panels.every(p => p.classList.contains('is-seen'))) clearInterval(poll); }, 250);
}

/* ========================================================================== */
/* CHURCH — panel 13; choice persists across pages                            */
/* ========================================================================== */
function tcInitChurch() {
	const sel = document.querySelector('select[data-action="pick-church"]');
	if (sel && sel.options.length <= 1) TC_DATA.churches.forEach(c => sel.add(new Option(`${c.name} — ${c.city}`, c.id)));
	if (sel && tcState.church && tcState.church.id) sel.value = tcState.church.id;
	tcRenderChurchName();
}
function tcPickChurch(id) {
	const c = TC_DATA.churches.find(x => x.id === id);
	tcSetChurch(c ? { id:c.id, name:c.name, url:c.url } : null);
}
function tcPickChurchUrl(el) {
	const form = el.closest('form');
	const input = form ? form.querySelector('input[name="church-url"]') : null;
	const url = input ? input.value.trim() : '';
	if (!url) { tcToast('Enter your church or non-profit’s website'); return; }
	let name = url;
	try { name = new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace(/^www\./, ''); } catch (e) {}
	tcSetChurch({ id:null, name, url });
}
function tcSetChurch(church) {
	tcState.church = church;
	tcStoreJSON(TC_KEYS.church, church);
	tcRenderChurchName();
	tcRenderContextPills();
	tcRenderSplit(tcState.pick && tcState.pick.product ? tcState.pick.product.price : null);
	if (church) tcToast(`Supporting ${church.name}`);
}
function tcRenderChurchName() {
	document.querySelectorAll('[data-field="church.name"]').forEach(el => { el.textContent = tcState.church ? tcState.church.name : ''; });
}
function tcRenderContextPills() {
	document.querySelectorAll('.pill[data-context="church"]').forEach(p => {
		p.classList.toggle('is-hidden', !tcState.church);
		const f = p.querySelector('[data-field="church.name"]');
		if (f) f.textContent = tcState.church ? tcState.church.name : '';
	});
	document.querySelectorAll('.pill[data-context="bible"] [data-field="bible.short"]').forEach(f => { f.textContent = tcVersion(tcState.bible).short; });
}

/* ========================================================================== */
/* DESIGNERS — grid, or one profile when ?designer=slug                       */
/* ========================================================================== */
function tcInitDesigners() {
	const slug = new URLSearchParams(location.search).get('designer');
	const d = TC_DATA.designers.find(x => x.id === slug);
	const grid = document.querySelector('.designer-grid');
	const profile = document.querySelector('.designer-profile');
	if (d && profile) {
		grid && (grid.hidden = true);
		document.querySelector('.page-head').hidden = true;
		profile.hidden = false;
		profile.querySelectorAll('[data-field]').forEach(el => {
			const key = el.dataset.field;
			if (key === 'styles') el.innerHTML = d.styles.map(s => `<span class="pill">${tcEscape(s)}</span>`).join('');
			else if (key === 'story') el.innerHTML = `<p>${tcEscape(d.story)}</p>`;
			else if (key === 'designs') el.innerHTML = d.designs.map(x => `
				<li class="design-card">
					<img src="${x.thumb}" alt="${tcEscape(x.title)} by ${tcEscape(d.name)}" width="160" height="160">
					<span class="choice-title">${tcEscape(x.title)}</span>
					${x.art ? `<span class="choice-meta art-credit">Stand-in art: ${tcEscape(x.art)}</span>` : ''}
					<a class="btn" href="shop.html?design=${x.id}">Make it yours</a>
				</li>`).join('');
			else el.textContent = d[key] ?? '';
		});
		document.title = `${d.name} — II Commandments`;
		return;
	}
	if (!grid) return;
	grid.innerHTML = TC_DATA.designers.map(x => `
		<li class="designer-card">
			<span class="avatar" aria-hidden="true">${x.initials}</span>
			<a href="designers.html?designer=${x.id}"><span class="card-name">${tcEscape(x.name)}</span></a>
			<span class="card-location">${tcEscape(x.location)}</span>
			<span class="card-tagline">${tcEscape(x.tagline)}</span>
			<span class="card-tags">${x.styles.map(s => `<span class="pill">${tcEscape(s)}</span>`).join('')}</span>
		</li>`).join('');
}

/* ========================================================================== */
/* SHOP — design → customize → product → order (mock stepper)                 */
/* ========================================================================== */
const TC_STEPS = ['design', 'customize', 'product', 'order'];
function tcAllDesigns() { return TC_DATA.designers.flatMap(d => d.designs.map(x => ({ ...x, designer:d }))); }
function tcInitShop() {
	const designs = tcAllDesigns();
	const pre = new URLSearchParams(location.search).get('design');
	tcState.pick.design = designs.find(x => x.id === pre) || null;
	const dHost = document.querySelector('[data-choices="design"]');
	if (dHost) dHost.innerHTML = designs.map(x => { const on = !!tcState.pick.design && tcState.pick.design.id === x.id; return `
		<li><button type="button" class="choice${on ? ' is-active' : ''}" data-action="pick-design" data-id="${x.id}" aria-pressed="${on}">
			<img src="${x.thumb}" alt="" width="160" height="160">
			<span class="choice-title">${tcEscape(x.title)}</span>
			<span class="choice-meta">by ${tcEscape(x.designer.name)}</span>${x.art ? `<span class="choice-meta art-credit">Stand-in art: ${tcEscape(x.art)}</span>` : ''}
		</button></li>`; }).join('');
	const pHost = document.querySelector('[data-choices="product"]');
	if (pHost) pHost.innerHTML = TC_DATA.products.map(p => `
		<li><button type="button" class="choice" data-action="pick-product" data-id="${p.id}" aria-pressed="false">
			<span class="choice-title">${tcEscape(p.label)}</span>
			<span class="choice-meta">$${p.price} · ${p.sizes.join(', ')}</span>
		</button></li>`).join('');
	tcShopGo(tcState.pick.design ? 'customize' : 'design');
}
function tcPickChoice(kind, el) {
	const list = kind === 'design' ? tcAllDesigns() : TC_DATA.products;
	tcState.pick[kind] = list.find(x => x.id === el.dataset.id) || null;
	el.closest('.choice-grid').querySelectorAll('.choice').forEach(b => { const on = b === el; b.classList.toggle('is-active', on); b.setAttribute('aria-pressed', on); });
	tcRenderOrder();
}
function tcShopGo(step) {
	if (!TC_STEPS.includes(step)) return;
	if (step !== 'design' && !tcState.pick.design) { tcToast('Choose a design first'); step = 'design'; }
	if (step === 'order' && !tcState.pick.product) { tcToast('Choose a product first'); step = 'product'; }
	tcState.step = step;
	const idx = TC_STEPS.indexOf(step);
	document.querySelectorAll('.stepper li').forEach((li, i) => { li.classList.toggle('is-current', i === idx); li.classList.toggle('is-done', i < idx); if (i === idx) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current'); });
	document.querySelectorAll('.shop-step').forEach(s => s.classList.toggle('is-current', s.dataset.step === step));
	tcRenderOrder();
	const h = document.querySelector(`.shop-step[data-step="${step}"] h2`);
	if (h) h.setAttribute('tabindex', '-1'), h.focus({ preventScroll: false });
}
function tcRenderOrder() {
	const d = tcState.pick.design, p = tcState.pick.product;
	const set = (key, val) => document.querySelectorAll(`[data-field="order.${key}"]`).forEach(el => { el.textContent = val; });
	set('design', d ? `${d.title} by ${d.designer.name}` : '—');
	set('designer', d ? d.designer.name : '—');
	set('product', p ? p.label : '—');
	set('price', p ? `$${p.price.toFixed(2)}` : '—');
	set('church', tcState.church ? tcState.church.name : 'Not chosen yet');
	const preview = document.querySelector('.customize-preview');
	if (preview) preview.textContent = d ? `${d.title} — preview placeholder` : 'Choose a design to preview';
	tcRenderSplit(p ? p.price : null);
}

/* ========================================================================== */
/* SPLIT — 33 / 33 / 33 (+1) bar; with a price it shows dollars              */
/* ========================================================================== */
/* The split depends on whether the buyer chose a church: thirds with one,     */
/* 50/50 designer / II Commandments without. `data-split-case` forces a case   */
/* (the About page shows both).                                                */
function tcSplitFor(hasChurch) { return hasChurch ? TC_DATA.split.withChurch : TC_DATA.split.noChurch; }
function tcRenderSplit(price = null) {
	document.querySelectorAll('.split').forEach(host => {
		const forced = host.dataset.splitCase;
		const rows = tcSplitFor(forced ? forced === 'church' : !!tcState.church);
		const bar = host.querySelector('.split-bar'), legend = host.querySelector('.split-legend'), note = host.querySelector('.split-note');
		if (bar) bar.innerHTML = rows.map(s => `<span class="split-seg" data-split="${s.id}" style="flex:${s.share}" aria-hidden="true"></span>`).join('');
		if (legend) legend.innerHTML = rows.map(s => `<li data-split="${s.id}">${tcEscape(s.label)} · ${Math.round(s.share * 100)}%${price ? ` ($${(price * s.share).toFixed(2)})` : ''}</li>`).join('');
		if (note && !forced) note.textContent = ''; /* the no-church case isn't spotlighted (Thom, 2026-09-30) — the numbers just follow the choice */
	});
}

/* ========================================================================== */
/* SHARE — Web Share API when present, else copy the link                     */
/* ========================================================================== */
function tcShare() {
	const data = { title:'II Commandments', text:'All of the Law and the Prophets hang on these two commandments.', url:location.origin + location.pathname };
	if (navigator.share) navigator.share(data).catch(() => {}); else tcCopyLink();
}
function tcCopyLink() {
	const url = location.origin + location.pathname;
	if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => tcToast('Link copied'), () => tcToast(url));
	else tcToast(url);
}
