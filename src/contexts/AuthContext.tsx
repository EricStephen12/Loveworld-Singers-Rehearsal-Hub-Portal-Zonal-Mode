'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase-setup'
import { FirebaseAuthService } from '@/lib/firebase-auth'
import { SessionManager } from '@/lib/session-manager'


import { updateUserPresence } from '@/lib/presence-service'


interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null
    return auth.currentUser
  })

  const [loading, setLoading] = useState(() => !auth.currentUser)

  // GLOBAL PRESENCE TRACKING
  useEffect(() => {
    if (!user?.uid) return

    // Mark as online immediately on boot/login
    updateUserPresence(user.uid, 'online')

    // Heartbeat: update lastSeen every 60 seconds
    const heartbeat = setInterval(() => {
      if (document.visibilityState !== 'hidden') {
        updateUserPresence(user.uid, 'online')
      }
    }, 60000)

    // Visibility Listener: handles tab switching
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        updateUserPresence(user.uid, 'offline')
      } else {
        updateUserPresence(user.uid, 'online')
      }
    }

    // Unload Listener: handles closing tab/browser
    const handleUnload = () => {
      updateUserPresence(user.uid, 'offline')
    }

    window.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleUnload)

    return () => {
      clearInterval(heartbeat)
      updateUserPresence(user.uid, 'offline')
      window.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleUnload)
    }
  }, [user?.uid])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)

      // Start Session Tracking (Kick-Out Logic)
      if (firebaseUser) {
        SessionManager.startActivityTracking(firebaseUser.uid)
      } else {
        // Clear all tracking and exemptions on logout
        SessionManager.clearSessionState()
      }

      // Update cache for instant next load
      if (typeof window !== 'undefined') {
        localStorage.setItem('lwsrh_has_user', firebaseUser ? 'true' : 'false')
      }
    })

    // Failsafe: If Firebase takes too long (e.g. network issues), stop loading
    // This allows the app to proceed (likely to auth page) instead of hanging
    const safetyTimeout = setTimeout(() => {
      setLoading((currentLoading) => {
        if (currentLoading) {
 console.warn('️ AuthContext: Firebase init timeout - forcing loading=false')
          return false
        }
        return currentLoading
      })
    }, 12000)

    return () => {
      unsubscribe()
      clearTimeout(safetyTimeout)
    }
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
