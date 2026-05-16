import { FirebaseDatabaseService } from './firebase-database'

export async function updateUserPresence(userId: string, status: 'online' | 'offline'): Promise<void> {
  if (!userId) return
  try {
    await FirebaseDatabaseService.updateDocument('presence', userId, { 
      status, 
      lastSeen: new Date().toISOString()
    })
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
  
  return FirebaseDatabaseService.subscribeToCollectionWhere('presence', 'id', '==', userId, (docs) => {
    const d = docs[0]
    if (d) {
      callback(d as any)
    } else {
      callback({ status: 'offline', lastSeen: null })
    }
  })
}
