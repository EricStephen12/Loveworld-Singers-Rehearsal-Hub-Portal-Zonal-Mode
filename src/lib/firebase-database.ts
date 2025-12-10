// Firebase Database Service - Ultra Fast for Millions of Users
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  limit,
  where,
  onSnapshot,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore'
import { db } from './firebase-setup'
import { IDManager } from '@/utils/idManager'

export class FirebaseDatabaseService {
  // Get all praise nights (pages) - optimized for millions of users
  static async getPraiseNights(limitCount = 10) {
    try {
      const q = query(
        collection(db, 'praise_nights'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      )
      
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Error getting praise nights:', error)
      return []
    }
  }

  // Get songs for a specific praise night
  static async getSongs(praiseNightId: string) {
    try {
      const q = query(
        collection(db, 'songs'),
        where('praiseNightId', '==', praiseNightId)
      )

      const querySnapshot = await getDocs(q)
      const results = querySnapshot.docs.map(doc => ({
        id: doc.id, // Firebase document ID (string)
        firebaseId: doc.id, // Also store as firebaseId for clarity
        ...doc.data()
      }))

      // Sort by orderIndex in JavaScript to avoid index requirement
      return results.sort((a, b) => {
        const indexA = (a as any).orderIndex || 0
        const indexB = (b as any).orderIndex || 0
        return indexA - indexB // Ascending order
      })
    } catch (error) {
      console.error('Error getting songs:', error)
      return []
    }
  }

  // Get a single song by ID - CRITICAL for SongDetailModal
  static async getSongById(songId: string) {
    try {
      console.log('[getSongById] Fetching song with ID:', songId);
      
      const docRef = doc(db, 'songs', songId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const songData: any = {
          id: docSnap.id,
          firebaseId: docSnap.id,
          ...data
        };
        
        console.log('[getSongById] Song found:', songData.title);
        console.log('[getSongById] Lead singer:', songData.leadSinger || 'MISSING');
        console.log('[getSongById] Lead guitarist:', songData.leadGuitarist || 'MISSING');
        console.log('[getSongById] Lead keyboardist:', songData.leadKeyboardist || 'MISSING');
        console.log('[getSongById] Drummer:', songData.drummer || 'MISSING');
        console.log('[getSongById] Audio file:', songData.audioFile || 'MISSING');
        
        return songData;
      } else {
        console.warn('[getSongById] Song not found with ID:', songId);
        return null;
      }
    } catch (error) {
      console.error('[getSongById] Error:', error);
      return null;
    }
  }


  // Get user profile
  static async getUserProfile(userId: string) {
    try {
      const docRef = doc(db, 'profiles', userId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() }
      }
      return null
    } catch (error) {
      console.error('Error getting user profile:', error)
      return null
    }
  }

