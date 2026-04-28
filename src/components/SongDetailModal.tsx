"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, BookOpen, Music, Users, Clock, Play, Pause, Music2, ChevronDown, ChevronUp, RefreshCw, Loader2, MoreVertical } from "lucide-react";
import { PraiseNightSong, HistoryEntry } from "@/types/supabase";
import { useAudio } from "@/contexts/AudioContext";
import { useZone } from "@/hooks/useZone";
import { isHQGroup } from "@/config/zones";
import { FirebaseDatabaseService } from "@/lib/firebase-database";
import { useRealtimeComments } from "@/hooks/useRealtimeComments";
import { useRealtimeSongData } from "@/hooks/useRealtimeSongData";
import { NavigationManager } from "@/utils/navigation";
import { formatTime } from "@/utils/string-utils";

// Modular Components
import { SongLyrics } from "./song-detail/SongLyrics";
import { SongSolfas } from "./song-detail/SongSolfas";
import { SongComments } from "./song-detail/SongComments";
import { SongHistory } from "./song-detail/SongHistory";
import { SongAudioPlayer } from "./song-detail/SongAudioPlayer";

interface SongDetailModalProps {
  selectedSong: PraiseNightSong | null;
  isOpen: boolean;
  onClose: () => void;
  onSongChange?: (song: PraiseNightSong) => void;
  currentFilter?: 'heard' | 'unheard'; // Add current filter prop
  songs?: PraiseNightSong[]; // Add songs prop
  activeCategory?: string; // Add active category prop
  isSubGroup?: boolean;
}

