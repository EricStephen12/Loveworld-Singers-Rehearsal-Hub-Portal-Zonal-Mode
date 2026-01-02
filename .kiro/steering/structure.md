# Project Structure & Conventions

## Directory Organization

### Core App Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with PWA setup
│   ├── page.tsx           # Home page
│   ├── globals.css        # Global styles and CSS variables
│   ├── api/               # API routes
│   └── pages/             # Feature pages (praise-night, admin, etc.)
├── components/            # Reusable React components
│   └── ui/               # shadcn/ui components
├── lib/                  # Utility libraries and configurations
├── hooks/                # Custom React hooks
├── contexts/             # React Context providers
├── data/                 # Static data and configurations
├── types/                # TypeScript type definitions
└── utils/                # Utility functions
```

### Public Assets
```
public/
├── images/               # Static images
├── audio/                # Audio files
├── video/                # Video files
├── manifest.json         # PWA manifest
├── sw-custom.js          # Custom service worker
└── [icons and favicons]  # App icons
```

## Naming Conventions

### Files & Directories
- **Components**: PascalCase (e.g., `AuthScreen.tsx`, `MiniPlayer.tsx`)
- **Pages**: lowercase with hyphens (e.g., `praise-night/`, `profile-completion/`)
- **Utilities**: camelCase (e.g., `offlineManager.ts`, `supabase-client.ts`)
- **Types**: camelCase with descriptive names (e.g., `supabase.ts`)

### Code Conventions
- **React Components**: PascalCase with descriptive names
- **Functions**: camelCase starting with verbs
- **Constants**: UPPER_SNAKE_CASE
- **CSS Classes**: Tailwind utility classes preferred

## Component Architecture

### UI Components (`src/components/ui/`)
- Built with shadcn/ui patterns
- Use CVA for variants
- Forward refs for proper composition
- Export both component and variants

### Feature Components (`src/components/`)
- Single responsibility principle
- Use custom hooks for logic
- Implement proper TypeScript interfaces
- Include proper error boundaries

### Layout Components
- Mobile-first responsive design
- Touch-optimized interactions (44px minimum touch targets)
- PWA-optimized with proper meta tags
- Consistent navigation patterns

## Styling Guidelines

### CSS Architecture
- **Tailwind CSS** for utility-first styling
- **CSS Variables** for theming in `:root`
- **Custom classes** only for complex animations or PWA optimizations
- **Mobile-first** responsive design approach

### Typography System
- **Inter**: Primary font for body text
- **Poppins**: Display font for headings and UI
- **Outfit**: Alternative heading font
- Font loading with `display: swap` for performance

### PWA Optimizations
- Touch-friendly interactions with `.touch-target` class
- Prevent zoom on input focus (16px font size minimum)
- Remove tap highlights and focus outlines for app-like feel
- Smooth scrolling and momentum scrolling support

## Data Management

### State Management
- **React Context** for global state (AudioContext)
- **Local state** with useState for component-specific data
- **Custom hooks** for data fetching and business logic

### API Integration
- **Supabase client** in `src/lib/supabase-client.ts`
- **API routes** in `src/app/api/` for server-side operations
- **Type-safe** database operations with generated types

### File Organization Rules
- Group related functionality in dedicated directories
- Keep components small and focused
- Use barrel exports (`index.ts`) for clean imports
- Separate concerns: UI, logic, data, and types