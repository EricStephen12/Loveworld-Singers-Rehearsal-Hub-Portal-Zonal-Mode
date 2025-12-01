# LoveWorld Singers Rehearsal Hub
## Subscription & Sub-Groups System Plan

---

## Executive Summary

This document outlines a new subscription and organizational structure for the LoveWorld Singers Rehearsal Hub (LWSRH) platform. The goal is to enable flexible payment options and allow smaller groups (churches, campuses, cells) to operate independently while remaining connected to their parent zone.

---

## Current System

### How It Works Today

1. **HQ Admin (Boss)** manages everything from the top
2. **Zonal Coordinators** manage their zones and create rehearsals
3. **Members** join zones and participate in rehearsals

### Current Database Architecture

- **HQ Groups** (zone-001 to zone-005): Use `praise_nights`, `songs`, `categories` collections (unfiltered)
- **Regular Zones** (zone-006+): Use `zone_praise_nights`, `zone_songs`, `zone_categories` collections (filtered by zoneId)
- **Central Admin** (zone-boss): Can access everything

### Current Subscription

- **Free Plan**: Maximum 10 members, no premium features
- **Premium Plan**: 1 Espee per month, unlimited members, all features

### Current Limitations

1. Only Zonal Coordinators can pay for subscriptions. If a church choir within a zone wants premium features, the entire zone must upgrade. There's no way for smaller groups to pay independently.

2. Zonal Coordinators cannot access HQ Admin's master song library. They have to create all songs from scratch instead of importing from HQ.

---

## Proposed New System

### The Problems We're Solving

**Problem 1: Song Library Access**
- HQ Admin has a master library of songs
- Zonal Coordinators currently cannot see or use these songs
- They have to recreate everything from scratch

**Problem 2: Sub-Group Independence**
Within each zone, there are smaller groups:
- Church choirs
- Campus fellowship groups
- Cell groups
- Youth choirs
- Special ministry teams

These groups want to:
1. Have their own rehearsals separate from zone-wide events
2. Pay for their own subscription without waiting for the zone
3. Manage their own members and songs

**Problem 3: Flexible Payment**
- Currently only zone-level payment exists
- Individuals cannot pay for themselves
- Smaller groups cannot pay independently

### The Solution

**Part 1: Song Library Hierarchy**
- HQ Admin maintains a master song library
- Zones can VIEW and IMPORT songs from HQ (read-only)
- Sub-Groups can VIEW and IMPORT songs from their Zone (read-only)

**Part 2: Sub-Groups**
A **Sub-Group** is a smaller team within a zone that can operate semi-independently.

**Part 3: Flexible Subscription**
Three payment levels: Zone, Sub-Group, and Individual.

---

## How Sub-Groups Work

### Creating a Sub-Group

1. **Any zone member** can request to create a sub-group
2. They fill out a simple form with:
   - Group name (e.g., "Christ Embassy Ikeja Choir")
   - Group type (Church, Campus, Cell, Youth, Other)
   - Description
   - Estimated number of members

3. The request goes to:
   - **Zonal Coordinator** for approval

4. Once the Zonal Coordinator approves:
   - The sub-group status becomes **"approved_pending_payment"**
   - The requester is notified to complete payment
   - They must pay for their sub-group's subscription to activate

5. After payment is completed:
   - The person who requested becomes the **Sub-Group Coordinator**
   - They get access to a mini admin dashboard (`/subgroup-admin`)
   - The sub-group is now fully active

### Sub-Group Activation Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Member    │     │   Zonal     │     │   Payment   │     │   Active    │
│   Request   │────▶│   Approval  │────▶│   Required  │────▶│  Sub-Group  │
│             │     │             │     │             │     │             │
│ status:     │     │ status:     │     │ status:     │     │ status:     │
│ "pending"   │     │ "approved_  │     │ "active"    │     │ "active"    │
│             │     │  pending_   │     │             │     │             │
│             │     │  payment"   │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

