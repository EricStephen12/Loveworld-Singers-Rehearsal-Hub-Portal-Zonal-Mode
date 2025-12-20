import { 
  collection, 
  query, 
  orderBy, 
  getDocs,
  where,
  doc,
  getDoc,
  updateDoc,
  increment,
  limit as firestoreLimit,
  startAfter,
  QueryDocumentSnapshot
} from 'firebase/firestore'

import { FirebaseDatabaseService } from './firebase-database'
import { db } from './firebase-setup'

let masterSongsCache: { data: MasterSong[]; timestamp: number } | null = null
let hqInternalSongsCache: { data: any[]; timestamp: number } | null = null
const CACHE_TTL = 5 * 60 * 1000

let lastMasterSongDoc: QueryDocumentSnapshot | null = null
let lastHQInternalDoc: QueryDocumentSnapshot | null = null

export interface MasterSong {
  id: string
  title: string
  lyrics?: string
  solfa?: string
  key?: string
  tempo?: string
  writer?: string
  leadSinger?: string
  category?: string
  categories?: string[]
  audioFile?: string
  audioUrls?: {
    full?: string
    soprano?: string
    alto?: string
    tenor?: string
    bass?: string
  }
  sourceType: 'hq_internal'
  originalSongId: string
  publishedBy: string
  publishedByName?: string
  publishedAt: Date
  updatedAt: Date
  importCount: number
}

export interface ImportedSongTracking {
  importedFrom: 'master' | 'zone'
  originalSongId: string
  importedAt: Date
  importedBy: string
}

export class MasterLibraryService {
  
  static async getMasterSongs(limitCount: number = 100, forceRefresh: boolean = false): Promise<MasterSong[]> {
    try {
      if (!forceRefresh && masterSongsCache && Date.now() - masterSongsCache.timestamp < CACHE_TTL) {
        return masterSongsCache.data
      }
      
      const q = query(
        collection(db, 'master_songs'),
        orderBy('publishedAt', 'desc'),
        firestoreLimit(limitCount)
      )
      
      const querySnapshot = await getDocs(q)
      const songs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MasterSong[]
      
      masterSongsCache = { data: songs, timestamp: Date.now() }
      
      if (querySnapshot.docs.length > 0) {
        lastMasterSongDoc = querySnapshot.docs[querySnapshot.docs.length - 1]
      }
      
      return songs
    } catch (error) {
      console.error('Error getting Master Library songs:', error)
      return []
    }
  }

  static async loadMoreMasterSongs(limitCount: number = 50): Promise<MasterSong[]> {
    try {
      if (!lastMasterSongDoc) return []
      
      const q = query(
        collection(db, 'master_songs'),
        orderBy('publishedAt', 'desc'),
        startAfter(lastMasterSongDoc),
        firestoreLimit(limitCount)
      )
      
      const querySnapshot = await getDocs(q)
      const songs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MasterSong[]
      
      if (querySnapshot.docs.length > 0) {
        lastMasterSongDoc = querySnapshot.docs[querySnapshot.docs.length - 1]
        if (masterSongsCache) {
          masterSongsCache.data = [...masterSongsCache.data, ...songs]
          masterSongsCache.timestamp = Date.now()
        }
      } else {
        lastMasterSongDoc = null
      }
      
      return songs
    } catch (error) {
      console.error('Error loading more Master Library songs:', error)
      return []
    }
  }

  static hasMoreMasterSongs(): boolean {
    return lastMasterSongDoc !== null
  }

  static clearMasterSongsCache(): void {
    masterSongsCache = null
    lastMasterSongDoc = null
  }

  static async getMasterSong(songId: string): Promise<MasterSong | null> {
    try {
      const docRef = doc(db, 'master_songs', songId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as MasterSong
      }
      return null
    } catch (error) {
      console.error('Error getting Master song:', error)
      return null
    }
  }

