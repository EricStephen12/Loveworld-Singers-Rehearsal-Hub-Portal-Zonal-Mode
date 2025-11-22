// Simple website-style data fetching - no cache, just fresh data
// Like a normal website - fast and simple

import { useState, useEffect, useCallback } from 'react';

export function useWebsiteStyleData<T>(
  fetchFn: () => Promise<T>,
  key: string,
  refreshInterval?: number
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log(`🌐 Website-style fetch: ${key}`);
      const startTime = performance.now();
      
      const freshData = await fetchFn();
      
      const duration = performance.now() - startTime;
      console.log(`⚡ Website-style fetch completed: ${key} in ${duration.toFixed(2)}ms`);
      
      setData(freshData);
      
    } catch (err) {
      console.error(`❌ Website-style fetch failed: ${key}`, err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, key]);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Optional refresh interval (like website auto-refresh)
  useEffect(() => {
    if (!refreshInterval) return;

    const interval = setInterval(() => {
      fetchData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  return {
    data,
    isLoading,
    error,
    refresh: fetchData
  };
}


