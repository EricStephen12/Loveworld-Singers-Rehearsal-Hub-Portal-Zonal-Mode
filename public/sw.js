// public/sw.js - Service Worker for offline caching
// AUTO-UPDATE: Cache names with timestamp for automatic cache busting
const CACHE_VERSION = 'v' + Date.now()
const CACHE_NAME = `loveworld-singers-${CACHE_VERSION}`
const STATIC_CACHE = `loveworld-static-${CACHE_VERSION}`
const DYNAMIC_CACHE = `loveworld-dynamic-${CACHE_VERSION}`

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/home',
  '/pages/groups',

  '/pages/praise-night',
  '/pages/notifications',
  '/profile-completion',
  '/manifest.json'
]

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('🚀 Service Worker installing with version:', CACHE_VERSION)
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Caching static files...')
        return cache.addAll(STATIC_FILES)
      })
      .then(() => {
        console.log('✅ Static files cached successfully')
        // FORCE UPDATE: Skip waiting to activate immediately
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('❌ Failed to cache static files:', error)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker activating with version:', CACHE_VERSION)
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        console.log('🗑️ Found caches:', cacheNames)
        return Promise.all(
          cacheNames.map((cacheName) => {
            // DELETE ALL OLD CACHES - Only keep current version
            if (!cacheName.includes(CACHE_VERSION)) {
              console.log('🗑️ Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('✅ Service Worker activated - old caches cleaned')
        // FORCE UPDATE: Claim all clients immediately
        return self.clients.claim()
      })
  )
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip external requests
  if (url.origin !== location.origin) {
    return
  }

  // NETWORK-FIRST for critical files (always get latest)
  const criticalFiles = ['/sw.js', '/manifest.json', '/_next/static/']
  const isCriticalFile = criticalFiles.some(path => request.url.includes(path))

  if (isCriticalFile) {
    console.log('🌐 Network-first for critical file:', request.url)
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache the fresh response
          if (response.status === 200) {
            const responseToCache = response.clone()
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(request, responseToCache)
              })
          }
          return response
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request)
        })
    )
    return
  }

  // CACHE-FIRST for other files
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          console.log('📦 Serving from cache:', request.url)
          return cachedResponse
        }

        // Otherwise fetch from network
        return fetch(request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }

            // Clone the response
            const responseToCache = response.clone()

            // Cache the response
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                console.log('💾 Caching dynamic response:', request.url)
                cache.put(request, responseToCache)
              })

            return response
          })
          .catch((error) => {
            console.error('❌ Fetch failed:', error)
            
            // Return offline page for navigation requests
            if (request.mode === 'navigate') {
              return caches.match('/offline.html')
            }
            
            throw error
          })
      })
  )
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag)
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle offline actions here
      handleOfflineActions()
    )
  }
})

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Push notification received')
  
    const options = {
    body: event.data ? event.data.text() : 'New notification from LoveWorld Singers',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
      primaryKey: 1
      },
      actions: [
        {
          action: 'explore',
          title: 'View',
        icon: '/icon-192x192.png'
        },
        {
          action: 'close',
          title: 'Close',
        icon: '/icon-192x192.png'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification('LoveWorld Singers', options)
  )
})

// Handle offline actions
async function handleOfflineActions() {
  try {
    // Get offline actions from IndexedDB
    const offlineActions = await getOfflineActions()
    
    for (const action of offlineActions) {
      try {
        await processOfflineAction(action)
        await removeOfflineAction(action.id)
      } catch (error) {
        console.error('Failed to process offline action:', error)
      }
    }
  } catch (error) {
    console.error('Failed to handle offline actions:', error)
  }
}

// Get offline actions from IndexedDB
async function getOfflineActions() {
  // This would integrate with your IndexedDB setup
  return []
}

// Process individual offline action
async function processOfflineAction(action) {
  // Process the action based on its type
  console.log('Processing offline action:', action)
}

// Remove processed offline action
async function removeOfflineAction(actionId) {
  // Remove from IndexedDB
  console.log('Removing offline action:', actionId)
}