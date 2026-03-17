'use client';

import { useState, useEffect, useRef } from 'react';
import {
  X, Settings, Star, Play, Pause, Search,
  RotateCcw, RotateCw, Maximize, Mic, MicOff, AlertCircle, Music
} from 'lucide-react';
import CustomLoader from '@/components/CustomLoader';
import { useAudioLab } from '../_context/AudioLabContext';
import { useAuth } from '@/hooks/useAuth';
import { audioEngine } from '../_lib/audio-engine';
import { endSession, startSession } from '../_lib/practice-service';
import { getSongLyrics, parseLRCLyrics } from '../_lib/lyrics-service';
import { SimpleSongCard } from './SimpleSongCard';

// Default lyrics when no lyrics available
const defaultLyrics = [
  { time: 0, text: "♪" },
  { time: 5, text: "No synchronized lyrics available" },
  { time: 10, text: "Please add LRC-formatted lyrics in Admin Area" },
];

export function KaraokeView() {
  const { goBack, formatTime, state, setView, togglePlay, seek, updatePracticeStats, loadLibraryData, playSong } = useAudioLab();
  const { user, profile } = useAuth();
  const { player } = state;

  const currentSong = player.currentSong;
  const hasSong = !!currentSong;

  const songTitle = currentSong?.title || 'Practice Mode';
  const songArtist = currentSong?.artist || 'AudioLab';
  // Standardize duration to react to the live engine state
  const songDuration = player.duration || currentSong?.duration || 0;

  // Lyrics state - fetched from song data or URL
  const [songLyrics, setSongLyrics] = useState<{ time: number; text: string; targetPitch?: number }[]>(defaultLyrics);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [lyricsError, setLyricsError] = useState<string | null>(null);
  const [hasSyncedLyrics, setHasSyncedLyrics] = useState(false);

  // Fetch and parse lyrics when song changes
  useEffect(() => {
    const loadLyrics = async () => {
      if (!currentSong) {
        setSongLyrics(defaultLyrics);
        setHasSyncedLyrics(false);
        return;
      }

      setLyricsLoading(true);
      setLyricsError(null);

      try {
        if (currentSong.id) {
          const { karaokeLrcText } = await getSongLyrics(currentSong.id);

          // STRICT LOGIC: Only use the dedicated admin karaokeLrcText field
          if (karaokeLrcText && karaokeLrcText.trim().length > 0) {
            const parsed = parseLRCLyrics(karaokeLrcText);
            if (parsed.length > 0) {
              setSongLyrics(parsed);
              setHasSyncedLyrics(true);
              setLyricsLoading(false);
              return;
            }
          }
        }

        setSongLyrics(defaultLyrics);
        setHasSyncedLyrics(false);
        setLyricsError('Manual sync required. No LRC lyrics configured.');

      } catch (error) {
 console.error('[KaraokeView] Error loading lyrics:', error);
        setSongLyrics(defaultLyrics);
        setLyricsError('Failed to load lyrics');
      }

      setLyricsLoading(false);
    };

    loadLyrics();
  }, [currentSong, songDuration]);



  // State
  const [currentLine, setCurrentLine] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [pitchPosition, setPitchPosition] = useState(50);
  const [currentRating, setCurrentRating] = useState('');
  const [showRating, setShowRating] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [currentPitch, setCurrentPitch] = useState<number | null>(null);
  const [pitchAccuracy, setPitchAccuracy] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showSongPicker, setShowSongPicker] = useState(false);
  const [isPickerLoading, setIsPickerLoading] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Refs
  const ratingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastLineRef = useRef(-1);

  // Waveform visualization bars
  const [waveformBars, setWaveformBars] = useState([4, 6, 3, 8, 12, 6, 4, 2]);

  // Initialize session when view opens
  useEffect(() => {
    const initSession = async () => {
      if (user?.uid && currentSong?.id) {
        const result = await startSession(user.uid, currentSong.id, 'karaoke');
        if (result.success && result.sessionId) {
          setSessionId(result.sessionId);
        }
      }
    };
    initSession();
  }, [user?.uid, currentSong?.id]);

  // Initialize pitch detection when mic is active
  useEffect(() => {
    if (isMicActive) {
      // Set up pitch detection callback
      audioEngine.onPitchDetected = (data) => {
        setCurrentPitch(data.pitch);

        // Calculate accuracy based on target pitch (logarithmic cents)
        const targetPitch = songLyrics[currentLine]?.targetPitch || 440;

        // Calculate cents difference: 1200 * log2(f2/f1)
        const centsDiff = Math.abs(1200 * Math.log2(data.pitch / targetPitch));

        // Quarter-tone (50 cents) deviation = 0% accuracy
        const accuracy = Math.max(0, 100 - (centsDiff / 50) * 100);
        setPitchAccuracy(accuracy);

        // Maps -50/+50 cents to 0-100 range
        const normalizedPitch = Math.max(0, Math.min(100, 50 + (1200 * Math.log2(data.pitch / targetPitch))));
        setPitchPosition(normalizedPitch);

        // Award points based on accuracy
        if (accuracy > 80) {
          setScore(prev => prev + Math.floor(accuracy / 10));
          if (accuracy > 90) {
            showRatingPopup('Perfect!');
            setStreak(prev => prev + 1);
          } else if (accuracy > 85) {
            showRatingPopup('Excellent!');
          }
        }
      };

      audioEngine.startPitchDetection();
    } else {
      audioEngine.stopPitchDetection();
      audioEngine.onPitchDetected = null;
    }

    return () => {
      audioEngine.stopPitchDetection();
      audioEngine.onPitchDetected = null;
    };
  }, [isMicActive, currentLine, songLyrics]);

  useEffect(() => {
    const currentTime = player.currentTime;
    const activeLine = songLyrics.findIndex((lyric, index) =>
      currentTime >= lyric.time && currentTime < (songLyrics[index + 1]?.time || songDuration)
    );

    if (activeLine !== -1 && activeLine !== lastLineRef.current) {
      setCurrentLine(activeLine);
      lastLineRef.current = activeLine;

      // Animate waveform on line change
      setWaveformBars(prev => prev.map(() => Math.floor(Math.random() * 12) + 2));
    }
  }, [player.currentTime, songDuration, songLyrics]);

  // Animate waveform while playing
  useEffect(() => {
    if (!player.isPlaying) return;

    const interval = setInterval(() => {
      setWaveformBars(prev => prev.map(h => {
        const change = (Math.random() - 0.5) * 4;
        return Math.max(2, Math.min(14, h + change));
      }));
    }, 150);

    return () => clearInterval(interval);
  }, [player.isPlaying]);

  const showRatingPopup = (rating: string) => {
    setCurrentRating(rating);
    setShowRating(true);

    if (ratingTimeoutRef.current) {
      clearTimeout(ratingTimeoutRef.current);
    }

    ratingTimeoutRef.current = setTimeout(() => {
      setShowRating(false);
    }, 1500);
  };

  const toggleMic = async () => {
    if (isMicActive) {
      setIsMicActive(false);
      await audioEngine.stopRecording();
    } else {
      // Request mic permission and start
      try {
        const success = await audioEngine.startRecording();
        if (success) {
          setIsMicActive(true);
        }
      } catch (error) {
 console.error('[KaraokeView] Failed to start mic:', error);
      }
    }
  };

  const handlePlayPause = () => {
    togglePlay();
  };

  const skipBack = () => {
    seek(Math.max(0, player.currentTime - 10));
  };

  const skipForward = () => {
    seek(Math.min(songDuration, player.currentTime + 10));
  };

  const handleClose = () => {
    // Navigate away INSTANTLY so the user sees immediate feedback
    goBack();

    // Update stats synchronously (no network call)
    updatePracticeStats({
      score,
      accuracy: pitchAccuracy,
      streak,
      sessionsCompleted: state.practiceStats.sessionsCompleted + 1
    });

    // Fire-and-forget cleanup in the background
    (async () => {
      try {
        if (isMicActive) {
          await audioEngine.stopRecording();
        }
        if (user?.uid && sessionId) {
          await endSession(sessionId, {
            score,
            accuracy: pitchAccuracy,
            streak,
            duration: player.currentTime
          });
        }
      } catch (err) {
 console.error('[KaraokeView] Cleanup error:', err);
      }
    })();
  };

  // Debounced search for the picker
  useEffect(() => {
    if (!showSongPicker) return;

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = setTimeout(() => {
        setIsPickerLoading(true);
        loadLibraryData(profile?.zone || 'global', 100, false, pickerSearch).finally(() => {
          setIsPickerLoading(false);
        });
    }, 500);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    }
  }, [pickerSearch, showSongPicker]);

  const progress = songDuration > 0 ? (player.currentTime / songDuration) * 100 : 0;

  const getCurrentLyric = () => songLyrics[currentLine]?.text || '♪ ♪ ♪';
  const getNextLyric = () => songLyrics[currentLine + 1]?.text || '';

  return (
    <div className="fixed inset-0 z-50 bg-[#0f0814] flex flex-col overflow-hidden text-white font-sans selection:bg-pink-500/30">
      {/* Background with Cinematic Depth */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {currentSong?.albumArt ? (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30 blur-[100px] scale-150 transition-all duration-1000"
            style={{ backgroundImage: `url('${currentSong.albumArt}')` }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-violet-900/40 via-purple-900/40 to-pink-900/40 opacity-40 blur-[100px]" />
        )}
        <div className="absolute inset-0 bg-[#0f0814]/90" />
        {/* Dynamic Mesh Gradient Overlay */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_-20%,#8b5cf6,transparent_50%),radial-gradient(circle_at_0%_100%,#ec4899,transparent_50%),radial-gradient(circle_at_100%_100%,#6366f1,transparent_50%)]" />
      </div>

      {/* Header - Glassmorphism */}
      <header className="relative z-20 flex items-center justify-between px-6 py-4 md:px-10 md:py-8 border-b border-white/5 backdrop-blur-md bg-white/[0.02]">
        <button
          onClick={handleClose}
          className="group flex size-11 items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/10 hover:border-white/20 active:scale-95"
        >
          {/* Modern down-chevron instead of X */}
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:text-pink-400 transition-colors">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>

        <div className="flex flex-col items-center flex-1 mx-4 max-w-full">
          <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-pink-500 mb-1 drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]">
            Karaoke Live
          </span>
          <h2 className="text-xl md:text-2xl font-black leading-none tracking-tight text-center truncate w-full max-w-[200px] md:max-w-xl text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70">
            {songTitle}
          </h2>
          <p className="text-white/40 text-[10px] md:text-xs font-bold tracking-widest uppercase mt-1">{songArtist}</p>
        </div>

        <button
          onClick={() => {
            setShowSongPicker(true);
            if (state.libraryData.songs.length === 0) {
              setIsPickerLoading(true);
              loadLibraryData(profile?.zone || 'global', 100).finally(() => {
                setIsPickerLoading(false);
              });
            }
          }}
          className="flex size-11 items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/10 hover:border-white/20 active:scale-95"
          title="Change Song"
        >
          <Music size={22} className="text-white/80 transition-colors" />
        </button>
      </header>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col min-h-0 overflow-hidden">

        {/* The Stage: Lyrics & Feedback */}
        <div className="flex-1 flex flex-col justify-center relative overflow-hidden px-4 md:px-6 lg:px-12 py-10">

          {/* No Song / Loading States */}
          {!hasSong ? (
            <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-violet-600 blur-2xl opacity-20 animate-pulse" />
                <Mic size={64} md-size={80} className="text-white/10 relative z-10" />
              </div>
              <p className="text-white/40 font-bold uppercase tracking-widest text-xs md:text-sm mb-8 text-center px-4">No Session Active</p>
              <button
                onClick={() => {
                  setShowSongPicker(true);
                  if (state.libraryData.songs.length === 0) {
                    setIsPickerLoading(true);
                    loadLibraryData(profile?.zone || 'global', 100).finally(() => {
                      setIsPickerLoading(false);
                    });
                  }
                }}
                className="px-8 md:px-10 py-4 md:py-5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs md:text-sm shadow-2xl shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 border border-white/10"
              >
                Browse songs
              </button>
            </div>
          ) : lyricsLoading ? (
            <div className="flex flex-col items-center">
              <CustomLoader message="" />
              <p className="text-violet-400 font-black uppercase tracking-widest text-xs mt-8 animate-pulse text-center">Loading synchronized lyrics...</p>
            </div>
          ) : (
            <div className="w-full max-w-5xl mx-auto flex flex-col items-center justify-center h-full">

              {/* Warnings / Errors */}
              {!hasSyncedLyrics && lyricsError && (
                <div className="absolute top-0 left-0 right-0 flex justify-center z-20">
                  <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] md:text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-md">
                    <AlertCircle size={14} />
                    <span>{lyricsError}</span>
                  </div>
                </div>
              )}

              {/* Standard Karaoke 2-Line Display - Compact & Precise */}
              <div className="relative py-8 md:py-16 w-full flex flex-col items-center justify-center px-4 flex-1">

                {/* Clean Background (No Waveform) */}
                <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none -z-10">
                  <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-[#0f0814] to-transparent" />
                </div>

                <div className="w-full flex flex-col gap-6 md:gap-10 items-center">
                  {/* Current Line (Highlighted) */}
                  <div className="relative group text-center w-full px-4 md:px-12">

                    {/* The Single Animated Text Node */}
                    <h1
                      className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[1.3] text-center tracking-tight transition-all pb-2 break-words"
                      style={{
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        color: 'transparent',
                        backgroundImage: `linear-gradient(to right, #ec4899 0%, #a855f7 ${songDuration ? Math.min(100, Math.max(0, ((player.currentTime - (songLyrics[currentLine]?.time || 0)) / ((songLyrics[currentLine + 1]?.time || songDuration) - (songLyrics[currentLine]?.time || 0))) * 100)) : 0}%, rgba(255,255,255,0.3) ${songDuration ? Math.min(100, Math.max(0, ((player.currentTime - (songLyrics[currentLine]?.time || 0)) / ((songLyrics[currentLine + 1]?.time || songDuration) - (songLyrics[currentLine]?.time || 0))) * 100)) : 0}%, rgba(255,255,255,0.3) 100%)`
                      }}
                    >
                      {getCurrentLyric()}
                    </h1>
                  </div>

                  {/* Next Line (Upcoming) */}
                  <div className="relative text-center z-10 w-full opacity-50 transition-all duration-500 px-4">
                    <h2 className="text-xl sm:text-2xl md:text-4xl font-extrabold leading-snug tracking-normal text-center select-none text-white/90 drop-shadow-md">
                      {getNextLyric()}
                    </h2>
                  </div>
                </div>

                {/* Pitch Gauge Integration */}
                <div className="mt-12 w-full max-w-[180px] md:max-w-[240px] flex flex-col items-center gap-3">
                  <div className="relative w-full h-1 md:h-1.5 bg-white/10 rounded-full border border-white/5 overflow-hidden">
                    <div className="absolute left-1/2 top-0 bottom-0 w-[1px] md:w-[2px] bg-white/30 -translate-x-1/2 z-20 shadow-[0_0_5px_white]" />
                    <div
                      className={`absolute top-0 bottom-0 w-3 md:w-4 transition-all duration-100 ease-out z-10 rounded-full
                        ${isMicActive ? 'bg-pink-500 shadow-[0_0_15px_#ec4899,0_0_5px_white]' : 'bg-white/20'}`}
                      style={{ left: `${pitchPosition}%`, transform: 'translateX(-50%)' }}
                    />
                    {/* Perfect Zone Hint */}
                    <div className="absolute inset-y-0 left-[42%] right-[42%] bg-emerald-500/20 -z-10" />
                  </div>

                  <div className="flex items-center justify-center gap-4 md:gap-6 h-6">
                    {isMicActive ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-pink-400">Match</span>
                        <span className="text-xs font-black tabular-nums text-white">{Math.round(pitchAccuracy)}%</span>
                      </div>
                    ) : (
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Mic Off</p>
                    )}

                    {showRating && (
                      <div className="absolute flex items-center gap-1.5 animate-in slide-in-from-bottom-2 zoom-in duration-300 fill-mode-both ml-32">
                        <div className="size-4 rounded-full bg-yellow-400 flex items-center justify-center">
                          <Star size={10} className="text-black" fill="currentColor" />
                        </div>
                        <span className="text-yellow-400 font-black text-[10px] tracking-widest uppercase italic drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]">
                          {currentRating}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Global Control Station - Compact Footer Design */}
        <footer className="relative z-30 pb-6 md:pb-12 pt-4 px-4 md:px-6 w-full max-w-2xl mx-auto flex flex-col items-center mb-6 md:mb-0">

          <div className="w-full bg-[#1b1224]/90 backdrop-blur-3xl border border-white/10 rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-6 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)] flex flex-col gap-4 md:gap-6">

            {/* Elegant Progress/Timeline */}
            <div className="px-1 md:px-2">
              <div
                className="relative h-1 md:h-1.5 w-full bg-white/5 rounded-full cursor-pointer group mb-2 md:mb-3 hover:bg-white/10 transition-colors"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const percent = (e.clientX - rect.left) / rect.width;
                  seek(percent * songDuration);
                }}
              >
                {/* Visual Buffer / Progress */}
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-violet-600 to-pink-600 rounded-full shadow-[0_0_15px_rgba(236,72,153,0.5)]"
                  style={{ width: `${progress}%` }}
                />
                {/* Animated scrubber head */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 size-3 md:size-4 bg-white border-2 md:border-[3px] border-pink-500 rounded-full shadow-lg opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity translate-x-[-50%]"
                  style={{ left: `${progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] text-white/30 tabular-nums">
                <span className="text-violet-400">{formatTime(player.currentTime)}</span>
                <span>{formatTime(songDuration)}</span>
              </div>
            </div>

            {/* Tactical Control Layout */}
            <div className="flex items-center justify-between px-1 md:px-2">
              <button
                onClick={() => {
                  setShowSongPicker(true);
                  if (state.libraryData.songs.length === 0) {
                    setIsPickerLoading(true);
                    loadLibraryData(profile?.zone || 'global', 50).finally(() => {
                      setIsPickerLoading(false);
                    });
                  }
                }}
                className="group flex flex-col items-center gap-1 md:gap-1.5 transition-all text-white/40 hover:text-white"
              >
                <div className="p-2 md:p-2.5 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors active:scale-95">
                  <Maximize size={16} className="md:w-[18px] md:h-[18px]" />
                </div>
                <span className="text-[8px] md:text-[9px] font-black uppercase tracking-wider">Browse</span>
              </button>

              <div className="flex items-center gap-3 md:gap-6">
                <button
                  onClick={skipBack}
                  className="size-10 md:size-12 flex items-center justify-center rounded-[1rem] md:rounded-[1.25rem] bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-all border border-white/5 active:scale-90"
                >
                  <RotateCcw size={18} className="md:w-[20px] md:h-[20px]" />
                </button>

                <button
                  onClick={handlePlayPause}
                  className={`size-14 md:size-20 flex items-center justify-center rounded-3xl md:rounded-[2rem] transition-all transform active:scale-90 shadow-2xl
                    ${player.isPlaying
                      ? 'bg-white text-[#191022] hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.2)]'
                      : 'bg-violet-600 text-white hover:bg-violet-500 shadow-violet-600/40'}`}
                >
                  {player.isPlaying ? (
                    <Pause size={24} className="md:w-[32px] md:h-[32px]" fill="currentColor" />
                  ) : (
                    <Play size={24} className="md:w-[32px] md:h-[32px] ml-1 md:ml-1.5" fill="currentColor" />
                  )}
                </button>

                <button
                  onClick={skipForward}
                  className="size-10 md:size-12 flex items-center justify-center rounded-[1rem] md:rounded-[1.25rem] bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-all border border-white/5 active:scale-90"
                >
                  <RotateCw size={18} className="md:w-[20px] md:h-[20px]" />
                </button>
              </div>

              {/* Mic Toggle Switch Design */}
              <button
                onClick={toggleMic}
                className={`group flex flex-col items-center gap-1 md:gap-1.5 transition-all
                  ${isMicActive ? 'text-pink-500' : 'text-white/40 hover:text-white'}`}
              >
                <div className={`p-2 md:p-2.5 rounded-xl transition-all border active:scale-95
                  ${isMicActive
                    ? 'bg-pink-500/10 border-pink-500/30 shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                    : 'bg-white/5 border-white/5 group-hover:bg-white/10'}`}>
                  {isMicActive ? <Mic size={16} className="md:w-[18px] md:h-[18px]" /> : <MicOff size={16} className="md:w-[18px] md:h-[18px]" />}
                </div>
                <span className="text-[8px] md:text-[9px] font-black uppercase tracking-wider">{isMicActive ? 'On Air' : 'Muted'}</span>
              </button>
            </div>
          </div>
        </footer>
        {/* Song Picker Bottom Sheet - Refined Design */}
        <div
          className={`fixed inset-0 z-[100] bg-black/80 backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${showSongPicker ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setShowSongPicker(false)}
        >
          <div
            className={`absolute bottom-0 left-0 right-0 bg-gradient-to-b from-[#1b1224] to-[#0f0814] rounded-t-[2.5rem] p-6 pt-4 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col shadow-[0_-20px_50px_rgba(0,0,0,0.5)] border-t border-white/5 ${showSongPicker ? 'translate-y-0' : 'translate-y-full'}`}
            style={{ height: '75vh' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Elegant Drag Handle Indicator */}
            <div className="w-full flex justify-center mb-6 shrink-0 cursor-pointer" onClick={() => setShowSongPicker(false)}>
              <div className="w-16 h-1.5 bg-white/20 rounded-full hover:bg-white/40 transition-colors" />
            </div>

            <div className="flex items-center justify-between mb-4 shrink-0 px-2">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">AudioLab Library</h2>
                <p className="text-xs text-white/40 uppercase tracking-widest font-bold mt-1">Select a track to practice</p>
              </div>
            </div>

            {/* Search Input for Song Picker */}
            <div className="px-2 mb-6 shrink-0">
               <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Search size={18} className="text-white/20 group-focus-within:text-pink-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search songs, artists, or lyrics..."
                    value={pickerSearch}
                    onChange={(e) => setPickerSearch(e.target.value)}
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 text-white text-sm font-bold placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all"
                  />
                  {pickerSearch && (
                    <button 
                      onClick={() => setPickerSearch('')}
                      className="absolute inset-y-0 right-4 flex items-center text-white/20 hover:text-white transition-colors"
                    >
                      <X size={18} />
                    </button>
                  )}
               </div>
            </div>

            <div className="overflow-y-auto flex-1 pb-10 space-y-4 relative rounded-xl pr-2 custom-scrollbar">
              {isPickerLoading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <CustomLoader message="" />
                  <p className="text-violet-400 font-bold uppercase tracking-widest text-[10px] md:text-xs mt-6 animate-pulse">Syncing Master Library...</p>
                </div>
              ) : state.libraryData.songs.length > 0 ? (
                state.libraryData.songs.map((song, idx) => (
                  <div key={song.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'both' }}>
                    <SimpleSongCard
                      song={song}
                      songNumber={idx + 1}
                      isPlaying={player.currentSong?.id === song.id}
                      isLoading={player.isLoading}
                      currentPart={player.currentPart}
                      currentTime={player.currentTime}
                      duration={player.duration}
                      onClick={() => {
                        playSong(song);
                        // Wait a brief moment for context to process the play request
                        // Then forcefully set the view back to karaoke just in case playSong navigated away
                        setTimeout(() => {
                          setView('karaoke');
                        }, 50);
                        setShowSongPicker(false);
                      }}
                      isHighlighted={player.currentSong?.id === song.id}
                    />
                  </div>
                ))
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white/40">
                  <div className="size-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                    <Music size={24} className="text-white/20" />
                  </div>
                  <p className="font-bold text-sm tracking-widest uppercase text-white/60">Library Empty</p>
                  <p className="text-xs mt-2 text-white/30 text-center max-w-[250px]">Songs added to the AudioLab Master Library will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
