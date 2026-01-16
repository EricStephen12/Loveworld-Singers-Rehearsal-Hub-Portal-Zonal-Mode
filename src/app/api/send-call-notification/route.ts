// app/api/send-call-notification/route.ts
// Server-side endpoint for sending voice call notifications

import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';

// Support both naming conventions for env vars
const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || process.env.NEXT_PUBLIC_FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY || process.env.NEXT_PUBLIC_FIREBASE_ADMIN_PRIVATE_KEY;
const databaseURL = process.env.FIREBASE_DATABASE_URL || process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || 'https://loveworld-singers-app-default-rtdb.firebaseio.com';

// Initialize Firebase Admin SDK
if (!admin.apps.length && projectId && clientEmail && privateKey) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
      databaseURL
    });
  } catch (error) {
    console.error('❌ Firebase Admin init error:', error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { receiverId, title, body, data } = await req.json();

    // Get user's FCM tokens (both web and mobile)
    const userTokens = await getUserFCMTokens(receiverId);
    
    if (userTokens.length === 0) {
      return NextResponse.json({ error: 'No FCM tokens found for user' }, { status: 404 });
    }

    // Determine the URL based on notification type
    // FCM requires absolute URLs for fcmOptions.link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lwsrhp.vercel.app';
    const isVoiceCall = data?.type === 'VOICE_CALL';
    const targetUrl = isVoiceCall 
      ? `${baseUrl}/pages/groups?call=${data?.callId}&action=answer`
      : `${baseUrl}/pages/notifications`;

    // Send notification to all user devices
        const stringifiedData: Record<string, string> = {};
    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        stringifiedData[key] = String(value);
      });
    }
    stringifiedData.timestamp = Date.now().toString();
    stringifiedData.url = targetUrl;

    const messages = userTokens.map(token => ({
      token,
      // Don't include notification field for web - let service worker handle it
      data: stringifiedData,
      android: {
        priority: 'high' as const,
        notification: {
          title,
          body,
          channelId: 'voice_calls',
          sound: 'default',
          clickAction: targetUrl
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
            alert: {
              title,
              body
            }
          }
        }
      },
      webpush: {
        notification: {
          title,
          body,
          icon: '/APP ICON/pwa_192_filled.png',
          badge: '/APP ICON/pwa_192_filled.png',
          requireInteraction: true,
          vibrate: [500, 200, 500],
          data: stringifiedData
        },
        fcmOptions: {
          link: targetUrl
        }
      }
    }));

    // Send notifications individually and track which tokens failed
    const sendPromises = messages.map((message, index) => 
      admin.messaging().send(message).then(
        (messageId) => ({ success: true as const, messageId, token: userTokens[index] }),
        (error) => ({ success: false as const, error, token: userTokens[index] })
      )
    );
    
    const results = await Promise.all(sendPromises);
    const successCount = results.filter(r => r.success).length;
    
    // Clean up invalid tokens (they cause "Requested entity was not found" errors)
    const invalidTokens = results
      .filter((r): r is { success: false; error: any; token: string } => !r.success && (
        r.error?.code === 'messaging/registration-token-not-registered' ||
        r.error?.message?.includes('not found') ||
        r.error?.message?.includes('not registered')
      ))
      .map(r => r.token);
    
    // Remove invalid tokens from database
    if (invalidTokens.length > 0) {
      try {
        const rtdb = admin.database();
        // Remove the entire token entry for this user if their token is invalid
        await rtdb.ref(`fcm_tokens/${receiverId}`).remove();
      } catch (cleanupError) {
        console.error('[CallNotification] Error cleaning up tokens:', cleanupError);
      }
    }
    
    // Log results for debugging
    results.forEach((result, index) => {
      if (!result.success) {
        console.error('[CallNotification] Failed to send to device', index, ':', (result as any).error?.message || (result as any).error);
      } else {
      }
    });
    
    
    return NextResponse.json({
      success: true,
      sentToDeviceCount: successCount,
      totalTokens: userTokens.length
    });

  } catch (error) {
    console.error('[CallNotification] Error:', error);
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}

// Helper function to get user's FCM tokens from Realtime Database
// Using Realtime DB instead of Firestore to avoid quota issues
async function getUserFCMTokens(userId: string): Promise<string[]> {
  try {
    if (!admin.apps.length) {
      console.error('[CallNotification] Firebase Admin not initialized');
      return [];
    }
    
    const tokens: string[] = [];
    
    // Use Realtime Database - separate quota from Firestore
    const rtdb = admin.database();
    const tokenSnapshot = await rtdb.ref(`fcm_tokens/${userId}`).once('value');
    
    if (tokenSnapshot.exists()) {
      const data = tokenSnapshot.val();
      if (data?.token) {
        tokens.push(data.token);
      }
      // Handle multiple tokens if stored as object
      if (typeof data === 'object' && !data.token) {
        Object.values(data).forEach((item: any) => {
          if (item?.token) tokens.push(item.token);
        });
      }
    }
    
    return tokens;
    
  } catch (error) {
    console.error('[CallNotification] Error getting tokens:', error);
    return [];
  }
}
