// API Route for Password Reset (In-App)
// Uses Firebase Admin SDK to reset password
// Lookup is done client-side, only password update uses Admin SDK

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const { email, newPassword, storedKingschatId, verifiedKingschatId, action } = await request.json()

    // Action: reset - Reset password after KingsChat verification (done client-side)
    if (action === 'reset') {
      if (!email || !newPassword) {
        return NextResponse.json({
          success: false,
          error: 'Email and new password are required'
        }, { status: 400 })
      }

      if (!storedKingschatId || !verifiedKingschatId) {
        return NextResponse.json({
          success: false,
          error: 'KingsChat verification is required'
        }, { status: 400 })
      }

      // Verify KingsChat IDs match (client sends both for server verification)
      if (storedKingschatId !== verifiedKingschatId) {
        return NextResponse.json({
          success: false,
          error: 'KingsChat verification failed. The accounts do not match.'
        }, { status: 401 })
      }

      if (newPassword.length < 6) {
        return NextResponse.json({
          success: false,
          error: 'Password must be at least 6 characters'
        }, { status: 400 })
      }

      try {
        // Get Firebase Auth user by email
        const userRecord = await auth.getUserByEmail(email.toLowerCase())

        await auth.updateUser(userRecord.uid, {
          password: newPassword
        })

        return NextResponse.json({
          success: true,
          message: 'Password reset successfully'
        })

      } catch (adminError: any) {
        console.error('Firebase Admin error:', adminError)

        if (adminError.code === 'auth/user-not-found') {
          return NextResponse.json({
            success: false,
            error: 'No account found with this email'
          }, { status: 404 })
        }

        if (adminError.message?.includes('FIREBASE_SERVICE_ACCOUNT_KEY')) {
          return NextResponse.json({
            success: false,
            error: 'Server configuration error. Please contact support.'
          }, { status: 500 })
        }

        return NextResponse.json({
          success: false,
          error: 'Failed to reset password. Please try again.'
        }, { status: 500 })
      }
    }

    // Default: Invalid action
    return NextResponse.json({
      success: false,
      error: 'Invalid action. Use action: "reset"'
    }, { status: 400 })

  } catch (error: any) {
    console.error('Password reset error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to reset password'
    }, { status: 500 })
  }
}
