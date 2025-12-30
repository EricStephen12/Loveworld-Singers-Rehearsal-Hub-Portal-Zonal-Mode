(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/lib/master-library-service.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MasterLibraryService",
    ()=>MasterLibraryService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$firestore$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/firestore/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/firebase/node_modules/@firebase/firestore/dist/index.esm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase-database.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase-setup.ts [app-client] (ecmascript)");
;
;
;
let masterSongsCache = null;
let hqInternalSongsCache = null;
const CACHE_TTL = 5 * 60 * 1000;
let lastMasterSongDoc = null;
let lastHQInternalDoc = null;
class MasterLibraryService {
    static async getMasterSongs() {
        let limitCount = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 100, forceRefresh = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
        try {
            if (!forceRefresh && masterSongsCache && Date.now() - masterSongsCache.timestamp < CACHE_TTL) {
                return masterSongsCache.data;
            }
            const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'master_songs'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["orderBy"])('publishedAt', 'desc'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["limit"])(limitCount));
            const querySnapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
            const songs = querySnapshot.docs.map((doc)=>({
                    id: doc.id,
                    ...doc.data()
                }));
            masterSongsCache = {
                data: songs,
                timestamp: Date.now()
            };
            if (querySnapshot.docs.length > 0) {
                lastMasterSongDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
            }
            return songs;
        } catch (error) {
            console.error('Error getting Master Library songs:', error);
            return [];
        }
    }
    static async loadMoreMasterSongs() {
        let limitCount = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 50;
        try {
            if (!lastMasterSongDoc) return [];
            const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'master_songs'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["orderBy"])('publishedAt', 'desc'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["startAfter"])(lastMasterSongDoc), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["limit"])(limitCount));
            const querySnapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
            const songs = querySnapshot.docs.map((doc)=>({
                    id: doc.id,
                    ...doc.data()
                }));
            if (querySnapshot.docs.length > 0) {
                lastMasterSongDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
                if (masterSongsCache) {
                    masterSongsCache.data = [
                        ...masterSongsCache.data,
                        ...songs
                    ];
                    masterSongsCache.timestamp = Date.now();
                }
            } else {
                lastMasterSongDoc = null;
            }
            return songs;
        } catch (error) {
            console.error('Error loading more Master Library songs:', error);
            return [];
        }
    }
    static hasMoreMasterSongs() {
        return lastMasterSongDoc !== null;
    }
    static clearMasterSongsCache() {
        masterSongsCache = null;
        lastMasterSongDoc = null;
    }
    static async getMasterSong(songId) {
        try {
            const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'master_songs', songId);
            const docSnap = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDoc"])(docRef);
            if (docSnap.exists()) {
                return {
                    id: docSnap.id,
                    ...docSnap.data()
                };
            }
            return null;
        } catch (error) {
            console.error('Error getting Master song:', error);
            return null;
        }
    }
    static async publishToMasterLibrary(originalSong, publishedBy, publishedByName) {
        try {
            const existing = await this.getMasterSongByOriginalId(originalSong.id);
            if (existing) {
                return {
                    success: false,
                    error: 'This song is already in the Master Library'
                };
            }
            const masterSongData = {
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
                customParts: originalSong.customParts || [],
                sourceType: 'hq_internal',
                originalSongId: originalSong.id || originalSong.firebaseId,
                publishedBy,
                publishedByName: publishedByName || '',
                publishedAt: new Date(),
                updatedAt: new Date(),
                importCount: 0
            };
            const cleanData = Object.fromEntries(Object.entries(masterSongData).filter((param)=>{
                let [_, v] = param;
                return v !== undefined;
            }));
            const result = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].addDocument('master_songs', cleanData);
            if (result.success) {
                this.clearMasterSongsCache();
                return {
                    success: true,
                    id: result.id
                };
            }
            return {
                success: false,
                error: 'Failed to publish song'
            };
        } catch (error) {
            console.error('Error publishing to Master Library:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    static async createMasterSong(songData, publishedBy, publishedByName) {
        try {
            var _songData_audioUrls;
            const masterSongData = {
                title: songData.title || '',
                lyrics: songData.lyrics || '',
                solfa: songData.solfa || '',
                key: songData.key || '',
                tempo: songData.tempo || '',
                writer: songData.writer || '',
                leadSinger: songData.leadSinger || '',
                category: songData.category || '',
                categories: songData.categories || [],
                audioFile: ((_songData_audioUrls = songData.audioUrls) === null || _songData_audioUrls === void 0 ? void 0 : _songData_audioUrls.full) || songData.audioFile || '',
                audioUrls: songData.audioUrls || {},
                customParts: songData.customParts || [],
                sourceType: 'manual',
                publishedBy,
                publishedByName: publishedByName || '',
                publishedAt: new Date(),
                updatedAt: new Date(),
                importCount: 0
            };
            const cleanData = Object.fromEntries(Object.entries(masterSongData).filter((param)=>{
                let [_, v] = param;
                return v !== undefined;
            }));
            const result = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].addDocument('master_songs', cleanData);
            if (result.success) {
                this.clearMasterSongsCache();
                return {
                    success: true,
                    id: result.id
                };
            }
            return {
                success: false,
                error: 'Failed to create song'
            };
        } catch (error) {
            console.error('Error creating Master song:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    static async getMasterSongByOriginalId(originalSongId) {
        try {
            const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'master_songs'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('originalSongId', '==', originalSongId));
            const querySnapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
            if (!querySnapshot.empty) {
                const doc = querySnapshot.docs[0];
                return {
                    id: doc.id,
                    ...doc.data()
                };
            }
            return null;
        } catch (error) {
            console.error('Error checking Master Library:', error);
            return null;
        }
    }
    static async updateMasterSong(songId, data) {
        try {
            const updateData = {
                ...data
            };
            delete updateData.sourceType;
            delete updateData.originalSongId;
            delete updateData.publishedBy;
            delete updateData.publishedAt;
            delete updateData.importCount;
            updateData.updatedAt = new Date();
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].updateDocument('master_songs', songId, updateData);
            return {
                success: true
            };
        } catch (error) {
            console.error('Error updating Master song:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    static async deleteMasterSong(songId) {
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].deleteDocument('master_songs', songId);
            this.clearMasterSongsCache();
            return {
                success: true
            };
        } catch (error) {
            console.error('Error deleting Master song:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    static async importToZone(masterSong, zoneId, praiseNightId, importedBy) {
        try {
            const zoneSongData = {
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
                zoneId,
                praiseNightId,
                importedFrom: 'master',
                originalSongId: masterSong.id,
                importedAt: new Date(),
                importedBy,
                createdAt: new Date(),
                updatedAt: new Date(),
                status: 'unheard'
            };
            const cleanData = Object.fromEntries(Object.entries(zoneSongData).filter((param)=>{
                let [_, v] = param;
                return v !== undefined;
            }));
            const result = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].addDocument('zone_songs', cleanData);
            if (result.success) {
                await this.incrementImportCount(masterSong.id);
                return {
                    success: true,
                    id: result.id
                };
            }
            return {
                success: false,
                error: 'Failed to import song'
            };
        } catch (error) {
            console.error('Error importing to zone:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    static async incrementImportCount(masterSongId) {
        try {
            const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'master_songs', masterSongId);
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateDoc"])(docRef, {
                importCount: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["increment"])(1)
            });
        } catch (error) {
            console.error('Error incrementing import count:', error);
        }
    }
    static async getHQInternalSongs() {
        let limitCount = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 200, forceRefresh = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
        try {
            if (!forceRefresh && hqInternalSongsCache && Date.now() - hqInternalSongsCache.timestamp < CACHE_TTL) {
                return hqInternalSongsCache.data;
            }
            const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'praise_night_songs'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["limit"])(limitCount));
            const querySnapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
            const songs = querySnapshot.docs.map((doc)=>({
                    id: doc.id,
                    firebaseId: doc.id,
                    ...doc.data()
                }));
            songs.sort((a, b)=>(a.title || '').localeCompare(b.title || ''));
            hqInternalSongsCache = {
                data: songs,
                timestamp: Date.now()
            };
            if (querySnapshot.docs.length > 0) {
                lastHQInternalDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
            }
            return songs;
        } catch (error) {
            console.error('Error getting HQ Internal songs:', error);
            return [];
        }
    }
    static async loadMoreHQInternalSongs() {
        let limitCount = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 100;
        try {
            if (!lastHQInternalDoc) return [];
            const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'praise_night_songs'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["startAfter"])(lastHQInternalDoc), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["limit"])(limitCount));
            const querySnapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
            const songs = querySnapshot.docs.map((doc)=>({
                    id: doc.id,
                    firebaseId: doc.id,
                    ...doc.data()
                }));
            songs.sort((a, b)=>(a.title || '').localeCompare(b.title || ''));
            if (querySnapshot.docs.length > 0) {
                lastHQInternalDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
                if (hqInternalSongsCache) {
                    hqInternalSongsCache.data = [
                        ...hqInternalSongsCache.data,
                        ...songs
                    ];
                    hqInternalSongsCache.timestamp = Date.now();
                }
            } else {
                lastHQInternalDoc = null;
            }
            return songs;
        } catch (error) {
            console.error('Error loading more HQ Internal songs:', error);
            return [];
        }
    }
    static hasMoreHQInternalSongs() {
        return lastHQInternalDoc !== null;
    }
    static clearHQInternalSongsCache() {
        hqInternalSongsCache = null;
        lastHQInternalDoc = null;
    }
    static async searchMasterSongs(searchTerm) {
        try {
            const allSongs = await this.getMasterSongs();
            const term = searchTerm.toLowerCase();
            return allSongs.filter((song)=>{
                var _song_title, _song_writer, _song_leadSinger, _song_category;
                return ((_song_title = song.title) === null || _song_title === void 0 ? void 0 : _song_title.toLowerCase().includes(term)) || ((_song_writer = song.writer) === null || _song_writer === void 0 ? void 0 : _song_writer.toLowerCase().includes(term)) || ((_song_leadSinger = song.leadSinger) === null || _song_leadSinger === void 0 ? void 0 : _song_leadSinger.toLowerCase().includes(term)) || ((_song_category = song.category) === null || _song_category === void 0 ? void 0 : _song_category.toLowerCase().includes(term));
            });
        } catch (error) {
            console.error('Error searching Master Library:', error);
            return [];
        }
    }
    static async getMasterLibraryStats() {
        try {
            const songs = await this.getMasterSongs();
            const totalImports = songs.reduce((sum, song)=>sum + (song.importCount || 0), 0);
            const mostImported = [
                ...songs
            ].sort((a, b)=>(b.importCount || 0) - (a.importCount || 0)).slice(0, 5);
            return {
                totalSongs: songs.length,
                totalImports,
                mostImported
            };
        } catch (error) {
            console.error('Error getting Master Library stats:', error);
            return {
                totalSongs: 0,
                totalImports: 0,
                mostImported: []
            };
        }
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_lib_master-library-service_ts_3b654913._.js.map