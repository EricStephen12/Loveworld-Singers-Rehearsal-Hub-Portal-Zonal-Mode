'use client'

import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useZone } from '@/hooks/useZone'
import { collection, query, where, orderBy, limit, onSnapshot, doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase-setup'
import { webFCMService } from '@/lib/fcm-web'
import { isHQGroup } from '@/config/zones'

// Store FCM token in Firestore for server-side push
// Token saving is now handled by webFCMService via API to Realtime Database

export default function PushNotificationListener() {
  const { user, profile } = useAuth()
  const { currentZone } = useZone()
  const lastNotifTime = useRef<number>(Date.now())
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null)
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default')

  // Request permission and get service worker
  useEffect(() => {
    if (!user) return

    const init = async () => {
      try {
        // Check current permission
        let currentPermission = Notification.permission
        setPermissionStatus(currentPermission)

        // Use the centralized webFCMService to manage tokens
        if (currentPermission === 'granted') {
          // If already granted, ensure we have a fresh token
          await webFCMService.getToken(true)
        } else if (currentPermission === 'default') {
          // If default, we'll show a UI prompt (handled by UI component using permissionStatus)
          // For now, we can try to request it if the user interacts, or just wait for them to click "Enable"
        }

        // Get the Firebase messaging service worker specifically
        if ('serviceWorker' in navigator) {
          // Wait for the firebase-messaging-sw.js to be ready
          const registrations = await navigator.serviceWorker.getRegistrations()
          const fcmSW = registrations.find(r => r.active?.scriptURL.includes('firebase-messaging-sw.js'))

          if (fcmSW) {
            registrationRef.current = fcmSW
          } else {
            // Fallback to any ready service worker
            registrationRef.current = await navigator.serviceWorker.ready
          }
        }
      } catch (e) {
        console.error('[Push] Init error:', e)
      }
    }

    init()

    // Refresh token periodically to prevent expiration
    const interval = setInterval(async () => {
      if (Notification.permission === 'granted') {
        await webFCMService.getToken(true)
      }
    }, 45 * 60 * 1000) // 45 minutes

    return () => clearInterval(interval)
  }, [user])

  // Show browser notification
  const showNotification = async (title: string, body: string, tag: string, url?: string) => {
    if (Notification.permission !== 'granted') {
      return
    }

    // Show notification regardless of visibility state
    // Users want to see notifications even when on the site
    try {
      if (registrationRef.current) {
        await registrationRef.current.showNotification(title, {
          body,
          icon: '/APP ICON/pwa_192_filled.png',
          badge: '/APP ICON/pwa_192_filled.png',
          tag, // Prevents duplicate notifications with same tag
          data: { url },
          requireInteraction: false,
          silent: false
        } as NotificationOptions)
      } else {
        // Fallback to native Notification API if service worker not ready
        new Notification(title, {
          body,
          icon: '/APP ICON/pwa_192_filled.png',
          tag,
          data: { url }
        })
      }
    } catch (e) {
    }
  }

  // Expose function for native shell to call
  useEffect(() => {
    // This allows your native shell to trigger notifications
    (window as any).showPushNotification = showNotification;

    // Listen for messages from service worker (background notification clicks)
    const handleServiceWorkerMessage = (event: MessageEvent) => {

      // Handle incoming call from notification click
      if (event.data?.type === 'INCOMING_CALL') {
        window.dispatchEvent(new CustomEvent('incomingVoiceCall', {
          detail: {
            callId: event.data.callId,
            callerName: event.data.callerName,
            callerAvatar: event.data.callerAvatar,
            action: event.data.action,
            timestamp: Date.now()
          }
        }));
      }

      // Handle decline call from notification
      if (event.data?.type === 'DECLINE_CALL') {
        window.dispatchEvent(new CustomEvent('declineVoiceCall', {
          detail: { callId: event.data.callId }
        }));
      }

      // Handle mark as read from notification action
      if (event.data?.type === 'MARK_AS_READ') {
        window.dispatchEvent(new CustomEvent('markChatRead', {
          detail: {
            chatId: event.data.chatId,
            notificationId: event.data.notificationId
          }
        }));
      }
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    }

    // Listen for messages from native shell
    const handleNativeMessage = (event: MessageEvent) => {
      if (event.data?.type === 'NATIVE_PUSH') {
        const { title, body, tag, url, data } = event.data

        // Handle voice call notifications specially
        if (data?.type === 'VOICE_CALL') {
          // Dispatch custom event for voice call handling
          window.dispatchEvent(new CustomEvent('incomingVoiceCall', {
            detail: {
              callId: data.callId,
              callerName: data.callerName,
              callerAvatar: data.callerAvatar,
              timestamp: Date.now()
            }
          }));
          return;
        }

        // Handle regular notifications
        showNotification(title, body, tag, url)
      }
    }

    window.addEventListener('message', handleNativeMessage)

    return () => {
      window.removeEventListener('message', handleNativeMessage)
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      }
      delete (window as any).showPushNotification
    }
  }, [])

  // Listen for new zone messages
  useEffect(() => {
    if (!currentZone?.id) return
    const isHQ = isHQGroup(currentZone.id)
    const collectionName = isHQ ? 'admin_messages' : 'zone_admin_messages'

    const messagesRef = collection(db, collectionName)
    const q = isHQ
      ? query(messagesRef, orderBy('createdAt', 'desc'), limit(1))
      : query(messagesRef, where('zoneId', '==', currentZone.id), orderBy('createdAt', 'desc'), limit(1))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
          const data = change.doc.data()
          const createdAt = data.createdAt?.toDate?.()?.getTime() || 0
          if (createdAt > lastNotifTime.current) {
            showNotification(
              data.title || 'New Announcement',
              data.message?.substring(0, 100) || '',
              `zone-${change.doc.id}`,
              '/pages/notifications'
            )
            lastNotifTime.current = Date.now()
          }
        }
      })
    }, (error) => {
    })
    return () => unsubscribe()
  }, [currentZone?.id])

  // Listen for new chat messages
  // NOTE: Notification triggering is handled by FCM (fcm-web.ts) to prevent duplicates.
  // This listener is kept if we want to add local UI updates (toasts) in the future, 
  // but for now we disable the duplicate native notification.
  useEffect(() => {
    /* 
    // Disabled to prevent duplicate notifications with FCM
    // FCM is the source of truth for notifications.
    const userId = user?.uid || profile?.id
    if (!userId) return

    const chatsRef = collection(db, 'chats_v2')
    const q = query(
      chatsRef,
      where('participants', 'array-contains', userId),
      limit(1)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
       // ... Snapshot logic ...
    })
    return () => unsubscribe()
    */
  }, [user?.uid, profile?.id])

  // Prompt for permission if not granted
  useEffect(() => {
    if (permissionStatus === 'default' && user) {
      // Small delay to not overwhelm user on login
      const timer = setTimeout(() => {
        // We can use a custom toast or UI here. For now, let's use the browser's native request
        // But only if the user interacts
        const enableNotifs = async () => {
          try {
            await Notification.requestPermission()
            // This will trigger the permission change in the other effect
            setPermissionStatus(Notification.permission)
          } catch (e) {
            console.error('Error requesting permission:', e)
          }
        }

        // Expose to window for UI buttons
        (window as any).enableNotifications = enableNotifs
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [permissionStatus, user])

  return null
}
