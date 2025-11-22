import { supabase } from './supabase-client'
import type { 
  Conversation, 
  Message, 
  MessageReaction, 
  TypingIndicator, 
  UserOnlineStatus, 
  ChatContact,
  UserProfile 
} from '@/types/supabase'

export class ChatService {
  // Get or create conversation between two users
  static async getOrCreateConversation(user1Id: string, user2Id: string): Promise<Conversation | null> {
    try {
      // Ensure consistent ordering (smaller ID first)
      const [user1, user2] = [user1Id, user2Id].sort()
      
      // Check if conversation already exists
      const { data: existingConversation, error: fetchError } = await supabase
        .from('conversations')
        .select(`
          *,
          user1:profiles!conversations_user1_id_fkey(*),
          user2:profiles!conversations_user2_id_fkey(*)
        `)
        .eq('user1_id', user1)
        .eq('user2_id', user2)
        .single()

      if (existingConversation && !fetchError) {
        return existingConversation
      }

      // Create new conversation
      const { data: newConversation, error: createError } = await supabase
        .from('conversations')
        .insert({
          user1_id: user1,
          user2_id: user2
        })
        .select(`
          *,
          user1:profiles!conversations_user1_id_fkey(*),
          user2:profiles!conversations_user2_id_fkey(*)
        `)
        .single()

      if (createError) {
        console.error('Error creating conversation:', createError)
        return null
      }

      return newConversation
    } catch (error) {
      console.error('Error in getOrCreateConversation:', error)
      return null
    }
  }

  // Get all conversations for a user
  static async getUserConversations(userId: string): Promise<Conversation[]> {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          user1:profiles!conversations_user1_id_fkey(*),
          user2:profiles!conversations_user2_id_fkey(*),
          messages!messages_conversation_id_fkey(
            *,
            sender:profiles!messages_sender_id_fkey(*)
          )
        `)
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Error fetching conversations:', error)
        return []
      }

      // Process conversations to add last message and unread count
      const processedConversations = await Promise.all(
        data.map(async (conversation) => {
          // Get last message
          const lastMessage = conversation.messages?.[0] || null
          
          // Get unread count
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conversation.id)
            .eq('is_read', false)
            .neq('sender_id', userId)

          return {
            ...conversation,
            last_message: lastMessage,
            unread_count: unreadCount || 0
          }
        })
      )

      return processedConversations
    } catch (error) {
      console.error('Error in getUserConversations:', error)
      return []
    }
  }

  // Get messages for a conversation
  static async getConversationMessages(conversationId: string, limit = 50, offset = 0): Promise<Message[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(*),
          reactions:message_reactions(
            *,
            user:profiles!message_reactions_user_id_fkey(*)
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('Error fetching messages:', error)
        return []
      }

      return data.reverse() // Reverse to show oldest first
    } catch (error) {
      console.error('Error in getConversationMessages:', error)
      return []
    }
  }

  // Send a message
  static async sendMessage(
    conversationId: string, 
    senderId: string, 
    content: string, 
    messageType: 'text' | 'image' | 'voice' | 'file' = 'text',
    fileUrl?: string,
    fileName?: string,
    fileSize?: number,
    isDisappearing = false,
    expiresInMinutes = 10
  ): Promise<Message | null> {
    try {
      const messageData: any = {
        conversation_id: conversationId,
        sender_id: senderId,
        content,
        message_type: messageType,
        is_disappearing: isDisappearing
      }

      if (fileUrl) messageData.file_url = fileUrl
      if (fileName) messageData.file_name = fileName
      if (fileSize) messageData.file_size = fileSize
      if (isDisappearing) {
        messageData.expires_at = new Date(Date.now() + expiresInMinutes * 60 * 1000).toISOString()
      }

      const { data, error } = await supabase
        .from('messages')
        .insert(messageData)
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey(*)
        `)
        .single()

