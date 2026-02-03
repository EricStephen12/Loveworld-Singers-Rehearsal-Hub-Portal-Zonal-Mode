
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase-setup'
import { isHQGroup } from '@/config/zones'

/**
 * Service to handle metadata operations for smart caching.
 * 
 * CONCEPT:
 * Instead of listening to an entire collection (Expensive), we listen to a single
 * metadata document (Cheap). When that document changes, we know we need to re-fetch
 * the actual data.
 * 
 * SUPPORTS:
 * - Collection-level metadata (praise_nights, songs)
 * - Individual song metadata (for realtime lyrics updates)
 */
export class FirebaseMetadataService {

    /**
     * Helper to get the correct metadata document ID based on zone.
     */
    private static getMetadataKey(zoneId: string, type: 'praise_nights' | 'songs' | 'page_categories' | 'categories' = 'praise_nights'): string {
        const prefix = isHQGroup(zoneId) ? 'hq' : `zone_${zoneId}`
        return `${prefix}_${type}_metadata`
    }

    /**
     * Helper to get the metadata document ID for a specific song.
     */
    private static getSongMetadataKey(zoneId: string, praiseNightId: string, songId: string): string {
        const prefix = isHQGroup(zoneId) ? 'hq' : `zone_${zoneId}`
        return `${prefix}_song_${praiseNightId}_${songId}`
    }

    /**
     * Helper to get the metadata document ID for a specific praise night's SONG LIST.
     */
    private static getPraiseNightSongsMetadataKey(zoneId: string, praiseNightId: string): string {
        const prefix = isHQGroup(zoneId) ? 'hq' : `zone_${zoneId}`
        return `${prefix}_praise_night_songs_${praiseNightId}`
    }

    /**
     * Updates the metadata timestamp for a specific zone and type.
     * Call this whenever you Create, Update, or Delete an item.
     */
    static async updateMetadata(zoneId: string, type: 'praise_nights' | 'songs' | 'page_categories' | 'categories' = 'praise_nights') {
        if (!zoneId) return

        try {
            const docId = this.getMetadataKey(zoneId, type)
            const docRef = doc(db, 'sys_metadata', docId)

            // We use setDoc with merge: true to create if it doesn't exist
            await setDoc(docRef, {
                lastUpdated: serverTimestamp(),
                zoneId,
                type
            }, { merge: true })

            console.log(`🔔 [Metadata] Updated ${docId} timestamp`)
        } catch (error) {
            console.error('Error updating metadata:', error)
            // Non-blocking error - we don't want to fail the main operation if metadata fails
        }
    }

