/**
 * Media Library - Standalone Module
 * 
 * Complete Firebase-based media management system
 * Can be easily copied to other projects
 * 
 * Features:
 * - Media CRUD operations
 * - Watch history tracking
 * - Favorites management
 * - File uploads to Firebase Storage
 * - Real-time subscriptions
 */

// Firebase setup
export { db, storage } from '@/lib/firebase-setup'

// Media service
export { firebaseMediaService, firebaseMediaService as mediaService } from './firebase-media-service'
export { default } from './firebase-media-service'


// Types
export type { 
  MediaItem, 
  Genre, 
  UserWatchHistory,
  UserFavorite 
} from './firebase-media-service'


