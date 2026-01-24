# Technology Stack

## Framework & Runtime
- **Next.js 15** with App Router and Turbopack
- **React 19** with TypeScript
- **Node.js 18+** required

## Styling & UI
- **Tailwind CSS v4** for styling with PostCSS
- **shadcn/ui** components built on Radix UI primitives
- **class-variance-authority (CVA)** for component variants
- **Lucide React** for icons
- **Custom CSS variables** for theming

## Database & Backend
- **Supabase** for database and authentication
- **Cloudinary** for media storage and management
- **API Routes** in Next.js for server-side logic

## PWA & Performance
- **next-pwa** with Workbox for service worker
- **Custom service worker** (`sw-custom.js`) for advanced caching
- **Offline-first** architecture with multiple caching strategies

## Development Tools
- **TypeScript** with strict mode enabled
- **ESLint** with Next.js and TypeScript configs
- **Turbopack** for fast development builds

## Common Commands

### Development
```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production with Turbopack
npm start            # Start production server
npm run lint         # Run ESLint
```

### Environment Setup
- Copy `.env.local` and configure Supabase and Cloudinary credentials
- Ensure Node.js 18+ is installed
- Run `npm install` to install dependencies

## Build Configuration
- **Production builds** remove console logs automatically
- **TypeScript errors** are ignored during builds (configured)
- **ESLint errors** are ignored during builds (configured)
- **Security headers** are automatically applied
- **PWA manifest** and service worker are generated automatically