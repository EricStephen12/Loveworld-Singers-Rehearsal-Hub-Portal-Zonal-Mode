# Media Admin Access Setup

## Overview
Zone Coordinators (users who joined with ZNL prefix codes) now have access to the Media Upload admin panel directly from their profile.

## Access Points

### 1. Profile Page
- **Who**: Zone Coordinators (ZNL prefix users)
- **Location**: Profile → "Media Upload" button
- **Color**: Red/Pink gradient
- **Icon**: Film icon
- **Link**: `/admin/media`

### 2. Admin Sidebar
- **Who**: All admin users
- **Location**: Admin Panel → Sidebar → "Media Upload"
- **Icon**: Upload icon
- **Link**: `/admin/media`

## How It Works

### Zone Coordinator Detection
Users are identified as Zone Coordinators if they:
1. Joined a zone using an invitation code starting with "ZNL"
2. Have `isZoneCoordinator` flag set to `true` in ZoneContext

### Code Structure
```typescript
// Zone codes format:
// Regular member: ZONE001, ZONE002, etc.
// Coordinator: ZNL + ZONE001 = ZNLZONE001

// Function in zones.ts:
export function isCoordinatorCode(code: string): boolean {
  return code.startsWith('ZNL')
}
```

## User Flow

### For Zone Coordinators:
1. User logs in
2. Goes to Profile page
3. Sees "Media Upload" button (red/pink gradient)
4. Clicks button → Redirected to `/admin/media`
5. Can upload videos via Cloudinary
6. Videos appear in `/pages/media` for all users

### For Regular Members:
- No "Media Upload" button visible
- Can only view media in `/pages/media`

## Permissions

### Zone Coordinator Can:
- ✅ Upload videos
- ✅ Upload thumbnails and backdrops
- ✅ Set media metadata (title, description, type)
- ✅ Mark content as featured
- ✅ Access admin panel for their zone

### Regular Member Can:
- ✅ View all media
- ✅ Watch videos
- ✅ Track watch progress
- ✅ Add to favorites
- ❌ Cannot upload media

## UI Components

### Profile Button
```tsx
{isZoneCoordinator && currentZone && (
  <Link href="/admin/media">
    <Film icon />
    Media Upload
    Upload videos & content
  </Link>
)}
```

### Admin Sidebar Item
```tsx
{ 
  icon: Upload, 
  label: 'Media Upload', 
  isLink: true, 
  href: '/admin/media' 
}
```

## Files Modified

1. `src/app/pages/profile/page.tsx`
   - Added Media Upload button for coordinators
   - Imported Film icon

2. `src/components/admin/AdminSidebar.tsx`
   - Added Media Upload menu item
   - Added router navigation for links

3. `src/app/admin/media/page.tsx`
   - Created upload interface

4. `src/app/admin/media/layout.tsx`
   - Added Cloudinary script loader

## Testing

### Test as Coordinator:
1. Join a zone with code starting with "ZNL" (e.g., ZNLZONE001)
2. Go to Profile
3. Verify "Media Upload" button appears
4. Click and verify redirect to `/admin/media`

### Test as Regular Member:
1. Join a zone with regular code (e.g., ZONE001)
2. Go to Profile
3. Verify "Media Upload" button does NOT appear
4. Can still access `/pages/media` to view content

## Security Notes

- Upload functionality is client-side gated by `isZoneCoordinator` check
- Server-side validation should be added to API routes
- Cloudinary upload preset should have appropriate restrictions
- Consider adding role-based access control (RBAC) for production
