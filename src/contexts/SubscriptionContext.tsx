// @ts-nocheck
'use client'

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { useZone } from '@/hooks/useZone'
import { useAuthStore } from '@/stores/authStore'
import { FirebaseDatabaseService } from '@/lib/firebase-database'
import { SubscriptionTier, SubscriptionStatus, hasFeatureAccess, getMemberLimit } from '@/config/subscriptions'

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
}

interface SubscriptionContextType {
  subscription: Subscription | null;
  isLoading: boolean;
  hasFeature: (feature: string) => boolean;
  canAddMember: () => Promise<boolean>;
  memberLimit: number;
  isFreeTier: boolean;
  isPremiumTier: boolean;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { currentZone } = useZone()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Use Zustand auth store to check for Boss role
  const profile = useAuthStore(state => state.profile)

  // Load subscription for current zone
  const loadSubscription = async () => {
    if (!currentZone) {
      setSubscription(null)
      setIsLoading(false)
      return
    }

    try {
      console.log('🔍 Loading subscription for zone:', currentZone.id)
      
      // Get zone data which includes subscription info
      const zoneData = await FirebaseDatabaseService.getDocument('zones', currentZone.id)
      
      if (!zoneData) {
        // Zone doesn't exist in Firebase yet, create with free tier
        console.log('📝 Creating zone with free tier')
        await FirebaseDatabaseService.createDocument('zones', currentZone.id, {
          id: currentZone.id,
          name: currentZone.name,
          slug: currentZone.slug,
          region: currentZone.region,
          invitationCode: currentZone.invitationCode,
          themeColor: currentZone.themeColor,
          memberCount: 0,
          maxMembers: 20,
          subscriptionTier: 'free',
          subscriptionStatus: 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        })
        
        // Set default free subscription
        setSubscription({
          id: `sub_${currentZone.id}`,
          zoneId: currentZone.id,
          tier: 'free',
          status: 'active',
          startDate: new Date(),
          expiresAt: null,
          createdAt: new Date(),
          updatedAt: new Date()
        })
      } else {
        // Zone exists, use its subscription data
        setSubscription({
          id: zoneData.subscriptionId || `sub_${currentZone.id}`,
          zoneId: currentZone.id,
          tier: zoneData.subscriptionTier || 'free',
          status: zoneData.subscriptionStatus || 'active',
          startDate: zoneData.subscriptionStartDate || new Date(),
          expiresAt: zoneData.subscriptionExpiresAt || null,
          paymentMethod: zoneData.paymentMethod,
          amount: zoneData.subscriptionAmount,
          currency: zoneData.subscriptionCurrency,
          createdAt: zoneData.createdAt || new Date(),
          updatedAt: zoneData.updatedAt || new Date()
        })
      }
      
      console.log('✅ Subscription loaded')
    } catch (error) {
      console.error('❌ Error loading subscription:', error)
      // Default to free tier on error
      setSubscription({
        id: `sub_${currentZone.id}`,
        zoneId: currentZone.id,
        tier: 'free',
        status: 'active',
        startDate: new Date(),
        expiresAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Load subscription when zone changes
  useEffect(() => {
    loadSubscription()
  }, [currentZone?.id])

  // Check if zone has access to a feature
  const hasFeature = (feature: string) => {
    // Boss bypasses all feature checks
    const isBoss = profile?.role === 'boss'
    if (isBoss) return true
    
    // HQ members bypass all feature checks (unlimited access)
    const { bypassesFeatureGates } = require('@/config/zones')
    if (currentZone && bypassesFeatureGates(currentZone.id)) {
      return true
    }
    
    // While loading, allow access (optimistic rendering like Instagram)
    if (isLoading) return true
    
    // No subscription = free tier
    if (!subscription) return false
    
    return hasFeatureAccess(subscription.tier, feature as any)
  }

  // Check if zone can add more members
  const canAddMember = async () => {
    if (!currentZone || !subscription) return false
    
    try {
      const zoneData = await FirebaseDatabaseService.getDocument('zones', currentZone.id)
      const currentMemberCount = zoneData?.memberCount || 0
      const limit = getMemberLimit(subscription.tier)
      
      return currentMemberCount < limit
    } catch (error) {
      console.error('Error checking member limit:', error)
      return false
    }
  }

  // Refresh subscription
  const refreshSubscription = async () => {
    setIsLoading(true)
    await loadSubscription()
  }

  const contextValue = useMemo(() => {
    // Check if HQ group (unlimited access, no subscription needed)
    const { bypassesFeatureGates } = require('@/config/zones')
    const isHQGroup = currentZone && bypassesFeatureGates(currentZone.id)
    
    return {
      subscription,
      isLoading,
      hasFeature,
      canAddMember,
      memberLimit: isHQGroup ? 999999 : (subscription ? getMemberLimit(subscription.tier) : 20),
      isFreeTier: isHQGroup ? false : subscription?.tier === 'free', // HQ groups are not "free tier"
      isPremiumTier: isHQGroup ? true : subscription?.tier === 'premium', // HQ groups act like premium
      refreshSubscription
    }
  }, [subscription, isLoading, currentZone])

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
