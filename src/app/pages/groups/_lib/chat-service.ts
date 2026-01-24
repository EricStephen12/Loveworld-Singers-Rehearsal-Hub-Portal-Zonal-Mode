/**
 * CLEAN CHAT SERVICE
 * Fresh Firebase real-time chat implementation
 * Collections: chats_v2, messages_v2
 */

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  getDocs, 
  getDoc,
  serverTimestamp,
  increment
} from 'firebase/firestore'
import { db } from '@/lib/firebase-setup'

// ============================================
// TYPES
// ============================================

export interface ChatUser {
  id: string
  name: string
  avatar?: string
  zoneId?: string
  zoneName?: string
}

// Reaction types
export type ReactionType = '❤️' | '👍' | '😂' | '😮' | '😢' | '🙏' | '🔥' | '👏' | '💯' | '🎉'

// Message types
export type MessageType = 'text' | 'image' | 'document' | 'system'

export interface MessageAttachment {
  url: string
  name: string
  size?: number
  mimeType?: string
}

export interface Message {
  id: string
  chatId: string
  senderId: string
  senderName: string
  senderAvatar?: string
  text: string
  timestamp: Date
  type: MessageType
  imageUrl?: string
  attachment?: MessageAttachment
  replyTo?: {
    id: string
    text: string
    senderName: string
  }
  reactions?: { [userId: string]: ReactionType }
  edited?: boolean
  deleted?: boolean
}

export interface Chat {
  id: string
  type: 'direct' | 'group'
  name?: string
  avatar?: string
  participants: string[]
  participantDetails: { [userId: string]: { name: string; avatar?: string } }
  createdBy: string
  createdAt: Date
  lastMessage?: {
    text: string
    senderId: string
    timestamp: Date
  }
  unreadCount: { [userId: string]: number }
}

// ============================================
// COLLECTIONS (v2 - fresh start)
// ============================================

const CHATS_COLLECTION = 'chats_v2'
const MESSAGES_COLLECTION = 'messages_v2'

// ============================================
// USER HELPERS
// ============================================

/**
 * Get user info from zone_members or profiles
 */
export async function getUserInfo(userId: string): Promise<ChatUser | null> {
  try {
    // Try zone_members first
    const zoneMembersRef = collection(db, 'zone_members')
    const q = query(zoneMembersRef, where('userId', '==', userId), limit(1))
    const snapshot = await getDocs(q)
    
    if (!snapshot.empty) {
      const data = snapshot.docs[0].data()
      return {
        id: userId,
        name: data.userName || 'Unknown',
        zoneId: data.zoneId,
        zoneName: data.zoneName
      }
    }
    
    // Fallback to profiles
    const profileDoc = await getDoc(doc(db, 'profiles', userId))
    if (profileDoc.exists()) {
      const data = profileDoc.data()
      return {
        id: userId,
        name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'Unknown',
        avatar: data.profile_image_url
      }
    }
    
    return null
  } catch (error) {
    console.error('[ChatService] getUserInfo error:', error)
    return null
  }
}

// Protected senior zones - members only visible to their own zone or boss users
// These zone IDs should match exactly what's in the database
// Also check for common variations and role-based names
const SENIOR_ZONES = ['zone-president', 'zone-director', 'zone-oftp']

// Also check for role/title in user name to catch senior members regardless of zone ID
const SENIOR_TITLES = ['president', 'director', 'oftp']

/**
 * Check if a user is a senior/protected member based on zone ID or name/role
 */
function isSeniorMember(zoneId: string, groupId: string, userName: string): boolean {
  const lowerZoneId = (zoneId || '').toLowerCase()
  const lowerGroupId = (groupId || '').toLowerCase()
  const lowerName = (userName || '').toLowerCase()
  
    if (SENIOR_ZONES.includes(zoneId) || SENIOR_ZONES.includes(groupId)) {
    return true
  }
  
    for (const title of SENIOR_TITLES) {
    if (lowerZoneId.includes(title) || lowerGroupId.includes(title)) {
      return true
    }
  }
  
    // Only match if it's clearly a title, not just part of a name
  if (lowerName.includes('the president') || 
      lowerName.includes('zone president') ||
      lowerName.includes('zone director') ||
      lowerName.includes('the director') ||
      lowerName.includes('zone oftp') ||
      lowerName === 'president' ||
      lowerName === 'director' ||
      lowerName === 'oftp') {
    return true
  }
  
  return false
}

