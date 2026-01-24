'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import {
  Plus, Edit2, Trash2, ListVideo, Globe, Star,
  X, Check, Search, GripVertical, Play, Eye, CheckCircle, XCircle
} from 'lucide-react'
import {
  getAdminPlaylists,
  createAdminPlaylist,
  updateAdminPlaylist,
  deleteAdminPlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  AdminPlaylist
} from '@/lib/admin-playlist-service'
import { mediaVideosService, MediaVideo } from '@/lib/media-videos-service'
import CustomLoader from '@/components/CustomLoader'

type ViewMode = 'list' | 'create' | 'edit' | 'videos'

export default function PlaylistsSection() {
  const { user, profile } = useAuth()
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [playlists, setPlaylists] = useState<AdminPlaylist[]>([])
  const [allVideos, setAllVideos] = useState<MediaVideo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPlaylist, setSelectedPlaylist] = useState<AdminPlaylist | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [isFeatured, setIsFeatured] = useState(false)
  const [forHQ, setForHQ] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Video selection
  const [videoSearch, setVideoSearch] = useState('')

  // Toast and delete confirmation
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3000)
  }

  // Helper to get thumbnail from first video in playlist
  const getPlaylistThumbnail = (playlist: AdminPlaylist): string => {
    if (playlist.videoIds.length > 0) {
      const firstVideo = allVideos.find(v => v.id === playlist.videoIds[0])
      return firstVideo?.thumbnail || ''
    }
    return ''
  }

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [playlistsData, videosData] = await Promise.all([
        getAdminPlaylists(),
        mediaVideosService.getAll(100)
      ])
      setPlaylists(playlistsData)
      setAllVideos(videosData)
    } catch (e) {
      console.error('Error loading data:', e)
    }
    setIsLoading(false)
  }

  const resetForm = () => {
    setName('')
    setDescription('')
    setIsPublic(true)
    setIsFeatured(false)
    setForHQ(true)
    setSelectedPlaylist(null)
  }

  const handleCreate = async () => {
    if (!name.trim()) {
      showToast('error', 'Please enter a playlist name')
      return
    }
    setIsSubmitting(true)
    try {
      await createAdminPlaylist({
        name: name.trim(),
        description: description.trim(),
        thumbnail: '',
        isPublic,
        isFeatured,
        forHQ,
        createdBy: user?.uid || 'admin',
        createdByName: profile?.first_name || 'Admin'
      })
      showToast('success', 'Playlist created!')
      resetForm()
      setViewMode('list')
      loadData()
    } catch (e) {
      showToast('error', 'Failed to create playlist')
    }
    setIsSubmitting(false)
  }

  const handleUpdate = async () => {
    if (!selectedPlaylist || !name.trim()) return
    setIsSubmitting(true)
    try {
      await updateAdminPlaylist(selectedPlaylist.id, {
        name: name.trim(),
        description: description.trim(),
        isPublic,
        isFeatured,
        forHQ
      })
      showToast('success', 'Playlist updated!')
      resetForm()
      setViewMode('list')
      loadData()
    } catch (e) {
      showToast('error', 'Failed to update playlist')
    }
    setIsSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteAdminPlaylist(id)
      showToast('success', 'Playlist deleted!')
      setDeleteConfirm(null)
      loadData()
    } catch (e) {
      showToast('error', 'Failed to delete playlist')
    }
  }

  const handleEditClick = (playlist: AdminPlaylist) => {
    setSelectedPlaylist(playlist)
    setName(playlist.name)
    setDescription(playlist.description)
    setIsPublic(playlist.isPublic)
    setIsFeatured(playlist.isFeatured)
    setForHQ(playlist.forHQ)
    setViewMode('edit')
  }

  const handleManageVideos = (playlist: AdminPlaylist) => {
    setSelectedPlaylist(playlist)
    setViewMode('videos')
  }

  const handleToggleVideo = async (videoId: string) => {
    if (!selectedPlaylist) return
    try {
      if (selectedPlaylist.videoIds.includes(videoId)) {
        await removeVideoFromPlaylist(selectedPlaylist.id, videoId)
        setSelectedPlaylist({
          ...selectedPlaylist,
          videoIds: selectedPlaylist.videoIds.filter(id => id !== videoId)
        })
      } else {
        await addVideoToPlaylist(selectedPlaylist.id, videoId)
        setSelectedPlaylist({
          ...selectedPlaylist,
          videoIds: [...selectedPlaylist.videoIds, videoId]
        })
      }
      loadData()
    } catch (e) {
      showToast('error', 'Failed to update playlist')
    }
  }

  const filteredVideos = allVideos.filter(v =>
    v.title.toLowerCase().includes(videoSearch.toLowerCase())
  )

  // List View
  if (viewMode === 'list') {
    return (
      <div className="h-full overflow-auto bg-gray-50 p-4 lg:p-6">
        {/* Toast */}
        {toast && (
          <div className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}>
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            {toast.message}
          </div>
        )}

        {/* Delete Confirmation */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 z-[80] flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Delete Playlist</h3>
                  <p className="text-sm text-gray-500">This cannot be undone</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Playlists</h1>
            <p className="text-sm text-gray-500">{playlists.length} playlists</p>
          </div>
          <button
            onClick={() => { resetForm(); setViewMode('create') }}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">New Playlist</span>
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-gray-100 shadow-sm">
            <CustomLoader message="Loading playlists..." />
          </div>
        ) : playlists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <ListVideo className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No playlists yet</h3>
            <p className="text-gray-500 text-sm mb-4">Create your first curated playlist</p>
            <button
              onClick={() => setViewMode('create')}
              className="px-6 py-2.5 bg-purple-600 text-white rounded-xl font-medium"
            >
              Create Playlist
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {playlists.map(playlist => {
              const thumbUrl = playlist.thumbnail || getPlaylistThumbnail(playlist)
              return (
                <div key={playlist.id} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="relative aspect-video bg-gray-100">
                    {thumbUrl ? (
                      <img src={thumbUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ListVideo className="w-12 h-12 text-gray-300" />
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                      {playlist.videoIds.length} videos
                    </div>
                    {playlist.isFeatured && (
                      <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                        <Star className="w-3 h-3" /> Featured
                      </div>
                    )}
                    {playlist.isPublic && (
                      <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-1 line-clamp-1">{playlist.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">{playlist.description || 'No description'}</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleManageVideos(playlist)}
                        className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 flex items-center justify-center gap-1"
                      >
                        <Play className="w-4 h-4" /> Videos
                      </button>
                      <button
                        onClick={() => handleEditClick(playlist)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4 text-gray-500" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(playlist.id)}
                        className="p-2 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // Create/Edit View
  if (viewMode === 'create' || viewMode === 'edit') {
    return (
      <div className="h-full overflow-auto bg-gray-50 p-4 lg:p-6">
        <div className="max-w-xl mx-auto">
          <button
            onClick={() => { resetForm(); setViewMode('list') }}
            className="flex items-center gap-2 text-gray-600 mb-6 hover:text-gray-900"
          >
            <X className="w-5 h-5" /> Cancel
          </button>

          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {viewMode === 'create' ? 'Create Playlist' : 'Edit Playlist'}
          </h1>

          <div className="space-y-4">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Playlist name"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this playlist about?"
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="text-sm text-gray-500">
                💡 Thumbnail will automatically use the first video's thumbnail
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">Visibility</label>
                <button
                  onClick={() => setIsPublic(!isPublic)}
                  className={`w-full px-4 py-3 rounded-xl border-2 font-medium transition-all flex items-center justify-center gap-2 ${isPublic ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'
                    }`}
                >
                  <Globe className="w-4 h-4" />
                  {isPublic ? 'Public' : 'Private'}
                </button>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">Featured</label>
                <button
                  onClick={() => setIsFeatured(!isFeatured)}
                  className={`w-full px-4 py-3 rounded-xl border-2 font-medium transition-all flex items-center justify-center gap-2 ${isFeatured ? 'border-yellow-500 bg-yellow-50 text-yellow-700' : 'border-gray-200 text-gray-600'
                    }`}
                >
                  <Star className="w-4 h-4" />
                  {isFeatured ? 'Featured' : 'Not Featured'}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">Zone Targeting</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setForHQ(true)}
                  className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${forHQ ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'
                    }`}
                >
                  🏢 HQ Zones
                </button>
                <button
                  onClick={() => setForHQ(false)}
                  className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${!forHQ ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600'
                    }`}
                >
                  🌍 Regular Zones
                </button>
              </div>
            </div>

            <button
              onClick={viewMode === 'create' ? handleCreate : handleUpdate}
              disabled={!name.trim() || isSubmitting}
              className="w-full py-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <CustomLoader size="sm" />
                  <span className="ml-2">Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  {viewMode === 'create' ? 'Create Playlist' : 'Save Changes'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Manage Videos View
  return (
    <div className="h-full overflow-auto bg-gray-50 p-4 lg:p-6">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => { setSelectedPlaylist(null); setViewMode('list') }}
          className="flex items-center gap-2 text-gray-600 mb-6 hover:text-gray-900"
        >
          <X className="w-5 h-5" /> Back to Playlists
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-24 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
            {(() => {
              const thumbUrl = selectedPlaylist?.thumbnail || (selectedPlaylist ? getPlaylistThumbnail(selectedPlaylist) : '')
              return thumbUrl ? (
                <img src={thumbUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ListVideo className="w-8 h-8 text-gray-400" />
                </div>
              )
            })()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{selectedPlaylist?.name}</h1>
            <p className="text-sm text-gray-500">{selectedPlaylist?.videoIds.length} videos</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={videoSearch}
            onChange={(e) => setVideoSearch(e.target.value)}
            placeholder="Search videos..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Videos List */}
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {filteredVideos.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No videos found
            </div>
          ) : (
            filteredVideos.map(video => {
              const isInPlaylist = selectedPlaylist?.videoIds.includes(video.id)
              return (
                <div key={video.id} className="flex items-center gap-3 p-3 hover:bg-gray-50">
                  <button
                    onClick={() => handleToggleVideo(video.id)}
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 ${isInPlaylist ? 'bg-purple-600 border-purple-600 text-white' : 'border-gray-300'
                      }`}
                  >
                    {isInPlaylist && <Check className="w-4 h-4" />}
                  </button>
                  <div className="w-24 h-14 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 line-clamp-1">{video.title}</h4>
                    <p className="text-xs text-gray-500">{video.type} • {video.views || 0} views</p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  );
}
