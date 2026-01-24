// Media Comments Service - For video comments in /pages/media
import {
    collection,
    doc,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    Timestamp,
    updateDoc,
    increment,
    onSnapshot,
    deleteDoc
} from 'firebase/firestore'
import { db } from '@/lib/firebase-setup'

export interface MediaComment {
    id: string
    mediaId: string
    userId: string
    userName: string
    userEmail: string
    content: string
    likes: number
    likedBy: string[]
    dislikes: number
    dislikedBy: string[]
    parentId?: string // For replies
    parentUserName?: string // For display
    createdAt: Date
}

class MediaCommentService {
    private commentsCollection = 'media_comments'

    async addComment(
        mediaId: string,
        userId: string,
        userName: string,
        userEmail: string,
        content: string,
        parentId?: string,
        parentUserName?: string
    ): Promise<string> {
        try {
            const docRef = await addDoc(collection(db, this.commentsCollection), {
                mediaId,
                userId,
                userName,
                userEmail,
                content,
                likes: 0,
                likedBy: [],
                dislikes: 0,
                dislikedBy: [],
                parentId: parentId || null,
                parentUserName: parentUserName || null,
                createdAt: Timestamp.now()
            })
            return docRef.id
        } catch (error) {
            console.error('Error adding comment:', error)
            throw error
        }
    }

    async getComments(mediaId: string): Promise<MediaComment[]> {
        try {
            const q = query(
                collection(db, this.commentsCollection),
                where('mediaId', '==', mediaId),
                orderBy('createdAt', 'desc')
            )
            const snapshot = await getDocs(q)
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date()
            })) as MediaComment[]
        } catch (error) {
            console.error('Error fetching comments:', error)
            return []
        }
    }

    subscribeToComments(mediaId: string, callback: (comments: MediaComment[]) => void) {
        const q = query(
            collection(db, this.commentsCollection),
            where('mediaId', '==', mediaId),
            orderBy('createdAt', 'desc')
        )

        return onSnapshot(q, (snapshot) => {
            const comments = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date()
            })) as MediaComment[]
            callback(comments)
        }, (error) => {
            console.error('Error in comment subscription:', error)
        })
    }

    async toggleLike(commentId: string, userId: string): Promise<void> {
        try {
            const commentRef = doc(db, this.commentsCollection, commentId)
            const snapshot = await getDocs(
                query(collection(db, this.commentsCollection), where('__name__', '==', commentId))
            )

            if (!snapshot.empty) {
                const commentData = snapshot.docs[0].data()
                const likedBy = commentData.likedBy || []
                const dislikedBy = commentData.dislikedBy || []

                if (likedBy.includes(userId)) {
                    // Unlike
                    await updateDoc(commentRef, {
                        likes: increment(-1),
                        likedBy: likedBy.filter((id: string) => id !== userId)
                    })
                } else {
                    // Like (and remove dislike if present)
                    const updates: any = {
                        likes: increment(1),
                        likedBy: [...likedBy, userId]
                    }
                    if (dislikedBy.includes(userId)) {
                        updates.dislikes = increment(-1)
                        updates.dislikedBy = dislikedBy.filter((id: string) => id !== userId)
                    }
                    await updateDoc(commentRef, { ...updates })
                }
            }
        } catch (error) {
            console.error('Error toggling like:', error)
            throw error
        }
    }

    async toggleDislike(commentId: string, userId: string): Promise<void> {
        try {
            const commentRef = doc(db, this.commentsCollection, commentId)
            const snapshot = await getDocs(
                query(collection(db, this.commentsCollection), where('__name__', '==', commentId))
            )

            if (!snapshot.empty) {
                const commentData = snapshot.docs[0].data()
                const likedBy = commentData.likedBy || []
                const dislikedBy = commentData.dislikedBy || []

                if (dislikedBy.includes(userId)) {
                    // Undislike
                    await updateDoc(commentRef, {
                        dislikes: increment(-1),
                        dislikedBy: dislikedBy.filter((id: string) => id !== userId)
                    })
                } else {
                    // Dislike (and remove like if present)
                    const updates: any = {
                        dislikes: increment(1),
                        dislikedBy: [...dislikedBy, userId]
                    }
                    if (likedBy.includes(userId)) {
                        updates.likes = increment(-1)
                        updates.likedBy = likedBy.filter((id: string) => id !== userId)
                    }
                    await updateDoc(commentRef, { ...updates })
                }
            }
        } catch (error) {
            console.error('Error toggling dislike:', error)
            throw error
        }
    }

    async deleteComment(commentId: string): Promise<void> {
        try {
            const commentRef = doc(db, this.commentsCollection, commentId)
            await deleteDoc(commentRef)
        } catch (error) {
            console.error('Error deleting comment:', error)
            throw error
        }
    }
}

export const mediaCommentService = new MediaCommentService()
export default mediaCommentService