/**
 * Search users across ALL zones with protected zone filtering
 * - Searches all zones (cross-zone search) from BOTH zone_members AND hq_members
 * - Deduplicates users by userId
 * - Hides senior zone members UNLESS user is in senior zone, is boss, or has existing chat
 */
export async function searchZoneUsers(
  searchTerm: string, 
  currentUserId: string, 
  currentUserZoneId?: string,
  isBoss: boolean = false,
  existingChatUserIds: string[] = [] // Users the current user has already chatted with
): Promise<ChatUser[]> {
  try {
    const users: ChatUser[] = []
    const seenIds = new Set<string>()
    
        // First check by zone ID, then we'll also check by user's own name/role
    const isInSeniorZone = currentUserZoneId ? 
      (SENIOR_ZONES.includes(currentUserZoneId) || 
       SENIOR_TITLES.some(title => currentUserZoneId.toLowerCase().includes(title))) : false
    
    // Convert existing chat user IDs to a Set for fast lookup
    const existingChatUsers = new Set(existingChatUserIds)
    
    
    // Get ALL zone members
    const zoneMembersRef = collection(db, 'zone_members')
    const zoneMembersSnapshot = await getDocs(zoneMembersRef)
    
    // Get ALL HQ members
    const hqMembersRef = collection(db, 'hq_members')
    const hqMembersSnapshot = await getDocs(hqMembersRef)
    
    // Process zone_members
    zoneMembersSnapshot.forEach(docSnap => {
      const data = docSnap.data()
      if (data.userId === currentUserId) return
      if (seenIds.has(data.userId)) return
      
      const memberZoneId = data.zoneId || ''
      const memberGroupId = data.groupId || ''
      const name = (data.userName || '').trim()
      
      // Use the new helper function to check if this is a senior member
      const isInProtectedZone = isSeniorMember(memberZoneId, memberGroupId, name)
      const hasExistingChat = existingChatUsers.has(data.userId)
      
      // Log senior members for debugging
      if (isInProtectedZone) {
      }
      
      // Hide protected zone members from regular users
      if (isInProtectedZone && !isInSeniorZone && !isBoss && !hasExistingChat) {
        return
      }
      
      const matchesSearch = !searchTerm || 
        name.toLowerCase().includes(searchTerm.toLowerCase())
      
      if (matchesSearch && name) {
        seenIds.add(data.userId)
        users.push({
          id: data.userId,
          name: name,
          zoneId: data.zoneId,
          zoneName: data.zoneName
        })
      }
    })
    
    // Process hq_members
    hqMembersSnapshot.forEach(docSnap => {
      const data = docSnap.data()
      if (data.userId === currentUserId) return
      if (seenIds.has(data.userId)) return
      
      const memberZoneId = data.zoneId || ''
      const memberGroupId = data.groupId || ''
      const name = (data.userName || '').trim()
      
      // Use the new helper function to check if this is a senior member
      const isInProtectedZone = isSeniorMember(memberZoneId, memberGroupId, name)
      const hasExistingChat = existingChatUsers.has(data.userId)
      
      // Log senior members for debugging
      if (isInProtectedZone) {
      }
      
      // Hide protected zone members from regular users
      if (isInProtectedZone && !isInSeniorZone && !isBoss && !hasExistingChat) {
        return
      }
      
      const matchesSearch = !searchTerm || 
        name.toLowerCase().includes(searchTerm.toLowerCase())
      
      if (matchesSearch && name) {
        seenIds.add(data.userId)
        users.push({
          id: data.userId,
          name: name,
          zoneId: memberGroupId || memberZoneId,
          zoneName: data.groupName || data.zoneName
        })
      }
    })
    
    
    // Sort alphabetically
    users.sort((a, b) => a.name.localeCompare(b.name))
    
    return users.slice(0, 100) // Limit to 100 results
  } catch (error) {
    console.error('[ChatService] searchZoneUsers error:', error)
    return []
  }
}

// ============================================
// CHAT OPERATIONS
// ============================================

/**
 * Find existing direct chat between two users
 */
