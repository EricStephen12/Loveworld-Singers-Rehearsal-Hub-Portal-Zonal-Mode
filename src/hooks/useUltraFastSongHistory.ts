import { useEffect, useState, useCallback } from 'react';
import { FirebaseDatabaseService } from '@/lib/firebase-database';
import { HistoryEntry } from '@/types/supabase';
import { offlineManager } from '@/utils/offlineManager';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase-setup';

function extractDateFromTitle(title: string): number {
  if (!title) return 0;
  const match = title.match(/\(([^)]+)\)/);
  if (match) {
    const dateStr = match[1].replace(/(\d+)(st|nd|rd|th)/, '$1');
    const parsed = new Date(dateStr).getTime();
    if (!isNaN(parsed)) return parsed;
  }
  return 0;
}

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
      const numericSongId = !isNaN(Number(songId)) ? Number(songId) : null;

      // INSTANT: Load cached data immediately for zero loading time
      const cachedHistory = await loadCachedHistory(firebaseSongId);
      if (cachedHistory.length > 0) {
        setHistory(cachedHistory);
        setError(null);
        setIsInitialLoad(false);
      } else {
        setLoading(true);
      }
      
      const { getHistoryBySongId } = await import('@/lib/history-service');
      const [historyDataString, historyDataNum, supabaseHistory] = await Promise.all([
        FirebaseDatabaseService.getCollectionWhere('song_history', 'song_id', '==', firebaseSongId),
        numericSongId !== null ? FirebaseDatabaseService.getCollectionWhere('song_history', 'song_id', '==', numericSongId) : Promise.resolve([]),
        numericSongId !== null ? getHistoryBySongId(numericSongId) : Promise.resolve([])
      ]);

      const combinedMap = new Map();

      const processAndAdd = (entry: any) => {
        if (!entry || !entry.id) return;
        let processedDate;
        if (entry.created_at && typeof entry.created_at.toDate === 'function') {
          processedDate = entry.created_at.toDate();
        } else if (entry.created_at && typeof entry.created_at === 'object' && entry.created_at.seconds) {
          processedDate = new Date(entry.created_at.seconds * 1000);
        } else if (entry.created_at && typeof entry.created_at === 'string') {
          processedDate = new Date(entry.created_at);
        } else if (entry.created_at && typeof entry.created_at === 'number') {
          processedDate = new Date(entry.created_at);
        } else if (entry.date instanceof Date) {
          processedDate = entry.date;
        } else if (entry.date) {
          processedDate = new Date(entry.date);
        } else {
          processedDate = new Date();
        }

        const formatted = {
          id: String(entry.id),
          type: entry.type || 'metadata',
          title: entry.title || entry.version || 'Update',
          description: entry.description || '',
          old_value: entry.old_value || '',
          new_value: entry.new_value || '',
          created_by: entry.created_by || 'admin',
          date: processedDate,
          version: entry.version || entry.title || 'Update',
          created_at: processedDate.toISOString()
        };

        combinedMap.set(formatted.id, formatted);
      };

      (supabaseHistory || []).forEach((item: any) => processAndAdd(item));
      (historyDataString || []).forEach((item: any) => processAndAdd(item));
      (historyDataNum || []).forEach((item: any) => processAndAdd(item));

      const historyEntries = Array.from(combinedMap.values());

      // Explicitly sort newest first by timestamp in memory (with smart title date tie-breaking)
      historyEntries.sort((a: any, b: any) => {
        const timeA = a.date instanceof Date ? a.date.getTime() : new Date(a.date || 0).getTime();
        const timeB = b.date instanceof Date ? b.date.getTime() : new Date(b.date || 0).getTime();
        if (Math.abs(timeB - timeA) < 60000) { // within 1 minute
          const titleDateA = extractDateFromTitle(a.title);
          const titleDateB = extractDateFromTitle(b.title);
          if (titleDateA > 0 && titleDateB > 0) {
            return titleDateB - titleDateA;
          }
        }
        return timeB - timeA;
      });

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
    const numericSongId = !isNaN(Number(songId)) ? Number(songId) : null;
    
    const historyQuery = query(
      collection(db, 'song_history'),
      where('song_id', 'in', numericSongId !== null ? [firebaseSongId, numericSongId] : [firebaseSongId]),
      orderBy('created_at', 'desc') // Order by creation time, newest first
    );

    const unsubscribe = onSnapshot(
      historyQuery,
      (snapshot) => {
        try {
          setHistory(prevHistory => {
            const combinedMap = new Map();
            // Preserve existing entries (including Supabase)
            prevHistory.forEach(item => combinedMap.set(item.id, item));

            // Merge fresh real-time Firebase entries
            snapshot.docs.forEach((doc) => {
              const data = doc.data();
              let processedDate;
              if (data.created_at && typeof data.created_at.toDate === 'function') {
                processedDate = data.created_at.toDate();
              } else if (data.created_at && typeof data.created_at === 'object' && data.created_at.seconds) {
                processedDate = new Date(data.created_at.seconds * 1000);
              } else if (data.created_at && typeof data.created_at === 'string') {
                processedDate = new Date(data.created_at);
              } else if (data.created_at && typeof data.created_at === 'number') {
                processedDate = new Date(data.created_at);
              } else {
                processedDate = new Date();
              }

              const formatted = {
                id: String(doc.id),
                type: data.type || 'metadata',
                title: data.title || data.version || 'Update',
                description: data.description || '',
                old_value: data.old_value || '',
                new_value: data.new_value || '',
                created_by: data.created_by || 'admin',
                date: processedDate,
                version: data.title || data.version || 'Update'
              };

              combinedMap.set(formatted.id, formatted);
            });

            const updatedEntries = Array.from(combinedMap.values());
            updatedEntries.sort((a: any, b: any) => {
              const timeA = a.date instanceof Date ? a.date.getTime() : new Date(a.date || 0).getTime();
              const timeB = b.date instanceof Date ? b.date.getTime() : new Date(b.date || 0).getTime();
              if (Math.abs(timeB - timeA) < 60000) {
                const titleDateA = extractDateFromTitle(a.title);
                const titleDateB = extractDateFromTitle(b.title);
                if (titleDateA > 0 && titleDateB > 0) {
                  return titleDateB - titleDateA;
                }
              }
              return timeB - timeA;
            });

            cacheHistory(firebaseSongId, updatedEntries);
            return updatedEntries;
          });

          setError(null);
          setIsInitialLoad(false);
          setLoading(false);
        } catch (error) {
 console.error('Error processing real-time history update:', error);
          setError(error instanceof Error ? error.message : 'Unknown error');
          setLoading(false);
        }
      },
      (error) => {
        // FAIL-SAFE: If real-time listener fails (e.g. Permission Denied), 
        // fall back to the robust BackendAPI method
        console.warn('[SongHistory] Real-time listener failed, falling back to BackendAPI:', error.code || error.message);
        loadHistory();
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
