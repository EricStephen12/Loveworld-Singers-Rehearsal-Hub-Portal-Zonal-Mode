'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useMedia } from './_context/MediaContext'
import { Play, MoreVertical, ListVideo } from 'lucide-react'
import { useUnreadNotifications } from '@/hooks/useUnreadNotifications'
import YouTubeHeader from './_components/YouTubeHeader'
import MediaCard from './_components/MediaCard'
import YouTubeSidebar from './_components/YouTubeSidebar'

export default function MediaPage() {
  const router = useRouter()
  const { user, profile } = useAuth()
  const {
    allMedia,
    isLoading,
    categories,
    isLoadingMore,
    hasMore,
    loadMore,
    refreshMedia
  } = useMedia()

  const { markMediaSeen } = useUnreadNotifications()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [viewMode, setViewMode] = useState<'all' | 'shorts' | 'playlists'>('all')
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const { adminPlaylists, isLoadingPlaylists } = useMedia()

  useEffect(() => {
    markMediaSeen()
  }, [markMediaSeen])

  useEffect(() => {
    refreshMedia()
  }, [])

  // Infinite Scroll
  useEffect(() => {
    if (!hasMore || isLoadingMore || viewMode !== 'all') return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    const sentinel = document.getElementById('load-more-sentinel')
    if (sentinel) observer.observe(sentinel)

    return () => observer.disconnect()
  }, [hasMore, isLoadingMore, loadMore, viewMode])

  // Mobile Sidebar Auto-Close
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Filter media
  const filteredMedia = useMemo(() => {
    let filtered = allMedia.filter(m => m.type !== 'shorts' && !m.genre?.includes('Shorts'))

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(v => v.type === selectedCategory)
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(v => v.title.toLowerCase().includes(q) || v.description?.toLowerCase().includes(q))
    }

    return filtered
  }, [allMedia, selectedCategory, searchQuery])

  const formatViews = (views: number) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M views`
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K views`
    return `${views} views`
  }

  const getTimeAgo = (date: any) => {
    try {
      if (!date) return 'Recently'
      const dateObj = date?.toDate ? date.toDate() : (date instanceof Date ? date : new Date(date))
      if (isNaN(dateObj.getTime())) return 'Recently'

      const now = new Date()
      const diff = now.getTime() - dateObj.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const days = Math.floor(hours / 24)
      const months = Math.floor(days / 30)

      if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`
      if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
      if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
      return 'Just now'
    } catch {
      return 'Recently'
    }
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return ''
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  // Pre-calculate category map for MediaCard optimization
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>()
    categories.forEach((cat: any) => map.set(cat.slug, cat.name))
    return map
  }, [categories])

  if (isLoading && allMedia.length === 0) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-screen overflow-hidden bg-[#0f0f0f] text-white flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0f0f0f]">
        <YouTubeHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          showMobileSearch={showMobileSearch}
          setShowMobileSearch={setShowMobileSearch}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          userName={profile?.first_name || profile?.display_name || user?.email || undefined}
        />

        {/* Category Chips - Offset by sidebar width */}
        <div className={`px-3 py-2.5 flex gap-2 overflow-x-auto scrollbar-hide border-b border-white/5 transition-all duration-300 ${sidebarOpen ? 'ml-0 lg:ml-[240px]' : 'ml-0 lg:ml-[72px]'}`}>
          <button
            onClick={() => { setViewMode('all'); setSelectedCategory('all'); }}
            className={`px-3 h-8 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${viewMode === 'all' && selectedCategory === 'all' ? 'bg-white text-black' : 'bg-[#272727] text-white hover:bg-[#3f3f3f]'
              }`}
          >
            All
          </button>
          <button
            onClick={() => setViewMode('playlists')}
            className={`px-3 h-8 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${viewMode === 'playlists' ? 'bg-white text-black' : 'bg-[#272727] text-white hover:bg-[#3f3f3f]'
              }`}
          >
            Playlists
          </button>
          {categories.map((cat: any) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-3 h-8 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${selectedCategory === cat.slug ? 'bg-white text-black' : 'bg-[#272727] text-white hover:bg-[#3f3f3f]'
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 pt-24 overflow-hidden">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`fixed lg:relative z-40 transition-transform duration-300 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <YouTubeSidebar
            sidebarOpen={sidebarOpen}
            viewMode={viewMode === 'shorts' ? 'shorts' : 'all'}
            selectedCategory={selectedCategory}
            setViewMode={(mode) => setViewMode(mode as any)}
            setSelectedCategory={setSelectedCategory}
            categories={categories}
          />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#0f0f0f]">
          <div className="pt-8 pb-24 px-4 sm:px-6 lg:px-8 max-w-[2100px] mx-auto transition-all duration-300">
            {viewMode === 'playlists' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-6 gap-y-10">
                {adminPlaylists.map((playlist) => (
                  <div
                    key={playlist.id}
                    onClick={() => router.push(`/pages/media/playlists/admin/${playlist.id}`)}
                    className="cursor-pointer group"
                  >
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-[#272727] mb-3 shadow-lg">
                      <img
                        src={playlist.thumbnail || '/movie/default-hero.jpeg'}
                        alt={playlist.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Playlist Overlay */}
                      <div className="absolute inset-0 bg-black/30 flex flex-col items-end justify-center px-4">
                        <div className="bg-black/70 backdrop-blur-md p-3 rounded-xl flex flex-col items-center min-w-[70px]">
                          <span className="text-base font-bold text-white">{playlist.videoIds?.length || 0}</span>
                          <ListVideo className="w-5 h-5 text-white/90 mt-1" strokeWidth={2.5} />
                        </div>
                      </div>
                    </div>
                    <div className="px-1">
                      <h3 className="text-white text-[15px] sm:text-[16px] font-bold line-clamp-2 leading-snug mb-1 group-hover:text-blue-400 transition-colors">
                        {playlist.name}
                      </h3>
                      <p className="text-sm text-[#aaa] font-medium">
                        Playlist • Official
                      </p>
                    </div>
                  </div>
                ))}

                {isLoadingPlaylists && adminPlaylists.length === 0 && (
                  <div className="col-span-full py-40 flex flex-col items-center justify-center">
                    <div className="w-10 h-10 border-3 border-white/20 border-t-white rounded-full animate-spin mb-4" />
                    <p className="text-[#aaa] text-base font-medium">Loading collections...</p>
                  </div>
                )}

                {!isLoadingPlaylists && adminPlaylists.length === 0 && (
                  <div className="col-span-full py-40 text-center">
                    <p className="text-[#aaa] text-xl font-bold">No collections found</p>
                    <p className="text-[#888] text-sm mt-2">Check back later for curated music collections.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-x-4 gap-y-10">
                {filteredMedia.map((video) => (
                  <MediaCard
                    key={video.id}
                    media={video}
                    categoryMap={categoryMap}
                  />
                ))}

                {/* Loading Skeleton */}
                {isLoading && (
                  <>
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="flex flex-col gap-3">
                        <div className="w-full aspect-video bg-[#272727] animate-pulse sm:rounded-xl" />
                        <div className="flex gap-3 px-3 sm:px-1">
                          <div className="w-10 h-10 rounded-full bg-[#272727] animate-pulse flex-shrink-0" />
                          <div className="flex-1 space-y-2">
                            <div className="h-5 bg-[#272727] rounded w-full animate-pulse" />
                            <div className="h-4 bg-[#272727] rounded w-2/3 animate-pulse" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {/* Load More Sentinel */}
                {hasMore && (
                  <div id="load-more-sentinel" className="col-span-full h-24 flex items-center justify-center">
                    {isLoadingMore && (
                      <div className="w-10 h-10 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