export async function findDirectChat(user1Id: string, user2Id: string): Promise<Chat | null> {
  try {
    const chatsRef = collection(db, CHATS_COLLECTION)
    const q = query(
      chatsRef,
      where('type', '==', 'direct'),
      where('participants', 'array-contains', user1Id)
    )
    
    const snapshot = await getDocs(q)
    
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data()
      if (data.participants.includes(user2Id) && data.participants.length === 2) {
        return docToChat(docSnap)
      }
    }
    
    return null
  } catch (error) {
    console.error('[ChatService] findDirectChat error:', error)
    return null
  }
}

/**
 * Create or get direct chat
 */
export async function getOrCreateDirectChat(
  currentUser: ChatUser,
  otherUser: ChatUser
): Promise<string | null> {
  try {
    
    // Prevent self-chat
    if (currentUser.id === otherUser.id) {
      console.error('[ChatService] Cannot create self-chat')
      return null
    }
    
    // Check for existing chat
    const existing = await findDirectChat(currentUser.id, otherUser.id)
    if (existing) {
      return existing.id
    }
    
    
    // Create new chat - filter out undefined values
    const chatData: any = {
      type: 'direct',
      participants: [currentUser.id, otherUser.id],
      participantDetails: {
        [currentUser.id]: { name: currentUser.name },
        [otherUser.id]: { name: otherUser.name }
      },
      createdBy: currentUser.id,
      createdAt: serverTimestamp(),
      unreadCount: {
        [currentUser.id]: 0,
        [otherUser.id]: 0
      }
    }
    
    // Only add avatar if it exists (Firestore doesn't allow undefined)
    if (currentUser.avatar) {
      chatData.participantDetails[currentUser.id].avatar = currentUser.avatar
    }
    if (otherUser.avatar) {
      chatData.participantDetails[otherUser.id].avatar = otherUser.avatar
    }
    
    const docRef = await addDoc(collection(db, CHATS_COLLECTION), chatData)
    return docRef.id
  } catch (error) {
    console.error('[ChatService] getOrCreateDirectChat error:', error)
    return null
  }
}

/**
 * Create group chat
 */
export async function createGroupChat(
  name: string,
  creator: ChatUser,
  members: ChatUser[]
): Promise<string | null> {
  try {
    const allMembers = [creator, ...members.filter(m => m.id !== creator.id)]
    
    const participantDetails: { [key: string]: { name: string; avatar?: string } } = {}
    const unreadCount: { [key: string]: number } = {}
    
    allMembers.forEach(m => {
      // Only include avatar if it's defined (Firestore doesn't allow undefined values)
      participantDetails[m.id] = m.avatar 
        ? { name: m.name, avatar: m.avatar }
        : { name: m.name }
      unreadCount[m.id] = 0
    })
    
    const chatData = {
      type: 'group',
      name,
      participants: allMembers.map(m => m.id),
      participantDetails,
      createdBy: creator.id,
      createdAt: serverTimestamp(),
      unreadCount
    }
    
    const docRef = await addDoc(collection(db, CHATS_COLLECTION), chatData)
    
    // Add system message
    await addDoc(collection(db, MESSAGES_COLLECTION), {
      chatId: docRef.id,
      senderId: 'system',
      senderName: 'System',
      text: `${creator.name} created the group "${name}"`,
      type: 'system',
      timestamp: serverTimestamp()
    })
    
    return docRef.id
  } catch (error) {
    console.error('[ChatService] createGroupChat error:', error)
    return null
  }
}

/**
 * Subscribe to user's chats
 */
export function subscribeToChats(
  userId: string,
  callback: (chats: Chat[]) => void
): () => void {
  const chatsRef = collection(db, CHATS_COLLECTION)
  const q = query(
    chatsRef,
    where('participants', 'array-contains', userId)
  )
  
  return onSnapshot(q, (snapshot) => {
    const chats: Chat[] = []
    
    snapshot.forEach(docSnap => {
      const chat = docToChat(docSnap)
      
      // Validate direct chats
      if (chat.type === 'direct') {
        if (chat.participants.length !== 2) return
        if (chat.participants[0] === chat.participants[1]) return
      }
      
      chats.push(chat)
    })
    
    // Sort by last message time
    chats.sort((a, b) => {
      const aTime = a.lastMessage?.timestamp || a.createdAt
      const bTime = b.lastMessage?.timestamp || b.createdAt
      return new Date(bTime).getTime() - new Date(aTime).getTime()
    })
    
    callback(chats)
  }, (error) => {
    console.error('[ChatService] subscribeToChats error:', error)
    callback([])
  })
}

