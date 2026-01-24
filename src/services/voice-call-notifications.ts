// Simple integration with your existing voice call system
// This adds push notifications to your current Realtime DB approach

interface CallParams {
  chatId: string;
  receiverId: string;
  callerName: string;
  receiverName: string;
  callerAvatar?: string;
  receiverAvatar?: string;
  userId: string;
}

interface CallNotificationData {
  receiverId: string;
  callerName: string;
  callId: string;
}

interface Payload {
  data: Record<string, any>;
  notification?: {
    title: string;
    body: string;
  };
}

export async function startCallWithNotification(callParams: CallParams) {
  const { 
    chatId, 
    receiverId, 
    callerName, 
    receiverName,
    callerAvatar,
    receiverAvatar,
    userId 
  } = callParams;

  try {
        // This is exactly what your current startCall function does
    const callData = await createVoiceCallInDB({
      chatId,
      receiverId,
      callerName,
      receiverName,
      callerAvatar,
      receiverAvatar,
      userId
    });

        await sendCallPushNotification({
      receiverId,
      callerName,
      callId: callData.id
    });

    return callData;

  } catch (error) {
    console.error('[VoiceCall] Error starting call:', error);
    throw error;
  }
}

// Your existing Realtime DB call creation (extracted from your current code)
async function createVoiceCallInDB(params: CallParams) {
  // This replicates your existing voice-call-service.ts logic
  // Import your actual Firebase refs and functions
  
  // Example implementation:
  /*
  const callRef = push(ref(realtimeDb, `voice_calls/${params.receiverId}`));
  const callId = callRef.key;
  
  const callData = {
    id: callId,
    chatId: params.chatId,
    callerId: params.userId,
    callerName: params.callerName,
    receiverId: params.receiverId,
    status: 'ringing',
    startedAt: Date.now(),
    ...(params.callerAvatar && { callerAvatar: params.callerAvatar }),
    ...(params.receiverName && { receiverName: params.receiverName }),
    ...(params.receiverAvatar && { receiverAvatar: params.receiverAvatar })
  };

  // Store in both locations
  await set(callRef, callData);
  await set(ref(realtimeDb, `voice_calls/${params.userId}/${callId}`), callData);
  
  return callData;
  */
  
  // For now, return mock data - you'll replace with your actual implementation
  return {
    id: 'mock-call-id-' + Date.now(),
    status: 'ringing'
  };
}

// Send push notification via your server API
async function sendCallPushNotification(notificationData: CallNotificationData) {
  try {
    const response = await fetch('/api/send-call-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        receiverId: notificationData.receiverId,
        title: "Incoming Call",
        body: `${notificationData.callerName} is calling you`,
        data: {
          type: "VOICE_CALL",
          callId: notificationData.callId,
          callerName: notificationData.callerName,
          action: "answer_decline"
        }
      })
    });

    const result = await response.json();
    
  } catch (error) {
    console.error('[VoiceCall] Failed to send notification:', error);
    // Don't fail the call if notification fails
  }
}

// Handle incoming call notifications in your app
export function handleIncomingCallNotification(payload: Payload) {
  const { type, callId, callerName } = payload.data;
  
  if (type === 'VOICE_CALL') {
    // Trigger your existing call UI
    window.dispatchEvent(new CustomEvent('incomingVoiceCall', {
      detail: {
        callId,
        callerName,
        callerAvatar: payload.data.callerAvatar
      }
    }));
    
    // Play your existing ringtone
    playIncomingCallSound();
  }
}

function playIncomingCallSound() {
  // Use your existing Web Audio API ringtone code
}
