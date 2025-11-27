// Compatibility hook for Zustand zone store
// This allows existing code using useZone() to work without changes
import { useMemo, useCallback } from 'react'
import { useZoneStore } from '@/stores/zoneStore'
import { ZONES } from '@/config/zones'
import { hasPermission as checkPermission } from '@/config/roles'

export function useZone() {
  const currentZone = useZoneStore(state => state.currentZone)
  const userZones = useZoneStore(state => state.userZones)
  const isLoading = useZoneStore(state => state.isLoading)
  const isSuperAdmin = useZoneStore(state => state.isSuperAdmin)
  const userRole = useZoneStore(state => state.userRole)
  const switchZone = useZoneStore(state => state.switchZone)
  const refreshZones = useZoneStore(state => state.refreshZones)
  const currentZoneMembership = useZoneStore(state => state.currentZoneMembership)

  const availableZones = userZones
  const allZones = useMemo(() => (isSuperAdmin ? ZONES : []), [isSuperAdmin])
  const isZoneCoordinator = userRole === 'zone_coordinator'

  const hasPermission = useCallback(
    (permission: string) => checkPermission(userRole, permission as any),
    [userRole]
  )

  return {
    currentZone,
    userZones,
    availableZones,
    allZones,
    isLoading,
    isSuperAdmin,
    isZoneCoordinator,
    userRole,
    hasPermission,
    currentZoneMembership,
    switchZone,
    refreshZones
  }
}