/**
 * Delete chat
 */
export async function deleteChat(chatId: string, userId: string): Promise<boolean> {
  try {
    // Verify user is participant
    const chatDoc = await getDoc(doc(db, CHATS_COLLECTION, chatId))
    if (!chatDoc.exists()) return false
    
    const chat = chatDoc.data()
    if (!chat.participants.includes(userId)) return false
    
    // For direct chats, just delete
    // For groups, only creator can delete
    if (chat.type === 'group' && chat.createdBy !== userId) {
      return false
    }
    
    await deleteDoc(doc(db, CHATS_COLLECTION, chatId))
    return true
  } catch (error) {
    console.error('[ChatService] deleteChat error:', error)
    return false
  }
}

// ============================================
// MESSAGE OPERATIONS
// ============================================

/**
 * Send a call system message to chat
 */
export async function sendCallMessage(
  chatId: string,
  callType: 'missed' | 'answered' | 'declined',
  callerName: string,
  duration?: number // in seconds
): Promise<boolean> {
  try {
    
    let text = ''
    if (callType === 'missed') {
      text = `📞 Missed call from ${callerName}`
    } else if (callType === 'declined') {
      text = `📞 Call declined`
    } else if (callType === 'answered') {
      const durationStr = duration ? formatCallDuration(duration) : '0:00'
      text = `📞 Voice call • ${durationStr}`
    }

    const messageData = {
      chatId,
      senderId: 'system',
      senderName: 'System',
      text,
      type: 'system',
      timestamp: serverTimestamp()
    }

    const docRef = await addDoc(collection(db, MESSAGES_COLLECTION), messageData)

    // Get chat to update unread counts for participants (for missed/declined calls)
    const chatDoc = await getDoc(doc(db, CHATS_COLLECTION, chatId))
    if (chatDoc.exists()) {
      const chatData = chatDoc.data()
      const participants = chatData.participants || []
      
      // For missed calls, increment unread for all participants
      // For answered calls, don't increment (both parties were on the call)
      const unreadUpdates: { [key: string]: any } = {}
      if (callType === 'missed' || callType === 'declined') {
        participants.forEach((participantId: string) => {
          unreadUpdates[`unreadCount.${participantId}`] = increment(1)
        })
      }
      
            await updateDoc(doc(db, CHATS_COLLECTION, chatId), {
        lastMessage: {
          text,
          senderId: 'system',
          timestamp: serverTimestamp()
        },
        ...unreadUpdates
      })
    } else {
      // Fallback: just update last message
      await updateDoc(doc(db, CHATS_COLLECTION, chatId), {
        lastMessage: {
          text,
          senderId: 'system',
          timestamp: serverTimestamp()
        }
      })
    }

    return true
  } catch (error) {
    console.error('[ChatService] sendCallMessage error:', error)
    return false
  }
}

// Helper to format call duration
function formatCallDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Mark chat as read for a user (reset unread count to 0)
 */
export async function markChatAsRead(chatId: string, userId: string): Promise<boolean> {
  try {
    await updateDoc(doc(db, CHATS_COLLECTION, chatId), {
      [`unreadCount.${userId}`]: 0
    })
    return true
  } catch (error) {
    console.error('[ChatService] markChatAsRead error:', error)
    return false
  }
}

/**
 * Send message
 */
