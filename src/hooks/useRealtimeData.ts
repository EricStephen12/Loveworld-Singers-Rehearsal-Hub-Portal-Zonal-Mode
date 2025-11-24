import { useEffect, useState } from 'react';
import { PraiseNight, PraiseNightSong } from '@/types/supabase';
import { FirebaseDatabaseService } from '@/lib/firebase-database';
import { ZoneDatabaseService } from '@/lib/zone-database-service';
import { PraiseNightSongsService } from '@/lib/praise-night-songs-service';
import { lowDataOptimizer } from '@/utils/low-data-optimizer';
import { isHQGroup } from '@/config/zones';

// Firebase data fetching function using the service - ZONE AWARE!
async function fetchFirebaseData(zoneId?: string): Promise<PraiseNight[]> {
  try {
    console.log('🔍 Fetching pages for zone:', zoneId);
    
    let pages: any[] = [];
    
    // Check if HQ group or regular zone
    if (zoneId && isHQGroup(zoneId)) {
      console.log('🏢 Loading HQ pages from praise_nights (unfiltered)');
      pages = await FirebaseDatabaseService.getCollection('praise_nights');
    } else if (zoneId) {
      console.log('📍 Loading zone pages from zone_praise_nights (filtered)');
      pages = await ZoneDatabaseService.getPraiseNightsByZone(zoneId, 1000);
    } else {
      console.log('⚠️ No zone provided, loading from praise_nights');
      pages = await FirebaseDatabaseService.getCollection('praise_nights');
    }
    
    console.log('🔥 Pages fetched:', pages.length, 'pages');

    console.log('📄 Pages data:', pages);
    console.log('📄 Sample page structure:', pages[0]);
    console.log('📄 Total pages found:', pages.length);
    
    if (pages.length === 0) {
      console.log('⚠️ No pages found for zone:', zoneId);
    }
    
    // Associate songs with their respective pages and map to correct format
    const pagesWithSongs = pages.map((page, index) => {
      console.log(`📄 Page ${index} Firebase data:`, {
        id: page.id,
        name: (page as any).name || (page as any).title || (page as any).page_title,
        countdownDays: (page as any).countdownDays,
        countdownHours: (page as any).countdownHours,
        countdownMinutes: (page as any).countdownMinutes,
        countdownSeconds: (page as any).countdownSeconds,
        countdown: (page as any).countdown,
        allFields: Object.keys(page)
      });
      
      // Debug the countdown mapping
      const mappedCountdown = {
        days: (page as any).countdownDays || (page as any).countdown?.days || 0,
        hours: (page as any).countdownHours || (page as any).countdown?.hours || 0,
        minutes: (page as any).countdownMinutes || (page as any).countdown?.minutes || 0,
        seconds: (page as any).countdownSeconds || (page as any).countdown?.seconds || 0
      };
      
      
      return {
        id: page.id, // Use Firebase document ID directly (string)
        firebaseId: page.id, // This is the actual Firebase document ID (string)
        name: (page as any).name || (page as any).title || (page as any).page_title || 'Untitled Page', // Use name or title
        date: (page as any).date || new Date().toISOString(),
        location: (page as any).location || '',
        category: (page as any).category || 'ongoing',
        pageCategory: (page as any).pageCategory || undefined, // Add page category field
        bannerImage: (page as any).bannerImage || (page as any).bannerimage || '',
        countdown: (() => {
          const countdownData = {
            days: (page as any).countdownDays || (page as any).countdown?.days || (page as any).countdowndays || 0,
            hours: (page as any).countdownHours || (page as any).countdown?.hours || (page as any).countdownhours || 0,
            minutes: (page as any).countdownMinutes || (page as any).countdown?.minutes || (page as any).countdownminutes || 0,
            seconds: (page as any).countdownSeconds || (page as any).countdown?.seconds || (page as any).countdownseconds || 0
          };
          console.log('🕐 Countdown data for page:', {
            pageId: (page as any).page_id || page.id,
            pageName: (page as any).name || (page as any).title,
            countdownData,
            rawCountdownFields: {
              countdownDays: (page as any).countdownDays,
              countdownHours: (page as any).countdownHours,
              countdownMinutes: (page as any).countdownMinutes,
              countdownSeconds: (page as any).countdownSeconds,
              countdown: (page as any).countdown
            }
          });
          return countdownData;
          })(),
        songs: [] // Load songs on demand like admin does
      };
    });
    
    console.log('🔥 Firebase data with songs:', pagesWithSongs.length, 'pages with songs');
    return pagesWithSongs;
  } catch (error) {
    console.error('Error fetching Firebase data:', error);
    return [];
  }
}

