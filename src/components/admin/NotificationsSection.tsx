"use client";

import React, { useState } from 'react';
import { Bell, Search, X, Clock, Megaphone, Trash2 } from 'lucide-react';
import { useRealtimeNotifications, useNotificationActions } from '@/hooks/useRealtimeNotifications';
import { FirebaseDatabaseService } from '@/lib/firebase-database';
import { useAdminTheme } from './AdminThemeProvider';

export default function NotificationsSection() {
  const { theme } = useAdminTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'all' | 'group'>('all');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifGroup, setNotifGroup] = useState('');
  const [sending, setSending] = useState(false);
  const [availableGroups, setAvailableGroups] = useState<string[]>([]);

  const { notifications, loading, error, markAsRead, markAllAsRead, deleteNotification } = useRealtimeNotifications();
  const { createNotificationForAll, createNotificationForGroup } = useNotificationActions();

  // Fetch available groups from Firebase profiles
  React.useEffect(() => {
    const fetchGroups = async () => {
      try {
        const profiles = await FirebaseDatabaseService.getCollection('profiles');
        const groups = new Set<string>();

        profiles.forEach((profile: any) => {
          if (profile.group && profile.group.trim()) {
            groups.add(profile.group.toLowerCase().trim());
          }
        });

        setAvailableGroups(Array.from(groups).sort());
      } catch (error) {
        console.error('Error fetching groups:', error);
      }
    };

    fetchGroups();
  }, []);

  // Filter notifications based on search
  const filteredNotifications = React.useMemo(() => {
    let filtered = notifications;

    if (searchTerm) {
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [notifications, searchTerm]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getCategoryStyle = (category: string) => {
    switch (category) {
      case 'rehearsal':
        return { bg: theme.primaryLight, text: theme.text, icon: '📅' };
      case 'song':
        return { bg: theme.primaryLight, text: theme.text, icon: '🎵' };
      case 'praise_night':
        return { bg: theme.primaryLight, text: theme.text, icon: '✨' };
      case 'announcement':
        return { bg: theme.primaryLight, text: theme.text, icon: '📢' };
      case 'admin':
        return { bg: theme.primaryLight, text: theme.text, icon: '👤' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-600', icon: 'ℹ️' };
    }
  };

  const openModal = (type: 'all' | 'group') => {
    setModalType(type);
    setNotifTitle('');
    setNotifMessage('');
    setNotifGroup('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setNotifTitle('');
    setNotifMessage('');
    setNotifGroup('');
  };

  const handleSendNotification = async () => {
    if (!notifTitle.trim() || !notifMessage.trim()) {
      alert('Please enter both title and message');
      return;
    }

    if (modalType === 'group' && !notifGroup.trim()) {
      alert('Please enter group name');
      return;
    }

    setSending(true);

    try {
      let result;
      if (modalType === 'all') {
        result = await createNotificationForAll({
          title: notifTitle,
          message: notifMessage,
          type: 'info',
          category: 'admin',
          priority: 'medium'
        });
      } else {
        result = await createNotificationForGroup({
          title: notifTitle,
          message: notifMessage,
          groupName: notifGroup,
          type: 'info',
          category: 'admin',
          priority: 'medium'
        });
      }

      if (result.success) {
        alert(modalType === 'all' ? '✅ Notification sent to all users!' : `✅ Notification sent to ${notifGroup} group!`);
        closeModal();
      } else {
        alert('❌ Failed to send notification: ' + result.error);
      }
    } catch (error) {
      alert('❌ Error sending notification');
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteAll = async () => {
    if (confirm('⚠️ Delete ALL notifications? This cannot be undone!')) {
      try {
        const allNotifications = await FirebaseDatabaseService.getCollection('notifications');
        
        for (const notif of allNotifications) {
          await FirebaseDatabaseService.deleteDocument('notifications', notif.id);
        }
        
        alert('✅ All notifications deleted!');
        window.location.reload();
      } catch (error) {
        console.error('Error deleting notifications:', error);
        alert('❌ Failed to delete notifications');
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-7 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse"></div>
        </div>

        {/* Admin Controls Skeleton */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* Search Bar Skeleton */}
        <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>

        {/* Notifications List Skeleton */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="h-5 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error loading notifications: {error}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden p-4 lg:p-6 space-y-4">
      {/* Header */}
      <div className="flex-shrink-0">
        <div className="flex items-center gap-3">
          <Bell className={`w-5 h-5 ${theme.text} flex-shrink-0`} />
          <h2 className="text-xl lg:text-2xl font-semibold text-gray-900 flex-1">Notifications</h2>
          {unreadCount > 0 && (
            <span className={`${theme.primary} text-white text-xs px-2.5 py-1 rounded-full font-medium`}>
              {unreadCount}
            </span>
          )}
        </div>
        <p className="text-xs lg:text-sm text-gray-600 mt-1 ml-8">
          Send messages to users
        </p>
      </div>

      {/* Admin Controls */}
      <div className="flex-shrink-0 bg-white border border-gray-200 rounded-lg p-4 lg:p-6">
        <h3 className="text-gray-900 font-semibold text-sm lg:text-base mb-3 lg:mb-4 flex items-center gap-2">
          <Megaphone className={`w-4 h-4 lg:w-5 lg:h-5 ${theme.text}`} />
          Send Notification
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 lg:gap-3">
          <button
            onClick={() => openModal('all')}
            className={`${theme.primary} text-white py-2 px-3 lg:py-2.5 lg:px-4 rounded-lg ${theme.primaryHover} transition-colors font-medium flex items-center justify-center gap-2 text-sm`}
          >
            <span className="hidden sm:inline">📢</span> All
          </button>
          <button
            onClick={() => openModal('group')}
            className={`${theme.primary} text-white py-2 px-3 lg:py-2.5 lg:px-4 rounded-lg ${theme.primaryHover} transition-colors font-medium flex items-center justify-center gap-2 text-sm`}
          >
            <span className="hidden sm:inline">👥</span> Group
          </button>
          <button
            onClick={handleDeleteAll}
            className="bg-white border border-red-300 text-red-600 py-2 px-3 lg:py-2.5 lg:px-4 rounded-lg hover:bg-red-50 transition-colors font-medium flex items-center justify-center gap-2 text-sm"
          >
            <Trash2 className="w-3 h-3 lg:w-4 lg:h-4" />
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search notifications..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
        />
      </div>

      {/* Quick Actions */}
      {unreadCount > 0 && (
        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3">
          <span className="text-sm text-gray-600">{unreadCount} unread notifications</span>
          <button
            onClick={markAllAsRead}
            className={`${theme.text} hover:${theme.text.replace('600', '700')} font-medium text-sm`}
          >
            Mark all as read
          </button>
        </div>
      )}

      {/* Notifications List */}
      <div className="flex-1 bg-white rounded-lg border border-gray-200 overflow-auto">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-900 mb-1">No notifications</h3>
            <p className="text-sm text-gray-500">
              {searchTerm ? 'No notifications match your search.' : 'Send your first notification to users!'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => {
              const categoryStyle = getCategoryStyle(notification.category);
              return (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${!notification.is_read ? 'bg-purple-50' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-lg ${categoryStyle.bg} flex items-center justify-center flex-shrink-0`}>
                      <span className="text-lg">{categoryStyle.icon}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900 text-sm">{notification.title}</h4>
                            {!notification.is_read && (
                              <div className={`w-2 h-2 ${theme.primary} rounded-full flex-shrink-0`} />
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{notification.message}</p>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTimestamp(notification.created_at)}
                            </span>
                            <span className="text-xs text-gray-500">
                              • {notification.target_audience === 'all' ? 'All Users' : notification.target_group || 'Individual'}
                            </span>
                          </div>
                        </div>

                        {/* Delete Button */}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Send Notification Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Modal Header */}
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {modalType === 'all' ? '📢 Send to All Users' : '👥 Send to Group'}
              </h3>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4 space-y-4">
              {/* Title Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  placeholder="e.g., New Song Added"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
                />
              </div>

              {/* Message Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  placeholder="e.g., We added Amazing Grace for tomorrow's rehearsal"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 resize-none"
                />
              </div>

              {/* Group Select (only for group type) */}
              {modalType === 'group' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Group
                  </label>
                  {availableGroups.length > 0 ? (
                    <select
                      value={notifGroup}
                      onChange={(e) => setNotifGroup(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600"
                    >
                      <option value="">-- Select a group --</option>
                      {availableGroups.map((group) => (
                        <option key={group} value={group}>
                          {group.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-sm text-gray-500 py-2">
                      Loading groups...
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Select the group to send notification to
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={closeModal}
                disabled={sending}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSendNotification}
                disabled={sending}
                className={`px-4 py-2 ${theme.primary} text-white rounded-lg ${theme.primaryHover} transition-colors font-medium disabled:opacity-50 flex items-center gap-2`}
              >
                {sending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Notification'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

