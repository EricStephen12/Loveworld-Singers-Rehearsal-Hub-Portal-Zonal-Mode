import { useEffect, useState, useCallback } from 'react'

import { PraiseNight, PraiseNightSong } from '@/types/supabase'
import { FirebaseDatabaseService } from '@/lib/firebase-database'
import { ZoneDatabaseService } from '@/lib/zone-database-service'
import { PraiseNightSongsService } from '@/lib/praise-night-songs-service'
import { FirebaseMetadataService } from '@/lib/firebase-metadata-service'
import { usePraiseNightStore } from '@/stores/praiseNightStore'
import { isHQGroup } from '@/config/zones'
import { SubGroupDatabaseService } from '@/lib/subgroup-database-service'
import { sanitizeImageUrl } from '@/utils/image-utils'
import { useAuthStore } from '@/stores/authStore'

// Check if user profile allows access to a given page category
function canUserAccessCategory(profile: any, category: string, zoneId?: string): boolean {
  if (!profile) return true

  // Only HQ admins (email whitelist) are always unrestricted
  const HQ_ADMIN_EMAILS = [
    'ihenacho23@gmail.com',
    'ephraimloveworld1@gmail.com',
    'takeshopstores@gmail.com',
    'nnennawealth@gmail.com',
    'joykures@gmail.com',
    'styleirech@gmail.com',
    'lliamzelvin@gmail.com',
  ]
  if (HQ_ADMIN_EMAILS.includes((profile.email || '').toLowerCase())) return true

  // Check flat profile fields directly
  switch (category) {
    case 'ongoing':
      return profile.canAccessOngoingRehearsals !== false
    case 'pre-rehearsal':
      return profile.can_access_pre_rehearsal === true
    case 'archive':
      return profile.canSeeArchive === true
    default:
      return true
  }
}

async function fetchFirebaseData(zoneId?: string, userId?: string | null, profile?: any): Promise<PraiseNight[]> {
  try {
    let pages: any[] = []

    if (zoneId && isHQGroup(zoneId)) {
      const hqPages = await FirebaseDatabaseService.getCollection('praise_nights')
      pages = [...hqPages]
      
      if (userId) {
        try {
          const subgroupData = await SubGroupDatabaseService.getMemberRehearsals(zoneId, userId)
          if (subgroupData.subGroupRehearsals.length > 0) {
            pages = [...pages, ...subgroupData.subGroupRehearsals]
          }
        } catch (e) {
          console.error('Error fetching subgroup data for HQ user:', e)
        }
      }
    } else if (zoneId && userId) {
      const data = await SubGroupDatabaseService.getMemberRehearsals(zoneId, userId)
      pages = data?.combined || []
    } else if (zoneId) {
      pages = await ZoneDatabaseService.getPraiseNightsByZone(zoneId, 1000)
    } else {
      console.warn('️ No zoneId provided to useRealtimeData, returning empty list to prevent data leak');
      return []
    }

    const mapped: PraiseNight[] = pages.map((page) => ({
      id: page.id,
      firebaseId: page.id,
      name: (page as any).name || (page as any).title || (page as any).page_title || 'Untitled Page',
      date: (page as any).date || new Date().toISOString(),
      location: (page as any).location || '',
      category: (page as any).category || 'ongoing',
      pageCategory: (page as any).pageCategory || undefined,
      bannerImage: sanitizeImageUrl((page as any).bannerImage || (page as any).bannerimage, 'banner'),
      categoryOrder: (page as any).categoryOrder || [],
      scope: (page as any).scope || 'zone',
      scopeLabel: (page as any).scopeLabel || '',
      subGroupName: (page as any).subGroupName || '',
      countdown: {
        days: (page as any).countdownDays || (page as any).countdown?.days || (page as any).countdowndays || 0,
        hours: (page as any).countdownHours || (page as any).countdown?.hours || (page as any).countdownhours || 0,
        minutes: (page as any).countdownMinutes || (page as any).countdown?.minutes || (page as any).countdownminutes || 0,
        seconds: (page as any).countdownSeconds || (page as any).countdown?.seconds || (page as any).countdownseconds || 0
      },
      songs: [],
      createdAt: (page as any).createdAt || (page as any).created_at,
      updatedAt: (page as any).updatedAt || (page as any).updated_at
    }))

    // Filter out categories the user doesn't have access to
    if (profile) {
      return mapped.filter(page => canUserAccessCategory(profile, page.category, zoneId))
    }

    return mapped
  } catch (error) {
    console.error('Error fetching Firebase data:', error)
    return []
  }
}

