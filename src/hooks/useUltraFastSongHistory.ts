import { useEffect, useState, useCallback } from 'react';
import { FirebaseDatabaseService } from '@/lib/firebase-database';
import { HistoryEntry } from '@/types/supabase';
import { offlineManager } from '@/utils/offlineManager';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase-setup';

interface SongHistoryCache {
  [songId: string]: {
    data: HistoryEntry[];
    timestamp: number;
    version: string;
  };
}

// Real-time cache durations - everything is real-time now
const CACHE_DURATION = {
  COMMENTS: 0, // No cache for comments (real-time)
  LYRICS: 0, // No cache for lyrics (real-time)
  SOLFAS: 0, // No cache for solfas (real-time)
  AUDIO: 0, // No cache for audio (real-time)
  METADATA: 0 // No cache for metadata (real-time)
};
const CACHE_KEY = 'song-history-cache';

export function useUltraFastSongHistory(songId: string | null) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Load cached history data instantly
  const loadCachedHistory = useCallback(async (numericId?: string): Promise<HistoryEntry[]> => {
    try {
      const cached = await offlineManager.getCachedData(CACHE_KEY) as SongHistoryCache;
      const cacheKey = numericId || songId!;
      if (cached && cached[cacheKey] && cacheKey) {
        const cacheEntry = cached[cacheKey];
        // No cache - always fetch fresh data
        const isExpired = true;
        
        if (!isExpired) {
          return cacheEntry.data;
        }
      }
    } catch (error) {
      console.error('Error loading cached song history:', error);
    }
    return [];
  }, [songId]);

  // Cache history data
  const cacheHistory = useCallback(async (songId: string, data: HistoryEntry[]) => {
    try {
      const cached = await offlineManager.getCachedData(CACHE_KEY) as SongHistoryCache || {};
      cached[songId] = {
        data,
        timestamp: Date.now(),
        version: Date.now().toString()
      };
      await offlineManager.cacheData(CACHE_KEY, cached);
    } catch (error) {
      console.error('Error caching song history:', error);
    }
  }, []);

  // Load history data with ultra-fast caching (fallback for when real-time fails)
  const loadHistory = useCallback(async () => {
    if (!songId) return;

    try {
      const startTime = performance.now();

      // Use Firebase document ID directly (no need to convert to numeric)
      const firebaseSongId = String(songId).trim();

      // INSTANT: Load cached data immediately for zero loading time
      const cachedHistory = await loadCachedHistory(firebaseSongId);
      if (cachedHistory.length > 0) {
        setHistory(cachedHistory);
        setError(null);
        setIsInitialLoad(false);
      } else {
        setLoading(true);
      }
      
      const historyData = await FirebaseDatabaseService.getCollectionWhere('song_history', 'song_id', '==', firebaseSongId);
      
      if (!historyData) {
        console.error('Error fetching song history from Firebase');
        setError('Failed to fetch song history');
        return;
      }

      // Transform the data to match our HistoryEntry interface
      const historyEntries = (historyData || []).map((entry: any) => ({
        id: entry.id,
        type: entry.type,
        title: entry.title,
        description: entry.description,
        old_value: entry.old_value,
        new_value: entry.new_value,
        created_by: entry.created_by,
        date: entry.created_at,
        version: entry.title
      }));

            setHistory(historyEntries);
      setError(null);
      setIsInitialLoad(false);

      // Cache the fresh data using the Firebase ID for consistency
      await cacheHistory(firebaseSongId, historyEntries);

      const endTime = performance.now();

    } catch (error) {
      console.error('Error loading song history:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [songId, loadCachedHistory, cacheHistory]);

  // Set up real-time listener for history updates
  useEffect(() => {
    if (!songId) {
      setHistory([]);
      setError(null);
      setLoading(false);
      setIsInitialLoad(true);
      return;
    }

    setLoading(true);
    setIsInitialLoad(true);

    // First, try to load cached data for instant display
    loadCachedHistory(songId).then(cachedHistory => {
      if (cachedHistory.length > 0) {
        setHistory(cachedHistory);
      }
    });

    // Load history using the original method as fallback
    loadHistory();

    // Set up real-time listener for history changes
    const firebaseSongId = String(songId).trim();
    const historyQuery = query(
      collection(db, 'song_history'),
      where('song_id', '==', firebaseSongId),
      orderBy('created_at', 'desc') // Order by creation time, newest first
    );

    const unsubscribe = onSnapshot(
      historyQuery,
      (snapshot) => {
        try {
          // Transform the real-time data to match our HistoryEntry interface
          const historyEntries = snapshot.docs.map((doc) => {
            const data = doc.data();
            
            // Handle different date formats from Firebase
            let processedDate;
            if (data.created_at && typeof data.created_at.toDate === 'function') {
              // Firestore Timestamp
              processedDate = data.created_at.toDate();
            } else if (data.created_at && typeof data.created_at === 'object' && data.created_at.seconds) {
              // Firestore Timestamp as seconds/number
              processedDate = new Date(data.created_at.seconds * 1000);
            } else if (data.created_at && typeof data.created_at === 'string') {
              // String date
              processedDate = new Date(data.created_at);
            } else if (data.created_at && typeof data.created_at === 'number') {
              // Unix timestamp
              processedDate = new Date(data.created_at);
            } else {
              // Fallback to current date
              processedDate = new Date();
            }
            
            return {
              id: doc.id,
              type: data.type,
              title: data.title,
              description: data.description,
              old_value: data.old_value,
              new_value: data.new_value,
              created_by: data.created_by,
              date: processedDate,
              version: data.title
            };
          });

                    setHistory(historyEntries);
          setError(null);
          setIsInitialLoad(false);
          setLoading(false);

          // Cache the fresh data using the Firebase ID for consistency
          cacheHistory(firebaseSongId, historyEntries);
          
        } catch (error) {
          console.error('Error processing real-time history update:', error);
          setError(error instanceof Error ? error.message : 'Unknown error');
          setLoading(false);
        }
      },
      (error) => {
        console.error('Error in real-time history listener:', error);
        setError(error.message || 'Failed to listen for history updates');
        setLoading(false);
      }
    );

    // Clean up the listener when component unmounts or songId changes
    return () => {
      unsubscribe();
    };
  }, [songId, cacheHistory, loadCachedHistory, loadHistory]);

  // Refresh history data (still available for manual refresh)
  const refreshHistory = useCallback(async () => {
    if (!songId) return;
    
    setLoading(true);
    try {
            const cached = await offlineManager.getCachedData(CACHE_KEY) as SongHistoryCache || {};
      delete cached[songId];
      await offlineManager.cacheData(CACHE_KEY, cached);
      
      // Reload fresh data
      await loadHistory();
    } catch (error) {
      console.error('Error refreshing song history:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [songId, loadHistory]);

  // Get filtered history by type
  const getHistoryByType = useCallback((type: 'lyrics' | 'solfas' | 'audio' | 'comments' | 'metadata'): HistoryEntry[] => {
    const typeMapping: Record<string, string[]> = {
      'lyrics': ['lyrics'],
      'solfas': ['solfas'],
      'audio': ['audio'],
      'comments': ['comments'],
      'metadata': ['song-details', 'personnel', 'music-details']
    };
    
    const mappedTypes = typeMapping[type] || [type];
    return history.filter(entry => mappedTypes.includes(entry.type));
  }, [history]);

  return {
    history,
    loading,
    error,
    isInitialLoad,
    refreshHistory,
    getHistoryByType
  };
}
