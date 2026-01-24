// Firebase Chat Service - Complete chat system with Firebase
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
  arrayUnion,
  arrayRemove,
  increment,
  deleteField
} from 'firebase/firestore'
import { db } from '@/lib/firebase-setup'
import { getZoneById, isHQGroup } from '@/config/zones'
import { HQMembersService } from '@/lib/hq-members-service'

// Types
export interface ChatUser {
  id: string
  email: string
  fullName: string
  firstName?: string
  lastName?: string
  profilePic?: string
  isOnline: boolean
  lastSeen: Date
  zoneId?: string
  zoneName?: string
}

export interface ChatMessage {
  id: string
  chatId: string
  senderId: string
  senderName: string
  senderAvatar?: string
  text?: string
  image?: string
  fileUrl?: string
  fileName?: string
  messageType: 'text' | 'image' | 'file' | 'system'
  timestamp: Date
  edited: boolean
  editedAt?: Date
  reactions: MessageReaction[]
  replyTo?: string
  replySnippet?: string
  replySenderName?: string
  deleted?: boolean
}

export interface MessageReaction {
  userId: string
  userName: string
  emoji: string
  timestamp: Date
}

export interface Chat {
  id: string
  type: 'direct' | 'group'
  name?: string // For group chats
  description?: string
  avatar?: string
  participants: string[] // User IDs
  participantNames?: { [userId: string]: string } // User ID to name mapping
  admins: string[] // User IDs (for groups)
  createdBy: string
  createdAt: Date
  lastMessage?: {
    text: string
    senderId: string
    senderName: string
    timestamp: Date
  }
  unreadCount: { [userId: string]: number }
  isActive: boolean
  pinned?: { [userId: string]: boolean } // User ID to pinned status
  starred?: { [userId: string]: boolean } // User ID to starred status
}

export interface FriendRequest {
  id: string
  fromUserId: string
  fromUserName: string
  fromUserAvatar?: string
  toUserId: string
  toUserName: string
  status: 'pending' | 'accepted' | 'declined'
  createdAt: Date
}

// Utility function to safely format timestamps
export const formatTimestamp = (timestamp: any): Date => {
  try {
    if (timestamp?.toDate) {
      // Firestore Timestamp
      return timestamp.toDate()
    } else if (timestamp?.seconds) {
      // Firestore Timestamp object
      return new Date(timestamp.seconds * 1000)
    } else if (timestamp instanceof Date) {
      return timestamp
    } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      return new Date(timestamp)
    } else {
      return new Date() // Return current date as fallback
    }
  } catch {
    return new Date() // Return current date as fallback
  }
}

export class FirebaseChatService {
  
  // ==================== WHATSAPP CACHE CLEARING ====================
  
  /**
   * Clear all chat cache - WhatsApp approach
   */
  static async clearChatCache(): Promise<void> {
    try {
      
            if (typeof window !== 'undefined') {
        const databases = await window.indexedDB.databases()
        for (const dbInfo of databases) {
          if (dbInfo.name?.includes('firestore')) {
            const deleteReq = window.indexedDB.deleteDatabase(dbInfo.name)
            await new Promise((resolve) => {
              deleteReq.onsuccess = () => resolve(true)
              deleteReq.onerror = () => resolve(true)
              deleteReq.onblocked = () => resolve(true)
            })
          }
        }
      }
      
            if (typeof window !== 'undefined') {
        Object.keys(localStorage).forEach(key => {
          if (key.includes('chat') || key.includes('firebase')) {
            localStorage.removeItem(key)
          }
        })
      }
      
    } catch (error) {
      console.error('❌ [WhatsApp Mode] Cache clear failed:', error)
    }
  }
  
  // ==================== USER MANAGEMENT ====================
  
  /**
   * Update user online status
   */
  static async updateUserStatus(userId: string, isOnline: boolean): Promise<void> {
    // Disabled - we don't need online status for now
    // This was causing errors because chat_users collection doesn't exist
    return
  }

