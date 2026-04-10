/**
 * CLEAN CHAT SERVICE
 * Fresh Firebase real-time chat implementation
 * Collections: chats_v2, messages_v2, presence, starred_messages
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
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
import { authedFetch } from '@/lib/authed-fetch'

// TYPES

export interface ChatUser {
  id: string
  name: string
  avatar?: string
  zoneId?: string
  zoneName?: string
}

// Reaction types
export type ReactionType = '❤️' | '👍' | '😂' | '😮' | '😢' | '🙏' | '🔥' | '👏' | '💯' | '✨' | ''

// Message types
export type MessageType = 'text' | 'image' | 'document' | 'voice' | 'system'

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
  voiceUrl?: string
  voiceDuration?: number
  replyTo?: {
    id: string
    text: string
    senderName: string
  }
  reactions?: { [userId: string]: ReactionType }
  edited?: boolean
  deleted?: boolean
  isStarred?: boolean
  pinnedInChat?: boolean
  status?: 'sent' | 'delivered' | 'read' | 'forwarded'
}

export interface Chat {
  id: string
  type: 'direct' | 'group'
  name?: string
  avatar?: string
  description?: string
  participants: string[]
  participantDetails: { [userId: string]: { name: string; avatar?: string } }
  admins: string[]
  createdBy: string
  createdAt: Date
  lastMessage?: {
    text: string
    senderId: string
    timestamp: Date
    status?: 'sent' | 'delivered' | 'read'
  }
  unreadCount: { [userId: string]: number }
  pinnedBy?: { [userId: string]: boolean }
  clearedAt?: { [userId: string]: any }
  pinnedMessageId?: string
}

// COLLECTIONS (v2 - fresh start)

const CHATS_COLLECTION = 'chats_v2'
const MESSAGES_COLLECTION = 'messages_v2'
const TYPING_COLLECTION = 'typing_v2'

// HELPERS

function formatCallDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m}:${s.toString().padStart(2, '0')}`
}

// USER HELPERS

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
        avatar: data.photoURL || data.avatar || data.profileImage || data.profile_image_url || data.avatar_url,
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
        avatar: data.profile_image_url || data.avatar_url || data.photoURL || data.avatar
      }
    }

    return null
  } catch (error) {
    console.error('[ChatService] getUserInfo error:', error)
    return null
  }
}

// Protected senior zones - members only visible to their own zone or boss users
const SENIOR_ZONES = ['zone-president', 'zone-president-2', 'zone-director', 'zone-oftp']
const SENIOR_TITLES = ['president', 'director', 'oftp']

/**
 * Check if a user is a senior/protected member
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
 */
export async function searchZoneUsers(
  searchTerm: string,
  currentUserId: string,
  currentUserZoneId?: string,
  isBoss: boolean = false,
  existingChatUserIds: string[] = []
): Promise<ChatUser[]> {
  try {
    const users: ChatUser[] = []
    const seenIds = new Set<string>()

    const isInSeniorZone = currentUserZoneId ?
      (SENIOR_ZONES.includes(currentUserZoneId) ||
        SENIOR_TITLES.some(title => currentUserZoneId.toLowerCase().includes(title))) : false

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

      const isInProtectedZone = isSeniorMember(memberZoneId, memberGroupId, name)
      const hasExistingChat = existingChatUsers.has(data.userId)

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
          avatar: data.photoURL || data.avatar || data.profileImage,
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

      const isInProtectedZone = isSeniorMember(memberZoneId, memberGroupId, name)
      const hasExistingChat = existingChatUsers.has(data.userId)

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
          avatar: data.photoURL || data.avatar || data.profileImage,
          zoneId: memberGroupId || memberZoneId,
          zoneName: data.groupName || data.zoneName
        })
      }
    })

    users.sort((a, b) => a.name.localeCompare(b.name))
    return users.slice(0, 100)
  } catch (error) {
    console.error('[ChatService] searchZoneUsers error:', error)
    return []
  }
}

