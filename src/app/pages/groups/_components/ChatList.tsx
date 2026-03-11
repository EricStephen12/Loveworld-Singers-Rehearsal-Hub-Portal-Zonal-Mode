'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Search, Plus, MessageCircle, Check, CheckCheck, ImageIcon, FileText, Mic, PhoneMissed, Loader2, Edit3, ChevronLeft } from 'lucide-react'
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
    <div className={`w-full md:w-80 lg:w-[380px] flex-shrink-0 bg-white border-r border-gray-200 flex flex-col ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
      {/* List Header (Purple Gradient) */}
      <div 
        className="flex-shrink-0 p-4 text-white flex flex-col gap-4 z-10"
        style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${adjustColor(primaryColor, -20)} 100%)` }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="w-10 h-10 flex items-center justify-center -ml-2 hover:bg-white/20 rounded-full transition-colors"
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
            <h2 className="text-xl font-bold tracking-tight">Chats</h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onNewChat}
              className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-xl transition-all active:scale-95"
              title="Search users"
            >
              <Search className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={onNewGroup}
              className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-xl transition-all active:scale-95"
              title="Create group"
            >
              <Plus className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-white/70" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 bg-white/20 border border-transparent rounded-xl text-white placeholder-white/70 focus:outline-none focus:bg-white/30 transition-all text-sm"
            placeholder="Search or start new chat"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Chat List Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scroll-smooth bg-white">
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
                  <button
                    key={chat.id}
                    onClick={() => selectChat(chat)}
                    className={`group w-full flex items-center gap-3 px-3 py-3 transition-all relative ${
                      isSelected ? 'bg-gray-100' : 'hover:bg-gray-50 bg-white'
                    }`}
                  >
                    <div className="relative flex-shrink-0 ml-1">
                      <SyncAvatar 
                        userId={chat.type === 'direct' ? chat.participants.find(id => id !== currentUser?.id) : undefined}
                        initialAvatar={avatar}
                        fallbackName={displayName}
                        isGroup={chat.type === 'group'}
                        bgColor={chat.type === 'group' ? adjustColor(primaryColor, -20) : primaryColor}
                        size="w-[48px] h-[48px]"
                        className="rounded-full overflow-hidden"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col items-start text-left border-b border-gray-100 pb-3 -mb-3 h-[48px] justify-center mr-1">
                      <div className="w-full flex items-center justify-between gap-2 overflow-hidden mb-0.5">
                        <h3 className={`font-[500] truncate text-[16px] ${unreadCount > 0 ? 'text-gray-900 font-semibold' : 'text-gray-900'}`}>
                          {displayName}
                        </h3>
                        {chat.lastMessage && (
                          <span className={`text-xs whitespace-nowrap ${unreadCount > 0 ? 'text-emerald-500 font-medium' : 'text-gray-500'}`}>
                            {formatChatTime(chat.lastMessage.timestamp)}
                          </span>
                        )}
                      </div>
                      
                      <div className="w-full h-[20px] flex items-center justify-between">
                        <div className="flex-1 min-w-0 flex items-center pr-2">
                          {typingUsersInChat.length > 0 ? (
                            <div className="flex items-center gap-1 text-emerald-500 font-medium text-sm truncate">
                              {typingUsersInChat[0].status === 'recording_voice' ? (
                                <>
                                  <Mic className="w-3.5 h-3.5" />
                                  <span>recording audio...</span>
                                </>
                              ) : (
                                <>
                                  <span className="flex items-center h-4 pt-[3px]">
                                    <span className="typing-dot animate-[typing_1s_infinite_0s] bg-emerald-500 w-[5px] h-[5px] rounded-full mx-[1.5px]" />
                                    <span className="typing-dot animate-[typing_1s_infinite_150ms] bg-emerald-500 w-[5px] h-[5px] rounded-full mx-[1.5px]" />
                                    <span className="typing-dot animate-[typing_1s_infinite_300ms] bg-emerald-500 w-[5px] h-[5px] rounded-full mx-[1.5px]" />
                                  </span>
                                  <span className="ml-[6px]">typing...</span>
                                </>
                              )}
                            </div>
                          ) : (
                            <div className={`text-sm truncate flex items-center ${unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                              {chat.lastMessage?.senderId === currentUser?.id && (
                                <span className={`flex-shrink-0 flex items-center mr-[6px] ${chat.lastMessage?.status === 'read' ? 'text-[#53bdeb]' : 'text-gray-400'}`}>
                                  {chat.lastMessage?.status === 'read' ? (
                                    <CheckCheck className="w-[16px] h-[16px]" />
                                  ) : (
                                    <Check className="w-[16px] h-[16px]" />
                                  )}
                                </span>
                              )}
                              <span className="truncate max-w-[200px]">
                                {chat.lastMessage?.text?.includes('Missed') ? (
                                  <span className="text-red-500 flex items-center gap-1">
                                    <PhoneMissed className="w-[14px] h-[14px]" />
                                    Missed call
                                  </span>
                                ) : chat.lastMessage?.text?.includes('Image') ? (
                                  <span className="flex items-center gap-1">
                                    <ImageIcon className="w-[14px] h-[14px]" />
                                    Photo
                                  </span>
                                ) : chat.lastMessage?.text || 'New conversation'}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {unreadCount > 0 && (
                          <div 
                            className="h-5 min-w-[20px] px-[6px] rounded-full flex items-center justify-center text-[11px] text-white font-bold ml-1 flex-shrink-0"
                            style={{ backgroundColor: primaryColor }}
                          >
                            {unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
          </div>
        )}
      </div>
    </div>
  )
}
