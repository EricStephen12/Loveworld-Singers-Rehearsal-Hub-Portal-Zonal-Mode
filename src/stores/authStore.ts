import { create } from 'zustand'
import { User } from 'firebase/auth'
import { FirebaseAuthService } from '@/lib/firebase-auth'
import { FirebaseDatabaseService } from '@/lib/firebase-database'
import type { UserProfile } from '@/types/supabase'

// Import zone store for clearing on logout (lazy to avoid circular deps)
const getZoneStore = () => import('./zoneStore').then(m => m.useZoneStore)

// Import loaded pages cache clearer (lazy to avoid circular deps)
const clearLoadedPagesCache = () => import('@/hooks/useMinimumLoadingTime').then(m => m.clearLoadedPagesCache())

// Helper to check if we have a cached session (prevents flash to auth page)
const hasCachedSession = (): boolean => {
  if (typeof window === 'undefined') return false
  try {
    // Check our own cached profile first (fastest check)
    const cachedProfile = localStorage.getItem('cachedUserProfile')
    if (cachedProfile) {
      const parsed = JSON.parse(cachedProfile)
      // Check if cache is less than 24 hours old
      if (parsed.timestamp && Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
        console.log('✅ Valid cached profile found in localStorage')
        return true
      }
    }
    
    // Check for Firebase auth persistence indicators
    const hasAuthUser = localStorage.getItem('firebase:authUser') !== null ||
                        sessionStorage.getItem('firebase:authUser') !== null
    
    if (hasAuthUser) {
      console.log('✅ Firebase auth user found in storage')
    }
    
    return hasAuthUser
  } catch (e) {
    console.error('Error checking cached session:', e)
    return false
  }
}

// Helper to get cached profile for instant display
const getCachedProfile = (): UserProfile | null => {
  if (typeof window === 'undefined') return null
  try {
    const cached = localStorage.getItem('cachedUserProfile')
    if (cached) {
      const parsed = JSON.parse(cached)
      // Check if cache is less than 24 hours old
      if (parsed.timestamp && Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
        return parsed.profile
      }
    }
  } catch {
    // Ignore parse errors
  }
  return null
}

// Helper to cache profile
const cacheProfile = (profile: UserProfile | null) => {
  if (typeof window === 'undefined') return
  try {
    if (profile) {
      localStorage.setItem('cachedUserProfile', JSON.stringify({
        profile,
        timestamp: Date.now()
      }))
    } else {
      localStorage.removeItem('cachedUserProfile')
    }
  } catch {
    // Ignore storage errors
  }
}

interface AuthState {
  user: User | null
  profile: UserProfile | null
  isLoading: boolean
  isInitialized: boolean // Track if we've received first Firebase callback
  setUser: (user: User | null) => void
  setProfile: (profile: UserProfile | null) => void
  setIsLoading: (loading: boolean) => void
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  initialize: () => void
}

// Flag to prevent auth state listener from interfering during logout
let isLoggingOut = false

