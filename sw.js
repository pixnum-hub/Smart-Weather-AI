const CACHE_NAME = 'smart-weather-ai-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  // Add any CSS/JS files if separate
];

// Install - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate - cleanup old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }))
    )
  );
  self.clients.claim();
});

// Fetch - serve cached assets and dynamic API responses
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Cache API responses dynamically
  if(url.hostname.includes('open-meteo.com') || url.hostname.includes('ipapi.co')){
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        fetch(event.request)
          .then(response => {
            cache.put(event.request, response.clone());
            return response;
          })
          .catch(() => caches.match(event.request))
      )
    );
    return;
  }

  // For app assets
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});