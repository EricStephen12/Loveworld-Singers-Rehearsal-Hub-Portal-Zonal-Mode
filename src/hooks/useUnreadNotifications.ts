'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useZone } from '@/hooks/useZone'
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase-setup'

export function useUnreadNotifications() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [hasNewZoneMessage, setHasNewZoneMessage] = useState(false)
  const { user, profile } = useAuth()
  const { currentZone } = useZone()
  const lastZoneMessageTime = useRef<number>(0)
  const lastSeenKey = useRef<string>('')

  useEffect(() => {
    const userId = user?.uid || profile?.id
    if (!userId || !currentZone?.id) {
      setUnreadCount(0)
      setHasNewZoneMessage(false)
      return
    }

    // Get last seen time from localStorage
    const storageKey = `lastSeenNotifications_${userId}`
    lastSeenKey.current = storageKey
    const lastSeen = parseInt(localStorage.getItem(storageKey) || '0', 10)
    lastZoneMessageTime.current = lastSeen

    const unsubscribers: (() => void)[] = []
    let chatUnread = 0

    // Listen for unread chat messages
    try {
      const chatsRef = collection(db, 'chats_v2')
      const chatsQuery = query(
        chatsRef,
        where('participantIds', 'array-contains', userId),
        orderBy('lastMessageAt', 'desc'),
        limit(50)
      )
      
      const chatUnsub = onSnapshot(chatsQuery, (snapshot) => {
        chatUnread = 0
        snapshot.docs.forEach(doc => {
          const chat = doc.data()
          const count = chat.unreadCounts?.[userId] || 0
          chatUnread += count
        })
        setUnreadCount(chatUnread)
      }, (err) => console.log('Chat listener error:', err))
      
      unsubscribers.push(chatUnsub)
    } catch (e) {
      console.log('Chat query error:', e)
    }

    // Listen for zone/admin messages
    try {
      const { isHQGroup } = require('@/config/zones')
      const isHQ = isHQGroup(currentZone.id)
      const collectionName = isHQ ? 'admin_messages' : 'zone_admin_messages'
      
      const messagesRef = collection(db, collectionName)
      const messagesQuery = isHQ 
        ? query(messagesRef, orderBy('createdAt', 'desc'), limit(1))
        : query(messagesRef, where('zoneId', '==', currentZone.id), orderBy('createdAt', 'desc'), limit(1))
      
      const zoneUnsub = onSnapshot(messagesQuery, (snapshot) => {
        snapshot.docChanges().forEach(change => {
          if (change.type === 'added' || change.type === 'modified') {
            const data = change.doc.data()
            const createdAt = data.createdAt?.toDate?.()?.getTime() || 0
            
            // Check if this is a new message since last seen
            if (createdAt > lastZoneMessageTime.current) {
              setHasNewZoneMessage(true)
            }
          }
        })
      }, (err) => console.log('Zone listener error:', err))
      
      unsubscribers.push(zoneUnsub)
    } catch (e) {
      console.log('Zone query error:', e)
    }

    return () => {
      unsubscribers.forEach(unsub => unsub())
    }
  }, [user?.uid, profile?.id, currentZone?.id])

  // Function to mark notifications as seen
  const markAsSeen = () => {
    if (lastSeenKey.current) {
      localStorage.setItem(lastSeenKey.current, Date.now().toString())
      lastZoneMessageTime.current = Date.now()
      setHasNewZoneMessage(false)
    }
  }

  return { 
    unreadCount, 
    hasUnread: unreadCount > 0 || hasNewZoneMessage,
    hasNewZoneMessage,
    markAsSeen
  }
}
