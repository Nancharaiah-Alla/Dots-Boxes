const CACHE_NAME = 'mindgrid-v8';
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
      try {
        const response = await fetch('/index.html');
        if (response.ok) {
           const html = await response.text();
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

// Activate: Clean up old caches
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

// Fetch: Cache First strategy
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);

  if (url.pathname.startsWith('/api') || url.hostname.includes('peerjs')) {
     return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'error') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        if (url.pathname === '/privacy.html') {
             return caches.match('/privacy.html');
        }
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});