'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface AuthCheckProps {
  children: React.ReactNode
}

export default function AuthCheck({ children }: AuthCheckProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [hasChecked, setHasChecked] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    // Don't check if already checked or redirecting
    if (hasChecked || isRedirecting) return

    // Wait for auth to finish loading
    if (isLoading) return

    // Mark as checked to prevent multiple checks
    setHasChecked(true)

    // If user is authenticated, redirect to home
    if (user) {
      console.log('✅ AuthCheck: User authenticated, redirecting to home')
      setIsRedirecting(true)
      router.replace('/home')
    }
    // If no user, stay on auth page (don't redirect)
  }, [user, isLoading, hasChecked, isRedirecting, router])

  // Only show loading on initial check, not on subsequent navigations
  if (!hasChecked && isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm opacity-90">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Show auth page content immediately after first check
  return <>{children}</>
}
