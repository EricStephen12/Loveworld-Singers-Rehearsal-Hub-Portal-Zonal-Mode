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
  increment
} from 'firebase/firestore'
import { db } from '@/lib/firebase-setup'

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
   * Create or update user profile
   */
  static async createOrUpdateUser(userData: Partial<ChatUser>): Promise<void> {
    try {
      const userRef = doc(db, 'chat_users', userData.id!)
      await updateDoc(userRef, {
        ...userData,
        lastSeen: serverTimestamp()
      }).catch(async () => {
        // If document doesn't exist, create it
        await addDoc(collection(db, 'chat_users'), {
          ...userData,
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
      // First, get zone members from zone_members collection
      const zoneMembersRef = collection(db, 'zone_members')
      const zoneMembersQuery = query(zoneMembersRef, where('zoneId', '==', zoneId))
      const zoneMembersSnapshot = await getDocs(zoneMembersQuery)
      
      if (zoneMembersSnapshot.empty) {
        return []
      }
      
      // Get user IDs from zone members
      const userIds: string[] = []
      zoneMembersSnapshot.forEach(doc => {
        const member = doc.data()
        if (member.userId && member.userId !== currentUserId) {
          userIds.push(member.userId)
        }
      })
      
      if (userIds.length === 0) {
        return []
      }
      
      // Create users from zone members data (we already have the names)
      const users: ChatUser[] = []
      
      zoneMembersSnapshot.forEach(doc => {
        const member = doc.data()
        if (member.userId && member.userId !== currentUserId) {
          users.push({
            id: member.userId,
            email: member.userEmail || '',
            fullName: member.userName || 'Unknown User',
            profilePic: undefined, // We can fetch this later if needed
            zoneId: zoneId,
            zoneName: member.zoneName || 'Unknown Zone',
            isOnline: false,
            lastSeen: new Date()
          })
        }
      })
      
      // Sort by name
      users.sort((a, b) => a.fullName.localeCompare(b.fullName))
      
      return users
    } catch (error) {
      console.error('Error getting zone members:', error)
      return []
    }
  }

  /**
   * Search users by name or email within a zone (or all zones for Boss)
   */
  static async searchUsers(searchTerm: string, currentUserId: string, zoneId?: string, isBoss: boolean = false): Promise<ChatUser[]> {
    try {
      let allMembers: ChatUser[] = []
      
      // Boss can search across ALL zones
      if (isBoss) {
        console.log('👑 Boss search - fetching members from all zones')
        
        // Get all zone members from all zones
        const zoneMembersRef = collection(db, 'zone_members')
        const zoneMembersQuery = query(zoneMembersRef, where('userId', '!=', currentUserId))
        const zoneMembersSnapshot = await getDocs(zoneMembersQuery)
        
        allMembers = zoneMembersSnapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: data.userId,
            email: data.userEmail || '',
            fullName: data.userName || 'Unknown User',
            profilePic: undefined,
            zoneId: data.zoneId,
            zoneName: data.zoneName || 'Unknown Zone',
            isOnline: false,
            lastSeen: new Date()
          }
        })
      } else {
        // Regular users: search only within their zone
        if (!zoneId) return []
        allMembers = await this.getZoneMembers(zoneId, currentUserId)
      }
      
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
        return {
          id: userId,
          email: memberData.userEmail || '',
          fullName: memberData.userName || 'Unknown User',
          profilePic: undefined,
          zoneId: memberData.zoneId,
          zoneName: memberData.zoneName || 'Unknown Zone',
          isOnline: false,
          lastSeen: new Date()
        }
      }
      
      // Fallback to profiles collection
      const profileDoc = await getDoc(doc(db, 'profiles', userId))
      if (profileDoc.exists()) {
        const profile = profileDoc.data()
        return {
          id: userId,
          email: profile.email || '',
          fullName: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown User',
          profilePic: profile.profile_image_url || undefined,
          zoneId: profile.zone_id,
          zoneName: profile.zone_name || profile.zone,
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

      await addDoc(collection(db, 'friend_requests'), {
        fromUserId,
        fromUserName: fromUser.fullName,
        fromUserAvatar: fromUser.profilePic,
        toUserId,
        toUserName: toUser.fullName,
        status: 'pending',
        createdAt: serverTimestamp()
      })

      return true
    } catch (error) {
      console.error('Error sending friend request:', error)
      return false
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
      // Check if chat already exists
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

      // Add message
      await addDoc(collection(db, 'messages'), message)

      // Update chat's last message
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
   * Subscribe to real-time messages
   */
  static subscribeToMessages(chatId: string, callback: (messages: ChatMessage[]) => void): () => void {
    const q = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId)
    )
    
    return onSnapshot(q, (snapshot) => {
      const messages: ChatMessage[] = []
      
      // Process documents more efficiently
      snapshot.docs.forEach(doc => {
        messages.push({ id: doc.id, ...doc.data() } as ChatMessage)
      })
      
      // Sort messages by timestamp (newest last)
      messages.sort((a, b) => {
        const aTime = formatTimestamp(a.timestamp).getTime()
        const bTime = formatTimestamp(b.timestamp).getTime()
        return aTime - bTime
      })
      
      // Call callback immediately
      callback(messages)
    }, (error) => {
      console.error('Error in message subscription:', error)
      // Call callback with empty array on error to stop loading
      callback([])
    })
  }

  /**
   * Subscribe to real-time chats
   */
  static subscribeToChats(userId: string, callback: (chats: Chat[]) => void): () => void {
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', userId),
      where('isActive', '==', true)
    )
    
    return onSnapshot(q, async (snapshot) => {
      const chats: Chat[] = []
      
      // Process each chat
      for (const doc of snapshot.docs) {
        const chatData = { id: doc.id, ...doc.data() } as Chat
        
        // For direct chats without participant names, populate them
        if (chatData.type === 'direct' && !chatData.participantNames) {
          const otherParticipantId = chatData.participants.find(id => id !== userId)
          if (otherParticipantId) {
            try {
              const userData = await this.getUser(otherParticipantId)
              if (userData) {
                chatData.participantNames = { [otherParticipantId]: userData.fullName }
              }
            } catch (error) {
              console.error('Error getting participant name:', error)
              chatData.participantNames = { [otherParticipantId]: 'Unknown User' }
            }
          }
        }
        
        chats.push(chatData)
      }
      
      // Sort by last message timestamp (create new array to trigger React re-render)
      const sortedChats = [...chats].sort((a, b) => {
        const aTime = a.lastMessage?.timestamp || a.createdAt
        const bTime = b.lastMessage?.timestamp || b.createdAt
        
        // Handle different timestamp formats
        const aTimeMs = formatTimestamp(aTime).getTime()
        const bTimeMs = formatTimestamp(bTime).getTime()
        
        return bTimeMs - aTimeMs
      })
      
      callback(sortedChats)
    })
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
      
      // Check if user is admin
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
      
      // Check if user is admin
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
      
      // Check if user is admin
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
      
      // Check if user is admin
      if (!chat.admins.includes(adminId)) return false
      
      await updateDoc(chatRef, updates)
      return true
    } catch (error) {
      console.error('Error updating group info:', error)
      return false
    }
  }
}