'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Mic, Music, Loader2, RefreshCw } from 'lucide-react';
import { useAudioLab } from '../_context/AudioLabContext';
import { getSongs, toLeagcySong } from '../_lib/song-service';
import { useZone } from '@/hooks/useZone';
import { CollapsibleSongCard } from './CollapsibleSongCard';
import type { Song, VocalPart } from '../_types';

export function LibraryView() {
  const { 
    playSong, 
    state, 
    pause, 
    seek, 
    switchPart 
  } = useAudioLab();
  const { currentZone } = useZone();
  
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Accordion state - only one song expanded at a time
  const [expandedSongId, setExpandedSongId] = useState<string | null>(null);
  
  // Local playback state for inline controls
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);
  const [playingPart, setPlayingPart] = useState<VocalPart | null>(null);

  // Get playback state from context
  const { currentTime, duration, isPlaying } = state.player;
  const currentSong = state.player.currentSong;

  // Fetch songs on mount and when zone changes
  useEffect(() => {
    loadSongs();
  }, [currentZone?.id]);

  // Sync local playback state with context
  useEffect(() => {
    if (currentSong && isPlaying) {
      setPlayingSongId(currentSong.id);
      setPlayingPart(state.player.currentPart);
    } else if (!isPlaying) {
      // Keep the song ID but update playing state
    }
  }, [currentSong, isPlaying, state.player.currentPart]);

  const loadSongs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const audioLabSongs = await getSongs(currentZone?.id);
      const legacySongs = audioLabSongs.map(toLeagcySong);
      setSongs(legacySongs);
      
      console.log('[LibraryView] Loaded', legacySongs.length, 'songs from Master Library');
    } catch (err) {
      console.error('[LibraryView] Error loading songs:', err);
      setError('Failed to load songs from Master Library');
      setSongs([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter songs based on search only
  const filteredSongs = useMemo(() => {
    let result = songs;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(song => 
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query) ||
        song.genre?.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [songs, searchQuery]);

  // Handle expand/collapse with accordion behavior
  const handleToggleExpand = useCallback((songId: string) => {
    setExpandedSongId(prev => {
      // If collapsing the currently playing song, stop playback
      if (prev === songId && playingSongId === songId) {
        pause();
        setPlayingSongId(null);
        setPlayingPart(null);
      }
      return prev === songId ? null : songId;
    });
  }, [playingSongId, pause]);

  // Handle Play All (full mix)
  const handlePlayAll = useCallback(async (song: Song) => {
    await playSong(song);
    setPlayingSongId(song.id);
    setPlayingPart('full');
  }, [playSong]);

  // Handle individual part playback
  const handlePlayPart = useCallback(async (song: Song, part: VocalPart) => {
    // If same song, just switch part
    if (playingSongId === song.id && currentSong?.id === song.id) {
      await switchPart(part);
      setPlayingPart(part);
    } else {
      // Load new song then switch part
      await playSong(song);
      await switchPart(part);
      setPlayingSongId(song.id);
      setPlayingPart(part);
    }
  }, [playingSongId, currentSong, playSong, switchPart]);

  // Handle pause
  const handlePause = useCallback(() => {
    pause();
  }, [pause]);

  // Handle seek
  const handleSeek = useCallback((time: number) => {
    seek(time);
  }, [seek]);

  return (
    <div className="flex flex-col pb-24">
      {/* Decorative Background Glow */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-violet-500/10 via-transparent to-transparent pointer-events-none z-0" />

      <main className="relative z-10 flex flex-col gap-4 sm:gap-6 px-3 sm:px-4 pt-4 sm:pt-6">
        {/* Headline */}
        <div className="flex flex-col gap-1.5 sm:gap-2 mb-2">
          <div className="flex items-center justify-between">
            <h1 className="text-white text-2xl sm:text-[28px] font-bold leading-tight tracking-tight">
              Library
            </h1>
            <div className="w-10"></div>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm">
            Tap a song to see vocal parts
          </p>
        </div>

        {/* Search Bar */}
        <div className="pt-1 pb-2 sticky top-0 z-10 bg-[#191022]">
          <label className="flex w-full items-center gap-2 rounded-xl bg-[#261933] px-3 sm:px-4 py-2.5 sm:py-3 shadow-sm border border-white/5 focus-within:ring-2 focus-within:ring-violet-500/50 transition-all">
            <Search size={18} className="sm:w-5 sm:h-5 text-slate-500" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none p-0 text-sm sm:text-base text-white placeholder:text-slate-400 focus:ring-0 focus:outline-none"
              placeholder="Search titles, artists..."
            />
            <button className="text-slate-400 hover:text-violet-400 transition-colors touch-manipulation">
              <Mic size={18} className="sm:w-5 sm:h-5" />
            </button>
          </label>
        </div>

        {/* Refresh Button & Count */}
        <div className="flex items-center gap-1.5 sm:gap-2 py-1">
          <button 
            onClick={loadSongs}
            disabled={isLoading}
            className="flex shrink-0 h-8 sm:h-9 w-8 sm:w-9 items-center justify-center rounded-lg bg-[#261933] border border-white/10 text-slate-300 hover:text-white hover:border-violet-500/50 transition-colors disabled:opacity-50 touch-manipulation"
          >
            {isLoading ? (
              <Loader2 size={18} className="sm:w-5 sm:h-5 animate-spin" />
            ) : (
              <RefreshCw size={18} className="sm:w-5 sm:h-5" />
            )}
          </button>
          <span className="text-slate-400 text-xs sm:text-sm">
            {filteredSongs.length} songs
          </span>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={32} className="animate-spin text-violet-500" />
              <p className="text-slate-400 text-sm">Loading songs...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredSongs.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-16 px-6">
            <Music size={48} className="text-slate-600 mb-4" />
            <p className="text-slate-400 text-sm text-center mb-4">
              {searchQuery ? 'No songs match your search' : 'Songs coming soon'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-violet-400 text-sm font-medium"
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {/* Song List with Collapsible Cards */}
        {!isLoading && filteredSongs.length > 0 && (
          <div className="flex-1 flex flex-col gap-2">
            {filteredSongs.map((song) => {
              const isThisSongPlaying = playingSongId === song.id && isPlaying;
              const isThisSongExpanded = expandedSongId === song.id;
              
              return (
                <CollapsibleSongCard
                  key={song.id}
                  song={song}
                  isExpanded={isThisSongExpanded}
                  isPlaying={isThisSongPlaying}
                  currentPart={isThisSongPlaying ? playingPart : null}
                  currentTime={isThisSongPlaying ? currentTime : 0}
                  duration={isThisSongPlaying ? duration : song.duration}
                  onToggleExpand={() => handleToggleExpand(song.id)}
                  onPlayAll={() => handlePlayAll(song)}
                  onPlayPart={(part) => handlePlayPart(song, part)}
                  onPause={handlePause}
                  onSeek={handleSeek}
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
