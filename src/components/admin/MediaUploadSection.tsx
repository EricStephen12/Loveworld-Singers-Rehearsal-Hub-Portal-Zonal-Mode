'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Upload, Film, Image, Loader2, Play, Link, X, RefreshCcw, Edit, Trash2 } from 'lucide-react'
import { videoUploadService, type VideoUploadRecord } from '@/lib/videoUploadService'
import { useAdminTheme } from './AdminThemeProvider'
import { CONTENT_TYPES, ContentType } from '@/config/contentTypes'
import { extractYouTubeVideoId, isYouTubeUrl, getYouTubeThumbnail } from '@/utils/youtube'

export default function MediaUploadSection() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const { theme } = useAdminTheme()
  
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'praise' as ContentType,
    genre: [] as string[],
    videoUrl: '',
    youtubeUrl: '',
    thumbnail: '',
    backdropImage: '',
    duration: 0,
    releaseYear: new Date().getFullYear(),
    featured: false,
    isYouTube: false
  })

  const [uploadMethod, setUploadMethod] = useState<'upload' | 'youtube'>('upload')
  const [recentUploads, setRecentUploads] = useState<VideoUploadRecord[]>([])
  const [isRecentLoading, setIsRecentLoading] = useState(true)
  const [recentError, setRecentError] = useState<string | null>(null)
  const [editingVideo, setEditingVideo] = useState<VideoUploadRecord | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [deletingVideoId, setDeletingVideoId] = useState<string | null>(null)

  useEffect(() => {
    refreshRecentUploads()
  }, [])

  const refreshRecentUploads = async () => {
    setIsRecentLoading(true)
    setRecentError(null)
    try {
      const uploads = await videoUploadService.getAllUploads()
      setRecentUploads(uploads)
    } catch (error) {
      console.error('Failed to load uploads:', error)
      setRecentError('Unable to load uploads right now.')
    } finally {
      setIsRecentLoading(false)
    }
  }

  const handleEdit = (video: VideoUploadRecord) => {
    setEditingVideo(video)
    setFormData({
      title: video.title,
      description: video.description,
      type: video.type as ContentType,
      genre: video.genre || [],
      videoUrl: video.videoUrl || '',
      youtubeUrl: video.youtubeUrl || '',
      thumbnail: video.thumbnail,
      backdropImage: video.backdropImage || '',
      duration: video.duration || 0,
      releaseYear: video.releaseYear || new Date().getFullYear(),
      featured: video.featured,
      isYouTube: video.isYouTube
    })
    setUploadMethod(video.sourceType === 'youtube' ? 'youtube' : 'upload')
    setShowEditModal(true)
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingVideo || !user) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const isYouTubeMode = uploadMethod === 'youtube'
      const playbackUrl = isYouTubeMode
        ? (formData.youtubeUrl || '')
        : (formData.videoUrl || '')

      if (!formData.title || !playbackUrl || !formData.thumbnail) {
        alert('Please fill in all required fields')
        setIsUploading(false)
        return
      }

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      await videoUploadService.updateUpload(editingVideo.id, {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        genre: formData.genre,
        playbackUrl,
        videoUrl: !isYouTubeMode ? formData.videoUrl : undefined,
        youtubeUrl: isYouTubeMode ? formData.youtubeUrl : undefined,
        thumbnail: formData.thumbnail,
        backdropImage: formData.backdropImage || formData.thumbnail,
        duration: formData.duration,
        releaseYear: formData.releaseYear,
        featured: formData.featured,
        isYouTube: formData.isYouTube,
        sourceType: isYouTubeMode ? 'youtube' : 'upload',
        createdBy: user.uid,
        createdByEmail: user.email ?? null,
        createdByName: user.displayName || `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || null,
        views: editingVideo.views || 0,
        likes: editingVideo.likes || 0
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      alert('Video updated successfully!')
      setShowEditModal(false)
      setEditingVideo(null)
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        type: 'praise',
        genre: [],
        videoUrl: '',
        youtubeUrl: '',
        thumbnail: '',
        backdropImage: '',
        duration: 0,
        releaseYear: new Date().getFullYear(),
        featured: false,
        isYouTube: false
      })
      setUploadMethod('upload')
      refreshRecentUploads()
    } catch (error) {
      console.error('Update error:', error)
      alert('Failed to update video')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      return
    }

    setDeletingVideoId(id)
    try {
      await videoUploadService.deleteUpload(id)
      alert('Video deleted successfully!')
      refreshRecentUploads()
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete video')
    } finally {
      setDeletingVideoId(null)
    }
  }

  // Handle YouTube URL input
  const handleYouTubeUrl = (url: string) => {
    const videoId = extractYouTubeVideoId(url)
    const thumbnailUrl = getYouTubeThumbnail(url)
    
    if (videoId && thumbnailUrl) {
      setFormData(prev => ({
        ...prev,
        youtubeUrl: url,
        videoUrl: '',
        thumbnail: prev.thumbnail || thumbnailUrl,
        backdropImage: prev.backdropImage || thumbnailUrl,
        isYouTube: true
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        youtubeUrl: url,
        videoUrl: '',
        thumbnail: '',
        isYouTube: false
      }))
    }
  }

  // Cloudinary upload widget
  const openCloudinaryWidget = (type: 'video' | 'image' | 'backdrop') => {
    // @ts-ignore - Cloudinary widget
    if (typeof window !== 'undefined' && window.cloudinary) {
      // @ts-ignore
      const widget = window.cloudinary.createUploadWidget(
        {
          cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
          uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
          folder: type === 'video' ? 'media/videos' : 'media/images',
          resourceType: type === 'video' ? 'video' : 'image',
          maxFileSize: type === 'video' ? 500000000 : 10000000, // 500MB for video, 10MB for images
          sources: ['local', 'url'],
          showUploadMoreButton: false,
          styles: {
            palette: {
              window: '#000000',
              windowBorder: theme.primary.replace('bg-', '#'),
              tabIcon: theme.primary.replace('bg-', '#'),
              menuIcons: '#FFFFFF',
              textDark: '#000000',
              textLight: '#FFFFFF',
              link: theme.primary.replace('bg-', '#'),
              action: theme.primary.replace('bg-', '#'),
              inactiveTabIcon: '#555555',
              error: '#F44235',
              inProgress: theme.primary.replace('bg-', '#'),
              complete: '#22C55E',
              sourceBg: '#000000'
            }
          }
        },
        (error: any, result: any) => {
          if (!error && result && result.event === 'success') {
            const url = result.info.secure_url
            
            if (type === 'video') {
              setFormData(prev => ({ 
                ...prev, 
                videoUrl: url,
                duration: Math.round(result.info.duration || 0),
                isYouTube: false
              }))
            } else if (type === 'image') {
              setFormData(prev => ({ ...prev, thumbnail: url }))
            } else if (type === 'backdrop') {
              setFormData(prev => ({ ...prev, backdropImage: url }))
            }
          }
        }
      )
      widget.open()
    } else {
      alert('Cloudinary widget not loaded. Please refresh the page.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // If editing, use update handler
    if (editingVideo) {
      await handleUpdate(e)
      return
    }
    
    if (!user?.uid) {
      alert('You must be logged in')
      return
    }

    const isYouTubeMode = uploadMethod === 'youtube'
    const playbackUrl = isYouTubeMode ? formData.youtubeUrl : formData.videoUrl

    if (!formData.title || !playbackUrl || !formData.thumbnail) {
      alert('Please fill in all required fields and upload/add video')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    let progressInterval: NodeJS.Timeout | null = null

    try {
      // Simulate progress
      progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const sourceType = isYouTubeMode ? 'youtube' : 'upload'

      // Create media item in Firebase
      await videoUploadService.createUpload({
        title: formData.title,
        description: formData.description,
        type: formData.type,
        genre: formData.genre,
        playbackUrl,
        videoUrl: !isYouTubeMode ? formData.videoUrl : undefined,
        youtubeUrl: isYouTubeMode ? formData.youtubeUrl : undefined,
        thumbnail: formData.thumbnail,
        backdropImage: formData.backdropImage || formData.thumbnail,
        duration: formData.duration,
        releaseYear: formData.releaseYear,
        featured: formData.featured,
        isYouTube: isYouTubeMode,
        sourceType,
        createdBy: user.uid,
        createdByEmail: user.email ?? null,
        createdByName: user.displayName || `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || null,
        views: 0,
        likes: 0
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      alert('Media uploaded successfully! Redirecting to media page...')
      
      // Trigger refresh event for MediaContext
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mediaUploaded'))
      }
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        type: 'praise',
        genre: [],
        videoUrl: '',
        youtubeUrl: '',
        thumbnail: '',
        backdropImage: '',
        duration: 0,
        releaseYear: new Date().getFullYear(),
        featured: false,
        isYouTube: false
      })
      setUploadMethod('upload')
      refreshRecentUploads()
      
      // Redirect to media page after successful upload
      setTimeout(() => {
        router.push('/pages/media')
      }, 2000)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload media')
    } finally {
      if (progressInterval) {
        clearInterval(progressInterval)
      }
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="w-full h-full overflow-y-auto bg-gradient-to-br from-slate-50 to-white">
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {editingVideo ? 'Edit Video' : 'Media Studio'}
              </h2>
              <p className="text-gray-600">
                {editingVideo ? 'Update your video details' : 'Create and manage your video content'}
              </p>
            </div>
          </div>
        </div>

        {/* Upload Form */}
        <div className="max-w-4xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                Basic Information
              </h3>
              
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-lg"
                    placeholder="Enter your video title..."
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                    placeholder="Describe your video content..."
                    rows={4}
                  />
                </div>

                {/* Type & Year */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Content Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    >
                      {CONTENT_TYPES.map((contentType) => (
                        <option key={contentType.id} value={contentType.id}>
                          {contentType.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Release Year</label>
                    <input
                      type="number"
                      value={formData.releaseYear}
                      onChange={(e) => setFormData({ ...formData, releaseYear: parseInt(e.target.value) })}
                      className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      min="1900"
                      max="2030"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Video Upload Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                Video Content <span className="text-red-500 text-sm">*</span>
              </h3>

              {/* Upload Method Tabs */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setUploadMethod('upload')}
                  className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl border-2 transition-all ${
                    uploadMethod === 'upload'
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <Upload className="w-5 h-5" />
                  <span className="font-medium">Upload File</span>
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMethod('youtube')}
                  className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl border-2 transition-all ${
                    uploadMethod === 'youtube'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <Link className="w-5 h-5" />
                  <span className="font-medium">External Link</span>
                </button>
              </div>

              {/* Upload Video */}
              {uploadMethod === 'upload' && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors">
                    <Film className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <button
                      type="button"
                      onClick={() => openCloudinaryWidget('video')}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                    >
                      <Upload className="w-5 h-5" />
                      Choose Video File
                    </button>
                    <p className="text-sm text-gray-500 mt-3">MP4, MOV, AVI up to 500MB</p>
                  </div>
                  
                  {formData.videoUrl && !formData.isYouTube && (
                    <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Play className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-green-800">Video uploaded successfully</p>
                        <p className="text-sm text-green-600">Ready to publish</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => window.open(formData.videoUrl, '_blank')}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* External Link */}
              {uploadMethod === 'youtube' && (
                <div className="space-y-4">
                  <div>
                    <input
                      type="url"
                      value={formData.youtubeUrl}
                      onChange={(e) => handleYouTubeUrl(e.target.value)}
                      placeholder="Paste video URL (YouTube, Vimeo, etc.)"
                      className="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  
                  {formData.isYouTube && formData.thumbnail && (
                    <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                      <img src={formData.thumbnail} alt="Video thumbnail" className="w-20 h-12 object-cover rounded-lg" />
                      <div className="flex-1">
                        <p className="font-medium text-blue-800">Video detected</p>
                        <p className="text-sm text-blue-600">Thumbnail loaded automatically</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Media Assets Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                Visual Assets
              </h3>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Thumbnail */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Thumbnail <span className="text-red-500">*</span>
                  </label>
                  
                  {formData.thumbnail ? (
                    <div className="relative group">
                      <img 
                        src={formData.thumbnail} 
                        alt="Thumbnail" 
                        className="w-full aspect-video object-cover rounded-xl border border-gray-200"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-xl flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                          <button
                            type="button"
                            onClick={() => openCloudinaryWidget('image')}
                            className="p-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <Image className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, thumbnail: '' }))}
                            className="p-2 bg-white text-red-600 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {formData.isYouTube && formData.thumbnail.includes('youtube.com') && (
                        <div className="absolute top-2 right-2 px-2 py-1 bg-blue-600 text-white text-xs rounded-md">
                          Auto
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 transition-colors aspect-video flex flex-col items-center justify-center">
                      <Image className="w-8 h-8 text-gray-400 mb-3" />
                      <button
                        type="button"
                        onClick={() => openCloudinaryWidget('image')}
                        className="text-sm font-medium text-purple-600 hover:text-purple-700"
                      >
                        Upload Thumbnail
                      </button>
                      <p className="text-xs text-gray-500 mt-1">16:9 ratio recommended</p>
                    </div>
                  )}
                </div>

                {/* Backdrop */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Backdrop <span className="text-gray-400">(Optional)</span>
                  </label>
                  
                  {formData.backdropImage ? (
                    <div className="relative group">
                      <img 
                        src={formData.backdropImage} 
                        alt="Backdrop" 
                        className="w-full aspect-video object-cover rounded-xl border border-gray-200"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all rounded-xl flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                          <button
                            type="button"
                            onClick={() => openCloudinaryWidget('backdrop')}
                            className="p-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <Image className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, backdropImage: '' }))}
                            className="p-2 bg-white text-red-600 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-gray-400 transition-colors aspect-video flex flex-col items-center justify-center">
                      <Image className="w-8 h-8 text-gray-400 mb-3" />
                      <button
                        type="button"
                        onClick={() => openCloudinaryWidget('backdrop')}
                        className="text-sm font-medium text-gray-600 hover:text-gray-700"
                      >
                        Upload Backdrop
                      </button>
                      <p className="text-xs text-gray-500 mt-1">Hero background image</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Settings Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                Publishing Settings
              </h3>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
                <div>
                  <label htmlFor="featured" className="font-medium text-gray-900 cursor-pointer">
                    Featured Content
                  </label>
                  <p className="text-sm text-gray-600">Show this video prominently on the homepage</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>

            {/* Progress Bar */}
            {isUploading && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Publishing Content</h3>
                    <p className="text-sm text-gray-600">Please wait while we process your video...</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Upload Progress</span>
                    <span className="font-medium text-gray-900">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {editingVideo && (
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingVideo(null)
                    setFormData({
                      title: '',
                      description: '',
                      type: 'praise',
                      genre: [],
                      videoUrl: '',
                      youtubeUrl: '',
                      thumbnail: '',
                      backdropImage: '',
                      duration: 0,
                      releaseYear: new Date().getFullYear(),
                      featured: false,
                      isYouTube: false
                    })
                    setUploadMethod('upload')
                  }}
                  className="sm:w-auto px-8 py-4 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    title: '',
                    description: '',
                    type: 'praise',
                    genre: [],
                    videoUrl: '',
                    youtubeUrl: '',
                    thumbnail: '',
                    backdropImage: '',
                    duration: 0,
                    releaseYear: new Date().getFullYear(),
                    featured: false,
                    isYouTube: false
                  })
                  setUploadMethod('upload')
                  if (editingVideo) {
                    setShowEditModal(false)
                    setEditingVideo(null)
                  }
                }}
                className="sm:w-auto px-8 py-4 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                {editingVideo ? 'Reset Form' : 'Reset Form'}
              </button>
              
              <button
                type="submit"
                disabled={isUploading}
                className="flex-1 sm:flex-none sm:px-12 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {editingVideo ? 'Updating...' : 'Publishing...'}
                  </>
                ) : (
                  <>
                    <Film className="w-5 h-5" />
                    {editingVideo ? 'Update Video' : 'Publish Content'}
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Recent Uploads */}
          <div className="mt-10">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">My Videos</h3>
                  <p className="text-sm text-gray-500">
                    Manage your uploaded videos from the <span className="font-mono text-xs bg-gray-100 px-1 rounded">video-upload</span> collection.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={refreshRecentUploads}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <RefreshCcw className="w-4 h-4" />
                  Refresh
                </button>
              </div>

              {isRecentLoading ? (
                <div className="flex items-center gap-3 text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Loading recent uploads...
                </div>
              ) : recentError ? (
                <div className="text-sm text-red-500">{recentError}</div>
              ) : recentUploads.length === 0 ? (
                <p className="text-sm text-gray-500">No uploads yet.</p>
              ) : (
                <div className="space-y-4">
                  {recentUploads.map((upload) => (
                    <div
                      key={upload.id}
                      className="flex flex-col md:flex-row md:items-center gap-4 border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors"
                    >
                      {upload.thumbnail && (
                        <div className="flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden bg-gray-100">
                          <img
                            src={upload.thumbnail}
                            alt={upload.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{upload.title}</p>
                        <p className="text-sm text-gray-500 truncate">
                          {upload.description || 'No description'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {upload.type
                            ? `${upload.type.charAt(0).toUpperCase()}${upload.type.slice(1)}`
                            : '—'}
                          {upload.releaseYear ? ` · ${upload.releaseYear}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            upload.sourceType === 'youtube'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {upload.sourceType === 'youtube' ? 'YouTube' : 'Uploaded'}
                        </span>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {formatDateTime(upload.createdAt)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleEdit(upload)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit video"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(upload.id)}
                          disabled={deletingVideoId === upload.id}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete video"
                        >
                          {deletingVideoId === upload.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const formatDateTime = (date?: Date) => {
  if (!date) return '—'
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date)
}