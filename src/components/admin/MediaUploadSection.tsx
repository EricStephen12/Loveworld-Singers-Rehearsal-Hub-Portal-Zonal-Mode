'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import {
  Upload, Film, X, Trash2, Edit2, Youtube, Cloud, Check, Eye, Heart,
  Plus, ListVideo, Globe, Star, Search, FolderOpen,
  CheckCircle, XCircle, ArrowLeft, ChevronRight, Tag, Menu, ChevronDown,
  Grid3x3, List, Calendar, TrendingUp, MoreVertical
} from 'lucide-react'
import { mediaVideosService, MediaVideo } from '@/lib/media-videos-service'
import { extractYouTubeVideoId, getYouTubeThumbnail } from '@/utils/youtube'
import CustomLoader from '@/components/CustomLoader'
import {
  getAdminPlaylists,
  createAdminPlaylist,
  updateAdminPlaylist,
  deleteAdminPlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  AdminPlaylist
} from '@/lib/admin-playlist-service'
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  MediaCategory
} from '@/lib/media-category-service'

import { useZone } from '@/hooks/useZone'

type View = 'videos' | 'playlists' | 'categories' | 'add-video' | 'edit-video' | 'add-playlist' | 'edit-playlist' | 'playlist-detail' | 'add-category' | 'edit-category'

