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
    <div className="min-h-screen bg-[#0f0f0f] text-white selection:bg-indigo-500/30">
      <YouTubeHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showMobileSearch={showMobileSearch}
        setShowMobileSearch={setShowMobileSearch}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        userEmail={user?.email || undefined}
      />

      <div className="flex">
        <YouTubeSidebar
          sidebarOpen={sidebarOpen}
          viewMode={viewMode}
          selectedCategory={selectedCategory}
          setViewMode={setViewMode}
          setSelectedCategory={setSelectedCategory}
          categories={[]}
        />

        <main className="flex-1 max-w-[2100px] mx-auto px-4 py-6 overflow-x-hidden">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold">Collections</h1>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 h-9 bg-white text-black rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              <Plus className="w-5 h-5" />
              New
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-x-4 gap-y-8">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="aspect-video bg-[#272727] rounded-xl animate-pulse" />
                  <div className="h-4 bg-[#272727] rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-[#272727] rounded w-1/2 animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-10">
              {/* System Playlists */}
              {systemPlaylists.length > 0 && (
                <section className="space-y-4">
                  <h2 className="text-lg font-medium px-1 text-[#aaa] uppercase tracking-wider">Library</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-x-4 gap-y-8">
                    {systemPlaylists.map(playlist => (
                      <button
                        key={playlist.id}
                        onClick={() => router.push(`/pages/media/playlists/${playlist.id}`)}
                        className="group flex flex-col gap-3 text-left"
                      >
                        <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-[#272727]">
                          <div className="w-full h-full flex items-center justify-center">
                            {playlist.systemType === 'liked'
                              ? <ThumbsUp className="w-12 h-12 text-white/10" />
                              : <Clock className="w-12 h-12 text-white/10" />}
                          </div>
                          <div className="absolute bottom-1.5 right-1.5 bg-black/90 px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1.5">
                            <ListVideo className="w-4 h-4" />
                            <span>{playlist.videoIds.length} VIDEOS</span>
                          </div>
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Play className="w-10 h-10 fill-white" />
                          </div>
                        </div>
                        <div className="px-1">
                          <h3 className="font-bold text-[15px] text-white line-clamp-2">{playlist.name}</h3>
                          <p className="text-[13px] text-[#aaa]">Playlist • Updated recently</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Custom Playlists */}
              <section className="space-y-4 pt-4 border-t border-white/5">
                <h2 className="text-lg font-medium px-1 text-[#aaa] uppercase tracking-wider">Your playlists</h2>
                {customPlaylists.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-x-4 gap-y-8">
                    {customPlaylists.map(playlist => (
                      <div key={playlist.id} className="group flex flex-col gap-3 relative">
                        <div
                          onClick={() => router.push(`/pages/media/playlists/${playlist.id}`)}
                          className="relative w-full aspect-video rounded-xl overflow-hidden bg-[#272727] cursor-pointer"
                        >
                          {playlist.thumbnail ? (
                            <img src={playlist.thumbnail} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ListVideo className="w-12 h-12 text-white/10" />
                            </div>
                          )}
                          <div className="absolute bottom-1.5 right-1.5 bg-black/90 px-2 py-1 rounded text-[11px] font-bold flex items-center gap-1.5">
                            <ListVideo className="w-4 h-4" />
                            <span>{playlist.videoIds.length} VIDEOS</span>
                          </div>
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Play className="w-10 h-10 fill-white" />
                          </div>
                        </div>

                        <div className="flex gap-2 px-1">
                          <div className="flex-1 min-w-0 cursor-pointer" onClick={() => router.push(`/pages/media/playlists/${playlist.id}`)}>
                            <h3 className="font-bold text-[15px] text-white line-clamp-2">{playlist.name}</h3>
                            <p className="text-[13px] text-[#aaa] mt-0.5 flex items-center gap-1.5 font-medium">
                              {playlist.isPublic ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                              <span>Playlist</span>
                            </p>
                          </div>

                          <div className="relative">
                            <button
                              onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === playlist.id ? null : playlist.id) }}
                              className="p-1.5 hover:bg-white/10 rounded-full text-[#aaa] hover:text-white"
                            >
                              <MoreVertical className="w-5 h-5" />
                            </button>
                            {menuOpen === playlist.id && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                                <div className="absolute right-0 top-10 bg-[#282828] rounded-xl shadow-2xl z-20 py-1 min-w-[160px] border border-white/10 overflow-hidden">
                                  <button
                                    onClick={() => handleDelete(playlist.id)}
                                    className="flex items-center gap-3 w-full px-4 py-3 hover:bg-white/10 text-red-500 text-sm font-semibold"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
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
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <p className="text-gray-400 mb-6 font-medium">No playlists created yet</p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="px-6 h-10 bg-[#272727] hover:bg-[#3f3f3f] rounded-full text-sm font-bold transition-colors"
                    >
                      Create playlist
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
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <div className="relative w-full max-w-sm bg-[#212121] rounded-2xl overflow-hidden shadow-2xl border border-white/10">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-6">New playlist</h2>
              <input
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="Playlist name"
                className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-all mb-8"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreatePlaylist()}
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 h-10 rounded-full text-sm font-bold hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePlaylist}
                  disabled={!newPlaylistName.trim() || creating}
                  className="px-6 h-10 bg-blue-600 rounded-full text-sm font-bold text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
