'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase-setup'
import { FirebaseAuthService } from '@/lib/firebase-auth'


interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

/**
 * AuthProvider - Big Tech Approach
 * 
 * How Instagram, WhatsApp, Twitter handle Firebase Auth:
 * 1. Use Firebase's currentUser (synchronous) for INSTANT initial state
 * 2. Show content immediately from cache
 * 3. Let onAuthStateChanged update asynchronously in background
 * 4. Firebase persistence (IndexedDB) survives page reloads
 * 
 * This prevents:
 * - Slow "loading..." screens
 * - Auth loss on reload
 * - Aggressive redirects while Firebase initializes
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  // INSTANT: Use Firebase's currentUser (synchronous, from IndexedDB cache)
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null
    // This is INSTANT - no async wait
    return auth.currentUser
  })

  // Start as false if we have cached user, true if we don't
  const [loading, setLoading] = useState(() => !auth.currentUser)

  useEffect(() => {
    // Listen for auth state changes (async, happens in background)
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)

      // Update cache for instant next load
      if (typeof window !== 'undefined') {
        localStorage.setItem('lwsrh_has_user', firebaseUser ? 'true' : 'false')
      }
    })

    return unsubscribe
  }, [])

  const handleSignOut = async () => {
    try {
      await FirebaseAuthService.signOut()

      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
      }

      window.location.replace('/auth')
    } catch (error) {
      console.error('Sign out error:', error)
      window.location.replace('/auth')
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut: handleSignOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  return context
}
