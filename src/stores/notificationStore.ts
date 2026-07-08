/**
 * NOTIFICATION STORE — Centralized Notification State
 *
 * Fixes:
 * 1. Was: EACH component that used useUnreadNotifications opened its own
 *    set of 4+ Firestore listeners → at 10k users = 20k open listeners
 * 2. Now: ONE set of listeners total, shared via Zustand selectors
 *
 * Realtime preserved:
 * - onSnapshot for chats (chat unread counts)
 * - onSnapshot for notifications (bell badge)
 * - getDocs checks for media / calendar (one-time on init, then cached)
 *
 * localStorage is still used for "last seen" timestamps but is no longer
 * the primary state — Zustand is.
 */

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
  getDocs,
  writeBatch,
  doc,
} from 'firebase/firestore'
import { db } from '@/lib/firebase-setup'
import { FirebaseDatabaseService } from '@/lib/firebase-database'
import { isHQGroup } from '@/config/zones'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface NotificationData {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  category: 'rehearsal' | 'announcement' | 'reminder' | 'system' | 'admin' | 'song' | 'praise_night'
  priority: 'low' | 'medium' | 'high'
  sender_id?: string
  sender_name?: string
  action_url?: string
  created_at: string
  read_at?: string
  is_read: boolean
  target_audience: 'all' | 'group' | 'individual'
  target_group?: string
  target_user_id?: string
  zoneId?: string
}

interface NotificationState {
  // Badge counts
  chatUnreadCount: number
  hasNewZoneMessage: boolean
  hasNewMedia: boolean
  hasNewCalendar: boolean
  hasUpcomingBirthday: boolean
  hasUnseenBirthday: boolean

  // Full notification list (from notifications collection)
  notifications: NotificationData[]
  notificationsLoading: boolean

  // Subscription tracking (prevent duplicate listeners)
  _currentUserId: string | null
  _currentZoneId: string | null
  _chatUnsub: (() => void) | null
  _notifUnsub: (() => void) | null

  // Actions
  initialize: (userId: string, zoneId: string, userProfile?: any) => void
  cleanup: () => void
  markAsSeen: () => void
  markMediaSeen: (userId: string) => void
  markCalendarSeen: (userId: string) => void

  // Notification CRUD (previously in useRealtimeNotifications)
  markAsRead: (notificationId: string, userId: string) => Promise<boolean>
  markAllAsRead: (userId: string) => Promise<boolean>
  deleteNotification: (notificationId: string, userId: string) => Promise<boolean>
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useNotificationStore = create<NotificationState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    chatUnreadCount: 0,
    hasNewZoneMessage: false,
    hasNewMedia: false,
    hasNewCalendar: false,
    hasUpcomingBirthday: false,
    hasUnseenBirthday: false,
    notifications: [],
    notificationsLoading: false,
    _currentUserId: null,
    _currentZoneId: null,
    _chatUnsub: null,
    _notifUnsub: null,

