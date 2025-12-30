# Implementation Plan: Code Refactoring

## Overview

This plan organizes the refactoring work into 4 phases, progressing from low-risk foundation files to higher-visibility page components. Each phase includes verification checkpoints to ensure no functionality is broken.

---

## Phase 1: Foundation (Hooks & Utils)

- [x] 1. Refactor custom hooks
  - [x] 1.1 Refactor `src/hooks/useAuth.ts`
    - Remove verbose comments, organize imports, simplify error handling
    - _Requirements: 1.1, 1.2, 3.1, 4.1, 4.2_
  - [x] 1.2 Refactor `src/hooks/useZone.ts`
    - Remove verbose comments, organize imports
    - _Requirements: 1.1, 1.2, 4.1, 4.2_
  - [x] 1.3 Refactor `src/hooks/useNotifications.ts`
    - Remove verbose comments, organize imports, simplify error handling
    - _Requirements: 1.1, 1.2, 3.1, 4.1_
  - [x] 1.4 Refactor `src/hooks/useRealtimeNotifications.ts`
    - Remove verbose comments, organize imports
    - _Requirements: 1.1, 1.2, 4.1, 4.2_
  - [x] 1.5 Refactor `src/hooks/useAnalytics.ts`
    - Remove verbose comments, organize imports
    - _Requirements: 1.1, 1.2, 4.1_
  - [x] 1.6 Refactor `src/hooks/useOfflineStatus.ts`
    - Remove verbose comments, organize imports
    - _Requirements: 1.1, 1.2, 4.1_
  - [x] 1.7 Refactor `src/hooks/useRealtimeData.ts`
    - Remove verbose comments, organize imports, simplify error handling
    - _Requirements: 1.1, 1.2, 3.1, 4.1_
  - [x] 1.8 Refactor `src/hooks/useUltraFastData.ts`
    - Remove verbose comments, organize imports
    - _Requirements: 1.1, 1.2, 4.1_
  - [x] 1.9 Refactor remaining hooks (batch)
    - `useAdminData.ts`, `useFeatureAccess.ts`, `useGlobalSearch.ts`, `useHomeGlobalSearch.ts`
    - `useInstantUpdates.ts`, `useLowDataOptimized.ts`, `useMemberRehearsals.ts`
    - `useMinimumLoadingTime.ts`, `useMobileDetection.ts`, `usePageSearch.ts`
    - `usePerformance.ts`, `useRealtimeComments.ts`, `useRealtimeSongData.ts`
    - `useServerCountdown.ts`, `useSubGroup.ts`, `useSupabaseData.ts`
    - `useUltraFastProfile.ts`, `useUltraFastProfileSimple.ts`, `useUltraFastSongHistory.ts`
    - `useUltraFastSupabase.ts`, `useWebsiteStyleData.ts`
    - _Requirements: 1.1, 1.2, 4.1, 4.2_

- [x] 2. Refactor utility files
  - [x] 2.1 Refactor `src/lib/utils.ts`
    - Remove verbose comments, organize imports
    - _Requirements: 1.1, 1.2, 4.1_
  - [x] 2.2 Refactor `src/config/zones.ts`
    - Remove verbose comments, organize imports
    - _Requirements: 1.1, 1.2, 4.1_

- [-] 3. Phase 1 Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

---

## Phase 2: Services (Firebase & API Services)

- [x] 4. Refactor Firebase services
  - [x] 4.1 Refactor `src/lib/firebase-setup.ts`
    - Remove verbose comments, organize imports, simplify error handling
    - _Requirements: 1.1, 1.2, 3.1, 4.1_
  - [x] 4.2 Refactor `src/lib/firebase-database.ts`
    - Remove verbose comments, organize imports, simplify error handling
    - _Requirements: 1.1, 1.2, 3.1, 4.1_
  - [x] 4.3 Refactor `src/lib/firebase-auth.ts`
    - Remove verbose comments, organize imports, simplify error handling
    - _Requirements: 1.1, 1.2, 3.1, 4.1_
  - [x] 4.4 Refactor `src/lib/firebase-comment-service.ts`
    - Remove verbose comments, organize imports, split long functions if needed
    - _Requirements: 1.1, 1.2, 4.1, 5.1, 5.2_

