
import { collection, query, where, orderBy, getDocs, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase-setup';
import type { HistoryEntry } from '@/types/supabase';

// History Operations

export async function getHistoryBySongId(songId: string | number): Promise<HistoryEntry[]> {
    try {
        const q = query(
            collection(db, 'song_history'),
            where('song_id', '==', String(songId)),
            orderBy('created_at', 'desc')
        );

        const snap = await getDocs(q);
        
        const historyEntries = snap.docs.map(doc => {
            const entry = doc.data();
            return {
                id: doc.id,
                type: entry.type,
                title: entry.title,
                description: entry.description,
                old_value: entry.old_value,
                new_value: entry.new_value,
                created_by: entry.created_by,
                date: entry.created_at,
                version: entry.title
            } as HistoryEntry;
        });

        return historyEntries;
    } catch (error) {
        console.error('Error fetching history from Firebase:', error);
        return [];
    }
}

export async function createHistoryEntry(entry: any): Promise<boolean> {
    try {
        await addDoc(collection(db, 'song_history'), {
            ...entry,
            song_id: String(entry.song_id), // ensure string
            created_at: entry.created_at || new Date().toISOString()
        });
        return true;
    } catch (error) {
        console.error('Error creating history entry in Firebase:', error);
        return false;
    }
}
