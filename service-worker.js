/**
 * Service Worker Sarpras GKPI v2
 * NETWORK-FIRST strategy - selalu prioritas dari network, cache hanya fallback offline
 */

const CACHE_NAME = 'sarpras-gkpi-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force activate immediately
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Hapus SEMUA cache lama (force fresh)
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  
  // Skip non-GET & non-HTTP
  if (req.method !== 'GET' || !req.url.startsWith('http')) return;
  
  // Skip Apps Script API
  if (req.url.includes('script.google.com')) return;
  
  event.respondWith(
    (async () => {
      try {
        // ALWAYS try network first (no cache bias)
        const networkRes = await fetch(req, { cache: 'no-cache' });
        return networkRes;
      } catch (err) {
        // Network gagal → fallback offline cache (kalau ada)
        const cached = await caches.match(req);
        if (cached) return cached;
        return new Response('Offline', { status: 503 });
      }
    })()
  );
});
