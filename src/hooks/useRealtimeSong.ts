import { useEffect, useState, useCallback } from 'react'
import { PraiseNightSong } from '@/types/supabase'
import { PraiseNightSongsService } from '@/lib/praise-night-songs-service'
import { FirebaseMetadataService } from '@/lib/firebase-metadata-service'

/**
 * Hook to fetch and subscribe to realtime updates for a specific song.
 * 
 * CONCEPT:
 * - Fetches song data on mount (1 read)
 * - Subscribes to song metadata changes (1 read, stays connected)
 * - Re-fetches song data when metadata changes (1 read per update)
 * 
 * This enables instant lyrics updates when admins edit songs, without
 * requiring users to close and reopen the modal.
 */
export function useRealtimeSong(
    zoneId: string | undefined,
    praiseNightId: string | undefined,
    songId: string | undefined
) {
    const [song, setSong] = useState<PraiseNightSong | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Fetch song data
    const fetchSong = useCallback(async () => {
        if (!songId || !zoneId) {
            setSong(null)
            setLoading(false)
            return
        }

        try {
            setError(null)

            const songData = await PraiseNightSongsService.getSongById(songId, zoneId)
            setSong(songData)
        } catch (err) {
            console.error('Error fetching song:', err)
            setError(err instanceof Error ? err.message : 'Failed to fetch song')
        } finally {
            setLoading(false)
        }
    }, [songId, zoneId])

    // Manual refresh function (bypasses metadata, forces fetch)
    const refreshSong = useCallback(async () => {
        setLoading(true)
        await fetchSong()
    }, [fetchSong])

    useEffect(() => {
        if (!zoneId || !praiseNightId || !songId) {
            setSong(null)
            setLoading(false)
            return
        }

        // 1. Initial fetch
        fetchSong()

        // 2. Subscribe to metadata changes

        const unsubscribe = FirebaseMetadataService.subscribeToSongMetadata(
            zoneId,
            praiseNightId,
            songId,
            async (timestamp) => {
                if (timestamp > 0) {
                    // Metadata changed! Re-fetch the song

                    await fetchSong()
                }
            }
        )

        // 3. Cleanup on unmount
        return () => {

            unsubscribe()
        }
    }, [zoneId, praiseNightId, songId, fetchSong])

    return {
        song,
        loading,
        error,
        refreshSong
    }
}
