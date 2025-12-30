(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/lib/zone-database-service.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ZoneDatabaseService",
    ()=>ZoneDatabaseService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase-database.ts [app-client] (ecmascript)");
;
const CATEGORIES_CACHE_TTL = 5 * 60 * 1000;
const categoriesCache = new Map();
const pageCategoriesCache = new Map();
function isCategoriesCacheValid(cache) {
    if (!cache) return false;
    return Date.now() - cache.timestamp < CATEGORIES_CACHE_TTL;
}
class ZoneDatabaseService {
    static async getPraiseNightsByZone(zoneId) {
        let limitCount = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 10;
        try {
            const allPraiseNights = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].getCollectionWhere('zone_praise_nights', 'zoneId', '==', zoneId);
            const sorted = allPraiseNights.sort((a, b)=>{
                const dateA = new Date(a.createdAt || 0).getTime();
                const dateB = new Date(b.createdAt || 0).getTime();
                return dateB - dateA;
            });
            return sorted.slice(0, limitCount);
        } catch (error) {
            console.error('Error getting praise nights by zone:', error);
            return [];
        }
    }
    static async getSongsByPraiseNight(praiseNightId) {
        try {
            const songs = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].getCollectionWhere('zone_songs', 'praiseNightId', '==', praiseNightId);
            return songs.sort((a, b)=>(a.orderIndex || 0) - (b.orderIndex || 0));
        } catch (error) {
            console.error('Error getting zone songs:', error);
            return [];
        }
    }
    static async getAllSongsByZone(zoneId) {
        try {
            return await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].getCollectionWhere('zone_songs', 'zoneId', '==', zoneId);
        } catch (error) {
            console.error('Error getting zone songs by zone:', error);
            return [];
        }
    }
    static async createPraiseNight(zoneId, data) {
        try {
            const { isHQGroup } = await __turbopack_context__.A("[project]/src/config/zones.ts [app-client] (ecmascript, async loader)");
            const now = new Date();
            const collection = isHQGroup(zoneId) ? 'praise_nights' : 'zone_praise_nights';
            const scope = isHQGroup(zoneId) ? 'hq' : 'zone';
            const praiseNightData = {
                ...data,
                zoneId,
                scope,
                createdAt: now,
                updatedAt: now
            };
            const result = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].addDocument(collection, praiseNightData);
            // Log activity
            if ("TURBOPACK compile-time truthy", 1) {
                window.dispatchEvent(new CustomEvent('showToast', {
                    detail: {
                        message: "Created page: ".concat(data.name),
                        type: 'success',
                        userName: localStorage.getItem('userName') || 'Admin',
                        action: 'created',
                        section: 'pages',
                        itemName: data.name
                    }
                }));
            }
            return {
                success: true,
                id: result.id,
                firebaseId: result.id
            };
        } catch (error) {
            console.error('Error creating praise night:', error);
            return {
                success: false
            };
        }
    }
    static async createSong(zoneId, praiseNightId, songData) {
        try {
            const data = {
                ...songData,
                zoneId,
                praiseNightId,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            const cleanData = Object.fromEntries(Object.entries(data).filter((param)=>{
                let [_, value] = param;
                return value !== undefined;
            }));
            const result = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].addDocument('zone_songs', cleanData);
            return {
                success: true,
                id: result.id,
                song: {
                    ...cleanData,
                    id: result.id
                }
            };
        } catch (error) {
            console.error('Error creating zone song:', error);
            return {
                success: false
            };
        }
    }
    static async updatePraiseNight(praiseNightId, data, zoneId) {
        try {
            const updateData = {
                ...data,
                updatedAt: new Date()
            };
            delete updateData.zoneId;
            if (zoneId) {
                const { isHQGroup } = await __turbopack_context__.A("[project]/src/config/zones.ts [app-client] (ecmascript, async loader)");
                if (isHQGroup(zoneId)) {
                    const result = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].updatePraiseNight(praiseNightId, updateData);
                    // Log activity
                    if ("object" !== 'undefined' && result.success) {
                        window.dispatchEvent(new CustomEvent('showToast', {
                            detail: {
                                message: "Updated page: ".concat(data.name || 'Page'),
                                type: 'success',
                                userName: localStorage.getItem('userName') || 'Admin',
                                action: 'updated',
                                section: 'pages',
                                itemName: data.name || 'Page'
                            }
                        }));
                    }
                    return result;
                }
            }
            const result = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].updateDocument('zone_praise_nights', praiseNightId, updateData);
            // Log activity
            if ("object" !== 'undefined' && result.success) {
                window.dispatchEvent(new CustomEvent('showToast', {
                    detail: {
                        message: "Updated page: ".concat(data.name || 'Page'),
                        type: 'success',
                        userName: localStorage.getItem('userName') || 'Admin',
                        action: 'updated',
                        section: 'pages',
                        itemName: data.name || 'Page'
                    }
                }));
            }
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
    static async updateSong(songId, data) {
        try {
            const updateData = {
                ...data,
                updatedAt: new Date()
            };
            delete updateData.zoneId;
            delete updateData.id;
            delete updateData.firebaseId;
            const cleanData = Object.fromEntries(Object.entries(updateData).filter((param)=>{
                let [_, value] = param;
                return value !== undefined;
            }));
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].updateDocument('zone_songs', songId, cleanData);
            return {
                success: true
            };
        } catch (error) {
            console.error('Error updating zone song:', error);
            return {
                success: false
            };
        }
    }
    static async deletePraiseNight(praiseNightId, zoneId) {
        try {
            let result;
            if (zoneId) {
                const { isHQGroup } = await __turbopack_context__.A("[project]/src/config/zones.ts [app-client] (ecmascript, async loader)");
                if (isHQGroup(zoneId)) {
                    result = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].deletePraiseNight(praiseNightId);
                }
            }
            if (!result) {
                result = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].deleteDocument('zone_praise_nights', praiseNightId);
            }
            // Log activity
            if ("object" !== 'undefined' && result.success) {
                window.dispatchEvent(new CustomEvent('showToast', {
                    detail: {
                        message: 'Deleted page',
                        type: 'success',
                        userName: localStorage.getItem('userName') || 'Admin',
                        action: 'deleted',
                        section: 'pages',
                        itemName: 'Page'
                    }
                }));
            }
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
    static async deleteSong(songId) {
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].deleteDocument('zone_songs', songId);
            return {
                success: true
            };
        } catch (error) {
            console.error('Error deleting zone song:', error);
            return {
                success: false
            };
        }
    }
    static async getCategoriesByZone(zoneId) {
        try {
            return await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].getCollectionWhere('zone_categories', 'zoneId', '==', zoneId);
        } catch (error) {
            console.error('Error getting zone categories:', error);
            return [];
        }
    }
    static async createCategory(zoneId, categoryData) {
        try {
            const { isHQGroup } = await __turbopack_context__.A("[project]/src/config/zones.ts [app-client] (ecmascript, async loader)");
            const collection = isHQGroup(zoneId) ? 'categories' : 'zone_categories';
            const data = {
                ...categoryData,
                ...isHQGroup(zoneId) ? {} : {
                    zoneId
                },
                createdAt: new Date(),
                updatedAt: new Date()
            };
            const result = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].addDocument(collection, data);
            this.invalidateCategoriesCache(zoneId);
            return {
                success: true,
                id: result.id,
                ...data
            };
        } catch (error) {
            console.error('Error creating category:', error);
            return {
                success: false
            };
        }
    }
    static async getPageCategoriesByZone(zoneId) {
        try {
            return await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].getCollectionWhere('zone_page_categories', 'zoneId', '==', zoneId);
        } catch (error) {
            console.error('Error getting zone page categories:', error);
            return [];
        }
    }
    static async createPageCategory(zoneId, data) {
        try {
            const { isHQGroup } = await __turbopack_context__.A("[project]/src/config/zones.ts [app-client] (ecmascript, async loader)");
            const collection = isHQGroup(zoneId) ? 'page_categories' : 'zone_page_categories';
            const categoryData = {
                ...data,
                ...isHQGroup(zoneId) ? {} : {
                    zoneId
                },
                createdAt: new Date(),
                updatedAt: new Date()
            };
            const result = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].addDocument(collection, categoryData);
            this.invalidatePageCategoriesCache(zoneId);
            return {
                success: true,
                id: result.id
            };
        } catch (error) {
            console.error('Error creating page category:', error);
            return {
                success: false
            };
        }
    }
    static async updatePageCategory(zoneId, pageCategoryId, data) {
        try {
            const { isHQGroup } = await __turbopack_context__.A("[project]/src/config/zones.ts [app-client] (ecmascript, async loader)");
            const collection = isHQGroup(zoneId) ? 'page_categories' : 'zone_page_categories';
            const updateData = {
                ...data,
                updatedAt: new Date()
            };
            delete updateData.zoneId;
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].updateDocument(collection, pageCategoryId, updateData);
            this.invalidatePageCategoriesCache(zoneId);
            return {
                success: true
            };
        } catch (error) {
            console.error('Error updating page category:', error);
            return {
                success: false
            };
        }
    }
    static async deletePageCategory(zoneId, pageCategoryId) {
        try {
            const { isHQGroup } = await __turbopack_context__.A("[project]/src/config/zones.ts [app-client] (ecmascript, async loader)");
            const collection = isHQGroup(zoneId) ? 'page_categories' : 'zone_page_categories';
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].deleteDocument(collection, pageCategoryId);
            this.invalidatePageCategoriesCache(zoneId);
            return {
                success: true
            };
        } catch (error) {
            console.error('Error deleting page category:', error);
            return {
                success: false
            };
        }
    }
    static async updateCategory(zoneId, categoryId, data) {
        try {
            const { isHQGroup } = await __turbopack_context__.A("[project]/src/config/zones.ts [app-client] (ecmascript, async loader)");
            const collection = isHQGroup(zoneId) ? 'categories' : 'zone_categories';
            const updateData = {
                ...data,
                updatedAt: new Date()
            };
            delete updateData.zoneId;
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].updateDocument(collection, categoryId, updateData);
            this.invalidateCategoriesCache(zoneId);
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
    static async deleteCategory(zoneId, categoryId) {
        try {
            const { isHQGroup } = await __turbopack_context__.A("[project]/src/config/zones.ts [app-client] (ecmascript, async loader)");
            const collection = isHQGroup(zoneId) ? 'categories' : 'zone_categories';
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].deleteDocument(collection, categoryId);
            this.invalidateCategoriesCache(zoneId);
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
    static async getSongHistory(songId) {
        try {
            const history = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].getCollectionWhere('zone_song_history', 'song_id', '==', songId);
            return history.sort((a, b)=>{
                const dateA = new Date(a.created_at || 0).getTime();
                const dateB = new Date(b.created_at || 0).getTime();
                return dateB - dateA;
            });
        } catch (error) {
            console.error('Error getting zone song history:', error);
            return [];
        }
    }
    static async createSongHistory(historyData) {
        try {
            const data = {
                ...historyData,
                created_at: new Date()
            };
            const result = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].addDocument('zone_song_history', data);
            return {
                success: true,
                id: result.id
            };
        } catch (error) {
            console.error('Error creating zone song history:', error);
            return {
                success: false
            };
        }
    }
    static async getCategories(zoneId) {
        const cacheKey = "categories_".concat(zoneId);
        const cached = categoriesCache.get(cacheKey);
        if (isCategoriesCacheValid(cached)) {
            return cached.data;
        }
        const { isHQGroup } = await __turbopack_context__.A("[project]/src/config/zones.ts [app-client] (ecmascript, async loader)");
        const categories = isHQGroup(zoneId) ? await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].getCollection('categories') : await this.getCategoriesByZone(zoneId);
        categoriesCache.set(cacheKey, {
            data: categories,
            timestamp: Date.now(),
            zoneId
        });
        return categories;
    }
    static async getPageCategories(zoneId) {
        const cacheKey = "page_categories_".concat(zoneId);
        const cached = pageCategoriesCache.get(cacheKey);
        if (isCategoriesCacheValid(cached)) {
            return cached.data;
        }
        const { isHQGroup } = await __turbopack_context__.A("[project]/src/config/zones.ts [app-client] (ecmascript, async loader)");
        const pageCategories = isHQGroup(zoneId) ? await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].getCollection('page_categories') : await this.getPageCategoriesByZone(zoneId);
        pageCategoriesCache.set(cacheKey, {
            data: pageCategories,
            timestamp: Date.now(),
            zoneId
        });
        return pageCategories;
    }
    static invalidateCategoriesCache(zoneId) {
        categoriesCache.delete("categories_".concat(zoneId));
    }
    static invalidatePageCategoriesCache(zoneId) {
        pageCategoriesCache.delete("page_categories_".concat(zoneId));
    }
    static async getMasterSongs() {
        let limit = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 100;
        try {
            const { MasterLibraryService } = await __turbopack_context__.A("[project]/src/lib/master-library-service.ts [app-client] (ecmascript, async loader)");
            return await MasterLibraryService.getMasterSongs(limit);
        } catch (error) {
            console.error('Error getting Master Library songs:', error);
            return [];
        }
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
    static async importFromMasterLibrary(zoneId, praiseNightId, masterSong, importedBy) {
        try {
            const existingSongs = await this.getSongsByPraiseNight(praiseNightId);
            const alreadyImported = existingSongs.some((s)=>s.importedFrom === 'master' && s.originalSongId === masterSong.id);
            if (alreadyImported) {
                return {
                    success: false,
                    error: 'This song has already been imported to this praise night'
                };
            }
            const maxOrderIndex = existingSongs.reduce((max, s)=>Math.max(max, s.orderIndex || 0), 0);
            const zoneSongData = {
                title: masterSong.title || '',
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
                orderIndex: maxOrderIndex + 1,
                importedFrom: 'master',
                originalSongId: masterSong.id,
                importedAt: new Date(),
                importedBy,
                status: 'unheard',
                createdAt: new Date(),
                updatedAt: new Date()
            };
            const cleanData = Object.fromEntries(Object.entries(zoneSongData).filter((param)=>{
                let [_, v] = param;
                return v !== undefined;
            }));
            const result = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].addDocument('zone_songs', cleanData);
            if (result.success && result.id) {
                await this.incrementMasterSongImportCount(masterSong.id);
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
            console.error('Error importing from Master Library:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    static async incrementMasterSongImportCount(masterSongId) {
        try {
            const masterSong = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].getDocument('master_songs', masterSongId);
            if (masterSong) {
                const newCount = (masterSong.importCount || 0) + 1;
                await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].updateDocument('master_songs', masterSongId, {
                    importCount: newCount
                });
            }
        } catch (error) {
            console.error('Error incrementing import count:', error);
        }
    }
    static async isImportedFromMaster(songId) {
        try {
            var _this;
            const song = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].getDocument('zone_songs', songId);
            return ((_this = song) === null || _this === void 0 ? void 0 : _this.importedFrom) === 'master';
        } catch (error) {
            console.error('Error checking import status:', error);
            return false;
        }
    }
    static async getImportedSongs(zoneId) {
        try {
            const allSongs = await this.getAllSongsByZone(zoneId);
            return allSongs.filter((song)=>song.importedFrom === 'master');
        } catch (error) {
            console.error('Error getting imported songs:', error);
            return [];
        }
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/praise-night-songs-service.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PraiseNightSongsService",
    ()=>PraiseNightSongsService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$firestore$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/firestore/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/firebase/node_modules/@firebase/firestore/dist/index.esm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase-setup.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/config/zones.ts [app-client] (ecmascript)");
;
;
;
function getCollectionName(zoneId) {
    return zoneId && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isHQGroup"])(zoneId) ? 'praise_night_songs' : 'zone_songs';
}
class PraiseNightSongsService {
    static async getSongsByPraiseNight(praiseNightId, zoneId) {
        try {
            const collectionName = getCollectionName(zoneId);
            const songsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], collectionName);
            let q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])(songsRef, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('praiseNightId', '==', praiseNightId));
            let snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
            // Try alternative field names for HQ groups
            if (snapshot.empty && zoneId && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isHQGroup"])(zoneId)) {
                q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])(songsRef, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('praisenightid', '==', praiseNightId));
                snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
                if (snapshot.empty) {
                    q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])(songsRef, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('praisenight_id', '==', praiseNightId));
                    snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
                }
                if (snapshot.empty) {
                    q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])(songsRef, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('pageId', '==', praiseNightId));
                    snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
                }
            }
            return snapshot.docs.map((doc)=>{
                var _data_createdAt_toDate, _data_createdAt_toDate1, _data_createdAt, _data_updatedAt_toDate, _data_updatedAt_toDate1, _data_updatedAt;
                const data = doc.data();
                return {
                    ...data,
                    id: doc.id,
                    createdAt: ((_data_createdAt = data.createdAt) === null || _data_createdAt === void 0 ? void 0 : (_data_createdAt_toDate1 = _data_createdAt.toDate) === null || _data_createdAt_toDate1 === void 0 ? void 0 : (_data_createdAt_toDate = _data_createdAt_toDate1.call(_data_createdAt)) === null || _data_createdAt_toDate === void 0 ? void 0 : _data_createdAt_toDate.toISOString()) || new Date().toISOString(),
                    updatedAt: ((_data_updatedAt = data.updatedAt) === null || _data_updatedAt === void 0 ? void 0 : (_data_updatedAt_toDate1 = _data_updatedAt.toDate) === null || _data_updatedAt_toDate1 === void 0 ? void 0 : (_data_updatedAt_toDate = _data_updatedAt_toDate1.call(_data_updatedAt)) === null || _data_updatedAt_toDate === void 0 ? void 0 : _data_updatedAt_toDate.toISOString()) || new Date().toISOString()
                };
            });
        } catch (error) {
            console.error('Error getting songs:', error);
            return [];
        }
    }
    static async getAllSongs(zoneId) {
        try {
            const collectionName = getCollectionName(zoneId);
            const songsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], collectionName);
            const q = zoneId && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isHQGroup"])(zoneId) ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])(songsRef, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('zoneId', '==', zoneId)) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])(songsRef);
            const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
            return snapshot.docs.map((doc)=>{
                var _data_createdAt_toDate, _data_createdAt_toDate1, _data_createdAt, _data_updatedAt_toDate, _data_updatedAt_toDate1, _data_updatedAt;
                const data = doc.data();
                return {
                    ...data,
                    id: doc.id,
                    createdAt: ((_data_createdAt = data.createdAt) === null || _data_createdAt === void 0 ? void 0 : (_data_createdAt_toDate1 = _data_createdAt.toDate) === null || _data_createdAt_toDate1 === void 0 ? void 0 : (_data_createdAt_toDate = _data_createdAt_toDate1.call(_data_createdAt)) === null || _data_createdAt_toDate === void 0 ? void 0 : _data_createdAt_toDate.toISOString()) || new Date().toISOString(),
                    updatedAt: ((_data_updatedAt = data.updatedAt) === null || _data_updatedAt === void 0 ? void 0 : (_data_updatedAt_toDate1 = _data_updatedAt.toDate) === null || _data_updatedAt_toDate1 === void 0 ? void 0 : (_data_updatedAt_toDate = _data_updatedAt_toDate1.call(_data_updatedAt)) === null || _data_updatedAt_toDate === void 0 ? void 0 : _data_updatedAt_toDate.toISOString()) || new Date().toISOString()
                };
            });
        } catch (error) {
            console.error('Error getting all songs:', error);
            return [];
        }
    }
    static async getSongById(songId, zoneId) {
        try {
            var _data_createdAt_toDate, _data_createdAt_toDate1, _data_createdAt, _data_updatedAt_toDate, _data_updatedAt_toDate1, _data_updatedAt;
            const collectionName = getCollectionName(zoneId);
            const songRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], collectionName, songId);
            const songDoc = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDoc"])(songRef);
            if (!songDoc.exists()) return null;
            const data = songDoc.data();
            return {
                ...data,
                id: songDoc.id,
                createdAt: ((_data_createdAt = data.createdAt) === null || _data_createdAt === void 0 ? void 0 : (_data_createdAt_toDate1 = _data_createdAt.toDate) === null || _data_createdAt_toDate1 === void 0 ? void 0 : (_data_createdAt_toDate = _data_createdAt_toDate1.call(_data_createdAt)) === null || _data_createdAt_toDate === void 0 ? void 0 : _data_createdAt_toDate.toISOString()) || new Date().toISOString(),
                updatedAt: ((_data_updatedAt = data.updatedAt) === null || _data_updatedAt === void 0 ? void 0 : (_data_updatedAt_toDate1 = _data_updatedAt.toDate) === null || _data_updatedAt_toDate1 === void 0 ? void 0 : (_data_updatedAt_toDate = _data_updatedAt_toDate1.call(_data_updatedAt)) === null || _data_updatedAt_toDate === void 0 ? void 0 : _data_updatedAt_toDate.toISOString()) || new Date().toISOString()
            };
        } catch (error) {
            console.error('Error getting song:', error);
            return null;
        }
    }
    static async createSong(songData, zoneId) {
        try {
            const collectionName = getCollectionName(zoneId);
            var _songData_rehearsalCount;
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
                categories: songData.categories || [],
                status: songData.status || 'unheard',
                praiseNightId: songData.praiseNightId || '',
                rehearsalCount: (_songData_rehearsalCount = songData.rehearsalCount) !== null && _songData_rehearsalCount !== void 0 ? _songData_rehearsalCount : 0,
                comments: songData.comments || [],
                history: songData.history || [],
                isActive: songData.isActive || false,
                mediaId: songData.mediaId || null,
                zoneId: zoneId || '',
                createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["serverTimestamp"])(),
                updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["serverTimestamp"])()
            };
            const songsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], collectionName);
            const docRef = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addDoc"])(songsRef, cleanData);
            return {
                success: true,
                id: docRef.id
            };
        } catch (error) {
            console.error('Error creating song:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create song'
            };
        }
    }
    static async updateSong(songId, songData, zoneId) {
        try {
            const collectionName = getCollectionName(zoneId);
            const songRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], collectionName, songId);
            const songDoc = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDoc"])(songRef);
            if (!songDoc.exists()) {
                return {
                    success: false,
                    error: 'Song not found'
                };
            }
            const { id, firebaseId, createdAt, zoneId: _, ...updateData } = songData;
            const cleanedData = Object.entries(updateData).reduce((acc, param)=>{
                let [key, value] = param;
                if (value !== undefined) acc[key] = value;
                return acc;
            }, {});
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateDoc"])(songRef, {
                ...cleanedData,
                updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["serverTimestamp"])()
            });
            return {
                success: true
            };
        } catch (error) {
            console.error('Error updating song:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update song'
            };
        }
    }
    static async deleteSong(songId, zoneId) {
        try {
            const collectionName = getCollectionName(zoneId);
            const songRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], collectionName, songId);
            const songDoc = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDoc"])(songRef);
            if (!songDoc.exists()) {
                return {
                    success: false,
                    error: 'Song not found'
                };
            }
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deleteDoc"])(songRef);
            return {
                success: true
            };
        } catch (error) {
            console.error('Error deleting song:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to delete song'
            };
        }
    }
    static async updateSongStatus(songId, status, zoneId) {
        try {
            const collectionName = getCollectionName(zoneId);
            const songRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], collectionName, songId);
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateDoc"])(songRef, {
                status,
                updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["serverTimestamp"])()
            });
            return {
                success: true
            };
        } catch (error) {
            console.error('Error updating status:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update status'
            };
        }
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/admin-activity-logger.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Admin Activity Logger - Tracks admin actions for accountability
__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "logAdminAction",
    ()=>logAdminAction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_define_property.js [app-client] (ecmascript)");
