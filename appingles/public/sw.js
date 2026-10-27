/* Guarda o app no aparelho para abrir rápido e funcionar sem internet. */
const CACHE = "lue-dbbaeb9577";
const SHELL = ["ai.js", "content.js", "core.js", "duo.js", "gen.js", "./", "lesson.js", "levels.js", "library.js", "manifest.webmanifest", "mascots.js", "modules-a.js", "modules-b.js", "modules-c.js", "platform.js", "privacy.html", "rooms.js", "social.js", "views.js", "vendor/supabase.js", "icons/apple-touch-icon.png", "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  if (e.request.mode === "navigate") {
    e.respondWith(fetch(e.request).then((r) => { const c = r.clone(); caches.open(CACHE).then((x) => x.put("./", c)); return r; }).catch(() => caches.match("./")));
    return;
  }
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request)));
});
