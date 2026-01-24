# AudioLab Functionality Design Document

## Overview

AudioLab is a comprehensive audio production and practice platform built with Web Audio API for audio processing, Firebase Firestore for data persistence, Firebase Realtime Database for live collaboration, and Cloudinary for audio file storage. The system provides choir members with tools to practice songs with multiple vocal parts, record multi-track sessions, and collaborate in real-time.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        AudioLab Client                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   Views     │  │   Context   │  │     Audio Engine        │ │
│  │ - Library   │  │ AudioLab    │  │ - Web Audio API         │ │
│  │ - Practice  │  │ Context     │  │ - MediaRecorder         │ │
│  │ - Studio    │  │             │  │ - Audio Worklet         │ │
│  │ - Karaoke   │  │             │  │ - Pitch Detection       │ │
│  │ - Collab    │  │             │  │                         │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                        Services Layer                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │ Song        │  │ Project     │  │ Session                 │ │
│  │ Service     │  │ Service     │  │ Service                 │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                        External Services                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │ Firebase    │  │ Firebase    │  │ Cloudinary              │ │
│  │ Firestore   │  │ Realtime DB │  │ (Audio Storage)         │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Audio Engine (`_lib/audio-engine.ts`)

```typescript
interface AudioEngine {
  // Core audio context
  context: AudioContext;
  masterGain: GainNode;
  
  // Playback
  loadAudio(url: string): Promise<AudioBuffer>;
  play(): void;
  pause(): void;
  seek(time: number): void;
  setVolume(volume: number): void;
  
  // Multi-part support
  loadSongParts(urls: AudioUrls): Promise<void>;
  switchPart(part: VocalPart): void;
  
  // Recording
  startRecording(): Promise<void>;
  stopRecording(): Promise<Blob>;
  getInputLevel(): number;
  
  // Pitch detection
  startPitchDetection(): void;
  stopPitchDetection(): void;
  onPitchDetected: (pitch: number, confidence: number) => void;
}

type VocalPart = 'full' | 'soprano' | 'alto' | 'tenor' | 'bass';

interface AudioUrls {
  full?: string;
  soprano?: string;
  alto?: string;
  tenor?: string;
  bass?: string;
}
```

### Song Service (`_lib/song-service.ts`)

```typescript
interface SongService {
  // Fetch songs
  getSongs(zoneId: string): Promise<AudioLabSong[]>;
  getSongById(songId: string): Promise<AudioLabSong | null>;
  searchSongs(query: string, zoneId: string): Promise<AudioLabSong[]>;
  getSongsByVocalPart(part: VocalPart, zoneId: string): Promise<AudioLabSong[]>;
  
  // Admin operations (HQ only)
  createSong(song: CreateSongInput): Promise<string>;
  updateSong(songId: string, updates: Partial<AudioLabSong>): Promise<void>;
  deleteSong(songId: string): Promise<void>;
  uploadAudioPart(songId: string, part: VocalPart, file: File): Promise<string>;
}
```

### Project Service (`_lib/project-service.ts`)

```typescript
interface ProjectService {
  // CRUD
  createProject(project: CreateProjectInput): Promise<string>;
  getProject(projectId: string): Promise<AudioLabProject | null>;
  getUserProjects(userId: string): Promise<AudioLabProject[]>;
  updateProject(projectId: string, updates: Partial<AudioLabProject>): Promise<void>;
  deleteProject(projectId: string): Promise<void>;
  
  // Track operations
  addTrack(projectId: string, track: CreateTrackInput): Promise<string>;
  updateTrack(projectId: string, trackId: string, updates: Partial<Track>): Promise<void>;
  deleteTrack(projectId: string, trackId: string): Promise<void>;
  
  // Audio file operations
  uploadTrackAudio(projectId: string, trackId: string, blob: Blob): Promise<string>;
  deleteTrackAudio(projectId: string, trackId: string): Promise<void>;
}
```

### Session Service (`_lib/session-service.ts`)