export function useRealtimeData(zoneId?: string, userId?: string | null) {
  const [pages, setPages] = useState<PraiseNight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Get current user profile for permission filtering
  const profile = useAuthStore(state => state.profile)

  useEffect(() => {
    if (!zoneId) {
      setPages([])
      setLoading(false)
      return
    }

    let isMounted = true;
    const unsubscribes: (() => void)[] = [];

    async function fetchAndCache(timestampOverride?: number) {
      try {
        const firebasePages = await fetchFirebaseData(zoneId!, userId, profile)
        if (firebasePages && isMounted) {
          setPages(firebasePages)
          const cacheKey = `${zoneId}-${userId || 'public'}`
          usePraiseNightStore.getState().setPages(cacheKey, firebasePages, Date.now(), timestampOverride)
        }
      } catch (e) {
        console.error('Error in fetchAndCache:', e)
      }
    }

    async function loadInitialData() {
      try {
        setError(null)
        const cacheKey = `${zoneId}-${userId || 'public'}`
        
        const cachedStore = usePraiseNightStore.getState().getCache(cacheKey)
        const now = Date.now()
        const CACHE_TTL = 30 * 1000 // Keep it strict for revalidation

        // INSTANT RENDER FROM ZUSTAND CACHE
        if (cachedStore && isMounted) {
          setPages(cachedStore.pages)
          setLoading(false) // Show cache immediately, hide spinner
          
          // If cache is "Hot" (under 30s), we can skip the background fetch
          if (now - cachedStore.lastFetchTime < CACHE_TTL) {
            return;
          }
        }

        // BACKGROUND REVALIDATION (silently updates UI if data changed)
        await fetchAndCache()
      } catch (err) {
        console.error('Failed to load initial data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    // 1. Load Initial Data
    loadInitialData();

    // 2. Subscribe to Page Metadata (The Magic)
    const unsubPraiseNights = FirebaseMetadataService.subscribeToMetadata(zoneId, 'praise_nights', async (serverTimestamp) => {
      const cacheKey = `${zoneId}-${userId || 'public'}`
      const lastKnownTimestamp = usePraiseNightStore.getState().getCache(cacheKey)?.metadataTime || 0
      if (serverTimestamp > lastKnownTimestamp) {
        await fetchAndCache(serverTimestamp)
      }
    });
    unsubscribes.push(unsubPraiseNights);

    // 3. Subscribe to Category Metadata (Ensures category changes are picked up)
    const unsubCategories = FirebaseMetadataService.subscribeToMetadata(zoneId, 'categories', () => {

      ZoneDatabaseService.invalidateCategoriesCache(zoneId!);
    });
    unsubscribes.push(unsubCategories);

    const unsubPageCategories = FirebaseMetadataService.subscribeToMetadata(zoneId, 'page_categories', () => {
      ZoneDatabaseService.invalidatePageCategoriesCache(zoneId!);
    });
    unsubscribes.push(unsubPageCategories);

    // 4. Subscribe to Songs Metadata (Ensures rehearsal counts and song updates are picked up)
    const unsubSongs = FirebaseMetadataService.subscribeToMetadata(zoneId, 'songs', async (serverTimestamp) => {
      const cacheKey = `${zoneId}-${userId || 'public'}`
      const lastKnownTimestamp = usePraiseNightStore.getState().getCache(cacheKey)?.metadataTime || 0
      if (serverTimestamp > lastKnownTimestamp) {
        await fetchAndCache(serverTimestamp);
      }
    });
    unsubscribes.push(unsubSongs);
    return () => {
      isMounted = false;
      unsubscribes.forEach(unsub => unsub());
    }
  }, [zoneId, userId, profile])

  const getCurrentPage = useCallback((id: number | string): PraiseNight | null => {
    return pages.find(page => page.id === id || page.id === id.toString()) || null
  }, [pages])

  const getCurrentSongs = useCallback(async (pageId: number | string, forceRefresh?: boolean): Promise<PraiseNightSong[]> => {
    try {
      // Check if this is a subgroup rehearsal
      const page = pages.find(p => p.id === pageId || p.id === pageId.toString());
      if (page?.scope === 'subgroup') {
        const subgroupSongs = await SubGroupDatabaseService.getSongsByRehearsalId(String(pageId));
        return subgroupSongs.map(s => ({
          ...s,
          firebaseId: s.id,
          rehearsalCount: 0,
          updatedAt: (s.updatedAt as any)?.toISOString?.() || new Date().toISOString(),
          createdAt: (s.createdAt as any)?.toISOString?.() || new Date().toISOString()
        })) as unknown as PraiseNightSong[];
      }
      
      return await PraiseNightSongsService.getSongsByPraiseNight(String(pageId), zoneId)
    } catch (error) {
      console.error(`Error fetching songs for page ${pageId}:`, error)
      return []
    }
  }, [zoneId, pages])

  return {
    pages,
    loading,
    error,
    getCurrentPage,
    getCurrentSongs,
    refreshData: async () => {
      try {
        setError(null)

        const cacheKey = `${zoneId}-${userId || 'public'}`
        usePraiseNightStore.getState().updateMetadataTime(cacheKey, 0);

        const updatedPages = await fetchFirebaseData(zoneId!, userId, profile)
        setPages(updatedPages)

        if (zoneId) {
          usePraiseNightStore.getState().setPages(cacheKey, updatedPages, Date.now(), Date.now());
          await FirebaseMetadataService.ensureMetadataExists(zoneId, 'praise_nights')
        }
      } catch (err) {
        console.error('Error refreshing data:', err)
        setError('Failed to refresh data')
      }
    }
  }
}

function showNotification(message: string, type: 'success' | 'info' | 'warning' | 'error') {
  window.dispatchEvent(new CustomEvent('showToast', {
    detail: { message, type }
  }))
}
