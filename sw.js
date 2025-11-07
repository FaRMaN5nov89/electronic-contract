const CACHE_NAME = 'contract-calculator-v5.0.0';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './browserconfig.xml',
  './icon-72.png',
  './icon-96.png',
  './icon-120.png',
  './icon-128.png',
  './icon-144.png',
  './icon-152.png',
  './icon-180.png',
  './icon-192.png',
  './icon-384.png',
  './icon-512.png'
];

// Install event - cache all files
self.addEventListener('install', event => {
  console.log('🔄 Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('✅ Service Worker: Cache opened');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ Service Worker: All files cached');
      })
      .catch(err => {
        console.error('❌ Service Worker: Cache failed:', err);
      })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
  console.log('🔄 Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker: Activated');
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // Clone the request
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(response => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone the response
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        });
      })
      .catch(() => {
        // Return offline page if available
        return caches.match('./index.html');
      })
  );
});

// Handle messages from the client
self.addEventListener('message', event => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

// Log when service worker is ready
console.log('✅ Service Worker: Loaded and ready');
