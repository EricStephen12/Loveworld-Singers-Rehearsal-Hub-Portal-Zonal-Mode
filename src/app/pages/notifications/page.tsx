'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Bell, Users, Building2, ArrowLeft, Calendar,
  Mic, Gift, Image, RefreshCw, Music, MessageCircle,
  ChevronRight, Clock, Trash2, AlertCircle, CheckCircle2
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ScreenHeader } from '@/components/ScreenHeader'
import { FirebaseDatabaseService } from '@/lib/firebase-database'
import { SubGroupDatabaseService } from '@/lib/subgroup-database-service'
import { getUserSongNotifications, SongNotification } from '@/lib/song-submission-service'
import { BirthdayService } from '@/app/pages/calendar/_lib/birthday-service'
import { useAuth } from '@/hooks/useAuth'
import { useZone } from '@/hooks/useZone'
import { useUnreadNotifications } from '@/hooks/useUnreadNotifications'
import { isHQGroup } from '@/config/zones'
import { collection, query, where, orderBy, limit, onSnapshot, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase-setup'

// Notification types
type NotificationType =
  | 'zone' | 'subgroup' | 'audiolab' | 'calendar'
  | 'birthday' | 'media' | 'song' | 'chat'

interface CombinedNotification {
  id: string
  title: string
  message: string
  sentBy?: string
  sentAt: string
  type: NotificationType
  subGroupName?: string
  read?: boolean
  is_read?: boolean
  projectId?: string
  projectName?: string
  invitedBy?: string
  eventDate?: string
  eventType?: string
  mediaType?: 'image' | 'video' | 'audio'
  mediaUrl?: string
  songStatus?: 'approved' | 'rejected' | 'replied'
  chatId?: string
  chatName?: string
  isGroup?: boolean
  senderAvatar?: string
}

// Filter tabs
const FILTER_TABS: { id: string; label: string; icon: React.ElementType }[] = [
  { id: 'all', label: 'All', icon: Bell },
  { id: 'unread', label: 'Unread', icon: AlertCircle },
  { id: 'chat', label: 'Chats', icon: MessageCircle },
  { id: 'zone', label: 'Zone', icon: Building2 },
  { id: 'song', label: 'Songs', icon: Music },
  { id: 'audiolab', label: 'Studio', icon: Mic },
  { id: 'calendar', label: 'Events', icon: Calendar },
  { id: 'media', label: 'Media', icon: Image },
]

type FilterType = string

// Simple cache for notifications
const notificationCache = new Map<string, { data: CombinedNotification[]; timestamp: number }>()
const CACHE_TTL = 30000 // 30 seconds

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<CombinedNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<FilterType>('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { user, profile } = useAuth()
  const { currentZone, isLoading: zoneLoading } = useZone()
  const { markAsSeen } = useUnreadNotifications()

  const zoneColor = currentZone?.themeColor || '#9333EA'
  const userId = user?.uid || profile?.id
  const userEmail = user?.email || profile?.email

  // Mark notifications as seen when page loads
  useEffect(() => {
    markAsSeen()
  }, [markAsSeen])

  // Delete notification handler
  const handleDelete = async (notif: CombinedNotification, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeletingId(notif.id)
    setError(null)

    try {
      const parts = notif.id.split('-')
      const realId = parts.slice(1).join('-')

      if (notif.type === 'subgroup') {
        await deleteDoc(doc(db, 'user_notifications', realId))
      } else if (notif.type === 'song') {
        await deleteDoc(doc(db, 'song_notifications', realId))
      } else if (notif.type === 'chat' && userId && realId) {
        await updateDoc(doc(db, 'chats_v2', realId), {
          [`unreadCount.${userId}`]: 0
        })
      }
      // For zone, audiolab, calendar, media, birthday - just remove locally

      setNotifications(prev => prev.filter(n => n.id !== notif.id))
      if (currentZone?.id && userId) {
        notificationCache.delete(`${currentZone.id}-${userId}`)
      }
    } catch (err) {
      console.error('[Notifications] Error deleting:', err)
      setError('Failed to delete notification')
    } finally {
      setDeletingId(null)
    }
  }

  // Load all notification types in parallel
  const loadNotifications = useCallback(async (showRefresh = false, bypassCache = false) => {
    if (!currentZone?.id || !userId) {
      setLoading(false)
      return
    }

    // Check cache first
    const cacheKey = `${currentZone.id}-${userId}`
    if (!bypassCache && !showRefresh) {
      const cached = notificationCache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        setNotifications(cached.data)
        setLoading(false)
        return
      }
    }

    if (showRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)

    try {
      const isHQ = isHQGroup(currentZone.id)
      const now = new Date()
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

      // Run all queries in parallel
      const [
        richNotifsResult,
        subGroupNotifs,
        audiolabProjects,
        calendarEvents,
        mediaNotifs,
        songNotifs,
        birthdays,
        chatNotifs
      ] = await Promise.allSettled([
        // 1. Unified rich notifications (Zone/Admin broadcasts)
        FirebaseDatabaseService.getUserNotifications(userId, currentZone.id),

        // 2. Sub-group notifications
        SubGroupDatabaseService.getUserNotifications(userId, 50).catch(async () => {
          // Fallback query
          try {
            const q = query(collection(db, 'user_notifications'), where('userId', '==', userId), limit(50))
            const snapshot = await getDocs(q)
            return snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
          } catch { return [] }
        }),

        // 3. AudioLab projects
        (async () => {
          try {
            const q = query(collection(db, 'audiolab_projects'), where('collaborators', 'array-contains', userId), limit(20))
            const snapshot = await getDocs(q)
            return snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
          } catch {
            // Fallback to sharedWith
            try {
              const q2 = query(collection(db, 'audiolab_projects'), where('sharedWith', 'array-contains', userId), limit(20))
              const snapshot2 = await getDocs(q2)
              return snapshot2.docs.map(d => ({ id: d.id, ...d.data() }))
            } catch { return [] }
          }
        })(),

        // 4. Calendar events (combined query)
        (async () => {
          const events: any[] = []
          const collections = ['upcoming_events', 'calendar_events', 'zone_praise_nights']
          await Promise.all(collections.map(async (col) => {
            try {
              const q = query(collection(db, col), where('zoneId', '==', currentZone.id), limit(20))
              const snapshot = await getDocs(q)
              snapshot.docs.forEach(d => events.push({ id: d.id, collection: col, ...d.data() }))
            } catch { }
          }))
          return events
        })(),

        // 5. Media notifications
        (async () => {
          const media: any[] = []
          try {
            const vq = query(collection(db, 'media_videos'), where('forHQ', '==', isHQ), limit(30))
            const vs = await getDocs(vq)
            vs.docs.forEach(d => media.push({ id: d.id, type: 'video', ...d.data() }))
          } catch { }
          try {
            const pq = query(collection(db, 'admin_playlists'), where('isPublic', '==', true), limit(20))
            const ps = await getDocs(pq)
            ps.docs.forEach(d => {
              const data = d.data()
              if (data.forHQ === isHQ || data.forHQ === undefined) {
                media.push({ id: d.id, type: 'playlist', ...data })
              }
            })
          } catch { }
          return media
        })(),

        // 6. Song notifications
        userEmail ? getUserSongNotifications(userEmail).catch(() => []) : Promise.resolve([]),

        // 7. Birthdays
        BirthdayService.getTodayAndUpcomingBirthdays().catch(() => []),

        // 8. Chat notifications (show recent, not just unread)
        (async () => {
          try {
            const q = query(collection(db, 'chats_v2'), where('participants', 'array-contains', userId), limit(50))
            const snapshot = await getDocs(q)
            return snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
          } catch { return [] }
        })()
      ])

      const allNotifications: CombinedNotification[] = []

      // Process unified rich notifications
      if (richNotifsResult.status === 'fulfilled') {
        (richNotifsResult.value as any[]).forEach(msg => {
          allNotifications.push({
            id: `rich-${msg.id}`, title: msg.title, message: msg.message,
            sentBy: msg.sentBy || 'Admin', sentAt: msg.created_at || msg.sentAt,
            type: msg.category === 'song' ? 'song' : 'zone',
            is_read: msg.is_read
          })
        })
      }

      // Process subgroup notifications
      if (subGroupNotifs.status === 'fulfilled') {
        (subGroupNotifs.value as any[]).forEach(notif => {
          allNotifications.push({
            id: `subgroup-${notif.id}`,
            title: notif.title || 'Notification',
            message: notif.message || '',
            sentAt: notif.createdAt?.toISOString?.() || notif.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            type: 'subgroup',
            subGroupName: notif.subGroupName,
            read: notif.read
          })
        })
      }

      // Process audiolab projects
      if (audiolabProjects.status === 'fulfilled') {
        (audiolabProjects.value as any[]).forEach(project => {
          if (project.ownerId !== userId) {
            allNotifications.push({
              id: `audiolab-${project.id}`,
              title: 'Studio Collaboration',
              message: `You've been invited to collaborate on "${project.name || 'Untitled Project'}"`,
              sentAt: project.updatedAt?.toDate?.()?.toISOString() || project.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
              type: 'audiolab',
              projectId: project.id,
              projectName: project.name
            })
          }
        })
      }

      // Process calendar events
      if (calendarEvents.status === 'fulfilled') {
        const seenIds = new Set<string>()
          ; (calendarEvents.value as any[]).forEach(event => {
            const eventDate = new Date(event.date || event.eventDate || event.startDate)
            if (isNaN(eventDate.getTime())) return
            if (eventDate < now || eventDate > nextWeek) return
            if (seenIds.has(event.id)) return
            seenIds.add(event.id)

            const daysUntil = Math.ceil((eventDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
            const isRehearsal = event.collection === 'zone_praise_nights'
            const prefix = isRehearsal ? 'Rehearsal' : 'Event'

            allNotifications.push({
              id: `calendar-${event.collection}-${event.id}`,
              title: daysUntil === 0 ? `${prefix} Today!` : daysUntil === 1 ? `${prefix} Tomorrow` : `${prefix} in ${daysUntil} days`,
              message: event.title || event.name || event.description || `Upcoming ${prefix.toLowerCase()}`,
              sentAt: eventDate.toISOString(), // Use event date for proper sorting
              type: 'calendar',
              eventDate: event.date || event.eventDate
            })
          })
      }

      // Process media notifications
      if (mediaNotifs.status === 'fulfilled') {
        (mediaNotifs.value as any[]).forEach(media => {
          const createdAt = media.createdAt?.toDate?.() || new Date()
          if (createdAt < lastWeek) return

          if (media.type === 'video') {
            allNotifications.push({
              id: `media-video-${media.id}`,
              title: media.title || 'New Video',
              message: 'Check out the new video added to media',
              sentAt: createdAt.toISOString(),
              type: 'media',
              mediaType: 'video',
              mediaUrl: media.thumbnail
            })
          } else {
            allNotifications.push({
              id: `media-playlist-${media.id}`,
              title: media.name || 'New Playlist',
              message: `New playlist with ${media.videoIds?.length || 0} videos`,
              sentAt: createdAt.toISOString(),
              type: 'media',
              mediaType: 'video',
              mediaUrl: media.thumbnail
            })
          }
        })
      }

      // Process song notifications
      // Filter out notifications about user's own replies (those are for admin)
      if (songNotifs.status === 'fulfilled') {
        (songNotifs.value as SongNotification[]).forEach(notif => {
          // Skip "User replied:" notifications - those are meant for admin, not the user
          if (notif.type === 'replied' && notif.message?.startsWith('User replied:')) {
            return
          }

          allNotifications.push({
            id: `song-${notif.id}`,
            title: notif.type === 'approved' ? 'Song Approved' : notif.type === 'rejected' ? 'Song Rejected' : 'Song Reply',
            message: notif.message,
            sentAt: notif.createdAt,
            type: 'song',
            songStatus: notif.type as 'approved' | 'rejected' | 'replied',
            read: notif.read
          })
        })
      }

      // Process birthdays - use actual birthday date for sorting
      if (birthdays.status === 'fulfilled') {
        (birthdays.value as any[]).forEach(bday => {
          const title = bday.isToday
            ? `🎂 ${bday.first_name}'s Birthday Today!`
            : `🎂 Upcoming Birthday`
          const message = bday.isToday
            ? `${bday.first_name} ${bday.last_name} is celebrating their birthday today!`
            : `${bday.first_name} ${bday.last_name}'s birthday is coming up`

          // Calculate actual birthday date this year for proper sorting
          const bdayDate = new Date(bday.birthday)
          const thisYearBday = new Date(now.getFullYear(), bdayDate.getMonth(), bdayDate.getDate())

          allNotifications.push({
            id: `birthday-${bday.id}`,
            title,
            message,
            sentAt: thisYearBday.toISOString(),
            type: 'birthday',
            eventDate: bday.birthday
          })
        })
      }

      // Process chat notifications - show recent chats with activity
      // Don't show chats where user sent the last message (unless there are unread from others)
      if (chatNotifs.status === 'fulfilled') {
        (chatNotifs.value as any[]).forEach(chat => {
          const unreadCount = chat.unreadCount?.[userId] || 0
          const lastSenderId = chat.lastMessage?.senderId

          // Skip if user sent the last message
          if (lastSenderId === userId) {
            return
          }

          const hasRecentMessage = chat.lastMessage?.timestamp

          // Show if unread OR has recent message (within last 24 hours) from someone else
          let sentAt = new Date().toISOString()
          if (chat.lastMessage?.timestamp) {
            if (typeof chat.lastMessage.timestamp.toDate === 'function') {
              sentAt = chat.lastMessage.timestamp.toDate().toISOString()
            } else if (chat.lastMessage.timestamp.seconds) {
              sentAt = new Date(chat.lastMessage.timestamp.seconds * 1000).toISOString()
            }
          }

          const messageTime = new Date(sentAt)
          const isRecent = (now.getTime() - messageTime.getTime()) < 24 * 60 * 60 * 1000

          // Only show if there are unread messages OR recent message from someone else
          if (unreadCount > 0 || (hasRecentMessage && isRecent)) {
            const isGroup = chat.type === 'group'
            let senderName = lastSenderId ? (chat.participantDetails?.[lastSenderId]?.name || 'Someone') : 'Someone'
            let chatName = chat.name || 'Chat'

            if (!isGroup && chat.participantDetails) {
              const other = Object.entries(chat.participantDetails).find(([id]) => id !== userId)
              if (other) chatName = (other[1] as any).name || 'Chat'
            }

            let messagePreview = chat.lastMessage?.text || 'New message'
            if (messagePreview.startsWith('📷')) messagePreview = '📷 Photo'
            else if (messagePreview.startsWith('📄')) messagePreview = '📄 Document'
            else if (messagePreview.startsWith('📞')) messagePreview = '📞 Call'

            allNotifications.push({
              id: `chat-${chat.id}`,
              title: isGroup ? chatName : (senderName !== 'Someone' ? senderName : chatName),
              message: isGroup ? `${senderName}: ${messagePreview}` : messagePreview,
              sentBy: senderName,
              sentAt,
              type: 'chat',
              chatId: chat.id,
              chatName,
              isGroup,
              read: unreadCount === 0,
              senderAvatar: lastSenderId ? chat.participantDetails?.[lastSenderId]?.avatar : undefined
            })
          }
        })
      }

      // Sort by date
      allNotifications.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())

      // Cache the results
      notificationCache.set(cacheKey, { data: allNotifications, timestamp: Date.now() })

      setNotifications(allNotifications)
    } catch (e) {
      console.error('Load error:', e)
      setError('Failed to load notifications')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [userId, userEmail, currentZone?.id])

  // Initial load
  useEffect(() => {
    if (currentZone?.id && !zoneLoading && userId) {
      loadNotifications()
    }
  }, [currentZone?.id, zoneLoading, userId, loadNotifications])

  // Real-time listener for zone messages only (doesn't reload everything)
  useEffect(() => {
    if (!currentZone?.id) return

    const isHQ = isHQGroup(currentZone.id)
    const collectionName = isHQ ? 'admin_messages' : 'zone_admin_messages'
    const messagesRef = collection(db, collectionName)

    let q
    try {
      q = isHQ
        ? query(messagesRef, orderBy('createdAt', 'desc'), limit(20))
        : query(messagesRef, where('zoneId', '==', currentZone.id), orderBy('createdAt', 'desc'), limit(20))
    } catch {
      // Fallback without orderBy if index not ready
      q = isHQ
        ? query(messagesRef, limit(20))
        : query(messagesRef, where('zoneId', '==', currentZone.id), limit(20))
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.metadata.hasPendingWrites && snapshot.docChanges().length > 0) {
        // Only reload if there are actual changes
        loadNotifications(false, true) // bypass cache
      }
    }, (err) => {
    })

    return () => unsubscribe()
  }, [currentZone?.id, loadNotifications])

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      if (filter === 'unread') return n.is_read === false || (n.read === false && n.type !== 'chat')
      if (filter === 'all') return true
      if (filter === 'chat') return n.type === 'chat'
      if (filter === 'zone') return n.type === 'zone' || n.type === 'subgroup'
      if (filter === 'song') return n.type === 'song'
      if (filter === 'audiolab') return n.type === 'audiolab'
      if (filter === 'calendar') return n.type === 'calendar' || n.type === 'birthday'
      if (filter === 'media') return n.type === 'media'
      return true
    })
  }, [notifications, filter])

  // Group by date
  const grouped = useMemo(() => {
    return filteredNotifications.reduce((acc, notif) => {
      const date = new Date(notif.sentAt)
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      let key = date.toDateString() === today.toDateString() ? 'Today'
        : date.toDateString() === yesterday.toDateString() ? 'Yesterday'
          : date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })

      if (!acc[key]) acc[key] = []
      acc[key].push(notif)
      return acc
    }, {} as Record<string, CombinedNotification[]>)
  }, [filteredNotifications])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const getIcon = (type: NotificationType) => {
    const icons: Record<NotificationType, React.ElementType> = {
      zone: Building2, subgroup: Users, audiolab: Mic, calendar: Calendar,
      birthday: Gift, media: Image, song: Music, chat: MessageCircle
    }
    return icons[type] || Bell
  }

  const getIconBg = (type: NotificationType, songStatus?: string) => {
    if (type === 'song') {
      if (songStatus === 'approved') return 'bg-green-100 text-green-600'
      if (songStatus === 'rejected') return 'bg-red-100 text-red-600'
      return 'bg-purple-100 text-purple-600'
    }
    const colors: Record<NotificationType, string> = {
      zone: 'bg-blue-100 text-blue-600',
      subgroup: 'bg-purple-100 text-purple-600',
      audiolab: 'bg-violet-100 text-violet-600',
      calendar: 'bg-amber-100 text-amber-600',
      birthday: 'bg-pink-100 text-pink-600',
      media: 'bg-emerald-100 text-emerald-600',
      song: 'bg-purple-100 text-purple-600',
      chat: 'bg-indigo-100 text-indigo-600'
    }
    return colors[type] || 'bg-gray-100 text-gray-600'
  }

  const handleClick = (notif: CombinedNotification) => {
    switch (notif.type) {
      case 'audiolab':
        router.push(notif.projectId ? `/pages/audiolab?project=${notif.projectId}` : '/pages/audiolab')
        break
      case 'calendar':
      case 'birthday':
        router.push('/pages/calendar')
        break
      case 'media':
        router.push('/pages/media')
        break
      case 'song':
        router.push('/pages/submit-song')
        break
      case 'chat':
        router.push(notif.chatId ? `/pages/groups?chat=${notif.chatId}` : '/pages/groups')
        break
      case 'zone':
      case 'subgroup':
        // Zone/subgroup notifications - could navigate to a specific page if needed
        // For now, just stay on notifications page
        break
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 overflow-y-auto">
      <ScreenHeader
        title="Notifications"
        showBackButton={true}
        backPath="/home"
        rightButtons={
          <button onClick={() => loadNotifications(true, true)} disabled={refreshing}
            className="p-2 rounded-lg hover:bg-gray-100 active:scale-95 transition-all disabled:opacity-50">
            <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        }
      />

      <div className="pb-24 px-4 overflow-y-auto" style={{ height: 'calc(100vh - 60px)' }}>
        <div className="max-w-2xl mx-auto">
          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
              <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">×</button>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="relative -mx-4 px-4 mb-4 pt-2 sticky top-0 bg-gradient-to-br from-gray-50 via-white to-gray-100 z-10">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
              {FILTER_TABS.map(tab => {
                const Icon = tab.icon
                const count = tab.id === 'all' ? notifications.length
                  : notifications.filter(n => {
                    if (tab.id === 'zone') return n.type === 'zone' || n.type === 'subgroup'
                    if (tab.id === 'calendar') return n.type === 'calendar' || n.type === 'birthday'
                    return n.type === tab.id
                  }).length

                return (
                  <button key={tab.id} onClick={() => setFilter(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all flex-shrink-0 border ${filter === tab.id
                      ? 'text-white shadow-lg shadow-purple-200 border-transparent scale-105'
                      : 'bg-white/50 backdrop-blur-sm text-gray-500 border-gray-100 hover:bg-white hover:text-gray-900'
                      }`}
                    style={filter === tab.id ? { backgroundColor: zoneColor } : undefined}
                  >
                    <Icon className={`w-4 h-4 ${filter === tab.id ? 'animate-pulse' : ''}`} />
                    {tab.label}
                    {count > 0 && (
                      <span className={`ml-1 px-1.5 py-0.5 rounded-lg text-[10px] font-black ${filter === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'
                        }`}>{count}</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Notifications List */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white/50 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-gray-100/50">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gray-100 rounded-2xl animate-pulse flex-shrink-0" />
                    <div className="flex-1">
                      <div className="h-6 w-1/3 bg-gray-100 rounded-lg animate-pulse mb-3" />
                      <div className="h-4 w-full bg-gray-100 rounded-lg animate-pulse mb-2" />
                      <div className="h-4 w-2/3 bg-gray-100 rounded-lg animate-pulse mb-4" />
                      <div className="h-3 w-1/4 bg-gray-50 rounded-lg animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-white/50 backdrop-blur-xl rounded-[40px] p-20 text-center shadow-2xl shadow-gray-100/50 border border-white flex flex-col items-center">
              <div className="w-24 h-24 bg-gradient-to-tr from-gray-50 to-white rounded-[32px] flex items-center justify-center mb-8 shadow-inner border border-gray-50">
                <Bell className="w-10 h-10 text-gray-200" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">All Caught Up!</h3>
              <p className="text-gray-500 text-base max-w-[240px] leading-relaxed">
                {filter === 'all'
                  ? "Your inbox is clean. We'll let you know when something new arrives."
                  : `You don't have any ${filter} notifications at the moment.`}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(grouped).map(([dateGroup, notifs]) => (
                <div key={dateGroup}>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-500">{dateGroup}</span>
                  </div>
                  <div className="space-y-2">
                    {notifs.map(notif => {
                      const Icon = getIcon(notif.type)
                      const iconBg = getIconBg(notif.type, notif.songStatus)
                      const isClickable = ['audiolab', 'calendar', 'birthday', 'media', 'song', 'chat'].includes(notif.type)
                      const isUnread = !notif.read && ['chat', 'song', 'subgroup'].includes(notif.type)
                      const isDeleting = deletingId === notif.id

                      return (
                        <div key={notif.id} onClick={() => isClickable && handleClick(notif)}
                          className={`bg-white/80 backdrop-blur-md rounded-3xl p-5 shadow-sm border transition-all relative group ${isClickable ? 'cursor-pointer hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]' : ''
                            } ${isUnread ? 'bg-indigo-50/50 border-indigo-100/50' : 'border-gray-100/50'} ${isDeleting ? 'opacity-50' : ''}`}
                        >
                          {/* Unread indicator dot */}
                          {isUnread && (
                            <div className="absolute top-5 right-5 w-2 h-2 rounded-full bg-indigo-600 shadow-sm shadow-indigo-200" />
                          )}

                          {/* Delete button (only show on hover) */}
                          <button
                            onClick={(e) => handleDelete(notif, e)}
                            disabled={isDeleting}
                            className="absolute bottom-5 right-5 p-2 rounded-xl bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 opacity-40 hover:opacity-100 transition-all z-10 border border-gray-100"
                          >
                            {isDeleting ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>

                          <div className="flex items-start gap-4">
                            {notif.type === 'chat' && notif.senderAvatar ? (
                              <div className="relative">
                                <img src={notif.senderAvatar} alt="" className="w-14 h-14 rounded-2xl object-cover flex-shrink-0 shadow-sm border-2 border-white" />
                                <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-lg shadow-sm border border-gray-50">
                                  <MessageCircle className="w-3.5 h-3.5 text-indigo-600" />
                                </div>
                              </div>
                            ) : (
                              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm border-2 border-white ${iconBg}`}>
                                <Icon className="w-7 h-7" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h3 className={`font-bold text-gray-900 ${isUnread ? 'text-indigo-900' : ''}`}>{notif.title}</h3>
                                {notif.type === 'subgroup' && notif.subGroupName && (
                                  <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-lg" style={{ backgroundColor: `${zoneColor}15`, color: zoneColor }}>
                                    {notif.subGroupName}
                                  </span>
                                )}
                                {notif.type === 'audiolab' && <span className="px-2.5 py-0.5 bg-violet-100 text-violet-700 text-[10px] font-black uppercase tracking-wider rounded-lg">Studio</span>}
                              </div>
                              <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-2">{notif.message}</p>
                              <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                                {notif.sentBy && notif.type !== 'chat' && <><span>{notif.sentBy}</span><span>•</span></>}
                                <span>{formatDate(notif.sentAt)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
