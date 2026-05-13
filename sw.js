// Firesite Service Worker v2
// Network-first with cache fallback — works offline after first load
const CACHE = 'firesite-v2';
const PRECACHE = ['/'];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(c) { return c.addAll(PRECACHE); })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  if (!e.request.url.startsWith('http')) return;
  e.respondWith(
    fetch(e.request).then(function(r) {
      if (r.ok) {
        var clone = r.clone();
        caches.open(CACHE).then(function(c) { c.put(e.request, clone); });
      }
      return r;
    }).catch(function() {
      return caches.match(e.request).then(function(cached) {
        return cached || new Response(
          'Firesite is offline. Open the app when connected to cache it for offline use.',
          { status: 503, headers: { 'Content-Type': 'text/plain' } }
        );
      });
    })
  );
});
