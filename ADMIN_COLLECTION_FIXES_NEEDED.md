# Admin Collection Fixes Needed

## Current Issues

### ❌ Members Section (`src/components/Members.tsx`)
**Problem:** Loading ALL profiles from Firebase without zone filtering
```typescript
const profiles = await FirebaseDatabaseService.getCollection('profiles');
```

**Should be:**
- HQ Groups: Load from `hq_members` collection (unfiltered)
- Regular Zones: Load from `zone_members` collection (filtered by zoneId)

### ❌ Media Section
**Need to check:** Does it use zone-aware collections?

### ❌ Notifications Section (`src/components/admin/NotificationsSection.tsx`)
**Problem:** Uses `FirebaseDatabaseService` directly
```typescript
const profiles = await FirebaseDatabaseService.getCollection('profiles');
const allNotifications = await FirebaseDatabaseService.getCollection('notifications');
```

**Should be:** Zone-aware notifications

## What's Already Fixed ✅

1. ✅ **Categories** - Uses `ZoneDatabaseService.getCategories(zoneId)`
2. ✅ **Page Categories** - Uses `ZoneDatabaseService.getPageCategories(zoneId)`
3. ✅ **Praise Nights** - Uses `ZoneDatabaseService.createPraiseNight(zoneId, ...)`
4. ✅ **Songs** - Updated `PraiseNightSongsService` to be zone-aware

## Collections Summary

### HQ Groups (zone-001 to zone-005)
- `hq_members` - HQ membership
- `songs` - HQ songs
- `praise_nights` - HQ praise nights
- `categories` - HQ categories
- `page_categories` - HQ page categories
- `profiles` - Shared (all users)
- `notifications` - Shared (all users)

### Regular Zones (zone-006+)
- `zone_members` - Zone membership
- `zone_songs` - Zone songs
- `zone_praise_nights` - Zone praise nights
- `zone_categories` - Zone categories
- `zone_page_categories` - Zone page categories
- `profiles` - Shared (all users)
- `notifications` - Shared (all users)

## Action Plan

1. **Fix Members Section** - Load from correct membership collection
2. **Check Media Section** - Verify if zone-aware
3. **Fix Notifications** - Make zone-aware if needed
4. **Test Everything** - Ensure HQ and zones see correct data
