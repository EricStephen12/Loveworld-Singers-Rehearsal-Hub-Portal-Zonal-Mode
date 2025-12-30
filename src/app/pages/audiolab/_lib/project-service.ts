/**
 * AUDIOLAB PROJECT SERVICE
 * 
 * Firebase integration for multi-track recording projects
 * Handles: project CRUD, track management, audio file storage
 */

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { db } from '@/lib/firebase-setup';
import type { 
  AudioLabProject, 
  Track, 
  CreateProjectInput, 
  CreateTrackInput 
} from '../_types';

// Collection name
const COLLECTION_NAME = 'audiolab_projects';

// Default track colors
const TRACK_COLORS = [
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#6366f1', // indigo
  '#84cc16', // lime
];

// ============================================
// PROJECT CRUD
// ============================================

/**
 * Create a new project
 */
export async function createProject(input: CreateProjectInput): Promise<{ success: boolean; id?: string; project?: AudioLabProject; error?: string }> {
  try {
    console.log('[ProjectService] Creating project:', input.name);
    
    if (!input.name || !input.ownerId) {
      return { success: false, error: 'Name and owner ID are required' };
    }
    
    const projectData = {
      name: input.name,
      tempo: input.tempo || 120,
      timeSignature: input.timeSignature || '4/4',
      duration: 0,
      tracks: [],
      referenceSongId: input.referenceSongId || null,
      ownerId: input.ownerId,
      collaborators: [],
      zoneId: input.zoneId || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), projectData);
    
    console.log('[ProjectService] Project created with ID:', docRef.id);
    
    // Return the created project
    const project: AudioLabProject = {
      id: docRef.id,
      name: input.name,
      tempo: projectData.tempo,
      timeSignature: projectData.timeSignature,
      duration: 0,
      tracks: [],
      referenceSongId: input.referenceSongId,
      ownerId: input.ownerId,
      collaborators: [],
      zoneId: input.zoneId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return { success: true, id: docRef.id, project };
  } catch (error) {
    console.error('[ProjectService] Error creating project:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create project' 
    };
  }
}

/**
 * Get a project by ID
 */
export async function getProject(projectId: string): Promise<AudioLabProject | null> {
  try {
    console.log('[ProjectService] Fetching project:', projectId);
    
    const docRef = doc(db, COLLECTION_NAME, projectId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      console.log('[ProjectService] Project not found:', projectId);
      return null;
    }
    
    return docToProject(docSnap);
  } catch (error) {
    console.error('[ProjectService] Error fetching project:', error);
    return null;
  }
}

/**
 * Get all projects for a user
 */
export async function getUserProjects(userId: string, limitCount: number = 50): Promise<AudioLabProject[]> {
  try {
    console.log('[ProjectService] Fetching projects for user:', userId);
    
    // Get projects where user is owner (simple query without orderBy to avoid index requirement)
    const ownerQuery = query(
      collection(db, COLLECTION_NAME),
      where('ownerId', '==', userId),
      limit(limitCount)
    );
    
    const ownerSnapshot = await getDocs(ownerQuery);
    const ownedProjects = ownerSnapshot.docs.map(doc => docToProject(doc));
    
    console.log('[ProjectService] Found', ownedProjects.length, 'owned projects');
    
    // Get projects where user is collaborator (simple query)
    let collabProjects: AudioLabProject[] = [];
    try {
      const collabQuery = query(
        collection(db, COLLECTION_NAME),
        where('collaborators', 'array-contains', userId),
        limit(limitCount)
      );
      
      const collabSnapshot = await getDocs(collabQuery);
      collabProjects = collabSnapshot.docs.map(doc => docToProject(doc));
      console.log('[ProjectService] Found', collabProjects.length, 'collab projects');
    } catch (collabError) {
      // Collab query might fail if no index, that's okay
      console.log('[ProjectService] Collab query skipped (may need index)');
    }
    
    // Merge and dedupe
    const allProjects = [...ownedProjects];
    for (const project of collabProjects) {
      if (!allProjects.find(p => p.id === project.id)) {
        allProjects.push(project);
      }
    }
    
    // Sort by updatedAt client-side (to avoid index requirement)
    allProjects.sort((a, b) => {
      const dateA = a.updatedAt instanceof Date ? a.updatedAt : (a.updatedAt as any)?.toDate?.() || new Date(0);
      const dateB = b.updatedAt instanceof Date ? b.updatedAt : (b.updatedAt as any)?.toDate?.() || new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
    
    console.log('[ProjectService] Found', allProjects.length, 'projects');
    return allProjects;
  } catch (error) {
    console.error('[ProjectService] Error fetching user projects:', error);
    return [];
  }
}

/**
 * Recursively remove undefined values from an object
 */
function removeUndefinedValues(obj: any): any {
  if (obj === null || obj === undefined) {
    return null;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => removeUndefinedValues(item));
  }
  
  if (typeof obj === 'object' && obj.constructor === Object) {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = removeUndefinedValues(value);
      }
    }
    return cleaned;
  }
  
  return obj;
}

