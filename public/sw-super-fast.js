// SUPER FAST Service Worker - INSTANT PWA Loading
const CACHE_VERSION = 'super-fast-v1.0.0'
const CACHE_NAMES = {
  STATIC: 'static-super-fast',
  API: 'api-super-fast',
  PAGES: 'pages-super-fast'
}

// Cache EVERYTHING aggressively for instant loading
const CACHE_PATTERNS = [
  // All pages
  /^\/$/,
  /^\/home/,
  /^\/pages\/rehearsals/,
  /^\/pages\/profile/,
  /^\/pages\/praise-night/,
  /^\/admin/,
  /^\/auth/,
  
  // All API calls
  /^\/api\//,
  
  // All static assets
  /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|webp)$/,
  
  // Supabase calls
  /supabase\.co/,
  /supabase\.in/
]

// Critical resources for instant loading
const CRITICAL_RESOURCES = [
  '/',
  '/home',
  '/pages/rehearsals',
  '/pages/profile',
  '/pages/praise-night',
  '/logo.png',
  '/lmm.png',
  '/manifest.json'
]

// Install - Cache everything immediately
self.addEventListener('install', (event) => {
  console.log('🚀 SUPER FAST SW installing...')
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(CACHE_NAMES.STATIC).then(cache => {
        return cache.addAll(CRITICAL_RESOURCES.filter(url =>
          url.endsWith('.png') || url.endsWith('.json')
        ))
      }),
      // Cache pages
      caches.open(CACHE_NAMES.PAGES).then(cache => {
        return cache.addAll(CRITICAL_RESOURCES.filter(url =>
          !url.endsWith('.png') && !url.endsWith('.json')
        ))
      }),
      // Open API cache
      caches.open(CACHE_NAMES.API)
    ]).then(() => {
      console.log('🚀 SUPER FAST SW installed - Everything cached!')
      return self.skipWaiting()
    })
  )
})

// Activate - Take control immediately
self.addEventListener('activate', (event) => {
  console.log('🚀 SUPER FAST SW activated!')
  event.waitUntil(
    Promise.all([
      // Clean old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (!Object.values(CACHE_NAMES).includes(cacheName)) {
              console.log('🗑️ Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      }),
      // Take control immediately
      self.clients.claim()
    ])
  )
})

// Fetch - Ultra-fast caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') return

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) return

  event.respondWith(
    (async () => {
      // Check if this should be cached
      const shouldCache = CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))
      
      if (!shouldCache) {
        return fetch(request)
      }

      try {
        // Try cache first for instant loading
        const cachedResponse = await caches.match(request)
        if (cachedResponse) {
          console.log('⚡ Cache HIT:', url.pathname)
          return cachedResponse
        }

        // If not in cache, fetch and cache
        console.log('🌐 Cache MISS, fetching:', url.pathname)
        const response = await fetch(request)
        
        // Only cache successful responses
        if (response.status === 200) {
          const cacheToUse = url.pathname.startsWith('/api/') ? CACHE_NAMES.API : 
                           url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|webp)$/) ? CACHE_NAMES.STATIC : 
                           CACHE_NAMES.PAGES

          const cache = await caches.open(cacheToUse)
          cache.put(request, response.clone())
          console.log('💾 Cached:', url.pathname)
        }

        return response
      } catch (error) {
        console.error('Fetch error:', error)
        
        // Try to return cached version even if stale
        const staleResponse = await caches.match(request)
        if (staleResponse) {
          console.log('🔄 Using stale cache:', url.pathname)
          return staleResponse
        }
        
        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
          const offlineResponse = await caches.match('/')
          if (offlineResponse) {
            return offlineResponse
          }
        }
        
        throw error
      }
    })()
  )
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync:', event.tag)
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle offline actions here
      Promise.resolve()
    )
  }
})

// Push notifications
self.addEventListener('push', (event) => {
  console.log('📱 Push notification received')
  
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/logo.png',
    badge: '/logo.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  }

  event.waitUntil(
    self.registration.showNotification('LoveWorld Singers', options)
  )
})

console.log('🚀 SUPER FAST Service Worker loaded!')

