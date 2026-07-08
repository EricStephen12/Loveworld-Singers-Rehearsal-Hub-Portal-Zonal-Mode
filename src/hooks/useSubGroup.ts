'use client'

import { useState, useEffect, useCallback } from 'react'

import { useAuth } from './useAuth'
import { useZone } from './useZone'
import { SubGroupService, SubGroup, SubGroupRequest } from '@/lib/subgroup-service'
import { useSubGroupStore } from '@/stores/subGroupStore'

export function useSubGroup() {
  const { user } = useAuth()
  const { currentZone } = useZone()
  
  const [isSubGroupCoordinator, setIsSubGroupCoordinator] = useState(false)
  const [coordinatedSubGroups, setCoordinatedSubGroups] = useState<SubGroup[]>([])
  const [memberSubGroups, setMemberSubGroups] = useState<SubGroup[]>([])
  const [userRequests, setUserRequests] = useState<SubGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    if (!user?.uid) {
      setIsLoading(false)
      return
    }
    const cacheKey = user.uid;
    const cachedStore = useSubGroupStore.getState().getUserCache(cacheKey);
    const now = Date.now();
    const CACHE_TTL = 30 * 1000;

    if (cachedStore) {
      setIsSubGroupCoordinator(cachedStore.isSubGroupCoordinator);
      setCoordinatedSubGroups(cachedStore.coordinatedSubGroups);
      setMemberSubGroups(cachedStore.memberSubGroups);
      setUserRequests(cachedStore.userRequests);
      setIsLoading(false);

      if (now - cachedStore.lastFetchTime < CACHE_TTL) {
        return;
      }
    } else {
      setIsLoading(true);
    }
    
    refresh().finally(() => setIsLoading(false))
    
    // Removed 30-second polling to prevent backend overload at scale
  }, [user?.uid, currentZone?.id])
  
  const requestSubGroup = useCallback(async (
    request: SubGroupRequest,
    requesterName: string,
    requesterEmail: string
  ) => {
    if (!user?.uid || !currentZone) {
      return { success: false, error: 'Not authenticated or no zone selected' }
    }
    
    const result = await SubGroupService.requestSubGroup(
      currentZone.id,
      user.uid,
      requesterName,
      requesterEmail,
      request
    )
    
    if (result.success) {
      const requests = await SubGroupService.getUserSubGroupRequests(currentZone.id, user.uid)
      setUserRequests(requests)
    }
    
    return result
  }, [user?.uid, currentZone])
  
  const refresh = useCallback(async () => {
    if (!user?.uid) return
    
    const [isCoordinator, coordinated, memberOf] = await Promise.all([
      SubGroupService.isSubGroupCoordinator(user.uid),
      SubGroupService.getCoordinatedSubGroups(user.uid),
      SubGroupService.getUserSubGroups(user.uid, currentZone?.id)
    ])
    
    setIsSubGroupCoordinator(isCoordinator)
    setCoordinatedSubGroups(coordinated)
    setMemberSubGroups(memberOf)
    
    let requests: SubGroup[] = [];
    if (currentZone) {
      requests = await SubGroupService.getUserSubGroupRequests(currentZone.id, user.uid)
      setUserRequests(requests)
    }

    useSubGroupStore.getState().setUserCache(user.uid, {
      isSubGroupCoordinator: isCoordinator,
      coordinatedSubGroups: coordinated,
      memberSubGroups: memberOf,
      userRequests: requests,
      lastFetchTime: Date.now()
    });
  }, [user?.uid, currentZone])
  
  return {
    isSubGroupCoordinator,
    coordinatedSubGroups,
    memberSubGroups,
    userRequests,
    isLoading,
    requestSubGroup,
    refresh
  }
}

export function useZoneSubGroups() {
  const { user, profile } = useAuth()
  const { currentZone, isZoneCoordinator, isSuperAdmin, userRole } = useZone()
  const isAdmin = isSuperAdmin || isZoneCoordinator || userRole === 'hq_admin' || userRole === 'boss' || userRole === 'super_admin'
  
  const [subGroups, setSubGroups] = useState<SubGroup[]>([])
  const [pendingCount, setPendingCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    const loadSubGroups = async () => {
      if (!currentZone || !isAdmin) {
        setIsLoading(false)
        return
      }
      const cacheKey = currentZone.id;
      const cachedStore = useSubGroupStore.getState().getZoneCache(cacheKey);
      const now = Date.now();
      const CACHE_TTL = 30 * 1000;

      if (cachedStore) {
        setSubGroups(cachedStore.subGroups);
        setPendingCount(cachedStore.pendingCount);
        setIsLoading(false);

        if (now - cachedStore.lastFetchTime < CACHE_TTL) {
          return;
        }
      } else {
        setIsLoading(true);
      }
      
      try {
        const [groups, count] = await Promise.all([
          SubGroupService.getZoneSubGroups(currentZone.id),
          SubGroupService.getPendingRequestCount(currentZone.id)
        ])
        
        setSubGroups(groups)
        setPendingCount(count)

        useSubGroupStore.getState().setZoneCache(cacheKey, {
          subGroups: groups,
          pendingCount: count,
          lastFetchTime: Date.now()
        });
      } catch (error) {
        console.error('Error loading zone sub-groups:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadSubGroups()
  }, [currentZone?.id, isAdmin])
  
  const approveSubGroup = useCallback(async (subGroupId: string) => {
    if (!user?.uid) return { success: false, error: 'Not authenticated' }
    
    const approverName = profile?.first_name 
      ? `${profile.first_name} ${profile.last_name || ''}` 
      : 'Zone Coordinator'
    
    const result = await SubGroupService.approveSubGroup(subGroupId, user.uid, approverName)
    
    if (result.success && currentZone) {
      const [groups, count] = await Promise.all([
        SubGroupService.getZoneSubGroups(currentZone.id),
        SubGroupService.getPendingRequestCount(currentZone.id)
      ])
      setSubGroups(groups)
      setPendingCount(count)
    }
    
    return result
  }, [user?.uid, profile, currentZone])
  
  const rejectSubGroup = useCallback(async (subGroupId: string, reason: string) => {
    if (!user?.uid) return { success: false, error: 'Not authenticated' }
    
    const rejecterName = profile?.first_name 
      ? `${profile.first_name} ${profile.last_name || ''}` 
      : 'Zone Coordinator'
    
    const result = await SubGroupService.rejectSubGroup(subGroupId, user.uid, rejecterName, reason)
    
    if (result.success && currentZone) {
      const [groups, count] = await Promise.all([
        SubGroupService.getZoneSubGroups(currentZone.id),
        SubGroupService.getPendingRequestCount(currentZone.id)
      ])
      setSubGroups(groups)
      setPendingCount(count)
    }
    
    return result
  }, [user?.uid, profile, currentZone])
  
  const refresh = useCallback(async () => {
    if (!currentZone) return
    
    const [groups, count] = await Promise.all([
      SubGroupService.getZoneSubGroups(currentZone.id),
      SubGroupService.getPendingRequestCount(currentZone.id)
    ])
    setSubGroups(groups)
    setPendingCount(count)
  }, [currentZone])
  
  return {
    subGroups,
    pendingSubGroups: subGroups.filter(sg => sg.status === 'pending'),
    activeSubGroups: subGroups.filter(sg => sg.status === 'active'),
    pendingCount,
    isLoading,
    approveSubGroup,
    rejectSubGroup,
    refresh
  }
}
