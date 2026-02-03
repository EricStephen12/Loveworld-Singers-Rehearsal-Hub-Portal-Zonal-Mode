// @ts-nocheck
'use client'

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { useZone } from '@/hooks/useZone'
import { useAuth } from '@/hooks/useAuth'
import { FirebaseDatabaseService } from '@/lib/firebase-database'
import { SubscriptionTier, SubscriptionStatus, hasFeatureAccess, getMemberLimit } from '@/config/subscriptions'
import { isBoss } from '@/lib/user-role-utils'

interface Subscription {
  id: string;
  zoneId: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  startDate: Date;
  expiresAt: Date | null;
  paymentMethod?: string;
  amount?: number;
  currency?: string;
  createdAt: Date;
  updatedAt: Date;
  type?: 'zone' | 'individual';
}

interface SubscriptionContextType {
  subscription: Subscription | null;
  isLoading: boolean;
  hasFeature: (feature: string) => boolean;
  canAddMember: () => Promise<boolean>;
  memberLimit: number;
  isFreeTier: boolean;
  isPremiumTier: boolean;
  isIndividualPremium: boolean;
  isExpiringSoon: boolean;
  daysRemaining: number | null;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { currentZone } = useZone()
  const { user, profile } = useAuth()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load individual subscription
  const loadSubscription = async () => {
    if (!user || !currentZone) {
      setSubscription(null)
      setIsLoading(false)
      return
    }

    try {
      const individualId = user.uid // Global account-based lookup
      const individualData = await FirebaseDatabaseService.getDocument('individual_subscriptions', individualId)

      if (individualData && individualData.status === 'active') {
        const zoneId = currentZone?.id || 'global'
        setSubscription({
          id: individualData.id || individualId,
          zoneId: zoneId,
          tier: 'premium',
          status: individualData.status,
          type: 'individual',
          startDate: individualData.startDate || new Date(),
          expiresAt: individualData.expiresAt || null,
          createdAt: individualData.createdAt || new Date(),
          updatedAt: individualData.updatedAt || new Date()
        })
      } else {
        setSubscription(null)
      }
    } catch (error) {
      console.error('❌ Error loading individual subscription:', error)
      setSubscription(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Load subscription when zone or user changes
  useEffect(() => {
    loadSubscription()
  }, [currentZone?.id, user?.uid])

  // Refresh subscription
  const refreshSubscription = async () => {
    setIsLoading(true)
    await loadSubscription()
  }

  // Import bypassesFeatureGates
  const { bypassesFeatureGates } = require('@/config/zones')

  const contextValue = useMemo(() => {
    const isHQGroup = currentZone && bypassesFeatureGates(currentZone.id)
    const isAdmin = isBoss(profile)
    const hasFullAccess = isHQGroup || isAdmin

    // Calculate expiration info
    let daysRemaining: number | null = null
    let isExpiringSoon = false

    if (subscription?.expiresAt) {
      const expiryDate = new Date(subscription.expiresAt)
      const now = new Date()
      const diffTime = expiryDate.getTime() - now.getTime()
      daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
      isExpiringSoon = daysRemaining <= 7 // Warn starting at 7 days
    }

    const isMemberPremium = !!subscription && subscription.status === 'active'

    // Final Premium status - either by role, HQ group, or active individual subscription
    const isPremium = isAdmin || isHQGroup || isMemberPremium

    const hasFeature = (feature: string) => {
      if (hasFullAccess) return true
      if (isLoading) return true
      if (isMemberPremium) return true // Active individual subscription unlocks everything
      if (!subscription) return false
      return hasFeatureAccess(subscription.tier, feature as any)
    }

    const canAddMember = async () => true;

    return {
      subscription,
      isLoading,
      hasFeature,
      canAddMember,
      memberLimit: 999999,
      isFreeTier: !isPremium,
      isPremiumTier: isPremium,
      isIndividualPremium: isMemberPremium && subscription.type === 'individual',
      isExpiringSoon,
      daysRemaining,
      refreshSubscription
    }
  }, [subscription, isLoading, currentZone, profile])

  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
}
