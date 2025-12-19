"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Image,
  Music,
  File,
  Trash2,
  Download,
  Search,
  Filter,
  Grid,
  List,
  Plus,
  Folder,
  FolderOpen,
  X,
  Play,
  Pause,
  Check,
  CheckCircle,
  RefreshCw,
  Settings
} from 'lucide-react';
import { uploadToCloudinary, deleteFromCloudinary, getFileType } from '@/lib/cloudinary-storage';
import {
  getAllCloudinaryMedia,
  createCloudinaryMedia,
  deleteCloudinaryMedia,
  loadMoreCloudinaryMedia,
  hasMoreCloudinaryMedia,
  getCloudinaryMediaByType,
  CloudinaryMediaFile
} from '@/lib/cloudinary-media-service';
import { useZone } from '@/hooks/useZone';
import { Toast } from './Toast';
import { runMediaDiagnostics, printDiagnostics, DiagnosticResult } from '@/utils/media-diagnostics';


interface MediaFile {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'audio' | 'video' | 'document';
  size: number;
  uploadedAt: string;
  folder?: string;
  storagePath?: string; // Path in Supabase Storage
}

interface MediaManagerProps {
  onSelectFile?: (file: MediaFile) => void;
  onClose?: () => void;
  filterType?: 'all' | 'image' | 'audio' | 'video' | 'document';
  selectionMode?: boolean;
  allowedTypes?: ('image' | 'audio' | 'video' | 'document')[];
}

