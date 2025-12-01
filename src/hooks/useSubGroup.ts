"use client";

/**
 * useSubGroup Hook
 * Provides sub-group context and utilities for components
 */

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { useZone } from './useZone'
import { SubGroupService, SubGroup, SubGroupRequest } from '@/lib/subgroup-service'

export function useSubGroup() {
  const { user } = useAuth()
  const { currentZone } = useZone()
  
  const [isSubGroupCoordinator, setIsSubGroupCoordinator] = useState(false)
  const [coordinatedSubGroups, setCoordinatedSubGroups] = useState<SubGroup[]>([])
  const [memberSubGroups, setMemberSubGroups] = useState<SubGroup[]>([])
  const [userRequests, setUserRequests] = useState<SubGroup[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Load user's sub-group data
  useEffect(() => {
    const loadSubGroupData = async () => {
      if (!user?.uid) {
        setIsLoading(false)
        return
      }
      
      setIsLoading(true)
      try {
        const [isCoordinator, coordinated, memberOf] = await Promise.all([
          SubGroupService.isSubGroupCoordinator(user.uid),
          SubGroupService.getCoordinatedSubGroups(user.uid),
          SubGroupService.getUserSubGroups(user.uid)
        ])
        
        setIsSubGroupCoordinator(isCoordinator)
        setCoordinatedSubGroups(coordinated)
        setMemberSubGroups(memberOf)
        
        // Load user's requests if in a zone
        if (currentZone) {
          const requests = await SubGroupService.getUserSubGroupRequests(currentZone.id, user.uid)
          setUserRequests(requests)
        }
      } catch (error) {
        console.error('Error loading sub-group data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadSubGroupData()
  }, [user?.uid, currentZone?.id])
  
  // Request a new sub-group
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
      // Refresh user requests
      const requests = await SubGroupService.getUserSubGroupRequests(currentZone.id, user.uid)
      setUserRequests(requests)
    }
    
    return result
  }, [user?.uid, currentZone])
  
  // Refresh sub-group data
  const refresh = useCallback(async () => {
    if (!user?.uid) return
    
    const [isCoordinator, coordinated, memberOf] = await Promise.all([
      SubGroupService.isSubGroupCoordinator(user.uid),
      SubGroupService.getCoordinatedSubGroups(user.uid),
      SubGroupService.getUserSubGroups(user.uid)
    ])
    
    setIsSubGroupCoordinator(isCoordinator)
    setCoordinatedSubGroups(coordinated)
    setMemberSubGroups(memberOf)
    
    if (currentZone) {
      const requests = await SubGroupService.getUserSubGroupRequests(currentZone.id, user.uid)
      setUserRequests(requests)
    }
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

/**
 * Hook for Zone Coordinators to manage sub-groups
 */
export function useZoneSubGroups() {
  const { user, profile } = useAuth()
  const { currentZone, isZoneCoordinator } = useZone()
  
  const [subGroups, setSubGroups] = useState<SubGroup[]>([])
  const [pendingCount, setPendingCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  
  // Load zone sub-groups
  useEffect(() => {
    const loadSubGroups = async () => {
      if (!currentZone || !isZoneCoordinator) {
        setIsLoading(false)
        return
      }
      
      setIsLoading(true)
      try {
        const [groups, count] = await Promise.all([
          SubGroupService.getZoneSubGroups(currentZone.id),
          SubGroupService.getPendingRequestCount(currentZone.id)
        ])
        
        setSubGroups(groups)
        setPendingCount(count)
      } catch (error) {
        console.error('Error loading zone sub-groups:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadSubGroups()
  }, [currentZone?.id, isZoneCoordinator])
  
  // Approve a sub-group
  const approveSubGroup = useCallback(async (subGroupId: string) => {
    if (!user?.uid) return { success: false, error: 'Not authenticated' }
    
    const approverName = profile?.first_name 
      ? `${profile.first_name} ${profile.last_name || ''}` 
      : 'Zone Coordinator'
    
    const result = await SubGroupService.approveSubGroup(subGroupId, user.uid, approverName)
    
    if (result.success && currentZone) {
      // Refresh data
      const [groups, count] = await Promise.all([
        SubGroupService.getZoneSubGroups(currentZone.id),
        SubGroupService.getPendingRequestCount(currentZone.id)
      ])
      setSubGroups(groups)
      setPendingCount(count)
    }
    
    return result
  }, [user?.uid, profile, currentZone])
  
  // Reject a sub-group
  const rejectSubGroup = useCallback(async (subGroupId: string, reason: string) => {
    if (!user?.uid) return { success: false, error: 'Not authenticated' }
    
    const rejecterName = profile?.first_name 
      ? `${profile.first_name} ${profile.last_name || ''}` 
      : 'Zone Coordinator'
    
    const result = await SubGroupService.rejectSubGroup(subGroupId, user.uid, rejecterName, reason)
    
    if (result.success && currentZone) {
      // Refresh data
      const [groups, count] = await Promise.all([
        SubGroupService.getZoneSubGroups(currentZone.id),
        SubGroupService.getPendingRequestCount(currentZone.id)
      ])
      setSubGroups(groups)
      setPendingCount(count)
    }
    
    return result
  }, [user?.uid, profile, currentZone])
  
  // Refresh data
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
