import { useEffect, useState } from 'react'

import { supabase } from '@/lib/supabase-client'
import { UserProfile } from '@/types/supabase'
import { offlineManager } from '@/utils/offlineManager'

export function useUltraFastProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  const cacheProfile = async (profileData: UserProfile) => {
    try {
      await offlineManager.cacheData('user-profile', profileData)
    } catch (error) {
      console.error('Error caching profile:', error)
    }
  }

  const getCachedProfile = async (): Promise<UserProfile | null> => {
    try {
      return await offlineManager.getCachedData('user-profile')
    } catch (error) {
      console.error('Error getting cached profile:', error)
      return null
    }
  }
  
  useEffect(() => {
    async function loadProfile() {
      try {
        const cachedProfile = await getCachedProfile()
        if (cachedProfile) {
          setProfile(cachedProfile)
          setError(null)
          setIsInitialLoad(false)
        } else {
          setLoading(true)
        }
        
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) throw new Error('User not authenticated')
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (profileError) {
          const defaultProfile: UserProfile = {
            id: user.id,
            first_name: user.user_metadata?.first_name || '',
            middle_name: user.user_metadata?.middle_name || '',
            last_name: user.user_metadata?.last_name || '',
            email: user.email || '',
            phone_number: '',
            gender: undefined,
            birthday: '',
            region: '',
            zone: '',
            church: '',
            designation: undefined,
            administration: undefined,
            social_provider: 'email',
            social_id: user.email || '',
            profile_image_url: undefined,
            profile_completed: false,
            email_verified: user.email_confirmed_at ? true : false,
            created_at: user.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          
          setProfile(defaultProfile)
          await cacheProfile(defaultProfile)
        } else {
          setProfile(profileData)
          await cacheProfile(profileData)
        }
        
        setError(null)
        setIsInitialLoad(false)
      } catch (err) {
        console.error('Error loading profile:', err)
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  useEffect(() => {
    const profileSubscription = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        async (payload) => {
          try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            
            if ((payload.new as any)?.id === user.id || (payload.old as any)?.id === user.id) {
              const { data: updatedProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()
              
              if (updatedProfile) {
                setProfile(updatedProfile)
                await cacheProfile(updatedProfile)
              }
            }
          } catch (error) {
            console.error('Error updating profile after change:', error)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(profileSubscription)
    }
  }, [])

  const updateProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
    try {
      if (!profile) return false
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false
      
      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()
      
      if (error) {
        // Retry without profile_image_url if column doesn't exist
        if (error.code === 'PGRST204' && error.message.includes('profile_image_url')) {
          const { profile_image_url, ...updatesWithoutImage } = updates
          
          const { data: retryProfile, error: retryError } = await supabase
            .from('profiles')
            .update(updatesWithoutImage)
            .eq('id', user.id)
            .select()
            .single()
            
          if (retryError) return false
          
          setProfile(retryProfile)
          await cacheProfile(retryProfile)
          return true
        }
        return false
      }
      
      if (updatedProfile) {
        setProfile(updatedProfile)
        await cacheProfile(updatedProfile)
        return true
      }
      
      return false
    } catch (error) {
      console.error('Error updating profile:', error)
      return false
    }
  }

  const refreshProfile = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (profileData) {
        setProfile(profileData)
        await cacheProfile(profileData)
      }
    } catch (error) {
      console.error('Error refreshing profile:', error)
    } finally {
      setLoading(false)
    }
  }

  return {
    profile,
    loading,
    error,
    isInitialLoad,
    updateProfile,
    refreshProfile,
    cacheProfile,
    getCachedProfile
  }
}
