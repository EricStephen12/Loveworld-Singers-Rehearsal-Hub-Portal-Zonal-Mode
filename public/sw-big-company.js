// Big Company PWA Strategy - Simple & Fast
// Used by Twitter, Instagram, WhatsApp

const CACHE_NAME = 'lwsrhp-v1'
const STATIC_ASSETS = [
  '/',
  '/auth',
  '/home',
  '/manifest.json',
  '/logo.png'
]

// Install - Cache only essential static assets
self.addEventListener('install', (event) => {
  console.log('📱 Installing service worker...')
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Caching static assets...')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('✅ Static assets cached')
        return self.skipWaiting()
      })
  )
})

// Activate - Clean old caches
self.addEventListener('activate', (event) => {
  console.log('🔄 Activating service worker...')
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== CACHE_NAME)
            .map(cacheName => {
              console.log('🗑️ Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            })
        )
      })
      .then(() => {
        console.log('✅ Service worker activated')
        return self.clients.claim()
      })
  )
})

// Fetch - Simple network-first strategy
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return
  }

  // Skip API calls and dynamic content - let them go to network
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('supabase') ||
      event.request.url.includes('auth')) {
    return
  }

  // For static assets, try cache first, then network
  if (STATIC_ASSETS.some(asset => event.request.url.includes(asset))) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            console.log('📦 Serving from cache:', event.request.url)
            return response
          }
          
          console.log('🌐 Fetching from network:', event.request.url)
          return fetch(event.request)
            .then(response => {
              // Don't cache if not successful
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response
              }
              
              // Cache successful responses
              const responseToCache = response.clone()
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache)
                })
              
              return response
            })
        })
    )
  }
})

// Handle messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

