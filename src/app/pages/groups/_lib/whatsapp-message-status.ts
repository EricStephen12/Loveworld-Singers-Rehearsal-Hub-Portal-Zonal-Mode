/**
 * WhatsApp-Style Message Status System
 * Handles the three-tier acknowledgment: sent → delivered → read
 */

import { 
  doc, 
  updateDoc, 
  onSnapshot, 
  serverTimestamp,
  collection,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore'
import { db } from '@/lib/firebase-setup'

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed'

export interface MessageStatusUpdate {
  messageId: string
  status: MessageStatus
  timestamp: Date
  userId?: string // For read receipts
}

export class WhatsAppMessageStatus {
  
  /**
   * Update message status (WhatsApp's acknowledgment system)
   */
  static async updateMessageStatus(
    messageId: string, 
    status: MessageStatus,
    userId?: string
  ): Promise<void> {
    try {
      const messageRef = doc(db, 'messages', messageId)
      
      const updateData: any = {
        status,
        [`statusTimestamps.${status}`]: serverTimestamp()
      }
      
      // For read status, track which user read it
      if (status === 'read' && userId) {
        updateData[`readBy.${userId}`] = serverTimestamp()
      }
      
      await updateDoc(messageRef, updateData)
    } catch (error) {
      console.error('❌ [WhatsApp Status] Failed to update status:', error)
    }
  }
  
  /**
   * Mark message as delivered when recipient comes online
   */
  static async markAsDelivered(messageId: string): Promise<void> {
    await this.updateMessageStatus(messageId, 'delivered')
  }
  
  /**
   * Mark message as read when user opens chat
   */
  static async markAsRead(messageId: string, userId: string): Promise<void> {
    await this.updateMessageStatus(messageId, 'read', userId)
  }
  
  /**
   * Mark all messages in chat as read (when user opens chat)
   */
  static async markChatAsRead(chatId: string, userId: string): Promise<void> {
    try {
      // Get unread messages in this chat
      const messagesRef = collection(db, 'messages')
      const unreadQuery = query(
        messagesRef,
        where('chatId', '==', chatId),
        where('status', 'in', ['sent', 'delivered']),
        orderBy('timestamp', 'desc'),
        limit(50) // Only mark recent messages as read
      )
      
      // Subscribe once to get messages
      const unsubscribe = onSnapshot(unreadQuery, async (snapshot) => {
        const batch: Promise<void>[] = []
        
        snapshot.docs.forEach(doc => {
          const data = doc.data()
          // Only mark as read if user is not the sender
          if (data.senderId !== userId) {
            batch.push(this.markAsRead(doc.id, userId))
          }
        })
        
        if (batch.length > 0) {
          await Promise.all(batch)
        }
        
        unsubscribe() // Only run once
      })
      
    } catch (error) {
      console.error('❌ [WhatsApp Status] Failed to mark chat as read:', error)
    }
  }
  
  /**
   * Subscribe to message status changes (for real-time status updates)
   */
  static subscribeToMessageStatus(
    messageId: string,
    callback: (status: MessageStatus) => void
  ): () => void {
    const messageRef = doc(db, 'messages', messageId)
    
    return onSnapshot(messageRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data()
        callback(data.status || 'sent')
      }
    })
  }
  
  /**
   * Get message status icon (like WhatsApp's checkmarks)
   */
  static getStatusIcon(status: MessageStatus): string {
    switch (status) {
      case 'sending':
        return '🕐' // Clock
      case 'sent':
        return '✓' // Single check
      case 'delivered':
        return '✓✓' // Double check (gray)
      case 'read':
        return '✓✓' // Double check (blue)
      case 'failed':
        return '❌' // Failed
      default:
        return '✓'
    }
  }
  
  /**
   * Get status color (like WhatsApp's blue for read)
   */
  static getStatusColor(status: MessageStatus): string {
    switch (status) {
      case 'sending':
        return 'text-gray-400'
      case 'sent':
        return 'text-gray-400'
      case 'delivered':
        return 'text-gray-400'
      case 'read':
        return 'text-blue-500' // WhatsApp blue
      case 'failed':
        return 'text-red-500'
      default:
        return 'text-gray-400'
    }
  }
}