- [x] 5. Refactor zone and database services
  - [x] 5.1 Refactor `src/lib/zone-database-service.ts`
    - Remove verbose comments, organize imports, simplify error handling
    - _Requirements: 1.1, 1.2, 3.1, 4.1_
  - [x] 5.2 Refactor `src/lib/zone-aware-songs-service.ts`
    - Remove verbose comments, organize imports
    - _Requirements: 1.1, 1.2, 4.1_
  - [x] 5.3 Refactor `src/lib/zone-invitation-service.ts`
    - Remove verbose comments, organize imports
    - _Requirements: 1.1, 1.2, 4.1_

- [x] 6. Refactor media services
  - [x] 6.1 Refactor `src/lib/media-videos-service.ts`
    - Remove verbose comments, organize imports, split long functions
    - _Requirements: 1.1, 1.2, 4.1, 5.1, 5.2_
  - [x] 6.2 Refactor `src/lib/media-library-service.ts`
    - Remove verbose comments, organize imports
    - _Requirements: 1.1, 1.2, 4.1_
  - [x] 6.3 Refactor `src/lib/media-category-service.ts`
    - Remove verbose comments, organize imports
    - _Requirements: 1.1, 1.2, 4.1_
  - [x] 6.4 Refactor `src/lib/cloudinary-media-service.ts`
    - Remove verbose comments, organize imports, simplify error handling
    - _Requirements: 1.1, 1.2, 3.1, 4.1_

- [x] 7. Refactor notification and analytics services
  - [x] 7.1 Refactor `src/lib/simple-notifications-service.ts`
    - Remove verbose comments, organize imports, simplify error handling
    - _Requirements: 1.1, 1.2, 3.1, 4.1_
c  - [x] 7.2 Refactor `src/lib/analytics-aggregation-service.ts`
    - Remove verbose comments, organize imports
    - _Requirements: 1.1, 1.2, 4.1_

- [x] 8. Refactor remaining services (batch)
  - [x] 8.1 Refactor song-related services
    - `src/lib/praise-night-songs-service.ts`, `src/lib/songs-database.ts`
    - `src/lib/song-submission-service.ts`, `src/lib/master-library-service.ts`
    - _Requirements: 1.1, 1.2, 4.1, 5.1_
  - [x] 8.2 Refactor subscription and payment services
    - `src/lib/subscription-service.ts`, `src/lib/subscription-pricing.ts`
    - `src/lib/kingspay-service.ts`, `src/lib/espees-payment-service.ts`
    - _Requirements: 1.1, 1.2, 3.1, 4.1_
  - [x] 8.3 Refactor utility services
    - `src/lib/error-handler.ts`, `src/lib/smart-cache.ts`, `src/lib/ultra-fast-loader.ts`
    - `src/lib/performance-optimizer.ts`, `src/lib/session-manager.ts`
    - _Requirements: 1.1, 1.2, 4.1_
  - [x] 8.4 Refactor remaining lib files
    - `src/lib/account-linking.ts`, `src/lib/admin-activity-logger.ts`
    - `src/lib/admin-playlist-service.ts`, `src/lib/admin-support-debug.ts`
    - `src/lib/attendance-service.ts`, `src/lib/auto-notifications.ts`
    - `src/lib/backup-service.ts`, `src/lib/check-coordinator.ts`
    - `src/lib/cloudinary-setup.ts`, `src/lib/cloudinary-storage.ts`, `src/lib/cloudinary.ts`
    - `src/lib/database.ts`, `src/lib/debug-support.ts`, `src/lib/device-registration.ts`
    - `src/lib/hq-invitation-service.ts`, `src/lib/hq-members-service.ts`
    - `src/lib/kingschat-auth.ts`, `src/lib/message-interaction-service.ts`
    - `src/lib/subgroup-database-service.ts`, `src/lib/subgroup-service.ts`
    - `src/lib/supabase-client.ts`, `src/lib/supabase-support.ts`, `src/lib/supabase.ts`
    - `src/lib/translation-service.ts`, `src/lib/user-role-utils.ts`
    - `src/lib/videoUploadService.ts`, `src/lib/voice-recording-service.ts`
    - _Requirements: 1.1, 1.2, 3.1, 4.1_

