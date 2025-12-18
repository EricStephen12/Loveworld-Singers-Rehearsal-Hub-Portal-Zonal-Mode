'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import { audioEngine } from '../_lib/audio-engine';
import { toLeagcySong } from '../_lib/song-service';
import type { 
  Song, 
  AudioLabSong,
  PlayerState, 
  RepeatMode, 
  ViewType, 
  PracticeStats,
  VocalPart,
  AudioUrls,
  PitchData
} from '../_types';

// ============================================
// STATE TYPES
// ============================================

interface SessionState {
  currentSession: {
    id: string;
    code: string;
    title: string;
  } | null;
}

interface AudioLabState {
  // Navigation
  currentView: ViewType;
  previousView: ViewType | null;
  
  // Player
  player: PlayerState;
  isPlayerVisible: boolean;
  isFullScreenPlayer: boolean;
  
  // Practice
  practiceStats: PracticeStats;
  
  // Session (for live collaboration)
  session: SessionState;
  
  // Studio - current project being edited
  currentProjectId: string | null;
  
  // Audio Engine
  isAudioInitialized: boolean;
  isRecording: boolean;
  inputLevel: number;
  currentPitch: PitchData | null;
  
  // UI
  isLoading: boolean;
  error: string | null;
}

// ============================================
// ACTIONS
// ============================================

