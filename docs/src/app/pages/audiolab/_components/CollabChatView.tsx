'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, Info, Play, Send, Mic, 
  PlusCircle, Smile, CheckCheck, History, Loader2,
  Paperclip, Mic as MicIcon, Image, File, X, Trash2
} from 'lucide-react';
import { useAudioLab } from '../_context/AudioLabContext';
import { useAuth } from '@/hooks/useAuth';
import { getMessages, sendMessage as sendChatMessage, subscribeToMessages, deleteMessage } from '../_lib/session-service';
import { VoiceRecorder } from '../_lib/voice-recorder';
import type { ChatMessage } from '../_types';
import { uploadAudioToCloudinary } from '@/lib/cloudinary-storage';

interface Message {
  id: string;
  type: 'text' | 'voice' | 'system' | 'file';
  sender?: {
    name: string;
    avatar: string;
    isMe?: boolean;
  };
  content?: string;
  voiceDuration?: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
  file?: {
    name: string;
    size: number;
    type: string;
  };
}

const waveformHeights = [3, 5, 4, 6, 4, 3, 5, 2, 4, 3, 2, 4, 2, 3, 2, 2, 3, 4, 3];

export function CollabChatView() {
  const { goBack, state, setView } = useAudioLab();
  const { user, profile } = useAuth();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingLevel, setRecordingLevel] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const voiceRecorder = useRef<VoiceRecorder>(new VoiceRecorder());
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    // Use setTimeout to ensure DOM is updated before scrolling
    setTimeout(() => {
      const chatArea = document.getElementById('chat-area');
      if (chatArea) {
        chatArea.scrollTop = chatArea.scrollHeight;
      }
      // Also scroll the ref as fallback
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }, 0);
  };
  
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
    status: msg.status,
    file: msg.file
  });

  const formatTimestamp = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Voice recording handlers
  const handleStartRecording = async () => {
    if (!currentSessionId || !user?.uid) return;
    
    const success = await voiceRecorder.current.startRecording(setRecordingLevel);
    if (success) {
      setIsRecording(true);
    }
  };
  
  const handleStopRecording = async () => {
    if (!currentSessionId || !user?.uid) return;
    
    const audioBlob = await voiceRecorder.current.stopRecording();
    if (audioBlob) {
      setIsSending(true);
      let audioUrl: string | undefined = undefined;
      try {
        // Create an audio element to get duration
        audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio();
        if (audioUrl) {
          audio.src = audioUrl;
        }
        
        // Wait for metadata to load to get duration
        const durationPromise = new Promise<number>((resolve) => {
          audio.onloadedmetadata = () => {
            const duration = Math.round(audio.duration);
            resolve(duration);
          };
          
          audio.onerror = () => {
            resolve(0); // Default to 0 if error
          };
          
          if (audioUrl) {
            audio.src = audioUrl;
          }
        });
        
        const duration = await durationPromise;
        
        // Create a File object from the blob to upload to Cloudinary
        const audioFile = new (File as any)([audioBlob], `voice-message-${Date.now()}.webm`, { type: 'audio/webm' });
        
        // Upload to Cloudinary
        const uploadResult = await uploadAudioToCloudinary(audioFile);
        
        if (uploadResult) {
          // Send voice message with Cloudinary URL
          await sendChatMessage(currentSessionId, {
            type: 'voice',
            content: 'Voice message',
            senderId: user.uid,
            senderName: fullName,
            ...(userAvatar && { senderAvatar: userAvatar }),
            voiceUrl: uploadResult.url,
            voiceDuration: duration
          });
        } else {
          // If upload fails, send a message indicating the error
          await sendChatMessage(currentSessionId, {
            type: 'voice',
            content: 'Voice message failed to upload',
            senderId: user.uid,
            senderName: fullName,
            ...(userAvatar && { senderAvatar: userAvatar }),
            voiceDuration: duration
          });
        }
        
        // Clean up the temporary URL
        URL.revokeObjectURL(audioUrl);
      } catch (error) {
        // Error sending voice message
        // Clean up the temporary URL if error occurs
        try {
          if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
          }
        } catch (e) {
          // Ignore cleanup errors
        }
      } finally {
        setIsSending(false);
      }
    }
    setIsRecording(false);
    setRecordingLevel(0);
  };

  // Send a message
  const handleSendMessage = async () => {
    if ((!message.trim() && !selectedFile) || !currentSessionId || !user?.uid) return;

    setIsSending(true);
    
    try {
      if (selectedFile) {
        // Send file message
        await sendChatMessage(currentSessionId, {
          type: 'file',
          content: selectedFile.name,
          senderId: user.uid,
          senderName: fullName,
          ...(userAvatar && { senderAvatar: userAvatar }),
          file: {
            name: selectedFile.name,
            size: selectedFile.size,
            type: selectedFile.type
          }
        });
        setSelectedFile(null);
      }
      
      if (message.trim()) {
        // Send text message
        await sendChatMessage(currentSessionId, {
          type: 'text',
          content: message.trim(),
          senderId: user.uid,
          senderName: fullName,
          ...(userAvatar && { senderAvatar: userAvatar })
        });
      }
      
      setMessage('');
    } catch (error) {
      // Error sending message
    } finally {
      setIsSending(false);
    }
  };

  // Delete a message
  const handleDeleteMessage = async (messageId: string) => {
    if (!currentSessionId || !user?.uid) return;
    
    const confirmDelete = confirm('Are you sure you want to delete this message?');
    if (!confirmDelete) return;
    
    try {
      const result = await deleteMessage(currentSessionId, messageId, user.uid);
      if (!result.success) {
        alert(result.error || 'Failed to delete message');
      }
    } catch (error) {
      // Error deleting message
      alert('Failed to delete message');
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
      <main className="flex-1 overflow-y-auto pt-32 pb-28 px-4 flex flex-col gap-6 w-full max-w-2xl mx-auto" id="chat-area">
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
                {msg.sender?.avatar ? (
                  <div 
                    className="bg-center bg-no-repeat bg-cover rounded-full size-10 shrink-0 border border-white/10 shadow-lg"
                    style={{ backgroundImage: `url("${msg.sender.avatar}")` }}
                  />
                ) : (
                  <div className="size-10 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 font-bold text-sm border border-white/10 shadow-lg">
                    {msg.sender?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
                <div className="flex flex-col gap-1 items-start w-full max-w-[90%] sm:max-w-[70%]">
                  <p className="text-[#ad92c9] text-xs font-medium ml-1">{msg.sender?.name}</p>
                  <div className="w-full rounded-2xl rounded-bl-none p-3 bg-[#362348] text-white shadow-md flex flex-col gap-3 relative">
                    <div className="flex items-center gap-3">
                      <button className="flex shrink-0 items-center justify-center rounded-full size-10 bg-violet-500 hover:bg-violet-600 transition-colors text-white shadow-lg shadow-violet-500/30">
                        <Play size={20} className="ml-0.5" fill="currentColor" />
                      </button>
                      <div className="flex-1 flex flex-col justify-center gap-1 min-w-0">
                        <div className="flex items-center justify-between text-xs text-[#ad92c9] font-medium tracking-wide">
                          <span>Voice Note</span>
                          <span>{msg.voiceDuration ? `${msg.voiceDuration}s` : '0s'}</span>
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
                    {isMe && (
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="absolute top-1 right-1 p-1 rounded-full hover:bg-black/20 transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete message"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                  <span className="text-[#ad92c9]/60 text-[10px] ml-1">{msg.timestamp}</span>
                </div>
              </div>
            );
          }

          if (msg.type === 'file') {
            return (
              <div key={msg.id} className="flex items-end gap-3 group">
                {msg.sender?.avatar ? (
                  <div 
                    className="bg-center bg-no-repeat bg-cover rounded-full size-10 shrink-0 border border-white/10 shadow-lg"
                    style={{ backgroundImage: `url("${msg.sender.avatar}")` }}
                  />
                ) : (
                  <div className="size-10 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 font-bold text-sm border border-white/10 shadow-lg">
                    {msg.sender?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
                <div className="flex flex-col gap-1 items-start w-full max-w-[90%] sm:max-w-[70%]">
                  <p className="text-[#ad92c9] text-xs font-medium ml-1">{msg.sender?.name}</p>
                  <div className="w-full rounded-2xl rounded-bl-none p-3 bg-[#362348] text-white shadow-md flex flex-col gap-3 relative">
                    <div className="flex items-center gap-3">
                      {msg.file?.type?.startsWith('image/') ? (
                        <Image size={20} />
                      ) : (
                        <File size={20} />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{msg.file?.name || msg.content}</p>
                        <p className="text-xs opacity-70">{(msg.file?.size ? (msg.file.size / 1024 / 1024).toFixed(2) : 0)} MB</p>
                      </div>
                    </div>
                    {isMe && (
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="absolute top-1 right-1 p-1 rounded-full hover:bg-black/20 transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete message"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
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
                msg.sender?.avatar ? (
                  <div 
                    className="bg-center bg-no-repeat bg-cover rounded-full size-10 shrink-0 border border-white/10 shadow-lg"
                    style={{ backgroundImage: `url("${msg.sender.avatar}")` }}
                  />
                ) : (
                  <div className="size-10 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 font-bold text-sm border border-white/10 shadow-lg">
                    {msg.sender?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )
              )}
              <div className={`flex flex-col gap-1 max-w-[90%] sm:max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
                <p className={`text-[#ad92c9] text-xs font-medium ${isMe ? 'mr-1' : 'ml-1'}`}>
                  {msg.sender?.name}
                </p>
                <div 
                  className={`rounded-2xl px-4 py-3 shadow-md relative ${
                    isMe 
                      ? 'rounded-br-none bg-violet-500 shadow-violet-500/10' 
                      : 'rounded-bl-none bg-[#362348]'
                  } text-white`}
                >
                  <p className="text-base font-normal leading-normal">{msg.content}</p>
                  {isMe && (
                    <button
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="absolute top-1 right-1 p-1 rounded-full hover:bg-black/20 transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete message"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
                <div className={`flex items-center gap-1 ${isMe ? 'mr-1' : 'ml-1'}`}>
                  <span className="text-[#ad92c9]/60 text-[10px]">{msg.timestamp}</span>
                  {isMe && msg.status === 'read' && (
                    <CheckCheck size={12} className="text-violet-500" />
                  )}
                </div>
              </div>
              {isMe && (
                msg.sender?.avatar ? (
                  <div 
                    className="bg-center bg-no-repeat bg-cover rounded-full size-10 shrink-0 border border-white/10 shadow-lg"
                    style={{ backgroundImage: `url("${msg.sender.avatar}")` }}
                  />
                ) : (
                  <div className="size-10 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 font-bold text-sm border border-white/10 shadow-lg">
                    {msg.sender?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )
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
        <div className="px-4 py-3 pb-6 w-full max-w-2xl mx-auto">
          {/* Selected File Preview - show at top on mobile */}
          {selectedFile && (
            <div className="flex items-center gap-3 p-2 bg-[#2d1f3f] rounded-xl border border-white/10 max-w-full mb-2">
              {selectedFile.type.startsWith('image/') ? (
                <div className="size-8 rounded overflow-hidden bg-[#3d2a50] flex items-center justify-center">
                  <Image size={16} className="text-slate-400" />
                </div>
              ) : (
                <div className="size-8 rounded overflow-hidden bg-[#3d2a50] flex items-center justify-center">
                  <File size={16} className="text-slate-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-medium truncate">{selectedFile.name}</p>
                <p className="text-slate-400 text-xs">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          )}
          
          <div className="flex items-end gap-2 w-full">
            {/* Attachment Button */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*,audio/*,video/*,application/pdf,.doc,.docx,.txt"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setSelectedFile(file);
                }
              }}
            />
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="text-[#ad92c9] hover:text-white transition-colors p-2 rounded-full hover:bg-white/10 shrink-0"
              title="Attach file"
            >
              <PlusCircle size={24} />
            </button>

            {/* Text Input */}
            <div className="flex-1 bg-[#2d1f3f] border border-white/10 rounded-2xl flex flex-col min-h-[44px] shadow-inner focus-within:border-violet-500/50 focus-within:ring-1 focus-within:ring-violet-500/50 transition-all">
              <input 
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-transparent border-none text-white placeholder-[#ad92c9]/50 w-full focus:ring-0 focus:outline-none p-3 text-sm"
                placeholder="Discuss arrangement..."
                disabled={!currentSessionId}
              />
              <div className="flex items-center justify-between px-3 py-1 border-t border-white/5">
                <button 
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="text-[#ad92c9] hover:text-white transition-colors p-1"
                  title="Emoji"
                >
                  <Smile size={16} />
                </button>
                
                {showEmojiPicker && (
                  <div className="absolute bottom-20 left-4 z-10 bg-[#261933] border border-white/10 rounded-2xl p-4 w-[300px] max-w-[90vw] max-h-[300px] overflow-hidden">
                    <div className="flex flex-col h-full">
                      <div className="grid grid-cols-6 gap-2 mb-2 max-h-[200px] overflow-y-auto pb-2">
                        {['😀', '😂', '🥰', '😍', '🤩', '😎'].map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => {
                              setMessage(prev => prev + emoji);
                              setShowEmojiPicker(false);
                            }}
                            className="text-xl hover:bg-white/10 rounded-lg p-2 transition-colors flex items-center justify-center h-12 w-12"
                          >
                            {emoji}
                          </button>
                        ))}
                        {['🤗', '🤔', '🥳', '😜', '😇', '🥺'].map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => {
                              setMessage(prev => prev + emoji);
                              setShowEmojiPicker(false);
                            }}
                            className="text-xl hover:bg-white/10 rounded-lg p-2 transition-colors flex items-center justify-center h-12 w-12"
                          >
                            {emoji}
                          </button>
                        ))}
                        {['🤯', '🥶', '🤠', '🥴', '❤️', '💯'].map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => {
                              setMessage(prev => prev + emoji);
                              setShowEmojiPicker(false);
                            }}
                            className="text-xl hover:bg-white/10 rounded-lg p-2 transition-colors flex items-center justify-center h-12 w-12"
                          >
                            {emoji}
                          </button>
                        ))}
                        {['🔥', '✨', '🎉', '👏', '👍', '👎'].map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => {
                              setMessage(prev => prev + emoji);
                              setShowEmojiPicker(false);
                            }}
                            className="text-xl hover:bg-white/10 rounded-lg p-2 transition-colors flex items-center justify-center h-12 w-12"
                          >
                            {emoji}
                          </button>
                        ))}
                        {['🙌', '🙏', '💪', '👀', '🎧', '🎤'].map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => {
                              setMessage(prev => prev + emoji);
                              setShowEmojiPicker(false);
                            }}
                            className="text-xl hover:bg-white/10 rounded-lg p-2 transition-colors flex items-center justify-center h-12 w-12"
                          >
                            {emoji}
                          </button>
                        ))}
                        {['🎶', '🎵', '🎶', '🎵', '🔥', '✨'].map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => {
                              setMessage(prev => prev + emoji);
                              setShowEmojiPicker(false);
                            }}
                            className="text-xl hover:bg-white/10 rounded-lg p-2 transition-colors flex items-center justify-center h-12 w-12"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                      
                      {/* Close button for mobile */}
                      <button
                        onClick={() => setShowEmojiPicker(false)}
                        className="self-end text-[#ad92c9] hover:text-white transition-colors p-1 text-sm"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-1">
              {/* Voice Recording Button */}
              {isRecording ? (
                <button
                  onClick={handleStopRecording}
                  className="bg-red-500 hover:bg-red-600 text-white size-10 rounded-full flex items-center justify-center transition-all active:scale-95 group"
                >
                  <div className="size-1.5 rounded-full bg-white animate-pulse" />
                </button>
              ) : (
                <button 
                  onClick={handleStartRecording}
                  className="bg-[#2d1f3f] border border-white/10 hover:border-violet-500/50 text-white size-10 rounded-full flex items-center justify-center transition-all active:scale-95 active:bg-violet-500/20 group"
                >
                  <MicIcon size={20} className="group-hover:text-violet-500 transition-colors" />
                </button>
              )}
              
              {/* Send Button */}
              <button 
                onClick={handleSendMessage}
                disabled={(!message.trim() && !selectedFile) || isSending || !currentSessionId}
                className="bg-violet-500 hover:bg-violet-600 text-white size-10 rounded-full flex items-center justify-center shadow-lg shadow-violet-500/40 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} className="ml-0.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
