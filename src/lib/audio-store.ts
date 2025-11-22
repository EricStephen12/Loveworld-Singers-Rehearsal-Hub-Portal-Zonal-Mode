import { create } from 'zustand';

export interface Track {
  id: string;
  name: string;
  audioBuffer: AudioBuffer | null;
  audioUrl: string;
  volume: number;
  effects: Effect[];
  startTime: number;
  duration: number;
  muted: boolean;
  solo: boolean;
}

export interface Effect {
  id: string;
  type: 'reverb' | 'eq' | 'compression' | 'delay' | 'distortion';
  params: Record<string, number>;
  enabled: boolean;
}

interface AudioState {
  tracks: Track[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isRecording: boolean;
  recordingTrack: string | null;
  soloedTracks: string[];

  addTrack: (file: File, name: string) => Promise<void>;
  removeTrack: (id: string) => void;
  updateTrack: (id: string, updates: Partial<Track>) => void;
  play: () => void;
  pause: () => void;
  stop: () => void;
  setCurrentTime: (time: number) => void;
  seekTo: (time: number) => void;
  setVolume: (trackId: string, volume: number) => void;
  addEffect: (trackId: string, effect: Effect) => void;
  removeEffect: (trackId: string, effectId: string) => void;
  toggleMute: (trackId: string) => void;
  toggleSolo: (trackId: string) => void;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  exportMix: () => Promise<Blob>;
  clearAll: () => void;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  tracks: [],
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  isRecording: false,
  recordingTrack: null,
  soloedTracks: [],

  addTrack: async (file: File, name: string) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const track: Track = {
        id: `track_${Date.now()}`,
        name,
        audioBuffer,
        audioUrl: URL.createObjectURL(file),
        volume: 1.0,
        effects: [],
        startTime: 0,
        duration: audioBuffer.duration,
        muted: false,
        solo: false,
      };

      set((state) => ({
        tracks: [...state.tracks, track],
        duration: Math.max(state.duration, audioBuffer.duration),
      }));
    } catch (error) {
      console.error('Error adding track:', error);
    }
  },

  removeTrack: (id: string) => {
    set((state) => ({
      tracks: state.tracks.filter((track) => track.id !== id),
    }));
  },

  updateTrack: (id: string, updates: Partial<Track>) => {
    set((state) => ({
      tracks: state.tracks.map((track) =>
        track.id === id ? { ...track, ...updates } : track
      ),
    }));
  },

  play: () => {
    const state = get();
    console.log('🎵 Store play called with tracks:', state.tracks.length);

    if (state.tracks.length === 0) {
      console.log('❌ No tracks to play');
      return;
    }

    set({ isPlaying: true });

    // Play all non-muted tracks using HTML5 Audio for reliability
    state.tracks.forEach((track, index) => {
      if (!track.muted && track.audioUrl) {
        console.log(`▶️ Playing track ${index + 1}: ${track.name}`);

        // Create or get existing audio element
        const audioId = `audio-${track.id}`;
        let audio = document.getElementById(audioId) as HTMLAudioElement;

        if (!audio) {
          audio = new Audio(track.audioUrl);
          audio.id = audioId;
          audio.volume = track.volume;
          document.body.appendChild(audio);

          // Add progress tracking
          audio.addEventListener('timeupdate', () => {
            const currentState = get();
            if (currentState.isPlaying) {
              set({ currentTime: audio.currentTime });
            }
          });

          // Handle track end
          audio.addEventListener('ended', () => {
            const currentState = get();
            const allAudios = currentState.tracks.map(t =>
              document.getElementById(`audio-${t.id}`) as HTMLAudioElement
            ).filter(Boolean);

            const allEnded = allAudios.every(a => a.ended || a.paused);
            if (allEnded) {
              set({ isPlaying: false, currentTime: 0 });
            }
          });
        }

        audio.currentTime = state.currentTime;
        audio.play().catch(error => {
          console.error(`Failed to play ${track.name}:`, error);
        });
      }
    });
  },

  pause: () => {
    set({ isPlaying: false });

    // Pause all audio elements
    const state = get();
    state.tracks.forEach(track => {
      const audio = document.getElementById(`audio-${track.id}`) as HTMLAudioElement;
      if (audio) {
        audio.pause();
        console.log(`⏸️ Paused track: ${track.name}`);
      }
    });
  },

  stop: () => {
    set({ isPlaying: false, currentTime: 0 });

    // Stop all audio elements
    const state = get();
    state.tracks.forEach(track => {
      const audio = document.getElementById(`audio-${track.id}`) as HTMLAudioElement;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        console.log(`⏹️ Stopped track: ${track.name}`);
      }
    });
  },

  setCurrentTime: (time: number) => {
    set({ currentTime: time });
  },

  setVolume: (trackId: string, volume: number) => {
    set((state) => ({
      tracks: state.tracks.map((track) =>
        track.id === trackId ? { ...track, volume } : track
      ),
    }));

    // Update HTML5 audio volume
    const audio = document.getElementById(`audio-${trackId}`) as HTMLAudioElement;
    if (audio) {
      audio.volume = volume;
      console.log(`🔊 Set volume for track ${trackId}: ${Math.round(volume * 100)}%`);
    }
  },

  addEffect: (trackId: string, effect: Effect) => {
    set((state) => ({
      tracks: state.tracks.map((track) =>
        track.id === trackId
          ? { ...track, effects: [...track.effects, effect] }
          : track
      ),
    }));
  },

  removeEffect: (trackId: string, effectId: string) => {
    set((state) => ({
      tracks: state.tracks.map((track) =>
        track.id === trackId
          ? {
            ...track,
            effects: track.effects.filter((effect) => effect.id !== effectId),
          }
          : track
      ),
    }));
  },

  toggleMute: (trackId: string) => {
    set((state) => ({
      tracks: state.tracks.map((track) =>
        track.id === trackId ? { ...track, muted: !track.muted } : track
      ),
    }));

    // Update HTML5 audio mute
    const audio = document.getElementById(`audio-${trackId}`) as HTMLAudioElement;
    if (audio) {
      const track = get().tracks.find(t => t.id === trackId);
      if (track) {
        audio.muted = track.muted;
        console.log(`🔇 ${track.muted ? 'Muted' : 'Unmuted'} track: ${track.name}`);
      }
    }
  },

  toggleSolo: (trackId: string) => {
    const state = get();
    const isSoloed = state.soloedTracks.includes(trackId);
    
    let newSoloedTracks;
    if (isSoloed) {
      // Remove from solo
      newSoloedTracks = state.soloedTracks.filter(id => id !== trackId);
    } else {
      // Add to solo
      newSoloedTracks = [...state.soloedTracks, trackId];
    }
    
    set({ 
      soloedTracks: newSoloedTracks,
      tracks: state.tracks.map(track => ({
        ...track,
        solo: newSoloedTracks.includes(track.id)
      }))
    });
    
    // If playing, update audio immediately
    if (state.isPlaying) {
      get().play();
    }
    
    console.log(`🎵 ${isSoloed ? 'Unsoloed' : 'Soloed'} track: ${state.tracks.find(t => t.id === trackId)?.name}`);
  },

  exportMix: async () => {
    return new Blob();
  },

  seekTo: (time: number) => {
    set({ currentTime: time });
    
    // Seek all audio elements to the new time
    const state = get();
    state.tracks.forEach(track => {
      const audio = document.getElementById(`audio-${track.id}`) as HTMLAudioElement;
      if (audio) {
        audio.currentTime = time;
      }
    });
  },

  startRecording: async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const file = new File([blob], `Recording_${Date.now()}.wav`, { type: 'audio/wav' });
        
        // Add recorded track
        const { addTrack } = get();
        await addTrack(file, `Recording ${get().tracks.length + 1}`);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        set({ isRecording: false, recordingTrack: null });
      };

      mediaRecorder.start();
      set({ isRecording: true, recordingTrack: 'new_recording' });
      
      // Store recorder reference globally for stopping
      (window as any).currentRecorder = mediaRecorder;
      
    } catch (error) {
      console.error('Recording failed:', error);
      set({ isRecording: false, recordingTrack: null });
    }
  },

  stopRecording: () => {
    const recorder = (window as any).currentRecorder;
    if (recorder && recorder.state === 'recording') {
      recorder.stop();
    }
    set({ isRecording: false, recordingTrack: null });
  },

  clearAll: () => {
    set({
      tracks: [],
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      isRecording: false,
      recordingTrack: null,
      soloedTracks: [],
    });
  },
}));