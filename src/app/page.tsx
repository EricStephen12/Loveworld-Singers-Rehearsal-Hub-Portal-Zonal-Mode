'use client'

import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'
// import { useWebFCM } from '@/lib/fcm-web'
import { NavigationManager } from '@/utils/navigation'

function getCachedAuthState(): boolean | null {
  if (typeof window === 'undefined') return null
  try {
    const hasUser = localStorage.getItem('lwsrh_has_user')
    if (hasUser === 'true') return true
    if (hasUser === 'false') return false
    return null
  } catch {
    return null
  }
}

/**
 * SplashPage - ONLY handles initial app load routing
 * 
 * CRITICAL: This page should ONLY redirect when pathname is '/' (initial load).
 * It should NOT redirect during navigation to other pages (lazy loading).
 * 
 * The aggressive redirect to /auth during lazy loading was causing the bounce issue.
 */
export default function SplashPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading } = useAuthContext()
  const hasNavigated = useRef(false)

  // FCM is now handled globally in PushNotificationListener

  useEffect(() => {
    // CRITICAL: Only redirect if we're on the splash page itself
    if (pathname !== '/' || hasNavigated.current) return

    const cached = getCachedAuthState()

    if (cached !== null) {
      hasNavigated.current = true
      const targetPath = cached ? NavigationManager.getLastPath() : '/auth'
      router.replace(targetPath)
      return
    }
  }, [router, pathname])

  useEffect(() => {
    // CRITICAL: Only redirect if we're on the splash page itself
    if (pathname !== '/' || loading || hasNavigated.current) return

    if (typeof window !== 'undefined') {
      localStorage.setItem('lwsrh_has_user', user ? 'true' : 'false')
    }

    hasNavigated.current = true
    const targetPath = user ? NavigationManager.getLastPath() : '/auth'
    router.replace(targetPath)
  }, [loading, user, router, pathname])

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
      <link rel="preload" href="/logo.png" as="image" />

      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gray-600 rounded-full blur-3xl"></div>
        <div className="absolute top-20 right-20 w-24 h-24 bg-gray-500 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 left-1/3 w-28 h-28 bg-gray-400 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <img
          src="/logo.png"
          alt="LoveWorld Singers"
          className="object-contain animate-bounce"
          loading="eager"
          fetchPriority="high"
          style={{
            width: '120px',
            height: '120px',
            animationDuration: '2s',
            animationIterationCount: 'infinite',
            animationTimingFunction: 'ease-in-out'
          }}
        />
      </div>
    </div>
  )
}
