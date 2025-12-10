'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { getAdminPlaylist, AdminPlaylist } from '@/lib/admin-playlist-service'
import { firebaseMediaService } from '../../../_lib/firebase-media-service'
import { ArrowLeft, Play, Shuffle, ListVideo, Award } from 'lucide-react'

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
  const playlistId = params.id as string
  const { profile, isLoading: authLoading } = useAuth()
  const [playlist, setPlaylist] = useState<AdminPlaylist | null>(null)
  const [videos, setVideos] = useState<MediaVideo[]>([])
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
        const videoPromises = data.videoIds.map(id => firebaseMediaService.getMediaById(id))
        const videoResults = await Promise.all(videoPromises)
        setVideos(videoResults.filter(Boolean) as MediaVideo[])
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
        <div className="w-12 h-12 border-4 border-gray-700 border-t-red-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0f0f0f] h-14 flex items-center gap-3 px-4">
        <button onClick={() => router.push('/pages/media/playlists')} className="p-2 hover:bg-white/10 rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold truncate">{playlist?.name || 'Playlist'}</h1>
        {playlist && (
          <span className="ml-auto flex items-center gap-1 text-xs bg-purple-600/90 px-2 py-1 rounded">
            <Award className="w-3 h-3" />
            Official
          </span>
        )}
      </header>

      {loading ? (
        <div className="p-4 space-y-4">
          <div className="w-full aspect-video bg-[#272727] rounded-xl animate-pulse" />
          <div className="h-6 bg-[#272727] rounded w-1/2 animate-pulse" />
          <div className="flex gap-3">
            <div className="h-10 bg-[#272727] rounded-full w-32 animate-pulse" />
            <div className="h-10 bg-[#272727] rounded-full w-32 animate-pulse" />
          </div>
        </div>
      ) : playlist ? (
        <>
          {/* Playlist Header */}
          <div className="p-4">
            {/* Thumbnail */}
            <div className="w-full max-w-sm mx-auto aspect-video bg-[#272727] rounded-xl overflow-hidden mb-4">
              {playlist.thumbnail ? (
                <img src={playlist.thumbnail} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ListVideo className="w-16 h-16 text-gray-600" />
                </div>
              )}
            </div>

            {/* Info */}
            <h2 className="text-xl font-bold mb-1">{playlist.name}</h2>
            {playlist.description && (
              <p className="text-gray-400 text-sm mb-2">{playlist.description}</p>
            )}
            <p className="text-gray-500 text-sm mb-1">{videos.length} videos</p>
            <p className="text-xs text-purple-400 mb-4 flex items-center gap-1">
              <Award className="w-3 h-3" />
              Official Playlist
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={playAll}
                disabled={videos.length === 0}
                className="flex items-center gap-2 px-6 py-2.5 bg-white text-black rounded-full font-medium hover:bg-gray-200 disabled:opacity-50"
              >
                <Play className="w-5 h-5" fill="black" />
                Play all
              </button>
              <button
                onClick={shufflePlay}
                disabled={videos.length === 0}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#272727] rounded-full font-medium hover:bg-[#3f3f3f] disabled:opacity-50"
              >
                <Shuffle className="w-5 h-5" />
                Shuffle
              </button>
            </div>
          </div>

          {/* Video List */}
          <div className="px-4 pb-6">
            {videos.length > 0 ? (
              <div className="space-y-3">
                {videos.map((video, index) => (
                  <div key={video.id} className="flex gap-3 group relative">
                    <span className="text-gray-500 text-sm w-6 flex-shrink-0 pt-2">{index + 1}</span>
                    
                    {/* Thumbnail */}
                    <div 
                      onClick={() => router.push(`/pages/media/player/${video.id}?adminPlaylist=${playlistId}`)}
                      className="w-40 aspect-video bg-[#272727] rounded-lg overflow-hidden relative cursor-pointer flex-shrink-0"
                    >
                      {video.thumbnail ? (
                        <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Play className="w-8 h-8 text-gray-600" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 
                        onClick={() => router.push(`/pages/media/player/${video.id}?adminPlaylist=${playlistId}`)}
                        className="font-medium line-clamp-2 cursor-pointer hover:text-gray-300 text-sm"
                      >
                        {video.title}
                      </h3>
                      {video.views !== undefined && (
                        <p className="text-xs text-gray-500 mt-1">{video.views.toLocaleString()} views</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400">
                <p>No videos in this playlist</p>
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
