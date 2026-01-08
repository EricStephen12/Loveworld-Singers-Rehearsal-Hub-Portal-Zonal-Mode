// pages/api/send-call-notification.ts
// Server-side endpoint for sending voice call notifications

import { NextApiRequest, NextApiResponse } from 'next';
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { receiverId, title, body, data } = req.body;

    // Get user's FCM tokens (both web and mobile)
    const userTokens = await getUserFCMTokens(receiverId);
    
    if (userTokens.length === 0) {
      return res.status(404).json({ error: 'No FCM tokens found for user' });
    }

    // Send notification to all user devices
    const messages = userTokens.map(token => ({
      token,
      notification: {
        title,
        body,
      },
      data: {
        ...data,
        timestamp: Date.now().toString(),
      },
      android: {
        priority: 'high' as const,
        notification: {
          channelId: 'voice_calls',
          sound: 'ringtone',
          vibrationPattern: [500, 500, 500],
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'ringtone.caf',
            badge: 1,
          }
        }
      },
      webpush: {
        headers: {
          link: '/pages/groups'
        }
      }
    }));

    // Send notifications individually (compatible with older Firebase Admin versions)
    const sendPromises = messages.map(message => 
      admin.messaging().send(message)
    );
    
    const results = await Promise.allSettled(sendPromises);
    const successCount = results.filter(result => result.status === 'fulfilled').length;
    
    console.log('[CallNotification] Successfully sent to', successCount, 'devices');
    
    res.status(200).json({
      success: true,
      sentToDeviceCount: successCount,
      totalTokens: userTokens.length
    });

  } catch (error) {
    console.error('[CallNotification] Error:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
}

// Helper function to get user's FCM tokens from your database
async function getUserFCMTokens(userId: string): Promise<string[]> {
  try {
    // Query your database for user's FCM tokens
    // This could be Firestore, Realtime DB, or your own database
    
    // Example with Firestore:
    /*
    const tokensSnapshot = await admin.firestore()
      .collection('user_fcm_tokens')
      .where('userId', '==', userId)
      .get();
    
    return tokensSnapshot.docs.map(doc => doc.data().token);
    */
    
    // For now, return empty array - you'll implement this based on your DB structure
    return [];
    
  } catch (error) {
    console.error('[CallNotification] Error getting tokens:', error);
    return [];
  }
}