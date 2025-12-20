'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Search, Music, Play, Pause, Loader2, ArrowLeft, ArrowUpDown } from 'lucide-react'
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
  const { currentSong, isPlaying } = useAudio()
  
  // Check if user can edit (HQ or Boss zone)
  const isHQ = currentZone ? isHQGroup(currentZone.id) : false
  const isBoss = currentZone ? isBossZone(currentZone.id) : false
  const canEdit = isHQ || isBoss
  
  const [songs, setSongs] = useState<MasterSong[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [selectedSong, setSelectedSong] = useState<MasterSong | null>(null)
  const [isSongDetailOpen, setIsSongDetailOpen] = useState(false)

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

  // Filter and sort songs
  const filteredSongs = useMemo(() => {
    let filtered = songs
    
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
  }, [songs, searchQuery, sortOrder])


  const handleBack = () => {
    router.back()
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

          {/* All Pill and Sort Toggle */}
          <div className="flex items-center justify-between mt-3">
            <button
              className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap bg-purple-600 text-white shadow-md"
            >
              All
            </button>
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
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                      ${hasAudio 
                        ? isCurrentSong 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-gray-100 text-gray-600'
                        : 'bg-gray-50 text-gray-300'
                      }
                    `}>
                      {isCurrentSong && isPlaying ? (
                        <Pause className="w-3.5 h-3.5" />
                      ) : (
                        <Play className="w-3.5 h-3.5 ml-0.5" />
                      )}
                    </div>
                  </div>
                )
              })}
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
