'use client';

import React, { useState, useEffect } from 'react';
import { SupabaseSupport, SupportMessage } from '@/lib/supabase-support';
import { debugAdminSupport } from '@/lib/admin-support-debug';
import { 
  MessageCircle, 
  Send, 
  X, 
  RefreshCw,
  User,
  Mail,
  Calendar,
  Tag,
  AlertTriangle
} from 'lucide-react';

export default function SimpleAdminSupport() {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<SupportMessage | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  // Load messages
  const loadMessages = async () => {
    try {
      const allMessages = await SupabaseSupport.getMessages();
      setMessages(allMessages);
    } catch (error) {
      console.error('❌ Admin: Error loading messages:', error);
    }
  };

  // Handle reply
  const handleReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;

    setIsReplying(true);

    try {
      await SupabaseSupport.addReply(selectedMessage.id, replyText.trim());

      setSelectedMessage(null);
      setReplyText('');
      loadMessages();
    } catch (error) {
      console.error('Error sending reply:', error);
    } finally {
      setIsReplying(false);
    }
  };

    const updateStatus = async (messageId: string, status: string) => {
    await SupabaseSupport.updateMessage(messageId, { status: status as any });
    loadMessages();
  };

  // Load messages on mount and set up real-time subscription
  useEffect(() => {
    loadMessages();

    // Set up real-time subscription
    const unsubscribe = SupabaseSupport.subscribeToUpdates(() => {
      loadMessages();
    });

    return unsubscribe;
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Support Messages</h2>
            <p className="text-sm text-gray-600">{messages.length} total messages</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              loadMessages();
            }}
            className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            🔄 Refresh
          </button>
          <button
            onClick={() => {
              debugAdminSupport();
            }}
            className="px-3 py-2 bg-orange-600 text-white rounded text-sm hover:bg-orange-700"
          >
            🔍 Debug
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className="space-y-3 sm:space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <MessageCircle className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No Support Messages</h3>
            <p className="text-sm sm:text-base text-gray-600 px-4">
              No support messages have been submitted yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow">
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">{message.subject}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${getStatusColor(message.status)}`}>
                          {message.status.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${getPriorityColor(message.priority)}`}>
                          {message.priority}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="truncate">{message.userName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="truncate">{message.userEmail}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="whitespace-nowrap">{new Date(message.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-800 mb-3 break-words">{message.message}</p>
                    
                      {message.adminResponse && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-xs sm:text-sm font-medium text-green-800 mb-1">Admin Response:</p>
                          <p className="text-xs sm:text-sm text-green-700 break-words">{message.adminResponse}</p>
                          <p className="text-xs text-green-600 mt-1">
                            Responded on {new Date(message.adminRespondedAt || '').toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setSelectedMessage(message);
                        setReplyText(''); // Always start with empty text for new replies
                      }}
                      className="px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                    >
                      {message.adminResponse ? 'Reply Again' : 'Reply'}
                    </button>
                    <select
                      value={message.status}
                      onChange={(e) => updateStatus(message.id, e.target.value)}
                      className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden border border-gray-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="text-xl font-bold truncate">
                    {selectedMessage.adminResponse ? 'Send Another Reply' : 'Reply to Message'}
                  </h3>
                  <p className="text-purple-100 mt-1 truncate text-sm">From: {selectedMessage.userName}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedMessage(null);
                    setReplyText('');
                  }}
                  className="p-2 text-purple-200 hover:text-white hover:bg-purple-500/30 rounded-full transition-colors flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[calc(90vh-240px)] overflow-y-auto space-y-6">
              {/* Original Message */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-purple-600" />
                  Original Message
                </h4>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm break-words">{selectedMessage.subject}</p>
                      <p className="text-xs text-gray-500 mt-1">{selectedMessage.userEmail}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed break-words pl-11">{selectedMessage.message}</p>
                </div>
              </div>

              {/* Response Input */}
              <div>
                <label className="block font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Send className="w-4 h-4 text-purple-600" />
                  {selectedMessage.adminResponse ? 'Send Another Reply' : 'Your Response'}
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={selectedMessage.adminResponse ? "Type your follow-up response here..." : "Type your helpful response here..."}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none text-sm leading-relaxed"
                />
                <p className="text-xs text-gray-500 mt-2">
                  {selectedMessage.adminResponse
                    ? "This will create a new reply in the conversation thread."
                    : "Be helpful and professional in your response."
                  }
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedMessage(null);
                    setReplyText('');
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-white transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReply}
                  disabled={isReplying || !replyText.trim()}
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 font-medium shadow-lg"
                >
                  {isReplying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {selectedMessage.adminResponse ? 'Send Another Reply' : 'Send Reply'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
