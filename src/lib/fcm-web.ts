'use client'

// Firebase Web FCM Integration
// Uses existing Firebase app from firebase-setup.ts
import { getMessaging, getToken, onMessage } from 'firebase/messaging'
import { useEffect } from 'react'
import app from '@/lib/firebase-setup'

// Initialize Firebase Messaging using existing app
const messaging = typeof window !== 'undefined' ? getMessaging(app) : null;

// Simple FCM service that integrates with existing notification system
class WebFCMService {
  private static instance: WebFCMService;
  private messaging: any;
  private token: string | null = null;

  private constructor() {
    this.messaging = messaging;
  }

  static getInstance(): WebFCMService {
    if (!WebFCMService.instance) {
      WebFCMService.instance = new WebFCMService();
    }
    return WebFCMService.instance;
  }

  // Get FCM token for this browser - ALWAYS refresh to keep token valid
  async getToken(forceRefresh: boolean = false): Promise<string | null> {
    if (!this.messaging) return null;
    
    try {
      // VAPID key for web push notifications
      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
      
      if (!vapidKey) {
        console.warn('⚠️ VAPID key not found. Background notifications may not work.');
        return null;
      }

      // Register the Firebase messaging service worker explicitly
      let swRegistration: ServiceWorkerRegistration | undefined;
      if ('serviceWorker' in navigator) {
        try {
          swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
            scope: '/'
          });
          console.log('✅ Firebase messaging SW registered:', swRegistration.scope);
        } catch (swError) {
          console.error('❌ SW registration failed:', swError);
        }
      }

      const currentToken = await getToken(this.messaging, { 
        vapidKey: vapidKey,
        serviceWorkerRegistration: swRegistration
      });
      
      if (currentToken) {
        // Always save token - this keeps it fresh in the database
        // Even if token is same, updatedAt timestamp will be refreshed
        const tokenChanged = this.token !== currentToken;
        this.token = currentToken;
        
        if (tokenChanged || forceRefresh) {
          console.log('✅ FCM token received (new/refreshed):', currentToken.substring(0, 20) + '...');
        }
        
        // Always save to server to keep token fresh
        await this.saveTokenToServer(currentToken);
        return currentToken;
      } else {
        console.log('❌ No registration token available. Request permission to generate one.');
        return null;
      }
    } catch (err) {
      console.error('❌ An error occurred while retrieving token:', err);
      return null;
    }
  }

  // Request notification permission
  async requestPermission(): Promise<boolean> {
    if (typeof Notification === 'undefined') {
      console.log('❌ This browser does not support notifications');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      console.log('🔔 Notification permission status:', permission);
      
      if (permission === 'granted') {
        await this.getToken();
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Error requesting notification permission:', error);
      return false;
    }
  }

  // Listen for foreground messages
  onMessage(callback: (payload: any) => void) {
    if (!this.messaging) return;
    
    onMessage(this.messaging, (payload) => {
      console.log('📥 Message received in foreground:', payload);
      callback(payload);
    });
  }

  // Save token to your server/backend
  private async saveTokenToServer(token: string) {
    try {
      // Try to get userId from multiple sources
      let userId = 'anonymous';
      if (typeof window !== 'undefined') {
        // Try Firebase Auth first
        const { getAuth } = await import('firebase/auth');
        const auth = getAuth();
        if (auth.currentUser?.uid) {
          userId = auth.currentUser.uid;
        } else {
          // Fallback to localStorage
          userId = localStorage.getItem('userId') || 
                   localStorage.getItem('kingschatUserId') || 
                   'anonymous';
        }
      }
      
      console.log('🔑 [FCM] Saving token for userId:', userId);
      
      const response = await fetch('/api/save-fcm-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          platform: 'web',
          userId: userId
        })
      });
      
      const result = await response.json();
      console.log('✅ FCM token saved to server for user:', userId, result);
    } catch (error) {
      console.error('❌ Error saving token to server:', error);
    }
  }

  // Get current token
  getCurrentToken(): string | null {
    return this.token;
  }
}

// Export singleton instance
export const webFCMService = WebFCMService.getInstance();

