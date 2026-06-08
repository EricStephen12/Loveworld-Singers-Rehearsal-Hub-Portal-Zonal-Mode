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
  serverTimestamp
} from 'firebase/firestore'

import { db } from './firebase-setup'
import { PraiseNightSong } from '@/types/supabase'
import { isHQGroup } from '@/config/zones'
import { FirebaseMetadataService } from './firebase-metadata-service'
import { BackendAPI } from './api-client'

function getCollectionName(zoneId?: string): string {
  return (zoneId && isHQGroup(zoneId)) ? 'praise_night_songs' : 'zone_songs'
}

export class PraiseNightSongsService {

  static async getSongsByPraiseNight(praiseNightId: string, zoneId?: string): Promise<PraiseNightSong[]> {
    try {
      const collectionName = getCollectionName(zoneId)
      const response = await BackendAPI.generic.list(collectionName, 2000, 'praiseNightId', praiseNightId, '==');
      
      // Try alternative field names if no songs found (handles legacy/zonal data mismatches)
      if (!response.data || response.data.length === 0) {
        const altResponse = await BackendAPI.generic.list(collectionName, 2000, 'praisenightid', praiseNightId, '==');
        if (altResponse.data && altResponse.data.length > 0) return altResponse.data;
      }

      return (response.data || []).map((doc: any) => ({
        ...doc,
        createdAt: doc.createdAt ? (typeof doc.createdAt === 'string' ? doc.createdAt : new Date().toISOString()) : new Date().toISOString(),
        updatedAt: doc.updatedAt ? (typeof doc.updatedAt === 'string' ? doc.updatedAt : new Date().toISOString()) : new Date().toISOString()
      })) as unknown as PraiseNightSong[];
    } catch (error) {
      console.error('Error getting songs:', error);
      return [];
    }
  }

  static async getAllSongs(zoneId?: string): Promise<PraiseNightSong[]> {
    try {
      const collectionName = getCollectionName(zoneId)
      let response;
      
      if (zoneId && !isHQGroup(zoneId)) {
        response = await BackendAPI.generic.list(collectionName, 5000, 'zoneId', zoneId, '==');
      } else {
        response = await BackendAPI.generic.list(collectionName, 5000);
      }

      return (response.data || []).map((doc: any) => ({
        ...doc,
        createdAt: doc.createdAt ? (typeof doc.createdAt === 'string' ? doc.createdAt : new Date().toISOString()) : new Date().toISOString(),
        updatedAt: doc.updatedAt ? (typeof doc.updatedAt === 'string' ? doc.updatedAt : new Date().toISOString()) : new Date().toISOString()
      })) as unknown as PraiseNightSong[];
    } catch (error) {
      console.error('Error getting all songs:', error);
      return [];
    }
  }

  static async getSongById(songId: string, zoneId?: string): Promise<PraiseNightSong | null> {
    try {
      const collectionName = getCollectionName(zoneId)
      const response = await BackendAPI.generic.get(collectionName, songId);
      
      if (!response.data) return null;

      const doc = response.data;
      return {
        ...doc,
        createdAt: doc.createdAt ? (typeof doc.createdAt === 'string' ? doc.createdAt : new Date().toISOString()) : new Date().toISOString(),
        updatedAt: doc.updatedAt ? (typeof doc.updatedAt === 'string' ? doc.updatedAt : new Date().toISOString()) : new Date().toISOString()
      } as unknown as PraiseNightSong;
    } catch (error) {
      console.error('Error getting song:', error);
      return null;
    }
  }

  static async createSong(songData: Partial<PraiseNightSong>, zoneId?: string): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const collectionName = getCollectionName(zoneId)

