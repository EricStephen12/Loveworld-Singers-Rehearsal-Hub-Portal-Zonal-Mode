'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Search, Music, Play, Pause, Loader2, ArrowLeft, ArrowUpDown, ChevronDown, Filter } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { MasterLibraryService, MasterSong } from '@/lib/master-library-service'
import { useAudio } from '@/contexts/AudioContext'
import { MasterSongDetailSheet } from '@/components/admin/MasterSongDetailSheet'
import ScreenHeader from '@/components/ScreenHeader'
import { useZone } from '@/hooks/useZone'
import { isHQGroup, isBossZone } from '@/config/zones'

export default function AllMinisteredSongsPage() {
  const router = useRouter()
  const { currentZone } = useZone()
  const { currentSong, isPlaying, setCurrentSong, togglePlayPause } = useAudio()
  
  // Check if user can edit (HQ or Boss zone)
  const isHQ = currentZone ? isHQGroup(currentZone.id) : false
  const isBoss = currentZone ? isBossZone(currentZone.id) : false
  const canEdit = isHQ || isBoss
  
  const [songs, setSongs] = useState<MasterSong[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLeadSinger, setSelectedLeadSinger] = useState<string>('')
  const [isLeadSingerDropdownOpen, setIsLeadSingerDropdownOpen] = useState(false)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [selectedSong, setSelectedSong] = useState<MasterSong | null>(null)
  const [isSongDetailOpen, setIsSongDetailOpen] = useState(false)

  // Load songs from Master Library
  useEffect(() => {
    const loadSongs = async () => {
      setLoading(true)
      try {
        const masterSongs = await MasterLibraryService.getMasterSongs(500) // Load 500 initially
        setSongs(masterSongs)
        setHasMore(MasterLibraryService.hasMoreMasterSongs())
      } catch (error) {
        console.error('Error loading master songs:', error)
      } finally {
        setLoading(false)
      }
    }
    loadSongs()
  }, [])

  // Load more songs
  const loadMoreSongs = async () => {
    if (loadingMore || !hasMore) return
    
    setLoadingMore(true)
    try {
      const moreSongs = await MasterLibraryService.loadMoreMasterSongs(500)
      if (moreSongs.length > 0) {
        setSongs(prev => [...prev, ...moreSongs])
      }
      setHasMore(MasterLibraryService.hasMoreMasterSongs())
    } catch (error) {
      console.error('Error loading more songs:', error)
    } finally {
      setLoadingMore(false)
    }
  }

  // Normalize name: remove trailing punctuation and trim
  const normalizeName = (name: string): string => {
    return name
      .trim()
      .replace(/[.,;:!?]+$/, '') // Remove trailing punctuation
      .trim()
  }

  // Get unique lead singers with normalization (handle case differences, duplicates, and punctuation)
  const leadSingers = useMemo(() => {
    // Map: normalized (lowercase, no punctuation) -> canonical name (first occurrence with proper case)
    const normalizedMap = new Map<string, string>()
    
    songs.forEach(song => {
      const singer = song.leadSinger?.trim()
      if (!singer) return
      
      // Normalize: lowercase, remove trailing punctuation
      const cleaned = normalizeName(singer)
      const normalized = cleaned.toLowerCase()
      
      // Check if this is a duet (contains "and" or "&")
      const isDuet = normalized.includes(' and ') || normalized.includes(' & ')
      
      if (isDuet) {
        // Duets: normalize case and punctuation, but keep separate from single names
        if (!normalizedMap.has(normalized)) {
          // Use cleaned version (no trailing punctuation) as canonical
          normalizedMap.set(normalized, cleaned)
        }
      } else {
        // Single names: normalize case-insensitively and remove trailing punctuation
        // First occurrence becomes the canonical version
        if (!normalizedMap.has(normalized)) {
          normalizedMap.set(normalized, cleaned)
        }
      }
    })
    
    // Return unique canonical names, sorted alphabetically
    return Array.from(normalizedMap.values()).sort()
  }, [songs])

  // Filter and sort songs
  const filteredSongs = useMemo(() => {
    let filtered = songs
    
    // Filter by lead singer (case-insensitive, handles duplicates and punctuation)
    if (selectedLeadSinger) {
      filtered = filtered.filter(song => {
        const singer = song.leadSinger?.trim()
        if (!singer) return false
        
        // Normalize both the song's singer and the selected filter
        const normalizedSinger = normalizeName(singer).toLowerCase()
        const normalizedFilter = normalizeName(selectedLeadSinger).toLowerCase()
        
        // Match case-insensitively and ignore trailing punctuation
        return normalizedSinger === normalizedFilter
      })
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
    
    // Sort alphabetically by title
    filtered = [...filtered].sort((a, b) => {
      const titleA = (a.title || '').toLowerCase()
      const titleB = (b.title || '').toLowerCase()
      return sortOrder === 'asc' 
        ? titleA.localeCompare(titleB)
        : titleB.localeCompare(titleA)
    })
    
    return filtered
  }, [songs, searchQuery, selectedLeadSinger, sortOrder])


  const handleBack = () => {
    router.back()
  }

  const handlePlayClick = (e: React.MouseEvent, song: MasterSong) => {
    e.stopPropagation()
    const audioUrl = song.audioUrls?.full || song.audioFile
    if (!audioUrl) return
    
    if (currentSong?.id === song.id) {
      togglePlayPause()
    } else {
      const audioSong = {
        id: song.id,
        title: song.title,
        audioFile: audioUrl,
        writer: song.writer,
        leadSinger: song.leadSinger,
      }
      setCurrentSong(audioSong as any, true)
    }
  }

  const handleSongClick = (song: MasterSong) => {
    setSelectedSong(song)
    setIsSongDetailOpen(true)
    window.dispatchEvent(new CustomEvent('songDetailOpen'))
  }

  const handleCloseSongDetail = () => {
    setIsSongDetailOpen(false)
    setSelectedSong(null)
    window.dispatchEvent(new CustomEvent('songDetailClose'))
  }

  // Handle song update from edit
  const handleSongUpdated = (updatedSong: MasterSong) => {
    setSongs(prev => prev.map(s => s.id === updatedSong.id ? updatedSong : s))
    setSelectedSong(updatedSong)
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-gray-50 via-white to-slate-50">
      <div className="h-full flex flex-col">
        <ScreenHeader 
          title="All Ministered Songs" 
          showMenuButton={false}
          leftButtons={
            <button
              onClick={handleBack}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
          }
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

          {/* Filters and Sort */}
          <div className="flex items-center gap-2 mt-3">
            {/* Lead Singer Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsLeadSingerDropdownOpen(!isLeadSingerDropdownOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedLeadSinger
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>{selectedLeadSinger || 'Lead Singer'}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isLeadSingerDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Dropdown Menu */}
              {isLeadSingerDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsLeadSingerDropdownOpen(false)}
                  />
                  <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 z-20 min-w-[200px] max-h-[300px] overflow-y-auto">
                    <button
                      onClick={() => {
                        setSelectedLeadSinger('')
                        setIsLeadSingerDropdownOpen(false)
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        !selectedLeadSinger
                          ? 'bg-purple-50 text-purple-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      All Lead Singers
                    </button>
                    {leadSingers.map((singer) => (
                      <button
                        key={singer}
                        onClick={() => {
                          setSelectedLeadSinger(singer)
                          setIsLeadSingerDropdownOpen(false)
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors border-t border-gray-100 ${
                          selectedLeadSinger === singer
                            ? 'bg-purple-50 text-purple-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {singer}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            
            <div className="flex-1" />
            
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <ArrowUpDown className="w-4 h-4" />
              {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
            </button>
          </div>
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
            <div className="space-y-2">
              {filteredSongs.map((song) => {
                const isCurrentSong = currentSong?.id === song.id
                const hasAudio = song.audioUrls?.full || song.audioFile
                
                return (
                  <div
                    key={song.id}
                    onClick={() => handleSongClick(song)}
                    className={`
                      flex items-center gap-3 bg-white rounded-xl px-3 py-2.5 border transition-all cursor-pointer
                      hover:bg-gray-50 active:scale-[0.99]
                      ${isCurrentSong ? 'border-purple-400 bg-purple-50/50' : 'border-gray-100'}
                    `}
                  >
                    {/* Compact Icon */}
                    <div className={`
                      w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                      ${isCurrentSong 
                        ? 'bg-purple-600' 
                        : 'bg-gradient-to-br from-violet-500 to-purple-600'
                      }
                    `}>
                      {isCurrentSong && isPlaying ? (
                        <div className="flex gap-0.5">
                          {[1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className="w-0.5 bg-white rounded-full animate-pulse"
                              style={{ height: `${8 + i * 3}px`, animationDelay: `${i * 0.1}s` }}
                            />
                          ))}
                        </div>
                      ) : (
                        <Music className="w-4 h-4 text-white" />
                      )}
                    </div>

                    {/* Song Info - Compact */}
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium text-sm truncate ${isCurrentSong ? 'text-purple-700' : 'text-gray-900'}`}>
                        {song.title}
                      </h3>
                      <p className="text-xs text-gray-500 truncate">
                        {song.writer || 'Unknown writer'}
                        {song.key && ` • ${song.key}`}
                      </p>
                    </div>

                    {/* Play Button */}
                    <button
                      onClick={(e) => handlePlayClick(e, song)}
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                        ${hasAudio 
                          ? isCurrentSong 
                            ? 'bg-purple-600 text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                        }
                      `}
                      disabled={!hasAudio}
                    >
                      {isCurrentSong && isPlaying ? (
                        <Pause className="w-3.5 h-3.5" />
                      ) : (
                        <Play className="w-3.5 h-3.5 ml-0.5" />
                      )}
                    </button>
                  </div>
                )
              })}
              
              {/* Load More Button */}
              {hasMore && !searchQuery && !selectedLeadSinger && (
                <div className="pt-4 pb-2">
                  <button
                    onClick={loadMoreSongs}
                    disabled={loadingMore}
                    className="w-full py-3 bg-purple-50 text-purple-600 font-medium rounded-xl hover:bg-purple-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading more songs...
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4" />
                        Load More Songs
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Song Detail Sheet */}
      {selectedSong && (
        <MasterSongDetailSheet
          song={selectedSong}
          isOpen={isSongDetailOpen}
          onClose={handleCloseSongDetail}
          canEdit={canEdit}
          onSongUpdated={handleSongUpdated}
        />
      )}
    </div>
  )
}