    /**
     * Subscribes to metadata changes for a specific zone.
     * Returns an unsubscribe function.
     */
    static subscribeToMetadata(
        zoneId: string,
        type: 'praise_nights' | 'songs' | 'page_categories' | 'categories' = 'praise_nights',
        callback: (timestamp: number) => void
    ) {
        if (!zoneId) return () => { }

        const docId = this.getMetadataKey(zoneId, type)
        const docRef = doc(db, 'sys_metadata', docId)

        console.log(`📡 [Metadata] Subscribing to ${docId}...`)

        return onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data()
                // Convert Firestore Timestamp to milliseconds
                const timestamp = data.lastUpdated?.toMillis?.() || Date.now()
                callback(timestamp)
            } else {
                // If doc doesn't exist yet, it means no updates have happened.
                // We can treat this as "never updated" or just current time
                callback(0)
            }
        }, (error) => {
            console.error('Error subscribing to metadata:', error)
        })
    }

    /**
     * Force initialize metadata if it doesn't exist (Self-healing).
     */
    static async ensureMetadataExists(zoneId: string, type: 'praise_nights' | 'songs' | 'page_categories' | 'categories' = 'praise_nights') {
        const docId = this.getMetadataKey(zoneId, type)
        const docRef = doc(db, 'sys_metadata', docId)

        try {
            const snap = await getDoc(docRef)
            if (!snap.exists()) {
                await this.updateMetadata(zoneId, type)
            }
        } catch (e) {
            console.warn('Metadata check failed, likely permission issue or offline', e)
        }
    }

    // ========================================
    // SONG-LEVEL METADATA (Individual Songs)
    // ========================================

    /**
     * Updates the metadata timestamp for a specific song.
     * Call this whenever you Create, Update, or Delete a song.
     */
    static async updateSongMetadata(zoneId: string, praiseNightId: string, songId: string) {
        if (!zoneId || !praiseNightId || !songId) return

        try {
            const docId = this.getSongMetadataKey(zoneId, praiseNightId, songId)
            const docRef = doc(db, 'sys_metadata', docId)

            await setDoc(docRef, {
                lastUpdated: serverTimestamp(),
                zoneId,
                praiseNightId,
                songId,
                type: 'song'
            }, { merge: true })

            console.log(`🔔 [Metadata] Updated song ${songId} timestamp`)
        } catch (error) {
            console.error('Error updating song metadata:', error)
            // Non-blocking error
        }
    }

    /**
     * Subscribes to metadata changes for a specific song.
     * Returns an unsubscribe function.
     */
    static subscribeToSongMetadata(
        zoneId: string,
        praiseNightId: string,
        songId: string,
        callback: (timestamp: number) => void
    ) {
        if (!zoneId || !praiseNightId || !songId) return () => { }

        const docId = this.getSongMetadataKey(zoneId, praiseNightId, songId)
        const docRef = doc(db, 'sys_metadata', docId)

        console.log(`📡 [Metadata] Subscribing to song ${songId}...`)

        return onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data()
                const timestamp = data.lastUpdated?.toMillis?.() || Date.now()
                callback(timestamp)
            } else {
                // Song metadata doesn't exist yet (first time)
                callback(0)
            }
        }, (error) => {
            console.error('Error subscribing to song metadata:', error)
        })
    }

    /**
     * Force initialize song metadata if it doesn't exist.
     */
    static async ensureSongMetadataExists(zoneId: string, praiseNightId: string, songId: string) {
        const docId = this.getSongMetadataKey(zoneId, praiseNightId, songId)
        const docRef = doc(db, 'sys_metadata', docId)

        try {
            const snap = await getDoc(docRef)
            if (!snap.exists()) {
                await this.updateSongMetadata(zoneId, praiseNightId, songId)
            }
        } catch (e) {
            console.warn('Song metadata check failed', e)
        }
    }

    // ========================================
    // PAGE-LEVEL SONG LIST METADATA
    // ========================================

    /**
     * Updates the metadata timestamp for a specific praise night's song list.
     */
    static async updatePraiseNightSongsMetadata(zoneId: string, praiseNightId: string) {
        if (!zoneId || !praiseNightId) return

        try {
            const docId = this.getPraiseNightSongsMetadataKey(zoneId, praiseNightId)
            const docRef = doc(db, 'sys_metadata', docId)

            await setDoc(docRef, {
                lastUpdated: serverTimestamp(),
                zoneId,
                praiseNightId,
                type: 'praise_night_songs'
            }, { merge: true })

            console.log(`🔔 [Metadata] Updated page ${praiseNightId} song list timestamp`)
        } catch (error) {
            console.error('Error updating page songs metadata:', error)
        }
    }

    /**
     * Subscribes to metadata changes for a specific praise night's song list.
     */
    static subscribeToPraiseNightSongsMetadata(
        zoneId: string,
        praiseNightId: string,
        callback: (timestamp: number) => void
    ) {
        if (!zoneId || !praiseNightId) return () => { }

        const docId = this.getPraiseNightSongsMetadataKey(zoneId, praiseNightId)
        const docRef = doc(db, 'sys_metadata', docId)

        console.log(`📡 [Metadata] Subscribing to page ${praiseNightId} song list...`)

        return onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data()
                const timestamp = data.lastUpdated?.toMillis?.() || Date.now()
                callback(timestamp)
            } else {
                callback(0)
            }
        }, (error) => {
            console.error('Error subscribing to page songs metadata:', error)
        })
    }
}
