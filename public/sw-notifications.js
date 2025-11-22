// Service Worker for Push Notifications
// Handles background notifications and notification interactions

const CACHE_NAME = 'notifications-cache-v1'
const NOTIFICATION_CACHE = 'notification-cache-v1'

// Install event
self.addEventListener('install', (event) => {
  console.log('Notifications service worker installing...')
  self.skipWaiting()
})

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Notifications service worker activating...')
  event.waitUntil(self.clients.claim())
})

// Handle push events (for future push notification support)
self.addEventListener('push', (event) => {
  console.log('Push event received:', event)

  if (event.data) {
    const data = event.data.json()
    console.log('Push data:', data)

    const options = {
      body: data.body || 'You have a new notification',
      icon: data.icon || '/icon-192x192.png',
      badge: data.badge || '/icon-192x192.png',
      tag: data.tag || 'default',
      data: data.data || {},
      requireInteraction: data.requireInteraction || false,
      silent: data.silent || false,
      vibrate: data.vibrate || [200, 100, 200],
      actions: data.actions || [],
      timestamp: Date.now()
    }

    event.waitUntil(
      self.registration.showNotification(data.title || 'LoveWorld Singers', options)
    )
  }
})

// Handle notification click events
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event)

  event.notification.close()

  const data = event.notification.data || {}
  const action = event.action

  if (action === 'view' && data.url) {
    // Open the app to the specific URL
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus()
            client.navigate(data.url)
            return
          }
        }
        // Open new window if app is not open
        if (clients.openWindow) {
          return clients.openWindow(data.url)
        }
      })
    )
  } else if (action === 'dismiss') {
    // Just close the notification (already done above)
    console.log('Notification dismissed')
  } else {
    // Default click behavior - open the app
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus()
            return
          }
        }
        // Open new window if app is not open
        if (clients.openWindow) {
          return clients.openWindow('/')
        }
      })
    )
  }
})

// Handle notification close events
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event)
  
  // You can track notification dismissal here
  const data = event.notification.data || {}
  if (data.trackDismissal) {
    // Send analytics or update user preferences
    console.log('Notification dismissed by user:', data)
  }
})

// Handle background sync (for future offline notification support)
self.addEventListener('sync', (event) => {
  console.log('Background sync event:', event.tag)
  
  if (event.tag === 'notification-sync') {
    event.waitUntil(
      // Sync pending notifications when back online
      syncPendingNotifications()
    )
  }
})

// Handle message events from the main thread
self.addEventListener('message', (event) => {
  console.log('Message received in service worker:', event.data)

  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data
    event.waitUntil(
      self.registration.showNotification(title, options)
    )
  } else if (event.data && event.data.type === 'CLEAR_NOTIFICATIONS') {
    event.waitUntil(
      self.registration.getNotifications().then((notifications) => {
        notifications.forEach(notification => notification.close())
      })
    )
  }
})

// Helper function to sync pending notifications
async function syncPendingNotifications() {
  try {
    // This would sync any pending notifications when the app comes back online
    console.log('Syncing pending notifications...')
    
    // You could fetch pending notifications from an API here
    // and show them to the user
    
  } catch (error) {
    console.error('Error syncing notifications:', error)
  }
}

// Handle fetch events for notification-related requests
self.addEventListener('fetch', (event) => {
  // Only handle requests for notification-related resources
  if (event.request.url.includes('/api/notifications')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Return cached notification data if offline
        return caches.match(event.request)
      })
    )
  }
})

// Periodic background sync (for future use)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'notification-check') {
    event.waitUntil(
      checkForNewNotifications()
    )
  }
})

// Helper function to check for new notifications
async function checkForNewNotifications() {
  try {
    console.log('Checking for new notifications...')
    
    // This would check for new notifications from your API
    // and show them to the user
    
  } catch (error) {
    console.error('Error checking for notifications:', error)
  }
}

console.log('Notifications service worker loaded')

