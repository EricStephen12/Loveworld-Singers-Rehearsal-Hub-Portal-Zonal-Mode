module.exports = [
"[project]/src/components/EditSongModal.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>EditSongModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/styled-jsx/style.js [app-ssr] (ecmascript)");
// Smart Auto-History System - Fixed icon imports
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$save$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Save$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/save.js [app-ssr] (ecmascript) <export default as Save>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-ssr] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2d$open$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FolderOpen$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/folder-open.js [app-ssr] (ecmascript) <export default as FolderOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$history$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__History$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/history.js [app-ssr] (ecmascript) <export default as History>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$pen$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Edit$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/square-pen.js [app-ssr] (ecmascript) <export default as Edit>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$MediaSelectionModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/MediaSelectionModal.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$BasicTextEditor$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/BasicTextEditor.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useZone$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useZone.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/config/zones.ts [app-ssr] (ecmascript)");
// import { createHistoryEntry, deleteHistoryEntry } from '@/lib/firebase-database-service';
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase-database.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$admin$2f$AdminThemeProvider$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/admin/AdminThemeProvider.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
;
;
;
;
;
;
;
function EditSongModal({ isOpen, onClose, song, categories, praiseNightCategories, onUpdate }) {
    const { theme } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$admin$2f$AdminThemeProvider$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAdminTheme"])();
    const { currentZone } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useZone$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useZone"])();
    // Helper function to get current user info
    const getCurrentUserName = ()=>{
        // Implement based on your auth system - could be from context, localStorage, etc.
        return localStorage.getItem('userName') || 'Current User';
    };
    // Theme-based CSS classes
    const inputClasses = `w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-4 transition-all duration-200 ${theme.focusRing} ${theme.focusBorder} focus:shadow-xl ${theme.focusBg}`;
    const buttonClasses = `flex items-center gap-2 px-4 py-3 ${theme.primary} text-white ${theme.primaryHover} rounded-lg transition-colors text-sm font-medium`;
    const historyButtonClasses = `flex items-center gap-1 px-3 py-1.5 text-xs font-medium ${theme.text} ${theme.primaryLight} ${theme.bgHover} border ${theme.border} rounded-md transition-colors`;
    // Form state
    const [songTitle, setSongTitle] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [songCategory, setSongCategory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [songCategories, setSongCategories] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [songPraiseNight, setSongPraiseNight] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [songStatus, setSongStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('unheard');
    const [songLeadSinger, setSongLeadSinger] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [songWriter, setSongWriter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [songConductor, setSongConductor] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [songKey, setSongKey] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [songTempo, setSongTempo] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [songLeadKeyboardist, setSongLeadKeyboardist] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [songLeadGuitarist, setSongLeadGuitarist] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [songDrummer, setSongDrummer] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [songSolfas, setSongSolfas] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [songHistory, setSongHistory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [songAudioFile, setSongAudioFile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [audioFile, setAudioFile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [songLyrics, setSongLyrics] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [songComments, setSongComments] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [newComment, setNewComment] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [coordinatorComment, setCoordinatorComment] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    // History management state
    const [rehearsalCount, setRehearsalCount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [showMediaManager, setShowMediaManager] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // Get zone context to determine comment terminology (currentZone already declared above)
    // Helper function to get correct comment terminology based on zone
    const getCommentLabel = ()=>{
        // HQ groups see "Pastor Comment", regular zones see "Coordinator Comment"
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isHQGroup"])(currentZone?.id) ? "Pastor" : "Coordinator";
    };
    // Smart change detection - track original values
    const [originalValues, setOriginalValues] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        lyrics: '',
        solfas: '',
        audioFile: '',
        title: '',
        category: '',
        leadSinger: '',
        writer: '',
        conductor: '',
        leadKeyboardist: '',
        leadGuitarist: '',
        drummer: '',
        key: '',
        tempo: ''
    });
    // Manual history creation state
    const [showHistoryForm, setShowHistoryForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [historyType, setHistoryType] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('song-details');
    const [historyTitle, setHistoryTitle] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [historyDescription, setHistoryDescription] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [historyEntries, setHistoryEntries] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [showHistoryList, setShowHistoryList] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [originalHistoryValues, setOriginalHistoryValues] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        old_value: '',
        new_value: ''
    });
    const [isFirebaseConfigured, setIsFirebaseConfigured] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    // Manual history creation functions
    const handleCreateHistory = (type)=>{
        // Check if Firebase is configured
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        // Reset the currentHistoryEntryId to ensure we're creating, not updating
        window.currentHistoryEntryId = null;
        setHistoryType(type);
        // Set default title and description based on section
        const sectionNames = {
            'song-details': 'Song Details',
            'personnel': 'Personnel',
            'music-details': 'Music Details',
            'lyrics': 'Lyrics',
            'solfas': "Conductor's Guide",
            'audio': 'Audio',
            'comments': 'Comments'
        };
        setHistoryTitle(`${sectionNames[type]} Version ${new Date().toLocaleDateString()}`);
        setHistoryDescription(`Updated ${sectionNames[type].toLowerCase()} on ${new Date().toLocaleString()}`);
        setShowHistoryForm(true);
    };
    const handleSaveHistory = async ()=>{
        if (!song?.id) return;
        try {
            // Get current content based on section type
            let currentContent = '';
            let oldValue = '';
            switch(historyType){
                case 'song-details':
                    currentContent = JSON.stringify({
                        title: songTitle,
                        category: songCategory,
                        key: songKey,
                        tempo: songTempo
                    });
                    oldValue = JSON.stringify({
                        title: originalValues.title,
                        category: originalValues.category,
                        key: originalValues.key,
                        tempo: originalValues.tempo
                    });
                    break;
                case 'personnel':
                    currentContent = JSON.stringify({
                        leadSinger: songLeadSinger,
                        writer: songWriter,
                        conductor: songConductor,
                        leadKeyboardist: songLeadKeyboardist,
                        leadGuitarist: songLeadGuitarist,
                        drummer: songDrummer
                    });
                    oldValue = JSON.stringify({
                        leadSinger: originalValues.leadSinger,
                        writer: originalValues.writer,
                        conductor: originalValues.conductor,
                        leadKeyboardist: originalValues.leadKeyboardist,
                        leadGuitarist: originalValues.leadGuitarist,
                        drummer: originalValues.drummer
                    });
                    break;
                case 'music-details':
                    currentContent = JSON.stringify({
                        key: songKey,
                        tempo: songTempo
                    });
                    oldValue = JSON.stringify({
                        key: originalValues.key,
                        tempo: originalValues.tempo
                    });
                    break;
                case 'lyrics':
                    currentContent = songLyrics;
                    oldValue = originalValues.lyrics;
                    break;
                case 'solfas':
                    currentContent = songSolfas;
                    oldValue = originalValues.solfas;
                    break;
                case 'audio':
                    currentContent = audioFile ? audioFile.url : songAudioFile;
                    oldValue = originalValues.audioFile;
                    break;
                case 'comments':
                    // Save the current comment rich-text content (Pastor or Coordinator)
                    currentContent = coordinatorComment;
                    // Previous value: latest comment from existing song comments
                    const commentAuthor = getCommentLabel();
                    try {
                        const latestComment = (Array.isArray(song?.comments) ? song.comments : []).filter((c)=>c.author === commentAuthor || c.author === 'Coordinator' || c.author === 'Pastor').sort((a, b)=>new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                        oldValue = latestComment?.text || latestComment?.content || '';
                    } catch  {
                        oldValue = '';
                    }
                    break;
            }
            // Check if we're updating an existing history entry
            const currentHistoryEntryId = window.currentHistoryEntryId;
            if (currentHistoryEntryId) {
                // Update existing history entry in Firebase
                // Use the edited historical value from the form if in edit mode
                const updateOldValue = originalHistoryValues.old_value;
                // Keep the original new_value since we're only editing the historical (old) value
                const existingEntries = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].getHistoryBySongId(song.id.toString());
                const existingEntry = existingEntries.find((entry)=>entry.id === currentHistoryEntryId);
                const updateNewValue = existingEntry?.new_value || originalHistoryValues.new_value;
                console.log('📝 Updating history entry:', {
                    id: currentHistoryEntryId,
                    song_id: song.id.toString(),
                    title: historyTitle,
                    description: historyDescription,
                    type: historyType,
                    old_value: updateOldValue,
                    new_value: updateNewValue,
                    created_by: 'admin'
                });
                const success = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].updateHistoryEntry(currentHistoryEntryId, {
                    song_id: song.id.toString(),
                    title: historyTitle,
                    description: historyDescription,
                    type: historyType,
                    old_value: updateOldValue,
                    new_value: updateNewValue,
                    created_by: 'admin',
                    created_at: new Date().toISOString()
                });
                console.log('📝 History update result:', success);
                // Clear the stored entry ID
                window.currentHistoryEntryId = null;
                if (success) {
                    // Load updated history entries
                    loadHistoryEntries();
                    // Dispatch event to notify other components of history update
                    window.dispatchEvent(new Event('historyUpdated'));
                    // Close the form
                    setShowHistoryForm(false);
                    // Show success message
                    window.dispatchEvent(new CustomEvent('showToast', {
                        detail: {
                            message: 'History entry updated successfully!',
                            type: 'success'
                        }
                    }));
                    // Log activity with toast event that ActivityLogger will catch
                    window.dispatchEvent(new CustomEvent('showToast', {
                        detail: {
                            message: `${getCurrentUserName()} updated history for "${song.title}"`,
                            type: 'info',
                            zoneName: currentZone?.name,
                            userName: getCurrentUserName(),
                            action: 'updated',
                            section: 'history',
                            itemName: song.title
                        }
                    }));
                } else {
                    window.dispatchEvent(new CustomEvent('showToast', {
                        detail: {
                            message: 'Error updating history entry. Please check your Firebase configuration in .env.local file. See ENVIRONMENT_SETUP.md for details.',
                            type: 'error'
                        }
                    }));
                }
                // Clear the stored entry ID regardless of success/failure
                window.currentHistoryEntryId = null;
            } else {
                // Create new history entry in Firebase
                console.log('📝 Creating history entry:', {
                    song_id: song.id.toString(),
                    title: historyTitle,
                    description: historyDescription,
                    type: historyType,
                    old_value: oldValue,
                    new_value: currentContent,
                    created_by: 'admin'
                });
                const success = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].createHistoryEntry({
                    song_id: song.id.toString(),
                    title: historyTitle,
                    description: historyDescription,
                    type: historyType,
                    old_value: oldValue,
                    new_value: currentContent,
                    created_by: 'admin',
                    created_at: new Date().toISOString()
                });
                console.log('📝 History creation result:', success);
                if (success) {
                    // Reset form but keep it open for multiple entries
                    const sectionNames = {
                        'song-details': 'Song Details',
                        'personnel': 'Personnel',
                        'music-details': 'Music Details',
                        'lyrics': 'Lyrics',
                        'solfas': "Conductor's Guide",
                        'audio': 'Audio',
                        'comments': 'Comments'
                    };
                    setHistoryTitle(`${sectionNames[historyType]} Version ${new Date().toLocaleDateString()}`);
                    setHistoryDescription(`Updated ${sectionNames[historyType].toLowerCase()} on ${new Date().toLocaleString()}`);
                    // Load updated history entries
                    loadHistoryEntries();
                    // Dispatch event to notify other components of history update
                    window.dispatchEvent(new Event('historyUpdated'));
                    // Check if we were updating an existing entry
                    if (window.currentHistoryEntryId) {
                        // Clear the stored entry ID after successful update
                        window.currentHistoryEntryId = null;
                        // Close the form after successful update
                        setShowHistoryForm(false);
                        window.dispatchEvent(new CustomEvent('showToast', {
                            detail: {
                                message: 'History entry updated successfully!',
                                type: 'success'
                            }
                        }));
                    } else {
                        // Show success message for new entries
                        window.dispatchEvent(new CustomEvent('showToast', {
                            detail: {
                                message: 'History entry created successfully! You can create another one or close the form.',
                                type: 'success'
                            }
                        }));
                    }
                } else {
                    window.dispatchEvent(new CustomEvent('showToast', {
                        detail: {
                            message: 'Error creating history entry. Please check your Firebase configuration in .env.local file. See ENVIRONMENT_SETUP.md for details.',
                            type: 'error'
                        }
                    }));
                }
            }
        } catch (error) {
            console.error('Error handling history entry:', error);
            window.dispatchEvent(new CustomEvent('showToast', {
                detail: {
                    message: 'Error handling history entry. Please try again.',
                    type: 'error'
                }
            }));
        }
    };
    // Load history entries for the current song
    const loadHistoryEntries = async ()=>{
        if (!song?.id) return;
        try {
            // Check if Firebase is configured
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            console.log('🔍 Loading history for song:', {
                songId: song.id,
                songIdType: typeof song.id,
                songIdString: song.id.toString()
            });
            const data = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].getHistoryBySongId(song.id.toString());
            console.log('📝 History data received:', data);
            setHistoryEntries(data || []);
        } catch (error) {
            console.error('Error loading history entries:', error);
            setHistoryEntries([]);
        }
    };
    // Delete history entry
    const handleDeleteHistory = async (historyId)=>{
        if (!confirm('Are you sure you want to delete this history entry?')) return;
        try {
            // Delete history entry from Firebase
            const success = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].deleteHistoryEntry(historyId);
            if (success) {
                // Remove from local state
                setHistoryEntries((prev)=>prev.filter((entry)=>entry.id !== historyId));
                window.dispatchEvent(new CustomEvent('showToast', {
                    detail: {
                        message: 'History entry deleted successfully!',
                        type: 'success'
                    }
                }));
            } else {
                window.dispatchEvent(new CustomEvent('showToast', {
                    detail: {
                        message: 'Error deleting history entry. Please try again.',
                        type: 'error'
                    }
                }));
            }
        } catch (error) {
            console.error('Error deleting history entry:', error);
            window.dispatchEvent(new CustomEvent('showToast', {
                detail: {
                    message: 'Error deleting history entry. Please try again.',
                    type: 'error'
                }
            }));
        }
    };
    // Handle media file selection from MediaManager
    const handleMediaFileSelect = (mediaFile)=>{
        console.log('✅ SELECTED AUDIO FILE:', {
            name: mediaFile.name,
            url: mediaFile.url,
            id: mediaFile.id,
            type: mediaFile.type
        });
        // Supabase Storage URLs work directly - no CORS issues!
        let fixedUrl = mediaFile.url;
        console.log('✅ USING SUPABASE STORAGE URL:', fixedUrl);
        setSongAudioFile(fixedUrl);
        setAudioFile({
            ...mediaFile,
            url: fixedUrl
        }); // Store with fixed URL
        setShowMediaManager(false);
    };
    // Helper function to convert HTML to plain text
    const htmlToPlainText = (html)=>{
        if (!html) return '';
        // Create a temporary div to parse HTML and extract text
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        return tempDiv.textContent || tempDiv.innerText || '';
    };
    // Helper function to convert plain text to HTML (preserve line breaks)
    const plainTextToHtml = (text)=>{
        if (!text) return '';
        return text.replace(/\n/g, '<br>');
    };
    // Helper function to handle paste events and preserve formatting
    const handlePaste = (e, currentValue, setValue)=>{
        e.preventDefault();
        const clipboardData = e.clipboardData || window.clipboardData;
        // Try to get HTML content first (preserves formatting)
        let htmlContent = clipboardData.getData('text/html');
        const plainText = clipboardData.getData('text/plain') || clipboardData.getData('text');
        if (htmlContent) {
            // Clean the HTML while preserving formatting
            const cleanHtml = cleanPastedHtml(htmlContent);
            setValue(cleanHtml);
        } else if (plainText) {
            // Fallback to plain text with line breaks preserved
            const textWithBreaks = plainText.replace(/\n/g, '<br>');
            setValue(textWithBreaks);
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
    // Initialize form when song changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (song) {
            console.log('🎵 MODAL DEBUG - useEffect triggered with song:');
            console.log('🎵 song object:', song);
            console.log('🎵 song ID fields:', {
                id: song.id,
                firebaseId: song.firebaseId,
                allFields: Object.keys(song)
            });
            // Editing existing song - populate form with song data
            setSongTitle(song.title || '');
            setSongCategory(song.category || '');
            // Initialize categories from existing song data
            if (song.categories && Array.isArray(song.categories)) {
                setSongCategories(song.categories);
            } else if (song.category) {
                // Fallback: convert single category to array for backward compatibility
                setSongCategories([
                    song.category
                ]);
            } else {
                setSongCategories([]);
            }
            // Find the praise night name from the praiseNightId
            const praiseNight = praiseNightCategories.find((pn)=>pn.id === song.praiseNightId);
            setSongPraiseNight(praiseNight?.name || '');
            setSongStatus(song.status);
            setSongLeadSinger(song.leadSinger || '');
            setSongWriter(song.writer || '');
            setSongConductor(song.conductor || '');
            setSongKey(song.key || '');
            setSongTempo(song.tempo || '');
            setSongLeadKeyboardist(song.leadKeyboardist || '');
            setSongLeadGuitarist(song.leadGuitarist || '');
            setSongDrummer(song.drummer || '');
            setSongHistory('');
            setSongAudioFile(song.audioFile || '');
            setAudioFile(null); // Reset file object when editing existing song
            // Use HTML directly for BasicTextEditor
            setSongLyrics(song.lyrics || '');
            setSongSolfas(song.solfas || '');
            setSongComments(Array.isArray(song.comments) ? song.comments : []);
            setNewComment('');
            // Initialize comment editor from latest comment (Pastor or Coordinator)
            try {
                const commentAuthor = getCommentLabel();
                const latestComment = (Array.isArray(song.comments) ? song.comments : []).filter((c)=>c.author === commentAuthor || c.author === 'Coordinator' || c.author === 'Pastor').sort((a, b)=>new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                setCoordinatorComment(latestComment?.text || latestComment?.content || '');
            } catch  {}
            // Load rehearsal count from song data, default to 0 if not set
            setRehearsalCount(song.rehearsalCount ?? 0);
            // Store original values for change detection
            setOriginalValues({
                lyrics: song.lyrics || '',
                solfas: song.solfas || '',
                audioFile: song.audioFile || '',
                title: song.title || '',
                category: song.category || '',
                leadSinger: song.leadSinger || '',
                writer: song.writer || '',
                conductor: song.conductor || '',
                leadKeyboardist: song.leadKeyboardist || '',
                leadGuitarist: song.leadGuitarist || '',
                drummer: song.drummer || '',
                key: song.key || '',
                tempo: song.tempo || ''
            });
        } else {
            // Adding new song - reset all form fields to empty/default values
            setSongTitle('');
            setSongCategory('');
            setSongCategories([]);
            // Set default praise night to the first available one
            setSongPraiseNight(praiseNightCategories.length > 0 ? praiseNightCategories[0].name : '');
            setSongStatus('unheard');
            setSongLeadSinger('');
            setSongWriter('');
            setSongConductor('');
            setSongKey('');
            setSongTempo('');
            setSongLeadKeyboardist('');
            setSongLeadGuitarist('');
            setSongDrummer('');
            setSongSolfas('');
            setSongHistory('');
            setSongAudioFile('');
            setAudioFile(null);
            setSongLyrics('');
            setSongComments([]);
            setNewComment('');
            setCoordinatorComment('');
            setRehearsalCount(0);
            // Reset original values for new song
            setOriginalValues({
                lyrics: '',
                solfas: '',
                audioFile: '',
                title: '',
                category: '',
                leadSinger: '',
                writer: '',
                conductor: '',
                leadKeyboardist: '',
                leadGuitarist: '',
                drummer: '',
                key: '',
                tempo: ''
            });
            // Clear history when no song
            setHistoryEntries([]);
        }
        // Load history entries when song is available
        if (song?.id) {
            loadHistoryEntries();
        }
    }, [
        song
    ]);
    // Update original values when changes are made
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // Update original values when changes are saved
        setOriginalValues({
            lyrics: songLyrics,
            solfas: songSolfas,
            audioFile: songAudioFile,
            title: songTitle,
            category: songCategory,
            leadSinger: songLeadSinger,
            writer: songWriter,
            conductor: songConductor,
            leadKeyboardist: songLeadKeyboardist,
            leadGuitarist: songLeadGuitarist,
            drummer: songDrummer,
            key: songKey,
            tempo: songTempo
        });
    }, [
        songTitle,
        songCategory,
        songKey,
        songTempo,
        songLyrics,
        songSolfas,
        songAudioFile,
        songLeadSinger,
        songWriter,
        songConductor,
        songLeadKeyboardist,
        songLeadGuitarist,
        songDrummer
    ]);
    const handleUpdate = async ()=>{
        if (songTitle.trim()) {
            // Find the selected Praise Night ID
            const selectedPraiseNight = praiseNightCategories.find((pn)=>pn.name === songPraiseNight);
            console.log('🔍 DEBUG - Praise Night Selection:', {
                songPraiseNight,
                praiseNightCategories: praiseNightCategories.map((pn)=>({
                        id: pn.id,
                        name: pn.name
                    })),
                selectedPraiseNight: selectedPraiseNight ? {
                    id: selectedPraiseNight.id,
                    name: selectedPraiseNight.name
                } : null
            });
            if (!selectedPraiseNight) {
                window.dispatchEvent(new CustomEvent('showToast', {
                    detail: {
                        message: 'Please select a valid Praise Night',
                        type: 'warning'
                    }
                }));
                return;
            }
            console.log('💾 SAVING SONG:', {
                songTitle: songTitle,
                praiseNightId: selectedPraiseNight.id,
                hasSelectedAudio: !!audioFile,
                audioURL: audioFile ? audioFile.url : songAudioFile,
                willSaveAudio: !!(audioFile ? audioFile.url : songAudioFile)
            });
            const finalAudioFile = audioFile ? audioFile.url : songAudioFile;
            const finalComments = coordinatorComment && coordinatorComment.trim() !== '' ? [
                {
                    id: `comment-${Date.now()}`,
                    text: coordinatorComment,
                    date: new Date().toISOString(),
                    author: getCommentLabel() // Dynamic: "Pastor" for HQ groups, "Coordinator" for zones
                }
            ] : [];
            const songData = {
                title: songTitle.trim(),
                status: songStatus,
                category: songCategory,
                categories: songCategories,
                praiseNightId: selectedPraiseNight?.id,
                lyrics: songLyrics,
                leadSinger: songLeadSinger,
                writer: songWriter,
                conductor: songConductor,
                key: songKey,
                tempo: songTempo,
                leadKeyboardist: songLeadKeyboardist,
                leadGuitarist: songLeadGuitarist,
                drummer: songDrummer,
                solfas: songSolfas,
                rehearsalCount: rehearsalCount,
                comments: finalComments,
                audioFile: finalAudioFile,
                // Only include mediaId if it exists (Firebase doesn't allow undefined values)
                ...audioFile && {
                    mediaId: parseInt(audioFile.id)
                },
                // Preserve existing history array
                history: song?.history || []
            };
            console.log('🎵 Final songData being saved:', {
                title: songData.title,
                writer: songData.writer,
                leadSinger: songData.leadSinger,
                conductor: songData.conductor,
                key: songData.key,
                tempo: songData.tempo,
                audioFile: songData.audioFile,
                mediaId: songData.mediaId,
                mediaIdType: typeof songData.mediaId,
                audioFileLength: songData.audioFile?.length,
                originalAudioFileId: audioFile?.id,
                originalAudioFileIdType: typeof audioFile?.id
            });
            // If editing existing song, preserve other properties including history
            let updatedSong = song ? {
                ...song,
                ...songData
            } : songData;
            console.log('🎵 Final updatedSong with history:', {
                title: updatedSong.title,
                hasHistory: !!updatedSong.history,
                historyCount: updatedSong.history?.length || 0,
                historyTypes: updatedSong.history?.map((h)=>h.type) || []
            });
            // Pass the song ID if editing an existing song
            console.log('🎵 MODAL DEBUG - Save button clicked');
            console.log('🎵 song object:', song);
            console.log('🎵 song.id:', song?.id);
            console.log('🎵 song.firebaseId:', song?.firebaseId);
            console.log('🎵 song exists?', !!song);
            console.log('🎵 song.id exists?', !!song?.id);
            // Create history entry before saving
            if (song && song.id) {
                console.log('🎵 EditSongModal - Editing existing song:', {
                    songId: song.id,
                    songFirebaseId: song.firebaseId,
                    songTitle: song.title
                });
                // Compare current values with original values to detect changes
                const hasChanges = songTitle !== originalValues.title || songCategory !== originalValues.category || songKey !== originalValues.key || songTempo !== originalValues.tempo || songLyrics !== originalValues.lyrics || songSolfas !== originalValues.solfas || finalAudioFile !== originalValues.audioFile || songLeadSinger !== originalValues.leadSinger || songWriter !== originalValues.writer || songConductor !== originalValues.conductor || songLeadKeyboardist !== originalValues.leadKeyboardist || songLeadGuitarist !== originalValues.leadGuitarist || songDrummer !== originalValues.drummer;
                if (hasChanges) {
                    // Create history entry for the changes
                    const historyEntry = {
                        song_id: song.id.toString(),
                        title: `Update - ${new Date().toLocaleDateString()}`,
                        description: 'Automatic history entry for changes made',
                        type: 'all-fields',
                        old_value: JSON.stringify({
                            title: originalValues.title,
                            category: originalValues.category,
                            key: originalValues.key,
                            tempo: originalValues.tempo,
                            lyrics: originalValues.lyrics,
                            solfas: originalValues.solfas,
                            audioFile: originalValues.audioFile,
                            leadSinger: originalValues.leadSinger,
                            writer: originalValues.writer,
                            conductor: originalValues.conductor,
                            leadKeyboardist: originalValues.leadKeyboardist,
                            leadGuitarist: originalValues.leadGuitarist,
                            drummer: originalValues.drummer
                        }),
                        new_value: JSON.stringify({
                            title: songTitle,
                            category: songCategory,
                            key: songKey,
                            tempo: songTempo,
                            lyrics: songLyrics,
                            solfas: songSolfas,
                            audioFile: finalAudioFile,
                            leadSinger: songLeadSinger,
                            writer: songWriter,
                            conductor: songConductor,
                            leadKeyboardist: songLeadKeyboardist,
                            leadGuitarist: songLeadGuitarist,
                            drummer: songDrummer
                        }),
                        created_by: 'user',
                        created_at: new Date().toISOString()
                    };
                    try {
                        // Save history entry to Firebase
                        const historySuccess = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].createHistoryEntry(historyEntry);
                        console.log('🎵 History entry saved:', historySuccess);
                        // Reload history entries to show the new one
                        if (historySuccess) {
                            loadHistoryEntries();
                        }
                    } catch (error) {
                        console.error('Error saving history entry:', error);
                    }
                }
                // Use firebaseId for Firebase operations, keep numeric id for UI compatibility
                const updateData = {
                    ...updatedSong,
                    id: song.id,
                    firebaseId: song.firebaseId // Use firebaseId for Firebase operations
                };
                console.log('🎵 EditSongModal - Song data:', {
                    songId: song.id,
                    songFirebaseId: song.firebaseId,
                    songTitle: song.title
                });
                console.log('🎵 EditSongModal - Sending update data:', updateData);
                onUpdate(updateData);
            } else {
                console.log('🚨 EditSongModal - Creating new song (this should NOT happen when editing!)');
                console.log('🚨 WHY IS THIS CREATING? song:', song);
                console.log('🚨 song.id:', song?.id);
                console.log('🚨 song.firebaseId:', song?.firebaseId);
                onUpdate(updatedSong);
            }
            // Log activity for song update
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            onClose();
        }
    };
    const handleAddComment = ()=>{
        if (newComment.trim()) {
            const comment = {
                id: `comment-${Date.now()}`,
                text: newComment.trim(),
                date: new Date().toISOString(),
                author: 'Coordinator'
            };
            setSongComments([
                ...Array.isArray(songComments) ? songComments : [],
                comment
            ]);
            setNewComment('');
        }
    };
    const handleDeleteComment = (commentId)=>{
        setSongComments((Array.isArray(songComments) ? songComments : []).filter((comment)=>comment.id !== commentId));
    };
    if (!isOpen) {
        console.log('🎵 EditSongModal: isOpen is false, not rendering');
        return null;
    }
    // Don't render form until song data is properly loaded (for editing mode)
    // Only check this for existing songs (has id), not for new songs
    if (song && song.id && !song.title) {
        console.log('🎵 EditSongModal: Existing song without title, not rendering');
        return null;
    }
    console.log('🎵 EditSongModal: Rendering modal with song:', song);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                id: "d3eaaa0de8606e6c",
                children: ".hide-toolbar.jsx-d3eaaa0de8606e6c{display:none!important}"
            }, void 0, false, void 0, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-d3eaaa0de8606e6c" + " " + "fixed inset-0 bg-white z-50 flex flex-col w-screen h-screen",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "jsx-d3eaaa0de8606e6c" + " " + "bg-white w-full h-full overflow-hidden flex flex-col",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-d3eaaa0de8606e6c" + " " + "flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 flex-shrink-0",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "jsx-d3eaaa0de8606e6c" + " " + "text-lg sm:text-xl lg:text-2xl font-outfit-semibold text-slate-900 truncate",
                                    children: song ? `Edit Song: ${song.title}` : 'Add New Song'
                                }, void 0, false, {
                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                    lineNumber: 990,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: onClose,
                                    className: "jsx-d3eaaa0de8606e6c" + " " + "text-slate-400 hover:text-slate-600 transition-colors p-2 -mr-2",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                        className: "w-6 h-6 sm:w-8 sm:h-8"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/EditSongModal.tsx",
                                        lineNumber: 997,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                    lineNumber: 993,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/EditSongModal.tsx",
                            lineNumber: 989,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-d3eaaa0de8606e6c" + " " + "flex-1 overflow-y-auto",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-d3eaaa0de8606e6c" + " " + "w-full p-3 sm:p-4 lg:p-6",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-d3eaaa0de8606e6c" + " " + "grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 lg:gap-8",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-d3eaaa0de8606e6c" + " " + "lg:col-span-2 space-y-4 sm:space-y-6",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-d3eaaa0de8606e6c" + " " + "bg-slate-50 rounded-lg p-4 sm:p-6",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-d3eaaa0de8606e6c" + " " + "flex items-center justify-between mb-3 sm:mb-4",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                    className: "jsx-d3eaaa0de8606e6c" + " " + "text-base sm:text-lg font-semibold text-slate-900",
                                                                    children: "Song Details"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                                    lineNumber: 1014,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    onClick: ()=>handleCreateHistory('song-details'),
                                                                    className: "jsx-d3eaaa0de8606e6c" + " " + "flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md transition-colors",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$history$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__History$3e$__["History"], {
                                                                            className: "w-3 h-3"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                                                            lineNumber: 1019,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        "Add History"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                                    lineNumber: 1015,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                                            lineNumber: 1013,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-d3eaaa0de8606e6c" + " " + "space-y-3 sm:space-y-4",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-d3eaaa0de8606e6c",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                            className: "jsx-d3eaaa0de8606e6c" + " " + "block text-sm font-medium text-slate-700 mb-2",
                                                                            children: "Song Title *"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                                                            lineNumber: 1025,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                            type: "text",
                                                                            value: songTitle,
                                                                            onChange: (e)=>setSongTitle(e.target.value),
                                                                            onPaste: (e)=>handlePaste(e, songTitle, setSongTitle),
                                                                            dir: "ltr",
                                                                            style: {
                                                                                textAlign: 'left',
                                                                                direction: 'ltr'
                                                                            },
                                                                            placeholder: "Enter song title",
                                                                            className: "jsx-d3eaaa0de8606e6c" + " " + `${inputClasses} text-lg font-medium`
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                                                            lineNumber: 1028,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                                    lineNumber: 1024,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-d3eaaa0de8606e6c" + " " + "grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "jsx-d3eaaa0de8606e6c",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                    className: "jsx-d3eaaa0de8606e6c" + " " + "block text-sm font-medium text-slate-700 mb-2",
                                                                                    children: "Categories * (Select one or more)"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                                                    lineNumber: 1042,
                                                                                    columnNumber: 27
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    className: "jsx-d3eaaa0de8606e6c" + " " + "border-2 border-slate-300 rounded-lg p-3 bg-slate-50 max-h-48 overflow-y-auto",
                                                                                    children: categories.map((category)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                            className: "jsx-d3eaaa0de8606e6c" + " " + "flex items-center space-x-3 py-2 hover:bg-slate-100 rounded px-2 cursor-pointer",
                                                                                            children: [
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                                    type: "checkbox",
                                                                                                    checked: songCategories.includes(category.name),
                                                                                                    onChange: (e)=>{
                                                                                                        if (e.target.checked) {
                                                                                                            const newCategories = [
                                                                                                                ...songCategories,
                                                                                                                category.name
                                                                                                            ];
                                                                                                            setSongCategories(newCategories);
                                                                                                            // Also update single category for backward compatibility (use first selected)
                                                                                                            setSongCategory(newCategories[0] || '');
                                                                                                        } else {
                                                                                                            const newCategories = songCategories.filter((cat)=>cat !== category.name);
                                                                                                            setSongCategories(newCategories);
                                                                                                            setSongCategory(newCategories[0] || '');
                                                                                                        }
                                                                                                    },
                                                                                                    className: "jsx-d3eaaa0de8606e6c" + " " + "w-4 h-4 text-purple-600 border-slate-300 rounded focus:ring-purple-500 focus:ring-2"
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                                                                    lineNumber: 1048,
                                                                                                    columnNumber: 33
                                                                                                }, this),
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                    className: "jsx-d3eaaa0de8606e6c" + " " + "text-sm text-slate-700",
                                                                                                    children: category.name
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                                                                    lineNumber: 1065,
                                                                                                    columnNumber: 33
                                                                                                }, this)
                                                                                            ]
                                                                                        }, category.id, true, {
                                                                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                                                                            lineNumber: 1047,
                                                                                            columnNumber: 31
                                                                                        }, this))
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                                                    lineNumber: 1045,
                                                                                    columnNumber: 27
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    className: "jsx-d3eaaa0de8606e6c" + " " + "mt-2 text-xs text-slate-500",
                                                                                    children: [
                                                                                        "Selected: ",
                                                                                        songCategories.length > 0 ? songCategories.join(', ') : 'None'
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                                                    lineNumber: 1069,
                                                                                    columnNumber: 27
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                                                            lineNumber: 1041,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "jsx-d3eaaa0de8606e6c",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                                    className: "jsx-d3eaaa0de8606e6c" + " " + "block text-sm font-medium text-slate-700 mb-2",
                                                                                    children: "Status"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                                                    lineNumber: 1075,
                                                                                    columnNumber: 27
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                                                    value: songStatus,
                                                                                    onChange: (e)=>setSongStatus(e.target.value),
                                                                                    className: "jsx-d3eaaa0de8606e6c" + " " + (inputClasses || ""),
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                            value: "heard",
                                                                                            className: "jsx-d3eaaa0de8606e6c",
                                                                                            children: "Heard"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                                                                            lineNumber: 1083,
                                                                                            columnNumber: 29
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                            value: "unheard",
                                                                                            className: "jsx-d3eaaa0de8606e6c",
                                                                                            children: "Unheard"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                                                                            lineNumber: 1084,
                                                                                            columnNumber: 29
                                                                                        }, this)
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                                                    lineNumber: 1078,
                                                                                    columnNumber: 27
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                                                            lineNumber: 1074,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                                    lineNumber: 1040,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-d3eaaa0de8606e6c",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                            className: "jsx-d3eaaa0de8606e6c" + " " + "block text-sm font-medium text-slate-700 mb-2",
                                                                            children: "Praise Night"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                                                            lineNumber: 1090,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                                            value: songPraiseNight,
                                                                            onChange: (e)=>setSongPraiseNight(e.target.value),
                                                                            className: "jsx-d3eaaa0de8606e6c" + " " + "w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 focus:shadow-xl focus:bg-purple-50 transition-all duration-200",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                    value: "",
                                                                                    className: "jsx-d3eaaa0de8606e6c",
                                                                                    children: "Select Praise Night"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                                                    lineNumber: 1098,
                                                                                    columnNumber: 27
                                                                                }, this),
                                                                                praiseNightCategories.map((praiseNight)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                                        value: praiseNight.name,
                                                                                        className: "jsx-d3eaaa0de8606e6c",
                                                                                        children: praiseNight.name
                                                                                    }, praiseNight.id, false, {
                                                                                        fileName: "[project]/src/components/EditSongModal.tsx",
                                                                                        lineNumber: 1100,
                                                                                        columnNumber: 29
                                                                                    }, this))
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                                                            lineNumber: 1093,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                                    lineNumber: 1089,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                                            lineNumber: 1023,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                    lineNumber: 1012,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-d3eaaa0de8606e6c" + " " + "bg-slate-50 rounded-lg p-4 sm:p-6",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-d3eaaa0de8606e6c" + " " + "flex items-center justify-between mb-3 sm:mb-4",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                    className: "jsx-d3eaaa0de8606e6c" + " " + "text-base sm:text-lg font-semibold text-slate-900",
                                                                    children: "Music Details"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                                    lineNumber: 1110,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    onClick: ()=>handleCreateHistory('music-details'),
                                                                    className: "jsx-d3eaaa0de8606e6c" + " " + "flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md transition-colors",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$history$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__History$3e$__["History"], {
                                                                            className: "w-3 h-3"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                                                            lineNumber: 1115,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        "Add History"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                                    lineNumber: 1111,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                                            lineNumber: 1109,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-d3eaaa0de8606e6c" + " " + "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-d3eaaa0de8606e6c",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                            className: "jsx-d3eaaa0de8606e6c" + " " + "block text-sm font-medium text-slate-700 mb-2",
                                                                            children: "Key"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                                                            lineNumber: 1121,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                            type: "text",
                                                                            value: songKey,
                                                                            onChange: (e)=>setSongKey(e.target.value),
                                                                            onPaste: (e)=>handlePaste(e, songKey, setSongKey),
                                                                            placeholder: "e.g., C, G, F#",
                                                                            className: "jsx-d3eaaa0de8606e6c" + " " + "w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 focus:shadow-xl focus:bg-purple-50 transition-all duration-200"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                                                            lineNumber: 1124,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                                    lineNumber: 1120,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-d3eaaa0de8606e6c",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                            className: "jsx-d3eaaa0de8606e6c" + " " + "block text-sm font-medium text-slate-700 mb-2",
                                                                            children: "Tempo"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                                                            lineNumber: 1135,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                            type: "text",
                                                                            value: songTempo,
                                                                            onChange: (e)=>setSongTempo(e.target.value),
                                                                            onPaste: (e)=>handlePaste(e, songTempo, setSongTempo),
                                                                            placeholder: "e.g., 120 BPM",
                                                                            className: "jsx-d3eaaa0de8606e6c" + " " + "w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 focus:shadow-xl focus:bg-purple-50 transition-all duration-200"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                                                            lineNumber: 1138,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                                    lineNumber: 1134,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-d3eaaa0de8606e6c",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                            className: "jsx-d3eaaa0de8606e6c" + " " + "block text-sm font-medium text-slate-700 mb-2",
                                                                            children: "Rehearsal Count (Manual)"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                                                            lineNumber: 1149,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                            type: "number",
                                                                            min: "0",
                                                                            value: rehearsalCount,
                                                                            onChange: (e)=>setRehearsalCount(parseInt(e.target.value) || 0),
                                                                            placeholder: "Enter rehearsal count manually",
                                                                            className: "jsx-d3eaaa0de8606e6c" + " " + "w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 focus:shadow-xl focus:bg-purple-50 transition-all duration-200"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                                                            lineNumber: 1152,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                                    lineNumber: 1148,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                                            lineNumber: 1119,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-d3eaaa0de8606e6c" + " " + "mt-6",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-d3eaaa0de8606e6c" + " " + "flex items-center justify-between mb-2",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                            className: "jsx-d3eaaa0de8606e6c" + " " + "block text-sm font-medium text-slate-700",
                                                                            children: "Audio File"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                                                            lineNumber: 1166,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                            onClick: ()=>handleCreateHistory('audio'),
                                                                            className: "jsx-d3eaaa0de8606e6c" + " " + (historyButtonClasses || ""),
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$history$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__History$3e$__["History"], {
                                                                                    className: "w-3 h-3"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                                                    lineNumber: 1173,
                                                                                    columnNumber: 27
                                                                                }, this),
                                                                                "Add History"
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                                                            lineNumber: 1169,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                                    lineNumber: 1165,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    type: "button",
                                                                    onClick: ()=>setShowMediaManager(true),
                                                                    className: "jsx-d3eaaa0de8606e6c" + " " + (buttonClasses || ""),
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$folder$2d$open$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__FolderOpen$3e$__["FolderOpen"], {
                                                                            className: "w-4 h-4"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                                                            lineNumber: 1182,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        "Browse Media Library"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                                    lineNumber: 1177,
                                                                    columnNumber: 23
                                                                }, this),
                                                                audioFile && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-d3eaaa0de8606e6c" + " " + "mt-3 p-4 bg-slate-50 rounded-lg border border-slate-200",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "jsx-d3eaaa0de8606e6c" + " " + "mb-3",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    className: "jsx-d3eaaa0de8606e6c" + " " + "flex items-center gap-2 mb-1",
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                            className: "jsx-d3eaaa0de8606e6c" + " " + "w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                                                                            lineNumber: 1189,
                                                                                            columnNumber: 31
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                            title: audioFile.name,
                                                                                            className: "jsx-d3eaaa0de8606e6c" + " " + "text-sm font-medium text-slate-700 break-all",
                                                                                            children: audioFile.name
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                                                                            lineNumber: 1190,
                                                                                            columnNumber: 31
                                                                                        }, this)
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                                                    lineNumber: 1188,
                                                                                    columnNumber: 29
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "jsx-d3eaaa0de8606e6c" + " " + "text-xs text-slate-500 ml-4",
                                                                                    children: [
                                                                                        "(",
                                                                                        audioFile.size ? `${(audioFile.size / 1024 / 1024).toFixed(2)} MB` : 'From Media Library',
                                                                                        ")"
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                                                    lineNumber: 1194,
                                                                                    columnNumber: 29
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                                                            lineNumber: 1187,
                                                                            columnNumber: 27
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("audio", {
                                                                            controls: true,
                                                                            style: {
                                                                                outline: 'none'
                                                                            },
                                                                            className: "jsx-d3eaaa0de8606e6c" + " " + "w-full h-8",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("source", {
                                                                                    src: audioFile.url,
                                                                                    type: "audio/mpeg",
                                                                                    className: "jsx-d3eaaa0de8606e6c"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                                                    lineNumber: 1203,
                                                                                    columnNumber: 29
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("source", {
                                                                                    src: audioFile.url,
                                                                                    type: "audio/wav",
                                                                                    className: "jsx-d3eaaa0de8606e6c"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                                                    lineNumber: 1204,
                                                                                    columnNumber: 29
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("source", {
                                                                                    src: audioFile.url,
                                                                                    type: "audio/ogg",
                                                                                    className: "jsx-d3eaaa0de8606e6c"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                                                    lineNumber: 1205,
                                                                                    columnNumber: 29
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("source", {
                                                                                    src: audioFile.url,
                                                                                    type: "audio/mp4",
                                                                                    className: "jsx-d3eaaa0de8606e6c"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                                                    lineNumber: 1206,
                                                                                    columnNumber: 29
                                                                                }, this),
                                                                                "Your browser does not support the audio element."
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                                                            lineNumber: 1198,
                                                                            columnNumber: 27
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                                    lineNumber: 1186,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-d3eaaa0de8606e6c" + " " + "mt-3",
                                                                    children: songAudioFile && !audioFile ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "jsx-d3eaaa0de8606e6c" + " " + "p-4 bg-slate-50 rounded-lg border border-slate-200",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "jsx-d3eaaa0de8606e6c" + " " + "flex items-center justify-between mb-3",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "jsx-d3eaaa0de8606e6c" + " " + "flex items-center gap-2",
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                className: "jsx-d3eaaa0de8606e6c" + " " + "w-2 h-2 bg-green-500 rounded-full flex-shrink-0"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/src/components/EditSongModal.tsx",
                                                                                                lineNumber: 1217,
                                                                                                columnNumber: 33
                                                                                            }, this),
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                className: "jsx-d3eaaa0de8606e6c" + " " + "text-sm font-medium text-slate-700",
                                                                                                children: "Current Audio:"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/src/components/EditSongModal.tsx",
                                                                                                lineNumber: 1218,
                                                                                                columnNumber: 33
                                                                                            }, this)
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/src/components/EditSongModal.tsx",
                                                                                        lineNumber: 1216,
                                                                                        columnNumber: 31
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                        onClick: ()=>{
                                                                                            console.log('🗑️ Deleting audio file:', {
                                                                                                currentSongAudioFile: songAudioFile,
                                                                                                currentAudioFile: audioFile
                                                                                            });
                                                                                            setSongAudioFile('');
                                                                                            setAudioFile(null);
                                                                                            console.log('🗑️ Audio deleted, state cleared');
                                                                                        },
                                                                                        className: "jsx-d3eaaa0de8606e6c" + " " + "text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded border border-red-200 hover:border-red-300 transition-colors",
                                                                                        children: "Delete"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/components/EditSongModal.tsx",
                                                                                        lineNumber: 1220,
                                                                                        columnNumber: 31
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/src/components/EditSongModal.tsx",
                                                                                lineNumber: 1215,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                title: songAudioFile,
                                                                                className: "jsx-d3eaaa0de8606e6c" + " " + "text-sm text-slate-600 break-all mb-3",
                                                                                children: songAudioFile.split('/').pop() || songAudioFile
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/components/EditSongModal.tsx",
                                                                                lineNumber: 1235,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "jsx-d3eaaa0de8606e6c" + " " + "text-xs text-gray-500 mb-2",
                                                                                children: [
                                                                                    "Source: ",
                                                                                    songAudioFile
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/src/components/EditSongModal.tsx",
                                                                                lineNumber: 1238,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("audio", {
                                                                                controls: true,
                                                                                style: {
                                                                                    outline: 'none'
                                                                                },
                                                                                preload: "metadata",
                                                                                className: "jsx-d3eaaa0de8606e6c" + " " + "w-full h-8",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("source", {
                                                                                        src: songAudioFile,
                                                                                        type: "audio/mpeg",
                                                                                        className: "jsx-d3eaaa0de8606e6c"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/components/EditSongModal.tsx",
                                                                                        lineNumber: 1247,
                                                                                        columnNumber: 31
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("source", {
                                                                                        src: songAudioFile,
                                                                                        type: "audio/wav",
                                                                                        className: "jsx-d3eaaa0de8606e6c"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/components/EditSongModal.tsx",
                                                                                        lineNumber: 1248,
                                                                                        columnNumber: 31
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("source", {
                                                                                        src: songAudioFile,
                                                                                        type: "audio/ogg",
                                                                                        className: "jsx-d3eaaa0de8606e6c"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/components/EditSongModal.tsx",
                                                                                        lineNumber: 1249,
                                                                                        columnNumber: 31
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("source", {
                                                                                        src: songAudioFile,
                                                                                        type: "audio/mp4",
                                                                                        className: "jsx-d3eaaa0de8606e6c"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/components/EditSongModal.tsx",
                                                                                        lineNumber: 1250,
                                                                                        columnNumber: 31
                                                                                    }, this),
                                                                                    "Your browser does not support the audio element."
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/src/components/EditSongModal.tsx",
                                                                                lineNumber: 1241,
                                                                                columnNumber: 29
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/components/EditSongModal.tsx",
                                                                        lineNumber: 1214,
                                                                        columnNumber: 27
                                                                    }, this) : !songAudioFile && !audioFile ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "jsx-d3eaaa0de8606e6c" + " " + "p-4 bg-gray-50 rounded-lg border border-gray-200 text-center",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "jsx-d3eaaa0de8606e6c" + " " + "text-gray-500 text-sm",
                                                                                children: "No audio file selected"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/components/EditSongModal.tsx",
                                                                                lineNumber: 1256,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "jsx-d3eaaa0de8606e6c" + " " + "text-xs text-gray-400 mt-1",
                                                                                children: 'Click "Browse Media Library" to select an audio file'
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/components/EditSongModal.tsx",
                                                                                lineNumber: 1259,
                                                                                columnNumber: 29
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/components/EditSongModal.tsx",
                                                                        lineNumber: 1255,
                                                                        columnNumber: 27
                                                                    }, this) : null
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                                    lineNumber: 1212,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                                            lineNumber: 1164,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                    lineNumber: 1108,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-d3eaaa0de8606e6c" + " " + "bg-slate-50 rounded-lg p-4 sm:p-6",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-d3eaaa0de8606e6c" + " " + "flex items-center justify-between mb-3 sm:mb-4",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                    className: "jsx-d3eaaa0de8606e6c" + " " + "text-base sm:text-lg font-semibold text-slate-900",
                                                                    children: "Personnel"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                                    lineNumber: 1271,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    onClick: ()=>handleCreateHistory('personnel'),
                                                                    className: "jsx-d3eaaa0de8606e6c" + " " + "flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md transition-colors",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$history$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__History$3e$__["History"], {
                                                                            className: "w-3 h-3"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                                                            lineNumber: 1276,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        "Add History"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                                    lineNumber: 1272,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                                            lineNumber: 1270,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-d3eaaa0de8606e6c" + " " + "grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-d3eaaa0de8606e6c",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                            className: "jsx-d3eaaa0de8606e6c" + " " + "block text-sm font-medium text-slate-700 mb-2",
                                                                            children: "Lead Singer"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                                                            lineNumber: 1282,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                            type: "text",
                                                                            value: songLeadSinger,
                                                                            onChange: (e)=>setSongLeadSinger(e.target.value),
                                                                            onPaste: (e)=>handlePaste(e, songLeadSinger, setSongLeadSinger),
                                                                            placeholder: "Enter lead singer name",
                                                                            className: "jsx-d3eaaa0de8606e6c" + " " + "w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 focus:shadow-xl focus:bg-purple-50 transition-all duration-200"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                                                            lineNumber: 1285,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                                    lineNumber: 1281,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-d3eaaa0de8606e6c",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                            className: "jsx-d3eaaa0de8606e6c" + " " + "block text-sm font-medium text-slate-700 mb-2",
                                                                            children: "Writer"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                                                            lineNumber: 1296,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                            type: "text",
                                                                            value: songWriter,
                                                                            onChange: (e)=>setSongWriter(e.target.value),
                                                                            onPaste: (e)=>handlePaste(e, songWriter, setSongWriter),
                                                                            placeholder: "Enter writer name",
                                                                            className: "jsx-d3eaaa0de8606e6c" + " " + "w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 focus:shadow-xl focus:bg-purple-50 transition-all duration-200"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                                                            lineNumber: 1299,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                                    lineNumber: 1295,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-d3eaaa0de8606e6c",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                            className: "jsx-d3eaaa0de8606e6c" + " " + "block text-sm font-medium text-slate-700 mb-2",
                                                                            children: "Conductor"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                                                            lineNumber: 1310,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                            type: "text",
                                                                            value: songConductor,
                                                                            onChange: (e)=>setSongConductor(e.target.value),
                                                                            onPaste: (e)=>handlePaste(e, songConductor, setSongConductor),
                                                                            placeholder: "Enter conductor name",
                                                                            className: "jsx-d3eaaa0de8606e6c" + " " + "w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 focus:shadow-xl focus:bg-purple-50 transition-all duration-200"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                                                            lineNumber: 1313,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                                    lineNumber: 1309,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-d3eaaa0de8606e6c",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                            className: "jsx-d3eaaa0de8606e6c" + " " + "block text-sm font-medium text-slate-700 mb-2",
                                                                            children: "Lead Keyboardist"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                                                            lineNumber: 1324,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                            type: "text",
                                                                            value: songLeadKeyboardist,
                                                                            onChange: (e)=>setSongLeadKeyboardist(e.target.value),
                                                                            onPaste: (e)=>handlePaste(e, songLeadKeyboardist, setSongLeadKeyboardist),
                                                                            placeholder: "Enter lead keyboardist name",
                                                                            className: "jsx-d3eaaa0de8606e6c" + " " + "w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 focus:shadow-xl focus:bg-purple-50 transition-all duration-200"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                                                            lineNumber: 1327,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                                    lineNumber: 1323,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-d3eaaa0de8606e6c",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                            className: "jsx-d3eaaa0de8606e6c" + " " + "block text-sm font-medium text-slate-700 mb-2",
                                                                            children: "Bass Guitarist"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                                                            lineNumber: 1338,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                            type: "text",
                                                                            value: songLeadGuitarist,
                                                                            onChange: (e)=>setSongLeadGuitarist(e.target.value),
                                                                            onPaste: (e)=>handlePaste(e, songLeadGuitarist, setSongLeadGuitarist),
                                                                            placeholder: "Enter bass guitarist name",
                                                                            className: "jsx-d3eaaa0de8606e6c" + " " + "w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 focus:shadow-xl focus:bg-purple-50 transition-all duration-200"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                                                            lineNumber: 1341,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                                    lineNumber: 1337,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-d3eaaa0de8606e6c",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                            className: "jsx-d3eaaa0de8606e6c" + " " + "block text-sm font-medium text-slate-700 mb-2",
                                                                            children: "Drummer"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                                                            lineNumber: 1352,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                            type: "text",
                                                                            value: songDrummer,
                                                                            onChange: (e)=>setSongDrummer(e.target.value),
                                                                            onPaste: (e)=>handlePaste(e, songDrummer, setSongDrummer),
                                                                            placeholder: "Enter drummer name",
                                                                            className: "jsx-d3eaaa0de8606e6c" + " " + "w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-400 focus:border-purple-600 focus:shadow-xl focus:bg-purple-50 transition-all duration-200"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                                                            lineNumber: 1355,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                                    lineNumber: 1351,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                                            lineNumber: 1280,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                    lineNumber: 1269,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                            lineNumber: 1009,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-d3eaaa0de8606e6c" + " " + "lg:col-span-3 space-y-4 sm:space-y-6",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-d3eaaa0de8606e6c" + " " + "bg-white border border-slate-200 rounded-lg shadow-sm",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-d3eaaa0de8606e6c" + " " + "px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 bg-slate-50 rounded-t-lg",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "jsx-d3eaaa0de8606e6c" + " " + "flex items-center justify-between",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                        className: "jsx-d3eaaa0de8606e6c" + " " + "text-base sm:text-lg font-semibold text-slate-900 flex items-center gap-2",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "jsx-d3eaaa0de8606e6c" + " " + "w-2 h-2 bg-blue-500 rounded-full"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/components/EditSongModal.tsx",
                                                                                lineNumber: 1376,
                                                                                columnNumber: 25
                                                                            }, this),
                                                                            "Song Lyrics"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/components/EditSongModal.tsx",
                                                                        lineNumber: 1375,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        onClick: ()=>handleCreateHistory('lyrics'),
                                                                        className: "jsx-d3eaaa0de8606e6c" + " " + (historyButtonClasses || ""),
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$history$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__History$3e$__["History"], {
                                                                                className: "w-3 h-3"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/components/EditSongModal.tsx",
                                                                                lineNumber: 1383,
                                                                                columnNumber: 27
                                                                            }, this),
                                                                            "Add History"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/components/EditSongModal.tsx",
                                                                        lineNumber: 1379,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/EditSongModal.tsx",
                                                                lineNumber: 1374,
                                                                columnNumber: 23
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                                            lineNumber: 1373,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-d3eaaa0de8606e6c" + " " + "p-4 sm:p-6",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-d3eaaa0de8606e6c" + " " + "mb-3 p-2 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-600",
                                                                    children: "Rich text editor - Use the toolbar above to format your lyrics"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                                    lineNumber: 1390,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-d3eaaa0de8606e6c" + " " + "relative",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$BasicTextEditor$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                                        id: "lyrics-editor",
                                                                        value: songLyrics,
                                                                        onChange: (value)=>{
                                                                            console.log('🎵 Lyrics onChange called with:', value);
                                                                            setSongLyrics(value);
                                                                        },
                                                                        placeholder: "Enter complete song lyrics here...      Example:   Verse 1:   [Your verse lyrics here]      Chorus:   [Your chorus lyrics here]      Verse 2:   [Your verse lyrics here]      Bridge:   [Your bridge lyrics here]",
                                                                        className: "w-full"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/EditSongModal.tsx",
                                                                        lineNumber: 1395,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                                    lineNumber: 1394,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                                            lineNumber: 1388,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                    lineNumber: 1372,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-d3eaaa0de8606e6c" + " " + "bg-white border border-slate-200 rounded-lg shadow-sm",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-d3eaaa0de8606e6c" + " " + "px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 bg-slate-50 rounded-t-lg",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "jsx-d3eaaa0de8606e6c" + " " + "flex items-center justify-between",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                        className: "jsx-d3eaaa0de8606e6c" + " " + "text-base sm:text-lg font-semibold text-slate-900 flex items-center gap-2",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "jsx-d3eaaa0de8606e6c" + " " + "w-2 h-2 bg-green-500 rounded-full"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/components/EditSongModal.tsx",
                                                                                lineNumber: 1427,
                                                                                columnNumber: 25
                                                                            }, this),
                                                                            "Conductor's Guide Notation"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/components/EditSongModal.tsx",
                                                                        lineNumber: 1426,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        onClick: ()=>handleCreateHistory('solfas'),
                                                                        className: "jsx-d3eaaa0de8606e6c" + " " + (historyButtonClasses || ""),
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$history$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__History$3e$__["History"], {
                                                                                className: "w-3 h-3"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/components/EditSongModal.tsx",
                                                                                lineNumber: 1434,
                                                                                columnNumber: 27
                                                                            }, this),
                                                                            "Add History"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/components/EditSongModal.tsx",
                                                                        lineNumber: 1430,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/EditSongModal.tsx",
                                                                lineNumber: 1425,
                                                                columnNumber: 23
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                                            lineNumber: 1424,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-d3eaaa0de8606e6c" + " " + "p-4 sm:p-6",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-d3eaaa0de8606e6c" + " " + "mb-3 p-2 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-600",
                                                                    children: "Rich text editor - Use the toolbar above to format your solfas"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                                    lineNumber: 1441,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-d3eaaa0de8606e6c" + " " + "relative",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$BasicTextEditor$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                                        id: "solfas-editor",
                                                                        value: songSolfas,
                                                                        onChange: (value)=>{
                                                                            console.log("🎵 Conductor's Guide onChange called with:", value);
                                                                            setSongSolfas(value);
                                                                        },
                                                                        placeholder: "Enter solfas notation here...      Example:   Do Re Mi Fa Sol La Ti Do   Do Re Mi Fa Sol La Ti Do   Do Ti La Sol Fa Mi Re Do      Chorus:   Do Re Mi Fa Sol La Ti Do   Do Re Mi Fa Sol La Ti Do",
                                                                        className: "w-full font-mono"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/EditSongModal.tsx",
                                                                        lineNumber: 1446,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                                    lineNumber: 1445,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                                            lineNumber: 1439,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                    lineNumber: 1423,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-d3eaaa0de8606e6c" + " " + "bg-white border border-slate-200 rounded-lg shadow-sm",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-d3eaaa0de8606e6c" + " " + "px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 bg-slate-50 rounded-t-lg",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "jsx-d3eaaa0de8606e6c" + " " + "flex items-center justify-between",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                        className: "jsx-d3eaaa0de8606e6c" + " " + "text-base sm:text-lg font-semibold text-slate-900 flex items-center gap-2",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "jsx-d3eaaa0de8606e6c" + " " + "w-2 h-2 bg-purple-500 rounded-full"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/components/EditSongModal.tsx",
                                                                                lineNumber: 1474,
                                                                                columnNumber: 25
                                                                            }, this),
                                                                            getCommentLabel(),
                                                                            " Comment"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/components/EditSongModal.tsx",
                                                                        lineNumber: 1473,
                                                                        columnNumber: 23
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        onClick: ()=>handleCreateHistory('comments'),
                                                                        className: "jsx-d3eaaa0de8606e6c" + " " + (historyButtonClasses || ""),
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$history$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__History$3e$__["History"], {
                                                                                className: "w-3 h-3"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/components/EditSongModal.tsx",
                                                                                lineNumber: 1481,
                                                                                columnNumber: 27
                                                                            }, this),
                                                                            "Save Version"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/components/EditSongModal.tsx",
                                                                        lineNumber: 1477,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/EditSongModal.tsx",
                                                                lineNumber: 1472,
                                                                columnNumber: 23
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                                            lineNumber: 1471,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-d3eaaa0de8606e6c" + " " + "p-4 sm:p-6",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-d3eaaa0de8606e6c" + " " + "mb-3 p-2 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-600",
                                                                    children: "Basic rich text - Bold and Italic supported"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                                    lineNumber: 1487,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$BasicTextEditor$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                                    id: "coordinator-comment-editor",
                                                                    value: coordinatorComment,
                                                                    onChange: (value)=>setCoordinatorComment(value),
                                                                    placeholder: `Enter ${getCommentLabel()}'s comment here...`,
                                                                    className: "w-full"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                                    lineNumber: 1490,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                                            lineNumber: 1486,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                    lineNumber: 1470,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                            lineNumber: 1369,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                    lineNumber: 1006,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/EditSongModal.tsx",
                                lineNumber: 1003,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/EditSongModal.tsx",
                            lineNumber: 1002,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-d3eaaa0de8606e6c" + " " + "flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 p-4 sm:p-6 border-t border-slate-200 flex-shrink-0",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleUpdate,
                                    className: "jsx-d3eaaa0de8606e6c" + " " + `flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-3 ${theme.primary} text-white ${theme.primaryHover} rounded-lg transition-colors font-medium`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$save$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Save$3e$__["Save"], {
                                            className: "w-4 h-4 sm:w-5 sm:h-5"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                            lineNumber: 1510,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "jsx-d3eaaa0de8606e6c" + " " + "text-sm sm:text-base",
                                            children: song ? 'Update Song' : 'Add Song'
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                            lineNumber: 1511,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                    lineNumber: 1506,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-d3eaaa0de8606e6c" + " " + "flex flex-col sm:flex-row gap-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>{
                                                if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
                                                ;
                                                loadHistoryEntries();
                                                setShowHistoryList(true);
                                            },
                                            disabled: !("TURBOPACK compile-time value", "loveworld-singers-app"),
                                            className: "jsx-d3eaaa0de8606e6c" + " " + `flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors font-medium relative ${("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : `${theme.primary} text-white ${theme.primaryHover}`}`,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$history$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__History$3e$__["History"], {
                                                    className: "w-4 h-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                    lineNumber: 1536,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "jsx-d3eaaa0de8606e6c" + " " + "text-sm sm:text-base",
                                                    children: "View History"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                    lineNumber: 1537,
                                                    columnNumber: 17
                                                }, this),
                                                historyEntries.length > 0 && ("TURBOPACK compile-time value", "loveworld-singers-app") && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "jsx-d3eaaa0de8606e6c" + " " + "absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center",
                                                    children: historyEntries.length
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                    lineNumber: 1539,
                                                    columnNumber: 19
                                                }, this),
                                                !("TURBOPACK compile-time value", "loveworld-singers-app") && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    title: "Firebase not configured",
                                                    className: "jsx-d3eaaa0de8606e6c" + " " + "absolute -top-2 -right-2 bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center",
                                                    children: "⚠️"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                    lineNumber: 1544,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                            lineNumber: 1515,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: onClose,
                                            className: "jsx-d3eaaa0de8606e6c" + " " + "w-full sm:w-auto px-4 sm:px-6 py-3 border-2 border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg transition-colors font-medium",
                                            children: "Cancel"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                            lineNumber: 1549,
                                            columnNumber: 13
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                    lineNumber: 1514,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/EditSongModal.tsx",
                            lineNumber: 1505,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/EditSongModal.tsx",
                    lineNumber: 987,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/EditSongModal.tsx",
                lineNumber: 986,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$MediaSelectionModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                isOpen: showMediaManager,
                onClose: ()=>setShowMediaManager(false),
                onFileSelect: handleMediaFileSelect,
                allowedTypes: [
                    'audio'
                ],
                title: "Select Audio File"
            }, void 0, false, {
                fileName: "[project]/src/components/EditSongModal.tsx",
                lineNumber: 1561,
                columnNumber: 7
            }, this),
            showHistoryForm && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-d3eaaa0de8606e6c" + " " + "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-2 sm:p-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "jsx-d3eaaa0de8606e6c" + " " + "bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-d3eaaa0de8606e6c" + " " + "px-6 py-4 border-b border-slate-200",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "jsx-d3eaaa0de8606e6c" + " " + "text-lg font-semibold text-slate-900",
                                    children: window.currentHistoryEntryId ? 'Update History Entry' : `Save ${historyType.charAt(0).toUpperCase() + historyType.slice(1)} Version`
                                }, void 0, false, {
                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                    lineNumber: 1574,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "jsx-d3eaaa0de8606e6c" + " " + "text-sm text-slate-600 mt-1",
                                    children: window.currentHistoryEntryId ? 'Update the selected history entry' : `Create a history entry for the current ${historyType} content`
                                }, void 0, false, {
                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                    lineNumber: 1577,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/EditSongModal.tsx",
                            lineNumber: 1573,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-d3eaaa0de8606e6c" + " " + "p-4 sm:p-6 space-y-6 max-h-[60vh] overflow-y-auto",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-d3eaaa0de8606e6c",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "jsx-d3eaaa0de8606e6c" + " " + "block text-sm font-medium text-slate-700 mb-2",
                                            children: "Version Title"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                            lineNumber: 1584,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "text",
                                            value: historyTitle,
                                            onChange: (e)=>setHistoryTitle(e.target.value),
                                            placeholder: "e.g., Lyrics Version 1.2",
                                            className: "jsx-d3eaaa0de8606e6c" + " " + "w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                            lineNumber: 1587,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                    lineNumber: 1583,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-d3eaaa0de8606e6c",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "jsx-d3eaaa0de8606e6c" + " " + "block text-sm font-medium text-slate-700 mb-2",
                                            children: "Type"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                            lineNumber: 1597,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                            value: historyType,
                                            onChange: (e)=>setHistoryType(e.target.value),
                                            className: "jsx-d3eaaa0de8606e6c" + " " + "w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: "song-details",
                                                    className: "jsx-d3eaaa0de8606e6c",
                                                    children: "Song Details"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                    lineNumber: 1605,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: "personnel",
                                                    className: "jsx-d3eaaa0de8606e6c",
                                                    children: "Personnel"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                    lineNumber: 1606,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: "music-details",
                                                    className: "jsx-d3eaaa0de8606e6c",
                                                    children: "Music Details"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                    lineNumber: 1607,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: "lyrics",
                                                    className: "jsx-d3eaaa0de8606e6c",
                                                    children: "Lyrics"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                    lineNumber: 1608,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: "solfas",
                                                    className: "jsx-d3eaaa0de8606e6c",
                                                    children: "Solfas"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                    lineNumber: 1609,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: "audio",
                                                    className: "jsx-d3eaaa0de8606e6c",
                                                    children: "Audio"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                    lineNumber: 1610,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                    value: "comments",
                                                    className: "jsx-d3eaaa0de8606e6c",
                                                    children: "Comments"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                    lineNumber: 1611,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                            lineNumber: 1600,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                    lineNumber: 1596,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-d3eaaa0de8606e6c",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "jsx-d3eaaa0de8606e6c" + " " + "block text-sm font-medium text-slate-700 mb-2",
                                            children: "Notes (Optional)"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                            lineNumber: 1616,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                            value: historyDescription,
                                            onChange: (e)=>setHistoryDescription(e.target.value),
                                            rows: 2,
                                            placeholder: "What changed in this version?",
                                            className: "jsx-d3eaaa0de8606e6c" + " " + "w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                            lineNumber: 1619,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                    lineNumber: 1615,
                                    columnNumber: 15
                                }, this),
                                window.currentHistoryEntryId && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-d3eaaa0de8606e6c" + " " + "space-y-6",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-d3eaaa0de8606e6c",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "jsx-d3eaaa0de8606e6c" + " " + "block text-sm font-medium text-slate-700 mb-2",
                                                children: "Historical Value"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/EditSongModal.tsx",
                                                lineNumber: 1631,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                value: (()=>{
                                                    // Check if originalHistoryValues is properly set
                                                    if (!originalHistoryValues) {
                                                        console.warn('originalHistoryValues is not set for textarea');
                                                        return '';
                                                    }
                                                    try {
                                                        // Try to parse as JSON, otherwise return as string
                                                        const parsed = JSON.parse(originalHistoryValues.old_value || '{}');
                                                        if (typeof parsed === 'object' && historyType !== 'lyrics' && historyType !== 'solfas' && historyType !== 'comments') {
                                                            // For non-lyrics content, extract the specific field value
                                                            switch(historyType){
                                                                case 'song-details':
                                                                    if (parsed.title !== undefined) return parsed.title;
                                                                    if (parsed.category !== undefined) return parsed.category;
                                                                    if (parsed.key !== undefined) return parsed.key;
                                                                    if (parsed.tempo !== undefined) return parsed.tempo;
                                                                    break;
                                                                case 'personnel':
                                                                    if (parsed.leadSinger !== undefined) return parsed.leadSinger;
                                                                    if (parsed.writer !== undefined) return parsed.writer;
                                                                    if (parsed.conductor !== undefined) return parsed.conductor;
                                                                    if (parsed.leadKeyboardist !== undefined) return parsed.leadKeyboardist;
                                                                    if (parsed.leadGuitarist !== undefined) return parsed.leadGuitarist;
                                                                    if (parsed.drummer !== undefined) return parsed.drummer;
                                                                    break;
                                                                case 'music-details':
                                                                    if (parsed.key !== undefined) return parsed.key;
                                                                    if (parsed.tempo !== undefined) return parsed.tempo;
                                                                    break;
                                                                case 'audio':
                                                                    return parsed.toString();
                                                                default:
                                                                    return JSON.stringify(parsed, null, 2);
                                                            }
                                                        } else {
                                                            // For lyrics and solfas, convert HTML to readable text
                                                            const rawValue = typeof parsed === 'string' ? parsed : originalHistoryValues.old_value || '';
                                                            // Convert HTML to readable format for editing
                                                            return rawValue.replace(/<div[^>]*>(.*?)<\/div>/gi, '$1\n\n') // Convert <div> to text with double newlines (paragraph breaks)
                                                            .replace(/<br\s*\/?>/gi, '\n') // Convert <br> to newlines
                                                            .replace(/<b>(.*?)<\/b>/gi, '**$1**') // Convert <b> to **bold**
                                                            .replace(/<[^>]*>/g, '') // Remove any remaining HTML tags
                                                            .trim();
                                                        }
                                                    } catch  {
                                                        // If parsing fails, convert HTML to readable text
                                                        const rawValue = originalHistoryValues.old_value || '';
                                                        return rawValue.replace(/<div[^>]*>(.*?)<\/div>/gi, '$1\n\n') // Convert <div> to text with double newlines (paragraph breaks)
                                                        .replace(/<br\s*\/?>/gi, '\n') // Convert <br> to newlines
                                                        .replace(/<b>(.*?)<\/b>/gi, '**$1**') // Convert <b> to **bold**
                                                        .replace(/<[^>]*>/g, '') // Remove any remaining HTML tags
                                                        .trim();
                                                    }
                                                })(),
                                                onChange: (e)=>{
                                                    // For structured data types, we need to reconstruct the object
                                                    if (historyType === 'song-details' || historyType === 'personnel' || historyType === 'music-details') {
                                                        try {
                                                            const currentParsed = JSON.parse(originalHistoryValues?.old_value || '{}');
                                                            if (typeof currentParsed === 'object') {
                                                                // Update the appropriate field based on historyType
                                                                switch(historyType){
                                                                    case 'song-details':
                                                                        if (currentParsed.title !== undefined) {
                                                                            currentParsed.title = e.target.value;
                                                                        } else if (currentParsed.category !== undefined) {
                                                                            currentParsed.category = e.target.value;
                                                                        } else if (currentParsed.key !== undefined) {
                                                                            currentParsed.key = e.target.value;
                                                                        } else if (currentParsed.tempo !== undefined) {
                                                                            currentParsed.tempo = e.target.value;
                                                                        }
                                                                        break;
                                                                    case 'personnel':
                                                                        if (currentParsed.leadSinger !== undefined) {
                                                                            currentParsed.leadSinger = e.target.value;
                                                                        } else if (currentParsed.writer !== undefined) {
                                                                            currentParsed.writer = e.target.value;
                                                                        } else if (currentParsed.conductor !== undefined) {
                                                                            currentParsed.conductor = e.target.value;
                                                                        } else if (currentParsed.leadKeyboardist !== undefined) {
                                                                            currentParsed.leadKeyboardist = e.target.value;
                                                                        } else if (currentParsed.leadGuitarist !== undefined) {
                                                                            currentParsed.leadGuitarist = e.target.value;
                                                                        } else if (currentParsed.drummer !== undefined) {
                                                                            currentParsed.drummer = e.target.value;
                                                                        }
                                                                        break;
                                                                    case 'music-details':
                                                                        if (currentParsed.key !== undefined) {
                                                                            currentParsed.key = e.target.value;
                                                                        } else if (currentParsed.tempo !== undefined) {
                                                                            currentParsed.tempo = e.target.value;
                                                                        }
                                                                        break;
                                                                }
                                                                setOriginalHistoryValues({
                                                                    ...originalHistoryValues,
                                                                    old_value: JSON.stringify(currentParsed)
                                                                });
                                                            } else {
                                                                // If it's not an object, just update the string value
                                                                setOriginalHistoryValues({
                                                                    ...originalHistoryValues,
                                                                    old_value: e.target.value
                                                                });
                                                            }
                                                        } catch  {
                                                            // If parsing fails, just update the string value
                                                            setOriginalHistoryValues({
                                                                ...originalHistoryValues,
                                                                old_value: e.target.value
                                                            });
                                                        }
                                                    } else {
                                                        // For lyrics and solfas, convert readable format back to HTML for saving
                                                        // First convert double newlines to paragraph breaks (<div>), then single newlines to <br>
                                                        let convertedValue = e.target.value;
                                                        // Split by double newlines to identify paragraph breaks
                                                        const paragraphs = convertedValue.split('\n\n');
                                                        // Wrap each paragraph in div tags and join with empty div for spacing
                                                        convertedValue = paragraphs.filter((p)=>p.trim() !== '') // Remove empty paragraphs
                                                        .map((p)=>`<div>${p.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')}</div>`).join('');
                                                        setOriginalHistoryValues({
                                                            ...originalHistoryValues,
                                                            old_value: convertedValue
                                                        });
                                                    }
                                                },
                                                rows: 8,
                                                placeholder: "Historical value to edit",
                                                className: "jsx-d3eaaa0de8606e6c" + " " + "w-full px-3 py-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/EditSongModal.tsx",
                                                lineNumber: 1634,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/EditSongModal.tsx",
                                        lineNumber: 1630,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                    lineNumber: 1629,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-d3eaaa0de8606e6c" + " " + "bg-blue-50 border border-blue-200 rounded-lg p-4",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "jsx-d3eaaa0de8606e6c" + " " + "text-sm text-blue-800",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                className: "jsx-d3eaaa0de8606e6c",
                                                children: window.currentHistoryEntryId ? 'History entry will be updated with your changes.' : `Current ${historyType} content will be saved as a new version.`
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/EditSongModal.tsx",
                                                lineNumber: 1771,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {
                                                className: "jsx-d3eaaa0de8606e6c"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/EditSongModal.tsx",
                                                lineNumber: 1776,
                                                columnNumber: 19
                                            }, this),
                                            "You can ",
                                            window.currentHistoryEntryId ? 'update' : 'create',
                                            " multiple versions and switch between them later."
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/EditSongModal.tsx",
                                        lineNumber: 1770,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                    lineNumber: 1769,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/EditSongModal.tsx",
                            lineNumber: 1582,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-d3eaaa0de8606e6c" + " " + "px-6 py-4 border-t border-slate-200 flex justify-end",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-d3eaaa0de8606e6c" + " " + "flex gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>{
                                            // Reset the currentHistoryEntryId when closing the form
                                            window.currentHistoryEntryId = null;
                                            setShowHistoryForm(false);
                                        },
                                        className: "jsx-d3eaaa0de8606e6c" + " " + "px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors",
                                        children: "Cancel"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/EditSongModal.tsx",
                                        lineNumber: 1784,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>{
                                            handleSaveHistory();
                                            // Reset the currentHistoryEntryId after saving
                                            setTimeout(()=>{
                                                window.currentHistoryEntryId = null;
                                            }, 100); // Small delay to ensure save completes
                                            setShowHistoryForm(false);
                                        },
                                        className: "jsx-d3eaaa0de8606e6c" + " " + "px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors",
                                        children: "Save & Close"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/EditSongModal.tsx",
                                        lineNumber: 1795,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/EditSongModal.tsx",
                                lineNumber: 1783,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/EditSongModal.tsx",
                            lineNumber: 1782,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/EditSongModal.tsx",
                    lineNumber: 1572,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/EditSongModal.tsx",
                lineNumber: 1571,
                columnNumber: 9
            }, this),
            showHistoryList && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-d3eaaa0de8606e6c" + " " + "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "jsx-d3eaaa0de8606e6c" + " " + "bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-d3eaaa0de8606e6c" + " " + "px-6 py-4 border-b border-slate-200",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-d3eaaa0de8606e6c" + " " + "flex items-center justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "jsx-d3eaaa0de8606e6c" + " " + "text-lg font-semibold text-slate-900",
                                        children: [
                                            "Song History - ",
                                            song?.title
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/EditSongModal.tsx",
                                        lineNumber: 1821,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setShowHistoryList(false),
                                        className: "jsx-d3eaaa0de8606e6c" + " " + "text-slate-400 hover:text-slate-600",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                            className: "w-6 h-6"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                            lineNumber: 1828,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/EditSongModal.tsx",
                                        lineNumber: 1824,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/EditSongModal.tsx",
                                lineNumber: 1820,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/EditSongModal.tsx",
                            lineNumber: 1819,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-d3eaaa0de8606e6c" + " " + "p-6",
                            children: historyEntries.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-d3eaaa0de8606e6c" + " " + "text-center py-8 text-slate-500",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$history$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__History$3e$__["History"], {
                                        className: "w-12 h-12 mx-auto mb-4 text-slate-300"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/EditSongModal.tsx",
                                        lineNumber: 1836,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "jsx-d3eaaa0de8606e6c",
                                        children: "No history entries found for this song."
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/EditSongModal.tsx",
                                        lineNumber: 1837,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "jsx-d3eaaa0de8606e6c" + " " + "text-sm",
                                        children: 'Create your first history entry using the "Add History" buttons.'
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/EditSongModal.tsx",
                                        lineNumber: 1838,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/EditSongModal.tsx",
                                lineNumber: 1835,
                                columnNumber: 17
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-d3eaaa0de8606e6c" + " " + "space-y-4",
                                children: historyEntries.map((entry)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-d3eaaa0de8606e6c" + " " + "border border-slate-200 rounded-lg p-4",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-d3eaaa0de8606e6c" + " " + "flex items-start justify-between",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-d3eaaa0de8606e6c" + " " + "flex-1",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-d3eaaa0de8606e6c" + " " + "flex items-center gap-2 mb-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "jsx-d3eaaa0de8606e6c" + " " + "px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full",
                                                                    children: entry.type
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                                    lineNumber: 1847,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "jsx-d3eaaa0de8606e6c" + " " + "text-sm text-slate-500",
                                                                    children: new Date(entry.created_at).toLocaleString()
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                                    lineNumber: 1850,
                                                                    columnNumber: 29
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                                            lineNumber: 1846,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                            className: "jsx-d3eaaa0de8606e6c" + " " + "font-medium text-slate-900 mb-1",
                                                            children: entry.title
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                                            lineNumber: 1854,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "jsx-d3eaaa0de8606e6c" + " " + "text-sm text-slate-600 mb-2",
                                                            children: entry.description
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                                            lineNumber: 1855,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-d3eaaa0de8606e6c" + " " + "text-xs text-slate-500",
                                                            children: [
                                                                "Created by: ",
                                                                entry.created_by
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                                            lineNumber: 1856,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                    lineNumber: 1845,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-d3eaaa0de8606e6c" + " " + "flex gap-2 ml-4",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>{
                                                                // Edit this history entry
                                                                setHistoryTitle(entry.title);
                                                                setHistoryDescription(entry.description);
                                                                setHistoryType(entry.type);
                                                                // Store original values for editing
                                                                setOriginalHistoryValues({
                                                                    old_value: entry.old_value || '',
                                                                    new_value: entry.new_value || ''
                                                                });
                                                                setShowHistoryForm(true);
                                                                // Store the entry ID for updating
                                                                window.currentHistoryEntryId = entry.id;
                                                            },
                                                            title: "Edit history entry",
                                                            className: "jsx-d3eaaa0de8606e6c" + " " + "p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2d$pen$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Edit$3e$__["Edit"], {
                                                                className: "w-4 h-4"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/EditSongModal.tsx",
                                                                lineNumber: 1879,
                                                                columnNumber: 29
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                                            lineNumber: 1861,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>handleDeleteHistory(entry.id),
                                                            title: "Delete history entry",
                                                            className: "jsx-d3eaaa0de8606e6c" + " " + "p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                                                className: "w-4 h-4"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/EditSongModal.tsx",
                                                                lineNumber: 1886,
                                                                columnNumber: 29
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                                            lineNumber: 1881,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/EditSongModal.tsx",
                                                    lineNumber: 1860,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/EditSongModal.tsx",
                                            lineNumber: 1844,
                                            columnNumber: 23
                                        }, this)
                                    }, entry.id, false, {
                                        fileName: "[project]/src/components/EditSongModal.tsx",
                                        lineNumber: 1843,
                                        columnNumber: 21
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/components/EditSongModal.tsx",
                                lineNumber: 1841,
                                columnNumber: 17
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/EditSongModal.tsx",
                            lineNumber: 1833,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-d3eaaa0de8606e6c" + " " + "px-6 py-4 border-t border-slate-200",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setShowHistoryList(false),
                                className: "jsx-d3eaaa0de8606e6c" + " " + "w-full px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors",
                                children: "Close"
                            }, void 0, false, {
                                fileName: "[project]/src/components/EditSongModal.tsx",
                                lineNumber: 1897,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/EditSongModal.tsx",
                            lineNumber: 1896,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/EditSongModal.tsx",
                    lineNumber: 1818,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/EditSongModal.tsx",
                lineNumber: 1817,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true);
}
}),
];

//# sourceMappingURL=src_components_EditSongModal_tsx_77af1fd2._.js.map