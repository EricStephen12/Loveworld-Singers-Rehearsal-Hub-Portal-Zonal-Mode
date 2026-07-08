'use client';

import { create } from 'zustand'
import { PraiseNight, PraiseNightSong } from '@/types/supabase'
import { FirebaseDatabaseService } from '@/lib/firebase-database'
import { ZoneDatabaseService } from '@/lib/zone-database-service'
import { PraiseNightSongsService } from '@/lib/praise-night-songs-service'
import { isHQGroup } from '@/config/zones'
import { sanitizeImageUrl } from '@/utils/image-utils'

interface AdminState {
  pages: PraiseNight[]
  loading: boolean
  error: string | null
  currentZoneId?: string
  songsCache: Record<string, PraiseNightSong[]>
  lastFetchTime: number

  refreshData: (silent?: boolean) => Promise<void>
  getCurrentPage: (id: string) => PraiseNight | null
  getCurrentSongs: (pageId: string, forceRefresh?: boolean) => Promise<PraiseNightSong[]>
  setZoneId: (zoneId: string) => void
}

const CACHE_DURATION = 30000

async function fetchAdminData(zoneId?: string): Promise<PraiseNight[]> {
  try {
    let pages: any[] = []
    let allZoneSongs: any[] = []

    if (zoneId && isHQGroup(zoneId)) {
      pages = await FirebaseDatabaseService.getCollection('praise_nights')
    } else if (zoneId) {
      const [fetchedPages, fetchedSongs] = await Promise.all([
        ZoneDatabaseService.getPraiseNightsByZone(zoneId, 1000),
        ZoneDatabaseService.getAllSongsByZone(zoneId)
      ])
      pages = fetchedPages
      allZoneSongs = fetchedSongs
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
      bannerImage: sanitizeImageUrl((page as any).bannerImage, 'banner'),
      categoryOrder: (page as any).categoryOrder || [],
      songCount: allZoneSongs.filter((s: any) => {
        const songPageId = s.praiseNightId || s.praisenightid || s.praisenight_id || s.pageId
        if (!songPageId) return false
        return songPageId.toString() === page.id.toString()
      }).length,
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

export const useAdminData = create<AdminState>((set, get) => ({
  pages: [],
  loading: true, // Start true so it shows loading immediately before zone mounts
  error: null,
  currentZoneId: undefined,
  songsCache: {},
  lastFetchTime: 0,

  refreshData: async (silent = false) => {
    const { currentZoneId, pages } = get()
    
    // Auto-return if we recently fetched (cache logic)
    if (!silent && (Date.now() - get().lastFetchTime) < CACHE_DURATION && pages.length > 0) {
      return;
    }

    if (!silent && pages.length === 0) set({ loading: true })

    try {
      set({ error: null })
      const freshPages = await fetchAdminData(currentZoneId)
      set({ 
        pages: freshPages, 
        lastFetchTime: Date.now(),
        error: null,
        loading: false
      })
    } catch (err: any) {
      console.warn('Admin: Backend unreachable or returned error:', err)
      const errorMsg = err instanceof Error ? err.message : 'Failed to load data'
      if (get().pages.length === 0) {
        set({ error: errorMsg, loading: false })
      } else {
        set({ loading: false }) // Keep existing pages if we have them
      }
    }
  },

  getCurrentPage: (id: string) => {
    return get().pages.find(page => page.id === id) || null
  },

  getCurrentSongs: async (pageId: string, forceRefresh = false) => {
    const { songsCache, currentZoneId } = get()
    
    if (!forceRefresh && songsCache[pageId]) {
      return songsCache[pageId]
    }

    const songs = await fetchPageSongs(pageId, currentZoneId)
    set((state) => ({
      songsCache: { ...state.songsCache, [pageId]: songs }
    }))
    return songs
  },

  setZoneId: (zoneId: string) => {
    const { currentZoneId } = get()
    if (currentZoneId !== zoneId) {
      set({ currentZoneId: zoneId, pages: [], lastFetchTime: 0, songsCache: {}, loading: true })
      get().refreshData()
    }
  }
}))
