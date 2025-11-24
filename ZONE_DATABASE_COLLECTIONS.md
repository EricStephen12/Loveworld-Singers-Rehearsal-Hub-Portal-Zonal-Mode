# Zone Database Collections - Separation Strategy

## Overview
To avoid data conflicts between HQ groups and regular zones, we use separate Firebase collections.

## Collection Architecture

### **HQ Groups (zone-001 to zone-005)** - Unfiltered Access
Uses `FirebaseDatabaseService` with original collection names:

| Collection | Purpose | Access |
|------------|---------|--------|
| `praise_nights` | HQ praise night events | Unfiltered - see ALL |
| `songs` | HQ songs with audio/lyrics | Unfiltered - see ALL |
| `categories` | HQ song categories | Unfiltered - see ALL |
| `page_categories` | HQ praise night categories | Unfiltered - see ALL |
| `song_history` | HQ song change history | Unfiltered - see ALL |
| `cloudinary_media` | HQ media files (Cloudinary) | Unfiltered - see ALL |
| `notifications` | HQ notifications | Unfiltered - see ALL |

### **Regular Zones (zone-006 to zone-087)** - Zone-Filtered Access
Uses `ZoneDatabaseService` with zone-prefixed collection names:

| Collection | Purpose | Access |
|------------|---------|--------|
| `zone_praise_nights` | Zone praise night events | Filtered by `zoneId` |
| `zone_songs` | Zone songs with audio/lyrics | Filtered by `zoneId` |
| `zone_categories` | Zone song categories | Filtered by `zoneId` |
| `zone_page_categories` | Zone praise night categories | Filtered by `zoneId` |
| `zone_song_history` | Zone song change history | Filtered by `song_id` |
| `zone_cloudinary_media` | Zone media files (Cloudinary) | Filtered by `zoneId` |
| `zone_notifications` | Zone notifications | Filtered by `zoneId` |

### **Shared Collections** - Used by Both
| Collection | Purpose | Access |
|------------|---------|--------|
| `profiles` | User profiles | By `userId` |
| `zone_members` | Zone membership records | By `userId` or `zoneId` |
| `group_posts` | Group discussion posts | By `group_id` |

## Implementation Details

### Firebase Database Service (`src/lib/firebase-database.ts`)
- **Unchanged** - Still uses original collection names
- Used directly by HQ groups (zone-001 to zone-005)
- Provides unfiltered access to all data
- Methods: `getPraiseNights()`, `getSongs()`, `createSong()`, etc.

### Zone Database Service (`src/lib/zone-database-service.ts`)
- **Updated** - Now uses `zone_*` prefixed collections
- Used by regular zones (zone-006+)
- All queries filtered by `zoneId`
- Methods: `getPraiseNightsByZone()`, `createSong()`, etc.

### New Helper Method
Added to `FirebaseDatabaseService`:
```typescript
static async addDocument(collectionName: string, data: any)
```
Creates documents with auto-generated IDs for any collection.

## Data Isolation Benefits

1. **No Conflicts**: HQ and zone data never mix
2. **Clear Separation**: Easy to identify data ownership
3. **Independent Scaling**: Collections can grow independently
4. **Simpler Queries**: No need for complex zone filtering in HQ queries
5. **Better Performance**: Smaller collections for zone-specific queries

## Migration Notes

- **Existing HQ data**: Stays in original collections (no migration needed)
- **New zone data**: Automatically goes to `zone_*` collections
- **No breaking changes**: Services maintain same method signatures

## Usage Example

```typescript
// HQ Group (zone-001) - Uses FirebaseDatabaseService
const hqSongs = await FirebaseDatabaseService.getSongs(praiseNightId)
// Returns ALL songs from 'songs' collection

// Regular Zone (zone-006) - Uses ZoneDatabaseService  
const zoneSongs = await ZoneDatabaseService.getSongsByPraiseNight(praiseNightId)
// Returns only songs from 'zone_songs' where zoneId matches
```

## Collection Naming Convention

- **HQ Collections**: Original names (e.g., `songs`, `praise_nights`)
- **Zone Collections**: Prefixed with `zone_` (e.g., `zone_songs`, `zone_praise_nights`)
- **Shared Collections**: No prefix (e.g., `profiles`, `zone_members`)
