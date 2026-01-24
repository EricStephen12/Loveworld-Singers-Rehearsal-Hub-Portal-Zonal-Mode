import { useState, useEffect, useCallback } from 'react'

import { ultraFastLoader } from '@/lib/ultra-fast-loader'

export function useUltraFastData() {
  const [pages, setPages] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  const loadPages = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await ultraFastLoader.getPages()
      setPages(data)
      setIsInitialLoad(false)
    } catch (err) {
      console.error('Error loading pages:', err)
      setError('Failed to load pages')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadSongs = useCallback(async (pageId: number) => {
    try {
      return await ultraFastLoader.getSongs(pageId)
    } catch (err) {
      console.error('Error loading songs:', err)
      return []
    }
  }, [])

  const refresh = useCallback(async () => {
    ultraFastLoader.clearCache()
    await loadPages()
  }, [loadPages])

  useEffect(() => {
    loadPages()
  }, [loadPages])

  return {
    pages,
    loading,
    error,
    isInitialLoad,
    loadSongs,
    refresh,
    cacheStats: ultraFastLoader.getCacheStats()
  }
}