;
class AdminActivityLogger {
    static log(adminId, adminUsername, adminFullName, action, details, section) {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        const activity = {
            id: "activity-".concat(Date.now(), "-").concat(Math.random().toString(36).substr(2, 9)),
            adminId,
            adminUsername,
            adminFullName,
            action,
            details,
            section,
            timestamp: new Date().toISOString()
        };
        try {
            const logs = this.getLogs();
            logs.unshift(activity);
            if (logs.length > this.MAX_LOGS) logs.splice(this.MAX_LOGS);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logs));
        } catch (error) {
            console.error('Error logging admin activity:', error);
        }
    }
    // Get all activity logs
    static getLogs() {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error getting activity logs:', error);
            return [];
        }
    }
    static getLogsByAdmin(adminId) {
        return this.getLogs().filter((log)=>log.adminId === adminId);
    }
    static getLogsBySection(section) {
        return this.getLogs().filter((log)=>log.section === section);
    }
    static getLogsByDateRange(startDate, endDate) {
        return this.getLogs().filter((log)=>{
            const logDate = new Date(log.timestamp);
            return logDate >= startDate && logDate <= endDate;
        });
    }
    static getRecentLogs() {
        let count = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 50;
        return this.getLogs().slice(0, count);
    }
    static clearLogs() {
        if ("TURBOPACK compile-time truthy", 1) localStorage.removeItem(this.STORAGE_KEY);
    }
    static exportLogs() {
        return JSON.stringify(this.getLogs(), null, 2);
    }
    static getSummary() {
        const logs = this.getLogs();
        const adminActivities = {};
        const sectionActivities = {};
        logs.forEach((log)=>{
            adminActivities[log.adminId] = (adminActivities[log.adminId] || 0) + 1;
            sectionActivities[log.section] = (sectionActivities[log.section] || 0) + 1;
        });
        return {
            totalActivities: logs.length,
            adminActivities,
            sectionActivities,
            recentActivity: logs[0] || null
        };
    }
}
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(AdminActivityLogger, "STORAGE_KEY", 'admin_activity_log');
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(AdminActivityLogger, "MAX_LOGS", 1000);
const logAdminAction = {
    // Page actions
    createPage: (admin, pageName)=>{
        AdminActivityLogger.log(admin.id, admin.username, admin.fullName, 'CREATE_PAGE', "Created page: ".concat(pageName), 'Pages');
    },
    updatePage: (admin, pageName)=>{
        AdminActivityLogger.log(admin.id, admin.username, admin.fullName, 'UPDATE_PAGE', "Updated page: ".concat(pageName), 'Pages');
    },
    deletePage: (admin, pageName)=>{
        AdminActivityLogger.log(admin.id, admin.username, admin.fullName, 'DELETE_PAGE', "Deleted page: ".concat(pageName), 'Pages');
    },
    // Category actions
    createCategory: (admin, categoryName)=>{
        AdminActivityLogger.log(admin.id, admin.username, admin.fullName, 'CREATE_CATEGORY', "Created category: ".concat(categoryName), 'Categories');
    },
    updateCategory: (admin, categoryName)=>{
        AdminActivityLogger.log(admin.id, admin.username, admin.fullName, 'UPDATE_CATEGORY', "Updated category: ".concat(categoryName), 'Categories');
    },
    deleteCategory: (admin, categoryName)=>{
        AdminActivityLogger.log(admin.id, admin.username, admin.fullName, 'DELETE_CATEGORY', "Deleted category: ".concat(categoryName), 'Categories');
    },
    // Song actions
    addSong: (admin, songTitle, category)=>{
        AdminActivityLogger.log(admin.id, admin.username, admin.fullName, 'ADD_SONG', "Added song: ".concat(songTitle, " to ").concat(category), 'Songs');
    },
    updateSong: (admin, songTitle)=>{
        AdminActivityLogger.log(admin.id, admin.username, admin.fullName, 'UPDATE_SONG', "Updated song: ".concat(songTitle), 'Songs');
    },
    deleteSong: (admin, songTitle)=>{
        AdminActivityLogger.log(admin.id, admin.username, admin.fullName, 'DELETE_SONG', "Deleted song: ".concat(songTitle), 'Songs');
    },
    // Media actions
    uploadMedia: (admin, fileName)=>{
        AdminActivityLogger.log(admin.id, admin.username, admin.fullName, 'UPLOAD_MEDIA', "Uploaded media: ".concat(fileName), 'Media');
    },
    deleteMedia: (admin, fileName)=>{
        AdminActivityLogger.log(admin.id, admin.username, admin.fullName, 'DELETE_MEDIA', "Deleted media: ".concat(fileName), 'Media');
    },
    // User actions
    updateUser: (admin, userName)=>{
        AdminActivityLogger.log(admin.id, admin.username, admin.fullName, 'UPDATE_USER', "Updated user: ".concat(userName), 'Users');
    },
    deleteUser: (admin, userName)=>{
        AdminActivityLogger.log(admin.id, admin.username, admin.fullName, 'DELETE_USER', "Deleted user: ".concat(userName), 'Users');
    },
    // Support actions
    replySupport: (admin, messageId)=>{
        AdminActivityLogger.log(admin.id, admin.username, admin.fullName, 'REPLY_SUPPORT', "Replied to support message: ".concat(messageId), 'Support');
    },
    // Login/Logout
    login: (admin)=>{
        AdminActivityLogger.log(admin.id, admin.username, admin.fullName, 'LOGIN', "Logged in to admin panel", 'Authentication');
    },
    logout: (admin)=>{
        AdminActivityLogger.log(admin.id, admin.username, admin.fullName, 'LOGOUT', "Logged out from admin panel", 'Authentication');
    }
};
const __TURBOPACK__default__export__ = AdminActivityLogger;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/supabase-client.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Supabase Client for LoveWorld Singers App
__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "supabase",
    ()=>supabase
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/module/index.js [app-client] (ecmascript) <locals>");
;
const supabaseUrl = ("TURBOPACK compile-time value", "https://dumhphyhvnyyqnmnahno.supabase.co");
const supabaseKey = ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1bWhwaHlodm55eXFubW5haG5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5NjM0ODUsImV4cCI6MjA3MzUzOTQ4NX0.JlTOmEJyMGH3cBSeiO3LOuQdHLDdB57Vi3Hm8rGeDOI");
// Validate environment variables
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseKey);
const __TURBOPACK__default__export__ = supabase;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/cloudinary-storage.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Cloudinary Storage Service (25GB Storage + 25GB Bandwidth FREE)
__turbopack_context__.s([
    "cloudinaryConfig",
    ()=>cloudinaryConfig,
    "deleteAudioFromCloudinary",
    ()=>deleteAudioFromCloudinary,
    "deleteFromCloudinary",
    ()=>deleteFromCloudinary,
    "deleteImageFromCloudinary",
    ()=>deleteImageFromCloudinary,
    "getAudioStreamUrl",
    ()=>getAudioStreamUrl,
    "getFileType",
    ()=>getFileType,
    "getOptimizedImageUrl",
    ()=>getOptimizedImageUrl,
    "getThumbnailUrl",
    ()=>getThumbnailUrl,
    "getVideoStreamUrl",
    ()=>getVideoStreamUrl,
    "uploadAudioToCloudinary",
    ()=>uploadAudioToCloudinary,
    "uploadImageToCloudinary",
    ()=>uploadImageToCloudinary,
    "uploadToCloudinary",
    ()=>uploadToCloudinary
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
const cloudinaryConfig = {
    cloudName: ("TURBOPACK compile-time value", "dvtjjt3js") || '',
    apiKey: ("TURBOPACK compile-time value", "696485534226686") || '',
    uploadPreset: ("TURBOPACK compile-time value", "loveworld-singers") || 'loveworld-singers'
};
async function uploadToCloudinary(file, onProgress) {
    try {
        const fileType = file.type.split('/')[0];
        let resourceType = 'raw';
        if (fileType === 'image') resourceType = 'image';
        else if (fileType === 'video' || file.type.includes('audio')) resourceType = 'video';
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', cloudinaryConfig.uploadPreset);
        formData.append('resource_type', resourceType);
        const folder = getFolder(file.type);
        if ("TURBOPACK compile-time truthy", 1) formData.append('folder', folder);
        // Simulate progress for better UX
        let progressInterval = null;
        if (onProgress) {
            let progress = 0;
            progressInterval = setInterval(()=>{
                progress += Math.random() * 15;
                if (progress > 90) progress = 90;
                onProgress(Math.min(progress, 90));
            }, 200);
        }
        try {
            const response = await fetch("https://api.cloudinary.com/v1_1/".concat(cloudinaryConfig.cloudName, "/").concat(resourceType, "/upload"), {
                method: 'POST',
                body: formData
            });
            if (progressInterval) clearInterval(progressInterval);
            onProgress === null || onProgress === void 0 ? void 0 : onProgress(100);
            if (!response.ok) throw new Error("Upload failed: ".concat(response.statusText));
            const data = await response.json();
            return {
                url: data.secure_url,
                path: data.public_id,
                publicId: data.public_id,
                resourceType: data.resource_type
            };
        } catch (error) {
            if (progressInterval) clearInterval(progressInterval);
            throw error;
        }
    } catch (error) {
        // Cloudinary upload error
        return null;
    }
}
async function deleteFromCloudinary(publicId) {
    let resourceType = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 'image';
    try {
        const response = await fetch('/api/cloudinary/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                publicId,
                resourceType
            })
        });
        if (!response.ok) throw new Error("Delete failed: ".concat(response.statusText));
        return true;
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        return false;
    }
}
function getOptimizedImageUrl(url) {
    let width = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 800, quality = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 80;
    if (!(url === null || url === void 0 ? void 0 : url.includes('cloudinary'))) return url;
    const parts = url.split('/upload/');
    return parts.length === 2 ? "".concat(parts[0], "/upload/w_").concat(width, ",q_").concat(quality, ",f_auto/").concat(parts[1]) : url;
}
function getAudioStreamUrl(url) {
    if (!(url === null || url === void 0 ? void 0 : url.includes('cloudinary'))) return url;
    const parts = url.split('/upload/');
    return parts.length === 2 ? "".concat(parts[0], "/upload/q_auto,fl_streaming_attachment/").concat(parts[1]) : url;
}
function getVideoStreamUrl(url) {
    let quality = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 'auto';
    if (!(url === null || url === void 0 ? void 0 : url.includes('cloudinary'))) return url;
    const parts = url.split('/upload/');
    return parts.length === 2 ? "".concat(parts[0], "/upload/q_").concat(quality, ",f_auto/").concat(parts[1]) : url;
}
function getThumbnailUrl(url) {
    let width = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 300;
    if (!(url === null || url === void 0 ? void 0 : url.includes('cloudinary'))) return url;
    const parts = url.split('/upload/');
    return parts.length === 2 ? "".concat(parts[0], "/upload/w_").concat(width, ",h_").concat(width, ",c_fill,f_jpg/").concat(parts[1].replace(/\.[^.]+$/, '.jpg')) : url;
}
// Helper functions
function getFolder(mimeType) {
    if (mimeType.startsWith('image/')) return 'loveworld-singers/images';
    if (mimeType.startsWith('audio/')) return 'loveworld-singers/audio';
    if (mimeType.startsWith('video/')) return 'loveworld-singers/videos';
    return 'loveworld-singers/documents';
}
function getFileType(mimeType) {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('video/')) return 'video';
    return 'document';
}
async function uploadAudioToCloudinary(file, onProgress) {
    const result = await uploadToCloudinary(file, onProgress);
    return result ? {
        url: result.url,
        path: result.publicId
    } : null;
}
async function uploadImageToCloudinary(file, onProgress) {
    const result = await uploadToCloudinary(file, onProgress);
    return result ? {
        url: result.url,
        path: result.publicId
    } : null;
}
const deleteAudioFromCloudinary = (publicId)=>deleteFromCloudinary(publicId, 'video');
const deleteImageFromCloudinary = (publicId)=>deleteFromCloudinary(publicId, 'image');
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/cloudinary-media-service.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearCloudinaryMediaCache",
    ()=>clearCloudinaryMediaCache,
    "createCloudinaryMedia",
    ()=>createCloudinaryMedia,
    "deleteCloudinaryMedia",
    ()=>deleteCloudinaryMedia,
    "getAllCloudinaryMedia",
    ()=>getAllCloudinaryMedia,
    "getCloudinaryMediaByFolder",
    ()=>getCloudinaryMediaByFolder,
    "getCloudinaryMediaById",
    ()=>getCloudinaryMediaById,
    "getCloudinaryMediaByType",
    ()=>getCloudinaryMediaByType,
    "getCloudinaryMediaStats",
    ()=>getCloudinaryMediaStats,
    "hasMoreCloudinaryMedia",
    ()=>hasMoreCloudinaryMedia,
    "hasMoreCloudinaryMediaByType",
    ()=>hasMoreCloudinaryMediaByType,
    "loadMoreCloudinaryMedia",
    ()=>loadMoreCloudinaryMedia,
    "loadMoreCloudinaryMediaByType",
    ()=>loadMoreCloudinaryMediaByType,
    "searchCloudinaryMedia",
    ()=>searchCloudinaryMedia,
    "updateCloudinaryMedia",
    ()=>updateCloudinaryMedia,
    "uploadToCloudinary",
    ()=>uploadToCloudinary
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$firestore$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/firestore/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/firebase/node_modules/@firebase/firestore/dist/index.esm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase-setup.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/config/zones.ts [app-client] (ecmascript)");
;
;
;
const mediaCache = new Map();
const MEDIA_CACHE_TTL = 5 * 60 * 1000;
function getCollectionName(zoneId) {
    return zoneId && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isHQGroup"])(zoneId) ? 'cloudinary_media' : 'zone_cloudinary_media';
}
async function uploadToCloudinary(file) {
    let options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    try {
        const cloudName = ("TURBOPACK compile-time value", "dvtjjt3js");
        const uploadPreset = ("TURBOPACK compile-time value", "loveworld-singers");
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
        if (options.folder) formData.append('folder', options.folder);
        if (options.publicId) formData.append('public_id', options.publicId);
        const resourceType = options.resourceType || 'auto';
        const uploadUrl = "https://api.cloudinary.com/v1_1/".concat(cloudName, "/").concat(resourceType, "/upload");
        const response = await fetch(uploadUrl, {
            method: 'POST',
            body: formData
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error('[Cloudinary] Upload failed:', errorText);
            return {
                success: false,
                error: "Upload failed: ".concat(response.status)
            };
        }
        const data = await response.json();
        return {
            success: true,
            url: data.secure_url,
            publicId: data.public_id
        };
    } catch (error) {
        console.error('[Cloudinary] Upload error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Upload failed'
        };
    }
}
function mapDocToFile(doc) {
    var _data_createdAt_toDate, _data_createdAt_toDate1, _data_createdAt, _data_updatedAt_toDate, _data_updatedAt_toDate1, _data_updatedAt;
    const data = doc.data();
    return {
        ...data,
        id: doc.id,
        createdAt: ((_data_createdAt = data.createdAt) === null || _data_createdAt === void 0 ? void 0 : (_data_createdAt_toDate1 = _data_createdAt.toDate) === null || _data_createdAt_toDate1 === void 0 ? void 0 : (_data_createdAt_toDate = _data_createdAt_toDate1.call(_data_createdAt)) === null || _data_createdAt_toDate === void 0 ? void 0 : _data_createdAt_toDate.toISOString()) || new Date().toISOString(),
        updatedAt: ((_data_updatedAt = data.updatedAt) === null || _data_updatedAt === void 0 ? void 0 : (_data_updatedAt_toDate1 = _data_updatedAt.toDate) === null || _data_updatedAt_toDate1 === void 0 ? void 0 : (_data_updatedAt_toDate = _data_updatedAt_toDate1.call(_data_updatedAt)) === null || _data_updatedAt_toDate === void 0 ? void 0 : _data_updatedAt_toDate.toISOString()) || new Date().toISOString()
    };
}
async function getAllCloudinaryMedia(zoneId) {
    let limitCount = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 100, forceRefresh = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
    try {
        const cacheKey = zoneId || 'global';
        const cached = mediaCache.get(cacheKey);
        if (!forceRefresh && cached && Date.now() - cached.timestamp < MEDIA_CACHE_TTL) {
            return cached.data;
        }
        const collectionName = getCollectionName(zoneId);
        const mediaRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], collectionName);
        const q = zoneId && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isHQGroup"])(zoneId) ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])(mediaRef, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('zoneId', '==', zoneId), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["orderBy"])('createdAt', 'desc'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["limit"])(limitCount)) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])(mediaRef, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["orderBy"])('createdAt', 'desc'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["limit"])(limitCount));
        const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
        const files = snapshot.docs.map(mapDocToFile);
        files.sort((a, b)=>new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const lastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
        mediaCache.set(cacheKey, {
            data: files,
            timestamp: Date.now(),
            lastDoc
        });
        return files;
    } catch (error) {
        console.error('Error getting media files:', error);
        return [];
    }
}
async function loadMoreCloudinaryMedia(zoneId) {
    let limitCount = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 50;
    try {
        const cacheKey = zoneId || 'global';
        const cached = mediaCache.get(cacheKey);
        if (!(cached === null || cached === void 0 ? void 0 : cached.lastDoc)) return [];
        const collectionName = getCollectionName(zoneId);
        const mediaRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], collectionName);
        const q = zoneId && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isHQGroup"])(zoneId) ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])(mediaRef, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('zoneId', '==', zoneId), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["orderBy"])('createdAt', 'desc'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["startAfter"])(cached.lastDoc), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["limit"])(limitCount)) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])(mediaRef, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["orderBy"])('createdAt', 'desc'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["startAfter"])(cached.lastDoc), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["limit"])(limitCount));
        const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
        const files = snapshot.docs.map(mapDocToFile);
        files.sort((a, b)=>new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const lastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
        mediaCache.set(cacheKey, {
            data: [
                ...cached.data,
                ...files
            ],
            timestamp: Date.now(),
            lastDoc
        });
        return files;
    } catch (error) {
        console.error('Error loading more media files:', error);
        return [];
    }
}
function hasMoreCloudinaryMedia(zoneId) {
    const cacheKey = zoneId || 'global';
    const cached = mediaCache.get(cacheKey);
    return (cached === null || cached === void 0 ? void 0 : cached.lastDoc) !== null && (cached === null || cached === void 0 ? void 0 : cached.lastDoc) !== undefined;
}
function clearCloudinaryMediaCache(zoneId) {
    if (zoneId) {
        mediaCache.delete(zoneId);
        mediaCache.delete('global');
    } else {
        mediaCache.clear();
    }
}
// Cache for type-specific queries
const typeMediaCache = new Map();
async function getCloudinaryMediaByType(type, zoneId) {
    let limitCount = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 50, forceRefresh = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : false;
    try {
        const cacheKey = "".concat(zoneId || 'global', "_").concat(type);
        const cached = typeMediaCache.get(cacheKey);
        if (!forceRefresh && cached && Date.now() - cached.timestamp < MEDIA_CACHE_TTL) {
            return cached.data;
        }
        const collectionName = getCollectionName(zoneId);
        const mediaRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], collectionName);
        const q = zoneId && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isHQGroup"])(zoneId) ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])(mediaRef, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('zoneId', '==', zoneId), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('type', '==', type), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["orderBy"])('createdAt', 'desc'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["limit"])(limitCount)) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])(mediaRef, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('type', '==', type), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["orderBy"])('createdAt', 'desc'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["limit"])(limitCount));
        const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
        const files = snapshot.docs.map(mapDocToFile);
        const lastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
        typeMediaCache.set(cacheKey, {
            data: files,
            timestamp: Date.now(),
            lastDoc
        });
        return files;
    } catch (error) {
        console.error("Error getting ".concat(type, " files:"), error);
        return [];
    }
}
async function loadMoreCloudinaryMediaByType(type, zoneId) {
    let limitCount = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 50;
    try {
        const cacheKey = "".concat(zoneId || 'global', "_").concat(type);
        const cached = typeMediaCache.get(cacheKey);
        if (!(cached === null || cached === void 0 ? void 0 : cached.lastDoc)) return [];
        const collectionName = getCollectionName(zoneId);
        const mediaRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], collectionName);
        const q = zoneId && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isHQGroup"])(zoneId) ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])(mediaRef, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('zoneId', '==', zoneId), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('type', '==', type), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["orderBy"])('createdAt', 'desc'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["startAfter"])(cached.lastDoc), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["limit"])(limitCount)) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])(mediaRef, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('type', '==', type), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["orderBy"])('createdAt', 'desc'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["startAfter"])(cached.lastDoc), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["limit"])(limitCount));
        const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
        const files = snapshot.docs.map(mapDocToFile);
        const lastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
        typeMediaCache.set(cacheKey, {
            data: [
                ...cached.data,
                ...files
            ],
            timestamp: Date.now(),
            lastDoc
        });
        return files;
    } catch (error) {
        console.error("Error loading more ".concat(type, " files:"), error);
        return [];
    }
}
function hasMoreCloudinaryMediaByType(type, zoneId) {
    const cacheKey = "".concat(zoneId || 'global', "_").concat(type);
    const cached = typeMediaCache.get(cacheKey);
    return (cached === null || cached === void 0 ? void 0 : cached.lastDoc) !== null && (cached === null || cached === void 0 ? void 0 : cached.lastDoc) !== undefined;
}
async function getCloudinaryMediaByFolder(folder, zoneId) {
    try {
        const collectionName = getCollectionName(zoneId);
        const mediaRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], collectionName);
        const q = zoneId && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isHQGroup"])(zoneId) ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])(mediaRef, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('zoneId', '==', zoneId), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('folder', '==', folder)) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])(mediaRef, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('folder', '==', folder));
        const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
        const files = snapshot.docs.map(mapDocToFile);
        files.sort((a, b)=>new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return files;
    } catch (error) {
        console.error('Error getting files from folder:', error);
        return [];
    }
}
async function getCloudinaryMediaById(id, zoneId) {
    try {
        const collectionName = getCollectionName(zoneId);
        const mediaRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], collectionName, id);
        const mediaDoc = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDoc"])(mediaRef);
        if (!mediaDoc.exists()) return null;
        return mapDocToFile(mediaDoc);
    } catch (error) {
        console.error('Error getting media file:', error);
        return null;
    }
}
async function createCloudinaryMedia(fileData, zoneId) {
    try {
        const collectionName = getCollectionName(zoneId);
        const cleanData = {
            name: fileData.name,
            url: fileData.url,
            publicId: fileData.publicId,
            resourceType: fileData.resourceType,
            type: fileData.type,
            size: fileData.size,
            folder: fileData.folder,
            format: fileData.format || '',
            width: fileData.width || 0,
            height: fileData.height || 0,
            duration: fileData.duration || 0,
            zoneId: zoneId || '',
            createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["serverTimestamp"])(),
            updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["serverTimestamp"])()
        };
        const mediaRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], collectionName);
        const docRef = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addDoc"])(mediaRef, cleanData);
        clearCloudinaryMediaCache(zoneId);
        return {
            success: true,
            id: docRef.id
        };
    } catch (error) {
        console.error('Error creating media file:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to create media file'
        };
    }
}
async function updateCloudinaryMedia(id, fileData, zoneId) {
    try {
        const collectionName = getCollectionName(zoneId);
        const mediaRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], collectionName, id);
        const mediaDoc = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDoc"])(mediaRef);
        if (!mediaDoc.exists()) {
            return {
                success: false,
                error: 'Media file not found'
            };
        }
        const cleanedData = Object.entries(fileData).reduce((acc, param)=>{
            let [key, value] = param;
            if (value !== undefined) acc[key] = value;
            return acc;
        }, {});
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateDoc"])(mediaRef, {
            ...cleanedData,
            updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["serverTimestamp"])()
        });
        return {
            success: true
        };
    } catch (error) {
        console.error('Error updating media file:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to update media file'
        };
    }
}
async function deleteCloudinaryMedia(id, zoneId) {
    try {
        const collectionName = getCollectionName(zoneId);
        const mediaRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], collectionName, id);
        const mediaDoc = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDoc"])(mediaRef);
        if (!mediaDoc.exists()) {
            return {
                success: false,
                error: 'Media file not found'
            };
        }
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deleteDoc"])(mediaRef);
        clearCloudinaryMediaCache(zoneId);
        return {
            success: true
        };
    } catch (error) {
        console.error('Error deleting media file:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to delete media file'
        };
    }
}
async function searchCloudinaryMedia(searchTerm, zoneId) {
    try {
        const allFiles = await getAllCloudinaryMedia(zoneId);
        const searchLower = searchTerm.toLowerCase();
        return allFiles.filter((file)=>file.name.toLowerCase().includes(searchLower));
    } catch (error) {
        console.error('Error searching media files:', error);
        return [];
    }
}
async function getCloudinaryMediaStats(zoneId) {
    try {
        const allFiles = await getAllCloudinaryMedia(zoneId);
        const stats = {
            totalFiles: allFiles.length,
            totalSize: allFiles.reduce((sum, file)=>sum + file.size, 0),
            byType: {},
            byFolder: {}
        };
        allFiles.forEach((file)=>{
            stats.byType[file.type] = (stats.byType[file.type] || 0) + 1;
            stats.byFolder[file.folder] = (stats.byFolder[file.folder] || 0) + 1;
        });
        return stats;
    } catch (error) {
        console.error('Error getting statistics:', error);
        return {
            totalFiles: 0,
            totalSize: 0,
            byType: {},
            byFolder: {}
        };
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/media-videos-service.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "mediaVideosService",
    ()=>mediaVideosService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$firestore$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/firestore/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/firebase/node_modules/@firebase/firestore/dist/index.esm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase-setup.ts [app-client] (ecmascript)");
;
;
const COLLECTION = 'media_videos';
class MediaVideosService {
    async create(data) {
        const docRef = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], COLLECTION), {
            ...data,
            views: 0,
            likes: 0,
            createdAt: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Timestamp"].now(),
            updatedAt: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Timestamp"].now()
        });
        return docRef.id;
    }
    async getAll() {
        let limitCount = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 24;
        const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], COLLECTION), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["orderBy"])('createdAt', 'desc'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["limit"])(limitCount));
        const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
        return this.mapDocs(snapshot.docs);
    }
    async loadMore(lastCreatedAt) {
        let limitCount = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 12;
        const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], COLLECTION), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["orderBy"])('createdAt', 'desc'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["startAfter"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Timestamp"].fromDate(lastCreatedAt)), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["limit"])(limitCount));
        const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
        return this.mapDocs(snapshot.docs);
    }
    async getById(id) {
        const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], COLLECTION, id);
        const docSnap = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDoc"])(docRef);
        if (!docSnap.exists()) return null;
        return this.mapDoc(docSnap);
    }
    async getByType(type) {
        const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], COLLECTION), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('type', '==', type), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["orderBy"])('createdAt', 'desc'));
        const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
        return this.mapDocs(snapshot.docs);
    }
    async getFeatured() {
        const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], COLLECTION), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('featured', '==', true), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["orderBy"])('views', 'desc'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["limit"])(10));
        const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
        return this.mapDocs(snapshot.docs);
    }
    async getForHQ() {
        let limitCount = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 24;
        const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], COLLECTION), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('forHQ', '==', true), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["orderBy"])('createdAt', 'desc'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["limit"])(limitCount));
        const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
        return this.mapDocs(snapshot.docs);
    }
    async getForRegularZones() {
        let limitCount = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 24;
        const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], COLLECTION), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('forHQ', '==', false), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["orderBy"])('createdAt', 'desc'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["limit"])(limitCount));
        const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
        return this.mapDocs(snapshot.docs);
    }
    async getForZoneType(isHQZone) {
        let limitCount = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 24;
        return isHQZone ? this.getForHQ(limitCount) : this.getForRegularZones(limitCount);
    }
    async update(id, data) {
        const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], COLLECTION, id);
        const cleanData = {};
        for (const [key, value] of Object.entries(data)){
            if (value !== undefined) {
                cleanData[key] = value;
            }
        }
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateDoc"])(docRef, {
            ...cleanData,
            updatedAt: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Timestamp"].now()
        });
    }
    async delete(id) {
        const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], COLLECTION, id);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deleteDoc"])(docRef);
    }
    async incrementViews(id) {
        const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], COLLECTION, id);
        const docSnap = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDoc"])(docRef);
        if (docSnap.exists()) {
            const currentViews = docSnap.data().views || 0;
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateDoc"])(docRef, {
                views: currentViews + 1
            });
        }
    }
    async incrementLikes(id) {
        const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], COLLECTION, id);
        const docSnap = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDoc"])(docRef);
        if (docSnap.exists()) {
            const currentLikes = docSnap.data().likes || 0;
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateDoc"])(docRef, {
                likes: currentLikes + 1
            });
        }
    }
    async search(searchTerm) {
        const all = await this.getAll(100);
        const term = searchTerm.toLowerCase();
        return all.filter((v)=>{
            var _v_description;
            return v.title.toLowerCase().includes(term) || ((_v_description = v.description) === null || _v_description === void 0 ? void 0 : _v_description.toLowerCase().includes(term));
        });
    }
    mapDocs(docs) {
        return docs.map((doc)=>this.mapDoc(doc));
    }
    mapDoc(doc) {
        var _data_createdAt_toDate, _data_createdAt, _data_updatedAt_toDate, _data_updatedAt;
        const data = doc.data();
        return {
            id: doc.id,
            title: data.title || '',
            description: data.description || '',
            thumbnail: data.thumbnail || '',
            videoUrl: data.videoUrl,
            youtubeUrl: data.youtubeUrl,
            isYouTube: data.isYouTube || false,
            type: data.type || 'other',
            duration: data.duration,
            releaseYear: data.releaseYear,
            featured: data.featured || false,
            forHQ: data.forHQ !== false,
            hidden: data.hidden || false,
            views: data.views || 0,
            likes: data.likes || 0,
            createdAt: ((_data_createdAt = data.createdAt) === null || _data_createdAt === void 0 ? void 0 : (_data_createdAt_toDate = _data_createdAt.toDate) === null || _data_createdAt_toDate === void 0 ? void 0 : _data_createdAt_toDate.call(_data_createdAt)) || new Date(),
            updatedAt: ((_data_updatedAt = data.updatedAt) === null || _data_updatedAt === void 0 ? void 0 : (_data_updatedAt_toDate = _data_updatedAt.toDate) === null || _data_updatedAt_toDate === void 0 ? void 0 : _data_updatedAt_toDate.call(_data_updatedAt)) || new Date(),
            createdBy: data.createdBy,
            createdByName: data.createdByName
        };
    }
}
const mediaVideosService = new MediaVideosService();
const __TURBOPACK__default__export__ = mediaVideosService;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/media-category-service.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEFAULT_CATEGORIES",
    ()=>DEFAULT_CATEGORIES,
    "createCategory",
    ()=>createCategory,
    "deleteCategory",
    ()=>deleteCategory,
    "getCategories",
    ()=>getCategories,
    "initializeDefaultCategories",
    ()=>initializeDefaultCategories,
    "updateCategory",
    ()=>updateCategory
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$firestore$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/firestore/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/firebase/node_modules/@firebase/firestore/dist/index.esm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase-setup.ts [app-client] (ecmascript)");
'use client';
;
;
const COLLECTION = 'media_categories';
const DEFAULT_CATEGORIES = [
    {
        name: 'Praise',
        slug: 'praise',
        order: 1
    },
    {
        name: 'Worship',
        slug: 'worship',
        order: 2
    },
    {
        name: 'Medley',
        slug: 'medley',
        order: 3
    },
    {
        name: 'Healing',
        slug: 'healing',
        order: 4
    },
    {
        name: 'GFAP',
        slug: 'gfap',
        order: 5
    },
    {
        name: 'Live',
        slug: 'live',
        order: 6
    },
    {
        name: 'Other',
        slug: 'other',
        order: 99
    }
];
async function getCategories() {
    try {
        const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], COLLECTION), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["orderBy"])('order', 'asc'));
        const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
        if (snapshot.empty) {
            await initializeDefaultCategories();
            return getCategories();
        }
        return snapshot.docs.map((doc)=>{
            var _this, _this1;
            return {
                id: doc.id,
                ...doc.data(),
                createdAt: ((_this = doc.data().createdAt) === null || _this === void 0 ? void 0 : _this.toDate()) || new Date(),
                updatedAt: ((_this1 = doc.data().updatedAt) === null || _this1 === void 0 ? void 0 : _this1.toDate()) || new Date()
            };
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        return DEFAULT_CATEGORIES.map((cat)=>({
                ...cat,
                id: cat.slug,
                createdAt: new Date(),
                updatedAt: new Date()
            }));
    }
}
async function initializeDefaultCategories() {
    try {
        for (const cat of DEFAULT_CATEGORIES){
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], COLLECTION), {
                ...cat,
                createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["serverTimestamp"])(),
                updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["serverTimestamp"])()
            });
        }
    } catch (error) {
        console.error('Error initializing categories:', error);
    }
}
async function createCategory(name, description) {
    try {
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const categories = await getCategories();
        const maxOrder = Math.max(...categories.map((c)=>c.order), 0);
        const docRef = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], COLLECTION), {
            name,
            slug,
            description: description || '',
            order: maxOrder + 1,
            createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["serverTimestamp"])(),
            updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["serverTimestamp"])()
        });
        return docRef.id;
    } catch (error) {
        console.error('Error creating category:', error);
        throw error;
    }
}
async function updateCategory(categoryId, data) {
    try {
        var _currentDoc_data;
        const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], COLLECTION, categoryId);
        const currentDoc = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDoc"])(docRef);
        const currentSlug = (_currentDoc_data = currentDoc.data()) === null || _currentDoc_data === void 0 ? void 0 : _currentDoc_data.slug;
        const updateData = {
            ...data,
            updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["serverTimestamp"])()
        };
        let newSlug = null;
        if (data.name) {
            newSlug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            updateData.slug = newSlug;
        }
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateDoc"])(docRef, updateData);
        if (newSlug && currentSlug && newSlug !== currentSlug) {
            await updateVideosCategory(currentSlug, newSlug);
        }
    } catch (error) {
        console.error('Error updating category:', error);
        throw error;
    }
}
async function updateVideosCategory(oldSlug, newSlug) {
    try {
        const videosRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'media_videos');
        const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])(videosRef, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('type', '==', oldSlug));
        const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
        if (snapshot.empty) return 0;
        const batchSize = 500;
        let updatedCount = 0;
        for(let i = 0; i < snapshot.docs.length; i += batchSize){
            const batch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["writeBatch"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"]);
            const chunk = snapshot.docs.slice(i, i + batchSize);
            chunk.forEach((docSnap)=>{
                batch.update(docSnap.ref, {
                    type: newSlug,
                    updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["serverTimestamp"])()
                });
            });
            await batch.commit();
            updatedCount += chunk.length;
        }
        return updatedCount;
    } catch (error) {
        console.error('Error updating videos category:', error);
        throw error;
    }
}
async function deleteCategory(categoryId) {
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deleteDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], COLLECTION, categoryId));
    } catch (error) {
        console.error('Error deleting category:', error);
        throw error;
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/admin-playlist-service.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addChildPlaylist",
    ()=>addChildPlaylist,
    "addVideoToPlaylist",
    ()=>addVideoToPlaylist,
    "createAdminPlaylist",
    ()=>createAdminPlaylist,
    "deleteAdminPlaylist",
    ()=>deleteAdminPlaylist,
    "getAddableChildPlaylists",
    ()=>getAddableChildPlaylists,
    "getAdminPlaylist",
    ()=>getAdminPlaylist,
    "getAdminPlaylists",
    ()=>getAdminPlaylists,
    "getFeaturedPlaylists",
    ()=>getFeaturedPlaylists,
    "getPublicAdminPlaylists",
    ()=>getPublicAdminPlaylists,
    "removeChildPlaylist",
    ()=>removeChildPlaylist,
    "removeVideoFromPlaylist",
    ()=>removeVideoFromPlaylist,
    "reorderPlaylistVideos",
    ()=>reorderPlaylistVideos,
    "updateAdminPlaylist",
    ()=>updateAdminPlaylist
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase-setup.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$firestore$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/firestore/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/firebase/node_modules/@firebase/firestore/dist/index.esm.js [app-client] (ecmascript)");
'use client';
;
;
const COLLECTION = 'admin_playlists';
async function getAdminPlaylists() {
    try {
        const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], COLLECTION), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["orderBy"])('createdAt', 'desc'));
        const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
        return snapshot.docs.map((doc)=>{
            var _this, _this1;
            return {
                id: doc.id,
                ...doc.data(),
                createdAt: ((_this = doc.data().createdAt) === null || _this === void 0 ? void 0 : _this.toDate()) || new Date(),
                updatedAt: ((_this1 = doc.data().updatedAt) === null || _this1 === void 0 ? void 0 : _this1.toDate()) || new Date()
            };
        });
    } catch (error) {
        console.error('Error fetching admin playlists:', error);
        return [];
    }
}
async function getPublicAdminPlaylists(isHQZone, categoryType) {
    try {
        const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], COLLECTION), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('isPublic', '==', true), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["orderBy"])('createdAt', 'desc'));
        const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
        let allPlaylists = snapshot.docs.map((doc)=>{
            var _this, _this1;
            return {
                id: doc.id,
                ...doc.data(),
                createdAt: ((_this = doc.data().createdAt) === null || _this === void 0 ? void 0 : _this.toDate()) || new Date(),
                updatedAt: ((_this1 = doc.data().updatedAt) === null || _this1 === void 0 ? void 0 : _this1.toDate()) || new Date()
            };
        });
        // Collect nested playlist IDs
        const nestedPlaylistIds = new Set();
        allPlaylists.forEach((p)=>{
            var _p_childPlaylistIds;
            (_p_childPlaylistIds = p.childPlaylistIds) === null || _p_childPlaylistIds === void 0 ? void 0 : _p_childPlaylistIds.forEach((childId)=>nestedPlaylistIds.add(childId));
        });
        // Filter by zone and exclude nested
        let filtered = allPlaylists.filter((p)=>p.forHQ === isHQZone && !nestedPlaylistIds.has(p.id));
        if (categoryType && categoryType !== 'all') {
            filtered = filtered.filter((p)=>p.type === categoryType);
        }
        return filtered;
    } catch (error) {
        console.error('Error fetching public playlists:', error);
        // Fallback: get all and filter
        try {
            const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], COLLECTION), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["orderBy"])('createdAt', 'desc'));
            const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
            let all = snapshot.docs.map((doc)=>{
                var _this, _this1;
                return {
                    id: doc.id,
                    ...doc.data(),
                    createdAt: ((_this = doc.data().createdAt) === null || _this === void 0 ? void 0 : _this.toDate()) || new Date(),
                    updatedAt: ((_this1 = doc.data().updatedAt) === null || _this1 === void 0 ? void 0 : _this1.toDate()) || new Date()
                };
            });
            const nestedPlaylistIds = new Set();
            all.forEach((p)=>{
                var _p_childPlaylistIds;
                (_p_childPlaylistIds = p.childPlaylistIds) === null || _p_childPlaylistIds === void 0 ? void 0 : _p_childPlaylistIds.forEach((childId)=>nestedPlaylistIds.add(childId));
            });
            let filtered = all.filter((p)=>p.isPublic && p.forHQ === isHQZone && !nestedPlaylistIds.has(p.id));
            if (categoryType && categoryType !== 'all') {
                filtered = filtered.filter((p)=>p.type === categoryType);
            }
            return filtered;
        } catch (e) {
            return [];
        }
    }
}
async function getFeaturedPlaylists(isHQZone) {
    try {
        const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], COLLECTION), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('isFeatured', '==', true), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('forHQ', '==', isHQZone), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["orderBy"])('createdAt', 'desc'));
        const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
        return snapshot.docs.map((doc)=>{
            var _this, _this1;
            return {
                id: doc.id,
                ...doc.data(),
                createdAt: ((_this = doc.data().createdAt) === null || _this === void 0 ? void 0 : _this.toDate()) || new Date(),
                updatedAt: ((_this1 = doc.data().updatedAt) === null || _this1 === void 0 ? void 0 : _this1.toDate()) || new Date()
            };
        });
    } catch (error) {
        console.error('Error fetching featured playlists:', error);
        return [];
    }
}
async function getAdminPlaylist(id) {
    try {
        var _this, _this1;
        const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], COLLECTION, id);
        const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDoc"])(docRef);
        if (!snapshot.exists()) return null;
        return {
            id: snapshot.id,
            ...snapshot.data(),
            createdAt: ((_this = snapshot.data().createdAt) === null || _this === void 0 ? void 0 : _this.toDate()) || new Date(),
            updatedAt: ((_this1 = snapshot.data().updatedAt) === null || _this1 === void 0 ? void 0 : _this1.toDate()) || new Date()
        };
    } catch (error) {
        console.error('Error fetching playlist:', error);
        return null;
    }
}
async function createAdminPlaylist(data) {
    try {
        var _data_isPublic, _data_isFeatured, _data_forHQ;
        const docRef = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], COLLECTION), {
            name: data.name,
            description: data.description || '',
            thumbnail: data.thumbnail || '',
            videoIds: [],
            isPublic: (_data_isPublic = data.isPublic) !== null && _data_isPublic !== void 0 ? _data_isPublic : true,
            isFeatured: (_data_isFeatured = data.isFeatured) !== null && _data_isFeatured !== void 0 ? _data_isFeatured : false,
            forHQ: (_data_forHQ = data.forHQ) !== null && _data_forHQ !== void 0 ? _data_forHQ : true,
            type: data.type || null,
            createdBy: data.createdBy,
            createdByName: data.createdByName,
            createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["serverTimestamp"])(),
            updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["serverTimestamp"])()
        });
        return docRef.id;
    } catch (error) {
        console.error('Error creating playlist:', error);
        throw error;
    }
}
async function updateAdminPlaylist(id, data) {
    try {
        const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], COLLECTION, id);
        // Filter out undefined values
        const cleanData = {};
        for (const [key, value] of Object.entries(data)){
            if (value !== undefined) {
                cleanData[key] = value;
            }
        }
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateDoc"])(docRef, {
            ...cleanData,
            updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["serverTimestamp"])()
        });
    } catch (error) {
        console.error('Error updating playlist:', error);
        throw error;
    }
}
async function deleteAdminPlaylist(id) {
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deleteDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], COLLECTION, id));
    } catch (error) {
        console.error('Error deleting playlist:', error);
        throw error;
    }
}
async function addVideoToPlaylist(playlistId, videoId) {
    try {
        const playlist = await getAdminPlaylist(playlistId);
        if (!playlist) throw new Error('Playlist not found');
        if (!playlist.videoIds.includes(videoId)) {
            await updateAdminPlaylist(playlistId, {
                videoIds: [
                    ...playlist.videoIds,
                    videoId
                ]
            });
        }
    } catch (error) {
        console.error('Error adding video to playlist:', error);
        throw error;
    }
}
async function removeVideoFromPlaylist(playlistId, videoId) {
    try {
        const playlist = await getAdminPlaylist(playlistId);
        if (!playlist) throw new Error('Playlist not found');
        await updateAdminPlaylist(playlistId, {
            videoIds: playlist.videoIds.filter((id)=>id !== videoId)
        });
    } catch (error) {
        console.error('Error removing video from playlist:', error);
        throw error;
    }
}
async function reorderPlaylistVideos(playlistId, videoIds) {
    try {
        await updateAdminPlaylist(playlistId, {
            videoIds
        });
    } catch (error) {
        console.error('Error reordering playlist:', error);
        throw error;
    }
}
async function addChildPlaylist(parentId, childId) {
    try {
        var _child_childPlaylistIds;
        // Prevent circular references
        if (parentId === childId) throw new Error('Cannot add playlist to itself');
        const parent = await getAdminPlaylist(parentId);
        if (!parent) throw new Error('Parent playlist not found');
        const child = await getAdminPlaylist(childId);
        if (!child) throw new Error('Child playlist not found');
        // Check if child already contains parent (prevent circular)
        if ((_child_childPlaylistIds = child.childPlaylistIds) === null || _child_childPlaylistIds === void 0 ? void 0 : _child_childPlaylistIds.includes(parentId)) {
            throw new Error('Cannot create circular playlist reference');
        }
        const currentChildren = parent.childPlaylistIds || [];
        if (!currentChildren.includes(childId)) {
            await updateAdminPlaylist(parentId, {
                childPlaylistIds: [
                    ...currentChildren,
                    childId
                ]
            });
        }
    } catch (error) {
        console.error('Error adding child playlist:', error);
        throw error;
    }
}
async function removeChildPlaylist(parentId, childId) {
    try {
        const parent = await getAdminPlaylist(parentId);
        if (!parent) throw new Error('Playlist not found');
        await updateAdminPlaylist(parentId, {
            childPlaylistIds: (parent.childPlaylistIds || []).filter((id)=>id !== childId)
        });
    } catch (error) {
        console.error('Error removing child playlist:', error);
        throw error;
    }
}
async function getAddableChildPlaylists(parentId) {
    try {
        const allPlaylists = await getAdminPlaylists();
        const parent = await getAdminPlaylist(parentId);
        if (!parent) return [];
        const existingChildren = parent.childPlaylistIds || [];
        // Filter out: self, already added, and any that contain this playlist as child
        return allPlaylists.filter((p)=>{
            var _p_childPlaylistIds;
            if (p.id === parentId) return false;
            if (existingChildren.includes(p.id)) return false;
            if ((_p_childPlaylistIds = p.childPlaylistIds) === null || _p_childPlaylistIds === void 0 ? void 0 : _p_childPlaylistIds.includes(parentId)) return false;
            return true;
        });
    } catch (error) {
        console.error('Error getting addable playlists:', error);
        return [];
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/hq-invitation-service.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// HQ Invitation Service
// Handles invitation codes for HQ groups (zone-001 to zone-005)
// Separate from zone invitations but uses same authentication
__turbopack_context__.s([
    "HQInvitationService",
    ()=>HQInvitationService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$hq$2d$members$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/hq-members-service.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/config/zones.ts [app-client] (ecmascript)");
;
;
class HQInvitationService {
    /**
   * Join HQ group using invitation code
   * Uses same invitation codes as zones (ZONE001-ZONE005)
   * But stores in hq_members collection instead of zone_members
   */ static async joinHQGroup(invitationCode, userId, userEmail, userName) {
        try {
            console.log('🔍 Processing HQ invitation code:', invitationCode);
            // Get zone by invitation code
            const zone = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getZoneByInvitationCode"])(invitationCode);
            if (!zone) {
                console.error('❌ Invalid invitation code');
                return {
                    success: false,
                    error: 'Invalid invitation code'
                };
            }
            // Check if it's an HQ group
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isHQGroup"])(zone.id)) {
                console.error('❌ Not an HQ group invitation code');
                return {
                    success: false,
                    error: 'Not an HQ group invitation code'
                };
            }
            console.log('✅ Valid HQ group:', zone.name);
            // Check if user is already a member
            const existingMember = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$hq$2d$members$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HQMembersService"].getMemberByUserId(userId, zone.id);
            if (existingMember) {
                console.log('⚠️ User already member of HQ group');
                return {
                    success: false,
                    error: 'Already a member of this HQ group'
                };
            }
            // Determine role based on invitation code
            const isCoordinator = invitationCode.startsWith('ZNL');
            const role = isCoordinator ? 'coordinator' : 'member';
            console.log('📝 Adding user to HQ group as:', role);
            // Add to hq_members collection
            const result = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$hq$2d$members$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HQMembersService"].addMember({
                userId,
                userEmail,
                userName,
                hqGroupId: zone.id,
                role
            });
            if (result.success) {
                console.log('✅ User joined HQ group successfully');
                return {
                    success: true,
                    zoneName: zone.name,
                    zoneId: zone.id,
                    message: "Welcome to ".concat(zone.name, "! (HQ Group - Unlimited Access)"),
                    isHQGroup: true,
                    role
                };
            } else {
                return result;
            }
        } catch (error) {
            console.error('❌ Error joining HQ group:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
   * Get HQ group stats
   */ static async getHQGroupStats(hqGroupId) {
        try {
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isHQGroup"])(hqGroupId)) {
                return null;
            }
            const members = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$hq$2d$members$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HQMembersService"].getHQGroupMembers(hqGroupId);
            const coordinator = members.find((m)=>m.role === 'coordinator');
            return {
                memberCount: members.length,
                coordinatorEmail: coordinator === null || coordinator === void 0 ? void 0 : coordinator.userEmail,
                coordinatorName: coordinator === null || coordinator === void 0 ? void 0 : coordinator.userName,
                members
            };
        } catch (error) {
            console.error('❌ Error getting HQ group stats:', error);
            return null;
        }
    }
    /**
   * Check if invitation code is for HQ group
   */ static isHQInvitationCode(invitationCode) {
        const zone = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getZoneByInvitationCode"])(invitationCode);
        return zone ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isHQGroup"])(zone.id) : false;
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/zone-invitation-service.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// @ts-nocheck
__turbopack_context__.s([
    "ZoneInvitationService",
    ()=>ZoneInvitationService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase-database.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$hq$2d$members$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/hq-members-service.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$hq$2d$invitation$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/hq-invitation-service.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/config/zones.ts [app-client] (ecmascript)");
;
;
;
;
class ZoneInvitationService {
    static async joinZoneWithCode(userId, invitationCode, userEmail, userName) {
        let role = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : 'member';
        try {
            const zone = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getZoneByInvitationCode"])(invitationCode);
            if (!zone) {
                return {
                    success: false,
                    error: 'Invalid invitation code. Please check and try again.'
                };
            }
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isHQGroup"])(zone.id)) {
                return await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$hq$2d$invitation$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HQInvitationService"].joinHQGroup(invitationCode, userId, userEmail, userName);
            }
            const existingMembers = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].getCollectionWhere('zone_members', 'userId', '==', userId);
            const alreadyMember = existingMembers.some((m)=>m.zoneId === zone.id);
            if (alreadyMember) {
                return {
                    success: true,
                    alreadyMember: true,
                    zoneName: zone.name,
                    message: "You are already a member of ".concat(zone.name)
                };
            }
            const zoneData = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].getDocument('zones', zone.id);
            if (!zoneData) {
                await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].createDocument('zones', zone.id, {
                    id: zone.id,
                    name: zone.name,
                    slug: zone.slug,
                    region: zone.region,
                    invitationCode: zone.invitationCode,
                    themeColor: zone.themeColor,
                    coordinatorId: userId,
                    memberCount: 0,
                    maxMembers: 20,
                    subscriptionTier: 'free',
                    subscriptionStatus: 'active',
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }
            const currentMemberCount = (zoneData === null || zoneData === void 0 ? void 0 : zoneData.memberCount) || 0;
            const maxMembers = (zoneData === null || zoneData === void 0 ? void 0 : zoneData.maxMembers) || 20;
            const subscriptionTier = (zoneData === null || zoneData === void 0 ? void 0 : zoneData.subscriptionTier) || 'free';
            if (currentMemberCount >= maxMembers) {
                const upgradeMessage = subscriptionTier === 'free' ? 'This zone is on the Free plan (20 members max). The coordinator needs to upgrade to Premium (500 members) to add more members.' : 'This zone has reached its maximum member limit. Please contact the zone coordinator.';
                return {
                    success: false,
                    error: upgradeMessage
                };
            }
            const isFirstMember = currentMemberCount === 0;
            const finalRole = role || (isFirstMember ? 'coordinator' : 'member');
            const memberId = "mem_".concat(Date.now(), "_").concat(userId);
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].createDocument('zone_members', memberId, {
                id: memberId,
                zoneId: zone.id,
                userId,
                userEmail,
                userName,
                role: finalRole,
                joinedAt: new Date(),
                status: 'active'
            });
            if (finalRole === 'coordinator') {
                await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].updateDocument('zones', zone.id, {
                    coordinatorId: userId,
                    coordinatorName: userName,
                    coordinatorEmail: userEmail,
                    updatedAt: new Date()
                });
            }
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].updateDocument('zones', zone.id, {
                memberCount: currentMemberCount + 1,
                updatedAt: new Date()
            });
            return {
                success: true,
                zoneName: zone.name,
                zoneId: zone.id,
                message: "Welcome to ".concat(zone.name, "!")
            };
        } catch (error) {
            console.error('Error joining zone:', error);
            return {
                success: false,
                error: 'Failed to join zone. Please try again.'
            };
        }
    }
    static getZoneSignupLink(invitationCode) {
        const baseUrl = ("TURBOPACK compile-time truthy", 1) ? window.location.origin : "TURBOPACK unreachable";
        return "".concat(baseUrl, "/auth?zone=").concat(invitationCode);
    }
    static async getAllZonesWithStats() {
        try {
            const zonesWithStats = await Promise.all(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ZONES"].map(async (zone)=>{
                const zoneData = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].getDocument('zones', zone.id);
                const members = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isHQGroup"])(zone.id) ? await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$hq$2d$members$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HQMembersService"].getHQGroupMembers(zone.id) : await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].getCollectionWhere('zone_members', 'zoneId', '==', zone.id);
                return {
                    ...zone,
                    memberCount: members.length,
                    maxMembers: (zoneData === null || zoneData === void 0 ? void 0 : zoneData.maxMembers) || ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isHQGroup"])(zone.id) ? 999999 : 20),
                    subscriptionTier: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isHQGroup"])(zone.id) ? 'unlimited' : (zoneData === null || zoneData === void 0 ? void 0 : zoneData.subscriptionTier) || 'free',
                    subscriptionStatus: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isHQGroup"])(zone.id) ? 'active' : (zoneData === null || zoneData === void 0 ? void 0 : zoneData.subscriptionStatus) || 'active',
                    signupLink: this.getZoneSignupLink(zone.invitationCode),
                    isHQGroup: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isHQGroup"])(zone.id)
                };
            }));
            return zonesWithStats;
        } catch (error) {
            console.error('Error getting zones with stats:', error);
            return [];
        }
    }
    static async getZoneMembers(zoneId) {
        try {
            const members = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isHQGroup"])(zoneId) ? await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$hq$2d$members$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HQMembersService"].getHQGroupMembers(zoneId) : await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].getCollectionWhere('zone_members', 'zoneId', '==', zoneId);
            const membersWithProfiles = await Promise.all(members.map(async (member)=>{
                const profile = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].getDocument('profiles', member.userId);
                return {
                    ...member,
                    profile
                };
            }));
            return membersWithProfiles;
        } catch (error) {
            console.error('Error getting zone members:', error);
            return [];
        }
    }
    static async removeMember(memberId, zoneId) {
        try {
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isHQGroup"])(zoneId)) {
                const parts = memberId.split('_');
                const userId = parts.slice(0, -1).join('_');
                await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$hq$2d$members$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HQMembersService"].removeMember(userId, zoneId);
            } else {
                await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].deleteDocument('zone_members', memberId);
                const zoneData = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].getDocument('zones', zoneId);
                if (zoneData) {
                    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].updateDocument('zones', zoneId, {
                        memberCount: Math.max(0, (zoneData.memberCount || 1) - 1),
                        updatedAt: new Date()
                    });
                }
            }
            return {
                success: true
            };
        } catch (error) {
            console.error('Error removing member:', error);
            return {
                success: false
            };
        }
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/simple-notifications-service.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "deleteMessage",
    ()=>deleteMessage,
    "getAllMessages",
    ()=>getAllMessages,
    "sendMessageToAllUsers",
    ()=>sendMessageToAllUsers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$firestore$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/firestore/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/firebase/node_modules/@firebase/firestore/dist/index.esm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase-setup.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/config/zones.ts [app-client] (ecmascript)");
