import * as Tone from 'tone';
import { Track, Effect } from './audio-store';

class AudioEngine {
  private players: Map<string, Tone.Player> = new Map();
  private effects: Map<string, Tone.ToneAudioNode[]> = new Map();
  private masterVolume: Tone.Volume;
  private initialized = false;

  constructor() {
    this.masterVolume = new Tone.Volume(0).toDestination();
  }

  async initialize() {
    if (this.initialized) return;
    
    await Tone.start();
    this.initialized = true;
  }

  async loadTrack(track: Track) {
    if (!track.audioUrl) {
      console.error('No audio URL for track:', track.name);
      return;
    }

    try {
      console.log(`Loading track: ${track.name} from ${track.audioUrl}`);
      
      // Create player from audio URL
      const player = new Tone.Player({
        url: track.audioUrl,
        volume: this.volumeToDb(track.volume),
      });

      // Wait for the player to load
      await Promise.race([
        player.load(track.audioUrl),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Track loading timeout')), 10000))
      ]);
      console.log(`✅ Track ${track.name} loaded successfully`);

      // Connect to master volume
      player.connect(this.masterVolume);
      
      this.players.set(track.id, player);
      this.effects.set(track.id, []);

      // Apply existing effects
      track.effects.forEach(effect => {
        this.addEffect(track.id, effect);
      });

      console.log(`🎵 Track ${track.name} ready for playback`);
    } catch (error) {
      console.error(`💥 Failed to load track ${track.name}:`, error);
    }
  }

  removeTrack(trackId: string) {
    const player = this.players.get(trackId);
    if (player) {
      player.dispose();
      this.players.delete(trackId);
    }

    const trackEffects = this.effects.get(trackId);
    if (trackEffects) {
      trackEffects.forEach(effect => effect.dispose());
      this.effects.delete(trackId);
    }
  }

  async play() {
    await this.initialize();
    
    console.log('AudioEngine.play() called with', this.players.size, 'players');
    
    if (this.players.size === 0) {
      console.warn('No players loaded');
      return;
    }
    
    // Stop transport first to reset
    Tone.Transport.stop();
    Tone.Transport.position = 0;
    
    // Start transport
    Tone.Transport.start();
    console.log('Transport started');
    
    // Start all loaded players
    let playingCount = 0;
    this.players.forEach((player, trackId) => {
      if (player.loaded) {
        console.log(`Starting player for track ${trackId}`);
        player.start(0);
        playingCount++;
      } else {
        console.warn(`Player for track ${trackId} not loaded yet`);
      }
    });
    
    console.log(`Started ${playingCount} players`);
  }

  pause() {
    Tone.Transport.pause();
  }

  stop() {
    Tone.Transport.stop();
    this.players.forEach(player => player.stop());
  }

  setTrackVolume(trackId: string, volume: number) {
    const player = this.players.get(trackId);
    if (player) {
      player.volume.value = this.volumeToDb(volume);
    }
  }

  setMasterVolume(volume: number) {
    this.masterVolume.volume.value = this.volumeToDb(volume);
  }

  muteTrack(trackId: string, muted: boolean) {
    const player = this.players.get(trackId);
    if (player) {
      player.mute = muted;
    }
  }

  soloTrack(trackId: string, solo: boolean) {
    if (solo) {
      // Mute all other tracks
      this.players.forEach((player, id) => {
        player.mute = id !== trackId;
      });
    } else {
      // Unmute all tracks
      this.players.forEach(player => {
        player.mute = false;
      });
    }
  }

  addEffect(trackId: string, effect: Effect) {
    const player = this.players.get(trackId);
    if (!player) return;

    let toneEffect: Tone.ToneAudioNode;

    switch (effect.type) {
      case 'reverb':
        toneEffect = new Tone.Reverb({
          decay: effect.params.decay || 2.0,
          wet: effect.params.wet || 0.3,
        });
        break;

      case 'eq':
        toneEffect = new Tone.EQ3({
          low: effect.params.low || 0,
          mid: effect.params.mid || 0,
          high: effect.params.high || 0,
        });
        break;

      case 'compression':
        toneEffect = new Tone.Compressor({
          threshold: effect.params.threshold || -24,
          ratio: effect.params.ratio || 3,
          attack: effect.params.attack || 0.003,
          release: effect.params.release || 0.1,
        });
        break;

      case 'delay':
        toneEffect = new Tone.FeedbackDelay({
          delayTime: effect.params.delayTime || 0.25,
          feedback: effect.params.feedback || 0.3,
          wet: effect.params.wet || 0.2,
        });
        break;

      case 'distortion':
        toneEffect = new Tone.Distortion({
          distortion: effect.params.distortion || 0.4,
          wet: effect.params.wet || 0.5,
        });
        break;

      default:
        return;
    }

    // Disconnect player from current chain
    player.disconnect();
    
    // Get existing effects for this track
    const trackEffects = this.effects.get(trackId) || [];
    
    // Connect in chain: player -> effects -> master
    if (trackEffects.length === 0) {
      player.connect(toneEffect);
      toneEffect.connect(this.masterVolume);
    } else {
      // Insert at end of chain
      const lastEffect = trackEffects[trackEffects.length - 1];
      lastEffect.disconnect();
      lastEffect.connect(toneEffect);
      toneEffect.connect(this.masterVolume);
    }

    trackEffects.push(toneEffect);
    this.effects.set(trackId, trackEffects);
  }

  removeEffect(trackId: string, effectId: string) {
    const trackEffects = this.effects.get(trackId);
    if (!trackEffects) return;

    // For now, remove the last effect (simplified)
    const lastEffect = trackEffects.pop();
    if (lastEffect) {
      lastEffect.dispose();
    }

    // Reconnect chain
    const player = this.players.get(trackId);
    if (player) {
      player.disconnect();
      
      if (trackEffects.length === 0) {
        player.connect(this.masterVolume);
      } else {
        // Reconnect through remaining effects
        let current: Tone.ToneAudioNode = player;
        trackEffects.forEach(effect => {
          current.connect(effect);
          current = effect;
        });
        current.connect(this.masterVolume);
      }
    }
  }

  async exportMix(tracks: Track[]): Promise<Blob> {
    // Render offline
    const duration = Math.max(...tracks.map(t => t.duration));
    
    const rendered = await Tone.Offline(({ transport }) => {
      tracks.forEach(track => {
        const player = this.players.get(track.id);
        if (player && !track.muted) {
          player.start(0);
        }
      });
      transport.start();
    }, duration);

    // Convert ToneAudioBuffer to regular AudioBuffer
    const audioBuffer = rendered.get() as AudioBuffer;
    
    // Convert to WAV
    return this.audioBufferToWav(audioBuffer);
  }

  private volumeToDb(volume: number): number {
    return volume === 0 ? -Infinity : 20 * Math.log10(volume);
  }

  private audioBufferToWav(buffer: AudioBuffer): Blob {
    const length = buffer.length;
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
    const view = new DataView(arrayBuffer);

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * numberOfChannels * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * numberOfChannels * 2, true);

    // Convert float samples to 16-bit PCM
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
        view.setInt16(offset, sample * 0x7FFF, true);
        offset += 2;
      }
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }

  dispose() {
    this.players.forEach(player => player.dispose());
    this.effects.forEach(effects => effects.forEach(effect => effect.dispose()));
    this.masterVolume.dispose();
    this.players.clear();
    this.effects.clear();
  }
}

export const audioEngine = new AudioEngine();