(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/utils/offlineManager.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Offline Data Manager for LWSRH
__turbopack_context__.s([
    "OfflineManager",
    ()=>OfflineManager,
    "offlineManager",
    ()=>offlineManager
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_define_property.js [app-client] (ecmascript)");
;
class OfflineManager {
    static getInstance() {
        if (!OfflineManager.instance) {
            OfflineManager.instance = new OfflineManager();
        }
        return OfflineManager.instance;
    }
    setupEventListeners() {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        window.addEventListener('online', ()=>{
            console.log('Connection restored - syncing data...');
            this.isOnline = true;
            this.syncPendingUpdates();
        });
        window.addEventListener('offline', ()=>{
            console.log('Connection lost - working offline...');
            this.isOnline = false;
        });
        // Listen for service worker messages
        if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', (event)=>{
                if (event.data.type === 'DATA_SYNCED') {
                    console.log('Data synced from service worker');
                    this.handleDataSync();
                }
            });
        }
    }
    async loadCachedData() {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        try {
            // Load data from localStorage as fallback
            const cachedData = localStorage.getItem('lwsrh-cached-data');
            if (cachedData) {
                const parsed = JSON.parse(cachedData);
                this.dataCache = new Map(Object.entries(parsed));
                console.log('Loaded cached data from localStorage');
            }
        } catch (error) {
            console.error('Failed to load cached data:', error);
        }
    }
    async saveCachedData() {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        try {
            const dataObject = Object.fromEntries(this.dataCache);
            localStorage.setItem('lwsrh-cached-data', JSON.stringify(dataObject));
        } catch (error) {
            console.error('Failed to save cached data:', error);
        }
    }
    // Cache data for offline use
    async cacheData(key, data) {
        // No caching - always fetch fresh data
        return;
    }
    // Get cached data - DISABLED (no caching)
    getCachedData(key) {
        // No caching - always return null to force fresh data
        return null;
    }
    // Check if data is cached
    isDataCached(key) {
        return this.dataCache.has(key);
    }
    // Get data with offline fallback
    async getData(key, fetchFn) {
        // If online and fetch function provided, try to fetch fresh data
        if (this.isOnline && fetchFn) {
            try {
                const freshData = await fetchFn();
                // Cache the fresh data
                await this.cacheData(key, freshData);
                console.log("Fetched and cached fresh data: ".concat(key));
                return freshData;
            } catch (error) {
                console.log("Failed to fetch fresh data for ".concat(key, ", using cache:"), error);
            }
        }
        // Return cached data if available
        const cachedData = this.getCachedData(key);
        if (cachedData) {
            return cachedData;
        }
        // If no cached data and offline, return null
        if (!this.isOnline) {
            console.log("No cached data available for ".concat(key, " and offline"));
            return null;
        }
        return null;
    }
    // Update data with offline support
    async updateData(key, data, updateFn) {
        try {
            if (this.isOnline && updateFn) {
                // Try to update on server
                await updateFn(data);
                // Cache the updated data
                await this.cacheData(key, data);
                console.log("Data updated and cached: ".concat(key));
                return true;
            } else {
                // Store update for later sync
                this.pendingUpdates.push({
                    key,
                    data,
                    timestamp: Date.now()
                });
                // Cache locally
                await this.cacheData(key, data);
                console.log("Data cached for offline sync: ".concat(key));
                return false; // Indicates update is pending
            }
        } catch (error) {
            console.error("Failed to update data for ".concat(key, ":"), error);
            // Still cache locally for offline use
            await this.cacheData(key, data);
            return false;
        }
    }
    // Sync pending updates when online
    async syncPendingUpdates() {
        if (this.pendingUpdates.length === 0) return;
        console.log("Syncing ".concat(this.pendingUpdates.length, " pending updates..."));
        for (const update of this.pendingUpdates){
            try {
                // Here you would implement your actual sync logic
                // For now, we'll just log the update
                console.log("Syncing update for ".concat(update.key, ":"), update.data);
                // Remove from pending after successful sync
                const index = this.pendingUpdates.indexOf(update);
                if (index > -1) {
                    this.pendingUpdates.splice(index, 1);
                }
            } catch (error) {
                console.error("Failed to sync update for ".concat(update.key, ":"), error);
            }
        }
    }
    // Handle data sync from service worker
    handleDataSync() {
        // Refresh data from cache or trigger re-fetch
        console.log('Handling data sync...');
    // You can emit events or call callbacks here to update UI
    }
    // Get connection status
    getConnectionStatus() {
        return this.isOnline;
    }
    // Get pending updates count
    getPendingUpdatesCount() {
        return this.pendingUpdates.length;
    }
    // Clear all cached data
    async clearCache() {
        this.dataCache.clear();
        this.pendingUpdates = [];
        if ("TURBOPACK compile-time truthy", 1) {
            localStorage.removeItem('lwsrh-cached-data');
        }
        console.log('All cached data cleared');
    }
    // Get cache statistics
    getCacheStats() {
        return {
            cachedItems: this.dataCache.size,
            pendingUpdates: this.pendingUpdates.length,
            isOnline: this.isOnline
        };
    }
    constructor(){
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "isOnline", ("TURBOPACK compile-time truthy", 1) ? navigator.onLine : "TURBOPACK unreachable");
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "dataCache", new Map());
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "pendingUpdates", []);
        // Only run in browser environment
        if ("TURBOPACK compile-time truthy", 1) {
            this.isOnline = navigator.onLine;
            this.setupEventListeners();
            this.loadCachedData();
        }
    }
}
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(OfflineManager, "instance", void 0);
const offlineManager = OfflineManager.getInstance();
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_utils_offlineManager_ts_87bb1211._.js.map