    // ── Initialize (called from AppBootstrap when user + zone are ready) ───────
    initialize: (userId: string, zoneId: string, userProfile?: any) => {
      const { _currentUserId, _currentZoneId, _chatUnsub, _notifUnsub } = get()

      // Skip if already subscribed for same user+zone
      if (_currentUserId === userId && _currentZoneId === zoneId) return

      // Tear down old subscriptions before creating new ones
      if (_chatUnsub) _chatUnsub()
      if (_notifUnsub) _notifUnsub()

      set({
        _currentUserId: userId,
        _currentZoneId: zoneId,
        notificationsLoading: true,
      })

      // ── (1) Chat unread counts — ONE persistent onSnapshot ────────────────
      let chatUnsub: (() => void) | null = null
      try {
        const chatsRef = collection(db, 'chats_v2')
        const chatsQuery = query(
          chatsRef,
          where('participants', 'array-contains', userId),
          limit(50)
        )

        chatUnsub = onSnapshot(
          chatsQuery,
          (snapshot) => {
            let total = 0
            snapshot.docs.forEach((doc) => {
              const chat = doc.data()
              total += chat.unreadCount?.[userId] || 0
            })
            set({ chatUnreadCount: total })
          },
          (err) => console.error('[NotificationStore] Chat listener error:', err)
        )
      } catch (e) {
        console.error('[NotificationStore] Chat listener setup failed:', e)
      }

      // ── (2) Zone notifications — ONE persistent onSnapshot ────────────────
      let notifUnsub: (() => void) | null = null
      const storageKey = `lastSeenNotifications_${userId}`
      const lastSeen = parseInt(localStorage.getItem(storageKey) || '0', 10)

      try {
        const notifsRef = collection(db, 'notifications')
        const notifsQuery = query(
          notifsRef,
          where('zoneId', '==', zoneId),
          orderBy('created_at', 'desc'),
          limit(50)
        )

        // ── Fetch user's groups ONCE for this session to use in filter ──────
        let userGroupNames: string[] = []
        FirebaseDatabaseService.getCollectionWhere('user_groups', 'user_id', '==', userId)
          .then(docs => {
            userGroupNames = docs.map((d: any) => d.group_name)
          })
          .catch(err => console.error('[NotificationStore] Failed to load user groups:', err))

        notifUnsub = onSnapshot(
          notifsQuery,
          async (snapshot) => {
            const allNotifs = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as NotificationData[]

            // Filter to this user's relevant notifications
            const userNotifs = allNotifs.filter((notif) => {
              if (notif.target_audience === 'all') return true
              if (
                notif.target_audience === 'individual' &&
                notif.target_user_id === userId
              ) return true
              if (
                notif.target_audience === 'group' &&
                notif.target_group &&
                userGroupNames.includes(notif.target_group)
              ) return true
              return false
            })

            // Load read status from user_notifications
            try {
              const readDocs = await FirebaseDatabaseService.getCollectionWhere(
                'user_notifications',
                'user_id',
                '==',
                userId
              )
              const readMap = new Map(
                readDocs.map((rn: any) => [rn.notification_id, rn.read_at])
              )

              const enriched = userNotifs.map((n) => ({
                ...n,
                is_read: readMap.has(n.id),
                read_at: readMap.get(n.id) as string | undefined,
              }))

              // Check if there's anything newer than last seen
              const hasNew = enriched.some((n) => {
                const t = new Date(n.created_at || 0).getTime()
                return t > lastSeen && !n.is_read
              })

              set({
                notifications: enriched,
                notificationsLoading: false,
                hasNewZoneMessage: hasNew,
              })
            } catch (err) {
              set({ notifications: userNotifs, notificationsLoading: false })
            }
          },
          (err) => {
            console.error('[NotificationStore] Notifications listener error:', err)
            set({ notificationsLoading: false })
          }
        )
      } catch (e) {
        console.error('[NotificationStore] Notifications listener setup failed:', e)
        set({ notificationsLoading: false })
      }

      // ── (3) Media check — one-time getDocs (not a persistent listener) ─────
      ;(async () => {
        try {
          const seenMediaStr = localStorage.getItem(`seenMediaItems_${userId}`) || '[]'
          const seenMedia: string[] = JSON.parse(seenMediaStr)

          const videosRef = collection(db, 'media_videos')
          const videosQuery = query(
            videosRef,
            where('forHQ', '==', isHQGroup(zoneId)),
            limit(20)
          )
          const snapshot = await getDocs(videosQuery)

          const lastWeek = Date.now() - 7 * 24 * 60 * 60 * 1000
          const currentIds: string[] = []
          let hasNew = false

          snapshot.docs.forEach((doc) => {
            const video = doc.data()
            const createdAt = video.createdAt?.toDate?.()?.getTime() || 0
            if (createdAt > lastWeek) {
              currentIds.push(doc.id)
              if (!seenMedia.includes(doc.id)) hasNew = true
            }
          })

          localStorage.setItem(`currentMediaItems_${userId}`, JSON.stringify(currentIds))
          set({ hasNewMedia: hasNew })
        } catch (e) {
          // Non-critical — don't block
        }
      })()

      // ── (4) Calendar check — one-time getDocs ─────────────────────────────
      ;(async () => {
        try {
          const seenEventsStr = localStorage.getItem(`seenCalendarEvents_${userId}`) || '[]'
          const seenEvents: string[] = JSON.parse(seenEventsStr)
          const now = new Date()
          const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
          const currentIds: string[] = []
          let hasNew = false

          const rehearsalsRef = collection(db, 'zone_praise_nights')
          const rehearsalsQuery = query(
            rehearsalsRef,
            where('zoneId', '==', zoneId),
            limit(10)
          )
          const snap = await getDocs(rehearsalsQuery)

          snap.docs.forEach((docSnap) => {
            const data = docSnap.data()
            const dateStr = data.date || data.eventDate
            if (dateStr) {
              const eventDate = new Date(dateStr)
              if (!isNaN(eventDate.getTime()) && eventDate >= now && eventDate <= nextWeek) {
                currentIds.push(docSnap.id)
                if (!seenEvents.includes(docSnap.id)) hasNew = true
              }
            }
          })

          localStorage.setItem(`currentCalendarEvents_${userId}`, JSON.stringify(currentIds))
          set({ hasNewCalendar: hasNew })
        } catch (e) {
          // Non-critical
        }
      })()

      set({ _chatUnsub: chatUnsub, _notifUnsub: notifUnsub })
    },

