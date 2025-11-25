// @ts-nocheck
'use client'

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { useAuth } from './AuthContext'
import { FirebaseDatabaseService } from '@/lib/firebase-database'
import { HQMembersService } from '@/lib/hq-members-service'
import { ZONES, Zone, isSuperAdmin, isHQGroup } from '@/config/zones'
import { UserRole, hasPermission } from '@/config/roles'

interface ZoneContextType {
  currentZone: Zone | null;
  userZones: Zone[];
  availableZones: Zone[]; // Available zones for current user
  allZones: Zone[]; // Only for super admin
  isLoading: boolean;
  isSuperAdmin: boolean;
  isZoneCoordinator: boolean; // NEW
  userRole: UserRole; // NEW
  hasPermission: (permission: string) => boolean; // NEW
  switchZone: (zoneId: string) => void;
  refreshZones: () => Promise<void>;
}

const ZoneContext = createContext<ZoneContextType | undefined>(undefined)

export function ZoneProvider({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth()
  const [currentZone, setCurrentZone] = useState<Zone | null>(null)
  const [userZones, setUserZones] = useState<Zone[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSuperAdminUser, setIsSuperAdminUser] = useState(false)
  const [userRole, setUserRole] = useState<UserRole>('zone_member')
  const [currentZoneMembership, setCurrentZoneMembership] = useState<any>(null)

  // Load user's zones from Firebase
  const loadUserZones = async (retryCount = 0) => {
    if (!user?.uid) {
      setUserZones([])
      setCurrentZone(null)
      setIsLoading(false)
      return
    }

    try {
      console.log('🔍 Loading zones for user:', user.email, retryCount > 0 ? `(Retry ${retryCount})` : '')
      
      // Check if super admin
      const superAdmin = isSuperAdmin(user.email, user.uid)
      setIsSuperAdminUser(superAdmin)
      
      if (superAdmin) {
        console.log('👑 Super Admin detected - access to all zones')
        setUserZones(ZONES)
        setUserRole('super_admin')
        
        // Check if they have actual zone memberships first
        const memberships = await FirebaseDatabaseService.getCollectionWhere(
          'zone_members',
          'userId',
          '==',
          user.uid
        )
        
        console.log(`👑 ${roleLabel} memberships:`, memberships)
        
        // Load last selected zone from localStorage
        const savedZoneId = localStorage.getItem('currentZoneId')
        let selectedZone: Zone | undefined
        
        if (savedZoneId) {
          selectedZone = ZONES.find(z => z.id === savedZoneId)
          console.log(`💾 ${roleLabel} saved zone:`, selectedZone?.name)
        }
        
        // If no saved zone, prioritize their actual membership zone
        if (!selectedZone && memberships.length > 0) {
          const membershipZoneId = memberships[0].zoneId
          selectedZone = ZONES.find(z => z.id === membershipZoneId)
          console.log(`🎯 ${roleLabel} using membership zone:`, selectedZone?.name, membershipZoneId)
        }
        
        // Fallback to first zone
        if (!selectedZone) {
          selectedZone = ZONES[0]
          console.log(`🔄 ${roleLabel} fallback to first zone:`, selectedZone.name)
        }
        
        setCurrentZone(selectedZone)
      } else {
        // Get user's zone memberships from Firebase (regular zones)
        const zoneMemberships = await FirebaseDatabaseService.getCollectionWhere(
          'zone_members',
          'userId',
          '==',
          user.uid
        )
        
        // Get user's HQ group memberships (separate collection)
        const hqMemberships = await HQMembersService.getUserHQGroups(user.uid)
        
        // Combine both memberships
        const memberships = [
          ...zoneMemberships,
          ...hqMemberships.map((hq: any) => ({
            ...hq,
            zoneId: hq.hqGroupId, // Map hqGroupId to zoneId for consistency
            isHQMember: true
          }))
        ]
        
        console.log('📊 Found', zoneMemberships.length, 'zone memberships +', hqMemberships.length, 'HQ memberships')
        
        if (memberships.length === 0) {
          console.log('⚠️ User has no zone memberships')
          
          // Retry up to 3 times with delay (for new signups where data might not be ready)
          if (retryCount < 3) {
            console.log(`🔄 Retrying in 2 seconds... (attempt ${retryCount + 1}/3)`)
            setTimeout(() => loadUserZones(retryCount + 1), 2000)
            return
          }
          
          console.log('💡 User has no zones after retries - they need to join a zone')
          setUserZones([])
          setCurrentZone(null)
          setUserRole('zone_member')
          setIsLoading(false) // Important: Stop loading even if no zones
        } else {
          console.log('📊 Processing memberships:', memberships)
          
          // Debug: Check if Boss zone exists in ZONES array
          console.log('🔍 ZONES array info:', {
            totalZones: ZONES.length,
            bossZoneExists: ZONES.some(z => z.id === 'zone-boss'),
            bossZone: ZONES.find(z => z.id === 'zone-boss'),
            lastZone: ZONES[ZONES.length - 1]
          })
          
          // Map memberships to zones
          const zones = memberships
            .map((m: any) => {
              const zone = ZONES.find(z => z.id === m.zoneId)
              console.log('🔍 Mapping membership:', { 
                membershipZoneId: m.zoneId, 
                found: !!zone, 
                zoneName: zone?.name,
                membershipData: m
              })
              
              if (!zone) {
                console.error('❌ Zone not found in ZONES array:', m.zoneId, 'Available zones:', ZONES.length)
              }
              
              return zone
            })
            .filter((z): z is Zone => z !== undefined)
          
          console.log('✅ User zones:', zones.map(z => ({ id: z.id, name: z.name })))
          setUserZones(zones)
          
          // Set current zone (saved zone or first zone)
          const savedZoneId = localStorage.getItem('currentZoneId')
          let selectedZone: Zone | undefined
          let selectedMembership: any
          
          console.log('💾 Saved zone ID from localStorage:', savedZoneId)
          
          if (savedZoneId) {
            selectedZone = zones.find(z => z.id === savedZoneId)
            selectedMembership = memberships.find((m: any) => m.zoneId === savedZoneId)
            console.log('🔍 Found saved zone:', selectedZone?.name)
          }
          
          if (!selectedZone && zones.length > 0) {
            selectedZone = zones[0]
            selectedMembership = memberships.find((m: any) => m.zoneId === zones[0].id)
            console.log('🎯 Using first zone:', selectedZone.name, selectedZone.id)
          }
          
          console.log('✅ Final selected zone:', selectedZone ? { id: selectedZone.id, name: selectedZone.name } : 'None')
          console.log('✅ Final membership:', selectedMembership ? { zoneId: selectedMembership.zoneId, role: selectedMembership.role } : 'None')
          
          setCurrentZone(selectedZone || null)
          setCurrentZoneMembership(selectedMembership)
          
          // Set user role based on membership and zone type
          if (selectedMembership?.role === 'coordinator') {
            setUserRole('zone_coordinator')
            console.log('👔 User is Zone Coordinator')
          } else if (selectedZone && isHQGroup(selectedZone.id)) {
            setUserRole('hq_member')
            console.log('🏢 User is HQ Member (full access, no subscription needed)')
          } else {
            setUserRole('zone_member')
            console.log('👤 User is Zone Member')
          }
        }
      }
    } catch (error) {
      console.error('❌ Error loading user zones:', error)
      setUserZones([])
      setCurrentZone(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Load zones when user changes (but not during logout)
  useEffect(() => {
    // Don't load zones if we're in the middle of logging out
    if (typeof window !== 'undefined' && localStorage.getItem('logging_out') === 'true') {
      setUserZones([])
      setCurrentZone(null)
      setIsLoading(false)
      return
    }
    
    loadUserZones()
  }, [user?.uid])

  // Switch zone
  const switchZone = async (zoneId: string) => {
    const zone = userZones.find(z => z.id === zoneId)
    if (zone && user) {
      setCurrentZone(zone)
      localStorage.setItem('currentZoneId', zoneId)
      console.log('✅ Switched to zone:', zone.name, zoneId)
      
      // Update user role for new zone
      if (!isSuperAdminUser) {
        let membership: any = null
        
        // Check if it's an HQ group
        if (isHQGroup(zoneId)) {
          // Check hq_members collection
          membership = await HQMembersService.getMemberByUserId(user.uid, zoneId)
          if (membership) {
            membership.zoneId = membership.hqGroupId // Map for consistency
            membership.isHQMember = true
          }
        } else {
          // Check zone_members collection
          const zoneMemberships = await FirebaseDatabaseService.getCollectionWhere(
            'zone_members',
            'userId',
            '==',
            user.uid
          )
          membership = zoneMemberships.find((m: any) => m.zoneId === zoneId)
        }
        
        setCurrentZoneMembership(membership)
        
        if (membership?.role === 'coordinator') {
          setUserRole('zone_coordinator')
          console.log('👔 Switched to Coordinator role')
        } else if (membership?.isHQMember || isHQGroup(zoneId)) {
          setUserRole('hq_member')
          console.log('🏢 Switched to HQ Member role (full access)')
        } else {
          setUserRole('zone_member')
          console.log('👤 Switched to Member role')
        }
      }
    }
  }

  // Refresh zones
  const refreshZones = async () => {
    setIsLoading(true)
    await loadUserZones()
  }

  // Check if user has a specific permission
  const checkPermission = (permission: string) => {
    return hasPermission(userRole, permission as any)
  }

  const contextValue = useMemo(() => ({
    currentZone,
    userZones,
    availableZones: userZones, // Available zones are the user's zones
    allZones: isSuperAdminUser ? ZONES : [],
    isLoading,
    isSuperAdmin: isSuperAdminUser,
    isZoneCoordinator: userRole === 'zone_coordinator',
    userRole,
    hasPermission: checkPermission,
    switchZone,
    refreshZones
  }), [currentZone, userZones, isLoading, isSuperAdminUser, userRole])

  return (
    <ZoneContext.Provider value={contextValue}>
      {children}
    </ZoneContext.Provider>
  )
}

export function useZone() {
  const context = useContext(ZoneContext)
  if (context === undefined) {
    throw new Error('useZone must be used within a ZoneProvider')
  }
  return context
}
