import { useState, useEffect } from 'react'

/**
 * Hook to ensure a minimum loading time to prevent flashing empty states
 * @param isLoading - The actual loading state
 * @param minimumMs - Minimum time to show loading (default 800ms)
 * @returns boolean - Whether to show loading state
 */
export function useMinimumLoadingTime(isLoading: boolean, minimumMs: number = 800): boolean {
  const [showLoading, setShowLoading] = useState(true)
  const [startTime] = useState(Date.now())

  useEffect(() => {
    if (!isLoading) {
      const elapsed = Date.now() - startTime
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
  }, [isLoading, startTime, minimumMs])

  return showLoading || isLoading
}
