import { FirebaseDatabaseService } from './firebase-database';
import { BackendAPI } from './api-client';

const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/+$/, '');

/**
 * SUBGROUP DATABASE SERVICE (WEBSITE CLIENT)
 * Compatibility proxy for subgroup-specific operations.
 */

export interface SubGroupSong {
  id: string;
  title: string;
  lyrics: string;
  writer: string;
  category: string;
  key: string;
  tempo: string;
  leadSinger: string;
  audioUrl?: string;
  audioFile?: string;
  audioUrls?: any;
  rehearsalCount: number;
  isActive?: boolean;
  status?: 'unheard' | 'heard';
  praiseNightId?: string;
  solfa?: string;
  solfas?: string;
  comments?: any[];
  history?: any[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SubGroupRehearsal {
  id: string;
  title: string;
  name: string;
  date: string;
  time: string;
  location: string;
  songIds: string[];
  bannerImage?: string;
  category?: 'ongoing' | 'pre-rehearsal' | 'archive';
  subGroupName?: string;
  subGroupId: string;
}

export class SubGroupDatabaseService {
  // --- CORE METHODS ---

  static async getSubGroupSongs(subGroupId: string): Promise<SubGroupSong[]> {
    const response = await BackendAPI.generic.list('subgroup_songs', 500, 'subGroupId', subGroupId, '==');
    return response.data || [];
  }

  static subscribeToSongs(subGroupId: string, onUpdate: (songs: SubGroupSong[]) => void, onError?: (error: any) => void) {
    return FirebaseDatabaseService.subscribeToCollectionWhere('subgroup_songs', 'subGroupId', '==', subGroupId, onUpdate);
  }

  static subscribeToSubGroupSongs(subGroupId: string, onUpdate: (songs: SubGroupSong[]) => void, onError?: (error: any) => void) {
    return this.subscribeToSongs(subGroupId, onUpdate, onError);
  }

  static async getSubGroupRehearsals(subGroupId: string): Promise<SubGroupRehearsal[]> {
    const response = await BackendAPI.generic.list('subgroup_praise_nights', 500, 'subGroupId', subGroupId, '==');
    return response.data || [];
  }

  static subscribeToRehearsals(subGroupId: string, onUpdate: (rehearsals: SubGroupRehearsal[]) => void, onError?: (error: any) => void) {
    return FirebaseDatabaseService.subscribeToCollectionWhere('subgroup_praise_nights', 'subGroupId', '==', subGroupId, onUpdate);
  }

  static subscribeToRehearsalSongs(songIds: string[], onUpdate: (songs: SubGroupSong[]) => void, onError?: (error: any) => void) {
    return FirebaseDatabaseService.subscribeToCollectionWhere('subgroup_songs', 'id', 'in', songIds, onUpdate);
  }

  static async getRehearsalById(rehearsalId: string): Promise<SubGroupRehearsal | undefined> {
    const data = await FirebaseDatabaseService.getDocument('subgroup_praise_nights', rehearsalId);
    return data;
  }

  static async getSongsByRehearsalId(rehearsalId: string): Promise<SubGroupSong[]> {
    const rehearsal = await this.getRehearsalById(rehearsalId);
    if (!rehearsal) return [];
    const allSongs = await this.getSubGroupSongs(rehearsal.subGroupId);
    return allSongs.filter((s: SubGroupSong) => (rehearsal.songIds || []).includes(s.id));
  }

  static async getSubGroupSongsByRehearsalId(rehearsalId: string) {
    return await this.getSongsByRehearsalId(rehearsalId);
  }

  // --- REHEARSAL CRUD ---

  static async createRehearsal(subGroupId: string, zoneId: string, data: any, _userId?: string) {
    return await BackendAPI.generic.create('subgroup_praise_nights', { ...data, subGroupId, zoneId, createdAt: new Date() });
  }

  static async updateRehearsal(id: string, data: any) {
    return await BackendAPI.generic.update('subgroup_praise_nights', id, data);
  }

  static async deleteRehearsal(id: string) {
    return await BackendAPI.generic.delete('subgroup_praise_nights', id);
  }

  static async addSongToRehearsal(rehearsalId: string, songId: string) {
    const rehearsal = await this.getRehearsalById(rehearsalId);
    if (!rehearsal) return;
    const songIds = Array.from(new Set([...(rehearsal.songIds || []), songId]));
    return await this.updateRehearsal(rehearsalId, { songIds });
  }

  // --- SONG CRUD ---

  static async createSong(subGroupId: string, zoneId: string, data: any, userId?: string) {
    return await BackendAPI.generic.create('subgroup_songs', { ...data, subGroupId, zoneId, createdBy: userId, createdAt: new Date() });
  }

  static async updateSong(id: string, data: any) {
    return await BackendAPI.generic.update('subgroup_songs', id, data);
  }

  static async deleteSong(id: string) {
    return await BackendAPI.generic.delete('subgroup_songs', id);
  }

  static async toggleSongStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === 'unheard' ? 'heard' : 'unheard';
    return await this.updateSong(id, { status: newStatus });
  }

  static async toggleSongActive(id: string, currentActive: boolean) {
    return await this.updateSong(id, { isActive: !currentActive });
  }

  // --- MEMBER MANAGEMENT ---

  static async getSubGroupMembers(subGroupId: string): Promise<any[]> {
    try {
      // 1. Get subgroup document to get memberIds
      const subGroup = await FirebaseDatabaseService.getDocument('subgroups', subGroupId);
      if (!subGroup || !subGroup.memberIds || subGroup.memberIds.length === 0) {
        return [];
      }

      // 2. Fetch profiles for all memberIds using optimized 'in' query
      // Generic API splitting by comma for 'in' operator
      const response = await BackendAPI.generic.list(
        'profiles', 
        100, 
        '__name__', // Use document ID field
        subGroup.memberIds.join(','), 
        'in'
      );
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching subgroup members:', error);
      return [];
    }
  }

  static async addMembers(subGroupId: string, zoneId: string, memberIds: string[], _userId?: string) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/subgroups/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subGroupId, zoneId, memberIds })
      });
      return await response.json();
    } catch (error) {
      console.error('Error adding members:', error);
      return { success: false, error: 'Failed to add members' };
    }
  }

  static async removeMember(subGroupId: string, userId: string) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/subgroups/members?subGroupId=${subGroupId}&userId=${userId}`, {
        method: 'DELETE'
      });
      return await response.json();
    } catch (error) {
      console.error('Error removing member:', error);
      return { success: false, error: 'Failed to remove member' };
    }
  }

  static async searchProfiles(term: string) {
    return await FirebaseDatabaseService.searchProfiles(term);
  }

  // --- MEMBER DASHBOARD ---

  static async getMemberRehearsals(zoneId: string, userId: string) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/subgroups/member-rehearsals?zoneId=${zoneId}&userId=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch rehearsals');
      return await response.json();
    } catch (error) {
      console.warn('Subgroup: Failed to fetch member rehearsals:', error);
      return { zoneRehearsals: [], subGroupRehearsals: [], combined: [] }; // Return empty structure on error to stop loading state without crashing
    }
  }

  static subscribeToMemberRehearsals(zoneId: string, userId: string, onUpdate: (data: any) => void) {
    this.getMemberRehearsals(zoneId, userId)
      .then(data => onUpdate(data))
      .catch(() => onUpdate([])); // Ensure loading state is cleared even on failure
    return () => {}; // Polling or real-time stub
  }

  // --- NOTIFICATIONS ---

  static async sendSubGroupNotification(subGroupId: string, titleOrData: string | any, body?: string, data?: any) {
    const title = typeof titleOrData === 'string' ? titleOrData : titleOrData.title;
    const message = typeof titleOrData === 'string' ? body : (titleOrData.message || body);
    const notificationData = typeof titleOrData === 'string' ? data : (titleOrData.data || data);

    const members = await this.getSubGroupMembers(subGroupId);
    const recipientIds = members.map((m: any) => m.userId);
    
    await fetch(`${BACKEND_URL}/api/send-notification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipientIds, title, body: message, data: { ...notificationData, subGroupId } })
    });
    
    return { success: true };
  }

  // --- MASTER LIBRARY CLONING ---

  static async getMasterLibrarySongs() {
    return await FirebaseDatabaseService.getCollection('master_songs');
  }

  static async importMasterSongToSubGroup(masterSong: any, subGroupId: string, zoneId: string, _userId?: string) {
    return await BackendAPI.songs.create({
      ...masterSong,
      subGroupId,
      zoneId,
      importedFrom: 'master',
      originalSongId: masterSong.id
    });
  }

  static async importSongsFromZone(subGroupId: string, zoneId: string, songs: any[], _userId?: string) {
    for (const song of songs) {
      await this.createSong(subGroupId, zoneId, song);
    }
    return { success: true };
  }
}
