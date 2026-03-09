'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Search, Plus, MessageCircle, Check, ImageIcon, FileText, Mic, PhoneMissed, Loader2, Edit3, ChevronLeft } from 'lucide-react'
import { useChatV2 } from '../_context/ChatContextV2'
import { useAuth } from '@/hooks/useAuth'
import { SyncAvatar } from './SyncAvatar'

interface ChatListProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  onNewChat: () => void
  onNewGroup: () => void
  onShowMyProfile: () => void
  onBack?: () => void
  primaryColor: string
}

export function ChatList({
  searchTerm,
  onSearchChange,
  onNewChat,
  onNewGroup,
  onShowMyProfile,
  onBack,
  primaryColor
}: ChatListProps) {
  const { user, profile } = useAuth()
  const {
    chats,
    selectedChat,
    selectChat,
    isLoading,
    currentUser,
    getChatDisplayName,
    getChatAvatar,
    allTypingUsers = {}
  } = useChatV2()

  // Helper for time formatting
  const formatChatTime = (date: Date | any) => {
    if (!date) return ''
    const d = date instanceof Date ? date : new Date(date)
    const now = new Date()
    const isToday = d.toDateString() === now.toDateString()
    
    if (isToday) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  // Adjust color helper
  const adjustColor = (hex: string, amt: number) => {
    let usePound = false
    if (hex[0] === "#") {
      hex = hex.slice(1)
      usePound = true
    }
    const num = parseInt(hex, 16)
    let r = (num >> 16) + amt
    if (r > 255) r = 255
    else if (r < 0) r = 0
    let b = ((num >> 8) & 0x00FF) + amt
    if (b > 255) b = 255
    else if (b < 0) b = 0
    let g = (num & 0x0000FF) + amt
    if (g > 255) g = 255
    else if (g < 0) g = 0
    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16)
  }

  return (
    <div className={`w-full md:w-80 lg:w-[400px] flex-shrink-0 bg-white border-r border-gray-200 flex flex-col ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
      {/* List Header (Purple Gradient) */}
      <div 
        className="flex-shrink-0 p-4 text-white flex flex-col gap-4 shadow-lg z-10"
        style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${adjustColor(primaryColor, -20)} 100%)` }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-1 -ml-1 hover:bg-white/20 rounded-lg transition-colors"
                title="Back"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            <button
              onClick={onShowMyProfile}
              className="hover:scale-105 transition-transform"
            >
              <SyncAvatar 
                userId={user?.uid}
                initialAvatar={profile?.profile_image_url || profile?.avatar_url}
                fallbackName={profile?.first_name || 'U'}
                bgColor="white"
                size="w-10 h-10"
                className="border-2 border-white/20 shadow-sm"
              />
            </button>
            <h2 className="text-xl font-bold tracking-tight">Groups</h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onNewChat}
              className="p-2.5 hover:bg-white/10 rounded-xl transition-all active:scale-95"
              title="Search users"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={onNewGroup}
              className="p-2.5 hover:bg-white/10 rounded-xl transition-all active:scale-95"
              title="Create group"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Integrated Search Bar */}
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 group-focus-within:text-white transition-colors" />
          <input
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search messages or people"
            className="w-full pl-10 pr-4 py-2 bg-white/10 rounded-xl text-sm placeholder:text-white/50 focus:outline-none focus:bg-white/20 transition-all border border-white/10 focus:border-white/20 text-white"
          />
        </div>
      </div>

      {/* Chat List Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scroll-smooth">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 opacity-60">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            <p className="text-sm font-medium">Loading your chats...</p>
          </div>
        ) : chats.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center h-full justify-center">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-gray-50/50">
              <MessageCircle className="w-12 h-12 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Connect with Singers</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-[240px] leading-relaxed">
              Start a conversation with your team members or create a group to stay in sync.
            </p>
            <button
              onClick={onNewChat}
              className="px-8 py-3 text-white text-sm font-bold rounded-2xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
              style={{ backgroundColor: primaryColor }}
            >
              Start Chatting
            </button>
          </div>
        ) : (
          <div className="pb-4">
            {chats
              .filter(chat => {
                const name = getChatDisplayName(chat).toLowerCase()
                const term = searchTerm.toLowerCase()
                return name.includes(term)
              })
              .map(chat => {
                const displayName = getChatDisplayName(chat)
                const avatar = getChatAvatar(chat)
                const isSelected = selectedChat?.id === chat.id
                const unreadCount = currentUser ? (chat.unreadCount[currentUser.id] || 0) : 0
                const typingUsersInChat = (allTypingUsers && allTypingUsers[chat.id]) || []

                return (
                  <motion.button
                    key={chat.id}
                    layoutId={`chat-${chat.id}`}
                    onClick={() => selectChat(chat)}
                    className={`group w-full flex items-center gap-3 px-4 py-3.5 transition-all relative border-b border-gray-50/50 ${
                      isSelected ? 'bg-emerald-50/50' : 'hover:bg-gray-50 active:bg-gray-100'
                    }`}
                  >
                    {/* Active Indicator */}
                    {isSelected && (
                      <motion.div
                        layoutId="active-chat-pill"
                        className="absolute left-0 top-2 bottom-2 w-1.5 rounded-r-full shadow-sm"
                        style={{ backgroundColor: primaryColor }}
                      />
                    )}

                    <div className="relative flex-shrink-0">
                      <SyncAvatar 
                        userId={chat.type === 'direct' ? chat.participants.find(id => id !== currentUser?.id) : undefined}
                        initialAvatar={avatar}
                        fallbackName={displayName}
                        isGroup={chat.type === 'group'}
                        bgColor={chat.type === 'group' ? adjustColor(primaryColor, -20) : primaryColor}
                        size="w-12 h-12"
                        className="rounded-2xl ring-2 ring-white ring-offset-1 ring-offset-gray-50"
                      />
                      {/* Presence/Type Indicator */}
                      <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                        chat.type === 'group' ? 'bg-gray-500' : 'bg-emerald-500'
                      }`}>
                        {chat.type === 'group' ? (
                          <Plus className="w-2 h-2 text-white" />
                        ) : (
                          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        )}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col items-start text-left">
                      <div className="w-full flex items-center justify-between gap-2 overflow-hidden">
                        <h3 className={`font-bold truncate text-[15px] ${unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                          {displayName}
                        </h3>
                        {chat.lastMessage && (
                          <span className={`text-[10px] whitespace-nowrap ${unreadCount > 0 ? 'text-emerald-600 font-bold' : 'text-gray-400'}`}>
                            {formatChatTime(chat.lastMessage.timestamp)}
                          </span>
                        )}
                      </div>
                      
                      <div className="w-full h-5 flex items-center justify-between mt-0.5">
                        <div className="flex-1 min-w-0 pr-2">
                          {typingUsersInChat.length > 0 ? (
                            <div className="flex items-center gap-1 text-emerald-600 font-bold animate-pulse truncate text-xs italic">
                              {typingUsersInChat[0].status === 'recording_voice' ? (
                                <>
                                  <Mic className="w-3 h-3" />
                                  <span>Recording voice...</span>
                                </>
                              ) : (
                                <>
                                  <Edit3 className="w-3 h-3" />
                                  <span>{typingUsersInChat[0].userName.split(' ')[0]} typing...</span>
                                </>
                              )}
                            </div>
                          ) : (
                            <div className={`text-xs truncate flex items-center gap-1.5 ${unreadCount > 0 ? 'text-gray-900 font-bold' : 'text-gray-500'}`}>
                              {chat.lastMessage?.senderId === currentUser?.id && (
                                <span className={`flex-shrink-0 flex items-center gap-[1px] ${chat.lastMessage?.status === 'read' ? 'text-blue-400' : 'text-gray-300'}`}>
                                  <Check className="w-3 h-3" />
                                  {chat.lastMessage?.status === 'read' && <Check className="w-3 h-3 -ml-2" />}
                                </span>
                              )}
                              <span className="truncate">
                                {chat.lastMessage?.text?.includes('Missed') ? (
                                  <span className="text-red-500 flex items-center gap-1">
                                    <PhoneMissed className="w-3 h-3" />
                                    Missed call
                                  </span>
                                ) : chat.lastMessage?.text?.includes('Image') ? (
                                  <span className="text-emerald-500 flex items-center gap-1">
                                    <ImageIcon className="w-3 h-3" />
                                    Photo
                                  </span>
                                ) : chat.lastMessage?.text || 'New conversation'}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {unreadCount > 0 && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="h-5 min-w-[20px] px-1.5 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] text-white font-bold shadow-sm shadow-emerald-500/20"
                            style={{ backgroundColor: primaryColor }}
                          >
                            {unreadCount}
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.button>
                )
              })}
          </div>
        )}
      </div>
    </div>
  )
}
