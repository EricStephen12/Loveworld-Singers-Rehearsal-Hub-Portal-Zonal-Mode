"use client";

import React, { useState, useEffect } from 'react';
import { Bell, Send, Trash2, MessageSquare, X } from 'lucide-react';
import { sendMessageToAllUsers, getAllMessages, deleteMessage, AdminMessage } from '@/lib/simple-notifications-service';
import { useAuth } from '@/hooks/useAuth';
import { useZone } from '@/hooks/useZone';
import { useAdminTheme } from './AdminThemeProvider';

export default function SimpleNotificationsSection() {
  const { user } = useAuth();
  const { currentZone } = useZone();
  const { theme } = useAdminTheme();
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  // Load messages when zone changes
  useEffect(() => {
    if (currentZone) {
      loadMessages();
    }
  }, [currentZone]);

  const loadMessages = async () => {
    setLoading(true);
    const msgs = await getAllMessages(currentZone?.id);
    setMessages(msgs);
    setLoading(false);
  };

  const handleSendMessage = async () => {
    if (!title.trim() || !message.trim()) {
      alert('Please fill in both title and message');
      return;
    }

    if (!user) {
      alert('You must be logged in to send messages');
      return;
    }

    setSending(true);

    try {
      const result = await sendMessageToAllUsers(
        title,
        message,
        user.displayName || user.email || 'Admin',
        currentZone?.id
      );

      if (result.success) {
        alert('✅ Message sent to all users in your zone!');
        setTitle('');
        setMessage('');
        setShowModal(false);
        loadMessages(); // Refresh list
      } else {
        alert('❌ Failed to send message: ' + result.error);
      }
    } catch (error) {
      alert('❌ Error sending message');
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) {
      return;
    }

    const result = await deleteMessage(messageId, currentZone?.id);

    if (result.success) {
      alert('✅ Message deleted!');
      loadMessages(); // Refresh list
    } else {
      alert('❌ Failed to delete message: ' + result.error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Messages to Users</h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Send messages that all users will see in their notifications
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 ${theme.primary} text-white rounded-lg ${theme.primaryHover} transition-colors font-medium whitespace-nowrap w-full sm:w-auto`}
        >
          <Send className="w-4 h-4" />
          Send Message
        </button>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-lg border border-slate-200">
        {loading ? (
          <div className="divide-y divide-slate-200">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-5 w-48 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-3 w-64 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-900 mb-1">No messages yet</h3>
            <p className="text-sm text-slate-600">
              Send your first message to all users!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {messages.map((msg) => (
              <div key={msg.id} className="p-3 sm:p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Bell className={`w-4 h-4 ${theme.text} flex-shrink-0`} />
                      <h3 className="font-semibold text-sm sm:text-base text-slate-900 truncate">{msg.title}</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 mb-2 break-words">{msg.message}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-slate-500">
                      <span className="truncate">Sent by: {msg.sentBy}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="truncate">{formatDate(msg.sentAt)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteMessage(msg.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                    title="Delete message"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Send Message Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-slate-900">Send Message to All Users</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Rehearsal Update"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  placeholder="Type your message here..."
                  rows={5}
                  maxLength={500}
                />
                <p className="text-xs text-slate-500 mt-1">
                  {message.length}/500 characters
                </p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <p className="text-sm text-purple-900">
                  <strong>Note:</strong> This message will be sent to all users and will appear in their notifications page.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSendMessage}
                  disabled={sending || !title.trim() || !message.trim()}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 ${theme.primary} text-white rounded-lg ${theme.primaryHover} transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {sending ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send to All Users
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  disabled={sending}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