    // ── Cleanup ───────────────────────────────────────────────────────────────
    cleanup: () => {
      const { _chatUnsub, _notifUnsub } = get()
      if (_chatUnsub) _chatUnsub()
      if (_notifUnsub) _notifUnsub()
      set({
        chatUnreadCount: 0,
        hasNewZoneMessage: false,
        hasNewMedia: false,
        hasNewCalendar: false,
        notifications: [],
        _currentUserId: null,
        _currentZoneId: null,
        _chatUnsub: null,
        _notifUnsub: null,
      })
    },

    // ── Mark notification seen (bell click) ───────────────────────────────────
    markAsSeen: () => {
      const { _currentUserId } = get()
      if (_currentUserId) {
        const storageKey = `lastSeenNotifications_${_currentUserId}`
        localStorage.setItem(storageKey, Date.now().toString())
      }
      set({ hasNewZoneMessage: false })
    },

    // ── Mark media seen ───────────────────────────────────────────────────────
    markMediaSeen: (userId: string) => {
      const currentStr = localStorage.getItem(`currentMediaItems_${userId}`) || '[]'
      const seenStr = localStorage.getItem(`seenMediaItems_${userId}`) || '[]'
      const current: string[] = JSON.parse(currentStr)
      const seen: string[] = JSON.parse(seenStr)
      const merged = [...new Set([...seen, ...current])].slice(-100)
      localStorage.setItem(`seenMediaItems_${userId}`, JSON.stringify(merged))
      localStorage.setItem(`lastSeenMedia_${userId}`, Date.now().toString())
      set({ hasNewMedia: false })
    },

    // ── Mark calendar seen ────────────────────────────────────────────────────
    markCalendarSeen: (userId: string) => {
      const currentStr = localStorage.getItem(`currentCalendarEvents_${userId}`) || '[]'
      const seenStr = localStorage.getItem(`seenCalendarEvents_${userId}`) || '[]'
      const current: string[] = JSON.parse(currentStr)
      const seen: string[] = JSON.parse(seenStr)
      const merged = [...new Set([...seen, ...current])].slice(-100)
      localStorage.setItem(`seenCalendarEvents_${userId}`, JSON.stringify(merged))
      localStorage.setItem(`lastSeenCalendar_${userId}`, Date.now().toString())
      localStorage.setItem(`lastSeenBirthday_${userId}`, new Date().toDateString())
      set({ hasNewCalendar: false, hasUnseenBirthday: false })
    },

    // ── markAsRead (single notification) ─────────────────────────────────────
    markAsRead: async (notificationId: string, userId: string) => {
      try {
        const userNotifId = `${userId}_${notificationId}`
        await FirebaseDatabaseService.createDocument('user_notifications', userNotifId, {
          user_id: userId,
          notification_id: notificationId,
          read_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        })

        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === notificationId
              ? { ...n, is_read: true, read_at: new Date().toISOString() }
              : n
          ),
        }))

        return true
      } catch (err) {
        console.error('[NotificationStore] markAsRead failed:', err)
        return false
      }
    },

    // ── markAllAsRead — BATCH write instead of sequential loop ────────────────
    markAllAsRead: async (userId: string) => {
      const { notifications } = get()
      const unread = notifications.filter((n) => !n.is_read)
      if (unread.length === 0) return true

      try {
        // Firestore batch: max 500 ops per batch
        const batches: any[] = []
        let currentBatch = writeBatch(db)
        let opCount = 0

        for (const notif of unread) {
          const userNotifId = `${userId}_${notif.id}`
          const ref = doc(db, 'user_notifications', userNotifId)
          currentBatch.set(ref, {
            user_id: userId,
            notification_id: notif.id,
            read_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
          })
          opCount++

          if (opCount === 499) {
            batches.push(currentBatch)
            currentBatch = writeBatch(db)
            opCount = 0
          }
        }

        if (opCount > 0) batches.push(currentBatch)
        await Promise.all(batches.map((b) => b.commit()))

        set((state) => ({
          notifications: state.notifications.map((n) => ({
            ...n,
            is_read: true,
            read_at: new Date().toISOString(),
          })),
        }))

        return true
      } catch (err) {
        console.error('[NotificationStore] markAllAsRead failed:', err)
        return false
      }
    },

    // ── deleteNotification ────────────────────────────────────────────────────
    deleteNotification: async (notificationId: string, userId: string) => {
      try {
        await get().markAsRead(notificationId, userId)
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== notificationId),
        }))
        return true
      } catch (err) {
        console.error('[NotificationStore] deleteNotification failed:', err)
        return false
      }
    },
  }))
)

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectChatUnreadCount = (s: NotificationState) => s.chatUnreadCount
export const selectHasUnread = (s: NotificationState) =>
  s.chatUnreadCount > 0 || s.hasNewZoneMessage
