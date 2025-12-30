const CACHE_NAME = 'mindgrid-v5';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/privacy.html',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Install: Pre-cache core assets and dynamically find JS/CSS bundles
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // 1. Cache known static files
      await cache.addAll(URLS_TO_CACHE);

      // 2. Dynamically identify and cache hashed assets from index.html
      // This ensures the main JS/CSS bundles are cached without a build step injecting filenames.
      try {
        const response = await fetch('/index.html');
        if (response.ok) {
           const html = await response.text();
           // Find standard Vite build assets (/assets/...)
           const assets = html.match(/\/assets\/[^"']+/g) || [];
           const uniqueAssets = [...new Set(assets)];
           if (uniqueAssets.length > 0) {
             await cache.addAll(uniqueAssets);
           }
        }
      } catch (err) {
        console.log('Dynamic asset caching failed', err);
      }
    })
  );
});

// Activate: Clean up old caches and take control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});

// Fetch: Cache First strategy for assets, Network First for data/API
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);

  // Exclude API calls or PeerJS signaling (dynamic data)
  // Assuming API calls might be to external domains or specific paths
  if (url.pathname.startsWith('/api') || url.hostname.includes('peerjs')) {
     return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // 1. Return from cache if available (Cache-First)
      if (cachedResponse) {
        return cachedResponse;
      }

      // 2. Fetch from network
      return fetch(event.request).then((networkResponse) => {
        // Only cache valid responses (basic/cors) and valid status
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'error') {
          return networkResponse;
        }

        // Clone and cache
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // 3. Offline fallback for navigation
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});