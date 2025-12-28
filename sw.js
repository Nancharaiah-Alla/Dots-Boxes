const CACHE_NAME = 'dots-boxes-dynamic-v4';

// Install event
self.addEventListener('install', (event) => {
  self.skipWaiting();
  // Pre-cache core assets
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/icon.svg',
        '/manifest.json'
      ]);
    })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Fetch event
self.addEventListener('fetch', (event) => {
  // Only handle http/https requests
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request).then((response) => {
          // Check if valid
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Cache new requests (runtime caching)
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(() => {
        // Offline fallback if needed, or just let it fail
        return caches.match('/');
      })
  );
});