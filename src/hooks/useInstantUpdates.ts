// Instagram-style instant updates hook
// Shows UI changes immediately while fetching fresh data in background

import { useState, useEffect, useCallback } from 'react';

interface InstantUpdateConfig {
  key: string;
  fetchFn: () => Promise<any>;
  updateInterval?: number; // How often to fetch fresh data
  showOptimistic?: boolean; // Show changes immediately
}

export function useInstantUpdates<T>(config: InstantUpdateConfig) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(0);

  const fetchData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      setError(null);
      
      console.log(`🚀 Instagram-style fetch: ${config.key}`);
      const startTime = performance.now();
      
      const freshData = await config.fetchFn();
      
      const duration = performance.now() - startTime;
      console.log(`⚡ Instagram-style fetch completed: ${config.key} in ${duration.toFixed(2)}ms`);
      
      setData(freshData);
      setLastUpdate(Date.now());
      
    } catch (err) {
      console.error(`❌ Instagram-style fetch failed: ${config.key}`, err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [config.key, config.fetchFn]);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Background refresh (Instagram-style)
  useEffect(() => {
    if (!config.updateInterval) return;

    const interval = setInterval(() => {
      // Only fetch if data is older than update interval
      if (config.updateInterval && Date.now() - lastUpdate > config.updateInterval) {
        fetchData(false); // Don't show loading for background updates
      }
    }, config.updateInterval);

    return () => clearInterval(interval);
  }, [fetchData, config.updateInterval, lastUpdate]);

  // Optimistic update function
  const optimisticUpdate = useCallback((newData: T) => {
    if (config.showOptimistic) {
      console.log(`🎯 Instagram-style optimistic update: ${config.key}`);
      setData(newData);
      
      // Fetch fresh data in background
      setTimeout(() => {
        fetchData(false);
      }, 100);
    }
  }, [config.key, config.showOptimistic, fetchData]);

  return {
    data,
    isLoading,
    error,
    lastUpdate,
    refresh: () => fetchData(true),
    optimisticUpdate
  };
}