- [x] 9. Phase 2 Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

---

## Phase 3: Components (UI & Admin)

- [x] 10. Refactor base UI components
  - [x] 10.1 Refactor `src/components/ui/` directory (batch)
    - Remove verbose comments, organize imports across all UI components
    - _Requirements: 1.1, 1.2, 4.1_

- [x] 11. Refactor core feature components
  - [x] 11.1 Refactor `src/components/AuthScreen.tsx`
    - Remove verbose comments, organize imports, split long functions
    - _Requirements: 1.1, 1.2, 4.1, 5.1, 5.2_
  - [x] 11.2 Refactor `src/components/MobileLayout.tsx`
    - Remove verbose comments, organize imports
    - _Requirements: 1.1, 1.2, 4.1_
  - [x] 11.3 Refactor `src/components/Members.tsx`
    - Remove verbose comments, organize imports, split long functions
    - _Requirements: 1.1, 1.2, 4.1, 5.1, 5.2_
  - [x] 11.4 Refactor `src/components/SongDetailModal.tsx`
    - Remove verbose comments, organize imports, split long functions
    - _Requirements: 1.1, 1.2, 4.1, 5.1, 5.2_
  - [x] 11.5 Refactor `src/components/MediaManager.tsx`
    - Remove verbose comments, organize imports, split long functions
    - _Requirements: 1.1, 1.2, 4.1, 5.1, 5.2_
  - [x] 11.6 Refactor `src/components/GlobalMiniPlayer.tsx`
    - Remove verbose comments, organize imports
    - _Requirements: 1.1, 1.2, 4.1_
  - [x] 11.7 Refactor `src/components/ZoneSwitcher.tsx`
    - Remove verbose comments, organize imports
    - _Requirements: 1.1, 1.2, 4.1_

- [x] 12. Refactor admin components
  - [x] 12.1 Refactor `src/components/admin/DashboardSection.tsx`
    - Remove verbose comments, organize imports, split long functions
    - _Requirements: 1.1, 1.2, 4.1, 5.1, 5.2_
  - [x] 12.2 Refactor `src/components/admin/MediaUploadSection.tsx`
    - Remove verbose comments, organize imports, split long functions
    - _Requirements: 1.1, 1.2, 4.1, 5.1, 5.2_
  - [x] 12.3 Refactor `src/components/admin/MasterLibrarySection.tsx`
    - Remove verbose comments, organize imports, split long functions
    - _Requirements: 1.1, 1.2, 4.1, 5.1, 5.2_
  - [x] 12.4 Refactor `src/components/admin/NotificationsSection.tsx`
    - Remove verbose comments, organize imports
    - _Requirements: 1.1, 1.2, 4.1_
  - [x] 12.5 Refactor `src/components/admin/AnalyticsSection.tsx`
    - Remove verbose comments, organize imports
    - _Requirements: 1.1, 1.2, 4.1_
  - [x] 12.6 Refactor `src/components/admin/MembersSection.tsx`
    - Remove verbose comments, organize imports, split long functions
    - _Requirements: 1.1, 1.2, 4.1, 5.1, 5.2_
  - [x] 12.7 Refactor remaining admin components (batch)
    - `AdminMobileHeader.tsx`, `AdminMobileNav.tsx`, `AdminModals.tsx`
    - `AdminSidebar.tsx`, `AdminThemeProvider.tsx`, `AudioLabSongsSection.tsx`
    - `BackupManager.tsx`, `CalendarSection.tsx`, `CategoriesSection.tsx`
    - `MasterEditSongModal.tsx`, `MasterSongDetailSheet.tsx`, `MediaSection.tsx`
    - `PageCategoriesSection.tsx`, `PagesSection.tsx`, `PlaylistsSection.tsx`
    - `SimpleNotificationsSection.tsx`, `SongSubmissionBadge.tsx`, `SubGroupsSection.tsx`
    - _Requirements: 1.1, 1.2, 4.1, 5.1_

