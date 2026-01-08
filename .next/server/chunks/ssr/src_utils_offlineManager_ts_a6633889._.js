module.exports = [
"[project]/src/utils/offlineManager.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Offline Data Manager for LWSRH
__turbopack_context__.s([
    "OfflineManager",
    ()=>OfflineManager,
    "offlineManager",
    ()=>offlineManager
]);
class OfflineManager {
    static instance;
    isOnline = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : true;
    dataCache = new Map();
    pendingUpdates = [];
    constructor(){
        // Only run in browser environment
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
    }
    static getInstance() {
        if (!OfflineManager.instance) {
            OfflineManager.instance = new OfflineManager();
        }
        return OfflineManager.instance;
    }
    setupEventListeners() {
        if ("TURBOPACK compile-time truthy", 1) return;
        //TURBOPACK unreachable
        ;
    }
    async loadCachedData() {
        if ("TURBOPACK compile-time truthy", 1) return;
        //TURBOPACK unreachable
        ;
    }
    async saveCachedData() {
        if ("TURBOPACK compile-time truthy", 1) return;
        //TURBOPACK unreachable
        ;
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
                console.log(`Fetched and cached fresh data: ${key}`);
                return freshData;
            } catch (error) {
                console.log(`Failed to fetch fresh data for ${key}, using cache:`, error);
            }
        }
        // Return cached data if available
        const cachedData = this.getCachedData(key);
        if (cachedData) {
            return cachedData;
        }
        // If no cached data and offline, return null
        if (!this.isOnline) {
            console.log(`No cached data available for ${key} and offline`);
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
                console.log(`Data updated and cached: ${key}`);
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
                console.log(`Data cached for offline sync: ${key}`);
                return false; // Indicates update is pending
            }
        } catch (error) {
            console.error(`Failed to update data for ${key}:`, error);
            // Still cache locally for offline use
            await this.cacheData(key, data);
            return false;
        }
    }
    // Sync pending updates when online
    async syncPendingUpdates() {
        if (this.pendingUpdates.length === 0) return;
        console.log(`Syncing ${this.pendingUpdates.length} pending updates...`);
        for (const update of this.pendingUpdates){
            try {
                // Here you would implement your actual sync logic
                // For now, we'll just log the update
                console.log(`Syncing update for ${update.key}:`, update.data);
                // Remove from pending after successful sync
                const index = this.pendingUpdates.indexOf(update);
                if (index > -1) {
                    this.pendingUpdates.splice(index, 1);
                }
            } catch (error) {
                console.error(`Failed to sync update for ${update.key}:`, error);
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
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
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
}
const offlineManager = OfflineManager.getInstance();
}),
];

//# sourceMappingURL=src_utils_offlineManager_ts_a6633889._.js.map