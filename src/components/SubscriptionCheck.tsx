'use client'

import { useState, useEffect } from 'react'
import SubscriptionOnboardingScreen from './SubscriptionOnboardingScreen'

interface SubscriptionCheckProps {
  children: React.ReactNode
}

export default function SubscriptionCheck({ children }: SubscriptionCheckProps) {
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null)
  const [showSubscription, setShowSubscription] = useState(false)

  useEffect(() => {
    // Check if user has active subscription
    // In a real app, this would check with your backend/API
    const checkSubscription = async () => {
      try {
        // Simulate API call to check subscription status
        const subscriptionStatus = localStorage.getItem('hasSubscription')
        
        if (subscriptionStatus === 'true') {
          setHasSubscription(true)
        } else {
          setHasSubscription(false)
          setShowSubscription(true)
        }
      } catch (error) {
        console.error('Error checking subscription:', error)
        setHasSubscription(false)
        setShowSubscription(true)
      }
    }

    checkSubscription()
  }, [])

  const handleSubscriptionComplete = () => {
    // Mark subscription as active
    localStorage.setItem('hasSubscription', 'true')
    setHasSubscription(true)
    setShowSubscription(false)
  }

  const handleSubscriptionBack = () => {
    // User can't go back, they need to subscribe
    // In a real app, you might redirect to login or show a message
    console.log('User needs to subscribe to continue')
  }

  // Show loading state while checking subscription
  if (hasSubscription === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking subscription...</p>
        </div>
      </div>
    )
  }

  // Show subscription screen if user doesn't have subscription
  if (showSubscription) {
    return (
      <SubscriptionOnboardingScreen 
        onComplete={handleSubscriptionComplete} 
        onBack={handleSubscriptionBack} 
      />
    )
  }

  // Show main app if user has subscription
  return <>{children}</>
}

