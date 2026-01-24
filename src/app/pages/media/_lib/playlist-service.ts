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
  setDoc,
  query,
  where,
  orderBy,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'

export interface PlaylistItem {
  id: string
  type: 'video' | 'playlist'
  addedAt: Date
}

export interface Playlist {
  id: string
  name: string
  description?: string
  userId: string
  videoIds: string[] // Legacy: just video IDs
  items?: PlaylistItem[] // New: mixed content (videos + playlists)
  childPlaylistIds?: string[] // IDs of nested playlists
  thumbnail?: string
  isPublic: boolean
  isSystem?: boolean // For Liked Videos, Watch Later
  systemType?: 'liked' | 'watch_later'
  type?: string // Category type (same as video categories)
  totalVideos?: number // Computed: total videos including nested playlists
  isAdmin?: boolean // For LWS Official label
  createdAt: Date
  updatedAt: Date
}

const COLLECTION = 'media_playlists'

// System playlist IDs
export const getSystemPlaylistId = (userId: string, type: 'liked' | 'watch_later') =>
  `${userId}_${type}`

// Ensure system playlists exist for user
export async function ensureSystemPlaylists(userId: string): Promise<void> {
  const systemPlaylists = [
    { type: 'liked' as const, name: 'Liked Videos', description: 'Videos you liked' },
    { type: 'watch_later' as const, name: 'Watch Later', description: 'Videos to watch later' }
  ]

  for (const sp of systemPlaylists) {
    const playlistId = getSystemPlaylistId(userId, sp.type)
    const docRef = doc(db, COLLECTION, playlistId)
    const snapshot = await getDoc(docRef)

    if (!snapshot.exists()) {
      await setDoc(docRef, {
        name: sp.name,
        description: sp.description,
        userId,
        videoIds: [],
        thumbnail: null,
        isPublic: false,
        isSystem: true,
        systemType: sp.type,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    }
  }
}

// Toggle like on a video
export async function toggleLikeVideo(userId: string, videoId: string, thumbnail?: string): Promise<boolean> {
  try {
    const playlistId = getSystemPlaylistId(userId, 'liked')
    const docRef = doc(db, COLLECTION, playlistId)
    const snapshot = await getDoc(docRef)

    if (!snapshot.exists()) {
      await ensureSystemPlaylists(userId)
    }

    const playlist = await getPlaylist(playlistId)
    const isLiked = playlist?.videoIds.includes(videoId)

    if (isLiked) {
      await removeFromPlaylist(playlistId, videoId)
      return false
    } else {
      await addToPlaylist(playlistId, videoId, thumbnail)
      return true
    }
  } catch (error) {
    console.error('👍 Error in toggleLikeVideo:', error)
    throw error
  }
}

// Toggle watch later on a video
export async function toggleWatchLater(userId: string, videoId: string, thumbnail?: string): Promise<boolean> {
  try {
    const playlistId = getSystemPlaylistId(userId, 'watch_later')
    const docRef = doc(db, COLLECTION, playlistId)
    const snapshot = await getDoc(docRef)

    if (!snapshot.exists()) {
      await ensureSystemPlaylists(userId)
    }

    const playlist = await getPlaylist(playlistId)
    const isInWatchLater = playlist?.videoIds.includes(videoId)

    if (isInWatchLater) {
      await removeFromPlaylist(playlistId, videoId)
      return false
    } else {
      await addToPlaylist(playlistId, videoId, thumbnail)
      return true
    }
  } catch (error) {
    console.error('⏰ Error in toggleWatchLater:', error)
    throw error
  }
}

export async function isVideoLiked(userId: string, videoId: string): Promise<boolean> {
  const playlistId = getSystemPlaylistId(userId, 'liked')
  const playlist = await getPlaylist(playlistId)
  return playlist?.videoIds.includes(videoId) || false
}

export async function isInWatchLater(userId: string, videoId: string): Promise<boolean> {
  const playlistId = getSystemPlaylistId(userId, 'watch_later')
  const playlist = await getPlaylist(playlistId)
  return playlist?.videoIds.includes(videoId) || false
}

// Create a new playlist
export async function createPlaylist(
  userId: string,
  name: string,
  description?: string,
  isPublic: boolean = false,
  type?: string // Category type
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, COLLECTION), {
      name,
      description: description || '',
      userId,
      videoIds: [],
      thumbnail: null,
      isPublic,
      type: type || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return docRef.id
  } catch (error) {
    console.error('📝 Error creating playlist:', error)
    throw error
  }
}

// Get user's playlists
export async function getUserPlaylists(userId: string): Promise<Playlist[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date(),
      updatedAt: (doc.data().updatedAt as Timestamp)?.toDate() || new Date()
    })) as Playlist[]
  } catch (error) {
    console.error('📋 Error getting playlists:', error)
    throw error
  }
}

// Get single playlist
export async function getPlaylist(playlistId: string): Promise<Playlist | null> {
  const docRef = doc(db, COLLECTION, playlistId)
  const snapshot = await getDoc(docRef)
  if (!snapshot.exists()) return null
  return {
    id: snapshot.id,
    ...snapshot.data(),
    createdAt: (snapshot.data().createdAt as Timestamp)?.toDate() || new Date(),
    updatedAt: (snapshot.data().updatedAt as Timestamp)?.toDate() || new Date()
  } as Playlist
}

// Add video to playlist
export async function addToPlaylist(playlistId: string, videoId: string, thumbnail?: string): Promise<void> {
  const docRef = doc(db, COLLECTION, playlistId)
  const updateData: Record<string, unknown> = {
    videoIds: arrayUnion(videoId),
    updatedAt: serverTimestamp()
  }
  // Set thumbnail if playlist doesn't have one
  const playlist = await getPlaylist(playlistId)
  if (playlist && !playlist.thumbnail && thumbnail) {
    updateData.thumbnail = thumbnail
  }
  await updateDoc(docRef, updateData)
}

