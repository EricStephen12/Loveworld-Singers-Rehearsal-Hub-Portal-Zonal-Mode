import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import { UserProfile } from '@/types/supabase';
import { offlineManager } from '@/utils/offlineManager';
import { dataPrefetcher } from '@/utils/dataPrefetcher';

export function useUltraFastProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Load profile with ultra-fast cache-first approach
  useEffect(() => {
    async function loadProfile() {
      try {
        console.log('🚀 Starting ultra-fast profile load...');
        const startTime = performance.now();
        
        // INSTANT: Load cached profile data immediately for zero loading time
        const cachedProfile = await getCachedProfile();
        if (cachedProfile) {
          console.log('⚡ Loading cached profile instantly (0ms)');
          setProfile(cachedProfile);
          setError(null);
          setIsInitialLoad(false);
        } else {
          // Only show loading if no cache available
          setLoading(true);
        }
        
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          throw new Error('User not authenticated');
        }
        
        // Fetch fresh profile data in background (non-blocking)
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileError) {
          console.error('Profile fetch error:', profileError);
          // If no profile exists, create a default one
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
          };
          
          setProfile(defaultProfile);
          await cacheProfile(defaultProfile);
        } else {
          setProfile(profileData);
          await cacheProfile(profileData);
        }
        
        setError(null);
        setIsInitialLoad(false);
        
        const totalTime = performance.now() - startTime;
        console.log(`🎯 Profile load time: ${totalTime.toFixed(2)}ms`);
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  // Set up real-time subscription for profile changes
  useEffect(() => {
    console.log('🔄 Setting up profile real-time subscription...');

    const profileSubscription = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles'
        },
        async (payload) => {
          console.log('👤 Profile change detected:', payload.eventType);
          
          try {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            
            // Check if this change is for the current user
            if ((payload.new as any)?.id === user.id || (payload.old as any)?.id === user.id) {
              const { data: updatedProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
              
              if (updatedProfile) {
                setProfile(updatedProfile);
                await cacheProfile(updatedProfile);
                console.log('✅ Profile updated in real-time');
              }
            }
          } catch (error) {
            console.error('Error updating profile after change:', error);
          }
        }
      )
      .subscribe();

    return () => {
      console.log('🔄 Cleaning up profile subscription...');
      supabase.removeChannel(profileSubscription);
    };
  }, []);

  // Cache profile data for instant access
  const cacheProfile = async (profileData: UserProfile) => {
    try {
      await offlineManager.cacheData('user-profile', profileData);
      console.log('✅ Profile cached for instant access');
    } catch (error) {
      console.error('Error caching profile:', error);
    }
  };

  // Get cached profile data
  const getCachedProfile = async (): Promise<UserProfile | null> => {
    try {
      return await offlineManager.getCachedData('user-profile');
    } catch (error) {
      console.error('Error getting cached profile:', error);
      return null;
    }
  };

  // Update profile with caching
  const updateProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
    try {
      console.log('🔄 updateProfile called with:', updates);
      
      if (!profile) {
        console.log('❌ No profile data available');
        return false;
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('❌ No authenticated user');
        return false;
      }
      
      console.log('👤 Updating profile for user:', user.id);
      console.log('📝 Update data:', updates);
      
      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Supabase error updating profile:', error);
        
        // If the error is about missing column, try without profile_image_url
        if (error.code === 'PGRST204' && error.message.includes('profile_image_url')) {
          console.log('🔄 Retrying update without profile_image_url column...');
          const { profile_image_url, ...updatesWithoutImage } = updates;
          
          const { data: retryProfile, error: retryError } = await supabase
            .from('profiles')
            .update(updatesWithoutImage)
            .eq('id', user.id)
            .select()
            .single();
            
          if (retryError) {
            console.error('❌ Retry also failed:', retryError);
            return false;
          }
          
          console.log('✅ Update succeeded after removing profile_image_url column');
          setProfile(retryProfile);
          await cacheProfile(retryProfile);
          return true;
        }
        
        return false;
      }
      
      if (updatedProfile) {
        console.log('✅ Profile updated successfully:', updatedProfile);
        setProfile(updatedProfile);
        await cacheProfile(updatedProfile);
        console.log('✅ Profile updated and cached');
        return true;
      }
      
      console.log('❌ No updated profile returned');
      return false;
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      return false;
    }
  };

  // Refresh profile data
  const refreshProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileData) {
        setProfile(profileData);
        await cacheProfile(profileData);
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    error,
    isInitialLoad,
    updateProfile,
    refreshProfile,
    cacheProfile,
    getCachedProfile
  };
}