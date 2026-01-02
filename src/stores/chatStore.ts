/**
 * Chat Store - The "Bank" for Chat Data
 * 
 * Stores all chat-related data in Zustand for instant access
 * Just like authStore and zoneStore ho
 */


import { create } from 'zustand'
import { FirebaseChatService, Chat, ChatMessage } from '@/app/pages/groups/_lib/firebase-chat-service'

interface ChatState {
  // Data (the "bank")
  chats: Chat[]
  selectedChat: Chat | null
  messages: ChatMessage[]
  
  // Loading states
  isChatsLoading: boolean
  isMessagesLoading: boolean
  
  // Actions
  setChats: (chats: Chat[]) => void
  setSelectedChat: (chat: Chat | null) => void
  setMessages: (messages: ChatMessage[]) => void
  setIsChatsLoading: (loading: boolean) => void
  setIsMessagesLoading: (loading: boolean) => void
  
  // Firebase subscriptions
  subscribeToChats: (userId: string) => () => void
  subscribeToMessages: (chatId: string) => () => void
  
  // Clear on logout
  clearChatData: () => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  // Initial state
  chats: [],
  selectedChat: null,
  messages: [],
  isChatsLoading: false,
  isMessagesLoading: false,
  
  // Setters
  setChats: (chats) => set({ chats }),
  setSelectedChat: (chat) => set({ selectedChat: chat }),
  setMessages: (messages) => set({ messages }),
  setIsChatsLoading: (loading) => set({ isChatsLoading: loading }),
  setIsMessagesLoading: (loading) => set({ isMessagesLoading: loading }),
  
  // Subscribe to chats from Firebase
  subscribeToChats: (userId: string) => {
    set({ isChatsLoading: true })
    
    // Quick timeout to prevent long loading
    const timeout = setTimeout(() => {
      set({ isChatsLoading: false })
    }, 300)
    
    const unsubscribe = FirebaseChatService.subscribeToChats(userId, (freshChats) => {
      clearTimeout(timeout)
      
      // CRITICAL: Filter out self-chats more aggressively
      const filteredChats = freshChats.filter(chat => {
        if (chat.type === 'direct') {
          // Must have exactly 2 participants
          if (chat.participants.length !== 2) {
            console.log('🚫 Filtering out chat with wrong participant count:', chat.participants.length)
            return false
          }
          
          // Must not be a self-chat (both participants are the same)
          const uniqueParticipants = new Set(chat.participants)
          if (uniqueParticipants.size < 2) {
            console.log('🚫 Filtering out self-chat:', chat.participants)
            return false
          }
          
          // Must include current user
          if (!chat.participants.includes(userId)) {
            console.log('🚫 Filtering out chat without current user')
            return false
          }
          
          return true
        }
        return true
      })
      
      console.log(`✅ Filtered ${freshChats.length} → ${filteredChats.length} chats (removed ${freshChats.length - filteredChats.length} invalid)`)
      
      // Store in the "bank"
      set({ 
        chats: filteredChats,
        isChatsLoading: false 
      })
    })
    
    return () => {
      clearTimeout(timeout)
      unsubscribe()
    }
  },
  
  // Subscribe to messages from Firebase
  subscribeToMessages: (chatId: string) => {
    set({ isMessagesLoading: true })
    
    const timeout = setTimeout(() => {
      set({ isMessagesLoading: false })
    }, 3000)
    
    const unsubscribe = FirebaseChatService.subscribeToMessages(chatId, (messages) => {
      clearTimeout(timeout)
      
      // Store in the "bank"
      set({ 
        messages,
        isMessagesLoading: false 
      })
    })
    
    return () => {
      clearTimeout(timeout)
      unsubscribe()
    }
  },
  
  // Clear all chat data (on logout)
  clearChatData: () => {
    set({
      chats: [],
      selectedChat: null,
      messages: [],
      isChatsLoading: false,
      isMessagesLoading: false
    })
  }
}))
