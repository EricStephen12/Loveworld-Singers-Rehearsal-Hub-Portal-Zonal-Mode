'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Mic, Music, RefreshCw, ChevronDown } from 'lucide-react';
import CustomLoader from '@/components/CustomLoader';
import { useAudio } from '@/contexts/AudioContext';
import { useAudioLab } from '../_context/AudioLabContext';
import { getSongsPaginated, searchSongsDeep, toLeagcySong, getTotalSongCount } from '../_lib/song-service';
import { useZone } from '@/hooks/useZone';
import { SimpleSongCard } from './SimpleSongCard';
import type { Song, VocalPart } from '../_types';
import type { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';

export function LibraryView() {
  const { currentSong, isPlaying, setCurrentSong, togglePlayPause, currentTime, duration, setCurrentTime, isLoading: isAudioLoading, pause: stopSimpleAudio } = useAudio();
  const { setView, playSong: playInAudioLab } = useAudioLab();
  const { currentZone } = useZone();
  const searchParams = useSearchParams();

  const [songs, setSongs] = useState<Song[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageStack, setPageStack] = useState<(QueryDocumentSnapshot<DocumentData> | null)[]>([]);
  const ITEMS_PER_PAGE = 500;

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastVisibleDoc, setLastVisibleDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [loadingKaraokeId, setLoadingKaraokeId] = useState<string | null>(null);

  // Accordion state
  const [expandedSongId, setExpandedSongId] = useState<string | null>(null);

  // Track highlighted song
  const [highlightedSongId, setHighlightedSongId] = useState<string | null>(null);
  const handledSongParamRef = useRef<string | null>(null);
  const [isNavigatingFromDetail, setIsNavigatingFromDetail] = useState(false);

  // Initial load
  useEffect(() => {
    loadSongsInitial();
  }, [currentZone?.id]);

  const loadSongsInitial = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setCurrentPage(1);
      setPageStack([null]); // Start with no cursor for page 1

      const [paginatedResult, count] = await Promise.all([
        getSongsPaginated(null, ITEMS_PER_PAGE),
        getTotalSongCount()
      ]);

      const { songs: audioLabSongs, lastDoc } = paginatedResult;
      const legacySongs = audioLabSongs.map(toLeagcySong);

      setSongs(legacySongs);
      setTotalCount(count);
      setLastVisibleDoc(lastDoc);
      setHasMore(legacySongs.length === ITEMS_PER_PAGE);

    } catch (err) {
      console.error('[LibraryView] Error loading songs:', err);
      setError('Failed to load songs');
      setSongs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextPage = async () => {
    if (isLoadingMore || !hasMore || !lastVisibleDoc) return;

    setIsLoadingMore(true);
    try {
      setPageStack(prev => [...prev, lastVisibleDoc]);

      const { songs: audioLabSongs, lastDoc } = await getSongsPaginated(lastVisibleDoc, ITEMS_PER_PAGE);
      const legacySongs = audioLabSongs.map(toLeagcySong);

      if (legacySongs.length > 0) {
        setSongs(legacySongs);
        setLastVisibleDoc(lastDoc);
        setCurrentPage(prev => prev + 1);
        setHasMore(legacySongs.length === ITEMS_PER_PAGE);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('[LibraryView] Error loading next page:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handlePrevPage = async () => {
    if (currentPage <= 1 || isLoadingMore) return;

    setIsLoadingMore(true);
    try {
      const newStack = [...pageStack];
      newStack.pop(); // Remove cursor for current page
      const prevCursor = newStack[newStack.length - 1]; // Get cursor for the page we are going back to

      const { songs: audioLabSongs, lastDoc } = await getSongsPaginated(prevCursor || null, ITEMS_PER_PAGE);
      const legacySongs = audioLabSongs.map(toLeagcySong);

      setSongs(legacySongs);
      setLastVisibleDoc(lastDoc);
      setPageStack(newStack);
      setCurrentPage(prev => prev - 1);
      setHasMore(true);

    } catch (err) {
      console.error('[LibraryView] Error loading prev page:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Deep Search fallback for songs not in the current 500
  useEffect(() => {
    const handler = setTimeout(async () => {
      const trimmedQuery = searchQuery.trim();
      if (trimmedQuery.length >= 3) {
        // Check if we already have good local matches
        const localMatches = songs.filter(s =>
          s.title.toLowerCase().includes(trimmedQuery.toLowerCase())
        );

        // Only go to the server if local results are sparse (less than 5)
        // or if we suspect more exists in the wider library
        if (localMatches.length < 5) {
          setIsSearching(true);
          try {
            const results = await searchSongsDeep(trimmedQuery);
            if (results.length > 0) {
              setSongs(results.map(toLeagcySong));
              setHasMore(false);
            }
          } catch (err) {
            console.error('[LibraryView] Deep search failed:', err);
          } finally {
            setIsSearching(false);
          }
        }
      } else if (trimmedQuery.length === 0) {
        loadSongsInitial();
      }
    }, 800); // Higher debounce for server search to let local filter breathe

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

  // Handle toggle expand
  const handleToggleExpand = useCallback((songId: string) => {
    setExpandedSongId(prev => (prev === songId ? null : songId));
  }, []);

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
  const handleStartKaraoke = useCallback(async (song: Song) => {
    if (loadingKaraokeId) return;

    setLoadingKaraokeId(song.id);
    stopSimpleAudio();

    // Switch view INSTANTLY so the user sees the Karaoke screen
    setView('karaoke');

    // Trigger loading in background (KaraokeView will show its own loader)
    playInAudioLab(song).finally(() => {
      setLoadingKaraokeId(null);
    });
  }, [loadingKaraokeId, stopSimpleAudio, playInAudioLab, setView]);

  return (
    <div className="flex flex-col pb-24">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-violet-500/10 via-transparent to-transparent pointer-events-none z-0" />

      <main className="relative z-10 flex flex-col gap-4 sm:gap-6 px-3 sm:px-4 pt-4 sm:pt-6">
        <div className="flex flex-col gap-1.5 sm:gap-2 mb-2">
          <h1 className="text-white text-2xl sm:text-[28px] font-bold leading-tight tracking-tight">Library</h1>
          <p className="text-slate-400 text-xs sm:text-sm">Tap a song to access vocal parts</p>
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

        {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <CustomLoader message="" />
            <p className="text-slate-500 font-medium">Brewing Master Library...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredSongs.map((song, index) => {
              // Simple ID matching like Ministered Songs
              const isThisSongPlaying = (currentSong?.id?.startsWith(song.id) && isPlaying) || false;
              const isThisSongExpanded = expandedSongId === song.id;
              const songNumber = (currentPage - 1) * ITEMS_PER_PAGE + index + 1;

              return (
                <div key={song.id} id={`song-${song.id}`}>
                  <SimpleSongCard
                    song={song}
                    songNumber={songNumber}
                    isPlaying={isThisSongPlaying}
                    isLoading={isThisSongPlaying && isAudioLoading}
                    isExpanded={isThisSongExpanded}
                    currentPart={isThisSongPlaying ? (currentSong?.id?.split('-')[1] as VocalPart || 'full') : null}
                    currentTime={isThisSongPlaying ? currentTime : 0}
                    duration={isThisSongPlaying ? duration : (song.duration || 0)}
                    onToggleExpand={() => handleToggleExpand(song.id)}
                    onPlayPart={(part) => handlePlayPart(song, part)}
                    onSeek={setCurrentTime}
                    onStartKaraoke={() => handleStartKaraoke(song)}
                    isKaraokeLoading={loadingKaraokeId === song.id}
                  />
                </div>
              );
            })}

            {!searchQuery && (
              <div className="pt-6 pb-8 flex flex-col items-center gap-4">

                <div className="flex items-center justify-between w-full gap-4">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1 || isLoadingMore}
                    className="flex-1 py-3 px-4 rounded-xl bg-[#261933] border border-white/10 text-slate-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5 active:scale-[0.98] transition-all flex items-center justify-center gap-2 touch-manipulation"
                  >
                    <ChevronDown size={18} className="rotate-90" />
                    Previous
                  </button>

                  <div className="flex flex-col items-center">
                    <span className="text-white font-bold text-lg">Page {currentPage}</span>
                    <span className="text-xs text-slate-500">of {Math.ceil(totalCount / ITEMS_PER_PAGE) || 1}</span>
                  </div>

                  <button
                    onClick={handleNextPage}
                    disabled={!hasMore || isLoadingMore}
                    className="flex-1 py-3 px-4 rounded-xl bg-violet-600 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-violet-700 active:scale-[0.98] transition-all shadow-lg shadow-violet-500/20 flex items-center justify-center gap-2 touch-manipulation"
                  >
                    Next
                    <ChevronDown size={18} className="-rotate-90" />
                  </button>
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
        )}
      </main>
    </div>
  );
}