export async function sendMessage(
  chatId: string,
  sender: ChatUser,
  text: string,
  replyTo?: { id: string; text: string; senderName: string },
  media?: { type: 'image' | 'document'; url: string; name?: string; size?: number; mimeType?: string }
): Promise<boolean> {
  try {
    const messageData: any = {
      chatId,
      senderId: sender.id,
      senderName: sender.name,
      text: text || (media?.type === 'image' ? '📷 Image' : '📄 Document'),
      type: media?.type || 'text',
      timestamp: serverTimestamp()
    }
    
    if (sender.avatar) {
      messageData.senderAvatar = sender.avatar
    }
    
    if (replyTo) {
      messageData.replyTo = replyTo
    }
    
    // Add media data
    if (media) {
      if (media.type === 'image') {
        messageData.imageUrl = media.url
      } else if (media.type === 'document') {
        messageData.attachment = {
          url: media.url,
          name: media.name || 'Document',
          size: media.size,
          mimeType: media.mimeType
        }
      }
    }
    
    await addDoc(collection(db, MESSAGES_COLLECTION), messageData)
    
    // Get chat to update unread counts for other participants
    const chatDoc = await getDoc(doc(db, CHATS_COLLECTION, chatId))
    if (chatDoc.exists()) {
      const chatData = chatDoc.data()
      const participants = chatData.participants || []
      
      // Use atomic increment for unread counts - prevents race conditions
      const unreadUpdates: { [key: string]: any } = {}
      participants.forEach((participantId: string) => {
        if (participantId !== sender.id) {
          unreadUpdates[`unreadCount.${participantId}`] = increment(1)
        }
      })
      
            const lastMessageText = media?.type === 'image' ? '📷 Image' : media?.type === 'document' ? '📄 Document' : text.slice(0, 100)
      await updateDoc(doc(db, CHATS_COLLECTION, chatId), {
        lastMessage: {
          text: lastMessageText,
          senderId: sender.id,
          timestamp: serverTimestamp()
        },
        ...unreadUpdates
      })
      
      // Send push notification to other participants
      const otherParticipants = participants.filter((id: string) => id !== sender.id)
      if (otherParticipants.length > 0) {
        const isGroup = chatData.type === 'group'
        const chatName = isGroup ? chatData.name : sender.name
        const notifTitle = chatName || sender.name || 'New Message'
        const notifBody = isGroup 
          ? `${sender.name || 'Someone'}: ${lastMessageText}`
          : lastMessageText
        
        // Fire and forget - don't block message sending
        sendChatNotification(otherParticipants, notifTitle, notifBody, chatId, sender.id, sender.name).catch(err => {
        })
      }
    } else {
      // Fallback: just update last message if chat doc not found
      const lastMessageText = media?.type === 'image' ? '📷 Image' : media?.type === 'document' ? '📄 Document' : text.slice(0, 100)
      await updateDoc(doc(db, CHATS_COLLECTION, chatId), {
        lastMessage: {
          text: lastMessageText,
          senderId: sender.id,
          timestamp: serverTimestamp()
        }
      })
    }
    
    return true
  } catch (error) {
    console.error('[ChatService] sendMessage error:', error)
    return false
  }
}

/**
 * Send push notification for chat message
 */
async function sendChatNotification(
  recipientIds: string[],
  title: string,
  body: string,
  chatId: string,
  senderId: string,
  senderName?: string
): Promise<void> {
  try {
    await fetch('/api/send-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'chat',
        recipientIds,
        title,
        body,
        data: { 
          chatId,
          senderName: senderName || 'Someone'
        },
        excludeUserId: senderId
      })
    })
  } catch (error) {
    console.error('[ChatService] sendChatNotification error:', error)
  }
}

/**
 * Subscribe to messages for a chat
 */
export function subscribeToMessages(
  chatId: string,
  callback: (messages: Message[]) => void
): () => void {
  const messagesRef = collection(db, MESSAGES_COLLECTION)
  const q = query(
    messagesRef,
    where('chatId', '==', chatId),
    orderBy('timestamp', 'asc'),
    limit(100)
  )
  
  return onSnapshot(q, (snapshot) => {
    const messages: Message[] = []
    
    snapshot.forEach(docSnap => {
      messages.push(docToMessage(docSnap))
    })
    
    callback(messages)
  }, (error) => {
    console.error('[ChatService] subscribeToMessages error:', error)
    // If index error, try without orderBy
    if (error.message?.includes('index')) {
      const fallbackQ = query(
        messagesRef,
        where('chatId', '==', chatId),
        limit(100)
      )
      
      return onSnapshot(fallbackQ, (snapshot) => {
        const messages: Message[] = []
        snapshot.forEach(docSnap => {
          messages.push(docToMessage(docSnap))
        })
        // Sort client-side
        messages.sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )
        callback(messages)
      })
    }
    callback([])
  })
}

/**
 * Delete message (soft delete)
 */
export async function deleteMessage(messageId: string, userId: string): Promise<boolean> {
  try {
    const messageDoc = await getDoc(doc(db, MESSAGES_COLLECTION, messageId))
    if (!messageDoc.exists()) return false
    
    const message = messageDoc.data()
    if (message.senderId !== userId) return false
    
    await updateDoc(doc(db, MESSAGES_COLLECTION, messageId), {
      text: 'This message was deleted',
      deleted: true
    })
    
    return true
  } catch (error) {
    console.error('[ChatService] deleteMessage error:', error)
    return false
  }
}

