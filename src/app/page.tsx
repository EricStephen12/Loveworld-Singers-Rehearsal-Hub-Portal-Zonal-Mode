'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthContext } from '@/contexts/AuthContext'

export default function SplashPage() {
  const router = useRouter()
  const { user, loading } = useAuthContext()
  
  const [delayPassed, setDelayPassed] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDelayPassed(true)
    }, 300)
    
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (loading || !delayPassed) {
      return
    }
    
    if (user) {
      router.replace('/home')
    } else {
      router.replace('/auth')
    }
  }, [loading, user, router, delayPassed])

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