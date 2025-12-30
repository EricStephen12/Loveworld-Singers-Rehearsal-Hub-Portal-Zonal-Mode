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

export interface MediaVideo {
  id: string
  title: string
  description: string
  thumbnail: string
  videoUrl?: string
  youtubeUrl?: string
  isYouTube: boolean
  type: 'praise' | 'medley' | 'healing' | 'gfap' | 'worship' | 'live' | 'other'
  duration?: number
  releaseYear?: number
  featured: boolean
  forHQ: boolean
  hidden: boolean
  views: number
  likes: number
  createdAt: Date
  updatedAt: Date
  createdBy?: string
  createdByName?: string
}

export type MediaVideoInput = Omit<MediaVideo, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'likes'>

const COLLECTION = 'media_videos'

class MediaVideosService {
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

  async getAll(limitCount = 24): Promise<MediaVideo[]> {
    const q = query(
      collection(db, COLLECTION),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )
    const snapshot = await getDocs(q)
    return this.mapDocs(snapshot.docs)
  }

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

  async getById(id: string): Promise<MediaVideo | null> {
    const docRef = doc(db, COLLECTION, id)
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) return null
    return this.mapDoc(docSnap)
  }

  async getByType(type: MediaVideo['type']): Promise<MediaVideo[]> {
    const q = query(
      collection(db, COLLECTION),
      where('type', '==', type),
      orderBy('createdAt', 'desc')
    )
    const snapshot = await getDocs(q)
    return this.mapDocs(snapshot.docs)
  }

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

  async getForHQ(limitCount = 24): Promise<MediaVideo[]> {
    const q = query(
      collection(db, COLLECTION),
      where('forHQ', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )
    const snapshot = await getDocs(q)
    return this.mapDocs(snapshot.docs)
  }

  async getForRegularZones(limitCount = 24): Promise<MediaVideo[]> {
    const q = query(
      collection(db, COLLECTION),
      where('forHQ', '==', false),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )
    const snapshot = await getDocs(q)
    return this.mapDocs(snapshot.docs)
  }

  async getForZoneType(isHQZone: boolean, limitCount = 24): Promise<MediaVideo[]> {
    return isHQZone ? this.getForHQ(limitCount) : this.getForRegularZones(limitCount)
  }

  async update(id: string, data: Partial<MediaVideoInput>): Promise<void> {
    const docRef = doc(db, COLLECTION, id)
    const cleanData: Record<string, any> = {}
    
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        cleanData[key] = value
      }
    }
    
    await updateDoc(docRef, {
      ...cleanData,
      updatedAt: Timestamp.now()
    })
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION, id)
    await deleteDoc(docRef)
  }

  async incrementViews(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION, id)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const currentViews = docSnap.data().views || 0
      await updateDoc(docRef, { views: currentViews + 1 })
    }
  }

  async incrementLikes(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION, id)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const currentLikes = docSnap.data().likes || 0
      await updateDoc(docRef, { likes: currentLikes + 1 })
    }
  }

  async search(searchTerm: string): Promise<MediaVideo[]> {
    const all = await this.getAll(100)
    const term = searchTerm.toLowerCase()
    return all.filter(v => 
      v.title.toLowerCase().includes(term) ||
      v.description?.toLowerCase().includes(term)
    )
  }

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
      forHQ: data.forHQ !== false,
      hidden: data.hidden || false,
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
