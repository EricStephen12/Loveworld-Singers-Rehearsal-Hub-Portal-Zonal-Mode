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
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase-setup';

// Types
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
  scopeLabel?: string; // For display purposes in combined lists
  subGroupName?: string; // For display purposes
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export class SubGroupDatabaseService {

  // ==================== SONGS ====================

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
        lyrics: songData.lyrics || '',
        solfa: songData.solfa || '',
        key: songData.key || '',
        tempo: songData.tempo || '',
        writer: songData.writer || '',
        leadSinger: songData.leadSinger || '',
        category: songData.category || '',
        audioUrls: songData.audioUrls || {},
        createdBy,
        createdAt: now,
        updatedAt: now
      };

      const docRef = await addDoc(songsRef, newSong);

      // Trigger FCM push notification for subgroup members
      try {
        await this.sendSubGroupNotification(subGroupId, {
          title: '🎵 New Song Added',
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
          lyrics: zoneSong.lyrics || '',
          solfa: zoneSong.solfa || '',
          key: zoneSong.key || '',
          tempo: zoneSong.tempo || '',
          writer: zoneSong.writer || '',
          leadSinger: zoneSong.leadSinger || '',
          category: zoneSong.category || '',
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
            title: '🎵 New Songs Imported',
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

  // ==================== REHEARSALS ====================

  /**
   * Get all rehearsals for a sub-group
   */
  static async getSubGroupRehearsals(subGroupId: string): Promise<SubGroupRehearsal[]> {
    try {
      const rehearsalsRef = collection(db, 'subgroup_praise_nights');
      const q = query(
        rehearsalsRef,
        where('subGroupId', '==', subGroupId),
        orderBy('date', 'desc')
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
    rehearsalData: { name: string; date: string; location?: string; description?: string; subGroupName?: string },
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
          title: '📅 New Rehearsal Scheduled',
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

  // ==================== MEMBERS ====================

  /**
   * Add members to a sub-group
   */
  static async addMembers(
    subGroupId: string,
    memberIds: string[]
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const subGroupRef = doc(db, 'subgroups', subGroupId);
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

  // ==================== STATS ====================

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

  // ==================== COMBINED REHEARSALS (PHASE 4) ====================

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
    combined: any[];
  }> {
    try {

      // 1. Get zone rehearsals
      const zoneRehearsalsRef = collection(db, 'zone_praise_nights');
      const zoneQuery = query(
        zoneRehearsalsRef,
        where('zoneId', '==', zoneId),
        orderBy('date', 'desc')
      );
      const zoneSnapshot = await getDocs(zoneQuery);
      const zoneRehearsals = zoneSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        scope: 'zone',
        scopeLabel: 'Zone Rehearsal',
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));

      // 2. Get user's sub-groups
      const subGroupsRef = collection(db, 'subgroups');
      const subGroupsQuery = query(
        subGroupsRef,
        where('memberIds', 'array-contains', userId),
        where('status', '==', 'active')
      );
      const subGroupsSnapshot = await getDocs(subGroupsQuery);
      const userSubGroupIds = subGroupsSnapshot.docs.map(doc => doc.id);
      const subGroupNames: Record<string, string> = {};
      subGroupsSnapshot.docs.forEach(doc => {
        subGroupNames[doc.id] = doc.data().name;
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
            where('subGroupId', 'in', batch),
            orderBy('date', 'desc')
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
              scope: 'subgroup' as const,
              scopeLabel: subGroupNames[data.subGroupId] || 'Sub-Group Rehearsal',
              subGroupName: subGroupNames[data.subGroupId] || '',
              createdBy: data.createdBy,
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date()
            };
          }) as SubGroupRehearsal[];
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

  // ==================== SUB-GROUP NOTIFICATIONS ====================

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
          fetch('/api/send-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'zone',
              recipientIds: batch,
              title: `📢 ${notification.title}`,
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
}
