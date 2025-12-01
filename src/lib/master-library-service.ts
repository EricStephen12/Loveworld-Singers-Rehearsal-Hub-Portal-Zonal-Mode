/**
 * Master Library Service
 * Handles the curated song library that zones can access
 * 
 * Flow:
 * 1. HQ Admin creates songs in internal library (songs collection)
 * 2. HQ Admin publishes to Master Library (master_songs collection)
 * 3. Zone Coordinators can view and import from Master Library
 * 4. Sub-Groups can import from their Zone's library
 */

import { FirebaseDatabaseService } from './firebase-database';
import { 
  collection, 
  query, 
  orderBy, 
  getDocs,
  where,
  doc,
  getDoc,
  updateDoc,
  increment
} from 'firebase/firestore';
import { db } from './firebase-setup';

export interface MasterSong {
  id: string;
  // Song data
  title: string;
  lyrics?: string;
  solfa?: string;
  key?: string;
  tempo?: string;
  writer?: string;
  leadSinger?: string;
  category?: string;
  categories?: string[];
  audioFile?: string;
  audioUrls?: {
    full?: string;
    soprano?: string;
    alto?: string;
    tenor?: string;
    bass?: string;
  };
  // Import tracking
  sourceType: 'hq_internal';
  originalSongId: string;
  // Metadata
  publishedBy: string;
  publishedByName?: string;
  publishedAt: Date;
  updatedAt: Date;
  // Analytics
  importCount: number;
}

export interface ImportedSongTracking {
  importedFrom: 'master' | 'zone';
  originalSongId: string;
  importedAt: Date;
  importedBy: string;
}

export class MasterLibraryService {
  
