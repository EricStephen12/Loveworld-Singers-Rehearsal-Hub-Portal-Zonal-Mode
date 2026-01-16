import { NextRequest, NextResponse } from 'next/server'
import admin from 'firebase-admin'

// Support both naming conventions for env vars
const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || process.env.NEXT_PUBLIC_FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY || process.env.NEXT_PUBLIC_FIREBASE_ADMIN_PRIVATE_KEY;
const databaseURL = process.env.FIREBASE_DATABASE_URL || process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || 'https://loveworld-singers-app-default-rtdb.firebaseio.com';

// Initialize Firebase Admin SDK
try {
  if (!admin.apps.length && projectId && clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
      databaseURL
    });
  }
} catch (error) {
  console.error('❌ Firebase Admin init error:', error);
}

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid or empty request body' }, { status: 400 });
    }

    const { token, platform, userId } = body;

    if (!token) {
      return NextResponse.json({ error: 'FCM token is required' }, { status: 400 });
    }

    if (!admin.apps.length) {
      console.warn('⚠️ Firebase Admin not configured');
      return NextResponse.json({
        success: true,
        message: 'FCM token received (server storage disabled)'
      })
    }

    // Use Realtime Database instead of Firestore (separate quota, faster)
    const rtdb = admin.database();
    const userIdToUse = userId && userId !== 'anonymous' ? userId : `anon_${token.substring(0, 20)}`;

    await rtdb.ref(`fcm_tokens/${userIdToUse}`).set({
      token,
      platform: platform || 'web',
      userId: userIdToUse,
      updatedAt: Date.now()
    });


    return NextResponse.json({
      success: true,
      message: 'FCM token saved successfully'
    })

  } catch (error) {
    console.error('❌ Error saving FCM token:', error)
    return NextResponse.json({
      error: 'Failed to save FCM token',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: 'FCM token endpoint - use POST to save tokens' })
}
