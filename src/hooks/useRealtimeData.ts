import { useEffect, useState, useCallback } from 'react'

import { PraiseNight, PraiseNightSong } from '@/types/supabase'
import { FirebaseDatabaseService } from '@/lib/firebase-database'
import { ZoneDatabaseService } from '@/lib/zone-database-service'
import { PraiseNightSongsService } from '@/lib/praise-night-songs-service'
import { FirebaseMetadataService } from '@/lib/firebase-metadata-service'
import { lowDataOptimizer } from '@/utils/low-data-optimizer'
import { isHQGroup } from '@/config/zones'

async function fetchFirebaseData(zoneId?: string): Promise<PraiseNight[]> {
  try {
    let pages: any[] = []

    if (zoneId && isHQGroup(zoneId)) {
      pages = await FirebaseDatabaseService.getCollection('praise_nights')
    } else if (zoneId) {
      pages = await ZoneDatabaseService.getPraiseNightsByZone(zoneId, 1000)
    } else {
      // If no zoneId is provided, do NOT fall back to fetching all praise nights (data leak prevention)
      // This happens when app is restoring state and zoneId is temporarily undefined
      console.warn('⚠️ No zoneId provided to useRealtimeData, returning empty list to prevent data leak');
      return []
    }

    return pages.map((page) => ({
      id: page.id,
      firebaseId: page.id,
      name: (page as any).name || (page as any).title || (page as any).page_title || 'Untitled Page',
      date: (page as any).date || new Date().toISOString(),
      location: (page as any).location || '',
      category: (page as any).category || 'ongoing',
      pageCategory: (page as any).pageCategory || undefined,
      bannerImage: (page as any).bannerImage || (page as any).bannerimage || '',
      categoryOrder: (page as any).categoryOrder || [], // ✅ CRITICAL: Added for category reordering
      countdown: {
        days: (page as any).countdownDays || (page as any).countdown?.days || (page as any).countdowndays || 0,
        hours: (page as any).countdownHours || (page as any).countdown?.hours || (page as any).countdownhours || 0,
        minutes: (page as any).countdownMinutes || (page as any).countdown?.minutes || (page as any).countdownminutes || 0,
        seconds: (page as any).countdownSeconds || (page as any).countdown?.seconds || (page as any).countdownseconds || 0
      },
      songs: []
    }))
  } catch (error) {
    console.error('Error fetching Firebase data:', error)
    return []
  }
}

export function useRealtimeData(zoneId?: string) {
  const [pages, setPages] = useState<PraiseNight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!zoneId) {
      // Active Purge: Ensure no stale global data is lurking in the 'undefined' cache slot
      if (typeof lowDataOptimizer.remove === 'function') {
        lowDataOptimizer.remove('praise-nights-data-undefined');
        lowDataOptimizer.remove('praise-nights-data-null');
      }
      setPages([])
      setLoading(false)
      return
    }

    let isMounted = true;
    const unsubscribes: (() => void)[] = [];

    // Helper to fetch and update cache
    async function fetchAndCache(timestampOverride?: number) {
      try {
        const firebasePages = await fetchFirebaseData(zoneId!)
        if (firebasePages && isMounted) {
          setPages(firebasePages)
          const cacheKey = `praise-nights-data-${zoneId}`
          const lastFetchKey = `praise-nights-fetch-time-${zoneId}`
          const metadataKey = `praise-nights-metadata-time-${zoneId}`

          lowDataOptimizer.set(cacheKey, firebasePages)
          lowDataOptimizer.set(lastFetchKey, Date.now())

          if (timestampOverride) {
            lowDataOptimizer.set(metadataKey, timestampOverride)
          }
        }
      } catch (e) {
        console.error('Error in fetchAndCache:', e)
      }
    }

    async function loadInitialData() {
      try {
        setError(null)
        const cacheKey = `praise-nights-data-${zoneId}`
        const lastFetchKey = `praise-nights-fetch-time-${zoneId}`

        const cachedData = lowDataOptimizer.get(cacheKey)
        const lastFetchTime = lowDataOptimizer.get(lastFetchKey)
        const now = Date.now()
        const CACHE_TTL = 5 * 60 * 1000 // 5 Minutes

        const isCacheValid = cachedData && lastFetchTime && (now - lastFetchTime < CACHE_TTL)

        if (isCacheValid) {

          if (isMounted) setPages(cachedData)
          setLoading(false)
        } else {

          if (cachedData && isMounted) setPages(cachedData)
          await fetchAndCache()
        }
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
      const lastKnownTimestamp = lowDataOptimizer.get(`praise-nights-metadata-time-${zoneId}`) || 0
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

    return () => {
      isMounted = false;

      unsubscribes.forEach(unsub => unsub());
    }
  }, [zoneId])

  const getCurrentPage = useCallback((id: number | string): PraiseNight | null => {
    return pages.find(page => page.id === id || page.id === id.toString()) || null
  }, [pages])

  const getCurrentSongs = useCallback(async (pageId: number | string, forceRefresh?: boolean): Promise<PraiseNightSong[]> => {
    try {
      // Note: forceRefresh parameter added for API compatibility with useAdminData
      // Currently not used as PraiseNightSongsService.getSongsByPraiseNight always fetches fresh data
      return await PraiseNightSongsService.getSongsByPraiseNight(String(pageId), zoneId)
    } catch (error) {
      console.error(`Error fetching songs for page ${pageId}:`, error)
      return []
    }
  }, [zoneId])

  return {
    pages,
    loading,
    error,
    getCurrentPage,
    getCurrentSongs,
    refreshData: async () => {
      try {
        setLoading(true)
        setError(null)


        const updatedPages = await fetchFirebaseData(zoneId)
        setPages(updatedPages)

        if (zoneId) {
          const cacheKey = `praise-nights-data-${zoneId}`
          const lastFetchKey = `praise-nights-fetch-time-${zoneId}`

          lowDataOptimizer.set(cacheKey, updatedPages)
          lowDataOptimizer.set(lastFetchKey, Date.now()) // Reset timer

          // Also update metadata timestamp to avoid double-fetch
          // (Since we just fetched fresh data, we are conceptually "up to date")
          // slightly risky if another user updated EXACTLY now, but acceptable for manual refresh
          await FirebaseMetadataService.ensureMetadataExists(zoneId, 'praise_nights')
        }
      } catch (err) {
        console.error('Error refreshing data:', err)
        setError('Failed to refresh data')
      } finally {
        setLoading(false)
      }
    }
  }
}

function showNotification(message: string, type: 'success' | 'info' | 'warning' | 'error') {
  window.dispatchEvent(new CustomEvent('showToast', {
    detail: { message, type }
  }))
}
