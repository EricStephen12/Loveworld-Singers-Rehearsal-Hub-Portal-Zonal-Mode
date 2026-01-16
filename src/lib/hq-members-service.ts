// HQ Members Service
// Manages membership for HQ groups (zone-001 to zone-005)
// Separate from zone_members but uses same authentication

import { FirebaseDatabaseService } from './firebase-database'
import { isHQGroup } from '@/config/zones'

export interface HQMember {
  id: string
  userId: string
  userEmail: string
  userName: string
  hqGroupId: string // zone-001, zone-002, etc.
  role: 'coordinator' | 'member'
  joinedAt: Date
  invitedBy?: string
  status: 'active' | 'inactive'
}

export class HQMembersService {
  
  /**
   * Add member to HQ group
   */
  static async addMember(data: {
    userId: string
    userEmail: string
    userName: string
    hqGroupId: string
    role?: 'coordinator' | 'member'
    invitedBy?: string
  }) {
    try {
      // Validate it's an HQ group
      if (!isHQGroup(data.hqGroupId)) {
        console.error('❌ Not an HQ group:', data.hqGroupId)
        return { success: false, error: 'Not an HQ group' }
      }
      
      
      const memberData = {
        userId: data.userId,
        userEmail: data.userEmail,
        userName: data.userName,
        hqGroupId: data.hqGroupId,
        role: data.role || 'member',
        joinedAt: new Date(),
        invitedBy: data.invitedBy || null,
        status: 'active'
      }
      
            const existing = await this.getMemberByUserId(data.userId, data.hqGroupId)
      if (existing) {
        return { success: false, error: 'Member already exists' }
      }
      
      // Add to hq_members collection
      const result = await FirebaseDatabaseService.createDocument(
        'hq_members',
        `${data.userId}_${data.hqGroupId}`,
        memberData
      )
      
      return { success: true, member: result }
    } catch (error) {
      console.error('❌ Error adding HQ member:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
  
  /**
   * Get member by user ID and HQ group
   */
  static async getMemberByUserId(userId: string, hqGroupId: string) {
    try {
      const members = await FirebaseDatabaseService.getCollectionWhere(
        'hq_members',
        'userId',
        '==',
        userId
      )
      
      return members.find((m: any) => m.hqGroupId === hqGroupId) || null
    } catch (error) {
      console.error('❌ Error getting HQ member:', error)
      return null
    }
  }
  
  /**
   * Get all HQ groups for a user
   */
  static async getUserHQGroups(userId: string) {
    try {
      
      const members = await FirebaseDatabaseService.getCollectionWhere(
        'hq_members',
        'userId',
        '==',
        userId
      )
      
      return members
    } catch (error) {
      console.error('❌ Error getting user HQ groups:', error)
      return []
    }
  }
  
  /**
   * Get all members of an HQ group
   */
  static async getHQGroupMembers(hqGroupId: string) {
    try {
      if (!isHQGroup(hqGroupId)) {
        console.error('❌ Not an HQ group:', hqGroupId)
        return []
      }
      
      
      const members = await FirebaseDatabaseService.getCollectionWhere(
        'hq_members',
        'hqGroupId',
        '==',
        hqGroupId
      )
      
      return members
    } catch (error) {
      console.error('❌ Error getting HQ group members:', error)
      return []
    }
  }
  
  /**
   * Update member role
   */
  static async updateMemberRole(userId: string, hqGroupId: string, role: 'coordinator' | 'member') {
    try {
      const docId = `${userId}_${hqGroupId}`
      
      await FirebaseDatabaseService.updateDocument('hq_members', docId, {
        role,
        updatedAt: new Date()
      })
      
      return { success: true }
    } catch (error) {
      console.error('❌ Error updating HQ member role:', error)
      return { success: false }
    }
  }
  
  /**
   * Remove member from HQ group
   */
  static async removeMember(userId: string, hqGroupId: string) {
    try {
      const docId = `${userId}_${hqGroupId}`
      
      await FirebaseDatabaseService.deleteDocument('hq_members', docId)
      
      return { success: true }
    } catch (error) {
      console.error('❌ Error removing HQ member:', error)
      return { success: false }
    }
  }
  
  /**
   * Check if user is HQ member
   */
  static async isHQMember(userId: string): Promise<boolean> {
    try {
      const hqGroups = await this.getUserHQGroups(userId)
      return hqGroups.length > 0
    } catch (error) {
      console.error('❌ Error checking HQ membership:', error)
      return false
    }
  }
  
  /**
   * Check if user is HQ coordinator
   */
  static async isHQCoordinator(userId: string, hqGroupId: string): Promise<boolean> {
    try {
      const member = await this.getMemberByUserId(userId, hqGroupId) as any
      return member?.role === 'coordinator'
    } catch (error) {
      console.error('❌ Error checking HQ coordinator:', error)
      return false
    }
  }
  
  /**
   * Get HQ member count for a group
   */
  static async getHQGroupMemberCount(hqGroupId: string): Promise<number> {
    try {
      const members = await this.getHQGroupMembers(hqGroupId)
      return members.length
    } catch (error) {
      console.error('❌ Error getting HQ member count:', error)
      return 0
    }
  }
  
  /**
   * Activate/Deactivate member
   */
  static async updateMemberStatus(userId: string, hqGroupId: string, status: 'active' | 'inactive') {
    try {
      const docId = `${userId}_${hqGroupId}`
      
      await FirebaseDatabaseService.updateDocument('hq_members', docId, {
        status,
        updatedAt: new Date()
      })
      
      return { success: true }
    } catch (error) {
      console.error('❌ Error updating HQ member status:', error)
      return { success: false }
    }
  }
}