// React hook for easy integration
export function useWebFCM() {
  useEffect(() => {
    const initFCM = async () => {
      console.log('🚀 [FCM] Starting initialization...');
      console.log('🔑 [FCM] VAPID key exists:', !!process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY);
      
      try {
        const result = await webFCMService.requestPermission();
        console.log('🔔 [FCM] Permission result:', result);
      } catch (error) {
        console.error('❌ [FCM] Init error:', error);
      }
    };
    
    initFCM();
    
    // Refresh token every 30 minutes to keep it valid (like big apps do)
    const tokenRefreshInterval = setInterval(async () => {
      console.log('🔄 [FCM] Periodic token refresh...');
      try {
        await webFCMService.getToken(true);
      } catch (e) {
        console.log('⚠️ [FCM] Token refresh failed:', e);
      }
    }, 30 * 60 * 1000); // 30 minutes
    
    // Also refresh when page becomes visible (user returns to tab)
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        console.log('👁️ [FCM] Page visible, refreshing token...');
        try {
          await webFCMService.getToken(true);
        } catch (e) {
          console.log('⚠️ [FCM] Visibility token refresh failed:', e);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Listen for foreground messages
    webFCMService.onMessage((payload) => {
      console.log('📥 [FCM] Foreground message:', payload);
      
      const { notification, data } = payload;
      const isVoiceCall = data?.type === 'VOICE_CALL';
      
      // Handle voice call notifications specially
      if (isVoiceCall) {
        console.log('📞 [FCM] Incoming call notification:', data);
        
        // Dispatch event for the call UI to handle
        window.dispatchEvent(new CustomEvent('incomingVoiceCall', {
          detail: {
            callId: data.callId,
            callerName: data.callerName,
            callerAvatar: data.callerAvatar,
            timestamp: Date.now()
          }
        }));
        
        // Also show browser notification for calls (even in foreground)
        if (Notification.permission === 'granted') {
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then((registration) => {
              registration.showNotification(`📞 ${data.callerName || 'Someone'} is calling`, {
                body: 'Tap to answer',
                icon: data.callerAvatar || '/APP ICON/pwa_192_filled.png',
                badge: '/APP ICON/pwa_192_filled.png',
                tag: `call-${data.callId}`,
                requireInteraction: true,
                vibrate: [500, 200, 500, 200, 500],
                data: { 
                  type: 'VOICE_CALL',
                  callId: data.callId,
                  callerName: data.callerName,
                  url: `/pages/groups?call=${data.callId}`
                },
                actions: [
                  { action: 'answer', title: '✅ Answer' },
                  { action: 'decline', title: '❌ Decline' }
                ]
              } as NotificationOptions);
            });
          }
        }
        return;
      }
      
      // Show notification for regular messages
      if (Notification.permission === 'granted') {
        const title = notification?.title || data?.title || 'Notification';
        const body = notification?.body || data?.body || '';
        
        // Use service worker notification for better reliability
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification(title, {
              body,
              icon: '/APP ICON/pwa_192_filled.png',
              badge: '/APP ICON/pwa_192_filled.png',
              tag: `fcm-${Date.now()}`,
              data: { url: data?.url || notification?.click_action || '/pages/notifications' },
              requireInteraction: false
            });
          }).catch((e) => {
            console.log('📥 [FCM] SW notification failed, using fallback:', e);
            // Fallback to native Notification
            new Notification(title, {
              body,
              icon: '/APP ICON/pwa_192_filled.png',
              tag: `fcm-${Date.now()}`
            });
          });
        } else {
          // Direct notification fallback
          new Notification(title, {
            body,
            icon: '/APP ICON/pwa_192_filled.png',
            tag: `fcm-${Date.now()}`
          });
        }
      }
      
      // Also forward to existing notification system if available
      if (typeof window !== 'undefined' && (window as any).showPushNotification) {
        (window as any).showPushNotification(
          notification?.title || 'Notification',
          notification?.body || '',
          `fcm-${Date.now()}`,
          data?.url || '/pages/notifications'
        );
      }
    });
    
    // Cleanup
    return () => {
      clearInterval(tokenRefreshInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
}