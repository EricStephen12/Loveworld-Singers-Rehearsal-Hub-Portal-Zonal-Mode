# HQ Groups Implementation Summary

## Overview
Implemented 5 HQ (Headquarters) groups that use Firebase database WITHOUT zone filtering, with dynamic terminology for comments.

## Changes Made

### 1. Zone Configuration (`src/config/zones.ts`)
- ✅ Added 5th HQ group: **Presidential Mass Choir** (zone-005)
- ✅ Changed all 5 HQ groups to **purple color** (#9333EA)
- ✅ Renumbered all zones from zone-006 onwards (87 total zones now)
- ✅ Added helper functions:
  - `isHQGroup(zoneId)` - Check if zone is an HQ group
  - `usesFirebaseDatabase(zoneId)` - Check if zone uses unfiltered Firebase
  - `hasBossAccess(role, zoneId)` - Check if user has Boss/Central Admin access

### 2. HQ Groups (Purple - #9333EA)
1. **zone-001**: Your Loveworld Singers
2. **zone-002**: Loveworld Singers 24 Worship Band
3. **zone-003**: Loveworld Singers Children Choir
4. **zone-004**: Loveworld Singers Teens Choir
5. **zone-005**: Presidential Mass Choir (NEW)

### 3. Feature Gate Bypass for HQ Groups

#### Zone Configuration (`src/config/zones.ts`)
- ✅ Added `bypassesFeatureGates(zoneId)` - HQ groups bypass all feature restrictions
- ✅ Added `requiresSubscription(zoneId)` - HQ groups don't need subscriptions
- ✅ HQ members get full access without payment

#### Roles Configuration (`src/config/roles.ts`)
- ✅ Added new role: `hq_member` with full permissions
- ✅ HQ members have same permissions as coordinators but without subscription needs
- ✅ Updated `getUserRoleInZone()` to detect HQ members automatically

#### Zone Context (`src/contexts/ZoneContext.tsx`)
- ✅ Automatically assigns `hq_member` role to users in HQ groups
- ✅ HQ members get full access on zone switch

#### Feature Access Hook (`src/hooks/useFeatureAccess.ts`)
- ✅ New hook: `useFeatureAccess()` for checking feature permissions
- ✅ Returns `hasUnlimitedAccess` for HQ groups
- ✅ Returns `requiresPayment` (false for HQ groups)
- ✅ Easy to use in any component

### 4. Dynamic Comment Terminology

#### SongDetailModal (`src/components/SongDetailModal.tsx`)
- ✅ Added `useZone()` context
- ✅ Added `getCommentLabel()` helper function
- ✅ **HQ Groups see**: "Pastor Comments" / "Pastor's Comments"
- ✅ **Regular Zones see**: "Coordinator Comments" / "Coordinator's Comments"
- ✅ Updated all comment filters to accept both "Pastor" and "Coordinator" authors
- ✅ Updated UI labels to use dynamic terminology

#### EditSongModal (`src/components/EditSongModal.tsx`)
- ✅ Added `useZone()` context
- ✅ Added `getCommentLabel()` helper function
- ✅ Comments saved with correct author: "Pastor" for HQ groups, "Coordinator" for zones
- ✅ Updated UI labels and placeholders to use dynamic terminology
- ✅ Updated comment filters to accept both author types

## Architecture

### HQ Groups (5 zones)
- **Color**: Purple (#9333EA)
- **Database**: Firebase (unfiltered - see ALL data)
- **Comments**: "Pastor Comments"
- **Managed by**: Central Admin (Boss)
- **Access**: FREE - No subscription required, bypass all feature gates
- **Permissions**: Full access (create, edit, delete content and manage members)

### Regular Zones (81 zones)
- **Color**: Various colors by region
- **Database**: Zone-filtered data (see only their zone)
- **Comments**: "Coordinator Comments"
- **Managed by**: Zone Coordinators

### Central Admin (Boss)
- **Access**: Full access to ALL zones + HQ groups
- **Can manage**: 
  1. The 5 HQ groups (unfiltered Firebase database)
  2. All 86 zones (zone-specific data)
- **Zone**: zone-boss (BOSS101 invitation code)

## Data Flow

```
HQ Groups (zone-001 to zone-005)
  ↓
Firebase Database (NO zone filtering)
  ↓
See ALL songs, comments, data
  ↓
Comments labeled as "Pastor Comments"

Regular Zones (zone-006 to zone-086)
  ↓
Firebase Database (WITH zone filtering: where zoneId == currentZone)
  ↓
See ONLY their zone's data
  ↓
Comments labeled as "Coordinator Comments"

Central Admin (zone-boss)
  ↓
Can access BOTH:
  - HQ Groups unfiltered data
  - All zones filtered data
```

## Testing Checklist

- [ ] HQ group users see "Pastor Comments" in SongDetailModal
- [ ] Regular zone users see "Coordinator Comments" in SongDetailModal
- [ ] HQ group users can save comments as "Pastor"
- [ ] Regular zone users can save comments as "Coordinator"
- [ ] Comments display correctly in history tab
- [ ] Boss users can see all zones in admin panel
- [ ] Zone colors display correctly (purple for HQ groups)
- [ ] Presidential Mass Choir appears in zone list

## Notes

- All existing comments with "Coordinator" author will still display for backward compatibility
- The system checks for both "Pastor" and "Coordinator" when filtering comments
- HQ groups use the same Firebase database but without zone filtering
- Boss users have full visibility across all zones and HQ groups
