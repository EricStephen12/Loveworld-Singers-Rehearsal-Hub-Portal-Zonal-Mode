/**
 * Sub-Group Service
 * Handles sub-group creation, approval, and management
 * 
 * Flow:
 * 1. Member requests to create a sub-group (status: 'pending')
 * 2. Zone Coordinator approves (status: 'active')
 */

import { FirebaseDatabaseService } from './firebase-database'
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs,
  doc,
  getDoc,
  updateDoc,
  Timestamp
} from 'firebase/firestore'
import { db } from './firebase-setup'

// Sub-Group Types
export type SubGroupType = 'church' | 'campus' | 'cell' | 'youth' | 'other'
export type SubGroupStatus = 'pending' | 'active' | 'rejected'

export interface SubGroup {
  id: string
  zoneId: string
  name: string
  type: SubGroupType
  description: string
  coordinatorId: string
  coordinatorName?: string
  coordinatorEmail?: string
  memberIds: string[]
  status: SubGroupStatus
  estimatedMembers: number
  createdAt: Date
  approvedAt?: Date
  approvedBy?: string
  approvedByName?: string
  activatedAt?: Date
  rejectionReason?: string
  rejectedAt?: Date
  rejectedBy?: string
}

export interface SubGroupRequest {
  name: string
  type: SubGroupType
  description: string
  estimatedMembers: number
}

export class SubGroupService {
  
  private static parseTimestamp(ts: any): Date {
    if (!ts) return new Date()
    if (ts instanceof Date) return ts
    if (typeof ts.toDate === 'function') return ts.toDate()
    if (ts.seconds) return new Date(ts.seconds * 1000)
    const d = new Date(ts)
    return isNaN(d.getTime()) ? new Date() : d
  }

