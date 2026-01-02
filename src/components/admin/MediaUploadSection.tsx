'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { 
  Upload, Film, Link2, X, Play, Trash2, Edit2, 
  Youtube, Cloud, Check, AlertCircle, Eye, Heart,
  Plus, MoreVertical, RefreshCw, Settings, FolderPlus,
  ListVideo, Globe, Star, Search
} from 'lucide-react'
import { mediaVideosService, MediaVideo } from '@/lib/media-videos-service'
import { extractYouTubeVideoId, getYouTubeThumbnail } from '@/utils/youtube'
import { 
  getCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory,
  MediaCategory 
} from '@/lib/media-category-service'
import {
  getAdminPlaylists,
  createAdminPlaylist,
  updateAdminPlaylist,
  deleteAdminPlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  addChildPlaylist,
  removeChildPlaylist,
  AdminPlaylist
} from '@/lib/admin-playlist-service'

type UploadStep = 'list' | 'choose' | 'details' | 'categories' | 'playlists' | 'playlist-form' | 'playlist-videos' | 'playlist-nested'
type ListTab = 'videos' | 'playlists'

export default function MediaUploadSection() {
  const router = useRouter()
  const { user, profile } = useAuth()
  
  const [step, setStep] = useState<UploadStep>('list')
  const [listTab, setListTab] = useState<ListTab>('videos')
  const [sourceType, setSourceType] = useState<'youtube' | 'cloudinary' | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [videos, setVideos] = useState<MediaVideo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingVideo, setEditingVideo] = useState<MediaVideo | null>(null)
  
  // Categories state
  const [categories, setCategories] = useState<MediaCategory[]>([])
  const [newCategoryName, setNewCategoryName] = useState('')
  const [editingCategory, setEditingCategory] = useState<MediaCategory | null>(null)
  const [editCategoryName, setEditCategoryName] = useState('')
  
  // Playlists state
  const [playlists, setPlaylists] = useState<AdminPlaylist[]>([])
  const [selectedPlaylist, setSelectedPlaylist] = useState<AdminPlaylist | null>(null)
  const [playlistName, setPlaylistName] = useState('')
  const [playlistDescription, setPlaylistDescription] = useState('')
  const [playlistThumbnail, setPlaylistThumbnail] = useState('')
  const [playlistType, setPlaylistType] = useState<string>('')
  const [playlistPublic, setPlaylistPublic] = useState(true)
  const [playlistFeatured, setPlaylistFeatured] = useState(false)
  const [playlistForHQ, setPlaylistForHQ] = useState(true)
  const [playlistSearch, setPlaylistSearch] = useState('')
  
  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [thumbnail, setThumbnail] = useState('')
  const [type, setType] = useState<string>('praise')
  const [featured, setFeatured] = useState(false)
  const [forHQ, setForHQ] = useState(true) // Default to HQ zones
  const [urlError, setUrlError] = useState('')

  useEffect(() => {
    loadVideos()
    loadCategories()
    loadPlaylists()
  }, [])
  
  const loadCategories = async () => {
    try {
      const cats = await getCategories()
      setCategories(cats)
    } catch (e) {
      console.error('Error loading categories:', e)
    }
  }

  const loadVideos = async () => {
    setIsLoading(true)
    try {
      const data = await mediaVideosService.getAll(50)
      setVideos(data)
    } catch (e) {
      // Silent fail
    } finally {
      setIsLoading(false)
    }
  }
  
  const loadPlaylists = async () => {
    try {
      const data = await getAdminPlaylists()
      setPlaylists(data)
    } catch (e) {
      console.error('Error loading playlists:', e)
    }
  }
  
  const getPlaylistThumbnail = (playlist: AdminPlaylist): string => {
    if (playlist.videoIds.length > 0) {
      const firstVideo = videos.find(v => v.id === playlist.videoIds[0])
      return firstVideo?.thumbnail || ''
    }
    return ''
  }
  
  const resetPlaylistForm = () => {
    setPlaylistName('')
    setPlaylistDescription('')
    setPlaylistThumbnail('')
    setPlaylistType('')
    setPlaylistPublic(true)
    setPlaylistFeatured(false)
    setPlaylistForHQ(true)
    setSelectedPlaylist(null)
  }

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setVideoUrl('')
    setThumbnail('')
    setType('praise')
    setFeatured(false)
    setForHQ(true)
    setUrlError('')
    setSourceType(null)
    setEditingVideo(null)
  }

  const handleUrlChange = (url: string) => {
    setVideoUrl(url)
    setUrlError('')
    
    if (sourceType === 'youtube') {
      const videoId = extractYouTubeVideoId(url)
      if (videoId) {
        const thumbUrl = getYouTubeThumbnail(url)
        if (thumbUrl) setThumbnail(thumbUrl)
        setUrlError('')
      } else if (url.length > 10) {
        setUrlError('Invalid YouTube URL')
      }
    }
  }

  const openCloudinaryWidget = (type: 'video' | 'image') => {
    if (typeof window !== 'undefined' && (window as any).cloudinary) {
      const widget = (window as any).cloudinary.createUploadWidget(
        {
          cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
          uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
          folder: type === 'video' ? 'media/videos' : 'media/thumbnails',
          resourceType: type === 'video' ? 'video' : 'image',
          maxFileSize: type === 'video' ? 500000000 : 10000000,
          sources: ['local'],
          multiple: false,
          styles: {
            palette: {
              window: '#1a1a1a',
              windowBorder: '#333',
              tabIcon: '#fff',
              menuIcons: '#fff',
              textDark: '#000',
              textLight: '#fff',
              link: '#8b5cf6',
              action: '#8b5cf6',
              inactiveTabIcon: '#666',
              error: '#ef4444',
              inProgress: '#8b5cf6',
              complete: '#22c55e',
              sourceBg: '#1a1a1a'
            }
          }
        },
        (error: any, result: any) => {
          if (!error && result?.event === 'success') {
            if (type === 'video') {
              setVideoUrl(result.info.secure_url)
            } else {
              setThumbnail(result.info.secure_url)
            }
          }
        }
      )
      widget.open()
    }
  }

  const handleSubmit = async () => {
    if (!title.trim() || !videoUrl || !thumbnail) {
      alert('Please fill in all required fields: Title, Video URL, and Thumbnail')
      return
    }

    setIsSubmitting(true)
    try {
      const isYouTube = sourceType === 'youtube'
      
      // Build video data - don't include undefined fields (Firestore doesn't allow them)
      const videoData: Record<string, any> = {
        title: title.trim(),
        description: description.trim(),
        thumbnail,
        isYouTube,
        type,
        featured,
        forHQ, // Zone targeting: true = HQ zones, false = regular zones
        createdBy: user?.uid || 'admin',
        createdByName: profile?.first_name || 'Admin',
      }
      
      // Only add the relevant URL field (avoid undefined values)
      if (isYouTube) {
        videoData.youtubeUrl = videoUrl
        videoData.videoUrl = ''
      } else {
        videoData.videoUrl = videoUrl
        videoData.youtubeUrl = ''
      }

      console.log('📹 Saving video with data:', { ...videoData, type })
      
      if (editingVideo) {
        await mediaVideosService.update(editingVideo.id, videoData as any)
        alert('Video updated successfully!')
      } else {
        await mediaVideosService.create(videoData as any)
        alert('Video published successfully!')
      }

      // Trigger refresh
      window.dispatchEvent(new CustomEvent('mediaUploaded'))
      
      resetForm()
      setStep('list')
      loadVideos()
    } catch (e: any) {
      console.error('Error publishing video:', e)
      alert(`Error: ${e?.message || 'Failed to publish video. Check console for details.'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (video: MediaVideo) => {
    setEditingVideo(video)
    setTitle(video.title)
    setDescription(video.description || '')
    setVideoUrl(video.youtubeUrl || video.videoUrl || '')
    setThumbnail(video.thumbnail)
    setType(video.type)
    setFeatured(video.featured)
    setForHQ(video.forHQ !== false) // Default to true if not set
    setSourceType(video.isYouTube ? 'youtube' : 'cloudinary')
    setStep('details')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this video?')) return
    try {
      await mediaVideosService.delete(id)
      loadVideos()
    } catch (e) {
      // Silent fail
    }
  }

  // Step 1: Video/Playlist List
  if (step === 'list') {
    return (
      <div className="h-full overflow-auto bg-gray-50 p-4 lg:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Media</h1>
            <p className="text-sm text-gray-500">
              {listTab === 'videos' ? `${videos.length} videos` : `${playlists.length} playlists`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {listTab === 'videos' ? (
              <>
                <button
                  onClick={() => setStep('categories')}
                  className="flex items-center gap-2 px-3 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 active:scale-95 transition-all"
                  title="Manage Categories"
                >
                  <Settings className="w-5 h-5" />
                  <span className="hidden sm:inline">Categories</span>
                </button>
                <button
                  onClick={() => setStep('choose')}
                  className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 active:scale-95 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  <span className="hidden sm:inline">Add Video</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => { resetPlaylistForm(); setStep('playlist-form') }}
                className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 active:scale-95 transition-all"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">New Playlist</span>
              </button>
            )}
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setListTab('videos')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
              listTab === 'videos' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Film className="w-4 h-4" />
            Videos
          </button>
          <button
            onClick={() => setListTab('playlists')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
              listTab === 'playlists' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <ListVideo className="w-4 h-4" />
            Playlists
          </button>
        </div>

        {/* Content based on tab */}
        {listTab === 'videos' ? (
          // Videos Tab
          isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="bg-white rounded-xl overflow-hidden animate-pulse">
                  <div className="aspect-video bg-gray-200" />
                  <div className="p-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : videos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Film className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No videos yet</h3>
              <p className="text-gray-500 text-sm mb-4">Add your first video to get started</p>
              <button
                onClick={() => setStep('choose')}
                className="px-6 py-2.5 bg-purple-600 text-white rounded-xl font-medium"
              >
                Add Video
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {videos.map(video => (
                <div key={video.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                  <div className="relative aspect-video bg-gray-100">
                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button onClick={() => handleEdit(video)} className="p-2 bg-white rounded-full hover:bg-gray-100">
                        <Edit2 className="w-4 h-4 text-gray-700" />
                      </button>
                      <button onClick={() => handleDelete(video.id)} className="p-2 bg-white rounded-full hover:bg-gray-100">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                    {video.isYouTube && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 bg-red-600 text-white text-xs rounded font-medium flex items-center gap-1">
                        <Youtube className="w-3 h-3" /> YouTube
                      </div>
                    )}
                    {video.featured && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 bg-yellow-500 text-white text-xs rounded font-medium">Featured</div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-gray-900 line-clamp-1 mb-1">{video.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{video.views || 0}</span>
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{video.likes || 0}</span>
                      <span className="capitalize">{video.type}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          // Playlists Tab
          playlists.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <ListVideo className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No playlists yet</h3>
              <p className="text-gray-500 text-sm mb-4">Create your first curated playlist</p>
              <button
                onClick={() => { resetPlaylistForm(); setStep('playlist-form') }}
                className="px-6 py-2.5 bg-purple-600 text-white rounded-xl font-medium"
              >
                Create Playlist
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {playlists.map(playlist => {
                const thumbUrl = playlist.thumbnail || getPlaylistThumbnail(playlist)
                return (
                  <div key={playlist.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="relative aspect-video bg-gray-100">
                      {thumbUrl ? (
                        <img src={thumbUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ListVideo className="w-12 h-12 text-gray-300" />
                        </div>
                      )}
                      <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                        {playlist.videoIds.length} videos
                      </div>
                      {playlist.isFeatured && (
                        <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                          <Star className="w-3 h-3" /> Featured
                        </div>
                      )}
                      {playlist.isPublic && (
                        <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-gray-900 line-clamp-1 mb-1">{playlist.name}</h3>
                      <p className="text-xs text-gray-500 line-clamp-1 mb-2">{playlist.description || 'No description'}</p>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setSelectedPlaylist(playlist); setStep('playlist-videos') }}
                          className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 flex items-center justify-center gap-1"
                        >
                          <Play className="w-3 h-3" /> Videos
                        </button>
                        <button
                          onClick={() => { setSelectedPlaylist(playlist); setStep('playlist-nested') }}
                          className="flex-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium hover:bg-purple-200 flex items-center justify-center gap-1"
                        >
                          <ListVideo className="w-3 h-3" /> Nested
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPlaylist(playlist)
                            setPlaylistName(playlist.name)
                            setPlaylistDescription(playlist.description)
                            setPlaylistThumbnail(playlist.thumbnail || '')
                            setPlaylistType(playlist.type || '')
                            setPlaylistPublic(playlist.isPublic)
                            setPlaylistFeatured(playlist.isFeatured)
                            setPlaylistForHQ(playlist.forHQ)
                            setStep('playlist-form')
                          }}
                          className="p-1.5 hover:bg-gray-100 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm('Delete this playlist?')) return
                            await deleteAdminPlaylist(playlist.id)
                            loadPlaylists()
                          }}
                          className="p-1.5 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        )}
      </div>
    )
  }

  // Step 2: Choose Source
  if (step === 'choose') {
    return (
      <div className="h-full overflow-auto bg-gray-50 p-4 lg:p-6">
        <div className="max-w-lg mx-auto pt-8">
          {/* Back */}
          <button
            onClick={() => { resetForm(); setStep('list') }}
            className="flex items-center gap-2 text-gray-600 mb-6 hover:text-gray-900"
          >
            <X className="w-5 h-5" />
            Cancel
          </button>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Add New Video</h1>
          <p className="text-gray-500 mb-8">Choose how you want to add your video</p>

          {/* Options */}
          <div className="space-y-4">
            {/* YouTube Option */}
            <button
              onClick={() => { setSourceType('youtube'); setStep('details') }}
              className="w-full p-6 bg-white rounded-2xl border-2 border-gray-200 hover:border-red-500 hover:bg-red-50 transition-all text-left group"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center group-hover:bg-red-200 transition-colors">
                  <Youtube className="w-7 h-7 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg mb-1">YouTube Link</h3>
                  <p className="text-gray-500 text-sm">Paste a YouTube video URL. Free and unlimited.</p>
                  <div className="mt-2 flex items-center gap-1 text-green-600 text-xs font-medium">
                    <Check className="w-3 h-3" />
                    Recommended
                  </div>
                </div>
              </div>
            </button>

            {/* Cloudinary Option */}
            <button
              onClick={() => { setSourceType('cloudinary'); setStep('details') }}
              className="w-full p-6 bg-white rounded-2xl border-2 border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all text-left group"
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <Cloud className="w-7 h-7 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg mb-1">Upload Video</h3>
                  <p className="text-gray-500 text-sm">Upload from your device. Uses storage quota.</p>
                  <div className="mt-2 flex items-center gap-1 text-gray-400 text-xs">
                    <AlertCircle className="w-3 h-3" />
                    Max 500MB per video
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Playlist Form (Create/Edit)
  if (step === 'playlist-form') {
    const handleSavePlaylist = async () => {
      if (!playlistName.trim()) {
        alert('Please enter a playlist name')
        return
      }
      setIsSubmitting(true)
      try {
        if (selectedPlaylist) {
          await updateAdminPlaylist(selectedPlaylist.id, {
            name: playlistName.trim(),
            description: playlistDescription.trim(),
            thumbnail: playlistThumbnail || undefined,
            type: playlistType || undefined,
            isPublic: playlistPublic,
            isFeatured: playlistFeatured,
            forHQ: playlistForHQ
          })
        } else {
          await createAdminPlaylist({
            name: playlistName.trim(),
            description: playlistDescription.trim(),
            thumbnail: playlistThumbnail || undefined,
            type: playlistType || undefined,
            isPublic: playlistPublic,
            isFeatured: playlistFeatured,
            forHQ: playlistForHQ,
            createdBy: user?.uid || 'admin',
            createdByName: profile?.first_name || 'Admin'
          })
        }
        resetPlaylistForm()
        setStep('list')
        loadPlaylists()
      } catch (e) {
        alert('Failed to save playlist')
      }
      setIsSubmitting(false)
    }

    const openPlaylistThumbnailWidget = () => {
      if (typeof window !== 'undefined' && (window as any).cloudinary) {
        const widget = (window as any).cloudinary.createUploadWidget(
          {
            cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
            uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
            folder: 'media/thumbnails',
            resourceType: 'image',
            maxFileSize: 10000000,
            sources: ['local'],
            multiple: false,
            styles: {
              palette: {
                window: '#1a1a1a',
                windowBorder: '#333',
                tabIcon: '#fff',
                menuIcons: '#fff',
                textDark: '#000',
                textLight: '#fff',
                link: '#8b5cf6',
                action: '#8b5cf6',
                inactiveTabIcon: '#666',
                error: '#ef4444',
                inProgress: '#8b5cf6',
                complete: '#22c55e',
                sourceBg: '#1a1a1a'
              }
            }
          },
          (error: any, result: any) => {
            if (!error && result?.event === 'success') {
              setPlaylistThumbnail(result.info.secure_url)
            }
          }
        )
        widget.open()
      }
    }

    return (
      <div className="h-full overflow-auto bg-gray-50 p-4 lg:p-6">
        <div className="max-w-xl mx-auto">
          <button
            onClick={() => { resetPlaylistForm(); setStep('list') }}
            className="flex items-center gap-2 text-gray-600 mb-6 hover:text-gray-900"
          >
            <X className="w-5 h-5" /> Cancel
          </button>

          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {selectedPlaylist ? 'Edit Playlist' : 'Create Playlist'}
          </h1>

          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
                placeholder="Playlist name"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={playlistDescription}
                onChange={(e) => setPlaylistDescription(e.target.value)}
                placeholder="What's this playlist about?"
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>

            {/* Thumbnail Upload */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail</label>
              {playlistThumbnail ? (
                <div className="relative">
                  <img src={playlistThumbnail} alt="Thumbnail" className="w-full aspect-video object-cover rounded-xl" />
                  <button
                    onClick={() => setPlaylistThumbnail('')}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white hover:bg-black/70"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div>
                  <button
                    onClick={openPlaylistThumbnailWidget}
                    className="w-full py-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-colors"
                  >
                    <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 font-medium text-sm">Upload custom thumbnail</p>
                    <p className="text-gray-400 text-xs">Or leave empty to use first video's thumbnail</p>
                  </button>
                </div>
              )}
            </div>

            {/* Category Selector */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <button
                  onClick={() => setStep('categories')}
                  className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1"
                >
                  <Settings className="w-3 h-3" />
                  Manage
                </button>
              </div>
              <select
                value={playlistType}
                onChange={(e) => setPlaylistType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">No category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.slug}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">Visibility</label>
                <button
                  onClick={() => setPlaylistPublic(!playlistPublic)}
                  className={`w-full px-4 py-3 rounded-xl border-2 font-medium transition-all flex items-center justify-center gap-2 ${
                    playlistPublic ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  {playlistPublic ? 'Public' : 'Private'}
                </button>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">Featured</label>
                <button
                  onClick={() => setPlaylistFeatured(!playlistFeatured)}
                  className={`w-full px-4 py-3 rounded-xl border-2 font-medium transition-all flex items-center justify-center gap-2 ${
                    playlistFeatured ? 'border-yellow-500 bg-yellow-50 text-yellow-700' : 'border-gray-200 text-gray-600'
                  }`}
                >
                  <Star className="w-4 h-4" />
                  {playlistFeatured ? 'Featured' : 'Not Featured'}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">Zone Targeting</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPlaylistForHQ(true)}
                  className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                    playlistForHQ ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'
                  }`}
                >
                  🏢 HQ Zones
                </button>
                <button
                  onClick={() => setPlaylistForHQ(false)}
                  className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                    !playlistForHQ ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600'
                  }`}
                >
                  🌍 Regular Zones
                </button>
              </div>
            </div>

            <button
              onClick={handleSavePlaylist}
              disabled={!playlistName.trim() || isSubmitting}
              className="w-full py-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              {isSubmitting ? 'Saving...' : selectedPlaylist ? 'Save Changes' : 'Create Playlist'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Playlist Videos Management
  if (step === 'playlist-videos' && selectedPlaylist) {
    const filteredVideos = videos.filter(v => 
      v.title.toLowerCase().includes(playlistSearch.toLowerCase())
    )

    const handleToggleVideo = async (videoId: string) => {
      try {
        if (selectedPlaylist.videoIds.includes(videoId)) {
          await removeVideoFromPlaylist(selectedPlaylist.id, videoId)
          setSelectedPlaylist({
            ...selectedPlaylist,
            videoIds: selectedPlaylist.videoIds.filter(id => id !== videoId)
          })
        } else {
          await addVideoToPlaylist(selectedPlaylist.id, videoId)
          setSelectedPlaylist({
            ...selectedPlaylist,
            videoIds: [...selectedPlaylist.videoIds, videoId]
          })
        }
        loadPlaylists()
      } catch (e) {
        alert('Failed to update playlist')
      }
    }

    return (
      <div className="h-full overflow-auto bg-gray-50 p-4 lg:p-6">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => { setSelectedPlaylist(null); setPlaylistSearch(''); setStep('list') }}
            className="flex items-center gap-2 text-gray-600 mb-6 hover:text-gray-900"
          >
            <X className="w-5 h-5" /> Back to Playlists
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-24 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
              {(() => {
                const thumbUrl = selectedPlaylist.thumbnail || getPlaylistThumbnail(selectedPlaylist)
                return thumbUrl ? (
                  <img src={thumbUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ListVideo className="w-8 h-8 text-gray-400" />
                  </div>
                )
              })()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{selectedPlaylist.name}</h1>
              <p className="text-sm text-gray-500">{selectedPlaylist.videoIds.length} videos</p>
            </div>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={playlistSearch}
              onChange={(e) => setPlaylistSearch(e.target.value)}
              placeholder="Search videos..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {filteredVideos.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No videos found</div>
            ) : (
              filteredVideos.map(video => {
                const isInPlaylist = selectedPlaylist.videoIds.includes(video.id)
                return (
                  <div key={video.id} className="flex items-center gap-3 p-3 hover:bg-gray-50">
                    <button
                      onClick={() => handleToggleVideo(video.id)}
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                        isInPlaylist ? 'bg-purple-600 border-purple-600 text-white' : 'border-gray-300'
                      }`}
                    >
                      {isInPlaylist && <Check className="w-4 h-4" />}
                    </button>
                    <div className="w-24 h-14 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 line-clamp-1">{video.title}</h4>
                      <p className="text-xs text-gray-500">{video.type} • {video.views || 0} views</p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    )
  }

  // Nested Playlists Management
  if (step === 'playlist-nested' && selectedPlaylist) {
    const childIds = selectedPlaylist.childPlaylistIds || []
    const childPlaylists = playlists.filter(p => childIds.includes(p.id))
    const availablePlaylists = playlists.filter(p => 
      p.id !== selectedPlaylist.id && 
      !childIds.includes(p.id) &&
      p.name.toLowerCase().includes(playlistSearch.toLowerCase())
    )

    const handleToggleNested = async (childId: string) => {
      try {
        if (childIds.includes(childId)) {
          await removeChildPlaylist(selectedPlaylist.id, childId)
          setSelectedPlaylist({
            ...selectedPlaylist,
            childPlaylistIds: childIds.filter(id => id !== childId)
          })
        } else {
          await addChildPlaylist(selectedPlaylist.id, childId)
          setSelectedPlaylist({
            ...selectedPlaylist,
            childPlaylistIds: [...childIds, childId]
          })
        }
        loadPlaylists()
      } catch (e: any) {
        alert(e.message || 'Failed to update')
      }
    }

    return (
      <div className="h-full overflow-auto bg-gray-50 p-4 lg:p-6">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => { setSelectedPlaylist(null); setPlaylistSearch(''); setStep('list') }}
            className="flex items-center gap-2 text-gray-600 mb-6 hover:text-gray-900"
          >
            <X className="w-5 h-5" /> Back to Playlists
          </button>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-24 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
              {(() => {
                const thumbUrl = selectedPlaylist.thumbnail || getPlaylistThumbnail(selectedPlaylist)
                return thumbUrl ? (
                  <img src={thumbUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ListVideo className="w-8 h-8 text-gray-400" />
                  </div>
                )
              })()}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{selectedPlaylist.name}</h1>
              <p className="text-sm text-gray-500">{childIds.length} nested playlists</p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Nested playlists will only appear inside this playlist. They won't show on the main media page.
            </p>
          </div>

          {childPlaylists.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Currently Nested ({childPlaylists.length})</h3>
              <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
                {childPlaylists.map(p => {
                  const thumbUrl = p.thumbnail || getPlaylistThumbnail(p)
                  return (
                    <div key={p.id} className="flex items-center gap-3 p-3 hover:bg-gray-50">
                      <button
                        onClick={() => handleToggleNested(p.id)}
                        className="w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 bg-purple-600 border-purple-600 text-white"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <div className="w-24 h-14 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        {thumbUrl ? (
                          <img src={thumbUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ListVideo className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 line-clamp-1">{p.name}</h4>
                        <p className="text-xs text-gray-500">{p.videoIds.length} videos</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={playlistSearch}
              onChange={(e) => setPlaylistSearch(e.target.value)}
              placeholder="Search playlists to add..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Available Playlists</h3>
            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
              {availablePlaylists.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No playlists available to nest</div>
              ) : (
                availablePlaylists.map(p => {
                  const thumbUrl = p.thumbnail || getPlaylistThumbnail(p)
                  return (
                    <div key={p.id} className="flex items-center gap-3 p-3 hover:bg-gray-50">
                      <button
                        onClick={() => handleToggleNested(p.id)}
                        className="w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 border-gray-300"
                      />
                      <div className="w-24 h-14 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        {thumbUrl ? (
                          <img src={thumbUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ListVideo className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 line-clamp-1">{p.name}</h4>
                        <p className="text-xs text-gray-500">{p.videoIds.length} videos</p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Step 4: Categories Management
  if (step === 'categories') {
    const handleAddCategory = async () => {
      if (!newCategoryName.trim()) return
      try {
        await createCategory(newCategoryName.trim())
        setNewCategoryName('')
        loadCategories()
      } catch (e) {
        alert('Failed to add category')
      }
    }
    
    const handleUpdateCategory = async () => {
      if (!editingCategory || !editCategoryName.trim()) return
      try {
        await updateCategory(editingCategory.id, { name: editCategoryName.trim() })
        setEditingCategory(null)
        setEditCategoryName('')
        loadCategories()
      } catch (e) {
        alert('Failed to update category')
      }
    }
    
    const handleDeleteCategory = async (cat: MediaCategory) => {
      if (!confirm(`Delete "${cat.name}" category?`)) return
      try {
        await deleteCategory(cat.id)
        loadCategories()
      } catch (e) {
        alert('Failed to delete category')
      }
    }
    
    return (
      <div className="h-full overflow-auto bg-gray-50 p-4 lg:p-6">
        <div className="max-w-lg mx-auto pt-4">
          {/* Back */}
          <button
            onClick={() => setStep('list')}
            className="flex items-center gap-2 text-gray-600 mb-6 hover:text-gray-900"
          >
            <X className="w-5 h-5" />
            Back to Videos
          </button>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Manage Categories</h1>
          <p className="text-gray-500 mb-6">Add, edit, or remove video categories</p>

          {/* Add New Category */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Add New Category</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Category name"
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
              />
              <button
                onClick={handleAddCategory}
                disabled={!newCategoryName.trim()}
                className="px-4 py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <FolderPlus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>

          {/* Categories List */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <h3 className="font-medium text-gray-900">Categories ({categories.length})</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {categories.map(cat => (
                <div key={cat.id} className="px-5 py-3 flex items-center gap-3">
                  {editingCategory?.id === cat.id ? (
                    <>
                      <input
                        type="text"
                        value={editCategoryName}
                        onChange={(e) => setEditCategoryName(e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleUpdateCategory()
                          if (e.key === 'Escape') { setEditingCategory(null); setEditCategoryName('') }
                        }}
                      />
                      <button
                        onClick={handleUpdateCategory}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { setEditingCategory(null); setEditCategoryName('') }}
                        className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-gray-900">{cat.name}</span>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{cat.slug}</span>
                      <button
                        onClick={() => { setEditingCategory(cat); setEditCategoryName(cat.name) }}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              ))}
              {categories.length === 0 && (
                <div className="px-5 py-8 text-center text-gray-500">
                  No categories yet. Add one above.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Step 3: Video Details
  return (
    <div className="h-full overflow-auto bg-gray-50 p-4 lg:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Back */}
        <button
          onClick={() => { if (editingVideo) { resetForm(); setStep('list') } else { setStep('choose') } }}
          className="flex items-center gap-2 text-gray-600 mb-6 hover:text-gray-900"
        >
          <X className="w-5 h-5" />
          {editingVideo ? 'Cancel' : 'Back'}
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {editingVideo ? 'Edit Video' : sourceType === 'youtube' ? 'Add YouTube Video' : 'Upload Video'}
        </h1>

        <div className="space-y-6">
          {/* Video URL/Upload */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {sourceType === 'youtube' ? 'YouTube URL' : 'Video File'}
            </label>
            
            {sourceType === 'youtube' ? (
              <div>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {urlError && <p className="text-red-500 text-sm mt-2">{urlError}</p>}
              </div>
            ) : (
              <div>
                {videoUrl ? (
                  <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="text-green-700 text-sm flex-1">Video uploaded</span>
                    <button onClick={() => setVideoUrl('')} className="text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => openCloudinaryWidget('video')}
                    className="w-full py-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-colors"
                  >
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 font-medium">Click to upload video</p>
                    <p className="text-gray-400 text-sm">MP4, MOV up to 500MB</p>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Thumbnail */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-3">Thumbnail</label>
            
            {thumbnail ? (
              <div className="relative">
                <img src={thumbnail} alt="Thumbnail" className="w-full aspect-video object-cover rounded-xl" />
                <button
                  onClick={() => setThumbnail('')}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white hover:bg-black/70"
                >
                  <X className="w-4 h-4" />
                </button>
                {sourceType === 'youtube' && thumbnail.includes('ytimg') && (
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                    Auto-fetched from YouTube
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openCloudinaryWidget('image')}
                className="w-full py-8 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-colors"
              >
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 font-medium">Upload thumbnail</p>
                <p className="text-gray-400 text-sm">16:9 ratio recommended</p>
              </button>
            )}
          </div>

          {/* Title */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-3">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-3">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this video about?"
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          {/* Type & Featured */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <button
                  onClick={() => setStep('categories')}
                  className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1"
                >
                  <Settings className="w-3 h-3" />
                  Manage
                </button>
              </div>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {categories.length === 0 ? (
                  // Fallback options while loading
                  <>
                    <option value="praise">Praise</option>
                    <option value="worship">Worship</option>
                    <option value="medley">Medley</option>
                    <option value="other">Other</option>
                  </>
                ) : (
                  categories.map(cat => (
                    <option key={cat.id} value={cat.slug}>{cat.name}</option>
                  ))
                )}
              </select>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-3">Featured</label>
              <button
                onClick={() => setFeatured(!featured)}
                className={`w-full px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                  featured 
                    ? 'border-purple-500 bg-purple-50 text-purple-700' 
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {featured ? '⭐ Featured' : 'Not Featured'}
              </button>
            </div>
          </div>

          {/* Zone Targeting */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-3">Zone Targeting</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setForHQ(true)}
                className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                  forHQ 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                🏢 HQ Zones
              </button>
              <button
                onClick={() => setForHQ(false)}
                className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${
                  !forHQ 
                    ? 'border-green-500 bg-green-50 text-green-700' 
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                🌍 Regular Zones
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {forHQ ? 'Video will be visible to HQ zones (Zone 1-5, Orchestra, etc.)' : 'Video will be visible to regular zones (Zone 6+)'}
            </p>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || !videoUrl || !thumbnail || isSubmitting}
            className="w-full py-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                {editingVideo ? 'Saving...' : 'Publishing...'}
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                {editingVideo ? 'Save Changes' : 'Publish Video'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
