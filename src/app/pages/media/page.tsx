'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useMedia } from './_context/MediaContext'
import { Play, Search, Menu, Bell, Home, Compass, PlaySquare, Clock, ThumbsUp, History, Flame, Music2, Grid3X3, ArrowLeft, X } from 'lucide-react'
import MediaCard from './_components/MediaCard'

const categories = [
  { id: 'all', label: 'All' },
  { id: 'praise', label: 'Praise' },
  { id: 'medley', label: 'Medley' },
  { id: 'healing', label: 'Healing' },
  { id: 'gfap', label: 'GFAP' },
  { id: 'live', label: 'Live' },
  { id: 'worship', label: 'Worship' },
  { id: 'recent', label: 'Recent' },
  { id: 'watched', label: 'Watched' },
  { id: 'new', label: 'New' },
]

export default function MediaPage() {
  const router = useRouter()
  const { user, profile, isLoading: authLoading } = useAuth()
  const { allMedia, isLoading } = useMedia()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = 'auto'
    document.documentElement.style.overflow = 'auto'
  }, [])

  // Only show loading if auth is loading AND no cached profile
  if (authLoading && !profile) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-700 border-t-red-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // If we have cached profile, show content even if user is still loading
  // This prevents blank screen on revisits
  if (!user && !profile) return null

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
    <div className="min-h-screen bg-[#0f0f0f] text-white overflow-hidden">
      {/* Mobile Sidebar Drawer */}
      <aside className={`fixed left-0 top-0 bottom-0 w-64 bg-[#0f0f0f] z-[60] transform transition-transform duration-300 ease-out md:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <Play className="w-5 h-5" fill="white" />
            </div>
            <span className="text-lg font-semibold">LWS Media</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-white/10 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="py-3 px-2">
          {[
            { icon: Home, label: 'Home', onClick: () => router.push('/home') },
            { icon: Compass, label: 'Explore' },
            { icon: PlaySquare, label: 'Shorts' },
            { icon: History, label: 'History' },
            { icon: Clock, label: 'Watch later' },
            { icon: ThumbsUp, label: 'Liked videos' },
            { icon: Flame, label: 'Trending' },
            { icon: Music2, label: 'Music' },
          ].map((item) => (
            <button 
              key={item.label} 
              onClick={() => {
                item.onClick?.()
                setSidebarOpen(false)
              }}
              className="flex items-center gap-4 px-3 py-2.5 hover:bg-white/10 rounded-lg w-full text-left"
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-[72px] bg-[#0f0f0f] z-40 border-r border-white/10">
        <div className="p-3 border-b border-white/10">
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center mx-auto cursor-pointer" onClick={() => router.push('/home')}>
            <Play className="w-5 h-5" fill="white" />
          </div>
        </div>
        <nav className="py-3 flex flex-col items-center gap-1">
          {[
            { icon: Home, label: 'Home', onClick: () => router.push('/home') },
            { icon: Compass, label: 'Explore' },
            { icon: PlaySquare, label: 'Shorts' },
            { icon: Grid3X3, label: 'Library' },
          ].map((item) => (
            <button 
              key={item.label}
              onClick={item.onClick}
              className="flex flex-col items-center gap-1 p-2 hover:bg-white/10 rounded-lg w-full"
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px]">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content with Apple-style reveal effect */}
      <div 
        className={`min-h-screen transition-all duration-300 ease-out md:ml-[72px] ${sidebarOpen ? 'translate-x-64 scale-[0.88] rounded-2xl shadow-2xl origin-left overflow-hidden' : 'translate-x-0 scale-100'} md:translate-x-0 md:scale-100 md:rounded-none md:shadow-none`}
        onClick={() => sidebarOpen && setSidebarOpen(false)}
      >
        {/* Header */}
        <header className="sticky top-0 z-50 bg-[#0f0f0f] h-12 sm:h-14 flex items-center justify-between px-2 sm:px-4 border-b border-white/10">
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={(e) => { e.stopPropagation(); setSidebarOpen(true); }} className="p-1.5 sm:p-2 hover:bg-white/10 rounded-full md:hidden">
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <div className="flex items-center gap-1 cursor-pointer" onClick={() => router.push('/home')}>
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <Play className="w-4 h-4 sm:w-5 sm:h-5" fill="white" />
              </div>
              <span className="text-base sm:text-lg font-semibold hidden sm:block">LWS Media</span>
            </div>
          </div>

          {/* Search */}
          <div className={`${showMobileSearch ? 'flex absolute inset-x-0 top-0 h-12 sm:h-14 bg-[#0f0f0f] px-2 z-50 items-center' : 'hidden'} md:flex flex-1 max-w-xl mx-2 sm:mx-4 items-center`}>
            {showMobileSearch && (
              <button onClick={() => setShowMobileSearch(false)} className="p-2 mr-1">
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="flex flex-1">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-[#121212] border border-[#303030] rounded-l-full px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              <button className="px-3 sm:px-5 bg-[#222222] border border-l-0 border-[#303030] rounded-r-full hover:bg-[#303030]">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            <button onClick={() => setShowMobileSearch(true)} className="p-1.5 sm:p-2 hover:bg-white/10 rounded-full md:hidden">
              <Search className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-full hidden sm:flex">
              <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-purple-600 flex items-center justify-center text-xs sm:text-sm font-medium ml-1">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        </header>


        {/* Category Pills */}
        <div className="sticky top-12 sm:top-14 z-30 bg-[#0f0f0f] border-b border-white/10">
          <div className="flex gap-2 px-2 sm:px-4 py-2 sm:py-3 overflow-x-auto scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id ? 'bg-white text-black' : 'bg-[#272727] text-white hover:bg-[#3f3f3f]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Video Grid */}
        <div className="p-2 sm:p-4 pb-20 md:pb-6">
          {isLoading ? (
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="w-full aspect-video bg-[#272727] rounded-lg sm:rounded-xl mb-2 sm:mb-3" />
                  <div className="flex gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#272727] flex-shrink-0" />
                    <div className="flex-1">
                      <div className="h-3 sm:h-4 bg-[#272727] rounded mb-1.5 sm:mb-2" />
                      <div className="h-2.5 sm:h-3 bg-[#272727] rounded w-3/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredMedia.length > 0 ? (
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {filteredMedia.map((media) => (
                <MediaCard key={media.id} media={media} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 sm:py-20">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#272727] rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <Search className="w-8 h-8 sm:w-10 sm:h-10 text-gray-500" />
              </div>
              <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2">No videos found</h3>
              <p className="text-gray-400 text-xs sm:text-sm text-center px-4">
                {searchQuery ? 'Try different keywords' : 'No media available'}
              </p>
            </div>
          )}
        </div>

        {/* Mobile Bottom Nav */}
        <nav className="fixed bottom-0 left-0 right-0 bg-[#0f0f0f] border-t border-white/10 md:hidden z-50 pb-safe">
          <div className="flex justify-around py-1.5 sm:py-2">
            {[
              { icon: Home, label: 'Home', active: true },
              { icon: Compass, label: 'Explore' },
              { icon: PlaySquare, label: 'Shorts' },
              { icon: Grid3X3, label: 'Library' },
            ].map((item) => (
              <button key={item.label} className="flex flex-col items-center gap-0.5 px-3 py-1">
                <item.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${item.active ? 'text-white' : 'text-gray-400'}`} />
                <span className={`text-[9px] sm:text-[10px] ${item.active ? 'text-white' : 'text-gray-400'}`}>{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  )
}
