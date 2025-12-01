// 87 Zones Configuration for LWSRH Multi-Zone Platform
// 
// ZONE ARCHITECTURE:
// - 5 HQ Groups (zone-001 to zone-005): Purple color, use Firebase database (no zone filtering)
//   These are managed by Central Admin (Boss) and share unfiltered data
// 
// - 81 Regional Zones (zone-006 to zone-086): Various colors, use zone-filtered data
//   Each zone has isolated data filtered by zone_id
// 
// - 1 Central Admin Zone (zone-boss): Red color, Boss role with full access
//   Can view and manage ALL zones + HQ groups Firebase database

export interface Zone {
  id: string
  name: string
  slug: string
  region: string
  invitationCode: string
  themeColor: string
}

export const ZONES: Zone[] = [
  // ========================================
  // HQ GROUPS (5 core + 3 senior zones) - Managed by Central Admin
  // Purple color (#9333EA)
  // Use Firebase database WITHOUT zone filtering
  // ========================================
  { id: 'zone-001', name: 'Your Loveworld Singers', slug: 'your-loveworld-singers', region: 'Headquarters', invitationCode: 'ZONE001', themeColor: '#9333EA' },
  { id: 'zone-002', name: 'Loveworld Singers 24 Worship Band', slug: 'lws-24-worship', region: 'Headquarters', invitationCode: 'ZONE002', themeColor: '#9333EA' },
  { id: 'zone-003', name: 'Loveworld Singers Children Choir', slug: 'lws-children', region: 'Headquarters', invitationCode: 'ZONE003', themeColor: '#9333EA' },
  { id: 'zone-004', name: 'Loveworld Singers Teens Choir', slug: 'lws-teens', region: 'Headquarters', invitationCode: 'ZONE004', themeColor: '#9333EA' },
  { id: 'zone-005', name: 'Presidential Mass Choir', slug: 'presidential-mass-choir', region: 'Headquarters', invitationCode: 'ZONE005', themeColor: '#9333EA' },

  // Senior HQ zones (own zones but treated as HQ groups)
  { id: 'zone-president', name: 'The President Zone', slug: 'president-zone', region: 'Headquarters', invitationCode: 'ZONEPRES', themeColor: '#9333EA' },
  { id: 'zone-director', name: 'The Director Zone', slug: 'director-zone', region: 'Headquarters', invitationCode: 'ZONEDIR', themeColor: '#9333EA' },
  { id: 'zone-oftp', name: 'OFTP Pastors Zone', slug: 'oftp-zone', region: 'Headquarters', invitationCode: 'ZONEOFTP', themeColor: '#9333EA' },
  
  // South Africa (7)
  { id: 'zone-006', name: 'Loveworld Singers SA Zone 1', slug: 'lws-sa-zone-1', region: 'South Africa', invitationCode: 'ZONE006', themeColor: '#3B82F6' },
  { id: 'zone-007', name: 'Loveworld Singers SA Zone 2', slug: 'lws-sa-zone-2', region: 'South Africa', invitationCode: 'ZONE007', themeColor: '#3B82F6' },
  { id: 'zone-008', name: 'Loveworld Singers SA Zone 3', slug: 'lws-sa-zone-3', region: 'South Africa', invitationCode: 'ZONE008', themeColor: '#3B82F6' },
  { id: 'zone-009', name: 'Loveworld Singers SA Zone 5', slug: 'lws-sa-zone-5', region: 'South Africa', invitationCode: 'ZONE009', themeColor: '#3B82F6' },
  { id: 'zone-010', name: 'Loveworld Singers Durban Zone', slug: 'lws-durban', region: 'South Africa', invitationCode: 'ZONE010', themeColor: '#3B82F6' },
  { id: 'zone-011', name: 'Loveworld Singers Cape Town Zone 1', slug: 'lws-cape-town-1', region: 'South Africa', invitationCode: 'ZONE011', themeColor: '#3B82F6' },
  { id: 'zone-012', name: 'Loveworld Singers Cape Town Zone 2', slug: 'lws-cape-town-2', region: 'South Africa', invitationCode: 'ZONE012', themeColor: '#3B82F6' },
  
  // India, Kenya, Ghana (3)
  { id: 'zone-013', name: 'Loveworld Singers India Zone', slug: 'lws-india', region: 'India', invitationCode: 'ZONE013', themeColor: '#F59E0B' },
  { id: 'zone-014', name: 'Loveworld Singers Kenya Zone', slug: 'lws-kenya', region: 'Kenya', invitationCode: 'ZONE014', themeColor: '#EF4444' },
  { id: 'zone-015', name: 'Loveworld Singers Accra Ghana Zone', slug: 'lws-accra', region: 'Ghana', invitationCode: 'ZONE015', themeColor: '#8B5CF6' },
  
  // USA (4)
  { id: 'zone-016', name: 'Loveworld Singers USA Region 1 Zone 1', slug: 'lws-usa-r1-z1', region: 'USA', invitationCode: 'ZONE016', themeColor: '#EC4899' },
  { id: 'zone-017', name: 'Loveworld Singers USA Region 1 Zone 2', slug: 'lws-usa-r1-z2', region: 'USA', invitationCode: 'ZONE017', themeColor: '#EC4899' },
  { id: 'zone-018', name: 'Loveworld Singers USA Region 2', slug: 'lws-usa-r2', region: 'USA', invitationCode: 'ZONE018', themeColor: '#EC4899' },
  { id: 'zone-019', name: 'Loveworld Singers USA Region 3', slug: 'lws-usa-r3', region: 'USA', invitationCode: 'ZONE019', themeColor: '#EC4899' },
  
  // Canada (3)
  { id: 'zone-020', name: 'Loveworld Singers Ottawa Zone Canada', slug: 'lws-ottawa', region: 'Canada', invitationCode: 'ZONE020', themeColor: '#14B8A6' },
  { id: 'zone-021', name: 'Loveworld Singers Toronto Canada Zone', slug: 'lws-toronto', region: 'Canada', invitationCode: 'ZONE021', themeColor: '#14B8A6' },
  { id: 'zone-022', name: 'Loveworld Singers Quebec Zone', slug: 'lws-quebec', region: 'Canada', invitationCode: 'ZONE022', themeColor: '#14B8A6' },
  
  // United Kingdom (7)
  { id: 'zone-023', name: 'Loveworld Singers UK Zone 1 DSP', slug: 'lws-uk-z1-dsp', region: 'United Kingdom', invitationCode: 'ZONE023', themeColor: '#6366F1' },
  { id: 'zone-024', name: 'Loveworld Singers UK Zone 2 DSP', slug: 'lws-uk-z2-dsp', region: 'United Kingdom', invitationCode: 'ZONE024', themeColor: '#6366F1' },
  { id: 'zone-025', name: 'Loveworld Singers UK Zone 3 DSP', slug: 'lws-uk-z3-dsp', region: 'United Kingdom', invitationCode: 'ZONE025', themeColor: '#6366F1' },
  { id: 'zone-026', name: 'Loveworld Singers UK Zone 4 DSP', slug: 'lws-uk-z4-dsp', region: 'United Kingdom', invitationCode: 'ZONE026', themeColor: '#6366F1' },
  { id: 'zone-027', name: 'Loveworld Singers UK Region 2 Zone 1', slug: 'lws-uk-r2-z1', region: 'United Kingdom', invitationCode: 'ZONE027', themeColor: '#6366F1' },
  { id: 'zone-028', name: 'Loveworld Singers UK Region 2 Zone 3', slug: 'lws-uk-r2-z3', region: 'United Kingdom', invitationCode: 'ZONE028', themeColor: '#6366F1' },
  { id: 'zone-029', name: 'Loveworld Singers UK Region 2 Zone 4', slug: 'lws-uk-r2-z4', region: 'United Kingdom', invitationCode: 'ZONE029', themeColor: '#6366F1' },
  
  // Western Europe (4)
  { id: 'zone-030', name: 'Loveworld Singers Western Europe Zone 1', slug: 'lws-we-z1', region: 'Western Europe', invitationCode: 'ZONE030', themeColor: '#F97316' },
  { id: 'zone-031', name: 'Loveworld Singers Western Europe Zone 2', slug: 'lws-we-z2', region: 'Western Europe', invitationCode: 'ZONE031', themeColor: '#F97316' },
  { id: 'zone-032', name: 'Loveworld Singers Western Europe Zone 3', slug: 'lws-we-z3', region: 'Western Europe', invitationCode: 'ZONE032', themeColor: '#F97316' },
  { id: 'zone-033', name: 'Loveworld Singers Western Europe Zone 4', slug: 'lws-we-z4', region: 'Western Europe', invitationCode: 'ZONE033', themeColor: '#F97316' },
  
  // Eastern Europe, East Asia, Middle East, Australia, South America (5)
  { id: 'zone-034', name: 'Loveworld Singers Eastern Europe', slug: 'lws-eastern-europe', region: 'Eastern Europe', invitationCode: 'ZONE034', themeColor: '#84CC16' },
  { id: 'zone-035', name: 'Loveworld Singers East Asia Region', slug: 'lws-east-asia', region: 'East Asia', invitationCode: 'ZONE035', themeColor: '#06B6D4' },
  { id: 'zone-036', name: 'Loveworld Singers Middle East and Asia', slug: 'lws-middle-east-asia', region: 'Middle East', invitationCode: 'ZONE036', themeColor: '#A855F7' },
  { id: 'zone-037', name: 'Loveworld Singers Australia', slug: 'lws-australia', region: 'Australia', invitationCode: 'ZONE037', themeColor: '#22D3EE' },
  { id: 'zone-038', name: 'Loveworld Singers South America NZ Pacific', slug: 'lws-sa-pacific', region: 'South America', invitationCode: 'ZONE038', themeColor: '#FB923C' },
  
  // Nigeria - Ministry Centres (5)
  { id: 'zone-039', name: 'Loveworld Singers Ministry Centre Abuja', slug: 'lws-mc-abuja', region: 'Nigeria', invitationCode: 'ZONE039', themeColor: '#10B981' },
  { id: 'zone-040', name: 'Loveworld Singers Ministry Centre Calabar', slug: 'lws-mc-calabar', region: 'Nigeria', invitationCode: 'ZONE040', themeColor: '#10B981' },
  { id: 'zone-041', name: 'Loveworld Singers Ministry Centre Abeokuta', slug: 'lws-mc-abeokuta', region: 'Nigeria', invitationCode: 'ZONE041', themeColor: '#10B981' },
  { id: 'zone-042', name: 'Loveworld Singers Ministry Centre Ibadan', slug: 'lws-mc-ibadan', region: 'Nigeria', invitationCode: 'ZONE042', themeColor: '#10B981' },
  { id: 'zone-043', name: 'Loveworld Singers Warri Ministry Centre', slug: 'lws-mc-warri', region: 'Nigeria', invitationCode: 'ZONE043', themeColor: '#10B981' },
  
  // Nigeria - Lagos Zones (9)
  { id: 'zone-044', name: 'Loveworld Singers Lagos Zone 1', slug: 'lws-lagos-z1', region: 'Nigeria', invitationCode: 'ZONE044', themeColor: '#10B981' },
  { id: 'zone-045', name: 'Loveworld Singers Lagos Zone 2', slug: 'lws-lagos-z2', region: 'Nigeria', invitationCode: 'ZONE045', themeColor: '#10B981' },
  { id: 'zone-046', name: 'Loveworld Singers Lagos Zone 3', slug: 'lws-lagos-z3', region: 'Nigeria', invitationCode: 'ZONE046', themeColor: '#10B981' },
  { id: 'zone-047', name: 'Loveworld Singers Lagos Zone 4', slug: 'lws-lagos-z4', region: 'Nigeria', invitationCode: 'ZONE047', themeColor: '#10B981' },
  { id: 'zone-048', name: 'Loveworld Singers Lagos Zone 5', slug: 'lws-lagos-z5', region: 'Nigeria', invitationCode: 'ZONE048', themeColor: '#10B981' },
  { id: 'zone-049', name: 'Loveworld Singers Lagos Zone 6', slug: 'lws-lagos-z6', region: 'Nigeria', invitationCode: 'ZONE049', themeColor: '#10B981' },
  { id: 'zone-050', name: 'Loveworld Singers Lagos Sub Zone A', slug: 'lws-lagos-sza', region: 'Nigeria', invitationCode: 'ZONE050', themeColor: '#10B981' },
  { id: 'zone-051', name: 'Loveworld Singers Lagos Sub Zone B', slug: 'lws-lagos-szb', region: 'Nigeria', invitationCode: 'ZONE051', themeColor: '#10B981' },
  { id: 'zone-052', name: 'Loveworld Singers Lagos Sub Zone C', slug: 'lws-lagos-szc', region: 'Nigeria', invitationCode: 'ZONE052', themeColor: '#10B981' },
  
  // Nigeria - Regional Zones (8)
  { id: 'zone-053', name: 'Loveworld Singers Abuja Zone', slug: 'lws-abuja', region: 'Nigeria', invitationCode: 'ZONE053', themeColor: '#10B981' },
  { id: 'zone-054', name: 'Loveworld Singers Aba Zone', slug: 'lws-aba', region: 'Nigeria', invitationCode: 'ZONE054', themeColor: '#10B981' },
  { id: 'zone-055', name: 'Loveworld Singers Ibadan Zone 1', slug: 'lws-ibadan-z1', region: 'Nigeria', invitationCode: 'ZONE055', themeColor: '#10B981' },
  { id: 'zone-056', name: 'Loveworld Singers Onitsha Zone', slug: 'lws-onitsha', region: 'Nigeria', invitationCode: 'ZONE056', themeColor: '#10B981' },
  { id: 'zone-057', name: 'Loveworld Singers Port Harcourt Zone 1', slug: 'lws-ph-z1', region: 'Nigeria', invitationCode: 'ZONE057', themeColor: '#10B981' },
  { id: 'zone-058', name: 'Loveworld Singers Port Harcourt Zone 2', slug: 'lws-ph-z2', region: 'Nigeria', invitationCode: 'ZONE058', themeColor: '#10B981' },
  { id: 'zone-059', name: 'Loveworld Singers Port Harcourt Zone 3', slug: 'lws-ph-z3', region: 'Nigeria', invitationCode: 'ZONE059', themeColor: '#10B981' },
  { id: 'zone-060', name: 'Loveworld Singers Warri DSC Sub Zone', slug: 'lws-warri-dsc', region: 'Nigeria', invitationCode: 'ZONE060', themeColor: '#10B981' },
  
  // Nigeria - North Central (2)
  { id: 'zone-061', name: 'Loveworld Singers Nigeria North Central Zone 1', slug: 'lws-ng-nc-z1', region: 'Nigeria', invitationCode: 'ZONE061', themeColor: '#10B981' },
  { id: 'zone-062', name: 'Loveworld Singers Nigeria North Central Zone 2', slug: 'lws-ng-nc-z2', region: 'Nigeria', invitationCode: 'ZONE062', themeColor: '#10B981' },
  
  // Nigeria - North West (2)
  { id: 'zone-063', name: 'Loveworld Singers Nigeria North West Zone 1', slug: 'lws-ng-nw-z1', region: 'Nigeria', invitationCode: 'ZONE063', themeColor: '#10B981' },
  { id: 'zone-064', name: 'Loveworld Singers Nigeria North West Zone 2', slug: 'lws-ng-nw-z2', region: 'Nigeria', invitationCode: 'ZONE064', themeColor: '#10B981' },
  
  // Nigeria - North East (1)
  { id: 'zone-065', name: 'Loveworld Singers Nigeria North East Zone 1', slug: 'lws-ng-ne-z1', region: 'Nigeria', invitationCode: 'ZONE065', themeColor: '#10B981' },
  
  // Nigeria - South West (4)
  { id: 'zone-066', name: 'Loveworld Singers Nigeria South West Zone 2', slug: 'lws-ng-sw-z2', region: 'Nigeria', invitationCode: 'ZONE066', themeColor: '#10B981' },
  { id: 'zone-067', name: 'Loveworld Singers Nigeria South West Zone 3', slug: 'lws-ng-sw-z3', region: 'Nigeria', invitationCode: 'ZONE067', themeColor: '#10B981' },
  { id: 'zone-068', name: 'Loveworld Singers Nigeria South West Zone 4', slug: 'lws-ng-sw-z4', region: 'Nigeria', invitationCode: 'ZONE068', themeColor: '#10B981' },
  { id: 'zone-069', name: 'Loveworld Singers South West Zone 5', slug: 'lws-ng-sw-z5', region: 'Nigeria', invitationCode: 'ZONE069', themeColor: '#10B981' },
  
  // Nigeria - South South (3)
  { id: 'zone-070', name: 'Loveworld Singers Nigeria South South Zone 1', slug: 'lws-ng-ss-z1', region: 'Nigeria', invitationCode: 'ZONE070', themeColor: '#10B981' },
  { id: 'zone-071', name: 'Loveworld Singers Nigeria South South Zone 2', slug: 'lws-ng-ss-z2', region: 'Nigeria', invitationCode: 'ZONE071', themeColor: '#10B981' },
  { id: 'zone-072', name: 'Loveworld Singers Nigeria South South Zone 3', slug: 'lws-ng-ss-z3', region: 'Nigeria', invitationCode: 'ZONE072', themeColor: '#10B981' },
  
  // Nigeria - South East (2)
  { id: 'zone-073', name: 'Loveworld Singers Nigeria South East Zone 1', slug: 'lws-ng-se-z1', region: 'Nigeria', invitationCode: 'ZONE073', themeColor: '#10B981' },
  { id: 'zone-074', name: 'Loveworld Singers Nigeria South East Zone 3', slug: 'lws-ng-se-z3', region: 'Nigeria', invitationCode: 'ZONE074', themeColor: '#10B981' },
  
  // Nigeria - Benin & Edo (4)
  { id: 'zone-075', name: 'Loveworld Singers Benin Zone 1', slug: 'lws-benin-z1', region: 'Nigeria', invitationCode: 'ZONE075', themeColor: '#10B981' },
  { id: 'zone-076', name: 'Loveworld Singers Benin Zone 2', slug: 'lws-benin-z2', region: 'Nigeria', invitationCode: 'ZONE076', themeColor: '#10B981' },
  { id: 'zone-077', name: 'Loveworld Singers Edo North Zone', slug: 'lws-edo-north', region: 'Nigeria', invitationCode: 'ZONE077', themeColor: '#10B981' },
  { id: 'zone-078', name: 'Loveworld Singers Midwest Zone', slug: 'lws-midwest', region: 'Nigeria', invitationCode: 'ZONE078', themeColor: '#10B981' },
  
  // East West Central Africa (6)
  { id: 'zone-079', name: 'Loveworld Singers EWCA Zone 1 Ethiopia', slug: 'lws-ewca-z1-ethiopia', region: 'EWCA', invitationCode: 'ZONE079', themeColor: '#DC2626' },
  { id: 'zone-080', name: 'Loveworld Singers EWCA Zone 2', slug: 'lws-ewca-z2', region: 'EWCA', invitationCode: 'ZONE080', themeColor: '#DC2626' },
  { id: 'zone-081', name: 'Loveworld Singers EWCA Zone 3', slug: 'lws-ewca-z3', region: 'EWCA', invitationCode: 'ZONE081', themeColor: '#DC2626' },
  { id: 'zone-082', name: 'Loveworld Singers EWCA Zone 4', slug: 'lws-ewca-z4', region: 'EWCA', invitationCode: 'ZONE082', themeColor: '#DC2626' },
  { id: 'zone-083', name: 'Loveworld Singers EWCA Zone 5', slug: 'lws-ewca-z5', region: 'EWCA', invitationCode: 'ZONE083', themeColor: '#DC2626' },
  { id: 'zone-084', name: 'Loveworld Singers EWCA Zone 6', slug: 'lws-ewca-z6', region: 'EWCA', invitationCode: 'ZONE084', themeColor: '#DC2626' },
  
  // Chad (1)
  { id: 'zone-085', name: 'Loveworld Singers Chad Zone', slug: 'lws-chad', region: 'Chad', invitationCode: 'ZONE085', themeColor: '#059669' },
  
  // Special Networks (2)
  { id: 'zone-086', name: 'Loveworld Singers CELVZ', slug: 'lws-celvz', region: 'Special', invitationCode: 'ZONE086', themeColor: '#7C3AED' },
  { id: 'zone-087', name: 'Loveworld Singers LGN', slug: 'lws-lgn', region: 'Special', invitationCode: 'ZONE087', themeColor: '#7C3AED' },
  
  // Central Admin Zone (Special Admin Zone)
  { id: 'zone-boss', name: 'Central Admin', slug: 'central-admin', region: 'Admin', invitationCode: 'BOSS101', themeColor: '#DC2626' },
]

