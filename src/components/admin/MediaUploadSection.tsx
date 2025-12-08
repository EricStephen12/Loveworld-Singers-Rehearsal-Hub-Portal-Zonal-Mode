'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { 
  Upload, Film, Link2, X, Play, Trash2, Edit2, 
  Youtube, Cloud, Check, AlertCircle, Eye, Heart,
  Plus, MoreVertical, RefreshCw
} from 'lucide-react'
import { mediaVideosService, MediaVideo } from '@/lib/media-videos-service'
import { extractYouTubeVideoId, getYouTubeThumbnail } from '@/utils/youtube'

type UploadStep = 'list' | 'choose' | 'details'

export default function MediaUploadSection() {
  const router = useRouter()
  const { user, profile } = useAuth()
  
  const [step, setStep] = useState<UploadStep>('list')
  const [sourceType, setSourceType] = useState<'youtube' | 'cloudinary' | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [videos, setVideos] = useState<MediaVideo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingVideo, setEditingVideo] = useState<MediaVideo | null>(null)
  
  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [thumbnail, setThumbnail] = useState('')
  const [type, setType] = useState<MediaVideo['type']>('praise')
  const [featured, setFeatured] = useState(false)
  const [urlError, setUrlError] = useState('')

  useEffect(() => {
    loadVideos()
  }, [])

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

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setVideoUrl('')
    setThumbnail('')
    setType('praise')
    setFeatured(false)
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
      const videoData = {
        title: title.trim(),
        description: description.trim(),
        thumbnail,
        isYouTube,
        type: type as 'praise' | 'medley' | 'healing' | 'gfap',
        featured,
        createdBy: user?.uid || 'admin',
        createdByName: profile?.first_name || 'Admin',
        videoUrl: isYouTube ? '' : videoUrl,
        youtubeUrl: isYouTube ? videoUrl : undefined
      }

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

  // Step 1: Video List
  if (step === 'list') {
    return (
      <div className="h-full overflow-auto bg-gray-50 p-4 lg:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Videos</h1>
            <p className="text-sm text-gray-500">{videos.length} videos uploaded</p>
          </div>
          <button
            onClick={() => setStep('choose')}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add Video</span>
          </button>
        </div>

        {/* Video Grid */}
        {isLoading ? (
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
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gray-100">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleEdit(video)}
                      className="p-2 bg-white rounded-full hover:bg-gray-100"
                    >
                      <Edit2 className="w-4 h-4 text-gray-700" />
                    </button>
                    <button
                      onClick={() => handleDelete(video.id)}
                      className="p-2 bg-white rounded-full hover:bg-gray-100"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                  {/* YouTube badge */}
                  {video.isYouTube && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-red-600 text-white text-xs rounded font-medium flex items-center gap-1">
                      <Youtube className="w-3 h-3" />
                      YouTube
                    </div>
                  )}
                  {/* Featured badge */}
                  {video.featured && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 bg-yellow-500 text-white text-xs rounded font-medium">
                      Featured
                    </div>
                  )}
                </div>
                {/* Info */}
                <div className="p-3">
                  <h3 className="font-medium text-gray-900 line-clamp-1 mb-1">{video.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {video.views || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {video.likes || 0}
                    </span>
                    <span className="capitalize">{video.type}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
              <label className="block text-sm font-medium text-gray-700 mb-3">Category</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as MediaVideo['type'])}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="praise">Praise</option>
                <option value="worship">Worship</option>
                <option value="medley">Medley</option>
                <option value="healing">Healing</option>
                <option value="gfap">GFAP</option>
                <option value="live">Live</option>
                <option value="other">Other</option>
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