/**
 * Add or remove reaction to a message
 */
export async function toggleReaction(
  messageId: string, 
  userId: string, 
  reaction: ReactionType
): Promise<boolean> {
  try {
    const messageDoc = await getDoc(doc(db, MESSAGES_COLLECTION, messageId))
    if (!messageDoc.exists()) return false
    
    const message = messageDoc.data()
    const currentReactions = message.reactions || {}
    
    // Toggle: if same reaction exists, remove it; otherwise add/change it
    if (currentReactions[userId] === reaction) {
      // Remove reaction
      delete currentReactions[userId]
    } else {
      // Add or change reaction
      currentReactions[userId] = reaction
    }
    
    await updateDoc(doc(db, MESSAGES_COLLECTION, messageId), {
      reactions: currentReactions
    })
    
    return true
  } catch (error) {
    console.error('[ChatService] toggleReaction error:', error)
    return false
  }
}

/**
 * Add members to a group (creator/admin only)
 */
export async function addGroupMembers(
  chatId: string,
  userId: string,
  newMembers: ChatUser[]
): Promise<boolean> {
  try {
    const chatDoc = await getDoc(doc(db, CHATS_COLLECTION, chatId))
    if (!chatDoc.exists()) return false
    
    const chat = chatDoc.data()
    if (chat.type !== 'group') return false
    if (chat.createdBy !== userId) {
      console.error('[ChatService] Only creator can add members')
      return false
    }
    
    const currentParticipants = chat.participants || []
    const currentDetails = chat.participantDetails || {}
    const currentUnread = chat.unreadCount || {}
    
    // Add new members
    const membersToAdd = newMembers.filter(m => !currentParticipants.includes(m.id))
    if (membersToAdd.length === 0) return true // Already members
    
    membersToAdd.forEach(m => {
      currentParticipants.push(m.id)
      currentDetails[m.id] = m.avatar ? { name: m.name, avatar: m.avatar } : { name: m.name }
      currentUnread[m.id] = 0
    })
    
    await updateDoc(doc(db, CHATS_COLLECTION, chatId), {
      participants: currentParticipants,
      participantDetails: currentDetails,
      unreadCount: currentUnread
    })
    
    // Add system message
    const names = membersToAdd.map(m => m.name).join(', ')
    await addDoc(collection(db, MESSAGES_COLLECTION), {
      chatId,
      senderId: 'system',
      senderName: 'System',
      text: `${names} ${membersToAdd.length > 1 ? 'were' : 'was'} added to the group`,
      type: 'system',
      timestamp: serverTimestamp()
    })
    
    return true
  } catch (error) {
    console.error('[ChatService] addGroupMembers error:', error)
    return false
  }
}

/**
 * Remove a member from group (creator/admin only)
 */
export async function removeGroupMember(
  chatId: string,
  userId: string,
  memberIdToRemove: string
): Promise<boolean> {
  try {
    const chatDoc = await getDoc(doc(db, CHATS_COLLECTION, chatId))
    if (!chatDoc.exists()) return false
    
    const chat = chatDoc.data()
    if (chat.type !== 'group') return false
    if (chat.createdBy !== userId) {
      console.error('[ChatService] Only creator can remove members')
      return false
    }
    if (memberIdToRemove === chat.createdBy) {
      console.error('[ChatService] Cannot remove the creator')
      return false
    }
    
    const currentParticipants = (chat.participants || []).filter((id: string) => id !== memberIdToRemove)
    const currentDetails = { ...chat.participantDetails }
    const removedName = currentDetails[memberIdToRemove]?.name || 'A member'
    delete currentDetails[memberIdToRemove]
    
    const currentUnread = { ...chat.unreadCount }
    delete currentUnread[memberIdToRemove]
    
    await updateDoc(doc(db, CHATS_COLLECTION, chatId), {
      participants: currentParticipants,
      participantDetails: currentDetails,
      unreadCount: currentUnread
    })
    
    // Add system message
    await addDoc(collection(db, MESSAGES_COLLECTION), {
      chatId,
      senderId: 'system',
      senderName: 'System',
      text: `${removedName} was removed from the group`,
      type: 'system',
      timestamp: serverTimestamp()
    })
    
    return true
  } catch (error) {
    console.error('[ChatService] removeGroupMember error:', error)
    return false
  }
}

