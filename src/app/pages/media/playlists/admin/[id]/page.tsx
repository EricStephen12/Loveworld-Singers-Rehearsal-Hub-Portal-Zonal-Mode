'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { getAdminPlaylist, AdminPlaylist } from '@/lib/admin-playlist-service'
import { firebaseMediaService, MediaItem } from '../../../_lib/firebase-media-service'
import YouTubeHeader from '../../../_components/YouTubeHeader'
import YouTubeSidebar from '../../../_components/YouTubeSidebar'
import {
  ArrowLeft,
  Play,
  Shuffle,
  ListVideo,
  MoreVertical,
  Layers,
  ChevronRight,
  Clock,
  Share2,
  CheckCircle,
  X,
  Search
} from 'lucide-react'

export default function AdminPlaylistDetailPage() {
  const router = useRouter()
  const params = useParams()
  const playlistId = params?.id as string
  const { profile, isLoading: authLoading } = useAuth()

  const [playlist, setPlaylist] = useState<AdminPlaylist | null>(null)
  const [videos, setVideos] = useState<MediaItem[]>([])
  const [nestedPlaylists, setNestedPlaylists] = useState<AdminPlaylist[]>([])
  const [loading, setLoading] = useState(true)

  // Header State
  const [searchQuery, setSearchQuery] = useState('')
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    if (playlistId) {
      loadPlaylist()
    }
  }, [playlistId])

  const loadPlaylist = async () => {
    setLoading(true)
    try {
      // 1. Fetch Playlist Metadata
      const data = await getAdminPlaylist(playlistId)
      setPlaylist(data)

      if (data) {
        // 2. Fetch Videos efficiently (Batch limit handled in service)
        if (data.videoIds.length) {
          const fetchedVideos = await firebaseMediaService.getMediaByIds(data.videoIds)
          setVideos(fetchedVideos)
        }

        // 3. Fetch Nested Playlists (Usually few, so Promise.all is fine)
        if (data.childPlaylistIds?.length) {
          const nestedPromises = data.childPlaylistIds.map((id) => getAdminPlaylist(id))
          const nestedResults = await Promise.all(nestedPromises)
          setNestedPlaylists(nestedResults.filter(Boolean) as AdminPlaylist[])
        }
      }
    } catch (error) {
      console.error('Error loading playlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const playAll = () => {
    if (videos.length > 0) {
      // Pass the playlist ID so the player knows to load the queue
      router.push(`/pages/media/player/${videos[0].id}?adminPlaylist=${playlistId}`)
    }
  }

  const shufflePlay = () => {
    if (videos.length > 0) {
      const randomIndex = Math.floor(Math.random() * videos.length)
      router.push(`/pages/media/player/${videos[randomIndex].id}?adminPlaylist=${playlistId}&shuffle=1`)
    }
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (authLoading && !profile) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-gray-700 border-t-red-600 rounded-full animate-spin" />
      </div>
    )
  }

  const totalItems = videos.length + nestedPlaylists.length

  const handleBack = () => {
    // Explicit Navigation: Always go to Media Library
    router.push('/pages/media')
  }

  return (
    <div className="h-screen overflow-hidden bg-[#0f0f0f] text-white flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0f0f0f]">
        <YouTubeHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          showMobileSearch={showMobileSearch}
          setShowMobileSearch={setShowMobileSearch}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          userName={profile?.first_name || profile?.display_name || profile?.email || undefined}
        />
      </div>

      <div className="flex flex-1 pt-14 overflow-hidden">
        {/* Sidebar - Desktop Only */}
        <YouTubeSidebar
          sidebarOpen={isSidebarOpen}
          viewMode="all"
          selectedCategory="all"
          setViewMode={() => { }}
          setSelectedCategory={() => { }}
          categories={[]} // Future: fetch categories here too
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto scrollbar-hide bg-[#0f0f0f] relative">
          {loading ? (
            <div className="max-w-[1700px] mx-auto p-4 lg:p-8 flex flex-col lg:flex-row gap-8">
              <div className="lg:w-[360px] flex-shrink-0 space-y-4">
                <div className="aspect-video bg-[#272727] rounded-xl animate-pulse" />
                <div className="h-6 bg-[#272727] rounded w-3/4 animate-pulse" />
              </div>
              <div className="flex-1 space-y-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-20 bg-[#272727] rounded-xl animate-pulse" />
                ))}
              </div>
            </div>
          ) : playlist ? (
            <div className="min-h-full pb-20">
              {/* Immersive Background (Mobile Only) */}
              <div className="lg:hidden absolute top-0 left-0 w-full h-[300px] overflow-hidden pointer-events-none">
                <img
                  src={playlist.thumbnail || videos[0]?.thumbnail || ''}
                  alt=""
                  className="w-full h-full object-cover blur-3xl opacity-30 scale-125"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0f0f0f]/60 to-[#0f0f0f]" />
              </div>

              <div className="max-w-[2400px] mx-auto flex flex-col lg:flex-row lg:p-8 lg:px-6 xl:px-12 gap-8 xl:gap-12 relative z-10 transition-all">
                {/* Left Panel: Playlist Info (Sticky on Desktop) */}
                <div className="w-full lg:w-[450px] xl:w-[500px] 2xl:w-[600px] lg:flex-shrink-0 lg:sticky lg:top-8 lg:h-fit">
                  <div className="relative flex flex-col gap-6 p-4 lg:p-0 text-center lg:text-left">
                    {/* Thumbnail */}
                    <div className="relative aspect-video lg:aspect-square rounded-xl overflow-hidden bg-[#272727] group shadow-2xl mx-auto w-full max-w-[400px] lg:max-w-none">
                      <img
                        src={playlist.thumbnail || videos[0]?.thumbnail || ''}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute inset-0 hidden lg:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={playAll} className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
                          <Play className="w-8 h-8 text-white fill-white" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h1 className="text-2xl lg:text-3xl font-bold leading-tight line-clamp-2">{playlist.name}</h1>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold flex items-center justify-center lg:justify-start gap-1">
                          Official <CheckCircle className="w-3.5 h-3.5 text-[#aaa] fill-[#aaa] text-[#0f0f0f]" />
                        </p>
                        <p className="text-xs text-[#aaa]">
                          {totalItems} items • Updated {videos.length > 0 ? 'recently' : 'now'}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={playAll}
                          disabled={videos.length === 0}
                          className="flex-1 flex items-center justify-center gap-2 h-10 bg-white text-black rounded-full text-sm font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                          <Play className="w-4 h-4 fill-black" /> Play all
                        </button>
                        <button
                          onClick={shufflePlay}
                          disabled={videos.length === 0}
                          className="flex-1 flex items-center justify-center gap-2 h-10 bg-white/10 text-white rounded-full text-sm font-bold hover:bg-white/20 transition-colors disabled:opacity-50"
                        >
                          <Shuffle className="w-4 h-4" /> Shuffle
                        </button>
                      </div>

                      {playlist.description && (
                        <p className="text-sm text-[#aaa] whitespace-pre-wrap leading-relaxed line-clamp-3 lg:line-clamp-none">
                          {playlist.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Content List */}
                <div className="flex-1 px-4 lg:px-0">
                  {nestedPlaylists.length > 0 && (
                    <div className="mb-10">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 px-2">Sub-Collections</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {nestedPlaylists.map((nested) => (
                          <div
                            key={nested.id}
                            onClick={() => router.push(`/pages/media/playlists/admin/${nested.id}`)}
                            className="flex items-center gap-4 p-2 bg-transparent hover:bg-white/5 rounded-xl cursor-pointer transition-colors group"
                          >
                            <div className="w-32 aspect-video bg-[#272727] rounded-lg overflow-hidden flex-shrink-0 relative shadow-lg">
                              <img src={nested.thumbnail || ''} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                              <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 rounded text-[10px] font-bold">
                                {nested.videoIds.length}
                              </div>
                              <div className="absolute right-0 top-0 bottom-0 w-8 bg-black/40 flex items-center justify-center backdrop-blur-sm">
                                <Layers className="w-4 h-4 text-white" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-[15px] line-clamp-1 group-hover:text-white transition-colors">{nested.name}</h4>
                              <p className="text-xs text-[#aaa] mt-0.5">Playlist</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    {videos
                      .filter(v =>
                        v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        v.description?.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map((video, index) => (
                        <div
                          key={video.id}
                          onClick={() => router.push(`/pages/media/player/${video.id}?adminPlaylist=${playlistId}`)}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/10 transition-colors group"
                        >
                          <div className="w-6 text-sm text-[#aaa] font-medium flex items-center justify-center flex-shrink-0">
                            <span className="group-hover:hidden">{index + 1}</span>
                            <Play className="hidden group-hover:block w-3.5 h-3.5 text-white fill-white" />
                          </div>

                          <div className="w-28 sm:w-40 xl:w-52 aspect-video bg-[#272727] rounded-lg overflow-hidden flex-shrink-0 relative shadow-md">
                            <img src={video.thumbnail} className="w-full h-full object-cover" />
                            <span className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-bold">
                              {formatDuration(video.duration)}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-[15px] sm:text-[16px] xl:text-[17px] line-clamp-2 leading-tight mb-1">{video.title}</h4>
                            <div className="flex items-center gap-1 text-[13px] text-[#aaa]">
                              <span className="flex items-center gap-1 text-[12px] sm:text-[13px]">Official <CheckCircle className="w-3.5 h-3.5 fill-[#aaa] text-[#0f0f0f]" /></span>
                              <span className="text-[10px]">•</span>
                              <span>{(video.views || 0).toLocaleString()} views</span>
                            </div>
                          </div>

                          <button className="p-2 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded-full transition-opacity">
                            <MoreVertical className="w-5 h-5 text-[#aaa]" />
                          </button>
                        </div>
                      ))}
                  </div>

                  {totalItems === 0 && (
                    <div className="flex flex-col items-center justify-center py-40 text-center px-6">
                      <div className="w-20 h-20 bg-[#272727] rounded-full flex items-center justify-center mb-6">
                        <ListVideo className="w-10 h-10 text-[#aaa]" />
                      </div>
                      <h2 className="text-xl font-bold mb-2">This playlist is empty</h2>
                      <p className="text-[#aaa] text-sm">Videos added by admin will appear here.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-40">
              <p className="text-[#aaa]">Playlist not found</p>
              <button onClick={handleBack} className="mt-4 text-blue-500 hover:underline">
                Go back
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
