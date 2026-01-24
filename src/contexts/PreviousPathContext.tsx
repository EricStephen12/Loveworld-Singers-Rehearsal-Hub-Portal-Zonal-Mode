'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'

interface PreviousPathContextType {
  previousPath: string | null
  goBack: (fallbackUrl?: string) => void
}

const PreviousPathContext = createContext<PreviousPathContextType | null>(null)

export function PreviousPathProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  // Track history internally
  const [historyStack, setHistoryStack] = useState<string[]>([])

  useEffect(() => {
    setHistoryStack(prev => {
      const last = prev[prev.length - 1]
      // Avoid duplicating consecutive paths or re-adding current on mount if reload
      if (last === pathname) return prev
      return [...prev, pathname]
    })
  }, [pathname])

  const goBack = (fallbackUrl: string = '/') => {
    setHistoryStack(prev => {
      // Create copy
      const newStack = [...prev]
      // Remove current page
      if (newStack[newStack.length - 1] === pathname) {
        newStack.pop()
      }

      const previous = newStack[newStack.length - 1]

      if (previous) {
        router.push(previous)
        // We return the stack WITHOUT the page we just left, effectively popping it
        return newStack
      } else {
        router.push(fallbackUrl)
        return newStack
      }
    })
  }

  // Calculate previous path for UI if needed (read-only)
  const previousPath = historyStack.length > 1 ? historyStack[historyStack.length - 2] : null

  return (
    <PreviousPathContext.Provider value={{ previousPath, goBack }}>
      {children}
    </PreviousPathContext.Provider>
  )
}

export const usePreviousPath = () => {
  const context = useContext(PreviousPathContext)
  if (!context) {
    // Return dummy if used outside provider to prevent crash
    return { previousPath: null, goBack: (url?: string) => window.history.back() }
  }
  return context
}
