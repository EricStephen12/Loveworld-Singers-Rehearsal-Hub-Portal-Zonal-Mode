// Call Signaling Service using Firebase Realtime Database
// This enables WebRTC video and voice calls to work

import { FirebaseDatabaseService } from './firebase-database'

export interface CallSignal {
  id: string
  from: string
  to: string
  type: 'offer' | 'answer' | 'ice-candidate' | 'call-end'
  data: any
  timestamp: string
  read: boolean
}

export class CallSignalingService {
  private static instance: CallSignalingService
  private listeners: Map<string, () => void> = new Map()

  static getInstance(): CallSignalingService {
    if (!CallSignalingService.instance) {
      CallSignalingService.instance = new CallSignalingService()
    }
    return CallSignalingService.instance
  }

  // Send call offer
  async sendOffer(targetUserId: string, offer: RTCSessionDescriptionInit, callType: 'video' | 'voice'): Promise<boolean> {
    try {
      const signalId = `offer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      await FirebaseDatabaseService.createDocument('call_signals', signalId, {
        from: this.getCurrentUserId(),
        to: targetUserId,
        type: 'offer',
        callType,
        data: offer,
        timestamp: new Date().toISOString(),
        read: false
      })

      console.log('📞 Call offer sent:', signalId)
      return true
    } catch (error) {
      console.error('❌ Error sending offer:', error)
      return false
    }
  }

  // Send call answer
  async sendAnswer(targetUserId: string, answer: RTCSessionDescriptionInit): Promise<boolean> {
    try {
      const signalId = `answer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      await FirebaseDatabaseService.createDocument('call_signals', signalId, {
        from: this.getCurrentUserId(),
        to: targetUserId,
        type: 'answer',
        data: answer,
        timestamp: new Date().toISOString(),
        read: false
      })

      console.log('📞 Call answer sent:', signalId)
      return true
    } catch (error) {
      console.error('❌ Error sending answer:', error)
      return false
    }
  }

  // Send ICE candidate
  async sendIceCandidate(targetUserId: string, candidate: RTCIceCandidate): Promise<boolean> {
    try {
      const signalId = `ice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      await FirebaseDatabaseService.createDocument('call_signals', signalId, {
        from: this.getCurrentUserId(),
        to: targetUserId,
        type: 'ice-candidate',
        data: candidate.toJSON(),
        timestamp: new Date().toISOString(),
        read: false
      })

      console.log('📞 ICE candidate sent')
      return true
    } catch (error) {
      console.error('❌ Error sending ICE candidate:', error)
      return false
    }
  }

  // Send call end signal
  async sendCallEnd(targetUserId: string): Promise<boolean> {
    try {
      const signalId = `end_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      await FirebaseDatabaseService.createDocument('call_signals', signalId, {
        from: this.getCurrentUserId(),
        to: targetUserId,
        type: 'call-end',
        data: null,
        timestamp: new Date().toISOString(),
        read: false
      })

      console.log('📞 Call end signal sent')
      return true
    } catch (error) {
      console.error('❌ Error sending call end:', error)
      return false
    }
  }

  // Listen for incoming signals
  async listenForSignals(
    onOffer: (signal: CallSignal) => void,
    onAnswer: (signal: CallSignal) => void,
    onIceCandidate: (signal: CallSignal) => void,
    onCallEnd: (signal: CallSignal) => void
  ): Promise<void> {
    const userId = this.getCurrentUserId()
    if (!userId) return

    // Poll for new signals every 2 seconds
    const listenerId = `listener_${userId}`
    
    const pollSignals = async () => {
      try {
        // Get unread signals for this user
        const signals = await FirebaseDatabaseService.getCollectionWhere(
          'call_signals',
          'to',
          '==',
          userId
        )

        if (!signals || signals.length === 0) return

        // Process each signal
        for (const signal of (signals as unknown as CallSignal[])) {
          if (signal.read) continue

          // Mark as read
          await FirebaseDatabaseService.updateDocument('call_signals', signal.id, {
            read: true
          })

          // Handle signal based on type
          switch (signal.type) {
            case 'offer':
              console.log('📞 Received call offer from:', signal.from)
              onOffer(signal)
              break
            case 'answer':
              console.log('📞 Received call answer from:', signal.from)
              onAnswer(signal)
              break
            case 'ice-candidate':
              console.log('📞 Received ICE candidate from:', signal.from)
              onIceCandidate(signal)
              break
            case 'call-end':
              console.log('📞 Call ended by:', signal.from)
              onCallEnd(signal)
              break
          }
        }
      } catch (error) {
        console.error('❌ Error polling signals:', error)
      }
    }

    // Start polling
    const interval = setInterval(pollSignals, 2000)
    
    // Store cleanup function
    this.listeners.set(listenerId, () => {
      clearInterval(interval)
    })

    // Initial poll
    pollSignals()
  }

  // Stop listening for signals
  stopListening(userId?: string): void {
    const listenerId = `listener_${userId || this.getCurrentUserId()}`
    const cleanup = this.listeners.get(listenerId)
    
    if (cleanup) {
      cleanup()
      this.listeners.delete(listenerId)
      console.log('📞 Stopped listening for call signals')
    }
  }

  // Clean up old signals (call this periodically)
  async cleanupOldSignals(): Promise<void> {
    try {
      const signals = await FirebaseDatabaseService.getCollection('call_signals')
      const now = new Date().getTime()
      const oneHourAgo = now - (60 * 60 * 1000)

      for (const signal of (signals as unknown as CallSignal[])) {
        const signalTime = new Date(signal.timestamp).getTime()
        
        // Delete signals older than 1 hour
        if (signalTime < oneHourAgo) {
          await FirebaseDatabaseService.deleteDocument('call_signals', signal.id)
        }
      }

      console.log('🧹 Cleaned up old call signals')
    } catch (error) {
      console.error('❌ Error cleaning up signals:', error)
    }
  }

  // Get current user ID (you'll need to implement this based on your auth)
  private getCurrentUserId(): string {
    // This should get the current user ID from your auth context
    // For now, return a placeholder
    if (typeof window !== 'undefined') {
      const user = (window as any).currentUser
      return user?.uid || ''
    }
    return ''
  }
}

// Export singleton instance
export const callSignalingService = CallSignalingService.getInstance()


