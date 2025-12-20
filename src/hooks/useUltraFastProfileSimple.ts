import { useState, useEffect, useCallback } from 'react'

import { ultraFastLoader } from '@/lib/ultra-fast-loader'
import { supabase } from '@/lib/supabase-client'

export function useUltraFastProfileSimple() {
  const [profile, setProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setProfile(null)
        return
      }

      const profileData = await ultraFastLoader.getProfile(user.id)
      setProfile(profileData)
    } catch (err) {
      console.error('Error loading profile:', err)
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    ultraFastLoader.clearCache()
    await loadProfile()
  }, [loadProfile])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  return { profile, loading, error, refreshProfile }
}
