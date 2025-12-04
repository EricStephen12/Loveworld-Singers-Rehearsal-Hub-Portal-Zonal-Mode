# Profile Recovery Guide

## Problem
Some users created accounts before a bug was fixed, resulting in incomplete profiles:
- Firebase Auth account exists
- But Firestore profile is missing or incomplete
- Users can't use the app properly

## Solution
Automatic profile recovery system that fixes incomplete accounts without requiring users to delete and recreate their accounts.

## How It Works

### 1. Automatic Recovery (On Login)
When a user logs in, the system automatically:
1. Checks if their profile exists and is complete
2. If missing or incomplete, creates/updates the profile automatically
3. Uses data from Firebase Auth (email, displayName) to populate missing fields
4. Marks the profile as "recovered" for tracking

**Location**: `src/stores/authStore.ts` (integrated into auth flow)

### 2. Manual Bulk Recovery (Admin Tool)
Admins can recover all incomplete profiles at once:

**Option A: Using Admin Panel**
1. Go to Admin Dashboard
2. Look for "Recover Incomplete Profiles" button
3. Click to scan and fix all profiles
4. View recovery report

**Option B: Using Browser Console**
```javascript
// Run bulk recovery
const result = await window.bulkRecoverProfiles()

// Generate report
const report = window.generateRecoveryReport(result)
console.log(report)
```

## Files Created

1. **`src/utils/profile-recovery.ts`**
   - `checkProfileCompleteness()` - Check if profile is complete
   - `recoverUserProfile()` - Recover single user profile
   - `autoRecoverProfile()` - Auto-recover on login

2. **`src/utils/bulk-profile-recovery.ts`**
   - `bulkRecoverProfiles()` - Recover all incomplete profiles
   - `generateRecoveryReport()` - Generate recovery report

3. **`src/components/ProfileRecoveryButton.tsx`**
   - Admin UI component for bulk recovery

## Integration

### Auth Store (Already Integrated)
The auth store now automatically recovers profiles when:
- User logs in
- Profile is missing or incomplete
- Uses Firebase Auth data to create/update profile

### Admin Panel (Optional)
Add the recovery button to your admin panel:

```tsx
import ProfileRecoveryButton from '@/components/ProfileRecoveryButton'

// In your admin component
<ProfileRecoveryButton />
```

## What Gets Recovered

### Missing Profile
Creates new profile with:
- `id`: User's Firebase Auth UID
- `email`: From Firebase Auth
- `first_name`: From displayName (first word)
- `last_name`: From displayName (remaining words)
- `full_name`: Full displayName
- `profile_completed`: false (user needs to complete)
- `recovered`: true (flag for tracking)
- `recovered_at`: Recovery timestamp

### Incomplete Profile
Updates existing profile with:
- Missing email from Firebase Auth
- Missing names from displayName
- `recovered`: true flag
- `recovered_at`: timestamp

## User Experience

### For Users with Incomplete Profiles
1. **Login Attempt**: User tries to login with their email/password
2. **Auto-Recovery**: System detects missing/incomplete profile and recovers it (0-1 second)
3. **Auto-Logout**: System logs them out and redirects to signup page
4. **Recovery Message**: Blue banner explains their account was recovered
5. **Complete Signup**: User fills in missing info (Zone Code, KingsChat ID)
6. **Account Complete**: User can now access the app normally

### What Users See
- **Blue Banner**: "Account Recovered! Your account was recovered but needs additional information..."
- **Pre-filled Email**: Their email is already filled in
- **Required Fields**: Zone Code and KingsChat ID must be provided
- **No Data Loss**: All existing data is preserved

### For Admins
1. **Bulk Recovery**: One-click fix for all users
2. **Report**: See which profiles were recovered
3. **Tracking**: "recovered" flag helps identify affected users

## Testing

### Test Auto-Recovery
1. Create a test user with incomplete profile
2. Login with that user
3. Check console logs for recovery messages
4. Verify profile was created/updated

### Test Bulk Recovery
1. Login as admin
2. Click "Recover Incomplete Profiles"
3. Check recovery report
4. Verify profiles in Firestore

## Monitoring

### Console Logs
- `🔧 Starting profile recovery...` - Recovery started
- `✅ Profile created successfully` - New profile created
- `✅ Profile recovered successfully` - Existing profile updated
- `❌ Profile recovery failed` - Recovery error

### Firestore Flags
Check for profiles with:
- `recovered: true` - Profile was recovered
- `recovered_at` - When recovery happened
- `profile_completed: false` - User needs to complete profile

## Rollback

If recovery causes issues:

1. **Disable Auto-Recovery**: Comment out recovery code in `authStore.ts`
2. **Revert Profiles**: Use Firestore console to remove `recovered` flag
3. **Manual Fix**: Contact affected users to recreate accounts

## Future Improvements

1. **Email Notification**: Notify users when profile is recovered
2. **Admin Dashboard**: Show list of recovered profiles
3. **Validation**: More robust profile validation
4. **Audit Log**: Track all recovery operations