;
;
;
const CACHE_TTL = 2 * 60 * 1000;
const messagesCache = new Map();
function getCacheKey(zoneId) {
    return "messages_".concat(zoneId || 'default');
}
function isCacheValid(entry) {
    if (!entry) return false;
    return Date.now() - entry.timestamp < CACHE_TTL;
}
function invalidateCache(zoneId) {
    messagesCache.delete(getCacheKey(zoneId));
}
function getMessagesCollectionName(zoneId) {
    return zoneId && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isHQGroup"])(zoneId) ? 'admin_messages' : 'zone_admin_messages';
}
async function sendMessageToAllUsers(title, message, adminUsername, zoneId) {
    try {
        const collectionName = getMessagesCollectionName(zoneId);
        const messageData = {
            title: title.trim(),
            message: message.trim(),
            sentBy: adminUsername,
            sentAt: new Date().toISOString(),
            zoneId: zoneId || '',
            createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["serverTimestamp"])()
        };
        const messagesRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], collectionName);
        const docRef = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addDoc"])(messagesRef, messageData);
        invalidateCache(zoneId);
        return {
            success: true,
            id: docRef.id
        };
    } catch (error) {
        console.error('Error sending message:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to send message'
        };
    }
}
async function getAllMessages(zoneId) {
    let forceRefresh = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
    try {
        const cacheKey = getCacheKey(zoneId);
        if (!forceRefresh) {
            const cached = messagesCache.get(cacheKey);
            if (isCacheValid(cached)) {
                return cached.data;
            }
        }
        const collectionName = getMessagesCollectionName(zoneId);
        const messagesRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], collectionName);
        const q = zoneId && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isHQGroup"])(zoneId) ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])(messagesRef, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('zoneId', '==', zoneId), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["orderBy"])('createdAt', 'desc')) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])(messagesRef, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["orderBy"])('createdAt', 'desc'));
        const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
        const messages = snapshot.docs.map((docSnap)=>{
            var _data_createdAt_toDate, _data_createdAt_toDate1, _data_createdAt;
            const data = docSnap.data();
            return {
                ...data,
                id: docSnap.id,
                sentAt: data.sentAt || new Date().toISOString(),
                createdAt: ((_data_createdAt = data.createdAt) === null || _data_createdAt === void 0 ? void 0 : (_data_createdAt_toDate1 = _data_createdAt.toDate) === null || _data_createdAt_toDate1 === void 0 ? void 0 : (_data_createdAt_toDate = _data_createdAt_toDate1.call(_data_createdAt)) === null || _data_createdAt_toDate === void 0 ? void 0 : _data_createdAt_toDate.toISOString()) || new Date().toISOString()
            };
        });
        messagesCache.set(cacheKey, {
            data: messages,
            timestamp: Date.now()
        });
        return messages;
    } catch (error) {
        console.error('Error getting messages:', error);
        return [];
    }
}
async function deleteMessage(messageId, zoneId) {
    try {
        const collectionName = getMessagesCollectionName(zoneId);
        const messageRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], collectionName, messageId);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deleteDoc"])(messageRef);
        invalidateCache(zoneId);
        return {
            success: true
        };
    } catch (error) {
        console.error('Error deleting message:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to delete message'
        };
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/translation-service.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Completely FREE translation service with NO LIMITS
// Uses multiple fallback methods:
// 1. Browser's native translation (unlimited, free)
// 2. LibreTranslate public API (free, open source)
// 3. Lingva Translate (free, no limits)
__turbopack_context__.s([
    "SUPPORTED_LANGUAGES",
    ()=>SUPPORTED_LANGUAGES,
    "translationService",
    ()=>translationService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_define_property.js [app-client] (ecmascript)");
;
const SUPPORTED_LANGUAGES = {
    en: {
        name: 'English',
        flag: '🇬🇧'
    },
    es: {
        name: 'Spanish',
        flag: '🇪🇸'
    },
    fr: {
        name: 'French',
        flag: '🇫🇷'
    },
    pt: {
        name: 'Portuguese',
        flag: '🇵🇹'
    },
    de: {
        name: 'German',
        flag: '🇩🇪'
    },
    it: {
        name: 'Italian',
        flag: '🇮🇹'
    },
    zh: {
        name: 'Chinese',
        flag: '🇨🇳'
    },
    ja: {
        name: 'Japanese',
        flag: '🇯🇵'
    },
    ko: {
        name: 'Korean',
        flag: '🇰🇷'
    },
    ar: {
        name: 'Arabic',
        flag: '🇸🇦'
    },
    hi: {
        name: 'Hindi',
        flag: '🇮🇳'
    },
    ru: {
        name: 'Russian',
        flag: '🇷🇺'
    },
    sw: {
        name: 'Swahili',
        flag: '🇰🇪'
    },
    yo: {
        name: 'Yoruba',
        flag: '🇳🇬'
    },
    ig: {
        name: 'Igbo',
        flag: '🇳🇬'
    },
    ha: {
        name: 'Hausa',
        flag: '🇳🇬'
    }
};
class TranslationService {
    // Generate cache key
    getCacheKey(text, targetLang) {
        return "".concat(targetLang, ":").concat(text.substring(0, 100));
    }
    // Method 1: Lingva Translate (Free, unlimited, no API key)
    async translateWithLingva(text, targetLang) {
        let sourceLang = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 'en';
        try {
            // Clean text for better translation
            const cleanText = this.cleanTextForTranslation(text);
            const url = "https://lingva.ml/api/v1/".concat(sourceLang, "/").concat(targetLang, "/").concat(encodeURIComponent(cleanText));
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (compatible; LWSRH-App/1.0)'
                }
            });
            if (!response.ok) {
                throw new Error("Lingva API error: ".concat(response.status));
            }
            const data = await response.json();
            if (data.translation && data.translation.trim() !== '') {
                return this.restoreTextFormatting(data.translation, text);
            }
            throw new Error('Lingva translation empty');
        } catch (error) {
            console.warn('Lingva translation failed:', error);
            throw error;
        }
    }
    // Method 2: LibreTranslate public instance (Free, unlimited)
    async translateWithLibre(text, targetLang) {
        let sourceLang = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 'en';
        try {
            const cleanText = this.cleanTextForTranslation(text);
            const url = 'https://libretranslate.com/translate';
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    q: cleanText,
                    source: sourceLang,
                    target: targetLang,
                    format: 'text'
                })
            });
            if (!response.ok) {
                throw new Error("LibreTranslate API error: ".concat(response.status));
            }
            const data = await response.json();
            if (data.translatedText && data.translatedText.trim() !== '') {
                return this.restoreTextFormatting(data.translatedText, text);
            }
            throw new Error('LibreTranslate translation empty');
        } catch (error) {
            console.warn('LibreTranslate failed:', error);
            throw error;
        }
    }
    // Method 3: Comprehensive offline translation
    async translateWithFallback(text, targetLang) {
        // Comprehensive translation dictionaries for worship content
        const translations = {
            es: {
                // Religious terms
                'God': 'Dios',
                'god': 'dios',
                'Jesus': 'Jesús',
                'jesus': 'jesús',
                'Christ': 'Cristo',
                'christ': 'cristo',
                'Lord': 'Señor',
                'lord': 'señor',
                'Holy': 'Santo',
                'holy': 'santo',
                'Spirit': 'Espíritu',
                'spirit': 'espíritu',
                'Father': 'Padre',
                'father': 'padre',
                'Son': 'Hijo',
                'son': 'hijo',
                'King': 'Rey',
                'king': 'rey',
                'Savior': 'Salvador',
                'savior': 'salvador',
                'Redeemer': 'Redentor',
                'redeemer': 'redentor',
                // Worship terms
                'love': 'amor',
                'Love': 'Amor',
                'praise': 'alabanza',
                'Praise': 'Alabanza',
                'worship': 'adoración',
                'Worship': 'Adoración',
                'glory': 'gloria',
                'Glory': 'Gloria',
                'honor': 'honor',
                'Honor': 'Honor',
                'majesty': 'majestad',
                'Majesty': 'Majestad',
                'power': 'poder',
                'Power': 'Poder',
                'strength': 'fuerza',
                'Strength': 'Fuerza',
                // Places and concepts
                'heaven': 'cielo',
                'Heaven': 'Cielo',
                'earth': 'tierra',
                'Earth': 'Tierra',
                'salvation': 'salvación',
                'Salvation': 'Salvación',
                'grace': 'gracia',
                'Grace': 'Gracia',
                'mercy': 'misericordia',
                'Mercy': 'Misericordia',
                'peace': 'paz',
                'Peace': 'Paz',
                'joy': 'gozo',
                'Joy': 'Gozo',
                'faith': 'fe',
                'Faith': 'Fe',
                'hope': 'esperanza',
                'Hope': 'Esperanza',
                'blessed': 'bendecido',
                'Blessed': 'Bendecido',
                'blessing': 'bendición',
                'Blessing': 'Bendición',
                // Common words
                'and': 'y',
                'And': 'Y',
                'the': 'el',
                'The': 'El',
                'of': 'de',
                'Of': 'De',
                'in': 'en',
                'In': 'En',
                'to': 'a',
                'To': 'A',
                'for': 'para',
                'For': 'Para',
                'with': 'con',
                'With': 'Con',
                'you': 'tú',
                'You': 'Tú',
                'your': 'tu',
                'Your': 'Tu',
                'my': 'mi',
                'My': 'Mi',
                'me': 'me',
                'Me': 'Me',
                'I': 'Yo',
                'i': 'yo',
                'we': 'nosotros',
                'We': 'Nosotros',
                'us': 'nosotros',
                'Us': 'Nosotros',
                'all': 'todo',
                'All': 'Todo',
                'every': 'cada',
                'Every': 'Cada',
                'always': 'siempre',
                'Always': 'Siempre',
                'forever': 'para siempre',
                'Forever': 'Para siempre',
                // Expressions
                'hallelujah': 'aleluya',
                'Hallelujah': 'Aleluya',
                'amen': 'amén',
                'Amen': 'Amén',
                'thank you': 'gracias',
                'Thank you': 'Gracias',
                'come': 'ven',
                'Come': 'Ven',
                'sing': 'canta',
                'Sing': 'Canta',
                'dance': 'danza',
                'Dance': 'Danza',
                'rejoice': 'regocíjate',
                'Rejoice': 'Regocíjate',
                'celebrate': 'celebra',
                'Celebrate': 'Celebra'
            },
            fr: {
                // Religious terms
                'God': 'Dieu',
                'god': 'dieu',
                'Jesus': 'Jésus',
                'jesus': 'jésus',
                'Christ': 'Christ',
                'christ': 'christ',
                'Lord': 'Seigneur',
                'lord': 'seigneur',
                'Holy': 'Saint',
                'holy': 'saint',
                'Spirit': 'Esprit',
                'spirit': 'esprit',
                'Father': 'Père',
                'father': 'père',
                'Son': 'Fils',
                'son': 'fils',
                'King': 'Roi',
                'king': 'roi',
                'Savior': 'Sauveur',
                'savior': 'sauveur',
                // Worship terms
                'love': 'amour',
                'Love': 'Amour',
                'praise': 'louange',
                'Praise': 'Louange',
                'worship': 'adoration',
                'Worship': 'Adoration',
                'glory': 'gloire',
                'Glory': 'Gloire',
                'honor': 'honneur',
                'Honor': 'Honneur',
                'majesty': 'majesté',
                'Majesty': 'Majesté',
                'power': 'puissance',
                'Power': 'Puissance',
                // Places and concepts
                'heaven': 'ciel',
                'Heaven': 'Ciel',
                'earth': 'terre',
                'Earth': 'Terre',
                'salvation': 'salut',
                'Salvation': 'Salut',
                'grace': 'grâce',
                'Grace': 'Grâce',
                'mercy': 'miséricorde',
                'Mercy': 'Miséricorde',
                'peace': 'paix',
                'Peace': 'Paix',
                'joy': 'joie',
                'Joy': 'Joie',
                'faith': 'foi',
                'Faith': 'Foi',
                'hope': 'espoir',
                'Hope': 'Espoir',
                'blessed': 'béni',
                'Blessed': 'Béni',
                // Common words
                'and': 'et',
                'And': 'Et',
                'the': 'le',
                'The': 'Le',
                'of': 'de',
                'Of': 'De',
                'in': 'dans',
                'In': 'Dans',
                'to': 'à',
                'To': 'À',
                'for': 'pour',
                'For': 'Pour',
                'with': 'avec',
                'With': 'Avec',
                'you': 'tu',
                'You': 'Tu',
                'your': 'ton',
                'Your': 'Ton',
                'my': 'mon',
                'My': 'Mon',
                'me': 'moi',
                'Me': 'Moi',
                'I': 'Je',
                'i': 'je',
                'we': 'nous',
                'We': 'Nous',
                'us': 'nous',
                'Us': 'Nous',
                'all': 'tout',
                'All': 'Tout',
                'always': 'toujours',
                'Always': 'Toujours',
                'forever': 'pour toujours',
                'Forever': 'Pour toujours',
                // Expressions
                'hallelujah': 'alléluia',
                'Hallelujah': 'Alléluia',
                'amen': 'amen',
                'Amen': 'Amen',
                'thank you': 'merci',
                'Thank you': 'Merci',
                'come': 'viens',
                'Come': 'Viens',
                'sing': 'chante',
                'Sing': 'Chante',
                'rejoice': 'réjouis-toi',
                'Rejoice': 'Réjouis-toi'
            }
        };
        let translatedText = text;
        const langTranslations = translations[targetLang];
        if (langTranslations) {
            // Sort by length (longest first) to avoid partial replacements
            const sortedEntries = Object.entries(langTranslations).sort((a, b)=>b[0].length - a[0].length);
            sortedEntries.forEach((param)=>{
                let [english, translated] = param;
                // Use word boundaries to avoid partial matches
                const regex = new RegExp("\\b".concat(english.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "\\b"), 'g');
                translatedText = translatedText.replace(regex, translated);
            });
        }
        return translatedText;
    }
    // Clean text for better translation (remove HTML, preserve structure)
    cleanTextForTranslation(text) {
        return text.replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
        .replace(/&amp;/g, '&') // Replace HTML entities
        .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').trim();
    }
    // Restore formatting after translation
    restoreTextFormatting(translatedText, originalText) {
        // If original had HTML tags, try to preserve basic structure
        if (originalText.includes('<br>') || originalText.includes('<p>')) {
            // Split both texts by lines and try to match structure
            const originalLines = originalText.split(/(<br\s*\/?>|<\/p>|<p>)/i);
            const translatedLines = translatedText.split('\n');
            let result = '';
            let translatedIndex = 0;
            for (const originalLine of originalLines){
                if (originalLine.match(/<br\s*\/?>|<\/p>|<p>/i)) {
                    result += originalLine;
                } else if (originalLine.trim() && translatedIndex < translatedLines.length) {
                    result += translatedLines[translatedIndex] || originalLine;
                    translatedIndex++;
                } else {
                    result += originalLine;
                }
            }
            return result;
        }
        return translatedText;
    }
    // Translate text with fallback methods
    async translate(text, targetLang) {
        let sourceLang = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 'en';
        if (!text || text.trim() === '') return text;
        if (targetLang === sourceLang) return text;
        const cacheKey = this.getCacheKey(text, targetLang);
        // Check cache first
        if (this.cache[cacheKey]) {
            console.log('Using cached translation for:', text.substring(0, 50));
            return this.cache[cacheKey];
        }
        console.log('Translating text to', targetLang, ':', text.substring(0, 100));
        // Always try offline translation first for reliability
        console.log('Using offline translation (most reliable)...');
        const offlineTranslated = await this.translateWithFallback(text, targetLang);
        // Check if offline translation made significant changes
        const changePercentage = this.calculateChangePercentage(text, offlineTranslated);
        console.log('Offline translation change percentage:', changePercentage);
        if (changePercentage > 10) {
            console.log('Offline translation successful:', offlineTranslated.substring(0, 100));
            this.cache[cacheKey] = offlineTranslated;
            return offlineTranslated;
        }
        // If offline translation didn't change much, try online services
        try {
            // Try Lingva first (fastest, most reliable)
            console.log('Trying Lingva translation for better coverage...');
            const translated = await this.translateWithLingva(text, targetLang, sourceLang);
            // Check if online translation is significantly different from original
            const onlineChangePercentage = this.calculateChangePercentage(text, translated);
            if (onlineChangePercentage > changePercentage) {
                console.log('Lingva success with better coverage:', translated.substring(0, 100));
                this.cache[cacheKey] = translated;
                return translated;
            } else {
                // Use offline translation if online didn't improve much
                this.cache[cacheKey] = offlineTranslated;
                return offlineTranslated;
            }
        } catch (error) {
            console.log('Lingva failed, trying LibreTranslate...');
            try {
                // Fallback to LibreTranslate
                const translated = await this.translateWithLibre(text, targetLang, sourceLang);
                const onlineChangePercentage = this.calculateChangePercentage(text, translated);
                if (onlineChangePercentage > changePercentage) {
                    console.log('LibreTranslate success:', translated.substring(0, 100));
                    this.cache[cacheKey] = translated;
                    return translated;
                } else {
                    // Use offline translation
                    this.cache[cacheKey] = offlineTranslated;
                    return offlineTranslated;
                }
            } catch (error2) {
                console.log('All online services failed, using offline translation...');
                this.cache[cacheKey] = offlineTranslated;
                return offlineTranslated;
            }
        }
    }
    // Calculate how much the text changed (percentage of different words)
    calculateChangePercentage(original, translated) {
        const originalWords = original.toLowerCase().split(/\s+/).filter((w)=>w.length > 0);
        const translatedWords = translated.toLowerCase().split(/\s+/).filter((w)=>w.length > 0);
        if (originalWords.length === 0) return 0;
        let changedWords = 0;
        const maxLength = Math.max(originalWords.length, translatedWords.length);
        for(let i = 0; i < maxLength; i++){
            const originalWord = originalWords[i] || '';
            const translatedWord = translatedWords[i] || '';
            if (originalWord !== translatedWord) {
                changedWords++;
            }
        }
        return changedWords / originalWords.length * 100;
    }
    // Translate lyrics (split by lines for better results)
    async translateLyrics(lyrics, targetLang) {
        let sourceLang = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 'en';
        if (!lyrics || targetLang === sourceLang) return lyrics;
        console.log('Translating lyrics to', targetLang, '- Length:', lyrics.length);
        try {
            // Handle HTML content
            const hasHtml = lyrics.includes('<') && lyrics.includes('>');
            if (hasHtml) {
                // For HTML content, translate text nodes while preserving structure
                return await this.translateHtmlContent(lyrics, targetLang, sourceLang);
            } else {
                // For plain text, split by sections for better translation
                const sections = lyrics.split(/\n\s*\n/); // Split by empty lines
                const translatedSections = [];
                for (const section of sections){
                    if (section.trim() === '') {
                        translatedSections.push(section);
                    } else {
                        console.log('Translating section:', section.substring(0, 50));
                        const translated = await this.translate(section, targetLang, sourceLang);
                        translatedSections.push(translated);
                    }
                }
                const result = translatedSections.join('\n\n');
                console.log('Lyrics translation complete. Original length:', lyrics.length, 'Translated length:', result.length);
                return result;
            }
        } catch (error) {
            console.error('Lyrics translation error:', error);
            return lyrics;
        }
    }
    // Translate HTML content while preserving structure
    async translateHtmlContent(html, targetLang) {
        let sourceLang = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 'en';
        try {
            // Create a temporary div to parse HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            // Find all text nodes and translate them
            const walker = document.createTreeWalker(tempDiv, NodeFilter.SHOW_TEXT, null);
            const textNodes = [];
            let node;
            while(node = walker.nextNode()){
                if (node.textContent && node.textContent.trim()) {
                    textNodes.push(node);
                }
            }
            // Translate each text node
            for (const textNode of textNodes){
                const originalText = textNode.textContent || '';
                if (originalText.trim()) {
                    const translated = await this.translate(originalText, targetLang, sourceLang);
                    textNode.textContent = translated;
                }
            }
            return tempDiv.innerHTML;
        } catch (error) {
            console.error('HTML translation error:', error);
            // Fallback: strip HTML and translate as plain text
            const plainText = html.replace(/<[^>]*>/g, '');
            const translated = await this.translate(plainText, targetLang, sourceLang);
            return translated.replace(/\n/g, '<br>');
        }
    }
    // Get user's preferred language from localStorage
    getUserLanguage() {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        return localStorage.getItem('preferredLanguage') || 'en';
    }
    // Set user's preferred language
    setUserLanguage(langCode) {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        localStorage.setItem('preferredLanguage', langCode);
    }
    // Clear cache
    clearCache() {
        this.cache = {};
    }
    constructor(){
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "cache", {});
        // Popular languages for church/worship context
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "LANGUAGES", [
            {
                code: 'en',
                name: 'English',
                flag: '🇬🇧'
            },
            {
                code: 'es',
                name: 'Spanish',
                flag: '🇪🇸'
            },
            {
                code: 'fr',
                name: 'French',
                flag: '🇫🇷'
            },
            {
                code: 'pt',
                name: 'Portuguese',
                flag: '🇵🇹'
            },
            {
                code: 'de',
                name: 'German',
                flag: '🇩🇪'
            },
            {
                code: 'it',
                name: 'Italian',
                flag: '🇮🇹'
            },
            {
                code: 'zh',
                name: 'Chinese',
                flag: '🇨🇳'
            },
            {
                code: 'ja',
                name: 'Japanese',
                flag: '🇯🇵'
            },
            {
                code: 'ko',
                name: 'Korean',
                flag: '🇰🇷'
            },
            {
                code: 'ar',
                name: 'Arabic',
                flag: '🇸🇦'
            },
            {
                code: 'hi',
                name: 'Hindi',
                flag: '🇮🇳'
            },
            {
                code: 'ru',
                name: 'Russian',
                flag: '🇷🇺'
            },
            {
                code: 'sw',
                name: 'Swahili',
                flag: '🇰🇪'
            },
            {
                code: 'yo',
                name: 'Yoruba',
                flag: '🇳🇬'
            },
            {
                code: 'ig',
                name: 'Igbo',
                flag: '🇳🇬'
            },
            {
                code: 'ha',
                name: 'Hausa',
                flag: '🇳🇬'
            }
        ]);
    }
}
const translationService = new TranslationService();
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/song-submission-service.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "approveSong",
    ()=>approveSong,
    "deleteSubmissionAsAdmin",
    ()=>deleteSubmissionAsAdmin,
    "deleteUserSubmission",
    ()=>deleteUserSubmission,
    "getAllSubmittedSongs",
    ()=>getAllSubmittedSongs,
    "getPendingSongs",
    ()=>getPendingSongs,
    "getUnreadNotifications",
    ()=>getUnreadNotifications,
    "getUserSongNotifications",
    ()=>getUserSongNotifications,
    "getUserSubmissions",
    ()=>getUserSubmissions,
    "getUserSubmissionsByEmail",
    ()=>getUserSubmissionsByEmail,
    "markNotificationAsRead",
    ()=>markNotificationAsRead,
    "markSubmissionSeen",
    ()=>markSubmissionSeen,
    "rejectSong",
    ()=>rejectSong,
    "replyToSubmission",
    ()=>replyToSubmission,
    "submitSong",
    ()=>submitSong
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$firestore$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/firestore/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/firebase/node_modules/@firebase/firestore/dist/index.esm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase-setup.ts [app-client] (ecmascript)");
;
;
const SONGS_COLLECTION = 'songs';
const SUBMITTED_SONGS_COLLECTION = 'submitted_songs';
const SONG_NOTIFICATIONS_COLLECTION = 'song_notifications';
async function submitSong(songData) {
    try {
        const submissionData = {
            ...songData,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        const submissionsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], SUBMITTED_SONGS_COLLECTION);
        const docRef = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addDoc"])(submissionsRef, {
            ...submissionData,
            createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["serverTimestamp"])(),
            updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["serverTimestamp"])()
        });
        await createSubmissionNotification(docRef.id, songData.title, songData.submittedBy, songData.zoneId, songData.zoneName);
        return {
            success: true,
            id: docRef.id
        };
    } catch (error) {
        console.error('Error submitting song:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to submit song'
        };
    }
}
async function createSubmissionNotification(songId, songTitle, submittedBy, zoneId, zoneName) {
    try {
        const notificationData = {
            songId,
            songTitle,
            submittedBy: submittedBy.userName,
            submittedByEmail: submittedBy.email,
            type: 'new_submission',
            message: 'New song "'.concat(songTitle, '" submitted by ').concat(submittedBy.userName).concat(zoneName ? " from ".concat(zoneName) : ''),
            read: false,
            createdAt: new Date().toISOString(),
            timestamp: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["serverTimestamp"])(),
            zoneId: zoneId || 'unknown',
            zoneName: zoneName || 'Unknown Zone'
        };
        const notificationsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], SONG_NOTIFICATIONS_COLLECTION);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addDoc"])(notificationsRef, notificationData);
    } catch (error) {
        console.error('Error creating notification:', error);
    }
}
async function getAllSubmittedSongs(zoneId, isHQGroup) {
    try {
        const submissionsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], SUBMITTED_SONGS_COLLECTION);
        let q;
        if (isHQGroup && zoneId) {
            // HQ users: show ALL submissions from ANY HQ zone (C, D, E all see each other's submissions)
            // Get all submissions and filter client-side for HQ zones
            const { HQ_GROUP_IDS, BOSS_ZONE_ID } = await __turbopack_context__.A("[project]/src/config/zones.ts [app-client] (ecmascript, async loader)");
            const hqZoneIds = [
                ...HQ_GROUP_IDS,
                BOSS_ZONE_ID
            ];
            // Get all submissions
            const allSnapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])(submissionsRef, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["orderBy"])('createdAt', 'desc')));
            const allSubmissions = allSnapshot.docs.map((docSnap)=>{
                var _data_createdAt_toDate, _data_createdAt_toDate1, _data_createdAt, _data_updatedAt_toDate, _data_updatedAt_toDate1, _data_updatedAt;
                const data = docSnap.data();
                return {
                    id: docSnap.id,
                    ...data,
                    adminSeen: data.adminSeen || false,
                    zoneId: data.zoneId || 'unknown',
                    createdAt: ((_data_createdAt = data.createdAt) === null || _data_createdAt === void 0 ? void 0 : (_data_createdAt_toDate1 = _data_createdAt.toDate) === null || _data_createdAt_toDate1 === void 0 ? void 0 : (_data_createdAt_toDate = _data_createdAt_toDate1.call(_data_createdAt)) === null || _data_createdAt_toDate === void 0 ? void 0 : _data_createdAt_toDate.toISOString()) || data.createdAt || new Date().toISOString(),
                    updatedAt: ((_data_updatedAt = data.updatedAt) === null || _data_updatedAt === void 0 ? void 0 : (_data_updatedAt_toDate1 = _data_updatedAt.toDate) === null || _data_updatedAt_toDate1 === void 0 ? void 0 : (_data_updatedAt_toDate = _data_updatedAt_toDate1.call(_data_updatedAt)) === null || _data_updatedAt_toDate === void 0 ? void 0 : _data_updatedAt_toDate.toISOString()) || data.updatedAt || new Date().toISOString()
                };
            });
            // Filter to only HQ zone submissions (all HQ zones see each other's submissions)
            return allSubmissions.filter((sub)=>hqZoneIds.includes(sub.zoneId));
        } else if (zoneId) {
            // Regular zone: show ONLY submissions for this specific zone (Zone A only sees Zone A, Zone B only sees Zone B)
            q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])(submissionsRef, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('zoneId', '==', zoneId), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["orderBy"])('createdAt', 'desc'));
            const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
            return snapshot.docs.map((docSnap)=>{
                var _data_createdAt_toDate, _data_createdAt_toDate1, _data_createdAt, _data_updatedAt_toDate, _data_updatedAt_toDate1, _data_updatedAt;
                const data = docSnap.data();
                return {
                    id: docSnap.id,
                    ...data,
                    adminSeen: data.adminSeen || false,
                    zoneId: data.zoneId || 'unknown',
                    createdAt: ((_data_createdAt = data.createdAt) === null || _data_createdAt === void 0 ? void 0 : (_data_createdAt_toDate1 = _data_createdAt.toDate) === null || _data_createdAt_toDate1 === void 0 ? void 0 : (_data_createdAt_toDate = _data_createdAt_toDate1.call(_data_createdAt)) === null || _data_createdAt_toDate === void 0 ? void 0 : _data_createdAt_toDate.toISOString()) || data.createdAt || new Date().toISOString(),
                    updatedAt: ((_data_updatedAt = data.updatedAt) === null || _data_updatedAt === void 0 ? void 0 : (_data_updatedAt_toDate1 = _data_updatedAt.toDate) === null || _data_updatedAt_toDate1 === void 0 ? void 0 : (_data_updatedAt_toDate = _data_updatedAt_toDate1.call(_data_updatedAt)) === null || _data_updatedAt_toDate === void 0 ? void 0 : _data_updatedAt_toDate.toISOString()) || data.updatedAt || new Date().toISOString()
                };
            });
        } else {
            // No zone specified: return empty (shouldn't happen)
            return [];
        }
    } catch (error) {
        console.error('Error getting submitted songs:', error);
        return [];
    }
}
async function getPendingSongs(zoneId, isHQGroup) {
    try {
        const submissionsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], SUBMITTED_SONGS_COLLECTION);
        let q;
        if (isHQGroup && zoneId) {
            // HQ users: show ALL pending submissions from ANY HQ zone
            const { HQ_GROUP_IDS, BOSS_ZONE_ID } = await __turbopack_context__.A("[project]/src/config/zones.ts [app-client] (ecmascript, async loader)");
            const hqZoneIds = [
                ...HQ_GROUP_IDS,
                BOSS_ZONE_ID
            ];
            // Get all pending submissions
            const allSnapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])(submissionsRef, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('status', '==', 'pending'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["orderBy"])('createdAt', 'desc')));
            const allSubmissions = allSnapshot.docs.map((docSnap)=>{
                var _data_createdAt_toDate, _data_createdAt_toDate1, _data_createdAt, _data_updatedAt_toDate, _data_updatedAt_toDate1, _data_updatedAt;
                const data = docSnap.data();
                return {
                    id: docSnap.id,
                    ...data,
                    zoneId: data.zoneId || 'unknown',
                    createdAt: ((_data_createdAt = data.createdAt) === null || _data_createdAt === void 0 ? void 0 : (_data_createdAt_toDate1 = _data_createdAt.toDate) === null || _data_createdAt_toDate1 === void 0 ? void 0 : (_data_createdAt_toDate = _data_createdAt_toDate1.call(_data_createdAt)) === null || _data_createdAt_toDate === void 0 ? void 0 : _data_createdAt_toDate.toISOString()) || data.createdAt || new Date().toISOString(),
                    updatedAt: ((_data_updatedAt = data.updatedAt) === null || _data_updatedAt === void 0 ? void 0 : (_data_updatedAt_toDate1 = _data_updatedAt.toDate) === null || _data_updatedAt_toDate1 === void 0 ? void 0 : (_data_updatedAt_toDate = _data_updatedAt_toDate1.call(_data_updatedAt)) === null || _data_updatedAt_toDate === void 0 ? void 0 : _data_updatedAt_toDate.toISOString()) || data.updatedAt || new Date().toISOString()
                };
            });
            // Filter to only HQ zone submissions
            return allSubmissions.filter((sub)=>hqZoneIds.includes(sub.zoneId));
        } else if (zoneId) {
            // Regular zone: show ONLY pending submissions for this specific zone
            q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])(submissionsRef, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('status', '==', 'pending'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('zoneId', '==', zoneId), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["orderBy"])('createdAt', 'desc'));
            const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
            return snapshot.docs.map((docSnap)=>{
                var _data_createdAt_toDate, _data_createdAt_toDate1, _data_createdAt, _data_updatedAt_toDate, _data_updatedAt_toDate1, _data_updatedAt;
                const data = docSnap.data();
                return {
                    id: docSnap.id,
                    ...data,
                    zoneId: data.zoneId || 'unknown',
                    createdAt: ((_data_createdAt = data.createdAt) === null || _data_createdAt === void 0 ? void 0 : (_data_createdAt_toDate1 = _data_createdAt.toDate) === null || _data_createdAt_toDate1 === void 0 ? void 0 : (_data_createdAt_toDate = _data_createdAt_toDate1.call(_data_createdAt)) === null || _data_createdAt_toDate === void 0 ? void 0 : _data_createdAt_toDate.toISOString()) || data.createdAt || new Date().toISOString(),
                    updatedAt: ((_data_updatedAt = data.updatedAt) === null || _data_updatedAt === void 0 ? void 0 : (_data_updatedAt_toDate1 = _data_updatedAt.toDate) === null || _data_updatedAt_toDate1 === void 0 ? void 0 : (_data_updatedAt_toDate = _data_updatedAt_toDate1.call(_data_updatedAt)) === null || _data_updatedAt_toDate === void 0 ? void 0 : _data_updatedAt_toDate.toISOString()) || data.updatedAt || new Date().toISOString()
                };
            });
        } else {
            return [];
        }
    } catch (error) {
        console.error('Error getting pending songs:', error);
        return [];
    }
}
async function approveSong(submissionId, reviewerId, reviewerName, reviewNotes) {
    try {
        const submissionRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], SUBMITTED_SONGS_COLLECTION, submissionId);
        const submissionDoc = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDoc"])(submissionRef);
        if (!submissionDoc.exists()) throw new Error('Submission not found');
        const submissionData = submissionDoc.data();
        const songsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], SONGS_COLLECTION);
        const songData = {
            title: submissionData.title,
            lyrics: submissionData.lyrics,
            writer: submissionData.writer,
            category: submissionData.category || 'Other',
            key: submissionData.key || '',
            tempo: submissionData.tempo || '',
            leadSinger: submissionData.leadSinger || '',
            conductor: submissionData.conductor || '',
            leadKeyboardist: submissionData.leadKeyboardist || '',
            leadGuitarist: submissionData.leadGuitarist || '',
            drummer: submissionData.drummer || '',
            solfas: submissionData.solfas || '',
            audioUrl: submissionData.audioUrl || '',
            status: 'unheard',
            rehearsalCount: 0,
            createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["serverTimestamp"])(),
            updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["serverTimestamp"])()
        };
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addDoc"])(songsRef, songData);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateDoc"])(submissionRef, {
            status: 'approved',
            reviewedBy: {
                userId: reviewerId,
                userName: reviewerName,
                reviewedAt: new Date().toISOString()
            },
            reviewNotes: reviewNotes || '',
            updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["serverTimestamp"])()
        });
        await createStatusNotification(submissionId, submissionData.title, submissionData.submittedBy, 'approved');
        return {
            success: true
        };
    } catch (error) {
        console.error('Error approving song:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to approve song'
        };
    }
}
async function rejectSong(submissionId, reviewerId, reviewerName, reviewNotes) {
    try {
        const submissionRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], SUBMITTED_SONGS_COLLECTION, submissionId);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateDoc"])(submissionRef, {
            status: 'rejected',
            reviewedBy: {
                userId: reviewerId,
                userName: reviewerName,
                reviewedAt: new Date().toISOString()
            },
            reviewNotes: reviewNotes,
            updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["serverTimestamp"])()
        });
        const submissionDoc = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDoc"])(submissionRef);
        const submissionData = submissionDoc.data();
        if (submissionData) {
            await createStatusNotification(submissionId, submissionData.title, submissionData.submittedBy, 'rejected');
        }
        return {
            success: true
        };
    } catch (error) {
        console.error('Error rejecting song:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to reject song'
        };
    }
}
async function createStatusNotification(songId, songTitle, submittedBy, status, customMessage) {
    try {
        const notificationData = {
            songId,
            songTitle,
            submittedBy: submittedBy.userName,
            submittedByEmail: submittedBy.email,
            type: status,
            message: customMessage || 'Your song "'.concat(songTitle, '" has been ').concat(status),
            read: false,
            createdAt: new Date().toISOString(),
            timestamp: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["serverTimestamp"])()
        };
        const notificationsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], SONG_NOTIFICATIONS_COLLECTION);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addDoc"])(notificationsRef, notificationData);
    } catch (error) {
        console.error('Error creating status notification:', error);
    }
}
async function getUnreadNotifications(zoneId, isHQGroup) {
    try {
        const notificationsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], SONG_NOTIFICATIONS_COLLECTION);
        const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])(notificationsRef, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('read', '==', false), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('type', '==', 'new_submission'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["orderBy"])('timestamp', 'desc'));
        const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
        let notifications = snapshot.docs.map((docSnap)=>{
            var _data_timestamp_toDate, _data_timestamp_toDate1, _data_timestamp;
            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data,
                zoneId: data.zoneId || 'unknown',
                createdAt: data.createdAt || ((_data_timestamp = data.timestamp) === null || _data_timestamp === void 0 ? void 0 : (_data_timestamp_toDate1 = _data_timestamp.toDate) === null || _data_timestamp_toDate1 === void 0 ? void 0 : (_data_timestamp_toDate = _data_timestamp_toDate1.call(_data_timestamp)) === null || _data_timestamp_toDate === void 0 ? void 0 : _data_timestamp_toDate.toISOString()) || new Date().toISOString()
            };
        });
        if (zoneId && !isHQGroup) {
            notifications = notifications.filter((n)=>n.zoneId === zoneId);
        }
        return notifications;
    } catch (error) {
        console.error('Error getting notifications:', error);
        return [];
    }
}
async function markNotificationAsRead(notificationId) {
    try {
        const notificationRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], SONG_NOTIFICATIONS_COLLECTION, notificationId);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateDoc"])(notificationRef, {
            read: true
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
}
async function markSubmissionSeen(submissionId, adminName) {
    try {
        const submissionRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], SUBMITTED_SONGS_COLLECTION, submissionId);
        const submissionDoc = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDoc"])(submissionRef);
        if (!submissionDoc.exists()) throw new Error('Submission not found');
        const submissionData = submissionDoc.data();
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateDoc"])(submissionRef, {
            adminSeen: true,
            updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["serverTimestamp"])()
        });
        await createStatusNotification(submissionId, submissionData.title, submissionData.submittedBy, 'seen', "".concat(adminName, " has seen your submission"));
        return {
            success: true
        };
    } catch (error) {
        console.error('Error marking seen:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to mark seen'
        };
    }
}
async function replyToSubmission(submissionId, adminName, message) {
    try {
        const submissionRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], SUBMITTED_SONGS_COLLECTION, submissionId);
        const submissionDoc = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDoc"])(submissionRef);
        if (!submissionDoc.exists()) throw new Error('Submission not found');
        const submissionData = submissionDoc.data();
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateDoc"])(submissionRef, {
            replyMessage: message,
            updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["serverTimestamp"])()
        });
        await createStatusNotification(submissionId, submissionData.title, submissionData.submittedBy, 'replied', "".concat(adminName, " replied: ").concat(message));
        return {
            success: true
        };
    } catch (error) {
        console.error('Error replying to submission:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to reply'
        };
    }
}
async function getUserSubmissions(userId) {
    try {
        const submissionsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], SUBMITTED_SONGS_COLLECTION);
        const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])(submissionsRef, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('submittedBy.userId', '==', userId), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["orderBy"])('createdAt', 'desc'));
        const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
        return snapshot.docs.map((docSnap)=>{
            var _data_createdAt_toDate, _data_createdAt_toDate1, _data_createdAt, _data_updatedAt_toDate, _data_updatedAt_toDate1, _data_updatedAt;
            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data,
                zoneId: data.zoneId || 'unknown',
                createdAt: ((_data_createdAt = data.createdAt) === null || _data_createdAt === void 0 ? void 0 : (_data_createdAt_toDate1 = _data_createdAt.toDate) === null || _data_createdAt_toDate1 === void 0 ? void 0 : (_data_createdAt_toDate = _data_createdAt_toDate1.call(_data_createdAt)) === null || _data_createdAt_toDate === void 0 ? void 0 : _data_createdAt_toDate.toISOString()) || data.createdAt || new Date().toISOString(),
                updatedAt: ((_data_updatedAt = data.updatedAt) === null || _data_updatedAt === void 0 ? void 0 : (_data_updatedAt_toDate1 = _data_updatedAt.toDate) === null || _data_updatedAt_toDate1 === void 0 ? void 0 : (_data_updatedAt_toDate = _data_updatedAt_toDate1.call(_data_updatedAt)) === null || _data_updatedAt_toDate === void 0 ? void 0 : _data_updatedAt_toDate.toISOString()) || data.updatedAt || new Date().toISOString()
            };
        });
    } catch (error) {
        console.error('Error getting user submissions:', error);
        return [];
    }
}
async function getUserSubmissionsByEmail(userEmail) {
    try {
        if (!userEmail) return [];
        const allSubmissions = await getAllSubmittedSongs(undefined, true);
        const lower = userEmail.toLowerCase();
        return allSubmissions.filter((sub)=>{
            var _sub_submittedBy;
            return (((_sub_submittedBy = sub.submittedBy) === null || _sub_submittedBy === void 0 ? void 0 : _sub_submittedBy.email) || '').toLowerCase() === lower;
        });
    } catch (error) {
        console.error('Error getting user submissions by email:', error);
        return [];
    }
}
async function getUserSongNotifications(userEmail) {
    try {
        const notificationsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], SONG_NOTIFICATIONS_COLLECTION);
        const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])(notificationsRef, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('submittedByEmail', '==', userEmail), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('type', 'in', [
            'approved',
            'rejected',
            'replied'
        ]), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["orderBy"])('timestamp', 'desc'));
        const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
        return snapshot.docs.map((docSnap)=>{
            var _data_timestamp_toDate, _data_timestamp_toDate1, _data_timestamp;
            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data,
                createdAt: data.createdAt || ((_data_timestamp = data.timestamp) === null || _data_timestamp === void 0 ? void 0 : (_data_timestamp_toDate1 = _data_timestamp.toDate) === null || _data_timestamp_toDate1 === void 0 ? void 0 : (_data_timestamp_toDate = _data_timestamp_toDate1.call(_data_timestamp)) === null || _data_timestamp_toDate === void 0 ? void 0 : _data_timestamp_toDate.toISOString()) || new Date().toISOString()
            };
        });
    } catch (error) {
        console.error('Error getting user notifications:', error);
        return [];
    }
}
async function deleteUserSubmission(submissionId, userId) {
    try {
        const submissionRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], SUBMITTED_SONGS_COLLECTION, submissionId);
        const submissionDoc = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDoc"])(submissionRef);
        if (!submissionDoc.exists()) return {
            success: false,
            error: 'Submission not found'
        };
        const submissionData = submissionDoc.data();
        if (submissionData.submittedBy.userId !== userId) {
            return {
                success: false,
                error: 'You can only delete your own submissions'
            };
        }
        if (submissionData.status !== 'pending') {
            return {
                success: false,
                error: 'Can only delete pending submissions'
            };
        }
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deleteDoc"])(submissionRef);
        return {
            success: true
        };
    } catch (error) {
        console.error('Error deleting submission:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to delete submission'
        };
    }
}
async function deleteSubmissionAsAdmin(submissionId) {
    try {
        const submissionRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], SUBMITTED_SONGS_COLLECTION, submissionId);
        const submissionDoc = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDoc"])(submissionRef);
        if (!submissionDoc.exists()) return {
            success: false,
            error: 'Submission not found'
        };
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deleteDoc"])(submissionRef);
        return {
            success: true
        };
    } catch (error) {
        console.error('Error deleting submission:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to delete submission'
        };
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
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
"[project]/src/lib/subgroup-service.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Sub-Group Service
 * Handles sub-group creation, approval, and management
 * 
 * Flow:
 * 1. Member requests to create a sub-group (status: 'pending')
 * 2. Zone Coordinator approves (status: 'approved_pending_payment')
 * 3. Sub-Group Coordinator pays (status: 'active')
 */ __turbopack_context__.s([
    "SubGroupService",
    ()=>SubGroupService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase-database.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$firestore$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/firestore/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/firebase/node_modules/@firebase/firestore/dist/index.esm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase-setup.ts [app-client] (ecmascript)");
;
;
;
class SubGroupService {
    /**
   * Create a sub-group request (Member action)
   */ static async requestSubGroup(zoneId, requesterId, requesterName, requesterEmail, request) {
        try {
            console.log('📝 Creating sub-group request:', request.name);
            // Check if user already has a pending request in this zone
            const existingRequests = await this.getUserSubGroupRequests(zoneId, requesterId);
            const hasPending = existingRequests.some((r)=>r.status === 'pending');
            if (hasPending) {
                return {
                    success: false,
                    error: 'You already have a pending sub-group request in this zone'
                };
            }
            const subGroupData = {
                zoneId,
                name: request.name.trim(),
                type: request.type,
                description: request.description.trim(),
                coordinatorId: requesterId,
                coordinatorName: requesterName,
                coordinatorEmail: requesterEmail,
                memberIds: [
                    requesterId
                ],
                status: 'pending',
                estimatedMembers: request.estimatedMembers,
                createdAt: new Date()
            };
            const result = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].addDocument('subgroups', subGroupData);
            if (result.success && result.id) {
                console.log('✅ Sub-group request created:', result.id);
                // Send notification to Zone Coordinator
                await this.notifyZoneCoordinator(zoneId, request.name, requesterName);
                return {
                    success: true,
                    id: result.id
                };
            }
            return {
                success: false,
                error: 'Failed to create request'
            };
        } catch (error) {
            console.error('❌ Error creating sub-group request:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
   * Get all sub-groups for a zone (Zone Coordinator view)
   */ static async getZoneSubGroups(zoneId) {
        try {
            console.log('📚 Getting sub-groups for zone:', zoneId);
            const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'subgroups'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('zoneId', '==', zoneId), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["orderBy"])('createdAt', 'desc'));
            const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
            const subGroups = snapshot.docs.map((doc)=>{
                var _doc_data_createdAt_toDate, _doc_data_createdAt, _doc_data_approvedAt_toDate, _doc_data_approvedAt, _doc_data_activatedAt_toDate, _doc_data_activatedAt, _doc_data_rejectedAt_toDate, _doc_data_rejectedAt;
                return {
                    id: doc.id,
                    ...doc.data(),
                    createdAt: ((_doc_data_createdAt = doc.data().createdAt) === null || _doc_data_createdAt === void 0 ? void 0 : (_doc_data_createdAt_toDate = _doc_data_createdAt.toDate) === null || _doc_data_createdAt_toDate === void 0 ? void 0 : _doc_data_createdAt_toDate.call(_doc_data_createdAt)) || new Date(doc.data().createdAt),
                    approvedAt: ((_doc_data_approvedAt = doc.data().approvedAt) === null || _doc_data_approvedAt === void 0 ? void 0 : (_doc_data_approvedAt_toDate = _doc_data_approvedAt.toDate) === null || _doc_data_approvedAt_toDate === void 0 ? void 0 : _doc_data_approvedAt_toDate.call(_doc_data_approvedAt)) || (doc.data().approvedAt ? new Date(doc.data().approvedAt) : undefined),
                    activatedAt: ((_doc_data_activatedAt = doc.data().activatedAt) === null || _doc_data_activatedAt === void 0 ? void 0 : (_doc_data_activatedAt_toDate = _doc_data_activatedAt.toDate) === null || _doc_data_activatedAt_toDate === void 0 ? void 0 : _doc_data_activatedAt_toDate.call(_doc_data_activatedAt)) || (doc.data().activatedAt ? new Date(doc.data().activatedAt) : undefined),
                    rejectedAt: ((_doc_data_rejectedAt = doc.data().rejectedAt) === null || _doc_data_rejectedAt === void 0 ? void 0 : (_doc_data_rejectedAt_toDate = _doc_data_rejectedAt.toDate) === null || _doc_data_rejectedAt_toDate === void 0 ? void 0 : _doc_data_rejectedAt_toDate.call(_doc_data_rejectedAt)) || (doc.data().rejectedAt ? new Date(doc.data().rejectedAt) : undefined)
                };
            });
            console.log("✅ Found ".concat(subGroups.length, " sub-groups"));
            return subGroups;
        } catch (error) {
            console.error('❌ Error getting zone sub-groups:', error);
            return [];
        }
    }
    /**
   * Get pending sub-group requests for a zone
   */ static async getPendingRequests(zoneId) {
        try {
            const allSubGroups = await this.getZoneSubGroups(zoneId);
            return allSubGroups.filter((sg)=>sg.status === 'pending');
        } catch (error) {
            console.error('❌ Error getting pending requests:', error);
            return [];
        }
    }
    /**
   * Get user's sub-group requests
   */ static async getUserSubGroupRequests(zoneId, userId) {
        try {
            const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'subgroups'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('zoneId', '==', zoneId), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('coordinatorId', '==', userId));
            const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
            return snapshot.docs.map((doc)=>{
                var _doc_data_createdAt_toDate, _doc_data_createdAt;
                return {
                    id: doc.id,
                    ...doc.data(),
                    createdAt: ((_doc_data_createdAt = doc.data().createdAt) === null || _doc_data_createdAt === void 0 ? void 0 : (_doc_data_createdAt_toDate = _doc_data_createdAt.toDate) === null || _doc_data_createdAt_toDate === void 0 ? void 0 : _doc_data_createdAt_toDate.call(_doc_data_createdAt)) || new Date(doc.data().createdAt)
                };
            });
        } catch (error) {
            console.error('❌ Error getting user sub-group requests:', error);
            return [];
        }
    }
    /**
   * Get sub-groups where user is a member
   */ static async getUserSubGroups(userId) {
        try {
            console.log('📚 Getting sub-groups for user:', userId);
            const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'subgroups'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('memberIds', 'array-contains', userId), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('status', '==', 'active'));
            const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
            const subGroups = snapshot.docs.map((doc)=>{
                var _doc_data_createdAt_toDate, _doc_data_createdAt;
                return {
                    id: doc.id,
                    ...doc.data(),
                    createdAt: ((_doc_data_createdAt = doc.data().createdAt) === null || _doc_data_createdAt === void 0 ? void 0 : (_doc_data_createdAt_toDate = _doc_data_createdAt.toDate) === null || _doc_data_createdAt_toDate === void 0 ? void 0 : _doc_data_createdAt_toDate.call(_doc_data_createdAt)) || new Date(doc.data().createdAt)
                };
            });
            console.log("✅ User is member of ".concat(subGroups.length, " sub-groups"));
            return subGroups;
        } catch (error) {
            console.error('❌ Error getting user sub-groups:', error);
            return [];
        }
    }
    /**
   * Get a single sub-group by ID
   */ static async getSubGroup(subGroupId) {
        try {
            const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'subgroups', subGroupId);
            const docSnap = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDoc"])(docRef);
            if (docSnap.exists()) {
                var _data_createdAt_toDate, _data_createdAt;
                const data = docSnap.data();
                return {
                    id: docSnap.id,
                    ...data,
                    createdAt: ((_data_createdAt = data.createdAt) === null || _data_createdAt === void 0 ? void 0 : (_data_createdAt_toDate = _data_createdAt.toDate) === null || _data_createdAt_toDate === void 0 ? void 0 : _data_createdAt_toDate.call(_data_createdAt)) || new Date(data.createdAt)
                };
            }
            return null;
        } catch (error) {
            console.error('❌ Error getting sub-group:', error);
            return null;
        }
    }
    /**
   * Approve a sub-group request (Zone Coordinator action)
   */ static async approveSubGroup(subGroupId, approvedBy, approvedByName) {
        try {
            console.log('✅ Approving sub-group:', subGroupId);
            const subGroup = await this.getSubGroup(subGroupId);
            if (!subGroup) {
                return {
                    success: false,
                    error: 'Sub-group not found'
                };
            }
            if (subGroup.status !== 'pending') {
                return {
                    success: false,
                    error: 'Sub-group is not pending approval'
                };
            }
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].updateDocument('subgroups', subGroupId, {
                status: 'approved_pending_payment',
                approvedAt: new Date(),
                approvedBy,
                approvedByName
            });
            // Notify the requester
            await this.notifyRequester(subGroup.coordinatorId, subGroup.name, 'approved', 'Your sub-group request has been approved! Please complete payment to activate.');
            console.log('✅ Sub-group approved');
            return {
                success: true
            };
        } catch (error) {
            console.error('❌ Error approving sub-group:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
   * Reject a sub-group request (Zone Coordinator action)
   */ static async rejectSubGroup(subGroupId, rejectedBy, rejectedByName, reason) {
        try {
            console.log('❌ Rejecting sub-group:', subGroupId);
            const subGroup = await this.getSubGroup(subGroupId);
            if (!subGroup) {
                return {
                    success: false,
                    error: 'Sub-group not found'
                };
            }
            if (subGroup.status !== 'pending') {
                return {
                    success: false,
                    error: 'Sub-group is not pending approval'
                };
            }
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].updateDocument('subgroups', subGroupId, {
                status: 'rejected',
                rejectionReason: reason,
                rejectedAt: new Date(),
                rejectedBy
            });
            // Notify the requester
            await this.notifyRequester(subGroup.coordinatorId, subGroup.name, 'rejected', "Your sub-group request was not approved. Reason: ".concat(reason));
            console.log('✅ Sub-group rejected');
            return {
                success: true
            };
        } catch (error) {
            console.error('❌ Error rejecting sub-group:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
   * Activate a sub-group after payment (Sub-Group Coordinator action)
   */ static async activateSubGroup(subGroupId) {
        try {
            console.log('🚀 Activating sub-group:', subGroupId);
            const subGroup = await this.getSubGroup(subGroupId);
            if (!subGroup) {
                return {
                    success: false,
                    error: 'Sub-group not found'
                };
            }
            if (subGroup.status !== 'approved_pending_payment') {
                return {
                    success: false,
                    error: 'Sub-group is not approved for activation'
                };
            }
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].updateDocument('subgroups', subGroupId, {
                status: 'active',
                activatedAt: new Date()
            });
            console.log('✅ Sub-group activated');
            return {
                success: true
            };
        } catch (error) {
            console.error('❌ Error activating sub-group:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
   * Check if user is a sub-group coordinator
   */ static async isSubGroupCoordinator(userId) {
        try {
            const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'subgroups'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('coordinatorId', '==', userId), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('status', '==', 'active'));
            const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
            return !snapshot.empty;
        } catch (error) {
            console.error('❌ Error checking sub-group coordinator status:', error);
            return false;
        }
    }
    /**
   * Get sub-groups where user is coordinator
   */ static async getCoordinatedSubGroups(userId) {
        try {
            const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'subgroups'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('coordinatorId', '==', userId), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('status', '==', 'active'));
            const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
            return snapshot.docs.map((doc)=>{
                var _doc_data_createdAt_toDate, _doc_data_createdAt;
                return {
                    id: doc.id,
                    ...doc.data(),
                    createdAt: ((_doc_data_createdAt = doc.data().createdAt) === null || _doc_data_createdAt === void 0 ? void 0 : (_doc_data_createdAt_toDate = _doc_data_createdAt.toDate) === null || _doc_data_createdAt_toDate === void 0 ? void 0 : _doc_data_createdAt_toDate.call(_doc_data_createdAt)) || new Date(doc.data().createdAt)
                };
            });
        } catch (error) {
            console.error('❌ Error getting coordinated sub-groups:', error);
            return [];
        }
    }
    /**
   * Add member to sub-group
   */ static async addMember(subGroupId, memberId) {
        try {
            const subGroup = await this.getSubGroup(subGroupId);
            if (!subGroup) {
                return {
                    success: false,
                    error: 'Sub-group not found'
                };
            }
            if (subGroup.memberIds.includes(memberId)) {
                return {
                    success: false,
                    error: 'User is already a member'
                };
            }
            const updatedMembers = [
                ...subGroup.memberIds,
                memberId
            ];
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].updateDocument('subgroups', subGroupId, {
                memberIds: updatedMembers
            });
            return {
                success: true
            };
        } catch (error) {
            console.error('❌ Error adding member:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
   * Remove member from sub-group
   */ static async removeMember(subGroupId, memberId) {
        try {
            const subGroup = await this.getSubGroup(subGroupId);
            if (!subGroup) {
                return {
                    success: false,
                    error: 'Sub-group not found'
                };
            }
            // Can't remove the coordinator
            if (subGroup.coordinatorId === memberId) {
                return {
                    success: false,
                    error: 'Cannot remove the sub-group coordinator'
                };
            }
            const updatedMembers = subGroup.memberIds.filter((id)=>id !== memberId);
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].updateDocument('subgroups', subGroupId, {
                memberIds: updatedMembers
            });
            return {
                success: true
            };
        } catch (error) {
            console.error('❌ Error removing member:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
   * Update sub-group details
   */ static async updateSubGroup(subGroupId, data) {
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].updateDocument('subgroups', subGroupId, {
                ...data,
                updatedAt: new Date()
            });
            return {
                success: true
            };
        } catch (error) {
            console.error('❌ Error updating sub-group:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    // ============================================
    // NOTIFICATION HELPERS
    // ============================================
    /**
   * Notify Zone Coordinator of new sub-group request
   */ static async notifyZoneCoordinator(zoneId, subGroupName, requesterName) {
        try {
            // Create notification in zone_notifications collection
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].addDocument('zone_notifications', {
                zoneId,
                type: 'subgroup_request',
                title: 'New Sub-Group Request',
                message: "".concat(requesterName, ' has requested to create "').concat(subGroupName, '"'),
                read: false,
                createdAt: new Date()
            });
            console.log('📬 Zone coordinator notified');
        } catch (error) {
            console.error('❌ Error notifying zone coordinator:', error);
        }
    }
    /**
   * Notify requester of approval/rejection
   */ static async notifyRequester(userId, subGroupName, status, message) {
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].addDocument('user_notifications', {
                userId,
                type: "subgroup_".concat(status),
                title: status === 'approved' ? 'Sub-Group Approved!' : 'Sub-Group Request Update',
                message,
                subGroupName,
                read: false,
                createdAt: new Date()
            });
            console.log('📬 Requester notified');
        } catch (error) {
            console.error('❌ Error notifying requester:', error);
        }
    }
    /**
   * Get pending request count for zone (for badge display)
   */ static async getPendingRequestCount(zoneId) {
        try {
            const pending = await this.getPendingRequests(zoneId);
            return pending.length;
        } catch (error) {
            console.error('❌ Error getting pending count:', error);
            return 0;
        }
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/simplified-analytics-service.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SimplifiedAnalyticsService",
    ()=>SimplifiedAnalyticsService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$firestore$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/firestore/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/firebase/node_modules/@firebase/firestore/dist/index.esm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase-setup.ts [app-client] (ecmascript)");
;
;
class SimplifiedAnalyticsService {
    static getMonthlyDocId(year, month) {
        return "".concat(year, "-").concat(String(month + 1).padStart(2, '0'));
    }
    static async incrementSignups() {
        let count = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 1;
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const docId = this.getMonthlyDocId(year, month);
        const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'simplified_analytics', docId);
        const updateData = {
            totalSignups: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["increment"])(count),
            updatedAt: new Date()
        };
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateDoc"])(docRef, updateData);
        } catch (error) {
            // If document doesn't exist, create it
            const newRecord = {
                id: docId,
                year,
                month,
                totalSignups: count,
                totalLogins: 0,
                totalFeatureEngagements: 0,
                totalSongMinistries: 0,
                uniqueUsers: 0,
                pageViews: {},
                countries: {},
                cities: {},
                browsers: {},
                featureEngagements: {},
                songMinistries: {},
                updatedAt: new Date(),
                createdAt: new Date()
            };
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setDoc"])(docRef, newRecord);
        }
    }
    static async incrementLogins() {
        let count = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 1;
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const docId = this.getMonthlyDocId(year, month);
        const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'simplified_analytics', docId);
        const updateData = {
            totalLogins: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["increment"])(count),
            updatedAt: new Date()
        };
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateDoc"])(docRef, updateData);
        } catch (error) {
            // If document doesn't exist, create it
            const newRecord = {
                id: docId,
                year,
                month,
                totalSignups: 0,
                totalLogins: count,
                totalFeatureEngagements: 0,
                totalSongMinistries: 0,
                uniqueUsers: 0,
                pageViews: {},
                countries: {},
                cities: {},
                browsers: {},
                featureEngagements: {},
                songMinistries: {},
                updatedAt: new Date(),
                createdAt: new Date()
            };
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setDoc"])(docRef, newRecord);
        }
    }
    static async incrementFeatureEngagements(featureName) {
        let count = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1;
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const docId = this.getMonthlyDocId(year, month);
        const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'simplified_analytics', docId);
        const updateData = {
            totalFeatureEngagements: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["increment"])(count),
            ["featureEngagements.".concat(featureName.replace(/\./g, '_'))]: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["increment"])(count),
            updatedAt: new Date()
        };
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateDoc"])(docRef, updateData);
        } catch (error) {
            // If document doesn't exist, create it
            const newRecord = {
                id: docId,
                year,
                month,
                totalSignups: 0,
                totalLogins: 0,
                totalFeatureEngagements: count,
                totalSongMinistries: 0,
                uniqueUsers: 0,
                pageViews: {},
                countries: {},
                cities: {},
                browsers: {},
                featureEngagements: {
                    [featureName.replace(/\./g, '_')]: count
                },
                songMinistries: {},
                updatedAt: new Date(),
                createdAt: new Date()
            };
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setDoc"])(docRef, newRecord);
        }
    }
    static async incrementSongMinistries(songId, songTitle) {
        let count = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 1;
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const docId = this.getMonthlyDocId(year, month);
        const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'simplified_analytics', docId);
        const updateData = {
            totalSongMinistries: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["increment"])(count),
            ["songMinistries.".concat(songId.replace(/\./g, '_'))]: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["increment"])(count),
            updatedAt: new Date()
        };
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateDoc"])(docRef, updateData);
        } catch (error) {
            // If document doesn't exist, create it
            const newRecord = {
                id: docId,
                year,
                month,
                totalSignups: 0,
                totalLogins: 0,
                totalFeatureEngagements: 0,
                totalSongMinistries: count,
                uniqueUsers: 0,
                pageViews: {},
                countries: {},
                cities: {},
                browsers: {},
                featureEngagements: {},
                songMinistries: {
                    [songId.replace(/\./g, '_')]: count
                },
                updatedAt: new Date(),
                createdAt: new Date()
            };
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setDoc"])(docRef, newRecord);
        }
    }
    static async getMonthlySummary(year, month) {
        const docId = this.getMonthlyDocId(year, month);
        const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'simplified_analytics', docId);
        const docSnap = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDoc"])(docRef);
        if (!docSnap.exists()) return null;
        const data = docSnap.data();
        return {
            id: docId,
            year: data.year,
            month: data.month,
            totalSignups: data.totalSignups || 0,
            totalLogins: data.totalLogins || 0,
            totalFeatureEngagements: data.totalFeatureEngagements || 0,
            totalSongMinistries: data.totalSongMinistries || 0,
            uniqueUsers: data.uniqueUsers || 0,
            pageViews: data.pageViews || {},
            countries: data.countries || {},
            cities: data.cities || {},
            browsers: data.browsers || {},
            featureEngagements: data.featureEngagements || {},
            songMinistries: data.songMinistries || {},
            updatedAt: data.updatedAt.toDate ? data.updatedAt.toDate() : data.updatedAt,
            createdAt: data.createdAt.toDate ? data.createdAt.toDate() : data.createdAt
        };
    }
    static async getAllMonthlySummaries() {
        try {
            const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'simplified_analytics'));
            const records = snapshot.docs.map((doc)=>{
                const data = doc.data();
                return {
                    id: doc.id,
                    year: data.year,
                    month: data.month,
                    totalSignups: data.totalSignups || 0,
                    totalLogins: data.totalLogins || 0,
                    totalFeatureEngagements: data.totalFeatureEngagements || 0,
                    totalSongMinistries: data.totalSongMinistries || 0,
                    uniqueUsers: data.uniqueUsers || 0,
                    pageViews: data.pageViews || {},
                    countries: data.countries || {},
                    cities: data.cities || {},
                    browsers: data.browsers || {},
                    featureEngagements: data.featureEngagements || {},
                    songMinistries: data.songMinistries || {},
                    updatedAt: data.updatedAt.toDate ? data.updatedAt.toDate() : data.updatedAt,
                    createdAt: data.createdAt.toDate ? data.createdAt.toDate() : data.createdAt
                };
            });
            return records.sort((a, b)=>{
                if (a.year !== b.year) return b.year - a.year;
                return b.month - a.month;
            });
        } catch (error) {
            console.error('Error fetching monthly summaries:', error);
            return [];
        }
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/song-ministry-service.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SongMinistryService",
    ()=>SongMinistryService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$firestore$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/firestore/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/firebase/node_modules/@firebase/firestore/dist/index.esm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase-setup.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$pages$2f$audiolab$2f$_lib$2f$song$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/pages/audiolab/_lib/song-service.ts [app-client] (ecmascript)");
