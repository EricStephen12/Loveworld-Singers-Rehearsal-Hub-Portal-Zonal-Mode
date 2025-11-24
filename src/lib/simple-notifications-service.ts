/**
 * SIMPLE NOTIFICATIONS SERVICE
 * 
 * Admin sends messages → All users see them
 * No automatic notifications, just manual messages
 * 
 * HQ AWARE:
 * - HQ groups use 'admin_messages' collection (unfiltered)
 * - Regular zones use 'zone_admin_messages' collection (filtered by zoneId)
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
 */
export async function getAllMessages(zoneId?: string): Promise<AdminMessage[]> {
  try {
    console.log('📖 [Messages] Getting all messages for zone:', zoneId);
    
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
    
    console.log(`✅ [Messages] Found ${messages.length} messages from ${collectionName}`);
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

