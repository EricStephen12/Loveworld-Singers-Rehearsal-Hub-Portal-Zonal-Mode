'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { getAdminPlaylist, AdminPlaylist } from '@/lib/admin-playlist-service'
import { firebaseMediaService } from '../../../_lib/firebase-media-service'
import {
  ArrowLeft,
  Play,
  Shuffle,
  ListVideo,
  MoreVertical,
  Layers,
  ChevronRight,
} from 'lucide-react'

interface MediaVideo {
  id: string
  title: string
  thumbnail?: string
  duration?: string
  views?: number
}

export default function AdminPlaylistDetailPage() {
  const router = useRouter()
  const params = useParams()
  const playlistId = params?.id as string
  const { profile, isLoading: authLoading } = useAuth()
  const [playlist, setPlaylist] = useState<AdminPlaylist | null>(null)
  const [videos, setVideos] = useState<MediaVideo[]>([])
  const [nestedPlaylists, setNestedPlaylists] = useState<AdminPlaylist[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (playlistId) {
      loadPlaylist()
    }
  }, [playlistId])

  const loadPlaylist = async () => {
    setLoading(true)
    try {
      const data = await getAdminPlaylist(playlistId)
      setPlaylist(data)

      if (data?.videoIds.length) {
        const videoPromises = data.videoIds.map((id) => firebaseMediaService.getMediaById(id))
        const videoResults = await Promise.all(videoPromises)
        setVideos(videoResults.filter(Boolean) as MediaVideo[])
      }

      if (data?.childPlaylistIds?.length) {
        const nestedPromises = data.childPlaylistIds.map((id) => getAdminPlaylist(id))
        const nestedResults = await Promise.all(nestedPromises)
        setNestedPlaylists(nestedResults.filter(Boolean) as AdminPlaylist[])
      }
    } catch (error) {
      console.error('Error loading playlist:', error)
    }
    setLoading(false)
  }

  const playAll = () => {
    if (videos.length > 0) {
      router.push(`/pages/media/player/${videos[0].id}?adminPlaylist=${playlistId}`)
    }
  }

  const shufflePlay = () => {
    if (videos.length > 0) {
      const randomIndex = Math.floor(Math.random() * videos.length)
      router.push(`/pages/media/player/${videos[randomIndex].id}?adminPlaylist=${playlistId}&shuffle=1`)
    }
  }

  if (authLoading && !profile) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-gray-700 border-t-red-600 rounded-full animate-spin" />
      </div>
    )
  }

  const totalItems = videos.length + nestedPlaylists.length

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Minimal Header */}
      <header className="sticky top-0 z-50 bg-[#0f0f0f]/95 backdrop-blur-sm">
        <div className="h-14 flex items-center gap-3 px-4">
          <button onClick={() => router.push('/pages/media')} className="p-2 hover:bg-white/10 rounded-full -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      </header>

      {loading ? (
        <div className="p-4">
          <div className="bg-gradient-to-b from-purple-900/30 to-transparent rounded-2xl p-4">
            <div className="w-full aspect-video max-w-[280px] mx-auto bg-[#272727] rounded-xl animate-pulse mb-4" />
            <div className="h-6 bg-[#272727] rounded w-1/2 mx-auto mb-2 animate-pulse" />
            <div className="h-4 bg-[#272727] rounded w-1/3 mx-auto animate-pulse" />
          </div>
        </div>
      ) : playlist ? (
        <>
          {/* YouTube-style Playlist Header with gradient */}
          <div className="bg-gradient-to-b from-purple-900/40 via-purple-900/20 to-transparent">
            <div className="px-4 pb-6 pt-2">
              {/* Large centered thumbnail */}
              <div className="w-full max-w-[280px] mx-auto mb-4">
                <div className="relative aspect-video bg-[#272727] rounded-xl overflow-hidden shadow-2xl">
                  {playlist.thumbnail ? (
                    <img src={playlist.thumbnail} alt="" className="w-full h-full object-cover" />
                  ) : videos[0]?.thumbnail ? (
                    <img src={videos[0].thumbnail} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/50 to-[#1a1a1a]">
                      <ListVideo className="w-16 h-16 text-gray-500" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer" onClick={playAll}>
                    <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center">
                      <Play className="w-7 h-7 text-black ml-1" fill="black" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Centered playlist info */}
              <div className="text-center">
                <h1 className="text-xl font-bold mb-2">{playlist.name}</h1>
                {playlist.description && (
                  <p className="text-sm text-gray-400 mb-3 line-clamp-2 max-w-md mx-auto">{playlist.description}</p>
                )}
                <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-4">
                  <span className="text-purple-400 font-medium">Official Playlist</span>
                  <span>•</span>
                  <span>{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
                </div>

                {/* Main action buttons */}
                <div className="flex items-center justify-center gap-2 mb-2">
                  <button onClick={playAll} disabled={videos.length === 0}
                    className="flex items-center gap-2 px-6 py-2.5 bg-white text-black rounded-full font-medium hover:bg-gray-100 disabled:opacity-50 transition-colors">
                    <Play className="w-5 h-5" fill="black" />
                    Play all
                  </button>
                  <button onClick={shufflePlay} disabled={videos.length === 0}
                    className="flex items-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/20 rounded-full font-medium disabled:opacity-50 transition-colors">
                    <Shuffle className="w-5 h-5" />
                    Shuffle
                  </button>
                </div>


              </div>
            </div>
          </div>

          {/* Content List */}
          <div className="pb-20">
            {/* Nested Playlists */}
            {nestedPlaylists.length > 0 && (
              <div className="border-b border-white/5">
                <div className="px-4 py-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium text-gray-300">Playlists ({nestedPlaylists.length})</span>
                </div>
                <div className="px-4 pb-3 space-y-1">
                  {nestedPlaylists.map((nested) => (
                    <div key={nested.id} onClick={() => router.push(`/pages/media/playlists/admin/${nested.id}`)}
                      className="flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-white/5 cursor-pointer group">
                      <div className="w-28 aspect-video bg-[#272727] rounded-lg overflow-hidden flex-shrink-0 relative">
                        {nested.thumbnail ? (
                          <img src={nested.thumbnail} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ListVideo className="w-6 h-6 text-gray-600" />
                          </div>
                        )}
                        <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[10px]">
                          {nested.videoIds.length}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-2">{nested.name}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">{nested.videoIds.length} videos</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Videos */}
            {videos.length > 0 && (
              <div>
                {nestedPlaylists.length > 0 && (
                  <div className="px-4 py-3 flex items-center gap-2 border-b border-white/5">
                    <Play className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-300">Videos ({videos.length})</span>
                  </div>
                )}
                <div>
                  {videos.map((video, index) => (
                    <div key={video.id} onClick={() => router.push(`/pages/media/player/${video.id}?adminPlaylist=${playlistId}`)}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 cursor-pointer group">
                      <span className="text-gray-500 text-sm w-6 text-center flex-shrink-0">{index + 1}</span>
                      <div className="w-28 sm:w-32 aspect-video bg-[#272727] rounded-lg overflow-hidden flex-shrink-0 relative">
                        {video.thumbnail ? (
                          <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Play className="w-6 h-6 text-gray-600" />
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Play className="w-8 h-8" fill="white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-2">{video.title}</h4>
                        {video.views !== undefined && (
                          <p className="text-xs text-gray-500 mt-0.5">{video.views.toLocaleString()} views</p>
                        )}
                      </div>
                      <button onClick={(e) => e.stopPropagation()} className="p-2 hover:bg-white/10 rounded-full opacity-0 group-hover:opacity-100">
                        <MoreVertical className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {videos.length === 0 && nestedPlaylists.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="w-20 h-20 bg-[#272727] rounded-full flex items-center justify-center mb-4">
                  <ListVideo className="w-10 h-10 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium mb-1">Empty playlist</h3>
                <p className="text-gray-400 text-sm text-center">No content yet</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-gray-400">Playlist not found</p>
        </div>
      )}
    </div>
  )
}
