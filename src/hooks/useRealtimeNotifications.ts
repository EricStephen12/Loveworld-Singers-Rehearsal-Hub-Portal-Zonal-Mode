import { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore'

import { FirebaseDatabaseService } from '@/lib/firebase-database'
import { db } from '@/lib/firebase-setup'
import { isHQGroup } from '@/config/zones'
import { useAuth } from '@/hooks/useAuth'
import { useZone } from '@/hooks/useZone'

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

function getNotificationCollectionName(zoneId?: string): string {
  return zoneId && isHQGroup(zoneId) ? 'notifications' : 'zone_notifications'
}

export function useRealtimeNotifications() {
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, profile } = useAuth()
  const { currentZone } = useZone()

  useEffect(() => {
    if (!user?.uid || !currentZone) {
      setNotifications([])
      setLoading(false)
      return
    }

    setLoading(true)

    const collectionName = getNotificationCollectionName(currentZone.id)
    const notificationsRef = collection(db, collectionName)

    // Limit to 50 most recent for performance
    const q = currentZone.id && !isHQGroup(currentZone.id)
      ? query(notificationsRef, where('zoneId', '==', currentZone.id), orderBy('created_at', 'desc'), limit(50))
      : query(notificationsRef, orderBy('created_at', 'desc'), limit(50))

    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const allNotifications = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as NotificationData))

        const userNotifications = allNotifications.filter(notif => {
          if (notif.target_audience === 'all') return true
          if (notif.target_audience === 'individual' && notif.target_user_id === user.uid) return true
          if (notif.target_audience === 'group' && notif.target_group && profile) {
            return checkUserInGroup(notif.target_group)
          }
          return false
        })

        loadReadStatus(userNotifications)
      },
      (err) => {
        console.error('Error in notifications listener:', err)
        setError('Failed to load notifications')
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [user?.uid, profile, currentZone?.id])

  const checkUserInGroup = async (groupName: string): Promise<boolean> => {
    if (!user?.uid) return false
    try {
      const userGroups = await FirebaseDatabaseService.getCollectionWhere('user_groups', 'user_id', '==', user.uid)
      return userGroups.some((ug: any) => ug.group_name === groupName)
    } catch (error) {
      console.error('Error checking user group:', error)
      return false
    }
  }

  const loadReadStatus = async (notifs: NotificationData[]) => {
    if (!user?.uid) return

    try {
      const readNotifications = await FirebaseDatabaseService.getCollectionWhere(
        'user_notifications',
        'user_id',
        '==',
        user.uid
      )

      const readMap = new Map(
        readNotifications.map((rn: any) => [rn.notification_id, rn.read_at])
      )

      const updatedNotifications = notifs.map(notif => ({
        ...notif,
        is_read: readMap.has(notif.id),
        read_at: readMap.get(notif.id) || undefined
      }))

      setNotifications(updatedNotifications)
      setLoading(false)
    } catch (err) {
      console.error('Error loading read status:', err)
      setNotifications(notifs)
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    if (!user?.uid) return false

    try {
      const userNotificationId = `${user.uid}_${notificationId}`
      await FirebaseDatabaseService.createDocument('user_notifications', userNotificationId, {
        user_id: user.uid,
        notification_id: notificationId,
        read_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      })

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
        )
      )

      return true
    } catch (err) {
      console.error('Error marking notification as read:', err)
      return false
    }
  }

  const markAllAsRead = async () => {
    if (!user?.uid) return false

    try {
      const unreadNotifications = notifications.filter(n => !n.is_read)
      for (const notification of unreadNotifications) {
        await markAsRead(notification.id)
      }
      return true
    } catch (err) {
      console.error('Error marking all notifications as read:', err)
      return false
    }
  }

  const deleteNotification = async (notificationId: string) => {
    if (!user?.uid) return false

    try {
      await markAsRead(notificationId)
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      return true
    } catch (err) {
      console.error('Error deleting notification:', err)
      return false
    }
  }

  const refresh = async () => {
    // Handled automatically by real-time listener
  }

  return {
    notifications,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh
  }
}

