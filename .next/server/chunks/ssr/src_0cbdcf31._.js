module.exports = [
"[project]/src/hooks/useAdminData.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useAdminData",
    ()=>useAdminData
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase-database.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$zone$2d$database$2d$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/zone-database-service.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$praise$2d$night$2d$songs$2d$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/praise-night-songs-service.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/config/zones.ts [app-ssr] (ecmascript)");
;
;
;
;
;
let adminDataCache = null;
const CACHE_DURATION = 30000;
async function fetchAdminData(zoneId) {
    try {
        let pages = [];
        if (zoneId && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isHQGroup"])(zoneId)) {
            pages = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].getCollection('praise_nights');
        } else if (zoneId) {
            pages = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$zone$2d$database$2d$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ZoneDatabaseService"].getPraiseNightsByZone(zoneId, 1000);
        } else {
            pages = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].getCollection('praise_nights');
        }
        if (pages.length === 0) return [];
        return pages.map((page)=>({
                id: page.id,
                firebaseId: page.id,
                name: page.name || page.title || 'Untitled Page',
                date: page.date || new Date().toISOString(),
                location: page.location || '',
                category: page.category || 'ongoing',
                pageCategory: page.pageCategory || undefined,
                bannerImage: page.bannerImage || '',
                countdown: {
                    days: page.countdownDays || page.countdown?.days || 0,
                    hours: page.countdownHours || page.countdown?.hours || 0,
                    minutes: page.countdownMinutes || page.countdown?.minutes || 0,
                    seconds: page.countdownSeconds || page.countdown?.seconds || 0
                },
                songs: []
            }));
    } catch (error) {
        console.error('Admin: Error fetching data:', error);
        throw error;
    }
}
async function fetchPageSongs(pageId, zoneId) {
    try {
        return await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$praise$2d$night$2d$songs$2d$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PraiseNightSongsService"].getSongsByPraiseNight(pageId, zoneId);
    } catch (error) {
        console.error(`Error fetching songs for page ${pageId}:`, error);
        return [];
    }
}
function useAdminData() {
    const [pages, setPages] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [currentZoneId, setCurrentZoneId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(undefined);
    const loadData = async ()=>{
        try {
            setError(null);
            if (adminDataCache && Date.now() - adminDataCache.timestamp < CACHE_DURATION && adminDataCache.zoneId === currentZoneId) {
                setPages(adminDataCache.pages);
                setLoading(false);
                return;
            }
            const freshPages = await fetchAdminData(currentZoneId);
            adminDataCache = {
                pages: freshPages,
                timestamp: Date.now(),
                songs: new Map(),
                zoneId: currentZoneId
            };
            setPages(freshPages);
        } catch (err) {
            console.error('Admin: Failed to load data:', err);
            setError(err instanceof Error ? err.message : 'Failed to load data');
        } finally{
            setLoading(false);
        }
    };
    const refreshData = async ()=>{
        adminDataCache = null;
        setLoading(true);
        await loadData();
    };
    const getCurrentPage = (id)=>{
        return pages.find((page)=>page.id === id) || null;
    };
    const getCurrentSongs = async (pageId, forceRefresh = false)=>{
        if (!forceRefresh && adminDataCache?.songs.has(pageId)) {
            return adminDataCache.songs.get(pageId);
        }
        if (forceRefresh && adminDataCache?.songs.has(pageId)) {
            adminDataCache.songs.delete(pageId);
        }
        const songs = await fetchPageSongs(pageId, currentZoneId);
        if (adminDataCache) {
            adminDataCache.songs.set(pageId, songs);
        }
        return songs;
    };
    const setZoneId = (zoneId)=>{
        setCurrentZoneId(zoneId);
        adminDataCache = null;
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (currentZoneId) {
            loadData();
        }
    }, [
        currentZoneId
    ]);
    return {
        pages,
        loading,
        error,
        refreshData,
        getCurrentPage,
        getCurrentSongs,
        setZoneId
    };
}
}),
"[project]/src/hooks/useSubGroup.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useSubGroup",
    ()=>useSubGroup,
    "useZoneSubGroups",
    ()=>useZoneSubGroups
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useAuth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useAuth.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useZone$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useZone.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$subgroup$2d$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/subgroup-service.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
function useSubGroup() {
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useAuth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuth"])();
    const { currentZone } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useZone$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useZone"])();
    const [isSubGroupCoordinator, setIsSubGroupCoordinator] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [coordinatedSubGroups, setCoordinatedSubGroups] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [memberSubGroups, setMemberSubGroups] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [userRequests, setUserRequests] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const loadSubGroupData = async ()=>{
            if (!user?.uid) {
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            try {
                const [isCoordinator, coordinated, memberOf] = await Promise.all([
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$subgroup$2d$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SubGroupService"].isSubGroupCoordinator(user.uid),
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$subgroup$2d$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SubGroupService"].getCoordinatedSubGroups(user.uid),
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$subgroup$2d$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SubGroupService"].getUserSubGroups(user.uid)
                ]);
                setIsSubGroupCoordinator(isCoordinator);
                setCoordinatedSubGroups(coordinated);
                setMemberSubGroups(memberOf);
                if (currentZone) {
                    const requests = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$subgroup$2d$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SubGroupService"].getUserSubGroupRequests(currentZone.id, user.uid);
                    setUserRequests(requests);
                }
            } catch (error) {
                console.error('Error loading sub-group data:', error);
            } finally{
                setIsLoading(false);
            }
        };
        loadSubGroupData();
    }, [
        user?.uid,
        currentZone?.id
    ]);
    const requestSubGroup = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (request, requesterName, requesterEmail)=>{
        if (!user?.uid || !currentZone) {
            return {
                success: false,
                error: 'Not authenticated or no zone selected'
            };
        }
        const result = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$subgroup$2d$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SubGroupService"].requestSubGroup(currentZone.id, user.uid, requesterName, requesterEmail, request);
        if (result.success) {
            const requests = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$subgroup$2d$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SubGroupService"].getUserSubGroupRequests(currentZone.id, user.uid);
            setUserRequests(requests);
        }
        return result;
    }, [
        user?.uid,
        currentZone
    ]);
    const refresh = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        if (!user?.uid) return;
        const [isCoordinator, coordinated, memberOf] = await Promise.all([
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$subgroup$2d$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SubGroupService"].isSubGroupCoordinator(user.uid),
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$subgroup$2d$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SubGroupService"].getCoordinatedSubGroups(user.uid),
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$subgroup$2d$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SubGroupService"].getUserSubGroups(user.uid)
        ]);
        setIsSubGroupCoordinator(isCoordinator);
        setCoordinatedSubGroups(coordinated);
        setMemberSubGroups(memberOf);
        if (currentZone) {
            const requests = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$subgroup$2d$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SubGroupService"].getUserSubGroupRequests(currentZone.id, user.uid);
            setUserRequests(requests);
        }
    }, [
        user?.uid,
        currentZone
    ]);
    return {
        isSubGroupCoordinator,
        coordinatedSubGroups,
        memberSubGroups,
        userRequests,
        isLoading,
        requestSubGroup,
        refresh
    };
}
function useZoneSubGroups() {
    const { user, profile } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useAuth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuth"])();
    const { currentZone, isZoneCoordinator } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useZone$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useZone"])();
    const [subGroups, setSubGroups] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [pendingCount, setPendingCount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const loadSubGroups = async ()=>{
            if (!currentZone || !isZoneCoordinator) {
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            try {
                const [groups, count] = await Promise.all([
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$subgroup$2d$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SubGroupService"].getZoneSubGroups(currentZone.id),
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$subgroup$2d$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SubGroupService"].getPendingRequestCount(currentZone.id)
                ]);
                setSubGroups(groups);
                setPendingCount(count);
            } catch (error) {
                console.error('Error loading zone sub-groups:', error);
            } finally{
                setIsLoading(false);
            }
        };
        loadSubGroups();
    }, [
        currentZone?.id,
        isZoneCoordinator
    ]);
    const approveSubGroup = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (subGroupId)=>{
        if (!user?.uid) return {
            success: false,
            error: 'Not authenticated'
        };
        const approverName = profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}` : 'Zone Coordinator';
        const result = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$subgroup$2d$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SubGroupService"].approveSubGroup(subGroupId, user.uid, approverName);
        if (result.success && currentZone) {
            const [groups, count] = await Promise.all([
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$subgroup$2d$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SubGroupService"].getZoneSubGroups(currentZone.id),
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$subgroup$2d$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SubGroupService"].getPendingRequestCount(currentZone.id)
            ]);
            setSubGroups(groups);
            setPendingCount(count);
        }
        return result;
    }, [
        user?.uid,
        profile,
        currentZone
    ]);
    const rejectSubGroup = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (subGroupId, reason)=>{
        if (!user?.uid) return {
            success: false,
            error: 'Not authenticated'
        };
        const rejecterName = profile?.first_name ? `${profile.first_name} ${profile.last_name || ''}` : 'Zone Coordinator';
        const result = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$subgroup$2d$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SubGroupService"].rejectSubGroup(subGroupId, user.uid, rejecterName, reason);
        if (result.success && currentZone) {
            const [groups, count] = await Promise.all([
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$subgroup$2d$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SubGroupService"].getZoneSubGroups(currentZone.id),
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$subgroup$2d$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SubGroupService"].getPendingRequestCount(currentZone.id)
            ]);
            setSubGroups(groups);
            setPendingCount(count);
        }
        return result;
    }, [
        user?.uid,
        profile,
        currentZone
    ]);
    const refresh = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        if (!currentZone) return;
        const [groups, count] = await Promise.all([
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$subgroup$2d$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SubGroupService"].getZoneSubGroups(currentZone.id),
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$subgroup$2d$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SubGroupService"].getPendingRequestCount(currentZone.id)
        ]);
        setSubGroups(groups);
        setPendingCount(count);
    }, [
        currentZone
    ]);
    return {
        subGroups,
        pendingSubGroups: subGroups.filter((sg)=>sg.status === 'pending'),
        activeSubGroups: subGroups.filter((sg)=>sg.status === 'active'),
        pendingCount,
        isLoading,
        approveSubGroup,
        rejectSubGroup,
        refresh
    };
}
}),
"[project]/src/utils/imageUpload.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "deleteProfileImage",
    ()=>deleteProfileImage,
    "uploadBannerImage",
    ()=>uploadBannerImage,
    "uploadProfileImage",
    ()=>uploadProfileImage,
    "validateImageFile",
    ()=>validateImageFile
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase-client.ts [app-ssr] (ecmascript)");
;
async function uploadProfileImage(file, userId) {
    try {
        console.log('🚀 Starting profile image upload...');
        console.log('📁 File details:', {
            name: file.name,
            size: file.size,
            type: file.type
        });
        console.log('👤 User ID:', userId);
        // Validate file type
        const allowedTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp'
        ];
        if (!allowedTypes.includes(file.type)) {
            console.log('❌ Invalid file type:', file.type);
            return {
                success: false,
                error: 'Invalid file type. Please upload a JPEG, PNG, or WebP image.'
            };
        }
        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            console.log('❌ File too large:', file.size, 'bytes');
            return {
                success: false,
                error: 'File size too large. Please upload an image smaller than 5MB.'
            };
        }
        console.log('📁 [Cloudinary] Uploading profile image...');
        // Upload file to Cloudinary
        const { uploadImageToCloudinary } = await __turbopack_context__.A("[project]/src/lib/cloudinary-storage.ts [app-ssr] (ecmascript, async loader)");
        const uploadResult = await uploadImageToCloudinary(file);
        if (!uploadResult) {
            console.log('❌ Cloudinary upload failed');
            return {
                success: false,
                error: 'Failed to upload image to Cloudinary'
            };
        }
        const publicUrl = uploadResult.url;
        console.log('✅ [Cloudinary] Upload successful:', publicUrl);
        return {
            success: true,
            url: publicUrl
        };
    } catch (error) {
        console.error('❌ Unexpected error during upload:', error);
        return {
            success: false,
            error: 'An unexpected error occurred during upload.'
        };
    }
}
async function deleteProfileImage(imageUrl) {
    try {
        console.log('🗑️ Deleting profile image:', imageUrl);
        // Extract file path from URL
        const url = new URL(imageUrl);
        const pathParts = url.pathname.split('/');
        const bucketName = pathParts[pathParts.length - 2];
        const fileName = pathParts[pathParts.length - 1];
        const filePath = `profile-images/${fileName}`;
        console.log('📁 Deleting from path:', filePath);
        const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].storage.from('media-files').remove([
            filePath
        ]);
        if (error) {
            console.error('❌ Delete error:', error);
            return false;
        }
        console.log('✅ Image deleted successfully');
        return true;
    } catch (error) {
        console.error('❌ Unexpected error during deletion:', error);
        return false;
    }
}
function validateImageFile(file) {
    // Check file type
    const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp'
    ];
    if (!allowedTypes.includes(file.type)) {
        return {
            valid: false,
            error: 'Invalid file type. Please upload a JPEG, PNG, or WebP image.'
        };
    }
    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        return {
            valid: false,
            error: 'File size too large. Please upload an image smaller than 5MB.'
        };
    }
    return {
        valid: true
    };
}
async function uploadBannerImage(file, pageId) {
    try {
        console.log('⚡ Starting ULTRA-FAST banner image upload...');
        console.log('📁 File details:', {
            name: file.name,
            size: file.size,
            type: file.type
        });
        console.log('📄 Page ID:', pageId);
        // Validate file type
        const allowedTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp'
        ];
        if (!allowedTypes.includes(file.type)) {
            console.log('❌ Invalid file type:', file.type);
            return {
                success: false,
                error: 'Invalid file type. Please upload a JPEG, PNG, or WebP image.'
            };
        }
        // Validate file size (max 5MB for faster uploads)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            console.log('❌ File too large:', file.size);
            return {
                success: false,
                error: 'File size too large. Please upload an image smaller than 5MB.'
            };
        }
        // Compress image for faster upload
        const compressedFile = await compressImage(file);
        console.log('🗜️ Image compressed:', {
            original: file.size,
            compressed: compressedFile.size,
            reduction: `${Math.round((1 - compressedFile.size / file.size) * 100)}%`
        });
        // Create unique filename (sanitize pageId for filename)
        const fileExt = 'webp'; // Use WebP for better compression
        const sanitizedPageId = String(pageId).replace(/[^a-zA-Z0-9-]/g, '_');
        const fileName = `page-${sanitizedPageId}-banner-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
        const filePath = `banner-images/${fileName}`;
        console.log('📤 Uploading compressed image to path:', filePath);
        // Upload directly without timeout (Supabase handles timeouts internally)
        const { data, error: uploadError } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].storage.from('media-files').upload(filePath, compressedFile, {
            cacheControl: '31536000',
            upsert: true,
            contentType: 'image/webp'
        });
        if (uploadError) {
            console.error('❌ Supabase upload error:', uploadError);
            return {
                success: false,
                error: `Upload failed: ${uploadError.message}`
            };
        }
        console.log('✅ File uploaded to Supabase storage successfully');
        // Get public URL
        const { data: urlData } = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].storage.from('media-files').getPublicUrl(filePath);
        const publicUrl = urlData.publicUrl;
        console.log('⚡ ULTRA-FAST banner image uploaded successfully:', publicUrl);
        return {
            success: true,
            url: publicUrl
        };
    } catch (error) {
        console.error('❌ Unexpected error during banner upload:', error);
        return {
            success: false,
            error: error.message || 'An unexpected error occurred during upload.'
        };
    }
}
// Image compression function for faster uploads
async function compressImage(file, quality = 0.8) {
    return new Promise((resolve, reject)=>{
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = ()=>{
            // Calculate new dimensions (max 1920px width)
            const maxWidth = 1920;
            const maxHeight = 1080;
            let { width, height } = img;
            if (width > maxWidth) {
                height = height * maxWidth / width;
                width = maxWidth;
            }
            if (height > maxHeight) {
                width = width * maxHeight / height;
                height = maxHeight;
            }
            canvas.width = width;
            canvas.height = height;
            // Draw and compress
            ctx?.drawImage(img, 0, 0, width, height);
            canvas.toBlob((blob)=>{
                if (blob) {
                    const compressedFile = new File([
                        blob
                    ], file.name, {
                        type: 'image/webp',
                        lastModified: Date.now()
                    });
                    resolve(compressedFile);
                } else {
                    reject(new Error('Image compression failed'));
                }
            }, 'image/webp', quality);
        };
        img.onerror = ()=>reject(new Error('Image loading failed'));
        img.src = URL.createObjectURL(file);
    });
}
}),
"[project]/src/utils/zone-theme.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Zone Theme Utilities
 * 
 * Provides zone-aware colors and terminology for the admin interface
 */ __turbopack_context__.s([
    "getFullRoleName",
    ()=>getFullRoleName,
    "getRoleTerminology",
    ()=>getRoleTerminology,
    "getZoneTheme",
    ()=>getZoneTheme
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/config/zones.ts [app-ssr] (ecmascript)");
;
function getZoneTheme(zoneColor) {
    // Default to purple if no color provided
    if (!zoneColor) {
        return {
            primary: 'bg-purple-600',
            primaryHover: 'hover:bg-purple-700',
            primaryLight: 'bg-purple-50',
            primaryDark: 'bg-purple-100',
            text: 'text-purple-600',
            textHover: 'hover:text-purple-700',
            border: 'border-purple-200',
            borderHover: 'hover:border-purple-300',
            bg: 'bg-purple-50',
            bgHover: 'hover:bg-purple-100',
            focusRing: 'focus:ring-purple-500',
            focusBorder: 'focus:border-purple-500',
            focusBg: 'focus:bg-white'
        };
    }
    // Map common zone colors to Tailwind classes
    const colorMap = {
        '#9333EA': {
            primary: 'bg-purple-600',
            primaryHover: 'hover:bg-purple-700',
            primaryLight: 'bg-purple-50',
            primaryDark: 'bg-purple-100',
            text: 'text-purple-600',
            textHover: 'hover:text-purple-700',
            border: 'border-purple-200',
            borderHover: 'hover:border-purple-300',
            bg: 'bg-purple-50',
            bgHover: 'hover:bg-purple-100',
            focusRing: 'focus:ring-purple-500',
            focusBorder: 'focus:border-purple-500',
            focusBg: 'focus:bg-white'
        },
        '#3B82F6': {
            primary: 'bg-blue-600',
            primaryHover: 'hover:bg-blue-700',
            primaryLight: 'bg-blue-50',
            primaryDark: 'bg-blue-100',
            text: 'text-blue-600',
            textHover: 'hover:text-blue-700',
            border: 'border-blue-200',
            borderHover: 'hover:border-blue-300',
            bg: 'bg-blue-50',
            bgHover: 'hover:bg-blue-100',
            focusRing: 'focus:ring-blue-500',
            focusBorder: 'focus:border-blue-500',
            focusBg: 'focus:bg-white'
        },
        '#10B981': {
            primary: 'bg-green-600',
            primaryHover: 'hover:bg-green-700',
            primaryLight: 'bg-green-50',
            primaryDark: 'bg-green-100',
            text: 'text-green-600',
            textHover: 'hover:text-green-700',
            border: 'border-green-200',
            borderHover: 'hover:border-green-300',
            bg: 'bg-green-50',
            bgHover: 'hover:bg-green-100',
            focusRing: 'focus:ring-green-500',
            focusBorder: 'focus:border-green-500',
            focusBg: 'focus:bg-white'
        },
        '#DC2626': {
            primary: 'bg-red-600',
            primaryHover: 'hover:bg-red-700',
            primaryLight: 'bg-red-50',
            primaryDark: 'bg-red-100',
            text: 'text-red-600',
            textHover: 'hover:text-red-700',
            border: 'border-red-200',
            borderHover: 'hover:border-red-300',
            bg: 'bg-red-50',
            bgHover: 'hover:bg-red-100',
            focusRing: 'focus:ring-red-500',
            focusBorder: 'focus:border-red-500',
            focusBg: 'focus:bg-white'
        },
        '#F59E0B': {
            primary: 'bg-amber-600',
            primaryHover: 'hover:bg-amber-700',
            primaryLight: 'bg-amber-50',
            primaryDark: 'bg-amber-100',
            text: 'text-amber-600',
            textHover: 'hover:text-amber-700',
            border: 'border-amber-200',
            borderHover: 'hover:border-amber-300',
            bg: 'bg-amber-50',
            bgHover: 'hover:bg-amber-100',
            focusRing: 'focus:ring-amber-500',
            focusBorder: 'focus:border-amber-500',
            focusBg: 'focus:bg-white'
        },
        '#EF4444': {
            primary: 'bg-red-600',
            primaryHover: 'hover:bg-red-700',
            primaryLight: 'bg-red-50',
            primaryDark: 'bg-red-100',
            text: 'text-red-600',
            textHover: 'hover:text-red-700',
            border: 'border-red-200',
            borderHover: 'hover:border-red-300',
            bg: 'bg-red-50',
            bgHover: 'hover:bg-red-100',
            focusRing: 'focus:ring-red-500',
            focusBorder: 'focus:border-red-500',
            focusBg: 'focus:bg-white'
        },
        '#8B5CF6': {
            primary: 'bg-violet-600',
            primaryHover: 'hover:bg-violet-700',
            primaryLight: 'bg-violet-50',
            primaryDark: 'bg-violet-100',
            text: 'text-violet-600',
            textHover: 'hover:text-violet-700',
            border: 'border-violet-200',
            borderHover: 'hover:border-violet-300',
            bg: 'bg-violet-50',
            bgHover: 'hover:bg-violet-100',
            focusRing: 'focus:ring-violet-500',
            focusBorder: 'focus:border-violet-500',
            focusBg: 'focus:bg-white'
        },
        '#EC4899': {
            primary: 'bg-pink-600',
            primaryHover: 'hover:bg-pink-700',
            primaryLight: 'bg-pink-50',
            primaryDark: 'bg-pink-100',
            text: 'text-pink-600',
            textHover: 'hover:text-pink-700',
            border: 'border-pink-200',
            borderHover: 'hover:border-pink-300',
            bg: 'bg-pink-50',
            bgHover: 'hover:bg-pink-100',
            focusRing: 'focus:ring-pink-500',
            focusBorder: 'focus:border-pink-500',
            focusBg: 'focus:bg-white'
        },
        '#14B8A6': {
            primary: 'bg-teal-600',
            primaryHover: 'hover:bg-teal-700',
            primaryLight: 'bg-teal-50',
            primaryDark: 'bg-teal-100',
            text: 'text-teal-600',
            textHover: 'hover:text-teal-700',
            border: 'border-teal-200',
            borderHover: 'hover:border-teal-300',
            bg: 'bg-teal-50',
            bgHover: 'hover:bg-teal-100',
            focusRing: 'focus:ring-teal-500',
            focusBorder: 'focus:border-teal-500',
            focusBg: 'focus:bg-white'
        },
        '#6366F1': {
            primary: 'bg-indigo-600',
            primaryHover: 'hover:bg-indigo-700',
            primaryLight: 'bg-indigo-50',
            primaryDark: 'bg-indigo-100',
            text: 'text-indigo-600',
            textHover: 'hover:text-indigo-700',
            border: 'border-indigo-200',
            borderHover: 'hover:border-indigo-300',
            bg: 'bg-indigo-50',
            bgHover: 'hover:bg-indigo-100',
            focusRing: 'focus:ring-indigo-500',
            focusBorder: 'focus:border-indigo-500',
            focusBg: 'focus:bg-white'
        },
        '#F97316': {
            primary: 'bg-orange-600',
            primaryHover: 'hover:bg-orange-700',
            primaryLight: 'bg-orange-50',
            primaryDark: 'bg-orange-100',
            text: 'text-orange-600',
            textHover: 'hover:text-orange-700',
            border: 'border-orange-200',
            borderHover: 'hover:border-orange-300',
            bg: 'bg-orange-50',
            bgHover: 'hover:bg-orange-100',
            focusRing: 'focus:ring-orange-500',
            focusBorder: 'focus:border-orange-500',
            focusBg: 'focus:bg-white'
        },
        '#84CC16': {
            primary: 'bg-lime-600',
            primaryHover: 'hover:bg-lime-700',
            primaryLight: 'bg-lime-50',
            primaryDark: 'bg-lime-100',
            text: 'text-lime-600',
            textHover: 'hover:text-lime-700',
            border: 'border-lime-200',
            borderHover: 'hover:border-lime-300',
            bg: 'bg-lime-50',
            bgHover: 'hover:bg-lime-100',
            focusRing: 'focus:ring-lime-500',
            focusBorder: 'focus:border-lime-500',
            focusBg: 'focus:bg-white'
        },
        '#06B6D4': {
            primary: 'bg-cyan-600',
            primaryHover: 'hover:bg-cyan-700',
            primaryLight: 'bg-cyan-50',
            primaryDark: 'bg-cyan-100',
            text: 'text-cyan-600',
            textHover: 'hover:text-cyan-700',
            border: 'border-cyan-200',
            borderHover: 'hover:border-cyan-300',
            bg: 'bg-cyan-50',
            bgHover: 'hover:bg-cyan-100',
            focusRing: 'focus:ring-cyan-500',
            focusBorder: 'focus:border-cyan-500',
            focusBg: 'focus:bg-white'
        },
        '#A855F7': {
            primary: 'bg-purple-600',
            primaryHover: 'hover:bg-purple-700',
            primaryLight: 'bg-purple-50',
            primaryDark: 'bg-purple-100',
            text: 'text-purple-600',
            textHover: 'hover:text-purple-700',
            border: 'border-purple-200',
            borderHover: 'hover:border-purple-300',
            bg: 'bg-purple-50',
            bgHover: 'hover:bg-purple-100',
            focusRing: 'focus:ring-purple-500',
            focusBorder: 'focus:border-purple-500',
            focusBg: 'focus:bg-white'
        },
        '#22D3EE': {
            primary: 'bg-cyan-600',
            primaryHover: 'hover:bg-cyan-700',
            primaryLight: 'bg-cyan-50',
            primaryDark: 'bg-cyan-100',
            text: 'text-cyan-600',
            textHover: 'hover:text-cyan-700',
            border: 'border-cyan-200',
            borderHover: 'hover:border-cyan-300',
            bg: 'bg-cyan-50',
            bgHover: 'hover:bg-cyan-100',
            focusRing: 'focus:ring-cyan-500',
            focusBorder: 'focus:border-cyan-500',
            focusBg: 'focus:bg-white'
        },
        '#FB923C': {
            primary: 'bg-orange-600',
            primaryHover: 'hover:bg-orange-700',
            primaryLight: 'bg-orange-50',
            primaryDark: 'bg-orange-100',
            text: 'text-orange-600',
            textHover: 'hover:text-orange-700',
            border: 'border-orange-200',
            borderHover: 'hover:border-orange-300',
            bg: 'bg-orange-50',
            bgHover: 'hover:bg-orange-100',
            focusRing: 'focus:ring-orange-500',
            focusBorder: 'focus:border-orange-500',
            focusBg: 'focus:bg-white'
        },
        '#059669': {
            primary: 'bg-emerald-600',
            primaryHover: 'hover:bg-emerald-700',
            primaryLight: 'bg-emerald-50',
            primaryDark: 'bg-emerald-100',
            text: 'text-emerald-600',
            textHover: 'hover:text-emerald-700',
            border: 'border-emerald-200',
            borderHover: 'hover:border-emerald-300',
            bg: 'bg-emerald-50',
            bgHover: 'hover:bg-emerald-100',
            focusRing: 'focus:ring-emerald-500',
            focusBorder: 'focus:border-emerald-500',
            focusBg: 'focus:bg-white'
        },
        '#7C3AED': {
            primary: 'bg-violet-600',
            primaryHover: 'hover:bg-violet-700',
            primaryLight: 'bg-violet-50',
            primaryDark: 'bg-violet-100',
            text: 'text-violet-600',
            textHover: 'hover:text-violet-700',
            border: 'border-violet-200',
            borderHover: 'hover:border-violet-300',
            bg: 'bg-violet-50',
            bgHover: 'hover:bg-violet-100',
            focusRing: 'focus:ring-violet-500',
            focusBorder: 'focus:border-violet-500',
            focusBg: 'focus:bg-white'
        }
    };
    return colorMap[zoneColor] || colorMap['#9333EA']; // Default to purple
}
function getRoleTerminology(zoneId) {
    if (zoneId && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isHQGroup"])(zoneId)) {
        return {
            singular: 'Pastor',
            plural: 'Pastors',
            title: 'HQ Pastor'
        };
    }
    return {
        singular: 'Coordinator',
        plural: 'Coordinators',
        title: 'Zone Coordinator'
    };
}
function getFullRoleName(zoneId, firstName, lastName) {
    const role = getRoleTerminology(zoneId);
    const fullName = `${firstName || ''} ${lastName || ''}`.trim();
    if (fullName) {
        return fullName;
    }
    return role.title;
}
}),
"[project]/src/utils/media-diagnostics.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Media Library Diagnostics Tool
__turbopack_context__.s([
    "printDiagnostics",
    ()=>printDiagnostics,
    "runMediaDiagnostics",
    ()=>runMediaDiagnostics
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase-client.ts [app-ssr] (ecmascript)");
;
async function runMediaDiagnostics() {
    const results = [];
    // Test 1: Supabase Connection
    try {
        const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('media').select('count', {
            count: 'exact',
            head: true
        });
        if (error) throw error;
        results.push({
            test: 'Supabase Connection',
            status: 'pass',
            message: 'Successfully connected to Supabase',
            details: {
                count: data
            }
        });
    } catch (error) {
        results.push({
            test: 'Supabase Connection',
            status: 'fail',
            message: `Failed to connect: ${error instanceof Error ? error.message : 'Unknown error'}`,
            details: error
        });
    }
    // Test 2: Media Table Access
    try {
        const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].from('media').select('id, name, url, type').limit(1);
        if (error) throw error;
        results.push({
            test: 'Media Table Access',
            status: 'pass',
            message: `Can read from media table (${data?.length || 0} sample records)`,
            details: data
        });
    } catch (error) {
        results.push({
            test: 'Media Table Access',
            status: 'fail',
            message: `Cannot read from media table: ${error instanceof Error ? error.message : 'Unknown error'}`,
            details: error
        });
    }
    // Test 3: Storage Bucket Access
    try {
        const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].storage.from('media-files').list('', {
            limit: 1
        });
        if (error) throw error;
        results.push({
            test: 'Storage Bucket Access',
            status: 'pass',
            message: 'Can access media-files storage bucket',
            details: data
        });
    } catch (error) {
        results.push({
            test: 'Storage Bucket Access',
            status: 'fail',
            message: `Cannot access storage bucket: ${error instanceof Error ? error.message : 'Unknown error'}`,
            details: error
        });
    }
    // Test 4: Storage Bucket Public Access
    try {
        const { data } = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].storage.from('media-files').getPublicUrl('test.txt');
        if (data.publicUrl) {
            results.push({
                test: 'Storage Public URL',
                status: 'pass',
                message: 'Can generate public URLs',
                details: {
                    sampleUrl: data.publicUrl
                }
            });
        } else {
            results.push({
                test: 'Storage Public URL',
                status: 'warning',
                message: 'Public URL generation may not be configured',
                details: data
            });
        }
    } catch (error) {
        results.push({
            test: 'Storage Public URL',
            status: 'fail',
            message: `Cannot generate public URLs: ${error instanceof Error ? error.message : 'Unknown error'}`,
            details: error
        });
    }
    // Test 5: Audio Playback Support
    try {
        const audio = new Audio();
        const canPlayMP3 = audio.canPlayType('audio/mpeg');
        const canPlayWAV = audio.canPlayType('audio/wav');
        const canPlayOGG = audio.canPlayType('audio/ogg');
        results.push({
            test: 'Audio Playback Support',
            status: canPlayMP3 || canPlayWAV ? 'pass' : 'warning',
            message: 'Browser audio support detected',
            details: {
                mp3: canPlayMP3,
                wav: canPlayWAV,
                ogg: canPlayOGG
            }
        });
    } catch (error) {
        results.push({
            test: 'Audio Playback Support',
            status: 'fail',
            message: 'Audio playback not supported',
            details: error
        });
    }
    // Test 6: CORS Configuration
    try {
        const { data } = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].storage.from('media-files').getPublicUrl('test.mp3');
        if (data.publicUrl) {
            // Try to fetch with CORS
            const response = await fetch(data.publicUrl, {
                method: 'HEAD',
                mode: 'cors'
            });
            results.push({
                test: 'CORS Configuration',
                status: 'pass',
                message: 'CORS is properly configured',
                details: {
                    headers: Object.fromEntries(response.headers.entries())
                }
            });
        }
    } catch (error) {
        results.push({
            test: 'CORS Configuration',
            status: 'warning',
            message: 'CORS may not be configured (this is normal if no files exist)',
            details: error
        });
    }
    // Test 7: Upload Permissions
    try {
        // Try to create a test file (we'll delete it immediately)
        const testBlob = new Blob([
            'test'
        ], {
            type: 'text/plain'
        });
        const testFile = new File([
            testBlob
        ], 'diagnostic-test.txt');
        const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].storage.from('media-files').upload(`diagnostic/${Date.now()}.txt`, testFile, {
            upsert: true
        });
        if (error) throw error;
        // Clean up
        if (data?.path) {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["supabase"].storage.from('media-files').remove([
                data.path
            ]);
        }
        results.push({
            test: 'Upload Permissions',
            status: 'pass',
            message: 'Can upload files to storage',
            details: data
        });
    } catch (error) {
        results.push({
            test: 'Upload Permissions',
            status: 'fail',
            message: `Cannot upload files: ${error instanceof Error ? error.message : 'Unknown error'}`,
            details: error
        });
    }
    return results;
}
function printDiagnostics(results) {
    console.log('\n🔍 MEDIA LIBRARY DIAGNOSTICS\n');
    console.log('='.repeat(60));
    results.forEach((result, index)=>{
        const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
        console.log(`\n${index + 1}. ${icon} ${result.test}`);
        console.log(`   Status: ${result.status.toUpperCase()}`);
        console.log(`   Message: ${result.message}`);
        if (result.details) {
            console.log(`   Details:`, result.details);
        }
    });
    console.log('\n' + '='.repeat(60));
    const passed = results.filter((r)=>r.status === 'pass').length;
    const failed = results.filter((r)=>r.status === 'fail').length;
    const warnings = results.filter((r)=>r.status === 'warning').length;
    console.log(`\nSummary: ${passed} passed, ${failed} failed, ${warnings} warnings`);
    console.log('='.repeat(60) + '\n');
}
}),
"[project]/src/utils/youtube.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// YouTube URL utilities
__turbopack_context__.s([
    "convertToYouTubeEmbed",
    ()=>convertToYouTubeEmbed,
    "extractYouTubeVideoId",
    ()=>extractYouTubeVideoId,
    "getYouTubeThumbnail",
    ()=>getYouTubeThumbnail,
    "getYouTubeThumbnailFallbacks",
    ()=>getYouTubeThumbnailFallbacks,
    "isYouTubeUrl",
    ()=>isYouTubeUrl
]);
function extractYouTubeVideoId(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];
    for (const pattern of patterns){
        const match = url.match(pattern);
        if (match) {
            return match[1];
        }
    }
    return null;
}
function convertToYouTubeEmbed(url) {
    const videoId = extractYouTubeVideoId(url);
    if (!videoId) return null;
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
}
function isYouTubeUrl(url) {
    return /(?:youtube\.com|youtu\.be)/.test(url);
}
function getYouTubeThumbnail(url) {
    const videoId = extractYouTubeVideoId(url);
    if (!videoId) return null;
    // Use hqdefault as it's more reliable than maxresdefault
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}
function getYouTubeThumbnailFallbacks(videoId) {
    return [
        `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
        `https://img.youtube.com/vi/${videoId}/default.jpg`
    ];
}
}),
];

//# sourceMappingURL=src_0cbdcf31._.js.map