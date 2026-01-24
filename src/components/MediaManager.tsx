"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  loadMoreCloudinaryMediaByType,
  hasMoreCloudinaryMediaByType,
  CloudinaryMediaFile,
  searchCloudinaryMedia
} from '@/lib/cloudinary-media-service';
import { useZone } from '@/hooks/useZone';
import { Toast } from './Toast';
import { runMediaDiagnostics, printDiagnostics, DiagnosticResult } from '@/utils/media-diagnostics';
import CustomLoader from './CustomLoader';


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
  const [expandedFileId, setExpandedFileId] = useState<string | null>(null);

  // Track which type we're filtering by for pagination
  const [currentFilterType, setCurrentFilterType] = useState<string | null>(null);
  const [isDeepSearching, setIsDeepSearching] = useState(false);
  const [deepSearchResults, setDeepSearchResults] = useState<MediaFile[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Load files from database with optimized caching
  useEffect(() => {
    if (currentZone) {
      loadFilesFromDatabase();
    }
  }, [currentZone?.id]); // Reload when zone changes

  const loadFilesFromDatabase = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const startTime = performance.now();

      // Always load all media types with pagination - filtering happens client-side
      const mediaFiles = await getAllCloudinaryMedia(currentZone?.id, 500);
      setHasMore(hasMoreCloudinaryMedia(currentZone?.id));
      setCurrentFilterType(null);

      const loadTime = performance.now() - startTime;

      // Show success message for slow loads
      if (loadTime > 1000 && showLoading) {
        addToast({
          type: 'info',
          message: `Loaded ${mediaFiles.length} files in ${(loadTime / 1000).toFixed(1)}s`
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
      // Always load more from all media (filtering happens client-side)
      const moreFiles = await loadMoreCloudinaryMedia(currentZone?.id, 500);
      setHasMore(hasMoreCloudinaryMedia(currentZone?.id));

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

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
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

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        setUploadingFile(file.name);

        // Determine file type
        const fileType = getFileType(file.type);

        try {
          // Upload to Cloudinary with progress tracking
          const uploadResult = await uploadToCloudinary(file, (progress) => {
            setUploadProgress(progress);
          });

          if (uploadResult) {

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

  const handleFileDoubleClick = (file: MediaFile) => {
    if (selectionMode && onSelectFile) {
      onSelectFile(file);
      if (onClose) {
        onClose();
      }
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
        const dbDeleteResult = await deleteCloudinaryMedia(file.id, currentZone?.id);

        if (dbDeleteResult.success) {
          // Delete from Cloudinary using stored publicId
          let cloudinaryDeleteSuccess = true;
          if (file.storagePath) {

            // Determine resource type
            let resourceType = 'image';
            if (file.type === 'audio') resourceType = 'video'; // Cloudinary uses 'video' for audio
            else if (file.type === 'video') resourceType = 'video';
            else if (file.type === 'document') resourceType = 'raw';

            cloudinaryDeleteSuccess = await deleteFromCloudinary(file.storagePath, resourceType);
          } else {
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

          audioRef.current.crossOrigin = 'anonymous';
          audioRef.current.src = file.url;

          // Load the audio first
          audioRef.current.load();

          // Wait for it to be ready
          await audioRef.current.play();
          setPlayingAudioId(file.id);

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

  const handleDeepSearch = async () => {
    if (!searchTerm || searchTerm.length < 2) return;

    setIsDeepSearching(true);
    addToast({
      type: 'info',
      message: 'Searching database for all matching files...'
    });

    try {
      const results = await searchCloudinaryMedia(searchTerm, currentZone?.id, true);

      const convertedResults: MediaFile[] = results.map(dbFile => ({
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

      setDeepSearchResults(convertedResults);

      if (convertedResults.length === 0) {
        addToast({
          type: 'warning',
          message: 'No unlisted files found matching your search.'
        });
      } else {
        addToast({
          type: 'success',
          message: `Found ${convertedResults.length} unlisted files!`
        });
      }
    } catch (error) {
      console.error('Deep search error:', error);
      addToast({
        type: 'error',
        message: 'Deep search failed'
      });
    } finally {
      setIsDeepSearching(false);
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

  const filteredFiles = useMemo(() => {
    return files.filter(file => {
      const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === 'all' || file.type === selectedType;
      const matchesFolder = selectedFolder === 'all' || file.folder === selectedFolder;
      const matchesAllowedTypes = allowedTypes.includes(file.type);

      if (selectionMode && allowedTypes.length < 4) {
        return matchesSearch && matchesFolder && matchesAllowedTypes;
      }

      return matchesSearch && matchesType && matchesFolder && matchesAllowedTypes;
    });
  }, [files, searchTerm, selectedType, selectedFolder, allowedTypes, selectionMode]);

  // Merge local filtering with deep search results
  const allFilteredFiles = useMemo(() => {
    if (deepSearchResults.length === 0) return filteredFiles;

    // De-duplicate results (deep search might return items already in the local cache)
    const existingIds = new Set(filteredFiles.map(f => f.id));
    const uniqueDeepResults = deepSearchResults.filter(f => !existingIds.has(f.id));

    return [...filteredFiles, ...uniqueDeepResults];
  }, [filteredFiles, deepSearchResults]);

  const folders = ['all', ...Array.from(new Set(files.map(f => f.folder).filter(Boolean)))];

  return (
    <div className="h-full w-full flex flex-col bg-white relative overflow-hidden">
      {/* Loading Skeleton */}
      {loading && files.length === 0 && (
        <div className="absolute inset-0 bg-white z-50 flex flex-col items-center justify-center p-8">
          <CustomLoader message="Loading media library..." />
        </div>
      )}

      {/* Header - Compact on mobile */}
      <div className="flex-shrink-0 px-3 py-2 sm:p-4 border-b border-gray-200 bg-white sticky top-0 z-20">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base sm:text-xl font-bold text-gray-900 truncate">
            {selectionMode ? 'Select Audio' : 'Media Library'}
          </h2>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {!selectionMode && (
              <button
                onClick={() => loadFilesFromDatabase(true)}
                disabled={loading}
                className={`p-2 ${theme.primary} text-white rounded-lg ${theme.primaryHover} transition-colors disabled:opacity-50`}
              >
                <RefreshCw className="w-4 h-4" />
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

        {/* Search - Always visible */}
        <div className="mt-2 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setDeepSearchResults([]); // Reset deep results when search term changes
            }}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          {searchTerm.length >= 2 && (
            <button
              onClick={handleDeepSearch}
              disabled={isDeepSearching}
              className={`absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${isDeepSearching ? 'bg-gray-100 text-gray-400' : `${theme.primary} text-white hover:opacity-90`
                }`}
            >
              {isDeepSearching ? 'Searching...' : 'Deep Search'}
            </button>
          )}
        </div>

        {/* Type filter - Horizontal scroll on mobile */}
        <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1 -mx-3 px-3 scrollbar-hide">
          {['all', 'audio', 'image', 'video'].map(type => (
            <button
              key={type}
              onClick={() => setSelectedType(type as any)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${selectedType === type
                ? `${theme.primary} text-white`
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Upload Area - Compact on mobile */}
      <div className="flex-shrink-0 px-3 py-2 sm:p-4 border-b border-gray-200 bg-gray-50">
        <div
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-3 sm:p-4 text-center transition-colors ${dragOver
            ? `${theme.border} ${theme.primaryLight}`
            : 'border-gray-300'
            }`}
        >
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`flex items-center justify-center gap-2 w-full py-2 ${theme.text} font-medium`}
          >
            <Upload className="w-5 h-5" />
            <span>Upload Files</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={allowedTypes.map(type => {
              switch (type) {
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

      {/* File count - Compact */}
      <div className="flex-shrink-0 px-3 py-1.5 border-b border-gray-100 flex items-center justify-between bg-white">
        <p className="text-[10px] text-gray-500 font-medium">
          {allFilteredFiles.length} file{allFilteredFiles.length !== 1 ? 's' : ''}
          {deepSearchResults.length > 0 && ` (${deepSearchResults.length} from deep search)`}
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? `${theme.primaryLight} ${theme.text}` : 'text-gray-400'
              }`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? `${theme.primaryLight} ${theme.text}` : 'text-gray-400'
              }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Files Grid/List - Scrollable Area */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-2 sm:p-4 pb-20">
        {uploading && (
          <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <p className="text-blue-700 text-xs font-medium truncate flex-1 mr-2">
                {uploadingFile}
              </p>
              <span className="text-blue-600 text-xs font-medium">
                {Math.round(uploadProgress)}%
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-1.5">
              <div
                className="bg-blue-600 h-1.5 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {deepSearchResults.length > 0 && (
          <div className={`flex items-center justify-between mb-2 text-[10px] ${theme.text} font-bold px-1`}>
            <span>DATABASE SEARCH ACTIVE</span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Live Feed
            </div>
          </div>
        )}
        {allFilteredFiles.length === 0 ? (
          <div className="text-center py-10 px-4 max-w-sm mx-auto">
            <div className="bg-purple-50/50 rounded-2xl p-8 border-2 border-dashed border-purple-100">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <File className="w-full h-full text-purple-200" />
                <Search className="w-8 h-8 text-purple-500 absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-sm" />
              </div>
              <p className="text-sm font-bold text-gray-900 mb-1">Not in local view?</p>
              <p className="text-[10px] text-gray-500 mb-6 leading-relaxed">
                We've only loaded the first 500 files. The item you're looking for might be in our wider storage.
              </p>

              {searchTerm.length >= 2 ? (
                <button
                  onClick={handleDeepSearch}
                  disabled={isDeepSearching}
                  className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold transition-all shadow-lg active:scale-95 ${isDeepSearching
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : `bg-purple-600 text-white shadow-purple-200 hover:shadow-purple-300`
                    }`}
                >
                  {isDeepSearching ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Scanning Database...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Search Global Database
                    </>
                  )}
                </button>
              ) : (
                <p className="text-[10px] text-purple-400 italic font-medium">Type more to search globally</p>
              )}
            </div>
          </div>
        ) : (
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2 relative'
            : 'space-y-1 relative'
          }>
            {isDeepSearching && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] z-50 flex flex-col items-center justify-center rounded-xl min-h-[300px]">
                <div className="relative">
                  <RefreshCw className="w-12 h-12 text-purple-600 animate-spin mb-4" />
                  <Search className="w-6 h-6 text-purple-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">Searching Deep Storage...</h3>
                <p className="text-[10px] text-gray-500 max-w-[200px] text-center px-4">
                  We're scanning all 2000+ files in the database for "{searchTerm}"
                </p>
              </div>
            )}
            {allFilteredFiles.map((file) => (
              <div
                key={file.id}
                className={`group relative bg-white/80 backdrop-blur-sm border rounded-lg overflow-hidden transition-all duration-300 hover:shadow-sm ${selectionMode ? 'cursor-pointer active:scale-95' : ''
                  } ${selectedFile?.id === file.id
                    ? `border-purple-500 ring-1 ring-purple-200 shadow-md`
                    : 'border-gray-100 hover:border-purple-200'
                  }`}
                onClick={() => handleFileSelect(file)}
                onDoubleClick={() => handleFileDoubleClick(file)}
              >
                {/* File Preview/Icon - Smaller on mobile */}
                <div className="aspect-square bg-gray-50 flex items-center justify-center relative">
                  {file.type === 'image' ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className={`p-2 sm:p-3 rounded-full ${getFileTypeColor(file.type)} transform transition-transform duration-300 group-hover:scale-110`}>
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
                      className="absolute top-1 left-1 p-1.5 bg-black/50 rounded-full"
                    >
                      {playingAudioId === file.id ? (
                        <Pause className="w-3 h-3 text-white" />
                      ) : (
                        <Play className="w-4 h-4 text-white ml-0.5" />
                      )}
                    </button>
                  )}

                  {/* Selection check mark */}
                  {selectionMode && selectedFile?.id === file.id && (
                    <div className="absolute top-1 right-1 bg-purple-500 text-white rounded-full p-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>

                {/* File Info - Balanced Compact */}
                <div className="p-1 sm:p-1.5 bg-white/30">
                  <h3
                    className={`font-semibold text-[9px] sm:text-[10px] text-gray-800 leading-[1.1] break-words cursor-pointer ${expandedFileId === file.id ? '' : 'line-clamp-1'
                      }`}
                    title={file.name}
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedFileId(expandedFileId === file.id ? null : file.id);
                    }}
                  >
                    {file.name}
                  </h3>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[8px] text-gray-400 font-medium">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                </div>

                {/* Actions - Only on hover for non-selection mode */}
                {!selectionMode && (
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFileDelete(file);
                      }}
                      className="p-1 bg-white rounded-full shadow-sm hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3 text-red-600" />
                    </button>
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
                  className="w-full py-2 mt-2 text-purple-600 text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoadingMore ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Load More
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast Notifications - Improved UI */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 space-y-2 z-[100] w-[90%] max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl shadow-lg animate-in slide-in-from-top-2 duration-300 ${toast.type === 'success'
              ? 'bg-green-500 text-white'
              : toast.type === 'error'
                ? 'bg-red-500 text-white'
                : toast.type === 'warning'
                  ? 'bg-amber-500 text-white'
                  : 'bg-slate-800 text-white'
              }`}
          >
            {toast.type === 'success' && <CheckCircle className="w-4 h-4 shrink-0" />}
            {toast.type === 'error' && <X className="w-4 h-4 shrink-0" />}
            {toast.type === 'warning' && <RefreshCw className="w-4 h-4 shrink-0" />}
            {toast.type === 'info' && <Music className="w-4 h-4 shrink-0" />}
            <p className="text-sm flex-1 line-clamp-2">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:bg-white/20 rounded-full shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Floating Selection Bar - Compact on mobile */}
      {selectionMode && selectedFile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg px-3 py-2 z-[60]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className={`p-1.5 rounded-lg shrink-0 ${getFileTypeColor(selectedFile.type)}`}>
                <Music className="w-4 h-4" />
              </div>
              <p className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
            </div>
            <button
              onClick={handleConfirmSelection}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium text-sm shrink-0"
            >
              Select
            </button>
          </div>
        </div>
      )}

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
        }}
      />
    </div>
  );
}
