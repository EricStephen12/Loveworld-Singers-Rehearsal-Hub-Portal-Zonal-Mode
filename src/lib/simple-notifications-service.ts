import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  where,
  serverTimestamp
} from 'firebase/firestore'

import { db } from './firebase-setup'
import { isHQGroup } from '@/config/zones'

const CACHE_TTL = 2 * 60 * 1000

interface CacheEntry {
  data: AdminMessage[]
  timestamp: number
}

const messagesCache = new Map<string, CacheEntry>()

function getCacheKey(zoneId?: string): string {
  return `messages_${zoneId || 'default'}`
}

function isCacheValid(entry: CacheEntry | undefined): boolean {
  if (!entry) return false
  return Date.now() - entry.timestamp < CACHE_TTL
}

function invalidateCache(zoneId?: string): void {
  messagesCache.delete(getCacheKey(zoneId))
}

function getMessagesCollectionName(zoneId?: string): string {
  return (zoneId && isHQGroup(zoneId)) ? 'admin_messages' : 'zone_admin_messages'
}

export interface AdminMessage {
  id: string
  title: string
  message: string
  sentBy: string
  sentAt: string
  createdAt: string
}

export async function sendMessageToAllUsers(
  title: string,
  message: string,
  adminUsername: string,
  zoneId?: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const collectionName = getMessagesCollectionName(zoneId)
    
    const messageData = {
      title: title.trim(),
      message: message.trim(),
      sentBy: adminUsername,
      sentAt: new Date().toISOString(),
      zoneId: zoneId || '',
      createdAt: serverTimestamp()
    }
    
    const messagesRef = collection(db, collectionName)
    const docRef = await addDoc(messagesRef, messageData)
    invalidateCache(zoneId)
    
    return { success: true, id: docRef.id }
  } catch (error) {
    console.error('Error sending message:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to send message' }
  }
}

export async function getAllMessages(zoneId?: string, forceRefresh = false): Promise<AdminMessage[]> {
  try {
    const cacheKey = getCacheKey(zoneId)
    
    if (!forceRefresh) {
      const cached = messagesCache.get(cacheKey)
      if (isCacheValid(cached)) {
        return cached!.data
      }
    }
    
    const collectionName = getMessagesCollectionName(zoneId)
    const messagesRef = collection(db, collectionName)
    
    const q = (zoneId && !isHQGroup(zoneId))
      ? query(messagesRef, where('zoneId', '==', zoneId), orderBy('createdAt', 'desc'))
      : query(messagesRef, orderBy('createdAt', 'desc'))
    
    const snapshot = await getDocs(q)
    
    const messages = snapshot.docs.map((docSnap) => {
      const data = docSnap.data()
      return {
        ...data,
        id: docSnap.id,
        sentAt: data.sentAt || new Date().toISOString(),
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
      }
    }) as AdminMessage[]
    
    messagesCache.set(cacheKey, { data: messages, timestamp: Date.now() })
    
    return messages
  } catch (error) {
    console.error('Error getting messages:', error)
    return []
  }
}

export async function deleteMessage(
  messageId: string, 
  zoneId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const collectionName = getMessagesCollectionName(zoneId)
    const messageRef = doc(db, collectionName, messageId)
    await deleteDoc(messageRef)
    invalidateCache(zoneId)
    
    return { success: true }
  } catch (error) {
    console.error('Error deleting message:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete message' }
  }
}
