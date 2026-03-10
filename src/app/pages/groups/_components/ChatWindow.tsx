'use client'

import { useState, useEffect, useRef } from 'react'
import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Phone, PhoneOff, ArrowLeft, MoreVertical, Search, Check, 
  MessageCircle, Loader2, ChevronDown, Info, Settings, Trash2, LogOut, X, Edit3, Download
} from 'lucide-react'
import { useChatV2 } from '../_context/ChatContextV2'
import { MessageBubble } from './MessageBubble'
import { ChatInput } from './ChatInput'
import { useAuth } from '@/hooks/useAuth'
import { SyncAvatar } from './SyncAvatar'
import { ReactionType } from '../_lib/chat-service'

interface ChatWindowProps {
  primaryColor: string
  onShowGroupSettings: () => void
  onShowDirectChatSettings: () => void
  onBackToList: () => void
}

export function ChatWindow({
  primaryColor,
  onShowGroupSettings,
  onShowDirectChatSettings,
  onBackToList
}: ChatWindowProps) {
  const { user } = useAuth()
  const { 
    selectedChat, 
    messages, 
    isMessagesLoading,
    getChatDisplayName,
    getChatAvatar,
    typingUsers,
    deleteMessage,
    toggleReaction,
    editMessage,
  } = useChatV2()

  const [replyingTo, setReplyingTo] = useState<{ id: string; text: string; senderName: string } | null>(null)
  const [reactingToMessageId, setReactingToMessageId] = useState<string | null>(null)
  const [editingMessage, setEditingMessage] = useState<{ id: string; text: string } | null>(null)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showScrollBottom, setShowScrollBottom] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const REACTIONS: ReactionType[] = ['❤️', '👍', '😂', '😮', '😢', '🙏', '🔥', '👏', '💯', '✨']

  // Toggle search bar
  const handleSearchToggle = () => {
    setShowSearch(prev => {
      if (!prev) {
        setTimeout(() => searchInputRef.current?.focus(), 50)
      }
      return !prev
    })
    setSearchQuery('')
  }

  // Filter messages for search
  const filteredMessages = searchQuery.trim()
    ? messages.filter(m => m.text?.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages

  // Auto-scroll to bottom
  const scrollToBottom = (behavior: 'smooth' | 'auto' = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom('smooth')
    }
  }, [messages.length])

  // Handle scroll to show/hide "go to bottom" button
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    const isAtBottom = scrollHeight - scrollTop <= clientHeight + 100
    setShowScrollBottom(!isAtBottom)
  }

  const handleMessageAction = (msgId: string, action: string) => {
    // Implement other actions if needed
  }

  // Date Grouping Helper
  const groupMessagesByDate = () => {
    const groups: { [key: string]: typeof messages } = {}
    messages.forEach(msg => {
      const date = new Date(msg.timestamp).toDateString()
      if (!groups[date]) groups[date] = []
      groups[date].push(msg)
    })
    return groups
  }

  const formatGroupDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)

    if (date.toDateString() === now.toDateString()) return 'Today'
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
    
    return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
  }

  if (!selectedChat) {
    return (
      <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-gray-50/50">
        <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-xl shadow-gray-200/50 mb-8 animate-bounce transition-all duration-1000">
           <MessageCircle className="w-12 h-12 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Groups</h2>
        <p className="text-gray-500 max-w-sm text-center leading-relaxed font-medium">
          Select a conversation from the left to start messaging your team members.
        </p>
      </div>
    )
  }

  const displayName = getChatDisplayName(selectedChat)
  const avatar = getChatAvatar(selectedChat)
  const groupedMessages = groupMessagesByDate()

  return (
    <div className="flex-1 flex flex-col bg-white relative overflow-hidden">
      {/* Dynamic Header */}
      <div className="flex-shrink-0 flex items-center justify-between p-3 md:p-4 border-b border-gray-100 bg-white/80 backdrop-blur-md z-20">
        <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
          <button 
            onClick={onBackToList}
            className="md:hidden p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-xl transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="relative">
              <SyncAvatar 
                userId={selectedChat.type === 'direct' ? selectedChat.participants.find(id => id !== user?.uid) : undefined}
                initialAvatar={getChatAvatar(selectedChat)}
                fallbackName={getChatDisplayName(selectedChat)}
                isGroup={selectedChat.type === 'group'}
                bgColor={primaryColor}
                size="w-10 h-10 md:w-12 md:h-12"
                className="rounded-2xl shadow-sm ring-2 ring-white"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
            </div>
            <div className="flex flex-col min-w-0">
               <h2 className="font-bold text-[15px] md:text-[17px] text-gray-900 truncate">
                 {getChatDisplayName(selectedChat)}
               </h2>
               <div className="flex items-center gap-1.5 min-h-[16px]">
                  {typingUsers && typingUsers.length > 0 ? (
                    <span className="text-[11px] text-emerald-600 font-bold animate-pulse">
                      {typingUsers[0].userName.split(' ')[0]} is typing...
                    </span>
                  ) : (
                    <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest opacity-80">
                      {selectedChat.type === 'group' ? `${selectedChat.participants.length} members` : 'Online'}
                    </span>
                  )}
               </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-3">
          <button 
            onClick={handleSearchToggle}
            className={`p-2.5 rounded-2xl transition-all ${showSearch ? 'bg-emerald-50 text-emerald-600' : 'text-gray-400 hover:text-emerald-500 hover:bg-emerald-50'}`}
          >
            <Search className="w-5 h-5" />
          </button>
          <button className="p-2.5 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-2xl transition-all">
            <Phone className="w-5 h-5" />
          </button>
          <button 
            onClick={selectedChat.type === 'group' ? onShowGroupSettings : onShowDirectChatSettings}
            className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-2xl transition-all"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex-shrink-0 overflow-hidden border-b border-gray-100"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 px-4 py-2">
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search messages..."
                className="flex-1 text-sm bg-transparent focus:outline-none text-gray-800 font-medium placeholder:text-gray-400"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="text-[10px] text-gray-400 font-bold px-4 pb-2 uppercase tracking-widest">
                {filteredMessages.length} result{filteredMessages.length !== 1 ? 's' : ''}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Scroll Area */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-2 scroll-smooth scrollbar-thin scrollbar-thumb-gray-200 relative"
        style={{
          backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
          backgroundRepeat: 'repeat',
          backgroundSize: '400px',
          backgroundPosition: 'center',
          backgroundColor: '#efeae2', // Authentic WhatsApp background color
        }}
      >
        {/* Very subtle overlay to ensure text readability if needed, but authentic WA has no overlay */}
        <div className="absolute inset-0 bg-[#efeae2]/10 pointer-events-none z-0" />
        
        <div className="relative z-10 min-h-full flex flex-col justify-end">
        {isMessagesLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 opacity-50 flex-1">
             <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
             <p className="font-bold text-sm tracking-widest uppercase">Fetching Messages</p>
          </div>
        ) : (
          <div className="flex flex-col justify-end flex-1">
            {Object.entries(groupedMessages).map(([date, msgs], groupIdx) => (
              <React.Fragment key={date}>
                {/* Date Separator */}
                <div className="flex justify-center my-6 first:mt-2">
                  <div className="px-3 py-1 bg-white rounded-lg text-[12px] font-medium text-[#54656f] shadow-[0_1px_0.5px_rgba(11,20,26,.13)]">
                    {formatGroupDate(date)}
                  </div>
                </div>

                {/* Messages in Group */}
                {(() => {
                  const activeMsgs = searchQuery ? filteredMessages : msgs;
                  return activeMsgs.map((msg, i) => {
                    const isFirstInBatch = i === 0 || activeMsgs[i-1].senderId !== msg.senderId
                    const isHighlighted = searchQuery ? msg.text?.toLowerCase().includes(searchQuery.toLowerCase()) : true
                    if (!isHighlighted) return null
                    return (
                      <MessageBubble
                        key={msg.id}
                        message={msg}
                        isOwn={msg.senderId === user?.uid}
                        showAvatar={isFirstInBatch && selectedChat.type === 'group'}
                        primaryColor={primaryColor}
                        onReply={(reply) => setReplyingTo({ id: reply.id, text: reply.text, senderName: reply.senderName })}
                        onReaction={(id, reaction) => {
                          if (reaction === '') {
                            setReactingToMessageId(id)
                          } else {
                            toggleReaction(id, reaction)
                            setReactingToMessageId(null)
                          }
                        }}
                        onDelete={deleteMessage}
                        onEdit={(id, text) => {
                          setEditingMessage({ id, text })
                        }}
                        onImageClick={setSelectedImage}
                      />
                    )
                  })
                })()}
              </React.Fragment>
            ))}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        )}
        </div>
      </div>

      {/* "New Messages" or "Scroll to Bottom" button */}
      <AnimatePresence>
        {showScrollBottom && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            onClick={() => scrollToBottom()}
            className="absolute bottom-24 right-6 p-3 bg-white text-emerald-600 rounded-full shadow-2xl border border-gray-100 z-30 ring-4 ring-emerald-50"
          >
            <ChevronDown className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Reaction Picker — compact bottom sheet */}
      <AnimatePresence>
        {reactingToMessageId && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="absolute bottom-20 left-3 right-3 z-[40] bg-white border border-gray-100 shadow-xl rounded-2xl p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">React</span>
              <button 
                onClick={() => setReactingToMessageId(null)}
                className="p-0.5 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>
            <div className="flex overflow-x-auto gap-1 pb-1 scrollbar-none">
              {REACTIONS.map(reaction => (
                <button
                  key={reaction}
                  onClick={() => {
                    toggleReaction(reactingToMessageId, reaction)
                    setReactingToMessageId(null)
                  }}
                  className="text-2xl p-2 hover:scale-125 transition-all active:scale-90 rounded-lg hover:bg-gray-50 flex-shrink-0"
                >
                  {reaction}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Banner */}
      <AnimatePresence>
        {editingMessage && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex-shrink-0 overflow-hidden border-t border-blue-100 bg-blue-50"
          >
            <div className="flex items-center gap-2 px-4 py-2">
              <Edit3 className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <span className="text-xs text-blue-600 font-bold flex-1 truncate">Editing: {editingMessage.text}</span>
              <button onClick={() => setEditingMessage(null)} className="text-blue-400 hover:text-blue-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Area */}
      <div className="flex-shrink-0 relative z-20">
        <ChatInput 
          primaryColor={primaryColor}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
          editingMessage={editingMessage}
          onEditComplete={(newText) => {
            if (editingMessage) {
              editMessage(editingMessage.id, newText)
              setEditingMessage(null)
            }
          }}
          onCancelEdit={() => setEditingMessage(null)}
        />
      </div>
      
      {/* Image Viewer Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
            onClick={() => setSelectedImage(null)}
          >
            {/* Action Bar */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-end gap-3 bg-gradient-to-b from-black/50 to-transparent">
              <a 
                href={selectedImage} 
                download
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur text-white flex items-center justify-center"
              >
                <Download className="w-5 h-5" />
              </a>
              <button 
                onClick={() => setSelectedImage(null)}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur text-white flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              src={selectedImage}
              alt="Viewed attachment"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
