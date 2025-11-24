/**
 * CLOUDINARY MEDIA SERVICE - ZONE AWARE
 * 
 * Manages media files stored in Cloudinary
 * HQ Groups: Uses 'cloudinary_media' collection (unfiltered)
 * Regular Zones: Uses 'zone_cloudinary_media' collection (filtered by zoneId)
 */

import { db } from './firebase-setup';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { isHQGroup } from '@/config/zones';

// Helper to get correct collection name based on zone
function getCollectionName(zoneId?: string): string {
  if (zoneId && isHQGroup(zoneId)) {
    console.log('🏢 Using HQ media collection: cloudinary_media');
    return 'cloudinary_media';
  }
  console.log('📍 Using zone media collection: zone_cloudinary_media');
  return 'zone_cloudinary_media';
}

export interface CloudinaryMediaFile {
  id: string;
  name: string;
  url: string;
  publicId: string; // Cloudinary public ID for deletion
  resourceType: 'image' | 'video' | 'raw'; // Cloudinary resource type
  type: 'image' | 'audio' | 'video' | 'document'; // User-friendly type
  size: number;
  folder: string;
  format?: string; // File extension (jpg, mp3, etc.)
  width?: number; // For images/videos
  height?: number; // For images/videos
  duration?: number; // For audio/video (seconds)
  zoneId?: string; // Zone ID for filtering (regular zones only)
  createdAt: string;
  updatedAt: string;
}

/**
 * Get all media files for a zone
 */
export async function getAllCloudinaryMedia(zoneId?: string): Promise<CloudinaryMediaFile[]> {
  try {
    console.log('📖 [CloudinaryMedia] Getting media files for zone:', zoneId);
    console.log('📖 [CloudinaryMedia] Is HQ Group?', zoneId ? isHQGroup(zoneId) : 'No zone');
    
    const collectionName = getCollectionName(zoneId);
    console.log('📖 [CloudinaryMedia] Using collection:', collectionName);
    
    const mediaRef = collection(db, collectionName);
    
    // For regular zones, filter by zoneId
    let q;
    if (zoneId && !isHQGroup(zoneId)) {
      console.log('📍 [CloudinaryMedia] Filtering by zoneId:', zoneId);
      // Try without orderBy first to avoid index issues
      q = query(mediaRef, where('zoneId', '==', zoneId));
    } else {
      console.log('🏢 [CloudinaryMedia] Loading all (HQ or no zone)');
      // HQ groups see all media (no filter)
      q = query(mediaRef);
    }
    
    const snapshot = await getDocs(q);
    console.log('📊 [CloudinaryMedia] Query returned', snapshot.docs.length, 'documents');
    
    const files = snapshot.docs.map(doc => {
      const data = doc.data();
      console.log('📄 [CloudinaryMedia] Document:', doc.id, 'zoneId:', data.zoneId, 'name:', data.name);
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      };
    }) as CloudinaryMediaFile[];
    
    // Sort by createdAt in JavaScript (to avoid index requirement)
    files.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    console.log(`✅ [CloudinaryMedia] Found ${files.length} media files from ${collectionName}`);
    return files;
  } catch (error) {
    console.error('❌ [CloudinaryMedia] Error getting media files:', error);
    return [];
  }
}

/**
 * Get media files by type
 */
export async function getCloudinaryMediaByType(type: 'image' | 'audio' | 'video' | 'document', zoneId?: string): Promise<CloudinaryMediaFile[]> {
  try {
    console.log(`📖 [CloudinaryMedia] Getting ${type} files for zone:`, zoneId);
    
    const collectionName = getCollectionName(zoneId);
    const mediaRef = collection(db, collectionName);
    
    let q;
    if (zoneId && !isHQGroup(zoneId)) {
      q = query(
        mediaRef, 
        where('zoneId', '==', zoneId),
        where('type', '==', type)
      );
    } else {
      q = query(
        mediaRef, 
        where('type', '==', type)
      );
    }
    
    const snapshot = await getDocs(q);
    
    const files = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      };
    }) as CloudinaryMediaFile[];
    
    // Sort by createdAt in JavaScript
    files.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    console.log(`✅ [CloudinaryMedia] Found ${files.length} ${type} files`);
    return files;
  } catch (error) {
    console.error(`❌ [CloudinaryMedia] Error getting ${type} files:`, error);
    return [];
  }
}

