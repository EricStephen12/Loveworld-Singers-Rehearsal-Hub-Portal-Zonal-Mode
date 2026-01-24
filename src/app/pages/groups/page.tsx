'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useZone } from '@/hooks/useZone'
import { useFeatureTracking } from '@/hooks/useAnalyticsTracking'
import { ChatProviderV2, useChatV2 } from './_context/ChatContextV2'
import {
  ArrowLeft, MessageCircle, Users, Search, Plus, Send,
  Trash2, X, Check, Loader2, ChevronLeft, Phone, PhoneOff, Mic, MicOff,
  Settings, UserPlus, UserMinus, LogOut, Image, FileText, Download, Maximize2,
  Reply, Copy
} from 'lucide-react'
import type { ChatUser, ReactionType } from './_lib/chat-service'
import { useCall } from '@/contexts/CallContext'

// Reaction options - more variety
const REACTIONS: ReactionType[] = ['❤️', '👍', '😂', '😮', '😢', '🙏', '🔥', '👏', '💯', '🎉']

// Main page wrapper with provider
export default function GroupsPage() {
  return (
    <ChatProviderV2>
      <GroupsContent />
    </ChatProviderV2>
  )
}

function GroupsContent() {
  const router = useRouter()
  const { user, profile, isLoading: authLoading } = useAuth()
  const { currentZone } = useZone()

  // Track groups/chat usage
  useFeatureTracking('groups_chat')

  const {
    chats,
    selectedChat,
    messages,
    currentUser,
    isLoading,
    isMessagesLoading,
    selectChat,
    sendMessage,
    sendMediaMessage,
    startDirectChat,
    createGroupChat,
    searchUsers,
    deleteChat,
    deleteMessage,
    toggleReaction,
    addGroupMembers,
    removeGroupMember,
    leaveGroup,
    deleteGroup,
    isGroupCreator,
    getChatDisplayName,
    getChatAvatar
  } = useChatV2()

  const [showNewChat, setShowNewChat] = useState(false)
  const [showNewGroup, setShowNewGroup] = useState(false)
  const [showGroupSettings, setShowGroupSettings] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<ChatUser[]>([])
  const [isSearching, setIsSearching] = useState(false)
  // Separate search state for group settings to avoid conflicts
  const [groupSettingsSearchTerm, setGroupSettingsSearchTerm] = useState('')
  const [groupSettingsSearchResults, setGroupSettingsSearchResults] = useState<ChatUser[]>([])
  const [isGroupSettingsSearching, setIsGroupSettingsSearching] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Group creation state
  const [groupName, setGroupName] = useState('')
  const [selectedMembers, setSelectedMembers] = useState<ChatUser[]>([])
  const [isCreatingGroup, setIsCreatingGroup] = useState(false)
  const [groupStep, setGroupStep] = useState<1 | 2>(1)
  // Voice call - use shared context
  const { callState, startCall } = useCall()

  // Message actions state
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null)
  const [messageSearchTerm, setMessageSearchTerm] = useState('')
  const [showMessageSearch, setShowMessageSearch] = useState(false)
  const [viewingImage, setViewingImage] = useState<string | null>(null)
  const [replyingTo, setReplyingTo] = useState<{ id: string; text: string; senderName: string } | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle URL parameters for incoming calls from notifications
  useEffect(() => {
    if (typeof window === 'undefined') return

    const urlParams = new URLSearchParams(window.location.search)
    const callId = urlParams.get('call')
    const action = urlParams.get('action')

    if (callId) {

      // Dispatch event to trigger the call UI
      window.dispatchEvent(new CustomEvent('incomingVoiceCall', {
        detail: {
          callId,
          action: action || 'show',
          fromNotification: true,
          timestamp: Date.now()
        }
      }))

      // Clean up URL params
      const newUrl = window.location.pathname
      window.history.replaceState({}, '', newUrl)
    }
  }, [])

  // Search users
  useEffect(() => {
    const search = async () => {
      if (!searchTerm.trim()) {
        setSearchResults([])
        return
      }

      setIsSearching(true)
      const results = await searchUsers(searchTerm)
      setSearchResults(results)
      setIsSearching(false)
    }

    const debounce = setTimeout(search, 300)
    return () => clearTimeout(debounce)
  }, [searchTerm, searchUsers])

  // Search users for group settings (separate to avoid conflicts)
  useEffect(() => {
    const search = async () => {
      if (!groupSettingsSearchTerm.trim()) {
        setGroupSettingsSearchResults([])
        return
      }

      setIsGroupSettingsSearching(true)
      const results = await searchUsers(groupSettingsSearchTerm)
      setGroupSettingsSearchResults(results)
      setIsGroupSettingsSearching(false)
    }

    const debounce = setTimeout(search, 300)
    return () => clearTimeout(debounce)
  }, [groupSettingsSearchTerm, searchUsers])

  useEffect(() => {
    if (!showGroupSettings) {
      setGroupSettingsSearchTerm('')
      setGroupSettingsSearchResults([])
    }
  }, [showGroupSettings])

  // Handle starting a direct chat
  const handleStartChat = async (user: ChatUser) => {

    const chatId = await startDirectChat(user)

    if (chatId) {
      // Close the modal first
      setShowNewChat(false)
      setSearchTerm('')
      setSearchResults([])

      // Try to find the chat immediately, or wait for subscription to update
      const findAndSelectChat = (attempts = 0) => {
        const chat = chats.find(c => c.id === chatId)

        if (chat) {
          selectChat(chat)
        } else if (attempts < 10) {
          // Keep trying for up to 5 seconds (10 attempts * 500ms)
          setTimeout(() => findAndSelectChat(attempts + 1), 500)
        } else {
          // If still not found, create a temporary chat object to select
          const tempChat = {
            id: chatId,
            type: 'direct' as const,
            participants: [currentUser?.id || '', user.id],
            participantDetails: {
              [currentUser?.id || '']: { name: currentUser?.name || '' },
              [user.id]: { name: user.name }
            },
            createdBy: currentUser?.id || '',
            createdAt: new Date(),
            unreadCount: {}
          }
          selectChat(tempChat)
        }
      }

      // Start looking for the chat
      setTimeout(() => findAndSelectChat(0), 300)
    } else {
      console.error('[Groups] Failed to create/get chat')
      alert('Failed to start chat. Please try again.')
    }
  }

  // Handle creating a group
  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedMembers.length === 0) return

    setIsCreatingGroup(true)
    const chatId = await createGroupChat(groupName, selectedMembers)
    setIsCreatingGroup(false)

    if (chatId) {
      setShowNewGroup(false)
      setGroupName('')
      setSelectedMembers([])
      setSearchTerm('')
      setSearchResults([])
      setGroupStep(1) // Reset to step 1 for next time
    }
  }

  // Handle sending message
  const handleSend = async () => {
    if (!messageText.trim() || isSending) return

    setIsSending(true)
    const success = await sendMessage(messageText.trim(), replyingTo || undefined)
    setIsSending(false)

    if (success) {
      setMessageText('')
      setReplyingTo(null)
      inputRef.current?.focus()
    }
  }

  // Handle file selection and upload
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'document') => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File too large. Maximum size is 10MB.')
      return
    }

    // Validate file type
    if (type === 'image' && !file.type.startsWith('image/')) {
      alert('Please select an image file.')
      return
    }

    setIsUploading(true)

    const success = await sendMediaMessage(file)

    setIsUploading(false)

    if (!success) {
      alert('Failed to send file. Please try again.')
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // Start voice call using shared context
  const handleStartCall = async () => {
    if (!selectedChat || !currentUser || selectedChat.type === 'group' || callState !== 'idle') return

    const otherUserId = selectedChat.participants.find(id => id !== user?.uid)
    if (!otherUserId) return

    const otherUserName = getChatDisplayName(selectedChat)

    const success = await startCall(
      selectedChat.id,
      otherUserId,
      currentUser.name,
      otherUserName
    )

    if (!success) {
      alert('Failed to start call. Please check microphone permissions.')
    }
  }

  // Format time
  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(mins / 60)
    const days = Math.floor(hours / 24)

    if (mins < 1) return 'now'
    if (mins < 60) return `${mins}m`
    if (hours < 24) return `${hours}h`
    if (days < 7) return `${days}d`
    return new Date(date).toLocaleDateString()
  }

  // Theme color - declare early for use in loading states
  const themeColor = currentZone?.themeColor || '#10b981'
  const primaryColor = themeColor


  return (
    <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
      {/* Header - hide on mobile when chat selected */}
      <div
        className={`flex-shrink-0 p-4 text-white ${selectedChat ? 'hidden md:block' : ''}`}
        style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${adjustColor(primaryColor, -20)} 100%)` }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/home')}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold">Messages</h1>
              <p className="text-sm opacity-90">Chat with members</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNewChat(true)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="New chat"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowNewGroup(true)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="New group"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat list - hide on mobile when chat selected */}
        <div className={`w-full md:w-80 lg:w-96 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
          {/* Search in list */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search chats..."
                className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Chat list */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto" />
              </div>
            ) : chats.length === 0 ? (
              <div className="p-8 text-center">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No conversations yet</p>
                <button
                  onClick={() => setShowNewChat(true)}
                  className="mt-3 px-4 py-2 text-white text-sm font-medium rounded-lg"
                  style={{ backgroundColor: primaryColor }}
                >
                  Start a chat
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {chats.map(chat => {
                  const displayName = getChatDisplayName(chat)
                  const avatar = getChatAvatar(chat)
                  const isSelected = selectedChat?.id === chat.id

                  return (
                    <button
                      key={chat.id}
                      onClick={() => selectChat(chat)}
                      className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left ${isSelected ? 'bg-gray-50' : ''
                        }`}
                      style={isSelected ? { borderRight: `4px solid ${primaryColor}`, backgroundColor: `${primaryColor}10` } : undefined}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0`}
                        style={{ backgroundColor: chat.type === 'group' ? adjustColor(primaryColor, -30) : primaryColor }}
                      >
                        {chat.type === 'group' ? (
                          <Users className="w-6 h-6" />
                        ) : avatar ? (
                          <img src={avatar} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          displayName.charAt(0).toUpperCase()
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">{displayName}</h3>
                          {chat.lastMessage && (
                            <span className="text-xs text-gray-500">
                              {formatTime(chat.lastMessage.timestamp)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {chat.lastMessage?.text || 'No messages yet'}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Chat view */}
        <div className={`flex-1 flex flex-col bg-gray-50 ${selectedChat ? 'flex' : 'hidden md:flex'}`}>
          {selectedChat ? (
            <>
              {/* Chat header */}
              <div
                className="flex-shrink-0 p-3 text-white flex items-center gap-3"
                style={{ background: `linear-gradient(135deg, ${themeColor} 0%, ${adjustColor(themeColor, -20)} 100%)` }}
              >
                <button
                  onClick={() => selectChat(null)}
                  className="p-2 hover:bg-white/20 rounded-lg md:hidden"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${selectedChat.type === 'group' ? 'bg-white/20 cursor-pointer' : 'bg-white/20'
                    }`}
                  onClick={() => selectedChat.type === 'group' && setShowGroupSettings(true)}
                >
                  {selectedChat.type === 'group' ? (
                    <Users className="w-5 h-5" />
                  ) : (
                    getChatDisplayName(selectedChat).charAt(0).toUpperCase()
                  )}
                </div>

                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => selectedChat.type === 'group' && setShowGroupSettings(true)}
                >
                  <h2 className="font-semibold truncate">{getChatDisplayName(selectedChat)}</h2>
                  <p className="text-xs opacity-80">
                    {selectedChat.type === 'group'
                      ? `${selectedChat.participants.length} members • Tap for info`
                      : 'Direct message'
                    }
                  </p>
                </div>

                {/* Message Search Button */}
                <button
                  onClick={() => setShowMessageSearch(!showMessageSearch)}
                  className={`p-2 rounded-lg transition-colors ${showMessageSearch ? 'bg-white/30' : 'hover:bg-white/20'}`}
                  title="Search messages"
                >
                  <Search className="w-5 h-5" />
                </button>

                {/* Voice Call Button - Only for direct chats */}
                {selectedChat.type === 'direct' && callState === 'idle' && (
                  <button
                    onClick={handleStartCall}
                    className="p-2 hover:bg-white/20 rounded-lg"
                    title="Voice call"
                  >
                    <Phone className="w-5 h-5" />
                  </button>
                )}

                {/* Group Settings Button */}
                {selectedChat.type === 'group' && (
                  <button
                    onClick={() => setShowGroupSettings(true)}
                    className="p-2 hover:bg-white/20 rounded-lg"
                    title="Group settings"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                )}

                {/* Delete/Leave button for direct chats only */}
                {selectedChat.type === 'direct' && (
                  <button
                    onClick={() => {
                      if (confirm('Delete this chat?')) {
                        deleteChat(selectedChat.id)
                      }
                    }}
                    className="p-2 hover:bg-white/20 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Message Search Bar */}
              {showMessageSearch && (
                <div className="flex-shrink-0 p-2 bg-white border-b border-gray-200">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={messageSearchTerm}
                      onChange={(e) => setMessageSearchTerm(e.target.value)}
                      placeholder="Search in conversation..."
                      className="w-full pl-9 pr-8 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                      autoFocus
                    />
                    {messageSearchTerm && (
                      <button
                        onClick={() => setMessageSearchTerm('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full"
                      >
                        <X className="w-3 h-3 text-gray-500" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {isMessagesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">No messages yet. Say hello!</p>
                  </div>
                ) : (
                  // Filter messages by search term if searching
                  messages
                    .filter(msg => !messageSearchTerm || msg.text.toLowerCase().includes(messageSearchTerm.toLowerCase()))
                    .map(msg => {
                      const isOwn = msg.senderId === currentUser?.id
                      const isSystem = msg.type === 'system'
                      const isSelected = selectedMessageId === msg.id

                      if (isSystem) {
                        return (
                          <div key={msg.id} className="text-center">
                            <span className="inline-block px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                              {msg.text}
                            </span>
                          </div>
                        )
                      }

                      // Get reaction counts
                      const reactionCounts: Record<string, number> = {}
                      if (msg.reactions) {
                        Object.values(msg.reactions).forEach(reaction => {
                          reactionCounts[reaction] = (reactionCounts[reaction] || 0) + 1
                        })
                      }
                      const hasReactions = Object.keys(reactionCounts).length > 0

                      return (
                        <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] relative ${isOwn ? 'order-2' : ''}`}>
                            {!isOwn && selectedChat.type === 'group' && (
                              <p className="text-xs text-gray-500 mb-1 ml-1">{msg.senderName}</p>
                            )}

                            {/* Message bubble with tap handler */}
                            <div
                              className={`rounded-2xl cursor-pointer transition-all ${isOwn
                                ? 'text-white rounded-br-md'
                                : 'bg-white text-gray-900 rounded-bl-md shadow-sm'
                                } ${isSelected ? 'ring-2 ring-offset-1' : ''} ${msg.type === 'image' ? 'p-1' : 'px-4 py-2'}`}
                              style={isOwn ? { backgroundColor: primaryColor, ...(isSelected && { '--tw-ring-color': primaryColor } as React.CSSProperties) } : (isSelected ? { '--tw-ring-color': primaryColor } as React.CSSProperties : undefined)}
                              onClick={() => setSelectedMessageId(isSelected ? null : msg.id)}
                            >
                              {msg.replyTo && (
                                <div className={`text-xs mb-1 pb-1 border-b ${msg.type === 'image' ? 'mx-2 mt-1' : ''} ${isOwn ? 'border-white/30 text-white/80' : 'border-gray-200 text-gray-500'
                                  }`}>
                                  ↩ {msg.replyTo.senderName}: {msg.replyTo.text.slice(0, 50)}
                                </div>
                              )}

                              {/* Image message */}
                              {msg.type === 'image' && msg.imageUrl && !msg.deleted && (
                                <div className="relative group">
                                  <img
                                    src={msg.imageUrl}
                                    alt="Shared image"
                                    className="w-[180px] sm:w-[200px] max-h-[200px] rounded-xl object-cover"
                                  />
                                  {/* Expand icon overlay */}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setViewingImage(msg.imageUrl!)
                                    }}
                                    className="absolute bottom-2 right-2 w-7 h-7 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
                                  >
                                    <Maximize2 className="w-3.5 h-3.5 text-white" />
                                  </button>
                                </div>
                              )}

                              {/* Document message */}
                              {msg.type === 'document' && msg.attachment && !msg.deleted && (
                                <a
                                  href={msg.attachment.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className={`flex items-center gap-3 p-2 rounded-lg ${isOwn ? 'bg-white/20 hover:bg-white/30' : 'bg-gray-100 hover:bg-gray-200'
                                    } transition-colors`}
                                >
                                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isOwn ? 'bg-white/20' : 'bg-blue-100'
                                    }`}>
                                    <FileText className={`w-5 h-5 ${isOwn ? 'text-white' : 'text-blue-600'}`} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium truncate ${isOwn ? 'text-white' : 'text-gray-900'}`}>
                                      {msg.attachment.name}
                                    </p>
                                    {msg.attachment.size && (
                                      <p className={`text-xs ${isOwn ? 'text-white/70' : 'text-gray-500'}`}>
                                        {formatFileSize(msg.attachment.size)}
                                      </p>
                                    )}
                                  </div>
                                  <Download className={`w-4 h-4 flex-shrink-0 ${isOwn ? 'text-white/70' : 'text-gray-400'}`} />
                                </a>
                              )}

                              {/* Text content (show for text messages or as caption for media) */}
                              {(msg.type === 'text' || msg.deleted || (msg.text && msg.text !== '📷 Image' && msg.text !== '📄 Document')) && (
                                <p className={`text-sm ${msg.deleted ? 'italic opacity-70' : ''} ${msg.type === 'image' ? 'px-2 pb-1 pt-1' : ''}`}>
                                  {msg.deleted ? 'This message was deleted' : msg.text}
                                </p>
                              )}
                            </div>

                            {/* Reactions display */}
                            {hasReactions && (
                              <div className={`flex flex-wrap gap-1 mt-1 ${isOwn ? 'justify-end mr-1' : 'ml-1'}`}>
                                {Object.entries(reactionCounts).map(([emoji, count]) => (
                                  <span
                                    key={emoji}
                                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-gray-100 rounded-full text-xs cursor-pointer hover:bg-gray-200"
                                    onClick={() => toggleReaction(msg.id, emoji as ReactionType)}
                                  >
                                    {emoji} {count > 1 && <span className="text-gray-500">{count}</span>}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Action bar with reactions - shows directly when message is selected */}
                            {isSelected && !msg.deleted && (
                              <div
                                className={`fixed left-2 right-2 bottom-20 sm:absolute sm:left-auto sm:right-auto sm:bottom-auto ${isOwn ? 'sm:right-0' : 'sm:left-0'} sm:-bottom-14 bg-white rounded-2xl shadow-lg p-2 z-50`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {/* Reactions row - horizontal scrollable */}
                                <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide">
                                  {REACTIONS.map(emoji => (
                                    <button
                                      key={emoji}
                                      onClick={() => {
                                        toggleReaction(msg.id, emoji)
                                        setSelectedMessageId(null)
                                      }}
                                      className="flex-shrink-0 w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-full text-xl transition-transform hover:scale-110 active:scale-95"
                                    >
                                      {emoji}
                                    </button>
                                  ))}

                                  <div className="w-px h-6 bg-gray-200 mx-1 flex-shrink-0" />

                                  {/* Reply button */}
                                  <button
                                    onClick={() => {
                                      setReplyingTo({
                                        id: msg.id,
                                        text: msg.text || (msg.type === 'image' ? '📷 Image' : '📄 Document'),
                                        senderName: msg.senderName
                                      })
                                      setSelectedMessageId(null)
                                      inputRef.current?.focus()
                                    }}
                                    className="flex-shrink-0 w-9 h-9 flex items-center justify-center hover:bg-blue-50 rounded-full"
                                    title="Reply"
                                  >
                                    <Reply className="w-5 h-5 text-blue-500" />
                                  </button>

                                  {/* Copy button - only for text messages */}
                                  {msg.type === 'text' && msg.text && (
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(msg.text)
                                        setSelectedMessageId(null)
                                      }}
                                      className="flex-shrink-0 w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-full"
                                      title="Copy"
                                    >
                                      <Copy className="w-5 h-5 text-gray-500" />
                                    </button>
                                  )}

                                  {/* Delete button inline - only for own messages */}
                                  {isOwn && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        if (confirm('Delete this message?')) {
                                          deleteMessage(msg.id)
                                          setSelectedMessageId(null)
                                        }
                                      }}
                                      className="flex-shrink-0 w-9 h-9 flex items-center justify-center hover:bg-red-50 rounded-full"
                                    >
                                      <Trash2 className="w-5 h-5 text-red-500" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}

                            <p className={`text-[10px] text-gray-400 mt-1 ${isOwn ? 'text-right mr-1' : 'ml-1'}`}>
                              {formatTime(msg.timestamp)}
                            </p>
                          </div>
                        </div>
                      )
                    })
                )}
                {/* Show message when search has no results */}
                {messageSearchTerm && messages.filter(msg => msg.text.toLowerCase().includes(messageSearchTerm.toLowerCase())).length === 0 && (
                  <div className="text-center py-8">
                    <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No messages found for "{messageSearchTerm}"</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message input - expandable textarea */}
              <div className="flex-shrink-0 p-3 bg-white border-t border-gray-200">
                {/* Reply preview */}
                {replyingTo && (
                  <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-gray-100 rounded-lg border-l-4" style={{ borderLeftColor: primaryColor }}>
                    <Reply className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-600">{replyingTo.senderName}</p>
                      <p className="text-sm text-gray-500 truncate">{replyingTo.text}</p>
                    </div>
                    <button
                      onClick={() => setReplyingTo(null)}
                      className="p-1 hover:bg-gray-200 rounded-full flex-shrink-0"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                )}

                {/* Uploading indicator */}
                {isUploading && (
                  <div className="flex items-center gap-2 mb-2 px-2 py-1.5 bg-gray-100 rounded-lg">
                    <Loader2 className="w-4 h-4 animate-spin" style={{ color: primaryColor }} />
                    <span className="text-sm text-gray-600">Uploading...</span>
                  </div>
                )}

                <div className="flex items-end gap-2">
                  {/* Image attachment button */}
                  <button
                    onClick={() => {
                      const input = document.createElement('input')
                      input.type = 'file'
                      input.accept = 'image/*'
                      input.onchange = (e) => handleFileSelect(e as any, 'image')
                      input.click()
                    }}
                    className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors flex-shrink-0"
                    disabled={isUploading}
                    title="Send image"
                  >
                    <Image className="w-5 h-5 text-gray-500" />
                  </button>

                  <textarea
                    ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                    value={messageText}
                    onChange={(e) => {
                      setMessageText(e.target.value)
                      // Auto-resize textarea
                      e.target.style.height = 'auto'
                      e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSend()
                      }
                    }}
                    placeholder="Type a message..."
                    rows={1}
                    className="flex-1 px-4 py-2.5 bg-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 resize-none overflow-y-auto"
                    style={{
                      minHeight: '42px',
                      maxHeight: '120px',
                      '--tw-ring-color': primaryColor
                    } as React.CSSProperties}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!messageText.trim() || isSending || isUploading}
                    className="w-10 h-10 text-white rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {isSending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e, 'image')}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Select a chat</h3>
                <p className="text-gray-500 text-sm">Choose a conversation or start a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Modal - Full Screen Overlay */}
      {showNewChat && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          {/* Header */}
          <div
            className="flex-shrink-0 p-4 text-white flex items-center gap-3"
            style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${adjustColor(primaryColor, -20)} 100%)` }}
          >
            <button
              onClick={() => { setShowNewChat(false); setSearchTerm(''); setSearchResults([]) }}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h2 className="text-lg font-semibold">New Chat</h2>
              <p className="text-sm opacity-80">Search members to start chatting</p>
            </div>
          </div>

          {/* Search Input */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name..."
                className="w-full pl-11 pr-4 py-3 bg-gray-100 rounded-xl text-base focus:outline-none focus:ring-2"
                style={{ '--tw-ring-color': primaryColor } as any}
                autoFocus
              />
              {searchTerm && (
                <button
                  onClick={() => { setSearchTerm(''); setSearchResults([]) }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto">
            {isSearching ? (
              <div className="py-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: primaryColor }} />
                <p className="text-gray-500 text-sm mt-2">Searching...</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="py-12 text-center px-4">
                {searchTerm ? (
                  <>
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No members found for "{searchTerm}"</p>
                  </>
                ) : (
                  <>
                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Type a name to search for members</p>
                  </>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {searchResults.map(user => (
                  <button
                    key={user.id}
                    onClick={() => handleStartChat(user)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left active:bg-gray-100"
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                      {user.zoneName && (
                        <p className="text-sm text-gray-500 truncate">{user.zoneName}</p>
                      )}
                    </div>
                    <MessageCircle className="w-5 h-5 text-gray-400" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Group Modal - Multi-Step Bottom Sheet */}
      {showNewGroup && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Step 1: Group Name */}
            {groupStep === 1 && (
              <>
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="text-lg font-semibold">New Group</h3>
                  <button onClick={() => { setShowNewGroup(false); setGroupName(''); setGroupStep(1) }}>
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="p-6 flex-1">
                  <div className="text-center mb-6">
                    <div
                      className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                      style={{ backgroundColor: `${primaryColor}15` }}
                    >
                      <Users className="w-10 h-10" style={{ color: primaryColor }} />
                    </div>
                    <p className="text-gray-500 text-sm">Give your group a name</p>
                  </div>

                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Group name"
                    className="w-full px-4 py-3 bg-gray-100 rounded-xl text-base text-center focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': primaryColor } as any}
                    autoFocus
                  />
                </div>

                <div className="p-4 border-t">
                  <button
                    onClick={() => setGroupStep(2)}
                    disabled={!groupName.trim()}
                    className="w-full py-3 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Next
                    <ChevronLeft className="w-5 h-5 rotate-180" />
                  </button>
                </div>
              </>
            )}

            {/* Step 2: Add Members */}
            {groupStep === 2 && (
              <>
                <div className="flex items-center gap-3 p-4 border-b">
                  <button
                    onClick={() => setGroupStep(1)}
                    className="p-1 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-500" />
                  </button>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">Add Members</h3>
                    <p className="text-xs text-gray-500">{groupName}</p>
                  </div>
                  <button onClick={() => { setShowNewGroup(false); setGroupName(''); setSelectedMembers([]); setGroupStep(1); setSearchTerm(''); setSearchResults([]) }}>
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Selected Members */}
                {selectedMembers.length > 0 && (
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                    <p className="text-xs text-gray-500 mb-2 font-medium">
                      {selectedMembers.length} member{selectedMembers.length > 1 ? 's' : ''} selected
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedMembers.map(m => (
                        <span
                          key={m.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-sm rounded-full font-medium"
                          style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                        >
                          {m.name}
                          <button onClick={() => setSelectedMembers(prev => prev.filter(p => p.id !== m.id))}>
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Search */}
                <div className="p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search members..."
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': primaryColor } as any}
                      autoFocus
                    />
                  </div>
                </div>

                {/* Results */}
                <div className="flex-1 overflow-y-auto px-4 max-h-60">
                  {isSearching ? (
                    <div className="py-8 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" style={{ color: primaryColor }} />
                    </div>
                  ) : searchResults.filter(u => !selectedMembers.find(m => m.id === u.id)).length === 0 ? (
                    <div className="py-8 text-center text-gray-500 text-sm">
                      {searchTerm ? 'No members found' : 'Search for members to add'}
                    </div>
                  ) : (
                    searchResults.filter(u => !selectedMembers.find(m => m.id === u.id)).map(user => (
                      <button
                        key={user.id}
                        onClick={() => setSelectedMembers(prev => [...prev, user])}
                        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                      >
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                          style={{ backgroundColor: primaryColor }}
                        >
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{user.name}</p>
                          {user.zoneName && (
                            <p className="text-xs text-gray-500 truncate">{user.zoneName}</p>
                          )}
                        </div>
                        <Plus className="w-5 h-5 text-gray-400" />
                      </button>
                    ))
                  )}
                </div>

                <div className="p-4 border-t">
                  <button
                    onClick={handleCreateGroup}
                    disabled={selectedMembers.length === 0 || isCreatingGroup}
                    className="w-full py-3 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {isCreatingGroup ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        Create Group ({selectedMembers.length})
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {viewingImage && (
        <div
          className="fixed inset-0 z-[300] bg-black/95 flex flex-col"
          onClick={() => setViewingImage(null)}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setViewingImage(null)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={async (e) => {
                e.stopPropagation()
                try {
                  // Fetch the image and create a blob for download
                  const response = await fetch(viewingImage)
                  const blob = await response.blob()
                  const url = window.URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `image_${Date.now()}.${blob.type.split('/')[1] || 'jpg'}`
                  document.body.appendChild(a)
                  a.click()
                  document.body.removeChild(a)
                  window.URL.revokeObjectURL(url)
                } catch (error) {
                  console.error('Download failed:', error)
                  // Fallback: open in new tab
                  window.open(viewingImage, '_blank')
                }
              }}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <Download className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Image */}
          <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
            <img
              src={viewingImage}
              alt="Full size image"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Group Settings Modal */}
      {showGroupSettings && selectedChat?.type === 'group' && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="flex items-center gap-3 p-4 text-white rounded-t-2xl"
              style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${adjustColor(primaryColor, -20)} 100%)` }}
            >
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{getChatDisplayName(selectedChat)}</h3>
                <p className="text-sm opacity-80">{selectedChat.participants.length} members</p>
              </div>
              <button
                onClick={() => setShowGroupSettings(false)}
                className="p-2 hover:bg-white/20 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Members List */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <h4 className="text-sm font-semibold text-gray-500 mb-3">Members</h4>
                <div className="space-y-2">
                  {selectedChat.participants.map(participantId => {
                    const details = selectedChat.participantDetails[participantId]
                    const isCreator = selectedChat.createdBy === participantId
                    const isCurrentUser = participantId === user?.uid

                    return (
                      <div
                        key={participantId}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                      >
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                          style={{ backgroundColor: primaryColor }}
                        >
                          {details?.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {details?.name || 'Unknown'}
                            {isCurrentUser && <span className="text-gray-500 text-sm"> (You)</span>}
                          </p>
                          {isCreator && (
                            <p className="text-xs text-emerald-600 font-medium">Creator</p>
                          )}
                        </div>

                        {/* Remove button - only for creator, can't remove self */}
                        {isGroupCreator() && !isCurrentUser && (
                          <button
                            onClick={async () => {
                              if (confirm(`Remove ${details?.name} from the group?`)) {
                                await removeGroupMember(participantId)
                              }
                            }}
                            className="p-2 hover:bg-red-50 rounded-lg text-red-500"
                            title="Remove member"
                          >
                            <UserMinus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Add Members - Creator only */}
              {isGroupCreator() && (
                <div className="p-4 border-t border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-500 mb-3">Add Members</h4>
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={groupSettingsSearchTerm}
                      onChange={(e) => setGroupSettingsSearchTerm(e.target.value)}
                      placeholder="Search members to add..."
                      className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                    />
                  </div>

                  {isGroupSettingsSearching ? (
                    <div className="py-4 text-center">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto" style={{ color: primaryColor }} />
                    </div>
                  ) : groupSettingsSearchResults.filter(u => !selectedChat.participants.includes(u.id)).length > 0 ? (
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {groupSettingsSearchResults.filter(u => !selectedChat.participants.includes(u.id)).map(searchUser => (
                        <button
                          key={searchUser.id}
                          onClick={async () => {
                            await addGroupMembers([searchUser])
                            setGroupSettingsSearchTerm('')
                            setGroupSettingsSearchResults([])
                          }}
                          className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 text-left"
                        >
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                            style={{ backgroundColor: primaryColor }}
                          >
                            {searchUser.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="flex-1 text-sm truncate">{searchUser.name}</span>
                          <UserPlus className="w-4 h-4 text-gray-400" />
                        </button>
                      ))}
                    </div>
                  ) : groupSettingsSearchTerm ? (
                    <p className="text-sm text-gray-500 text-center py-2">No members found</p>
                  ) : null}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-gray-200 space-y-2">
              {isGroupCreator() ? (
                // Creator can delete the group
                <button
                  onClick={async () => {
                    if (confirm('Delete this group? This will remove all messages and cannot be undone.')) {
                      await deleteGroup()
                      setShowGroupSettings(false)
                    }
                  }}
                  className="w-full py-3 bg-red-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                  Delete Group
                </button>
              ) : (
                // Members can leave the group
                <button
                  onClick={async () => {
                    if (confirm('Leave this group?')) {
                      await leaveGroup()
                      setShowGroupSettings(false)
                    }
                  }}
                  className="w-full py-3 bg-red-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-red-600 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Leave Group
                </button>
              )}

              <button
                onClick={() => setShowGroupSettings(false)}
                className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper to adjust color brightness
function adjustColor(color: string, amount: number): string {
  const hex = color.replace('#', '')
  const num = parseInt(hex, 16)
  const r = Math.max(0, Math.min(255, (num >> 16) + amount))
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount))
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}
