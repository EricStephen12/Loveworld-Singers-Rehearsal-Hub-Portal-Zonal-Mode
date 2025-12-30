module.exports = [
"[project]/src/lib/firebase-comment-service.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FirebaseCommentService",
    ()=>FirebaseCommentService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase-database.ts [app-ssr] (ecmascript)");
;
class FirebaseCommentService {
    static async createComment(commentData) {
        try {
            const comment = {
                id: Date.now(),
                song_id: commentData.song_id,
                user_id: commentData.user_id,
                user_name: commentData.user_name,
                content: commentData.content,
                parent_id: commentData.parent_id || null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                likes: 0,
                is_edited: false
            };
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].createDocument('comments', comment.id.toString(), comment);
            return comment;
        } catch (error) {
            console.error('Error creating comment:', error);
            return null;
        }
    }
    static async getCommentsBySongId(songId) {
        try {
            const comments = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].getCollectionWhere('comments', 'song_id', '==', songId);
            return comments.sort((a, b)=>new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        } catch (error) {
            console.error('Error fetching comments:', error);
            return [];
        }
    }
    static async updateComment(commentId, updates) {
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].updateDocument('comments', commentId.toString(), {
                ...updates,
                updated_at: new Date().toISOString(),
                is_edited: true
            });
            return true;
        } catch (error) {
            console.error('Error updating comment:', error);
            return false;
        }
    }
    static async deleteComment(commentId) {
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].deleteDocument('comments', commentId.toString());
            return true;
        } catch (error) {
            console.error('Error deleting comment:', error);
            return false;
        }
    }
    static async likeComment(commentId, userId) {
        try {
            const comment = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].getDocument('comments', commentId.toString());
            if (!comment) return false;
            const commentData = comment;
            const likedBy = commentData.liked_by || [];
            if (likedBy.includes(userId)) {
                const updatedLikedBy = likedBy.filter((id)=>id !== userId);
                await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].updateDocument('comments', commentId.toString(), {
                    likes: commentData.likes - 1,
                    liked_by: updatedLikedBy,
                    updated_at: new Date().toISOString()
                });
            } else {
                await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].updateDocument('comments', commentId.toString(), {
                    likes: commentData.likes + 1,
                    liked_by: [
                        ...likedBy,
                        userId
                    ],
                    updated_at: new Date().toISOString()
                });
            }
            return true;
        } catch (error) {
            console.error('Error liking comment:', error);
            return false;
        }
    }
}
}),
"[project]/src/hooks/useRealtimeComments.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useRealtimeComments",
    ()=>useRealtimeComments
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$comment$2d$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase-comment-service.ts [app-ssr] (ecmascript)");
'use client';
;
;
function useRealtimeComments({ songId, enabled = true }) {
    const [comments, setComments] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const fetchComments = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        if (!songId || !enabled) return;
        setLoading(true);
        setError(null);
        try {
            const freshComments = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$comment$2d$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FirebaseCommentService"].getCommentsBySongId(parseInt(songId));
            setComments(freshComments);
        } catch (error) {
            console.error('Error fetching comments:', error);
            setError(error instanceof Error ? error.message : 'Failed to fetch comments');
        } finally{
            setLoading(false);
        }
    }, [
        songId,
        enabled
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!songId || !enabled) return;
        fetchComments();
        const interval = setInterval(fetchComments, 1000);
        return ()=>clearInterval(interval);
    }, [
        songId,
        enabled,
        fetchComments
    ]);
    return {
        comments,
        loading,
        error,
        refreshComments: fetchComments
    };
}
}),
"[project]/src/lib/praise-night-songs-service.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PraiseNightSongsService",
    ()=>PraiseNightSongsService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$firestore$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/firebase/firestore/dist/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/firebase/node_modules/@firebase/firestore/dist/index.node.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase-setup.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/config/zones.ts [app-ssr] (ecmascript)");
