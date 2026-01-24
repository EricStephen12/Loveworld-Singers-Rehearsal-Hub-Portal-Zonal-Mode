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
  Timestamp,
  limit
} from 'firebase/firestore'

export interface AdminPlaylist {
  id: string
  name: string
  description: string
  thumbnail: string
  videoIds: string[]
  childPlaylistIds?: string[] // IDs of nested playlists
  isPublic: boolean
  isFeatured: boolean
  forHQ: boolean // Zone targeting
  type?: string // Category type (same as video categories)
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

// Get public playlists (excludes nested playlists)
export async function getPublicAdminPlaylists(isHQZone: boolean, categoryType?: string): Promise<AdminPlaylist[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('isPublic', '==', true),
      orderBy('createdAt', 'desc')
    )
    const snapshot = await getDocs(q)

    let allPlaylists = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date(),
      updatedAt: (doc.data().updatedAt as Timestamp)?.toDate() || new Date()
    })) as AdminPlaylist[]

    // Collect nested playlist IDs
    const nestedPlaylistIds = new Set<string>()
    allPlaylists.forEach(p => {
      p.childPlaylistIds?.forEach(childId => nestedPlaylistIds.add(childId))
    })

    // Filter by zone and exclude nested
    let filtered = allPlaylists.filter(p =>
      p.forHQ === isHQZone && !nestedPlaylistIds.has(p.id)
    )

    if (categoryType && categoryType !== 'all') {
      filtered = filtered.filter(p => p.type === categoryType)
    }

    return filtered
  } catch (error) {
    console.error('Error fetching public playlists:', error)
    // Fallback: get all and filter
    try {
      const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      let all = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date(),
        updatedAt: (doc.data().updatedAt as Timestamp)?.toDate() || new Date()
      })) as AdminPlaylist[]

      const nestedPlaylistIds = new Set<string>()
      all.forEach(p => {
        p.childPlaylistIds?.forEach(childId => nestedPlaylistIds.add(childId))
      })

      let filtered = all.filter(p => p.isPublic && p.forHQ === isHQZone && !nestedPlaylistIds.has(p.id))
      if (categoryType && categoryType !== 'all') {
        filtered = filtered.filter(p => p.type === categoryType)
      }
      return filtered
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
  type?: string
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
      type: data.type || null,
      createdBy: data.createdBy,
      createdByName: data.createdByName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })

    // Trigger FCM push notifications for public playlists
    if (data.isPublic !== false) {
      triggerPlaylistNotification(docRef.id, data.name, data.forHQ ?? true).catch(err => {
        console.error('[PlaylistNotif] FCM error:', err)
      })
    }

    return docRef.id
  } catch (error) {
    console.error('Error creating playlist:', error)
    throw error
  }
}

// Helper to trigger playlist notification
async function triggerPlaylistNotification(playlistId: string, name: string, forHQ: boolean) {
  try {
    const membersCollection = forHQ ? 'hq_members' : 'zone_members'
    const snapshot = await getDocs(query(collection(db, membersCollection), limit(500)))
    const recipientIds: string[] = []
    snapshot.forEach(doc => {
      if (doc.data().userId) recipientIds.push(doc.data().userId)
    })

    if (recipientIds.length === 0) return

    const batchSize = 100
    for (let i = 0; i < recipientIds.length; i += batchSize) {
      const batch = recipientIds.slice(i, i + batchSize)
      await fetch('/api/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'media',
          recipientIds: batch,
          title: '🎵 New Playlist',
          body: `Check out the new playlist: "${name}"`,
          data: { playlistId }
        })
      })
    }
  } catch (err) {
    console.error('Error in triggerPlaylistNotification:', err)
  }
}

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

// Add child playlist to parent playlist
export async function addChildPlaylist(parentId: string, childId: string): Promise<void> {
  try {
    // Prevent circular references
    if (parentId === childId) throw new Error('Cannot add playlist to itself')

    const parent = await getAdminPlaylist(parentId)
    if (!parent) throw new Error('Parent playlist not found')

    const child = await getAdminPlaylist(childId)
    if (!child) throw new Error('Child playlist not found')

    if (child.childPlaylistIds?.includes(parentId)) {
      throw new Error('Cannot create circular playlist reference')
    }

    const currentChildren = parent.childPlaylistIds || []
    if (!currentChildren.includes(childId)) {
      await updateAdminPlaylist(parentId, {
        childPlaylistIds: [...currentChildren, childId]
      })
    }
  } catch (error) {
    console.error('Error adding child playlist:', error)
    throw error
  }
}

// Remove child playlist from parent
export async function removeChildPlaylist(parentId: string, childId: string): Promise<void> {
  try {
    const parent = await getAdminPlaylist(parentId)
    if (!parent) throw new Error('Playlist not found')

    await updateAdminPlaylist(parentId, {
      childPlaylistIds: (parent.childPlaylistIds || []).filter(id => id !== childId)
    })
  } catch (error) {
    console.error('Error removing child playlist:', error)
    throw error
  }
}

// Get playlists that can be added as children (excludes self and ancestors)
export async function getAddableChildPlaylists(parentId: string): Promise<AdminPlaylist[]> {
  try {
    const allPlaylists = await getAdminPlaylists()
    const parent = await getAdminPlaylist(parentId)
    if (!parent) return []

    const existingChildren = parent.childPlaylistIds || []

    // Filter out: self, already added, and any that contain this playlist as child
    return allPlaylists.filter(p => {
      if (p.id === parentId) return false
      if (existingChildren.includes(p.id)) return false
      if (p.childPlaylistIds?.includes(parentId)) return false
      return true
    })
  } catch (error) {
    console.error('Error getting addable playlists:', error)
    return []
  }
}