// CHAT OPERATIONS

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
    if (currentUser.id === otherUser.id) return null

    const existing = await findDirectChat(currentUser.id, otherUser.id)
    if (existing) return existing.id

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

    if (currentUser.avatar) chatData.participantDetails[currentUser.id].avatar = currentUser.avatar
    if (otherUser.avatar) chatData.participantDetails[otherUser.id].avatar = otherUser.avatar

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
      participantDetails[m.id] = m.avatar ? { name: m.name, avatar: m.avatar } : { name: m.name }
      unreadCount[m.id] = 0
    })

    const chatData = {
      type: 'group',
      name,
      participants: allMembers.map(m => m.id),
      participantDetails,
      admins: [creator.id],
      createdBy: creator.id,
      createdAt: serverTimestamp(),
      unreadCount
    }

    const docRef = await addDoc(collection(db, CHATS_COLLECTION), chatData)

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
  const q = query(chatsRef, where('participants', 'array-contains', userId))

  return onSnapshot(q, (snapshot) => {
    const chats: Chat[] = []
    snapshot.forEach(docSnap => {
      const chat = docToChat(docSnap)
      if (chat.type === 'direct') {
        if (chat.participants.length !== 2) return
        if (chat.participants[0] === chat.participants[1]) return
      }
      chats.push(chat)
    })

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
    const chatDoc = await getDoc(doc(db, CHATS_COLLECTION, chatId))
    if (!chatDoc.exists()) return false
    const chat = chatDoc.data()
    if (!chat.participants.includes(userId)) return false
    if (chat.type === 'group' && chat.createdBy !== userId) return false

    await deleteDoc(doc(db, CHATS_COLLECTION, chatId))
    return true
  } catch (error) {
    console.error('[ChatService] deleteChat error:', error)
    return false
  }
}

// MESSAGE OPERATIONS

/**
 * Send message
 */
export async function sendMessage(
  chatId: string,
  sender: ChatUser,
  text: string,
  replyTo?: { id: string; text: string; senderName: string },
  media?: { type: 'image' | 'document' | 'voice'; url: string; name?: string; size?: number; mimeType?: string; duration?: number }
): Promise<boolean> {
  try {
    const messageData: any = {
      chatId,
      senderId: sender.id,
      senderName: sender.name,
      text: text || (media?.type === 'image' ? 'Image' : (media?.type === 'document' ? 'Document' : (media?.type === 'voice' ? 'Voice message' : ''))),
      type: media?.type || 'text',
      timestamp: serverTimestamp(),
      status: 'sent'
    }

    if (sender.avatar) messageData.senderAvatar = sender.avatar
    if (replyTo) messageData.replyTo = replyTo

    if (media) {
      if (media.type === 'image') messageData.imageUrl = media.url
      else if (media.type === 'document') {
        messageData.attachment = {
          url: media.url,
          name: media.name || 'Document',
          size: media.size,
          mimeType: media.mimeType
        }
      } else if (media.type === 'voice') {
        messageData.voiceUrl = media.url
        messageData.voiceDuration = media.duration
      }
    }

    await addDoc(collection(db, MESSAGES_COLLECTION), messageData)

    const chatDoc = await getDoc(doc(db, CHATS_COLLECTION, chatId))
    if (chatDoc.exists()) {
      const chatData = chatDoc.data()
      const participants = chatData.participants || []
      const unreadUpdates: { [key: string]: any } = {}
      participants.forEach((pid: string) => {
        if (pid !== sender.id) unreadUpdates[`unreadCount.${pid}`] = increment(1)
      })

      const lastMessageText = media?.type === 'image' ? 'Image' : media?.type === 'document' ? 'Document' : media?.type === 'voice' ? 'Voice message' : text.slice(0, 100)
      await updateDoc(doc(db, CHATS_COLLECTION, chatId), {
        lastMessage: { 
          text: lastMessageText, 
          senderId: sender.id, 
          timestamp: serverTimestamp(),
          status: 'sent'
        },
        ...unreadUpdates
      })

      const otherParticipants = participants.filter((id: string) => id !== sender.id)
      if (otherParticipants.length > 0) {
        const notifTitle = chatData.type === 'group' ? chatData.name : sender.name
        const notifBody = chatData.type === 'group' ? `${sender.name}: ${lastMessageText}` : lastMessageText
        sendChatNotification(otherParticipants, notifTitle || 'New Message', notifBody, chatId, sender.id, sender.name).catch(() => {})
      }
    }

    return true
  } catch (error) {
    console.error('[ChatService] sendMessage error:', error)
    return false
  }
}

