/**
 * AUDIOLAB ACCOMPANIMENT ENGINE
 * AI-powered accompaniment generation using Tone.js
 * Analyzes recorded vocals and generates matching piano/guitar accompaniment
 */

import * as Tone from 'tone';

export type MusicalKey = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';
export type KeyMode = 'major' | 'minor';

export interface DetectedKey {
  key: MusicalKey;
  mode: KeyMode;
  confidence: number;
}

export interface DetectedMelody {
  pitches: number[];        // Detected pitch frequencies over time
  notes: string[];          // Converted to note names (e.g., "C4", "E4")
  rhythm: number[];         // Duration of each note in beats
  suggestedChords: string[]; // Chord suggestions based on melody
}

export interface AccompanimentTrack {
  id: string;
  type: 'piano' | 'guitar';
  key: MusicalKey;
  mode: KeyMode;
  tempo: number;
  pattern: string;
  isPlaying: boolean;
  volume: number;
}

const NOTES: MusicalKey[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11];
const MINOR_SCALE = [0, 2, 3, 5, 7, 8, 10];

// Worship-style chord progressions
const PROGRESSIONS = {
  major: {
    simple: ['I', 'IV', 'V', 'I'],
    pop: ['I', 'V', 'vi', 'IV'],
    worship: ['I', 'V', 'vi', 'IV', 'I', 'V', 'IV', 'I'],
    ballad: ['I', 'iii', 'IV', 'V', 'vi', 'IV', 'V', 'I']
  },
  minor: {
    simple: ['i', 'iv', 'V', 'i'],
    pop: ['i', 'VI', 'III', 'VII'],
    worship: ['i', 'VI', 'III', 'VII', 'i', 'iv', 'V', 'i']
  }
};

const CHORD_VOICINGS = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  major7: [0, 4, 7, 11],
  minor7: [0, 3, 7, 10],
  sus4: [0, 5, 7],
  add9: [0, 4, 7, 14]
};

// Note to chord mapping - which chords work well with which melody notes
const NOTE_TO_CHORD_MAP: Record<number, number[]> = {
  0: [0, 5, 3],    // C -> C, F, Am
  2: [5, 4, 1],    // D -> F, G, Dm  
  4: [0, 5, 2],    // E -> C, F, Em
  5: [5, 1, 3],    // F -> F, Dm, Am
  7: [4, 0, 2],    // G -> G, C, Em
  9: [5, 1, 3],    // A -> F, Dm, Am
  11: [4, 0, 2]    // B -> G, C, Em
};

class AccompanimentEngine {
  private isInitialized = false;
  private pianoSynth: Tone.PolySynth | null = null;
  private guitarSynth: Tone.PolySynth | null = null;
  private bassSynth: Tone.MonoSynth | null = null;
  private currentSequence: Tone.Sequence | null = null;
  private currentKey: DetectedKey | null = null;
  private detectedMelody: DetectedMelody | null = null;
  private tempo = 80; // Slower for worship style
  
