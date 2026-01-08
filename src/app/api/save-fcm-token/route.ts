import { NextRequest, NextResponse } from 'next/server'
import { collection, doc, setDoc, getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import app from '@/lib/firebase-setup'

const db = getFirestore(app)

export async function POST(request: NextRequest) {
  try {
    const { token, platform, userId } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'FCM token is required' }, { status: 400 })
    }

    // Save FCM token to Firestore
    const tokenRef = doc(collection(db, 'fcm_tokens'), token)
    await setDoc(tokenRef, {
      token,
      platform: platform || 'web',
      userId: userId || 'anonymous',
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString()
    })

    console.log(`✅ FCM token saved for ${platform}:`, token.substring(0, 20) + '...')

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
