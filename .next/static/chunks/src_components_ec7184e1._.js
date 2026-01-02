(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/Toast.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ToastContainer",
    ()=>ToastContainer,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check-big.js [app-client] (ecmascript) <export default as CheckCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-x.js [app-client] (ecmascript) <export default as XCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
const ToastComponent = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["memo"])(_s(function ToastComponent(param) {
    let { toast, onRemove } = param;
    _s();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ToastComponent.ToastComponent.useEffect": ()=>{
            const timer = setTimeout({
                "ToastComponent.ToastComponent.useEffect.timer": ()=>{
                    onRemove(toast.id);
                }
            }["ToastComponent.ToastComponent.useEffect.timer"], toast.duration || 4000);
            return ({
                "ToastComponent.ToastComponent.useEffect": ()=>clearTimeout(timer)
            })["ToastComponent.ToastComponent.useEffect"];
        }
    }["ToastComponent.ToastComponent.useEffect"], [
        toast.id,
        toast.duration,
        onRemove
    ]);
    const getIcon = ()=>{
        switch(toast.type){
            case 'success':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                    className: "w-5 h-5 text-green-500"
                }, void 0, false, {
                    fileName: "[project]/src/components/Toast.tsx",
                    lineNumber: 32,
                    columnNumber: 16
                }, this);
            case 'error':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"], {
                    className: "w-5 h-5 text-red-500"
                }, void 0, false, {
                    fileName: "[project]/src/components/Toast.tsx",
                    lineNumber: 34,
                    columnNumber: 16
                }, this);
            case 'info':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                    className: "w-5 h-5 text-blue-500"
                }, void 0, false, {
                    fileName: "[project]/src/components/Toast.tsx",
                    lineNumber: 36,
                    columnNumber: 16
                }, this);
            case 'warning':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"], {
                    className: "w-5 h-5 text-yellow-500"
                }, void 0, false, {
                    fileName: "[project]/src/components/Toast.tsx",
                    lineNumber: 38,
                    columnNumber: 16
                }, this);
            default:
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                    className: "w-5 h-5 text-gray-500"
                }, void 0, false, {
                    fileName: "[project]/src/components/Toast.tsx",
                    lineNumber: 40,
                    columnNumber: 16
                }, this);
        }
    };
    const getBackgroundColor = ()=>{
        switch(toast.type){
            case 'success':
                return 'bg-green-50 border-green-200';
            case 'error':
                return 'bg-red-50 border-red-200';
            case 'info':
                return 'bg-blue-50 border-blue-200';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200';
            default:
                return 'bg-gray-50 border-gray-200';
        }
    };
    const getTextColor = ()=>{
        switch(toast.type){
            case 'success':
                return 'text-green-800';
            case 'error':
                return 'text-red-800';
            case 'info':
                return 'text-blue-800';
            case 'warning':
                return 'text-yellow-800';
            default:
                return 'text-gray-800';
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center gap-3 p-4 rounded-lg border shadow-lg ".concat(getBackgroundColor(), " animate-in slide-in-from-right-full duration-300"),
        children: [
            getIcon(),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "flex-1 text-sm font-medium ".concat(getTextColor()),
                children: toast.message
            }, void 0, false, {
                fileName: "[project]/src/components/Toast.tsx",
                lineNumber: 77,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>onRemove(toast.id),
                className: "text-gray-400 hover:text-gray-600 transition-colors",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                    className: "w-4 h-4"
                }, void 0, false, {
                    fileName: "[project]/src/components/Toast.tsx",
                    lineNumber: 84,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/Toast.tsx",
                lineNumber: 80,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/Toast.tsx",
        lineNumber: 75,
        columnNumber: 5
    }, this);
}, "OD7bBpZva5O2jO+Puf00hKivP7c="));
_c = ToastComponent;
const __TURBOPACK__default__export__ = ToastComponent;
function ToastContainer(param) {
    let { toasts, onRemove } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed top-4 right-4 z-[60] space-y-2 max-w-sm",
        children: toasts.map((toast)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ToastComponent, {
                toast: toast,
                onRemove: onRemove
            }, toast.id, false, {
                fileName: "[project]/src/components/Toast.tsx",
                lineNumber: 101,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/src/components/Toast.tsx",
        lineNumber: 99,
        columnNumber: 5
    }, this);
}
_c1 = ToastContainer;
var _c, _c1;
__turbopack_context__.k.register(_c, "ToastComponent");
__turbopack_context__.k.register(_c1, "ToastContainer");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/MediaManager.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>MediaManager
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/upload.js [app-client] (ecmascript) <export default as Upload>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Image$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/image.js [app-client] (ecmascript) <export default as Image>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$music$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Music$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/music.js [app-client] (ecmascript) <export default as Music>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__File$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/file.js [app-client] (ecmascript) <export default as File>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.js [app-client] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$grid$2d$3x3$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Grid$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/grid-3x3.js [app-client] (ecmascript) <export default as Grid>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$list$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__List$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/list.js [app-client] (ecmascript) <export default as List>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/play.js [app-client] (ecmascript) <export default as Play>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pause$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Pause$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/pause.js [app-client] (ecmascript) <export default as Pause>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check.js [app-client] (ecmascript) <export default as Check>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check-big.js [app-client] (ecmascript) <export default as CheckCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/refresh-cw.js [app-client] (ecmascript) <export default as RefreshCw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cloudinary$2d$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/cloudinary-storage.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cloudinary$2d$media$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/cloudinary-media-service.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useZone$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useZone.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$media$2d$diagnostics$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/media-diagnostics.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
function MediaManager(param) {
    let { onSelectFile, onClose, filterType = 'all', selectionMode = false, allowedTypes = [
        'image',
        'audio',
        'video',
        'document'
    ] } = param;
    _s();
    const { currentZone } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useZone$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useZone"])();
    // Import admin theme if available, fallback to default colors
    let theme;
    try {
        const { useAdminTheme } = __turbopack_context__.r("[project]/src/components/admin/AdminThemeProvider.tsx [app-client] (ecmascript)");
        theme = useAdminTheme().theme;
    } catch (e) {
        // Fallback theme for when not in admin context
        theme = {
            primary: 'bg-purple-600',
            primaryHover: 'hover:bg-purple-700',
            primaryLight: 'bg-purple-100',
            text: 'text-purple-600',
            border: 'border-purple-200'
        };
    }
    const [files, setFiles] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [uploading, setUploading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [uploadProgress, setUploadProgress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [uploadingFile, setUploadingFile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [searchTerm, setSearchTerm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [viewMode, setViewMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('grid');
    const [selectedType, setSelectedType] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(filterType);
    const [selectedFolder, setSelectedFolder] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('all');
    const [dragOver, setDragOver] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [toasts, setToasts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [playingAudioId, setPlayingAudioId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [selectedFile, setSelectedFile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [runningDiagnostics, setRunningDiagnostics] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isLoadingMore, setIsLoadingMore] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [hasMore, setHasMore] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    // Track which type we're filtering by for pagination
    const [currentFilterType, setCurrentFilterType] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const fileInputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const dropZoneRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const audioRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Load files from database with optimized caching
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MediaManager.useEffect": ()=>{
            if (currentZone) {
                console.log('🔄 MediaManager: Loading media for zone:', currentZone.id);
                loadFilesFromDatabase();
            }
        }
    }["MediaManager.useEffect"], [
        currentZone === null || currentZone === void 0 ? void 0 : currentZone.id
    ]); // Reload when zone changes
    const loadFilesFromDatabase = async function() {
        let showLoading = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : true;
        try {
            if (showLoading) setLoading(true);
            console.log('🚀 [Cloudinary] Loading media files from Firebase...');
            const startTime = performance.now();
            // Always load all media types with pagination - filtering happens client-side
            const mediaFiles = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cloudinary$2d$media$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getAllCloudinaryMedia"])(currentZone === null || currentZone === void 0 ? void 0 : currentZone.id, 500);
            setHasMore((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cloudinary$2d$media$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasMoreCloudinaryMedia"])(currentZone === null || currentZone === void 0 ? void 0 : currentZone.id));
            setCurrentFilterType(null);
            const loadTime = performance.now() - startTime;
            console.log("⚡ [Cloudinary] Media loaded in ".concat(loadTime.toFixed(2), "ms"));
            console.log("📊 [Cloudinary] Total media files: ".concat(mediaFiles.length));
            // Show success message for slow loads
            if (loadTime > 1000 && showLoading) {
                addToast({
                    type: 'info',
                    message: "Loaded ".concat(mediaFiles.length, " files in ").concat((loadTime / 1000).toFixed(1), "s")
                });
            }
            // Convert to component format
            const convertedFiles = mediaFiles.map((dbFile)=>({
                    id: dbFile.id,
                    name: dbFile.name,
                    url: dbFile.url,
                    type: dbFile.type,
                    size: dbFile.size,
                    folder: dbFile.folder || 'uncategorized',
                    uploadedAt: dbFile.createdAt,
                    storagePath: dbFile.publicId,
                    createdAt: new Date(dbFile.createdAt),
                    updatedAt: new Date(dbFile.updatedAt)
                }));
            // Debug: Log file types breakdown
            const typeBreakdown = convertedFiles.reduce((acc, f)=>{
                acc[f.type] = (acc[f.type] || 0) + 1;
                return acc;
            }, {});
            console.log('📊 [MediaManager] Files by type:', typeBreakdown);
            setFiles(convertedFiles);
            if (showLoading && convertedFiles.length === 0) {
                addToast({
                    type: 'info',
                    message: 'No media files found. Upload some files to get started!'
                });
            }
        } catch (error) {
            console.error('❌ [Cloudinary] Error loading media files:', error);
            addToast({
                type: 'error',
                message: "Failed to load media: ".concat(error instanceof Error ? error.message : 'Unknown error')
            });
        } finally{
            setLoading(false);
        }
    };
    // Load more media files
    const handleLoadMore = async ()=>{
        if (isLoadingMore || !hasMore) return;
        setIsLoadingMore(true);
        try {
            // Always load more from all media (filtering happens client-side)
            const moreFiles = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cloudinary$2d$media$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["loadMoreCloudinaryMedia"])(currentZone === null || currentZone === void 0 ? void 0 : currentZone.id, 50);
            setHasMore((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cloudinary$2d$media$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasMoreCloudinaryMedia"])(currentZone === null || currentZone === void 0 ? void 0 : currentZone.id));
            if (moreFiles.length > 0) {
                const convertedFiles = moreFiles.map((dbFile)=>({
                        id: dbFile.id,
                        name: dbFile.name,
                        url: dbFile.url,
                        type: dbFile.type,
                        size: dbFile.size,
                        folder: dbFile.folder || 'uncategorized',
                        uploadedAt: dbFile.createdAt,
                        storagePath: dbFile.publicId,
                        createdAt: new Date(dbFile.createdAt),
                        updatedAt: new Date(dbFile.updatedAt)
                    }));
                setFiles((prev)=>[
                        ...prev,
                        ...convertedFiles
                    ]);
            }
        } catch (error) {
            console.error('❌ Error loading more media:', error);
            addToast({
                type: 'error',
                message: 'Failed to load more files'
            });
        } finally{
            setIsLoadingMore(false);
        }
    };
    const addToast = (toast)=>{
        const id = "toast-".concat(Date.now(), "-").concat(Math.random().toString(36).substr(2, 9));
        setToasts((prev)=>[
                ...prev,
                {
                    ...toast,
                    id
                }
            ]);
        // Auto-dismiss after 3 seconds
        setTimeout(()=>{
            setToasts((prev)=>prev.filter((t)=>t.id !== id));
        }, 3000);
    };
    const removeToast = (id)=>{
        setToasts((prev)=>prev.filter((toast)=>toast.id !== id));
    };
    const getFileIcon = (type)=>{
        switch(type){
            case 'image':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Image$3e$__["Image"], {
                    className: "w-6 h-6"
                }, void 0, false, {
                    fileName: "[project]/src/components/MediaManager.tsx",
                    lineNumber: 234,
                    columnNumber: 28
                }, this);
            case 'audio':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$music$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Music$3e$__["Music"], {
                    className: "w-6 h-6"
                }, void 0, false, {
                    fileName: "[project]/src/components/MediaManager.tsx",
                    lineNumber: 235,
                    columnNumber: 28
                }, this);
            case 'video':
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__File$3e$__["File"], {
                    className: "w-6 h-6"
                }, void 0, false, {
                    fileName: "[project]/src/components/MediaManager.tsx",
                    lineNumber: 236,
                    columnNumber: 28
                }, this);
            default:
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__File$3e$__["File"], {
                    className: "w-6 h-6"
                }, void 0, false, {
                    fileName: "[project]/src/components/MediaManager.tsx",
                    lineNumber: 237,
                    columnNumber: 23
                }, this);
        }
    };
    const getFileTypeColor = (type)=>{
        switch(type){
            case 'image':
                return 'text-green-600 bg-green-100';
            case 'audio':
                return "".concat(theme.text, " ").concat(theme.primaryLight);
            case 'video':
                return "".concat(theme.text, " ").concat(theme.primaryLight);
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };
    const formatFileSize = (bytes)=>{
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = [
            'Bytes',
            'KB',
            'MB',
            'GB'
        ];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    const formatDate = (date)=>{
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    const handleFileUpload = async (fileList)=>{
        if (!fileList || fileList.length === 0) {
            addToast({
                type: 'error',
                message: 'No files selected'
            });
            return;
        }
        setUploading(true);
        setUploadProgress(0);
        let successCount = 0;
        let failCount = 0;
        try {
            console.log("📤 Starting upload of ".concat(fileList.length, " file(s)..."));
            for(let i = 0; i < fileList.length; i++){
                const file = fileList[i];
                setUploadingFile(file.name);
                console.log("📤 Uploading file ".concat(i + 1, "/").concat(fileList.length, ": ").concat(file.name, " (").concat(formatFileSize(file.size), ")"));
                // Determine file type
                const fileType = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cloudinary$2d$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getFileType"])(file.type);
                try {
                    // Upload to Cloudinary with progress tracking
                    console.log("📤 [Cloudinary] Uploading to Cloudinary...");
                    const uploadResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cloudinary$2d$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["uploadToCloudinary"])(file, (progress)=>{
                        setUploadProgress(progress);
                    });
                    if (uploadResult) {
                        console.log("✅ [Cloudinary] File uploaded: ".concat(uploadResult.url));
                        // Save to zone-aware collection
                        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cloudinary$2d$media$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createCloudinaryMedia"])({
                            name: file.name,
                            url: uploadResult.url,
                            publicId: uploadResult.publicId,
                            resourceType: uploadResult.resourceType,
                            type: fileType,
                            size: file.size,
                            folder: fileType,
                            format: file.name.split('.').pop() || ''
                        }, currentZone === null || currentZone === void 0 ? void 0 : currentZone.id);
                        if (result.success) {
                            console.log("✅ [Cloudinary] File saved to Firebase with ID: ".concat(result.id));
                            successCount++;
                            addToast({
                                type: 'success',
                                message: '✅ "'.concat(file.name, '" uploaded successfully!')
                            });
                        } else {
                            console.error('❌ [Cloudinary] Failed to save "'.concat(file.name, '" to Firebase:'), result.error);
                            failCount++;
                            addToast({
                                type: 'error',
                                message: '❌ Failed to save "'.concat(file.name, '" to database')
                            });
                        }
                    } else {
                        console.error('❌ Failed to upload "'.concat(file.name, '" to storage'));
                        failCount++;
                        addToast({
                            type: 'error',
                            message: '❌ Failed to upload "'.concat(file.name, '" to storage')
                        });
                    }
                } catch (fileError) {
                    console.error('❌ Error uploading "'.concat(file.name, '":'), fileError);
                    failCount++;
                    addToast({
                        type: 'error',
                        message: '❌ Error uploading "'.concat(file.name, '": ').concat(fileError instanceof Error ? fileError.message : 'Unknown error')
                    });
                }
            }
            // Refresh local data to show new files
            if (successCount > 0) {
                await loadFilesFromDatabase(false);
            }
            // Show summary
            if (successCount > 0 && failCount === 0) {
                addToast({
                    type: 'success',
                    message: "🎉 All ".concat(successCount, " file(s) uploaded successfully!")
                });
            } else if (successCount > 0 && failCount > 0) {
                addToast({
                    type: 'warning',
                    message: "⚠️ ".concat(successCount, " succeeded, ").concat(failCount, " failed")
                });
            } else if (failCount > 0) {
                addToast({
                    type: 'error',
                    message: "❌ All ".concat(failCount, " file(s) failed to upload")
                });
            }
        } catch (error) {
            console.error('❌ Upload error:', error);
            addToast({
                type: 'error',
                message: "Upload failed: ".concat(error instanceof Error ? error.message : 'Unknown error')
            });
        } finally{
            setUploading(false);
            setUploadProgress(0);
            setUploadingFile(null);
        }
    };
    const handleFileSelect = (file)=>{
        console.log('[MediaManager] File clicked:', file.name, 'selectionMode:', selectionMode);
        if (selectionMode) {
            console.log('[MediaManager] Setting selected file:', file.name);
            setSelectedFile(file);
        }
    };
    const handleFileDoubleClick = (file)=>{
        console.log('[MediaManager] File double-clicked:', file.name);
        if (selectionMode && onSelectFile) {
            onSelectFile(file);
            if (onClose) {
                onClose();
            }
        }
    };
    const handleConfirmSelection = ()=>{
        if (selectedFile && onSelectFile && selectionMode) {
            onSelectFile(selectedFile);
            if (onClose) {
                onClose();
            }
        }
    };
    const handleFileDelete = async (file)=>{
        if (confirm('Are you sure you want to delete "'.concat(file.name, '"?'))) {
            try {
                // Delete from Firebase first
                console.log("🗑️ [Cloudinary] Deleting from Firebase: ".concat(file.id));
                const dbDeleteResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cloudinary$2d$media$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deleteCloudinaryMedia"])(file.id, currentZone === null || currentZone === void 0 ? void 0 : currentZone.id);
                if (dbDeleteResult.success) {
                    // Delete from Cloudinary using stored publicId
                    let cloudinaryDeleteSuccess = true;
                    if (file.storagePath) {
                        console.log("🗑️ [Cloudinary] Deleting file with publicId: ".concat(file.storagePath));
                        // Determine resource type
                        let resourceType = 'image';
                        if (file.type === 'audio') resourceType = 'video'; // Cloudinary uses 'video' for audio
                        else if (file.type === 'video') resourceType = 'video';
                        else if (file.type === 'document') resourceType = 'raw';
                        cloudinaryDeleteSuccess = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$cloudinary$2d$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deleteFromCloudinary"])(file.storagePath, resourceType);
                    } else {
                        console.log('⚠️ No storagePath found for file, skipping Cloudinary deletion');
                    }
                    if (cloudinaryDeleteSuccess) {
                        // Refresh local data to remove deleted file
                        await loadFilesFromDatabase();
                        addToast({
                            type: 'success',
                            message: 'File "'.concat(file.name, '" deleted successfully!')
                        });
                    } else {
                        // If Cloudinary deletion fails, we should still remove from UI since DB is updated
                        await loadFilesFromDatabase();
                        addToast({
                            type: 'warning',
                            message: 'File "'.concat(file.name, '" removed from database but may still exist in cloud storage.')
                        });
                    }
                } else {
                    addToast({
                        type: 'error',
                        message: 'Failed to delete "'.concat(file.name, '" from database')
                    });
                }
            } catch (error) {
                console.error('Delete error:', error);
                addToast({
                    type: 'error',
                    message: 'Delete failed. Please try again.'
                });
            }
        }
    };
    const copyToClipboard = (url)=>{
        navigator.clipboard.writeText(url);
        addToast({
            type: 'success',
            message: 'URL copied to clipboard!'
        });
    };
    const handleRunDiagnostics = async ()=>{
        setRunningDiagnostics(true);
        addToast({
            type: 'info',
            message: 'Running diagnostics... Check console for results'
        });
        try {
            const results = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$media$2d$diagnostics$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["runMediaDiagnostics"])();
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$media$2d$diagnostics$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["printDiagnostics"])(results);
            const failed = results.filter((r)=>r.status === 'fail').length;
            const warnings = results.filter((r)=>r.status === 'warning').length;
            if (failed > 0) {
                addToast({
                    type: 'error',
                    message: "Diagnostics complete: ".concat(failed, " test(s) failed. Check console for details.")
                });
            } else if (warnings > 0) {
                addToast({
                    type: 'warning',
                    message: "Diagnostics complete: ".concat(warnings, " warning(s). Check console for details.")
                });
            } else {
                addToast({
                    type: 'success',
                    message: 'All diagnostics passed! ✅'
                });
            }
        } catch (error) {
            console.error('Diagnostics error:', error);
            addToast({
                type: 'error',
                message: 'Failed to run diagnostics'
            });
        } finally{
            setRunningDiagnostics(false);
        }
    };
    const handleAudioPlay = async (file)=>{
        if (playingAudioId === file.id) {
            // Pause current audio
            if (audioRef.current) {
                audioRef.current.pause();
                setPlayingAudioId(null);
            }
        } else {
            // Stop any currently playing audio
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            // Play new audio
            if (audioRef.current) {
                try {
                    console.log('🎵 Attempting to play audio:', file.url);
                    // Set crossOrigin to handle CORS
                    audioRef.current.crossOrigin = 'anonymous';
                    audioRef.current.src = file.url;
                    // Load the audio first
                    audioRef.current.load();
                    // Wait for it to be ready
                    await audioRef.current.play();
                    setPlayingAudioId(file.id);
                    console.log('✅ Audio playing successfully');
                    addToast({
                        type: 'success',
                        message: "Playing: ".concat(file.name)
                    });
                } catch (error) {
                    console.error('❌ Error playing audio:', error);
                    addToast({
                        type: 'error',
                        message: "Failed to play audio: ".concat(error instanceof Error ? error.message : 'Unknown error')
                    });
                }
            }
        }
    };
    // Handle audio ended
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MediaManager.useEffect": ()=>{
            const audio = audioRef.current;
            if (audio) {
                const handleEnded = {
                    "MediaManager.useEffect.handleEnded": ()=>{
                        setPlayingAudioId(null);
                    }
                }["MediaManager.useEffect.handleEnded"];
                audio.addEventListener('ended', handleEnded);
                return ({
                    "MediaManager.useEffect": ()=>audio.removeEventListener('ended', handleEnded)
                })["MediaManager.useEffect"];
            }
        }
    }["MediaManager.useEffect"], []);
    const handleDragOver = (e)=>{
        e.preventDefault();
        setDragOver(true);
    };
    const handleDragLeave = (e)=>{
        e.preventDefault();
        setDragOver(false);
    };
    const handleDrop = (e)=>{
        e.preventDefault();
        setDragOver(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(files);
        }
    };
    const filteredFiles = files.filter((file)=>{
        const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = selectedType === 'all' || file.type === selectedType;
        const matchesFolder = selectedFolder === 'all' || file.folder === selectedFolder;
        const matchesAllowedTypes = allowedTypes.includes(file.type);
        // In selection mode with specific allowedTypes, prioritize allowedTypes filter
        // and ignore the selectedType dropdown filter
        if (selectionMode && allowedTypes.length < 4) {
            return matchesSearch && matchesFolder && matchesAllowedTypes;
        }
        return matchesSearch && matchesType && matchesFolder && matchesAllowedTypes;
    });
    const folders = [
        'all',
        ...Array.from(new Set(files.map((f)=>f.folder).filter(Boolean)))
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "h-full w-full flex flex-col bg-white relative overflow-hidden",
        children: [
            loading && files.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 bg-white z-50 flex flex-col",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-shrink-0 p-6 border-b border-gray-200",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between mb-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex-1",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/MediaManager.tsx",
                                            lineNumber: 622,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/MediaManager.tsx",
                                        lineNumber: 621,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "h-10 w-24 bg-gray-200 rounded-lg animate-pulse"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/MediaManager.tsx",
                                            lineNumber: 625,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/MediaManager.tsx",
                                        lineNumber: 624,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/MediaManager.tsx",
                                lineNumber: 620,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex-1 h-10 bg-gray-200 rounded-lg animate-pulse"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/MediaManager.tsx",
                                        lineNumber: 629,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "h-10 w-32 bg-gray-200 rounded-lg animate-pulse"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/MediaManager.tsx",
                                        lineNumber: 630,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "h-10 w-32 bg-gray-200 rounded-lg animate-pulse"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/MediaManager.tsx",
                                        lineNumber: 631,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/MediaManager.tsx",
                                lineNumber: 628,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/MediaManager.tsx",
                        lineNumber: 619,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-shrink-0 p-6 border-b border-gray-200",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-4",
                            children: [
                                1,
                                2,
                                3,
                                4,
                                5
                            ].map((i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "h-8 w-20 bg-gray-200 rounded-full animate-pulse"
                                }, i, false, {
                                    fileName: "[project]/src/components/MediaManager.tsx",
                                    lineNumber: 639,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/components/MediaManager.tsx",
                            lineNumber: 637,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/MediaManager.tsx",
                        lineNumber: 636,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 overflow-auto p-6",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4",
                            children: [
                                1,
                                2,
                                3,
                                4,
                                5,
                                6,
                                7,
                                8,
                                9,
                                10
                            ].map((i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "bg-white border border-gray-200 rounded-lg overflow-hidden",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "aspect-square bg-gray-200 animate-pulse"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/MediaManager.tsx",
                                            lineNumber: 649,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "p-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "h-4 bg-gray-200 rounded animate-pulse mb-2"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/MediaManager.tsx",
                                                    lineNumber: 651,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "h-3 w-20 bg-gray-200 rounded animate-pulse"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/MediaManager.tsx",
                                                    lineNumber: 652,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/MediaManager.tsx",
                                            lineNumber: 650,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, i, true, {
                                    fileName: "[project]/src/components/MediaManager.tsx",
                                    lineNumber: 648,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/components/MediaManager.tsx",
                            lineNumber: 646,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/MediaManager.tsx",
                        lineNumber: 645,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/MediaManager.tsx",
                lineNumber: 617,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-shrink-0 px-3 py-2 sm:p-4 border-b border-gray-200 bg-white sticky top-0 z-20",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-base sm:text-xl font-bold text-gray-900 truncate",
                                children: selectionMode ? 'Select Audio' : 'Media Library'
                            }, void 0, false, {
                                fileName: "[project]/src/components/MediaManager.tsx",
                                lineNumber: 664,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-1.5 flex-shrink-0",
                                children: [
                                    !selectionMode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>loadFilesFromDatabase(true),
                                        disabled: loading,
                                        className: "p-2 ".concat(theme.primary, " text-white rounded-lg ").concat(theme.primaryHover, " transition-colors disabled:opacity-50"),
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                            className: "w-4 h-4 ".concat(loading ? 'animate-spin' : '')
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/MediaManager.tsx",
                                            lineNumber: 674,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/MediaManager.tsx",
                                        lineNumber: 669,
                                        columnNumber: 15
                                    }, this),
                                    onClose && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: onClose,
                                        className: "p-2 hover:bg-gray-100 rounded-lg transition-colors",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                            className: "w-5 h-5"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/MediaManager.tsx",
                                            lineNumber: 682,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/MediaManager.tsx",
                                        lineNumber: 678,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/MediaManager.tsx",
                                lineNumber: 667,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/MediaManager.tsx",
                        lineNumber: 663,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-2 relative",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"
                            }, void 0, false, {
                                fileName: "[project]/src/components/MediaManager.tsx",
                                lineNumber: 690,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "text",
                                placeholder: "Search files...",
                                value: searchTerm,
                                onChange: (e)=>setSearchTerm(e.target.value),
                                className: "w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            }, void 0, false, {
                                fileName: "[project]/src/components/MediaManager.tsx",
                                lineNumber: 691,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/MediaManager.tsx",
                        lineNumber: 689,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-2 flex gap-1.5 overflow-x-auto pb-1 -mx-3 px-3 scrollbar-hide",
                        children: [
                            'all',
                            'audio',
                            'image',
                            'video'
                        ].map((type)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setSelectedType(type),
                                className: "px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ".concat(selectedType === type ? "".concat(theme.primary, " text-white") : 'bg-gray-100 text-gray-600 hover:bg-gray-200'),
                                children: type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)
                            }, type, false, {
                                fileName: "[project]/src/components/MediaManager.tsx",
                                lineNumber: 703,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/components/MediaManager.tsx",
                        lineNumber: 701,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/MediaManager.tsx",
                lineNumber: 662,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-shrink-0 px-3 py-2 sm:p-4 border-b border-gray-200 bg-gray-50",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    ref: dropZoneRef,
                    onDragOver: handleDragOver,
                    onDragLeave: handleDragLeave,
                    onDrop: handleDrop,
                    className: "border-2 border-dashed rounded-lg p-3 sm:p-4 text-center transition-colors ".concat(dragOver ? "".concat(theme.border, " ").concat(theme.primaryLight) : 'border-gray-300'),
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>{
                                var _fileInputRef_current;
                                return (_fileInputRef_current = fileInputRef.current) === null || _fileInputRef_current === void 0 ? void 0 : _fileInputRef_current.click();
                            },
                            className: "flex items-center justify-center gap-2 w-full py-2 ".concat(theme.text, " font-medium"),
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$upload$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Upload$3e$__["Upload"], {
                                    className: "w-5 h-5"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/MediaManager.tsx",
                                    lineNumber: 735,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: "Upload Files"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/MediaManager.tsx",
                                    lineNumber: 736,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/MediaManager.tsx",
                            lineNumber: 731,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            ref: fileInputRef,
                            type: "file",
                            multiple: true,
                            accept: allowedTypes.map((type)=>{
                                switch(type){
                                    case 'image':
                                        return 'image/*';
                                    case 'audio':
                                        return 'audio/*';
                                    case 'video':
                                        return 'video/*';
                                    case 'document':
                                        return '.pdf,.doc,.docx,.txt';
                                    default:
                                        return '';
                                }
                            }).join(','),
                            onChange: (e)=>e.target.files && handleFileUpload(e.target.files),
                            className: "hidden"
                        }, void 0, false, {
                            fileName: "[project]/src/components/MediaManager.tsx",
                            lineNumber: 739,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/MediaManager.tsx",
                    lineNumber: 720,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/MediaManager.tsx",
                lineNumber: 719,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-shrink-0 px-3 py-1.5 border-b border-gray-100 flex items-center justify-between bg-white",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-gray-500",
                        children: [
                            filteredFiles.length,
                            " file",
                            filteredFiles.length !== 1 ? 's' : ''
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/MediaManager.tsx",
                        lineNumber: 760,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setViewMode('grid'),
                                className: "p-1.5 rounded transition-colors ".concat(viewMode === 'grid' ? "".concat(theme.primaryLight, " ").concat(theme.text) : 'text-gray-400'),
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$grid$2d$3x3$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Grid$3e$__["Grid"], {
                                    className: "w-4 h-4"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/MediaManager.tsx",
                                    lineNumber: 770,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/MediaManager.tsx",
                                lineNumber: 764,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setViewMode('list'),
                                className: "p-1.5 rounded transition-colors ".concat(viewMode === 'list' ? "".concat(theme.primaryLight, " ").concat(theme.text) : 'text-gray-400'),
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$list$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__List$3e$__["List"], {
                                    className: "w-4 h-4"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/MediaManager.tsx",
                                    lineNumber: 778,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/MediaManager.tsx",
                                lineNumber: 772,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/MediaManager.tsx",
                        lineNumber: 763,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/MediaManager.tsx",
                lineNumber: 759,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-2 sm:p-4 pb-20",
                children: [
                    uploading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-2 p-2 bg-blue-50 border border-blue-200 rounded-lg",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between mb-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-blue-700 text-xs font-medium truncate flex-1 mr-2",
                                        children: uploadingFile
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/MediaManager.tsx",
                                        lineNumber: 788,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-blue-600 text-xs font-medium",
                                        children: [
                                            Math.round(uploadProgress),
                                            "%"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/MediaManager.tsx",
                                        lineNumber: 791,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/MediaManager.tsx",
                                lineNumber: 787,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-full bg-blue-200 rounded-full h-1.5",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "bg-blue-600 h-1.5 rounded-full transition-all",
                                    style: {
                                        width: "".concat(uploadProgress, "%")
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/src/components/MediaManager.tsx",
                                    lineNumber: 796,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/MediaManager.tsx",
                                lineNumber: 795,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/MediaManager.tsx",
                        lineNumber: 786,
                        columnNumber: 11
                    }, this),
                    filteredFiles.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-center py-12",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$file$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__File$3e$__["File"], {
                                className: "w-10 h-10 mx-auto mb-3 text-gray-300"
                            }, void 0, false, {
                                fileName: "[project]/src/components/MediaManager.tsx",
                                lineNumber: 806,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-gray-500",
                                children: "No files found"
                            }, void 0, false, {
                                fileName: "[project]/src/components/MediaManager.tsx",
                                lineNumber: 807,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/MediaManager.tsx",
                        lineNumber: 805,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: viewMode === 'grid' ? 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3' : 'space-y-1.5',
                        children: [
                            filteredFiles.map((file)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "group relative bg-white border rounded-lg overflow-hidden transition-all ".concat(selectionMode ? 'cursor-pointer active:scale-95' : '', " ").concat((selectedFile === null || selectedFile === void 0 ? void 0 : selectedFile.id) === file.id ? "border-purple-500 ring-2 ring-purple-200" : 'border-gray-200'),
                                    onClick: ()=>handleFileSelect(file),
                                    onDoubleClick: ()=>handleFileDoubleClick(file),
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "aspect-square bg-gray-50 flex items-center justify-center relative",
                                            children: [
                                                file.type === 'image' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                    src: file.url,
                                                    alt: file.name,
                                                    className: "w-full h-full object-cover"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/MediaManager.tsx",
                                                    lineNumber: 830,
                                                    columnNumber: 21
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "p-3 rounded-full ".concat(getFileTypeColor(file.type)),
                                                    children: getFileIcon(file.type)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/MediaManager.tsx",
                                                    lineNumber: 836,
                                                    columnNumber: 21
                                                }, this),
                                                file.type === 'audio' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: (e)=>{
                                                        e.stopPropagation();
                                                        handleAudioPlay(file);
                                                    },
                                                    className: "absolute top-1 left-1 p-1.5 bg-black/50 rounded-full",
                                                    children: playingAudioId === file.id ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pause$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Pause$3e$__["Pause"], {
                                                        className: "w-3 h-3 text-white"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/MediaManager.tsx",
                                                        lineNumber: 851,
                                                        columnNumber: 25
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__["Play"], {
                                                        className: "w-4 h-4 text-white ml-0.5"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/MediaManager.tsx",
                                                        lineNumber: 853,
                                                        columnNumber: 25
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/MediaManager.tsx",
                                                    lineNumber: 843,
                                                    columnNumber: 21
                                                }, this),
                                                selectionMode && (selectedFile === null || selectedFile === void 0 ? void 0 : selectedFile.id) === file.id && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "absolute top-1 right-1 bg-purple-500 text-white rounded-full p-0.5",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                                        className: "w-3 h-3"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/MediaManager.tsx",
                                                        lineNumber: 861,
                                                        columnNumber: 23
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/MediaManager.tsx",
                                                    lineNumber: 860,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/MediaManager.tsx",
                                            lineNumber: 828,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "p-1.5 sm:p-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    className: "font-medium text-[10px] sm:text-xs text-gray-900 truncate",
                                                    title: file.name,
                                                    children: file.name
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/MediaManager.tsx",
                                                    lineNumber: 868,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-[9px] sm:text-xs text-gray-400",
                                                    children: formatFileSize(file.size)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/MediaManager.tsx",
                                                    lineNumber: 871,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/MediaManager.tsx",
                                            lineNumber: 867,
                                            columnNumber: 17
                                        }, this),
                                        !selectionMode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: (e)=>{
                                                    e.stopPropagation();
                                                    handleFileDelete(file);
                                                },
                                                className: "p-1 bg-white rounded-full shadow-sm hover:bg-red-50",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                                    className: "w-3 h-3 text-red-600"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/MediaManager.tsx",
                                                    lineNumber: 886,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/MediaManager.tsx",
                                                lineNumber: 879,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/MediaManager.tsx",
                                            lineNumber: 878,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, file.id, true, {
                                    fileName: "[project]/src/components/MediaManager.tsx",
                                    lineNumber: 815,
                                    columnNumber: 15
                                }, this)),
                            hasMore && !searchTerm && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: viewMode === 'grid' ? 'col-span-full' : '',
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleLoadMore,
                                    disabled: isLoadingMore,
                                    className: "w-full py-2 mt-2 text-purple-600 text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2",
                                    children: isLoadingMore ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                                className: "w-4 h-4 animate-spin"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/MediaManager.tsx",
                                                lineNumber: 903,
                                                columnNumber: 23
                                            }, this),
                                            "Loading..."
                                        ]
                                    }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                                className: "w-4 h-4"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/MediaManager.tsx",
                                                lineNumber: 908,
                                                columnNumber: 23
                                            }, this),
                                            "Load More"
                                        ]
                                    }, void 0, true)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/MediaManager.tsx",
                                    lineNumber: 896,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/MediaManager.tsx",
                                lineNumber: 895,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/MediaManager.tsx",
                        lineNumber: 810,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/MediaManager.tsx",
                lineNumber: 784,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed top-4 left-1/2 -translate-x-1/2 space-y-2 z-[100] w-[90%] max-w-sm",
                children: toasts.map((toast)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 px-3 py-2.5 rounded-xl shadow-lg animate-in slide-in-from-top-2 duration-300 ".concat(toast.type === 'success' ? 'bg-green-500 text-white' : toast.type === 'error' ? 'bg-red-500 text-white' : toast.type === 'warning' ? 'bg-amber-500 text-white' : 'bg-slate-800 text-white'),
                        children: [
                            toast.type === 'success' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2d$big$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle$3e$__["CheckCircle"], {
                                className: "w-4 h-4 shrink-0"
                            }, void 0, false, {
                                fileName: "[project]/src/components/MediaManager.tsx",
                                lineNumber: 934,
                                columnNumber: 42
                            }, this),
                            toast.type === 'error' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                className: "w-4 h-4 shrink-0"
                            }, void 0, false, {
                                fileName: "[project]/src/components/MediaManager.tsx",
                                lineNumber: 935,
                                columnNumber: 40
                            }, this),
                            toast.type === 'warning' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                className: "w-4 h-4 shrink-0"
                            }, void 0, false, {
                                fileName: "[project]/src/components/MediaManager.tsx",
                                lineNumber: 936,
                                columnNumber: 42
                            }, this),
                            toast.type === 'info' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$music$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Music$3e$__["Music"], {
                                className: "w-4 h-4 shrink-0"
                            }, void 0, false, {
                                fileName: "[project]/src/components/MediaManager.tsx",
                                lineNumber: 937,
                                columnNumber: 39
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm flex-1 line-clamp-2",
                                children: toast.message
                            }, void 0, false, {
                                fileName: "[project]/src/components/MediaManager.tsx",
                                lineNumber: 938,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>removeToast(toast.id),
                                className: "p-1 hover:bg-white/20 rounded-full shrink-0",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                    className: "w-3.5 h-3.5"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/MediaManager.tsx",
                                    lineNumber: 943,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/MediaManager.tsx",
                                lineNumber: 939,
                                columnNumber: 13
                            }, this)
                        ]
                    }, toast.id, true, {
                        fileName: "[project]/src/components/MediaManager.tsx",
                        lineNumber: 922,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/components/MediaManager.tsx",
                lineNumber: 920,
                columnNumber: 7
            }, this),
            selectionMode && selectedFile && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg px-3 py-2 z-[60]",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between gap-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-2 min-w-0 flex-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "p-1.5 rounded-lg shrink-0 ".concat(getFileTypeColor(selectedFile.type)),
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$music$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Music$3e$__["Music"], {
                                        className: "w-4 h-4"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/MediaManager.tsx",
                                        lineNumber: 955,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/MediaManager.tsx",
                                    lineNumber: 954,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm font-medium text-gray-900 truncate",
                                    children: selectedFile.name
                                }, void 0, false, {
                                    fileName: "[project]/src/components/MediaManager.tsx",
                                    lineNumber: 957,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/MediaManager.tsx",
                            lineNumber: 953,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleConfirmSelection,
                            className: "px-4 py-2 bg-purple-600 text-white rounded-lg font-medium text-sm shrink-0",
                            children: "Select"
                        }, void 0, false, {
                            fileName: "[project]/src/components/MediaManager.tsx",
                            lineNumber: 959,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/MediaManager.tsx",
                    lineNumber: 952,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/MediaManager.tsx",
                lineNumber: 951,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("audio", {
                ref: audioRef,
                preload: "metadata",
                crossOrigin: "anonymous",
                onError: (e)=>{
                    console.error('❌ Audio element error:', e);
                    setPlayingAudioId(null);
                    addToast({
                        type: 'error',
                        message: 'Audio playback error. The file may be corrupted or inaccessible.'
                    });
                },
                onLoadedData: ()=>{
                    console.log('✅ Audio loaded successfully');
                }
            }, void 0, false, {
                fileName: "[project]/src/components/MediaManager.tsx",
                lineNumber: 970,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/MediaManager.tsx",
        lineNumber: 614,
        columnNumber: 5
    }, this);
}
_s(MediaManager, "cxFK9Zs4TSr53ociVus70jYl7DY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useZone$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useZone"]
    ];
});
_c = MediaManager;
var _c;
__turbopack_context__.k.register(_c, "MediaManager");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/MediaSelectionModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>MediaSelectionModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$MediaManager$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/MediaManager.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$admin$2f$AdminThemeProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/admin/AdminThemeProvider.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function MediaSelectionModal(param) {
    let { isOpen, onClose, onFileSelect, allowedTypes = [
        'audio'
    ], title = "Select Media File" } = param;
    _s();
    const { theme } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$admin$2f$AdminThemeProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAdminTheme"])();
    if (!isOpen) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 bg-white z-[400] overflow-y-auto w-screen h-screen",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-white w-full min-h-screen",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between p-4 border-b border-slate-200 sticky top-0 bg-white z-10",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-xl font-semibold text-slate-900",
                            children: title
                        }, void 0, false, {
                            fileName: "[project]/src/components/MediaSelectionModal.tsx",
                            lineNumber: 40,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            className: "p-2 hover:bg-slate-100 rounded-lg transition-colors",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                className: "w-6 h-6 text-slate-500"
                            }, void 0, false, {
                                fileName: "[project]/src/components/MediaSelectionModal.tsx",
                                lineNumber: 45,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/MediaSelectionModal.tsx",
                            lineNumber: 41,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/MediaSelectionModal.tsx",
                    lineNumber: 39,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-4",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$MediaManager$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        onSelectFile: (file)=>{
                            onFileSelect(file);
                        },
                        onClose: ()=>{
                            onClose();
                        },
                        selectionMode: true,
                        allowedTypes: allowedTypes,
                        filterType: allowedTypes.length === 1 ? allowedTypes[0] : 'all'
                    }, void 0, false, {
                        fileName: "[project]/src/components/MediaSelectionModal.tsx",
                        lineNumber: 49,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/MediaSelectionModal.tsx",
                    lineNumber: 48,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/MediaSelectionModal.tsx",
            lineNumber: 38,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/MediaSelectionModal.tsx",
        lineNumber: 37,
        columnNumber: 5
    }, this);
}
_s(MediaSelectionModal, "CSGVJ8In1vEtywWZCEflITsoTio=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$admin$2f$AdminThemeProvider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAdminTheme"]
    ];
});
_c = MediaSelectionModal;
var _c;
__turbopack_context__.k.register(_c, "MediaSelectionModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/BasicTextEditor.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>BasicTextEditor
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/styled-jsx/style.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$languages$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Languages$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/languages.js [app-client] (ecmascript) <export default as Languages>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$translation$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/translation-service.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function BasicTextEditor(param) {
    let { value, onChange, placeholder = "Type your content here...", className = "", id } = param;
    var _translationService_LANGUAGES_find;
    _s();
    const editorRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [isMounted, setIsMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isInitialized, setIsInitialized] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Translation state
    const [selectedLanguage, setSelectedLanguage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('en');
    const [isTranslating, setIsTranslating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showLanguageMenu, setShowLanguageMenu] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [originalContent, setOriginalContent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "BasicTextEditor.useEffect": ()=>{
            setIsMounted(true);
        }
    }["BasicTextEditor.useEffect"], []);
    // Only set initial value, don't update on every value change (prevents typing issues)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "BasicTextEditor.useEffect": ()=>{
            if (editorRef.current && !isInitialized && value) {
                editorRef.current.innerHTML = value;
                setIsInitialized(true);
            }
        }
    }["BasicTextEditor.useEffect"], [
        value,
        isInitialized
    ]);
    const handleInput = ()=>{
        if (editorRef.current) {
            const content = editorRef.current.innerHTML;
            onChange(content);
        }
    };
    // Handle translation
    const handleTranslate = async (langCode)=>{
        if (!editorRef.current) return;
        const currentContent = editorRef.current.innerHTML;
        if (!currentContent || currentContent.trim() === '') {
            alert('Please enter some text before translating.');
            return;
        }
        setSelectedLanguage(langCode);
        setShowLanguageMenu(false);
        // If switching back to English, restore original content
        if (langCode === 'en') {
            if (originalContent) {
                editorRef.current.innerHTML = originalContent;
                onChange(originalContent);
                setOriginalContent('');
            }
            return;
        }
        // Save original content before translating
        if (!originalContent) {
            setOriginalContent(currentContent);
        }
        setIsTranslating(true);
        try {
            console.log('Starting translation to', langCode);
            console.log('Content to translate:', currentContent.substring(0, 200));
            const translated = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$translation$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["translationService"].translateLyrics(currentContent, langCode);
            console.log('Translation result:', translated.substring(0, 200));
            if (editorRef.current && translated && translated !== currentContent) {
                var _translationService_LANGUAGES_find;
                editorRef.current.innerHTML = translated;
                onChange(translated);
                // Show success message
                const langName = ((_translationService_LANGUAGES_find = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$translation$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["translationService"].LANGUAGES.find((l)=>l.code === langCode)) === null || _translationService_LANGUAGES_find === void 0 ? void 0 : _translationService_LANGUAGES_find.name) || langCode;
                console.log("Translation to ".concat(langName, " completed successfully!"));
            } else if (translated === currentContent) {
                console.warn('Translation returned the same content - translation may have failed');
                alert('Translation service returned the same content. This might indicate a translation error or the text is already in the target language.');
            }
        } catch (error) {
            console.error('Translation failed:', error);
            alert('Translation failed. Please check your internet connection and try again. If the problem persists, the translation service might be temporarily unavailable.');
            // Reset language selection on error
            setSelectedLanguage('en');
        } finally{
            setIsTranslating(false);
        }
    };
    const handlePaste = (e)=>{
        e.preventDefault();
        const clipboardData = e.clipboardData || window.clipboardData;
        // Try to get HTML content first (preserves formatting)
        let htmlContent = clipboardData.getData('text/html');
        const plainText = clipboardData.getData('text/plain');
        if (htmlContent && editorRef.current) {
            // Get current selection
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                // Delete selected content
                range.deleteContents();
                // Create a temporary div to parse and clean the HTML
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = htmlContent;
                // Clean up the HTML (remove unwanted attributes but keep formatting)
                const cleanHtml = cleanPastedHtml(tempDiv.innerHTML);
                // Insert the formatted content
                const fragment = range.createContextualFragment(cleanHtml);
                range.insertNode(fragment);
                // Move cursor to end of inserted content
                range.setStartAfter(fragment);
                range.setEndAfter(fragment);
                selection.removeAllRanges();
                selection.addRange(range);
                // Trigger input event to update state
                setTimeout(handleInput, 10);
            }
        } else if (plainText && editorRef.current) {
            // Fallback to plain text if no HTML available
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                // Delete selected content
                range.deleteContents();
                // Insert plain text with line breaks preserved
                const textWithBreaks = plainText.replace(/\n/g, '<br>');
                const fragment = range.createContextualFragment(textWithBreaks);
                range.insertNode(fragment);
                // Move cursor to end of inserted text
                range.setStartAfter(fragment);
                range.setEndAfter(fragment);
                selection.removeAllRanges();
                selection.addRange(range);
                // Trigger input event to update state
                setTimeout(handleInput, 10);
            }
        }
    };
    // Helper function to clean pasted HTML while preserving formatting
    const cleanPastedHtml = (html)=>{
        // Create a temporary div to parse the HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        // Remove unwanted attributes but keep formatting tags
        const allowedTags = [
            'p',
            'br',
            'strong',
            'b',
            'em',
            'i',
            'u',
            'span',
            'div',
            'h1',
            'h2',
            'h3',
            'h4',
            'h5',
            'h6'
        ];
        const allowedAttributes = [
            'style'
        ];
        const cleanNode = (node)=>{
            if (node.nodeType === Node.TEXT_NODE) {
                return node.cloneNode(true);
            }
            if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node;
                const tagName = element.tagName.toLowerCase();
                if (allowedTags.includes(tagName)) {
                    const newElement = document.createElement(tagName);
                    // Copy allowed attributes
                    allowedAttributes.forEach((attr)=>{
                        if (element.hasAttribute(attr)) {
                            newElement.setAttribute(attr, element.getAttribute(attr) || '');
                        }
                    });
                    // Copy style attribute but clean it
                    if (element.hasAttribute('style')) {
                        const style = element.getAttribute('style') || '';
                        // Keep only safe CSS properties
                        const safeStyle = style.split(';').filter((prop)=>{
                            const [property] = prop.split(':');
                            return [
                                'font-weight',
                                'font-style',
                                'text-decoration',
                                'color',
                                'background-color'
                            ].includes(property.trim());
                        }).join(';');
                        if (safeStyle) {
                            newElement.setAttribute('style', safeStyle);
                        }
                    }
                    // Process child nodes
                    Array.from(element.childNodes).forEach((child)=>{
                        const cleanedChild = cleanNode(child);
                        if (cleanedChild) {
                            newElement.appendChild(cleanedChild);
                        }
                    });
                    return newElement;
                } else {
                    // For disallowed tags, just return the text content
                    return document.createTextNode(element.textContent || '');
                }
            }
            return null;
        };
        const cleanedNode = cleanNode(tempDiv);
        return cleanedNode && 'innerHTML' in cleanedNode ? cleanedNode.innerHTML : html;
    };
    const formatText = (command, value)=>{
        if (editorRef.current) {
            editorRef.current.focus();
            document.execCommand(command, false, value);
            setTimeout(handleInput, 10);
        }
    };
    if (!isMounted) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "border border-gray-300 rounded-lg ".concat(className),
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 text-gray-400",
                children: "Loading editor..."
            }, void 0, false, {
                fileName: "[project]/src/components/BasicTextEditor.tsx",
                lineNumber: 252,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/BasicTextEditor.tsx",
            lineNumber: 251,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "jsx-b542bb621f8c0b99" + " " + "border border-gray-300 rounded-lg ".concat(className),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-b542bb621f8c0b99" + " " + "flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>formatText('bold'),
                        title: "Bold",
                        className: "jsx-b542bb621f8c0b99" + " " + "px-3 py-1 rounded hover:bg-gray-100 text-gray-600 font-bold text-sm",
                        children: "B"
                    }, void 0, false, {
                        fileName: "[project]/src/components/BasicTextEditor.tsx",
                        lineNumber: 261,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>formatText('italic'),
                        title: "Italic",
                        className: "jsx-b542bb621f8c0b99" + " " + "px-3 py-1 rounded hover:bg-gray-100 text-gray-600 italic text-sm",
                        children: "I"
                    }, void 0, false, {
                        fileName: "[project]/src/components/BasicTextEditor.tsx",
                        lineNumber: 269,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-b542bb621f8c0b99" + " " + "flex-1"
                    }, void 0, false, {
                        fileName: "[project]/src/components/BasicTextEditor.tsx",
                        lineNumber: 277,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-b542bb621f8c0b99" + " " + "relative",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>setShowLanguageMenu(!showLanguageMenu),
                                disabled: isTranslating,
                                title: isTranslating ? 'Translating...' : 'Translate text',
                                className: "jsx-b542bb621f8c0b99" + " " + "flex items-center gap-2 px-3 py-1 rounded transition-colors text-sm font-medium ".concat(isTranslating ? 'bg-yellow-500 text-white cursor-wait' : selectedLanguage === 'en' ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-green-600 text-white hover:bg-green-700'),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$languages$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Languages$3e$__["Languages"], {
                                        className: "w-4 h-4"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/BasicTextEditor.tsx",
                                        lineNumber: 294,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "jsx-b542bb621f8c0b99" + " " + "text-xs",
                                        children: isTranslating ? 'Translating...' : ((_translationService_LANGUAGES_find = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$translation$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["translationService"].LANGUAGES.find((l)=>l.code === selectedLanguage)) === null || _translationService_LANGUAGES_find === void 0 ? void 0 : _translationService_LANGUAGES_find.flag) || '🌐'
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/BasicTextEditor.tsx",
                                        lineNumber: 295,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/BasicTextEditor.tsx",
                                lineNumber: 281,
                                columnNumber: 11
                            }, this),
                            showLanguageMenu && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-b542bb621f8c0b99" + " " + "absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 w-48 max-h-80 overflow-y-auto z-20",
                                children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$translation$2d$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["translationService"].LANGUAGES.map((lang)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>handleTranslate(lang.code),
                                        className: "jsx-b542bb621f8c0b99" + " " + "w-full px-4 py-2 text-left text-sm hover:bg-purple-50 transition-colors flex items-center gap-2 ".concat(selectedLanguage === lang.code ? 'bg-purple-100 text-purple-700 font-medium' : 'text-gray-700'),
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-b542bb621f8c0b99" + " " + "text-lg",
                                                children: lang.flag
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/BasicTextEditor.tsx",
                                                lineNumber: 312,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "jsx-b542bb621f8c0b99",
                                                children: lang.name
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/BasicTextEditor.tsx",
                                                lineNumber: 313,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, lang.code, true, {
                                        fileName: "[project]/src/components/BasicTextEditor.tsx",
                                        lineNumber: 304,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/components/BasicTextEditor.tsx",
                                lineNumber: 302,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/BasicTextEditor.tsx",
                        lineNumber: 280,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/BasicTextEditor.tsx",
                lineNumber: 260,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                ref: editorRef,
                id: id,
                contentEditable: true,
                onInput: handleInput,
                onPaste: handlePaste,
                style: {
                    fontFamily: 'inherit',
                    lineHeight: '1.6'
                },
                "data-placeholder": placeholder,
                suppressContentEditableWarning: true,
                className: "jsx-b542bb621f8c0b99" + " " + "min-h-[200px] max-h-[400px] overflow-y-auto p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            }, void 0, false, {
                fileName: "[project]/src/components/BasicTextEditor.tsx",
                lineNumber: 322,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                id: "b542bb621f8c0b99",
                children: "[contenteditable].jsx-b542bb621f8c0b99:empty:before{content:attr(data-placeholder);color:#9ca3af;pointer-events:none}[contenteditable].jsx-b542bb621f8c0b99 h1.jsx-b542bb621f8c0b99{margin:1rem 0 .5rem;font-size:2rem;font-weight:700}[contenteditable].jsx-b542bb621f8c0b99 h2.jsx-b542bb621f8c0b99{margin:.8rem 0 .4rem;font-size:1.5rem;font-weight:700}[contenteditable].jsx-b542bb621f8c0b99 h3.jsx-b542bb621f8c0b99{margin:.6rem 0 .3rem;font-size:1.25rem;font-weight:700}[contenteditable].jsx-b542bb621f8c0b99 p.jsx-b542bb621f8c0b99{margin:.5rem 0}[contenteditable].jsx-b542bb621f8c0b99 strong.jsx-b542bb621f8c0b99,[contenteditable].jsx-b542bb621f8c0b99 b.jsx-b542bb621f8c0b99{font-weight:700}[contenteditable].jsx-b542bb621f8c0b99 em.jsx-b542bb621f8c0b99,[contenteditable].jsx-b542bb621f8c0b99 i.jsx-b542bb621f8c0b99{font-style:italic}"
            }, void 0, false, void 0, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/BasicTextEditor.tsx",
        lineNumber: 258,
        columnNumber: 5
    }, this);
}
_s(BasicTextEditor, "h/WJP0cO4kaB0VigYnu2DC6W/58=");
_c = BasicTextEditor;
var _c;
__turbopack_context__.k.register(_c, "BasicTextEditor");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_components_ec7184e1._.js.map