### What Sub-Group Coordinators Can Do

| Action | Allowed? |
|--------|----------|
| Create rehearsals for their group | ✅ Yes |
| Add songs to their group's library | ✅ Yes |
| Create their own custom songs | ✅ Yes |
| Import songs from zone's library | ✅ Yes (read-only copy) |
| Add members (from existing zone members) | ✅ Yes |
| Send messages to their group | ✅ Yes |
| Edit zone-level content | ❌ No |
| See zone rehearsals | ✅ Yes (as participant) |

---

## Song Library Hierarchy

### How Song Access Works

```
┌─────────────────────────────────────────────────────────────────┐
│                 HQ INTERNAL SONG LIBRARY                        │
│                 (HQ Admin's Working Library)                    │
│                                                                 │
│  • Original songs created/managed by HQ Admin                   │
│  • Full history, comments, all metadata                         │
│  • NOT visible to zones                                         │
│  • Collections: praise_nights, songs (existing HQ collections)  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HQ ADMIN "PUBLISH TO MASTER"
                              │ (Creates a copy, can edit independently)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MASTER SONG LIBRARY                          │
│                    (Curated for Zones)                          │
│                                                                 │
│  • Songs HQ Admin has published for zones to access             │
│  • HQ Admin can edit these without affecting originals          │
│  • Zones can VIEW and IMPORT from here                          │
│  • Collection: master_songs (NEW)                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ READ-ONLY ACCESS
                              │ Can IMPORT (copy) songs
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ZONE SONG LIBRARY                            │
│                    (Zone's Own Library)                         │
│                                                                 │
│  • Songs imported from Master Library                           │
│  • Zone's own custom songs                                      │
│  • Managed by Zonal Coordinator                                 │
│  • Collections: zone_praise_nights, zone_songs, zone_categories │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ READ-ONLY ACCESS
                              │ Can IMPORT (copy) songs
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  SUB-GROUP SONG LIBRARY                         │
│                  (Sub-Group's Own Library)                      │
│                                                                 │
│  • Songs imported from Zone                                     │
│  • Sub-Group's own custom songs                                 │
│  • Managed by Sub-Group Coordinator                             │
│  • Collections: subgroup_praise_nights, subgroup_songs          │
└─────────────────────────────────────────────────────────────────┘
```

### HQ Admin: Two Libraries

**1. Internal Library (Existing)**
- Where HQ Admin creates and manages original songs
- Full features: comments, history, all metadata
- NOT visible to zones
- Uses existing `songs` collection

