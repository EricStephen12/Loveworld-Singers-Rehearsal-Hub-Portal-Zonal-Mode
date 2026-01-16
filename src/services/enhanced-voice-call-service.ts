// Enhanced voice call service with push notifications
// Industry-standard approach used by major communication apps

import { ref, set, push } from 'firebase/database';
import { isRealtimeDbAvailable, realtimeDb } from '@/lib/firebase-setup';

interface CallParams {
  chatId: string;
  receiverId: string;
  callerName: string;
  receiverName: string;
  callerAvatar?: string;
  receiverAvatar?: string;
  userId: string;
}

interface NotificationData {
  token: string;
  title: string;
  body: string;
  data: Record<string, any>;
}

interface CallData {
  id: string;
  callId?: string;
  chatId: string;
  callerId: string;
  receiverId: string;
  callerName: string;
  receiverName: string;
  status: string;
  startedAt: number;
  callerAvatar?: string;
  receiverAvatar?: string;
}

interface Payload {
  data: Record<string, any>;
  notification?: {
    title: string;
    body: string;
  };
}

class EnhancedVoiceCallService {
  static async startCallWithNotification(params: CallParams) {
    const {
      chatId,
      receiverId,
      callerName,
      receiverName,
      callerAvatar,
      receiverAvatar,
      userId
    } = params;

    try {
      // 1. Create call in Realtime Database (your existing logic)
      if (!realtimeDb) {
        console.error('[EnhancedVoiceCall] Realtime DB not available');
        return;
      }
      const callRef = push(ref(realtimeDb, `voice_calls/${receiverId}`));
      const callId = callRef.key;
      
      const callData = {
        id: callId,
        chatId,
        callerId: userId,
        callerName,
        receiverId,
        status: 'ringing',
        startedAt: Date.now(),
        // Add optional fields
        ...(receiverName && { receiverName }),
        ...(callerAvatar && { callerAvatar }),
        ...(receiverAvatar && { receiverAvatar })
      };

      // Store in both receiver's and caller's collections
      await set(callRef, callData);
      await set(ref(realtimeDb, `voice_calls/${userId}/${callId}`), callData);

      // 2. Send push notification to receiver (NEW)
      await this.sendCallNotification({
        receiverId,
        callerName,
        callId,
        type: 'voice_call_started'
      });

      return callData;

    } catch (error) {
      console.error('[EnhancedVoiceCall] Error starting call:', error);
      throw error;
    }
  }

  static async sendCallNotification(notificationData: { receiverId: string; callerName: string; callId: string; type?: string }) {
    const { receiverId, callerName, callId } = notificationData;
    
    try {
      // Option 1: Direct FCM via server (recommended for production)
      /*
      await fetch('/api/send-call-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId,
          title: "Incoming Call",
          body: `${callerName} is calling you`,
          data: {
            type: "VOICE_CALL",
            callId,
            callerName,
            action: "answer_decline"
          }
        })
      });
      */

      // Option 2: Client-side FCM (for testing)
      if (typeof window !== 'undefined' && (window as any).fcmBridge) {
        // Send via web FCM if available
        await (window as any).fcmBridge.sendNotification({
          to: receiverId,
          title: "Incoming Call",
          body: `${callerName} is calling you`,
          data: {
            type: "VOICE_CALL",
            callId,
            callerName
          }
        });
      }


    } catch (error) {
      console.error('[EnhancedVoiceCall] Error sending call notification:', error);
      // Don't fail the call if notification fails
    }
  }

  // Handle incoming call notifications
  static handleCallNotification(payload: Payload) {
    const { type, callId, callerName } = payload.data;
    
    if (type === 'VOICE_CALL') {
      // Show incoming call UI
      this.showIncomingCallUI({
        callId,
        callerName,
        callerAvatar: payload.data.callerAvatar
      });
      
      // Play ringtone
      this.playIncomingCallSound();
      
      // Set up timeout handler
      this.setupCallTimeout(callId);
    }
  }

  static showIncomingCallUI(callData: { callId: string; callerName: string; callerAvatar?: string }) {
    // This would integrate with your existing call UI
    
    // Dispatch custom event for your React components
    window.dispatchEvent(new CustomEvent('incomingVoiceCall', {
      detail: callData
    }));
  }

  static playIncomingCallSound() {
    // Your existing ringtone logic
    if (typeof window !== 'undefined' && window.AudioContext) {
      // Play your ringtone using existing Web Audio API code
    }
  }

  static setupCallTimeout(callId: string) {
        setTimeout(async () => {
      try {
      if (!realtimeDb) {
        console.error('[EnhancedVoiceCall] Realtime DB not available');
        return;
      }
        await set(ref(realtimeDb, `voice_calls/${callId}/status`), 'missed');
      } catch (error) {
        console.error('[EnhancedVoiceCall] Error timing out call:', error);
      }
    }, 30000); // 30 second timeout
  }
}

// Export for use in your existing voice-call-service.ts
export { EnhancedVoiceCallService };
