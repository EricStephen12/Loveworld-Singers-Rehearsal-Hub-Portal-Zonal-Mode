'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { NextRouter } from 'next/router';
import { 
  ChevronLeft, Settings, Save, Mic, 
  PlusCircle, SkipBack, Play, Pause, Square, Circle,
  AudioLines, Loader2, Check, Trash2, Piano, Guitar, RefreshCw, Sparkles,
  Sliders, Download, Pencil, Timer, Upload
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
  localStored?: boolean;
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
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  
  const [hasFirstRecording, setHasFirstRecording] = useState(false);
  const [showNextActionPrompt, setShowNextActionPrompt] = useState(false);
  const [justRecordedFirstTake, setJustRecordedFirstTake] = useState(false);
  const [isExistingProject, setIsExistingProject] = useState(false);
  
  const [backingTrackEnabled, setBackingTrackEnabled] = useState(true);
  const [backingTrackVolume, setBackingTrackVolume] = useState(70);
  
  const [showSettings, setShowSettings] = useState(false);
  
  const [detectedKey, setDetectedKey] = useState<DetectedKey | null>(null);
  const [accompanimentTracks, setAccompanimentTracks] = useState<AccompanimentTrack[]>([]);
  const [isGeneratingAccompaniment, setIsGeneratingAccompaniment] = useState(false);
  const [isAccompanimentPlaying, setIsAccompanimentPlaying] = useState(false);
  
  const [showEffectsPanel, setShowEffectsPanel] = useState(false);
  const [effectsTrackId, setEffectsTrackId] = useState<string | null>(null);
  const [isAddingAccompanimentToProject, setIsAddingAccompanimentToProject] = useState(false);
  
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null);
  const [editingTrackName, setEditingTrackName] = useState('');
  
  const [metronomeEnabled, setMetronomeEnabled] = useState(false);
  const [metronomeTempo, setMetronomeTempo] = useState(120);
  const metronomeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const metronomeAudioRef = useRef<AudioContext | null>(null);
  
  const backingTrackRef = useRef<HTMLAudioElement | null>(null);
  
  const backingTrack = state.player.currentSong;
  
  const recordingStartTime = useRef<number>(0);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);
  const waveformSamples = useRef<number[]>([]);
  const playbackAudioRef = useRef<HTMLAudioElement | null>(null);
  
  const trackAudioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());
  const playbackIntervalRef = useRef<number | null>(null);

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

  useEffect(() => {
    if (backingTrackRef.current) {
      backingTrackRef.current.volume = backingTrackEnabled ? backingTrackVolume / 100 : 0;
    }
  }, [backingTrackVolume, backingTrackEnabled]);

  useEffect(() => {
    if (user?.uid && state.currentProjectId) {
      loadSpecificProject(state.currentProjectId);
    }
  }, [user?.uid, state.currentProjectId]);

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
        waveformHeights: [],
        localStored: false
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
        setIsExistingProject(true);
        
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
            audioUrl: t.audioUrl,
            localStored: !!t.audioUrl
          }));
          
          setTracks(loadedTracks);
          
          let maxDuration = project.duration || 0;
          for (const track of loadedTracks) {
            if (track.audioUrl && !track.audioUrl.startsWith('blob:')) {
              const audio = new Audio();
              audio.crossOrigin = 'anonymous';
              audio.preload = 'auto';
              audio.src = track.audioUrl;
              trackAudioRefs.current.set(track.id, audio);
              
              audio.onloadedmetadata = () => {
                if (audio.duration && isFinite(audio.duration) && audio.duration > maxDuration) {
                  maxDuration = audio.duration;
                  setDuration(maxDuration);
                }
              };
              
              audio.load();
            }
          }
          
          if (project.tracks.some(t => t.audioUrl)) {
            setHasFirstRecording(true);
          }
          
          if (!project.duration || project.duration === 0) {
            const trackWithDuration = project.tracks.find(t => t.duration && t.duration > 0);
            if (trackWithDuration?.duration) {
              setDuration(trackWithDuration.duration);
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to load project:', error);
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
    setTracks(prevTracks => {
      const updatedTracks = prevTracks.map(t => t.id === trackId ? { ...t, muted: !t.muted } : t);
      
      // Update the audio element volume immediately
      const audio = trackAudioRefs.current.get(trackId);
      if (audio) {
        const track = updatedTracks.find(t => t.id === trackId);
        if (track) {
          audio.volume = track.muted ? 0 : track.volume / 100;
        }
      }
      
      return updatedTracks;
    });
  };

  const toggleSolo = (trackId: string) => {
    setTracks(prevTracks => {
      const updatedTracks = prevTracks.map(t => t.id === trackId ? { ...t, solo: !t.solo } : t);
      
      // Update the audio element volume immediately
      const audio = trackAudioRefs.current.get(trackId);
      if (audio) {
        const track = updatedTracks.find(t => t.id === trackId);
        if (track) {
          const soloTracks = updatedTracks.filter(t => t.solo && (t.audioBlob || t.audioUrl));
          if (soloTracks.length > 0) {
            audio.volume = track.solo ? track.volume / 100 : 0;
          } else {
            audio.volume = track.muted ? 0 : track.volume / 100;
          }
        }
      }
      
      return updatedTracks;
    });
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
      waveformHeights: [],
      localStored: false
    };
    setTracks(prev => [...prev.map(t => ({ ...t, isActive: false })), newTrack]);
  };

  const setActiveTrack = (trackId: string) => {
    setTracks(tracks.map(t => ({ ...t, isActive: t.id === trackId })));
  };

  const deleteTrack = (trackId: string) => {
    if (tracks.length <= 1) return;
    
    const trackToDelete = tracks.find(t => t.id === trackId);
    
    if (trackToDelete?.audioUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(trackToDelete.audioUrl);
    }
    
    const audio = trackAudioRefs.current.get(trackId);
    if (audio && audio.src.startsWith('blob:')) {
      URL.revokeObjectURL(audio.src);
    }
    trackAudioRefs.current.delete(trackId);
    
    removeRecordingFromLocal(trackId);
    
    const newTracks = tracks.filter(t => t.id !== trackId);
    if (trackToDelete?.isActive && newTracks.length > 0) {
      newTracks[0].isActive = true;
    }
    setTracks(newTracks);
  };

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

  const deleteAccompanimentTrack = (trackId: string) => {
    setAccompanimentTracks(prev => prev.filter(t => t.id !== trackId));
    accompanimentEngine.stopAccompaniment();
    setIsAccompanimentPlaying(false);
  };

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
      console.error('Failed to generate piano:', error);
    } finally {
      setIsGeneratingAccompaniment(false);
    }
  };

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
      console.error('Failed to generate guitar:', error);
    } finally {
      setIsGeneratingAccompaniment(false);
    }
  };

  const regenerateAccompaniment = async (type: 'piano' | 'guitar') => {
    if (type === 'piano') await generatePiano();
    else await generateGuitar();
  };

  const toggleAccompanimentPlayback = () => {
    if (isAccompanimentPlaying) {
      accompanimentEngine.stopAccompaniment();
      setIsAccompanimentPlaying(false);
    } else {
      accompanimentEngine.startAccompaniment();
      setIsAccompanimentPlaying(true);
    }
  };

  // Sync accompaniment with main playback
  useEffect(() => {
    if (isPlaying) {
      if (!isAccompanimentPlaying && accompanimentTracks.length > 0) {
        accompanimentEngine.startAccompaniment();
        setIsAccompanimentPlaying(true);
      }
    } else {
      if (isAccompanimentPlaying) {
        accompanimentEngine.stopAccompaniment();
        setIsAccompanimentPlaying(false);
      }
    }
  }, [isPlaying, isAccompanimentPlaying, accompanimentTracks.length]);

  // Update accompaniment when tracks change
  useEffect(() => {
    if (accompanimentTracks.length > 0 && tracks.length > 0) {
      // Ensure accompaniment is in sync with main playback
      if (isPlaying && !isAccompanimentPlaying) {
        accompanimentEngine.startAccompaniment();
        setIsAccompanimentPlaying(true);
      }
    }
  }, [accompanimentTracks.length, tracks.length, isPlaying, isAccompanimentPlaying]);

  const addAccompanimentToProject = async (aTrack: AccompanimentTrack) => {
    setIsAddingAccompanimentToProject(true);
    try {
      const offlineCtx = new OfflineAudioContext(2, 44100 * 8, 44100);
      
      const oscillator = offlineCtx.createOscillator();
      const gain = offlineCtx.createGain();
      oscillator.type = aTrack.type === 'piano' ? 'triangle' : 'sawtooth';
      oscillator.frequency.value = 261.63;
      gain.gain.value = 0.3;
      oscillator.connect(gain);
      gain.connect(offlineCtx.destination);
      oscillator.start();
      oscillator.stop(8);
      
      const renderedBuffer = await offlineCtx.startRendering();
      const blob = audioBufferToWav(renderedBuffer);
      const audioUrl = URL.createObjectURL(blob);
      
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
        audioBlob: new Blob([blob], { type: blob.type }),
        audioUrl: audioUrl
      };
      
      setTracks(prev => [...prev, newTrack]);
      setAccompanimentTracks(prev => prev.filter(t => t.id !== aTrack.id));
      accompanimentEngine.stopAccompaniment();
      setIsAccompanimentPlaying(false);
    } catch (error) {
      console.error('Failed to add accompaniment:', error);
    } finally {
      setIsAddingAccompanimentToProject(false);
    }
  };

  const generateSimpleWaveform = (length: number): number[] => {
    return Array.from({ length }, () => Math.random() * 60 + 20);
  };

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

  const handleEffectsChange = (trackId: string, effects: TrackEffects) => {
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, effects } : t));
    trackEffectsEngine.applyEffects(trackId, effects);
  };

  const openEffectsPanel = (trackId: string) => {
    setEffectsTrackId(trackId);
    setShowEffectsPanel(true);
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [trackToDelete, setTrackToDelete] = useState<string | null>(null);

  const handleStartRecording = async () => {
    const activeTrack = tracks.find(t => t.isActive);
    if (!activeTrack) {
      addNewTrack();
      return;
    }

    if (activeTrack.audioUrl) {
      setTrackToDelete(activeTrack.id);
      setShowDeleteConfirm(true);
      return;
    }

    await startRecordingOnTrack();
  };

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
        
        if (backingTrackEnabled && backingTrackRef.current) {
          backingTrackRef.current.currentTime = 0;
          backingTrackRef.current.play().catch(() => {});
        }
        
        recordingInterval.current = setInterval(() => {
          const elapsed = (Date.now() - recordingStartTime.current) / 1000;
          setCurrentTime(elapsed);
          setDuration(elapsed);
        }, 100);
      }
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const handleDeleteAndRecord = async () => {
    if (trackToDelete) {
      setTracks(prev => prev.map(t => 
        t.id === trackToDelete 
          ? { ...t, audioUrl: undefined, audioBlob: undefined, waveformHeights: [] } 
          : t
      ));
      trackAudioRefs.current.delete(trackToDelete);
    }
    setShowDeleteConfirm(false);
    setTrackToDelete(null);
    setTimeout(() => startRecordingOnTrack(), 100);
  };

  const handleStopRecording = async () => {
    if (!isRecording) return;
    
    try {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
        recordingInterval.current = null;
      }
      
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
        
        const arrayBuffer = await blob.arrayBuffer();
        const newBlob = new Blob([arrayBuffer], { type: blob.type });
        
        setTracks(prev => prev.map(t => {
          if (t.isActive) {
            return {
              ...t,
              isRecording: false,
              waveformHeights: waveform,
              audioBlob: newBlob,
              localStored: false
            };
          }
          return { ...t, isRecording: false };
        }));
        
        if (activeTrackId) {
          await saveRecordingLocally(activeTrackId, newBlob);
        }
        
        setDuration(recordingDuration);
        
        if (activeTrackId) {
          const blobUrl = URL.createObjectURL(newBlob);
          const audio = new Audio(blobUrl);
          audio.crossOrigin = 'anonymous';
          audio.currentTime = 0;
          
          trackAudioRefs.current.set(activeTrackId, audio);
          playbackAudioRef.current = audio;
          
          audio.onloadedmetadata = () => {
            audio.currentTime = 0;
            audio.play().catch(() => {});
            setIsPlaying(true);
          };
          
          audio.onended = () => {
            setIsPlaying(false);
            setCurrentTime(0);
            if (!hasFirstRecording && !isExistingProject) {
              setHasFirstRecording(true);
              setJustRecordedFirstTake(true);
              setShowNextActionPrompt(true);
            }
          };
          
          audio.ontimeupdate = () => {
            setCurrentTime(audio.currentTime);
          };
          
          audio.load();
        }
        
        if (!hasFirstRecording && !isExistingProject) {
          setTimeout(() => {
            setJustRecordedFirstTake(true);
            setShowNextActionPrompt(true);
          }, 1500);
        }
        
        const activeTrack = tracks.find(t => t.isActive);
        if (activeTrack && currentProject) {
          uploadRecordingToCloud(newBlob, activeTrack.id);
        }
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setIsRecording(false);
      setTracks(prev => prev.map(t => ({ ...t, isRecording: false })));
    }
  };

  const saveRecordingLocally = async (trackId: string, blob: Blob) => {
    try {
      const arrayBuffer = await blob.arrayBuffer();
      
      const recordingData = {
        data: arrayBuffer,
        timestamp: Date.now(),
        type: blob.type
      };
      
      localStorage.setItem(`audiolab_recording_${trackId}`, JSON.stringify({
        data: Array.from(new Uint8Array(arrayBuffer)),
        timestamp: recordingData.timestamp,
        type: recordingData.type
      }));
      
      setTracks(prev => prev.map(t => 
        t.id === trackId ? { ...t, localStored: true } : t
      ));
    } catch (error) {
      console.error('Failed to save recording locally:', error);
    }
  };

  const getRecordingFromLocal = async (trackId: string): Promise<Blob | null> => {
    try {
      const stored = localStorage.getItem(`audiolab_recording_${trackId}`);
      if (stored) {
        const recordingData = JSON.parse(stored);
        const blob = new Blob([new Uint8Array(recordingData.data)], { type: recordingData.type });
        return blob;
      }
      return null;
    } catch (error) {
      console.error('Failed to retrieve recording:', error);
      return null;
    }
  };

  const removeRecordingFromLocal = (trackId: string) => {
    try {
      localStorage.removeItem(`audiolab_recording_${trackId}`);
    } catch (error) {
      console.error('Failed to remove recording:', error);
    }
  };

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
        const oldAudio = trackAudioRefs.current.get(trackId);
        if (oldAudio?.src?.startsWith('blob:')) {
          URL.revokeObjectURL(oldAudio.src);
        }
        
        setTracks(prev => prev.map(t => 
          t.id === trackId ? { ...t, audioUrl: result.url, audioBlob: undefined } : t
        ));
        
        const audio = new Audio(result.url);
        audio.crossOrigin = 'anonymous';
        audio.preload = 'auto';
        trackAudioRefs.current.set(trackId, audio);
        audio.load();
        
        removeRecordingFromLocal(trackId);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
      setUploadProgress(100);
    }
  };

  const uploadAllRecordingsToCloud = async () => {
    if (!currentProject) return;
    
    const tracksToUpload = tracks.filter(t => t.audioBlob && !t.audioUrl);
    
    if (tracksToUpload.length === 0) return;
    
    setIsUploading(true);
    
    try {
      for (const track of tracksToUpload) {
        await uploadRecordingToCloud(track.audioBlob!, track.id);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
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

  const handlePlayPause = async () => {
    console.log('[StudioView] handlePlayPause called, isPlaying:', isPlaying);
    
    if (isPlaying) {
      trackAudioRefs.current.forEach(audio => audio.pause());
      if (playbackAudioRef.current) {
        playbackAudioRef.current.pause();
      }
      if (playbackIntervalRef.current) {
        cancelAnimationFrame(playbackIntervalRef.current);
        playbackIntervalRef.current = null;
      }
      setIsPlaying(false);
      return;
    }
    
    const tracksWithAudio = tracks.filter(t => t.audioBlob || t.audioUrl);
    
    if (tracksWithAudio.length === 0) {
      return;
    }
    
    for (const track of tracksWithAudio) {
      let audio = trackAudioRefs.current.get(track.id);
      
      let sourceUrl: string | undefined;
      let isNewBlobUrl = false;
      
      if (track.audioBlob) {
        if (audio?.src?.startsWith('blob:')) {
          URL.revokeObjectURL(audio.src);
        }
        sourceUrl = URL.createObjectURL(track.audioBlob);
        isNewBlobUrl = true;
      } else if (!track.audioUrl && track.localStored) {
        try {
          const localBlob = await getRecordingFromLocal(track.id);
          if (localBlob) {
            if (audio?.src?.startsWith('blob:')) {
              URL.revokeObjectURL(audio.src);
            }
            sourceUrl = URL.createObjectURL(localBlob);
            isNewBlobUrl = true;
            
            setTracks(prev => prev.map(t => {
              if (t.id === track.id) {
                const newLocalBlob = new Blob([localBlob], { type: localBlob.type });
                return { ...t, audioBlob: newLocalBlob };
              }
              return t;
            }));
          }
        } catch (error) {
          console.error('Error retrieving local recording:', error);
        }
      } else if (track.audioUrl) {
        const isCloudUrl = track.audioUrl.includes('cloudinary') || 
                          track.audioUrl.includes('res.cloudinary') ||
                          (track.audioUrl.startsWith('https://') && !track.audioUrl.startsWith('blob:'));
        
        if (isCloudUrl) {
          sourceUrl = track.audioUrl;
        } else {
          continue;
        }
      } else {
        continue;
      }
      
      if (!sourceUrl) continue;
      
      if (!audio || isNewBlobUrl || audio.src !== sourceUrl) {
        audio = new Audio();
        audio.crossOrigin = 'anonymous';
        audio.src = sourceUrl;
        trackAudioRefs.current.set(track.id, audio);
        audio.load();
      }
    }
    
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
    
    await trackEffectsEngine.initialize();
    
    let maxDuration = duration;
    const soloTracks = tracks.filter(t => t.solo && (t.audioBlob || t.audioUrl));
    
    for (const track of tracksWithAudio) {
      const audio = trackAudioRefs.current.get(track.id);
      if (audio && audio.src) {
        // Wait for metadata to load to get accurate duration
        if (audio.readyState < 1) { // HAVE_METADATA
          try {
            await new Promise<void>((resolve) => {
              const onLoadedMetadataForDuration = () => {
                audio.removeEventListener('loadedmetadata', onLoadedMetadataForDuration);
                audio.removeEventListener('error', onErrorForDuration);
                resolve();
              };
              const onErrorForDuration = () => {
                audio.removeEventListener('loadedmetadata', onLoadedMetadataForDuration);
                audio.removeEventListener('error', onErrorForDuration);
                resolve(); // Resolve even on error to continue
              };
              audio.addEventListener('loadedmetadata', onLoadedMetadataForDuration);
              audio.addEventListener('error', onErrorForDuration);
              audio.load(); // Trigger loading if not already started
              
              // Timeout after 3 seconds to prevent hanging
              setTimeout(() => {
                audio.removeEventListener('loadedmetadata', onLoadedMetadataForDuration);
                audio.removeEventListener('error', onErrorForDuration);
                resolve();
              }, 3000);
            });
          } catch (e) {
            console.error('Error loading metadata:', e);
          }
        }
        
        if (track.effects) {
          const existingNodes = trackEffectsEngine.createTrackChain(track.id, audio);
          if (existingNodes) {
            const effectsToApply = { ...track.effects };
            if (track.muted) {
              effectsToApply.volume = 0;
            } else if (soloTracks.length > 0) {
              effectsToApply.volume = track.solo ? track.volume : 0;
            }
            trackEffectsEngine.applyEffects(track.id, effectsToApply);
            audio.volume = 1;
          } else {
            if (soloTracks.length > 0) {
              audio.volume = track.solo ? (track.volume / 100) : 0;
            } else {
              audio.volume = track.muted ? 0 : track.volume / 100;
            }
          }
        } else {
          if (soloTracks.length > 0) {
            audio.volume = track.solo ? (track.volume / 100) : 0;
          } else {
            audio.volume = track.muted ? 0 : track.volume / 100;
          }
        }
        
        if (currentTime > 0 && audio.duration && currentTime < audio.duration) {
          audio.currentTime = currentTime;
        } else {
          audio.currentTime = 0;
        }
        
        // Update maxDuration after metadata is loaded
        if (audio.duration && isFinite(audio.duration) && audio.duration > maxDuration) {
          maxDuration = audio.duration;
        }
      }
    }
    
    if (maxDuration > duration) {
      setDuration(maxDuration);
    }
    
    let anyPlaying = false;
    for (const track of tracksWithAudio) {
      const audio = trackAudioRefs.current.get(track.id);
      if (audio && audio.src) {
        try {
          await audio.play();
          anyPlaying = true;
        } catch (e) {
          console.error('Playback error:', e);
        }
      }
    }
    
    if (anyPlaying || accompanimentTracks.length > 0) {
      setIsPlaying(true);
      
      // Cancel any existing animation frame to prevent multiple loops
      if (playbackIntervalRef.current) {
        cancelAnimationFrame(playbackIntervalRef.current);
      }
      
      const updateTime = () => {
        if (!isPlaying) return;
        
        // Calculate time based on all playing tracks
        let currentTimeValue = 0;
        let hasPlayingTracks = false;
        
        for (const [id, audio] of trackAudioRefs.current) {
          if (audio.paused) continue;
          
          const trackTime = audio.currentTime;
          currentTimeValue = Math.max(currentTimeValue, trackTime);
          hasPlayingTracks = true;
          
          // Check if any track has ended
          if (audio.ended) {
            handleStop();
            return;
          }
        }
        
        // Also check playbackAudioRef if it exists
        if (playbackAudioRef.current && !playbackAudioRef.current.paused) {
          const playbackTime = playbackAudioRef.current.currentTime;
          currentTimeValue = Math.max(currentTimeValue, playbackTime);
          hasPlayingTracks = true;
          
          if (playbackAudioRef.current.ended) {
            handleStop();
            return;
          }
        }
        
        // Check if we should stop based on duration
        if (currentTimeValue >= duration && duration > 0) {
          handleStop();
          return;
        }
        
        if (hasPlayingTracks || accompanimentTracks.length > 0) {
          // Always update the time to ensure the UI updates
          setCurrentTime(currentTimeValue);
          playbackIntervalRef.current = requestAnimationFrame(updateTime);
        } else {
          handleStop();
        }
      };
      
      playbackIntervalRef.current = requestAnimationFrame(updateTime);
    }
  };

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
    trackAudioRefs.current.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    if (playbackIntervalRef.current) {
      cancelAnimationFrame(playbackIntervalRef.current);
      playbackIntervalRef.current = null;
    }
    setIsPlaying(false);
    setCurrentTime(0);
    
    // Also stop accompaniment
    if (isAccompanimentPlaying) {
      accompanimentEngine.stopAccompaniment();
      setIsAccompanimentPlaying(false);
    }
  };

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
    setIsSaving(true);
    
    try {
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
            await saveProject();
          }
        } catch (error) {
          console.error('Failed to create project:', error);
        }
      } else {
        await saveProject();
      }
      
      await uploadAllRecordingsToCloud();
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const hasRecordings = tracks.some(t => t.audioUrl || t.audioBlob || t.waveformHeights.length > 0);

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
        
        tracks.forEach(track => {
          if (track.audioUrl && track.localStored) {
            removeRecordingFromLocal(track.id);
          }
        });
        
        await uploadAllRecordingsToCloud();
      } else {
        setSaveError('Failed to save');
      }
    } catch (error) {
      setSaveError('Failed to save');
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  }, [currentProject, user?.uid, tracks, duration, uploadAllRecordingsToCloud]);

  const shouldSaveRef = useRef(false);
  const lastSaveTimeRef = useRef(0);
  
  useEffect(() => {
    if (!isUploading && hasRecordings && currentProject && !isRecording && autoSaveEnabled) {
      const now = Date.now();
      if (now - lastSaveTimeRef.current > 5000) {
        shouldSaveRef.current = true;
        lastSaveTimeRef.current = now;
      }
    }
  }, [isUploading, hasRecordings, isRecording, autoSaveEnabled]);

  useEffect(() => {
    if (shouldSaveRef.current && currentProject) {
      shouldSaveRef.current = false;
      const timeout = setTimeout(() => {
        saveProject();
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [currentProject?.id]);

  const processedAudioUrlsRef = useRef<Set<string>>(new Set());
  
  useEffect(() => {
    const loadTrackDurations = async () => {
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
          console.error('Failed to load track duration:', e);
        }
      }
      
      if (maxDuration > 0) {
        setDuration(prev => Math.max(prev, maxDuration));
      }
    };
    
    loadTrackDurations();
  }, [tracks]);

  const formatLastSaved = () => {
    if (!lastSaved) return null;
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000);
    if (diff < 60) return 'Saved just now';
    if (diff < 3600) return `Saved ${Math.floor(diff / 60)}m ago`;
    return `Saved ${Math.floor(diff / 3600)}h ago`;
  };

  const hasUnsavedChanges = () => {
    const hasUnuploadedRecordings = tracks.some(t => t.audioBlob && !t.audioUrl);
    const hasLocalRecordings = tracks.some(t => t.waveformHeights.length > 0 && !t.audioUrl && !t.localStored);
    const projectExistsButNotSaved = currentProject && tracks.length > 0 && currentProject.tracks.length === 0;
    
    return hasUnuploadedRecordings || hasLocalRecordings || projectExistsButNotSaved;
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = 'You have unsaved recordings. Are you sure you want to leave?';
        return 'You have unsaved recordings. Are you sure you want to leave?';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [tracks, currentProject]);

  const handleBackClick = () => {
    if (hasUnsavedChanges()) {
      const confirmLeave = window.confirm('You have unsaved recordings. Save before leaving?');
      if (confirmLeave) {
        handleSave();
        setTimeout(() => {
          setView('home');
        }, 1000);
      } else {
        setView('home');
      }
    } else {
      setView('home');
    }
  };

  useEffect(() => {
    return () => {
      trackAudioRefs.current.forEach(audio => {
        if (audio?.src?.startsWith('blob:')) {
          URL.revokeObjectURL(audio.src);
        }
      });
      trackAudioRefs.current.clear();
      if (playbackIntervalRef.current) {
        if (typeof playbackIntervalRef.current === "number") {
          cancelAnimationFrame(playbackIntervalRef.current);
        } else {
          clearInterval(playbackIntervalRef.current);
        }
        playbackIntervalRef.current = null;
      }
      
      if (backingTrackRef.current) {
        if (backingTrackRef.current.src.startsWith('blob:')) {
          URL.revokeObjectURL(backingTrackRef.current.src);
        }
        backingTrackRef.current.pause();
        backingTrackRef.current = null;
      }
      
      if (metronomeIntervalRef.current) {
        clearInterval(metronomeIntervalRef.current);
      }
      if (metronomeAudioRef.current) {
        metronomeAudioRef.current.close();
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-b from-[#0f0f14] via-[#0d0d12] to-[#08080c]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(139,92,246,0.03)_0%,_transparent_50%)] pointer-events-none" />
      
      {/* Header with AudioLab navigation */}
      <div 
        className="absolute top-0 left-0 right-0 z-[110] flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 bg-[#131318]/95 backdrop-blur-sm border-b border-white/5"
        style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 12px)' }}
      >
        <button 
          onClick={handleBackClick}
          className="flex items-center justify-center w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-slate-600 hover:bg-slate-500 active:bg-slate-400 transition-colors touch-manipulation"
        >
          <ChevronLeft size={14} className="sm:w-[18px] sm:h-[18px] text-white" />
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-xs sm:text-base font-semibold text-white tracking-tight">
            {currentProject?.name || 'New Recording'}
          </h2>
          {isRecording ? (
            <span className="text-[10px] sm:text-[10px] text-red-400 font-medium flex items-center gap-1 mt-0.5">
              <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
              Recording
            </span>
          ) : isSaving ? (
            <span className="text-[10px] sm:text-[10px] text-blue-400 font-medium flex items-center gap-1 mt-0.5">
              <Loader2 size={10} className="sm:w-[10px] sm:h-[10px] animate-spin" />
              Saving...
            </span>
          ) : saveError ? (
            <span className="text-[10px] sm:text-[10px] text-red-400 font-medium mt-0.5">
              {saveError}
            </span>
          ) : lastSaved ? (
            <span className="text-[10px] sm:text-[10px] text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
              <Check size={10} className="sm:w-[10px] sm:h-[10px]" />
              {formatLastSaved()}
            </span>
          ) : currentProject ? (
            <button 
              onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
              className={`text-[10px] sm:text-[10px] font-medium mt-0.5 flex items-center gap-1 px-1 -mx-1 rounded ${autoSaveEnabled ? 'text-emerald-400' : 'text-slate-500'} touch-manipulation`}
            >
              {autoSaveEnabled ? 'Auto-save: On' : 'Auto-save: Off'}
            </button>
          ) : null}
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          {hasRecordings && (
            <button 
              onClick={uploadAllRecordingsToCloud}
              disabled={isUploading || !tracks.some(t => t.audioBlob && !t.audioUrl)}
              className="flex items-center justify-center w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-400 transition-colors disabled:opacity-50 disabled:bg-slate-600 touch-manipulation"
              title="Upload recordings to cloud"
            >
              {isUploading ? <Loader2 size={14} className="sm:w-[18px] sm:h-[18px] text-white animate-spin" /> : <Upload size={14} className="sm:w-[18px] sm:h-[18px] text-white" />}
            </button>
          )}
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center justify-center w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-slate-600 hover:bg-slate-500 active:bg-slate-400 transition-colors disabled:opacity-50 touch-manipulation"
          >
            {isSaving ? <Loader2 size={14} className="sm:w-[18px] sm:h-[18px] text-white animate-spin" /> : <Save size={14} className="sm:w-[18px] sm:h-[18px] text-white" />}
          </button>
          <button 
            onClick={() => setShowSettings(true)}
            className="flex items-center justify-center w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-slate-600 hover:bg-slate-500 active:bg-slate-400 transition-colors touch-manipulation"
          >
            <Settings size={14} className="sm:w-[18px] sm:h-[18px] text-white" />
          </button>
        </div>
      </div>

      <main className="absolute top-[60px] sm:top-[72px] left-0 right-0 bottom-0 overflow-y-auto overflow-x-hidden pb-40 sm:pb-48" style={{ top: 'calc(60px + env(safe-area-inset-top, 0px))', paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 40px)' }}>
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
            {(justRecordedFirstTake || isUploading) && (
              <div className="px-3 sm:px-4 pt-2 sm:pt-3">
                {justRecordedFirstTake && !isRecording && !isUploading && (
                  <div className="flex items-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 px-3 sm:px-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                    <Check size={14} className="sm:w-4 sm:h-4 text-emerald-400" />
                    <span className="text-emerald-400 text-xs sm:text-sm font-medium">First take recorded</span>
                  </div>
                )}
                {isUploading && (
                  <div className="flex items-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 px-3 sm:px-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <Loader2 size={14} className="sm:w-4 sm:h-4 text-blue-400 animate-spin" />
                    <span className="text-blue-400 text-xs sm:text-sm font-medium">Saving to cloud...</span>
                  </div>
                )}
              </div>
            )}

            {!hasRecordings && !isRecording && (
              <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 sm:px-6">
                <div className="size-16 sm:size-20 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 flex items-center justify-center mb-4 sm:mb-5">
                  <Mic size={28} className="sm:w-8 sm:h-8 text-slate-400" />
                </div>
                <h3 className="text-white text-base sm:text-lg font-semibold mb-1">Ready to Record</h3>
                <p className="text-slate-500 text-xs sm:text-sm text-center max-w-[240px]">
                  Press the record button below to capture your first take
                </p>
              </div>
            )}

            {backingTrack && (
              <div className="px-3 sm:px-4 pt-3 sm:pt-4">
                <div className="p-2.5 sm:p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div 
                      className="size-8 sm:size-10 rounded-lg bg-cover bg-center bg-slate-800 shrink-0"
                      style={{ backgroundImage: backingTrack.albumArt ? `url('${backingTrack.albumArt}')` : 'none' }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] sm:text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Backing Track</p>
                      <p className="text-white text-xs sm:text-sm font-medium truncate">{backingTrack.title}</p>
                    </div>
                    <button
                      onClick={() => setBackingTrackEnabled(!backingTrackEnabled)}
                      className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-semibold transition-all min-h-[32px] sm:min-h-0 touch-manipulation ${
                        backingTrackEnabled 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700 active:bg-slate-600'
                      }`}
                    >
                      {backingTrackEnabled ? 'ON' : 'OFF'}
                    </button>
                  </div>
                  {backingTrackEnabled && (
                    <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-slate-800">
                      <span className="text-[9px] sm:text-[10px] text-slate-500 font-medium uppercase">Volume</span>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={backingTrackVolume}
                        onChange={(e) => setBackingTrackVolume(parseInt(e.target.value))}
                        className="flex-1 h-1 sm:h-1 bg-slate-700 rounded-full appearance-none cursor-pointer accent-emerald-500 touch-manipulation"
                        style={{ minHeight: '32px' }}
                      />
                      <span className="text-[10px] sm:text-xs text-slate-400 font-mono w-7 sm:w-8">{backingTrackVolume}%</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {(hasRecordings || tracks.length > 0) && (
              <div className="px-3 sm:px-4 pt-3 sm:pt-4">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <h3 className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Tracks</h3>
                  {hasRecordings && (
                    <button 
                      onClick={addNewTrack}
                      className="flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1 rounded-md text-[10px] sm:text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 active:bg-slate-700 transition-colors min-h-[32px] sm:min-h-0 touch-manipulation"
                    >
                      <PlusCircle size={12} className="sm:w-[14px] sm:h-[14px]" />
                      <span className="hidden xs:inline">Add Layer</span>
                      <span className="xs:hidden">Add</span>
                    </button>
                  )}
                </div>

                {hasRecordings && duration > 0 && (
                  <div className="mb-2 sm:mb-3 relative h-4 sm:h-5 border-b border-slate-800">
                    {Array.from({ length: Math.ceil(duration / 5) + 1 }, (_, i) => i * 5).map((sec) => (
                      <div 
                        key={sec}
                        className="absolute bottom-0 flex flex-col items-center"
                        style={{ left: `${(sec / duration) * 100}%` }}
                      >
                        <span className="text-[8px] sm:text-[9px] text-slate-600 font-mono">{formatTime(sec)}</span>
                        <div className="w-px h-1 sm:h-1.5 bg-slate-700 mt-0.5" />
                      </div>
                    ))}
                    <div 
                      className="absolute bottom-0 w-0.5 h-full bg-red-500 transition-all z-10"
                      style={{ left: `${(currentTime / duration) * 100}%` }}
                    />
                  </div>
                )}

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
                        <div className="flex items-center gap-1.5 sm:gap-2.5 px-2 sm:px-3 py-1.5 sm:py-2.5">
                          <div className={`relative flex items-center justify-center shrink-0 size-7 sm:size-9 rounded-lg transition-all ${
                            track.isActive 
                              ? 'bg-slate-700 text-white' 
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            <Icon size={14} className="sm:w-[18px] sm:h-[18px]" />
                            {track.isRecording && (
                              <span className="absolute -top-0.5 -right-0.5 size-2 sm:size-2.5 rounded-full bg-red-500 animate-pulse" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 sm:gap-1.5">
                              {editingTrackId === track.id ? (
                                <input
                                  type="text"
                                  value={editingTrackName}
                                  onChange={(e) => setEditingTrackName(e.target.value)}
                                  onBlur={saveTrackName}
                                  onKeyDown={(e) => e.key === 'Enter' && saveTrackName()}
                                  autoFocus
                                  className="text-xs sm:text-sm font-medium bg-transparent border-b border-white outline-none text-white w-20 sm:w-24"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEditingTrackName(track.id, track.name);
                                  }}
                                  className="text-xs sm:text-sm font-medium text-white truncate hover:text-slate-300 flex items-center gap-0.5 sm:gap-1 group"
                                >
                                  {track.name}
                                  <Pencil size={9} className="sm:w-[10px] sm:h-[10px] opacity-0 group-hover:opacity-50 transition-opacity" />
                                </button>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                              <div className="relative flex-1 max-w-14 sm:max-w-16 h-1 sm:h-1 bg-slate-700 rounded-full overflow-hidden">
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
                                    const newVolume = parseInt(e.target.value);
                                    setTracks(prevTracks => {
                                      const updatedTracks = prevTracks.map(t => 
                                        t.id === track.id ? { ...t, volume: newVolume } : t
                                      );
                                      
                                      // Update the audio element volume immediately
                                      const audio = trackAudioRefs.current.get(track.id);
                                      if (audio) {
                                        const updatedTrack = updatedTracks.find(t => t.id === track.id);
                                        if (updatedTrack) {
                                          const soloTracks = updatedTracks.filter(t => t.solo && (t.audioBlob || t.audioUrl));
                                          if (soloTracks.length > 0) {
                                            audio.volume = updatedTrack.solo ? updatedTrack.volume / 100 : 0;
                                          } else {
                                            audio.volume = updatedTrack.muted ? 0 : updatedTrack.volume / 100;
                                          }
                                        }
                                      }
                                      
                                      return updatedTracks;
                                    });
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                              </div>
                              <span className="text-[9px] sm:text-[10px] font-mono text-slate-500 w-5 sm:w-6">{track.volume}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-0.5 sm:gap-1">
                            {(track.audioUrl || track.audioBlob) && (
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
                                className={`size-6 sm:size-7 flex items-center justify-center rounded-lg text-xs font-bold transition-colors touch-manipulation ${
                                  isPlaying && track.isActive
                                    ? 'bg-emerald-500 text-white' 
                                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600 active:bg-slate-500'
                                }`}
                              >
                                {isPlaying && track.isActive ? <Pause size={10} className="sm:w-3 sm:h-3" /> : <Play size={10} className="sm:w-3 sm:h-3" />}
                              </button>
                            )}
                            <button 
                              onClick={(e) => { e.stopPropagation(); toggleMute(track.id); }}
                              className={`size-5 sm:size-6 flex items-center justify-center rounded-lg text-[7px] sm:text-[7px] font-bold transition-colors touch-manipulation ${
                                track.muted 
                                  ? 'bg-orange-500 text-white' 
                                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600 active:bg-slate-500'
                              }`}
                            >
                              M
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); toggleSolo(track.id); }}
                              className={`size-5 sm:size-6 flex items-center justify-center rounded-lg text-[7px] sm:text-[7px] font-bold transition-colors touch-manipulation ${
                                track.solo 
                                  ? 'bg-yellow-500 text-black' 
                                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600 active:bg-slate-500'
                              }`}
                            >
                              S
                            </button>
                            {tracks.length > 1 && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); deleteTrack(track.id); }}
                                className="size-5 sm:size-7 flex items-center justify-center rounded-lg bg-slate-700 text-slate-400 hover:text-red-400 hover:bg-slate-600 active:bg-slate-500 transition-colors touch-manipulation"
                              >
                                <Trash2 size={10} className="sm:w-3 sm:h-3" />
                              </button>
                            )}
                            {(track.audioUrl || track.audioBlob) && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); openEffectsPanel(track.id); }}
                                className="size-5 sm:size-7 flex items-center justify-center rounded-lg bg-slate-700 text-slate-400 hover:text-violet-400 hover:bg-slate-600 active:bg-slate-500 transition-colors touch-manipulation"
                                title="Effects"
                              >
                                <Sliders size={10} className="sm:w-3 sm:h-3" />
                              </button>
                            )}
                          </div>
                        </div>

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
                            if (track.audioUrl || track.audioBlob) handlePlayPause();
                          }}
                          className={`w-full bg-[#0f0f12] relative overflow-hidden touch-manipulation ${
                            track.isActive ? 'h-14 sm:h-16' : 'h-10 sm:h-12'
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
                              height={track.isActive ? 56 : 48}
                              className={`h-full ${!track.isActive ? 'opacity-60' : ''}`}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {hasRecordings && (
              <div className="px-3 sm:px-4 pt-4 sm:pt-6 pb-3 sm:pb-4">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Sparkles size={12} className="sm:w-[14px] sm:h-[14px] text-slate-500" />
                    <h3 className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">AI Accompaniment</h3>
                    {detectedKey && (
                      <span className="text-[9px] sm:text-[10px] bg-[#1e1e24] text-slate-400 px-1.5 sm:px-2 py-0.5 rounded font-mono">
                        {detectedKey.key} {detectedKey.mode}
                      </span>
                    )}
                  </div>
                </div>

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

                {accompanimentTracks.length > 0 && (
                  <div className="space-y-2">
                    {accompanimentTracks.map((aTrack) => (
                      <div 
                        key={aTrack.id}
                        className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl bg-[#1e1e24]"
                      >
                        <div className="size-7 sm:size-9 rounded-lg flex items-center justify-center bg-slate-700 text-slate-300">
                          {aTrack.type === 'piano' ? <Piano size={14} className="sm:w-[18px] sm:h-[18px]" /> : <Guitar size={14} className="sm:w-[18px] sm:h-[18px]" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-white capitalize">{aTrack.type}</p>
                          <p className="text-[10px] sm:text-xs text-slate-500 truncate">
                            {aTrack.key} {aTrack.mode} • {aTrack.pattern}
                          </p>
                        </div>
                        <div className="flex items-center gap-0.5 sm:gap-1">
                          <button
                            onClick={toggleAccompanimentPlayback}
                            className={`size-5 sm:size-6 flex items-center justify-center rounded-lg transition-colors touch-manipulation ${
                              isAccompanimentPlaying 
                                ? 'bg-emerald-500 text-white' 
                                : 'bg-slate-700 text-slate-400 hover:bg-slate-600 active:bg-slate-500'
                            }`}
                          >
                            {isAccompanimentPlaying ? <Pause size={9} className="sm:w-[10px] sm:h-[10px]" /> : <Play size={9} className="sm:w-[10px] sm:h-[10px]" />}
                          </button>
                          <button
                            onClick={() => addAccompanimentToProject(aTrack)}
                            disabled={isAddingAccompanimentToProject}
                            className="size-5 sm:size-6 flex items-center justify-center rounded-lg bg-slate-700 text-slate-400 hover:bg-slate-600 active:bg-slate-500 transition-colors disabled:opacity-50 touch-manipulation"
                            title="Add"
                          >
                            {isAddingAccompanimentToProject ? <Loader2 size={7} className="sm:w-2 sm:h-2 animate-spin" /> : <Download size={9} className="sm:w-[10px] sm:h-[10px]" />}
                          </button>
                          <button
                            onClick={() => regenerateAccompaniment(aTrack.type)}
                            className="size-5 sm:size-6 flex items-center justify-center rounded-lg bg-slate-700 text-slate-400 hover:bg-slate-600 active:bg-slate-500 transition-colors touch-manipulation"
                          >
                            <RefreshCw size={9} className="sm:w-[10px] sm:h-[10px]" />
                          </button>
                          <button
                            onClick={() => deleteAccompanimentTrack(aTrack.id)}
                            className="size-5 sm:size-6 flex items-center justify-center rounded-lg bg-slate-700 text-slate-400 hover:text-red-400 hover:bg-slate-600 active:bg-slate-500 transition-colors touch-manipulation"
                          >
                            <Trash2 size={9} className="sm:w-[10px] sm:h-[10px]" />
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

      <div className="absolute bottom-0 left-0 right-0 z-[110] bg-[#131318]/95 backdrop-blur-xl border-t border-white/5">
        <div className="px-4 pt-4 pb-6" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 24px)' }}>
          <div className="flex justify-between items-center mb-5">
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
            
            <div className="flex items-center gap-3">
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

          <div className="flex items-center justify-center gap-1 sm:gap-2">
            <button 
              onClick={() => setCurrentTime(0)}
              className="flex items-center justify-center min-w-[36px] min-h-[36px] sm:w-10 sm:h-10 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all touch-manipulation"
            >
              <SkipBack size={14} className="sm:w-4 sm:h-4" />
            </button>
            
            <button 
              onClick={handlePlayPause}
              disabled={isRecording || !hasRecordings}
              className={`flex items-center justify-center min-w-[44px] min-h-[44px] sm:w-12 sm:h-12 rounded-xl transition-all active:scale-95 touch-manipulation ${
                isRecording || !hasRecordings
                  ? 'bg-white/5 border border-white/5 text-slate-600 cursor-not-allowed'
                  : isPlaying
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                    : 'bg-white/10 border border-white/10 text-white hover:bg-white/15'
              }`}
            >
              {isPlaying ? <Pause size={18} className="sm:w-5 sm:h-5" /> : <Play size={18} className="sm:w-5 sm:h-5 ml-0.5 sm:ml-1" fill="currentColor" />}
            </button>
            
            <button 
              onClick={handleRecordToggle}
              className={`relative flex items-center justify-center w-[52px] h-[52px] sm:w-[60px] sm:h-[60px] rounded-full transition-all duration-200 active:scale-95 touch-manipulation ${
                isRecording 
                  ? 'bg-gradient-to-b from-red-500 to-red-600 shadow-[0_0_24px_rgba(239,68,68,0.4)]' 
                  : 'bg-gradient-to-b from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 shadow-lg shadow-red-500/20'
              }`}
            >
              <div className={`absolute inset-0 rounded-full border-2 ${isRecording ? 'border-red-400/50' : 'border-red-400/30'}`} />
              
              {isRecording && (
                <div className="absolute inset-[-4px] rounded-full animate-ping bg-red-500/20" />
              )}
              
              <div className="relative z-10">
                {isRecording ? (
                  <Square size={16} className="sm:w-5 sm:h-5 text-white" fill="currentColor" />
                ) : (
                  <Circle size={22} className="sm:w-[26px] sm:h-[26px] text-white" fill="currentColor" />
                )}
              </div>
            </button>
            
            <button 
              onClick={handleStop}
              className="flex items-center justify-center min-w-[44px] min-h-[44px] sm:w-12 sm:h-12 rounded-xl bg-white/10 border border-white/10 text-white hover:bg-white/15 active:scale-95 transition-all touch-manipulation"
            >
              <Square size={16} className="sm:w-[18px] sm:h-[18px]" fill="currentColor" />
            </button>
            
            <button className="flex items-center justify-center min-w-[36px] min-h-[36px] sm:w-10 sm:h-10 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 active:scale-95 transition-all touch-manipulation">
              <AudioLines size={14} className="sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>

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

      <NextActionPrompt
        isOpen={showNextActionPrompt}
        onClose={() => setShowNextActionPrompt(false)}
        onAddLayer={handleAddLayer}
        onPractice={handlePractice}
        onSave={handleSave}
      />

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