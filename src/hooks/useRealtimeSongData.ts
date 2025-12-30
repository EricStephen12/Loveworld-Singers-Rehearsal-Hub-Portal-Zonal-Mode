'use client'

import { useState, useEffect, useCallback } from 'react'

import { PraiseNightSong } from '@/types/supabase'
import { PraiseNightSongsService } from '@/lib/praise-night-songs-service'

interface UseRealtimeSongDataProps {
  songId: string | null
  enabled?: boolean
  zoneId?: string | null
}

export function useRealtimeSongData({ songId, enabled = true, zoneId }: UseRealtimeSongDataProps) {
  const [songData, setSongData] = useState<PraiseNightSong | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSongData = useCallback(async () => {
    if (!songId || !enabled) return

    setLoading(true)
    setError(null)

    try {
      const freshSongData = await PraiseNightSongsService.getSongById(songId, zoneId || undefined)
      setSongData(freshSongData || null)
    } catch (error) {
      console.error('Error fetching song data:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch song data')
    } finally {
      setLoading(false)
    }
  }, [songId, enabled, zoneId])

  useEffect(() => {
    if (!songId || !enabled) return

    fetchSongData()
    const interval = setInterval(fetchSongData, 1000)
    return () => clearInterval(interval)
  }, [songId, enabled, fetchSongData])

  return {
    songData,
    loading,
    error,
    refreshSongData: fetchSongData
  }
}
