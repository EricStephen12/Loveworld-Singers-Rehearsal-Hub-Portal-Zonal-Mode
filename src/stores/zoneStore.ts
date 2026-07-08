/**
 * ZONE STORE — Single Source of Truth for Zone State
 *
 * Replaces: useZone hook (per-component local state) + legacy zoneStore
 *
 * Strategy:
 * - ONE shared fetch across ALL components (no duplicate Firestore reads)
 * - Zone preference persisted to localStorage (survives page reload)
 * - switchZone does NOT clear cache — zone data stays warm
 * - subscribeWithSelector: components re-render only when their slice changes
 */

import { create } from 'zustand'
import { persist, createJSONStorage, subscribeWithSelector } from 'zustand/middleware'
import { FirebaseDatabaseService } from '@/lib/firebase-database'
import { HQMembersService } from '@/lib/hq-members-service'
import { ZONES, Zone, isSuperAdmin, isHQGroup } from '@/config/zones'
import { UserRole, hasPermission as checkPermission, isHQAdminEmail } from '@/config/roles'

// ─── Types ──────────────────────────────────────────────────────────────────

interface ZoneState {
  // Data
  currentZone: Zone | null
  userZones: Zone[]
  userRole: UserRole
  currentZoneMembership: any
  isSuperAdmin: boolean

  // Loading
  isLoading: boolean
  isInitialized: boolean
  _lastLoadedUserId: string | null

  // Actions
  loadUserZones: (userId: string, email: string) => Promise<void>
  switchZone: (zoneId: string, userId: string, email: string) => Promise<boolean>
  refreshZones: (userId: string, email: string) => Promise<void>
  clearZoneState: () => void
  hasPermission: (permission: string) => boolean
}

// ─── localStorage zone preference (per user) ─────────────────────────────────

function getUserZonePrefKey(userId: string) {
  return `lwsrh-user-zone-${userId}`
}

function getUserZonePref(userId: string): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(getUserZonePrefKey(userId))
  } catch {
    return null
  }
}

function setUserZonePref(userId: string, zoneId: string) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(getUserZonePrefKey(userId), zoneId)
  } catch {}
}

// ─── In-flight dedup guard ────────────────────────────────────────────────────
let _isFetchingZones = false

// ─── Store ───────────────────────────────────────────────────────────────────