/**
 * Update a project
 */
export async function updateProject(
  projectId: string, 
  updates: Partial<Omit<AudioLabProject, 'id' | 'createdAt' | 'ownerId'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[ProjectService] Updating project:', projectId);
    
    const docRef = doc(db, COLLECTION_NAME, projectId);
    
    // Remove undefined values recursively (handles nested objects and arrays)
    const cleanUpdates = removeUndefinedValues(updates);
    
    // Ensure we have at least one field to update (besides updatedAt)
    if (!cleanUpdates || Object.keys(cleanUpdates).length === 0) {
      console.log('[ProjectService] No valid updates to apply');
      return { success: true };
    }
    
    await updateDoc(docRef, {
      ...cleanUpdates,
      updatedAt: serverTimestamp()
    });
    
    console.log('[ProjectService] Project updated successfully');
    return { success: true };
  } catch (error) {
    console.error('[ProjectService] Error updating project:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update project' 
    };
  }
}

/**
 * Delete a project
 */
export async function deleteProject(projectId: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[ProjectService] Deleting project:', projectId);
    
    const docRef = doc(db, COLLECTION_NAME, projectId);
    await deleteDoc(docRef);
    
    // TODO: Also delete associated audio files from Cloudinary
    
    console.log('[ProjectService] Project deleted successfully');
    return { success: true };
  } catch (error) {
    console.error('[ProjectService] Error deleting project:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete project' 
    };
  }
}

// ============================================
// TRACK MANAGEMENT
// ============================================

/**
 * Add a track to a project
 */
