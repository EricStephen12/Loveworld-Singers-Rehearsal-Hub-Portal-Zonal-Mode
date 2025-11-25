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
  const [hasInitialized, setHasInitialized] = useState(false)

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
    // Set logout flag to prevent auth listener from re-authenticating
    setIsLoggingOut(true)
    
    try {
      // Clear state
      setUser(null)
      setProfile(null)
      
      // Firebase logout
      await FirebaseAuthService.signOut()
      
      // Clear storage and ALL auth flags
      if (typeof window !== 'undefined') {
        // Clear specific auth flags first (in case localStorage.clear() fails)
        localStorage.removeItem('userAuthenticated')
        localStorage.removeItem('bypassLogin')
        localStorage.removeItem('hasCompletedProfile')
        localStorage.removeItem('lastAuthTime')
        localStorage.removeItem('specialUser')
        localStorage.removeItem('userRole')
        localStorage.removeItem('authProvider')
        
        // Then clear everything
        localStorage.clear()
        sessionStorage.clear()
      }
      
    } catch (error) {
      console.error('Logout error:', error)
    }
    
    // Redirect
    if (typeof window !== 'undefined') {
      window.location.href = '/auth'
    }
  }, [])

  // Main auth state listener using Firebase's onAuthStateChanged
  useEffect(() => {
    let isMounted = true
    let unsubscribe: (() => void) | null = null
    let lastUserId: string | null = null

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
          if (!isMounted || isLoggingOut) return

          const currentUserId = currentUser?.uid || null
          
          // Prevent double processing
          if (currentUserId === lastUserId && hasInitialized) {
            return
          }
          
          lastUserId = currentUserId
          
          if (currentUser && !isLoggingOut) {
            setUser(currentUser)

            // Load user profile
            FirebaseDatabaseService.getDocument('profiles', currentUser.uid)
              .then((userProfile) => {
                if (userProfile && isMounted && !isLoggingOut) {
                  setProfile(userProfile as any)
                }
              })
              .catch(() => {
                // Silent error handling
              })
          } else {
            setUser(null)
            setProfile(null)
          }
          
          if (isMounted) {
            setIsLoading(false)
            setHasInitialized(true)
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

  // Reset logout flag when we reach auth page
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname === '/auth') {
      setIsLoggingOut(false)
    }
  }, [typeof window !== 'undefined' ? window.location.pathname : ''])
  
  // Debug logging - only on initialization (run once)
  useEffect(() => {
    if (hasInitialized && !isLoading) {
      console.log('AuthContext: Initialized with profile:', {
        hasProfile: !!profile,
        userEmail: user?.email
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasInitialized])

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