  // Update user profile
  static async updateUserProfile(userId: string, data: any) {
    try {
      const docRef = doc(db, 'profiles', userId)
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date()
      })
      return { success: true }
    } catch (error) {
      console.error('Error updating user profile:', error)
      return { success: false }
    }
  }

  // Get all users
  static async getAllUsers() {
    try {
      const querySnapshot = await getDocs(collection(db, 'profiles'))
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Error getting all users:', error)
      return []
    }
  }

  // Real-time listener for praise nights
  static subscribeToPraiseNights(callback: (data: any[]) => void) {
    const q = query(
      collection(db, 'praise_nights'),
      orderBy('createdAt', 'desc'),
      limit(10)
    )
    
    return onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      callback(data)
    })
  }

  // Add new praise night with Firebase-generated ID
  static async addPraiseNight(data: any) {
    try {
      console.log('Creating praise night with Firebase-generated ID...');

      const pageData = {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Use addDoc to let Firebase generate a unique ID
      const docRef = await addDoc(collection(db, 'praise_nights'), pageData);

      console.log('Page created with Firebase-generated ID:', docRef.id);

      return { id: docRef.id, firebaseId: docRef.id, success: true }
    } catch (error) {
      console.error('Error adding praise night:', error)
      return { id: null, firebaseId: null, success: false }
    }
  }

  // Update praise night
  static async updatePraiseNight(id: string, data: any) {
    try {
      const docRef = doc(db, 'praise_nights', id)
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date()
      })
      return { success: true }
    } catch (error) {
      console.error('Error updating praise night:', error)
      return { success: false }
    }
  }

  // Delete praise night
  static async deletePraiseNight(id: string) {
    try {
      const docRef = doc(db, 'praise_nights', id)
      await deleteDoc(docRef)
      return { success: true }
    } catch (error) {
      console.error('Error deleting praise night:', error)
      return { success: false }
    }
  }

  // Test connection
  static async testConnection() {
    try {
      // Test if Firestore is initialized
      if (!db) {
        return { status: 'error', message: 'Firestore not initialized' }
      }
      
      // Test if we can access the database
      const testCollection = collection(db, 'test')
      return { 
        status: 'success', 
        message: 'Firebase Firestore connected successfully'
      }
    } catch (error: any) {
      return { status: 'error', message: error.message }
    }
  }

  // Generic methods for migration
  // OPTIMIZED: Added optional limit parameter (default 500 to prevent massive reads)
  static async getCollection(collectionName: string, maxLimit: number = 500) {
    try {
      // Use limit to prevent fetching entire large collections
      const q = query(collection(db, collectionName), limit(maxLimit))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        const result = {
          id: doc.id, // Firebase document ID (string)
          firebaseId: doc.id, // Also store as firebaseId for clarity
          supabaseId: data.id, // Store the original Supabase ID if it exists
          ...data
        }
        
        return result;
      })
    } catch (error) {
      console.error(`Error getting collection ${collectionName}:`, error)
      return []
    }
  }

  // Get ALL documents from a collection (no limit) - use carefully!
  static async getAllFromCollection(collectionName: string) {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName))
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          firebaseId: doc.id,
          ...data
        }
      })
    } catch (error) {
      console.error(`Error getting all from ${collectionName}:`, error)
      return []
    }
  }

  // Batch fetch with cursor pagination - for large collections like analytics
  // Returns data in batches and calls onBatch callback for each batch
  static async getCollectionInBatches(
    collectionName: string,
    batchSize: number = 500,
    maxTotal: number = 10000,
    orderByField: string = 'timestamp',
    onBatch?: (batch: any[], totalFetched: number, isComplete: boolean) => void
  ): Promise<any[]> {
    try {
      const allResults: any[] = []
      let lastDoc: QueryDocumentSnapshot<DocumentData> | null = null
      let hasMore = true
      
      console.log('[Batch] Starting batch fetch for', collectionName, '(batch size:', batchSize, ', max:', maxTotal, ')')
      
      while (hasMore && allResults.length < maxTotal) {
        // Build query with cursor if we have a last document
        const q = lastDoc
          ? query(
              collection(db, collectionName),
              orderBy(orderByField, 'desc'),
              startAfter(lastDoc),
              limit(batchSize)
            )
          : query(
              collection(db, collectionName),
              orderBy(orderByField, 'desc'),
              limit(batchSize)
            )
        
        const querySnapshot = await getDocs(q)
        const batchDocs: QueryDocumentSnapshot<DocumentData>[] = querySnapshot.docs
        
        if (batchDocs.length === 0) {
          hasMore = false
          console.log('[Batch] No more documents in', collectionName)
        } else {
          // Map documents to data
          const batchData = batchDocs.map((docSnap: QueryDocumentSnapshot<DocumentData>) => ({
            id: docSnap.id,
            firebaseId: docSnap.id,
            ...docSnap.data()
          }))
          
          allResults.push(...batchData)
          lastDoc = batchDocs[batchDocs.length - 1]
          
          console.log('[Batch] Fetched', batchData.length, 'docs, total:', allResults.length)
          
          // Call callback with batch progress
          if (onBatch) {
            const isComplete = batchDocs.length < batchSize || allResults.length >= maxTotal
            onBatch(batchData, allResults.length, isComplete)
          }
          
          // Check if we got less than batch size (means no more data)
          if (batchDocs.length < batchSize) {
            hasMore = false
          }
        }
      }
      
      console.log('[Batch] Complete:', allResults.length, 'total documents from', collectionName)
      return allResults
    } catch (error) {
      console.error('[Batch] Error fetching', collectionName, ':', error)
      return []
    }
  }

  // Batch fetch for analytics_sessions (uses startTime field)
  static async getSessionsInBatches(
    batchSize: number = 500,
    maxTotal: number = 5000,
    onBatch?: (batch: any[], totalFetched: number, isComplete: boolean) => void
  ): Promise<any[]> {
    return this.getCollectionInBatches('analytics_sessions', batchSize, maxTotal, 'startTime', onBatch)
  }

  // Batch fetch for analytics_events (uses timestamp field)
  static async getEventsInBatches(
    batchSize: number = 500,
    maxTotal: number = 10000,
    onBatch?: (batch: any[], totalFetched: number, isComplete: boolean) => void
  ): Promise<any[]> {
    return this.getCollectionInBatches('analytics_events', batchSize, maxTotal, 'timestamp', onBatch)
  }

  static async getDocument(collectionName: string, docId: string) {
    try {
      const docRef = doc(db, collectionName, docId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() }
      } else {
        return null
      }
    } catch (error) {
      console.error(`Error getting document ${docId}:`, error)
      return null
    }
  }

  static async createDocument(collectionName: string, docId: string, data: any) {
    try {
      const docRef = doc(db, collectionName, docId)
      await setDoc(docRef, data)
      return { id: docId, ...data }
    } catch (error) {
      console.error(`Error creating document ${docId}:`, error)
      throw error
    }
  }

  // Create document with auto-generated ID
  static async addDocument(collectionName: string, data: any) {
    try {
      const docRef = await addDoc(collection(db, collectionName), data)
      return { success: true, id: docRef.id, ...data }
    } catch (error) {
      console.error(`Error adding document to ${collectionName}:`, error)
      throw error
    }
  }

  static async updateDocument(collectionName: string, docId: string, data: any) {
    try {
      const docRef = doc(db, collectionName, docId)
      await updateDoc(docRef, data)
      return { success: true }
    } catch (error) {
      console.error(`Error updating document ${docId}:`, error)
      throw error
    }
  }

  static async deleteDocument(collectionName: string, docId: string) {
    try {
      const docRef = doc(db, collectionName, docId)
      await deleteDoc(docRef)
      return { success: true }
    } catch (error) {
      console.error(`Error deleting document ${docId}:`, error)
      throw error
    }
  }

  static async getCollectionWhere(collectionName: string, field: string, operator: any, value: any) {
    try {
      const q = query(collection(db, collectionName), where(field, operator, value))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error(`Error getting collection ${collectionName} with where:`, error)
      return []
    }
  }

  // OPTIMIZED: Batch fetch documents by IDs using 'in' operator (max 30 IDs per query)
  static async getCollectionWhereIn(collectionName: string, field: string, values: string[]) {
    try {
      if (values.length === 0) return []
      
      // Firestore 'in' operator supports max 30 values
      const maxBatchSize = 30
      const results: any[] = []
      
      for (let i = 0; i < values.length; i += maxBatchSize) {
        const batchValues = values.slice(i, i + maxBatchSize)
        const q = query(collection(db, collectionName), where(field, 'in', batchValues))
        const querySnapshot = await getDocs(q)
        querySnapshot.docs.forEach(doc => {
          results.push({
            id: doc.id,
            ...doc.data()
          })
        })
      }
      
      return results
    } catch (error) {
      console.error(`Error batch fetching from ${collectionName}:`, error)
      return []
    }
  }

  // OPTIMIZED: Batch fetch documents by document IDs (max 30 per batch)
  static async getDocumentsByIds(collectionName: string, docIds: string[]) {
    try {
      if (docIds.length === 0) return []
      
      const results: any[] = []
      const maxBatchSize = 30
      
      for (let i = 0; i < docIds.length; i += maxBatchSize) {
        const batchIds = docIds.slice(i, i + maxBatchSize)
        // Fetch each document individually but in parallel
        const promises = batchIds.map(id => 
          getDoc(doc(db, collectionName, id))
            .then(docSnap => docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null)
            .catch(() => null)
        )
        const batchResults = await Promise.all(promises)
        results.push(...batchResults.filter(Boolean))
      }
      
      return results
    } catch (error) {
      console.error(`Error batch fetching documents from ${collectionName}:`, error)
      return []
    }
  }

  static async getDocuments(collectionName: string, filters: Array<{ field: string; operator: any; value: any }>) {
    try {
      console.log('[getDocuments] Querying', collectionName, 'with filters:', filters)
      let q = query(collection(db, collectionName))
      
      // Apply filters
      for (const filter of filters) {
        console.log('  Adding filter:', filter.field, filter.operator, filter.value)
        q = query(q, where(filter.field, filter.operator, filter.value))
      }
      
      const querySnapshot = await getDocs(q)
      console.log('[getDocuments] Found', querySnapshot.docs.length, 'documents in', collectionName)
      
      const results = querySnapshot.docs.map(doc => {
        const data = doc.data()
        console.log('  Document', doc.id, ':', data)
        return {
          id: doc.id,
          ...data
        }
      })
      
      return results
    } catch (error) {
      console.error('[getDocuments] Error getting documents from', collectionName, ':', error)
      return []
    }
  }

  // Category methods
  static async createCategory(categoryData: any) {
    try {
      const docRef = await addDoc(collection(db, 'categories'), categoryData)
      console.log('Category created successfully with ID:', docRef.id);
      return { success: true, id: docRef.id, ...categoryData }
    } catch (error) {
      console.error('Error creating category:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  static async updateCategory(categoryId: string | number, data: any) {
    try {
      console.log('Updating category with ID:', categoryId, 'Data:', data);
      await updateDoc(doc(db, 'categories', categoryId.toString()), data)
      console.log('Category updated successfully');
      return { success: true }
    } catch (error) {
      console.error('Error updating category:', error)
      return { success: false }
    }
  }

  static async deleteCategory(categoryId: string | number) {
    try {
      console.log('Deleting category with ID:', categoryId);
      await deleteDoc(doc(db, 'categories', categoryId.toString()))
      console.log('Category deleted successfully');
      return { success: true }
    } catch (error) {
      console.error('Error deleting category:', error)
      return { success: false }
    }
  }

  // Song methods
  static async createSong(songData: any) {
    try {
      // Filter out undefined values (Firebase doesn't allow them)
      const cleanData = Object.fromEntries(
        Object.entries(songData).filter(([_, value]) => value !== undefined)
      )

      console.log('Creating song with clean data:', cleanData)
      const docRef = await addDoc(collection(db, 'songs'), cleanData)
      
      // Return the created song with proper ID fields
      const createdSong = {
        ...cleanData,
        id: docRef.id, // Firebase document ID as primary ID
        firebaseId: docRef.id, // Also store as firebaseId for clarity
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log('Song created successfully with ID:', docRef.id);
      console.log('Created song data:', createdSong);
      
      return { 
        success: true, 
        id: docRef.id,
        song: createdSong
      }
    } catch (error) {
      console.error('Error creating song:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  static async updateSong(songId: string | number, data: any) {
    try {
      // SIMPLE: Just use the songId as-is (it's already the Firebase document ID)
      const firebaseDocId = String(songId).trim();

      if (!firebaseDocId || firebaseDocId === '' || firebaseDocId === 'null' || firebaseDocId === 'undefined') {
        console.error('Invalid song ID for update:', songId);
        return {
          success: false,
          error: `Invalid song ID: ${songId}`
        };
      }

      console.log('Updating song:', {
        firebaseDocId: firebaseDocId,
        title: data.title,
        praiseNightId: data.praiseNightId,
        hasHistory: !!data.history,
        historyCount: data.history?.length || 0
      });

      // Filter out undefined values (Firebase doesn't allow them)
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined)
      )

      // Remove id and firebaseId from update data (these shouldn't be updated)
      delete cleanData.id;
      delete cleanData.firebaseId;

      // Update the document
      const docRef = doc(db, 'songs', firebaseDocId);
      console.log('Document path:', `songs/${firebaseDocId}`);

      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        console.error('Song not found:', firebaseDocId);
        return {
          success: false,
          error: `Song not found: ${firebaseDocId}`
        };
      }

      // Add updatedAt timestamp
      cleanData.updatedAt = new Date();

      // Update the document
      await updateDoc(docRef, cleanData);
      console.log('Song updated successfully:', data.title);

      // Save history entries if provided
      if (data.history && data.history.length > 0) {
        console.log('Saving', data.history.length, 'history entries to Firebase...');
        
        // Get existing history to avoid duplicates
        const existingHistory = await this.getCollectionWhere('song_history', 'song_id', '==', firebaseDocId);
        const existingIds = new Set(existingHistory?.map(h => h.id) || []);
        
        // Only save new history entries
        const newHistoryEntries = data.history.filter((h: any) => !existingIds.has(h.id));
        
        for (const historyEntry of newHistoryEntries) {
          const savedEntry = await this.createHistoryEntry({
            ...historyEntry,
            song_id: firebaseDocId, // Use Firebase document ID
            created_at: new Date()
          });
          
          if (savedEntry) {
            console.log('Saved history entry to Firebase:', historyEntry.type);
          } else {
            console.error('Failed to save history entry to Firebase:', historyEntry.type);
          }
        }
        
        console.log('History entries saved to Firebase');
      }

      return { success: true };
    } catch (error) {
      console.error('Firebase updateSong error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: errorMessage
      }
    }
  }

  static async deleteSong(songId: string | number) {
    try {
      // SIMPLE: Just use the songId as-is (it's already the Firebase document ID)
      const firebaseDocId = String(songId).trim();

      if (!firebaseDocId || firebaseDocId === '' || firebaseDocId === 'undefined' || firebaseDocId === 'null') {
        console.error('Invalid song ID for deletion:', songId);
        return {
          success: false,
          error: `Invalid song ID: ${songId}`
        };
      }

      console.log('Deleting song:', firebaseDocId);

      const docRef = doc(db, 'songs', firebaseDocId);

      // Check if exists first
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        console.error('Song not found:', firebaseDocId);
        return {
          success: false,
          error: 'Song not found in database'
        };
      }

      // Delete it
      await deleteDoc(docRef);
      console.log('Song deleted successfully');
      return { success: true };
    } catch (error) {
      console.error('Delete error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Page methods
  static async createPage(pageData: any) {
    try {
      const docRef = await addDoc(collection(db, 'praise_nights'), pageData)
      return { id: docRef.id, ...pageData }
    } catch (error) {
      console.error('Error creating page:', error)
      return null
    }
  }

  static async updatePage(pageId: string | number, data: any) {
    try {
      const docId = typeof pageId === 'number' ? pageId.toString() : pageId
      console.log('Firebase updatePage called with:', { docId, data });
      
      // Check if document exists first
      const docRef = doc(db, 'praise_nights', docId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        console.error('Document does not exist:', docId);
        return false;
      }
      
      console.log('Document exists, current data:', docSnap.data());
      
      await updateDoc(docRef, data);
      console.log('Firebase updatePage successful');
      return true
    } catch (error) {
      console.error('Firebase updatePage error:', error)
      return false
    }
  }

  static async deletePage(pageId: string | number) {
    try {
      const docId = typeof pageId === 'number' ? pageId.toString() : pageId
      await deleteDoc(doc(db, 'praise_nights', docId))
      return true
    } catch (error) {
      console.error('Error deleting page:', error)
      return false
    }
  }

  // Utility methods
  static async updateSongsCategory(oldCategory: string, newCategory: string) {
    try {
      // Get all songs with the old category
      const songsQuery = query(collection(db, 'songs'), where('category', '==', oldCategory))
      const songsSnapshot = await getDocs(songsQuery)
      
      // Update each song
      const updatePromises = songsSnapshot.docs.map(doc => 
        updateDoc(doc.ref, { category: newCategory })
      )
      
      await Promise.all(updatePromises)
      return true
    } catch (error) {
      console.error('Error updating songs category:', error)
      return false
    }
  }

  static async handleCategoryDeletion(categoryName: string, newCategory: string) {
    try {
      // Move songs from deleted category to new category
      return await this.updateSongsCategory(categoryName, newCategory)
    } catch (error) {
      console.error('Error handling category deletion:', error)
      return false
    }
  }

  // Get history entries for a song
  static async getHistoryBySongId(songId: string | number) {
    try {
      console.log('🔍 Firebase: Getting history for song ID:', songId, 'type:', typeof songId);
      
      const q = query(
        collection(db, 'song_history'),
        where('song_id', '==', songId.toString())
      )

      const querySnapshot = await getDocs(q)
      console.log('📊 Firebase: Query returned', querySnapshot.docs.length, 'documents');
      
      const results = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('📝 Firebase: History entry:', {
          id: doc.id,
          song_id: data.song_id,
          title: data.title,
          type: data.type
        });
        return {
          id: doc.id,
          ...data
        };
      });

      // Sort by created_at in JavaScript to avoid index requirement
      const sortedResults = results.sort((a, b) => {
        const dateA = new Date((a as any).created_at || 0).getTime()
        const dateB = new Date((b as any).created_at || 0).getTime()
        return dateB - dateA // Descending order (newest first)
      });
      
      console.log('✅ Firebase: Returning', sortedResults.length, 'sorted history entries');
      return sortedResults;
    } catch (error) {
      console.error('❌ Error getting song history:', error)
      return []
    }
  }

  // ===== GROUP POSTS OPERATIONS =====

  static async getGroupPosts(groupId: string) {
    try {
      const q = query(
        collection(db, 'group_posts'),
        where('group_id', '==', groupId),
        orderBy('timestamp', 'desc')
      )
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Error getting group posts:', error)
      return []
    }
  }

  static async createGroupPost(postData: any) {
    try {
      const docRef = await addDoc(collection(db, 'group_posts'), postData)
      return { id: docRef.id, ...postData }
    } catch (error) {
      console.error('Error creating group post:', error)
      return null
    }
  }

  static async updateGroupPost(postId: string, data: any) {
    try {
      await updateDoc(doc(db, 'group_posts', postId), data)
      return true
    } catch (error) {
      console.error('Error updating group post:', error)
      return false
    }
  }

  static async deleteGroupPost(postId: string) {
    try {
      await deleteDoc(doc(db, 'group_posts', postId))
      return true
    } catch (error) {
      console.error('Error deleting group post:', error)
      return false
    }
  }

  // Create history entry
  static async createHistoryEntry(data: any) {
    try {
      const docRef = await addDoc(collection(db, 'song_history'), data)
      console.log('✅ History entry created successfully:', docRef.id)
      return true // Return boolean for success
    } catch (error) {
      console.error('❌ Error creating history entry:', error)
      return false // Return boolean for failure
    }
  }

  // Delete history entry
  static async deleteHistoryEntry(entryId: string) {
    try {
      await deleteDoc(doc(db, 'song_history', entryId))
      return true
    } catch (error) {
      console.error('Error deleting history entry:', error)
      return false
    }
  }

  // Page Category functions
  static async getPageCategories() {
    try {
      const q = query(
        collection(db, 'page_categories'),
        orderBy('createdAt', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Error getting page categories:', error)
      return []
    }
  }

  static async createPageCategory(data: any) {
    try {
      const categoryData = {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      const docRef = await addDoc(collection(db, 'page_categories'), categoryData)
      return { success: true, id: docRef.id }
    } catch (error) {
      console.error('Error creating page category:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Failed to create page category' }
    }
  }

  static async updatePageCategory(id: string, data: any) {
    try {
      const docRef = doc(db, 'page_categories', id)
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date()
      })
      return { success: true }
    } catch (error) {
      console.error('Error updating page category:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update page category' }
    }
  }

  static async deletePageCategory(id: string) {
    try {
      const docRef = doc(db, 'page_categories', id)
      await deleteDoc(docRef)
      return { success: true }
    } catch (error) {
      console.error('Error deleting page category:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Failed to delete page category' }
    }
  }
}
