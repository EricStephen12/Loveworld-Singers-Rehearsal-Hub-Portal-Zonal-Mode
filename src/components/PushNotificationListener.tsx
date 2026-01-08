'use client'

import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useZone } from '@/hooks/useZone'
import { collection, query, where, orderBy, limit, onSnapshot, doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase-setup'

// Store FCM token in Firestore for server-side push
async function savePushToken(userId: string, token: string) {
  try {
    await setDoc(doc(db, 'push_tokens', userId), {
      token,
      platform: 'web',
      updatedAt: new Date(),
      userId
    }, { merge: true })
    console.log('[Push] Token saved to Firestore')
  } catch (e) {
    console.error('[Push] Error saving token:', e)
  }
}

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
      // Check current permission
      if ('Notification' in window) {
        setPermissionStatus(Notification.permission)
        
        // Request permission if not decided
        if (Notification.permission === 'default') {
          const result = await Notification.requestPermission()
          setPermissionStatus(result)
        }
      }

      // Get service worker registration
      if ('serviceWorker' in navigator) {
        try {
          registrationRef.current = await navigator.serviceWorker.ready
          console.log('[Push] Service worker ready')
          
          // Try to get push subscription for native shell communication
          if (registrationRef.current.pushManager) {
            const subscription = await registrationRef.current.pushManager.getSubscription()
            if (subscription) {
              console.log('[Push] Existing subscription found')
              // Save endpoint for server-side push (if you set up FCM later)
            }
          }
        } catch (e) {
          console.log('[Push] Service worker error:', e)
        }
      }
    }
    init()
  }, [user])

  // Show browser notification
  const showNotification = async (title: string, body: string, tag: string, url?: string) => {
    if (Notification.permission !== 'granted') return
    if (document.visibilityState === 'visible') return // Don't show if app is focused
    
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
        console.log('[Push] Notification shown:', title)
      }
    } catch (e) {
      console.log('[Push] Notification error:', e)
    }
  }

  // Expose function for native shell to call
  useEffect(() => {
    // This allows your native shell to trigger notifications
    (window as any).showPushNotification = showNotification;
    
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
          console.log('[Push] Voice call notification handled');
          return;
        }
        
        // Handle regular notifications
        showNotification(title, body, tag, url)
      }
    }
    
    window.addEventListener('message', handleNativeMessage)
    
    return () => {
      window.removeEventListener('message', handleNativeMessage)
      delete (window as any).showPushNotification
    }
  }, [])

  // Listen for new zone messages
  useEffect(() => {
    if (!currentZone?.id) return
    const { isHQGroup } = require('@/config/zones')
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
      console.log('[Push] Zone messages listener error:', error)
    })
    return () => unsubscribe()
  }, [currentZone?.id])

  // Listen for new chat messages - FIXED: use 'participants' not 'participantIds'
  useEffect(() => {
    const userId = user?.uid || profile?.id
    if (!userId) return
    
    const chatsRef = collection(db, 'chats_v2')
    // Fixed: use 'participants' field which is what chat-service.ts uses
    const q = query(
      chatsRef, 
      where('participants', 'array-contains', userId),
      limit(20)
    )
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'modified') {
          const chat = change.doc.data()
          const lastMessage = chat.lastMessage
          if (!lastMessage) return
          
          // Get timestamp - handle different formats
          let lastMessageAt = 0
          if (lastMessage.timestamp) {
            if (typeof lastMessage.timestamp.toDate === 'function') {
              lastMessageAt = lastMessage.timestamp.toDate().getTime()
            } else if (lastMessage.timestamp.seconds) {
              lastMessageAt = lastMessage.timestamp.seconds * 1000
            }
          }
          
          const lastSenderId = lastMessage.senderId
          
          // Only notify if message is from someone else and is recent
          if (lastSenderId && lastSenderId !== userId && lastSenderId !== 'system' && lastMessageAt > lastNotifTime.current) {
            const senderName = chat.participantDetails?.[lastSenderId]?.name || 'Someone'
            const isGroup = chat.type === 'group'
            const chatName = isGroup ? chat.name : senderName
            
            let preview = lastMessage.text || ''
            if (preview.startsWith('📷')) preview = '📷 Photo'
            else if (preview.startsWith('📄')) preview = '📄 Document'
            else if (preview.startsWith('📞')) preview = '📞 Call'
            else if (preview.length > 50) preview = preview.substring(0, 50) + '...'
            
            showNotification(
              chatName || 'New Message',
              isGroup ? `${senderName}: ${preview}` : preview,
              `chat-${change.doc.id}`,
              `/pages/groups?chat=${change.doc.id}`
            )
            lastNotifTime.current = Date.now()
          }
        }
      })
    }, (error) => {
      console.log('[Push] Chat listener error:', error)
    })
    return () => unsubscribe()
  }, [user?.uid, profile?.id])

  return null
}
