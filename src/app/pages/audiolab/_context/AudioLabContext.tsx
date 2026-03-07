'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { audioEngine } from '../_lib/audio-engine';
import { toLegacySong, getSongsPaginated, getTotalSongCount } from '../_lib/song-service';
import type {
  Song,
  AudioLabSong,
  PlayerState,
  RepeatMode,
  ViewType,
  PracticeStats,
  VocalPart,
  AudioUrls,
  PitchData,
  Playlist
} from '../_types';
import * as playlistService from '../_lib/playlist-service';

// STATE TYPES

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
  
  // Playlists
  playlists: Playlist[];
  activePlaylist: Playlist | null;
}

// ACTIONS

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
  | { type: 'SET_LIBRARY_DATA'; payload: { songs: any[]; totalCount: number; lastDoc: any; hasMore: boolean } }
  | { type: 'SET_PLAYLISTS'; payload: Playlist[] }
  | { type: 'SET_ACTIVE_PLAYLIST'; payload: Playlist | null };

// INITIAL STATE

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
  playlists: [],
  activePlaylist: null,
};

// REDUCER

function audioLabReducer(state: AudioLabState, action: AudioLabAction): AudioLabState {
  switch (action.type) {
    case 'SET_VIEW':
      if (state.currentView === action.payload) {
        return state;
      }
      return {
        ...state,
        previousView: state.currentView,
        currentView: action.payload,
      };

    case 'GO_BACK':
      return {
        ...state,
        currentView: state.previousView || 'home',
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

    case 'SET_PLAYLISTS':
      return {
        ...state,
        playlists: action.payload
      };

    case 'SET_ACTIVE_PLAYLIST':
      return {
        ...state,
        activePlaylist: action.payload
      };

    default:
      return state;
  }
}

// CONTEXT VALUE TYPE

interface AudioLabContextValue {
  state: AudioLabState;
  setView: (view: ViewType) => void;
  goBack: () => void;
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
  switchPart: (part: VocalPart) => Promise<void>;
  getAvailableParts: () => VocalPart[];
  startRecording: () => Promise<boolean>;
  stopRecording: () => Promise<Blob | null>;
  startPitchDetection: () => void;
  stopPitchDetection: () => void;
  updatePracticeStats: (stats: Partial<PracticeStats>) => void;
  setCurrentSession: (session: { id: string; code: string; title: string; hostId: string; classroomId?: string } | null) => void;
  clearSession: () => void;
  setCurrentProject: (projectId: string | null) => void;
  openProject: (projectId: string) => void;
  formatTime: (seconds: number) => string;
  initializeAudio: () => Promise<boolean>;
  loadHomeData: (userId: string, zoneId?: string, forceRefresh?: boolean) => Promise<void>;
  loadPracticeData: (userId: string, zoneId?: string, forceRefresh?: boolean) => Promise<void>;
  loadLibraryData: (zoneId: string, limitCount: number, forceRefresh?: boolean) => Promise<void>;
  loadPlaylists: (userId: string) => Promise<void>;
  openPlaylist: (playlist: Playlist) => void;
  createUserPlaylist: (title: string, description?: string, userId?: string, zoneId?: string) => Promise<string | null>;
  deleteUserPlaylist: (playlistId: string) => Promise<boolean>;
  addSongToUserPlaylist: (playlistId: string, songId: string) => Promise<boolean>;
  removeSongFromUserPlaylist: (playlistId: string, songId: string) => Promise<boolean>;
}

// CONTEXT

const AudioLabContext = createContext<AudioLabContextValue | null>(null);

// PROVIDER

export function AudioLabProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(audioLabReducer, initialState);
  const isLoadingRef = useRef(false);
  const stateRef = useRef(state);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

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

    if (roomIdParam && (!state.session.currentSession || state.session.currentSession.id !== roomIdParam)) {
      // Auto-join room logic
    }
  }, [searchParams, state.session.currentSession?.id]);

  const updateUrl = useCallback((view: ViewType, projectId: string | null = null, roomId: string | null = null, songTitle: string | null = null) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('view', view);
    if (projectId) params.set('project', projectId); else params.delete('project');
    if (roomId || stateRef.current.session.currentSession?.id) params.set('roomId', roomId || stateRef.current.session.currentSession!.id); else params.delete('roomId');
    if (songTitle || stateRef.current.player.currentSong?.title) params.set('song', songTitle || stateRef.current.player.currentSong!.title); else params.delete('song');
    const newUrl = `/pages/audiolab?${params.toString()}`;
    const currentUrl = `${window.location.pathname}${window.location.search}`;
    if (newUrl !== currentUrl) router.replace(newUrl);
  }, [router, searchParams]);

  useEffect(() => {
    audioEngine.onTimeUpdate = (time) => dispatch({ type: 'UPDATE_TIME', payload: time });
    audioEngine.onEnded = () => {
      const currentState = stateRef.current;
      dispatch({ type: 'SONG_ENDED' });
      if (currentState.player.repeatMode === 'one') {
        audioEngine.seek(0);
        audioEngine.play();
      }
    };
    audioEngine.onInputLevel = (level) => dispatch({ type: 'SET_INPUT_LEVEL', payload: level });
    audioEngine.onPitchDetected = (data) => dispatch({ type: 'SET_PITCH', payload: data });
    return () => audioEngine.dispose();
  }, []);

  useEffect(() => {
    if (state.player.isPlaying && !isLoadingRef.current) {
      audioEngine.play().catch(err => console.error('[AudioLabContext] Auto-play failed:', err));
    } else if (!state.player.isPlaying) {
      audioEngine.pause();
    }
  }, [state.player.isPlaying]);

  useEffect(() => {
    const volume = state.player.isMuted ? 0 : state.player.volume;
    audioEngine.setVolume(volume);
  }, [state.player.volume, state.player.isMuted]);

  const initializeAudio = useCallback(async (): Promise<boolean> => {
    const success = await audioEngine.initialize();
    dispatch({ type: 'SET_AUDIO_INITIALIZED', payload: success });
    return success;
  }, []);

  const setView = useCallback((view: ViewType) => {
    dispatch({ type: 'SET_VIEW', payload: view });
    updateUrl(view, stateRef.current.currentProjectId, stateRef.current.session.currentSession?.id, stateRef.current.player.currentSong?.title);
  }, [updateUrl]);

  const goBack = useCallback(() => {
    dispatch({ type: 'GO_BACK' });
    setTimeout(() => {
      updateUrl(stateRef.current.currentView, stateRef.current.currentProjectId, stateRef.current.session.currentSession?.id, stateRef.current.player.currentSong?.title);
    }, 0);
  }, [updateUrl]);

  const playSong = useCallback(async (song: Song | AudioLabSong) => {
    try {
      isLoadingRef.current = true;
      if (!state.isAudioInitialized) await initializeAudio();
      const legacySong: Song = 'audioUrls' in song && song.audioUrls ? toLegacySong(song as AudioLabSong) : song as Song;
      dispatch({ type: 'PLAY_SONG', payload: legacySong });
      dispatch({ type: 'SET_BUFFER_LOADING', payload: { isLoading: true, target: 'full' } });
      updateUrl(stateRef.current.currentView, stateRef.current.currentProjectId, stateRef.current.session.currentSession?.id, legacySong.title);
      const audioUrls: AudioUrls = legacySong.audioUrls || { full: legacySong.audioUrl };
      const loaded = await audioEngine.loadSongParts(audioUrls);
      dispatch({ type: 'SET_BUFFER_LOADING', payload: { isLoading: false } });
      if (loaded) {
        dispatch({ type: 'SET_DURATION', payload: audioEngine.getDuration() });
        if (stateRef.current.player.isPlaying) await audioEngine.play();
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load audio' });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to play song' });
    } finally {
      isLoadingRef.current = false;
    }
  }, [state.isAudioInitialized, initializeAudio, updateUrl]);

  const togglePlay = useCallback(() => dispatch({ type: 'TOGGLE_PLAY' }), []);
  const pause = useCallback(() => dispatch({ type: 'PAUSE' }), []);
  const seek = useCallback((time: number) => { audioEngine.seek(time); dispatch({ type: 'SEEK', payload: time }); }, []);
  const setVolume = useCallback((volume: number) => dispatch({ type: 'SET_VOLUME', payload: volume }), []);
  const toggleMute = useCallback(() => dispatch({ type: 'TOGGLE_MUTE' }), []);
  const toggleShuffle = useCallback(() => dispatch({ type: 'TOGGLE_SHUFFLE' }), []);
  const toggleRepeat = useCallback(() => dispatch({ type: 'TOGGLE_REPEAT' }), []);
  const hidePlayer = useCallback(() => { audioEngine.stop(); dispatch({ type: 'HIDE_PLAYER' }); }, []);
  const showFullScreenPlayer = useCallback(() => dispatch({ type: 'SHOW_FULLSCREEN_PLAYER' }), []);
  const hideFullScreenPlayer = useCallback(() => dispatch({ type: 'HIDE_FULLSCREEN_PLAYER' }), []);

  const switchPart = useCallback(async (part: VocalPart) => {
    dispatch({ type: 'SET_BUFFER_LOADING', payload: { isLoading: true, target: part } });
    const success = await audioEngine.switchPart(part);
    dispatch({ type: 'SET_BUFFER_LOADING', payload: { isLoading: false } });
    if (success) dispatch({ type: 'SET_CURRENT_PART', payload: part });
  }, []);

  const getAvailableParts = useCallback((): VocalPart[] => audioEngine.getAvailableParts(), []);

  const startRecording = useCallback(async (): Promise<boolean> => {
    if (!state.isAudioInitialized) await initializeAudio();
    const success = await audioEngine.startRecording();
    dispatch({ type: 'SET_RECORDING', payload: success });
    return success;
  }, [state.isAudioInitialized, initializeAudio]);

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    const blob = await audioEngine.stopRecording();
    dispatch({ type: 'SET_RECORDING', payload: false });
    return blob;
  }, []);

  const startPitchDetection = useCallback(() => audioEngine.startPitchDetection(), []);
  const stopPitchDetection = useCallback(() => { audioEngine.stopPitchDetection(); dispatch({ type: 'SET_PITCH', payload: null }); }, []);

  const updatePracticeStats = useCallback((stats: Partial<PracticeStats>) => dispatch({ type: 'UPDATE_PRACTICE_STATS', payload: stats }), []);
  const setCurrentSession = useCallback((session: any) => dispatch({ type: 'SET_SESSION', payload: session }), []);
  const clearSession = useCallback(() => dispatch({ type: 'CLEAR_SESSION' }), []);
  const setCurrentProject = useCallback((projectId: string | null) => dispatch({ type: 'SET_PROJECT', payload: projectId }), []);
  const openProject = useCallback((projectId: string) => {
    dispatch({ type: 'SET_PROJECT', payload: projectId });
    dispatch({ type: 'SET_VIEW', payload: 'studio' });
    updateUrl('studio', projectId);
  }, [updateUrl]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const HOME_CACHE_TTL = 5 * 60 * 1000;

  const loadHomeData = useCallback(async (userId: string, zoneId?: string, forceRefresh: boolean = false) => {
    const now = Date.now();
    const { lastFetched, projects } = stateRef.current.homeData;
    if (!forceRefresh && (now - lastFetched < HOME_CACHE_TTL) && projects.length > 0) return;
    try {
      const { getUserProjects } = await import('../_lib/project-service');
      const { getSongs } = await import('../_lib/song-service');
      const [newProjects, newSongs] = await Promise.all([
        getUserProjects(userId, 20),
        zoneId ? getSongs(zoneId, 5) : Promise.resolve([])
      ]);
      dispatch({ type: 'SET_HOME_DATA', payload: { projects: newProjects, featuredSongs: zoneId ? newSongs.slice(0, 3) : stateRef.current.homeData.featuredSongs } });
    } catch (error) { console.error('Error loading home data:', error); }
  }, []);

  const loadPracticeData = useCallback(async (userId: string, zoneId?: string, forceRefresh: boolean = false) => {
    const now = Date.now();
    const { lastFetched, progress } = stateRef.current.practiceData;
    if (!forceRefresh && (now - lastFetched < HOME_CACHE_TTL) && progress) return;
    try {
      const { getUserProgress, getWeeklyStats } = await import('../_lib/practice-service');
      const { getSongs } = await import('../_lib/song-service');
      const [userProgress, stats, songs] = await Promise.all([ getUserProgress(userId), getWeeklyStats(userId), getSongs(zoneId || '', 10) ]);
      dispatch({ type: 'SET_PRACTICE_DATA', payload: { progress: userProgress, weeklyStats: stats, featuredSongs: songs.slice(0, 5) } });
    } catch (error) { console.error('Error loading practice data:', error); }
  }, []);

  const loadLibraryData = useCallback(async (zoneId: string, limitCount: number, forceRefresh: boolean = false) => {
    const now = Date.now();
    const { lastFetched, songs } = stateRef.current.libraryData;
    if (!forceRefresh && (now - lastFetched < HOME_CACHE_TTL) && songs.length > 0) return;
    try {
      const [paginatedResult, totalCountObj] = await Promise.all([
        getSongsPaginated(null, limitCount),
        getTotalSongCount()
      ]);

      let masterSongs = paginatedResult.songs;
      let masterTotal = totalCountObj || 0; // getTotalSongCount sometimes returns an object or number, assuming number here based on usage

      if (zoneId) {
        try {
            const { PraiseNightSongsService } = await import('@/lib/praise-night-songs-service');
            const pnSongs = await PraiseNightSongsService.getAllSongs(zoneId);
            const mappedPNSongs = pnSongs.map((pnSong: any) => ({
              id: pnSong.id, title: pnSong.title || 'Untitled', artist: pnSong.leadSinger || pnSong.writer || 'Praise Night',
              duration: 300, audioUrls: { full: pnSong.audioFile || '', ...(pnSong.audioUrls || {}) },
              availableParts: Object.keys({ full: pnSong.audioFile || '', ...(pnSong.audioUrls || {}) }).filter(k => !!({ full: pnSong.audioFile || '', ...(pnSong.audioUrls || {}) } as any)[k]),
              genre: pnSong.category || 'Praise Night', key: pnSong.key || '', tempo: pnSong.tempo ? parseInt(pnSong.tempo) || 0 : 0,
              albumArt: '', lyrics: Array.isArray(pnSong.lyrics) ? pnSong.lyrics : [], zoneId, isHQSong: false, createdAt: new Date(), updatedAt: new Date(), createdBy: 'system'
            }));
            masterSongs = [...masterSongs, ...mappedPNSongs];
            masterTotal += mappedPNSongs.length;
        } catch(e) {}
      }
      
      dispatch({ type: 'SET_LIBRARY_DATA', payload: { songs: masterSongs, totalCount: masterTotal as number, lastDoc: paginatedResult.lastDoc, hasMore: masterSongs.length >= limitCount } });
    } catch (error) { console.error('Error loading library data:', error); }
  }, []);

  const loadPlaylists = useCallback(async (userId: string) => {
    try {
      const playlists = await playlistService.getUserPlaylists(userId);
      dispatch({ type: 'SET_PLAYLISTS', payload: playlists });
    } catch (error) { console.error('Error loading playlists:', error); }
  }, []);

  const openPlaylist = useCallback((playlist: Playlist) => {
    dispatch({ type: 'SET_ACTIVE_PLAYLIST', payload: playlist });
    dispatch({ type: 'SET_VIEW', payload: 'playlist-detail' });
    updateUrl('playlist-detail');
  }, [updateUrl]);

  const createUserPlaylist = useCallback(async (title: string, description?: string, userId?: string, zoneId?: string) => {
    if (!userId) return null;
    try {
      const id = await playlistService.createPlaylist({ title, description, userId, zoneId });
      await loadPlaylists(userId);
      return id;
    } catch (error) { return null; }
  }, [loadPlaylists]);

  const deleteUserPlaylist = useCallback(async (playlistId: string) => {
    try {
      await playlistService.deletePlaylist(playlistId);
      const userId = stateRef.current.playlists.find(p => p.id === playlistId)?.userId;
      if (userId) await loadPlaylists(userId);
      return true;
    } catch (error) { return false; }
  }, [loadPlaylists]);

  const addSongToUserPlaylist = useCallback(async (playlistId: string, songId: string) => {
    try {
      await playlistService.addSongToPlaylist(playlistId, songId);
      const userId = stateRef.current.playlists.find(p => p.id === playlistId)?.userId;
      if (userId) await loadPlaylists(userId);
      return true;
    } catch (error) { return false; }
  }, [loadPlaylists]);

  const removeSongFromUserPlaylist = useCallback(async (playlistId: string, songId: string) => {
    try {
      await playlistService.removeSongFromPlaylist(playlistId, songId);
      const userId = stateRef.current.playlists.find(p => p.id === playlistId)?.userId;
      if (userId) await loadPlaylists(userId);
      if (stateRef.current.activePlaylist?.id === playlistId) {
        const updated = await playlistService.getPlaylistById(playlistId);
        dispatch({ type: 'SET_ACTIVE_PLAYLIST', payload: updated });
      }
      return true;
    } catch (error) { return false; }
  }, [loadPlaylists]);

  const value: AudioLabContextValue = {
    state, setView, goBack, playSong, togglePlay, pause, seek, setVolume, toggleMute, toggleShuffle, toggleRepeat, hidePlayer, showFullScreenPlayer, hideFullScreenPlayer, switchPart, getAvailableParts, startRecording, stopRecording, startPitchDetection, stopPitchDetection, updatePracticeStats, setCurrentSession, clearSession, setCurrentProject, openProject, formatTime, initializeAudio, loadHomeData, loadPracticeData, loadLibraryData, loadPlaylists, openPlaylist, createUserPlaylist, deleteUserPlaylist, addSongToUserPlaylist, removeSongFromUserPlaylist,
  };

  return <AudioLabContext.Provider value={value}>{children}</AudioLabContext.Provider>;
}

export function useAudioLab() {
  const context = useContext(AudioLabContext);
  if (!context) throw new Error('useAudioLab must be used within AudioLabProvider');
  return context;
}
