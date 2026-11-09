/* ====================================================================== */
/* II Commandments — Concept 02                                             */
/* one long page; sections are full-height; verse text comes from verses.js */
/* ====================================================================== */
(function () {
	'use strict';

	/* ---------------------------------------------------------------- */
	/* VERSES                                                             */
	/* ---------------------------------------------------------------- */
	/* ?bible= is for testing and applies to this load only; a version is remembered only when chosen in the picker */
	if (localStorage.getItem('tc-bible') && !localStorage.getItem('tc-bible-chosen')) { localStorage.removeItem('tc-bible'); }
	function version() {
		var q = new URLSearchParams(location.search).get('bible');
		var v = q || localStorage.getItem('tc-bible') || TC_DATA.defaultVersion;
		return TC_VERSES[v] ? v : TC_DATA.defaultVersion;
	}
	function passage(ref) { return TC_VERSES[version()][ref]; }
	/* an excerpt may open or close a quotation outside itself; drop the unmatched mark */
	function text(ref) {
		var t = passage(ref).verses.map(function (v) { return v.text; }).join(' ').trim();
		var opens = (t.match(/[“"]/g) || []).length, closes = (t.match(/[”"]/g) || []).length;
		if (/[”"]$/.test(t) && closes > opens) { t = t.replace(/[”"]+$/, ''); }
		if (/^[“"]/.test(t) && opens > closes) { t = t.replace(/^[“"]+/, ''); }
		return t;
	}

	/* wrap each word so it can animate in on its own delay */
	function words(el, str) {
		el.textContent = '';
		str.split(/\s+/).filter(Boolean).forEach(function (w, i) {
			var s = document.createElement('span');
			s.className = 'w'; s.style.setProperty('--i', i); s.textContent = w;
			el.appendChild(s); el.appendChild(document.createTextNode(' '));
		});
	}

	/* opening line: the verse split at data-split, trailing punctuation dropped.                         */
	/* data-part="1" renders only the first half with an ellipsis; data-part="2" only the second half      */
	/* and the reference; without data-part both halves render in one element (the two-beat opener).      */
	function renderOpen(h) {
		/* data-copy pins the line to one wording; the reference still comes from the passage */
		var t = h.dataset.copy || text(h.dataset.ref), sep = h.dataset.split || ',', i = t.indexOf(sep), part = h.dataset.part;
		var clean = function (s) { return s.replace(/^[\s,.;:]+|[\s,.;:]+$/g, ''); };
		h.textContent = '';
		var mk = function (cls, str) { var s = document.createElement('span'); s.className = 'verse__part ' + cls; words(s, str); h.appendChild(s); return s; };
		var first = clean(i < 0 ? t : t.slice(0, i)), second = i >= 0 ? clean(t.slice(i + sep.length)) : '';
		if (part !== '2') { mk('verse__part1', first + (part === '1' && second ? '…' : '')); }
		if (second && part !== '1') {
			mk('verse__part2', second);
			var ref = document.createElement('span'); ref.className = 'verse__ref'; ref.textContent = passage(h.dataset.ref).reference; h.appendChild(ref);
		}
	}
	/* full verse; data-emph is a |-separated list of regexes matched (case-insensitive) against each word's letters; matches get .emph */
	function renderVerse(h) {
		words(h, text(h.dataset.ref));
		var src = h.dataset.emph;
		if (!src) { return; }
		var re = new RegExp(src, 'i');
		h.querySelectorAll('.w').forEach(function (s) { if (re.test(s.textContent.replace(/[^\w]/g, ''))) { s.classList.add('emph'); } });
		/* data-show-ref: the reference follows the verse (burgundy, like the opener's) */
		if ('showRef' in h.dataset) { var ref = document.createElement('span'); ref.className = 'verse__ref'; ref.textContent = passage(h.dataset.ref).reference; h.appendChild(ref); }
	}
	function renderAll() {
		document.querySelectorAll('.verse--open').forEach(renderOpen);
		document.querySelectorAll('.verse--law').forEach(renderVerse);
		document.querySelectorAll('[data-words]').forEach(function (el) { if (!el.dataset.ref) { words(el, el.dataset.copy || (el.dataset.copy = el.textContent)); } });
		renderFloat();
	}
	renderAll();

	/* reveal when a section scrolls into view; the opener reveals at once */
	var io = new IntersectionObserver(function (entries) {
		entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); } });
	}, { threshold: .4 });
	document.querySelectorAll('.reveal, .segue').forEach(function (el) { io.observe(el); });
	document.querySelectorAll('.prophets li').forEach(function (li, i) { li.style.setProperty('--i', i); });
	/* opener: the picture fades in, then the words, then the light on them */
	var pin = document.querySelector('.pin');
	function openerIn() {
		/* on load: the picture, then the line fades up. the light comes with the scroll. */
		document.querySelectorAll('.pin').forEach(function (p) { p.classList.add('is-loaded'); });
		setTimeout(function () { document.querySelectorAll('.verse--open').forEach(function (h) { h.classList.add('is-in'); }); }, reduced ? 0 : 900);
	}
	var bg = pin && pin.querySelector('.sec__bg');
	if (bg && !bg.complete) { bg.addEventListener('load', openerIn, { once: true }); bg.addEventListener('error', openerIn, { once: true }); } else { openerIn(); }

	/* ---------------------------------------------------------------- */
	/* GOSPELS — choose one window; its passage renders in section 6     */
	/* choice persists in tc-gospel; without one, Matthew reads first     */
	/* ---------------------------------------------------------------- */
	var gospelsEl = document.querySelector('.gospels');
	function gospelById(id) { return TC_DATA.gospels.filter(function (g) { return g.id === id; })[0]; }
	function renderPassage(id) {
		var g = gospelById(id) || TC_DATA.gospels[0], ps = passage(g.ref), art = document.querySelector('.passage');
		if (!art) { return; }
		art.dataset.gospel = g.id;
		art.querySelector('[data-field="gospel"]').textContent = 'The Gospel of ' + g.label;
		art.querySelector('[data-field="reference"]').textContent = ps.reference;
		var box = art.querySelector('[data-field="text"]'); box.textContent = '';
		var para = document.createElement('p');
		ps.verses.forEach(function (v) {
			var n = document.createElement('span'); n.className = 'n'; n.textContent = v.n;
			para.appendChild(n);
			/* first / second / commandment(s) stand out in gold */
			v.text.split(/\s+/).filter(Boolean).forEach(function (w) {
				if (/^(first|second|commandments?)$/.test(w.replace(/[^A-Za-z]/g, '').toLowerCase())) {
					var e = document.createElement('span'); e.className = 'emph'; e.textContent = w; para.appendChild(e);
				} else { para.appendChild(document.createTextNode(w)); }
				para.appendChild(document.createTextNode(' '));
			});
		});
		box.appendChild(para);
	}
	function setGospel(id) {
		localStorage.setItem('tc-gospel', id);
		document.documentElement.dataset.gospel = id; /* the room takes the Gospel's colour */
		document.querySelectorAll('.gospel').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.gospel === id ? 'true' : 'false'); });
		if (gospelsEl) { gospelsEl.classList.add('has-choice'); }
		renderPassage(id);
	}
	/* click: the door opens, the row drifts in through it, the passage section takes over, then the row resets for the way back */
	var entering = false;
	function enter(btn) {
		if (entering) { return; }
		entering = true;
		setGospel(btn.dataset.gospel);
		var r = btn.getBoundingClientRect(), g = gospelsEl.getBoundingClientRect();
		gospelsEl.style.setProperty('--door_x', ((r.left + r.width / 2 - g.left) / g.width * 100).toFixed(1) + '%');
		btn.classList.add('is-open');
		var delay = reduced ? 0 : 1500;
		setTimeout(function () { gospelsEl.classList.add('is-entering'); }, reduced ? 0 : 100);
		setTimeout(function () {
			document.getElementById('s6').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
			setTimeout(function () {
				gospelsEl.classList.remove('is-entering'); btn.classList.remove('is-open'); entering = false;
			}, reduced ? 0 : 900);
		}, delay);
	}
	document.querySelectorAll('.gospels:not(.gospels--corners) .gospel').forEach(function (b) { b.addEventListener('click', function () { enter(b); }); });
	var saved = localStorage.getItem('tc-gospel');
	if (saved && gospelById(saved)) { setGospel(saved); } else { renderPassage('matthew'); }

	/* ---------------------------------------------------------------- */
	/* BIBLE PICKER — bundled versions only; choice persists in tc-bible  */
	/* ---------------------------------------------------------------- */
	document.querySelectorAll('[data-action="bible"]').forEach(function (sel) {
		TC_DATA.versions.filter(function (v) { return v.source === 'bundled'; }).forEach(function (v) {
			var o = document.createElement('option'); o.value = v.id; o.textContent = v.label || v.name || v.id; sel.appendChild(o);
		});
		sel.value = version();
		sel.addEventListener('change', function () {
			document.querySelectorAll('[data-action="bible"]').forEach(function (o) { o.value = sel.value; }); /* every picker agrees */
			localStorage.setItem('tc-bible', sel.value); localStorage.setItem('tc-bible-chosen', '1');
			var u = new URL(location.href); u.searchParams.delete('bible'); history.replaceState(null, '', u); /* the saved choice now wins */
			document.querySelectorAll('.reveal.is-in').forEach(function (el) { el.classList.remove('is-in'); });
			renderAll(); renderPassage(localStorage.getItem('tc-gospel') || 'matthew');
			requestAnimationFrame(function () { requestAnimationFrame(function () { document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-in'); }); }); });
		});
	});

	/* ---------------------------------------------------------------- */
	/* SCRUB — scroll position through a tall section drives --p (0..1)   */
	/* and four eased phases --p1..--p4 the CSS animates from              */
	/* ---------------------------------------------------------------- */
	var ease = function (t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };
	var phase = function (p, a, b) { return ease(Math.min(1, Math.max(0, (p - a) / (b - a)))); };
	var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

	document.querySelectorAll('[data-letters]').forEach(function (el) {
		var str = el.textContent; el.textContent = '';
		str.split('').forEach(function (ch) { var s = document.createElement('span'); s.className = 'l'; s.textContent = ch; el.appendChild(s); });
	});

	function scrub() {
		document.querySelectorAll('.scrub, .pin').forEach(function (sec) {
			var r = sec.getBoundingClientRect(), track = r.height - innerHeight;
			var p = reduced ? 1 : Math.min(1, Math.max(0, -r.top / track));
			sec.style.setProperty('--p', p);
			if (!sec.classList.contains('scrub')) {
				/* curtain: how far the next slide has risen over this one (0 = not yet, 1 = covered) */
				var c = Math.min(1, Math.max(0, (innerHeight - r.bottom) / innerHeight + 1));
				c = Math.min(1, Math.max(0, 1 - r.bottom / innerHeight));
				sec.style.setProperty('--c', c);
				var marks = sec.querySelectorAll('.prophets li');
				if (marks.length) {
					/* four major marks light one after another over the first two thirds; the twelve minor follow */
					var majors = [].filter.call(marks, function (m) { return m.classList.contains('prophets__major'); }), minors = [].filter.call(marks, function (m) { return !m.classList.contains('prophets__major'); });
					majors.forEach(function (m, i) { m.style.setProperty('--g', reduced ? 1 : Math.min(1, Math.max(0, (p * 1.5 * (majors.length + .6) - i) / 1.2))); });
					minors.forEach(function (m, i) { m.style.setProperty('--g', reduced ? 1 : Math.min(1, Math.max(0, ((p - .62) / .38 * (minors.length + 2) - i) / 3))); });
				}
				/* arrival: a later pin's stage rises over the one before; its fixed line waits until the stage has nearly covered the viewport */
				var a = reduced ? 1 : Math.min(1, Math.max(0, ((innerHeight - r.top) / innerHeight - .55) / .45));
				sec.style.setProperty('--a', a);
				var v = sec.querySelector('.verse');
				if (v) {
					var lit = function (part, q) { var ws = part.querySelectorAll('.w'), n = ws.length; ws.forEach(function (w, i) { w.style.setProperty('--lit', reduced ? 1 : Math.min(1, Math.max(0, (q * (n + .6) - i) / 1.2))); }); };
					var clamp01 = function (x) { return Math.min(1, Math.max(0, x)); };
					var p1 = v.querySelector('.verse__part1'), p2 = v.querySelector('.verse__part2'), ref = v.querySelector('.verse__ref');
					v.classList.toggle('is-gone', r.bottom <= 0 || r.top >= innerHeight);
					if (p1 && p2) {
						/* two beats in one panel: the first half is read (0..0.5), swaps at ~0.55, the second half is read (0.6..0.9), then the reference */
						lit(p1, p / .5);
						lit(p2, (p - .6) / .3);
						v.style.setProperty('--o1', reduced ? 1 : 1 - clamp01((p - .5) / .06));
						v.style.setProperty('--o2', reduced ? 1 : clamp01((p - .55) / .06));
						v.style.setProperty('--or', reduced ? 1 : clamp01((p - .88) / .08));
					} else {
						/* one half per panel: the light reads across the line word by word; the reference, when there is one, follows */
						lit(v, ref ? p / .8 : p);
						if (p2) { v.style.setProperty('--o2', 1); }
						if (ref) { v.style.setProperty('--or', reduced ? 1 : clamp01((p - .82) / .1)); }
					}
				}
				return;
			}
			sec.style.setProperty('--p1', phase(p, 0.00, 0.30)); /* left window lights */
			sec.style.setProperty('--p2', phase(p, 0.15, 0.45)); /* right window lights */
			sec.style.setProperty('--p3', phase(p, 0.40, 0.60)); /* the glow and the cast light */
			sec.style.setProperty('--p4', phase(p, 0.85, 1.00)); /* unused: the mark holds; section 3 arrives over it */
			var letters = sec.querySelectorAll('.wordmark .l'), on = Math.round(phase(p, 0.55, 0.80) * letters.length);
			letters.forEach(function (l, i) { l.classList.toggle('is-on', i < on); });
		});
	}
	addEventListener('scroll', scrub, { passive: true });
	addEventListener('resize', scrub);
	scrub();

	/* ---------------------------------------------------------------- */
	/* PATHS — the finale; the two actions are not wired yet → toast      */
	/* ---------------------------------------------------------------- */
	var toastEl = document.createElement('div'); toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); document.body.appendChild(toastEl);
	var toastT;
	function toast(msg) { toastEl.textContent = msg; toastEl.classList.add('is-on'); clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('is-on'); }, 2200); }
	document.querySelectorAll('[data-action="submit-design"], [data-action="go-shop"]').forEach(function (a) {
		a.addEventListener('click', function (ev) { ev.preventDefault(); toast('Coming soon'); });
	});

	/* ---------------------------------------------------------------- */
	/* AGAPE — scroll drives the crossfade of AGAPE / LOVE, then two beats */
	/* of related words (placeholders until the founder's chart arrives)    */
	/* ---------------------------------------------------------------- */
	var agape = document.querySelector('.sec--agape');
	function agapeScrub() {
		if (!agape) { return; }
		var r = agape.getBoundingClientRect(), track = r.height - innerHeight;
		var p = reduced ? 1 : Math.min(1, Math.max(0, -r.top / track));
		/* 0 to .3: three full crossfades (AGAPE shows at both ends), .3 to .4: they settle stacked */
		var a = .5 + .5 * Math.cos(Math.min(1, p / .3) * Math.PI * 6);
		agape.style.setProperty('--ag-a', a.toFixed(3));
		agape.style.setProperty('--ag-l', (1 - a).toFixed(3));
		agape.style.setProperty('--ag-s', phase(p, .3, .4));
		agape.style.setProperty('--ag-q1', phase(p, .4, .65));
		agape.style.setProperty('--ag-q2', phase(p, .7, 1));
	}
	addEventListener('scroll', agapeScrub, { passive: true });
	addEventListener('resize', agapeScrub);
	agapeScrub();

	/* ---------------------------------------------------------------- */
	/* FLOATING VERSES — TC_DATA.related drifts; click opens a reading panel */
	/* renderFloat() is also called from renderAll(), before this block runs */
	/* ---------------------------------------------------------------- */
	function renderFloat() {
		var sec = document.querySelector('.sec--float');
		if (!sec) { return; }
		var field = sec.querySelector('.float__field'), list = TC_DATA.related;
		var cols = innerWidth < 640 ? 2 : 3, rows = Math.ceil(list.length / cols);
		sec.style.setProperty('--cols', cols); sec.style.setProperty('--rows', rows);
		field.textContent = '';
		var seed = 7, rnd = function () { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
		/* each verse gets its own cell of a grid, jittered inside it, so none overlap */
		list.forEach(function (it, i) {
			var ps = passage(it.ref); if (!ps) { return; }
			var a = document.createElement('a'); a.className = 'float__verse'; a.href = '#'; a.dataset.ref = it.ref;
			a.style.setProperty('--i', i);
			a.style.left = ((i % cols + rnd() * .28) / cols * 100).toFixed(1) + '%';
			a.style.top = ((Math.floor(i / cols) + rnd() * .5) / rows * 100).toFixed(1) + '%';
			var r = document.createElement('span'); r.className = 'float__verse-ref'; r.textContent = ps.reference;
			var t = document.createElement('span'); t.className = 'float__verse-title'; t.textContent = it.title;
			a.appendChild(r); a.appendChild(t); field.appendChild(a);
		});
		var panel = sec.querySelector('.float__read');
		if (!panel.hidden && panel.dataset.ref) { fillRead(panel, panel.dataset.ref); } /* version changed while reading */
	}
	function fillRead(panel, ref) {
		var ps = passage(ref); if (!ps) { return; }
		panel.dataset.ref = ref;
		panel.querySelector('.float__ref').textContent = ps.reference;
		var box = panel.querySelector('.float__text'); box.textContent = '';
		var para = document.createElement('p');
		ps.verses.forEach(function (v) {
			var n = document.createElement('span'); n.className = 'n'; n.textContent = v.n;
			para.appendChild(n); para.appendChild(document.createTextNode(v.text + ' '));
		});
		box.appendChild(para);
	}
	(function () {
		var sec = document.querySelector('.sec--float'); if (!sec) { return; }
		var panel = sec.querySelector('.float__read'), closeBtn = panel.querySelector('.float__close'), body = panel.querySelector('.float__text'), opener = null;
		function close() { panel.hidden = true; panel.dataset.ref = ''; if (opener) { opener.focus(); opener = null; } }
		sec.querySelector('.float__field').addEventListener('click', function (ev) {
			var a = ev.target.closest('.float__verse'); if (!a) { return; }
			ev.preventDefault(); opener = a;
			fillRead(panel, a.dataset.ref); panel.hidden = false; body.scrollTop = 0; closeBtn.focus();
		});
		closeBtn.addEventListener('click', close);
		panel.addEventListener('click', function (ev) { if (ev.target === panel) { close(); } });
		panel.addEventListener('keydown', function (ev) {
			if (ev.key === 'Escape') { ev.preventDefault(); close(); }
			if (ev.key === 'Tab') { /* keep focus inside: close button <-> text */
				var first = closeBtn, last = body;
				if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last.focus(); }
				else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
			}
		});
		var cols0 = innerWidth < 640 ? 2 : 3, rt;
		addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { var c = innerWidth < 640 ? 2 : 3; if (c !== cols0) { cols0 = c; renderFloat(); } }, 200); });
	})();

	/* ---------------------------------------------------------------- */
	/* CORNER CONTROLS — back / next step through the sections            */
	/* ---------------------------------------------------------------- */
	var corner = document.querySelector('.corner');
	function sections() { return [].slice.call(document.querySelectorAll('.sec')).filter(function (s) { return !s.classList.contains('sec--next'); }); }
	function current() {
		var list = sections(), mid = innerHeight / 2, best = list[0];
		list.forEach(function (s) { var r = s.getBoundingClientRect(); if (r.top <= mid && r.bottom > mid) { best = s; } });
		return best;
	}
	function go(step) {
		var list = sections(), i = list.indexOf(current()) + step;
		if (i < 0 || i >= list.length) { return; }
		var t = list[i], r = t.getBoundingClientRect();
		/* a tall scrubbed section is entered at its top going down and at its end coming up */
		var y = scrollY + r.top + (step < 0 && t.classList.contains('scrub') ? r.height - innerHeight : 0);
		scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' });
	}
	function syncCorner() {
		var list = sections(), i = list.indexOf(current());
		corner.classList.toggle('has-prev', i > 0);
		corner.classList.toggle('at-end', i >= list.length - 1);
		corner.classList.toggle('is-dark', list[i].classList.contains('is-light'));
	}
	document.querySelector('[data-action="prev"]').addEventListener('click', function () { go(-1); });
	document.querySelector('[data-action="next"]').addEventListener('click', function () { go(1); });
	addEventListener('scroll', syncCorner, { passive: true }); syncCorner();

	/* ---------------------------------------------------------------- */
	/* SECTION 5 OPTIONS — doors (default) or corners; ?s5= or the switch  */
	/* only one block is visible (hidden also drops it from the a11y tree) */
	/* ---------------------------------------------------------------- */
	var doorsEl = document.querySelector('.gospels:not(.gospels--corners)'), cornersEl = document.querySelector('.gospels--corners');
	function setS5(mode) {
		mode = mode === 'corners' ? 'corners' : 'doors';
		document.documentElement.dataset.s5 = mode;
		if (doorsEl) { doorsEl.hidden = mode !== 'doors'; }
		if (cornersEl) { cornersEl.hidden = mode !== 'corners'; }
		document.querySelectorAll('[data-action="s5"]').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.s5 === mode ? 'true' : 'false'); });
		var u = new URL(location.href); /* the URL names the option only once it has been chosen */
		if (mode === 'corners' || u.searchParams.has('s5')) { u.searchParams.set('s5', mode); history.replaceState(null, '', u); }
	}
	document.querySelectorAll('[data-action="s5"]').forEach(function (b) { b.addEventListener('click', function () { setS5(b.dataset.s5); }); });
	/* a corner choice sets the Gospel and moves on; no door animation */
	document.querySelectorAll('.gospel--corner').forEach(function (b) {
		b.addEventListener('click', function () {
			setGospel(b.dataset.gospel);
			document.getElementById('s6').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
		});
	});
	setS5(new URLSearchParams(location.search).get('s5'));

	/* ---------------------------------------------------------------- */
	/* MUSIC — the founder's YouTube picks, hidden player, user-started     */
	/* ---------------------------------------------------------------- */
	/* the set comes from ?music= (syriac | catholic | orthodox | protestant), default syriac */
	var SETS = TC_DATA.musicSets;
	var setKey = new URLSearchParams(location.search).get('music');
	if (!SETS[setKey]) { setKey = 'syriac'; }
	var loadedKey = setKey;
	function tracks() { return SETS[setKey].ids; }
	var player = null, ready = false, wanted = false;
	var btn = document.querySelector('[data-action="sound"]');

	function label(on) {
		btn.setAttribute('aria-pressed', on ? 'true' : 'false');
		btn.setAttribute('aria-label', on ? 'Mute music' : 'Play music');
	}
	function loadApi() {
		if (window.YT && window.YT.Player) { return make(); }
		var s = document.createElement('script'); s.src = 'https://www.youtube.com/iframe_api';
		document.head.appendChild(s);
		window.onYouTubeIframeAPIReady = make;
	}
	function make() {
		player = new YT.Player('yt', {
			videoId: tracks()[0],
			playerVars: { playlist: (tracks().length > 1 ? tracks().slice(1) : tracks()).join(','), loop: 1, controls: 0, disablekb: 1, playsinline: 1, rel: 0 },
			events: {
				onReady: function () { ready = true; if (loadedKey !== setKey) { swap(); } else if (wanted) { player.playVideo(); } },
				onStateChange: function (e) { if (e.data === YT.PlayerState.ENDED) player.nextVideo(); }
			}
		});
	}
	/* switch the playlist; plays only if the listener had already started it */
	function swap() {
		loadedKey = setKey;
		if (wanted) { player.loadPlaylist(tracks()); } else { player.cuePlaylist(tracks()); }
		player.setLoop(true);
	}
	var pick = document.querySelector('[data-action="music"]');
	Object.keys(SETS).forEach(function (k) {
		var o = document.createElement('option'); o.value = k; o.textContent = SETS[k].label; pick.appendChild(o);
	});
	pick.value = setKey;
	pick.addEventListener('change', function () {
		setKey = pick.value;
		var u = new URL(location.href); u.searchParams.set('music', setKey); history.replaceState(null, '', u);
		if (player && ready) { swap(); }
	});
	btn.addEventListener('click', function () {
		wanted = btn.getAttribute('aria-pressed') !== 'true';
		label(wanted);
		if (!player) { return loadApi(); }
		if (!ready) { return; }
		wanted ? player.playVideo() : player.pauseVideo();
	});
})();
