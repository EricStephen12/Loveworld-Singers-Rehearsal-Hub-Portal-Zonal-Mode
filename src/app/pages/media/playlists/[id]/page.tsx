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
import { firebaseMediaService, MediaItem } from '../../_lib/firebase-media-service'
import { 
  ArrowLeft, Play, Shuffle, MoreVertical, Trash2, ListVideo, 
  Plus, Layers, ChevronRight, X, Globe, Lock, GripVertical
} from 'lucide-react'

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
      // Filter out playlists already added
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

  if (authLoading && !profile) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-gray-700 border-t-red-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0f0f0f]/95 backdrop-blur-sm border-b border-white/5">
        <div className="h-14 flex items-center gap-3 px-4">
          <button onClick={() => router.push('/pages/media/playlists')} className="p-2 hover:bg-white/10 rounded-full -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold truncate flex-1">{playlist?.name || 'Playlist'}</h1>
          {isOwner && (
            <button onClick={() => { loadAddablePlaylists(); setShowAddPlaylistModal(true) }}
              className="p-2 hover:bg-white/10 rounded-full" title="Add playlist">
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {loading ? (
        <div className="p-4 space-y-4">
          <div className="flex gap-4">
            <div className="w-40 aspect-video bg-[#272727] rounded-xl animate-pulse" />
            <div className="flex-1">
              <div className="h-5 bg-[#272727] rounded w-3/4 mb-2 animate-pulse" />
              <div className="h-4 bg-[#272727] rounded w-1/2 animate-pulse" />
            </div>
          </div>
          <div className="flex gap-3">
            <div className="h-10 bg-[#272727] rounded-full w-28 animate-pulse" />
            <div className="h-10 bg-[#272727] rounded-full w-28 animate-pulse" />
          </div>
        </div>
      ) : playlist ? (
        <>
          {/* Playlist Header - Horizontal Layout */}
          <div className="p-4 border-b border-white/5">
            <div className="flex gap-4 mb-4">
              {/* Thumbnail */}
              <div className="w-36 sm:w-44 aspect-video bg-[#272727] rounded-xl overflow-hidden flex-shrink-0 relative">
                {playlist.thumbnail ? (
                  <img src={playlist.thumbnail} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#272727] to-[#1a1a1a]">
                    <ListVideo className="w-12 h-12 text-gray-600" />
                  </div>
                )}
                {nestedPlaylists.length > 0 && (
                  <div className="absolute top-2 left-2 bg-purple-600/90 px-2 py-0.5 rounded text-xs flex items-center gap-1">
                    <Layers className="w-3 h-3" />{nestedPlaylists.length} playlists
                  </div>
                )}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold mb-1 line-clamp-2">{playlist.name}</h2>
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                  {playlist.isPublic ? <><Globe className="w-3 h-3" /> Public</> : <><Lock className="w-3 h-3" /> Private</>}
                  <span>•</span>
                  <span>{totalItems} items</span>
                </div>
                {playlist.description && (
                  <p className="text-sm text-gray-400 line-clamp-2">{playlist.description}</p>
                )}
              </div>
            </div>
            {/* Actions */}
            <div className="flex gap-2">
              <button onClick={playAll} disabled={videos.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-full font-medium hover:bg-gray-200 disabled:opacity-50 text-sm">
                <Play className="w-4 h-4" fill="black" />Play all
              </button>
              <button onClick={shufflePlay} disabled={videos.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/10 rounded-full font-medium hover:bg-white/20 disabled:opacity-50 text-sm">
                <Shuffle className="w-4 h-4" />Shuffle
              </button>
            </div>
          </div>

          {/* Content List */}
          <div className="pb-20">
            {/* Nested Playlists Section */}
            {nestedPlaylists.length > 0 && (
              <div className="border-b border-white/5">
                <div className="px-4 py-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium text-gray-300">Playlists ({nestedPlaylists.length})</span>
                </div>
                <div className="px-4 pb-3 space-y-1">
                  {nestedPlaylists.map(nested => (
                    <div key={nested.id} className="flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-white/5 group">
                      <div onClick={() => router.push(`/pages/media/playlists/${nested.id}`)}
                        className="w-24 aspect-video bg-[#272727] rounded-lg overflow-hidden cursor-pointer flex-shrink-0 relative">
                        {nested.thumbnail ? (
                          <img src={nested.thumbnail} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ListVideo className="w-6 h-6 text-gray-600" />
                          </div>
                        )}
                        <div className="absolute bottom-1 right-1 bg-black/80 px-1 py-0.5 rounded text-[10px]">
                          {nested.videoIds.length}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => router.push(`/pages/media/playlists/${nested.id}`)}>
                        <h4 className="font-medium text-sm line-clamp-1">{nested.name}</h4>
                        <p className="text-xs text-gray-500">{nested.videoIds.length} videos</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-500" />
                      {isOwner && (
                        <button onClick={() => handleRemoveNestedPlaylist(nested.id)}
                          className="p-2 hover:bg-white/10 rounded-full opacity-0 group-hover:opacity-100">
                          <Trash2 className="w-4 h-4 text-gray-400" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Videos Section */}
            {videos.length > 0 && (
              <div>
                <div className="px-4 py-3 flex items-center gap-2">
                  <Play className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-300">Videos ({videos.length})</span>
                </div>
                <div className="px-2">
                  {videos.map((video, index) => (
                    <div key={video.id} className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/5 group">
                      <span className="text-gray-500 text-xs w-5 text-center flex-shrink-0">{index + 1}</span>
                      <div onClick={() => router.push(`/pages/media/player/${video.id}?playlist=${playlistId}`)}
                        className="w-28 sm:w-36 aspect-video bg-[#272727] rounded-lg overflow-hidden cursor-pointer flex-shrink-0 relative">
                        {video.thumbnail ? (
                          <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Play className="w-6 h-6 text-gray-600" />
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                          <Play className="w-8 h-8" fill="white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => router.push(`/pages/media/player/${video.id}?playlist=${playlistId}`)}>
                        <h4 className="font-medium text-sm line-clamp-2">{video.title}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">{(video.views || 0).toLocaleString()} views</p>
                      </div>
                      {isOwner && (
                        <div className="relative">
                          <button onClick={() => setMenuOpen(menuOpen === video.id ? null : video.id)}
                            className="p-2 hover:bg-white/10 rounded-full opacity-0 group-hover:opacity-100">
                            <MoreVertical className="w-5 h-5 text-gray-400" />
                          </button>
                          {menuOpen === video.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                              <div className="absolute right-0 top-10 bg-[#282828] rounded-xl shadow-xl z-20 py-2 min-w-[180px] border border-white/10">
                                <button onClick={() => handleRemoveVideo(video.id)}
                                  className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-white/10 text-sm">
                                  <Trash2 className="w-4 h-4" />Remove from playlist
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {totalItems === 0 && (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="w-16 h-16 bg-[#272727] rounded-full flex items-center justify-center mb-4">
                  <ListVideo className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-base font-medium mb-1">This playlist is empty</h3>
                <p className="text-gray-400 text-sm text-center">Add videos or playlists to get started</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-gray-400">Playlist not found</p>
        </div>
      )}

      {/* Add Playlist Modal */}
      {showAddPlaylistModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowAddPlaylistModal(false)} />
          <div className="relative w-full sm:max-w-md bg-[#212121] rounded-t-2xl sm:rounded-2xl max-h-[70vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-lg font-semibold">Add playlist</h2>
              <button onClick={() => setShowAddPlaylistModal(false)} className="p-2 hover:bg-white/10 rounded-full -mr-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {loadingAddable ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-3 animate-pulse">
                      <div className="w-20 aspect-video bg-[#272727] rounded-lg" />
                      <div className="flex-1">
                        <div className="h-4 bg-[#272727] rounded w-3/4 mb-2" />
                        <div className="h-3 bg-[#272727] rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : addablePlaylists.length > 0 ? (
                <div className="space-y-2">
                  {addablePlaylists.map(p => (
                    <button key={p.id} onClick={() => handleAddPlaylist(p.id)}
                      className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-white/10 text-left">
                      <div className="w-20 aspect-video bg-[#272727] rounded-lg overflow-hidden flex-shrink-0">
                        {p.thumbnail ? (
                          <img src={p.thumbnail} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ListVideo className="w-6 h-6 text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-1">{p.name}</h4>
                        <p className="text-xs text-gray-500">{p.videoIds.length} videos</p>
                      </div>
                      <Plus className="w-5 h-5 text-gray-400" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">No playlists available to add</p>
                  <p className="text-xs mt-1">Create more playlists first</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
