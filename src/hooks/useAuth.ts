// ============================================
// SIMPLE AUTH HOOK - Instagram/TikTok Style
// ============================================
// Just wraps the AuthContext. No Zustand. No complexity.
// OPTIMIZED: Uses localStorage cache to prevent repeated Firestore reads

import { useAuthContext } from '@/contexts/AuthContext'
import { useState, useEffect, useRef, useCallback } from 'react'
import { FirebaseDatabaseService } from '@/lib/firebase-database'
import type { UserProfile } from '@/types/supabase'

// Profile cache with 5 minute TTL
const PROFILE_CACHE_KEY = 'lwsrh-profile-cache-v1'
const PROFILE_CACHE_TTL = 5 * 60 * 1000 // 5 minutes

interface ProfileCache {
  userId: string
  profile: UserProfile
  timestamp: number
}

function getProfileCache(userId: string): UserProfile | null {
  if (typeof window === 'undefined') return null
  try {
    const cached = localStorage.getItem(PROFILE_CACHE_KEY)
    if (!cached) return null
    const data: ProfileCache = JSON.parse(cached)
    // Check if cache is for current user and not expired
    if (data.userId === userId && Date.now() - data.timestamp < PROFILE_CACHE_TTL) {
      return data.profile
    }
    return null
  } catch {
    return null
  }
}

function setProfileCache(userId: string, profile: UserProfile) {
  if (typeof window === 'undefined') return
  try {
    const data: ProfileCache = { userId, profile, timestamp: Date.now() }
    localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(data))
  } catch {
    // Ignore storage errors
  }
}

function clearProfileCache() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(PROFILE_CACHE_KEY)
}

export function useAuth() {
  const { user, loading, signOut } = useAuthContext()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const lastFetchedUserId = useRef<string | null>(null)
  const isFetching = useRef(false)

  // Fetch profile when user changes (with caching to prevent repeated reads)
  useEffect(() => {
    if (!user?.uid) {
      setProfile(null)
      lastFetchedUserId.current = null
      clearProfileCache()
      return
    }

    // Skip if already fetched for this user
    if (lastFetchedUserId.current === user.uid && profile) {
      return
    }

    // Check cache first
    const cachedProfile = getProfileCache(user.uid)
    if (cachedProfile) {
      setProfile(cachedProfile)
      lastFetchedUserId.current = user.uid
      return
    }

    // Prevent duplicate fetches
    if (isFetching.current) return
    isFetching.current = true

    setProfileLoading(true)
    FirebaseDatabaseService.getDocument('profiles', user.uid)
      .then((doc) => {
        if (doc) {
          const profileData = doc as UserProfile
          setProfile(profileData)
          setProfileCache(user.uid, profileData)
          lastFetchedUserId.current = user.uid
        }
      })
      .catch((err) => {
        console.error('Failed to load profile:', err)
      })
      .finally(() => {
        setProfileLoading(false)
        isFetching.current = false
      })
  }, [user?.uid])

  const refreshProfile = useCallback(async () => {
    if (!user?.uid) return
    clearProfileCache() // Clear cache to force fresh fetch
    const doc = await FirebaseDatabaseService.getDocument('profiles', user.uid)
    if (doc) {
      const profileData = doc as UserProfile
      setProfile(profileData)
      setProfileCache(user.uid, profileData)
    }
  }, [user?.uid])

  return {
    user,
    profile,
    // Only report loading if we're checking auth AND have no user yet
    // Once we have a user, show content even if profile is still loading
    isLoading: loading && !user,
    isProfileLoading: profileLoading,
    signOut,
    refreshProfile
  }
}
