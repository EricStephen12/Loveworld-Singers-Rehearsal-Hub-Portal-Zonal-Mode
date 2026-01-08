module.exports = [
"[project]/src/lib/firebase-database.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FirebaseDatabaseService",
    ()=>FirebaseDatabaseService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$firestore$2f$dist$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/firestore/dist/index.mjs [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/firebase/node_modules/@firebase/firestore/dist/index.node.mjs [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase-setup.ts [app-rsc] (ecmascript)");
;
;
class FirebaseDatabaseService {
    // Get all praise nights (pages) - optimized for millions of users
    static async getPraiseNights(limitCount = 10) {
        try {
            const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"], 'praise_nights'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["orderBy"])('createdAt', 'desc'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["limit"])(limitCount));
            const querySnapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getDocs"])(q);
            return querySnapshot.docs.map((doc)=>({
                    id: doc.id,
                    ...doc.data()
                }));
        } catch (error) {
            console.error('Error getting praise nights:', error);
            return [];
        }
    }
    // Get songs for a specific praise night
    static async getSongs(praiseNightId) {
        try {
            const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"], 'songs'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["where"])('praiseNightId', '==', praiseNightId));
            const querySnapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getDocs"])(q);
            const results = querySnapshot.docs.map((doc)=>({
                    id: doc.id,
                    firebaseId: doc.id,
                    ...doc.data()
                }));
            // Sort by orderIndex in JavaScript to avoid index requirement
            return results.sort((a, b)=>{
                const indexA = a.orderIndex || 0;
                const indexB = b.orderIndex || 0;
                return indexA - indexB // Ascending order
                ;
            });
        } catch (error) {
            console.error('Error getting songs:', error);
            return [];
        }
    }
    // Get a single song by ID - CRITICAL for SongDetailModal
    static async getSongById(songId) {
        try {
            console.log('[getSongById] Fetching song with ID:', songId);
            const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"], 'songs', songId);
            const docSnap = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getDoc"])(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                const songData = {
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
    static async getUserProfile(userId) {
        try {
            const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"], 'profiles', userId);
            const docSnap = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getDoc"])(docRef);
            if (docSnap.exists()) {
                return {
                    id: docSnap.id,
                    ...docSnap.data()
                };
            }
            return null;
        } catch (error) {
            console.error('Error getting user profile:', error);
            return null;
        }
    }
    // Update user profile
    static async updateUserProfile(userId, data) {
        try {
            const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"], 'profiles', userId);
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["updateDoc"])(docRef, {
                ...data,
                updatedAt: new Date()
            });
            return {
                success: true
            };
        } catch (error) {
            console.error('Error updating user profile:', error);
            return {
                success: false
            };
        }
    }
    // Get all users
    static async getAllUsers() {
        try {
            const querySnapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getDocs"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"], 'profiles'));
            return querySnapshot.docs.map((doc)=>({
                    id: doc.id,
                    ...doc.data()
                }));
        } catch (error) {
            console.error('Error getting all users:', error);
            return [];
        }
    }
    // Real-time listener for praise nights
    static subscribeToPraiseNights(callback) {
        const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"], 'praise_nights'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["orderBy"])('createdAt', 'desc'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["limit"])(10));
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["onSnapshot"])(q, (querySnapshot)=>{
            const data = querySnapshot.docs.map((doc)=>({
                    id: doc.id,
                    ...doc.data()
                }));
            callback(data);
        });
    }
    // Add new praise night with Firebase-generated ID
    static async addPraiseNight(data) {
        try {
            console.log('Creating praise night with Firebase-generated ID...');
            const pageData = {
                ...data,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            // Use addDoc to let Firebase generate a unique ID
            const docRef = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["addDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"], 'praise_nights'), pageData);
            console.log('Page created with Firebase-generated ID:', docRef.id);
            return {
                id: docRef.id,
                firebaseId: docRef.id,
                success: true
            };
        } catch (error) {
            console.error('Error adding praise night:', error);
            return {
                id: null,
                firebaseId: null,
                success: false
            };
        }
    }
    // Update praise night
    static async updatePraiseNight(id, data) {
        try {
            const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"], 'praise_nights', id);
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["updateDoc"])(docRef, {
                ...data,
                updatedAt: new Date()
            });
            // Log activity
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            return {
                success: true
            };
        } catch (error) {
            console.error('Error updating praise night:', error);
            return {
                success: false
            };
        }
    }
    // Delete praise night
    static async deletePraiseNight(id) {
        try {
            const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"], 'praise_nights', id);
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["deleteDoc"])(docRef);
            // Log activity
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            return {
                success: true
            };
        } catch (error) {
            console.error('Error deleting praise night:', error);
            return {
                success: false
            };
        }
    }
    // Test connection
    static async testConnection() {
        try {
            // Test if Firestore is initialized
            if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"]) {
                return {
                    status: 'error',
                    message: 'Firestore not initialized'
                };
            }
            // Test if we can access the database
            const testCollection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"], 'test');
            return {
                status: 'success',
                message: 'Firebase Firestore connected successfully'
            };
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            };
        }
    }
    // Generic methods for migration
    // OPTIMIZED: Added optional limit parameter (default 500 to prevent massive reads)
    static async getCollection(collectionName, maxLimit = 500) {
        try {
            // Use limit to prevent fetching entire large collections
            const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"], collectionName), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["limit"])(maxLimit));
            const querySnapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getDocs"])(q);
            return querySnapshot.docs.map((doc)=>{
                const data = doc.data();
                const result = {
                    id: doc.id,
                    firebaseId: doc.id,
                    supabaseId: data.id,
                    ...data
                };
                return result;
            });
        } catch (error) {
            console.error(`Error getting collection ${collectionName}:`, error);
            return [];
        }
    }
    // Get ALL documents from a collection (no limit) - use carefully!
    static async getAllFromCollection(collectionName) {
        try {
            const querySnapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getDocs"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"], collectionName));
            return querySnapshot.docs.map((doc)=>{
                const data = doc.data();
                return {
                    id: doc.id,
                    firebaseId: doc.id,
                    ...data
                };
            });
        } catch (error) {
            console.error(`Error getting all from ${collectionName}:`, error);
            return [];
        }
    }
    // Batch fetch with cursor pagination - for large collections like analytics
    // Returns data in batches and calls onBatch callback for each batch
    static async getCollectionInBatches(collectionName, batchSize = 500, maxTotal = 10000, orderByField = 'timestamp', onBatch) {
        try {
            const allResults = [];
            let lastDoc = null;
            let hasMore = true;
            console.log('[Batch] Starting batch fetch for', collectionName, '(batch size:', batchSize, ', max:', maxTotal, ')');
            while(hasMore && allResults.length < maxTotal){
                // Build query with cursor if we have a last document
                const q = lastDoc ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"], collectionName), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["orderBy"])(orderByField, 'desc'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["startAfter"])(lastDoc), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["limit"])(batchSize)) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"], collectionName), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["orderBy"])(orderByField, 'desc'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["limit"])(batchSize));
                const querySnapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getDocs"])(q);
                const batchDocs = querySnapshot.docs;
                if (batchDocs.length === 0) {
                    hasMore = false;
                    console.log('[Batch] No more documents in', collectionName);
                } else {
                    // Map documents to data
                    const batchData = batchDocs.map((docSnap)=>({
                            id: docSnap.id,
                            firebaseId: docSnap.id,
                            ...docSnap.data()
                        }));
                    allResults.push(...batchData);
                    lastDoc = batchDocs[batchDocs.length - 1];
                    console.log('[Batch] Fetched', batchData.length, 'docs, total:', allResults.length);
                    // Call callback with batch progress
                    if (onBatch) {
                        const isComplete = batchDocs.length < batchSize || allResults.length >= maxTotal;
                        onBatch(batchData, allResults.length, isComplete);
                    }
                    // Check if we got less than batch size (means no more data)
                    if (batchDocs.length < batchSize) {
                        hasMore = false;
                    }
                }
            }
            console.log('[Batch] Complete:', allResults.length, 'total documents from', collectionName);
            return allResults;
        } catch (error) {
            console.error('[Batch] Error fetching', collectionName, ':', error);
            return [];
        }
    }
    // Batch fetch for analytics_sessions (uses startTime field)
    static async getSessionsInBatches(batchSize = 500, maxTotal = 5000, onBatch) {
        return this.getCollectionInBatches('analytics_sessions', batchSize, maxTotal, 'startTime', onBatch);
    }
    // Batch fetch for analytics_events (uses timestamp field)
    static async getEventsInBatches(batchSize = 500, maxTotal = 10000, onBatch) {
        return this.getCollectionInBatches('analytics_events', batchSize, maxTotal, 'timestamp', onBatch);
    }
    static async getDocument(collectionName, docId) {
        try {
            const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"], collectionName, docId);
            const docSnap = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getDoc"])(docRef);
            if (docSnap.exists()) {
                return {
                    id: docSnap.id,
                    ...docSnap.data()
                };
            } else {
                return null;
            }
        } catch (error) {
            console.error(`Error getting document ${docId}:`, error);
            return null;
        }
    }
    static async createDocument(collectionName, docId, data) {
        try {
            const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"], collectionName, docId);
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["setDoc"])(docRef, data);
            // Update analytics aggregation if this is an analytics event
            if (collectionName === 'analytics_events' && data.type) {
                try {
                    const { AnalyticsAggregationService } = await __turbopack_context__.A("[project]/src/lib/analytics-aggregation-service.ts [app-rsc] (ecmascript, async loader)");
                    await AnalyticsAggregationService.incrementEvent(data.timestamp || Date.now(), data.type, data.page, data.featureName);
                } catch (analyticsError) {
                    console.warn('Could not update analytics aggregation:', analyticsError);
                }
            }
            return {
                id: docId,
                ...data
            };
        } catch (error) {
            console.error(`Error creating document ${docId}:`, error);
            throw error;
        }
    }
    // Create document with auto-generated ID
    static async addDocument(collectionName, data) {
        try {
            const docRef = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["addDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"], collectionName), data);
            // Update analytics aggregation if this is an analytics event
            if (collectionName === 'analytics_events' && data.type) {
                try {
                    const { AnalyticsAggregationService } = await __turbopack_context__.A("[project]/src/lib/analytics-aggregation-service.ts [app-rsc] (ecmascript, async loader)");
                    await AnalyticsAggregationService.incrementEvent(data.timestamp || Date.now(), data.type, data.page, data.featureName);
                } catch (analyticsError) {
                    console.warn('Could not update analytics aggregation:', analyticsError);
                }
            }
            return {
                success: true,
                id: docRef.id,
                ...data
            };
        } catch (error) {
            console.error(`Error adding document to ${collectionName}:`, error);
            throw error;
        }
    }
    static async updateDocument(collectionName, docId, data) {
        try {
            const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"], collectionName, docId);
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["updateDoc"])(docRef, data);
            return {
                success: true
            };
        } catch (error) {
            console.error(`Error updating document ${docId}:`, error);
            throw error;
        }
    }
    static async deleteDocument(collectionName, docId) {
        try {
            const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"], collectionName, docId);
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["deleteDoc"])(docRef);
            return {
                success: true
            };
        } catch (error) {
            console.error(`Error deleting document ${docId}:`, error);
            throw error;
        }
    }
    static async getCollectionWhere(collectionName, field, operator, value) {
        try {
            const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"], collectionName), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["where"])(field, operator, value));
            const querySnapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getDocs"])(q);
            return querySnapshot.docs.map((doc)=>({
                    id: doc.id,
                    ...doc.data()
                }));
        } catch (error) {
            console.error(`Error getting collection ${collectionName} with where:`, error);
            return [];
        }
    }
    // OPTIMIZED: Batch fetch documents by IDs using 'in' operator (max 30 IDs per query)
    static async getCollectionWhereIn(collectionName, field, values) {
        try {
            if (values.length === 0) return [];
            // Firestore 'in' operator supports max 30 values
            const maxBatchSize = 30;
            const results = [];
            for(let i = 0; i < values.length; i += maxBatchSize){
                const batchValues = values.slice(i, i + maxBatchSize);
                const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"], collectionName), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["where"])(field, 'in', batchValues));
                const querySnapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getDocs"])(q);
                querySnapshot.docs.forEach((doc)=>{
                    results.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
            }
            return results;
        } catch (error) {
            console.error(`Error batch fetching from ${collectionName}:`, error);
            return [];
        }
    }
    // OPTIMIZED: Batch fetch documents by document IDs (max 30 per batch)
    static async getDocumentsByIds(collectionName, docIds) {
        try {
            if (docIds.length === 0) return [];
            const results = [];
            const maxBatchSize = 30;
            for(let i = 0; i < docIds.length; i += maxBatchSize){
                const batchIds = docIds.slice(i, i + maxBatchSize);
                // Fetch each document individually but in parallel
                const promises = batchIds.map((id)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"], collectionName, id)).then((docSnap)=>docSnap.exists() ? {
                            id: docSnap.id,
                            ...docSnap.data()
                        } : null).catch(()=>null));
                const batchResults = await Promise.all(promises);
                results.push(...batchResults.filter(Boolean));
            }
            return results;
        } catch (error) {
            console.error(`Error batch fetching documents from ${collectionName}:`, error);
            return [];
        }
    }
    static async getDocuments(collectionName, filters) {
        try {
            console.log('[getDocuments] Querying', collectionName, 'with filters:', filters);
            let q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"], collectionName));
            // Apply filters
            for (const filter of filters){
                console.log('  Adding filter:', filter.field, filter.operator, filter.value);
                q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["query"])(q, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["where"])(filter.field, filter.operator, filter.value));
            }
            const querySnapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getDocs"])(q);
            console.log('[getDocuments] Found', querySnapshot.docs.length, 'documents in', collectionName);
            const results = querySnapshot.docs.map((doc)=>{
                const data = doc.data();
                console.log('  Document', doc.id, ':', data);
                return {
                    id: doc.id,
                    ...data
                };
            });
            return results;
        } catch (error) {
            console.error('[getDocuments] Error getting documents from', collectionName, ':', error);
            return [];
        }
    }
    // Category methods
    static async createCategory(categoryData) {
        try {
            const docRef = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["addDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"], 'categories'), categoryData);
            console.log('Category created successfully with ID:', docRef.id);
            return {
                success: true,
                id: docRef.id,
                ...categoryData
            };
        } catch (error) {
            console.error('Error creating category:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    static async updateCategory(categoryId, data) {
        try {
            console.log('Updating category with ID:', categoryId, 'Data:', data);
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["updateDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"], 'categories', categoryId.toString()), data);
            console.log('Category updated successfully');
            return {
                success: true
            };
        } catch (error) {
            console.error('Error updating category:', error);
            return {
                success: false
            };
        }
    }
    static async deleteCategory(categoryId) {
        try {
            console.log('Deleting category with ID:', categoryId);
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["deleteDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"], 'categories', categoryId.toString()));
            console.log('Category deleted successfully');
            return {
                success: true
            };
        } catch (error) {
            console.error('Error deleting category:', error);
            return {
                success: false
            };
        }
    }
    // Song methods
    static async createSong(songData) {
        try {
            // Filter out undefined values (Firebase doesn't allow them)
            const cleanData = Object.fromEntries(Object.entries(songData).filter(([_, value])=>value !== undefined));
            console.log('Creating song with clean data:', cleanData);
            const docRef = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["addDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"], 'songs'), cleanData);
            // Return the created song with proper ID fields
            const createdSong = {
                ...cleanData,
                id: docRef.id,
                firebaseId: docRef.id,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            console.log('Song created successfully with ID:', docRef.id);
            console.log('Created song data:', createdSong);
            return {
                success: true,
                id: docRef.id,
                song: createdSong
            };
        } catch (error) {
            console.error('Error creating song:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    static async updateSong(songId, data) {
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
            const cleanData = Object.fromEntries(Object.entries(data).filter(([_, value])=>value !== undefined));
            // Remove id and firebaseId from update data (these shouldn't be updated)
            delete cleanData.id;
            delete cleanData.firebaseId;
            // Update the document
            const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"], 'songs', firebaseDocId);
            console.log('Document path:', `songs/${firebaseDocId}`);
            const docSnap = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getDoc"])(docRef);
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
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["updateDoc"])(docRef, cleanData);
            console.log('Song updated successfully:', data.title);
            // Save history entries if provided
            if (data.history && data.history.length > 0) {
                console.log('Saving', data.history.length, 'history entries to Firebase...');
                // Get existing history to avoid duplicates
                const existingHistory = await this.getCollectionWhere('song_history', 'song_id', '==', firebaseDocId);
                const existingIds = new Set(existingHistory?.map((h)=>h.id) || []);
                // Only save new history entries
                const newHistoryEntries = data.history.filter((h)=>!existingIds.has(h.id));
                for (const historyEntry of newHistoryEntries){
                    const savedEntry = await this.createHistoryEntry({
                        ...historyEntry,
                        song_id: firebaseDocId,
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
            return {
                success: true
            };
        } catch (error) {
            console.error('Firebase updateSong error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            return {
                success: false,
                error: errorMessage
            };
        }
    }
    static async deleteSong(songId) {
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
            const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"], 'songs', firebaseDocId);
            // Check if exists first
            const docSnap = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getDoc"])(docRef);
            if (!docSnap.exists()) {
                console.error('Song not found:', firebaseDocId);
                return {
                    success: false,
                    error: 'Song not found in database'
                };
            }
            // Delete it
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["deleteDoc"])(docRef);
            console.log('Song deleted successfully');
            return {
                success: true
            };
        } catch (error) {
            console.error('Delete error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    // Page methods
    static async createPage(pageData) {
        try {
            const docRef = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["addDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"], 'praise_nights'), pageData);
            return {
                id: docRef.id,
                ...pageData
            };
        } catch (error) {
            console.error('Error creating page:', error);
            return null;
        }
    }
    static async updatePage(pageId, data) {
        try {
            const docId = typeof pageId === 'number' ? pageId.toString() : pageId;
            console.log('Firebase updatePage called with:', {
                docId,
                data
            });
            // Check if document exists first
            const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"], 'praise_nights', docId);
            const docSnap = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getDoc"])(docRef);
            if (!docSnap.exists()) {
                console.error('Document does not exist:', docId);
                return false;
            }
            console.log('Document exists, current data:', docSnap.data());
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["updateDoc"])(docRef, data);
            console.log('Firebase updatePage successful');
            return true;
        } catch (error) {
            console.error('Firebase updatePage error:', error);
            return false;
        }
    }
    static async deletePage(pageId) {
        try {
            const docId = typeof pageId === 'number' ? pageId.toString() : pageId;
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["deleteDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"], 'praise_nights', docId));
            return true;
        } catch (error) {
            console.error('Error deleting page:', error);
            return false;
        }
    }
    // Utility methods
    static async updateSongsCategory(oldCategory, newCategory) {
        try {
            // Get all songs with the old category
            const songsQuery = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"], 'songs'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["where"])('category', '==', oldCategory));
            const songsSnapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getDocs"])(songsQuery);
            // Update each song
            const updatePromises = songsSnapshot.docs.map((doc)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["updateDoc"])(doc.ref, {
                    category: newCategory
                }));
            await Promise.all(updatePromises);
            return true;
        } catch (error) {
            console.error('Error updating songs category:', error);
            return false;
        }
    }
    static async handleCategoryDeletion(categoryName, newCategory) {
        try {
            // Move songs from deleted category to new category
            return await this.updateSongsCategory(categoryName, newCategory);
        } catch (error) {
            console.error('Error handling category deletion:', error);
            return false;
        }
    }
    // Get history entries for a song
    static async getHistoryBySongId(songId) {
        try {
            console.log('🔍 Firebase: Getting history for song ID:', songId, 'type:', typeof songId);
            const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"], 'song_history'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["where"])('song_id', '==', songId.toString()));
            const querySnapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getDocs"])(q);
            console.log('📊 Firebase: Query returned', querySnapshot.docs.length, 'documents');
            const results = querySnapshot.docs.map((doc)=>{
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
            const sortedResults = results.sort((a, b)=>{
                const dateA = new Date(a.created_at || 0).getTime();
                const dateB = new Date(b.created_at || 0).getTime();
                return dateB - dateA // Descending order (newest first)
                ;
            });
            console.log('✅ Firebase: Returning', sortedResults.length, 'sorted history entries');
            return sortedResults;
        } catch (error) {
            console.error('❌ Error getting song history:', error);
            return [];
        }
    }
    // ===== GROUP POSTS OPERATIONS =====
    static async getGroupPosts(groupId) {
        try {
            const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"], 'group_posts'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["where"])('group_id', '==', groupId), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["orderBy"])('timestamp', 'desc'));
            const querySnapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getDocs"])(q);
            return querySnapshot.docs.map((doc)=>({
                    id: doc.id,
                    ...doc.data()
                }));
        } catch (error) {
            console.error('Error getting group posts:', error);
            return [];
        }
    }
    static async createGroupPost(postData) {
        try {
            const docRef = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["addDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"], 'group_posts'), postData);
            return {
                id: docRef.id,
                ...postData
            };
        } catch (error) {
            console.error('Error creating group post:', error);
            return null;
        }
    }
    static async updateGroupPost(postId, data) {
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["updateDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"], 'group_posts', postId), data);
            return true;
        } catch (error) {
            console.error('Error updating group post:', error);
            return false;
        }
    }
    static async deleteGroupPost(postId) {
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["deleteDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"], 'group_posts', postId));
            return true;
        } catch (error) {
            console.error('Error deleting group post:', error);
            return false;
        }
    }
    // Create history entry
    static async createHistoryEntry(data) {
        try {
            const docRef = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["addDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"], 'song_history'), data);
            console.log('✅ History entry created successfully:', docRef.id);
            return true // Return boolean for success
            ;
        } catch (error) {
            console.error(' Error creating history entry:', error);
            return false // Return boolean for failure
            ;
        }
    }
    // Update history entry
    static async updateHistoryEntry(entryId, data) {
        try {
            const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"], 'song_history', entryId);
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["updateDoc"])(docRef, {
                ...data,
                updated_at: new Date() // Add timestamp for when the history entry was updated
            });
            // Clear the history cache for this song so other components get fresh data
            if (data.song_id) {
                try {
                    const CACHE_KEY = 'song-history-cache';
                    const { offlineManager } = await __turbopack_context__.A("[project]/src/utils/offlineManager.ts [app-rsc] (ecmascript, async loader)");
                    const cached = await offlineManager.getCachedData(CACHE_KEY);
                    if (cached && cached[String(data.song_id)]) {
                        delete cached[String(data.song_id)];
                        await offlineManager.cacheData(CACHE_KEY, cached);
                    }
                } catch (cacheError) {
                    console.warn('Could not clear history cache:', cacheError);
                }
            }
            return true;
        } catch (error) {
            console.error('Error updating history entry:', error);
            return false;
        }
    }
    // Delete history entry
    static async deleteHistoryEntry(entryId) {
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["deleteDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"], 'song_history', entryId));
            return true;
        } catch (error) {
            console.error('Error deleting history entry:', error);
            return false;
        }
    }
    // Page Category functions
    static async getPageCategories() {
        try {
            const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"], 'page_categories'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["orderBy"])('createdAt', 'desc'));
            const querySnapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getDocs"])(q);
            return querySnapshot.docs.map((doc)=>({
                    id: doc.id,
                    ...doc.data()
                }));
        } catch (error) {
            console.error('Error getting page categories:', error);
            return [];
        }
    }
    static async createPageCategory(data) {
        try {
            const categoryData = {
                ...data,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            const docRef = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["addDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"], 'page_categories'), categoryData);
            return {
                success: true,
                id: docRef.id
            };
        } catch (error) {
            console.error('Error creating page category:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create page category'
            };
        }
    }
    static async updatePageCategory(id, data) {
        try {
            const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"], 'page_categories', id);
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["updateDoc"])(docRef, {
                ...data,
                updatedAt: new Date()
            });
            return {
                success: true
            };
        } catch (error) {
            console.error('Error updating page category:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update page category'
            };
        }
    }
    static async deletePageCategory(id) {
        try {
            const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"], 'page_categories', id);
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["deleteDoc"])(docRef);
            return {
                success: true
            };
        } catch (error) {
            console.error('Error deleting page category:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to delete page category'
            };
        }
    }
}
}),
];

//# sourceMappingURL=src_lib_firebase-database_ts_81b20753._.js.map