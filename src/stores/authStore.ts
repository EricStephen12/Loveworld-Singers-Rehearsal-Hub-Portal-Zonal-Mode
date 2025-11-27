import { create } from 'zustand'
import { User } from 'firebase/auth'
import { FirebaseAuthService } from '@/lib/firebase-auth'
import { FirebaseDatabaseService } from '@/lib/firebase-database'
import type { UserProfile } from '@/types/supabase'

interface AuthState {
  user: User | null
  profile: UserProfile | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setProfile: (profile: UserProfile | null) => void
  setIsLoading: (loading: boolean) => void
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  initialize: () => void
}

// Flag to prevent auth state listener from interfering during logout
let isLoggingOut = false

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: false,

  setUser: (user) => {
    // Don't update user if we're in the middle of logging out
    if (!isLoggingOut) {
      set({ user })
    }
  },
  setProfile: (profile) => set({ profile }),
  setIsLoading: (isLoading) => set({ isLoading }),

  signOut: async () => {
    try {
      console.log('🚪 Starting logout process...')
      isLoggingOut = true
      
      // Clear state first
      set({ user: null, profile: null, isLoading: false })
      
      // Sign out from Firebase
      const result = await FirebaseAuthService.signOut()
      
      if (result.success) {
        // Clear all auth-related storage
        if (typeof window !== 'undefined') {
          // Clear all localStorage items except countdown persistence
          const keysToRemove: string[] = []
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (
              key &&
              // Preserve countdown persistence keys only
              !key.startsWith('server_target_date_') &&
              !key.startsWith('countdown_hash_')
            ) {
              keysToRemove.push(key)
            }
          }
          keysToRemove.forEach(key => localStorage.removeItem(key))
          
          // Clear sessionStorage
          sessionStorage.clear()
          
          // Clear any caches
          if ('caches' in window) {
            caches.keys().then(names => {
              names.forEach(name => {
                caches.delete(name)
              })
            })
          }
        }
        
        console.log('✅ Logout successful, redirecting to auth page...')
        
        // Redirect to auth page immediately
        if (typeof window !== 'undefined') {
          window.location.href = '/auth'
        }
      } else {
        throw new Error(result.error || 'Logout failed')
      }
    } catch (error) {
      console.error('❌ Logout error:', error)
      // Force redirect even if logout fails
      if (typeof window !== 'undefined') {
        // Clear everything and redirect
        localStorage.clear()
        sessionStorage.clear()
        window.location.href = '/auth'
      }
    } finally {
      // Reset flag after a delay (in case redirect doesn't happen immediately)
      setTimeout(() => {
        isLoggingOut = false
      }, 2000)
    }
  },

  refreshProfile: async () => {
    const { user } = get()
    if (!user?.uid) return
    
    try {
      const userProfile = await FirebaseDatabaseService.getDocument('profiles', user.uid)
      if (userProfile) {
        set({ profile: userProfile as any })
      }
    } catch (error) {
      console.error('Error refreshing profile:', error)
    }
  },

  initialize: () => {
    // Listen to Firebase auth state changes
    const unsubscribe = FirebaseAuthService.onAuthStateChange(async (currentUser) => {
      // Don't update state if we're logging out
      if (isLoggingOut && !currentUser) {
        return // Allow logout to proceed
      }
      
      if (isLoggingOut && currentUser) {
        // If user appears during logout, ignore it (might be stale state)
        return
      }
      
      set({ user: currentUser })
      
      if (currentUser) {
        // Load profile
        try {
          const userProfile = await FirebaseDatabaseService.getDocument('profiles', currentUser.uid)
          set({ profile: userProfile as any })
        } catch (error) {
          console.error('Error loading profile:', error)
        }
      } else {
        set({ profile: null })
      }
      
      set({ isLoading: false })
    })

    // Return cleanup function
    return unsubscribe
  }
}))

// Initialize auth listener on app startup
if (typeof window !== 'undefined') {
  useAuthStore.getState().initialize()
}