/**
 * Leave a group (for non-creator members)
 */
export async function leaveGroup(
  chatId: string,
  userId: string
): Promise<boolean> {
  try {
    const chatDoc = await getDoc(doc(db, CHATS_COLLECTION, chatId))
    if (!chatDoc.exists()) return false
    
    const chat = chatDoc.data()
    if (chat.type !== 'group') return false
    if (chat.createdBy === userId) {
      console.error('[ChatService] Creator cannot leave, must delete group instead')
      return false
    }
    
    const currentParticipants = (chat.participants || []).filter((id: string) => id !== userId)
    const currentDetails = { ...chat.participantDetails }
    const leavingName = currentDetails[userId]?.name || 'A member'
    delete currentDetails[userId]
    
    const currentUnread = { ...chat.unreadCount }
    delete currentUnread[userId]
    
    await updateDoc(doc(db, CHATS_COLLECTION, chatId), {
      participants: currentParticipants,
      participantDetails: currentDetails,
      unreadCount: currentUnread
    })
    
    // Add system message
    await addDoc(collection(db, MESSAGES_COLLECTION), {
      chatId,
      senderId: 'system',
      senderName: 'System',
      text: `${leavingName} left the group`,
      type: 'system',
      timestamp: serverTimestamp()
    })
    
    return true
  } catch (error) {
    console.error('[ChatService] leaveGroup error:', error)
    return false
  }
}

/**
 * Delete group (creator only) - deletes all messages too
 */
export async function deleteGroup(
  chatId: string,
  userId: string
): Promise<boolean> {
  try {
    const chatDoc = await getDoc(doc(db, CHATS_COLLECTION, chatId))
    if (!chatDoc.exists()) return false
    
    const chat = chatDoc.data()
    if (chat.type !== 'group') return false
    if (chat.createdBy !== userId) {
      console.error('[ChatService] Only creator can delete the group')
      return false
    }
    
    // Delete all messages in the group
    const messagesQuery = query(
      collection(db, MESSAGES_COLLECTION),
      where('chatId', '==', chatId)
    )
    const messagesSnapshot = await getDocs(messagesQuery)
    
    const deletePromises = messagesSnapshot.docs.map(msgDoc => 
      deleteDoc(doc(db, MESSAGES_COLLECTION, msgDoc.id))
    )
    await Promise.all(deletePromises)
    
    // Delete the chat
    await deleteDoc(doc(db, CHATS_COLLECTION, chatId))
    
    return true
  } catch (error) {
    console.error('[ChatService] deleteGroup error:', error)
    return false
  }
}

// ============================================
// HELPERS
// ============================================

function docToChat(docSnap: any): Chat {
  const data = docSnap.data()
  return {
    id: docSnap.id,
    type: data.type || 'direct',
    name: data.name,
    avatar: data.avatar,
    participants: data.participants || [],
    participantDetails: data.participantDetails || {},
    createdBy: data.createdBy || '',
    createdAt: toDate(data.createdAt),
    lastMessage: data.lastMessage ? {
      text: data.lastMessage.text,
      senderId: data.lastMessage.senderId,
      timestamp: toDate(data.lastMessage.timestamp)
    } : undefined,
    unreadCount: data.unreadCount || {}
  }
}

function docToMessage(docSnap: any): Message {
  const data = docSnap.data()
  return {
    id: docSnap.id,
    chatId: data.chatId,
    senderId: data.senderId,
    senderName: data.senderName,
    senderAvatar: data.senderAvatar,
    text: data.text || '',
    timestamp: toDate(data.timestamp),
    type: data.type || 'text',
    imageUrl: data.imageUrl,
    replyTo: data.replyTo,
    reactions: data.reactions,
    edited: data.edited,
    deleted: data.deleted
  }
}

function toDate(timestamp: any): Date {
  if (!timestamp) return new Date()
  if (timestamp instanceof Date) return timestamp
  if (timestamp.toDate) return timestamp.toDate()
  if (timestamp.seconds) return new Date(timestamp.seconds * 1000)
  return new Date(timestamp)
}