/**
 * Forward a message
 */
export async function forwardMessage(
  targetChatId: string,
  sender: ChatUser,
  originalMessage: Message
): Promise<boolean> {
  try {
    const text = originalMessage.text
    const media = originalMessage.imageUrl ? { type: 'image' as const, url: originalMessage.imageUrl } :
      originalMessage.attachment ? { type: 'document' as const, url: originalMessage.attachment.url, name: originalMessage.attachment.name, size: originalMessage.attachment.size, mimeType: originalMessage.attachment.mimeType } :
        originalMessage.voiceUrl ? { type: 'voice' as const, url: originalMessage.voiceUrl, duration: originalMessage.voiceDuration } :
          undefined

    return sendMessage(targetChatId, sender, text || '', undefined, media as any)
  } catch (error) {
    console.error('[ChatService] forwardMessage error:', error)
    return false
  }
}

/**
 * Mark chat as read
 */
export async function markChatAsRead(chatId: string, userId: string): Promise<boolean> {
  try {
    await updateDoc(doc(db, CHATS_COLLECTION, chatId), { [`unreadCount.${userId}`]: 0 })
    
    // Also update the last message status to read if it was sent to us
    const chatDoc = await getDoc(doc(db, CHATS_COLLECTION, chatId))
    if (chatDoc.exists()) {
      const chatData = chatDoc.data()
      if (chatData.lastMessage && chatData.lastMessage.senderId !== userId && chatData.lastMessage.status !== 'read') {
        await updateDoc(doc(db, CHATS_COLLECTION, chatId), { 'lastMessage.status': 'read' })
      }
    }

    const q = query(
      collection(db, MESSAGES_COLLECTION), 
      where('chatId', '==', chatId), 
      where('status', '!=', 'read')
    )
    const snap = await getDocs(q)
    const updates = snap.docs
      .filter(d => d.data().senderId !== userId)
      .map(d => updateDoc(doc(db, MESSAGES_COLLECTION, d.id), { status: 'read' }))
    
    await Promise.all(updates)
    return true
  } catch (error) {
    return false
  }
}

/**
 * Subscribe to messages
 */
export function subscribeToMessages(chatId: string, callback: (messages: Message[]) => void): () => void {
  const q = query(collection(db, MESSAGES_COLLECTION), where('chatId', '==', chatId), orderBy('timestamp', 'asc'), limit(100))
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(docToMessage))
  }, (error) => {
    if (error.message?.includes('index')) {
      const fallbackQ = query(collection(db, MESSAGES_COLLECTION), where('chatId', '==', chatId), limit(100))
      return onSnapshot(fallbackQ, (snap) => {
        const msgs = snap.docs.map(docToMessage).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        callback(msgs)
      })
    }
    callback([])
  })
}

// TYPING STATUS

/**
 * Set typing status
 */
export async function setTypingStatus(chatId: string, userId: string, userName: string, status: 'typing' | 'recording_voice' | null): Promise<void> {
  try {
    const ref = doc(db, TYPING_COLLECTION, `${chatId}_${userId}`)
    if (status) {
      await setDoc(ref, { 
        id: `${chatId}_${userId}`, 
        chatId, 
        userId, 
        userName, 
        status, 
        timestamp: serverTimestamp() 
      }, { merge: true })
    } else {
      await deleteDoc(ref).catch(() => {})
    }
  } catch (err) {}
}

/**
 * Subscribe to typing status
 */
export function subscribeToTyping(chatId: string, currentUserId: string, callback: (typingUsers: { userName: string, status: string }[]) => void): () => void {
  const q = query(collection(db, TYPING_COLLECTION), where('chatId', '==', chatId))
  return onSnapshot(q, (snap) => {
    const now = Date.now()
    const users = snap.docs
      .map(d => d.data())
      .filter(d => d.userId !== currentUserId)
      .filter(d => {
        // Handle potential serverTimestamp lag: if timestamp is null, it's very recent (locally sent)
        const ts = d.timestamp?.toMillis() || now
        return now - ts < 15000 // 15 second window for safety
      })
      .map(d => ({ userName: d.userName, status: d.status }))
    callback(users)
  })
}

