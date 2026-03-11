'use client'

import { useState, useEffect, useRef, Fragment } from 'react'
import * as React from 'react'
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
  Maximize2, Paperclip, Settings, UserMinus, PhoneMissed, Edit3, Camera, User, Mail, Info, ChevronDown
} from 'lucide-react'
import type { UserProfile } from '@/types/supabase'
import { FirebaseDatabaseService } from '@/lib/firebase-database'
import type { ChatUser, ReactionType, Message } from './_lib/chat-service'
import { togglePinChat as togglePinChatService } from './_lib/chat-service'
import { useCall } from '@/contexts/CallContext'

// Modular Components
import { ChatList } from './_components/ChatList'
import { ChatWindow } from './_components/ChatWindow'
import { SyncAvatar } from './_components/SyncAvatar'


// Reaction options - more variety
const REACTIONS: ReactionType[] = ['❤️', '👍', '😂', '😮', '😢', '🙏', '🔥', '👏', '💯', '✨']


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
    editMessage,
    forwardMessage,
    addGroupMembers,
    removeGroupMember,
    leaveGroup,
    deleteGroup,
    renameGroup,
    pinMessage,
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
  const [newGroupName, setNewGroupName] = useState('')
  
  const [messageText, setMessageText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

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

  // UI state
  const [viewingImage, setViewingImage] = useState<string | null>(null)
  const [replyingTo, setReplyingTo] = useState<{ id: string; text: string; senderName: string } | null>(null)
  const [showUserProfile, setShowUserProfile] = useState<string | null>(null)
  const [showMyProfile, setShowMyProfile] = useState(false)
  const [viewingProfileData, setViewingProfileData] = useState<UserProfile | null>(null)
  const [isEditingMyProfile, setIsEditingMyProfile] = useState(false)
  
  // Forwarding state
  const [forwardingMessage, setForwardingMessage] = useState<Message | null>(null)
  const [showForwardSelector, setShowForwardSelector] = useState(false)
  const [selectedForwardChats, setSelectedForwardChats] = useState<string[]>([])
  const [forwardSearchTerm, setForwardSearchTerm] = useState('')
  const [showStarredMessages, setShowStarredMessages] = useState(false)
  const [isAddingMember, setIsAddingMember] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const isAtBottom = useRef(true)

  // Handle profile viewing (either via member click or direct chat settings)
  useEffect(() => {
    const targetUserId = showUserProfile || (showDirectChatSettings ? selectedChat?.participants.find(id => id !== user?.uid) : null)
    
    if (targetUserId) {
      if (viewingProfileData?.id !== targetUserId) {
        setViewingProfileData(null)
      }
      FirebaseDatabaseService.getUserProfile(targetUserId)
        .then(data => {
          if (data) setViewingProfileData(data as UserProfile)
        })
        .catch(err => console.error('Error fetching profile:', err))
    }
  }, [showUserProfile, showDirectChatSettings, selectedChat?.id])

  const handleCopyText = (text?: string, label: string = 'Phone number') => {
    if (!text) {
      alert(`No ${label.toLowerCase()} available to copy`)
      return
    }
    navigator.clipboard.writeText(text).then(() => {
      alert(`${label} copied to clipboard!`)
    }).catch(err => {
      console.error('Failed to copy:', err)
      alert('Failed to copy to clipboard')
    })
  }

  // Scroll to bottom when messages change
  useEffect(() => {
    if (isAtBottom.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const handleForwardSelect = (chatId: string) => {
    setSelectedForwardChats(prev => 
      prev.includes(chatId) ? prev.filter(id => id !== chatId) : [...prev, chatId]
    )
  }

  const sendForwardedMessage = async () => {
    if (!forwardingMessage || selectedForwardChats.length === 0) return
    setIsSending(true)
    try {
      for (const chatId of selectedForwardChats) {
        await (forwardMessage as any)(chatId, forwardingMessage)
      }
      setForwardingMessage(null)
      setShowForwardSelector(false)
      setSelectedForwardChats([])
      alert('Message forwarded successfully!')
    } catch (err) {
      console.error('Error forwarding message:', err)
      alert('Failed to forward message')
    } finally {
      setIsSending(false)
    }
  }

  // Handle URL parameters for incoming calls
  useEffect(() => {
    if (typeof window === 'undefined') return

    const urlParams = new URLSearchParams(window.location.search)
    const callId = urlParams.get('call')
    const action = urlParams.get('action')

    if (callId) {
      window.dispatchEvent(new CustomEvent('incomingVoiceCall', {
        detail: {
          callId,
          action: action || 'show',
          fromNotification: true,
          timestamp: Date.now()
        }
      }))

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

  // Search users for group settings
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

  // Reset search when modal closes
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
      setShowNewChat(false)
      setSearchTerm('')
      setSearchResults([])

      const findAndSelectChat = (attempts = 0) => {
        const chat = chats.find(c => c.id === chatId)

        if (chat) {
          selectChat(chat)
        } else if (attempts < 10) {
          setTimeout(() => findAndSelectChat(attempts + 1), 500)
        } else {
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
      setGroupStep(1)
    }
  }

  const handleAddMembers = async () => {
    if (selectedMembers.length === 0 || !selectedChat) return
    setIsCreatingGroup(true)
    try {
      await addGroupMembers(selectedMembers)
      setSelectedMembers([])
      setShowNewChat(false)
      setShowNewGroup(false)
      setIsAddingMember(false)
      alert('Members added successfully!')
    } catch (err) {
      console.error('Error adding members:', err)
      alert('Failed to add members')
    } finally {
      setIsCreatingGroup(false)
    }
  }

  // Handle sending message moves to ChatWindow via context/props
  // Theme color
  const themeColor = currentZone?.themeColor || '#10b981'
  const primaryColor = themeColor

  return (
    <>
      <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
        {/* Main Layout using modular components */}
        <div className="flex-1 flex overflow-hidden min-w-0 text-balance">
          <ChatList 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onNewChat={() => setShowNewChat(true)}
            onNewGroup={() => setShowNewGroup(true)}
            onShowMyProfile={() => {
              setShowMyProfile(true)
              setIsEditingMyProfile(false)
            }}

            onBack={() => router.push('/home')}
            primaryColor={primaryColor}
          />

          <ChatWindow 
            primaryColor={primaryColor}
            onShowGroupSettings={() => setShowGroupSettings(true)}
            onShowDirectChatSettings={() => setShowDirectChatSettings(true)}
            onBackToList={() => selectChat(null)}
            onForward={(msg) => {
              setForwardingMessage(msg)
              setShowForwardSelector(true)
            }}
            onPin={(msgId) => pinMessage(msgId)}
          />
        </div>
      </div>

      {/* Forward Message Sidebar (Right Slide-in) */}
      <AnimatePresence>
        {showForwardSelector && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.25 }}
            className="fixed right-0 top-0 bottom-0 w-full md:w-[380px] z-[120] bg-white border-l border-[#e9edef] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex-shrink-0 pt-12 pb-4 px-4 text-white flex items-end gap-4 h-[108px]" style={{ backgroundColor: primaryColor }}>
              <button 
                onClick={() => { setShowForwardSelector(false); setSelectedForwardChats([]); setForwardSearchTerm('') }} 
                className="w-10 h-10 flex items-center justify-center hover:bg-white/20 rounded-full transition-colors mb-0.5"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h2 className="text-[19px] font-medium leading-none mb-2">Forward message to</h2>
            </div>

            {/* Search */}
            <div className="p-2 border-b border-[#f0f2f5] bg-white">
              <div className="relative bg-[#f0f2f5] rounded-lg">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#54656f]" />
                <input 
                  type="text" 
                  value={forwardSearchTerm} 
                  onChange={(e) => setForwardSearchTerm(e.target.value)} 
                  placeholder="Search chats" 
                  className="w-full pl-10 pr-4 py-2.5 bg-transparent text-[15px] focus:outline-none placeholder:text-[#54656f]"
                />
              </div>
            </div>

            {/* Selected Chats Ribbon */}
            {selectedForwardChats.length > 0 && (
              <div className="px-4 py-3 bg-white border-b border-[#f2f2f2] flex flex-wrap gap-2 min-h-[50px] content-start">
                <AnimatePresence>
                  {selectedForwardChats.map(chatId => {
                    const chat = chats.find(c => c.id === chatId)
                    return chat ? (
                      <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }} 
                        animate={{ scale: 1, opacity: 1 }} 
                        exit={{ scale: 0.8, opacity: 0 }}
                        key={chatId} 
                        className="flex items-center gap-1.5 pl-1 pr-1.5 py-1 text-[13px] rounded-full bg-[#e7f8f0] text-[#111b21] ring-1 ring-emerald-200"
                      >
                        <SyncAvatar userId={chat.type === 'direct' ? chat.participants.find(id => id !== user?.uid) : undefined} isGroup={chat.type === 'group'} size="w-6 h-6" className="rounded-full" bgColor={primaryColor} />
                        <span className="max-w-[100px] truncate font-medium">{getChatDisplayName(chat)}</span> 
                        <button onClick={() => handleForwardSelect(chatId)} className="w-5 h-5 flex items-center justify-center text-[#667781] hover:text-red-500">
                           <X className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    ) : null
                  })}
                </AnimatePresence>
              </div>
            )}

            {/* Chats List */}
            <div className="flex-1 overflow-y-auto">
               <div className="py-2">
                 <h3 className="px-6 py-3 text-[14px] font-medium uppercase tracking-wider" style={{ color: primaryColor }}>Recent chats</h3>
                 {chats.filter(chat => 
                   getChatDisplayName(chat).toLowerCase().includes(forwardSearchTerm.toLowerCase())
                 ).map(chat => {
                   const isSelected = selectedForwardChats.includes(chat.id)
                   return (
                     <button 
                       key={chat.id} 
                       onClick={() => handleForwardSelect(chat.id)}
                       className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#f5f6f6] transition-colors group ${isSelected ? 'bg-[#f0faf6]' : ''}`}
                     >
                       <div className="relative pl-3">
                         <SyncAvatar 
                           userId={chat.type === 'direct' ? chat.participants.find(id => id !== user?.uid) : undefined} 
                           isGroup={chat.type === 'group'} 
                           size="w-[49px] h-[49px]" 
                           className="rounded-full overflow-hidden" 
                           bgColor={primaryColor}
                           fallbackName={getChatDisplayName(chat)}
                         />
                         {isSelected && (
                           <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: primaryColor }}>
                             <Check className="w-3 h-3 stroke-[3]" />
                           </div>
                         )}
                       </div>
                       <div className="flex-1 min-w-0 border-b border-[#f2f2f2] group-last:border-none pb-3 pt-1 text-left">
                          <p className="text-[17px] text-[#111b21] truncate">{getChatDisplayName(chat)}</p>
                          <p className="text-[13px] text-[#667781] truncate">
                            {chat.type === 'group' ? `${chat.participants.length} members` : 'Direct message'}
                          </p>
                       </div>
                     </button>
                   )
                 })}
               </div>
            </div>

            {/* Forward Actions */}
            <div className="p-4 bg-[#f0f2f5] flex items-center justify-center pb-8 border-t border-[#e9edef] min-h-[80px]">
               <AnimatePresence>
                 {selectedForwardChats.length > 0 && (
                   <motion.button 
                     initial={{ scale: 0 }}
                     animate={{ scale: 1 }}
                     exit={{ scale: 0 }}
                     onClick={sendForwardedMessage}
                     disabled={isSending}
                     className="w-14 h-14 rounded-full text-white shadow-lg flex items-center justify-center transition-all hover:scale-105 disabled:opacity-50"
                     style={{ backgroundColor: primaryColor }}
                   >
                     {isSending ? <Loader2 className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6 ml-0.5" />}
                   </motion.button>
                 )}
               </AnimatePresence>
               {!isSending && selectedForwardChats.length === 0 && (
                 <p className="text-[#667781] text-sm">Select one or more chats to forward</p>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Chat Sidebar (Left Slide-in) */}
      <AnimatePresence>
        {showNewChat && (
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed left-0 top-0 bottom-0 w-full md:w-80 lg:w-[380px] z-[60] bg-white border-r border-gray-200 flex flex-col shadow-2xl"
          >
            {/* Header matching WhatsApp's distinct side-panel green/primary block */}
            <div className="flex-shrink-0 pt-12 pb-4 px-4 text-white flex items-end gap-3 h-[108px]" style={{ backgroundColor: primaryColor }}>
              <button 
                onClick={() => { setShowNewChat(false); setSearchTerm(''); setSearchResults([]) }} 
                className="w-10 h-10 flex items-center justify-center -ml-1 hover:bg-white/20 rounded-full transition-colors mb-0.5"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h2 className="text-[19px] font-medium leading-none mb-1">New chat</h2>
            </div>
            
            {/* Search Input Area */}
            <div className="p-2 border-b border-gray-100 bg-white">
              <div className="relative bg-[#f0f2f5] rounded-lg">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-500" />
                <input 
                  type="text" 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  placeholder="Search name or number" 
                  className="w-full pl-10 pr-4 py-2 bg-transparent text-sm focus:outline-none placeholder:text-gray-500"
                  autoFocus
                />
              </div>
            </div>
            
            {/* Results Area */}
            <div className="flex-1 overflow-y-auto bg-white">
              {isSearching ? (
                <div className="py-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: primaryColor }} /></div>
              ) : searchResults.length === 0 ? (
                <div className="py-12 text-center text-gray-500 text-sm">{searchTerm ? `No results found for "${searchTerm}"` : ''}</div>
              ) : (
                <div className="flex flex-col mt-2">
                  <div className="px-5 py-3 text-[#008069] text-base font-normal tracking-wide">Contacts on Rehearsal Hub</div>
                  {searchResults.map(user => (
                    <button 
                      key={user.id} 
                      onClick={() => handleStartChat(user)} 
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#f5f6f6] text-left transition-colors group"
                    >
                      <div className="pl-1">
                        <SyncAvatar 
                          userId={user.id}
                          initialAvatar={user.avatar}
                          fallbackName={user.name}
                          bgColor={primaryColor}
                          size="w-[49px] h-[49px]"
                          className="rounded-full overflow-hidden"
                        />
                      </div>
                      <div className="flex-1 min-w-0 border-b border-[#f2f2f2] group-last:border-none pb-3 pt-1 flex flex-col justify-center">
                        <p className="text-[17px] text-[#111b21] truncate leading-tight">{user.name}</p>
                        {user.zoneName && <p className="text-[13px] text-[#667781] truncate mt-0.5">{user.zoneName}</p>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Group Sidebar (Left Slide-in) */}
      <AnimatePresence>
        {showNewGroup && (
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed left-0 top-0 bottom-0 w-full md:w-80 lg:w-[380px] z-[60] bg-[#f0f2f5] border-r border-gray-200 flex flex-col shadow-2xl"
          >
            {groupStep === 1 ? (
              <>
                {/* Header Phase 1 */}
                <div className="flex-shrink-0 pt-12 pb-4 px-4 text-white flex items-end gap-4 h-[108px]" style={{ backgroundColor: primaryColor }}>
                  <button 
                    onClick={() => setShowNewGroup(false)} 
                    className="w-10 h-10 flex items-center justify-center -ml-2 hover:bg-white/20 rounded-full transition-colors mb-0.5"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                  <h2 className="text-[19px] font-medium leading-none mb-2">New group</h2>
                </div>
                
                {/* Body Phase 1 */}
                <div className="flex-1 bg-[#f0f2f5] p-4 flex flex-col items-center">
                  <div className="w-[100px] h-[100px] rounded-full mx-auto mb-8 flex items-center justify-center bg-gray-200 mt-4 shadow-sm relative group cursor-pointer overflow-hidden">
                    <Camera className="w-8 h-8 text-gray-400 group-hover:opacity-0 transition-opacity" />
                    <label className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[11px] uppercase tracking-wider text-center px-2">
                       <Camera className="w-6 h-6 mb-1" />
                       Add group icon
                       <input type="file" className="hidden" accept="image/*" />
                    </label>
                  </div>
                  
                  <div className="w-full bg-white rounded-lg shadow-sm">
                    <input 
                      type="text" 
                      value={groupName} 
                      onChange={(e) => setGroupName(e.target.value)} 
                      placeholder="Group subject" 
                      className="w-full px-4 py-4 bg-transparent text-[#111b21] border-b-2 border-transparent focus:border-b-2 transition-colors focus:outline-none" 
                      style={{ borderBottomColor: groupName ? primaryColor : 'transparent' }}
                      autoFocus 
                    />
                  </div>
                </div>

                {/* FAB Next Button Phase 1 */}
                <div className="p-4 bg-[#f0f2f5] flex justify-center pb-8">
                  <AnimatePresence>
                    {groupName.trim() && (
                      <motion.button 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        onClick={() => setGroupStep(2)} 
                        className="w-12 h-12 rounded-full text-white shadow-lg flex items-center justify-center transition-transform hover:scale-105"
                        style={{ backgroundColor: primaryColor }}
                      >
                         <ArrowLeft className="w-6 h-6 rotate-180" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                {/* Header Phase 2 */}
                <div className="flex-shrink-0 pt-12 pb-4 px-4 text-white flex items-end gap-4 h-[108px]" style={{ backgroundColor: primaryColor }}>
                  <button 
                    onClick={() => setGroupStep(1)} 
                    className="w-10 h-10 flex items-center justify-center -ml-2 hover:bg-white/20 rounded-full transition-colors mb-0.5"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                  <div className="flex flex-col mb-1">
                     <h2 className="text-[19px] font-medium leading-[22px] mb-2">Add members</h2>
                     <p className="text-[13px] text-white/80 leading-[15px]">{selectedMembers.length} {selectedMembers.length === 1 ? 'contact' : 'contacts'} selected</p>
                  </div>
                </div>

                {/* Selected Members Ribbon Phase 2 */}
                <div className="bg-white px-4 py-3 border-b border-[#f2f2f2] flex flex-wrap gap-2 min-h-[60px] content-start shadow-sm z-10">
                  {selectedMembers.length > 0 ? selectedMembers.map(m => (
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }} 
                      animate={{ scale: 1, opacity: 1 }} 
                      key={m.id} 
                      className="flex items-center gap-1.5 pl-1 pr-1.5 py-1 text-[13px] rounded-full bg-[#f0f2f5] text-[#111b21]"
                    >
                      <SyncAvatar userId={m.id} initialAvatar={m.avatar} fallbackName={m.name} size="w-6 h-6" className="rounded-full" bgColor={primaryColor} />
                      <span className="max-w-[80px] truncate">{m.name.split(' ')[0]}</span> 
                      <button onClick={() => setSelectedMembers(prev => prev.filter(p => p.id !== m.id))} className="w-5 h-5 flex items-center justify-center text-[#667781] hover:text-[#111b21]">
                         <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  )) : (
                    <span className="text-[#667781] text-[15px] self-center">Search for members</span>
                  )}
                </div>

                {/* Search Input Area */}
                <div className="p-2 border-b border-gray-100 bg-white">
                  <div className="relative bg-[#f0f2f5] rounded-lg">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-500" />
                    <input 
                      type="text" 
                      value={searchTerm} 
                      onChange={(e) => setSearchTerm(e.target.value)} 
                      placeholder="Type contact name" 
                      className="w-full pl-10 pr-4 py-2 bg-transparent text-sm focus:outline-none placeholder:text-gray-500"
                    />
                  </div>
                </div>

                {/* Results Area */}
                <div className="flex-1 overflow-y-auto bg-white">
                   {searchResults.filter(u => !selectedMembers.find(m => m.id === u.id)).map(user => (
                     <button 
                       key={user.id} 
                       onClick={() => setSelectedMembers(prev => [...prev, user])} 
                       className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#f5f6f6] text-left transition-colors group"
                     >
                       <div className="pl-1">
                          <SyncAvatar userId={user.id} initialAvatar={user.avatar} fallbackName={user.name} bgColor={primaryColor} size="w-[49px] h-[49px]" className="rounded-full" />
                       </div>
                       <div className="flex-1 min-w-0 border-b border-[#f2f2f2] group-last:border-none pb-3 pt-1 flex flex-col justify-center">
                         <p className="text-[17px] text-[#111b21] truncate leading-tight">{user.name}</p>
                         {user.zoneName && <p className="text-[13px] text-[#667781] truncate mt-0.5">{user.zoneName}</p>}
                       </div>
                     </button>
                   ))}
                </div>

                {/* FAB Create Button Phase 2 */}
                <div className="p-4 bg-[#f0f2f5] flex justify-center pb-8 border-t border-[#e9edef]">
                  <AnimatePresence>
                    {selectedMembers.length > 0 && (
                      <motion.button 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        onClick={isAddingMember ? handleAddMembers : handleCreateGroup} 
                        disabled={isCreatingGroup}
                        className="w-12 h-12 rounded-full text-white shadow-lg flex items-center justify-center transition-transform hover:scale-105 disabled:opacity-70 disabled:hover:scale-100"
                        style={{ backgroundColor: '#00a884' }} // Classic WhatsApp Create Checkmark Color
                      >
                         {isCreatingGroup ? <Loader2 className="w-6 h-6 animate-spin" /> : <Check className="w-6 h-6" />}
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Viewer */}
      {viewingImage && (
        <div className="fixed inset-0 z-[300] bg-black/95 flex flex-col" onClick={() => setViewingImage(null)}>
          <div className="flex items-center justify-between p-4">
            <button onClick={() => setViewingImage(null)} className="p-2 hover:bg-white/10 rounded-full text-white"><X className="w-6 h-6" /></button>
            <button onClick={async (e) => {
              e.stopPropagation()
              try {
                const response = await fetch(viewingImage!)
                const blob = await response.blob()
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `image_${Date.now()}.jpg`
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
              } catch (err) { window.open(viewingImage!, '_blank') }
            }} className="p-2 hover:bg-white/10 rounded-full text-white"><Download className="w-6 h-6" /></button>
          </div>
          <div className="flex-1 flex items-center justify-center p-4">
            <img src={viewingImage} alt="" className="max-w-full max-h-full object-contain" onClick={(e) => e.stopPropagation()} />
          </div>
        </div>
      )}

      {/* Right Sidebar (Group Info / Contact Info - Right Slide-in) */}
      <AnimatePresence>
        {(showGroupSettings || showDirectChatSettings) && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 bottom-0 w-full md:w-80 lg:w-[400px] z-[80] bg-[#f0f2f5] border-l border-gray-200 flex flex-col shadow-2xl"
          >
            {/* Sidebar Header */}
            <div className="flex-shrink-0 pt-12 pb-4 px-4 text-white flex items-end gap-4 h-[108px]" style={{ backgroundColor: primaryColor }}>
              <button 
                onClick={() => { setShowGroupSettings(false); setShowDirectChatSettings(false); }} 
                className="w-10 h-10 flex items-center justify-center -ml-2 hover:bg-white/20 rounded-full transition-colors mb-0.5"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-[19px] font-medium leading-none mb-2">
                {showGroupSettings ? 'Group info' : 'Contact info'}
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto">
               {/* Hero Section (Avatar & Name) */}
               <div className="bg-white px-7 py-7 mb-2 flex flex-col items-center shadow-sm">
                  <div className="w-[200px] h-[200px] mb-5">
                    <SyncAvatar 
                      userId={showDirectChatSettings ? selectedChat?.participants.find(id => id !== user?.uid) : undefined} 
                      size="w-full h-full" 
                      className="rounded-full overflow-hidden shadow-sm"
                      bgColor={primaryColor}
                      initialAvatar={selectedChat ? getChatAvatar(selectedChat) : undefined}
                      fallbackName={selectedChat ? getChatDisplayName(selectedChat) : '?'}
                      isGroup={showGroupSettings}
                    />
                  </div>
                  <div className="text-center w-full">
                    {showGroupSettings && isRenaming ? (
                       <input 
                        type="text" 
                        value={newGroupName} 
                        onChange={(e) => setNewGroupName(e.target.value)}
                        className="text-[20px] font-normal text-[#111b21] border-b-2 border-emerald-500 bg-transparent text-center focus:outline-none w-full"
                        autoFocus
                        onBlur={() => { renameGroup(newGroupName); setIsRenaming(false) }}
                       />
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <h3 className="text-[20px] font-normal text-[#111b21]">{selectedChat ? getChatDisplayName(selectedChat) : ''}</h3>
                        {showGroupSettings && isGroupCreator() && (
                          <button onClick={() => { setIsRenaming(true); setNewGroupName(getChatDisplayName(selectedChat!)) }}>
                            <Edit3 className="w-4 h-4 text-gray-400 hover:text-emerald-500" />
                          </button>
                        )}
                      </div>
                    )}
                    <p className="text-[14px] text-[#667781] mt-1">
                      {showGroupSettings ? `Group · ${selectedChat?.participants.length} members` : (viewingProfileData?.phone_number || 'Direct Chat')}
                    </p>
                  </div>
               </div>

               {/* Description / About */}
               <div className="bg-white px-7 py-4 mb-2 shadow-sm">
                  <label className="text-[14px] text-[#667781] mb-2 block font-normal">
                    {showGroupSettings ? 'Group description' : 'About'}
                  </label>
                  <p className="text-[17px] text-[#111b21]">
                    {showGroupSettings ? (selectedChat?.description || 'No description provided') : (viewingProfileData?.designation || 'Available')}
                  </p>
               </div>

               {/* Members Section (Groups only) */}
               {showGroupSettings && selectedChat?.type === 'group' && (
                 <div className="bg-white px-7 py-4 mb-2 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                       <h4 className="text-[14px] text-[#667781] font-normal">{selectedChat.participants.length} members</h4>
                       <button className="text-[#54656f] hover:text-emerald-600"><Search className="w-5 h-5"/></button>
                    </div>
                    
                    <div className="space-y-4">
                      {isGroupCreator() && (
                        <button 
                          onClick={() => { 
                            setIsAddingMember(true);
                            setShowNewChat(true); 
                            setShowNewGroup(true); 
                            setGroupStep(1); 
                            setSelectedMembers([]);
                          }} 
                          className="w-full flex items-center gap-4 group"
                        >
                           <div className="w-[40px] h-[40px] rounded-full flex items-center justify-center bg-emerald-500 text-white shadow-sm ring-1 ring-emerald-500 group-hover:scale-105 transition-transform"><UserPlus className="w-5 h-5"/></div>
                           <span className="text-[17px] text-[#111b21]">Add member</span>
                        </button>
                      )}

                      {selectedChat.participants.map(pid => (
                        <div key={pid} className="flex items-center gap-4 group cursor-pointer" onClick={() => setShowUserProfile(pid)}>
                          <SyncAvatar userId={pid} size="w-[40px] h-[40px]" className="rounded-full shadow-sm" bgColor={primaryColor} />
                          <div className="flex-1 min-w-0 border-b border-[#f2f2f2] group-last:border-none pb-3 pt-1 flex items-center justify-between">
                             <div className="min-w-0">
                               <p className="text-[16px] text-[#111b21] truncate font-normal">
                                 {selectedChat.participantDetails[pid]?.name || 'Member'}
                                 {pid === user?.uid && <span className="ml-2 text-[12px] bg-emerald-50 text-emerald-600 px-1 rounded">You</span>}
                               </p>
                               {selectedChat.admins.includes(pid) && <p className="text-[12px] text-emerald-600 font-bold uppercase tracking-wider mt-0.5">Admin</p>}
                             </div>
                             {isGroupCreator() && pid !== user?.uid && (
                               <button onClick={(e) => { e.stopPropagation(); removeGroupMember(pid); }} className="p-2 opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-50 rounded-full transition-all">
                                 <UserMinus className="w-4 h-4" />
                               </button>
                             )}
                          </div>
                        </div>
                      ))}
                    </div>
                 </div>
               )}

               {/* Actions Section */}
               <div className="bg-white px-3 py-2 shadow-sm mb-10">
                  {showGroupSettings ? (
                    <>
                      <button 
                        onClick={() => { if(confirm('Leave group?')) leaveGroup(); setShowGroupSettings(false); }} 
                        className="w-full p-4 flex items-center gap-4 text-red-500 hover:bg-red-50 rounded-xl transition-colors text-left font-medium"
                      >
                        <LogOut className="w-5 h-5" /> Leave group
                      </button>
                      {isGroupCreator() && (
                        <button 
                          onClick={() => { if(confirm('Delete group?')) deleteGroup(); setShowGroupSettings(false); }} 
                          className="w-full p-4 flex items-center gap-4 text-red-500 hover:bg-red-50 rounded-xl transition-colors text-left font-medium"
                        >
                          <Trash2 className="w-5 h-5" /> Delete group
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => handleCopyText(viewingProfileData?.phone_number)}
                        className="w-full p-4 flex items-center gap-4 text-[#111b21] hover:bg-gray-100 rounded-xl transition-colors text-left font-medium"
                      >
                        <Copy className="w-5 h-5 text-[#667781]" /> Copy phone number
                      </button>
                      <button 
                        onClick={() => { if(confirm('Clear chat history?')) alert('Feature coming soon!'); setShowDirectChatSettings(false); }} 
                        className="w-full p-4 flex items-center gap-4 text-red-500 hover:bg-red-50 rounded-xl transition-colors text-left font-medium"
                      >
                        <Trash2 className="w-5 h-5" /> Clear chat
                      </button>
                    </>
                  )}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contact Profile Sidebar (Right Slide-in) */}
      <AnimatePresence>
        {showUserProfile && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 bottom-0 w-full md:w-80 lg:w-[400px] z-[90] bg-[#f0f2f5] border-l border-gray-200 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex-shrink-0 pt-12 pb-4 px-4 text-white flex items-end gap-4 h-[108px]" style={{ backgroundColor: primaryColor }}>
              <button 
                onClick={() => setShowUserProfile(null)} 
                className="w-10 h-10 flex items-center justify-center -ml-2 hover:bg-white/20 rounded-full transition-colors mb-0.5"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-[19px] font-medium leading-none mb-2">Contact info</h2>
            </div>

            <div className="flex-1 overflow-y-auto">
              {!viewingProfileData ? (
                <div className="flex items-center justify-center p-20">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                </div>
              ) : (
                <>
                  {/* Hero Section */}
                  <div className="bg-white px-7 py-7 mb-2 flex flex-col items-center shadow-sm">
                    <div className="w-[200px] h-[200px] mb-5 rounded-full overflow-hidden shadow-sm ring-1 ring-gray-100 flex items-center justify-center bg-gray-200">
                      {viewingProfileData.profile_image_url ? (
                        <img src={viewingProfileData.profile_image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-6xl" style={{ backgroundColor: primaryColor }}>
                          {viewingProfileData.first_name?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <h3 className="text-[20px] font-normal text-[#111b21]">{viewingProfileData.first_name} {viewingProfileData.last_name}</h3>
                      <p className="text-[14px] text-[#667781] mt-1">{viewingProfileData.designation || 'Member'}</p>
                    </div>
                  </div>

                  {/* Info Section */}
                  <div className="bg-white px-7 py-4 mb-2 shadow-sm space-y-6">
                    <div>
                      <label className="text-[14px] text-[#667781] mb-2 block font-normal">About</label>
                      <p className="text-[17px] text-[#111b21]">{viewingProfileData.designation || 'Available'}</p>
                    </div>
                    
                    <div>
                      <label className="text-[14px] text-[#667781] mb-2 block font-normal">Email address</label>
                      <p 
                        className="text-[17px] text-[#111b21] flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1 -m-1 rounded-lg transition-colors"
                        onClick={() => handleCopyText(viewingProfileData.email, 'Email')}
                      >
                        <Mail className="w-5 h-5 text-gray-400" />
                        {viewingProfileData.email}
                      </p>
                    </div>

                    {viewingProfileData.phone_number && (
                      <div>
                        <label className="text-[14px] text-[#667781] mb-2 block font-normal">Phone number</label>
                        <p 
                          className="text-[17px] text-[#111b21] flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1 -m-1 rounded-lg transition-colors"
                          onClick={() => handleCopyText(viewingProfileData.phone_number)}
                        >
                          <Phone className="w-5 h-5 text-gray-400" />
                          {viewingProfileData.phone_number}
                        </p>
                      </div>
                    )}

                    <div>
                      <label className="text-[14px] text-[#667781] mb-2 block font-normal">Zone</label>
                      <p className="text-[17px] text-[#111b21] flex items-center gap-3">
                        <Users className="w-5 h-5 text-gray-400" />
                        {viewingProfileData.zone || 'No Zone assigned'}
                      </p>
                    </div>
                  </div>

                  {/* Settings / Actions */}
                  <div className="bg-white px-3 py-2 shadow-sm mb-10">
                    <button 
                      onClick={() => { if(confirm('Delete contact?')) alert('Contact deleted (Local UI simulation)'); setShowUserProfile(null); }} 
                      className="w-full p-4 flex items-center gap-4 text-red-500 hover:bg-red-50 rounded-xl transition-colors text-left font-medium"
                    >
                      <Trash2 className="w-5 h-5" /> Delete contact
                    </button>
                    <button 
                      onClick={() => { if(confirm(`Block ${viewingProfileData.first_name}?`)) alert('User blocked'); setShowUserProfile(null); }} 
                      className="w-full p-4 flex items-center gap-4 text-red-500 hover:bg-red-50 rounded-xl transition-colors text-left font-medium"
                    >
                      <LogOut className="w-5 h-5" /> Block {viewingProfileData.first_name}
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* My Profile Sidebar (Left Slide-in) */}
      <AnimatePresence>
        {showMyProfile && (
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed left-0 top-0 bottom-0 w-full md:w-80 lg:w-[380px] z-[70] bg-[#f0f2f5] border-r border-gray-200 flex flex-col shadow-2xl"
          >
            {/* Profile Header */}
            <div className="flex-shrink-0 pt-12 pb-4 px-4 text-white flex items-end gap-3 h-[108px]" style={{ backgroundColor: primaryColor }}>
              <button 
                onClick={() => setShowMyProfile(false)} 
                className="w-10 h-10 flex items-center justify-center -ml-2 hover:bg-white/20 rounded-full transition-colors mb-0.5"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h2 className="text-[19px] font-medium leading-none mb-2">Profile</h2>
            </div>
            
            {/* Profile Body */}
            <div className="flex-1 overflow-y-auto">
              {/* Profile Image Section */}
              <div className="py-7 flex flex-col items-center">
                <div className="relative w-[200px] h-[200px] group cursor-pointer">
                  <div className="w-full h-full rounded-full overflow-hidden bg-gray-300 shadow-sm ring-1 ring-gray-100 flex items-center justify-center">
                    {profile?.profile_image_url ? (
                      <img src={profile.profile_image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-6xl" style={{ backgroundColor: primaryColor }}>
                        {profile?.first_name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  
                  {/* Overlay for uploading */}
                  <label className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[13px] uppercase tracking-wider text-center px-4 font-medium backdrop-blur-[2px]">
                    <Camera className="w-8 h-8 mb-2" />
                    Change profile photo
                    <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setIsUploading(true)
                        try {
                          const { uploadImageToCloudinary } = await import('@/lib/cloudinary-storage')
                          const url = await uploadImageToCloudinary(file)
                          await FirebaseDatabaseService.updateUserProfile(user!.uid, { profile_image_url: url })
                          await refreshProfile()
                        } catch (err) {
                           console.error('Profile upload error:', err)
                        } finally {
                          setIsUploading(false)
                        }
                      }
                    }} />
                  </label>
                  
                  {isUploading && (
                    <div className="absolute inset-0 bg-white/60 rounded-full flex items-center justify-center">
                      <Loader2 className="w-10 h-10 animate-spin" style={{ color: primaryColor }} />
                    </div>
                  )}
                </div>
              </div>

              {/* Name Section */}
              <div className="bg-white px-7 py-4 shadow-sm mb-7">
                <label className="text-[14px] text-emerald-600 mb-4 block font-normal">Your name</label>
                <div className="flex items-center justify-between border-b border-transparent focus-within:border-emerald-500 transition-colors group">
                  <input 
                    type="text" 
                    defaultValue={profile?.first_name + ' ' + (profile?.last_name || '')} 
                    className="flex-1 py-1 text-[17px] text-[#111b21] focus:outline-none"
                    onBlur={async (e) => {
                      const val = e.target.value.trim()
                      if (!val) return
                      const parts = val.split(' ')
                      const first = parts[0]
                      const last = parts.slice(1).join(' ')
                      await FirebaseDatabaseService.updateUserProfile(user!.uid, { first_name: first, last_name: last })
                      await refreshProfile()
                    }} 
                  />
                  <Edit3 className="w-[18px] h-[18px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-[14px] text-gray-500 mt-6 leading-[1.4]">
                  This is not your username or pin. This name will be visible to your Rehearsal Hub contacts.
                </p>
              </div>

              {/* Info Section */}
              <div className="bg-white px-7 py-4 shadow-sm">
                <label className="text-[14px] text-emerald-600 mb-4 block font-normal">About</label>
                <div className="flex items-center justify-between group">
                  <div className="flex-1 py-1 text-[17px] text-[#111b21]">
                    {profile?.designation || 'Member of Loveworld Singers'}
                  </div>
                  <Edit3 className="w-[18px] h-[18px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* Zone Info (Locked) */}
              <div className="px-7 py-4 mt-2">
                <label className="text-[14px] text-gray-400 mb-1 block font-normal uppercase tracking-wider">Your Zone</label>
                <div className="text-[15px] font-bold text-gray-800">
                  {currentZone?.name || 'Assigned Zone'}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
     </>
   )
 }

// HELPERS
function adjustColor(color: string, amount: number): string {
  if (!color) return '#10b981'
  if (color.length < 7) return color 
  const hex = color.replace('#', '')
  const num = parseInt(hex, 16)
  const r = Math.max(0, Math.min(255, (num >> 16) + amount))
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount))
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}