      if (error) {
        console.error('Error sending message:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Error in sendMessage:', error)
      return null
    }
  }

  // Mark messages as read
  static async markMessagesAsRead(conversationId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId)
        .eq('is_read', false)

      if (error) {
        console.error('Error marking messages as read:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in markMessagesAsRead:', error)
      return false
    }
  }

  // Get contacts (users from shared groups)
  static async getContacts(userId: string): Promise<ChatContact[]> {
    try {
      console.log('🔍 ChatService.getContacts - userId:', userId)
      
      // Get user's groups
      const { data: userGroups, error: groupsError } = await supabase
        .from('user_groups')
        .select('group_name')
        .eq('user_id', userId)

      console.log('📋 User groups query result:', { userGroups, groupsError })

      if (groupsError) {
        console.error('❌ Error fetching user groups:', groupsError)
        return []
      }

      if (!userGroups?.length) {
        console.log('⚠️ No groups found for user')
        return []
      }

      const groupNames = userGroups.map(g => g.group_name)
      console.log('📝 User group names:', groupNames)

      // Get all users in these groups (excluding current user)
      const { data: groupUsers, error: usersError } = await supabase
        .from('user_groups')
        .select(`
          group_name,
          user:profiles!user_groups_user_id_fkey(*)
        `)
        .in('group_name', groupNames)
        .neq('user_id', userId)

      console.log('👥 Group users query result:', { groupUsers, usersError })

      if (usersError) {
        console.error('❌ Error fetching group users:', usersError)
        return []
      }

      // Group users by user_id and collect their groups
      const userMap = new Map<string, { user: UserProfile; groups: string[] }>()

      groupUsers?.forEach((item: any) => {
        const { group_name, user } = item
        // Handle case where user might be an array (Supabase sometimes returns arrays for foreign keys)
        const userProfile = Array.isArray(user) ? user[0] : user

        if (userProfile && userProfile.id) {
          if (userMap.has(userProfile.id)) {
            userMap.get(userProfile.id)!.groups.push(group_name)
          } else {
            userMap.set(userProfile.id, { user: userProfile, groups: [group_name] })
          }
        }
      })

      // Convert to ChatContact format
      const contacts: ChatContact[] = await Promise.all(
        Array.from(userMap.values()).map(async ({ user, groups }) => {
          // Get online status
          const { data: onlineStatus } = await supabase
            .from('user_online_status')
            .select('is_online, last_seen')
            .eq('user_id', user.id)
            .single()

          // Get last message and unread count
          const conversation = await this.getOrCreateConversation(userId, user.id)
          let lastMessage: Message | undefined = undefined
          let unreadCount = 0

          if (conversation) {
            const messages = await this.getConversationMessages(conversation.id, 1)
            lastMessage = messages[0] || undefined

            const { count } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('conversation_id', conversation.id)
              .eq('is_read', false)
              .neq('sender_id', userId)

            unreadCount = count || 0
          }

          return {
            user,
            shared_groups: groups,
            last_message: lastMessage,
            unread_count: unreadCount,
            is_online: onlineStatus?.is_online || false,
            last_seen: onlineStatus?.last_seen
          }
        })
      )

      // Sort by last message time or online status
      return contacts.sort((a, b) => {
        if (a.is_online && !b.is_online) return -1
        if (!a.is_online && b.is_online) return 1
        if (a.last_message && b.last_message) {
          return new Date(b.last_message.created_at).getTime() - new Date(a.last_message.created_at).getTime()
        }
        if (a.last_message) return -1
        if (b.last_message) return 1
        return (a.user.first_name || '').localeCompare(b.user.first_name || '')
      })
    } catch (error) {
      console.error('Error in getContacts:', error)
      return []
    }
  }

  // Update online status
  static async updateOnlineStatus(userId: string, isOnline: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_online_status')
        .upsert({
          user_id: userId,
          is_online: isOnline,
          last_seen: new Date().toISOString()
        })

      if (error) {
        console.error('Error updating online status:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in updateOnlineStatus:', error)
      return false
    }
  }

  // Set typing indicator
  static async setTypingIndicator(conversationId: string, userId: string, isTyping: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('typing_indicators')
        .upsert({
          conversation_id: conversationId,
          user_id: userId,
          is_typing: isTyping
        })

      if (error) {
        console.error('Error setting typing indicator:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in setTypingIndicator:', error)
      return false
    }
  }

  // Get typing indicators for a conversation
  static async getTypingIndicators(conversationId: string, excludeUserId?: string): Promise<TypingIndicator[]> {
    try {
      let query = supabase
        .from('typing_indicators')
        .select(`
          *,
          user:profiles!typing_indicators_user_id_fkey(*)
        `)
        .eq('conversation_id', conversationId)
        .eq('is_typing', true)

      if (excludeUserId) {
        query = query.neq('user_id', excludeUserId)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching typing indicators:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getTypingIndicators:', error)
      return []
    }
  }

  // Add message reaction
  static async addMessageReaction(messageId: string, userId: string, reactionType: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('message_reactions')
        .upsert({
          message_id: messageId,
          user_id: userId,
          reaction_type: reactionType
        })

      if (error) {
        console.error('Error adding message reaction:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in addMessageReaction:', error)
      return false
    }
  }

  // Remove message reaction
  static async removeMessageReaction(messageId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('message_reactions')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', userId)

      if (error) {
        console.error('Error removing message reaction:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error in removeMessageReaction:', error)
      return false
    }
  }

  // Subscribe to conversation messages
  static subscribeToMessages(conversationId: string, callback: (message: Message) => void) {
    return supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          // Fetch the full message with sender info
          const { data: message } = await supabase
            .from('messages')
            .select(`
              *,
              sender:profiles!messages_sender_id_fkey(*)
            `)
            .eq('id', payload.new.id)
            .single()

          if (message) {
            callback(message)
          }
        }
      )
      .subscribe()
  }

  // Subscribe to typing indicators
  static subscribeToTypingIndicators(conversationId: string, callback: (indicators: TypingIndicator[]) => void) {
    return supabase
      .channel(`typing:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_indicators',
          filter: `conversation_id=eq.${conversationId}`
        },
        async () => {
          const indicators = await this.getTypingIndicators(conversationId)
          callback(indicators)
        }
      )
      .subscribe()
  }

  // Subscribe to online status changes
  static subscribeToOnlineStatus(userIds: string[], callback: (statuses: UserOnlineStatus[]) => void) {
    return supabase
      .channel('online_status')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_online_status',
          filter: `user_id=in.(${userIds.join(',')})`
        },
        async () => {
          const { data: statuses } = await supabase
            .from('user_online_status')
            .select('*')
            .in('user_id', userIds)

          if (statuses) {
            callback(statuses)
          }
        }
      )
      .subscribe()
  }
}
