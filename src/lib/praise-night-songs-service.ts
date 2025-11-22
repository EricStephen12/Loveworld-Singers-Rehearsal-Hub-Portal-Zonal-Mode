/**
 * FRESH SONGS SERVICE - NO ID CONFLICTS!
 * 
 * Uses new table: praise_night_songs
 * Simple Firebase auto-generated IDs only
 * No complex ID management
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase-setup';
import { PraiseNightSong } from '@/types/supabase';

const COLLECTION_NAME = 'praise_night_songs'; // NEW TABLE!

export class PraiseNightSongsService {
  
  /**
   * Get all songs for a specific praise night
   */
  static async getSongsByPraiseNight(praiseNightId: string): Promise<PraiseNightSong[]> {
    try {
      console.log('📖 [PraiseNightSongs] Getting songs for praise night:', praiseNightId);
      
      const songsRef = collection(db, COLLECTION_NAME);
      const q = query(songsRef, where('praiseNightId', '==', praiseNightId));
      const snapshot = await getDocs(q);
      
      const songs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id, // Firebase auto-generated ID
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
        };
      }) as unknown as PraiseNightSong[];
      
      console.log('✅ [PraiseNightSongs] Found', songs.length, 'songs');
      return songs;
    } catch (error) {
      console.error('❌ [PraiseNightSongs] Error getting songs:', error);
      return [];
    }
  }

  /**
   * Get all songs (for admin)
   */
  static async getAllSongs(): Promise<PraiseNightSong[]> {
    try {
      console.log('📖 [PraiseNightSongs] Getting all songs');
      
      const songsRef = collection(db, COLLECTION_NAME);
      const snapshot = await getDocs(songsRef);
      
      const songs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
        };
      }) as unknown as PraiseNightSong[];
      
      console.log('✅ [PraiseNightSongs] Found', songs.length, 'total songs');
      return songs;
    } catch (error) {
      console.error('❌ [PraiseNightSongs] Error getting all songs:', error);
      return [];
    }
  }

  /**
   * Get a single song by ID
   */
  static async getSongById(songId: string): Promise<PraiseNightSong | null> {
    try {
      console.log('📖 [PraiseNightSongs] Getting song:', songId);
      
      const songRef = doc(db, COLLECTION_NAME, songId);
      const songDoc = await getDoc(songRef);
      
      if (!songDoc.exists()) {
        console.log('❌ [PraiseNightSongs] Song not found:', songId);
        return null;
      }
      
      const data = songDoc.data();
      const song = {
        ...data,
        id: songDoc.id,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      } as unknown as PraiseNightSong;
      
      console.log('✅ [PraiseNightSongs] Found song:', song.title);
      return song;
    } catch (error) {
      console.error('❌ [PraiseNightSongs] Error getting song:', error);
      return null;
    }
  }

  /**
   * Create a new song
   */
  static async createSong(songData: Partial<PraiseNightSong>): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      console.log('➕ [PraiseNightSongs] Creating song:', songData.title);
      
      // Prepare clean data
      const cleanData = {
        title: songData.title || '',
        leadSinger: songData.leadSinger || '',
        writer: songData.writer || '',
        conductor: songData.conductor || '',
        key: songData.key || '',
        tempo: songData.tempo || '',
        leadKeyboardist: songData.leadKeyboardist || '',
        leadGuitarist: songData.leadGuitarist || '',
        drummer: songData.drummer || '',
        lyrics: songData.lyrics || '',
        solfas: songData.solfas || '',
        audioFile: songData.audioFile || '',
        category: songData.category || '',
        categories: songData.categories || [], // Multi-category support
        status: songData.status || 'unheard',
        praiseNightId: songData.praiseNightId || '',
        rehearsalCount: songData.rehearsalCount || 1,
        comments: songData.comments || [],
        history: songData.history || [],
        isActive: songData.isActive || false, // Active status for blinking border
        mediaId: songData.mediaId || null, // Media library reference
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      // Add to Firebase (auto-generates ID)
      const songsRef = collection(db, COLLECTION_NAME);
      const docRef = await addDoc(songsRef, cleanData);
      
      console.log('✅ [PraiseNightSongs] Song created with ID:', docRef.id);
      
      return {
        success: true,
        id: docRef.id
      };
    } catch (error) {
      console.error('❌ [PraiseNightSongs] Error creating song:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create song'
      };
    }
  }

  /**
   * Update an existing song
   */
  static async updateSong(songId: string, songData: Partial<PraiseNightSong>): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔄 [PraiseNightSongs] Updating song:', songId);
      
      // Check if song exists
      const songRef = doc(db, COLLECTION_NAME, songId);
      const songDoc = await getDoc(songRef);
      
      if (!songDoc.exists()) {
        console.error('❌ [PraiseNightSongs] Song not found:', songId);
        return {
          success: false,
          error: 'Song not found'
        };
      }
      
      // Prepare update data (remove id, firebaseId, createdAt fields)
      const { id, firebaseId, createdAt, ...updateData } = songData as any;

      // Remove any undefined values
      const cleanedData = Object.entries(updateData).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as any);

      // Add updatedAt timestamp
      const cleanUpdateData = {
        ...cleanedData,
        updatedAt: serverTimestamp()
      };
      
      // Update in Firebase
      await updateDoc(songRef, cleanUpdateData);
      
      console.log('✅ [PraiseNightSongs] Song updated successfully');
      
      return {
        success: true
      };
    } catch (error) {
      console.error('❌ [PraiseNightSongs] Error updating song:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update song'
      };
    }
  }

  /**
   * Delete a song
   */
  static async deleteSong(songId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🗑️ [PraiseNightSongs] Deleting song:', songId);
      
      // Check if song exists
      const songRef = doc(db, COLLECTION_NAME, songId);
      const songDoc = await getDoc(songRef);
      
      if (!songDoc.exists()) {
        console.error('❌ [PraiseNightSongs] Song not found:', songId);
        return {
          success: false,
          error: 'Song not found'
        };
      }
      
      // Delete from Firebase
      await deleteDoc(songRef);
      
      console.log('✅ [PraiseNightSongs] Song deleted successfully');
      
      return {
        success: true
      };
    } catch (error) {
      console.error('❌ [PraiseNightSongs] Error deleting song:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete song'
      };
    }
  }

  /**
   * Update song status (heard/unheard)
   */
  static async updateSongStatus(songId: string, status: 'heard' | 'unheard'): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔄 [PraiseNightSongs] Updating song status:', songId, '->', status);
      
      const songRef = doc(db, COLLECTION_NAME, songId);
      
      await updateDoc(songRef, {
        status,
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ [PraiseNightSongs] Status updated successfully');
      
      return {
        success: true
      };
    } catch (error) {
      console.error('❌ [PraiseNightSongs] Error updating status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update status'
      };
    }
  }
}

