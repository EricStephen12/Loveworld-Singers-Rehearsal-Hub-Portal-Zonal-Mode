/**
 * AUTH STORE — Single Source of Truth for Authentication
 *
 * Replaces: AuthContext + useAuth hook + legacy authStore
 *
 * Strategy:
 * - ONE profile fetch per user login (not 3 separate ones)
 * - onAuthStateChanged realtime listener preserved
 * - Presence heartbeat preserved (60s)
 * - Components subscribe only to the slices they need (no full re-renders)
 */

'use client'

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { User, onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase-setup'
import { FirebaseAuthService } from '@/lib/firebase-auth'
import { FirebaseDatabaseService } from '@/lib/firebase-database'
import { SessionManager } from '@/lib/session-manager'
import { updateUserPresence } from '@/lib/presence-service'
import type { UserProfile } from '@/types/supabase'

// ─── Types ──────────────────────────────────────────────────────────────────

interface AuthState {
  // Core state
  user: User | null
  profile: UserProfile | null
  loading: boolean
  backendOffline: boolean
  isInitialized: boolean

  // Internal plumbing (not for consumers)
  _presenceInterval: ReturnType<typeof setInterval> | null
  _authUnsubscribe: (() => void) | null

  // Actions
  setUser: (user: User | null) => void
  setProfile: (profile: UserProfile | null) => void
  setLoading: (loading: boolean) => void
  setBackendOffline: (offline: boolean) => void

  // Public methods
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  initialize: () => void
  cleanup: () => void
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function setSessionCookie() {
  if (typeof document === 'undefined') return
  document.cookie = 'lwsrh_is_logged_in=true; path=/; max-age=31536000; SameSite=Lax'
}

function clearSessionCookie() {
  if (typeof document === 'undefined') return
  document.cookie = 'lwsrh_is_logged_in=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
}

// In-memory profile cache to prevent duplicate Firestore reads
let _profileCacheUserId: string | null = null
let _profileCacheData: UserProfile | null = null
let _profileCacheTime = 0
const PROFILE_CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function getCachedProfile(userId: string): UserProfile | null {
  if (
    _profileCacheUserId === userId &&
    _profileCacheData &&
    Date.now() - _profileCacheTime < PROFILE_CACHE_TTL
  ) {
    return _profileCacheData
  }
  return null
}

function setCachedProfile(userId: string, profile: UserProfile) {
  _profileCacheUserId = userId
  _profileCacheData = profile
  _profileCacheTime = Date.now()
}

function clearProfileCache() {
  _profileCacheUserId = null
  _profileCacheData = null
  _profileCacheTime = 0
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    user: null,
    profile: null,
    loading: true,
    backendOffline: false,
    isInitialized: false,
    _presenceInterval: null,
    _authUnsubscribe: null,

    setUser: (user) => set({ user }),
    setProfile: (profile) => set({ profile }),
    setLoading: (loading) => set({ loading }),
    setBackendOffline: (backendOffline) => set({ backendOffline }),

    // ── Sign Out ─────────────────────────────────────────────────────────────
    signOut: async () => {
      const { _presenceInterval, user } = get()

      // Stop presence heartbeat
      if (_presenceInterval) {
        clearInterval(_presenceInterval)
      }

      if (user?.uid) {
        updateUserPresence(user.uid, 'offline')
      }

      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('isLoggingOut', 'true')
          localStorage.setItem('logging_out', 'true')
        }
        await FirebaseAuthService.signOut()

        clearProfileCache()

        if (typeof window !== 'undefined') {
          // Selective clear: preserve performance, zone, and subscription caches
          const preservedKeys = [
            'lwsrh-zone-store-v4',
            'lwsrh-subscription-cache-v1',
            'lwsrh_device_id',
            'lwsrh_is_exempt'
          ]
          const preservedData: Record<string, string> = {}
          
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key) {
              if (
                preservedKeys.includes(key) ||
                key.startsWith('lwsrh-user-zone') ||
                key.startsWith('offline_') ||
                key.startsWith('lwsrh_perf_')
              ) {
                preservedData[key] = localStorage.getItem(key) || ''
              }
            }
          }

          localStorage.clear()
          sessionStorage.clear()

          // Restore preserved data
          Object.entries(preservedData).forEach(([k, v]) => {
            localStorage.setItem(k, v)
          })
        }
        clearSessionCookie()

        set({
          user: null,
          profile: null,
          _presenceInterval: null,
          backendOffline: false,
        })

        window.location.replace('/auth')
      } catch (error) {
        console.error('[AuthStore] Sign out error:', error)
        window.location.replace('/auth')
      }
    },

    // ── Refresh Profile ───────────────────────────────────────────────────────
    refreshProfile: async () => {
      const { user } = get()
      if (!user?.uid) return

      clearProfileCache()
      try {
        const doc = await FirebaseDatabaseService.getUserProfile(user.uid)
        if (doc) {
          const profile = doc as UserProfile
          setCachedProfile(user.uid, profile)
          set({ profile })
        }
      } catch (err) {
        console.error('[AuthStore] refreshProfile failed:', err)
      }
    },

    // ── Cleanup ───────────────────────────────────────────────────────────────
    cleanup: () => {
      const { _presenceInterval, _authUnsubscribe } = get()
      if (_presenceInterval) clearInterval(_presenceInterval)
      if (_authUnsubscribe) _authUnsubscribe()
      set({ _presenceInterval: null, _authUnsubscribe: null })
    },

    // ── Initialize (call once at app boot) ────────────────────────────────────
    initialize: () => {
      const { isInitialized } = get()
      if (isInitialized) return // Only initialize once

      // Sync cookie from localStorage immediately (prevents flash on reload)
      if (typeof window !== 'undefined') {
        const hasUser = localStorage.getItem('lwsrh_has_user') === 'true'
        const hasCookie = document.cookie.includes('lwsrh_is_logged_in=true')
        if (hasUser && !hasCookie) {
          setSessionCookie()
        }
      }

      // Safety timeout: force loading=false after 30s on very slow networks
      const safetyTimeout = setTimeout(() => {
        if (get().loading) {
          console.warn('[AuthStore] Firebase init timeout — forcing loading=false')
          set({ loading: false })
        }
      }, 30000)

      // ── onAuthStateChanged — the ONLY place we react to auth state ──────────
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        clearTimeout(safetyTimeout)

        if (!firebaseUser) {
          // Logged out
          const wasLoggingOut =
            typeof window !== 'undefined' &&
            (localStorage.getItem('isLoggingOut') === 'true' ||
              localStorage.getItem('logging_out') === 'true')

          if (wasLoggingOut) {
            SessionManager.clearSessionState()
            if (typeof window !== 'undefined') {
              localStorage.setItem('lwsrh_has_user', 'false')
            }
            clearSessionCookie()
          }

          clearProfileCache()
          const { _presenceInterval } = get()
          if (_presenceInterval) {
            clearInterval(_presenceInterval)
          }

          set({
            user: null,
            profile: null,
            loading: false,
            backendOffline: false,
            _presenceInterval: null,
          })
          return
        }

        // Logged in — set user immediately so UI can show something
        set({ user: firebaseUser })

        try {
          // ── ONE profile fetch (check memory cache first) ──────────────────
          let userProfile: UserProfile | null = getCachedProfile(firebaseUser.uid)

          if (!userProfile) {
            const doc = await FirebaseDatabaseService.getUserProfile(firebaseUser.uid)
            userProfile = doc as UserProfile | null
            if (userProfile) {
              setCachedProfile(firebaseUser.uid, userProfile)
            }
          }

          set({ profile: userProfile, backendOffline: false })
          SessionManager.startActivityTracking(firebaseUser.uid)

          if (typeof window !== 'undefined') {
            localStorage.setItem('lwsrh_has_user', 'true')
            setSessionCookie()
          }

          // ── Presence: mark online + start heartbeat ───────────────────────
          updateUserPresence(firebaseUser.uid, 'online')

          const { _presenceInterval } = get()
          if (_presenceInterval) clearInterval(_presenceInterval) // clear any stale interval

          const interval = setInterval(() => {
            if (document.visibilityState !== 'hidden') {
              updateUserPresence(firebaseUser.uid, 'online')
            }
          }, 60000)

          // Visibility-change listener for tab switching
          const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
              updateUserPresence(firebaseUser.uid, 'offline')
            } else {
              updateUserPresence(firebaseUser.uid, 'online')
            }
          }

          const handleUnload = () => {
            updateUserPresence(firebaseUser.uid, 'offline')
          }

          window.addEventListener('visibilitychange', handleVisibilityChange)
          window.addEventListener('beforeunload', handleUnload)

          set({ _presenceInterval: interval })
        } catch (err) {
          console.error('[AuthStore] Backend handshake failed:', err)
          set({ backendOffline: true })
        } finally {
          set({ loading: false })
        }
      })

      set({ _authUnsubscribe: unsubscribe, isInitialized: true })
    },
  }))
)

// ─── Typed selectors (prevent unnecessary re-renders) ────────────────────────

export const selectUser = (s: AuthState) => s.user
export const selectProfile = (s: AuthState) => s.profile
export const selectAuthLoading = (s: AuthState) => s.loading
export const selectBackendOffline = (s: AuthState) => s.backendOffline
export const selectSignOut = (s: AuthState) => s.signOut
export const selectRefreshProfile = (s: AuthState) => s.refreshProfile

// ─── Convenience hook (drop-in replacement for useAuth) ──────────────────────
export function useAuth() {
  const user = useAuthStore(selectUser)
  const profile = useAuthStore(selectProfile)
  const loading = useAuthStore(selectAuthLoading)
  const signOut = useAuthStore(selectSignOut)
  const refreshProfile = useAuthStore(selectRefreshProfile)
  const backendOffline = useAuthStore(selectBackendOffline)

  return {
    user,
    profile,
    isLoading: loading && !user,
    isProfileLoading: false, // profile loads together with user now
    loading,
    signOut,
    refreshProfile,
    backendOffline,
    initialLoadComplete: !loading,
  }
}
