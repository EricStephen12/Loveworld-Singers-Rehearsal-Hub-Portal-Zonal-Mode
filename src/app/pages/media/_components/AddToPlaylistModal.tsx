'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Check, ListVideo } from 'lucide-react'
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
      return
    }
    setCreating(true)
    try {
      const newId = await createPlaylist(userId, newPlaylistName.trim())
      await addToPlaylist(newId, videoId, videoThumbnail)
      setNewPlaylistName('')
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
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      <div className="relative bg-[#161616] w-full sm:w-[380px] sm:rounded-3xl rounded-t-3xl max-h-[75vh] flex flex-col border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom-6 duration-500">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex flex-col">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Curate Library</h3>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-0.5">Save to your collections</p>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-10 h-10 border-2 border-white/5 border-t-indigo-500 rounded-full animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Syncing Collections...</p>
            </div>
          ) : (
            <>
              {playlists.map((playlist) => {
                const isSelected = selectedIds.includes(playlist.id);
                return (
                  <button
                    key={playlist.id}
                    onClick={() => handleTogglePlaylist(playlist.id)}
                    className={`flex items-center gap-4 w-full p-4 rounded-2xl transition-all duration-300 group ${isSelected ? 'bg-indigo-600/10' : 'hover:bg-white/5'
                      }`}
                  >
                    <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${isSelected
                        ? 'bg-indigo-500 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                        : 'border-white/10 group-hover:border-white/30'
                      }`}>
                      {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={4} />}
                    </div>
                    <ListVideo className={`w-5 h-5 transition-colors ${isSelected ? 'text-indigo-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                    <span className={`flex-1 text-left text-sm font-bold uppercase tracking-tight truncate ${isSelected ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                      {playlist.name}
                    </span>
                    <span className={`text-[10px] font-black tracking-widest ${isSelected ? 'text-indigo-400' : 'text-gray-600'}`}>{playlist.videoIds.length}</span>
                  </button>
                );
              })}

              {playlists.length === 0 && !showCreate && (
                <div className="flex flex-col items-center justify-center py-12 opacity-40">
                  <ListVideo className="w-12 h-12 mb-4 text-gray-500" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Your Hub is Empty</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Create New Navigation */}
        <div className="p-4 border-t border-white/5 bg-white/1">
          {showCreate ? (
            <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
              <input
                type="text"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="ENTER COLLECTION NAME..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs font-black uppercase tracking-widest placeholder:text-gray-600 focus:outline-none focus:border-indigo-500/50 focus:bg-white/10 transition-all"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreatePlaylist()}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowCreate(false); setNewPlaylistName('') }}
                  className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  ABORT
                </button>
                <button
                  onClick={handleCreatePlaylist}
                  disabled={!newPlaylistName.trim() || creating}
                  className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all"
                >
                  {creating ? 'SYNCING...' : 'INITIATE'}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center justify-center gap-3 w-full p-4 hover:bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-indigo-400 border border-indigo-500/20 transition-all group"
            >
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              Create New Collection
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
