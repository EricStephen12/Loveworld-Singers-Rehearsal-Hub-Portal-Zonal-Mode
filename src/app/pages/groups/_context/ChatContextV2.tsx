'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useZone } from '@/hooks/useZone'
import {
  Chat,
  Message,
  ChatUser,
  ReactionType,
  MessageAttachment,
  subscribeToChats,
  subscribeToMessages,
  sendMessage as sendChatMessage,
  getOrCreateDirectChat,
  createGroupChat as createGroup,
  searchZoneUsers,
  deleteChat as deleteChatService,
  deleteMessage as deleteMessageService,
  toggleReaction as toggleReactionService,
  addGroupMembers as addGroupMembersService,
  removeGroupMember as removeGroupMemberService,
  leaveGroup as leaveGroupService,
  deleteGroup as deleteGroupService,
  markChatAsRead
} from '../_lib/chat-service'

interface ChatContextType {
  // State
  chats: Chat[]
  selectedChat: Chat | null
  messages: Message[]
  currentUser: ChatUser | null
  
  // Loading
  isLoading: boolean
  isMessagesLoading: boolean
  
  // Actions
  selectChat: (chat: Chat | null) => void
  sendMessage: (text: string, replyTo?: { id: string; text: string; senderName: string }, media?: { type: 'image' | 'document'; url: string; name?: string; size?: number; mimeType?: string }) => Promise<boolean>
  sendMediaMessage: (file: File) => Promise<boolean>
  startDirectChat: (user: ChatUser) => Promise<string | null>
  createGroupChat: (name: string, members: ChatUser[]) => Promise<string | null>
  searchUsers: (term: string) => Promise<ChatUser[]>
  deleteChat: (chatId: string) => Promise<boolean>
  deleteMessage: (messageId: string) => Promise<boolean>
  toggleReaction: (messageId: string, reaction: ReactionType) => Promise<boolean>
  // Group management
  addGroupMembers: (members: ChatUser[]) => Promise<boolean>
  removeGroupMember: (memberId: string) => Promise<boolean>
  leaveGroup: () => Promise<boolean>
  deleteGroup: () => Promise<boolean>
  isGroupCreator: () => boolean
  getChatDisplayName: (chat: Chat) => string
  getChatAvatar: (chat: Chat) => string | undefined
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProviderV2({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth()
  const { currentZone } = useZone()
  
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMessagesLoading, setIsMessagesLoading] = useState(false)
  
  // Build current user object
  const currentUser: ChatUser | null = user && profile ? {
    id: user.uid,
    name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email || 'User',
    avatar: (profile as any).profile_image_url,
    zoneId: currentZone?.id,
    zoneName: currentZone?.name
  } : null
  
  // Subscribe to chats
  useEffect(() => {
    if (!user?.uid) {
      setIsLoading(false)
      setChats([])
      return
    }
    
    setIsLoading(true)
    
    const unsubscribe = subscribeToChats(user.uid, (newChats) => {
      setChats(newChats)
      setIsLoading(false)
    })
    
    return () => unsubscribe()
  }, [user?.uid])
  
  // Keep selectedChat in sync with chats array (for real-time updates)
  useEffect(() => {
    if (selectedChat) {
      const updatedChat = chats.find(c => c.id === selectedChat.id)
      if (updatedChat) {
        // Only update if there are actual changes to avoid infinite loops
        if (JSON.stringify(updatedChat) !== JSON.stringify(selectedChat)) {
          setSelectedChat(updatedChat)
        }
      } else {
        // Chat was deleted, deselect it
        setSelectedChat(null)
      }
    }
  }, [chats, selectedChat])
  
  // Subscribe to messages when chat is selected
  useEffect(() => {
    if (!selectedChat) {
      setMessages([])
      return
    }
    
    setIsMessagesLoading(true)
    
    const unsubscribe = subscribeToMessages(selectedChat.id, (newMessages) => {
      setMessages(newMessages)
      setIsMessagesLoading(false)
    })
    
    return () => unsubscribe()
  }, [selectedChat?.id])
  
  // Actions
  const selectChat = useCallback((chat: Chat | null) => {
    setSelectedChat(chat)
    if (!chat) {
      setMessages([])
    } else if (user?.uid) {
      // Mark chat as read when selected
      markChatAsRead(chat.id, user.uid)
    }
  }, [user?.uid])
  
  const sendMessage = useCallback(async (
    text: string, 
    replyTo?: { id: string; text: string; senderName: string },
    media?: { type: 'image' | 'document'; url: string; name?: string; size?: number; mimeType?: string }
  ) => {
    if (!selectedChat || !currentUser) return false
    return sendChatMessage(selectedChat.id, currentUser, text, replyTo, media)
  }, [selectedChat, currentUser])
  
  // Upload file to Cloudinary and send as message
  const sendMediaMessage = useCallback(async (file: File) => {
    if (!selectedChat || !currentUser) return false
    
    try {
      // Determine if it's an image or document
      const isImage = file.type.startsWith('image/')
      const mediaType = isImage ? 'image' : 'document'
      
      // Upload to Cloudinary
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'loveworld-singers')
      
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dvtjjt3js'
      // Use 'auto' resource type to handle both images and documents
      const resourceType = isImage ? 'image' : 'raw'
      
      
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
        { method: 'POST', body: formData }
      )
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('[ChatContext] Cloudinary upload failed:', errorText)
        throw new Error('Upload failed')
      }
      
      const data = await response.json()
      
      // Send message with media
      return sendChatMessage(
        selectedChat.id,
        currentUser,
        '', // Empty text, will be replaced with emoji
        undefined,
        {
          type: mediaType,
          url: data.secure_url,
          name: file.name,
          size: file.size,
          mimeType: file.type
        }
      )
    } catch (error) {
      console.error('[ChatContext] sendMediaMessage error:', error)
      return false
    }
  }, [selectedChat, currentUser])
  
  const startDirectChat = useCallback(async (otherUser: ChatUser) => {
    if (!currentUser) {
      console.error('[ChatContext] No current user - cannot start chat')
      return null
    }
    const result = await getOrCreateDirectChat(currentUser, otherUser)
    return result
  }, [currentUser])
  
  const createGroupChat = useCallback(async (name: string, members: ChatUser[]) => {
    if (!currentUser) return null
    return createGroup(name, currentUser, members)
  }, [currentUser])
  
  const searchUsers = useCallback(async (term: string) => {
    if (!user?.uid) return []
        const isBoss = profile?.role === 'boss' || user?.email?.toLowerCase().startsWith('boss')
    
    // Get existing chat user IDs (users the current user has already chatted with)
    const existingChatUserIds: string[] = []
    chats.forEach(chat => {
      chat.participants.forEach(participantId => {
        if (participantId !== user.uid && !existingChatUserIds.includes(participantId)) {
          existingChatUserIds.push(participantId)
        }
      })
    })
    
    return searchZoneUsers(term, user.uid, currentZone?.id, isBoss, existingChatUserIds)
  }, [user?.uid, user?.email, profile?.role, currentZone?.id, chats])
  
  const deleteChat = useCallback(async (chatId: string) => {
    if (!user?.uid) return false
    const result = await deleteChatService(chatId, user.uid)
    if (result && selectedChat?.id === chatId) {
      setSelectedChat(null)
    }
    return result
  }, [user?.uid, selectedChat?.id])
  
  const deleteMessage = useCallback(async (messageId: string) => {
    if (!user?.uid) return false
    return deleteMessageService(messageId, user.uid)
  }, [user?.uid])
  
  const toggleReaction = useCallback(async (messageId: string, reaction: ReactionType) => {
    if (!user?.uid) return false
    return toggleReactionService(messageId, user.uid, reaction)
  }, [user?.uid])
  
  // Group management functions
  const addGroupMembers = useCallback(async (members: ChatUser[]) => {
    if (!user?.uid || !selectedChat) return false
    return addGroupMembersService(selectedChat.id, user.uid, members)
  }, [user?.uid, selectedChat])
  
  const removeGroupMember = useCallback(async (memberId: string) => {
    if (!user?.uid || !selectedChat) return false
    return removeGroupMemberService(selectedChat.id, user.uid, memberId)
  }, [user?.uid, selectedChat])
  
  const leaveGroup = useCallback(async () => {
    if (!user?.uid || !selectedChat) return false
    const result = await leaveGroupService(selectedChat.id, user.uid)
    if (result) {
      setSelectedChat(null)
    }
    return result
  }, [user?.uid, selectedChat])
  
  const deleteGroup = useCallback(async () => {
    if (!user?.uid || !selectedChat) return false
    const result = await deleteGroupService(selectedChat.id, user.uid)
    if (result) {
      setSelectedChat(null)
    }
    return result
  }, [user?.uid, selectedChat])
  
  const isGroupCreator = useCallback(() => {
    if (!user?.uid || !selectedChat || selectedChat.type !== 'group') return false
    return selectedChat.createdBy === user.uid
  }, [user?.uid, selectedChat])
  
  const getChatDisplayName = useCallback((chat: Chat) => {
    if (chat.type === 'group') {
      return chat.name || 'Group'
    }
    
    // For direct chats, get the other person's name
    const otherId = chat.participants.find(id => id !== user?.uid)
    if (otherId && chat.participantDetails[otherId]) {
      return chat.participantDetails[otherId].name
    }
    
    return 'Chat'
  }, [user?.uid])
  
  const getChatAvatar = useCallback((chat: Chat) => {
    if (chat.type === 'group') {
      return chat.avatar
    }
    
    const otherId = chat.participants.find(id => id !== user?.uid)
    if (otherId && chat.participantDetails[otherId]) {
      return chat.participantDetails[otherId].avatar
    }
    
    return undefined
  }, [user?.uid])
  
  return (
    <ChatContext.Provider value={{
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
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChatV2() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChatV2 must be used within ChatProviderV2')
  }
  return context
}
