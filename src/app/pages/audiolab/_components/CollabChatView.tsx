'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, Info, Play, Send, Mic, 
  PlusCircle, Smile, CheckCheck, History, Loader2 
} from 'lucide-react';
import { useAudioLab } from '../_context/AudioLabContext';
import { useAuth } from '@/hooks/useAuth';
import { getMessages, sendMessage as sendChatMessage, subscribeToMessages } from '../_lib/session-service';
import type { ChatMessage } from '../_types';

interface Message {
  id: string;
  type: 'text' | 'voice' | 'system';
  sender?: {
    name: string;
    avatar: string;
    isMe?: boolean;
  };
  content?: string;
  voiceDuration?: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
}

const waveformHeights = [3, 5, 4, 6, 4, 3, 5, 2, 4, 3, 2, 4, 2, 3, 2, 2, 3, 4, 3];

export function CollabChatView() {
  const { goBack, state, setView } = useAudioLab();
  const { user, profile } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get user info
  const userName = profile?.first_name || user?.displayName?.split(' ')[0] || 'You';
  const fullName = profile?.first_name 
    ? `${profile.first_name} ${profile.last_name || ''}`.trim()
    : user?.displayName || 'You';
  const userAvatar = profile?.avatar_url || user?.photoURL || null;

  // TODO: Get current session ID from context/state
  const currentSessionId = state.session?.currentSession?.id;

  // Load messages and subscribe to new ones
  useEffect(() => {
    if (!currentSessionId) return;

    // Load existing messages
    const loadMessages = async () => {
      const chatMessages = await getMessages(currentSessionId);
      setMessages(chatMessages.map(msg => convertToMessage(msg, user?.uid)));
    };
    loadMessages();

    // Subscribe to new messages
    const unsubscribe = subscribeToMessages(currentSessionId, (newMsg) => {
      setMessages(prev => {
        // Avoid duplicates
        if (prev.some(m => m.id === newMsg.id)) return prev;
        return [...prev, convertToMessage(newMsg, user?.uid)];
      });
    });

    return () => unsubscribe();
  }, [currentSessionId, user?.uid]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Convert ChatMessage to local Message format
  const convertToMessage = (msg: ChatMessage, currentUserId?: string): Message => ({
    id: msg.id,
    type: msg.type || 'text',
    sender: msg.senderId !== 'system' ? {
      name: msg.senderName,
      avatar: msg.senderAvatar || '',
      isMe: msg.senderId === currentUserId
    } : undefined,
    content: msg.content,
    timestamp: formatTimestamp(msg.timestamp),
    status: msg.status
  });

  const formatTimestamp = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Send a message
  const handleSendMessage = async () => {
    if (!message.trim() || !currentSessionId || !user?.uid) return;

    setIsSending(true);
    const messageText = message.trim();
    setMessage(''); // Clear input immediately for better UX

    try {
      await sendChatMessage(currentSessionId, {
        type: 'text',
        content: messageText,
        senderId: user.uid,
        senderName: fullName,
        senderAvatar: userAvatar || undefined
      });
    } catch (error) {
      console.error('[CollabChatView] Error sending message:', error);
      setMessage(messageText); // Restore message on error
    } finally {
      setIsSending(false);
    }
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#191022] flex flex-col overflow-hidden text-white">
      {/* Header */}
      <header className="absolute top-0 left-0 w-full z-20 px-4 pt-12 pb-3 flex items-center justify-between shadow-sm bg-[#191022]/85 backdrop-blur-xl border-b border-white/5">
        <button 
          onClick={goBack}
          className="flex items-center justify-center text-white/80 hover:text-white transition-colors size-10 rounded-full active:bg-white/10"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1 flex flex-col items-center justify-center mx-2 text-center">
          <h1 className="text-white text-lg font-bold leading-tight tracking-tight flex items-center gap-2">
            {state.session?.currentSession?.title || 'Session'}
            {currentSessionId && <span className="size-2 rounded-full bg-green-500 animate-pulse" />}
          </h1>
          <p className="text-[#ad92c9] text-xs font-normal">
            {currentSessionId ? `Code: ${state.session?.currentSession?.code}` : 'No active session'}
          </p>
        </div>
        <button 
          onClick={() => setView('live-session')}
          className="flex items-center justify-center text-white bg-red-500 hover:bg-red-600 transition-colors px-3 py-2 rounded-full active:scale-95 gap-1.5 text-sm font-bold"
        >
          <span className="size-2 rounded-full bg-white animate-pulse" />
          Go Live
        </button>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto pt-32 pb-28 px-4 flex flex-col gap-6 w-full max-w-2xl mx-auto">
        {/* No Session State */}
        {!currentSessionId && (
          <div className="flex-1 flex flex-col items-center justify-center py-12">
            <Mic size={48} className="text-slate-600 mb-4" />
            <p className="text-slate-400 text-sm text-center mb-4">No active session</p>
            <button
              onClick={goBack}
              className="px-6 py-3 bg-violet-500 hover:bg-violet-600 text-white rounded-xl font-bold transition-colors"
            >
              Join or Create Session
            </button>
          </div>
        )}

        {/* Empty Messages State */}
        {currentSessionId && messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-12">
            <p className="text-slate-500 text-sm">Send a message to start</p>
          </div>
        )}

        {/* Date Separator - only show if there are messages */}
        {messages.length > 0 && (
          <div className="flex justify-center w-full">
            <span className="text-[#ad92c9] text-xs font-medium py-1 px-3 bg-white/5 rounded-full">
              Today
            </span>
          </div>
        )}

        {messages.map((msg) => {
          if (msg.type === 'system') {
            return (
              <div key={msg.id} className="w-full flex flex-col items-center">
                <p className="text-[#ad92c9] text-sm font-normal text-center bg-[#2d1f3f]/50 py-1.5 px-4 rounded-lg border border-white/5 flex items-center gap-1">
                  <History size={14} className="inline" />
                  {msg.content}
                </p>
              </div>
            );
          }

          const isMe = msg.sender?.isMe;

          if (msg.type === 'voice') {
            return (
              <div key={msg.id} className="flex items-end gap-3 group">
                <div 
                  className="bg-center bg-no-repeat bg-cover rounded-full size-10 shrink-0 border border-white/10 shadow-lg"
                  style={{ backgroundImage: `url("${msg.sender?.avatar}")` }}
                />
                <div className="flex flex-col gap-1 items-start w-full max-w-[85%] sm:max-w-[70%]">
                  <p className="text-[#ad92c9] text-xs font-medium ml-1">{msg.sender?.name}</p>
                  <div className="w-full rounded-2xl rounded-bl-none p-3 bg-[#362348] text-white shadow-md flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <button className="flex shrink-0 items-center justify-center rounded-full size-10 bg-violet-500 hover:bg-violet-600 transition-colors text-white shadow-lg shadow-violet-500/30">
                        <Play size={20} className="ml-0.5" fill="currentColor" />
                      </button>
                      <div className="flex-1 flex flex-col justify-center gap-1 min-w-0">
                        <div className="flex items-center justify-between text-xs text-[#ad92c9] font-medium tracking-wide">
                          <span>Voice Note</span>
                          <span>{msg.voiceDuration}</span>
                        </div>
                        {/* Waveform Visualization */}
                        <div className="flex items-center gap-[2px] h-6 w-full opacity-80">
                          {waveformHeights.map((h, i) => (
                            <div 
                              key={i}
                              className={`w-1 rounded-full ${
                                i < 4 ? 'bg-violet-500' : 'bg-white/30'
                              } ${i === 3 ? 'animate-pulse bg-white' : ''}`}
                              style={{ height: `${h * 4}px` }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <span className="text-[#ad92c9]/60 text-[10px] ml-1">{msg.timestamp}</span>
                </div>
              </div>
            );
          }

          // Text message
          return (
            <div 
              key={msg.id} 
              className={`flex items-end gap-3 group ${isMe ? 'justify-end' : ''}`}
            >
              {!isMe && (
                <div 
                  className="bg-center bg-no-repeat bg-cover rounded-full size-10 shrink-0 border border-white/10 shadow-lg"
                  style={{ backgroundImage: `url("${msg.sender?.avatar}")` }}
                />
              )}
              <div className={`flex flex-col gap-1 max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
                <p className={`text-[#ad92c9] text-xs font-medium ${isMe ? 'mr-1' : 'ml-1'}`}>
                  {msg.sender?.name}
                </p>
                <div 
                  className={`rounded-2xl px-4 py-3 shadow-md ${
                    isMe 
                      ? 'rounded-br-none bg-violet-500 shadow-violet-500/10' 
                      : 'rounded-bl-none bg-[#362348]'
                  } text-white`}
                >
                  <p className="text-base font-normal leading-normal">{msg.content}</p>
                </div>
                <div className={`flex items-center gap-1 ${isMe ? 'mr-1' : 'ml-1'}`}>
                  <span className="text-[#ad92c9]/60 text-[10px]">{msg.timestamp}</span>
                  {isMe && msg.status === 'read' && (
                    <CheckCheck size={12} className="text-violet-500" />
                  )}
                </div>
              </div>
              {isMe && (
                <div 
                  className="bg-center bg-no-repeat bg-cover rounded-full size-10 shrink-0 border border-white/10 shadow-lg"
                  style={{ backgroundImage: `url("${msg.sender?.avatar}")` }}
                />
              )}
            </div>
          );
        })}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-end gap-3 group">
            <div className="bg-[#362348] rounded-2xl rounded-bl-none py-3 px-4 flex items-center gap-1.5 shadow-sm">
              <div className="size-2 bg-[#ad92c9]/60 rounded-full animate-bounce" style={{ animationDelay: '-0.32s' }} />
              <div className="size-2 bg-[#ad92c9]/60 rounded-full animate-bounce" style={{ animationDelay: '-0.16s' }} />
              <div className="size-2 bg-[#ad92c9]/60 rounded-full animate-bounce" />
            </div>
          </div>
        )}
        
        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="absolute bottom-0 left-0 w-full bg-[#191022]/85 backdrop-blur-xl border-t border-white/5 z-30">
        <div className="px-4 py-3 pb-6 flex items-end gap-3 w-full max-w-2xl mx-auto">
          {/* Attachment Button */}
          <button className="text-[#ad92c9] hover:text-white transition-colors p-2 rounded-full hover:bg-white/10 shrink-0 mb-1">
            <PlusCircle size={28} />
          </button>

          {/* Text Input */}
          <div className="flex-1 bg-[#2d1f3f] border border-white/10 rounded-3xl flex items-center min-h-[48px] px-4 shadow-inner focus-within:border-violet-500/50 focus-within:ring-1 focus-within:ring-violet-500/50 transition-all">
            <input 
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-transparent border-none text-white placeholder-[#ad92c9]/50 w-full focus:ring-0 focus:outline-none p-0 text-base"
              placeholder="Discuss arrangement..."
              disabled={!currentSessionId}
            />
            <button className="text-[#ad92c9] hover:text-white transition-colors ml-2 p-1">
              <Smile size={24} />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0 mb-0.5">
            {/* Mic Button */}
            <button className="bg-[#2d1f3f] border border-white/10 hover:border-violet-500/50 text-white size-11 rounded-full flex items-center justify-center transition-all active:scale-95 active:bg-violet-500/20 group">
              <Mic size={24} className="group-hover:text-violet-500 transition-colors" />
            </button>
            {/* Send Button */}
            <button 
              onClick={handleSendMessage}
              disabled={!message.trim() || isSending || !currentSessionId}
              className="bg-violet-500 hover:bg-violet-600 text-white size-11 rounded-full flex items-center justify-center shadow-lg shadow-violet-500/40 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Send size={20} className="ml-0.5" />
              )}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