/**
 * Get media files by folder
 */
export async function getCloudinaryMediaByFolder(folder: string, zoneId?: string): Promise<CloudinaryMediaFile[]> {
  try {
    console.log(`📖 [CloudinaryMedia] Getting files from folder: ${folder} for zone:`, zoneId);
    
    const collectionName = getCollectionName(zoneId);
    const mediaRef = collection(db, collectionName);
    
    let q;
    if (zoneId && !isHQGroup(zoneId)) {
      q = query(
        mediaRef, 
        where('zoneId', '==', zoneId),
        where('folder', '==', folder)
      );
    } else {
      q = query(
        mediaRef, 
        where('folder', '==', folder)
      );
    }
    
    const snapshot = await getDocs(q);
    
    const files = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      };
    }) as CloudinaryMediaFile[];
    
    // Sort by createdAt in JavaScript
    files.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    console.log(`✅ [CloudinaryMedia] Found ${files.length} files in folder: ${folder}`);
    return files;
  } catch (error) {
    console.error(`❌ [CloudinaryMedia] Error getting files from folder:`, error);
    return [];
  }
}

/**
 * Get single media file by ID
 */
export async function getCloudinaryMediaById(id: string, zoneId?: string): Promise<CloudinaryMediaFile | null> {
  try {
    console.log('📖 [CloudinaryMedia] Getting media file:', id, 'for zone:', zoneId);
    
    const collectionName = getCollectionName(zoneId);
    const mediaRef = doc(db, collectionName, id);
    const mediaDoc = await getDoc(mediaRef);
    
    if (!mediaDoc.exists()) {
      console.log('⚠️ [CloudinaryMedia] Media file not found:', id, 'in', collectionName);
      return null;
    }
    
    const data = mediaDoc.data();
    const file = {
      ...data,
      id: mediaDoc.id,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
    } as CloudinaryMediaFile;
    
    console.log('✅ [CloudinaryMedia] Found media file:', file.name);
    return file;
  } catch (error) {
    console.error('❌ [CloudinaryMedia] Error getting media file:', error);
    return null;
  }
}

/**
 * Create new media file record
 */
export async function createCloudinaryMedia(
  fileData: Omit<CloudinaryMediaFile, 'id' | 'createdAt' | 'updatedAt'>,
  zoneId?: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    console.log('➕ [CloudinaryMedia] Creating media file:', fileData.name, 'for zone:', zoneId);
    
    const collectionName = getCollectionName(zoneId);
    
    const cleanData = {
      name: fileData.name,
      url: fileData.url,
      publicId: fileData.publicId,
      resourceType: fileData.resourceType,
      type: fileData.type,
      size: fileData.size,
      folder: fileData.folder,
      format: fileData.format || '',
      width: fileData.width || 0,
      height: fileData.height || 0,
      duration: fileData.duration || 0,
      zoneId: zoneId || '', // Add zoneId for regular zones
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const mediaRef = collection(db, collectionName);
    const docRef = await addDoc(mediaRef, cleanData);
    
    console.log('✅ [CloudinaryMedia] Media file created with ID:', docRef.id, 'in', collectionName);
    
    return {
      success: true,
      id: docRef.id
    };
  } catch (error) {
    console.error('❌ [CloudinaryMedia] Error creating media file:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create media file'
    };
  }
}

/**
 * Update media file record
 */
