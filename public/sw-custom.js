// Custom Service Worker for LWSRH Offline Support
const CACHE_NAME = 'lwsrh-cache-v1';
const DATA_CACHE_NAME = 'lwsrh-data-cache-v1';

// Files to cache for offline functionality
const STATIC_CACHE_URLS = [
  '/',
  '/home',
  '/pages/praise-night',
  '/pages/rehearsals',
  '/pages/profile',
  '/manifest.json',
  '/logo.png',
  '/images/home.jpg',
  '/images/DSC_6155_scaled.jpg',
  '/images/DSC_6303_scaled.jpg',
  '/images/DSC_6446_scaled.jpg',
  '/images/DSC_6506_scaled.jpg',
  '/images/DSC_6516_scaled.jpg',
  '/images/DSC_6636_1_scaled.jpg',
  '/images/DSC_6638_scaled.jpg',
  '/images/DSC_6644_scaled.jpg',
  '/images/DSC_6658_1_scaled.jpg',
  '/images/DSC_6676_scaled.jpg',
  '/images/DSC_6676_scaled.jpg',
  '/lmm.png',
  '/splash.jpg'
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static resources...');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('Static resources cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Failed to cache static resources:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - handle requests with smart caching
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/') || url.pathname.includes('data')) {
    event.respondWith(
      caches.open(DATA_CACHE_NAME)
        .then((cache) => {
          return fetch(request)
            .then((response) => {
              // If network request succeeds, cache the response
              if (response.status === 200) {
                cache.put(request, response.clone());
                console.log('Data cached from network:', url.pathname);
              }
              return response;
            })
            .catch(() => {
              // If network fails, try to serve from cache
              console.log('Network failed, serving from cache:', url.pathname);
              return cache.match(request)
                .then((cachedResponse) => {
                  if (cachedResponse) {
                    console.log('Serving cached data:', url.pathname);
                    return cachedResponse;
                  }
                  // If no cache, return a basic response
                  return new Response(
                    JSON.stringify({ 
                      error: 'Offline', 
                      message: 'No cached data available',
                      timestamp: new Date().toISOString()
                    }),
                    {
                      status: 200,
                      headers: { 'Content-Type': 'application/json' }
                    }
                  );
                });
            });
        })
    );
    return;
  }

  // Handle static resources with cache-first strategy
  if (request.destination === 'image' || 
      request.destination === 'font' || 
      url.pathname.endsWith('.css') || 
      url.pathname.endsWith('.js')) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            console.log('Serving cached static resource:', url.pathname);
            return cachedResponse;
          }
          return fetch(request)
            .then((response) => {
              if (response.status === 200) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(request, responseClone);
                    console.log('Static resource cached:', url.pathname);
                  });
              }
              return response;
            });
        })
    );
    return;
  }

  // Handle page requests with network-first strategy
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // If network request succeeds, cache the response
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseClone);
                console.log('Page cached from network:', url.pathname);
              });
          }
          return response;
        })
        .catch(() => {
          // If network fails, try to serve from cache
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                console.log('Serving cached page:', url.pathname);
                return cachedResponse;
              }
              // If no cache, serve the main page
              return caches.match('/');
            });
        })
    );
    return;
  }

  // Default: try network first, then cache
  event.respondWith(
    fetch(request)
      .catch(() => caches.match(request))
  );
});

// Background sync for data updates when online
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Background sync triggered');
    event.waitUntil(
      // Here you can add logic to sync data when connection is restored
      syncData()
    );
  }
});

// Function to sync data when connection is restored
async function syncData() {
  try {
    console.log('Syncing data...');
    // Add your data sync logic here
    // For example, fetch latest songs, update cache, etc.
    
    // Notify all clients that data has been synced
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'DATA_SYNCED',
        timestamp: new Date().toISOString()
      });
    });
    
    console.log('Data sync completed');
  } catch (error) {
    console.error('Data sync failed:', error);
  }
}

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_DATA') {
    // Cache specific data when requested
    const { data, key } = event.data;
    caches.open(DATA_CACHE_NAME)
      .then((cache) => {
        const response = new Response(JSON.stringify(data), {
          headers: { 'Content-Type': 'application/json' }
        });
        cache.put(key, response);
        console.log('Data cached on demand:', key);
      });
  }
});

console.log('LWSRH Service Worker loaded');
