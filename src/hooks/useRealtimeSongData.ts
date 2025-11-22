"use client";

import { useState, useEffect, useCallback } from 'react';
import { PraiseNightSong } from '@/types/supabase';
import { PraiseNightSongsService } from '@/lib/praise-night-songs-service';

interface UseRealtimeSongDataProps {
  songId: string | null;
  enabled?: boolean;
}

export function useRealtimeSongData({ songId, enabled = true }: UseRealtimeSongDataProps) {
  const [songData, setSongData] = useState<PraiseNightSong | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch fresh song data without any caching
  const fetchSongData = useCallback(async () => {
    if (!songId || !enabled) return;

    setLoading(true);
    setError(null);

    try {
      console.log('🔄 [FRESH] Fetching real-time song data for:', songId);

      // Fetch directly from new praise_night_songs table
      const freshSongData = await PraiseNightSongsService.getSongById(songId);

      if (freshSongData) {
        console.log('✅ [FRESH] Real-time song data fetched:', freshSongData.title);
        setSongData(freshSongData);
      } else {
        console.log('⚠️ [FRESH] No song data found for:', songId);
        setSongData(null);
      }
    } catch (error) {
      console.error('❌ [FRESH] Error fetching real-time song data:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch song data');
    } finally {
      setLoading(false);
    }
  }, [songId, enabled]);

  // Real-time refresh every 1 second for song data
  useEffect(() => {
    if (!songId || !enabled) return;

    // Initial fetch
    fetchSongData();

    // Set up real-time polling
    const interval = setInterval(() => {
      fetchSongData();
    }, 1000); // 1 second for real-time updates

    return () => clearInterval(interval);
  }, [songId, enabled, fetchSongData]);

  // Manual refresh function
  const refreshSongData = useCallback(() => {
    fetchSongData();
  }, [fetchSongData]);

  return {
    songData,
    loading,
    error,
    refreshSongData
  };
}
