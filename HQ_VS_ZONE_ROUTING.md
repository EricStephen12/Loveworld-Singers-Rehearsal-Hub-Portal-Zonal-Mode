# HQ vs Zone Routing - Complete Implementation

## Problem Solved
HQ users were being added to `zone_members` collection instead of `hq_members` collection.

## Solution
Updated `ZoneInvitationService.joinZoneWithCode()` to check if the invitation code is for an HQ group and route accordingly.

## Routing Logic

### When User Signs Up with Invitation Code:

```typescript
// In ZoneInvitationService.joinZoneWithCode()

if (isHQGroup(zone.id)) {
  // Route to HQ service
  return HQInvitationService.joinHQGroup(...)
  // Saves to: hq_members collection
  // User gets: hq_member role
  // Access: Unlimited, no subscription
} else {
  // Continue with zone service
  // Saves to: zone_members collection
  // User gets: zone_member or zone_coordinator role
  // Access: Zone-filtered, needs subscription
}
```

## Updated Methods

### 1. `joinZoneWithCode()` - Main Entry Point
- **Before**: Always saved to `zone_members`
- **After**: Checks `isHQGroup()` and routes to correct service
- **HQ Path**: → `HQInvitationService.joinHQGroup()` → `hq_members`
- **Zone Path**: → Continues in method → `zone_members`

### 2. `getAllZonesWithStats()` - Boss Dashboard
- **Before**: Only checked `zone_members`
- **After**: Checks both collections based on zone type
- **HQ Groups**: Queries `hq_members` collection
- **Regular Zones**: Queries `zone_members` collection

### 3. `getZoneMembers()` - Member List
- **Before**: Only checked `zone_members`
- **After**: Routes to correct collection
- **HQ Groups**: Uses `HQMembersService.getHQGroupMembers()`
- **Regular Zones**: Uses `zone_members` query

### 4. `removeMember()` - Delete Member
- **Before**: Only deleted from `zone_members`
- **After**: Routes to correct collection
- **HQ Groups**: Uses `HQMembersService.removeMember()`
- **Regular Zones**: Deletes from `zone_members`

## Data Flow

### HQ User Signup (ZONE001-ZONE005):
```
User enters code: ZONE001
↓
ZoneInvitationService.joinZoneWithCode()
↓
Detects: isHQGroup(zone-001) = true
↓
Routes to: HQInvitationService.joinHQGroup()
↓
Saves to: hq_members collection
↓
Document ID: {userId}_{hqGroupId}
↓
User gets: hq_member role
↓
Access: praise_nights, songs, categories (unfiltered)
```

### Regular Zone User Signup (ZONE006+):
```
User enters code: ZONE045
↓
ZoneInvitationService.joinZoneWithCode()
↓
Detects: isHQGroup(zone-045) = false
↓
Continues in method
↓
Saves to: zone_members collection
↓
Document ID: mem_{timestamp}_{userId}
↓
User gets: zone_member role
↓
Access: zone_praise_nights, zone_songs (filtered by zoneId)
```

## Collection Structure

### `hq_members` Collection:
```typescript
{
  id: "user123_zone-001",
  userId: "user123",
  userEmail: "pastor@example.com",
  userName: "Pastor Chris",
  hqGroupId: "zone-001",
  role: "member" | "coordinator",
  joinedAt: Date,
  status: "active"
}
```

### `zone_members` Collection:
```typescript
{
  id: "mem_1234567890_user456",
  userId: "user456",
  userEmail: "member@example.com",
  userName: "John Doe",
  zoneId: "zone-045",
  role: "member" | "coordinator",
  joinedAt: Date,
  status: "active"
}
```

## Benefits

✅ **Clean Separation**: HQ and zone memberships never mix
✅ **Correct Routing**: Automatic based on invitation code
✅ **No Manual Checks**: System handles routing automatically
✅ **Backward Compatible**: Existing zone members unaffected
✅ **Easy to Query**: Boss can see both types separately

## Testing Checklist

- [ ] Sign up with ZONE001 → Check `hq_members` collection
- [ ] Sign up with ZONE045 → Check `zone_members` collection
- [ ] Boss dashboard shows HQ members correctly
- [ ] Boss dashboard shows zone members correctly
- [ ] Remove HQ member works
- [ ] Remove zone member works
- [ ] HQ member gets `hq_member` role
- [ ] Zone member gets `zone_member` role

## Files Modified

1. `src/lib/zone-invitation-service.ts` - Added HQ routing logic
2. `src/lib/hq-invitation-service.ts` - Created HQ-specific invitation handler
3. `src/lib/hq-members-service.ts` - Created HQ membership management
4. `src/contexts/ZoneContext.tsx` - Updated to check both collections

## Result

HQ users now correctly go to `hq_members` collection and get unlimited access without subscriptions, while regular zone users go to `zone_members` collection with zone-filtered access.
