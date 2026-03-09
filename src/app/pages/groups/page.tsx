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

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const isAtBottom = useRef(true)

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
    }
  }, [messages])

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

  // Handle sending message moves to ChatWindow via context/props
  // Theme color
  const themeColor = currentZone?.themeColor || '#10b981'
  const primaryColor = themeColor

  return (
    <>
      <div className="h-screen bg-gray-100 flex flex-col overflow-hidden">
        {/* Main Layout using modular components */}
        <div className="flex-1 flex overflow-hidden">
          <ChatList 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onNewChat={() => setShowNewChat(true)}
            onNewGroup={() => setShowNewGroup(true)}
            onShowMyProfile={() => {
              setShowMyProfile(true)
              setIsEditingMyProfile(false)
            }}
            onBack={() => router.back()}
            primaryColor={primaryColor}
          />

          <ChatWindow 
            primaryColor={primaryColor}
            onShowGroupSettings={() => setShowGroupSettings(true)}
            onShowDirectChatSettings={() => setShowDirectChatSettings(true)}
            onBackToList={() => selectChat(null)}
          />
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChat && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          <div className="flex-shrink-0 p-4 text-white flex items-center gap-3" style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${adjustColor(primaryColor, -20)} 100%)` }}>
            <button onClick={() => { setShowNewChat(false); setSearchTerm(''); setSearchResults([]) }} className="p-2 hover:bg-white/20 rounded-lg">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h2 className="text-lg font-semibold">New Chat</h2>
              <p className="text-sm opacity-80">Search members to start chatting</p>
            </div>
          </div>
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                placeholder="Search by name..." 
                className="w-full pl-11 pr-4 py-3 bg-gray-100 rounded-xl focus:outline-none"
                style={{ '--tw-ring-color': primaryColor } as any}
                autoFocus
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isSearching ? (
              <div className="py-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto" style={{ color: primaryColor }} /></div>
            ) : searchResults.length === 0 ? (
              <div className="py-12 text-center text-gray-500">{searchTerm ? `No members found for "${searchTerm}"` : 'Type a name to search'}</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {searchResults.map(user => (
                  <button key={user.id} onClick={() => handleStartChat(user)} className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 text-left">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold" style={{ backgroundColor: primaryColor }}>{user.name.charAt(0).toUpperCase()}</div>
                    <div className="flex-1 min-w-0"><p className="font-semibold truncate">{user.name}</p>{user.zoneName && <p className="text-sm text-gray-500 truncate">{user.zoneName}</p>}</div>
                    <MessageCircle className="w-5 h-5 text-gray-400" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Group Modal */}
      {showNewGroup && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            {groupStep === 1 ? (
              <>
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="text-lg font-semibold">New Group</h3>
                  <button onClick={() => setShowNewGroup(false)}><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                <div className="p-6">
                  <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15` }}>
                    <Users className="w-10 h-10" style={{ color: primaryColor }} />
                  </div>
                  <input type="text" value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="Group name" className="w-full px-4 py-3 bg-gray-100 rounded-xl text-center focus:outline-none" autoFocus />
                </div>
                <div className="p-4 border-t"><button onClick={() => setGroupStep(2)} disabled={!groupName.trim()} className="w-full py-3 text-white font-semibold rounded-xl flex items-center justify-center gap-2" style={{ backgroundColor: primaryColor }}>Next <ChevronLeft className="w-5 h-5 rotate-180" /></button></div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 p-4 border-b">
                  <button onClick={() => setGroupStep(1)}><ChevronLeft className="w-5 h-5 text-gray-400" /></button>
                  <div className="flex-1"><h3 className="text-lg font-semibold">Add Members</h3><p className="text-xs text-gray-500">{groupName}</p></div>
                  <button onClick={() => setShowNewGroup(false)}><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                {/* Selected Members Mini List */}
                {selectedMembers.length > 0 && (
                  <div className="px-4 py-3 border-b bg-gray-50 flex flex-wrap gap-2">
                    {selectedMembers.map(m => (
                      <span key={m.id} className="inline-flex items-center gap-1 px-2 py-1 text-sm rounded-full" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                        {m.name} <button onClick={() => setSelectedMembers(prev => prev.filter(p => p.id !== m.id))}><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="p-4"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search members..." className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none" /></div></div>
                <div className="flex-1 overflow-y-auto px-4 max-h-60">
                   {searchResults.filter(u => !selectedMembers.find(m => m.id === u.id)).map(user => (
                     <button key={user.id} onClick={() => setSelectedMembers(prev => [...prev, user])} className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left">
                       <div className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: primaryColor }}>{user.name.charAt(0).toUpperCase()}</div>
                       <span className="flex-1 text-sm truncate">{user.name}</span>
                       <Plus className="w-4 h-4 text-gray-400" />
                     </button>
                   ))}
                </div>
                <div className="p-4 border-t"><button onClick={handleCreateGroup} disabled={selectedMembers.length === 0 || isCreatingGroup} className="w-full py-3 text-white font-semibold rounded-xl" style={{ backgroundColor: primaryColor }}>{isCreatingGroup ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : `Create Group (${selectedMembers.length})`}</button></div>
              </>
            )}
          </div>
        </div>
      )}

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

      {/* Group Settings Modal */}
      {showGroupSettings && selectedChat?.type === 'group' && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 text-white flex items-center gap-3" style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${adjustColor(primaryColor, -20)} 100%)` }}>
               <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center"><Users className="w-6 h-6" /></div>
               <div className="flex-1">
                 {isRenaming ? (
                   <input 
                    type="text" 
                    value={newGroupName} 
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="bg-white/20 text-white rounded px-2"
                    autoFocus
                    onBlur={() => { renameGroup(newGroupName); setIsRenaming(false) }}
                   />
                 ) : (
                   <div className="flex items-center gap-2">
                     <h3 className="font-bold">{getChatDisplayName(selectedChat)}</h3>
                     {isGroupCreator() && <button onClick={() => { setIsRenaming(true); setNewGroupName(getChatDisplayName(selectedChat)) }}><Edit3 className="w-3 h-3" /></button>}
                   </div>
                 )}
                 <p className="text-xs opacity-80">{selectedChat.participants.length} members</p>
               </div>
               <button onClick={() => setShowGroupSettings(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
               <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Members</h4>
               <div className="space-y-3">
                 {selectedChat.participants.map(pid => (
                   <div key={pid} className="flex items-center gap-3">
                     <SyncAvatar userId={pid} size="w-10 h-10" bgColor={primaryColor} />
                     <div className="flex-1"><p className="text-sm font-medium">{selectedChat.participantDetails[pid]?.name || 'Member'}</p>{selectedChat.createdBy === pid && <p className="text-[10px] text-emerald-600 font-bold">Creator</p>}</div>
                     {isGroupCreator() && pid !== user?.uid && <button onClick={() => removeGroupMember(pid)} className="text-red-400"><UserMinus className="w-4 h-4" /></button>}
                   </div>
                 ))}
               </div>
               {isGroupCreator() && (
                 <div className="mt-6">
                   <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Add Members</h4>
                   <div className="relative mb-2"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="text" value={groupSettingsSearchTerm} onChange={(e) => setGroupSettingsSearchTerm(e.target.value)} placeholder="Search..." className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-lg text-sm" /></div>
                   <div className="max-h-32 overflow-y-auto">
                     {groupSettingsSearchResults.filter(u => !selectedChat.participants.includes(u.id)).map(u => (
                       <button key={u.id} onClick={() => addGroupMembers([u])} className="w-full flex items-center gap-2 p-2 hover:bg-gray-50 text-sm font-medium border-b border-gray-50">{u.name}<UserPlus className="ml-auto w-4 h-4 text-gray-300"/></button>
                     ))}
                   </div>
                 </div>
               )}
            </div>
            <div className="p-4 border-t space-y-2">
               {isGroupCreator() ? (
                 <button onClick={() => { if(confirm('Delete group?')) deleteGroup() }} className="w-full py-3 bg-red-500 text-white rounded-xl font-bold">Delete Group</button>
               ) : (
                 <button onClick={() => { if(confirm('Leave group?')) leaveGroup() }} className="w-full py-3 bg-red-500 text-white rounded-xl font-bold">Leave Group</button>
               )}
            </div>
          </div>
        </div>
      )}

      {/* User Profile Viewing Modal */}
      {showUserProfile && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4" onClick={() => setShowUserProfile(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
            {!viewingProfileData ? (
              <div className="p-12 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-emerald-500" /></div>
            ) : (
              <>
                <div className="h-32" style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${adjustColor(primaryColor, -20)} 100%)` }} />
                <div className="px-6 pb-6 -mt-12 text-center text-gray-900 font-bold">
                  <div className="w-24 h-24 rounded-full border-4 border-white mx-auto overflow-hidden bg-gray-100 mb-4 shadow-lg">
                    {viewingProfileData.profile_image_url ? <img src={viewingProfileData.profile_image_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white text-3xl" style={{ backgroundColor: primaryColor }}>{viewingProfileData.first_name?.charAt(0)}</div>}
                  </div>
                  <h3 className="text-xl">{viewingProfileData.first_name} {viewingProfileData.last_name}</h3>
                  <p className="text-emerald-600 mb-4">{viewingProfileData.designation || 'Member'}</p>
                  <div className="p-4 bg-gray-50 rounded-xl space-y-2 font-medium text-sm text-gray-600 text-left">
                     <p className="flex items-center gap-2 truncate"><Mail className="w-4 h-4" /> {viewingProfileData.email}</p>
                     {viewingProfileData.phone_number && <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> {viewingProfileData.phone_number}</p>}
                     <p className="flex items-center gap-2"><Users className="w-4 h-4" /> {viewingProfileData.zone || 'No Zone'}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* My Profile Modal */}
      {showMyProfile && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="h-32 relative" style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${adjustColor(primaryColor, -20)} 100%)` }}>
               <button onClick={() => setShowMyProfile(false)} className="absolute top-4 right-4 p-2 bg-black/20 rounded-full text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-6 pb-6 -mt-12 text-center">
               <div className="relative w-24 h-24 mx-auto mb-4 group">
                 <div className="w-full h-full rounded-full border-4 border-white overflow-hidden bg-gray-100 shadow-lg">
                    {profile?.profile_image_url ? <img src={profile.profile_image_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white text-3xl" style={{ backgroundColor: primaryColor }}>{profile?.first_name?.charAt(0)}</div>}
                 </div>
                 <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <Camera className="w-8 h-8 text-white" />
                    <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setIsUploading(true)
                        const { uploadImageToCloudinary } = await import('@/lib/cloudinary-storage')
                        const url = await uploadImageToCloudinary(file)
                        await FirebaseDatabaseService.updateUserProfile(user!.uid, { profile_image_url: url })
                        await refreshProfile()
                        setIsUploading(false)
                      }
                    }} />
                 </label>
               </div>
               <div className="space-y-4">
                 <div>
                   <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Your Name</label>
                   <input type="text" defaultValue={profile?.first_name + ' ' + (profile?.last_name || '')} className="w-full px-4 py-2 bg-gray-50 rounded-lg text-center font-bold" onBlur={async (e) => {
                     const [first, ...last] = e.target.value.split(' ')
                     await FirebaseDatabaseService.updateUserProfile(user!.uid, { first_name: first, last_name: last.join(' ') })
                     await refreshProfile()
                   }} />
                 </div>
                 <div>
                   <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Designation</label>
                   <div className="px-4 py-2 bg-gray-50 rounded-lg font-bold text-gray-800">{profile?.designation || 'Member'}</div>
                 </div>
               </div>
               <button onClick={() => setShowMyProfile(false)} className="w-full mt-6 py-3 bg-gray-100 rounded-xl font-bold">Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Direct Chat Settings */}
      {showDirectChatSettings && selectedChat?.type === 'direct' && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4" onClick={() => setShowDirectChatSettings(false)}>
           <div className="bg-white rounded-3xl w-full max-w-xs p-4 space-y-3" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <SyncAvatar userId={selectedChat.participants.find(id => id !== user?.uid)} size="w-12 h-12" bgColor={primaryColor} />
                <div className="flex-1 font-bold truncate">{getChatDisplayName(selectedChat)}</div>
              </div>
              <button onClick={() => { setShowUserProfile(selectedChat.participants.find(id => id !== user?.uid)!); setShowDirectChatSettings(false) }} className="w-full p-4 hover:bg-gray-50 rounded-2xl flex items-center justify-between font-bold text-sm">View Profile <User className="w-4 h-4"/></button>
              <button onClick={() => { if(confirm('Clear chat history?')) alert('Available soon!'); setShowDirectChatSettings(false) }} className="w-full p-4 hover:bg-red-50 rounded-2xl flex items-center justify-between font-bold text-sm text-red-500">Clear Chat <Trash2 className="w-4 h-4"/></button>
              <button onClick={() => setShowDirectChatSettings(false)} className="w-full py-4 text-gray-400 font-bold border-t border-gray-100 uppercase tracking-widest text-xs">Close</button>
           </div>
        </div>
      )}
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
