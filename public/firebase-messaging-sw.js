// Firebase Cloud Messaging Service Worker
// Handles background notifications when web app is not active

import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

// Use the same Firebase configuration as your main app
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // Replace with actual values from your .env
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID", 
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase app
const firebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase Messaging
const messaging = getMessaging(firebaseApp);

// Handle background messages
onBackgroundMessage(messaging, (payload) => {
  console.log('[SW] Background message received:', payload);
  
  const notificationTitle = payload.notification?.title || 'LWSRHP';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/APP ICON/pwa_192_filled.png',
    badge: '/APP ICON/pwa_192_filled.png',
    tag: `bg-${Date.now()}`,
    data: {
      url: payload.data?.url || payload.notification?.data?.url || '/pages/notifications'
    },
    actions: [
      {
        action: 'open',
        title: 'Open App'
      },
      {
        action: 'close', 
        title: 'Close'
      }
    ]
  };

  // Show notification
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.tag);
  
  event.notification.close();
  
  // Handle action buttons
  if (event.action === 'close') {
    return;
  }
  
  // Default action - open the app
  const url = event.notification.data?.url || '/pages/notifications';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus();
            client.navigate(url);
            return;
          }
        }
        // If no window is open, open a new one
        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }
      })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event.notification.tag);
});

console.log('[SW] Firebase Messaging Service Worker loaded');
