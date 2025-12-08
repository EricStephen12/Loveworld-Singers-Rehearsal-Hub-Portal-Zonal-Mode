// Media Videos Service - Clean unified service for video management
// Collection: media_videos

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
  startAfter
} from 'firebase/firestore'
import { db } from './firebase-setup'

// Clean video type
export interface MediaVideo {
  id: string
  title: string
  description: string
  thumbnail: string
  // Video source - either cloudinary URL or YouTube URL
  videoUrl?: string      // Cloudinary/direct video URL
  youtubeUrl?: string    // YouTube URL
  isYouTube: boolean
  // Metadata
  type: 'praise' | 'medley' | 'healing' | 'gfap' | 'worship' | 'live' | 'other'
  duration?: number      // in seconds
  releaseYear?: number
  featured: boolean
  // Stats
  views: number
  likes: number
  // Timestamps
  createdAt: Date
  updatedAt: Date
  // Creator info
  createdBy?: string
  createdByName?: string
}

export type MediaVideoInput = Omit<MediaVideo, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'likes'>

const COLLECTION = 'media_videos'

class MediaVideosService {
  // Create a new video
  async create(data: MediaVideoInput): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTION), {
      ...data,
      views: 0,
      likes: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    })
    return docRef.id
  }

  // Get all videos with pagination
  async getAll(limitCount = 24): Promise<MediaVideo[]> {
    const q = query(
      collection(db, COLLECTION),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )
    const snapshot = await getDocs(q)
    return this.mapDocs(snapshot.docs)
  }

  // Load more videos (pagination)
  async loadMore(lastCreatedAt: Date, limitCount = 12): Promise<MediaVideo[]> {
    const q = query(
      collection(db, COLLECTION),
      orderBy('createdAt', 'desc'),
      startAfter(Timestamp.fromDate(lastCreatedAt)),
      limit(limitCount)
    )
    const snapshot = await getDocs(q)
    return this.mapDocs(snapshot.docs)
  }

  // Get video by ID
  async getById(id: string): Promise<MediaVideo | null> {
    const docRef = doc(db, COLLECTION, id)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) return null
    
    return this.mapDoc(docSnap)
  }

  // Get videos by type
  async getByType(type: MediaVideo['type']): Promise<MediaVideo[]> {
    const q = query(
      collection(db, COLLECTION),
      where('type', '==', type),
      orderBy('createdAt', 'desc')
    )
    const snapshot = await getDocs(q)
    return this.mapDocs(snapshot.docs)
  }

  // Get featured videos
  async getFeatured(): Promise<MediaVideo[]> {
    const q = query(
      collection(db, COLLECTION),
      where('featured', '==', true),
      orderBy('views', 'desc'),
      limit(10)
    )
    const snapshot = await getDocs(q)
    return this.mapDocs(snapshot.docs)
  }

  // Update video
  async update(id: string, data: Partial<MediaVideoInput>): Promise<void> {
    const docRef = doc(db, COLLECTION, id)
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now()
    })
  }

  // Delete video
  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION, id)
    await deleteDoc(docRef)
  }

  // Increment views
  async incrementViews(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION, id)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const currentViews = docSnap.data().views || 0
      await updateDoc(docRef, { views: currentViews + 1 })
    }
  }

  // Increment likes
  async incrementLikes(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION, id)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const currentLikes = docSnap.data().likes || 0
      await updateDoc(docRef, { likes: currentLikes + 1 })
    }
  }

  // Search videos
  async search(searchTerm: string): Promise<MediaVideo[]> {
    // Simple client-side search (for better search, use Algolia)
    const all = await this.getAll(100)
    const term = searchTerm.toLowerCase()
    return all.filter(v => 
      v.title.toLowerCase().includes(term) ||
      v.description?.toLowerCase().includes(term)
    )
  }

  // Helper to map Firestore docs
  private mapDocs(docs: any[]): MediaVideo[] {
    return docs.map(doc => this.mapDoc(doc))
  }

  private mapDoc(doc: any): MediaVideo {
    const data = doc.data()
    return {
      id: doc.id,
      title: data.title || '',
      description: data.description || '',
      thumbnail: data.thumbnail || '',
      videoUrl: data.videoUrl,
      youtubeUrl: data.youtubeUrl,
      isYouTube: data.isYouTube || false,
      type: data.type || 'other',
      duration: data.duration,
      releaseYear: data.releaseYear,
      featured: data.featured || false,
      views: data.views || 0,
      likes: data.likes || 0,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date(),
      createdBy: data.createdBy,
      createdByName: data.createdByName
    }
  }
}

export const mediaVideosService = new MediaVideosService()
export default mediaVideosService
