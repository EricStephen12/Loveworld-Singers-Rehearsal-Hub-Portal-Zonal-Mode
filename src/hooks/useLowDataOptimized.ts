import { useState, useEffect, useCallback } from 'react'

import { lowDataOptimizer } from '@/utils/low-data-optimizer'

interface UseLowDataOptimizedConfig<T> {
  key: string
  fetchFn: () => Promise<T>
  fallbackData?: T
  enableCache?: boolean
}

export function useLowDataOptimized<T>({
  key,
  fetchFn,
  fallbackData,
  enableCache = true
}: UseLowDataOptimizedConfig<T>) {
  const [data, setData] = useState<T | null>(fallbackData || null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFromCache, setIsFromCache] = useState(false)

  const fetchData = useCallback(async (forceRefresh = false) => {
    try {
      setError(null)
      
      if (enableCache && !forceRefresh) {
        const cachedData = lowDataOptimizer.get(key)
        if (cachedData) {
          setData(cachedData)
          setIsFromCache(true)
          setIsLoading(false)
          return
        }
      }

      if (!enableCache || !lowDataOptimizer.get(key)) {
        setIsLoading(true)
      }

      const freshData = await fetchFn()
      setData(freshData)
      setIsFromCache(false)
      
      if (enableCache) {
        lowDataOptimizer.set(key, freshData)
      }
    } catch (err) {
      console.error(`Error fetching ${key}:`, err)
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
      
      if (enableCache) {
        const cachedData = lowDataOptimizer.get(key)
        if (cachedData) {
          setData(cachedData)
          setIsFromCache(true)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }, [key, fetchFn, enableCache])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (!enableCache || !isFromCache) return

    const interval = setInterval(() => {
      if (isFromCache && navigator.onLine) {
        fetchData(true)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [fetchData, enableCache, isFromCache, key])

  return {
    data,
    isLoading,
    error,
    isFromCache,
    refresh: () => fetchData(true),
    connectionInfo: lowDataOptimizer.getConnectionInfo(),
    isLowData: lowDataOptimizer.isLowDataMode()
  }
}
