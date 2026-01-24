import { useState, useEffect, useCallback, useMemo, useRef } from 'react'

import { useAuthContext } from '@/contexts/AuthContext'
import { FirebaseDatabaseService } from '@/lib/firebase-database'
import { HQMembersService } from '@/lib/hq-members-service'
import { ZONES, Zone, isSuperAdmin, isHQGroup } from '@/config/zones'
import { UserRole, hasPermission as checkPermission } from '@/config/roles'

const getUserZonePreferenceKey = (userId: string) => `lwsrh-user-zone-${userId}`

function getUserZonePreference(userId: string): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(getUserZonePreferenceKey(userId))
  } catch {
    return null
  }
}

function setUserZonePreference(userId: string, zoneId: string) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(getUserZonePreferenceKey(userId), zoneId)
  } catch {
    // Storage quota exceeded or private browsing
  }
}

const ZONE_CACHE_KEY = 'lwsrh-zone-cache-v6'
const ZONE_CACHE_TTL = 5 * 60 * 1000

interface ZoneCacheData {
  userId: string
  currentZoneId: string | null
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
  } catch {}
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
  const [initialLoadComplete, setInitialLoadComplete] = useState(false)

  // Track when initial load is complete
  useEffect(() => {
    if (!isLoading && initialLoadComplete === false) {
      setInitialLoadComplete(true)
    }
  }, [isLoading, initialLoadComplete])
  useEffect(() => {
    if (!user?.uid) {
      setCurrentZone(null)
      setUserZones([])
      setUserRole('zone_member')
      setIsSuperAdminUser(false)
      setIsLoading(false)
      lastLoadedUserId.current = null
      return
    }

    const savedZoneId = getUserZonePreference(user.uid)
    const cached = getZoneCache(user.uid)
    
    if (cached && cached.userZones.length > 0) {
      const preferredZoneId = savedZoneId || cached.currentZoneId
      const zone = preferredZoneId 
        ? cached.userZones.find(z => z.id === preferredZoneId) || cached.userZones[0]
        : cached.userZones[0]
      
      setCurrentZone(zone || null)
      setUserZones(cached.userZones)
      setUserRole(cached.userRole)
      setIsSuperAdminUser(cached.isSuperAdmin)
      setIsLoading(false)
      lastLoadedUserId.current = user.uid
      return
    }

    if (isFetching.current && lastLoadedUserId.current === user.uid) return

    loadUserZones(user.uid, user.email || '', savedZoneId || undefined)
  }, [user?.uid, user?.email])

  const loadUserZones = async (userId: string, email: string, preferredZoneId?: string) => {
    if (isFetching.current && !preferredZoneId) return
    isFetching.current = true
    setIsLoading(true)
    
    try {
      const superAdmin = isSuperAdmin(email, userId)
      
      if (superAdmin) {
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
          currentZoneId: targetZone.id,
          userZones: ZONES,
          userRole: 'super_admin',
          isSuperAdmin: true
        })
        isFetching.current = false
        return
      }

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
        isFetching.current = false
        return
      }

      const zones = memberships
        .map((m: any) => ZONES.find(z => z.id === m.zoneId))
        .filter((z): z is Zone => z !== undefined)

      const targetZone = preferredZoneId 
        ? zones.find(z => z.id === preferredZoneId) || zones[0]
        : zones[0]
      const targetMembership = memberships.find((m: any) => m.zoneId === targetZone?.id)

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
        currentZoneId: targetZone?.id || null,
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
    if (!zone || !user) return false

    setUserZonePreference(user.uid, zoneId)
    clearZoneCache()
    setCurrentZone(zone)

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

    setZoneCache({
      userId: user.uid,
      currentZoneId: zoneId,
      userZones,
      userRole: role,
      isSuperAdmin: isSuperAdminUser
    })

    return true
  }, [userZones, user, isSuperAdminUser])

  const refreshZones = useCallback(async () => {
    if (user?.uid && user?.email) {
      clearZoneCache()
      setIsLoading(true)
      const savedZoneId = getUserZonePreference(user.uid)
      await loadUserZones(user.uid, user.email, savedZoneId || undefined)
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
    refreshZones,
    initialLoadComplete
  }
}
