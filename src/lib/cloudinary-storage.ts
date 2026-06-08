import { BackendAPI } from './api-client';

const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || '').replace(/\/+$/, '');

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'loveworld-singers';

export async function uploadToCloudinary(file: File, onProgress?: (progress: number) => void, folder: string = 'general'): Promise<string> {
  try {
    // 1. Get Signature from Backend
    const timestamp = Math.round(new Date().getTime() / 1000);
    const sigResponse = await BackendAPI.media.getSignature(folder, timestamp);
    const { signature } = sigResponse;

    // 2. Prepare Form Data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    formData.append('signature', signature);
    formData.append('timestamp', timestamp.toString());
    formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '');

    // 3. Perform Upload
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error('Cloudinary Upload Failed');

    const data = await response.json();
    if (onProgress) onProgress(100);
    
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary Error:', error);
    throw error;
  }
}

export const uploadImageToCloudinary = async (file: File, onProgress?: (p: number) => void) => 
  uploadToCloudinary(file, onProgress, 'profile_pictures');

export const uploadAudioToCloudinary = async (file: File, onProgress?: (p: number) => void) => 
  uploadToCloudinary(file, onProgress, 'song_audio');

export const deleteFromCloudinary = async (publicId: string, _resourceType?: string): Promise<boolean> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/media/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicId })
    });
    return response.ok;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
};

export const getFileType = (fileNameOrMime: string): 'image' | 'audio' | 'video' | 'document' => {
  if (!fileNameOrMime) return 'document';
  const str = fileNameOrMime.toLowerCase();
  
  // Check MIME types first
  if (str.startsWith('image/')) return 'image';
  if (str.startsWith('audio/')) return 'audio';
  if (str.startsWith('video/')) return 'video';

  // Check extensions
  const extension = str.split('.').pop() || '';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(extension)) return 'image';
  if (['mp3', 'wav', 'm4a', 'aac', 'ogg', 'flac', 'wma', 'm4r', 'amr'].includes(extension)) return 'audio';
  if (['mp4', 'mov', 'avi', 'wmv', 'flv', 'mkv', 'webm'].includes(extension)) return 'video';
  
  return 'document';
};
