/**
 * CLOUDINARY MEDIA SERVICE
 * 
 * Manages media files stored in Cloudinary
 * Saves metadata to Firebase: cloudinary_media collection
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

const COLLECTION_NAME = 'cloudinary_media';

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
  createdAt: string;
  updatedAt: string;
}

/**
 * Get all media files
 */
export async function getAllCloudinaryMedia(): Promise<CloudinaryMediaFile[]> {
  try {
    console.log('📖 [CloudinaryMedia] Getting all media files...');
    
    const mediaRef = collection(db, COLLECTION_NAME);
    const q = query(mediaRef, orderBy('createdAt', 'desc'));
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
    
    console.log(`✅ [CloudinaryMedia] Found ${files.length} media files`);
    return files;
  } catch (error) {
    console.error('❌ [CloudinaryMedia] Error getting media files:', error);
    return [];
  }
}

/**
 * Get media files by type
 */
export async function getCloudinaryMediaByType(type: 'image' | 'audio' | 'video' | 'document'): Promise<CloudinaryMediaFile[]> {
  try {
    console.log(`📖 [CloudinaryMedia] Getting ${type} files...`);
    
    const mediaRef = collection(db, COLLECTION_NAME);
    const q = query(
      mediaRef, 
      where('type', '==', type),
      orderBy('createdAt', 'desc')
    );
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
export async function getCloudinaryMediaByFolder(folder: string): Promise<CloudinaryMediaFile[]> {
  try {
    console.log(`📖 [CloudinaryMedia] Getting files from folder: ${folder}`);
    
    const mediaRef = collection(db, COLLECTION_NAME);
    const q = query(
      mediaRef, 
      where('folder', '==', folder),
      orderBy('createdAt', 'desc')
    );
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
export async function getCloudinaryMediaById(id: string): Promise<CloudinaryMediaFile | null> {
  try {
    console.log('📖 [CloudinaryMedia] Getting media file:', id);
    
    const mediaRef = doc(db, COLLECTION_NAME, id);
    const mediaDoc = await getDoc(mediaRef);
    
    if (!mediaDoc.exists()) {
      console.log('⚠️ [CloudinaryMedia] Media file not found:', id);
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
  fileData: Omit<CloudinaryMediaFile, 'id' | 'createdAt' | 'updatedAt'>
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    console.log('➕ [CloudinaryMedia] Creating media file:', fileData.name);
    
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
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const mediaRef = collection(db, COLLECTION_NAME);
    const docRef = await addDoc(mediaRef, cleanData);
    
    console.log('✅ [CloudinaryMedia] Media file created with ID:', docRef.id);
    
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
  fileData: Partial<Omit<CloudinaryMediaFile, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🔄 [CloudinaryMedia] Updating media file:', id);
    
    const mediaRef = doc(db, COLLECTION_NAME, id);
    const mediaDoc = await getDoc(mediaRef);
    
    if (!mediaDoc.exists()) {
      console.error('❌ [CloudinaryMedia] Media file not found:', id);
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
    
    console.log('✅ [CloudinaryMedia] Media file updated successfully');
    
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
export async function deleteCloudinaryMedia(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('🗑️ [CloudinaryMedia] Deleting media file:', id);
    
    const mediaRef = doc(db, COLLECTION_NAME, id);
    const mediaDoc = await getDoc(mediaRef);
    
    if (!mediaDoc.exists()) {
      console.error('❌ [CloudinaryMedia] Media file not found:', id);
      return {
        success: false,
        error: 'Media file not found'
      };
    }
    
    await deleteDoc(mediaRef);
    
    console.log('✅ [CloudinaryMedia] Media file deleted successfully');
    
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
export async function searchCloudinaryMedia(searchTerm: string): Promise<CloudinaryMediaFile[]> {
  try {
    console.log('🔍 [CloudinaryMedia] Searching for:', searchTerm);
    
    // Get all files and filter client-side (Firestore doesn't support full-text search)
    const allFiles = await getAllCloudinaryMedia();
    
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
export async function getCloudinaryMediaStats(): Promise<{
  totalFiles: number;
  totalSize: number;
  byType: Record<string, number>;
  byFolder: Record<string, number>;
}> {
  try {
    console.log('📊 [CloudinaryMedia] Getting storage statistics...');
    
    const allFiles = await getAllCloudinaryMedia();
    
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

