// ============================================
// SIMPLIFIED ZONE HOOK
// ============================================
// Fetches zone data when needed, not on every auth change.
// Uses the simple AuthContext instead of Zustand auth store.

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'
import { FirebaseDatabaseService } from '@/lib/firebase-database'
import { HQMembersService } from '@/lib/hq-members-service'
import { ZONES, Zone, isSuperAdmin, isHQGroup } from '@/config/zones'
import { UserRole, hasPermission as checkPermission } from '@/config/roles'

// Simple localStorage cache for zone data with TTL
const ZONE_CACHE_KEY = 'lwsrh-zone-cache-v5'
const ZONE_CACHE_TTL = 10 * 60 * 1000 // 10 minutes - zones don't change often

interface ZoneCacheData {
  userId: string
  currentZone: Zone | null
  userZones: Zone[]
  userRole: UserRole
  isSuperAdmin: boolean
  timestamp: number
}

function getZoneCache(userId: string): ZoneCacheData | null {
  if (typeof window === 'undefined') return null
  try {
    const cached = localStorage.getItem(ZONE_CACHE_KEY)
    if (!cached) return null
    const data = JSON.parse(cached) as ZoneCacheData
    // Only return if cache belongs to current user AND not expired
    if (data.userId === userId && Date.now() - data.timestamp < ZONE_CACHE_TTL) {
      return data
    }
    return null
  } catch {
    return null
  }
}

function setZoneCache(data: Omit<ZoneCacheData, 'timestamp'>) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(ZONE_CACHE_KEY, JSON.stringify({ ...data, timestamp: Date.now() }))
  } catch {
    // Ignore storage errors
  }
}

function clearZoneCache() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(ZONE_CACHE_KEY)
}

