/**
 * Sub-Group Database Service
 * Handles CRUD operations for sub-group songs, rehearsals, and members
 */

import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  onSnapshot,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  Timestamp,
  FirestoreError,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase-setup';
import { authedFetch } from '@/lib/authed-fetch'

// Types
export interface SubGroupComment {
  id: string;
  text: string;
  audioUrl?: string;
  date: string;
  author: string;
}

export interface SubGroupSong {
  id: string;
  subGroupId: string;
  zoneId: string;
  title: string;
  lyrics?: string;
  solfa?: string;
  key?: string;
  tempo?: string;
  writer?: string;
  leadSinger?: string;
  category?: string;
  status?: 'heard' | 'unheard';
  isActive?: boolean;
  audioUrls?: {
    full?: string;
    soprano?: string;
    alto?: string;
    tenor?: string;
    bass?: string;
  };
  importedFrom?: 'zone';
  originalSongId?: string;
  importedAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  comments?: SubGroupComment[];
  // Mapping to PraiseNightSong for modal compatibility
  audioFile?: string;
  praiseNightId?: string;
  history?: any[];
}

export interface SubGroupRehearsal {
  id: string;
  subGroupId: string;
  zoneId: string;
  name: string;
  date: string;
  location?: string;
  description?: string;
  songIds: string[];
  scope: 'subgroup'; // Always 'subgroup' for sub-group rehearsals
  category: 'ongoing' | 'archive' | 'pre-rehearsal';
  scopeLabel?: string; // For display purposes in combined lists
  subGroupName?: string; // For display purposes
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  bannerImage?: string;
}

export class SubGroupDatabaseService {
  /**
   * Static helper to strip HTML from lyrics for a clean text-only experience.
   */
  private static sanitizeLyrics(text: string): string {
    if (!text) return '';
    // Preserve HTML but trim whitespace
    return text.trim();
  }

  // Songs

