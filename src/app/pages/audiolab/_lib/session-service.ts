/**
 * AUDIOLAB SESSION SERVICE
 * 
 * Firebase Realtime Database integration for live collaboration classrooms
 * Handles: classroom management, persistent links, and dynamic live sessions
 */

import {
  ref,
  set,
  get,
  update,
  remove,
  push,
  onValue,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  off,
  query,
  orderByChild,
  equalTo,
  onDisconnect
} from 'firebase/database';
import { realtimeDb, isRealtimeDbAvailable } from '@/lib/firebase-setup';
import type {
  LiveSession,
  Participant,
  PlaybackState,
  ChatMessage
} from '../_types';

// ============================================
// CLASSROOM MANAGEMENT (PERMANENT)
// ============================================

/**
 * Generate a unique 6-character alphanumeric meeting code
 */
function generateMeetingId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Create a permanent classroom
 */
export async function createClassroom(
  hostId: string,
  hostName: string,
  title: string,
  hostAvatar?: string
): Promise<{ success: boolean; classroom?: any; error?: string }> {
  try {
    if (!isRealtimeDbAvailable() || !realtimeDb) return { success: false, error: 'DB Unavailable' };

    const sessionRef = push(ref(realtimeDb, 'audiolab_sessions'));
    const id = sessionRef.key!;
    const code = generateMeetingId();

    const classroom = {
      id,
      code,
      hostId,
      hostName,
      hostAvatar: hostAvatar ?? null, // Use nullish coalescing
      title,
      createdAt: Date.now(),
      status: 'idle', // Classrooms start as idle
      isClassroom: true,
      playback: {
        isPlaying: false,
        currentTime: 0,
        volume: 1,
        speed: 1,
        updatedAt: Date.now(),
        updatedBy: hostId
      }
    };

    await set(sessionRef, classroom);
    return { success: true, classroom };
  } catch (e) {
    console.error('[SessionService] createClassroom error:', e);
    return { success: false, error: 'Failed to create classroom' };
  }
}

/**
 * Get classroom by ID
 */
export async function getClassroom(id: string): Promise<any | null> {
  if (!isRealtimeDbAvailable() || !realtimeDb) return null;
  const snap = await get(ref(realtimeDb, `audiolab_sessions/${id}`));
  if (snap.exists() && snap.val().isClassroom) {
    return { ...snap.val(), id };
  }
  return null;
}

/**
 * Get active session for a classroom
 * This searches for any active session linked to this classroomId
 */
export async function getLiveSessionForClassroom(classroomId: string): Promise<LiveSession | null> {
  try {
    if (!isRealtimeDbAvailable() || !realtimeDb) return null;

    // Optimized: Only query sessions linked to this classroom
    const sessionsRef = ref(realtimeDb, 'audiolab_sessions');
    const classroomQuery = query(
      sessionsRef,
      orderByChild('classroomId'),
      equalTo(classroomId)
    );

    const snap = await get(classroomQuery);
    if (!snap.exists()) {
      // Fallback: Check if the classroom itself is active
      const roomSnap = await get(ref(realtimeDb, `audiolab_sessions/${classroomId}`));
      if (roomSnap.exists() && roomSnap.val().status === 'active') {
        return { ...roomSnap.val(), id: classroomId };
      }
      return null;
    }

    // Find the first active session
    let activeSession: LiveSession | null = null;
    snap.forEach((child) => {
      const s = child.val();
      if (s.status === 'active') {
        activeSession = { ...s, id: child.key! };
        return true; // Break
      }
    });

    return activeSession;
  } catch (e) {
    console.error('[SessionService] getLiveSessionForClassroom error:', e);
    return null;
  }
}

/**
 * Delete a classroom (only host can delete)
 */
export async function deleteClassroom(
  classroomId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isRealtimeDbAvailable() || !realtimeDb) {
      return { success: false, error: 'DB Unavailable' };
    }

    // Verify the user is the host
    const classroom = await getClassroom(classroomId);
    if (!classroom) {
      return { success: false, error: 'Classroom not found' };
    }

    if (classroom.hostId !== userId) {
      return { success: false, error: 'Only the host can delete this classroom' };
    }

    // Delete the classroom
    await remove(ref(realtimeDb, `audiolab_sessions/${classroomId}`));
    return { success: true };
  } catch (e) {
    console.error('[SessionService] deleteClassroom error:', e);
    return { success: false, error: 'Failed to delete classroom' };
  }
}

// ============================================
// SESSION MANAGEMENT (DYNAMIC)
// ============================================

/**
 * Create a new live session linked to a classroom
 */
