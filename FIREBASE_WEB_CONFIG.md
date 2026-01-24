# Firebase Web FCM Configuration
# Add these to your .env.local file

# These should already be in your .env.local from existing Firebase setup
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# NEW: VAPID Key for Web Push Notifications (FCM)
# Get this from Firebase Console > Project Settings > Cloud Messaging > Web Push certificates
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key_here

## Integration Notes:

✅ Uses your existing Firebase app from `src/lib/firebase-setup.ts`
✅ No duplicate Firebase initialization
✅ Integrates with your existing `PushNotificationListener.tsx`
✅ Works alongside Android FCM notifications

## Testing:
1. Add the VAPID key to your .env.local
2. Build and deploy your app
3. Grant notification permissions when prompted
4. Test by sending a message from Firebase Console