  /**
   * Get all songs for a sub-group
   */
  static async getSubGroupSongs(subGroupId: string): Promise<SubGroupSong[]> {
    try {
      const songsRef = collection(db, 'subgroup_songs');
      const q = query(
        songsRef,
        where('subGroupId', '==', subGroupId),
        orderBy('title', 'asc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        importedAt: doc.data().importedAt?.toDate()
      })) as SubGroupSong[];
    } catch (error) {
      console.error('Error getting sub-group songs:', error);
      return [];
    }
  }

  /**
   * Subscribe to sub-group songs in real-time
   */
  static subscribeToSubGroupSongs(
    subGroupId: string,
    onUpdate: (songs: SubGroupSong[]) => void,
    onError?: (error: FirestoreError) => void
  ) {
    const songsRef = collection(db, 'subgroup_songs');
    const q = query(
      songsRef,
      where('subGroupId', '==', subGroupId),
      orderBy('title', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const songs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        importedAt: doc.data().importedAt?.toDate()
      })) as SubGroupSong[];
      onUpdate(songs);
    }, (error) => {
      console.error('Sub-group songs subscription error:', error);
      if (onError) onError(error);
    });
  }

  /**
   * Get songs for a specific rehearsal
   */
  static async getSubGroupSongsByRehearsalId(rehearsalId: string): Promise<SubGroupSong[]> {
    try {
      const rehearsalRef = doc(db, 'subgroup_praise_nights', rehearsalId);
      const rehearsalSnap = await getDoc(rehearsalRef);
      
      if (!rehearsalSnap.exists()) return [];
      
      const songIds = rehearsalSnap.data().songIds || [];
      if (songIds.length === 0) return [];
      
      // Fetch songs in batches of 10 (Firebase 'in' limit)
      const songs: SubGroupSong[] = [];
      const songsRef = collection(db, 'subgroup_songs');
      
      for (let i = 0; i < songIds.length; i += 10) {
        const batch = songIds.slice(i, i + 10);
        const q = query(songsRef, where('__name__', 'in', batch));
        const snapshot = await getDocs(q);
        songs.push(...snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date()
        })) as SubGroupSong[]);
      }
      
      return songs;
    } catch (error) {
      console.error('Error getting rehearsal songs:', error);
      return [];
    }
  }

  /**
   * Create a new song for a sub-group
   */
  static async createSong(
    subGroupId: string,
    zoneId: string,
    songData: Partial<SubGroupSong>,
    createdBy: string
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const songsRef = collection(db, 'subgroup_songs');
      const now = Timestamp.now();

      const newSong = {
        subGroupId,
        zoneId,
        title: songData.title || '',
        lyrics: this.sanitizeLyrics(songData.lyrics || ''),
        solfa: songData.solfa || '',
        key: songData.key || '',
        tempo: songData.tempo || '',
        writer: songData.writer || '',
        leadSinger: songData.leadSinger || '',
        category: songData.category || '',
        status: 'unheard',
        isActive: true,
        audioFile: songData.audioFile || '',
        audioUrls: songData.audioUrls || {},
        createdBy,
        createdAt: now,
        updatedAt: now
      };

      const docRef = await addDoc(songsRef, newSong);

      // Trigger FCM push notification for subgroup members
      try {
        await this.sendSubGroupNotification(subGroupId, {
          title: ' New Song Added',
          message: `"${newSong.title}" has been added to your subgroup library.`,
          type: 'zone'
        });
      } catch (fcmError) {
 console.error('[SubGroupService] FCM error:', fcmError);
      }

      return { success: true, id: docRef.id };
    } catch (error) {
 console.error('Error creating sub-group song:', error);
      return { success: false, error: 'Failed to create song' };
    }
  }

  /**
   * Get all songs from the official Master Library
   */
  static async getMasterLibrarySongs(): Promise<any[]> {
    try {
      const masterSongsRef = collection(db, 'master_songs');
      const q = query(
        masterSongsRef,
        orderBy('title', 'asc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting Master library songs:', error);
      return [];
    }
  }

  /**
   * Import a single song from the Master Library to the Subgroup
   */
  static async importMasterSongToSubGroup(
    masterSong: any,
    subGroupId: string,
    zoneId: string,
    createdBy: string
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const songsRef = collection(db, 'subgroup_songs');
      const now = Timestamp.now();

      const newSong = {
        subGroupId,
        zoneId,
        title: masterSong.title || '',
        lyrics: this.sanitizeLyrics(masterSong.lyrics || ''),
        solfa: masterSong.solfa || '',
        key: masterSong.key || '',
        tempo: masterSong.tempo || '',
        writer: masterSong.writer || '',
        leadSinger: masterSong.leadSinger || '',
        category: masterSong.category || '',
        status: 'unheard',
        isActive: true,
        audioFile: masterSong.audioFile || (masterSong.audioUrls?.full || masterSong.audioUrls?.main || ''),
        audioUrls: masterSong.audioUrls || {},
        importedFrom: 'master',
        originalSongId: masterSong.id,
        importedAt: now,
        createdBy,
        createdAt: now,
        updatedAt: now
      };

      const docRef = await addDoc(songsRef, newSong);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error importing master song:', error);
      return { success: false, error: 'Failed to import song' };
    }
  }

  /**
   * Get all songs from the official Zone Library
   */
  static async getZoneLibrarySongs(zoneId: string): Promise<any[]> {
    try {
      const zoneSongsRef = collection(db, 'zone_songs');
      const q = query(
        zoneSongsRef,
        where('zoneId', '==', zoneId),
        orderBy('title', 'asc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting zone songs:', error);
      return [];
    }
  }

  /**
   * Import a single song from the Zone Library to the Subgroup
   */
  static async importZoneSongToSubGroup(
    zoneSong: any,
    subGroupId: string,
    zoneId: string,
    createdBy: string
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const songsRef = collection(db, 'subgroup_songs');
      const now = Timestamp.now();

      const newSong = {
        subGroupId,
        zoneId,
        title: zoneSong.title || '',
        lyrics: this.sanitizeLyrics(zoneSong.lyrics || ''),
        solfa: zoneSong.solfa || '',
        key: zoneSong.key || '',
        tempo: zoneSong.tempo || '',
        writer: zoneSong.writer || '',
        leadSinger: zoneSong.leadSinger || '',
        category: zoneSong.category || '',
        status: 'unheard',
        isActive: true,
        audioFile: zoneSong.audioFile || (zoneSong.audioUrls?.full || zoneSong.audioUrls?.main || ''),
        audioUrls: zoneSong.audioUrls || {},
        importedFrom: 'zone',
        originalSongId: zoneSong.id || zoneSong.firebaseId,
        importedAt: now,
        createdBy,
        createdAt: now,
        updatedAt: now
      };

      const docRef = await addDoc(songsRef, newSong);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error importing zone song:', error);
      return { success: false, error: 'Failed to import song' };
    }
  }

  /**
   * Import songs from zone to sub-group
   */
  static async importSongsFromZone(
    subGroupId: string,
    zoneId: string,
    zoneSongs: any[],
    importedBy: string
  ): Promise<{ success: boolean; count: number; error?: string }> {
    try {
      const songsRef = collection(db, 'subgroup_songs');
      const now = Timestamp.now();
      let count = 0;

      for (const zoneSong of zoneSongs) {
        const newSong = {
          subGroupId,
          zoneId,
          title: zoneSong.title || '',
          lyrics: this.sanitizeLyrics(zoneSong.lyrics || ''),
          solfa: zoneSong.solfa || '',
          key: zoneSong.key || '',
          tempo: zoneSong.tempo || '',
          writer: zoneSong.writer || '',
          leadSinger: zoneSong.leadSinger || '',
          category: zoneSong.category || '',
          status: 'unheard',
          isActive: true,
          audioFile: zoneSong.audioFile || (zoneSong.audioUrls?.full || zoneSong.audioUrls?.main || ''),
          audioUrls: zoneSong.audioUrls || {},
          importedFrom: 'zone',
          originalSongId: zoneSong.id || zoneSong.firebaseId,
          importedAt: now,
          createdBy: importedBy,
          createdAt: now,
          updatedAt: now
        };

        await addDoc(songsRef, newSong);
        count++;
      }

      // Trigger FCM push notification for imported songs
      if (count > 0) {
        try {
          await this.sendSubGroupNotification(subGroupId, {
            title: ' New Songs Imported',
            message: `${count} song(s) have been imported to your subgroup library.`,
            type: 'zone'
          });
        } catch (fcmError) {
 console.error('[SubGroupService] FCM error (import):', fcmError);
        }
      }

      return { success: true, count };
    } catch (error) {
 console.error('Error importing songs:', error);
      return { success: false, count: 0, error: 'Failed to import songs' };
    }
  }

  /**
   * Update a subgroup song
   */
  static async updateSong(
    songId: string,
    updates: Partial<SubGroupSong>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const songRef = doc(db, 'subgroup_songs', songId);
      const now = Timestamp.now();

      const updateData: any = {
        ...updates,
        updatedAt: now
      };

      if (updates.lyrics) {
        updateData.lyrics = this.sanitizeLyrics(updates.lyrics);
      }

      // Sync audioFile if only audioUrls was provided (Admin UI support)
      if (updates.audioUrls?.full && !updates.audioFile) {
        updateData.audioFile = updates.audioUrls.full;
      }

      await updateDoc(songRef, updateData);
      return { success: true };
    } catch (error) {
      console.error('Error updating song:', error);
      return { success: false, error: 'Failed to update song' };
    }
  }

  /**
   * Delete a sub-group song
   */
  static async deleteSong(songId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await deleteDoc(doc(db, 'subgroup_songs', songId));
      return { success: true };
    } catch (error) {
  console.error('Error deleting song:', error);
      return { success: false, error: 'Failed to delete song' };
    }
  }

  /**
   * Toggle song status (heard/unheard)
   */
  static async toggleSongStatus(songId: string, currentStatus: string): Promise<{ success: boolean; error?: string }> {
    try {
      const newStatus = currentStatus === 'heard' ? 'unheard' : 'heard';
      await updateDoc(doc(db, 'subgroup_songs', songId), {
        status: newStatus,
        updatedAt: Timestamp.now()
      });
      return { success: true };
    } catch (error) {
      console.error('Error toggling song status:', error);
      return { success: false, error: 'Failed to toggle status' };
    }
  }

  /**
   * Toggle song active state
   */
  static async toggleSongActive(songId: string, currentActive: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      await updateDoc(doc(db, 'subgroup_songs', songId), {
        isActive: !currentActive,
        updatedAt: Timestamp.now()
      });
      return { success: true };
    } catch (error) {
      console.error('Error toggling song active status:', error);
      return { success: false, error: 'Failed to toggle active status' };
    }
  }

  // Rehearsals

  /**
   * Real-time subscription to subgroup rehearsals
   */
  static subscribeToRehearsals(
    subGroupId: string,
    onUpdate: (rehearsals: SubGroupRehearsal[]) => void,
    onError?: (error: FirestoreError) => void
  ) {
    const rehearsalsRef = collection(db, 'subgroup_praise_nights');
    const q = query(
      rehearsalsRef,
      where('subGroupId', '==', subGroupId)
    );

    return onSnapshot(q, (snapshot) => {
      const rehearsals = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as SubGroupRehearsal[];
      onUpdate(rehearsals);
    }, (error) => {
      console.error('Rehearsal subscription error:', error);
      if (onError) onError(error);
    });
  }

  /**
   * Get all rehearsals for a sub-group (Legacy)
   */
  static async getSubGroupRehearsals(subGroupId: string): Promise<SubGroupRehearsal[]> {
    try {
      const rehearsalsRef = collection(db, 'subgroup_praise_nights');
      const q = query(
        rehearsalsRef,
        where('subGroupId', '==', subGroupId)
        // orderBy('date', 'desc') // Temporarily disabled to avoid missing index errors
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as SubGroupRehearsal[];
    } catch (error) {
  console.error('Error getting sub-group rehearsals:', error);
      return [];
    }
  }

  /**
   * Real-time subscription to songs for a specific rehearsal
   */
  static subscribeToRehearsalSongs(
    songIds: string[],
    onUpdate: (songs: SubGroupSong[]) => void,
    onError?: (error: FirestoreError) => void
  ) {
    if (!songIds || songIds.length === 0) {
      onUpdate([]);
      return () => { };
    }

    const songsRef = collection(db, 'subgroup_songs');
    
    // Firestore 'in' has a limit of 10-30 depending on version. 
    // For now, let's take up to 30.
    const limitedIds = songIds.slice(0, 30);
    
    const q = query(
      songsRef,
      where('__name__', 'in', limitedIds)
    );

    return onSnapshot(q, (snapshot) => {
      const songs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as SubGroupSong[];
      onUpdate(songs);
    }, (error) => {
      console.error('Songs subscription error:', error);
      if (onError) onError(error);
    });
  }

  /**
   * Get a single rehearsal by ID
   */
  static async getRehearsalById(rehearsalId: string): Promise<SubGroupRehearsal | null> {
    try {
      const rehearsalRef = doc(db, 'subgroup_praise_nights', rehearsalId);
      const snapshot = await getDoc(rehearsalRef);

      if (!snapshot.exists()) {
        return null;
      }

      const data = snapshot.data();
      return {
        id: snapshot.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as SubGroupRehearsal;
    } catch (error) {
  console.error('Error getting rehearsal by ID:', error);
      return null;
    }
  }

  /**
   * Create a new rehearsal for a sub-group
   */
  static async createRehearsal(
    subGroupId: string,
    zoneId: string,
    rehearsalData: { name: string; date: string; location?: string; description?: string; subGroupName?: string; category?: 'ongoing' | 'archive' | 'pre-rehearsal' },
    createdBy: string,
    sendNotification: boolean = true
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const rehearsalsRef = collection(db, 'subgroup_praise_nights');
      const now = Timestamp.now();

      const newRehearsal = {
        subGroupId,
        zoneId,
        name: rehearsalData.name,
        date: rehearsalData.date,
        location: rehearsalData.location || '',
        description: rehearsalData.description || '',
        songIds: [],
        scope: 'subgroup', // Mark as sub-group rehearsal
        category: rehearsalData.category || 'ongoing', 
        subGroupName: rehearsalData.subGroupName || '',
        createdBy,
        createdAt: now,
        updatedAt: now
      };

      const docRef = await addDoc(rehearsalsRef, newRehearsal);

      // Send notification to sub-group members
      if (sendNotification) {
        const formattedDate = new Date(rehearsalData.date).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        });

        await this.sendSubGroupNotification(subGroupId, {
          title: ' New Rehearsal Scheduled',
          message: `${rehearsalData.name} on ${formattedDate}${rehearsalData.location ? ` at ${rehearsalData.location}` : ''}`,
          type: 'rehearsal',
          rehearsalId: docRef.id
        });
      }

      return { success: true, id: docRef.id };
    } catch (error) {
 console.error('Error creating rehearsal:', error);
      return { success: false, error: 'Failed to create rehearsal' };
    }
  }

  /**
   * Update a rehearsal
   */
  static async updateRehearsal(
    rehearsalId: string,
    updates: Partial<SubGroupRehearsal>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const rehearsalRef = doc(db, 'subgroup_praise_nights', rehearsalId);
      await updateDoc(rehearsalRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });

      return { success: true };
    } catch (error) {
 console.error('Error updating rehearsal:', error);
      return { success: false, error: 'Failed to update rehearsal' };
    }
  }

  /**
   * Delete a rehearsal
   */
  static async deleteRehearsal(rehearsalId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await deleteDoc(doc(db, 'subgroup_praise_nights', rehearsalId));
      return { success: true };
    } catch (error) {
 console.error('Error deleting rehearsal:', error);
      return { success: false, error: 'Failed to delete rehearsal' };
    }
  }

  /**
   * Add song to rehearsal
   */
  static async addSongToRehearsal(
    rehearsalId: string,
    songId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const rehearsalRef = doc(db, 'subgroup_praise_nights', rehearsalId);
      await updateDoc(rehearsalRef, {
        songIds: arrayUnion(songId),
        updatedAt: Timestamp.now()
      });
      return { success: true };
    } catch (error) {
 console.error('Error adding song to rehearsal:', error);
      return { success: false, error: 'Failed to add song' };
    }
  }

  // Members

  /**
   * Add members to a sub-group
   */
  static async addMembers(
    subGroupId: string,
    zoneId: string,
    memberIds: string[]
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const subGroupRef = doc(db, 'subgroups', subGroupId);
      
      // 1. Ensure all members are part of the zone_members collection
      const zoneMembersRef = collection(db, 'zone_members');
      
      for (const memberId of memberIds) {
        const q = query(zoneMembersRef, where('userId', '==', memberId), where('zoneId', '==', zoneId));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          // Member is not in the zone yet, add them
          const profileRef = doc(db, 'profiles', memberId);
          const profileSnap = await getDoc(profileRef);
          const profileData = profileSnap.exists() ? profileSnap.data() : {};
          
          const newMemberId = `mem_${Date.now()}_${memberId}`;
          await addDoc(zoneMembersRef, {
            id: newMemberId,
            zoneId,
            userId: memberId,
            userEmail: profileData.email || '',
            userName: profileData.first_name ? `${profileData.first_name} ${profileData.last_name || ''}` : (profileData.display_name || 'User'),
            role: 'member',
            joinedAt: Timestamp.now(),
            status: 'active'
          });
        }
      }

      // 2. Add to subgroup
      await updateDoc(subGroupRef, {
        memberIds: arrayUnion(...memberIds),
        updatedAt: Timestamp.now()
      });

      return { success: true };
    } catch (error) {
 console.error('Error adding members:', error);
      return { success: false, error: 'Failed to add members' };
    }
  }

  /**
   * Remove a member from a sub-group
   */
  static async removeMember(
    subGroupId: string,
    memberId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const subGroupRef = doc(db, 'subgroups', subGroupId);
      await updateDoc(subGroupRef, {
        memberIds: arrayRemove(memberId),
        updatedAt: Timestamp.now()
      });

      return { success: true };
    } catch (error) {
 console.error('Error removing member:', error);
      return { success: false, error: 'Failed to remove member' };
    }
  }

  /**
   * Get sub-group members with their profile data
   */
  static async getSubGroupMembers(subGroupId: string): Promise<any[]> {
    try {
      // Get sub-group to get memberIds
      const subGroupRef = doc(db, 'subgroups', subGroupId);
      const subGroupSnap = await getDoc(subGroupRef);

      if (!subGroupSnap.exists()) {
        return [];
      }

      const memberIds = subGroupSnap.data().memberIds || [];
      if (memberIds.length === 0) return [];

      // Get member profiles
      const members: any[] = [];
      for (const memberId of memberIds) {
        const profileRef = doc(db, 'profiles', memberId);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          members.push({
            id: memberId,
            ...profileSnap.data()
          });
        }
      }

      return members;
    } catch (error) {
 console.error('Error getting sub-group members:', error);
      return [];
    }
  }

  /**
   * Search all profiles (Global Search)
   */
  static async searchProfiles(searchTerm: string): Promise<any[]> {
    try {
      const profilesRef = collection(db, 'profiles');
      let q;
      
      const queryLower = (searchTerm || '').toLowerCase().trim();

      // Mirroring the main admin's approach: fetch a substantial batch
      if (!queryLower) {
        q = query(profilesRef, limit(200));
      } else if (queryLower.includes('@')) {
        q = query(profilesRef, where('email', '==', queryLower), limit(20));
      } else {
        q = query(profilesRef, limit(500));
      }

      const snapshot = await getDocs(q);
      const results = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Apply client-side filtering for more accuracy
      if (queryLower && !queryLower.includes('@')) {
        return results.filter((p: any) => {
          const fullName = `${p.first_name || ''} ${p.last_name || ''}`.toLowerCase();
          const displayName = (p.display_name || '').toLowerCase();
          const email = (p.email || '').toLowerCase();
          return fullName.includes(queryLower) || displayName.includes(queryLower) || email.includes(queryLower);
        }).slice(0, 25);
      }

      return results.slice(0, 25);
    } catch (error) {
      console.error('Error searching profiles:', error);
      return [];
    }
  }

  // Stats

  /**
   * Get sub-group statistics
   */
  static async getSubGroupStats(subGroupId: string): Promise<{
    totalMembers: number;
    totalSongs: number;
    totalRehearsals: number;
    upcomingRehearsals: number;
  }> {
    try {
      const [songs, rehearsals, subGroupDoc] = await Promise.all([
        this.getSubGroupSongs(subGroupId),
        this.getSubGroupRehearsals(subGroupId),
        getDoc(doc(db, 'subgroups', subGroupId))
      ]);

      const today = new Date().toISOString().split('T')[0];
      const upcomingRehearsals = rehearsals.filter(r => r.date >= today).length;
      const memberIds = subGroupDoc.exists() ? (subGroupDoc.data().memberIds || []) : [];

      return {
        totalMembers: memberIds.length,
        totalSongs: songs.length,
        totalRehearsals: rehearsals.length,
        upcomingRehearsals
      };
    } catch (error) {
 console.error('Error getting sub-group stats:', error);
      return {
        totalMembers: 0,
        totalSongs: 0,
        totalRehearsals: 0,
        upcomingRehearsals: 0
      };
    }
  }

  // Combined Rehearsals (phase 4)

  /**
   * Get all rehearsals for a member (zone + sub-group)
   * Returns combined list with scope labels
   */
  static async getMemberRehearsals(
    zoneId: string,
    userId: string
  ): Promise<{
    zoneRehearsals: any[];
    subGroupRehearsals: SubGroupRehearsal[];
    combined: (SubGroupRehearsal | (any & { scope: 'zone' }))[];
  }> {
    try {

      // 1 & 2. Get zone rehearsals, user's sub-groups, and coordinated sub-groups in parallel
      const [zoneSnapshot, memberSubGroupsSnapshot, coordinatedSubGroupsSnapshot] = await Promise.all([
        getDocs(query(
          collection(db, 'zone_praise_nights'),
          where('zoneId', '==', zoneId),
          orderBy('date', 'desc')
        )),
        getDocs(query(
          collection(db, 'subgroups'),
          where('memberIds', 'array-contains', userId),
          where('status', '==', 'active')
        )),
        getDocs(query(
          collection(db, 'subgroups'),
          where('coordinatorId', '==', userId),
          where('status', '==', 'active')
        ))
      ]);

      const zoneRehearsals = zoneSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        scope: 'zone',
        scopeLabel: 'Zone Rehearsal',
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));



      // Combine subgroup IDs from both sources (member and coordinator)
      const allSubGroupDocs = [
        ...memberSubGroupsSnapshot.docs,
        ...coordinatedSubGroupsSnapshot.docs
      ];

      // Use a Map to deduplicate by ID
      const uniqueSubGroupDocs = new Map();
      allSubGroupDocs.forEach(doc => uniqueSubGroupDocs.set(doc.id, doc));

      const userSubGroupIds = Array.from(uniqueSubGroupDocs.keys());
      
      const subGroupNames: Record<string, string> = {};
      uniqueSubGroupDocs.forEach((doc, id) => {
        subGroupNames[id] = doc.data().name;
      });

      // 3. Get sub-group rehearsals for user's sub-groups
      let subGroupRehearsals: SubGroupRehearsal[] = [];
      if (userSubGroupIds.length > 0) {
        const subGroupRehearsalsRef = collection(db, 'subgroup_praise_nights');
        // Firebase doesn't support 'in' with more than 10 items, so we batch
        const batches = [];
        for (let i = 0; i < userSubGroupIds.length; i += 10) {
          const batch = userSubGroupIds.slice(i, i + 10);
          const batchQuery = query(
            subGroupRehearsalsRef,
            where('subGroupId', 'in', batch)
            // orderBy removed to avoid index issues
          );
          batches.push(getDocs(batchQuery));
        }

        const batchResults = await Promise.all(batches);
        for (const snapshot of batchResults) {
          const rehearsals = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              subGroupId: data.subGroupId,
              zoneId: data.zoneId,
              name: data.name,
              date: data.date,
              location: data.location,
              description: data.description,
              songIds: data.songIds || [],
              category: data.category || 'ongoing',
              bannerImage: data.bannerImage || '',
              categoryOrder: data.categoryOrder || [],
              pageCategory: data.pageCategory || '',
              scope: 'subgroup' as const,
              scopeLabel: subGroupNames[data.subGroupId] || 'Sub-Group Rehearsal',
              subGroupName: subGroupNames[data.subGroupId] || '',
              createdBy: data.createdBy,
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date()
            } as SubGroupRehearsal;
          });
          subGroupRehearsals.push(...rehearsals);
        }
      }


      // 4. Combine and sort by date (newest first)
      const combined = [...zoneRehearsals, ...subGroupRehearsals].sort((a, b) => {
        const dateA = new Date((a as any).date || a.createdAt).getTime();
        const dateB = new Date((b as any).date || b.createdAt).getTime();
        return dateB - dateA;
      });


      return {
        zoneRehearsals,
        subGroupRehearsals,
        combined
      };
    } catch (error) {
 console.error('Error getting member rehearsals:', error);
      return {
        zoneRehearsals: [],
        subGroupRehearsals: [],
        combined: []
      };
    }
  }

  /**
   * Subscribe to all rehearsals for a member (Hub Real-time)
   */
  static subscribeToMemberRehearsals(
    zoneId: string, 
    userId: string, 
    callback: (rehearsals: any[]) => void
  ) {
    const rehearsalsRef = collection(db, 'subgroup_praise_nights');
    
    // We listen to subgroup rehearsals and filter for the user's groups
    return onSnapshot(rehearsalsRef, async (snapshot) => {
      try {
        // 1. Get user's active subgroups to know what to filter
        const qSubgroups = query(
          collection(db, 'subgroups'),
          where('status', '==', 'active')
        );
        const subgroupSnap = await getDocs(qSubgroups);
        
        const userSubGroups = subgroupSnap.docs.filter(doc => {
          const data = doc.data();
          return (data.memberIds || []).includes(userId) || data.coordinatorId === userId;
        });

        const subGroupIds = userSubGroups.map(doc => doc.id);
        const subGroupNames: Record<string, string> = {};
        userSubGroups.forEach(doc => { subGroupNames[doc.id] = doc.data().name; });

        if (subGroupIds.length === 0) {
          callback([]);
          return;
        }

        // 2. Map and filter rehearsals from the snapshot
        const filtered = snapshot.docs
          .map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              scope: 'subgroup' as const,
              scopeLabel: subGroupNames[data.subGroupId] || 'Sub-Group',
              subGroupName: subGroupNames[data.subGroupId] || '',
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date()
            } as any;
          })
          .filter(r => subGroupIds.includes(r.subGroupId))
          .sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return dateB - dateA;
          });

        callback(filtered);
      } catch (error) {
        console.error('Error in member rehearsals subscription:', error);
      }
    });
  }

  /**
   * Send notification to all sub-group members
   */
  static async sendSubGroupNotification(
    subGroupId: string,
    notification: {
      title: string;
      message: string;
      type: 'rehearsal' | 'zone' | 'reminder' | 'announcement';
      rehearsalId?: string;
    }
  ): Promise<{ success: boolean; count: number; error?: string }> {
    try {

      // Get sub-group members
      const subGroupRef = doc(db, 'subgroups', subGroupId);
      const subGroupSnap = await getDoc(subGroupRef);

      if (!subGroupSnap.exists()) {
        return { success: false, count: 0, error: 'Sub-group not found' };
      }

      const subGroupData = subGroupSnap.data();
      const memberIds = subGroupData.memberIds || [];
      const subGroupName = subGroupData.name || 'Sub-Group';

      if (memberIds.length === 0) {
        return { success: true, count: 0 };
      }

      // Create notification for each member and collect IDs for FCM
      const notificationsRef = collection(db, 'user_notifications');
      const now = Timestamp.now();
      let count = 0;
      const recipientIds: string[] = [];

      for (const memberId of memberIds) {
        await addDoc(notificationsRef, {
          userId: memberId,
          subGroupId,
          subGroupName,
          type: `subgroup_${notification.type}`,
          title: notification.title,
          message: notification.message,
          rehearsalId: notification.rehearsalId || null,
          read: false,
          createdAt: now
        });
        recipientIds.push(memberId);
        count++;
      }

      // Trigger FCM push notifications
      if (recipientIds.length > 0) {
        // Send in batches of 100
        const batchSize = 100;
        for (let i = 0; i < recipientIds.length; i += batchSize) {
          const batch = recipientIds.slice(i, i + batchSize);
          authedFetch('/api/send-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'zone',
              recipientIds: batch,
              title: ` ${notification.title}`,
              body: notification.message,
              data: {
                subGroupId,
                subGroupName,
                rehearsalId: notification.rehearsalId || ''
              }
            })
 }).catch(err => console.error('[SubGroupNotif] FCM error:', err));
        }
      }

      return { success: true, count };
    } catch (error) {
 console.error('Error sending sub-group notification:', error);
      return { success: false, count: 0, error: 'Failed to send notifications' };
    }
  }

  /**
   * Get notifications for a user (including sub-group notifications)
   */
  static async getUserNotifications(userId: string, limitCount = 20): Promise<any[]> {
    try {
      const notificationsRef = collection(db, 'user_notifications');

      // Try with orderBy first
      try {
        const q = query(
          notificationsRef,
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        const notifications = snapshot.docs.slice(0, limitCount).map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        }));

        return notifications;
      } catch (indexError) {
        // Fallback: query without orderBy and sort client-side
        const fallbackQ = query(
          notificationsRef,
          where('userId', '==', userId)
        );

        const snapshot = await getDocs(fallbackQ);
        const notifications = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        }));

        // Sort client-side
        notifications.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        return notifications.slice(0, limitCount);
      }
    } catch (error) {
 console.error('Error getting user notifications:', error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  static async markNotificationRead(notificationId: string): Promise<{ success: boolean }> {
    try {
      const notificationRef = doc(db, 'user_notifications', notificationId);
      await updateDoc(notificationRef, { read: true });
      return { success: true };
    } catch (error) {
      console.error('Error marking notification read:', error);
      return { success: false };
    }
  }

  static async getSongsByRehearsalId(rehearsalId: string): Promise<SubGroupSong[]> {
    try {
      const rehearsal = await this.getRehearsalById(rehearsalId);
      if (!rehearsal || !rehearsal.songIds || rehearsal.songIds.length === 0) {
        return [];
      }

      const songsRef = collection(db, 'subgroup_songs');
      const songIds = rehearsal.songIds;

      // Handle Firestore 'in' limit of 30
      const limitedIds = songIds.slice(0, 30);
      const q = query(songsRef, where('__name__', 'in', limitedIds));
      const snapshot = await getDocs(q);

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as SubGroupSong[];
    } catch (error) {
      console.error('Error getting songs by rehearsal ID:', error);
      return [];
    }
  }
}
