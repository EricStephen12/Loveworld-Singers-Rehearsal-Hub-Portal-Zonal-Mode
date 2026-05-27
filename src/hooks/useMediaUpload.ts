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
import { channelService, Channel } from '@/lib/channel-service';
import { extractYouTubeVideoId, getYouTubeThumbnail } from '@/utils/youtube';
import { getCloudinaryThumbnailUrl } from '@/utils/cloudinary';
import { isHQAdminEmail } from '@/config/roles';

export type MediaView =
  | 'channels'
  | 'add-channel'
  | 'edit-channel'
  | 'channel-detail'
  | 'videos'
  | 'playlists'
  | 'categories'
  | 'add-video'
  | 'edit-video'
  | 'add-playlist'
  | 'edit-playlist'
  | 'playlist-detail'
  | 'add-category'
  | 'edit-category'
  | 'batch-upload';

export function useMediaUpload() {
  const { user, profile } = useAuth();
  const { currentZone } = useZone();
  const zoneColor = currentZone?.themeColor || '#9333EA';

  const isHQAdmin = useMemo(() => {
    return user?.email ? isHQAdminEmail(user.email) : false;
  }, [user]);

  // UI State
  const [view, setView] = useState<MediaView>('channels');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'video' | 'playlist' | 'category' | 'channel';
    id: string;
    name: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBulkPlaylistOpen, setIsBulkPlaylistOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  // Data State
  const [videos, setVideos] = useState<MediaVideo[]>([]);
  const [playlists, setPlaylists] = useState<AdminPlaylist[]>([]);
  const [categories, setCategories] = useState<MediaCategory[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<MediaVideo | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<AdminPlaylist | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<MediaCategory | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>([]);
  const [batchFiles, setBatchFiles] = useState<{ url: string; title: string; public_id: string }[]>([]);

  // Form State
  const [videoForm, setVideoForm] = useState({
    title: '',
    description: '',
    videoUrl: '',
    thumbnail: '',
    type: '',
    featured: false,
    forHQ: true,
    isYouTube: true,
    playlistIds: [] as string[],
    notifyUsers: false,
    channelId: '',
    channelName: ''
  });

  const [playlistForm, setPlaylistForm] = useState({
    name: '',
    description: '',
    isPublic: true,
    isFeatured: false,
    forHQ: true
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: ''
  });

  const [channelForm, setChannelForm] = useState({
    name: '',
    description: '',
    thumbnail: '',
    isHQOnly: false,
    allowedZones: [] as string[]
  });

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [v, p, c, ch] = await Promise.all([
        mediaVideosService.getAll(100),
        getAdminPlaylists(),
        getCategories(),
        channelService.getAllChannels()
      ]);
      setVideos(v);
      setPlaylists(p);
      setCategories(c);
      setChannels(ch);
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
      title: '',
      description: '',
      videoUrl: '',
      thumbnail: '',
      type: categories[0]?.slug || '',
      featured: false,
      forHQ: true,
      isYouTube: true,
      playlistIds: [],
      notifyUsers: false,
      channelId: selectedChannel?.id || '',
      channelName: selectedChannel?.name || ''
    });
    setSelectedVideo(null);
  }, [categories, selectedChannel]);

  const resetPlaylistForm = useCallback(() => {
    setPlaylistForm({ name: '', description: '', isPublic: true, isFeatured: false, forHQ: true });
    setSelectedPlaylist(null);
  }, []);

  const resetCategoryForm = useCallback(() => {
    setCategoryForm({ name: '', description: '' });
    setSelectedCategory(null);
  }, []);

  const resetChannelForm = useCallback(() => {
    setChannelForm({ name: '', description: '', thumbnail: '', isHQOnly: false, allowedZones: [] });
    setSelectedChannel(null);
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
      const selectedChan = channels.find(c => c.id === videoForm.channelId);
      const data: any = {
        title: videoForm.title.trim(),
        description: videoForm.description.trim(),
        thumbnail: videoForm.thumbnail,
        isYouTube: videoForm.isYouTube,
        type: videoForm.type,
        featured: videoForm.featured,
        forHQ: videoForm.forHQ,
        channelId: videoForm.channelId || '',
        channelName: selectedChan ? selectedChan.name : '',
        createdBy: user?.uid || 'admin',
        createdByName: profile?.first_name || 'Admin',
      };
      if (videoForm.isYouTube) {
        data.youtubeUrl = videoForm.videoUrl;
        data.videoUrl = '';
      } else {
        data.videoUrl = videoForm.videoUrl;
        data.youtubeUrl = '';
      }

      let videoId = '';
      if (selectedVideo) {
        await mediaVideosService.update(selectedVideo.id, data);
        videoId = selectedVideo.id;

        // Manage channel counts if changed
        if (selectedVideo.channelId !== videoForm.channelId) {
          if (selectedVideo.channelId) {
            await channelService.decrementVideoCount(selectedVideo.channelId);
          }
          if (videoForm.channelId) {
            await channelService.incrementVideoCount(videoForm.channelId);
          }
        }
      } else {
        videoId = await mediaVideosService.create(data, videoForm.notifyUsers);
        if (videoForm.channelId) {
          await channelService.incrementVideoCount(videoForm.channelId);
        }
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
      if (selectedChannel) {
        setView('channel-detail');
      } else {
        setView('videos');
      }
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
      title: video.title,
      description: video.description || '',
      videoUrl: video.youtubeUrl || video.videoUrl || '',
      thumbnail: video.thumbnail,
      type: video.type,
      featured: video.featured,
      forHQ: video.forHQ !== false,
      isYouTube: video.isYouTube,
      playlistIds: videoPlaylistIds,
      notifyUsers: false,
      channelId: video.channelId || '',
      channelName: video.channelName || ''
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

  const handleSaveChannel = async () => {
    if (!channelForm.name.trim()) {
      showToast('error', 'Enter a channel name');
      return;
    }
    setIsSubmitting(true);
    try {
      const data = {
        name: channelForm.name.trim(),
        description: channelForm.description.trim(),
        thumbnail: channelForm.thumbnail || '',
        ownerId: user?.uid || 'admin',
        ownerName: profile?.first_name || 'Admin',
        ownerEmail: user?.email || '',
        isHQOnly: channelForm.isHQOnly,
        allowedZones: channelForm.allowedZones
      };

      if (selectedChannel) {
        await channelService.updateChannel(selectedChannel.id, data);
        showToast('success', 'Channel updated!');
      } else {
        await channelService.createChannel(data);
        showToast('success', 'Channel created!');
      }
      resetChannelForm();
      setView('channels');
      loadData();
    } catch (e) {
      showToast('error', 'Failed to save channel');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditChannel = useCallback((channel: Channel) => {
    setSelectedChannel(channel);
    setChannelForm({
      name: channel.name,
      description: channel.description,
      thumbnail: channel.thumbnail,
      isHQOnly: !!channel.isHQOnly,
      allowedZones: channel.allowedZones || []
    });
    setView('edit-channel');
  }, []);

  const handleDeleteChannel = async (id: string) => {
    try {
      await channelService.deleteChannel(id);
      showToast('success', 'Channel deleted!');
      setDeleteConfirm(null);
      setSelectedChannel(null);
      setView('channels');
      loadData();
    } catch (e) {
      showToast('error', 'Failed to delete channel');
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
      const selectedChan = channels.find(c => c.id === videoForm.channelId);
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
          channelId: videoForm.channelId || '',
          channelName: selectedChan ? selectedChan.name : '',
          createdBy: user?.uid || 'admin',
          createdByName: profile?.first_name || 'Admin',
          notifyUsers: videoForm.notifyUsers
        };
      });

      await mediaVideosService.createBatch(videosToCreate);
      if (videoForm.channelId) {
        for (let i = 0; i < batchFiles.length; i++) {
          await channelService.incrementVideoCount(videoForm.channelId);
        }
      }
      showToast('success', `Success! ${batchFiles.length} videos published.`);
      setBatchFiles([]);
      if (selectedChannel) {
        setView('channel-detail');
      } else {
        setView('videos');
      }
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

  const filteredChannels = useMemo(() =>
    channels.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [channels, searchQuery]
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
    isHQAdmin,

    // Data State
    videos,
    playlists,
    categories,
    channels,
    selectedVideo, setSelectedVideo,
    selectedPlaylist, setSelectedPlaylist,
    selectedCategory, setSelectedCategory,
    selectedChannel, setSelectedChannel,
    selectedVideoIds, setSelectedVideoIds,
    batchFiles, setBatchFiles,
    filteredVideos,
    filteredPlaylists,
    filteredChannels,
    getPlaylistThumb,

    // Form State
    videoForm, setVideoForm,
    playlistForm, setPlaylistForm,
    categoryForm, setCategoryForm,
    channelForm, setChannelForm,
    resetVideoForm, resetPlaylistForm, resetCategoryForm, resetChannelForm,
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
    handleSaveChannel,
    handleDeleteChannel,
    handleEditChannel,
    handleToggleVideoInPlaylist,
    handlePublishBatch
  };
}
