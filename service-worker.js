/**
 * GKPI Depok Dashboard - Self-Updating Service Worker
 * 
 * STRATEGI: Network-First + Stale-While-Revalidate
 * - Tidak perlu naikkan versi setiap update file
 * - Selalu coba ambil versi terbaru dari server dulu
 * - Cache hanya dipakai sebagai fallback saat offline
 * - Auto-cleanup cache lama
 */

const STATIC_CACHE = 'gkpi-static-v1';
const RUNTIME_CACHE = 'gkpi-runtime';

// Asset statis (jarang berubah) - di-cache saat install
const STATIC_ASSETS = [
  './manifest.json',
  './assets/logo_gkpi.png',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/apple-touch-icon.png'
];

// Maximum cache size untuk runtime cache (HTML, JS, CSS)
const MAX_RUNTIME_ITEMS = 50;

// ===== INSTALL =====
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(function(cache) {
        return cache.addAll(STATIC_ASSETS).catch(function(err) {
          console.warn('Some static assets failed to cache:', err);
        });
      })
      .then(function() {
        // Langsung aktifkan SW baru tanpa nunggu tab lama tutup
        return self.skipWaiting();
      })
  );
});

// ===== ACTIVATE =====
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.map(function(key) {
          // Hapus cache lama yang bukan static atau runtime saat ini
          if (key !== STATIC_CACHE && key !== RUNTIME_CACHE) {
            return caches.delete(key);
          }
        })
      );
    }).then(function() {
      // Ambil alih semua tab yang sudah terbuka
      return self.clients.claim();
    })
  );
});

// ===== FETCH =====
self.addEventListener('fetch', function(event) {
  const request = event.request;
  
  // Hanya handle GET request
  if (request.method !== 'GET') return;
  
  // Skip request ke domain lain (CDN external biarkan browser handle)
  const url = new URL(request.url);
  if (url.origin !== location.origin) {
    // Untuk CDN: cache-first (jarang berubah, hemat data)
    event.respondWith(cacheFirst(request));
    return;
  }
  
  // Cek apakah ini static asset
  const isStaticAsset = STATIC_ASSETS.some(function(asset) {
    return url.pathname.endsWith(asset.replace('./', ''));
  });
  
  if (isStaticAsset) {
    // Static asset: cache-first
    event.respondWith(cacheFirst(request));
  } else {
    // HTML/JS/CSS/data: NETWORK-FIRST (selalu coba ambil yang terbaru)
    event.respondWith(networkFirst(request));
  }
});

// ===== STRATEGI: Network-First =====
// Coba network dulu, kalau gagal baru pakai cache
// INI YANG BIKIN GA PERLU NAIKKAN VERSI - selalu ambil file terbaru
function networkFirst(request) {
  return fetch(request)
    .then(function(response) {
      // Sukses ambil dari network
      if (response && response.status === 200) {
        // Simpan salinan ke runtime cache (untuk offline backup)
        const responseClone = response.clone();
        caches.open(RUNTIME_CACHE).then(function(cache) {
          cache.put(request, responseClone);
          // Bersihin cache kalau kebanyakan
          trimCache(RUNTIME_CACHE, MAX_RUNTIME_ITEMS);
        });
      }
      return response;
    })
    .catch(function() {
      // Network gagal (offline) - pakai cache
      return caches.match(request).then(function(cached) {
        if (cached) return cached;
        // Tidak ada di cache - return halaman offline sederhana untuk HTML
        if (request.headers.get('accept') && request.headers.get('accept').indexOf('text/html') !== -1) {
          return new Response(
            '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Offline</title>' +
            '<style>body{font-family:sans-serif;text-align:center;padding:50px;background:#f4f6f9;}</style>' +
            '</head><body><h2>📡 Sedang Offline</h2>' +
            '<p>Tidak ada koneksi internet. Coba refresh saat sudah online.</p>' +
            '<button onclick="location.reload()">🔄 Coba Lagi</button>' +
            '</body></html>',
            { headers: { 'Content-Type': 'text/html' } }
          );
        }
        return new Response('Offline', { status: 503 });
      });
    });
}

// ===== STRATEGI: Cache-First =====
// Pakai cache dulu, kalau ga ada baru fetch
// Untuk asset yang jarang berubah (logo, icon, library CDN)
function cacheFirst(request) {
  return caches.match(request).then(function(cached) {
    if (cached) {
      // Background update: ambil versi baru diam-diam untuk next visit
      fetch(request).then(function(response) {
        if (response && response.status === 200) {
          caches.open(RUNTIME_CACHE).then(function(cache) {
            cache.put(request, response);
          });
        }
      }).catch(function() {});
      return cached;
    }
    // Tidak ada di cache - fetch dari network
    return fetch(request).then(function(response) {
      if (response && response.status === 200) {
        const responseClone = response.clone();
        caches.open(RUNTIME_CACHE).then(function(cache) {
          cache.put(request, responseClone);
        });
      }
      return response;
    }).catch(function() {
      return new Response('Offline', { status: 503 });
    });
  });
}

// ===== Helper: Trim cache agar tidak bengkak =====
function trimCache(cacheName, maxItems) {
  caches.open(cacheName).then(function(cache) {
    cache.keys().then(function(keys) {
      if (keys.length > maxItems) {
        // Hapus item paling lama (FIFO)
        cache.delete(keys[0]).then(function() {
          trimCache(cacheName, maxItems);
        });
      }
    });
  });
}

// ===== Listen pesan dari client (manual force update) =====
self.addEventListener('message', function(event) {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
  if (event.data && event.data.action === 'clearCache') {
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(k) { return caches.delete(k); }));
    });
  }
});