  /**
   * Create a sub-group request (Member action)
   */
  static async requestSubGroup(
    zoneId: string,
    requesterId: string,
    requesterName: string,
    requesterEmail: string,
    request: SubGroupRequest
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      
            const existingRequests = await this.getUserSubGroupRequests(zoneId, requesterId)
      const hasPending = existingRequests.some(r => r.status === 'pending')
      
      if (hasPending) {
        return { 
          success: false, 
          error: 'You already have a pending sub-group request in this zone' 
        }
      }
      
      const subGroupData = {
        zoneId,
        name: request.name.trim(),
        type: request.type,
        description: request.description.trim(),
        coordinatorId: requesterId,
        coordinatorName: requesterName,
        coordinatorEmail: requesterEmail,
        memberIds: [requesterId], // Requester is first member
        status: 'pending' as SubGroupStatus,
        estimatedMembers: request.estimatedMembers,
        createdAt: new Date()
      }
      
      const result = await FirebaseDatabaseService.addDocument('subgroups', subGroupData)
      
      if (result.success && result.id) {
        
        // Send notification to Zone Coordinator
        await this.notifyZoneCoordinator(zoneId, request.name, requesterName)
        
        return { success: true, id: result.id }
      }
      
      return { success: false, error: 'Failed to create request' }
    } catch (error) {
 console.error(' Error creating sub-group request:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }
  
  /**
   * Get all sub-groups for a zone (Zone Coordinator view)
   */
  static async getZoneSubGroups(zoneId: string): Promise<SubGroup[]> {
    try {
      let subGroups: any[] = []
      if (zoneId === 'zone-boss') {
        subGroups = await FirebaseDatabaseService.getCollection('subgroups', 500)
      } else {
        subGroups = await FirebaseDatabaseService.getCollectionWhere(
          'subgroups',
          'zoneId',
          '==',
          zoneId
        )
      }
      
      return subGroups.map((doc: any) => ({
        ...doc,
        createdAt: this.parseTimestamp(doc.createdAt),
        approvedAt: doc.approvedAt ? this.parseTimestamp(doc.approvedAt) : undefined,
        activatedAt: doc.activatedAt ? this.parseTimestamp(doc.activatedAt) : undefined,
        rejectedAt: doc.rejectedAt ? this.parseTimestamp(doc.rejectedAt) : undefined
      })) as SubGroup[]
    } catch (error) {
      console.error(' Error getting zone sub-groups:', error)
      return []
    }
  }
  
  /**
   * Get pending sub-group requests for a zone
   */
  static async getPendingRequests(zoneId: string): Promise<SubGroup[]> {
    try {
      const allSubGroups = await this.getZoneSubGroups(zoneId)
      return allSubGroups.filter(sg => sg.status === 'pending')
    } catch (error) {
 console.error(' Error getting pending requests:', error)
      return []
    }
  }
  
  /**
   * Get user's sub-group requests
   */
  static async getUserSubGroupRequests(zoneId: string, userId: string): Promise<SubGroup[]> {
    try {
      const all = await FirebaseDatabaseService.getCollectionWhere('subgroups', 'zoneId', '==', zoneId)
      const requests = all.filter((sg: any) => sg.coordinatorId === userId)
      
      return requests.map((doc: any) => ({
        ...doc,
        createdAt: this.parseTimestamp(doc.createdAt)
      })) as SubGroup[]
    } catch (error) {
      console.error(' Error getting user sub-group requests:', error)
      return []
    }
  }
  
  /**
   * Get sub-groups where user is a member
   */
  static async getUserSubGroups(userId: string, zoneId?: string): Promise<SubGroup[]> {
    try {
      const subGroups = await FirebaseDatabaseService.getCollectionWhere(
        'subgroups',
        'memberIds',
        'array-contains',
        userId
      )
      
      return subGroups
        .filter((sg: any) => sg.status === 'active' && (!zoneId || sg.zoneId === zoneId))
        .map((doc: any) => ({
          ...doc,
          createdAt: this.parseTimestamp(doc.createdAt)
        })) as SubGroup[]
    } catch (error) {
      console.error(' Error getting user sub-groups:', error)
      return []
    }
  }
  
  /**
   * Get a single sub-group by ID
   */
  static async getSubGroup(subGroupId: string): Promise<SubGroup | null> {
    try {
      const data = await FirebaseDatabaseService.getDocument('subgroups', subGroupId)
      
      if (data) {
        return {
          ...data,
          createdAt: this.parseTimestamp(data.createdAt)
        } as SubGroup
      }
      return null
    } catch (error) {
      console.error(' Error getting sub-group:', error)
      return null
    }
  }
  
  /**
   * Approve a sub-group request (Zone Coordinator action)
   */
  static async approveSubGroup(
    subGroupId: string,
    approvedBy: string,
    approvedByName: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      
      const subGroup = await this.getSubGroup(subGroupId)
      if (!subGroup) {
        return { success: false, error: 'Sub-group not found' }
      }
      
      if (subGroup.status !== 'pending') {
        return { success: false, error: 'Sub-group is not pending approval' }
      }
      
      await FirebaseDatabaseService.updateDocument('subgroups', subGroupId, {
        status: 'active',
        approvedAt: new Date(),
        activatedAt: new Date(),
        approvedBy,
        approvedByName
      })
      
      // Notify the requester
      await this.notifyRequester(
        subGroup.coordinatorId,
        subGroup.name,
        'approved',
        'Your sub-group request has been approved and is now active! You can now start managing your songs and rehearsals.'
      )
      
      return { success: true }
    } catch (error) {
 console.error(' Error approving sub-group:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }
  
  /**
   * Reject a sub-group request (Zone Coordinator action)
   */
  static async rejectSubGroup(
    subGroupId: string,
    rejectedBy: string,
    rejectedByName: string,
    reason: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      
      const subGroup = await this.getSubGroup(subGroupId)
      if (!subGroup) {
        return { success: false, error: 'Sub-group not found' }
      }
      
      if (subGroup.status !== 'pending') {
        return { success: false, error: 'Sub-group is not pending approval' }
      }
      
      await FirebaseDatabaseService.updateDocument('subgroups', subGroupId, {
        status: 'rejected',
        rejectionReason: reason,
        rejectedAt: new Date(),
        rejectedBy
      })
      
      // Notify the requester
      await this.notifyRequester(
        subGroup.coordinatorId,
        subGroup.name,
        'rejected',
        `Your sub-group request was not approved. Reason: ${reason}`
      )
      
      return { success: true }
    } catch (error) {
 console.error(' Error rejecting sub-group:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }
  
  /**
   * Activate a sub-group (Deprecated - now active immediately on approval)
   */
  static async activateSubGroup(subGroupId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await FirebaseDatabaseService.updateDocument('subgroups', subGroupId, {
        status: 'active',
        activatedAt: new Date()
      })
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Failed to activate' }
    }
  }
  
  /**
   * Check if user is a sub-group coordinator
   */
  static async isSubGroupCoordinator(userId: string): Promise<boolean> {
    try {
      const coordinated = await this.getCoordinatedSubGroups(userId)
      return coordinated.length > 0
    } catch (error) {
      console.error(' Error checking sub-group coordinator status:', error)
      return false
    }
  }
  
  /**
   * Get sub-groups where user is coordinator
   */
  static async getCoordinatedSubGroups(userId: string): Promise<SubGroup[]> {
    try {
      const subGroups = await FirebaseDatabaseService.getCollectionWhere(
        'subgroups',
        'coordinatorId',
        '==',
        userId
      )
      
      return subGroups
        .filter((sg: any) => sg.status === 'active')
        .map((doc: any) => ({
          ...doc,
          createdAt: doc.createdAt ? new Date(doc.createdAt) : new Date()
        })) as SubGroup[]
    } catch (error) {
      console.error(' Error getting coordinated sub-groups:', error)
      return []
    }
  }

  
  /**
   * Add member to sub-group
   */
  static async addMember(
    subGroupId: string, 
    memberId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const subGroup = await this.getSubGroup(subGroupId)
      if (!subGroup) {
        return { success: false, error: 'Sub-group not found' }
      }
      
      if (subGroup.memberIds.includes(memberId)) {
        return { success: false, error: 'User is already a member' }
      }
      
      const updatedMembers = [...subGroup.memberIds, memberId]
      await FirebaseDatabaseService.updateDocument('subgroups', subGroupId, {
        memberIds: updatedMembers
      })
      
      return { success: true }
    } catch (error) {
 console.error(' Error adding member:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }
  
  /**
   * Remove member from sub-group
   */
  static async removeMember(
    subGroupId: string, 
    memberId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const subGroup = await this.getSubGroup(subGroupId)
      if (!subGroup) {
        return { success: false, error: 'Sub-group not found' }
      }
      
      // Can't remove the coordinator
      if (subGroup.coordinatorId === memberId) {
        return { success: false, error: 'Cannot remove the sub-group coordinator' }
      }
      
      const updatedMembers = subGroup.memberIds.filter(id => id !== memberId)
      await FirebaseDatabaseService.updateDocument('subgroups', subGroupId, {
        memberIds: updatedMembers
      })
      
      return { success: true }
    } catch (error) {
 console.error(' Error removing member:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }
  
  /**
   * Update sub-group details
   */
  static async updateSubGroup(
    subGroupId: string,
    data: Partial<Pick<SubGroup, 'name' | 'description' | 'type'>>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await FirebaseDatabaseService.updateDocument('subgroups', subGroupId, {
        ...data,
        updatedAt: new Date()
      })
      return { success: true }
    } catch (error) {
 console.error(' Error updating sub-group:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }
  
  // NOTIFICATION HELPERS
  
  /**
   * Notify Zone Coordinator of new sub-group request
   */
  private static async notifyZoneCoordinator(
    zoneId: string,
    subGroupName: string,
    requesterName: string
  ): Promise<void> {
    try {
      // Create notification in notifications collection
      await FirebaseDatabaseService.addDocument('notifications', {
        zoneId,
        target_audience: 'all', // Or possibly a group targeting coordinators, but let's stick to standard fields
        category: 'admin',
        type: 'info',
        priority: 'medium',
        title: 'New Sub-Group Request',
        message: `${requesterName} has requested to create "${subGroupName}"`,
        created_at: new Date().toISOString()
      })
    } catch (error) {
 console.error(' Error notifying zone coordinator:', error)
    }
  }
  
  /**
   * Notify requester of approval/rejection
   */
  private static async notifyRequester(
    userId: string,
    subGroupName: string,
    status: 'approved' | 'rejected',
    message: string
  ): Promise<void> {
    try {
      await FirebaseDatabaseService.addDocument('notifications', {
        target_user_id: userId,
        target_audience: 'individual',
        category: 'subgroup',
        type: status === 'approved' ? 'success' : 'warning',
        priority: 'high',
        title: status === 'approved' ? 'Sub-Group Approved!' : 'Sub-Group Request Update',
        message,
        subGroupName,
        created_at: new Date().toISOString()
      })
    } catch (error) {
 console.error(' Error notifying requester:', error)
    }
  }
  
  /**
   * Get pending request count for zone (for badge display)
   */
  static async getPendingRequestCount(zoneId: string): Promise<number> {
    try {
      const pending = await this.getPendingRequests(zoneId)
      return pending.length
    } catch (error) {
 console.error(' Error getting pending count:', error)
      return 0
    }
  }
}
