'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useZone } from '@/hooks/useZone'
import { collection, query, where, orderBy, limit, onSnapshot, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase-setup'
import { BirthdayService } from '@/app/pages/calendar/_lib/birthday-service'

export function useUnreadNotifications() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [hasNewZoneMessage, setHasNewZoneMessage] = useState(false)
  const [hasNewMedia, setHasNewMedia] = useState(false)
  const [hasNewCalendar, setHasNewCalendar] = useState(false)
  const [hasUpcomingBirthday, setHasUpcomingBirthday] = useState(false)
  const [hasUnseenBirthday, setHasUnseenBirthday] = useState(false)
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
      setHasUpcomingBirthday(false)
      return
    }

    // Get last seen times from localStorage
    const storageKey = `lastSeenNotifications_${userId}`
    const mediaSeenKey = `lastSeenMedia_${userId}`
    const calendarSeenKey = `lastSeenCalendar_${userId}`
    const birthdaySeenKey = `lastSeenBirthday_${userId}`
    lastSeenKey.current = storageKey
    const lastSeen = parseInt(localStorage.getItem(storageKey) || '0', 10)
    const lastMediaSeen = parseInt(localStorage.getItem(mediaSeenKey) || '0', 10)
    const lastCalendarSeen = parseInt(localStorage.getItem(calendarSeenKey) || '0', 10)
    const lastBirthdaySeen = localStorage.getItem(birthdaySeenKey) || ''
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
            
                        if (createdAt > lastZoneMessageTime.current) {
              setHasNewZoneMessage(true)
            }
          }
        })
      }, (err) => console.log('Zone listener error:', err))
      
      unsubscribers.push(zoneUnsub)
    } catch (e) {
    }

    // Check for new media (videos uploaded in last 7 days)
    const checkNewMedia = async () => {
      try {
        const { isHQGroup } = require('@/config/zones')
        const isHQ = isHQGroup(currentZone.id)
        const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        
        // Get the list of media IDs user has already seen
        const seenMediaKey = `seenMediaItems_${userId}`
        const seenMediaStr = localStorage.getItem(seenMediaKey) || '[]'
        let seenMedia: string[] = []
        try {
          seenMedia = JSON.parse(seenMediaStr)
        } catch {
          seenMedia = []
        }
        
        const videosRef = collection(db, 'media_videos')
        const videosQuery = query(videosRef, where('forHQ', '==', isHQ), limit(20))
        const snapshot = await getDocs(videosQuery)
        
        let hasNew = false
        const currentMediaIds: string[] = []
        
        snapshot.docs.forEach(doc => {
          const video = doc.data()
          const createdAt = video.createdAt?.toDate?.()?.getTime() || 0
          // Only consider videos from last week
          if (createdAt > lastWeek.getTime()) {
            currentMediaIds.push(doc.id)
                        if (!seenMedia.includes(doc.id)) {
              hasNew = true
            }
          }
        })
        
        // Store current media IDs for marking as seen later
        localStorage.setItem(`currentMediaItems_${userId}`, JSON.stringify(currentMediaIds))
        setHasNewMedia(hasNew)
      } catch (e) {
      }
    }
    checkNewMedia()

    // Check for upcoming calendar events (within next 7 days)
    const checkNewCalendar = async () => {
      try {
        const now = new Date()
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        
        // Get the list of event IDs user has already seen
        const seenEventsKey = `seenCalendarEvents_${userId}`
        const seenEventsStr = localStorage.getItem(seenEventsKey) || '[]'
        let seenEvents: string[] = []
        try {
          seenEvents = JSON.parse(seenEventsStr)
        } catch {
          seenEvents = []
        }
        
        let hasNewEvent = false
        const currentEventIds: string[] = []
        
        // Check zone_praise_nights for upcoming rehearsals
        const rehearsalsRef = collection(db, 'zone_praise_nights')
        const rehearsalsQuery = query(rehearsalsRef, where('zoneId', '==', currentZone.id), limit(10))
        const snapshot = await getDocs(rehearsalsQuery)
        
        snapshot.docs.forEach(doc => {
          const rehearsal = doc.data()
          const eventDate = new Date(rehearsal.date || rehearsal.eventDate)
          if (!isNaN(eventDate.getTime()) && eventDate >= now && eventDate <= nextWeek) {
            currentEventIds.push(doc.id)
                        if (!seenEvents.includes(doc.id)) {
              hasNewEvent = true
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
            currentEventIds.push(doc.id)
            if (!seenEvents.includes(doc.id)) {
              hasNewEvent = true
            }
          }
        })
        
        // Store current event IDs for marking as seen later
        localStorage.setItem(`currentCalendarEvents_${userId}`, JSON.stringify(currentEventIds))
        
        setHasNewCalendar(hasNewEvent)
      } catch (e) {
      }
    }
    checkNewCalendar()

    // Check for upcoming birthdays
    const checkBirthdays = async () => {
      try {
        const birthdays = await BirthdayService.getTodayAndUpcomingBirthdays()
        setHasUpcomingBirthday(birthdays.length > 0)
        
                // We use today's date as the key so it resets each day
        const today = new Date().toDateString()
        const hasSeenToday = lastBirthdaySeen === today
        
        if (birthdays.length > 0 && !hasSeenToday) {
          setHasUnseenBirthday(true)
          setHasNewCalendar(true)
        } else {
          setHasUnseenBirthday(false)
        }
      } catch (e) {
      }
    }
    checkBirthdays()

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
      // Get current media IDs and mark them as seen
      const currentMediaStr = localStorage.getItem(`currentMediaItems_${userId}`) || '[]'
      const seenMediaStr = localStorage.getItem(`seenMediaItems_${userId}`) || '[]'
      
      let currentMedia: string[] = []
      let seenMedia: string[] = []
      
      try {
        currentMedia = JSON.parse(currentMediaStr)
        seenMedia = JSON.parse(seenMediaStr)
      } catch {
        currentMedia = []
        seenMedia = []
      }
      
      // Merge current media into seen media (avoid duplicates)
      const allSeenMedia = [...new Set([...seenMedia, ...currentMedia])]
      
      // Keep only the last 100 seen items to prevent localStorage bloat
      const trimmedSeenMedia = allSeenMedia.slice(-100)
      
      localStorage.setItem(`seenMediaItems_${userId}`, JSON.stringify(trimmedSeenMedia))
      localStorage.setItem(`lastSeenMedia_${userId}`, Date.now().toString())
      setHasNewMedia(false)
    }
  }

  // Mark calendar as seen
  const markCalendarSeen = () => {
    const userId = user?.uid || profile?.id
    if (userId) {
      // Get current event IDs and mark them as seen
      const currentEventsStr = localStorage.getItem(`currentCalendarEvents_${userId}`) || '[]'
      const seenEventsStr = localStorage.getItem(`seenCalendarEvents_${userId}`) || '[]'
      
      let currentEvents: string[] = []
      let seenEvents: string[] = []
      
      try {
        currentEvents = JSON.parse(currentEventsStr)
        seenEvents = JSON.parse(seenEventsStr)
      } catch {
        currentEvents = []
        seenEvents = []
      }
      
      // Merge current events into seen events (avoid duplicates)
      const allSeenEvents = [...new Set([...seenEvents, ...currentEvents])]
      
      // Keep only the last 100 seen events to prevent localStorage bloat
      const trimmedSeenEvents = allSeenEvents.slice(-100)
      
      localStorage.setItem(`seenCalendarEvents_${userId}`, JSON.stringify(trimmedSeenEvents))
      localStorage.setItem(`lastSeenCalendar_${userId}`, Date.now().toString())
      // Also mark birthdays as seen for today
      localStorage.setItem(`lastSeenBirthday_${userId}`, new Date().toDateString())
      setHasNewCalendar(false)
      setHasUnseenBirthday(false)
    }
  }

  return { 
    unreadCount, 
    hasUnread: unreadCount > 0 || hasNewZoneMessage,
    hasNewZoneMessage,
    hasNewMedia,
    hasNewCalendar: hasNewCalendar || hasUnseenBirthday,
    hasUpcomingBirthday,
    markAsSeen,
    markMediaSeen,
    markCalendarSeen
  }
}
