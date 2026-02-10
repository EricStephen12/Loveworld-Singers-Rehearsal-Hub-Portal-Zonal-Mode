'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'
// import { useWebFCM } from '@/lib/fcm-web'
import { NavigationManager } from '@/utils/navigation'

import { AUTH_CACHE_KEY } from '@/config/routes'

/**
 * SplashPage - ONLY handles initial app load routing
 */
export default function SplashPage() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading } = useAuthContext()
  const [showFailsafe, setShowFailsafe] = useState(false)

  // Fail-safe: If stuck for 800ms (standard for fast apps), show manual entry
  useEffect(() => {
    const timer = setTimeout(() => setShowFailsafe(true), 800)
    return () => clearTimeout(timer)
  }, [])

  // IMMEDIATE Redirect Effect
  useEffect(() => {
    if (pathname !== '/') return

    const cachedUser = typeof window !== 'undefined' ? localStorage.getItem(AUTH_CACHE_KEY) : null

    // 1. Optimistic Check (Fastest) - If we have a cached user, move them IMMEDIATELY
    if (cachedUser === 'true') {
      const lastPath = NavigationManager.getLastPath()
      const target = (lastPath && lastPath !== '/') ? lastPath : '/home'
      router.replace(target)
      return
    }

    // 2. Auth Context Check (Fallback source of truth)
    if (!loading) {
      if (user) {
        const lastPath = NavigationManager.getLastPath()
        const target = (lastPath && lastPath !== '/') ? lastPath : '/home'
        router.replace(target)
      } else {
        router.replace('/auth')
      }
    }
  }, [loading, user, router, pathname])

  // Failsafe Redirect: For returning users, don't wait for complex state, just push home
  useEffect(() => {
    if (pathname !== '/') return
    const cachedUser = typeof window !== 'undefined' ? localStorage.getItem(AUTH_CACHE_KEY) : null

    if (cachedUser === 'true') {
      const timer = setTimeout(() => {
        const lastPath = NavigationManager.getLastPath()
        router.replace((lastPath && lastPath !== '/') ? lastPath : '/home')
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [pathname, router])

  // Big Tech optimization: If we know we're redirecting, show NOTHING to prevent the "old loader" flicker
  const hasAuthCache = typeof window !== 'undefined' && localStorage.getItem(AUTH_CACHE_KEY) === 'true';
  const isRedirecting = (pathname === '/' && hasAuthCache);

  if (isRedirecting) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex flex-col items-center justify-center p-4">
      <link rel="preload" href="/logo.png" as="image" />

      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gray-600 rounded-full blur-3xl"></div>
        <div className="absolute top-20 right-20 w-24 h-24 bg-gray-500 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8">
        <img
          src="/logo.png"
          alt="LoveWorld Singers"
          className="object-contain animate-bounce"
          width={120}
          height={120}
          style={{
            animationDuration: '2s',
            animationIterationCount: 'infinite',
          }}
        />

        {/* Fail-safe button for stuck users - Appears much faster now (800ms) */}
        {showFailsafe && (
          <button
            onClick={() => router.replace('/home')}
            className="animate-in fade-in zoom-in duration-500 mt-8 px-8 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white font-semibold shadow-xl hover:bg-white/20 active:scale-95 transition-all outline-none"
          >
            Enter Now
          </button>
        )}
      </div>
    </div>
  )
}
