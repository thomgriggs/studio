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

	/* opening line only: the verse up to data-split, trailing punctuation dropped */
	function renderOpen(h) {
		var t = text(h.dataset.ref), sep = h.dataset.split || ',', i = t.indexOf(sep);
		words(h, (i < 0 ? t : t.slice(0, i)).replace(/[\s,.;:]+$/, ''));
	}
	/* full verse; the first "two" is emphasised (CL: "...these Two Commandments") */
	function renderVerse(h) {
		words(h, text(h.dataset.ref));
		var w = [].slice.call(h.querySelectorAll('.w')).filter(function (s) { return /^two$/i.test(s.textContent.replace(/[^\w]/g, '')); })[0];
		if (w) { w.classList.add('emph'); }
	}
	function renderAll() {
		document.querySelectorAll('.verse--open').forEach(renderOpen);
		document.querySelectorAll('.verse--law').forEach(renderVerse);
		document.querySelectorAll('[data-words]').forEach(function (el) { if (!el.dataset.ref) { words(el, el.dataset.copy || (el.dataset.copy = el.textContent)); } });
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
		if (pin) { pin.classList.add('is-loaded'); }
		setTimeout(function () {
			document.querySelectorAll('.verse--open').forEach(function (h) {
				h.classList.add('is-in');
				var n = h.querySelectorAll('.w').length;
				setTimeout(function () { h.classList.add('is-lit'); }, reduced ? 0 : n * 220 + 900);
			});
		}, reduced ? 0 : 500);
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
			para.appendChild(n); para.appendChild(document.createTextNode(v.text + ' '));
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
	document.querySelectorAll('.gospels .gospel').forEach(function (b) { b.addEventListener('click', function () { enter(b); }); });
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
			if (!sec.classList.contains('scrub')) { return; }
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
	/* MUSIC — the founder's YouTube picks, hidden player, user-started     */
	/* ---------------------------------------------------------------- */
	var TRACKS = ['uyoXMs8AZcg', '4vdk1jo7Tw8', '5e9rGmiCxJU'];
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
			videoId: TRACKS[0],
			playerVars: { playlist: TRACKS.slice(1).join(','), loop: 1, controls: 0, disablekb: 1, playsinline: 1, rel: 0 },
			events: {
				onReady: function () { ready = true; if (wanted) player.playVideo(); },
				onStateChange: function (e) { if (e.data === YT.PlayerState.ENDED) player.nextVideo(); }
			}
		});
	}
	btn.addEventListener('click', function () {
		wanted = btn.getAttribute('aria-pressed') !== 'true';
		label(wanted);
		if (!player) { return loadApi(); }
		if (!ready) { return; }
		wanted ? player.playVideo() : player.pauseVideo();
	});
})();