```typescript
interface SessionService {
  // Session management
  createSession(hostId: string, projectId?: string): Promise<LiveSession>;
  joinSession(code: string, userId: string): Promise<LiveSession>;
  leaveSession(sessionId: string, userId: string): Promise<void>;
  endSession(sessionId: string): Promise<void>;
  
  // Real-time sync
  subscribeToSession(sessionId: string, callbacks: SessionCallbacks): () => void;
  updatePlaybackState(sessionId: string, state: PlaybackState): Promise<void>;
  
  // Chat
  sendMessage(sessionId: string, message: ChatMessage): Promise<void>;
  subscribeToMessages(sessionId: string, callback: (messages: ChatMessage[]) => void): () => void;
}

interface SessionCallbacks {
  onParticipantJoined: (participant: Participant) => void;
  onParticipantLeft: (participantId: string) => void;
  onPlaybackStateChanged: (state: PlaybackState) => void;
  onSessionEnded: () => void;
}
```

### Practice Service (`_lib/practice-service.ts`)

```typescript
interface PracticeService {
  // Session tracking
  startSession(userId: string, songId: string, mode: PracticeMode): Promise<string>;
  endSession(sessionId: string, stats: SessionStats): Promise<void>;
  
  // Progress
  getUserProgress(userId: string): Promise<PracticeProgress>;
  getWeeklyStats(userId: string): Promise<WeeklyStats>;
  updateStreak(userId: string): Promise<number>;
}
```

## Data Models

### AudioLab Song (Firebase: `audiolab_songs`)

```typescript
interface AudioLabSong {
  id: string;
  title: string;
  artist: string;
  duration: number; // seconds
  
  // Multi-part audio URLs (Cloudinary)
  audioUrls: {
    full?: string;      // Full mix
    soprano?: string;   // Soprano part
    alto?: string;      // Alto part
    tenor?: string;     // Tenor part
    bass?: string;      // Bass part
  };
  
  // Available parts (for filtering)
  availableParts: VocalPart[];
  
  // Metadata
  genre?: string;
  key?: string;
  tempo?: number;
  albumArt?: string;
  lyricsUrl?: string;
  
  // Lyrics data for karaoke
  lyrics?: LyricLine[];
  
  // Access control
  zoneId?: string;      // null = available to all zones (HQ songs)
  isHQSong: boolean;    // true = distributed from HQ
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;    // userId
}

interface LyricLine {
  time: number;         // Start time in seconds
  text: string;
  duration?: number;    // Duration of line
  pitch?: number;       // Target pitch for scoring
}
```

### AudioLab Project (Firebase: `audiolab_projects`)

```typescript
interface AudioLabProject {
  id: string;
  name: string;
  
  // Project settings
  tempo: number;        // BPM
  timeSignature: string; // e.g., "4/4"
  duration: number;     // Total duration in seconds
  
  // Tracks
  tracks: Track[];
  
  // Reference song (if practicing along)
  referenceSongId?: string;
  
  // Ownership
  ownerId: string;
  collaborators: string[];
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface Track {
  id: string;
  name: string;
  type: 'vocal' | 'harmony' | 'guide' | 'instrument';
  color: string;
  
  // Audio
  audioUrl?: string;    // Cloudinary URL
  waveform?: number[];  // Pre-computed waveform data
  
  // Mix controls
  volume: number;       // 0-100
  pan: number;          // -100 to 100
  muted: boolean;
  solo: boolean;
  
  // Recording metadata
  recordedAt?: Timestamp;
  duration?: number;
}
```

### Live Session (Firebase Realtime DB: `sessions/{sessionId}`)

```typescript
interface LiveSession {
  id: string;
  code: string;         // 6-digit join code
  
  // Host info
  hostId: string;
  hostName: string;
  
  // Session details
  projectId?: string;
  songId?: string;
  title: string;
  
  // Participants
  participants: {
    [userId: string]: Participant;
  };
  
  // Playback state (synced)
  playback: PlaybackState;
  
  // Status
  status: 'active' | 'ended';
  startedAt: number;    // timestamp
  endedAt?: number;
}

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  role: 'host' | 'participant';
  isOnline: boolean;
  isMuted: boolean;
  joinedAt: number;
}

interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  updatedAt: number;
  updatedBy: string;
}
```

### Chat Message (Firebase Realtime DB: `sessions/{sessionId}/messages`)

```typescript
interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  
  type: 'text' | 'voice' | 'system';
  content?: string;     // Text content
  voiceUrl?: string;    // Cloudinary URL for voice notes
  voiceDuration?: number;
  
  timestamp: number;
  status: 'sent' | 'delivered' | 'read';
}
```

### Practice Progress (Firebase: `audiolab_progress/{userId}`)

