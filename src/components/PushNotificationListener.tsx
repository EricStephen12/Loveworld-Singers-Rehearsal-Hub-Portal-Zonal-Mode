'use client'

import { useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useZone } from '@/hooks/useZone'
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase-setup'

export default function PushNotificationListener() {
  const { user, profile } = useAuth()
  const { currentZone } = useZone()
  const lastNotifTime = useRef<number>(Date.now())
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null)

  // Request permission and get service worker
  useEffect(() => {
    if (!user) return

    const init = async () => {
      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission()
      }

      // Get service worker registration
      if ('serviceWorker' in navigator) {
        registrationRef.current = await navigator.serviceWorker.ready
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
          icon: '/logo.png',
          badge: '/logo.png',
          tag,
          data: { url },
          requireInteraction: false,
        })
      }
    } catch (e) {
      console.log('Notification error:', e)
    }
  }

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
    })
    return () => unsubscribe()
  }, [currentZone?.id])

  // Listen for new chat messages
  useEffect(() => {
    const userId = user?.uid || profile?.id
    if (!userId) return
    
    const chatsRef = collection(db, 'chats_v2')
    const q = query(chatsRef, where('participantIds', 'array-contains', userId), orderBy('lastMessageAt', 'desc'), limit(5))
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'modified') {
          const chat = change.doc.data()
          const lastMessageAt = chat.lastMessageAt?.toDate?.()?.getTime() || 0
          const lastSenderId = chat.lastMessage?.senderId
          
          // Only notify if message is from someone else and is recent
          if (lastSenderId !== userId && lastMessageAt > lastNotifTime.current) {
            const senderName = chat.participantDetails?.[lastSenderId]?.userName || 'Someone'
            const isGroup = chat.type === 'group'
            const chatName = isGroup ? chat.name : senderName
            let preview = chat.lastMessage?.text || ''
            if (chat.lastMessage?.attachment) {
              preview = chat.lastMessage.attachment.type === 'image' ? '📷 Photo' : '📎 Document'
            }
            
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
    })
    return () => unsubscribe()
  }, [user?.uid, profile?.id])

  return null
}
