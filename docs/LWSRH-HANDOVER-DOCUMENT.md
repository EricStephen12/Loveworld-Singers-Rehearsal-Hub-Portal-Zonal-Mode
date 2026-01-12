# LWSRH Handover Document

Hey! So you're taking over this project. Let me walk you through everything so you're not lost.

---

## What is this thing?

LWSRH (LoveWorld Singers Rehearsal Hub) is basically a PWA for choir members across different zones worldwide. Think of it as their all-in-one app for:

- Accessing songs and rehearsal materials
- Watching training videos (youtube style player)
- Chatting with their zone members (WhatsApp-style)
- Checking calendars and events
- Getting notifications about rehearsals

There are about 87 zones globally - Nigeria, South Africa, UK, USA, Canada, etc. Each zone has their own content, but HQ groups (the main 9 groups) see everything unfiltered.

---

## The Tech Stack

Here's what we're working with:

**Frontend:**
- Next.js 15 (App Router) with React 19
- TypeScript throughout
- Tailwind CSS v4 for styling
- Zustand for state management

**Backend/Services:**
- Firebase (Firestore) - this is the main database
- Supabase - legacy stuff, still used for some profiles
- Cloudinary - all media files (images, audio, video)
- KingsPay - payment integration

**The app is a PWA** so it works offline, has push notifications, can be installed on phones, etc.

---

## How to Run It

```bash
# Install everything
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Start production
npm start
```

You'll need a `.env.local` file. I'll give you the credentials separately (don't commit this file obviously).

---

## Project Structure - The Important Parts

```
src/
├── app/
│   ├── admin/          → Admin panel (coordinators use this)
│   ├── api/            → Backend API routes
│   ├── audiolab/       → Vocal practice studio
│   ├── auth/           → Login/signup
│   ├── boss/           → Super admin dashboard
│   ├── home/           → Main home after login
│   └── pages/
│       ├── calendar/   → Events, birthdays
│       ├── groups/     → The chat system
│       ├── media/      → Video streaming
│       ├── praise-night/ → Song listings
│       ├── profile/    → User profile
│       └── rehearsals/ → Rehearsal tracking
│
├── components/         → Reusable UI stuff
├── contexts/           → React contexts (Auth, Audio, Subscription)
├── hooks/              → Custom hooks
├── lib/                → Service files (this is where the magic happens)
├── stores/             → Zustand stores
└── config/zones.ts     → All 87 zones defined here
```

---

## The Zone System

This is important to understand. Users join zones using invitation codes:

- `ZONE001` to `ZONE087` = Regular member access
- `ZNL` + zone code (like `ZNLZONE001`) = Coordinator access
- `BOSS101` = Super admin (sees everything)

HQ groups (zone-001 to zone-005, plus orchestra, president, director, oftp zones) get unfiltered Firebase data. Regional zones get filtered data based on their zone_id.

Check `src/config/zones.ts` for the full list.

---

## Main Features & Where to Find Them

**1. Authentication**
- `src/contexts/AuthContext.tsx` - main auth logic
- `src/stores/authStore.ts` - auth state
- Firebase Auth for email/password
- KingsChat OAuth also supported

**2. Songs/Praise Night**
- `src/app/pages/praise-night/page.tsx` - the song list page
- `src/lib/praise-night-songs-service.ts` - CRUD operations
- Songs have multiple audio phases (verse, chorus, etc.) and vocal parts

**3. Media Player (youtube-style)**
- `src/app/pages/media/` - the whole media section
- `src/lib/media-videos-service.ts` - video service
- Uses react-player, supports YouTube too
- Has playlists, watch history, categories

**4. Chat System (WhatsApp-style)**
- `src/app/pages/groups/` - chat interface
- `src/stores/chatStore.ts` - chat state
- Collections: `whatsapp_chats`, `whatsapp_messages`, `whatsapp_users`
- Real-time with Firebase listeners

**5. Calendar**
- `src/app/pages/calendar/` - events and birthdays
- `src/app/pages/calendar/_lib/` - services for events, birthdays

**6. Admin Panel**
- `src/app/admin/page.tsx` - main admin page
- `src/components/admin/` - all admin components
- Coordinators and boss users can access this

**7. Notifications**
- `src/lib/simple-notifications-service.ts` - notification logic
- `src/hooks/useRealtimeNotifications.ts` - real-time listener
- Push notifications + in-app notifications

---

## Firebase Collections (The Database)

Here are the main ones you'll work with:

**User stuff:**
- `profiles` - user profiles
- `zones` - zone configs
- `zone_members` - who's in which zone

**Content:**
- `praise_night_songs` - the songs
- `media_videos` - videos
- `categories` - song categories
- `page_categories` - page sections

**Chat:**
- `whatsapp_users` - chat profiles
- `whatsapp_chats` - chat rooms
- `whatsapp_messages` - messages

**Other:**
- `notifications` - push notifications
- `calendar_events` - events
- `birthdays` - member birthdays
- `submitted_songs` - song submissions from users
- `analytics_events` - usage tracking

The Firestore rules are in `firestore.rules`. They're pretty open right now because the admin panel uses localStorage auth (not Firebase Auth). Something to tighten up later if needed.

---

## API Routes

```
/api/auth/reset-password  → Password reset
/api/notifications        → Send/get notifications
/api/translate            → Text translation
/api/countdown            → Server countdown timer
/api/kingspay/*           → Payment stuff
/api/payment/*            → Paystack payments
/api/cloudinary/delete    → Delete media files
/api/analytics/migrate    → Analytics migration
```

---

## Third-Party Services

**Firebase Console**
- Project: `loveworld-singers-app`
- URL: https://console.firebase.google.com


**Cloudinary**
- Cloud name: `dvtjjt3js`
- URL: https://cloudinary.com/console

**KingsChat**
- Client ID: `331c9eda-a130-4bb8-9a00-9231a817207d`

---

## Admin Access

These emails have admin rights (hardcoded in Firestore rules):
- ihenacho23@gmail.com
- ephraimloveworld1@gmail.com
- takeshopstores@gmail.com
- nnennawealth@gmail.com

Super admin bypass:
- Email: superadmin@lwsrh.com
- UID: super-admin-bypass

---

## Things to Know

**Build quirks:**
- TypeScript errors are ignored during builds (configured in next.config.js)
- ESLint errors also ignored during builds
- Console logs are stripped in production

**The service worker:**
- Multiple SW files in `/public/` (sw-custom.js is the main one)
- Handles offline caching, push notifications
- Uses Workbox under the hood

**State management:**
- Zustand stores for auth, zone, chat
- React contexts for audio player, subscription status
- Custom hooks for most data fetching

---

## Stuff That Could Be Better

1. Firestore rules are too permissive - works but not ideal for security
2. Some legacy Supabase code still hanging around
3. TypeScript errors being ignored means there might be hidden issues
4. Could use better error logging (Sentry or something)

---

## Credentials

I'll send these separately. You'll need:
- Firebase service account
- Supabase keys
- Cloudinary API keys
- KingsChat client secret

Don't commit `.env.local` to git.

---

## Quick Reference

| What | Where |
|------|-------|
| Run dev | `npm run dev` |
| Admin panel | `/admin` |
| Boss dashboard | `/boss` |
| Zone config | `src/config/zones.ts` |
| Auth logic | `src/contexts/AuthContext.tsx` |
| Firebase setup | `src/lib/firebase-setup.ts` |
| Main services | `src/lib/*.ts` |

---

That's pretty much it. The codebase is organized, just follow the patterns already there. If something breaks, check the browser console and Firebase logs first.

Good luck! 🤙
