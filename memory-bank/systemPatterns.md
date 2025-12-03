## System Patterns

- **Framework**: Next.js App Router with Turbopack builds, React 19, TypeScript, Tailwind/PostCSS styling, heavy client components under `src/app/pages`.
- **Data**: Supabase auth helpers, Firebase sdk, custom hooks under `src/hooks` for realtime data, notifications, countdown, etc.
- **State**: Zustand stores (`authStore`, `zoneStore`) plus React context for audio/subscription/ultra-fast data.
- **Media**: Custom media players (audio/video) inside `pages/media`, integrates with `react-player`.
- **Infra**: Next.js API routes for payments (KingsPay), notifications, translation, countdown, audio streaming proxy.
- **Performance**: Ultra-fast/offline features, service workers in `public/`, multiple Next configs for specialized builds.














