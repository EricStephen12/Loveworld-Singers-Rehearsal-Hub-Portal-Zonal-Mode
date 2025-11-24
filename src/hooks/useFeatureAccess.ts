import { useZone } from '@/contexts/ZoneContext'
import { bypassesFeatureGates, requiresSubscription } from '@/config/zones'

/**
 * Hook to check if user has access to features
 * HQ groups (zone-001 to zone-005) bypass all feature gates and subscription checks
 */
export function useFeatureAccess() {
  const { currentZone, userRole } = useZone()
  
  // Check if current zone bypasses feature gates (HQ groups + Boss)
  const hasUnlimitedAccess = bypassesFeatureGates(currentZone?.id)
  
  // Check if zone needs subscription
  const needsSubscription = requiresSubscription(currentZone?.id)
  
  // HQ members and coordinators have full access
  const hasFullAccess = userRole === 'hq_member' || 
                        userRole === 'zone_coordinator' || 
                        userRole === 'super_admin' ||
                        userRole === 'boss'
  
  return {
    // Feature access
    hasUnlimitedAccess,
    needsSubscription,
    hasFullAccess,
    
    // Specific checks
    canCreateContent: hasFullAccess || hasUnlimitedAccess,
    canEditContent: hasFullAccess || hasUnlimitedAccess,
    canDeleteContent: hasFullAccess || hasUnlimitedAccess,
    canManageMembers: hasFullAccess || hasUnlimitedAccess,
    
    // Subscription checks
    requiresPayment: needsSubscription && !hasUnlimitedAccess,
    isHQGroup: hasUnlimitedAccess && currentZone?.region === 'Headquarters',
    
    // Zone info
    currentZone,
    userRole
  }
}
