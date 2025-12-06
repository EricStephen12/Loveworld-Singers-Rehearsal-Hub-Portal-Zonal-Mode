/**
 * SIMPLE NOTIFICATIONS SERVICE
 * 
 * Admin sends messages → All users see them
 * No automatic notifications, just manual messages
 * 
 * HQ AWARE:
 * - HQ groups use 'admin_messages' collection (unfiltered)
 * - Regular zones use 'zone_admin_messages' collection (filtered by zoneId)
 * 
 * CACHING:
 * - Messages are cached in memory with a 2-minute TTL
 * - Cache is invalidated when sending/deleting messages
 */

import { db } from './firebase-setup';
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  where,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { isHQGroup } from '@/config/zones';

// Cache configuration
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes
interface CacheEntry {
  data: AdminMessage[];
  timestamp: number;
}
const messagesCache = new Map<string, CacheEntry>();

// Helper to get cache key
function getCacheKey(zoneId?: string): string {
  return `messages_${zoneId || 'default'}`;
}

// Helper to check if cache is valid
function isCacheValid(entry: CacheEntry | undefined): boolean {
  if (!entry) return false;
  return Date.now() - entry.timestamp < CACHE_TTL;
}

// Invalidate cache for a zone
function invalidateCache(zoneId?: string): void {
  const key = getCacheKey(zoneId);
  messagesCache.delete(key);
  console.log('🗑️ [Messages] Cache invalidated for:', key);
}

// Helper to get correct collection name based on zone
function getMessagesCollectionName(zoneId?: string): string {
  if (zoneId && isHQGroup(zoneId)) {
    console.log('🏢 Using HQ messages collection: admin_messages');
    return 'admin_messages';
  }
  console.log('📍 Using zone messages collection: zone_admin_messages');
  return 'zone_admin_messages';
}

export interface AdminMessage {
  id: string;
  title: string;
  message: string;
  sentBy: string; // Admin username
  sentAt: string;
  createdAt: string;
}

/**
 * Send message to all users in a zone
 */
export async function sendMessageToAllUsers(
  title: string,
  message: string,
  adminUsername: string,
  zoneId?: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    console.log('📤 [Messages] Sending message to all users in zone:', zoneId);
    
    const collectionName = getMessagesCollectionName(zoneId);
    
    const messageData = {
      title: title.trim(),
      message: message.trim(),
      sentBy: adminUsername,
      sentAt: new Date().toISOString(),
      zoneId: zoneId || '', // Add zoneId for regular zones
      createdAt: serverTimestamp()
    };
    
    const messagesRef = collection(db, collectionName);
    const docRef = await addDoc(messagesRef, messageData);
    
    console.log('✅ [Messages] Message sent with ID:', docRef.id, 'to collection:', collectionName);
    
    // Invalidate cache so next fetch gets fresh data
    invalidateCache(zoneId);
    
    return {
      success: true,
      id: docRef.id
    };
  } catch (error) {
    console.error('❌ [Messages] Error sending message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send message'
    };
  }
}

/**
 * Get all messages for a zone (for users and admins)
 * Uses in-memory cache with 2-minute TTL
 */
export async function getAllMessages(zoneId?: string, forceRefresh = false): Promise<AdminMessage[]> {
  try {
    const cacheKey = getCacheKey(zoneId);
    
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = messagesCache.get(cacheKey);
      if (isCacheValid(cached)) {
        console.log('📦 [Messages] Returning cached messages for zone:', zoneId, `(${cached!.data.length} items)`);
        return cached!.data;
      }
    }
    
    console.log('📖 [Messages] Fetching fresh messages for zone:', zoneId);
    
    const collectionName = getMessagesCollectionName(zoneId);
    const messagesRef = collection(db, collectionName);
    
    // Build query based on zone type
    let q;
    if (zoneId && !isHQGroup(zoneId)) {
      // Regular zone: filter by zoneId
      console.log('📍 Filtering messages by zoneId:', zoneId);
      q = query(
        messagesRef,
        where('zoneId', '==', zoneId),
        orderBy('createdAt', 'desc')
      );
    } else {
      // HQ group: no filter (see all)
      console.log('🏢 Loading all messages (HQ)');
      q = query(messagesRef, orderBy('createdAt', 'desc'));
    }
    
    const snapshot = await getDocs(q);
    
    const messages = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
        sentAt: data.sentAt || new Date().toISOString(),
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
      };
    }) as AdminMessage[];
    
    // Update cache
    messagesCache.set(cacheKey, {
      data: messages,
      timestamp: Date.now()
    });
    
    console.log(`✅ [Messages] Found ${messages.length} messages from ${collectionName} (cached)`);
    return messages;
  } catch (error) {
    console.error('❌ [Messages] Error getting messages:', error);
    return [];
  }
}

/**
 * Delete message (admin only)
 */
export async function deleteMessage(messageId: string, zoneId?: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🗑️ [Messages] Deleting message:', messageId, 'from zone:', zoneId);
    
    const collectionName = getMessagesCollectionName(zoneId);
    const messageRef = doc(db, collectionName, messageId);
    await deleteDoc(messageRef);
    
    console.log('✅ [Messages] Message deleted successfully from', collectionName);
    
    // Invalidate cache so next fetch gets fresh data
    invalidateCache(zoneId);
    
    return {
      success: true
    };
  } catch (error) {
    console.error('❌ [Messages] Error deleting message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete message'
    };
  }
}

