'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { useAuth } from '@/hooks/useAuth'
import { canSeeUpgradePrompts, isBoss } from '@/lib/user-role-utils'
import { Crown, Lock, ArrowRight, Sparkles } from 'lucide-react'

interface FeatureGateProps {
  feature: 'audioLab' | 'rehearsals' | 'customSongs' | 'analytics';
  children: ReactNode;
  fallback?: ReactNode;
}

export default function FeatureGate({
  feature,
  children,
  fallback
}: FeatureGateProps) {
  const router = useRouter()
  const { profile } = useAuth()
  const { hasFeature } = useSubscription()

  const userIsBoss = isBoss(profile)
  const hasAccess = userIsBoss || hasFeature(feature)

  if (hasAccess) {
    return <>{children}</>
  }

  // Show custom fallback if provided
  if (fallback) {
    return <>{fallback}</>
  }

  // Redesigned lock banner for Individual Focus
  return (
    <div
      onClick={() => router.push('/subscription')}
      className="cursor-pointer group relative bg-gradient-to-br from-gray-900 via-slate-900 to-indigo-950 rounded-2xl p-8 overflow-hidden shadow-2xl border border-white/5 transition-all hover:border-purple-500/30"
    >
      {/* Decorative Blur */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-600/20 transition-all duration-700"></div>

      <div className="relative flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/20 rotate-3 group-hover:rotate-0 transition-transform duration-500">
          <Crown className="w-9 h-9 text-white" />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <span className="text-[10px] uppercase tracking-[0.2em] font-black text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded">Premium Feature</span>
          </div>
          <h3 className="text-2xl font-black text-white mb-2">
            Unlock Full Access
          </h3>
          <p className="text-gray-400 mb-6 max-w-md text-sm leading-relaxed">
            Upgrade your personal account to access the AudioLab, Custom Song Submission, and all exclusive Rehearsals.
          </p>
          <div className="inline-flex items-center gap-3 bg-white text-gray-950 px-6 py-2.5 rounded-xl font-black text-sm transition-all hover:gap-5 hover:pr-4 group-hover:bg-purple-500 group-hover:text-white">
            GO PREMIUM <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Inline feature lock component  
export function FeatureLock({ feature, label }: { feature: string; label?: string }) {
  const router = useRouter()
  const { isExpiringSoon, isPremiumTier } = useSubscription()
  const { profile } = useAuth()

  // Boss bypasses all locks
  if (isBoss(profile)) {
    return null
  }

  // If premium and not expiring, don't show lock at all
  if (isPremiumTier && !isExpiringSoon) {
    return null
  }

  const isRenewal = isExpiringSoon && isPremiumTier

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        router.push('/subscription')
      }}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase shadow-lg transition-all hover:scale-105 active:scale-95 border ${isRenewal
        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-white/20'
        : 'bg-black/80 backdrop-blur-md text-white border-white/10'
        }`}
    >
      <Lock className="w-3 h-3" />
      {label || (isRenewal ? 'RENEW' : 'LOCKED')}
    </button>
  )
}

// Feature badge component
export function PremiumBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full text-[10px] font-black tracking-widest uppercase shadow-lg shadow-purple-500/20 border border-white/10">
      <Crown className="w-3.5 h-3.5" />
      PREMIUM
    </span>
  )
}

