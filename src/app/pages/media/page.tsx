'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useMedia } from './_context/MediaContext'
import { Play, Search, Filter } from 'lucide-react'
import MediaNav from './_components/MediaNav'
import MediaCard from './_components/MediaCard'
import YouTubeThumbnail from '@/components/YouTubeThumbnail'
import { isYouTubeUrl } from '@/utils/youtube'

export default function MediaPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { allMedia, featuredMedia, isLoading } = useMedia()
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'praise' | 'medley' | 'healing' | 'gfap'>('all')

  useEffect(() => {
    // Enable scrolling for this page
    document.body.style.overflow = 'auto'
    document.documentElement.style.overflow = 'auto'
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      // Reset overflow on unmount if needed
      // document.body.style.overflow = ''
      // document.documentElement.style.overflow = ''
    }
  }, [])

  // Don't show anything if no user - prevents redirect
  if (!user) return null

  // Filter and search media
  const filteredMedia = useMemo(() => {
    let filtered = allMedia

    // Filter by type
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(media => media.type === selectedFilter)
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(media => 
        media.title.toLowerCase().includes(query) ||
        media.description.toLowerCase().includes(query) ||
        media.genre.some(g => g.toLowerCase().includes(query))
      )
    }

    return filtered
  }, [allMedia, selectedFilter, searchQuery])

  const heroMedia = featuredMedia[0] || allMedia[0]
  const isHeroYouTube =
    heroMedia?.isYouTube ||
    isYouTubeUrl(heroMedia?.youtubeUrl || '') ||
    isYouTubeUrl(heroMedia?.videoUrl || '') ||
    isYouTubeUrl(heroMedia?.thumbnail || '')

  return (
    <div 
      className="bg-[#0f0f0f] text-white" 
      style={{ 
        minHeight: '100vh', 
        position: 'relative',
        zIndex: 1
      }}
    >
      {/* Navigation */}
      <MediaNav isScrolled={isScrolled} />

      {/* Hero Banner - Optional, can be removed for more YouTube-like feel */}
      {heroMedia && !searchQuery && (
        <div className="relative h-[60vh] mt-16 mb-8">
          <div className="absolute inset-0">
            {isHeroYouTube ? (
              <YouTubeThumbnail
                url={heroMedia.youtubeUrl || heroMedia.videoUrl || heroMedia.backdropImage || heroMedia.thumbnail || ''}
                alt="Hero"
                className="w-full h-full object-cover"
                fallbackSrc="/movie/default-hero.jpeg"
              />
            ) : (
              <img
                src={heroMedia.backdropImage || heroMedia.thumbnail || '/movie/default-hero.jpeg'}
                alt="Hero"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/movie/default-hero.jpeg'
                }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/80 to-transparent" />
          </div>

          <div className="relative z-10 h-full flex items-end p-8 md:p-12">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-bold mb-4 line-clamp-2">
                {heroMedia.title}
              </h1>
              <p className="text-gray-300 text-lg mb-6 line-clamp-2">
                {heroMedia.description || 'Experience the power of worship'}
              </p>
              <button
                onClick={() => router.push(`/pages/media/player/${heroMedia.id}`)}
                className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-semibold hover:bg-gray-200 transition-colors"
              >
                <Play className="w-5 h-5" fill="currentColor" />
                Play
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="px-4 md:px-8 lg:px-12 pb-8">
        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 sticky top-16 z-30 bg-[#0f0f0f] py-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#272727] border border-[#3f3f3f] rounded-full pl-10 pr-4 py-2.5 text-white placeholder-gray-400 focus:outline-none focus:border-white/50 transition-colors"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {(['all', 'praise', 'medley', 'healing', 'gfap'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedFilter === filter
                    ? 'bg-white text-black'
                    : 'bg-[#272727] text-white hover:bg-[#3f3f3f]'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        {searchQuery && (
          <div className="mb-4 text-gray-400 text-sm">
            {filteredMedia.length} {filteredMedia.length === 1 ? 'result' : 'results'} found
          </div>
        )}

        {/* Media Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="w-full aspect-video bg-[#272727] rounded-xl mb-3"></div>
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#272727]"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-[#272727] rounded mb-2"></div>
                    <div className="h-3 bg-[#272727] rounded w-3/4"></div>
                    <div className="h-3 bg-[#272727] rounded w-1/2 mt-2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredMedia.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-8">
            {filteredMedia.map((media) => (
              <MediaCard key={media.id} media={media} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 bg-[#272727] rounded-full flex items-center justify-center mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No videos found</h3>
            <p className="text-gray-400 text-sm">
              {searchQuery ? 'Try different keywords or filters' : 'No media available'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
