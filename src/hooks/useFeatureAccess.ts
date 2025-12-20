import { useZone } from '@/hooks/useZone'
import { bypassesFeatureGates, requiresSubscription } from '@/config/zones'

export function useFeatureAccess() {
  const { currentZone, userRole } = useZone()
  
  const hasUnlimitedAccess = bypassesFeatureGates(currentZone?.id)
  const needsSubscription = requiresSubscription(currentZone?.id)
  
  const hasFullAccess = userRole === 'hq_member' || 
                        userRole === 'zone_coordinator' || 
                        userRole === 'super_admin' ||
                        userRole === 'boss'
  
  return {
    hasUnlimitedAccess,
    needsSubscription,
    hasFullAccess,
    canCreateContent: hasFullAccess || hasUnlimitedAccess,
    canEditContent: hasFullAccess || hasUnlimitedAccess,
    canDeleteContent: hasFullAccess || hasUnlimitedAccess,
    canManageMembers: hasFullAccess || hasUnlimitedAccess,
    requiresPayment: needsSubscription && !hasUnlimitedAccess,
    isHQGroup: hasUnlimitedAccess && currentZone?.region === 'Headquarters',
    currentZone,
    userRole
  }
}