;
;
;
function getCollectionName(zoneId) {
    return zoneId && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isHQGroup"])(zoneId) ? 'praise_night_songs' : 'zone_songs';
}
class PraiseNightSongsService {
    static async getSongsByPraiseNight(praiseNightId, zoneId) {
        try {
            const collectionName = getCollectionName(zoneId);
            const songsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], collectionName);
            let q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["query"])(songsRef, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["where"])('praiseNightId', '==', praiseNightId));
            let snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDocs"])(q);
            // Try alternative field names for HQ groups
            if (snapshot.empty && zoneId && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isHQGroup"])(zoneId)) {
                q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["query"])(songsRef, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["where"])('praisenightid', '==', praiseNightId));
                snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDocs"])(q);
                if (snapshot.empty) {
                    q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["query"])(songsRef, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["where"])('praisenight_id', '==', praiseNightId));
                    snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDocs"])(q);
                }
                if (snapshot.empty) {
                    q = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["query"])(songsRef, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["where"])('pageId', '==', praiseNightId));
                    snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDocs"])(q);
                }
            }
            return snapshot.docs.map((doc)=>{
                const data = doc.data();
                return {
                    ...data,
                    id: doc.id,
                    createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
                };
            });
        } catch (error) {
            console.error('Error getting songs:', error);
            return [];
        }
    }
    static async getAllSongs(zoneId) {
        try {
            const collectionName = getCollectionName(zoneId);
            const songsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], collectionName);
            const q = zoneId && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isHQGroup"])(zoneId) ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["query"])(songsRef, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["where"])('zoneId', '==', zoneId)) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["query"])(songsRef);
            const snapshot = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDocs"])(q);
            return snapshot.docs.map((doc)=>{
                const data = doc.data();
                return {
                    ...data,
                    id: doc.id,
                    createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
                };
            });
        } catch (error) {
            console.error('Error getting all songs:', error);
            return [];
        }
    }
    static async getSongById(songId, zoneId) {
        try {
            const collectionName = getCollectionName(zoneId);
            const songRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], collectionName, songId);
            const songDoc = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDoc"])(songRef);
            if (!songDoc.exists()) return null;
            const data = songDoc.data();
            return {
                ...data,
                id: songDoc.id,
                createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
            };
        } catch (error) {
            console.error('Error getting song:', error);
            return null;
        }
    }
    static async createSong(songData, zoneId) {
        try {
            const collectionName = getCollectionName(zoneId);
            const cleanData = {
                title: songData.title || '',
                leadSinger: songData.leadSinger || '',
                writer: songData.writer || '',
                conductor: songData.conductor || '',
                key: songData.key || '',
                tempo: songData.tempo || '',
                leadKeyboardist: songData.leadKeyboardist || '',
                leadGuitarist: songData.leadGuitarist || '',
                drummer: songData.drummer || '',
                lyrics: songData.lyrics || '',
                solfas: songData.solfas || '',
                audioFile: songData.audioFile || '',
                category: songData.category || '',
                categories: songData.categories || [],
                status: songData.status || 'unheard',
                praiseNightId: songData.praiseNightId || '',
                rehearsalCount: songData.rehearsalCount ?? 0,
                comments: songData.comments || [],
                history: songData.history || [],
                isActive: songData.isActive || false,
                mediaId: songData.mediaId || null,
                zoneId: zoneId || '',
                createdAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["serverTimestamp"])(),
                updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["serverTimestamp"])()
            };
            const songsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["collection"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], collectionName);
            const docRef = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["addDoc"])(songsRef, cleanData);
            return {
                success: true,
                id: docRef.id
            };
        } catch (error) {
            console.error('Error creating song:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create song'
            };
        }
    }
    static async updateSong(songId, songData, zoneId) {
        try {
            const collectionName = getCollectionName(zoneId);
            const songRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], collectionName, songId);
            const songDoc = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDoc"])(songRef);
            if (!songDoc.exists()) {
                return {
                    success: false,
                    error: 'Song not found'
                };
            }
            const { id, firebaseId, createdAt, zoneId: _, ...updateData } = songData;
            const cleanedData = Object.entries(updateData).reduce((acc, [key, value])=>{
                if (value !== undefined) acc[key] = value;
                return acc;
            }, {});
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["updateDoc"])(songRef, {
                ...cleanedData,
                updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["serverTimestamp"])()
            });
            return {
                success: true
            };
        } catch (error) {
            console.error('Error updating song:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update song'
            };
        }
    }
    static async deleteSong(songId, zoneId) {
        try {
            const collectionName = getCollectionName(zoneId);
            const songRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], collectionName, songId);
            const songDoc = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getDoc"])(songRef);
            if (!songDoc.exists()) {
                return {
                    success: false,
                    error: 'Song not found'
                };
            }
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["deleteDoc"])(songRef);
            return {
                success: true
            };
        } catch (error) {
            console.error('Error deleting song:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to delete song'
            };
        }
    }
    static async updateSongStatus(songId, status, zoneId) {
        try {
            const collectionName = getCollectionName(zoneId);
            const songRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["doc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$setup$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["db"], collectionName, songId);
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["updateDoc"])(songRef, {
                status,
                updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$firebase$2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$node$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["serverTimestamp"])()
            });
            return {
                success: true
            };
        } catch (error) {
            console.error('Error updating status:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update status'
            };
        }
    }
}
}),
"[project]/src/hooks/useRealtimeSongData.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useRealtimeSongData",
    ()=>useRealtimeSongData
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$praise$2d$night$2d$songs$2d$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/praise-night-songs-service.ts [app-ssr] (ecmascript)");
'use client';
;
;
function useRealtimeSongData({ songId, enabled = true, zoneId }) {
    const [songData, setSongData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const fetchSongData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        if (!songId || !enabled) return;
        setLoading(true);
        setError(null);
        try {
            const freshSongData = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$praise$2d$night$2d$songs$2d$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PraiseNightSongsService"].getSongById(songId, zoneId || undefined);
            setSongData(freshSongData || null);
        } catch (error) {
            console.error('Error fetching song data:', error);
            setError(error instanceof Error ? error.message : 'Failed to fetch song data');
        } finally{
            setLoading(false);
        }
    }, [
        songId,
        enabled,
        zoneId
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!songId || !enabled) return;
        fetchSongData();
        const interval = setInterval(fetchSongData, 1000);
        return ()=>clearInterval(interval);
    }, [
        songId,
        enabled,
        fetchSongData
    ]);
    return {
        songData,
        loading,
        error,
        refreshSongData: fetchSongData
    };
}
}),
"[project]/src/components/SongDetailModal.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SongDetailModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-left.js [app-ssr] (ecmascript) <export default as ChevronLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/book-open.js [app-ssr] (ecmascript) <export default as BookOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$music$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Music$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/music.js [app-ssr] (ecmascript) <export default as Music>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/users.js [app-ssr] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clock.js [app-ssr] (ecmascript) <export default as Clock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/play.js [app-ssr] (ecmascript) <export default as Play>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pause$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Pause$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/pause.js [app-ssr] (ecmascript) <export default as Pause>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$skip$2d$back$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__SkipBack$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/skip-back.js [app-ssr] (ecmascript) <export default as SkipBack>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$skip$2d$forward$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__SkipForward$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/skip-forward.js [app-ssr] (ecmascript) <export default as SkipForward>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/rotate-ccw.js [app-ssr] (ecmascript) <export default as RotateCcw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$music$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Music2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/music-2.js [app-ssr] (ecmascript) <export default as Music2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-ssr] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-up.js [app-ssr] (ecmascript) <export default as ChevronUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings.js [app-ssr] (ecmascript) <export default as Settings>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$maximize$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Maximize2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/maximize-2.js [app-ssr] (ecmascript) <export default as Maximize2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$minimize$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Minimize2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/minimize-2.js [app-ssr] (ecmascript) <export default as Minimize2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$cw$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/rotate-cw.js [app-ssr] (ecmascript) <export default as RotateCw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/refresh-cw.js [app-ssr] (ecmascript) <export default as RefreshCw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-ssr] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$AudioContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/contexts/AudioContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useZone$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useZone.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/config/zones.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase-database.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useRealtimeComments$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useRealtimeComments.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useRealtimeSongData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useRealtimeSongData.ts [app-ssr] (ecmascript)");
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
function SongDetailModal({ selectedSong, isOpen, onClose, onSongChange, currentFilter = 'heard', songs = [] }) {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('lyrics');
    const [activeHistoryTab, setActiveHistoryTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('lyrics');
    const [isRepeating, setIsRepeating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [currentSongIndex, setCurrentSongIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [categorySongs, setCategorySongs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    // Fullscreen state for lyrics, comments, and solfas
    const [isFullscreenLyrics, setIsFullscreenLyrics] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isFullscreenComments, setIsFullscreenComments] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isFullscreenSolfas, setIsFullscreenSolfas] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isNavigatingToAudioLab, setIsNavigatingToAudioLab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // Get zone context to determine comment terminology
    const { currentZone } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useZone$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useZone"])();
    // Get zone color for theming
    const zoneColor = currentZone?.themeColor || '#9333EA';
    // Helper to darken color for gradients
    const darkenColor = (color, percent)=>{
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    };
    // Helper function to get correct comment terminology based on zone
    const getCommentLabel = ()=>{
        // HQ groups see "Pastor Comments", regular zones see "Coordinator Comments"
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isHQGroup"])(currentZone?.id) ? "Pastor" : "Coordinator";
    };
    // Toggle fullscreen functions
    const toggleFullscreenLyrics = ()=>{
        setIsFullscreenLyrics(!isFullscreenLyrics);
    };
    const toggleFullscreenComments = ()=>{
        setIsFullscreenComments(!isFullscreenComments);
    };
    const toggleFullscreenSolfas = ()=>{
        setIsFullscreenSolfas(!isFullscreenSolfas);
    };
    // State for history audio players
    const [historyAudioStates, setHistoryAudioStates] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const historyAudioRefs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])({});
    const [mainPlayerWasPlaying, setMainPlayerWasPlaying] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // Translation state
    const [isTranslating, setIsTranslating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [translatedContent, setTranslatedContent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const [originalContent, setOriginalContent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    // Text editor state
    const [isEditing, setIsEditing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [editingContent, setEditingContent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [editingField, setEditingField] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    // Collapsible history cards state
    const [expandedHistoryEntries, setExpandedHistoryEntries] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(new Set());
    // Toggle history entry expansion
    const toggleHistoryEntry = (entryId)=>{
        setExpandedHistoryEntries((prev)=>{
            const newSet = new Set(prev);
            if (newSet.has(entryId)) {
                newSet.delete(entryId);
            } else {
                newSet.add(entryId);
            }
            return newSet;
        });
    };
    // History state management (same as EditSongModal)
    const [historyEntries, setHistoryEntries] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isLoadingHistory, setIsLoadingHistory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [historyError, setHistoryError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    // Use global audio context
    const { currentSong, isPlaying, currentTime, duration, isLoading, hasError, togglePlayPause, audioRef, setCurrentSong } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$AudioContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAudio"])();
    // Use the selected song as the base; realtime hook will layer live data on top
    const currentSongData = selectedSong;
    // Set the current song when modal opens (only if it's a different song)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (selectedSong && isOpen) {
            console.log('🎵 SongDetailModal: Checking if song needs to be set:', {
                selectedSongId: selectedSong.id,
                selectedSongTitle: selectedSong.title,
                currentSongId: currentSong?.id,
                currentSongTitle: currentSong?.title,
                isSameSong: currentSong?.id === selectedSong.id,
                audioFile: selectedSong.audioFile,
                hasAudioFile: !!selectedSong.audioFile,
                audioFileLength: selectedSong.audioFile?.length
            });
            // Only set the song if it's different from the current one
            // This prevents restarting the same song when opening the modal
            if (currentSong?.id !== selectedSong.id) {
                console.log('🎵 SongDetailModal: Different song, calling setCurrentSong');
                setCurrentSong(selectedSong, false);
            } else {
                console.log('🎵 SongDetailModal: Same song already playing, skipping audio changes - NO setCurrentSong call');
            }
        }
    }, [
        selectedSong?.title,
        isOpen,
        currentSong?.id
    ]); // Add currentSong?.id to dependencies
    // Load songs from the same category AND current filter, find current song index
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (selectedSong) {
            const songsInCategory = songs.filter((song)=>song.category === selectedSong.category && song.status === currentFilter);
            setCategorySongs(songsInCategory);
            const index = songsInCategory.findIndex((song)=>song.title === selectedSong.title);
            setCurrentSongIndex(index >= 0 ? index : 0);
        }
    }, [
        selectedSong,
        currentFilter,
        songs
    ]);
    // Handle audio ended event for repeat functionality and auto-skip
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const handleAudioEnded = (event)=>{
            console.log('🔄 Audio ended, repeat mode:', isRepeating);
            console.log('🔄 Current song index:', currentSongIndex, 'Total songs:', categorySongs.length);
            console.log('🔄 Event song title:', event.detail.song?.title);
            console.log('🔄 Current song data title:', currentSongData?.title);
            console.log('🔄 Songs match:', event.detail.song?.title === currentSongData?.title);
            // Check if this is the current song (by title or ID)
            const isCurrentSong = event.detail.song?.title === currentSongData?.title || event.detail.song?.id === currentSongData?.id;
            if (isRepeating && isCurrentSong) {
                console.log('🔄 Repeating song:', currentSongData?.title);
                // Restart the current song
                if (audioRef.current) {
                    audioRef.current.currentTime = 0;
                    audioRef.current.play().catch((error)=>{
                        console.error('Error repeating song:', error);
                    });
                }
            } else if (!isRepeating && isCurrentSong) {
                // Auto-skip to next song when not repeating
                console.log('⏭️ Auto-skipping to next song (repeat disabled)');
                if (currentSongIndex < categorySongs.length - 1 && categorySongs.length > 0) {
                    // Go to next song
                    const nextSong = categorySongs[currentSongIndex + 1];
                    console.log('⏭️ Auto-going to next song:', nextSong.title);
                    if (nextSong && onSongChange) {
                        setCurrentSongIndex(currentSongIndex + 1);
                        onSongChange(nextSong);
                        // Set the new song in audio context and auto-play
                        setCurrentSong(nextSong, true);
                    }
                } else {
                    console.log('⏭️ No more songs to skip to, stopping playback');
                    // No more songs, just stop
                    if (audioRef.current) {
                        audioRef.current.pause();
                    }
                }
            }
        };
        window.addEventListener('audioEnded', handleAudioEnded);
        return ()=>{
            window.removeEventListener('audioEnded', handleAudioEnded);
        };
    }, [
        isRepeating,
        currentSongData?.title,
        currentSongIndex,
        categorySongs,
        onSongChange,
        setCurrentSong
    ]);
    const handlePrevious = ()=>{
        console.log('⏮️ Previous clicked:', {
            currentSongIndex,
            categorySongsLength: categorySongs.length,
            onSongChange: !!onSongChange
        });
        if (currentSongIndex > 0 && categorySongs.length > 0) {
            // Go to previous song
            const prevSong = categorySongs[currentSongIndex - 1];
            console.log('⏮️ Going to previous song:', prevSong.title);
            if (prevSong && onSongChange) {
                setCurrentSongIndex(currentSongIndex - 1);
                onSongChange(prevSong);
                // Set the new song in audio context and auto-play
                setCurrentSong(prevSong, true);
            }
        } else if (audioRef.current && duration > 0) {
            // If at first song or no songs, skip back 10 seconds
            const newTime = Math.max(0, audioRef.current.currentTime - 10);
            audioRef.current.currentTime = newTime;
            console.log('⏮️ Skipped back 10 seconds to:', newTime);
        }
    };
    const handleNext = ()=>{
        console.log('⏭️ Next clicked:', {
            currentSongIndex,
            categorySongsLength: categorySongs.length,
            onSongChange: !!onSongChange
        });
        if (currentSongIndex < categorySongs.length - 1 && categorySongs.length > 0) {
            // Go to next song
            const nextSong = categorySongs[currentSongIndex + 1];
            console.log('⏭️ Going to next song:', nextSong.title);
            if (nextSong && onSongChange) {
                setCurrentSongIndex(currentSongIndex + 1);
                onSongChange(nextSong);
                // Set the new song in audio context and auto-play
                setCurrentSong(nextSong, true);
            }
        } else if (audioRef.current && duration > 0) {
            // If at last song or no songs, skip forward 10 seconds
            const newTime = Math.min(duration, audioRef.current.currentTime + 10);
            audioRef.current.currentTime = newTime;
            console.log('⏭️ Skipped forward 10 seconds to:', newTime);
        }
    };
    const toggleRepeat = ()=>{
        const newRepeatState = !isRepeating;
        setIsRepeating(newRepeatState);
        console.log('🔄 Repeat toggled:', newRepeatState ? 'ON' : 'OFF');
        console.log('🔄 Repeat state changed from', isRepeating, 'to', newRepeatState);
    };
    const handleMusicPage = ()=>{
        // Navigate to AudioLab library with song title to auto-expand
        if (currentSongData?.title) {
            setIsNavigatingToAudioLab(true);
            // Use encodeURIComponent to handle special characters in song titles
            router.push(`/pages/audiolab?song=${encodeURIComponent(currentSongData.title)}`);
            onClose();
        }
    };
    // History audio player functions
    const handleHistoryAudioPlayPause = (audioId)=>{
        const historyAudioRef = historyAudioRefs.current[audioId];
        if (!historyAudioRef) return;
        // Pause all other history audios
        Object.keys(historyAudioRefs.current).forEach((id)=>{
            if (id !== audioId && historyAudioRefs.current[id]) {
                historyAudioRefs.current[id].pause();
                setHistoryAudioStates((prev)=>({
                        ...prev,
                        [id]: {
                            ...prev[id],
                            isPlaying: false
                        }
                    }));
            }
        });
        if (historyAudioStates[audioId]?.isPlaying) {
            // Pause current history audio
            historyAudioRef.pause();
            setHistoryAudioStates((prev)=>({
                    ...prev,
                    [audioId]: {
                        ...prev[audioId],
                        isPlaying: false
                    }
                }));
            // Resume main player if it was playing before
            if (mainPlayerWasPlaying) {
                togglePlayPause();
                setMainPlayerWasPlaying(false);
            }
        } else {
            // Play current history audio - pause main player if it's playing
            if (isPlaying) {
                setMainPlayerWasPlaying(true);
                togglePlayPause(); // This will pause the main player
            }
            historyAudioRef.play(); // Play the history audio element, not the main one
            setHistoryAudioStates((prev)=>({
                    ...prev,
                    [audioId]: {
                        ...prev[audioId],
                        isPlaying: true
                    }
                }));
        }
    };
    const handleHistoryAudioTimeUpdate = (audioId)=>{
        const audioElement = historyAudioRefs.current[audioId];
        if (audioElement) {
            setHistoryAudioStates((prev)=>({
                    ...prev,
                    [audioId]: {
                        ...prev[audioId],
                        currentTime: audioElement.currentTime
                    }
                }));
        }
    };
    const handleHistoryAudioLoadedMetadata = (audioId)=>{
        const audioElement = historyAudioRefs.current[audioId];
        if (audioElement) {
            setHistoryAudioStates((prev)=>({
                    ...prev,
                    [audioId]: {
                        ...prev[audioId],
                        duration: audioElement.duration
                    }
                }));
        }
    };
    const handleHistoryAudioEnded = (audioId)=>{
        setHistoryAudioStates((prev)=>({
                ...prev,
                [audioId]: {
                    ...prev[audioId],
                    isPlaying: false,
                    currentTime: 0
                }
            }));
        // Resume main player if it was playing before
        if (mainPlayerWasPlaying) {
            togglePlayPause();
            setMainPlayerWasPlaying(false);
        }
    };
    const formatDateTime = (dateInput)=>{
        let date;
        // Handle different Firebase date formats
        if (dateInput && typeof dateInput === 'object') {
            // Firestore Timestamp object
            if (dateInput.toDate && typeof dateInput.toDate === 'function') {
                date = dateInput.toDate();
            } else if (dateInput.seconds) {
                date = new Date(dateInput.seconds * 1000);
            } else if (dateInput instanceof Date) {
                date = dateInput;
            } else {
                date = new Date(dateInput);
            }
        } else if (dateInput) {
            date = new Date(dateInput);
        } else {
            date = new Date();
        }
        // Check if date is valid
        if (isNaN(date.getTime())) {
            return {
                date: 'Invalid Date',
                time: ''
            };
        }
        return {
            date: date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            }),
            time: date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            })
        };
    };
    // History loading is now handled by the loadHistoryEntries function (same as EditSongModal)
    // Use real-time comments hook (no cache)
    const { comments: realtimeComments, loading: isLoadingComments, error: commentsError, refreshComments } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useRealtimeComments$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRealtimeComments"])({
        songId: currentSongData?.id?.toString() || null,
        enabled: isOpen && activeHistoryTab === 'comments'
    });
    // Use real-time song data hook (no cache)
    const { songData: realtimeSongData, loading: isLoadingSongData, error: songDataError, refreshSongData } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useRealtimeSongData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRealtimeSongData"])({
        songId: currentSongData?.id?.toString() || null,
        enabled: isOpen,
        zoneId: currentZone?.id || null
    });
    // Single source of truth for what the UI should display (realtime → fresh → initial)
    const displayedSongData = realtimeSongData || currentSongData;
    // Load history entries for the current song (same as EditSongModal)
    const loadHistoryEntries = async ()=>{
        if (!currentSongData?.id) {
            setHistoryEntries([]);
            setIsLoadingHistory(false);
            return;
        }
        try {
            // Check if Firebase is configured
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            setIsLoadingHistory(true);
            setHistoryError(null);
            console.log('🔍 Loading history for song:', {
                songId: currentSongData.id,
                songIdType: typeof currentSongData.id,
                songIdString: currentSongData.id.toString()
            });
            const data = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].getHistoryBySongId(currentSongData.id.toString());
            console.log('📝 History data received:', data);
            // Transform Firebase data to match HistoryEntry interface
            const transformedData = (data || []).map((entry)=>({
                    id: entry.id,
                    type: entry.type,
                    title: entry.title,
                    description: entry.description || '',
                    old_value: entry.old_value || '',
                    new_value: entry.new_value || '',
                    created_by: entry.created_by || '',
                    date: entry.created_at || entry.date || new Date().toISOString(),
                    version: entry.title || ''
                }));
            setHistoryEntries(transformedData);
        } catch (error) {
            console.error('Error loading history entries:', error);
            setHistoryError('Failed to load history');
            setHistoryEntries([]);
        } finally{
            setIsLoadingHistory(false);
        }
    };
    // Load history when song changes (same as EditSongModal)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (currentSongData?.id && isOpen) {
            loadHistoryEntries();
        } else {
            setHistoryEntries([]);
        }
    }, [
        currentSongData?.id,
        isOpen
    ]);
    // Listen for history updates from EditSongModal (same as EditSongModal pattern)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const handleHistoryUpdate = ()=>{
            console.log('History update event received, refreshing history...');
            // Add a small delay to ensure Firebase has processed the update
            // This ensures we get the latest data, not cached data
            setTimeout(()=>{
                loadHistoryEntries();
            }, 300);
        };
        window.addEventListener('historyUpdated', handleHistoryUpdate);
        return ()=>{
            window.removeEventListener('historyUpdated', handleHistoryUpdate);
        };
    }, [
        currentSongData?.id,
        isOpen
    ]);
    // Get history data for the current song using local state (same as EditSongModal)
    const getHistoryData = (type)=>{
        return historyEntries.filter((entry)=>entry.type === type);
    };
    // Get latest content (what's shown in main tabs) - uses real-time data
    const getLatestContent = (type)=>{
        // Use real-time song data if available, otherwise fallback to selectedSong
        const currentSong = realtimeSongData || selectedSong;
        if (!currentSong) return null;
        switch(type){
            case 'lyrics':
                return currentSong.lyrics;
            case 'solfas':
                return currentSong.solfas;
            case 'audio':
                return currentSong.audioFile;
            case 'comments':
                // Use real-time comments for latest content
                const commentAuthor = getCommentLabel();
                if (realtimeComments && realtimeComments.length > 0) {
                    return realtimeComments.filter((comment)=>comment.author === commentAuthor || comment.author === 'Coordinator' || comment.author === 'Pastor').sort((a, b)=>new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                }
                // Fallback to current song comments
                return currentSong.comments.filter((comment)=>comment.author === commentAuthor || comment.author === 'Coordinator' || comment.author === 'Pastor').sort((a, b)=>new Date(b.date).getTime() - new Date(a.date).getTime())[0];
            default:
                return null;
        }
    };
    // Get older comments for history (all except the latest)
    const getOlderComments = ()=>{
        const commentAuthor = getCommentLabel();
        // Use real-time comments if available
        if (realtimeComments && realtimeComments.length > 0) {
            const coordinatorComments = realtimeComments.filter((comment)=>comment.author === commentAuthor || comment.author === 'Coordinator' || comment.author === 'Pastor').sort((a, b)=>new Date(b.date).getTime() - new Date(a.date).getTime());
            // Return all except the latest (which is shown in main tab)
            return coordinatorComments.slice(1);
        }
        // Fallback to real-time song data or selectedSong comments
        const currentSong = realtimeSongData || selectedSong;
        if (!currentSong || !Array.isArray(currentSong.comments)) return [];
        const coordinatorComments = currentSong.comments.filter((comment)=>comment.author === commentAuthor || comment.author === 'Coordinator' || comment.author === 'Pastor').sort((a, b)=>new Date(b.date).getTime() - new Date(a.date).getTime());
        // Return all except the first one (which is the latest)
        return coordinatorComments.slice(1);
    };
    // Get older solfas for history (all except the latest)
    const getOlderSolfas = ()=>{
        // Use real-time song data if available
        const currentSong = realtimeSongData || currentSongData;
        if (!currentSong?.solfas) return [];
        // For now, we only have current solfas, but this function is ready for when we have multiple versions
        // In the future, this would work like comments - showing previous versions
        return [];
    };
    const formatTime = (time)=>{
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };
    const [isDragging, setIsDragging] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [wasPlayingBeforeDrag, setWasPlayingBeforeDrag] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const seekToTime = (newTime)=>{
        if (audioRef.current && duration > 0) {
            const clampedTime = Math.max(0, Math.min(duration, newTime));
            // Ensure the audio is loaded before seeking
            if (audioRef.current.readyState >= 2) {
                audioRef.current.currentTime = clampedTime;
                console.log('🎯 Seeked to:', clampedTime, 'seconds');
            } else {
                // Wait for audio to be ready then seek
                const handleCanPlay = ()=>{
                    if (audioRef.current) {
                        audioRef.current.currentTime = clampedTime;
                        audioRef.current.removeEventListener('canplay', handleCanPlay);
                        console.log('🎯 Seeked to (after load):', clampedTime, 'seconds');
                    }
                };
                audioRef.current.addEventListener('canplay', handleCanPlay);
            }
        }
    };
    // 10-second skip functions
    const skipBackward10 = ()=>{
        if (audioRef.current && duration > 0) {
            const newTime = Math.max(0, currentTime - 10);
            seekToTime(newTime);
            console.log('⏪ Skipped backward 10 seconds to:', newTime);
        }
    };
    const skipForward10 = ()=>{
        if (audioRef.current && duration > 0) {
            const newTime = Math.min(duration, currentTime + 10);
            seekToTime(newTime);
            console.log('⏩ Skipped forward 10 seconds to:', newTime);
        }
    };
    const getTimeFromMouseEvent = (e)=>{
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, clickX / rect.width));
        return percentage * duration;
    };
    const handleProgressClick = (e)=>{
        if (!isDragging && audioRef.current && duration > 0) {
            const newTime = getTimeFromMouseEvent(e);
            seekToTime(newTime);
        }
    };
    const handleProgressMouseDown = (e)=>{
        e.preventDefault();
        setIsDragging(true);
        setWasPlayingBeforeDrag(isPlaying);
        // Pause during drag for smoother seeking
        if (isPlaying && audioRef.current) {
            audioRef.current.pause();
        }
        const newTime = getTimeFromMouseEvent(e);
        seekToTime(newTime);
        console.log('🎯 Started dragging at:', newTime, 'seconds');
    };
    const handleProgressMouseMove = (e)=>{
        if (isDragging && audioRef.current && duration > 0) {
            const newTime = getTimeFromMouseEvent(e);
            seekToTime(newTime);
        }
    };
    const handleProgressMouseUp = ()=>{
        if (isDragging) {
            setIsDragging(false);
            // Resume playing if it was playing before drag
            if (wasPlayingBeforeDrag && audioRef.current) {
                audioRef.current.play().catch((error)=>{
                    console.error('Error resuming after drag:', error);
                });
            }
            console.log('🎯 Finished dragging');
        }
    };
    // Add global mouse events for dragging
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const handleGlobalMouseMove = (e)=>{
            if (isDragging && audioRef.current && duration > 0) {
                // Find the progress bar element
                const progressBar = document.querySelector('.progress-bar');
                if (progressBar) {
                    const rect = progressBar.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
                    const newTime = percentage * duration;
                    seekToTime(newTime);
                }
            }
        };
        const handleGlobalMouseUp = ()=>{
            if (isDragging) {
                setIsDragging(false);
                // Resume playing if it was playing before drag
                if (wasPlayingBeforeDrag && audioRef.current) {
                    audioRef.current.play().catch((error)=>{
                        console.error('Error resuming after drag:', error);
                    });
                }
            }
        };
        if (isDragging) {
            document.addEventListener('mousemove', handleGlobalMouseMove);
            document.addEventListener('mouseup', handleGlobalMouseUp);
            return ()=>{
                document.removeEventListener('mousemove', handleGlobalMouseMove);
                document.removeEventListener('mouseup', handleGlobalMouseUp);
            };
        }
    }, [
        isDragging,
        duration,
        wasPlayingBeforeDrag
    ]);
    // Listen for history updates from EditSongModal (same as EditSongModal pattern)
    if (!isOpen || !selectedSong) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                children: `
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `
            }, void 0, false, {
                fileName: "[project]/src/components/SongDetailModal.tsx",
                lineNumber: 720,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 bg-white z-[100] flex flex-col",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mx-auto max-w-2xl w-full h-full flex flex-col",
                    children: isFullscreenLyrics && activeTab === 'lyrics' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "fixed inset-0 bg-white z-[100] flex flex-col",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center space-x-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: toggleFullscreenLyrics,
                                            className: "p-2 rounded-full hover:bg-gray-100 transition-colors",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$minimize$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Minimize2$3e$__["Minimize2"], {
                                                className: "w-5 h-5 text-gray-600"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                                lineNumber: 743,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/SongDetailModal.tsx",
                                            lineNumber: 739,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                    className: "text-lg font-semibold text-gray-900",
                                                    children: currentSongData?.title
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                    lineNumber: 746,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm text-gray-500",
                                                    children: currentSongData?.writer
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                    lineNumber: 747,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/SongDetailModal.tsx",
                                            lineNumber: 745,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                    lineNumber: 738,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                lineNumber: 737,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1 overflow-y-auto -webkit-overflow-scrolling-touch p-6",
                                style: {
                                    height: 'calc(100vh - 80px)'
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "max-w-4xl mx-auto",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-gray-900 leading-relaxed space-y-6 text-base text-left font-poppins",
                                        children: currentSongData?.lyrics ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            dangerouslySetInnerHTML: {
                                                __html: currentSongData.lyrics
                                            },
                                            className: "prose prose-lg max-w-none"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/SongDetailModal.tsx",
                                            lineNumber: 760,
                                            columnNumber: 21
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-center py-12",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__["BookOpen"], {
                                                    className: "w-16 h-16 text-gray-300 mx-auto mb-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                    lineNumber: 766,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-gray-500 text-lg",
                                                    children: "No lyrics available"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                    lineNumber: 767,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/SongDetailModal.tsx",
                                            lineNumber: 765,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                        lineNumber: 758,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                    lineNumber: 757,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                lineNumber: 756,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/SongDetailModal.tsx",
                        lineNumber: 735,
                        columnNumber: 11
                    }, this) : isFullscreenComments && activeTab === 'comments' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "fixed inset-0 bg-white z-[100] flex flex-col",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center space-x-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: toggleFullscreenComments,
                                            className: "p-2 rounded-full hover:bg-gray-100 transition-colors",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$minimize$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Minimize2$3e$__["Minimize2"], {
                                                className: "w-5 h-5 text-gray-600"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                                lineNumber: 783,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/SongDetailModal.tsx",
                                            lineNumber: 779,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                    className: "text-lg font-semibold text-gray-900",
                                                    children: currentSongData?.title
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                    lineNumber: 786,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm text-gray-500",
                                                    children: "Comments"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                    lineNumber: 787,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/SongDetailModal.tsx",
                                            lineNumber: 785,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                    lineNumber: 778,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                lineNumber: 777,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1 overflow-y-auto -webkit-overflow-scrolling-touch p-6",
                                style: {
                                    height: 'calc(100vh - 80px)'
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "max-w-4xl mx-auto",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-gray-900 leading-relaxed space-y-6 text-base text-left font-poppins",
                                        children: !currentSongData?.comments || !Array.isArray(currentSongData.comments) || currentSongData.comments.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-center py-12",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                                    className: "w-16 h-16 text-gray-300 mx-auto mb-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                    lineNumber: 798,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-gray-500 text-lg",
                                                    children: "No comments available"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                    lineNumber: 799,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/SongDetailModal.tsx",
                                            lineNumber: 797,
                                            columnNumber: 21
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "space-y-6",
                                            children: (Array.isArray(currentSongData.comments) ? currentSongData.comments : []).map((comment)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "border-b border-gray-200 pb-6 last:border-b-0",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-gray-900 leading-relaxed mb-3 text-base whitespace-pre-wrap",
                                                            children: comment.text?.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/SongDetailModal.tsx",
                                                            lineNumber: 805,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center gap-2 text-sm text-gray-500",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "font-medium",
                                                                    children: comment.author
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                    lineNumber: 807,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    children: "•"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                    lineNumber: 808,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    children: new Date(comment.date).toLocaleDateString('en-US', {
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                        year: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                    lineNumber: 809,
                                                                    columnNumber: 29
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/SongDetailModal.tsx",
                                                            lineNumber: 806,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, comment.id, true, {
                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                    lineNumber: 804,
                                                    columnNumber: 25
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/SongDetailModal.tsx",
                                            lineNumber: 802,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                        lineNumber: 795,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                    lineNumber: 794,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                lineNumber: 793,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/SongDetailModal.tsx",
                        lineNumber: 775,
                        columnNumber: 11
                    }, this) : isFullscreenSolfas && activeTab === 'solfas' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "fixed inset-0 bg-white z-[100] flex flex-col",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center space-x-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: toggleFullscreenSolfas,
                                            className: "p-2 rounded-full hover:bg-gray-100 transition-colors",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$minimize$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Minimize2$3e$__["Minimize2"], {
                                                className: "w-5 h-5 text-gray-600"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                                lineNumber: 836,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/SongDetailModal.tsx",
                                            lineNumber: 832,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                    className: "text-lg font-semibold text-gray-900",
                                                    children: currentSongData?.title
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                    lineNumber: 839,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm text-gray-500",
                                                    children: "Conductor's Guide"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                    lineNumber: 840,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/SongDetailModal.tsx",
                                            lineNumber: 838,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                    lineNumber: 831,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                lineNumber: 830,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1 overflow-y-auto -webkit-overflow-scrolling-touch p-6",
                                style: {
                                    height: 'calc(100vh - 80px)'
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "max-w-4xl mx-auto",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-gray-900 leading-relaxed space-y-6 text-base text-left font-poppins",
                                        children: currentSongData?.solfas && currentSongData.solfas.trim() !== '' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            dangerouslySetInnerHTML: {
                                                __html: currentSongData.solfas
                                            },
                                            className: "prose prose-lg max-w-none",
                                            style: {
                                                fontFamily: 'monospace',
                                                fontStyle: 'italic'
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/SongDetailModal.tsx",
                                            lineNumber: 850,
                                            columnNumber: 21
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-center py-12",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$music$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Music$3e$__["Music"], {
                                                    className: "w-16 h-16 text-gray-300 mx-auto mb-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                    lineNumber: 860,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-gray-500 text-lg",
                                                    children: "No conductor's guide available"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                    lineNumber: 861,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/SongDetailModal.tsx",
                                            lineNumber: 859,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                        lineNumber: 848,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                    lineNumber: 847,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                lineNumber: 846,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/SongDetailModal.tsx",
                        lineNumber: 828,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-center pt-2 pb-1 flex-shrink-0",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    onClick: onClose,
                                    className: "w-8 h-0.5 bg-gray-400 rounded-full cursor-pointer touch-optimized"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                    lineNumber: 874,
                                    columnNumber: 11
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                lineNumber: 873,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative bg-white/80 backdrop-blur-xl px-6 py-4 border-b border-white/30 overflow-hidden flex-shrink-0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute inset-0 bg-cover bg-center bg-no-repeat",
                                        style: {
                                            backgroundImage: `url('/images/DSC_6155_scaled.jpg')`,
                                            filter: 'blur(8px)',
                                            transform: 'scale(1.1)'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                        lineNumber: 883,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "absolute inset-0 bg-black/40"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                        lineNumber: 892,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "relative z-10",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center mb-3",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: onClose,
                                                    className: "w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                                                        className: "w-5 h-5 text-white"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                        lineNumber: 902,
                                                        columnNumber: 15
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                    lineNumber: 898,
                                                    columnNumber: 13
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                                lineNumber: 897,
                                                columnNumber: 11
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center space-x-4 mb-3",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex-1 min-w-0",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                                            className: "text-white text-xl font-black text-center mb-4 font-poppins uppercase",
                                                            children: displayedSongData?.title
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/SongDetailModal.tsx",
                                                            lineNumber: 911,
                                                            columnNumber: 15
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-white text-sm space-y-1 font-poppins",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "border-b border-white/30 pb-1",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "font-semibold uppercase",
                                                                            children: "LEAD SINGER:"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                            lineNumber: 914,
                                                                            columnNumber: 19
                                                                        }, this),
                                                                        " ",
                                                                        displayedSongData?.leadSinger ? displayedSongData.leadSinger.split(',')[0].trim() : 'Unknown'
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                    lineNumber: 913,
                                                                    columnNumber: 17
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "flex justify-between items-center border-b border-white/30 pb-1 mb-1",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "font-semibold uppercase",
                                                                                    children: "WRITER:"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                    lineNumber: 917,
                                                                                    columnNumber: 25
                                                                                }, this),
                                                                                " ",
                                                                                displayedSongData?.writer || ''
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                            lineNumber: 917,
                                                                            columnNumber: 19
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "font-bold",
                                                                            children: [
                                                                                "x",
                                                                                displayedSongData?.rehearsalCount ?? 0
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                            lineNumber: 918,
                                                                            columnNumber: 19
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                    lineNumber: 916,
                                                                    columnNumber: 17
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "flex justify-between items-center border-b border-white/30 pb-1 mb-1",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "font-semibold uppercase",
                                                                                    children: "CONDUCTOR:"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                    lineNumber: 921,
                                                                                    columnNumber: 25
                                                                                }, this),
                                                                                " ",
                                                                                displayedSongData?.conductor || ''
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                            lineNumber: 921,
                                                                            columnNumber: 19
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "font-semibold uppercase",
                                                                                    children: "KEY:"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                    lineNumber: 922,
                                                                                    columnNumber: 25
                                                                                }, this),
                                                                                " ",
                                                                                displayedSongData?.key || ''
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                            lineNumber: 922,
                                                                            columnNumber: 19
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                    lineNumber: 920,
                                                                    columnNumber: 17
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "flex justify-between items-center border-b border-white/30 pb-1 mb-1",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "font-semibold uppercase",
                                                                                    children: "LEAD KEYBOARDIST:"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                    lineNumber: 925,
                                                                                    columnNumber: 25
                                                                                }, this),
                                                                                " ",
                                                                                displayedSongData?.leadKeyboardist || ''
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                            lineNumber: 925,
                                                                            columnNumber: 19
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "font-semibold uppercase",
                                                                                    children: "TEMPO:"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                    lineNumber: 926,
                                                                                    columnNumber: 25
                                                                                }, this),
                                                                                " ",
                                                                                displayedSongData?.tempo || ''
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                            lineNumber: 926,
                                                                            columnNumber: 19
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                    lineNumber: 924,
                                                                    columnNumber: 17
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "flex justify-between items-center border-b border-white/30 pb-1 mb-1",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "font-semibold uppercase",
                                                                                    children: "DRUMMER:"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                    lineNumber: 929,
                                                                                    columnNumber: 25
                                                                                }, this),
                                                                                " ",
                                                                                displayedSongData?.drummer || ''
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                            lineNumber: 929,
                                                                            columnNumber: 19
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "font-semibold uppercase",
                                                                                    children: "BASS GUITARIST:"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                    lineNumber: 930,
                                                                                    columnNumber: 25
                                                                                }, this),
                                                                                " ",
                                                                                displayedSongData?.leadGuitarist || ''
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                            lineNumber: 930,
                                                                            columnNumber: 19
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                    lineNumber: 928,
                                                                    columnNumber: 17
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/SongDetailModal.tsx",
                                                            lineNumber: 912,
                                                            columnNumber: 15
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                    lineNumber: 910,
                                                    columnNumber: 11
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                                lineNumber: 908,
                                                columnNumber: 11
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex justify-center items-center space-x-8 pt-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>setActiveTab('lyrics'),
                                                        className: "flex flex-col items-center space-y-1 transition-all duration-200 text-white hover:text-white",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: `w-8 h-8 flex items-center justify-center rounded-full ${activeTab === 'lyrics' ? 'bg-white text-black' : 'text-white hover:bg-white/20'}`,
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__["BookOpen"], {
                                                                    className: "w-4 h-4"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                    lineNumber: 947,
                                                                    columnNumber: 17
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                lineNumber: 942,
                                                                columnNumber: 15
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-xs font-medium",
                                                                children: "Lyrics"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                lineNumber: 949,
                                                                columnNumber: 15
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                        lineNumber: 938,
                                                        columnNumber: 13
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>setActiveTab('solfas'),
                                                        className: "flex flex-col items-center space-y-1 transition-all duration-200 text-white hover:text-white",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: `w-8 h-8 flex items-center justify-center rounded-full ${activeTab === 'solfas' ? 'bg-white text-black' : 'text-white hover:bg-white/20'}`,
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$music$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Music$3e$__["Music"], {
                                                                    className: "w-4 h-4"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                    lineNumber: 960,
                                                                    columnNumber: 17
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                lineNumber: 955,
                                                                columnNumber: 15
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-xs font-medium",
                                                                children: "Conductor's Guide"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                lineNumber: 962,
                                                                columnNumber: 15
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                        lineNumber: 951,
                                                        columnNumber: 13
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>setActiveTab('comments'),
                                                        className: "flex flex-col items-center space-y-1 transition-all duration-200 text-white hover:text-white",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: `w-8 h-8 flex items-center justify-center rounded-full ${activeTab === 'comments' ? 'bg-white text-black' : 'text-white hover:bg-white/20'}`,
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                                                    className: "w-4 h-4"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                    lineNumber: 973,
                                                                    columnNumber: 17
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                lineNumber: 968,
                                                                columnNumber: 15
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-xs font-medium",
                                                                children: "Comments"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                lineNumber: 975,
                                                                columnNumber: 15
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                        lineNumber: 964,
                                                        columnNumber: 13
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>setActiveTab('history'),
                                                        className: "flex flex-col items-center space-y-1 transition-all duration-200 text-white hover:text-white",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: `w-8 h-8 flex items-center justify-center rounded-full ${activeTab === 'history' ? 'bg-white text-black' : 'text-white hover:bg-white/20'}`,
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                                                                    className: "w-4 h-4"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                    lineNumber: 986,
                                                                    columnNumber: 17
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                lineNumber: 981,
                                                                columnNumber: 15
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-xs font-medium",
                                                                children: "History"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                lineNumber: 988,
                                                                columnNumber: 15
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                        lineNumber: 977,
                                                        columnNumber: 13
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                                lineNumber: 937,
                                                columnNumber: 11
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                        lineNumber: 895,
                                        columnNumber: 11
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                lineNumber: 881,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1 px-6 py-4 overflow-y-auto",
                                style: {
                                    paddingBottom: '180px'
                                },
                                children: [
                                    activeTab === 'lyrics' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "max-w-none",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-gray-900 leading-relaxed space-y-6 text-sm text-left font-poppins",
                                            children: displayedSongData?.lyrics ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                dangerouslySetInnerHTML: {
                                                    __html: displayedSongData.lyrics
                                                },
                                                dir: "ltr",
                                                style: {
                                                    lineHeight: '1.8',
                                                    fontSize: '14px',
                                                    textAlign: 'left',
                                                    direction: 'ltr'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                                lineNumber: 1000,
                                                columnNumber: 19
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-center py-8",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-gray-500 text-sm mb-2",
                                                        children: "No Lyrics Available"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                        lineNumber: 1012,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-gray-400 text-xs",
                                                        children: "Lyrics will be displayed here when available"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                        lineNumber: 1013,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                                lineNumber: 1011,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/SongDetailModal.tsx",
                                            lineNumber: 998,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                        lineNumber: 997,
                                        columnNumber: 13
                                    }, this),
                                    activeTab === 'solfas' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "max-w-none",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-gray-900 leading-relaxed space-y-6 text-sm text-left font-poppins",
                                            children: displayedSongData?.solfas && displayedSongData.solfas.trim() !== '' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                dangerouslySetInnerHTML: {
                                                    __html: displayedSongData.solfas
                                                },
                                                dir: "ltr",
                                                style: {
                                                    lineHeight: '1.8',
                                                    fontSize: '14px',
                                                    fontFamily: 'monospace',
                                                    fontStyle: 'italic',
                                                    textAlign: 'left',
                                                    direction: 'ltr'
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                                lineNumber: 1024,
                                                columnNumber: 19
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-center py-8",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-gray-500 text-sm mb-2",
                                                        children: "No Conductor's Guide Available"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                        lineNumber: 1038,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-gray-400 text-xs",
                                                        children: "Conductor's guide notation will be displayed here when available"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                        lineNumber: 1039,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                                lineNumber: 1037,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/SongDetailModal.tsx",
                                            lineNumber: 1022,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                        lineNumber: 1021,
                                        columnNumber: 13
                                    }, this),
                                    activeTab === 'comments' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "max-w-none",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-gray-900 leading-relaxed space-y-6 text-sm text-left font-poppins",
                                            children: !displayedSongData?.comments || !Array.isArray(displayedSongData.comments) || displayedSongData.comments.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-center py-8",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-gray-500 text-sm mb-2",
                                                        children: "No Comments Available"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                        lineNumber: 1051,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-gray-400 text-xs",
                                                        children: "Comments will be displayed here when available"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                        lineNumber: 1052,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                                lineNumber: 1050,
                                                columnNumber: 19
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-4",
                                                children: (Array.isArray(displayedSongData.comments) ? displayedSongData.comments : []).map((comment)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "border-b border-gray-200 pb-4 last:border-b-0",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-gray-900 leading-relaxed mb-2 whitespace-pre-wrap",
                                                                children: comment.text?.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                lineNumber: 1058,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-center gap-2 text-xs text-gray-500",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "font-medium",
                                                                        children: comment.author
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                        lineNumber: 1060,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        children: "•"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                        lineNumber: 1061,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        children: new Date(comment.date).toLocaleDateString('en-US', {
                                                                            month: 'short',
                                                                            day: 'numeric',
                                                                            year: 'numeric',
                                                                            hour: '2-digit',
                                                                            minute: '2-digit'
                                                                        })
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                        lineNumber: 1062,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                lineNumber: 1059,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, comment.id, true, {
                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                        lineNumber: 1057,
                                                        columnNumber: 23
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                                lineNumber: 1055,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/SongDetailModal.tsx",
                                            lineNumber: 1048,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                        lineNumber: 1047,
                                        columnNumber: 13
                                    }, this),
                                    activeTab === 'history' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex gap-1 overflow-x-auto pb-2 scrollbar-hide",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>setActiveHistoryTab('lyrics'),
                                                        className: `flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${activeHistoryTab === 'lyrics' ? 'text-white shadow-md' : 'bg-white/70 backdrop-blur-sm text-slate-700 hover:bg-white/90 hover:shadow-sm border border-slate-200/50'}`,
                                                        style: activeHistoryTab === 'lyrics' ? {
                                                            backgroundColor: zoneColor
                                                        } : {},
                                                        children: "Lyrics"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                        lineNumber: 1084,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>setActiveHistoryTab('audio'),
                                                        className: `flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${activeHistoryTab === 'audio' ? 'text-white shadow-md' : 'bg-white/70 backdrop-blur-sm text-slate-700 hover:bg-white/90 hover:shadow-sm border border-slate-200/50'}`,
                                                        style: activeHistoryTab === 'audio' ? {
                                                            backgroundColor: zoneColor
                                                        } : {},
                                                        children: "Audio"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                        lineNumber: 1095,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>setActiveHistoryTab('solfas'),
                                                        className: `flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${activeHistoryTab === 'solfas' ? 'text-white shadow-md' : 'bg-white/70 backdrop-blur-sm text-slate-700 hover:bg-white/90 hover:shadow-sm border border-slate-200/50'}`,
                                                        style: activeHistoryTab === 'solfas' ? {
                                                            backgroundColor: zoneColor
                                                        } : {},
                                                        children: "Conductor's Guide"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                        lineNumber: 1106,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>setActiveHistoryTab('comments'),
                                                        className: `flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${activeHistoryTab === 'comments' ? 'text-white shadow-md' : 'bg-white/70 backdrop-blur-sm text-slate-700 hover:bg-white/90 hover:shadow-sm border border-slate-200/50'}`,
                                                        style: activeHistoryTab === 'comments' ? {
                                                            backgroundColor: zoneColor
                                                        } : {},
                                                        children: [
                                                            getCommentLabel(),
                                                            "'s Comments"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                        lineNumber: 1117,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>setActiveHistoryTab('metadata'),
                                                        className: `flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${activeHistoryTab === 'metadata' ? 'text-white shadow-md' : 'bg-white/70 backdrop-blur-sm text-slate-700 hover:bg-white/90 hover:shadow-sm border border-slate-200/50'}`,
                                                        style: activeHistoryTab === 'metadata' ? {
                                                            backgroundColor: zoneColor
                                                        } : {},
                                                        children: "Song Details"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                        lineNumber: 1128,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                                lineNumber: 1083,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "min-h-[200px]",
                                                children: [
                                                    activeHistoryTab === 'lyrics' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "space-y-4",
                                                        children: isLoadingHistory ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-center py-8",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                    lineNumber: 1147,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-gray-500 text-sm",
                                                                    children: "Loading lyrics history..."
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                    lineNumber: 1148,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/SongDetailModal.tsx",
                                                            lineNumber: 1146,
                                                            columnNumber: 23
                                                        }, this) : getHistoryData('lyrics').length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-center py-8",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__["BookOpen"], {
                                                                    className: "w-12 h-12 text-gray-300 mx-auto mb-4"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                    lineNumber: 1152,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-gray-500 text-sm font-medium",
                                                                    children: "No Lyrics History"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                    lineNumber: 1153,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-gray-400 text-xs mt-1",
                                                                    children: "Changes will appear here"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                    lineNumber: 1154,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    onClick: ()=>loadHistoryEntries(),
                                                                    className: "mt-4 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700",
                                                                    title: "Refresh history",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                                                        className: "w-4 h-4"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                        lineNumber: 1160,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                    lineNumber: 1155,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/SongDetailModal.tsx",
                                                            lineNumber: 1151,
                                                            columnNumber: 23
                                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "space-y-4",
                                                            children: getHistoryData('lyrics').map((entry)=>{
                                                                const isExpanded = expandedHistoryEntries.has(entry.id);
                                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "bg-white/70 backdrop-blur-sm rounded-lg border border-slate-200/50 overflow-hidden",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "p-4 cursor-pointer hover:bg-white/80 transition-colors",
                                                                            onClick: ()=>toggleHistoryEntry(entry.id),
                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "flex items-start gap-3",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                                                                                        style: {
                                                                                            background: `linear-gradient(to right, ${zoneColor}, ${darkenColor(zoneColor, 10)})`
                                                                                        },
                                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__["BookOpen"], {
                                                                                            className: "w-4 h-4 text-white"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                            lineNumber: 1180,
                                                                                            columnNumber: 33
                                                                                        }, this)
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                        lineNumber: 1174,
                                                                                        columnNumber: 31
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "flex-1",
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                className: "flex items-center gap-2 mb-2",
                                                                                                children: [
                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                        className: "px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full",
                                                                                                        children: entry.type
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                                        lineNumber: 1184,
                                                                                                        columnNumber: 35
                                                                                                    }, this),
                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                        className: "text-xs text-slate-500",
                                                                                                        children: [
                                                                                                            formatDateTime(entry.date).date,
                                                                                                            " at ",
                                                                                                            formatDateTime(entry.date).time
                                                                                                        ]
                                                                                                    }, void 0, true, {
                                                                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                                        lineNumber: 1187,
                                                                                                        columnNumber: 35
                                                                                                    }, this)
                                                                                                ]
                                                                                            }, void 0, true, {
                                                                                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                                lineNumber: 1183,
                                                                                                columnNumber: 33
                                                                                            }, this),
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                className: "flex items-center justify-between",
                                                                                                children: [
                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                                                        className: "font-medium text-slate-900",
                                                                                                        children: entry.title
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                                        lineNumber: 1192,
                                                                                                        columnNumber: 39
                                                                                                    }, this),
                                                                                                    isExpanded ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronUp$3e$__["ChevronUp"], {
                                                                                                        className: "w-5 h-5 text-slate-400 flex-shrink-0"
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                                        lineNumber: 1194,
                                                                                                        columnNumber: 41
                                                                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                                                                                        className: "w-5 h-5 text-slate-400 flex-shrink-0"
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                                        lineNumber: 1196,
                                                                                                        columnNumber: 41
                                                                                                    }, this)
                                                                                                ]
                                                                                            }, void 0, true, {
                                                                                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                                lineNumber: 1191,
                                                                                                columnNumber: 37
                                                                                            }, this)
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                        lineNumber: 1182,
                                                                                        columnNumber: 31
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                lineNumber: 1173,
                                                                                columnNumber: 29
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                            lineNumber: 1169,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        isExpanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "px-4 pb-4",
                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "text-sm text-slate-700 bg-white/50 backdrop-blur-sm p-3 rounded border border-slate-200/50",
                                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    dangerouslySetInnerHTML: {
                                                                                        __html: entry.new_value
                                                                                    }
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                    lineNumber: 1205,
                                                                                    columnNumber: 35
                                                                                }, this)
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                lineNumber: 1204,
                                                                                columnNumber: 33
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                            lineNumber: 1203,
                                                                            columnNumber: 33
                                                                        }, this)
                                                                    ]
                                                                }, entry.id, true, {
                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                    lineNumber: 1168,
                                                                    columnNumber: 29
                                                                }, this);
                                                            })
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/SongDetailModal.tsx",
                                                            lineNumber: 1164,
                                                            columnNumber: 23
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                        lineNumber: 1144,
                                                        columnNumber: 19
                                                    }, this),
                                                    activeHistoryTab === 'audio' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "space-y-4",
                                                        children: isLoadingHistory ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-center py-8",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                    lineNumber: 1221,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-gray-500 text-sm",
                                                                    children: "Loading audio history..."
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                    lineNumber: 1222,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/SongDetailModal.tsx",
                                                            lineNumber: 1220,
                                                            columnNumber: 23
                                                        }, this) : getHistoryData('audio').length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-center py-8",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$music$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Music$3e$__["Music"], {
                                                                    className: "w-12 h-12 text-gray-300 mx-auto mb-4"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                    lineNumber: 1226,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-gray-500 text-sm font-medium",
                                                                    children: "No Audio History"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                    lineNumber: 1227,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-gray-400 text-xs mt-1",
                                                                    children: "Changes will appear here"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                    lineNumber: 1228,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    onClick: ()=>loadHistoryEntries(),
                                                                    className: "mt-4 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700",
                                                                    title: "Refresh history",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                                                        className: "w-4 h-4"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                        lineNumber: 1234,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                    lineNumber: 1229,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/SongDetailModal.tsx",
                                                            lineNumber: 1225,
                                                            columnNumber: 23
                                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "space-y-4",
                                                            children: getHistoryData('audio').map((entry)=>{
                                                                const isExpanded = expandedHistoryEntries.has(entry.id);
                                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "bg-white/70 backdrop-blur-sm rounded-lg border border-slate-200/50 overflow-hidden",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "p-4 cursor-pointer hover:bg-white/80 transition-colors",
                                                                            onClick: ()=>toggleHistoryEntry(entry.id),
                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "flex items-start gap-3",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                                                                                        style: {
                                                                                            background: `linear-gradient(to right, ${zoneColor}, ${darkenColor(zoneColor, 10)})`
                                                                                        },
                                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$music$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Music$3e$__["Music"], {
                                                                                            className: "w-4 h-4 text-white"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                            lineNumber: 1254,
                                                                                            columnNumber: 33
                                                                                        }, this)
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                        lineNumber: 1248,
                                                                                        columnNumber: 31
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "flex-1",
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                className: "flex items-center gap-2 mb-2",
                                                                                                children: [
                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                        className: "px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full",
                                                                                                        children: entry.type
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                                        lineNumber: 1258,
                                                                                                        columnNumber: 35
                                                                                                    }, this),
                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                        className: "text-xs text-slate-500",
                                                                                                        children: [
                                                                                                            formatDateTime(entry.date).date,
                                                                                                            " at ",
                                                                                                            formatDateTime(entry.date).time
                                                                                                        ]
                                                                                                    }, void 0, true, {
                                                                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                                        lineNumber: 1261,
                                                                                                        columnNumber: 35
                                                                                                    }, this)
                                                                                                ]
                                                                                            }, void 0, true, {
                                                                                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                                lineNumber: 1257,
                                                                                                columnNumber: 33
                                                                                            }, this),
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                className: "flex items-center justify-between",
                                                                                                children: [
                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                                                        className: "font-medium text-slate-900",
                                                                                                        children: entry.title
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                                        lineNumber: 1266,
                                                                                                        columnNumber: 39
                                                                                                    }, this),
                                                                                                    isExpanded ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronUp$3e$__["ChevronUp"], {
                                                                                                        className: "w-5 h-5 text-slate-400 flex-shrink-0"
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                                        lineNumber: 1268,
                                                                                                        columnNumber: 41
                                                                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                                                                                        className: "w-5 h-5 text-slate-400 flex-shrink-0"
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                                        lineNumber: 1270,
                                                                                                        columnNumber: 41
                                                                                                    }, this)
                                                                                                ]
                                                                                            }, void 0, true, {
                                                                                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                                lineNumber: 1265,
                                                                                                columnNumber: 37
                                                                                            }, this)
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                        lineNumber: 1256,
                                                                                        columnNumber: 31
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                lineNumber: 1247,
                                                                                columnNumber: 29
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                            lineNumber: 1243,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        isExpanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "px-4 pb-4",
                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "bg-white/50 backdrop-blur-sm p-3 rounded border border-slate-200/50",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "flex items-center gap-3",
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                                onClick: (e)=>{
                                                                                                    e.stopPropagation();
                                                                                                    handleHistoryAudioPlayPause(entry.id);
                                                                                                },
                                                                                                className: "w-10 h-10 rounded-full text-white transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center",
                                                                                                style: {
                                                                                                    backgroundColor: zoneColor
                                                                                                },
                                                                                                onMouseEnter: (e)=>{
                                                                                                    e.currentTarget.style.backgroundColor = darkenColor(zoneColor, 10);
                                                                                                },
                                                                                                onMouseLeave: (e)=>{
                                                                                                    e.currentTarget.style.backgroundColor = zoneColor;
                                                                                                },
                                                                                                children: historyAudioStates[entry.id]?.isPlaying ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pause$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Pause$3e$__["Pause"], {
                                                                                                    className: "w-5 h-5"
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                                    lineNumber: 1297,
                                                                                                    columnNumber: 41
                                                                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__["Play"], {
                                                                                                    className: "w-5 h-5 ml-0.5"
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                                    lineNumber: 1299,
                                                                                                    columnNumber: 41
                                                                                                }, this)
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                                lineNumber: 1280,
                                                                                                columnNumber: 37
                                                                                            }, this),
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                className: "flex-1",
                                                                                                children: [
                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                        className: "text-sm font-medium text-slate-800",
                                                                                                        children: "Previous Audio Version"
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                                        lineNumber: 1303,
                                                                                                        columnNumber: 39
                                                                                                    }, this),
                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                        className: "text-xs text-slate-500 mt-2 bg-slate-100 px-2 py-1 rounded-full inline-block",
                                                                                                        children: [
                                                                                                            formatTime(historyAudioStates[entry.id]?.currentTime || 0),
                                                                                                            " / ",
                                                                                                            formatTime(historyAudioStates[entry.id]?.duration || 0)
                                                                                                        ]
                                                                                                    }, void 0, true, {
                                                                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                                        lineNumber: 1304,
                                                                                                        columnNumber: 39
                                                                                                    }, this)
                                                                                                ]
                                                                                            }, void 0, true, {
                                                                                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                                lineNumber: 1302,
                                                                                                columnNumber: 37
                                                                                            }, this)
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                        lineNumber: 1279,
                                                                                        columnNumber: 35
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("audio", {
                                                                                        ref: (el)=>{
                                                                                            if (el) historyAudioRefs.current[entry.id] = el;
                                                                                        },
                                                                                        src: entry.new_value,
                                                                                        onTimeUpdate: ()=>handleHistoryAudioTimeUpdate(entry.id),
                                                                                        onLoadedMetadata: ()=>handleHistoryAudioLoadedMetadata(entry.id),
                                                                                        onEnded: ()=>handleHistoryAudioEnded(entry.id),
                                                                                        preload: "metadata"
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                        lineNumber: 1309,
                                                                                        columnNumber: 35
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                lineNumber: 1278,
                                                                                columnNumber: 33
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                            lineNumber: 1277,
                                                                            columnNumber: 33
                                                                        }, this)
                                                                    ]
                                                                }, entry.id, true, {
                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                    lineNumber: 1242,
                                                                    columnNumber: 29
                                                                }, this);
                                                            })
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/SongDetailModal.tsx",
                                                            lineNumber: 1238,
                                                            columnNumber: 23
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                        lineNumber: 1218,
                                                        columnNumber: 19
                                                    }, this),
                                                    activeHistoryTab === 'solfas' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "space-y-4",
                                                        children: isLoadingHistory ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-center py-8",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                    lineNumber: 1334,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-gray-500 text-sm",
                                                                    children: "Loading conductor's guide history..."
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                    lineNumber: 1335,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/SongDetailModal.tsx",
                                                            lineNumber: 1333,
                                                            columnNumber: 23
                                                        }, this) : getHistoryData('solfas').length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-center py-8",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$music$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Music$3e$__["Music"], {
                                                                    className: "w-12 h-12 text-gray-300 mx-auto mb-4"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                    lineNumber: 1339,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-gray-500 text-sm font-medium",
                                                                    children: "No Conductor's Guide History"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                    lineNumber: 1340,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-gray-400 text-xs mt-1",
                                                                    children: "Changes will appear here"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                    lineNumber: 1341,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    onClick: ()=>loadHistoryEntries(),
                                                                    className: "mt-4 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700",
                                                                    title: "Refresh history",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                                                        className: "w-4 h-4"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                        lineNumber: 1347,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                    lineNumber: 1342,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/SongDetailModal.tsx",
                                                            lineNumber: 1338,
                                                            columnNumber: 23
                                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "space-y-4",
                                                            children: getHistoryData('solfas').map((entry)=>{
                                                                const isExpanded = expandedHistoryEntries.has(entry.id);
                                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "bg-white/70 backdrop-blur-sm rounded-lg border border-slate-200/50 overflow-hidden",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "p-4 cursor-pointer hover:bg-white/80 transition-colors",
                                                                            onClick: ()=>toggleHistoryEntry(entry.id),
                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "flex items-start gap-3",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                                                                                        style: {
                                                                                            background: `linear-gradient(to right, ${zoneColor}, ${darkenColor(zoneColor, 10)})`
                                                                                        },
                                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$music$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Music$3e$__["Music"], {
                                                                                            className: "w-4 h-4 text-white"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                            lineNumber: 1367,
                                                                                            columnNumber: 33
                                                                                        }, this)
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                        lineNumber: 1361,
                                                                                        columnNumber: 31
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "flex-1",
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                className: "flex items-center gap-2 mb-2",
                                                                                                children: [
                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                        className: "px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full",
                                                                                                        children: entry.type
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                                        lineNumber: 1371,
                                                                                                        columnNumber: 35
                                                                                                    }, this),
                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                        className: "text-xs text-slate-500",
                                                                                                        children: [
                                                                                                            formatDateTime(entry.date).date,
                                                                                                            " at ",
                                                                                                            formatDateTime(entry.date).time
                                                                                                        ]
                                                                                                    }, void 0, true, {
                                                                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                                        lineNumber: 1374,
                                                                                                        columnNumber: 35
                                                                                                    }, this)
                                                                                                ]
                                                                                            }, void 0, true, {
                                                                                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                                lineNumber: 1370,
                                                                                                columnNumber: 33
                                                                                            }, this),
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                className: "flex items-center justify-between",
                                                                                                children: [
                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                                                        className: "font-medium text-slate-900",
                                                                                                        children: entry.title
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                                        lineNumber: 1379,
                                                                                                        columnNumber: 39
                                                                                                    }, this),
                                                                                                    isExpanded ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronUp$3e$__["ChevronUp"], {
                                                                                                        className: "w-5 h-5 text-slate-400 flex-shrink-0"
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                                        lineNumber: 1381,
                                                                                                        columnNumber: 41
                                                                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                                                                                        className: "w-5 h-5 text-slate-400 flex-shrink-0"
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                                        lineNumber: 1383,
                                                                                                        columnNumber: 41
                                                                                                    }, this)
                                                                                                ]
                                                                                            }, void 0, true, {
                                                                                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                                lineNumber: 1378,
                                                                                                columnNumber: 37
                                                                                            }, this)
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                        lineNumber: 1369,
                                                                                        columnNumber: 31
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                lineNumber: 1360,
                                                                                columnNumber: 29
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                            lineNumber: 1356,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        isExpanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "px-4 pb-4",
                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "text-sm text-slate-700 bg-white/50 backdrop-blur-sm p-3 rounded border border-slate-200/50",
                                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    dangerouslySetInnerHTML: {
                                                                                        __html: entry.new_value
                                                                                    }
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                    lineNumber: 1392,
                                                                                    columnNumber: 35
                                                                                }, this)
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                lineNumber: 1391,
                                                                                columnNumber: 33
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                            lineNumber: 1390,
                                                                            columnNumber: 33
                                                                        }, this)
                                                                    ]
                                                                }, entry.id, true, {
                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                    lineNumber: 1355,
                                                                    columnNumber: 29
                                                                }, this);
                                                            })
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/SongDetailModal.tsx",
                                                            lineNumber: 1351,
                                                            columnNumber: 23
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                        lineNumber: 1331,
                                                        columnNumber: 19
                                                    }, this),
                                                    activeHistoryTab === 'comments' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "space-y-4",
                                                        children: isLoadingHistory ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-center py-8",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                    lineNumber: 1408,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-gray-500 text-sm",
                                                                    children: "Loading comments history..."
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                    lineNumber: 1409,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/SongDetailModal.tsx",
                                                            lineNumber: 1407,
                                                            columnNumber: 23
                                                        }, this) : getHistoryData('comments').length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-center py-8",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                                                    className: "w-12 h-12 text-gray-300 mx-auto mb-4"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                    lineNumber: 1413,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-gray-500 text-sm font-medium",
                                                                    children: "No Comments History"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                    lineNumber: 1414,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-gray-400 text-xs mt-1",
                                                                    children: "Changes will appear here"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                    lineNumber: 1415,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    onClick: ()=>loadHistoryEntries(),
                                                                    className: "mt-4 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700",
                                                                    title: "Refresh history",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                                                        className: "w-4 h-4"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                        lineNumber: 1421,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                    lineNumber: 1416,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/SongDetailModal.tsx",
                                                            lineNumber: 1412,
                                                            columnNumber: 23
                                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "space-y-4",
                                                            children: getHistoryData('comments').map((entry)=>{
                                                                const isExpanded = expandedHistoryEntries.has(entry.id);
                                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "bg-white/70 backdrop-blur-sm rounded-lg border border-slate-200/50 overflow-hidden",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "p-4 cursor-pointer hover:bg-white/80 transition-colors",
                                                                            onClick: ()=>toggleHistoryEntry(entry.id),
                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "flex items-start gap-3",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                                                                                        style: {
                                                                                            background: `linear-gradient(to right, ${zoneColor}, ${darkenColor(zoneColor, 10)})`
                                                                                        },
                                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                                                                            className: "w-4 h-4 text-white"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                            lineNumber: 1441,
                                                                                            columnNumber: 33
                                                                                        }, this)
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                        lineNumber: 1435,
                                                                                        columnNumber: 31
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "flex-1",
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                className: "flex items-center gap-2 mb-2",
                                                                                                children: [
                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                        className: "px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full",
                                                                                                        children: entry.type
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                                        lineNumber: 1445,
                                                                                                        columnNumber: 35
                                                                                                    }, this),
                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                        className: "text-xs text-slate-500",
                                                                                                        children: [
                                                                                                            formatDateTime(entry.date).date,
                                                                                                            " at ",
                                                                                                            formatDateTime(entry.date).time
                                                                                                        ]
                                                                                                    }, void 0, true, {
                                                                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                                        lineNumber: 1448,
                                                                                                        columnNumber: 35
                                                                                                    }, this)
                                                                                                ]
                                                                                            }, void 0, true, {
                                                                                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                                lineNumber: 1444,
                                                                                                columnNumber: 33
                                                                                            }, this),
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                className: "flex items-center justify-between",
                                                                                                children: [
                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                                                        className: "font-medium text-slate-900",
                                                                                                        children: entry.title
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                                        lineNumber: 1453,
                                                                                                        columnNumber: 39
                                                                                                    }, this),
                                                                                                    isExpanded ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronUp$3e$__["ChevronUp"], {
                                                                                                        className: "w-5 h-5 text-slate-400 flex-shrink-0"
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                                        lineNumber: 1455,
                                                                                                        columnNumber: 41
                                                                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                                                                                        className: "w-5 h-5 text-slate-400 flex-shrink-0"
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                                        lineNumber: 1457,
                                                                                                        columnNumber: 41
                                                                                                    }, this)
                                                                                                ]
                                                                                            }, void 0, true, {
                                                                                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                                lineNumber: 1452,
                                                                                                columnNumber: 37
                                                                                            }, this)
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                        lineNumber: 1443,
                                                                                        columnNumber: 31
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                lineNumber: 1434,
                                                                                columnNumber: 29
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                            lineNumber: 1430,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        isExpanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "px-4 pb-4",
                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "text-sm text-slate-700 bg-white/50 backdrop-blur-sm p-3 rounded border border-slate-200/50",
                                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                    className: "whitespace-pre-wrap",
                                                                                    children: entry.new_value?.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                    lineNumber: 1466,
                                                                                    columnNumber: 35
                                                                                }, this)
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                lineNumber: 1465,
                                                                                columnNumber: 33
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                            lineNumber: 1464,
                                                                            columnNumber: 33
                                                                        }, this)
                                                                    ]
                                                                }, entry.id, true, {
                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                    lineNumber: 1429,
                                                                    columnNumber: 29
                                                                }, this);
                                                            })
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/SongDetailModal.tsx",
                                                            lineNumber: 1425,
                                                            columnNumber: 23
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                        lineNumber: 1405,
                                                        columnNumber: 19
                                                    }, this),
                                                    activeHistoryTab === 'metadata' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "space-y-4",
                                                        children: isLoadingHistory ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-center py-8",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                    lineNumber: 1482,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-gray-500 text-sm",
                                                                    children: "Loading song details history..."
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                    lineNumber: 1483,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/SongDetailModal.tsx",
                                                            lineNumber: 1481,
                                                            columnNumber: 23
                                                        }, this) : getHistoryData('metadata').length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-center py-8",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"], {
                                                                    className: "w-12 h-12 text-gray-300 mx-auto mb-4"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                    lineNumber: 1487,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-gray-500 text-sm font-medium",
                                                                    children: "No Song Details History"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                    lineNumber: 1488,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-gray-400 text-xs mt-1",
                                                                    children: "Changes will appear here"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                    lineNumber: 1489,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    onClick: ()=>loadHistoryEntries(),
                                                                    className: "mt-4 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700",
                                                                    title: "Refresh history",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$refresh$2d$cw$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RefreshCw$3e$__["RefreshCw"], {
                                                                        className: "w-4 h-4"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                        lineNumber: 1495,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                    lineNumber: 1490,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/SongDetailModal.tsx",
                                                            lineNumber: 1486,
                                                            columnNumber: 23
                                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "space-y-4",
                                                            children: getHistoryData('metadata').map((entry)=>{
                                                                const isExpanded = expandedHistoryEntries.has(entry.id);
                                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "bg-white/70 backdrop-blur-sm rounded-lg border border-slate-200/50 overflow-hidden",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "p-4 cursor-pointer hover:bg-white/80 transition-colors",
                                                                            onClick: ()=>toggleHistoryEntry(entry.id),
                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "flex items-start gap-3",
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                                                                                        style: {
                                                                                            background: `linear-gradient(to right, ${zoneColor}, ${darkenColor(zoneColor, 10)})`
                                                                                        },
                                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"], {
                                                                                            className: "w-4 h-4 text-white"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                            lineNumber: 1515,
                                                                                            columnNumber: 33
                                                                                        }, this)
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                        lineNumber: 1509,
                                                                                        columnNumber: 31
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "flex-1",
                                                                                        children: [
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                className: "flex items-center gap-2 mb-2",
                                                                                                children: [
                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                        className: "px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full",
                                                                                                        children: entry.type
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                                        lineNumber: 1519,
                                                                                                        columnNumber: 35
                                                                                                    }, this),
                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                                        className: "text-xs text-slate-500",
                                                                                                        children: [
                                                                                                            formatDateTime(entry.date).date,
                                                                                                            " at ",
                                                                                                            formatDateTime(entry.date).time
                                                                                                        ]
                                                                                                    }, void 0, true, {
                                                                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                                        lineNumber: 1522,
                                                                                                        columnNumber: 35
                                                                                                    }, this)
                                                                                                ]
                                                                                            }, void 0, true, {
                                                                                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                                lineNumber: 1518,
                                                                                                columnNumber: 33
                                                                                            }, this),
                                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                                className: "flex items-center justify-between",
                                                                                                children: [
                                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                                                        className: "font-medium text-slate-900",
                                                                                                        children: entry.title
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                                        lineNumber: 1527,
                                                                                                        columnNumber: 39
                                                                                                    }, this),
                                                                                                    isExpanded ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronUp$3e$__["ChevronUp"], {
                                                                                                        className: "w-5 h-5 text-slate-400 flex-shrink-0"
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                                        lineNumber: 1529,
                                                                                                        columnNumber: 41
                                                                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                                                                                        className: "w-5 h-5 text-slate-400 flex-shrink-0"
                                                                                                    }, void 0, false, {
                                                                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                                        lineNumber: 1531,
                                                                                                        columnNumber: 41
                                                                                                    }, this)
                                                                                                ]
                                                                                            }, void 0, true, {
                                                                                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                                lineNumber: 1526,
                                                                                                columnNumber: 37
                                                                                            }, this)
                                                                                        ]
                                                                                    }, void 0, true, {
                                                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                        lineNumber: 1517,
                                                                                        columnNumber: 31
                                                                                    }, this)
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                lineNumber: 1508,
                                                                                columnNumber: 29
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                            lineNumber: 1504,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        isExpanded && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "px-4 pb-4",
                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "text-sm text-slate-700 bg-white/50 backdrop-blur-sm p-3 rounded border border-slate-200/50",
                                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                    className: "whitespace-pre-wrap",
                                                                                    children: entry.new_value?.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                    lineNumber: 1540,
                                                                                    columnNumber: 35
                                                                                }, this)
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                                lineNumber: 1539,
                                                                                columnNumber: 33
                                                                            }, this)
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                            lineNumber: 1538,
                                                                            columnNumber: 33
                                                                        }, this)
                                                                    ]
                                                                }, entry.id, true, {
                                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                                    lineNumber: 1503,
                                                                    columnNumber: 29
                                                                }, this);
                                                            })
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/SongDetailModal.tsx",
                                                            lineNumber: 1499,
                                                            columnNumber: 23
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                        lineNumber: 1479,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                                lineNumber: 1142,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                        lineNumber: 1081,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                lineNumber: 995,
                                columnNumber: 9
                            }, this),
                            activeTab === 'lyrics' && !isFullscreenLyrics && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: toggleFullscreenLyrics,
                                className: "fixed bottom-28 right-3 sm:right-4 w-10 h-10 sm:w-11 sm:h-11 text-white rounded-full shadow-lg transition-all duration-200 z-[110] hover:scale-105 flex items-center justify-center",
                                style: {
                                    backgroundColor: zoneColor
                                },
                                onMouseEnter: (e)=>{
                                    e.currentTarget.style.backgroundColor = darkenColor(zoneColor, 10);
                                },
                                onMouseLeave: (e)=>{
                                    e.currentTarget.style.backgroundColor = zoneColor;
                                },
                                title: "Fullscreen Lyrics",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$maximize$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Maximize2$3e$__["Maximize2"], {
                                    className: "w-3.5 h-3.5 sm:w-4 sm:h-4"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                    lineNumber: 1573,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                lineNumber: 1559,
                                columnNumber: 11
                            }, this),
                            activeTab === 'comments' && !isFullscreenComments && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: toggleFullscreenComments,
                                className: "fixed bottom-28 right-3 sm:right-4 w-10 h-10 sm:w-11 sm:h-11 text-white rounded-full shadow-lg transition-all duration-200 z-[110] hover:scale-105 flex items-center justify-center",
                                style: {
                                    backgroundColor: zoneColor
                                },
                                onMouseEnter: (e)=>{
                                    e.currentTarget.style.backgroundColor = darkenColor(zoneColor, 10);
                                },
                                onMouseLeave: (e)=>{
                                    e.currentTarget.style.backgroundColor = zoneColor;
                                },
                                title: "Fullscreen Comments",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$maximize$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Maximize2$3e$__["Maximize2"], {
                                    className: "w-3.5 h-3.5 sm:w-4 sm:h-4"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                    lineNumber: 1592,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                lineNumber: 1578,
                                columnNumber: 11
                            }, this),
                            activeTab === 'solfas' && !isFullscreenSolfas && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: toggleFullscreenSolfas,
                                className: "fixed bottom-28 right-3 sm:right-4 w-10 h-10 sm:w-11 sm:h-11 text-white rounded-full shadow-lg transition-all duration-200 z-[110] hover:scale-105 flex items-center justify-center",
                                style: {
                                    backgroundColor: zoneColor
                                },
                                onMouseEnter: (e)=>{
                                    e.currentTarget.style.backgroundColor = darkenColor(zoneColor, 10);
                                },
                                onMouseLeave: (e)=>{
                                    e.currentTarget.style.backgroundColor = zoneColor;
                                },
                                title: "Fullscreen Conductor's Guide",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$maximize$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Maximize2$3e$__["Maximize2"], {
                                    className: "w-3.5 h-3.5 sm:w-4 sm:h-4"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                    lineNumber: 1611,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                lineNumber: 1597,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "fixed bottom-0 left-0 right-0 px-6 modal-bottom-safe bg-white border-t border-gray-100 z-[100]",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mb-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "progress-bar w-full h-1 bg-gray-300 rounded-full relative cursor-pointer hover:h-1.5 transition-all duration-200 select-none touch-optimized",
                                                onClick: handleProgressClick,
                                                onMouseDown: handleProgressMouseDown,
                                                onMouseMove: handleProgressMouseMove,
                                                onMouseUp: handleProgressMouseUp,
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "h-full bg-gray-600 rounded-full relative transition-all duration-200",
                                                    style: {
                                                        width: duration > 0 ? `${currentTime / duration * 100}%` : '0%'
                                                    },
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: `absolute right-0 top-1/2 transform -translate-y-1/2 rounded-full transition-all duration-200 ${isDragging ? 'w-4 h-4 bg-blue-600' : 'w-3 h-3 bg-gray-600 hover:w-4 hover:h-4'}`
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                        lineNumber: 1631,
                                                        columnNumber: 17
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                    lineNumber: 1627,
                                                    columnNumber: 15
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                                lineNumber: 1620,
                                                columnNumber: 13
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex justify-between mt-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-gray-600 text-xs",
                                                        children: formatTime(currentTime)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                        lineNumber: 1637,
                                                        columnNumber: 15
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-gray-600 text-xs",
                                                        children: formatTime(duration)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                        lineNumber: 1638,
                                                        columnNumber: 15
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                                lineNumber: 1636,
                                                columnNumber: 13
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                        lineNumber: 1619,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-evenly px-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: toggleRepeat,
                                                className: `w-5 h-5 flex items-center justify-center transition-colors ${isRepeating ? 'text-blue-600' : 'text-gray-600 hover:text-gray-800'}`,
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__["RotateCcw"], {
                                                    className: `w-3.5 h-3.5 ${isRepeating ? 'fill-current' : ''}`
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                    lineNumber: 1651,
                                                    columnNumber: 15
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                                lineNumber: 1645,
                                                columnNumber: 13
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: handlePrevious,
                                                className: "w-5 h-5 flex items-center justify-center hover:text-gray-800 transition-colors",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$skip$2d$back$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__SkipBack$3e$__["SkipBack"], {
                                                    className: "w-4 h-4 text-gray-600 fill-gray-600"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                    lineNumber: 1659,
                                                    columnNumber: 15
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                                lineNumber: 1655,
                                                columnNumber: 13
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: skipBackward10,
                                                className: "relative w-4 h-4 flex items-center justify-center hover:text-gray-800 transition-colors",
                                                title: "Skip backward 10 seconds",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$ccw$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCcw$3e$__["RotateCcw"], {
                                                        className: "w-3 h-3 text-gray-600"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                        lineNumber: 1668,
                                                        columnNumber: 15
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "absolute text-[4px] text-gray-600 font-bold leading-none top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
                                                        children: "10"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                        lineNumber: 1669,
                                                        columnNumber: 15
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                                lineNumber: 1663,
                                                columnNumber: 13
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: (e)=>{
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    console.log('🎵 Button clicked - Current state:', {
                                                        isPlaying,
                                                        isLoading,
                                                        hasError,
                                                        audioSrc: audioRef.current?.src,
                                                        audioReadyState: audioRef.current?.readyState,
                                                        audioPaused: audioRef.current?.paused
                                                    });
                                                    // Pause all history audios first
                                                    Object.keys(historyAudioRefs.current).forEach((id)=>{
                                                        if (historyAudioRefs.current[id]) {
                                                            historyAudioRefs.current[id].pause();
                                                        }
                                                    });
                                                    // Direct test - bypass the context for debugging
                                                    if (audioRef.current) {
                                                        if (audioRef.current.paused) {
                                                            console.log('🎵 Direct play attempt');
                                                            audioRef.current.play().then(()=>{
                                                                console.log('✅ Direct play successful');
                                                            }).catch((error)=>{
                                                                console.error('❌ Direct play failed:', error);
                                                            });
                                                        } else {
                                                            console.log('🎵 Direct pause attempt');
                                                            audioRef.current.pause();
                                                            console.log('✅ Direct pause successful');
                                                        }
                                                    } else {
                                                        console.error('❌ No audioRef.current available');
                                                    }
                                                    // Also call the context method
                                                    togglePlayPause();
                                                },
                                                disabled: isLoading || hasError,
                                                className: `w-10 h-10 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-sm ${hasError ? 'bg-red-500 cursor-not-allowed' : isLoading ? 'bg-gray-400 cursor-wait' : 'bg-gray-600'}`,
                                                children: isLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                    lineNumber: 1724,
                                                    columnNumber: 17
                                                }, this) : hasError ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "w-4 h-4 text-white text-xs",
                                                    children: "!"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                    lineNumber: 1726,
                                                    columnNumber: 17
                                                }, this) : isPlaying ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pause$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Pause$3e$__["Pause"], {
                                                    className: "w-4 h-4 text-white"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                    lineNumber: 1728,
                                                    columnNumber: 17
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__["Play"], {
                                                    className: "w-4 h-4 text-white ml-0.5"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                    lineNumber: 1730,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                                lineNumber: 1673,
                                                columnNumber: 13
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: skipForward10,
                                                className: "relative w-4 h-4 flex items-center justify-center hover:text-gray-800 transition-colors",
                                                title: "Skip forward 10 seconds",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$cw$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCw$3e$__["RotateCw"], {
                                                        className: "w-3 h-3 text-gray-600"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                        lineNumber: 1740,
                                                        columnNumber: 15
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "absolute text-[4px] text-gray-600 font-bold leading-none top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
                                                        children: "10"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                                        lineNumber: 1741,
                                                        columnNumber: 15
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                                lineNumber: 1735,
                                                columnNumber: 13
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: handleNext,
                                                className: "w-5 h-5 flex items-center justify-center hover:text-gray-800 transition-colors",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$skip$2d$forward$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__SkipForward$3e$__["SkipForward"], {
                                                    className: "w-4 h-4 text-gray-600 fill-gray-600"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                    lineNumber: 1749,
                                                    columnNumber: 15
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                                lineNumber: 1745,
                                                columnNumber: 13
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: handleMusicPage,
                                                disabled: isNavigatingToAudioLab,
                                                className: "w-5 h-5 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50",
                                                children: isNavigatingToAudioLab ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                                    className: "w-3.5 h-3.5 animate-spin"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                    lineNumber: 1759,
                                                    columnNumber: 17
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$music$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Music2$3e$__["Music2"], {
                                                    className: "w-3.5 h-3.5"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/SongDetailModal.tsx",
                                                    lineNumber: 1761,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                                lineNumber: 1753,
                                                columnNumber: 13
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/SongDetailModal.tsx",
                                        lineNumber: 1643,
                                        columnNumber: 11
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/SongDetailModal.tsx",
                                lineNumber: 1616,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true)
                }, void 0, false, {
                    fileName: "[project]/src/components/SongDetailModal.tsx",
                    lineNumber: 731,
                    columnNumber: 7
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/SongDetailModal.tsx",
                lineNumber: 729,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
}),
"[project]/src/components/ScreenHeader.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ScreenHeader",
    ()=>ScreenHeader,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$menu$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Menu$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/menu.js [app-ssr] (ecmascript) <export default as Menu>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
'use client';
;
;
;
;
function ScreenHeader({ title, subtitle, onMenuClick, rightImageSrc = '/logo.png', showDivider = true, rightButtons, leftButtons, onTitleClick, timer, showMenuButton = true }) {
    const [mounted, setMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    // Check admin status from localStorage
    const isAdmin = "undefined" !== 'undefined' && localStorage.getItem('adminAuthenticated') === 'true';
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const id = window.setTimeout(()=>setMounted(true), 200);
        return ()=>window.clearTimeout(id);
    }, []);
    const handleLogoClick = ()=>{
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        else {
            router.push('/home');
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `sticky top-0 z-50 bg-white/80 backdrop-blur-xl ${showDivider ? 'border-b border-gray-100/50' : ''}`,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-between p-2 sm:p-3 relative min-h-[60px] sm:min-h-[70px]",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center space-x-2",
                    children: [
                        showMenuButton && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onMenuClick,
                            className: `flex items-center p-2 rounded-lg transition-all duration-1000 ease-out focus:outline-none focus:ring-0 focus:border-0 hover:bg-gray-100 ${mounted ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 -translate-x-4 scale-75'}`,
                            "aria-label": "Open menu",
                            style: {
                                outline: 'none',
                                border: 'none',
                                boxShadow: 'none'
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$menu$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Menu$3e$__["Menu"], {
                                className: "w-5 h-5 text-gray-600"
                            }, void 0, false, {
                                fileName: "[project]/src/components/ScreenHeader.tsx",
                                lineNumber: 53,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/ScreenHeader.tsx",
                            lineNumber: 47,
                            columnNumber: 13
                        }, this),
                        leftButtons && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `transition-all duration-1000 ease-out ${mounted ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 -translate-x-4 scale-75'}`,
                            children: leftButtons
                        }, void 0, false, {
                            fileName: "[project]/src/components/ScreenHeader.tsx",
                            lineNumber: 57,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/ScreenHeader.tsx",
                    lineNumber: 45,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onTitleClick,
                            className: `text-base sm:text-lg font-outfit-semibold text-gray-800 transition-all duration-1000 ease-out delay-200 ${mounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-3 scale-90'} ${onTitleClick ? 'hover:text-gray-900 active:scale-95' : 'cursor-default'}`,
                            disabled: !onTitleClick,
                            children: title
                        }, void 0, false, {
                            fileName: "[project]/src/components/ScreenHeader.tsx",
                            lineNumber: 65,
                            columnNumber: 11
                        }, this),
                        subtitle && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `text-xs sm:text-sm text-gray-600 font-medium transition-all duration-1000 ease-out delay-250 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`,
                            children: subtitle
                        }, void 0, false, {
                            fileName: "[project]/src/components/ScreenHeader.tsx",
                            lineNumber: 73,
                            columnNumber: 13
                        }, this),
                        timer && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `mt-0.5 transition-all duration-1000 ease-out delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`,
                            children: timer
                        }, void 0, false, {
                            fileName: "[project]/src/components/ScreenHeader.tsx",
                            lineNumber: 78,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/ScreenHeader.tsx",
                    lineNumber: 64,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: `flex items-center space-x-2 transition-all duration-1000 ease-out delay-400 ${mounted ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-4 scale-75'}`,
                    children: [
                        rightButtons,
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleLogoClick,
                            className: "hover:scale-105 active:scale-95 transition-transform duration-200",
                            "aria-label": "Go to home",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                src: rightImageSrc,
                                alt: "Logo",
                                className: "w-8 h-8 object-contain",
                                onError: (e)=>{
                                    e.currentTarget.style.display = 'none';
                                }
                            }, void 0, false, {
                                fileName: "[project]/src/components/ScreenHeader.tsx",
                                lineNumber: 92,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/ScreenHeader.tsx",
                            lineNumber: 87,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/ScreenHeader.tsx",
                    lineNumber: 85,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/ScreenHeader.tsx",
            lineNumber: 43,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/ScreenHeader.tsx",
        lineNumber: 42,
        columnNumber: 5
    }, this);
}
const __TURBOPACK__default__export__ = ScreenHeader;
}),
"[project]/src/components/SharedDrawer.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SharedDrawer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/log-out.js [app-ssr] (ecmascript) <export default as LogOut>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-alert.js [app-ssr] (ecmascript) <export default as AlertCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useZone$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useZone.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useAuth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useAuth.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
;
function SharedDrawer({ open, onClose, title = 'Menu', items, customSections = [], fixedOnDesktop = false }) {
    const [showLogoutModal, setShowLogoutModal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // Use ref instead of state to prevent callback from being lost on re-render
    const logoutCallbackRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const { currentZone } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useZone$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useZone"])();
    const { signOut } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useAuth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuth"])();
    // Get zone colors
    const zoneColors = {
        primary: currentZone?.themeColor || '#16a34a',
        secondary: currentZone?.themeColor || '#15803d',
        accent: currentZone?.themeColor || '#22c55e'
    };
    // Render drawer content
    const renderDrawerContent = ()=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-between px-6 py-5 border-b border-gray-100/80",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            className: "text-xl font-outfit-semibold text-gray-900 hover:text-gray-700 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-0 focus:border-0",
                            style: {
                                outline: 'none',
                                border: 'none',
                                boxShadow: 'none'
                            },
                            "aria-label": "Close menu",
                            children: title
                        }, void 0, false, {
                            fileName: "[project]/src/components/SharedDrawer.tsx",
                            lineNumber: 51,
                            columnNumber: 9
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            className: "p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 rounded-full transition-all duration-200 active:scale-95 focus:outline-none focus:ring-0 focus:border-0",
                            style: {
                                outline: 'none',
                                border: 'none',
                                boxShadow: 'none'
                            },
                            "aria-label": "Close menu",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                className: "w-5 h-5"
                            }, void 0, false, {
                                fileName: "[project]/src/components/SharedDrawer.tsx",
                                lineNumber: 65,
                                columnNumber: 11
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/SharedDrawer.tsx",
                            lineNumber: 59,
                            columnNumber: 9
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/SharedDrawer.tsx",
                    lineNumber: 50,
                    columnNumber: 7
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "py-1",
                    children: (items || []).map((item, index)=>{
                        const MenuItem = item.onClick ? 'button' : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"];
                        // Special handling for logout and refresh
                        const isLogout = item.title.toLowerCase() === 'logout';
                        const isRefresh = item.title.toLowerCase() === 'refresh app';
                        // Debug logging for refresh button
                        if (isRefresh) {
                            console.log('🔄 Rendering refresh button:', {
                                title: item.title,
                                hasIcon: !!item.icon,
                                hasOnClick: !!item.onClick
                            });
                        }
                        const commonProps = item.onClick ? {
                            onClick: (e)=>{
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('🔗 Menu item clicked (onClick):', item.title);
                                if (isLogout) {
                                    console.log('🚪 Logout button clicked - showing confirmation modal');
                                    // Store the callback in ref (won't be lost on re-render)
                                    logoutCallbackRef.current = item.onClick || null;
                                    setShowLogoutModal(true);
                                } else if (isRefresh) {
                                    console.log('🔄 Refresh button clicked - executing immediately');
                                    // Execute immediately for refresh
                                    if (item.onClick) {
                                        item.onClick();
                                    }
                                    onClose();
                                } else {
                                    console.log('🔗 Regular menu item clicked - executing immediately');
                                    // Execute immediately for other items
                                    if (item.onClick) {
                                        item.onClick();
                                    }
                                    onClose();
                                }
                            }
                        } : {
                            href: item.href || '#',
                            onClick: (e)=>{
                                console.log('🔗 Menu item clicked (href):', item.title, 'href:', item.href);
                                // If href is '#', prevent navigation
                                if (item.href === '#') {
                                    e.preventDefault();
                                    console.log('🚫 Prevented navigation for placeholder link');
                                    return;
                                }
                                // Close drawer first
                                onClose();
                                // Use router for navigation
                                if (item.href && item.href !== '#') {
                                    console.log('🚀 Navigating to:', item.href);
                                    router.push(item.href);
                                }
                            }
                        };
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(MenuItem, {
                            ...commonProps,
                            className: `flex items-center justify-between px-4 py-2.5 hover:bg-gray-50/80 transition-all duration-200 active:bg-gray-100/80 w-full text-left group ${isLogout ? 'text-red-600 hover:bg-red-50/80 active:bg-red-100/80' : isRefresh ? 'text-blue-600 hover:bg-blue-50/80 active:bg-blue-100/80' : 'text-gray-800'}`,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center space-x-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: `w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${isLogout ? 'bg-red-100/80 group-hover:bg-red-200/80' : isRefresh ? 'bg-blue-100/80 group-hover:bg-blue-200/80' : 'group-hover:opacity-80'}`,
                                            style: !isLogout && !isRefresh ? {
                                                backgroundColor: `${zoneColors.primary}20`
                                            } : {},
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(item.icon, {
                                                className: `w-4 h-4 transition-colors duration-200 ${isLogout ? 'text-red-600' : isRefresh ? 'text-blue-600' : ''}`,
                                                style: !isLogout && !isRefresh ? {
                                                    color: zoneColors.primary
                                                } : {}
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/SharedDrawer.tsx",
                                                lineNumber: 159,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/SharedDrawer.tsx",
                                            lineNumber: 147,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-sm font-poppins-medium",
                                            children: item.title
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/SharedDrawer.tsx",
                                            lineNumber: 168,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/SharedDrawer.tsx",
                                    lineNumber: 146,
                                    columnNumber: 15
                                }, this),
                                item.badge && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "relative",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "bg-gradient-to-br from-red-500 to-red-600 rounded-full w-3 h-3 shadow-lg border border-white animate-pulse"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/SharedDrawer.tsx",
                                            lineNumber: 172,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "absolute inset-0 bg-red-400 rounded-full animate-ping opacity-75"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/SharedDrawer.tsx",
                                            lineNumber: 173,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/SharedDrawer.tsx",
                                    lineNumber: 171,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, index, true, {
                            fileName: "[project]/src/components/SharedDrawer.tsx",
                            lineNumber: 135,
                            columnNumber: 13
                        }, this);
                    })
                }, void 0, false, {
                    fileName: "[project]/src/components/SharedDrawer.tsx",
                    lineNumber: 70,
                    columnNumber: 7
                }, this),
                (customSections || []).map((section, sectionIndex)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "border-t border-gray-100/80",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "px-6 py-3",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-gray-500 text-xs font-bold uppercase tracking-wider",
                                    children: section.title
                                }, void 0, false, {
                                    fileName: "[project]/src/components/SharedDrawer.tsx",
                                    lineNumber: 185,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/SharedDrawer.tsx",
                                lineNumber: 184,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "py-1",
                                children: (section.items || []).map((item, index)=>{
                                    const MenuItem = item.onClick ? 'button' : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"];
                                    const commonProps = item.onClick ? {
                                        onClick: ()=>{
                                            item.onClick?.();
                                            onClose();
                                        }
                                    } : {
                                        href: item.href || '#',
                                        onClick: (e)=>{
                                            if (item.href === '#') {
                                                e.preventDefault();
                                                return;
                                            }
                                            onClose();
                                            if (item.href && item.href !== '#') {
                                                router.push(item.href);
                                            }
                                        }
                                    };
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(MenuItem, {
                                        ...commonProps,
                                        className: "flex items-center justify-between px-4 py-2.5 hover:bg-gray-50/80 transition-all duration-200 active:bg-gray-100/80 w-full text-left group text-gray-800",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center space-x-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 group-hover:opacity-80",
                                                        style: {
                                                            backgroundColor: `${zoneColors.primary}20`
                                                        },
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(item.icon, {
                                                            className: "w-4 h-4 transition-colors duration-200",
                                                            style: {
                                                                color: zoneColors.primary
                                                            }
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/SharedDrawer.tsx",
                                                            lineNumber: 219,
                                                            columnNumber: 23
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/SharedDrawer.tsx",
                                                        lineNumber: 213,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-sm font-poppins-medium",
                                                        children: item.title
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/SharedDrawer.tsx",
                                                        lineNumber: 226,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/SharedDrawer.tsx",
                                                lineNumber: 212,
                                                columnNumber: 19
                                            }, this),
                                            item.badge && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "relative",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "bg-gradient-to-br from-red-500 to-red-600 rounded-full w-3 h-3 shadow-lg border border-white animate-pulse"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/SharedDrawer.tsx",
                                                        lineNumber: 230,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "absolute inset-0 bg-red-400 rounded-full animate-ping opacity-75"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/SharedDrawer.tsx",
                                                        lineNumber: 231,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/SharedDrawer.tsx",
                                                lineNumber: 229,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, index, true, {
                                        fileName: "[project]/src/components/SharedDrawer.tsx",
                                        lineNumber: 207,
                                        columnNumber: 17
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/src/components/SharedDrawer.tsx",
                                lineNumber: 187,
                                columnNumber: 11
                            }, this)
                        ]
                    }, sectionIndex, true, {
                        fileName: "[project]/src/components/SharedDrawer.tsx",
                        lineNumber: 183,
                        columnNumber: 9
                    }, this))
            ]
        }, void 0, true);
    // Fixed desktop mode - always visible on desktop, hidden on mobile
    if (fixedOnDesktop) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "hidden lg:block fixed left-0 top-0 w-80 h-full bg-white/95 backdrop-blur-xl shadow-2xl border-r border-gray-200/50 z-40 overflow-y-auto",
            children: renderDrawerContent()
        }, void 0, false, {
            fileName: "[project]/src/components/SharedDrawer.tsx",
            lineNumber: 246,
            columnNumber: 7
        }, this);
    }
    // Mobile mode - Apple-style drawer (works on all screen sizes)
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `fixed left-0 top-0 bottom-0 z-50 w-72 max-w-[80vw] bg-white/98 backdrop-blur-xl shadow-2xl border-r border-gray-200/50 overflow-y-auto transform transition-transform duration-300 ease-out ${open ? 'translate-x-0' : '-translate-x-full'}`,
                "data-drawer": true,
                children: renderDrawerContent()
            }, void 0, false, {
                fileName: "[project]/src/components/SharedDrawer.tsx",
                lineNumber: 256,
                columnNumber: 7
            }, this),
            showLogoutModal && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 z-[60] flex items-center justify-center p-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-0 bg-black/50 backdrop-blur-sm",
                        onClick: ()=>setShowLogoutModal(false)
                    }, void 0, false, {
                        fileName: "[project]/src/components/SharedDrawer.tsx",
                        lineNumber: 269,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 transform transition-all",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-center mb-4",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-16 h-16 bg-red-100 rounded-full flex items-center justify-center",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"], {
                                        className: "w-8 h-8 text-red-600"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/SharedDrawer.tsx",
                                        lineNumber: 279,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/SharedDrawer.tsx",
                                    lineNumber: 278,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/SharedDrawer.tsx",
                                lineNumber: 277,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-xl font-semibold text-gray-900 text-center mb-2",
                                children: "Logout Confirmation"
                            }, void 0, false, {
                                fileName: "[project]/src/components/SharedDrawer.tsx",
                                lineNumber: 284,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-gray-600 text-center mb-6",
                                children: "Are you sure you want to logout?"
                            }, void 0, false, {
                                fileName: "[project]/src/components/SharedDrawer.tsx",
                                lineNumber: 289,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setShowLogoutModal(false),
                                        className: "flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors",
                                        children: "Cancel"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/SharedDrawer.tsx",
                                        lineNumber: 295,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: async ()=>{
                                            console.log('🚪 Logout confirmed in modal, executing logout...');
                                            setShowLogoutModal(false);
                                            onClose();
                                            // Execute logout directly using signOut from useAuth
                                            // This is more reliable than using a stored callback
                                            try {
                                                console.log('🚪 Calling signOut directly...');
                                                await signOut();
                                                console.log('✅ SignOut completed');
                                            } catch (error) {
                                                console.error('❌ SignOut error:', error);
                                                // Fallback: try the stored callback
                                                if (logoutCallbackRef.current) {
                                                    console.log('🚪 Trying stored callback as fallback...');
                                                    logoutCallbackRef.current();
                                                }
                                            }
                                        },
                                        className: "flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__["LogOut"], {
                                                className: "w-4 h-4"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/SharedDrawer.tsx",
                                                lineNumber: 324,
                                                columnNumber: 17
                                            }, this),
                                            "Logout"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/SharedDrawer.tsx",
                                        lineNumber: 301,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/SharedDrawer.tsx",
                                lineNumber: 294,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/SharedDrawer.tsx",
                        lineNumber: 275,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/SharedDrawer.tsx",
                lineNumber: 267,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true);
}
}),
"[project]/src/components/AudioWave.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AudioWave
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$AudioContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/contexts/AudioContext.tsx [app-ssr] (ecmascript)");
"use client";
;
;
;
function AudioWave({ className = "" }) {
    const { isPlaying, currentTime, duration } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$AudioContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAudio"])();
    const [waveData, setWaveData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    // Generate wave data based on audio progress
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const generateWave = ()=>{
            const bars = 20; // Number of wave bars
            const progress = duration > 0 ? currentTime / duration : 0;
            const newWaveData = Array.from({
                length: bars
            }, (_, i)=>{
                // Create a wave pattern that's more active when playing
                const baseHeight = isPlaying ? 0.3 + Math.random() * 0.7 : 0.1;
                const progressFactor = Math.sin(i / bars * Math.PI * 2 + progress * Math.PI * 4) * 0.3;
                return Math.max(0.1, Math.min(1, baseHeight + progressFactor));
            });
            setWaveData(newWaveData);
        };
        generateWave();
        // Update wave more frequently when playing
        const interval = isPlaying ? 100 : 500;
        const timer = setInterval(generateWave, interval);
        return ()=>clearInterval(timer);
    }, [
        isPlaying,
        currentTime,
        duration
    ]);
    if (!isPlaying && currentTime === 0) {
        return null; // Don't show wave when not playing
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `flex items-center justify-center space-x-0.5 ${className}`,
        children: waveData.slice(0, 8).map((height, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-purple-500 rounded-full transition-all duration-150",
                style: {
                    width: '2px',
                    height: `${height * 16}px`,
                    opacity: isPlaying ? 0.9 : 0.5,
                    transform: isPlaying ? 'scaleY(1)' : 'scaleY(0.6)'
                }
            }, index, false, {
                fileName: "[project]/src/components/AudioWave.tsx",
                lineNumber: 46,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/src/components/AudioWave.tsx",
        lineNumber: 44,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/lib/zone-database-service.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ZoneDatabaseService",
    ()=>ZoneDatabaseService
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase-database.ts [app-ssr] (ecmascript)");
;
const CATEGORIES_CACHE_TTL = 5 * 60 * 1000;
const categoriesCache = new Map();
const pageCategoriesCache = new Map();
function isCategoriesCacheValid(cache) {
    if (!cache) return false;
    return Date.now() - cache.timestamp < CATEGORIES_CACHE_TTL;
}
class ZoneDatabaseService {
    static async getPraiseNightsByZone(zoneId, limitCount = 10) {
        try {
            const allPraiseNights = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].getCollectionWhere('zone_praise_nights', 'zoneId', '==', zoneId);
            const sorted = allPraiseNights.sort((a, b)=>{
                const dateA = new Date(a.createdAt || 0).getTime();
                const dateB = new Date(b.createdAt || 0).getTime();
                return dateB - dateA;
            });
            return sorted.slice(0, limitCount);
        } catch (error) {
            console.error('Error getting praise nights by zone:', error);
            return [];
        }
    }
    static async getSongsByPraiseNight(praiseNightId) {
        try {
            const songs = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].getCollectionWhere('zone_songs', 'praiseNightId', '==', praiseNightId);
            return songs.sort((a, b)=>(a.orderIndex || 0) - (b.orderIndex || 0));
        } catch (error) {
            console.error('Error getting zone songs:', error);
            return [];
        }
    }
    static async getAllSongsByZone(zoneId) {
        try {
            return await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].getCollectionWhere('zone_songs', 'zoneId', '==', zoneId);
        } catch (error) {
            console.error('Error getting zone songs by zone:', error);
            return [];
        }
    }
    static async createPraiseNight(zoneId, data) {
        try {
            const { isHQGroup } = await __turbopack_context__.A("[project]/src/config/zones.ts [app-ssr] (ecmascript, async loader)");
            const now = new Date();
            const collection = isHQGroup(zoneId) ? 'praise_nights' : 'zone_praise_nights';
            const scope = isHQGroup(zoneId) ? 'hq' : 'zone';
            const praiseNightData = {
                ...data,
                zoneId,
                scope,
                createdAt: now,
                updatedAt: now
            };
            const result = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].addDocument(collection, praiseNightData);
            // Log activity
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            return {
                success: true,
                id: result.id,
                firebaseId: result.id
            };
        } catch (error) {
            console.error('Error creating praise night:', error);
            return {
                success: false
            };
        }
    }
    static async createSong(zoneId, praiseNightId, songData) {
        try {
            const data = {
                ...songData,
                zoneId,
                praiseNightId,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            const cleanData = Object.fromEntries(Object.entries(data).filter(([_, value])=>value !== undefined));
            const result = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].addDocument('zone_songs', cleanData);
            return {
                success: true,
                id: result.id,
                song: {
                    ...cleanData,
                    id: result.id
                }
            };
        } catch (error) {
            console.error('Error creating zone song:', error);
            return {
                success: false
            };
        }
    }
    static async updatePraiseNight(praiseNightId, data, zoneId) {
        try {
            const updateData = {
                ...data,
                updatedAt: new Date()
            };
            delete updateData.zoneId;
            if (zoneId) {
                const { isHQGroup } = await __turbopack_context__.A("[project]/src/config/zones.ts [app-ssr] (ecmascript, async loader)");
                if (isHQGroup(zoneId)) {
                    const result = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].updatePraiseNight(praiseNightId, updateData);
                    // Log activity
                    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
                    ;
                    return result;
                }
            }
            const result = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].updateDocument('zone_praise_nights', praiseNightId, updateData);
            // Log activity
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
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
    static async updateSong(songId, data) {
        try {
            const updateData = {
                ...data,
                updatedAt: new Date()
            };
            delete updateData.zoneId;
            delete updateData.id;
            delete updateData.firebaseId;
            const cleanData = Object.fromEntries(Object.entries(updateData).filter(([_, value])=>value !== undefined));
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].updateDocument('zone_songs', songId, cleanData);
            return {
                success: true
            };
        } catch (error) {
            console.error('Error updating zone song:', error);
            return {
                success: false
            };
        }
    }
    static async deletePraiseNight(praiseNightId, zoneId) {
        try {
            let result;
            if (zoneId) {
                const { isHQGroup } = await __turbopack_context__.A("[project]/src/config/zones.ts [app-ssr] (ecmascript, async loader)");
                if (isHQGroup(zoneId)) {
                    result = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].deletePraiseNight(praiseNightId);
                }
            }
            if (!result) {
                result = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].deleteDocument('zone_praise_nights', praiseNightId);
            }
            // Log activity
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
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
    static async deleteSong(songId) {
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].deleteDocument('zone_songs', songId);
            return {
                success: true
            };
        } catch (error) {
            console.error('Error deleting zone song:', error);
            return {
                success: false
            };
        }
    }
    static async getCategoriesByZone(zoneId) {
        try {
            return await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].getCollectionWhere('zone_categories', 'zoneId', '==', zoneId);
        } catch (error) {
            console.error('Error getting zone categories:', error);
            return [];
        }
    }
    static async createCategory(zoneId, categoryData) {
        try {
            const { isHQGroup } = await __turbopack_context__.A("[project]/src/config/zones.ts [app-ssr] (ecmascript, async loader)");
            const collection = isHQGroup(zoneId) ? 'categories' : 'zone_categories';
            const data = {
                ...categoryData,
                ...isHQGroup(zoneId) ? {} : {
                    zoneId
                },
                createdAt: new Date(),
                updatedAt: new Date()
            };
            const result = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].addDocument(collection, data);
            this.invalidateCategoriesCache(zoneId);
            return {
                success: true,
                id: result.id,
                ...data
            };
        } catch (error) {
            console.error('Error creating category:', error);
            return {
                success: false
            };
        }
    }
    static async getPageCategoriesByZone(zoneId) {
        try {
            return await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].getCollectionWhere('zone_page_categories', 'zoneId', '==', zoneId);
        } catch (error) {
            console.error('Error getting zone page categories:', error);
            return [];
        }
    }
    static async createPageCategory(zoneId, data) {
        try {
            const { isHQGroup } = await __turbopack_context__.A("[project]/src/config/zones.ts [app-ssr] (ecmascript, async loader)");
            const collection = isHQGroup(zoneId) ? 'page_categories' : 'zone_page_categories';
            const categoryData = {
                ...data,
                ...isHQGroup(zoneId) ? {} : {
                    zoneId
                },
                createdAt: new Date(),
                updatedAt: new Date()
            };
            const result = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].addDocument(collection, categoryData);
            this.invalidatePageCategoriesCache(zoneId);
            return {
                success: true,
                id: result.id
            };
        } catch (error) {
            console.error('Error creating page category:', error);
            return {
                success: false
            };
        }
    }
    static async updatePageCategory(zoneId, pageCategoryId, data) {
        try {
            const { isHQGroup } = await __turbopack_context__.A("[project]/src/config/zones.ts [app-ssr] (ecmascript, async loader)");
            const collection = isHQGroup(zoneId) ? 'page_categories' : 'zone_page_categories';
            const updateData = {
                ...data,
                updatedAt: new Date()
            };
            delete updateData.zoneId;
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].updateDocument(collection, pageCategoryId, updateData);
            this.invalidatePageCategoriesCache(zoneId);
            return {
                success: true
            };
        } catch (error) {
            console.error('Error updating page category:', error);
            return {
                success: false
            };
        }
    }
    static async deletePageCategory(zoneId, pageCategoryId) {
        try {
            const { isHQGroup } = await __turbopack_context__.A("[project]/src/config/zones.ts [app-ssr] (ecmascript, async loader)");
            const collection = isHQGroup(zoneId) ? 'page_categories' : 'zone_page_categories';
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].deleteDocument(collection, pageCategoryId);
            this.invalidatePageCategoriesCache(zoneId);
            return {
                success: true
            };
        } catch (error) {
            console.error('Error deleting page category:', error);
            return {
                success: false
            };
        }
    }
    static async updateCategory(zoneId, categoryId, data) {
        try {
            const { isHQGroup } = await __turbopack_context__.A("[project]/src/config/zones.ts [app-ssr] (ecmascript, async loader)");
            const collection = isHQGroup(zoneId) ? 'categories' : 'zone_categories';
            const updateData = {
                ...data,
                updatedAt: new Date()
            };
            delete updateData.zoneId;
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].updateDocument(collection, categoryId, updateData);
            this.invalidateCategoriesCache(zoneId);
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
    static async deleteCategory(zoneId, categoryId) {
        try {
            const { isHQGroup } = await __turbopack_context__.A("[project]/src/config/zones.ts [app-ssr] (ecmascript, async loader)");
            const collection = isHQGroup(zoneId) ? 'categories' : 'zone_categories';
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].deleteDocument(collection, categoryId);
            this.invalidateCategoriesCache(zoneId);
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
    static async getSongHistory(songId) {
        try {
            const history = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].getCollectionWhere('zone_song_history', 'song_id', '==', songId);
            return history.sort((a, b)=>{
                const dateA = new Date(a.created_at || 0).getTime();
                const dateB = new Date(b.created_at || 0).getTime();
                return dateB - dateA;
            });
        } catch (error) {
            console.error('Error getting zone song history:', error);
            return [];
        }
    }
    static async createSongHistory(historyData) {
        try {
            const data = {
                ...historyData,
                created_at: new Date()
            };
            const result = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].addDocument('zone_song_history', data);
            return {
                success: true,
                id: result.id
            };
        } catch (error) {
            console.error('Error creating zone song history:', error);
            return {
                success: false
            };
        }
    }
    static async getCategories(zoneId) {
        const cacheKey = `categories_${zoneId}`;
        const cached = categoriesCache.get(cacheKey);
        if (isCategoriesCacheValid(cached)) {
            return cached.data;
        }
        const { isHQGroup } = await __turbopack_context__.A("[project]/src/config/zones.ts [app-ssr] (ecmascript, async loader)");
        const categories = isHQGroup(zoneId) ? await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].getCollection('categories') : await this.getCategoriesByZone(zoneId);
        categoriesCache.set(cacheKey, {
            data: categories,
            timestamp: Date.now(),
            zoneId
        });
        return categories;
    }
    static async getPageCategories(zoneId) {
        const cacheKey = `page_categories_${zoneId}`;
        const cached = pageCategoriesCache.get(cacheKey);
        if (isCategoriesCacheValid(cached)) {
            return cached.data;
        }
        const { isHQGroup } = await __turbopack_context__.A("[project]/src/config/zones.ts [app-ssr] (ecmascript, async loader)");
        const pageCategories = isHQGroup(zoneId) ? await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].getCollection('page_categories') : await this.getPageCategoriesByZone(zoneId);
        pageCategoriesCache.set(cacheKey, {
            data: pageCategories,
            timestamp: Date.now(),
            zoneId
        });
        return pageCategories;
    }
    static invalidateCategoriesCache(zoneId) {
        categoriesCache.delete(`categories_${zoneId}`);
    }
    static invalidatePageCategoriesCache(zoneId) {
        pageCategoriesCache.delete(`page_categories_${zoneId}`);
    }
    static async getMasterSongs(limit = 100) {
        try {
            const { MasterLibraryService } = await __turbopack_context__.A("[project]/src/lib/master-library-service.ts [app-ssr] (ecmascript, async loader)");
            return await MasterLibraryService.getMasterSongs(limit);
        } catch (error) {
            console.error('Error getting Master Library songs:', error);
            return [];
        }
    }
    static async searchMasterSongs(searchTerm) {
        try {
            const allSongs = await this.getMasterSongs();
            const term = searchTerm.toLowerCase();
            return allSongs.filter((song)=>song.title?.toLowerCase().includes(term) || song.writer?.toLowerCase().includes(term) || song.leadSinger?.toLowerCase().includes(term) || song.category?.toLowerCase().includes(term));
        } catch (error) {
            console.error('Error searching Master Library:', error);
            return [];
        }
    }
    static async importFromMasterLibrary(zoneId, praiseNightId, masterSong, importedBy) {
        try {
            const existingSongs = await this.getSongsByPraiseNight(praiseNightId);
            const alreadyImported = existingSongs.some((s)=>s.importedFrom === 'master' && s.originalSongId === masterSong.id);
            if (alreadyImported) {
                return {
                    success: false,
                    error: 'This song has already been imported to this praise night'
                };
            }
            const maxOrderIndex = existingSongs.reduce((max, s)=>Math.max(max, s.orderIndex || 0), 0);
            const zoneSongData = {
                title: masterSong.title || '',
                lyrics: masterSong.lyrics || '',
                solfa: masterSong.solfa || '',
                key: masterSong.key || '',
                tempo: masterSong.tempo || '',
                writer: masterSong.writer || '',
                leadSinger: masterSong.leadSinger || '',
                category: masterSong.category || '',
                categories: masterSong.categories || [],
                audioFile: masterSong.audioFile || '',
                audioUrls: masterSong.audioUrls || {},
                zoneId,
                praiseNightId,
                orderIndex: maxOrderIndex + 1,
                importedFrom: 'master',
                originalSongId: masterSong.id,
                importedAt: new Date(),
                importedBy,
                status: 'unheard',
                createdAt: new Date(),
                updatedAt: new Date()
            };
            const cleanData = Object.fromEntries(Object.entries(zoneSongData).filter(([_, v])=>v !== undefined));
            const result = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].addDocument('zone_songs', cleanData);
            if (result.success && result.id) {
                await this.incrementMasterSongImportCount(masterSong.id);
                return {
                    success: true,
                    id: result.id
                };
            }
            return {
                success: false,
                error: 'Failed to import song'
            };
        } catch (error) {
            console.error('Error importing from Master Library:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    static async incrementMasterSongImportCount(masterSongId) {
        try {
            const masterSong = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].getDocument('master_songs', masterSongId);
            if (masterSong) {
                const newCount = (masterSong.importCount || 0) + 1;
                await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].updateDocument('master_songs', masterSongId, {
                    importCount: newCount
                });
            }
        } catch (error) {
            console.error('Error incrementing import count:', error);
        }
    }
    static async isImportedFromMaster(songId) {
        try {
            const song = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].getDocument('zone_songs', songId);
            return song?.importedFrom === 'master';
        } catch (error) {
            console.error('Error checking import status:', error);
            return false;
        }
    }
    static async getImportedSongs(zoneId) {
        try {
            const allSongs = await this.getAllSongsByZone(zoneId);
            return allSongs.filter((song)=>song.importedFrom === 'master');
        } catch (error) {
            console.error('Error getting imported songs:', error);
            return [];
        }
    }
}
}),
"[project]/src/utils/low-data-optimizer.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Low Data Optimizer - Super fast loading with minimal Firebase costs
// Instagram-style optimization for poor connections
__turbopack_context__.s([
    "lowDataOptimizer",
    ()=>lowDataOptimizer
]);
class LowDataOptimizer {
    static instance;
    connectionInfo = null;
    isLowData = false;
    cache = new Map();
    // Cache TTLs based on connection speed
    TTL = {
        FAST: 5 * 60 * 1000,
        SLOW: 30 * 60 * 1000,
        VERY_SLOW: 2 * 60 * 60 * 1000,
        OFFLINE: 24 * 60 * 60 * 1000 // 24 hours when offline
    };
    static getInstance() {
        if (!LowDataOptimizer.instance) {
            LowDataOptimizer.instance = new LowDataOptimizer();
        }
        return LowDataOptimizer.instance;
    }
    init() {
        this.detectConnection();
        this.setupEventListeners();
        console.log('📱 Low Data Optimizer initialized');
    }
    detectConnection() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            this.connectionInfo = {
                effectiveType: connection.effectiveType || 'unknown',
                downlink: connection.downlink || 0,
                rtt: connection.rtt || 0,
                saveData: connection.saveData || false
            };
            // Determine if this is a low data connection
            this.isLowData = this.connectionInfo.effectiveType === 'slow-2g' || this.connectionInfo.effectiveType === '2g' || this.connectionInfo.downlink < 1 || this.connectionInfo.saveData;
            console.log('📊 Connection detected:', {
                type: this.connectionInfo.effectiveType,
                speed: this.connectionInfo.downlink + 'Mbps',
                rtt: this.connectionInfo.rtt + 'ms',
                saveData: this.connectionInfo.saveData,
                isLowData: this.isLowData
            });
            if (this.isLowData) {
                console.log('⚠️ Low data connection detected - enabling aggressive caching');
            }
        }
    }
    setupEventListeners() {
        if ('connection' in navigator) {
            const connection = navigator.connection;
            connection.addEventListener('change', ()=>{
                this.detectConnection();
            });
        }
        // Listen for online/offline events
        window.addEventListener('online', ()=>{
            console.log('🌐 Connection restored');
            this.detectConnection();
        });
        window.addEventListener('offline', ()=>{
            console.log('📴 Connection lost');
            this.isLowData = true;
        });
    }
    // Get cache TTL based on connection speed
    getCacheTTL() {
        if (!navigator.onLine) return this.TTL.OFFLINE;
        if (!this.connectionInfo) return this.TTL.FAST;
        switch(this.connectionInfo.effectiveType){
            case 'slow-2g':
            case '2g':
                return this.TTL.VERY_SLOW;
            case '3g':
                return this.TTL.SLOW;
            default:
                return this.TTL.FAST;
        }
    }
    // Smart caching with connection-aware TTL
    set(key, data) {
        const ttl = this.getCacheTTL();
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl
        });
        // Also store in localStorage for persistence
        try {
            localStorage.setItem(`lowdata_${key}`, JSON.stringify({
                data,
                timestamp: Date.now(),
                ttl
            }));
        } catch (error) {
            console.warn('Failed to store in localStorage:', error);
        }
        console.log(`💾 Cached ${key} for ${ttl / 1000 / 60} minutes (low data mode)`);
    }
    get(key) {
        // Check memory cache first
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < cached.ttl) {
            console.log(`⚡ Cache hit: ${key} (instant load)`);
            return cached.data;
        }
        // Check localStorage
        try {
            const stored = localStorage.getItem(`lowdata_${key}`);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Date.now() - parsed.timestamp < parsed.ttl) {
                    // Restore to memory cache
                    this.cache.set(key, parsed);
                    console.log(`💾 Restored ${key} from localStorage`);
                    return parsed.data;
                } else {
                    // Expired, remove it
                    localStorage.removeItem(`lowdata_${key}`);
                }
            }
        } catch (error) {
            console.warn('Failed to read from localStorage:', error);
        }
        return null;
    }
    // Check if we should make a Firebase request
    shouldFetch(key) {
        const cached = this.get(key);
        if (cached) {
            console.log(`🚫 Skipping Firebase request for ${key} (cached)`);
            return false;
        }
        console.log(`🔥 Making Firebase request for ${key}`);
        return true;
    }
    // Get connection info
    getConnectionInfo() {
        return this.connectionInfo;
    }
    // Check if low data mode
    isLowDataMode() {
        return this.isLowData;
    }
    // Clear cache
    clearCache() {
        this.cache.clear();
        // Clear localStorage cache
        Object.keys(localStorage).forEach((key)=>{
            if (key.startsWith('lowdata_')) {
                localStorage.removeItem(key);
            }
        });
        console.log('🧹 Low data cache cleared');
    }
    // Get cache stats
    getCacheStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}
