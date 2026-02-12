'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import {
  getPlaylist,
  removeFromPlaylist,
  getPlaylistItems,
  getAddablePlaylistsForUser,
  addPlaylistToPlaylist,
  removePlaylistFromPlaylist,
  Playlist
} from '../../_lib/playlist-service'
import { MediaItem } from '../../_lib/firebase-media-service'
import {
  Play, Shuffle, MoreVertical, Trash2, ListVideo,
  Plus, X, Globe, Lock
} from 'lucide-react'
import YouTubeHeader from '../../_components/YouTubeHeader'
import YouTubeSidebar from '../../_components/YouTubeSidebar'

export default function PlaylistDetailPage() {
  const router = useRouter()
  const params = useParams()
  const playlistId = params?.id as string
  const { user, profile, isLoading: authLoading } = useAuth()
  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [videos, setVideos] = useState<MediaItem[]>([])
  const [nestedPlaylists, setNestedPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [showAddPlaylistModal, setShowAddPlaylistModal] = useState(false)
  const [addablePlaylists, setAddablePlaylists] = useState<Playlist[]>([])
  const [loadingAddable, setLoadingAddable] = useState(false)

  // YouTube UI States
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'all' | 'shorts'>('all')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    if (playlistId) loadPlaylist()
  }, [playlistId])

  const loadPlaylist = async () => {
    setLoading(true)
    try {
      const data = await getPlaylist(playlistId)
      setPlaylist(data)

      if (data) {
        const { videos: vids, playlists: nested } = await getPlaylistItems(playlistId)
        setVideos(vids)
        setNestedPlaylists(nested)
      }
    } catch (error) {
      console.error('Error loading playlist:', error)
    }
    setLoading(false)
  }

  const loadAddablePlaylists = async () => {
    if (!user?.uid) return
    setLoadingAddable(true)
    try {
      const data = await getAddablePlaylistsForUser(user.uid, playlistId)
      const existingIds = nestedPlaylists.map(p => p.id)
      setAddablePlaylists(data.filter(p => !existingIds.includes(p.id)))
    } catch (error) {
      console.error('Error loading addable playlists:', error)
    }
    setLoadingAddable(false)
  }

  const handleRemoveVideo = async (videoId: string) => {
    if (!playlist) return
    try {
      await removeFromPlaylist(playlist.id, videoId)
      setVideos(prev => prev.filter(v => v.id !== videoId))
      setPlaylist(prev => prev ? { ...prev, videoIds: prev.videoIds.filter(id => id !== videoId) } : null)
    } catch (error) {
      console.error('Error removing video:', error)
    }
    setMenuOpen(null)
  }

  const handleRemoveNestedPlaylist = async (childId: string) => {
    if (!playlist) return
    try {
      await removePlaylistFromPlaylist(playlist.id, childId)
      setNestedPlaylists(prev => prev.filter(p => p.id !== childId))
    } catch (error) {
      console.error('Error removing nested playlist:', error)
    }
    setMenuOpen(null)
  }

  const handleAddPlaylist = async (childId: string) => {
    if (!playlist) return
    try {
      await addPlaylistToPlaylist(playlist.id, childId)
      setShowAddPlaylistModal(false)
      await loadPlaylist()
    } catch (error: any) {
      alert(error.message || 'Failed to add playlist')
    }
  }

  const playAll = () => {
    if (videos.length > 0) {
      router.push(`/pages/media/player/${videos[0].id}?playlist=${playlistId}`)
    }
  }

  const shufflePlay = () => {
    if (videos.length > 0) {
      const randomIndex = Math.floor(Math.random() * videos.length)
      router.push(`/pages/media/player/${videos[randomIndex].id}?playlist=${playlistId}&shuffle=1`)
    }
  }

  const totalItems = videos.length + nestedPlaylists.length
  const isOwner = user?.uid === playlist?.userId

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <YouTubeHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showMobileSearch={showMobileSearch}
        setShowMobileSearch={setShowMobileSearch}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        userEmail={user?.email || undefined}
      />

      <div className="flex flex-1 pt-14 lg:pt-0">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-[100] lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar Container */}
        <div className={`fixed lg:relative top-0 left-0 h-screen lg:h-auto z-[110] transition-transform duration-300 transform ${sidebarOpen ? 'translate-x-0 w-[240px]' : '-translate-x-full lg:translate-x-0 lg:w-[72px]'}`}>
          <YouTubeSidebar
            sidebarOpen={sidebarOpen}
            viewMode={viewMode}
            selectedCategory={selectedCategory}
            setViewMode={setViewMode}
            setSelectedCategory={setSelectedCategory}
            categories={[]}
            onClose={() => setSidebarOpen(false)}
          />
        </div>

        <main className="flex-1 overflow-x-hidden pt-6">
          {loading ? (
            <div className="max-w-[1700px] mx-auto p-4 lg:p-8 flex flex-col lg:flex-row gap-8">
              <div className="lg:w-[360px] flex-shrink-0 space-y-4">
                <div className="aspect-video lg:aspect-square bg-[#272727] rounded-xl animate-pulse" />
                <div className="h-6 bg-[#272727] rounded w-3/4 animate-pulse" />
              </div>
              <div className="flex-1 space-y-4">
                {[...Array(6)].map((_, i) => <div key={i} className="h-20 bg-[#272727] rounded-xl animate-pulse" />)}
              </div>
            </div>
          ) : playlist ? (
            <div className="max-w-[1700px] mx-auto flex flex-col lg:flex-row lg:p-8 gap-8">
              {/* Sidebar (YouTube Style) */}
              <div className="w-full lg:w-[360px] lg:flex-shrink-0 lg:sticky lg:top-24 lg:h-fit">
                <div className="relative flex flex-col gap-6 p-4 lg:p-0">
                  {/* Thumbnail */}
                  <div className="aspect-video w-full relative rounded-xl overflow-hidden bg-[#272727] group shadow-2xl">
                    <img src={playlist.thumbnail || videos[0]?.thumbnail || ''} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={playAll} className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                        <Play className="w-7 h-7 text-white fill-white" />
                      </button>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-6">
                    <div>
                      <h1 className="text-2xl font-bold leading-tight mb-2">{playlist.name}</h1>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-white hover:text-white/80 cursor-pointer">{playlist.isAdmin ? 'LWS Official' : profile?.display_name || 'User'}</p>
                        <p className="text-[13px] text-[#aaa] font-medium">
                          {totalItems} items • Updated {new Date(playlist.updatedAt).toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-1.5 text-[12px] text-[#aaa] mt-1 font-bold">
                          {playlist.isPublic ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          <span className="uppercase tracking-wider">{playlist.isPublic ? 'Public' : 'Private'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button onClick={playAll} disabled={videos.length === 0}
                        className="flex-1 flex items-center justify-center gap-2 h-10 bg-white text-black rounded-full text-sm font-bold hover:bg-gray-200 disabled:opacity-50 transition-colors">
                        <Play className="w-4 h-4 fill-black" /> Play all
                      </button>
                      <button onClick={shufflePlay} disabled={videos.length === 0}
                        className="flex-1 flex items-center justify-center gap-2 h-10 bg-[#272727] text-white rounded-full text-sm font-bold hover:bg-[#3f3f3f] disabled:opacity-50 transition-colors">
                        <Shuffle className="w-4 h-4" /> Shuffle
                      </button>
                    </div>

                    {playlist.description && (
                      <p className="text-sm text-[#aaa] whitespace-pre-wrap leading-relaxed font-medium bg-[#1a1a1a] p-3 rounded-xl">{playlist.description}</p>
                    )}

                    {isOwner && (
                      <button onClick={() => { loadAddablePlaylists(); setShowAddPlaylistModal(true) }}
                        className="flex items-center justify-center gap-2 w-full h-10 border border-white/10 hover:bg-white/5 text-white rounded-full text-sm font-bold transition-all">
                        <Plus className="w-5 h-5" /> Add Items
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Content */}
              <div className="flex-1 px-4 lg:px-0 pb-20">
                {/* Sub-Playlists List */}
                {nestedPlaylists.length > 0 && (
                  <div className="mb-10">
                    <h3 className="text-[13px] font-bold text-[#aaa] uppercase tracking-widest mb-4 px-2">Sub-Playlists</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {nestedPlaylists.map(nested => (
                        <div key={nested.id} className="group flex items-center gap-4 p-3 bg-[#1a1a1a] hover:bg-[#272727] rounded-xl cursor-pointer transition-all border border-white/5">
                          <div onClick={() => router.push(`/pages/media/playlists/${nested.id}`)}
                            className="w-28 aspect-video bg-[#272727] rounded-lg overflow-hidden flex-shrink-0 relative group">
                            <img src={nested.thumbnail || ''} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Play className="w-6 h-6 fill-white" />
                            </div>
                            <div className="absolute bottom-1.5 right-1.5 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-bold">
                              {nested.videoIds.length} ITEMS
                            </div>
                          </div>
                          <div className="flex-1 min-w-0" onClick={() => router.push(`/pages/media/playlists/${nested.id}`)}>
                            <h4 className="font-bold text-sm line-clamp-1">{nested.name}</h4>
                            <p className="text-xs text-[#aaa] font-medium">Playlist</p>
                          </div>
                          {isOwner && (
                            <button onClick={() => handleRemoveNestedPlaylist(nested.id)} className="p-2.5 hover:bg-red-500/10 text-[#aaa] hover:text-red-500 rounded-full transition-colors">
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Video Feed */}
                <div className="space-y-2">
                  {videos.map((video, index) => (
                    <div key={video.id} className="group flex items-center gap-4 p-2.5 rounded-xl hover:bg-[#272727] transition-all relative">
                      <div className="w-6 text-[13px] text-[#aaa] font-bold flex items-center justify-center">
                        <span className="group-hover:hidden">{index + 1}</span>
                        <Play className="hidden group-hover:block w-3.5 h-3.5 text-white fill-white" />
                      </div>

                      <div onClick={() => router.push(`/pages/media/player/${video.id}?playlist=${playlistId}`)}
                        className="w-36 sm:w-44 aspect-video bg-[#272727] rounded-xl overflow-hidden flex-shrink-0 relative cursor-pointer">
                        <img src={video.thumbnail} className="w-full h-full object-cover" />
                        <span className="absolute bottom-1.5 right-1.5 bg-black/80 px-1.5 rounded text-[11px] font-bold tabular-nums">
                          {video.duration || "HQ"}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0" onClick={() => router.push(`/pages/media/player/${video.id}?playlist=${playlistId}`)}>
                        <h4 className="font-bold text-[15px] sm:text-base line-clamp-2 leading-tight mb-1 text-white">{video.title}</h4>
                        <p className="text-[13px] text-[#aaa] font-medium">LWS Official • {(video.views || 0).toLocaleString()} views</p>
                      </div>

                      {isOwner && (
                        <div className="relative">
                          <button onClick={() => setMenuOpen(menuOpen === video.id ? null : video.id)} className="p-2.5 hover:bg-white/10 text-[#aaa] hover:text-white rounded-full transition-colors">
                            <MoreVertical className="w-5 h-5" />
                          </button>
                          {menuOpen === video.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                              <div className="absolute right-10 top-0 bg-[#282828] rounded-xl shadow-2xl z-20 py-1 min-w-[160px] border border-white/10 overflow-hidden">
                                <button onClick={() => handleRemoveVideo(video.id)} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-white/10 text-red-500 text-sm font-bold">
                                  <Trash2 className="w-4.5 h-4.5" /> Remove from playlist
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {totalItems === 0 && (
                  <div className="flex flex-col items-center justify-center py-40">
                    <ListVideo className="w-20 h-20 text-[#272727] mb-6" />
                    <p className="text-sm text-[#aaa] font-bold uppercase tracking-widest">Empty playlist</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-40">
              <p className="text-[#aaa] font-bold">Playlist not found</p>
            </div>
          )}
        </main>
      </div>

      {/* Add Playlist Modal */}
      {showAddPlaylistModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddPlaylistModal(false)} />
          <div className="relative w-full max-w-sm bg-[#212121] rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <h2 className="text-xl font-bold">Add to playlist</h2>
              <button onClick={() => setShowAddPlaylistModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-7 h-7" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-3">
              {loadingAddable ? (
                <div className="p-4 space-y-4">
                  {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-[#272727] rounded-xl animate-pulse" />)}
                </div>
              ) : addablePlaylists.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {addablePlaylists.map(p => (
                    <button key={p.id} onClick={() => handleAddPlaylist(p.id)}
                      className="flex items-center gap-4 w-full p-2.5 rounded-xl hover:bg-[#272727] text-left group transition-all">
                      <div className="w-24 aspect-video bg-[#272727] rounded-lg overflow-hidden flex-shrink-0 border border-white/5">
                        {p.thumbnail ? (
                          <img src={p.thumbnail} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ListVideo className="w-8 h-8 text-white/10" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[15px] font-bold line-clamp-1">{p.name}</h4>
                        <p className="text-xs text-[#aaa] font-medium">{p.videoIds.length} videos</p>
                      </div>
                      <Plus className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center text-[#aaa]">
                  <p className="text-sm font-bold uppercase tracking-widest">No playlists available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
