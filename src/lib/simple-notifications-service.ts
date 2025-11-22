/**
 * SIMPLE NOTIFICATIONS SERVICE
 * 
 * Admin sends messages → All users see them
 * No automatic notifications, just manual messages
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
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

const COLLECTION_NAME = 'admin_messages';

export interface AdminMessage {
  id: string;
  title: string;
  message: string;
  sentBy: string; // Admin username
  sentAt: string;
  createdAt: string;
}

/**
 * Send message to all users
 */
export async function sendMessageToAllUsers(
  title: string,
  message: string,
  adminUsername: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    console.log('📤 [Messages] Sending message to all users...');
    
    const messageData = {
      title: title.trim(),
      message: message.trim(),
      sentBy: adminUsername,
      sentAt: new Date().toISOString(),
      createdAt: serverTimestamp()
    };
    
    const messagesRef = collection(db, COLLECTION_NAME);
    const docRef = await addDoc(messagesRef, messageData);
    
    console.log('✅ [Messages] Message sent with ID:', docRef.id);
    
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
 * Get all messages (for users)
 */
export async function getAllMessages(): Promise<AdminMessage[]> {
  try {
    console.log('📖 [Messages] Getting all messages...');
    
    const messagesRef = collection(db, COLLECTION_NAME);
    const q = query(messagesRef, orderBy('createdAt', 'desc'));
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
    
    console.log(`✅ [Messages] Found ${messages.length} messages`);
    return messages;
  } catch (error) {
    console.error('❌ [Messages] Error getting messages:', error);
    return [];
  }
}

/**
 * Delete message (admin only)
 */
export async function deleteMessage(messageId: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🗑️ [Messages] Deleting message:', messageId);
    
    const messageRef = doc(db, COLLECTION_NAME, messageId);
    await deleteDoc(messageRef);
    
    console.log('✅ [Messages] Message deleted successfully');
    
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

