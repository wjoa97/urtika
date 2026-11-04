// Production-grade Service Worker for Urtika PWA
// Provides robust offline caching for application assets, fonts, icons, and SPA navigation
const CACHE_NAME = 'urtika-cache-v2';

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './logo.svg',
  './favicon.png',
  './icon-192.png',
  './icon-512.png',
];

// Install: Cache shell assets immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: Clear legacy caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Stale-While-Revalidate & Cache-First for static assets
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Skip non-GET and external API / firestore requests (Firebase handles its own offline cache)
  if (
    request.method !== 'GET' ||
    request.url.includes('firestore.googleapis.com') ||
    request.url.includes('identitytoolkit.googleapis.com') ||
    request.url.includes('airquality.googleapis.com')
  ) {
    return;
  }

  // Handle SPA navigation requests (return cached index.html if offline)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        return (await cache.match('./index.html')) || (await cache.match('/index.html'));
      })
    );
    return;
  }

  // Static assets (scripts, css, images, fonts): Cache-first with network fallback & background update
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch fresh copy in background to keep cache up to date
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      // If not in cache, fetch from network and cache it
      return fetch(request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });
        return networkResponse;
      }).catch(async () => {
        // Fallback for image requests
        if (request.destination === 'image') {
          const cache = await caches.open(CACHE_NAME);
          return cache.match('./favicon.png');
        }
      });
    })
  );
});