const lowDataOptimizer = LowDataOptimizer.getInstance();
}),
"[project]/src/hooks/useRealtimeData.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useRealtimeData",
    ()=>useRealtimeData
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase-database.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$zone$2d$database$2d$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/zone-database-service.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$praise$2d$night$2d$songs$2d$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/praise-night-songs-service.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$low$2d$data$2d$optimizer$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/low-data-optimizer.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/config/zones.ts [app-ssr] (ecmascript)");
;
;
;
;
;
;
async function fetchFirebaseData(zoneId) {
    try {
        let pages = [];
        if (zoneId && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$zones$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isHQGroup"])(zoneId)) {
            pages = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].getCollection('praise_nights');
        } else if (zoneId) {
            pages = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$zone$2d$database$2d$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ZoneDatabaseService"].getPraiseNightsByZone(zoneId, 1000);
        } else {
            pages = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].getCollection('praise_nights');
        }
        return pages.map((page)=>({
                id: page.id,
                firebaseId: page.id,
                name: page.name || page.title || page.page_title || 'Untitled Page',
                date: page.date || new Date().toISOString(),
                location: page.location || '',
                category: page.category || 'ongoing',
                pageCategory: page.pageCategory || undefined,
                bannerImage: page.bannerImage || page.bannerimage || '',
                countdown: {
                    days: page.countdownDays || page.countdown?.days || page.countdowndays || 0,
                    hours: page.countdownHours || page.countdown?.hours || page.countdownhours || 0,
                    minutes: page.countdownMinutes || page.countdown?.minutes || page.countdownminutes || 0,
                    seconds: page.countdownSeconds || page.countdown?.seconds || page.countdownseconds || 0
                },
                songs: []
            }));
    } catch (error) {
        console.error('Error fetching Firebase data:', error);
        return [];
    }
}
function useRealtimeData(zoneId) {
    const [pages, setPages] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!zoneId) return;
        async function loadData() {
            try {
                setError(null);
                const cacheKey = `praise-nights-data-${zoneId}`;
                const cachedData = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$low$2d$data$2d$optimizer$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["lowDataOptimizer"].get(cacheKey);
                if (cachedData) {
                    setPages(cachedData);
                    setLoading(false);
                } else {
                    setLoading(true);
                }
                if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$low$2d$data$2d$optimizer$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["lowDataOptimizer"].shouldFetch(cacheKey)) {
                    const firebasePages = await fetchFirebaseData(zoneId);
                    setPages(firebasePages);
                    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$low$2d$data$2d$optimizer$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["lowDataOptimizer"].set(cacheKey, firebasePages);
                }
            } catch (err) {
                console.error('Failed to load data:', err);
                setError(err instanceof Error ? err.message : 'Failed to load data');
                const cacheKey = `praise-nights-data-${zoneId}`;
                const cachedData = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$low$2d$data$2d$optimizer$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["lowDataOptimizer"].get(cacheKey);
                if (cachedData) {
                    setPages(cachedData);
                }
            } finally{
                setLoading(false);
            }
        }
        loadData();
    }, [
        zoneId
    ]);
    const getCurrentPage = (id)=>{
        return pages.find((page)=>page.id === id || page.id === id.toString()) || null;
    };
    const getCurrentSongs = async (pageId)=>{
        try {
            return await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$praise$2d$night$2d$songs$2d$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PraiseNightSongsService"].getSongsByPraiseNight(String(pageId), zoneId);
        } catch (error) {
            console.error(`Error fetching songs for page ${pageId}:`, error);
            return [];
        }
    };
    return {
        pages,
        loading,
        error,
        getCurrentPage,
        getCurrentSongs,
        refreshData: async ()=>{
            try {
                setLoading(true);
                setError(null);
                const updatedPages = await fetchFirebaseData();
                setPages(updatedPages);
                const cacheKey = 'praise-nights-data';
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$low$2d$data$2d$optimizer$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["lowDataOptimizer"].set(cacheKey, updatedPages);
            } catch (err) {
                console.error('Error refreshing data:', err);
                setError('Failed to refresh data');
            } finally{
                setLoading(false);
            }
        }
    };
}
function showNotification(message, type) {
    window.dispatchEvent(new CustomEvent('showToast', {
        detail: {
            message,
            type
        }
    }));
}
}),
"[project]/src/config/menuItems.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getMenuItems",
    ()=>getMenuItems
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$house$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Home$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/house.js [app-ssr] (ecmascript) <export default as Home>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/user.js [app-ssr] (ecmascript) <export default as User>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Bell$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/bell.js [app-ssr] (ecmascript) <export default as Bell>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/users.js [app-ssr] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$music$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Music$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/music.js [app-ssr] (ecmascript) <export default as Music>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar.js [app-ssr] (ecmascript) <export default as Calendar>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$question$2d$mark$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__HelpCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-question-mark.js [app-ssr] (ecmascript) <export default as HelpCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/log-out.js [app-ssr] (ecmascript) <export default as LogOut>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$cw$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCw$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/rotate-cw.js [app-ssr] (ecmascript) <export default as RotateCw>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$film$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Film$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/film.js [app-ssr] (ecmascript) <export default as Film>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shield.js [app-ssr] (ecmascript) <export default as Shield>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$crown$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Crown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/crown.js [app-ssr] (ecmascript) <export default as Crown>");
;
const getMenuItems = (onLogout, onRefresh, isCoordinator, isBoss)=>[
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$house$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Home$3e$__["Home"],
            title: 'Home',
            href: '/home',
            badge: null
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$user$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__User$3e$__["User"],
            title: 'Profile',
            href: '/pages/profile',
            badge: null
        },
        ...isCoordinator ? [
            {
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Shield$3e$__["Shield"],
                title: 'Admin Panel',
                href: '/admin',
                badge: null,
                coordinatorOnly: true
            }
        ] : [],
        ...isBoss ? [
            {
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$crown$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Crown$3e$__["Crown"],
                title: 'Central Admin',
                href: '/boss',
                badge: null,
                bossOnly: true
            }
        ] : [],
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$bell$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Bell$3e$__["Bell"],
            title: 'Notifications',
            href: '/pages/notifications',
            badge: true
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"],
            title: 'Groups',
            href: '/pages/groups',
            badge: null
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$film$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Film$3e$__["Film"],
            title: 'Media',
            href: '/pages/media',
            badge: null
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$music$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Music$3e$__["Music"],
            title: 'Submit Song',
            href: '/pages/submit-song',
            badge: null
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__["Calendar"],
            title: 'Rehearsals',
            href: '/pages/rehearsals',
            badge: null
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__["Calendar"],
            title: 'Ministry Calendar',
            href: '/pages/calendar',
            badge: null
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$question$2d$mark$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__HelpCircle$3e$__["HelpCircle"],
            title: 'Admin Support',
            href: '/pages/support',
            badge: null
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$rotate$2d$cw$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__RotateCw$3e$__["RotateCw"],
            title: 'Refresh App',
            badge: null,
            onClick: onRefresh || (()=>{
                console.log('⚠️ Refresh callback not provided, using fallback');
                if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
                ;
            })
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$log$2d$out$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__LogOut$3e$__["LogOut"],
            title: 'Logout',
            badge: null,
            onClick: onLogout || (()=>{
                console.log('⚠️ Logout callback not provided - no fallback redirect');
            // No hard redirect - let the app handle it
            })
        }
    ] // bro ha laoding program daa is o slow ver slow wh i hough is mean o be insan and a;lso he song card is no showing he rehearsal coun updae i is working bu is no showing he updae check if i is geing he rehearsal coun well from he meadaa spli or rimem
