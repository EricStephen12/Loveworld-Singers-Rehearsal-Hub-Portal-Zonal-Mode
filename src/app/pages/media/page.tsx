'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useMedia } from './_context/MediaContext'
import { Play, Search, Home, ListVideo, ArrowLeft, X } from 'lucide-react'
import MediaCard from './_components/MediaCard'

const categories = [
  { id: 'all', label: 'All' },
  { id: 'praise', label: 'Praise' },
  { id: 'worship', label: 'Worship' },
  { id: 'medley', label: 'Medley' },
  { id: 'healing', label: 'Healing' },
  { id: 'gfap', label: 'GFAP' },
  { id: 'live', label: 'Live' },
]

export default function MediaPage() {
  const router = useRouter()
  const { user, profile, isLoading: authLoading } = useAuth()
  const { allMedia, isLoading, isLoadingMore, hasMore, loadMore, refreshMedia } = useMedia()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showMobileSearch, setShowMobileSearch] = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'auto'
    document.documentElement.style.overflow = 'auto'
  }, [])

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

  const filteredMedia = useMemo(() => {
    let filtered = allMedia
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(media => media.type === selectedCategory)
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(media =>
        media.title.toLowerCase().includes(query) ||
        media.description?.toLowerCase().includes(query)
      )
    }
    return filtered
  }, [allMedia, selectedCategory, searchQuery])

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
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                selectedCategory === cat.id 
                  ? 'bg-white text-black' 
                  : 'bg-[#272727] text-white hover:bg-[#3f3f3f]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Video Grid */}
      <div className="p-4 pb-6">
          {isLoading ? (
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
          ) : filteredMedia.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredMedia.map((media) => (
                  <MediaCard key={media.id} media={media} />
                ))}
              </div>
              
              {/* Load More */}
              {hasMore && !searchQuery && selectedCategory === 'all' && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={loadMore}
                    disabled={isLoadingMore}
                    className="px-6 py-3 bg-[#272727] hover:bg-[#3f3f3f] text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isLoadingMore ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Load More'
                    )}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 bg-[#272727] rounded-full flex items-center justify-center mb-4">
                <Search className="w-10 h-10 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium mb-2">No videos found</h3>
              <p className="text-gray-400 text-sm text-center px-4">
                {searchQuery ? 'Try different keywords' : 'No media available yet'}
              </p>
            </div>
          )}
      </div>
    </div>
  )
}
