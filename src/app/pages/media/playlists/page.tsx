'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import {
  getUserPlaylists,
  deletePlaylist,
  ensureSystemPlaylists,
  createPlaylist,
  Playlist
} from '../_lib/playlist-service'
import {
  ListVideo, MoreVertical, Trash2, Play, ThumbsUp, Clock,
  Globe, Plus, Lock, X
} from 'lucide-react'
import YouTubeHeader from '../_components/YouTubeHeader'
import YouTubeSidebar from '../_components/YouTubeSidebar'

export default function PlaylistsPage() {
  const router = useRouter()
  const { user, profile, isLoading: authLoading } = useAuth()
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [creating, setCreating] = useState(false)

  // YouTube UI States
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'all' | 'shorts'>('all')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    if (user?.uid) {
      initAndLoad(user.uid)
    } else if (!authLoading && profile) {
      setLoading(false)
    }
  }, [user?.uid, authLoading, profile])

  const initAndLoad = async (userId: string) => {
    setLoading(true)
    try {
      await ensureSystemPlaylists(userId)
      const data = await getUserPlaylists(userId)
      const sorted = data.sort((a, b) => {
        if (a.isSystem && !b.isSystem) return -1
        if (!a.isSystem && b.isSystem) return 1
        const aTime = a.updatedAt instanceof Date ? a.updatedAt.getTime() : new Date(a.updatedAt).getTime()
        const bTime = b.updatedAt instanceof Date ? b.updatedAt.getTime() : new Date(b.updatedAt).getTime()
        return bTime - aTime
      })
      setPlaylists(sorted)
    } catch (error) {
 console.error('Error loading playlists:', error)
    }
    setLoading(false)
  }

  const handleDelete = async (playlistId: string) => {
    if (!confirm('Delete this playlist?')) return
    try {
      await deletePlaylist(playlistId)
      setPlaylists(prev => prev.filter(p => p.id !== playlistId))
    } catch (error) {
 console.error('Error deleting playlist:', error)
    }
    setMenuOpen(null)
  }

  const handleCreatePlaylist = async () => {
    if (!user?.uid || !newPlaylistName.trim()) return
    setCreating(true)
    try {
      const id = await createPlaylist(user.uid, newPlaylistName.trim(), '', false)
      setShowCreateModal(false)
      setNewPlaylistName('')
      await initAndLoad(user.uid)
      router.push(`/pages/media/playlists/${id}`)
    } catch (error) {
 console.error('Error creating playlist:', error)
    }
    setCreating(false)
  }

  const systemPlaylists = playlists.filter(p => p.isSystem)
  const customPlaylists = playlists.filter(p => !p.isSystem)

  return (
    <div className="h-screen overflow-hidden bg-slate-950 text-slate-200 flex flex-col selection:bg-indigo-500/30 font-sans">
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
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] lg:hidden"
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

        <main className="flex-1 max-w-[2100px] mx-auto px-6 pt-6 pb-24 overflow-y-auto bg-slate-950 custom-scrollbar">
          <div className="flex items-center justify-between mb-10">
            <div className="flex flex-col">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">Your Playlists</h1>
              <p className="text-slate-400 text-sm mt-1 font-medium">Curated music and rehearsal libraries</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2.5 px-6 h-11 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[14px] font-bold shadow-lg shadow-indigo-500/20 transition-all border border-indigo-400/20 active:scale-95"
            >
              <Plus className="w-5 h-5" />
              New Playlist
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-x-5 gap-y-12">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="aspect-video bg-slate-900 rounded-2xl animate-pulse border border-white/5" />
                  <div className="h-5 bg-slate-900 rounded-lg w-3/4 animate-pulse" />
                  <div className="h-4 bg-slate-900 rounded-lg w-1/2 animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-16">
              {/* System Playlists */}
              {systemPlaylists.length > 0 && (
                <section className="space-y-6">
                  <h2 className="text-[12px] font-black px-1 text-slate-500 uppercase tracking-[0.25em]">Essentials</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-x-5 gap-y-12">
                    {systemPlaylists
                      .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map(playlist => (
                      <button
                        key={playlist.id}
                        onClick={() => router.push(`/pages/media/playlists/${playlist.id}`)}
                        className="group flex flex-col gap-4 text-left"
                      >
                        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-white/5 shadow-md transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:shadow-indigo-500/10">
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950">
                            {playlist.systemType === 'liked'
                              ? <ThumbsUp className="w-14 h-14 text-indigo-500/20 group-hover:text-indigo-500/40 transition-colors" />
                              : <Clock className="w-14 h-14 text-indigo-500/20 group-hover:text-indigo-500/40 transition-colors" />}
                          </div>
                          <div className="absolute bottom-2.5 right-2.5 bg-slate-950/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-2 border border-white/10 shadow-lg">
                            <ListVideo className="w-4 h-4 text-indigo-400" />
                            <span className="text-slate-100">{playlist.videoIds.length} VIDEOS</span>
                          </div>
                          <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 scale-90 group-hover:scale-100 transition-transform duration-300">
                                <Play className="w-6 h-6 fill-white text-white" />
                            </div>
                          </div>
                        </div>
                        <div className="px-1">
                          <h3 className="font-bold text-[16px] text-slate-100 line-clamp-2 group-hover:text-indigo-300 transition-colors">{playlist.name}</h3>
                          <p className="text-[13px] text-slate-400 font-medium mt-0.5">Playlist • Updated recently</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Custom Playlists */}
              <section className="space-y-6 pt-8 border-t border-slate-800/60">
                <h2 className="text-[12px] font-black px-1 text-slate-500 uppercase tracking-[0.25em]">My Playlists</h2>
                {customPlaylists.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-x-5 gap-y-12">
                    {customPlaylists
                      .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map(playlist => (
                      <div key={playlist.id} className="group flex flex-col gap-4 relative">
                        <div
                          onClick={() => router.push(`/pages/media/playlists/${playlist.id}`)}
                          className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-white/5 shadow-md transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg group-hover:shadow-indigo-500/10 cursor-pointer"
                        >
                          {playlist.thumbnail ? (
                            <img src={playlist.thumbnail} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950">
                              <ListVideo className="w-14 h-14 text-slate-700/50 group-hover:text-slate-700transition-colors" />
                            </div>
                          )}
                          <div className="absolute bottom-2.5 right-2.5 bg-slate-950/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-2 border border-white/10 shadow-lg">
                            <ListVideo className="w-4 h-4 text-indigo-400" />
                            <span className="text-slate-100">{playlist.videoIds.length} VIDEOS</span>
                          </div>
                          <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 scale-90 group-hover:scale-100 transition-transform duration-300">
                                <Play className="w-6 h-6 fill-white text-white" />
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 px-1">
                          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => router.push(`/pages/media/playlists/${playlist.id}`)}>
                            <h3 className="font-bold text-[16px] text-slate-100 line-clamp-2 group-hover:text-indigo-300 transition-colors">{playlist.name}</h3>
                            <p className="text-[13px] text-slate-400 mt-1 flex items-center gap-2 font-medium">
                              {playlist.isPublic ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                              <span>Playlist</span>
                            </p>
                          </div>

                          <div className="relative">
                            <button
                              onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === playlist.id ? null : playlist.id) }}
                              className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-100 transition-all flex items-center justify-center border border-white/5 active:scale-90"
                            >
                              <MoreVertical className="w-5 h-5" />
                            </button>
                            {menuOpen === playlist.id && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                                <div className="absolute right-0 top-11 bg-slate-900 rounded-2xl shadow-2xl z-20 py-1.5 min-w-[180px] border border-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                  <button
                                    onClick={() => handleDelete(playlist.id)}
                                    className="flex items-center gap-3 w-full px-4 py-3.5 hover:bg-red-500/10 text-red-400 text-sm font-bold transition-colors"
                                  >
                                    <Trash2 className="w-4.5 h-4.5" />
                                    Delete Playlist
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-32 text-center bg-slate-900/20 rounded-[32px] border-2 border-dashed border-slate-800">
                    <div className="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center mb-6 border border-white/5">
                        <ListVideo className="w-10 h-10 text-slate-800" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-100">No playlists yet</h3>
                    <p className="text-slate-500 mt-2 font-medium">Start organizing your rehearsal library today</p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="mt-8 px-8 h-12 bg-slate-800 hover:bg-slate-700 rounded-2xl text-sm font-bold transition-all border border-white/5 active:scale-95"
                    >
                      Create first playlist
                    </button>
                  </div>
                )}
              </section>
            </div>
          )}
        </main>
      </div>

      {/* Create Playlist Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowCreateModal(false)} />
          <div className="relative w-full max-w-sm bg-slate-900 rounded-[32px] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.6)] border border-white/10 animate-in zoom-in-95 duration-300">
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-2 text-slate-100 tracking-tight">New Playlist</h2>
              <p className="text-slate-400 text-sm mb-8 font-medium">Add a title to organize your sessions</p>
              
              <input
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="Playlist name"
                className="w-full bg-slate-950/50 border border-slate-700 rounded-2xl px-5 py-4 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all mb-8 shadow-inner"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreatePlaylist()}
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 h-12 rounded-2xl text-sm font-bold text-slate-400 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePlaylist}
                  disabled={!newPlaylistName.trim() || creating}
                  className="px-8 h-12 bg-indigo-600 rounded-2xl text-sm font-bold text-white hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
