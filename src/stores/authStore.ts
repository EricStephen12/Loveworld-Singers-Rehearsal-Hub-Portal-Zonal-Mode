// ============================================
// LEGACY AUTH STORE - For backward compatibility
// ============================================
// The main auth flow now uses AuthContext (src/contexts/AuthContext.tsx)
// This store is kept for backward compatibility with dynamic imports
// in utility files. It will be deprecated in future versions.

import { create } from 'zustand'
import { User } from 'firebase/auth'
import { FirebaseAuthService } from '@/lib/firebase-auth'
import { FirebaseDatabaseService } from '@/lib/firebase-database'
import type { UserProfile } from '@/types/supabase'

interface AuthState {
  user: User | null
  profile: UserProfile | null
  isLoading: boolean
  isInitialized: boolean
  _sessionUserId: string | null
  setUser: (user: User | null) => void
  setProfile: (profile: UserProfile | null) => void
  setIsLoading: (loading: boolean) => void
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  initialize: () => () => void
  loadUserSession: (userId: string) => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: false, // Start as false - AuthContext handles loading
  isInitialized: false,
  _sessionUserId: null,

  setUser: (user) => set({ user, _sessionUserId: user?.uid || null }),
  
  setProfile: (profile) => set({ profile }),
  
  setIsLoading: (isLoading) => set({ isLoading }),

  signOut: async () => {
    try {
      await FirebaseAuthService.signOut()
      set({ user: null, profile: null, _sessionUserId: null })
      
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
        window.location.replace('/auth')
      }
    } catch (error) {
      console.error('Sign out error:', error)
      window.location.replace('/auth')
    }
  },

  refreshProfile: async () => {
    const { user } = get()
    if (!user?.uid) return
    
    try {
      const profile = await FirebaseDatabaseService.getDocument('profiles', user.uid)
      if (profile) {
        set({ profile: profile as UserProfile })
      }
    } catch (error) {
      console.error('Error refreshing profile:', error)
    }
  },

  loadUserSession: async (userId: string) => {
    try {
      const profile = await FirebaseDatabaseService.getDocument('profiles', userId)
      if (profile && profile.id === userId) {
        set({ profile: profile as UserProfile, _sessionUserId: userId })
      }
    } catch (error) {
      console.error('Error loading user session:', error)
    }
  },

  // Legacy initialize - now a no-op since AuthContext handles this
  initialize: () => {
    return () => {} // Return empty cleanup
  }
}))

// NO AUTO-INITIALIZATION - AuthContext handles auth state now
