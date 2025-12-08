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

export interface Playlist {
  id: string
  name: string
  description?: string
  userId: string
  videoIds: string[]
  thumbnail?: string
  isPublic: boolean
  isSystem?: boolean // For Liked Videos, Watch Later
  systemType?: 'liked' | 'watch_later'
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
}

// Toggle watch later on a video
export async function toggleWatchLater(userId: string, videoId: string, thumbnail?: string): Promise<boolean> {
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
}

// Check if video is liked
export async function isVideoLiked(userId: string, videoId: string): Promise<boolean> {
  const playlistId = getSystemPlaylistId(userId, 'liked')
  const playlist = await getPlaylist(playlistId)
  return playlist?.videoIds.includes(videoId) || false
}

// Check if video is in watch later
export async function isInWatchLater(userId: string, videoId: string): Promise<boolean> {
  const playlistId = getSystemPlaylistId(userId, 'watch_later')
  const playlist = await getPlaylist(playlistId)
  return playlist?.videoIds.includes(videoId) || false
}

// Create a new playlist
export async function createPlaylist(
  userId: string,
  name: string,
  description?: string
): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    name,
    description: description || '',
    userId,
    videoIds: [],
    thumbnail: null,
    isPublic: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
  return docRef.id
}

// Get user's playlists
export async function getUserPlaylists(userId: string): Promise<Playlist[]> {
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

// Update playlist
export async function updatePlaylist(
  playlistId: string,
  data: { name?: string; description?: string; isPublic?: boolean }
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

// Check if video is in any of user's playlists
export async function getPlaylistsContainingVideo(userId: string, videoId: string): Promise<string[]> {
  const playlists = await getUserPlaylists(userId)
  return playlists.filter(p => p.videoIds.includes(videoId)).map(p => p.id)
}