export default function SongDetailModal({ selectedSong, isOpen, onClose, onSongChange, currentFilter = 'heard', songs = [], activeCategory = '', isSubGroup = false }: SongDetailModalProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'lyrics' | 'solfas' | 'comments' | 'history' | 'notation'>('lyrics');
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    };

    if (showMoreMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMoreMenu]);

  const [activeHistoryTab, setActiveHistoryTab] = useState<'lyrics' | 'audio' | 'solfas' | 'comments' | 'metadata' | 'notation'>('lyrics');
  const [isRepeating, setIsRepeating] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [categorySongs, setCategorySongs] = useState<PraiseNightSong[]>([]);
  
  // Navigation lock
  const isNavigatingRef = useRef(false);

  // Fullscreen state
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
    if (isSubGroup) return "Sub-Group Lead";
    // HQ groups see "Pastor Comments", regular zones see "Coordinator Comments"
    return isHQGroup(currentZone?.id) ? "Pastor" : "Coordinator";
  };

  // Helper to format comment text with bold and larger font for *text* or **text**

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
  const historyAudioRefs = useRef<{ [key: string]: HTMLAudioElement | null }>({});
  const [mainPlayerWasPlaying, setMainPlayerWasPlaying] = useState(false);

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
  const { currentSong, isPlaying, currentTime, duration, isLoading, hasError, togglePlayPause, audioRef, setCurrentSong, setCurrentTime: setCurrentTimeManual } = useAudio();

  // Use the selected song as the base; realtime hook will layer live data on top
  const currentSongData = selectedSong;

  // Set the current song when modal opens (only if it's a different song)
  // BUT skip if we're in the middle of an intentional navigation (skip/autoAdvance)
  useEffect(() => {
    if (selectedSong && isOpen) {
      // If we're navigating internally, don't override the song
      if (isNavigatingRef.current) {
        isNavigatingRef.current = false;
        return;
      }

      // Only set the song if it's different from the current one
      // This prevents restarting the same song when opening the modal
      if (currentSong?.id !== selectedSong.id) {
        setCurrentSong(selectedSong, false);
      }
    }
  }, [selectedSong?.title, isOpen, currentSong?.id]);

  // Load songs from the same category AND current filter, find current song index
  useEffect(() => {
    if (selectedSong) {
      const songsInCategory = songs.filter(song => {
        const matchesStatus = song.status === currentFilter;
        
        // Match category using the same logic as page.tsx
        let matchesCategory = false;
        if (activeCategory) {
          if (song.categories && Array.isArray(song.categories) && song.categories.length > 0) {
            matchesCategory = song.categories.some((cat: string) => cat.trim() === activeCategory.trim());
          } else {
            matchesCategory = (song.category || '').trim() === activeCategory.trim();
          }
        } else {
          // If no activeCategory provided, fall back to matching selectedSong's own category
          const targetCat = selectedSong.category || (selectedSong.categories && selectedSong.categories[0]);
          if (targetCat) {
            if (song.categories && Array.isArray(song.categories) && song.categories.length > 0) {
              matchesCategory = song.categories.some((cat: string) => cat.trim() === targetCat.trim());
            } else {
              matchesCategory = (song.category || '').trim() === targetCat.trim();
            }
          } else {
            matchesCategory = true; // Fallback to all songs if category is totally missing
          }
        }
        
        return matchesStatus && matchesCategory;
      });
      
      setCategorySongs(songsInCategory);

      const index = songsInCategory.findIndex(song => song.id === selectedSong.id || song.title === selectedSong.title);
      setCurrentSongIndex(index >= 0 ? index : 0);
    }
  }, [selectedSong, currentFilter, songs, activeCategory]);

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
            isNavigatingRef.current = true;
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
        isNavigatingRef.current = true;
        setCurrentSongIndex(currentSongIndex - 1);
        onSongChange(prevSong);
        // Set the new song in audio context and auto-play
        setCurrentSong(prevSong, true);
      }
    } else if (audioRef.current && duration > 0) {
      // If at first song or no songs, skip back 10 seconds
      const newTime = Math.max(0, audioRef.current.currentTime - 10);
      setCurrentTimeManual(newTime);
    }
  };

  const handleNext = () => {

    if (currentSongIndex < categorySongs.length - 1 && categorySongs.length > 0) {
      // Go to next song
      const nextSong = categorySongs[currentSongIndex + 1];
      if (nextSong && onSongChange) {
        isNavigatingRef.current = true;
        setCurrentSongIndex(currentSongIndex + 1);
        onSongChange(nextSong);
        // Set the new song in audio context and auto-play
        setCurrentSong(nextSong, true);
      }
    } else if (audioRef.current && duration > 0) {
      // If at last song or no songs, skip forward 10 seconds
      const newTime = Math.min(duration, audioRef.current.currentTime + 10);
      setCurrentTimeManual(newTime);
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

      // We add a small delay to ensure the user sees the spinner 
      // and to let any pending state updates settle
      setTimeout(() => {
        // Use encodeURIComponent to handle song title
        // Add program=ongoing so LibraryView knows to switch tabs
        const targetId = currentSongData.title;
        router.push(`/pages/audiolab?view=library&program=ongoing&song=${encodeURIComponent(targetId)}`);

        // Push depth since we are navigating deeper
        NavigationManager.push();

        // IMPORTANT: We do NOT call onClose() here.
        // Calling onClose() triggers a router.back() in many layouts (like PraiseNightPage),
        // which can cancel the forward navigation to AudioLab.
        // The page transition will naturally unmount this modal.
      }, 500);
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
    comments: realtimeComments
  } = useRealtimeComments({
    songId: currentSongData?.id?.toString() || null,
    enabled: isOpen && activeHistoryTab === 'comments'
  });

  // Use real-time song data hook (no cache)
  const {
    songData: realtimeSongData
  } = useRealtimeSongData({
    songId: currentSongData?.id?.toString() || null,
    enabled: isOpen, // Always enabled when modal is open
    zoneId: currentZone?.id || null, // CRITICAL: read from same collection the admin writes to
  });

  // Single source of truth for what the UI should display (realtime → fresh → initial)
  const displayedSongData = realtimeSongData || currentSongData;

  // Close More menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    };

    if (showMoreMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMoreMenu]);

  // Load history entries for the current song (same as EditSongModal)
  const loadHistoryEntries = async () => {
    if (!currentSongData?.id) {
      setHistoryEntries([]);
      setIsLoadingHistory(false);
      return;
    }

    try {
      if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
 console.warn('️ Firebase not configured - history features will not work');
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
  const getHistoryData = (type: 'lyrics' | 'solfas' | 'audio' | 'comments' | 'metadata' | 'notation'): HistoryEntry[] => {
    return historyEntries.filter(entry => entry.type === type);
  };





  const [isDragging, setIsDragging] = useState(false);
  const [wasPlayingBeforeDrag, setWasPlayingBeforeDrag] = useState(false);

  const seekToTime = (newTime: number) => {
    if (audioRef.current && duration > 0) {
      const clampedTime = Math.max(0, Math.min(duration, newTime));

      // Ensure the audio is loaded before seeking
      if (audioRef.current.readyState >= 2) {
        setCurrentTimeManual(clampedTime);
      } else {
        // Wait for audio to be ready then seek
        const handleCanPlay = () => {
          if (audioRef.current) {
            setCurrentTimeManual(clampedTime);
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
    if (audioRef.current && duration > 0) {
      const newTime = getTimeFromMouseEvent(e);
      seekToTime(newTime);
    }
  };

  const dragStartPos = useRef<{ x: number; time: number } | null>(null);

  const handleProgressMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    // Record where the drag started — we'll only enter "dragging" mode
    // once the mouse actually moves, so simple clicks still work.
    dragStartPos.current = { x: e.clientX, time: Date.now() };
    setWasPlayingBeforeDrag(isPlaying);
  };

  const handleProgressMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragStartPos.current && audioRef.current && duration > 0) {
      const dx = Math.abs(e.clientX - dragStartPos.current.x);
      
      // Only start dragging after 3px of movement (prevents accidental drags)
      if (!isDragging && dx > 3) {
        setIsDragging(true);
        // Pause during drag for smoother seeking
        if (isPlaying && audioRef.current) {
          audioRef.current.pause();
        }
      }

      if (isDragging) {
        const newTime = getTimeFromMouseEvent(e);
        seekToTime(newTime);
      }
    }
  };

  const handleProgressMouseUp = () => {
    dragStartPos.current = null;
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
      if (dragStartPos.current && audioRef.current && duration > 0) {
        const dx = Math.abs(e.clientX - dragStartPos.current.x);
        
        // Only start dragging after 3px of movement
        if (!isDragging && dx > 3) {
          setIsDragging(true);
          if (wasPlayingBeforeDrag && audioRef.current) {
            audioRef.current.pause();
          }
        }

        if (isDragging) {
          const progressBar = document.querySelector('.progress-bar') as HTMLElement;
          if (progressBar) {
            const rect = progressBar.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const percentage = Math.max(0, Math.min(1, clickX / rect.width));
            const newTime = percentage * duration;
            seekToTime(newTime);
          }
        }
      }
    };

    const handleGlobalMouseUp = () => {
      dragStartPos.current = null;
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

    if (dragStartPos.current || isDragging) {
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
        .bg-music-doodle {
          background-color: #ffffff;
          background-image: url("data:image/svg+xml,%3Csvg width='250' height='250' viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23D946EF' fill-opacity='0.06'%3E%3C!-- Official IoMic Path --%3E%3Cpath d='M110 50c1.66 0 3-1.34 3-3V35c0-1.66-1.34-3-3-3s-3 1.34-3 3v12c0 1.66 1.34 3 3 3zM115.3 41c0 2.54-2.04 4.63-4.57 4.93V49h-1.46v-3.07a4.996 4.996 0 01-4.57-4.93h-1.48c0 3.19 2.39 5.8 5.48 6.4v3.13h-2.19c-.43 0-.78.35-.78.78s.35.78.78.78h5.83c.43 0 .78-.35.78-.78s-.35-.78-.78-.78h-2.19v-3.13c3.09-.6 5.48-3.21 5.48-6.4h-1.48z' transform='scale(1.2)'/%3E%3C!-- Official IoHeadset Path --%3E%3Cpath d='M50 20c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8h-4v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z' transform='scale(1.3) translate(15, 0)'/%3E%3C!-- Official IoMusicalNotes Path --%3E%3Cpath d='M180 30l-10 2.45v10.55c-.5-.15-1-.24-1.5-.24-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4v-11.4l8-1.96V37.5c-.5-.15-1-.24-1.5-.24-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4v-11z' transform='scale(1.3)'/%3E%3C!-- Official GiGuitar Path --%3E%3Cpath d='M30 150c0 5 4 9 9 9s9-4 9-9c0-6-4.5-8-4.5-13 0-4 1.5-6 1.5-6h-12s1.5 2 1.5 6c0 5-4.5 7-4.5 13z' transform='scale(1.2) rotate(15, 39, 150)'/%3E%3C!-- Official GiPianoKeys Path --%3E%3Cpath d='M160 140h28v20h-28z M164 140v12h2v-12z M168 140v12h2v-12z M174 140v12h2v-12z M178 140v12h2v-12z' transform='scale(1.4) rotate(10, 174, 150)'/%3E%3C/g%3E%3C/svg%3E");
          background-repeat: repeat;
        }
      `}</style>
      <div className="fixed inset-0 bg-white bg-music-doodle z-[1000] flex flex-col">
        {/* Responsive Container */}
        <div className="mx-auto max-w-2xl w-full h-full flex flex-col">

          {/* Fullscreen Lyrics View */}
          {isFullscreenLyrics && activeTab === 'lyrics' ? (
            <SongLyrics 
              isFullscreen={true}
              onToggleFullscreen={toggleFullscreenLyrics}
              lyrics={currentSongData?.lyrics}
              title={currentSongData?.title}
              writer={currentSongData?.writer}
            />
          ) : isFullscreenComments && activeTab === 'comments' ? (
            <SongComments 
              isFullscreen={true}
              onToggleFullscreen={toggleFullscreenComments}
              comments={displayedSongData?.comments}
              zoneColor={zoneColor}
              commentLabel={getCommentLabel()}
              title={currentSongData?.title}
            />
          ) : isFullscreenSolfas && activeTab === 'solfas' ? (
            <SongSolfas 
              isFullscreen={true}
              onToggleFullscreen={toggleFullscreenSolfas}
              solfas={currentSongData?.solfas}
              title={currentSongData?.title}
            />
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

              {/* Sticky Header */}
              <div className="relative z-[100] bg-white/80 backdrop-blur-xl border-b border-white/30 flex-shrink-0">
                {/* Background layers wrapper with overflow hidden to contain the blur/scale */}
                <div className="absolute inset-0 overflow-hidden z-0">
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
                </div>

                {/* Content with relative positioning */}
                <div className="relative z-10 px-6 py-4">
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
                  <div className="flex justify-between sm:justify-center items-start sm:items-center sm:space-x-8 pt-2 w-full px-1 sm:px-0">
                    <button
                      onClick={() => setActiveTab('lyrics')}
                      className="flex flex-col items-center space-y-1 transition-all duration-200 text-white hover:text-white flex-1 sm:flex-none px-1"
                    >
                      <div className={`w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0 ${activeTab === 'lyrics'
                        ? 'bg-white text-black'
                        : 'text-white hover:bg-white/20'
                        }`}>
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] sm:text-xs font-medium text-center leading-tight">Lyrics</span>
                    </button>
                    {!isSubGroup && (
                      <button
                        onClick={() => setActiveTab('solfas')}
                        className="flex flex-col items-center space-y-1 transition-all duration-200 text-white hover:text-white flex-1 sm:flex-none px-1"
                      >
                        <div className={`w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0 ${activeTab === 'solfas'
                          ? 'bg-white text-black'
                          : 'text-white hover:bg-white/20'
                          }`}>
                          <Music className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] sm:text-xs font-medium text-center leading-tight">Conductor's Guide</span>
                      </button>
                    )}
                    <button
                      onClick={() => setActiveTab('comments')}
                      className="flex flex-col items-center space-y-1 transition-all duration-200 text-white hover:text-white flex-1 sm:flex-none px-1"
                    >
                      <div className={`w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0 ${activeTab === 'comments'
                        ? 'bg-white text-black'
                        : 'text-white hover:bg-white/20'
                        }`}>
                        <Users className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] sm:text-xs font-medium text-center leading-tight">Comments</span>
                    </button>
                    {/* History is now in the More menu */}

                    {/* More Menu */}
                    {!isSubGroup && (
                      <div className="flex-1 sm:flex-none flex justify-center px-1" ref={moreMenuRef}>
                        <div className="relative flex flex-col items-center w-full">
                          <button
                            onClick={() => setShowMoreMenu(!showMoreMenu)}
                            className={`flex flex-col items-center space-y-1 w-full transition-all duration-200 text-white hover:text-white ${(activeTab === 'notation' || activeTab === 'history') ? 'scale-110' : ''}`}
                          >
                            <div className={`w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0 ${(activeTab === 'notation' || activeTab === 'history')
                              ? 'bg-white text-black'
                              : 'text-white hover:bg-white/20'
                              }`}>
                              <MoreVertical className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] sm:text-xs font-medium text-center leading-tight">More</span>
                          </button>

                          {showMoreMenu && (
                            <div className="absolute top-full mt-2 sm:mt-3 right-0 sm:left-1/2 sm:-translate-x-1/2 sm:right-auto min-w-[200px] w-max bg-white rounded-xl shadow-2xl border border-slate-100 py-1.5 sm:py-2 z-[200] animate-in fade-in zoom-in duration-200 origin-top-right sm:origin-top">
                              <button
                                onClick={() => {
                                  setActiveTab('notation');
                                  setShowMoreMenu(false);
                                }}
                                className={`w-full px-4 py-3 flex items-center gap-3 transition-colors ${activeTab === 'notation' ? 'bg-slate-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'}`}
                              >
                                <Music2 className="w-4 h-4 text-slate-500 flex-shrink-0" />
                                <span className="text-sm font-medium whitespace-nowrap">Solfa Notation</span>
                              </button>
                              
                              <button
                                onClick={() => {
                                  setActiveTab('history');
                                  setShowMoreMenu(false);
                                }}
                                className={`w-full px-4 py-3 flex items-center gap-3 transition-colors ${activeTab === 'history' ? 'bg-slate-50 text-blue-600' : 'text-slate-700 hover:bg-slate-50'}`}
                              >
                                <Clock className="w-4 h-4 text-slate-500 flex-shrink-0" />
                                <span className="text-sm font-medium whitespace-nowrap">History</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 px-6 py-4 overflow-y-auto" style={{ paddingBottom: '180px' }}>
                {activeTab === 'lyrics' && (
                  <SongLyrics 
                    isFullscreen={false}
                    onToggleFullscreen={toggleFullscreenLyrics}
                    lyrics={displayedSongData?.lyrics}
                  />
                )}

                {activeTab === 'solfas' && (
                  <SongSolfas 
                    isFullscreen={false}
                    onToggleFullscreen={toggleFullscreenSolfas}
                    solfas={displayedSongData?.solfas}
                  />
                )}

                {activeTab === 'notation' && (
                  <SongSolfas 
                    isFullscreen={false}
                    onToggleFullscreen={toggleFullscreenSolfas}
                    solfas={displayedSongData?.notation}
                  />
                )}

                {activeTab === 'comments' && (
                  <SongComments 
                    isFullscreen={false}
                    onToggleFullscreen={toggleFullscreenComments}
                    comments={displayedSongData?.comments}
                    zoneColor={zoneColor}
                    commentLabel={getCommentLabel()}
                  />
                )}
                          {activeTab === 'history' && (
                  <SongHistory 
                    activeHistoryTab={activeHistoryTab}
                    setActiveHistoryTab={setActiveHistoryTab}
                    isLoadingHistory={isLoadingHistory}
                    historyEntries={historyEntries}
                    loadHistoryEntries={loadHistoryEntries}
                    expandedHistoryEntries={expandedHistoryEntries}
                    toggleHistoryEntry={toggleHistoryEntry}
                    zoneColor={zoneColor}
                    darkenColor={darkenColor}
                    formatDateTime={formatDateTime}
                    formatTime={formatTime}
                    getCommentLabel={getCommentLabel}
                    historyAudioStates={historyAudioStates}
                    handleHistoryAudioPlayPause={handleHistoryAudioPlayPause}
                    historyAudioRefs={historyAudioRefs}
                    handleHistoryAudioTimeUpdate={handleHistoryAudioTimeUpdate}
                    handleHistoryAudioLoadedMetadata={handleHistoryAudioLoadedMetadata}
                    handleHistoryAudioEnded={handleHistoryAudioEnded}
                  />
                )}
              </div>


              {/* Floating Fullscreen Buttons */}
              {activeTab === 'lyrics' && !isFullscreenLyrics && (
                <SongLyrics 
                  isFullscreen={false}
                  onToggleFullscreen={toggleFullscreenLyrics}
                  showFloatingButtonOnly={true}
                  zoneColor={zoneColor}
                  darkenColor={darkenColor}
                />
              )}

              {activeTab === 'comments' && !isFullscreenComments && (
                <SongComments 
                  isFullscreen={false}
                  onToggleFullscreen={toggleFullscreenComments}
                  showFloatingButtonOnly={true}
                  zoneColor={zoneColor}
                  darkenColor={darkenColor}
                />
              )}

              {activeTab === 'solfas' && !isFullscreenSolfas && (
                <SongSolfas 
                  isFullscreen={false}
                  onToggleFullscreen={toggleFullscreenSolfas}
                  showFloatingButtonOnly={true}
                  zoneColor={zoneColor}
                  darkenColor={darkenColor}
                />
              )}

              <SongAudioPlayer 
                currentTime={currentTime}
                duration={duration}
                formatTime={formatTime}
                isDragging={isDragging}
                handleProgressClick={handleProgressClick}
                handleProgressMouseDown={handleProgressMouseDown}
                handleProgressMouseMove={handleProgressMouseMove}
                handleProgressMouseUp={handleProgressMouseUp}
                isRepeating={isRepeating}
                toggleRepeat={toggleRepeat}
                handlePrevious={handlePrevious}
                skipBackward10={skipBackward10}
                togglePlayPause={togglePlayPause}
                isLoading={isLoading}
                hasError={hasError}
                isPlaying={isPlaying}
                skipForward10={skipForward10}
                handleNext={handleNext}
                handleMusicPage={handleMusicPage}
                isNavigatingToAudioLab={isNavigatingToAudioLab}
                zoneColor={zoneColor}
                darkenColor={darkenColor}
                historyAudioRefs={historyAudioRefs}
                setHistoryAudioStates={setHistoryAudioStates}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}
