'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { 
  Bell, Users, Building2, ArrowLeft, Calendar, 
  Mic, Gift, Image, RefreshCw, Music, MessageCircle,
  ChevronRight, Clock, Trash2
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import ScreenHeader from '@/components/ScreenHeader'
import { getAllMessages } from '@/lib/simple-notifications-service'
import { SubGroupDatabaseService } from '@/lib/subgroup-database-service'
import { getUserSongNotifications, SongNotification } from '@/lib/song-submission-service'
import { useAuth } from '@/hooks/useAuth'
import { useZone } from '@/hooks/useZone'
import { useUnreadNotifications } from '@/hooks/useUnreadNotifications'
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
const FILTER_TABS: { id: string; label: string; icon: any }[] = [
  { id: 'all', label: 'All', icon: Bell },
  { id: 'chat', label: 'Chats', icon: MessageCircle },
  { id: 'zone', label: 'Zone', icon: Building2 },
  { id: 'song', label: 'Songs', icon: Music },
  { id: 'audiolab', label: 'Studio', icon: Mic },
  { id: 'calendar', label: 'Events', icon: Calendar },
  { id: 'media', label: 'Media', icon: Image },
]

type FilterType = string

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<CombinedNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<FilterType>('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()
  const { user, profile } = useAuth()
  const { currentZone, isLoading: zoneLoading } = useZone()
  const { markAsSeen } = useUnreadNotifications()
  
  const zoneColor = currentZone?.themeColor || '#9333EA'

  // Mark notifications as seen when page loads
  useEffect(() => {
    markAsSeen()
  }, [markAsSeen])

  // Delete notification handler
  const handleDelete = async (notif: CombinedNotification, e: React.MouseEvent) => {
    e.stopPropagation()
    setDeletingId(notif.id)
    
    try {
      // Extract the real ID (remove prefix like 'zone-', 'chat-', etc.)
      const parts = notif.id.split('-')
      const realId = parts.slice(1).join('-')
      
      console.log('[Notifications] Deleting:', notif.type, realId)
      
      if (notif.type === 'zone') {
        // Zone messages - only admins should delete these, but we can hide locally
        // For now just remove from local state (zone messages are shared)
        console.log('[Notifications] Zone message - removing locally only')
      } else if (notif.type === 'subgroup') {
        // Subgroup notifications - delete from user_notifications
        await deleteDoc(doc(db, 'user_notifications', realId))
        console.log('[Notifications] Deleted subgroup notification from Firebase')
      } else if (notif.type === 'song') {
        // Song notifications - mark as read (or delete)
        await deleteDoc(doc(db, 'song_notifications', realId))
        console.log('[Notifications] Deleted song notification from Firebase')
      } else if (notif.type === 'chat') {
        // Chat notifications - reset unread count for this user
        const userId = user?.uid || profile?.id
        if (userId && realId) {
          await updateDoc(doc(db, 'chats_v2', realId), {
            [`unreadCount.${userId}`]: 0
          })
          console.log('[Notifications] Reset chat unread count')
        }
      } else if (notif.type === 'audiolab') {
        // AudioLab - can't really delete invite, just hide locally
        console.log('[Notifications] AudioLab invite - removing locally only')
      } else if (notif.type === 'calendar') {
        // Calendar events - these are derived, just hide locally
        console.log('[Notifications] Calendar event - removing locally only')
      } else if (notif.type === 'media') {
        // Media notifications - these are derived, just hide locally
        console.log('[Notifications] Media notification - removing locally only')
      }
      
      // Remove from local state
      setNotifications(prev => prev.filter(n => n.id !== notif.id))
    } catch (error) {
      console.error('[Notifications] Error deleting notification:', error)
    } finally {
      setDeletingId(null)
    }
  }

  const loadNotifications = useCallback(async (showRefresh = false) => {
    const userId = user?.uid || profile?.id
    if (!currentZone?.id || !userId) {
      setLoading(false)
      return
    }
    
    if (showRefresh) setRefreshing(true)
    else setLoading(true)
    
    try {
      const allNotifications: CombinedNotification[] = []
      
      // 1. Zone messages
      try {
        const zoneMessages = await getAllMessages(currentZone.id)
        zoneMessages.forEach(msg => {
          allNotifications.push({
            id: `zone-${msg.id}`, title: msg.title, message: msg.message,
            sentBy: msg.sentBy, sentAt: msg.sentAt, type: 'zone'
          })
        })
      } catch (e) { console.error('Zone messages error:', e) }
      
      // 2. Sub-group notifications - handle potential index issues
      try {
        const subGroupNotifs = await SubGroupDatabaseService.getUserNotifications(userId, 50)
        subGroupNotifs.forEach(notif => {
          allNotifications.push({
            id: `subgroup-${notif.id}`, title: notif.title, message: notif.message,
            sentAt: notif.createdAt?.toISOString?.() || new Date().toISOString(),
            type: 'subgroup', subGroupName: notif.subGroupName, read: notif.read
          })
        })
      } catch (e) { 
        console.error('Subgroup notifications error:', e)
        // Fallback: try simpler query without orderBy
        try {
          const notificationsRef = collection(db, 'user_notifications')
          const q = query(notificationsRef, where('userId', '==', userId), limit(50))
          const snapshot = await getDocs(q)
          snapshot.docs.forEach(docSnap => {
            const data = docSnap.data()
            allNotifications.push({
              id: `subgroup-${docSnap.id}`, 
              title: data.title || 'Notification', 
              message: data.message || '',
              sentAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
              type: 'subgroup', 
              subGroupName: data.subGroupName, 
              read: data.read
            })
          })
        } catch (fallbackError) {
          console.log('Subgroup fallback also failed:', fallbackError)
        }
      }
      
      // 3. AudioLab invites - check projects where user is collaborator
      try {
        console.log('[Notifications] Loading AudioLab notifications for user:', userId)
        const projectsRef = collection(db, 'audiolab_projects')
        
        // Try with collaborators array-contains
        try {
          const q = query(projectsRef, where('collaborators', 'array-contains', userId), limit(20))
          const snapshot = await getDocs(q)
          console.log('[Notifications] Found', snapshot.docs.length, 'audiolab projects with collaborators')
          
          snapshot.docs.forEach(docSnap => {
            const project = docSnap.data()
            if (project.ownerId !== userId) {
              allNotifications.push({
                id: `audiolab-${docSnap.id}`, 
                title: 'Studio Collaboration',
                message: `You've been invited to collaborate on "${project.name || 'Untitled Project'}"`,
                sentAt: project.updatedAt?.toDate?.()?.toISOString() || project.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                type: 'audiolab', 
                projectId: docSnap.id, 
                projectName: project.name
              })
            }
          })
        } catch (collabError) {
          console.log('[Notifications] Collaborators query failed, trying sharedWith:', collabError)
          // Fallback: try sharedWith field
          const q2 = query(projectsRef, where('sharedWith', 'array-contains', userId), limit(20))
          const snapshot2 = await getDocs(q2)
          
          snapshot2.docs.forEach(docSnap => {
            const project = docSnap.data()
            if (project.ownerId !== userId) {
              allNotifications.push({
                id: `audiolab-${docSnap.id}`, 
                title: 'Studio Collaboration',
                message: `You've been invited to collaborate on "${project.name || 'Untitled Project'}"`,
                sentAt: project.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                type: 'audiolab', 
                projectId: docSnap.id, 
                projectName: project.name
              })
            }
          })
        }
      } catch (e) { console.error('AudioLab error:', e) }
      
      // 4. Calendar events - try multiple collections
      try {
        console.log('[Notifications] Loading calendar events for zone:', currentZone.id)
        const now = new Date()
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        
        // Try upcoming_events collection first (simpler query)
        try {
          const upcomingRef = collection(db, 'upcoming_events')
          const upcomingQuery = query(upcomingRef, where('zoneId', '==', currentZone.id), limit(20))
          const upcomingSnapshot = await getDocs(upcomingQuery)
          console.log('[Notifications] Found', upcomingSnapshot.docs.length, 'upcoming_events')
          
          upcomingSnapshot.forEach(docSnap => {
            const event = docSnap.data()
            const eventDate = new Date(event.date || event.eventDate || event.startDate)
            if (isNaN(eventDate.getTime())) return
            
            // Only show events within next 7 days
            if (eventDate >= now && eventDate <= nextWeek) {
              const daysUntil = Math.ceil((eventDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
              allNotifications.push({
                id: `calendar-upcoming-${docSnap.id}`,
                title: daysUntil === 0 ? 'Event Today!' : daysUntil === 1 ? 'Event Tomorrow' : `Event in ${daysUntil} days`,
                message: event.title || event.name || event.description || 'Upcoming event',
                sentAt: now.toISOString(), type: 'calendar', eventDate: event.date || event.eventDate
              })
            }
          })
        } catch (upcomingError) {
          console.log('[Notifications] upcoming_events query failed:', upcomingError)
        }
        
        // Also try calendar_events collection
        try {
          const calendarRef = collection(db, 'calendar_events')
          const calendarQuery = query(calendarRef, where('zoneId', '==', currentZone.id), limit(20))
          const calendarSnapshot = await getDocs(calendarQuery)
          console.log('[Notifications] Found', calendarSnapshot.docs.length, 'calendar_events')
          
          calendarSnapshot.forEach(docSnap => {
            const event = docSnap.data()
            const eventDate = new Date(event.date || event.eventDate || event.startDate)
            if (isNaN(eventDate.getTime())) return
            
            // Only show events within next 7 days
            if (eventDate >= now && eventDate <= nextWeek) {
              const daysUntil = Math.ceil((eventDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
              // Avoid duplicates
              const existingId = `calendar-upcoming-${docSnap.id}`
              if (!allNotifications.some(n => n.id === existingId)) {
                allNotifications.push({
                  id: `calendar-${docSnap.id}`,
                  title: daysUntil === 0 ? 'Event Today!' : daysUntil === 1 ? 'Event Tomorrow' : `Event in ${daysUntil} days`,
                  message: event.title || event.name || event.description || 'Upcoming event',
                  sentAt: now.toISOString(), type: 'calendar', eventDate: event.date || event.eventDate
                })
              }
            }
          })
        } catch (calendarError) {
          console.log('[Notifications] calendar_events query failed:', calendarError)
        }
        
        // Also try zone_praise_nights for rehearsals
        try {
          const rehearsalsRef = collection(db, 'zone_praise_nights')
          const rehearsalsQuery = query(rehearsalsRef, where('zoneId', '==', currentZone.id), limit(20))
          const rehearsalsSnapshot = await getDocs(rehearsalsQuery)
          console.log('[Notifications] Found', rehearsalsSnapshot.docs.length, 'zone_praise_nights')
          
          rehearsalsSnapshot.forEach(docSnap => {
            const rehearsal = docSnap.data()
            const eventDate = new Date(rehearsal.date || rehearsal.eventDate)
            if (isNaN(eventDate.getTime())) return
            
            // Only show rehearsals within next 7 days
            if (eventDate >= now && eventDate <= nextWeek) {
              const daysUntil = Math.ceil((eventDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
              allNotifications.push({
                id: `calendar-rehearsal-${docSnap.id}`,
                title: daysUntil === 0 ? 'Rehearsal Today!' : daysUntil === 1 ? 'Rehearsal Tomorrow' : `Rehearsal in ${daysUntil} days`,
                message: rehearsal.name || rehearsal.title || 'Upcoming rehearsal',
                sentAt: now.toISOString(), type: 'calendar', eventDate: rehearsal.date
              })
            }
          })
        } catch (rehearsalError) {
          console.log('[Notifications] zone_praise_nights query failed:', rehearsalError)
        }
      } catch (e) { console.log('Calendar skipped:', e) }
      
      // 5. Media uploads - check media_videos and admin_playlists
      try {
        console.log('[Notifications] Loading media notifications')
        const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        const { isHQGroup } = require('@/config/zones')
        const isHQ = isHQGroup(currentZone.id)
        
        // Check new videos (media_videos collection) - try with fallback
        try {
          const videosRef = collection(db, 'media_videos')
          let videosSnapshot
          
          try {
            // Try with orderBy first
            const videosQuery = query(videosRef, where('forHQ', '==', isHQ), orderBy('createdAt', 'desc'), limit(15))
            videosSnapshot = await getDocs(videosQuery)
          } catch (indexError) {
            // Fallback without orderBy
            console.log('[Notifications] Media videos index not ready, using fallback')
            const fallbackQuery = query(videosRef, where('forHQ', '==', isHQ), limit(30))
            videosSnapshot = await getDocs(fallbackQuery)
          }
          
          console.log('[Notifications] Found', videosSnapshot.docs.length, 'media videos')
          videosSnapshot.forEach(docSnap => {
            const video = docSnap.data()
            const createdAt = video.createdAt?.toDate?.() || new Date()
            if (createdAt >= lastWeek) {
              allNotifications.push({
                id: `media-video-${docSnap.id}`,
                title: 'New Video',
                message: video.title || 'New video uploaded',
                sentAt: createdAt.toISOString(), type: 'media', mediaType: 'video',
                mediaUrl: video.thumbnail
              })
            }
          })
        } catch (videoError) {
          console.log('[Notifications] Videos query failed:', videoError)
        }
        
        // Check new playlists (admin_playlists collection) - try with fallback
        try {
          const playlistsRef = collection(db, 'admin_playlists')
          let playlistsSnapshot
          
          try {
            // Try with compound query first
            const playlistsQuery = query(playlistsRef, where('forHQ', '==', isHQ), where('isPublic', '==', true), orderBy('createdAt', 'desc'), limit(10))
            playlistsSnapshot = await getDocs(playlistsQuery)
          } catch (indexError) {
            // Fallback: simpler query
            console.log('[Notifications] Playlists index not ready, using fallback')
            const fallbackQuery = query(playlistsRef, where('isPublic', '==', true), limit(20))
            playlistsSnapshot = await getDocs(fallbackQuery)
          }
          
          console.log('[Notifications] Found', playlistsSnapshot.docs.length, 'playlists')
          playlistsSnapshot.forEach(docSnap => {
            const playlist = docSnap.data()
            const createdAt = playlist.createdAt?.toDate?.() || new Date()
            // Filter by forHQ client-side if needed
            const matchesHQ = playlist.forHQ === isHQ || playlist.forHQ === undefined
            if (createdAt >= lastWeek && matchesHQ) {
              allNotifications.push({
                id: `media-playlist-${docSnap.id}`,
                title: 'New Playlist',
                message: `${playlist.name || 'New Playlist'} - ${playlist.videoIds?.length || 0} videos`,
                sentAt: createdAt.toISOString(), type: 'media', mediaType: 'video',
                mediaUrl: playlist.thumbnail
              })
            }
          })
        } catch (playlistError) {
          console.log('[Notifications] Playlists query failed:', playlistError)
        }
      } catch (e) { console.log('Media skipped:', e) }
      
      // 6. Song submissions - handle potential index issues
      try {
        const userEmail = user?.email || profile?.email
        if (userEmail) {
          const songNotifs = await getUserSongNotifications(userEmail)
          songNotifs.forEach((notif: SongNotification) => {
            allNotifications.push({
              id: `song-${notif.id}`,
              title: notif.type === 'approved' ? 'Song Approved' : notif.type === 'rejected' ? 'Song Rejected' : 'Song Reply',
              message: notif.message, sentAt: notif.createdAt, type: 'song',
              songStatus: notif.type as 'approved' | 'rejected' | 'replied', read: notif.read
            })
          })
        }
      } catch (e) { 
        console.log('Song notifications error:', e)
        // Fallback: try simpler query
        try {
          const userEmail = user?.email || profile?.email
          if (userEmail) {
            const notificationsRef = collection(db, 'song_notifications')
            const q = query(notificationsRef, where('submittedByEmail', '==', userEmail), limit(20))
            const snapshot = await getDocs(q)
            snapshot.forEach(docSnap => {
              const data = docSnap.data()
              if (['approved', 'rejected', 'replied'].includes(data.type)) {
                allNotifications.push({
                  id: `song-${docSnap.id}`,
                  title: data.type === 'approved' ? 'Song Approved' : data.type === 'rejected' ? 'Song Rejected' : 'Song Reply',
                  message: data.message, 
                  sentAt: data.createdAt || data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString(), 
                  type: 'song',
                  songStatus: data.type as 'approved' | 'rejected' | 'replied', 
                  read: data.read
                })
              }
            })
          }
        } catch (fallbackError) {
          console.log('Song notifications fallback also failed:', fallbackError)
        }
      }
      
      // 7. Chat messages - show chats with unread messages
      try {
        console.log('[Notifications] Loading chat notifications for user:', userId)
        const chatsRef = collection(db, 'chats_v2')
        const q = query(chatsRef, where('participants', 'array-contains', userId), limit(50))
        const snapshot = await getDocs(q)
        console.log('[Notifications] Found', snapshot.docs.length, 'chats')
        
        snapshot.docs.forEach(docSnap => {
          const chat = docSnap.data()
          const unreadCount = chat.unreadCount?.[userId] || 0
          
          // Show if there are unread messages
          if (unreadCount > 0) {
            const isGroup = chat.type === 'group'
            const lastSenderId = chat.lastMessage?.senderId
            let senderName = lastSenderId ? (chat.participantDetails?.[lastSenderId]?.name || 'Someone') : 'Someone'
            let chatName = chat.name || 'Chat'
            
            // For direct chats, get the other person's name
            if (!isGroup && chat.participantDetails) {
              const other = Object.entries(chat.participantDetails).find(([id]) => id !== userId)
              if (other) chatName = (other[1] as any).name || 'Chat'
            }
            
            let messagePreview = chat.lastMessage?.text || 'New message'
            if (messagePreview.startsWith('📷')) messagePreview = '📷 Photo'
            else if (messagePreview.startsWith('📄')) messagePreview = '📄 Document'
            else if (messagePreview.startsWith('📞')) messagePreview = '📞 Call'
            
            // Get timestamp
            let sentAt = new Date().toISOString()
            if (chat.lastMessage?.timestamp) {
              if (typeof chat.lastMessage.timestamp.toDate === 'function') {
                sentAt = chat.lastMessage.timestamp.toDate().toISOString()
              } else if (chat.lastMessage.timestamp instanceof Date) {
                sentAt = chat.lastMessage.timestamp.toISOString()
              } else if (chat.lastMessage.timestamp.seconds) {
                sentAt = new Date(chat.lastMessage.timestamp.seconds * 1000).toISOString()
              }
            }
            
            allNotifications.push({
              id: `chat-${docSnap.id}`, 
              title: isGroup ? chatName : (senderName !== 'Someone' ? senderName : chatName),
              message: isGroup ? `${senderName}: ${messagePreview}` : messagePreview,
              sentBy: senderName, 
              sentAt,
              type: 'chat', 
              chatId: docSnap.id, 
              chatName, 
              isGroup, 
              read: false,
              senderAvatar: lastSenderId ? chat.participantDetails?.[lastSenderId]?.avatar : undefined
            })
          }
        })
        console.log('[Notifications] Added', allNotifications.filter(n => n.type === 'chat').length, 'chat notifications')
      } catch (e) { console.error('Chat notifications error:', e) }
      
      allNotifications.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
      setNotifications(allNotifications)
    } catch (e) { console.error('Load error:', e) }
    finally { setLoading(false); setRefreshing(false) }
  }, [user?.uid, user?.email, profile?.id, profile?.email, currentZone?.id])

  useEffect(() => {
    const userId = user?.uid || profile?.id
    if (currentZone?.id && !zoneLoading && userId) loadNotifications()
  }, [currentZone?.id, zoneLoading, user?.uid, profile?.id, loadNotifications])

  // Real-time listener
  useEffect(() => {
    if (!currentZone?.id) return
    const { isHQGroup } = require('@/config/zones')
    const isHQ = isHQGroup(currentZone.id)
    const collectionName = isHQ ? 'admin_messages' : 'zone_admin_messages'
    const messagesRef = collection(db, collectionName)
    const q = isHQ 
      ? query(messagesRef, orderBy('createdAt', 'desc'), limit(20))
      : query(messagesRef, where('zoneId', '==', currentZone.id), orderBy('createdAt', 'desc'), limit(20))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.metadata.hasPendingWrites) loadNotifications()
    }, () => {})
    return () => unsubscribe()
  }, [currentZone?.id, loadNotifications])

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true
    if (filter === 'chat') return n.type === 'chat'
    if (filter === 'zone') return n.type === 'zone' || n.type === 'subgroup'
    if (filter === 'song') return n.type === 'song'
    if (filter === 'audiolab') return n.type === 'audiolab'
    if (filter === 'calendar') return n.type === 'calendar' || n.type === 'birthday'
    if (filter === 'media') return n.type === 'media'
    return true
  })

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
    const icons: Record<NotificationType, any> = {
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
      zone: 'bg-blue-100 text-blue-600', subgroup: 'bg-purple-100 text-purple-600',
      audiolab: 'bg-violet-100 text-violet-600', calendar: 'bg-amber-100 text-amber-600',
      birthday: 'bg-pink-100 text-pink-600', media: 'bg-emerald-100 text-emerald-600',
      song: 'bg-purple-100 text-purple-600', chat: 'bg-indigo-100 text-indigo-600'
    }
    return colors[type] || 'bg-gray-100 text-gray-600'
  }

  const handleClick = (notif: CombinedNotification) => {
    if (notif.type === 'audiolab' && notif.projectId) router.push(`/pages/audiolab?project=${notif.projectId}`)
    else if (notif.type === 'calendar') router.push('/pages/calendar')
    else if (notif.type === 'media') router.push('/pages/media')
    else if (notif.type === 'song') router.push('/pages/submit-song')
    else if (notif.type === 'chat') router.push(notif.chatId ? `/pages/groups?chat=${notif.chatId}` : '/pages/groups')
  }

  // Group by date
  const grouped = filteredNotifications.reduce((acc, notif) => {
    const date = new Date(notif.sentAt)
    const today = new Date()
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)
    let key = date.toDateString() === today.toDateString() ? 'Today'
      : date.toDateString() === yesterday.toDateString() ? 'Yesterday'
      : date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
    if (!acc[key]) acc[key] = []
    acc[key].push(notif)
    return acc
  }, {} as Record<string, CombinedNotification[]>)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 overflow-y-auto">
      <ScreenHeader
        title="Notifications"
        showMenuButton={false}
        leftButtons={
          <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-gray-100 active:scale-95 transition-all">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
        }
        rightButtons={
          <button onClick={() => loadNotifications(true)} disabled={refreshing}
            className="p-2 rounded-lg hover:bg-gray-100 active:scale-95 transition-all disabled:opacity-50">
            <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        }
      />

      <div className="pb-24 px-4 overflow-y-auto" style={{ height: 'calc(100vh - 60px)' }}>
        <div className="max-w-2xl mx-auto">
          {/* Filter Tabs - Horizontal Scroll */}
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
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                      filter === tab.id ? 'text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}
                    style={filter === tab.id ? { backgroundColor: zoneColor } : undefined}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {count > 0 && (
                      <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        filter === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                      }`}>{count}</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Notifications List */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
                    <div className="flex-1">
                      <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse mb-2" />
                      <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-2" />
                      <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No notifications</h3>
              <p className="text-gray-500 text-sm">
                {filter === 'all' ? "You're all caught up!" : `No ${filter} notifications yet`}
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
                      const isClickable = ['audiolab', 'calendar', 'media', 'song', 'chat'].includes(notif.type)
                      const isUnread = !notif.read && ['chat', 'song', 'subgroup'].includes(notif.type)
                      const isDeleting = deletingId === notif.id
                      
                      return (
                        <div key={notif.id} onClick={() => isClickable && handleClick(notif)}
                          className={`bg-white rounded-xl p-4 shadow-sm border transition-all relative group ${
                            isClickable ? 'cursor-pointer hover:shadow-md active:scale-[0.99]' : ''
                          } ${isUnread ? 'border-l-4' : 'border-gray-100'} ${isDeleting ? 'opacity-50' : ''}`}
                          style={isUnread ? { borderLeftColor: notif.type === 'chat' ? '#6366f1' : zoneColor } : undefined}
                        >
                          {/* Delete button */}
                          <button
                            onClick={(e) => handleDelete(notif, e)}
                            disabled={isDeleting}
                            className="absolute top-2 right-2 p-1.5 rounded-full text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all z-10"
                          >
                            {isDeleting ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                          
                          <div className="flex items-start gap-3">
                            {notif.type === 'chat' && notif.senderAvatar ? (
                              <img src={notif.senderAvatar} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                            ) : (
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                                <Icon className="w-5 h-5" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0 pr-6">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h3 className="font-semibold text-gray-900">{notif.title}</h3>
                                {notif.type === 'subgroup' && notif.subGroupName && (
                                  <span className="px-2 py-0.5 text-xs rounded-full" style={{ backgroundColor: `${zoneColor}15`, color: zoneColor }}>
                                    {notif.subGroupName}
                                  </span>
                                )}
                                {notif.type === 'audiolab' && <span className="px-2 py-0.5 bg-violet-100 text-violet-700 text-xs rounded-full">Studio</span>}
                                {notif.type === 'song' && notif.songStatus && (
                                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                                    notif.songStatus === 'approved' ? 'bg-green-100 text-green-700' :
                                    notif.songStatus === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-purple-100 text-purple-700'
                                  }`}>
                                    {notif.songStatus === 'approved' ? 'Approved' : notif.songStatus === 'rejected' ? 'Rejected' : 'Reply'}
                                  </span>
                                )}
                                {notif.type === 'chat' && (
                                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                                    {notif.isGroup ? 'Group' : 'Message'}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-700 mb-2 whitespace-pre-wrap line-clamp-2">{notif.message}</p>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                {notif.sentBy && notif.type !== 'chat' && <><span>{notif.sentBy}</span><span>•</span></>}
                                <span>{formatDate(notif.sentAt)}</span>
                                {isClickable && (
                                  <><span className="flex-1" /><span className="flex items-center gap-1" style={{ color: zoneColor }}>
                                    View <ChevronRight className="w-3 h-3" />
                                  </span></>
                                )}
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
