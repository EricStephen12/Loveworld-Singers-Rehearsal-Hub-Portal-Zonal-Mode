/**
 * AUDIOLAB SESSION SERVICE
 * 
 * Firebase Realtime Database integration for live collaboration sessions
 * Handles: session creation, joining, real-time sync, chat
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
  serverTimestamp,
  off
} from 'firebase/database';
import { realtimeDb } from '@/lib/firebase-setup';
import type { 
  LiveSession, 
  Participant, 
  PlaybackState, 
  ChatMessage 
} from '../_types';

// ============================================
// SESSION MANAGEMENT
// ============================================

/**
 * Generate a unique 6-digit session code
 */
function generateSessionCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Check if a session code is already in use
 */
async function isCodeInUse(code: string): Promise<boolean> {
  const sessionsRef = ref(realtimeDb, 'audiolab_sessions');
  const snapshot = await get(sessionsRef);
  
  if (!snapshot.exists()) return false;
  
  const sessions = snapshot.val();
  return Object.values(sessions).some(
    (session: any) => session.code === code && session.status === 'active'
  );
}

/**
 * Generate a unique session code (retry if collision)
 */
async function generateUniqueCode(): Promise<string> {
  let code = generateSessionCode();
  let attempts = 0;
  
  while (await isCodeInUse(code) && attempts < 10) {
    code = generateSessionCode();
    attempts++;
  }
  
  return code;
}

/**
 * Create a new live session
 */
