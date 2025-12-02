'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useZone } from '@/hooks/useZone'
import { 
  FirebaseChatService, 
  Chat, 
  ChatMessage, 
  ChatUser, 
  FriendRequest 
} from '../_lib/firebase-chat-service'

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
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth()
  const { currentZone } = useZone()
  
  // State
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [onlineUsers, setOnlineUsers] = useState<ChatUser[]>([])
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])
  const [replyToMessage, setReplyToMessage] = useState<ChatMessage | null>(null)
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null)
  
  // Loading states
  const [isChatsLoading, setIsChatsLoading] = useState(false)
  const [isMessagesLoading, setIsMessagesLoading] = useState(false)
  const [isUsersLoading, setIsUsersLoading] = useState(false)

  // Initialize user in chat system
  useEffect(() => {
    if (user && profile) {
      const chatUser: Partial<ChatUser> = {
        id: user.uid,
        email: profile.email || user.email || '',
        fullName: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email || 'User',
        firstName: profile.first_name,
        lastName: profile.last_name,
        profilePic: profile.profile_image_url,
        zoneId: currentZone?.id,
        zoneName: currentZone?.name
      }
      
      FirebaseChatService.createOrUpdateUser(chatUser)
      FirebaseChatService.updateUserStatus(user.uid, true)
    }
  }, [user, profile, currentZone])

  // Update user status on window focus/blur
  useEffect(() => {
    if (!user) return

    const handleFocus = () => FirebaseChatService.updateUserStatus(user.uid, true)
    const handleBlur = () => FirebaseChatService.updateUserStatus(user.uid, false)
    
    window.addEventListener('focus', handleFocus)
    window.addEventListener('blur', handleBlur)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('blur', handleBlur)
      FirebaseChatService.updateUserStatus(user.uid, false)
    }
  }, [user])

  // Subscribe to chats
  useEffect(() => {
    if (!user) return

    setIsChatsLoading(true)
    
    const unsubscribe = FirebaseChatService.subscribeToChats(user.uid, (chats) => {
      setChats(chats)
      setIsChatsLoading(false)
    })

    return unsubscribe
  }, [user])

  // Subscribe to messages for selected chat
  useEffect(() => {
    if (!selectedChat) {
      setMessages([])
      setIsMessagesLoading(false)
      setReplyToMessage(null)
      setEditingMessage(null)
      return
    }

    setIsMessagesLoading(true)
    
    // Set a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.log('⚠️ Message loading timeout - setting loading to false')
      setIsMessagesLoading(false)
    }, 3000) // 3 second timeout
    
    const unsubscribe = FirebaseChatService.subscribeToMessages(selectedChat.id, (messages) => {
      clearTimeout(loadingTimeout)
      setMessages(messages)
      setIsMessagesLoading(false)
    })

    return () => {
      clearTimeout(loadingTimeout)
      unsubscribe()
    }
  }, [selectedChat])

  // Load friend requests
  useEffect(() => {
    if (!user) return

    const loadFriendRequests = async () => {
      const requests = await FirebaseChatService.getFriendRequests(user.uid)
      setFriendRequests(requests)
    }

    loadFriendRequests()
  }, [user])

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
    
    // Check if user is Boss
    const isBoss = profile?.role === 'boss' || user.email?.toLowerCase().startsWith('boss')

    const replyMeta = replyToMessage ? {
      messageId: replyToMessage.id,
      senderName: replyToMessage.senderName,
      snippet: replyToMessage.text 
        ? replyToMessage.text.slice(0, 120)
        : replyToMessage.image 
          ? '📷 Image'
          : replyToMessage.fileName 
            ? `📎 ${replyToMessage.fileName}`
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
    if (!user || !profile) return []
    
    // Check if user is Boss (Boss can see everyone)
    const isBoss = profile?.role === 'boss' || user.email?.toLowerCase().startsWith('boss')
    
    setIsUsersLoading(true)
    // Pass correct zoneId and isBoss flag for proper filtering
    const users = await FirebaseChatService.searchUsers(searchTerm, user.uid, currentZone?.id, isBoss)
    setIsUsersLoading(false)
    return users
  }, [user, profile, currentZone])

  const createDirectChat = useCallback(async (userId: string) => {
    if (!user) return null
    return await FirebaseChatService.createDirectChat(user.uid, userId)
  }, [user])

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
    updateGroupInfo
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