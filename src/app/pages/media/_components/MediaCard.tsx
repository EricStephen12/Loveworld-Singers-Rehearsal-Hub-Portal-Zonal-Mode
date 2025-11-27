'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Play, MoreVertical } from 'lucide-react'
import { MediaItem } from '../_lib'
import YouTubeThumbnail from '@/components/YouTubeThumbnail'
import { isYouTubeUrl } from '@/utils/youtube'

interface MediaCardProps {
  media: MediaItem
}

export default function MediaCard({ media }: MediaCardProps) {
  const router = useRouter()
  const [imageLoaded, setImageLoaded] = useState(false)
  
  // Check if this is a YouTube video
  const isYouTubeVideo =
    media.isYouTube ||
    isYouTubeUrl(media.youtubeUrl || '') ||
    isYouTubeUrl(media.videoUrl || '') ||
    isYouTubeUrl(media.thumbnail || '')

  const handleClick = () => {
    router.push(`/pages/media/player/${media.id}`)
  }

  // Format duration
  const formatDuration = (seconds?: number) => {
    if (!seconds) return ''
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  // Format views
  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M views`
    }
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K views`
    }
    return `${views} views`
  }

  // Get time ago
  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const months = Math.floor(days / 30)
    const years = Math.floor(days / 365)
    
    if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`
    if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
    return 'Just now'
  }

  const videoSource = media.youtubeUrl || media.videoUrl || ''
  const thumbnailUrl = isYouTubeVideo 
    ? (videoSource || media.thumbnail || '')
    : (media.thumbnail || media.backdropImage || '/movie/default-hero.jpeg')

  return (
    <div 
      className="flex flex-col cursor-pointer group"
      onClick={handleClick}
    >
      {/* Thumbnail Container */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-[#272727] group-hover:rounded-b-none transition-all duration-200">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#272727] to-[#1a1a1a] animate-pulse" />
        )}
        {isYouTubeVideo && thumbnailUrl ? (
          <YouTubeThumbnail
            url={thumbnailUrl}
            alt={media.title}
            className={`w-full h-full object-cover ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
            onLoad={() => setImageLoaded(true)}
            fallbackSrc="/movie/default-hero.jpeg"
          />
        ) : (
          <img
            src={thumbnailUrl}
            alt={media.title}
            className={`w-full h-full object-cover ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              setImageLoaded(true)
              if (e.currentTarget.src !== '/movie/default-hero.jpeg') {
                e.currentTarget.src = '/movie/default-hero.jpeg'
              }
            }}
          />
        )}
        
        {/* Duration Badge */}
        {media.duration && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-medium px-1.5 py-0.5 rounded">
            {formatDuration(media.duration)}
          </div>
        )}

        {/* Play Button Overlay (on hover) */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="bg-white/90 rounded-full p-4 transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-6 h-6 text-black" fill="black" />
          </div>
        </div>
      </div>

      {/* Video Info */}
      <div className="flex gap-3 pt-3 px-1">
        {/* Channel Avatar Placeholder */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <span className="text-white font-bold text-sm">
            {media.title.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Video Details */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="text-white font-medium text-sm line-clamp-2 mb-1 group-hover:text-blue-400 transition-colors">
            {media.title}
          </h3>

          {/* Channel Name / Type */}
          <p className="text-gray-400 text-xs mb-1">
            {media.type ? media.type.charAt(0).toUpperCase() + media.type.slice(1) : 'LoveWorld Singers'}
          </p>

          {/* Views and Time */}
          <div className="flex items-center gap-1 text-gray-400 text-xs">
            <span>{formatViews(media.views || 0)}</span>
            {media.createdAt && (
              <>
                <span>•</span>
                <span>{getTimeAgo(media.createdAt)}</span>
              </>
            )}
          </div>
        </div>

        {/* More Options */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            // Handle more options
          }}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreVertical className="w-5 h-5 text-gray-400" />
        </button>
      </div>
    </div>
  )
}
