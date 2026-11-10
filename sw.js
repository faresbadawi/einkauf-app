const CACHE = 'unsertisch-v14';
const FILES = ['./', 'index.html', 'css/style.css', 'js/app.js', 'js/store.js', 'js/catalog.js', 'js/i18n.js', 'js/demo.js', 'js/oldlist.js', 'js/config.js', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon.svg', 'js/vendor/qrcode.js'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(k => k.put(e.request, c)); return r; }).catch(() => caches.match(e.request, { ignoreSearch: true })));
});
