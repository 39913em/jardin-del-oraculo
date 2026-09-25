const CACHE_VERSION = 'jardin-v1';

if (location.protocol === 'http:' || location.protocol === 'https:') {
  self.addEventListener('install', (event) => {
    self.skipWaiting();
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
  });

  self.addEventListener('fetch', (event) => {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
  });
}