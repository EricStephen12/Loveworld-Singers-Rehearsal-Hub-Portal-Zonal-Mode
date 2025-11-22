// User Roles Configuration

export type UserRole = 'super_admin' | 'boss' | 'zone_coordinator' | 'zone_member';

export interface RolePermissions {
  // Zone Management
  canManageZone: boolean;
  canViewZoneSettings: boolean;
  canUpgradeSubscription: boolean;
  canCancelSubscription: boolean;
  canViewPaymentHistory: boolean;
  
  // Member Management
  canAddMembers: boolean;
  canRemoveMembers: boolean;
  canViewMembers: boolean;
  canShareInviteLink: boolean;
  
  // Content Management
  canCreatePraiseNight: boolean;
  canEditPraiseNight: boolean;
  canDeletePraiseNight: boolean;
  canCreateSong: boolean;
  canEditSong: boolean;
  canDeleteSong: boolean;
  canCreateCategory: boolean;
  canEditCategory: boolean;
  canDeleteCategory: boolean;
  
  // Super Admin Only
  canViewAllZones: boolean;
  canAccessSuperAdmin: boolean;
  canAccessBoss: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  // Super Admin - Organization level (YOU)
  // Can VIEW all zones and ASSIGN zone coordinators
  super_admin: {
    // Zone Management - FULL ACCESS (for all zones)
    canManageZone: true,
    canViewZoneSettings: true,
    canUpgradeSubscription: true,
    canCancelSubscription: true,
    canViewPaymentHistory: true,
    
    // Member Management - FULL ACCESS (can assign coordinators)
    canAddMembers: true,
    canRemoveMembers: true,
    canViewMembers: true,
    canShareInviteLink: true,
    
    // Content Management - FULL ACCESS (for all zones)
    canCreatePraiseNight: true,
    canEditPraiseNight: true,
    canDeletePraiseNight: true,
    canCreateSong: true,
    canEditSong: true,
    canDeleteSong: true,
    canCreateCategory: true,
    canEditCategory: true,
    canDeleteCategory: true,
    
    // Super Admin Only
    canViewAllZones: true,
    canAccessSuperAdmin: true,
    canAccessBoss: false
  },
  
  // Boss - Can view everything across all zones but cannot edit super admin content
  // Has full visibility but limited editing rights
  boss: {
    // Zone Management - VIEW ONLY
    canManageZone: false,
    canViewZoneSettings: true,
    canUpgradeSubscription: false,
    canCancelSubscription: false,
    canViewPaymentHistory: true,
    
    // Member Management - VIEW ONLY
    canAddMembers: false,
    canRemoveMembers: false,
    canViewMembers: true,
    canShareInviteLink: false,
    
    // Content Management - VIEW ONLY
    canCreatePraiseNight: false,
    canEditPraiseNight: false,
    canDeletePraiseNight: false,
    canCreateSong: false,
    canEditSong: false,
    canDeleteSong: false,
    canCreateCategory: false,
    canEditCategory: false,
    canDeleteCategory: false,
    
    // Boss Access
    canViewAllZones: true,
    canAccessSuperAdmin: false,
    canAccessBoss: true
  },
  
  // Zone Coordinator - The person who pays for the zone
  // Has FULL ADMIN rights for THEIR zone only
  zone_coordinator: {
    // Zone Management - FULL ACCESS
    canManageZone: true,
    canViewZoneSettings: true,
    canUpgradeSubscription: true,
    canCancelSubscription: true,
    canViewPaymentHistory: true,
    
    // Member Management - FULL ACCESS
    canAddMembers: true,
    canRemoveMembers: true,
    canViewMembers: true,
    canShareInviteLink: true,
    
    // Content Management - FULL ACCESS
    canCreatePraiseNight: true,
    canEditPraiseNight: true,
    canDeletePraiseNight: true,
    canCreateSong: true,
    canEditSong: true,
    canDeleteSong: true,
    canCreateCategory: true,
    canEditCategory: true,
    canDeleteCategory: true,
    
    // Super Admin Only
    canViewAllZones: false,
    canAccessSuperAdmin: false,
    canAccessBoss: false
  },
  
  // Zone Member - Regular user
  // Can only VIEW content, no admin rights
  zone_member: {
    // Zone Management - NO ACCESS
    canManageZone: false,
    canViewZoneSettings: false,
    canUpgradeSubscription: false,
    canCancelSubscription: false,
    canViewPaymentHistory: false,
    
    // Member Management - NO ACCESS
    canAddMembers: false,
    canRemoveMembers: false,
    canViewMembers: true, // Can see other members
    canShareInviteLink: false,
    
    // Content Management - NO ACCESS
    canCreatePraiseNight: false,
    canEditPraiseNight: false,
    canDeletePraiseNight: false,
    canCreateSong: false,
    canEditSong: false,
    canDeleteSong: false,
    canCreateCategory: false,
    canEditCategory: false,
    canDeleteCategory: false,
    
    // Super Admin Only
    canViewAllZones: false,
    canAccessSuperAdmin: false,
    canAccessBoss: false
  }
};

// Helper function to check permission
export function hasPermission(
  role: UserRole,
  permission: keyof RolePermissions
): boolean {
  return ROLE_PERMISSIONS[role][permission];
}

// Helper function to get user role in a zone
export function getUserRoleInZone(
  userId: string,
  zoneId: string,
  zoneMembership: any
): UserRole {
  // Check if super admin
  if (zoneMembership?.isSuperAdmin) {
    return 'super_admin';
  }
  
  // Check if zone coordinator (the one who created/pays for the zone)
  if (zoneMembership?.role === 'coordinator') {
    return 'zone_coordinator';
  }
  
  // Default to member
  return 'zone_member';
}
