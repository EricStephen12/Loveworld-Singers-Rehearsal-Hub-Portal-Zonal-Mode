"use client";

import React, { useState } from 'react';
import {
  Bell,
  Send,
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
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex-1 min-h-0">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Notifications</h1>
      </div>

      {/* Success Toast */}
      {sent && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <Bell className="w-4 h-4 text-emerald-600" />
          <p className="text-xs font-black text-emerald-700 uppercase tracking-widest">Message Sent</p>
        </div>
      )}

      {/* Send Notification Form */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 max-w-2xl shadow-sm">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100">
            <MessageSquare className="w-6 h-6 text-purple-600" />
          </div>
          <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">New Message</h2>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">
              Subject
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="..."
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 focus:border-purple-600 focus:bg-white rounded-xl transition-all text-slate-900 font-bold placeholder:text-slate-300 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="..."
              rows={5}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 focus:border-purple-600 focus:bg-white rounded-xl transition-all text-slate-900 font-bold placeholder:text-slate-300 text-sm resize-none"
            />
          </div>

          <button
            onClick={handleSend}
            disabled={!title.trim() || !message.trim() || sending}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all font-black text-xs uppercase tracking-widest disabled:opacity-50 shadow-lg shadow-purple-600/10"
          >
            {sending ? 'Sending...' : 'Send Message'}
          </button>
        </div>
      </div>
    </div>
  );
}
