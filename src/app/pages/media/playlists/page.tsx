'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { getUserPlaylists, deletePlaylist, ensureSystemPlaylists, Playlist } from '../_lib/playlist-service'
import { ArrowLeft, ListVideo, MoreVertical, Trash2, Play, ThumbsUp, Clock } from 'lucide-react'

export default function PlaylistsPage() {
  const router = useRouter()
  const { user, profile, isLoading: authLoading } = useAuth()
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)

  useEffect(() => {
    if (user?.uid) {
      initAndLoad()
    }
  }, [user?.uid])

  const initAndLoad = async () => {
    if (!user?.uid) return
    setLoading(true)
    try {
      // Ensure system playlists exist
      await ensureSystemPlaylists(user.uid)
      const data = await getUserPlaylists(user.uid)
      // Sort: system playlists first, then by updatedAt
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

  // Show loading while auth is checking
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-700 border-t-red-600 rounded-full animate-spin" />
      </div>
    )
  }

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] text-white">
        <header className="sticky top-0 z-50 bg-[#0f0f0f] h-14 flex items-center gap-3 px-4">
          <button onClick={() => router.push('/pages/media')} className="p-2 hover:bg-white/10 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">Your Playlists</h1>
        </header>
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-20 h-20 bg-[#272727] rounded-full flex items-center justify-center mb-4">
            <ListVideo className="w-10 h-10 text-gray-500" />
          </div>
          <h3 className="text-lg font-medium mb-2">Sign in to view playlists</h3>
          <p className="text-gray-400 text-sm text-center mb-6">
            Create playlists, save videos, and access your liked videos
          </p>
          <button 
            onClick={() => router.push('/auth')}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 rounded-full font-medium transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0f0f0f] h-14 flex items-center gap-3 px-4">
        <button onClick={() => router.push('/pages/media')} className="p-2 hover:bg-white/10 rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold">Your Playlists</h1>
      </header>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-40 aspect-video bg-[#272727] rounded-lg" />
                <div className="flex-1">
                  <div className="h-4 bg-[#272727] rounded w-3/4 mb-2" />
                  <div className="h-3 bg-[#272727] rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : playlists.length > 0 ? (
          <div className="space-y-3">
            {playlists.map((playlist) => (
              <div 
                key={playlist.id}
                className="flex gap-3 group relative"
              >
                {/* Thumbnail */}
                <div 
                  onClick={() => router.push(`/pages/media/playlists/${playlist.id}`)}
                  className="w-40 aspect-video bg-[#272727] rounded-lg overflow-hidden relative cursor-pointer flex-shrink-0"
                >
                  {playlist.thumbnail ? (
                    <img src={playlist.thumbnail} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {playlist.systemType === 'liked' ? (
                        <ThumbsUp className="w-10 h-10 text-gray-600" />
                      ) : playlist.systemType === 'watch_later' ? (
                        <Clock className="w-10 h-10 text-gray-600" />
                      ) : (
                        <ListVideo className="w-10 h-10 text-gray-600" />
                      )}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-10 h-10" fill="white" />
                  </div>
                  <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-xs">
                    {playlist.videoIds.length} videos
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 
                    onClick={() => router.push(`/pages/media/playlists/${playlist.id}`)}
                    className="font-medium line-clamp-2 cursor-pointer hover:text-gray-300"
                  >
                    {playlist.name}
                  </h3>
                  {playlist.description && (
                    <p className="text-sm text-gray-400 line-clamp-1 mt-1">{playlist.description}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Updated {playlist.updatedAt instanceof Date ? playlist.updatedAt.toLocaleDateString() : new Date(playlist.updatedAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Menu - only for non-system playlists */}
                {!playlist.isSystem && (
                  <div className="relative">
                    <button 
                      onClick={() => setMenuOpen(menuOpen === playlist.id ? null : playlist.id)}
                      className="p-2 hover:bg-white/10 rounded-full"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    {menuOpen === playlist.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                        <div className="absolute right-0 top-10 bg-[#282828] rounded-lg shadow-xl z-20 py-1 min-w-[150px]">
                          <button
                            onClick={() => handleDelete(playlist.id)}
                            className="flex items-center gap-3 w-full px-4 py-2 hover:bg-white/10 text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 bg-[#272727] rounded-full flex items-center justify-center mb-4">
              <ListVideo className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium mb-2">No playlists yet</h3>
            <p className="text-gray-400 text-sm text-center px-4 mb-4">
              Save videos to playlists to watch later
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
