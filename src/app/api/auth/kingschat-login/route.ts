import { NextResponse } from 'next/server'
import * as admin from 'firebase-admin'
import https from 'https'

const KINGSCHAT_API_KEY = process.env.KINGSCHAT_API_KEY || process.env.NEXT_PUBLIC_KINGSCHAT_API_KEY || 'cjAOL6hByMN3QA8CQ59K5MtG+4PdR2E6NbRL7hVa8po='

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
    console.error('Firebase Admin initialization error in KingsChat Login API:', error)
  }
}

export async function POST(req: Request) {
  try {
    const { accessToken, kingschatUserId, email } = await req.json()

    if (!accessToken || !kingschatUserId) {
      return NextResponse.json({ success: false, error: 'Access token and KingsChat user ID are required' }, { status: 400 })
    }

    // 1. Verify access token with KingsChat profile API to prevent spoofing
    const profile: any = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'connect.kingsch.at',
        path: '/developer/api/user/profile',
        method: 'GET',
        headers: {
          'api-key': KINGSCHAT_API_KEY,
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      }

      const request = https.request(options, (res) => {
        let responseData = ''
        res.on('data', (chunk) => {
          responseData += chunk
        })

        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(responseData))
            } catch (err) {
              reject(new Error('Failed to parse profile response JSON'))
            }
          } else {
            reject(new Error(`Failed to fetch profile: Status ${res.statusCode} - ${responseData}`))
          }
        })
      })

      request.on('error', (err) => {
        reject(err)
      })

      request.end()
    })

    const verifiedKingschatId = profile?.profile?.id
    if (!verifiedKingschatId || verifiedKingschatId !== kingschatUserId) {
      return NextResponse.json({ success: false, error: 'KingsChat user ID mismatch or verification failed' }, { status: 401 })
    }

    // 2. Query Firestore profiles collection to find the user
    const db = admin.firestore()
    let querySnapshot;

    if (email) {
      // Find the specific profile by email
      querySnapshot = await db.collection('profiles').where('email', '==', email.toLowerCase()).get()
      
      if (!querySnapshot.empty) {
        // Verify this profile belongs to this KingsChat ID, or matches KingsChat verified email
        const doc = querySnapshot.docs.find(d => {
          const data = d.data()
          return data.kingschat_id === kingschatUserId || 
                 data.kingsChatId === kingschatUserId || 
                 (data.email && profile?.profile?.email && data.email.toLowerCase() === profile.profile.email.toLowerCase())
        })

        if (!doc) {
          return NextResponse.json({ success: false, error: 'Selected profile is not linked to this KingsChat account' }, { status: 403 })
        }

        // Auto link if not fully linked
        const data = doc.data()
        if (!data.kingschat_id || !data.kingsChatId) {
          await doc.ref.update({
            kingschat_id: kingschatUserId,
            kingsChatId: kingschatUserId
          })
        }

        querySnapshot = { docs: [doc], empty: false } as any
      }
    } else {
      // Check both kingschat_id and kingsChatId
      querySnapshot = await db.collection('profiles').where('kingschat_id', '==', kingschatUserId).limit(1).get()
      
      if (querySnapshot.empty) {
        querySnapshot = await db.collection('profiles').where('kingsChatId', '==', kingschatUserId).limit(1).get()
      }

      // If still not found by ID, try finding by email
      if (querySnapshot.empty) {
        const kingschatEmail = profile?.profile?.email
        if (kingschatEmail) {
          querySnapshot = await db.collection('profiles').where('email', '==', kingschatEmail.toLowerCase()).limit(1).get()
          if (!querySnapshot.empty) {
            // Auto link their account
            const doc = querySnapshot.docs[0]
            await doc.ref.update({
              kingschat_id: kingschatUserId,
              kingsChatId: kingschatUserId
            })
          }
        }
      }
    }

    if (querySnapshot.empty) {
      return NextResponse.json({ success: false, error: 'No account linked with this KingsChat ID' }, { status: 404 })
    }

    const firebaseUid = querySnapshot.docs[0].id

    // 3. Generate a Firebase custom auth token for this user
    const customToken = await admin.auth().createCustomToken(firebaseUid)

    return NextResponse.json({ success: true, customToken })

  } catch (error: any) {
    console.error('KingsChat secure login error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Internal server error during login' }, { status: 500 })
  }
}