export const useZoneStore = create<ZoneState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Initial state
        currentZone: null,
        userZones: [],
        userRole: 'zone_member',
        currentZoneMembership: null,
        isSuperAdmin: false,
        isLoading: true,
        isInitialized: false,
        _lastLoadedUserId: null,

        // ── hasPermission ─────────────────────────────────────────────────────
        hasPermission: (permission: string) =>
          checkPermission(get().userRole, permission as any),

        // ── clearZoneState ────────────────────────────────────────────────────
        clearZoneState: () => {
          set({
            currentZone: null,
            userZones: [],
            userRole: 'zone_member',
            currentZoneMembership: null,
            isSuperAdmin: false,
            isLoading: false,
            isInitialized: false,
            _lastLoadedUserId: null,
          })
        },

        // ── loadUserZones ─────────────────────────────────────────────────────
        loadUserZones: async (userId: string, email: string) => {
          const { _lastLoadedUserId, userZones, isInitialized } = get()

          // Skip if already loaded for this user (cache hit)
          if (_lastLoadedUserId === userId && userZones.length > 0 && isInitialized) {
            return
          }

          // Dedup: prevent parallel fetches for the same user
          if (_isFetchingZones) return
          _isFetchingZones = true

          set({ isLoading: true })

          const savedZoneId = getUserZonePref(userId)

          try {
            // ── Super Admin shortcut ──────────────────────────────────────────
            const isSuper = isSuperAdmin(email, userId)
            if (isSuper) {
              const targetZone = savedZoneId
                ? ZONES.find((z) => z.id === savedZoneId) || ZONES[0]
                : ZONES[0]

              set({
                currentZone: targetZone,
                userZones: ZONES,
                userRole: 'super_admin',
                isSuperAdmin: true,
                isLoading: false,
                isInitialized: true,
                _lastLoadedUserId: userId,
              })
              return
            }

            // ── Regular user: parallel fetch zone + HQ memberships ────────────
            const [zoneMemberships, hqMemberships] = await Promise.all([
              FirebaseDatabaseService.getCollectionWhere('zone_members', 'userId', '==', userId),
              HQMembersService.getUserHQGroups(userId),
            ])

            const memberships = [
              ...zoneMemberships,
              ...hqMemberships.map((hq: any) => ({
                ...hq,
                zoneId: hq.hqGroupId,
                isHQMember: true,
              })),
            ]

            if (memberships.length === 0) {
              set({
                currentZone: null,
                userZones: [],
                userRole: 'zone_member',
                isLoading: false,
                isInitialized: true,
                _lastLoadedUserId: userId,
              })
              return
            }

            const zones = memberships
              .map((m: any) => ZONES.find((z) => z.id === m.zoneId))
              .filter((z): z is Zone => z !== undefined)

            const targetZone = savedZoneId
              ? zones.find((z) => z.id === savedZoneId) || zones[0]
              : zones[0]

            const targetMembership = memberships.find(
              (m: any) => m.zoneId === targetZone?.id
            )

            let role: UserRole = 'zone_member'
            if (isHQAdminEmail(email)) {
              role = 'hq_admin'
            } else if (targetMembership?.role === 'coordinator') {
              role = 'zone_coordinator'
            } else if (targetZone && isHQGroup(targetZone.id)) {
              role = 'hq_member'
            }

            set({
              currentZone: targetZone || null,
              userZones: zones,
              userRole: role,
              currentZoneMembership: targetMembership || null,
              isSuperAdmin: false,
              isLoading: false,
              isInitialized: true,
              _lastLoadedUserId: userId,
            })
          } catch (error) {
            console.error('[ZoneStore] Error loading zones:', error)
            set({ isLoading: false, isInitialized: true })
          } finally {
            _isFetchingZones = false
          }
        },

        // ── switchZone ────────────────────────────────────────────────────────
        switchZone: async (zoneId: string, userId: string, email: string) => {
          const { userZones } = get()
          const zone = userZones.find((z) => z.id === zoneId)
          if (!zone) return false

          // Optimistically update zone immediately
          set({ currentZone: zone })
          setUserZonePref(userId, zoneId)

          // Fetch fresh membership for the new zone in the background
          try {
            let membership: any = null

            if (isHQGroup(zoneId)) {
              membership = await HQMembersService.getMemberByUserId(userId, zoneId)
              if (membership) {
                membership.zoneId = membership.hqGroupId
                membership.isHQMember = true
              }
            } else {
              const zoneMemberships = await FirebaseDatabaseService.getCollectionWhere(
                'zone_members',
                'userId',
                '==',
                userId
              )
              membership = zoneMemberships.find((m: any) => m.zoneId === zoneId)
            }

            let role: UserRole = 'zone_member'
            if (isHQAdminEmail(email)) {
              role = 'hq_admin'
            } else if (membership?.role === 'coordinator') {
              role = 'zone_coordinator'
            } else if (membership?.isHQMember || isHQGroup(zoneId)) {
              role = 'hq_member'
            }

            set({ currentZoneMembership: membership, userRole: role })
          } catch (error) {
            console.error('[ZoneStore] switchZone membership fetch failed:', error)
          }

          return true
        },

        // ── refreshZones (force re-fetch) ─────────────────────────────────────
        refreshZones: async (userId: string, email: string) => {
          set({ _lastLoadedUserId: null }) // Reset so loadUserZones won't skip
          await get().loadUserZones(userId, email)
        },
      }),
      {
        name: 'lwsrh-zone-store-v4',
        storage: createJSONStorage(() => localStorage),
        // Only persist what's needed for instant reload — NOT the full userZones array for super admins
        partialize: (state) => ({
          currentZone: state.currentZone,
          userZones: state.userZones.slice(0, 20), // Cap at 20 to prevent large localStorage writes
          userRole: state.userRole,
          isSuperAdmin: state.isSuperAdmin,
          _lastLoadedUserId: state._lastLoadedUserId,
        }),
      }
    )
  )
)

// ─── Typed selectors ─────────────────────────────────────────────────────────

export const selectCurrentZone = (s: ZoneState) => s.currentZone
export const selectUserZones = (s: ZoneState) => s.userZones
export const selectUserRole = (s: ZoneState) => s.userRole
export const selectZoneLoading = (s: ZoneState) => s.isLoading
export const selectIsSuperAdmin = (s: ZoneState) => s.isSuperAdmin
export const selectZoneInitialized = (s: ZoneState) => s.isInitialized

// ─── Convenience hook (drop-in replacement for useZone) ──────────────────────
export function useZone() {
  const currentZone = useZoneStore(selectCurrentZone)
  const userZones = useZoneStore(selectUserZones)
  const userRole = useZoneStore(selectUserRole)
  const isLoading = useZoneStore(selectZoneLoading)
  const isSuperAdminUser = useZoneStore(selectIsSuperAdmin)
  const isInitialized = useZoneStore(selectZoneInitialized)
  const currentZoneMembership = useZoneStore((s) => s.currentZoneMembership)
  const switchZone = useZoneStore((s) => s.switchZone)
  const refreshZones = useZoneStore((s) => s.refreshZones)

  // Get auth info for actions that need it
  const { user } = useAuthStoreShim()

  return {
    currentZone,
    userZones,
    availableZones: userZones,
    allZones: isSuperAdminUser ? ZONES : [],
    isLoading,
    isSuperAdmin: isSuperAdminUser,
    isZoneCoordinator: userRole === 'zone_coordinator',
    userRole,
    hasPermission: (permission: string) =>
      checkPermission(userRole, permission as any),
    currentZoneMembership,
    switchZone: (zoneId: string) =>
      switchZone(zoneId, user?.uid || '', user?.email || ''),
    refreshZones: () =>
      refreshZones(user?.uid || '', user?.email || ''),
    initialLoadComplete: isInitialized,
    isInitialized,
  }
}

// Minimal auth shim to avoid circular imports
function useAuthStoreShim() {
  // Dynamic require to break circular dep — auth store is always initialized first
  const { useAuthStore } = require('@/stores/authStore')
  return {
    user: useAuthStore((s: any) => s.user),
  }
}
