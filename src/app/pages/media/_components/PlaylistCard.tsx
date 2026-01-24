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
    <div onClick={handleClick} className="cursor-pointer group flex flex-col gap-3">
      {/* Thumbnail Container */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-[#0a0a0a]">
        {displayThumbnail ? (
          <img
            src={displayThumbnail}
            alt={playlist.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#272727]">
            <ListVideo className="w-12 h-12 text-white opacity-20" />
          </div>
        )}

        {/* Playlist identity overlay - Bottom Right like YT */}
        <div className="absolute bottom-1.5 right-1.5 bg-black/90 text-white px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1.5">
          <ListVideo className="w-4 h-4" />
          <span>{playlist.videoIds.length} VIDEOS</span>
        </div>

        {/* Play Overlay on Hover */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Play className="w-10 h-10 text-white fill-white opacity-80" />
        </div>
      </div>

      {/* Info */}
      <div className="flex gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-base text-white line-clamp-2 leading-tight mb-1">
            {playlist.name}
          </h3>
          <div className="flex flex-col text-[#aaa] text-sm">
            <span className="font-medium hover:text-white transition-colors">
              {playlist.isAdmin ? 'LWS Official' : 'View full playlist'}
            </span>
            {categoryName && (
              <span className="text-xs opacity-60 mt-0.5 uppercase tracking-wider">{categoryName}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
