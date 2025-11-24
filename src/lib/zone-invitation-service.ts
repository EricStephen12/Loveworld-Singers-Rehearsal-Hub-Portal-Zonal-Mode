// @ts-nocheck
// Zone Invitation Service - Simplified with unique codes per zone

import { FirebaseDatabaseService } from './firebase-database'
import { HQMembersService } from './hq-members-service'
import { HQInvitationService } from './hq-invitation-service'
import { ZONES, getZoneByInvitationCode, isHQGroup } from '@/config/zones'

export class ZoneInvitationService {
  
  /**
   * Join a zone using invitation code
   * This is called when user signs up with a zone link
   * Routes to HQ or Zone collection based on zone type
   */
  static async joinZoneWithCode(
    userId: string,
    invitationCode: string,
    userEmail: string,
    userName: string,
    role: 'member' | 'coordinator' | 'boss' = 'member'
  ) {
    try {
      console.log('🔍 Validating invitation code:', invitationCode)
      
      // Find zone by invitation code
      const zone = getZoneByInvitationCode(invitationCode)
      
      if (!zone) {
        return {
          success: false,
          error: 'Invalid invitation code. Please check and try again.'
        }
      }
      
      console.log('✅ Valid zone found:', zone.name)
      
      // ⭐ CHECK IF HQ GROUP - Route to HQ service
      if (isHQGroup(zone.id)) {
        console.log('🏢 This is an HQ group - routing to HQ service')
        return await HQInvitationService.joinHQGroup(
          invitationCode,
          userId,
          userEmail,
          userName
        )
      }
      
      console.log('📍 This is a regular zone - continuing with zone service')
      
      // Check if user is already a member
      const existingMembers = await FirebaseDatabaseService.getCollectionWhere(
        'zone_members',
        'userId',
        '==',
        userId
      )
      
      const alreadyMember = existingMembers.some((m: any) => m.zoneId === zone.id)
      
      if (alreadyMember) {
        return {
          success: true,
          alreadyMember: true,
          zoneName: zone.name,
          message: `You are already a member of ${zone.name}`
        }
      }
      
      // Get zone data to check member count
      const zoneData = await FirebaseDatabaseService.getDocument('zones', zone.id)
      
      // If zone doesn't exist in Firebase, create it
      if (!zoneData) {
        console.log('📝 Creating zone in Firebase:', zone.name)
        await FirebaseDatabaseService.createDocument('zones', zone.id, {
          id: zone.id,
          name: zone.name,
          slug: zone.slug,
          region: zone.region,
          invitationCode: zone.invitationCode,
          themeColor: zone.themeColor,
          coordinatorId: userId, // First user becomes coordinator
          memberCount: 0,
          maxMembers: 20, // Free tier default
          subscriptionTier: 'free',
          subscriptionStatus: 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        })
      }
      
      const currentMemberCount = zoneData?.memberCount || 0
      const maxMembers = zoneData?.maxMembers || 20
      const subscriptionTier = zoneData?.subscriptionTier || 'free'
      
      // Check member limit
      if (currentMemberCount >= maxMembers) {
        const upgradeMessage = subscriptionTier === 'free' 
          ? 'This zone is on the Free plan (20 members max). The coordinator needs to upgrade to Premium (500 members) to add more members.'
          : 'This zone has reached its maximum member limit. Please contact the zone coordinator.'
        
        return {
          success: false,
          error: upgradeMessage
        }
      }
      
      // Determine role: use provided role, or first member becomes coordinator
      const isFirstMember = currentMemberCount === 0
      const finalRole = role || (isFirstMember ? 'coordinator' : 'member')
      
      console.log(`👤 Adding user as ${finalRole}`)
      
      // Add user to zone
      const memberId = `mem_${Date.now()}_${userId}`
      await FirebaseDatabaseService.createDocument('zone_members', memberId, {
        id: memberId,
        zoneId: zone.id,
        userId,
        userEmail,
        userName,
        role: finalRole,
        joinedAt: new Date(),
        status: 'active'
      })
      
      // If coordinator, update zone with coordinator ID
      if (finalRole === 'coordinator') {
        await FirebaseDatabaseService.updateDocument('zones', zone.id, {
          coordinatorId: userId,
          coordinatorName: userName,
          coordinatorEmail: userEmail,
          updatedAt: new Date()
        })
        console.log('👔 User set as Zone Coordinator')
      }
      
      // Update zone member count
      await FirebaseDatabaseService.updateDocument('zones', zone.id, {
        memberCount: currentMemberCount + 1,
        updatedAt: new Date()
      })
      
      console.log('✅ User added to zone successfully')
      
      return {
        success: true,
        zoneName: zone.name,
        zoneId: zone.id,
        message: `Welcome to ${zone.name}!`
      }
      
    } catch (error) {
      console.error('❌ Error joining zone:', error)
      return {
        success: false,
        error: 'Failed to join zone. Please try again.'
      }
    }
  }
  
