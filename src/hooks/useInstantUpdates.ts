import { useState, useEffect, useCallback } from 'react'

interface InstantUpdateConfig {
  key: string
  fetchFn: () => Promise<any>
  updateInterval?: number
  showOptimistic?: boolean
}

export function useInstantUpdates<T>(config: InstantUpdateConfig) {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<number>(0)

  const fetchData = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true)
      setError(null)
      
      const freshData = await config.fetchFn()
      setData(freshData)
      setLastUpdate(Date.now())
    } catch (err) {
      console.error(`Fetch failed: ${config.key}`, err)
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      if (showLoading) setIsLoading(false)
    }
  }, [config.key])

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (!config.updateInterval) return

    const interval = setInterval(() => {
      if (config.updateInterval && Date.now() - lastUpdate > config.updateInterval) {
        fetchData(false)
      }
    }, config.updateInterval)

    return () => clearInterval(interval)
  }, [config.updateInterval])

  const optimisticUpdate = useCallback((newData: T) => {
    if (config.showOptimistic) {
      setData(newData)
      setTimeout(() => fetchData(false), 100)
    }
  }, [config.key, config.showOptimistic])

  return {
    data,
    isLoading,
    error,
    lastUpdate,
    refresh: () => fetchData(true),
    optimisticUpdate
  }
}
