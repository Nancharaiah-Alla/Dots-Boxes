const CACHE_NAME = 'dots-boxes-dynamic-v3';

// Install event
self.addEventListener('install', (event) => {
  self.skipWaiting();
  // Pre-cache the start URL to ensure Chrome considers the app "offline capable" immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.add('/');
    })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Fetch event with dynamic caching
self.addEventListener('fetch', (event) => {
  // Only handle http/https requests
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Check if we received a valid response
        if (!response || response.status !== 200) {
          return response;
        }

        // We generally only want to cache same-origin (basic) requests.
        // HOWEVER, for PWA installability with external icons, we should cache the icons too.
        const isExternalIcon = event.request.url.includes('icons8.com');
        
        if (response.type !== 'basic' && !isExternalIcon) {
          return response;
        }

        // Clone the response because it's a stream and can only be consumed once
        const responseToCache = response.clone();

        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseToCache);
          });

        return response;
      })
      .catch(() => {
        // If network fails, try to return from cache
        return caches.match(event.request);
      })
  );
});