// Remove video from playlist
export async function removeFromPlaylist(playlistId: string, videoId: string): Promise<void> {
  const docRef = doc(db, COLLECTION, playlistId)
  await updateDoc(docRef, {
    videoIds: arrayRemove(videoId),
    updatedAt: serverTimestamp()
  })
}

export async function updatePlaylist(
  playlistId: string,
  data: { name?: string; description?: string; isPublic?: boolean; type?: string }
): Promise<void> {
  const docRef = doc(db, COLLECTION, playlistId)
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  })
}

// Delete playlist
export async function deletePlaylist(playlistId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, playlistId))
}

export async function getPlaylistsContainingVideo(userId: string, videoId: string): Promise<string[]> {
  const playlists = await getUserPlaylists(userId)
  return playlists.filter(p => p.videoIds.includes(videoId)).map(p => p.id)
}

// Add a playlist to another playlist (nested playlist)
export async function addPlaylistToPlaylist(parentPlaylistId: string, childPlaylistId: string): Promise<void> {
  const docRef = doc(db, COLLECTION, parentPlaylistId)
  const parentPlaylist = await getPlaylist(parentPlaylistId)
  const childPlaylist = await getPlaylist(childPlaylistId)

  if (!parentPlaylist || !childPlaylist) {
    throw new Error('Playlist not found')
  }

  // Prevent circular references
  if (childPlaylist.childPlaylistIds?.includes(parentPlaylistId)) {
    throw new Error('Cannot add: would create circular reference')
  }

  const newItem: PlaylistItem = {
    id: childPlaylistId,
    type: 'playlist',
    addedAt: new Date()
  }

  await updateDoc(docRef, {
    items: arrayUnion(newItem),
    childPlaylistIds: arrayUnion(childPlaylistId),
    updatedAt: serverTimestamp()
  })
}

// Remove a playlist from another playlist
export async function removePlaylistFromPlaylist(parentPlaylistId: string, childPlaylistId: string): Promise<void> {
  const docRef = doc(db, COLLECTION, parentPlaylistId)
  const parentPlaylist = await getPlaylist(parentPlaylistId)

  if (!parentPlaylist) return

  // Remove from items array
  const updatedItems = (parentPlaylist.items || []).filter(
    item => !(item.type === 'playlist' && item.id === childPlaylistId)
  )

  // Remove from childPlaylistIds
  const updatedChildIds = (parentPlaylist.childPlaylistIds || []).filter(
    id => id !== childPlaylistId
  )

  await updateDoc(docRef, {
    items: updatedItems,
    childPlaylistIds: updatedChildIds,
    updatedAt: serverTimestamp()
  })
}

// Get all items (videos + playlists) for a playlist with full data
export async function getPlaylistItems(playlistId: string): Promise<{
  videos: any[]
  playlists: Playlist[]
  allVideoIds: string[] // Flattened list of all video IDs including nested
}> {
  const playlist = await getPlaylist(playlistId)
  if (!playlist) return { videos: [], playlists: [], allVideoIds: [] }

  const { firebaseMediaService } = await import('./firebase-media-service')

  // Get direct videos
  const videoPromises = playlist.videoIds.map(id => firebaseMediaService.getMediaById(id))
  const videos = (await Promise.all(videoPromises)).filter(Boolean)

  // Get nested playlists
  const childPlaylistIds = playlist.childPlaylistIds || []
  const playlistPromises = childPlaylistIds.map(id => getPlaylist(id))
  const playlists = (await Promise.all(playlistPromises)).filter(Boolean) as Playlist[]

  // Flatten all video IDs (including from nested playlists)
  let allVideoIds = [...playlist.videoIds]
  for (const childPlaylist of playlists) {
    allVideoIds = [...allVideoIds, ...childPlaylist.videoIds]
  }

  return { videos, playlists, allVideoIds: [...new Set(allVideoIds)] }
}

// Get user's playlists that can be added to another playlist (excludes system playlists and self)
export async function getAddablePlaylistsForUser(userId: string, excludePlaylistId?: string): Promise<Playlist[]> {
  const playlists = await getUserPlaylists(userId)
  return playlists.filter(p =>
    !p.isSystem &&
    p.id !== excludePlaylistId
  )
}

// Get all public playlists (for browsing)
export async function getPublicPlaylists(limitCount: number = 20): Promise<Playlist[]> {
  try {
    const q = query(
      collection(db, COLLECTION),
      where('isPublic', '==', true),
      where('isSystem', '==', false),
      orderBy('updatedAt', 'desc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.slice(0, limitCount).map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date(),
      updatedAt: (doc.data().updatedAt as Timestamp)?.toDate() || new Date()
    })) as Playlist[]
  } catch (error) {
    console.error('🌐 Error getting public playlists:', error)
    // Fallback: try without isSystem filter (for older playlists)
    try {
      const q = query(
        collection(db, COLLECTION),
        where('isPublic', '==', true),
        orderBy('updatedAt', 'desc')
      )
      const snapshot = await getDocs(q)
      return snapshot.docs
        .filter(doc => !doc.data().isSystem)
        .slice(0, limitCount)
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: (doc.data().createdAt as Timestamp)?.toDate() || new Date(),
          updatedAt: (doc.data().updatedAt as Timestamp)?.toDate() || new Date()
        })) as Playlist[]
    } catch (fallbackError) {
      console.error('🌐 Fallback also failed:', fallbackError)
      return []
    }
  }
}
