"use client";

import React, { useState } from 'react';
import { Bell, Search, X, Clock, Megaphone, Trash2, RefreshCw, ChevronDown } from 'lucide-react';
import { useRealtimeNotifications, useNotificationActions } from '@/hooks/useRealtimeNotifications';
import { FirebaseDatabaseService } from '@/lib/firebase-database';
import { useAdminTheme } from './AdminThemeProvider';
import CustomLoader from '@/components/CustomLoader';

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
  const [displayLimit, setDisplayLimit] = useState(20); // Show 20 initially

  const { notifications, loading, error, markAsRead, markAllAsRead, deleteNotification } = useRealtimeNotifications();
  const { createNotificationForAll, createNotificationForGroup } = useNotificationActions();

  // Fetch available groups - OPTIMIZED: Use cached groups or fetch limited data
  React.useEffect(() => {
    const fetchGroups = async () => {
      try {
        // Check localStorage cache first (groups don't change often)
        const cached = localStorage.getItem('lwsrh-groups-cache');
        if (cached) {
          const { groups, timestamp } = JSON.parse(cached);
          // Cache valid for 30 minutes
          if (Date.now() - timestamp < 30 * 60 * 1000) {
            setAvailableGroups(groups);
            return;
          }
        }

        // Fetch groups from a dedicated groups collection if available, or use predefined list
        // This avoids fetching ALL profiles just to get group names
        const predefinedGroups = ['soprano', 'alto', 'tenor', 'bass', 'instrumentalists', 'choir', 'worship team'];
        setAvailableGroups(predefinedGroups);

        // Cache the groups
        localStorage.setItem('lwsrh-groups-cache', JSON.stringify({
          groups: predefinedGroups,
          timestamp: Date.now()
        }));
      } catch (error) {
        console.error('Error fetching groups:', error);
        // Fallback to predefined groups
        setAvailableGroups(['soprano', 'alto', 'tenor', 'bass']);
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

  // Toast helper
  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    // Create a simple toast notification
    const toast = document.createElement('div');
    toast.className = `fixed bottom-20 left-1/2 transform -translate-x-1/2 px-4 py-3 rounded-xl shadow-lg z-[100] text-sm font-medium transition-all ${type === 'success' ? 'bg-green-500 text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
          type === 'warning' ? 'bg-yellow-500 text-white' :
            'bg-gray-800 text-white'
      }`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  };

  const handleSendNotification = async () => {
    if (!notifTitle.trim() || !notifMessage.trim()) {
      showToast('Please enter both title and message', 'warning');
      return;
    }

    if (modalType === 'group' && !notifGroup.trim()) {
      showToast('Please select a group', 'warning');
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
        showToast(modalType === 'all' ? '✅ Notification sent to all users!' : `✅ Notification sent to ${notifGroup} group!`, 'success');
        closeModal();
      } else {
        showToast('❌ Failed to send notification: ' + result.error, 'error');
      }
    } catch (error) {
      showToast('❌ Error sending notification', 'error');
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);

  const handleDeleteAll = async () => {
    setIsDeleting(true);
    try {
      let deleted = 0;
      for (const notif of notifications) {
        await FirebaseDatabaseService.deleteDocument('notifications', notif.id);
        deleted++;
      }

      showToast(`✅ ${deleted} notifications deleted!`, 'success');
      setShowDeleteAllConfirm(false);
    } catch (error) {
      console.error('Error deleting notifications:', error);
      showToast('❌ Failed to delete notifications', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <CustomLoader message="Loading notifications..." />
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
    <div className="flex-1 flex flex-col overflow-hidden bg-white lg:bg-transparent">
      {/* Header - Hidden on mobile (shown in AdminMobileHeader) */}
      <div className="hidden lg:block flex-shrink-0 p-6">
        <div className="flex items-center gap-3">
          <Bell className={`w-5 h-5 ${theme.text} flex-shrink-0`} />
          <h2 className="text-2xl font-semibold text-gray-900 flex-1">Notifications</h2>
          {unreadCount > 0 && (
            <span className={`${theme.primary} text-white text-xs px-2.5 py-1 rounded-full font-medium`}>
              {unreadCount}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-1 ml-8">
          Send messages to users
        </p>
      </div>

      {/* Mobile content wrapper */}
      <div className="flex-1 flex flex-col overflow-hidden p-4 lg:px-6 lg:py-0 space-y-4">

        {/* Admin Controls - Clean card design */}
        <div className="flex-shrink-0 bg-white border border-gray-100 rounded-2xl lg:rounded-lg overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 px-4 py-3 border-b border-gray-100">
            <h3 className="text-gray-900 font-semibold text-sm flex items-center gap-2">
              <Megaphone className={`w-4 h-4 ${theme.text}`} />
              Send Notification
            </h3>
          </div>
          <div className="p-4 grid grid-cols-3 gap-2">
            <button
              onClick={() => openModal('all')}
              className={`${theme.primary} text-white py-2.5 px-3 rounded-xl ${theme.primaryHover} transition-all active:scale-95 font-medium flex flex-col items-center justify-center gap-1 text-xs`}
            >
              <span className="text-lg">📢</span>
              <span>All</span>
            </button>
            <button
              onClick={() => openModal('group')}
              className={`${theme.primary} text-white py-2.5 px-3 rounded-xl ${theme.primaryHover} transition-all active:scale-95 font-medium flex flex-col items-center justify-center gap-1 text-xs`}
            >
              <span className="text-lg">👥</span>
              <span>Group</span>
            </button>
            <button
              onClick={() => setShowDeleteAllConfirm(true)}
              disabled={isDeleting}
              className="bg-white border border-red-200 text-red-600 py-2.5 px-3 rounded-xl hover:bg-red-50 transition-all active:scale-95 font-medium flex flex-col items-center justify-center gap-1 text-xs disabled:opacity-50"
            >
              {isDeleting ? (
                <CustomLoader size="sm" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              <span>{isDeleting ? '...' : 'Clear'}</span>
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
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 lg:bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        {/* Quick Actions */}
        {unreadCount > 0 && (
          <div className="flex items-center justify-between bg-purple-50 border border-purple-100 rounded-xl p-3">
            <span className="text-sm text-purple-700 font-medium">{unreadCount} unread</span>
            <button
              onClick={markAllAsRead}
              className={`${theme.text} font-semibold text-sm hover:underline`}
            >
              Mark all read
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 bg-white rounded-2xl lg:rounded-lg border border-gray-100 lg:border-gray-200 overflow-auto shadow-sm">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12 px-6">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">No notifications</h3>
              <p className="text-sm text-gray-500 max-w-xs mx-auto">
                {searchTerm ? 'No notifications match your search.' : 'Send your first notification to users!'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.slice(0, displayLimit).map((notification) => {
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

              {/* Load More Button */}
              {filteredNotifications.length > displayLimit && (
                <div className="p-4 text-center border-t border-gray-100">
                  <button
                    onClick={() => setDisplayLimit(prev => prev + 20)}
                    className={`px-6 py-2 ${theme.text} hover:bg-purple-50 rounded-lg transition-colors font-medium flex items-center gap-2 mx-auto`}
                  >
                    <ChevronDown className="w-4 h-4" />
                    Load More ({filteredNotifications.length - displayLimit} remaining)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Send Notification Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[80] p-4">
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
                    <div className="text-sm text-gray-400 py-2 flex items-center gap-2">
                      <CustomLoader size="sm" />
                      <span>Loading groups...</span>
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
                    <CustomLoader size="sm" />
                    <span className="ml-2">Sending...</span>
                  </>
                ) : (
                  'Send Notification'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete All Confirmation Modal */}
      {showDeleteAllConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[80] p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Clear All Notifications</h3>
                <p className="text-sm text-gray-500">This cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete all {notifications.length} notifications?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteAllConfirm(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAll}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <CustomLoader size="sm" />
                    <span className="ml-2">Deleting...</span>
                  </>
                ) : (
                  'Delete All'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

