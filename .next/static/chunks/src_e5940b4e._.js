(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/lib/firebase-setup.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "auth",
    ()=>auth,
    "db",
    ()=>db,
    "default",
    ()=>__TURBOPACK__default__export__,
    "isRealtimeDbAvailable",
    ()=>isRealtimeDbAvailable,
    "realtimeDb",
    ()=>realtimeDb,
    "storage",
    ()=>storage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/app/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/app/dist/esm/index.esm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/auth/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/auth/dist/esm/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$firestore$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/firestore/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/firebase/node_modules/@firebase/firestore/dist/index.esm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$storage$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/storage/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$storage$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/storage/dist/index.esm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$database$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/database/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/database/dist/index.esm.js [app-client] (ecmascript)");
;
;
;
;
;
const firebaseConfig = {
    apiKey: ("TURBOPACK compile-time value", "AIzaSyBkpkvkV82ILc8R_BjDK9OBDPqDaCbM9lM") || '',
    authDomain: ("TURBOPACK compile-time value", "loveworld-singers-app.firebaseapp.com") || '',
    databaseURL: ("TURBOPACK compile-time value", "https://loveworld-singers-app-default-rtdb.firebaseio.com") || '',
    projectId: ("TURBOPACK compile-time value", "loveworld-singers-app") || '',
    storageBucket: ("TURBOPACK compile-time value", "loveworld-singers-app.firebasestorage.app") || '',
    messagingSenderId: ("TURBOPACK compile-time value", "155599595615") || '',
    appId: ("TURBOPACK compile-time value", "1:155599595615:web:f431ecd7276a22a33f53ea") || '',
    measurementId: ("TURBOPACK compile-time value", "G-0SN10RN806") || ''
};
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    throw new Error('Firebase configuration missing. Check .env.local file.');
}
let app;
try {
    app = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["initializeApp"])(firebaseConfig);
} catch (error) {
    if (error.code === 'app/duplicate-app') {
        app = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getApp"])();
    } else {
        throw error;
    }
}
const auth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAuth"])(app);
const db = (()=>{
    try {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["initializeFirestore"])(app, {
            experimentalForceLongPolling: false,
            experimentalAutoDetectLongPolling: true,
            localCache: {
                kind: 'persistent'
            }
        });
    } catch (error) {
        if (error.code === 'firestore/already-exists') {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getFirestore"])(app);
        }
        throw error;
    }
})();
const storage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$storage$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getStorage"])(app);
let _realtimeDb = null;
const realtimeDb = (()=>{
    if ("TURBOPACK compile-time truthy", 1) {
        try {
            if (!_realtimeDb) {
                _realtimeDb = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDatabase"])(app);
            }
            return _realtimeDb;
        } catch (error) {
            console.warn('Failed to initialize Realtime Database:', error);
            // Create a mock object to prevent build failures
            return {
                _delegate: {},
                useEmulator: ()=>{},
                ref: ()=>({})
            };
        }
    } else //TURBOPACK unreachable
    ;
})();
function isRealtimeDbAvailable() {
    return realtimeDb !== null && typeof realtimeDb !== 'string' && 'ref' in realtimeDb;
}
if ("TURBOPACK compile-time truthy", 1) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setPersistence"])(auth, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["browserLocalPersistence"]).catch(console.error);
}
const __TURBOPACK__default__export__ = app;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/session-manager.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Session Management Service - Concurrent Login Prevention
__turbopack_context__.s([
    "SessionManager",
    ()=>SessionManager
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_define_property.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$firestore$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/firestore/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/firebase/node_modules/@firebase/firestore/dist/index.esm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase-setup.ts [app-client] (ecmascript)");
;
;
;
class SessionManager {
    // Generate unique device ID
    static generateDeviceId() {
        if (this.deviceId) return this.deviceId;
        // Create unique device fingerprint
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Device fingerprint', 2, 2);
        const fingerprint = canvas.toDataURL();
        const userAgent = navigator.userAgent;
        const screen = "".concat(window.screen.width, "x").concat(window.screen.height);
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        this.deviceId = btoa("".concat(fingerprint, "-").concat(userAgent, "-").concat(screen, "-").concat(timezone)).slice(0, 32);
        return this.deviceId;
    }
    // Get device info for display
    static getDeviceInfo() {
        const userAgent = navigator.userAgent;
        let deviceInfo = 'Unknown Device';
        if (/iPhone|iPad|iPod/.test(userAgent)) {
            deviceInfo = 'iPhone/iPad';
        } else if (/Android/.test(userAgent)) {
            deviceInfo = 'Android Device';
        } else if (/Windows/.test(userAgent)) {
            deviceInfo = 'Windows PC';
        } else if (/Mac/.test(userAgent)) {
            deviceInfo = 'Mac';
        } else if (/Linux/.test(userAgent)) {
            deviceInfo = 'Linux PC';
        }
        // Add browser info
        if (/Chrome/.test(userAgent)) deviceInfo += ' (Chrome)';
        else if (/Firefox/.test(userAgent)) deviceInfo += ' (Firefox)';
        else if (/Safari/.test(userAgent)) deviceInfo += ' (Safari)';
        else if (/Edge/.test(userAgent)) deviceInfo += ' (Edge)';
        // Add specific device model if available
        const deviceModel = this.getDeviceModel(userAgent);
        if (deviceModel) {
            deviceInfo = deviceModel + ' ' + deviceInfo;
        }
        return deviceInfo;
    }
    // Get specific device model
    static getDeviceModel(userAgent) {
        // Samsung devices
        const samsungMatch = userAgent.match(/SM-[A-Z0-9]+/);
        if (samsungMatch) {
            return "Samsung ".concat(samsungMatch[0]);
        }
        // Itel devices
        const itelMatch = userAgent.match(/itel[ _][A-Z0-9]+/i);
        if (itelMatch) {
            return itelMatch[0].replace(/_/g, ' ');
        }
        // Other Android devices
        const androidMatch = userAgent.match(/Android.*?([A-Za-z0-9 ]+?)(?:Build|;)/);
        if (androidMatch) {
            return androidMatch[1].trim();
        }
        return null;
    }
    // Get browser information
    static getBrowserInfo() {
        const userAgent = navigator.userAgent;
        if (/Chrome/.test(userAgent)) return 'Chrome';
        if (/Firefox/.test(userAgent)) return 'Firefox';
        if (/Safari/.test(userAgent)) return 'Safari';
        if (/Edge/.test(userAgent)) return 'Edge';
        return 'Unknown Browser';
    }
    // Get OS information
    static getOSInfo() {
        const userAgent = navigator.userAgent;
        if (/Windows/.test(userAgent)) return 'Windows';
        if (/Mac/.test(userAgent)) return 'macOS';
        if (/Linux/.test(userAgent)) return 'Linux';
        if (/Android/.test(userAgent)) return 'Android';
        if (/iPhone|iPad|iPod/.test(userAgent)) return 'iOS';
        return 'Unknown OS';
    }
    // Check if user can login (Single-device policy - block new login if another device active)
    static async canUserLogin(userId) {
        try {
            const currentDeviceId = this.generateDeviceId();
            const sessionRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'user_sessions', userId);
            const sessionDoc = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDoc"])(sessionRef);
            if (!sessionDoc.exists()) {
                return {
                    canLogin: true
                };
            }
            const session = sessionDoc.data();
            if (session.isActive && session.deviceId && session.deviceId !== currentDeviceId) {
                return {
                    canLogin: false,
                    activeDevice: session.deviceInfo || 'another device'
                };
            }
            return {
                canLogin: true
            };
        } catch (_e) {
            return {
                canLogin: true
            };
        }
    }
    // Create new session for user (terminates existing sessions)
    static async createSession(user) {
        try {
            const deviceId = this.generateDeviceId();
            const deviceInfo = this.getDeviceInfo();
            const deviceModel = this.getDeviceModel(navigator.userAgent) || 'Unknown';
            const browserInfo = this.getBrowserInfo();
            const osInfo = this.getOSInfo();
            // Terminate any existing session for this user
            await this.terminateExistingSession(user.uid, deviceId);
            const session = {
                userId: user.uid,
                deviceId,
                deviceInfo,
                deviceModel,
                browserInfo,
                osInfo,
                loginTime: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["serverTimestamp"])(),
                lastActivity: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["serverTimestamp"])(),
                isActive: true
            };
            const sessionRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'user_sessions', user.uid);
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setDoc"])(sessionRef, session);
            // Start activity tracking
            this.startActivityTracking(user.uid);
            console.log('✅ Session created for device:', deviceInfo);
        } catch (error) {
            console.error('Error creating session:', error);
        }
    }
    // Terminate existing session for user (Facebook-style)
    static async terminateExistingSession(userId, currentDeviceId) {
        try {
            const sessionRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'user_sessions', userId);
            const sessionDoc = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDoc"])(sessionRef);
            if (sessionDoc.exists()) {
                const session = sessionDoc.data();
                // If existing session is on a different device, notify it
                if (session.deviceId !== currentDeviceId) {
                    // Update the session to mark it as terminated
                    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setDoc"])(sessionRef, {
                        ...session,
                        isActive: false,
                        terminatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["serverTimestamp"])(),
                        terminatedByDeviceId: currentDeviceId
                    }, {
                        merge: true
                    });
                }
            }
        } catch (error) {
            console.error('Error terminating existing session:', error);
        }
    }
    // Update last activity
    static async updateActivity(userId) {
        try {
            const sessionRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'user_sessions', userId);
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setDoc"])(sessionRef, {
                lastActivity: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["serverTimestamp"])()
            }, {
                merge: true
            });
        } catch (error) {
            console.error('Error updating activity:', error);
        }
    }
    // Start tracking user activity
    static startActivityTracking(userId) {
        // DISABLED - Session tracking causes page reloads
        // Just log the activity without forcing logouts
        console.log('📊 Activity tracking disabled to prevent reloads');
    }
    // Handle session termination (user logged in elsewhere)
    static handleSessionTermination() {
        // DISABLED - No more forced reloads
        // Just clear the session silently, let React handle the UI
        console.log('⚠️ Session terminated on another device');
    }
    // End session
    static async endSession(userId) {
        try {
            const sessionRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'user_sessions', userId);
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deleteDoc"])(sessionRef);
            if (this.sessionListener) {
                this.sessionListener();
                this.sessionListener = null;
            }
            console.log('✅ Session ended');
        } catch (error) {
            console.error('Error ending session:', error);
        }
    }
    // Force logout user from all devices (admin function)
    static async forceLogoutUser(userId) {
        try {
            const sessionRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'user_sessions', userId);
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setDoc"])(sessionRef, {
                isActive: false,
                terminatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["serverTimestamp"])(),
                terminatedReason: 'admin_force_logout'
            }, {
                merge: true
            });
            console.log('✅ User force logged out from all devices');
        } catch (error) {
            console.error('Error force logging out user:', error);
        }
    }
}
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(SessionManager, "deviceId", '');
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(SessionManager, "sessionListener", null);
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/error-handler.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// User-Friendly Error Handler
__turbopack_context__.s([
    "ErrorHandler",
    ()=>ErrorHandler
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
class ErrorHandler {
    // Convert Firebase auth errors to user-friendly messages
    static getAuthErrorMessage(errorCode) {
        const errorMessages = {
            // Authentication Errors
            'auth/user-not-found': 'No account found with this email address. Please check your email or sign up.',
            'auth/wrong-password': 'Incorrect password. Please try again or reset your password.',
            'auth/invalid-email': 'Please enter a valid email address.',
            'auth/user-disabled': 'This account has been disabled. Please contact support.',
            'auth/too-many-requests': 'Too many failed attempts. Please try again later or reset your password.',
            'auth/network-request-failed': 'Network error. Please check your internet connection and try again.',
            // Registration Errors
            'auth/email-already-in-use': 'An account with this email already exists. Please sign in instead.',
            'auth/weak-password': 'Password is too weak. Please use at least 6 characters with numbers and letters.',
            'auth/invalid-password': 'Password must be at least 6 characters long.',
            // Session Errors
            'auth/requires-recent-login': 'For security, please sign in again to continue.',
            'auth/user-token-expired': 'Your session has expired. Please sign in again.',
            'auth/invalid-user-token': 'Your session is invalid. Please sign in again.',
            // Google Sign-in Errors
            'auth/popup-closed-by-user': 'Sign-in was cancelled. Please try again.',
            'auth/popup-blocked': 'Pop-up was blocked by your browser. Please allow pop-ups and try again.',
            'auth/cancelled-popup-request': 'Sign-in was cancelled. Please try again.',
            // General Errors
            'auth/operation-not-allowed': 'This sign-in method is not enabled. Please contact support.',
            'auth/invalid-api-key': 'Configuration error. Please contact support.',
            'auth/app-deleted': 'App configuration error. Please contact support.',
            'auth/invalid-credential': 'Invalid credentials. Please check your email and password.',
            // Custom Session Errors
            'session/already-logged-in': 'This account is already logged in on another device. Please ask the account owner to log out from that device first, or sign up for your own account instead.',
            'session/device-limit-reached': 'Maximum number of devices reached for this account.',
            'session/invalid-device': 'This device is not authorized for this account.',
            'device/already-registered': 'This device is already registered to another account. Please sign up for your own account instead.'
        };
        return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
    }
    // Convert Firebase database errors to user-friendly messages
    static getDatabaseErrorMessage(errorCode) {
        const errorMessages = {
            'permission-denied': 'You don\'t have permission to access this data.',
            'not-found': 'The requested data was not found.',
            'already-exists': 'This data already exists.',
            'resource-exhausted': 'Service is temporarily unavailable. Please try again later.',
            'failed-precondition': 'Operation failed. Please refresh and try again.',
            'aborted': 'Operation was cancelled. Please try again.',
            'out-of-range': 'Invalid data range provided.',
            'unimplemented': 'This feature is not yet available.',
            'internal': 'Internal server error. Please try again later.',
            'unavailable': 'Service is temporarily unavailable. Please try again later.',
            'data-loss': 'Data corruption detected. Please contact support.',
            'unauthenticated': 'Please sign in to continue.',
            'invalid-argument': 'Invalid data provided. Please check your input.',
            'deadline-exceeded': 'Request timed out. Please try again.',
            'cancelled': 'Operation was cancelled.'
        };
        return errorMessages[errorCode] || 'A database error occurred. Please try again.';
    }
    // Convert storage errors to user-friendly messages
    static getStorageErrorMessage(errorCode) {
        const errorMessages = {
            'storage/object-not-found': 'File not found.',
            'storage/bucket-not-found': 'Storage service unavailable.',
            'storage/project-not-found': 'Storage configuration error.',
            'storage/quota-exceeded': 'Storage quota exceeded. Please contact support.',
            'storage/unauthenticated': 'Please sign in to upload files.',
            'storage/unauthorized': 'You don\'t have permission to upload files.',
            'storage/retry-limit-exceeded': 'Upload failed after multiple attempts. Please try again.',
            'storage/invalid-checksum': 'File upload corrupted. Please try again.',
            'storage/canceled': 'Upload was cancelled.',
            'storage/invalid-event-name': 'Upload configuration error.',
            'storage/invalid-url': 'Invalid file URL.',
            'storage/invalid-argument': 'Invalid file data.',
            'storage/no-default-bucket': 'Storage service not configured.',
            'storage/cannot-slice-blob': 'File processing error. Please try a different file.',
            'storage/server-file-wrong-size': 'File size mismatch. Please try again.'
        };
        return errorMessages[errorCode] || 'File upload error. Please try again.';
    }
    // Extract error code from Firebase error
    static extractErrorCode(error) {
        if (typeof error === 'string') {
            return error;
        }
        if (error === null || error === void 0 ? void 0 : error.code) {
            return error.code;
        }
        if (error === null || error === void 0 ? void 0 : error.message) {
            // Try to extract code from message
            const codeMatch = error.message.match(/\(([^)]+)\)/);
            if (codeMatch) {
                return codeMatch[1];
            }
        }
        return 'unknown-error';
    }
    // Get user-friendly error message for any Firebase error
    static getErrorMessage(error) {
        let context = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 'auth';
        const errorCode = this.extractErrorCode(error);
        switch(context){
            case 'auth':
                return this.getAuthErrorMessage(errorCode);
            case 'database':
                return this.getDatabaseErrorMessage(errorCode);
            case 'storage':
                return this.getStorageErrorMessage(errorCode);
            default:
                return this.getAuthErrorMessage(errorCode);
        }
    }
    // Show user-friendly error toast/alert
    static showError(error) {
        let context = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 'auth';
        const message = this.getErrorMessage(error, context);
        // You can replace this with your preferred notification system
        // For now, using alert, but you can integrate with toast libraries
        alert(message);
        // Log the actual error for debugging (only in development)
        if ("TURBOPACK compile-time truthy", 1) {
            console.error('Detailed error:', error);
        }
    }
    // Validate common inputs and return user-friendly messages
    static validateEmail(email) {
        if (!email) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address';
        return null;
    }
    static validatePassword(password) {
        if (!password) return 'Password is required';
        if (password.length < 6) return 'Password must be at least 6 characters long';
        return null;
    }
    static validateName(name) {
        if (!name) return 'Name is required';
        if (name.length < 2) return 'Name must be at least 2 characters long';
        if (!/^[a-zA-Z\s]+$/.test(name)) return 'Name can only contain letters and spaces';
        return null;
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/firebase-auth.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FirebaseAuthService",
    ()=>FirebaseAuthService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/auth/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/auth/dist/esm/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$firestore$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/firestore/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/firebase/node_modules/@firebase/firestore/dist/index.esm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase-setup.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$session$2d$manager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/session-manager.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$error$2d$handler$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/error-handler.ts [app-client] (ecmascript)");
;
;
;
;
;
class FirebaseAuthService {
    static async signIn(email, password) {
        let rememberMe = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : true;
        try {
            const emailError = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$error$2d$handler$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ErrorHandler"].validateEmail(email);
            if (emailError) {
                return {
                    user: null,
                    error: emailError,
                    userFriendly: true
                };
            }
            const passwordError = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$error$2d$handler$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ErrorHandler"].validatePassword(password);
            if (passwordError) {
                return {
                    user: null,
                    error: passwordError,
                    userFriendly: true
                };
            }
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setPersistence"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"], __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["browserLocalPersistence"]);
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["signInWithEmailAndPassword"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"], email, password);
            const sessionCheck = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$session$2d$manager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SessionManager"].canUserLogin(result.user.uid);
            if (!sessionCheck.canLogin) {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["signOut"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"]);
                return {
                    user: null,
                    error: "This account is already logged in on ".concat(sessionCheck.activeDevice, ". Please ask the account owner to log out from that device first, or sign up for your own account instead."),
                    userFriendly: true
                };
            }
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$session$2d$manager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SessionManager"].createSession(result.user);
            if (rememberMe && "object" !== 'undefined') {
                const token = await result.user.getIdToken();
                localStorage.setItem('authToken', token);
                localStorage.setItem('userEmail', email);
                localStorage.setItem('userId', result.user.uid);
                localStorage.setItem('lastLoginTime', Date.now().toString());
            }
            return {
                user: result.user,
                error: null
            };
        } catch (error) {
            const friendlyError = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$error$2d$handler$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ErrorHandler"].getErrorMessage(error, 'auth');
            return {
                user: null,
                error: friendlyError,
                userFriendly: true
            };
        }
    }
    static async signUp(email, password, userData) {
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setPersistence"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"], __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["browserLocalPersistence"]);
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createUserWithEmailAndPassword"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"], email, password);
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'profiles', result.user.uid), {
                ...userData,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            return {
                user: result.user,
                error: null
            };
        } catch (error) {
            return {
                user: null,
                error: error.message
            };
        }
    }
    static async signOut() {
        try {
            const currentUser = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"].currentUser;
            if (currentUser) {
                await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$session$2d$manager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SessionManager"].endSession(currentUser.uid);
            }
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["signOut"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"]);
            return {
                error: null,
                success: true
            };
        } catch (error) {
            const friendlyError = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$error$2d$handler$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ErrorHandler"].getErrorMessage(error, 'auth');
            return {
                error: friendlyError,
                success: false
            };
        }
    }
    static getCurrentUser() {
        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"].currentUser;
    }
    static onAuthStateChange(callback) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["onAuthStateChanged"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"], callback);
    }
    static async ensurePersistence() {
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setPersistence"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"], __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["browserLocalPersistence"]);
            return new Promise((resolve)=>{
                const unsubscribe = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["onAuthStateChanged"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"], (user)=>{
                    unsubscribe();
                    resolve(user);
                });
            });
        } catch (error) {
            console.error('Failed to set auth persistence:', error);
        }
    }
    static async checkPersistenceStatus() {
        try {
            const currentUser = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"].currentUser;
            return {
                hasUser: !!currentUser,
                userEmail: (currentUser === null || currentUser === void 0 ? void 0 : currentUser.email) || null,
                persistenceSet: true,
                message: currentUser ? 'User will stay signed in' : 'No user signed in'
            };
        } catch (error) {
            return {
                hasUser: false,
                userEmail: null,
                persistenceSet: false,
                message: 'Error checking persistence'
            };
        }
    }
    static async getUserProfile(userId) {
        try {
            const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'profiles', userId);
            const docSnap = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDoc"])(docRef);
            return docSnap.exists() ? docSnap.data() : null;
        } catch (error) {
            console.error('Error getting user profile:', error);
            return null;
        }
    }
    static async testConnection() {
        try {
            if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"]) {
                return {
                    status: 'error',
                    message: 'Firebase Auth not initialized'
                };
            }
            const currentUser = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"].currentUser;
            return {
                status: 'success',
                message: 'Firebase Auth connected successfully',
                currentUser: currentUser ? 'User logged in' : 'No user logged in'
            };
        } catch (error) {
            return {
                status: 'error',
                message: error.message
            };
        }
    }
    static async createUserWithEmailAndPassword(email, password, userData) {
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setPersistence"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"], __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["browserLocalPersistence"]);
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createUserWithEmailAndPassword"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"], email, password);
            try {
                if (userData && Object.keys(userData).length > 0) {
                    const profileData = {
                        id: result.user.uid,
                        email: result.user.email,
                        profile_completed: true,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        ...userData
                    };
                    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'profiles', result.user.uid), profileData);
                }
                return {
                    user: result.user,
                    error: null
                };
            } catch (profileError) {
                try {
                    console.error('Failed to create profile, deleting auth user:', profileError);
                    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deleteUser"])(result.user);
                } catch (cleanupError) {
                    console.error('Failed to delete auth user after profile error:', cleanupError);
                }
                return {
                    user: null,
                    error: (profileError === null || profileError === void 0 ? void 0 : profileError.message) || 'Failed to complete signup. Please check your connection and try again.'
                };
            }
        } catch (error) {
            return {
                user: null,
                error: error.message
            };
        }
    }
    static async signInWithEmailAndPassword(email, password) {
        let rememberMe = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : true;
        return this.signIn(email, password, rememberMe);
    }
    static async autoLogin() {
        try {
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            const isLoggingOut = localStorage.getItem('isLoggingOut') === 'true' || localStorage.getItem('logging_out') === 'true';
            const urlParams = new URLSearchParams(window.location.search);
            const logoutFromUrl = urlParams.get('logout') === 'true';
            if (isLoggingOut || logoutFromUrl) {
                return {
                    user: null,
                    error: 'Logout in progress'
                };
            }
            const authToken = localStorage.getItem('authToken');
            const userId = localStorage.getItem('userId');
            const lastLoginTime = localStorage.getItem('lastLoginTime');
            if (!authToken || !userId || !lastLoginTime) {
                return {
                    user: null,
                    error: 'No stored credentials'
                };
            }
            const tokenAge = Date.now() - parseInt(lastLoginTime);
            const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 days
            ;
            if (tokenAge > maxAge) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('userId');
                localStorage.removeItem('userEmail');
                localStorage.removeItem('lastLoginTime');
                return {
                    user: null,
                    error: 'Token expired'
                };
            }
            const currentUser = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"].currentUser;
            if (currentUser && currentUser.uid === userId) {
                return {
                    user: currentUser,
                    error: null
                };
            }
            return {
                user: null,
                error: 'Session expired - please login again'
            };
        } catch (error) {
            console.error('Auto-login failed:', error);
            return {
                user: null,
                error: error.message
            };
        }
    }
    static async resetPassword(email) {
        try {
            const { sendPasswordResetEmail } = await __turbopack_context__.A("[project]/node_modules/firebase/auth/dist/esm/index.esm.js [app-client] (ecmascript, async loader)");
            const actionCodeSettings = ("TURBOPACK compile-time truthy", 1) ? {
                url: "".concat(window.location.origin, "/auth/reset-password"),
                handleCodeInApp: true
            } : "TURBOPACK unreachable";
            await sendPasswordResetEmail(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"], email, actionCodeSettings);
            return {
                error: null
            };
        } catch (error) {
            return {
                error: error.message
            };
        }
    }
    static async verifyPasswordResetCode(oobCode) {
        try {
            const { verifyPasswordResetCode } = await __turbopack_context__.A("[project]/node_modules/firebase/auth/dist/esm/index.esm.js [app-client] (ecmascript, async loader)");
            const email = await verifyPasswordResetCode(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"], oobCode);
            return {
                email,
                error: null
            };
        } catch (error) {
            return {
                email: null,
                error: error.message
            };
        }
    }
    static async confirmPasswordReset(oobCode, newPassword) {
        try {
            const { confirmPasswordReset } = await __turbopack_context__.A("[project]/node_modules/firebase/auth/dist/esm/index.esm.js [app-client] (ecmascript, async loader)");
            await confirmPasswordReset(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"], oobCode, newPassword);
            return {
                error: null
            };
        } catch (error) {
            return {
                error: error.message
            };
        }
    }
    static async updatePassword(newPassword) {
        try {
            const { updatePassword } = await __turbopack_context__.A("[project]/node_modules/firebase/auth/dist/esm/index.esm.js [app-client] (ecmascript, async loader)");
            const user = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"].currentUser;
            if (!user) throw new Error('No user logged in');
            await updatePassword(user, newPassword);
            return {
                error: null
            };
        } catch (error) {
            return {
                error: error.message
            };
        }
    }
    static async signInWithGoogle() {
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setPersistence"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"], __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["browserLocalPersistence"]);
            const provider = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GoogleAuthProvider"]();
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["signInWithPopup"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"], provider);
            const userProfile = await this.getUserProfile(result.user.uid);
            if (!userProfile) {
                const displayName = result.user.displayName || '';
                const nameParts = displayName.split(' ');
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'profiles', result.user.uid), {
                    id: result.user.uid,
                    first_name: nameParts[0] || '',
                    last_name: nameParts.slice(1).join(' ') || '',
                    email: result.user.email,
                    profile_completed: false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });
            }
            return {
                user: result.user,
                error: null
            };
        } catch (error) {
            return {
                user: null,
                error: error.message
            };
        }
    }
    static async deleteUser() {
        try {
            const user = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"].currentUser;
            if (!user) throw new Error('No user logged in');
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deleteUser"])(user);
            return {
                success: true,
                error: null
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/contexts/AuthContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "useAuthContext",
    ()=>useAuthContext
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/auth/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/auth/dist/esm/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase-setup.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase-auth.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
function AuthProvider(param) {
    let { children } = param;
    _s();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthProvider.useEffect": ()=>{
            const unsubscribe = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["onAuthStateChanged"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["auth"], {
                "AuthProvider.useEffect.unsubscribe": (firebaseUser)=>{
                    console.log('🔐 Auth state:', firebaseUser ? "User: ".concat(firebaseUser.email) : 'No user');
                    setUser(firebaseUser);
                    setLoading(false); // Done checking - we now know the real state
                }
            }["AuthProvider.useEffect.unsubscribe"]);
            return unsubscribe;
        }
    }["AuthProvider.useEffect"], []); // Run ONCE on mount
    const handleSignOut = async ()=>{
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseAuthService"].signOut();
            // Firebase will automatically trigger onAuthStateChanged with null
            // which will update our state
            // Clear any app-specific storage
            if ("TURBOPACK compile-time truthy", 1) {
                localStorage.clear();
                sessionStorage.clear();
            }
            // Redirect to auth
            window.location.replace('/auth');
        } catch (error) {
            console.error('Sign out error:', error);
            // Force redirect even on error
            window.location.replace('/auth');
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            user,
            loading,
            signOut: handleSignOut
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/contexts/AuthContext.tsx",
        lineNumber: 54,
        columnNumber: 5
    }, this);
}
_s(AuthProvider, "NiO5z6JIqzX62LS5UWDgIqbZYyY=");
_c = AuthProvider;
function useAuthContext() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within AuthProvider');
    }
    return context;
}
_s1(useAuthContext, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "AuthProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/firebase-database.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FirebaseDatabaseService",
    ()=>FirebaseDatabaseService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$firestore$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/firestore/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/firebase/node_modules/@firebase/firestore/dist/index.esm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase-setup.ts [app-client] (ecmascript)");
;
;
class FirebaseDatabaseService {
    // Get all praise nights (pages) - optimized for millions of users
    static async getPraiseNights() {
        let limitCount = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 10;
        try {
            const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'praise_nights'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["orderBy"])('createdAt', 'desc'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["limit"])(limitCount));
            const querySnapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
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
            const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'songs'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('praiseNightId', '==', praiseNightId));
            const querySnapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
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
            const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'songs', songId);
            const docSnap = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDoc"])(docRef);
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
            const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'profiles', userId);
            const docSnap = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDoc"])(docRef);
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
            const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'profiles', userId);
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateDoc"])(docRef, {
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
            const querySnapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'profiles'));
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
        const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'praise_nights'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["orderBy"])('createdAt', 'desc'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["limit"])(10));
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["onSnapshot"])(q, (querySnapshot)=>{
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
            const docRef = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'praise_nights'), pageData);
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
            const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'praise_nights', id);
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateDoc"])(docRef, {
                ...data,
                updatedAt: new Date()
            });
            // Log activity
            if ("TURBOPACK compile-time truthy", 1) {
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
    // Delete praise night
    static async deletePraiseNight(id) {
        try {
            const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'praise_nights', id);
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deleteDoc"])(docRef);
            // Log activity
            if ("TURBOPACK compile-time truthy", 1) {
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
    // Test connection
    static async testConnection() {
        try {
            // Test if Firestore is initialized
            if (!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"]) {
                return {
                    status: 'error',
                    message: 'Firestore not initialized'
                };
            }
            // Test if we can access the database
            const testCollection = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'test');
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
    static async getCollection(collectionName) {
        let maxLimit = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 500;
        try {
            // Use limit to prevent fetching entire large collections
            const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], collectionName), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["limit"])(maxLimit));
            const querySnapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
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
            console.error("Error getting collection ".concat(collectionName, ":"), error);
            return [];
        }
    }
    // Get ALL documents from a collection (no limit) - use carefully!
    static async getAllFromCollection(collectionName) {
        try {
            const querySnapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], collectionName));
            return querySnapshot.docs.map((doc)=>{
                const data = doc.data();
                return {
                    id: doc.id,
                    firebaseId: doc.id,
                    ...data
                };
            });
        } catch (error) {
            console.error("Error getting all from ".concat(collectionName, ":"), error);
            return [];
        }
    }
    // Batch fetch with cursor pagination - for large collections like analytics
    // Returns data in batches and calls onBatch callback for each batch
    static async getCollectionInBatches(collectionName) {
        let batchSize = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 500, maxTotal = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 10000, orderByField = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 'timestamp', onBatch = arguments.length > 4 ? arguments[4] : void 0;
        try {
            const allResults = [];
            let lastDoc = null;
            let hasMore = true;
            console.log('[Batch] Starting batch fetch for', collectionName, '(batch size:', batchSize, ', max:', maxTotal, ')');
            while(hasMore && allResults.length < maxTotal){
                // Build query with cursor if we have a last document
                const q = lastDoc ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], collectionName), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["orderBy"])(orderByField, 'desc'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["startAfter"])(lastDoc), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["limit"])(batchSize)) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], collectionName), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["orderBy"])(orderByField, 'desc'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["limit"])(batchSize));
                const querySnapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
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
    static async getSessionsInBatches() {
        let batchSize = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 500, maxTotal = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 5000, onBatch = arguments.length > 2 ? arguments[2] : void 0;
        return this.getCollectionInBatches('analytics_sessions', batchSize, maxTotal, 'startTime', onBatch);
    }
    // Batch fetch for analytics_events (uses timestamp field)
    static async getEventsInBatches() {
        let batchSize = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 500, maxTotal = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 10000, onBatch = arguments.length > 2 ? arguments[2] : void 0;
        return this.getCollectionInBatches('analytics_events', batchSize, maxTotal, 'timestamp', onBatch);
    }
    static async getDocument(collectionName, docId) {
        try {
            const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], collectionName, docId);
            const docSnap = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDoc"])(docRef);
            if (docSnap.exists()) {
                return {
                    id: docSnap.id,
                    ...docSnap.data()
                };
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error getting document ".concat(docId, ":"), error);
            return null;
        }
    }
    static async createDocument(collectionName, docId, data) {
        try {
            const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], collectionName, docId);
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setDoc"])(docRef, data);
            // Update analytics aggregation if this is an analytics event
            if (collectionName === 'analytics_events' && data.type) {
                try {
                    const { AnalyticsAggregationService } = await __turbopack_context__.A("[project]/src/lib/analytics-aggregation-service.ts [app-client] (ecmascript, async loader)");
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
            console.error("Error creating document ".concat(docId, ":"), error);
            throw error;
        }
    }
    // Create document with auto-generated ID
    static async addDocument(collectionName, data) {
        try {
            const docRef = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], collectionName), data);
            // Update analytics aggregation if this is an analytics event
            if (collectionName === 'analytics_events' && data.type) {
                try {
                    const { AnalyticsAggregationService } = await __turbopack_context__.A("[project]/src/lib/analytics-aggregation-service.ts [app-client] (ecmascript, async loader)");
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
            console.error("Error adding document to ".concat(collectionName, ":"), error);
            throw error;
        }
    }
    static async updateDocument(collectionName, docId, data) {
        try {
            const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], collectionName, docId);
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateDoc"])(docRef, data);
            return {
                success: true
            };
        } catch (error) {
            console.error("Error updating document ".concat(docId, ":"), error);
            throw error;
        }
    }
    static async deleteDocument(collectionName, docId) {
        try {
            const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], collectionName, docId);
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deleteDoc"])(docRef);
            return {
                success: true
            };
        } catch (error) {
            console.error("Error deleting document ".concat(docId, ":"), error);
            throw error;
        }
    }
    static async getCollectionWhere(collectionName, field, operator, value) {
        try {
            const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], collectionName), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])(field, operator, value));
            const querySnapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
            return querySnapshot.docs.map((doc)=>({
                    id: doc.id,
                    ...doc.data()
                }));
        } catch (error) {
            console.error("Error getting collection ".concat(collectionName, " with where:"), error);
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
                const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], collectionName), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])(field, 'in', batchValues));
                const querySnapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
                querySnapshot.docs.forEach((doc)=>{
                    results.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
            }
            return results;
        } catch (error) {
            console.error("Error batch fetching from ".concat(collectionName, ":"), error);
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
                const promises = batchIds.map((id)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], collectionName, id)).then((docSnap)=>docSnap.exists() ? {
                            id: docSnap.id,
                            ...docSnap.data()
                        } : null).catch(()=>null));
                const batchResults = await Promise.all(promises);
                results.push(...batchResults.filter(Boolean));
            }
            return results;
        } catch (error) {
            console.error("Error batch fetching documents from ".concat(collectionName, ":"), error);
            return [];
        }
    }
    static async getDocuments(collectionName, filters) {
        try {
            console.log('[getDocuments] Querying', collectionName, 'with filters:', filters);
            let q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], collectionName));
            // Apply filters
            for (const filter of filters){
                console.log('  Adding filter:', filter.field, filter.operator, filter.value);
                q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])(q, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])(filter.field, filter.operator, filter.value));
            }
            const querySnapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
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
            const docRef = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'categories'), categoryData);
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
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'categories', categoryId.toString()), data);
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
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deleteDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'categories', categoryId.toString()));
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
            const cleanData = Object.fromEntries(Object.entries(songData).filter((param)=>{
                let [_, value] = param;
                return value !== undefined;
            }));
            console.log('Creating song with clean data:', cleanData);
            const docRef = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'songs'), cleanData);
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
            var _data_history;
            // SIMPLE: Just use the songId as-is (it's already the Firebase document ID)
            const firebaseDocId = String(songId).trim();
            if (!firebaseDocId || firebaseDocId === '' || firebaseDocId === 'null' || firebaseDocId === 'undefined') {
                console.error('Invalid song ID for update:', songId);
                return {
                    success: false,
                    error: "Invalid song ID: ".concat(songId)
                };
            }
            console.log('Updating song:', {
                firebaseDocId: firebaseDocId,
                title: data.title,
                praiseNightId: data.praiseNightId,
                hasHistory: !!data.history,
                historyCount: ((_data_history = data.history) === null || _data_history === void 0 ? void 0 : _data_history.length) || 0
            });
            // Filter out undefined values (Firebase doesn't allow them)
            const cleanData = Object.fromEntries(Object.entries(data).filter((param)=>{
                let [_, value] = param;
                return value !== undefined;
            }));
            // Remove id and firebaseId from update data (these shouldn't be updated)
            delete cleanData.id;
            delete cleanData.firebaseId;
            // Update the document
            const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'songs', firebaseDocId);
            console.log('Document path:', "songs/".concat(firebaseDocId));
            const docSnap = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDoc"])(docRef);
            if (!docSnap.exists()) {
                console.error('Song not found:', firebaseDocId);
                return {
                    success: false,
                    error: "Song not found: ".concat(firebaseDocId)
                };
            }
            // Add updatedAt timestamp
            cleanData.updatedAt = new Date();
            // Update the document
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateDoc"])(docRef, cleanData);
            console.log('Song updated successfully:', data.title);
            // Save history entries if provided
            if (data.history && data.history.length > 0) {
                console.log('Saving', data.history.length, 'history entries to Firebase...');
                // Get existing history to avoid duplicates
                const existingHistory = await this.getCollectionWhere('song_history', 'song_id', '==', firebaseDocId);
                const existingIds = new Set((existingHistory === null || existingHistory === void 0 ? void 0 : existingHistory.map((h)=>h.id)) || []);
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
                    error: "Invalid song ID: ".concat(songId)
                };
            }
            console.log('Deleting song:', firebaseDocId);
            const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'songs', firebaseDocId);
            // Check if exists first
            const docSnap = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDoc"])(docRef);
            if (!docSnap.exists()) {
                console.error('Song not found:', firebaseDocId);
                return {
                    success: false,
                    error: 'Song not found in database'
                };
            }
            // Delete it
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deleteDoc"])(docRef);
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
            const docRef = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'praise_nights'), pageData);
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
            const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'praise_nights', docId);
            const docSnap = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDoc"])(docRef);
            if (!docSnap.exists()) {
                console.error('Document does not exist:', docId);
                return false;
            }
            console.log('Document exists, current data:', docSnap.data());
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateDoc"])(docRef, data);
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
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deleteDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'praise_nights', docId));
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
            const songsQuery = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'songs'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('category', '==', oldCategory));
            const songsSnapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(songsQuery);
            // Update each song
            const updatePromises = songsSnapshot.docs.map((doc)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateDoc"])(doc.ref, {
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
            const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'song_history'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('song_id', '==', songId.toString()));
            const querySnapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
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
            const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'group_posts'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('group_id', '==', groupId), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["orderBy"])('timestamp', 'desc'));
            const querySnapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
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
            const docRef = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'group_posts'), postData);
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
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'group_posts', postId), data);
            return true;
        } catch (error) {
            console.error('Error updating group post:', error);
            return false;
        }
    }
    static async deleteGroupPost(postId) {
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deleteDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'group_posts', postId));
            return true;
        } catch (error) {
            console.error('Error deleting group post:', error);
            return false;
        }
    }
    // Create history entry
    static async createHistoryEntry(data) {
        try {
            const docRef = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'song_history'), data);
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
            const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'song_history', entryId);
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateDoc"])(docRef, {
                ...data,
                updated_at: new Date() // Add timestamp for when the history entry was updated
            });
            // Clear the history cache for this song so other components get fresh data
            if (data.song_id) {
                try {
                    const CACHE_KEY = 'song-history-cache';
                    const { offlineManager } = await __turbopack_context__.A("[project]/src/utils/offlineManager.ts [app-client] (ecmascript, async loader)");
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
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deleteDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'song_history', entryId));
            return true;
        } catch (error) {
            console.error('Error deleting history entry:', error);
            return false;
        }
    }
    // Page Category functions
    static async getPageCategories() {
        try {
            const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'page_categories'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["orderBy"])('createdAt', 'desc'));
            const querySnapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
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
            const docRef = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'page_categories'), categoryData);
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
            const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'page_categories', id);
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateDoc"])(docRef, {
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
            const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'page_categories', id);
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deleteDoc"])(docRef);
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/config/zones.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Zone configuration for LWSRH multi-tenant platform
// 9 HQ groups (unfiltered data) + 78 regional zones (filtered by zone_id) + 1 admin zone
__turbopack_context__.s([
    "BOSS_ZONE_ID",
    ()=>BOSS_ZONE_ID,
    "HQ_GROUP_IDS",
    ()=>HQ_GROUP_IDS,
    "SUPER_ADMIN_EMAIL",
    ()=>SUPER_ADMIN_EMAIL,
    "SUPER_ADMIN_UID",
    ()=>SUPER_ADMIN_UID,
    "ZONES",
    ()=>ZONES,
    "bypassesFeatureGates",
    ()=>bypassesFeatureGates,
    "getZoneById",
    ()=>getZoneById,
    "getZoneByInvitationCode",
    ()=>getZoneByInvitationCode,
    "getZoneBySlug",
    ()=>getZoneBySlug,
    "getZoneRole",
    ()=>getZoneRole,
    "hasBossAccess",
    ()=>hasBossAccess,
    "isBossCode",
    ()=>isBossCode,
    "isBossZone",
    ()=>isBossZone,
    "isCoordinatorCode",
    ()=>isCoordinatorCode,
    "isHQGroup",
    ()=>isHQGroup,
    "isSuperAdmin",
    ()=>isSuperAdmin,
    "requiresSubscription",
    ()=>requiresSubscription,
    "usesFirebaseDatabase",
    ()=>usesFirebaseDatabase
]);
const ZONES = [
    // HQ Groups - use unfiltered Firebase data
    {
        id: 'zone-001',
        name: 'Your Loveworld Singers',
        slug: 'your-loveworld-singers',
        region: 'Headquarters',
        invitationCode: 'ZONE001',
        themeColor: '#9333EA'
    },
    {
        id: 'zone-002',
        name: 'Loveworld Singers 24 Worship Band',
        slug: 'lws-24-worship',
        region: 'Headquarters',
        invitationCode: 'ZONE002',
        themeColor: '#9333EA'
    },
    {
        id: 'zone-003',
        name: 'Loveworld Singers Children Choir',
        slug: 'lws-children',
        region: 'Headquarters',
        invitationCode: 'ZONE003',
        themeColor: '#9333EA'
    },
    {
        id: 'zone-004',
        name: 'Loveworld Singers Teens Choir',
        slug: 'lws-teens',
        region: 'Headquarters',
        invitationCode: 'ZONE004',
        themeColor: '#9333EA'
    },
    {
        id: 'zone-005',
        name: 'Presidential Mass Choir',
        slug: 'presidential-mass-choir',
        region: 'Headquarters',
        invitationCode: 'ZONE005',
        themeColor: '#9333EA'
    },
    {
        id: 'zone-orchestra',
        name: 'Loveworld Singers Orchestra',
        slug: 'lws-orchestra',
        region: 'Headquarters',
        invitationCode: 'ZONEORCH',
        themeColor: '#9333EA'
    },
    {
        id: 'zone-president',
        name: 'The President Zone',
        slug: 'president-zone',
        region: 'Headquarters',
        invitationCode: 'ZONEPRES',
        themeColor: '#9333EA'
    },
    {
        id: 'zone-director',
        name: 'The Director Zone',
        slug: 'director-zone',
        region: 'Headquarters',
        invitationCode: 'ZONEDIR',
        themeColor: '#9333EA'
    },
    {
        id: 'zone-oftp',
        name: 'OFTP Pastors Zone',
        slug: 'oftp-zone',
        region: 'Headquarters',
        invitationCode: 'ZONEOFTP',
        themeColor: '#9333EA'
    },
    {
        id: 'zone-national',
        name: 'Loveworld National Zonal Choir Representatives',
        slug: 'national-zone',
        region: 'Headquarters',
        invitationCode: 'ZONENAT',
        themeColor: '#9333EA'
    },
    {
        id: 'zone-international',
        name: 'Loveworld International Zonal Choir Representatives',
        slug: 'international-zone',
        region: 'Headquarters',
        invitationCode: 'ZONEINT',
        themeColor: '#9333EA'
    },
    // South Africa
    {
        id: 'zone-006',
        name: 'Loveworld Singers SA Zone 1',
        slug: 'lws-sa-zone-1',
        region: 'South Africa',
        invitationCode: 'ZONE006',
        themeColor: '#3B82F6'
    },
    {
        id: 'zone-007',
        name: 'Loveworld Singers SA Zone 2',
        slug: 'lws-sa-zone-2',
        region: 'South Africa',
        invitationCode: 'ZONE007',
        themeColor: '#3B82F6'
    },
    {
        id: 'zone-008',
        name: 'Loveworld Singers SA Zone 3',
        slug: 'lws-sa-zone-3',
        region: 'South Africa',
        invitationCode: 'ZONE008',
        themeColor: '#3B82F6'
    },
    {
        id: 'zone-009',
        name: 'Loveworld Singers SA Zone 5',
        slug: 'lws-sa-zone-5',
        region: 'South Africa',
        invitationCode: 'ZONE009',
        themeColor: '#3B82F6'
    },
    {
        id: 'zone-010',
        name: 'Loveworld Singers Durban Zone',
        slug: 'lws-durban',
        region: 'South Africa',
        invitationCode: 'ZONE010',
        themeColor: '#3B82F6'
    },
    {
        id: 'zone-011',
        name: 'Loveworld Singers Cape Town Zone 1',
        slug: 'lws-cape-town-1',
        region: 'South Africa',
        invitationCode: 'ZONE011',
        themeColor: '#3B82F6'
    },
    {
        id: 'zone-012',
        name: 'Loveworld Singers Cape Town Zone 2',
        slug: 'lws-cape-town-2',
        region: 'South Africa',
        invitationCode: 'ZONE012',
        themeColor: '#3B82F6'
    },
    // International
    {
        id: 'zone-013',
        name: 'Loveworld Singers India Zone',
        slug: 'lws-india',
        region: 'India',
        invitationCode: 'ZONE013',
        themeColor: '#F59E0B'
    },
    {
        id: 'zone-014',
        name: 'Loveworld Singers Kenya Zone',
        slug: 'lws-kenya',
        region: 'Kenya',
        invitationCode: 'ZONE014',
        themeColor: '#EF4444'
    },
    {
        id: 'zone-015',
        name: 'Loveworld Singers Accra Ghana Zone',
        slug: 'lws-accra',
        region: 'Ghana',
        invitationCode: 'ZONE015',
        themeColor: '#8B5CF6'
    },
    // USA
    {
        id: 'zone-016',
        name: 'Loveworld Singers USA Region 1 Zone 1',
        slug: 'lws-usa-r1-z1',
        region: 'USA',
        invitationCode: 'ZONE016',
        themeColor: '#EC4899'
    },
    {
        id: 'zone-017',
        name: 'Loveworld Singers USA Region 1 Zone 2',
        slug: 'lws-usa-r1-z2',
        region: 'USA',
        invitationCode: 'ZONE017',
        themeColor: '#EC4899'
    },
    {
        id: 'zone-018',
        name: 'Loveworld Singers USA Region 2',
        slug: 'lws-usa-r2',
        region: 'USA',
        invitationCode: 'ZONE018',
        themeColor: '#EC4899'
    },
    {
        id: 'zone-019',
        name: 'Loveworld Singers USA Region 3',
        slug: 'lws-usa-r3',
        region: 'USA',
        invitationCode: 'ZONE019',
        themeColor: '#EC4899'
    },
    // Canada
    {
        id: 'zone-020',
        name: 'Loveworld Singers Ottawa Zone Canada',
        slug: 'lws-ottawa',
        region: 'Canada',
        invitationCode: 'ZONE020',
        themeColor: '#14B8A6'
    },
    {
        id: 'zone-021',
        name: 'Loveworld Singers Toronto Canada Zone',
        slug: 'lws-toronto',
        region: 'Canada',
        invitationCode: 'ZONE021',
        themeColor: '#14B8A6'
    },
    {
        id: 'zone-022',
        name: 'Loveworld Singers Quebec Zone',
        slug: 'lws-quebec',
        region: 'Canada',
        invitationCode: 'ZONE022',
        themeColor: '#14B8A6'
    },
    // United Kingdom
    {
        id: 'zone-023',
        name: 'Loveworld Singers UK Zone 1 DSP',
        slug: 'lws-uk-z1-dsp',
        region: 'United Kingdom',
        invitationCode: 'ZONE023',
        themeColor: '#6366F1'
    },
    {
        id: 'zone-024',
        name: 'Loveworld Singers UK Zone 2 DSP',
        slug: 'lws-uk-z2-dsp',
        region: 'United Kingdom',
        invitationCode: 'ZONE024',
        themeColor: '#6366F1'
    },
    {
        id: 'zone-025',
        name: 'Loveworld Singers UK Zone 3 DSP',
        slug: 'lws-uk-z3-dsp',
        region: 'United Kingdom',
        invitationCode: 'ZONE025',
        themeColor: '#6366F1'
    },
    {
        id: 'zone-026',
        name: 'Loveworld Singers UK Zone 4 DSP',
        slug: 'lws-uk-z4-dsp',
        region: 'United Kingdom',
        invitationCode: 'ZONE026',
        themeColor: '#6366F1'
    },
    {
        id: 'zone-027',
        name: 'Loveworld Singers UK Region 2 Zone 1',
        slug: 'lws-uk-r2-z1',
        region: 'United Kingdom',
        invitationCode: 'ZONE027',
        themeColor: '#6366F1'
    },
    {
        id: 'zone-028',
        name: 'Loveworld Singers UK Region 2 Zone 3',
        slug: 'lws-uk-r2-z3',
        region: 'United Kingdom',
        invitationCode: 'ZONE028',
        themeColor: '#6366F1'
    },
    {
        id: 'zone-029',
        name: 'Loveworld Singers UK Region 2 Zone 4',
        slug: 'lws-uk-r2-z4',
        region: 'United Kingdom',
        invitationCode: 'ZONE029',
        themeColor: '#6366F1'
    },
    // Western Europe
    {
        id: 'zone-030',
        name: 'Loveworld Singers Western Europe Zone 1',
        slug: 'lws-we-z1',
        region: 'Western Europe',
        invitationCode: 'ZONE030',
        themeColor: '#F97316'
    },
    {
        id: 'zone-031',
        name: 'Loveworld Singers Western Europe Zone 2',
        slug: 'lws-we-z2',
        region: 'Western Europe',
        invitationCode: 'ZONE031',
        themeColor: '#F97316'
    },
    {
        id: 'zone-032',
        name: 'Loveworld Singers Western Europe Zone 3',
        slug: 'lws-we-z3',
        region: 'Western Europe',
        invitationCode: 'ZONE032',
        themeColor: '#F97316'
    },
    {
        id: 'zone-033',
        name: 'Loveworld Singers Western Europe Zone 4',
        slug: 'lws-we-z4',
        region: 'Western Europe',
        invitationCode: 'ZONE033',
        themeColor: '#F97316'
    },
    // Other regions
    {
        id: 'zone-034',
        name: 'Loveworld Singers Eastern Europe',
        slug: 'lws-eastern-europe',
        region: 'Eastern Europe',
        invitationCode: 'ZONE034',
        themeColor: '#84CC16'
    },
    {
        id: 'zone-035',
        name: 'Loveworld Singers East Asia Region',
        slug: 'lws-east-asia',
        region: 'East Asia',
        invitationCode: 'ZONE035',
        themeColor: '#06B6D4'
    },
    {
        id: 'zone-036',
        name: 'Loveworld Singers Middle East and Asia',
        slug: 'lws-middle-east-asia',
        region: 'Middle East',
        invitationCode: 'ZONE036',
        themeColor: '#A855F7'
    },
    {
        id: 'zone-037',
        name: 'Loveworld Singers Australia',
        slug: 'lws-australia',
        region: 'Australia',
        invitationCode: 'ZONE037',
        themeColor: '#22D3EE'
    },
    {
        id: 'zone-038',
        name: 'Loveworld Singers South America NZ Pacific',
        slug: 'lws-sa-pacific',
        region: 'South America',
        invitationCode: 'ZONE038',
        themeColor: '#FB923C'
    },
    // Nigeria - Ministry Centres
    {
        id: 'zone-039',
        name: 'Loveworld Singers Ministry Centre Abuja',
        slug: 'lws-mc-abuja',
        region: 'Nigeria',
        invitationCode: 'ZONE039',
        themeColor: '#10B981'
    },
    {
        id: 'zone-040',
        name: 'Loveworld Singers Ministry Centre Calabar',
        slug: 'lws-mc-calabar',
        region: 'Nigeria',
        invitationCode: 'ZONE040',
        themeColor: '#10B981'
    },
    {
        id: 'zone-041',
        name: 'Loveworld Singers Ministry Centre Abeokuta',
        slug: 'lws-mc-abeokuta',
        region: 'Nigeria',
        invitationCode: 'ZONE041',
        themeColor: '#10B981'
    },
    {
        id: 'zone-042',
        name: 'Loveworld Singers Ministry Centre Ibadan',
        slug: 'lws-mc-ibadan',
        region: 'Nigeria',
        invitationCode: 'ZONE042',
        themeColor: '#10B981'
    },
    {
        id: 'zone-043',
        name: 'Loveworld Singers Warri Ministry Centre',
        slug: 'lws-mc-warri',
        region: 'Nigeria',
        invitationCode: 'ZONE043',
        themeColor: '#10B981'
    },
    // Nigeria - Lagos
    {
        id: 'zone-044',
        name: 'Loveworld Singers Lagos Zone 1',
        slug: 'lws-lagos-z1',
        region: 'Nigeria',
        invitationCode: 'ZONE044',
        themeColor: '#10B981'
    },
    {
        id: 'zone-045',
        name: 'Loveworld Singers Lagos Zone 2',
        slug: 'lws-lagos-z2',
        region: 'Nigeria',
        invitationCode: 'ZONE045',
        themeColor: '#10B981'
    },
    {
        id: 'zone-046',
        name: 'Loveworld Singers Lagos Zone 3',
        slug: 'lws-lagos-z3',
        region: 'Nigeria',
        invitationCode: 'ZONE046',
        themeColor: '#10B981'
    },
    {
        id: 'zone-047',
        name: 'Loveworld Singers Lagos Zone 4',
        slug: 'lws-lagos-z4',
        region: 'Nigeria',
        invitationCode: 'ZONE047',
        themeColor: '#10B981'
    },
    {
        id: 'zone-048',
        name: 'Loveworld Singers Lagos Zone 5',
        slug: 'lws-lagos-z5',
        region: 'Nigeria',
        invitationCode: 'ZONE048',
        themeColor: '#10B981'
    },
    {
        id: 'zone-049',
        name: 'Loveworld Singers Lagos Zone 6',
        slug: 'lws-lagos-z6',
        region: 'Nigeria',
        invitationCode: 'ZONE049',
        themeColor: '#10B981'
    },
    {
        id: 'zone-050',
        name: 'Loveworld Singers Lagos Sub Zone A',
        slug: 'lws-lagos-sza',
        region: 'Nigeria',
        invitationCode: 'ZONE050',
        themeColor: '#10B981'
    },
    {
        id: 'zone-051',
        name: 'Loveworld Singers Lagos Sub Zone B',
        slug: 'lws-lagos-szb',
        region: 'Nigeria',
        invitationCode: 'ZONE051',
        themeColor: '#10B981'
    },
    {
        id: 'zone-052',
        name: 'Loveworld Singers Lagos Sub Zone C',
        slug: 'lws-lagos-szc',
        region: 'Nigeria',
        invitationCode: 'ZONE052',
        themeColor: '#10B981'
    },
    // Nigeria - Regional
    {
        id: 'zone-053',
        name: 'Loveworld Singers Abuja Zone',
        slug: 'lws-abuja',
        region: 'Nigeria',
        invitationCode: 'ZONE053',
        themeColor: '#10B981'
    },
    {
        id: 'zone-054',
        name: 'Loveworld Singers Aba Zone',
        slug: 'lws-aba',
        region: 'Nigeria',
        invitationCode: 'ZONE054',
        themeColor: '#10B981'
    },
    {
        id: 'zone-055',
        name: 'Loveworld Singers Ibadan Zone 1',
        slug: 'lws-ibadan-z1',
        region: 'Nigeria',
        invitationCode: 'ZONE055',
        themeColor: '#10B981'
    },
    {
        id: 'zone-056',
        name: 'Loveworld Singers Onitsha Zone',
        slug: 'lws-onitsha',
        region: 'Nigeria',
        invitationCode: 'ZONE056',
        themeColor: '#10B981'
    },
    {
        id: 'zone-057',
        name: 'Loveworld Singers Port Harcourt Zone 1',
        slug: 'lws-ph-z1',
        region: 'Nigeria',
        invitationCode: 'ZONE057',
        themeColor: '#10B981'
    },
    {
        id: 'zone-058',
        name: 'Loveworld Singers Port Harcourt Zone 2',
        slug: 'lws-ph-z2',
        region: 'Nigeria',
        invitationCode: 'ZONE058',
        themeColor: '#10B981'
    },
    {
        id: 'zone-059',
        name: 'Loveworld Singers Port Harcourt Zone 3',
        slug: 'lws-ph-z3',
        region: 'Nigeria',
        invitationCode: 'ZONE059',
        themeColor: '#10B981'
    },
    {
        id: 'zone-060',
        name: 'Loveworld Singers Warri DSC Sub Zone',
        slug: 'lws-warri-dsc',
        region: 'Nigeria',
        invitationCode: 'ZONE060',
        themeColor: '#10B981'
    },
    {
        id: 'zone-061',
        name: 'Loveworld Singers Nigeria North Central Zone 1',
        slug: 'lws-ng-nc-z1',
        region: 'Nigeria',
        invitationCode: 'ZONE061',
        themeColor: '#10B981'
    },
    {
        id: 'zone-062',
        name: 'Loveworld Singers Nigeria North Central Zone 2',
        slug: 'lws-ng-nc-z2',
        region: 'Nigeria',
        invitationCode: 'ZONE062',
        themeColor: '#10B981'
    },
    {
        id: 'zone-063',
        name: 'Loveworld Singers Nigeria North West Zone 1',
        slug: 'lws-ng-nw-z1',
        region: 'Nigeria',
        invitationCode: 'ZONE063',
        themeColor: '#10B981'
    },
    {
        id: 'zone-064',
        name: 'Loveworld Singers Nigeria North West Zone 2',
        slug: 'lws-ng-nw-z2',
        region: 'Nigeria',
        invitationCode: 'ZONE064',
        themeColor: '#10B981'
    },
    {
        id: 'zone-065',
        name: 'Loveworld Singers Nigeria North East Zone 1',
        slug: 'lws-ng-ne-z1',
        region: 'Nigeria',
        invitationCode: 'ZONE065',
        themeColor: '#10B981'
    },
    {
        id: 'zone-066',
        name: 'Loveworld Singers Nigeria South West Zone 2',
        slug: 'lws-ng-sw-z2',
        region: 'Nigeria',
        invitationCode: 'ZONE066',
        themeColor: '#10B981'
    },
    {
        id: 'zone-067',
        name: 'Loveworld Singers Nigeria South West Zone 3',
        slug: 'lws-ng-sw-z3',
        region: 'Nigeria',
        invitationCode: 'ZONE067',
        themeColor: '#10B981'
    },
    {
        id: 'zone-068',
        name: 'Loveworld Singers Nigeria South West Zone 4',
        slug: 'lws-ng-sw-z4',
        region: 'Nigeria',
        invitationCode: 'ZONE068',
        themeColor: '#10B981'
    },
    {
        id: 'zone-069',
        name: 'Loveworld Singers South West Zone 5',
        slug: 'lws-ng-sw-z5',
        region: 'Nigeria',
        invitationCode: 'ZONE069',
        themeColor: '#10B981'
    },
    {
        id: 'zone-070',
        name: 'Loveworld Singers Nigeria South South Zone 1',
        slug: 'lws-ng-ss-z1',
        region: 'Nigeria',
        invitationCode: 'ZONE070',
        themeColor: '#10B981'
    },
    {
        id: 'zone-071',
        name: 'Loveworld Singers Nigeria South South Zone 2',
        slug: 'lws-ng-ss-z2',
        region: 'Nigeria',
        invitationCode: 'ZONE071',
        themeColor: '#10B981'
    },
    {
        id: 'zone-072',
        name: 'Loveworld Singers Nigeria South South Zone 3',
        slug: 'lws-ng-ss-z3',
        region: 'Nigeria',
        invitationCode: 'ZONE072',
        themeColor: '#10B981'
    },
    {
        id: 'zone-073',
        name: 'Loveworld Singers Nigeria South East Zone 1',
        slug: 'lws-ng-se-z1',
        region: 'Nigeria',
        invitationCode: 'ZONE073',
        themeColor: '#10B981'
    },
    {
        id: 'zone-074',
        name: 'Loveworld Singers Nigeria South East Zone 3',
        slug: 'lws-ng-se-z3',
        region: 'Nigeria',
        invitationCode: 'ZONE074',
        themeColor: '#10B981'
    },
    {
        id: 'zone-075',
        name: 'Loveworld Singers Benin Zone 1',
        slug: 'lws-benin-z1',
        region: 'Nigeria',
        invitationCode: 'ZONE075',
        themeColor: '#10B981'
    },
    {
        id: 'zone-076',
        name: 'Loveworld Singers Benin Zone 2',
        slug: 'lws-benin-z2',
        region: 'Nigeria',
        invitationCode: 'ZONE076',
        themeColor: '#10B981'
    },
    {
        id: 'zone-077',
        name: 'Loveworld Singers Edo North Zone',
        slug: 'lws-edo-north',
        region: 'Nigeria',
        invitationCode: 'ZONE077',
        themeColor: '#10B981'
    },
    {
        id: 'zone-078',
        name: 'Loveworld Singers Midwest Zone',
        slug: 'lws-midwest',
        region: 'Nigeria',
        invitationCode: 'ZONE078',
        themeColor: '#10B981'
    },
    // EWCA
    {
        id: 'zone-079',
        name: 'Loveworld Singers EWCA Zone 1 Ethiopia',
        slug: 'lws-ewca-z1-ethiopia',
        region: 'EWCA',
        invitationCode: 'ZONE079',
        themeColor: '#DC2626'
    },
    {
        id: 'zone-080',
        name: 'Loveworld Singers EWCA Zone 2',
        slug: 'lws-ewca-z2',
        region: 'EWCA',
        invitationCode: 'ZONE080',
        themeColor: '#DC2626'
    },
    {
        id: 'zone-081',
        name: 'Loveworld Singers EWCA Zone 3',
        slug: 'lws-ewca-z3',
        region: 'EWCA',
        invitationCode: 'ZONE081',
        themeColor: '#DC2626'
    },
    {
        id: 'zone-082',
        name: 'Loveworld Singers EWCA Zone 4',
        slug: 'lws-ewca-z4',
        region: 'EWCA',
        invitationCode: 'ZONE082',
        themeColor: '#DC2626'
    },
    {
        id: 'zone-083',
        name: 'Loveworld Singers EWCA Zone 5',
        slug: 'lws-ewca-z5',
        region: 'EWCA',
        invitationCode: 'ZONE083',
        themeColor: '#DC2626'
    },
    {
        id: 'zone-084',
        name: 'Loveworld Singers EWCA Zone 6',
        slug: 'lws-ewca-z6',
        region: 'EWCA',
        invitationCode: 'ZONE084',
        themeColor: '#DC2626'
    },
    // Other
    {
        id: 'zone-085',
        name: 'Loveworld Singers Chad Zone',
        slug: 'lws-chad',
        region: 'Chad',
        invitationCode: 'ZONE085',
        themeColor: '#059669'
    },
    {
        id: 'zone-086',
        name: 'Loveworld Singers CELVZ',
        slug: 'lws-celvz',
        region: 'Special',
        invitationCode: 'ZONE086',
        themeColor: '#7C3AED'
    },
    {
        id: 'zone-087',
        name: 'Loveworld Singers LGN',
        slug: 'lws-lgn',
        region: 'Special',
        invitationCode: 'ZONE087',
        themeColor: '#7C3AED'
    },
    // Admin zone
    {
        id: 'zone-boss',
        name: 'Central Admin',
        slug: 'central-admin',
        region: 'Admin',
        invitationCode: 'BOSS101',
        themeColor: '#DC2626'
    }
];
function getZoneByInvitationCode(code) {
    if (code.startsWith('ZNL')) {
        const memberCode = code.substring(3);
        return ZONES.find((zone)=>zone.invitationCode === memberCode);
    }
    return ZONES.find((zone)=>zone.invitationCode === code);
}
function isCoordinatorCode(code) {
    return code.startsWith('ZNL');
}
function isBossCode(code) {
    return code === 'BOSS101';
}
function getZoneRole(code) {
    if (code === 'BOSS101') return 'boss';
    return code.startsWith('ZNL') ? 'coordinator' : 'member';
}
function getZoneBySlug(slug) {
    return ZONES.find((zone)=>zone.slug === slug);
}
function getZoneById(id) {
    return ZONES.find((zone)=>zone.id === id);
}
const SUPER_ADMIN_EMAIL = 'superadmin@lwsrh.com';
const SUPER_ADMIN_UID = 'super-admin-bypass';
function isSuperAdmin(email, uid) {
    if (!email && !uid) return false;
    if (email && email === SUPER_ADMIN_EMAIL) return true;
    if (uid && uid === SUPER_ADMIN_UID) return true;
    return false;
}
function isBossZone(zoneId) {
    return zoneId === 'zone-boss';
}
const BOSS_ZONE_ID = 'zone-boss';
const HQ_GROUP_IDS = [
    'zone-001',
    'zone-002',
    'zone-003',
    'zone-004',
    'zone-005',
    'zone-orchestra',
    'zone-president',
    'zone-director',
    'zone-oftp',
    'zone-national',
    'zone-international'
];
function isHQGroup(zoneId) {
    if (!zoneId) return false;
    return HQ_GROUP_IDS.includes(zoneId) || zoneId === BOSS_ZONE_ID;
}
function usesFirebaseDatabase(zoneId) {
    return isHQGroup(zoneId);
}
function hasBossAccess(role, zoneId) {
    return role === 'boss' || zoneId === BOSS_ZONE_ID;
}
function bypassesFeatureGates(zoneId) {
    return isHQGroup(zoneId) || zoneId === BOSS_ZONE_ID;
}
function requiresSubscription(zoneId) {
    return !bypassesFeatureGates(zoneId);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/hq-members-service.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// HQ Members Service
// Manages membership for HQ groups (zone-001 to zone-005)
// Separate from zone_members but uses same authentication
__turbopack_context__.s([
    "HQMembersService",
    ()=>HQMembersService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase-database.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/config/zones.ts [app-client] (ecmascript)");
;
;
class HQMembersService {
    /**
   * Add member to HQ group
   */ static async addMember(data) {
        try {
            // Validate it's an HQ group
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isHQGroup"])(data.hqGroupId)) {
                console.error('❌ Not an HQ group:', data.hqGroupId);
                return {
                    success: false,
                    error: 'Not an HQ group'
                };
            }
            console.log('📝 Adding member to HQ group:', data.hqGroupId);
            const memberData = {
                userId: data.userId,
                userEmail: data.userEmail,
                userName: data.userName,
                hqGroupId: data.hqGroupId,
                role: data.role || 'member',
                joinedAt: new Date(),
                invitedBy: data.invitedBy || null,
                status: 'active'
            };
            // Check if already exists
            const existing = await this.getMemberByUserId(data.userId, data.hqGroupId);
            if (existing) {
                console.log('⚠️ Member already exists in HQ group');
                return {
                    success: false,
                    error: 'Member already exists'
                };
            }
            // Add to hq_members collection
            const result = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].createDocument('hq_members', "".concat(data.userId, "_").concat(data.hqGroupId), memberData);
            console.log('✅ HQ member added successfully');
            return {
                success: true,
                member: result
            };
        } catch (error) {
            console.error('❌ Error adding HQ member:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
   * Get member by user ID and HQ group
   */ static async getMemberByUserId(userId, hqGroupId) {
        try {
            const members = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].getCollectionWhere('hq_members', 'userId', '==', userId);
            return members.find((m)=>m.hqGroupId === hqGroupId) || null;
        } catch (error) {
            console.error('❌ Error getting HQ member:', error);
            return null;
        }
    }
    /**
   * Get all HQ groups for a user
   */ static async getUserHQGroups(userId) {
        try {
            console.log('🔍 Getting HQ groups for user:', userId);
            const members = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].getCollectionWhere('hq_members', 'userId', '==', userId);
            console.log('✅ Found', members.length, 'HQ group memberships');
            return members;
        } catch (error) {
            console.error('❌ Error getting user HQ groups:', error);
            return [];
        }
    }
    /**
   * Get all members of an HQ group
   */ static async getHQGroupMembers(hqGroupId) {
        try {
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isHQGroup"])(hqGroupId)) {
                console.error('❌ Not an HQ group:', hqGroupId);
                return [];
            }
            console.log('🔍 Getting members for HQ group:', hqGroupId);
            const members = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].getCollectionWhere('hq_members', 'hqGroupId', '==', hqGroupId);
            console.log('✅ Found', members.length, 'HQ members');
            return members;
        } catch (error) {
            console.error('❌ Error getting HQ group members:', error);
            return [];
        }
    }
    /**
   * Update member role
   */ static async updateMemberRole(userId, hqGroupId, role) {
        try {
            const docId = "".concat(userId, "_").concat(hqGroupId);
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].updateDocument('hq_members', docId, {
                role,
                updatedAt: new Date()
            });
            console.log('✅ HQ member role updated');
            return {
                success: true
            };
        } catch (error) {
            console.error('❌ Error updating HQ member role:', error);
            return {
                success: false
            };
        }
    }
    /**
   * Remove member from HQ group
   */ static async removeMember(userId, hqGroupId) {
        try {
            const docId = "".concat(userId, "_").concat(hqGroupId);
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].deleteDocument('hq_members', docId);
            console.log('✅ HQ member removed');
            return {
                success: true
            };
        } catch (error) {
            console.error('❌ Error removing HQ member:', error);
            return {
                success: false
            };
        }
    }
    /**
   * Check if user is HQ member
   */ static async isHQMember(userId) {
        try {
            const hqGroups = await this.getUserHQGroups(userId);
            return hqGroups.length > 0;
        } catch (error) {
            console.error('❌ Error checking HQ membership:', error);
            return false;
        }
    }
    /**
   * Check if user is HQ coordinator
   */ static async isHQCoordinator(userId, hqGroupId) {
        try {
            const member = await this.getMemberByUserId(userId, hqGroupId);
            return (member === null || member === void 0 ? void 0 : member.role) === 'coordinator';
        } catch (error) {
            console.error('❌ Error checking HQ coordinator:', error);
            return false;
        }
    }
    /**
   * Get HQ member count for a group
   */ static async getHQGroupMemberCount(hqGroupId) {
        try {
            const members = await this.getHQGroupMembers(hqGroupId);
            return members.length;
        } catch (error) {
            console.error('❌ Error getting HQ member count:', error);
            return 0;
        }
    }
    /**
   * Activate/Deactivate member
   */ static async updateMemberStatus(userId, hqGroupId, status) {
        try {
            const docId = "".concat(userId, "_").concat(hqGroupId);
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].updateDocument('hq_members', docId, {
                status,
                updatedAt: new Date()
            });
            console.log('✅ HQ member status updated');
            return {
                success: true
            };
        } catch (error) {
            console.error('❌ Error updating HQ member status:', error);
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
"[project]/src/config/roles.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// User Roles Configuration
__turbopack_context__.s([
    "HQ_ADMIN_EMAILS",
    ()=>HQ_ADMIN_EMAILS,
    "ROLE_PERMISSIONS",
    ()=>ROLE_PERMISSIONS,
    "canAccessAllHQGroups",
    ()=>canAccessAllHQGroups,
    "getUserGlobalRole",
    ()=>getUserGlobalRole,
    "getUserRoleInZone",
    ()=>getUserRoleInZone,
    "hasPermission",
    ()=>hasPermission,
    "isHQAdminEmail",
    ()=>isHQAdminEmail,
    "isHQAdministrator",
    ()=>isHQAdministrator,
    "shouldShowAdminButton",
    ()=>shouldShowAdminButton
]);
const ROLE_PERMISSIONS = {
    // Super Admin - Organization level (YOU)
    // Can VIEW all zones and ASSIGN zone coordinators
    super_admin: {
        // Zone Management - FULL ACCESS (for all zones)
        canManageZone: true,
        canViewZoneSettings: true,
        canUpgradeSubscription: true,
        canCancelSubscription: true,
        canViewPaymentHistory: true,
        // Member Management - FULL ACCESS (can assign coordinators)
        canAddMembers: true,
        canRemoveMembers: true,
        canViewMembers: true,
        canShareInviteLink: true,
        // Content Management - FULL ACCESS (for all zones)
        canCreatePraiseNight: true,
        canEditPraiseNight: true,
        canDeletePraiseNight: true,
        canCreateSong: true,
        canEditSong: true,
        canDeleteSong: true,
        canCreateCategory: true,
        canEditCategory: true,
        canDeleteCategory: true,
        // Super Admin Only
        canViewAllZones: true,
        canAccessSuperAdmin: true,
        canAccessBoss: false
    },
    // Boss - Can view everything across all zones but cannot edit super admin content
    // Has full visibility but limited editing rights
    boss: {
        // Zone Management - VIEW ONLY
        canManageZone: false,
        canViewZoneSettings: true,
        canUpgradeSubscription: false,
        canCancelSubscription: false,
        canViewPaymentHistory: true,
        // Member Management - VIEW ONLY
        canAddMembers: false,
        canRemoveMembers: false,
        canViewMembers: true,
        canShareInviteLink: false,
        // Content Management - VIEW ONLY
        canCreatePraiseNight: false,
        canEditPraiseNight: false,
        canDeletePraiseNight: false,
        canCreateSong: false,
        canEditSong: false,
        canDeleteSong: false,
        canCreateCategory: false,
        canEditCategory: false,
        canDeleteCategory: false,
        // Boss Access
        canViewAllZones: true,
        canAccessSuperAdmin: false,
        canAccessBoss: true
    },
    // Zone Coordinator - The person who pays for the zone
    // Has FULL ADMIN rights for THEIR zone only
    zone_coordinator: {
        // Zone Management - FULL ACCESS
        canManageZone: true,
        canViewZoneSettings: true,
        canUpgradeSubscription: true,
        canCancelSubscription: true,
        canViewPaymentHistory: true,
        // Member Management - FULL ACCESS
        canAddMembers: true,
        canRemoveMembers: true,
        canViewMembers: true,
        canShareInviteLink: true,
        // Content Management - FULL ACCESS
        canCreatePraiseNight: true,
        canEditPraiseNight: true,
        canDeletePraiseNight: true,
        canCreateSong: true,
        canEditSong: true,
        canDeleteSong: true,
        canCreateCategory: true,
        canEditCategory: true,
        canDeleteCategory: true,
        // Super Admin Only
        canViewAllZones: false,
        canAccessSuperAdmin: false,
        canAccessBoss: false
    },
    // Zone Member - Regular user
    // Can only VIEW content, no admin rights
    zone_member: {
        // Zone Management - NO ACCESS
        canManageZone: false,
        canViewZoneSettings: false,
        canUpgradeSubscription: false,
        canCancelSubscription: false,
        canViewPaymentHistory: false,
        // Member Management - NO ACCESS
        canAddMembers: false,
        canRemoveMembers: false,
        canViewMembers: true,
        canShareInviteLink: false,
        // Content Management - NO ACCESS
        canCreatePraiseNight: false,
        canEditPraiseNight: false,
        canDeletePraiseNight: false,
        canCreateSong: false,
        canEditSong: false,
        canDeleteSong: false,
        canCreateCategory: false,
        canEditCategory: false,
        canDeleteCategory: false,
        // Super Admin Only
        canViewAllZones: false,
        canAccessSuperAdmin: false,
        canAccessBoss: false
    },
    // HQ Admin - Headquarters administrator
    // Can manage ALL HQ groups and their members (like super admin but for HQ only)
    hq_admin: {
        // Zone Management - FULL ACCESS for HQ groups
        canManageZone: true,
        canViewZoneSettings: true,
        canUpgradeSubscription: false,
        canCancelSubscription: false,
        canViewPaymentHistory: false,
        // Member Management - FULL ACCESS (can manage HQ group members)
        canAddMembers: true,
        canRemoveMembers: true,
        canViewMembers: true,
        canShareInviteLink: true,
        // Content Management - FULL ACCESS for HQ groups
        canCreatePraiseNight: true,
        canEditPraiseNight: true,
        canDeletePraiseNight: true,
        canCreateSong: true,
        canEditSong: true,
        canDeleteSong: true,
        canCreateCategory: true,
        canEditCategory: true,
        canDeleteCategory: true,
        // HQ Admin Access - Can view all HQ groups and access admin features
        canViewAllZones: true,
        canAccessSuperAdmin: true,
        canAccessBoss: false
    },
    // HQ Member - Headquarters group member
    // Full access like coordinator but for HQ groups (no subscription needed)
    hq_member: {
        // Zone Management - FULL ACCESS (no subscription needed)
        canManageZone: true,
        canViewZoneSettings: true,
        canUpgradeSubscription: false,
        canCancelSubscription: false,
        canViewPaymentHistory: false,
        // Member Management - FULL ACCESS
        canAddMembers: true,
        canRemoveMembers: true,
        canViewMembers: true,
        canShareInviteLink: true,
        // Content Management - FULL ACCESS
        canCreatePraiseNight: true,
        canEditPraiseNight: true,
        canDeletePraiseNight: true,
        canCreateSong: true,
        canEditSong: true,
        canDeleteSong: true,
        canCreateCategory: true,
        canEditCategory: true,
        canDeleteCategory: true,
        // Super Admin Only
        canViewAllZones: false,
        canAccessSuperAdmin: false,
        canAccessBoss: false
    }
};
function hasPermission(role, permission) {
    return ROLE_PERMISSIONS[role][permission];
}
function getUserRoleInZone(userId, zoneId, zoneMembership, userEmail) {
    // Check if super admin
    if (zoneMembership === null || zoneMembership === void 0 ? void 0 : zoneMembership.isSuperAdmin) {
        return 'super_admin';
    }
    // Check if boss
    if ((zoneMembership === null || zoneMembership === void 0 ? void 0 : zoneMembership.role) === 'boss' || zoneId === 'zone-boss') {
        return 'boss';
    }
    // Check if HQ admin by email (for HQ groups)
    if (isHQGroup(zoneId) && userEmail && isHQAdminEmail(userEmail)) {
        return 'hq_admin';
    }
    // Check if HQ admin (specific role for HQ group administrators)
    if (isHQGroup(zoneId) && (zoneMembership === null || zoneMembership === void 0 ? void 0 : zoneMembership.role) === 'hq_admin') {
        return 'hq_admin';
    }
    // Check if HQ group member (zones 001-005)
    if (isHQGroup(zoneId)) {
        return 'hq_member';
    }
    // Check if zone coordinator (the one who created/pays for the zone)
    if ((zoneMembership === null || zoneMembership === void 0 ? void 0 : zoneMembership.role) === 'coordinator') {
        return 'zone_coordinator';
    }
    // Default to member
    return 'zone_member';
}
function getUserGlobalRole(userEmail) {
    if (!userEmail) return null;
    // Check if HQ admin by email
    if (isHQAdminEmail(userEmail)) {
        return 'hq_admin';
    }
    return null;
}
// Helper to check if zone is HQ group
function isHQGroup(zoneId) {
    if (!zoneId) return false;
    const HQ_GROUP_IDS = [
        'zone-001',
        'zone-002',
        'zone-003',
        'zone-004',
        'zone-005'
    ];
    return HQ_GROUP_IDS.includes(zoneId);
}
function canAccessAllHQGroups(role) {
    return role === 'super_admin' || role === 'boss' || role === 'hq_admin';
}
function isHQAdministrator(role) {
    return role === 'hq_admin';
}
const HQ_ADMIN_EMAILS = [
    'lliamzelvin@gmail.com',
    'ihenacho23@gmail.com',
    'ephraimloveworld1@gmail.com',
    'takeshopstores@gmail.com',
    'nnennawealth@gmail.com'
];
function isHQAdminEmail(email) {
    if (!email) return false;
    return HQ_ADMIN_EMAILS.includes(email.toLowerCase());
}
function shouldShowAdminButton(userEmail, currentRole) {
    if (!userEmail) return false;
    // Show admin button for HQ admins
    if (isHQAdminEmail(userEmail)) {
        return true;
    }
    // Show admin button for other admin roles
    if (currentRole && (currentRole === 'super_admin' || currentRole === 'boss' || currentRole === 'zone_coordinator' || currentRole === 'hq_admin')) {
        return true;
    }
    return false;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/hooks/useZone.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useZone",
    ()=>useZone
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/contexts/AuthContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase-database.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$hq$2d$members$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/hq-members-service.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/config/zones.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$roles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/config/roles.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
;
;
;
;
;
const getUserZonePreferenceKey = (userId)=>"lwsrh-user-zone-".concat(userId);
function getUserZonePreference(userId) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        return localStorage.getItem(getUserZonePreferenceKey(userId));
    } catch (e) {
        return null;
    }
}
function setUserZonePreference(userId, zoneId) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        localStorage.setItem(getUserZonePreferenceKey(userId), zoneId);
    } catch (e) {
    // Storage quota exceeded or private browsing
    }
}
const ZONE_CACHE_KEY = 'lwsrh-zone-cache-v6';
const ZONE_CACHE_TTL = 5 * 60 * 1000;
function getZoneCache(userId) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        const cached = localStorage.getItem(ZONE_CACHE_KEY);
        if (!cached) return null;
        const data = JSON.parse(cached);
        if (data.userId === userId && Date.now() - data.timestamp < ZONE_CACHE_TTL) {
            return data;
        }
        return null;
    } catch (e) {
        return null;
    }
}
function setZoneCache(data) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        localStorage.setItem(ZONE_CACHE_KEY, JSON.stringify({
            ...data,
            timestamp: Date.now()
        }));
    } catch (e) {}
}
function clearZoneCache() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    localStorage.removeItem(ZONE_CACHE_KEY);
}
function useZone() {
    _s();
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuthContext"])();
    const [currentZone, setCurrentZone] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [userZones, setUserZones] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [userRole, setUserRole] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('zone_member');
    const [isSuperAdminUser, setIsSuperAdminUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [currentZoneMembership, setCurrentZoneMembership] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const lastLoadedUserId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const isFetching = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const [initialLoadComplete, setInitialLoadComplete] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Track when initial load is complete
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useZone.useEffect": ()=>{
            if (!isLoading && initialLoadComplete === false) {
                setInitialLoadComplete(true);
            }
        }
    }["useZone.useEffect"], [
        isLoading,
        initialLoadComplete
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useZone.useEffect": ()=>{
            if (!(user === null || user === void 0 ? void 0 : user.uid)) {
                setCurrentZone(null);
                setUserZones([]);
                setUserRole('zone_member');
                setIsSuperAdminUser(false);
                setIsLoading(false);
                lastLoadedUserId.current = null;
                return;
            }
            const savedZoneId = getUserZonePreference(user.uid);
            const cached = getZoneCache(user.uid);
            if (cached && cached.userZones.length > 0) {
                const preferredZoneId = savedZoneId || cached.currentZoneId;
                const zone = preferredZoneId ? cached.userZones.find({
                    "useZone.useEffect": (z)=>z.id === preferredZoneId
                }["useZone.useEffect"]) || cached.userZones[0] : cached.userZones[0];
                setCurrentZone(zone || null);
                setUserZones(cached.userZones);
                setUserRole(cached.userRole);
                setIsSuperAdminUser(cached.isSuperAdmin);
                setIsLoading(false);
                lastLoadedUserId.current = user.uid;
                return;
            }
            if (isFetching.current && lastLoadedUserId.current === user.uid) return;
            loadUserZones(user.uid, user.email || '', savedZoneId || undefined);
        }
    }["useZone.useEffect"], [
        user === null || user === void 0 ? void 0 : user.uid,
        user === null || user === void 0 ? void 0 : user.email
    ]);
    const loadUserZones = async (userId, email, preferredZoneId)=>{
        if (isFetching.current && !preferredZoneId) return;
        isFetching.current = true;
        setIsLoading(true);
        try {
            const superAdmin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSuperAdmin"])(email, userId);
            if (superAdmin) {
                const targetZone = preferredZoneId ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ZONES"].find((z)=>z.id === preferredZoneId) || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ZONES"][0] : __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ZONES"][0];
                setCurrentZone(targetZone);
                setUserZones(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ZONES"]);
                setIsSuperAdminUser(true);
                setUserRole('super_admin');
                setIsLoading(false);
                lastLoadedUserId.current = userId;
                setZoneCache({
                    userId,
                    currentZoneId: targetZone.id,
                    userZones: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ZONES"],
                    userRole: 'super_admin',
                    isSuperAdmin: true
                });
                isFetching.current = false;
                return;
            }
            const [zoneMemberships, hqMemberships] = await Promise.all([
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].getCollectionWhere('zone_members', 'userId', '==', userId),
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$hq$2d$members$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HQMembersService"].getUserHQGroups(userId)
            ]);
            const memberships = [
                ...zoneMemberships,
                ...hqMemberships.map((hq)=>({
                        ...hq,
                        zoneId: hq.hqGroupId,
                        isHQMember: true
                    }))
            ];
            if (memberships.length === 0) {
                setCurrentZone(null);
                setUserZones([]);
                setUserRole('zone_member');
                setIsLoading(false);
                isFetching.current = false;
                return;
            }
            const zones = memberships.map((m)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ZONES"].find((z)=>z.id === m.zoneId)).filter((z)=>z !== undefined);
            const targetZone = preferredZoneId ? zones.find((z)=>z.id === preferredZoneId) || zones[0] : zones[0];
            const targetMembership = memberships.find((m)=>m.zoneId === (targetZone === null || targetZone === void 0 ? void 0 : targetZone.id));
            let role = 'zone_member';
            if ((targetMembership === null || targetMembership === void 0 ? void 0 : targetMembership.role) === 'coordinator') {
                role = 'zone_coordinator';
            } else if (targetZone && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isHQGroup"])(targetZone.id)) {
                role = 'hq_member';
            }
            setCurrentZone(targetZone || null);
            setUserZones(zones);
            setUserRole(role);
            setCurrentZoneMembership(targetMembership);
            setIsSuperAdminUser(false);
            setIsLoading(false);
            setZoneCache({
                userId,
                currentZoneId: (targetZone === null || targetZone === void 0 ? void 0 : targetZone.id) || null,
                userZones: zones,
                userRole: role,
                isSuperAdmin: false
            });
            lastLoadedUserId.current = userId;
        } catch (error) {
            console.error('Error loading zones:', error);
            setIsLoading(false);
        } finally{
            isFetching.current = false;
        }
    };
    const switchZone = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useZone.useCallback[switchZone]": async (zoneId)=>{
            const zone = userZones.find({
                "useZone.useCallback[switchZone].zone": (z)=>z.id === zoneId
            }["useZone.useCallback[switchZone].zone"]);
            if (!zone || !user) return false;
            setUserZonePreference(user.uid, zoneId);
            clearZoneCache();
            setCurrentZone(zone);
            let membership = null;
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isHQGroup"])(zoneId)) {
                membership = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$hq$2d$members$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HQMembersService"].getMemberByUserId(user.uid, zoneId);
                if (membership) {
                    membership.zoneId = membership.hqGroupId;
                    membership.isHQMember = true;
                }
            } else {
                const zoneMemberships = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].getCollectionWhere('zone_members', 'userId', '==', user.uid);
                membership = zoneMemberships.find({
                    "useZone.useCallback[switchZone]": (m)=>m.zoneId === zoneId
                }["useZone.useCallback[switchZone]"]);
            }
            let role = 'zone_member';
            if ((membership === null || membership === void 0 ? void 0 : membership.role) === 'coordinator') {
                role = 'zone_coordinator';
            } else if ((membership === null || membership === void 0 ? void 0 : membership.isHQMember) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isHQGroup"])(zoneId)) {
                role = 'hq_member';
            }
            setCurrentZoneMembership(membership);
            setUserRole(role);
            setZoneCache({
                userId: user.uid,
                currentZoneId: zoneId,
                userZones,
                userRole: role,
                isSuperAdmin: isSuperAdminUser
            });
            return true;
        }
    }["useZone.useCallback[switchZone]"], [
        userZones,
        user,
        isSuperAdminUser
    ]);
    const refreshZones = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useZone.useCallback[refreshZones]": async ()=>{
            if ((user === null || user === void 0 ? void 0 : user.uid) && (user === null || user === void 0 ? void 0 : user.email)) {
                clearZoneCache();
                setIsLoading(true);
                const savedZoneId = getUserZonePreference(user.uid);
                await loadUserZones(user.uid, user.email, savedZoneId || undefined);
            }
        }
    }["useZone.useCallback[refreshZones]"], [
        user === null || user === void 0 ? void 0 : user.uid,
        user === null || user === void 0 ? void 0 : user.email
    ]);
    const availableZones = userZones;
    const allZones = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "useZone.useMemo[allZones]": ()=>isSuperAdminUser ? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ZONES"] : []
    }["useZone.useMemo[allZones]"], [
        isSuperAdminUser
    ]);
    const isZoneCoordinator = userRole === 'zone_coordinator';
    const hasPermission = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useZone.useCallback[hasPermission]": (permission)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$roles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasPermission"])(userRole, permission)
    }["useZone.useCallback[hasPermission]"], [
        userRole
    ]);
    return {
        currentZone,
        userZones,
        availableZones,
        allZones,
        isLoading,
        isSuperAdmin: isSuperAdminUser,
        isZoneCoordinator,
        userRole,
        hasPermission,
        currentZoneMembership,
        switchZone,
        refreshZones,
        initialLoadComplete
    };
}
_s(useZone, "EXmaBSrYegolbjr6Qnaem+mAo9k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuthContext"]
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/hooks/useAuth.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/contexts/AuthContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase-database.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
;
;
// 5 minute TTL prevents stale data while reducing Firestore reads
const PROFILE_CACHE_KEY = 'lwsrh-profile-cache-v1';
const PROFILE_CACHE_TTL = 5 * 60 * 1000;
function getProfileCache(userId) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        const cached = localStorage.getItem(PROFILE_CACHE_KEY);
        if (!cached) return null;
        const data = JSON.parse(cached);
        if (data.userId === userId && Date.now() - data.timestamp < PROFILE_CACHE_TTL) {
            return data.profile;
        }
        return null;
    } catch (e) {
        return null;
    }
}
function setProfileCache(userId, profile) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        const data = {
            userId,
            profile,
            timestamp: Date.now()
        };
        localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(data));
    } catch (e) {
    // Storage quota exceeded or private browsing
    }
}
function clearProfileCache() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    localStorage.removeItem(PROFILE_CACHE_KEY);
}
function useAuth() {
    _s();
    const { user, loading, signOut } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuthContext"])();
    const [profile, setProfile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [profileLoading, setProfileLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const lastFetchedUserId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const isFetching = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const [initialLoadComplete, setInitialLoadComplete] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Track when initial load is complete
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useAuth.useEffect": ()=>{
            if (!loading && initialLoadComplete === false) {
                setInitialLoadComplete(true);
            }
        }
    }["useAuth.useEffect"], [
        loading,
        initialLoadComplete
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useAuth.useEffect": ()=>{
            if (!(user === null || user === void 0 ? void 0 : user.uid)) {
                setProfile(null);
                lastFetchedUserId.current = null;
                clearProfileCache();
                return;
            }
            if (lastFetchedUserId.current === user.uid && profile) {
                return;
            }
            const cachedProfile = getProfileCache(user.uid);
            if (cachedProfile) {
                setProfile(cachedProfile);
                lastFetchedUserId.current = user.uid;
                return;
            }
            if (isFetching.current) return;
            isFetching.current = true;
            setProfileLoading(true);
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].getDocument('profiles', user.uid).then({
                "useAuth.useEffect": (doc)=>{
                    if (doc) {
                        const profileData = doc;
                        setProfile(profileData);
                        setProfileCache(user.uid, profileData);
                        lastFetchedUserId.current = user.uid;
                    }
                }
            }["useAuth.useEffect"]).catch({
                "useAuth.useEffect": (err)=>{
                    console.error('Failed to load profile:', err);
                }
            }["useAuth.useEffect"]).finally({
                "useAuth.useEffect": ()=>{
                    setProfileLoading(false);
                    isFetching.current = false;
                }
            }["useAuth.useEffect"]);
        }
    }["useAuth.useEffect"], [
        user === null || user === void 0 ? void 0 : user.uid
    ]);
    const refreshProfile = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useAuth.useCallback[refreshProfile]": async ()=>{
            if (!(user === null || user === void 0 ? void 0 : user.uid)) return;
            clearProfileCache();
            const doc = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].getDocument('profiles', user.uid);
            if (doc) {
                const profileData = doc;
                setProfile(profileData);
                setProfileCache(user.uid, profileData);
            }
        }
    }["useAuth.useCallback[refreshProfile]"], [
        user === null || user === void 0 ? void 0 : user.uid
    ]);
    return {
        user,
        profile,
        // Show content once user exists, even if profile still loading
        isLoading: loading && !user,
        isProfileLoading: profileLoading,
        initialLoadComplete,
        signOut,
        refreshProfile
    };
}
_s(useAuth, "CylnnkjAH/hZFofw6j9pBC/iD0M=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$AuthContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuthContext"]
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/config/subscriptions.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Subscription Tiers Configuration
__turbopack_context__.s([
    "ESPEES_CONFIG",
    ()=>ESPEES_CONFIG,
    "FEATURE_DESCRIPTIONS",
    ()=>FEATURE_DESCRIPTIONS,
    "KINGSPAY_CONFIG",
    ()=>KINGSPAY_CONFIG,
    "SUBSCRIPTION_PLANS",
    ()=>SUBSCRIPTION_PLANS,
    "calculateYearlySavings",
    ()=>calculateYearlySavings,
    "displayMemberLimit",
    ()=>displayMemberLimit,
    "formatEspeesAmount",
    ()=>formatEspeesAmount,
    "formatPrice",
    ()=>formatPrice,
    "getMemberLimit",
    ()=>getMemberLimit,
    "hasFeatureAccess",
    ()=>hasFeatureAccess
]);
const SUBSCRIPTION_PLANS = {
    free: {
        tier: 'free',
        name: 'Free',
        price: {
            monthly: 0,
            yearly: 0
        },
        features: {
            maxMembers: 20,
            audioLab: false,
            rehearsals: false,
            customSongs: false,
            analytics: false,
            aiTranslation: true
        },
        description: 'Perfect for small groups getting started'
    },
    premium: {
        tier: 'premium',
        name: 'Premium',
        price: {
            monthly: 100,
            yearly: 1200 // 12 Espees (1200 KOBE) per year
        },
        features: {
            maxMembers: -1,
            audioLab: true,
            rehearsals: true,
            customSongs: true,
            analytics: true,
            aiTranslation: true
        },
        description: 'Unlimited members and full access',
        popular: true
    }
};
const KINGSPAY_CONFIG = {
    apiUrl: 'https://api.kingspay-gs.com/api/payment',
    paymentUrl: 'https://kingspay-gs.com/payment',
    currency: 'ESP',
    paymentType: 'espees',
    merchantName: 'LoveWorld Singers Rehearsal Hub'
};
const ESPEES_CONFIG = {
    code: 'LWSRHP',
    name: 'Espees',
    description: 'LoveWorld Singers Rehearsal Hub Payment',
    currency: 'ESP',
    symbol: 'E',
    instructions: [
        'Click "Pay with KingsPay" button below',
        'You will be redirected to KingsPay Goods & Services',
        'Complete the payment using your Espees account',
        'You will be redirected back after payment',
        'Your subscription will be activated automatically'
    ]
};
const FEATURE_DESCRIPTIONS = {
    maxMembers: 'Maximum number of members in your zone',
    audioLab: 'Access to audio lab for song practice',
    rehearsals: 'Track rehearsal attendance and progress',
    customSongs: 'Create and manage your own songs',
    analytics: 'View detailed analytics and reports',
    aiTranslation: 'AI-powered lyrics translation'
};
function displayMemberLimit(tier) {
    const limit = SUBSCRIPTION_PLANS[tier].features.maxMembers;
    return limit === -1 ? 'Unlimited' : limit.toString();
}
function formatPrice(amount) {
    const espees = amount / 100; // Convert KOBE to Espees
    return "".concat(espees.toFixed(espees % 1 === 0 ? 0 : 2), " ").concat(ESPEES_CONFIG.symbol);
}
function calculateYearlySavings() {
    const monthlyTotal = SUBSCRIPTION_PLANS.premium.price.monthly * 12;
    const yearlyPrice = SUBSCRIPTION_PLANS.premium.price.yearly;
    return monthlyTotal - yearlyPrice;
}
function formatEspeesAmount(kobeAmount) {
    return "".concat((kobeAmount / 100).toFixed(2), " ").concat(ESPEES_CONFIG.symbol);
}
function hasFeatureAccess(tier, feature) {
    return SUBSCRIPTION_PLANS[tier].features[feature];
}
function getMemberLimit(tier) {
    const limit = SUBSCRIPTION_PLANS[tier].features.maxMembers;
    return limit === -1 ? Infinity : limit; // -1 becomes unlimited (Infinity)
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/user-role-utils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// User Role Utilities
// Determines user permissions based on email prefix and zone context
__turbopack_context__.s([
    "canManageZoneSubscription",
    ()=>canManageZoneSubscription,
    "canSeeUpgradePrompts",
    ()=>canSeeUpgradePrompts,
    "getUserDisplayRole",
    ()=>getUserDisplayRole,
    "getUserPermissions",
    ()=>getUserPermissions,
    "hasZoneElevatedPermissions",
    ()=>hasZoneElevatedPermissions,
    "isBoss",
    ()=>isBoss,
    "isZoneCoordinator",
    ()=>isZoneCoordinator,
    "isZoneLeader",
    ()=>isZoneLeader
]);
// Boss emails that have full access to all features in all zones
const BOSS_EMAILS = [
    'takeshopstores@gmail.com'
];
function isBoss(user) {
    var _user_email;
    if (!user) return false;
    const email = (_user_email = user.email) === null || _user_email === void 0 ? void 0 : _user_email.toLowerCase();
    // Check if user has boss role
    if (user.role === 'boss') return true;
    // Check if email starts with "BOSS"
    if (email === null || email === void 0 ? void 0 : email.startsWith('boss')) return true;
    // Check if email is in boss emails list
    if (email && BOSS_EMAILS.includes(email)) return true;
    return false;
}
function isZoneLeader(user) {
    if (!(user === null || user === void 0 ? void 0 : user.email)) return false;
    // Check if email starts with "ZNL" (case insensitive)
    return user.email.toLowerCase().startsWith('znl');
}
function canSeeUpgradePrompts(user) {
    return isZoneLeader(user);
}
function isZoneCoordinator(user) {
    if (!user) return false;
    // Check if user has coordinator role or is a zone leader
    return user.administration === 'Coordinator' || isZoneLeader(user);
}
function canManageZoneSubscription(user) {
    return isZoneCoordinator(user) || isZoneLeader(user);
}
function getUserDisplayRole(user) {
    if (!user) return 'Guest';
    if (isBoss(user)) return 'Central Admin';
    if (isZoneLeader(user)) return 'Zone Leader';
    if (user.administration === 'Coordinator') return 'Zone Coordinator';
    if (user.administration === 'Assistant Coordinator') return 'Assistant Coordinator';
    if (user.administration) return user.administration;
    if (user.role === 'admin') return 'Admin';
    return 'Member';
}
function hasZoneElevatedPermissions(user) {
    return isZoneLeader(user) || isZoneCoordinator(user);
}
function getUserPermissions(user) {
    return {
        isBoss: isBoss(user),
        isZoneLeader: isZoneLeader(user),
        isZoneCoordinator: isZoneCoordinator(user),
        canSeeUpgradePrompts: canSeeUpgradePrompts(user),
        canManageSubscription: canManageZoneSubscription(user),
        hasElevatedPermissions: hasZoneElevatedPermissions(user),
        displayRole: getUserDisplayRole(user)
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/contexts/SubscriptionContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// @ts-nocheck
__turbopack_context__.s([
    "SubscriptionProvider",
    ()=>SubscriptionProvider,
    "useSubscription",
    ()=>useSubscription
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useZone$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useZone.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useAuth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useAuth.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase-database.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$subscriptions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/config/subscriptions.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$user$2d$role$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/user-role-utils.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
const SubscriptionContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function SubscriptionProvider(param) {
    let { children } = param;
    _s();
    const { currentZone } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useZone$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useZone"])();
    const [subscription, setSubscription] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    // Use auth hook to check for Boss role
    const { profile } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useAuth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    // Load subscription for current zone
    const loadSubscription = async ()=>{
        if (!currentZone) {
            setSubscription(null);
            setIsLoading(false);
            return;
        }
        try {
            console.log('🔍 Loading subscription for zone:', currentZone.id);
            // Get zone data which includes subscription info
            const zoneData = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].getDocument('zones', currentZone.id);
            if (!zoneData) {
                // Zone doesn't exist in Firebase yet, create with free tier
                console.log('📝 Creating zone with free tier');
                await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].createDocument('zones', currentZone.id, {
                    id: currentZone.id,
                    name: currentZone.name,
                    slug: currentZone.slug,
                    region: currentZone.region,
                    invitationCode: currentZone.invitationCode,
                    themeColor: currentZone.themeColor,
                    memberCount: 0,
                    maxMembers: 20,
                    subscriptionTier: 'free',
                    subscriptionStatus: 'active',
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                // Set default free subscription
                setSubscription({
                    id: "sub_".concat(currentZone.id),
                    zoneId: currentZone.id,
                    tier: 'free',
                    status: 'active',
                    startDate: new Date(),
                    expiresAt: null,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            } else {
                // Zone exists, use its subscription data
                setSubscription({
                    id: zoneData.subscriptionId || "sub_".concat(currentZone.id),
                    zoneId: currentZone.id,
                    tier: zoneData.subscriptionTier || 'free',
                    status: zoneData.subscriptionStatus || 'active',
                    startDate: zoneData.subscriptionStartDate || new Date(),
                    expiresAt: zoneData.subscriptionExpiresAt || null,
                    paymentMethod: zoneData.paymentMethod,
                    amount: zoneData.subscriptionAmount,
                    currency: zoneData.subscriptionCurrency,
                    createdAt: zoneData.createdAt || new Date(),
                    updatedAt: zoneData.updatedAt || new Date()
                });
            }
            console.log('✅ Subscription loaded');
        } catch (error) {
            console.error('❌ Error loading subscription:', error);
            // Default to free tier on error
            setSubscription({
                id: "sub_".concat(currentZone.id),
                zoneId: currentZone.id,
                tier: 'free',
                status: 'active',
                startDate: new Date(),
                expiresAt: null,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        } finally{
            setIsLoading(false);
        }
    };
    // Load subscription when zone changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SubscriptionProvider.useEffect": ()=>{
            console.log('📦 Subscription: Zone changed to', currentZone === null || currentZone === void 0 ? void 0 : currentZone.id, currentZone === null || currentZone === void 0 ? void 0 : currentZone.name);
            loadSubscription();
        }
    }["SubscriptionProvider.useEffect"], [
        currentZone === null || currentZone === void 0 ? void 0 : currentZone.id,
        currentZone === null || currentZone === void 0 ? void 0 : currentZone.name
    ]);
    // Refresh subscription
    const refreshSubscription = async ()=>{
        setIsLoading(true);
        await loadSubscription();
    };
    // Import bypassesFeatureGates at module level for consistency
    const { bypassesFeatureGates } = __turbopack_context__.r("[project]/src/config/zones.ts [app-client] (ecmascript)");
    const contextValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "SubscriptionProvider.useMemo[contextValue]": ()=>{
            // Check if HQ group (unlimited access, no subscription needed)
            const isHQGroup = currentZone && bypassesFeatureGates(currentZone.id);
            console.log('📦 Subscription Context Update:', {
                zoneId: currentZone === null || currentZone === void 0 ? void 0 : currentZone.id,
                zoneName: currentZone === null || currentZone === void 0 ? void 0 : currentZone.name,
                isHQGroup,
                subscriptionTier: subscription === null || subscription === void 0 ? void 0 : subscription.tier,
                isLoading
            });
            // Check if zone has access to a feature - defined inside useMemo to capture current values
            const hasFeature = {
                "SubscriptionProvider.useMemo[contextValue].hasFeature": (feature)=>{
                    // Boss bypasses all feature checks
                    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$user$2d$role$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isBoss"])(profile)) return true;
                    // HQ members bypass all feature checks (unlimited access)
                    if (isHQGroup) {
                        return true;
                    }
                    // While loading, allow access (optimistic rendering like Instagram)
                    if (isLoading) return true;
                    // No subscription = free tier
                    if (!subscription) return false;
                    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$subscriptions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasFeatureAccess"])(subscription.tier, feature);
                }
            }["SubscriptionProvider.useMemo[contextValue].hasFeature"];
            // Check if zone can add more members
            const canAddMember = {
                "SubscriptionProvider.useMemo[contextValue].canAddMember": async ()=>{
                    if (!currentZone || !subscription) return false;
                    try {
                        const zoneData = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].getDocument('zones', currentZone.id);
                        const currentMemberCount = (zoneData === null || zoneData === void 0 ? void 0 : zoneData.memberCount) || 0;
                        const limit = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$subscriptions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMemberLimit"])(subscription.tier);
                        return currentMemberCount < limit;
                    } catch (error) {
                        console.error('Error checking member limit:', error);
                        return false;
                    }
                }
            }["SubscriptionProvider.useMemo[contextValue].canAddMember"];
            return {
                subscription,
                isLoading,
                hasFeature,
                canAddMember,
                memberLimit: isHQGroup ? 999999 : subscription ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$subscriptions$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getMemberLimit"])(subscription.tier) : 20,
                isFreeTier: isHQGroup ? false : (subscription === null || subscription === void 0 ? void 0 : subscription.tier) === 'free',
                isPremiumTier: isHQGroup ? true : (subscription === null || subscription === void 0 ? void 0 : subscription.tier) === 'premium',
                refreshSubscription
            };
        }
    }["SubscriptionProvider.useMemo[contextValue]"], [
        subscription,
        isLoading,
        currentZone,
        profile === null || profile === void 0 ? void 0 : profile.role
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SubscriptionContext.Provider, {
        value: contextValue,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/contexts/SubscriptionContext.tsx",
        lineNumber: 200,
        columnNumber: 5
    }, this);
}
_s(SubscriptionProvider, "4c6ZDfOHYC6JabWYE/04aek+QVw=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useZone$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useZone"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useAuth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"]
    ];
});
_c = SubscriptionProvider;
function useSubscription() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(SubscriptionContext);
    if (context === undefined) {
        throw new Error('useSubscription must be used within a SubscriptionProvider');
    }
    return context;
}
_s1(useSubscription, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "SubscriptionProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/pages/groups/_lib/firebase-chat-service.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Firebase Chat Service - Complete chat system with Firebase
__turbopack_context__.s([
    "FirebaseChatService",
    ()=>FirebaseChatService,
    "formatTimestamp",
    ()=>formatTimestamp
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_define_property.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$firestore$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/firestore/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/firebase/node_modules/@firebase/firestore/dist/index.esm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase-setup.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/config/zones.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$hq$2d$members$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/hq-members-service.ts [app-client] (ecmascript)");
;
;
;
;
;
const formatTimestamp = (timestamp)=>{
    try {
        if (timestamp === null || timestamp === void 0 ? void 0 : timestamp.toDate) {
            // Firestore Timestamp
            return timestamp.toDate();
        } else if (timestamp === null || timestamp === void 0 ? void 0 : timestamp.seconds) {
            // Firestore Timestamp object
            return new Date(timestamp.seconds * 1000);
        } else if (timestamp instanceof Date) {
            return timestamp;
        } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
            return new Date(timestamp);
        } else {
            return new Date() // Return current date as fallback
            ;
        }
    } catch (e) {
        return new Date() // Return current date as fallback
        ;
    }
};
class FirebaseChatService {
    // ==================== WHATSAPP CACHE CLEARING ====================
    /**
   * Clear all chat cache - WhatsApp approach
   */ static async clearChatCache() {
        try {
            console.log('🧹 [WhatsApp Mode] Clearing all chat cache...');
            // Clear IndexedDB (Firestore cache)
            if ("TURBOPACK compile-time truthy", 1) {
                const databases = await window.indexedDB.databases();
                for (const dbInfo of databases){
                    var _dbInfo_name;
                    if ((_dbInfo_name = dbInfo.name) === null || _dbInfo_name === void 0 ? void 0 : _dbInfo_name.includes('firestore')) {
                        console.log('🗑️ [WhatsApp Mode] Deleting Firestore DB:', dbInfo.name);
                        const deleteReq = window.indexedDB.deleteDatabase(dbInfo.name);
                        await new Promise((resolve)=>{
                            deleteReq.onsuccess = ()=>resolve(true);
                            deleteReq.onerror = ()=>resolve(true);
                            deleteReq.onblocked = ()=>resolve(true);
                        });
                    }
                }
            }
            // Clear localStorage chat data
            if ("TURBOPACK compile-time truthy", 1) {
                Object.keys(localStorage).forEach((key)=>{
                    if (key.includes('chat') || key.includes('firebase')) {
                        localStorage.removeItem(key);
                        console.log('🗑️ [WhatsApp Mode] Cleared localStorage:', key);
                    }
                });
            }
            console.log('✅ [WhatsApp Mode] Cache cleared completely');
        } catch (error) {
            console.error('❌ [WhatsApp Mode] Cache clear failed:', error);
        }
    }
    // ==================== USER MANAGEMENT ====================
    /**
   * Update user online status
   */ static async updateUserStatus(userId, isOnline) {
        // Disabled - we don't need online status for now
        // This was causing errors because chat_users collection doesn't exist
        return;
    }
    /**
   * Remove undefined values from object
   */ static removeUndefinedValues(obj) {
        if (obj === null || obj === undefined) return null;
        if (Array.isArray(obj)) return obj.map((item)=>this.removeUndefinedValues(item));
        if (typeof obj === 'object' && obj.constructor === Object) {
            const cleaned = {};
            for (const [key, value] of Object.entries(obj)){
                if (value !== undefined) {
                    cleaned[key] = this.removeUndefinedValues(value);
                }
            }
            return cleaned;
        }
        return obj;
    }
    /**
   * Create or update user profile
   */ static async createOrUpdateUser(userData) {
        try {
            // Remove undefined values before saving
            const cleanData = this.removeUndefinedValues(userData);
            if (!cleanData || !cleanData.id) {
                console.error('Cannot create/update user: missing id');
                return;
            }
            const userRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'chat_users', cleanData.id);
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateDoc"])(userRef, {
                ...cleanData,
                lastSeen: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["serverTimestamp"])()
            }).catch(async ()=>{
                // If document doesn't exist, create it
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'chat_users'), {
                    ...cleanData,
                    isOnline: true,
                    lastSeen: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["serverTimestamp"])()
                });
            });
        } catch (error) {
            console.error('Error creating/updating user:', error);
        }
    }
    /**
   * Get all users in a specific zone
   */ static async getZoneMembers(zoneId, currentUserId) {
        try {
            const users = [];
            const zoneDetails = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getZoneById"])(zoneId);
            // Check if this is an HQ group - if so, fetch from hq_members collection
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isHQGroup"])(zoneId)) {
                console.log('🏢 HQ Group detected, fetching from hq_members collection:', zoneId);
                const hqMembers = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$hq$2d$members$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HQMembersService"].getHQGroupMembers(zoneId);
                // Convert HQ members to ChatUser format
                for (const rawMember of hqMembers){
                    const member = rawMember;
                    if (member.userId && member.userId !== currentUserId) {
                        // Get user profile for additional info
                        try {
                            const { FirebaseDatabaseService } = await __turbopack_context__.A("[project]/src/lib/firebase-database.ts [app-client] (ecmascript, async loader)");
                            const profile = await FirebaseDatabaseService.getDocument('profiles', member.userId);
                            const fullName = profile ? "".concat(profile.first_name || '', " ").concat(profile.last_name || '').trim() || member.userName : member.userName;
                            users.push({
                                id: member.userId,
                                email: member.userEmail || '',
                                fullName: fullName || 'Unknown User',
                                profilePic: (profile === null || profile === void 0 ? void 0 : profile.profile_image) || undefined,
                                zoneId: member.hqGroupId || zoneId,
                                zoneName: (zoneDetails === null || zoneDetails === void 0 ? void 0 : zoneDetails.name) || 'Unknown Zone',
                                isOnline: false,
                                lastSeen: new Date()
                            });
                        } catch (profileError) {
                            // Fallback if profile fetch fails
                            users.push({
                                id: member.userId,
                                email: member.userEmail || '',
                                fullName: member.userName || 'Unknown User',
                                profilePic: undefined,
                                zoneId: member.hqGroupId || zoneId,
                                zoneName: (zoneDetails === null || zoneDetails === void 0 ? void 0 : zoneDetails.name) || 'Unknown Zone',
                                isOnline: false,
                                lastSeen: new Date()
                            });
                        }
                    }
                }
            } else {
                // Regular zone - fetch from zone_members collection
                console.log('📍 Regular zone, fetching from zone_members collection:', zoneId);
                const zoneMembersRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'zone_members');
                const zoneMembersQuery = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])(zoneMembersRef, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('zoneId', '==', zoneId));
                const zoneMembersSnapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(zoneMembersQuery);
                if (!zoneMembersSnapshot.empty) {
                    zoneMembersSnapshot.forEach((doc)=>{
                        const member = doc.data();
                        if (member.userId && member.userId !== currentUserId) {
                            users.push({
                                id: member.userId,
                                email: member.userEmail || '',
                                fullName: member.userName || 'Unknown User',
                                profilePic: undefined,
                                zoneId: member.zoneId || zoneId,
                                zoneName: member.zoneName || (zoneDetails === null || zoneDetails === void 0 ? void 0 : zoneDetails.name) || 'Unknown Zone',
                                isOnline: false,
                                lastSeen: new Date()
                            });
                        }
                    });
                }
            }
            // Sort by name
            users.sort((a, b)=>a.fullName.localeCompare(b.fullName));
            console.log("✅ Found ".concat(users.length, " members for zone ").concat(zoneId));
            return users;
        } catch (error) {
            console.error('Error getting zone members:', error);
            return [];
        }
    }
    /**
   * Search users by name or email - searches ALL zones (no zone filtering)
   * Anyone can search and chat with anyone from any zone
   * OPTIMIZED: Uses caching to prevent repeated fetches
   */ static async searchUsers(searchTerm, currentUserId, zoneId) {
        let isBoss = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : false;
        try {
            // SECURITY: Senior zones that should only be visible to their own zone members
            const SENIOR_ZONES = [
                'zone-president',
                'zone-director',
                'zone-oftp'
            ];
            // Check if searcher is in a senior zone - if so, they can see EVERYONE
            const isSearcherInSeniorZone = zoneId ? SENIOR_ZONES.includes(zoneId) : false;
            let allMembers = [];
            // Use a Map to deduplicate by userId (in case user is in multiple zones)
            const userMap = new Map();
            // OPTIMIZED: Use cached zone members if available and not expired
            let zoneMembersDocs;
            const now = Date.now();
            if (this.zoneMembersCache && now - this.zoneMembersCache.timestamp < this.CACHE_TTL) {
                zoneMembersDocs = this.zoneMembersCache.data;
            } else {
                // Fetch with limit to prevent massive reads
                const zoneMembersRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'zone_members');
                const zoneMembersQuery = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])(zoneMembersRef, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["limit"])(1000)) // OPTIMIZED: Limit to 1000
                ;
                const zoneMembersSnapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(zoneMembersQuery);
                zoneMembersDocs = zoneMembersSnapshot.docs.map((doc)=>({
                        id: doc.id,
                        ...doc.data()
                    }));
                // Cache the results
                this.zoneMembersCache = {
                    data: zoneMembersDocs,
                    timestamp: now
                };
            }
            zoneMembersDocs.forEach((memberDoc)=>{
                const data = memberDoc;
                // Skip current user
                if (data.userId === currentUserId) return;
                // SECURITY: Hide senior zone members from users outside their zone
                // BUT: If searcher is in a senior zone or is a boss, they can see everyone
                const memberZoneId = data.zoneId;
                if (!isSearcherInSeniorZone && !isBoss && SENIOR_ZONES.includes(memberZoneId)) {
                    // This is a senior zone member, and searcher is NOT in a senior zone and NOT a boss - hide them
                    console.log('🚫 Hiding senior zone member:', {
                        memberZoneId,
                        searcherZone: zoneId,
                        isSearcherInSeniorZone,
                        isBoss
                    });
                    return;
                }
                // Only add if not already in map (keep first occurrence)
                if (!userMap.has(data.userId)) {
                    userMap.set(data.userId, {
                        id: data.userId,
                        email: data.userEmail || '',
                        fullName: data.userName || 'Unknown User',
                        profilePic: undefined,
                        zoneId: data.zoneId,
                        zoneName: data.zoneName || 'Unknown Zone',
                        isOnline: false,
                        lastSeen: new Date()
                    });
                }
            });
            // Also get all HQ members from all HQ groups
            const { HQ_GROUP_IDS } = await __turbopack_context__.A("[project]/src/config/zones.ts [app-client] (ecmascript, async loader)");
            for (const hqZoneId of HQ_GROUP_IDS){
                try {
                    const hqMembers = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$hq$2d$members$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HQMembersService"].getHQGroupMembers(hqZoneId);
                    const zoneDetails = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getZoneById"])(hqZoneId);
                    for (const rawMember of hqMembers){
                        const member = rawMember;
                        if (member.userId && member.userId !== currentUserId && !userMap.has(member.userId)) {
                            // SECURITY: Hide senior zone members from users outside their zone
                            // BUT: If searcher is in a senior zone or is a boss, they can see everyone
                            const memberZoneId = member.hqGroupId || hqZoneId;
                            if (!isSearcherInSeniorZone && !isBoss && SENIOR_ZONES.includes(memberZoneId)) {
                                // This is a senior zone member, and searcher is NOT in a senior zone and NOT a boss - hide them
                                console.log('🚫 Hiding senior HQ member:', {
                                    memberZoneId,
                                    searcherZone: zoneId,
                                    isSearcherInSeniorZone,
                                    isBoss
                                });
                                continue;
                            }
                            // Get user profile for additional info
                            try {
                                const { FirebaseDatabaseService } = await __turbopack_context__.A("[project]/src/lib/firebase-database.ts [app-client] (ecmascript, async loader)");
                                const profile = await FirebaseDatabaseService.getDocument('profiles', member.userId);
                                const fullName = profile ? "".concat(profile.first_name || '', " ").concat(profile.last_name || '').trim() || member.userName : member.userName;
                                userMap.set(member.userId, {
                                    id: member.userId,
                                    email: member.userEmail || '',
                                    fullName: fullName || 'Unknown User',
                                    profilePic: (profile === null || profile === void 0 ? void 0 : profile.profile_image) || undefined,
                                    zoneId: member.hqGroupId || hqZoneId,
                                    zoneName: (zoneDetails === null || zoneDetails === void 0 ? void 0 : zoneDetails.name) || 'Unknown Zone',
                                    isOnline: false,
                                    lastSeen: new Date()
                                });
                            } catch (profileError) {
                                // Fallback if profile fetch fails
                                userMap.set(member.userId, {
                                    id: member.userId,
                                    email: member.userEmail || '',
                                    fullName: member.userName || 'Unknown User',
                                    profilePic: undefined,
                                    zoneId: member.hqGroupId || hqZoneId,
                                    zoneName: (zoneDetails === null || zoneDetails === void 0 ? void 0 : zoneDetails.name) || 'Unknown Zone',
                                    isOnline: false,
                                    lastSeen: new Date()
                                });
                            }
                        }
                    }
                } catch (hqError) {
                    console.error("Error fetching HQ members for ".concat(hqZoneId, ":"), hqError);
                // Continue with other HQ groups
                }
            }
            allMembers = Array.from(userMap.values());
            // Sort by name
            allMembers.sort((a, b)=>a.fullName.localeCompare(b.fullName));
            // If no search term, return all members
            if (!searchTerm || searchTerm.trim().length === 0) {
                return allMembers;
            }
            // Filter by search term
            const searchLower = searchTerm.toLowerCase();
            const filtered = allMembers.filter((user)=>{
                var _user_fullName, _user_email, _user_zoneName;
                const nameMatch = (_user_fullName = user.fullName) === null || _user_fullName === void 0 ? void 0 : _user_fullName.toLowerCase().includes(searchLower);
                const emailMatch = (_user_email = user.email) === null || _user_email === void 0 ? void 0 : _user_email.toLowerCase().includes(searchLower);
                const zoneMatch = (_user_zoneName = user.zoneName) === null || _user_zoneName === void 0 ? void 0 : _user_zoneName.toLowerCase().includes(searchLower);
                return nameMatch || emailMatch || zoneMatch;
            });
            return filtered;
        } catch (error) {
            console.error('Error searching users:', error);
            return [];
        }
    }
    /**
   * Get user by ID
   */ static async getUser(userId) {
        try {
            // First try to get from zone_members (has userName)
            const zoneMembersRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'zone_members');
            const zoneMembersQuery = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])(zoneMembersRef, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('userId', '==', userId));
            const zoneMembersSnapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(zoneMembersQuery);
            if (!zoneMembersSnapshot.empty) {
                const memberData = zoneMembersSnapshot.docs[0].data();
                const zoneId = memberData.zoneId || memberData.hqGroupId;
                const zoneDetails = zoneId ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getZoneById"])(zoneId) : null;
                return {
                    id: userId,
                    email: memberData.userEmail || '',
                    fullName: memberData.userName || 'Unknown User',
                    profilePic: undefined,
                    zoneId: zoneId,
                    zoneName: memberData.zoneName || (zoneDetails === null || zoneDetails === void 0 ? void 0 : zoneDetails.name) || (zoneId ? "Zone ".concat(zoneId) : 'No zone assigned'),
                    isOnline: false,
                    lastSeen: new Date()
                };
            }
            // Fallback to profiles collection
            const profileDoc = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'profiles', userId));
            if (profileDoc.exists()) {
                const profile = profileDoc.data();
                const zoneId = profile.zone_id || profile.zone;
                const zoneDetails = zoneId ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getZoneById"])(zoneId) : null;
                // Try to get zone name from multiple sources
                let zoneName = profile.zone_name || (zoneDetails === null || zoneDetails === void 0 ? void 0 : zoneDetails.name) || null;
                // If still no zone name, try fetching from zone_members or hq_members
                if (!zoneName && zoneId) {
                    try {
                        // Check zone_members first
                        const zoneMembersRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'zone_members');
                        const zoneMembersQuery = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])(zoneMembersRef, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('userId', '==', userId), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('zoneId', '==', zoneId));
                        const zoneMembersSnapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(zoneMembersQuery);
                        if (!zoneMembersSnapshot.empty) {
                            const memberData = zoneMembersSnapshot.docs[0].data();
                            zoneName = memberData.zoneName || (zoneDetails === null || zoneDetails === void 0 ? void 0 : zoneDetails.name) || null;
                        }
                    } catch (error) {
                        console.error('Error fetching zone name from zone_members:', error);
                    }
                }
                return {
                    id: userId,
                    email: profile.email || '',
                    fullName: "".concat(profile.first_name || '', " ").concat(profile.last_name || '').trim() || 'Unknown User',
                    profilePic: profile.profile_image_url || undefined,
                    zoneId: zoneId,
                    zoneName: zoneName || (zoneDetails === null || zoneDetails === void 0 ? void 0 : zoneDetails.name) || (zoneId ? "Zone ".concat(zoneId) : 'No zone assigned'),
                    isOnline: false,
                    lastSeen: new Date()
                };
            }
            return null;
        } catch (error) {
            console.error('Error getting user:', error);
            return null;
        }
    }
    // ==================== FRIEND SYSTEM ====================
    /**
   * Send friend request
   */ static async sendFriendRequest(fromUserId, toUserId) {
        try {
            const fromUser = await this.getUser(fromUserId);
            const toUser = await this.getUser(toUserId);
            if (!fromUser || !toUser) return false;
            const payload = {
                fromUserId,
                fromUserName: fromUser.fullName,
                toUserId,
                toUserName: toUser.fullName,
                status: 'pending',
                createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["serverTimestamp"])()
            };
            if (fromUser.profilePic) {
                payload.fromUserAvatar = fromUser.profilePic;
            }
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'friend_requests'), payload);
            return true;
        } catch (error) {
            console.error('Error sending friend request:', error);
            return false;
        }
    }
    /**
   * Get friendship status between two users
   */ static async getFriendStatus(userId, otherUserId) {
        try {
            const requestsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'friend_requests');
            const outgoingQuery = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])(requestsRef, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('fromUserId', '==', userId), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('toUserId', '==', otherUserId));
            const outgoingSnapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(outgoingQuery);
            if (!outgoingSnapshot.empty) {
                const docSnap = outgoingSnapshot.docs[0];
                const status = docSnap.data().status;
                return {
                    status: status === 'accepted' ? 'friends' : 'pending_outgoing',
                    requestId: docSnap.id
                };
            }
            const incomingQuery = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])(requestsRef, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('fromUserId', '==', otherUserId), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('toUserId', '==', userId));
            const incomingSnapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(incomingQuery);
            if (!incomingSnapshot.empty) {
                const docSnap = incomingSnapshot.docs[0];
                const status = docSnap.data().status;
                return {
                    status: status === 'accepted' ? 'friends' : 'pending_incoming',
                    requestId: docSnap.id
                };
            }
            return {
                status: 'none'
            };
        } catch (error) {
            console.error('Error checking friend status:', error);
            return {
                status: 'none'
            };
        }
    }
    /**
   * Accept friend request
   */ static async acceptFriendRequest(requestId) {
        try {
            const requestRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'friend_requests', requestId);
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateDoc"])(requestRef, {
                status: 'accepted'
            });
            return true;
        } catch (error) {
            console.error('Error accepting friend request:', error);
            return false;
        }
    }
    /**
   * Get friend requests for user
   */ static async getFriendRequests(userId) {
        try {
            const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'friend_requests'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('toUserId', '==', userId), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('status', '==', 'pending'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["orderBy"])('createdAt', 'desc'));
            const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
            const requests = [];
            snapshot.forEach((doc)=>{
                requests.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            return requests;
        } catch (error) {
            console.error('Error getting friend requests:', error);
            return [];
        }
    }
    // ==================== CHAT MANAGEMENT ====================
    /**
   * Create direct chat between two users
   */ static async createDirectChat(user1Id, user2Id) {
        try {
            // CRITICAL: Prevent self-chat creation
            if (user1Id === user2Id) {
                console.error('❌ Cannot create self-chat:', user1Id);
                return null;
            }
            // Check if chat already exists
            const existingChat = await this.findDirectChat(user1Id, user2Id);
            if (existingChat) return existingChat.id;
            // Get user names for participant mapping
            const user1 = await this.getUser(user1Id);
            const user2 = await this.getUser(user2Id);
            const participantNames = {};
            if (user1) participantNames[user1Id] = user1.fullName;
            if (user2) participantNames[user2Id] = user2.fullName;
            const chatData = {
                type: 'direct',
                participants: [
                    user1Id,
                    user2Id
                ],
                participantNames,
                admins: [],
                createdBy: user1Id,
                createdAt: new Date(),
                unreadCount: {
                    [user1Id]: 0,
                    [user2Id]: 0
                },
                isActive: true
            };
            console.log('✅ Creating direct chat between:', (user1 === null || user1 === void 0 ? void 0 : user1.fullName) || 'User1', 'and', (user2 === null || user2 === void 0 ? void 0 : user2.fullName) || 'User2');
            const docRef = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'chats'), chatData);
            return docRef.id;
        } catch (error) {
            console.error('Error creating direct chat:', error);
            return null;
        }
    }
    /**
   * Create group chat
   */ static async createGroupChat(name, description, creatorId, participantIds) {
        try {
            const allParticipants = [
                creatorId,
                ...participantIds.filter((id)=>id !== creatorId)
            ];
            const unreadCount = {};
            allParticipants.forEach((id)=>{
                unreadCount[id] = 0;
            });
            const chatData = {
                type: 'group',
                name,
                description,
                participants: allParticipants,
                admins: [
                    creatorId
                ],
                createdBy: creatorId,
                createdAt: new Date(),
                unreadCount,
                isActive: true
            };
            const docRef = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'chats'), chatData);
            return docRef.id;
        } catch (error) {
            console.error('Error creating group chat:', error);
            return null;
        }
    }
    /**
   * Find existing direct chat between two users
   */ static async findDirectChat(user1Id, user2Id) {
        try {
            const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'chats'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('type', '==', 'direct'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('participants', 'array-contains', user1Id));
            const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
            for (const doc of snapshot.docs){
                const chat = {
                    id: doc.id,
                    ...doc.data()
                };
                if (chat.participants.includes(user2Id)) {
                    return chat;
                }
            }
            return null;
        } catch (error) {
            console.error('Error finding direct chat:', error);
            return null;
        }
    }
    /**
   * Get user's chats
   */ static async getUserChats(userId) {
        try {
            const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'chats'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('participants', 'array-contains', userId), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('isActive', '==', true));
            const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
            const chats = [];
            // Process each chat and populate participant names for direct chats
            for (const doc of snapshot.docs){
                const chatData = {
                    id: doc.id,
                    ...doc.data()
                };
                // For direct chats, populate participant names if not already present
                if (chatData.type === 'direct' && !chatData.participantNames) {
                    const participantNames = {};
                    for (const participantId of chatData.participants){
                        if (participantId !== userId) {
                            try {
                                const userData = await this.getUser(participantId);
                                if (userData) {
                                    participantNames[participantId] = userData.fullName;
                                }
                            } catch (error) {
                                console.error('Error getting participant name:', error);
                                participantNames[participantId] = 'Unknown User';
                            }
                        }
                    }
                    chatData.participantNames = participantNames;
                }
                chats.push(chatData);
            }
            // Sort by last message timestamp
            return chats.sort((a, b)=>{
                var _a_lastMessage, _b_lastMessage;
                const aTime = ((_a_lastMessage = a.lastMessage) === null || _a_lastMessage === void 0 ? void 0 : _a_lastMessage.timestamp) || a.createdAt;
                const bTime = ((_b_lastMessage = b.lastMessage) === null || _b_lastMessage === void 0 ? void 0 : _b_lastMessage.timestamp) || b.createdAt;
                return new Date(bTime).getTime() - new Date(aTime).getTime();
            });
        } catch (error) {
            console.error('Error getting user chats:', error);
            return [];
        }
    }
    // ==================== MESSAGE MANAGEMENT ====================
    /**
   * Send message
   */ static async sendMessage(chatId, senderId, senderName, messageData) {
        let isBoss = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : false;
        try {
            const messageType = messageData.image ? 'image' : messageData.fileUrl ? 'file' : 'text';
            // Add (Support) label to Boss user's name
            const displayName = isBoss ? "".concat(senderName, " (Support)") : senderName;
            const message = {
                chatId,
                senderId,
                senderName: displayName,
                messageType,
                timestamp: new Date(),
                edited: false,
                reactions: []
            };
            // Only add fields that have values (avoid undefined)
            if (messageData.text) message.text = messageData.text;
            if (messageData.image) message.image = messageData.image;
            if (messageData.fileUrl) message.fileUrl = messageData.fileUrl;
            if (messageData.fileName) message.fileName = messageData.fileName;
            if (messageData.replyTo) {
                message.replyTo = messageData.replyTo.messageId;
                message.replySnippet = messageData.replyTo.snippet;
                message.replySenderName = messageData.replyTo.senderName;
            }
            // Add message
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'messages'), message);
            // Update chat's last message
            const chatRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'chats', chatId);
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateDoc"])(chatRef, {
                lastMessage: {
                    text: messageData.text || (messageData.image ? '📷 Image' : '📎 File'),
                    senderId,
                    senderName: displayName,
                    timestamp: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["serverTimestamp"])()
                }
            });
            return true;
        } catch (error) {
            console.error('Error sending message:', error);
            return false;
        }
    }
    /**
   * Edit a message
   */ static async editMessage(messageId, userId, newText) {
        try {
            const messageRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'messages', messageId);
            const messageDoc = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDoc"])(messageRef);
            if (!messageDoc.exists()) return false;
            const data = messageDoc.data();
            if (data.senderId !== userId || data.deleted) return false;
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateDoc"])(messageRef, {
                text: newText,
                edited: true,
                editedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["serverTimestamp"])()
            });
            return true;
        } catch (error) {
            console.error('Error editing message:', error);
            return false;
        }
    }
    /**
   * Delete a message (soft delete)
   */ static async deleteMessage(messageId, userId) {
        try {
            const messageRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'messages', messageId);
            const messageDoc = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDoc"])(messageRef);
            if (!messageDoc.exists()) return false;
            const data = messageDoc.data();
            if (data.senderId !== userId || data.deleted) return false;
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateDoc"])(messageRef, {
                text: 'This message was deleted',
                deleted: true,
                image: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deleteField"])(),
                fileUrl: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deleteField"])(),
                fileName: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deleteField"])(),
                replyTo: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deleteField"])(),
                replySnippet: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deleteField"])(),
                replySenderName: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deleteField"])(),
                edited: false
            });
            return true;
        } catch (error) {
            console.error('Error deleting message:', error);
            return false;
        }
    }
    /**
   * Toggle reaction (like) on a message
   */ static async toggleReaction(messageId, userId, userName) {
        let emoji = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : '❤️';
        try {
            const messageRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'messages', messageId);
            const messageDoc = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDoc"])(messageRef);
            if (!messageDoc.exists()) return;
            const data = messageDoc.data();
            const reactions = Array.isArray(data.reactions) ? [
                ...data.reactions
            ] : [];
            const existingIndex = reactions.findIndex((reaction)=>reaction.userId === userId && reaction.emoji === emoji);
            if (existingIndex >= 0) {
                reactions.splice(existingIndex, 1);
            } else {
                reactions.push({
                    userId,
                    userName,
                    emoji,
                    timestamp: new Date()
                });
            }
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateDoc"])(messageRef, {
                reactions
            });
        } catch (error) {
            console.error('Error toggling reaction:', error);
        }
    }
    /**
   * Get messages for a chat
   */ static async getMessages(chatId) {
        let limitCount = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 50;
        try {
            const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'messages'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('chatId', '==', chatId), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["orderBy"])('timestamp', 'desc'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["limit"])(limitCount));
            const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
            const messages = [];
            snapshot.forEach((doc)=>{
                messages.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            return messages.reverse() // Reverse to show oldest first
            ;
        } catch (error) {
            console.error('Error getting messages:', error);
            return [];
        }
    }
    /**
   * Subscribe to real-time messages - OPTIMIZED: Limited to 100 most recent messages
   */ static subscribeToMessages(chatId, callback) {
        console.log('🔌 [Chat] Setting up message subscription for chat:', chatId);
        if (!chatId) {
            console.error('❌ [Chat] No chatId provided for message subscription');
            callback([]);
            return ()=>{};
        }
        // Debug: Log the exact chatId being queried
        console.log('🔍 [Chat] Querying messages collection with chatId:', JSON.stringify(chatId));
        console.log('🔍 [Chat] chatId type:', typeof chatId, 'length:', chatId.length);
        // Simple query without orderBy to avoid index requirement
        // We'll sort client-side instead
        const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'messages'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('chatId', '==', chatId), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["limit"])(100));
        // Also do a one-time fetch to debug
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q).then((snapshot)=>{
            console.log('🔍 [Chat] One-time fetch result:', snapshot.docs.length, 'messages');
            if (snapshot.docs.length === 0) {
                // Try fetching ALL messages to see what chatIds exist
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'messages'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["limit"])(10))).then((allSnapshot)=>{
                    console.log('🔍 [Chat] Sample of ALL messages in collection:');
                    allSnapshot.docs.forEach((doc)=>{
                        var _data_text;
                        const data = doc.data();
                        console.log('  - Message ID:', doc.id, 'chatId:', data.chatId, 'text:', (_data_text = data.text) === null || _data_text === void 0 ? void 0 : _data_text.substring(0, 30));
                    });
                });
            }
        }).catch((err)=>{
            console.error('🔍 [Chat] One-time fetch error:', err);
        });
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["onSnapshot"])(q, (snapshot)=>{
            console.log('📨 [Chat] Message snapshot received:', snapshot.docs.length, 'messages for chat:', chatId);
            const messages = [];
            snapshot.docs.forEach((doc)=>{
                const data = doc.data();
                // Convert Firestore timestamp to Date
                let timestamp = data.timestamp;
                if (timestamp === null || timestamp === void 0 ? void 0 : timestamp.toDate) {
                    timestamp = timestamp.toDate();
                } else if (timestamp === null || timestamp === void 0 ? void 0 : timestamp.seconds) {
                    timestamp = new Date(timestamp.seconds * 1000);
                } else if (typeof timestamp === 'string') {
                    timestamp = new Date(timestamp);
                } else {
                    timestamp = new Date();
                }
                messages.push({
                    id: doc.id,
                    ...data,
                    timestamp
                });
            });
            // Sort by timestamp (oldest first) - client-side sorting
            messages.sort((a, b)=>{
                const timeA = a.timestamp instanceof Date ? a.timestamp.getTime() : new Date(a.timestamp).getTime();
                const timeB = b.timestamp instanceof Date ? b.timestamp.getTime() : new Date(b.timestamp).getTime();
                return timeA - timeB;
            });
            console.log('✅ [Chat] Returning', messages.length, 'messages (sorted client-side)');
            callback(messages);
        }, (error)=>{
            var _error_message;
            console.error('❌ [Chat] Message subscription error:', error);
            console.error('❌ [Chat] Error details:', error.message, error.code);
            // Check if it's an index error
            if ((_error_message = error.message) === null || _error_message === void 0 ? void 0 : _error_message.includes('index')) {
                console.error('🔧 [Chat] This error requires creating a Firestore composite index. Check the Firebase console.');
                console.error('🔧 [Chat] Create index: messages -> chatId (ASC) + timestamp (DESC)');
            }
            callback([]);
        });
    }
    /**
   * Subscribe to real-time chats - OPTIMIZED: Removed cache rejection to reduce reads
   */ static subscribeToChats(userId, callback) {
        console.log('🔌 [Chat] Setting up chat subscription for user:', userId);
        const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'chats'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('participants', 'array-contains', userId), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('isActive', '==', true));
        // OPTIMIZED: Accept cache to reduce reads, only fetch fresh when needed
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["onSnapshot"])(q, async (snapshot)=>{
            const chats = [];
            const selfChatsToDelete = [];
            // Process each chat with STRICT filtering
            for (const doc of snapshot.docs){
                const chatData = {
                    id: doc.id,
                    ...doc.data()
                };
                // FILTER 1: Direct chats only (groups are always valid)
                if (chatData.type === 'direct') {
                    const [p1, p2] = chatData.participants;
                    // FILTER 2: Must have exactly 2 participants
                    if (chatData.participants.length !== 2) {
                        console.log('🗑️ [Firebase] Invalid chat (wrong participant count):', doc.id, chatData.participants);
                        selfChatsToDelete.push(doc.id);
                        continue;
                    }
                    // FILTER 3: Both participants must be different people
                    if (p1 === p2) {
                        console.log('🗑️ [Firebase] Self-chat detected (duplicate):', doc.id, [
                            p1,
                            p2
                        ]);
                        selfChatsToDelete.push(doc.id);
                        continue;
                    }
                    // FILTER 4: Current user should only appear ONCE
                    const userCount = chatData.participants.filter((p)=>p === userId).length;
                    if (userCount !== 1) {
                        console.log('🗑️ [Firebase] Self-chat detected (user appears', userCount, 'times):', doc.id);
                        selfChatsToDelete.push(doc.id);
                        continue;
                    }
                    // Populate participant names for UI
                    if (!chatData.participantNames) {
                        const otherUserId = chatData.participants.find((id)=>id !== userId);
                        if (otherUserId) {
                            try {
                                const userData = await this.getUser(otherUserId);
                                if (userData) {
                                    chatData.participantNames = {
                                        [otherUserId]: userData.fullName
                                    };
                                }
                            } catch (error) {
                                console.error('Error getting participant name:', error);
                                chatData.participantNames = {
                                    [otherUserId]: 'Unknown User'
                                };
                            }
                        }
                    }
                }
                // Chat passed all filters - add it
                chats.push(chatData);
            }
            // Clean up invalid chats in background
            if (selfChatsToDelete.length > 0) {
                console.log("🧹 [Firebase] Cleaning up ".concat(selfChatsToDelete.length, " invalid chats..."));
                selfChatsToDelete.forEach(async (chatId)=>{
                    try {
                        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deleteDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'chats', chatId));
                        console.log('✅ [Firebase] Deleted invalid chat:', chatId);
                    } catch (error) {
                        console.error('❌ [Firebase] Failed to delete chat:', chatId, error);
                    }
                });
            }
            // Sort by last message time
            const sortedChats = [
                ...chats
            ].sort((a, b)=>{
                var _a_lastMessage, _b_lastMessage;
                const aTime = ((_a_lastMessage = a.lastMessage) === null || _a_lastMessage === void 0 ? void 0 : _a_lastMessage.timestamp) || a.createdAt;
                const bTime = ((_b_lastMessage = b.lastMessage) === null || _b_lastMessage === void 0 ? void 0 : _b_lastMessage.timestamp) || b.createdAt;
                const aTimeMs = formatTimestamp(aTime).getTime();
                const bTimeMs = formatTimestamp(bTime).getTime();
                return bTimeMs - aTimeMs;
            });
            console.log('✅ [Firebase] Returning', sortedChats.length, 'valid chats');
            callback(sortedChats);
        }, (error)=>{
            console.error('❌ [Firebase] Chat subscription error:', error);
            callback([]); // Return empty array on error
        });
    }
    // ==================== GROUP MANAGEMENT ====================
    /**
   * Add user to group
   */ static async addUserToGroup(chatId, userId, adminId) {
        try {
            const chatRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'chats', chatId);
            const chatDoc = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDoc"])(chatRef);
            if (!chatDoc.exists()) return false;
            const chat = chatDoc.data();
            // Check if user is admin
            if (!chat.admins.includes(adminId)) return false;
            // Add user to participants
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateDoc"])(chatRef, {
                participants: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["arrayUnion"])(userId),
                ["unreadCount.".concat(userId)]: 0
            });
            return true;
        } catch (error) {
            console.error('Error adding user to group:', error);
            return false;
        }
    }
    /**
   * Remove user from group
   */ static async removeUserFromGroup(chatId, userId, adminId) {
        try {
            const chatRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'chats', chatId);
            const chatDoc = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDoc"])(chatRef);
            if (!chatDoc.exists()) return false;
            const chat = chatDoc.data();
            // Check if user is admin
            if (!chat.admins.includes(adminId)) return false;
            // Remove user from participants and admins
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateDoc"])(chatRef, {
                participants: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["arrayRemove"])(userId),
                admins: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["arrayRemove"])(userId)
            });
            return true;
        } catch (error) {
            console.error('Error removing user from group:', error);
            return false;
        }
    }
    /**
   * Make user admin
   */ static async makeUserAdmin(chatId, userId, adminId) {
        try {
            const chatRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'chats', chatId);
            const chatDoc = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDoc"])(chatRef);
            if (!chatDoc.exists()) return false;
            const chat = chatDoc.data();
            // Check if user is admin
            if (!chat.admins.includes(adminId)) return false;
            // Add user to admins
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateDoc"])(chatRef, {
                admins: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["arrayUnion"])(userId)
            });
            return true;
        } catch (error) {
            console.error('Error making user admin:', error);
            return false;
        }
    }
    /**
   * Update group info
   */ static async updateGroupInfo(chatId, adminId, updates) {
        try {
            const chatRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'chats', chatId);
            const chatDoc = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDoc"])(chatRef);
            if (!chatDoc.exists()) return false;
            const chat = chatDoc.data();
            // Check if user is admin
            if (!chat.admins.includes(adminId)) return false;
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateDoc"])(chatRef, updates);
            return true;
        } catch (error) {
            console.error('Error updating group info:', error);
            return false;
        }
    }
    /**
   * Leave group (user removes themselves)
   */ static async leaveGroup(chatId, userId) {
        try {
            const chatRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'chats', chatId);
            const chatDoc = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDoc"])(chatRef);
            if (!chatDoc.exists()) return false;
            const chat = chatDoc.data();
            // Check if user is a participant
            if (!chat.participants.includes(userId)) return false;
            // Remove user from participants and admins (if they were an admin)
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateDoc"])(chatRef, {
                participants: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["arrayRemove"])(userId),
                admins: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["arrayRemove"])(userId)
            });
            return true;
        } catch (error) {
            console.error('Error leaving group:', error);
            return false;
        }
    }
    /**
   * Get detailed participant info for chats
   */ static async getChatParticipants(chatId) {
        try {
            const chatRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'chats', chatId);
            const chatDoc = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDoc"])(chatRef);
            if (!chatDoc.exists()) return [];
            const chat = chatDoc.data();
            const results = [];
            for (const participantId of chat.participants){
                const user = await this.getUser(participantId);
                if (user) {
                    results.push(user);
                }
            }
            return results;
        } catch (error) {
            console.error('Error getting chat participants:', error);
            return [];
        }
    }
    /**
   * Delete a chat (archives it for the user)
   */ static async deleteChat(chatId, userId) {
        try {
            const chatRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'chats', chatId);
            const chatDoc = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDoc"])(chatRef);
            if (!chatDoc.exists()) return false;
            const chat = chatDoc.data();
            // Check if user is a participant
            if (!chat.participants.includes(userId)) return false;
            // For direct chats, remove user from participants (effectively deleting it for them)
            // For group chats, just mark as inactive for the user
            if (chat.type === 'direct') {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateDoc"])(chatRef, {
                    participants: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["arrayRemove"])(userId),
                    ["unreadCount.".concat(userId)]: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deleteField"])()
                });
            } else {
                // For groups, just remove from participants
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateDoc"])(chatRef, {
                    participants: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["arrayRemove"])(userId),
                    admins: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["arrayRemove"])(userId),
                    ["unreadCount.".concat(userId)]: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deleteField"])()
                });
            }
            return true;
        } catch (error) {
            console.error('Error deleting chat:', error);
            return false;
        }
    }
    /**
   * Pin or unpin a chat
   */ static async togglePinChat(chatId, userId, pin) {
        try {
            const chatRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'chats', chatId);
            const chatDoc = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDoc"])(chatRef);
            if (!chatDoc.exists()) return false;
            const chat = chatDoc.data();
            // Check if user is a participant
            if (!chat.participants.includes(userId)) return false;
            const pinned = chat.pinned || {};
            pinned[userId] = pin;
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateDoc"])(chatRef, {
                pinned
            });
            return true;
        } catch (error) {
            console.error('Error pinning/unpinning chat:', error);
            return false;
        }
    }
    /**
   * Star or unstar a chat
   */ static async toggleStarChat(chatId, userId, star) {
        try {
            const chatRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'chats', chatId);
            const chatDoc = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDoc"])(chatRef);
            if (!chatDoc.exists()) return false;
            const chat = chatDoc.data();
            // Check if user is a participant
            if (!chat.participants.includes(userId)) return false;
            const starred = chat.starred || {};
            starred[userId] = star;
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateDoc"])(chatRef, {
                starred
            });
            return true;
        } catch (error) {
            console.error('Error starring/unstarring chat:', error);
            return false;
        }
    }
    /**
   * Star or unstar a message
   */ static async toggleStarMessage(messageId, userId) {
        try {
            // Check if message is already starred by this user
            const starredRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'starred_messages');
            const starredQuery = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])(starredRef, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('messageId', '==', messageId), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('userId', '==', userId));
            const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(starredQuery);
            if (!snapshot.empty) {
                // Unstar - delete the starred message document
                snapshot.docs.forEach((doc)=>{
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deleteDoc"])(doc.ref);
                });
                return true;
            } else {
                // Star - create a starred message document
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addDoc"])(starredRef, {
                    messageId,
                    userId,
                    createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["serverTimestamp"])()
                });
                return true;
            }
        } catch (error) {
            console.error('Error toggling star message:', error);
            return false;
        }
    }
    /**
   * Check if a message is starred by a user
   */ static async isMessageStarred(messageId, userId) {
        try {
            const starredRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'starred_messages');
            const starredQuery = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])(starredRef, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('messageId', '==', messageId), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('userId', '==', userId));
            const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(starredQuery);
            return !snapshot.empty;
        } catch (error) {
            console.error('Error checking if message is starred:', error);
            return false;
        }
    }
    /**
   * Search messages in a chat
   */ static async searchMessages(chatId, searchTerm) {
        try {
            if (!searchTerm.trim()) return [];
            const messagesRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'messages');
            const searchLower = searchTerm.toLowerCase().trim();
            // Try with orderBy first, fallback to without if index is missing
            let snapshot;
            try {
                const messagesQuery = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])(messagesRef, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('chatId', '==', chatId), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["orderBy"])('timestamp', 'desc'));
                snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(messagesQuery);
            } catch (error) {
                // If orderBy fails (likely missing index), try without it
                if (error.code === 'failed-precondition') {
                    console.log('Index missing, searching without orderBy');
                    const messagesQuery = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])(messagesRef, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('chatId', '==', chatId));
                    snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(messagesQuery);
                } else {
                    throw error;
                }
            }
            const results = [];
            snapshot.forEach((doc)=>{
                const data = doc.data();
                if (data.deleted) return; // Skip deleted messages
                const messageText = (data.text || '').toLowerCase();
                const senderName = (data.senderName || '').toLowerCase();
                // Search in message text or sender name
                if (messageText.includes(searchLower) || senderName.includes(searchLower)) {
                    results.push({
                        ...data,
                        id: doc.id,
                        timestamp: formatTimestamp(data.timestamp),
                        chatId: data.chatId,
                        senderId: data.senderId,
                        senderName: data.senderName,
                        messageType: data.messageType || 'text',
                        edited: data.edited || false,
                        reactions: data.reactions || [],
                        deleted: data.deleted || false
                    });
                }
            });
            // Sort by timestamp descending (newest first) if we didn't use orderBy
            results.sort((a, b)=>{
                const aTime = a.timestamp.getTime();
                const bTime = b.timestamp.getTime();
                return bTime - aTime;
            });
            return results;
        } catch (error) {
            console.error('Error searching messages:', error);
            return [];
        }
    }
}
// OPTIMIZED: Cache for zone members to prevent repeated fetches
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(FirebaseChatService, "zoneMembersCache", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(FirebaseChatService, "CACHE_TTL", 5 * 60 * 1000); // 5 minutes
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/pages/groups/_lib/whatsapp-presence.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * WhatsApp-Style Presence System
 * Manages online/offline status and last seen timestamps
 */ __turbopack_context__.s([
    "WhatsAppPresence",
    ()=>WhatsAppPresence
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_define_property.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$database$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/database/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/database/dist/index.esm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase-setup.ts [app-client] (ecmascript)");
;
;
;
;
// Initialize Realtime Database safely
let rtdb = null;
try {
    rtdb = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDatabase"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]);
} catch (error) {
    console.warn('⚠️ Firebase Realtime Database not configured. Presence features will be disabled.');
    console.warn('To enable presence, add a Realtime Database to your Firebase project.');
}
class WhatsAppPresence {
    /**
   * Initialize presence for a user (like WhatsApp's connection)
   */ static async initializePresence(userId) {
        if (!rtdb) {
            console.warn('⚠️ [WhatsApp Presence] Realtime Database not available, skipping presence initialization');
            return;
        }
        try {
            const presenceRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ref"])(rtdb, "presence/".concat(userId));
            // Set user as online
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["set"])(presenceRef, {
                status: 'online',
                lastSeen: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["serverTimestamp"])(),
                userId
            });
            // Set offline when disconnected (WhatsApp's approach)
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["onDisconnect"])(presenceRef).set({
                status: 'offline',
                lastSeen: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["serverTimestamp"])(),
                userId
            });
            this.presenceRefs.set(userId, presenceRef);
            console.log('✅ [WhatsApp Presence] Initialized for user:', userId);
        } catch (error) {
            console.error('❌ [WhatsApp Presence] Failed to initialize:', error);
        }
    }
    /**
   * Update user status manually
   */ static async updateStatus(userId, status) {
        if (!rtdb) return;
        try {
            const presenceRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ref"])(rtdb, "presence/".concat(userId));
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["set"])(presenceRef, {
                status,
                lastSeen: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["serverTimestamp"])(),
                userId
            });
        } catch (error) {
            console.error('❌ [WhatsApp Presence] Failed to update status:', error);
        }
    }
    /**
   * Subscribe to presence changes for multiple users
   */ static subscribeToPresence(userIds, callback) {
        if (!rtdb) {
            // Return empty presence data if Realtime Database isn't available
            const emptyPresenceMap = new Map();
            userIds.forEach((userId)=>{
                emptyPresenceMap.set(userId, {
                    status: 'offline',
                    lastSeen: Date.now(),
                    userId
                });
            });
            callback(emptyPresenceMap);
            return ()=>{} // Return empty cleanup function
            ;
        }
        const presenceMap = new Map();
        const unsubscribers = [];
        userIds.forEach((userId)=>{
            const presenceRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ref"])(rtdb, "presence/".concat(userId));
            const unsubscribe = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["onValue"])(presenceRef, (snapshot)=>{
                const data = snapshot.val();
                if (data) {
                    presenceMap.set(userId, {
                        status: data.status || 'offline',
                        lastSeen: data.lastSeen || Date.now(),
                        userId
                    });
                } else {
                    presenceMap.set(userId, {
                        status: 'offline',
                        lastSeen: Date.now(),
                        userId
                    });
                }
                callback(new Map(presenceMap));
            });
            unsubscribers.push(unsubscribe);
        });
        return ()=>{
            unsubscribers.forEach((unsub)=>unsub());
        };
    }
    /**
   * Get single user presence
   */ static async getUserPresence(userId) {
        if (!rtdb) {
            return {
                status: 'offline',
                lastSeen: Date.now(),
                userId
            };
        }
        try {
            const presenceRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ref"])(rtdb, "presence/".concat(userId));
            return new Promise((resolve)=>{
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$database$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["onValue"])(presenceRef, (snapshot)=>{
                    const data = snapshot.val();
                    resolve({
                        status: (data === null || data === void 0 ? void 0 : data.status) || 'offline',
                        lastSeen: (data === null || data === void 0 ? void 0 : data.lastSeen) || Date.now(),
                        userId
                    });
                }, {
                    onlyOnce: true
                });
            });
        } catch (error) {
            console.error('❌ [WhatsApp Presence] Failed to get presence:', error);
            return {
                status: 'offline',
                lastSeen: Date.now(),
                userId
            };
        }
    }
    /**
   * Cleanup presence on logout
   */ static async cleanup(userId) {
        if (!rtdb) return;
        try {
            await this.updateStatus(userId, 'offline');
            this.presenceRefs.delete(userId);
            console.log('✅ [WhatsApp Presence] Cleaned up for user:', userId);
        } catch (error) {
            console.error('❌ [WhatsApp Presence] Cleanup failed:', error);
        }
    }
}
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(WhatsAppPresence, "presenceRefs", new Map());
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/pages/groups/_context/ChatContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ChatProvider",
    ()=>ChatProvider,
    "useChat",
    ()=>useChat
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useAuth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useAuth.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useZone$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useZone.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$pages$2f$groups$2f$_lib$2f$firebase$2d$chat$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/pages/groups/_lib/firebase-chat-service.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$pages$2f$groups$2f$_lib$2f$whatsapp$2d$presence$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/pages/groups/_lib/whatsapp-presence.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
const ChatContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function ChatProvider(param) {
    let { children } = param;
    _s();
    const { user, profile } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useAuth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const { currentZone } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useZone$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useZone"])();
    // Local state for all chat data (no Zustand caching)
    const [chats, setChats] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [selectedChat, setSelectedChat] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [messages, setMessages] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isChatsLoading, setIsChatsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true) // Start as loading
    ;
    const [isMessagesLoading, setIsMessagesLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Local state for UI-only data
    const [onlineUsers, setOnlineUsers] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [friendRequests, setFriendRequests] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [replyToMessage, setReplyToMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [editingMessage, setEditingMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isUsersLoading, setIsUsersLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Initialize user in chat system with WhatsApp presence
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ChatProvider.useEffect": ()=>{
            // Use profile (cached) to initialize immediately, don't wait for user
            if (profile) {
                const userId = (user === null || user === void 0 ? void 0 : user.uid) || profile.id;
                const chatUser = {
                    id: userId,
                    email: profile.email || (user === null || user === void 0 ? void 0 : user.email) || '',
                    fullName: "".concat(profile.first_name || '', " ").concat(profile.last_name || '').trim() || profile.email || 'User',
                    firstName: profile.first_name,
                    lastName: profile.last_name,
                    zoneId: currentZone === null || currentZone === void 0 ? void 0 : currentZone.id,
                    zoneName: currentZone === null || currentZone === void 0 ? void 0 : currentZone.name
                };
                // Only add profilePic if it exists (Firebase doesn't allow undefined)
                const profileImageUrl = profile.profile_image_url;
                if (profileImageUrl) {
                    chatUser.profilePic = profileImageUrl;
                }
                // Initialize WhatsApp-style presence
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$pages$2f$groups$2f$_lib$2f$whatsapp$2d$presence$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WhatsAppPresence"].initializePresence(userId);
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$pages$2f$groups$2f$_lib$2f$firebase$2d$chat$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseChatService"].createOrUpdateUser(chatUser);
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$pages$2f$groups$2f$_lib$2f$firebase$2d$chat$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseChatService"].updateUserStatus(userId, true);
            }
        }
    }["ChatProvider.useEffect"], [
        user,
        profile,
        currentZone
    ]);
    // Update user status on window focus/blur with WhatsApp presence
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ChatProvider.useEffect": ()=>{
            const userId = (user === null || user === void 0 ? void 0 : user.uid) || (profile === null || profile === void 0 ? void 0 : profile.id);
            if (!userId) return;
            const handleFocus = {
                "ChatProvider.useEffect.handleFocus": ()=>{
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$pages$2f$groups$2f$_lib$2f$whatsapp$2d$presence$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WhatsAppPresence"].updateStatus(userId, 'online');
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$pages$2f$groups$2f$_lib$2f$firebase$2d$chat$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseChatService"].updateUserStatus(userId, true);
                }
            }["ChatProvider.useEffect.handleFocus"];
            const handleBlur = {
                "ChatProvider.useEffect.handleBlur": ()=>{
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$pages$2f$groups$2f$_lib$2f$whatsapp$2d$presence$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WhatsAppPresence"].updateStatus(userId, 'offline');
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$pages$2f$groups$2f$_lib$2f$firebase$2d$chat$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseChatService"].updateUserStatus(userId, false);
                }
            }["ChatProvider.useEffect.handleBlur"];
            const handleBeforeUnload = {
                "ChatProvider.useEffect.handleBeforeUnload": ()=>{
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$pages$2f$groups$2f$_lib$2f$whatsapp$2d$presence$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WhatsAppPresence"].updateStatus(userId, 'offline');
                }
            }["ChatProvider.useEffect.handleBeforeUnload"];
            window.addEventListener('focus', handleFocus);
            window.addEventListener('blur', handleBlur);
            window.addEventListener('beforeunload', handleBeforeUnload);
            return ({
                "ChatProvider.useEffect": ()=>{
                    window.removeEventListener('focus', handleFocus);
                    window.removeEventListener('blur', handleBlur);
                    window.removeEventListener('beforeunload', handleBeforeUnload);
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$pages$2f$groups$2f$_lib$2f$whatsapp$2d$presence$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WhatsAppPresence"].cleanup(userId);
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$pages$2f$groups$2f$_lib$2f$firebase$2d$chat$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseChatService"].updateUserStatus(userId, false);
                }
            })["ChatProvider.useEffect"];
        }
    }["ChatProvider.useEffect"], [
        user,
        profile
    ]);
    // Subscribe to chats - SIMPLE like WhatsApp
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ChatProvider.useEffect": ()=>{
            // Just need user ID - that's it!
            const userId = (user === null || user === void 0 ? void 0 : user.uid) || (profile === null || profile === void 0 ? void 0 : profile.id);
            if (!userId) {
                console.log('⏳ Waiting for user...');
                setIsChatsLoading(false); // Don't show loading if no user
                return;
            }
            console.log('🚀 [ChatContext] Loading chats for user:', userId);
            setIsChatsLoading(true);
            // Subscribe to Firebase - it handles ALL filtering
            const unsubscribe = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$pages$2f$groups$2f$_lib$2f$firebase$2d$chat$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseChatService"].subscribeToChats(userId, {
                "ChatProvider.useEffect.unsubscribe": (cleanChats)=>{
                    console.log('✅ [ChatContext] Received', cleanChats.length, 'clean chats from Firebase service');
                    // NO FILTERING HERE - Firebase service already filtered everything
                    // Just use the clean data directly
                    setChats(cleanChats);
                    setIsChatsLoading(false);
                }
            }["ChatProvider.useEffect.unsubscribe"]);
            return ({
                "ChatProvider.useEffect": ()=>{
                    console.log('🧹 [ChatContext] Unsubscribing from chats');
                    unsubscribe();
                }
            })["ChatProvider.useEffect"];
        }
    }["ChatProvider.useEffect"], [
        user === null || user === void 0 ? void 0 : user.uid,
        profile === null || profile === void 0 ? void 0 : profile.id
    ]); // Only re-run when user changes
    // Subscribe to messages for selected chat - Fetch fresh from Firebase
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ChatProvider.useEffect": ()=>{
            if (!selectedChat) {
                setReplyToMessage(null);
                setEditingMessage(null);
                setMessages([]);
                return;
            }
            console.log('💬 [ChatContext] Loading messages for chat:', selectedChat.id);
            console.log('💬 [ChatContext] Chat details:', {
                id: selectedChat.id,
                type: selectedChat.type,
                participants: selectedChat.participants,
                name: selectedChat.name
            });
            setIsMessagesLoading(true);
            setMessages([]);
            // Subscribe to fresh messages from Firebase
            const unsubscribe = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$pages$2f$groups$2f$_lib$2f$firebase$2d$chat$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseChatService"].subscribeToMessages(selectedChat.id, {
                "ChatProvider.useEffect.unsubscribe": (freshMessages)=>{
                    console.log('📥 [ChatContext] Received', freshMessages.length, 'messages for chat:', selectedChat.id);
                    if (freshMessages.length === 0) {
                        console.log('⚠️ [ChatContext] No messages found. This could mean:');
                        console.log('  1. The chat is new and has no messages');
                        console.log('  2. Messages are stored with a different chatId');
                        console.log('  3. Firestore index is missing (check console for index errors)');
                    }
                    setMessages(freshMessages);
                    setIsMessagesLoading(false);
                }
            }["ChatProvider.useEffect.unsubscribe"]);
            return ({
                "ChatProvider.useEffect": ()=>{
                    console.log('🧹 [ChatContext] Cleaning up messages subscription');
                    unsubscribe();
                    setMessages([]);
                }
            })["ChatProvider.useEffect"];
        }
    }["ChatProvider.useEffect"], [
        selectedChat === null || selectedChat === void 0 ? void 0 : selectedChat.id
    ]);
    // Load friend requests - use cached profile.id for instant loading
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ChatProvider.useEffect": ()=>{
            // Use profile.id (cached) instead of user.uid (slow to load)
            const userId = (user === null || user === void 0 ? void 0 : user.uid) || (profile === null || profile === void 0 ? void 0 : profile.id);
            if (!userId) return;
            const loadFriendRequests = {
                "ChatProvider.useEffect.loadFriendRequests": async ()=>{
                    const requests = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$pages$2f$groups$2f$_lib$2f$firebase$2d$chat$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseChatService"].getFriendRequests(userId);
                    setFriendRequests(requests);
                }
            }["ChatProvider.useEffect.loadFriendRequests"];
            loadFriendRequests();
        }
    }["ChatProvider.useEffect"], [
        user,
        profile
    ]);
    // Actions
    const sendMessage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ChatProvider.useCallback[sendMessage]": async (messageData)=>{
            var _user_email;
            if (!selectedChat || !user || !profile) return false;
            // Get sender name - try to fetch from zone_members first for accurate name
            let senderName = "".concat(profile.first_name || '', " ").concat(profile.last_name || '').trim();
            // If no name from profile, try to get from zone_members
            if (!senderName) {
                try {
                    var _profile_email;
                    const userFromZone = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$pages$2f$groups$2f$_lib$2f$firebase$2d$chat$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseChatService"].getUser(user.uid);
                    senderName = (userFromZone === null || userFromZone === void 0 ? void 0 : userFromZone.fullName) || ((_profile_email = profile.email) === null || _profile_email === void 0 ? void 0 : _profile_email.split('@')[0]) || 'User';
                } catch (error) {
                    var _profile_email1;
                    console.error('Error getting user name:', error);
                    senderName = ((_profile_email1 = profile.email) === null || _profile_email1 === void 0 ? void 0 : _profile_email1.split('@')[0]) || 'User';
                }
            }
            // Check if user is Boss
            const isBoss = (profile === null || profile === void 0 ? void 0 : profile.role) === 'boss' || ((_user_email = user.email) === null || _user_email === void 0 ? void 0 : _user_email.toLowerCase().startsWith('boss'));
            const replyMeta = replyToMessage ? {
                messageId: replyToMessage.id,
                senderName: replyToMessage.senderName,
                snippet: replyToMessage.text ? replyToMessage.text.slice(0, 120) : replyToMessage.image ? '📷 Image' : replyToMessage.fileName ? "📎 ".concat(replyToMessage.fileName) : 'Message'
            } : undefined;
            const result = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$pages$2f$groups$2f$_lib$2f$firebase$2d$chat$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseChatService"].sendMessage(selectedChat.id, user.uid, senderName, {
                ...messageData,
                replyTo: replyMeta
            }, isBoss);
            if (result) {
                setReplyToMessage(null);
            }
            return result;
        }
    }["ChatProvider.useCallback[sendMessage]"], [
        selectedChat,
        user,
        profile,
        replyToMessage
    ]);
    const searchUsers = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ChatProvider.useCallback[searchUsers]": async (searchTerm)=>{
            var _user_email;
            // Use cached profile if user is still loading
            const userId = (user === null || user === void 0 ? void 0 : user.uid) || (profile === null || profile === void 0 ? void 0 : profile.id);
            if (!userId || !profile) {
                console.log('⚠️ [searchUsers] Missing userId or profile:', {
                    userId,
                    hasProfile: !!profile
                });
                return [];
            }
            // Check if user is Boss (Boss can see everyone)
            const isBoss = (profile === null || profile === void 0 ? void 0 : profile.role) === 'boss' || (user === null || user === void 0 ? void 0 : (_user_email = user.email) === null || _user_email === void 0 ? void 0 : _user_email.toLowerCase().startsWith('boss'));
            console.log('🔍 [searchUsers] Searching with:', {
                searchTerm,
                userId,
                zoneId: currentZone === null || currentZone === void 0 ? void 0 : currentZone.id,
                isBoss
            });
            setIsUsersLoading(true);
            // Pass correct zoneId and isBoss flag for proper filtering
            const users = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$pages$2f$groups$2f$_lib$2f$firebase$2d$chat$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseChatService"].searchUsers(searchTerm, userId, currentZone === null || currentZone === void 0 ? void 0 : currentZone.id, isBoss);
            console.log('✅ [searchUsers] Found users:', users.length);
            setIsUsersLoading(false);
            return users;
        }
    }["ChatProvider.useCallback[searchUsers]"], [
        user,
        profile,
        currentZone
    ]);
    const createDirectChat = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ChatProvider.useCallback[createDirectChat]": async (userId)=>{
            // Use cached profile if user is still loading
            const currentUserId = (user === null || user === void 0 ? void 0 : user.uid) || (profile === null || profile === void 0 ? void 0 : profile.id);
            if (!currentUserId) {
                console.log('⚠️ [createDirectChat] No user ID available');
                return null;
            }
            console.log('💬 [createDirectChat] Creating chat between:', currentUserId, 'and', userId);
            return await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$pages$2f$groups$2f$_lib$2f$firebase$2d$chat$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseChatService"].createDirectChat(currentUserId, userId);
        }
    }["ChatProvider.useCallback[createDirectChat]"], [
        user,
        profile
    ]);
    const createGroupChat = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ChatProvider.useCallback[createGroupChat]": async (name, description, participantIds)=>{
            if (!user) return null;
            return await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$pages$2f$groups$2f$_lib$2f$firebase$2d$chat$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseChatService"].createGroupChat(name, description, user.uid, participantIds);
        }
    }["ChatProvider.useCallback[createGroupChat]"], [
        user
    ]);
    const sendFriendRequest = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ChatProvider.useCallback[sendFriendRequest]": async (userId)=>{
            if (!user) return false;
            return await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$pages$2f$groups$2f$_lib$2f$firebase$2d$chat$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseChatService"].sendFriendRequest(user.uid, userId);
        }
    }["ChatProvider.useCallback[sendFriendRequest]"], [
        user
    ]);
    const getFriendStatus = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ChatProvider.useCallback[getFriendStatus]": async (userId)=>{
            if (!user) return {
                status: 'none'
            };
            return await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$pages$2f$groups$2f$_lib$2f$firebase$2d$chat$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseChatService"].getFriendStatus(user.uid, userId);
        }
    }["ChatProvider.useCallback[getFriendStatus]"], [
        user
    ]);
    const acceptFriendRequest = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ChatProvider.useCallback[acceptFriendRequest]": async (requestId)=>{
            const result = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$pages$2f$groups$2f$_lib$2f$firebase$2d$chat$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseChatService"].acceptFriendRequest(requestId);
            if (result) {
                // Refresh friend requests
                const requests = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$pages$2f$groups$2f$_lib$2f$firebase$2d$chat$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseChatService"].getFriendRequests((user === null || user === void 0 ? void 0 : user.uid) || '');
                setFriendRequests(requests);
            }
            return result;
        }
    }["ChatProvider.useCallback[acceptFriendRequest]"], [
        user
    ]);
    // Group management actions
    const addUserToGroup = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ChatProvider.useCallback[addUserToGroup]": async (chatId, userId)=>{
            if (!user) return false;
            return await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$pages$2f$groups$2f$_lib$2f$firebase$2d$chat$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseChatService"].addUserToGroup(chatId, userId, user.uid);
        }
    }["ChatProvider.useCallback[addUserToGroup]"], [
        user
    ]);
    const removeUserFromGroup = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ChatProvider.useCallback[removeUserFromGroup]": async (chatId, userId)=>{
            if (!user) return false;
            return await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$pages$2f$groups$2f$_lib$2f$firebase$2d$chat$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseChatService"].removeUserFromGroup(chatId, userId, user.uid);
        }
    }["ChatProvider.useCallback[removeUserFromGroup]"], [
        user
    ]);
    const makeUserAdmin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ChatProvider.useCallback[makeUserAdmin]": async (chatId, userId)=>{
            if (!user) return false;
            return await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$pages$2f$groups$2f$_lib$2f$firebase$2d$chat$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseChatService"].makeUserAdmin(chatId, userId, user.uid);
        }
    }["ChatProvider.useCallback[makeUserAdmin]"], [
        user
    ]);
    const updateGroupInfo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ChatProvider.useCallback[updateGroupInfo]": async (chatId, updates)=>{
            if (!user) return false;
            return await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$pages$2f$groups$2f$_lib$2f$firebase$2d$chat$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseChatService"].updateGroupInfo(chatId, user.uid, updates);
        }
    }["ChatProvider.useCallback[updateGroupInfo]"], [
        user
    ]);
    const leaveGroup = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ChatProvider.useCallback[leaveGroup]": async (chatId)=>{
            if (!user) return false;
            const result = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$pages$2f$groups$2f$_lib$2f$firebase$2d$chat$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseChatService"].leaveGroup(chatId, user.uid);
            if (result) {
                setSelectedChat(null);
            }
            return result;
        }
    }["ChatProvider.useCallback[leaveGroup]"], [
        user
    ]);
    const deleteChat = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ChatProvider.useCallback[deleteChat]": async (chatId)=>{
            if (!user) return false;
            const result = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$pages$2f$groups$2f$_lib$2f$firebase$2d$chat$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseChatService"].deleteChat(chatId, user.uid);
            if (result && (selectedChat === null || selectedChat === void 0 ? void 0 : selectedChat.id) === chatId) {
                setSelectedChat(null);
            }
            return result;
        }
    }["ChatProvider.useCallback[deleteChat]"], [
        user,
        selectedChat
    ]);
    const togglePinChat = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ChatProvider.useCallback[togglePinChat]": async (chatId, pin)=>{
            if (!user) return false;
            return await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$pages$2f$groups$2f$_lib$2f$firebase$2d$chat$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseChatService"].togglePinChat(chatId, user.uid, pin);
        }
    }["ChatProvider.useCallback[togglePinChat]"], [
        user
    ]);
    const toggleStarChat = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ChatProvider.useCallback[toggleStarChat]": async (chatId, star)=>{
            if (!user) return false;
            return await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$pages$2f$groups$2f$_lib$2f$firebase$2d$chat$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseChatService"].toggleStarChat(chatId, user.uid, star);
        }
    }["ChatProvider.useCallback[toggleStarChat]"], [
        user
    ]);
    const searchMessages = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ChatProvider.useCallback[searchMessages]": async (chatId, searchTerm)=>{
            return await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$pages$2f$groups$2f$_lib$2f$firebase$2d$chat$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseChatService"].searchMessages(chatId, searchTerm);
        }
    }["ChatProvider.useCallback[searchMessages]"], []);
    const toggleStarMessage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ChatProvider.useCallback[toggleStarMessage]": async (messageId)=>{
            if (!user) return false;
            return await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$pages$2f$groups$2f$_lib$2f$firebase$2d$chat$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseChatService"].toggleStarMessage(messageId, user.uid);
        }
    }["ChatProvider.useCallback[toggleStarMessage]"], [
        user
    ]);
    const isMessageStarred = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ChatProvider.useCallback[isMessageStarred]": async (messageId)=>{
            if (!user) return false;
            return await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$pages$2f$groups$2f$_lib$2f$firebase$2d$chat$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseChatService"].isMessageStarred(messageId, user.uid);
        }
    }["ChatProvider.useCallback[isMessageStarred]"], [
        user
    ]);
    const toggleReaction = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ChatProvider.useCallback[toggleReaction]": async function(messageId) {
            let emoji = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : '❤️';
            if (!user) return;
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$pages$2f$groups$2f$_lib$2f$firebase$2d$chat$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseChatService"].toggleReaction(messageId, user.uid, (profile === null || profile === void 0 ? void 0 : profile.first_name) || user.email || 'You', emoji);
        }
    }["ChatProvider.useCallback[toggleReaction]"], [
        user,
        profile
    ]);
    const deleteMessage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ChatProvider.useCallback[deleteMessage]": async (messageId)=>{
            if (!user) return false;
            return await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$pages$2f$groups$2f$_lib$2f$firebase$2d$chat$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseChatService"].deleteMessage(messageId, user.uid);
        }
    }["ChatProvider.useCallback[deleteMessage]"], [
        user
    ]);
    const editMessage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "ChatProvider.useCallback[editMessage]": async (messageId, newText)=>{
            if (!user) return false;
            const result = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$pages$2f$groups$2f$_lib$2f$firebase$2d$chat$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseChatService"].editMessage(messageId, user.uid, newText);
            if (result) {
                setEditingMessage(null);
            }
            return result;
        }
    }["ChatProvider.useCallback[editMessage]"], [
        user
    ]);
    const contextValue = {
        // State
        chats,
        selectedChat,
        messages,
        onlineUsers,
        friendRequests,
        replyToMessage,
        editingMessage,
        // Loading states
        isChatsLoading,
        isMessagesLoading,
        isUsersLoading,
        // Actions
        setSelectedChat,
        setReplyToMessage,
        setEditingMessage,
        sendMessage,
        searchUsers,
        createDirectChat,
        createGroupChat,
        sendFriendRequest,
        acceptFriendRequest,
        getFriendStatus,
        toggleReaction,
        deleteMessage,
        editMessage,
        // Group management
        addUserToGroup,
        removeUserFromGroup,
        makeUserAdmin,
        updateGroupInfo,
        leaveGroup,
        // Chat management
        deleteChat,
        togglePinChat,
        toggleStarChat,
        searchMessages,
        // Message management
        toggleStarMessage,
        isMessageStarred
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ChatContext.Provider, {
        value: contextValue,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/app/pages/groups/_context/ChatContext.tsx",
        lineNumber: 476,
        columnNumber: 5
    }, this);
}
_s(ChatProvider, "kcmyVRyYfZKKTu10Wzc0dmZPHkI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useAuth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useZone$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useZone"]
    ];
});
_c = ChatProvider;
function useChat() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(ChatContext);
    if (context === undefined) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
}
_s1(useChat, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "ChatProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/pages/media/_lib/firebase-media-service.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Firebase Media Service - Netflix-style media management
__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "firebaseMediaService",
    ()=>firebaseMediaService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_define_property.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$firestore$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/firestore/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/firebase/node_modules/@firebase/firestore/dist/index.esm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase-setup.ts [app-client] (ecmascript)");
;
;
;
class FirebaseMediaService {
    // ==================== MEDIA ITEMS ====================
    async createMedia(mediaData) {
        try {
            const docRef = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], this.mediaCollection), {
                ...mediaData,
                createdAt: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Timestamp"].now(),
                updatedAt: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Timestamp"].now()
            });
            return docRef.id;
        } catch (error) {
            console.error('Error creating media:', error);
            throw error;
        }
    }
    // OPTIMIZED: Added pagination support with default limit
    // Filters out hidden videos by default
    async getAllMedia() {
        let limitCount = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 24;
        try {
            const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], this.mediaCollection), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('hidden', '!=', true), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["orderBy"])('hidden'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["orderBy"])('createdAt', 'desc'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["limit"])(limitCount));
            const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
            return snapshot.docs.map((doc)=>{
                var _doc_data_createdAt, _doc_data_updatedAt;
                return {
                    id: doc.id,
                    ...doc.data(),
                    createdAt: (_doc_data_createdAt = doc.data().createdAt) === null || _doc_data_createdAt === void 0 ? void 0 : _doc_data_createdAt.toDate(),
                    updatedAt: (_doc_data_updatedAt = doc.data().updatedAt) === null || _doc_data_updatedAt === void 0 ? void 0 : _doc_data_updatedAt.toDate()
                };
            });
        } catch (error) {
            console.error('Error fetching media:', error);
            // Fallback: fetch all and filter client-side (for backwards compatibility)
            try {
                const fallbackQ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], this.mediaCollection), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["orderBy"])('createdAt', 'desc'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["limit"])(limitCount));
                const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(fallbackQ);
                return snapshot.docs.map((doc)=>{
                    var _doc_data_createdAt, _doc_data_updatedAt;
                    return {
                        id: doc.id,
                        ...doc.data(),
                        createdAt: (_doc_data_createdAt = doc.data().createdAt) === null || _doc_data_createdAt === void 0 ? void 0 : _doc_data_createdAt.toDate(),
                        updatedAt: (_doc_data_updatedAt = doc.data().updatedAt) === null || _doc_data_updatedAt === void 0 ? void 0 : _doc_data_updatedAt.toDate()
                    };
                }).filter((item)=>!item.hidden);
            } catch (fallbackError) {
                console.error('Fallback also failed:', fallbackError);
                return [];
            }
        }
    }
    // Get media filtered by zone type (HQ or regular zones)
    // Also filters out hidden videos
    async getMediaForZone(isHQZone) {
        let limitCount = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 24;
        try {
            // Firestore doesn't support multiple inequality filters, so we filter hidden client-side
            const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], this.mediaCollection), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('forHQ', '==', isHQZone), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["orderBy"])('createdAt', 'desc'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["limit"])(limitCount * 2) // Fetch extra to account for hidden videos
            );
            const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
            return snapshot.docs.map((doc)=>{
                var _doc_data_createdAt, _doc_data_updatedAt;
                return {
                    id: doc.id,
                    ...doc.data(),
                    createdAt: (_doc_data_createdAt = doc.data().createdAt) === null || _doc_data_createdAt === void 0 ? void 0 : _doc_data_createdAt.toDate(),
                    updatedAt: (_doc_data_updatedAt = doc.data().updatedAt) === null || _doc_data_updatedAt === void 0 ? void 0 : _doc_data_updatedAt.toDate()
                };
            }).filter((item)=>!item.hidden) // Filter out hidden videos
            .slice(0, limitCount);
        } catch (error) {
            console.error('Error fetching zone media:', error);
            // Fallback to all media if zone filtering fails (for backwards compatibility)
            return this.getAllMedia(limitCount);
        }
    }
    // Load more media with pagination
    async loadMoreMedia(lastCreatedAt) {
        let limitCount = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 12;
        try {
            const { startAfter } = await __turbopack_context__.A("[project]/node_modules/firebase/firestore/dist/esm/index.esm.js [app-client] (ecmascript, async loader)");
            const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], this.mediaCollection), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["orderBy"])('createdAt', 'desc'), startAfter(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Timestamp"].fromDate(lastCreatedAt)), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["limit"])(limitCount));
            const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
            return snapshot.docs.map((doc)=>{
                var _doc_data_createdAt, _doc_data_updatedAt;
                return {
                    id: doc.id,
                    ...doc.data(),
                    createdAt: (_doc_data_createdAt = doc.data().createdAt) === null || _doc_data_createdAt === void 0 ? void 0 : _doc_data_createdAt.toDate(),
                    updatedAt: (_doc_data_updatedAt = doc.data().updatedAt) === null || _doc_data_updatedAt === void 0 ? void 0 : _doc_data_updatedAt.toDate()
                };
            });
        } catch (error) {
            console.error('Error loading more media:', error);
            return [];
        }
    }
    async getMediaByType(type) {
        try {
            const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], this.mediaCollection), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('type', '==', type), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["orderBy"])('createdAt', 'desc'));
            const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
            return snapshot.docs.map((doc)=>{
                var _doc_data_createdAt, _doc_data_updatedAt;
                return {
                    id: doc.id,
                    ...doc.data(),
                    createdAt: (_doc_data_createdAt = doc.data().createdAt) === null || _doc_data_createdAt === void 0 ? void 0 : _doc_data_createdAt.toDate(),
                    updatedAt: (_doc_data_updatedAt = doc.data().updatedAt) === null || _doc_data_updatedAt === void 0 ? void 0 : _doc_data_updatedAt.toDate()
                };
            });
        } catch (error) {
            console.error('Error fetching media by type:', error);
            return [];
        }
    }
    async getMediaByGenre(genre) {
        try {
            const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], this.mediaCollection), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('genre', 'array-contains', genre), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["orderBy"])('createdAt', 'desc'));
            const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
            return snapshot.docs.map((doc)=>{
                var _doc_data_createdAt, _doc_data_updatedAt;
                return {
                    id: doc.id,
                    ...doc.data(),
                    createdAt: (_doc_data_createdAt = doc.data().createdAt) === null || _doc_data_createdAt === void 0 ? void 0 : _doc_data_createdAt.toDate(),
                    updatedAt: (_doc_data_updatedAt = doc.data().updatedAt) === null || _doc_data_updatedAt === void 0 ? void 0 : _doc_data_updatedAt.toDate()
                };
            });
        } catch (error) {
            console.error('Error fetching media by genre:', error);
            return [];
        }
    }
    async getFeaturedMedia() {
        try {
            const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], this.mediaCollection), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('featured', '==', true), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["orderBy"])('views', 'desc'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["limit"])(10));
            const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
            return snapshot.docs.map((doc)=>{
                var _doc_data_createdAt, _doc_data_updatedAt;
                return {
                    id: doc.id,
                    ...doc.data(),
                    createdAt: (_doc_data_createdAt = doc.data().createdAt) === null || _doc_data_createdAt === void 0 ? void 0 : _doc_data_createdAt.toDate(),
                    updatedAt: (_doc_data_updatedAt = doc.data().updatedAt) === null || _doc_data_updatedAt === void 0 ? void 0 : _doc_data_updatedAt.toDate()
                };
            });
        } catch (error) {
            console.error('Error fetching featured media:', error);
            return [];
        }
    }
    async getMediaById(mediaId) {
        try {
            const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], this.mediaCollection, mediaId);
            const docSnap = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDoc"])(docRef);
            if (docSnap.exists()) {
                var _docSnap_data_createdAt, _docSnap_data_updatedAt;
                return {
                    id: docSnap.id,
                    ...docSnap.data(),
                    createdAt: (_docSnap_data_createdAt = docSnap.data().createdAt) === null || _docSnap_data_createdAt === void 0 ? void 0 : _docSnap_data_createdAt.toDate(),
                    updatedAt: (_docSnap_data_updatedAt = docSnap.data().updatedAt) === null || _docSnap_data_updatedAt === void 0 ? void 0 : _docSnap_data_updatedAt.toDate()
                };
            }
            return null;
        } catch (error) {
            console.error('Error fetching media by ID:', error);
            return null;
        }
    }
    async searchMedia(searchTerm) {
        try {
            // Note: For better search, consider using Algolia or similar
            const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], this.mediaCollection));
            const allMedia = snapshot.docs.map((doc)=>{
                var _doc_data_createdAt, _doc_data_updatedAt;
                return {
                    id: doc.id,
                    ...doc.data(),
                    createdAt: (_doc_data_createdAt = doc.data().createdAt) === null || _doc_data_createdAt === void 0 ? void 0 : _doc_data_createdAt.toDate(),
                    updatedAt: (_doc_data_updatedAt = doc.data().updatedAt) === null || _doc_data_updatedAt === void 0 ? void 0 : _doc_data_updatedAt.toDate()
                };
            });
            return allMedia.filter((item)=>item.title.toLowerCase().includes(searchTerm.toLowerCase()) || item.description.toLowerCase().includes(searchTerm.toLowerCase()));
        } catch (error) {
            console.error('Error searching media:', error);
            return [];
        }
    }
    async incrementViews(mediaId) {
        try {
            const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], this.mediaCollection, mediaId);
            const docSnap = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDoc"])(docRef);
            if (docSnap.exists()) {
                const currentViews = docSnap.data().views || 0;
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateDoc"])(docRef, {
                    views: currentViews + 1,
                    updatedAt: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Timestamp"].now()
                });
            }
        } catch (error) {
            console.error('Error incrementing views:', error);
        }
    }
    async incrementLikes(mediaId) {
        try {
            const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], this.mediaCollection, mediaId);
            const docSnap = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDoc"])(docRef);
            if (docSnap.exists()) {
                const currentLikes = docSnap.data().likes || 0;
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateDoc"])(docRef, {
                    likes: currentLikes + 1,
                    updatedAt: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Timestamp"].now()
                });
            }
        } catch (error) {
            console.error('Error incrementing likes:', error);
        }
    }
    // ==================== GENRES ====================
    async getAllGenres() {
        try {
            const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], this.genresCollection));
            return snapshot.docs.map((doc)=>({
                    id: doc.id,
                    ...doc.data()
                }));
        } catch (error) {
            console.error('Error fetching genres:', error);
            return [];
        }
    }
    // ==================== WATCH HISTORY ====================
    async saveWatchProgress(userId, mediaId, progress) {
        try {
            // Check if history exists
            const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], this.watchHistoryCollection), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('userId', '==', userId), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('mediaId', '==', mediaId));
            const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
            if (snapshot.empty) {
                // Create new history
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], this.watchHistoryCollection), {
                    userId,
                    mediaId,
                    progress,
                    lastWatched: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Timestamp"].now()
                });
            } else {
                // Update existing history
                const docRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], this.watchHistoryCollection, snapshot.docs[0].id);
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateDoc"])(docRef, {
                    progress,
                    lastWatched: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Timestamp"].now()
                });
            }
        } catch (error) {
            console.error('Error saving watch progress:', error);
        }
    }
    async getUserWatchHistory(userId) {
        try {
            const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], this.watchHistoryCollection), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('userId', '==', userId), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["orderBy"])('lastWatched', 'desc'));
            const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
            return snapshot.docs.map((doc)=>{
                var _doc_data_lastWatched;
                return {
                    id: doc.id,
                    ...doc.data(),
                    lastWatched: (_doc_data_lastWatched = doc.data().lastWatched) === null || _doc_data_lastWatched === void 0 ? void 0 : _doc_data_lastWatched.toDate()
                };
            });
        } catch (error) {
            console.error('Error fetching watch history:', error);
            return [];
        }
    }
    async getContinueWatching(userId) {
        try {
            const history = await this.getUserWatchHistory(userId);
            const mediaIds = history.filter((h)=>h.progress > 5 && h.progress < 95) // Only show partially watched
            .slice(0, 10).map((h)=>h.mediaId);
            if (mediaIds.length === 0) return [];
            const mediaPromises = mediaIds.map((id)=>this.getMediaById(id));
            const media = await Promise.all(mediaPromises);
            return media.filter((m)=>m !== null);
        } catch (error) {
            console.error('Error fetching continue watching:', error);
            return [];
        }
    }
    // ==================== FAVORITES ====================
    async addToFavorites(userId, mediaId) {
        try {
            // Check if already favorited
            const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], this.favoritesCollection), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('userId', '==', userId), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('mediaId', '==', mediaId));
            const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
            if (snapshot.empty) {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], this.favoritesCollection), {
                    userId,
                    mediaId,
                    createdAt: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Timestamp"].now()
                });
            }
        } catch (error) {
            console.error('Error adding to favorites:', error);
        }
    }
    async removeFromFavorites(userId, mediaId) {
        try {
            const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], this.favoritesCollection), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('userId', '==', userId), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('mediaId', '==', mediaId));
            const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
            if (!snapshot.empty) {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deleteDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], this.favoritesCollection, snapshot.docs[0].id));
            }
        } catch (error) {
            console.error('Error removing from favorites:', error);
        }
    }
    async getUserFavorites(userId) {
        try {
            const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], this.favoritesCollection), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('userId', '==', userId), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["orderBy"])('createdAt', 'desc'));
            const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
            const mediaIds = snapshot.docs.map((doc)=>doc.data().mediaId);
            if (mediaIds.length === 0) return [];
            const mediaPromises = mediaIds.map((id)=>this.getMediaById(id));
            const media = await Promise.all(mediaPromises);
            return media.filter((m)=>m !== null);
        } catch (error) {
            console.error('Error fetching favorites:', error);
            return [];
        }
    }
    async isFavorite(userId, mediaId) {
        try {
            const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], this.favoritesCollection), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('userId', '==', userId), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["where"])('mediaId', '==', mediaId));
            const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDocs"])(q);
            return !snapshot.empty;
        } catch (error) {
            console.error('Error checking favorite status:', error);
            return false;
        }
    }
    // ==================== REAL-TIME SUBSCRIPTIONS ====================
    // OPTIMIZED: Limited to 50 most recent media items
    subscribeToMedia(callback) {
        const q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["query"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], this.mediaCollection), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["orderBy"])('createdAt', 'desc'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["limit"])(50) // OPTIMIZED: Limit to reduce reads
        );
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["onSnapshot"])(q, (snapshot)=>{
            const media = snapshot.docs.map((doc)=>{
                var _doc_data_createdAt, _doc_data_updatedAt;
                return {
                    id: doc.id,
                    ...doc.data(),
                    createdAt: (_doc_data_createdAt = doc.data().createdAt) === null || _doc_data_createdAt === void 0 ? void 0 : _doc_data_createdAt.toDate(),
                    updatedAt: (_doc_data_updatedAt = doc.data().updatedAt) === null || _doc_data_updatedAt === void 0 ? void 0 : _doc_data_updatedAt.toDate()
                };
            });
            callback(media);
        });
    }
    constructor(){
        // Changed to media_videos collection for unified video management
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "mediaCollection", 'media_videos');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "genresCollection", 'media_genres');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "watchHistoryCollection", 'watch_history');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "favoritesCollection", 'user_favorites');
    }
}
const firebaseMediaService = new FirebaseMediaService();
const __TURBOPACK__default__export__ = firebaseMediaService;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/pages/media/_lib/index.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

