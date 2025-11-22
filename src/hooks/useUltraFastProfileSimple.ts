// Ultra-Fast Profile Hook - INSTANT Loading
import { useState, useEffect, useCallback } from 'react'
import { ultraFastLoader } from '@/lib/ultra-fast-loader'
import { supabase } from '@/lib/supabase-client'

export function useUltraFastProfileSimple() {
  const [profile, setProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load profile with ultra-fast caching
  const loadProfile = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setProfile(null)
        return
      }

      // Load profile with caching
      const profileData = await ultraFastLoader.getProfile(user.id)
      setProfile(profileData)
      
      console.log('⚡ Profile loaded instantly')
    } catch (err) {
      console.error('Error loading profile:', err)
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }, [])

  // Refresh profile
  const refreshProfile = useCallback(async () => {
    ultraFastLoader.clearCache()
    await loadProfile()
  }, [loadProfile])

  // Initial load
  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  return {
    profile,
    loading,
    error,
    refreshProfile
  }
}