// GROUP MANAGEMENT

export async function addGroupMembers(chatId: string, userId: string, newMembers: ChatUser[]): Promise<boolean> {
  try {
    const snap = await getDoc(doc(db, CHATS_COLLECTION, chatId))
    if (!snap.exists()) return false
    const chat = snap.data()
    const isAdmin = chat.createdBy === userId || (chat.admins || []).includes(userId)
    if (!isAdmin) return false

    const participants = chat.participants || []
    const details = chat.participantDetails || {}
    const unread = chat.unreadCount || {}
    const toAdd = newMembers.filter(m => !participants.includes(m.id))
    if (toAdd.length === 0) return true

    toAdd.forEach(m => {
      participants.push(m.id)
      details[m.id] = m.avatar ? { name: m.name, avatar: m.avatar } : { name: m.name }
      unread[m.id] = 0
    })

    await updateDoc(doc(db, CHATS_COLLECTION, chatId), { participants, participantDetails: details, unreadCount: unread })
    const names = toAdd.map(m => m.name).join(', ')
    await addDoc(collection(db, MESSAGES_COLLECTION), { chatId, senderId: 'system', senderName: 'System', text: `${names} added to the group`, type: 'system', timestamp: serverTimestamp() })
    return true
  } catch (err) { return false }
}

export async function removeGroupMember(chatId: string, userId: string, memberId: string): Promise<boolean> {
  try {
    const snap = await getDoc(doc(db, CHATS_COLLECTION, chatId))
    if (!snap.exists()) return false
    const chat = snap.data()
    if (chat.createdBy === userId || (chat.admins || []).includes(userId)) {
      if (memberId === chat.createdBy) return false
      const participants = (chat.participants || []).filter((id: string) => id !== memberId)
      const details = { ...chat.participantDetails }
      const name = details[memberId]?.name || 'Member'
      delete details[memberId]
      const unread = { ...chat.unreadCount }
      delete unread[memberId]
      let admins = (chat.admins || []).filter((id: string) => id !== memberId)

      await updateDoc(doc(db, CHATS_COLLECTION, chatId), { participants, participantDetails: details, unreadCount: unread, admins })
      await addDoc(collection(db, MESSAGES_COLLECTION), { chatId, senderId: 'system', senderName: 'System', text: `${name} was removed`, type: 'system', timestamp: serverTimestamp() })
      return true
    }
    return false
  } catch (err) { return false }
}

export async function leaveGroup(chatId: string, userId: string): Promise<boolean> {
  try {
    const snap = await getDoc(doc(db, CHATS_COLLECTION, chatId))
    if (!snap.exists()) return false
    const chat = snap.data()
    if (chat.createdBy === userId) return false
    const participants = (chat.participants || []).filter((id: string) => id !== userId)
    const details = { ...chat.participantDetails }
    const name = details[userId]?.name || 'Member'
    delete details[userId]
    const unread = { ...chat.unreadCount }
    delete unread[userId]

    await updateDoc(doc(db, CHATS_COLLECTION, chatId), { participants, participantDetails: details, unreadCount: unread })
    await addDoc(collection(db, MESSAGES_COLLECTION), { chatId, senderId: 'system', senderName: 'System', text: `${name} left`, type: 'system', timestamp: serverTimestamp() })
    return true
  } catch (err) { return false }
}

export async function deleteGroup(chatId: string, userId: string): Promise<boolean> {
  try {
    const snap = await getDoc(doc(db, CHATS_COLLECTION, chatId))
    if (!snap.exists() || snap.data().createdBy !== userId) return false
    const msgs = await getDocs(query(collection(db, MESSAGES_COLLECTION), where('chatId', '==', chatId)))
    await Promise.all(msgs.docs.map(m => deleteDoc(doc(db, MESSAGES_COLLECTION, m.id))))
    await deleteDoc(doc(db, CHATS_COLLECTION, chatId))
    return true
  } catch (err) { return false }
}

