import { NextResponse } from 'next/server'
import * as admin from 'firebase-admin'

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  try {
    const privateKey = process.env.NEXT_PUBLIC_FIREBASE_ADMIN_PRIVATE_KEY
      ? process.env.NEXT_PUBLIC_FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.NEXT_PUBLIC_FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey,
      }),
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    })
  } catch (error) {
    console.error('Firebase Admin initialization error:', error)
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action, email, storedKingschatId, verifiedKingschatId, newPassword } = body

    if (action !== 'reset') {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
    }

    if (!email || !newPassword) {
      return NextResponse.json({ success: false, error: 'Email and new password are required' }, { status: 400 })
    }

    if (!storedKingschatId || !verifiedKingschatId || storedKingschatId !== verifiedKingschatId) {
      return NextResponse.json({ success: false, error: 'KingsChat verification failed or mismatched' }, { status: 400 })
    }

    const auth = admin.auth()

    try {
      // Find the user by email in Firebase Auth
      const userRecord = await auth.getUserByEmail(email)

      // Update the user's password
      await auth.updateUser(userRecord.uid, {
        password: newPassword,
      })

      return NextResponse.json({ success: true })
    } catch (authError: any) {
      console.error('Firebase Admin Auth error:', authError)
      if (authError.code === 'auth/user-not-found') {
        return NextResponse.json({ success: false, error: 'No Firebase Auth account found for this email' }, { status: 404 })
      }
      return NextResponse.json({ success: false, error: authError.message || 'Failed to update password in Firebase Auth' }, { status: 500 })
    }
  } catch (error: any) {
    console.error('Reset password API error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error during password reset' }, { status: 500 })
  }
}
