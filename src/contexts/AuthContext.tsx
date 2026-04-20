'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase-setup'
import { FirebaseAuthService } from '@/lib/firebase-auth'
import { SessionManager } from '@/lib/session-manager'


import { updateUserPresence } from '@/lib/presence-service'
import { UserProfile } from '@/types/supabase'
import { FirebaseDatabaseService } from '@/lib/firebase-database'


interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  // Session sync
  if (typeof window !== 'undefined') {
    const hasUser = localStorage.getItem('lwsrh_has_user') === 'true';
    const hasCookie = document.cookie.includes('lwsrh_is_logged_in=true');
    if (hasUser && !hasCookie) {
      document.cookie = "lwsrh_is_logged_in=true; path=/; max-age=31536000; SameSite=Lax";
    }
  }

  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null
    return auth.currentUser
  })

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Lifecycle
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasUser = localStorage.getItem('lwsrh_has_user') === 'true';
      const cookieExists = document.cookie.includes('lwsrh_is_logged_in=true');
      
      if (hasUser && !cookieExists) {
        // Instantly sync the session to the cookie for the Middleware
        document.cookie = "lwsrh_is_logged_in=true; path=/; max-age=31536000; SameSite=Lax";
      }
    }
  }, []);

  // Presence
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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      
      if (firebaseUser) {
        // Fetch profile
        const userProfile = await FirebaseDatabaseService.getUserProfile(firebaseUser.uid)
        setProfile(userProfile as UserProfile | null)
        SessionManager.startActivityTracking(firebaseUser.uid)
      } else {
        setProfile(null)
        SessionManager.clearSessionState()
      }
      
      setLoading(false)

      // Persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('lwsrh_has_user', firebaseUser ? 'true' : 'false')
        
        // Auth cookie for middleware
        if (firebaseUser) {
          document.cookie = "lwsrh_is_logged_in=true; path=/; max-age=31536000; SameSite=Lax"
        } else {
          document.cookie = "lwsrh_is_logged_in=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
        }
      }
    })

   
    const safetyTimeout = setTimeout(() => {
      setLoading((currentLoading) => {
        if (currentLoading) {
 console.warn('AuthContext: Firebase init timeout - forcing loading=false')
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
    <AuthContext.Provider value={{ user, profile, loading, signOut: handleSignOut }}>
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
