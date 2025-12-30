(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/lib/analytics-aggregation-service.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AnalyticsAggregationService",
    ()=>AnalyticsAggregationService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$firestore$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/firestore/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/firebase/node_modules/@firebase/firestore/dist/index.esm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase-setup.ts [app-client] (ecmascript)");
;
;
class AnalyticsAggregationService {
    static getMonthlyDocId(year, month) {
        return "".concat(year, "-").concat(String(month + 1).padStart(2, '0'));
    }
    static async getOrCreateMonthlySummary(year, month) {
        const docId = this.getMonthlyDocId(year, month);
        const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'analytics_monthly', docId);
        const docSnap = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDoc"])(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            // Migrate old data structure to new structure if needed
            const migratedSummary = {
                year: data.year,
                month: data.month,
                totalEvents: data.totalEvents || 0,
                totalSignups: data.totalSignups || 0,
                totalLogins: data.totalLogins || 0,
                totalFeatureEngagements: data.totalFeatureEngagements || 0,
                uniqueUsers: data.uniqueUsers || 0,
                pageViews: data.pageViews || {},
                countries: data.countries || {},
                cities: data.cities || {},
                browsers: data.browsers || {},
                featureEngagements: data.featureEngagements || {},
                songAccesses: data.songAccesses || {},
                updatedAt: data.updatedAt || new Date(),
                createdAt: data.createdAt || new Date(),
                // Keep old fields for compatibility
                totalSessions: data.totalSessions,
                totalPageViews: data.totalPageViews,
                desktopSessions: data.desktopSessions,
                mobileSessions: data.mobileSessions,
                tabletSessions: data.tabletSessions
            };
            return migratedSummary;
        }
        const newSummary = {
            year,
            month,
            totalEvents: 0,
            totalSignups: 0,
            totalLogins: 0,
            totalFeatureEngagements: 0,
            uniqueUsers: 0,
            pageViews: {},
            countries: {},
            cities: {},
            browsers: {},
            featureEngagements: {},
            songAccesses: {},
            updatedAt: new Date(),
            createdAt: new Date()
        };
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setDoc"])(docRef, newSummary);
        return newSummary;
    }
    static async incrementEvent(timestamp, eventType, page, featureName, songId) {
        const date = new Date(timestamp);
        const docId = this.getMonthlyDocId(date.getFullYear(), date.getMonth());
        const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'analytics_monthly', docId);
        try {
            const updates = {
                totalEvents: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["increment"])(1),
                updatedAt: new Date()
            };
            switch(eventType){
                case 'signup':
                    updates.totalSignups = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["increment"])(1);
                    break;
                case 'login':
                    updates.totalLogins = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["increment"])(1);
                    break;
                case 'feature_engagement':
                    updates.totalFeatureEngagements = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["increment"])(1);
                    if (page) {
                        updates["pageViews.".concat(page.replace(/\//g, '_'))] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["increment"])(1);
                    }
                    if (featureName) {
                        updates["featureEngagements.".concat(featureName.replace(/\//g, '_'))] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["increment"])(1);
                    }
                    if (songId) {
                        updates["songAccesses.".concat(songId.replace(/\//g, '_'))] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["increment"])(1);
                    }
                    break;
            }
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateDoc"])(docRef, updates);
        } catch (error) {
            await this.getOrCreateMonthlySummary(date.getFullYear(), date.getMonth());
            await this.incrementEvent(timestamp, eventType, page, featureName, songId);
        }
    }
    static async getAllMonthlySummaries() {
        try {
            const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'analytics_monthly'));
            const summaries = snapshot.docs.map((doc)=>{
                const data = doc.data();
                // Migrate old data structure to new structure if needed
                return {
                    year: data.year,
                    month: data.month,
                    totalEvents: data.totalEvents || 0,
                    totalSignups: data.totalSignups || 0,
                    totalLogins: data.totalLogins || 0,
                    totalFeatureEngagements: data.totalFeatureEngagements || 0,
                    uniqueUsers: data.uniqueUsers || 0,
                    pageViews: data.pageViews || {},
                    countries: data.countries || {},
                    cities: data.cities || {},
                    browsers: data.browsers || {},
                    featureEngagements: data.featureEngagements || {},
                    songAccesses: data.songAccesses || {},
                    updatedAt: data.updatedAt || new Date(),
                    createdAt: data.createdAt || new Date(),
                    // Keep old fields for compatibility
                    totalSessions: data.totalSessions,
                    totalPageViews: data.totalPageViews,
                    desktopSessions: data.desktopSessions,
                    mobileSessions: data.mobileSessions,
                    tabletSessions: data.tabletSessions
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
    static async getMonthlySummary(year, month) {
        const docId = this.getMonthlyDocId(year, month);
        const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'analytics_monthly', docId);
        const docSnap = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDoc"])(docRef);
        if (!docSnap.exists()) return null;
        const data = docSnap.data();
        // Ensure the data has the new structure, migrate old data if needed
        const summary = {
            year: data.year,
            month: data.month,
            totalEvents: data.totalEvents || 0,
            totalSignups: data.totalSignups || 0,
            totalLogins: data.totalLogins || 0,
            totalFeatureEngagements: data.totalFeatureEngagements || 0,
            uniqueUsers: data.uniqueUsers || 0,
            pageViews: data.pageViews || {},
            countries: data.countries || {},
            cities: data.cities || {},
            browsers: data.browsers || {},
            featureEngagements: data.featureEngagements || {},
            songAccesses: data.songAccesses || {},
            updatedAt: data.updatedAt,
            createdAt: data.createdAt,
            // Ensure old fields are handled properly for compatibility
            totalSessions: data.totalSessions,
            totalPageViews: data.totalPageViews,
            desktopSessions: data.desktopSessions,
            mobileSessions: data.mobileSessions,
            tabletSessions: data.tabletSessions
        };
        return summary;
    }
    static async refreshMonth(year, month) {
        try {
            const response = await fetch('/api/analytics/migrate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    year,
                    month
                })
            });
            const result = await response.json();
            return {
                success: result.success,
                message: result.message || result.error
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    static async migrateAllData() {
        try {
            const response = await fetch('/api/analytics/migrate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    autoDetect: true
                })
            });
            const result = await response.json();
            return {
                success: result.success,
                message: result.message || result.error
            };
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_lib_analytics-aggregation-service_ts_f79be496._.js.map