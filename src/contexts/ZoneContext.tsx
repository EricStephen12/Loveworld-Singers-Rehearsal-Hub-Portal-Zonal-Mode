// @ts-nocheck
'use client'

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { useAuth } from './AuthContext'
import { FirebaseDatabaseService } from '@/lib/firebase-database'
import { ZONES, Zone, isSuperAdmin } from '@/config/zones'
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
  const loadUserZones = async () => {
    if (!user?.uid) {
      setUserZones([])
      setCurrentZone(null)
      setIsLoading(false)
      return
    }

    try {
      console.log('🔍 Loading zones for user:', user.email)
      
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
        // Get user's zone memberships from Firebase
        const memberships = await FirebaseDatabaseService.getCollectionWhere(
          'zone_members',
          'userId',
          '==',
          user.uid
        )
        
        console.log('📊 Found', memberships.length, 'zone memberships')
        
        if (memberships.length === 0) {
          console.log('⚠️ User has no zone memberships')
          setUserZones([])
          setCurrentZone(null)
          setUserRole('zone_member')
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
          
          // Set user role based on membership
          if (selectedMembership?.role === 'coordinator') {
            setUserRole('zone_coordinator')
            console.log('👔 User is Zone Coordinator')
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

  // Load zones when user changes
  useEffect(() => {
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
        const memberships = await FirebaseDatabaseService.getCollectionWhere(
          'zone_members',
          'userId',
          '==',
          user.uid
        )
        const membership = memberships.find((m: any) => m.zoneId === zoneId)
        setCurrentZoneMembership(membership)
        
        if (membership?.role === 'coordinator') {
          setUserRole('zone_coordinator')
          console.log('👔 Switched to Coordinator role')
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
