import { initializeApp, getApp, FirebaseApp } from 'firebase/app'
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth'
import { initializeFirestore, getFirestore, Firestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getDatabase, Database } from 'firebase/database'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ''
}

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error('Firebase configuration missing. Check .env.local file.')
}

let app: FirebaseApp
try {
  app = initializeApp(firebaseConfig)
} catch (error: any) {
  if (error.code === 'app/duplicate-app') {
    app = getApp()
  } else {
    throw error
  }
}

export const auth = getAuth(app)

export const db: Firestore = (() => {
  try {
    return initializeFirestore(app, {
      experimentalForceLongPolling: false,
      experimentalAutoDetectLongPolling: true,
      localCache: { kind: 'persistent' }
    })
  } catch (error: any) {
    if (error.code === 'firestore/already-exists') {
      return getFirestore(app)
    }
    throw error
  }
})()

export const storage = getStorage(app)

let _realtimeDb: Database | null = null;

export const realtimeDb: Database | null = (() => {
  if (typeof window !== 'undefined') { // Only initialize on client side
    try {
      if (!_realtimeDb) {
        _realtimeDb = getDatabase(app);
      }
      return _realtimeDb;
    } catch (error) {
      console.warn('Failed to initialize Realtime Database:', error);
      return null;
    }
  } else {
    // Return null on server-side to prevent build failures
    return null;
  }
})()

export function isRealtimeDbAvailable(): boolean {
  return realtimeDb !== null;
}

if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch(console.error)
}

export default app
