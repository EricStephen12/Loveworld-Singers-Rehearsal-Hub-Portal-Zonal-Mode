'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Search, Music, Play, Pause, User, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { MasterLibraryService, MasterSong } from '@/lib/master-library-service'
import { useAudio } from '@/contexts/AudioContext'
import SongDetailModal from '@/components/SongDetailModal'
import type { PraiseNightSong } from '@/types/supabase'
import ScreenHeader from '@/components/ScreenHeader'
import SharedDrawer from '@/components/SharedDrawer'
import { getMenuItems } from '@/config/menuItems'
import { useAuth } from '@/hooks/useAuth'
import { handleAppRefresh } from '@/utils/refresh-utils'

export default function AllMinisteredSongsPage() {
  const router = useRouter()
  const { signOut } = useAuth()
  const { currentSong, isPlaying, setCurrentSong } = useAudio()
  
  const [songs, setSongs] = useState<MasterSong[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [selectedSong, setSelectedSong] = useState<any>(null)
  const [isSongDetailOpen, setIsSongDetailOpen] = useState(false)
  const [selectedSongIndex, setSelectedSongIndex] = useState<number>(0)

  // Load songs from Master Library
  useEffect(() => {
    const loadSongs = async () => {
      setLoading(true)
      try {
        const masterSongs = await MasterLibraryService.getMasterSongs()
        setSongs(masterSongs)
      } catch (error) {
        console.error('Error loading master songs:', error)
      } finally {
        setLoading(false)
      }
    }
    loadSongs()
  }, [])

  // Get unique categories from songs
  const categories = useMemo(() => {
    const cats = new Set<string>()
    songs.forEach(song => {
      if (song.category?.trim()) {
        cats.add(song.category.trim())
      }
    })
    return ['all', ...Array.from(cats).sort()]
  }, [songs])

  // Filter songs by search query and category
  const filteredSongs = useMemo(() => {
    let filtered = songs
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(song => song.category === selectedCategory)
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(song =>
        song.title?.toLowerCase().includes(query) ||
        song.writer?.toLowerCase().includes(query) ||
        song.leadSinger?.toLowerCase().includes(query) ||
        song.category?.toLowerCase().includes(query)
      )
    }
    
    return filtered
  }, [songs, searchQuery, selectedCategory])


  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleRefresh = handleAppRefresh
  const menuItems = getMenuItems(handleLogout, handleRefresh)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  // Convert MasterSong to PraiseNightSong format
  const convertToSongFormat = (song: MasterSong): PraiseNightSong => ({
    id: song.id,
    title: song.title,
    lyrics: song.lyrics || '',
    solfas: song.solfa || '',
    key: song.key || '',
    tempo: song.tempo || '',
    writer: song.writer || '',
    leadSinger: song.leadSinger || '',
    category: song.category || '',
    audioFile: song.audioUrls?.full || song.audioFile || '',
    status: 'heard',
    praiseNightId: '',
    comments: [],
    history: []
  })

  const handleSongClick = (song: MasterSong, index: number) => {
    setSelectedSongIndex(index)
    const songForModal = convertToSongFormat(song)
    setSelectedSong(songForModal)
    setIsSongDetailOpen(true)
    
    if (currentSong?.id !== song.id) {
      setCurrentSong(songForModal, false)
    }
    window.dispatchEvent(new CustomEvent('songDetailOpen'))
  }

  const handleCloseSongDetail = () => {
    setIsSongDetailOpen(false)
    setSelectedSong(null)
    window.dispatchEvent(new CustomEvent('songDetailClose'))
  }

  // Get image for song based on index
  const getSongImage = (index: number) => {
    const images = [
      "/images/DSC_6155_scaled.jpg",
      "/images/DSC_6303_scaled.jpg",
      "/images/DSC_6446_scaled.jpg",
      "/images/DSC_6506_scaled.jpg",
      "/images/DSC_6516_scaled.jpg",
      "/images/DSC_6636_1_scaled.jpg",
      "/images/DSC_6638_scaled.jpg",
      "/images/DSC_6644_scaled.jpg",
      "/images/DSC_6658_1_scaled.jpg",
      "/images/DSC_6676_scaled.jpg"
    ]
    return images[index % images.length]
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-gray-50 via-white to-slate-50">
      <div 
        className={`
          h-full flex flex-col transition-all duration-300 ease-out
          ${isMenuOpen ? 'translate-x-72 scale-[0.88] rounded-2xl shadow-2xl origin-left overflow-hidden' : 'translate-x-0 scale-100 rounded-none'}
        `}
        onClick={() => isMenuOpen && setIsMenuOpen(false)}
      >
        <ScreenHeader 
          title="All Ministered Songs" 
          onMenuClick={toggleMenu}
          rightImageSrc="/logo.png"
          onTitleClick={() => router.push('/home')}
        />

        {/* Search */}
        <div className="px-4 py-3 bg-white/80 backdrop-blur-sm border-b border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-lg font-semibold text-gray-900">
              {filteredSongs.length} song{filteredSongs.length !== 1 ? 's' : ''}
            </h2>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by title, writer, or lead singer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200 rounded-xl"
            />
          </div>

          {/* Category Pills */}
          {categories.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`
                    px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
                    ${selectedCategory === category
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                >
                  {category === 'all' ? 'All' : category}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Songs List */}
        <div className="flex-1 overflow-y-auto px-4 py-4 pb-24">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-3" />
              <p className="text-gray-500">Loading songs...</p>
            </div>
          ) : filteredSongs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Music className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                {searchQuery ? 'No songs found' : 'No songs available'}
              </h3>
              <p className="text-sm text-gray-400 text-center max-w-xs">
                {searchQuery 
                  ? 'Try a different search term'
                  : 'Check back later for new songs'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSongs.map((song, index) => {
                const isCurrentSong = currentSong?.id === song.id
                const hasAudio = song.audioUrls?.full || song.audioFile
                
                return (
                  <div
                    key={song.id}
                    onClick={() => handleSongClick(song, index)}
                    className={`
                      bg-white rounded-2xl p-4 shadow-sm border transition-all duration-200 cursor-pointer
                      hover:shadow-md hover:scale-[1.01] active:scale-[0.99]
                      ${isCurrentSong ? 'border-purple-400 ring-2 ring-purple-100' : 'border-gray-100'}
                    `}
                  >
                    <div className="flex items-center gap-4">
                      {/* Song Image */}
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-purple-100 to-pink-100">
                        <img
                          src={getSongImage(index)}
                          alt={song.title}
                          className="w-full h-full object-cover"
                        />
                        {isCurrentSong && isPlaying && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <div className="flex gap-0.5">
                              {[1, 2, 3].map((i) => (
                                <div
                                  key={i}
                                  className="w-1 bg-white rounded-full animate-pulse"
                                  style={{
                                    height: `${12 + Math.random() * 8}px`,
                                    animationDelay: `${i * 0.1}s`
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Song Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold text-sm truncate ${isCurrentSong ? 'text-purple-700' : 'text-gray-900'}`}>
                          {song.title}
                        </h3>
                        {song.leadSinger && (
                          <p className="text-xs text-gray-500 truncate flex items-center gap-1 mt-0.5">
                            <User className="w-3 h-3" />
                            {song.leadSinger}
                          </p>
                        )}
                        {song.writer && (
                          <p className="text-xs text-gray-400 truncate mt-0.5">
                            Written by {song.writer}
                          </p>
                        )}
                      </div>

                      {/* Play Indicator */}
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                        ${hasAudio 
                          ? isCurrentSong 
                            ? 'bg-purple-600 text-white' 
                            : 'bg-purple-100 text-purple-600'
                          : 'bg-gray-100 text-gray-400'
                        }
                      `}>
                        {isCurrentSong && isPlaying ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4 ml-0.5" />
                        )}
                      </div>
                    </div>

                    {/* Category Badge */}
                    {song.category && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="px-2 py-1 bg-purple-50 text-purple-600 text-xs rounded-full">
                          {song.category}
                        </span>
                        {song.importCount > 0 && (
                          <span className="text-xs text-gray-400">
                            Imported {song.importCount} time{song.importCount !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Menu Drawer */}
      <SharedDrawer open={isMenuOpen} onClose={toggleMenu} title="Menu" items={menuItems as any} />

      {/* Song Detail Modal */}
      {selectedSong && (
        <SongDetailModal
          selectedSong={selectedSong}
          isOpen={isSongDetailOpen}
          onClose={handleCloseSongDetail}
          songs={filteredSongs.map(convertToSongFormat)}
          onSongChange={(song: PraiseNightSong) => {
            setSelectedSong(song)
            const idx = filteredSongs.findIndex(s => s.id === song.id)
            if (idx >= 0) setSelectedSongIndex(idx)
          }}
        />
      )}
    </div>
  )
}