export function useRealtimeData(zoneId?: string) {
  const [pages, setPages] = useState<PraiseNight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Low-data optimized loading
  useEffect(() => {
    if (!zoneId) {
      console.log('⏳ Waiting for zone...');
      return;
    }
    
    async function loadData() {
      try {
        setError(null);
        
        // Check cache first for instant loading (zone-specific cache)
        const cacheKey = `praise-nights-data-${zoneId}`;
        const cachedData = lowDataOptimizer.get(cacheKey);
        
        if (cachedData) {
          console.log('⚡ Instant load from cache for zone:', zoneId);
          setPages(cachedData);
          setLoading(false);
        } else {
          setLoading(true);
        }
        
        // Only fetch from Firebase if we don't have cached data or cache is expired
        if (lowDataOptimizer.shouldFetch(cacheKey)) {
          console.log('🔥 Fetching fresh data for zone:', zoneId);
          const startTime = performance.now();
          
          const firebasePages = await fetchFirebaseData(zoneId);
          setPages(firebasePages);
          
          // Cache the data for future instant loading
          lowDataOptimizer.set(cacheKey, firebasePages);
          
          const duration = performance.now() - startTime;
          console.log(`⚡ Data loaded in ${duration.toFixed(2)}ms (cached for future)`);
        }
        
      } catch (err) {
        console.error('❌ Failed to load data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        
        // Try to use cached data as fallback
        const cacheKey = `praise-nights-data-${zoneId}`;
        const cachedData = lowDataOptimizer.get(cacheKey);
        if (cachedData) {
          console.log('🔄 Using cached fallback data');
          setPages(cachedData);
        }
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [zoneId]);

  // No automatic refresh - data is fetched fresh on each request
  useEffect(() => {
    console.log('🔄 No automatic refresh - data fetched fresh on each request...');
  }, []);

  const getCurrentPage = (id: number | string): PraiseNight | null => {
    return pages.find(page => page.id === id || page.id === id.toString()) || null;
  };

  const getCurrentSongs = async (pageId: number | string): Promise<PraiseNightSong[]> => {
    try {
      console.log(`🎵 [FRESH] Regular App: Fetching songs for page ${pageId}, zone:`, zoneId);
      const startTime = performance.now();

      // Use zone-aware PraiseNightSongsService
      const songs = await PraiseNightSongsService.getSongsByPraiseNight(String(pageId), zoneId);

      console.log(`⚡ [FRESH] Regular App: ${songs.length} songs for page ${pageId} fetched in ${(performance.now() - startTime).toFixed(2)}ms`);
      
      return songs;

    } catch (error) {
      console.error(`❌ [FRESH] Regular App: Error fetching songs for page ${pageId}:`, error);
      return [];
    }
  };


  return {
    pages,
    loading,
    error,
    getCurrentPage,
    getCurrentSongs,
    refreshData: async () => {
      try {
        console.log('🔄 Low-data optimized refresh...');
        setLoading(true);
        setError(null);
        
        const updatedPages = await fetchFirebaseData();
        setPages(updatedPages);
        
        // Update cache with fresh data
        const cacheKey = 'praise-nights-data';
        lowDataOptimizer.set(cacheKey, updatedPages);
        
        console.log('✅ Data refreshed and cached successfully');
      } catch (err) {
        console.error('❌ Error refreshing data:', err);
        setError('Failed to refresh data');
      } finally {
        setLoading(false);
      }
    }
  };
}

// Helper function to show notifications
function showNotification(message: string, type: 'success' | 'info' | 'warning' | 'error') {
  // You can integrate this with your existing toast system
  console.log(`🔔 ${type.toUpperCase()}: ${message}`);
  
  // Dispatch custom event for toast notifications
  window.dispatchEvent(new CustomEvent('showToast', {
    detail: { message, type }
  }));
}