// Low Data Optimized Hook - Super fast loading with minimal Firebase costs
// Instagram-style data fetching with smart caching

import { useState, useEffect, useCallback } from 'react';
import { lowDataOptimizer } from '@/utils/low-data-optimizer';

interface UseLowDataOptimizedConfig<T> {
  key: string;
  fetchFn: () => Promise<T>;
  fallbackData?: T;
  enableCache?: boolean;
}

export function useLowDataOptimized<T>({
  key,
  fetchFn,
  fallbackData,
  enableCache = true
}: UseLowDataOptimizedConfig<T>) {
  const [data, setData] = useState<T | null>(fallbackData || null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);

  const fetchData = useCallback(async (forceRefresh = false) => {
    try {
      setError(null);
      
      // Check cache first (unless force refresh)
      if (enableCache && !forceRefresh) {
        const cachedData = lowDataOptimizer.get(key);
        if (cachedData) {
          console.log(`⚡ Instant load from cache: ${key}`);
          setData(cachedData);
          setIsFromCache(true);
          setIsLoading(false);
          return;
        }
      }

      // Show loading only if no cached data
      if (!enableCache || !lowDataOptimizer.get(key)) {
        setIsLoading(true);
      }

      console.log(`🔥 Fetching fresh data: ${key}`);
      const startTime = performance.now();
      
      const freshData = await fetchFn();
      
      const duration = performance.now() - startTime;
      console.log(`⚡ Data fetched in ${duration.toFixed(2)}ms: ${key}`);
      
      setData(freshData);
      setIsFromCache(false);
      
      // Cache the data for future use
      if (enableCache) {
        lowDataOptimizer.set(key, freshData);
      }
      
    } catch (err) {
      console.error(`❌ Error fetching ${key}:`, err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      
      // Try to use cached data as fallback
      if (enableCache) {
        const cachedData = lowDataOptimizer.get(key);
        if (cachedData) {
          console.log(`🔄 Using cached fallback for ${key}`);
          setData(cachedData);
          setIsFromCache(true);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [key, fetchFn, enableCache]);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Background refresh for cached data (Instagram-style)
  useEffect(() => {
    if (!enableCache || !isFromCache) return;

    const interval = setInterval(() => {
      // Only refresh if data is from cache and connection is good
      if (isFromCache && navigator.onLine) {
        console.log(`🔄 Background refresh for cached data: ${key}`);
        fetchData(true);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [fetchData, enableCache, isFromCache, key]);

  return {
    data,
    isLoading,
    error,
    isFromCache,
    refresh: () => fetchData(true),
    connectionInfo: lowDataOptimizer.getConnectionInfo(),
    isLowData: lowDataOptimizer.isLowDataMode()
  };
}



