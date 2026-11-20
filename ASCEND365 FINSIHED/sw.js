/* ASCEND 365 service worker — offline app shell. Bump VERSION when files change. */
const VERSION = 'ascend365-v1.4.0';
const FILES = [
  './', './index.html', './manifest.webmanifest', './css/app.css',
  './js/util.js', './js/data.js', './js/data_social.js', './js/store.js', './js/views_core.js', './js/views_roadmap.js',
  './js/views_fitness.js', './js/views_life.js', './js/views_social.js', './js/views_more.js', './js/app.js',
  './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'
];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
// network-first for app files so updates arrive, cache fallback when offline
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request).then((r) => { const copy = r.clone(); caches.open(VERSION).then((c) => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match('./index.html'))));
});
