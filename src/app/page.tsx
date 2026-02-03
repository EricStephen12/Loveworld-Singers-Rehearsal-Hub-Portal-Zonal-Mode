'use client'

import { useEffect, useRef, useState } from 'react'
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
  const [showFailsafe, setShowFailsafe] = useState(false)

  // Fail-safe: If stuck for 3 seconds, show manual entry
  useEffect(() => {
    const timer = setTimeout(() => setShowFailsafe(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  // IMMEDIATE Redirect Effect
  useEffect(() => {
    // Only handle redirect logic if we are actually at root
    if (pathname !== '/') return

    // 1. Optimistic Check (Fastest)
    const cachedUser = typeof window !== 'undefined' ? localStorage.getItem('lwsrh_has_user') : null

    if (cachedUser === 'true') {
      // Returning user? Go to home/last path immediately
      const lastPath = NavigationManager.getLastPath()
      // Avoid redirect loops - if lastPath is root, force home
      const target = (lastPath && lastPath !== '/') ? lastPath : '/home'
      router.replace(target)
      return
    }

    // 2. Auth Context Check (Slower, source of truth)
    if (!loading) {
      if (user) {
        const lastPath = NavigationManager.getLastPath()
        const target = (lastPath && lastPath !== '/') ? lastPath : '/home'
        router.replace(target)
      } else if (cachedUser !== 'true') {
        // Only redirect to auth if we are sure (loading done + no user)
        // and we haven't already optimistically redirected
        router.replace('/auth')
      }
    }
  }, [loading, user, router, pathname])

  // Failsafe Redirect: If we have a cached user but act is stuck, force home after 1s
  // This fixes the "stuck on splash" issue when router.replace might be ignored initially
  useEffect(() => {
    if (pathname !== '/') return
    const cachedUser = typeof window !== 'undefined' ? localStorage.getItem('lwsrh_has_user') : null

    if (cachedUser === 'true') {
      const timer = setTimeout(() => {
        const lastPath = NavigationManager.getLastPath()
        const target = (lastPath && lastPath !== '/') ? lastPath : '/home'
        router.replace(target)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [pathname, router])

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

        {/* Fail-safe button for stuck users */}
        {showFailsafe && (
          <button
            onClick={() => router.replace('/home')}
            className="animate-in fade-in zoom-in duration-500 mt-8 px-8 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white font-semibold shadow-xl hover:bg-white/20 active:scale-95 transition-all"
          >
            Tap to Enter
          </button>
        )}
      </div>
    </div>
  )
}
