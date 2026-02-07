'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useZone } from '@/hooks/useZone'
import { useFeatureTracking } from '@/hooks/useAnalyticsTracking'
import { ChatProviderV2, useChatV2 } from './_context/ChatContextV2'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, MessageCircle, Users, Search, Plus, Send,
  Trash2, X, Check, Loader2, ChevronLeft, Phone, PhoneOff, Mic, MicOff,
  MoreVertical, FileText, Download, Reply, Copy, Smile, LogOut, UserPlus, Image as ImageIcon,
  Maximize2, Paperclip, Settings, UserMinus, PhoneMissed, Edit3, Camera, User, Mail, Info
} from 'lucide-react'
import type { UserProfile } from '@/types/supabase'
import { FirebaseDatabaseService } from '@/lib/firebase-database'
import type { ChatUser, ReactionType, Message } from './_lib/chat-service'
import { togglePinChat as togglePinChatService } from './_lib/chat-service'
import { useCall } from '@/contexts/CallContext'

// Reaction options - more variety
const REACTIONS: ReactionType[] = ['❤️', '👍', '😂', '😮', '😢', '🙏', '🔥', '👏', '💯', '🎉']

// Helper component for voice messages
const VoiceMessagePlayer = ({ url, duration, isOwn, primaryColor }: { url: string, duration?: number, isOwn: boolean, primaryColor: string }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!audioRef.current) return
    if (isPlaying) audioRef.current.pause()
    else audioRef.current.play()
  }

  const formatVoiceTime = (time: number) => {
    const mins = Math.floor(time / 60)
    const secs = Math.floor(time % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Generate 25 waveform bars
  const waveBars = Array.from({ length: 25 }, (_, i) => ({
    height: 10 + Math.random() * 20,
    delay: i * 0.05
  }))

  return (
    <div className={`flex items-center gap-3 p-2 rounded-2xl min-w-[240px] ${isOwn ? 'bg-emerald-600/20' : 'bg-gray-100'}`} onClick={(e) => e.stopPropagation()}>
      <button
        onClick={togglePlay}
        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isOwn ? 'bg-white text-emerald-600' : 'bg-emerald-500 text-white'} shadow-sm transition-all hover:scale-105 active:scale-95`}
      >
        {isPlaying ? (
          <div className="flex gap-1 items-center justify-center">
            <div className="w-1 h-4 bg-current rounded-full" />
            <div className="w-1 h-4 bg-current rounded-full" />
          </div>
        ) : (
          <div className="ml-1 w-0 h-0 border-t-[7px] border-t-transparent border-l-[11px] border-l-current border-b-[7px] border-b-transparent" />
        )}
      </button>

      <div className="flex-1 flex flex-col gap-1">
        <div className="flex items-end gap-[2px] h-8 px-1">
          {waveBars.map((bar, i) => {
            const barProgress = (i / waveBars.length) * 100
            const isActive = progress >= barProgress
            return (
              <motion.div
                key={i}
                initial={{ height: 10 }}
                animate={isPlaying ? { height: [bar.height, bar.height * 0.5, bar.height] } : { height: bar.height }}
                transition={isPlaying ? { duration: 0.8, repeat: Infinity, delay: bar.delay } : {}}
                className={`w-[3px] rounded-full transition-colors ${isActive ? (isOwn ? 'bg-white' : 'bg-emerald-500') : (isOwn ? 'bg-white/30' : 'bg-gray-300')}`}
                style={{ height: `${bar.height}px` }}
              />
            )
          })}
        </div>

        <div className="flex justify-between items-center px-1">
          <span className={`text-[10px] font-bold ${isOwn ? 'text-white' : 'text-gray-500'}`}>
            {formatVoiceTime(isPlaying ? currentTime : (duration || 0))}
          </span>
          <div className="flex items-center gap-1">
            <Mic className={`w-3 h-3 ${isOwn ? 'text-white/70' : 'text-gray-400'}`} />
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={url}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false)
          setProgress(0)
          setCurrentTime(0)
        }}
        onTimeUpdate={(e) => {
          const audio = e.currentTarget
          setCurrentTime(audio.currentTime)
          setProgress((audio.currentTime / audio.duration) * 100)
        }}
        className="hidden"
      />
    </div>
  )
}

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
  const { user, profile, isLoading: authLoading, refreshProfile } = useAuth()
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
    sendVoiceMessage,
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
    renameGroup,
    setTypingStatus,
    typingUsers,
    isGroupCreator,
    getChatDisplayName,
    getChatAvatar,
    allTypingUsers = {}
  } = useChatV2()

  const [showNewChat, setShowNewChat] = useState(false)
  const [showNewGroup, setShowNewGroup] = useState(false)
  const [showGroupSettings, setShowGroupSettings] = useState(false)
  const [showDirectChatSettings, setShowDirectChatSettings] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<ChatUser[]>([])
  const [isSearching, setIsSearching] = useState(false)
  // Separate search state for group settings to avoid conflicts
  const [groupSettingsSearchTerm, setGroupSettingsSearchTerm] = useState('')
  const [isGroupSettingsSearching, setIsGroupSettingsSearching] = useState(false)
  const [groupSettingsSearchResults, setGroupSettingsSearchResults] = useState<ChatUser[]>([])
  const [isRenaming, setIsRenaming] = useState(false)
  const [showChatActions, setShowChatActions] = useState<string | null>(null)
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number } | null>(null)
  const [newGroupName, setNewGroupName] = useState('')
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [messageText, setMessageText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Group creation state
  const [groupName, setGroupName] = useState('')
  const [selectedMembers, setSelectedMembers] = useState<ChatUser[]>([])
  const [isCreatingGroup, setIsCreatingGroup] = useState(false)
  const [groupStep, setGroupStep] = useState<1 | 2>(1)

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [audioChunks, setAudioChunks] = useState<Blob[]>([])
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)
  // Voice call - use shared context
  const { callState, startCall } = useCall()

  // Message actions state
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null)
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false)
  const [messageSearchTerm, setMessageSearchTerm] = useState('')
  const [showMessageSearch, setShowMessageSearch] = useState(false)
  const [viewingImage, setViewingImage] = useState<string | null>(null)
  const [replyingTo, setReplyingTo] = useState<{ id: string; text: string; senderName: string } | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showUserProfile, setShowUserProfile] = useState<string | null>(null)
  const [showMyProfile, setShowMyProfile] = useState(false)
  const [viewingProfileData, setViewingProfileData] = useState<UserProfile | null>(null)
  const [isEditingMyProfile, setIsEditingMyProfile] = useState(false)
  const EMOJI_LIST = ['😊', '😂', '❤️', '👍', '🔥', '🙌', '🙏', '😮', '😢', '👏', '💯', '✨', '🎉', '😎', '🤔', '😅', '😍', '👋', '👀', '💪']

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [newMessagesCount, setNewMessagesCount] = useState(0)
  const lastScrollTop = useRef(0)
  const isAtBottom = useRef(true)

  const addEmoji = (emoji: string) => {
    setMessageText(prev => prev + emoji)
    // Keep focus on textarea
    inputRef.current?.focus()
  }

  // Handle typing status
  const handleTyping = () => {
    setTypingStatus('typing')
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      setTypingStatus(null)
    }, 3000)
  }

  // Handle profile viewing
  useEffect(() => {
    if (showUserProfile) {
      if (viewingProfileData?.id !== showUserProfile) {
        setViewingProfileData(null)
      }
      FirebaseDatabaseService.getUserProfile(showUserProfile)
        .then(data => {
          if (data) setViewingProfileData(data as UserProfile)
        })
        .catch(err => console.error('Error fetching profile:', err))
    }
  }, [showUserProfile])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (isAtBottom.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      setNewMessagesCount(0)
    } else {
      setNewMessagesCount(prev => prev + 1)
    }
  }, [messages])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget
    const isBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100

    isAtBottom.current = isBottom
    setShowScrollButton(!isBottom)

    if (isBottom) {
      setNewMessagesCount(0)
    }

    lastScrollTop.current = container.scrollTop
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    setNewMessagesCount(0)
  }

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
            admins: [],
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

  // Handle voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks: Blob[] = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data)
      }

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' })
        const audioFile = new File([audioBlob], 'voice-note.webm', { type: 'audio/webm' })

        if (chunks.length > 0 && !isRecording) { // If not recording means we didn't cancel
          // Send the recording
          const success = await sendVoiceMessage(audioFile, recordingDuration)
          if (!success) alert('Failed to send voice note')
        }

        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop())
      }

      setMediaRecorder(recorder)
      setAudioChunks([])
      setIsRecording(true)
      setTypingStatus('recording_voice')
      setRecordingDuration(0)
      recorder.start()

      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1)
      }, 1000)
    } catch (err) {
      console.error('Failed to start recording:', err)
      alert('Could not access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop()
      setIsRecording(false)
      setTypingStatus(null)
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
        recordingTimerRef.current = null
      }
    }
  }

  const cancelRecording = () => {
    if (mediaRecorder && isRecording) {
      // Clear bits so onstop doesn't send
      setAudioChunks([])
      mediaRecorder.stop()
      setIsRecording(false)
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
        recordingTimerRef.current = null
      }
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
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

  // Theme color - declare early for use in loading states
  const themeColor = currentZone?.themeColor || '#10b981'
  const primaryColor = themeColor

  // No local helpers here, using top-level ones

  return (
    <>
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
                <h1 className="text-xl font-bold">{selectedChat ? 'Messages' : 'Chats'}</h1>
                <p className="text-sm opacity-90">{selectedChat ? 'Chat with members' : 'Your conversations'}</p>
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
              <button
                onClick={() => setShowMyProfile(true)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="My Profile"
              >
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chat list - hide on mobile when chat selected */}
          <div className={`w-full md:w-80 lg:w-[400px] flex-shrink-0 bg-white border-r border-gray-200 flex flex-col ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
            {/* List Header - Hidden on mobile as the main header handles it */}
            <div className="p-4 bg-white border-b border-gray-100 hidden md:flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowMyProfile(true)}
                  className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0"
                >
                  {profile?.profile_image_url ? (
                    <img src={profile.profile_image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {profile?.first_name?.charAt(0) || 'U'}
                    </div>
                  )}
                </button>
                <h2 className="text-xl font-bold text-gray-800">Chats</h2>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowNewChat(true)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                >
                  <MessageCircle className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowNewGroup(true)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Search in list */}
            <div className="px-4 py-2">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search or start new chat"
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all border border-transparent focus:border-emerald-500/30"
                />
              </div>
            </div>

            {/* Chat list */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
              {isLoading ? (
                <div className="p-8 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto" />
                </div>
              ) : chats.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <MessageCircle className="w-10 h-10 text-gray-300" />
                  </div>
                  <p className="text-gray-500 text-sm mb-4">No conversations yet</p>
                  <button
                    onClick={() => setShowNewChat(true)}
                    className="px-6 py-2.5 text-white text-sm font-semibold rounded-xl shadow-md transform active:scale-95 transition-all"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Start Chatting
                  </button>
                </div>
              ) : (
                <motion.div className="py-2 overflow-hidden">
                  <motion.div className="space-y-0.5">
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
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => selectChat(chat)}
                            className={`group w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-all relative ${isSelected ? 'bg-emerald-50/50' : ''
                              }`}
                          >
                            {/* Selection Indicator */}
                            {isSelected && (
                              <motion.div
                                layoutId="sidebar-active"
                                className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full"
                                style={{ backgroundColor: primaryColor }}
                              />
                            )}

                            {/* Avatar Wrapper */}
                            <div className="relative flex-shrink-0">
                              <SyncAvatar
                                userId={chat.type === 'direct' ? chat.participants.find(id => id !== user?.uid) : undefined}
                                initialAvatar={avatar}
                                fallbackName={displayName}
                                bgColor={chat.type === 'group' ? adjustColor(primaryColor, -30) : primaryColor}
                                isGroup={chat.type === 'group'}
                              />
                              {/* Status Dot for Direct Chats */}
                              {chat.type === 'direct' && (
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                              )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-0.5">
                                <h3 className={`font-semibold truncate ${unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                                  {displayName}
                                </h3>
                                {chat.lastMessage && (
                                  <span className={`text-[10px] ${unreadCount > 0 ? 'text-emerald-600 font-bold' : 'text-gray-400'}`}>
                                    {formatTime(chat.lastMessage.timestamp)}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0 pr-2">
                                  {typingUsersInChat.length > 0 ? (
                                    <div className="flex items-center gap-1.5 text-emerald-600 font-bold animate-pulse truncate">
                                      {typingUsersInChat[0].status === 'recording_voice' ? (
                                        <>
                                          <Mic className="w-3.5 h-3.5" />
                                          <span className="text-xs">Recording voice...</span>
                                        </>
                                      ) : (
                                        <>
                                          <Edit3 className="w-3.5 h-3.5" />
                                          <span className="text-xs">Typing...</span>
                                        </>
                                      )}
                                    </div>
                                  ) : (
                                    <div className={`text-xs truncate flex items-center gap-1 ${unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                                      {chat.lastMessage?.senderId === currentUser?.id && (
                                        <span className="text-gray-400 inline-flex items-center flex-shrink-0">
                                          <Check className="w-3.5 h-3.5" />
                                        </span>
                                      )}
                                      <span className="truncate">
                                        {chat.lastMessage?.text?.includes('Missed call') ? (
                                          <span className="flex items-center gap-1 text-red-500">
                                            <PhoneMissed className="w-3 h-3" />
                                            Missed call
                                          </span>
                                        ) : chat.lastMessage?.text?.includes('Image') ? (
                                          <span className="flex items-center gap-1 text-emerald-600">
                                            <ImageIcon className="w-3 h-3" />
                                            Image
                                          </span>
                                        ) : chat.lastMessage?.text?.includes('Document') ? (
                                          <span className="flex items-center gap-1 text-emerald-600">
                                            <FileText className="w-3 h-3" />
                                            Document
                                          </span>
                                        ) : chat.lastMessage?.text?.includes('Voice message') ? (
                                          <span className="flex items-center gap-1 text-emerald-600">
                                            <Mic className="w-3 h-3" />
                                            Voice message
                                          </span>
                                        ) : (
                                          chat.lastMessage?.text || 'No messages yet'
                                        )}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                {unreadCount > 0 && (
                                  <div
                                    className="min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[10px] text-white font-bold"
                                    style={{ backgroundColor: primaryColor }}
                                  >
                                    {unreadCount}
                                  </div>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    const rect = e.currentTarget.getBoundingClientRect()
                                    setMenuPosition({ top: rect.bottom + 4, right: window.innerWidth - rect.right })
                                    setShowChatActions(showChatActions === chat.id ? null : chat.id)
                                  }}
                                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-gray-200 rounded-full transition-all"
                                >
                                  <MoreVertical className="w-4 h-4 text-gray-600" />
                                </button>
                              </div>
                            </div>
                          </motion.button>
                        )
                      })}
                  </motion.div>
                </motion.div>
              )}
            </div>

            {/* Fixed position dropdown menu */}
            {showChatActions && menuPosition && (
              <div
                className="fixed bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-[100] min-w-[160px]"
                style={{ top: `${menuPosition.top}px`, right: `${menuPosition.right}px` }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={async () => {
                    const chat = chats.find(c => c.id === showChatActions)
                    if (chat) {
                      selectChat(chat)
                      const isPinned = chat.pinnedBy?.[currentUser?.id || '']
                      await togglePinChatService(chat.id, currentUser?.id || '', !isPinned)
                    }
                    setShowChatActions(null)
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                >
                  {chats.find(c => c.id === showChatActions)?.pinnedBy?.[currentUser?.id || ''] ? '📌 Unpin' : '📍 Pin Chat'}
                </button>
                <button
                  onClick={async () => {
                    if (confirm('Delete this chat permanently?')) {
                      await deleteChat(showChatActions!)
                    }
                    setShowChatActions(null)
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-2 text-red-600 border-t border-gray-100"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Chat
                </button>
              </div>
            )}
          </div>

          {/* Chat view */}
          <div className={`flex-1 flex flex-col bg-[#e5ddd5] relative ${selectedChat ? 'flex' : 'hidden md:flex'}`}>
            {selectedChat ? (
              <>
                {/* Chat header */}
                <div
                  className="flex-shrink-0 px-4 py-3 bg-white border-b border-gray-200 flex items-center gap-3 z-30 shadow-sm"
                >
                  <button
                    onClick={() => selectChat(null)}
                    className="p-2 -ml-2 hover:bg-gray-100 rounded-lg md:hidden text-gray-500"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>

                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 cursor-pointer shadow-sm relative overflow-hidden"
                    style={{ backgroundColor: selectedChat.type === 'group' ? adjustColor(themeColor, -30) : themeColor }}
                    onClick={() => {
                      if (selectedChat.type === 'direct') {
                        const otherUserId = selectedChat.participants.find(id => id !== user?.uid)
                        if (otherUserId) setShowUserProfile(otherUserId)
                      } else {
                        setShowGroupSettings(true)
                      }
                    }}
                  >
                    <SyncAvatar
                      userId={selectedChat.type === 'direct' ? selectedChat.participants.find(id => id !== user?.uid) : undefined}
                      initialAvatar={getChatAvatar(selectedChat)}
                      fallbackName={getChatDisplayName(selectedChat)}
                      size="w-10 h-10"
                      textClassName="text-lg"
                      bgColor={selectedChat.type === 'group' ? adjustColor(themeColor, -30) : themeColor}
                      isGroup={selectedChat.type === 'group'}
                    />
                    {/* Status dot in header */}
                    {selectedChat.type === 'direct' && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                    )}
                  </div>

                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => {
                      if (selectedChat.type === 'direct') {
                        const otherUserId = selectedChat.participants.find(id => id !== user?.uid)
                        if (otherUserId) setShowUserProfile(otherUserId)
                      } else {
                        setShowGroupSettings(true)
                      }
                    }}
                  >
                    <h2 className="font-bold text-gray-800 truncate">
                      {getChatDisplayName(selectedChat)}
                    </h2>
                    {typingUsers.length > 0 ? (
                      <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-bold animate-pulse">
                        {typingUsers[0].status === 'recording_voice' ? (
                          <Mic className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Edit3 className="w-3 h-3 text-emerald-500" />
                        )}
                        <span>
                          {typingUsers.length === 1
                            ? `${typingUsers[0].userName} is ${typingUsers[0].status === 'recording_voice' ? 'recording voice' : 'typing'}...`
                            : `${typingUsers.length} people are typing...`}
                        </span>
                      </div>
                    ) : (
                      <p className="text-[11px] text-gray-500 font-medium tracking-wide">
                        {selectedChat?.type === 'group'
                          ? `${selectedChat.participants.length} members`
                          : 'online'}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-gray-400">
                    <button
                      onClick={() => setShowMessageSearch(!showMessageSearch)}
                      className={`p-2 rounded-full transition-colors ${showMessageSearch ? 'bg-gray-100 text-emerald-600' : 'hover:bg-gray-100'}`}
                      title="Search messages"
                    >
                      <Search className="w-5 h-5" />
                    </button>

                    {selectedChat.type === 'direct' && (
                      <button
                        onClick={handleStartCall}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        title="Voice call"
                      >
                        <Phone className="w-5 h-5 text-gray-500" />
                      </button>
                    )}

                    <button
                      className={`p-2 rounded-full transition-colors ${showDirectChatSettings || showGroupSettings ? 'bg-gray-100 text-emerald-600' : 'hover:bg-gray-100'}`}
                      onClick={() => {
                        if (selectedChat.type === 'direct') {
                          setShowDirectChatSettings(!showDirectChatSettings)
                        } else {
                          setShowGroupSettings(true)
                        }
                      }}
                      title="More options"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Message Search Bar */}
                <AnimatePresence>
                  {showMessageSearch && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="flex-shrink-0 bg-white border-b border-gray-200 overflow-hidden z-20"
                    >
                      <div className="p-3 flex items-center gap-2">
                        <div className="flex-1 relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={messageSearchTerm}
                            onChange={(e) => setMessageSearchTerm(e.target.value)}
                            placeholder="Search messages..."
                            className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            autoFocus
                          />
                        </div>
                        <button
                          onClick={() => { setShowMessageSearch(false); setMessageSearchTerm('') }}
                          className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Messages area */}
                <div
                  ref={scrollContainerRef}
                  onScroll={handleScroll}
                  className="flex-1 overflow-y-auto relative z-10 scrollbar-none"
                  style={{
                    backgroundImage: `url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")`,
                    backgroundRepeat: 'repeat',
                    backgroundSize: '400px',
                    backgroundColor: '#e5ddd5'
                  }}
                >
                  <div className="absolute inset-0 bg-white/20 pointer-events-none" />

                  <div className="p-4 md:px-8 min-h-full flex flex-col">
                    <div className="flex-1" /> {/* Spacer to push messages to bottom if list is short */}

                    {isMessagesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center py-12 flex flex-col items-center">
                        <div className="w-16 h-16 bg-white/50 backdrop-blur rounded-full flex items-center justify-center mb-4">
                          <MessageCircle className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">No messages yet. Say hello!</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {messages
                          .filter((msg, index, self) => self.findIndex(m => m.id === msg.id) === index)
                          .filter(msg => {
                            if (!messageSearchTerm) return true
                            const term = messageSearchTerm.toLowerCase()
                            return (
                              msg.text?.toLowerCase().includes(term) ||
                              msg.senderName?.toLowerCase().includes(term) ||
                              msg.attachment?.name?.toLowerCase().includes(term)
                            )
                          })
                          .map((msg, index, filteredMessages) => {
                            const prevMsg = index > 0 ? filteredMessages[index - 1] : undefined
                            const nextMsg = index < filteredMessages.length - 1 ? filteredMessages[index + 1] : undefined
                            const showDate = shouldShowDateSeparator(msg, prevMsg)
                            const isOwn = msg.senderId === currentUser?.id
                            const isSystem = msg.type === 'system'
                            const isSelected = selectedMessageId === msg.id

                            // More sophisticated grouping
                            const isGroupedWithPrev = prevMsg &&
                              prevMsg.senderId === msg.senderId &&
                              !showDate &&
                              (new Date(msg.timestamp).getTime() - new Date(prevMsg.timestamp).getTime() < 300000); // 5 mins

                            const isGroupedWithNext = nextMsg &&
                              nextMsg.senderId === msg.senderId &&
                              !(shouldShowDateSeparator(nextMsg, msg)) &&
                              (new Date(nextMsg.timestamp).getTime() - new Date(msg.timestamp).getTime() < 300000);

                            return (
                              <div key={msg.id} className={`${showDate ? 'mt-4' : ''}`}>
                                {shouldShowDateSeparator(msg, filteredMessages[index - 1]) && (
                                  <div className="flex justify-center my-6 sticky top-2 z-10 transition-all">
                                    <span className="px-4 py-1.5 bg-white/80 backdrop-blur-md text-gray-500 text-[11px] font-bold rounded-full shadow-sm border border-gray-200/50 uppercase tracking-wider">
                                      {formatMessageDate(msg.timestamp)}
                                    </span>
                                  </div>
                                )}

                                {isSystem ? (
                                  <div className="text-center my-3">
                                    <span className="inline-block px-4 py-1.5 bg-gray-200/60 backdrop-blur-sm text-gray-600 text-[10px] font-bold rounded-full border border-gray-300/30">
                                      {msg.text}
                                    </span>
                                  </div>
                                ) : (
                                  <motion.div
                                    initial={isGroupedWithPrev ? { opacity: 0 } : { opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-0.5 relative group`}
                                    onContextMenu={(e) => {
                                      e.preventDefault()
                                      setSelectedMessageId(isSelected ? null : msg.id)
                                    }}
                                  >
                                    <div
                                      className={`flex items-center gap-1 ${isOwn ? 'flex-row-reverse self-end' : 'self-start'}`}
                                    >
                                      <div className={`inline-flex flex-col max-w-full relative group ${isOwn ? 'order-2' : ''}`}>
                                        {/* Sender Avatar for Groups */}
                                        {!isOwn && selectedChat?.type === 'group' && !isGroupedWithPrev && (
                                          <SyncAvatar
                                            userId={msg.senderId}
                                            initialAvatar={msg.senderAvatar}
                                            fallbackName={msg.senderName}
                                            size="w-8 h-8"
                                            textClassName="text-xs"
                                            bgColor={adjustColor(primaryColor, -20)}
                                            className="absolute -left-12 bottom-0"
                                          />
                                        )}

                                        {/* Bubble Tail - Only for first message in group */}
                                        {!isGroupedWithPrev && (
                                          <div className={`absolute top-0 w-4 h-4 z-0 ${isOwn ? '-right-2' : '-left-2'}`}>
                                            <svg viewBox="0 0 16 16" className={`w-full h-full ${isOwn ? 'text-emerald-500 fill-current' : 'text-white fill-current'}`}>
                                              {isOwn ? (
                                                <path d="M0 0h16v16C12 16 4 12 0 0z" />
                                              ) : (
                                                <path d="M16 0H0v16C4 16 12 12 16 0z" />
                                              )}
                                            </svg>
                                          </div>
                                        )}

                                        {/* Sender name for groups */}
                                        {!isOwn && selectedChat?.type === 'group' && !isGroupedWithPrev && (
                                          <p className="text-[11px] font-bold text-emerald-700 mb-0.5 ml-1 opacity-90">
                                            {msg.senderName}
                                          </p>
                                        )}

                                        {/* Message bubble */}
                                        <div
                                          className={`rounded-2xl cursor-pointer transition-all relative z-10 shadow-sm border ${isOwn
                                            ? 'bg-emerald-500 text-white rounded-tr-none border-emerald-400'
                                            : 'bg-white text-gray-800 rounded-tl-none border-gray-200'
                                            } ${isSelected ? 'ring-2 ring-offset-2 ring-emerald-500 scale-[1.02]' : ''} ${isGroupedWithPrev ? (isOwn ? 'rounded-tr-2xl' : 'rounded-tl-2xl') : ''
                                            } ${isGroupedWithNext ? (isOwn ? 'rounded-br-none' : 'rounded-bl-none') : ''} ${msg.type === 'image' ? 'p-1' : (msg.type === 'voice' ? 'p-1.5' : 'px-3.5 py-2 pr-12')
                                            } ${msg.type === 'text' || msg.deleted ? 'min-w-[85px]' : ''}`}
                                          onClick={() => setSelectedMessageId(isSelected ? null : msg.id)}
                                        >
                                          {/* Reply content */}
                                          {msg.replyTo && (
                                            <div className={`text-xs mb-1.5 p-2 rounded-lg border-l-4 overflow-hidden ${isOwn ? 'bg-black/10 border-white/40 text-white/90' : 'bg-gray-100 border-emerald-500 text-gray-600'
                                              }`}>
                                              <p className="font-bold text-[10px] uppercase opacity-80">{msg.replyTo.senderName}</p>
                                              <p className="truncate opacity-90">{msg.replyTo.text.slice(0, 60)}</p>
                                            </div>
                                          )}

                                          {/* Image */}
                                          {msg.type === 'image' && msg.imageUrl && !msg.deleted && (
                                            <div className="relative group/img overflow-hidden rounded-xl">
                                              <img src={msg.imageUrl} alt="Shared" className="w-full max-h-[300px] object-cover transition-transform group-hover/img:scale-105" />
                                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                                <button
                                                  onClick={(e) => { e.stopPropagation(); setViewingImage(msg.imageUrl!) }}
                                                  className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white"
                                                >
                                                  <ImageIcon className="w-5 h-5" />
                                                </button>
                                              </div>
                                            </div>
                                          )}

                                          {/* Document */}
                                          {msg.type === 'document' && msg.attachment && !msg.deleted && (
                                            <a href={msg.attachment.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className={`flex items-center gap-3 p-2.5 rounded-xl ${isOwn ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'} transition-all`}>
                                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isOwn ? 'bg-white/20' : 'bg-emerald-100'}`}>
                                                <FileText className={`w-5 h-5 ${isOwn ? 'text-white' : 'text-emerald-600'}`} />
                                              </div>
                                              <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-bold truncate ${isOwn ? 'text-white' : 'text-gray-900'}`}>{msg.attachment.name}</p>
                                                <p className={`text-[10px] opacity-70 ${isOwn ? 'text-white' : 'text-gray-500'}`}>{formatFileSize(msg.attachment.size)}</p>
                                              </div>
                                              <Download className={`w-4 h-4 flex-shrink-0 opacity-60 ${isOwn ? 'text-white' : 'text-gray-400'}`} />
                                            </a>
                                          )}

                                          {/* Voice */}
                                          {msg.type === 'voice' && msg.voiceUrl && !msg.deleted && (
                                            <div className="min-w-[200px]">
                                              <VoiceMessagePlayer url={msg.voiceUrl} duration={msg.voiceDuration} isOwn={isOwn} primaryColor={primaryColor} />
                                            </div>
                                          )}

                                          {/* Text / Caption */}
                                          {(msg.type === 'text' || msg.deleted || (msg.text && !['image', 'document', 'voice'].includes(msg.type)) || (msg.text && msg.text !== 'Voice message' && msg.text !== 'Image' && msg.text !== 'Document')) && (
                                            <p className={`text-[14px] leading-relaxed relative break-words ${msg.deleted ? 'italic opacity-60 text-xs' : ''}`}>
                                              {msg.deleted ? 'This message was deleted' : msg.text}
                                            </p>
                                          )}

                                          {!msg.deleted && (
                                            <div className={`absolute bottom-1.5 right-2 flex items-center gap-1 opacity-70`}>
                                              <span className={`text-[9.5px] font-medium leading-none ${isOwn ? 'text-white' : 'text-gray-400'}`}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                              </span>
                                              {isOwn && (
                                                <div className={`flex items-center leading-none ${msg.status === 'read' ? 'text-white' : 'text-white/70'}`}>
                                                  <Check className={`w-3 h-3 ${msg.status === 'read' || msg.status === 'delivered' ? '-mr-1.5' : ''}`} />
                                                  {(msg.status === 'read' || msg.status === 'delivered') && <Check className="w-3 h-3" />}
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </div>

                                        {/* Reactions Overlay */}
                                        {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                                          <div className={`flex flex-wrap gap-0.5 mt-0.5 absolute -bottom-2 ${isOwn ? 'right-2' : 'left-2'} z-20`}>
                                            {Object.entries(msg.reactions).map(([uid, emoji]) => (
                                              <motion.span
                                                key={uid}
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="inline-flex items-center justify-center w-5 h-5 bg-white border border-gray-100 rounded-full text-[10px] shadow-sm transform hover:scale-125 transition-transform"
                                              >
                                                {emoji as string}
                                              </motion.span>
                                            ))}
                                          </div>
                                        )}

                                        {/* Quick Actions Floating Bar */}
                                        <AnimatePresence>
                                          {isSelected && !msg.deleted && (
                                            <motion.div
                                              initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                              animate={{ opacity: 1, scale: 1, y: 0 }}
                                              exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                              className={`fixed inset-x-4 bottom-24 sm:absolute sm:-bottom-12 ${isOwn ? 'sm:right-0' : 'sm:left-0'} sm:inset-x-auto bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-2 z-[60] border border-gray-100 ring-1 ring-black/5`}
                                              onClick={(e) => e.stopPropagation()}
                                            >
                                              <div className="flex items-center gap-1">
                                                <div className="flex items-center gap-0.5 max-w-[200px] overflow-x-auto scrollbar-hide pr-2 border-r border-gray-100">
                                                  {REACTIONS.slice(0, 6).map(emoji => (
                                                    <button key={emoji} onClick={() => { toggleReaction(msg.id, emoji); setSelectedMessageId(null) }} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full text-lg transition-transform hover:scale-125">
                                                      {emoji}
                                                    </button>
                                                  ))}
                                                </div>
                                                <button onClick={() => { setReplyingTo({ id: msg.id, text: msg.text || (msg.type === 'image' ? 'Image' : 'Document'), senderName: msg.senderName }); setSelectedMessageId(null); inputRef.current?.focus() }} className="w-8 h-8 flex items-center justify-center hover:bg-emerald-50 rounded-full text-emerald-600" title="Reply">
                                                  <Reply className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => { navigator.clipboard.writeText(msg.text); setSelectedMessageId(null) }} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 rounded-full text-gray-500" title="Copy">
                                                  <Copy className="w-4 h-4" />
                                                </button>
                                                {isOwn && (
                                                  <button onClick={(e) => { e.stopPropagation(); if (confirm('Delete?')) deleteMessage(msg.id) }} className="w-8 h-8 flex items-center justify-center hover:bg-red-50 rounded-full text-red-500" title="Delete">
                                                    <Trash2 className="w-4 h-4" />
                                                  </button>
                                                )}
                                              </div>
                                            </motion.div>
                                          )}
                                        </AnimatePresence>
                                      </div>
                                    </div>
                                  </motion.div>
                                )
                                }
                              </div>
                            )
                          })}
                        <div ref={messagesEndRef} className="h-4" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Message input - Detached Modern Design */}
                <div className="p-3 md:p-6 relative z-30">
                  <AnimatePresence>
                    {replyingTo && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="mb-2 p-3 bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-emerald-100 flex items-center justify-between mx-auto max-w-2xl"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-1 h-10 bg-emerald-500 rounded-full flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Replying to {replyingTo.senderName}</p>
                            <p className="text-gray-600 text-sm truncate">{replyingTo.text}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setReplyingTo(null)}
                          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="max-w-4xl mx-auto relative">
                    <motion.div
                      layout
                      className="bg-white/95 backdrop-blur-md rounded-[24px] shadow-2xl border border-white/50 p-2 flex items-end gap-2 ring-1 ring-black/5"
                    >
                      {/* Attachment Toggle */}
                      <div className="relative">
                        <button
                          onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                          className={`p-3 rounded-full transition-all ${showAttachmentMenu ? 'bg-emerald-500 text-white rotate-45' : 'hover:bg-gray-100 text-gray-400'}`}
                        >
                          <Plus className="w-6 h-6" />
                        </button>

                        <AnimatePresence>
                          {showAttachmentMenu && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8, y: -20 }}
                              animate={{ opacity: 1, scale: 1, y: -10 }}
                              exit={{ opacity: 0, scale: 0.8, y: -20 }}
                              className="absolute bottom-full left-0 mb-4 bg-white rounded-3xl shadow-2xl border border-gray-100 p-3 min-w-[220px] z-50 overflow-hidden"
                            >
                              <div className="grid grid-cols-1 gap-1">
                                <button
                                  onClick={() => { setShowAttachmentMenu(false); imageInputRef.current?.click() }}
                                  className="flex items-center gap-3 p-3 hover:bg-emerald-50 rounded-2xl group transition-all"
                                >
                                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                                    <ImageIcon className="w-5 h-5" />
                                  </div>
                                  <div className="text-left">
                                    <p className="text-sm font-bold text-gray-700">Photos & Videos</p>
                                    <p className="text-[10px] text-gray-400">Share your moments</p>
                                  </div>
                                </button>
                                <button
                                  onClick={() => { setShowAttachmentMenu(false); fileInputRef.current?.click() }}
                                  className="flex items-center gap-3 p-3 hover:bg-blue-50 rounded-2xl group transition-all"
                                >
                                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                    <FileText className="w-5 h-5" />
                                  </div>
                                  <div className="text-left">
                                    <p className="text-sm font-bold text-gray-700">Document</p>
                                    <p className="text-[10px] text-gray-400">PDF, Word, etc.</p>
                                  </div>
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Hidden Inputs */}
                      <input ref={imageInputRef} type="file" accept="image/*" onChange={(e) => handleFileSelect(e, 'image')} className="hidden" />
                      <input ref={fileInputRef} type="file" onChange={(e) => handleFileSelect(e, 'document')} className="hidden" />

                      {/* Input Field */}
                      <div className="flex-1 relative flex items-center">
                        <textarea
                          ref={inputRef}
                          value={messageText}
                          onChange={(e) => {
                            setMessageText(e.target.value)
                            handleTyping()
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              handleSend()
                            }
                          }}
                          placeholder="Type a message..."
                          rows={1}
                          className="w-full bg-transparent border-none focus:ring-0 text-gray-800 text-[15px] py-2 px-1 resize-none max-h-32 scrollbar-none placeholder:text-gray-400"
                          style={{ height: 'auto' }}
                          onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement
                            target.style.height = 'auto'
                            target.style.height = `${target.scrollHeight}px`
                          }}
                        />

                        <div className="relative">
                          <button
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className={`p-2 transition-colors ${showEmojiPicker ? 'text-emerald-500' : 'text-gray-400 hover:text-emerald-500'}`}
                            title="Add emoji"
                          >
                            <Smile className="w-6 h-6" />
                          </button>

                          <AnimatePresence>
                            {showEmojiPicker && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8, y: -20 }}
                                animate={{ opacity: 1, scale: 1, y: -10 }}
                                exit={{ opacity: 0, scale: 0.8, y: -20 }}
                                className="absolute bottom-full right-0 mb-4 bg-white rounded-3xl shadow-2xl border border-gray-100 p-3 min-w-[280px] z-50 overflow-hidden"
                              >
                                <div className="grid grid-cols-5 gap-1">
                                  {EMOJI_LIST.map(emoji => (
                                    <button
                                      key={emoji}
                                      onClick={() => addEmoji(emoji)}
                                      className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-xl text-xl transition-transform hover:scale-125"
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Voice / Send Button */}
                      <div className="flex items-center gap-1">
                        {isRecording ? (
                          <div className="flex items-center gap-2 bg-red-50 text-red-500 px-4 py-2.5 rounded-2xl animate-pulse">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                            <span className="text-sm font-bold">{formatDuration(recordingDuration)}</span>
                            <button
                              onClick={stopRecording}
                              className="ml-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <AnimatePresence mode="wait">
                              {messageText.trim() ? (
                                <motion.button
                                  key="send"
                                  initial={{ scale: 0, rotate: -45 }}
                                  animate={{ scale: 1, rotate: 0 }}
                                  exit={{ scale: 0, rotate: 45 }}
                                  onClick={handleSend}
                                  disabled={isSending || isUploading}
                                  className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transform active:scale-90 transition-all"
                                  style={{
                                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${adjustColor(primaryColor, -20)} 100%)`
                                  }}
                                >
                                  {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                </motion.button>
                              ) : (
                                <motion.button
                                  key="mic"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                  onClick={startRecording}
                                  className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-100 text-gray-500 hover:bg-emerald-50 hover:text-emerald-500 transition-all transform active:scale-90"
                                >
                                  <Mic className="w-6 h-6" />
                                </motion.button>
                              )}
                            </AnimatePresence>
                          </>
                        )}
                      </div>
                    </motion.div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50/50">
                <div className="text-center p-8 max-w-sm">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-100">
                    <MessageCircle className="w-12 h-12 text-gray-200" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Select a chat</h3>
                  <p className="text-gray-500 leading-relaxed">
                    Pick a conversation from the list to start messaging your friends and groups.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* New Chat Modal - Full Screen Overlay */}
        {
          showNewChat && (
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
          )
        }

        {/* New Group Modal - Multi-Step Bottom Sheet */}
        {
          showNewGroup && (
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
          )
        }

        {/* Image Viewer Modal */}
        {
          viewingImage && (
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
                    if (!viewingImage) return
                    try {
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
                {viewingImage && (
                  <img
                    src={viewingImage}
                    alt="Full size"
                    className="max-w-full max-h-full object-contain rounded-lg"
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
              </div>
            </div>
          )
        }

        {/* Group Settings Modal */}
        {
          showGroupSettings && selectedChat?.type === 'group' && (
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
                    {isRenaming ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          className="bg-white/20 text-white border-0 rounded px-2 py-1 text-sm focus:ring-1 ring-white/50 w-full"
                          value={newGroupName}
                          onChange={(e) => setNewGroupName(e.target.value)}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              renameGroup(newGroupName)
                              setIsRenaming(false)
                            } else if (e.key === 'Escape') {
                              setIsRenaming(false)
                            }
                          }}
                        />
                        <button onClick={() => { renameGroup(newGroupName); setIsRenaming(false) }}>
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold">{getChatDisplayName(selectedChat)}</h3>
                        {isGroupCreator() && (
                          <button
                            onClick={() => { setIsRenaming(true); setNewGroupName(getChatDisplayName(selectedChat)) }}
                            className="p-1 hover:bg-white/20 rounded"
                          >
                            <Settings className="w-3.5 h-3.5 opacity-70" />
                          </button>
                        )}
                      </div>
                    )}
                    <p className="text-sm opacity-80">{selectedChat?.participants.length || 0} members</p>
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
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                            onClick={() => {
                              if (isCurrentUser) {
                                setShowMyProfile(true)
                              } else {
                                setShowUserProfile(participantId)
                              }
                            }}
                          >
                            <SyncAvatar
                              userId={participantId}
                              initialAvatar={details?.avatar}
                              fallbackName={details?.name}
                              size="w-10 h-10"
                              textClassName="text-base"
                              bgColor={primaryColor}
                            />
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
          )
        }

        {/* User Profile Viewing Modal */}
        {showUserProfile && (
          <div className="fixed inset-0 z-[60] bg-black/50 flex items-end sm:items-center justify-center" onClick={() => setShowUserProfile(null)}>
            <div
              className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {!viewingProfileData ? (
                <div className="p-12 text-center flex flex-col items-center justify-center">
                  <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-4" />
                  <p className="text-gray-500">Loading profile...</p>
                </div>
              ) : (
                <>
                  <div
                    className="relative h-48 flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${adjustColor(primaryColor, -30)} 100%)` }}
                  >
                    <button
                      onClick={() => setShowUserProfile(null)}
                      className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/30 rounded-full text-white transition-colors z-10"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <div className="absolute inset-x-0 -bottom-12 flex justify-center">
                      <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-lg">
                        {viewingProfileData.profile_image_url ? (
                          <img src={viewingProfileData.profile_image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold" style={{ backgroundColor: primaryColor }}>
                            {viewingProfileData.first_name?.charAt(0) || 'U'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="pt-16 pb-6 px-6 text-center">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {viewingProfileData.first_name} {viewingProfileData.last_name}
                    </h3>
                    <p className="text-emerald-600 font-medium">{viewingProfileData.designation || 'Member'}</p>
                  </div>
                  <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4">
                    <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                      <div className="flex items-center gap-3 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm truncate">{viewingProfileData.email}</span>
                      </div>
                      {viewingProfileData.phone_number && (
                        <div className="flex items-center gap-3 text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span className="text-sm">{viewingProfileData.phone_number}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">{viewingProfileData.zone || 'No Zone'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-600">
                        <Info className="w-4 h-4" />
                        <span className="text-sm">{viewingProfileData.church || 'No Church'}</span>
                      </div>
                    </div>
                    {!(selectedChat?.type === 'direct' && selectedChat.participants.includes(viewingProfileData.id)) && (
                      <button
                        onClick={() => {
                          const chatUser: ChatUser = {
                            id: viewingProfileData.id,
                            name: viewingProfileData.first_name + ' ' + (viewingProfileData.last_name || ''),
                            avatar: viewingProfileData.profile_image_url || undefined
                          }
                          startDirectChat(chatUser)
                          setShowUserProfile(null)
                        }}
                        className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="w-5 h-5" />
                        Message
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Direct Chat Settings Modal (Individual Chat Options) */}
        {showDirectChatSettings && selectedChat?.type === 'direct' && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4" onClick={() => setShowDirectChatSettings(false)}>
            <div
              className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl transform transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 border-b border-gray-100 flex items-center gap-4">
                <div className="relative">
                  <SyncAvatar
                    userId={selectedChat.participants.find(id => id !== user?.uid)}
                    initialAvatar={getChatAvatar(selectedChat)}
                    fallbackName={getChatDisplayName(selectedChat)}
                    size="w-12 h-12"
                    textClassName="text-lg"
                    bgColor={themeColor}
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate text-lg">{getChatDisplayName(selectedChat)}</h3>
                  <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider opacity-80">Online</p>
                </div>
                <button
                  onClick={() => setShowDirectChatSettings(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="p-3 space-y-2">
                <button
                  onClick={() => {
                    const otherUserId = selectedChat.participants.find(id => id !== user?.uid)
                    if (otherUserId) setShowUserProfile(otherUserId)
                    setShowDirectChatSettings(false)
                  }}
                  className="w-full flex items-center gap-4 p-4 hover:bg-emerald-50 rounded-2xl transition-all text-left group"
                >
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800">View Profile</p>
                    <p className="text-[10px] text-gray-500 font-medium">Media, info & status</p>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-gray-300 rotate-180" />
                </button>

                <button
                  onClick={() => {
                    setShowMessageSearch(true)
                    setShowDirectChatSettings(false)
                  }}
                  className="w-full flex items-center gap-4 p-4 hover:bg-blue-50 rounded-2xl transition-all text-left group"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                    <Search className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800">Search Messages</p>
                    <p className="text-[10px] text-gray-500 font-medium">Find specific history</p>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-gray-300 rotate-180" />
                </button>

                <button
                  onClick={() => {
                    if (confirm('Clear all messages in this chat? This cannot be undone.')) {
                      alert('This feature will be available in the next update!')
                    }
                    setShowDirectChatSettings(false)
                  }}
                  className="w-full flex items-center gap-4 p-4 hover:bg-red-50 rounded-2xl transition-all text-left group"
                >
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-red-600">Clear Chat</p>
                    <p className="text-[10px] text-red-400 font-medium">Remove history</p>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-gray-300 rotate-180" />
                </button>
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={() => setShowDirectChatSettings(false)}
                  className="w-full py-4 bg-white text-gray-500 font-bold rounded-2xl border border-gray-200 hover:bg-gray-100 transition-colors shadow-sm text-sm uppercase tracking-widest"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* My Profile Editing Modal */}
        {showMyProfile && (
          <div className="fixed inset-0 z-[60] bg-black/50 flex items-end sm:items-center justify-center">
            <div
              className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="relative h-48 flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${adjustColor(primaryColor, -30)} 100%)` }}
              >
                <div className="absolute top-4 left-4 flex items-center gap-2 text-white">
                  <Settings className="w-5 h-5 opacity-80" />
                  <span className="font-semibold">My Profile</span>
                </div>
                <button
                  onClick={() => setShowMyProfile(false)}
                  className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/30 rounded-full text-white transition-colors z-10"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute inset-x-0 -bottom-12 flex justify-center">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-lg">
                      {profile?.profile_image_url ? (
                        <img src={profile.profile_image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold" style={{ backgroundColor: primaryColor }}>
                          {profile?.first_name?.charAt(0) || 'U'}
                        </div>
                      )}
                    </div>
                    <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity">
                      <Camera className="w-8 h-8 text-white" />
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            try {
                              setIsUploading(true)
                              const { uploadImageToCloudinary } = await import('@/lib/cloudinary-storage')
                              const url = await uploadImageToCloudinary(file)
                              await FirebaseDatabaseService.updateUserProfile(user!.uid, { profile_image_url: url })
                              await refreshProfile()
                            } catch (err) {
                              console.error('Upload failed:', err)
                            } finally {
                              setIsUploading(false)
                            }
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
              <div className="pt-16 pb-6 px-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Your Name</label>
                    <div className="relative group">
                      <input
                        type="text"
                        defaultValue={profile?.first_name + ' ' + (profile?.last_name || '')}
                        disabled={!isEditingMyProfile}
                        className={`w-full px-4 py-3 rounded-xl border-0 bg-gray-50 focus:ring-2 focus:ring-emerald-500/20 text-gray-800 font-medium ${!isEditingMyProfile && 'cursor-default'}`}
                        onBlur={async (e) => {
                          if (e.target.value.trim() && isEditingMyProfile) {
                            const [first, ...last] = e.target.value.split(' ')
                            await FirebaseDatabaseService.updateUserProfile(user!.uid, {
                              first_name: first,
                              last_name: last.join(' ')
                            })
                            await refreshProfile()
                            setIsEditingMyProfile(false)
                          }
                        }}
                      />
                      {!isEditingMyProfile && (
                        <button
                          onClick={() => setIsEditingMyProfile(true)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-200 rounded-lg text-gray-400 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Status / Designation</label>
                    <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-800 text-sm">
                      {profile?.designation || 'Member'}
                    </div>
                  </div>
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <Info className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-emerald-800 font-semibold uppercase tracking-tighter">Verified Member</p>
                        <p className="text-[11px] text-emerald-600 font-medium">Your profile is visible to other rehearsal hub members.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-gray-100">
                <button
                  onClick={() => setShowMyProfile(false)}
                  className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

// ============================================
// HELPERS (Moved outside to prevent re-renders)
// ============================================

function adjustColor(color: string, amount: number): string {
  if (!color) return '#10b981'
  const hex = color.replace('#', '')
  const num = parseInt(hex, 16)
  const r = Math.max(0, Math.min(255, (num >> 16) + amount))
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount))
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

function shouldShowDateSeparator(msg: any, prevMsg?: any): boolean {
  if (!prevMsg) return true
  const d1 = new Date(msg.timestamp)
  const d2 = new Date(prevMsg.timestamp)
  return d1.toDateString() !== d2.toDateString()
}

function formatMessageDate(date: any): string {
  const d = new Date(date)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'

  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  })
}

function formatTime(date: any): string {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return ''
  if (bytes < 1024) return bytes + ' B'
  const kb = bytes / 1024
  if (kb < 1024) return kb.toFixed(1) + ' KB'
  return (kb / 1024).toFixed(1) + ' MB'
}

// ---------------------------------------------------------
// SyncAvatar: Ensures avatars are consistent with profiles
// ---------------------------------------------------------
function SyncAvatar({
  userId,
  initialAvatar,
  fallbackName,
  size = "w-12 h-12",
  bgColor,
  isGroup = false,
  textClassName = "text-lg",
  className = ""
}: {
  userId?: string,
  initialAvatar?: string,
  fallbackName?: string,
  size?: string,
  bgColor: string,
  isGroup?: boolean,
  textClassName?: string,
  className?: string
}) {
  const [avatar, setAvatar] = useState(initialAvatar)

  useEffect(() => {
    // If we have an initial avatar, use it immediately
    if (initialAvatar) setAvatar(initialAvatar)
  }, [initialAvatar])

  useEffect(() => {
    // Then try to fetch the latest from profile
    if (!isGroup && userId) {
      FirebaseDatabaseService.getUserProfile(userId).then(profileData => {
        const p = profileData as any
        if (p?.profile_image_url) {
          setAvatar(p.profile_image_url)
        } else if (p?.avatar_url) {
          setAvatar(p.avatar_url)
        }
      }).catch(err => console.error('[SyncAvatar] error:', err))
    }
  }, [userId, isGroup])

  return (
    <div
      className={`${size} rounded-full flex items-center justify-center text-white font-bold ${textClassName} overflow-hidden shadow-sm flex-shrink-0 ${className}`}
      style={{ backgroundColor: bgColor }}
    >
      {avatar ? (
        <img src={avatar} alt="" className="w-full h-full object-cover" />
      ) : isGroup ? (
        <Users className="w-6 h-6" />
      ) : (
        (fallbackName || '?').charAt(0).toUpperCase()
      )}
    </div>
  )
}
