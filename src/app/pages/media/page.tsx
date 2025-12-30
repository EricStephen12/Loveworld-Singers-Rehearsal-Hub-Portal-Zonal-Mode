'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useMedia } from './_context/MediaContext'
import { Search, ListVideo, ArrowLeft } from 'lucide-react'
import PlaylistCard from './_components/PlaylistCard'
import { getCategories, MediaCategory } from '@/lib/media-category-service'
import { getPublicPlaylists, Playlist } from './_lib/playlist-service'
import { getPublicAdminPlaylists, AdminPlaylist } from '@/lib/admin-playlist-service'
import { useZone } from '@/hooks/useZone'
import { isHQGroup } from '@/config/zones'

// Combined playlist type for display
interface DisplayPlaylist {
  id: string
  name: string
  description?: string
  thumbnail?: string
  videoIds: string[]
  type?: string
  isAdmin?: boolean
}

export default function MediaPage() {
  const router = useRouter()
  const { user, profile, isLoading: authLoading } = useAuth()
  const { currentZone } = useZone()
  const { isLoading, refreshMedia } = useMedia()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [categories, setCategories] = useState<MediaCategory[]>([])
  const [allPlaylists, setAllPlaylists] = useState<DisplayPlaylist[]>([])
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(true)

  useEffect(() => {
    document.body.style.overflow = 'auto'
    document.documentElement.style.overflow = 'auto'
  }, [])

  // Load categories from Firestore
  useEffect(() => {
    const loadCats = async () => {
      try {
        const cats = await getCategories()
        setCategories(cats)
      } catch (e) {
        console.error('Error loading categories:', e)
      }
    }
    loadCats()
  }, [])

  // Load public playlists (both admin and user playlists)
  useEffect(() => {
    const loadPlaylists = async () => {
      try {
        setIsLoadingPlaylists(true)
        const isHQ = currentZone ? isHQGroup(currentZone.id) : true
        
        // Load both admin and user public playlists
        const [adminPlaylists, userPlaylists] = await Promise.all([
          getPublicAdminPlaylists(isHQ),
          getPublicPlaylists(20)
        ])
        
        // Convert to display format
        const adminDisplay: DisplayPlaylist[] = adminPlaylists.map(p => ({
          id: `admin_${p.id}`,
          name: p.name,
          description: p.description,
          thumbnail: p.thumbnail,
          videoIds: p.videoIds,
          type: p.type,
          isAdmin: true
        }))
        
        const userDisplay: DisplayPlaylist[] = userPlaylists.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          thumbnail: p.thumbnail,
          videoIds: p.videoIds,
          type: p.type,
          isAdmin: false
        }))
        
        // Combine: admin playlists first
        setAllPlaylists([...adminDisplay, ...userDisplay])
      } catch (e) {
        console.error('Error loading public playlists:', e)
      } finally {
        setIsLoadingPlaylists(false)
      }
    }
    loadPlaylists()
  }, [currentZone])

  // Refresh on mount
  useEffect(() => {
    refreshMedia()
  }, [])

  // Show loading only while auth is checking AND we have no cached profile (like groups page)
  if (authLoading && !profile) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-gray-700 border-t-red-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  // If we have cached profile, show content even if user is still loading
  // This prevents blank screen on revisits

  // Create category map for efficient lookup
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>()
    categories.forEach(cat => map.set(cat.slug, cat.name))
    return map
  }, [categories])

  // Filter playlists by category and search
  const filteredPlaylists = useMemo(() => {
    let filtered = allPlaylists
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(playlist => playlist.type === selectedCategory)
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(playlist =>
        playlist.name.toLowerCase().includes(query) ||
        playlist.description?.toLowerCase().includes(query)
      )
    }
    return filtered
  }, [allPlaylists, selectedCategory, searchQuery])

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0f0f0f] h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/home')} className="p-2 hover:bg-white/10 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-lg font-semibold">Media</span>
        </div>

        {/* Search */}
        <div className={`${showMobileSearch ? 'flex absolute inset-x-0 top-0 h-14 bg-[#0f0f0f] px-4 z-50 items-center' : 'hidden'} md:flex flex-1 max-w-xl mx-4 items-center`}>
          {showMobileSearch && (
            <button onClick={() => setShowMobileSearch(false)} className="p-2 mr-2">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex flex-1">
            <input
              type="text"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-[#121212] border border-[#303030] rounded-full px-4 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1">
          <button onClick={() => setShowMobileSearch(true)} className="p-2 hover:bg-white/10 rounded-full md:hidden">
            <Search className="w-5 h-5" />
          </button>
          <button 
            onClick={() => router.push('/pages/media/playlists')} 
            className="p-2 hover:bg-white/10 rounded-full"
          >
            <ListVideo className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Category Pills */}
      <div className="sticky top-14 z-30 bg-[#0f0f0f] px-4 py-2">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {/* All category */}
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
              selectedCategory === 'all' 
                ? 'bg-white text-black' 
                : 'bg-[#272727] text-white hover:bg-[#3f3f3f]'
            }`}
          >
            All
          </button>
          {/* Dynamic categories from Firestore */}
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                selectedCategory === cat.slug 
                  ? 'bg-white text-black' 
                  : 'bg-[#272727] text-white hover:bg-[#3f3f3f]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Playlist Grid */}
      <div className="p-4 pb-6">
          {isLoading || isLoadingPlaylists ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="w-full aspect-video bg-[#272727] rounded-xl mb-3" />
                  <div className="flex gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#272727] flex-shrink-0" />
                    <div className="flex-1">
                      <div className="h-4 bg-[#272727] rounded mb-2" />
                      <div className="h-3 bg-[#272727] rounded w-3/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredPlaylists.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredPlaylists.map((playlist) => (
                <PlaylistCard key={`playlist-${playlist.id}`} playlist={playlist} categoryMap={categoryMap} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 bg-[#272727] rounded-full flex items-center justify-center mb-4">
                <ListVideo className="w-10 h-10 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium mb-2">No playlists found</h3>
              <p className="text-gray-400 text-sm text-center px-4">
                {searchQuery ? 'Try different keywords' : 'No playlists available yet'}
              </p>
            </div>
          )}
      </div>
    </div>
  )
}
