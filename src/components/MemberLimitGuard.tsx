// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useZone } from '@/hooks/useZone'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { FirebaseDatabaseService } from '@/lib/firebase-database'
import { canSeeUpgradePrompts } from '@/lib/user-role-utils'
import { Users, AlertTriangle, Crown } from 'lucide-react'

interface MemberLimitGuardProps {
  onLimitReached?: () => void;
  showWarning?: boolean;
}

export default function MemberLimitGuard({
  onLimitReached,
  showWarning = true
}: MemberLimitGuardProps) {
  const router = useRouter()
  const { profile } = useAuth()
  const { currentZone } = useZone()
  const { memberLimit, isFreeTier } = useSubscription()
  const [currentMemberCount, setCurrentMemberCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Boss bypasses all member limits
  const isBoss = profile?.role === 'boss'
  if (isBoss) {
    return null
  }

  const canShowUpgrade = canSeeUpgradePrompts(profile)

  useEffect(() => {
    loadMemberCount()
  }, [currentZone?.id])

  const loadMemberCount = async () => {
    if (!currentZone) return

    try {
      const zoneData = await FirebaseDatabaseService.getDocument('zones', currentZone.id)
      setCurrentMemberCount(zoneData?.memberCount || 0)
    } catch (error) {
      console.error('Error loading member count:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const isNearLimit = currentMemberCount >= memberLimit * 0.8 // 80% of limit
  const isAtLimit = currentMemberCount >= memberLimit

  if (isLoading) return null

  if (isAtLimit && onLimitReached) {
    onLimitReached()
  }

  if (!showWarning || (!isNearLimit && !isAtLimit)) return null

  return (
    <div className={`rounded-xl p-4 ${isAtLimit
        ? 'bg-red-50 border-2 border-red-200'
        : 'bg-yellow-50 border-2 border-yellow-200'
      }`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isAtLimit ? 'bg-red-100' : 'bg-yellow-100'
          }`}>
          {isAtLimit ? (
            <AlertTriangle className="w-5 h-5 text-red-600" />
          ) : (
            <Users className="w-5 h-5 text-yellow-600" />
          )}
        </div>
        <div className="flex-1">
          <h4 className={`font-bold mb-1 ${isAtLimit ? 'text-red-900' : 'text-yellow-900'
            }`}>
            {isAtLimit ? 'Member Limit Reached' : 'Approaching Member Limit'}
          </h4>
          <p className={`text-sm mb-3 ${isAtLimit ? 'text-red-700' : 'text-yellow-700'
            }`}>
            {isAtLimit ? (
              canShowUpgrade ? (
                <>You've reached your member limit ({currentMemberCount}/{memberLimit}). Upgrade to add more members.</>
              ) : (
                <>Member limit reached ({currentMemberCount}/{memberLimit}). Contact your Zone Leader for upgrade.</>
              )
            ) : (
              <>You're using {currentMemberCount} of {memberLimit} members ({Math.round((currentMemberCount / memberLimit) * 100)}%).</>
            )}
          </p>
          {isFreeTier && canShowUpgrade && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => router.push('/subscription')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400 text-yellow-900 rounded-lg text-sm font-semibold hover:bg-yellow-500 transition-colors"
              >
                <Crown className="w-4 h-4" />
                Go to Admin Dashboard
              </button>
              <button
                onClick={() => router.push('/subscription/plans')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-yellow-400 text-yellow-900 rounded-lg text-sm font-semibold hover:bg-yellow-50 transition-colors"
              >
                View Plans
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Hook to check if can add member
export function useCanAddMember() {
  const { currentZone } = useZone()
  const { memberLimit } = useSubscription()
  const [canAdd, setCanAdd] = useState(true)
  const [currentCount, setCurrentCount] = useState(0)

  useEffect(() => {
    checkLimit()
  }, [currentZone?.id])

  const checkLimit = async () => {
    if (!currentZone) {
      setCanAdd(false)
      return
    }

    try {
      const zoneData = await FirebaseDatabaseService.getDocument('zones', currentZone.id)
      const count = zoneData?.memberCount || 0
      setCurrentCount(count)
      setCanAdd(count < memberLimit)
    } catch (error) {
      console.error('Error checking member limit:', error)
      setCanAdd(false)
    }
  }

  return { canAdd, currentCount, memberLimit, refresh: checkLimit }
}