export function useNotificationActions() {
  const { user } = useAuth()
  const { currentZone } = useZone()

  const createNotificationForAll = async (data: {
    title: string
    message: string
    type?: 'info' | 'success' | 'warning' | 'error'
    category?: 'rehearsal' | 'announcement' | 'reminder' | 'system' | 'admin' | 'song' | 'praise_night'
    priority?: 'low' | 'medium' | 'high'
    actionUrl?: string
    expiresAt?: string
  }) => {
    try {
      const collectionName = getNotificationCollectionName(currentZone?.id)

      const notificationData = {
        title: data.title,
        message: data.message,
        type: data.type || 'info',
        category: data.category || 'system',
        priority: data.priority || 'medium',
        sender_id: user?.uid || 'system',
        sender_name: user?.email || 'System',
        action_url: data.actionUrl || null,
        target_audience: 'all',
        zoneId: currentZone?.id || '',
        created_at: new Date().toISOString(),
        is_read: false
      }

      const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      await FirebaseDatabaseService.createDocument(collectionName, notificationId, notificationData)

      // Trigger FCM for All
      try {
        const membersCollection = currentZone?.id && isHQGroup(currentZone.id) ? 'hq_members' : 'zone_members'
        const snapshot = await FirebaseDatabaseService.getCollection(membersCollection, 500)
        const recipientIds = snapshot.map((m: any) => m.userId || m.id).filter(Boolean)

        if (recipientIds.length > 0) {
          await fetch('/api/send-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'zone',
              recipientIds,
              title: `📢 ${data.title}`,
              body: data.message,
              data: { notificationId, zoneId: currentZone?.id || '' }
            })
          });
        }
      } catch (fcmError) {
        console.error('FCM Error (All):', fcmError);
      }

      return { success: true, notificationId }
    } catch (err) {
      console.error('Error creating notification:', err)
      return { success: false, error: 'Failed to create notification' }
    }
  }

  const createNotificationForGroup = async (data: {
    title: string
    message: string
    groupName: string
    type?: 'info' | 'success' | 'warning' | 'error'
    category?: 'rehearsal' | 'announcement' | 'reminder' | 'system' | 'admin' | 'song' | 'praise_night'
    priority?: 'low' | 'medium' | 'high'
    actionUrl?: string
    expiresAt?: string
  }) => {
    try {
      const collectionName = getNotificationCollectionName(currentZone?.id)

      const notificationData = {
        title: data.title,
        message: data.message,
        type: data.type || 'info',
        category: data.category || 'system',
        priority: data.priority || 'medium',
        sender_id: user?.uid || 'system',
        sender_name: user?.email || 'System',
        action_url: data.actionUrl || null,
        target_audience: 'group',
        target_group: data.groupName,
        zoneId: currentZone?.id || '',
        created_at: new Date().toISOString(),
        is_read: false
      }

      const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      await FirebaseDatabaseService.createDocument(collectionName, notificationId, notificationData)

      // Trigger FCM for Group
      try {
        // Fetch group members first
        const groupMembers = await FirebaseDatabaseService.getCollectionWhere('user_groups', 'group_name', '==', data.groupName);
        const recipientIds = groupMembers.map((gm: any) => gm.user_id).filter(Boolean);

        if (recipientIds.length > 0) {
          await fetch('/api/send-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'zone',
              recipientIds,
              title: `📢 ${data.title}`,
              body: data.message,
              data: { notificationId, groupName: data.groupName }
            })
          });
        }
      } catch (fcmError) {
        console.error('FCM Error (Group):', fcmError);
      }

      return { success: true, notificationId }
    } catch (err) {
      console.error('Error creating group notification:', err)
      return { success: false, error: 'Failed to create group notification' }
    }
  }

  const createNotificationForUser = async (data: {
    title: string
    message: string
    targetUserId: string
    type?: 'info' | 'success' | 'warning' | 'error'
    category?: 'rehearsal' | 'announcement' | 'reminder' | 'system' | 'admin' | 'song' | 'praise_night'
    priority?: 'low' | 'medium' | 'high'
    actionUrl?: string
  }) => {
    try {
      const collectionName = getNotificationCollectionName(currentZone?.id)

      const notificationData = {
        title: data.title,
        message: data.message,
        type: data.type || 'info',
        category: data.category || 'system',
        priority: data.priority || 'medium',
        sender_id: user?.uid || 'system',
        sender_name: user?.email || 'System',
        action_url: data.actionUrl || null,
        target_audience: 'individual',
        target_user_id: data.targetUserId,
        zoneId: currentZone?.id || '',
        created_at: new Date().toISOString(),
        is_read: false
      }

      const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      await FirebaseDatabaseService.createDocument(collectionName, notificationId, notificationData)

      // Trigger FCM for User
      try {
        await fetch('/api/send-notification', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'zone',
            recipientIds: [data.targetUserId],
            title: `📢 ${data.title}`,
            body: data.message,
            data: { notificationId }
          })
        });
      } catch (fcmError) {
        console.error('FCM Error (User):', fcmError);
      }

      return { success: true, notificationId }
    } catch (err) {
      console.error('Error creating user notification:', err)
      return { success: false, error: 'Failed to create user notification' }
    }
  }

  return {
    createNotificationForAll,
    createNotificationForGroup,
    createNotificationForUser
  }
}
