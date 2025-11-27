'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

interface AuthCheckProps {
  children: React.ReactNode
}

// Simple: If user is logged in, redirect to home
// That's it. No complex logic.
export default function AuthCheck({ children }: AuthCheckProps) {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // If user is logged in, go to home
    // But not if we just logged in (let auth page show success message)
    if (user && typeof window !== 'undefined') {
      const justLoggedIn = sessionStorage.getItem('justLoggedIn') === 'true'
      if (!justLoggedIn) {
        router.replace('/home')
      }
    }
  }, [user, router])

  return <>{children}</>
}
