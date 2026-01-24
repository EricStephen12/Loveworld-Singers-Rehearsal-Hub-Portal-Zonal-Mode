"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, BookOpen, Music, Users, Clock, Play, Pause, SkipBack, SkipForward, RotateCcw, Music2, ChevronDown, ChevronUp, Settings, Maximize2, Minimize2, RotateCw, Undo2, Redo2, RefreshCw, Loader2 } from "lucide-react";
import { PraiseNightSong, HistoryEntry } from "@/types/supabase";
import { useAudio } from "@/contexts/AudioContext";
import { useZone } from "@/hooks/useZone";
import { isHQGroup } from "@/config/zones";
import { FirebaseDatabaseService } from "@/lib/firebase-database";
import { FirebaseCommentService } from "@/lib/firebase-comment-service";
import { useRealtimeComments } from "@/hooks/useRealtimeComments";
import { useRealtimeSongData } from "@/hooks/useRealtimeSongData";
import { firebaseLowDataService } from "@/lib/firebase-low-data-service";

interface SongDetailModalProps {
  selectedSong: PraiseNightSong | null;
  isOpen: boolean;
  onClose: () => void;
  onSongChange?: (song: PraiseNightSong) => void;
  currentFilter?: 'heard' | 'unheard'; // Add current filter prop
  songs?: PraiseNightSong[]; // Add songs prop
}

