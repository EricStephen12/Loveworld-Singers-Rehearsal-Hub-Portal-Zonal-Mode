'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { 
  Upload, Film, X, Trash2, Edit2, 
  Youtube, Cloud, Check, Eye, Heart,
  Plus, ListVideo, Globe, Star, Search, 
  CheckCircle, XCircle, ArrowLeft, ChevronRight, Tag
} from 'lucide-react'
import { mediaVideosService, MediaVideo } from '@/lib/media-videos-service'
import { extractYouTubeVideoId, getYouTubeThumbnail } from '@/utils/youtube'
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

type View = 'videos' | 'playlists' | 'categories' | 'add-video' | 'edit-video' | 'add-playlist' | 'edit-playlist' | 'playlist-detail' | 'add-category' | 'edit-category'

export default function MediaUploadSection() {
  const { user, profile } = useAuth()
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
  
  const [videoForm, setVideoForm] = useState({
    title: '', description: '', videoUrl: '', thumbnail: '',
    type: 'praise', featured: false, forHQ: true, isYouTube: true
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

  const resetVideoForm = () => {
    setVideoForm({ title: '', description: '', videoUrl: '', thumbnail: '', type: 'praise', featured: false, forHQ: true, isYouTube: true })
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
      
      if (selectedVideo) await mediaVideosService.update(selectedVideo.id, data)
      else await mediaVideosService.create(data)
      
      showToast('success', selectedVideo ? 'Video updated!' : 'Video added!')
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
    setSelectedVideo(video)
    setVideoForm({
      title: video.title, description: video.description || '',
      videoUrl: video.youtubeUrl || video.videoUrl || '', thumbnail: video.thumbnail,
      type: video.type, featured: video.featured, forHQ: video.forHQ !== false, isYouTube: video.isYouTube
    })
    setView('edit-video')
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
      loadData()
    } catch (e) { showToast('error', 'Failed to delete') }
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

  const Toast = () => toast && (
    <div className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
      {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
      {toast.message}
    </div>
  )

  const DeleteModal = () => deleteConfirm && (
    <div className="fixed inset-0 bg-black/50 z-[80] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="text-lg font-bold text-center mb-2">Delete {deleteConfirm.type}?</h3>
        <p className="text-gray-500 text-center mb-6">"{deleteConfirm.name}"</p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl font-medium transition-colors">Cancel</button>
          <button onClick={() => {
            if (deleteConfirm.type === 'video') handleDeleteVideo(deleteConfirm.id)
            else if (deleteConfirm.type === 'playlist') handleDeletePlaylist(deleteConfirm.id)
            else if (deleteConfirm.type === 'category') handleDeleteCategory(deleteConfirm.id)
          }} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors">Delete</button>
        </div>
      </div>
    </div>
  )

  // ========== VIDEOS LIST ==========
  if (view === 'videos') {
    return (
      <div className="h-full overflow-auto bg-gray-50 p-4 lg:p-6">
        <Toast /><DeleteModal />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Media</h1>
          <button onClick={() => { resetVideoForm(); setView('add-video') }} className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700">
            <Plus className="w-5 h-5" />Add Video
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl font-medium">
            <Film className="w-4 h-4" />Videos ({videos.length})
          </button>
          <button onClick={() => { setSearchQuery(''); setView('playlists') }} className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 rounded-xl font-medium border border-gray-200 hover:bg-gray-50">
            <ListVideo className="w-4 h-4" />Playlists ({playlists.length})
          </button>
          <button onClick={() => { setSearchQuery(''); setView('categories') }} className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 rounded-xl font-medium border border-gray-200 hover:bg-gray-50">
            <Tag className="w-4 h-4" />Categories ({categories.length})
          </button>
        </div>
        
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search videos..." className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
        </div>
        
        {/* Content */}
        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-32 h-20 bg-gray-200 rounded-lg" />
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Film className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No videos yet</h3>
            <p className="text-gray-500 mb-4">Add your first video to get started</p>
            <button onClick={() => { resetVideoForm(); setView('add-video') }} className="px-6 py-2.5 bg-purple-600 text-white rounded-xl font-medium">
              Add Video
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredVideos.map(video => (
              <div key={video.id} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <div className="relative w-32 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
                    {video.isYouTube && (
                      <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-red-600 text-white text-[10px] rounded flex items-center gap-0.5">
                        <Youtube className="w-2.5 h-2.5" />YT
                      </div>
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 line-clamp-1">{video.title}</h3>
                      {video.featured && (
                        <span className="flex-shrink-0 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-lg font-medium">
                          Featured
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                      <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{video.views || 0}</span>
                      <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" />{video.likes || 0}</span>
                      <span className="capitalize text-xs bg-gray-100 px-2 py-0.5 rounded">{video.type}</span>
                    </div>
                    
                    {/* Actions - Always visible */}
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleEditVideo(video)} 
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
                      >
                        <Edit2 className="w-3.5 h-3.5" />Edit
                      </button>
                      <button 
                        onClick={() => setDeleteConfirm({ type: 'video', id: video.id, name: video.title })} 
                        className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium"
                      >
                        <Trash2 className="w-3.5 h-3.5" />Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ========== PLAYLISTS LIST ==========
  if (view === 'playlists') {
    return (
      <div className="h-full overflow-auto bg-gray-50 p-4 lg:p-6">
        <Toast /><DeleteModal />
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Media</h1>
          <button onClick={() => { resetPlaylistForm(); setView('add-playlist') }} className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700">
            <Plus className="w-5 h-5" />New Playlist
          </button>
        </div>
        <div className="flex gap-2 mb-6">
          <button onClick={() => { setSearchQuery(''); setView('videos') }} className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 rounded-xl font-medium border border-gray-200 hover:bg-gray-50">
            <Film className="w-4 h-4" />Videos ({videos.length})
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl font-medium">
            <ListVideo className="w-4 h-4" />Playlists ({playlists.length})
          </button>
          <button onClick={() => { setSearchQuery(''); setView('categories') }} className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 rounded-xl font-medium border border-gray-200 hover:bg-gray-50">
            <Tag className="w-4 h-4" />Categories ({categories.length})
          </button>
        </div>
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search playlists..." className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl" />
        </div>
        {filteredPlaylists.length === 0 ? (
          <div className="text-center py-20">
            <ListVideo className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No playlists</h3>
            <button onClick={() => { resetPlaylistForm(); setView('add-playlist') }} className="px-6 py-2.5 bg-purple-600 text-white rounded-xl font-medium">Create Playlist</button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPlaylists.map(playlist => (
              <div key={playlist.id} onClick={() => { setSelectedPlaylist(playlist); setView('playlist-detail') }} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {getPlaylistThumb(playlist) ? <img src={getPlaylistThumb(playlist)} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ListVideo className="w-6 h-6 text-gray-300" /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 line-clamp-1">{playlist.name}</h3>
                      {playlist.isFeatured && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                      {playlist.isPublic && <Globe className="w-4 h-4 text-blue-500" />}
                    </div>
                    <p className="text-sm text-gray-500">{playlist.videoIds.length} videos</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ========== ADD/EDIT VIDEO ==========
  if (view === 'add-video' || view === 'edit-video') {
    return (
      <div className="h-full overflow-auto bg-gray-50 p-4 lg:p-6">
        <Toast />
        <div className="max-w-xl mx-auto">
          <button onClick={() => { resetVideoForm(); setView('videos') }} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft className="w-5 h-5" /><span className="font-medium">Back to Videos</span>
          </button>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-6">{selectedVideo ? 'Edit Video' : 'Add Video'}</h1>
          
          {/* Source Type */}
          {!selectedVideo && (
            <div className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-3">Video Source</label>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setVideoForm(p => ({ ...p, isYouTube: true, videoUrl: '', thumbnail: '' }))} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 ${videoForm.isYouTube ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
                  <Youtube className={`w-8 h-8 ${videoForm.isYouTube ? 'text-red-600' : 'text-gray-400'}`} />
                  <span className={`font-medium ${videoForm.isYouTube ? 'text-red-600' : 'text-gray-600'}`}>YouTube</span>
                </button>
                <button onClick={() => setVideoForm(p => ({ ...p, isYouTube: false, videoUrl: '', thumbnail: '' }))} className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 ${!videoForm.isYouTube ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}>
                  <Cloud className={`w-8 h-8 ${!videoForm.isYouTube ? 'text-purple-600' : 'text-gray-400'}`} />
                  <span className={`font-medium ${!videoForm.isYouTube ? 'text-purple-600' : 'text-gray-600'}`}>Upload</span>
                </button>
              </div>
            </div>
          )}
          
          {/* Video URL */}
          <div className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">{videoForm.isYouTube ? 'YouTube URL' : 'Video File'}</label>
            {videoForm.isYouTube ? (
              <div className="flex gap-2">
                <input type="url" value={videoForm.videoUrl} onChange={(e) => handleVideoUrlChange(e.target.value)} placeholder="https://youtube.com/watch?v=..." className="flex-1 px-4 py-3 border border-gray-200 rounded-xl" />
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      if (navigator.clipboard && navigator.clipboard.readText) {
                        const text = await navigator.clipboard.readText()
                        handleVideoUrlChange(text)
                      } else {
                        alert('Please long-press the input field and select Paste')
                      }
                    } catch (err) {
                      alert('Please long-press the input field and select Paste')
                    }
                  }}
                  className="px-4 py-3 bg-purple-100 text-purple-600 rounded-xl hover:bg-purple-200 transition-colors flex items-center gap-2"
                  title="Paste from clipboard"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>
                  <span className="hidden sm:inline">Paste</span>
                </button>
              </div>
            ) : (
              videoForm.videoUrl ? (
                <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-green-700 flex-1">Video uploaded</span>
                  <button onClick={() => setVideoForm(p => ({ ...p, videoUrl: '' }))} className="text-gray-400"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <button onClick={() => openCloudinaryWidget('video')} className="w-full py-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-400 hover:bg-purple-50">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 font-medium">Click to upload video</p>
                </button>
              )
            )}
          </div>
          
          {/* Thumbnail */}
          <div className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail</label>
            {videoForm.thumbnail ? (
              <div className="relative">
                <img src={videoForm.thumbnail} alt="" className="w-full aspect-video object-cover rounded-xl" />
                <button onClick={() => setVideoForm(p => ({ ...p, thumbnail: '' }))} className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <button onClick={() => openCloudinaryWidget('image')} className="w-full py-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-400 hover:bg-purple-50">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 font-medium">Upload thumbnail</p>
              </button>
            )}
          </div>
          
          {/* Title */}
          <div className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input type="text" value={videoForm.title} onChange={(e) => setVideoForm(p => ({ ...p, title: e.target.value }))} placeholder="Video title" className="w-full px-4 py-3 border border-gray-200 rounded-xl" />
          </div>
          
          {/* Description */}
          <div className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
            <textarea value={videoForm.description} onChange={(e) => setVideoForm(p => ({ ...p, description: e.target.value }))} placeholder="What's this video about?" rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none" />
          </div>
          
          {/* Options */}
          <div className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-3">Options</label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={videoForm.featured} onChange={(e) => setVideoForm(p => ({ ...p, featured: e.target.checked }))} className="w-5 h-5 rounded border-gray-300 text-purple-600" />
                <span className="text-gray-700">Featured video</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={videoForm.forHQ} onChange={(e) => setVideoForm(p => ({ ...p, forHQ: e.target.checked }))} className="w-5 h-5 rounded border-gray-300 text-purple-600" />
                <span className="text-gray-700">For HQ zones only</span>
              </label>
            </div>
          </div>
          
          {/* Save Button */}
          <button onClick={handleSaveVideo} disabled={isSubmitting} className="w-full py-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2">
            <Check className="w-5 h-5" />
            {isSubmitting ? 'Saving...' : selectedVideo ? 'Save Changes' : 'Add Video'}
          </button>
        </div>
      </div>
    )
  }

  // ========== ADD/EDIT PLAYLIST ==========
  if (view === 'add-playlist' || view === 'edit-playlist') {
    return (
      <div className="h-full overflow-auto bg-gray-50 p-4 lg:p-6">
        <Toast />
        <div className="max-w-xl mx-auto">
          <button onClick={() => { resetPlaylistForm(); setView('playlists') }} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft className="w-5 h-5" /><span className="font-medium">Back to Playlists</span>
          </button>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-6">{selectedPlaylist ? 'Edit Playlist' : 'Create Playlist'}</h1>
          
          {/* Name */}
          <div className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">Playlist Name</label>
            <input type="text" value={playlistForm.name} onChange={(e) => setPlaylistForm(p => ({ ...p, name: e.target.value }))} placeholder="My Playlist" className="w-full px-4 py-3 border border-gray-200 rounded-xl" />
          </div>
          
          {/* Description */}
          <div className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
            <textarea value={playlistForm.description} onChange={(e) => setPlaylistForm(p => ({ ...p, description: e.target.value }))} placeholder="What's this playlist about?" rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none" />
          </div>
          
          {/* Options */}
          <div className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-3">Options</label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={playlistForm.isPublic} onChange={(e) => setPlaylistForm(p => ({ ...p, isPublic: e.target.checked }))} className="w-5 h-5 rounded border-gray-300 text-purple-600" />
                <span className="text-gray-700">Public playlist</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={playlistForm.isFeatured} onChange={(e) => setPlaylistForm(p => ({ ...p, isFeatured: e.target.checked }))} className="w-5 h-5 rounded border-gray-300 text-purple-600" />
                <span className="text-gray-700">Featured playlist</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={playlistForm.forHQ} onChange={(e) => setPlaylistForm(p => ({ ...p, forHQ: e.target.checked }))} className="w-5 h-5 rounded border-gray-300 text-purple-600" />
                <span className="text-gray-700">For HQ zones only</span>
              </label>
            </div>
          </div>
          
          {/* Save Button */}
          <button onClick={handleSavePlaylist} disabled={isSubmitting} className="w-full py-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2">
            <Check className="w-5 h-5" />
            {isSubmitting ? 'Saving...' : selectedPlaylist ? 'Save Changes' : 'Create Playlist'}
          </button>
        </div>
      </div>
    )
  }

  // ========== PLAYLIST DETAIL (Add/Remove Videos) ==========
  if (view === 'playlist-detail' && selectedPlaylist) {
    return (
      <div className="h-full overflow-auto bg-gray-50 p-4 lg:p-6">
        <Toast /><DeleteModal />
        <div className="max-w-3xl mx-auto">
          <button onClick={() => { setSelectedPlaylist(null); setSearchQuery(''); setView('playlists') }} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft className="w-5 h-5" /><span className="font-medium">Back to Playlists</span>
          </button>
          
          {/* Playlist Header */}
          <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-24 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {getPlaylistThumb(selectedPlaylist) ? <img src={getPlaylistThumb(selectedPlaylist)} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ListVideo className="w-8 h-8 text-gray-300" /></div>}
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-gray-900 mb-1">{selectedPlaylist.name}</h1>
                <p className="text-sm text-gray-500">{selectedPlaylist.videoIds.length} videos in this playlist</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEditPlaylist(selectedPlaylist)} className="p-2 hover:bg-gray-100 rounded-lg" title="Edit">
                  <Edit2 className="w-5 h-5 text-gray-500" />
                </button>
                <button onClick={() => setDeleteConfirm({ type: 'playlist', id: selectedPlaylist.id, name: selectedPlaylist.name })} className="p-2 hover:bg-red-50 rounded-lg" title="Delete">
                  <Trash2 className="w-5 h-5 text-red-500" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Instructions */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4">
            <p className="text-purple-800 text-sm">
              <strong>Tap videos below</strong> to add or remove them from this playlist. Videos with a purple checkmark are already in the playlist.
            </p>
          </div>
          
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search videos..." className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl" />
          </div>
          
          {/* Videos List */}
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {filteredVideos.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No videos found</div>
            ) : (
              filteredVideos.map(video => {
                const isInPlaylist = selectedPlaylist.videoIds.includes(video.id)
                return (
                  <div key={video.id} onClick={() => handleToggleVideoInPlaylist(video.id)} className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 ${isInPlaylist ? 'bg-purple-50' : ''}`}>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isInPlaylist ? 'bg-purple-600 border-purple-600' : 'border-gray-300'}`}>
                      {isInPlaylist && <Check className="w-4 h-4 text-white" />}
                    </div>
                    <div className="w-20 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 line-clamp-1">{video.title}</h4>
                      <p className="text-xs text-gray-500">{video.views || 0} views</p>
                    </div>
                    {isInPlaylist && <span className="text-xs text-purple-600 font-medium bg-purple-100 px-2 py-1 rounded-lg">Added</span>}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    )
  }

  // ========== CATEGORIES LIST ==========
  if (view === 'categories') {
    return (
      <div className="h-full overflow-auto bg-gray-50 p-4 lg:p-6">
        <Toast /><DeleteModal />
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Media</h1>
          <button onClick={() => { resetCategoryForm(); setView('add-category') }} className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700">
            <Plus className="w-5 h-5" />New Category
          </button>
        </div>
        <div className="flex gap-2 mb-6">
          <button onClick={() => { setSearchQuery(''); setView('videos') }} className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 rounded-xl font-medium border border-gray-200 hover:bg-gray-50">
            <Film className="w-4 h-4" />Videos ({videos.length})
          </button>
          <button onClick={() => { setSearchQuery(''); setView('playlists') }} className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 rounded-xl font-medium border border-gray-200 hover:bg-gray-50">
            <ListVideo className="w-4 h-4" />Playlists ({playlists.length})
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl font-medium">
            <Tag className="w-4 h-4" />Categories ({categories.length})
          </button>
        </div>
        
        {/* Categories List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-1/3 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Tag className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No categories yet</h3>
            <p className="text-gray-500 mb-4">Create your first category to organize videos</p>
            <button onClick={() => { resetCategoryForm(); setView('add-category') }} className="px-6 py-2.5 bg-purple-600 text-white rounded-xl font-medium">
              Create Category
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map(category => (
              <div key={category.id} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Tag className="w-5 h-5 text-purple-600" />
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-gray-500 line-clamp-1">{category.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">Slug: {category.slug}</p>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleEditCategory(category)} 
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
                    >
                      <Edit2 className="w-3.5 h-3.5" />Edit
                    </button>
                    <button 
                      onClick={() => setDeleteConfirm({ type: 'category', id: category.id, name: category.name })} 
                      className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" />Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ========== ADD/EDIT CATEGORY ==========
  if (view === 'add-category' || view === 'edit-category') {
    return (
      <div className="h-full overflow-auto bg-gray-50 p-4 lg:p-6">
        <Toast />
        <div className="max-w-xl mx-auto">
          <button onClick={() => { resetCategoryForm(); setView('categories') }} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft className="w-5 h-5" /><span className="font-medium">Back to Categories</span>
          </button>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-6">{selectedCategory ? 'Edit Category' : 'Create Category'}</h1>
          
          {/* Name */}
          <div className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
            <input 
              type="text" 
              value={categoryForm.name} 
              onChange={(e) => setCategoryForm(p => ({ ...p, name: e.target.value }))} 
              placeholder="e.g., Praise, Worship, Medley" 
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" 
            />
            {categoryForm.name && (
              <p className="text-xs text-gray-400 mt-2">
                Slug: {categoryForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}
              </p>
            )}
          </div>
          
          {/* Description */}
          <div className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description (optional)</label>
            <textarea 
              value={categoryForm.description} 
              onChange={(e) => setCategoryForm(p => ({ ...p, description: e.target.value }))} 
              placeholder="What type of videos belong in this category?" 
              rows={3} 
              className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500" 
            />
          </div>
          
          {/* Save Button */}
          <button 
            onClick={handleSaveCategory} 
            disabled={isSubmitting || !categoryForm.name.trim()} 
            className="w-full py-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            {isSubmitting ? 'Saving...' : selectedCategory ? 'Save Changes' : 'Create Category'}
          </button>
        </div>
      </div>
    )
  }

  return null
}
