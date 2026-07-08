'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { useZoneStore } from '@/stores/zoneStore'
import { 
  FirebaseChatService, 
  Chat, 
  ChatMessage, 
  ChatUser, 
  FriendRequest 
} from '../_lib/firebase-chat-service'
import { WhatsAppPresence } from '../_lib/whatsapp-presence'

interface ChatContextType {
  // Current state
  chats: Chat[]
  selectedChat: Chat | null
  messages: ChatMessage[]
  onlineUsers: ChatUser[]
  friendRequests: FriendRequest[]
  replyToMessage: ChatMessage | null
  editingMessage: ChatMessage | null
  
  // Loading states
  isChatsLoading: boolean
  isMessagesLoading: boolean
  isUsersLoading: boolean
  
  // Actions
  setSelectedChat: (chat: Chat | null) => void
  setReplyToMessage: (message: ChatMessage | null) => void
  setEditingMessage: (message: ChatMessage | null) => void
  sendMessage: (messageData: { text?: string; image?: string; fileUrl?: string; fileName?: string }) => Promise<boolean>
  searchUsers: (searchTerm: string) => Promise<ChatUser[]>
  createDirectChat: (userId: string) => Promise<string | null>
  createGroupChat: (name: string, description: string, participantIds: string[]) => Promise<string | null>
  sendFriendRequest: (userId: string) => Promise<boolean>
  acceptFriendRequest: (requestId: string) => Promise<boolean>
  getFriendStatus: (userId: string) => Promise<{ status: 'none' | 'pending_outgoing' | 'pending_incoming' | 'friends'; requestId?: string }>
  toggleReaction: (messageId: string, emoji?: string) => Promise<void>
  deleteMessage: (messageId: string) => Promise<boolean>
  editMessage: (messageId: string, newText: string) => Promise<boolean>
  
  // Group management
  addUserToGroup: (chatId: string, userId: string) => Promise<boolean>
  removeUserFromGroup: (chatId: string, userId: string) => Promise<boolean>
  makeUserAdmin: (chatId: string, userId: string) => Promise<boolean>
  updateGroupInfo: (chatId: string, updates: { name?: string; description?: string; avatar?: string }) => Promise<boolean>
  leaveGroup: (chatId: string) => Promise<boolean>
  
  // Chat management
  deleteChat: (chatId: string) => Promise<boolean>
  togglePinChat: (chatId: string, pin: boolean) => Promise<boolean>
  toggleStarChat: (chatId: string, star: boolean) => Promise<boolean>
  searchMessages: (chatId: string, searchTerm: string) => Promise<ChatMessage[]>
  
  // Message management
  toggleStarMessage: (messageId: string) => Promise<boolean>
  isMessageStarred: (messageId: string) => Promise<boolean>
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const profile = useAuthStore((s) => s.profile)
  const currentZone = useZoneStore((s) => s.currentZone)
  const userId = user?.uid || profile?.id || ''
  
