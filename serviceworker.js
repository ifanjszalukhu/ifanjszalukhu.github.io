var CACHE_NAME = 'my-site-cache-v1';
var urlsToCache = [
  '/',
  '/fallback.json',
  '/css/main.css',
  '/js/jquery.min.js',
  '/js/main.js',
  '/images/logo.png'
];

// Install/Pasang ServiceWorker
self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('in install serviceworker... cache openend!');
        return cache.addAll(urlsToCache);
      })
  );
});


// Fetch/menggunakan ServiceWorker
self.addEventListener('fetch', function(event) {

  var request   = event.request
  var url       = new URL(request.url)

  // pisahkan request API dan Internal
  if(url.origin === location.origin) {
    event.respondWith(
      caches.match(request).then(function(response){
        return response || fetch(request)
      })
    );
  } else{
    event.respondWith(
      caches.open('products-cache').then(function(cache){
        return fetch(request).then(function(liveResponse){
          cache.put(request, liveResponse.clone())
          return liveResponse
        }).catch(function(){
          return caches.match(request).then(function(response){
            if(response) return response
            return caches.match('/fallback.json')
          })
        })
      })
    )
  }
});


// Activasi ServiceWorker
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName){
          return cacheName != CACHE_NAME
        }).map(function(cacheName){
          return caches.delete(cacheName)
        })
      );
    })
  );
});
