// Enhanced Call notification handler for incoming voice call notifications
// Integrates with your existing PushNotificationListener and voice call system

interface CallPayload {
  data: {
    type: string;
    callId: string;
    callerName: string;
    callerAvatar?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

interface CallEventData {
  callId: string;
  callerName: string;
  callerAvatar?: string;
  timestamp: number;
  payload: CallPayload;
}

export class CallNotificationHandler {
  private static isInitialized = false;
  private static isActive = true;
  
  static handleIncomingCall(payload: CallPayload) {
    const { type, callId, callerName, callerAvatar } = payload.data;
    
    if (type === 'VOICE_CALL' && this.isActive) {
      
      const eventData: CallEventData = {
        callId,
        callerName,
        callerAvatar,
        timestamp: Date.now(),
        payload
      };
      
      // Dispatch custom event for your React components to handle
      window.dispatchEvent(new CustomEvent<CallEventData>('incomingVoiceCall', {
        detail: eventData
      }));
      
      // Play your existing ringtone
      this.playIncomingCallSound(eventData);
      
      // Optional: Show browser notification if app is not focused
      this.showBrowserNotification(eventData);
      
      // Return success for logging/debugging
      return true;
    }
    
    return false;
  }
  
  static playIncomingCallSound(eventData: CallEventData) {
    // Trigger your existing Web Audio API ringtone
    if (typeof window !== 'undefined' && window.AudioContext) {
      
      // Dispatch additional event that your ringtone system can listen for
      window.dispatchEvent(new CustomEvent<CallEventData>('playCallRingtone', {
        detail: eventData
      }));
      
      // Fallback: if your existing system doesn't catch the event, play default sound
      this.playDefaultRingtone();
    }
  }
  
  private static playDefaultRingtone() {
    try {
      // Simple beep as fallback
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 1);
      
    } catch (error) {
      console.warn('[CallNotification] Could not play default ringtone:', error);
    }
  }
  
  static showBrowserNotification(eventData: CallEventData) {
    // Show browser notification if document is not focused
    if (typeof document !== 'undefined' && document.visibilityState !== 'visible' && this.isActive) {
      if ('Notification' in window) {
        // Request permission if not granted
        if (Notification.permission === 'default') {
          Notification.requestPermission();
        }
        
        if (Notification.permission === 'granted') {
          const notificationOptions: NotificationOptions = {
            body: `${eventData.callerName} is calling you`,
            icon: eventData.callerAvatar || '/APP ICON/pwa_192_filled.png',
            tag: 'incoming-call',
            requireInteraction: true
          };
          
          const notification = new Notification('Incoming Call', notificationOptions);
          
          // Handle notification click
          notification.onclick = () => {
            window.focus();
            // Dispatch event to bring call interface to foreground
            window.dispatchEvent(new CustomEvent('acceptCallFromNotification', {
              detail: eventData
            }));
            notification.close();
          };
          
          // Auto-close after 30 seconds if not clicked
          setTimeout(() => {
            if (notification) notification.close();
          }, 30000);
          
        }
      }
    }
  }
  
  // Enhanced initialization with better error handling
  static initialize() {
    if (this.isInitialized) {
      return;
    }
    
    if (typeof window === 'undefined') {
      return;
    }
    
    try {
      // Listen for messages from your existing PushNotificationListener
      
      // Firebase messaging foreground messages
      if ((window as any).firebase && (window as any).firebase.messaging) {
        (window as any).firebase.messaging().onMessage((payload: CallPayload) => {
          if (payload.data?.type === 'VOICE_CALL') {
            this.handleIncomingCall(payload);
          }
        });
      }
      
      // Custom events from native shell (Android WebView)
      const handleMessage = (event: MessageEvent) => {
        if (event.data?.type === 'NATIVE_PUSH' && 
            event.data?.data?.type === 'VOICE_CALL') {
          this.handleIncomingCall(event.data);
        }
      };
      
      window.addEventListener('message', handleMessage);
      
      // Listen for internal app events
      const handleAppStateChange = (event: Event) => {
        const customEvent = event as CustomEvent;
        const state = customEvent.detail?.state;
        if (state === 'background' || state === 'inactive') {
          this.isActive = false;
        } else if (state === 'foreground' || state === 'active') {
          this.isActive = true;
        }
      };
      
      window.addEventListener('appStateChanged', handleAppStateChange as EventListener);
      
      // Cleanup function
      (window as any).cleanupCallNotifications = () => {
        window.removeEventListener('message', handleMessage);
        this.isInitialized = false;
        this.isActive = false;
      };
      
      this.isInitialized = true;
      this.isActive = true;
      
    } catch (error) {
      console.error('[CallNotification] Initialization failed:', error);
    }
  }
}

// Enhanced exports and utilities
export class CallNotificationUtils {
  static pause() {
    CallNotificationHandler['isActive'] = false;
  }
  
  static resume() {
    CallNotificationHandler['isActive'] = true;
  }
  
  static isEnabled(): boolean {
    return CallNotificationHandler['isActive'];
  }
  
  static isInitialized(): boolean {
    return CallNotificationHandler['isInitialized'];
  }
}

// Auto-initialize when module loads (but allow manual control)
if (typeof window !== 'undefined') {
  // Small delay to ensure DOM is ready
  setTimeout(() => {
    CallNotificationHandler.initialize();
  }, 100);
}

// Export for use in other components
export default CallNotificationHandler;