export function getZoneByInvitationCode(code: string): Zone | undefined {
  // Check if it's a coordinator code (starts with ZNL)
  if (code.startsWith('ZNL')) {
    const memberCode = code.substring(3) // Remove ZNL prefix
    return ZONES.find(zone => zone.invitationCode === memberCode)
  }
  
  // Regular member code (including BOSS101 which now has a zone)
  return ZONES.find(zone => zone.invitationCode === code)
}

export function isCoordinatorCode(code: string): boolean {
  return code.startsWith('ZNL')
}

export function isBossCode(code: string): boolean {
  return code === 'BOSS101'
}

export function getZoneRole(code: string): 'coordinator' | 'member' | 'boss' {
  if (code === 'BOSS101') return 'boss'
  return code.startsWith('ZNL') ? 'coordinator' : 'member'
}

export function getZoneBySlug(slug: string): Zone | undefined {
  return ZONES.find(zone => zone.slug === slug)
}

export function getZoneById(id: string): Zone | undefined {
  return ZONES.find(zone => zone.id === id)
}

export const SUPER_ADMIN_EMAIL = 'superadmin@lwsrh.com'
export const SUPER_ADMIN_UID = 'super-admin-bypass' // For bypass login

export function isSuperAdmin(email: string | null | undefined, uid: string | null | undefined): boolean {
  if (!email && !uid) return false
  if (email && email === SUPER_ADMIN_EMAIL) return true
  if (uid && SUPER_ADMIN_UID && uid === SUPER_ADMIN_UID) return true
  return false
}

