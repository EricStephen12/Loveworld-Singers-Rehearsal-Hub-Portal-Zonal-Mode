'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useZone } from '@/hooks/useZone'
import { collection, query, where, orderBy, limit, onSnapshot, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase-setup'

export function useUnreadNotifications() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [hasNewZoneMessage, setHasNewZoneMessage] = useState(false)
  const [hasNewMedia, setHasNewMedia] = useState(false)
  const [hasNewCalendar, setHasNewCalendar] = useState(false)
  const { user, profile } = useAuth()
  const { currentZone } = useZone()
  const lastZoneMessageTime = useRef<number>(0)
  const lastSeenKey = useRef<string>('')

  useEffect(() => {
    const userId = user?.uid || profile?.id
    if (!userId || !currentZone?.id) {
      setUnreadCount(0)
      setHasNewZoneMessage(false)
      setHasNewMedia(false)
      setHasNewCalendar(false)
      return
    }

    // Get last seen times from localStorage
    const storageKey = `lastSeenNotifications_${userId}`
    const mediaSeenKey = `lastSeenMedia_${userId}`
    const calendarSeenKey = `lastSeenCalendar_${userId}`
    lastSeenKey.current = storageKey
    const lastSeen = parseInt(localStorage.getItem(storageKey) || '0', 10)
    const lastMediaSeen = parseInt(localStorage.getItem(mediaSeenKey) || '0', 10)
    const lastCalendarSeen = parseInt(localStorage.getItem(calendarSeenKey) || '0', 10)
    lastZoneMessageTime.current = lastSeen

    const unsubscribers: (() => void)[] = []
    let chatUnread = 0

    // Listen for unread chat messages
    try {
      const chatsRef = collection(db, 'chats_v2')
      const chatsQuery = query(
        chatsRef,
        where('participants', 'array-contains', userId),
        limit(50)
      )
      
      const chatUnsub = onSnapshot(chatsQuery, (snapshot) => {
        chatUnread = 0
        snapshot.docs.forEach(doc => {
          const chat = doc.data()
          const count = chat.unreadCount?.[userId] || 0
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

    // Check for new media (videos uploaded in last 7 days)
    const checkNewMedia = async () => {
      try {
        const { isHQGroup } = require('@/config/zones')
        const isHQ = isHQGroup(currentZone.id)
        const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        
        const videosRef = collection(db, 'media_videos')
        const videosQuery = query(videosRef, where('forHQ', '==', isHQ), limit(5))
        const snapshot = await getDocs(videosQuery)
        
        let hasNew = false
        snapshot.docs.forEach(doc => {
          const video = doc.data()
          const createdAt = video.createdAt?.toDate?.()?.getTime() || 0
          if (createdAt > lastMediaSeen && createdAt > lastWeek.getTime()) {
            hasNew = true
          }
        })
        setHasNewMedia(hasNew)
      } catch (e) {
        console.log('Media check error:', e)
      }
    }
    checkNewMedia()

    // Check for upcoming calendar events (within next 7 days)
    const checkNewCalendar = async () => {
      try {
        const now = new Date()
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        
        // Check zone_praise_nights for upcoming rehearsals
        const rehearsalsRef = collection(db, 'zone_praise_nights')
        const rehearsalsQuery = query(rehearsalsRef, where('zoneId', '==', currentZone.id), limit(10))
        const snapshot = await getDocs(rehearsalsQuery)
        
        let hasUpcoming = false
        snapshot.docs.forEach(doc => {
          const rehearsal = doc.data()
          const eventDate = new Date(rehearsal.date || rehearsal.eventDate)
          if (!isNaN(eventDate.getTime()) && eventDate >= now && eventDate <= nextWeek) {
            // Check if user hasn't seen this event
            const eventTime = eventDate.getTime()
            if (eventTime > lastCalendarSeen) {
              hasUpcoming = true
            }
          }
        })
        
        // Also check upcoming_events
        const upcomingRef = collection(db, 'upcoming_events')
        const upcomingQuery = query(upcomingRef, where('zoneId', '==', currentZone.id), limit(10))
        const upcomingSnapshot = await getDocs(upcomingQuery)
        
        upcomingSnapshot.docs.forEach(doc => {
          const event = doc.data()
          const eventDate = new Date(event.date || event.eventDate)
          if (!isNaN(eventDate.getTime()) && eventDate >= now && eventDate <= nextWeek) {
            hasUpcoming = true
          }
        })
        
        setHasNewCalendar(hasUpcoming)
      } catch (e) {
        console.log('Calendar check error:', e)
      }
    }
    checkNewCalendar()

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

  // Mark media as seen
  const markMediaSeen = () => {
    const userId = user?.uid || profile?.id
    if (userId) {
      localStorage.setItem(`lastSeenMedia_${userId}`, Date.now().toString())
      setHasNewMedia(false)
    }
  }

  // Mark calendar as seen
  const markCalendarSeen = () => {
    const userId = user?.uid || profile?.id
    if (userId) {
      localStorage.setItem(`lastSeenCalendar_${userId}`, Date.now().toString())
      setHasNewCalendar(false)
    }
  }

  return { 
    unreadCount, 
    hasUnread: unreadCount > 0 || hasNewZoneMessage,
    hasNewZoneMessage,
    hasNewMedia,
    hasNewCalendar,
    markAsSeen,
    markMediaSeen,
    markCalendarSeen
  }
}