;
}),
"[project]/src/hooks/usePageSearch.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "usePageSearch",
    ()=>usePageSearch
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
;
function usePageSearch(currentPage) {
    const [searchQuery, setSearchQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const searchResults = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!searchQuery.trim() || !currentPage?.songs) return [];
        const query = searchQuery.toLowerCase().trim();
        const results = [];
        currentPage.songs.forEach((song)=>{
            const matchesTitle = song.title.toLowerCase().includes(query);
            const matchesWriter = song.writer?.toLowerCase().includes(query);
            const matchesLeadSinger = song.leadSinger?.toLowerCase().includes(query);
            const matchesConductor = song.conductor?.toLowerCase().includes(query);
            const matchesCategory = song.category.toLowerCase().includes(query);
            const matchesKey = song.key?.toLowerCase().includes(query);
            const matchesLyrics = song.lyrics?.toLowerCase().includes(query);
            const matchesSolfas = song.solfas?.toLowerCase().includes(query);
            if (matchesTitle || matchesWriter || matchesLeadSinger || matchesConductor || matchesCategory || matchesKey || matchesLyrics || matchesSolfas) {
                let matchReason = '';
                if (matchesTitle) matchReason = 'Song Title';
                else if (matchesWriter) matchReason = `Writer: ${song.writer}`;
                else if (matchesLeadSinger) matchReason = `Lead Singer: ${song.leadSinger}`;
                else if (matchesConductor) matchReason = `Conductor: ${song.conductor}`;
                else if (matchesCategory) matchReason = `Category: ${song.category}`;
                else if (matchesKey) matchReason = `Key: ${song.key}`;
                else if (matchesLyrics) matchReason = 'Lyrics Content';
                else if (matchesSolfas) matchReason = 'Solfas Content';
                results.push({
                    id: `song-${song.title}-${currentPage.id}`,
                    type: 'song',
                    title: song.title,
                    subtitle: matchReason,
                    description: `${song.category} • ${song.status}`,
                    category: song.category,
                    status: song.status
                });
            }
        });
        const categories = [
            ...new Set(currentPage.songs.map((song)=>song.category))
        ];
        categories.forEach((category)=>{
            if (category.toLowerCase().includes(query)) {
                const songsInCategory = currentPage.songs.filter((song)=>song.category === category);
                results.push({
                    id: `category-${category}-${currentPage.id}`,
                    type: 'category',
                    title: category,
                    subtitle: 'Song Category',
                    description: `${songsInCategory.length} songs`,
                    category: category
                });
            }
        });
        return results.sort((a, b)=>{
            const aExact = a.title.toLowerCase() === query;
            const bExact = b.title.toLowerCase() === query;
            if (aExact && !bExact) return -1;
            if (!aExact && bExact) return 1;
            const typePriority = {
                song: 0,
                category: 1
            };
            const aPriority = typePriority[a.type];
            const bPriority = typePriority[b.type];
            if (aPriority !== bPriority) return aPriority - bPriority;
            return a.title.localeCompare(b.title);
        }).slice(0, 10);
    }, [
        searchQuery,
        currentPage
    ]);
    return {
        searchQuery,
        setSearchQuery,
        searchResults,
        hasResults: searchResults.length > 0
    };
}
}),
"[project]/src/hooks/useServerCountdown.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useServerCountdown",
    ()=>useServerCountdown
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase-database.ts [app-ssr] (ecmascript)");
;
;
function useServerCountdown({ targetDate, countdownData, praiseNightId }) {
    const [timeLeft, setTimeLeft] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });
    const [serverTimeOffset, setServerTimeOffset] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(0);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const intervalRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const targetDateRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const serverTimeOffsetRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0);
    // Serialize countdownData for stable dependency comparison
    const countdownKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!countdownData) return '';
        return `${countdownData.days}-${countdownData.hours}-${countdownData.minutes}-${countdownData.seconds}`;
    }, [
        countdownData?.days,
        countdownData?.hours,
        countdownData?.minutes,
        countdownData?.seconds
    ]);
    const fetchServerTime = async ()=>{
        try {
            const response = await fetch('/api/countdown', {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });
            if (!response.ok) throw new Error('Failed to fetch server time');
            const data = await response.json();
            const serverTime = new Date(data.serverTime);
            const clientTime = new Date();
            const offset = serverTime.getTime() - clientTime.getTime();
            setServerTimeOffset(offset);
            serverTimeOffsetRef.current = offset;
            return serverTime;
        } catch (err) {
            console.error('Error fetching server time:', err);
            setError('Failed to sync with server time');
            setServerTimeOffset(0);
            serverTimeOffsetRef.current = 0;
            return new Date();
        }
    };
    const calculateTimeLeft = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (!targetDateRef.current) return;
        const now = new Date();
        const syncedTime = new Date(now.getTime() + serverTimeOffsetRef.current);
        const difference = targetDateRef.current.getTime() - syncedTime.getTime();
        if (difference > 0) {
            setTimeLeft({
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor(difference / (1000 * 60 * 60) % 24),
                minutes: Math.floor(difference / (1000 * 60) % 60),
                seconds: Math.floor(difference / 1000 % 60)
            });
        } else {
            setTimeLeft({
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0
            });
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const initializeCountdown = async ()=>{
            console.log('🕐 Initializing countdown:', {
                praiseNightId,
                countdownData,
                countdownKey
            });
            setIsLoading(true);
            setError(null);
            // Clear any existing interval
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            try {
                const serverTime = await fetchServerTime();
                let target = null;
                if (targetDate) {
                    target = targetDate;
                    console.log('🕐 Using provided targetDate:', target);
                } else if (countdownData && (countdownData.days > 0 || countdownData.hours > 0 || countdownData.minutes > 0 || countdownData.seconds > 0)) {
                    let storedTargetDate = null;
                    if (praiseNightId) {
                        try {
                            const countdownDoc = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].getDocument('countdowns', praiseNightId.toString());
                            if (countdownDoc && countdownDoc.targetDate) {
                                storedTargetDate = countdownDoc.targetDate;
                                console.log('🕐 Found stored target date:', storedTargetDate);
                            }
                        } catch (error) {
                            console.log('🕐 No stored countdown found, will calculate new one');
                        }
                    }
                    if (storedTargetDate) {
                        target = new Date(storedTargetDate);
                        // Check if stored target is in the past
                        if (target.getTime() <= serverTime.getTime()) {
                            console.log('🕐 Stored target is in the past, recalculating...');
                            // Recalculate target from countdownData
                            const totalMs = countdownData.days * 24 * 60 * 60 * 1000 + countdownData.hours * 60 * 60 * 1000 + countdownData.minutes * 60 * 1000 + countdownData.seconds * 1000;
                            target = new Date(serverTime.getTime() + totalMs);
                            // Update stored target
                            if (praiseNightId) {
                                try {
                                    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].updateDocument('countdowns', praiseNightId.toString(), {
                                        targetDate: target.toISOString(),
                                        updatedAt: new Date(),
                                        praiseNightId: praiseNightId
                                    });
                                    console.log('🕐 Updated stored target date:', target.toISOString());
                                } catch (error) {
                                    console.error('Failed to update target date:', error);
                                }
                            }
                        }
                    } else {
                        const totalMs = countdownData.days * 24 * 60 * 60 * 1000 + countdownData.hours * 60 * 60 * 1000 + countdownData.minutes * 60 * 1000 + countdownData.seconds * 1000;
                        target = new Date(serverTime.getTime() + totalMs);
                        console.log('🕐 Calculated new target date:', target.toISOString());
                        if (praiseNightId) {
                            try {
                                await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2d$database$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FirebaseDatabaseService"].createDocument('countdowns', praiseNightId.toString(), {
                                    targetDate: target.toISOString(),
                                    createdAt: new Date(),
                                    praiseNightId: praiseNightId
                                });
                                console.log('🕐 Stored new target date in Firebase');
                            } catch (error) {
                                console.error('Failed to store target date:', error);
                            }
                        }
                    }
                } else {
                    console.log('🕐 No countdown data provided or all values are 0');
                }
                if (!target) {
                    setTimeLeft({
                        days: 0,
                        hours: 0,
                        minutes: 0,
                        seconds: 0
                    });
                    setIsLoading(false);
                    return;
                }
                targetDateRef.current = target;
                calculateTimeLeft();
                intervalRef.current = setInterval(calculateTimeLeft, 1000);
                console.log('🕐 Countdown interval started');
            } catch (err) {
                console.error('Error initializing countdown:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally{
                setIsLoading(false);
            }
        };
        initializeCountdown();
        return ()=>{
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [
        praiseNightId,
        targetDate,
        countdownKey,
        calculateTimeLeft
    ]);
    // Sync with server every 30 seconds
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const syncInterval = setInterval(fetchServerTime, 30000);
        return ()=>clearInterval(syncInterval);
    }, []);
    return {
        timeLeft,
        isLoading,
        error,
        serverTimeOffset
    };
}
}),
"[project]/src/utils/refresh-utils.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Utility function for refreshing app data while preserving auth and zone state
__turbopack_context__.s([
    "handleAppRefresh",
    ()=>handleAppRefresh
]);
const handleAppRefresh = async ()=>{
    try {
        console.log('🔄 Refreshing app data...');
        console.log('🔐 Preserving authentication and zone data...');
        // Show user feedback
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        // Keys to ALWAYS preserve (auth, zone state, important user data)
        const keysToPreserve = [
            // Firebase/Auth
            'firebase',
            'auth',
            'session',
            'loveworld-singers-session',
            'firebase:',
            '__firebase',
            // Zustand stores - CRITICAL: preserve zone and auth state
            'lwsrh-zone-state',
            'lwsrh-auth-state',
            'currentZoneId',
            // Countdown persistence
            'server_target_date_',
            'countdown_hash_',
            // User preferences
            'theme',
            'language'
        ];
        // Only clear non-essential cache data
        const keysToRemove = [];
        for(let i = 0; i < localStorage.length; i++){
            const key = localStorage.key(i);
            if (key) {
                // Check if this key should be preserved
                const shouldPreserve = keysToPreserve.some((preserve)=>key.includes(preserve) || key.startsWith(preserve));
                if (!shouldPreserve) {
                    keysToRemove.push(key);
                }
            }
        }
        keysToRemove.forEach((key)=>{
            console.log('🗑️ Clearing cache key:', key);
            localStorage.removeItem(key);
        });
        console.log('✅ Non-essential cache cleared');
        console.log('🔐 Auth and zone data preserved');
        // Instead of page reload, refresh data in Zustand stores
        try {
            // Dynamically import to avoid circular dependencies
            const { useZoneStore } = await __turbopack_context__.A("[project]/src/stores/zoneStore.ts [app-ssr] (ecmascript, async loader)");
            // Refresh zone data from server (without clearing state)
            console.log('🔄 Refreshing zone data from server...');
            await useZoneStore.getState().refreshZones();
            // Remove loading indicator
            const loadingDiv = document.getElementById('refresh-loading-indicator');
            if (loadingDiv) {
                loadingDiv.remove();
            }
            // Show success message
            showRefreshSuccess();
            console.log('✅ App data refreshed successfully!');
        } catch (storeError) {
            console.warn('Could not refresh stores, falling back to page reload:', storeError);
            // Fallback to page reload if store refresh fails
            setTimeout(()=>{
                const loadingDiv = document.getElementById('refresh-loading-indicator');
                if (loadingDiv) {
                    loadingDiv.remove();
                }
                window.location.reload();
            }, 500);
        }
    } catch (error) {
        console.error('❌ Refresh error:', error);
        // Remove loading indicator
        const loadingDiv = document.getElementById('refresh-loading-indicator');
        if (loadingDiv) {
            loadingDiv.remove();
        }
        // Fallback to page reload
        window.location.reload();
    }
};
// Show a brief success toast
const showRefreshSuccess = ()=>{
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
    const toast = undefined;
};
}),
"[project]/src/app/pages/praise-night/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PraiseNightPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/styled-jsx/style.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-ssr] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-left.js [app-ssr] (ecmascript) <export default as ChevronLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.js [app-ssr] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clock.js [app-ssr] (ecmascript) <export default as Clock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$music$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Music$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/music.js [app-ssr] (ecmascript) <export default as Music>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/book-open.js [app-ssr] (ecmascript) <export default as BookOpen>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$timer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Timer$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/timer.js [app-ssr] (ecmascript) <export default as Timer>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mic$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Mic$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/mic.js [app-ssr] (ecmascript) <export default as Mic>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-ssr] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/play.js [app-ssr] (ecmascript) <export default as Play>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/users.js [app-ssr] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/calendar.js [app-ssr] (ecmascript) <export default as Calendar>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/heart.js [app-ssr] (ecmascript) <export default as Heart>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sparkles.js [app-ssr] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-left.js [app-ssr] (ecmascript) <export default as ArrowLeft>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$skip$2d$forward$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__SkipForward$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/skip-forward.js [app-ssr] (ecmascript) <export default as SkipForward>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$piano$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Piano$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/piano.js [app-ssr] (ecmascript) <export default as Piano>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$hand$2d$metal$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__HandMetal$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/hand-metal.js [app-ssr] (ecmascript) <export default as HandMetal>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$volume$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Volume2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/volume-2.js [app-ssr] (ecmascript) <export default as Volume2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flag$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Flag$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/flag.js [app-ssr] (ecmascript) <export default as Flag>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$archive$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Archive$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/archive.js [app-ssr] (ecmascript) <export default as Archive>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$SongDetailModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/SongDetailModal.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ScreenHeader$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ScreenHeader.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$SharedDrawer$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/SharedDrawer.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$AudioWave$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/AudioWave.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useRealtimeData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useRealtimeData.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useZone$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useZone.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$zone$2d$database$2d$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/zone-database-service.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$menuItems$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/config/menuItems.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$AudioContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/contexts/AudioContext.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$usePageSearch$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/usePageSearch.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useAuth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useAuth.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useServerCountdown$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/useServerCountdown.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$refresh$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/refresh-utils.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$low$2d$data$2d$optimizer$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/low-data-optimizer.ts [app-ssr] (ecmascript)");
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
function PraiseNightPageContent() {
    const searchParams = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSearchParams"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const { currentZone } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useZone$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useZone"])();
    const categoryFilter = searchParams.get('category');
    const pageParam = searchParams.get('page');
    const songParam = searchParams.get('song');
    // Get zone color for theming
    const zoneColor = currentZone?.themeColor || '#9333EA';
    // Helper function to get color classes based on zone color
    const getZoneColorClasses = (variant = 'solid')=>{
        const colorMap = {
            '#10B981': {
                solid: 'bg-emerald-600',
                light: 'bg-emerald-100 text-emerald-700',
                ring: 'ring-emerald-400',
                text: 'text-emerald-600',
                hover: 'hover:bg-emerald-700'
            },
            '#3B82F6': {
                solid: 'bg-blue-600',
                light: 'bg-blue-100 text-blue-700',
                ring: 'ring-blue-400',
                text: 'text-blue-600',
                hover: 'hover:bg-blue-700'
            },
            '#F59E0B': {
                solid: 'bg-amber-600',
                light: 'bg-amber-100 text-amber-700',
                ring: 'ring-amber-400',
                text: 'text-amber-600',
                hover: 'hover:bg-amber-700'
            },
            '#EF4444': {
                solid: 'bg-red-600',
                light: 'bg-red-100 text-red-700',
                ring: 'ring-red-400',
                text: 'text-red-600',
                hover: 'hover:bg-red-700'
            },
            '#8B5CF6': {
                solid: 'bg-violet-600',
                light: 'bg-violet-100 text-violet-700',
                ring: 'ring-violet-400',
                text: 'text-violet-600',
                hover: 'hover:bg-violet-700'
            },
            '#EC4899': {
                solid: 'bg-pink-600',
                light: 'bg-pink-100 text-pink-700',
                ring: 'ring-pink-400',
                text: 'text-pink-600',
                hover: 'hover:bg-pink-700'
            },
            '#14B8A6': {
                solid: 'bg-teal-600',
                light: 'bg-teal-100 text-teal-700',
                ring: 'ring-teal-400',
                text: 'text-teal-600',
                hover: 'hover:bg-teal-700'
            },
            '#6366F1': {
                solid: 'bg-indigo-600',
                light: 'bg-indigo-100 text-indigo-700',
                ring: 'ring-indigo-400',
                text: 'text-indigo-600',
                hover: 'hover:bg-indigo-700'
            },
            '#F97316': {
                solid: 'bg-orange-600',
                light: 'bg-orange-100 text-orange-700',
                ring: 'ring-orange-400',
                text: 'text-orange-600',
                hover: 'hover:bg-orange-700'
            },
            '#84CC16': {
                solid: 'bg-lime-600',
                light: 'bg-lime-100 text-lime-700',
                ring: 'ring-lime-400',
                text: 'text-lime-600',
                hover: 'hover:bg-lime-700'
            },
            '#06B6D4': {
                solid: 'bg-cyan-600',
                light: 'bg-cyan-100 text-cyan-700',
                ring: 'ring-cyan-400',
                text: 'text-cyan-600',
                hover: 'hover:bg-cyan-700'
            },
            '#A855F7': {
                solid: 'bg-purple-600',
                light: 'bg-purple-100 text-purple-700',
                ring: 'ring-purple-400',
                text: 'text-purple-600',
                hover: 'hover:bg-purple-700'
            },
            '#22D3EE': {
                solid: 'bg-sky-600',
                light: 'bg-sky-100 text-sky-700',
                ring: 'ring-sky-400',
                text: 'text-sky-600',
                hover: 'hover:bg-sky-700'
            },
            '#FB923C': {
                solid: 'bg-orange-500',
                light: 'bg-orange-100 text-orange-700',
                ring: 'ring-orange-400',
                text: 'text-orange-600',
                hover: 'hover:bg-orange-600'
            },
            '#DC2626': {
                solid: 'bg-red-700',
                light: 'bg-red-100 text-red-800',
                ring: 'ring-red-500',
                text: 'text-red-700',
                hover: 'hover:bg-red-800'
            },
            '#059669': {
                solid: 'bg-emerald-700',
                light: 'bg-emerald-100 text-emerald-800',
                ring: 'ring-emerald-500',
                text: 'text-emerald-700',
                hover: 'hover:bg-emerald-800'
            },
            '#7C3AED': {
                solid: 'bg-violet-700',
                light: 'bg-violet-100 text-violet-800',
                ring: 'ring-violet-500',
                text: 'text-violet-700',
                hover: 'hover:bg-violet-800'
            },
            '#9333EA': {
                solid: 'bg-purple-600',
                light: 'bg-purple-100 text-purple-700',
                ring: 'ring-purple-400',
                text: 'text-purple-600',
                hover: 'hover:bg-purple-700'
            }
        };
        return colorMap[zoneColor]?.[variant] || colorMap['#9333EA'][variant];
    };
    // Use real-time zone-aware data for instant updates
    const { pages: allPraiseNights, loading, error, getCurrentPage, getCurrentSongs, refreshData } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useRealtimeData$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRealtimeData"])(currentZone?.id);
    const { signOut } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useAuth$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuth"])();
    const [currentPraiseNight, setCurrentPraiseNightState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [showDropdown, setShowDropdown] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // Debug dropdown state
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (showDropdown) {
            console.log('🔽 Dropdown opened, categoryFilter:', categoryFilter);
        } else {
            console.log('🔼 Dropdown closed, categoryFilter:', categoryFilter);
        }
    }, [
        showDropdown,
        categoryFilter
    ]);
    // Re-initialize safe area when category changes (fixes bottom bar cut-off issue)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const reinitializeSafeArea = async ()=>{
            // Force re-calculation of safe area when navigating between categories
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
        };
        // Re-initialize when category changes
        if (categoryFilter) {
            reinitializeSafeArea();
        }
    }, [
        categoryFilter
    ]);
    const [isRefreshing, setIsRefreshing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isSearchOpen, setIsSearchOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedPageCategory, setSelectedPageCategory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [pageCategories, setPageCategories] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loadingPageCategories, setLoadingPageCategories] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    // Load songs on demand like admin does
    const [allSongsFromFirebase, setAllSongsFromFirebase] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [songsLoading, setSongsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // Load page categories (zone-aware) with caching
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const loadPageCategories = async ()=>{
            if (!currentZone?.id) {
                console.log('⏳ Waiting for zone to load page categories...');
                return;
            }
            // Check cache first (5 minute TTL for page categories - they rarely change)
            const cacheKey = `page-categories-${currentZone.id}`;
            const cached = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$low$2d$data$2d$optimizer$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["lowDataOptimizer"].get(cacheKey);
            if (cached) {
                console.log('📦 [PageCategories] Using cached data');
                setPageCategories(cached);
                setLoadingPageCategories(false);
                return;
            }
            setLoadingPageCategories(true);
            try {
                console.log('🌍 Loading page categories for zone:', currentZone.id);
                // Use getPageCategories which handles both HQ (unfiltered) and zone (filtered) cases
                const categories = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$zone$2d$database$2d$service$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ZoneDatabaseService"].getPageCategories(currentZone.id);
                console.log('📂 Loaded page categories:', categories);
                setPageCategories(categories);
                // Cache for 5 minutes
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$low$2d$data$2d$optimizer$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["lowDataOptimizer"].set(cacheKey, categories);
            } catch (error) {
                console.error('❌ Error loading page categories:', error);
                setPageCategories([]);
            } finally{
                setLoadingPageCategories(false);
            }
        };
        loadPageCategories();
    }, [
        currentZone?.id
    ]);
    // Filter praise nights by category if specified
    const filteredPraiseNights = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (loading || !allPraiseNights) return [];
        let filtered = allPraiseNights;
        // Filter by category (archive, ongoing, etc.)
        if (categoryFilter) {
            filtered = filtered.filter((praiseNight)=>praiseNight.category === categoryFilter);
            console.log(`🔍 After category filter (${categoryFilter}):`, filtered.length, 'pages');
        } else {
            // When no category filter, exclude unassigned pages from regular view
            filtered = filtered.filter((praiseNight)=>praiseNight.category !== 'unassigned');
        }
        // Filter by page category if selected
        if (selectedPageCategory) {
            console.log(`🔍 Filtering by page category: "${selectedPageCategory}"`);
            const beforeCount = filtered.length;
            filtered = filtered.filter((praiseNight)=>{
                const matches = praiseNight.pageCategory === selectedPageCategory;
                if (!matches) {
                    console.log(`❌ Page "${praiseNight.name}" pageCategory="${praiseNight.pageCategory}" !== "${selectedPageCategory}"`);
                } else {
                    console.log(`✅ Page "${praiseNight.name}" matches!`);
                }
                return matches;
            });
            console.log(`🔍 After page category filter: ${filtered.length} pages (was ${beforeCount})`);
        }
        return filtered;
    }, [
        allPraiseNights,
        categoryFilter,
        selectedPageCategory,
        loading
    ]);
    // Preload data for instant access
    // No preloading needed - data loads fresh on each request
    // Refresh data when page becomes visible (after admin updates)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const handleVisibilityChange = async ()=>{
            if (!document.hidden) {
                console.log('🔄 Page became visible, refreshing data...');
                refreshData();
                // Also re-initialize safe area when page becomes visible
                const { SafeAreaManager } = await __turbopack_context__.A("[project]/src/utils/safeAreaManager.ts [app-ssr] (ecmascript, async loader)");
                const safeAreaManager = SafeAreaManager.getInstance();
                safeAreaManager.recalculate();
                console.log('🛡️ Safe area recalculated after page visibility change');
            }
        };
        const handleFocus = async ()=>{
            console.log('🔄 Page focused, refreshing data...');
            refreshData();
            // Re-initialize safe area when page gains focus
            const { SafeAreaManager } = await __turbopack_context__.A("[project]/src/utils/safeAreaManager.ts [app-ssr] (ecmascript, async loader)");
            const safeAreaManager = SafeAreaManager.getInstance();
            safeAreaManager.recalculate();
            console.log('🛡️ Safe area recalculated after page focus');
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);
        return ()=>{
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, [
        refreshData
    ]);
    // Periodic refresh to ensure data stays up to date (optimized interval)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const refreshInterval = setInterval(()=>{
            console.log('🔄 Periodic refresh...');
            refreshData();
        }, 60000); // Refresh every 60 seconds (reduced from 30s to save Firebase reads)
        return ()=>{
            clearInterval(refreshInterval);
        };
    }, [
        refreshData
    ]);
    // Handle page parameter from search results
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (pageParam && allPraiseNights.length > 0) {
            // Handle both number IDs and Firebase document IDs
            const targetPage = allPraiseNights.find((page)=>page.id === pageParam || page.id === pageParam.toString() || page.id === parseInt(pageParam).toString());
            if (targetPage) {
                setCurrentPraiseNightState(targetPage);
                console.log('🎯 Navigated to page from search:', targetPage.name, 'ID:', targetPage.id);
            } else {
                console.log('❌ Page not found for param:', pageParam, 'Available pages:', allPraiseNights.map((p)=>({
                        id: p.id,
                        name: p.name
                    })));
            }
        }
    }, [
        pageParam,
        allPraiseNights
    ]);
    // Handle song parameter from search results
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (songParam && currentPraiseNight && allSongsFromFirebase.length > 0) {
            const targetSong = allSongsFromFirebase.find((song)=>song.title === decodeURIComponent(songParam));
            if (targetSong) {
                const songIndex = allSongsFromFirebase.indexOf(targetSong);
                handleSongClick(targetSong, songIndex);
                console.log('🎯 Opened song from search:', targetSong.title);
            }
        }
    }, [
        songParam,
        currentPraiseNight,
        allSongsFromFirebase
    ]);
    // Auto-select first page only when no page is selected and no page parameter
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (filteredPraiseNights.length > 0 && !currentPraiseNight && !pageParam) {
            // Only auto-select if no page is currently selected and no page parameter
            const firstPage = filteredPraiseNights[0];
            setCurrentPraiseNightState(firstPage);
            console.log('🎯 Auto-selected first page:', firstPage.name, 'Category:', firstPage.category);
        }
    }, [
        filteredPraiseNights,
        currentPraiseNight,
        pageParam
    ]);
    // Debug page selection
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        console.log('🔍 Page Selection Debug:', {
            categoryFilter,
            pageParam,
            currentPraiseNightName: currentPraiseNight?.name,
            currentPraiseNightCategory: currentPraiseNight?.category,
            filteredPraiseNights: filteredPraiseNights.map((p)=>({
                    name: p.name,
                    category: p.category,
                    hasCountdown: !!p.countdown
                })),
            allPraiseNights: allPraiseNights.map((p)=>({
                    name: p.name,
                    category: p.category,
                    hasCountdown: !!p.countdown
                }))
        });
    }, [
        categoryFilter,
        pageParam,
        currentPraiseNight,
        filteredPraiseNights,
        allPraiseNights
    ]);
    // Auto-select a page with countdown data if current page has none
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (currentPraiseNight && !currentPraiseNight.countdown && allPraiseNights.length > 0) {
            const pageWithCountdown = allPraiseNights.find((p)=>p.countdown && (p.countdown.days > 0 || p.countdown.hours > 0 || p.countdown.minutes > 0 || p.countdown.seconds > 0));
            if (pageWithCountdown) {
                console.log('🔄 Switching to page with countdown:', pageWithCountdown.name);
                setCurrentPraiseNightState(pageWithCountdown);
            }
        }
    }, [
        currentPraiseNight,
        allPraiseNights
    ]);
    // Real-time data automatically loads songs, so we don't need the manual loading effect anymore
    const [collapsedSections, setCollapsedSections] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const [isMenuOpen, setIsMenuOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // Audio context
    const { currentSong, isPlaying, setCurrentSong, play, isLoading, hasError, audioRef } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$contexts$2f$AudioContext$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAudio"])();
    // Add missing state variables that are used but not defined
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('lyrics');
    // Filter states
    const [activeFilter, setActiveFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('heard');
    const [activeCategory, setActiveCategory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    // ✅ Reset filter to 'heard' only when switching to a different page (not when just loading)
    const [previousPageId, setPreviousPageId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (currentPraiseNight && currentPraiseNight.id !== previousPageId) {
            setActiveFilter('heard');
            setPreviousPageId(currentPraiseNight.id);
        }
    }, [
        currentPraiseNight,
        previousPageId
    ]);
    // Song detail modal states
    const [selectedSong, setSelectedSong] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isSongDetailOpen, setIsSongDetailOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedSongIndex, setSelectedSongIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [hoveredCategory, setHoveredCategory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    // Listen for global mini player events
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"].useEffect(()=>{
        const handleOpenFullPlayer = (event)=>{
            const song = event.detail.song;
            if (song) {
                setSelectedSong(song);
                setIsSongDetailOpen(true);
                // Dispatch event to hide mini player
                window.dispatchEvent(new CustomEvent('songDetailOpen'));
            }
        };
        window.addEventListener('openFullPlayer', handleOpenFullPlayer);
        return ()=>{
            window.removeEventListener('openFullPlayer', handleOpenFullPlayer);
        };
    }, []);
    // Use the banner image from the database, fallback to default
    const ecardSrc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (!currentPraiseNight) return "/Ecards/1000876785.png";
        console.log('🖼️ Banner Image Debug:', {
            pageId: currentPraiseNight.id,
            pageName: currentPraiseNight.name,
            bannerImage: currentPraiseNight.bannerImage,
            hasBannerImage: !!currentPraiseNight.bannerImage
        });
        // Use the bannerImage from the database if available
        if (currentPraiseNight.bannerImage) {
            console.log('✅ Using database banner image:', currentPraiseNight.bannerImage);
            return currentPraiseNight.bannerImage;
        }
        console.log('⚠️ No banner image in database, using fallback');
        // Fallback to default image
        return "/Ecards/1000876785.png";
    }, [
        currentPraiseNight
    ]);
    const toggleMenu = ()=>{
        setIsMenuOpen(!isMenuOpen);
    };
    const handleLogout = async ()=>{
        try {
            await signOut();
        // Don't use router.push - signOut already handles redirect
        } catch (error) {
            console.error('Logout error:', error);
        }
    };
    // ✅ Refresh functionality (clears cache but preserves auth)
    const handleRefresh = async ()=>{
        setIsRefreshing(true);
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$refresh$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["handleAppRefresh"])();
        } finally{
            setIsRefreshing(false);
        }
    };
    const menuItems = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$menuItems$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getMenuItems"])(handleLogout, handleRefresh);
    // Server-side countdown timer that syncs with server time
    const { timeLeft, isLoading: countdownLoading, error: countdownError } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$useServerCountdown$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useServerCountdown"])({
        countdownData: currentPraiseNight?.countdown,
        praiseNightId: currentPraiseNight?.id
    });
    // Debug what's being passed to useServerCountdown
    console.log('🔍 useServerCountdown Input:', {
        currentPraiseNightName: currentPraiseNight?.name,
        currentPraiseNightId: currentPraiseNight?.id,
        countdownData: currentPraiseNight?.countdown,
        hasCountdown: !!currentPraiseNight?.countdown,
        categoryFilter,
        filteredPraiseNightsCount: filteredPraiseNights.length,
        allPraiseNightsCount: allPraiseNights.length,
        allPraiseNightsNames: allPraiseNights.map((p)=>p.name),
        filteredPraiseNightsNames: filteredPraiseNights.map((p)=>p.name)
    });
    // Debug countdown timer output
    console.log('🕐 Countdown Timer Output:', {
        timeLeft,
        countdownLoading,
        countdownError,
        hasTimeLeft: timeLeft.days > 0 || timeLeft.hours > 0 || timeLeft.minutes > 0 || timeLeft.seconds > 0
    });
    // Debug countdown and rehearsal count data
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        console.log('🔍 Debug - Current Praise Night:', {
            id: currentPraiseNight?.id,
            name: currentPraiseNight?.name,
            countdown: currentPraiseNight?.countdown,
            category: currentPraiseNight?.category,
            hasCountdown: !!currentPraiseNight?.countdown,
            categoryFilter,
            shouldShowCountdown: categoryFilter !== 'archive' && currentPraiseNight && !(categoryFilter === 'pre-rehearsal' && filteredPraiseNights.length === 0),
            songsCount: currentPraiseNight?.songs?.length,
            firstSong: currentPraiseNight?.songs?.[0] ? {
                title: currentPraiseNight.songs[0].title,
                rehearsalCount: currentPraiseNight.songs[0].rehearsalCount
            } : null
        });
        console.log('🔍 Debug - Countdown Hook:', {
            timeLeft,
            countdownLoading,
            countdownError
        });
    }, [
        currentPraiseNight,
        timeLeft,
        countdownLoading,
        countdownError,
        categoryFilter,
        filteredPraiseNights.length
    ]);
    // Handle category selection and close drawer
    const handleCategorySelect = (category)=>{
        console.log('🎯 Category selected:', category);
        console.log('🎯 Current active category:', activeCategory);
        console.log('🎯 Modal open:', isSongDetailOpen);
        console.log('🎯 Song playing:', isPlaying);
        setActiveCategory(category);
        setIsCategoryDrawerOpen(false);
        console.log('🎯 Category set to:', category);
    };
    // Handle song card click - opens song detail modal
    const handleSongClick = (song, index)=>{
        console.log('🎵 handleSongClick called with:', {
            songId: song.id,
            songTitle: song.title,
            currentSongId: currentSong?.id,
            currentSongTitle: currentSong?.title,
            isPlaying: isPlaying,
            isSameSong: currentSong?.id === song.id
        });
        setSelectedSongIndex(index); // Set the selected song index
        setSelectedSong({
            ...song,
            imageIndex: index
        });
        setIsSongDetailOpen(true);
        // Check if this song is already playing
        if (currentSong?.id === song.id && isPlaying) {
            // Song is already playing, just open modal without changing anything
            console.log('🎵 Song already playing, opening modal only - NO setCurrentSong call');
            // Don't call setCurrentSong at all - just open the modal
            return; // Exit early to prevent any further processing
        } else if (currentSong?.id === song.id && !isPlaying) {
            // Same song but paused - just open modal, don't restart
            console.log('🎵 Same song but paused, opening modal only - NO setCurrentSong call');
            // Don't call setCurrentSong at all - just open the modal
            return; // Exit early to prevent any further processing
        } else {
            // Different song - set as current song (will continue from where it left off if it was paused)
            console.log('🎵 Different song, calling setCurrentSong:', song.title);
            setCurrentSong(song, false); // Set without auto-play since user clicked
        }
        // Dispatch event to hide mini player
        window.dispatchEvent(new CustomEvent('songDetailOpen'));
    };
    // Handle song card click when outside modal - opens modal AND starts playing
    const handleSongSwitch = (song, index)=>{
        setSelectedSongIndex(index); // Set the selected song index
        setSelectedSong({
            ...song,
            imageIndex: index
        });
        setIsSongDetailOpen(true);
        // Set the current song with auto-play enabled (only if it has audio)
        if (song.audioFile && song.audioFile.trim() !== '') {
            setCurrentSong(song, true); // Enable auto-play
        } else {
            setCurrentSong(song, false); // No auto-play
        }
        // Dispatch event to hide mini player
        window.dispatchEvent(new CustomEvent('songDetailOpen'));
    };
    // Get image for song based on index
    const getSongImage = (index)=>{
        const images = [
            "/images/DSC_6155_scaled.jpg",
            "/images/DSC_6303_scaled.jpg",
            "/images/DSC_6446_scaled.jpg",
            "/images/DSC_6506_scaled.jpg",
            "/images/DSC_6516_scaled.jpg",
            "/images/DSC_6636_1_scaled.jpg",
            "/images/DSC_6638_scaled.jpg",
            "/images/DSC_6644_scaled.jpg",
            "/images/DSC_6658_1_scaled.jpg",
            "/images/DSC_6676_scaled.jpg"
        ];
        return images[index % images.length]; // Cycle through images if more songs than images
    };
    // Handle closing song detail
    const handleCloseSongDetail = ()=>{
        setIsSongDetailOpen(false);
        setSelectedSong(null);
        // Dispatch event to show mini player (if song is playing)
        window.dispatchEvent(new CustomEvent('songDetailClose'));
    };
    // NAVIGATION SAFETY - Close dropdown when navigation is attempted
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const handleBeforeUnload = ()=>{
            setShowDropdown(false);
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return ()=>window.removeEventListener('beforeunload', handleBeforeUnload);
    }, []);
    // Format single digit numbers with leading zero
    const formatNumber = (num)=>{
        if (isNaN(num) || num === undefined || num === null) return '00';
        return num < 10 ? `0${num}` : num.toString();
    };
    // Icon mapping for categories
    const getCategoryIcon = (categoryName)=>{
        // Simple category to icon mapping
        const categoryIconMap = {
            'worship': __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$heart$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Heart$3e$__["Heart"],
            'praise': __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"],
            'hymn': __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__["BookOpen"],
            'contemporary': __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$music$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Music$3e$__["Music"],
            'traditional': __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$piano$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Piano$3e$__["Piano"],
            'gospel': __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$hand$2d$metal$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__HandMetal$3e$__["HandMetal"],
            'ballad': __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$volume$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Volume2$3e$__["Volume2"],
            'fast': __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$skip$2d$forward$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__SkipForward$3e$__["SkipForward"],
            'slow': __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$timer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Timer$3e$__["Timer"],
            'medium': __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$play$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Play$3e$__["Play"],
            'default': __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$music$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Music$3e$__["Music"]
        };
        const normalizedCategory = categoryName.toLowerCase();
        return categoryIconMap[normalizedCategory] || __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$music$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Music$3e$__["Music"]; // Default icon
    };
    // Load songs when a page is selected (same as admin)
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (currentPraiseNight) {
            setSongsLoading(true);
            getCurrentSongs(currentPraiseNight.id).then((songs)=>{
                console.log(`📊 Loaded ${songs.length} songs for page ${currentPraiseNight.id}`);
                setAllSongsFromFirebase(songs);
                setSongsLoading(false);
            }).catch((error)=>{
                console.error('Error loading songs:', error);
                setAllSongsFromFirebase([]);
                setSongsLoading(false);
            });
        } else {
            setAllSongsFromFirebase([]);
        }
    }, [
        currentPraiseNight,
        getCurrentSongs
    ]);
    // Use the songs directly since they're already filtered by page
    const finalSongData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        console.log('🎵 Using songs for page:', {
            pageName: currentPraiseNight?.name,
            pageId: currentPraiseNight?.id,
            songsCount: allSongsFromFirebase.length,
            songsWithAudio: allSongsFromFirebase.filter((s)=>s.audioFile).length,
            sampleSong: allSongsFromFirebase[0] ? {
                title: allSongsFromFirebase[0].title,
                leadSinger: allSongsFromFirebase[0].leadSinger,
                writer: allSongsFromFirebase[0].writer,
                audioFile: allSongsFromFirebase[0].audioFile ? 'Has audio' : 'No audio'
            } : 'No songs'
        });
        return allSongsFromFirebase;
    }, [
        currentPraiseNight,
        allSongsFromFirebase
    ]);
    const isDataLoaded = !loading && !songsLoading && currentPraiseNight !== null;
    // Debug logging for song data
    console.log('🎵 Final song data (using debug page logic):', {
        isDataLoaded,
        finalSongDataLength: finalSongData.length,
        currentPraiseNight: currentPraiseNight?.name,
        currentPraiseNightId: currentPraiseNight?.id,
        allSongsFromFirebaseCount: allSongsFromFirebase.length,
        songs: finalSongData.map((song)=>({
                title: song.title,
                category: song.category,
                status: song.status,
                leadSinger: song.leadSinger,
                rehearsalCount: song.rehearsalCount,
                allFields: Object.keys(song)
            }))
    });
    // Song categories - get from Supabase data (supports both single and multiple categories)
    const songCategories = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        // Use finalSongData instead of currentPraiseNight.songs for more reliable data
        const songsToUse = finalSongData.length > 0 ? finalSongData : currentPraiseNight?.songs || [];
        if (songsToUse.length === 0) {
            console.log('🎵 No songs available for categories');
            return [];
        }
        // Collect categories from both single category and categories array
        const allCategories = [];
        songsToUse.forEach((song)=>{
            if (song.categories && Array.isArray(song.categories)) {
                // New multi-category songs
                allCategories.push(...song.categories.filter((cat)=>cat && cat.trim()));
            } else if (song.category && song.category.trim()) {
                // Old single category songs
                allCategories.push(song.category);
            }
        });
        const uniqueCategories = [
            ...new Set(allCategories)
        ];
        // Debug logging
        console.log('🎵 Available categories from songs:', uniqueCategories);
        console.log('🎵 Songs used for categories:', songsToUse.length);
        console.log('🎵 All songs data:', songsToUse.map((song)=>({
                title: song.title,
                category: song.category,
                categories: song.categories,
                status: song.status
            })));
        return uniqueCategories;
    }, [
        finalSongData,
        currentPraiseNight?.songs
    ]);
    // Categories that currently have at least one active song
    const categoriesWithActiveSongs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const activeCategories = finalSongData.filter((song)=>song.isActive && song.category).map((song)=>song.category);
        return Array.from(new Set(activeCategories));
    }, [
        finalSongData
    ]);
    // All categories in horizontal bar with auto-scroll (prioritize categories that have active songs)
    const mainCategories = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const base = [
            ...songCategories
        ];
        if (categoriesWithActiveSongs.length === 0) return base;
        return base.sort((a, b)=>{
            const aActive = categoriesWithActiveSongs.includes(a);
            const bActive = categoriesWithActiveSongs.includes(b);
            if (aActive === bActive) return 0;
            return aActive ? -1 : 1; // Active categories first
        });
    }, [
        songCategories,
        categoriesWithActiveSongs
    ]);
    // No more FAB categories - all moved to main bar
    const otherCategories = [];
    // Debug logging for categories
    console.log('🎵 Category bar data:', {
        songCategories: songCategories,
        mainCategories: mainCategories,
        otherCategories: otherCategories,
        activeCategory: activeCategory
    });
    // ✅ Prefer auto-selecting a category that has active songs; otherwise fall back to first
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!activeCategory) {
            const preferred = mainCategories.find((cat)=>categoriesWithActiveSongs.includes(cat));
            if (preferred) {
                setActiveCategory(preferred);
                return;
            }
            if (songCategories.length > 0) {
                setActiveCategory(songCategories[0]);
            }
        } else if (!songCategories.includes(activeCategory)) {
            // If current activeCategory no longer exists (page switched), reset with preference
            const preferred = mainCategories.find((cat)=>categoriesWithActiveSongs.includes(cat));
            if (preferred) {
                setActiveCategory(preferred);
            } else if (songCategories.length > 0) {
                setActiveCategory(songCategories[0]);
            } else {
                setActiveCategory('');
            }
        }
    }, [
        activeCategory,
        mainCategories,
        categoriesWithActiveSongs,
        songCategories
    ]);
    // Fallback data if no centralized songs available
    const fallbackSongData = [
        // New Praise Songs
        {
            title: "Mighty God",
            status: "heard",
            category: "New Praise Songs",
            singer: "Sarah Johnson",
            lyrics: {
                verse1: "Great is Thy faithfulness, O God my Father\nThere is no shadow of turning with Thee\nThou changest not, Thy compassions they fail not\nAs Thou hast been Thou forever wilt be",
                chorus: "Great is Thy faithfulness\nGreat is Thy faithfulness\nMorning by morning new mercies I see\nAll I have needed Thy hand hath provided",
                verse2: "Summer and winter, and springtime and harvest\nSun, moon and stars in their courses above\nJoin with all nature in manifold witness\nTo Thy great faithfulness, mercy and love",
                bridge: "Pardon for sin and a peace that endureth\nThine own dear presence to cheer and to guide\nStrength for today and bright hope for tomorrow\nBlessings all mine, with ten thousand beside"
            },
            leadSinger: "Sarah Johnson",
            writtenBy: "Pastor Chris Oyakhilome",
            key: "G Major",
            tempo: "72 BPM",
            comments: "This song should be sung with deep reverence and heartfelt emotion. Allow the congregation to really feel the weight of God's amazing grace."
        }
    ];
    // Update data when praise night changes
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
    // This will trigger a re-render when currentPraiseNight changes
    // The getCurrentSongs() call will get the new data
    }, [
        currentPraiseNight
    ]);
    // Helper function to check if song belongs to category (supports both single and multiple categories)
    const songBelongsToCategory = (song, targetCategory)=>{
        // Check new categories array first
        if (song.categories && Array.isArray(song.categories) && song.categories.length > 0) {
            return song.categories.some((cat)=>cat.trim() === targetCategory.trim());
        }
        // Fallback to old single category
        return (song.category || '').trim() === targetCategory.trim();
    };
    // Filter songs based on selected category and status
    const filteredSongs = finalSongData.filter((song)=>{
        const matchesCategory = songBelongsToCategory(song, activeCategory);
        const matchesStatus = song.status === activeFilter;
        // Debug logging
        if (activeCategory && !matchesCategory) {
            console.log('🎵 Song category mismatch:', {
                songTitle: song.title,
                songCategory: song.category,
                songCategories: song.categories,
                activeCategory: activeCategory,
                matches: matchesCategory
            });
        }
        return matchesCategory && matchesStatus;
    });
    // Get counts for current category
    const categoryHeardCount = finalSongData.filter((song)=>{
        return songBelongsToCategory(song, activeCategory) && song.status === 'heard';
    }).length;
    const categoryUnheardCount = finalSongData.filter((song)=>{
        return songBelongsToCategory(song, activeCategory) && song.status === 'unheard';
    }).length;
    const categoryTotalCount = categoryHeardCount + categoryUnheardCount;
    const switchPraiseNight = (praiseNight)=>{
        setCurrentPraiseNightState(praiseNight);
        setShowDropdown(false);
    // Real-time data automatically includes all songs, no need to load manually
    };
    // Search input focus from header search button
    const searchInputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Use page-specific search hook with actual songs data
    const { searchQuery, setSearchQuery, searchResults, hasResults } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$usePageSearch$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePageSearch"])(currentPraiseNight ? {
        ...currentPraiseNight,
        songs: allSongsFromFirebase
    } : null);
    const typedSearchResults = searchResults;
    const onHeaderSearchClick = ()=>{
        setIsSearchOpen(true);
        const el = searchInputRef.current;
        if (el) {
            el.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
            // Focus after scroll animation
            setTimeout(()=>el.focus(), 300);
        }
    };
    const onCloseSearch = ()=>{
        setIsSearchOpen(false);
        setSearchQuery(''); // Clear search query when closing
    };
    // Debug loading and error states
    console.log('🔍 Page Render Debug:', {
        loading,
        error,
        allPraiseNightsLength: allPraiseNights?.length,
        filteredPraiseNightsLength: filteredPraiseNights?.length,
        currentPraiseNight: currentPraiseNight?.name,
        categoryFilter
    });
    // Show loading state only when initially loading with no data
    if (loading && allPraiseNights.length === 0 && !currentPraiseNight) {
        console.log('🔄 Showing initial loading state');
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"
                    }, void 0, false, {
                        fileName: "[project]/src/app/pages/praise-night/page.tsx",
                        lineNumber: 848,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-600 text-sm",
                        children: "Loading program..."
                    }, void 0, false, {
                        fileName: "[project]/src/app/pages/praise-night/page.tsx",
                        lineNumber: 849,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/pages/praise-night/page.tsx",
                lineNumber: 847,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/pages/praise-night/page.tsx",
            lineNumber: 846,
            columnNumber: 7
        }, this);
    }
    // Show error state - but allow navigation
    if (error) {
        console.log('❌ Showing error state:', error);
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 flex items-center justify-center",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                className: "w-8 h-8 text-red-600"
                            }, void 0, false, {
                                fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                lineNumber: 862,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                            lineNumber: 861,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-red-600 font-medium mb-2",
                            children: "Error loading data"
                        }, void 0, false, {
                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                            lineNumber: 864,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-slate-600 text-sm",
                            children: error
                        }, void 0, false, {
                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                            lineNumber: 865,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                    lineNumber: 860,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ScreenHeader$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    title: "Error",
                    showMenuButton: false,
                    leftButtons: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>router.back(),
                        className: "flex items-center p-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-0 focus:border-0 hover:bg-gray-100 active:scale-95",
                        "aria-label": "Go back",
                        style: {
                            outline: 'none',
                            border: 'none',
                            boxShadow: 'none'
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
                            className: "w-5 h-5 text-gray-600"
                        }, void 0, false, {
                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                            lineNumber: 878,
                            columnNumber: 15
                        }, void 0)
                    }, void 0, false, {
                        fileName: "[project]/src/app/pages/praise-night/page.tsx",
                        lineNumber: 872,
                        columnNumber: 13
                    }, void 0)
                }, void 0, false, {
                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                    lineNumber: 868,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/pages/praise-night/page.tsx",
            lineNumber: 859,
            columnNumber: 7
        }, this);
    }
    console.log('✅ Rendering main page content');
    // Show empty state when there's no data for the current category (but not when still loading)
    if (!loading && (!allPraiseNights || allPraiseNights.length === 0 || filteredPraiseNights.length === 0)) {
        console.log('⚠️ No data for category, showing empty state');
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "h-screen flex flex-col safe-area-bottom overflow-y-auto",
            style: {
                background: `linear-gradient(135deg, ${zoneColor}15, #ffffff)`
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex-shrink-0 w-full",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-white/80 backdrop-blur-xl border-b border-gray-100/50 min-h-[60px] sm:min-h-[70px] w-full",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>router.back(),
                                    className: "flex items-center p-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-0 focus:border-0 hover:bg-gray-100 active:scale-95",
                                    "aria-label": "Go back",
                                    style: {
                                        outline: 'none',
                                        border: 'none',
                                        boxShadow: 'none'
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
                                        className: "w-5 h-5 text-gray-600"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                        lineNumber: 908,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                    lineNumber: 902,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                    className: "text-base sm:text-lg font-outfit-semibold text-gray-800",
                                    children: categoryFilter === 'ongoing' ? 'Ongoing Sessions' : categoryFilter === 'archive' ? 'Archives' : categoryFilter === 'pre-rehearsal' ? 'Pre-Rehearsal' : 'Praise Night'
                                }, void 0, false, {
                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                    lineNumber: 910,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-9"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                    lineNumber: 915,
                                    columnNumber: 15
                                }, this),
                                " "
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                            lineNumber: 901,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/pages/praise-night/page.tsx",
                        lineNumber: 900,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                    lineNumber: 899,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex-1 flex items-center justify-center px-4",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-center max-w-sm mx-auto",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center",
                                children: categoryFilter === 'ongoing' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                                    className: "w-10 h-10 text-purple-600"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                    lineNumber: 926,
                                    columnNumber: 17
                                }, this) : categoryFilter === 'archive' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$archive$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Archive$3e$__["Archive"], {
                                    className: "w-10 h-10 text-purple-600"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                    lineNumber: 928,
                                    columnNumber: 17
                                }, this) : categoryFilter === 'pre-rehearsal' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$calendar$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Calendar$3e$__["Calendar"], {
                                    className: "w-10 h-10 text-purple-600"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                    lineNumber: 930,
                                    columnNumber: 17
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$music$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Music$3e$__["Music"], {
                                    className: "w-10 h-10 text-purple-600"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                    lineNumber: 932,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                lineNumber: 924,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-xl font-semibold text-gray-800 mb-2",
                                children: categoryFilter === 'ongoing' ? 'No Ongoing Sessions' : categoryFilter === 'archive' ? 'No Archived Sessions' : categoryFilter === 'pre-rehearsal' ? 'No Pre-Rehearsal Sessions' : 'No Sessions Available'
                            }, void 0, false, {
                                fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                lineNumber: 937,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-gray-600 text-sm mb-6 leading-relaxed",
                                children: categoryFilter === 'ongoing' ? 'Ongoing sessions will appear here when they are active and ready for rehearsal.' : categoryFilter === 'archive' ? 'Archived sessions will appear here when they are completed and moved to archive.' : categoryFilter === 'pre-rehearsal' ? 'Pre-rehearsal sessions will appear here when they are scheduled for preparation.' : 'Create your first session to get started with your praise and worship program.'
                            }, void 0, false, {
                                fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                lineNumber: 945,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>{
                                    console.log('🔙 Back button clicked, navigating to /pages/rehearsals');
                                    window.location.href = '/pages/rehearsals';
                                    console.log('🔙 Navigation command sent');
                                },
                                className: "inline-flex items-center px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors duration-200",
                                style: {
                                    backgroundColor: zoneColor,
                                    filter: 'brightness(0.95)'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
                                        className: "w-4 h-4 mr-2"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                        lineNumber: 965,
                                        columnNumber: 15
                                    }, this),
                                    "Back to Rehearsals"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                lineNumber: 953,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/pages/praise-night/page.tsx",
                        lineNumber: 922,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                    lineNumber: 921,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/pages/praise-night/page.tsx",
            lineNumber: 892,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "h-screen safe-area-bottom overflow-y-auto",
        style: {
            background: `linear-gradient(135deg, ${zoneColor}12, #fdfbff)`
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                onClick: ()=>isMenuOpen && setIsMenuOpen(false),
                className: "jsx-7d959b639a581654" + " " + `
          h-full flex flex-col
          transition-all duration-300 ease-out
          ${isMenuOpen ? 'translate-x-72 scale-[0.88] rounded-2xl shadow-2xl origin-left overflow-hidden' : 'translate-x-0 scale-100 rounded-none'}
        `,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        id: "7d959b639a581654",
                        children: "html{scroll-behavior:smooth}@keyframes fadeInLeft{0%{opacity:0;transform:translate(-20px)}to{opacity:1;transform:translate(0)}}@keyframes fadeInUp{0%{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}@keyframes fadeInRight{0%{opacity:0;transform:translate(20px)}to{opacity:1;transform:translate(0)}}.animate-fade-in-left{animation:.6s ease-out fadeInLeft}.animate-fade-in-up{animation:.6s ease-out .2s both fadeInUp}.animate-fade-in-right{animation:.6s ease-out .4s both fadeInRight}@keyframes breathe{0%,to{transform:scale(1)}50%{transform:scale(.95)}}.breathe-animation{animation:2s ease-in-out infinite breathe}@keyframes pulse-border{0%,to{border-color:#9333ea;box-shadow:0 0 0 2px #9333ea}50%{border-color:#c4b5fd;box-shadow:0 0 0 2px #c4b5fd}}.animate-pulse-border{animation:2s ease-in-out infinite pulse-border}@keyframes scroll{0%{transform:translate(0)}to{transform:translate(-50%)}}.animate-scroll{width:200%;animation:20s linear infinite scroll}.animate-scroll:hover,.animate-scroll.manual-scroll{animation-play-state:paused}.animate-scroll-alt{width:200%;animation:none}.animate-scroll-alt.auto-scroll{animation:20s linear infinite scroll}.scrollbar-thin::-webkit-scrollbar{height:4px}.scrollbar-thumb-gray-300::-webkit-scrollbar-thumb{background-color:#d1d5db;border-radius:2px}.scrollbar-track-transparent::-webkit-scrollbar-track{background:0 0}"
                    }, void 0, false, void 0, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-7d959b639a581654" + " " + "flex-shrink-0 w-full",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-7d959b639a581654" + " " + "bg-white/80 backdrop-blur-xl border-b border-gray-100/50 min-h-[60px] sm:min-h-[70px] w-full",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-7d959b639a581654" + " " + "relative",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-7d959b639a581654" + " " + `flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 transition-all duration-300 ease-out ${isSearchOpen ? 'opacity-0' : 'opacity-100'}`,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-7d959b639a581654" + " " + "flex items-center space-x-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>router.back(),
                                                            "aria-label": "Go back",
                                                            style: {
                                                                outline: 'none',
                                                                border: 'none',
                                                                boxShadow: 'none'
                                                            },
                                                            className: "jsx-7d959b639a581654" + " " + "flex items-center p-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-0 focus:border-0 hover:bg-gray-100 active:scale-95",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowLeft$3e$__["ArrowLeft"], {
                                                                className: "w-5 h-5 text-gray-600"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                lineNumber: 1125,
                                                                columnNumber: 19
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                            lineNumber: 1119,
                                                            columnNumber: 17
                                                        }, this),
                                                        categoryFilter !== 'archive' && !pageParam && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            "aria-label": "Switch Praise Night",
                                                            onClick: ()=>setShowDropdown(!showDropdown),
                                                            className: "jsx-7d959b639a581654" + " " + "p-2 rounded-lg text-slate-600 hover:bg-slate-100 active:scale-95 transition border border-slate-200 touch-optimized",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                                                className: "w-4 h-4"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                lineNumber: 1133,
                                                                columnNumber: 21
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                            lineNumber: 1128,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                    lineNumber: 1118,
                                                    columnNumber: 15
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-7d959b639a581654" + " " + "absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                                            className: "jsx-7d959b639a581654" + " " + "text-base sm:text-lg font-outfit-semibold text-gray-800",
                                                            children: categoryFilter === 'archive' ? 'Archives' : categoryFilter === 'pre-rehearsal' && filteredPraiseNights.length === 0 ? 'Pre-Rehearsal' : currentPraiseNight?.name || ''
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                            lineNumber: 1140,
                                                            columnNumber: 17
                                                        }, this),
                                                        currentPraiseNight && currentPraiseNight.countdown && categoryFilter !== 'archive' && (timeLeft.days > 0 || timeLeft.hours > 0 || timeLeft.minutes > 0 || timeLeft.seconds > 0) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-7d959b639a581654" + " " + "mt-0.5",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "jsx-7d959b639a581654" + " " + "flex items-center gap-0.5 text-xs",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "jsx-7d959b639a581654" + " " + "font-bold text-gray-700",
                                                                        children: [
                                                                            formatNumber(timeLeft.days),
                                                                            "d"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                        lineNumber: 1150,
                                                                        columnNumber: 21
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "jsx-7d959b639a581654" + " " + "text-gray-500 font-bold",
                                                                        children: ":"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                        lineNumber: 1151,
                                                                        columnNumber: 21
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "jsx-7d959b639a581654" + " " + "font-bold text-gray-700",
                                                                        children: [
                                                                            formatNumber(timeLeft.hours),
                                                                            "h"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                        lineNumber: 1152,
                                                                        columnNumber: 21
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "jsx-7d959b639a581654" + " " + "text-gray-500 font-bold",
                                                                        children: ":"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                        lineNumber: 1153,
                                                                        columnNumber: 21
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "jsx-7d959b639a581654" + " " + "font-bold text-gray-700",
                                                                        children: [
                                                                            formatNumber(timeLeft.minutes),
                                                                            "m"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                        lineNumber: 1154,
                                                                        columnNumber: 21
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "jsx-7d959b639a581654" + " " + "text-gray-500 font-bold",
                                                                        children: ":"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                        lineNumber: 1155,
                                                                        columnNumber: 21
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "jsx-7d959b639a581654" + " " + "font-bold text-gray-700",
                                                                        children: [
                                                                            formatNumber(timeLeft.seconds),
                                                                            "s"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                        lineNumber: 1156,
                                                                        columnNumber: 21
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                lineNumber: 1149,
                                                                columnNumber: 21
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                            lineNumber: 1147,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                    lineNumber: 1139,
                                                    columnNumber: 15
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-7d959b639a581654" + " " + "flex items-center space-x-1",
                                                    children: [
                                                        categoryFilter !== 'archive' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>setIsSearchOpen((v)=>!v),
                                                            "aria-label": "Toggle search",
                                                            style: {
                                                                outline: 'none',
                                                                border: 'none',
                                                                boxShadow: 'none'
                                                            },
                                                            className: "jsx-7d959b639a581654" + " " + "p-2.5 rounded-full transition-all duration-200 focus:outline-none focus:ring-0 focus:border-0 active:scale-95 hover:bg-gray-100/70 active:bg-gray-200/90 touch-optimized",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                                                className: "w-5 h-5 text-gray-600 transition-all duration-200"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                lineNumber: 1171,
                                                                columnNumber: 21
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                            lineNumber: 1165,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-7d959b639a581654" + " " + "flex items-center",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "jsx-7d959b639a581654" + " " + "relative",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                        src: "/logo.png",
                                                                        alt: "LoveWorld Logo",
                                                                        onError: (e)=>{
                                                                            e.currentTarget.style.display = 'none';
                                                                        },
                                                                        className: "jsx-7d959b639a581654" + " " + "w-10 h-10 object-contain transition-transform duration-200 hover:scale-105"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                        lineNumber: 1176,
                                                                        columnNumber: 21
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "jsx-7d959b639a581654" + " " + "absolute inset-0 w-10 h-10 bg-purple-500/10 rounded-full blur-sm -z-10"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                        lineNumber: 1184,
                                                                        columnNumber: 21
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                lineNumber: 1175,
                                                                columnNumber: 19
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                            lineNumber: 1174,
                                                            columnNumber: 17
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                    lineNumber: 1163,
                                                    columnNumber: 15
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                            lineNumber: 1115,
                                            columnNumber: 13
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-7d959b639a581654" + " " + `absolute inset-0 bg-white/95 backdrop-blur-xl transition-all duration-300 ease-out ${isSearchOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'}`,
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-7d959b639a581654" + " " + "flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 h-full",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "jsx-7d959b639a581654" + " " + "flex-1 relative",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                ref: searchInputRef,
                                                                value: searchQuery,
                                                                onChange: (e)=>setSearchQuery(e.target.value),
                                                                type: "text",
                                                                placeholder: "Search songs, lyrics, solfas, writer, lead singer...",
                                                                inputMode: "search",
                                                                "aria-label": "Search",
                                                                style: {
                                                                    outline: 'none',
                                                                    border: 'none',
                                                                    boxShadow: 'none'
                                                                },
                                                                className: "jsx-7d959b639a581654" + " " + "w-full text-lg bg-transparent px-0 py-3 text-gray-800 placeholder-gray-400 border-0 outline-none appearance-none shadow-none ring-0 focus:outline-none focus:ring-0 focus:border-0 focus:shadow-none font-poppins-medium"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                lineNumber: 1195,
                                                                columnNumber: 19
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "jsx-7d959b639a581654" + " " + "absolute left-0 right-0 bottom-0 h-px bg-gray-300/40"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                lineNumber: 1206,
                                                                columnNumber: 19
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                style: {
                                                                    boxShadow: '0 0 8px rgba(147, 51, 234, 0.4)'
                                                                },
                                                                className: "jsx-7d959b639a581654" + " " + "absolute left-0 bottom-0 h-0.5 bg-purple-500 w-full shadow-sm"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                lineNumber: 1207,
                                                                columnNumber: 19
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                        lineNumber: 1194,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>{
                                                            setIsSearchOpen(false);
                                                            setSearchQuery('');
                                                        },
                                                        "aria-label": "Close search",
                                                        style: {
                                                            outline: 'none',
                                                            border: 'none',
                                                            boxShadow: 'none'
                                                        },
                                                        className: "jsx-7d959b639a581654" + " " + "p-2.5 rounded-full transition-all duration-200 focus:outline-none focus:ring-0 focus:border-0 active:scale-95 hover:bg-gray-100/70 active:bg-gray-200/90 ml-4",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                            className: "w-6 h-6 text-gray-700 transition-all duration-200"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                            lineNumber: 1219,
                                                            columnNumber: 19
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                        lineNumber: 1210,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                lineNumber: 1193,
                                                columnNumber: 16
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                            lineNumber: 1191,
                                            columnNumber: 13
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                    lineNumber: 1113,
                                    columnNumber: 11
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                lineNumber: 1112,
                                columnNumber: 10
                            }, this),
                            isSearchOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-7d959b639a581654" + " " + "fixed left-0 right-0 top-16 z-[65] bg-white border border-gray-200 shadow-lg max-h-96 overflow-y-auto",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-7d959b639a581654" + " " + "mx-auto max-w-2xl lg:max-w-6xl xl:max-w-7xl px-4 py-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-7d959b639a581654" + " " + "text-xs text-gray-500 mb-2 font-medium",
                                            children: searchQuery ? `${typedSearchResults.length} result${typedSearchResults.length !== 1 ? 's' : ''} for "${searchQuery}"` : 'Start typing to search songs, artists, or events...'
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                            lineNumber: 1230,
                                            columnNumber: 15
                                        }, this),
                                        typedSearchResults.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-7d959b639a581654" + " " + "space-y-1",
                                            children: typedSearchResults.map((result)=>{
                                                // Handle song results differently - open modal directly
                                                if (result.type === 'song') {
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>{
                                                            // Find the song in the current data and open modal
                                                            const song = finalSongData.find((s)=>s.title === result.title);
                                                            if (song) {
                                                                const songIndex = finalSongData.indexOf(song);
                                                                handleSongClick(song, songIndex);
                                                            }
                                                            setIsSearchOpen(false);
                                                            setSearchQuery('');
                                                        },
                                                        className: "jsx-7d959b639a581654" + " " + "w-full text-left block p-3 rounded-xl hover:bg-gray-100/70 active:bg-gray-200/90 transition-all duration-200 group",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-7d959b639a581654" + " " + "flex items-center justify-between",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-7d959b639a581654" + " " + "flex-1 min-w-0",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "jsx-7d959b639a581654" + " " + "flex items-center gap-2 mb-1",
                                                                            children: [
                                                                                result.type === 'song' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$music$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Music$3e$__["Music"], {
                                                                                    className: "w-4 h-4 text-purple-600 flex-shrink-0"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                                    lineNumber: 1260,
                                                                                    columnNumber: 72
                                                                                }, this),
                                                                                result.type === 'category' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flag$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Flag$3e$__["Flag"], {
                                                                                    className: "w-4 h-4 text-green-600 flex-shrink-0"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                                    lineNumber: 1261,
                                                                                    columnNumber: 76
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                                    className: "jsx-7d959b639a581654" + " " + "font-medium text-gray-900 text-sm truncate group-hover:text-purple-700 transition-colors",
                                                                                    children: result.title
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                                    lineNumber: 1262,
                                                                                    columnNumber: 33
                                                                                }, this),
                                                                                result.status && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "jsx-7d959b639a581654" + " " + `px-2 py-0.5 text-xs rounded-full font-medium flex-shrink-0 ${result.status === 'heard' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`,
                                                                                    children: result.status
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                                    lineNumber: 1266,
                                                                                    columnNumber: 35
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                            lineNumber: 1259,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        result.subtitle && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "jsx-7d959b639a581654" + " " + "text-xs text-purple-600 font-medium mb-0.5",
                                                                            children: result.subtitle
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                            lineNumber: 1275,
                                                                            columnNumber: 33
                                                                        }, this),
                                                                        result.description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "jsx-7d959b639a581654" + " " + "text-xs text-gray-500 truncate",
                                                                            children: result.description
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                            lineNumber: 1280,
                                                                            columnNumber: 33
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                    lineNumber: 1258,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                                                    className: "w-4 h-4 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0 ml-2"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                    lineNumber: 1285,
                                                                    columnNumber: 29
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                            lineNumber: 1257,
                                                            columnNumber: 27
                                                        }, this)
                                                    }, result.id, false, {
                                                        fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                        lineNumber: 1243,
                                                        columnNumber: 25
                                                    }, this);
                                                } else {
                                                    // For category results, filter by category
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>{
                                                            setActiveCategory(result.category || '');
                                                            setIsSearchOpen(false);
                                                            setSearchQuery('');
                                                        },
                                                        className: "jsx-7d959b639a581654" + " " + "w-full text-left block p-3 rounded-xl hover:bg-gray-100/70 active:bg-gray-200/90 transition-all duration-200 group",
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-7d959b639a581654" + " " + "flex items-center justify-between",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-7d959b639a581654" + " " + "flex-1 min-w-0",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "jsx-7d959b639a581654" + " " + "flex items-center gap-2 mb-1",
                                                                            children: [
                                                                                result.type === 'song' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$music$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Music$3e$__["Music"], {
                                                                                    className: "w-4 h-4 text-purple-600 flex-shrink-0"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                                    lineNumber: 1304,
                                                                                    columnNumber: 72
                                                                                }, this),
                                                                                result.type === 'category' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$flag$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Flag$3e$__["Flag"], {
                                                                                    className: "w-4 h-4 text-green-600 flex-shrink-0"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                                    lineNumber: 1305,
                                                                                    columnNumber: 76
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                                    className: "jsx-7d959b639a581654" + " " + "font-medium text-gray-900 text-sm truncate group-hover:text-purple-700 transition-colors",
                                                                                    children: result.title
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                                    lineNumber: 1306,
                                                                                    columnNumber: 33
                                                                                }, this),
                                                                                result.status && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                    className: "jsx-7d959b639a581654" + " " + `px-2 py-0.5 text-xs rounded-full font-medium flex-shrink-0 ${result.status === 'heard' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`,
                                                                                    children: result.status
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                                    lineNumber: 1310,
                                                                                    columnNumber: 35
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                            lineNumber: 1303,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        result.subtitle && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "jsx-7d959b639a581654" + " " + "text-xs text-purple-600 font-medium mb-0.5",
                                                                            children: result.subtitle
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                            lineNumber: 1319,
                                                                            columnNumber: 33
                                                                        }, this),
                                                                        result.description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "jsx-7d959b639a581654" + " " + "text-xs text-gray-500 truncate",
                                                                            children: result.description
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                            lineNumber: 1324,
                                                                            columnNumber: 33
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                    lineNumber: 1302,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                                                    className: "w-4 h-4 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0 ml-2"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                    lineNumber: 1329,
                                                                    columnNumber: 29
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                            lineNumber: 1301,
                                                            columnNumber: 27
                                                        }, this)
                                                    }, result.id, false, {
                                                        fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                        lineNumber: 1292,
                                                        columnNumber: 25
                                                    }, this);
                                                }
                                            })
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                            lineNumber: 1238,
                                            columnNumber: 17
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-7d959b639a581654" + " " + "py-6 text-center",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                                    className: "w-8 h-8 text-gray-300 mx-auto mb-2"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                    lineNumber: 1338,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "jsx-7d959b639a581654" + " " + "text-sm text-gray-500 font-medium",
                                                    children: "No results found"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                    lineNumber: 1339,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "jsx-7d959b639a581654" + " " + "text-xs text-gray-400 mt-1",
                                                    children: "Try searching for songs, artists, or events"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                    lineNumber: 1340,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                            lineNumber: 1337,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                    lineNumber: 1229,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                lineNumber: 1228,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/pages/praise-night/page.tsx",
                        lineNumber: 1111,
                        columnNumber: 8
                    }, this),
                    showDropdown && categoryFilter !== 'archive' && !pageParam && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                onClick: ()=>setShowDropdown(false),
                                onTouchStart: ()=>setShowDropdown(false),
                                className: "jsx-7d959b639a581654" + " " + "fixed inset-0 bg-black/20 z-[75]"
                            }, void 0, false, {
                                fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                lineNumber: 1351,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "jsx-7d959b639a581654" + " " + "fixed right-3 left-3 sm:right-4 sm:left-auto top-16 sm:top-16 z-[80] w-auto sm:w-64 max-w-2xl mx-auto sm:mx-0 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden max-h-64 overflow-y-auto",
                                children: filteredPraiseNights.length > 0 ? filteredPraiseNights.map((praiseNight)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>switchPraiseNight(praiseNight),
                                        className: "jsx-7d959b639a581654" + " " + `w-full px-3 sm:px-4 py-2 sm:py-3 text-left hover:bg-slate-50 transition-colors ${praiseNight.id === currentPraiseNight?.id ? 'bg-purple-50 text-purple-700 border-l-4 border-purple-500' : ''}`,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-7d959b639a581654" + " " + "font-semibold text-sm sm:text-base",
                                                children: praiseNight.name
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                lineNumber: 1365,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-7d959b639a581654" + " " + "text-xs sm:text-sm text-slate-600",
                                                children: [
                                                    praiseNight.location,
                                                    " • ",
                                                    praiseNight.date
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                lineNumber: 1366,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, praiseNight.id, true, {
                                        fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                        lineNumber: 1359,
                                        columnNumber: 17
                                    }, this)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-7d959b639a581654" + " " + "px-3 sm:px-4 py-12 text-center",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-7d959b639a581654" + " " + "w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center",
                                            children: categoryFilter === 'pre-rehearsal' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"], {
                                                className: "w-8 h-8 text-slate-400"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                lineNumber: 1373,
                                                columnNumber: 21
                                            }, this) : categoryFilter === 'archive' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$archive$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Archive$3e$__["Archive"], {
                                                className: "w-8 h-8 text-slate-400"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                lineNumber: 1375,
                                                columnNumber: 21
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                fill: "none",
                                                stroke: "currentColor",
                                                viewBox: "0 0 24 24",
                                                className: "jsx-7d959b639a581654" + " " + "w-8 h-8 text-slate-400",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    strokeLinecap: "round",
                                                    strokeLinejoin: "round",
                                                    strokeWidth: 1.5,
                                                    d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
                                                    className: "jsx-7d959b639a581654"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                    lineNumber: 1378,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                lineNumber: 1377,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                            lineNumber: 1371,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-7d959b639a581654" + " " + "text-slate-500 text-sm mb-2 font-medium",
                                            children: [
                                                categoryFilter === 'pre-rehearsal' && 'No Pre-Rehearsal sessions yet',
                                                categoryFilter === 'ongoing' && 'No Ongoing sessions yet',
                                                categoryFilter === 'archive' && 'No Archived sessions yet',
                                                categoryFilter === 'unassigned' && 'No Unassigned sessions yet',
                                                !categoryFilter && 'No sessions available'
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                            lineNumber: 1382,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-7d959b639a581654" + " " + "text-slate-400 text-xs",
                                            children: [
                                                categoryFilter === 'pre-rehearsal' && 'Pre-rehearsal sessions will appear here when scheduled',
                                                categoryFilter === 'ongoing' && 'Ongoing sessions will appear here when active',
                                                categoryFilter === 'archive' && 'Archived sessions will appear here when completed',
                                                categoryFilter === 'unassigned' && 'Unassigned sessions will appear here when created',
                                                !categoryFilter && 'Create your first session to get started'
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                            lineNumber: 1389,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                    lineNumber: 1370,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                lineNumber: 1356,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "jsx-7d959b639a581654" + " " + "flex-1 overflow-y-auto -webkit-overflow-scrolling-touch",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "jsx-7d959b639a581654" + " " + "w-full px-3 sm:px-4 lg:px-6 py-2 sm:py-4 relative mobile-content-with-bottom-nav",
                            children: [
                                categoryFilter === 'archive' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-7d959b639a581654" + " " + "mb-6",
                                    children: [
                                        loadingPageCategories && !selectedPageCategory && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-7d959b639a581654" + " " + "mb-6",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-7d959b639a581654" + " " + "flex items-center justify-between mb-4",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-7d959b639a581654" + " " + "h-6 w-48 bg-gray-200 rounded animate-pulse"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                            lineNumber: 1414,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-7d959b639a581654" + " " + "h-5 w-24 bg-gray-200 rounded animate-pulse"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                            lineNumber: 1415,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                    lineNumber: 1413,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-7d959b639a581654" + " " + "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6",
                                                    children: [
                                                        1,
                                                        2,
                                                        3
                                                    ].map((i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-7d959b639a581654" + " " + "bg-white border-2 border-slate-200 rounded-xl p-6",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-7d959b639a581654" + " " + "w-full h-40 bg-gray-200 rounded-lg mb-4 animate-pulse"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                    lineNumber: 1420,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-7d959b639a581654" + " " + "h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-2"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                    lineNumber: 1421,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-7d959b639a581654" + " " + "h-4 w-full bg-gray-200 rounded animate-pulse mb-2"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                    lineNumber: 1422,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-7d959b639a581654" + " " + "h-4 w-2/3 bg-gray-200 rounded animate-pulse mb-3"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                    lineNumber: 1423,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-7d959b639a581654" + " " + "h-6 w-20 bg-gray-200 rounded-full animate-pulse"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                    lineNumber: 1424,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, i, true, {
                                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                            lineNumber: 1419,
                                                            columnNumber: 21
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                    lineNumber: 1417,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                            lineNumber: 1412,
                                            columnNumber: 15
                                        }, this),
                                        !loadingPageCategories && categoryFilter === 'archive' && !selectedPageCategory && pageCategories.length > 0 && filteredPraiseNights.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-7d959b639a581654" + " " + "mb-6",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-7d959b639a581654" + " " + "flex items-center justify-between mb-4",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                            className: "jsx-7d959b639a581654" + " " + "text-lg font-semibold text-slate-900",
                                                            children: "Browse by Category"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                            lineNumber: 1435,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "jsx-7d959b639a581654" + " " + "text-sm text-slate-500",
                                                            children: [
                                                                pageCategories.length,
                                                                " categories"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                            lineNumber: 1436,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                    lineNumber: 1434,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-7d959b639a581654" + " " + "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6",
                                                    children: pageCategories.map((category)=>{
                                                        // Count pages in this category
                                                        const pagesInCategory = allPraiseNights.filter((p)=>{
                                                            const isArchive = p.category === 'archive';
                                                            const matchesCategory = p.pageCategory === category.name;
                                                            console.log(`🔍 Page "${p.name}": category="${p.category}", pageCategory="${p.pageCategory}", matches="${category.name}"? ${matchesCategory}`);
                                                            return isArchive && matchesCategory;
                                                        });
                                                        const pageCount = pagesInCategory.length;
                                                        console.log(`📊 Category "${category.name}" has ${pageCount} archived pages:`, pagesInCategory.map((p)=>p.name));
                                                        // Show all categories, even with 0 pages (for testing)
                                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>{
                                                                console.log(`🎯 Selected category: ${category.name}`);
                                                                setSelectedPageCategory(category.name);
                                                            },
                                                            className: "jsx-7d959b639a581654" + " " + "bg-white border-2 border-slate-200 rounded-xl p-6 hover:border-purple-400 hover:shadow-lg transition-all duration-200 text-left",
                                                            children: [
                                                                category.image && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                    src: category.image,
                                                                    alt: category.name,
                                                                    className: "jsx-7d959b639a581654" + " " + "w-full h-40 object-cover rounded-lg mb-4"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                    lineNumber: 1462,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                    className: "jsx-7d959b639a581654" + " " + "text-lg font-semibold text-slate-900 mb-2",
                                                                    children: category.name
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                    lineNumber: 1468,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "jsx-7d959b639a581654" + " " + "text-sm text-slate-500 mb-3 line-clamp-2",
                                                                    children: category.description
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                    lineNumber: 1469,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "jsx-7d959b639a581654" + " " + "inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full",
                                                                    children: [
                                                                        pageCount,
                                                                        " ",
                                                                        pageCount === 1 ? 'page' : 'pages'
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                    lineNumber: 1470,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, category.id, true, {
                                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                            lineNumber: 1453,
                                                            columnNumber: 23
                                                        }, this);
                                                    })
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                    lineNumber: 1438,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                            lineNumber: 1433,
                                            columnNumber: 15
                                        }, this),
                                        selectedPageCategory && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-7d959b639a581654" + " " + "mb-4",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setSelectedPageCategory(null),
                                                className: "jsx-7d959b639a581654" + " " + "flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeft$3e$__["ChevronLeft"], {
                                                        className: "w-4 h-4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                        lineNumber: 1487,
                                                        columnNumber: 19
                                                    }, this),
                                                    "Back to Categories"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                lineNumber: 1483,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                            lineNumber: 1482,
                                            columnNumber: 15
                                        }, this),
                                        loading && selectedPageCategory && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-7d959b639a581654" + " " + "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4",
                                            children: [
                                                1,
                                                2,
                                                3,
                                                4,
                                                5,
                                                6
                                            ].map((i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-7d959b639a581654" + " " + "bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-7d959b639a581654" + " " + "aspect-[4/3] bg-gray-200 animate-pulse"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                            lineNumber: 1498,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-7d959b639a581654" + " " + "p-3",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-7d959b639a581654" + " " + "h-4 w-3/4 bg-gray-200 rounded animate-pulse mb-2"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                    lineNumber: 1500,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-7d959b639a581654" + " " + "h-3 w-1/2 bg-gray-200 rounded animate-pulse mb-1"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                    lineNumber: 1501,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-7d959b639a581654" + " " + "h-3 w-2/3 bg-gray-200 rounded animate-pulse"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                    lineNumber: 1502,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                            lineNumber: 1499,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, i, true, {
                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                    lineNumber: 1497,
                                                    columnNumber: 19
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                            lineNumber: 1495,
                                            columnNumber: 15
                                        }, this),
                                        !loading && !loadingPageCategories && (selectedPageCategory || pageCategories.length === 0) && filteredPraiseNights.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-7d959b639a581654" + " " + "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4",
                                            children: filteredPraiseNights.map((praiseNight)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>{
                                                        // Navigate to praise-night page with this specific page's data
                                                        // Use Next.js router to avoid full page reload
                                                        router.push(`/pages/praise-night?page=${praiseNight.id}`);
                                                    },
                                                    className: "jsx-7d959b639a581654" + " " + `group relative bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${currentPraiseNight?.id === praiseNight.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`,
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-7d959b639a581654" + " " + "aspect-[4/3] bg-gradient-to-br from-purple-500 to-pink-500 relative overflow-hidden",
                                                            children: [
                                                                praiseNight.bannerImage ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                    src: praiseNight.bannerImage,
                                                                    alt: praiseNight.name,
                                                                    onError: (e)=>{
                                                                        console.error('❌ Banner image failed to load:', praiseNight.bannerImage);
                                                                        // Fallback to gradient if image fails to load
                                                                        e.currentTarget.style.display = 'none';
                                                                    },
                                                                    onLoad: ()=>{
                                                                        console.log('✅ Banner image loaded successfully:', praiseNight.bannerImage);
                                                                    },
                                                                    className: "jsx-7d959b639a581654" + " " + "w-full h-full object-cover"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                    lineNumber: 1526,
                                                                    columnNumber: 25
                                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-7d959b639a581654" + " " + "w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "jsx-7d959b639a581654" + " " + "text-white font-bold text-lg",
                                                                        children: [
                                                                            "PN",
                                                                            praiseNight.id
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                        lineNumber: 1541,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                    lineNumber: 1540,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-7d959b639a581654" + " " + "absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                    lineNumber: 1545,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                            lineNumber: 1524,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-7d959b639a581654" + " " + "p-3",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                    className: "jsx-7d959b639a581654" + " " + "font-semibold text-sm text-gray-900 truncate",
                                                                    children: praiseNight.name
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                    lineNumber: 1550,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "jsx-7d959b639a581654" + " " + "text-xs text-gray-600 mt-1",
                                                                    children: praiseNight.date
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                    lineNumber: 1551,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "jsx-7d959b639a581654" + " " + "text-xs text-gray-500 mt-0.5",
                                                                    children: praiseNight.location
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                    lineNumber: 1552,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                            lineNumber: 1549,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, praiseNight.id, true, {
                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                    lineNumber: 1513,
                                                    columnNumber: 19
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                            lineNumber: 1511,
                                            columnNumber: 15
                                        }, this) : selectedPageCategory ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-7d959b639a581654" + " " + "text-center py-12",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$archive$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Archive$3e$__["Archive"], {
                                                    className: "w-16 h-16 mx-auto mb-4 text-gray-300"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                    lineNumber: 1559,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    className: "jsx-7d959b639a581654" + " " + "text-lg font-medium text-slate-900 mb-2",
                                                    children: "No pages in this category"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                    lineNumber: 1560,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "jsx-7d959b639a581654" + " " + "text-slate-500",
                                                    children: [
                                                        'No archived pages have been assigned to "',
                                                        selectedPageCategory,
                                                        '" yet'
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                    lineNumber: 1561,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                            lineNumber: 1558,
                                            columnNumber: 15
                                        }, this) : !loadingPageCategories && pageCategories.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-7d959b639a581654" + " " + "text-center py-12",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$archive$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Archive$3e$__["Archive"], {
                                                    className: "w-16 h-16 mx-auto mb-4 text-gray-300"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                    lineNumber: 1567,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    className: "jsx-7d959b639a581654" + " " + "text-lg font-medium text-slate-900 mb-2",
                                                    children: "No Page Categories"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                    lineNumber: 1568,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "jsx-7d959b639a581654" + " " + "text-slate-500 mb-4",
                                                    children: "Page categories help organize your archived programs."
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                    lineNumber: 1569,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "jsx-7d959b639a581654" + " " + "text-sm text-slate-400",
                                                    children: "Create page categories in the Admin Panel → Page Categories section"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                    lineNumber: 1572,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                            lineNumber: 1566,
                                            columnNumber: 15
                                        }, this) : null
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                    lineNumber: 1409,
                                    columnNumber: 11
                                }, this),
                                categoryFilter !== 'archive' && currentPraiseNight && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-7d959b639a581654" + " " + "bg-white border border-slate-200 rounded-xl overflow-hidden mb-2 sm:mb-3 max-w-md sm:max-w-lg mx-auto shadow-2xl shadow-black/20 ring-1 ring-black/5 breathe-animation",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-7d959b639a581654" + " " + "relative h-35 sm:h-43 md:h-51",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                src: ecardSrc,
                                                alt: "Praise Night E-card",
                                                fill: true,
                                                sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw",
                                                className: "object-cover object-center",
                                                priority: false,
                                                onError: (e)=>{
                                                    console.error('❌ Image failed to load:', ecardSrc);
                                                    // Fallback to default image
                                                    e.currentTarget.src = "/Ecards/1000876785.png";
                                                },
                                                onLoad: ()=>{
                                                    console.log('✅ Image loaded successfully:', ecardSrc);
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                lineNumber: 1584,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-7d959b639a581654" + " " + "absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                lineNumber: 1600,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                        lineNumber: 1583,
                                        columnNumber: 13
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                    lineNumber: 1582,
                                    columnNumber: 11
                                }, this),
                                categoryFilter !== 'archive' && currentPraiseNight && filteredPraiseNights.length > 0 && !(categoryFilter === 'pre-rehearsal' && filteredPraiseNights.length === 0) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-7d959b639a581654" + " " + "mb-4 sm:mb-6",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        onScroll: (e)=>{
                                            const target = e.target;
                                            target.style.animationPlayState = 'paused';
                                            clearTimeout(target.scrollTimeout);
                                            target.scrollTimeout = setTimeout(()=>{
                                                target.style.animationPlayState = 'running';
                                            }, 2000);
                                        },
                                        className: "jsx-7d959b639a581654" + " " + "-mx-3 px-3 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "jsx-7d959b639a581654" + " " + "flex items-center gap-2 sm:gap-3 animate-scroll",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    className: "jsx-7d959b639a581654" + " " + "inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-slate-700 hover:bg-slate-50 active:scale-95 transition flex-shrink-0 snap-start",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "jsx-7d959b639a581654" + " " + "inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-100",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$music$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Music$3e$__["Music"], {
                                                                className: "w-3.5 h-3.5 text-purple-600"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                lineNumber: 1623,
                                                                columnNumber: 21
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                            lineNumber: 1622,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "jsx-7d959b639a581654" + " " + "text-xs sm:text-sm font-medium",
                                                            children: "Songs Schedule"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                            lineNumber: 1625,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                    lineNumber: 1621,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>router.push('/pages/audiolab'),
                                                    className: "jsx-7d959b639a581654" + " " + "inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-slate-700 hover:bg-slate-50 active:scale-95 transition flex-shrink-0 snap-start",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "jsx-7d959b639a581654" + " " + "inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-100",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mic$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Mic$3e$__["Mic"], {
                                                                className: "w-3.5 h-3.5 text-purple-600"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                lineNumber: 1633,
                                                                columnNumber: 21
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                            lineNumber: 1632,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "jsx-7d959b639a581654" + " " + "text-xs sm:text-sm font-medium",
                                                            children: "Audio Lab"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                            lineNumber: 1635,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                    lineNumber: 1628,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    className: "jsx-7d959b639a581654" + " " + "inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-slate-700 hover:bg-slate-50 active:scale-95 transition flex-shrink-0 snap-start",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "jsx-7d959b639a581654" + " " + "inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                                                className: "w-3.5 h-3.5 text-amber-600"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                lineNumber: 1640,
                                                                columnNumber: 21
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                            lineNumber: 1639,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "jsx-7d959b639a581654" + " " + "text-xs sm:text-sm font-medium",
                                                            children: "Solfas"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                            lineNumber: 1642,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                    lineNumber: 1638,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    className: "jsx-7d959b639a581654" + " " + "inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-slate-700 hover:bg-slate-50 active:scale-95 transition flex-shrink-0 snap-start",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "jsx-7d959b639a581654" + " " + "inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__["BookOpen"], {
                                                                className: "w-3.5 h-3.5 text-emerald-600"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                lineNumber: 1647,
                                                                columnNumber: 21
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                            lineNumber: 1646,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "jsx-7d959b639a581654" + " " + "text-xs sm:text-sm font-medium",
                                                            children: "Sheet Music"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                            lineNumber: 1649,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                    lineNumber: 1645,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    className: "jsx-7d959b639a581654" + " " + "inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-slate-700 hover:bg-slate-50 active:scale-95 transition flex-shrink-0 snap-start",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "jsx-7d959b639a581654" + " " + "inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-100",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$music$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Music$3e$__["Music"], {
                                                                className: "w-3.5 h-3.5 text-purple-600"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                lineNumber: 1655,
                                                                columnNumber: 21
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                            lineNumber: 1654,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "jsx-7d959b639a581654" + " " + "text-xs sm:text-sm font-medium",
                                                            children: "Songs Schedule"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                            lineNumber: 1657,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                    lineNumber: 1653,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>router.push('/pages/audiolab'),
                                                    className: "jsx-7d959b639a581654" + " " + "inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-slate-700 hover:bg-slate-50 active:scale-95 transition flex-shrink-0 snap-start",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "jsx-7d959b639a581654" + " " + "inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-100",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mic$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Mic$3e$__["Mic"], {
                                                                className: "w-3.5 h-3.5 text-purple-600"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                lineNumber: 1665,
                                                                columnNumber: 21
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                            lineNumber: 1664,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "jsx-7d959b639a581654" + " " + "text-xs sm:text-sm font-medium",
                                                            children: "Audio Lab"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                            lineNumber: 1667,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                    lineNumber: 1660,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    className: "jsx-7d959b639a581654" + " " + "inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-slate-700 hover:bg-slate-50 active:scale-95 transition flex-shrink-0 snap-start",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "jsx-7d959b639a581654" + " " + "inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                                                className: "w-3.5 h-3.5 text-amber-600"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                lineNumber: 1672,
                                                                columnNumber: 21
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                            lineNumber: 1671,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "jsx-7d959b639a581654" + " " + "text-xs sm:text-sm font-medium",
                                                            children: "Solfas"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                            lineNumber: 1674,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                    lineNumber: 1670,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    className: "jsx-7d959b639a581654" + " " + "inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 shadow-sm text-slate-700 hover:bg-slate-50 active:scale-95 transition flex-shrink-0 snap-start",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "jsx-7d959b639a581654" + " " + "inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$book$2d$open$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__BookOpen$3e$__["BookOpen"], {
                                                                className: "w-3.5 h-3.5 text-emerald-600"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                lineNumber: 1679,
                                                                columnNumber: 21
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                            lineNumber: 1678,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "jsx-7d959b639a581654" + " " + "text-xs sm:text-sm font-medium",
                                                            children: "Sheet Music"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                            lineNumber: 1681,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                    lineNumber: 1677,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                            lineNumber: 1619,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                        lineNumber: 1608,
                                        columnNumber: 13
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                    lineNumber: 1607,
                                    columnNumber: 11
                                }, this),
                                currentPraiseNight && (categoryFilter !== 'archive' || pageParam) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-7d959b639a581654" + " " + "mb-4 sm:mb-6 px-4",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-7d959b639a581654" + " " + "flex items-center justify-between gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setActiveFilter('heard'),
                                                className: "jsx-7d959b639a581654" + " " + `px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 shadow-sm border whitespace-nowrap ${activeFilter === 'heard' ? 'bg-green-100 hover:bg-green-200 text-green-800 border-green-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'}`,
                                                children: [
                                                    "Heard (",
                                                    categoryHeardCount,
                                                    ")"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                lineNumber: 1692,
                                                columnNumber: 13
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-7d959b639a581654" + " " + "flex-1 text-center max-w-[55%] sm:max-w-none",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-7d959b639a581654" + " " + "block sm:hidden text-black text-xs font-medium truncate",
                                                        children: (()=>{
                                                            if (!activeCategory) return '';
                                                            const words = activeCategory.split(' ').filter(Boolean);
                                                            const firstThree = words.slice(0, 3).join(' ');
                                                            return words.length > 3 ? `${firstThree}...` : firstThree;
                                                        })()
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                        lineNumber: 1704,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "jsx-7d959b639a581654" + " " + "hidden sm:inline text-black text-sm font-medium",
                                                        children: activeCategory
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                        lineNumber: 1713,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                lineNumber: 1702,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setActiveFilter('unheard'),
                                                className: "jsx-7d959b639a581654" + " " + `px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95 shadow-sm border whitespace-nowrap ${activeFilter === 'unheard' ? 'bg-orange-100 hover:bg-orange-200 text-orange-800 border-orange-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'}`,
                                                children: [
                                                    "Unheard (",
                                                    categoryUnheardCount,
                                                    ")"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                lineNumber: 1718,
                                                columnNumber: 13
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                        lineNumber: 1691,
                                        columnNumber: 13
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                    lineNumber: 1690,
                                    columnNumber: 11
                                }, this),
                                currentPraiseNight && (categoryFilter !== 'archive' || pageParam) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-7d959b639a581654" + " " + "px-1 py-4 max-h-96 lg:max-h-none overflow-y-auto",
                                    children: filteredSongs.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-7d959b639a581654" + " " + "flex flex-col items-center justify-center py-12 text-gray-500",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-7d959b639a581654" + " " + "w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$music$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Music$3e$__["Music"], {
                                                    className: "w-8 h-8 text-slate-400"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                    lineNumber: 1737,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                lineNumber: 1736,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-7d959b639a581654" + " " + "text-slate-500 text-sm mb-2 font-medium",
                                                children: [
                                                    !currentPraiseNight && 'No praise night selected',
                                                    currentPraiseNight && !activeCategory && 'No category selected',
                                                    currentPraiseNight && activeCategory && categoryTotalCount === 0 && `No songs in ${activeCategory} category yet`,
                                                    currentPraiseNight && activeCategory && categoryTotalCount > 0 && activeFilter === 'heard' && categoryHeardCount === 0 && `No heard songs in ${activeCategory} yet`,
                                                    currentPraiseNight && activeCategory && categoryTotalCount > 0 && activeFilter === 'unheard' && categoryUnheardCount === 0 && `No unheard songs in ${activeCategory} yet`
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                lineNumber: 1739,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "jsx-7d959b639a581654" + " " + "text-slate-400 text-xs",
                                                children: [
                                                    !currentPraiseNight && 'Select a praise night from the dropdown above',
                                                    currentPraiseNight && !activeCategory && 'Select a category from the bottom navigation',
                                                    currentPraiseNight && activeCategory && categoryTotalCount === 0 && 'Songs will appear here when added to this category',
                                                    currentPraiseNight && activeCategory && categoryTotalCount > 0 && activeFilter === 'heard' && categoryHeardCount === 0 && 'Songs will appear here when marked as heard',
                                                    currentPraiseNight && activeCategory && categoryTotalCount > 0 && activeFilter === 'unheard' && categoryUnheardCount === 0 && 'Songs will appear here when marked as unheard'
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                lineNumber: 1746,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                        lineNumber: 1735,
                                        columnNumber: 15
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "jsx-7d959b639a581654" + " " + "lg:grid lg:grid-cols-2 xl:grid-cols-3 lg:gap-4",
                                        children: filteredSongs.map((song, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                onClick: ()=>{
                                                    // Open modal without auto-play
                                                    handleSongClick(song, index);
                                                },
                                                style: (()=>{
                                                    const isActive = currentSong?.id === song.id;
                                                    if (isActive) {
                                                        return {
                                                            backgroundColor: `${zoneColor}40`,
                                                            borderColor: zoneColor,
                                                            boxShadow: `0 0 0 2px ${zoneColor}, 0 10px 15px -3px ${zoneColor}30, 0 4px 6px -2px ${zoneColor}20`
                                                        };
                                                    }
                                                    return {};
                                                })(),
                                                className: "jsx-7d959b639a581654" + " " + `border-0 rounded-2xl p-3 lg:p-4 shadow-sm hover:shadow-lg transition-all duration-300 active:scale-[0.97] group mb-3 lg:mb-0 w-full cursor-pointer touch-optimized ${song.isActive ? 'ring-4 ring-green-500 shadow-lg shadow-green-200/50 bg-white hover:bg-gray-50 animate-pulse-ring' // Admin marked as ACTIVE - blinking green border
                                                 : (()=>{
                                                    const isActive = currentSong?.id === song.id;
                                                    if (isActive) {
                                                        console.log('🎵 Active song detected:', song.title, 'Current song:', currentSong?.title);
                                                    }
                                                    return isActive;
                                                })() ? 'ring-2 shadow-lg' // Playing - use zone color
                                                 : 'bg-white hover:bg-gray-50 ring-1 ring-black/5'}`,
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "jsx-7d959b639a581654" + " " + "flex items-center justify-between",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-7d959b639a581654" + " " + "flex items-center gap-3 lg:gap-4",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    style: {
                                                                        backgroundColor: `${zoneColor}20`
                                                                    },
                                                                    className: "jsx-7d959b639a581654" + " " + "w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-sm",
                                                                    children: currentSong?.id === song.id && isPlaying ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$AudioWave$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                                        className: "h-6 w-6"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                        lineNumber: 1796,
                                                                        columnNumber: 29
                                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        style: {
                                                                            color: zoneColor
                                                                        },
                                                                        className: "jsx-7d959b639a581654" + " " + "text-sm lg:text-base font-semibold",
                                                                        children: index + 1
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                        lineNumber: 1798,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                    lineNumber: 1791,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-7d959b639a581654" + " " + "flex-1",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                            className: "jsx-7d959b639a581654" + " " + "font-medium text-slate-900 text-sm lg:text-base group-hover:text-black leading-tight",
                                                                            children: song.title
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                            lineNumber: 1807,
                                                                            columnNumber: 27
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "jsx-7d959b639a581654" + " " + "text-xs lg:text-sm text-slate-500 mt-0.5 leading-tight font-bold",
                                                                            children: [
                                                                                "Singer: ",
                                                                                song.leadSinger || 'Unknown'
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                            lineNumber: 1810,
                                                                            columnNumber: 27
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                    lineNumber: 1806,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                            lineNumber: 1790,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "jsx-7d959b639a581654" + " " + "flex items-center gap-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    style: {
                                                                        backgroundColor: `${zoneColor}20`
                                                                    },
                                                                    className: "jsx-7d959b639a581654" + " " + "px-2 py-1 rounded-full",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        style: {
                                                                            color: zoneColor
                                                                        },
                                                                        className: "jsx-7d959b639a581654" + " " + "text-xs font-bold",
                                                                        children: [
                                                                            "x",
                                                                            song.rehearsalCount ?? 0
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                        lineNumber: 1821,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                    lineNumber: 1817,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "jsx-7d959b639a581654" + " " + "w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-slate-200 transition-colors",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                                                        className: "w-3 h-3 text-slate-500 group-hover:translate-x-0.5 transition-all duration-200"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                        lineNumber: 1829,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                                    lineNumber: 1828,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                            lineNumber: 1815,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                    lineNumber: 1789,
                                                    columnNumber: 21
                                                }, this)
                                            }, index, false, {
                                                fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                lineNumber: 1757,
                                                columnNumber: 19
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                        lineNumber: 1755,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                    lineNumber: 1733,
                                    columnNumber: 11
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "jsx-7d959b639a581654" + " " + "h-20"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                    lineNumber: 1841,
                                    columnNumber: 9
                                }, this),
                                " "
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                            lineNumber: 1406,
                            columnNumber: 10
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/pages/praise-night/page.tsx",
                        lineNumber: 1405,
                        columnNumber: 8
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/pages/praise-night/page.tsx",
                lineNumber: 982,
                columnNumber: 7
            }, this),
            " ",
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$SharedDrawer$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                open: isMenuOpen,
                onClose: toggleMenu,
                title: "Menu",
                items: menuItems
            }, `drawer-${categoryFilter}`, false, {
                fileName: "[project]/src/app/pages/praise-night/page.tsx",
                lineNumber: 1847,
                columnNumber: 7
            }, this),
            categoryFilter === 'archive' && pageParam && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bottom-bar-enhanced flex-shrink-0 z-30 backdrop-blur-md shadow-sm border-t border-gray-200/50 w-full",
                style: {
                    background: `linear-gradient(to top, ${zoneColor}20, ${zoneColor}10, rgba(255, 255, 255, 0.2))`
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-full flex items-center px-3 sm:px-4 lg:px-6 py-4 gap-2",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-2 min-w-max px-1",
                            children: mainCategories.map((category, index)=>{
                                const hasActiveSong = finalSongData.some((song)=>song.category === category && song.isActive);
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>handleCategorySelect(category),
                                    className: `flex-shrink-0 px-3 py-3 rounded-xl text-xs font-semibold transition-all duration-200 text-center whitespace-nowrap category-button ${hasActiveSong ? 'bg-green-600 text-white border-2 border-green-700 shadow-md' : activeCategory === category ? 'text-white shadow-md' : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white border border-gray-200'}`,
                                    style: activeCategory === category && !hasActiveSong ? {
                                        backgroundColor: zoneColor,
                                        boxShadow: `0 4px 6px -1px ${zoneColor}40, 0 2px 4px -1px ${zoneColor}20`
                                    } : {},
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "block leading-tight",
                                        children: category
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                        lineNumber: 1887,
                                        columnNumber: 23
                                    }, this)
                                }, category, false, {
                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                    lineNumber: 1872,
                                    columnNumber: 17
                                }, this);
                            })
                        }, void 0, false, {
                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                            lineNumber: 1868,
                            columnNumber: 15
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/pages/praise-night/page.tsx",
                        lineNumber: 1865,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                    lineNumber: 1863,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/pages/praise-night/page.tsx",
                lineNumber: 1857,
                columnNumber: 9
            }, this),
            filteredPraiseNights.length > 0 && categoryFilter !== 'archive' && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bottom-bar-enhanced flex-shrink-0 z-30 backdrop-blur-md shadow-sm border-t border-gray-200/50 w-full",
                style: {
                    background: `linear-gradient(to top, ${zoneColor}20, ${zoneColor}10, rgba(255, 255, 255, 0.2))`
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-full flex items-center px-3 sm:px-4 lg:px-6 py-4 gap-2",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-2 min-w-max px-1",
                            children: mainCategories.map((category, index)=>{
                                const hasActiveSong = finalSongData.some((song)=>song.category === category && song.isActive);
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>handleCategorySelect(category),
                                    className: `flex-shrink-0 px-3 py-3 rounded-xl text-xs font-semibold transition-all duration-200 text-center whitespace-nowrap category-button ${hasActiveSong ? 'bg-green-600 text-white border-2 border-green-700 shadow-md' : activeCategory === category ? 'text-white shadow-md' : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white border border-gray-200'}`,
                                    style: activeCategory === category && !hasActiveSong ? {
                                        backgroundColor: zoneColor,
                                        boxShadow: `0 4px 6px -1px ${zoneColor}40, 0 2px 4px -1px ${zoneColor}20`
                                    } : {},
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "block leading-tight",
                                        children: category
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                        lineNumber: 1929,
                                        columnNumber: 25
                                    }, this)
                                }, category, false, {
                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                    lineNumber: 1914,
                                    columnNumber: 17
                                }, this);
                            })
                        }, void 0, false, {
                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                            lineNumber: 1910,
                            columnNumber: 17
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/pages/praise-night/page.tsx",
                        lineNumber: 1907,
                        columnNumber: 15
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                    lineNumber: 1905,
                    columnNumber: 14
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/pages/praise-night/page.tsx",
                lineNumber: 1899,
                columnNumber: 10
            }, this),
            isCategoryDrawerOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "fixed inset-0 bg-black/50 z-40 transition-opacity duration-300",
                        onClick: ()=>setIsCategoryDrawerOpen(false)
                    }, void 0, false, {
                        fileName: "[project]/src/app/pages/praise-night/page.tsx",
                        lineNumber: 1944,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 transform transition-transform duration-300 animate-in slide-in-from-bottom modal-bottom-safe",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "px-6 py-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center justify-between mb-6",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "text-lg font-semibold text-gray-900",
                                            children: "Filter by Category"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                            lineNumber: 1954,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setIsCategoryDrawerOpen(false),
                                            className: "w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                                className: "w-4 h-4 text-gray-600"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                lineNumber: 1959,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                            lineNumber: 1955,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                    lineNumber: 1953,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mb-4 p-3 bg-purple-50 rounded-xl border border-purple-200",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-purple-700 font-medium",
                                        children: [
                                            finalSongData.length,
                                            " Total Scheduled Songs"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                        lineNumber: 1965,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                    lineNumber: 1964,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-2 max-h-96 overflow-y-auto",
                                    children: otherCategories.map((category)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>handleCategorySelect(category),
                                            className: `w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${activeCategory === category ? 'bg-purple-100 border-2 border-purple-300 text-purple-800' : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent text-gray-700'}`,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "font-medium text-slate-900 text-sm leading-tight",
                                                    children: category
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                    lineNumber: 1979,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-xs text-slate-500 mt-0.5 leading-tight",
                                                    children: [
                                                        finalSongData.filter((song)=>song.category === category).length,
                                                        " songs"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                                    lineNumber: 1980,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, category, true, {
                                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                            lineNumber: 1971,
                                            columnNumber: 19
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                                    lineNumber: 1969,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/pages/praise-night/page.tsx",
                            lineNumber: 1951,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/pages/praise-night/page.tsx",
                        lineNumber: 1950,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true),
            isSongDetailOpen && selectedSong && (()=>{
                // Always get the latest song data from finalSongData (real-time)
                const latestSongData = finalSongData.find((s)=>s.id === selectedSong.id) || selectedSong;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$SongDetailModal$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                    selectedSong: latestSongData,
                    isOpen: isSongDetailOpen,
                    onClose: handleCloseSongDetail,
                    currentFilter: activeFilter,
                    songs: finalSongData,
                    onSongChange: (newSong)=>{
                        setSelectedSong(newSong);
                    // Don't auto-play here since the modal handles it
                    }
                }, void 0, false, {
                    fileName: "[project]/src/app/pages/praise-night/page.tsx",
                    lineNumber: 1996,
                    columnNumber: 9
                }, this);
            })()
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/pages/praise-night/page.tsx",
        lineNumber: 977,
        columnNumber: 5
    }, this);
}
function PraiseNightPage() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Suspense"], {
        fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"
                    }, void 0, false, {
                        fileName: "[project]/src/app/pages/praise-night/page.tsx",
                        lineNumber: 2019,
                        columnNumber: 11
                    }, void 0),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-600 text-sm",
                        children: "Loading program data..."
                    }, void 0, false, {
                        fileName: "[project]/src/app/pages/praise-night/page.tsx",
                        lineNumber: 2020,
                        columnNumber: 11
                    }, void 0)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/pages/praise-night/page.tsx",
                lineNumber: 2018,
                columnNumber: 9
            }, void 0)
        }, void 0, false, {
            fileName: "[project]/src/app/pages/praise-night/page.tsx",
            lineNumber: 2017,
            columnNumber: 7
        }, void 0),
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(PraiseNightPageContent, {}, void 0, false, {
            fileName: "[project]/src/app/pages/praise-night/page.tsx",
            lineNumber: 2024,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/app/pages/praise-night/page.tsx",
        lineNumber: 2016,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=src_53bb517d._.js.map