export const useAuthStore = create<AuthState>((set, get) => {
  const cachedProfile = getCachedProfile()
  const hasCache = hasCachedSession()
  
  console.log('🔐 Auth Store Initialized:', { 
    hasCachedProfile: !!cachedProfile, 
    hasCachedSession: hasCache 
  })
  
  return {
    user: null,
    // Use cached profile for instant display (prevents flash)
    profile: cachedProfile,
    // If we have a cached session, start as not loading for instant redirect
    // Firebase will confirm in background
    isLoading: false,
    isInitialized: hasCache, // If we have cache, consider initialized

  setUser: (user) => {
    // Don't update user if we're in the middle of logging out
    if (!isLoggingOut) {
      set({ user })
    }
  },
  setProfile: (profile) => {
    set({ profile })
    // Cache profile for instant display on next page load
    cacheProfile(profile)
  },
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
      
      // Clear loaded pages cache to show skeleton on next login
      try {
        await clearLoadedPagesCache()
        console.log('🧹 Loaded pages cache cleared')
      } catch (e) {
        console.warn('Could not clear loaded pages cache:', e)
      }
      
      // Clear cached profile immediately
      cacheProfile(null)
      
      // Clear auth state in Zustand BEFORE Firebase signOut
      set({ user: null, profile: null, isLoading: false, isInitialized: true })
      
      // Sign out from Firebase FIRST - this is the critical step
      console.log('🔥 Signing out from Firebase...')
      const result = await FirebaseAuthService.signOut()
      console.log('🔥 Firebase signOut result:', result)
      
      // Clear all auth-related storage AFTER Firebase signOut
      // Firebase signOut() already clears its own auth data
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
    const { isInitialized } = get()
    
    // Prevent double initialization
    if (isInitialized) {
      console.log('🔐 Auth already initialized, skipping...')
      return () => {}
    }
    
    // Check if we just logged out (URL flag)
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('logout') === 'true') {
        console.log('🚪 Logout flag detected in URL - skipping auto-login')
        isLoggingOut = true
        // Clear cached profile on logout
        cacheProfile(null)
        set({ isLoading: false, profile: null, user: null, isInitialized: true })
        // Clear the URL parameter
        window.history.replaceState({}, document.title, window.location.pathname)
        // Reset flag after a short delay
        setTimeout(() => {
          isLoggingOut = false
        }, 3000)
        // Return empty cleanup
        return () => {}
      }
    }
    
    // If we have a cached session, we're optimistically not loading
    // Firebase will confirm/deny in the background
    const hasCache = hasCachedSession()
    if (hasCache) {
      console.log('🔐 Cached session found - assuming logged in for instant redirect')
      // Mark as initialized immediately for faster redirects
      set({ isInitialized: true, isLoading: false })
    }
    
    console.log('🔐 Setting up Firebase auth state listener...')
    
    // Listen to Firebase auth state changes
    const unsubscribe = FirebaseAuthService.onAuthStateChange(async (currentUser) => {
      console.log('🔐 Firebase auth state changed:', currentUser ? `User: ${currentUser.email}` : 'No user')
      
      // Don't update state if we're logging out
      if (isLoggingOut) {
        console.log('🚪 Auth state change ignored - logout in progress')
        if (currentUser) {
          // Force sign out again if Firebase still has a user during logout
          console.log('🔥 Force signing out stale Firebase user...')
          await FirebaseAuthService.signOut()
        }
        set({ user: null, profile: null, isLoading: false, isInitialized: true })
        return
      }
      
      set({ user: currentUser, isInitialized: true })
      
      if (currentUser) {
        console.log('✅ User is logged in, loading profile...')
        // Load fresh profile from Firebase
        try {
          const userProfile = await FirebaseDatabaseService.getDocument('profiles', currentUser.uid)
          if (userProfile) {
            console.log('✅ Profile loaded successfully')
            set({ profile: userProfile as any })
            // Update cache with fresh data
            cacheProfile(userProfile as any)
          } else {
            console.warn('⚠️ No profile found for user - attempting recovery...')
            // Auto-recover missing profile
            const { autoRecoverProfile } = await import('@/utils/profile-recovery')
            await autoRecoverProfile(currentUser)
            
            // Try loading profile again after recovery
            const recoveredProfile = await FirebaseDatabaseService.getDocument('profiles', currentUser.uid)
            if (recoveredProfile) {
              console.log('✅ Profile recovered - user needs to complete profile (zone, KingsChat ID)')
              set({ profile: recoveredProfile as any })
              cacheProfile(recoveredProfile as any)
              
              // Redirect to auth/signup to complete profile (zone, KingsChat ID)
              if (typeof window !== 'undefined' && (recoveredProfile as any).recovered && !(recoveredProfile as any).profile_completed) {
                console.log('🔄 Redirecting to signup to complete profile (zone, KingsChat ID)...')
                // Sign out and redirect to signup with recovery flag
                setTimeout(async () => {
                  await FirebaseAuthService.signOut()
                  window.location.href = '/auth?recovered=true&email=' + encodeURIComponent((recoveredProfile as any).email || '')
                }, 1500)
              }
            } else {
              console.error('❌ Profile recovery failed')
            }
          }
        } catch (error) {
          console.error('❌ Error loading profile:', error)
          // Keep cached profile if fetch fails
        }
      } else {
        console.log('ℹ️ No user logged in - clearing profile')
        // User is definitely not logged in - clear everything
        set({ profile: null })
        cacheProfile(null)
      }
      
      // We've now received the first definitive auth state
      set({ isLoading: false })
    })

    // Return cleanup function
    return unsubscribe
  }
}})

// Initialize auth listener on app startup
if (typeof window !== 'undefined') {
  // Ensure Firebase persistence is set before initializing
  FirebaseAuthService.ensurePersistence().then(() => {
    console.log('✅ Firebase persistence confirmed, initializing auth store')
    useAuthStore.getState().initialize()
  }).catch((error) => {
    console.error('❌ Failed to ensure Firebase persistence:', error)
    // Initialize anyway
    useAuthStore.getState().initialize()
  })
}
