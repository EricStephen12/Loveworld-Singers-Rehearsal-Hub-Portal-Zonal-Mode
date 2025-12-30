/**
 * Media Service
 * 
 * Wrapper around Firebase media operations
 * All media-related business logic goes here
 */

import firebaseMediaService from './firebase-media-service'

// Re-export types
export type { MediaItem, Genre, UserWatchHistory } from './firebase-media-service'

// Re-export the service
export { default as mediaService } from './firebase-media-service'
export default firebaseMediaService
