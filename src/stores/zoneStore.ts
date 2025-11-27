import { create } from 'zustand'
import { FirebaseDatabaseService } from '@/lib/firebase-database'
import { HQMembersService } from '@/lib/hq-members-service'
import { ZONES, Zone, isSuperAdmin, isHQGroup } from '@/config/zones'
import { UserRole } from '@/config/roles'
import { useAuthStore } from './authStore'

interface ZoneState {
  currentZone: Zone | null
  userZones: Zone[]
  isLoading: boolean
  isSuperAdmin: boolean
  userRole: UserRole
  currentZoneMembership: any
  
  // Actions
  setCurrentZone: (zone: Zone | null) => void
  setUserZones: (zones: Zone[]) => void
  setIsLoading: (loading: boolean) => void
  setIsSuperAdmin: (isSuperAdmin: boolean) => void
  setUserRole: (role: UserRole) => void
  setCurrentZoneMembership: (membership: any) => void
  
  // Methods
  switchZone: (zoneId: string) => Promise<void>
  refreshZones: () => Promise<void>
  loadUserZones: (retryCount?: number) => Promise<void>
}

export const useZoneStore = create<ZoneState>((set, get) => ({
  currentZone: null,
  userZones: [],
  isLoading: true,
  isSuperAdmin: false,
  userRole: 'zone_member',
  currentZoneMembership: null,

  setCurrentZone: (zone) => set({ currentZone: zone }),
  setUserZones: (zones) => set({ userZones: zones }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setIsSuperAdmin: (isSuperAdmin) => set({ isSuperAdmin }),
  setUserRole: (role) => set({ userRole: role }),
  setCurrentZoneMembership: (membership) => set({ currentZoneMembership: membership }),

  // Load user's zones from Firebase
  loadUserZones: async (retryCount = 0) => {
    const user = useAuthStore.getState().user
    
    if (!user?.uid) {
      set({
        userZones: [],
        currentZone: null,
        isLoading: false
      })
      return
    }

    try {
      console.log('🔍 Loading zones for user:', user.email, retryCount > 0 ? `(Retry ${retryCount})` : '')
      
      const superAdmin = isSuperAdmin(user.email, user.uid)
      set({ isSuperAdmin: superAdmin })
      
      if (superAdmin) {
        console.log('👑 Super Admin detected')
        set({ userZones: ZONES, userRole: 'super_admin' })
        
        const memberships = await FirebaseDatabaseService.getCollectionWhere(
          'zone_members',
          'userId',
          '==',
          user.uid
        )
        
        const savedZoneId = localStorage.getItem('currentZoneId')
        let selectedZone: Zone | undefined
        
        if (savedZoneId) {
          selectedZone = ZONES.find(z => z.id === savedZoneId)
        }
        
        if (!selectedZone && memberships.length > 0) {
          const membershipZoneId = (memberships[0] as any).zoneId
          selectedZone = ZONES.find(z => z.id === membershipZoneId)
        }
        
        if (!selectedZone) {
          selectedZone = ZONES[0]
        }
        
        set({ currentZone: selectedZone })
      } else {
        const zoneMemberships = await FirebaseDatabaseService.getCollectionWhere(
          'zone_members',
          'userId',
          '==',
          user.uid
        )
        
        const hqMemberships = await HQMembersService.getUserHQGroups(user.uid)
        
        const memberships = [
          ...zoneMemberships,
          ...hqMemberships.map((hq: any) => ({
            ...hq,
            zoneId: hq.hqGroupId,
            isHQMember: true
          }))
        ]
        
        if (memberships.length === 0) {
          if (retryCount < 3) {
            setTimeout(() => get().loadUserZones(retryCount + 1), 2000)
            return
          }
          
          set({
            userZones: [],
            currentZone: null,
            userRole: 'zone_member',
            isLoading: false
          })
        } else {
          const zones = memberships
            .map((m: any) => ZONES.find(z => z.id === m.zoneId))
            .filter((z): z is Zone => z !== undefined)
          
          set({ userZones: zones })
          
          const savedZoneId = localStorage.getItem('currentZoneId')
          let selectedZone: Zone | undefined
          let selectedMembership: any
          
          if (savedZoneId) {
            selectedZone = zones.find(z => z.id === savedZoneId)
            selectedMembership = memberships.find((m: any) => m.zoneId === savedZoneId)
          }
          
          if (!selectedZone && zones.length > 0) {
            selectedZone = zones[0]
            selectedMembership = memberships.find((m: any) => m.zoneId === zones[0].id)
          }
          
          set({ 
            currentZone: selectedZone || null,
            currentZoneMembership: selectedMembership
          })
          
          if (selectedMembership?.role === 'coordinator') {
            set({ userRole: 'zone_coordinator' })
          } else if (selectedZone && isHQGroup(selectedZone.id)) {
            set({ userRole: 'hq_member' })
          } else {
            set({ userRole: 'zone_member' })
          }
        }
      }
    } catch (error) {
      console.error('❌ Error loading user zones:', error)
      set({ userZones: [], currentZone: null })
    } finally {
      set({ isLoading: false })
    }
  },

  switchZone: async (zoneId: string) => {
    const { userZones, isSuperAdmin: isSuperAdminUser } = get()
    const user = useAuthStore.getState().user
    const zone = userZones.find(z => z.id === zoneId)
    
    if (zone && user) {
      set({ currentZone: zone })
      localStorage.setItem('currentZoneId', zoneId)
      
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
            'zone_members',
            'userId',
            '==',
            user.uid
          )
          membership = zoneMemberships.find((m: any) => m.zoneId === zoneId)
        }
        
        set({ currentZoneMembership: membership })
        
        if (membership?.role === 'coordinator') {
          set({ userRole: 'zone_coordinator' })
        } else if (membership?.isHQMember || isHQGroup(zoneId)) {
          set({ userRole: 'hq_member' })
        } else {
          set({ userRole: 'zone_member' })
        }
      }
    }
  },

  refreshZones: async () => {
    set({ isLoading: true })
    await get().loadUserZones()
  }
}))

// Initialize zone loading when auth changes
if (typeof window !== 'undefined') {
  let previousUser: any = null
  
  useAuthStore.subscribe((state) => {
    const currentUser = state.user
    
    // Only react to actual user changes
    if (currentUser?.uid !== previousUser?.uid) {
      previousUser = currentUser
      
      if (currentUser?.uid) {
        useZoneStore.getState().loadUserZones()
      } else {
        useZoneStore.setState({
          userZones: [],
          currentZone: null,
          isLoading: false
        })
      }
    }
  })
}