type AudioLabAction =
  | { type: 'SET_VIEW'; payload: ViewType }
  | { type: 'GO_BACK' }
  | { type: 'PLAY_SONG'; payload: Song }
  | { type: 'SET_CURRENT_PART'; payload: VocalPart }
  | { type: 'TOGGLE_PLAY' }
  | { type: 'PAUSE' }
  | { type: 'SEEK'; payload: number }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'TOGGLE_MUTE' }
  | { type: 'TOGGLE_SHUFFLE' }
  | { type: 'SET_REPEAT'; payload: RepeatMode }
  | { type: 'TOGGLE_REPEAT' }
  | { type: 'UPDATE_TIME'; payload: number }
  | { type: 'SET_DURATION'; payload: number }
  | { type: 'SONG_ENDED' }
  | { type: 'HIDE_PLAYER' }
  | { type: 'SHOW_FULLSCREEN_PLAYER' }
  | { type: 'HIDE_FULLSCREEN_PLAYER' }
  | { type: 'UPDATE_PRACTICE_STATS'; payload: Partial<PracticeStats> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_AUDIO_INITIALIZED'; payload: boolean }
  | { type: 'SET_RECORDING'; payload: boolean }
  | { type: 'SET_INPUT_LEVEL'; payload: number }
  | { type: 'SET_PITCH'; payload: PitchData | null }
  | { type: 'SET_SESSION'; payload: SessionState['currentSession'] }
  | { type: 'CLEAR_SESSION' }
  | { type: 'SET_PROJECT'; payload: string | null };

// ============================================
// INITIAL STATE
// ============================================

const initialState: AudioLabState = {
  currentView: 'home',  // Start at home - single CTA entry point
  previousView: null,
  player: {
    currentSong: null,
    currentPart: 'full',
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.8,
    isMuted: false,
    isShuffled: false,
    repeatMode: 'off',
    isLoading: false,
  },
  isPlayerVisible: false,
  isFullScreenPlayer: false,
  practiceStats: {
    score: 0,
    accuracy: 0,
    streak: 0,
    hitRate: 0,
    sessionsCompleted: 0,
    weeklyProgress: 0,
  },
  session: {
    currentSession: null,
  },
  currentProjectId: null,
  isAudioInitialized: false,
  isRecording: false,
  inputLevel: 0,
  currentPitch: null,
  isLoading: false,
  error: null,
};

// ============================================
// REDUCER
// ============================================

function audioLabReducer(state: AudioLabState, action: AudioLabAction): AudioLabState {
  switch (action.type) {
    case 'SET_VIEW':
      return {
        ...state,
        previousView: state.currentView,
        currentView: action.payload,
      };
    
    case 'GO_BACK':
      return {
        ...state,
        currentView: state.previousView || 'library',
        previousView: null,
      };
    
    case 'PLAY_SONG':
      return {
        ...state,
        player: {
          ...state.player,
          currentSong: action.payload,
          currentPart: 'full',
          isPlaying: true,
          currentTime: 0,
          duration: action.payload.duration,
          isLoading: true,
        },
        isPlayerVisible: true,
      };
    
    case 'SET_CURRENT_PART':
      return {
        ...state,
        player: { ...state.player, currentPart: action.payload },
      };
    
    case 'TOGGLE_PLAY':
      return {
        ...state,
        player: { ...state.player, isPlaying: !state.player.isPlaying },
      };
    
    case 'PAUSE':
      return {
        ...state,
        player: { ...state.player, isPlaying: false },
      };
    
    case 'SEEK':
      return {
        ...state,
        player: { ...state.player, currentTime: action.payload },
      };
    
    case 'SET_VOLUME':
      return {
        ...state,
        player: { ...state.player, volume: action.payload, isMuted: action.payload === 0 },
      };
    
    case 'TOGGLE_MUTE':
      return {
        ...state,
        player: { ...state.player, isMuted: !state.player.isMuted },
      };
    
    case 'TOGGLE_SHUFFLE':
      return {
        ...state,
        player: { ...state.player, isShuffled: !state.player.isShuffled },
      };
    
    case 'SET_REPEAT':
      return {
        ...state,
        player: { ...state.player, repeatMode: action.payload },
      };
    
    case 'TOGGLE_REPEAT': {
      const modes: RepeatMode[] = ['off', 'all', 'one'];
      const currentIndex = modes.indexOf(state.player.repeatMode);
      const nextMode = modes[(currentIndex + 1) % modes.length];
      return {
        ...state,
        player: { ...state.player, repeatMode: nextMode },
      };
    }
    
    case 'UPDATE_TIME':
      return {
        ...state,
        player: { ...state.player, currentTime: action.payload },
      };
    
    case 'SET_DURATION':
      return {
        ...state,
        player: { ...state.player, duration: action.payload, isLoading: false },
      };
    
    case 'SONG_ENDED':
      if (state.player.repeatMode === 'one') {
        return {
          ...state,
          player: { ...state.player, currentTime: 0, isPlaying: true },
        };
      }
      return {
        ...state,
        player: { 
          ...state.player, 
          isPlaying: state.player.repeatMode === 'all',
          currentTime: 0,
        },
      };
    
    case 'HIDE_PLAYER':
      return {
        ...state,
        isPlayerVisible: false,
        player: { ...state.player, isPlaying: false },
      };
    
    case 'SHOW_FULLSCREEN_PLAYER':
      return { ...state, isFullScreenPlayer: true };
    
    case 'HIDE_FULLSCREEN_PLAYER':
      return { ...state, isFullScreenPlayer: false };
    
    case 'UPDATE_PRACTICE_STATS':
      return {
        ...state,
        practiceStats: { ...state.practiceStats, ...action.payload },
      };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_AUDIO_INITIALIZED':
      return { ...state, isAudioInitialized: action.payload };
    
    case 'SET_RECORDING':
      return { ...state, isRecording: action.payload };
    
    case 'SET_INPUT_LEVEL':
      return { ...state, inputLevel: action.payload };
    
    case 'SET_PITCH':
      return { ...state, currentPitch: action.payload };
    
    case 'SET_SESSION':
      return { 
        ...state, 
        session: { currentSession: action.payload } 
      };
    
    case 'CLEAR_SESSION':
      return { 
        ...state, 
        session: { currentSession: null } 
      };
    
    case 'SET_PROJECT':
      return {
        ...state,
        currentProjectId: action.payload
      };
    
    default:
      return state;
  }
}

// ============================================
// CONTEXT VALUE TYPE
// ============================================

interface AudioLabContextValue {
  state: AudioLabState;
  
  // Navigation
  setView: (view: ViewType) => void;
  goBack: () => void;
  
  // Player controls
  playSong: (song: Song | AudioLabSong) => Promise<void>;
  togglePlay: () => void;
  pause: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  hidePlayer: () => void;
  showFullScreenPlayer: () => void;
  hideFullScreenPlayer: () => void;
  
  // Multi-part audio
  switchPart: (part: VocalPart) => Promise<void>;
  getAvailableParts: () => VocalPart[];
  
  // Recording
  startRecording: () => Promise<boolean>;
  stopRecording: () => Promise<Blob | null>;
  
  // Pitch detection
  startPitchDetection: () => void;
  stopPitchDetection: () => void;
  
  // Practice
  updatePracticeStats: (stats: Partial<PracticeStats>) => void;
  
  // Session
  setCurrentSession: (session: { id: string; code: string; title: string } | null) => void;
  clearSession: () => void;
  
  // Studio
  setCurrentProject: (projectId: string | null) => void;
  openProject: (projectId: string) => void;
  
  // Utilities
  formatTime: (seconds: number) => string;
  initializeAudio: () => Promise<boolean>;
}

// ============================================
// CONTEXT
// ============================================

const AudioLabContext = createContext<AudioLabContextValue | null>(null);

// ============================================
// PROVIDER
// ============================================

export function AudioLabProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(audioLabReducer, initialState);
  const isLoadingRef = useRef(false);

  // ============================================
  // AUDIO ENGINE SETUP
  // ============================================

  useEffect(() => {
    // Set up audio engine callbacks
    audioEngine.onTimeUpdate = (time) => {
      dispatch({ type: 'UPDATE_TIME', payload: time });
    };
    
    audioEngine.onEnded = () => {
      dispatch({ type: 'SONG_ENDED' });
      // Handle repeat mode
      if (state.player.repeatMode === 'one') {
        audioEngine.seek(0);
        audioEngine.play();
      }
    };
    
    audioEngine.onInputLevel = (level) => {
      dispatch({ type: 'SET_INPUT_LEVEL', payload: level });
    };
    
    audioEngine.onPitchDetected = (data) => {
      dispatch({ type: 'SET_PITCH', payload: data });
    };
    
    return () => {
      audioEngine.dispose();
    };
  }, []);

  // Handle play/pause state changes
  useEffect(() => {
    if (state.player.isPlaying && state.isAudioInitialized && !isLoadingRef.current) {
      audioEngine.play();
    } else if (!state.player.isPlaying) {
      audioEngine.pause();
    }
  }, [state.player.isPlaying, state.isAudioInitialized]);

  // Handle volume changes
  useEffect(() => {
    const volume = state.player.isMuted ? 0 : state.player.volume;
    audioEngine.setVolume(volume);
  }, [state.player.volume, state.player.isMuted]);

  // ============================================
  // ACTIONS
  // ============================================

  const initializeAudio = useCallback(async (): Promise<boolean> => {
    const success = await audioEngine.initialize();
    dispatch({ type: 'SET_AUDIO_INITIALIZED', payload: success });
    return success;
  }, []);

  const setView = useCallback((view: ViewType) => {
    dispatch({ type: 'SET_VIEW', payload: view });
  }, []);

  const goBack = useCallback(() => {
    dispatch({ type: 'GO_BACK' });
  }, []);

  const playSong = useCallback(async (song: Song | AudioLabSong) => {
    try {
      isLoadingRef.current = true;
      
      // Ensure audio is initialized
      if (!state.isAudioInitialized) {
        await initializeAudio();
      }
      
      // Convert to legacy Song format if needed
      const legacySong: Song = 'audioUrls' in song && song.audioUrls 
        ? toLeagcySong(song as AudioLabSong)
        : song as Song;
      
      dispatch({ type: 'PLAY_SONG', payload: legacySong });
      
      // Load audio
      const audioUrls: AudioUrls = legacySong.audioUrls || { full: legacySong.audioUrl };
      const loaded = await audioEngine.loadSongParts(audioUrls);
      
      if (loaded) {
        const duration = audioEngine.getDuration();
        dispatch({ type: 'SET_DURATION', payload: duration });
        await audioEngine.play();
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load audio' });
      }
    } catch (error) {
      console.error('[AudioLabContext] Error playing song:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to play song' });
    } finally {
      isLoadingRef.current = false;
    }
  }, [state.isAudioInitialized, initializeAudio]);

  const togglePlay = useCallback(() => {
    dispatch({ type: 'TOGGLE_PLAY' });
  }, []);

  const pause = useCallback(() => {
    dispatch({ type: 'PAUSE' });
  }, []);

  const seek = useCallback((time: number) => {
    audioEngine.seek(time);
    dispatch({ type: 'SEEK', payload: time });
  }, []);

  const setVolume = useCallback((volume: number) => {
    dispatch({ type: 'SET_VOLUME', payload: volume });
  }, []);

  const toggleMute = useCallback(() => {
    dispatch({ type: 'TOGGLE_MUTE' });
  }, []);

  const toggleShuffle = useCallback(() => {
    dispatch({ type: 'TOGGLE_SHUFFLE' });
  }, []);

  const toggleRepeat = useCallback(() => {
    dispatch({ type: 'TOGGLE_REPEAT' });
  }, []);

  const hidePlayer = useCallback(() => {
    audioEngine.stop();
    dispatch({ type: 'HIDE_PLAYER' });
  }, []);

  const showFullScreenPlayer = useCallback(() => {
    dispatch({ type: 'SHOW_FULLSCREEN_PLAYER' });
  }, []);

  const hideFullScreenPlayer = useCallback(() => {
    dispatch({ type: 'HIDE_FULLSCREEN_PLAYER' });
  }, []);

  // Multi-part audio
  const switchPart = useCallback(async (part: VocalPart) => {
    const success = await audioEngine.switchPart(part);
    if (success) {
      dispatch({ type: 'SET_CURRENT_PART', payload: part });
    }
  }, []);

  const getAvailableParts = useCallback((): VocalPart[] => {
    return audioEngine.getAvailableParts();
  }, []);

  // Recording
  const startRecording = useCallback(async (): Promise<boolean> => {
    if (!state.isAudioInitialized) {
      await initializeAudio();
    }
    const success = await audioEngine.startRecording();
    dispatch({ type: 'SET_RECORDING', payload: success });
    return success;
  }, [state.isAudioInitialized, initializeAudio]);

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    const blob = await audioEngine.stopRecording();
    dispatch({ type: 'SET_RECORDING', payload: false });
    return blob;
  }, []);

  // Pitch detection
  const startPitchDetection = useCallback(() => {
    audioEngine.startPitchDetection();
  }, []);

  const stopPitchDetection = useCallback(() => {
    audioEngine.stopPitchDetection();
    dispatch({ type: 'SET_PITCH', payload: null });
  }, []);

  // Practice
  const updatePracticeStats = useCallback((stats: Partial<PracticeStats>) => {
    dispatch({ type: 'UPDATE_PRACTICE_STATS', payload: stats });
  }, []);

  // Session
  const setCurrentSession = useCallback((session: { id: string; code: string; title: string } | null) => {
    dispatch({ type: 'SET_SESSION', payload: session });
  }, []);

  const clearSession = useCallback(() => {
    dispatch({ type: 'CLEAR_SESSION' });
  }, []);

  // Studio
  const setCurrentProject = useCallback((projectId: string | null) => {
    dispatch({ type: 'SET_PROJECT', payload: projectId });
  }, []);

  const openProject = useCallback((projectId: string) => {
    dispatch({ type: 'SET_PROJECT', payload: projectId });
    dispatch({ type: 'SET_VIEW', payload: 'studio' });
  }, []);

  // Utilities
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // ============================================
  // CONTEXT VALUE
  // ============================================

  const value: AudioLabContextValue = {
    state,
    setView,
    goBack,
    playSong,
    togglePlay,
    pause,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    hidePlayer,
    showFullScreenPlayer,
    hideFullScreenPlayer,
    switchPart,
    getAvailableParts,
    startRecording,
    stopRecording,
    startPitchDetection,
    stopPitchDetection,
    updatePracticeStats,
    setCurrentSession,
    clearSession,
    setCurrentProject,
    openProject,
    formatTime,
    initializeAudio,
  };

  return (
    <AudioLabContext.Provider value={value}>
      {children}
    </AudioLabContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useAudioLab() {
  const context = useContext(AudioLabContext);
  if (!context) {
    throw new Error('useAudioLab must be used within AudioLabProvider');
  }
  return context;
}
