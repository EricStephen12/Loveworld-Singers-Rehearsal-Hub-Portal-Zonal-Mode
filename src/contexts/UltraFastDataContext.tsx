'use client';

import React, { createContext, useContext, useCallback, useRef } from 'react';
import { useUltraFastSupabase } from '@/hooks/useUltraFastSupabase';

interface UltraFastDataContextType {
  // Songs data
  songs: any[];
  songsLoading: boolean;
  songsError: string | null;
  refreshSongs: () => void;
  
  // Praise nights data
  praiseNights: any[];
  praiseNightsLoading: boolean;
  praiseNightsError: string | null;
  refreshPraiseNights: () => void;
  
  // Categories data
  categories: any[];
  categoriesLoading: boolean;
  categoriesError: string | null;
  refreshCategories: () => void;
  
  // Media data
  media: any[];
  mediaLoading: boolean;
  mediaError: string | null;
  refreshMedia: () => void;
  
  // Global refresh
  refreshAll: () => void;
  
  // Optimistic updates
  optimisticUpdateSong: (updates: any[], operation: 'insert' | 'update' | 'delete') => void;
  optimisticUpdatePraiseNight: (updates: any[], operation: 'insert' | 'update' | 'delete') => void;
  optimisticUpdateCategory: (updates: any[], operation: 'insert' | 'update' | 'delete') => void;
  optimisticUpdateMedia: (updates: any[], operation: 'insert' | 'update' | 'delete') => void;
}

const UltraFastDataContext = createContext<UltraFastDataContextType | undefined>(undefined);

export const useUltraFastData = () => {
  const context = useContext(UltraFastDataContext);
  if (!context) {
    throw new Error('useUltraFastData must be used within UltraFastDataProvider');
  }
  return context;
};

interface UltraFastDataProviderProps {
  children: React.ReactNode;
}

export const UltraFastDataProvider: React.FC<UltraFastDataProviderProps> = ({ children }) => {
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Songs hook with ultra-fast settings
  const {
    data: songs,
    loading: songsLoading,
    error: songsError,
    refresh: refreshSongs,
    optimisticUpdate: optimisticUpdateSong,
  } = useUltraFastSupabase({
    table: 'songs',
    select: '*, praise_nights(*), categories(*)',
    orderBy: { column: 'created_at', ascending: false },
    enableRealtime: true,
    cacheTime: 10000, // 10 seconds cache
  });

  // Praise nights hook with ultra-fast settings
  const {
    data: praiseNights,
    loading: praiseNightsLoading,
    error: praiseNightsError,
    refresh: refreshPraiseNights,
    optimisticUpdate: optimisticUpdatePraiseNight,
  } = useUltraFastSupabase({
    table: 'praise_nights',
    select: '*, songs(count)',
    orderBy: { column: 'created_at', ascending: false },
    enableRealtime: true,
    cacheTime: 15000, // 15 seconds cache
  });

  // Categories hook with ultra-fast settings
  const {
    data: categories,
    loading: categoriesLoading,
    error: categoriesError,
    refresh: refreshCategories,
    optimisticUpdate: optimisticUpdateCategory,
  } = useUltraFastSupabase({
    table: 'categories',
    select: '*',
    orderBy: { column: 'name', ascending: true },
    enableRealtime: true,
    cacheTime: 30000, // 30 seconds cache
  });

  // Media hook with ultra-fast settings
  const {
    data: media,
    loading: mediaLoading,
    error: mediaError,
    refresh: refreshMedia,
    optimisticUpdate: optimisticUpdateMedia,
  } = useUltraFastSupabase({
    table: 'media',
    select: '*',
    orderBy: { column: 'uploadedat', ascending: false },
    enableRealtime: true,
    cacheTime: 20000, // 20 seconds cache
  });

  // Global refresh function
  const refreshAll = useCallback(() => {
        if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    // Refresh all data
    Promise.all([
      refreshSongs(),
      refreshPraiseNights(),
      refreshCategories(),
      refreshMedia(),
    ]).then(() => {
    }).catch((error) => {
      console.error('Error refreshing data:', error);
    });
  }, [refreshSongs, refreshPraiseNights, refreshCategories, refreshMedia]);

  // Auto-refresh every 5 minutes
  React.useEffect(() => {
    const interval = setInterval(() => {
      refreshAll();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [refreshAll]);

  const contextValue: UltraFastDataContextType = {
    // Songs
    songs: songs || [],
    songsLoading,
    songsError,
    refreshSongs,
    
    // Praise nights
    praiseNights: praiseNights || [],
    praiseNightsLoading,
    praiseNightsError,
    refreshPraiseNights,
    
    // Categories
    categories: categories || [],
    categoriesLoading,
    categoriesError,
    refreshCategories,
    
    // Media
    media: media || [],
    mediaLoading,
    mediaError,
    refreshMedia,
    
    // Global
    refreshAll,
    
    // Optimistic updates
    optimisticUpdateSong,
    optimisticUpdatePraiseNight,
    optimisticUpdateCategory,
    optimisticUpdateMedia,
  };

  return (
    <UltraFastDataContext.Provider value={contextValue}>
      {children}
    </UltraFastDataContext.Provider>
  );
};