export function useZone() {
  const { user } = useAuthContext()
  
  const [currentZone, setCurrentZone] = useState<Zone | null>(null)
  const [userZones, setUserZones] = useState<Zone[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userRole, setUserRole] = useState<UserRole>('zone_member')
  const [isSuperAdminUser, setIsSuperAdminUser] = useState(false)
  const [currentZoneMembership, setCurrentZoneMembership] = useState<any>(null)
  const lastLoadedUserId = useRef<string | null>(null)
  const isFetching = useRef(false)

  // Track if we've already processed a pending zone switch this session
  const processedPendingSwitch = useRef(false)

  // Load zones when user changes (with caching to prevent repeated reads)
  useEffect(() => {
    // FIRST: Check for pending zone switch BEFORE anything else
    // This must happen before cache check to ensure zone switch works
    let pendingZoneId: string | null = null
    if (!processedPendingSwitch.current && typeof window !== 'undefined') {
      pendingZoneId = localStorage.getItem('lwsrh-pending-zone-switch')
      if (pendingZoneId) {
        console.log('🔄 Zone Switch: Found pending zone switch to:', pendingZoneId)
        // Mark as processed immediately
        processedPendingSwitch.current = true
        // Clear the pending switch from storage
        localStorage.removeItem('lwsrh-pending-zone-switch')
        // Clear zone cache to force fresh load
        clearZoneCache()
      }
    }

    if (!user?.uid) {
      // No user - clear everything
      setCurrentZone(null)
      setUserZones([])
      setUserRole('zone_member')
      setIsSuperAdminUser(false)
      setIsLoading(false)
      lastLoadedUserId.current = null
      return
    }

    // If we have a pending zone switch, skip cache and load fresh
    if (pendingZoneId) {
      console.log('🔄 Zone Switch: Processing pending zone switch to:', pendingZoneId)
      // Reset fetching flag to allow the load
      isFetching.current = false
      lastLoadedUserId.current = null
      // Set loading state to show spinner
      setIsLoading(true)
      // Force fresh load with the new zone as preferred
      loadUserZones(user.uid, user.email || '', pendingZoneId)
      return
    }

    // Check cache first for instant display (only if no pending switch)
    const cached = getZoneCache(user.uid)
    if (cached) {
      console.log('📦 Zone Cache: Using cached zone:', cached.currentZone?.name)
      setCurrentZone(cached.currentZone)
      setUserZones(cached.userZones)
      setUserRole(cached.userRole)
      setIsSuperAdminUser(cached.isSuperAdmin)
      setIsLoading(false)
      lastLoadedUserId.current = user.uid
      // Don't fetch fresh data if cache is valid (TTL check is in getZoneCache)
      return
    }

    // Prevent duplicate fetches
    if (isFetching.current && lastLoadedUserId.current === user.uid) return

    // Fetch fresh data only if no valid cache
    loadUserZones(user.uid, user.email || '')
  }, [user?.uid, user?.email])

  const loadUserZones = async (userId: string, email: string, preferredZoneId?: string) => {
    // Prevent duplicate fetches - but allow if there's a preferred zone (zone switch)
    if (isFetching.current && !preferredZoneId) return
    isFetching.current = true
    setIsLoading(true)
    
    try {
      const superAdmin = isSuperAdmin(email, userId)
      
      if (superAdmin) {
        // Super admin gets all zones - use preferred zone if specified
        const targetZone = preferredZoneId 
          ? ZONES.find(z => z.id === preferredZoneId) || ZONES[0]
          : ZONES[0]
        setCurrentZone(targetZone)
        setUserZones(ZONES)
        setIsSuperAdminUser(true)
        setUserRole('super_admin')
        setIsLoading(false)
        lastLoadedUserId.current = userId
        
        setZoneCache({
          userId,
          currentZone: targetZone,
          userZones: ZONES,
          userRole: 'super_admin',
          isSuperAdmin: true
        })
        isFetching.current = false
        return
      }

      // Regular user - fetch memberships
      const [zoneMemberships, hqMemberships] = await Promise.all([
        FirebaseDatabaseService.getCollectionWhere('zone_members', 'userId', '==', userId),
        HQMembersService.getUserHQGroups(userId)
      ])

      const memberships = [
        ...zoneMemberships,
        ...hqMemberships.map((hq: any) => ({
          ...hq,
          zoneId: hq.hqGroupId,
          isHQMember: true
        }))
      ]

      if (memberships.length === 0) {
        setCurrentZone(null)
        setUserZones([])
        setUserRole('zone_member')
        setIsLoading(false)
        return
      }

      // Map memberships to zones
      const zones = memberships
        .map((m: any) => ZONES.find(z => z.id === m.zoneId))
        .filter((z): z is Zone => z !== undefined)

      // Use preferred zone if specified and user has access, otherwise use first zone
      const targetZone = preferredZoneId 
        ? zones.find(z => z.id === preferredZoneId) || zones[0]
        : zones[0]
      const targetMembership = memberships.find((m: any) => m.zoneId === targetZone?.id)
      
      console.log('🏠 Zone Load:', {
        preferredZoneId,
        targetZoneId: targetZone?.id,
        targetZoneName: targetZone?.name,
        availableZones: zones.map(z => z.name)
      })

      let role: UserRole = 'zone_member'
      if (targetMembership?.role === 'coordinator') {
        role = 'zone_coordinator'
      } else if (targetZone && isHQGroup(targetZone.id)) {
        role = 'hq_member'
      }

      setCurrentZone(targetZone || null)
      setUserZones(zones)
      setUserRole(role)
      setCurrentZoneMembership(targetMembership)
      setIsSuperAdminUser(false)
      setIsLoading(false)

      setZoneCache({
        userId,
        currentZone: targetZone || null,
        userZones: zones,
        userRole: role,
        isSuperAdmin: false
      })
      lastLoadedUserId.current = userId
    } catch (error) {
      console.error('Error loading zones:', error)
      setIsLoading(false)
    } finally {
      isFetching.current = false
    }
  }

  const switchZone = useCallback(async (zoneId: string) => {
    const zone = userZones.find(z => z.id === zoneId)
    if (!zone || !user) return

    setCurrentZone(zone)

    // Update membership info
    if (!isSuperAdminUser) {
      let membership: any = null
      
      if (isHQGroup(zoneId)) {
        membership = await HQMembersService.getMemberByUserId(user.uid, zoneId)
        if (membership) {
          membership.zoneId = membership.hqGroupId
          membership.isHQMember = true
        }
      } else {
        const zoneMemberships = await FirebaseDatabaseService.getCollectionWhere(
          'zone_members', 'userId', '==', user.uid
        )
        membership = zoneMemberships.find((m: any) => m.zoneId === zoneId)
      }

      let role: UserRole = 'zone_member'
      if (membership?.role === 'coordinator') {
        role = 'zone_coordinator'
      } else if (membership?.isHQMember || isHQGroup(zoneId)) {
        role = 'hq_member'
      }

      setCurrentZoneMembership(membership)
      setUserRole(role)

      // Update cache
      if (user.uid) {
        setZoneCache({
          userId: user.uid,
          currentZone: zone,
          userZones,
          userRole: role,
          isSuperAdmin: false
        })
      }
    }
  }, [userZones, user, isSuperAdminUser])

  const refreshZones = useCallback(async () => {
    if (user?.uid && user?.email) {
      setIsLoading(true)
      await loadUserZones(user.uid, user.email)
    }
  }, [user?.uid, user?.email])

  const availableZones = userZones
  const allZones = useMemo(() => (isSuperAdminUser ? ZONES : []), [isSuperAdminUser])
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
    isSuperAdmin: isSuperAdminUser,
    isZoneCoordinator,
    userRole,
    hasPermission,
    currentZoneMembership,
    switchZone,
    refreshZones
  }
}
