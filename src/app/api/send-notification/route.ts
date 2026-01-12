// app/api/send-notification/route.ts
// Unified server-side endpoint for sending push notifications
// Supports: chat, audiolab, calendar, song, media, zone, call

import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';

// Notification types
type NotificationType = 'chat' | 'audiolab' | 'calendar' | 'song' | 'media' | 'zone' | 'call';

interface NotificationRequest {
  type: NotificationType;
  recipientIds: string[];
  title: string;
  body: string;
  data?: Record<string, string | undefined>;
  excludeUserId?: string;
}

// Support both naming conventions for env vars
const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || process.env.NEXT_PUBLIC_FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY || process.env.NEXT_PUBLIC_FIREBASE_ADMIN_PRIVATE_KEY;
const databaseURL = process.env.FIREBASE_DATABASE_URL || process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || 'https://loveworld-singers-app-default-rtdb.firebaseio.com';

// Initialize Firebase Admin SDK (singleton)
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
    console.log('✅ Firebase Admin initialized for unified notifications');
  } catch (error) {
    console.error('❌ Firebase Admin init error:', error);
  }
}

// Get URL for notification type
function getNotificationUrl(type: NotificationType, data?: Record<string, string | undefined>): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lwsrhp.vercel.app';
  
  switch (type) {
    case 'chat':
      return data?.chatId ? `${baseUrl}/pages/groups?chat=${data.chatId}` : `${baseUrl}/pages/groups`;
    case 'audiolab':
      return data?.projectId ? `${baseUrl}/pages/audiolab?project=${data.projectId}` : `${baseUrl}/pages/audiolab`;
    case 'calendar':
      return `${baseUrl}/pages/calendar`;
    case 'song':
      return `${baseUrl}/pages/submit-song`;
    case 'media':
      return `${baseUrl}/pages/media`;
    case 'zone':
      return `${baseUrl}/pages/notifications`;
    case 'call':
      return data?.callId ? `${baseUrl}/pages/groups?call=${data.callId}&action=answer` : `${baseUrl}/pages/groups`;
    default:
      return `${baseUrl}/pages/notifications`;
  }
}

// Get notification tag (prevents duplicates)
function getNotificationTag(type: NotificationType, data?: Record<string, string | undefined>): string {
  switch (type) {
    case 'chat':
      return `chat-${data?.chatId || Date.now()}`;
    case 'audiolab':
      return `audiolab-${data?.projectId || Date.now()}`;
    case 'calendar':
      return `calendar-${data?.eventId || Date.now()}`;
    case 'song':
      return `song-${data?.songId || Date.now()}`;
    case 'media':
      return `media-${Date.now()}`;
    case 'zone':
      return `zone-${data?.messageId || Date.now()}`;
    case 'call':
      return `call-${data?.callId || Date.now()}`;
    default:
      return `notification-${Date.now()}`;
  }
}

