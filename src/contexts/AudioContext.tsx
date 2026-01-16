"use client";

import React, { createContext, useContext, useRef, useState, useEffect, ReactNode } from "react";
import { PraiseNightSong } from "@/types/supabase";

interface AudioContextType {
  currentSong: PraiseNightSong | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isLoading: boolean;
  hasError: boolean;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  setCurrentSong: (song: PraiseNightSong | null, autoPlay?: boolean) => void;
  togglePlayPause: () => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [currentSong, setCurrentSong] = useState<PraiseNightSong | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isToggling, setIsToggling] = useState(false);

  // Audio persistence keys
  const AUDIO_STATE_KEY = 'loveworld_audio_state';
  const AUDIO_TIME_KEY = 'loveworld_audio_time';
  const AUDIO_SONG_KEY = 'loveworld_audio_song';

  const togglePlayPause = () => {
    // Prevent rapid clicking
    if (isToggling) {
      return;
    }

    setIsToggling(true);
    setTimeout(() => setIsToggling(false), 300); // 300ms debounce


    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
                if (!audioRef.current.src || audioRef.current.src === '') {
          console.warn('No audio source set. Cannot play audio.');
          return;
        }


        // Use a promise to handle play() properly
        const playPromise = audioRef.current.play();

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
            })
            .catch((error) => {
              console.error('❌ Error playing audio:', error);
              console.error('Audio source:', audioRef.current?.src);
              console.error('Current song:', currentSong?.title);
              console.error('Audio file URL:', currentSong?.audioFile);
              // Reset playing state if play failed
              setIsPlaying(false);
            });
        }
      }
    }
  };

  const play = () => {
    if (audioRef.current && currentSong?.audioFile && currentSong.audioFile.trim() !== '') {
            if (audioRef.current.readyState >= 2) { // HAVE_CURRENT_DATA or higher
        audioRef.current.play().catch((error) => {
          console.error('Error playing audio:', error);
        });
      } else {
        // Wait for audio to be ready
        const handleCanPlay = () => {
          if (audioRef.current) {
            audioRef.current.play().catch((error) => {
              console.error('Error playing audio after waiting:', error);
            });
            audioRef.current.removeEventListener('canplay', handleCanPlay);
          }
        };
        audioRef.current.addEventListener('canplay', handleCanPlay);
      }
    } else {
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      // Save current time for persistence
      localStorage.setItem(AUDIO_TIME_KEY, audioRef.current.currentTime.toString());
    }
  };

  // Save audio state to localStorage (only when playing for a while)
  const saveAudioState = () => {
    if (currentSong && isPlaying && currentTime > 5) { // Only save if playing for more than 5 seconds
      localStorage.setItem(AUDIO_STATE_KEY, isPlaying.toString());
      localStorage.setItem(AUDIO_SONG_KEY, JSON.stringify({
        id: currentSong.id,
        title: currentSong.title,
        audioFile: currentSong.audioFile,
        mediaId: currentSong.mediaId,
        duration: duration // Save duration for validation
      }));
      localStorage.setItem('audio_timestamp', Date.now().toString());
    }
  };

  // Restore audio state from localStorage (only if song was playing and very recent)
  const restoreAudioState = () => {
    try {
      const savedSong = localStorage.getItem(AUDIO_SONG_KEY);
      const savedState = localStorage.getItem(AUDIO_STATE_KEY);
      const savedTime = localStorage.getItem(AUDIO_TIME_KEY);
      const savedTimestamp = localStorage.getItem('audio_timestamp');

      if (savedSong && savedState === 'true') { // Only restore if song was actually playing
        const songData = JSON.parse(savedSong);

                const savedTimeNum = savedTimestamp ? parseInt(savedTimestamp) : 0;
        const now = Date.now();
        const thirtyMinutesAgo = now - (30 * 60 * 1000);

        if (savedTimeNum < thirtyMinutesAgo) {
          clearAudioState();
          return;
        }

        // Only restore if the song has an audio file AND user was actively playing
        if (songData.audioFile && songData.audioFile.trim() !== '' && savedState === 'true') {

          // Set the song but don't auto-play initially
          setCurrentSong(songData);

          // Restore time if available
          if (savedTime) {
            const time = parseFloat(savedTime);
            if (!isNaN(time) && time > 0 && time < songData.duration) {
              setTimeout(() => {
                if (audioRef.current) {
                  audioRef.current.currentTime = time;
                  setCurrentTime(time);
                }
              }, 1000); // Wait for audio to load
            }
          }

          // Don't auto-play on app startup - this is not typical music player behavior
          // Users should manually start playback
        }
      }
    } catch (error) {
      console.error('Error restoring audio state:', error);
            clearAudioState();
    }
  };

    const clearAudioState = () => {
    localStorage.removeItem(AUDIO_SONG_KEY);
    localStorage.removeItem(AUDIO_STATE_KEY);
    localStorage.removeItem(AUDIO_TIME_KEY);
    localStorage.removeItem('audio_timestamp');
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setIsLoading(false);
      setHasError(false);
      // Auto-play if requested and audio is ready
      if (shouldAutoPlay && currentSong?.audioFile && currentSong.audioFile.trim() !== '') {
        audioRef.current.play().catch((error) => {
          console.error('Error auto-playing after load:', error);
          setHasError(true);
        });
        setShouldAutoPlay(false); // Reset auto-play flag
      }
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);

    // Dispatch custom event for repeat functionality
    const event = new CustomEvent('audioEnded', {
      detail: { song: currentSong }
    });
    window.dispatchEvent(event);
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleError = (e: any) => {
    // Only log errors if there's actually a source set
    if (audioRef.current?.src && audioRef.current.src !== window.location.href) {
      console.error('❌ Audio error details:', {
        error: e,
        currentSong: currentSong?.title,
        audioFile: currentSong?.audioFile,
        audioSrc: audioRef.current?.src,
        networkState: audioRef.current?.networkState,
        readyState: audioRef.current?.readyState
      });
      console.error('❌ Audio error code:', audioRef.current?.error?.code);
      console.error('❌ Audio error message:', audioRef.current?.error?.message);
    }

    setIsPlaying(false);
    setIsLoading(false);
    setHasError(true);
  };

  // Save audio state when it changes
  useEffect(() => {
    saveAudioState();
  }, [currentSong, isPlaying]);

  // Restore audio state on mount
  useEffect(() => {
    restoreAudioState();
  }, []);

    useEffect(() => {

    if (currentSong?.audioFile && audioRef.current && currentSong.audioFile.trim() !== '') {
      try {
                if (audioRef.current.src && audioRef.current.src === currentSong.audioFile) {
          return; // Don't reset audio state for the same song
        }

        // Additional check: if the audio is already playing and it's the same file, don't restart
        if (audioRef.current.src && audioRef.current.src === currentSong.audioFile && isPlaying) {
          return; // Don't restart the same song that's already playing
        }

        // Reset audio state only for new songs
        setCurrentTime(0);
        setDuration(0);
        setIsLoading(true);
        setHasError(false);

                if (currentSong.audioFile.startsWith('http') || currentSong.audioFile.startsWith('https')) {
          // Don't encode URLs that are already properly encoded (like Cloudinary URLs)
          const urlToUse = currentSong.audioFile;


          audioRef.current.src = urlToUse;
          audioRef.current.load();
        } else {
          console.warn('❌ Invalid audio file URL (not HTTP/HTTPS):', currentSong.audioFile);
          if (audioRef.current) {
            audioRef.current.src = '';
          }
          setIsLoading(false);
          setHasError(true);
        }
      } catch (error) {
        console.error('❌ Error loading audio file:', error);
        if (audioRef.current) {
          audioRef.current.src = '';
        }
        setIsLoading(false);
        setHasError(true);
      }
    } else if (audioRef.current) {
      audioRef.current.src = '';
      setCurrentTime(0);
      setDuration(0);
      setIsLoading(false);
      setHasError(false);
    }
  }, [currentSong]);

  const setCurrentSongWithAutoPlay = (song: PraiseNightSong | null, autoPlay: boolean = false) => {

        if (currentSong?.id === song?.id && isPlaying) {
      return; // Don't restart the same song - exit completely
    }

        if (currentSong?.id === song?.id && !isPlaying) {
      return; // Don't restart the same song - exit completely
    }


    // Stop current playback when changing songs
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setCurrentTime(0);
    }

    setCurrentSong(song);
    setShouldAutoPlay(autoPlay);
  };

  const setCurrentTimeManual = (time: number) => {
    if (audioRef.current && duration > 0) {
      const clampedTime = Math.max(0, Math.min(time, duration));
      audioRef.current.currentTime = clampedTime;
      setCurrentTime(clampedTime);
    }
  };

  const setDurationManual = (newDuration: number) => {
    setDuration(newDuration);
  };

  const value: AudioContextType = {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    isLoading,
    hasError,
    audioRef,
    setCurrentSong: setCurrentSongWithAutoPlay,
    togglePlayPause,
    play,
    pause,
    stop,
    setCurrentTime: setCurrentTimeManual,
    setDuration: setDurationManual,
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onPlay={handlePlay}
        onPause={handlePause}
        onError={handleError}
        preload="none"
        crossOrigin="anonymous"
      />
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
