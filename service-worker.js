const CACHE_NAME = 'gkpi-depok-v1'; // Naikkan tiap update (v2, v3, dst)
const CORE_ASSETS = [
  './',
  './dashboard.html',
  './manifest.json',
  './assets/logo_gkpi.png',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/apple-touch-icon.png'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(CORE_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  // Network-first: selalu coba ambil versi terbaru
  event.respondWith(
    fetch(event.request)
      .then(function(res) {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          // hanya cache GET request
          if (event.request.method === 'GET') cache.put(event.request, resClone);
        });
        return res;
      })
      .catch(function() {
        return caches.match(event.request);
      })
  );
});
