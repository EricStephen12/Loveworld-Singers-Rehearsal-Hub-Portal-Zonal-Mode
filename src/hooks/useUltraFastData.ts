// Ultra-Fast Data Hook - INSTANT PWA Loading
import { useState, useEffect, useCallback } from 'react'
import { ultraFastLoader } from '@/lib/ultra-fast-loader'

export function useUltraFastData() {
  const [pages, setPages] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // Load pages with ultra-fast caching
  const loadPages = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const data = await ultraFastLoader.getPages()
      setPages(data)
      setIsInitialLoad(false)
      
      console.log(`⚡ Pages loaded: ${data.length} items`)
    } catch (err) {
      console.error('Error loading pages:', err)
      setError('Failed to load pages')
    } finally {
      setLoading(false)
    }
  }, [])

  // Load songs for a specific page
  const loadSongs = useCallback(async (pageId: number) => {
    try {
      const songs = await ultraFastLoader.getSongs(pageId)
      return songs
    } catch (err) {
      console.error('Error loading songs:', err)
      return []
    }
  }, [])

  // Refresh data
  const refresh = useCallback(async () => {
    ultraFastLoader.clearCache()
    await loadPages()
  }, [loadPages])

  // Initial load
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

