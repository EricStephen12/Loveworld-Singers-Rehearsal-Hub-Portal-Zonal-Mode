/**
 * CLOUDINARY STORAGE SERVICE
 * 
 * Replaces Supabase Storage with Cloudinary
 * FREE: 25GB Storage + 25GB Bandwidth
 */

export const cloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
  apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '',
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'loveworld-singers'
};

interface UploadResult {
  url: string;
  path: string;
  publicId: string;
  resourceType: string;
}

/**
 * Upload file to Cloudinary with progress tracking
 */
export async function uploadToCloudinary(
  file: File,
  onProgress?: (progress: number) => void
): Promise<UploadResult | null> {
  try {
    console.log('📤 [Cloudinary] Uploading:', file.name);

    // Determine resource type
    const fileType = file.type.split('/')[0];
    let resourceType: 'image' | 'video' | 'raw' = 'raw';
    
    if (fileType === 'image') resourceType = 'image';
    else if (fileType === 'video') resourceType = 'video';
    else if (file.type.includes('audio')) resourceType = 'video'; // Cloudinary uses 'video' for audio

    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);
    formData.append('resource_type', resourceType);
    
    // Add folder based on file type
    const folder = getFolder(file.type);
    if (folder) {
      formData.append('folder', folder);
    }

    // Simulate progress for better UX
    if (onProgress) {
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 90) progress = 90;
        onProgress(Math.min(progress, 90));
      }, 200);

      try {
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/${resourceType}/upload`,
          {
            method: 'POST',
            body: formData
          }
        );

        clearInterval(progressInterval);
        onProgress(100);

        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }

        const data = await response.json();
        
        console.log('✅ [Cloudinary] Uploaded successfully:', data.secure_url);

        return {
          url: data.secure_url,
          path: data.public_id,
          publicId: data.public_id,
          resourceType: data.resource_type
        };
      } catch (error) {
        clearInterval(progressInterval);
        throw error;
      }
    } else {
      // No progress callback
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/${resourceType}/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log('✅ [Cloudinary] Uploaded successfully:', data.secure_url);

      return {
        url: data.secure_url,
        path: data.public_id,
        publicId: data.public_id,
        resourceType: data.resource_type
      };
    }
  } catch (error) {
    console.error('❌ [Cloudinary] Upload error:', error);
    return null;
  }
}

/**
 * Delete file from Cloudinary
 */
export async function deleteFromCloudinary(publicId: string, resourceType: string = 'image'): Promise<boolean> {
  try {
    console.log('🗑️ [Cloudinary] Deleting:', publicId);

    // Note: Deletion requires server-side API call with API secret
    // For now, we'll use the API route
    const response = await fetch('/api/cloudinary/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ publicId, resourceType })
    });

    if (!response.ok) {
      throw new Error(`Delete failed: ${response.statusText}`);
    }

    console.log('✅ [Cloudinary] Deleted successfully');
    return true;
  } catch (error) {
    console.error('❌ [Cloudinary] Delete error:', error);
    return false;
  }
}

/**
 * Get optimized image URL
 */
export function getOptimizedImageUrl(url: string, width: number = 800, quality: number = 80): string {
  if (!url || !url.includes('cloudinary')) return url;
  
  const parts = url.split('/upload/');
  if (parts.length === 2) {
    return `${parts[0]}/upload/w_${width},q_${quality},f_auto/${parts[1]}`;
  }
  return url;
}

/**
 * Get audio streaming URL
 */
export function getAudioStreamUrl(url: string): string {
  if (!url || !url.includes('cloudinary')) return url;
  
  const parts = url.split('/upload/');
  if (parts.length === 2) {
    return `${parts[0]}/upload/q_auto,fl_streaming_attachment/${parts[1]}`;
  }
  return url;
}

/**
 * Get video streaming URL
 */
export function getVideoStreamUrl(url: string, quality: string = 'auto'): string {
  if (!url || !url.includes('cloudinary')) return url;
  
  const parts = url.split('/upload/');
  if (parts.length === 2) {
    return `${parts[0]}/upload/q_${quality},f_auto/${parts[1]}`;
  }
  return url;
}

/**
 * Get thumbnail URL for video/audio
 */
export function getThumbnailUrl(url: string, width: number = 300): string {
  if (!url || !url.includes('cloudinary')) return url;
  
  const parts = url.split('/upload/');
  if (parts.length === 2) {
    // For video/audio, get a thumbnail
    return `${parts[0]}/upload/w_${width},h_${width},c_fill,f_jpg/${parts[1].replace(/\.[^.]+$/, '.jpg')}`;
  }
  return url;
}

/**
 * Helper: Get folder based on file type
 */
function getFolder(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'loveworld-singers/images';
  if (mimeType.startsWith('audio/')) return 'loveworld-singers/audio';
  if (mimeType.startsWith('video/')) return 'loveworld-singers/videos';
  return 'loveworld-singers/documents';
}

/**
 * Helper: Get file type from MIME type
 */
export function getFileType(mimeType: string): 'image' | 'audio' | 'video' | 'document' {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.startsWith('video/')) return 'video';
  return 'document';
}

/**
 * Upload audio file (convenience function)
 */
export async function uploadAudioToCloudinary(
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ url: string; path: string } | null> {
  const result = await uploadToCloudinary(file, onProgress);
  if (!result) return null;
  
  return {
    url: result.url,
    path: result.publicId
  };
}

/**
 * Upload image file (convenience function)
 */
export async function uploadImageToCloudinary(
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ url: string; path: string } | null> {
  const result = await uploadToCloudinary(file, onProgress);
  if (!result) return null;
  
  return {
    url: result.url,
    path: result.publicId
  };
}

/**
 * Delete audio from Cloudinary (convenience function)
 */
export async function deleteAudioFromCloudinary(publicId: string): Promise<boolean> {
  return deleteFromCloudinary(publicId, 'video'); // Cloudinary uses 'video' for audio
}

/**
 * Delete image from Cloudinary (convenience function)
 */
export async function deleteImageFromCloudinary(publicId: string): Promise<boolean> {
  return deleteFromCloudinary(publicId, 'image');
}

