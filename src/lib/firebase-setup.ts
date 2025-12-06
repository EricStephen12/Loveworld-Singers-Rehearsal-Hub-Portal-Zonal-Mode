// Firebase Setup for LoveWorld Singers App
import { initializeApp } from 'firebase/app'
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth'
import { initializeFirestore, Firestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Firebase configuration - FROM ENVIRONMENT VARIABLES
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ''
}

// Validate Firebase configuration
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('❌ Firebase configuration is missing!')
  console.error('Please create a .env.local file with your Firebase credentials.')
  console.error('See .env.local.example for the required variables.')
  
  // Throw a more helpful error
  throw new Error(
    'Firebase configuration is missing. Please:\n' +
    '1. Create a .env.local file in the root directory\n' +
    '2. Copy the contents from .env.local.example\n' +
    '3. Replace the placeholder values with your actual Firebase credentials\n' +
    '4. Get your credentials from: https://console.firebase.google.com/\n' +
    '5. Restart the development server'
  )
}

// Initialize Firebase
import type { FirebaseApp } from 'firebase/app'

let app: FirebaseApp
try {
  app = initializeApp(firebaseConfig)
} catch (error: any) {
  // If already initialized, get the existing app
  if (error.code === 'app/duplicate-app') {
    const { getApp } = require('firebase/app')
    app = getApp()
  } else {
    throw error
  }
}

// Initialize Firebase services
export const auth = getAuth(app)

// � WHATSAPPP APPROACH - Real-time connection with optimized settings
export const db: Firestore = (() => {
  try {
    return initializeFirestore(app, {
      // WhatsApp-style connection settings

      experimentalForceLongPolling: false,
      experimentalAutoDetectLongPolling: true,
      // Enable persistence with optimized settings for WhatsApp-style performance
      localCache: {
        kind: 'persistent'
      }
    })
  } catch (error: any) {
    // If already initialized, get the existing instance
    if (error.code === 'firestore/already-exists') {
      const { getFirestore } = require('firebase/firestore')
      return getFirestore(app)
    }
    throw error
  }
})()

export const storage = getStorage(app)

// CRITICAL: Set auth persistence to LOCAL - keeps user logged in across sessions
// This is what Instagram, Twitter, Facebook use - user stays logged in even after closing browser
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).then(() => {
    console.log('✅ Firebase auth persistence set to LOCAL - user will stay logged in')
  }).catch((error) => {
    console.error('❌ Failed to set auth persistence:', error)
  })
}

export default app
