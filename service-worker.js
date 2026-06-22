/**
 * Service Worker Sarpras GKPI - Network First, No Version Needed
 * Strategi: Selalu prioritas fetch dari network, cache hanya fallback offline
 * Tidak perlu bump version manual - update otomatis setiap reload
 */

const CACHE_NAME = 'sarpras-gkpi-runtime';

// Install: langsung aktif tanpa wait
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate: claim semua client + hapus cache lama
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      // Hapus SEMUA cache lama (no version tracking)
      await Promise.all(keys.map(k => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

// Fetch: ALWAYS network first, cache hanya kalau offline
self.addEventListener('fetch', (event) => {
  const req = event.request;
  
  // Skip non-GET & non-HTTP requests
  if (req.method !== 'GET' || !req.url.startsWith('http')) return;
  
  // Skip Apps Script API (jangan di-cache, biar selalu fresh)
  if (req.url.includes('script.google.com')) return;
  
  event.respondWith(
    (async () => {
      try {
        // SELALU coba network dulu, tanpa cache bias
        const networkRes = await fetch(req, { 
          cache: 'no-store',
          credentials: 'omit'
        });
        
        // Simpan ke cache untuk fallback offline
        if (networkRes && networkRes.status === 200) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(req, networkRes.clone()).catch(() => {});
        }
        return networkRes;
        
      } catch (err) {
        // Network gagal → ambil dari cache (offline mode)
        const cached = await caches.match(req);
        if (cached) return cached;
        return new Response('Offline', { status: 503 });
      }
    })()
  );
});