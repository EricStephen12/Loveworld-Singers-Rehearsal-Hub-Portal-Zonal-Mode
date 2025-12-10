'use client'

import { db } from '@/lib/firebase-setup'
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
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'

export interface AdminPlaylist {
  id: string
  name: string
  description: string
  thumbnail: string
  videoIds: string[]
  isPublic: boolean
  isFeatured: boolean
  forHQ: boolean // Zone targeting
  createdBy: string
  createdByName: string
  createdAt: Date
  updatedAt: Date
}

const COLLECTION = 'admin_playlists'

// Get all admin playlists
export async function getAdminPlaylists(): Promise<AdminPlaylist[]> {
  try {
    const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date(),
      updatedAt: (doc.data().updatedAt as Timestamp)?.toDate() || new Date()
    })) as AdminPlaylist[]
  } catch (error) {
    console.error('Error fetching admin playlists:', error)
    return []
  }
}

// Get public playlists (for users to see)
export async function getPublicAdminPlaylists(isHQZone: boolean): Promise<AdminPlaylist[]> {
  console.log('getPublicAdminPlaylists called, isHQZone:', isHQZone)
  try {
    // First try simple query without compound index
    const q = query(
      collection(db, COLLECTION),
      where('isPublic', '==', true),
      orderBy('createdAt', 'desc')
    )
    const snapshot = await getDocs(q)
    console.log('Found', snapshot.docs.length, 'public admin playlists')
    
    // Filter by zone type in memory (avoids needing compound index)
    const allPlaylists = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date(),
      updatedAt: (doc.data().updatedAt as Timestamp)?.toDate() || new Date()
    })) as AdminPlaylist[]
    
    // Filter by forHQ field
    const filtered = allPlaylists.filter(p => p.forHQ === isHQZone)
    console.log('After zone filter:', filtered.length, 'playlists for', isHQZone ? 'HQ' : 'regular zones')
    
    return filtered
  } catch (error) {
    console.error('Error fetching public playlists:', error)
    // Fallback: get all and filter
    try {
      const q = query(
        collection(db, COLLECTION),
        orderBy('createdAt', 'desc')
      )
      const snapshot = await getDocs(q)
      const all = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date(),
        updatedAt: (doc.data().updatedAt as Timestamp)?.toDate() || new Date()
      })) as AdminPlaylist[]
      return all.filter(p => p.isPublic && p.forHQ === isHQZone)
    } catch {
      return []
    }
  }
}

// Get featured playlists
export async function getFeaturedPlaylists(isHQZone: boolean): Promise<AdminPlaylist[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('isFeatured', '==', true),
      where('forHQ', '==', isHQZone),
      orderBy('createdAt', 'desc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date(),
      updatedAt: (doc.data().updatedAt as Timestamp)?.toDate() || new Date()
    })) as AdminPlaylist[]
  } catch (error) {
    console.error('Error fetching featured playlists:', error)
    return []
  }
}

// Get single playlist
export async function getAdminPlaylist(id: string): Promise<AdminPlaylist | null> {
  try {
    const docRef = doc(db, COLLECTION, id)
    const snapshot = await getDoc(docRef)
    if (!snapshot.exists()) return null
    return {
      id: snapshot.id,
      ...snapshot.data(),
      createdAt: (snapshot.data().createdAt as Timestamp)?.toDate() || new Date(),
      updatedAt: (snapshot.data().updatedAt as Timestamp)?.toDate() || new Date()
    } as AdminPlaylist
  } catch (error) {
    console.error('Error fetching playlist:', error)
    return null
  }
}

// Create playlist
export async function createAdminPlaylist(data: {
  name: string
  description?: string
  thumbnail?: string
  isPublic?: boolean
  isFeatured?: boolean
  forHQ?: boolean
  createdBy: string
  createdByName: string
}): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION), {
      name: data.name,
      description: data.description || '',
      thumbnail: data.thumbnail || '',
      videoIds: [],
      isPublic: data.isPublic ?? true,
      isFeatured: data.isFeatured ?? false,
      forHQ: data.forHQ ?? true,
      createdBy: data.createdBy,
      createdByName: data.createdByName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return docRef.id
  } catch (error) {
    console.error('Error creating playlist:', error)
    throw error
  }
}

// Update playlist
export async function updateAdminPlaylist(
  id: string,
  data: Partial<Omit<AdminPlaylist, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  try {
    const docRef = doc(db, COLLECTION, id)
    // Filter out undefined values
    const cleanData: Record<string, any> = {}
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        cleanData[key] = value
      }
    }
    await updateDoc(docRef, {
      ...cleanData,
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error updating playlist:', error)
    throw error
  }
}

// Delete playlist
export async function deleteAdminPlaylist(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTION, id))
  } catch (error) {
    console.error('Error deleting playlist:', error)
    throw error
  }
}

// Add video to playlist
export async function addVideoToPlaylist(playlistId: string, videoId: string): Promise<void> {
  try {
    const playlist = await getAdminPlaylist(playlistId)
    if (!playlist) throw new Error('Playlist not found')
    
    if (!playlist.videoIds.includes(videoId)) {
      await updateAdminPlaylist(playlistId, {
        videoIds: [...playlist.videoIds, videoId]
      })
    }
  } catch (error) {
    console.error('Error adding video to playlist:', error)
    throw error
  }
}

// Remove video from playlist
export async function removeVideoFromPlaylist(playlistId: string, videoId: string): Promise<void> {
  try {
    const playlist = await getAdminPlaylist(playlistId)
    if (!playlist) throw new Error('Playlist not found')
    
    await updateAdminPlaylist(playlistId, {
      videoIds: playlist.videoIds.filter(id => id !== videoId)
    })
  } catch (error) {
    console.error('Error removing video from playlist:', error)
    throw error
  }
}

// Reorder videos in playlist
export async function reorderPlaylistVideos(playlistId: string, videoIds: string[]): Promise<void> {
  try {
    await updateAdminPlaylist(playlistId, { videoIds })
  } catch (error) {
    console.error('Error reordering playlist:', error)
    throw error
  }
}