export async function renameGroup(chatId: string, userId: string, newName: string): Promise<boolean> {
  try {
    const snap = await getDoc(doc(db, CHATS_COLLECTION, chatId))
    if (snap.exists() && (snap.data().createdBy === userId || (snap.data().admins || []).includes(userId))) {
      const old = snap.data().name || 'Group'
      await updateDoc(doc(db, CHATS_COLLECTION, chatId), { name: newName })
      await addDoc(collection(db, MESSAGES_COLLECTION), { chatId, senderId: 'system', senderName: 'System', text: `Renamed to "${newName}"`, type: 'system', timestamp: serverTimestamp() })
      return true
    }
    return false
  } catch (err) { return false }
}

export async function updateGroupDescription(chatId: string, userId: string, desc: string): Promise<boolean> {
  try {
    const snap = await getDoc(doc(db, CHATS_COLLECTION, chatId))
    if (snap.exists() && (snap.data().createdBy === userId || (snap.data().admins || []).includes(userId))) {
      await updateDoc(doc(db, CHATS_COLLECTION, chatId), { description: desc })
      return true
    }
    return false
  } catch (err) { return false }
}

export async function updateChatAvatar(chatId: string, userId: string, url: string): Promise<boolean> {
  try {
    const snap = await getDoc(doc(db, CHATS_COLLECTION, chatId))
    if (snap.exists() && (snap.data().createdBy === userId || (snap.data().admins || []).includes(userId))) {
      await updateDoc(doc(db, CHATS_COLLECTION, chatId), { avatar: url })
      return true
    }
    return false
  } catch (err) { return false }
}

export async function toggleGroupAdmin(chatId: string, userId: string, targetId: string, status: boolean): Promise<boolean> {
  try {
    const snap = await getDoc(doc(db, CHATS_COLLECTION, chatId))
    if (snap.exists() && snap.data().createdBy === userId) {
      let admins = snap.data().admins || []
      if (status) { if (!admins.includes(targetId)) admins.push(targetId) }
      else admins = admins.filter((id: string) => id !== targetId)
      await updateDoc(doc(db, CHATS_COLLECTION, chatId), { admins })
      return true
    }
    return false
  } catch (err) { return false }
}

// PRESENCE, STARRING, PINNING



export async function pinMessage(chatId: string, messageId: string | null): Promise<boolean> {
  try {
    await updateDoc(doc(db, CHATS_COLLECTION, chatId), { pinnedMessageId: messageId || null })
    return true
  } catch (err) { return false }
}

export async function togglePinChat(chatId: string, userId: string, pinned: boolean): Promise<boolean> {
  try {
    await updateDoc(doc(db, CHATS_COLLECTION, chatId), { [`pinnedBy.${userId}`]: pinned })
    return true
  } catch (err) { return false }
}

// HELPERS

function docToChat(docSnap: any): Chat {
  const data = docSnap.data()
  return {
    id: docSnap.id,
    type: data.type || 'direct',
    name: data.name,
    avatar: data.avatar,
    description: data.description,
    participants: data.participants || [],
    participantDetails: data.participantDetails || {},
    admins: data.admins || [],
    createdBy: data.createdBy || '',
    createdAt: toDate(data.createdAt),
    lastMessage: data.lastMessage ? {
      text: data.lastMessage.text,
      senderId: data.lastMessage.senderId,
      timestamp: toDate(data.lastMessage.timestamp)
    } : undefined,
    unreadCount: data.unreadCount || {},
    pinnedBy: data.pinnedBy || {},
    clearedAt: data.clearedAt || {},
    pinnedMessageId: data.pinnedMessageId
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
    attachment: data.attachment,
    voiceUrl: data.voiceUrl,
    voiceDuration: data.voiceDuration,
    replyTo: data.replyTo,
    reactions: data.reactions,
    edited: data.edited,
    deleted: data.deleted,
    status: data.status
  }
}

function toDate(timestamp: any): Date {
  if (!timestamp) return new Date()
  if (timestamp instanceof Date) return timestamp
  if (timestamp.toDate) return timestamp.toDate()
  if (timestamp.seconds) return new Date(timestamp.seconds * 1000)
  return new Date(timestamp)
}