- [x] 13. Refactor remaining feature components (batch)
  - [x] 13.1 Refactor authentication and profile components
    - `AuthCheck.tsx`, `AuthModal.tsx`, `ProfileCompletionScreen.tsx`
    - `ProfileRecoveryButton.tsx`, `SubscriptionCheck.tsx`, `SubscriptionOnboardingScreen.tsx`
    - _Requirements: 1.1, 1.2, 4.1_
  - [x] 13.2 Refactor notification and realtime components
    - `NotificationBanner.tsx`, `NotificationUrlHandler.tsx`, `PushNotificationListener.tsx`
    - `RealtimeNotifications.tsx`, `RealtimeUpdateIndicator.tsx`
    - _Requirements: 1.1, 1.2, 4.1_
  - [x] 13.3 Refactor media and player components
    - `MiniPlayer.tsx`, `AudioWave.tsx`, `YouTubeThumbnail.tsx`
    - `MediaSelectionModal.tsx`, `OptimizedImage.tsx`, `UltraFastImage.tsx`
    - _Requirements: 1.1, 1.2, 4.1_
  - [x] 13.4 Refactor remaining components
    - All remaining components in `src/components/`
    - _Requirements: 1.1, 1.2, 4.1_

- [x] 14. Phase 3 Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

---

## Phase 4: Pages (Feature Pages)

- [x] 15. Refactor main pages
  - [x] 15.1 Refactor `src/app/home/page.tsx`
    - Remove verbose comments, organize imports, split long functions
    - _Requirements: 1.1, 1.2, 4.1, 5.1, 5.2_
  - [x] 15.2 Refactor `src/app/auth/page.tsx`
    - Remove verbose comments, organize imports
    - _Requirements: 1.1, 1.2, 4.1_
  - [x] 15.3 Refactor `src/app/admin/page.tsx`
    - Remove verbose comments, organize imports, split long functions
    - _Requirements: 1.1, 1.2, 4.1, 5.1, 5.2_

- [x] 16. Refactor feature pages
  - [x] 16.1 Refactor `src/app/pages/praise-night/page.tsx`
    - Remove verbose comments, organize imports, split long functions
    - _Requirements: 1.1, 1.2, 4.1, 5.1, 5.2_
  - [x] 16.2 Refactor `src/app/pages/media/page.tsx`
    - Remove verbose comments, organize imports, split long functions
    - _Requirements: 1.1, 1.2, 4.1, 5.1, 5.2_
  - [x] 16.3 Refactor `src/app/pages/groups/page.tsx`
    - Remove verbose comments, organize imports, split long functions
    - _Requirements: 1.1, 1.2, 4.1, 5.1, 5.2_
  - [x] 16.4 Refactor `src/app/pages/profile/page.tsx`
    - Remove verbose comments, organize imports
    - _Requirements: 1.1, 1.2, 4.1_
  - [x] 16.5 Refactor `src/app/pages/notifications/page.tsx`
    - Remove verbose comments, organize imports
    - _Requirements: 1.1, 1.2, 4.1_
  - [x] 16.6 Refactor `src/app/pages/calendar/` pages
    - Remove verbose comments, organize imports across calendar pages
    - _Requirements: 1.1, 1.2, 4.1_
  - [x] 16.7 Refactor `src/app/pages/audiolab/` pages
    - Remove verbose comments, organize imports across audiolab pages
    - _Requirements: 1.1, 1.2, 4.1, 5.1_
  - [x] 16.8 Refactor remaining feature pages
    - `src/app/pages/join-zone/`, `src/app/pages/submit-song/`
    - `src/app/pages/rehearsals/`, `src/app/pages/subgroup-rehearsal/`
    - `src/app/pages/all-ministered-songs/`, `src/app/pages/support/`
    - _Requirements: 1.1, 1.2, 4.1_