export async function createSession(
  hostId: string,
  hostName: string,
  hostAvatar?: string,
  options?: {
    projectId?: string; // This is classroomId in our new model
    songId?: string;
    title?: string;
  }
): Promise<{ success: boolean; session?: LiveSession; error?: string }> {
  try {
    if (!isRealtimeDbAvailable() || !realtimeDb) {
      return { success: false, error: 'Realtime Database not available' };
    }

    const code = generateMeetingId();
    const sessionRef = push(ref(realtimeDb, 'audiolab_sessions'));
    const sessionId = sessionRef.key!;

    const session: any = {
      id: sessionId,
      code,
      hostId,
      hostName,
      hostAvatar: hostAvatar ?? null,
      classroomId: options?.projectId || sessionId,
      title: options?.title || `${hostName}'s Session`,
      participants: {
        [hostId]: {
          id: hostId,
          name: hostName,
          avatar: hostAvatar ?? null,
          role: 'host',
          isOnline: true,
          isMuted: false,
          isCameraOn: false,
          joinedAt: Date.now()
        }
      },
      playback: {
        isPlaying: false,
        currentTime: 0,
        updatedAt: Date.now(),
        updatedBy: hostId
      },
      status: 'active',
      startedAt: Date.now()
    };

    await set(sessionRef, session);
    return { success: true, session };
  } catch (error) {
    console.error('[SessionService] Error creating session:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create session'
    };
  }
}

/**
 * Find a session by join code
 */
