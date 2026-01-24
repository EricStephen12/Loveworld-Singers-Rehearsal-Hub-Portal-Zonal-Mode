/**
 * WhatsApp-Style Presence System
 * Manages online/offline status and last seen timestamps
 */

import { ref, onValue, set, onDisconnect, serverTimestamp } from 'firebase/database'
import { getDatabase, Database } from 'firebase/database'
import { FirebaseApp } from 'firebase/app'
import app from '@/lib/firebase-setup'

// Initialize Realtime Database safely
let rtdb: Database | null = null
try {
  rtdb = getDatabase(app as FirebaseApp)
} catch (error) {
  console.warn('⚠️ Firebase Realtime Database not configured. Presence features will be disabled.')
  console.warn('To enable presence, add a Realtime Database to your Firebase project.')
}

export interface PresenceData {
  status: 'online' | 'offline'
  lastSeen: number
  userId: string
}

export class WhatsAppPresence {
  private static presenceRefs = new Map<string, any>()
  
  /**
   * Initialize presence for a user (like WhatsApp's connection)
   */
  static async initializePresence(userId: string): Promise<void> {
    if (!rtdb) {
      console.warn('⚠️ [WhatsApp Presence] Realtime Database not available, skipping presence initialization')
      return
    }
    
    try {
      const presenceRef = ref(rtdb, `presence/${userId}`)
      
      // Set user as online
      await set(presenceRef, {
        status: 'online',
        lastSeen: serverTimestamp(),
        userId
      })
      
      // Set offline when disconnected (WhatsApp's approach)
      onDisconnect(presenceRef).set({
        status: 'offline',
        lastSeen: serverTimestamp(),
        userId
      })
      
      this.presenceRefs.set(userId, presenceRef)
    } catch (error) {
      console.error('❌ [WhatsApp Presence] Failed to initialize:', error)
    }
  }
  
  /**
   * Update user status manually
   */
  static async updateStatus(userId: string, status: 'online' | 'offline'): Promise<void> {
    if (!rtdb) return
    
    try {
      const presenceRef = ref(rtdb, `presence/${userId}`)
      await set(presenceRef, {
        status,
        lastSeen: serverTimestamp(),
        userId
      })
    } catch (error) {
      console.error('❌ [WhatsApp Presence] Failed to update status:', error)
    }
  }
  
  /**
   * Subscribe to presence changes for multiple users
   */
  static subscribeToPresence(
    userIds: string[], 
    callback: (presenceMap: Map<string, PresenceData>) => void
  ): () => void {
    if (!rtdb) {
      // Return empty presence data if Realtime Database isn't available
      const emptyPresenceMap = new Map<string, PresenceData>()
      userIds.forEach(userId => {
        emptyPresenceMap.set(userId, {
          status: 'offline',
          lastSeen: Date.now(),
          userId
        })
      })
      callback(emptyPresenceMap)
      return () => {} // Return empty cleanup function
    }
    
    const presenceMap = new Map<string, PresenceData>()
    const unsubscribers: (() => void)[] = []
    
    userIds.forEach(userId => {
      const presenceRef = ref(rtdb, `presence/${userId}`)
      
      const unsubscribe = onValue(presenceRef, (snapshot) => {
        const data = snapshot.val()
        if (data) {
          presenceMap.set(userId, {
            status: data.status || 'offline',
            lastSeen: data.lastSeen || Date.now(),
            userId
          })
        } else {
          presenceMap.set(userId, {
            status: 'offline',
            lastSeen: Date.now(),
            userId
          })
        }
        
        callback(new Map(presenceMap))
      })
      
      unsubscribers.push(unsubscribe)
    })
    
    return () => {
      unsubscribers.forEach(unsub => unsub())
    }
  }
  
  /**
   * Get single user presence
   */
  static async getUserPresence(userId: string): Promise<PresenceData> {
    if (!rtdb) {
      return {
        status: 'offline',
        lastSeen: Date.now(),
        userId
      }
    }
    
    try {
      const presenceRef = ref(rtdb, `presence/${userId}`)
      return new Promise((resolve) => {
        onValue(presenceRef, (snapshot) => {
          const data = snapshot.val()
          resolve({
            status: data?.status || 'offline',
            lastSeen: data?.lastSeen || Date.now(),
            userId
          })
        }, { onlyOnce: true })
      })
    } catch (error) {
      console.error('❌ [WhatsApp Presence] Failed to get presence:', error)
      return {
        status: 'offline',
        lastSeen: Date.now(),
        userId
      }
    }
  }
  
  /**
   * Cleanup presence on logout
   */
  static async cleanup(userId: string): Promise<void> {
    if (!rtdb) return
    
    try {
      await this.updateStatus(userId, 'offline')
      this.presenceRefs.delete(userId)
    } catch (error) {
      console.error('❌ [WhatsApp Presence] Cleanup failed:', error)
    }
  }
}