export const selectHasNewMedia = (s: NotificationState) => s.hasNewMedia
export const selectHasNewCalendar = (s: NotificationState) =>
  s.hasNewCalendar || s.hasUnseenBirthday
export const selectNotifications = (s: NotificationState) => s.notifications
export const selectNotificationsLoading = (s: NotificationState) => s.notificationsLoading

// ─── Drop-in hook replacement for useUnreadNotifications ─────────────────────
export function useUnreadNotifications() {
  const chatUnreadCount = useNotificationStore(selectChatUnreadCount)
  const hasUnread = useNotificationStore(selectHasUnread)
  const hasNewZoneMessage = useNotificationStore((s) => s.hasNewZoneMessage)
  const hasNewMedia = useNotificationStore(selectHasNewMedia)
  const hasNewCalendar = useNotificationStore(selectHasNewCalendar)
  const hasUpcomingBirthday = useNotificationStore((s) => s.hasUpcomingBirthday)
  const markAsSeen = useNotificationStore((s) => s.markAsSeen)
  const markMediaSeen = useNotificationStore((s) => s.markMediaSeen)
  const markCalendarSeen = useNotificationStore((s) => s.markCalendarSeen)

  const userId = useNotificationStore((s) => s._currentUserId) || ''

  return {
    unreadCount: chatUnreadCount,
    hasUnread,
    hasNewZoneMessage,
    hasNewMedia,
    hasNewCalendar,
    hasUpcomingBirthday,
    markAsSeen,
    markMediaSeen: () => markMediaSeen(userId),
    markCalendarSeen: () => markCalendarSeen(userId),
  }
}

// ─── Drop-in hook replacement for useRealtimeNotifications ───────────────────
export function useRealtimeNotifications() {
  const notifications = useNotificationStore(selectNotifications)
  const loading = useNotificationStore(selectNotificationsLoading)
  const markAsRead = useNotificationStore((s) => s.markAsRead)
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead)
  const deleteNotification = useNotificationStore((s) => s.deleteNotification)
  const userId = useNotificationStore((s) => s._currentUserId) || ''

  return {
    notifications,
    loading,
    error: null,
    markAsRead: (id: string) => markAsRead(id, userId),
    markAllAsRead: () => markAllAsRead(userId),
    deleteNotification: (id: string) => deleteNotification(id, userId),
    refresh: async () => {}, // handled by realtime listener
  }
}

// ─── Admin actions for creating notifications ─────────────────────────────────
export function useNotificationActions() {
  const zoneId = useNotificationStore((s) => s._currentZoneId) || ''

  const createNotificationForAll = async (data: {
    title: string
    message: string
    type: string
    category: string
    priority: string
  }) => {
    try {
      await FirebaseDatabaseService.createDocument('notifications', undefined as any, {
        ...data,
        target_audience: 'all',
        zoneId,
        created_at: new Date().toISOString(),
        is_read: false,
      })
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  const createNotificationForGroup = async (data: {
    title: string
    message: string
    groupName: string
    type: string
    category: string
    priority: string
  }) => {
    try {
      await FirebaseDatabaseService.createDocument('notifications', undefined as any, {
        title: data.title,
        message: data.message,
        type: data.type,
        category: data.category,
        priority: data.priority,
        target_audience: 'group',
        target_group: data.groupName,
        zoneId,
        created_at: new Date().toISOString(),
        is_read: false,
      })
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  }

  return { createNotificationForAll, createNotificationForGroup }
}

