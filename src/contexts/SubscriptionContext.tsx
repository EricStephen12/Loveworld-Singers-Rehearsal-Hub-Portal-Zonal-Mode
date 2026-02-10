'use client'

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { useZone } from '@/hooks/useZone'
import { useAuth } from '@/hooks/useAuth'
import { FirebaseDatabaseService } from '@/lib/firebase-database'
import { SubscriptionTier, SubscriptionStatus, hasFeatureAccess, getMemberLimit, SubscriptionFeatures } from '@/config/subscriptions'
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
  type?: 'zone' | 'individual' | 'official';
}

interface SubscriptionContextType {
  subscription: Subscription | null;
  isLoading: boolean;
  hasFeature: (feature: keyof SubscriptionFeatures) => boolean;
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

const SUBSCRIPTION_CACHE_KEY = 'lwsrh-subscription-cache-v1'

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { currentZone, isLoading: isZoneLoading } = useZone()
  const { user, profile } = useAuth()

  // Initialize from cache if possible
  const [subscription, setSubscription] = useState<Subscription | null>(() => {
    if (typeof window === 'undefined') return null
    try {
      const cached = localStorage.getItem(SUBSCRIPTION_CACHE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        // Check if cache is fresh (e.g. < 1 hour) - simplistic check for now
        return {
          ...parsed,
          startDate: new Date(parsed.startDate),
          expiresAt: parsed.expiresAt ? new Date(parsed.expiresAt) : null,
          createdAt: new Date(parsed.createdAt),
          updatedAt: new Date(parsed.updatedAt)
        }
      }
    } catch (e) { console.error('Cache parse error', e) }
    return null
  })

  // Start loading if we don't have a subscription, or if we just want to refresh safely
  // If we have a cached subscription, we are NOT loading visually (optimistic)
  const [isLoading, setIsLoading] = useState(!subscription)

  // Load individual subscription
  const loadSubscription = async () => {
    if (!user) {
      setSubscription(null)
      setIsLoading(false)
      localStorage.removeItem(SUBSCRIPTION_CACHE_KEY)
      return
    }

    // Optimization: We don't strictly need to wait for zone to load to check global subscription
    // But we might need it for legacy fallback. 
    // We will proceed with global lookup immediately.

    try {
      const individualId = user.uid // Global account-based lookup (New Standard)
      // Cast to any to handle dynamic firestore data
      let individualData = await FirebaseDatabaseService.getDocument('individual_subscriptions', individualId) as any

      // Fallback 1: Search by userId field (finds legacy subs from ANY zone)
      if (!individualData) {
        const results = await FirebaseDatabaseService.getCollectionWhere('individual_subscriptions', 'userId', '==', user.uid)
        if (results && results.length > 0) {
          individualData = results[0] as any
        }
      }

      // Fallback 2: Check legacy ID format for current zone specifically (Only if zone is ready)
      if (!individualData && !isZoneLoading && currentZone) {
        const legacyId = `${user.uid}_${currentZone.id}`
        const legacyData = await FirebaseDatabaseService.getDocument('individual_subscriptions', legacyId)
        if (legacyData) {
          individualData = legacyData as any
        }
      }

      if (individualData && individualData.status === 'active') {
        const subData: Subscription = {
          id: individualData.id || individualId,
          zoneId: currentZone?.id || 'global',
          tier: 'premium',
          status: individualData.status,
          type: 'individual',
          startDate: individualData.startDate ? new Date(individualData.startDate.seconds * 1000) : new Date(),
          expiresAt: individualData.expiresAt ? new Date(individualData.expiresAt.seconds * 1000) : null,
          createdAt: individualData.createdAt ? new Date(individualData.createdAt.seconds * 1000) : new Date(),
          updatedAt: individualData.updatedAt ? new Date(individualData.updatedAt.seconds * 1000) : new Date()
        }

        // Save to state and cache
        setSubscription(subData)
        localStorage.setItem(SUBSCRIPTION_CACHE_KEY, JSON.stringify(subData))

        // Migration: If we found a legacy sub, move it to the global ID format for future 
        if (individualData.id !== individualId) {
          // (Migration logic preserved)
          try {
            await FirebaseDatabaseService.createDocument('individual_subscriptions', individualId, {
              ...individualData,
              id: individualId,
              userId: user.uid,
              updatedAt: new Date().toISOString()
            })
          } catch (migErr) { console.error('❌ Migration failed:', migErr) }
        }

      } else {
        setSubscription(null)
        localStorage.removeItem(SUBSCRIPTION_CACHE_KEY)
      }
    } catch (error) {
      console.error('❌ Error loading individual subscription:', error)
      // Don't clear subscription on error if we have cached data? 
      // For now, let's keep cached data if error occurs to prevent lockout during outage
      if (!subscription) setSubscription(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Load subscription when user changes or zone initializes
  // Added: Re-run when zone finishes loading to check legacy fallbacks if needed
  useEffect(() => {
    loadSubscription()
  }, [user?.uid, isZoneLoading, currentZone?.id])

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
      return hasFeatureAccess(activeSubscription.tier, feature as keyof SubscriptionFeatures)
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
