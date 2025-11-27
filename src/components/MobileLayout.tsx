'use client'

import { useState, useEffect } from 'react'
import SplashScreen from './SplashScreen'
import AuthScreen from './AuthScreen'
import ProfileCompletionScreen from './ProfileCompletionScreen'
import { useAuth } from '@/hooks/useAuth'
// Subscription components removed

interface MobileLayoutProps {
  children: React.ReactNode
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  const { user, profile, isLoading } = useAuth()
  const [showSplash, setShowSplash] = useState(true)
  const [showAuth, setShowAuth] = useState(false)
  const [showProfileCompletion, setShowProfileCompletion] = useState(false)
  // Subscription state removed
  const [socialData, setSocialData] = useState<{
    socialProvider: string
    socialId: string
    firstName: string
    lastName: string
    email: string
  } | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      const userAgent = navigator.userAgent
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
      const isSmallScreen = window.innerWidth < 768
      setIsMobile(isMobileDevice || isSmallScreen)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Handle authentication state changes
  useEffect(() => {
    console.log('🔍 MobileLayout Debug:', {
      isLoading,
      user: !!user,
      showSplash,
      showAuth,
      showProfileCompletion
    })

    if (isLoading) return // Wait for auth to load

    if (!user) {
      // No user - show auth screen
      console.log('📱 No user - showing auth screen')
      setShowSplash(false)
      setShowAuth(true)
      setShowProfileCompletion(false)
    } else {
      // User is authenticated - show main app (no profile completion required)
      console.log('📱 User authenticated - showing main app')
      setShowSplash(false)
      setShowAuth(false)
      setShowProfileCompletion(false)
    }
    
    setIsInitialized(true)
  }, [user, isLoading])

  const handleSplashComplete = () => {
    setShowSplash(false)
    setShowAuth(true)
  }

  const handleAuthComplete = (socialData?: {
    socialProvider: string
    socialId: string
    firstName: string
    lastName: string
    email: string
  }) => {
    // Always go to main app after auth - no profile completion required
    setShowAuth(false)
    setShowProfileCompletion(false)
  }

  const handleProfileComplete = () => {
    setShowProfileCompletion(false)
    // Subscription removed - user goes directly to main app
  }

  const handleProfileBack = () => {
    setShowProfileCompletion(false)
    setShowAuth(true)
  }

  // Subscription functionality removed

  // Show loading while checking authentication status
  if (isLoading || !isInitialized) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />
  }

  if (showAuth) {
    return <AuthScreen onComplete={handleAuthComplete} />
  }

  if (showProfileCompletion && socialData) {
    return <ProfileCompletionScreen onComplete={handleProfileComplete} onBack={handleProfileBack} socialData={socialData} />
  }

  // Subscription screen removed

  return (
    <div className={`min-h-screen ${isMobile ? 'mobile-optimized' : ''}`}>
      {children}
    </div>
  )
}