  public onKeyDetected: ((key: DetectedKey) => void) | null = null;
  public onMelodyDetected: ((melody: DetectedMelody) => void) | null = null;

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;
    try {
      await Tone.start();
      
      // Piano with warm worship sound and more natural feel
      this.pianoSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { 
          attack: 0.05, 
          decay: 0.4, 
          sustain: 0.5, 
          release: 1.5,
          // Add more natural envelope for human feel
          attackCurve: 'exponential',
          releaseCurve: 'exponential'
        }
      }).toDestination();
      this.pianoSynth.volume.value = -8;
      
      // Guitar with more natural string-like sound
      this.guitarSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { 
          type: 'sawtooth'
        },
        envelope: { 
          attack: 0.02, 
          decay: 0.3, 
          sustain: 0.3, 
          release: 1.0,
          attackCurve: 'linear',
          releaseCurve: 'linear'
        }
      }).toDestination();
      this.guitarSynth.volume.value = -10;
      
      // Bass with more natural attack
      this.bassSynth = new Tone.MonoSynth({
        oscillator: { 
          type: 'sine'
        },
        envelope: { 
          attack: 0.1, 
          decay: 0.3, 
          sustain: 0.6, 
          release: 1.0 
        },
        filterEnvelope: { 
          attack: 0.1, 
          decay: 0.2, 
          sustain: 0.5, 
          release: 0.8, 
          baseFrequency: 200, 
          octaves: 2 
        }
      }).toDestination();
      this.bassSynth.volume.value = -12;
      
      // Add reverb for worship atmosphere
      const reverb = new Tone.Reverb({ decay: 3, wet: 0.4 }).toDestination();
      this.pianoSynth.connect(reverb);
      this.guitarSynth.connect(reverb);
      
      this.isInitialized = true;
      console.log('[AccompanimentEngine] Initialized successfully');
      return true;
    } catch (error) {
      console.error('[AccompanimentEngine] Init failed:', error);
      return false;
    }
  }

  /**
   * Analyze recorded audio to detect key and extract melody
   */
  async detectKeyFromAudio(audioBuffer: AudioBuffer): Promise<DetectedKey> {
    console.log('[AccompanimentEngine] Analyzing audio for key detection...');
    const channelData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    
    // Extract pitches with timing information
    const pitchData = this.extractPitchesWithTiming(channelData, sampleRate);
    
    // Analyze key from pitch distribution
    const key = this.analyzePitchDistribution(pitchData.pitches);
    this.currentKey = key;
    
    // Extract melody and suggest chords
    const melody = this.extractMelody(pitchData, key);
    this.detectedMelody = melody;
    
    console.log('[AccompanimentEngine] Detected key:', key.key, key.mode, 'confidence:', key.confidence);
    console.log('[AccompanimentEngine] Suggested chords:', melody.suggestedChords);
    
    this.onKeyDetected?.(key);
    this.onMelodyDetected?.(melody);
    
    return key;
  }

  detectKeyFromPitches(pitches: number[]): DetectedKey {
    const validPitches = pitches.filter(p => p > 50 && p < 2000);
    const key = this.analyzePitchDistribution(validPitches);
    this.currentKey = key;
    this.onKeyDetected?.(key);
    return key;
  }

  /**
   * Extract pitches with timing for melody analysis
   */
  private extractPitchesWithTiming(channelData: Float32Array, sampleRate: number): { pitches: number[], times: number[], durations: number[] } {
    const pitches: number[] = [];
    const times: number[] = [];
    const durations: number[] = [];
    
    const windowSize = 2048;
    const hopSize = 512; // Smaller hop for better time resolution
    
    let lastPitch = -1;
    let noteStartTime = 0;
    
    for (let i = 0; i < channelData.length - windowSize; i += hopSize) {
      const window = channelData.slice(i, i + windowSize);
      const pitch = this.detectPitch(window, sampleRate);
      const currentTime = i / sampleRate;
      
      if (pitch > 0) {
        // Check if this is a new note (pitch changed significantly)
        if (lastPitch < 0 || Math.abs(pitch - lastPitch) > lastPitch * 0.05) {
          // Save previous note duration
          if (lastPitch > 0 && pitches.length > 0) {
            durations[durations.length - 1] = currentTime - noteStartTime;
          }
          
          pitches.push(pitch);
          times.push(currentTime);
          durations.push(0);
          noteStartTime = currentTime;
        }
        lastPitch = pitch;
      } else if (lastPitch > 0) {
        // Note ended
        if (durations.length > 0) {
          durations[durations.length - 1] = currentTime - noteStartTime;
        }
        lastPitch = -1;
      }
    }
    
    return { pitches, times, durations };
  }

  private detectPitch(buffer: Float32Array, sampleRate: number): number {
    // Check if there's enough signal
    let rms = 0;
    for (let i = 0; i < buffer.length; i++) rms += buffer[i] * buffer[i];
    if (Math.sqrt(rms / buffer.length) < 0.01) return -1;
    
    // Autocorrelation for pitch detection
    const correlations = new Float32Array(buffer.length);
    for (let lag = 0; lag < buffer.length; lag++) {
      let sum = 0;
      for (let i = 0; i < buffer.length - lag; i++) sum += buffer[i] * buffer[i + lag];
      correlations[lag] = sum;
    }
    
    // Find first dip then highest peak
    let d = 0;
    while (correlations[d] > correlations[d + 1] && d < correlations.length - 1) d++;
    
    let maxPos = d;
    for (let i = d; i < Math.min(correlations.length, sampleRate / 50); i++) { // Limit to reasonable vocal range
      if (correlations[i] > correlations[maxPos]) maxPos = i;
    }
    
    // Validate pitch is in vocal range (80Hz - 1000Hz)
    const pitch = maxPos > 0 ? sampleRate / maxPos : -1;
    return (pitch >= 80 && pitch <= 1000) ? pitch : -1;
  }

  /**
   * Extract melody structure and suggest accompanying chords
   */
  private extractMelody(pitchData: { pitches: number[], times: number[], durations: number[] }, key: DetectedKey): DetectedMelody {
    const { pitches, durations } = pitchData;
    
    // Convert pitches to note names
    const notes = pitches.map(p => this.frequencyToNote(p));
    
    // Convert durations to beats (assuming detected tempo)
    const beatDuration = 60 / this.tempo;
    const rhythm = durations.map(d => Math.round((d / beatDuration) * 2) / 2); // Quantize to half beats
    
    // Analyze melody to suggest chords
    const suggestedChords = this.suggestChordsFromMelody(pitches, key);
    
    return { pitches, notes, rhythm, suggestedChords };
  }

  private frequencyToNote(freq: number): string {
    const noteNum = Math.round(12 * Math.log2(freq / 440)) + 69;
    const octave = Math.floor(noteNum / 12) - 1;
    const noteIndex = ((noteNum % 12) + 12) % 12;
    return `${NOTES[noteIndex]}${octave}`;
  }

  /**
   * Suggest chords based on melody notes
   */
  private suggestChordsFromMelody(pitches: number[], key: DetectedKey): string[] {
    if (pitches.length === 0) return this.generateProgression(key.key, key.mode, 'worship');
    
    const rootIndex = NOTES.indexOf(key.key);
    const scale = key.mode === 'major' ? MAJOR_SCALE : MINOR_SCALE;
    
    // Group pitches into segments (roughly 2 beats each at current tempo)
    const segmentSize = Math.ceil(pitches.length / 8);
    const chords: string[] = [];
    
    for (let i = 0; i < 8; i++) {
      const segmentStart = i * segmentSize;
      const segmentEnd = Math.min((i + 1) * segmentSize, pitches.length);
      const segmentPitches = pitches.slice(segmentStart, segmentEnd);
      
      if (segmentPitches.length === 0) {
        // Use progression chord if no pitches
        const progChords = this.generateProgression(key.key, key.mode, 'worship');
        chords.push(progChords[i % progChords.length]);
        continue;
      }
      
      // Find dominant note in segment
      const noteHistogram = new Array(12).fill(0);
      for (const pitch of segmentPitches) {
        const noteNum = Math.round(12 * Math.log2(pitch / 440)) + 69;
        noteHistogram[((noteNum % 12) + 12) % 12]++;
      }
      
      const dominantNote = noteHistogram.indexOf(Math.max(...noteHistogram));
      
      // Find best chord for this note in the key
      const chord = this.findChordForNote(dominantNote, rootIndex, scale, key.mode);
      chords.push(chord);
    }
    
    return chords;
  }

  private findChordForNote(noteIndex: number, rootIndex: number, scale: number[], mode: KeyMode): string {
    // Find which scale degree this note is
    const relativeNote = ((noteIndex - rootIndex) % 12 + 12) % 12;
    const scaleDegree = scale.indexOf(relativeNote);
    
    if (scaleDegree === -1) {
      // Note not in scale, use closest scale tone
      const closest = scale.reduce((prev, curr) => 
        Math.abs(curr - relativeNote) < Math.abs(prev - relativeNote) ? curr : prev
      );
      const closestDegree = scale.indexOf(closest);
      return this.getChordForDegree(closestDegree, rootIndex, scale, mode);
    }
    
    return this.getChordForDegree(scaleDegree, rootIndex, scale, mode);
  }

  private getChordForDegree(degree: number, rootIndex: number, scale: number[], mode: KeyMode): string {
    const chordRoot = NOTES[(rootIndex + scale[degree]) % 12];
    
    // Determine chord quality based on scale degree
    const majorDegrees = [0, 3, 4]; // I, IV, V are major in major key
    const minorDegrees = [1, 2, 5]; // ii, iii, vi are minor in major key
    
    if (mode === 'major') {
      if (majorDegrees.includes(degree)) return chordRoot;
      if (minorDegrees.includes(degree)) return `${chordRoot}m`;
      return `${chordRoot}dim`; // vii is diminished
    } else {
      // Minor key
      if ([0, 3].includes(degree)) return `${chordRoot}m`; // i, iv are minor
      if ([2, 5, 6].includes(degree)) return chordRoot; // III, VI, VII are major
      if (degree === 4) return chordRoot; // V is often major in minor
      return `${chordRoot}m`;
    }
  }

  private analyzePitchDistribution(pitches: number[]): DetectedKey {
    const histogram = new Array(12).fill(0);
    for (const pitch of pitches) {
      const noteNum = Math.round(12 * Math.log2(pitch / 440)) + 69;
      histogram[((noteNum % 12) + 12) % 12]++;
    }
    const total = histogram.reduce((a, b) => a + b, 0);
    if (total === 0) return { key: 'C', mode: 'major', confidence: 0 };
    
    const normalized = histogram.map(v => v / total);
    let bestKey: MusicalKey = 'C', bestMode: KeyMode = 'major', bestScore = -Infinity;
    
    for (let root = 0; root < 12; root++) {
      const majorScore = MAJOR_SCALE.reduce((s, i) => s + normalized[(root + i) % 12], 0);
      const minorScore = MINOR_SCALE.reduce((s, i) => s + normalized[(root + i) % 12], 0);
      if (majorScore > bestScore) { bestScore = majorScore; bestKey = NOTES[root]; bestMode = 'major'; }
      if (minorScore > bestScore) { bestScore = minorScore; bestKey = NOTES[root]; bestMode = 'minor'; }
    }
    return { key: bestKey, mode: bestMode, confidence: Math.min(1, (bestScore + 1) / 2) };
  }


  private getChordNotes(chord: string, octave = 4, voicingType: 'triad' | 'seventh' | 'inversion' | 'spread' = 'triad'): string[] {
    const isMinor = chord.includes('m');
    const root = chord.replace('m', '');
    const rootIndex = NOTES.indexOf(root as MusicalKey);
    if (rootIndex === -1) return [];
    
    let voicing: number[];
    switch(voicingType) {
      case 'seventh':
        voicing = isMinor ? CHORD_VOICINGS.minor7 : CHORD_VOICINGS.major7;
        break;
      case 'inversion':
        // Use first inversion (3-5-1 instead of 1-3-5)
        voicing = isMinor ? [3, 7, 12] : [4, 7, 12];
        break;
      case 'spread':
        // Spread voicing (1-5-8-10 instead of tight voicing)
        voicing = isMinor ? [0, 7, 12, 15] : [0, 7, 12, 16];
        break;
      default:
        voicing = isMinor ? CHORD_VOICINGS.minor : CHORD_VOICINGS.major;
    }
    
    return voicing.map(interval => {
      const noteIndex = (rootIndex + interval) % 12;
      const noteOctave = octave + Math.floor((rootIndex + interval) / 12);
      return `${NOTES[noteIndex]}${noteOctave}`;
    });
  }

  private generateProgression(key: MusicalKey, mode: KeyMode, style: string) {
    const progs = mode === 'major' ? PROGRESSIONS.major : PROGRESSIONS.minor;
    const template = (progs as Record<string, string[]>)[style] || progs.simple;
    const rootIndex = NOTES.indexOf(key);
    const scale = mode === 'major' ? MAJOR_SCALE : MINOR_SCALE;
    
    return template.map(numeral => {
      const isMinor = numeral === numeral.toLowerCase();
      const clean = numeral.toUpperCase();
      const degreeMap: Record<string, number> = { I: 0, II: 1, III: 2, IV: 3, V: 4, VI: 5, VII: 6 };
      const degree = degreeMap[clean] || 0;
      const chordRoot = NOTES[(rootIndex + scale[degree]) % 12];
      return `${chordRoot}${isMinor ? 'm' : ''}`;
    });
  }

  /**
   * Generate piano accompaniment based on detected melody
   */
  async generatePianoAccompaniment(key?: MusicalKey, mode?: KeyMode, style = 'worship'): Promise<AccompanimentTrack> {
    await this.initialize();
    const useKey = key || this.currentKey?.key || 'C';
    const useMode = mode || this.currentKey?.mode || 'major';
    
    // Use melody-based chords if available, otherwise use progression
    const chords = this.detectedMelody?.suggestedChords || this.generateProgression(useKey, useMode, style);
    
    console.log('[AccompanimentEngine] Generating piano with chords:', chords);
    
    this.stopAccompaniment();
    Tone.Transport.bpm.value = this.tempo;
    
    let idx = 0;
    this.currentSequence = new Tone.Sequence((time) => {
      const chord = chords[idx % chords.length];
      
      // Create more human-like variations
      const bassNote = this.getChordNotes(chord, 2)[0]; // Bass note one octave lower
      
      // Humanize timing slightly
      const humanizeTime = time + (Math.random() * 0.01 - 0.005);
      
      // Different playing patterns for more human feel
      const pattern = idx % 4; // Cycle through patterns every 4 beats
      
      if (pattern === 0) {
        // Simple chord
        const notes = this.getChordNotes(chord, 3);
        notes.forEach((note, i) => {
          this.pianoSynth?.triggerAttackRelease(note, '2n', humanizeTime + i * 0.02);
        });
      } else if (pattern === 1) {
        // Arpeggiated up
        const notes = this.getChordNotes(chord, 3);
        notes.forEach((note, i) => {
          this.pianoSynth?.triggerAttackRelease(note, '4n', humanizeTime + i * 0.03);
        });
      } else if (pattern === 2) {
        // Arpeggiated down
        const notes = this.getChordNotes(chord, 3);
        notes.slice().reverse().forEach((note, i) => {
          this.pianoSynth?.triggerAttackRelease(note, '4n', humanizeTime + i * 0.03);
        });
      } else {
        // Broken chord with melody
        const chordNotes = this.getChordNotes(chord, 3);
        const melodyNote = this.getChordNotes(chord, 4)[0]; // Higher octave
        
        // Play chord notes
        chordNotes.forEach((note, i) => {
          this.pianoSynth?.triggerAttackRelease(note, '4n', humanizeTime + i * 0.01);
        });
        
        // Add a simple melody note
        if (melodyNote) {
          this.pianoSynth?.triggerAttackRelease(melodyNote, '4n', humanizeTime + 0.05);
        }
      }
      
      // Add bass note with some variation
      if (this.bassSynth && bassNote) {
        // Add slight velocity variation
        const velocity = 0.6 + Math.random() * 0.2; // Between 0.6 and 0.8
        this.bassSynth.triggerAttackRelease(bassNote, '2n', humanizeTime, velocity);
      }
      
      idx++;
    }, Array.from({ length: chords.length }, (_, i) => i), '2n');
    
    return { 
      id: `piano-${Date.now()}`, 
      type: 'piano', 
      key: useKey, 
      mode: useMode, 
      tempo: this.tempo, 
      pattern: `${style} (${chords.slice(0, 4).join('-')})`, 
      isPlaying: false, 
      volume: 70 
    };
  }

  /**
   * Generate guitar accompaniment based on detected melody
   */
  async generateGuitarAccompaniment(key?: MusicalKey, mode?: KeyMode, style = 'fingerpicking'): Promise<AccompanimentTrack> {
    await this.initialize();
    const useKey = key || this.currentKey?.key || 'C';
    const useMode = mode || this.currentKey?.mode || 'major';
    
    // Use melody-based chords if available
    const chords = this.detectedMelody?.suggestedChords || this.generateProgression(useKey, useMode, 'simple');
    
    console.log('[AccompanimentEngine] Generating guitar with chords:', chords);
    
    this.stopAccompaniment();
    Tone.Transport.bpm.value = this.tempo;
    
    let chordIdx = 0;
    let beat = 0;
    
    this.currentSequence = new Tone.Sequence((time) => {
      const chord = chords[chordIdx % chords.length];
      
      // Humanize timing
      const humanizeTime = time + (Math.random() * 0.01 - 0.005);
      
      if (style === 'strumming') {
        // Strum pattern with more variation
        const strumPattern = [true, false, true, true, false, true, true, false];
        const notes = this.getChordNotes(chord, 3);
        if (strumPattern[beat % 8]) {
          // Add velocity variation
          const velocity = 0.7 + Math.random() * 0.2; // Between 0.7 and 0.9
          notes.forEach((n, i) => {
            this.guitarSynth?.triggerAttackRelease(n, '8n', humanizeTime + i * 0.012, velocity);
          });
        }
      } else if (style === 'fingerpicking') {
        // More complex fingerpicking pattern
        const notes = this.getChordNotes(chord, 3, 'spread');
        
        // Bass note on beat 0, then fingerpicked notes
        if (beat % 4 === 0) {
          // Play bass note
          const bassNote = this.getChordNotes(chord, 2)[0];
          if (bassNote) {
            this.guitarSynth?.triggerAttackRelease(bassNote, '4n', humanizeTime, 0.8);
          }
        } else {
          // Play fingerpicked pattern
          const pattern = [0, 2, 1, 3];
          const noteIdx = pattern[(beat - 1) % pattern.length];
          if (notes[noteIdx]) {
            // Humanize timing slightly for each note
            const noteTime = humanizeTime + (Math.random() * 0.01);
            this.guitarSynth?.triggerAttackRelease(notes[noteIdx], '8n', noteTime, 0.6);
          }
        }
      } else if (style === 'arpeggiated') {
        // More melodic arpeggio
        const notes = this.getChordNotes(chord, 3, 'spread');
        const noteIdx = beat % notes.length;
        
        // Play arpeggio with velocity variation
        const velocity = 0.6 + Math.random() * 0.2;
        this.guitarSynth?.triggerAttackRelease(notes[noteIdx], '8n', humanizeTime, velocity);
      }
      
      beat++;
      if (beat >= 8) { 
        beat = 0; 
        chordIdx++; 
      }
    }, Array.from({ length: 32 }, (_, i) => i), '8n');
    
    return { 
      id: `guitar-${Date.now()}`, 
      type: 'guitar', 
      key: useKey, 
      mode: useMode, 
      tempo: this.tempo, 
      pattern: `${style} (${chords.slice(0, 4).join('-')})`, 
      isPlaying: false, 
      volume: 60 
    };
  }

  startAccompaniment() {
    if (this.currentSequence) {
      this.currentSequence.start(0);
      Tone.Transport.start();
    }
  }

  stopAccompaniment() {
    if (this.currentSequence) {
      this.currentSequence.stop();
      this.currentSequence.dispose();
      this.currentSequence = null;
    }
    Tone.Transport.stop();
    Tone.Transport.cancel(); // Clear any scheduled events
  }

  setTempo(bpm: number) { this.tempo = bpm; Tone.Transport.bpm.value = bpm; }
  setPianoVolume(v: number) { if (this.pianoSynth) this.pianoSynth.volume.value = (v / 100) * 40 - 40; }
  setGuitarVolume(v: number) { if (this.guitarSynth) this.guitarSynth.volume.value = (v / 100) * 40 - 40; }
  getCurrentKey() { return this.currentKey; }
  getTempo() { return this.tempo; }
  isReady() { return this.isInitialized; }

  getDetectedMelody(): DetectedMelody | null {
    return this.detectedMelody;
  }

  dispose() {
    this.stopAccompaniment();
    this.pianoSynth?.dispose();
    this.guitarSynth?.dispose();
    this.bassSynth?.dispose();
    this.pianoSynth = null;
    this.guitarSynth = null;
    this.bassSynth = null;
    this.detectedMelody = null;
    this.isInitialized = false;
  }
}

export const accompanimentEngine = new AccompanimentEngine();
export default accompanimentEngine;
