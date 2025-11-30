import { create } from 'zustand'
import { User } from 'firebase/auth'
import { FirebaseAuthService } from '@/lib/firebase-auth'
import { FirebaseDatabaseService } from '@/lib/firebase-database'
import type { UserProfile } from '@/types/supabase'

// Import zone store for clearing on logout (lazy to avoid circular deps)
const getZoneStore = () => import('./zoneStore').then(m => m.useZoneStore)

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
      
      // CRITICAL: Clear zone state FIRST to prevent cross-user contamination
      try {
        const zoneStore = await getZoneStore()
        zoneStore.getState().clearZoneState()
        console.log('🧹 Zone state cleared')
      } catch (e) {
        console.warn('Could not clear zone state:', e)
      }
      
      // Clear auth state in Zustand BEFORE Firebase signOut
      set({ user: null, profile: null, isLoading: false })
      
      // Sign out from Firebase FIRST - this is the critical step
      console.log('🔥 Signing out from Firebase...')
      const result = await FirebaseAuthService.signOut()
      console.log('🔥 Firebase signOut result:', result)
      
      // Clear all auth-related storage AFTER Firebase signOut
      if (typeof window !== 'undefined') {
        // Keys to preserve (only countdown data)
        const keysToPreserve = ['server_target_date_', 'countdown_hash_']
        
        const keysToRemove: string[] = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key) {
            const shouldPreserve = keysToPreserve.some(p => key.startsWith(p))
            if (!shouldPreserve) {
              keysToRemove.push(key)
            }
          }
        }
        
        keysToRemove.forEach(key => {
          console.log('🗑️ Removing:', key)
          localStorage.removeItem(key)
        })
        
        // Clear sessionStorage
        sessionStorage.clear()
        
        // Clear IndexedDB Firebase data to prevent auto-login
        try {
          const databases = await indexedDB.databases()
          for (const db of databases) {
            if (db.name && (db.name.includes('firebase') || db.name.includes('firebaseLocalStorage'))) {
              console.log('🗑️ Deleting IndexedDB:', db.name)
              indexedDB.deleteDatabase(db.name)
            }
          }
        } catch (e) {
          console.warn('Could not clear IndexedDB:', e)
        }
        
        // Clear service worker caches
        if ('caches' in window) {
          try {
            const names = await caches.keys()
            await Promise.all(names.map(name => caches.delete(name)))
            console.log('🗑️ Service worker caches cleared')
          } catch (e) {
            console.warn('Could not clear caches:', e)
          }
        }
      }
      
      console.log('✅ Logout successful, redirecting to auth page...')
      
      // Redirect to auth page with a flag to prevent any auto-login attempts
      if (typeof window !== 'undefined') {
        // Use replace to prevent back button returning to logged-in state
        window.location.replace('/auth?logout=true')
      }
      
    } catch (error) {
      console.error('❌ Logout error:', error)
      // Force redirect even if logout fails
      if (typeof window !== 'undefined') {
        // Clear everything and redirect
        localStorage.clear()
        sessionStorage.clear()
        window.location.replace('/auth?logout=true')
      }
    } finally {
      // Reset flag after a delay
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
    // Check if we just logged out (URL flag)
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('logout') === 'true') {
        console.log('🚪 Logout flag detected in URL - skipping auto-login')
        isLoggingOut = true
        // Clear the URL parameter
        window.history.replaceState({}, document.title, window.location.pathname)
        // Reset flag after a short delay
        setTimeout(() => {
          isLoggingOut = false
        }, 3000)
      }
    }
    
    // Listen to Firebase auth state changes
    const unsubscribe = FirebaseAuthService.onAuthStateChange(async (currentUser) => {
      // Don't update state if we're logging out
      if (isLoggingOut) {
        console.log('🚪 Auth state change ignored - logout in progress')
        if (currentUser) {
          // Force sign out again if Firebase still has a user during logout
          console.log('🔥 Force signing out stale Firebase user...')
          await FirebaseAuthService.signOut()
        }
        set({ user: null, profile: null, isLoading: false })
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
