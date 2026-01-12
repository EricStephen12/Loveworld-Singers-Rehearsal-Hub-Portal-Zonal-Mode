'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'
import { useWebFCM } from '@/lib/fcm-web'

// Get cached auth state for INSTANT redirect (like big apps do)
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

export default function SplashPage() {
  const router = useRouter()
  const { user, loading } = useAuthContext()
  const hasNavigated = useRef(false)
  
  // Initialize FCM for web background notifications
  useWebFCM()

  // INSTANT navigation based on cache (like Instagram/WhatsApp)
  useEffect(() => {
    if (hasNavigated.current) return
    
    const cached = getCachedAuthState()
    
    // If we have cached state, navigate IMMEDIATELY (no waiting)
    if (cached !== null) {
      hasNavigated.current = true
      router.replace(cached ? '/home' : '/auth')
      return
    }
    
    // No cache = first time user, wait briefly for auth
    // But max 800ms then go to auth
    const timeout = setTimeout(() => {
      if (!hasNavigated.current) {
        hasNavigated.current = true
        router.replace('/auth')
      }
    }, 800)
    
    return () => clearTimeout(timeout)
  }, [router])

  // When auth resolves, update cache and navigate if we haven't already
  useEffect(() => {
    if (loading || hasNavigated.current) return
    
    // Update cache for next time
    if (typeof window !== 'undefined') {
      localStorage.setItem('lwsrh_has_user', user ? 'true' : 'false')
    }
    
    hasNavigated.current = true
    router.replace(user ? '/home' : '/auth')
  }, [loading, user, router])

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
      <link rel="preload" href="/logo.png" as="image" />
      
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gray-600 rounded-full blur-3xl"></div>
        <div className="absolute top-20 right-20 w-24 h-24 bg-gray-500 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 left-1/3 w-28 h-28 bg-gray-400 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10">
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