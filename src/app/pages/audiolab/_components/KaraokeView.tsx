'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  X, Settings, Flame, Star, Play, Pause, 
  RotateCcw, RotateCw, Maximize, Mic, MicOff
} from 'lucide-react';
import { useAudioLab } from '../_context/AudioLabContext';
import { useAuth } from '@/hooks/useAuth';
import { audioEngine } from '../_lib/audio-engine';
import { endSession, startSession } from '../_lib/practice-service';

// Sample lyrics for demo (in real app, these come from song data)
const sampleLyrics = [
  { time: 0, text: "♪ Get ready to sing ♪", targetPitch: 440 },
  { time: 4, text: "Follow the melody", targetPitch: 494 },
  { time: 8, text: "Let your voice shine", targetPitch: 523 },
  { time: 12, text: "Feel the rhythm flow", targetPitch: 587 },
  { time: 16, text: "Sing from your heart", targetPitch: 659 },
  { time: 20, text: "Let the music guide you", targetPitch: 698 },
  { time: 24, text: "Every note matters", targetPitch: 784 },
  { time: 28, text: "You're doing great!", targetPitch: 880 },
];

export function KaraokeView() {
  const { goBack, formatTime, state, setView, togglePlay, seek, updatePracticeStats } = useAudioLab();
  const { user } = useAuth();
  const { player } = state;
  
  const currentSong = player.currentSong;
  const hasSong = !!currentSong;
  
  // Parse lyrics from song or use samples
  const songLyrics = currentSong?.lyricsUrl 
    ? sampleLyrics // TODO: Fetch and parse actual lyrics
    : sampleLyrics;
  
  const songTitle = currentSong?.title || 'Practice Mode';
  const songArtist = currentSong?.artist || 'AudioLab';
  const songDuration = currentSong?.duration || 60;
  
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
        
        // Calculate accuracy based on target pitch
        const targetPitch = songLyrics[currentLine]?.targetPitch || 440;
        const pitchDiff = Math.abs(data.pitch - targetPitch);
        const accuracy = Math.max(0, 100 - (pitchDiff / targetPitch) * 100);
        setPitchAccuracy(accuracy);
        
        // Update pitch position for visualization (0-100)
        const normalizedPitch = Math.max(30, Math.min(70, 50 + (data.pitch - targetPitch) / 10));
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

  // Update current lyric line based on playback time
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
    
    // Update practice stats in context
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
    <div className="fixed inset-0 z-50 bg-[#191022] flex flex-col overflow-hidden text-white">
      {/* Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {currentSong?.albumArt && (
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-20 blur-3xl scale-110"
            style={{ backgroundImage: `url('${currentSong.albumArt}')` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-violet-900/20 via-[#191022]/80 to-[#191022]" />
      </div>

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between p-4 md:p-6 lg:p-8 pt-6">
        <button 
          onClick={handleClose}
          className="flex size-10 md:size-12 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition backdrop-blur-sm"
        >
          <X size={20} />
        </button>
        <div className="flex flex-col items-center flex-1 mx-4">
          <h2 className="text-lg md:text-xl lg:text-2xl font-bold leading-tight tracking-tight text-center truncate w-full max-w-[200px] md:max-w-md lg:max-w-lg">
            {songTitle}
          </h2>
          <p className="text-white/60 text-xs md:text-sm font-medium tracking-wide">{songArtist}</p>
        </div>
        <button className="flex size-10 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition backdrop-blur-sm">
          <Settings size={20} />
        </button>
      </header>

      {/* Performance HUD */}
      <div className="relative z-20 px-4 md:px-6 lg:px-8 py-2">
        <div className="flex items-center justify-between">
          {/* Streak */}
          <div className="flex items-center gap-2 bg-[#4d3267]/40 border border-[#4d3267] backdrop-blur-md rounded-lg px-3 py-1.5">
            <Flame size={18} className={`${streak > 0 ? 'text-orange-400 animate-pulse' : 'text-orange-400/50'}`} fill="currentColor" />
            <div className="flex flex-col">
              <span className="text-white font-bold leading-none text-sm">{streak}x</span>
              <span className="text-[10px] text-[#ad92c9] uppercase tracking-wider font-bold">Streak</span>
            </div>
          </div>

          {/* Mic Status */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${isMicActive ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-white/5'}`}>
            {isMicActive ? (
              <>
                <div className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-xs font-bold">LIVE</span>
              </>
            ) : (
              <span className="text-slate-400 text-xs">Mic Off</span>
            )}
          </div>

          {/* Score */}
          <div className="flex flex-col items-end">
            <p className="text-white tracking-tight text-3xl font-bold leading-none drop-shadow-lg">
              {score.toLocaleString()}
            </p>
            <p className="text-[#ad92c9] text-xs font-medium uppercase tracking-widest mr-0.5">Score</p>
          </div>
        </div>
      </div>

      {/* No Song State */}
      {!hasSong && (
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
          <Mic size={48} className="text-slate-600 mb-4" />
          <p className="text-slate-400 text-sm mb-6">Select a song first</p>
          <button
            onClick={() => setView('library')}
            className="px-6 py-3 bg-violet-500 hover:bg-violet-600 text-white rounded-xl font-bold transition-colors"
          >
            Browse Songs
          </button>
        </div>
      )}

      {/* Lyrics Stage */}
      {hasSong && (
        <main 
          className="relative z-10 flex-1 w-full max-w-lg mx-auto flex flex-col items-center justify-center overflow-hidden py-8"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)'
          }}
        >
          {/* Past Lyric */}
          {getPastLyric() && (
            <div className="w-full text-center mb-6 opacity-30 scale-95 blur-[1px] select-none">
              <p className="text-white text-xl font-normal">{getPastLyric()}</p>
            </div>
          )}

          {/* Current Lyric */}
          <div className="w-full px-4 md:px-6 lg:px-8 py-6 relative">
            {/* Waveform Background */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-20 md:h-24 lg:h-28 flex items-center justify-center gap-1 opacity-30 pointer-events-none">
              {waveformBars.map((height, i) => (
                <div 
                  key={i}
                  className="w-2 md:w-3 bg-violet-500 rounded-full transition-all duration-150"
                  style={{ height: `${height * 4}px` }}
                />
              ))}
            </div>

            {/* Lyric Text */}
            <h1 
              className="text-white text-[32px] md:text-[48px] lg:text-[64px] font-bold leading-tight text-center relative z-10"
              style={{ textShadow: '0 0 20px rgba(139, 92, 246, 0.5)' }}
            >
              {getCurrentLyric()}
            </h1>

            {/* Pitch Accuracy Bar */}
            <div className="mt-6 flex flex-col items-center gap-2">
              <div className="h-2 w-56 bg-white/10 rounded-full overflow-hidden relative">
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/40 -translate-x-1/2 z-10" />
                <div 
                  className="absolute top-0 bottom-0 w-3 bg-violet-500 rounded-full transition-all duration-100"
                  style={{ 
                    left: `${pitchPosition}%`,
                    transform: 'translateX(-50%)',
                    boxShadow: isMicActive ? '0 0 10px #8b5cf6' : 'none'
                  }}
                />
              </div>
              
              {/* Accuracy Display */}
              {isMicActive && currentPitch && (
                <p className="text-violet-400 text-xs font-medium">
                  {Math.round(pitchAccuracy)}% accuracy
                </p>
              )}

              {/* Rating Popup */}
              {showRating && (
                <div className="flex items-center gap-1 animate-bounce">
                  <Star size={14} className="text-yellow-400" fill="currentColor" />
                  <span className="text-yellow-400 font-bold text-sm tracking-widest uppercase">
                    {currentRating}
                  </span>
                  <Star size={14} className="text-yellow-400" fill="currentColor" />
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Lyrics */}
          <div className="w-full text-center mt-6 space-y-4 opacity-30 scale-95 blur-[0.5px] select-none">
            {getUpcomingLyrics().map((lyric, i) => (
              <p key={i} className="text-white text-lg font-normal" style={{ opacity: 1 - i * 0.25 }}>
                {lyric.text}
              </p>
            ))}
          </div>
        </main>
      )}

      {/* Controls */}
      {hasSong && (
        <div className="relative z-30 pb-8 pt-2 px-6 w-full bg-gradient-to-t from-[#191022] via-[#191022] to-transparent">
          <div className="bg-[#2a1d35]/90 backdrop-blur-xl border border-white/10 rounded-[2rem] p-5 shadow-2xl max-w-md mx-auto">
            {/* Progress */}
            <div className="flex items-center gap-3 mb-5 px-1">
              <span className="text-[10px] font-bold text-[#ad92c9] tabular-nums">{formatTime(player.currentTime)}</span>
              <div 
                className="relative flex-1 h-1.5 bg-white/10 rounded-full cursor-pointer group"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const percent = (e.clientX - rect.left) / rect.width;
                  seek(percent * songDuration);
                }}
              >
                <div 
                  className="absolute top-0 left-0 h-full bg-violet-500 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-white/40 tabular-nums">{formatTime(songDuration)}</span>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-between">
              <button className="size-8 flex items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/10 transition">
                <Maximize size={20} />
              </button>

              <div className="flex items-center gap-3">
                <button 
                  onClick={skipBack}
                  className="size-10 flex items-center justify-center rounded-full text-white hover:text-violet-400 hover:bg-white/5 transition active:scale-95"
                >
                  <RotateCcw size={22} />
                </button>
                <button 
                  onClick={handlePlayPause}
                  className="size-14 flex items-center justify-center rounded-full bg-violet-500 text-white shadow-lg shadow-violet-500/40 hover:bg-violet-600 active:scale-90 transition"
                >
                  {player.isPlaying ? (
                    <Pause size={26} fill="currentColor" />
                  ) : (
                    <Play size={26} fill="currentColor" className="ml-1" />
                  )}
                </button>
                <button 
                  onClick={skipForward}
                  className="size-10 flex items-center justify-center rounded-full text-white hover:text-violet-400 hover:bg-white/5 transition active:scale-95"
                >
                  <RotateCw size={22} />
                </button>
              </div>

              {/* Mic Toggle */}
              <button 
                onClick={toggleMic}
                className={`size-8 flex items-center justify-center rounded-full transition ${
                  isMicActive 
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                    : 'text-white/50 hover:text-white hover:bg-white/10'
                }`}
              >
                {isMicActive ? <Mic size={20} /> : <MicOff size={20} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
