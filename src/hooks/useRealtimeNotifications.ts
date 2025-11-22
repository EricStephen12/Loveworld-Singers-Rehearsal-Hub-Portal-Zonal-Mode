import { useEffect, useState } from 'react';
import { FirebaseDatabaseService } from '@/lib/firebase-database';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase-setup';

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'rehearsal' | 'announcement' | 'reminder' | 'system' | 'admin' | 'song' | 'praise_night';
  priority: 'low' | 'medium' | 'high';
  sender_id?: string;
  sender_name?: string;
  action_url?: string;
  created_at: string;
  read_at?: string;
  is_read: boolean;
  target_audience: 'all' | 'group' | 'individual';
  target_group?: string;
  target_user_id?: string;
}

export function useRealtimeNotifications() {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, profile } = useAuth();

  // Load notifications with real-time updates
  useEffect(() => {
    if (!user?.uid) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    console.log('🔔 Setting up Firebase notifications listener for user:', user.uid);
    setLoading(true);

    // Query notifications for this user
    // Get notifications where:
    // 1. target_audience = 'all' OR
    // 2. target_audience = 'individual' AND target_user_id = user.uid OR
    // 3. target_audience = 'group' AND target_group matches user's group

    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      orderBy('created_at', 'desc')
    );

    // Set up real-time listener
    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        console.log('📬 Received notifications update:', snapshot.size, 'notifications');

        const allNotifications = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as NotificationData));

        // Filter notifications for current user
        const userNotifications = allNotifications.filter(notif => {
          // All users notification
          if (notif.target_audience === 'all') return true;

          // Individual notification
          if (notif.target_audience === 'individual' && notif.target_user_id === user.uid) return true;

          // Group notification - check if user is in the group
          if (notif.target_audience === 'group' && notif.target_group && profile) {
            // Check user's groups from profile or user_groups collection
            return checkUserInGroup(notif.target_group);
          }

          return false;
        });

        // Load read status for each notification
        loadReadStatus(userNotifications);
      },
      (err) => {
        console.error('❌ Error in notifications listener:', err);
        setError('Failed to load notifications');
        setLoading(false);
      }
    );

    return () => {
      console.log('🔕 Cleaning up notifications listener');
      unsubscribe();
    };
  }, [user?.uid, profile]);

  // Check if user is in a specific group
  const checkUserInGroup = async (groupName: string): Promise<boolean> => {
    if (!user?.uid) return false;

    try {
      const userGroups = await FirebaseDatabaseService.getCollectionWhere('user_groups', 'user_id', '==', user.uid);
      return userGroups.some((ug: any) => ug.group_name === groupName);
    } catch (error) {
      console.error('Error checking user group:', error);
      return false;
    }
  };

  // Load read status for notifications
  const loadReadStatus = async (notifs: NotificationData[]) => {
    if (!user?.uid) return;

    try {
      // Get user's read notifications
      const readNotifications = await FirebaseDatabaseService.getCollectionWhere(
        'user_notifications',
        'user_id',
        '==',
        user.uid
      );

      const readMap = new Map(
        readNotifications.map((rn: any) => [rn.notification_id, rn.read_at])
      );

      // Update notifications with read status
      const updatedNotifications = notifs.map(notif => ({
        ...notif,
        is_read: readMap.has(notif.id),
        read_at: readMap.get(notif.id) || undefined
      }));

      setNotifications(updatedNotifications);
      setLoading(false);
    } catch (err) {
      console.error('❌ Error loading read status:', err);
      setNotifications(notifs);
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!user?.uid) return false;

    try {
      console.log('✅ Marking notification as read:', notificationId);

      // Create or update user_notification record
      const userNotificationId = `${user.uid}_${notificationId}`;
      await FirebaseDatabaseService.createDocument('user_notifications', userNotificationId, {
        user_id: user.uid,
        notification_id: notificationId,
        read_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      });

      // Update local state immediately
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
        )
      );

      return true;
    } catch (err) {
      console.error('❌ Error marking notification as read:', err);
      return false;
    }
  };

  const markAllAsRead = async () => {
    if (!user?.uid) return false;

    try {
      console.log('✅ Marking all notifications as read');
      const unreadNotifications = notifications.filter(n => !n.is_read);

      for (const notification of unreadNotifications) {
        await markAsRead(notification.id);
      }

      return true;
    } catch (err) {
      console.error('❌ Error marking all notifications as read:', err);
      return false;
    }
  };

  const deleteNotification = async (notificationId: string) => {
    if (!user?.uid) return false;

    try {
      console.log('🗑️ Deleting notification:', notificationId);

      // Mark as read first
      await markAsRead(notificationId);

      // Remove from local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId));

      return true;
    } catch (err) {
      console.error('❌ Error deleting notification:', err);
      return false;
    }
  };

  const refresh = async () => {
    // Refresh is handled automatically by the real-time listener
    console.log('🔄 Notifications refresh triggered (handled by real-time listener)');
  };

  return {
    notifications,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh
  };
}

// Hook for admins to create notifications
export function useNotificationActions() {
  const { user } = useAuth();

  const createNotificationForAll = async (data: {
    title: string;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    category?: 'rehearsal' | 'announcement' | 'reminder' | 'system' | 'admin' | 'song' | 'praise_night';
    priority?: 'low' | 'medium' | 'high';
    actionUrl?: string;
    expiresAt?: string;
  }) => {
    try {
      console.log('📢 Creating notification for all users:', data.title);

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
        created_at: new Date().toISOString(),
        is_read: false
      };

      // Create notification in Firebase
      const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await FirebaseDatabaseService.createDocument('notifications', notificationId, notificationData);

      console.log('✅ Notification created successfully:', notificationId);
      return { success: true, notificationId };
    } catch (err) {
      console.error('❌ Error creating notification:', err);
      return { success: false, error: 'Failed to create notification' };
    }
  };

  const createNotificationForGroup = async (data: {
    title: string;
    message: string;
    groupName: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    category?: 'rehearsal' | 'announcement' | 'reminder' | 'system' | 'admin' | 'song' | 'praise_night';
    priority?: 'low' | 'medium' | 'high';
    actionUrl?: string;
    expiresAt?: string;
  }) => {
    try {
      console.log('📢 Creating notification for group:', data.groupName);

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
        created_at: new Date().toISOString(),
        is_read: false
      };

      // Create notification in Firebase
      const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await FirebaseDatabaseService.createDocument('notifications', notificationId, notificationData);

      console.log('✅ Group notification created successfully:', notificationId);
      return { success: true, notificationId };
    } catch (err) {
      console.error('❌ Error creating group notification:', err);
      return { success: false, error: 'Failed to create group notification' };
    }
  };

  const createNotificationForUser = async (data: {
    title: string;
    message: string;
    targetUserId: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    category?: 'rehearsal' | 'announcement' | 'reminder' | 'system' | 'admin' | 'song' | 'praise_night';
    priority?: 'low' | 'medium' | 'high';
    actionUrl?: string;
  }) => {
    try {
      console.log('📢 Creating notification for user:', data.targetUserId);

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
        created_at: new Date().toISOString(),
        is_read: false
      };

      // Create notification in Firebase
      const notificationId = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await FirebaseDatabaseService.createDocument('notifications', notificationId, notificationData);

      console.log('✅ User notification created successfully:', notificationId);
      return { success: true, notificationId };
    } catch (err) {
      console.error('❌ Error creating user notification:', err);
      return { success: false, error: 'Failed to create user notification' };
    }
  };

  return {
    createNotificationForAll,
    createNotificationForGroup,
    createNotificationForUser
  };
}

