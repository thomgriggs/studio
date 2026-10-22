/* ====================================================================== */
/* II Commandments — Concept 02                                             */
/* one long page; sections are full-height; verse text comes from verses.js */
/* ====================================================================== */
(function () {
	'use strict';

	/* ---------------------------------------------------------------- */
	/* VERSES                                                             */
	/* ---------------------------------------------------------------- */
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
	requestAnimationFrame(function () { requestAnimationFrame(function () { document.querySelectorAll('.verse--open').forEach(function (h) { h.classList.add('is-in'); }); }); });

	/* ---------------------------------------------------------------- */
	/* BIBLE PICKER — bundled versions only; choice persists in tc-bible  */
	/* ---------------------------------------------------------------- */
	document.querySelectorAll('[data-action="bible"]').forEach(function (sel) {
		TC_DATA.versions.filter(function (v) { return v.source === 'bundled'; }).forEach(function (v) {
			var o = document.createElement('option'); o.value = v.id; o.textContent = v.label || v.name || v.id; sel.appendChild(o);
		});
		sel.value = version();
		sel.addEventListener('change', function () {
			localStorage.setItem('tc-bible', sel.value);
			var u = new URL(location.href); u.searchParams.delete('bible'); history.replaceState(null, '', u); /* the saved choice now wins */
			document.querySelectorAll('.reveal.is-in').forEach(function (el) { el.classList.remove('is-in'); });
			renderAll();
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
		document.querySelectorAll('.scrub').forEach(function (sec) {
			var r = sec.getBoundingClientRect(), track = r.height - innerHeight;
			var p = reduced ? 1 : Math.min(1, Math.max(0, -r.top / track));
			sec.style.setProperty('--p', p);
			sec.style.setProperty('--p1', phase(p, 0.00, 0.32)); /* left tablet in */
			sec.style.setProperty('--p2', phase(p, 0.18, 0.50)); /* right tablet in */
			sec.style.setProperty('--p3', phase(p, 0.50, 0.64)); /* inscriptions */
			sec.style.setProperty('--p4', phase(p, 0.85, 1.00)); /* assembled logo recedes toward section 3 */
			var letters = sec.querySelectorAll('.wordmark .l'), on = Math.round(phase(p, 0.62, 0.84) * letters.length);
			letters.forEach(function (l, i) { l.classList.toggle('is-on', i < on); });
		});
	}
	addEventListener('scroll', scrub, { passive: true });
	addEventListener('resize', scrub);
	scrub();

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
