(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/utils/media-cache.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Media caching utility with zone-specific support
__turbopack_context__.s([
    "MediaCache",
    ()=>MediaCache
]);
const CACHE_KEY_BASE = 'media-cache';
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes (media changes less frequently)
;
// Get cache key with optional zone suffix
function getCacheKey(zoneType) {
    return zoneType ? "".concat(CACHE_KEY_BASE, "-").concat(zoneType) : CACHE_KEY_BASE;
}
class MediaCache {
    // Save media to localStorage (with optional zone-specific key)
    static saveMedia(media, zoneType) {
        try {
            const cached = {
                data: media,
                timestamp: Date.now()
            };
            const key = getCacheKey(zoneType);
            localStorage.setItem(key, JSON.stringify(cached));
            console.log("💾 Cached ".concat(media.length, " media items (").concat(zoneType || 'default', ")"));
        } catch (error) {
            console.error('Failed to cache media:', error);
        }
    }
    // Load media from localStorage (with optional zone-specific key)
    static loadMedia(zoneType) {
        try {
            const key = getCacheKey(zoneType);
            const cached = localStorage.getItem(key);
            if (!cached) {
                console.log("📭 No cached media found (".concat(zoneType || 'default', ")"));
                return null;
            }
            const parsed = JSON.parse(cached);
            // Check if cache is still valid
            const age = Date.now() - parsed.timestamp;
            if (age > CACHE_DURATION) {
                console.log("⏰ Cached media expired (".concat(zoneType || 'default', ")"));
                this.clearMedia(zoneType);
                return null;
            }
            console.log("⚡ Cache hit: ".concat(parsed.data.length, " media items loaded instantly (").concat(zoneType || 'default', ")"));
            return parsed.data;
        } catch (error) {
            console.error('Failed to load cached media:', error);
            return null;
        }
    }
    // Clear cached media (with optional zone-specific key)
    static clearMedia(zoneType) {
        try {
            const key = getCacheKey(zoneType);
            localStorage.removeItem(key);
            console.log("🗑️ Cleared cached media (".concat(zoneType || 'default', ")"));
        } catch (error) {
            console.error('Failed to clear cached media:', error);
        }
    }
    // Clear all media caches (both HQ and regular)
    static clearAllMedia() {
        try {
            localStorage.removeItem(getCacheKey());
            localStorage.removeItem(getCacheKey('hq'));
            localStorage.removeItem(getCacheKey('regular'));
            console.log('🗑️ Cleared all cached media');
        } catch (error) {
            console.error('Failed to clear all cached media:', error);
        }
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_utils_media-cache_ts_4b88c896._.js.map