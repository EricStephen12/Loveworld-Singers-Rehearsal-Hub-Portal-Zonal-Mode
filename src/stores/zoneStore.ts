// ============================================
// LEGACY ZONE STORE - For backward compatibility
// ============================================
// The main zone flow now uses useZone hook (src/hooks/useZone.ts)
// This store is kept for backward compatibility with dynamic imports
// in utility files. It will be deprecated in future versions.

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { FirebaseDatabaseService } from '@/lib/firebase-database'
import { HQMembersService } from '@/lib/hq-members-service'
import { ZONES, Zone, isSuperAdmin, isHQGroup } from '@/config/zones'
import { UserRole } from '@/config/roles'

const ZONE_STORAGE_KEY = 'lwsrh-zone-state-v3'

interface ZoneState {
  currentZone: Zone | null
  userZones: Zone[]
  isLoading: boolean
  isSuperAdmin: boolean
  userRole: UserRole
  currentZoneMembership: any
  _userId: string | null
  _initialized: boolean
  
  setCurrentZone: (zone: Zone | null) => void
  setUserZones: (zones: Zone[]) => void
  setIsLoading: (loading: boolean) => void
  setIsSuperAdmin: (isSuperAdmin: boolean) => void
  setUserRole: (role: UserRole) => void
  setCurrentZoneMembership: (membership: any) => void
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
      
      clearZoneState: () => {
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

      loadUserZones: async (retryCount = 0) => {
        // This is now handled by useZone hook
      },

      switchZone: async (zoneId: string) => {
        const { userZones } = get()
        const zone = userZones.find(z => z.id === zoneId)
        if (zone) {
          set({ currentZone: zone })
        }
      },

      refreshZones: async () => {
        // This is now handled by useZone hook
      }
    }),
    {
      name: ZONE_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentZone: state.currentZone,
        userZones: state.userZones,
        isSuperAdmin: state.isSuperAdmin,
        userRole: state.userRole,
        _userId: state._userId,
        _initialized: state._initialized
      })
    }
  )
)

// NO AUTO-INITIALIZATION - useZone hook handles zone state now
