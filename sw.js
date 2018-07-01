const staticCacheName = 'currency-converter-static';
const allCaches = [
  staticCacheName
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(staticCacheName).then(function(cache) {
      return cache.addAll([
        'https://muthomibrian.github.io/currency-converter/',
        'https://muthomibrian.github.io/currency-converter/js/main.js',
        'https://muthomibrian.github.io/currency-converter/js/idb.js',
        'https://muthomibrian.github.io/currency-converter/css/lux.css',
        'https://muthomibrian.github.io/currency-converter/style.css',
      ]);
    })
  );
});
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName.startsWith('currency-') &&
                   !allCaches.includes(cacheName);
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('message', function(event) {
  if(event.data.skip){
    self.skipWaiting();    
  }
});