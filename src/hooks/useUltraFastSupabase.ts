import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { RealtimeChannel } from '@supabase/supabase-js';

// Ultra-fast Supabase client with optimized settings
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    realtime: {
      params: {
        eventsPerSecond: 10, // High frequency updates
      },
    },
    global: {
      headers: {
        'Cache-Control': 'no-cache',
      },
    },
  }
);

interface UseUltraFastSupabaseOptions {
  table: string;
  select?: string;
  filters?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  enableRealtime?: boolean;
  cacheTime?: number; // Cache time in milliseconds
}

interface CacheEntry {
  data: any;
  timestamp: number;
  expiresAt: number;
}

// Global cache for ultra-fast data access
const globalCache = new Map<string, CacheEntry>();

export const useUltraFastSupabase = <T = any>({
  table,
  select = '*',
  filters = {},
  orderBy,
  limit,
  enableRealtime = true,
  cacheTime = 30000, // 30 seconds default cache
}: UseUltraFastSupabaseOptions) => {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRealtime, setIsRealtime] = useState(false);
  
  const channelRef = useRef<RealtimeChannel | null>(null);
  const cacheKeyRef = useRef<string>('');

  // Generate cache key
  const generateCacheKey = useCallback(() => {
    return `${table}-${select}-${JSON.stringify(filters)}-${JSON.stringify(orderBy)}-${limit}`;
  }, [table, select, filters, orderBy, limit]);

    const isCacheValid = useCallback((cacheKey: string) => {
    const entry = globalCache.get(cacheKey);
    if (!entry) return false;
    return Date.now() < entry.expiresAt;
  }, []);

    const getCachedData = useCallback((cacheKey: string) => {
    const entry = globalCache.get(cacheKey);
    return entry ? entry.data : null;
  }, []);

  // Set data in cache
  const setCachedData = useCallback((cacheKey: string, data: any) => {
    const now = Date.now();
    globalCache.set(cacheKey, {
      data,
      timestamp: now,
      expiresAt: now + cacheTime,
    });
  }, [cacheTime]);

  // Ultra-fast fetch function
  const fetchData = useCallback(async (useCache = true) => {
    const cacheKey = generateCacheKey();
    cacheKeyRef.current = cacheKey;

    // Try cache first for instant loading
    if (useCache && isCacheValid(cacheKey)) {
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        setData(cachedData);
        setLoading(false);
        setError(null);
        return cachedData;
      }
    }

    try {
      setLoading(true);
      setError(null);

      // Build query with optimizations
      let query = supabase
        .from(table)
        .select(select)
        .limit(limit || 1000); // Default limit for speed

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });

      // Apply ordering
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
      }

      // Execute query with timeout
      const { data: result, error: queryError } = await Promise.race([
        query,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout')), 5000)
        )
      ]) as any;

      if (queryError) {
        throw queryError;
      }

      // Cache the result
      setCachedData(cacheKey, result);
      setData(result);
      setLoading(false);

      return result;
    } catch (err) {
      console.error('Supabase fetch error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
      
      // Try to return cached data if available
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        setData(cachedData);
      }
      
      return null;
    }
  }, [table, select, filters, orderBy, limit, generateCacheKey, isCacheValid, getCachedData, setCachedData]);

  // Real-time subscription setup
  const setupRealtimeSubscription = useCallback(() => {
    if (!enableRealtime || channelRef.current) return;

    const channel = supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all changes
          schema: 'public',
          table: table,
        },
        (payload) => {
          
                    setData(currentData => {
            const newData = [...currentData];
            
            switch (payload.eventType) {
              case 'INSERT':
                newData.push(payload.new as T);
                break;
              case 'UPDATE':
                const updateIndex = newData.findIndex(item => (item as any).id === payload.new.id);
                if (updateIndex !== -1) {
                  newData[updateIndex] = payload.new as T;
                }
                break;
              case 'DELETE':
                const deleteIndex = newData.findIndex(item => (item as any).id === payload.old.id);
                if (deleteIndex !== -1) {
                  newData.splice(deleteIndex, 1);
                }
                break;
            }
            
                        const cacheKey = cacheKeyRef.current;
            if (cacheKey) {
              setCachedData(cacheKey, newData);
            }
            
            return newData;
          });
          
          setIsRealtime(true);
          
          // Reset realtime indicator after 2 seconds
          setTimeout(() => setIsRealtime(false), 2000);
        }
      )
      .subscribe((status) => {
      });

    channelRef.current = channel;
  }, [table, enableRealtime, setCachedData]);

  // Initial data fetch - only run once on mount or when table changes
  useEffect(() => {
    fetchData();
    setupRealtimeSubscription();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, enableRealtime]); // Only depend on table and enableRealtime, not the callbacks

  // Refresh function
  const refresh = useCallback(() => {
    return fetchData(false); // Skip cache
  }, [fetchData]);

  // Optimistic update function
  const optimisticUpdate = useCallback((updates: Partial<T>[], operation: 'insert' | 'update' | 'delete') => {
    setData(currentData => {
      let newData = [...currentData];
      
      switch (operation) {
        case 'insert':
          newData.push(...updates as T[]);
          break;
        case 'update':
          updates.forEach(update => {
            const index = newData.findIndex(item => (item as any).id === (update as any).id);
            if (index !== -1) {
              newData[index] = { ...newData[index], ...update };
            }
          });
          break;
        case 'delete':
          updates.forEach(update => {
            const index = newData.findIndex(item => (item as any).id === (update as any).id);
            if (index !== -1) {
              newData.splice(index, 1);
            }
          });
          break;
      }
      
            const cacheKey = cacheKeyRef.current;
      if (cacheKey) {
        setCachedData(cacheKey, newData);
      }
      
      return newData;
    });
  }, [setCachedData]);

  return {
    data,
    loading,
    error,
    isRealtime,
    refresh,
    optimisticUpdate,
    supabase, // Expose supabase client for direct operations
  };
};

// Ultra-fast single record hook
export const useUltraFastSupabaseRecord = <T = any>(
  table: string,
  id: string | number,
  options: Omit<UseUltraFastSupabaseOptions, 'table' | 'filters'> = {}
) => {
  return useUltraFastSupabase<T>({
    ...options,
    table,
    filters: { id },
    limit: 1,
  });
};

// Cache management utilities
export const clearSupabaseCache = (pattern?: string) => {
  if (pattern) {
    const regex = new RegExp(pattern);
    for (const key of globalCache.keys()) {
      if (regex.test(key)) {
        globalCache.delete(key);
      }
    }
  } else {
    globalCache.clear();
  }
};

export const getCacheStats = () => {
  const now = Date.now();
  let validEntries = 0;
  let expiredEntries = 0;
  
  for (const entry of globalCache.values()) {
    if (now < entry.expiresAt) {
      validEntries++;
    } else {
      expiredEntries++;
    }
  }
  
  return {
    totalEntries: globalCache.size,
    validEntries,
    expiredEntries,
    memoryUsage: JSON.stringify(Array.from(globalCache.entries())).length,
  };
};