  // Local state for all chat data (no Zustand caching)
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isChatsLoading, setIsChatsLoading] = useState(true) // Start as loading
  const [isMessagesLoading, setIsMessagesLoading] = useState(false)
  
  // Local state for UI-only data
  const [onlineUsers, setOnlineUsers] = useState<ChatUser[]>([])
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])
  const [replyToMessage, setReplyToMessage] = useState<ChatMessage | null>(null)
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null)
  const [isUsersLoading, setIsUsersLoading] = useState(false)

  // Initialize user in chat system
  useEffect(() => {
    if (!userId) return

    const chatUser: Partial<ChatUser> = {
      id: userId,
      email: profile?.email || user?.email || '',
      fullName: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || profile?.email || 'User',
      firstName: profile?.first_name,
      lastName: profile?.last_name,
      zoneId: currentZone?.id,
      zoneName: currentZone?.name
    }

    const profileImageUrl = (profile as any)?.profile_image_url
    if (profileImageUrl) chatUser.profilePic = profileImageUrl

    WhatsAppPresence.initializePresence(userId)
    FirebaseChatService.createOrUpdateUser(chatUser)
    FirebaseChatService.updateUserStatus(userId, true)
  // Only re-run when userId or zone changes — not on every profile field change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, currentZone?.id])

    useEffect(() => {
    if (!userId) return

    const handleFocus = () => {
      WhatsAppPresence.updateStatus(userId, 'online')
      FirebaseChatService.updateUserStatus(userId, true)
    }
    
    const handleBlur = () => {
      WhatsAppPresence.updateStatus(userId, 'offline')
      FirebaseChatService.updateUserStatus(userId, false)
    }
    
    const handleBeforeUnload = () => {
      WhatsAppPresence.updateStatus(userId, 'offline')
    }
    
    window.addEventListener('focus', handleFocus)
    window.addEventListener('blur', handleBlur)
    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      WhatsAppPresence.cleanup(userId)
      FirebaseChatService.updateUserStatus(userId, false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  // Subscribe to chats - SIMPLE like WhatsApp
  useEffect(() => {
    if (!userId) {
      setIsChatsLoading(false)
      return
    }
    
    setIsChatsLoading(true)
    const unsubscribe = FirebaseChatService.subscribeToChats(userId, (cleanChats) => {
      setChats(cleanChats)
      setIsChatsLoading(false)
    })

    return () => { unsubscribe() }
  // Stable userId string dep — not user/profile objects
  }, [userId])

  // Subscribe to messages for selected chat - Fetch fresh from Firebase
  useEffect(() => {
    if (!selectedChat) {
      setReplyToMessage(null)
      setEditingMessage(null)
      setMessages([])
      return
    }

    setIsMessagesLoading(true)
    setMessages([])
    
    // Subscribe to fresh messages from Firebase
    const unsubscribe = FirebaseChatService.subscribeToMessages(selectedChat.id, (freshMessages) => {
      if (freshMessages.length === 0) {
      }
      setMessages(freshMessages)
      setIsMessagesLoading(false)
    })

    return () => {
      unsubscribe()
      setMessages([])
    }
  }, [selectedChat?.id])

  // Load friend requests - use cached profile.id for instant loading
  useEffect(() => {
    if (!userId) return
    const loadFriendRequests = async () => {
      const requests = await FirebaseChatService.getFriendRequests(userId)
      setFriendRequests(requests)
    }
    loadFriendRequests()
  }, [userId])

  // Actions
  const sendMessage = useCallback(async (messageData: { 
    text?: string; 
    image?: string; 
    fileUrl?: string; 
    fileName?: string 
  }) => {
    if (!selectedChat || !user || !profile) return false

    // Get sender name - try to fetch from zone_members first for accurate name
    let senderName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
    
    // If no name from profile, try to get from zone_members
    if (!senderName) {
      try {
        const userFromZone = await FirebaseChatService.getUser(user.uid)
        senderName = userFromZone?.fullName || profile.email?.split('@')[0] || 'User'
      } catch (error) {
 console.error('Error getting user name:', error)
        senderName = profile.email?.split('@')[0] || 'User'
      }
    }
    
        const isBoss = profile?.role === 'boss' || user.email?.toLowerCase().startsWith('boss')

    const replyMeta = replyToMessage ? {
      messageId: replyToMessage.id,
      senderName: replyToMessage.senderName,
      snippet: replyToMessage.text 
        ? replyToMessage.text.slice(0, 120)
        : replyToMessage.image 
          ? ' Image'
          : replyToMessage.fileName 
            ? ` ${replyToMessage.fileName}`
            : 'Message'
    } : undefined

    const result = await FirebaseChatService.sendMessage(
      selectedChat.id,
      user.uid,
      senderName,
      {
        ...messageData,
        replyTo: replyMeta
      },
      isBoss
    )
    
    if (result) {
      setReplyToMessage(null)
    }
    
    return result
  }, [selectedChat, user, profile, replyToMessage])

  const searchUsers = useCallback(async (searchTerm: string) => {
    // Use cached profile if user is still loading
    const userId = user?.uid || profile?.id
    if (!userId || !profile) {
      return []
    }
    
        const isBoss = profile?.role === 'boss' || user?.email?.toLowerCase().startsWith('boss')
    
    setIsUsersLoading(true)
    // Pass correct zoneId and isBoss flag for proper filtering
    const users = await FirebaseChatService.searchUsers(searchTerm, userId, currentZone?.id, isBoss)
    setIsUsersLoading(false)
    return users
  }, [user, profile, currentZone])

  const createDirectChat = useCallback(async (userId: string) => {
    // Use cached profile if user is still loading
    const currentUserId = user?.uid || profile?.id
    if (!currentUserId) {
      return null
    }
    return await FirebaseChatService.createDirectChat(currentUserId, userId)
  }, [user, profile])

  const createGroupChat = useCallback(async (
    name: string, 
    description: string, 
    participantIds: string[]
  ) => {
    if (!user) return null
    return await FirebaseChatService.createGroupChat(name, description, user.uid, participantIds)
  }, [user])

  const sendFriendRequest = useCallback(async (userId: string) => {
    if (!user) return false
    return await FirebaseChatService.sendFriendRequest(user.uid, userId)
  }, [user])

  const getFriendStatus = useCallback(async (userId: string) => {
    if (!user) return { status: 'none' as const }
    return await FirebaseChatService.getFriendStatus(user.uid, userId)
  }, [user])

  const acceptFriendRequest = useCallback(async (requestId: string) => {
    const result = await FirebaseChatService.acceptFriendRequest(requestId)
    if (result) {
      // Refresh friend requests
      const requests = await FirebaseChatService.getFriendRequests(user?.uid || '')
      setFriendRequests(requests)
    }
    return result
  }, [user])

  // Group management actions
  const addUserToGroup = useCallback(async (chatId: string, userId: string) => {
    if (!user) return false
    return await FirebaseChatService.addUserToGroup(chatId, userId, user.uid)
  }, [user])

  const removeUserFromGroup = useCallback(async (chatId: string, userId: string) => {
    if (!user) return false
    return await FirebaseChatService.removeUserFromGroup(chatId, userId, user.uid)
  }, [user])

  const makeUserAdmin = useCallback(async (chatId: string, userId: string) => {
    if (!user) return false
    return await FirebaseChatService.makeUserAdmin(chatId, userId, user.uid)
  }, [user])

  const updateGroupInfo = useCallback(async (
    chatId: string, 
    updates: { name?: string; description?: string; avatar?: string }
  ) => {
    if (!user) return false
    return await FirebaseChatService.updateGroupInfo(chatId, user.uid, updates)
  }, [user])

  const leaveGroup = useCallback(async (chatId: string) => {
    if (!user) return false
    const result = await FirebaseChatService.leaveGroup(chatId, user.uid)
    if (result) {
      setSelectedChat(null)
    }
    return result
  }, [user])

  const deleteChat = useCallback(async (chatId: string) => {
    if (!user) return false
    const result = await FirebaseChatService.deleteChat(chatId, user.uid)
    if (result && selectedChat?.id === chatId) {
      setSelectedChat(null)
    }
    return result
  }, [user, selectedChat])

  const togglePinChat = useCallback(async (chatId: string, pin: boolean) => {
    if (!user) return false
    return await FirebaseChatService.togglePinChat(chatId, user.uid, pin)
  }, [user])

  const toggleStarChat = useCallback(async (chatId: string, star: boolean) => {
    if (!user) return false
    return await FirebaseChatService.toggleStarChat(chatId, user.uid, star)
  }, [user])

  const searchMessages = useCallback(async (chatId: string, searchTerm: string) => {
    return await FirebaseChatService.searchMessages(chatId, searchTerm)
  }, [])

  const toggleStarMessage = useCallback(async (messageId: string) => {
    if (!user) return false
    return await FirebaseChatService.toggleStarMessage(messageId, user.uid)
  }, [user])

  const isMessageStarred = useCallback(async (messageId: string) => {
    if (!user) return false
    return await FirebaseChatService.isMessageStarred(messageId, user.uid)
  }, [user])

  const toggleReaction = useCallback(async (messageId: string, emoji: string = '❤️') => {
    if (!user) return
    await FirebaseChatService.toggleReaction(messageId, user.uid, profile?.first_name || user.email || 'You', emoji)
  }, [user, profile])

  const deleteMessage = useCallback(async (messageId: string) => {
    if (!user) return false
    return await FirebaseChatService.deleteMessage(messageId, user.uid)
  }, [user])

  const editMessage = useCallback(async (messageId: string, newText: string) => {
    if (!user) return false
    const result = await FirebaseChatService.editMessage(messageId, user.uid, newText)
    if (result) {
      setEditingMessage(null)
    }
    return result
  }, [user])

  const contextValue: ChatContextType = {
    // State
    chats,
    selectedChat,
    messages,
    onlineUsers,
    friendRequests,
    replyToMessage,
    editingMessage,
    
    // Loading states
    isChatsLoading,
    isMessagesLoading,
    isUsersLoading,
    
    // Actions
    setSelectedChat,
    setReplyToMessage,
    setEditingMessage,
    sendMessage,
    searchUsers,
    createDirectChat,
    createGroupChat,
    sendFriendRequest,
    acceptFriendRequest,
    getFriendStatus,
    toggleReaction,
    deleteMessage,
    editMessage,
    
    // Group management
    addUserToGroup,
    removeUserFromGroup,
    makeUserAdmin,
    updateGroupInfo,
    leaveGroup,
    
    // Chat management
    deleteChat,
    togglePinChat,
    toggleStarChat,
    searchMessages,
    
    // Message management
    toggleStarMessage,
    isMessageStarred
  }

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}
