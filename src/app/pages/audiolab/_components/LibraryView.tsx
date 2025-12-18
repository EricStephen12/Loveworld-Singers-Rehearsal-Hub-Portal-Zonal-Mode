'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Mic, Play, Music, Loader2, RefreshCw, ChevronLeft } from 'lucide-react';
import { useAudioLab } from '../_context/AudioLabContext';
import { getSongs, toLeagcySong } from '../_lib/song-service';
import { useZone } from '@/hooks/useZone';
import { useAuth } from '@/hooks/useAuth';
import { SongActionSheet } from './SongActionSheet';
import type { Song, VocalPart } from '../_types';

type FilterType = 'All' | 'Soprano' | 'Alto' | 'Tenor' | 'Bass' | 'Warm-ups';
const filters: FilterType[] = ['All', 'Soprano', 'Alto', 'Tenor', 'Bass', 'Warm-ups'];

export function LibraryView() {
  const { playSong, setView, state } = useAudioLab();
  const { currentZone } = useZone();
  const { user } = useAuth();
  
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  
  // Song action sheet state
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  
  // Get last played song from player state
  const lastPlayedSong = state.player.currentSong;
  const lastPlayedTime = state.player.currentTime;
  const lastPlayedDuration = state.player.duration;

  // Fetch songs on mount and when zone changes
  useEffect(() => {
    loadSongs();
  }, [currentZone?.id]);

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

  // Filter songs based on search and filter
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
    
    if (activeFilter !== 'All' && activeFilter !== 'Warm-ups') {
      const partMap: Record<string, VocalPart> = {
        'Soprano': 'soprano',
        'Alto': 'alto',
        'Tenor': 'tenor',
        'Bass': 'bass'
      };
      const part = partMap[activeFilter];
      if (part) {
        result = result.filter(song => song.availableParts?.includes(part));
      }
    }
    
    if (activeFilter === 'Warm-ups') {
      result = result.filter(song => 
        song.genre?.toLowerCase().includes('exercise') ||
        song.genre?.toLowerCase().includes('warm')
      );
    }
    
    return result;
  }, [songs, searchQuery, activeFilter]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPartBadges = (song: Song) => {
    if (!song.availableParts || song.availableParts.length <= 1) return null;
    
    const partColors: Record<VocalPart, string> = {
      full: 'bg-violet-500/20 text-violet-400',
      soprano: 'bg-pink-500/20 text-pink-400',
      alto: 'bg-amber-500/20 text-amber-400',
      tenor: 'bg-blue-500/20 text-blue-400',
      bass: 'bg-emerald-500/20 text-emerald-400'
    };
    
    return (
      <div className="flex gap-1 mt-1">
        {song.availableParts.filter(p => p !== 'full').slice(0, 3).map(part => (
          <span 
            key={part}
            className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium uppercase ${partColors[part]}`}
          >
            {part.charAt(0)}
          </span>
        ))}
        {song.availableParts.length > 4 && (
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/60">
            +{song.availableParts.length - 4}
          </span>
        )}
      </div>
    );
  };


  return (
    <div className="flex flex-col pb-24">
      {/* Header - Song Picker Mode */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-3 mb-2">
          <button 
            onClick={() => setView('intent-choice')}
            className="flex items-center justify-center size-10 rounded-full hover:bg-white/10 transition-colors -ml-2"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h2 className="text-[28px] font-bold leading-tight tracking-tight">
              Pick a song
            </h2>
            <p className="text-slate-400 text-sm">
              Choose a backing track for your project
            </p>
          </div>
        </div>
      </div>

      {/* Continue Session Card - Only show if there's a song in progress */}
      {lastPlayedSong && lastPlayedTime > 0 && (
        <div className="px-4 py-2">
          <div className="relative overflow-hidden rounded-xl bg-[#261933] shadow-lg border border-white/5 group">
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 bg-gradient-to-r from-[#261933] via-[#261933]/90 to-[#261933]/60 z-10" />
              {lastPlayedSong.albumArt && (
                <div 
                  className="h-full w-full bg-cover bg-center opacity-40"
                  style={{ backgroundImage: `url('${lastPlayedSong.albumArt}')` }}
                />
              )}
            </div>
            
            <div className="relative z-20 p-4 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-1">
                  <span className="text-violet-400 text-xs font-bold uppercase tracking-wider">
                    Continue Session
                  </span>
                  <p className="text-white text-lg font-bold leading-tight line-clamp-1">
                    {lastPlayedSong.title}
                  </p>
                  <p className="text-slate-300 text-sm font-medium">
                    In progress: {formatDuration(Math.floor(lastPlayedTime))} / {formatDuration(lastPlayedDuration || lastPlayedSong.duration)}
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-0.5 h-8">
                  <div className="w-1 bg-violet-500/50 h-3 rounded-full animate-pulse" />
                  <div className="w-1 bg-violet-500/80 h-5 rounded-full animate-pulse delay-75" />
                  <div className="w-1 bg-violet-500 h-8 rounded-full animate-pulse delay-100" />
                  <div className="w-1 bg-violet-500/80 h-4 rounded-full animate-pulse delay-75" />
                  <div className="w-1 bg-violet-500/50 h-3 rounded-full animate-pulse" />
                </div>
              </div>
              
              <div className="w-full bg-white/10 rounded-full h-1.5 mb-1 overflow-hidden">
                <div 
                  className="bg-violet-500 h-1.5 rounded-full transition-all" 
                  style={{ width: `${lastPlayedDuration ? (lastPlayedTime / lastPlayedDuration) * 100 : 0}%` }}
                />
              </div>
              
              <button 
                onClick={() => playSong(lastPlayedSong)}
                className="flex w-full items-center justify-center rounded-lg h-10 bg-violet-500 hover:bg-violet-600 text-white gap-2 text-sm font-bold transition-colors"
              >
                <Play size={20} fill="currentColor" />
                <span>Resume Practice</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="px-4 pt-4 pb-2 sticky top-0 z-10 bg-[#191022]">
        <label className="flex w-full items-center gap-2 rounded-xl bg-[#261933] px-4 py-3 shadow-sm border border-white/5 focus-within:ring-2 focus-within:ring-violet-500/50 transition-all">
          <Search size={20} className="text-slate-500" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none p-0 text-base text-white placeholder:text-slate-400 focus:ring-0 focus:outline-none"
            placeholder="Search titles, artists or lyrics..."
          />
          <button className="text-slate-400 hover:text-violet-400 transition-colors">
            <Mic size={20} />
          </button>
        </label>
      </div>

      {/* Filters & Sort */}
      <div className="flex items-center gap-2 pl-4 py-2 overflow-x-auto no-scrollbar pb-4">
        <button 
          onClick={loadSongs}
          disabled={isLoading}
          className="flex shrink-0 h-9 w-9 items-center justify-center rounded-lg bg-[#261933] border border-white/10 text-slate-300 hover:text-white hover:border-violet-500/50 transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <RefreshCw size={20} />
          )}
        </button>
        
        <div className="w-[1px] h-6 bg-white/10 shrink-0 mx-1" />
        
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-lg px-4 transition-colors ${
              activeFilter === filter
                ? 'bg-violet-500 text-white shadow-md shadow-violet-500/20'
                : 'bg-[#261933] border border-white/5 text-slate-300 hover:bg-white/5'
            }`}
          >
            <p className="text-sm font-medium">{filter}</p>
          </button>
        ))}
        
        <div className="w-2 shrink-0" />
      </div>

      {/* Error State */}
      {error && (
        <div className="mx-4 mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
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

      {/* Empty State - minimal */}
      {!isLoading && filteredSongs.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center py-16 px-6">
          <Music size={48} className="text-slate-600 mb-4" />
          <p className="text-slate-400 text-sm text-center mb-4">
            {searchQuery ? 'No songs match your search' : 'Songs coming soon'}
          </p>
          {(searchQuery || activeFilter !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('All');
              }}
              className="text-violet-400 text-sm font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Song List */}
      {!isLoading && filteredSongs.length > 0 && (
        <div className="flex-1 flex flex-col gap-1 px-4">
          {filteredSongs.map((song) => (
            <button
              key={song.id}
              onClick={() => {
                setSelectedSong(song);
                setIsActionSheetOpen(true);
              }}
              className="group flex items-center gap-3 p-2 pr-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer text-left w-full"
            >
              {/* Album Art */}
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg shadow-sm">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundImage: song.albumArt ? `url('${song.albumArt}')` : 'none', backgroundColor: '#261933' }}
                />
                {!song.albumArt && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Music size={20} className="text-slate-500" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play size={24} className="text-white" fill="currentColor" />
                </div>
              </div>
              
              {/* Song Info */}
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="text-base font-bold leading-tight text-white truncate">
                  {song.title}
                </p>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <span className="truncate max-w-[120px]">{song.artist}</span>
                  {song.genre && (
                    <>
                      <span className="h-1 w-1 rounded-full bg-slate-600" />
                      <span className="truncate text-violet-400">{song.genre}</span>
                    </>
                  )}
                </div>
                {getPartBadges(song)}
              </div>
              
              {/* Quick Practice Button */}
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  playSong(song);
                  setView('karaoke');
                }}
                className="flex h-9 px-3 items-center justify-center gap-1.5 rounded-lg bg-violet-500/20 text-violet-400 hover:bg-violet-500 hover:text-white transition-colors text-xs font-bold"
              >
                <Mic size={14} />
                <span className="hidden sm:inline">Practice</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Song Action Sheet */}
      <SongActionSheet 
        song={selectedSong}
        isOpen={isActionSheetOpen}
        onClose={() => {
          setIsActionSheetOpen(false);
          setSelectedSong(null);
        }}
      />
    </div>
  );
}
