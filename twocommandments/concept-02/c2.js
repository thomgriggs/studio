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

	/* opening line only: the verse up to data-split, trailing punctuation dropped */
	function renderOpen(h) {
		var t = text(h.dataset.ref), sep = h.dataset.split || ',', i = t.indexOf(sep);
		words(h, (i < 0 ? t : t.slice(0, i)).replace(/[\s,.;:]+$/, ''));
		requestAnimationFrame(function () { requestAnimationFrame(function () { h.classList.add('is-in'); }); });
	}
	document.querySelectorAll('.verse--open').forEach(renderOpen);

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
