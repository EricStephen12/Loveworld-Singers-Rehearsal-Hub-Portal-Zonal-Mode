'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { useAuth } from '@/hooks/useAuth'
import { canSeeUpgradePrompts, isBoss } from '@/lib/user-role-utils'
import { Crown, Lock } from 'lucide-react'

interface FeatureGateProps {
  feature: 'audioLab' | 'rehearsals' | 'customSongs' | 'analytics';
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
}

export default function FeatureGate({ 
  feature, 
  children, 
  fallback, 
  showUpgradePrompt = true 
}: FeatureGateProps) {
  const router = useRouter()
  const { profile } = useAuth()
  const { hasFeature, isFreeTier } = useSubscription()
  
  // Check if user can see upgrade prompts (only Zone Leaders with ZNL prefix)
  const canShowUpgradePrompt = canSeeUpgradePrompts(profile)

  // Boss role or boss emails bypass all feature gates
  const userIsBoss = isBoss(profile)
  
  // Check if user has access to this feature
  const hasAccess = userIsBoss || hasFeature(feature)

  if (hasAccess) {
    return <>{children}</>
  }

  // Show custom fallback if provided
  if (fallback) {
    return <>{fallback}</>
  }

  // Show upgrade prompt only to Zone Leaders (ZNL prefix)
  if (showUpgradePrompt && canShowUpgradePrompt) {
    return (
      <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
            <Crown className="w-6 h-6 text-yellow-900" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Premium Feature
            </h3>
            <p className="text-gray-700 mb-3">
              This feature is only available on the Premium plan. Visit your admin dashboard to upgrade your zone.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => router.push('/subscription')}
                className="px-6 py-2.5 bg-yellow-400 text-yellow-900 rounded-lg font-semibold hover:bg-yellow-500 transition-colors inline-flex items-center gap-2"
              >
                <Crown className="w-4 h-4" />
                Go to Admin Dashboard
              </button>
              <button
                onClick={() => router.push('/subscription/plans')}
                className="px-6 py-2.5 bg-white border-2 border-yellow-400 text-yellow-900 rounded-lg font-semibold hover:bg-yellow-50 transition-colors inline-flex items-center gap-2"
              >
                View Plans
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // For non-Zone Leaders, show a simple "Feature Locked" message without upgrade prompt
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
          <Lock className="w-6 h-6 text-gray-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Feature Locked
          </h3>
          <p className="text-gray-700">
            This feature is only available when your zone has a Premium subscription. Contact your Zone Leader for access.
          </p>
        </div>
      </div>
    </div>
  )
}

// Inline feature lock component  
export function FeatureLock({ feature, label }: { feature: string; label?: string }) {
  const router = useRouter()
  const { profile } = useAuth()
  const canShowUpgrade = canSeeUpgradePrompts(profile)
  
  // Boss bypasses all locks
  const userIsBoss = isBoss(profile)
  if (userIsBoss) {
    return null // Don't show any lock for Boss
  }
  
  if (canShowUpgrade) {
    return (
      <button
        onClick={() => router.push('/subscription/plans')}
        className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium hover:bg-yellow-200 transition-colors"
      >
        <Lock className="w-3 h-3" />
        {label || 'Premium Only'}
      </button>
    )
  }
  
  // For regular members, show non-clickable lock
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">
      <Lock className="w-3 h-3" />
      {label || 'Locked'}
    </span>
  )
}

// Feature badge component
export function PremiumBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-amber-400 text-yellow-900 rounded-full text-xs font-bold">
      <Crown className="w-3 h-3" />
      PREMIUM
    </span>
  )
}
