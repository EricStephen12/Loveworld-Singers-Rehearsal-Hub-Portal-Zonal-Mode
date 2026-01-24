# LWSRH - LoveWorld Singers Rehearsal Hub

A Progressive Web App (PWA) for managing praise and worship rehearsals, media, and communications for LoveWorld Singers.

## Tech Stack

- **Framework**: Next.js 15 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **Database**: Supabase (auth & data) + Firebase (realtime features)
- **Media**: Cloudinary (storage) + YouTube integration
- **State**: Zustand stores + React Context
- **PWA**: Custom service workers with offline-first architecture

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment file and configure
cp .env.example .env.local
# Edit .env.local with your credentials
```

### Environment Variables

Create `.env.local` with:

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_preset
CLOUDINARY_API_SECRET=your_secret

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Development

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes (payments, notifications, etc.)
│   ├── auth/              # Authentication pages
│   ├── admin/             # Admin panel
│   ├── pages/             # Feature pages
│   │   ├── praise-night/  # Praise night events
│   │   ├── media/         # Media player & library
│   │   ├── groups/        # Chat & group features
│   │   ├── calendar/      # Event scheduling
│   │   ├── profile/       # User profiles
│   │   └── ...
│   ├── layout.tsx         # Root layout (providers setup)
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui base components
│   ├── admin/            # Admin-specific components
│   └── ...               # Feature components
├── contexts/             # React Context providers
│   ├── AudioContext.tsx  # Audio player state
│   ├── SubscriptionContext.tsx
│   └── UltraFastDataContext.tsx
├── hooks/                # Custom React hooks
├── lib/                  # Services & utilities
│   ├── supabase-client.ts
│   ├── firebase-database.ts
│   ├── cloudinary.ts
│   └── ...
├── stores/               # Zustand state stores
│   ├── authStore.ts      # Authentication state
│   └── zoneStore.ts      # Zone/group state
├── types/                # TypeScript definitions
└── utils/                # Utility functions
```

## Key Features

- **Praise Night Management**: Organize events with song listings
- **Media Player**: Audio/video player with multi-phase support
- **Offline Support**: Full offline functionality via service workers
- **Real-time Chat**: Group communications
- **Admin Panel**: Content & user management
- **Zone System**: Multi-tenant support for different groups

## Architecture Notes

### Provider Hierarchy (layout.tsx)

```
ErrorBoundary
└── AudioProvider (global audio state)
    └── MediaProvider (media library)
        └── SubscriptionProvider (subscription status)
            └── ChatProvider (messaging)
                └── AnalyticsProvider
                    └── [App Content]
```

### Service Workers

- `sw-optimized.js` - Main production service worker (active)
- `sw-custom.js` - Custom caching strategies
- Other SW files are legacy/experimental

### State Management

- **Zustand**: `authStore` (user auth), `zoneStore` (current zone)
- **Context**: Audio playback, subscriptions, media, chat

## API Routes

| Route | Purpose |
|-------|---------|
| `/api/audio/*` | Audio streaming proxy |
| `/api/cloudinary/*` | Media upload handling |
| `/api/notifications/*` | Push notifications |
| `/api/kingspay/*` | Payment processing |
| `/api/translate/*` | Translation service |

## Contributing

1. Follow existing code patterns
2. Use TypeScript strictly
3. Components go in `src/components/`
4. Business logic goes in `src/lib/`
5. Keep hooks in `src/hooks/`

## Documentation

Additional context available in:
- `memory-bank/` - Project context & progress
- `.kiro/steering/` - Coding conventions & standards
