'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { audioEngine } from '../_lib/audio-engine';
import { toLeagcySong, getSongsPaginated, getTotalSongCount } from '../_lib/song-service';
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
    hostId: string;
    classroomId?: string;
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

  // Cache for Home View
  homeData: {
    projects: any[];
    featuredSongs: any[];
    lastFetched: number;
  };

  // Cache for Practice View
  practiceData: {
    progress: any | null;
    weeklyStats: any | null;
    featuredSongs: any[];
    lastFetched: number;
  };

  // Cache for Library View
  libraryData: {
    songs: any[];
    totalCount: number;
    lastFetched: number;
    lastDoc: any | null;
    hasMore: boolean;
  };
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
  | { type: 'SET_SESSION'; payload: SessionState['currentSession'] | any }
  | { type: 'CLEAR_SESSION' }
  | { type: 'SET_PROJECT'; payload: string | null }
  | { type: 'SET_BUFFER_LOADING'; payload: { isLoading: boolean; target?: string | null } }
  | { type: 'SET_HOME_DATA'; payload: { projects: any[]; featuredSongs: any[] } }
  | { type: 'SET_PRACTICE_DATA'; payload: { progress: any; weeklyStats: any; featuredSongs: any[] } }
  | { type: 'SET_LIBRARY_DATA'; payload: { songs: any[]; totalCount: number; lastDoc: any; hasMore: boolean } };

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
    volume: 1.0,
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
  homeData: {
    projects: [],
    featuredSongs: [],
    lastFetched: 0,
  },
  practiceData: {
    progress: null,
    weeklyStats: null,
    featuredSongs: [],
    lastFetched: 0,
  },
  libraryData: {
    songs: [],
    totalCount: 0,
    lastFetched: 0,
    lastDoc: null,
    hasMore: true,
  },
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

    case 'SET_BUFFER_LOADING':
      return {
        ...state,
        player: {
          ...state.player,
          isBufferLoading: action.payload.isLoading,
          loadingTarget: action.payload.isLoading ? (action.payload.target || 'full') : null
        }
      };

    case 'SET_HOME_DATA':
      return {
        ...state,
        homeData: {
          ...action.payload,
          lastFetched: Date.now()
        }
      };

    case 'SET_PRACTICE_DATA':
      return {
        ...state,
        practiceData: {
          ...action.payload,
          lastFetched: Date.now()
        }
      };

    case 'SET_LIBRARY_DATA':
      return {
        ...state,
        libraryData: {
          ...action.payload,
          lastFetched: Date.now()
        }
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
  setCurrentSession: (session: { id: string; code: string; title: string; hostId: string; classroomId?: string } | null) => void;
  clearSession: () => void;

  // Studio
  setCurrentProject: (projectId: string | null) => void;
  openProject: (projectId: string) => void;

  // Utilities
  formatTime: (seconds: number) => string;
  initializeAudio: () => Promise<boolean>;
  loadHomeData: (userId: string, zoneId?: string, forceRefresh?: boolean) => Promise<void>;
  loadPracticeData: (userId: string, zoneId?: string, forceRefresh?: boolean) => Promise<void>;
  loadLibraryData: (zoneId: string, limitCount: number, forceRefresh?: boolean) => Promise<void>;
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
  const stateRef = useRef(state);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Keep stateRef in sync with state
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // ============================================
  // URL SYNCHRONIZATION
  // ============================================

  // Sync internal state with URL on mount and param changes
  useEffect(() => {
    const viewParam = searchParams?.get('view');
    const projectParam = searchParams?.get('project');
    const roomIdParam = searchParams?.get('roomId');
    const songParam = searchParams?.get('song');

    if (viewParam && viewParam !== state.currentView) {
      const validViews = ['home', 'library', 'practice', 'karaoke', 'warmup', 'studio', 'collab', 'collab-chat', 'live-session'];
      if (validViews.includes(viewParam)) {
        dispatch({ type: 'SET_VIEW', payload: viewParam as ViewType });
      }
    }

    if (projectParam && projectParam !== state.currentProjectId) {
      dispatch({ type: 'SET_PROJECT', payload: projectParam });
    }

    // Restore song from URL if not already playing it
    if (songParam && (!state.player.currentSong || state.player.currentSong.title !== decodeURIComponent(songParam))) {
      // Find the song and play it (this will be handled by the view once it loads the list, 
      // but we can at least signal the player to be ready or try to find it if we have context)
      // For now, we'll let the individual views (Library/Practice) handle the find-and-play 
      // based on the URL parameter.
    }

    // Auto-join room if ID is in URL
    if (roomIdParam && (!state.session.currentSession || state.session.currentSession.id !== roomIdParam)) {
      handleAutoJoinRoom(roomIdParam);
    }
  }, [searchParams, state.session.currentSession?.id]);

  const handleAutoJoinRoom = async (roomId: string) => {
    // Only join if we are logged in
    // This depends on external auth state which might not be in this context
    // But we can check if we have enough info to show the loading state
    console.log('[AudioLabContext] Auto-joining room:', roomId);
    // We will rely on individual components (LiveSessionView or CollabView) 
    // to handle the actual join logic once the view is set
  };

  const updateUrl = useCallback((view: ViewType, projectId: string | null = null, roomId: string | null = null, songTitle: string | null = null) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('view', view);

    if (projectId) {
      params.set('project', projectId);
    } else {
      params.delete('project');
    }

    if (roomId || state.session.currentSession?.id) {
      params.set('roomId', roomId || state.session.currentSession!.id);
    } else {
      params.delete('roomId');
    }

    if (songTitle || state.player.currentSong?.title) {
      params.set('song', songTitle || state.player.currentSong!.title);
    } else {
      params.delete('song');
    }

    // Only update if URL changed
    const newUrl = `/pages/audiolab?${params.toString()}`;
    const currentUrl = `${window.location.pathname}${window.location.search}`;

    if (newUrl !== currentUrl) {
      router.replace(newUrl); // Use replace for sub-view changes to avoid cluttering history
    }
  }, [router, searchParams, state.player.currentSong?.title, state.session.currentSession?.id]);

  // ============================================
  // AUDIO ENGINE SETUP
  // ============================================

  useEffect(() => {
    // Set up audio engine callbacks
    audioEngine.onTimeUpdate = (time) => {
      dispatch({ type: 'UPDATE_TIME', payload: time });
    };

    audioEngine.onEnded = () => {
      const currentState = stateRef.current;
      dispatch({ type: 'SONG_ENDED' });

      // Handle repeat mode using the latest state from ref
      if (currentState.player.repeatMode === 'one') {
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
    // Engine now handles fallback internally, so we don't strictly require isAudioInitialized for HTML5 mode
    if (state.player.isPlaying && !isLoadingRef.current) {
      audioEngine.play().catch(err => console.error('❌ [AudioLabContext] Auto-play failed:', err));
    } else if (!state.player.isPlaying) {
      audioEngine.pause();
    }
  }, [state.player.isPlaying]);

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
    updateUrl(view, state.currentProjectId, state.session.currentSession?.id, state.player.currentSong?.title);
  }, [updateUrl, state.currentProjectId, state.session.currentSession?.id, state.player.currentSong?.title]);

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
      dispatch({ type: 'SET_BUFFER_LOADING', payload: { isLoading: true, target: 'full' } });

      // Update URL with song info
      updateUrl(state.currentView, state.currentProjectId, state.session.currentSession?.id, legacySong.title);

      // Load audio
      console.log(`💎 [AudioLabContext] Fetching audio parts for: ${legacySong.title}`);
      const audioUrls: AudioUrls = legacySong.audioUrls || { full: legacySong.audioUrl };

      const loaded = await audioEngine.loadSongParts(audioUrls);

      dispatch({ type: 'SET_BUFFER_LOADING', payload: { isLoading: false } });

      if (loaded) {
        const duration = audioEngine.getDuration();
        console.log(`✅ [AudioLabContext] Audio loaded successfully. Duration: ${duration}s`);
        dispatch({ type: 'SET_DURATION', payload: duration });

        // Only start playing if the user hasn't paused while we were loading
        if (stateRef.current.player.isPlaying) {
          console.log('🚀 [AudioLabContext] Triggering engine.play()');
          const started = await audioEngine.play();
          if (!started) console.error('❌ [AudioLabContext] AudioEngine failed to start playback');
        }
      } else {
        console.error('❌ [AudioLabContext] Failed to load audio parts. Check CORS or URL validity.', audioUrls);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load audio' });
      }
    } catch (error) {
      console.error('❌ [AudioLabContext] Error in playSong flow:', error);
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
    dispatch({ type: 'SET_BUFFER_LOADING', payload: { isLoading: true, target: part } });
    const success = await audioEngine.switchPart(part);
    dispatch({ type: 'SET_BUFFER_LOADING', payload: { isLoading: false } });
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
  const setCurrentSession = useCallback((session: { id: string; code: string; title: string; hostId: string } | null) => {
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
    updateUrl('studio', projectId);
  }, [updateUrl]);

  // Utilities
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const HOME_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  const loadHomeData = useCallback(async (userId: string, zoneId?: string, forceRefresh: boolean = false) => {
    const now = Date.now();
    const { lastFetched, projects } = stateRef.current.homeData;

    if (!forceRefresh && (now - lastFetched < HOME_CACHE_TTL) && projects.length > 0) {
      console.log('📦 [AudioLabContext] Using cached home data');
      return;
    }

    console.log('🚀 [AudioLabContext] Fetching home data from Firestore...');
    try {
      const { getUserProjects } = await import('../_lib/project-service');
      const { getSongs } = await import('../_lib/song-service');

      const [newProjects, newSongs] = await Promise.all([
        getUserProjects(userId),
        zoneId ? getSongs(zoneId, 5) : Promise.resolve([])
      ]);

      dispatch({
        type: 'SET_HOME_DATA',
        payload: {
          projects: newProjects,
          featuredSongs: zoneId ? newSongs.slice(0, 3) : stateRef.current.homeData.featuredSongs
        }
      });
    } catch (error) {
      console.error('❌ [AudioLabContext] Error loading home data:', error);
    }
  }, []);

  const loadPracticeData = useCallback(async (userId: string, zoneId?: string, forceRefresh: boolean = false) => {
    const now = Date.now();
    const { lastFetched, progress } = stateRef.current.practiceData;

    if (!forceRefresh && (now - lastFetched < HOME_CACHE_TTL) && progress) {
      console.log('📦 [AudioLabContext] Using cached practice data');
      return;
    }

    console.log('🚀 [AudioLabContext] Fetching practice data from Firestore...');
    try {
      const { getUserProgress, getWeeklyStats } = await import('../_lib/practice-service');
      const { getSongs } = await import('../_lib/song-service');

      const [userProgress, stats, songs] = await Promise.all([
        getUserProgress(userId),
        getWeeklyStats(userId),
        getSongs(zoneId || '', 10)
      ]);

      dispatch({
        type: 'SET_PRACTICE_DATA',
        payload: {
          progress: userProgress,
          weeklyStats: stats,
          featuredSongs: songs.slice(0, 5)
        }
      });
    } catch (error) {
      console.error('❌ [AudioLabContext] Error loading practice data:', error);
    }
  }, []);

  const loadLibraryData = useCallback(async (zoneId: string, limitCount: number, forceRefresh: boolean = false) => {
    const now = Date.now();
    const { lastFetched, songs } = stateRef.current.libraryData;

    if (!forceRefresh && (now - lastFetched < HOME_CACHE_TTL) && songs.length > 0) {
      console.log('📦 [AudioLabContext] Using cached library data');
      return;
    }

    console.log('🚀 [AudioLabContext] Fetching library songs (Master + Praise Night)...');
    try {

      // Execute fetches in parallel
      const songPromises: Promise<any>[] = [
        getSongsPaginated(null, limitCount),
        getTotalSongCount()
      ];

      // If zoneId is available, also fetch Praise Night songs
      if (zoneId) {
        const fetchPraiseNight = async () => {
          try {
            const { PraiseNightSongsService } = await import('@/lib/praise-night-songs-service');
            const pnSongs = await PraiseNightSongsService.getAllSongs(zoneId);
            return pnSongs.map((pnSong: any) => ({
              id: pnSong.id as string,
              title: pnSong.title || 'Untitled',
              artist: pnSong.leadSinger || pnSong.writer || 'Praise Night',
              duration: 300,
              audioUrls: { full: pnSong.audioFile || '' },
              availableParts: (pnSong.audioFile ? ['full'] : []) as any[],
              genre: pnSong.category || 'Praise Night',
              key: pnSong.key || '',
              tempo: pnSong.tempo ? parseInt(pnSong.tempo) || 0 : 0,
              albumArt: '',
              lyrics: Array.isArray(pnSong.lyrics) ? pnSong.lyrics as any[] : typeof pnSong.lyrics === 'string' ? [{ time: 0, text: pnSong.lyrics }] : [],
              zoneId: zoneId,
              isHQSong: false,
              createdAt: new Date(),
              updatedAt: new Date(),
              createdBy: 'system'
            }));
          } catch (e) {
            console.error('[AudioLabContext] Failed to fetch PN songs:', e);
            return [];
          }
        };
        songPromises.push(fetchPraiseNight());
      } else {
        songPromises.push(Promise.resolve([]));
      }

      const [masterResult, masterTotal, _pnResult] = await Promise.all(songPromises);

      // We no longer prepend Praise Night songs to the Master Library list
      // This ensures consistent numbering across all zones for the Master Library.
      // Praise Night songs are fetched separately by the "Ongoing" tab in LibraryView.
      const allSongs = masterResult.songs;
      const combinedTotal = masterTotal;

      dispatch({
        type: 'SET_LIBRARY_DATA',
        payload: {
          songs: allSongs,
          totalCount: combinedTotal,
          lastDoc: masterResult.lastDoc, // Only track pagination for Master List
          hasMore: masterResult.songs.length < masterTotal // Logic mostly for master list pagination
        }
      });
    } catch (error) {
      console.error('❌ [AudioLabContext] Error loading library data:', error);
    }
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
    loadHomeData,
    loadPracticeData,
    loadLibraryData,
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
