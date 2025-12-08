'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Play, MoreVertical } from 'lucide-react'
import { MediaItem } from '../_lib'
import { isYouTubeUrl } from '@/utils/youtube'

interface MediaCardProps {
  media: MediaItem
}

export default function MediaCard({ media }: MediaCardProps) {
  const router = useRouter()
  const [imageLoaded, setImageLoaded] = useState(false)
  
  // Check if this is a YouTube video
  const isYouTubeVideo = media.isYouTube || isYouTubeUrl(media.youtubeUrl || '')

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

  // Get time ago - handle both Date objects and Firestore Timestamps
  const getTimeAgo = (date: Date | { toDate?: () => Date } | any) => {
    try {
      // Convert to Date if it's a Firestore Timestamp
      const dateObj = date?.toDate ? date.toDate() : (date instanceof Date ? date : new Date(date))
      if (isNaN(dateObj.getTime())) return ''
      
      const now = new Date()
      const diff = now.getTime() - dateObj.getTime()
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const months = Math.floor(days / 30)
      const years = Math.floor(days / 365)
      
      if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`
      if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`
      if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
      return 'Just now'
    } catch {
      return ''
    }
  }

  // Use thumbnail directly - it's already a proper URL from admin upload
  const thumbnailUrl = media.thumbnail || media.backdropImage || '/movie/default-hero.jpeg'

  return (
    <div 
      className="flex flex-col cursor-pointer group"
      onClick={handleClick}
    >
      {/* Thumbnail Container - Mobile optimized with rounded corners */}
      <div className="relative w-full aspect-video rounded-lg sm:rounded-xl overflow-hidden bg-[#272727]">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#272727] to-[#1a1a1a] animate-pulse" />
        )}
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
        
        {/* Duration Badge */}
        {media.duration && (
          <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 bg-black/80 text-white text-[10px] sm:text-xs font-medium px-1 sm:px-1.5 py-0.5 rounded">
            {formatDuration(media.duration)}
          </div>
        )}

        {/* Play Button Overlay - Desktop only hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:flex items-center justify-center">
          <div className="bg-white/90 rounded-full p-3 sm:p-4 transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 sm:w-6 sm:h-6 text-black" fill="black" />
          </div>
        </div>
      </div>

      {/* Video Info - Mobile first layout */}
      <div className="flex gap-2 sm:gap-3 pt-2 sm:pt-3">
        {/* Channel Avatar */}
        <div className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <span className="text-white font-bold text-xs sm:text-sm">
            {media.title.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Video Details */}
        <div className="flex-1 min-w-0 pr-1">
          {/* Title */}
          <h3 className="text-white font-medium text-xs sm:text-sm line-clamp-2 mb-0.5 sm:mb-1 leading-tight">
            {media.title}
          </h3>

          {/* Channel Name / Type + Views */}
          <div className="flex flex-wrap items-center gap-x-1 text-gray-400 text-[11px] sm:text-xs">
            <span>{media.type ? media.type.charAt(0).toUpperCase() + media.type.slice(1) : 'LWS'}</span>
            <span>•</span>
            <span>{formatViews(media.views || 0)}</span>
            {media.createdAt && (
              <>
                <span>•</span>
                <span>{getTimeAgo(media.createdAt)}</span>
              </>
            )}
          </div>
        </div>

        {/* More Options - Always visible on mobile */}
        <button
          onClick={(e) => {
            e.stopPropagation()
          }}
          className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full hover:bg-white/10 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
        >
          <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
        </button>
      </div>
    </div>
  )
}
