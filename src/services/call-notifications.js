// Simple call notification handler - integrates with existing system

// Handle incoming call notifications
export function handleIncomingCallNotification(payload) {
  const { type, callId, callerName, callerAvatar } = payload.data;
  
  if (type === 'VOICE_CALL') {
    console.log('[CallNotification] Incoming call detected:', { callId, callerName });
    
    // Dispatch event for React components
    window.dispatchEvent(new CustomEvent('incomingVoiceCall', {
      detail: {
        callId,
        callerName,
        callerAvatar,
        timestamp: Date.now()
      }
    }));
    
    // Your existing ringtone will play automatically
    console.log('[CallNotification] Ringtone should play now');
  }
}

// Initialize listeners
export function initializeCallNotifications() {
  // This will be called from your main app component
  console.log('[CallNotification] Initialized call notification handler');
}

// Export default
export default {
  handleIncomingCallNotification,
  initializeCallNotifications
};