async function sendChatNotification(recipientIds: string[], title: string, body: string, chatId: string, senderId: string, senderName?: string): Promise<void> {
  try {
    const response = await authedFetch('/api/send-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'chat', recipientIds, title, body, data: { chatId, senderName: senderName || 'Someone' }, excludeUserId: senderId })
    })
    
    if (response.ok) {
      const data = await response.json()
      console.log(`[ChatService] Notification sent successfully to ${data.sentCount} tokens for ${recipientIds.length} recipients.`)
    } else {
      const errorText = await response.text()
      console.error('[ChatService] Notification API error:', errorText)
    }
  } catch (err) {
    console.error('[ChatService] Failed to call notification API:', err)
  }
}

export async function deleteMessage(messageId: string, userId: string, forEveryone: boolean = false): Promise<boolean> {
  try {
    const snap = await getDoc(doc(db, MESSAGES_COLLECTION, messageId))
    if (!snap.exists()) return false
    const msg = snap.data()
    if (forEveryone) {
      const isSender = msg.senderId === userId
      let isAdmin = false
      const cSnap = await getDoc(doc(db, CHATS_COLLECTION, msg.chatId))
      if (cSnap.exists()) {
        const c = cSnap.data()
        isAdmin = c.createdBy === userId || (c.admins || []).includes(userId)
      }
      if (!isSender && !isAdmin) return false
      await updateDoc(doc(db, MESSAGES_COLLECTION, messageId), { text: 'Deleted for everyone', deleted: true })
    } else {
      if (msg.senderId !== userId) return false
      await updateDoc(doc(db, MESSAGES_COLLECTION, messageId), { text: 'Deleted', deleted: true })
    }
    return true
  } catch (err) { return false }
}

export async function toggleReaction(messageId: string, userId: string, reaction: ReactionType): Promise<boolean> {
  try {
    const snap = await getDoc(doc(db, MESSAGES_COLLECTION, messageId))
    if (!snap.exists()) return false
    const current = snap.data().reactions || {}
    if (current[userId] === reaction) delete current[userId]
    else current[userId] = reaction
    await updateDoc(doc(db, MESSAGES_COLLECTION, messageId), { reactions: current })
    return true
  } catch (err) { return false }
}

export async function sendCallMessage(chatId: string, type: 'missed' | 'answered' | 'declined', caller: string, duration?: number): Promise<boolean> {
  try {
    let t = type === 'missed' ? `Missed call from ${caller}` : type === 'declined' ? 'Call declined' : `Voice call • ${duration ? formatCallDuration(duration) : '0:00'}`
    const data = { chatId, senderId: 'system', senderName: 'System', text: t, type: 'system', timestamp: serverTimestamp() }
    await addDoc(collection(db, MESSAGES_COLLECTION), data)
    const cSnap = await getDoc(doc(db, CHATS_COLLECTION, chatId))
    if (cSnap.exists()) {
      const p = cSnap.data().participants || []
      const u: any = {}
      if (type === 'missed' || type === 'declined') p.forEach((id: string) => u[`unreadCount.${id}`] = increment(1))
      await updateDoc(doc(db, CHATS_COLLECTION, chatId), { lastMessage: { text: t, senderId: 'system', timestamp: serverTimestamp() }, ...u })
    }
    return true
  } catch (err) { return false }
}

export async function editMessage(messageId: string, userId: string, newText: string): Promise<boolean> {
  try {
    const snap = await getDoc(doc(db, MESSAGES_COLLECTION, messageId))
    if (!snap.exists()) return false
    if (snap.data().senderId !== userId) return false
    await updateDoc(doc(db, MESSAGES_COLLECTION, messageId), { text: newText, edited: true })
    return true
  } catch (err) { return false }
}

export async function clearChat(chatId: string, userId: string): Promise<boolean> {
  try {
    await updateDoc(doc(db, CHATS_COLLECTION, chatId), { [`clearedAt.${userId}`]: serverTimestamp() })
    return true
  } catch (err) { return false }
}

