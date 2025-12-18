'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, Settings, Mic, 
  PlusCircle, SkipBack, Play, Pause, Square, Circle,
  AudioLines, Loader2, Check, Trash2, Piano, Guitar, RefreshCw, Sparkles,
  Sliders, Download, Pencil, Timer
} from 'lucide-react';
import { useAudioLab } from '../_context/AudioLabContext';
import { useAuth } from '@/hooks/useAuth';
import { createProject, getProject, updateProject } from '../_lib/project-service';
import { audioEngine } from '../_lib/audio-engine';
import { uploadRecording, generateRecordingFileName } from '../_lib/upload-service';
import { accompanimentEngine, type AccompanimentTrack, type DetectedKey } from '../_lib/accompaniment-engine';
import { trackEffectsEngine, type TrackEffects, DEFAULT_EFFECTS } from '../_lib/track-effects-engine';
import { NextActionPrompt } from './NextActionPrompt';
import { ProjectSettingsSheet } from './ProjectSettingsSheet';
import { TrackEffectsPanel } from './TrackEffectsPanel';
import { AnimatedWaveform } from './AnimatedWaveform';
import { useZone } from '@/hooks/useZone';
import type { AudioLabProject } from '../_types';

interface Track {
  id: string;
  name: string;
  icon: typeof Mic;
  volume: number;
  muted: boolean;
  solo: boolean;
  isActive: boolean;
  isRecording: boolean;
  waveformHeights: number[];
  audioBlob?: Blob;
  effects?: TrackEffects;
  audioUrl?: string;
}

