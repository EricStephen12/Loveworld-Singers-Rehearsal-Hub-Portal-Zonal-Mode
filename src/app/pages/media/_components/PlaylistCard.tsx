'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Play, ListVideo, Award } from 'lucide-react'
import { firebaseMediaService } from '../_lib/firebase-media-service'

// Generic playlist type that works with both user and admin playlists
interface DisplayPlaylist {
  id: string
  name: string
  description?: string
  thumbnail?: string
  videoIds: string[]
  type?: string
  isAdmin?: boolean
}

interface PlaylistCardProps {
  playlist: DisplayPlaylist
  categoryMap?: Map<string, string>
}

export default function PlaylistCard({ playlist, categoryMap }: PlaylistCardProps) {
  const router = useRouter()
  const [firstVideoThumbnail, setFirstVideoThumbnail] = useState<string | null>(null)

  // Fetch first video's thumbnail if playlist has no thumbnail set
  useEffect(() => {
    const fetchFirstVideoThumbnail = async () => {
      if (!playlist.thumbnail && playlist.videoIds.length > 0) {
        try {
          const firstVideo = await firebaseMediaService.getMediaById(playlist.videoIds[0])
          if (firstVideo?.thumbnail) {
            setFirstVideoThumbnail(firstVideo.thumbnail)
          }
        } catch (error) {
          console.error('Error fetching first video thumbnail:', error)
        }
      }
    }
    fetchFirstVideoThumbnail()
  }, [playlist.thumbnail, playlist.videoIds])

  const handleClick = () => {
    // Handle admin playlist routing (remove admin_ prefix)
    if (playlist.isAdmin) {
      const actualId = playlist.id.replace('admin_', '')
      router.push(`/pages/media/playlists/admin/${actualId}`)
    } else {
      router.push(`/pages/media/playlists/${playlist.id}`)
    }
  }

  const categoryName = playlist.type && categoryMap?.get(playlist.type)
  const displayThumbnail = playlist.thumbnail || firstVideoThumbnail

  return (
    <div onClick={handleClick} className="cursor-pointer group">
      {/* Thumbnail */}
      <div className="relative w-full aspect-video bg-[#272727] rounded-xl overflow-hidden mb-3">
        {displayThumbnail ? (
          <img
            src={displayThumbnail}
            alt={playlist.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#272727]">
            <ListVideo className="w-16 h-16 text-gray-600" />
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
            <Play className="w-6 h-6 text-black ml-0.5" fill="black" />
          </div>
        </div>

        {/* Playlist badge */}
        <div
          className={`absolute top-2 left-2 px-2 py-1 rounded flex items-center gap-1.5 ${
            playlist.isAdmin ? 'bg-purple-600/90' : 'bg-black/70'
          }`}
        >
          {playlist.isAdmin ? (
            <>
              <Award className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Official</span>
            </>
          ) : (
            <>
              <ListVideo className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Playlist</span>
            </>
          )}
        </div>

        {/* Video count */}
        <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs font-medium">
          {playlist.videoIds.length} videos
        </div>
      </div>

      {/* Info */}
      <div className="flex gap-3">
        {/* Playlist icon */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0">
          <ListVideo className="w-4 h-4 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm line-clamp-2 group-hover:text-gray-300 transition-colors">
            {playlist.name}
          </h3>
          <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
            {categoryName && (
              <>
                <span>{categoryName}</span>
                <span>•</span>
              </>
            )}
            <span>{playlist.videoIds.length} videos</span>
          </div>
          {playlist.description && (
            <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{playlist.description}</p>
          )}
        </div>
      </div>
    </div>
  )
}
