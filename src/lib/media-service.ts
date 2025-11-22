import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy,
  Timestamp,
  increment
} from 'firebase/firestore'
import { db } from './firebase-setup'

export interface Media {
  id: string
  title: string
  description: string
  category: 'sermons' | 'worship' | 'teachings' | 'events' | 'other'
  videoUrl: string
  thumbnailUrl: string
  duration: number // in seconds
  zoneId?: string // Optional: for zone-specific content
  uploadedBy: string
  uploadedByName: string
  views: number
  likes: number
  tags: string[]
  isPublic: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface MediaUpload {
  title: string
  description: string
  category: Media['category']
  videoUrl: string
  thumbnailUrl: string
  duration: number
  zoneId?: string
  tags?: string[]
  isPublic?: boolean
}

class MediaService {
  private mediaCollection = collection(db, 'media')

  // Upload new media
  async uploadMedia(userId: string, userName: string, mediaData: MediaUpload): Promise<string> {
    try {
      const newMedia = {
        ...mediaData,
        uploadedBy: userId,
        uploadedByName: userName,
        views: 0,
        likes: 0,
        tags: mediaData.tags || [],
        isPublic: mediaData.isPublic ?? true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }

      const docRef = await addDoc(this.mediaCollection, newMedia)
      return docRef.id
    } catch (error) {
      console.error('Error uploading media:', error)
      throw error
    }
  }

  // Get all media (with optional filters)
  async getAllMedia(filters?: {
    category?: string
    zoneId?: string
    isPublic?: boolean
  }): Promise<Media[]> {
    try {
      let q = query(this.mediaCollection, orderBy('createdAt', 'desc'))

      if (filters?.category) {
        q = query(q, where('category', '==', filters.category))
      }

      if (filters?.zoneId) {
        q = query(q, where('zoneId', '==', filters.zoneId))
      }

      if (filters?.isPublic !== undefined) {
        q = query(q, where('isPublic', '==', filters.isPublic))
      }

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Media))
    } catch (error) {
      console.error('Error getting media:', error)
      throw error
    }
  }

  // Get media by ID
  async getMediaById(mediaId: string): Promise<Media | null> {
    try {
      const docRef = doc(this.mediaCollection, mediaId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Media
      }

      return null
    } catch (error) {
      console.error('Error getting media by ID:', error)
      throw error
    }
  }

  // Update media
  async updateMedia(mediaId: string, updates: Partial<MediaUpload>): Promise<void> {
    try {
      const docRef = doc(this.mediaCollection, mediaId)
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now()
      })
    } catch (error) {
      console.error('Error updating media:', error)
      throw error
    }
  }

  // Delete media
  async deleteMedia(mediaId: string): Promise<void> {
    try {
      const docRef = doc(this.mediaCollection, mediaId)
      await deleteDoc(docRef)
    } catch (error) {
      console.error('Error deleting media:', error)
      throw error
    }
  }

  // Increment view count
  async incrementViews(mediaId: string): Promise<void> {
    try {
      const docRef = doc(this.mediaCollection, mediaId)
      await updateDoc(docRef, {
        views: increment(1)
      })
    } catch (error) {
      console.error('Error incrementing views:', error)
      throw error
    }
  }

  // Toggle like
  async toggleLike(mediaId: string, shouldIncrement: boolean): Promise<void> {
    try {
      const docRef = doc(this.mediaCollection, mediaId)
      await updateDoc(docRef, {
        likes: increment(shouldIncrement ? 1 : -1)
      })
    } catch (error) {
      console.error('Error toggling like:', error)
      throw error
    }
  }

  // Search media
  async searchMedia(searchTerm: string, zoneId?: string): Promise<Media[]> {
    try {
      // Note: Firestore doesn't support full-text search natively
      // For production, consider using Algolia or similar service
      const allMedia = await this.getAllMedia({ zoneId })
      
      const searchLower = searchTerm.toLowerCase()
      return allMedia.filter(media => 
        media.title.toLowerCase().includes(searchLower) ||
        media.description.toLowerCase().includes(searchLower) ||
        media.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
    } catch (error) {
      console.error('Error searching media:', error)
      throw error
    }
  }
}

export default new MediaService()
