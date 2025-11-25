'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useMedia } from '../../_context/MediaContext'
import { ArrowLeft, Heart, Share2, Download } from 'lucide-react'
import { firebaseMediaService, MediaItem } from '../../_lib'
import { convertToYouTubeEmbed, isYouTubeUrl } from '@/utils/youtube'

export default function PlayerPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const { incrementViews, saveWatchProgress, addToFavorites, removeFromFavorites, favorites } = useMedia()
  
  const [media, setMedia] = useState<MediaItem | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  const mediaId = params.id as string
  const isFavorited = favorites.some(fav => fav.id === mediaId)

  useEffect(() => {
    loadMedia()
  }, [mediaId])

  useEffect(() => {
    if (media) {
      incrementViews(media.id)
    }
  }, [media])

  const loadMedia = async () => {
    setIsLoading(true)
    try {
      const mediaData = await firebaseMediaService.getMediaById(mediaId)
      setMedia(mediaData)
    } catch (error) {
      console.error('Error loading media:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget
    const currentProgress = (video.currentTime / video.duration) * 100
    setProgress(currentProgress)

    // Save progress every 10 seconds
    if (Math.floor(video.currentTime) % 10 === 0) {
      saveWatchProgress(mediaId, currentProgress)
    }
  }

  const isYouTubeVideo = media?.isYouTube || (media?.videoUrl && isYouTubeUrl(media.videoUrl))
  const embedUrl = isYouTubeVideo && media?.videoUrl ? convertToYouTubeEmbed(media.videoUrl) : null

  const handleToggleFavorite = async () => {
    if (isFavorited) {
      await removeFromFavorites(mediaId)
    } else {
      await addToFavorites(mediaId)
    }
  }

  if (!user) {
    router.push('/auth')
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!media) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Media Not Found</h2>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
            <span className="font-semibold">Back</span>
          </button>

          <div className="flex items-center gap-4">
            <button
              onClick={handleToggleFavorite}
              className={`p-2 rounded-full transition-colors ${
                isFavorited ? 'bg-red-600 text-white' : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart className="w-5 h-5" fill={isFavorited ? 'currentColor' : 'none'} />
            </button>

            <button
              className="p-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
              title="Share"
            >
              <Share2 className="w-5 h-5" />
            </button>

            <button
              className="p-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Video Player */}
      <div className="relative w-full h-screen">
        {isYouTubeVideo && embedUrl ? (
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={media.title}
          />
        ) : (
          <video
            src={media.videoUrl}
            poster={media.backdropImage || media.thumbnail}
            controls
            autoPlay
            className="w-full h-full object-contain bg-black"
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => saveWatchProgress(mediaId, 100)}
          />
        )}
      </div>

      {/* Media Info */}
      <div className="relative z-10 -mt-32 px-8 pb-16">
        <div className="max-w-4xl">
          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {media.title}
          </h1>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-gray-300 mb-6">
            {media.releaseYear && (
              <span>{media.releaseYear}</span>
            )}
            {media.duration && (
              <span>{Math.floor(media.duration / 60)} min</span>
            )}
            {media.rating && (
              <span className="px-2 py-1 border border-gray-400 text-sm">
                {media.rating}/10
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-lg text-gray-300 mb-6 leading-relaxed">
            {media.description}
          </p>

          {/* Genres */}
          {media.genre && media.genre.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {media.genre.map((genre, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-white/10 text-white rounded-full text-sm"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-6 text-gray-400 text-sm">
            <div>
              <span className="font-semibold text-white">{media.views.toLocaleString()}</span> views
            </div>
            <div>
              <span className="font-semibold text-white">{media.likes.toLocaleString()}</span> likes
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
