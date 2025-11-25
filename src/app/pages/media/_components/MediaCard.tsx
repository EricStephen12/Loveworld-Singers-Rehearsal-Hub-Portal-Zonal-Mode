'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Play, Plus, ThumbsUp, ThumbsDown, Check, ChevronDown } from 'lucide-react'
import { MediaItem } from '../_lib'
import { useMedia } from '../_context/MediaContext'
import YouTubeThumbnail from '@/components/YouTubeThumbnail'
import { isYouTubeUrl } from '@/utils/youtube'

interface MediaCardProps {
  media: MediaItem
}

export default function MediaCard({ media }: MediaCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const router = useRouter()
  const { addToFavorites, removeFromFavorites, favorites } = useMedia()

  const isFavorited = favorites.some(fav => fav.id === media.id)
  
  // Check if this is a YouTube video (fallback detection)
  const isYouTubeVideo = media.isYouTube || isYouTubeUrl(media.videoUrl || '') || isYouTubeUrl(media.thumbnail || '')

  const handlePlay = () => {
    router.push(`/pages/media/player/${media.id}`)
  }

  const handleToggleFavorite = async () => {
    if (isFavorited) {
      await removeFromFavorites(media.id)
    } else {
      await addToFavorites(media.id)
    }
  }

  return (
    <div
      className="relative group cursor-pointer transition-transform duration-300 hover:scale-105 hover:z-50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail */}
      {isYouTubeVideo ? (
        <YouTubeThumbnail
          url={media.videoUrl || media.thumbnail}
          alt={media.title}
          className="w-full h-full object-cover rounded-md"
          onClick={handlePlay}
        />
      ) : (
        <img
          src={media.thumbnail}
          alt={media.title}
          className="w-full h-full object-cover rounded-md"
          onClick={handlePlay}
        />
      )}

      {/* Hover Card */}
      {isHovered && (
        <div className="absolute top-0 left-0 w-80 bg-zinc-900 rounded-md shadow-2xl border border-gray-700 transition-all duration-300 -translate-y-16">
          {/* Image/Video Preview */}
          <div className="relative h-44">
            {isYouTubeVideo ? (
              <YouTubeThumbnail
                url={media.videoUrl || media.backdropImage || media.thumbnail}
                alt={media.title}
                className="w-full h-full object-cover rounded-t-md"
              />
            ) : (
              <img
                src={media.backdropImage || media.thumbnail}
                alt={media.title}
                className="w-full h-full object-cover rounded-t-md"
              />
            )}
            {/* Play overlay */}
            <div 
              className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
              onClick={handlePlay}
            >
              <Play className="w-16 h-16 text-white" fill="white" />
            </div>
          </div>

          {/* Info */}
          <div className="p-4 space-y-3">
            {/* Title */}
            <h3 
              className="text-white font-semibold text-lg cursor-pointer hover:underline"
              onClick={handlePlay}
            >
              {media.title}
            </h3>

            {/* Action Icons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Play */}
                <button
                  onClick={handlePlay}
                  className="p-2 bg-white hover:bg-gray-200 rounded-full transition-colors"
                  title="Play"
                >
                  <Play className="w-4 h-4 text-black" fill="black" />
                </button>

                {/* Add to List / Remove from List */}
                <button
                  onClick={handleToggleFavorite}
                  className="p-2 border-2 border-gray-400 hover:border-white rounded-full transition-colors"
                  title={isFavorited ? 'Remove from List' : 'Add to List'}
                >
                  {isFavorited ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <Plus className="w-4 h-4 text-white" />
                  )}
                </button>

                {/* Like */}
                <button
                  className="p-2 border-2 border-gray-400 hover:border-white rounded-full transition-colors"
                  title="Like"
                >
                  <ThumbsUp className="w-4 h-4 text-white" />
                </button>

                {/* Dislike */}
                <button
                  className="p-2 border-2 border-gray-400 hover:border-white rounded-full transition-colors"
                  title="Dislike"
                >
                  <ThumbsDown className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* More Info */}
              <button
                className="p-2 border-2 border-gray-400 hover:border-white rounded-full transition-colors"
                title="More Info"
              >
                <ChevronDown className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Genres */}
            {media.genre && media.genre.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {media.genre.map((genre, index) => (
                  <span
                    key={index}
                    className="text-xs text-gray-400"
                  >
                    {genre}
                    {index < media.genre.length - 1 && ' •'}
                  </span>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-4 text-xs text-gray-400">
              {media.views > 0 && (
                <span>{media.views.toLocaleString()} views</span>
              )}
              {media.duration && (
                <span>{Math.floor(media.duration / 60)} min</span>
              )}
              {media.releaseYear && (
                <span>{media.releaseYear}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
