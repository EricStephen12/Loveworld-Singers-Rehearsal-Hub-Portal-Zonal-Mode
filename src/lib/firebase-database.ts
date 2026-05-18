import { BackendAPI } from './api-client';
import { db } from './firebase-setup';
import { 
  collection, query, where, limit, orderBy, onSnapshot, doc 
} from 'firebase/firestore';

/**
 * FIREBASE DATABASE SERVICE (WEBSITE CLIENT)
 * This is a COMPATIBILITY PROXY.
 */

export class FirebaseDatabaseService {
  // --- REAL-TIME LISTENERS ---
  
  static subscribeToPraiseNights(callback: (data: any[]) => void) {
    const q = query(collection(db, 'praise_nights'), orderBy('createdAt', 'desc'), limit(10));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }

  static subscribeToCollection(collectionName: string, callback: (data: any[]) => void, limitCount = 100) {
    const q = query(collection(db, collectionName), limit(limitCount));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }

  static subscribeToCollectionWhere(collectionName: string, field: string, operator: any, value: any, callback: (data: any[]) => void, limitCount = 100) {
    const q = query(collection(db, collectionName), where(field, operator, value), limit(limitCount));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  }

  static subscribeToDocument(collectionName: string, docId: string, callback: (data: any) => void) {
    return onSnapshot(doc(db, collectionName, docId), (snapshot) => {
      callback(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null);
    });
  }

  // --- PROFILES & USERS (Restored) ---

  static async getUserProfile(userId: string) {
    const response = await BackendAPI.profiles.get(userId);
    return response.data;
  }

  static async updateUserProfile(userId: string, updates: any) {
    return await BackendAPI.profiles.update(userId, updates);
  }

  static async getAllUsers() {
    const response = await BackendAPI.generic.list('profiles');
    return response.data || [];
  }

  static async searchProfiles(term: string) {
    const all = await this.getAllUsers();
    const lower = term.toLowerCase();
    return all.filter((p: any) => 
      (p.first_name + ' ' + p.last_name).toLowerCase().includes(lower) || 
      p.email?.toLowerCase().includes(lower)
    );
  }

  // --- HISTORY (Restored) ---

  static async getHistoryBySongId(songId: string) {
    const firebaseSongId = String(songId).trim();
    const numericSongId = !isNaN(Number(songId)) ? Number(songId) : null;
    const { getHistoryBySongId: getSupabaseHistory } = await import('./history-service');

    const [historyDataString, historyDataNum, supabaseHistory] = await Promise.all([
      this.getCollectionWhere('song_history', 'song_id', '==', firebaseSongId),
      numericSongId !== null ? this.getCollectionWhere('song_history', 'song_id', '==', numericSongId) : Promise.resolve([]),
      numericSongId !== null ? getSupabaseHistory(numericSongId) : Promise.resolve([])
    ]);

    const combinedMap = new Map();

    const processAndAdd = (entry: any) => {
      if (!entry || !entry.id) return;
      let processedDate;
      if (entry.created_at && typeof entry.created_at.toDate === 'function') {
        processedDate = entry.created_at.toDate();
      } else if (entry.created_at && typeof entry.created_at === 'object' && entry.created_at.seconds) {
        processedDate = new Date(entry.created_at.seconds * 1000);
      } else if (entry.created_at && typeof entry.created_at === 'string') {
        processedDate = new Date(entry.created_at);
      } else if (entry.created_at && typeof entry.created_at === 'number') {
        processedDate = new Date(entry.created_at);
      } else if (entry.date instanceof Date) {
        processedDate = entry.date;
      } else if (entry.date) {
        processedDate = new Date(entry.date);
      } else {
        processedDate = new Date();
      }

      const formatted = {
        id: String(entry.id),
        type: entry.type || 'metadata',
        title: entry.title || entry.version || 'Update',
        description: entry.description || '',
        old_value: entry.old_value || '',
        new_value: entry.new_value || '',
        created_by: entry.created_by || 'admin',
        date: processedDate,
        version: entry.version || entry.title || 'Update',
        created_at: processedDate.toISOString()
      };

      combinedMap.set(formatted.id, formatted);
    };

    (supabaseHistory || []).forEach((item: any) => processAndAdd(item));
    (historyDataString || []).forEach((item: any) => processAndAdd(item));
    (historyDataNum || []).forEach((item: any) => processAndAdd(item));

    const historyEntries = Array.from(combinedMap.values());
    historyEntries.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return historyEntries;
  }

  static async createHistoryEntry(data: any) {
    return await BackendAPI.generic.create('song_history', data);
  }

  static async updateHistoryEntry(id: string, data: any) {
    return await BackendAPI.generic.update('song_history', id, data);
  }

  static async deleteHistoryEntry(id: string) {
    return await BackendAPI.generic.delete('song_history', id);
  }

  // --- GENERIC CRUD ---

  static async getDocument(collectionName: string, docId: string) {
    const response = await BackendAPI.generic.get(collectionName, docId);
    return response.data;
  }

  static async getDocuments(collectionName: string, _idsOrConditions: any) {
    return await this.getCollection(collectionName);
  }

  static async createDocument(collectionName: string, docId: string, data: any) {
    return await BackendAPI.generic.update(collectionName, docId, data);
  }

  static async addDocument(collectionName: string, data: any) {
    const response = await BackendAPI.generic.create(collectionName, data);
    return response;
  }

  static async updateDocument(collectionName: string, docId: string, data: any) {
    return await BackendAPI.generic.update(collectionName, docId, data);
  }

  static async deleteDocument(collectionName: string, docId: string) {
    return await BackendAPI.generic.delete(collectionName, docId);
  }

  static async getCollection(collectionName: string, maxLimit = 500) {
    const response = await BackendAPI.generic.list(collectionName, maxLimit);
    return response.data || [];
  }

  static async getCollectionWhere(collectionName: string, field: string, operator: string, value: any) {
    const response = await BackendAPI.generic.list(collectionName, 500, field, value, operator);
    return response.data || [];
  }

  static async getDocumentsByIds(collectionName: string, ids: string[]) {
    const all = await this.getCollection(collectionName);
    return all.filter((item: any) => ids.includes(item.id));
  }
}
