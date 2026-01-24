'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { FirebaseDatabaseService } from '@/lib/firebase-database'

interface OnboardingTourProps {
  forceShow?: boolean
  onComplete?: () => void
}

export default function OnboardingTour({ forceShow = false, onComplete }: OnboardingTourProps) {
  const { user, profile } = useAuth()
  const [showWelcome, setShowWelcome] = useState(false)

  useEffect(() => {
    const checkTourStatus = async () => {
      if (!user || !profile) return

      // Force show if testing
      if (forceShow) {
        setShowWelcome(true)
        return
      }

            const hasSeenTour = profile.has_seen_onboarding_tour || false
      
      if (!hasSeenTour) {
        // Show welcome message after a short delay
        setTimeout(() => {
          setShowWelcome(true)
        }, 1500)
      }
    }

    checkTourStatus()
  }, [user, profile, forceShow])

  const handleDismiss = async () => {
    setShowWelcome(false)
    
    // Mark tour as completed in user profile
    if (user && !forceShow) {
      try {
        await FirebaseDatabaseService.updateDocument('profiles', user.uid, {
          has_seen_onboarding_tour: true,
          onboarding_completed_at: new Date().toISOString()
        })
      } catch (error) {
        console.error('❌ Error updating tour status:', error)
      }
    }

    if (onComplete) {
      onComplete()
    }
  }

  if (!showWelcome) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm" onClick={handleDismiss} />

      {/* Simple Welcome Message */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] max-w-sm mx-4">
        <div className="bg-white rounded-2xl shadow-2xl p-6 text-center">
          <div className="text-4xl mb-3">👋</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome to LWSRH!</h2>
          <p className="text-sm text-gray-600 mb-4">
            Your complete platform for managing praise and worship rehearsals. Explore the features and enjoy!
          </p>
          <button
            onClick={handleDismiss}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            Get Started
          </button>
        </div>
      </div>
    </>
  )
}
