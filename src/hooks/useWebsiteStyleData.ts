import { useState, useEffect, useCallback } from 'react'

export function useWebsiteStyleData<T>(
  fetchFn: () => Promise<T>,
  key: string,
  refreshInterval?: number
) {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const freshData = await fetchFn()
      setData(freshData)
    } catch (err) {
      console.error(`Fetch failed: ${key}`, err)
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setIsLoading(false)
    }
  }, [fetchFn, key])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    if (!refreshInterval) return
    const interval = setInterval(fetchData, refreshInterval)
    return () => clearInterval(interval)
  }, [fetchData, refreshInterval])

  return { data, isLoading, error, refresh: fetchData }
}
