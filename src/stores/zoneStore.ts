import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { FirebaseDatabaseService } from '@/lib/firebase-database'
import { HQMembersService } from '@/lib/hq-members-service'
import { ZONES, Zone, isSuperAdmin, isHQGroup } from '@/config/zones'
import { UserRole } from '@/config/roles'
import { useAuthStore } from './authStore'

// Storage key for zone persistence
const ZONE_STORAGE_KEY = 'lwsrh-zone-state-v3'

interface ZoneState {
  currentZone: Zone | null
  userZones: Zone[]
  isLoading: boolean
  isSuperAdmin: boolean
  userRole: UserRole
  currentZoneMembership: any
  // CRITICAL: Track which user this zone state belongs to
  _userId: string | null
  // Track if we've done initial load from server
  _initialized: boolean
  
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
  clearZoneState: () => void
}

export const useZoneStore = create<ZoneState>()(
  persist(
    (set, get) => ({
      currentZone: null,
      userZones: [],
      // Start as not loading if we have cached data
      isLoading: false,
      isSuperAdmin: false,
      userRole: 'zone_member',
      currentZoneMembership: null,
      _userId: null,
      _initialized: false,

      setCurrentZone: (zone) => set({ currentZone: zone }),
      setUserZones: (zones) => set({ userZones: zones }),
      setIsLoading: (loading) => set({ isLoading: loading }),
      setIsSuperAdmin: (isSuperAdmin) => set({ isSuperAdmin }),
      setUserRole: (role) => set({ userRole: role }),
      setCurrentZoneMembership: (membership) => set({ currentZoneMembership: membership }),
      
      // Clear zone state completely (for logout)
      clearZoneState: () => {
        console.log('🧹 Clearing zone state...')
        set({
          currentZone: null,
          userZones: [],
          isLoading: false,
          isSuperAdmin: false,
          userRole: 'zone_member',
          currentZoneMembership: null,
          _userId: null,
          _initialized: false
        })
      },

      // Load user's zones from Firebase
      loadUserZones: async (retryCount = 0) => {
        const user = useAuthStore.getState().user
        
        if (!user?.uid) {
          get().clearZoneState()
          return
        }

        const state = get()
        const storedUserId = state._userId
        
        // CRITICAL SECURITY CHECK: If stored user doesn't match current user, clear everything
        if (storedUserId && storedUserId !== user.uid) {
          console.log('🔒 SECURITY: User mismatch! Clearing zone state.', storedUserId, '!=', user.uid)
          get().clearZoneState()
        }
        
        // If we already have valid data for this user, don't show loading
        const hasValidCache = state._userId === user.uid && 
                              state._initialized && 
                              state.currentZone !== null &&
                              state.userZones.length > 0
        
        if (hasValidCache && retryCount === 0) {
          console.log('⚡ Using persisted zone data for user:', user.email)
          set({ isLoading: false })
          // Still refresh in background silently
        } else if (!hasValidCache) {
          set({ isLoading: true })
        }

        try {
          console.log('🔍 Loading zones for user:', user.email, retryCount > 0 ? `(Retry ${retryCount})` : '')
          
          const superAdmin = isSuperAdmin(user.email, user.uid)
          
          if (superAdmin) {
            console.log('👑 Super Admin detected')
            
            const memberships = await FirebaseDatabaseService.getCollectionWhere(
              'zone_members',
              'userId',
              '==',
              user.uid
            )
            
            // Use current zone if valid, otherwise find one
            let selectedZone: Zone | undefined = state.currentZone && state._userId === user.uid 
              ? ZONES.find(z => z.id === state.currentZone?.id)
              : undefined
            
            if (!selectedZone && memberships.length > 0) {
              const membershipZoneId = (memberships[0] as any).zoneId
              selectedZone = ZONES.find(z => z.id === membershipZoneId)
            }
            
            if (!selectedZone) {
              selectedZone = ZONES[0]
            }
            
            set({
              currentZone: selectedZone,
              userZones: ZONES,
              isSuperAdmin: true,
              userRole: 'super_admin',
              _userId: user.uid,
              _initialized: true,
              isLoading: false
            })
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
                console.log('⏳ No memberships found, retrying in 2s...')
                setTimeout(() => get().loadUserZones(retryCount + 1), 2000)
                return
              }
              
              set({
                userZones: [],
                currentZone: null,
                userRole: 'zone_member',
                _userId: user.uid,
                _initialized: true,
                isLoading: false
              })
            } else {
              const zones = memberships
                .map((m: any) => ZONES.find(z => z.id === m.zoneId))
                .filter((z): z is Zone => z !== undefined)
              
              // SECURITY: Only keep current zone if user has access to it
              let selectedZone: Zone | undefined
              let selectedMembership: any
              
              // Check if current persisted zone is valid for this user
              if (state.currentZone && state._userId === user.uid) {
                selectedZone = zones.find(z => z.id === state.currentZone?.id)
                if (selectedZone) {
                  selectedMembership = memberships.find((m: any) => m.zoneId === selectedZone?.id)
                  console.log('✅ Keeping persisted zone:', selectedZone.name)
                } else {
                  console.log('⚠️ Persisted zone not in user zones, selecting first')
                }
              }
              
              // If no valid zone, select first one
              if (!selectedZone && zones.length > 0) {
                selectedZone = zones[0]
                selectedMembership = memberships.find((m: any) => m.zoneId === zones[0].id)
              }
              
              let userRole: UserRole = 'zone_member'
              if (selectedMembership?.role === 'coordinator') {
                userRole = 'zone_coordinator'
              } else if (selectedZone && isHQGroup(selectedZone.id)) {
                userRole = 'hq_member'
              }
              
              set({
                currentZone: selectedZone || null,
                currentZoneMembership: selectedMembership,
                userZones: zones,
                userRole,
                isSuperAdmin: false,
                _userId: user.uid,
                _initialized: true,
                isLoading: false
              })
            }
          }
        } catch (error) {
          console.error('❌ Error loading user zones:', error)
          // On error, keep existing data if it's for the same user
          if (state._userId === user.uid && state._initialized) {
            console.log('⚠️ Error but keeping cached data')
            set({ isLoading: false })
          } else {
            set({ 
              userZones: [], 
              currentZone: null, 
              _userId: user.uid,
              isLoading: false 
            })
          }
        }
      },

      switchZone: async (zoneId: string) => {
        const { userZones, isSuperAdmin: isSuperAdminUser, _userId } = get()
        const user = useAuthStore.getState().user
        const zone = userZones.find(z => z.id === zoneId)
        
        if (!zone || !user) return
        
        // SECURITY: Verify user hasn't changed
        if (_userId && _userId !== user.uid) {
          console.log('🔒 SECURITY: User mismatch during zone switch!')
          get().loadUserZones()
          return
        }
        
        set({ currentZone: zone })
        
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
          
          let userRole: UserRole = 'zone_member'
          if (membership?.role === 'coordinator') {
            userRole = 'zone_coordinator'
          } else if (membership?.isHQMember || isHQGroup(zoneId)) {
            userRole = 'hq_member'
          }
          
          set({ 
            currentZoneMembership: membership,
            userRole
          })
        }
      },

      refreshZones: async () => {
        // Force refresh from server
        const state = get()
        set({ _initialized: false })
        await get().loadUserZones()
      }
    }),
    {
      name: ZONE_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      // Only persist these fields
      partialize: (state) => ({
        currentZone: state.currentZone,
        userZones: state.userZones,
        isSuperAdmin: state.isSuperAdmin,
        userRole: state.userRole,
        _userId: state._userId,
        _initialized: state._initialized
      }),
      // On rehydration, validate the data
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log('💾 Zone state rehydrated from storage')
          // Don't set loading to false here - let loadUserZones handle it
        }
      }
    }
  )
)

// Initialize zone loading when auth changes
if (typeof window !== 'undefined') {
  let previousUserId: string | null = null
  let isInitialized = false
  
  useAuthStore.subscribe((authState) => {
    const currentUser = authState.user
    const currentUserId = currentUser?.uid || null
    
    // Only react to actual user changes
    if (currentUserId !== previousUserId) {
      console.log('🔄 Auth state changed:', previousUserId ? 'user' : 'none', '->', currentUserId ? 'user' : 'none')
      
      // CRITICAL: If user logged out or changed, clear zone state immediately
      if (previousUserId && (!currentUserId || currentUserId !== previousUserId)) {
        console.log('🧹 User logged out or changed, clearing zone state')
        useZoneStore.getState().clearZoneState()
      }
      
      previousUserId = currentUserId
      
      if (currentUserId) {
        // Check if persisted state matches current user
        const zoneState = useZoneStore.getState()
        if (zoneState._userId === currentUserId && zoneState._initialized && zoneState.currentZone) {
          console.log('⚡ Valid persisted zone state found, using immediately')
          useZoneStore.setState({ isLoading: false })
        }
        // Always load/verify from server
        useZoneStore.getState().loadUserZones()
      }
    }
    
    isInitialized = true
  })
}
