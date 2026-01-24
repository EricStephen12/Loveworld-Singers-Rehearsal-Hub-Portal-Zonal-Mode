// Firebase Media Service - Netflix-style media management
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore'
import { db } from '@/lib/firebase-setup'

// Types
export interface MediaItem {
  id: string
  title: string
  description: string
  thumbnail: string
  videoUrl: string
  youtubeUrl?: string
  backdropImage?: string
  genre: string[]
  type: string
  duration?: number
  releaseYear?: number
  rating?: number
  views: number
  likes: number
  featured: boolean
  hidden?: boolean // When true, video is hidden from main media page but still visible in playlists
  isYouTube?: boolean
  forHQ?: boolean
  createdByName?: string
  createdAt: Date
  updatedAt: Date
}

export interface Genre {
  id: string
  name: string
  slug: string
}

export interface UserWatchHistory {
  id: string
  userId: string
  mediaId: string
  progress: number // percentage watched
  lastWatched: Date
}

export interface UserFavorite {
  id: string
  userId: string
  mediaId: string
  createdAt: Date
}

class FirebaseMediaService {
  // Changed to media_videos collection for unified video management
  private mediaCollection = 'media_videos'
  private genresCollection = 'media_genres'
  private watchHistoryCollection = 'watch_history'
  private favoritesCollection = 'user_favorites'

  // ==================== MEDIA ITEMS ====================

