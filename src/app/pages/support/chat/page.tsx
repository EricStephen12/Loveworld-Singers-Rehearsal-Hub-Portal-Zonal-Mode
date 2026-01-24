'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import SharedDrawer from '@/components/SharedDrawer';
import { getMenuItems } from '@/config/menuItems';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase-setup';
import {
  MessageCircle,
  Send,
  Paperclip,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { ScreenHeader } from '@/components/ScreenHeader';

import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';

interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: any;
  isCurrentUser: boolean;
}

export default function ChatSupportPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUser = {
    id: user?.uid || 'support-user-123',
    name: user?.displayName || 'Support User'
  };

  const supportAgent = {
    id: 'admin-support-456',
    name: 'Admin Support'
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = getMenuItems(handleLogout);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const messagesQuery = query(
      collection(db, 'support_messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const msgs: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        msgs.push({
          id: doc.id,
          text: data.text,
          senderId: data.senderId,
          senderName: data.senderName,
          timestamp: data.timestamp,
          isCurrentUser: data.senderId === currentUser.id
        });
      });

      setMessages(msgs);
      setLoading(false);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [currentUser.id]);

  const sendMessage = async () => {
    if (newMessage.trim() === '') return;

    try {
      await addDoc(collection(db, 'support_messages'), {
        text: newMessage,
        senderId: currentUser.id,
        senderName: currentUser.name,
        timestamp: serverTimestamp(),
        recipientId: supportAgent.id
      });

      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-gray-50 via-white to-slate-50 flex flex-col">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100/50">
        <ScreenHeader
          title="Chat Support"
          showBackButton={true}
          backPath="/pages/support"
          onMenuClick={() => setIsMenuOpen(true)}
          rightImageSrc="/logo.png"
        />
      </div>


      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pt-16 pb-24" style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch'
      }}>
        <div className="mx-auto max-w-2xl px-3 sm:px-4 py-4 sm:py-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admin Support</h1>
              <p className="text-sm text-gray-600">We&apos;re here to help you</p>
            </div>
          </div>

          {/* Messages Container */}
          <div className="bg-white/70 backdrop-blur-sm border-0 rounded-2xl p-4 shadow-sm ring-1 ring-black/5 min-h-[50vh]">
            {loading ? (
              <div className="flex items-center justify-center h-full min-h-[40vh]">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-gray-300 border-t-green-500 rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-gray-500 text-sm">Loading messages...</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full min-h-[40vh]">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium mb-2">No messages yet</p>
                  <p className="text-gray-400 text-sm">Start a conversation with our support team</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${message.isCurrentUser
                        ? 'bg-green-500 text-white rounded-br-md'
                        : 'bg-white text-gray-800 rounded-bl-md shadow-sm ring-1 ring-black/5'
                        }`}
                    >
                      {!message.isCurrentUser && (
                        <p className="text-xs font-semibold mb-1">{message.senderName}</p>
                      )}
                      <p className="text-sm">{message.text}</p>
                      <div className={`flex items-center justify-end mt-1 ${message.isCurrentUser ? 'text-green-100' : 'text-gray-400'}`}>
                        <Clock className="w-3 h-3 mr-1" />
                        <span className="text-xs">
                          {message.timestamp?.toDate ?
                            message.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
                            'Now'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Message Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100/50 p-3 safe-area-bottom">
        <div className="mx-auto max-w-2xl">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-2 shadow-sm ring-1 ring-black/5">
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors active:scale-95">
                <Paperclip className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1 bg-transparent py-2 px-2 text-gray-800 placeholder-gray-400 focus:outline-none text-sm"
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <SharedDrawer open={isMenuOpen} onClose={() => setIsMenuOpen(false)} title="Menu" items={menuItems} />
    </div>
  );
}
