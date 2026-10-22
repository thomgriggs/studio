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
	function text(ref) { return passage(ref).verses.map(function (v) { return v.text; }).join(' '); }

	/* wrap each word so it can animate in on its own delay */
	function words(el, str) {
		el.textContent = '';
		str.split(/\s+/).filter(Boolean).forEach(function (w, i) {
			var s = document.createElement('span');
			s.className = 'w'; s.style.setProperty('--i', i); s.textContent = w;
			el.appendChild(s); el.appendChild(document.createTextNode(' '));
		});
	}

	/* two-part reveal: "If you love me," … "keep my commandments." */
	function renderOpen(h) {
		var t = text(h.dataset.ref), sep = h.dataset.split || ',', i = t.indexOf(sep);
		var a = i < 0 ? t : t.slice(0, i + 1), b = i < 0 ? '' : t.slice(i + 1).trim();
		words(h.querySelector('.verse__a'), a);
		words(h.querySelector('.verse__b'), b);
		requestAnimationFrame(function () { requestAnimationFrame(function () { h.classList.add('is-in'); }); });
	}
	document.querySelectorAll('[data-cite]').forEach(function (p) { p.textContent = passage(p.dataset.cite).reference; });
	document.querySelectorAll('.verse--open').forEach(renderOpen);

	/* ---------------------------------------------------------------- */
	/* MUSIC — the founder's YouTube picks, hidden player, user-started     */
	/* ---------------------------------------------------------------- */
	var TRACKS = ['uyoXMs8AZcg', '4vdk1jo7Tw8', '5e9rGmiCxJU'];
	var player = null, ready = false, wanted = false;
	var btn = document.querySelector('[data-action="sound"]');

	function label(on) {
		btn.setAttribute('aria-pressed', on ? 'true' : 'false');
		btn.querySelector('.sound__label').textContent = on ? 'Stop music' : 'Play music';
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