;
;
;
class SongMinistryService {
    static getMonthlyDocId(year, month) {
        return "".concat(year, "-").concat(String(month + 1).padStart(2, '0'));
    }
    static async logSongMinistry(songId, songTitle, programType, programDate, zoneId, notes) {
        try {
            const now = new Date();
            const date = new Date(programDate);
            const year = date.getFullYear();
            const month = date.getMonth();
            // Create the ministry record
            const record = {
                songId,
                songTitle,
                date: now,
                programType,
                programDate,
                month,
                year,
                zoneId,
                createdBy: 'admin',
                createdAt: now,
                notes
            };
            // Add to the main collection
            const docRef = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'song_ministries'), record);
            // Update the monthly summary
            await this.updateMonthlySummary(songId, year, month);
            return {
                success: true,
                id: docRef.id
            };
        } catch (error) {
            console.error('Error logging song ministry:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    static async updateMonthlySummary(songId, year, month) {
        const docId = this.getMonthlyDocId(year, month);
        const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'song_ministry_summaries', docId);
        const updateData = {
            ["songMinistries.".concat(songId.replace(/\./g, '_'))]: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["increment"])(1),
            totalMinistries: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["increment"])(1),
            updatedAt: new Date()
        };
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateDoc"])(docRef, updateData);
        } catch (error) {
            // If document doesn't exist, create it
            const newSummary = {
                year,
                month,
                songMinistries: {
                    [songId.replace(/\./g, '_')]: 1
                },
                totalMinistries: 1,
                updatedAt: new Date(),
                createdAt: new Date()
            };
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setDoc"])(docRef, newSummary);
        }
    }
    static async getMonthlySummary(year, month) {
        const docId = this.getMonthlyDocId(year, month);
        const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'song_ministry_summaries', docId);
        const docSnap = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDoc"])(docRef);
        if (!docSnap.exists()) return null;
        const data = docSnap.data();
        return {
            year: data.year,
            month: data.month,
            songMinistries: data.songMinistries || {},
            totalMinistries: data.totalMinistries || 0,
            updatedAt: data.updatedAt.toDate ? data.updatedAt.toDate() : data.updatedAt,
            createdAt: data.createdAt.toDate ? data.createdAt.toDate() : data.createdAt
        };
    }
    static async getAllMonthlySummaries() {
        try {
            const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'song_ministry_summaries'));
            const summaries = snapshot.docs.map((doc)=>{
                const data = doc.data();
                return {
                    year: data.year,
                    month: data.month,
                    songMinistries: data.songMinistries || {},
                    totalMinistries: data.totalMinistries || 0,
                    updatedAt: data.updatedAt.toDate ? data.updatedAt.toDate() : data.updatedAt,
                    createdAt: data.createdAt.toDate ? data.createdAt.toDate() : data.createdAt
                };
            });
            return summaries.sort((a, b)=>{
                if (a.year !== b.year) return b.year - a.year;
                return b.month - a.month;
            });
        } catch (error) {
            console.error('Error fetching monthly summaries:', error);
            return [];
        }
    }
    static async getMinistriesForSong(songId, startDate, endDate) {
        try {
            let q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'song_ministries'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('songId', '==', songId));
            if (startDate && endDate) {
                q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])(q, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('programDate', '>=', startDate.toISOString().split('T')[0]), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('programDate', '<=', endDate.toISOString().split('T')[0]));
            }
            q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])(q, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["orderBy"])('programDate', 'desc'));
            const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
            return snapshot.docs.map((doc)=>{
                const data = doc.data();
                return {
                    id: doc.id,
                    songId: data.songId,
                    songTitle: data.songTitle,
                    date: data.date.toDate ? data.date.toDate() : data.date,
                    programType: data.programType,
                    programDate: data.programDate,
                    month: data.month,
                    year: data.year,
                    zoneId: data.zoneId,
                    createdBy: data.createdBy,
                    createdAt: data.createdAt.toDate ? data.createdAt.toDate() : data.createdAt,
                    notes: data.notes
                };
            });
        } catch (error) {
            console.error('Error fetching song ministries:', error);
            return [];
        }
    }
    static async getMostMinisteredSongs(startDate, endDate) {
        try {
            let q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'song_ministries'));
            if (startDate && endDate) {
                q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])(q, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('programDate', '>=', startDate.toISOString().split('T')[0]), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('programDate', '<=', endDate.toISOString().split('T')[0]));
            }
            const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
            const songCounts = {};
            snapshot.docs.forEach((doc)=>{
                const data = doc.data();
                const songId = data.songId;
                if (songCounts[songId]) {
                    songCounts[songId].count++;
                } else {
                    songCounts[songId] = {
                        songTitle: data.songTitle,
                        count: 1
                    };
                }
            });
            return Object.entries(songCounts).map((param)=>{
                let [songId, info] = param;
                return {
                    songId,
                    songTitle: info.songTitle,
                    count: info.count
                };
            }).sort((a, b)=>b.count - a.count);
        } catch (error) {
            console.error('Error fetching most ministered songs:', error);
            return [];
        }
    }
    static async getAllSongs() {
        try {
            const songs = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$pages$2f$audiolab$2f$_lib$2f$song$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAllMasterSongs"])();
            return songs.map((song)=>({
                    id: song.id,
                    title: song.title,
                    artist: song.artist
                }));
        } catch (error) {
            console.error('Error fetching all songs:', error);
            return [];
        }
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_lib_b2faf832._.js.map