/**
 * Media Library - Standalone Module
 * 
 * Complete Firebase-based media management system
 * Can be easily copied to other projects
 * 
 * Features:
 * - Media CRUD operations
 * - Watch history tracking
 * - Favorites management
 * - File uploads to Firebase Storage
 * - Real-time subscriptions
 */ // Firebase setup
__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase-setup.ts [app-client] (ecmascript)");
// Media service
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$pages$2f$media$2f$_lib$2f$firebase$2d$media$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/pages/media/_lib/firebase-media-service.ts [app-client] (ecmascript)");
;
;
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/pages/media/_lib/firebase-media-service.ts [app-client] (ecmascript) <export firebaseMediaService as mediaService>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "mediaService",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$pages$2f$media$2f$_lib$2f$firebase$2d$media$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["firebaseMediaService"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$pages$2f$media$2f$_lib$2f$firebase$2d$media$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/pages/media/_lib/firebase-media-service.ts [app-client] (ecmascript)");
}),
"[project]/src/app/pages/media/_context/MediaContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MediaProvider",
    ()=>MediaProvider,
    "useMedia",
    ()=>useMedia
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useAuth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useAuth.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useZone$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useZone.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/config/zones.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$pages$2f$media$2f$_lib$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/src/app/pages/media/_lib/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$pages$2f$media$2f$_lib$2f$firebase$2d$media$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__firebaseMediaService__as__mediaService$3e$__ = __turbopack_context__.i("[project]/src/app/pages/media/_lib/firebase-media-service.ts [app-client] (ecmascript) <export firebaseMediaService as mediaService>");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
const MediaContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function MediaProvider(param) {
    let { children } = param;
    _s();
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useAuth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const { currentZone } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useZone$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useZone"])();
    const [allMedia, setAllMedia] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [featuredMedia, setFeaturedMedia] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [continueWatching, setContinueWatching] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [favorites, setFavorites] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [genres, setGenres] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [isLoadingMore, setIsLoadingMore] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [hasMore, setHasMore] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    // Determine if user is in HQ zone
    const userIsHQ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isHQGroup"])(currentZone === null || currentZone === void 0 ? void 0 : currentZone.id);
    // Load initial data when zone changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MediaProvider.useEffect": ()=>{
            loadInitialData();
        }
    }["MediaProvider.useEffect"], [
        currentZone === null || currentZone === void 0 ? void 0 : currentZone.id
    ]);
    // Load user-specific data when user changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MediaProvider.useEffect": ()=>{
            if (user) {
                loadUserData();
            } else {
                setContinueWatching([]);
                setFavorites([]);
            }
        }
    }["MediaProvider.useEffect"], [
        user
    ]);
    // Listen for media upload events and refresh
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MediaProvider.useEffect": ()=>{
            const handleMediaUploaded = {
                "MediaProvider.useEffect.handleMediaUploaded": ()=>{
                    console.log('📺 New media uploaded, refreshing...');
                    loadInitialData();
                    if (user) {
                        loadUserData();
                    }
                }
            }["MediaProvider.useEffect.handleMediaUploaded"];
            window.addEventListener('mediaUploaded', handleMediaUploaded);
            return ({
                "MediaProvider.useEffect": ()=>window.removeEventListener('mediaUploaded', handleMediaUploaded)
            })["MediaProvider.useEffect"];
        }
    }["MediaProvider.useEffect"], [
        user
    ]);
    const loadInitialData = async ()=>{
        // Load cached media immediately for instant display
        const { MediaCache } = await __turbopack_context__.A("[project]/src/utils/media-cache.ts [app-client] (ecmascript, async loader)");
        const cacheKey = userIsHQ ? 'hq' : 'regular';
        const cachedMedia = MediaCache.loadMedia(cacheKey);
        if (cachedMedia && cachedMedia.length > 0) {
            console.log("⚡ Showing ".concat(cachedMedia.length, " cached ").concat(cacheKey, " media items instantly"));
            setAllMedia(cachedMedia);
            setIsLoading(false);
        } else {
            setIsLoading(true);
        }
        // Load fresh data from Firebase in background
        // Filter by zone type: HQ zones see forHQ=true, regular zones see forHQ=false
        try {
            console.log("📺 Loading media for ".concat(userIsHQ ? 'HQ' : 'regular', " zone: ").concat((currentZone === null || currentZone === void 0 ? void 0 : currentZone.name) || 'unknown'));
            const [media, featured, genresList] = await Promise.all([
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$pages$2f$media$2f$_lib$2f$firebase$2d$media$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__firebaseMediaService__as__mediaService$3e$__["mediaService"].getMediaForZone(userIsHQ, 24),
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$pages$2f$media$2f$_lib$2f$firebase$2d$media$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__firebaseMediaService__as__mediaService$3e$__["mediaService"].getFeaturedMedia(),
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$pages$2f$media$2f$_lib$2f$firebase$2d$media$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__firebaseMediaService__as__mediaService$3e$__["mediaService"].getAllGenres()
            ]);
            setAllMedia(media);
            setFeaturedMedia(featured);
            setGenres(genresList);
            setHasMore(media.length >= 24); // If we got 24, there might be more
            // Cache the media for next time (with zone-specific key)
            MediaCache.saveMedia(media, cacheKey);
        } catch (error) {
            console.error('Error loading initial data:', error);
        } finally{
            setIsLoading(false);
        }
    };
    // Load more media (pagination)
    const loadMore = async ()=>{
        if (isLoadingMore || !hasMore || allMedia.length === 0) return;
        setIsLoadingMore(true);
        try {
            const lastMedia = allMedia[allMedia.length - 1];
            if (!(lastMedia === null || lastMedia === void 0 ? void 0 : lastMedia.createdAt)) return;
            const moreMedia = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$pages$2f$media$2f$_lib$2f$firebase$2d$media$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__firebaseMediaService__as__mediaService$3e$__["mediaService"].loadMoreMedia(lastMedia.createdAt, 12);
            if (moreMedia.length === 0) {
                setHasMore(false);
            } else {
                setAllMedia((prev)=>[
                        ...prev,
                        ...moreMedia
                    ]);
                setHasMore(moreMedia.length >= 12);
            }
        } catch (error) {
            console.error('Error loading more media:', error);
        } finally{
            setIsLoadingMore(false);
        }
    };
    const loadUserData = async ()=>{
        if (!user) return;
        try {
            const [continueWatch, userFavorites] = await Promise.all([
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$pages$2f$media$2f$_lib$2f$firebase$2d$media$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__firebaseMediaService__as__mediaService$3e$__["mediaService"].getContinueWatching(user.uid),
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$pages$2f$media$2f$_lib$2f$firebase$2d$media$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__firebaseMediaService__as__mediaService$3e$__["mediaService"].getUserFavorites(user.uid)
            ]);
            setContinueWatching(continueWatch);
            setFavorites(userFavorites);
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    };
    const getMediaByType = async (type)=>{
        return await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$pages$2f$media$2f$_lib$2f$firebase$2d$media$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__firebaseMediaService__as__mediaService$3e$__["mediaService"].getMediaByType(type);
    };
    const getMediaByGenre = async (genre)=>{
        return await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$pages$2f$media$2f$_lib$2f$firebase$2d$media$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__firebaseMediaService__as__mediaService$3e$__["mediaService"].getMediaByGenre(genre);
    };
    const searchMedia = async (query)=>{
        return await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$pages$2f$media$2f$_lib$2f$firebase$2d$media$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__firebaseMediaService__as__mediaService$3e$__["mediaService"].searchMedia(query);
    };
    const addToFavorites = async (mediaId)=>{
        if (!user) return;
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$pages$2f$media$2f$_lib$2f$firebase$2d$media$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__firebaseMediaService__as__mediaService$3e$__["mediaService"].addToFavorites(user.uid, mediaId);
            await loadUserData(); // Refresh favorites
        } catch (error) {
            console.error('Error adding to favorites:', error);
        }
    };
    const removeFromFavorites = async (mediaId)=>{
        if (!user) return;
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$pages$2f$media$2f$_lib$2f$firebase$2d$media$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__firebaseMediaService__as__mediaService$3e$__["mediaService"].removeFromFavorites(user.uid, mediaId);
            await loadUserData(); // Refresh favorites
        } catch (error) {
            console.error('Error removing from favorites:', error);
        }
    };
    const saveWatchProgress = async (mediaId, progress)=>{
        if (!user) return;
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$pages$2f$media$2f$_lib$2f$firebase$2d$media$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__firebaseMediaService__as__mediaService$3e$__["mediaService"].saveWatchProgress(user.uid, mediaId, progress);
            await loadUserData(); // Refresh continue watching
        } catch (error) {
            console.error('Error saving watch progress:', error);
        }
    };
    const incrementViews = async (mediaId)=>{
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$pages$2f$media$2f$_lib$2f$firebase$2d$media$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__firebaseMediaService__as__mediaService$3e$__["mediaService"].incrementViews(mediaId);
        } catch (error) {
            console.error('Error incrementing views:', error);
        }
    };
    const refreshMedia = async ()=>{
        await loadInitialData();
        if (user) {
            await loadUserData();
        }
    };
    const value = {
        allMedia,
        featuredMedia,
        continueWatching,
        favorites,
        genres,
        isLoading,
        isLoadingMore,
        hasMore,
        getMediaByType,
        getMediaByGenre,
        searchMedia,
        addToFavorites,
        removeFromFavorites,
        saveWatchProgress,
        incrementViews,
        refreshMedia,
        loadMore
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MediaContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/app/pages/media/_context/MediaContext.tsx",
        lineNumber: 243,
        columnNumber: 10
    }, this);
}
_s(MediaProvider, "nnHDY0XuQAQrdtB+iB8kp9kYN1s=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useAuth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useZone$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useZone"]
    ];
});
_c = MediaProvider;
function useMedia() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(MediaContext);
    if (context === undefined) {
        throw new Error('useMedia must be used within a MediaProvider');
    }
    return context;
}
_s1(useMedia, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "MediaProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/contexts/AudioContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AudioProvider",
    ()=>AudioProvider,
    "useAudio",
    ()=>useAudio
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
const AudioContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function AudioProvider(param) {
    let { children } = param;
    _s();
    const [currentSong, setCurrentSong] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isPlaying, setIsPlaying] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [currentTime, setCurrentTime] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [duration, setDuration] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [hasError, setHasError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [shouldAutoPlay, setShouldAutoPlay] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const audioRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [isToggling, setIsToggling] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Audio persistence keys
    const AUDIO_STATE_KEY = 'loveworld_audio_state';
    const AUDIO_TIME_KEY = 'loveworld_audio_time';
    const AUDIO_SONG_KEY = 'loveworld_audio_song';
    const togglePlayPause = ()=>{
        var _audioRef_current;
        // Prevent rapid clicking
        if (isToggling) {
            console.log('🚫 Ignoring rapid click');
            return;
        }
        setIsToggling(true);
        setTimeout(()=>setIsToggling(false), 300); // 300ms debounce
        console.log('🎵 togglePlayPause called:', {
            isPlaying,
            hasAudioRef: !!audioRef.current,
            audioSrc: (_audioRef_current = audioRef.current) === null || _audioRef_current === void 0 ? void 0 : _audioRef_current.src,
            songTitle: currentSong === null || currentSong === void 0 ? void 0 : currentSong.title
        });
        if (audioRef.current) {
            if (isPlaying) {
                console.log('⏸️ Pausing audio');
                audioRef.current.pause();
            } else {
                // Check if audio source is set and valid before trying to play
                if (!audioRef.current.src || audioRef.current.src === '') {
                    console.warn('No audio source set. Cannot play audio.');
                    return;
                }
                console.log('▶️ Playing audio:', audioRef.current.src);
                // Use a promise to handle play() properly
                const playPromise = audioRef.current.play();
                if (playPromise !== undefined) {
                    playPromise.then(()=>{
                        console.log('✅ Audio started playing successfully');
                    }).catch((error)=>{
                        var _audioRef_current;
                        console.error('❌ Error playing audio:', error);
                        console.error('Audio source:', (_audioRef_current = audioRef.current) === null || _audioRef_current === void 0 ? void 0 : _audioRef_current.src);
                        console.error('Current song:', currentSong === null || currentSong === void 0 ? void 0 : currentSong.title);
                        console.error('Audio file URL:', currentSong === null || currentSong === void 0 ? void 0 : currentSong.audioFile);
                        // Reset playing state if play failed
                        setIsPlaying(false);
                    });
                }
            }
        }
    };
    const play = ()=>{
        if (audioRef.current && (currentSong === null || currentSong === void 0 ? void 0 : currentSong.audioFile) && currentSong.audioFile.trim() !== '') {
            // Check if audio is ready to play
            if (audioRef.current.readyState >= 2) {
                audioRef.current.play().catch((error)=>{
                    var _audioRef_current;
                    console.error('Error playing audio:', error);
                    console.log('Audio file:', currentSong.audioFile);
                    console.log('Ready state:', (_audioRef_current = audioRef.current) === null || _audioRef_current === void 0 ? void 0 : _audioRef_current.readyState);
                });
            } else {
                console.log('Audio not ready to play, readyState:', audioRef.current.readyState);
                // Wait for audio to be ready
                const handleCanPlay = ()=>{
                    if (audioRef.current) {
                        audioRef.current.play().catch((error)=>{
                            console.error('Error playing audio after waiting:', error);
                        });
                        audioRef.current.removeEventListener('canplay', handleCanPlay);
                    }
                };
                audioRef.current.addEventListener('canplay', handleCanPlay);
            }
        } else {
            console.log('Cannot play: no audio file or audio element');
        }
    };
    const pause = ()=>{
        if (audioRef.current) {
            audioRef.current.pause();
        }
    };
    const stop = ()=>{
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlaying(false);
            setCurrentTime(0);
        }
    };
    const handleTimeUpdate = ()=>{
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            // Save current time for persistence
            localStorage.setItem(AUDIO_TIME_KEY, audioRef.current.currentTime.toString());
        }
    };
    // Save audio state to localStorage (only when playing for a while)
    const saveAudioState = ()=>{
        if (currentSong && isPlaying && currentTime > 5) {
            localStorage.setItem(AUDIO_STATE_KEY, isPlaying.toString());
            localStorage.setItem(AUDIO_SONG_KEY, JSON.stringify({
                id: currentSong.id,
                title: currentSong.title,
                audioFile: currentSong.audioFile,
                mediaId: currentSong.mediaId,
                duration: duration // Save duration for validation
            }));
            localStorage.setItem('audio_timestamp', Date.now().toString());
        }
    };
    // Restore audio state from localStorage (only if song was playing and very recent)
    const restoreAudioState = ()=>{
        try {
            const savedSong = localStorage.getItem(AUDIO_SONG_KEY);
            const savedState = localStorage.getItem(AUDIO_STATE_KEY);
            const savedTime = localStorage.getItem(AUDIO_TIME_KEY);
            const savedTimestamp = localStorage.getItem('audio_timestamp');
            if (savedSong && savedState === 'true') {
                const songData = JSON.parse(savedSong);
                // Check if saved within the last 30 minutes (much more conservative)
                const savedTimeNum = savedTimestamp ? parseInt(savedTimestamp) : 0;
                const now = Date.now();
                const thirtyMinutesAgo = now - 30 * 60 * 1000;
                if (savedTimeNum < thirtyMinutesAgo) {
                    console.log('🎵 Audio session too old, clearing saved state');
                    clearAudioState();
                    return;
                }
                // Only restore if the song has an audio file AND user was actively playing
                if (songData.audioFile && songData.audioFile.trim() !== '' && savedState === 'true') {
                    console.log('🎵 Restoring recent audio session for:', songData.title);
                    // Set the song but don't auto-play initially
                    setCurrentSong(songData);
                    // Restore time if available
                    if (savedTime) {
                        const time = parseFloat(savedTime);
                        if (!isNaN(time) && time > 0 && time < songData.duration) {
                            setTimeout(()=>{
                                if (audioRef.current) {
                                    audioRef.current.currentTime = time;
                                    setCurrentTime(time);
                                }
                            }, 1000); // Wait for audio to load
                        }
                    }
                    // Don't auto-play on app startup - this is not typical music player behavior
                    // Users should manually start playback
                    console.log('🎵 Audio state restored but not auto-playing (user must manually start)');
                }
            }
        } catch (error) {
            console.error('Error restoring audio state:', error);
            // Clear corrupted data
            clearAudioState();
        }
    };
    // Clear saved audio state
    const clearAudioState = ()=>{
        localStorage.removeItem(AUDIO_SONG_KEY);
        localStorage.removeItem(AUDIO_STATE_KEY);
        localStorage.removeItem(AUDIO_TIME_KEY);
        localStorage.removeItem('audio_timestamp');
    };
    const handleLoadedMetadata = ()=>{
        if (audioRef.current) {
            setDuration(audioRef.current.duration);
            setIsLoading(false);
            setHasError(false);
            console.log('✅ Audio metadata loaded successfully');
            console.log('✅ Duration:', audioRef.current.duration);
            console.log('✅ Ready state:', audioRef.current.readyState);
            // Auto-play if requested and audio is ready
            if (shouldAutoPlay && (currentSong === null || currentSong === void 0 ? void 0 : currentSong.audioFile) && currentSong.audioFile.trim() !== '') {
                console.log('Audio loaded, auto-playing:', currentSong.title);
                audioRef.current.play().catch((error)=>{
                    console.error('Error auto-playing after load:', error);
                    setHasError(true);
                });
                setShouldAutoPlay(false); // Reset auto-play flag
            }
        }
    };
    const handleEnded = ()=>{
        setIsPlaying(false);
        setCurrentTime(0);
        // Dispatch custom event for repeat functionality
        const event = new CustomEvent('audioEnded', {
            detail: {
                song: currentSong
            }
        });
        window.dispatchEvent(event);
    };
    const handlePlay = ()=>{
        console.log('🎵 Audio play event fired');
        setIsPlaying(true);
    };
    const handlePause = ()=>{
        console.log('🎵 Audio pause event fired');
        setIsPlaying(false);
    };
    const handleError = (e)=>{
        var _audioRef_current;
        // Only log errors if there's actually a source set
        if (((_audioRef_current = audioRef.current) === null || _audioRef_current === void 0 ? void 0 : _audioRef_current.src) && audioRef.current.src !== window.location.href) {
            var _audioRef_current1, _audioRef_current2, _audioRef_current3, _audioRef_current_error, _audioRef_current4, _audioRef_current_error1, _audioRef_current5;
            console.error('❌ Audio error details:', {
                error: e,
                currentSong: currentSong === null || currentSong === void 0 ? void 0 : currentSong.title,
                audioFile: currentSong === null || currentSong === void 0 ? void 0 : currentSong.audioFile,
                audioSrc: (_audioRef_current1 = audioRef.current) === null || _audioRef_current1 === void 0 ? void 0 : _audioRef_current1.src,
                networkState: (_audioRef_current2 = audioRef.current) === null || _audioRef_current2 === void 0 ? void 0 : _audioRef_current2.networkState,
                readyState: (_audioRef_current3 = audioRef.current) === null || _audioRef_current3 === void 0 ? void 0 : _audioRef_current3.readyState
            });
            console.error('❌ Audio error code:', (_audioRef_current4 = audioRef.current) === null || _audioRef_current4 === void 0 ? void 0 : (_audioRef_current_error = _audioRef_current4.error) === null || _audioRef_current_error === void 0 ? void 0 : _audioRef_current_error.code);
            console.error('❌ Audio error message:', (_audioRef_current5 = audioRef.current) === null || _audioRef_current5 === void 0 ? void 0 : (_audioRef_current_error1 = _audioRef_current5.error) === null || _audioRef_current_error1 === void 0 ? void 0 : _audioRef_current_error1.message);
        }
        setIsPlaying(false);
        setIsLoading(false);
        setHasError(true);
    };
    // Save audio state when it changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AudioProvider.useEffect": ()=>{
            saveAudioState();
        }
    }["AudioProvider.useEffect"], [
        currentSong,
        isPlaying
    ]);
    // Restore audio state on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AudioProvider.useEffect": ()=>{
            restoreAudioState();
        }
    }["AudioProvider.useEffect"], []);
    // Update audio source when song changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AudioProvider.useEffect": ()=>{
            var _audioRef_current;
            console.log('🎵 Audio loading effect triggered for song:', currentSong === null || currentSong === void 0 ? void 0 : currentSong.title);
            console.log('🎵 Audio file URL:', currentSong === null || currentSong === void 0 ? void 0 : currentSong.audioFile);
            console.log('🎵 Current audio src:', (_audioRef_current = audioRef.current) === null || _audioRef_current === void 0 ? void 0 : _audioRef_current.src);
            if ((currentSong === null || currentSong === void 0 ? void 0 : currentSong.audioFile) && audioRef.current && currentSong.audioFile.trim() !== '') {
                try {
                    // Check if this is the same song that's already loaded to prevent restart
                    if (audioRef.current.src && audioRef.current.src === currentSong.audioFile) {
                        console.log('🎵 Same audio file already loaded, skipping audio reset - NO RESTART');
                        return; // Don't reset audio state for the same song
                    }
                    // Additional check: if the audio is already playing and it's the same file, don't restart
                    if (audioRef.current.src && audioRef.current.src === currentSong.audioFile && isPlaying) {
                        console.log('🎵 Same audio file already playing, skipping audio reset - NO RESTART');
                        return; // Don't restart the same song that's already playing
                    }
                    console.log('🎵 Different audio file, resetting audio state');
                    // Reset audio state only for new songs
                    setCurrentTime(0);
                    setDuration(0);
                    setIsLoading(true);
                    setHasError(false);
                    // Check if the audio file URL looks valid (Cloudinary URLs or other valid URLs)
                    if (currentSong.audioFile.startsWith('http') || currentSong.audioFile.startsWith('https')) {
                        // Don't encode URLs that are already properly encoded (like Cloudinary URLs)
                        const urlToUse = currentSong.audioFile;
                        console.log('🎵 Loading audio file for song:', currentSong.title);
                        console.log('🎵 Audio URL:', urlToUse);
                        console.log('🎵 URL length:', urlToUse.length);
                        console.log('🎵 URL domain:', new URL(urlToUse).hostname);
                        audioRef.current.src = urlToUse;
                        audioRef.current.load();
                    } else {
                        console.warn('❌ Invalid audio file URL (not HTTP/HTTPS):', currentSong.audioFile);
                        if (audioRef.current) {
                            audioRef.current.src = '';
                        }
                        setIsLoading(false);
                        setHasError(true);
                    }
                } catch (error) {
                    console.error('❌ Error loading audio file:', error);
                    if (audioRef.current) {
                        audioRef.current.src = '';
                    }
                    setIsLoading(false);
                    setHasError(true);
                }
            } else if (audioRef.current) {
                audioRef.current.src = '';
                setCurrentTime(0);
                setDuration(0);
                setIsLoading(false);
                setHasError(false);
                console.log('🧹 Clearing audio source - no valid audio file');
            }
        }
    }["AudioProvider.useEffect"], [
        currentSong
    ]);
    const setCurrentSongWithAutoPlay = function(song) {
        let autoPlay = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
        console.log('🎵 setCurrentSongWithAutoPlay called:', {
            songTitle: song === null || song === void 0 ? void 0 : song.title,
            songId: song === null || song === void 0 ? void 0 : song.id,
            autoPlay: autoPlay,
            currentSongId: currentSong === null || currentSong === void 0 ? void 0 : currentSong.id,
            currentSongTitle: currentSong === null || currentSong === void 0 ? void 0 : currentSong.title,
            isPlaying: isPlaying,
            isSameSong: (currentSong === null || currentSong === void 0 ? void 0 : currentSong.id) === (song === null || song === void 0 ? void 0 : song.id)
        });
        // Check if this is the same song that's already playing
        if ((currentSong === null || currentSong === void 0 ? void 0 : currentSong.id) === (song === null || song === void 0 ? void 0 : song.id) && isPlaying) {
            console.log('🎵 Same song already playing, skipping ALL audio changes - EXITING');
            return; // Don't restart the same song - exit completely
        }
        // Check if this is the same song but paused - also don't restart
        if ((currentSong === null || currentSong === void 0 ? void 0 : currentSong.id) === (song === null || song === void 0 ? void 0 : song.id) && !isPlaying) {
            console.log('🎵 Same song but paused, skipping ALL audio changes - EXITING');
            return; // Don't restart the same song - exit completely
        }
        console.log('🎵 Different song or new song, proceeding with audio changes');
        // Stop current playback when changing songs
        if (audioRef.current) {
            console.log('🎵 Stopping current audio');
            audioRef.current.pause();
            setIsPlaying(false);
            setCurrentTime(0);
        }
        console.log('🎵 Setting new song in state');
        setCurrentSong(song);
        setShouldAutoPlay(autoPlay);
    };
    const setCurrentTimeManual = (time)=>{
        if (audioRef.current && duration > 0) {
            const clampedTime = Math.max(0, Math.min(time, duration));
            audioRef.current.currentTime = clampedTime;
            setCurrentTime(clampedTime);
        }
    };
    const setDurationManual = (newDuration)=>{
        setDuration(newDuration);
    };
    const value = {
        currentSong,
        isPlaying,
        currentTime,
        duration,
        isLoading,
        hasError,
        audioRef,
        setCurrentSong: setCurrentSongWithAutoPlay,
        togglePlayPause,
        play,
        pause,
        stop,
        setCurrentTime: setCurrentTimeManual,
        setDuration: setDurationManual
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AudioContext.Provider, {
        value: value,
        children: [
            children,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("audio", {
                ref: audioRef,
                onTimeUpdate: handleTimeUpdate,
                onLoadedMetadata: handleLoadedMetadata,
                onEnded: handleEnded,
                onPlay: handlePlay,
                onPause: handlePause,
                onError: handleError,
                preload: "none",
                crossOrigin: "anonymous"
            }, void 0, false, {
                fileName: "[project]/src/contexts/AudioContext.tsx",
                lineNumber: 426,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/contexts/AudioContext.tsx",
        lineNumber: 423,
        columnNumber: 5
    }, this);
}
_s(AudioProvider, "+FwgjHYUZOf3ijQ3TJOUmZq2vQA=");
_c = AudioProvider;
function useAudio() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(AudioContext);
    if (context === undefined) {
        throw new Error('useAudio must be used within an AudioProvider');
    }
    return context;
}
_s1(useAudio, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "AudioProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/RealtimeNotifications.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RealtimeNotifications
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check-big.js [app-client] (ecmascript) <export default as CheckCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/info.js [app-client] (ecmascript) <export default as Info>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/triangle-alert.js [app-client] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-x.js [app-client] (ecmascript) <export default as XCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useZone$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useZone.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/config/zones.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function RealtimeNotifications() {
    _s();
    const [notifications, setNotifications] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const { currentZone } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useZone$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useZone"])();
    const isHQ = currentZone ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isHQGroup"])(currentZone.id) : false;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "RealtimeNotifications.useEffect": ()=>{
            const handleToast = {
                "RealtimeNotifications.useEffect.handleToast": (event)=>{
                    const { message, type, zoneName, userName, action, songTitle } = event.detail;
                    console.log('Toast event received:', {
                        message,
                        type,
                        zoneName,
                        userName,
                        action,
                        songTitle
                    });
                    console.log('Current zone:', currentZone === null || currentZone === void 0 ? void 0 : currentZone.name, 'Is HQ:', isHQ);
                    console.log('Zone comparison:', {
                        received: zoneName,
                        current: currentZone === null || currentZone === void 0 ? void 0 : currentZone.name,
                        match: zoneName === (currentZone === null || currentZone === void 0 ? void 0 : currentZone.name),
                        types: {
                            receivedType: typeof zoneName,
                            currentType: typeof (currentZone === null || currentZone === void 0 ? void 0 : currentZone.name)
                        }
                    });
                    // Zone filtering logic
                    if (zoneName) {
                        // This is an activity notification
                        if (isHQ) {
                            // HQ sees all activity notifications
                            console.log('HQ - showing notification');
                            showNotification(message, type, zoneName, userName, action, songTitle);
                        } else if (currentZone && zoneName === currentZone.name) {
                            // Regular zones only see their own activity notifications
                            console.log('Zone match - showing notification');
                            showNotification(message, type, zoneName, userName, action, songTitle);
                        } else {
                            console.log('Zone filter - hiding notification, but showing for debugging');
                            // TEMPORARY: Show all notifications for debugging
                            showNotification(message, type, zoneName, userName, action, songTitle);
                        }
                    } else {
                        // Regular toast notifications - everyone sees these
                        console.log('Regular toast - showing notification');
                        showNotification(message, type);
                    }
                }
            }["RealtimeNotifications.useEffect.handleToast"];
            const showNotification = {
                "RealtimeNotifications.useEffect.showNotification": (message, type, zoneName, userName, action, songTitle)=>{
                    const notification = {
                        id: "".concat(Date.now(), "-").concat(Math.random()),
                        message,
                        type: type,
                        timestamp: Date.now(),
                        zoneName,
                        userName,
                        action,
                        songTitle
                    };
                    setNotifications({
                        "RealtimeNotifications.useEffect.showNotification": (prev)=>[
                                ...prev,
                                notification
                            ]
                    }["RealtimeNotifications.useEffect.showNotification"]);
                    // Auto-remove after 5 seconds
                    setTimeout({
                        "RealtimeNotifications.useEffect.showNotification": ()=>{
                            setNotifications({
                                "RealtimeNotifications.useEffect.showNotification": (prev)=>prev.filter({
                                        "RealtimeNotifications.useEffect.showNotification": (n)=>n.id !== notification.id
                                    }["RealtimeNotifications.useEffect.showNotification"])
                            }["RealtimeNotifications.useEffect.showNotification"]);
                        }
                    }["RealtimeNotifications.useEffect.showNotification"], 5000);
                }
            }["RealtimeNotifications.useEffect.showNotification"];
            window.addEventListener('showToast', handleToast);
            return ({
                "RealtimeNotifications.useEffect": ()=>{
                    window.removeEventListener('showToast', handleToast);
                }
            })["RealtimeNotifications.useEffect"];
        }
    }["RealtimeNotifications.useEffect"], [
        currentZone,
        isHQ
    ]);
    const removeNotification = (id)=>{
        setNotifications((prev)=>prev.filter((n)=>n.id !== id));
    };
    const getIcon = (type)=>{
        switch(type){
            case 'success':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                    className: "w-5 h-5 text-green-600"
                }, void 0, false, {
                    fileName: "[project]/src/components/RealtimeNotifications.tsx",
                    lineNumber: 92,
                    columnNumber: 30
                }, this);
            case 'info':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__["Info"], {
                    className: "w-5 h-5 text-blue-600"
                }, void 0, false, {
                    fileName: "[project]/src/components/RealtimeNotifications.tsx",
                    lineNumber: 93,
                    columnNumber: 27
                }, this);
            case 'warning':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                    className: "w-5 h-5 text-yellow-600"
                }, void 0, false, {
                    fileName: "[project]/src/components/RealtimeNotifications.tsx",
                    lineNumber: 94,
                    columnNumber: 30
                }, this);
            case 'error':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"], {
                    className: "w-5 h-5 text-red-600"
                }, void 0, false, {
                    fileName: "[project]/src/components/RealtimeNotifications.tsx",
                    lineNumber: 95,
                    columnNumber: 28
                }, this);
            default:
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__["Info"], {
                    className: "w-5 h-5 text-blue-600"
                }, void 0, false, {
                    fileName: "[project]/src/components/RealtimeNotifications.tsx",
                    lineNumber: 96,
                    columnNumber: 23
                }, this);
        }
    };
    const getColors = (type)=>{
        switch(type){
            case 'success':
                return 'bg-green-50 border-green-200 text-green-800';
            case 'info':
                return 'bg-blue-50 border-blue-200 text-blue-800';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200 text-yellow-800';
            case 'error':
                return 'bg-red-50 border-red-200 text-red-800';
            default:
                return 'bg-blue-50 border-blue-200 text-blue-800';
        }
    };
    if (notifications.length === 0) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed top-4 right-4 z-[100] space-y-2",
        children: notifications.map((notification)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm animate-in slide-in-from-right-full duration-300 ".concat(getColors(notification.type)),
                style: {
                    minWidth: '300px',
                    maxWidth: '400px'
                },
                children: [
                    getIcon(notification.type),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm font-medium",
                                children: notification.message
                            }, void 0, false, {
                                fileName: "[project]/src/components/RealtimeNotifications.tsx",
                                lineNumber: 122,
                                columnNumber: 13
                            }, this),
                            (notification.zoneName || notification.userName) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs opacity-70 mt-1",
                                children: [
                                    notification.userName && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: notification.userName
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/RealtimeNotifications.tsx",
                                        lineNumber: 125,
                                        columnNumber: 43
                                    }, this),
                                    notification.userName && notification.zoneName && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: " • "
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/RealtimeNotifications.tsx",
                                        lineNumber: 126,
                                        columnNumber: 68
                                    }, this),
                                    notification.zoneName && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: notification.zoneName
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/RealtimeNotifications.tsx",
                                        lineNumber: 127,
                                        columnNumber: 43
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: " • "
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/RealtimeNotifications.tsx",
                                        lineNumber: 128,
                                        columnNumber: 17
                                    }, this),
                                    new Date(notification.timestamp).toLocaleTimeString()
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/RealtimeNotifications.tsx",
                                lineNumber: 124,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/RealtimeNotifications.tsx",
                        lineNumber: 121,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>removeNotification(notification.id),
                        className: "p-1 hover:bg-black/10 rounded transition-colors",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                            className: "w-4 h-4"
                        }, void 0, false, {
                            fileName: "[project]/src/components/RealtimeNotifications.tsx",
                            lineNumber: 137,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/RealtimeNotifications.tsx",
                        lineNumber: 133,
                        columnNumber: 11
                    }, this)
                ]
            }, notification.id, true, {
                fileName: "[project]/src/components/RealtimeNotifications.tsx",
                lineNumber: 115,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/src/components/RealtimeNotifications.tsx",
        lineNumber: 113,
        columnNumber: 5
    }, this);
}
_s(RealtimeNotifications, "iMSUIcfVdLiSsB5KoB4dGnOfPHM=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useZone$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useZone"]
    ];
});
_c = RealtimeNotifications;
var _c;
__turbopack_context__.k.register(_c, "RealtimeNotifications");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ActivityLogger.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ActivityLogger",
    ()=>ActivityLogger,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useZone$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useZone.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$firestore$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/firestore/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/firebase/node_modules/@firebase/firestore/dist/index.esm.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase-setup.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function ActivityLogger(param) {
    let { children } = param;
    _s();
    const { currentZone } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useZone$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useZone"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ActivityLogger.useEffect": ()=>{
            const handleToast = {
                "ActivityLogger.useEffect.handleToast": async (event)=>{
                    const { message, type, zoneName, userName, action, section, itemName } = event.detail;
                    if (!(currentZone === null || currentZone === void 0 ? void 0 : currentZone.id)) return;
                    try {
                        // Store any toast that has user/zone info
                        if (userName || zoneName) {
                            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["addDoc"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["db"], 'activity_logs'), {
                                zoneId: currentZone.id,
                                zoneName: zoneName || currentZone.name,
                                userName: userName || 'Unknown User',
                                message,
                                type,
                                action: action || 'unknown',
                                section: section || 'unknown',
                                itemName: itemName || null,
                                timestamp: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["serverTimestamp"])(),
                                createdAt: new Date().toISOString()
                            });
                            console.log('Activity logged:', {
                                message,
                                userName,
                                zoneName
                            });
                        }
                    } catch (error) {
                        console.error('Error logging activity:', error);
                    }
                }
            }["ActivityLogger.useEffect.handleToast"];
            window.addEventListener('showToast', handleToast);
            return ({
                "ActivityLogger.useEffect": ()=>window.removeEventListener('showToast', handleToast)
            })["ActivityLogger.useEffect"];
        }
    }["ActivityLogger.useEffect"], [
        currentZone
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: children
    }, void 0, false);
}
_s(ActivityLogger, "IGcLgrTpL3ndJgkL7JMzD9nKaBI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useZone$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useZone"]
    ];
});
_c = ActivityLogger;
const __TURBOPACK__default__export__ = ActivityLogger;
var _c;
__turbopack_context__.k.register(_c, "ActivityLogger");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/PushNotificationListener.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PushNotificationListener
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useAuth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useAuth.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function PushNotificationListener() {
    _s();
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useAuth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PushNotificationListener.useEffect": ()=>{
            if (!user) return;
            // Request notification permission
            if ('Notification' in window && Notification.permission === 'default') {
                Notification.requestPermission().then({
                    "PushNotificationListener.useEffect": (permission)=>{
                        console.log('Notification permission:', permission);
                    }
                }["PushNotificationListener.useEffect"]);
            }
            // Listen for push notifications
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.ready.then({
                    "PushNotificationListener.useEffect": (registration)=>{
                        console.log('Service Worker ready for push notifications');
                    }
                }["PushNotificationListener.useEffect"]);
            }
        }
    }["PushNotificationListener.useEffect"], [
        user
    ]);
    return null;
}
_s(PushNotificationListener, "C72XnuyhUicbE3VR7b9HBnFV5hM=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useAuth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"]
    ];
});
_c = PushNotificationListener;
var _c;
__turbopack_context__.k.register(_c, "PushNotificationListener");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/NotificationUrlHandler.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>NotificationUrlHandler
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
;
function NotificationUrlHandler() {
    _s();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "NotificationUrlHandler.useEffect": ()=>{
            // Only run on client side
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            // Check for notification in URL params
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('notification') === 'true') {
                const notificationData = {
                    title: urlParams.get('title'),
                    body: urlParams.get('body'),
                    timestamp: urlParams.get('timestamp'),
                    tapped: urlParams.get('tapped') === 'true',
                    // Extract custom data
                    data: {}
                };
                // Get all data_* params
                urlParams.forEach({
                    "NotificationUrlHandler.useEffect": (value, key)=>{
                        if (key.startsWith('data_')) {
                            notificationData.data[key.replace('data_', '')] = value;
                        }
                    }
                }["NotificationUrlHandler.useEffect"]);
                // Handle the notification
                handleNotification(notificationData);
                // Clean up URL (optional)
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        }
    }["NotificationUrlHandler.useEffect"], [
        router
    ]);
    const handleNotification = (notificationData)=>{
        console.log('📬 Notification opened from URL:', notificationData);
        // Handle navigation if URL is provided in data
        if (notificationData.data.url) {
            try {
                // If it's a relative URL, use Next.js router
                if (notificationData.data.url.startsWith('/')) {
                    router.push(notificationData.data.url);
                } else {
                    // If it's an absolute URL, navigate to it
                    window.location.href = notificationData.data.url;
                }
            } catch (error) {
                console.error('Error navigating to notification URL:', error);
            }
        }
        // Handle different notification types
        if (notificationData.data.type) {
            switch(notificationData.data.type){
                case 'rehearsal':
                    // Navigate to rehearsals page or specific rehearsal
                    if (notificationData.data.rehearsalId) {
                        router.push("/pages/rehearsals?id=".concat(notificationData.data.rehearsalId));
                    } else {
                        router.push('/pages/rehearsals');
                    }
                    break;
                case 'praise_night':
                    // Navigate to praise night page
                    if (notificationData.data.praiseNightId) {
                        router.push("/pages/praise-night?id=".concat(notificationData.data.praiseNightId));
                    } else {
                        router.push('/pages/praise-night');
                    }
                    break;
                case 'media':
                    // Navigate to media page or specific media
                    if (notificationData.data.mediaId) {
                        router.push("/pages/media/player/".concat(notificationData.data.mediaId));
                    } else {
                        router.push('/pages/media');
                    }
                    break;
                case 'group':
                    // Navigate to groups page or specific group
                    if (notificationData.data.groupId) {
                        router.push("/pages/groups/".concat(notificationData.data.groupId));
                    } else {
                        router.push('/pages/groups');
                    }
                    break;
                case 'message':
                    // Navigate to messages/chat
                    if (notificationData.data.conversationId) {
                        router.push("/pages/groups?conversation=".concat(notificationData.data.conversationId));
                    } else {
                        router.push('/pages/groups');
                    }
                    break;
                case 'announcement':
                    // Navigate to notifications page
                    router.push('/pages/notifications');
                    break;
                default:
                    // Default: just log the notification
                    console.log('Notification received:', notificationData);
            }
        }
        // Optional: Show a toast or notification banner
        if (notificationData.title && notificationData.body) {
            // You can integrate with a toast library here
            // For now, we'll just log it
            console.log("Notification: ".concat(notificationData.title, " - ").concat(notificationData.body));
        }
        // Track notification open event (for analytics)
        if ("object" !== 'undefined' && window.gtag) {
            ;
            window.gtag('event', 'notification_opened', {
                notification_title: notificationData.title,
                notification_type: notificationData.data.type,
                tapped: notificationData.tapped
            });
        }
    };
    return null;
}
_s(NotificationUrlHandler, "vQduR7x+OPXj6PSmJyFnf+hU7bg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = NotificationUrlHandler;
var _c;
__turbopack_context__.k.register(_c, "NotificationUrlHandler");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ErrorBoundary.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ErrorBoundary",
    ()=>ErrorBoundary
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_define_property.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/triangle-alert.js [app-client] (ecmascript) <export default as AlertTriangle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/refresh-cw.js [app-client] (ecmascript) <export default as RefreshCw>");
'use client';
;
;
;
;
class ErrorBoundary extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Component"] {
    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            error
        };
    }
    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
    componentDidUpdate(prevProps) {
        // Reset error state if children change (route change, etc.)
        if (this.state.hasError && prevProps.children !== this.props.children) {
            this.setState({
                hasError: false,
                error: undefined
            });
        }
    }
    render() {
        if (this.state.hasError) {
            var _this_state_error_message, _this_state_error, _this_state_error_message1, _this_state_error1;
            // Silently recover from React infinite loop errors
            if (((_this_state_error = this.state.error) === null || _this_state_error === void 0 ? void 0 : (_this_state_error_message = _this_state_error.message) === null || _this_state_error_message === void 0 ? void 0 : _this_state_error_message.includes('Maximum update depth')) || ((_this_state_error1 = this.state.error) === null || _this_state_error1 === void 0 ? void 0 : (_this_state_error_message1 = _this_state_error1.message) === null || _this_state_error_message1 === void 0 ? void 0 : _this_state_error_message1.includes('infinite loop'))) {
                // Reset error state and try to recover
                setTimeout(()=>{
                    this.setState({
                        hasError: false,
                        error: undefined
                    });
                }, 100);
                // Return children to prevent error UI from showing
                return this.props.children;
            }
            if (this.props.fallback) {
                return this.props.fallback;
            }
            // Only show error UI for non-infinite-loop errors in production
            // In production, silently recover
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "min-h-screen bg-gray-50 flex items-center justify-center p-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                                className: "w-8 h-8 text-red-600"
                            }, void 0, false, {
                                fileName: "[project]/src/components/ErrorBoundary.tsx",
                                lineNumber: 86,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/ErrorBoundary.tsx",
                            lineNumber: 85,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            className: "text-xl font-semibold text-gray-900 mb-2",
                            children: "Something went wrong"
                        }, void 0, false, {
                            fileName: "[project]/src/components/ErrorBoundary.tsx",
                            lineNumber: 89,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-gray-600 mb-6",
                            children: "The app encountered an error. This might be due to cache issues."
                        }, void 0, false, {
                            fileName: "[project]/src/components/ErrorBoundary.tsx",
                            lineNumber: 93,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: this.handleReload,
                                    className: "w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                            className: "w-4 h-4"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/ErrorBoundary.tsx",
                                            lineNumber: 102,
                                            columnNumber: 17
                                        }, this),
                                        "Clear Cache & Reload"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/ErrorBoundary.tsx",
                                    lineNumber: 98,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>window.location.href = '/',
                                    className: "w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors",
                                    children: "Go to Home"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/ErrorBoundary.tsx",
                                    lineNumber: 106,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/ErrorBoundary.tsx",
                            lineNumber: 97,
                            columnNumber: 13
                        }, this),
                        ("TURBOPACK compile-time value", "development") === 'development' && this.state.error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("details", {
                            className: "mt-4 text-left",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("summary", {
                                    className: "cursor-pointer text-sm text-gray-500",
                                    children: "Error Details"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/ErrorBoundary.tsx",
                                    lineNumber: 116,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pre", {
                                    className: "mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto",
                                    children: this.state.error.toString()
                                }, void 0, false, {
                                    fileName: "[project]/src/components/ErrorBoundary.tsx",
                                    lineNumber: 119,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/ErrorBoundary.tsx",
                            lineNumber: 115,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/ErrorBoundary.tsx",
                    lineNumber: 84,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/ErrorBoundary.tsx",
                lineNumber: 83,
                columnNumber: 9
            }, this);
        }
        return this.props.children;
    }
    constructor(props){
        super(props), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "handleReload", ()=>{
            // Clear all caches and reload
            if ('caches' in window) {
                caches.keys().then((names)=>{
                    names.forEach((name)=>{
                        caches.delete(name);
                    });
                });
            }
            // Clear localStorage
            localStorage.clear();
            sessionStorage.clear();
            // Reload the page
            window.location.reload();
        });
        this.state = {
            hasError: false
        };
    }
}
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/utils/device-safe-area.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DeviceSafeArea",
    ()=>DeviceSafeArea
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_define_property.js [app-client] (ecmascript)");
"use client";
;
class DeviceSafeArea {
    static getInstance() {
        if (!DeviceSafeArea.instance) {
            DeviceSafeArea.instance = new DeviceSafeArea();
        }
        return DeviceSafeArea.instance;
    }
    detectDevice() {
        const userAgent = navigator.userAgent.toLowerCase();
        const isIOS = /iphone|ipad|ipod/.test(userAgent);
        const isAndroid = /android/.test(userAgent);
        if (isIOS) {
            this.deviceType = 'iphone';
            this.hasNotch = this.detectNotch();
            this.hasHomeIndicator = this.detectHomeIndicator();
        } else if (isAndroid) {
            this.deviceType = 'android';
        }
        console.log('📱 Device detected:', {
            type: this.deviceType,
            hasNotch: this.hasNotch,
            hasHomeIndicator: this.hasHomeIndicator,
            userAgent: userAgent
        });
    }
    detectNotch() {
        // Check for iPhone X and newer (with notch)
        const isIPhoneX = /iphone/.test(navigator.userAgent.toLowerCase()) && (window.screen.height >= 812 || window.screen.width >= 812);
        return isIPhoneX;
    }
    detectHomeIndicator() {
        // Check for devices with home indicator (iPhone X and newer)
        return this.hasNotch || window.screen.height >= 812 || window.screen.width >= 812;
    }
    setupSafeAreaCSS() {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        const root = document.documentElement;
        // Set device-specific CSS variables
        root.style.setProperty('--device-type', this.deviceType);
        root.style.setProperty('--has-notch', this.hasNotch ? '1' : '0');
        root.style.setProperty('--has-home-indicator', this.hasHomeIndicator ? '1' : '0');
        // Add device-specific classes
        document.body.classList.add("device-".concat(this.deviceType));
        if (this.hasNotch) document.body.classList.add('has-notch');
        if (this.hasHomeIndicator) document.body.classList.add('has-home-indicator');
        // Update safe area values based on device
        this.updateSafeAreaValues();
    }
    updateSafeAreaValues() {
        const root = document.documentElement;
        if (this.deviceType === 'iphone') {
            if (this.hasHomeIndicator) {
                // iPhone X and newer with home indicator
                root.style.setProperty('--enhanced-safe-area-bottom', '34px');
                root.style.setProperty('--input-safe-area-bottom', '20px');
                root.style.setProperty('--nav-safe-area-bottom', '24px');
            } else {
                // Older iPhones
                root.style.setProperty('--enhanced-safe-area-bottom', '20px');
                root.style.setProperty('--input-safe-area-bottom', '16px');
                root.style.setProperty('--nav-safe-area-bottom', '20px');
            }
        } else if (this.deviceType === 'android') {
            // Android devices with navigation bar
            root.style.setProperty('--enhanced-safe-area-bottom', '24px');
            root.style.setProperty('--input-safe-area-bottom', '20px');
            root.style.setProperty('--nav-safe-area-bottom', '24px');
        } else {
            // Other devices
            root.style.setProperty('--enhanced-safe-area-bottom', '20px');
            root.style.setProperty('--input-safe-area-bottom', '16px');
            root.style.setProperty('--nav-safe-area-bottom', '20px');
        }
    }
    getDeviceInfo() {
        return {
            type: this.deviceType,
            hasNotch: this.hasNotch,
            hasHomeIndicator: this.hasHomeIndicator
        };
    }
    getSafeAreaBottom() {
        let type = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 'default';
        const envValue = 'env(safe-area-inset-bottom, 0px)';
        switch(type){
            case 'input':
                return "max(".concat(envValue, ", var(--input-safe-area-bottom, 16px))");
            case 'nav':
                return "max(".concat(envValue, ", var(--nav-safe-area-bottom, 20px))");
            default:
                return "max(".concat(envValue, ", var(--enhanced-safe-area-bottom, 20px))");
        }
    }
    init() {
        // Re-run detection on orientation change
        window.addEventListener('orientationchange', ()=>{
            setTimeout(()=>{
                this.detectDevice();
                this.setupSafeAreaCSS();
            }, 100);
        });
        // Re-run detection on resize
        window.addEventListener('resize', ()=>{
            this.detectDevice();
            this.setupSafeAreaCSS();
        });
    }
    constructor(){
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "deviceType", 'other');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "hasNotch", false);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "hasHomeIndicator", false);
        this.detectDevice();
        this.setupSafeAreaCSS();
    }
}
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(DeviceSafeArea, "instance", void 0);
// Initialize on import
if ("TURBOPACK compile-time truthy", 1) {
    DeviceSafeArea.getInstance().init();
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/utils/feature-update-manager.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Feature Update Manager - Like Instagram PWA
// Handles feature rollouts and cache invalidation for new features
__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "featureUpdateManager",
    ()=>featureUpdateManager
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_define_property.js [app-client] (ecmascript)");
;
class FeatureUpdateManager {
    static getInstance() {
        if (!FeatureUpdateManager.instance) {
            FeatureUpdateManager.instance = new FeatureUpdateManager();
        }
        return FeatureUpdateManager.instance;
    }
    // Check for feature updates and handle cache invalidation
    async checkForFeatureUpdates() {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        try {
            const storedVersion = localStorage.getItem(this.VERSION_KEY);
            const lastCheck = localStorage.getItem(this.LAST_CHECK_KEY);
            const now = Date.now();
            // Check every 2 minutes (more frequent than version check)
            const shouldCheck = !lastCheck || now - parseInt(lastCheck) > 2 * 60 * 1000;
            if (!shouldCheck) {
                return false;
            }
            localStorage.setItem(this.LAST_CHECK_KEY, now.toString());
            // Check if version changed
            const needsUpdate = !storedVersion || storedVersion !== this.CURRENT_VERSION.version || this.CURRENT_VERSION.forceUpdate;
            if (needsUpdate) {
                console.log('🚀 New features detected!', {
                    oldVersion: storedVersion,
                    newVersion: this.CURRENT_VERSION.version,
                    newFeatures: this.CURRENT_VERSION.features
                });
                await this.handleFeatureUpdate();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Feature update check failed:', error);
            return false;
        }
    }
    // Handle feature update - clear relevant caches
    async handleFeatureUpdate() {
        try {
            // Clear feature-specific caches
            const cacheKeysToClear = new Set();
            this.FEATURES.forEach((feature)=>{
                if (feature.enabled) {
                    feature.cacheKeys.forEach((key)=>cacheKeysToClear.add(key));
                }
            });
            // Clear localStorage caches
            const keysToRemove = [];
            for(let i = 0; i < localStorage.length; i++){
                const key = localStorage.key(i);
                if (key) {
                    // Clear feature-related caches
                    cacheKeysToClear.forEach((cacheKey)=>{
                        if (key.includes(cacheKey)) {
                            keysToRemove.push(key);
                        }
                    });
                    // Clear old version caches
                    if (key.includes('cache') || key.includes('Cache')) {
                        keysToRemove.push(key);
                    }
                }
            }
            keysToRemove.forEach((key)=>{
                localStorage.removeItem(key);
                console.log('🗑️ Cleared cache:', key);
            });
            // Clear service worker caches
            if ('serviceWorker' in navigator && 'caches' in window) {
                const cacheNames = await caches.keys();
                await Promise.all(cacheNames.map((cacheName)=>{
                    console.log('🗑️ Clearing service worker cache:', cacheName);
                    return caches.delete(cacheName);
                }));
            }
            // Update stored version
            localStorage.setItem(this.VERSION_KEY, this.CURRENT_VERSION.version);
            localStorage.setItem(this.FEATURE_KEY, JSON.stringify(this.CURRENT_VERSION.features));
            // Show update notification
            this.showUpdateNotification();
            console.log('✅ Feature update completed');
        } catch (error) {
            console.error('Feature update failed:', error);
        }
    }
    // Check if a specific feature is enabled for this user
    isFeatureEnabled(featureId) {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        try {
            const feature = this.FEATURES.find((f)=>f.featureId === featureId);
            if (!feature) return false;
            // Check if feature is enabled
            if (!feature.enabled) return false;
            // Check rollout percentage (like Instagram does)
            const userId = this.getUserId();
            const userHash = this.hashUserId(userId);
            const rolloutThreshold = feature.rolloutPercentage / 100;
            return userHash < rolloutThreshold;
        } catch (error) {
            console.error('Feature check failed:', error);
            return false;
        }
    }
    // Get user ID for consistent feature rollout
    getUserId() {
        // Try to get from auth context or generate consistent ID
        const authUser = localStorage.getItem('userAuthenticated');
        if (authUser) {
            return authUser;
        }
        // Generate consistent ID based on browser fingerprint
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx === null || ctx === void 0 ? void 0 : ctx.fillText('feature-rollout', 10, 10);
        const fingerprint = canvas.toDataURL();
        return btoa(fingerprint).slice(0, 16);
    }
    // Hash user ID for consistent rollout
    hashUserId(userId) {
        let hash = 0;
        for(let i = 0; i < userId.length; i++){
            const char = userId.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash) / 2147483647; // Normalize to 0-1
    }
    // Show update notification to user via notification system
    // DISABLED: Push notifications for feature updates are disabled
    async showUpdateNotification() {
        // Disabled - no longer broadcasting push notifications for feature updates
        console.log('ℹ️ Feature update detected, notification disabled');
        return;
    }
    // Force refresh for all users (emergency updates)
    forceRefresh() {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        console.log('🔄 Force refreshing app for all users...');
        // Clear all caches
        localStorage.clear();
        sessionStorage.clear();
        // Clear service worker caches
        if ('serviceWorker' in navigator && 'caches' in window) {
            caches.keys().then((cacheNames)=>{
                return Promise.all(cacheNames.map((cacheName)=>caches.delete(cacheName)));
            });
        }
        // Reload page
        window.location.reload();
    }
    // Get current version info
    getVersionInfo() {
        return {
            ...this.CURRENT_VERSION
        };
    }
    // Get enabled features for current user
    getEnabledFeatures() {
        return this.FEATURES.filter((feature)=>this.isFeatureEnabled(feature.featureId)).map((feature)=>feature.featureId);
    }
    constructor(){
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "FEATURE_KEY", 'app-features');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "VERSION_KEY", 'app-version-info');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "LAST_CHECK_KEY", 'last-feature-check');
        // Current app version - update this when you add new features
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "CURRENT_VERSION", {
            version: '3.1.0',
            buildTime: new Date().toISOString(),
            features: [
                'video-calls',
                'enhanced-chat',
                'improved-navigation',
                'viewport-fixes'
            ],
            forceUpdate: false // Set to true to force all users to update
        });
        // Feature definitions - control which users see new features
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "FEATURES", [
            {
                featureId: 'video-calls',
                version: '3.1.0',
                rolloutPercentage: 100,
                enabled: true,
                cacheKeys: [
                    'chat-cache',
                    'media-cache',
                    'user-cache'
                ],
                description: 'Video call functionality in chat'
            },
            {
                featureId: 'enhanced-chat',
                version: '3.1.0',
                rolloutPercentage: 100,
                enabled: true,
                cacheKeys: [
                    'chat-cache',
                    'messages-cache'
                ],
                description: 'Enhanced chat interface with better UX'
            },
            {
                featureId: 'improved-navigation',
                version: '3.1.0',
                rolloutPercentage: 100,
                enabled: true,
                cacheKeys: [
                    'navigation-cache',
                    'user-cache'
                ],
                description: 'Improved back navigation and routing'
            },
            {
                featureId: 'viewport-fixes',
                version: '3.1.0',
                rolloutPercentage: 100,
                enabled: true,
                cacheKeys: [
                    'layout-cache',
                    'ui-cache'
                ],
                description: 'Fixed viewport height issues on app resume'
            }
        ]);
    }
}
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(FeatureUpdateManager, "instance", void 0);
const featureUpdateManager = FeatureUpdateManager.getInstance();
const __TURBOPACK__default__export__ = featureUpdateManager;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/FeatureUpdateChecker.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>FeatureUpdateChecker,
    "useEnabledFeatures",
    ()=>useEnabledFeatures,
    "useFeatureFlag",
    ()=>useFeatureFlag
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$feature$2d$update$2d$manager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/feature-update-manager.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature();
'use client';
;
;
function FeatureUpdateChecker() {
    _s();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "FeatureUpdateChecker.useEffect": ()=>{
            const checkForUpdates = {
                "FeatureUpdateChecker.useEffect.checkForUpdates": async ()=>{
                    try {
                        const hasUpdate = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$feature$2d$update$2d$manager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["featureUpdateManager"].checkForFeatureUpdates();
                        if (hasUpdate) {
                            console.log('🚀 New features detected and notifications sent!');
                        }
                    } catch (error) {
                        console.error('Feature update check failed:', error);
                    }
                }
            }["FeatureUpdateChecker.useEffect.checkForUpdates"];
            // Check immediately
            checkForUpdates();
            // Check every 5 minutes (less frequent to avoid spam)
            const interval = setInterval(checkForUpdates, 5 * 60 * 1000);
            // Check when app becomes visible (user switches back to tab)
            const handleVisibilityChange = {
                "FeatureUpdateChecker.useEffect.handleVisibilityChange": ()=>{
                    if (!document.hidden) {
                        checkForUpdates();
                    }
                }
            }["FeatureUpdateChecker.useEffect.handleVisibilityChange"];
            document.addEventListener('visibilitychange', handleVisibilityChange);
            return ({
                "FeatureUpdateChecker.useEffect": ()=>{
                    clearInterval(interval);
                    document.removeEventListener('visibilitychange', handleVisibilityChange);
                }
            })["FeatureUpdateChecker.useEffect"];
        }
    }["FeatureUpdateChecker.useEffect"], []);
    // This component doesn't render anything visible
    return null;
}
_s(FeatureUpdateChecker, "OD7bBpZva5O2jO+Puf00hKivP7c=");
_c = FeatureUpdateChecker;
function useFeatureFlag(featureId) {
    _s1();
    const [isEnabled, setIsEnabled] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useFeatureFlag.useEffect": ()=>{
            const checkFeature = {
                "useFeatureFlag.useEffect.checkFeature": ()=>{
                    const enabled = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$feature$2d$update$2d$manager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["featureUpdateManager"].isFeatureEnabled(featureId);
                    setIsEnabled(enabled);
                }
            }["useFeatureFlag.useEffect.checkFeature"];
            checkFeature();
            // Re-check when features might be updated
            const interval = setInterval(checkFeature, 30 * 1000); // Check every 30 seconds
            return ({
                "useFeatureFlag.useEffect": ()=>clearInterval(interval)
            })["useFeatureFlag.useEffect"];
        }
    }["useFeatureFlag.useEffect"], [
        featureId
    ]);
    return isEnabled;
}
_s1(useFeatureFlag, "9WIsOGNNZAN3vDbYeVitsqMWXsA=");
function useEnabledFeatures() {
    _s2();
    const [features, setFeatures] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useEnabledFeatures.useEffect": ()=>{
            const updateFeatures = {
                "useEnabledFeatures.useEffect.updateFeatures": ()=>{
                    const enabledFeatures = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$feature$2d$update$2d$manager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["featureUpdateManager"].getEnabledFeatures();
                    setFeatures(enabledFeatures);
                }
            }["useEnabledFeatures.useEffect.updateFeatures"];
            updateFeatures();
            // Re-check when features might be updated
            const interval = setInterval(updateFeatures, 30 * 1000);
            return ({
                "useEnabledFeatures.useEffect": ()=>clearInterval(interval)
            })["useEnabledFeatures.useEffect"];
        }
    }["useEnabledFeatures.useEffect"], []);
    return features;
}
_s2(useEnabledFeatures, "ypOwFX/TV9+PVMCBxfFaLZXumhg=");
var _c;
__turbopack_context__.k.register(_c, "FeatureUpdateChecker");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/OfflineIndicator.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Offline Indicator - Shows offline status permanently, online status briefly
__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
const OfflineIndicator = /*#__PURE__*/ _s((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["memo"])(_c = _s(function OfflineIndicator(param) {
    let { className = '' } = param;
    _s();
    const [isOnline, setIsOnline] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [showOnlineNotification, setShowOnlineNotification] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "OfflineIndicator.OfflineIndicator.useEffect": ()=>{
            // Check initial connection status
            setIsOnline(navigator.onLine);
            // Listen for online/offline events
            const handleOnline = {
                "OfflineIndicator.OfflineIndicator.useEffect.handleOnline": ()=>{
                    setIsOnline(true);
                    setShowOnlineNotification(true);
                    console.log('🌐 Online');
                    // Hide "Online" notification after 3 seconds
                    setTimeout({
                        "OfflineIndicator.OfflineIndicator.useEffect.handleOnline": ()=>{
                            setShowOnlineNotification(false);
                        }
                    }["OfflineIndicator.OfflineIndicator.useEffect.handleOnline"], 3000); // 3 seconds
                }
            }["OfflineIndicator.OfflineIndicator.useEffect.handleOnline"];
            const handleOffline = {
                "OfflineIndicator.OfflineIndicator.useEffect.handleOffline": ()=>{
                    setIsOnline(false);
                    setShowOnlineNotification(false);
                    console.log('📴 Offline');
                }
            }["OfflineIndicator.OfflineIndicator.useEffect.handleOffline"];
            window.addEventListener('online', handleOnline);
            window.addEventListener('offline', handleOffline);
            return ({
                "OfflineIndicator.OfflineIndicator.useEffect": ()=>{
                    window.removeEventListener('online', handleOnline);
                    window.removeEventListener('offline', handleOffline);
                }
            })["OfflineIndicator.OfflineIndicator.useEffect"];
        }
    }["OfflineIndicator.OfflineIndicator.useEffect"], []);
    // Don't show anything if online and notification timeout has passed
    if (isOnline && !showOnlineNotification) {
        return null;
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed top-2 left-1/2 transform -translate-x-1/2 z-50 ".concat(className),
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "px-3 py-1 rounded-full text-xs font-medium shadow-lg transition-all duration-300 ".concat(isOnline ? 'bg-green-500 text-white' : 'bg-red-500 text-white'),
            children: isOnline ? '🌐 Online' : '📴 Offline'
        }, void 0, false, {
            fileName: "[project]/src/components/OfflineIndicator.tsx",
            lineNumber: 55,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/OfflineIndicator.tsx",
        lineNumber: 54,
        columnNumber: 5
    }, this);
}, "0k/Z4oTB5GF+JBj/rBDVE84KR7Y=")), "0k/Z4oTB5GF+JBj/rBDVE84KR7Y=");
_c1 = OfflineIndicator;
const __TURBOPACK__default__export__ = OfflineIndicator;
var _c, _c1;
__turbopack_context__.k.register(_c, "OfflineIndicator$memo");
__turbopack_context__.k.register(_c1, "OfflineIndicator");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/utils/versionManager.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Version Manager for Smart Cache Invalidation
// This ensures users get updates immediately in production
__turbopack_context__.s([
    "devForceRefresh",
    ()=>devForceRefresh,
    "initializeVersionCheck",
    ()=>initializeVersionCheck,
    "versionManager",
    ()=>versionManager
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_define_property.js [app-client] (ecmascript)");
;
class VersionManager {
    static getInstance() {
        if (!VersionManager.instance) {
            VersionManager.instance = new VersionManager();
        }
        return VersionManager.instance;
    }
    generateVersion() {
        // Use current timestamp as version for automatic cache busting
        // This ensures every deployment gets a new version
        const buildTime = Date.now().toString();
        return "v".concat(buildTime);
    }
    // Check if app version has changed and needs cache refresh
    async checkForUpdates() {
        // Only run in browser environment
        if ("object" === 'undefined' || typeof localStorage === 'undefined') {
            return false;
        }
        try {
            const storedVersion = localStorage.getItem(this.VERSION_KEY);
            const lastUpdateCheck = localStorage.getItem(this.LAST_UPDATE_KEY);
            const now = Date.now();
            // Check for updates every 5 minutes
            const shouldCheck = !lastUpdateCheck || now - parseInt(lastUpdateCheck) > 5 * 60 * 1000;
            if (!shouldCheck) {
                return false;
            }
            // Update last check time
            localStorage.setItem(this.LAST_UPDATE_KEY, now.toString());
            // If no stored version or version changed, we need to update
            if (!storedVersion || storedVersion !== this.currentVersion) {
                console.log('🔄 App version changed, clearing caches...');
                console.log("Old version: ".concat(storedVersion));
                console.log("New version: ".concat(this.currentVersion));
                await this.clearAllCaches();
                localStorage.setItem(this.VERSION_KEY, this.currentVersion);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error checking for updates:', error);
            return false;
        }
    }
    // Clear all caches when version changes
    async clearAllCaches() {
        try {
            // Clear localStorage cache
            this.clearLocalStorageCache();
            // Clear service worker cache
            await this.clearServiceWorkerCache();
            // Clear browser cache
            await this.clearBrowserCache();
            console.log('✅ All caches cleared for new version');
        } catch (error) {
            console.error('Error clearing caches:', error);
        }
    }
    clearLocalStorageCache() {
        if ("object" === 'undefined' || typeof localStorage === 'undefined') {
            return;
        }
        const keysToRemove = [];
        for(let i = 0; i < localStorage.length; i++){
            const key = localStorage.key(i);
            if (key && (key.includes('cache') || key.includes('supabase') || key.includes('data') || key.includes('offline') || key.includes('profile') || key.includes('pages'))) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach((key)=>localStorage.removeItem(key));
        console.log("🧹 Cleared ".concat(keysToRemove.length, " localStorage cache entries"));
    }
    async clearServiceWorkerCache() {
        if ("object" !== 'undefined' && 'serviceWorker' in navigator) {
            try {
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (const registration of registrations){
                    await registration.unregister();
                }
                console.log('🧹 Service Worker cache cleared');
            } catch (error) {
                console.error('Error clearing service worker cache:', error);
            }
        }
    }
    async clearBrowserCache() {
        if ("object" !== 'undefined' && 'caches' in window) {
            try {
                const cacheNames = await caches.keys();
                await Promise.all(cacheNames.map((cacheName)=>caches.delete(cacheName)));
                console.log('🧹 Browser cache cleared');
            } catch (error) {
                console.error('Error clearing browser cache:', error);
            }
        }
    }
    // Force refresh for immediate updates (manual trigger)
    async forceRefresh() {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        console.log('🔄 Force refresh triggered...');
        await this.clearAllCaches();
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(this.VERSION_KEY, this.currentVersion);
        }
        window.location.reload();
    }
    // Get current version
    getCurrentVersion() {
        return this.currentVersion;
    }
    // Check if this is a new session (first load after update)
    isNewSession() {
        if ("object" === 'undefined' || typeof localStorage === 'undefined') {
            return false;
        }
        const storedVersion = localStorage.getItem(this.VERSION_KEY);
        return !storedVersion || storedVersion !== this.currentVersion;
    }
    constructor(){
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "currentVersion", void 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "VERSION_KEY", 'app-version');
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "LAST_UPDATE_KEY", 'last-update-check');
        // Use build time as version for automatic cache busting
        this.currentVersion = this.generateVersion();
    }
}
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(VersionManager, "instance", void 0);
const versionManager = VersionManager.getInstance();
const initializeVersionCheck = async ()=>{
    const hasUpdates = await versionManager.checkForUpdates();
    if (hasUpdates) {
        console.log('🎉 App updated! Fresh data will be loaded.');
        // Show a subtle notification to user
        if ("TURBOPACK compile-time truthy", 1) {
            // You can add a toast notification here
            console.log('App has been updated with new features!');
        }
    }
};
const devForceRefresh = ()=>{
    if ("TURBOPACK compile-time truthy", 1) {
        versionManager.forceRefresh();
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ForceUpdateButton.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ForceUpdateButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/refresh-cw.js [app-client] (ecmascript) <export default as RefreshCw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$versionManager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/versionManager.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function ForceUpdateButton() {
    _s();
    const [isUpdating, setIsUpdating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const handleForceUpdate = async ()=>{
        setIsUpdating(true);
        try {
            console.log('🔄 Force update triggered by user');
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$versionManager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["versionManager"].forceRefresh();
        } catch (error) {
            console.error('❌ Force update failed:', error);
            setIsUpdating(false);
        }
    };
    // Only show in development or when there are cache issues
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        onClick: handleForceUpdate,
        disabled: isUpdating,
        className: "fixed bottom-4 left-4 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white p-3 rounded-full shadow-lg transition-colors z-50",
        title: "Force Update (Clear All Caches)",
        children: isUpdating ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
            className: "w-5 h-5 animate-spin"
        }, void 0, false, {
            fileName: "[project]/src/components/ForceUpdateButton.tsx",
            lineNumber: 34,
            columnNumber: 9
        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
            className: "w-5 h-5"
        }, void 0, false, {
            fileName: "[project]/src/components/ForceUpdateButton.tsx",
            lineNumber: 36,
            columnNumber: 9
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/ForceUpdateButton.tsx",
        lineNumber: 27,
        columnNumber: 5
    }, this);
}
_s(ForceUpdateButton, "Iu9QP35HOe9AU5k2QizHmZa0ji4=");
_c = ForceUpdateButton;
var _c;
__turbopack_context__.k.register(_c, "ForceUpdateButton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/utils/analytics.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Simplified Analytics tracking utility
__turbopack_context__.s([
    "analyticsTracker",
    ()=>analyticsTracker,
    "clearAnalyticsData",
    ()=>clearAnalyticsData,
    "getAnalyticsData",
    ()=>getAnalyticsData,
    "trackFeatureEngagement",
    ()=>trackFeatureEngagement,
    "trackLogin",
    ()=>trackLogin,
    "trackSignup",
    ()=>trackSignup
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_define_property.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase-database.ts [app-client] (ecmascript)");
;
;
class AnalyticsTracker {
    getDeviceType() {
        if (typeof navigator === 'undefined') return 'desktop';
        const userAgent = navigator.userAgent.toLowerCase();
        if (/tablet|ipad/.test(userAgent)) return 'tablet';
        if (/mobile|android|iphone/.test(userAgent)) return 'mobile';
        return 'desktop';
    }
    getBrowser() {
        if (typeof navigator === 'undefined') return 'Unknown';
        const userAgent = navigator.userAgent;
        if (userAgent.includes('Chrome')) return 'Chrome';
        if (userAgent.includes('Firefox')) return 'Firefox';
        if (userAgent.includes('Safari')) return 'Safari';
        if (userAgent.includes('Edge')) return 'Edge';
        return 'Other';
    }
    async getLocation() {
        try {
            // Using a free IP geolocation service
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();
            return {
                country: data.country_name,
                city: data.city
            };
        } catch (error) {
            console.warn('Could not fetch location data:', error);
            return {};
        }
    }
    initializeTracking() {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        this.isTracking = true;
    }
    async updateSessionPageViews() {
    // Simplified update - not needed in this version
    }
    async trackEvent(type, featureName, page) {
        if (!this.isTracking) return;
        const location = await this.getLocation();
        const event = {
            id: "event_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9)),
            type,
            timestamp: Date.now(),
            page,
            featureName,
            country: location.country,
            city: location.city,
            browser: this.getBrowser(),
            deviceType: this.getDeviceType(),
            metadata: {}
        };
        this.sendEvent(event);
    }
    async trackSessionEnd() {
        if (!this.isTracking) return;
        this.isTracking = false;
    }
    async sendEvent(event) {
        try {
            // Store event in Firebase
            await this.storeEventInFirebase(event);
        } catch (error) {
            console.warn('Failed to send analytics event:', error);
        }
    }
    async storeEventInFirebase(event) {
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].createDocument('analytics_events', event.id, event);
        } catch (error) {
            console.warn('Failed to store analytics event in Firebase:', error);
        }
    }
    async getStoredEvents() {
        try {
            const events = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].getCollection('analytics_events');
            return events || [];
        } catch (error) {
            console.warn('Failed to get stored events from Firebase:', error);
            return [];
        }
    }
    async clearStoredData() {
        try {
            // Note: This would require implementing a delete collection method in FirebaseDatabaseService
            console.warn('Clear data functionality needs to be implemented in FirebaseDatabaseService');
        } catch (error) {
            console.warn('Failed to clear stored data:', error);
        }
    }
    // Public method to get analytics data for the dashboard
    async getAnalyticsData() {
        let dateRange = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : '7d';
        const events = await this.getStoredEvents();
        const now = Date.now();
        const daysBack = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : 365;
        const cutoffTime = now - daysBack * 24 * 60 * 60 * 1000;
        const filteredEvents = events.filter((event)=>event.timestamp >= cutoffTime);
        // Calculate metrics
        const signups = filteredEvents.filter((e)=>e.type === 'signup').length;
        const logins = filteredEvents.filter((e)=>e.type === 'login').length;
        const featureEngagements = filteredEvents.filter((e)=>e.type === 'feature_engagement').length;
        // Top pages (from feature engagement events that have pages)
        const pageViewsByPage = filteredEvents.filter((e)=>e.type === 'feature_engagement' && e.page).reduce((acc, event)=>{
            acc[event.page] = (acc[event.page] || 0) + 1;
            return acc;
        }, {});
        const topPages = Object.entries(pageViewsByPage).map((param)=>{
            let [page, views] = param;
            return {
                page,
                views
            };
        }).sort((a, b)=>b.views - a.views).slice(0, 10);
        // Browser stats
        const browserCounts = filteredEvents.reduce((acc, event)=>{
            if (event.browser) {
                acc[event.browser] = (acc[event.browser] || 0) + 1;
            }
            return acc;
        }, {});
        const totalBrowsers = Object.values(browserCounts).reduce((sum, count)=>sum + count, 0);
        const browserStats = Object.entries(browserCounts).map((param)=>{
            let [browser, count] = param;
            return {
                browser,
                count,
                percentage: totalBrowsers > 0 ? count / totalBrowsers * 100 : 0
            };
        });
        // Countries
        const countryCounts = filteredEvents.reduce((acc, event)=>{
            if (event.country) {
                acc[event.country] = (acc[event.country] || 0) + 1;
            }
            return acc;
        }, {});
        const totalCountries = Object.values(countryCounts).reduce((sum, count)=>sum + count, 0);
        const countries = Object.entries(countryCounts).map((param)=>{
            let [country, count] = param;
            return {
                country,
                count,
                percentage: totalCountries > 0 ? count / totalCountries * 100 : 0
            };
        });
        // Cities
        const cityCounts = filteredEvents.reduce((acc, event)=>{
            if (event.city) {
                acc[event.city] = (acc[event.city] || 0) + 1;
            }
            return acc;
        }, {});
        const totalCities = Object.values(cityCounts).reduce((sum, count)=>sum + count, 0);
        const cities = Object.entries(cityCounts).map((param)=>{
            let [city, count] = param;
            return {
                city,
                count,
                percentage: totalCities > 0 ? count / totalCities * 100 : 0
            };
        });
        // Feature engagement
        const featureCounts = filteredEvents.filter((e)=>e.type === 'feature_engagement' && e.featureName).reduce((acc, event)=>{
            acc[event.featureName] = (acc[event.featureName] || 0) + 1;
            return acc;
        }, {});
        const featureEngagementStats = Object.entries(featureCounts).map((param)=>{
            let [feature, count] = param;
            return {
                feature,
                count
            };
        });
        return {
            signups,
            logins,
            featureEngagements,
            topPages,
            browserStats,
            countries,
            cities,
            featureEngagementStats
        };
    }
    constructor(){
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "isTracking", false);
        this.initializeTracking();
    }
}
const analyticsTracker = new AnalyticsTracker();
const trackSignup = async (userId)=>{
    await analyticsTracker.trackEvent('signup');
};
const trackLogin = async (userId)=>{
    await analyticsTracker.trackEvent('login');
};
const trackFeatureEngagement = async (featureName, page)=>{
    await analyticsTracker.trackEvent('feature_engagement', featureName, page);
};
const getAnalyticsData = (dateRange)=>analyticsTracker.getAnalyticsData(dateRange);
const clearAnalyticsData = ()=>analyticsTracker.clearStoredData();
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/AnalyticsProvider.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AnalyticsProvider",
    ()=>AnalyticsProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$analytics$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/analytics.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
const AnalyticsProvider = (param)=>{
    let { children } = param;
    _s();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AnalyticsProvider.useEffect": ()=>{
            // Track feature engagement when pathname changes
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$analytics$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["trackFeatureEngagement"])('page_navigation', pathname);
        }
    }["AnalyticsProvider.useEffect"], [
        pathname
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: children
    }, void 0, false);
};
_s(AnalyticsProvider, "V/ldUoOTYUs0Cb2F6bbxKSn7KxI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"]
    ];
});
_c = AnalyticsProvider;
var _c;
__turbopack_context__.k.register(_c, "AnalyticsProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_e5940b4e._.js.map