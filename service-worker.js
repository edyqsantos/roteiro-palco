const CACHE_NAME = 'palco-offline-v36';
const APP_SHELL = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './service-worker.js',
  './icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(
        APP_SHELL.map(async (url) => {
          const request = new Request(url, {
            cache: 'reload',
            credentials: 'include',
          });
          const response = await fetch(request);
          if (!response.ok) throw new Error(`Falha ao guardar ${url}`);
          await cache.put(new URL(url, self.registration.scope).href, response);
        }),
      ),
    ),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() =>
          caches
            .match(new URL('index.html', self.registration.scope).href)
            .then((fallback) => fallback || caches.match(new URL('./', self.registration.scope).href)),
        );
    }),
  );
});
