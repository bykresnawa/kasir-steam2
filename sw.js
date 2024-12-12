const CACHE_NAME = 'steam-wash-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/css/style.css',
  '/assets/js/auth.js',
  '/assets/js/script.js',
  '/assets/js/vehicles.js',
  '/assets/icons/icon-152x152.png',
  // tambahkan semua asset yang perlu di-cache
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
}); 