'use client';

import { useState, useEffect, useRef } from 'react';
import {
  X, Settings, Flame, Star, Play, Pause,
  RotateCcw, RotateCw, Maximize, Mic, MicOff, AlertCircle
} from 'lucide-react';
import CustomLoader from '@/components/CustomLoader';
import { useAudioLab } from '../_context/AudioLabContext';
import { useAuth } from '@/hooks/useAuth';
import { audioEngine } from '../_lib/audio-engine';
import { endSession, startSession } from '../_lib/practice-service';
import { getSongLyrics, parseAutoTimedLyrics, generateSyncedLyrics, saveLyricsToSong } from '../_lib/lyrics-service';

// Default lyrics when no lyrics available
const defaultLyrics = [
  { time: 0, text: "♪ No lyrics available ♪" },
  { time: 5, text: "Add lyrics in admin panel" },
  { time: 10, text: "or generate with AI sync" },
];

export function KaraokeView() {
  const { goBack, formatTime, state, setView, togglePlay, seek, updatePracticeStats } = useAudioLab();
  const { user } = useAuth();
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
        // First, try to get lyrics from Firestore
        if (currentSong.id) {
          const { lyrics, lyricsText, hasSyncedLyrics: synced } = await getSongLyrics(currentSong.id);

          if (lyrics && lyrics.length > 0 && synced) {
            // Use synced lyrics with timestamps
            setSongLyrics(lyrics.map(line => ({
              time: line.time,
              text: line.text,
              targetPitch: 440
            })));
            setHasSyncedLyrics(true);
            setLyricsLoading(false);
            return;
          }

          // If we have text but no sync, trigger auto-sync
          const audioUrl = (currentSong as any).audioUrls?.full || currentSong.audioUrl;
          if (lyricsText && audioUrl) {


            const syncResult = await generateSyncedLyrics(audioUrl, currentSong.id, lyricsText);

            if (syncResult.success && syncResult.lyrics) {
              setSongLyrics(syncResult.lyrics.map(line => ({
                time: line.time,
                text: line.text,
                targetPitch: 440
              })));
              setHasSyncedLyrics(true);

              // Persist globally for everyone else
              const isHQ = (currentSong as any).isHQSong;
              await saveLyricsToSong(currentSong.id, syncResult.lyrics, lyricsText, isHQ);

              setLyricsError(null);
              setLyricsLoading(false);
              return;
            } else {
              console.error('[KaraokeView] AI Sync failed:', syncResult.error);
              setLyricsError('AI Sync failed, using auto-timing');
            }
          }

          if (lyricsText) {
            // Fallback to auto-timing if sync failed
            const autoTimed = parseAutoTimedLyrics(lyricsText, songDuration);
            if (autoTimed.length > 0) {
              setSongLyrics(autoTimed.map(line => ({
                time: line.time,
                text: line.text,
                targetPitch: 440
              })));
              setHasSyncedLyrics(false);
              setLyricsLoading(false);
              return;
            }
          }
        }

        const songWithLyrics = currentSong as any;
        if (songWithLyrics.lyrics && Array.isArray(songWithLyrics.lyrics) && songWithLyrics.lyrics.length > 0) {
          // Use embedded lyrics directly
          setSongLyrics(songWithLyrics.lyrics.map((line: { time: number; text: string; pitch?: number }) => ({
            time: line.time,
            text: line.text,
            targetPitch: line.pitch || 440
          })));
          setHasSyncedLyrics(true);
          setLyricsLoading(false);
          return;
        }

        if (currentSong.lyricsUrl) {
          try {
            const response = await fetch(currentSong.lyricsUrl);
            if (response.ok) {
              const content = await response.text();

              // Detect if it's LRC format (has timestamps)
              if (content.includes('[') && /\[\d{2}:\d{2}/.test(content)) {
                const parsed = parseLRCLyrics(content);
                if (parsed.length > 0) {
                  setSongLyrics(parsed);
                  setHasSyncedLyrics(true);
                  setLyricsLoading(false);
                  return;
                }
              }

              // Fall back to plain text parsing with auto-timing
              const parsed = parseAutoTimedLyrics(content, songDuration);
              if (parsed.length > 0) {
                setSongLyrics(parsed.map(line => ({
                  time: line.time,
                  text: line.text,
                  targetPitch: 440
                })));
                setHasSyncedLyrics(false);
                setLyricsLoading(false);
                return;
              }
            }
          } catch (error) {
            console.error('[KaraokeView] Error loading lyrics from URL:', error);
          }
        }

        // No lyrics available - show placeholder
        setSongLyrics(defaultLyrics);
        setHasSyncedLyrics(false);
        setLyricsError('No lyrics found for this song');

      } catch (error) {
        console.error('[KaraokeView] Error loading lyrics:', error);
        setSongLyrics(defaultLyrics);
        setLyricsError('Failed to load lyrics');
      }

      setLyricsLoading(false);
    };

    loadLyrics();
  }, [currentSong, songDuration]);

  // Helper to parse LRC format
  const parseLRCLyrics = (lrcContent: string): { time: number; text: string; targetPitch?: number }[] => {
    const lines = lrcContent.split('\n');
    const lyrics: { time: number; text: string; targetPitch?: number }[] = [];

    for (const line of lines) {
      const match = line.match(/\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\](.*)/);
      if (match) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        const ms = match[3] ? parseInt(match[3].padEnd(3, '0'), 10) : 0;
        const text = match[4].trim();

        if (text) {
          const time = minutes * 60 + seconds + ms / 1000;
          lyrics.push({ time, text, targetPitch: 440 });
        }
      }
    }

    return lyrics.sort((a, b) => a.time - b.time);
  };

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

  const handleClose = async () => {
    // Stop mic if active
    if (isMicActive) {
      await audioEngine.stopRecording();
      setIsMicActive(false);
    }

    // Save session stats
    if (user?.uid && sessionId) {
      await endSession(sessionId, {
        score,
        accuracy: pitchAccuracy,
        streak,
        duration: player.currentTime
      });
    }

    updatePracticeStats({
      score,
      accuracy: pitchAccuracy,
      streak,
      sessionsCompleted: state.practiceStats.sessionsCompleted + 1
    });

    goBack();
  };

  const progress = songDuration > 0 ? (player.currentTime / songDuration) * 100 : 0;

  const getPastLyric = () => songLyrics[currentLine - 1]?.text || '';
  const getCurrentLyric = () => songLyrics[currentLine]?.text || '♪ ♪ ♪';
  const getUpcomingLyrics = () => songLyrics.slice(currentLine + 1, currentLine + 4);

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
          <X size={22} className="group-hover:text-pink-400 transition-colors" />
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

        <button className="flex size-11 items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/10 hover:border-white/20 active:scale-95">
          <Settings size={22} />
        </button>
      </header>

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 flex flex-col min-h-0 overflow-hidden">

        {/* Performance & Score HUD */}
        <div className="px-6 md:px-10 py-6 md:py-8 grid grid-cols-3 items-center">
          {/* Streak Indicator */}
          <div className="flex justify-start">
            <div className={`flex items-center gap-3 bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-2xl px-4 py-2.5 transition-all
              ${streak > 0 ? 'border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.15)] scale-105' : ''}`}>
              <div className={`p-1.5 rounded-lg ${streak > 0 ? 'bg-orange-500' : 'bg-white/5'}`}>
                <Flame size={18} className={`${streak > 0 ? 'text-white' : 'text-white/20'}`} fill="currentColor" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black leading-none">{streak}<span className="text-xs ml-0.5 text-white/50">x</span></span>
                <span className="text-[9px] text-white/40 uppercase font-black tracking-tighter">Streak</span>
              </div>
            </div>
          </div>

          {/* Center visualizer holder or branding */}
          <div className="flex justify-center">
            {isMicActive && (
              <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <div className="size-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-emerald-500 text-[10px] font-black tracking-widest uppercase">Recording</span>
              </div>
            )}
          </div>

          {/* Real-time Points */}
          <div className="flex flex-col items-end">
            <div className="text-4xl md:text-5xl font-black tracking-tighter tabular-nums drop-shadow-[0_0_30px_rgba(139,92,246,0.5)]">
              {score.toLocaleString()}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-violet-400 uppercase font-black tracking-[0.2em]">Live Points</span>
              <div className="size-1 rounded-full bg-violet-500 animate-pulse" />
            </div>
          </div>
        </div>

        {/* The Stage: Lyrics & Feedback */}
        <div className="flex-1 flex flex-col justify-center relative overflow-hidden px-6 lg:px-12 py-10">

          {/* No Song / Loading States */}
          {!hasSong ? (
            <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-violet-600 blur-2xl opacity-20 animate-pulse" />
                <Mic size={80} className="text-white/10 relative z-10" />
              </div>
              <p className="text-white/40 font-bold uppercase tracking-widest text-sm mb-8">No Session Active</p>
              <button onClick={() => setView('library')} className="px-10 py-5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 border border-white/10">Browse songs</button>
            </div>
          ) : lyricsLoading ? (
            <div className="flex flex-col items-center">
              <CustomLoader message="" />
              <p className="text-violet-400 font-black uppercase tracking-widest text-xs mt-8 animate-pulse">Syncing Cinematic Experience...</p>
            </div>
          ) : (
            <div className="w-full max-w-4xl mx-auto flex flex-col items-center prose prose-invert">
              {/* Past Line (Ghost) */}
              <div className="h-16 flex items-center justify-center opacity-10 transition-all duration-700 select-none scale-75 blur-[2px]">
                <p className="text-xl md:text-2xl font-bold text-center tracking-tight leading-none italic">{getPastLyric()}</p>
              </div>

              {/* Current Cinematic Lyric */}
              <div className="relative py-12 md:py-16 w-full flex flex-col items-center">
                {/* Visualizer Background */}
                <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-10 pointer-events-none -z-10 overflow-visible">
                  {waveformBars.map((h, i) => (
                    <div key={i} className="w-4 md:w-6 bg-violet-500 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(139,92,246,0.3)]" style={{ height: `${h * 15}px`, opacity: 0.1 + (i / waveformBars.length) * 0.3 }} />
                  ))}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0f0814] via-transparent to-[#0f0814]" />
                </div>

                <div className="relative group text-center px-4">
                  <h1 className="text-[40px] md:text-[72px] lg:text-[96px] font-black leading-[0.95] tracking-[-0.04em] text-center transition-all duration-500 select-none drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                    {getCurrentLyric()}
                  </h1>
                  {/* Highlight/Glow current word if synced (simulated) */}
                  <div className="absolute -inset-4 bg-violet-500/5 blur-3xl rounded-full -z-10 group-hover:bg-violet-500/10 transition-colors" />
                </div>

                {/* Pitch Gauge Integration */}
                <div className="mt-12 md:mt-16 w-full max-w-sm flex flex-col items-center gap-4">
                  <div className="relative w-full h-2.5 bg-white/5 rounded-full border border-white/5 overflow-hidden">
                    <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/20 -translate-x-1/2 z-20 shadow-[0_0_5px_white]" />
                    <div
                      className={`absolute top-0 bottom-0 w-4 transition-all duration-100 ease-out z-10
                        ${isMicActive ? 'bg-pink-500 shadow-[0_0_15px_#ec4899,0_0_5px_white]' : 'bg-white/20'}`}
                      style={{ left: `${pitchPosition}%`, transform: 'translateX(-50%)' }}
                    />
                    {/* Perfect Zone Hint */}
                    <div className="absolute inset-y-0 left-[45%] right-[45%] bg-emerald-500/10 -z-10" />
                  </div>

                  <div className="flex items-center gap-6 h-8">
                    {isMicActive ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-pink-400">Accuracy</span>
                        <span className="text-xs font-black tabular-nums">{Math.round(pitchAccuracy)}%</span>
                      </div>
                    ) : (
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Mic Disconnected</p>
                    )}

                    {showRating && (
                      <div className="flex items-center gap-2 animate-in slide-in-from-bottom-2 duration-300 fill-mode-both">
                        <div className="size-5 rounded-full bg-yellow-400 flex items-center justify-center">
                          <Star size={12} className="text-black" fill="currentColor" />
                        </div>
                        <span className="text-yellow-400 font-black text-xs tracking-widest uppercase italic drop-shadow-[0_0_10px_rgba(250,204,21,0.4)]">
                          {currentRating}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Upcoming Queue */}
              <div className="flex flex-col gap-4 opacity-30 transition-all duration-700 select-none transform hover:opacity-100 group/queue">
                {getUpcomingLyrics().map((lyric, i) => (
                  <p key={i} className={`text-lg md:text-xl font-black text-center tracking-tight leading-none transition-all duration-500 ${i === 0 ? 'text-white/80' : 'text-white/40'}`} style={{ transform: `scale(${1 - i * 0.1}) translateY(${i * 4}px)` }}>
                    {lyric.text}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Global Control Station - Compact Footer Design */}
        <footer className="relative z-30 pb-10 md:pb-12 pt-4 px-6 w-full max-w-2xl mx-auto flex flex-col items-center">

          <div className="w-full bg-[#1b1224]/80 backdrop-blur-[32px] border border-white/10 rounded-[2.5rem] p-6 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] flex flex-col gap-6">

            {/* Elegant Progress/Timeline */}
            <div className="px-2">
              <div
                className="relative h-1.5 w-full bg-white/5 rounded-full cursor-pointer group mb-2"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const percent = (e.clientX - rect.left) / rect.width;
                  seek(percent * songDuration);
                }}
              >
                {/* Visual Buffer / Progress */}
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-violet-600 to-pink-600 rounded-full shadow-[0_0_15px_rgba(139,92,246,0.4)]"
                  style={{ width: `${progress}%` }}
                />
                {/* Animated scrubber head */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 size-4 bg-white border-[3px] border-violet-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-50%]"
                  style={{ left: `${progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.15em] text-white/30 tabular-nums">
                <span className="text-violet-400">{formatTime(player.currentTime)}</span>
                <span>{formatTime(songDuration)}</span>
              </div>
            </div>

            {/* Tactical Control Layout */}
            <div className="flex items-center justify-between px-2">
              <button
                onClick={() => setView('library')}
                className="group flex flex-col items-center gap-1.5 transition-all text-white/30 hover:text-white"
              >
                <div className="p-2 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors">
                  <Maximize size={18} />
                </div>
                <span className="text-[8px] font-black uppercase">Browse</span>
              </button>

              <div className="flex items-center gap-4 md:gap-6">
                <button
                  onClick={skipBack}
                  className="size-11 flex items-center justify-center rounded-2xl bg-white/[0.03] text-white/60 hover:text-white hover:bg-white/[0.08] transition-all border border-white/5 active:scale-90"
                >
                  <RotateCcw size={20} />
                </button>

                <button
                  onClick={handlePlayPause}
                  className={`size-16 md:size-20 flex items-center justify-center rounded-[2rem] transition-all transform active:scale-90 shadow-2xl
                    ${player.isPlaying
                      ? 'bg-white text-[#191022] hover:scale-105'
                      : 'bg-violet-600 text-white hover:bg-violet-500 shadow-violet-600/30'}`}
                >
                  {player.isPlaying ? (
                    <Pause size={32} fill="currentColor" />
                  ) : (
                    <Play size={32} fill="currentColor" className="ml-1.5" />
                  )}
                </button>

                <button
                  onClick={skipForward}
                  className="size-11 flex items-center justify-center rounded-2xl bg-white/[0.03] text-white/60 hover:text-white hover:bg-white/[0.08] transition-all border border-white/5 active:scale-90"
                >
                  <RotateCw size={20} />
                </button>
              </div>

              {/* Mic Toggle Switch Design */}
              <button
                onClick={toggleMic}
                className={`group flex flex-col items-center gap-1.5 transition-all
                  ${isMicActive ? 'text-pink-500' : 'text-white/30 hover:text-white'}`}
              >
                <div className={`p-2 rounded-xl transition-all border
                  ${isMicActive
                    ? 'bg-pink-500/10 border-pink-500/30 shadow-[0_0_15px_rgba(236,72,153,0.2)]'
                    : 'bg-white/5 border-white/5 group-hover:bg-white/10'}`}>
                  {isMicActive ? <Mic size={18} /> : <MicOff size={18} />}
                </div>
                <span className="text-[8px] font-black uppercase">{isMicActive ? 'On Air' : 'Muted'}</span>
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
