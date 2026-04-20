"use client";

import React, { useState } from 'react';
import {
  Send,
  CheckCircle2,
  X,
  Megaphone,
  Bell,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useZone } from '@/hooks/useZone';

interface SubGroupNotificationsProps {
  subGroupId: string;
}

export default function SubGroupNotifications({ subGroupId }: SubGroupNotificationsProps) {
  const { user } = useAuth();
  const { currentZone } = useZone();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const themeColor = currentZone?.themeColor || '#9333ea';

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
        setTimeout(() => setSent(false), 5000);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex-1 min-h-0 space-y-6 animate-in fade-in duration-700 max-w-3xl">
      {/* Banner */}
      {sent && (
        <div className="p-4 bg-green-500 rounded-2xl flex items-center justify-between gap-4 animate-in slide-in-from-top-2 duration-300 shadow-md">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-white" />
            <p className="text-sm font-semibold text-white">Message sent to all members.</p>
          </div>
          <button onClick={() => setSent(false)} className="p-1 text-white/80 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Message Composer - Matching Admin Style */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-10 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-4 mb-8">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm"
            style={{ backgroundColor: themeColor }}
          >
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Notifications</h2>
            <p className="text-xs text-gray-400 font-medium mt-0.5">Send a message to your group members</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest ml-1">Subject</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Rehearsal Update"
              className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 font-semibold placeholder:text-gray-300 text-sm shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest ml-1">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message here..."
              rows={6}
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 font-medium placeholder:text-gray-300 text-sm resize-none shadow-sm leading-relaxed"
            />
          </div>

          <div className="pt-4 flex items-center justify-end">
            <button
              onClick={handleSend}
              disabled={!title.trim() || !message.trim() || sending}
              className="flex items-center justify-center gap-2 px-8 py-3.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all font-bold text-sm disabled:opacity-50 shadow-md active:scale-95"
            >
              {sending ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
