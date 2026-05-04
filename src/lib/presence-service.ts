import { doc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase-setup'

export async function updateUserPresence(userId: string, status: 'online' | 'offline'): Promise<void> {
  if (!userId) return
  try {
    const ref = doc(db, 'presence', userId)
    await setDoc(ref, { 
      status, 
      lastSeen: serverTimestamp() 
    }, { merge: true })
  } catch (err: any) {
    // If we get a permission error, it's likely the rules aren't set for the new presence collection
    if (err?.code === 'permission-denied') {
      // Fail silently to avoid console spam in production
      return;
    }
    console.error('[PresenceService] update error:', err)
  }
}

export function subscribeToUserPresence(userId: string, callback: (presence: { status: 'online' | 'offline', lastSeen: any }) => void): () => void {
  if (!userId) {
    callback({ status: 'offline', lastSeen: null })
    return () => {}
  }
  
  return onSnapshot(doc(db, 'presence', userId), (d) => {
    if (d.exists()) {
      callback(d.data() as any)
    } else {
      callback({ status: 'offline', lastSeen: null })
    }
  }, (err) => {
    console.warn('[PresenceService] subscribe error:', err)
    callback({ status: 'offline', lastSeen: null })
  })
}