export async function findSessionByCode(code: string): Promise<LiveSession | null> {
  try {
    if (!isRealtimeDbAvailable() || !realtimeDb) return null;
    const sessionsRef = ref(realtimeDb, 'audiolab_sessions');
    const snapshot = await get(sessionsRef);
    if (!snapshot.exists()) return null;

    const sessions = snapshot.val();
    for (const [id, session] of Object.entries(sessions)) {
      const s = session as LiveSession;
      if (s.code === code.toUpperCase()) {
        return { ...s, id };
      }
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Join an existing session (with auto-activation)
 */
export async function joinSession(
  codeOrId: string,
  userId: string,
  userName: string,
  userAvatar?: string
): Promise<{ success: boolean; session?: LiveSession; error?: string }> {
  try {
    if (!realtimeDb) return { success: false, error: 'DB Unavailable' };

    // First try finding by ID (direct roomId)
    let session = await getSession(codeOrId);

    // If not found by ID, try code
    if (!session) {
      session = await findSessionByCode(codeOrId);
    }

    if (!session) return { success: false, error: 'Session not found' };

    const participantRef = ref(realtimeDb, `audiolab_sessions/${session.id}/participants/${userId}`);
    const participant: Participant = {
      id: userId,
      name: userName,
      avatar: userAvatar ?? null,
      role: 'participant',
      isOnline: true,
      isMuted: false,
      isCameraOn: false,
      joinedAt: Date.now()
    };

    await set(participantRef, participant);

    // Setup Presence: Auto-remove participant on disconnect
    if (realtimeDb) {
      onDisconnect(participantRef).remove().catch(err => {
        console.warn('[SessionService] onDisconnect setup failed:', err);
      });
    }

    if (session.status !== 'active') {
      await update(ref(realtimeDb, `audiolab_sessions/${session.id}`), { status: 'active' });
    }

    await sendMessage(session.id, {
      type: 'system',
      content: `${userName} joined`,
      senderId: 'system',
      senderName: 'System'
    });

    return { success: true, session: { ...session, participants: { ...session.participants, [userId]: participant } } };
  } catch (error) {
    return { success: false, error: 'Failed to join' };
  }
}

/**
 * Leave a session
 */
export async function leaveSession(
  sessionId: string,
  userId: string,
  userName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!realtimeDb) return { success: false, error: 'DB Unavailable' };
    await remove(ref(realtimeDb, `audiolab_sessions/${sessionId}/participants/${userId}`));
    await sendMessage(sessionId, {
      type: 'system',
      content: `${userName} left`,
      senderId: 'system',
      senderName: 'System'
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed' };
  }
}

/**
 * End a session
 */
export async function endSession(sessionId: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!realtimeDb) return { success: false };
    await update(ref(realtimeDb, `audiolab_sessions/${sessionId}`), {
      status: 'ended',
      endedAt: Date.now()
    });
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

/**
 * Get session by ID
 */
export async function getSession(sessionId: string): Promise<LiveSession | null> {
  try {
    if (!realtimeDb) return null;
    const snap = await get(ref(realtimeDb, `audiolab_sessions/${sessionId}`));
    return snap.exists() ? { ...snap.val(), id: sessionId } : null;
  } catch (e) { return null; }
}

// ============================================
// REAL-TIME SUBSCRIPTIONS
// ============================================

interface SessionCallbacks {
  onParticipantJoined?: (participant: Participant) => void;
  onParticipantLeft?: (participantId: string) => void;
  onParticipantUpdated?: (participant: Participant) => void;
  onPlaybackStateChanged?: (state: PlaybackState) => void;
  onSessionEnded?: () => void;
}

export function subscribeToSession(sessionId: string, callbacks: SessionCallbacks): () => void {
  if (!realtimeDb) return () => { };
  const participantsRef = ref(realtimeDb, `audiolab_sessions/${sessionId}/participants`);
  const playbackRef = ref(realtimeDb, `audiolab_sessions/${sessionId}/playback`);
  const statusRef = ref(realtimeDb, `audiolab_sessions/${sessionId}/status`);

  const joinedUnsub = onChildAdded(participantsRef, (snap) => callbacks.onParticipantJoined?.(snap.val()));
  const updatedUnsub = onChildChanged(participantsRef, (snap) => callbacks.onParticipantUpdated?.(snap.val()));
  const leftUnsub = onChildRemoved(participantsRef, (snap) => callbacks.onParticipantLeft?.(snap.key!));
  const playbackUnsub = onValue(playbackRef, (snap) => snap.exists() && callbacks.onPlaybackStateChanged?.(snap.val()));
  const statusUnsub = onValue(statusRef, (snap) => snap.val() === 'ended' && callbacks.onSessionEnded?.());

  return () => {
    off(participantsRef);
    off(playbackRef);
    off(statusRef);
  };
}

// ============================================
// CHAT
// ============================================

export async function sendMessage(
  sessionId: string,
  message: Omit<ChatMessage, 'id' | 'timestamp' | 'status'>
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    if (!realtimeDb) return { success: false };
    const messagesRef = ref(realtimeDb, `audiolab_sessions/${sessionId}/messages`);
    const newMessageRef = push(messagesRef);
    const fullMessage: ChatMessage = {
      ...message,
      id: newMessageRef.key!,
      timestamp: Date.now(),
      status: 'sent'
    };
    await set(newMessageRef, fullMessage);
    return { success: true, messageId: newMessageRef.key! };
  } catch (error) { return { success: false }; }
}

export function subscribeToMessages(sessionId: string, callback: (message: ChatMessage) => void): () => void {
  if (!realtimeDb) return () => { };
  const messagesRef = ref(realtimeDb, `audiolab_sessions/${sessionId}/messages`);
  const unsub = onChildAdded(messagesRef, (snap) => callback({ ...snap.val(), id: snap.key! }));
  return () => off(messagesRef);
}

export async function getMessages(sessionId: string): Promise<ChatMessage[]> {
  try {
    if (!realtimeDb) return [];
    const messagesRef = ref(realtimeDb, `audiolab_sessions/${sessionId}/messages`);
    const snap = await get(messagesRef);
    if (!snap.exists()) return [];

    const messages: ChatMessage[] = [];
    snap.forEach((child) => {
      messages.push({ ...child.val(), id: child.key });
    });
    return messages.sort((a, b) => a.timestamp - b.timestamp);
  } catch (e) { return []; }
}

export async function deleteMessage(sessionId: string, messageId: string, userId: string): Promise<{ success: boolean }> {
  try {
    if (!realtimeDb) return { success: false };
    const messageRef = ref(realtimeDb, `audiolab_sessions/${sessionId}/messages/${messageId}`);
    const snap = await get(messageRef);
    if (!snap.exists() || snap.val().senderId !== userId) return { success: false };
    await remove(messageRef);
    return { success: true };
  } catch (e) { return { success: false }; }
}

// ============================================
// PLAYBACK & PARTICIPANTS (EXISTING)
// ============================================

export async function toggleMute(sessionId: string, userId: string, isMuted: boolean): Promise<void> {
  if (!realtimeDb) return;
  await update(ref(realtimeDb, `audiolab_sessions/${sessionId}/participants/${userId}`), { isMuted });
}

export async function toggleCamera(sessionId: string, userId: string, isCameraOn: boolean): Promise<void> {
  if (!realtimeDb) return;
  await update(ref(realtimeDb, `audiolab_sessions/${sessionId}/participants/${userId}`), { isCameraOn });
}

export async function updatePlaybackState(sessionId: string, state: Partial<PlaybackState>, userId: string): Promise<void> {
  if (!realtimeDb) return;
  await update(ref(realtimeDb, `audiolab_sessions/${sessionId}/playback`), { ...state, updatedAt: Date.now(), updatedBy: userId });
}

// ============================================
// DATA DISCOVERY
// ============================================

export async function getActiveSessions(limitCount: number = 10): Promise<LiveSession[]> {
  try {
    if (!realtimeDb) return [];
    const snap = await get(ref(realtimeDb, 'audiolab_sessions'));
    if (!snap.exists()) return [];
    const sessions: LiveSession[] = [];
    snap.forEach((child) => {
      const s = child.val();
      if (s.status === 'active') sessions.push({ ...s, id: child.key! });
    });
    return sessions.sort((a, b) => b.startedAt - a.startedAt).slice(0, limitCount);
  } catch (e) { return []; }
}

export async function getUserClassrooms(userId: string): Promise<any[]> {
  try {
    if (!isRealtimeDbAvailable() || !realtimeDb) return [];

    // Optimized: Only fetch rooms where this user is the host
    const sessionsRef = ref(realtimeDb, 'audiolab_sessions');
    const hostQuery = query(
      sessionsRef,
      orderByChild('hostId'),
      equalTo(userId)
    );

    const snap = await get(hostQuery);
    const rooms: any[] = [];

    if (snap.exists()) {
      snap.forEach((child) => {
        const room = child.val();
        if (room.isClassroom) {
          rooms.push({ ...room, id: child.key });
        }
      });
    }

    return rooms.sort((a, b) => b.createdAt - a.createdAt);
  } catch (e) {
    console.error('[SessionService] getUserClassrooms error:', e);
    return [];
  }
}