export default function MediaManager({ 
  onSelectFile, 
  onClose, 
  filterType = 'all',
  selectionMode = false,
  allowedTypes = ['image', 'audio', 'video', 'document']
}: MediaManagerProps) {
  const { currentZone } = useZone();
  
  // Import admin theme if available, fallback to default colors
  let theme;
  try {
    const { useAdminTheme } = require('./admin/AdminThemeProvider');
    theme = useAdminTheme().theme;
  } catch {
    // Fallback theme for when not in admin context
    theme = {
      primary: 'bg-purple-600',
      primaryHover: 'hover:bg-purple-700',
      primaryLight: 'bg-purple-100',
      text: 'text-purple-600',
      border: 'border-purple-200'
    };
  }
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFile, setUploadingFile] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedType, setSelectedType] = useState<'all' | 'image' | 'audio' | 'video' | 'document'>(filterType);
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [dragOver, setDragOver] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [runningDiagnostics, setRunningDiagnostics] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Load files from database with optimized caching
  useEffect(() => {
    if (currentZone) {
      console.log('🔄 MediaManager: Loading media for zone:', currentZone.id);
      loadFilesFromDatabase();
    }
  }, [currentZone?.id]); // Reload when zone changes

  const loadFilesFromDatabase = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      console.log('🚀 [Cloudinary] Loading media files from Firebase...');
      const startTime = performance.now();

      let mediaFiles: CloudinaryMediaFile[] = [];

      // If in selection mode with specific type filter, query by type directly
      // This ensures we get ALL files of that type, not just the first 50 mixed files
      if (selectionMode && allowedTypes.length === 1) {
        const targetType = allowedTypes[0];
        console.log(`🎯 [Cloudinary] Selection mode: Loading all ${targetType} files directly`);
        mediaFiles = await getCloudinaryMediaByType(targetType, currentZone?.id);
        setHasMore(false); // Type-specific query returns all, no pagination needed
      } else {
        // Load from zone-aware collection with limit (normal mode)
        mediaFiles = await getAllCloudinaryMedia(currentZone?.id, 50);
        setHasMore(hasMoreCloudinaryMedia(currentZone?.id));
      }

      const loadTime = performance.now() - startTime;
      console.log(`⚡ [Cloudinary] Media loaded in ${loadTime.toFixed(2)}ms`);
      console.log(`📊 [Cloudinary] Total media files: ${mediaFiles.length}`);

      // Show success message for slow loads
      if (loadTime > 1000 && showLoading) {
        addToast({
          type: 'info',
          message: `Loaded ${mediaFiles.length} files in ${(loadTime/1000).toFixed(1)}s`
        });
      }

      // Convert to component format
      const convertedFiles: MediaFile[] = mediaFiles.map(dbFile => ({
        id: dbFile.id,
        name: dbFile.name,
        url: dbFile.url,
        type: dbFile.type,
        size: dbFile.size,
        folder: dbFile.folder || 'uncategorized',
        uploadedAt: dbFile.createdAt,
        storagePath: dbFile.publicId, // Store Cloudinary publicId
        createdAt: new Date(dbFile.createdAt),
        updatedAt: new Date(dbFile.updatedAt)
      }));

      // Debug: Log file types breakdown
      const typeBreakdown = convertedFiles.reduce((acc, f) => {
        acc[f.type] = (acc[f.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      console.log('📊 [MediaManager] Files by type:', typeBreakdown);

      setFiles(convertedFiles);

      if (showLoading && convertedFiles.length === 0) {
        addToast({
          type: 'info',
          message: 'No media files found. Upload some files to get started!'
        });
      }
    } catch (error) {
      console.error('❌ [Cloudinary] Error loading media files:', error);
      addToast({
        type: 'error',
        message: `Failed to load media: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setLoading(false);
    }
  };

  // Load more media files
  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    try {
      const moreFiles = await loadMoreCloudinaryMedia(currentZone?.id, 50);
      
      if (moreFiles.length > 0) {
        const convertedFiles: MediaFile[] = moreFiles.map(dbFile => ({
          id: dbFile.id,
          name: dbFile.name,
          url: dbFile.url,
          type: dbFile.type,
          size: dbFile.size,
          folder: dbFile.folder || 'uncategorized',
          uploadedAt: dbFile.createdAt,
          storagePath: dbFile.publicId,
          createdAt: new Date(dbFile.createdAt),
          updatedAt: new Date(dbFile.updatedAt)
        }));
        
        setFiles(prev => [...prev, ...convertedFiles]);
      }
      
      setHasMore(hasMoreCloudinaryMedia(currentZone?.id));
    } catch (error) {
      console.error('❌ Error loading more media:', error);
      addToast({
        type: 'error',
        message: 'Failed to load more files'
      });
    } finally {
      setIsLoadingMore(false);
    }
  };

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts(prev => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="w-6 h-6" />;
      case 'audio': return <Music className="w-6 h-6" />;
      case 'video': return <File className="w-6 h-6" />;
      default: return <File className="w-6 h-6" />;
    }
  };

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case 'image': return 'text-green-600 bg-green-100';
      case 'audio': return `${theme.text} ${theme.primaryLight}`;
      case 'video': return `${theme.text} ${theme.primaryLight}`;
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleFileUpload = async (fileList: FileList) => {
    if (!fileList || fileList.length === 0) {
      addToast({
        type: 'error',
        message: 'No files selected'
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    let successCount = 0;
    let failCount = 0;

    try {
      console.log(`📤 Starting upload of ${fileList.length} file(s)...`);

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        setUploadingFile(file.name);
        console.log(`📤 Uploading file ${i + 1}/${fileList.length}: ${file.name} (${formatFileSize(file.size)})`);

        // Determine file type
        const fileType = getFileType(file.type);

        try {
          // Upload to Cloudinary with progress tracking
          console.log(`📤 [Cloudinary] Uploading to Cloudinary...`);
          const uploadResult = await uploadToCloudinary(file, (progress) => {
            setUploadProgress(progress);
          });

          if (uploadResult) {
            console.log(`✅ [Cloudinary] File uploaded: ${uploadResult.url}`);

            // Save to zone-aware collection
            const result = await createCloudinaryMedia({
              name: file.name,
              url: uploadResult.url,
              publicId: uploadResult.publicId,
              resourceType: uploadResult.resourceType as 'image' | 'video' | 'raw',
              type: fileType,
              size: file.size,
              folder: fileType,
              format: file.name.split('.').pop() || ''
            }, currentZone?.id);

            if (result.success) {
              console.log(`✅ [Cloudinary] File saved to Firebase with ID: ${result.id}`);
              successCount++;

              addToast({
                type: 'success',
                message: `✅ "${file.name}" uploaded successfully!`
              });
            } else {
              console.error(`❌ [Cloudinary] Failed to save "${file.name}" to Firebase:`, result.error);
              failCount++;
              addToast({
                type: 'error',
                message: `❌ Failed to save "${file.name}" to database`
              });
            }
          } else {
            console.error(`❌ Failed to upload "${file.name}" to storage`);
            failCount++;
            addToast({
              type: 'error',
              message: `❌ Failed to upload "${file.name}" to storage`
            });
          }
        } catch (fileError) {
          console.error(`❌ Error uploading "${file.name}":`, fileError);
          failCount++;
          addToast({
            type: 'error',
            message: `❌ Error uploading "${file.name}": ${fileError instanceof Error ? fileError.message : 'Unknown error'}`
          });
        }
      }

      // Refresh local data to show new files
      if (successCount > 0) {
        await loadFilesFromDatabase(false);
      }

      // Show summary
      if (successCount > 0 && failCount === 0) {
        addToast({
          type: 'success',
          message: `🎉 All ${successCount} file(s) uploaded successfully!`
        });
      } else if (successCount > 0 && failCount > 0) {
        addToast({
          type: 'warning',
          message: `⚠️ ${successCount} succeeded, ${failCount} failed`
        });
      } else if (failCount > 0) {
        addToast({
          type: 'error',
          message: `❌ All ${failCount} file(s) failed to upload`
        });
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      addToast({
        type: 'error',
        message: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setUploadingFile(null);
    }
  };

  const handleFileSelect = (file: MediaFile) => {
    if (selectionMode) {
      setSelectedFile(file);
    }
  };

  const handleConfirmSelection = () => {
    if (selectedFile && onSelectFile && selectionMode) {
      onSelectFile(selectedFile);
      if (onClose) {
        onClose();
      }
    }
  };

  const handleFileDelete = async (file: MediaFile) => {
    if (confirm(`Are you sure you want to delete "${file.name}"?`)) {
      try {
        // Delete from Firebase first
        console.log(`🗑️ [Cloudinary] Deleting from Firebase: ${file.id}`);
        const dbDeleteResult = await deleteCloudinaryMedia(file.id, currentZone?.id);

        if (dbDeleteResult.success) {
          // Delete from Cloudinary using stored publicId
          let cloudinaryDeleteSuccess = true;
          if (file.storagePath) {
            console.log(`🗑️ [Cloudinary] Deleting file with publicId: ${file.storagePath}`);

            // Determine resource type
            let resourceType = 'image';
            if (file.type === 'audio') resourceType = 'video'; // Cloudinary uses 'video' for audio
            else if (file.type === 'video') resourceType = 'video';
            else if (file.type === 'document') resourceType = 'raw';

            cloudinaryDeleteSuccess = await deleteFromCloudinary(file.storagePath, resourceType);
          } else {
            console.log('⚠️ No storagePath found for file, skipping Cloudinary deletion');
          }

          if (cloudinaryDeleteSuccess) {
            // Refresh local data to remove deleted file
            await loadFilesFromDatabase();
            addToast({
              type: 'success',
              message: `File "${file.name}" deleted successfully!`
            });
          } else {
            // If Cloudinary deletion fails, we should still remove from UI since DB is updated
            await loadFilesFromDatabase();
            addToast({
              type: 'warning',
              message: `File "${file.name}" removed from database but may still exist in cloud storage.`
            });
          }
        } else {
          addToast({
            type: 'error',
            message: `Failed to delete "${file.name}" from database`
          });
        }
      } catch (error) {
        console.error('Delete error:', error);
        addToast({
          type: 'error',
          message: 'Delete failed. Please try again.'
        });
      }
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    addToast({
      type: 'success',
      message: 'URL copied to clipboard!'
    });
  };

  const handleRunDiagnostics = async () => {
    setRunningDiagnostics(true);
    addToast({
      type: 'info',
      message: 'Running diagnostics... Check console for results'
    });

    try {
      const results = await runMediaDiagnostics();
      printDiagnostics(results);

      const failed = results.filter((r: DiagnosticResult) => r.status === 'fail').length;
      const warnings = results.filter((r: DiagnosticResult) => r.status === 'warning').length;

      if (failed > 0) {
        addToast({
          type: 'error',
          message: `Diagnostics complete: ${failed} test(s) failed. Check console for details.`
        });
      } else if (warnings > 0) {
        addToast({
          type: 'warning',
          message: `Diagnostics complete: ${warnings} warning(s). Check console for details.`
        });
      } else {
        addToast({
          type: 'success',
          message: 'All diagnostics passed! ✅'
        });
      }
    } catch (error) {
      console.error('Diagnostics error:', error);
      addToast({
        type: 'error',
        message: 'Failed to run diagnostics'
      });
    } finally {
      setRunningDiagnostics(false);
    }
  };

  const handleAudioPlay = async (file: MediaFile) => {
    if (playingAudioId === file.id) {
      // Pause current audio
      if (audioRef.current) {
        audioRef.current.pause();
        setPlayingAudioId(null);
      }
    } else {
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      // Play new audio
      if (audioRef.current) {
        try {
          console.log('🎵 Attempting to play audio:', file.url);

          // Set crossOrigin to handle CORS
          audioRef.current.crossOrigin = 'anonymous';
          audioRef.current.src = file.url;

          // Load the audio first
          audioRef.current.load();

          // Wait for it to be ready
          await audioRef.current.play();
          setPlayingAudioId(file.id);

          console.log('✅ Audio playing successfully');
          addToast({
            type: 'success',
            message: `Playing: ${file.name}`
          });
        } catch (error) {
          console.error('❌ Error playing audio:', error);
          addToast({
            type: 'error',
            message: `Failed to play audio: ${error instanceof Error ? error.message : 'Unknown error'}`
          });
        }
      }
    }
  };

  // Handle audio ended
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handleEnded = () => {
        setPlayingAudioId(null);
      };
      
      audio.addEventListener('ended', handleEnded);
      return () => audio.removeEventListener('ended', handleEnded);
    }
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || file.type === selectedType;
    const matchesFolder = selectedFolder === 'all' || file.folder === selectedFolder;
    const matchesAllowedTypes = allowedTypes.includes(file.type);
    
    // In selection mode with specific allowedTypes, prioritize allowedTypes filter
    // and ignore the selectedType dropdown filter
    if (selectionMode && allowedTypes.length < 4) {
      return matchesSearch && matchesFolder && matchesAllowedTypes;
    }
    
    return matchesSearch && matchesType && matchesFolder && matchesAllowedTypes;
  });

  const folders = ['all', ...Array.from(new Set(files.map(f => f.folder).filter(Boolean)))];

  return (
    <div className="h-full w-full flex flex-col bg-white relative overflow-hidden">
      {/* Loading Skeleton */}
      {loading && files.length === 0 && (
        <div className="absolute inset-0 bg-white z-50 flex flex-col">
          {/* Header Skeleton */}
          <div className="flex-shrink-0 p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>

          {/* Filters Skeleton */}
          <div className="flex-shrink-0 p-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-8 w-20 bg-gray-200 rounded-full animate-pulse"></div>
              ))}
            </div>
          </div>

          {/* Grid Skeleton */}
          <div className="flex-1 overflow-auto p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="aspect-square bg-gray-200 animate-pulse"></div>
                  <div className="p-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex-shrink-0 p-3 sm:p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
              {selectionMode ? 'Select Media' : 'Media Library'}
            </h2>
            {selectionMode && selectedFile && (
              <div className="mt-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-gray-600 truncate">
                  Selected: <span className="font-medium">{selectedFile.name}</span>
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {!selectionMode && (
              <>

                <button
                  onClick={() => loadFilesFromDatabase(true)}
                  disabled={loading}
                  className={`flex items-center gap-2 px-3 py-2 ${theme.primary} text-white rounded-lg ${theme.primaryHover} transition-colors font-medium disabled:opacity-50`}
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </>
            )}
            {selectionMode && selectedFile && (
              <button
                onClick={handleConfirmSelection}
                className={`px-3 sm:px-4 py-2 ${theme.primary} text-white rounded-lg ${theme.primaryHover} transition-colors font-medium text-sm sm:text-base`}
              >
                Select
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-2 sm:gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="flex-1 px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Types</option>
              <option value="image">Images</option>
              <option value="audio">Audio</option>
              <option value="video">Videos</option>
              <option value="document">Documents</option>
            </select>
            
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="flex-1 px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {folders.map(folder => (
                <option key={folder} value={folder}>
                  {folder === 'all' ? 'All Folders' : folder}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div className="flex-shrink-0 p-3 sm:p-4 border-b border-gray-200 bg-gray-50">
        <div
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center transition-colors ${
            dragOver 
              ? `${theme.border} ${theme.primaryLight}` 
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <Upload className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm sm:text-base text-gray-600 mb-2">
            <span className="hidden sm:inline">Drag and drop files here, or </span>
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`${theme.text} hover:opacity-80 font-medium`}
            >
              <span className="sm:hidden">Tap to </span>browse files
            </button>
          </p>
          <p className="text-xs sm:text-sm text-gray-500">
            Supports {allowedTypes.join(', ')}
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={allowedTypes.map(type => {
              switch(type) {
                case 'image': return 'image/*';
                case 'audio': return 'audio/*';
                case 'video': return 'video/*';
                case 'document': return '.pdf,.doc,.docx,.txt';
                default: return '';
              }
            }).join(',')}
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            className="hidden"
          />
        </div>
      </div>

      {/* View Controls */}
      <div className="flex-shrink-0 px-3 sm:px-4 py-2 sm:py-3 border-b border-gray-200 flex items-center justify-between bg-white">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid' ? `${theme.primaryLight} ${theme.text}` : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list' ? `${theme.primaryLight} ${theme.text}` : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
        
        <p className="text-xs sm:text-sm text-gray-500">
          {filteredFiles.length} file{filteredFiles.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Files Grid/List - Scrollable Area */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3 sm:p-6">
        {uploading && (
          <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-blue-700 text-xs sm:text-sm font-medium truncate flex-1 mr-2">
                Uploading {uploadingFile}...
              </p>
              <span className="text-blue-600 text-xs sm:text-sm font-medium flex-shrink-0">
                {Math.round(uploadProgress)}%
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {filteredFiles.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <File className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-gray-300" />
            <p className="text-sm sm:text-base text-gray-500">No files found</p>
            <p className="text-xs sm:text-sm text-gray-400">Upload some files to get started</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4'
            : 'space-y-2'
          }>
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className={`group relative bg-white border rounded-lg overflow-hidden transition-all duration-200 ${
                  selectionMode 
                    ? 'cursor-pointer hover:border-purple-300 hover:shadow-md' 
                    : 'border-gray-200'
                } ${
                  selectedFile?.id === file.id 
                    ? `${theme.border} ${theme.primaryLight} shadow-md` 
                    : 'border-gray-200'
                }`}
                onClick={() => handleFileSelect(file)}
              >
                {/* File Preview/Icon */}
                <div className="aspect-square bg-gray-50 flex items-center justify-center relative">
                  {file.type === 'image' ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className={`p-4 rounded-full ${getFileTypeColor(file.type)}`}>
                      {getFileIcon(file.type)}
                    </div>
                  )}
                  
                  {/* Play button for audio files */}
                  {file.type === 'audio' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAudioPlay(file);
                      }}
                      className="absolute top-2 left-2 p-2 bg-black bg-opacity-50 hover:bg-opacity-70 transition-all duration-200 rounded-full"
                    >
                      {playingAudioId === file.id ? (
                        <Pause className="w-4 h-4 text-white" />
                      ) : (
                        <Play className="w-4 h-4 text-white ml-0.5" />
                      )}
                    </button>
                  )}
                  
                  {/* Selection check mark */}
                  {selectionMode && selectedFile?.id === file.id && (
                    <div className={`absolute top-2 right-2 ${theme.primary} text-white rounded-full p-1`}>
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="p-2 sm:p-3">
                  <h3 className="font-medium text-xs sm:text-sm text-gray-900 truncate" title={file.name}>
                    {file.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatFileSize(file.size)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 hidden sm:block">
                    {formatDate(file.uploadedAt)}
                  </p>
                  {selectionMode && (
                    <div className="mt-2 text-xs font-medium">
                      {selectedFile?.id === file.id ? (
                        <span className={theme.text}>Selected</span>
                      ) : (
                        <span className="text-gray-500">Tap to select</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                {!selectionMode && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFileDelete(file);
                        }}
                        className="p-1.5 bg-white rounded-full shadow-sm hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3 text-red-600" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {/* Load More Button */}
            {hasMore && !searchTerm && (
              <div className={viewMode === 'grid' ? 'col-span-full' : ''}>
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="w-full py-3 mt-4 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoadingMore ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Loading more...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Load More Files
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-3 rounded-lg shadow-lg max-w-sm ${
              toast.type === 'success' 
                ? 'bg-green-500 text-white' 
                : toast.type === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-blue-500 text-white'
            }`}
          >
            <p className="text-sm">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="absolute top-1 right-1 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        preload="metadata"
        crossOrigin="anonymous"
        onError={(e) => {
          console.error('❌ Audio element error:', e);
          setPlayingAudioId(null);
          addToast({
            type: 'error',
            message: 'Audio playback error. The file may be corrupted or inaccessible.'
          });
        }}
        onLoadedData={() => {
          console.log('✅ Audio loaded successfully');
        }}
      />
    </div>
  );
}