  static async publishToMasterLibrary(
    originalSong: any,
    publishedBy: string,
    publishedByName?: string
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const existing = await this.getMasterSongByOriginalId(originalSong.id)
      if (existing) {
        return { success: false, error: 'This song is already in the Master Library' }
      }
      
      const masterSongData = {
        title: originalSong.title || '',
        lyrics: originalSong.lyrics || '',
        solfa: originalSong.solfa || '',
        key: originalSong.key || '',
        tempo: originalSong.tempo || '',
        writer: originalSong.writer || '',
        leadSinger: originalSong.leadSinger || '',
        category: originalSong.category || '',
        categories: originalSong.categories || [],
        audioFile: originalSong.audioFile || '',
        audioUrls: originalSong.audioUrls || {},
        sourceType: 'hq_internal',
        originalSongId: originalSong.id || originalSong.firebaseId,
        publishedBy,
        publishedByName: publishedByName || '',
        publishedAt: new Date(),
        updatedAt: new Date(),
        importCount: 0
      }
      
      const cleanData = Object.fromEntries(
        Object.entries(masterSongData).filter(([_, v]) => v !== undefined)
      )
      
      const result = await FirebaseDatabaseService.addDocument('master_songs', cleanData)
      
      if (result.success) {
        this.clearMasterSongsCache()
        return { success: true, id: result.id }
      }
      return { success: false, error: 'Failed to publish song' }
    } catch (error) {
      console.error('Error publishing to Master Library:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  static async getMasterSongByOriginalId(originalSongId: string): Promise<MasterSong | null> {
    try {
      const q = query(
        collection(db, 'master_songs'),
        where('originalSongId', '==', originalSongId)
      )
      
      const querySnapshot = await getDocs(q)
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0]
        return { id: doc.id, ...doc.data() } as MasterSong
      }
      return null
    } catch (error) {
      console.error('Error checking Master Library:', error)
      return null
    }
  }

  static async updateMasterSong(
    songId: string, 
    data: Partial<MasterSong>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const updateData = { ...data }
      delete (updateData as any).sourceType
      delete (updateData as any).originalSongId
      delete (updateData as any).publishedBy
      delete (updateData as any).publishedAt
      delete (updateData as any).importCount
      
      updateData.updatedAt = new Date()
      
      await FirebaseDatabaseService.updateDocument('master_songs', songId, updateData)
      return { success: true }
    } catch (error) {
      console.error('Error updating Master song:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  static async deleteMasterSong(songId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await FirebaseDatabaseService.deleteDocument('master_songs', songId)
      this.clearMasterSongsCache()
      return { success: true }
    } catch (error) {
      console.error('Error deleting Master song:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  static async importToZone(
    masterSong: MasterSong,
    zoneId: string,
    praiseNightId: string,
    importedBy: string
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const zoneSongData = {
        title: masterSong.title,
        lyrics: masterSong.lyrics || '',
        solfa: masterSong.solfa || '',
        key: masterSong.key || '',
        tempo: masterSong.tempo || '',
        writer: masterSong.writer || '',
        leadSinger: masterSong.leadSinger || '',
        category: masterSong.category || '',
        categories: masterSong.categories || [],
        audioFile: masterSong.audioFile || '',
        audioUrls: masterSong.audioUrls || {},
        zoneId,
        praiseNightId,
        importedFrom: 'master',
        originalSongId: masterSong.id,
        importedAt: new Date(),
        importedBy,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'unheard'
      }
      
      const cleanData = Object.fromEntries(
        Object.entries(zoneSongData).filter(([_, v]) => v !== undefined)
      )
      
      const result = await FirebaseDatabaseService.addDocument('zone_songs', cleanData)
      
      if (result.success) {
        await this.incrementImportCount(masterSong.id)
        return { success: true, id: result.id }
      }
      return { success: false, error: 'Failed to import song' }
    } catch (error) {
      console.error('Error importing to zone:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  static async incrementImportCount(masterSongId: string): Promise<void> {
    try {
      const docRef = doc(db, 'master_songs', masterSongId)
      await updateDoc(docRef, { importCount: increment(1) })
    } catch (error) {
      console.error('Error incrementing import count:', error)
    }
  }

  static async getHQInternalSongs(limitCount: number = 200, forceRefresh: boolean = false): Promise<any[]> {
    try {
      if (!forceRefresh && hqInternalSongsCache && Date.now() - hqInternalSongsCache.timestamp < CACHE_TTL) {
        return hqInternalSongsCache.data
      }
      
      const q = query(collection(db, 'praise_night_songs'), firestoreLimit(limitCount))
      const querySnapshot = await getDocs(q)
      
      const songs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        firebaseId: doc.id,
        ...doc.data()
      })) as Array<{ id: string; firebaseId: string; title?: string; [key: string]: any }>
      
      songs.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
      
      hqInternalSongsCache = { data: songs, timestamp: Date.now() }
      
      if (querySnapshot.docs.length > 0) {
        lastHQInternalDoc = querySnapshot.docs[querySnapshot.docs.length - 1]
      }
      
      return songs
    } catch (error) {
      console.error('Error getting HQ Internal songs:', error)
      return []
    }
  }

  static async loadMoreHQInternalSongs(limitCount: number = 100): Promise<any[]> {
    try {
      if (!lastHQInternalDoc) return []
      
      const q = query(
        collection(db, 'praise_night_songs'),
        startAfter(lastHQInternalDoc),
        firestoreLimit(limitCount)
      )
      
      const querySnapshot = await getDocs(q)
      const songs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        firebaseId: doc.id,
        ...doc.data()
      })) as Array<{ id: string; firebaseId: string; title?: string; [key: string]: any }>
      
      songs.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
      
      if (querySnapshot.docs.length > 0) {
        lastHQInternalDoc = querySnapshot.docs[querySnapshot.docs.length - 1]
        if (hqInternalSongsCache) {
          hqInternalSongsCache.data = [...hqInternalSongsCache.data, ...songs]
          hqInternalSongsCache.timestamp = Date.now()
        }
      } else {
        lastHQInternalDoc = null
      }
      
      return songs
    } catch (error) {
      console.error('Error loading more HQ Internal songs:', error)
      return []
    }
  }

  static hasMoreHQInternalSongs(): boolean {
    return lastHQInternalDoc !== null
  }

  static clearHQInternalSongsCache(): void {
    hqInternalSongsCache = null
    lastHQInternalDoc = null
  }

  static async searchMasterSongs(searchTerm: string): Promise<MasterSong[]> {
    try {
      const allSongs = await this.getMasterSongs()
      const term = searchTerm.toLowerCase()
      
      return allSongs.filter(song => 
        song.title?.toLowerCase().includes(term) ||
        song.writer?.toLowerCase().includes(term) ||
        song.leadSinger?.toLowerCase().includes(term) ||
        song.category?.toLowerCase().includes(term)
      )
    } catch (error) {
      console.error('Error searching Master Library:', error)
      return []
    }
  }

  static async getMasterLibraryStats(): Promise<{
    totalSongs: number
    totalImports: number
    mostImported: MasterSong[]
  }> {
    try {
      const songs = await this.getMasterSongs()
      
      const totalImports = songs.reduce((sum, song) => sum + (song.importCount || 0), 0)
      const mostImported = [...songs]
        .sort((a, b) => (b.importCount || 0) - (a.importCount || 0))
        .slice(0, 5)
      
      return { totalSongs: songs.length, totalImports, mostImported }
    } catch (error) {
      console.error('Error getting Master Library stats:', error)
      return { totalSongs: 0, totalImports: 0, mostImported: [] }
    }
  }
}
