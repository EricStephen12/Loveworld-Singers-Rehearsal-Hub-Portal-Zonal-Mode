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

  // Get FCM token for this browser
  async getToken(): Promise<string | null> {
    if (!this.messaging) return null;
    
    try {
      // VAPID key for web push notifications
      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
      
      if (!vapidKey) {
        console.warn('⚠️ VAPID key not found. Background notifications may not work.');
        return null;
      }

      const currentToken = await getToken(this.messaging, { 
        vapidKey: vapidKey 
      });
      
      if (currentToken) {
        this.token = currentToken;
        console.log('✅ FCM token received:', currentToken);
        this.saveTokenToServer(currentToken);
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
      await fetch('/api/save-fcm-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          platform: 'web'
        })
      });
      console.log('✅ FCM token saved to server');
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
    // Request permission on component mount
    webFCMService.requestPermission();
    
    // Listen for foreground messages
    webFCMService.onMessage((payload) => {
      // Forward to your existing notification system
      if (typeof window !== 'undefined' && (window as any).showPushNotification) {
        const { notification } = payload;
        (window as any).showPushNotification(
          notification?.title || 'Notification',
          notification?.body || '',
          `fcm-${Date.now()}`,
          notification?.data?.url || '/pages/notifications'
        );
      }
    });
  }, []);
}