  async createMedia(mediaData: Omit<MediaItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.mediaCollection), {
        ...mediaData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })
      return docRef.id
    } catch (error) {
      console.error('Error creating media:', error)
      throw error
    }
  }

  // Helper to map Firestore docs to MediaItem
  private mapDoc(doc: any): MediaItem {
    const data = doc.data()
    return {
      id: doc.id,
      title: data.title || '',
      description: data.description || '',
      thumbnail: data.thumbnail || '',
      videoUrl: data.videoUrl || '',
      youtubeUrl: data.youtubeUrl,
      backdropImage: data.backdropImage,
      genre: data.genre || [],
      type: data.type || 'other',
      duration: data.duration,
      releaseYear: data.releaseYear,
      rating: data.rating,
      views: data.views || 0,
      likes: data.likes || 0,
      featured: data.featured || false,
      hidden: data.hidden || false,
      isYouTube: data.isYouTube || false,
      forHQ: data.forHQ !== false,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date()
    }
  }

  // OPTIMIZED: Added pagination support with default limit
  // Filters out hidden videos by default
  async getAllMedia(limitCount: number = 24): Promise<MediaItem[]> {
    try {
      const q = query(
        collection(db, this.mediaCollection),
        where('hidden', '!=', true),
        orderBy('hidden'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      )
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => this.mapDoc(doc))
    } catch (error) {
      console.error('Error fetching media:', error)
      // Fallback
      return []
    }
  }

  async getMediaForZone(isHQZone: boolean, limitCount: number = 24): Promise<MediaItem[]> {
    try {
      const q = query(
        collection(db, this.mediaCollection),
        where('forHQ', '==', isHQZone),
        orderBy('createdAt', 'desc'),
        limit(limitCount * 2)
      )
      const snapshot = await getDocs(q)
      return snapshot.docs
        .map(doc => this.mapDoc(doc))
        .filter(item => !item.hidden)
        .slice(0, limitCount)
    } catch (error) {
      console.error('Error fetching zone media:', error)
      return []
    }
  }

  // Load more media with pagination
  async loadMoreMedia(lastCreatedAt: Date, limitCount: number = 12): Promise<MediaItem[]> {
    try {
      const { startAfter } = await import('firebase/firestore')
      const q = query(
        collection(db, this.mediaCollection),
        orderBy('createdAt', 'desc'),
        startAfter(Timestamp.fromDate(lastCreatedAt)),
        limit(limitCount)
      )
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as MediaItem[]
    } catch (error) {
      console.error('Error loading more media:', error)
      return []
    }
  }

  async getMediaByType(type: MediaItem['type']): Promise<MediaItem[]> {
    try {
      const q = query(
        collection(db, this.mediaCollection),
        where('type', '==', type),
        orderBy('createdAt', 'desc')
      )
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as MediaItem[]
    } catch (error) {
      console.error('Error fetching media by type:', error)
      return []
    }
  }

  async getMediaByGenre(genre: string): Promise<MediaItem[]> {
    try {
      const q = query(
        collection(db, this.mediaCollection),
        where('genre', 'array-contains', genre),
        orderBy('createdAt', 'desc')
      )
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as MediaItem[]
    } catch (error) {
      console.error('Error fetching media by genre:', error)
      return []
    }
  }

  async getFeaturedMedia(): Promise<MediaItem[]> {
    try {
      const q = query(
        collection(db, this.mediaCollection),
        where('featured', '==', true),
        orderBy('views', 'desc'),
        limit(10)
      )
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as MediaItem[]
    } catch (error) {
      console.error('Error fetching featured media:', error)
      return []
    }
  }

  async getMediaById(mediaId: string): Promise<MediaItem | null> {
    try {
      const docRef = doc(db, this.mediaCollection, mediaId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const item = this.mapDoc(docSnap)
        // Ensure ID is passed correctly
        item.id = docSnap.id
        return item
      }
      return null
    } catch (error) {
      console.error('Error fetching media by ID:', error)
      return null
    }
  }

  // OPTIMIZED: Batch fetch videos to reduce network requests
  async getMediaByIds(mediaIds: string[]): Promise<MediaItem[]> {
    if (!mediaIds.length) return []

    try {
      // Chunk IDs into batches of 10 (Firestore 'in' limit is 10-30 depending on query complexity)
      const chunkSize = 10
      const chunks = []
      for (let i = 0; i < mediaIds.length; i += chunkSize) {
        chunks.push(mediaIds.slice(i, i + chunkSize))
      }

      const { documentId } = await import('firebase/firestore')

      const promises = chunks.map(async (chunk) => {
        const q = query(
          collection(db, this.mediaCollection),
          where(documentId(), 'in', chunk)
        )
        const snapshot = await getDocs(q)
        return snapshot.docs.map(doc => this.mapDoc(doc))
      })

      const results = await Promise.all(promises)
      // Flatten chunks into single array
      const allMedia = results.flat()

      // Sort to match order of input IDs (Firestore doesn't guarantee order)
      const mediaMap = new Map(allMedia.map(m => [m.id, m]))

      return mediaIds
        .map(id => mediaMap.get(id))
        .filter(m => m !== undefined) as MediaItem[]
    } catch (error) {
      console.error('Error batch fetching media:', error)
      return []
    }
  }

  async getRelatedMedia(mediaId: string, limitCount: number = 10): Promise<MediaItem[]> {
    try {
      // 1. Get the current media to know its type/genre
      const currentMedia = await this.getMediaById(mediaId)
      if (!currentMedia) return []

      // 2. Query for media of the same type
      const q = query(
        collection(db, this.mediaCollection),
        where('type', '==', currentMedia.type),
        where('hidden', '!=', true),
        limit(limitCount + 1) // +1 to account for current media if it's returned
      )

      const snapshot = await getDocs(q)
      return snapshot.docs
        .map(doc => this.mapDoc(doc))
        .filter(item => item.id !== mediaId) // Exclude current media
        .slice(0, limitCount)
    } catch (error) {
      console.error('Error fetching related media:', error)
      return []
    }
  }

  async searchMedia(searchTerm: string): Promise<MediaItem[]> {
    try {
      const snapshot = await getDocs(collection(db, this.mediaCollection))
      const allMedia = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as MediaItem[]

      return allMedia.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    } catch (error) {
      console.error('Error searching media:', error)
      return []
    }
  }

  async incrementViews(mediaId: string): Promise<void> {
    try {
      const docRef = doc(db, this.mediaCollection, mediaId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const currentViews = docSnap.data().views || 0
        await updateDoc(docRef, {
          views: currentViews + 1,
          updatedAt: Timestamp.now()
        })
      }
    } catch (error) {
      console.error('Error incrementing views:', error)
    }
  }

  async incrementLikes(mediaId: string): Promise<void> {
    try {
      const docRef = doc(db, this.mediaCollection, mediaId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const currentLikes = docSnap.data().likes || 0
        await updateDoc(docRef, {
          likes: currentLikes + 1,
          updatedAt: Timestamp.now()
        })
      }
    } catch (error) {
      console.error('Error incrementing likes:', error)
    }
  }

  // ==================== GENRES ====================

  async getAllGenres(): Promise<Genre[]> {
    try {
      const snapshot = await getDocs(collection(db, this.genresCollection))
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Genre[]
    } catch (error) {
      console.error('Error fetching genres:', error)
      return []
    }
  }

  // ==================== WATCH HISTORY ====================

  async saveWatchProgress(userId: string, mediaId: string, progress: number): Promise<void> {
    try {
      const q = query(
        collection(db, this.watchHistoryCollection),
        where('userId', '==', userId),
        where('mediaId', '==', mediaId)
      )
      const snapshot = await getDocs(q)

      if (snapshot.empty) {
        // Create new history
        await addDoc(collection(db, this.watchHistoryCollection), {
          userId,
          mediaId,
          progress,
          lastWatched: Timestamp.now()
        })
      } else {
        const docRef = doc(db, this.watchHistoryCollection, snapshot.docs[0].id)
        await updateDoc(docRef, {
          progress,
          lastWatched: Timestamp.now()
        })
      }
    } catch (error) {
      console.error('Error saving watch progress:', error)
    }
  }

  async getUserWatchHistory(userId: string): Promise<UserWatchHistory[]> {
    try {
      const q = query(
        collection(db, this.watchHistoryCollection),
        where('userId', '==', userId),
        orderBy('lastWatched', 'desc')
      )
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastWatched: doc.data().lastWatched?.toDate()
      })) as UserWatchHistory[]
    } catch (error) {
      console.error('Error fetching watch history:', error)
      return []
    }
  }

  async getContinueWatching(userId: string): Promise<MediaItem[]> {
    try {
      const history = await this.getUserWatchHistory(userId)
      const mediaIds = history
        .filter(h => h.progress > 5 && h.progress < 95) // Only show partially watched
        .slice(0, 10)
        .map(h => h.mediaId)

      if (mediaIds.length === 0) return []

      const mediaPromises = mediaIds.map(id => this.getMediaById(id))
      const media = await Promise.all(mediaPromises)
      return media.filter(m => m !== null) as MediaItem[]
    } catch (error) {
      console.error('Error fetching continue watching:', error)
      return []
    }
  }

  // ==================== FAVORITES ====================

  async addToFavorites(userId: string, mediaId: string): Promise<void> {
    try {
      const q = query(
        collection(db, this.favoritesCollection),
        where('userId', '==', userId),
        where('mediaId', '==', mediaId)
      )
      const snapshot = await getDocs(q)

      if (snapshot.empty) {
        await addDoc(collection(db, this.favoritesCollection), {
          userId,
          mediaId,
          createdAt: Timestamp.now()
        })
      }
    } catch (error) {
      console.error('Error adding to favorites:', error)
    }
  }

  async removeFromFavorites(userId: string, mediaId: string): Promise<void> {
    try {
      const q = query(
        collection(db, this.favoritesCollection),
        where('userId', '==', userId),
        where('mediaId', '==', mediaId)
      )
      const snapshot = await getDocs(q)

      if (!snapshot.empty) {
        await deleteDoc(doc(db, this.favoritesCollection, snapshot.docs[0].id))
      }
    } catch (error) {
      console.error('Error removing from favorites:', error)
    }
  }

  async getUserFavorites(userId: string): Promise<MediaItem[]> {
    try {
      const q = query(
        collection(db, this.favoritesCollection),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      )
      const snapshot = await getDocs(q)
      const mediaIds = snapshot.docs.map(doc => doc.data().mediaId)

      if (mediaIds.length === 0) return []

      const mediaPromises = mediaIds.map(id => this.getMediaById(id))
      const media = await Promise.all(mediaPromises)
      return media.filter(m => m !== null) as MediaItem[]
    } catch (error) {
      console.error('Error fetching favorites:', error)
      return []
    }
  }

  async isFavorite(userId: string, mediaId: string): Promise<boolean> {
    try {
      const q = query(
        collection(db, this.favoritesCollection),
        where('userId', '==', userId),
        where('mediaId', '==', mediaId)
      )
      const snapshot = await getDocs(q)
      return !snapshot.empty
    } catch (error) {
      console.error('Error checking favorite status:', error)
      return false
    }
  }

  // ==================== REAL-TIME SUBSCRIPTIONS ====================

  // OPTIMIZED: Limited to 50 most recent media items
  subscribeToMedia(callback: (media: MediaItem[]) => void): Unsubscribe {
    const q = query(
      collection(db, this.mediaCollection),
      orderBy('createdAt', 'desc'),
      limit(50) // OPTIMIZED: Limit to reduce reads
    )

    return onSnapshot(q, (snapshot) => {
      const media = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as MediaItem[]
      callback(media)
    })
  }
}

export const firebaseMediaService = new FirebaseMediaService()
export default firebaseMediaService
