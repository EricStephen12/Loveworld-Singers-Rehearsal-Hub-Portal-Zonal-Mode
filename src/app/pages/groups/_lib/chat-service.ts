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
  Timestamp
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
const SENIOR_ZONES = ['zone-president', 'zone-director', 'zone-oftp']

/**
 * Search users across ALL zones with protected zone filtering
 * - Searches all zones (cross-zone search) from BOTH zone_members AND hq_members
 * - Deduplicates users by userId
 * - Hides senior zone members UNLESS user has existing chat with them
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
    
    // Check if current user is in a senior zone (they can see everyone)
    const isInSeniorZone = currentUserZoneId ? SENIOR_ZONES.includes(currentUserZoneId) : false
    
    // Convert existing chat user IDs to a Set for fast lookup
    const existingChatUsers = new Set(existingChatUserIds)
    
    console.log('[ChatService] Searching ALL members from zone_members + hq_members...')
    
    // Get ALL zone members
    const zoneMembersRef = collection(db, 'zone_members')
    const zoneMembersSnapshot = await getDocs(zoneMembersRef)
    console.log(`[ChatService] Found ${zoneMembersSnapshot.size} zone_members`)
    
    // Get ALL HQ members
    const hqMembersRef = collection(db, 'hq_members')
    const hqMembersSnapshot = await getDocs(hqMembersRef)
    console.log(`[ChatService] Found ${hqMembersSnapshot.size} hq_members`)
    
    // Process zone_members
    zoneMembersSnapshot.forEach(docSnap => {
      const data = docSnap.data()
      if (data.userId === currentUserId) return
      if (seenIds.has(data.userId)) return
      
      const memberZoneId = data.zoneId
      const isInProtectedZone = SENIOR_ZONES.includes(memberZoneId)
      const hasExistingChat = existingChatUsers.has(data.userId)
      
      if (isInProtectedZone && !isInSeniorZone && !isBoss && !hasExistingChat) {
        return
      }
      
      const name = (data.userName || '').trim()
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
      
      const memberZoneId = data.groupId || data.zoneId
      const isInProtectedZone = SENIOR_ZONES.includes(memberZoneId)
      const hasExistingChat = existingChatUsers.has(data.userId)
      
      if (isInProtectedZone && !isInSeniorZone && !isBoss && !hasExistingChat) {
        return
      }
      
      const name = (data.userName || '').trim()
      const matchesSearch = !searchTerm || 
        name.toLowerCase().includes(searchTerm.toLowerCase())
      
      if (matchesSearch && name) {
        seenIds.add(data.userId)
        users.push({
          id: data.userId,
          name: name,
          zoneId: memberZoneId,
          zoneName: data.groupName || data.zoneName
        })
      }
    })
    
    console.log(`[ChatService] Returning ${users.length} unique users (search: "${searchTerm}")`)
    
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
    console.log('[ChatService] getOrCreateDirectChat called')
    console.log('[ChatService] Current user:', currentUser.id, currentUser.name)
    console.log('[ChatService] Other user:', otherUser.id, otherUser.name)
    
    // Prevent self-chat
    if (currentUser.id === otherUser.id) {
      console.error('[ChatService] Cannot create self-chat')
      return null
    }
    
    // Check for existing chat
    console.log('[ChatService] Checking for existing chat...')
    const existing = await findDirectChat(currentUser.id, otherUser.id)
    if (existing) {
      console.log('[ChatService] Found existing chat:', existing.id)
      return existing.id
    }
    
    console.log('[ChatService] No existing chat, creating new one...')
    
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
    console.log('[ChatService] Created direct chat:', docRef.id)
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
    
    console.log('[ChatService] Created group chat:', docRef.id)
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
    
    // Update chat's last message
    const lastMessageText = media?.type === 'image' ? '📷 Image' : media?.type === 'document' ? '📄 Document' : text.slice(0, 100)
    await updateDoc(doc(db, CHATS_COLLECTION, chatId), {
      lastMessage: {
        text: lastMessageText,
        senderId: sender.id,
        timestamp: serverTimestamp()
      }
    })
    
    return true
  } catch (error) {
    console.error('[ChatService] sendMessage error:', error)
    return false
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
      console.log('[ChatService] Falling back to unordered query')
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
    
    console.log('[ChatService] Added members to group:', membersToAdd.length)
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
    
    console.log('[ChatService] Removed member from group:', memberIdToRemove)
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
    
    console.log('[ChatService] User left group:', userId)
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
    
    console.log('[ChatService] Deleted group and messages:', chatId)
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
