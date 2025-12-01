"use client";

import { useState, useEffect, useRef } from 'react'

// Track which pages have been loaded in this session to skip skeleton on revisit
const loadedPages = new Set<string>()

/**
 * Hook to ensure a minimum loading time to prevent flashing empty states
 * Only shows skeleton on FIRST load - subsequent visits skip skeleton if data is cached
 * 
 * @param isLoading - The actual loading state
 * @param minimumMs - Minimum time to show loading (default 800ms)
 * @param pageKey - Optional unique key for the page (defaults to current pathname)
 * @returns boolean - Whether to show loading state
 */
export function useMinimumLoadingTime(
  isLoading: boolean, 
  minimumMs: number = 800,
  pageKey?: string
): boolean {
  // Generate a stable page key
  const key = pageKey || (typeof window !== 'undefined' ? window.location.pathname : 'default')
  
  // Check if this page was already loaded in this session
  const wasAlreadyLoaded = loadedPages.has(key)
  
  // If data is already loaded (not loading) and page was visited before, skip skeleton entirely
  const [showLoading, setShowLoading] = useState(() => {
    // If not loading and page was already visited, don't show skeleton
    if (!isLoading && wasAlreadyLoaded) {
      return false
    }
    // If not loading on first render (data cached), don't show skeleton
    if (!isLoading) {
      return false
    }
    // Otherwise show skeleton
    return true
  })
  
  const startTimeRef = useRef(Date.now())
  const hasMarkedLoaded = useRef(false)

  useEffect(() => {
    if (!isLoading) {
      // Mark this page as loaded for future visits
      if (!hasMarkedLoaded.current) {
        loadedPages.add(key)
        hasMarkedLoaded.current = true
      }
      
      // If page was already loaded before, skip minimum time
      if (wasAlreadyLoaded) {
        setShowLoading(false)
        return
      }
      
      const elapsed = Date.now() - startTimeRef.current
      const remaining = Math.max(0, minimumMs - elapsed)
      
      if (remaining > 0) {
        const timer = setTimeout(() => {
          setShowLoading(false)
        }, remaining)
        return () => clearTimeout(timer)
      } else {
        setShowLoading(false)
      }
    }
  }, [isLoading, minimumMs, key, wasAlreadyLoaded])

  return showLoading || isLoading
}

/**
 * Clear the loaded pages cache (useful for logout)
 */
export function clearLoadedPagesCache() {
  loadedPages.clear()
}
