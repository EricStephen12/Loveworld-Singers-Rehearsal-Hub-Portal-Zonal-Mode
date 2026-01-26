import { useEffect, useState } from 'react'

import { PraiseNight, PraiseNightSong } from '@/types/supabase'
import { FirebaseDatabaseService } from '@/lib/firebase-database'
import { ZoneDatabaseService } from '@/lib/zone-database-service'
import { PraiseNightSongsService } from '@/lib/praise-night-songs-service'
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
      pages = await FirebaseDatabaseService.getCollection('praise_nights')
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
    if (!zoneId) return

    async function loadData() {
      try {
        setError(null)
        const cacheKey = `praise-nights-data-${zoneId}`
        const cachedData = lowDataOptimizer.get(cacheKey)

        if (cachedData) {
          setPages(cachedData)
          // Don't set loading to false yet if we're going to revalidate, 
          // but allow UI to show data
        }

        // Background revalidation: Always fetch fresh data if online,
        // or if cache is expired/missing.
        // We only skip background fetch if it's very slow connection and we already have cache.
        const isExtremelySlow = lowDataOptimizer.isLowDataMode();

        if (!cachedData || !isExtremelySlow) {
          const firebasePages = await fetchFirebaseData(zoneId)
          if (firebasePages && firebasePages.length > 0) {
            setPages(firebasePages)
            lowDataOptimizer.set(cacheKey, firebasePages)
          }
        }
      } catch (err) {
        console.error('Failed to load data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load data')

        const cacheKey = `praise-nights-data-${zoneId}`
        const cachedData = lowDataOptimizer.get(cacheKey)
        if (cachedData) {
          setPages(cachedData)
        }
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [zoneId])

  const getCurrentPage = (id: number | string): PraiseNight | null => {
    return pages.find(page => page.id === id || page.id === id.toString()) || null
  }

  const getCurrentSongs = async (pageId: number | string): Promise<PraiseNightSong[]> => {
    try {
      return await PraiseNightSongsService.getSongsByPraiseNight(String(pageId), zoneId)
    } catch (error) {
      console.error(`Error fetching songs for page ${pageId}:`, error)
      return []
    }
  }

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

        const cacheKey = `praise-nights-data-${zoneId}`
        lowDataOptimizer.set(cacheKey, updatedPages)
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
