// app/api/send-call-notification/route.ts
// Server-side endpoint for sending voice call notifications

import { NextRequest, NextResponse } from 'next/server';
import { admin, rtdb } from '@/lib/firebase-admin';

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

    // Relative URL for data.url (so client SW resolves it to its own origin)
    const relativeUrl = isVoiceCall
      ? `/pages/groups?call=${data?.callId}&action=answer`
      : `/pages/notifications`;

    // Absolute URL for fcmOptions (required by spec)
    const targetUrl = `${baseUrl}${relativeUrl}`;

    // Send notification to all user devices
    const stringifiedData: Record<string, string> = {};
    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        stringifiedData[key] = String(value);
      });
    }
    stringifiedData.timestamp = Date.now().toString();
    // Use relative URL for our custom data payload
    stringifiedData.url = relativeUrl;

    const messages = userTokens.map(token => ({
      token,
      data: stringifiedData,
      android: {
        priority: 'high' as const,
        notification: {
          title,
          body,
          icon: data?.senderAvatar || undefined,
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
            alert: { title, body },
            'mutable-content': 1
          }
        },
        fcm_options: {
          image: data?.senderAvatar
        }
      },
      webpush: {
        notification: {
          title,
          body,
          icon: data?.senderAvatar || '/APP ICON/pwa_192_filled.png',
          badge: '/APP ICON/pwa_192_filled.png',
          requireInteraction: true,
          vibrate: [500, 200, 500],
          data: stringifiedData,
          actions: [
            { action: 'answer', title: 'Answer' },
            { action: 'decline', title: 'Decline' }
          ]
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
    const tokens: string[] = [];

    // Use Realtime Database - separate quota from Firestore
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
