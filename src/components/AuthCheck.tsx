'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

interface AuthCheckProps {
  children: React.ReactNode
}

export default function AuthCheck({ children }: AuthCheckProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [shouldCheckAuth, setShouldCheckAuth] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldCheckAuth(true)
    }, 500)
    
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (user && typeof window !== 'undefined' && shouldCheckAuth) {
      const justLoggedIn = sessionStorage.getItem('justLoggedIn') === 'true'
      if (!justLoggedIn) {
        router.replace('/home')
      }
    }
  }, [user, router, shouldCheckAuth])

  return <>{children}</>
}