```typescript
interface PracticeProgress {
  userId: string;
  
  // Streak tracking
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string; // YYYY-MM-DD
  
  // Weekly stats
  weeklyTarget: number;     // minutes
  weeklyProgress: number;   // minutes practiced this week
  
  // Lifetime stats
  totalSessions: number;
  totalMinutes: number;
  averageScore: number;
  averageAccuracy: number;
  
  // XP/Gamification
  xp: number;
  level: number;
  
  updatedAt: Timestamp;
}

interface PracticeSession {
  id: string;
  userId: string;
  songId: string;
  mode: PracticeMode;
  
  // Performance
  score: number;
  accuracy: number;
  streak: number;
  
  // Duration
  startedAt: Timestamp;
  endedAt: Timestamp;
  duration: number;     // seconds
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Audio playback position consistency
*For any* song and any seek operation, the reported playback position SHALL match the actual audio context currentTime within 100ms tolerance.
**Validates: Requirements 1.4**

### Property 2: Volume control range
*For any* volume adjustment, the resulting gain value SHALL be clamped between 0 and 1, and the audio output level SHALL change proportionally.
**Validates: Requirements 1.5**

### Property 3: Part switching position preservation
*For any* vocal part switch during playback, the new part SHALL resume from the same position (±50ms) as the previous part.
**Validates: Requirements 2.1.3**

### Property 4: Search result relevance
*For any* search query, all returned songs SHALL contain the query string in their title, artist, or genre fields (case-insensitive).
**Validates: Requirements 2.3**

### Property 5: Recording data integrity
*For any* recording session, the saved audio blob SHALL have duration within 100ms of the actual recording time.
**Validates: Requirements 4.5**

### Property 6: Track mix isolation
*For any* track with mute enabled, that track's audio SHALL not contribute to the master output.
**Validates: Requirements 4.7**

### Property 7: Solo mode exclusivity
*For any* project with one or more soloed tracks, only soloed tracks SHALL contribute to the master output.
**Validates: Requirements 4.8**

### Property 8: Session code uniqueness
*For any* newly created session, the generated 6-digit code SHALL be unique among all active sessions.
**Validates: Requirements 6.1**

### Property 9: Playback sync accuracy
*For any* live session with multiple participants, playback positions SHALL be synchronized within 500ms across all connected clients.
**Validates: Requirements 6.3**

### Property 10: Message ordering
*For any* chat session, messages SHALL be displayed in chronological order based on their server timestamp.
**Validates: Requirements 7.3**

### Property 11: Streak continuity
*For any* user, the streak counter SHALL increment only if the previous practice was within 24 hours, otherwise it SHALL reset to 1.
**Validates: Requirements 8.1**

### Property 12: Audio URL structure
*For any* uploaded audio file, the Cloudinary URL SHALL follow the pattern `audiolab/{type}/{id}/{filename}`.
**Validates: Requirements 9.2**

## Error Handling

### Audio Errors
- **AudioContext not supported**: Display browser compatibility message, suggest Chrome/Firefox
- **Microphone permission denied**: Show permission request UI with instructions
- **Audio file load failure**: Retry 3 times with exponential backoff, then show error with retry button
- **Recording failure**: Save partial recording if possible, notify user

### Network Errors
- **Firebase connection lost**: Queue operations locally, sync when reconnected
- **Cloudinary upload failure**: Retry with smaller chunks, compress if needed
- **Session disconnection**: Attempt reconnection for 30 seconds, then show reconnect UI

### Data Errors
- **Invalid song data**: Skip malformed entries, log for admin review
- **Project corruption**: Attempt recovery from last valid state, offer manual restore

## Testing Strategy

### Unit Testing (Vitest)
- Audio engine methods (load, play, pause, seek, volume)
- Service layer CRUD operations
- Data transformation utilities
- Pitch detection algorithm accuracy

### Property-Based Testing (fast-check)
- Volume clamping across random inputs
- Search filtering correctness
- Session code generation uniqueness
- Timestamp ordering in messages

### Integration Testing
- Firebase read/write operations
- Cloudinary upload/download
- Real-time sync between clients
- Audio recording and playback cycle

### E2E Testing (Playwright)
- Complete user flows (browse → play → practice)
- Recording and saving projects
- Joining and participating in live sessions
- Offline mode functionality