- [x] 17. Refactor page-specific components and services
  - [x] 17.1 Refactor `src/app/pages/media/_components/` and `_lib/`
    - Remove verbose comments, organize imports across media components and services
    - _Requirements: 1.1, 1.2, 4.1, 5.1_
  - [x] 17.2 Refactor `src/app/pages/groups/_components/` and `_lib/`
    - Remove verbose comments, organize imports across groups components and services
    - _Requirements: 1.1, 1.2, 4.1, 5.1_
  - [x] 17.3 Refactor `src/app/pages/audiolab/_components/` and `_lib/`
    - Remove verbose comments, organize imports across audiolab components and services
    - _Requirements: 1.1, 1.2, 4.1, 5.1_
  - [x] 17.4 Refactor `src/app/pages/calendar/_lib/`
    - Remove verbose comments, organize imports across calendar services
    - _Requirements: 1.1, 1.2, 4.1_

- [x] 18. Refactor contexts and stores
  - [x] 18.1 Refactor `src/contexts/AuthContext.tsx`
    - Remove verbose comments, organize imports, simplify error handling
    - _Requirements: 1.1, 1.2, 3.1, 4.1_
  - [x] 18.2 Refactor `src/contexts/SubscriptionContext.tsx`
    - Remove verbose comments, organize imports
    - _Requirements: 1.1, 1.2, 4.1_
  - [x] 18.3 Refactor `src/stores/authStore.ts`
    - Remove verbose comments, organize imports
    - _Requirements: 1.1, 1.2, 4.1_
  - [x] 18.4 Refactor `src/stores/zoneStore.ts`
    - Remove verbose comments, organize imports
    - _Requirements: 1.1, 1.2, 4.1_
  - [x] 18.5 Refactor `src/stores/chatStore.ts`
    - Remove verbose comments, organize imports
    - _Requirements: 1.1, 1.2, 4.1_

- [x] 19. Refactor utils directory
  - [x] 19.1 Refactor `src/utils/analytics.ts`
    - Remove verbose comments, organize imports
    - _Requirements: 1.1, 1.2, 4.1_
  - [x] 19.2 Refactor remaining utils
    - `media-cache.ts`, `calendar-cache.ts`, `whatsapp-migration.ts`
    - `profile-recovery.ts`, `bulk-profile-recovery.ts`, `migration-permission-check.ts`
    - _Requirements: 1.1, 1.2, 4.1_

- [x] 20. Final Checkpoint
  - Ensure all tests pass, ask the user if questions arise.

---

## Property-Based Testing Tasks

- [ ]* 21. Set up property-based testing infrastructure
  - [ ]* 21.1 Install fast-check library
    - Run `npm install --save-dev fast-check`
    - _Requirements: 7.2_
  - [ ]* 21.2 Create test directory structure
    - Create `src/__tests__/refactoring/` directory
    - _Requirements: 7.2_

- [ ]* 22. Implement property-based tests
  - [ ]* 22.1 Write property test for import organization
    - **Property 2: Import Organization**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4**
  - [ ]* 22.2 Write property test for TODO/FIXME preservation
    - **Property 5: TODO/FIXME Preservation**
    - **Validates: Requirements 1.3**
  - [ ]* 22.3 Write property test for function length reduction
    - **Property 4: Function Length Reduction**
    - **Validates: Requirements 5.1**
  - [ ]* 22.4 Write property test for code pattern preservation
    - **Property 3: Code Pattern Preservation**
    - **Validates: Requirements 3.2, 8.2, 8.4**

---

## Notes

- Each task should be committed separately with clear commit messages
- Run `npm run build` after each file refactoring to verify no errors
- If any issues arise, use `git revert <commit-hash>` to rollback
- Tasks marked with * are optional and can be skipped for faster MVP