export async function updateCloudinaryMedia(
  id: string,
  fileData: Partial<Omit<CloudinaryMediaFile, 'id' | 'createdAt' | 'updatedAt'>>,
  zoneId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🔄 [CloudinaryMedia] Updating media file:', id, 'for zone:', zoneId);
    
    const collectionName = getCollectionName(zoneId);
    const mediaRef = doc(db, collectionName, id);
    const mediaDoc = await getDoc(mediaRef);
    
    if (!mediaDoc.exists()) {
      console.error('❌ [CloudinaryMedia] Media file not found:', id, 'in', collectionName);
      return {
        success: false,
        error: 'Media file not found'
      };
    }
    
    // Remove undefined values
    const cleanedData = Object.entries(fileData).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as any);
    
    const updateData = {
      ...cleanedData,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(mediaRef, updateData);
    
    console.log('✅ [CloudinaryMedia] Media file updated successfully in', collectionName);
    
    return {
      success: true
    };
  } catch (error) {
    console.error('❌ [CloudinaryMedia] Error updating media file:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update media file'
    };
  }
}

/**
 * Delete media file record
 */
export async function deleteCloudinaryMedia(id: string, zoneId?: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🗑️ [CloudinaryMedia] Deleting media file:', id, 'zone:', zoneId);
    
    const collectionName = getCollectionName(zoneId);
    const mediaRef = doc(db, collectionName, id);
    const mediaDoc = await getDoc(mediaRef);
    
    if (!mediaDoc.exists()) {
      console.error('❌ [CloudinaryMedia] Media file not found:', id, 'in', collectionName);
      return {
        success: false,
        error: 'Media file not found'
      };
    }
    
    await deleteDoc(mediaRef);
    
    console.log('✅ [CloudinaryMedia] Media file deleted successfully from', collectionName);
    
    return {
      success: true
    };
  } catch (error) {
    console.error('❌ [CloudinaryMedia] Error deleting media file:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete media file'
    };
  }
}

/**
 * Search media files by name
 */
export async function searchCloudinaryMedia(searchTerm: string, zoneId?: string): Promise<CloudinaryMediaFile[]> {
  try {
    console.log('🔍 [CloudinaryMedia] Searching for:', searchTerm, 'in zone:', zoneId);
    
    // Get all files and filter client-side (Firestore doesn't support full-text search)
    const allFiles = await getAllCloudinaryMedia(zoneId);
    
    const searchLower = searchTerm.toLowerCase();
    const results = allFiles.filter(file => 
      file.name.toLowerCase().includes(searchLower)
    );
    
    console.log(`✅ [CloudinaryMedia] Found ${results.length} results for: ${searchTerm}`);
    return results;
  } catch (error) {
    console.error('❌ [CloudinaryMedia] Error searching media files:', error);
    return [];
  }
}

/**
 * Get storage statistics
 */
export async function getCloudinaryMediaStats(zoneId?: string): Promise<{
  totalFiles: number;
  totalSize: number;
  byType: Record<string, number>;
  byFolder: Record<string, number>;
}> {
  try {
    console.log('📊 [CloudinaryMedia] Getting storage statistics for zone:', zoneId);
    
    const allFiles = await getAllCloudinaryMedia(zoneId);
    
    const stats = {
      totalFiles: allFiles.length,
      totalSize: allFiles.reduce((sum, file) => sum + file.size, 0),
      byType: {} as Record<string, number>,
      byFolder: {} as Record<string, number>
    };
    
    allFiles.forEach(file => {
      // Count by type
      stats.byType[file.type] = (stats.byType[file.type] || 0) + 1;
      
      // Count by folder
      stats.byFolder[file.folder] = (stats.byFolder[file.folder] || 0) + 1;
    });
    
    console.log('✅ [CloudinaryMedia] Statistics:', stats);
    return stats;
  } catch (error) {
    console.error('❌ [CloudinaryMedia] Error getting statistics:', error);
    return {
      totalFiles: 0,
      totalSize: 0,
      byType: {},
      byFolder: {}
    };
  }
}

