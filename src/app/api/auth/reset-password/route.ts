// API Route for Password Reset (In-App)
// Uses Firebase Admin SDK to reset password
// Lookup is done client-side, only password update uses Admin SDK

import { NextRequest, NextResponse } from 'next/server'
import * as admin from 'firebase-admin'

// Initialize Firebase Admin with explicit credentials
function getFirebaseAdmin(): admin.app.App {
  if (admin.apps.length > 0) {
    return admin.apps[0]!
  }
  
  // Try multiple env var naming conventions
  const projectId = 
    process.env.NEXT_PUBLIC_FIREBASE_ADMIN_PROJECT_ID || 
    process.env.FIREBASE_ADMIN_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    process.env.FIREBASE_PROJECT_ID
    
  const clientEmail = 
    process.env.NEXT_PUBLIC_FIREBASE_ADMIN_CLIENT_EMAIL ||
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL ||
    process.env.FIREBASE_CLIENT_EMAIL
    
  let privateKey = 
    process.env.NEXT_PUBLIC_FIREBASE_ADMIN_PRIVATE_KEY ||
    process.env.FIREBASE_ADMIN_PRIVATE_KEY ||
    process.env.FIREBASE_PRIVATE_KEY
  
  // Handle different formats of private key
  if (privateKey) {
    // Remove surrounding quotes if present
    privateKey = privateKey.replace(/^["']|["']$/g, '')
    // Replace escaped newlines with actual newlines
    privateKey = privateKey.replace(/\\n/g, '\n')
  }
  
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(`Firebase Admin credentials missing: projectId=${!!projectId}, clientEmail=${!!clientEmail}, privateKey=${!!privateKey}`)
  }
  
  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey
    }),
    projectId
  })
}

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
        const app = getFirebaseAdmin()
        const auth = admin.auth(app)
        
        // Get Firebase Auth user by email
        const userRecord = await auth.getUserByEmail(email.toLowerCase())
        
        // Update password using Firebase Admin
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
