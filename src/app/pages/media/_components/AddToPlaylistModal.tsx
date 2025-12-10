'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Check, ListVideo } from 'lucide-react'
import { Globe, Lock } from 'lucide-react'
import { 
  getUserPlaylists, 
  createPlaylist, 
  addToPlaylist, 
  removeFromPlaylist,
  getPlaylistsContainingVideo,
  Playlist 
} from '../_lib/playlist-service'

interface AddToPlaylistModalProps {
  isOpen: boolean
  onClose: () => void
  videoId: string
  videoThumbnail?: string
  userId: string
}

export default function AddToPlaylistModal({ 
  isOpen, 
  onClose, 
  videoId, 
  videoThumbnail,
  userId 
}: AddToPlaylistModalProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [newPlaylistPublic, setNewPlaylistPublic] = useState(false)
  const [showCreate, setShowCreate] = useState(false)

  useEffect(() => {
    if (isOpen && userId) {
      loadPlaylists()
    }
  }, [isOpen, userId, videoId])

  const loadPlaylists = async () => {
    setLoading(true)
    try {
      const [userPlaylists, containingIds] = await Promise.all([
        getUserPlaylists(userId),
        getPlaylistsContainingVideo(userId, videoId)
      ])
      setPlaylists(userPlaylists)
      setSelectedIds(containingIds)
    } catch (error) {
      console.error('Error loading playlists:', error)
    }
    setLoading(false)
  }

  const handleTogglePlaylist = async (playlistId: string) => {
    const isSelected = selectedIds.includes(playlistId)
    try {
      if (isSelected) {
        await removeFromPlaylist(playlistId, videoId)
        setSelectedIds(prev => prev.filter(id => id !== playlistId))
      } else {
        await addToPlaylist(playlistId, videoId, videoThumbnail)
        setSelectedIds(prev => [...prev, playlistId])
      }
    } catch (error) {
      console.error('Error toggling playlist:', error)
    }
  }

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim() || !userId) {
      console.log('❌ Cannot create playlist - missing name or userId:', { name: newPlaylistName, userId })
      return
    }
    setCreating(true)
    try {
      console.log('📝 Creating playlist:', newPlaylistName.trim(), 'for user:', userId, 'public:', newPlaylistPublic)
      const newId = await createPlaylist(userId, newPlaylistName.trim(), undefined, newPlaylistPublic)
      console.log('📝 Playlist created with ID:', newId)
      await addToPlaylist(newId, videoId, videoThumbnail)
      console.log('📝 Video added to new playlist')
      setNewPlaylistName('')
      setNewPlaylistPublic(false)
      setShowCreate(false)
      await loadPlaylists()
    } catch (error) {
      console.error('❌ Error creating playlist:', error)
    }
    setCreating(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-[#212121] w-full sm:w-[360px] sm:rounded-xl rounded-t-xl max-h-[70vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-lg font-medium">Save to playlist</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {playlists.map((playlist) => (
                <button
                  key={playlist.id}
                  onClick={() => handleTogglePlaylist(playlist.id)}
                  className="flex items-center gap-3 w-full p-3 hover:bg-white/10 rounded-lg"
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    selectedIds.includes(playlist.id) 
                      ? 'bg-blue-500 border-blue-500' 
                      : 'border-gray-500'
                  }`}>
                    {selectedIds.includes(playlist.id) && <Check className="w-3 h-3" />}
                  </div>
                  <ListVideo className="w-5 h-5 text-gray-400" />
                  <span className="flex-1 text-left truncate">{playlist.name}</span>
                  {playlist.isPublic && <Globe className="w-3.5 h-3.5 text-blue-400" />}
                  <span className="text-xs text-gray-500">{playlist.videoIds.length}</span>
                </button>
              ))}

              {playlists.length === 0 && !showCreate && (
                <div className="text-center py-6 text-gray-400">
                  <ListVideo className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No playlists yet</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Create New */}
        <div className="border-t border-white/10 p-3">
          {showCreate ? (
            <div className="space-y-3">
              <input
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="Playlist name"
                className="w-full bg-[#121212] border border-[#303030] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreatePlaylist()}
              />
              {/* Public/Private Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setNewPlaylistPublic(false)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                    !newPlaylistPublic 
                      ? 'bg-gray-700 text-white' 
                      : 'bg-transparent text-gray-400 hover:bg-white/5'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  Private
                </button>
                <button
                  onClick={() => setNewPlaylistPublic(true)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                    newPlaylistPublic 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-transparent text-gray-400 hover:bg-white/5'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  Public
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowCreate(false); setNewPlaylistName(''); setNewPlaylistPublic(false) }}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePlaylist}
                  disabled={!newPlaylistName.trim() || creating}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {creating ? '...' : 'Create'}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-3 w-full p-2 hover:bg-white/10 rounded-lg"
            >
              <Plus className="w-5 h-5" />
              <span>Create new playlist</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
