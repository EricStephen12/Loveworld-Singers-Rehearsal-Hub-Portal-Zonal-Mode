// Firebase initialization and configuration
import { initializeApp } from 'firebase/app'
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth'
import { initializeFirestore, Firestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ''
}

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error('Firebase configuration missing. Check .env.local file.')
}

import type { FirebaseApp } from 'firebase/app'

let app: FirebaseApp
try {
  app = initializeApp(firebaseConfig)
} catch (error: any) {
  if (error.code === 'app/duplicate-app') {
    const { getApp } = require('firebase/app')
    app = getApp()
  } else {
    throw error
  }
}

export const auth = getAuth(app)

// Firestore with persistence enabled
export const db: Firestore = (() => {
  try {
    return initializeFirestore(app, {
      experimentalForceLongPolling: false,
      experimentalAutoDetectLongPolling: true,
      localCache: { kind: 'persistent' }
    })
  } catch (error: any) {
    if (error.code === 'firestore/already-exists') {
      const { getFirestore } = require('firebase/firestore')
      return getFirestore(app)
    }
    throw error
  }
})()

export const storage = getStorage(app)

// Keep user logged in across browser sessions
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch(console.error)
}

export default app