export async function addTrack(
  projectId: string, 
  input: CreateTrackInput
): Promise<{ success: boolean; track?: Track; error?: string }> {
  try {
    console.log('[ProjectService] Adding track to project:', projectId);
    
    const project = await getProject(projectId);
    if (!project) {
      return { success: false, error: 'Project not found' };
    }
    
    // Generate track ID and assign color
    const trackId = `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const colorIndex = project.tracks.length % TRACK_COLORS.length;
    
    const track: Track = {
      id: trackId,
      name: input.name,
      type: input.type,
      color: input.color || TRACK_COLORS[colorIndex],
      volume: 80,
      pan: 0,
      muted: false,
      solo: false
    };
    
    // Add track to project
    const docRef = doc(db, COLLECTION_NAME, projectId);
    await updateDoc(docRef, {
      tracks: [...project.tracks, track],
      updatedAt: serverTimestamp()
    });
    
    console.log('[ProjectService] Track added:', trackId);
    return { success: true, track };
  } catch (error) {
    console.error('[ProjectService] Error adding track:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to add track' 
    };
  }
}

/**
 * Update a track in a project
 */
export async function updateTrack(
  projectId: string, 
  trackId: string, 
  updates: Partial<Omit<Track, 'id'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[ProjectService] Updating track:', trackId, 'in project:', projectId);
    
    const project = await getProject(projectId);
    if (!project) {
      return { success: false, error: 'Project not found' };
    }
    
    const trackIndex = project.tracks.findIndex(t => t.id === trackId);
    if (trackIndex === -1) {
      return { success: false, error: 'Track not found' };
    }
    
    // Update track - remove undefined values from updates first
    const cleanTrackUpdates = removeUndefinedValues(updates);
    const updatedTracks = [...project.tracks];
    updatedTracks[trackIndex] = { ...updatedTracks[trackIndex], ...cleanTrackUpdates };
    
    // Clean the entire tracks array to remove any undefined values
    const cleanedTracks = removeUndefinedValues(updatedTracks);
    
    // Update project duration if track has audio
    let duration = project.duration;
    if (updates.duration && updates.duration > duration) {
      duration = updates.duration;
    }
    
    const docRef = doc(db, COLLECTION_NAME, projectId);
    await updateDoc(docRef, {
      tracks: cleanedTracks,
      duration,
      updatedAt: serverTimestamp()
    });
    
    console.log('[ProjectService] Track updated successfully');
    return { success: true };
  } catch (error) {
    console.error('[ProjectService] Error updating track:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update track' 
    };
  }
}

/**
 * Delete a track from a project
 */
export async function deleteTrack(
  projectId: string, 
  trackId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[ProjectService] Deleting track:', trackId, 'from project:', projectId);
    
    const project = await getProject(projectId);
    if (!project) {
      return { success: false, error: 'Project not found' };
    }
    
    const track = project.tracks.find(t => t.id === trackId);
    if (!track) {
      return { success: false, error: 'Track not found' };
    }
    
    // TODO: Delete audio file from Cloudinary if exists
    
    // Remove track from project
    const updatedTracks = project.tracks.filter(t => t.id !== trackId);
    
    // Recalculate duration
    const duration = Math.max(0, ...updatedTracks.map(t => t.duration || 0));
    
    const docRef = doc(db, COLLECTION_NAME, projectId);
    await updateDoc(docRef, {
      tracks: updatedTracks,
      duration,
      updatedAt: serverTimestamp()
    });
    
    console.log('[ProjectService] Track deleted successfully');
    return { success: true };
  } catch (error) {
    console.error('[ProjectService] Error deleting track:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete track' 
    };
  }
}

/**
 * Update track audio URL (after upload to Cloudinary)
 */
export async function updateTrackAudio(
  projectId: string, 
  trackId: string, 
  audioUrl: string,
  duration: number,
  waveform?: number[]
): Promise<{ success: boolean; error?: string }> {
  return updateTrack(projectId, trackId, {
    audioUrl,
    duration,
    waveform,
    recordedAt: new Date()
  });
}

// ============================================
// COLLABORATOR MANAGEMENT
// ============================================

/**
 * Add a collaborator to a project
 */
export async function addCollaborator(
  projectId: string, 
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[ProjectService] Adding collaborator:', userId, 'to project:', projectId);
    
    const docRef = doc(db, COLLECTION_NAME, projectId);
    await updateDoc(docRef, {
      collaborators: arrayUnion(userId),
      updatedAt: serverTimestamp()
    });
    
    console.log('[ProjectService] Collaborator added successfully');
    return { success: true };
  } catch (error) {
    console.error('[ProjectService] Error adding collaborator:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to add collaborator' 
    };
  }
}

/**
 * Remove a collaborator from a project
 */
export async function removeCollaborator(
  projectId: string, 
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[ProjectService] Removing collaborator:', userId, 'from project:', projectId);
    
    const docRef = doc(db, COLLECTION_NAME, projectId);
    await updateDoc(docRef, {
      collaborators: arrayRemove(userId),
      updatedAt: serverTimestamp()
    });
    
    console.log('[ProjectService] Collaborator removed successfully');
    return { success: true };
  } catch (error) {
    console.error('[ProjectService] Error removing collaborator:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to remove collaborator' 
    };
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Convert Firestore document to AudioLabProject
 */
function docToProject(doc: any): AudioLabProject {
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name || '',
    tempo: data.tempo || 120,
    timeSignature: data.timeSignature || '4/4',
    duration: data.duration || 0,
    tracks: data.tracks || [],
    referenceSongId: data.referenceSongId || undefined,
    ownerId: data.ownerId || '',
    collaborators: data.collaborators || [],
    zoneId: data.zoneId || undefined,
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || new Date()
  };
}

/**
 * Generate waveform data from audio buffer
 */
export function generateWaveform(audioBuffer: AudioBuffer, samples: number = 100): number[] {
  const channelData = audioBuffer.getChannelData(0);
  const blockSize = Math.floor(channelData.length / samples);
  const waveform: number[] = [];
  
  for (let i = 0; i < samples; i++) {
    let sum = 0;
    for (let j = 0; j < blockSize; j++) {
      sum += Math.abs(channelData[i * blockSize + j]);
    }
    waveform.push(sum / blockSize);
  }
  
  // Normalize to 0-100
  const max = Math.max(...waveform);
  return waveform.map(v => Math.round((v / max) * 100));
}