export default function SongDetailModal({ selectedSong, isOpen, onClose, onSongChange, currentFilter = 'heard', songs = [] }: SongDetailModalProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'lyrics' | 'solfas' | 'comments' | 'history'>('lyrics');
  const [activeHistoryTab, setActiveHistoryTab] = useState<'lyrics' | 'audio' | 'solfas' | 'comments' | 'metadata'>('lyrics');
  const [isRepeating, setIsRepeating] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [categorySongs, setCategorySongs] = useState<PraiseNightSong[]>([]);

  // Fullscreen state for lyrics, comments, and solfas
  const [isFullscreenLyrics, setIsFullscreenLyrics] = useState(false);
  const [isFullscreenComments, setIsFullscreenComments] = useState(false);
  const [isFullscreenSolfas, setIsFullscreenSolfas] = useState(false);
  const [isNavigatingToAudioLab, setIsNavigatingToAudioLab] = useState(false);

  // Get zone context to determine comment terminology
  const { currentZone } = useZone();

  // Get zone color for theming
  const zoneColor = currentZone?.themeColor || '#9333EA';

  // Helper to darken color for gradients
  const darkenColor = (color: string, percent: number) => {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  };

  // Helper function to get correct comment terminology based on zone
  const getCommentLabel = () => {
    // HQ groups see "Pastor Comments", regular zones see "Coordinator Comments"
    return isHQGroup(currentZone?.id) ? "Pastor" : "Coordinator";
  };

  // Toggle fullscreen functions
  const toggleFullscreenLyrics = () => {
    setIsFullscreenLyrics(!isFullscreenLyrics);
  };

  const toggleFullscreenComments = () => {
    setIsFullscreenComments(!isFullscreenComments);
  };

  const toggleFullscreenSolfas = () => {
    setIsFullscreenSolfas(!isFullscreenSolfas);
  };

  // State for history audio players
  const [historyAudioStates, setHistoryAudioStates] = useState<{ [key: string]: { isPlaying: boolean, currentTime: number, duration: number } }>({});
  const historyAudioRefs = useRef<Record<string, HTMLAudioElement | null>>({});
  const [mainPlayerWasPlaying, setMainPlayerWasPlaying] = useState(false);

  // Translation state
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<{ [key: string]: string }>({});
  const [originalContent, setOriginalContent] = useState<{ [key: string]: string }>({});

  // Text editor state
  const [isEditing, setIsEditing] = useState(false);
  const [editingContent, setEditingContent] = useState('');
  const [editingField, setEditingField] = useState<'lyrics' | 'solfas' | null>(null);

  // Collapsible history cards state
  const [expandedHistoryEntries, setExpandedHistoryEntries] = useState<Set<string>>(new Set());

  // Toggle history entry expansion
  const toggleHistoryEntry = (entryId: string) => {
    setExpandedHistoryEntries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(entryId)) {
        newSet.delete(entryId);
      } else {
        newSet.add(entryId);
      }
      return newSet;
    });
  };

  // History state management (same as EditSongModal)
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  // Use global audio context
  const { currentSong, isPlaying, currentTime, duration, isLoading, hasError, togglePlayPause, audioRef, setCurrentSong } = useAudio();

  // Use the selected song as the base; realtime hook will layer live data on top
  const currentSongData = selectedSong;

  // Set the current song when modal opens (only if it's a different song)
  useEffect(() => {
    if (selectedSong && isOpen) {

      // Only set the song if it's different from the current one
      // This prevents restarting the same song when opening the modal
      if (currentSong?.id !== selectedSong.id) {
        setCurrentSong(selectedSong, false);
      } else {
      }
    }
  }, [selectedSong?.title, isOpen, currentSong?.id]); // Add currentSong?.id to dependencies

  // Load songs from the same category AND current filter, find current song index
  useEffect(() => {
    if (selectedSong) {
      const songsInCategory = songs.filter(song =>
        song.category === selectedSong.category && song.status === currentFilter
      );
      setCategorySongs(songsInCategory);

      const index = songsInCategory.findIndex(song => song.title === selectedSong.title);
      setCurrentSongIndex(index >= 0 ? index : 0);
    }
  }, [selectedSong, currentFilter, songs]);

  // Handle audio ended event for repeat functionality and auto-skip
  useEffect(() => {
    const handleAudioEnded = (event: CustomEvent) => {

      const isCurrentSong = event.detail.song?.title === currentSongData?.title ||
        event.detail.song?.id === currentSongData?.id;

      if (isRepeating && isCurrentSong) {
        // Restart the current song
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch((error) => {
            console.error('Error repeating song:', error);
          });
        }
      } else if (!isRepeating && isCurrentSong) {
        // Auto-skip to next song when not repeating
        if (currentSongIndex < categorySongs.length - 1 && categorySongs.length > 0) {
          // Go to next song
          const nextSong = categorySongs[currentSongIndex + 1];
          if (nextSong && onSongChange) {
            setCurrentSongIndex(currentSongIndex + 1);
            onSongChange(nextSong);
            // Set the new song in audio context and auto-play
            setCurrentSong(nextSong, true);
          }
        } else {
          // No more songs, just stop
          if (audioRef.current) {
            audioRef.current.pause();
          }
        }
      }
    };

    window.addEventListener('audioEnded', handleAudioEnded as EventListener);
    return () => {
      window.removeEventListener('audioEnded', handleAudioEnded as EventListener);
    };
  }, [isRepeating, currentSongData?.title, currentSongIndex, categorySongs, onSongChange, setCurrentSong]);

  const handlePrevious = () => {

    if (currentSongIndex > 0 && categorySongs.length > 0) {
      // Go to previous song
      const prevSong = categorySongs[currentSongIndex - 1];
      if (prevSong && onSongChange) {
        setCurrentSongIndex(currentSongIndex - 1);
        onSongChange(prevSong);
        // Set the new song in audio context and auto-play
        setCurrentSong(prevSong, true);
      }
    } else if (audioRef.current && duration > 0) {
      // If at first song or no songs, skip back 10 seconds
      const newTime = Math.max(0, audioRef.current.currentTime - 10);
      audioRef.current.currentTime = newTime;
    }
  };

  const handleNext = () => {

    if (currentSongIndex < categorySongs.length - 1 && categorySongs.length > 0) {
      // Go to next song
      const nextSong = categorySongs[currentSongIndex + 1];
      if (nextSong && onSongChange) {
        setCurrentSongIndex(currentSongIndex + 1);
        onSongChange(nextSong);
        // Set the new song in audio context and auto-play
        setCurrentSong(nextSong, true);
      }
    } else if (audioRef.current && duration > 0) {
      // If at last song or no songs, skip forward 10 seconds
      const newTime = Math.min(duration, audioRef.current.currentTime + 10);
      audioRef.current.currentTime = newTime;
    }
  };

  const toggleRepeat = () => {
    const newRepeatState = !isRepeating;
    setIsRepeating(newRepeatState);
  };

  const handleMusicPage = () => {
    // Navigate to AudioLab library with song title to auto-expand
    if (currentSongData?.title) {
      setIsNavigatingToAudioLab(true);
      // Use encodeURIComponent to handle special characters in song titles
      router.push(`/pages/audiolab?song=${encodeURIComponent(currentSongData.title)}`);
      onClose();
    }
  };


  // History audio player functions
  const handleHistoryAudioPlayPause = (audioId: string) => {
    const historyAudioRef = historyAudioRefs.current[audioId];
    if (!historyAudioRef) return;

    // Pause all other history audios
    Object.keys(historyAudioRefs.current).forEach(id => {
      if (id !== audioId && historyAudioRefs.current[id]) {
        historyAudioRefs.current[id]!.pause();
        setHistoryAudioStates(prev => ({
          ...prev,
          [id]: { ...prev[id], isPlaying: false }
        }));
      }
    });

    if (historyAudioStates[audioId]?.isPlaying) {
      // Pause current history audio
      historyAudioRef.pause();
      setHistoryAudioStates(prev => ({
        ...prev,
        [audioId]: { ...prev[audioId], isPlaying: false }
      }));

      // Resume main player if it was playing before
      if (mainPlayerWasPlaying) {
        togglePlayPause();
        setMainPlayerWasPlaying(false);
      }
    } else {
      // Play current history audio - pause main player if it's playing
      if (isPlaying) {
        setMainPlayerWasPlaying(true);
        togglePlayPause(); // This will pause the main player
      }

      historyAudioRef.play(); // Play the history audio element, not the main one
      setHistoryAudioStates(prev => ({
        ...prev,
        [audioId]: { ...prev[audioId], isPlaying: true }
      }));
    }
  };

  const handleHistoryAudioTimeUpdate = (audioId: string) => {
    const audioElement = historyAudioRefs.current[audioId];
    if (audioElement) {
      setHistoryAudioStates(prev => ({
        ...prev,
        [audioId]: { ...prev[audioId], currentTime: audioElement.currentTime }
      }));
    }
  };

  const handleHistoryAudioLoadedMetadata = (audioId: string) => {
    const audioElement = historyAudioRefs.current[audioId];
    if (audioElement) {
      setHistoryAudioStates(prev => ({
        ...prev,
        [audioId]: { ...prev[audioId], duration: audioElement.duration }
      }));
    }
  };

  const handleHistoryAudioEnded = (audioId: string) => {
    setHistoryAudioStates(prev => ({
      ...prev,
      [audioId]: { ...prev[audioId], isPlaying: false, currentTime: 0 }
    }));

    // Resume main player if it was playing before
    if (mainPlayerWasPlaying) {
      togglePlayPause();
      setMainPlayerWasPlaying(false);
    }
  };

  const formatDateTime = (dateInput: any) => {
    let date: Date;

    // Handle different Firebase date formats
    if (dateInput && typeof dateInput === 'object') {
      // Firestore Timestamp object
      if (dateInput.toDate && typeof dateInput.toDate === 'function') {
        date = dateInput.toDate();
      }
      // Firestore Timestamp with seconds/nanoseconds
      else if (dateInput.seconds) {
        date = new Date(dateInput.seconds * 1000);
      }
      // Regular Date object
      else if (dateInput instanceof Date) {
        date = dateInput;
      }
      // ISO string or other format
      else {
        date = new Date(dateInput);
      }
    }
    // String or number
    else if (dateInput) {
      date = new Date(dateInput);
    }
    // Fallback to current date
    else {
      date = new Date();
    }

    if (isNaN(date.getTime())) {
      return {
        date: 'Invalid Date',
        time: ''
      };
    }

    return {
      date: date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };
  };

  // History loading is now handled by the loadHistoryEntries function (same as EditSongModal)

  // Use real-time comments hook (no cache)
  const {
    comments: realtimeComments,
    loading: isLoadingComments,
    error: commentsError,
    refreshComments
  } = useRealtimeComments({
    songId: currentSongData?.id?.toString() || null,
    enabled: isOpen && activeHistoryTab === 'comments'
  });

  // Use real-time song data hook (no cache)
  const {
    songData: realtimeSongData,
    loading: isLoadingSongData,
    error: songDataError,
    refreshSongData
  } = useRealtimeSongData({
    songId: currentSongData?.id?.toString() || null,
    enabled: isOpen, // Always enabled when modal is open
    zoneId: currentZone?.id || null, // CRITICAL: read from same collection the admin writes to
  });

  // Single source of truth for what the UI should display (realtime → fresh → initial)
  const displayedSongData = realtimeSongData || currentSongData;

  // Load history entries for the current song (same as EditSongModal)
  const loadHistoryEntries = async () => {
    if (!currentSongData?.id) {
      setHistoryEntries([]);
      setIsLoadingHistory(false);
      return;
    }

    try {
      if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
        console.warn('⚠️ Firebase not configured - history features will not work');
        setHistoryEntries([]);
        setIsLoadingHistory(false);
        return;
      }

      setIsLoadingHistory(true);
      setHistoryError(null);

      const data = await FirebaseDatabaseService.getHistoryBySongId(currentSongData.id.toString());

      // Transform Firebase data to match HistoryEntry interface
      const transformedData: HistoryEntry[] = (data || []).map((entry: any) => ({
        id: entry.id,
        type: entry.type,
        title: entry.title,
        description: entry.description || '',
        old_value: entry.old_value || '',
        new_value: entry.new_value || '',
        created_by: entry.created_by || '',
        date: entry.created_at || entry.date || new Date().toISOString(),
        version: entry.title || ''
      }));

      setHistoryEntries(transformedData);
    } catch (error) {
      console.error('Error loading history entries:', error);
      setHistoryError('Failed to load history');
      setHistoryEntries([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Load history when song changes (same as EditSongModal)
  useEffect(() => {
    if (currentSongData?.id && isOpen) {
      loadHistoryEntries();
    } else {
      setHistoryEntries([]);
    }
  }, [currentSongData?.id, isOpen]);

  // Listen for history updates from EditSongModal (same as EditSongModal pattern)
  useEffect(() => {
    const handleHistoryUpdate = () => {
      // Add a small delay to ensure Firebase has processed the update
      // This ensures we get the latest data, not cached data
      setTimeout(() => {
        loadHistoryEntries();
      }, 300);
    };

    window.addEventListener('historyUpdated', handleHistoryUpdate);

    return () => {
      window.removeEventListener('historyUpdated', handleHistoryUpdate);
    };
  }, [currentSongData?.id, isOpen]);

  // Get history data for the current song using local state (same as EditSongModal)
  const getHistoryData = (type: 'lyrics' | 'solfas' | 'audio' | 'comments' | 'metadata'): HistoryEntry[] => {
    return historyEntries.filter(entry => entry.type === type);
  };

  // Get latest content (what's shown in main tabs) - uses real-time data
  const getLatestContent = (type: 'lyrics' | 'solfas' | 'audio' | 'comments') => {
    // Use real-time song data if available, otherwise fallback to selectedSong
    const currentSong = realtimeSongData || selectedSong;
    if (!currentSong) return null;

    switch (type) {
      case 'lyrics':
        return currentSong.lyrics;
      case 'solfas':
        return currentSong.solfas;
      case 'audio':
        return currentSong.audioFile;
      case 'comments':
        // Use real-time comments for latest content
        const commentAuthor = getCommentLabel();
        if (realtimeComments && realtimeComments.length > 0) {
          return realtimeComments
            .filter(comment => comment.author === commentAuthor || comment.author === 'Coordinator' || comment.author === 'Pastor')
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
        }
        // Fallback to current song comments
        return currentSong.comments
          .filter(comment => comment.author === commentAuthor || comment.author === 'Coordinator' || comment.author === 'Pastor')
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      default:
        return null;
    }
  };

  // Get older comments for history (all except the latest)
  const getOlderComments = () => {
    const commentAuthor = getCommentLabel();
    // Use real-time comments if available
    if (realtimeComments && realtimeComments.length > 0) {
      const coordinatorComments = realtimeComments
        .filter(comment => comment.author === commentAuthor || comment.author === 'Coordinator' || comment.author === 'Pastor')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // Return all except the latest (which is shown in main tab)
      return coordinatorComments.slice(1);
    }

    // Fallback to real-time song data or selectedSong comments
    const currentSong = realtimeSongData || selectedSong;
    if (!currentSong || !Array.isArray(currentSong.comments)) return [];

    const coordinatorComments = currentSong.comments
      .filter(comment => comment.author === commentAuthor || comment.author === 'Coordinator' || comment.author === 'Pastor')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Return all except the first one (which is the latest)
    return coordinatorComments.slice(1);
  };

  // Get older solfas for history (all except the latest)
  const getOlderSolfas = () => {
    // Use real-time song data if available
    const currentSong = realtimeSongData || currentSongData;
    if (!currentSong?.solfas) return [];

    // For now, we only have current solfas, but this function is ready for when we have multiple versions
    // In the future, this would work like comments - showing previous versions
    return [];
  };


  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const [isDragging, setIsDragging] = useState(false);
  const [wasPlayingBeforeDrag, setWasPlayingBeforeDrag] = useState(false);

  const seekToTime = (newTime: number) => {
    if (audioRef.current && duration > 0) {
      const clampedTime = Math.max(0, Math.min(duration, newTime));

      // Ensure the audio is loaded before seeking
      if (audioRef.current.readyState >= 2) {
        audioRef.current.currentTime = clampedTime;
      } else {
        // Wait for audio to be ready then seek
        const handleCanPlay = () => {
          if (audioRef.current) {
            audioRef.current.currentTime = clampedTime;
            audioRef.current.removeEventListener('canplay', handleCanPlay);
          }
        };
        audioRef.current.addEventListener('canplay', handleCanPlay);
      }
    }
  };

  // 10-second skip functions
  const skipBackward10 = () => {
    if (audioRef.current && duration > 0) {
      const newTime = Math.max(0, currentTime - 10);
      seekToTime(newTime);
    }
  };

  const skipForward10 = () => {
    if (audioRef.current && duration > 0) {
      const newTime = Math.min(duration, currentTime + 10);
      seekToTime(newTime);
    }
  };

  const getTimeFromMouseEvent = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    return percentage * duration;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging && audioRef.current && duration > 0) {
      const newTime = getTimeFromMouseEvent(e);
      seekToTime(newTime);
    }
  };

  const handleProgressMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    setWasPlayingBeforeDrag(isPlaying);

    // Pause during drag for smoother seeking
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
    }

    const newTime = getTimeFromMouseEvent(e);
    seekToTime(newTime);
  };

  const handleProgressMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging && audioRef.current && duration > 0) {
      const newTime = getTimeFromMouseEvent(e);
      seekToTime(newTime);
    }
  };

  const handleProgressMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);

      // Resume playing if it was playing before drag
      if (wasPlayingBeforeDrag && audioRef.current) {
        audioRef.current.play().catch(error => {
          console.error('Error resuming after drag:', error);
        });
      }

    }
  };

  // Add global mouse events for dragging
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging && audioRef.current && duration > 0) {
        // Find the progress bar element
        const progressBar = document.querySelector('.progress-bar') as HTMLElement;
        if (progressBar) {
          const rect = progressBar.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const percentage = Math.max(0, Math.min(1, clickX / rect.width));
          const newTime = percentage * duration;
          seekToTime(newTime);
        }
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);

        // Resume playing if it was playing before drag
        if (wasPlayingBeforeDrag && audioRef.current) {
          audioRef.current.play().catch(error => {
            console.error('Error resuming after drag:', error);
          });
        }
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, duration, wasPlayingBeforeDrag]);

  // Listen for history updates from EditSongModal (same as EditSongModal pattern)

  if (!isOpen || !selectedSong) return null;

  return (
    <>
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className="fixed inset-0 bg-white z-[100] flex flex-col">
        {/* Responsive Container */}
        <div className="mx-auto max-w-2xl w-full h-full flex flex-col">

          {/* Fullscreen Lyrics View */}
          {isFullscreenLyrics && activeTab === 'lyrics' ? (
            <div className="fixed inset-0 bg-white z-[100] flex flex-col">
              {/* Fullscreen Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={toggleFullscreenLyrics}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <Minimize2 className="w-5 h-5 text-gray-600" />
                  </button>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{currentSongData?.title}</h2>
                    <p className="text-sm text-gray-500">{currentSongData?.writer}</p>
                  </div>
                </div>

                {/* Translation Button in Fullscreen */}

              </div>

              {/* Fullscreen Lyrics Content - Properly scrollable */}
              <div className="flex-1 overflow-y-auto -webkit-overflow-scrolling-touch p-6" style={{ height: 'calc(100vh - 80px)' }}>
                <div className="max-w-4xl mx-auto">
                  <div className="text-gray-900 leading-relaxed space-y-6 text-base text-left font-poppins">
                    {currentSongData?.lyrics ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: currentSongData.lyrics }}
                        className="prose prose-lg max-w-none"
                      />
                    ) : (
                      <div className="text-center py-12">
                        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">No lyrics available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : isFullscreenComments && activeTab === 'comments' ? (
            <div className="fixed inset-0 bg-white z-[100] flex flex-col">
              {/* Fullscreen Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={toggleFullscreenComments}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <Minimize2 className="w-5 h-5 text-gray-600" />
                  </button>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{currentSongData?.title}</h2>
                    <p className="text-sm text-gray-500">Comments</p>
                  </div>
                </div>
              </div>

              {/* Fullscreen Comments Content - Properly scrollable */}
              <div className="flex-1 overflow-y-auto -webkit-overflow-scrolling-touch p-6" style={{ height: 'calc(100vh - 80px)' }}>
                <div className="max-w-4xl mx-auto">
                  <div className="text-gray-900 leading-relaxed space-y-6 text-base text-left font-poppins">
                    {(!currentSongData?.comments || !Array.isArray(currentSongData.comments) || currentSongData.comments.length === 0) ? (
                      <div className="text-center py-12">
                        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">No comments available</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {(Array.isArray(currentSongData.comments) ? currentSongData.comments : []).map((comment: any) => (
                          <div key={comment.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                            <p className="text-gray-900 leading-relaxed mb-3 text-base whitespace-pre-wrap">{comment.text?.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span className="font-medium">{comment.author}</span>
                              <span>•</span>
                              <span>
                                {new Date(comment.date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : isFullscreenSolfas && activeTab === 'solfas' ? (
            <div className="fixed inset-0 bg-white z-[100] flex flex-col">
              {/* Fullscreen Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={toggleFullscreenSolfas}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <Minimize2 className="w-5 h-5 text-gray-600" />
                  </button>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{currentSongData?.title}</h2>
                    <p className="text-sm text-gray-500">Conductor's Guide</p>
                  </div>
                </div>
              </div>

              {/* Fullscreen Solfas Content - Properly scrollable */}
              <div className="flex-1 overflow-y-auto -webkit-overflow-scrolling-touch p-6" style={{ height: 'calc(100vh - 80px)' }}>
                <div className="max-w-4xl mx-auto">
                  <div className="text-gray-900 leading-relaxed space-y-6 text-base text-left font-poppins">
                    {currentSongData?.solfas && currentSongData.solfas.trim() !== '' ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: currentSongData.solfas }}
                        className="prose prose-lg max-w-none"
                        style={{
                          fontFamily: 'monospace',
                          fontStyle: 'italic'
                        }}
                      />
                    ) : (
                      <div className="text-center py-12">
                        <Music className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">No conductor's guide available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Normal Modal Content */}

              {/* iOS Handle */}
              <div className="flex justify-center pt-2 pb-1 flex-shrink-0">
                <div
                  onClick={onClose}
                  className="w-8 h-0.5 bg-gray-400 rounded-full cursor-pointer touch-optimized"
                ></div>
              </div>

              {/* Header with Album Art and Song Info - Sticky */}
              <div className="relative bg-white/80 backdrop-blur-xl px-6 py-4 border-b border-white/30 overflow-hidden flex-shrink-0">
                {/* Background Image with Blur */}
                <div
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                  style={{
                    backgroundImage: `url('/images/DSC_6155_scaled.jpg')`,
                    filter: 'blur(8px)',
                    transform: 'scale(1.1)'
                  }}
                />
                {/* Overlay for better text readability */}
                <div className="absolute inset-0 bg-black/40" />

                {/* Content with relative positioning */}
                <div className="relative z-10">
                  {/* Back Button Row */}
                  <div className="flex items-center mb-3">
                    <button
                      onClick={onClose}
                      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-white" />
                    </button>
                  </div>


                  {/* Main Header Row */}
                  <div className="flex items-center space-x-4 mb-3">
                    {/* Song Info - Center */}
                    <div className="flex-1 min-w-0">
                      <h1 className="text-white text-xl font-black text-center mb-4 font-poppins uppercase">{displayedSongData?.title}</h1>
                      <div className="text-white text-sm space-y-1 font-poppins">
                        <div className="border-b border-white/30 pb-1">
                          <span className="font-semibold uppercase">LEAD SINGER:</span> {displayedSongData?.leadSinger ? displayedSongData.leadSinger.split(',')[0].trim() : 'Unknown'}
                        </div>
                        <div className="flex justify-between items-center border-b border-white/30 pb-1 mb-1">
                          <span><span className="font-semibold uppercase">WRITER:</span> {displayedSongData?.writer || ''}</span>
                          <span className="font-bold">x{displayedSongData?.rehearsalCount ?? 0}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-white/30 pb-1 mb-1">
                          <span><span className="font-semibold uppercase">CONDUCTOR:</span> {displayedSongData?.conductor || ''}</span>
                          <span><span className="font-semibold uppercase">KEY:</span> {displayedSongData?.key || ''}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-white/30 pb-1 mb-1">
                          <span><span className="font-semibold uppercase">LEAD KEYBOARDIST:</span> {displayedSongData?.leadKeyboardist || ''}</span>
                          <span><span className="font-semibold uppercase">TEMPO:</span> {displayedSongData?.tempo || ''}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-white/30 pb-1 mb-1">
                          <span><span className="font-semibold uppercase">DRUMMER:</span> {displayedSongData?.drummer || ''}</span>
                          <span><span className="font-semibold uppercase">BASS GUITARIST:</span> {displayedSongData?.leadGuitarist || ''}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tab Navigation inside header */}
                  <div className="flex justify-center items-center space-x-8 pt-2">
                    <button
                      onClick={() => setActiveTab('lyrics')}
                      className="flex flex-col items-center space-y-1 transition-all duration-200 text-white hover:text-white"
                    >
                      <div className={`w-8 h-8 flex items-center justify-center rounded-full ${activeTab === 'lyrics'
                          ? 'bg-white text-black'
                          : 'text-white hover:bg-white/20'
                        }`}>
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-medium">Lyrics</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('solfas')}
                      className="flex flex-col items-center space-y-1 transition-all duration-200 text-white hover:text-white"
                    >
                      <div className={`w-8 h-8 flex items-center justify-center rounded-full ${activeTab === 'solfas'
                          ? 'bg-white text-black'
                          : 'text-white hover:bg-white/20'
                        }`}>
                        <Music className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-medium">Conductor's Guide</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('comments')}
                      className="flex flex-col items-center space-y-1 transition-all duration-200 text-white hover:text-white"
                    >
                      <div className={`w-8 h-8 flex items-center justify-center rounded-full ${activeTab === 'comments'
                          ? 'bg-white text-black'
                          : 'text-white hover:bg-white/20'
                        }`}>
                        <Users className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-medium">Comments</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('history')}
                      className="flex flex-col items-center space-y-1 transition-all duration-200 text-white hover:text-white"
                    >
                      <div className={`w-8 h-8 flex items-center justify-center rounded-full ${activeTab === 'history'
                          ? 'bg-white text-black'
                          : 'text-white hover:bg-white/20'
                        }`}>
                        <Clock className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-medium">History</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Content Area - Scrollable */}
              <div className="flex-1 px-6 py-4 overflow-y-auto" style={{ paddingBottom: '180px' }}>
                {activeTab === 'lyrics' && (
                  <div className="max-w-none">
                    <div className="text-gray-900 leading-relaxed space-y-6 text-sm text-left font-poppins">
                      {displayedSongData?.lyrics ? (
                        <div
                          dangerouslySetInnerHTML={{ __html: displayedSongData.lyrics }}
                          dir="ltr"
                          style={{
                            lineHeight: '1.8',
                            fontSize: '14px',
                            textAlign: 'left',
                            direction: 'ltr'
                          }}
                        />
                      ) : (
                        <div className="text-center py-8">
                          <div className="text-gray-500 text-sm mb-2">No Lyrics Available</div>
                          <div className="text-gray-400 text-xs">Lyrics will be displayed here when available</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'solfas' && (
                  <div className="max-w-none">
                    <div className="text-gray-900 leading-relaxed space-y-6 text-sm text-left font-poppins">
                      {displayedSongData?.solfas && displayedSongData.solfas.trim() !== '' ? (
                        <div
                          dangerouslySetInnerHTML={{ __html: displayedSongData.solfas }}
                          dir="ltr"
                          style={{
                            lineHeight: '1.8',
                            fontSize: '14px',
                            fontFamily: 'monospace',
                            fontStyle: 'italic',
                            textAlign: 'left',
                            direction: 'ltr'
                          }}
                        />
                      ) : (
                        <div className="text-center py-8">
                          <div className="text-gray-500 text-sm mb-2">No Conductor's Guide Available</div>
                          <div className="text-gray-400 text-xs">Conductor's guide notation will be displayed here when available</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'comments' && (
                  <div className="max-w-none">
                    <div className="text-gray-900 leading-relaxed space-y-6 text-sm text-left font-poppins">
                      {(!displayedSongData?.comments || !Array.isArray(displayedSongData.comments) || displayedSongData.comments.length === 0) ? (
                        <div className="text-center py-8">
                          <div className="text-gray-500 text-sm mb-2">No Comments Available</div>
                          <div className="text-gray-400 text-xs">Comments will be displayed here when available</div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {(Array.isArray(displayedSongData.comments) ? displayedSongData.comments : []).map((comment: any) => (
                            <div key={comment.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                              <p className="text-gray-900 leading-relaxed mb-2 whitespace-pre-wrap">{comment.text?.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()}</p>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span className="font-medium">{comment.author}</span>
                                <span>•</span>
                                <span>
                                  {new Date(comment.date).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'history' && (
                  <div className="space-y-4">
                    {/* History Sub-categories */}
                    <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
                      <button
                        onClick={() => setActiveHistoryTab('lyrics')}
                        className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${activeHistoryTab === 'lyrics'
                            ? 'text-white shadow-md'
                            : 'bg-white/70 backdrop-blur-sm text-slate-700 hover:bg-white/90 hover:shadow-sm border border-slate-200/50'
                          }`}
                        style={activeHistoryTab === 'lyrics' ? { backgroundColor: zoneColor } : {}}
                      >
                        Lyrics
                      </button>
                      <button
                        onClick={() => setActiveHistoryTab('audio')}
                        className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${activeHistoryTab === 'audio'
                            ? 'text-white shadow-md'
                            : 'bg-white/70 backdrop-blur-sm text-slate-700 hover:bg-white/90 hover:shadow-sm border border-slate-200/50'
                          }`}
                        style={activeHistoryTab === 'audio' ? { backgroundColor: zoneColor } : {}}
                      >
                        Audio
                      </button>
                      <button
                        onClick={() => setActiveHistoryTab('solfas')}
                        className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${activeHistoryTab === 'solfas'
                            ? 'text-white shadow-md'
                            : 'bg-white/70 backdrop-blur-sm text-slate-700 hover:bg-white/90 hover:shadow-sm border border-slate-200/50'
                          }`}
                        style={activeHistoryTab === 'solfas' ? { backgroundColor: zoneColor } : {}}
                      >
                        Conductor's Guide
                      </button>
                      <button
                        onClick={() => setActiveHistoryTab('comments')}
                        className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${activeHistoryTab === 'comments'
                            ? 'text-white shadow-md'
                            : 'bg-white/70 backdrop-blur-sm text-slate-700 hover:bg-white/90 hover:shadow-sm border border-slate-200/50'
                          }`}
                        style={activeHistoryTab === 'comments' ? { backgroundColor: zoneColor } : {}}
                      >
                        {getCommentLabel()}'s Comments
                      </button>
                      <button
                        onClick={() => setActiveHistoryTab('metadata')}
                        className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${activeHistoryTab === 'metadata'
                            ? 'text-white shadow-md'
                            : 'bg-white/70 backdrop-blur-sm text-slate-700 hover:bg-white/90 hover:shadow-sm border border-slate-200/50'
                          }`}
                        style={activeHistoryTab === 'metadata' ? { backgroundColor: zoneColor } : {}}
                      >
                        Song Details
                      </button>
                    </div>

                    {/* History Content */}
                    <div className="min-h-[200px]">
                      {activeHistoryTab === 'lyrics' && (
                        <div className="space-y-4">
                          {isLoadingHistory ? (
                            <div className="text-center py-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                              <p className="text-gray-500 text-sm">Loading lyrics history...</p>
                            </div>
                          ) : getHistoryData('lyrics').length === 0 ? (
                            <div className="text-center py-8">
                              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                              <p className="text-gray-500 text-sm font-medium">No Lyrics History</p>
                              <p className="text-gray-400 text-xs mt-1">Changes will appear here</p>
                              <button
                                onClick={() => loadHistoryEntries()}
                                className="mt-4 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
                                title="Refresh history"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {getHistoryData('lyrics').map((entry) => {
                                const isExpanded = expandedHistoryEntries.has(entry.id);
                                return (
                                  <div key={entry.id} className="bg-white/70 backdrop-blur-sm rounded-lg border border-slate-200/50 overflow-hidden">
                                    <div
                                      className="p-4 cursor-pointer hover:bg-white/80 transition-colors"
                                      onClick={() => toggleHistoryEntry(entry.id)}
                                    >
                                      <div className="flex items-start gap-3">
                                        <div
                                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                          style={{
                                            background: `linear-gradient(to right, ${zoneColor}, ${darkenColor(zoneColor, 10)})`
                                          }}
                                        >
                                          <BookOpen className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-2">
                                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                              {entry.type}
                                            </span>
                                            <span className="text-xs text-slate-500">
                                              {formatDateTime(entry.date).date} at {formatDateTime(entry.date).time}
                                            </span>
                                          </div>
                                          <div className="flex items-center justify-between">
                                            <h4 className="font-medium text-slate-900">{entry.title}</h4>
                                            {isExpanded ? (
                                              <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
                                            ) : (
                                              <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    {isExpanded && (
                                      <div className="px-4 pb-4">
                                        <div className="text-sm text-slate-700 bg-white/50 backdrop-blur-sm p-3 rounded border border-slate-200/50">
                                          <div dangerouslySetInnerHTML={{ __html: entry.new_value }} />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {activeHistoryTab === 'audio' && (
                        <div className="space-y-4">
                          {isLoadingHistory ? (
                            <div className="text-center py-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                              <p className="text-gray-500 text-sm">Loading audio history...</p>
                            </div>
                          ) : getHistoryData('audio').length === 0 ? (
                            <div className="text-center py-8">
                              <Music className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                              <p className="text-gray-500 text-sm font-medium">No Audio History</p>
                              <p className="text-gray-400 text-xs mt-1">Changes will appear here</p>
                              <button
                                onClick={() => loadHistoryEntries()}
                                className="mt-4 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
                                title="Refresh history"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {getHistoryData('audio').map((entry) => {
                                const isExpanded = expandedHistoryEntries.has(entry.id);
                                return (
                                  <div key={entry.id} className="bg-white/70 backdrop-blur-sm rounded-lg border border-slate-200/50 overflow-hidden">
                                    <div
                                      className="p-4 cursor-pointer hover:bg-white/80 transition-colors"
                                      onClick={() => toggleHistoryEntry(entry.id)}
                                    >
                                      <div className="flex items-start gap-3">
                                        <div
                                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                          style={{
                                            background: `linear-gradient(to right, ${zoneColor}, ${darkenColor(zoneColor, 10)})`
                                          }}
                                        >
                                          <Music className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-2">
                                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                              {entry.type}
                                            </span>
                                            <span className="text-xs text-slate-500">
                                              {formatDateTime(entry.date).date} at {formatDateTime(entry.date).time}
                                            </span>
                                          </div>
                                          <div className="flex items-center justify-between">
                                            <h4 className="font-medium text-slate-900">{entry.title}</h4>
                                            {isExpanded ? (
                                              <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
                                            ) : (
                                              <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    {isExpanded && (
                                      <div className="px-4 pb-4">
                                        <div className="bg-white/50 backdrop-blur-sm p-3 rounded border border-slate-200/50">
                                          <div className="flex items-center gap-3">
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleHistoryAudioPlayPause(entry.id);
                                              }}
                                              className="w-10 h-10 rounded-full text-white transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
                                              style={{
                                                backgroundColor: zoneColor
                                              }}
                                              onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = darkenColor(zoneColor, 10);
                                              }}
                                              onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = zoneColor;
                                              }}
                                            >
                                              {historyAudioStates[entry.id]?.isPlaying ? (
                                                <Pause className="w-5 h-5" />
                                              ) : (
                                                <Play className="w-5 h-5 ml-0.5" />
                                              )}
                                            </button>
                                            <div className="flex-1">
                                              <div className="text-sm font-medium text-slate-800">Previous Audio Version</div>
                                              <div className="text-xs text-slate-500 mt-2 bg-slate-100 px-2 py-1 rounded-full inline-block">
                                                {formatTime(historyAudioStates[entry.id]?.currentTime || 0)} / {formatTime(historyAudioStates[entry.id]?.duration || 0)}
                                              </div>
                                            </div>
                                          </div>
                                          <audio
                                            ref={el => {
                                              if (el) historyAudioRefs.current[entry.id] = el;
                                            }}
                                            src={entry.new_value}
                                            onTimeUpdate={() => handleHistoryAudioTimeUpdate(entry.id)}
                                            onLoadedMetadata={() => handleHistoryAudioLoadedMetadata(entry.id)}
                                            onEnded={() => handleHistoryAudioEnded(entry.id)}
                                            preload="metadata"
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {activeHistoryTab === 'solfas' && (
                        <div className="space-y-4">
                          {isLoadingHistory ? (
                            <div className="text-center py-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                              <p className="text-gray-500 text-sm">Loading conductor's guide history...</p>
                            </div>
                          ) : getHistoryData('solfas').length === 0 ? (
                            <div className="text-center py-8">
                              <Music className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                              <p className="text-gray-500 text-sm font-medium">No Conductor's Guide History</p>
                              <p className="text-gray-400 text-xs mt-1">Changes will appear here</p>
                              <button
                                onClick={() => loadHistoryEntries()}
                                className="mt-4 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
                                title="Refresh history"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {getHistoryData('solfas').map((entry) => {
                                const isExpanded = expandedHistoryEntries.has(entry.id);
                                return (
                                  <div key={entry.id} className="bg-white/70 backdrop-blur-sm rounded-lg border border-slate-200/50 overflow-hidden">
                                    <div
                                      className="p-4 cursor-pointer hover:bg-white/80 transition-colors"
                                      onClick={() => toggleHistoryEntry(entry.id)}
                                    >
                                      <div className="flex items-start gap-3">
                                        <div
                                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                          style={{
                                            background: `linear-gradient(to right, ${zoneColor}, ${darkenColor(zoneColor, 10)})`
                                          }}
                                        >
                                          <Music className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-2">
                                            <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                                              {entry.type}
                                            </span>
                                            <span className="text-xs text-slate-500">
                                              {formatDateTime(entry.date).date} at {formatDateTime(entry.date).time}
                                            </span>
                                          </div>
                                          <div className="flex items-center justify-between">
                                            <h4 className="font-medium text-slate-900">{entry.title}</h4>
                                            {isExpanded ? (
                                              <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
                                            ) : (
                                              <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    {isExpanded && (
                                      <div className="px-4 pb-4">
                                        <div className="text-sm text-slate-700 bg-white/50 backdrop-blur-sm p-3 rounded border border-slate-200/50">
                                          <div dangerouslySetInnerHTML={{ __html: entry.new_value }} />
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {activeHistoryTab === 'comments' && (
                        <div className="space-y-4">
                          {isLoadingHistory ? (
                            <div className="text-center py-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                              <p className="text-gray-500 text-sm">Loading comments history...</p>
                            </div>
                          ) : getHistoryData('comments').length === 0 ? (
                            <div className="text-center py-8">
                              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                              <p className="text-gray-500 text-sm font-medium">No Comments History</p>
                              <p className="text-gray-400 text-xs mt-1">Changes will appear here</p>
                              <button
                                onClick={() => loadHistoryEntries()}
                                className="mt-4 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
                                title="Refresh history"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {getHistoryData('comments').map((entry) => {
                                const isExpanded = expandedHistoryEntries.has(entry.id);
                                return (
                                  <div key={entry.id} className="bg-white/70 backdrop-blur-sm rounded-lg border border-slate-200/50 overflow-hidden">
                                    <div
                                      className="p-4 cursor-pointer hover:bg-white/80 transition-colors"
                                      onClick={() => toggleHistoryEntry(entry.id)}
                                    >
                                      <div className="flex items-start gap-3">
                                        <div
                                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                          style={{
                                            background: `linear-gradient(to right, ${zoneColor}, ${darkenColor(zoneColor, 10)})`
                                          }}
                                        >
                                          <Users className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-2">
                                            <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                                              {entry.type}
                                            </span>
                                            <span className="text-xs text-slate-500">
                                              {formatDateTime(entry.date).date} at {formatDateTime(entry.date).time}
                                            </span>
                                          </div>
                                          <div className="flex items-center justify-between">
                                            <h4 className="font-medium text-slate-900">{entry.title}</h4>
                                            {isExpanded ? (
                                              <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
                                            ) : (
                                              <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    {isExpanded && (
                                      <div className="px-4 pb-4">
                                        <div className="text-sm text-slate-700 bg-white/50 backdrop-blur-sm p-3 rounded border border-slate-200/50">
                                          <p className="whitespace-pre-wrap">{entry.new_value?.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()}</p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {activeHistoryTab === 'metadata' && (
                        <div className="space-y-4">
                          {isLoadingHistory ? (
                            <div className="text-center py-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                              <p className="text-gray-500 text-sm">Loading song details history...</p>
                            </div>
                          ) : getHistoryData('metadata').length === 0 ? (
                            <div className="text-center py-8">
                              <Settings className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                              <p className="text-gray-500 text-sm font-medium">No Song Details History</p>
                              <p className="text-gray-400 text-xs mt-1">Changes will appear here</p>
                              <button
                                onClick={() => loadHistoryEntries()}
                                className="mt-4 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
                                title="Refresh history"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {getHistoryData('metadata').map((entry) => {
                                const isExpanded = expandedHistoryEntries.has(entry.id);
                                return (
                                  <div key={entry.id} className="bg-white/70 backdrop-blur-sm rounded-lg border border-slate-200/50 overflow-hidden">
                                    <div
                                      className="p-4 cursor-pointer hover:bg-white/80 transition-colors"
                                      onClick={() => toggleHistoryEntry(entry.id)}
                                    >
                                      <div className="flex items-start gap-3">
                                        <div
                                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                          style={{
                                            background: `linear-gradient(to right, ${zoneColor}, ${darkenColor(zoneColor, 10)})`
                                          }}
                                        >
                                          <Settings className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-2">
                                            <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                                              {entry.type}
                                            </span>
                                            <span className="text-xs text-slate-500">
                                              {formatDateTime(entry.date).date} at {formatDateTime(entry.date).time}
                                            </span>
                                          </div>
                                          <div className="flex items-center justify-between">
                                            <h4 className="font-medium text-slate-900">{entry.title}</h4>
                                            {isExpanded ? (
                                              <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
                                            ) : (
                                              <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    {isExpanded && (
                                      <div className="px-4 pb-4">
                                        <div className="text-sm text-slate-700 bg-white/50 backdrop-blur-sm p-3 rounded border border-slate-200/50">
                                          <p className="whitespace-pre-wrap">{entry.new_value?.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()}</p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>


              {/* Floating Fullscreen Button - Positioned close to the player */}
              {activeTab === 'lyrics' && !isFullscreenLyrics && (
                <button
                  onClick={toggleFullscreenLyrics}
                  className="fixed bottom-28 right-3 sm:right-4 w-10 h-10 sm:w-11 sm:h-11 text-white rounded-full shadow-lg transition-all duration-200 z-[110] hover:scale-105 flex items-center justify-center"
                  style={{
                    backgroundColor: zoneColor
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = darkenColor(zoneColor, 10);
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = zoneColor;
                  }}
                  title="Fullscreen Lyrics"
                >
                  <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              )}

              {activeTab === 'comments' && !isFullscreenComments && (
                <button
                  onClick={toggleFullscreenComments}
                  className="fixed bottom-28 right-3 sm:right-4 w-10 h-10 sm:w-11 sm:h-11 text-white rounded-full shadow-lg transition-all duration-200 z-[110] hover:scale-105 flex items-center justify-center"
                  style={{
                    backgroundColor: zoneColor
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = darkenColor(zoneColor, 10);
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = zoneColor;
                  }}
                  title="Fullscreen Comments"
                >
                  <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              )}

              {activeTab === 'solfas' && !isFullscreenSolfas && (
                <button
                  onClick={toggleFullscreenSolfas}
                  className="fixed bottom-28 right-3 sm:right-4 w-10 h-10 sm:w-11 sm:h-11 text-white rounded-full shadow-lg transition-all duration-200 z-[110] hover:scale-105 flex items-center justify-center"
                  style={{
                    backgroundColor: zoneColor
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = darkenColor(zoneColor, 10);
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = zoneColor;
                  }}
                  title="Fullscreen Conductor's Guide"
                >
                  <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              )}

              {/* Compact Music Player - Fixed at Bottom */}
              <div className="fixed bottom-0 left-0 right-0 px-6 modal-bottom-safe bg-white border-t border-gray-100 z-[100]">

                {/* Progress Bar */}
                <div className="mb-2">
                  <div
                    className="progress-bar w-full h-1 bg-gray-300 rounded-full relative cursor-pointer hover:h-1.5 transition-all duration-200 select-none touch-optimized"
                    onClick={handleProgressClick}
                    onMouseDown={handleProgressMouseDown}
                    onMouseMove={handleProgressMouseMove}
                    onMouseUp={handleProgressMouseUp}
                  >
                    <div
                      className="h-full bg-gray-600 rounded-full relative transition-all duration-200"
                      style={{ width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%' }}
                    >
                      <div className={`absolute right-0 top-1/2 transform -translate-y-1/2 rounded-full transition-all duration-200 ${isDragging ? 'w-4 h-4 bg-blue-600' : 'w-3 h-3 bg-gray-600 hover:w-4 hover:h-4'
                        }`}></div>
                    </div>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-gray-600 text-xs">{formatTime(currentTime)}</span>
                    <span className="text-gray-600 text-xs">{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Main Controls */}
                <div className="flex items-center justify-evenly px-2">
                  {/* Repeat Button */}
                  <button
                    onClick={toggleRepeat}
                    className={`w-5 h-5 flex items-center justify-center transition-colors ${isRepeating ? 'text-blue-600' : 'text-gray-600 hover:text-gray-800'
                      }`}
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${isRepeating ? 'fill-current' : ''}`} />
                  </button>

                  {/* Previous Track */}
                  <button
                    onClick={handlePrevious}
                    className="w-5 h-5 flex items-center justify-center hover:text-gray-800 transition-colors"
                  >
                    <SkipBack className="w-4 h-4 text-gray-600 fill-gray-600" />
                  </button>

                  {/* 10 Second Backward */}
                  <button
                    onClick={skipBackward10}
                    className="relative w-4 h-4 flex items-center justify-center hover:text-gray-800 transition-colors"
                    title="Skip backward 10 seconds"
                  >
                    <RotateCcw className="w-3 h-3 text-gray-600" />
                    <span className="absolute text-[4px] text-gray-600 font-bold leading-none top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">10</span>
                  </button>

                  {/* Center Play/Pause Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      // Pause all history audios first
                      Object.keys(historyAudioRefs.current).forEach(id => {
                        if (historyAudioRefs.current[id]) {
                          historyAudioRefs.current[id]!.pause();
                        }
                      });

                      // Direct test - bypass the context for debugging
                      if (audioRef.current) {
                        if (audioRef.current.paused) {
                          audioRef.current.play().then(() => {
                          }).catch(error => {
                            console.error('❌ Direct play failed:', error);
                          });
                        } else {
                          audioRef.current.pause();
                        }
                      } else {
                        console.error('❌ No audioRef.current available');
                      }

                      // Also call the context method
                      togglePlayPause();
                    }}
                    disabled={isLoading || hasError}
                    className={`w-10 h-10 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-sm ${hasError
                        ? 'bg-red-500 cursor-not-allowed'
                        : isLoading
                          ? 'bg-gray-400 cursor-wait'
                          : 'bg-gray-600'
                      }`}
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : hasError ? (
                      <div className="w-4 h-4 text-white text-xs">!</div>
                    ) : isPlaying ? (
                      <Pause className="w-4 h-4 text-white" />
                    ) : (
                      <Play className="w-4 h-4 text-white ml-0.5" />
                    )}
                  </button>

                  {/* 10 Second Forward */}
                  <button
                    onClick={skipForward10}
                    className="relative w-4 h-4 flex items-center justify-center hover:text-gray-800 transition-colors"
                    title="Skip forward 10 seconds"
                  >
                    <RotateCw className="w-3 h-3 text-gray-600" />
                    <span className="absolute text-[4px] text-gray-600 font-bold leading-none top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">10</span>
                  </button>

                  {/* Next Track */}
                  <button
                    onClick={handleNext}
                    className="w-5 h-5 flex items-center justify-center hover:text-gray-800 transition-colors"
                  >
                    <SkipForward className="w-4 h-4 text-gray-600 fill-gray-600" />
                  </button>

                  {/* Music Page Button */}
                  <button
                    onClick={handleMusicPage}
                    disabled={isNavigatingToAudioLab}
                    className="w-5 h-5 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
                  >
                    {isNavigatingToAudioLab ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Music2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
