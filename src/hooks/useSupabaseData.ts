// Custom hook to use Supabase data
import { useState, useEffect } from 'react';
import { getAllPages, getPageById, getSongsByPageId } from '../lib/database';
import type { PraiseNight, PraiseNightSong } from '../types/supabase';

export function useSupabaseData() {
  const [pages, setPages] = useState<PraiseNight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const supabasePages = await getAllPages();
        setPages(supabasePages);
        setError(null);
      } catch (err) {
        console.error('Error loading Supabase data:', err);
        setError('Failed to load data from Supabase');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const getCurrentPage = (id: string): PraiseNight | null => {
    return pages.find(page => page.id === id) || null;
  };

  const getCurrentSongs = (pageId: string): PraiseNightSong[] => {
    const page = pages.find(p => p.id === pageId);
    return page?.songs || [];
  };

  const loadSongsForPage = async (pageId: string): Promise<void> => {
    try {
      const songs = await getSongsByPageId(pageId);
      setPages(prevPages =>
        prevPages.map(page =>
          page.id === pageId
            ? { ...page, songs }
            : page
        )
      );
    } catch (err) {
      console.error('Error loading songs for page:', err);
    }
  };

  return {
    pages,
    loading,
    error,
    getCurrentPage,
    getCurrentSongs,
    loadSongsForPage,
    refreshData: async () => {
      try {
        console.log('🔄 Starting data refresh...');
        setLoading(true);
        
        // Clear current data first to force a complete refresh
        setPages([]);
        
        const supabasePages = await getAllPages();
        console.log('🔄 Got fresh data from Supabase:', supabasePages.length, 'pages');
        
        setPages(supabasePages);
        setError(null);
        
        console.log('✅ Data refresh completed');
      } catch (err) {
        console.error('Error refreshing data:', err);
        setError('Failed to refresh data');
      } finally {
        setLoading(false);
      }
    }
  };
}
