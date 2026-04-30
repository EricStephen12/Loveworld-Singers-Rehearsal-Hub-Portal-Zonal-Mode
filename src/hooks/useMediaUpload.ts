"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useZone } from '@/hooks/useZone';
import { mediaVideosService, MediaVideo } from '@/lib/media-videos-service';
import {
  getAdminPlaylists,
  createAdminPlaylist,
  updateAdminPlaylist,
  deleteAdminPlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  AdminPlaylist
} from '@/lib/admin-playlist-service';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  MediaCategory
} from '@/lib/media-category-service';
import { extractYouTubeVideoId, getYouTubeThumbnail } from '@/utils/youtube';
import { getCloudinaryThumbnailUrl } from '@/utils/cloudinary';

export type MediaView = 'videos' | 'playlists' | 'categories' | 'add-video' | 'edit-video' | 'add-playlist' | 'edit-playlist' | 'playlist-detail' | 'add-category' | 'edit-category' | 'batch-upload';

export function useMediaUpload() {
  const { user, profile } = useAuth();
  const { currentZone } = useZone();
  const zoneColor = currentZone?.themeColor || '#9333EA';

  // UI State
  const [view, setView] = useState<MediaView>('videos');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'video' | 'playlist' | 'category'; id: string; name: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBulkPlaylistOpen, setIsBulkPlaylistOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  // Data State
  const [videos, setVideos] = useState<MediaVideo[]>([]);
  const [playlists, setPlaylists] = useState<AdminPlaylist[]>([]);
  const [categories, setCategories] = useState<MediaCategory[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<MediaVideo | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<AdminPlaylist | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<MediaCategory | null>(null);
  const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>([]);
  const [batchFiles, setBatchFiles] = useState<{ url: string; title: string; public_id: string }[]>([]);

  // Form State
  const [videoForm, setVideoForm] = useState({
    title: '', description: '', videoUrl: '', thumbnail: '',
    type: '', featured: false, forHQ: true, isYouTube: true,
    playlistIds: [] as string[],
    notifyUsers: false
  });

  const [playlistForm, setPlaylistForm] = useState({
    name: '', description: '', isPublic: true, isFeatured: false, forHQ: true
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '', description: ''
  });

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [v, p, c] = await Promise.all([
        mediaVideosService.getAll(50),
        getAdminPlaylists(),
        getCategories()
      ]);
      setVideos(v);
      setPlaylists(p);
      setCategories(c);
    } catch (e) {
      console.error(e);
      showToast('error', 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (categories.length > 0 && !videoForm.type) {
      setVideoForm(prev => ({ ...prev, type: categories[0].slug }));
    }
  }, [categories, videoForm.type]);

  // Form Helpers
  const resetVideoForm = useCallback(() => {
    setVideoForm({
      title: '', description: '', videoUrl: '', thumbnail: '',
      type: categories[0]?.slug || '', featured: false, forHQ: true, isYouTube: true,
      playlistIds: [], notifyUsers: false
    });
    setSelectedVideo(null);
  }, [categories]);

  const resetPlaylistForm = useCallback(() => {
    setPlaylistForm({ name: '', description: '', isPublic: true, isFeatured: false, forHQ: true });
    setSelectedPlaylist(null);
  }, []);

  const resetCategoryForm = useCallback(() => {
    setCategoryForm({ name: '', description: '' });
    setSelectedCategory(null);
  }, []);

  const handleVideoUrlChange = useCallback((url: string) => {
    setVideoForm(prev => {
      const newState = { ...prev, videoUrl: url };
      if (prev.isYouTube && extractYouTubeVideoId(url)) {
        const thumb = getYouTubeThumbnail(url);
        if (thumb) newState.thumbnail = thumb;
      }
      return newState;
    });
  }, []);

  // Actions
  const handleSaveVideo = async () => {
    if (!videoForm.title.trim() || !videoForm.videoUrl || !videoForm.thumbnail) {
      showToast('error', 'Fill in title, video URL, and thumbnail');
      return;
    }
    setIsSubmitting(true);
    try {
      const data: any = {
        title: videoForm.title.trim(), description: videoForm.description.trim(),
        thumbnail: videoForm.thumbnail, isYouTube: videoForm.isYouTube,
        type: videoForm.type, featured: videoForm.featured, forHQ: videoForm.forHQ,
        createdBy: user?.uid || 'admin', createdByName: profile?.first_name || 'Admin',
      };
      if (videoForm.isYouTube) { data.youtubeUrl = videoForm.videoUrl; data.videoUrl = ''; }
      else { data.videoUrl = videoForm.videoUrl; data.youtubeUrl = ''; }

      let videoId = '';
      if (selectedVideo) {
        await mediaVideosService.update(selectedVideo.id, data);
        videoId = selectedVideo.id;
      } else {
        videoId = await mediaVideosService.create(data, videoForm.notifyUsers);
      }

      // Update Playlists
      const newPlaylistIds = videoForm.playlistIds;
      const oldPlaylistIds = selectedVideo
        ? playlists.filter(p => p.videoIds.includes(selectedVideo.id)).map(p => p.id)
        : [];

      const toAdd = newPlaylistIds.filter(id => !oldPlaylistIds.includes(id));
      const toRemove = oldPlaylistIds.filter(id => !newPlaylistIds.includes(id));

      for (const pId of toAdd) await addVideoToPlaylist(pId, videoId);
      for (const pId of toRemove) await removeVideoFromPlaylist(pId, videoId);

      showToast('success', selectedVideo ? 'Video updated!' : 'Video added and published!');
      resetVideoForm();
      setView('videos');
      loadData();
    } catch (e: any) {
      showToast('error', e?.message || 'Failed to save');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVideo = async (id: string) => {
    try {
      await mediaVideosService.delete(id);
      showToast('success', 'Video deleted!');
      setDeleteConfirm(null);
      loadData();
    } catch (e) {
      showToast('error', 'Failed to delete');
    }
  };

  const handleEditVideo = useCallback((video: MediaVideo) => {
    const videoPlaylistIds = playlists
      .filter(p => p.videoIds.includes(video.id))
      .map(p => p.id);

    setSelectedVideo(video);
    setVideoForm({
      title: video.title, description: video.description || '',
      videoUrl: video.youtubeUrl || video.videoUrl || '', thumbnail: video.thumbnail,
      type: video.type, featured: video.featured, forHQ: video.forHQ !== false, isYouTube: video.isYouTube,
      playlistIds: videoPlaylistIds,
      notifyUsers: false
    });
    setView('edit-video');
  }, [playlists]);

  const handleBulkAddToPlaylist = async (pId: string) => {
    setIsSubmitting(true);
    try {
      await Promise.all(selectedVideoIds.map(vid => addVideoToPlaylist(pId, vid)));
      showToast('success', `Added ${selectedVideoIds.length} videos to collection!`);
      setSelectedVideoIds([]);
      setIsBulkPlaylistOpen(false);
      loadData();
    } catch (e: any) {
      showToast('error', e?.message || 'Failed to add');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedVideoIds.length} videos permanently?`)) return;
    setIsSubmitting(true);
    try {
      await Promise.all(selectedVideoIds.map(vid => mediaVideosService.delete(vid)));
      showToast('success', `Deleted ${selectedVideoIds.length} videos`);
      setSelectedVideoIds([]);
      loadData();
    } catch (e: any) {
      showToast('error', e?.message || 'Failed to delete');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSavePlaylist = async () => {
    if (!playlistForm.name.trim()) { showToast('error', 'Enter a playlist name'); return; }
    setIsSubmitting(true);
    try {
      if (selectedPlaylist) {
        await updateAdminPlaylist(selectedPlaylist.id, { ...playlistForm, name: playlistForm.name.trim(), description: playlistForm.description.trim() });
      } else {
        await createAdminPlaylist({ ...playlistForm, name: playlistForm.name.trim(), description: playlistForm.description.trim(), createdBy: user?.uid || 'admin', createdByName: profile?.first_name || 'Admin' });
      }
      showToast('success', selectedPlaylist ? 'Playlist updated!' : 'Playlist created!');
      resetPlaylistForm();
      setView('playlists');
      loadData();
    } catch (e) {
      showToast('error', 'Failed to save');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePlaylist = async (id: string) => {
    try {
      await deleteAdminPlaylist(id);
      showToast('success', 'Playlist deleted!');
      setDeleteConfirm(null);
      setSelectedPlaylist(null);
      setView('playlists');
      loadData();
    } catch (e) {
      console.error(' Failed to delete playlist:', e);
      showToast('error', 'Failed to delete');
    }
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim()) { showToast('error', 'Enter a category name'); return; }
    setIsSubmitting(true);
    try {
      if (selectedCategory) {
        await updateCategory(selectedCategory.id, { name: categoryForm.name.trim(), description: categoryForm.description.trim() });
      } else {
        await createCategory(categoryForm.name.trim(), categoryForm.description.trim());
      }
      showToast('success', selectedCategory ? 'Category updated!' : 'Category created!');
      resetCategoryForm();
      setView('categories');
      loadData();
    } catch (e) {
      showToast('error', 'Failed to save');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id);
      showToast('success', 'Category deleted!');
      setDeleteConfirm(null);
      loadData();
    } catch (e) {
      showToast('error', 'Failed to delete');
    }
  };

  const handleToggleVideoInPlaylist = async (videoId: string) => {
    if (!selectedPlaylist) return;
    try {
      const isIn = selectedPlaylist.videoIds.includes(videoId);
      if (isIn) {
        await removeVideoFromPlaylist(selectedPlaylist.id, videoId);
        setSelectedPlaylist({ ...selectedPlaylist, videoIds: selectedPlaylist.videoIds.filter(id => id !== videoId) });
      } else {
        await addVideoToPlaylist(selectedPlaylist.id, videoId);
        setSelectedPlaylist({ ...selectedPlaylist, videoIds: [...selectedPlaylist.videoIds, videoId] });
      }
      loadData();
    } catch (e) {
      showToast('error', 'Failed to update');
    }
  };

  const handlePublishBatch = async () => {
    if (batchFiles.length === 0) return;
    setIsSubmitting(true);
    try {
      const videosToCreate = batchFiles.map(file => {
        const autoThumb = getCloudinaryThumbnailUrl(file.url);
        return {
          title: file.title || 'Untitled Video',
          description: '',
          thumbnail: autoThumb,
          videoUrl: file.url,
          isYouTube: false,
          type: videoForm.type || categories[0]?.slug || 'other',
          featured: false,
          forHQ: videoForm.forHQ,
          hidden: false,
          createdBy: user?.uid || 'admin',
          createdByName: profile?.first_name || 'Admin',
          notifyUsers: videoForm.notifyUsers
        };
      });

      await mediaVideosService.createBatch(videosToCreate);
      showToast('success', `Success! ${batchFiles.length} videos published.`);
      setBatchFiles([]);
      setView('videos');
      loadData();
    } catch (e: any) {
      console.error(e);
      showToast('error', 'Failed to publish batch');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredVideos = useMemo(() =>
    videos.filter(v => v.title.toLowerCase().includes(searchQuery.toLowerCase())),
    [videos, searchQuery]
  );

  const filteredPlaylists = useMemo(() =>
    playlists.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [playlists, searchQuery]
  );

  const getPlaylistThumb = useCallback((p: AdminPlaylist) =>
    p.thumbnail || (p.videoIds.length > 0 ? videos.find(v => v.id === p.videoIds[0])?.thumbnail : '') || '',
    [videos]
  );

  return {
    // UI State
    view, setView,
    isLoading,
    isSubmitting,
    toast, showToast,
    deleteConfirm, setDeleteConfirm,
    searchQuery, setSearchQuery,
    isSidebarCollapsed, setIsSidebarCollapsed,
    isMobileMenuOpen, setIsMobileMenuOpen,
    isBulkPlaylistOpen, setIsBulkPlaylistOpen,
    viewMode, setViewMode,
    zoneColor,

    // Data State
    videos,
    playlists,
    categories,
    selectedVideo, setSelectedVideo,
    selectedPlaylist, setSelectedPlaylist,
    selectedCategory, setSelectedCategory,
    selectedVideoIds, setSelectedVideoIds,
    batchFiles, setBatchFiles,
    filteredVideos,
    filteredPlaylists,
    getPlaylistThumb,

    // Form State
    videoForm, setVideoForm,
    playlistForm, setPlaylistForm,
    categoryForm, setCategoryForm,
    resetVideoForm, resetPlaylistForm, resetCategoryForm,
    handleVideoUrlChange,

    // Actions
    handleSaveVideo,
    handleDeleteVideo,
    handleEditVideo,
    handleBulkAddToPlaylist,
    handleBulkDelete,
    handleSavePlaylist,
    handleDeletePlaylist,
    handleSaveCategory,
    handleDeleteCategory,
    handleToggleVideoInPlaylist,
    handlePublishBatch
  };
}
