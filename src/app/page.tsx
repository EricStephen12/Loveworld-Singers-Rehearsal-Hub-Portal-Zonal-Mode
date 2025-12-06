'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'

// ============================================
// SIMPLE SPLASH PAGE - Instagram/TikTok Style
// ============================================
// Firebase checks IndexedDB automatically on page load.
// We just wait for the loading state to finish, then redirect.

export default function SplashPage() {
  const router = useRouter()
  const { user, loading } = useAuthContext()

  useEffect(() => {
    // Wait for Firebase to finish checking auth state
    if (loading) {
      console.log('⏳ Waiting for Firebase auth...')
      return
    }
    
    // Firebase is done - we now know the real state
    if (user) {
      console.log('✅ User logged in - going to home')
      router.replace('/home')
    } else {
      console.log('❌ No user - going to auth')
      router.replace('/auth')
    }
  }, [loading, user, router])

  // Show splash while Firebase checks auth
  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
      <link rel="preload" href="/logo.png" as="image" />
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gray-600 rounded-full blur-3xl"></div>
        <div className="absolute top-20 right-20 w-24 h-24 bg-gray-500 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 left-1/3 w-28 h-28 bg-gray-400 rounded-full blur-2xl"></div>
      </div>

      {/* Logo */}
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
