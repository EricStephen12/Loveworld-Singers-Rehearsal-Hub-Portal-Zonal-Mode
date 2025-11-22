'use client'

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { User } from 'firebase/auth'
import { FirebaseAuthService } from '@/lib/firebase-auth'
import { FirebaseDatabaseService } from '@/lib/firebase-database'
import { KingsChatAuthService } from '@/lib/kingschat-auth'
import type { UserProfile } from '@/types/supabase'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  isLoading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const refreshProfile = useCallback(async () => {
    if (!user?.uid) return
    
    try {
      console.log('🌐 Fetching fresh profile')
      const userProfile = await FirebaseDatabaseService.getDocument('profiles', user.uid)
      if (userProfile) {
        setProfile(userProfile as any)
        console.log('✅ Profile loaded successfully')
      }
    } catch (error) {
      console.error('❌ Error refreshing profile:', error)
    }
  }, [user?.uid])

  const signOut = useCallback(async () => {
    console.log('🚪 Signing out...')
    
    setIsLoggingOut(true)
    
    // Clear all state immediately
    setUser(null)
    setProfile(null)
    
    // Check if user is authenticated with KingsChat
    const authProvider = typeof window !== 'undefined' ? localStorage.getItem('authProvider') : null
    
    // Clear KingsChat tokens if authenticated with KingsChat
    if (authProvider === 'kingschat') {
      KingsChatAuthService.clearTokens()
      console.log('✅ KingsChat tokens cleared')
    }
    
    // Clear storage
    try {
      localStorage.clear()
      sessionStorage.clear()
    } catch (e) {
      console.log('Storage clear error:', e)
    }
    
    // Firebase logout
    try {
      const result = await FirebaseAuthService.signOut()
      if ((result as any).success) {
        console.log('✅ Firebase logout successful')
      }
    } catch (error) {
      console.log('Firebase logout error:', error)
    }
    
    // Redirect to auth page
    setTimeout(() => {
      console.log('🚪 Redirecting to auth...')
      window.location.replace('/auth')
    }, 100)
  }, [])

  // Main auth state listener using Firebase's onAuthStateChanged
  useEffect(() => {
    let isMounted = true
    let unsubscribe: (() => void) | null = null

    const setupAuthListener = async () => {
      try {
        console.log('🔍 Setting up Firebase auth listener...')

        if (isLoggingOut) {
          console.log('🚪 Logout in progress - skipping auth listener')
          setUser(null)
          setProfile(null)
          setIsLoading(false)
          return
        }

        // Use Firebase's built-in auth state listener for proper persistence
        unsubscribe = FirebaseAuthService.onAuthStateChange((currentUser) => {
          if (!isMounted) return

          console.log('🔄 Auth state changed:', currentUser ? currentUser.email : 'No user')
          
          if (currentUser) {
            console.log('✅ User is authenticated:', currentUser.email)
            setUser(currentUser)

            // Load user profile
            FirebaseDatabaseService.getDocument('profiles', currentUser.uid)
              .then((userProfile) => {
                if (userProfile && isMounted) {
                  setProfile(userProfile as any)
                  console.log('✅ Profile loaded successfully')
                }
              })
              .catch((error) => {
                console.error('❌ Error loading profile:', error)
              })
          } else {
            console.log('❌ No authenticated user found')
            setUser(null)
            setProfile(null)
          }
          
          if (isMounted) {
          setIsLoading(false)
        }
        })

      } catch (error) {
        console.error('❌ Auth listener setup failed:', error)
        if (isMounted) {
          setUser(null)
          setProfile(null)
          setIsLoading(false)
        }
      }
    }

    setupAuthListener()

    return () => {
      isMounted = false
      if (unsubscribe) {
      unsubscribe()
      }
    }
  }, [isLoggingOut])

  // Reset logout flag when component unmounts or when we're on auth page
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname === '/auth') {
      setIsLoggingOut(false)
    }
  }, [])
  
  // Debug logging
  console.log('AuthContext: Profile state:', {
    hasProfile: !!profile,
    userEmail: user?.email
  })

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
        user,
        profile,
        isLoading,
        signOut,
        refreshProfile
  }), [user, profile, isLoading, signOut, refreshProfile])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}