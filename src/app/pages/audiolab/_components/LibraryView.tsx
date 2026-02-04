'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Mic, Music, RefreshCw, ChevronDown, Sparkles } from 'lucide-react';
import CustomLoader from '@/components/CustomLoader';
import { useAudio } from '@/contexts/AudioContext';
import { useAudioLab } from '../_context/AudioLabContext';
import {
  getSongsPaginated,
  searchSongsDeep,
  toLeagcySong,
  getTotalSongCount,
  getPrograms,
  getSongsByProgram,
  type MasterProgram
} from '../_lib/song-service';
import { useZone } from '@/hooks/useZone';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { FirebaseMetadataService } from '@/lib/firebase-metadata-service';
import { SimpleSongCard } from './SimpleSongCard';
import { AudioLabSongDetailModal } from './AudioLabSongDetailModal';
import type { Song, VocalPart, AudioLabSong, LyricLine } from '../_types';
import type { PraiseNightSong } from '@/types/supabase';
import type { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';

export function LibraryView() {
  const { currentSong, isPlaying, setCurrentSong, togglePlayPause, currentTime, duration, setCurrentTime, isLoading: isAudioLoading, pause: stopSimpleAudio } = useAudio();
  const { setView, playSong: playInAudioLab, state, loadLibraryData } = useAudioLab();
  const { currentZone } = useZone();
  const searchParams = useSearchParams();

  // Program selection state (Declare early for hooks)
  const [programs, setPrograms] = useState<MasterProgram[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<string>('all');
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(true);

  // Initialize from global cache if available
  const [songs, setSongs] = useState<Song[]>(state.libraryData.songs || []);
  const [totalCount, setTotalCount] = useState(state.libraryData.totalCount || 0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageStack, setPageStack] = useState<(QueryDocumentSnapshot<DocumentData> | null)[]>([]);
  const ITEMS_PER_PAGE = 500; // Increased to 500+ per user request

  // Detail Modal State
  const [selectedDetailSong, setSelectedDetailSong] = useState<Song | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Observer for Infinite Scroll
  const loaderRef = useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = useState(state.libraryData.songs.length === 0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastVisibleDoc, setLastVisibleDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(state.libraryData.lastDoc || null);
  const [hasMore, setHasMore] = useState(state.libraryData.hasMore);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Sync with global cache when it updates in background
  useEffect(() => {
    if (selectedProgramId === 'all' && !searchQuery && state.libraryData.songs.length > 0) {
      setSongs(state.libraryData.songs.map(toLeagcySong));
      setTotalCount(state.libraryData.totalCount);
      setLastVisibleDoc(state.libraryData.lastDoc);
      setHasMore(state.libraryData.hasMore);
      setIsLoading(false);
    }
  }, [state.libraryData.songs, state.libraryData.totalCount, state.libraryData.lastFetched, selectedProgramId, searchQuery]);



  // Track highlighted song
  const [highlightedSongId, setHighlightedSongId] = useState<string | null>(null);
  const handledSongParamRef = useRef<string | null>(null);
  const [isNavigatingFromDetail, setIsNavigatingFromDetail] = useState(false);

  // Real-time data for "Ongoing" tab
  const { pages: praiseNightPages, getCurrentSongs: getPraiseNightSongs } = useRealtimeData(currentZone?.id);
  const [metadataTimestamp, setMetadataTimestamp] = useState(0);

  // Helper: Convert PraiseNightSong to AudioLabSong
  const praiseNightSongToAudioLabSong = useCallback((pnSong: PraiseNightSong): AudioLabSong => {
    // Basic lyrics parsing if it's HTML/String
    let parsedLyrics: LyricLine[] = [];
    if (pnSong.lyrics) {
      // Very basic strip HTML
      const text = pnSong.lyrics.replace(/<[^>]*>/g, '');
      parsedLyrics = text.split('\n').map((line, i) => ({
        time: i * 5,
        text: line,
        duration: 5
      })).filter(l => l.text.trim());
    }

    return {
      id: pnSong.id || `pn-${Math.random()}`, // Ensure ID
      title: pnSong.title,
      artist: pnSong.leadSinger || pnSong.writer || 'Praise Night',
      duration: 300,
      audioUrls: {
        full: pnSong.audioFile || ''
      },
      availableParts: pnSong.audioFile ? ['full'] : [],
      genre: pnSong.category || 'Praise Night',
      key: pnSong.key || '',
      tempo: pnSong.tempo ? parseInt(pnSong.tempo) || 0 : 0,
      albumArt: '',
      lyrics: pnSong.lyrics || [],
      zoneId: currentZone?.id || '',
      isHQSong: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'system'
    };
  }, [currentZone]);

  // Initial load
  useEffect(() => {
    const fetchPrograms = async () => {
      setIsLoadingPrograms(true);
      const fetchedPrograms = await getPrograms();
      setPrograms(fetchedPrograms);
      setIsLoadingPrograms(false);
    };

    fetchPrograms();
    // Load initial songs (e.g. 'all' or if param is set)
    loadSongs();
  }, [currentZone?.id]);

  // Handle program/pill change
  useEffect(() => {
    // Check URL first for deep linking
    const programParam = searchParams?.get('program');
    const songParam = searchParams?.get('song');

    if (programParam && programParam !== selectedProgramId && !isLoadingPrograms) {
      setSelectedProgramId(programParam);
    }

    if (songParam && songParam !== searchQuery) {
      setSearchQuery(songParam);
    }
  }, [searchParams, isLoadingPrograms]);

  useEffect(() => {
    console.log('🔄 [LibraryView] Triggering loadSongs due to change:', { selectedProgramId, metadataTimestamp, pagesCount: praiseNightPages.length });
    loadSongs();
  }, [selectedProgramId, metadataTimestamp, praiseNightPages.length]);

  // Real-time Song Sync for Ongoing/Page views
  useEffect(() => {
    if (!currentZone?.id || !praiseNightPages.length) return;

    let pageIdToSubscribe: string | null = null;

    if (selectedProgramId === 'ongoing') {
      const ongoingPage = [...praiseNightPages]
        .filter(p => p.category === 'ongoing')
        .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())[0];

      if (ongoingPage) {
        pageIdToSubscribe = ongoingPage.id;
      }
    } else if (selectedProgramId !== 'all') {
      // Check if selectedProgramId corresponds to a Praise Night Page
      const isPraiseNightPage = praiseNightPages.some(p => p.id === selectedProgramId);
      if (isPraiseNightPage) {
        pageIdToSubscribe = selectedProgramId;
      }
    }

    if (!pageIdToSubscribe) return;

    console.log(`📡 [LibraryView] Subscribing to song metadata for page ${pageIdToSubscribe}`);
    const unsubscribe = FirebaseMetadataService.subscribeToPraiseNightSongsMetadata(
      currentZone.id,
      pageIdToSubscribe,
      (timestamp) => {
        console.log(`🔔 [LibraryView] Song list update detected for ${pageIdToSubscribe}`);
        setMetadataTimestamp(timestamp);
      }
    );

    return () => {
      console.log(`🔌 [LibraryView] Unsubscribing from ${pageIdToSubscribe}`);
      unsubscribe();
    };
  }, [currentZone?.id, selectedProgramId, praiseNightPages]);

  const loadSongs = async (isManualRefresh = false) => {
    try {
      // Only show full screen loader if no songs are currently displayed OR if switching views
      if (songs.length === 0 || isManualRefresh || selectedProgramId !== 'all') {
        setIsLoading(true);
      }
      setError(null);
      setCurrentPage(1);
      setPageStack([null]);
      setHasMore(false);
      setLastVisibleDoc(null);

      let songsList: Song[] = [];

      if (selectedProgramId === 'ongoing') {
        const ongoingPage = [...praiseNightPages]
          .filter(p => p.category === 'ongoing')
          .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())[0];

        if (ongoingPage) {
          const pnSongs = await getPraiseNightSongs(ongoingPage.id);
          const validSongs = pnSongs.filter(s => s.audioFile).map(praiseNightSongToAudioLabSong);
          songsList = validSongs.map(toLeagcySong);
          setTotalCount(songsList.length);
          setHasMore(false);
        } else {
          setTotalCount(0);
          setHasMore(false);
        }
      } else {
        const specificPNPage = praiseNightPages.find(p => p.id === selectedProgramId);

        if (specificPNPage) {
          const pnSongs = await getPraiseNightSongs(specificPNPage.id);
          const validSongs = pnSongs.filter(s => s.audioFile).map(praiseNightSongToAudioLabSong);
          songsList = validSongs.map(toLeagcySong);
          setTotalCount(songsList.length);
          setHasMore(false);
        } else if (selectedProgramId !== 'all') {
          const programSongs = await getSongsByProgram(selectedProgramId);
          songsList = programSongs.map(toLeagcySong);
          setTotalCount(songsList.length);
          setHasMore(false);
        } else {
          // Check for cached data in context for 'all' view
          if (!isManualRefresh && state.libraryData.songs.length > 0) {
            console.log('📦 [LibraryView] Using cached all-songs from context');
            songsList = state.libraryData.songs.map(toLeagcySong);
            setTotalCount(state.libraryData.totalCount);
            setLastVisibleDoc(state.libraryData.lastDoc);
            setHasMore(state.libraryData.hasMore);
          } else {
            console.log('🚀 [LibraryView] Cache empty or manual refresh. Triggering context load...');
            // loadLibraryData now handles its own TTL check internally unless forceRefresh=true
            await loadLibraryData(currentZone?.id || '', ITEMS_PER_PAGE, isManualRefresh);

            // The context update will trigger a re-render. 
            // However, to satisfy the immediate songsList need:
            if (!isManualRefresh && state.libraryData.songs.length > 0) {
              songsList = state.libraryData.songs.map(toLeagcySong);
              setTotalCount(state.libraryData.totalCount);
              setLastVisibleDoc(state.libraryData.lastDoc);
              setHasMore(state.libraryData.hasMore);
            }
            // If it was a forced refresh or truly empty, the NEXT render cycle will pick it up
            // because loadSongs is run in an Effect that depends on selectedProgramId.
          }
        }
      }

      setSongs(songsList);
      setHasMore(songsList.length < totalCount); // Double check local vs total
      console.log(`✅ [LibraryView] Loaded ${songsList.length} songs for ${selectedProgramId}`);

      // If we were showing a background refresh, we're done
      if (isLoading) setIsLoading(false);

    } catch (err) {
      console.error('[LibraryView] Error loading songs:', err);
      setError('Failed to load songs');
      setSongs([]);
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore || !lastVisibleDoc || selectedProgramId !== 'all' || searchQuery) return;

    setIsLoadingMore(true);
    try {
      const { songs: audioLabSongs, lastDoc } = await getSongsPaginated(lastVisibleDoc, ITEMS_PER_PAGE);
      const legacySongs = audioLabSongs.map(toLeagcySong);

      if (legacySongs.length > 0) {
        setSongs(prev => [...prev, ...legacySongs]);
        setLastVisibleDoc(lastDoc);
        setHasMore(legacySongs.length >= ITEMS_PER_PAGE);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('[LibraryView] Error loading more songs:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Intersection Observer for Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !isLoading && selectedProgramId === 'all' && !searchQuery) {
          handleLoadMore();
        }
      },
      { threshold: 0.1, rootMargin: '400px' } // Increased rootMargin for seamless loading
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, isLoading, lastVisibleDoc, selectedProgramId, searchQuery]);

  // Deep Search fallback for songs not in the current 500
  useEffect(() => {
    const handler = setTimeout(async () => {
      const trimmedQuery = searchQuery.trim();
      if (trimmedQuery.length >= 3) {
        // Check if we already have good local matches
        const localMatches = songs.filter(s =>
          s.title.toLowerCase().includes(trimmedQuery.toLowerCase())
        );

        // Only go to the server if local results are zero or sparse
        // but if we're searching, deep search is often better
        if (localMatches.length < 2) {
          setIsSearching(true);
          try {
            const results = await searchSongsDeep(trimmedQuery, currentZone?.id || undefined);
            if (results.length > 0) {
              setSongs(results.map(toLeagcySong));
              setTotalCount(results.length);
              setHasMore(false);
            }
          } catch (error) {
            console.error('[LibraryView] Deep search failed:', error);
          } finally {
            setIsSearching(false);
          }
        }
      } else if (trimmedQuery.length === 0 && !isLoading && !isSearching) {
        // If search was cleared, restore the original list
        if (handledSongParamRef.current || (songs.length !== state.libraryData.songs.length && selectedProgramId === 'all')) {
          console.log('🔄 [LibraryView] Restoring library after search clear');
          loadSongs();
          handledSongParamRef.current = null;
        }
      }
    }, 600); // Higher debounce for server search to let local filter breathe

    return () => clearTimeout(handler);
  }, [searchQuery]);



  // Intelligent Local Filtering (Case-Insensitive)
  const filteredSongs = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return songs;

    return songs.filter(song =>
      song.title.toLowerCase().includes(query) ||
      song.artist.toLowerCase().includes(query)
    );
  }, [songs, searchQuery]);



  const handleOpenDetail = useCallback((song: Song) => {
    setSelectedDetailSong(song);
    setIsDetailModalOpen(true);
  }, []);

  // Handle auto-highlight and expansion when navigating via song param
  useEffect(() => {
    const songParam = searchParams?.get('song');
    if (!songParam || isLoading || songs.length === 0) return;

    // Only process this once per song param change to avoid infinite loops
    if (handledSongParamRef.current === songParam) return;

    const decodedSong = decodeURIComponent(songParam);
    const matchedSong = songs.find(s =>
      s.title.toLowerCase() === decodedSong.toLowerCase() ||
      s.title.toLowerCase().includes(decodedSong.toLowerCase())
    );

    if (matchedSong) {
      console.log(`✨ [LibraryView] Auto-opening song detail: ${matchedSong.title}`);

      // Open the full screen modal
      handleOpenDetail(matchedSong);

      // Also highlight in the background list for reference
      setHighlightedSongId(matchedSong.id);
      handledSongParamRef.current = songParam;

      // Scroll the list to the song so it's visible behind the modal
      setTimeout(() => {
        const element = document.getElementById(`song-${matchedSong.id}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 600);

      // Remove highlight after 5 seconds
      setTimeout(() => {
        setHighlightedSongId(null);
      }, 5000);
    }
  }, [searchParams, isLoading, songs, handleOpenDetail]);

  // Handle Play Individual Part
  const handlePlayPart = useCallback((song: Song, part: VocalPart) => {
    const audioUrl = part === 'full'
      ? song.audioUrls?.full || song.audioUrl
      : song.audioUrls?.[part];

    if (!audioUrl) return;

    const audioSong = {
      id: `${song.id}-${part}`,
      title: `${song.title} (${part})`,
      audioFile: audioUrl,
      writer: song.artist,
    };

    if (currentSong?.id === audioSong.id) {
      togglePlayPause();
    } else {
      setCurrentSong(audioSong as any, true);
    }
  }, [currentSong, setCurrentSong, togglePlayPause]);

  // Removed - no longer needed with simple audio
  const handlePause = useCallback(() => togglePlayPause(), [togglePlayPause]);
  const handleSeek = useCallback((time: number) => {
    // Simple audio context doesn't expose seek directly in the hook
    // We'll handle this in the card if needed
  }, []);


  return (
    <div className="flex flex-col pb-24">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-violet-500/10 via-transparent to-transparent pointer-events-none z-0" />

      <main className="relative z-10 flex flex-col gap-4 sm:gap-6 px-3 sm:px-4 pt-4 sm:pt-6">
        <div className="flex flex-col gap-1.5 sm:gap-2 mb-2">
          <h1 className="text-white text-2xl sm:text-[28px] font-bold leading-tight tracking-tight">Library</h1>
          <p className="text-slate-400 text-xs sm:text-sm">Tap a song to access vocal parts</p>
        </div>

        {/* Program Selector Pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
          <button
            onClick={() => setSelectedProgramId('all')}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${selectedProgramId === 'all'
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
              : 'bg-[#261933] text-slate-400 border border-white/5 hover:bg-white/5'
              }`}
          >
            All Ministered Songs
          </button>

          {/* Ongoing Tab */}
          <button
            onClick={() => setSelectedProgramId('ongoing')}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${selectedProgramId === 'ongoing'
              ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
              : 'bg-[#261933] text-amber-500 border border-amber-500/20 hover:bg-amber-500/10'
              }`}
          >

            Ongoing
          </button>




          {/* Master Programs Pills */}
          {programs.map((program) => (
            <button
              key={program.id}
              onClick={() => setSelectedProgramId(program.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${selectedProgramId === program.id
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                : 'bg-[#261933] text-slate-400 border border-white/5 hover:bg-white/5'
                }`}
            >
              {program.name}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="pt-1 pb-2 sticky top-0 z-10 bg-[#191022]">
          <label className="flex w-full items-center gap-2 rounded-xl bg-[#261933] px-3 sm:px-4 py-3 shadow-sm border border-white/5 focus-within:ring-2 focus-within:ring-violet-500/50 transition-all">
            <Search size={18} className={isSearching ? "text-violet-400 animate-pulse" : "text-slate-500"} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none p-0 text-sm sm:text-base text-white placeholder:text-slate-400 focus:ring-0 focus:outline-none"
              placeholder="Search entire library..."
              autoComplete="off"
            />
            {isSearching && <RefreshCw size={16} className="text-violet-400 animate-spin" />}
          </label>
        </div>

        <div className="flex items-center justify-between px-1">
          <p className="text-slate-500 text-[10px] font-medium uppercase tracking-wider">
            Showing {filteredSongs.length} of {totalCount} {totalCount === 1 ? 'Song' : 'Songs'}
          </p>
          {isSearching && (
            <div className="flex items-center gap-2">
              <RefreshCw size={12} className="text-violet-400 animate-spin" />
              <span className="text-violet-400 text-[10px] font-medium">Searching Cloud...</span>
            </div>
          )}
        </div>

        {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

        {
          isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <CustomLoader message="" />
              <p className="text-slate-500 font-medium">Brewing Master Library...</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredSongs.map((song, index) => {
                // Simple ID matching like Ministered Songs
                const isThisSongPlaying = (currentSong?.id?.startsWith(song.id) && isPlaying) || false;
                const songNumber = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;

                return (
                  <div key={song.id} id={`song-${song.id}`}>
                    <SimpleSongCard
                      song={song}
                      songNumber={songNumber}
                      isPlaying={isThisSongPlaying}
                      isLoading={isThisSongPlaying && isAudioLoading}
                      currentPart={isThisSongPlaying ? (currentSong?.id?.split('-')[1] as VocalPart || 'full') : null}
                      currentTime={isThisSongPlaying ? currentTime : 0}
                      duration={isThisSongPlaying ? duration : (song.duration || 0)}
                      onClick={() => handleOpenDetail(song)}
                      isHighlighted={highlightedSongId === song.id}
                    />
                  </div>
                );
              })}

              {/* Load More / Infinite Scroll Sentinel */}
              {!searchQuery && hasMore && (
                <div
                  ref={(node) => {
                    loaderRef.current = node;
                    if (node) {
                      const observer = new IntersectionObserver(
                        (entries) => {
                          if (entries[0].isIntersecting && !isLoadingMore) {
                            handleLoadMore();
                          }
                        },
                        { threshold: 0.1, rootMargin: '100px' }
                      );
                      observer.observe(node);
                      return () => observer.disconnect();
                    }
                  }}
                  className="py-12 flex flex-col items-center justify-center min-h-[100px]"
                >
                  <div className="flex flex-col items-center gap-3">
                    <CustomLoader size="md" />
                    <p className="text-violet-400 text-sm font-bold animate-pulse">Loading next batch...</p>
                  </div>
                </div>
              )}


              {songs.length === 0 && !isLoading && (
                <div className="py-20 text-center flex flex-col items-center gap-3">
                  <Music size={48} className="text-slate-700" />
                  <p className="text-slate-500">No songs found in the cloud.</p>
                </div>
              )}
            </div>
          )
        }
      </main >

      {selectedDetailSong && (
        <AudioLabSongDetailModal
          song={selectedDetailSong}
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
        />
      )}
    </div >
  );
}
