/* The app moved to app/. Phones that installed the old worker at this scope   */
/* get this one on their next update check: it clears the old caches and        */
/* unregisters itself, so the landing page is never served from a stale cache.  */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
	event.waitUntil(caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))).then(() => self.registration.unregister()).then(() => self.clients.matchAll({ type:"window" })).then((clients) => clients.forEach((c) => c.navigate(c.url))));
});
