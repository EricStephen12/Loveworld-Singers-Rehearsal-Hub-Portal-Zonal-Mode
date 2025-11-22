import { useEffect, useState } from 'react';
import { PraiseNight, PraiseNightSong } from '@/types/supabase';
import { FirebaseDatabaseService } from '@/lib/firebase-database';
import { PraiseNightSongsService } from '@/lib/praise-night-songs-service';

interface AdminData {
  pages: PraiseNight[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  getCurrentPage: (id: string) => PraiseNight | null;
  getCurrentSongs: (pageId: string, forceRefresh?: boolean) => Promise<PraiseNightSong[]>;
}

// Cache for admin data
let adminDataCache: {
  pages: PraiseNight[];
  timestamp: number;
  songs: Map<string, PraiseNightSong[]>;
} | null = null;

const CACHE_DURATION = 30000; // 30 seconds cache

// Fast Firebase data fetching optimized for admin
async function fetchAdminData(): Promise<PraiseNight[]> {
  try {
    console.log('🚀 Admin: Fast fetching pages...');
    const startTime = performance.now();
    
    // Get pages from the main collection only (no fallbacks for speed)
    const pages = await FirebaseDatabaseService.getCollection('praise_nights');
    console.log(`⚡ Admin: Pages fetched in ${(performance.now() - startTime).toFixed(2)}ms`);
    
    if (pages.length === 0) {
      console.log('📄 Admin: No pages found in praise_nights collection');
      return [];
    }
    
    // Map pages to correct format (minimal processing)
    const mappedPages = pages.map((page, index) => {
      console.log('📄 Admin: Mapping page:', {
        firebaseId: page.id,
        name: (page as any).name,
        category: (page as any).category
      });

      return {
        id: page.id, // Use Firebase-generated ID as the main ID
        firebaseId: page.id, // Keep for backward compatibility
        name: (page as any).name || (page as any).title || 'Untitled Page',
        date: (page as any).date || new Date().toISOString(),
        location: (page as any).location || '',
        category: (page as any).category || 'ongoing',
        pageCategory: (page as any).pageCategory || undefined, // Add page category field
        bannerImage: (page as any).bannerImage || '',
        countdown: {
          days: (page as any).countdownDays || (page as any).countdown?.days || 0,
          hours: (page as any).countdownHours || (page as any).countdown?.hours || 0,
          minutes: (page as any).countdownMinutes || (page as any).countdown?.minutes || 0,
          seconds: (page as any).countdownSeconds || (page as any).countdown?.seconds || 0
        },
        songs: [] // Load songs on demand
      };
    });
    
    console.log(`⚡ Admin: ${mappedPages.length} pages processed in ${(performance.now() - startTime).toFixed(2)}ms`);
    return mappedPages;
    
  } catch (error) {
    console.error('❌ Admin: Error fetching data:', error);
    throw error;
  }
}

// Fast song fetching for a specific page - USING NEW TABLE!
async function fetchPageSongs(pageId: string): Promise<PraiseNightSong[]> {
  try {
    console.log(`🎵 [FRESH] Admin: Fetching songs for page ${pageId}...`);
    const startTime = performance.now();

    // Use new PraiseNightSongsService
    const songs = await PraiseNightSongsService.getSongsByPraiseNight(pageId);

    console.log(`⚡ [FRESH] Admin: Songs fetched in ${(performance.now() - startTime).toFixed(2)}ms`);
    console.log(`📊 [FRESH] Songs for page ${pageId}: ${songs.length}`);

    return songs;
  } catch (error) {
    console.error(`❌ [FRESH] Error fetching songs for page ${pageId}:`, error);
    return [];
  }
}

// DEPRECATED - Old function for reference
async function fetchPageSongsOLD(pageId: string): Promise<PraiseNightSong[]> {
  try {
    console.log(`🎵 Admin: Fetching songs for page ${pageId}...`);
    const startTime = performance.now();

    // Get all songs and filter by page ID
    const allSongs = await FirebaseDatabaseService.getCollection('songs');
    console.log(`📊 Total songs in Firebase: ${allSongs.length}`);

    const pageSongs = allSongs.filter((song: any) => {
      // Handle both number IDs and Firebase document IDs
      const songPraiseNightId = song.praiseNightId || song.praisenightid;
      const matches = songPraiseNightId === pageId || songPraiseNightId === pageId.toString();

      if (matches) {
        console.log(`✅ Song matches page ${pageId}:`, {
          firebaseId: song.id,
          title: song.title,
          praiseNightId: songPraiseNightId,
          pageId: pageId,
          pageIdType: typeof pageId
        });
      }
      return matches;
    });

    console.log(`📊 Songs matching page ${pageId}: ${pageSongs.length}`);

    const mappedSongs = pageSongs.map((song: any) => {
      // SIMPLE SOLUTION - Always use Firebase document ID
      const songId = song.firebaseId || song.id || song.documentId || '';

      const mappedSong = {
        id: songId, // Primary ID for all operations
        firebaseId: songId, // Same ID for Firebase operations
        title: song.title || 'Untitled Song',
        status: song.status || 'unheard',
        category: song.category || '',
        praiseNightId: pageId,
        lyrics: song.lyrics || '',
        leadSinger: song.leadSinger || '',
        writer: song.writer || '',
        conductor: song.conductor || '',
        key: song.key || '',
        tempo: song.tempo || '',
        leadKeyboardist: song.leadKeyboardist || '',
        drummer: song.drummer || '',
        comments: song.comments || [],
        audioFile: song.audioFile || '',
        history: song.history || [],
        rehearsalCount: song.rehearsalCount || 1
      };

      // Only log if there's an issue
      if (!songId || songId === '') {
        console.error('🚨 CRITICAL: Song has no valid ID!', {
          songTitle: song.title,
          originalSong: song,
          mappedSong: mappedSong
        });
      }
      
      return mappedSong;
    });

    console.log(`⚡ Admin: ${mappedSongs.length} songs for page ${pageId} fetched in ${(performance.now() - startTime).toFixed(2)}ms`);
    return mappedSongs;
    
  } catch (error) {
    console.error(`❌ Admin: Error fetching songs for page ${pageId}:`, error);
    return [];
  }
}

export function useAdminData(): AdminData {
  const [pages, setPages] = useState<PraiseNight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setError(null);
      
      // Check cache first
      if (adminDataCache && (Date.now() - adminDataCache.timestamp) < CACHE_DURATION) {
        console.log('⚡ Admin: Using cached data');
        setPages(adminDataCache.pages);
        setLoading(false);
        return;
      }
      
      console.log('🔄 Admin: Loading fresh data...');
      const startTime = performance.now();
      
      const freshPages = await fetchAdminData();
      
      // Update cache
      adminDataCache = {
        pages: freshPages,
        timestamp: Date.now(),
        songs: new Map()
      };
      
      setPages(freshPages);
      console.log(`✅ Admin: Data loaded in ${(performance.now() - startTime).toFixed(2)}ms`);
      
    } catch (err) {
      console.error('❌ Admin: Failed to load data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    // Clear cache and reload
    adminDataCache = null;
    setLoading(true);
    await loadData();
  };

  const getCurrentPage = (id: string): PraiseNight | null => {
    return pages.find(page => page.id === id) || null;
  };

  const getCurrentSongs = async (pageId: string, forceRefresh = false): Promise<PraiseNightSong[]> => {
    // Check cache first (unless force refresh)
    if (!forceRefresh && adminDataCache?.songs.has(pageId)) {
      console.log(`⚡ Admin: Using cached songs for page ${pageId}`);
      return adminDataCache.songs.get(pageId)!;
    }

    // Clear cache for this page if force refresh
    if (forceRefresh && adminDataCache?.songs.has(pageId)) {
      console.log(`🔄 Admin: Force refreshing songs for page ${pageId}, clearing cache`);
      adminDataCache.songs.delete(pageId);
    }

    // Fetch and cache songs
    const songs = await fetchPageSongs(pageId);
    if (adminDataCache) {
      adminDataCache.songs.set(pageId, songs);
    }

    return songs;
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    pages,
    loading,
    error,
    refreshData,
    getCurrentPage,
    getCurrentSongs
  };
}
