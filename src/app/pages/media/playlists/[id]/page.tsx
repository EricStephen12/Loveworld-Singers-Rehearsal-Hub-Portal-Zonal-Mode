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
    <div className="h-screen overflow-hidden bg-slate-950 text-slate-200 flex flex-col selection:bg-indigo-500/30">
      <div className="fixed top-0 left-0 right-0 z-50 bg-slate-950">
        <YouTubeHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          showMobileSearch={showMobileSearch}
          setShowMobileSearch={setShowMobileSearch}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          userEmail={user?.email || undefined}
        />
      </div>

      <div className="flex flex-1 pt-16 overflow-hidden relative">
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

        <main className="flex-1 overflow-y-auto px-4 lg:px-8 pt-6 pb-24 custom-scrollbar bg-slate-950">
          {loading ? (
            <div className="max-w-[1700px] mx-auto p-4 lg:p-8 flex flex-col lg:flex-row gap-8">
              <div className="lg:w-[360px] flex-shrink-0 space-y-4">
                <div className="aspect-video lg:aspect-square bg-slate-900 rounded-xl animate-pulse" />
                <div className="h-6 bg-slate-900 rounded w-3/4 animate-pulse" />
              </div>
              <div className="flex-1 space-y-4">
                {[...Array(6)].map((_, i) => <div key={i} className="h-20 bg-slate-900 rounded-xl animate-pulse" />)}
              </div>
            </div>
          ) : playlist ? (
            <div className="max-w-[1700px] mx-auto flex flex-col lg:flex-row lg:p-8 gap-6 sm:gap-8">
              {/* Sidebar (YouTube Style) */}
              <div className="w-full lg:w-[360px] lg:flex-shrink-0 lg:sticky lg:top-24 lg:h-fit">
                <div className="relative flex flex-col gap-5 sm:gap-6 p-4 lg:p-0">
                  {/* Thumbnail */}
                  <div className="aspect-video w-full relative rounded-[20px] sm:rounded-2xl overflow-hidden bg-slate-900 group shadow-2xl border border-white/5">
                    <img src={playlist.thumbnail || videos[0]?.thumbnail || ''} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={playAll} className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:scale-110 transition-transform border border-white/20">
                        <Play className="w-7 h-7 text-white fill-white" />
                      </button>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-5 sm:space-y-6">
                    <div>
                      <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold leading-tight mb-2 text-slate-100 tracking-tight">{playlist.name}</h1>
                      <div className="space-y-1">
                        <p className="text-[13px] sm:text-[14px] font-bold text-slate-200 hover:text-white cursor-pointer transition-colors px-1">{playlist.isAdmin ? 'LWS Official' : profile?.display_name || 'User'}</p>
                        <p className="text-[12px] sm:text-[13px] text-slate-400 font-medium px-1">
                          {totalItems} items • Updated {new Date(playlist.updatedAt).toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-2 font-black px-1">
                          {playlist.isPublic ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          <span className="uppercase tracking-[0.2em]">{playlist.isPublic ? 'Public' : 'Private'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2.5 px-0.5">
                      <button onClick={playAll} disabled={videos.length === 0}
                        className="flex-1 flex items-center justify-center gap-2 h-11 bg-slate-100 text-slate-900 rounded-xl sm:rounded-full text-[13px] sm:text-sm font-bold hover:bg-white disabled:opacity-50 transition-all active:scale-95 shadow-lg shadow-white/5">
                        <Play className="w-4 h-4 fill-slate-900" /> Play all
                      </button>
                      <button onClick={shufflePlay} disabled={videos.length === 0}
                        className="flex-1 flex items-center justify-center gap-2 h-11 bg-slate-900/80 backdrop-blur-md text-white rounded-xl sm:rounded-full text-[13px] sm:text-sm font-bold hover:bg-slate-800 disabled:opacity-50 transition-all border border-white/10 active:scale-95">
                        <Shuffle className="w-4 h-4" /> Shuffle
                      </button>
                    </div>

                    {playlist.description && (
                      <p className="text-[13px] sm:text-sm text-slate-400 whitespace-pre-wrap leading-relaxed font-medium bg-slate-900/50 p-4 rounded-2xl border border-white/5">{playlist.description}</p>
                    )}

                    {isOwner && (
                      <button onClick={() => { loadAddablePlaylists(); setShowAddPlaylistModal(true) }}
                        className="flex items-center justify-center gap-2 w-full h-11 bg-indigo-600/10 border border-indigo-500/20 hover:bg-indigo-600/20 text-indigo-400 rounded-xl sm:rounded-full text-sm font-bold transition-all active:scale-95">
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
                  <div className="mb-10 sm:mb-12">
                    <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.25em] mb-5 px-4 lg:px-2">Sub-Playlists</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5 px-2 lg:px-0">
                      {nestedPlaylists.map(nested => (
                        <div key={nested.id} className="group flex items-center gap-4 p-3 bg-slate-900/40 hover:bg-slate-900/60 rounded-2xl cursor-pointer transition-all border border-white/5">
                          <div onClick={() => router.push(`/pages/media/playlists/${nested.id}`)}
                            className="w-24 sm:w-28 aspect-video bg-slate-950 rounded-xl overflow-hidden flex-shrink-0 relative group shadow-sm border border-white/5">
                            <img src={nested.thumbnail || ''} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Play className="w-6 h-6 fill-white" />
                            </div>
                            <div className="absolute bottom-1.5 right-1.5 bg-black/80 backdrop-blur-md px-1.5 py-0.5 rounded-lg text-[10px] font-bold border border-white/10">
                              {nested.videoIds.length} ITEMS
                            </div>
                          </div>
                          <div className="flex-1 min-w-0" onClick={() => router.push(`/pages/media/playlists/${nested.id}`)}>
                            <h4 className="font-bold text-[14px] sm:text-sm text-slate-100 line-clamp-1 group-hover:text-indigo-300 transition-colors tracking-tight">{nested.name}</h4>
                            <p className="text-[12px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Playlist</p>
                          </div>
                          {isOwner && (
                            <button onClick={() => handleRemoveNestedPlaylist(nested.id)} className="p-2.5 hover:bg-red-500/10 text-slate-600 hover:text-red-500 rounded-full transition-colors active:scale-90">
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Video Feed */}
                <div className="space-y-1 sm:space-y-2">
                  {videos.map((video, index) => (
                    <div key={video.id} className="group flex items-center gap-3 sm:gap-4 p-2 sm:p-2.5 rounded-2xl hover:bg-slate-900/50 transition-all relative border border-transparent hover:border-white/5 overflow-hidden">
                      <div className="hidden sm:flex w-6 text-[13px] text-slate-500 font-black flex items-center justify-center">
                        <span className="group-hover:hidden">{index + 1}</span>
                        <Play className="hidden group-hover:block w-3.5 h-3.5 text-white fill-white" />
                      </div>

                      <div onClick={() => router.push(`/pages/media/player/${video.id}?playlist=${playlistId}`)}
                        className="w-[124px] sm:w-44 aspect-video bg-slate-950 rounded-[12px] sm:rounded-xl overflow-hidden flex-shrink-0 relative cursor-pointer shadow-sm border border-white/5">
                        <img src={video.thumbnail} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <span className="absolute bottom-1.5 right-1.5 bg-black/80 backdrop-blur-md px-1.5 rounded-lg text-[10px] sm:text-[11px] font-bold tabular-nums border border-white/10">
                          {video.duration || "HQ"}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0" onClick={() => router.push(`/pages/media/player/${video.id}?playlist=${playlistId}`)}>
                        <h4 className="font-bold text-[14px] sm:text-[15px] lg:text-[16px] line-clamp-2 leading-[1.3] text-slate-100 tracking-tight mb-1 group-hover:text-indigo-300 transition-colors uppercase sm:normal-case">{video.title}</h4>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          <p className="text-[11px] sm:text-[13px] text-slate-500 font-bold uppercase tracking-wider truncate">LWS Official</p>
                          <div className="hidden sm:block text-slate-700">•</div>
                          <p className="text-[11px] sm:text-[13px] text-slate-500 font-medium truncate">{(video.views || 0).toLocaleString()} views</p>
                        </div>
                      </div>

                      {isOwner && (
                        <div className="relative flex-shrink-0">
                          <button onClick={() => setMenuOpen(menuOpen === video.id ? null : video.id)} className="p-2.5 hover:bg-white/5 text-slate-500 hover:text-white rounded-full transition-colors active:scale-90">
                            <MoreVertical className="w-5 h-5" />
                          </button>
                          {menuOpen === video.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                              <div className="absolute right-10 top-0 bg-slate-900 rounded-2xl shadow-2xl z-20 py-1.5 min-w-[200px] border border-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <button onClick={() => handleRemoveVideo(video.id)} className="flex items-center gap-3 w-full px-4 py-3.5 hover:bg-red-500/10 text-red-400 text-[13px] font-bold transition-colors">
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
                    <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Empty playlist</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-40">
              <p className="text-slate-400 font-bold">Playlist not found</p>
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
                  {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-slate-900 rounded-xl animate-pulse" />)}
                </div>
              ) : addablePlaylists.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {addablePlaylists.map(p => (
                    <button key={p.id} onClick={() => handleAddPlaylist(p.id)}
                      className="flex items-center gap-4 w-full p-2.5 rounded-xl hover:bg-slate-900 text-left group transition-all">
                      <div className="w-24 aspect-video bg-slate-900 rounded-lg overflow-hidden flex-shrink-0 border border-white/5">
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
                        <p className="text-xs text-slate-400 font-medium">{p.videoIds.length} videos</p>
                      </div>
                      <Plus className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center text-slate-400">
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
