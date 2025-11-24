"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, BookOpen, Music, Users, Clock, Play, Pause, SkipBack, SkipForward, RotateCcw, Music2, ChevronDown, ChevronUp, Settings, Maximize2, Minimize2, RotateCw, Undo2, Redo2 } from "lucide-react";
import { PraiseNightSong, HistoryEntry } from "@/types/supabase";
import { useAudio } from "@/contexts/AudioContext";
import { useZone } from "@/contexts/ZoneContext";
import { isHQGroup } from "@/config/zones";
import { FirebaseDatabaseService } from "@/lib/firebase-database";
import { FirebaseCommentService } from "@/lib/firebase-comment-service";
import { useUltraFastSongHistory } from "@/hooks/useUltraFastSongHistory";
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
  const [activeTab, setActiveTab] = useState<'lyrics' | 'solfas' | 'comments' | 'history'>('lyrics');
  const [activeHistoryTab, setActiveHistoryTab] = useState<'lyrics' | 'audio' | 'solfas' | 'comments' | 'metadata'>('lyrics');
  const [isRepeating, setIsRepeating] = useState(false);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [categorySongs, setCategorySongs] = useState<PraiseNightSong[]>([]);
  const [collapsedHistoryCards, setCollapsedHistoryCards] = useState<Set<string>>(new Set([
    'lyrics-1', 'lyrics-2', 'lyrics-3', 'lyrics-4',
    'audio-1', 'audio-2', 'audio-3',
    'solfas-1', 'solfas-2', 'solfas-3',
    'comment-1', 'comment-2', 'comment-3', 'comment-4'
  ]));
  
  // Fullscreen state for lyrics, comments, and solfas
  const [isFullscreenLyrics, setIsFullscreenLyrics] = useState(false);
  const [isFullscreenComments, setIsFullscreenComments] = useState(false);
  const [isFullscreenSolfas, setIsFullscreenSolfas] = useState(false);

  // Get zone context to determine comment terminology
  const { currentZone } = useZone();
  
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
  const [historyAudioStates, setHistoryAudioStates] = useState<{[key: string]: {isPlaying: boolean, currentTime: number, duration: number}}>({});
  const historyAudioRefs = useRef<Record<string, HTMLAudioElement | null>>({});
  const [mainPlayerWasPlaying, setMainPlayerWasPlaying] = useState(false);
  
  // State for fresh song data
  const [freshSongData, setFreshSongData] = useState<PraiseNightSong | null>(null);
  
  // Use global audio context
  const { currentSong, isPlaying, currentTime, duration, isLoading, hasError, togglePlayPause, audioRef, setCurrentSong } = useAudio();

  // Fetch fresh song data when modal opens
  const fetchFreshSongData = async (songId: string) => {
    try {
      console.log('🔄 Fetching fresh song data for:', songId);
      
      // Try to get the song directly by ID first
      try {
        const directSong = await FirebaseDatabaseService.getDocument('songs', songId);
        if (directSong) {
          console.log('✅ Direct song fetch successful:', (directSong as any).title);
          console.log('📝 Direct song solfas:', (directSong as any).solfas);
          console.log('💬 Direct song comments:', (directSong as any).comments);
          setFreshSongData(directSong as unknown as PraiseNightSong);
          if (onSongChange) {
            onSongChange(directSong as unknown as PraiseNightSong);
          }
          return;
        }
      } catch (directError) {
        console.log('⚠️ Direct fetch failed, trying collection method:', directError);
      }
      
      // Fallback to collection method
      const allSongs = await FirebaseDatabaseService.getCollection('songs');
      console.log('📊 Total songs fetched from Firebase:', allSongs.length);
      
      const freshSong = allSongs.find(song => song.id === songId);
      if (freshSong) {
        console.log('✅ Fresh song data fetched:', (freshSong as any).title);
        console.log('📝 Fresh song solfas:', (freshSong as any).solfas);
        console.log('💬 Fresh song comments:', (freshSong as any).comments);
        setFreshSongData(freshSong as unknown as PraiseNightSong);
        // Update the parent component with fresh data
        if (onSongChange) {
          onSongChange(freshSong as unknown as PraiseNightSong);
        }
      } else {
        console.log('❌ Song not found in Firebase with ID:', songId);
        console.log('🔍 Available song IDs:', allSongs.map(s => s.id));
      }
    } catch (error) {
      console.error('❌ Error fetching fresh song data:', error);
    }
  };

  // Fetch fresh data when modal opens
  useEffect(() => {
    if (selectedSong && isOpen && selectedSong.id) {
      fetchFreshSongData(selectedSong.id.toString());
    }
  }, [selectedSong?.id, isOpen]);

  // Use fresh song data when available, fallback to selectedSong
  const currentSongData = freshSongData || selectedSong;
  
  // Debug logging for current song data
  useEffect(() => {
    if (currentSongData) {
      console.log('🎵 Current song data being used:', {
        title: currentSongData.title,
        hasSolfas: !!currentSongData.solfas,
        solfasLength: currentSongData.solfas?.length || 0,
        hasComments: !!currentSongData.comments,
        commentsLength: Array.isArray(currentSongData.comments) ? currentSongData.comments.length : 0,
        isFreshData: !!freshSongData
      });
    }
  }, [currentSongData, freshSongData]);

  // Set the current song when modal opens (only if it's a different song)
  useEffect(() => {
    if (selectedSong && isOpen) {
      console.log('🎵 SongDetailModal: Checking if song needs to be set:', {
        selectedSongId: selectedSong.id,
        selectedSongTitle: selectedSong.title,
        currentSongId: currentSong?.id,
        currentSongTitle: currentSong?.title,
        isSameSong: currentSong?.id === selectedSong.id,
        audioFile: selectedSong.audioFile,
        hasAudioFile: !!selectedSong.audioFile,
        audioFileLength: selectedSong.audioFile?.length
      });
      
      // Only set the song if it's different from the current one
      // This prevents restarting the same song when opening the modal
      if (currentSong?.id !== selectedSong.id) {
        console.log('🎵 SongDetailModal: Different song, calling setCurrentSong');
        setCurrentSong(selectedSong, false);
      } else {
        console.log('🎵 SongDetailModal: Same song already playing, skipping audio changes - NO setCurrentSong call');
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
      console.log('🔄 Audio ended, repeat mode:', isRepeating);
      console.log('🔄 Current song index:', currentSongIndex, 'Total songs:', categorySongs.length);
      console.log('🔄 Event song title:', event.detail.song?.title);
      console.log('🔄 Current song data title:', currentSongData?.title);
      console.log('🔄 Songs match:', event.detail.song?.title === currentSongData?.title);
      
      // Check if this is the current song (by title or ID)
      const isCurrentSong = event.detail.song?.title === currentSongData?.title || 
                           event.detail.song?.id === currentSongData?.id;
      
      if (isRepeating && isCurrentSong) {
        console.log('🔄 Repeating song:', currentSongData?.title);
        // Restart the current song
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
          audioRef.current.play().catch((error) => {
            console.error('Error repeating song:', error);
          });
        }
      } else if (!isRepeating && isCurrentSong) {
        // Auto-skip to next song when not repeating
        console.log('⏭️ Auto-skipping to next song (repeat disabled)');
        if (currentSongIndex < categorySongs.length - 1 && categorySongs.length > 0) {
          // Go to next song
          const nextSong = categorySongs[currentSongIndex + 1];
          console.log('⏭️ Auto-going to next song:', nextSong.title);
          if (nextSong && onSongChange) {
            setCurrentSongIndex(currentSongIndex + 1);
            onSongChange(nextSong);
            // Set the new song in audio context and auto-play
            setCurrentSong(nextSong, true);
          }
        } else {
          console.log('⏭️ No more songs to skip to, stopping playback');
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
    console.log('⏮️ Previous clicked:', { currentSongIndex, categorySongsLength: categorySongs.length, onSongChange: !!onSongChange });
    
    if (currentSongIndex > 0 && categorySongs.length > 0) {
      // Go to previous song
      const prevSong = categorySongs[currentSongIndex - 1];
      console.log('⏮️ Going to previous song:', prevSong.title);
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
      console.log('⏮️ Skipped back 10 seconds to:', newTime);
    }
  };

  const handleNext = () => {
    console.log('⏭️ Next clicked:', { currentSongIndex, categorySongsLength: categorySongs.length, onSongChange: !!onSongChange });
    
    if (currentSongIndex < categorySongs.length - 1 && categorySongs.length > 0) {
      // Go to next song
      const nextSong = categorySongs[currentSongIndex + 1];
      console.log('⏭️ Going to next song:', nextSong.title);
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
      console.log('⏭️ Skipped forward 10 seconds to:', newTime);
    }
  };

  const toggleRepeat = () => {
    const newRepeatState = !isRepeating;
    setIsRepeating(newRepeatState);
    console.log('🔄 Repeat toggled:', newRepeatState ? 'ON' : 'OFF');
    console.log('🔄 Repeat state changed from', isRepeating, 'to', newRepeatState);
  };

  const handleMusicPage = () => {
    // Navigate to music page - you can implement this based on your routing
    console.log('Navigate to music page');
  };

  const handleToggleHistoryCard = (cardId: string) => {
    setCollapsedHistoryCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
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
    
    // Check if date is valid
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

  // Use ultra-fast song history hook
  const { 
    history: loadedHistory, 
    loading: isLoadingHistory, 
    error: historyError,
    isInitialLoad: isHistoryInitialLoad,
    refreshHistory,
    getHistoryByType 
  } = useUltraFastSongHistory(currentSongData?.id?.toString() || null);

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
    enabled: isOpen // Always enabled when modal is open
  });

  // Get history data for the current song using the ultra-fast hook
  const getHistoryData = (type: 'lyrics' | 'solfas' | 'audio' | 'comments' | 'metadata'): HistoryEntry[] => {
    return getHistoryByType(type);
  };

  // History loading is now handled automatically by the useUltraFastSongHistory hook

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
        console.log('🎯 Seeked to:', clampedTime, 'seconds');
      } else {
        // Wait for audio to be ready then seek
        const handleCanPlay = () => {
          if (audioRef.current) {
            audioRef.current.currentTime = clampedTime;
            audioRef.current.removeEventListener('canplay', handleCanPlay);
            console.log('🎯 Seeked to (after load):', clampedTime, 'seconds');
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
      console.log('⏪ Skipped backward 10 seconds to:', newTime);
    }
  };

  const skipForward10 = () => {
    if (audioRef.current && duration > 0) {
      const newTime = Math.min(duration, currentTime + 10);
      seekToTime(newTime);
      console.log('⏩ Skipped forward 10 seconds to:', newTime);
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
    console.log('🎯 Started dragging at:', newTime, 'seconds');
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
      
      console.log('🎯 Finished dragging');
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
              <h1 className="text-white text-xl font-black text-center mb-4 font-poppins uppercase">{(realtimeSongData || currentSongData)?.title}</h1>
              <div className="text-white text-sm space-y-1 font-poppins">
                <div className="border-b border-white/30 pb-1">
                  <span className="font-semibold uppercase">LEAD SINGER:</span> {(realtimeSongData || currentSongData)?.leadSinger ? (realtimeSongData || currentSongData)?.leadSinger?.split(',')[0].trim() : 'Unknown'}
                </div>
                <div className="flex justify-between items-center border-b border-white/30 pb-1 mb-1">
                  <span><span className="font-semibold uppercase">WRITER:</span> {(realtimeSongData || currentSongData)?.writer || ''}</span>
                  <span className="font-bold">x{(realtimeSongData || currentSongData)?.rehearsalCount || 1}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/30 pb-1 mb-1">
                  <span><span className="font-semibold uppercase">CONDUCTOR:</span> {(realtimeSongData || currentSongData)?.conductor || ''}</span>
                  <span><span className="font-semibold uppercase">KEY:</span> {(realtimeSongData || currentSongData)?.key || ''}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/30 pb-1 mb-1">
                  <span><span className="font-semibold uppercase">LEAD KEYBOARDIST:</span> {(realtimeSongData || currentSongData)?.leadKeyboardist || ''}</span>
                  <span><span className="font-semibold uppercase">TEMPO:</span> {(realtimeSongData || currentSongData)?.tempo || ''}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/30 pb-1 mb-1">
                  <span><span className="font-semibold uppercase">DRUMMER:</span> {(realtimeSongData || currentSongData)?.drummer || ''}</span>
                  <span><span className="font-semibold uppercase">BASS GUITARIST:</span> {(realtimeSongData || currentSongData)?.leadGuitarist || ''}</span>
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
              <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                activeTab === 'lyrics'
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
              <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                activeTab === 'solfas'
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
              <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                activeTab === 'comments'
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
              <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                activeTab === 'history'
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
                {currentSongData?.lyrics ? (
                  <div 
                    dangerouslySetInnerHTML={{ __html: currentSongData.lyrics }}
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
                {currentSongData?.solfas && currentSongData.solfas.trim() !== '' ? (
                  <div 
                    dangerouslySetInnerHTML={{ __html: currentSongData.solfas }}
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
                {(!currentSongData?.comments || !Array.isArray(currentSongData.comments) || currentSongData.comments.length === 0) ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500 text-sm mb-2">No Comments Available</div>
                    <div className="text-gray-400 text-xs">Comments will be displayed here when available</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(Array.isArray(currentSongData.comments) ? currentSongData.comments : []).map((comment: any) => (
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
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    activeHistoryTab === 'lyrics'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-white/70 backdrop-blur-sm text-slate-700 hover:bg-white/90 hover:shadow-sm border border-slate-200/50'
                  }`}
                >
                  Lyrics
                </button>
                <button
                  onClick={() => setActiveHistoryTab('audio')}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    activeHistoryTab === 'audio'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-white/70 backdrop-blur-sm text-slate-700 hover:bg-white/90 hover:shadow-sm border border-slate-200/50'
                  }`}
                >
                  Audio
                </button>
                <button
                  onClick={() => setActiveHistoryTab('solfas')}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    activeHistoryTab === 'solfas'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-white/70 backdrop-blur-sm text-slate-700 hover:bg-white/90 hover:shadow-sm border border-slate-200/50'
                  }`}
                >
                  Conductor's Guide
                </button>
                <button
                  onClick={() => setActiveHistoryTab('comments')}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    activeHistoryTab === 'comments'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-white/70 backdrop-blur-sm text-slate-700 hover:bg-white/90 hover:shadow-sm border border-slate-200/50'
                  }`}
                >
                  {getCommentLabel()}'s Comments
                </button>
                <button
                  onClick={() => setActiveHistoryTab('metadata')}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                    activeHistoryTab === 'metadata'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-white/70 backdrop-blur-sm text-slate-700 hover:bg-white/90 hover:shadow-sm border border-slate-200/50'
                  }`}
                >
                  Song Details
                </button>
              </div>

              {/* History Content */}
              <div className="min-h-[200px]">
                {activeHistoryTab === 'lyrics' && (
                  <div className="space-y-3">
                    {isLoadingHistory && getHistoryData('lyrics').length === 0 ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                            <div className="space-y-2">
                              <div className="h-3 w-full bg-gray-200 rounded animate-pulse"></div>
                              <div className="h-3 w-5/6 bg-gray-200 rounded animate-pulse"></div>
                              <div className="h-3 w-4/6 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : getHistoryData('lyrics').length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <BookOpen className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-gray-500 text-sm font-medium">No Lyrics History</p>
                        <p className="text-gray-400 text-xs mt-1">Changes will appear here</p>
                      </div>
                    ) : (
                      <>
                    {/* History entries - all using same design */}
                    {getHistoryData('lyrics').map((entry) => (
                      <div key={entry.id} className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-200">
                        <button
                          onClick={() => handleToggleHistoryCard(entry.id)}
                          className="w-full flex items-center justify-between p-4 hover:bg-white/50 transition-all duration-200 rounded-2xl"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                              <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-slate-800">{entry.title}</div>
                              <div className="text-xs text-slate-500">{formatDateTime(entry.date).date} {formatDateTime(entry.date).time}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {collapsedHistoryCards.has(entry.id) ? (
                              <ChevronDown className="w-5 h-5 text-slate-400" />
                            ) : (
                              <ChevronUp className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                        </button>
                        {!collapsedHistoryCards.has(entry.id) && (
                          <div className="px-4 pb-4">
                            <div className="text-sm text-slate-700">
                              <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-slate-200/50">
                                <div dangerouslySetInnerHTML={{ __html: entry.new_value }} />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                      </>
                    )}
                  </div>
                )}

                {activeHistoryTab === 'audio' && (
                  <div className="space-y-3">
                    {isLoadingHistory && getHistoryData('audio').length === 0 ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                              <div className="flex-1">
                                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
                                <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : getHistoryData('audio').length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <Music className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-gray-500 text-sm font-medium">No Audio History</p>
                        <p className="text-gray-400 text-xs mt-1">Changes will appear here</p>
                      </div>
                    ) : (
                      <>
                    {/* Show history entries from the history array */}
                    {getHistoryData('audio').map((entry) => (
                      <div key={entry.id} className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-200">
                        <button
                          onClick={() => handleToggleHistoryCard(entry.id)}
                          className="w-full flex items-center justify-between p-4 hover:bg-white/50 transition-all duration-200 rounded-2xl"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                              <Music className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-slate-800">{formatDateTime(entry.date).date} {formatDateTime(entry.date).time}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {collapsedHistoryCards.has(entry.id) ? (
                              <ChevronDown className="w-5 h-5 text-slate-400" />
                            ) : (
                              <ChevronUp className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                        </button>
                        {!collapsedHistoryCards.has(entry.id) && (
                          <div className="px-4 pb-4">
                            <div className="text-sm text-slate-700">
                              <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-slate-200/50">
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => handleHistoryAudioPlayPause(entry.id)}
                                    className="w-10 h-10 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
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
                          </div>
                        )}
                      </div>
                    ))}
                      </>
                    )}
                  </div>
                )}

                {activeHistoryTab === 'solfas' && (
                  <div className="space-y-3">
                    {isLoadingHistory && getOlderSolfas().length === 0 && getHistoryData('solfas').length === 0 ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                            <div className="space-y-2">
                              <div className="h-3 w-full bg-gray-200 rounded animate-pulse"></div>
                              <div className="h-3 w-5/6 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : getOlderSolfas().length === 0 && getHistoryData('solfas').length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <Music className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-gray-500 text-sm font-medium">No Conductor's Guide History</p>
                        <p className="text-gray-400 text-xs mt-1">Changes will appear here</p>
                      </div>
                    ) : (
                      <>
                    {/* Show older solfas versions if any exist */}
                    {getOlderSolfas().length > 0 ? (
                      getOlderSolfas().map((solfas, index) => (
                        <div key={`solfas-${index}`} className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-200">
                          <button
                            onClick={() => handleToggleHistoryCard(`solfas-${index}`)}
                            className="w-full flex items-center justify-between p-4 hover:bg-white/50 transition-all duration-200 rounded-2xl"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                                <Music className="w-5 h-5 text-white" />
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-slate-800">Previous Version</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {collapsedHistoryCards.has(`solfas-${index}`) ? (
                                <ChevronDown className="w-5 h-5 text-slate-400" />
                              ) : (
                                <ChevronUp className="w-5 h-5 text-slate-400" />
                              )}
                            </div>
                          </button>
                          {!collapsedHistoryCards.has(`solfas-${index}`) && (
                            <div className="px-4 pb-4">
                              <div className="text-sm text-slate-700">
                                <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-slate-200/50">
                                  <div dangerouslySetInnerHTML={{ __html: solfas }} />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    ) : null}

                    {/* Show history entries from the history array */}
                    {getHistoryData('solfas').map((entry) => (
                      <div key={entry.id} className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-200">
                        <button
                          onClick={() => handleToggleHistoryCard(entry.id)}
                          className="w-full flex items-center justify-between p-4 hover:bg-white/50 transition-all duration-200 rounded-2xl"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                              <Music className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-slate-800">{formatDateTime(entry.date).date} {formatDateTime(entry.date).time}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {collapsedHistoryCards.has(entry.id) ? (
                              <ChevronDown className="w-5 h-5 text-slate-400" />
                            ) : (
                              <ChevronUp className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                        </button>
                        {!collapsedHistoryCards.has(entry.id) && (
                          <div className="px-4 pb-4">
                            <div className="text-sm text-slate-700">
                              <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-slate-200/50">
                                <div dangerouslySetInnerHTML={{ __html: entry.new_value }} />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                      </>
                    )}
                  </div>
                )}

                {activeHistoryTab === 'comments' && (
                  <div className="space-y-3">
                    {getOlderComments().length === 0 && getHistoryData('comments').length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <Users className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-gray-500 text-sm font-medium">No Comments History</p>
                        <p className="text-gray-400 text-xs mt-1">Changes will appear here</p>
                      </div>
                    ) : (
                      <>
                    {/* Show older comments (all except the latest) */}
                    {getOlderComments().map((comment, index) => (
                      <div key={comment.id} className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-200">
                        <button
                          onClick={() => handleToggleHistoryCard(comment.id)}
                          className="w-full flex items-center justify-between p-4 hover:bg-white/50 transition-all duration-200 rounded-2xl"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                              <Users className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-slate-800">{formatDateTime(comment.date).date} {formatDateTime(comment.date).time}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {collapsedHistoryCards.has(comment.id) ? (
                              <ChevronDown className="w-5 h-5 text-slate-400" />
                            ) : (
                              <ChevronUp className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                        </button>
                        {!collapsedHistoryCards.has(comment.id) && (
                          <div className="px-4 pb-4">
                            <div className="text-sm text-slate-700">
                              <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-slate-200/50">
                                <p className="text-sm text-slate-700">{(comment as any).text || (comment as any).content}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Also show history entries from the history array */}
                    {getHistoryData('comments').map((entry) => (
                      <div key={entry.id} className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-200">
                        <button
                          onClick={() => handleToggleHistoryCard(entry.id)}
                          className="w-full flex items-center justify-between p-4 hover:bg-white/50 transition-all duration-200 rounded-2xl"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                              <Users className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-slate-800">{formatDateTime(entry.date).date} {formatDateTime(entry.date).time}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {collapsedHistoryCards.has(entry.id) ? (
                              <ChevronDown className="w-5 h-5 text-slate-400" />
                            ) : (
                              <ChevronUp className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                        </button>
                        {!collapsedHistoryCards.has(entry.id) && (
                          <div className="px-4 pb-4">
                            <div className="text-sm text-slate-700">
                              <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-slate-200/50">
                                <p className="font-medium text-slate-800">{getCommentLabel()}</p>
                                <p className="text-sm text-slate-700 mt-2">{entry.new_value}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                      </>
                    )}
                  </div>
                )}

                {activeHistoryTab === 'metadata' && (
                  <div className="space-y-3">
                    {isLoadingHistory && getHistoryData('metadata').length === 0 ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="h-3 w-full bg-gray-200 rounded animate-pulse"></div>
                              <div className="h-3 w-full bg-gray-200 rounded animate-pulse"></div>
                              <div className="h-3 w-full bg-gray-200 rounded animate-pulse"></div>
                              <div className="h-3 w-full bg-gray-200 rounded animate-pulse"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : getHistoryData('metadata').length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <Settings className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-gray-500 text-sm font-medium">No Song Details</p>
                        <p className="text-gray-400 text-xs mt-1">Changes will appear here</p>
                      </div>
                    ) : (
                      <>
                    {/* Song Details history entries */}
                    {getHistoryData('metadata').map((entry) => (
                      <div key={entry.id} className="bg-white/70 backdrop-blur-sm rounded-2xl border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-200">
                        <button
                          onClick={() => handleToggleHistoryCard(entry.id)}
                          className="w-full flex items-center justify-between p-4 hover:bg-white/50 transition-all duration-200 rounded-2xl"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                              <Settings className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-slate-800">{formatDateTime(entry.date).date} {formatDateTime(entry.date).time}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {collapsedHistoryCards.has(entry.id) ? (
                              <ChevronDown className="w-5 h-5 text-slate-400" />
                            ) : (
                              <ChevronUp className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                        </button>
                        {!collapsedHistoryCards.has(entry.id) && (
                          <div className="px-4 pb-4">
                            <div className="text-sm text-slate-700">
                              <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-slate-200/50">
                                <div className="space-y-2">
                                  {(() => {
                                    try {
                                      // Try to parse as JSON first
                                      const parsed = JSON.parse(entry.new_value);
                                      return Object.entries(parsed).map(([key, value], index) => (
                                        <div key={index} className="flex items-start gap-2">
                                          <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5"></div>
                                          <div className="flex-1">
                                            <span className="font-semibold text-slate-800">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}: </span>
                                            <span className="text-slate-700">{String(value)}</span>
                                          </div>
                                        </div>
                                      ));
                                    } catch {
                                      // If not JSON, split by pipe
                                      return entry.new_value.split(' | ').map((change, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                          <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                          <span className="text-sm text-slate-700">{change}</span>
                                        </div>
                                      ));
                                    }
                                  })()}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                      </>
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
            className="fixed bottom-28 right-3 sm:right-4 w-10 h-10 sm:w-11 sm:h-11 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg transition-all duration-200 z-[110] hover:scale-105 flex items-center justify-center"
            title="Fullscreen Lyrics"
          >
            <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        )}
        
        {activeTab === 'comments' && !isFullscreenComments && (
          <button
            onClick={toggleFullscreenComments}
            className="fixed bottom-28 right-3 sm:right-4 w-10 h-10 sm:w-11 sm:h-11 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg transition-all duration-200 z-[110] hover:scale-105 flex items-center justify-center"
            title="Fullscreen Comments"
          >
            <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        )}
        
        {activeTab === 'solfas' && !isFullscreenSolfas && (
          <button
            onClick={toggleFullscreenSolfas}
            className="fixed bottom-28 right-3 sm:right-4 w-10 h-10 sm:w-11 sm:h-11 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg transition-all duration-200 z-[110] hover:scale-105 flex items-center justify-center"
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
                <div className={`absolute right-0 top-1/2 transform -translate-y-1/2 rounded-full transition-all duration-200 ${
                  isDragging ? 'w-4 h-4 bg-blue-600' : 'w-3 h-3 bg-gray-600 hover:w-4 hover:h-4'
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
              className={`w-5 h-5 flex items-center justify-center transition-colors ${
                isRepeating ? 'text-blue-600' : 'text-gray-600 hover:text-gray-800'
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
                console.log('🎵 Button clicked - Current state:', { 
                  isPlaying, 
                  isLoading, 
                  hasError,
                  audioSrc: audioRef.current?.src,
                  audioReadyState: audioRef.current?.readyState,
                  audioPaused: audioRef.current?.paused
                });
                
                // Pause all history audios first
                Object.keys(historyAudioRefs.current).forEach(id => {
                  if (historyAudioRefs.current[id]) {
                    historyAudioRefs.current[id]!.pause();
                  }
                });
                
                // Direct test - bypass the context for debugging
                if (audioRef.current) {
                  if (audioRef.current.paused) {
                    console.log('🎵 Direct play attempt');
                    audioRef.current.play().then(() => {
                      console.log('✅ Direct play successful');
                    }).catch(error => {
                      console.error('❌ Direct play failed:', error);
                    });
                  } else {
                    console.log('🎵 Direct pause attempt');
                    audioRef.current.pause();
                    console.log('✅ Direct pause successful');
                  }
                } else {
                  console.error('❌ No audioRef.current available');
                }
                
                // Also call the context method
                togglePlayPause();
              }}
              disabled={isLoading || hasError}
              className={`w-10 h-10 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-sm ${
                hasError 
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
              className="w-5 h-5 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Music2 className="w-3.5 h-3.5" />
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