export async function createSession(
  hostId: string,
  hostName: string,
  hostAvatar?: string,
  options?: {
    projectId?: string;
    songId?: string;
    title?: string;
  }
): Promise<{ success: boolean; session?: LiveSession; error?: string }> {
  try {
    console.log('[SessionService] Creating session for host:', hostId);
    
    const code = await generateUniqueCode();
    const sessionRef = push(ref(realtimeDb, 'audiolab_sessions'));
    const sessionId = sessionRef.key!;
    
    const session: LiveSession = {
      id: sessionId,
      code,
      hostId,
      hostName,
      projectId: options?.projectId,
      songId: options?.songId,
      title: options?.title || `${hostName}'s Session`,
      participants: {
        [hostId]: {
          id: hostId,
          name: hostName,
          avatar: hostAvatar,
          role: 'host',
          isOnline: true,
          isMuted: false,
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
    
    console.log('[SessionService] Session created:', sessionId, 'Code:', code);
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
    console.log('[SessionService] Finding session with code:', code);
    
    const sessionsRef = ref(realtimeDb, 'audiolab_sessions');
    const snapshot = await get(sessionsRef);
    
    if (!snapshot.exists()) return null;
    
    const sessions = snapshot.val();
    for (const [id, session] of Object.entries(sessions)) {
      const s = session as LiveSession;
      if (s.code === code.toUpperCase() && s.status === 'active') {
        return { ...s, id };
      }
    }
    
    return null;
  } catch (error) {
    console.error('[SessionService] Error finding session:', error);
    return null;
  }
}

/**
 * Join an existing session
 */
export async function joinSession(
  code: string,
  userId: string,
  userName: string,
  userAvatar?: string
): Promise<{ success: boolean; session?: LiveSession; error?: string }> {
  try {
    console.log('[SessionService] Joining session:', code);
    
    const session = await findSessionByCode(code);
    if (!session) {
      return { success: false, error: 'Session not found or has ended' };
    }
    
    // Add participant
    const participantRef = ref(
      realtimeDb, 
      `audiolab_sessions/${session.id}/participants/${userId}`
    );
    
    const participant: Participant = {
      id: userId,
      name: userName,
      avatar: userAvatar,
      role: 'participant',
      isOnline: true,
      isMuted: false,
      joinedAt: Date.now()
    };
    
    await set(participantRef, participant);
    
    // Send system message
    await sendMessage(session.id, {
      type: 'system',
      content: `${userName} joined the session`,
      senderId: 'system',
      senderName: 'System'
    });
    
    console.log('[SessionService] Joined session:', session.id);
    return { success: true, session: { ...session, participants: { ...session.participants, [userId]: participant } } };
  } catch (error) {
    console.error('[SessionService] Error joining session:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to join session' 
    };
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
    console.log('[SessionService] Leaving session:', sessionId);
    
    // Remove participant
    const participantRef = ref(
      realtimeDb, 
      `audiolab_sessions/${sessionId}/participants/${userId}`
    );
    await remove(participantRef);
    
    // Send system message
    await sendMessage(sessionId, {
      type: 'system',
      content: `${userName} left the session`,
      senderId: 'system',
      senderName: 'System'
    });
    
    console.log('[SessionService] Left session:', sessionId);
    return { success: true };
  } catch (error) {
    console.error('[SessionService] Error leaving session:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to leave session' 
    };
  }
}

/**
 * End a session (host only)
 */
export async function endSession(sessionId: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[SessionService] Ending session:', sessionId);
    
    const sessionRef = ref(realtimeDb, `audiolab_sessions/${sessionId}`);
    await update(sessionRef, {
      status: 'ended',
      endedAt: Date.now()
    });
    
    console.log('[SessionService] Session ended:', sessionId);
    return { success: true };
  } catch (error) {
    console.error('[SessionService] Error ending session:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to end session' 
    };
  }
}

/**
 * Get a session by ID
 */
export async function getSession(sessionId: string): Promise<LiveSession | null> {
  try {
    const sessionRef = ref(realtimeDb, `audiolab_sessions/${sessionId}`);
    const snapshot = await get(sessionRef);
    
    if (!snapshot.exists()) return null;
    
    return { ...snapshot.val(), id: sessionId };
  } catch (error) {
    console.error('[SessionService] Error getting session:', error);
    return null;
  }
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

/**
 * Subscribe to session updates
 */
export function subscribeToSession(
  sessionId: string,
  callbacks: SessionCallbacks
): () => void {
  console.log('[SessionService] Subscribing to session:', sessionId);
  
  const participantsRef = ref(realtimeDb, `audiolab_sessions/${sessionId}/participants`);
  const playbackRef = ref(realtimeDb, `audiolab_sessions/${sessionId}/playback`);
  const statusRef = ref(realtimeDb, `audiolab_sessions/${sessionId}/status`);
  
  // Participant joined
  const joinedUnsub = onChildAdded(participantsRef, (snapshot) => {
    const participant = snapshot.val() as Participant;
    callbacks.onParticipantJoined?.(participant);
  });
  
  // Participant updated
  const updatedUnsub = onChildChanged(participantsRef, (snapshot) => {
    const participant = snapshot.val() as Participant;
    callbacks.onParticipantUpdated?.(participant);
  });
  
  // Participant left
  const leftUnsub = onChildRemoved(participantsRef, (snapshot) => {
    callbacks.onParticipantLeft?.(snapshot.key!);
  });
  
  // Playback state changed
  const playbackUnsub = onValue(playbackRef, (snapshot) => {
    if (snapshot.exists()) {
      callbacks.onPlaybackStateChanged?.(snapshot.val());
    }
  });
  
  // Session status changed
  const statusUnsub = onValue(statusRef, (snapshot) => {
    if (snapshot.val() === 'ended') {
      callbacks.onSessionEnded?.();
    }
  });
  
  // Return cleanup function
  return () => {
    off(participantsRef);
    off(playbackRef);
    off(statusRef);
  };
}

// ============================================
// PLAYBACK SYNC
// ============================================

/**
 * Update playback state (syncs to all participants)
 */
export async function updatePlaybackState(
  sessionId: string,
  state: Partial<PlaybackState>,
  userId: string
): Promise<void> {
  try {
    const playbackRef = ref(realtimeDb, `audiolab_sessions/${sessionId}/playback`);
    await update(playbackRef, {
      ...state,
      updatedAt: Date.now(),
      updatedBy: userId
    });
  } catch (error) {
    console.error('[SessionService] Error updating playback:', error);
  }
}

/**
 * Sync play action
 */
export async function syncPlay(sessionId: string, userId: string, currentTime: number): Promise<void> {
  await updatePlaybackState(sessionId, { isPlaying: true, currentTime }, userId);
}

/**
 * Sync pause action
 */
export async function syncPause(sessionId: string, userId: string, currentTime: number): Promise<void> {
  await updatePlaybackState(sessionId, { isPlaying: false, currentTime }, userId);
}

/**
 * Sync seek action
 */
export async function syncSeek(sessionId: string, userId: string, currentTime: number): Promise<void> {
  await updatePlaybackState(sessionId, { currentTime }, userId);
}

// ============================================
// PARTICIPANT MANAGEMENT
// ============================================

/**
 * Update participant status
 */
export async function updateParticipant(
  sessionId: string,
  userId: string,
  updates: Partial<Participant>
): Promise<void> {
  try {
    const participantRef = ref(
      realtimeDb, 
      `audiolab_sessions/${sessionId}/participants/${userId}`
    );
    await update(participantRef, updates);
  } catch (error) {
    console.error('[SessionService] Error updating participant:', error);
  }
}

/**
 * Toggle mute status
 */
export async function toggleMute(sessionId: string, userId: string, isMuted: boolean): Promise<void> {
  await updateParticipant(sessionId, userId, { isMuted });
}

/**
 * Set online status
 */
export async function setOnlineStatus(sessionId: string, userId: string, isOnline: boolean): Promise<void> {
  await updateParticipant(sessionId, userId, { isOnline });
}

// ============================================
// CHAT
// ============================================

/**
 * Send a chat message
 */
export async function sendMessage(
  sessionId: string,
  message: Omit<ChatMessage, 'id' | 'timestamp' | 'status'>
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
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
  } catch (error) {
    console.error('[SessionService] Error sending message:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send message' 
    };
  }
}

/**
 * Subscribe to chat messages
 */
export function subscribeToMessages(
  sessionId: string,
  callback: (message: ChatMessage) => void
): () => void {
  const messagesRef = ref(realtimeDb, `audiolab_sessions/${sessionId}/messages`);
  
  const unsub = onChildAdded(messagesRef, (snapshot) => {
    const message = snapshot.val() as ChatMessage;
    callback({ ...message, id: snapshot.key! });
  });
  
  return () => off(messagesRef);
}

/**
 * Get all messages for a session
 */
export async function getMessages(sessionId: string): Promise<ChatMessage[]> {
  try {
    const messagesRef = ref(realtimeDb, `audiolab_sessions/${sessionId}/messages`);
    const snapshot = await get(messagesRef);
    
    if (!snapshot.exists()) return [];
    
    const messages: ChatMessage[] = [];
    snapshot.forEach((child) => {
      messages.push({ ...child.val(), id: child.key });
    });
    
    return messages.sort((a, b) => a.timestamp - b.timestamp);
  } catch (error) {
    console.error('[SessionService] Error getting messages:', error);
    return [];
  }
}

// ============================================
// ACTIVE SESSIONS
// ============================================

/**
 * Get all active sessions (for discovery)
 */
export async function getActiveSessions(limitCount: number = 10): Promise<LiveSession[]> {
  try {
    const sessionsRef = ref(realtimeDb, 'audiolab_sessions');
    const snapshot = await get(sessionsRef);
    
    if (!snapshot.exists()) return [];
    
    const sessions: LiveSession[] = [];
    snapshot.forEach((child) => {
      const session = child.val() as LiveSession;
      if (session.status === 'active') {
        sessions.push({ ...session, id: child.key! });
      }
    });
    
    // Sort by startedAt descending and limit
    return sessions
      .sort((a, b) => b.startedAt - a.startedAt)
      .slice(0, limitCount);
  } catch (error) {
    console.error('[SessionService] Error getting active sessions:', error);
    return [];
  }
}

/**
 * Get user's active sessions
 */
export async function getUserSessions(userId: string): Promise<LiveSession[]> {
  try {
    const sessionsRef = ref(realtimeDb, 'audiolab_sessions');
    const snapshot = await get(sessionsRef);
    
    if (!snapshot.exists()) return [];
    
    const sessions: LiveSession[] = [];
    snapshot.forEach((child) => {
      const session = child.val() as LiveSession;
      if (session.status === 'active' && session.participants?.[userId]) {
        sessions.push({ ...session, id: child.key! });
      }
    });
    
    return sessions.sort((a, b) => b.startedAt - a.startedAt);
  } catch (error) {
    console.error('[SessionService] Error getting user sessions:', error);
    return [];
  }
}
