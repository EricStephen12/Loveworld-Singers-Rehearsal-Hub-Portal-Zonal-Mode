// @ts-nocheck
'use client'

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { useZone } from '@/hooks/useZone'
import { useAuth } from '@/hooks/useAuth'
import { FirebaseDatabaseService } from '@/lib/firebase-database'
import { SubscriptionTier, SubscriptionStatus, hasFeatureAccess, getMemberLimit } from '@/config/subscriptions'
import { isBoss } from '@/lib/user-role-utils'
import { bypassesFeatureGates } from '@/config/zones'

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
  isOfficialAccess: boolean;
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
    if (!user) {
      setSubscription(null)
      setIsLoading(false)
      return
    }

    try {
      const individualId = user.uid // Global account-based lookup (New Standard)
      let individualData = await FirebaseDatabaseService.getDocument('individual_subscriptions', individualId)

      // Fallback 1: Search by userId field (finds legacy subs from ANY zone)
      if (!individualData) {
        const results = await FirebaseDatabaseService.getCollectionWhere('individual_subscriptions', 'userId', '==', user.uid)
        if (results && results.length > 0) {
          individualData = results[0]
          console.log('🔄 SubscriptionContext: Found subscription via userId query.')
        }
      }

      // Fallback 2: Check legacy ID format for current zone specifically
      if (!individualData && currentZone) {
        const legacyId = `${user.uid}_${currentZone.id}`
        individualData = await FirebaseDatabaseService.getDocument('individual_subscriptions', legacyId)
        if (individualData) {
          console.log('🔄 SubscriptionContext: Found legacy subscription ID.')
        }
      }

      if (individualData && individualData.status === 'active') {
        // Migration: If we found a legacy sub, move it to the global ID format for future 
        if (individualData.id !== individualId) {
          console.log('⚡ SubscriptionContext: Migrating legacy subscription to global ID.')
          try {
            await FirebaseDatabaseService.createDocument('individual_subscriptions', individualId, {
              ...individualData,
              id: individualId,
              userId: user.uid,
              updatedAt: new Date().toISOString()
            })
            // Optional: delete old one? Maybe safer to keep for now.
          } catch (migErr) {
            console.error('❌ Migration failed:', migErr)
          }
        }

        setSubscription({
          id: individualData.id || individualId,
          zoneId: currentZone?.id || 'global',
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


  const contextValue = useMemo(() => {
    const isHQMember = currentZone && bypassesFeatureGates(currentZone.id)
    const isAdmin = isBoss(profile)
    const hasComplimentaryAccess = isHQMember || isAdmin

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

    const isMemberPaidPremium = !!subscription &&
      subscription.status === 'active' &&
      (!subscription.expiresAt || new Date(subscription.expiresAt) > new Date())

    // Final Premium status - either by role, HQ group, or active individual subscription
    const isPremium = hasComplimentaryAccess || isMemberPaidPremium

    // Virtual Plan for HQ/Admin if they don't have a paid one
    const activeSubscription = subscription || (hasComplimentaryAccess ? {
      id: 'official_bypass',
      tier: 'premium',
      status: 'active',
      type: 'official',
      startDate: new Date(),
      expiresAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      zoneId: currentZone?.id || 'global'
    } : null)

    const hasFeature = (feature: string) => {
      if (hasComplimentaryAccess) return true
      if (isLoading) return true
      if (isMemberPaidPremium) return true // Active individual subscription unlocks everything
      if (!activeSubscription) return false
      return hasFeatureAccess(activeSubscription.tier, feature as any)
    }

    const canAddMember = async () => true;

    return {
      subscription: activeSubscription,
      isLoading,
      hasFeature,
      canAddMember,
      memberLimit: 999999,
      isFreeTier: !isPremium,
      isPremiumTier: isPremium,
      isIndividualPremium: isMemberPaidPremium, // Explicitly paid
      isOfficialAccess: hasComplimentaryAccess, // New flag for official status
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
