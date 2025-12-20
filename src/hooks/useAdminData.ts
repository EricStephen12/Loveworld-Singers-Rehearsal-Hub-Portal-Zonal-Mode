import { useEffect, useState } from 'react'

import { PraiseNight, PraiseNightSong } from '@/types/supabase'
import { FirebaseDatabaseService } from '@/lib/firebase-database'
import { ZoneDatabaseService } from '@/lib/zone-database-service'
import { PraiseNightSongsService } from '@/lib/praise-night-songs-service'
import { isHQGroup } from '@/config/zones'

interface AdminData {
  pages: PraiseNight[]
  loading: boolean
  error: string | null
  refreshData: () => Promise<void>
  getCurrentPage: (id: string) => PraiseNight | null
  getCurrentSongs: (pageId: string, forceRefresh?: boolean) => Promise<PraiseNightSong[]>
  setZoneId: (zoneId: string) => void
}

let adminDataCache: {
  pages: PraiseNight[]
  timestamp: number
  songs: Map<string, PraiseNightSong[]>
  zoneId?: string
} | null = null

const CACHE_DURATION = 30000

async function fetchAdminData(zoneId?: string): Promise<PraiseNight[]> {
  try {
    let pages: any[] = []
    
    if (zoneId && isHQGroup(zoneId)) {
      pages = await FirebaseDatabaseService.getCollection('praise_nights')
    } else if (zoneId) {
      pages = await ZoneDatabaseService.getPraiseNightsByZone(zoneId, 1000)
    } else {
      pages = await FirebaseDatabaseService.getCollection('praise_nights')
    }
    
    if (pages.length === 0) return []
    
    return pages.map((page) => ({
      id: page.id,
      firebaseId: page.id,
      name: (page as any).name || (page as any).title || 'Untitled Page',
      date: (page as any).date || new Date().toISOString(),
      location: (page as any).location || '',
      category: (page as any).category || 'ongoing',
      pageCategory: (page as any).pageCategory || undefined,
      bannerImage: (page as any).bannerImage || '',
      countdown: {
        days: (page as any).countdownDays || (page as any).countdown?.days || 0,
        hours: (page as any).countdownHours || (page as any).countdown?.hours || 0,
        minutes: (page as any).countdownMinutes || (page as any).countdown?.minutes || 0,
        seconds: (page as any).countdownSeconds || (page as any).countdown?.seconds || 0
      },
      songs: []
    }))
  } catch (error) {
    console.error('Admin: Error fetching data:', error)
    throw error
  }
}

async function fetchPageSongs(pageId: string, zoneId?: string): Promise<PraiseNightSong[]> {
  try {
    return await PraiseNightSongsService.getSongsByPraiseNight(pageId, zoneId)
  } catch (error) {
    console.error(`Error fetching songs for page ${pageId}:`, error)
    return []
  }
}

export function useAdminData(): AdminData {
  const [pages, setPages] = useState<PraiseNight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentZoneId, setCurrentZoneId] = useState<string | undefined>(undefined)

  const loadData = async () => {
    try {
      setError(null)
      
      if (adminDataCache && 
          (Date.now() - adminDataCache.timestamp) < CACHE_DURATION &&
          adminDataCache.zoneId === currentZoneId) {
        setPages(adminDataCache.pages)
        setLoading(false)
        return
      }
      
      const freshPages = await fetchAdminData(currentZoneId)
      
      adminDataCache = {
        pages: freshPages,
        timestamp: Date.now(),
        songs: new Map(),
        zoneId: currentZoneId
      }
      
      setPages(freshPages)
    } catch (err) {
      console.error('Admin: Failed to load data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    adminDataCache = null
    setLoading(true)
    await loadData()
  }

  const getCurrentPage = (id: string): PraiseNight | null => {
    return pages.find(page => page.id === id) || null
  }

  const getCurrentSongs = async (pageId: string, forceRefresh = false): Promise<PraiseNightSong[]> => {
    if (!forceRefresh && adminDataCache?.songs.has(pageId)) {
      return adminDataCache.songs.get(pageId)!
    }

    if (forceRefresh && adminDataCache?.songs.has(pageId)) {
      adminDataCache.songs.delete(pageId)
    }

    const songs = await fetchPageSongs(pageId, currentZoneId)
    if (adminDataCache) {
      adminDataCache.songs.set(pageId, songs)
    }

    return songs
  }

  const setZoneId = (zoneId: string) => {
    setCurrentZoneId(zoneId)
    adminDataCache = null
  }

  useEffect(() => {
    if (currentZoneId) {
      loadData()
    }
  }, [currentZoneId])

  return {
    pages,
    loading,
    error,
    refreshData,
    getCurrentPage,
    getCurrentSongs,
    setZoneId
  }
}
