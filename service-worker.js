const CACHE_NAME = 'sarpras-gkpi-runtime';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || !req.url.startsWith('http')) return;
  if (req.url.includes('script.google.com')) return;
  event.respondWith(
    (async () => {
      try {
        const networkRes = await fetch(req);
        if (networkRes && networkRes.status === 200) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(req, networkRes.clone());
        }
        return networkRes;
      } catch (err) {
        const cached = await caches.match(req);
        if (cached) return cached;
        return new Response('Offline', { status: 503 });
      }
    })()
  );
});