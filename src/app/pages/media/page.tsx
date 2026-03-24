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
import LiveStreamPlayer from './_components/LiveStreamPlayer'
import { useZone } from '@/hooks/useZone'
import { isHQGroup } from '@/config/zones'
import MediaCardSkeleton from './_components/MediaCardSkeleton'

export default function MediaPage() {
  const router = useRouter()
  const { currentZone } = useZone()
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
  const [viewMode, setViewMode] = useState<'all' | 'playlists'>('all')
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
    let filtered = allMedia.filter(m => !m.genre?.includes('Shorts'))

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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-screen overflow-hidden bg-slate-950 text-slate-200 flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-50 bg-slate-950">
        <YouTubeHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          showMobileSearch={showMobileSearch}
          setShowMobileSearch={setShowMobileSearch}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          userName={profile?.first_name || profile?.display_name || user?.email || undefined}
        />

        {/* Category Chips - Offset by sidebar width */}
        <div className={`px-4 py-3 flex gap-3 overflow-x-auto scrollbar-hide border-b border-slate-800/60 transition-all duration-300 bg-slate-950 ${sidebarOpen ? 'ml-0 lg:ml-[240px]' : 'ml-0 lg:ml-[72px]'}`}>
          <button
            onClick={() => { setViewMode('all'); setSelectedCategory('all'); }}
            className={`px-4 h-[34px] rounded-lg text-[14px] font-medium transition-colors whitespace-nowrap flex-shrink-0 ${viewMode === 'all' && selectedCategory === 'all' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
          >
            All
          </button>
          <button
            onClick={() => setViewMode('playlists')}
            className={`px-4 h-[34px] rounded-lg text-[14px] font-medium transition-colors whitespace-nowrap flex-shrink-0 ${viewMode === 'playlists' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
          >
            Playlists
          </button>
          {categories.map((cat: any) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-4 h-[34px] rounded-lg text-[14px] font-medium transition-colors whitespace-nowrap flex-shrink-0 ${selectedCategory === cat.slug ? 'bg-slate-100 text-slate-900 shadow-sm' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
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
            className="fixed inset-0 bg-black/50 z-[100] lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`fixed lg:relative top-0 left-0 h-screen lg:h-auto z-[110] transition-transform duration-300 transform ${sidebarOpen ? 'translate-x-0 w-[240px]' : '-translate-x-full lg:translate-x-0 lg:w-[72px]'}`}>
          <YouTubeSidebar
            sidebarOpen={sidebarOpen}
            viewMode="all"
            selectedCategory={selectedCategory}
            setViewMode={(mode) => setViewMode(mode as any)}
            setSelectedCategory={setSelectedCategory}
            categories={categories}
            onClose={() => setSidebarOpen(false)}
          />
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-950">
          <div className="pt-4 sm:pt-6 pb-24 px-4 sm:px-6 lg:px-8 max-w-[2400px] mx-auto transition-all duration-300">
            {/* Live Stream Section - HQ ONLY */}
            {isHQGroup(currentZone?.id) && viewMode === 'all' && selectedCategory === 'all' && !searchQuery && (
              <div className="w-full max-w-[1280px] mx-auto mb-10 sm:mb-12">
                <LiveStreamPlayer isPreview={true} zoneId={currentZone?.id} />
              </div>
            )}
            {viewMode === 'playlists' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-5 gap-y-12">
                {adminPlaylists.map((playlist) => (
                  <div
                    key={playlist.id}
                    onClick={() => router.push(`/pages/media/playlists/${playlist.id}`)}
                    className="cursor-pointer group flex flex-col"
                  >
                    <div className="relative w-full aspect-video rounded-[20px] sm:rounded-2xl overflow-hidden bg-slate-900 shadow-lg border border-white/5 mb-4">
                      <img
                        src={playlist.thumbnail || '/movie/default-hero.jpeg'}
                        alt={playlist.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      {/* Playlist Overlay */}
                      <div className="absolute inset-0 bg-slate-950/60 flex flex-col items-end justify-center px-4 transition-colors group-hover:bg-slate-900/40">
                        <div className="bg-slate-900/90 backdrop-blur-md px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl flex flex-col items-center min-w-[65px] border border-white/10 shadow-xl">
                          <span className="text-[15px] sm:text-[16px] font-black text-slate-100">{playlist.videoIds?.length || 0}</span>
                          <ListVideo className="w-4 h-4 text-slate-400 mt-1" strokeWidth={2.5} />
                        </div>
                      </div>
                    </div>
                    <div className="px-1.5 pr-8 relative">
                      <h3 className="text-slate-100 text-[15px] sm:text-[17px] font-bold line-clamp-2 leading-tight mb-1.5 group-hover:text-indigo-300 transition-colors tracking-tight">
                        {playlist.name}
                      </h3>
                      <p className="text-[12px] sm:text-[13px] text-slate-500 font-bold uppercase tracking-wider">
                        Official Library
                      </p>
                      
                       <div className="absolute top-0 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                          }}
                          className="p-2 hover:bg-slate-800 rounded-full text-slate-400 transition-colors"
                        >
                          <MoreVertical className="w-5 h-5 text-slate-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {isLoadingPlaylists && adminPlaylists.length === 0 && (
                  <div className="col-span-full py-40 flex flex-col items-center justify-center">
                    <div className="w-10 h-10 border-3 border-white/20 border-t-white rounded-full animate-spin mb-4" />
                    <p className="text-[#aaa] text-base font-medium">Loading playlists...</p>
                  </div>
                )}

                {!isLoadingPlaylists && adminPlaylists.length === 0 && (
                  <div className="col-span-full py-40 text-center">
                    <p className="text-[#aaa] text-xl font-bold">No playlists found</p>
                    <p className="text-[#888] text-sm mt-2">Check back later for curated music playlists.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-16 sm:gap-20">
                {/* Section 1: Recently Added */}
                {filteredMedia.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-[18px] sm:text-[22px] lg:text-2xl font-extrabold text-slate-100 tracking-tight flex items-center gap-3">
                        Recently Added
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-7 gap-x-5 gap-y-12 sm:gap-y-14">
                      {filteredMedia.slice(0, 14).map((video) => (
                        <MediaCard
                          key={video.id}
                          media={video}
                          categoryMap={categoryMap}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Section 2: More to Explore */}
                {filteredMedia.length > 14 && (
                  <section>
                    <div className="flex items-center justify-between mb-8 pt-10 border-t border-slate-800/40">
                      <h2 className="text-[18px] sm:text-[22px] lg:text-2xl font-extrabold text-slate-100 tracking-tight flex items-center gap-3">
                        More to Explore
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                      </h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-7 gap-x-5 gap-y-12 sm:gap-y-14">
                      {filteredMedia.slice(14).map((video) => (
                        <MediaCard
                          key={video.id}
                          media={video}
                          categoryMap={categoryMap}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Loading State & Load More */}
                {(isLoading || hasMore) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-7 gap-x-4 gap-y-12">
                    {isLoading && (
                      <>
                        {[...Array(10)].map((_, i) => (
                          <MediaCardSkeleton key={`skeleton-${i}`} />
                        ))}
                      </>
                    )}
                    
                    {hasMore && (
                      <div id="load-more-sentinel" className="col-span-full h-32 flex items-center justify-center">
                        {isLoadingMore && (
                          <div className="w-12 h-12 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin shadow-lg shadow-indigo-500/10" />
                        )}
                      </div>
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
