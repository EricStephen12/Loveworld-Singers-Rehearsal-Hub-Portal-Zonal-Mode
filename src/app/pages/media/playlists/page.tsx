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
  ArrowLeft, ListVideo, MoreVertical, Trash2, Play, ThumbsUp, Clock, 
  Globe, Plus, Lock, Layers, X
} from 'lucide-react'

export default function PlaylistsPage() {
  const router = useRouter()
  const { user, profile, isLoading: authLoading } = useAuth()
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (user?.uid) {
      initAndLoad(user.uid)
    } else if (!authLoading && profile) {
      setLoading(false)
    }
  }, [user?.uid, authLoading])

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
      // Create as private by default, no description for user playlists
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

  if (authLoading && !profile) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-gray-700 border-t-red-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!user && !profile) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white">
        <header className="sticky top-0 z-50 bg-[#0f0f0f] h-14 flex items-center gap-3 px-4">
          <button onClick={() => router.push('/pages/media')} className="p-2 hover:bg-white/10 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">Playlists</h1>
        </header>
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-20 h-20 bg-[#272727] rounded-full flex items-center justify-center mb-4">
            <ListVideo className="w-10 h-10 text-gray-500" />
          </div>
          <h3 className="text-lg font-medium mb-2">Sign in to view playlists</h3>
          <p className="text-gray-400 text-sm text-center mb-4">Save your favorite videos</p>
          <button onClick={() => router.push('/auth')} className="px-6 py-2.5 bg-white text-black rounded-full font-medium hover:bg-gray-200">
            Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white pb-20">
      <header className="sticky top-0 z-50 bg-[#0f0f0f]/95 backdrop-blur-sm border-b border-white/5">
        <div className="h-14 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/pages/media')} className="p-2 hover:bg-white/10 rounded-full -ml-2">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold">Playlists</h1>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-medium">
            <Plus className="w-4 h-4" />New
          </button>
        </div>
      </header>

      {loading ? (
        <div className="p-4 space-y-6">
          <div className="grid grid-cols-2 gap-3">
            {[1, 2].map(i => (
              <div key={i} className="bg-[#1a1a1a] rounded-xl p-4 animate-pulse">
                <div className="w-10 h-10 bg-[#272727] rounded-lg mb-3" />
                <div className="h-4 bg-[#272727] rounded w-3/4 mb-2" />
                <div className="h-3 bg-[#272727] rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4 space-y-6">
          {systemPlaylists.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {systemPlaylists.map(playlist => (
                <button key={playlist.id} onClick={() => router.push(`/pages/media/playlists/${playlist.id}`)}
                  className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-white/10 rounded-xl p-4 text-left hover:border-white/20 group">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${playlist.systemType === 'liked' ? 'bg-gradient-to-br from-red-500/20 to-pink-500/20' : 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20'}`}>
                    {playlist.systemType === 'liked' ? <ThumbsUp className="w-5 h-5 text-red-400" /> : <Clock className="w-5 h-5 text-blue-400" />}
                  </div>
                  <h3 className="font-medium text-sm mb-1">{playlist.name}</h3>
                  <p className="text-xs text-gray-500">{playlist.videoIds.length} videos</p>
                </button>
              ))}
            </div>
          )}

          {customPlaylists.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-gray-400">Your playlists</h2>
                <span className="text-xs text-gray-500">{customPlaylists.length} playlists</span>
              </div>
              <div className="space-y-2">
                {customPlaylists.map(playlist => (
                  <div key={playlist.id} className="flex gap-3 p-2 -mx-2 rounded-xl hover:bg-white/5 group">
                    <div onClick={() => router.push(`/pages/media/playlists/${playlist.id}`)}
                      className="w-32 sm:w-40 aspect-video bg-[#272727] rounded-lg overflow-hidden relative cursor-pointer flex-shrink-0">
                      {playlist.thumbnail ? (
                        <img src={playlist.thumbnail} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#272727] to-[#1a1a1a]">
                          <ListVideo className="w-8 h-8 text-gray-600" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 bg-black/80 px-1.5 py-0.5 rounded text-[10px]">
                        <ListVideo className="w-3 h-3" />{playlist.videoIds.length + (playlist.childPlaylistIds?.length || 0)}
                      </div>
                      {playlist.childPlaylistIds && playlist.childPlaylistIds.length > 0 && (
                        <div className="absolute top-1.5 left-1.5 bg-purple-600/90 px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1">
                          <Layers className="w-3 h-3" />{playlist.childPlaylistIds.length}
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center">
                          <Play className="w-5 h-5 text-black ml-0.5" fill="black" />
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 py-0.5 cursor-pointer" onClick={() => router.push(`/pages/media/playlists/${playlist.id}`)}>
                      <h3 className="font-medium text-sm line-clamp-2 mb-1">{playlist.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {playlist.isPublic ? <><Globe className="w-3 h-3" /> Public</> : <><Lock className="w-3 h-3" /> Private</>}
                        <span>•</span><span>{playlist.videoIds.length} videos</span>
                      </div>
                    </div>
                    <div className="flex items-start relative">
                      <button onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === playlist.id ? null : playlist.id) }}
                        className="p-2 hover:bg-white/10 rounded-full opacity-0 group-hover:opacity-100">
                        <MoreVertical className="w-5 h-5 text-gray-400" />
                      </button>
                      {menuOpen === playlist.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                          <div className="absolute right-0 top-10 bg-[#282828] rounded-xl shadow-xl z-20 py-2 min-w-[180px] border border-white/10">
                            <button onClick={() => handleDelete(playlist.id)} className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-white/10 text-red-400 text-sm">
                              <Trash2 className="w-4 h-4" />Delete playlist
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {customPlaylists.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-[#272727] rounded-full flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-base font-medium mb-1">No playlists yet</h3>
              <p className="text-gray-400 text-sm text-center mb-4">Create one to save videos</p>
              <button onClick={() => setShowCreateModal(true)} className="px-5 py-2.5 bg-white text-black rounded-full font-medium hover:bg-gray-200 text-sm">
                Create playlist
              </button>
            </div>
          )}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowCreateModal(false)} />
          <div className="relative w-full sm:max-w-md bg-[#212121] rounded-t-2xl sm:rounded-2xl p-5">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">New playlist</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-white/10 rounded-full -mr-2"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Name</label>
                <input type="text" value={newPlaylistName} onChange={(e) => setNewPlaylistName(e.target.value)} placeholder="Enter playlist name"
                  className="w-full px-4 py-3 bg-[#121212] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white/30" autoFocus />
              </div>
              <button onClick={handleCreatePlaylist} disabled={!newPlaylistName.trim() || creating}
                className="w-full py-3 bg-white text-black rounded-full font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
