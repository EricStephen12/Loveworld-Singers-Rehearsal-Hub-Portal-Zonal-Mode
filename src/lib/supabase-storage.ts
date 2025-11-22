import { supabase } from './supabase-client';

// Upload audio file to Supabase Storage with progress tracking
export async function uploadAudioToSupabase(
  file: File, 
  onProgress?: (progress: number) => void
): Promise<{ url: string; path: string } | null> {
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `audio/${fileName}`;

    console.log('📤 Uploading to Supabase Storage:', fileName);

    // Create a custom upload with progress tracking
    const uploadPromise = supabase.storage
      .from('media-files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    // Simulate progress for better UX (Supabase doesn't provide real progress)
    if (onProgress) {
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 90) progress = 90;
        onProgress(Math.min(progress, 90));
      }, 200);

      try {
        const { data, error } = await uploadPromise;
        clearInterval(progressInterval);
        onProgress(100);

        if (error) {
          console.error('❌ Supabase upload error:', error);
          throw error;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('media-files')
          .getPublicUrl(filePath);

        console.log('✅ Uploaded successfully:', publicUrl);

        return {
          url: publicUrl,
          path: filePath
        };
      } catch (error) {
        clearInterval(progressInterval);
        throw error;
      }
    } else {
      // No progress callback, just upload
      const { data, error } = await uploadPromise;

      if (error) {
        console.error('❌ Supabase upload error:', error);
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('media-files')
        .getPublicUrl(filePath);

      console.log('✅ Uploaded successfully:', publicUrl);

      return {
        url: publicUrl,
        path: filePath
      };
    }
  } catch (error) {
    console.error('❌ Error uploading to Supabase:', error);
    return null;
  }
}

// Delete audio file from Supabase Storage
export async function deleteAudioFromSupabase(filePath: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from('media-files')
      .remove([filePath]);

    if (error) {
      console.error('❌ Supabase delete error:', error);
      return false;
    }

    console.log('✅ Deleted from Supabase Storage:', filePath);
    return true;
  } catch (error) {
    console.error('❌ Error deleting from Supabase:', error);
    return false;
  }
}

// Get audio file info from Supabase Storage
export async function getAudioInfo(filePath: string) {
  try {
    const { data, error } = await supabase.storage
      .from('media-files')
      .list('audio', {
        search: filePath.split('/').pop()
      });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('❌ Error getting audio info:', error);
    return null;
  }
}