// Get Android channel ID
function getAndroidChannel(type: NotificationType): string {
  switch (type) {
    case 'call':
      return 'voice_calls';
    case 'chat':
      return 'chat_messages';
    default:
      return 'default';
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: NotificationRequest = await req.json();
    const { type, recipientIds, title, body: notifBody, data, excludeUserId } = body;

    // Validate required fields
    if (!type || !recipientIds || !title || !notifBody) {
      return NextResponse.json({ 
        error: 'Missing required fields: type, recipientIds, title, body' 
      }, { status: 400 });
    }

    // Validate notification type
    const validTypes: NotificationType[] = ['chat', 'audiolab', 'calendar', 'song', 'media', 'zone', 'call'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ 
        error: `Invalid notification type. Must be one of: ${validTypes.join(', ')}` 
      }, { status: 400 });
    }

    // Filter out excluded user
    const filteredRecipients = excludeUserId 
      ? recipientIds.filter(id => id !== excludeUserId)
      : recipientIds;

    if (filteredRecipients.length === 0) {
      return NextResponse.json({ 
        success: true, 
        sentCount: 0, 
        failedCount: 0,
        message: 'No recipients after filtering'
      });
    }

    // Get FCM tokens for all recipients
    const allTokens: { userId: string; token: string }[] = [];
    for (const userId of filteredRecipients) {
      const tokens = await getUserFCMTokens(userId);
      tokens.forEach(token => allTokens.push({ userId, token }));
    }

    if (allTokens.length === 0) {
      console.log('[Notification] No FCM tokens found for any recipient');
      return NextResponse.json({ 
        success: true, 
        sentCount: 0, 
        failedCount: 0,
        message: 'No FCM tokens found for recipients'
      });
    }

    // Build notification URL and tag
    const targetUrl = getNotificationUrl(type, data);
    const tag = getNotificationTag(type, data);
    const channelId = getAndroidChannel(type);

    // Stringify data for FCM (all values must be strings)
    const stringifiedData: Record<string, string> = { type };
    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          stringifiedData[key] = String(value);
        }
      });
    }
    stringifiedData.timestamp = Date.now().toString();
    stringifiedData.url = targetUrl;
    stringifiedData.tag = tag;

    // Determine if high priority (calls, chats)
    const isHighPriority = type === 'call' || type === 'chat';

    // Build FCM messages
    const messages = allTokens.map(({ token }) => ({
      token,
      data: stringifiedData,
      android: {
        priority: (isHighPriority ? 'high' : 'normal') as 'high' | 'normal',
        notification: {
          title,
          body: notifBody,
          channelId,
          sound: 'default',
          clickAction: targetUrl
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
            alert: { title, body: notifBody }
          }
        }
      },
      webpush: {
        notification: {
          title,
          body: notifBody,
          icon: '/APP ICON/pwa_192_filled.png',
          badge: '/APP ICON/pwa_192_filled.png',
          tag,
          requireInteraction: type === 'call',
          vibrate: type === 'call' ? [500, 200, 500] : [200, 100, 200],
          data: stringifiedData
        },
        fcmOptions: {
          link: targetUrl
        }
      }
    }));

    // Send notifications (batch for efficiency)
    const sendPromises = messages.map((message, index) =>
      admin.messaging().send(message).then(
        (messageId) => ({ success: true as const, messageId, ...allTokens[index] }),
        (error) => ({ success: false as const, error, ...allTokens[index] })
      )
    );

    const results = await Promise.all(sendPromises);
    const successCount = results.filter(r => r.success).length;
    const failedCount = results.filter(r => !r.success).length;

    // Clean up invalid tokens
    const invalidResults = results.filter((r): r is { success: false; error: any; userId: string; token: string } => 
      !r.success && (
        (r as any).error?.code === 'messaging/registration-token-not-registered' ||
        (r as any).error?.message?.includes('not found') ||
        (r as any).error?.message?.includes('not registered')
      )
    );

    if (invalidResults.length > 0) {
      console.log('[Notification] Cleaning up', invalidResults.length, 'invalid tokens');
      const rtdb = admin.database();
      for (const result of invalidResults) {
        try {
          await rtdb.ref(`fcm_tokens/${result.userId}`).remove();
          console.log('[Notification] Removed invalid token for user:', result.userId);
        } catch (cleanupError) {
          console.error('[Notification] Error cleaning up token:', cleanupError);
        }
      }
    }

    // Log results
    console.log(`[Notification] Type: ${type}, Sent: ${successCount}/${allTokens.length}`);
    results.filter(r => !r.success).forEach((r) => {
      console.error(`[Notification] Failed to send to ${r.userId}:`, (r as any).error?.message || (r as any).error);
    });

    return NextResponse.json({
      success: true,
      sentCount: successCount,
      failedCount,
      totalRecipients: filteredRecipients.length,
      totalTokens: allTokens.length
    });

  } catch (error) {
    console.error('[Notification] Error:', error);
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}

// Helper function to get user's FCM tokens from Realtime Database
async function getUserFCMTokens(userId: string): Promise<string[]> {
  try {
    if (!admin.apps.length) {
      console.error('[Notification] Firebase Admin not initialized');
      return [];
    }

    const tokens: string[] = [];
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
    console.error('[Notification] Error getting tokens for user', userId, ':', error);
    return [];
  }
}
