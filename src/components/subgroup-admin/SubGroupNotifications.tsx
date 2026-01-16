"use client";

import React, { useState } from 'react';
import {
  Bell,
  Send,
  RefreshCw,
  X,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import CustomLoader from '@/components/CustomLoader';

interface SubGroupNotificationsProps {
  subGroupId: string;
}

export default function SubGroupNotifications({ subGroupId }: SubGroupNotificationsProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) return;

    setSending(true);
    try {
      const { SubGroupDatabaseService } = await import('@/lib/subgroup-database-service');
      const result = await SubGroupDatabaseService.sendSubGroupNotification(
        subGroupId,
        {
          title: title.trim(),
          message: message.trim(),
          type: 'announcement'
        }
      );

      if (result.success) {
        setTitle('');
        setMessage('');
        setSent(true);
        setTimeout(() => setSent(false), 3000);
      } else {
        console.error('Failed to send notification:', result.error);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
        <p className="text-slate-500">Send messages to your sub-group members</p>
      </div>

      {/* Success Toast */}
      {sent && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <div className="p-1 bg-green-100 rounded-full">
            <Bell className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-green-700">Notification sent successfully!</p>
        </div>
      )}

      {/* Send Notification Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-lg">
            <MessageSquare className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">New Notification</h2>
            <p className="text-sm text-slate-500">This will be sent to all sub-group members</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Rehearsal Reminder"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Message *
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message..."
              rows={5}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          <button
            onClick={handleSend}
            disabled={!title.trim() || !message.trim() || sending}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <>
                <CustomLoader size="sm" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Notification
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
