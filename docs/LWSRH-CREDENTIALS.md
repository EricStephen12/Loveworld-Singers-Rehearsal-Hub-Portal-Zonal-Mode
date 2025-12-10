# Credentials Handover

⚠️ Keep this private. Don't share or commit to git.

---

## Service Logins

**Firebase**
- Console: https://console.firebase.google.com/project/loveworld-singers-app
- Login with: [your email]
- Password: [your password]

**Supabase**
- Dashboard: https://supabase.com/dashboard/project/dumhphyhvnyyqnmnahno
- Login with: [your email]
- Password: [your password]

**Cloudinary**
- Console: https://cloudinary.com/console
- Login with: [your email]
- Password: [your password]

**Vercel** (or wherever it's hosted)
- URL: [hosting dashboard url]
- Login with: [your email]

**GitHub**
- Repo: [repo url]
- Make sure you have push access

---

## Environment Variables

Copy this to `.env.local`:

```
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://dumhphyhvnyyqnmnahno.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[get from supabase dashboard]

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dvtjjt3js
NEXT_PUBLIC_CLOUDINARY_API_KEY=[get from cloudinary]
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=loveworld-singers
CLOUDINARY_API_SECRET=[get from cloudinary]

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=[from firebase console]
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=loveworld-singers-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=loveworld-singers-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=loveworld-singers-app.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=[from firebase]
NEXT_PUBLIC_FIREBASE_APP_ID=[from firebase]
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=[from firebase]

# Firebase Admin (for server-side stuff)
NEXT_PUBLIC_FIREBASE_ADMIN_PROJECT_ID=loveworld-singers-app
NEXT_PUBLIC_FIREBASE_ADMIN_CLIENT_EMAIL=[service account email]
NEXT_PUBLIC_FIREBASE_ADMIN_PRIVATE_KEY=[the long private key]

# KingsChat
NEXT_PUBLIC_KINGSCHAT_CLIENT_ID=331c9eda-a130-4bb8-9a00-9231a817207d
KINGSCHAT_CLIENT_SECRET=[get from kingschat dev portal]

# Paystack (if using)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=[if configured]
PAYSTACK_SECRET_KEY=[if configured]
```

---

## Handover Checklist

- [ ] Firebase console access transferred
- [ ] Supabase access transferred
- [ ] Cloudinary access transferred
- [ ] Hosting (Vercel/etc) access transferred
- [ ] GitHub repo access granted
- [ ] .env.local file shared securely
- [ ] Tested login on new machine
- [ ] Ran `npm run dev` successfully

---

Date: ___________

Handed over by: Eric Stephen

Received by: ___________