export function StudioView() {
  const router = useRouter();
  const { setView, initializeAudio, state, setCurrentProject: setContextProject } = useAudioLab();
  const { user } = useAuth();
  const { currentZone } = useZone();
  
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [inputLevel, setInputLevel] = useState(0);
  const [currentProject, setCurrentProject] = useState<AudioLabProject | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Track if this is the first recording (for reward) - only for NEW recordings in this session
  const [hasFirstRecording, setHasFirstRecording] = useState(false);
  const [showNextActionPrompt, setShowNextActionPrompt] = useState(false);
  const [justRecordedFirstTake, setJustRecordedFirstTake] = useState(false); // Only true after recording in THIS session
  const [isExistingProject, setIsExistingProject] = useState(false); // Track if loaded from existing project
  
  // Backing track state
  const [backingTrackEnabled, setBackingTrackEnabled] = useState(true);
  const [backingTrackVolume, setBackingTrackVolume] = useState(70);
  
  // Project settings sheet
  const [showSettings, setShowSettings] = useState(false);
  
  // AI Accompaniment state
  const [detectedKey, setDetectedKey] = useState<DetectedKey | null>(null);
  const [accompanimentTracks, setAccompanimentTracks] = useState<AccompanimentTrack[]>([]);
  const [isGeneratingAccompaniment, setIsGeneratingAccompaniment] = useState(false);
  const [isAccompanimentPlaying, setIsAccompanimentPlaying] = useState(false);
  
  // Effects panel state
  const [showEffectsPanel, setShowEffectsPanel] = useState(false);
  const [effectsTrackId, setEffectsTrackId] = useState<string | null>(null);
  const [isAddingAccompanimentToProject, setIsAddingAccompanimentToProject] = useState(false);
  
  // Track editing state
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null);
  const [editingTrackName, setEditingTrackName] = useState('');
  
  // Metronome state
  const [metronomeEnabled, setMetronomeEnabled] = useState(false);
  const [metronomeTempo, setMetronomeTempo] = useState(120);
  const metronomeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const metronomeAudioRef = useRef<AudioContext | null>(null);
  
  // Backing track audio ref
  const backingTrackRef = useRef<HTMLAudioElement | null>(null);
  
  // Get backing track from player if available
  const backingTrack = state.player.currentSong;
  
  // Recording refs
  const recordingStartTime = useRef<number>(0);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);
  const waveformSamples = useRef<number[]>([]);
  const playbackAudioRef = useRef<HTMLAudioElement | null>(null);
  
  // Multi-track playback refs
  const trackAudioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());
  const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize backing track audio element
  useEffect(() => {
    if (backingTrack?.audioUrl && !backingTrackRef.current) {
      const audio = new Audio(backingTrack.audioUrl);
      audio.volume = backingTrackVolume / 100;
      audio.loop = true;
      backingTrackRef.current = audio;
    }
    
    return () => {
      if (backingTrackRef.current) {
        backingTrackRef.current.pause();
        backingTrackRef.current = null;
      }
    };
  }, [backingTrack?.audioUrl]);

  // Update backing track volume
  useEffect(() => {
    if (backingTrackRef.current) {
      backingTrackRef.current.volume = backingTrackEnabled ? backingTrackVolume / 100 : 0;
    }
  }, [backingTrackVolume, backingTrackEnabled]);

  // Load project from context
  useEffect(() => {
    if (user?.uid && state.currentProjectId) {
      loadSpecificProject(state.currentProjectId);
    }
  }, [user?.uid, state.currentProjectId]);

  // Set up audio engine callbacks for input level
  useEffect(() => {
    audioEngine.onInputLevel = (level) => {
      setInputLevel(level);
      if (isRecording) {
        waveformSamples.current.push(Math.round(level * 100));
      }
    };
    
    return () => {
      audioEngine.onInputLevel = null;
    };
  }, [isRecording]);

  // Auto-add first track when entering studio (for immediate recording)
  // Works with or without a saved project
  useEffect(() => {
    if (tracks.length === 0) {
      const firstTrack: Track = {
        id: `track-${Date.now()}`,
        name: 'Vocal 1',
        icon: Mic,
        volume: 80,
        muted: false,
        solo: false,
        isActive: true,
        isRecording: false,
        waveformHeights: []
      };
      setTracks([firstTrack]);
    }
  }, []);

  const loadSpecificProject = async (projectId: string) => {
    setIsLoading(true);
    try {
      const project = await getProject(projectId);
      if (project) {
        setCurrentProject(project);
        setIsExistingProject(true); // Mark as existing project
        
        // Set duration from project if available
        if (project.duration && project.duration > 0) {
          setDuration(project.duration);
        }
        
        if (project.tracks && project.tracks.length > 0) {
          const loadedTracks = project.tracks.map((t, i) => ({
            id: t.id,
            name: t.name,
            icon: Mic,
            volume: t.volume || 80,
            muted: t.muted || false,
            solo: t.solo || false,
            isActive: i === 0,
            isRecording: false,
            waveformHeights: t.waveform || [],
            audioUrl: t.audioUrl
          }));
          
          setTracks(loadedTracks);
          
          // Pre-load audio elements for cloud URLs
          let maxDuration = project.duration || 0;
          for (const track of loadedTracks) {
            if (track.audioUrl && !track.audioUrl.startsWith('blob:')) {
              const audio = new Audio();
              audio.crossOrigin = 'anonymous';
              audio.preload = 'auto';
              audio.src = track.audioUrl;
              trackAudioRefs.current.set(track.id, audio);
              
              // Get duration from audio
              audio.onloadedmetadata = () => {
                if (audio.duration && isFinite(audio.duration) && audio.duration > maxDuration) {
                  maxDuration = audio.duration;
                  setDuration(maxDuration);
                }
              };
              
              // Start loading
              audio.load();
              console.log('[StudioView] Pre-loading audio for track:', track.id, track.audioUrl?.substring(0, 50));
            }
          }
          
          // If project has recordings, mark as having first recording (but don't show "first take" message)
          if (project.tracks.some(t => t.audioUrl)) {
            setHasFirstRecording(true);
            // Don't set justRecordedFirstTake - that's only for new recordings
          }
          
          // If no duration from project, try to get it from track duration
          if (!project.duration || project.duration === 0) {
            const trackWithDuration = project.tracks.find(t => t.duration && t.duration > 0);
            if (trackWithDuration?.duration) {
              setDuration(trackWithDuration.duration);
            }
          }
        }
      }
    } catch (error) {
      console.error('[StudioView] Error loading project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleMute = (trackId: string) => {
    setTracks(tracks.map(t => t.id === trackId ? { ...t, muted: !t.muted } : t));
  };

  const toggleSolo = (trackId: string) => {
    setTracks(tracks.map(t => t.id === trackId ? { ...t, solo: !t.solo } : t));
  };

  const addNewTrack = () => {
    const trackNumber = tracks.length + 1;
    const newTrack: Track = {
      id: `track-${Date.now()}`,
      name: `Vocal ${trackNumber}`,
      icon: Mic,
      volume: 80,
      muted: false,
      solo: false,
      isActive: true,
      isRecording: false,
      waveformHeights: []
    };
    // Set all other tracks to inactive
    setTracks(prev => [...prev.map(t => ({ ...t, isActive: false })), newTrack]);
  };

  const setActiveTrack = (trackId: string) => {
    setTracks(tracks.map(t => ({ ...t, isActive: t.id === trackId })));
  };

  // Delete track
  const deleteTrack = (trackId: string) => {
    if (tracks.length <= 1) return;
    const trackToDelete = tracks.find(t => t.id === trackId);
    if (trackToDelete?.audioUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(trackToDelete.audioUrl);
    }
    const newTracks = tracks.filter(t => t.id !== trackId);
    if (trackToDelete?.isActive && newTracks.length > 0) {
      newTracks[0].isActive = true;
    }
    setTracks(newTracks);
  };

  // Rename track
  const startEditingTrackName = (trackId: string, currentName: string) => {
    setEditingTrackId(trackId);
    setEditingTrackName(currentName);
  };

  const saveTrackName = () => {
    if (editingTrackId && editingTrackName.trim()) {
      setTracks(prev => prev.map(t => 
        t.id === editingTrackId ? { ...t, name: editingTrackName.trim() } : t
      ));
    }
    setEditingTrackId(null);
    setEditingTrackName('');
  };

  // Metronome
  const playMetronomeClick = () => {
    if (!metronomeAudioRef.current) {
      metronomeAudioRef.current = new AudioContext();
    }
    const ctx = metronomeAudioRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 1000;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.1);
  };

  const toggleMetronome = () => {
    if (metronomeEnabled) {
      if (metronomeIntervalRef.current) {
        clearInterval(metronomeIntervalRef.current);
        metronomeIntervalRef.current = null;
      }
      setMetronomeEnabled(false);
    } else {
      const intervalMs = (60 / metronomeTempo) * 1000;
      playMetronomeClick();
      metronomeIntervalRef.current = setInterval(playMetronomeClick, intervalMs);
      setMetronomeEnabled(true);
    }
  };

  const updateMetronomeTempo = (newTempo: number) => {
    setMetronomeTempo(newTempo);
    if (metronomeEnabled && metronomeIntervalRef.current) {
      clearInterval(metronomeIntervalRef.current);
      const intervalMs = (60 / newTempo) * 1000;
      metronomeIntervalRef.current = setInterval(playMetronomeClick, intervalMs);
    }
  };

  // Delete accompaniment track
  const deleteAccompanimentTrack = (trackId: string) => {
    setAccompanimentTracks(prev => prev.filter(t => t.id !== trackId));
    accompanimentEngine.stopAccompaniment();
    setIsAccompanimentPlaying(false);
  };

  // Generate piano accompaniment
  const generatePiano = async () => {
    setIsGeneratingAccompaniment(true);
    try {
      const trackWithAudio = tracks.find(t => t.audioBlob);
      if (trackWithAudio?.audioBlob) {
        const arrayBuffer = await trackWithAudio.audioBlob.arrayBuffer();
        const audioContext = new AudioContext();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const key = await accompanimentEngine.detectKeyFromAudio(audioBuffer);
        setDetectedKey(key);
      }
      const track = await accompanimentEngine.generatePianoAccompaniment();
      setAccompanimentTracks(prev => [...prev.filter(t => t.type !== 'piano'), track]);
    } catch (error) {
      console.error('[StudioView] Piano generation failed:', error);
    } finally {
      setIsGeneratingAccompaniment(false);
    }
  };

  // Generate guitar accompaniment
  const generateGuitar = async () => {
    setIsGeneratingAccompaniment(true);
    try {
      const trackWithAudio = tracks.find(t => t.audioBlob);
      if (trackWithAudio?.audioBlob && !detectedKey) {
        const arrayBuffer = await trackWithAudio.audioBlob.arrayBuffer();
        const audioContext = new AudioContext();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const key = await accompanimentEngine.detectKeyFromAudio(audioBuffer);
        setDetectedKey(key);
      }
      const track = await accompanimentEngine.generateGuitarAccompaniment();
      setAccompanimentTracks(prev => [...prev.filter(t => t.type !== 'guitar'), track]);
    } catch (error) {
      console.error('[StudioView] Guitar generation failed:', error);
    } finally {
      setIsGeneratingAccompaniment(false);
    }
  };

  // Regenerate accompaniment
  const regenerateAccompaniment = async (type: 'piano' | 'guitar') => {
    if (type === 'piano') await generatePiano();
    else await generateGuitar();
  };

  // Toggle accompaniment playback
  const toggleAccompanimentPlayback = () => {
    if (isAccompanimentPlaying) {
      accompanimentEngine.stopAccompaniment();
      setIsAccompanimentPlaying(false);
    } else {
      accompanimentEngine.startAccompaniment();
      setIsAccompanimentPlaying(true);
    }
  };

  // Add accompaniment to project as a track
  const addAccompanimentToProject = async (aTrack: AccompanimentTrack) => {
    setIsAddingAccompanimentToProject(true);
    try {
      // Render the accompaniment to audio (8 seconds of the pattern)
      const offlineCtx = new OfflineAudioContext(2, 44100 * 8, 44100);
      
      // For now, create a simple placeholder - in production you'd render the Tone.js sequence
      // This creates a simple chord tone as placeholder
      const oscillator = offlineCtx.createOscillator();
      const gain = offlineCtx.createGain();
      oscillator.type = aTrack.type === 'piano' ? 'triangle' : 'sawtooth';
      oscillator.frequency.value = 261.63; // C4
      gain.gain.value = 0.3;
      oscillator.connect(gain);
      gain.connect(offlineCtx.destination);
      oscillator.start();
      oscillator.stop(8);
      
      const renderedBuffer = await offlineCtx.startRendering();
      
      // Convert to blob
      const blob = audioBufferToWav(renderedBuffer);
      const audioUrl = URL.createObjectURL(blob);
      
      // Add as new track
      const newTrack: Track = {
        id: `track-${Date.now()}`,
        name: `${aTrack.type === 'piano' ? 'Piano' : 'Guitar'} (${aTrack.key} ${aTrack.mode})`,
        icon: Mic,
        volume: aTrack.volume,
        muted: false,
        solo: false,
        isActive: false,
        isRecording: false,
        waveformHeights: generateSimpleWaveform(50),
        audioBlob: blob,
        audioUrl: audioUrl
      };
      
      setTracks(prev => [...prev, newTrack]);
      
      // Remove from accompaniment tracks
      setAccompanimentTracks(prev => prev.filter(t => t.id !== aTrack.id));
      accompanimentEngine.stopAccompaniment();
      setIsAccompanimentPlaying(false);
    } catch (error) {
      console.error('[StudioView] Failed to add accompaniment to project:', error);
    } finally {
      setIsAddingAccompanimentToProject(false);
    }
  };

  // Helper to generate simple waveform visualization
  const generateSimpleWaveform = (length: number): number[] => {
    return Array.from({ length }, () => Math.random() * 60 + 20);
  };

  // Helper to convert AudioBuffer to WAV blob
  const audioBufferToWav = (buffer: AudioBuffer): Blob => {
    const numChannels = buffer.numberOfChannels;
    const length = buffer.length * numChannels * 2;
    const arrayBuffer = new ArrayBuffer(44 + length);
    const view = new DataView(arrayBuffer);
    
    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, buffer.sampleRate, true);
    view.setUint32(28, buffer.sampleRate * numChannels * 2, true);
    view.setUint16(32, numChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length, true);
    
    const channels = [];
    for (let i = 0; i < numChannels; i++) channels.push(buffer.getChannelData(i));
    
    let pos = 44;
    for (let i = 0; i < buffer.length; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        const sample = Math.max(-1, Math.min(1, channels[ch][i]));
        view.setInt16(pos, sample * 0x7FFF, true);
        pos += 2;
      }
    }
    
    return new Blob([arrayBuffer], { type: 'audio/wav' });
  };

  // Handle effects change
  const handleEffectsChange = (trackId: string, effects: TrackEffects) => {
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, effects } : t));
    trackEffectsEngine.applyEffects(trackId, effects);
  };

  // Open effects panel for a track
  const openEffectsPanel = (trackId: string) => {
    setEffectsTrackId(trackId);
    setShowEffectsPanel(true);
  };

  // State for delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [trackToDelete, setTrackToDelete] = useState<string | null>(null);

  // Start recording - check if track has existing audio first
  const handleStartRecording = async () => {
    const activeTrack = tracks.find(t => t.isActive);
    if (!activeTrack) {
      addNewTrack();
      return;
    }

    // If track already has audio, prompt to delete first
    if (activeTrack.audioUrl) {
      setTrackToDelete(activeTrack.id);
      setShowDeleteConfirm(true);
      return;
    }

    await startRecordingOnTrack();
  };

  // Actually start recording (after confirmation if needed)
  const startRecordingOnTrack = async () => {
    try {
      await initializeAudio();
      const success = await audioEngine.startRecording();
      if (success) {
        setIsRecording(true);
        recordingStartTime.current = Date.now();
        waveformSamples.current = [];
        
        setTracks(prev => prev.map(t => 
          t.isActive ? { ...t, isRecording: true } : t
        ));
        
        // Start backing track if enabled
        if (backingTrackEnabled && backingTrackRef.current) {
          backingTrackRef.current.currentTime = 0;
          backingTrackRef.current.play().catch(console.error);
        }
        
        recordingInterval.current = setInterval(() => {
          const elapsed = (Date.now() - recordingStartTime.current) / 1000;
          setCurrentTime(elapsed);
          setDuration(elapsed);
        }, 100);
      }
    } catch (error) {
      console.error('[StudioView] Failed to start recording:', error);
    }
  };

  // Delete track audio and start fresh recording
  const handleDeleteAndRecord = async () => {
    if (trackToDelete) {
      // Clear the track's audio
      setTracks(prev => prev.map(t => 
        t.id === trackToDelete 
          ? { ...t, audioUrl: undefined, audioBlob: undefined, waveformHeights: [] } 
          : t
      ));
      // Remove from audio refs
      trackAudioRefs.current.delete(trackToDelete);
    }
    setShowDeleteConfirm(false);
    setTrackToDelete(null);
    
    // Start recording after a brief delay
    setTimeout(() => startRecordingOnTrack(), 100);
  };

  // Stop recording - THIS IS WHERE THE MAGIC HAPPENS
  const handleStopRecording = async () => {
    if (!isRecording) return;
    
    try {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
        recordingInterval.current = null;
      }
      
      // Stop backing track
      if (backingTrackRef.current) {
        backingTrackRef.current.pause();
        backingTrackRef.current.currentTime = 0;
      }
      
      const blob = await audioEngine.stopRecording();
      setIsRecording(false);
      
      if (blob) {
        const recordingDuration = (Date.now() - recordingStartTime.current) / 1000;
        const waveform = normalizeWaveform(waveformSamples.current);
        const activeTrackId = tracks.find(t => t.isActive)?.id;
        
        // IMPORTANT: Store the blob on the track immediately so playback works
        // The blob will be replaced with cloud URL after upload succeeds
        setTracks(prev => prev.map(t => {
          if (t.isActive) {
            return {
              ...t,
              isRecording: false,
              waveformHeights: waveform,
              audioBlob: blob // Store blob for immediate playback
            };
          }
          return { ...t, isRecording: false };
        }));
        
        setDuration(recordingDuration);
        
        // Auto-play the recording immediately
        if (activeTrackId) {
          const blobUrl = URL.createObjectURL(blob);
          const audio = new Audio(blobUrl);
          audio.crossOrigin = 'anonymous';
          trackAudioRefs.current.set(activeTrackId, audio);
          playbackAudioRef.current = audio;
          
          audio.play().catch(e => console.error('[StudioView] Auto-play error:', e));
          setIsPlaying(true);
          
          audio.onended = () => {
            setIsPlaying(false);
            // DON'T revoke blob URL here - we need it for replay until cloud upload completes
            if (!hasFirstRecording && !isExistingProject) {
              setHasFirstRecording(true);
              setJustRecordedFirstTake(true);
              setShowNextActionPrompt(true);
            }
          };
          
          audio.ontimeupdate = () => {
            setCurrentTime(audio.currentTime);
          };
        }
        
        // Show prompt for first recording
        if (!hasFirstRecording && !isExistingProject) {
          setTimeout(() => {
            setJustRecordedFirstTake(true);
            setShowNextActionPrompt(true);
          }, 1500);
        }
        
        // Upload to Cloudinary - this will set the permanent cloud URL
        const activeTrack = tracks.find(t => t.isActive);
        if (activeTrack && currentProject) {
          uploadRecordingToCloud(blob, activeTrack.id);
        } else {
          // No project yet - blob is already stored on track
          console.log('[StudioView] No project - blob stored, will upload after project creation');
        }
      }
    } catch (error) {
      console.error('[StudioView] Failed to stop recording:', error);
      setIsRecording(false);
      setTracks(prev => prev.map(t => ({ ...t, isRecording: false })));
    }
  };

  // Upload recording to Cloudinary
  const uploadRecordingToCloud = async (blob: Blob, trackId: string) => {
    if (!currentProject) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const fileName = generateRecordingFileName(currentProject.name);
      const result = await uploadRecording(
        blob,
        fileName,
        currentProject.id,
        trackId,
        currentZone?.id
      );
      
      if (result.success && result.url) {
        console.log('[StudioView] Recording uploaded:', result.url);
        
        // Get the old audio element to revoke its blob URL if any
        const oldAudio = trackAudioRefs.current.get(trackId);
        if (oldAudio?.src?.startsWith('blob:')) {
          URL.revokeObjectURL(oldAudio.src);
        }
        
        // Update track with cloud URL and clear blob
        setTracks(prev => prev.map(t => 
          t.id === trackId ? { ...t, audioUrl: result.url, audioBlob: undefined } : t
        ));
        
        // Update audio ref with cloud URL
        const audio = new Audio(result.url);
        audio.crossOrigin = 'anonymous';
        audio.preload = 'auto';
        trackAudioRefs.current.set(trackId, audio);
        audio.load();
        
        console.log('[StudioView] Track updated with cloud URL, blob cleared');
      } else {
        console.error('[StudioView] Upload failed - keeping blob for playback');
        // Keep the blob on the track so user can still play
      }
    } catch (error) {
      console.error('[StudioView] Upload failed:', error);
      // Keep the blob on the track so user can still play
    } finally {
      setIsUploading(false);
      setUploadProgress(100);
    }
  };

  const handleRecordToggle = () => {
    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  };

  const normalizeWaveform = (samples: number[]): number[] => {
    if (samples.length === 0) return [];
    const targetLength = 50;
    const step = Math.max(1, Math.floor(samples.length / targetLength));
    const downsampled: number[] = [];
    
    for (let i = 0; i < samples.length; i += step) {
      const chunk = samples.slice(i, i + step);
      const avg = chunk.reduce((a, b) => a + b, 0) / chunk.length;
      downsampled.push(avg);
    }
    
    const max = Math.max(...downsampled, 1);
    return downsampled.map(v => Math.round((v / max) * 80));
  };

  // Multi-track playback - plays all tracks together like a real DAW
  const handlePlayPause = async () => {
    console.log('[StudioView] handlePlayPause called, isPlaying:', isPlaying);
    
    if (isPlaying) {
      // Pause all tracks
      trackAudioRefs.current.forEach(audio => audio.pause());
      // Also pause the legacy playback ref if it exists
      if (playbackAudioRef.current) {
        playbackAudioRef.current.pause();
      }
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
        playbackIntervalRef.current = null;
      }
      setIsPlaying(false);
      return;
    }
    
    // Get all tracks with audio (either blob or URL)
    const tracksWithAudio = tracks.filter(t => t.audioBlob || t.audioUrl);
    console.log('[StudioView] Tracks with audio:', tracksWithAudio.length);
    
    if (tracksWithAudio.length === 0) {
      console.log('[StudioView] No audio tracks to play');
      return;
    }
    
    // Create audio elements for each track
    for (const track of tracksWithAudio) {
      let audio = trackAudioRefs.current.get(track.id);
      
      // Determine the best source: prefer blob (local recording), fallback to cloud URL
      let sourceUrl: string | undefined;
      let isNewBlobUrl = false;
      
      if (track.audioBlob) {
        // Use blob directly - create fresh blob URL each time
        // First revoke any existing blob URL to prevent memory leaks
        if (audio?.src?.startsWith('blob:')) {
          URL.revokeObjectURL(audio.src);
        }
        sourceUrl = URL.createObjectURL(track.audioBlob);
        isNewBlobUrl = true;
        console.log('[StudioView] Using blob for track:', track.id);
      } else if (track.audioUrl) {
        // Check if it's a valid cloud URL
        const isCloudUrl = track.audioUrl.includes('cloudinary') || 
                          track.audioUrl.includes('res.cloudinary') ||
                          (track.audioUrl.startsWith('https://') && !track.audioUrl.startsWith('blob:'));
        
        if (isCloudUrl) {
          sourceUrl = track.audioUrl;
          console.log('[StudioView] Using cloud URL for track:', track.id, sourceUrl?.substring(0, 60));
        } else {
          console.log('[StudioView] Skipping invalid URL for track:', track.id);
          continue;
        }
      } else {
        console.log('[StudioView] No valid audio source for track:', track.id);
        continue;
      }
      
      if (!sourceUrl) continue;
      
      // Create new audio element if needed or if source changed
      if (!audio || isNewBlobUrl || audio.src !== sourceUrl) {
        console.log('[StudioView] Creating/updating audio element for track:', track.id);
        audio = new Audio();
        audio.crossOrigin = 'anonymous';
        audio.src = sourceUrl;
        trackAudioRefs.current.set(track.id, audio);
        audio.load();
      }
    }
    
    // Wait for all audio to be ready
    const loadPromises = tracksWithAudio.map(track => {
      const audio = trackAudioRefs.current.get(track.id);
      if (!audio || !audio.src) return Promise.resolve();
      
      return new Promise<void>((resolve) => {
        if (audio.readyState >= 3) {
          resolve();
          return;
        }
        
        const onCanPlay = () => {
          audio.removeEventListener('canplaythrough', onCanPlay);
          audio.removeEventListener('error', onError);
          resolve();
        };
        
        const onError = () => {
          console.error('[StudioView] Audio load error for track:', track.id);
          audio.removeEventListener('canplaythrough', onCanPlay);
          audio.removeEventListener('error', onError);
          resolve();
        };
        
        audio.addEventListener('canplaythrough', onCanPlay);
        audio.addEventListener('error', onError);
        
        setTimeout(() => {
          audio.removeEventListener('canplaythrough', onCanPlay);
          audio.removeEventListener('error', onError);
          resolve();
        }, 5000);
        
        audio.load();
      });
    });
    
    await Promise.all(loadPromises);
    
    // Initialize effects engine
    await trackEffectsEngine.initialize();
    
    // Apply track settings and play
    let maxDuration = duration;
    const soloTracks = tracks.filter(t => t.solo && (t.audioBlob || t.audioUrl));
    
    for (const track of tracksWithAudio) {
      const audio = trackAudioRefs.current.get(track.id);
      if (audio && audio.src) {
        // Connect to effects engine if track has effects
        if (track.effects) {
          const existingNodes = trackEffectsEngine.createTrackChain(track.id, audio);
          if (existingNodes) {
            trackEffectsEngine.applyEffects(track.id, track.effects);
            // When using effects engine, set audio volume to 1 (effects handle volume)
            audio.volume = 1;
          } else {
            // Fallback to direct volume control
            if (soloTracks.length > 0) {
              audio.volume = track.solo ? (track.volume / 100) : 0;
            } else {
              audio.volume = track.muted ? 0 : track.volume / 100;
            }
          }
        } else {
          // No effects - use direct volume control
          if (soloTracks.length > 0) {
            audio.volume = track.solo ? (track.volume / 100) : 0;
          } else {
            audio.volume = track.muted ? 0 : track.volume / 100;
          }
        }
        
        // Set current time
        if (currentTime > 0 && audio.duration && currentTime < audio.duration) {
          audio.currentTime = currentTime;
        }
        
        // Update max duration
        if (audio.duration && isFinite(audio.duration) && audio.duration > maxDuration) {
          maxDuration = audio.duration;
        }
      }
    }
    
    if (maxDuration > duration) {
      setDuration(maxDuration);
    }
    
    // Play all tracks
    let anyPlaying = false;
    for (const track of tracksWithAudio) {
      const audio = trackAudioRefs.current.get(track.id);
      if (audio && audio.src) {
        try {
          await audio.play();
          anyPlaying = true;
          console.log('[StudioView] Playing track:', track.id);
        } catch (e) {
          console.error('[StudioView] Play error for track:', track.id, e);
        }
      }
    }
    
    if (anyPlaying) {
      setIsPlaying(true);
      
      // Update timeline
      playbackIntervalRef.current = setInterval(() => {
        const firstAudio = trackAudioRefs.current.values().next().value;
        if (firstAudio) {
          setCurrentTime(firstAudio.currentTime);
          if (firstAudio.ended) {
            handleStop();
          }
        }
      }, 50);
    }
  };

  // Seek to position (click on timeline)
  const handleSeek = (time: number) => {
    setCurrentTime(time);
    trackAudioRefs.current.forEach(audio => {
      audio.currentTime = time;
    });
  };

  const handleStop = () => {
    if (isRecording) {
      handleStopRecording();
    }
    // Stop all track audio
    trackAudioRefs.current.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    if (playbackIntervalRef.current) {
      clearInterval(playbackIntervalRef.current);
      playbackIntervalRef.current = null;
    }
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // Next action handlers
  const handleAddLayer = () => {
    setShowNextActionPrompt(false);
    addNewTrack();
  };

  const handlePractice = () => {
    setShowNextActionPrompt(false);
    setView('practice');
  };

  const handleSave = async () => {
    setShowNextActionPrompt(false);
    
    // If no project exists yet, create one first
    if (!currentProject && user?.uid) {
      try {
        const result = await createProject({
          name: 'My Recording',
          ownerId: user.uid,
          zoneId: currentZone?.id
        });
        
        if (result.success && result.project) {
          setCurrentProject(result.project);
          setContextProject(result.project.id);
          // Now save the tracks
          setTimeout(() => saveProject(), 500);
        }
      } catch (error) {
        console.error('[StudioView] Error creating project:', error);
      }
    } else {
      // Project exists, just save
      await saveProject();
    }
  };

  // Check if we have any recordings
  const hasRecordings = tracks.some(t => t.audioUrl || t.waveformHeights.length > 0);

  // Auto-save project when tracks change
  const saveProject = useCallback(async () => {
    if (!currentProject || !user?.uid) return;
    
    setIsSaving(true);
    setSaveError(null);
    
    try {
      const tracksToSave = tracks.map(t => ({
        id: t.id,
        name: t.name,
        type: 'vocal' as const,
        color: '#8b5cf6',
        volume: t.volume,
        pan: 0,
        muted: t.muted,
        solo: t.solo,
        audioUrl: t.audioUrl,
        waveform: t.waveformHeights,
        duration: duration
      }));
      
      const result = await updateProject(currentProject.id, {
        tracks: tracksToSave,
        duration: duration
      });
      
      if (result.success) {
        setLastSaved(new Date());
        console.log('[StudioView] Project saved successfully');
      } else {
        setSaveError('Failed to save');
        console.error('[StudioView] Save failed:', result.error);
      }
    } catch (error) {
      setSaveError('Failed to save');
      console.error('[StudioView] Save error:', error);
    } finally {
      setIsSaving(false);
    }
  }, [currentProject, user?.uid, tracks, duration]);

  // Auto-save when recording stops (after upload completes)
  // Using a ref to track if we should save to avoid infinite loops
  const shouldSaveRef = useRef(false);
  const lastSaveTimeRef = useRef(0);
  
  useEffect(() => {
    // Only trigger save when upload completes and we have recordings
    if (!isUploading && hasRecordings && currentProject && !isRecording) {
      // Debounce: don't save more than once every 5 seconds
      const now = Date.now();
      if (now - lastSaveTimeRef.current > 5000) {
        shouldSaveRef.current = true;
        lastSaveTimeRef.current = now;
      }
    }
  }, [isUploading, hasRecordings, isRecording]); // Removed currentProject to avoid loop

  useEffect(() => {
    if (shouldSaveRef.current && currentProject) {
      shouldSaveRef.current = false;
      const timeout = setTimeout(() => {
        saveProject();
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [currentProject?.id]); // Only depend on project ID, not the whole object

  // Load audio duration when tracks have audioUrl but no duration
  // Use a ref to track which URLs we've already processed to avoid infinite loops
  const processedAudioUrlsRef = useRef<Set<string>>(new Set());
  
  useEffect(() => {
    const loadTrackDurations = async () => {
      // Only process tracks with cloud URLs (not blob URLs) that we haven't processed yet
      const tracksWithAudio = tracks.filter(t => {
        if (!t.audioUrl) return false;
        if (t.audioUrl.startsWith('blob:')) return false;
        if (processedAudioUrlsRef.current.has(t.audioUrl)) return false;
        return true;
      });
      
      if (tracksWithAudio.length === 0) return;
      
      let maxDuration = 0;
      
      for (const track of tracksWithAudio) {
        if (!track.audioUrl) continue;
        
        // Mark as processed immediately to prevent re-processing
        processedAudioUrlsRef.current.add(track.audioUrl);
        
        try {
          const audio = new Audio();
          audio.crossOrigin = 'anonymous';
          audio.src = track.audioUrl;
          trackAudioRefs.current.set(track.id, audio);
          
          await new Promise<void>((resolve) => {
            audio.onloadedmetadata = () => {
              if (audio.duration && isFinite(audio.duration) && audio.duration > maxDuration) {
                maxDuration = audio.duration;
              }
              resolve();
            };
            audio.onerror = () => resolve();
            setTimeout(resolve, 5000);
          });
        } catch (e) {
          console.error('[StudioView] Error loading track duration:', e);
        }
      }
      
      if (maxDuration > 0) {
        setDuration(prev => Math.max(prev, maxDuration));
      }
    };
    
    loadTrackDurations();
  }, [tracks.length]); // Only re-run when track count changes

  // Format last saved time
  const formatLastSaved = () => {
    if (!lastSaved) return null;
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000);
    if (diff < 60) return 'Saved just now';
    if (diff < 3600) return `Saved ${Math.floor(diff / 60)}m ago`;
    return `Saved ${Math.floor(diff / 3600)}h ago`;
  };

  // Professional DAW Color System:
  // - Background: Dark slate/charcoal (#1a1a1f, #242428)
  // - Recording: Red (#ef4444)
  // - Playing/Success: Green (#10b981)
  // - Solo: Yellow (#eab308)
  // - Mute: Orange (#f97316)
  // - Effects: Cyan (#06b6d4)
  // - Delete: Red (#ef4444)
  // - Info/Loading: Blue (#3b82f6)
  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-b from-[#0f0f14] via-[#0d0d12] to-[#08080c]">
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(139,92,246,0.03)_0%,_transparent_50%)] pointer-events-none" />
      
      {/* ═══════════════════════════════════════════════════════════════
          HEADER - Absolutely positioned at top
      ═══════════════════════════════════════════════════════════════ */}
      <div 
        className="absolute top-0 left-0 right-0 z-[110] flex items-center justify-between px-4 py-3 bg-[#131318]/95 backdrop-blur-sm border-b border-white/5"
        style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 16px)' }}
      >
        <button 
          onClick={() => router.push('/pages/audiolab')}
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-600 hover:bg-slate-500 active:bg-slate-400 transition-colors"
        >
          <ChevronLeft size={22} className="text-white" />
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-base font-semibold text-white tracking-tight">
            {currentProject?.name || 'New Recording'}
          </h2>
          {isRecording ? (
            <span className="text-[10px] text-red-400 font-medium flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Recording
            </span>
          ) : isSaving ? (
            <span className="text-[10px] text-blue-400 font-medium flex items-center gap-1.5 mt-0.5">
              <Loader2 size={10} className="animate-spin" />
              Saving...
            </span>
          ) : saveError ? (
            <span className="text-[10px] text-red-400 font-medium mt-0.5">
              {saveError}
            </span>
          ) : lastSaved ? (
            <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
              <Check size={10} />
              {formatLastSaved()}
            </span>
          ) : currentProject ? (
            <span className="text-[10px] text-slate-500 font-medium mt-0.5">
              Auto-save enabled
            </span>
          ) : null}
        </div>
        <button 
          onClick={() => setShowSettings(true)}
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-600 hover:bg-slate-500 active:bg-slate-400 transition-colors"
        >
          <Settings size={20} className="text-white" />
        </button>
      </div>

      {/* Main Content - Scrollable area below header */}
      <main className="absolute top-[72px] left-0 right-0 bottom-0 overflow-y-auto overflow-x-hidden pb-48" style={{ top: 'calc(72px + env(safe-area-inset-top, 0px))' }}>
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="size-12 rounded-full border-2 border-slate-600 border-t-white animate-spin" />
              </div>
              <span className="text-slate-500 text-sm">Loading studio...</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            {/* ═══════════════════════════════════════════════════════════════
                STATUS BAR - Notifications & Alerts (compact, top of content)
            ═══════════════════════════════════════════════════════════════ */}
            {(justRecordedFirstTake || isUploading) && (
              <div className="px-4 pt-3">
                {justRecordedFirstTake && !isRecording && !isUploading && (
                  <div className="flex items-center gap-2 py-2.5 px-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    <Check size={16} className="text-emerald-400" />
                    <span className="text-emerald-400 text-sm font-medium">First take recorded</span>
                  </div>
                )}
                {isUploading && (
                  <div className="flex items-center gap-2 py-2.5 px-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <Loader2 size={16} className="text-blue-400 animate-spin" />
                    <span className="text-blue-400 text-sm font-medium">Saving to cloud...</span>
                  </div>
                )}
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                EMPTY STATE - Before first recording
            ═══════════════════════════════════════════════════════════════ */}
            {!hasRecordings && !isRecording && (
              <div className="flex flex-col items-center justify-center py-16 px-6">
                <div className="size-20 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 flex items-center justify-center mb-5">
                  <Mic size={32} className="text-slate-400" />
                </div>
                <h3 className="text-white text-lg font-semibold mb-1">Ready to Record</h3>
                <p className="text-slate-500 text-sm text-center max-w-[240px]">
                  Press the record button below to capture your first take
                </p>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                BACKING TRACK SECTION - Compact card when available
            ═══════════════════════════════════════════════════════════════ */}
            {backingTrack && (
              <div className="px-4 pt-4">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div 
                      className="size-10 rounded-lg bg-cover bg-center bg-slate-800 shrink-0"
                      style={{ backgroundImage: backingTrack.albumArt ? `url('${backingTrack.albumArt}')` : 'none' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Backing Track</p>
                      <p className="text-white text-sm font-medium truncate">{backingTrack.title}</p>
                    </div>
                    <button
                      onClick={() => setBackingTrackEnabled(!backingTrackEnabled)}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                        backingTrackEnabled 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {backingTrackEnabled ? 'ON' : 'OFF'}
                    </button>
                  </div>
                  {backingTrackEnabled && (
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-800">
                      <span className="text-[10px] text-slate-500 font-medium uppercase">Volume</span>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={backingTrackVolume}
                        onChange={(e) => setBackingTrackVolume(parseInt(e.target.value))}
                        className="flex-1 h-1 bg-slate-700 rounded-full appearance-none cursor-pointer accent-emerald-500"
                      />
                      <span className="text-xs text-slate-400 font-mono w-8">{backingTrackVolume}%</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                TRACKS SECTION - Main recording area
            ═══════════════════════════════════════════════════════════════ */}
            {(hasRecordings || tracks.length > 0) && (
              <div className="px-4 pt-4">
                {/* Section Header */}
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tracks</h3>
                  {hasRecordings && (
                    <button 
                      onClick={addNewTrack}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <PlusCircle size={14} />
                      Add Layer
                    </button>
                  )}
                </div>

                {/* Timeline Ruler */}
                {hasRecordings && duration > 0 && (
                  <div className="mb-3 relative h-5 border-b border-slate-800">
                    {Array.from({ length: Math.ceil(duration / 5) + 1 }, (_, i) => i * 5).map((sec) => (
                      <div 
                        key={sec}
                        className="absolute bottom-0 flex flex-col items-center"
                        style={{ left: `${(sec / duration) * 100}%` }}
                      >
                        <span className="text-[9px] text-slate-600 font-mono">{formatTime(sec)}</span>
                        <div className="w-px h-1.5 bg-slate-700 mt-0.5" />
                      </div>
                    ))}
                    <div 
                      className="absolute bottom-0 w-0.5 h-full bg-red-500 transition-all z-10"
                      style={{ left: `${(currentTime / duration) * 100}%` }}
                    />
                  </div>
                )}

                {/* Track List */}
                <div className="space-y-2">
                  {tracks.map((track) => {
                    const Icon = track.icon;
                    
                    return (
                      <div 
                        key={track.id}
                        onClick={() => setActiveTrack(track.id)}
                        className={`relative rounded-xl overflow-hidden transition-all cursor-pointer ${
                          track.isActive 
                            ? 'bg-[#1e1e24] ring-1 ring-violet-500/50' 
                            : 'bg-[#16161a] hover:bg-[#1a1a1f]'
                        }`}
                      >
                        {/* Track Header - Compact */}
                        <div className="flex items-center gap-2.5 px-3 py-2.5">
                          {/* Track Icon */}
                          <div className={`relative flex items-center justify-center shrink-0 size-9 rounded-lg transition-all ${
                            track.isActive 
                              ? 'bg-slate-700 text-white' 
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            <Icon size={18} />
                            {track.isRecording && (
                              <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-red-500 animate-pulse" />
                            )}
                          </div>
                          
                          {/* Track Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              {editingTrackId === track.id ? (
                                <input
                                  type="text"
                                  value={editingTrackName}
                                  onChange={(e) => setEditingTrackName(e.target.value)}
                                  onBlur={saveTrackName}
                                  onKeyDown={(e) => e.key === 'Enter' && saveTrackName()}
                                  autoFocus
                                  className="text-sm font-medium bg-transparent border-b border-white outline-none text-white w-24"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEditingTrackName(track.id, track.name);
                                  }}
                                  className="text-sm font-medium text-white truncate hover:text-slate-300 flex items-center gap-1 group"
                                >
                                  {track.name}
                                  <Pencil size={10} className="opacity-0 group-hover:opacity-50 transition-opacity" />
                                </button>
                              )}
                            </div>
                            {/* Volume - inline */}
                            <div className="flex items-center gap-2 mt-1">
                              <div className="relative flex-1 max-w-16 h-1 bg-slate-700 rounded-full overflow-hidden">
                                <div 
                                  className="absolute inset-y-0 left-0 bg-slate-400 rounded-full"
                                  style={{ width: `${track.volume}%` }}
                                />
                                <input 
                                  type="range" 
                                  min="0" 
                                  max="100" 
                                  value={track.volume}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    setTracks(tracks.map(t => 
                                      t.id === track.id ? { ...t, volume: parseInt(e.target.value) } : t
                                    ));
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                              </div>
                              <span className="text-[10px] font-mono text-slate-500 w-6">{track.volume}</span>
                            </div>
                          </div>
                          
                          {/* Track Controls */}
                          <div className="flex items-center gap-1">
                            {track.audioUrl && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!isPlaying) {
                                    setActiveTrack(track.id);
                                    handlePlayPause();
                                  } else {
                                    handlePlayPause();
                                  }
                                }}
                                className={`size-7 flex items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                                  isPlaying && track.isActive
                                    ? 'bg-emerald-500 text-white' 
                                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                }`}
                              >
                                {isPlaying && track.isActive ? <Pause size={12} /> : <Play size={12} />}
                              </button>
                            )}
                            <button 
                              onClick={(e) => { e.stopPropagation(); toggleMute(track.id); }}
                              className={`size-7 flex items-center justify-center rounded-lg text-[10px] font-bold transition-colors ${
                                track.muted 
                                  ? 'bg-orange-500 text-white' 
                                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                              }`}
                            >
                              M
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); toggleSolo(track.id); }}
                              className={`size-7 flex items-center justify-center rounded-lg text-[10px] font-bold transition-colors ${
                                track.solo 
                                  ? 'bg-yellow-500 text-black' 
                                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                              }`}
                            >
                              S
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setEffectsTrackId(track.id);
                                setShowEffectsPanel(true);
                              }}
                              className="size-7 flex items-center justify-center rounded-lg bg-slate-700 text-slate-400 hover:bg-slate-600 transition-colors"
                            >
                              <Sliders size={12} />
                            </button>
                            {tracks.length > 1 && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); deleteTrack(track.id); }}
                                className="size-7 flex items-center justify-center rounded-lg bg-slate-700 text-slate-400 hover:text-red-400 hover:bg-slate-600 transition-colors"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Waveform Area */}
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveTrack(track.id);
                            if (duration > 0 && track.audioUrl) {
                              const rect = e.currentTarget.getBoundingClientRect();
                              const clickX = e.clientX - rect.left;
                              const percentage = clickX / rect.width;
                              handleSeek(percentage * duration);
                            }
                          }}
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            if (track.audioUrl) handlePlayPause();
                          }}
                          className={`w-full bg-[#0f0f12] relative overflow-hidden ${
                            track.isActive ? 'h-16' : 'h-12'
                          }`}
                        >
                          {track.waveformHeights.length === 0 && !track.isRecording ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-slate-600 text-xs">
                                {track.isActive ? 'Ready to record' : 'Empty'}
                              </span>
                              <div className="absolute inset-x-4 top-1/2 border-t border-dashed border-slate-800" />
                            </div>
                          ) : (
                            <AnimatedWaveform
                              isPlaying={isPlaying && track.isActive}
                              isRecording={track.isRecording}
                              inputLevel={track.isRecording ? inputLevel : 0}
                              staticHeights={track.waveformHeights}
                              currentTime={currentTime}
                              duration={duration}
                              height={track.isActive ? 64 : 48}
                              className={!track.isActive ? 'opacity-60' : ''}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* AI ACCOMPANIMENT SECTION */}
            {hasRecordings && (
              <div className="px-4 pt-6 pb-4">
                {/* Section Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-slate-500" />
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">AI Accompaniment</h3>
                    {detectedKey && (
                      <span className="text-[10px] bg-[#1e1e24] text-slate-400 px-2 py-0.5 rounded font-mono">
                        {detectedKey.key} {detectedKey.mode}
                      </span>
                    )}
                  </div>
                </div>

                {/* Generate Buttons - Same style, no gradients */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                    onClick={generatePiano}
                    disabled={isGeneratingAccompaniment}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#1e1e24] hover:bg-[#252530] text-white font-medium text-sm transition-colors disabled:opacity-50"
                  >
                    {isGeneratingAccompaniment ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Piano size={16} />
                    )}
                    Piano
                  </button>
                  <button
                    onClick={generateGuitar}
                    disabled={isGeneratingAccompaniment}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#1e1e24] hover:bg-[#252530] text-white font-medium text-sm transition-colors disabled:opacity-50"
                  >
                    {isGeneratingAccompaniment ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Guitar size={16} />
                    )}
                    Guitar
                  </button>
                </div>

                {/* Generated Accompaniment Tracks */}
                {accompanimentTracks.length > 0 && (
                  <div className="space-y-2">
                    {accompanimentTracks.map((aTrack) => (
                      <div 
                        key={aTrack.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-[#1e1e24]"
                      >
                        <div className="size-9 rounded-lg flex items-center justify-center bg-slate-700 text-slate-300">
                          {aTrack.type === 'piano' ? <Piano size={18} /> : <Guitar size={18} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white capitalize">{aTrack.type}</p>
                          <p className="text-xs text-slate-500 truncate">
                            {aTrack.key} {aTrack.mode} • {aTrack.pattern}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={toggleAccompanimentPlayback}
                            className={`size-7 flex items-center justify-center rounded-lg transition-colors ${
                              isAccompanimentPlaying 
                                ? 'bg-emerald-500 text-white' 
                                : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                            }`}
                          >
                            {isAccompanimentPlaying ? <Pause size={12} /> : <Play size={12} />}
                          </button>
                          <button
                            onClick={() => addAccompanimentToProject(aTrack)}
                            disabled={isAddingAccompanimentToProject}
                            className="size-7 flex items-center justify-center rounded-lg bg-slate-700 text-slate-400 hover:bg-slate-600 transition-colors disabled:opacity-50"
                            title="Add to Project"
                          >
                            {isAddingAccompanimentToProject ? <Loader2 size={10} className="animate-spin" /> : <Download size={12} />}
                          </button>
                          <button
                            onClick={() => regenerateAccompaniment(aTrack.type)}
                            className="size-7 flex items-center justify-center rounded-lg bg-slate-700 text-slate-400 hover:bg-slate-600 transition-colors"
                          >
                            <RefreshCw size={12} />
                          </button>
                          <button
                            onClick={() => deleteAccompanimentTrack(aTrack.id)}
                            className="size-7 flex items-center justify-center rounded-lg bg-slate-700 text-slate-400 hover:text-red-400 hover:bg-slate-600 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ═══════════════════════════════════════════════════════════════
          TRANSPORT BAR - Professional DAW style with glass effect
      ═══════════════════════════════════════════════════════════════ */}
      <div className="absolute bottom-0 left-0 right-0 z-[110] bg-[#131318]/95 backdrop-blur-xl border-t border-white/5">
        <div className="px-4 pt-4 pb-6" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 24px)' }}>
          {/* Time Display Row */}
          <div className="flex justify-between items-center mb-5">
            {/* Time Counter */}
            <div className="flex items-baseline gap-1.5">
              <span className={`text-3xl font-bold tabular-nums font-mono tracking-tight ${isRecording ? 'text-red-500' : 'text-white'}`}>
                {formatTime(currentTime)}
              </span>
              {duration > 0 && !isRecording && (
                <span className="text-base font-medium text-slate-500 tabular-nums font-mono">
                  / {formatTime(duration)}
                </span>
              )}
            </div>
            
            {/* Right side controls */}
            <div className="flex items-center gap-3">
              {/* Metronome */}
              <button
                onClick={toggleMetronome}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                  metronomeEnabled 
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                    : 'bg-white/5 text-slate-400 border border-white/5 hover:bg-white/10'
                }`}
              >
                <Timer size={16} />
                {metronomeEnabled && (
                  <span className="text-sm font-mono font-semibold">{metronomeTempo}</span>
                )}
              </button>
              
              {/* Input Level Meter */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/5">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isRecording ? 'text-red-400' : 'text-slate-500'}`}>
                  {isRecording ? 'REC' : 'IN'}
                </span>
                <div className="flex gap-[3px] h-4">
                  {[0.1, 0.2, 0.3, 0.5, 0.7, 0.9].map((threshold, i) => {
                    const isActive = inputLevel >= threshold;
                    const color = i < 3 ? 'green' : i < 5 ? 'yellow' : 'red';
                    return (
                      <div 
                        key={i}
                        className="w-1.5 rounded-full transition-all duration-75"
                        style={{
                          backgroundColor: isActive 
                            ? (color === 'green' ? '#22c55e' : color === 'yellow' ? '#eab308' : '#ef4444')
                            : 'rgba(255,255,255,0.1)',
                          boxShadow: isActive ? `0 0 8px ${color === 'green' ? '#22c55e' : color === 'yellow' ? '#eab308' : '#ef4444'}40` : 'none'
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Transport Controls - Centered with premium styling */}
          <div className="flex items-center justify-center gap-3">
            {/* Skip Back */}
            <button 
              onClick={() => setCurrentTime(0)}
              className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
            >
              <SkipBack size={20} />
            </button>
            
            {/* Play/Pause */}
            <button 
              onClick={handlePlayPause}
              disabled={isRecording || !hasRecordings}
              className={`flex items-center justify-center w-14 h-14 rounded-2xl transition-all active:scale-95 ${
                isRecording || !hasRecordings
                  ? 'bg-white/5 border border-white/5 text-slate-600 cursor-not-allowed'
                  : isPlaying
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                    : 'bg-white/10 border border-white/10 text-white hover:bg-white/15'
              }`}
            >
              {isPlaying ? <Pause size={26} /> : <Play size={26} fill="currentColor" className="ml-1" />}
            </button>
            
            {/* RECORD BUTTON - Premium circular design */}
            <button 
              onClick={handleRecordToggle}
              className={`relative flex items-center justify-center w-[72px] h-[72px] rounded-full transition-all duration-200 active:scale-95 ${
                isRecording 
                  ? 'bg-gradient-to-b from-red-500 to-red-600 shadow-[0_0_30px_rgba(239,68,68,0.4)]' 
                  : 'bg-gradient-to-b from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 shadow-lg shadow-red-500/20'
              }`}
            >
              {/* Outer ring */}
              <div className={`absolute inset-0 rounded-full border-2 ${isRecording ? 'border-red-400/50' : 'border-red-400/30'}`} />
              
              {/* Pulse animation when recording */}
              {isRecording && (
                <div className="absolute inset-[-4px] rounded-full animate-ping bg-red-500/20" />
              )}
              
              {/* Inner icon */}
              <div className="relative z-10">
                {isRecording ? (
                  <Square size={24} fill="currentColor" className="text-white" />
                ) : (
                  <Circle size={32} fill="currentColor" className="text-white" />
                )}
              </div>
            </button>
            
            {/* Stop */}
            <button 
              onClick={handleStop}
              className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 border border-white/10 text-white hover:bg-white/15 active:scale-95 transition-all"
            >
              <Square size={22} fill="currentColor" />
            </button>
            
            {/* Waveform/Effects */}
            <button className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all">
              <AudioLines size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative bg-[#1a1225] rounded-2xl p-6 max-w-sm w-full border border-white/10">
            <h3 className="text-lg font-bold text-white mb-2">Replace Recording?</h3>
            <p className="text-slate-400 text-sm mb-6">
              This track already has a recording. Do you want to delete it and record a new one?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setTrackToDelete(null);
                }}
                className="flex-1 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/15 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAndRecord}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-400 transition-colors"
              >
                Delete & Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Next Action Prompt */}
      <NextActionPrompt
        isOpen={showNextActionPrompt}
        onClose={() => setShowNextActionPrompt(false)}
        onAddLayer={handleAddLayer}
        onPractice={handlePractice}
        onSave={handleSave}
      />

      {/* Project Settings Sheet */}
      <ProjectSettingsSheet
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        project={currentProject}
        onProjectUpdated={(updated) => setCurrentProject(updated)}
        onProjectDeleted={() => {
          setCurrentProject(null);
          setView('home');
        }}
      />

      {/* Track Effects Panel */}
      <TrackEffectsPanel
        isOpen={showEffectsPanel}
        onClose={() => {
          setShowEffectsPanel(false);
          setEffectsTrackId(null);
        }}
        trackId={effectsTrackId || ''}
        trackName={tracks.find(t => t.id === effectsTrackId)?.name || 'Track'}
        initialEffects={tracks.find(t => t.id === effectsTrackId)?.effects || DEFAULT_EFFECTS}
        onEffectsChange={handleEffectsChange}
      />
    </div>
  );
}
