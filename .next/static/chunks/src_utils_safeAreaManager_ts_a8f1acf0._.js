(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/utils/safeAreaManager.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Safe Area Manager - Handles device-specific safe area adjustments
 * Fixes bottom bar cut-off issues on mobile devices
 */ __turbopack_context__.s([
    "SafeAreaManager",
    ()=>SafeAreaManager
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@swc/helpers/esm/_define_property.js [app-client] (ecmascript)");
;
class SafeAreaManager {
    static getInstance() {
        if (!SafeAreaManager.instance) {
            SafeAreaManager.instance = new SafeAreaManager();
        }
        return SafeAreaManager.instance;
    }
    /**
   * Initialize safe area detection
   */ init() {
        if (this.isInitialized) return;
        this.detectSafeArea();
        this.setupEventListeners();
        this.applySafeAreaStyles();
        this.isInitialized = true;
        console.log('🛡️ SafeAreaManager initialized with bottom safe area:', this.safeAreaBottom);
    }
    /**
   * Detect the device's safe area
   */ detectSafeArea() {
        // Get safe area from CSS environment variables
        const testElement = document.createElement('div');
        testElement.style.position = 'fixed';
        testElement.style.bottom = '0';
        testElement.style.left = '0';
        testElement.style.right = '0';
        testElement.style.paddingBottom = 'env(safe-area-inset-bottom, 0px)';
        testElement.style.visibility = 'hidden';
        testElement.style.pointerEvents = 'none';
        document.body.appendChild(testElement);
        const computedStyle = window.getComputedStyle(testElement);
        const paddingBottom = computedStyle.paddingBottom;
        // Parse the padding value
        this.safeAreaBottom = parseInt(paddingBottom) || 0;
        // Clean up
        document.body.removeChild(testElement);
        // Fallback detection for devices without proper safe area support
        if (this.safeAreaBottom === 0) {
            this.detectFallbackSafeArea();
        }
    }
    /**
   * Fallback detection for devices without proper safe area support
   */ detectFallbackSafeArea() {
        const userAgent = navigator.userAgent.toLowerCase();
        const isIOS = /iphone|ipad|ipod/.test(userAgent);
        const isAndroid = /android/.test(userAgent);
        if (isIOS) {
            // iPhone X and later have home indicators
            const isIPhoneX = /iphone/.test(userAgent) && window.screen.height >= 812;
            this.safeAreaBottom = isIPhoneX ? 34 : 20; // iPhone X+ has 34px, older iPhones have 20px
        } else if (isAndroid) {
            // Android devices with gesture navigation
            this.safeAreaBottom = 24;
        } else {
            // Desktop or other devices
            this.safeAreaBottom = 0;
        }
    }
    /**
   * Setup event listeners for orientation changes and resize
   */ setupEventListeners() {
        // Handle orientation changes
        window.addEventListener('orientationchange', ()=>{
            setTimeout(()=>{
                this.detectSafeArea();
                this.applySafeAreaStyles();
                console.log('🛡️ Safe area updated after orientation change');
            }, 100);
        });
        // Handle resize events
        window.addEventListener('resize', ()=>{
            this.detectSafeArea();
            this.applySafeAreaStyles();
            console.log('🛡️ Safe area updated after resize');
        });
        // Handle visual viewport changes (for mobile browsers)
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', ()=>{
                this.detectSafeArea();
                this.applySafeAreaStyles();
                console.log('🛡️ Safe area updated after visual viewport change');
            });
        }
        // Handle page visibility changes (when navigating between pages)
        document.addEventListener('visibilitychange', ()=>{
            if (!document.hidden) {
                setTimeout(()=>{
                    this.detectSafeArea();
                    this.applySafeAreaStyles();
                    console.log('🛡️ Safe area updated after page visibility change');
                }, 200);
            }
        });
        // Handle popstate events (back/forward navigation)
        window.addEventListener('popstate', ()=>{
            setTimeout(()=>{
                this.detectSafeArea();
                this.applySafeAreaStyles();
                console.log('🛡️ Safe area updated after navigation');
            }, 100);
        });
    }
    /**
   * Apply safe area styles to the document
   */ applySafeAreaStyles() {
        const root = document.documentElement;
        // Set CSS custom properties
        root.style.setProperty('--safe-area-bottom', "".concat(this.safeAreaBottom, "px"));
        root.style.setProperty('--enhanced-safe-area-bottom', "".concat(Math.max(this.safeAreaBottom, 24), "px"));
        // Add device-specific classes
        root.classList.remove('has-safe-area', 'no-safe-area');
        if (this.safeAreaBottom > 0) {
            root.classList.add('has-safe-area');
        } else {
            root.classList.add('no-safe-area');
        }
    }
    /**
   * Get the current safe area bottom value
   */ getSafeAreaBottom() {
        return this.safeAreaBottom;
    }
    /**
   * Get enhanced safe area bottom (minimum 24px)
   */ getEnhancedSafeAreaBottom() {
        return Math.max(this.safeAreaBottom, 24);
    }
    /**
   * Check if device has safe area
   */ hasSafeArea() {
        return this.safeAreaBottom > 0;
    }
    /**
   * Manually trigger safe area recalculation
   * Useful when navigating between pages or when layout changes
   */ recalculate() {
        console.log('🛡️ Manually recalculating safe area...');
        this.detectSafeArea();
        this.applySafeAreaStyles();
    }
    constructor(){
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "safeAreaBottom", 0);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(this, "isInitialized", false);
    }
}
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$swc$2f$helpers$2f$esm$2f$_define_property$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["_"])(SafeAreaManager, "instance", void 0);
// Auto-initialize when the module is loaded
if ("TURBOPACK compile-time truthy", 1) {
    const safeAreaManager = SafeAreaManager.getInstance();
    safeAreaManager.init();
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_utils_safeAreaManager_ts_a8f1acf0._.js.map