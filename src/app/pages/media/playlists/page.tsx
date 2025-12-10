'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useZone } from '@/hooks/useZone'
import { isHQGroup } from '@/config/zones'
import { getUserPlaylists, deletePlaylist, ensureSystemPlaylists, getPublicPlaylists, Playlist } from '../_lib/playlist-service'
import { getPublicAdminPlaylists, AdminPlaylist } from '@/lib/admin-playlist-service'
import { ArrowLeft, ListVideo, MoreVertical, Trash2, Play, ThumbsUp, Clock, Globe, Users, Award } from 'lucide-react'

// Combined playlist type for display
interface DisplayPlaylist {
  id: string
  name: string
  description?: string
  thumbnail?: string
  videoIds: string[]
  isPublic?: boolean
  updatedAt: Date
  isAdmin?: boolean // Flag to identify admin playlists
  createdByName?: string
}

export default function PlaylistsPage() {
  const router = useRouter()
  const { user, profile, isLoading: authLoading } = useAuth()
  const { currentZone } = useZone()
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [publicPlaylists, setPublicPlaylists] = useState<DisplayPlaylist[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingPublic, setLoadingPublic] = useState(true)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'mine' | 'public'>('mine')

  const isHQ = isHQGroup(currentZone?.id)

  useEffect(() => {
    // Wait for user to be available (auth might still be loading)
    if (user?.uid) {
      initAndLoad(user.uid)
    } else if (!authLoading && profile) {
      // If auth finished loading but no user, we have a stale profile cache
      setLoading(false)
    }
  }, [user?.uid, authLoading])
  
  // Load public playlists when zone is available
  useEffect(() => {
    loadPublicPlaylists()
  }, [currentZone?.id])
  
  const loadPublicPlaylists = async () => {
    setLoadingPublic(true)
    try {
      // Determine zone type (default to false if zone not loaded yet)
      const zoneIsHQ = currentZone ? isHQGroup(currentZone.id) : false
      console.log('📋 Loading public playlists, isHQ:', zoneIsHQ, 'zone:', currentZone?.id)
      
      // Load both user public playlists and admin playlists
      const [userPublic, adminPublic] = await Promise.all([
        getPublicPlaylists(20),
        getPublicAdminPlaylists(zoneIsHQ)
      ])
      
      console.log('📋 Loaded admin playlists:', adminPublic.length, 'user playlists:', userPublic.length)
      
      // Convert admin playlists to display format
      const adminDisplay: DisplayPlaylist[] = adminPublic.map(p => ({
        id: `admin_${p.id}`, // Prefix to distinguish from user playlists
        name: p.name,
        description: p.description,
        thumbnail: p.thumbnail,
        videoIds: p.videoIds,
        isPublic: true,
        updatedAt: p.updatedAt,
        isAdmin: true,
        createdByName: p.createdByName
      }))
      
      // Convert user playlists to display format
      const userDisplay: DisplayPlaylist[] = userPublic.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        thumbnail: p.thumbnail,
        videoIds: p.videoIds,
        isPublic: p.isPublic,
        updatedAt: p.updatedAt instanceof Date ? p.updatedAt : new Date(p.updatedAt),
        isAdmin: false
      }))
      
      // Combine: admin playlists first, then user playlists
      setPublicPlaylists([...adminDisplay, ...userDisplay])
    } catch (error) {
      console.error('Error loading public playlists:', error)
    }
    setLoadingPublic(false)
  }

  const initAndLoad = async (userId: string) => {
    setLoading(true)
    try {
      console.log('📋 Loading playlists for user:', userId)
      // Ensure system playlists exist
      await ensureSystemPlaylists(userId)
      const data = await getUserPlaylists(userId)
      console.log('📋 Loaded playlists:', data.length)
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

  // Show loading only while auth is checking AND we have no cached profile
  if (authLoading && !profile) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-700 border-t-red-600 rounded-full animate-spin" />
      </div>
    )
  }

  // Only show login prompt if truly logged out (no user AND no cached profile)
  if (!user && !profile) {
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
      <header className="sticky top-0 z-50 bg-[#0f0f0f]">
        <div className="h-14 flex items-center gap-3 px-4">
          <button onClick={() => router.push('/pages/media')} className="p-2 hover:bg-white/10 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">Playlists</h1>
        </div>
        {/* Tabs */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('mine')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'mine' 
                ? 'text-white border-b-2 border-white' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <ListVideo className="w-4 h-4" />
            My Playlists
          </button>
          <button
            onClick={() => setActiveTab('public')}
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === 'public' 
                ? 'text-white border-b-2 border-white' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <Globe className="w-4 h-4" />
            Public Playlists
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'mine' ? (
          // My Playlists Tab
          loading ? (
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
                    {playlist.isPublic && (
                      <div className="absolute top-1 left-1 bg-blue-600/90 px-1.5 py-0.5 rounded text-xs flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        Public
                      </div>
                    )}
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
          )
        ) : (
          // Public Playlists Tab
          loadingPublic ? (
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
          ) : publicPlaylists.length > 0 ? (
            <div className="space-y-3">
              {publicPlaylists.map((playlist) => {
                // Handle admin playlist routing (remove admin_ prefix)
                const playlistId = playlist.isAdmin 
                  ? playlist.id.replace('admin_', '') 
                  : playlist.id
                const playlistPath = playlist.isAdmin
                  ? `/pages/media/playlists/admin/${playlistId}`
                  : `/pages/media/playlists/${playlistId}`
                
                return (
                  <div 
                    key={playlist.id}
                    onClick={() => router.push(playlistPath)}
                    className="flex gap-3 group relative cursor-pointer"
                  >
                    {/* Thumbnail */}
                    <div className="w-40 aspect-video bg-[#272727] rounded-lg overflow-hidden relative flex-shrink-0">
                      {playlist.thumbnail ? (
                        <img src={playlist.thumbnail} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ListVideo className="w-10 h-10 text-gray-600" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-10 h-10" fill="white" />
                      </div>
                      <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-xs">
                        {playlist.videoIds.length} videos
                      </div>
                      {playlist.isAdmin ? (
                        <div className="absolute top-1 left-1 bg-purple-600/90 px-1.5 py-0.5 rounded text-xs flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          Official
                        </div>
                      ) : (
                        <div className="absolute top-1 left-1 bg-blue-600/90 px-1.5 py-0.5 rounded text-xs flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          Public
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium line-clamp-2 group-hover:text-gray-300">
                        {playlist.name}
                      </h3>
                      {playlist.description && (
                        <p className="text-sm text-gray-400 line-clamp-1 mt-1">{playlist.description}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        {playlist.isAdmin ? (
                          <>
                            <Award className="w-3 h-3" />
                            Official Playlist
                          </>
                        ) : (
                          <>
                            <Users className="w-3 h-3" />
                            Shared playlist
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 bg-[#272727] rounded-full flex items-center justify-center mb-4">
                <Globe className="w-10 h-10 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium mb-2">No public playlists</h3>
              <p className="text-gray-400 text-sm text-center px-4 mb-4">
                Public playlists shared by others will appear here
              </p>
            </div>
          )
        )}
      </div>
    </div>
  )
}
