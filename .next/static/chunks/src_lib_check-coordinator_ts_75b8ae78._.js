(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/lib/check-coordinator.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Check if user is a zone coordinator
 * Directly queries the database instead of relying on ZoneContext
 */ __turbopack_context__.s([
    "checkCoordinatorFromMemberships",
    ()=>checkCoordinatorFromMemberships,
    "isUserCoordinator",
    ()=>isUserCoordinator
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase-database.ts [app-client] (ecmascript)");
;
async function isUserCoordinator(userId) {
    try {
        // Get user's zone memberships
        const memberships = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].getCollectionWhere('zone_members', 'userId', '==', userId);
        // Check if any membership has coordinator role
        const hasCoordinatorRole = memberships.some((m)=>m.role === 'coordinator');
        return hasCoordinatorRole;
    } catch (error) {
        console.error('Error checking coordinator status:', error);
        return false;
    }
}
function checkCoordinatorFromMemberships(memberships) {
    return memberships.some((m)=>m.role === 'coordinator');
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_lib_check-coordinator_ts_75b8ae78._.js.map