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
  markChatAsRead,
  renameGroup as renameGroupService,
  updateGroupDescription as updateGroupDescriptionService,
  updateChatAvatar as updateChatAvatarService,
  toggleGroupAdmin as toggleGroupAdminService,
  togglePinChat as togglePinChatService,
  clearChat as clearChatService,
  editMessage as editMessageService,
  forwardMessage as forwardMessageService,
  setTypingStatus as setTypingStatusService,
  subscribeToTyping
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
  sendVoiceMessage: (file: File, duration: number) => Promise<boolean>
  startDirectChat: (user: ChatUser) => Promise<string | null>
  createGroupChat: (name: string, members: ChatUser[]) => Promise<string | null>
  searchUsers: (term: string) => Promise<ChatUser[]>
  deleteChat: (chatId: string) => Promise<boolean>
  deleteMessage: (messageId: string, forEveryone?: boolean) => Promise<boolean>
  toggleReaction: (messageId: string, reaction: ReactionType) => Promise<boolean>
  // Group management
  addGroupMembers: (members: ChatUser[]) => Promise<boolean>
  removeGroupMember: (memberId: string) => Promise<boolean>
  leaveGroup: () => Promise<boolean>
  deleteGroup: () => Promise<boolean>
  renameGroup: (newName: string) => Promise<boolean>
  updateGroupDescription: (description: string) => Promise<boolean>
  updateChatAvatar: (avatarUrl: string) => Promise<boolean>
  toggleGroupAdmin: (targetUserId: string, status: boolean) => Promise<boolean>
  togglePinChat: (pinned: boolean) => Promise<boolean>
  clearChat: () => Promise<boolean>
  editMessage: (messageId: string, newText: string) => Promise<boolean>
  forwardMessage: (targetChatId: string, originalMessage: Message) => Promise<boolean>
  setTypingStatus: (status: 'typing' | 'recording_voice' | null) => Promise<void>
  isGroupCreator: () => boolean
  isGroupAdmin: (userId?: string) => boolean
  getChatDisplayName: (chat: Chat) => string
  getChatAvatar: (chat: Chat) => string | undefined
  typingUsers: { userName: string, status: string }[]
  allTypingUsers: { [chatId: string]: { userName: string, status: string }[] }
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProviderV2({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth()
  const { currentZone } = useZone()

  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [typingUsers, setTypingUsers] = useState<{ userName: string, status: string }[]>([])
  const [allTypingUsers, setAllTypingUsers] = useState<{ [chatId: string]: { userName: string, status: string }[] }>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isMessagesLoading, setIsMessagesLoading] = useState(false)

  // Build current user object
  const currentUser: ChatUser | null = user && profile ? {
    id: user.uid,
    name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email || 'User',
    avatar: profile.profile_image_url || profile.avatar_url || (profile as any).photoURL,
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
    if (!selectedChat?.id) {
      setMessages([])
      return
    }

    setIsMessagesLoading(true)

    // Mark as read when opening
    if (user?.uid && selectedChat) {
      markChatAsRead(selectedChat.id, user.uid)
    }

    const unsubscribe = subscribeToMessages(selectedChat.id, (newMessages) => {
      setMessages(newMessages)
      setIsMessagesLoading(false)
    })

    const unsubscribeTyping = subscribeToTyping(selectedChat.id, user?.uid || '', (users) => {
      setTypingUsers(users)
    })

    return () => {
      unsubscribe()
      unsubscribeTyping()
    }
  }, [selectedChat?.id, user?.uid])

  // Global typing subscription for sidebar
  useEffect(() => {
    if (!user?.uid || chats.length === 0) return

    const unsubscribes = chats.map(chat => {
      return subscribeToTyping(chat.id, user.uid, (users) => {
        setAllTypingUsers(prev => ({
          ...prev,
          [chat.id]: users
        }))
      })
    })

    return () => unsubscribes.forEach(unsub => unsub())
  }, [user?.uid, chats.length]) // Only rebinding if user or chat count changes

  // Actions
  const selectChat = useCallback((chat: Chat | null) => {
    setSelectedChat(chat)
    if (!chat) {
      setMessages([])
    }
  }, [])

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

  // Upload voice note to Cloudinary and send as message
  const sendVoiceMessage = useCallback(async (file: File, duration: number) => {
    if (!selectedChat || !currentUser) return false

    try {
      // Upload to Cloudinary
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'loveworld-singers')

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dvtjjt3js'

      // Voice notes should be uploaded as 'video' resource type to get duration if needed, 
      // but 'raw' or 'auto' also works. Cloudinary treats audio as 'video'.
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
        { method: 'POST', body: formData }
      )

      if (!response.ok) {
        throw new Error('Voice upload failed')
      }

      const data = await response.json()

      return sendChatMessage(
        selectedChat.id,
        currentUser,
        '',
        undefined,
        {
          type: 'voice',
          url: data.secure_url,
          duration: duration // Our app-side measured duration
        } as any
      )
    } catch (error) {
      console.error('[ChatContext] sendVoiceMessage error:', error)
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

  const deleteMessage = useCallback(async (messageId: string, forEveryone: boolean = false) => {
    if (!user?.uid) return false
    return deleteMessageService(messageId, user.uid, forEveryone)
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

  const renameGroup = useCallback(async (newName: string) => {
    if (!selectedChat || !user) return false
    return await renameGroupService(selectedChat.id, user.uid, newName)
  }, [selectedChat, user])

  const setTypingStatus = useCallback(async (status: 'typing' | 'recording_voice' | null) => {
    if (!selectedChat || !user || !currentUser) return
    await setTypingStatusService(selectedChat.id, user.uid, currentUser.name, status)
  }, [selectedChat, user, currentUser])

  const isGroupCreator = useCallback(() => {
    if (!user?.uid || !selectedChat || selectedChat.type !== 'group') return false
    return selectedChat.createdBy === user.uid
  }, [user?.uid, selectedChat])

  const isGroupAdmin = useCallback((userId?: string) => {
    const idToCheck = userId || user?.uid
    if (!idToCheck || !selectedChat || selectedChat.type !== 'group') return false
    return selectedChat.createdBy === idToCheck || (selectedChat.admins || []).includes(idToCheck)
  }, [user?.uid, selectedChat])

  const updateGroupDescription = useCallback(async (description: string) => {
    if (!selectedChat || !user) return false
    return await updateGroupDescriptionService(selectedChat.id, user.uid, description)
  }, [selectedChat, user])

  const updateChatAvatar = useCallback(async (avatarUrl: string) => {
    if (!selectedChat || !user) return false
    return await updateChatAvatarService(selectedChat.id, user.uid, avatarUrl)
  }, [selectedChat, user])

  const toggleGroupAdmin = useCallback(async (targetUserId: string, status: boolean) => {
    if (!selectedChat || !user) return false
    return await toggleGroupAdminService(selectedChat.id, user.uid, targetUserId, status)
  }, [selectedChat, user])

  const togglePinChat = useCallback(async (pinned: boolean) => {
    if (!selectedChat || !user) return false
    return await togglePinChatService(selectedChat.id, user.uid, pinned)
  }, [selectedChat, user])

  const clearChat = useCallback(async () => {
    if (!selectedChat || !user) return false
    return await clearChatService(selectedChat.id, user.uid)
  }, [selectedChat, user])

  const editMessage = useCallback(async (messageId: string, newText: string) => {
    if (!user) return false
    return await editMessageService(messageId, user.uid, newText)
  }, [user])

  const forwardMessage = useCallback(async (targetChatId: string, originalMessage: Message) => {
    if (!user || !currentUser) return false
    return await forwardMessageService(targetChatId, currentUser, originalMessage)
  }, [user, currentUser])

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
      typingUsers,
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
      updateGroupDescription,
      updateChatAvatar,
      toggleGroupAdmin,
      togglePinChat,
      clearChat,
      editMessage,
      forwardMessage,
      setTypingStatus,
      isGroupCreator,
      isGroupAdmin,
      getChatDisplayName,
      getChatAvatar,
      allTypingUsers
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
