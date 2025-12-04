'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import '@/utils/auth-persistence-check'

export default function SplashPage() {
  const router = useRouter()
  const [hasRedirected, setHasRedirected] = useState(false)
  const { user, profile } = useAuth()

  // ✅ INSTANT REDIRECT - Use cached profile for immediate redirect
  useEffect(() => {
    // Prevent multiple redirects
    if (hasRedirected) return
    
    // Check localStorage for cached profile (instant check)
    const checkCachedAuth = () => {
      try {
        const cached = localStorage.getItem('cachedUserProfile')
        if (cached) {
          const parsed = JSON.parse(cached)
          // Check if cache is less than 24 hours old
          if (parsed.timestamp && Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
            console.log('🎨 Cached profile found - redirecting to home instantly')
            return true
          }
        }
      } catch (e) {
        console.error('Error checking cached profile:', e)
      }
      return false
    }
    
    const hasCachedProfile = checkCachedAuth()
    
    // INSTANT redirect if we have cached profile OR user from Zustand
    if (hasCachedProfile || user || profile) {
      console.log('🎨 User logged in (cached or live) - redirecting to home')
      setHasRedirected(true)
      router.replace('/home')
      return
    }
    
    // No cached profile - show splash briefly then redirect to auth
    const timer = setTimeout(() => {
      console.log('🎨 No cached profile - redirecting to auth')
      setHasRedirected(true)
      router.replace('/auth')
    }, 1000)

    return () => clearTimeout(timer)
  }, [hasRedirected, router, user, profile])

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
      {/* Background Pattern Overlay */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gray-600 rounded-full blur-3xl"></div>
        <div className="absolute top-20 right-20 w-24 h-24 bg-gray-500 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 left-1/3 w-28 h-28 bg-gray-400 rounded-full blur-2xl"></div>
      </div>

      {/* Logo with bounce animation */}
      <div className="relative z-10">
        <img
          src="/logo.png"
          alt="LoveWorld Singers Rehearsal Hub Portal"
          className="object-contain animate-bounce"
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