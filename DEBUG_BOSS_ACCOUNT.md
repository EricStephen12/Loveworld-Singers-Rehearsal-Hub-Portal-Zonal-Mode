# Debug Boss Account Issue

## Steps to Debug

### 1. Check Browser Console
After creating a Boss account with `BOSS101`, check the browser console for these logs:

```
👑 Boss Mode activated for user: [your-email]
🔍 Home Page Zone Check: {
  currentZone: undefined,
  isBoss: true,  // <-- This should be TRUE
  profileRole: 'boss',  // <-- This should be 'boss'
  profileEmail: '[your-email]',
  zoneLoading: false
}
```

### 2. Check Firebase Database
Go to your Firebase Console → Firestore Database → `profiles` collection

Find your user document and verify:
```json
{
  "id": "user-id",
  "email": "your-email@example.com",
  "role": "boss",  // <-- Must be 'boss'
  "administration": "Boss",
  "first_name": "Your Name",
  // ... other fields
}
```

### 3. Check ZoneContext Logs
Look for these logs in console:
```
🔍 Loading zones for user: your-email@example.com
👑 Boss detected - access to all zones (read-only)
```

## Common Issues

### Issue 1: Profile role is not 'boss'
**Symptom:** `profileRole: 'user'` or `profileRole: undefined` in console

**Solution:** The profile wasn't created with boss role. Try:
1. Delete the account from Firebase Auth
2. Delete the profile from Firestore
3. Sign up again with `BOSS101` code

### Issue 2: Profile not loaded yet
**Symptom:** `profileRole: undefined` and `profileEmail: undefined`

**Solution:** Profile is still loading. Wait a moment and refresh the page.

### Issue 3: Email doesn't start with 'boss'
**Symptom:** Email is something like `test@example.com`

**Solution:** Either:
- Use an email that starts with `boss` (e.g., `boss@example.com`)
- OR make sure the `role` field in database is set to `'boss'`

## Manual Fix

If you already created an account and it's not working:

### Option 1: Update Existing Profile
1. Go to Firebase Console → Firestore
2. Find your profile document
3. Edit it and add/update:
   - `role`: `boss`
   - `administration`: `Boss`
4. Refresh the app

### Option 2: Use Boss Email
1. Create a new account with email starting with `boss`
   - Example: `boss@example.com`, `boss1@test.com`
2. Use any zone code (or `BOSS101`)
3. The email prefix will trigger boss mode

## Test Commands

### Check if Boss Detection Works
Open browser console and run:
```javascript
// Check profile
console.log('Profile:', localStorage.getItem('userProfile'))

// Check auth
console.log('User:', localStorage.getItem('userAuthenticated'))
```

### Force Boss Mode (Temporary Test)
In browser console:
```javascript
// This is just for testing - won't persist
localStorage.setItem('forceBossMode', 'true')
location.reload()
```

## Expected Flow

1. **Signup with BOSS101**
   - Enter `BOSS101` as zone code
   - See "Boss Mode - Full Access"
   - Complete signup form
   - Submit

2. **Account Creation**
   - Console shows: `👑 Boss Mode activated for user: [email]`
   - Profile created with `role: 'boss'`
   - No zone membership created

3. **Redirect to Home**
   - ZoneContext loads: `👑 Boss detected - access to all zones`
   - Home page checks: `isBoss: true`
   - No "No Zone Assigned" error
   - Can access all features

4. **Boss Dashboard**
   - Menu shows "Boss Dashboard" with Crown icon
   - Navigate to `/boss`
   - See all 86 zones with members

## Still Not Working?

If you've tried everything above and it's still not working, share:
1. Console logs from signup
2. Console logs from home page
3. Screenshot of your profile document in Firestore
4. The email you used for signup
