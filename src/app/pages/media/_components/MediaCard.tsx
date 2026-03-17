'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import { MediaItem } from '../_lib'
import { useAuth } from '@/hooks/useAuth'
import AddToPlaylistModal from './AddToPlaylistModal'
import { isYouTubeUrl } from '@/utils/youtube'
import { getCloudinaryThumbnailUrl } from '@/utils/cloudinary'

interface MediaCardProps {
  media: MediaItem
  categoryMap?: Map<string, string> // slug -> name mapping passed from parent
}

export default function MediaCard({ media, categoryMap }: MediaCardProps) {
  const router = useRouter()
  const [imageLoaded, setImageLoaded] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const { user } = useAuth()

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
      if (!date) return 'Recently'

      // Convert to Date if it's a Firestore Timestamp or other types
      const dateObj = date?.toDate ? date.toDate() : (date instanceof Date ? date : new Date(date))
      if (isNaN(dateObj.getTime())) return 'Recently'

      const now = new Date()
      const diff = now.getTime() - dateObj.getTime()

      const seconds = Math.floor(diff / 1000)
      const minutes = Math.floor(seconds / 60)
      const hours = Math.floor(minutes / 60)
      const days = Math.floor(hours / 24)
      const months = Math.floor(days / 30)
      const years = Math.floor(days / 365)

      if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`
      if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`
      if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
      if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
      if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
      return 'Just now'
    } catch {
      return 'Recently'
    }
  }

  // Use thumbnail directly - it's already a proper URL from admin upload
  // Apply repair logic if it looks like a direct video URL or is missing
  const thumbnailUrl = media.thumbnail || getCloudinaryThumbnailUrl(media.videoUrl || media.youtubeUrl)

  return (
    <div
      className="flex flex-col cursor-pointer group w-full"
      onClick={handleClick}
    >
      {/* Thumbnail Container */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-900 shadow-md border border-white/5 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:shadow-indigo-500/10">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-slate-800 animate-pulse" />
        )}
        <img
          src={thumbnailUrl}
          alt={media.title}
          className={`w-full h-full object-cover ${imageLoaded ? 'opacity-100' : 'opacity-0'} group-hover:scale-105 transition-transform duration-500 ease-out`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            setImageLoaded(true)
            const fallback = '/movie/default-hero.jpeg'
            if (e.currentTarget.src !== fallback) {
              const repaired = getCloudinaryThumbnailUrl(media.videoUrl)
              if (repaired && e.currentTarget.src !== repaired) {
                e.currentTarget.src = repaired
              } else {
                e.currentTarget.src = fallback
              }
            }
          }}
        />

        {/* Duration Badge */}
        {media.duration && (
          <div className="absolute bottom-2 right-2 bg-slate-950/80 backdrop-blur-sm text-slate-200 text-[11px] font-semibold px-1.5 py-0.5 rounded-md shadow-sm tabular-nums tracking-tight border border-white/10">
            {formatDuration(media.duration)}
          </div>
        )}
      </div>

      {/* Video Info */}
      <div className="flex gap-3 pt-3.5 pr-2 relative">
        <div className="flex-shrink-0 w-[40px] h-[40px] flex items-center justify-center rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 text-slate-200 font-bold text-sm shadow-inner mt-0.5">
          {media.title.charAt(0).toUpperCase()}
        </div>

        <div className="flex flex-col min-w-0 pb-6 relative">
          <h3 className="text-slate-100 font-semibold text-[15px] sm:text-[16px] line-clamp-2 leading-snug mb-1 group-hover:text-indigo-300 transition-colors">
            {media.title}
          </h3>

          <div className="flex flex-col text-slate-400 text-[13px] font-medium">
            <span className="flex items-center gap-1.5 hover:text-slate-200 transition-colors cursor-pointer group/official">
              Official Session
              <CheckCircle className="w-4 h-4 text-indigo-400 group-hover/official:text-indigo-300" strokeWidth={2} />
            </span>
            <div className="flex items-center gap-1.5 mt-0.5 max-w-full truncate">
              <span>{formatViews(media.views || 0)}</span>
              <span className="text-[10px] opacity-60">•</span>
              <span>{getTimeAgo(media.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {user?.uid && (
        <AddToPlaylistModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          videoId={media.id}
          videoThumbnail={thumbnailUrl}
          userId={user.uid}
        />
      )}
    </div>
  )
}
