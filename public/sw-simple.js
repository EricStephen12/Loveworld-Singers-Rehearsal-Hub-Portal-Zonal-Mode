// SIMPLE Service Worker - Reliable loading for all users
const CACHE_VERSION = 'simple-v1.0.0';
const CACHE_NAME = 'lwsrhp-cache-v1';

// Critical resources that must be cached
const CRITICAL_RESOURCES = [
  '/',
  '/auth',
  '/home',
  '/logo.png',
  '/manifest.json'
];

// Install - Cache only essential resources
self.addEventListener('install', (event) => {
  console.log('📱 Simple SW installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('📱 Caching critical resources...');
      return cache.addAll(CRITICAL_RESOURCES).catch(err => {
        console.log('⚠️ Some resources failed to cache:', err);
        // Don't fail the install if some resources can't be cached
        return Promise.resolve();
      });
    }).then(() => {
      console.log('📱 Simple SW installed successfully');
      return self.skipWaiting();
    })
  );
});

// Activate - Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('📱 Simple SW activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('📱 Simple SW activated');
      return self.clients.claim();
    })
  );
});

// Fetch - Simple network-first strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // Skip chrome-extension and other non-http requests
  if (!request.url.startsWith('http')) return;
  
  event.respondWith(
    // Try network first
    fetch(request).then(response => {
      // If successful, cache and return
      if (response.ok) {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(request, responseClone);
        });
        return response;
      }
      throw new Error('Network response not ok');
    }).catch(() => {
      // If network fails, try cache
      return caches.match(request).then(cachedResponse => {
        if (cachedResponse) {
          console.log('📱 Serving from cache:', request.url);
          return cachedResponse;
        }
        
        // If no cache and it's a page request, show offline page
        if (request.mode === 'navigate') {
          return new Response(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>LWSRHP - Loading...</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <meta name="theme-color" content="#8B5CF6">
                <style>
                  body {
                    font-family: system-ui, -apple-system, sans-serif;
                    text-align: center;
                    padding: 50px 20px;
                    background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 50%, #6366F1 100%);
                    color: white;
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-direction: column;
                    margin: 0;
                  }
                  .logo {
                    width: 80px;
                    height: 80px;
                    margin-bottom: 20px;
                    animation: pulse 2s infinite;
                  }
                  h1 { 
                    margin-bottom: 10px; 
                    font-size: 24px;
                    font-weight: 600;
                  }
                  p { 
                    margin-bottom: 30px; 
                    opacity: 0.9;
                    font-size: 16px;
                  }
                  .loading {
                    display: inline-block;
                    width: 20px;
                    height: 20px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-radius: 50%;
                    border-top-color: white;
                    animation: spin 1s ease-in-out infinite;
                  }
                  @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                  }
                  @keyframes spin {
                    to { transform: rotate(360deg); }
                  }
                  button {
                    background: white;
                    color: #8B5CF6;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    margin-top: 20px;
                    transition: transform 0.2s;
                  }
                  button:hover {
                    transform: translateY(-2px);
                  }
                </style>
              </head>
              <body>
                <div class="logo">🎵</div>
                <h1>LWSRHP</h1>
                <p>Loading your rehearsal hub...</p>
                <div class="loading"></div>
                <button onclick="location.reload()">Retry</button>
                <script>
                  // Auto-retry after 3 seconds
                  setTimeout(() => {
                    location.reload();
                  }, 3000);
                </script>
              </body>
            </html>
          `, {
            headers: { 'Content-Type': 'text/html' }
          });
        }
        
        // For other requests, return a basic response
        return new Response('', { status: 200 });
      });
    })
  );
});

// Message handling
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.delete(CACHE_NAME).then(() => {
        console.log('🧹 Cache cleared');
        event.ports[0]?.postMessage({ success: true });
      })
    );
  }
});

console.log('📱 Simple Service Worker loaded');
