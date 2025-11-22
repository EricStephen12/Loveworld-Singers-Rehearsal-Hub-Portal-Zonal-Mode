import { useEffect, useState } from 'react';
import { PraiseNight, PraiseNightSong } from '@/types/supabase';
import { FirebaseDatabaseService } from '@/lib/firebase-database';
import { PraiseNightSongsService } from '@/lib/praise-night-songs-service';
import { lowDataOptimizer } from '@/utils/low-data-optimizer';

// Firebase data fetching function using the service
async function fetchFirebaseData(): Promise<PraiseNight[]> {
  try {
    console.log('🔍 Fetching pages from Firebase using service...');
    
    // Use the FirebaseDatabaseService to get pages from praise_nights collection (main collection)
    let pages = await FirebaseDatabaseService.getCollection('praise_nights');
    console.log('🔥 Firebase praise_nights fetched:', pages.length, 'pages');

    // If no pages found, try other collections as fallback
    if (pages.length === 0) {
      pages = await FirebaseDatabaseService.getCollection('praisenight');
      console.log('🔥 Firebase praisenight fetched:', pages.length, 'praisenight');
    }

    if (pages.length === 0) {
      pages = await FirebaseDatabaseService.getCollection('pages');
      console.log('🔥 Firebase pages fetched:', pages.length, 'pages');
    }
    
    console.log('📄 Pages data:', pages);
    console.log('📄 Sample page structure:', pages[0]);
    console.log('📄 Total pages found:', pages.length);
    
    if (pages.length === 0) {
      console.error('❌ NO PAGES FOUND! This is the problem!');
      console.log('🔍 Available collections to check:');
      console.log('- praise_nights');
      console.log('- praisenight'); 
      console.log('- pages');
    }
    
    // Get songs for each page - USING NEW TABLE!
    const allSongs = await FirebaseDatabaseService.getCollection('praise_night_songs');
    console.log('🔥 [FRESH] Firebase praise_night_songs fetched:', allSongs.length, 'songs');
    console.log('🔥 [FRESH] Sample song data:', allSongs[0]);
    
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

export function useRealtimeData() {
  const [pages, setPages] = useState<PraiseNight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Low-data optimized loading
  useEffect(() => {
    async function loadData() {
      try {
        setError(null);
        
        // Check cache first for instant loading
        const cacheKey = 'praise-nights-data';
        const cachedData = lowDataOptimizer.get(cacheKey);
        
        if (cachedData) {
          console.log('⚡ Instant load from cache - super fast!');
          setPages(cachedData);
          setLoading(false);
        } else {
          setLoading(true);
        }
        
        // Only fetch from Firebase if we don't have cached data or cache is expired
        if (lowDataOptimizer.shouldFetch(cacheKey)) {
          console.log('🔥 Fetching fresh data from Firebase...');
          const startTime = performance.now();
          
          const firebasePages = await fetchFirebaseData();
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
        const cacheKey = 'praise-nights-data';
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
  }, []);

  // No automatic refresh - data is fetched fresh on each request
  useEffect(() => {
    console.log('🔄 No automatic refresh - data fetched fresh on each request...');
  }, []);

  const getCurrentPage = (id: number | string): PraiseNight | null => {
    return pages.find(page => page.id === id || page.id === id.toString()) || null;
  };

  const getCurrentSongs = async (pageId: number | string): Promise<PraiseNightSong[]> => {
    try {
      console.log(`🎵 [FRESH] Regular App: Fetching songs for page ${pageId}...`);
      const startTime = performance.now();

      // Use new PraiseNightSongsService - FRESH TABLE!
      const songs = await PraiseNightSongsService.getSongsByPraiseNight(String(pageId));

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