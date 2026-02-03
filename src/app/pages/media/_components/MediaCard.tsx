'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Play, Plus, CheckCircle, MoreVertical } from 'lucide-react'
import { MediaItem } from '../_lib'
import { useAuth } from '@/hooks/useAuth'
import AddToPlaylistModal from './AddToPlaylistModal'
import { isYouTubeUrl } from '@/utils/youtube'
import { getCategories, MediaCategory } from '@/lib/media-category-service'
import { getCloudinaryThumbnailUrl } from '@/utils/cloudinary'

// Cache categories to avoid repeated fetches
let categoriesCache: MediaCategory[] | null = null
let categoriesCachePromise: Promise<MediaCategory[]> | null = null

async function getCachedCategories(): Promise<MediaCategory[]> {
  if (categoriesCache) return categoriesCache
  if (categoriesCachePromise) return categoriesCachePromise

  categoriesCachePromise = getCategories().then(cats => {
    categoriesCache = cats
    return cats
  })
  return categoriesCachePromise
}

interface MediaCardProps {
  media: MediaItem
  categoryMap?: Map<string, string> // slug -> name mapping passed from parent
}

export default function MediaCard({ media, categoryMap }: MediaCardProps) {
  const router = useRouter()
  const [imageLoaded, setImageLoaded] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const { user } = useAuth()
  // Derive category name directly from map or type
  const getCategoryName = () => {
    if (categoryMap && media.type) {
      const name = categoryMap.get(media.type)
      if (name) return name
    }
    // Fallback to formatted slug if not in map
    if (media.type) {
      return media.type.charAt(0).toUpperCase() + media.type.slice(1)
    }
    return ''
  }

  const categoryName = getCategoryName()

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
      className="flex flex-col cursor-pointer group"
      onClick={handleClick}
    >
      {/* Thumbnail Container */}
      <div className="relative w-full aspect-video sm:rounded-xl overflow-hidden bg-[#0f0f0f]">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-[#272727] animate-pulse" />
        )}
        <img
          src={thumbnailUrl}
          alt={media.title}
          className={`w-full h-full object-cover ${imageLoaded ? 'opacity-100' : 'opacity-0'} group-hover:scale-[1.02] transition-all duration-500 ease-out`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            setImageLoaded(true)
            const fallback = '/movie/default-hero.jpeg'
            if (e.currentTarget.src !== fallback) {
              // Try repairing with the video URL if not already done
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
          <div className="absolute bottom-2 right-2 bg-black/90 text-white text-[10px] sm:text-[12px] font-bold px-1.5 py-0.5 rounded shadow-sm tabular-nums border border-white/5">
            {formatDuration(media.duration)}
          </div>
        )}
      </div>

      {/* Video Info */}
      <div className="flex gap-3 pt-3 px-3 sm:px-0">
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center text-white font-black text-xs sm:text-sm shadow-md mt-0.5">
          {media.title.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-white font-bold text-[14px] sm:text-[16px] xl:text-[18px] line-clamp-2 leading-tight mb-1 group-hover:text-white/90">
            {media.title}
          </h3>

          <div className="flex flex-col text-[#aaa] text-[13px] sm:text-[14px] font-medium leading-tight">
            <span className="flex items-center gap-1 hover:text-white transition-colors">
              Official
              <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-[#aaa] text-[#0f0f0f]" />
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span>{formatViews(media.views || 0)}</span>
              <span className="text-[10px] scale-150 relative top-[0.5px]">•</span>
              <span>{getTimeAgo(media.createdAt)}</span>
            </div>
          </div>

        </div>

      </div>

      {/* Action Menu (Three dots) */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation()
            // Menu logic would go here, for now just a visual placeholder or direct action
            if (user?.uid) {
              setShowAddModal(true)
            } else {
              router.push('/login')
            }
          }}
          className="p-1 hover:bg-white/10 rounded-full text-white transition-colors"
          title="More actions"
        >
          <MoreVertical className="w-5 h-5 text-white" />
        </button>
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