  /**
   * Remove undefined values from object
   */
  private static removeUndefinedValues(obj: any): any {
    if (obj === null || obj === undefined) return null;
    if (Array.isArray(obj)) return obj.map(item => this.removeUndefinedValues(item));
    if (typeof obj === 'object' && obj.constructor === Object) {
      const cleaned: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined) {
          cleaned[key] = this.removeUndefinedValues(value);
        }
      }
      return cleaned;
    }
    return obj;
  }

  /**
   * Create or update user profile
   */
  static async createOrUpdateUser(userData: Partial<ChatUser>): Promise<void> {
    try {
      // Remove undefined values before saving
      const cleanData = this.removeUndefinedValues(userData);
      
      if (!cleanData || !cleanData.id) {
        console.error('Cannot create/update user: missing id');
        return;
      }
      
      const userRef = doc(db, 'chat_users', cleanData.id);
      await updateDoc(userRef, {
        ...cleanData,
        lastSeen: serverTimestamp()
      }).catch(async () => {
        // If document doesn't exist, create it
        await addDoc(collection(db, 'chat_users'), {
          ...cleanData,
          isOnline: true,
          lastSeen: serverTimestamp()
        })
      })
    } catch (error) {
      console.error('Error creating/updating user:', error)
    }
  }



  /**
   * Get all users in a specific zone
   */
  static async getZoneMembers(zoneId: string, currentUserId: string): Promise<ChatUser[]> {
    try {
      const users: ChatUser[] = []
      const zoneDetails = getZoneById(zoneId)
      
            if (isHQGroup(zoneId)) {
        const hqMembers = await HQMembersService.getHQGroupMembers(zoneId)
        
        // Convert HQ members to ChatUser format
        for (const rawMember of hqMembers as any[]) {
          const member = rawMember as any
          if (member.userId && member.userId !== currentUserId) {
            // Get user profile for additional info
            try {
              const { FirebaseDatabaseService } = await import('@/lib/firebase-database')
              const profile: any = await FirebaseDatabaseService.getDocument('profiles', member.userId)
              const fullName =
                profile
                  ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || member.userName
                  : member.userName
              
              users.push({
                id: member.userId,
                email: member.userEmail || '',
                fullName: fullName || 'Unknown User',
                profilePic: profile?.profile_image || undefined,
                zoneId: member.hqGroupId || zoneId,
                zoneName: zoneDetails?.name || 'Unknown Zone',
                isOnline: false,
                lastSeen: new Date()
              })
            } catch (profileError) {
              // Fallback if profile fetch fails
              users.push({
                id: member.userId,
                email: member.userEmail || '',
                fullName: member.userName || 'Unknown User',
                profilePic: undefined,
                zoneId: member.hqGroupId || zoneId,
                zoneName: zoneDetails?.name || 'Unknown Zone',
                isOnline: false,
                lastSeen: new Date()
              })
            }
          }
        }
      } else {
        // Regular zone - fetch from zone_members collection
        const zoneMembersRef = collection(db, 'zone_members')
        const zoneMembersQuery = query(zoneMembersRef, where('zoneId', '==', zoneId))
        const zoneMembersSnapshot = await getDocs(zoneMembersQuery)
        
        if (!zoneMembersSnapshot.empty) {
      zoneMembersSnapshot.forEach(doc => {
        const member = doc.data()
        if (member.userId && member.userId !== currentUserId) {
          users.push({
            id: member.userId,
            email: member.userEmail || '',
            fullName: member.userName || 'Unknown User',
            profilePic: undefined, // We can fetch this later if needed
            zoneId: member.zoneId || zoneId,
            zoneName: member.zoneName || zoneDetails?.name || 'Unknown Zone',
            isOnline: false,
            lastSeen: new Date()
          })
        }
      })
        }
      }
      
      // Sort by name
      users.sort((a, b) => a.fullName.localeCompare(b.fullName))
      
      return users
    } catch (error) {
      console.error('Error getting zone members:', error)
      return []
    }
  }

  // OPTIMIZED: Cache for zone members to prevent repeated fetches
  private static zoneMembersCache: { data: any[], timestamp: number } | null = null
  private static CACHE_TTL = 5 * 60 * 1000 // 5 minutes

  /**
   * Search users by name or email - searches ALL zones (no zone filtering)
   * Anyone can search and chat with anyone from any zone
   * OPTIMIZED: Uses caching to prevent repeated fetches
   */
  static async searchUsers(searchTerm: string, currentUserId: string, zoneId?: string, isBoss: boolean = false): Promise<ChatUser[]> {
    try {
      // SECURITY: Senior zones that should only be visible to their own zone members
      const SENIOR_ZONES = ['zone-president', 'zone-director', 'zone-oftp']
      
            const isSearcherInSeniorZone = zoneId ? SENIOR_ZONES.includes(zoneId) : false
      
      let allMembers: ChatUser[] = []
      
      // Use a Map to deduplicate by userId (in case user is in multiple zones)
      const userMap = new Map<string, ChatUser>()
      
      // OPTIMIZED: Use cached zone members if available and not expired
      let zoneMembersDocs: any[]
      const now = Date.now()
      
      if (this.zoneMembersCache && (now - this.zoneMembersCache.timestamp) < this.CACHE_TTL) {
        zoneMembersDocs = this.zoneMembersCache.data
      } else {
        // Fetch with limit to prevent massive reads
        const zoneMembersRef = collection(db, 'zone_members')
        const zoneMembersQuery = query(zoneMembersRef, limit(1000)) // OPTIMIZED: Limit to 1000
        const zoneMembersSnapshot = await getDocs(zoneMembersQuery)
        zoneMembersDocs = zoneMembersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        
        // Cache the results
        this.zoneMembersCache = { data: zoneMembersDocs, timestamp: now }
      }
      
      zoneMembersDocs.forEach(memberDoc => {
        const data = memberDoc
        // Skip current user
        if (data.userId === currentUserId) return
        
        // SECURITY: Hide senior zone members from users outside their zone
        // BUT: If searcher is in a senior zone or is a boss, they can see everyone
        const memberZoneId = data.zoneId
        if (!isSearcherInSeniorZone && !isBoss && SENIOR_ZONES.includes(memberZoneId)) {
          // This is a senior zone member, and searcher is NOT in a senior zone and NOT a boss - hide them
          return
        }
        
        // Only add if not already in map (keep first occurrence)
        if (!userMap.has(data.userId)) {
          userMap.set(data.userId, {
            id: data.userId,
            email: data.userEmail || '',
            fullName: data.userName || 'Unknown User',
            profilePic: undefined,
            zoneId: data.zoneId,
            zoneName: data.zoneName || 'Unknown Zone',
            isOnline: false,
            lastSeen: new Date()
          })
        }
      })
      
      // Also get all HQ members from all HQ groups
      const { HQ_GROUP_IDS } = await import('@/config/zones')
      for (const hqZoneId of HQ_GROUP_IDS) {
        try {
          const hqMembers = await HQMembersService.getHQGroupMembers(hqZoneId)
          const zoneDetails = getZoneById(hqZoneId)
          
          for (const rawMember of hqMembers as any[]) {
            const member = rawMember as any
            if (member.userId && member.userId !== currentUserId && !userMap.has(member.userId)) {
              // SECURITY: Hide senior zone members from users outside their zone
              // BUT: If searcher is in a senior zone or is a boss, they can see everyone
              const memberZoneId = member.hqGroupId || hqZoneId
              if (!isSearcherInSeniorZone && !isBoss && SENIOR_ZONES.includes(memberZoneId)) {
                // This is a senior zone member, and searcher is NOT in a senior zone and NOT a boss - hide them
                continue
              }
              
              // Get user profile for additional info
              try {
                const { FirebaseDatabaseService } = await import('@/lib/firebase-database')
                const profile: any = await FirebaseDatabaseService.getDocument('profiles', member.userId)
                const fullName =
                  profile
                    ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || member.userName
                    : member.userName
                
                userMap.set(member.userId, {
                  id: member.userId,
                  email: member.userEmail || '',
                  fullName: fullName || 'Unknown User',
                  profilePic: profile?.profile_image || undefined,
                  zoneId: member.hqGroupId || hqZoneId,
                  zoneName: zoneDetails?.name || 'Unknown Zone',
                  isOnline: false,
                  lastSeen: new Date()
                })
              } catch (profileError) {
                // Fallback if profile fetch fails
                userMap.set(member.userId, {
                  id: member.userId,
                  email: member.userEmail || '',
                  fullName: member.userName || 'Unknown User',
                  profilePic: undefined,
                  zoneId: member.hqGroupId || hqZoneId,
                  zoneName: zoneDetails?.name || 'Unknown Zone',
                  isOnline: false,
                  lastSeen: new Date()
                })
              }
            }
          }
        } catch (hqError) {
          console.error(`Error fetching HQ members for ${hqZoneId}:`, hqError)
          // Continue with other HQ groups
        }
      }
      
      allMembers = Array.from(userMap.values())
      
      // Sort by name
      allMembers.sort((a, b) => a.fullName.localeCompare(b.fullName))
      
      // If no search term, return all members
      if (!searchTerm || searchTerm.trim().length === 0) {
        return allMembers
      }
      
      // Filter by search term
      const searchLower = searchTerm.toLowerCase()
      const filtered = allMembers.filter(user => {
        const nameMatch = user.fullName?.toLowerCase().includes(searchLower)
        const emailMatch = user.email?.toLowerCase().includes(searchLower)
        const zoneMatch = user.zoneName?.toLowerCase().includes(searchLower)
        return nameMatch || emailMatch || zoneMatch
      })
      
      return filtered
    } catch (error) {
      console.error('Error searching users:', error)
      return []
    }
  }

  /**
   * Get user by ID
   */
  static async getUser(userId: string): Promise<ChatUser | null> {
    try {
      // First try to get from zone_members (has userName)
      const zoneMembersRef = collection(db, 'zone_members')
      const zoneMembersQuery = query(zoneMembersRef, where('userId', '==', userId))
      const zoneMembersSnapshot = await getDocs(zoneMembersQuery)
      
      if (!zoneMembersSnapshot.empty) {
        const memberData = zoneMembersSnapshot.docs[0].data()
        const zoneId = memberData.zoneId || memberData.hqGroupId
        const zoneDetails = zoneId ? getZoneById(zoneId) : null
        return {
          id: userId,
          email: memberData.userEmail || '',
          fullName: memberData.userName || 'Unknown User',
          profilePic: undefined,
          zoneId: zoneId,
          zoneName: memberData.zoneName || zoneDetails?.name || (zoneId ? `Zone ${zoneId}` : 'No zone assigned'),
          isOnline: false,
          lastSeen: new Date()
        }
      }
      
      // Fallback to profiles collection
      const profileDoc = await getDoc(doc(db, 'profiles', userId))
      if (profileDoc.exists()) {
        const profile = profileDoc.data()
        const zoneId = profile.zone_id || profile.zone
        const zoneDetails = zoneId ? getZoneById(zoneId) : null
        
        // Try to get zone name from multiple sources
        let zoneName = profile.zone_name || zoneDetails?.name || null
        
        // If still no zone name, try fetching from zone_members or hq_members
        if (!zoneName && zoneId) {
          try {
            // Check zone_members first
            const zoneMembersRef = collection(db, 'zone_members')
            const zoneMembersQuery = query(zoneMembersRef, where('userId', '==', userId), where('zoneId', '==', zoneId))
            const zoneMembersSnapshot = await getDocs(zoneMembersQuery)
            if (!zoneMembersSnapshot.empty) {
              const memberData = zoneMembersSnapshot.docs[0].data()
              zoneName = memberData.zoneName || zoneDetails?.name || null
            }
          } catch (error) {
            console.error('Error fetching zone name from zone_members:', error)
          }
        }
        
        return {
          id: userId,
          email: profile.email || '',
          fullName: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown User',
          profilePic: profile.profile_image_url || undefined,
          zoneId: zoneId,
          zoneName: zoneName || zoneDetails?.name || (zoneId ? `Zone ${zoneId}` : 'No zone assigned'),
          isOnline: false,
          lastSeen: new Date()
        }
      }
      
      return null
    } catch (error) {
      console.error('Error getting user:', error)
      return null
    }
  }

  // ==================== FRIEND SYSTEM ====================

  /**
   * Send friend request
   */
  static async sendFriendRequest(fromUserId: string, toUserId: string): Promise<boolean> {
    try {
      const fromUser = await this.getUser(fromUserId)
      const toUser = await this.getUser(toUserId)
      
      if (!fromUser || !toUser) return false

      const payload: any = {
        fromUserId,
        fromUserName: fromUser.fullName,
        toUserId,
        toUserName: toUser.fullName,
        status: 'pending',
        createdAt: serverTimestamp()
      }
      if (fromUser.profilePic) {
        payload.fromUserAvatar = fromUser.profilePic
      }

      await addDoc(collection(db, 'friend_requests'), payload)

      return true
    } catch (error) {
      console.error('Error sending friend request:', error)
      return false
    }
  }

  /**
   * Get friendship status between two users
   */
  static async getFriendStatus(userId: string, otherUserId: string): Promise<{ status: 'none' | 'pending_outgoing' | 'pending_incoming' | 'friends'; requestId?: string }> {
    try {
      const requestsRef = collection(db, 'friend_requests')
      
      const outgoingQuery = query(
        requestsRef,
        where('fromUserId', '==', userId),
        where('toUserId', '==', otherUserId)
      )
      const outgoingSnapshot = await getDocs(outgoingQuery)
      if (!outgoingSnapshot.empty) {
        const docSnap = outgoingSnapshot.docs[0]
        const status = docSnap.data().status
        return {
          status: status === 'accepted' ? 'friends' : 'pending_outgoing',
          requestId: docSnap.id
        }
      }

      const incomingQuery = query(
        requestsRef,
        where('fromUserId', '==', otherUserId),
        where('toUserId', '==', userId)
      )
      const incomingSnapshot = await getDocs(incomingQuery)
      if (!incomingSnapshot.empty) {
        const docSnap = incomingSnapshot.docs[0]
        const status = docSnap.data().status
        return {
          status: status === 'accepted' ? 'friends' : 'pending_incoming',
          requestId: docSnap.id
        }
      }

      return { status: 'none' }
    } catch (error) {
      console.error('Error checking friend status:', error)
      return { status: 'none' }
    }
  }

  /**
   * Accept friend request
   */
  static async acceptFriendRequest(requestId: string): Promise<boolean> {
    try {
      const requestRef = doc(db, 'friend_requests', requestId)
      await updateDoc(requestRef, {
        status: 'accepted'
      })
      return true
    } catch (error) {
      console.error('Error accepting friend request:', error)
      return false
    }
  }

  /**
   * Get friend requests for user
   */
  static async getFriendRequests(userId: string): Promise<FriendRequest[]> {
    try {
      const q = query(
        collection(db, 'friend_requests'),
        where('toUserId', '==', userId),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      )
      
      const snapshot = await getDocs(q)
      const requests: FriendRequest[] = []
      
      snapshot.forEach(doc => {
        requests.push({ id: doc.id, ...doc.data() } as FriendRequest)
      })
      
      return requests
    } catch (error) {
      console.error('Error getting friend requests:', error)
      return []
    }
  }

  // ==================== CHAT MANAGEMENT ====================

  /**
   * Create direct chat between two users
   */
  static async createDirectChat(user1Id: string, user2Id: string): Promise<string | null> {
    try {
      // CRITICAL: Prevent self-chat creation
      if (user1Id === user2Id) {
        console.error('❌ Cannot create self-chat:', user1Id)
        return null
      }
      
            const existingChat = await this.findDirectChat(user1Id, user2Id)
      if (existingChat) return existingChat.id

      // Get user names for participant mapping
      const user1 = await this.getUser(user1Id)
      const user2 = await this.getUser(user2Id)
      
      const participantNames: { [key: string]: string } = {}
      if (user1) participantNames[user1Id] = user1.fullName
      if (user2) participantNames[user2Id] = user2.fullName

      const chatData: Omit<Chat, 'id'> = {
        type: 'direct',
        participants: [user1Id, user2Id],
        participantNames,
        admins: [],
        createdBy: user1Id,
        createdAt: new Date(),
        unreadCount: { [user1Id]: 0, [user2Id]: 0 },
        isActive: true
      }

      const docRef = await addDoc(collection(db, 'chats'), chatData)
      return docRef.id
    } catch (error) {
      console.error('Error creating direct chat:', error)
      return null
    }
  }

  /**
   * Create group chat
   */
  static async createGroupChat(
    name: string, 
    description: string, 
    creatorId: string, 
    participantIds: string[]
  ): Promise<string | null> {
    try {
      const allParticipants = [creatorId, ...participantIds.filter(id => id !== creatorId)]
      const unreadCount: { [key: string]: number } = {}
      allParticipants.forEach(id => { unreadCount[id] = 0 })

      const chatData: Omit<Chat, 'id'> = {
        type: 'group',
        name,
        description,
        participants: allParticipants,
        admins: [creatorId],
        createdBy: creatorId,
        createdAt: new Date(),
        unreadCount,
        isActive: true
      }

      const docRef = await addDoc(collection(db, 'chats'), chatData)
      return docRef.id
    } catch (error) {
      console.error('Error creating group chat:', error)
      return null
    }
  }

  /**
   * Find existing direct chat between two users
   */
  static async findDirectChat(user1Id: string, user2Id: string): Promise<Chat | null> {
    try {
      const q = query(
        collection(db, 'chats'),
        where('type', '==', 'direct'),
        where('participants', 'array-contains', user1Id)
      )
      
      const snapshot = await getDocs(q)
      
      for (const doc of snapshot.docs) {
        const chat = { id: doc.id, ...doc.data() } as Chat
        if (chat.participants.includes(user2Id)) {
          return chat
        }
      }
      
      return null
    } catch (error) {
      console.error('Error finding direct chat:', error)
      return null
    }
  }

  /**
   * Get user's chats
   */
  static async getUserChats(userId: string): Promise<Chat[]> {
    try {
      const q = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', userId),
        where('isActive', '==', true)
      )
      
      const snapshot = await getDocs(q)
      const chats: Chat[] = []
      
      // Process each chat and populate participant names for direct chats
      for (const doc of snapshot.docs) {
        const chatData = { id: doc.id, ...doc.data() } as Chat
        
        // For direct chats, populate participant names if not already present
        if (chatData.type === 'direct' && !chatData.participantNames) {
          const participantNames: { [key: string]: string } = {}
          
          for (const participantId of chatData.participants) {
            if (participantId !== userId) {
              try {
                const userData = await this.getUser(participantId)
                if (userData) {
                  participantNames[participantId] = userData.fullName
                }
              } catch (error) {
                console.error('Error getting participant name:', error)
                participantNames[participantId] = 'Unknown User'
              }
            }
          }
          
          chatData.participantNames = participantNames
        }
        
        chats.push(chatData)
      }
      
      // Sort by last message timestamp
      return chats.sort((a, b) => {
        const aTime = a.lastMessage?.timestamp || a.createdAt
        const bTime = b.lastMessage?.timestamp || b.createdAt
        return new Date(bTime).getTime() - new Date(aTime).getTime()
      })
    } catch (error) {
      console.error('Error getting user chats:', error)
      return []
    }
  }

  // ==================== MESSAGE MANAGEMENT ====================

  /**
   * Send message
   */
  static async sendMessage(
    chatId: string, 
    senderId: string, 
    senderName: string,
    messageData: {
      text?: string
      image?: string
      fileUrl?: string
      fileName?: string
      replyTo?: {
        messageId: string
        senderName: string
        snippet: string
      }
    },
    isBoss: boolean = false
  ): Promise<boolean> {
    try {
      const messageType = messageData.image ? 'image' : 
                         messageData.fileUrl ? 'file' : 'text'

      // Add (Support) label to Boss user's name
      const displayName = isBoss ? `${senderName} (Support)` : senderName

      const message: Omit<ChatMessage, 'id'> = {
        chatId,
        senderId,
        senderName: displayName,
        messageType,
        timestamp: new Date(),
        edited: false,
        reactions: []
      }

      // Only add fields that have values (avoid undefined)
      if (messageData.text) message.text = messageData.text
      if (messageData.image) message.image = messageData.image
      if (messageData.fileUrl) message.fileUrl = messageData.fileUrl
      if (messageData.fileName) message.fileName = messageData.fileName
      if (messageData.replyTo) {
        message.replyTo = messageData.replyTo.messageId
        message.replySnippet = messageData.replyTo.snippet
        message.replySenderName = messageData.replyTo.senderName
      }

      // Add message
      await addDoc(collection(db, 'messages'), message)

            const chatRef = doc(db, 'chats', chatId)
      await updateDoc(chatRef, {
        lastMessage: {
          text: messageData.text || (messageData.image ? '📷 Image' : '📎 File'),
          senderId,
          senderName: displayName,
          timestamp: serverTimestamp()
        }
      })

      return true
    } catch (error) {
      console.error('Error sending message:', error)
      return false
    }
  }

  /**
   * Edit a message
   */
  static async editMessage(messageId: string, userId: string, newText: string): Promise<boolean> {
    try {
      const messageRef = doc(db, 'messages', messageId)
      const messageDoc = await getDoc(messageRef)
      if (!messageDoc.exists()) return false

      const data = messageDoc.data() as ChatMessage
      if (data.senderId !== userId || data.deleted) return false

      await updateDoc(messageRef, {
        text: newText,
        edited: true,
        editedAt: serverTimestamp()
      })

      return true
    } catch (error) {
      console.error('Error editing message:', error)
      return false
    }
  }

  /**
   * Delete a message (soft delete)
   */
  static async deleteMessage(messageId: string, userId: string): Promise<boolean> {
    try {
      const messageRef = doc(db, 'messages', messageId)
      const messageDoc = await getDoc(messageRef)
      if (!messageDoc.exists()) return false

      const data = messageDoc.data() as ChatMessage
      if (data.senderId !== userId || data.deleted) return false

      await updateDoc(messageRef, {
        text: 'This message was deleted',
        deleted: true,
        image: deleteField(),
        fileUrl: deleteField(),
        fileName: deleteField(),
        replyTo: deleteField(),
        replySnippet: deleteField(),
        replySenderName: deleteField(),
        edited: false
      })

      return true
    } catch (error) {
      console.error('Error deleting message:', error)
      return false
    }
  }

  /**
   * Toggle reaction (like) on a message
   */
  static async toggleReaction(messageId: string, userId: string, userName: string, emoji: string = '❤️'): Promise<void> {
    try {
      const messageRef = doc(db, 'messages', messageId)
      const messageDoc = await getDoc(messageRef)
      if (!messageDoc.exists()) return

      const data = messageDoc.data() as ChatMessage
      const reactions = Array.isArray(data.reactions) ? [...data.reactions] : []
      const existingIndex = reactions.findIndex(
        (reaction) => reaction.userId === userId && reaction.emoji === emoji
      )

      if (existingIndex >= 0) {
        reactions.splice(existingIndex, 1)
      } else {
        reactions.push({
          userId,
          userName,
          emoji,
          timestamp: new Date()
        })
      }

      await updateDoc(messageRef, {
        reactions
      })
    } catch (error) {
      console.error('Error toggling reaction:', error)
    }
  }

  /**
   * Get messages for a chat
   */
  static async getMessages(chatId: string, limitCount = 50): Promise<ChatMessage[]> {
    try {
      const q = query(
        collection(db, 'messages'),
        where('chatId', '==', chatId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      )
      
      const snapshot = await getDocs(q)
      const messages: ChatMessage[] = []
      
      snapshot.forEach(doc => {
        messages.push({ id: doc.id, ...doc.data() } as ChatMessage)
      })
      
      return messages.reverse() // Reverse to show oldest first
    } catch (error) {
      console.error('Error getting messages:', error)
      return []
    }
  }

  /**
   * Subscribe to real-time messages - OPTIMIZED: Limited to 100 most recent messages
   */
  static subscribeToMessages(chatId: string, callback: (messages: ChatMessage[]) => void): () => void {
    
    if (!chatId) {
      console.error('❌ [Chat] No chatId provided for message subscription')
      callback([])
      return () => {}
    }

    // Debug: Log the exact chatId being queried
    
    // Simple query without orderBy to avoid index requirement
    // We'll sort client-side instead
    const q = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId),
      limit(100)
    )
    
    // Also do a one-time fetch to debug
    getDocs(q).then(snapshot => {
      if (snapshot.docs.length === 0) {
        // Try fetching ALL messages to see what chatIds exist
        getDocs(query(collection(db, 'messages'), limit(10))).then(allSnapshot => {
          allSnapshot.docs.forEach(doc => {
            const data = doc.data()
          })
        })
      }
    }).catch(err => {
      console.error('🔍 [Chat] One-time fetch error:', err)
    })
    
    return onSnapshot(q, (snapshot) => {
        
        const messages: ChatMessage[] = []
        
        snapshot.docs.forEach(doc => {
          const data = doc.data()
          // Convert Firestore timestamp to Date
          let timestamp = data.timestamp
          if (timestamp?.toDate) {
            timestamp = timestamp.toDate()
          } else if (timestamp?.seconds) {
            timestamp = new Date(timestamp.seconds * 1000)
          } else if (typeof timestamp === 'string') {
            timestamp = new Date(timestamp)
          } else {
            timestamp = new Date()
          }
          
          messages.push({ 
            id: doc.id, 
            ...data,
            timestamp 
          } as ChatMessage)
        })
        
        // Sort by timestamp (oldest first) - client-side sorting
        messages.sort((a, b) => {
          const timeA = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp).getTime()
          const timeB = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp).getTime()
          return timeA - timeB
        })
        
        callback(messages)
      }, 
      (error) => {
        console.error('❌ [Chat] Message subscription error:', error)
        console.error('❌ [Chat] Error details:', error.message, error.code)
                if (error.message?.includes('index')) {
          console.error('🔧 [Chat] This error requires creating a Firestore composite index. Check the Firebase console.')
          console.error('🔧 [Chat] Create index: messages -> chatId (ASC) + timestamp (DESC)')
        }
        callback([])
      }
    )
  }

  /**
   * Subscribe to real-time chats - OPTIMIZED: Removed cache rejection to reduce reads
   */
  static subscribeToChats(userId: string, callback: (chats: Chat[]) => void): () => void {
    
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', userId),
      where('isActive', '==', true)
    )
    
    // OPTIMIZED: Accept cache to reduce reads, only fetch fresh when needed
    return onSnapshot(q, async (snapshot) => {
        const chats: Chat[] = []
        const selfChatsToDelete: string[] = []
        
        // Process each chat with STRICT filtering
        for (const doc of snapshot.docs) {
          const chatData = { id: doc.id, ...doc.data() } as Chat
          
          // FILTER 1: Direct chats only (groups are always valid)
          if (chatData.type === 'direct') {
            const [p1, p2] = chatData.participants
            
            // FILTER 2: Must have exactly 2 participants
            if (chatData.participants.length !== 2) {
              selfChatsToDelete.push(doc.id)
              continue
            }
            
            // FILTER 3: Both participants must be different people
            if (p1 === p2) {
              selfChatsToDelete.push(doc.id)
              continue
            }
            
            // FILTER 4: Current user should only appear ONCE
            const userCount = chatData.participants.filter(p => p === userId).length
            if (userCount !== 1) {
              selfChatsToDelete.push(doc.id)
              continue
            }
            
            // Populate participant names for UI
            if (!chatData.participantNames) {
              const otherUserId = chatData.participants.find(id => id !== userId)
              if (otherUserId) {
                try {
                  const userData = await this.getUser(otherUserId)
                  if (userData) {
                    chatData.participantNames = { [otherUserId]: userData.fullName }
                  }
                } catch (error) {
                  console.error('Error getting participant name:', error)
                  chatData.participantNames = { [otherUserId]: 'Unknown User' }
                }
              }
            }
          }
          
          // Chat passed all filters - add it
          chats.push(chatData)
        }
        
        // Clean up invalid chats in background
        if (selfChatsToDelete.length > 0) {
          selfChatsToDelete.forEach(async (chatId) => {
            try {
              await deleteDoc(doc(db, 'chats', chatId))
            } catch (error) {
              console.error('❌ [Firebase] Failed to delete chat:', chatId, error)
            }
          })
        }
        
        // Sort by last message time
        const sortedChats = [...chats].sort((a, b) => {
          const aTime = a.lastMessage?.timestamp || a.createdAt
          const bTime = b.lastMessage?.timestamp || b.createdAt
          const aTimeMs = formatTimestamp(aTime).getTime()
          const bTimeMs = formatTimestamp(bTime).getTime()
          return bTimeMs - aTimeMs
        })
        
        callback(sortedChats)
      },
      (error) => {
        console.error('❌ [Firebase] Chat subscription error:', error)
        callback([]) // Return empty array on error
      }
    )
  }

  // ==================== GROUP MANAGEMENT ====================

  /**
   * Add user to group
   */
  static async addUserToGroup(chatId: string, userId: string, adminId: string): Promise<boolean> {
    try {
      const chatRef = doc(db, 'chats', chatId)
      const chatDoc = await getDoc(chatRef)
      
      if (!chatDoc.exists()) return false
      
      const chat = chatDoc.data() as Chat
      
            if (!chat.admins.includes(adminId)) return false
      
      // Add user to participants
      await updateDoc(chatRef, {
        participants: arrayUnion(userId),
        [`unreadCount.${userId}`]: 0
      })

      return true
    } catch (error) {
      console.error('Error adding user to group:', error)
      return false
    }
  }

  /**
   * Remove user from group
   */
  static async removeUserFromGroup(chatId: string, userId: string, adminId: string): Promise<boolean> {
    try {
      const chatRef = doc(db, 'chats', chatId)
      const chatDoc = await getDoc(chatRef)
      
      if (!chatDoc.exists()) return false
      
      const chat = chatDoc.data() as Chat
      
            if (!chat.admins.includes(adminId)) return false
      
      // Remove user from participants and admins
      await updateDoc(chatRef, {
        participants: arrayRemove(userId),
        admins: arrayRemove(userId)
      })

      return true
    } catch (error) {
      console.error('Error removing user from group:', error)
      return false
    }
  }

  /**
   * Make user admin
   */
  static async makeUserAdmin(chatId: string, userId: string, adminId: string): Promise<boolean> {
    try {
      const chatRef = doc(db, 'chats', chatId)
      const chatDoc = await getDoc(chatRef)
      
      if (!chatDoc.exists()) return false
      
      const chat = chatDoc.data() as Chat
      
            if (!chat.admins.includes(adminId)) return false
      
      // Add user to admins
      await updateDoc(chatRef, {
        admins: arrayUnion(userId)
      })

      return true
    } catch (error) {
      console.error('Error making user admin:', error)
      return false
    }
  }

  /**
   * Update group info
   */
  static async updateGroupInfo(
    chatId: string, 
    adminId: string, 
    updates: { name?: string; description?: string; avatar?: string }
  ): Promise<boolean> {
    try {
      const chatRef = doc(db, 'chats', chatId)
      const chatDoc = await getDoc(chatRef)
      
      if (!chatDoc.exists()) return false
      
      const chat = chatDoc.data() as Chat
      
            if (!chat.admins.includes(adminId)) return false
      
      await updateDoc(chatRef, updates)
      return true
    } catch (error) {
      console.error('Error updating group info:', error)
      return false
    }
  }

  /**
   * Leave group (user removes themselves)
   */
  static async leaveGroup(chatId: string, userId: string): Promise<boolean> {
    try {
      const chatRef = doc(db, 'chats', chatId)
      const chatDoc = await getDoc(chatRef)
      
      if (!chatDoc.exists()) return false
      
      const chat = chatDoc.data() as Chat
      
            if (!chat.participants.includes(userId)) return false
      
      // Remove user from participants and admins (if they were an admin)
      await updateDoc(chatRef, {
        participants: arrayRemove(userId),
        admins: arrayRemove(userId)
      })

      return true
    } catch (error) {
      console.error('Error leaving group:', error)
      return false
    }
  }

  /**
   * Get detailed participant info for chats
   */
  static async getChatParticipants(chatId: string): Promise<ChatUser[]> {
    try {
      const chatRef = doc(db, 'chats', chatId)
      const chatDoc = await getDoc(chatRef)
      if (!chatDoc.exists()) return []

      const chat = chatDoc.data() as Chat
      const results: ChatUser[] = []

      for (const participantId of chat.participants) {
        const user = await this.getUser(participantId)
        if (user) {
          results.push(user)
        }
      }

      return results
    } catch (error) {
      console.error('Error getting chat participants:', error)
      return []
    }
  }

  /**
   * Delete a chat (archives it for the user)
   */
  static async deleteChat(chatId: string, userId: string): Promise<boolean> {
    try {
      const chatRef = doc(db, 'chats', chatId)
      const chatDoc = await getDoc(chatRef)
      
      if (!chatDoc.exists()) return false
      
      const chat = chatDoc.data() as Chat
      
            if (!chat.participants.includes(userId)) return false
      
      // For direct chats, remove user from participants (effectively deleting it for them)
      // For group chats, just mark as inactive for the user
      if (chat.type === 'direct') {
        await updateDoc(chatRef, {
          participants: arrayRemove(userId),
          [`unreadCount.${userId}`]: deleteField()
        })
      } else {
        // For groups, just remove from participants
        await updateDoc(chatRef, {
          participants: arrayRemove(userId),
          admins: arrayRemove(userId),
          [`unreadCount.${userId}`]: deleteField()
        })
      }

      return true
    } catch (error) {
      console.error('Error deleting chat:', error)
      return false
    }
  }

  /**
   * Pin or unpin a chat
   */
  static async togglePinChat(chatId: string, userId: string, pin: boolean): Promise<boolean> {
    try {
      const chatRef = doc(db, 'chats', chatId)
      const chatDoc = await getDoc(chatRef)
      
      if (!chatDoc.exists()) return false
      
      const chat = chatDoc.data() as Chat
      
            if (!chat.participants.includes(userId)) return false
      
      const pinned = chat.pinned || {}
      pinned[userId] = pin
      
      await updateDoc(chatRef, {
        pinned
      })

      return true
    } catch (error) {
      console.error('Error pinning/unpinning chat:', error)
      return false
    }
  }

  /**
   * Star or unstar a chat
   */
  static async toggleStarChat(chatId: string, userId: string, star: boolean): Promise<boolean> {
    try {
      const chatRef = doc(db, 'chats', chatId)
      const chatDoc = await getDoc(chatRef)
      
      if (!chatDoc.exists()) return false
      
      const chat = chatDoc.data() as Chat
      
            if (!chat.participants.includes(userId)) return false
      
      const starred = chat.starred || {}
      starred[userId] = star
      
      await updateDoc(chatRef, {
        starred
      })

      return true
    } catch (error) {
      console.error('Error starring/unstarring chat:', error)
      return false
    }
  }

  /**
   * Star or unstar a message
   */
  static async toggleStarMessage(messageId: string, userId: string): Promise<boolean> {
    try {
            const starredRef = collection(db, 'starred_messages')
      const starredQuery = query(
        starredRef,
        where('messageId', '==', messageId),
        where('userId', '==', userId)
      )
      const snapshot = await getDocs(starredQuery)
      
      if (!snapshot.empty) {
        // Unstar - delete the starred message document
        snapshot.docs.forEach(doc => {
          deleteDoc(doc.ref)
        })
        return true
      } else {
        // Star - create a starred message document
        await addDoc(starredRef, {
          messageId,
          userId,
          createdAt: serverTimestamp()
        })
        return true
      }
    } catch (error) {
      console.error('Error toggling star message:', error)
      return false
    }
  }

  /**
   * Check if a message is starred by a user
   */
  static async isMessageStarred(messageId: string, userId: string): Promise<boolean> {
    try {
      const starredRef = collection(db, 'starred_messages')
      const starredQuery = query(
        starredRef,
        where('messageId', '==', messageId),
        where('userId', '==', userId)
      )
      const snapshot = await getDocs(starredQuery)
      return !snapshot.empty
    } catch (error) {
      console.error('Error checking if message is starred:', error)
      return false
    }
  }

  /**
   * Search messages in a chat
   */
  static async searchMessages(chatId: string, searchTerm: string): Promise<ChatMessage[]> {
    try {
      if (!searchTerm.trim()) return []
      
      const messagesRef = collection(db, 'messages')
      const searchLower = searchTerm.toLowerCase().trim()
      
      // Try with orderBy first, fallback to without if index is missing
      let snapshot
      try {
        const messagesQuery = query(
          messagesRef,
          where('chatId', '==', chatId),
          orderBy('timestamp', 'desc')
        )
        snapshot = await getDocs(messagesQuery)
      } catch (error: any) {
        // If orderBy fails (likely missing index), try without it
        if (error.code === 'failed-precondition') {
          const messagesQuery = query(
            messagesRef,
            where('chatId', '==', chatId)
          )
          snapshot = await getDocs(messagesQuery)
        } else {
          throw error
        }
      }
      
      const results: ChatMessage[] = []
      
      snapshot.forEach(doc => {
        const data = doc.data()
        if (data.deleted) return // Skip deleted messages
        
        const messageText = (data.text || '').toLowerCase()
        const senderName = (data.senderName || '').toLowerCase()
        
        // Search in message text or sender name
        if (messageText.includes(searchLower) || senderName.includes(searchLower)) {
          results.push({
            ...data,
            id: doc.id,
            timestamp: formatTimestamp(data.timestamp),
            chatId: data.chatId,
            senderId: data.senderId,
            senderName: data.senderName,
            messageType: data.messageType || 'text',
            edited: data.edited || false,
            reactions: data.reactions || [],
            deleted: data.deleted || false
          } as ChatMessage)
        }
      })
      
      // Sort by timestamp descending (newest first) if we didn't use orderBy
      results.sort((a, b) => {
        const aTime = a.timestamp.getTime()
        const bTime = b.timestamp.getTime()
        return bTime - aTime
      })
      
      return results
    } catch (error) {
      console.error('Error searching messages:', error)
      return []
    }
  }
}