  /**
   * Get all songs from Master Library
   * Used by Zone Coordinators to browse available songs
   */
  static async getMasterSongs(): Promise<MasterSong[]> {
    try {
      console.log('📚 Getting Master Library songs...');
      
      const q = query(
        collection(db, 'master_songs'),
        orderBy('publishedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const songs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MasterSong[];
      
      console.log(`✅ Found ${songs.length} songs in Master Library`);
      return songs;
    } catch (error) {
      console.error('❌ Error getting Master Library songs:', error);
      return [];
    }
  }

  /**
   * Get a single song from Master Library
   */
  static async getMasterSong(songId: string): Promise<MasterSong | null> {
    try {
      const docRef = doc(db, 'master_songs', songId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as MasterSong;
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting Master song:', error);
      return null;
    }
  }

  /**
   * Publish a song from HQ Internal Library to Master Library
   * Only HQ Admin can do this
   */
  static async publishToMasterLibrary(
    originalSong: any,
    publishedBy: string,
    publishedByName?: string
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      console.log('📤 Publishing song to Master Library:', originalSong.title);
      
      // Check if already published
      const existing = await this.getMasterSongByOriginalId(originalSong.id);
      if (existing) {
        return { 
          success: false, 
          error: 'This song is already in the Master Library' 
        };
      }
      
      // Create master song data (copy only song data, no comments/history)
      const masterSongData = {
        // Song data
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
        // Import tracking
        sourceType: 'hq_internal',
        originalSongId: originalSong.id || originalSong.firebaseId,
        // Metadata
        publishedBy,
        publishedByName: publishedByName || '',
        publishedAt: new Date(),
        updatedAt: new Date(),
        // Analytics
        importCount: 0
      };
      
      // Remove undefined values
      const cleanData = Object.fromEntries(
        Object.entries(masterSongData).filter(([_, v]) => v !== undefined)
      );
      
      const result = await FirebaseDatabaseService.addDocument('master_songs', cleanData);
      
      if (result.success) {
        console.log('✅ Song published to Master Library:', result.id);
        return { success: true, id: result.id };
      } else {
        return { success: false, error: 'Failed to publish song' };
      }
    } catch (error) {
      console.error('❌ Error publishing to Master Library:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Check if a song is already in Master Library by original ID
   */
  static async getMasterSongByOriginalId(originalSongId: string): Promise<MasterSong | null> {
    try {
      const q = query(
        collection(db, 'master_songs'),
        where('originalSongId', '==', originalSongId)
      );
      
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as MasterSong;
      }
      return null;
    } catch (error) {
      console.error('❌ Error checking Master Library:', error);
      return null;
    }
  }

  /**
   * Update a song in Master Library
   * Only HQ Admin can do this
   */
  static async updateMasterSong(
    songId: string, 
    data: Partial<MasterSong>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('📝 Updating Master Library song:', songId);
      
      // Don't allow changing source tracking
      const updateData = { ...data };
      delete (updateData as any).sourceType;
      delete (updateData as any).originalSongId;
      delete (updateData as any).publishedBy;
      delete (updateData as any).publishedAt;
      delete (updateData as any).importCount;
      
      updateData.updatedAt = new Date();
      
      await FirebaseDatabaseService.updateDocument('master_songs', songId, updateData);
      
      console.log('✅ Master song updated');
      return { success: true };
    } catch (error) {
      console.error('❌ Error updating Master song:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Delete a song from Master Library
   * Only HQ Admin can do this
   */
  static async deleteMasterSong(songId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🗑️ Deleting from Master Library:', songId);
      
      await FirebaseDatabaseService.deleteDocument('master_songs', songId);
      
      console.log('✅ Master song deleted');
      return { success: true };
    } catch (error) {
      console.error('❌ Error deleting Master song:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Import a song from Master Library to Zone
   * Zone Coordinators use this
   */
  static async importToZone(
    masterSong: MasterSong,
    zoneId: string,
    praiseNightId: string,
    importedBy: string
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      console.log('📥 Importing song to zone:', masterSong.title, '→', zoneId);
      
      // Create zone song data (copy only song data)
      const zoneSongData = {
        // Song data
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
        // Zone reference
        zoneId,
        praiseNightId,
        // Import tracking
        importedFrom: 'master',
        originalSongId: masterSong.id,
        importedAt: new Date(),
        importedBy,
        // Metadata
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'unheard'
      };
      
      // Remove undefined values
      const cleanData = Object.fromEntries(
        Object.entries(zoneSongData).filter(([_, v]) => v !== undefined)
      );
      
      const result = await FirebaseDatabaseService.addDocument('zone_songs', cleanData);
      
      if (result.success) {
        // Increment import count on master song
        await this.incrementImportCount(masterSong.id);
        
        console.log('✅ Song imported to zone:', result.id);
        return { success: true, id: result.id };
      } else {
        return { success: false, error: 'Failed to import song' };
      }
    } catch (error) {
      console.error('❌ Error importing to zone:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Increment the import count for a master song
   */
  static async incrementImportCount(masterSongId: string): Promise<void> {
    try {
      const docRef = doc(db, 'master_songs', masterSongId);
      await updateDoc(docRef, {
        importCount: increment(1)
      });
      console.log('📊 Import count incremented for:', masterSongId);
    } catch (error) {
      console.error('❌ Error incrementing import count:', error);
    }
  }

  /**
   * Get HQ Internal songs (for HQ Admin to select from)
   * Fetches ALL songs from the praise_night_songs collection without any limit
   */
  static async getHQInternalSongs(): Promise<any[]> {
    try {
      console.log('🏢 Getting HQ Internal songs from praise_night_songs...');
      
      // HQ songs are in the 'praise_night_songs' collection - get ALL
      // Note: Not using orderBy to avoid index requirements
      const songsRef = collection(db, 'praise_night_songs');
      const querySnapshot = await getDocs(songsRef);
      
      const songs = querySnapshot.docs.map(doc => ({
        id: doc.id,
        firebaseId: doc.id,
        ...doc.data()
      })) as Array<{ id: string; firebaseId: string; title?: string; [key: string]: any }>;
      
      // Sort by title client-side
      songs.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      
      console.log(`✅ Found ${songs.length} HQ Internal songs`);
      return songs;
    } catch (error) {
      console.error('❌ Error getting HQ Internal songs:', error);
      return [];
    }
  }

  /**
   * Search Master Library songs
   */
  static async searchMasterSongs(searchTerm: string): Promise<MasterSong[]> {
    try {
      const allSongs = await this.getMasterSongs();
      const term = searchTerm.toLowerCase();
      
      return allSongs.filter(song => 
        song.title?.toLowerCase().includes(term) ||
        song.writer?.toLowerCase().includes(term) ||
        song.leadSinger?.toLowerCase().includes(term) ||
        song.category?.toLowerCase().includes(term)
      );
    } catch (error) {
      console.error('❌ Error searching Master Library:', error);
      return [];
    }
  }

  /**
   * Get import statistics for Master Library
   */
  static async getMasterLibraryStats(): Promise<{
    totalSongs: number;
    totalImports: number;
    mostImported: MasterSong[];
  }> {
    try {
      const songs = await this.getMasterSongs();
      
      const totalImports = songs.reduce((sum, song) => sum + (song.importCount || 0), 0);
      const mostImported = [...songs]
        .sort((a, b) => (b.importCount || 0) - (a.importCount || 0))
        .slice(0, 5);
      
      return {
        totalSongs: songs.length,
        totalImports,
        mostImported
      };
    } catch (error) {
      console.error('❌ Error getting Master Library stats:', error);
      return { totalSongs: 0, totalImports: 0, mostImported: [] };
    }
  }
}