export function isBossZone(zoneId: string | undefined): boolean {
  return zoneId === 'zone-boss'
}

export const BOSS_ZONE_ID = 'zone-boss'

// ========================================
// HQ GROUPS CONFIGURATION
// ========================================
// These HQ groups use Firebase database WITHOUT zone filtering
// They are managed by Central Admin (Boss) who can access unfiltered data
export const HQ_GROUP_IDS = [
  'zone-001',
  'zone-002',
  'zone-003',
  'zone-004',
  'zone-005',
  // Senior HQ zones (have their own zones but behave like HQ groups)
  'zone-president',
  'zone-director',
  'zone-oftp',
]

// Check if a zone is an HQ group (uses unfiltered Firebase database)
// Also includes zone-boss (Central Admin) since Boss manages HQ groups
export function isHQGroup(zoneId: string | undefined): boolean {
  if (!zoneId) return false
  return HQ_GROUP_IDS.includes(zoneId) || zoneId === BOSS_ZONE_ID
}

// Check if a zone uses Firebase database without zone filtering
export function usesFirebaseDatabase(zoneId: string | undefined): boolean {
  // HQ groups use Firebase database without zone filtering
  // Central Admin (Boss) manages these groups and can see all data
  return isHQGroup(zoneId)
}

// Check if user has Boss/Central Admin access
// Boss can:
// 1. Manage the 5 HQ groups (unfiltered Firebase database)
// 2. View and manage ALL 86 zones (zone-specific data)
export function hasBossAccess(role: string | undefined, zoneId: string | undefined): boolean {
  return role === 'boss' || zoneId === BOSS_ZONE_ID
}

// Check if user should bypass feature gates and subscription checks
// HQ groups and India zone get free unlimited access without subscription requirements
export function bypassesFeatureGates(zoneId: string | undefined): boolean {
  return isHQGroup(zoneId) || zoneId === BOSS_ZONE_ID || zoneId === 'zone-013' // India zone gets premium access
}

// Check if zone requires subscription payment
// HQ groups and India zone are free and don't need subscriptions
export function requiresSubscription(zoneId: string | undefined): boolean {
  return !bypassesFeatureGates(zoneId)
}
