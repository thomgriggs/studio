/* Offline shell. Page loads are NETWORK-FIRST so a new build always wins when   */
/* there's signal; the cache is the fallback for the field. Assets are cache-    */
/* first. Bump CACHE_NAME whenever kb.js / kb.css / data.js change.              */
const CACHE_NAME = "kickball-v13";
const ASSETS = ["./", "./index.html", "./kb.css", "./kb.js", "./data.js", "./manifest.webmanifest", "./icons/icon.svg"];

self.addEventListener("install", (event) => {
	event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
	self.skipWaiting();
});

self.addEventListener("activate", (event) => {
	event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))));
	self.clients.claim();
});

self.addEventListener("fetch", (event) => {
	const req = event.request;
	if (req.method !== "GET") return;
	const isPage = req.mode === "navigate" || req.destination === "document";
	const isApp = /\/(kb\.js|kb\.css|data\.js)$/.test(new URL(req.url).pathname);
	if (isPage || isApp) {
		/* network first, refresh the cache, fall back to cache offline */
		event.respondWith(fetch(req).then((res) => { const copy = res.clone(); caches.open(CACHE_NAME).then((c) => c.put(req, copy)); return res; }).catch(() => caches.match(req)));
		return;
	}
	event.respondWith(caches.match(req).then((cached) => cached || fetch(req)));
});
