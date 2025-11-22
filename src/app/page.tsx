'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SplashPage() {
  const router = useRouter()
  const [hasRedirected, setHasRedirected] = useState(false)

  // ✅ PURE UI SPLASH - NO AUTH CHECKING
  useEffect(() => {
    // Prevent multiple redirects
    if (hasRedirected) return
    
    // Show splash for 1 second then redirect to auth
    const timer = setTimeout(() => {
      console.log('🎨 Splash complete - redirecting to auth')
      setHasRedirected(true)
      router.replace('/auth')
    }, 1000) // 1 second splash display

    return () => clearTimeout(timer)
  }, [hasRedirected, router])

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