**2. Master Library (NEW)**
- Curated songs published for zones to access
- HQ Admin clicks "Publish to Master Library" to copy a song here
- HQ Admin can edit the master copy independently (doesn't affect original)
- Zones can only see and import from this library
- Uses new `master_songs` collection

### What "Import" / "Publish" Means

**When HQ Admin publishes to Master Library:**
- A **copy** of the song is created in `master_songs`
- Only song data is copied: title, lyrics, audio URLs, solfa, key, etc.
- **NOT copied**: comments, history, internal notes
- HQ Admin can edit the master copy without affecting the original
- Tracked with `sourceType: 'hq_internal'` and `originalSongId`

**When Zone imports from Master Library:**
- A **copy** of the song is created in `zone_songs`
- Only song data is copied: title, lyrics, audio URLs, solfa, key, etc.
- **NOT copied**: comments, history from master
- Zone can customize their copy (change key, add notes, etc.)
- Original master song is NOT affected
- Tracked with `importedFrom: 'master'` and `originalSongId`

**When Sub-Group imports from Zone:**
- Same logic - copy song data only, no comments/history
- Tracked with `importedFrom: 'zone'` and `originalSongId`

### What HQ Admin Can Do (NEW)

| Action | Allowed? |
|--------|----------|
| Create/edit songs in Internal Library | ✅ Yes |
| Publish songs to Master Library | ✅ Yes (creates a copy) |
| Edit songs in Master Library | ✅ Yes (independent of original) |
| Delete songs from Master Library | ✅ Yes |
| See which zones imported a song | ✅ Yes (analytics) |

### What Zonal Coordinators Can Do (NEW)

| Action | Allowed? |
|--------|----------|
| View Master Library | ✅ Yes (read-only) |
| Import songs from Master Library to their zone | ✅ Yes |
| Create their own zone songs | ✅ Yes |
| Edit songs in their zone library | ✅ Yes |
| Edit Master Library songs | ❌ No |
| Delete Master Library songs | ❌ No |
| See HQ Internal Library | ❌ No |
| Approve/reject sub-group requests | ✅ Yes |
| View sub-groups in their zone | ✅ Yes |

### What Members Experience

Members can belong to:
- Their **Zone** (required)
- One or more **Sub-Groups** (optional)

When they open the app, they see:
- **Zone Rehearsals** - Events for the entire zone
- **My Group Rehearsals** - Events for their specific church/campus/cell

They can filter between these views easily.

---

## New Subscription Model

### Pricing Structure

#### Base Price
- **1 Espee per month** per person

#### Discount Tiers (Conservative - To Fund Department)

| Plan | Price | Discount | Best For |
|------|-------|----------|----------|
| **Individual** | 1 Espee/month | No discount | Single person |
| **Sub-Group (5-20 members)** | 0.95 Espee/person/month | 5% off | Small church choirs |
| **Sub-Group (21-50 members)** | 0.92 Espee/person/month | 8% off | Medium groups |
| **Zone (51-100 members)** | 0.90 Espee/person/month | 10% off | Small zones |
| **Zone (101-200 members)** | 0.85 Espee/person/month | 15% off | Medium zones |
| **Zone (201+ members)** | 0.82 Espee/person/month | 18% off | Large zones |

#### Yearly Discount (Additional)
- Pay for 12 months upfront = **1 month FREE** (8% additional savings)

#### Example Calculations

**Example 1: Individual**
- 1 person × 1 Espee = **1 Espee/month**

**Example 2: Small Church Choir (15 members)**
- 15 people × 0.95 Espee = **14.25 Espees/month** (saves 0.75 Espees)

**Example 3: Medium Zone (150 members)**
- 150 people × 0.85 Espee = **127.5 Espees/month** (saves 22.5 Espees)

**Example 4: Large Zone Yearly (250 members)**
- 250 people × 0.82 Espee × 11 months = **2,255 Espees/year** (saves 745 Espees)

#### Revenue Comparison

| Scenario | No Discount | With New Discounts | Revenue Retained |
|----------|-------------|-------------------|------------------|
| 15 member sub-group | 15 ESP | 14.25 ESP | 95% |
| 150 member zone | 150 ESP | 127.5 ESP | 85% |
| 250 member zone (yearly) | 3,000 ESP | 2,255 ESP | 75% |

**Conservative discounts maximize revenue while still incentivizing bulk purchases.**

### Three Ways to Pay

| Payment Type | Who Pays | Who Benefits | Pricing |
|--------------|----------|--------------|---------|
| **Zone Subscription** | Zonal Coordinator | Everyone in the zone (including all sub-groups) | Tiered by zone size |
| **Sub-Group Subscription** | Sub-Group Coordinator | Only members of that sub-group | Tiered by group size |
| **Individual Subscription** | Any member | Only themselves | 1 Espee (no discount) |

### How Subscription Inheritance Works

The system checks in this order:

1. **Does the Zone have premium?**
   - Yes → Everyone gets premium (zone paid for all)
   - No → Check next level

2. **Does the member's Sub-Group have premium?**
   - Yes → That member gets premium
   - No → Check next level

3. **Does the member have individual premium?**
   - Yes → That member gets premium
   - No → Free tier

### Example Scenarios

**Scenario 1: Zone Pays**
- Lagos Zone 1 Coordinator pays for zone subscription
- All 200 members get premium
- All 5 sub-groups within the zone get premium
- Nobody else needs to pay

**Scenario 2: Sub-Group Pays**
- Lagos Zone 1 has NOT paid
- Christ Embassy Ikeja Choir (sub-group) pays for their 25 members
- Only those 25 members get premium
- Other zone members remain on free tier

**Scenario 3: Individual Pays**
- Lagos Zone 1 has NOT paid
- Christ Embassy Ikeja Choir has NOT paid
- John (a member) pays for himself
- Only John gets premium
- Everyone else remains on free tier

---

## Organizational Hierarchy

```
                    ┌─────────────────┐
                    │    HQ ADMIN     │
                    │     (Boss)      │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
    ┌────▼────┐        ┌────▼────┐        ┌────▼────┐
    │ Zone A  │        │ Zone B  │        │ Zone C  │
    │ Coord.  │        │ Coord.  │        │ Coord.  │
    └────┬────┘        └─────────┘        └─────────┘
         │
    ┌────┴────┬──────────┬──────────┐
    │         │          │          │
┌───▼───┐ ┌───▼───┐ ┌───▼───┐ ┌───▼───┐
│Church │ │Campus │ │ Cell  │ │ Youth │
│Choir  │ │Group  │ │Group  │ │ Choir │
│Coord. │ │Coord. │ │Coord. │ │Coord. │
└───┬───┘ └───────┘ └───────┘ └───────┘
    │
┌───┴───┐
│Members│
└───────┘
```

---

## User Roles Summary

### HQ Admin (Boss)
- Manages all zones
- Maintains master song library
- Views all analytics
- No payment required (free access)

### Zonal Coordinator
- Manages their zone
- **Views HQ Admin's song library (read-only) via "HQ Library" section**
- **Imports songs from HQ to their zone**
- Creates zone-wide rehearsals
- **Approves sub-group requests for their zone**
- **Views and manages sub-groups**
- Can pay for zone subscription (with volume discounts)
- Uses existing `/admin` dashboard

### Sub-Group Coordinator
- Manages their sub-group
- **Views Zone's song library (read-only)**
- **Imports songs from Zone to their sub-group**
- **Creates their own custom songs**
- Creates sub-group rehearsals
- Adds members from zone
- **Must pay for sub-group subscription after approval to activate**
- **Uses separate `/subgroup-admin` mini dashboard**

### Member
- Participates in zone and sub-group activities
- Can request to create a sub-group
- Can pay for individual subscription (no discount)

---

## Admin Dashboard Architecture

### Existing Admin (`/admin`) - NO CHANGES TO CORE
Keep the current admin dashboard as-is, only ADD new sections:

```
/admin (EXISTING)
├── Dashboard
├── Pages
├── Categories
├── Page Categories
├── Submitted Songs
├── Members
├── Media
├── Media Upload (HQ only)
├── Notifications
├── NEW: Master Library (HQ Admin) ← Publish songs for zones, edit copies
├── NEW: Master Library (Zone Coordinators) ← READ-ONLY view, import to zone
└── NEW: Sub-Groups (Zone Coordinators only) ← Approve/manage sub-groups
```

**Master Library Section Behavior:**
- **HQ Admin sees**: Full management (publish from internal, edit, delete, analytics)
- **Zone Coordinator sees**: Read-only list with "Import to Zone" button

### New Sub-Group Admin (`/subgroup-admin`) - SEPARATE MINI DASHBOARD

```
/subgroup-admin (NEW - Separate route)
├── Dashboard (stats for sub-group)
├── Rehearsals (create/manage sub-group rehearsals)
├── Songs (import from zone + create own songs)
├── Members (add from zone members)
└── Notifications (send to sub-group)
```

**Key Points:**
- Sub-Group Coordinators CANNOT access `/admin`
- Sub-Group Coordinators ONLY access `/subgroup-admin`
- Simpler, cleaner interface for sub-group management
- Zone filter not needed (they only see their sub-group)

---

## Premium Features (What You Get)

### Free Tier
- Maximum 10 members
- Basic song viewing
- Join rehearsals
- Basic notifications

### Premium Tier
- Unlimited members
- Audio Lab (practice with audio tracks)
- Rehearsal scheduling & tracking
- Custom song submissions
- Analytics & reports
- AI translation

---

## Database Schema (New Collections)

### master_songs (NEW - Master Library for Zones)
```typescript
{
  id: string;
  // Song data (copied from HQ internal)
  title: string;
  lyrics?: string;
  solfa?: string;
  key?: string;
  tempo?: string;
  writer?: string;
  leadSinger?: string;
  category?: string;
  audioUrls?: {
    full?: string;
    soprano?: string;
    alto?: string;
    tenor?: string;
    bass?: string;
  };
  // Import tracking
  sourceType: 'hq_internal';   // Where it came from
  originalSongId: string;      // Original HQ song ID
  // Metadata
  publishedBy: string;         // HQ Admin who published
  publishedAt: Date;
  updatedAt: Date;
  // Analytics
  importCount: number;         // How many zones imported this
  // NOTE: No comments, no history - those stay with original
}
```

### subgroups
```typescript
{
  id: string;
  zoneId: string;              // Parent zone
  name: string;                // e.g., "Christ Embassy Ikeja Choir"
  type: 'church' | 'campus' | 'cell' | 'youth' | 'other';
  description: string;
  coordinatorId: string;       // User who requested/manages
  memberIds: string[];         // Array of user IDs
  status: 'pending' | 'approved_pending_payment' | 'active' | 'rejected';
  estimatedMembers: number;
  createdAt: Date;
  approvedAt?: Date;
  approvedBy?: string;         // Zone coordinator who approved
  activatedAt?: Date;          // When payment was completed
  rejectionReason?: string;
}
```

### subgroup_subscriptions
```typescript
{
  id: string;
  subgroupId: string;
  status: 'pending' | 'active' | 'expired';
  plan: 'premium';
  memberCount: number;
  amountPaid: number;
  currency: string;
  paymentId: string;
  paidBy: string;              // Sub-group coordinator
  paidAt: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### subgroup_praise_nights
```typescript
{
  id: string;
  subgroupId: string;
  zoneId: string;              // For reference
  name: string;
  date: string;
  location: string;
  // ... same fields as zone_praise_nights
  // NOTE: No comments/history from zone
}
```

### subgroup_songs
```typescript
{
  id: string;
  subgroupId: string;
  zoneId: string;              // For reference
  importedFrom?: 'zone';       // If imported from zone
  originalSongId?: string;     // Original zone song ID
  importedAt?: Date;
  // ... same fields as zone_songs
  // NOTE: No comments/history - those stay with zone original
}
```

### Updated zone_songs (add import tracking)
```typescript
{
  // ... existing fields
  importedFrom?: 'master';     // NEW: If imported from Master Library
  originalSongId?: string;     // NEW: Original master song ID
  importedAt?: Date;           // NEW: When imported
  // NOTE: No comments/history from master - those don't exist there
}
```

---

## Implementation Phases

### Phase 1: Song Library Hierarchy (Week 1-2) completed

**Part A: Master Library for HQ Admin** completed
- Create `master_songs` collection in Firebase
- Add "Master Library" section in HQ Admin sidebar
- Build "Publish to Master Library" feature (copies song without comments/history)
- HQ Admin can edit master copies independently
- Show analytics: import count per song

**Part B: Zone Access to Master Library** completed
- Add `getMasterSongs()` function to `zone-database-service.ts`
- Create "Master Library" section in Zone Admin sidebar (read-only)
- Build song list view with search/filter
- Add "Import to Zone" button (copies song without comments/history)
- Track imported songs with `importedFrom: 'master'` and `originalSongId`

### Phase 2: Sub-Group Foundation (Week 2) complete
- Create `subgroups` collection in Firebase
- Add "Request Sub-Group" form for members (accessible from /profile)
- Add "Sub-Groups" section in Zone Admin sidebar
- Build approval/rejection workflow for Zone Coordinators
- Create `isSubGroupCoordinator` hook
- Send notifications on approval/rejection

### Phase 3: Sub-Group Dashboard (Week 3) complete
- Create `/subgroup-admin` route (separate from main admin)
- Build simplified sidebar (Dashboard, Rehearsals, Songs, Members, Notifications)
- Create `subgroup_songs` and `subgroup_praise_nights` collections
- Build "Import from Zone" feature
- Member management (select from zone members)
- Sub-group coordinator can create their own songs

### Phase 4: Sub-Group Rehearsals (Week 4) complete
- ✅ Add `scope: 'zone' | 'subgroup'` to praise nights (SubGroupRehearsal type)
- ✅ Filter rehearsals by scope in member view (useMemberRehearsals hook)
- ✅ RehearsalScopeBadge component for clear labels
- ✅ CombinedRehearsalsList component showing zone + sub-group rehearsals
- ✅ Integrated in /pages/rehearsals with filter tabs
- ✅ Created /pages/subgroup-rehearsal page for viewing sub-group rehearsal details
- ✅ Sub-group notifications:
  - SubGroupNotifications component sends to all members
  - Auto-notification when rehearsal is created
  - Notifications page shows combined zone + sub-group notifications with filter tabs
  - getUserNotifications fetches user's sub-group notifications

### Phase 5: New Subscription System (Week 5-6)
- Update `subscription-pricing.ts` with new conservative tiers
- Create `subgroup_subscriptions` collection
- Build subscription inheritance logic (Zone → Sub-Group → Individual)
- **Sub-group payment required after approval to activate**
- Add yearly payment option (1 month free)
- Payment history & receipts
- Subscription status indicators in UI

---

## Benefits of This System

### For HQ Admin
- Better organization visibility
- Decentralized management (less workload)
- More subscription revenue streams
- **Song library becomes the single source of truth**
- **Can see which songs are most popular across zones**

### For Zonal Coordinators
- **No more recreating songs from scratch**
- **Import official songs with one click**
- Easier to manage large zones
- Sub-groups handle their own rehearsals
- Can still maintain zone-wide events
- **Volume discounts for larger zones**

### For Sub-Group Coordinators
- **Access to zone's entire song library**
- **Can create their own custom songs**
- Independence to run their own rehearsals
- Don't have to wait for zone to pay
- Direct control over their members
- **Volume discounts for larger groups**
- **Clean, simple mini dashboard**

### For Members
- Clear separation between zone and group activities
- Can pay individually if needed
- Better organized rehearsal schedule
- **Access to more songs through the hierarchy**

---

## Decisions Made

1. **Approval Flow**: Zonal Coordinators only (HQ Admin not required)

2. **Song Creation**: Sub-groups CAN create their own songs (not just import)

3. **Member Limits**: 10 members max on free tier for sub-groups

4. **Discount Tiers**: Conservative (5-18%) to maximize department funding
   - 5-20 members: 5% off
   - 21-50 members: 8% off
   - 51-100 members: 10% off
   - 101-200 members: 15% off
   - 201+ members: 18% off

5. **Yearly Discount**: 1 month free (8% off) for yearly payment

6. **Minimum Group Size**: 5 members to qualify for group discounts

7. **Song Import Tracking**: Yes, track for analytics

8. **Sub-Group Activation**: Payment required after approval to activate

9. **Admin Architecture**: 
   - Keep existing `/admin` for HQ and Zone Coordinators
   - Create separate `/subgroup-admin` for Sub-Group Coordinators

---

## Next Steps

1. ✅ Review and approve this plan
2. Begin Phase 1 implementation (Song Library Hierarchy)
3. Test with pilot zone before full rollout

---

*Document prepared for LoveWorld Singers Rehearsal Hub*
*Version 2.0 - November 2024*
*Updated with implementation details and conservative pricing*