export default function MediaUploadSection() {
  const { user, profile } = useAuth()
  const { currentZone } = useZone()
  const zoneColor = currentZone?.themeColor || '#9333EA'

  const darkenColor = (color: string, percent: number) => {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  };
  const [view, setView] = useState<View>('videos')
  const [videos, setVideos] = useState<MediaVideo[]>([])
  const [playlists, setPlaylists] = useState<AdminPlaylist[]>([])
  const [categories, setCategories] = useState<MediaCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<MediaVideo | null>(null)
  const [selectedPlaylist, setSelectedPlaylist] = useState<AdminPlaylist | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<MediaCategory | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'video' | 'playlist' | 'category'; id: string; name: string } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>([])
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isBulkPlaylistOpen, setIsBulkPlaylistOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table')

  const [videoForm, setVideoForm] = useState({
    title: '', description: '', videoUrl: '', thumbnail: '',
    type: '', featured: false, forHQ: true, isYouTube: true,
    playlistIds: [] as string[],
    notifyUsers: false
  })

  const [playlistForm, setPlaylistForm] = useState({
    name: '', description: '', isPublic: true, isFeatured: false, forHQ: true
  })

  const [categoryForm, setCategoryForm] = useState({
    name: '', description: ''
  })

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [v, p, c] = await Promise.all([
        mediaVideosService.getAll(50),
        getAdminPlaylists(),
        getCategories()
      ])
      setVideos(v)
      setPlaylists(p)
      setCategories(c)
    } catch (e) { console.error(e) }
    finally { setIsLoading(false) }
  }

  // Auto-select first category when loaded if type is empty
  useEffect(() => {
    if (categories.length > 0 && !videoForm.type) {
      setVideoForm(prev => ({ ...prev, type: categories[0].slug }))
    }
    // Also update reset logic to use fresh categories
  }, [categories])

  const resetVideoForm = () => {
    setVideoForm({ title: '', description: '', videoUrl: '', thumbnail: '', type: categories[0]?.slug || '', featured: false, forHQ: true, isYouTube: true, playlistIds: [], notifyUsers: false })
    setSelectedVideo(null)
  }

  const resetPlaylistForm = () => {
    setPlaylistForm({ name: '', description: '', isPublic: true, isFeatured: false, forHQ: true })
    setSelectedPlaylist(null)
  }

  const resetCategoryForm = () => {
    setCategoryForm({ name: '', description: '' })
    setSelectedCategory(null)
  }

  const handleVideoUrlChange = (url: string) => {
    setVideoForm(prev => ({ ...prev, videoUrl: url }))
    if (videoForm.isYouTube && extractYouTubeVideoId(url)) {
      const thumb = getYouTubeThumbnail(url)
      if (thumb) setVideoForm(prev => ({ ...prev, thumbnail: thumb }))
    }
  }

  const handleSaveVideo = async () => {
    if (!videoForm.title.trim() || !videoForm.videoUrl || !videoForm.thumbnail) {
      showToast('error', 'Fill in title, video URL, and thumbnail')
      return
    }
    setIsSubmitting(true)
    try {
      const data: any = {
        title: videoForm.title.trim(), description: videoForm.description.trim(),
        thumbnail: videoForm.thumbnail, isYouTube: videoForm.isYouTube,
        type: videoForm.type, featured: videoForm.featured, forHQ: videoForm.forHQ,
        createdBy: user?.uid || 'admin', createdByName: profile?.first_name || 'Admin',
      }
      if (videoForm.isYouTube) { data.youtubeUrl = videoForm.videoUrl; data.videoUrl = '' }
      else { data.videoUrl = videoForm.videoUrl; data.youtubeUrl = '' }

      let videoId = ''
      if (selectedVideo) {
        await mediaVideosService.update(selectedVideo.id, data)
        videoId = selectedVideo.id
      } else {
        videoId = await mediaVideosService.create(data, videoForm.notifyUsers)
      }

      // Handle multi-playlist assignment (YouTube-style)
      const newPlaylistIds = videoForm.playlistIds
      const oldPlaylistIds = selectedVideo
        ? playlists.filter(p => p.videoIds.includes(selectedVideo.id)).map(p => p.id)
        : []

      // Calculate diff
      const toAdd = newPlaylistIds.filter(id => !oldPlaylistIds.includes(id))
      const toRemove = oldPlaylistIds.filter(id => !newPlaylistIds.includes(id))

      // Add to new playlists
      for (const pId of toAdd) {
        await addVideoToPlaylist(pId, videoId)
      }

      // Remove from deselected playlists
      for (const pId of toRemove) {
        await removeVideoFromPlaylist(pId, videoId)
      }

      showToast('success', selectedVideo ? 'Video updated!' : 'Video added and published!')
      resetVideoForm()
      setView('videos')
      loadData()
    } catch (e: any) { showToast('error', e?.message || 'Failed to save') }
    finally { setIsSubmitting(false) }
  }

  const handleDeleteVideo = async (id: string) => {
    try {
      await mediaVideosService.delete(id)
      showToast('success', 'Video deleted!')
      setDeleteConfirm(null)
      loadData()
    } catch (e) { showToast('error', 'Failed to delete') }
  }

  const handleEditVideo = (video: MediaVideo) => {
    // Find ALL playlists this video belongs to
    const videoPlaylistIds = playlists
      .filter(p => p.videoIds.includes(video.id))
      .map(p => p.id)

    setSelectedVideo(video)
    setVideoForm({
      title: video.title, description: video.description || '',
      videoUrl: video.youtubeUrl || video.videoUrl || '', thumbnail: video.thumbnail,
      type: video.type, featured: video.featured, forHQ: video.forHQ !== false, isYouTube: video.isYouTube,
      playlistIds: videoPlaylistIds,
      notifyUsers: false
    })
    setView('edit-video')
  }

  const handleBulkAddToPlaylist = async (pId: string) => {
    setIsSubmitting(true)
    try {
      await Promise.all(selectedVideoIds.map(vid => addVideoToPlaylist(pId, vid)))
      showToast('success', `Added ${selectedVideoIds.length} videos to collection!`)
      setSelectedVideoIds([])
      setIsBulkPlaylistOpen(false)
      loadData()
    } catch (e: any) { showToast('error', e?.message || 'Failed to add') }
    finally { setIsSubmitting(false) }
  }

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedVideoIds.length} videos permanently?`)) return
    setIsSubmitting(true)
    try {
      await Promise.all(selectedVideoIds.map(vid => mediaVideosService.delete(vid)))
      showToast('success', `Deleted ${selectedVideoIds.length} videos`)
      setSelectedVideoIds([])
      loadData()
    } catch (e: any) { showToast('error', e?.message || 'Failed to delete') }
    finally { setIsSubmitting(false) }
  }

  const handleSavePlaylist = async () => {
    if (!playlistForm.name.trim()) { showToast('error', 'Enter a playlist name'); return }
    setIsSubmitting(true)
    try {
      if (selectedPlaylist) {
        await updateAdminPlaylist(selectedPlaylist.id, { ...playlistForm, name: playlistForm.name.trim(), description: playlistForm.description.trim() })
      } else {
        await createAdminPlaylist({ ...playlistForm, name: playlistForm.name.trim(), description: playlistForm.description.trim(), createdBy: user?.uid || 'admin', createdByName: profile?.first_name || 'Admin' })
      }
      showToast('success', selectedPlaylist ? 'Playlist updated!' : 'Playlist created!')
      resetPlaylistForm()
      setView('playlists')
      loadData()
    } catch (e) { showToast('error', 'Failed to save') }
    finally { setIsSubmitting(false) }
  }

  const handleDeletePlaylist = async (id: string) => {
    try {
      await deleteAdminPlaylist(id)
      showToast('success', 'Playlist deleted!')
      setDeleteConfirm(null)
      setSelectedPlaylist(null);
      setView('playlists'); // Go back to playlists list
      loadData()
    } catch (e) {
      console.error('❌ Failed to delete playlist:', e)
      showToast('error', 'Failed to delete')
    }
  }

  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim()) { showToast('error', 'Enter a category name'); return }
    setIsSubmitting(true)
    try {
      if (selectedCategory) {
        await updateCategory(selectedCategory.id, { name: categoryForm.name.trim(), description: categoryForm.description.trim() })
      } else {
        await createCategory(categoryForm.name.trim(), categoryForm.description.trim())
      }
      showToast('success', selectedCategory ? 'Category updated!' : 'Category created!')
      resetCategoryForm()
      setView('categories')
      loadData()
    } catch (e) { showToast('error', 'Failed to save') }
    finally { setIsSubmitting(false) }
  }

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id)
      showToast('success', 'Category deleted!')
      setDeleteConfirm(null)
      loadData()
    } catch (e) { showToast('error', 'Failed to delete') }
  }

  const handleEditCategory = (category: MediaCategory) => {
    setSelectedCategory(category)
    setCategoryForm({ name: category.name, description: category.description || '' })
    setView('edit-category')
  }

  const handleEditPlaylist = (playlist: AdminPlaylist) => {
    setSelectedPlaylist(playlist)
    setPlaylistForm({ name: playlist.name, description: playlist.description || '', isPublic: playlist.isPublic, isFeatured: playlist.isFeatured, forHQ: playlist.forHQ })
    setView('edit-playlist')
  }

  const handleToggleVideoInPlaylist = async (videoId: string) => {
    if (!selectedPlaylist) return
    try {
      const isIn = selectedPlaylist.videoIds.includes(videoId)
      if (isIn) {
        await removeVideoFromPlaylist(selectedPlaylist.id, videoId)
        setSelectedPlaylist({ ...selectedPlaylist, videoIds: selectedPlaylist.videoIds.filter(id => id !== videoId) })
      } else {
        await addVideoToPlaylist(selectedPlaylist.id, videoId)
        setSelectedPlaylist({ ...selectedPlaylist, videoIds: [...selectedPlaylist.videoIds, videoId] })
      }
      loadData()
    } catch (e) { showToast('error', 'Failed to update') }
  }

  const openCloudinaryWidget = (type: 'video' | 'image') => {
    if (typeof window !== 'undefined' && (window as any).cloudinary) {
      (window as any).cloudinary.createUploadWidget({
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
        folder: type === 'video' ? 'media/videos' : 'media/thumbnails',
        resourceType: type === 'video' ? 'video' : 'image',
        maxFileSize: type === 'video' ? 500000000 : 10000000,
        sources: ['local'], multiple: false,
        ...(type === 'video' && {
          upload_transformation: [
            { height: 480, crop: 'limit' },
            { quality: 'auto' }
          ],
          client_allowed_formats: ["mp4", "mov", "avi", "webm"]
        })
      }, (err: any, res: any) => {
        if (!err && res?.event === 'success') {
          if (type === 'video') setVideoForm(p => ({ ...p, videoUrl: res.info.secure_url }))
          else setVideoForm(p => ({ ...p, thumbnail: res.info.secure_url }))
        }
      }).open()
    }
  }

  const filteredVideos = videos.filter(v => v.title.toLowerCase().includes(searchQuery.toLowerCase()))
  const filteredPlaylists = playlists.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
  const getPlaylistThumb = (p: AdminPlaylist) => p.thumbnail || (p.videoIds.length > 0 ? videos.find(v => v.id === p.videoIds[0])?.thumbnail : '') || ''

  // Render toast notification
  const renderToast = () => {
    if (!toast) return null
    return (
      <div className={`fixed top-4 right-4 z-[10000] px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
        {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
        {toast.message}
      </div>
    )
  }

  // Render delete confirmation modal
  const renderDeleteModal = () => {
    if (!deleteConfirm) return null
    return (
      <div
        className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4"
        onClick={() => setDeleteConfirm(null)}
      >
        <div
          className="bg-white rounded-2xl p-6 max-w-sm w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-center mb-2">Delete {deleteConfirm.type}?</h3>
          <p className="text-gray-500 text-center mb-6">"{deleteConfirm.name}"</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setDeleteConfirm(null)
              }}
              className="flex-1 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (deleteConfirm.type === 'video') handleDeleteVideo(deleteConfirm.id)
                else if (deleteConfirm.type === 'playlist') handleDeletePlaylist(deleteConfirm.id)
                else if (deleteConfirm.type === 'category') handleDeleteCategory(deleteConfirm.id)
              }}
              className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ========== VIDEOS LIST ==========
  // ========== RENDER HELPER: SIDEBAR ==========
  const renderSidebar = () => {
    const items = [
      { id: 'videos', label: 'Content', icon: Film, count: videos.length },
      { id: 'playlists', label: 'Playlists', icon: ListVideo, count: playlists.length },
      { id: 'categories', label: 'Categories', icon: Tag, count: categories.length },
    ]

    return (
      <>
        {/* Mobile Backdrop */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90] lg:hidden animate-in fade-in duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar Container */}
        <div className={`
        fixed inset-y-0 left-0 z-[100] lg:sticky lg:top-0 h-screen transition-all duration-300
        ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'} 
        ${isMobileMenuOpen ? 'translate-x-0 w-[240px]' : '-translate-x-full lg:translate-x-0'}
        bg-white border-r border-gray-100 flex flex-col group
      `}>
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full hidden lg:flex items-center justify-center shadow-sm transform transition-all duration-200 z-[110] hover:border-gray-300"
          >
            {isSidebarCollapsed ? <ChevronRight className="w-3 h-3 text-gray-500" /> : <ArrowLeft className="w-3 h-3 text-gray-500" />}
          </button>

          <div className="py-8 h-full flex flex-col overflow-y-auto scrollbar-hide">
            {/* Logo area */}
            <div className="flex items-center gap-3 mb-10 px-6 min-h-[40px]">
              <div
                className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: zoneColor }}
              >
                <Youtube className="w-5 h-5 text-white" />
              </div>
              {(!isSidebarCollapsed || isMobileMenuOpen) && (
                <h1 className="text-lg font-bold text-gray-900 tracking-tight whitespace-nowrap overflow-hidden">
                  Studio
                </h1>
              )}
            </div>

            <nav className="space-y-1 flex-1">
              {items.map((item) => {
                const isActive = view === item.id || (view === 'playlist-detail' && item.id === 'playlists')
                const isCollapsed = isSidebarCollapsed && !isMobileMenuOpen
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setView(item.id as View)
                      setIsMobileMenuOpen(false)
                    }}
                    className={`
                      w-full flex items-center gap-4 px-6 py-3 transition-colors relative
                      ${isActive
                        ? 'font-bold'
                        : 'text-gray-600 hover:bg-gray-50'}
                    `}
                    style={isActive ? {
                      backgroundColor: `${zoneColor}08`,
                      color: zoneColor,
                      borderRight: `3px solid ${zoneColor}`
                    } : {}}
                  >
                    <item.icon
                      className="w-5 h-5 flex-shrink-0"
                      style={isActive ? { color: zoneColor } : { color: '#64748b' }}
                    />
                    {!isCollapsed && (
                      <div className="flex-1 flex items-center justify-between">
                        <span className="text-sm">
                          {item.label}
                        </span>
                        <span
                          className="text-[11px] font-medium px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          style={isActive ? { color: zoneColor } : { color: '#94a3b8' }}
                        >
                          {item.count}
                        </span>
                      </div>
                    )}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>
      </>
    )
  }

  // ========== RENDER HELPER: VIDEOS LIST ==========
  function renderVideosList() {
    const filtered = videos.filter(v => v.title.toLowerCase().includes(searchQuery.toLowerCase()))
    return (
      <div className="p-4 lg:p-8 animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pt-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Channel content</h1>
            <p className="text-sm text-gray-500">Manage your videos and collections</p>
          </div>
          <button
            onClick={() => { resetVideoForm(); setView('add-video') }}
            className="px-4 py-2 hover:opacity-90 text-white rounded font-medium transition-all flex items-center gap-2 shadow-sm"
            style={{ backgroundColor: zoneColor }}
          >
            <Plus className="w-5 h-5" /> CREATE
          </button>
        </div>

        <div className="bg-white border border-gray-200 p-1 rounded-lg mb-6 shadow-sm flex flex-col md:flex-row gap-2">
          <div className="relative flex-1 group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-colors"
              style={{ color: searchQuery ? zoneColor : undefined }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by title or description..."
              className="w-full pl-10 pr-4 py-2 bg-transparent rounded-lg focus:outline-none transition-all text-sm text-gray-700 placeholder:text-gray-400"
              onFocus={(e) => e.currentTarget.parentElement?.querySelector('svg')?.setAttribute('style', `color: ${zoneColor}`)}
              onBlur={(e) => !searchQuery && e.currentTarget.parentElement?.querySelector('svg')?.removeAttribute('style')}
            />
          </div>
          {/* View Toggle */}
          <div className="flex gap-1 bg-gray-50 rounded p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded transition-all ${viewMode === 'table'
                ? 'bg-white shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
                }`}
              style={viewMode === 'table' ? { color: zoneColor } : {}}
              title="Table view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-all ${viewMode === 'grid'
                ? 'bg-white shadow-sm'
                : 'text-gray-400 hover:text-gray-600'
                }`}
              style={viewMode === 'grid' ? { color: zoneColor } : {}}
              title="Grid view"
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center"><CustomLoader message="Loading..." /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white/30 rounded-[40px] border-2 border-dashed border-slate-200">
            <Film className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-400">No videos found</h3>
          </div>
        ) : viewMode === 'table' ? (
          // TABLE VIEW (YouTube Studio Style)
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            {/* Table Header */}
            <div className="grid grid-cols-[40px_100px_1fr_100px_100px_100px_60px] gap-3 px-4 py-3 bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedVideoIds.length === filtered.length && filtered.length > 0}
                  onChange={(e) => setSelectedVideoIds(e.target.checked ? filtered.map(v => v.id) : [])}
                  className="w-4 h-4 rounded border-gray-300 focus:ring-offset-0"
                  style={{ accentColor: zoneColor }}
                />
              </div>
              <div>Video</div>
              <div>Title</div>
              <div>Visibility</div>
              <div>Collections</div>
              <div>Date</div>
              <div className="text-right">Actions</div>
            </div>
            {/* Table Rows */}
            {filtered.map(video => {
              const isSelected = selectedVideoIds.includes(video.id)
              const videoPlaylists = playlists.filter(p => p.videoIds.includes(video.id))
              return (
                <div
                  key={video.id}
                  className={`grid grid-cols-[40px_100px_1fr_100px_100px_100px_60px] gap-3 px-4 py-2 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 items-center`}
                  style={isSelected ? { backgroundColor: `${zoneColor}08` } : {}}
                >
                  <div>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        setSelectedVideoIds(prev => e.target.checked ? [...prev, video.id] : prev.filter(id => id !== video.id))
                      }}
                      className="w-4 h-4 rounded border-gray-300 focus:ring-offset-0"
                      style={{ accentColor: zoneColor }}
                    />
                  </div>
                  <div className="relative aspect-video rounded overflow-hidden border border-gray-200 bg-gray-100">
                    <img src={video.thumbnail} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{video.title}</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider truncate">{video.type}</div>
                  </div>
                  <div>
                    <span
                      className="px-2 py-0.5 text-[8px] font-bold uppercase rounded border"
                      style={{
                        backgroundColor: `${zoneColor}10`,
                        color: zoneColor,
                        borderColor: `${zoneColor}20`
                      }}
                    >Public</span>
                  </div>
                  <div className="text-[10px] font-medium text-gray-500">
                    {videoPlaylists.length > 0 ? `${videoPlaylists.length} Collections` : '—'}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    {video.createdAt ? new Date(video.createdAt).toLocaleDateString() : 'N/A'}
                  </div>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleEditVideo(video)}
                      className="p-2 hover:bg-gray-100 text-gray-400 rounded transition-colors"
                      style={{ color: 'inherit' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = zoneColor}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}
                      title="Edit details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setDeleteConfirm({ type: 'video', id: video.id, name: video.title })} className="p-2 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded transition-colors" title="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          // GRID VIEW (Original)
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
            {filtered.map(video => {
              const isSelected = selectedVideoIds.includes(video.id)
              return (
                <div
                  key={video.id}
                  className={`group bg-white rounded-lg border transition-all duration-200 overflow-hidden flex flex-col shadow-sm hover:shadow-md ${isSelected ? 'ring-2 border-transparent' : 'border-gray-200'}`}
                  style={isSelected ? { '--tw-ring-color': zoneColor, borderColor: zoneColor } as any : {}}
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedVideoIds(prev => prev.includes(video.id) ? prev.filter(id => id !== video.id) : [...prev, video.id])
                      }}
                      className={`absolute top-2 left-2 z-10 w-6 h-6 rounded border flex items-center justify-center transition-all duration-200 ${isSelected ? 'shadow-sm' : 'bg-black/20 border-white/40 opacity-0 group-hover:opacity-100'}`}
                      style={isSelected ? { backgroundColor: zoneColor, borderColor: zoneColor } : {}}
                    >
                      {isSelected && <Check className="w-4 h-4 text-white" />}
                    </button>

                    {video.isYouTube && (
                      <div
                        className="absolute top-2 right-2 px-2 py-0.5 text-white text-[9px] font-bold rounded flex items-center gap-1 shadow-sm"
                        style={{ backgroundColor: zoneColor }}
                      >
                        <Youtube className="w-3 h-3" /> YOUTUBE
                      </div>
                    )}
                  </div>

                  <div className="p-3 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[8px] font-bold uppercase tracking-wider rounded border border-gray-200">{video.type}</span>
                    </div>

                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight mb-4">{video.title}</h3>

                    <div className="mt-auto flex items-center gap-2 pt-3 border-t border-gray-100">
                      <button onClick={() => handleEditVideo(video)} className="flex-1 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded text-[10px] font-bold transition-all flex items-center justify-center gap-2">
                        <Edit2 className="w-3 h-3" /> DETAILS
                      </button>
                      <button onClick={() => setDeleteConfirm({ type: 'video', id: video.id, name: video.title })} className="w-8 h-8 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded flex items-center justify-center transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // ========== MAIN COMPONENT RENDER ==========
  return (
    <div className="h-full flex bg-[#f8fafc] overflow-hidden">
      {renderToast()}
      {renderDeleteModal()}
      {renderSidebar()}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-purple-200/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 -left-40 w-[600px] h-[600px] bg-indigo-100/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="flex-1 flex flex-col relative overflow-hidden bg-slate-50/50">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between p-4 bg-white/60 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-20">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-3 bg-purple-600 text-white rounded-2xl shadow-lg shadow-purple-600/30"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-sm font-black text-slate-900 tracking-tightest italic uppercase">Video Manager</h2>
            <div className="w-12" /> {/* Spacer */}
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {(() => {
              if (view === 'videos') return renderVideosList()
              if (view === 'playlists') return renderPlaylistsList()
              if (view === 'categories') return renderCategoriesList()
              if (view === 'add-video' || view === 'edit-video') return renderVideoForm()
              if (view === 'add-playlist' || view === 'edit-playlist') return renderPlaylistForm()
              if (view === 'playlist-detail') return renderPlaylistDetail()
              if (view === 'add-category' || view === 'edit-category') return renderCategoryForm()
              return null
            })()}
          </div>
        </div>

        {selectedVideoIds.length > 0 && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in zoom-in slide-in-from-bottom-10 duration-500">
            <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 px-8 py-5 rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] flex items-center gap-8 text-white relative">
              <div className="flex items-center gap-4 pr-8 border-r border-white/10">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black shadow-lg"
                  style={{ backgroundColor: zoneColor, boxShadow: `0 10px 15px -3px ${zoneColor}60` }}
                >
                  {selectedVideoIds.length}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Selected</span>
                  <span className="text-sm font-black">Video{selectedVideoIds.length > 1 ? 's' : ''}</span>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <button
                    onClick={() => setIsBulkPlaylistOpen(!isBulkPlaylistOpen)}
                    className={`flex items-center gap-2.5 text-sm font-black transition-all group`}
                    style={{ color: isBulkPlaylistOpen ? zoneColor : undefined }}
                  >
                    <ListVideo
                      className="w-5 h-5 group-hover:scale-110 transition-transform"
                      style={{ color: zoneColor }}
                    /> Add to Playlist
                  </button>

                  {isBulkPlaylistOpen && (
                    <div className="absolute bottom-full mb-6 left-0 w-64 bg-slate-800 rounded-[24px] border border-white/10 shadow-2xl p-2 animate-in fade-in slide-in-from-bottom-2">
                      <div className="max-h-60 overflow-y-auto scrollbar-hide">
                        {playlists.length === 0 ? (
                          <p className="p-4 text-xs font-bold text-slate-500 text-center">No playlists found</p>
                        ) : (
                          playlists.map(p => (
                            <button
                              key={p.id}
                              onClick={() => handleBulkAddToPlaylist(p.id)}
                              className="w-full text-left p-3 hover:bg-white/5 rounded-xl text-xs font-black uppercase tracking-tight transition-colors flex items-center gap-3"
                            >
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: zoneColor }} /> {p.name}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2.5 text-sm font-black hover:text-red-400 transition-colors group"
                >
                  <Trash2 className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" /> Delete Batch
                </button>
              </div>
              <button onClick={() => { setSelectedVideoIds([]); setIsBulkPlaylistOpen(false) }} className="ml-4 w-10 h-10 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  function renderPlaylistsList() {
    const filtered = playlists.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    return (
      <div className="p-4 lg:p-8 animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pt-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Playlists</h1>
            <p className="text-sm text-gray-500">Group your videos into theme-based collections</p>
          </div>
          <button
            onClick={() => { resetPlaylistForm(); setView('add-playlist') }}
            className="px-4 py-2 hover:opacity-90 text-white rounded font-medium transition-all flex items-center gap-2 shadow-sm"
            style={{ backgroundColor: zoneColor }}
          >
            <Plus className="w-5 h-5" /> NEW PLAYLIST
          </button>
        </div>

        <div className="bg-white border border-gray-200 p-1 rounded-lg mb-6 shadow-sm flex flex-col md:flex-row gap-2">
          <div className="relative flex-1 group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-colors"
              style={{ color: searchQuery ? zoneColor : undefined }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search playlists..."
              className="w-full pl-10 pr-4 py-2 bg-transparent rounded-lg focus:outline-none transition-all text-sm text-gray-700 placeholder:text-gray-400"
              onFocus={(e) => e.currentTarget.parentElement?.querySelector('svg')?.setAttribute('style', `color: ${zoneColor}`)}
              onBlur={(e) => !searchQuery && e.currentTarget.parentElement?.querySelector('svg')?.removeAttribute('style')}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center"><CustomLoader message="Loading playlists..." /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <ListVideo className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-400">No playlists found</h3>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            {/* Table Header */}
            <div className="grid grid-cols-[100px_1fr_100px_100px_120px_80px] gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              <div>Playlist</div>
              <div>Title</div>
              <div>Visibility</div>
              <div>Videos</div>
              <div>Last updated</div>
              <div className="text-right">Actions</div>
            </div>
            {/* Table Rows */}
            {filtered.map(playlist => {
              const thumb = getPlaylistThumb(playlist)
              return (
                <div
                  key={playlist.id}
                  onClick={() => { setSelectedPlaylist(playlist); setView('playlist-detail') }}
                  className="grid grid-cols-[100px_1fr_100px_100px_120px_80px] gap-4 px-6 py-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 items-center cursor-pointer group"
                >
                  <div className="relative aspect-video rounded overflow-hidden border border-gray-200 bg-gray-100">
                    {thumb ? (
                      <img src={thumb} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <ListVideo className="w-6 h-6" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <ListVideo className="w-4 h-4 mb-1" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-gray-900 truncate">{playlist.name}</div>
                    <div className="text-[10px] text-gray-400 line-clamp-1">{playlist.description || 'No description'}</div>
                  </div>
                  <div>
                    <span className={`px-2 py-0.5 text-[8px] font-bold uppercase rounded border ${playlist.isPublic ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                      {playlist.isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>
                  <div className="text-[11px] font-medium text-gray-600">
                    {playlist.videoIds.length} video{playlist.videoIds.length !== 1 ? 's' : ''}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    {playlist.createdAt ? new Date(playlist.createdAt).toLocaleDateString() : 'N/A'}
                  </div>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEditPlaylist(playlist) }}
                      className="p-2 hover:bg-gray-100 text-gray-400 rounded transition-colors"
                      style={{ color: 'inherit' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = zoneColor}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}
                      title="Edit playlist"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteConfirm({ type: 'playlist', id: playlist.id, name: playlist.name }) }}
                      className="p-2 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  function renderCategoriesList() {
    return (
      <div className="p-4 lg:p-8 animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pt-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
            <p className="text-sm text-gray-500">Define labels for organizing your content</p>
          </div>
          <button
            onClick={() => { resetCategoryForm(); setView('add-category') }}
            className="px-4 py-2 hover:opacity-90 text-white rounded font-medium transition-all flex items-center gap-2 shadow-sm"
            style={{ backgroundColor: zoneColor }}
          >
            <Plus className="w-5 h-5" /> NEW CATEGORY
          </button>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center"><CustomLoader message="Loading categories..." /></div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-400">No categories found</h3>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            {/* Table Header */}
            <div className="grid grid-cols-[1fr_200px_80px] gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              <div>Category Name</div>
              <div>Slug</div>
              <div className="text-right">Actions</div>
            </div>
            {/* Table Rows */}
            {categories.map(category => (
              <div key={category.id} className="grid grid-cols-[1fr_200px_80px] gap-4 px-6 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 items-center">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 bg-gray-50 text-gray-400 rounded flex items-center justify-center flex-shrink-0">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900 truncate">{category.name}</div>
                    <div className="text-[10px] text-gray-400 truncate">{category.description || 'No description'}</div>
                  </div>
                </div>
                <div className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{category.slug}</div>
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => handleEditCategory(category)}
                    className="p-2 hover:bg-gray-100 text-gray-400 rounded transition-colors"
                    style={{ color: 'inherit' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = zoneColor}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setDeleteConfirm({ type: 'category', id: category.id, name: category.name })} className="p-2 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  function renderVideoForm() {
    return (
      <div className="p-4 lg:p-8 animate-in fade-in duration-700">
        <button
          onClick={() => { resetVideoForm(); setView('videos') }}
          className="flex items-center gap-2 text-gray-400 mb-8 group transition-colors"
          onMouseEnter={(e) => e.currentTarget.style.color = zoneColor}
          onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold uppercase tracking-widest text-[11px]">Back to Content</span>
        </button>

        <div className="flex items-center gap-6 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{selectedVideo ? 'Video details' : 'Upload video'}</h1>
            <p className="text-sm text-gray-500">Fill in the details below to publish your video</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          {/* Left Column: Media */}
          <div className="lg:col-span-1 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Thumbnail</label>
              <div
                onClick={() => openCloudinaryWidget('image')}
                className="relative aspect-video bg-gray-50 rounded border border-gray-200 transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center group"
                style={{ '--tw-border-opacity': '1' } as any}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = zoneColor}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = ''}
              >
                {videoForm.thumbnail ? (
                  <>
                    <img src={videoForm.thumbnail} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Upload className="w-8 h-8 text-white" />
                    </div>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-300 mb-2" />
                    <p className="text-xs font-medium text-gray-400">Upload thumbnail</p>
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Video Source</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setVideoForm(p => ({ ...p, isYouTube: true, videoUrl: '', thumbnail: '' }))}
                  className={`py-3 rounded border text-xs font-bold transition-all flex flex-col items-center gap-2`}
                  style={videoForm.isYouTube
                    ? { borderColor: zoneColor, backgroundColor: `${zoneColor}10`, color: zoneColor }
                    : { borderColor: '#E5E7EB', backgroundColor: 'white', color: '#9CA3AF' }}
                >
                  <Youtube className="w-5 h-5" />
                  YOUTUBE
                </button>
                <button
                  onClick={() => setVideoForm(p => ({ ...p, isYouTube: false, videoUrl: '', thumbnail: '' }))}
                  className={`py-3 rounded border text-xs font-bold transition-all flex flex-col items-center gap-2`}
                  style={!videoForm.isYouTube
                    ? { borderColor: zoneColor, backgroundColor: `${zoneColor}10`, color: zoneColor }
                    : { borderColor: '#E5E7EB', backgroundColor: 'white', color: '#9CA3AF' }}
                >
                  <Cloud className="w-5 h-5" />
                  DIRECT
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                {videoForm.isYouTube ? 'Video link' : 'Video file'}
              </label>
              {videoForm.isYouTube ? (
                <div className="relative">
                  <input
                    type="url"
                    value={videoForm.videoUrl}
                    onChange={(e) => handleVideoUrlChange(e.target.value)}
                    placeholder="Paste YouTube link here..."
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded focus:outline-none text-sm font-medium"
                    style={{ '--tw-ring-color': zoneColor } as any}
                    onFocus={(e) => e.currentTarget.style.borderColor = zoneColor}
                    onBlur={(e) => e.currentTarget.style.borderColor = ''}
                  />
                </div>
              ) : (
                <div
                  onClick={() => !videoForm.videoUrl && openCloudinaryWidget('video')}
                  className={`p-4 rounded border flex items-center gap-4 transition-all cursor-pointer ${videoForm.videoUrl ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}
                  onMouseEnter={(e) => !videoForm.videoUrl && (e.currentTarget.style.borderColor = zoneColor)}
                  onMouseLeave={(e) => !videoForm.videoUrl && (e.currentTarget.style.borderColor = '')}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${videoForm.videoUrl ? 'bg-green-100 text-green-600' : 'bg-white text-gray-400 border border-gray-200'}`}>
                    {videoForm.videoUrl ? <Check className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${videoForm.videoUrl ? 'text-green-700' : 'text-gray-700'}`}>
                      {videoForm.videoUrl ? 'Video uploaded' : 'Click to upload video'}
                    </p>
                    <p className="text-[10px] text-gray-500">MP4 recommended</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Title (required)</label>
              <input
                type="text"
                value={videoForm.title}
                onChange={(e) => setVideoForm(p => ({ ...p, title: e.target.value }))}
                placeholder="Add a title that describes your video"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded focus:outline-none text-sm font-medium"
                style={{ '--tw-ring-color': zoneColor } as any}
                onFocus={(e) => e.currentTarget.style.borderColor = zoneColor}
                onBlur={(e) => e.currentTarget.style.borderColor = ''}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Description</label>
              <textarea
                value={videoForm.description}
                onChange={(e) => setVideoForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Tell viewers about your video"
                rows={4}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded focus:outline-none text-sm font-medium resize-none"
                style={{ '--tw-ring-color': zoneColor } as any}
                onFocus={(e) => e.currentTarget.style.borderColor = zoneColor}
                onBlur={(e) => e.currentTarget.style.borderColor = ''}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Category</label>
                <select
                  value={videoForm.type}
                  onChange={(e) => setVideoForm(p => ({ ...p, type: e.target.value }))}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded focus:outline-none text-sm font-medium"
                  style={{ '--tw-ring-color': zoneColor } as any}
                  onFocus={(e) => e.currentTarget.style.borderColor = zoneColor}
                  onBlur={(e) => e.currentTarget.style.borderColor = ''}
                >
                  {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Collections</label>
                <div className="bg-gray-50 border border-gray-200 rounded p-3 max-h-40 overflow-y-auto space-y-1">
                  {playlists.length === 0 ? (
                    <p className="text-[10px] text-gray-400 italic">No collections available</p>
                  ) : (
                    playlists.map(playlist => {
                      const isSelected = videoForm.playlistIds.includes(playlist.id)
                      return (
                        <label key={playlist.id} className="flex items-center gap-2 p-1 hover:bg-white rounded cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) setVideoForm(p => ({ ...p, playlistIds: [...p.playlistIds, playlist.id] }))
                              else setVideoForm(p => ({ ...p, playlistIds: p.playlistIds.filter(id => id !== playlist.id) }))
                            }}
                            className="w-3.5 h-3.5 rounded border-gray-300 focus:ring-offset-0"
                            style={{ accentColor: zoneColor }}
                          />
                          <span className="text-sm font-medium text-gray-700">{playlist.name}</span>
                        </label>
                      )
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={videoForm.featured} onChange={(e) => setVideoForm(p => ({ ...p, featured: e.target.checked }))} className="w-4 h-4 rounded border-gray-300 focus:ring-offset-0" style={{ accentColor: zoneColor }} />
                <span className="text-sm font-medium text-gray-700">Featured Video</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={videoForm.forHQ} onChange={(e) => setVideoForm(p => ({ ...p, forHQ: e.target.checked }))} className="w-4 h-4 rounded border-gray-300 focus:ring-offset-0" style={{ accentColor: zoneColor }} />
                <span className="text-sm font-medium text-gray-700">HQ Zones Only</span>
              </label>

              {/* Notify Users Checkbox (Only for new videos) */}
              {!selectedVideo && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={videoForm.notifyUsers}
                    onChange={(e) => setVideoForm(p => ({ ...p, notifyUsers: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 focus:ring-offset-0"
                    style={{ accentColor: zoneColor }}
                  />
                  <span className="text-sm font-medium text-gray-700 italic">Notify Users via Push</span>
                </label>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => { resetVideoForm(); setView('videos') }}
                className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded text-sm font-bold transition-colors"
                disabled={isSubmitting}
              >
                CANCEL
              </button>
              <button
                onClick={handleSaveVideo}
                disabled={isSubmitting || !videoForm.title || !videoForm.videoUrl}
                className="px-6 py-2 text-white rounded text-sm font-bold shadow-sm transition-all disabled:opacity-50"
                style={{ backgroundColor: !isSubmitting && videoForm.title && videoForm.videoUrl ? zoneColor : '#9CA3AF' }}
              >
                {isSubmitting ? 'SAVING...' : selectedVideo ? 'SAVE' : 'PUBLISH'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  function renderPlaylistForm() {
    return (
      <div className="p-4 lg:p-8 animate-in fade-in duration-700">
        <button
          onClick={() => { resetPlaylistForm(); setView('playlists') }}
          className="flex items-center gap-2 text-gray-400 mb-8 group transition-colors"
          onMouseEnter={(e) => e.currentTarget.style.color = zoneColor}
          onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold uppercase tracking-widest text-[11px]">Back to Playlists</span>
        </button>

        <div className="flex items-center gap-6 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{selectedPlaylist ? 'Edit playlist' : 'New playlist'}</h1>
            <p className="text-sm text-gray-500">Group your videos into theme-based groups</p>
          </div>
        </div>

        <div className="max-w-2xl bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Playlist Name</label>
            <input
              type="text"
              value={playlistForm.name}
              onChange={(e) => setPlaylistForm(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g., Sunday Service Highlights"
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded focus:outline-none text-sm font-bold transition-colors"
              style={{ '--tw-ring-color': zoneColor } as any}
              onFocus={(e) => e.currentTarget.style.borderColor = zoneColor}
              onBlur={(e) => e.currentTarget.style.borderColor = ''}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Description</label>
            <textarea
              value={playlistForm.description}
              onChange={(e) => setPlaylistForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Tell viewers what's in this playlist"
              rows={4}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded focus:outline-none text-sm font-medium resize-none transition-colors"
              style={{ '--tw-ring-color': zoneColor } as any}
              onFocus={(e) => e.currentTarget.style.borderColor = zoneColor}
              onBlur={(e) => e.currentTarget.style.borderColor = ''}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded cursor-pointer group hover:border-blue-400 transition-colors">
              <input type="checkbox" checked={playlistForm.isPublic} onChange={(e) => setPlaylistForm(p => ({ ...p, isPublic: e.target.checked }))} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <div>
                <p className="text-xs font-bold text-gray-700">Public Access</p>
                <p className="text-[10px] text-gray-500">Visible to everyone</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded cursor-pointer group hover:border-blue-400 transition-colors">
              <input type="checkbox" checked={playlistForm.isFeatured} onChange={(e) => setPlaylistForm(p => ({ ...p, isFeatured: e.target.checked }))} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <div>
                <p className="text-xs font-bold text-gray-700">Featured</p>
                <p className="text-[10px] text-gray-500">Show at top of library</p>
              </div>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={() => { resetPlaylistForm(); setView('playlists') }}
              className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded text-sm font-bold transition-colors"
              disabled={isSubmitting}
            >
              CANCEL
            </button>
            <button
              onClick={handleSavePlaylist}
              disabled={isSubmitting || !playlistForm.name}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-bold shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'SAVING...' : selectedPlaylist ? 'SAVE' : 'CREATE'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  function renderPlaylistDetail() {
    if (!selectedPlaylist) return null
    return (
      <div className="p-4 lg:p-8 animate-in fade-in duration-700">
        <div className="max-w-6xl mx-auto">
          <button onClick={() => { setSelectedPlaylist(null); setView('playlists') }} className="flex items-center gap-2 text-gray-400 hover:text-blue-600 mb-8 group transition-colors">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold uppercase tracking-widest text-[11px]">Back to Playlists</span>
          </button>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Playlist Sidebar */}
            <div className="w-full md:w-80 flex-shrink-0">
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <div className="relative aspect-video">
                  {getPlaylistThumb(selectedPlaylist) ? (
                    <img src={getPlaylistThumb(selectedPlaylist)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300 border-b border-gray-100">
                      <ListVideo className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/10" />
                </div>
                <div className="p-6">
                  <h1 className="text-xl font-bold text-gray-900 mb-2">{selectedPlaylist.name}</h1>
                  <p className="text-sm text-gray-500 mb-6 leading-relaxed">{selectedPlaylist.description || 'No description'}</p>

                  <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
                    <span className="flex items-center gap-1.5"><Film className="w-3.5 h-3.5" style={{ color: zoneColor }} /> {selectedPlaylist.videoIds.length} Videos</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditPlaylist(selectedPlaylist)}
                      className="flex-1 py-2 bg-gray-50 text-gray-700 rounded text-xs font-bold transition-colors flex items-center justify-center gap-2 border border-gray-100"
                      onMouseEnter={(e) => e.currentTarget.style.color = zoneColor}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}
                    >
                      <Edit2 className="w-3.5 h-3.5" /> EDIT
                    </button>
                    <button onClick={() => setDeleteConfirm({ type: 'playlist', id: selectedPlaylist.id, name: selectedPlaylist.name })} className="w-10 h-10 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded flex items-center justify-center transition-colors border border-gray-100">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Video List Management */}
            <div className="flex-1">
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Manage Playlist Content</h3>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filter videos..."
                      className="w-full pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded text-xs focus:outline-none transition-colors"
                      style={{ '--tw-ring-color': zoneColor } as any}
                      onFocus={(e) => e.currentTarget.style.borderColor = zoneColor}
                      onBlur={(e) => e.currentTarget.style.borderColor = ''}
                    />
                  </div>
                </div>

                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto scrollbar-hide">
                  {filteredVideos.map(video => {
                    const isIn = selectedPlaylist.videoIds.includes(video.id)
                    return (
                      <div
                        key={video.id}
                        onClick={() => handleToggleVideoInPlaylist(video.id)}
                        className={`p-2 rounded border transition-all cursor-pointer flex items-center gap-3 group`}
                        style={isIn
                          ? { borderColor: zoneColor, backgroundColor: `${zoneColor}08` }
                          : { borderColor: '#F3F4F6', backgroundColor: '#F9FAFB99' }}
                      >
                        <div
                          className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 transition-all ${isIn ? 'text-white' : 'bg-white text-gray-300 border border-gray-200 shadow-sm'}`}
                          style={isIn ? { backgroundColor: zoneColor } : {}}
                        >
                          {isIn ? <Check className="w-5 h-5" /> : <Plus className="w-4 h-4" />}
                        </div>
                        <div className="w-14 aspect-video rounded overflow-hidden flex-shrink-0 border border-gray-200">
                          <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-[11px] font-bold truncate`} style={isIn ? { color: darkenColor(zoneColor, 40) } : { color: '#374151' }}>{video.title}</h4>
                          <p className="text-[9px] text-gray-400 uppercase font-bold tracking-wider">{video.type}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  function renderCategoryForm() {
    return (
      <div className="p-4 lg:p-8 animate-in fade-in duration-700">
        <button
          onClick={() => { resetCategoryForm(); setView('categories') }}
          className="flex items-center gap-2 text-gray-400 mb-8 group transition-colors"
          onMouseEnter={(e) => e.currentTarget.style.color = zoneColor}
          onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold uppercase tracking-widest text-[11px]">Back to Categories</span>
        </button>

        <div className="flex items-center gap-6 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{selectedCategory ? 'Edit category' : 'New category'}</h1>
            <p className="text-sm text-gray-500">Define labels for organizing your content</p>
          </div>
        </div>

        <div className="max-w-xl bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Category Name</label>
            <input
              type="text"
              value={categoryForm.name}
              onChange={(e) => setCategoryForm(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g., Praise & Thanksgiving"
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded focus:outline-none text-sm font-bold transition-colors"
              style={{ '--tw-ring-color': zoneColor } as any}
              onFocus={(e) => e.currentTarget.style.borderColor = zoneColor}
              onBlur={(e) => e.currentTarget.style.borderColor = ''}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Description</label>
            <textarea
              value={categoryForm.description}
              onChange={(e) => setCategoryForm(p => ({ ...p, description: e.target.value }))}
              placeholder="What defines this genre?"
              rows={3}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded focus:outline-none text-sm font-medium resize-none transition-colors"
              style={{ '--tw-ring-color': zoneColor } as any}
              onFocus={(e) => e.currentTarget.style.borderColor = zoneColor}
              onBlur={(e) => e.currentTarget.style.borderColor = ''}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              onClick={() => { resetCategoryForm(); setView('categories') }}
              className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded text-sm font-bold transition-colors"
              disabled={isSubmitting}
            >
              CANCEL
            </button>
            <button
              onClick={handleSaveCategory}
              disabled={isSubmitting || !categoryForm.name}
              className="px-6 py-2 text-white rounded text-sm font-bold shadow-sm transition-all disabled:opacity-50"
              style={{ backgroundColor: !isSubmitting && categoryForm.name ? zoneColor : '#9CA3AF' }}
            >
              {isSubmitting ? 'SAVING...' : selectedCategory ? 'SAVE' : 'CREATE'}
            </button>
          </div>
        </div>
      </div>
    )
  }
}