  /**
   * Get zone signup link
   */
  static getZoneSignupLink(invitationCode: string): string {
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    return `${baseUrl}/auth?zone=${invitationCode}`
  }
  
  /**
   * Get all zones (for super admin)
   * Checks both hq_members and zone_members collections
   */
  static async getAllZonesWithStats() {
    try {
      const zonesWithStats = await Promise.all(
        ZONES.map(async (zone) => {
          const zoneData = await FirebaseDatabaseService.getDocument('zones', zone.id)
          
          // Check correct collection based on zone type
          let members = []
          if (isHQGroup(zone.id)) {
            // HQ groups use hq_members collection
            members = await HQMembersService.getHQGroupMembers(zone.id)
          } else {
            // Regular zones use zone_members collection
            members = await FirebaseDatabaseService.getCollectionWhere(
              'zone_members',
              'zoneId',
              '==',
              zone.id
            )
          }
          
          return {
            ...zone,
            memberCount: members.length,
            maxMembers: zoneData?.maxMembers || (isHQGroup(zone.id) ? 999999 : 20), // HQ has unlimited
            subscriptionTier: isHQGroup(zone.id) ? 'unlimited' : (zoneData?.subscriptionTier || 'free'),
            subscriptionStatus: isHQGroup(zone.id) ? 'active' : (zoneData?.subscriptionStatus || 'active'),
            signupLink: this.getZoneSignupLink(zone.invitationCode),
            isHQGroup: isHQGroup(zone.id)
          }
        })
      )
      
      return zonesWithStats
    } catch (error) {
      console.error('❌ Error getting zones with stats:', error)
      return []
    }
  }
  
  /**
   * Get zone members (for coordinators and super admin)
   * Checks correct collection based on zone type
   */
  static async getZoneMembers(zoneId: string) {
    try {
      let members = []
      
      // Check correct collection based on zone type
      if (isHQGroup(zoneId)) {
        // HQ groups use hq_members collection
        members = await HQMembersService.getHQGroupMembers(zoneId)
      } else {
        // Regular zones use zone_members collection
        members = await FirebaseDatabaseService.getCollectionWhere(
          'zone_members',
          'zoneId',
          '==',
          zoneId
        )
      }
      
      // Get user profiles for each member
      const membersWithProfiles = await Promise.all(
        members.map(async (member: any) => {
          const profile = await FirebaseDatabaseService.getDocument('profiles', member.userId)
          return {
            ...member,
            profile
          }
        })
      )
      
      return membersWithProfiles
    } catch (error) {
      console.error('❌ Error getting zone members:', error)
      return []
    }
  }
  
  /**
   * Remove member from zone (for coordinators and super admin)
   * Removes from correct collection based on zone type
   */
  static async removeMember(memberId: string, zoneId: string) {
    try {
      // Check correct collection based on zone type
      if (isHQGroup(zoneId)) {
        // HQ groups use hq_members collection
        // memberId format for HQ: userId_hqGroupId
        const parts = memberId.split('_')
        const userId = parts.slice(0, -1).join('_') // Handle userId with underscores
        await HQMembersService.removeMember(userId, zoneId)
      } else {
        // Regular zones use zone_members collection
        await FirebaseDatabaseService.deleteDocument('zone_members', memberId)
        
        // Update zone member count
        const zoneData = await FirebaseDatabaseService.getDocument('zones', zoneId)
        if (zoneData) {
          await FirebaseDatabaseService.updateDocument('zones', zoneId, {
            memberCount: Math.max(0, (zoneData.memberCount || 1) - 1),
            updatedAt: new Date()
          })
        }
      }
      
      return { success: true }
    } catch (error) {
      console.error('❌ Error removing member:', error)
      return { success: false }
    }
  }
}