      const cleanData = {
        title: songData.title || '',
        leadSinger: songData.leadSinger || '',
        writer: songData.writer || '',
        conductor: songData.conductor || '',
        key: songData.key || '',
        tempo: songData.tempo || '',
        leadKeyboardist: songData.leadKeyboardist || '',
        leadGuitarist: songData.leadGuitarist || '',
        bassGuitarist: songData.bassGuitarist || '',
        drummer: songData.drummer || '',
        lyrics: songData.lyrics || '',
        solfas: songData.solfas || '',
        notation: songData.notation || '',
        audioFile: songData.audioFile || '',
        category: songData.category || '',
        categories: songData.categories || [],
        status: songData.status || 'unheard',
        praiseNightId: songData.praiseNightId || '',
        rehearsalCount: songData.rehearsalCount ?? 0,
        comments: songData.comments || [],
        history: songData.history || [],
        isActive: songData.isActive || false,
        mediaId: songData.mediaId || null,
        zoneId: zoneId || '',
        audioUrls: songData.audioUrls || {},
        customParts: songData.customParts || [],
        availableParts: songData.availableParts || [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      const songsRef = collection(db, collectionName)
      const docRef = await addDoc(songsRef, cleanData)

      //  Trigger metadata update for realtime sync
      if (zoneId && songData.praiseNightId) {
        await FirebaseMetadataService.updateSongMetadata(zoneId, songData.praiseNightId, docRef.id)
        await FirebaseMetadataService.updatePraiseNightSongsMetadata(zoneId, songData.praiseNightId)
      }

      return { success: true, id: docRef.id }
    } catch (error) {
 console.error('Error creating song:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Failed to create song' }
    }
  }

  static async updateSong(songId: string, songData: Partial<PraiseNightSong>, zoneId?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const collectionName = getCollectionName(zoneId)
      const songRef = doc(db, collectionName, songId)
      const songDoc = await getDoc(songRef)

      if (!songDoc.exists()) {
        return { success: false, error: 'Song not found' }
      }

      const { id, firebaseId, createdAt, zoneId: _, ...updateData } = songData as any

      const cleanedData = Object.entries(updateData).reduce((acc, [key, value]) => {
        if (value !== undefined) acc[key] = value
        return acc
      }, {} as any)

      await updateDoc(songRef, { ...cleanedData, updatedAt: serverTimestamp() })

      //  Trigger metadata update for realtime sync
      const existingData = songDoc.data()
      const praiseNightId = songData.praiseNightId || existingData.praiseNightId



      if (zoneId && praiseNightId) {

        await FirebaseMetadataService.updateSongMetadata(zoneId, praiseNightId, songId)
        await FirebaseMetadataService.updatePraiseNightSongsMetadata(zoneId, praiseNightId)

      } else {
 console.warn('️ [UpdateSong] Skipping metadata update - missing zoneId or praiseNightId');
      }

      return { success: true }
    } catch (error) {
 console.error('Error updating song:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update song' }
    }
  }

  static async deleteSong(songId: string, zoneId?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const collectionName = getCollectionName(zoneId)
      const songRef = doc(db, collectionName, songId)
      const songDoc = await getDoc(songRef)

      if (!songDoc.exists()) {
        return { success: false, error: 'Song not found' }
      }

      // Get praiseNightId before deleting
      const existingData = songDoc.data()
      const praiseNightId = existingData.praiseNightId

      await deleteDoc(songRef)

      //  Trigger metadata update for realtime sync
      if (zoneId && praiseNightId) {
        await FirebaseMetadataService.updateSongMetadata(zoneId, praiseNightId, songId)
        await FirebaseMetadataService.updatePraiseNightSongsMetadata(zoneId, praiseNightId)
      }

      return { success: true }
    } catch (error) {
 console.error('Error deleting song:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Failed to delete song' }
    }
  }

  static async updateSongStatus(songId: string, status: 'heard' | 'unheard', zoneId?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const collectionName = getCollectionName(zoneId)
      const songRef = doc(db, collectionName, songId)
      const songDoc = await getDoc(songRef)

      if (!songDoc.exists()) {
        return { success: false, error: 'Song not found' }
      }

      await updateDoc(songRef, { status, updatedAt: serverTimestamp() })

      //  Trigger metadata update for realtime sync
      const existingData = songDoc.data()
      const praiseNightId = existingData.praiseNightId
      if (zoneId && praiseNightId) {
        await FirebaseMetadataService.updateSongMetadata(zoneId, praiseNightId, songId)
        await FirebaseMetadataService.updatePraiseNightSongsMetadata(zoneId, praiseNightId)
      }

      return { success: true }
    } catch (error) {
 console.error('Error updating status:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update status' }
    }
  }
}
