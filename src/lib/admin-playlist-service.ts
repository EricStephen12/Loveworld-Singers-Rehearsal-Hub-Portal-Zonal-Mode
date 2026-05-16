import { BackendAPI } from './api-client';

/**
 * ADMIN PLAYLIST SERVICE (WEBSITE CLIENT)
 * This is a COMPATIBILITY PROXY for playlist management.
 */

export interface AdminPlaylist {
  id: string
  name: string
  description: string
  thumbnail: string
  videoIds: string[]
  childPlaylistIds?: string[]
  isPublic: boolean
  isFeatured: boolean
  forHQ: boolean
  zoneId?: string
  type?: string
  createdBy: string
  createdByName: string
  createdAt: Date
  updatedAt: Date
}

const COLLECTION = 'admin_playlists';

// Get all admin playlists
export async function getAdminPlaylists(): Promise<AdminPlaylist[]> {
  const response = await BackendAPI.generic.list(COLLECTION);
  return response.data || [];
}

// Get public playlists
export async function getPublicAdminPlaylists(isHQZone: boolean, currentZoneId?: string, categoryType?: string): Promise<AdminPlaylist[]> {
  const allPlaylists = await getAdminPlaylists();
  
  return allPlaylists.filter((p: any) => {
    if (!p.isPublic) return false;
    if (isHQZone) {
      return p.forHQ === true;
    } else {
      return p.forHQ === false && (!p.zoneId || p.zoneId === currentZoneId);
    }
  });
}

// Get featured playlists
export async function getFeaturedPlaylists(isHQZone: boolean): Promise<AdminPlaylist[]> {
  const allPlaylists = await getAdminPlaylists();
  return allPlaylists.filter((p: any) => p.isFeatured && p.forHQ === isHQZone);
}

// Get single playlist
export async function getAdminPlaylist(id: string): Promise<AdminPlaylist | null> {
  const response = await BackendAPI.generic.get(COLLECTION, id);
  return response.data;
}

// Create playlist
export async function createAdminPlaylist(data: any): Promise<string> {
  const response = await BackendAPI.generic.create(COLLECTION, {
    ...data,
    videoIds: [],
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return response.id;
}

// Update playlist
export async function updateAdminPlaylist(id: string, data: any): Promise<void> {
  await BackendAPI.generic.update(COLLECTION, id, {
    ...data,
    updatedAt: new Date()
  });
}

// Delete playlist
export async function deleteAdminPlaylist(id: string): Promise<void> {
  await BackendAPI.generic.delete(COLLECTION, id);
}

// Add video to playlist
export async function addVideoToPlaylist(playlistId: string, videoId: string): Promise<void> {
  const playlist = await getAdminPlaylist(playlistId);
  if (!playlist) return;

  if (!playlist.videoIds.includes(videoId)) {
    await updateAdminPlaylist(playlistId, {
      videoIds: [...playlist.videoIds, videoId]
    });
  }
}

// Remove video from playlist
export async function removeVideoFromPlaylist(playlistId: string, videoId: string): Promise<void> {
  const playlist = await getAdminPlaylist(playlistId);
  if (!playlist) return;

  await updateAdminPlaylist(playlistId, {
    videoIds: playlist.videoIds.filter((id: string) => id !== videoId)
  });
}
